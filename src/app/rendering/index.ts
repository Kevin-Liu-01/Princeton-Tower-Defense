import type {
  Tower,
  Enemy,
  Hero,
  Troop,
  Projectile,
  Effect,
  Particle,
  DraggingTower,
  Position,
} from "../types";
import {
  TILE_SIZE,
  TOWER_DATA,
  ENEMY_DATA,
  HERO_DATA,
  MAP_PATHS,
  TOWER_COLORS,
  TROOP_DATA,
} from "../constants";
import {
  gridToWorld,
  worldToScreen,
  getEnemyPosition,
  distance,
  isValidBuildPosition,
  lightenColor,
  darkenColor,
} from "../utils";

// ============================================================================
// ISOMETRIC BOX HELPER - Complete 4-wall rendering
// ============================================================================
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
  ctx.shadowColor = color;
  ctx.shadowBlur = 10 * zoom * flash;

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

  ctx.shadowBlur = 0;
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
    const starY = screenPos.y - 60 * zoom - tower.level * 8 * zoom;
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
    const badgeY = screenPos.y - 75 * zoom - tower.level * 8 * zoom;
    ctx.fillStyle = tower.upgrade === "A" ? "#ff6b6b" : "#4ecdc4";
    ctx.beginPath();
    ctx.arc(screenPos.x, badgeY, 8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${10 * zoom}px Arial`;
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

  // ========== ROTATING GEARS ==========
  const gearRotation = time * 1.5;

  // Large gear on left side (visible on front face)
  drawGear(
    ctx,
    x - w * 0.6,
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
    x - w * 0.35,
    y - height * zoom * 0.65,
    8 + level,
    5 + level * 0.5,
    6 + level,
    -gearRotation * 1.5,
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
      y - height * zoom * 0.45,
      10 + level,
      7,
      8 + level,
      gearRotation * 0.8,
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
      x - w * 0.8,
      y + 6 * zoom,
      x + w * 0.2,
      y - height * zoom * 0.2,
      4,
      time,
      zoom,
      "#8b4513" // Brass ammo color
    );
  }

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
      x + w * 0.3,
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
    ctx.lineTo(x - w * 0.85, lineY - d * 0.3);
    ctx.stroke();
  }

  // Right face panel lines (diagonal going other direction)
  for (let i = 1; i <= Math.min(level, 3); i++) {
    const lineY = y + 4 * zoom - ((height - 8) * zoom * i) / (level + 1);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.85, lineY - d * 0.3);
    ctx.lineTo(x + w * 0.15, lineY + d * 0.3);
    ctx.stroke();
  }

  // ========== GLOWING VENTS WITH PULSING LIGHT ==========
  const ventGlow = 0.6 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(255, 102, 0, ${ventGlow})`;
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom;

  // Left face vents
  for (let i = 0; i < Math.min(level, 3); i++) {
    const ventY = y - height * zoom * 0.3 - i * 14 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x - w * 0.55,
      ventY + d * 0.2,
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
    const ventY = y - height * zoom * 0.3 - i * 14 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x + w * 0.55,
      ventY + d * 0.2,
      3 * zoom,
      2 * zoom,
      0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.shadowBlur = 0;

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
      x + w * 0.75,
      y + 8 * zoom,
      8,
      6,
      6,
      { main: "#5a4a3a", accent: "#ff6600", label: "#c9a227" },
      zoom,
      time * 2
    );
  }
  if (level >= 3) {
    drawAmmoBox(
      ctx,
      x + w * 0.55,
      y + 10 * zoom,
      7,
      5,
      5,
      { main: "#4a3a2a", accent: "#ffaa00", label: "#c9a227" },
      zoom,
      time * 2 + 1
    );
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
      // Initial recoil - barrel kicks back
      recoilOffset = (firePhase / 0.1) * 8 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 20) * 2 * zoom;
    } else if (firePhase < 0.4) {
      // Return phase with damped oscillation
      const returnPhase = (firePhase - 0.1) / 0.3;
      recoilOffset =
        8 * zoom * (1 - returnPhase) * Math.cos(returnPhase * Math.PI * 2);
      turretShake =
        Math.sin(returnPhase * Math.PI * 6) * (1 - returnPhase) * 1.5 * zoom;
    } else {
      // Reload phase - slight upward motion
      reloadPhase = (firePhase - 0.4) / 0.6;
    }
  }

  // Calculate isometric foreshortening based on rotation
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const depthFactor = sinR;

  // Larger barrel dimensions
  const baseBarrelLength = (30 + level * 12) * zoom;
  const barrelLength =
    baseBarrelLength * (0.4 + foreshorten * 0.6) - recoilOffset;
  const barrelWidth = (12 + level * 3) * zoom; // Increased width

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

  // Rotating platform ring
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

  // Armor plates on housing
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 12;
    ctx.beginPath();
    ctx.moveTo(turretX, turretY - 12 * zoom);
    ctx.lineTo(
      turretX + Math.cos(angle) * 14 * zoom,
      turretY - 12 * zoom + Math.sin(angle) * 7 * zoom
    );
    ctx.stroke();
  }

  // Central pivot mechanism - larger
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 10 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 7 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Glowing core with pulsing animation (brighter during reload)
  const coreGlow = 0.6 + Math.sin(time * 5) * 0.3 + reloadPhase * 0.3;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 12 * zoom,
    0,
    turretX,
    turretY - 12 * zoom,
    6 * zoom
  );
  coreGrad.addColorStop(0, `rgba(255, 180, 80, ${coreGlow})`);
  coreGrad.addColorStop(0.4, `rgba(255, 120, 30, ${coreGlow * 0.8})`);
  coreGrad.addColorStop(0.7, `rgba(255, 80, 0, ${coreGlow * 0.5})`);
  coreGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Core highlight
  ctx.fillStyle = `rgba(255, 220, 180, ${coreGlow * 0.8})`;
  ctx.beginPath();
  ctx.arc(turretX - 1 * zoom, turretY - 13 * zoom, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

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

  // Muzzle flash effect
  if (timeSinceFire < 100) {
    const flashPhase = timeSinceFire / 100;
    const flashSize = (15 - flashPhase * 10) * zoom;
    const flashX = turretX + cosR * (barrelLength + 5 * zoom);
    const flashY = turretY - 12 * zoom + sinR * (barrelLength + 5 * zoom) * 0.5;

    ctx.fillStyle = `rgba(255, 200, 100, ${1 - flashPhase})`;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 20 * zoom;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Helper function to draw cannon barrel with isometric perspective and recoil
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

  // Calculate recoil - barrel moves back briefly when firing
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  if (timeSinceFire < 150) {
    // Quick snap back then slow return
    const recoilPhase = timeSinceFire / 150;
    if (recoilPhase < 0.2) {
      // Initial snap back
      recoilOffset = (recoilPhase / 0.2) * 8 * zoom;
    } else {
      // Slow return
      recoilOffset = 8 * zoom * (1 - (recoilPhase - 0.2) / 0.8);
    }
  }

  // Apply recoil to pivot position (barrel moves back along its axis)
  const recoiledPivotX = pivotX - cosR * recoilOffset;
  const recoiledPivotY = pivotY - sinR * recoilOffset * 0.5;

  // Calculate barrel end point in isometric space
  // X moves with cosR, Y moves with sinR * 0.5 (isometric Y compression)
  const endX = recoiledPivotX + cosR * barrelLength;
  const endY = recoiledPivotY + sinR * barrelLength * 0.5;

  // Calculate perpendicular offset for barrel thickness (isometric)
  const perpX = -sinR * barrelWidth * 0.5;
  const perpY = cosR * barrelWidth * 0.25; // Half for isometric

  // Barrel depth shading based on angle
  const lightSide = sinR < 0; // Top of barrel is lit when pointing up

  // Main barrel body
  const barrelGrad = ctx.createLinearGradient(
    recoiledPivotX + perpX,
    recoiledPivotY + perpY,
    recoiledPivotX - perpX,
    recoiledPivotY - perpY
  );
  if (lightSide) {
    barrelGrad.addColorStop(0, "#7a7a82");
    barrelGrad.addColorStop(0.4, "#6a6a72");
    barrelGrad.addColorStop(1, "#4a4a52");
  } else {
    barrelGrad.addColorStop(0, "#5a5a62");
    barrelGrad.addColorStop(0.6, "#6a6a72");
    barrelGrad.addColorStop(1, "#5a5a62");
  }

  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  // Barrel tapers toward muzzle
  const taperMult = 0.7;
  ctx.moveTo(recoiledPivotX + perpX, recoiledPivotY + perpY);
  ctx.lineTo(endX + perpX * taperMult, endY + perpY * taperMult);
  ctx.lineTo(endX - perpX * taperMult, endY - perpY * taperMult);
  ctx.lineTo(recoiledPivotX - perpX, recoiledPivotY - perpY);
  ctx.closePath();
  ctx.fill();

  // Barrel reinforcement bands
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const t = 0.2 + i * 0.25;
    const bx = recoiledPivotX + cosR * barrelLength * t;
    const by = recoiledPivotY + sinR * barrelLength * t * 0.5;
    const widthMult = 1 - t * 0.3;
    ctx.beginPath();
    ctx.moveTo(bx + perpX * widthMult, by + perpY * widthMult);
    ctx.lineTo(bx - perpX * widthMult, by - perpY * widthMult);
    ctx.stroke();
  }

  // Energy conduits along barrel
  const conduitGlow = 0.5 + Math.sin(time * 6) * 0.3;
  ctx.strokeStyle = `rgba(255, 102, 0, ${conduitGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  const conduitOffset = barrelWidth * 0.15;
  // Top conduit
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX + perpX * 0.3, recoiledPivotY + perpY * 0.3);
  ctx.lineTo(endX + perpX * 0.2 * taperMult, endY + perpY * 0.2 * taperMult);
  ctx.stroke();
  // Bottom conduit
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX - perpX * 0.3, recoiledPivotY - perpY * 0.3);
  ctx.lineTo(endX - perpX * 0.2 * taperMult, endY - perpY * 0.2 * taperMult);
  ctx.stroke();

  // Muzzle assembly
  ctx.fillStyle = "#3a3a42";
  const muzzleStart = 0.85;
  const msx = recoiledPivotX + cosR * barrelLength * muzzleStart;
  const msy = recoiledPivotY + sinR * barrelLength * muzzleStart * 0.5;
  ctx.beginPath();
  ctx.moveTo(msx + perpX * taperMult * 0.9, msy + perpY * taperMult * 0.9);
  ctx.lineTo(endX + perpX * taperMult * 1.1, endY + perpY * taperMult * 1.1);
  ctx.lineTo(endX - perpX * taperMult * 1.1, endY - perpY * taperMult * 1.1);
  ctx.lineTo(msx - perpX * taperMult * 0.9, msy - perpY * taperMult * 0.9);
  ctx.closePath();
  ctx.fill();

  // Muzzle bore
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(
    endX + cosR * 2 * zoom,
    endY + sinR * 1 * zoom,
    barrelWidth * 0.2 * foreshorten + barrelWidth * 0.1,
    barrelWidth * 0.15,
    rotation,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Muzzle flash effect
  if (timeSinceFire < 150) {
    const flash = 1 - timeSinceFire / 150;
    const flashX = endX + cosR * 10 * zoom;
    const flashY = endY + sinR * 5 * zoom;
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
      // Heavy initial recoil
      recoilOffset = (firePhase / 0.15) * 12 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 15) * 3 * zoom;
    } else if (firePhase < 0.5) {
      // Slower return for heavy cannon
      const returnPhase = (firePhase - 0.15) / 0.35;
      recoilOffset =
        12 * zoom * (1 - returnPhase) * Math.cos(returnPhase * Math.PI * 1.5);
      turretShake =
        Math.sin(returnPhase * Math.PI * 4) * (1 - returnPhase) * 2 * zoom;
    } else {
      // Reload phase with mechanical motion
      reloadPhase = (firePhase - 0.5) / 0.5;
    }
  }

  // Calculate isometric foreshortening
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  // Larger barrel for heavy cannon - with recoil
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

  // Outer ring detail
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

  // Armored turret housing with hexagonal details
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

  // Armor plate details - hexagonal pattern
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 12;
    const x1 = turretX + Math.cos(angle) * 12 * zoom;
    const y1 = turretY - 16 * zoom + Math.sin(angle) * 6 * zoom;
    const x2 = turretX + Math.cos(angle) * 18 * zoom;
    const y2 = turretY - 16 * zoom + Math.sin(angle) * 9 * zoom;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Bolt details on housing
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const bx = turretX + Math.cos(angle) * 16 * zoom;
    const by = turretY - 16 * zoom + Math.sin(angle) * 8 * zoom;
    ctx.beginPath();
    ctx.arc(bx, by, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Heavy pivot mechanism
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 12 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 9 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Power core (pulsing) with multiple rings - brighter during reload
  const coreGlow = 0.7 + Math.sin(time * 4) * 0.3 + reloadPhase * 0.4;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 16 * zoom,
    0,
    turretX,
    turretY - 16 * zoom,
    9 * zoom
  );
  coreGrad.addColorStop(0, `rgba(255, 220, 120, ${coreGlow})`);
  coreGrad.addColorStop(0.25, `rgba(255, 180, 80, ${coreGlow * 0.9})`);
  coreGrad.addColorStop(0.5, `rgba(255, 130, 30, ${coreGlow * 0.6})`);
  coreGrad.addColorStop(0.75, `rgba(255, 80, 0, ${coreGlow * 0.3})`);
  coreGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 9 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Core highlight
  ctx.fillStyle = `rgba(255, 240, 200, ${coreGlow * 0.9})`;
  ctx.beginPath();
  ctx.arc(turretX - 2 * zoom, turretY - 18 * zoom, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Core ring
  ctx.strokeStyle = `rgba(255, 150, 50, ${coreGlow * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.stroke();

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

  // Muzzle flash effect for heavy cannon
  if (timeSinceFire < 150) {
    const flashPhase = timeSinceFire / 150;
    const flashSize = (25 - flashPhase * 18) * zoom;
    const flashX = turretX + cosR * (barrelLength + 8 * zoom);
    const flashY = turretY - 16 * zoom + sinR * (barrelLength + 8 * zoom) * 0.5;

    ctx.fillStyle = `rgba(255, 220, 100, ${1 - flashPhase})`;
    ctx.shadowColor = "#ff8800";
    ctx.shadowBlur = 30 * zoom;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Heavy cannon barrel with stabilizers and recoil
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

  // Apply recoil
  const recoiledPivotX = pivotX - cosR * recoilOffset;
  const recoiledPivotY = pivotY - sinR * recoilOffset * 0.5;

  // Calculate barrel end point in isometric space
  const endX = recoiledPivotX + cosR * barrelLength;
  const endY = recoiledPivotY + sinR * barrelLength * 0.5;

  // Perpendicular offset for barrel thickness
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

  // Main heavy barrel
  const barrelGrad = ctx.createLinearGradient(
    recoiledPivotX + perpX,
    recoiledPivotY + perpY,
    recoiledPivotX - perpX,
    recoiledPivotY - perpY
  );
  if (lightSide) {
    barrelGrad.addColorStop(0, "#7a7a82");
    barrelGrad.addColorStop(0.3, "#6a6a72");
    barrelGrad.addColorStop(1, "#4a4a52");
  } else {
    barrelGrad.addColorStop(0, "#5a5a62");
    barrelGrad.addColorStop(0.5, "#6a6a72");
    barrelGrad.addColorStop(1, "#5a5a62");
  }

  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX + perpX, recoiledPivotY + perpY);
  ctx.lineTo(endX + perpX * taperMult, endY + perpY * taperMult);
  ctx.lineTo(endX - perpX * taperMult, endY - perpY * taperMult);
  ctx.lineTo(recoiledPivotX - perpX, recoiledPivotY - perpY);
  ctx.closePath();
  ctx.fill();

  // Stabilizer fins (scaled for isometric)
  if (foreshorten > 0.3) {
    ctx.fillStyle = "#4a4a52";
    const finStart = 0.4;
    const finEnd = 0.75;
    const finPeak = 0.6;
    // Top stabilizer
    const fs1x = recoiledPivotX + cosR * barrelLength * finStart;
    const fs1y = recoiledPivotY + sinR * barrelLength * finStart * 0.5;
    const fp1x = recoiledPivotX + cosR * barrelLength * finPeak;
    const fp1y =
      recoiledPivotY + sinR * barrelLength * finPeak * 0.5 - barrelWidth * 0.4;
    const fe1x = recoiledPivotX + cosR * barrelLength * finEnd;
    const fe1y = recoiledPivotY + sinR * barrelLength * finEnd * 0.5;
    ctx.beginPath();
    ctx.moveTo(fs1x + perpX * 0.5, fs1y + perpY * 0.5);
    ctx.lineTo(fp1x + perpX * 0.8, fp1y);
    ctx.lineTo(fe1x + perpX * 0.5, fe1y + perpY * 0.5);
    ctx.closePath();
    ctx.fill();
    // Bottom stabilizer
    ctx.beginPath();
    ctx.moveTo(fs1x - perpX * 0.5, fs1y - perpY * 0.5);
    ctx.lineTo(
      fp1x - perpX * 0.8,
      recoiledPivotY + sinR * barrelLength * finPeak * 0.5 + barrelWidth * 0.4
    );
    ctx.lineTo(fe1x - perpX * 0.5, fe1y - perpY * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Heavy reinforcement bands
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 3.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const t = 0.15 + i * 0.2;
    const bx = recoiledPivotX + cosR * barrelLength * t;
    const by = recoiledPivotY + sinR * barrelLength * t * 0.5;
    const widthMult = 1 - t * 0.35;
    ctx.beginPath();
    ctx.moveTo(bx + perpX * widthMult, by + perpY * widthMult);
    ctx.lineTo(bx - perpX * widthMult, by - perpY * widthMult);
    ctx.stroke();
  }

  // Energy conduits
  const conduitGlow = 0.6 + Math.sin(time * 6) * 0.3;
  ctx.strokeStyle = `rgba(255, 120, 0, ${conduitGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX + perpX * 0.25, recoiledPivotY + perpY * 0.25);
  ctx.lineTo(endX + perpX * 0.15 * taperMult, endY + perpY * 0.15 * taperMult);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(recoiledPivotX - perpX * 0.25, recoiledPivotY - perpY * 0.25);
  ctx.lineTo(endX - perpX * 0.15 * taperMult, endY - perpY * 0.15 * taperMult);
  ctx.stroke();

  // Heavy muzzle brake
  ctx.fillStyle = "#3a3a42";
  const muzzleStart = 0.82;
  const msx = recoiledPivotX + cosR * barrelLength * muzzleStart;
  const msy = recoiledPivotY + sinR * barrelLength * muzzleStart * 0.5;
  ctx.beginPath();
  ctx.moveTo(msx + perpX * taperMult, msy + perpY * taperMult);
  ctx.lineTo(endX + perpX * taperMult * 1.2, endY + perpY * taperMult * 1.2);
  ctx.lineTo(endX - perpX * taperMult * 1.2, endY - perpY * taperMult * 1.2);
  ctx.lineTo(msx - perpX * taperMult, msy - perpY * taperMult);
  ctx.closePath();
  ctx.fill();

  // Muzzle vents
  ctx.fillStyle = "#2a2a32";
  for (let i = 0; i < 2; i++) {
    const vt = 0.88 + i * 0.06;
    const vx = recoiledPivotX + cosR * barrelLength * vt;
    const vy = recoiledPivotY + sinR * barrelLength * vt * 0.5;
    ctx.beginPath();
    ctx.moveTo(vx + perpX * taperMult * 1.1, vy + perpY * taperMult * 1.1);
    ctx.lineTo(vx - perpX * taperMult * 1.1, vy - perpY * taperMult * 1.1);
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
  }

  // Muzzle bore
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(
    endX + cosR * 3 * zoom,
    endY + sinR * 1.5 * zoom,
    barrelWidth * 0.18 * foreshorten + barrelWidth * 0.08,
    barrelWidth * 0.12,
    rotation,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Enhanced muzzle flash
  if (timeSinceFire < 200) {
    const flash = 1 - timeSinceFire / 200;
    const flashX = endX + cosR * 12 * zoom;
    const flashY = endY + sinR * 6 * zoom;
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

    // Bright core
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
  const spinAngle = time * 30; // Even faster spin
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 100;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 100 : 0;

  // Calculate isometric foreshortening
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  // === MASSIVE ARMORED BASE ===
  // Foundation with skull emblem
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    26 * zoom,
    13 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Reinforced platform
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - 2 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - 4 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Glowing ammunition indicators
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + time;
    const indicatorX = screenPos.x + Math.cos(angle) * 18 * zoom;
    const indicatorY = topY - 3 * zoom + Math.sin(angle) * 9 * zoom;
    const glow = 0.4 + Math.sin(time * 8 + i * 0.5) * 0.3 + attackPulse * 0.3;

    ctx.fillStyle = `rgba(255, 180, 50, ${glow})`;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw barrels behind if facing away
  if (facingAway) {
    drawGatlingBarrels(
      ctx,
      screenPos.x,
      topY - 14 * zoom,
      rotation,
      foreshorten,
      spinAngle,
      zoom,
      tower,
      time
    );
  }

  // === HEAVY GUN SHIELD ===
  const shieldGrad = ctx.createLinearGradient(
    screenPos.x - 20 * zoom,
    topY - 6 * zoom,
    screenPos.x + 20 * zoom,
    topY - 28 * zoom
  );
  shieldGrad.addColorStop(0, "#3a3a42");
  shieldGrad.addColorStop(0.2, "#5a5a62");
  shieldGrad.addColorStop(0.5, "#6a6a72");
  shieldGrad.addColorStop(0.8, "#5a5a62");
  shieldGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 18 * zoom, topY - 4 * zoom);
  ctx.lineTo(screenPos.x - 14 * zoom, topY - 26 * zoom);
  ctx.lineTo(screenPos.x + 14 * zoom, topY - 26 * zoom);
  ctx.lineTo(screenPos.x + 18 * zoom, topY - 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Shield battle damage marks
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 3; i++) {
    const markX = screenPos.x + (i - 1) * 8 * zoom;
    const markY = topY - 12 * zoom - i * 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(markX - 3 * zoom, markY - 2 * zoom);
    ctx.lineTo(markX + 2 * zoom, markY + 3 * zoom);
    ctx.stroke();
  }

  // Shield reinforced edge
  ctx.strokeStyle = "#7a7a82";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 14 * zoom, topY - 26 * zoom);
  ctx.lineTo(screenPos.x + 14 * zoom, topY - 26 * zoom);
  ctx.stroke();

  // Skull emblem on shield
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(screenPos.x, topY - 15 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 100, 50, ${0.5 + attackPulse * 0.5})`;
  ctx.beginPath();
  ctx.arc(screenPos.x - 2 * zoom, topY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.arc(screenPos.x + 2 * zoom, topY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Shield tech panels
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 10 * zoom, topY - 8 * zoom);
  ctx.lineTo(screenPos.x - 8 * zoom, topY - 22 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(screenPos.x + 10 * zoom, topY - 8 * zoom);
  ctx.lineTo(screenPos.x + 8 * zoom, topY - 22 * zoom);
  ctx.stroke();

  // Heavy rivets
  ctx.fillStyle = "#8a8a92";
  for (let row = 0; row < 2; row++) {
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.arc(
        screenPos.x + i * 11 * zoom,
        topY - 10 * zoom - row * 8 * zoom,
        2.5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // === CENTRAL TURRET MECHANISM ===
  const turretGrad = ctx.createRadialGradient(
    screenPos.x - 3 * zoom,
    topY - 18 * zoom,
    0,
    screenPos.x,
    topY - 14 * zoom,
    16 * zoom
  );
  turretGrad.addColorStop(0, "#7a7a82");
  turretGrad.addColorStop(0.5, "#5a5a62");
  turretGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = turretGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - 14 * zoom,
    14 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Ammunition belt feed
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 8 * zoom, topY - 6 * zoom);
  ctx.lineTo(screenPos.x - 14 * zoom, topY);
  ctx.lineTo(screenPos.x - 10 * zoom, topY + 2 * zoom);
  ctx.lineTo(screenPos.x - 4 * zoom, topY - 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Ammo belt bullets
  ctx.fillStyle = "#daa520";
  for (let i = 0; i < 4; i++) {
    const bulletX = screenPos.x - 6 * zoom - i * 2.5 * zoom;
    const bulletY = topY - 4 * zoom + i * 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(bulletX, bulletY, 1.5 * zoom, 2.5 * zoom, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // === POWER CORE ===
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(screenPos.x, topY - 14 * zoom, 7 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const coreGlow = 0.7 + Math.sin(time * 10) * 0.3 + attackPulse * 0.3;
  const coreGrad = ctx.createRadialGradient(
    screenPos.x,
    topY - 14 * zoom,
    0,
    screenPos.x,
    topY - 14 * zoom,
    6 * zoom
  );
  coreGrad.addColorStop(0, `rgba(255, 240, 150, ${coreGlow})`);
  coreGrad.addColorStop(0.3, `rgba(255, 200, 80, ${coreGlow * 0.8})`);
  coreGrad.addColorStop(0.6, `rgba(255, 150, 30, ${coreGlow * 0.5})`);
  coreGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);

  ctx.shadowColor = "#ff8800";
  ctx.shadowBlur = (10 + attackPulse * 10) * zoom;
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, topY - 14 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Spinning core indicator
  ctx.strokeStyle = `rgba(255, 200, 100, ${coreGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const indicatorAngle = spinAngle * 0.2 + (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      screenPos.x,
      topY - 14 * zoom,
      4 * zoom,
      indicatorAngle,
      indicatorAngle + 0.3
    );
    ctx.stroke();
  }

  // Draw barrels in front if not facing away
  if (!facingAway) {
    drawGatlingBarrels(
      ctx,
      screenPos.x,
      topY - 14 * zoom,
      rotation,
      foreshorten,
      spinAngle,
      zoom,
      tower,
      time
    );
  }

  // === HEAT VENTS ===
  if (isAttacking) {
    // Heat shimmer effect
    for (let i = 0; i < 3; i++) {
      const ventX = screenPos.x + (i - 1) * 8 * zoom;
      const ventY = topY - 24 * zoom - Math.random() * 5 * zoom;
      const ventAlpha = attackPulse * (0.3 + Math.random() * 0.2);

      ctx.fillStyle = `rgba(255, 150, 50, ${ventAlpha})`;
      ctx.beginPath();
      ctx.ellipse(ventX, ventY, 3 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Helper for gatling barrel cluster - EPIC DARK FANTASY VERSION
function drawGatlingBarrels(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  foreshorten: number,
  spinAngle: number,
  zoom: number,
  tower: Tower,
  time: number
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 80;

  const baseLength = 42 * zoom;
  const barrelLength = baseLength * (0.5 + foreshorten * 0.5);

  // Calculate barrel end point
  const endX = pivotX + cosR * barrelLength;
  const endY = pivotY + sinR * barrelLength * 0.5;

  // === MASSIVE BARREL HOUSING ===
  const housingGrad = ctx.createLinearGradient(
    pivotX,
    pivotY - 12 * zoom,
    pivotX,
    pivotY + 12 * zoom
  );
  housingGrad.addColorStop(0, "#4a4a52");
  housingGrad.addColorStop(0.2, "#6a6a72");
  housingGrad.addColorStop(0.5, "#7a7a82");
  housingGrad.addColorStop(0.8, "#5a5a62");
  housingGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = housingGrad;
  ctx.beginPath();
  ctx.ellipse(
    pivotX + cosR * 10 * zoom,
    pivotY + sinR * 5 * zoom,
    12 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Housing ring detail
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    pivotX + cosR * 10 * zoom,
    pivotY + sinR * 5 * zoom,
    12 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // === 8 SPINNING BARRELS ===
  for (let i = 0; i < 8; i++) {
    const barrelAngle = spinAngle + (i / 8) * Math.PI * 2;
    const barrelDepth = Math.cos(barrelAngle);
    const barrelOffset = Math.sin(barrelAngle) * 6 * zoom;

    // Only draw barrels that should be visible
    if (barrelDepth > -0.6) {
      const shade = 0.3 + barrelDepth * 0.4;
      const barrelColor = Math.floor(50 + shade * 60);

      // Perpendicular offset in isometric space
      const perpX = -sinR * barrelOffset;
      const perpY = cosR * barrelOffset * 0.5;

      // Barrel body with gradient
      const bStartX = pivotX + cosR * 10 * zoom + perpX;
      const bStartY = pivotY + sinR * 5 * zoom + perpY;
      const bEndX = endX + perpX * 0.75;
      const bEndY = endY + perpY * 0.75;

      // Tapered barrel
      const bw = 3 * zoom;
      const perpBX = -sinR * bw;
      const perpBY = cosR * bw * 0.5;

      // Barrel gradient
      const barrelGrad = ctx.createLinearGradient(
        bStartX,
        bStartY,
        bEndX,
        bEndY
      );
      barrelGrad.addColorStop(
        0,
        `rgb(${barrelColor + 20}, ${barrelColor + 20}, ${barrelColor + 28})`
      );
      barrelGrad.addColorStop(
        0.5,
        `rgb(${barrelColor}, ${barrelColor}, ${barrelColor + 8})`
      );
      barrelGrad.addColorStop(
        1,
        `rgb(${barrelColor - 10}, ${barrelColor - 10}, ${barrelColor})`
      );
      ctx.fillStyle = barrelGrad;

      ctx.beginPath();
      ctx.moveTo(bStartX + perpBX, bStartY + perpBY);
      ctx.lineTo(bEndX + perpBX * 0.6, bEndY + perpBY * 0.6);
      ctx.lineTo(bEndX - perpBX * 0.6, bEndY - perpBY * 0.6);
      ctx.lineTo(bStartX - perpBX, bStartY - perpBY);
      ctx.closePath();
      ctx.fill();

      // Barrel rifling lines
      if (barrelDepth > 0.2) {
        ctx.strokeStyle = `rgba(90, 90, 100, ${shade})`;
        ctx.lineWidth = 0.5 * zoom;
        const midX = (bStartX + bEndX) / 2;
        const midY = (bStartY + bEndY) / 2;
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY);
        ctx.lineTo(bEndX, bEndY);
        ctx.stroke();
      }

      // Barrel bore (dark hole)
      if (barrelDepth > 0.2) {
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.arc(
          bEndX,
          bEndY,
          2 * zoom * foreshorten + 0.5 * zoom,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Heat glow inside bore when firing
        if (isAttacking) {
          ctx.fillStyle = `rgba(255, 150, 50, ${
            0.5 * (1 - timeSinceFire / 80)
          })`;
          ctx.beginPath();
          ctx.arc(
            bEndX,
            bEndY,
            1.5 * zoom * foreshorten + 0.3 * zoom,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }

  // === FRONT BARREL PLATE ===
  const plateX = endX - cosR * 5 * zoom;
  const plateY = endY - sinR * 2.5 * zoom;

  const plateGrad = ctx.createRadialGradient(
    plateX - 2 * zoom,
    plateY - 1 * zoom,
    0,
    plateX,
    plateY,
    10 * zoom
  );
  plateGrad.addColorStop(0, "#7a7a82");
  plateGrad.addColorStop(0.5, "#5a5a62");
  plateGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.ellipse(
    plateX,
    plateY,
    10 * zoom * foreshorten + 4 * zoom,
    8 * zoom,
    rotation,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Center spindle
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(plateX, plateY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === MUZZLE FLASH ===
  if (isAttacking) {
    const flash = 1 - timeSinceFire / 80;
    const flashX = endX + cosR * 8 * zoom;
    const flashY = endY + sinR * 4 * zoom;

    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 20 * zoom;

    // Core flash
    const flashGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      18 * zoom * flash
    );
    flashGrad.addColorStop(0, `rgba(255, 255, 220, ${flash})`);
    flashGrad.addColorStop(0.2, `rgba(255, 240, 150, ${flash * 0.9})`);
    flashGrad.addColorStop(0.5, `rgba(255, 180, 80, ${flash * 0.6})`);
    flashGrad.addColorStop(1, `rgba(200, 80, 0, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, 18 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();

    // Flash streaks
    for (let i = 0; i < 6; i++) {
      const streakAngle = rotation + (Math.random() - 0.5) * 0.8;
      const streakLen = (10 + Math.random() * 15) * zoom * flash;
      ctx.strokeStyle = `rgba(255, 220, 100, ${flash * 0.7})`;
      ctx.lineWidth = 2 * zoom * flash;
      ctx.beginPath();
      ctx.moveTo(flashX, flashY);
      ctx.lineTo(
        flashX + Math.cos(streakAngle) * streakLen,
        flashY + Math.sin(streakAngle) * streakLen * 0.5
      );
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }

  // === SMOKE WISPS after firing ===
  if (timeSinceFire > 60 && timeSinceFire < 300) {
    const smokePhase = (timeSinceFire - 60) / 240;
    for (let i = 0; i < 3; i++) {
      const smokeX =
        endX +
        cosR * (5 + smokePhase * 10) * zoom +
        (Math.random() - 0.5) * 8 * zoom;
      const smokeY = endY - smokePhase * 15 * zoom - i * 4 * zoom;
      const smokeAlpha = (1 - smokePhase) * 0.3;

      ctx.fillStyle = `rgba(100, 100, 110, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, (3 + smokePhase * 4) * zoom, 0, Math.PI * 2);
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

  // Calculate isometric foreshortening
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  // Armored base platform
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - 2 * zoom,
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
    screenPos.x,
    topY - 4 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw nozzle behind if facing away
  if (facingAway) {
    drawFlamethrowerNozzle(
      ctx,
      screenPos.x,
      topY - 10 * zoom,
      rotation,
      foreshorten,
      zoom,
      tower,
      time
    );
  }

  // Main fuel tank (cylindrical, detailed)
  const tankGrad = ctx.createLinearGradient(
    screenPos.x - 12 * zoom,
    topY - 24 * zoom,
    screenPos.x + 4 * zoom,
    topY
  );
  tankGrad.addColorStop(0, "#cc3030");
  tankGrad.addColorStop(0.2, "#aa2020");
  tankGrad.addColorStop(0.5, "#881515");
  tankGrad.addColorStop(0.8, "#661010");
  tankGrad.addColorStop(1, "#440808");
  ctx.fillStyle = tankGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x - 6 * zoom,
    topY - 12 * zoom,
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
    screenPos.x - 8 * zoom,
    topY - 12 * zoom,
    2 * zoom,
    10 * zoom,
    0,
    -0.3,
    0.3
  );
  ctx.stroke();

  // Warning stripes with better detail
  ctx.strokeStyle = "#ffcc00";
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const stripeY = topY - 18 * zoom + i * 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - 6 * zoom,
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
    const stripeY = topY - 15 * zoom + i * 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - 6 * zoom,
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
    screenPos.x - 6 * zoom,
    topY - 26 * zoom,
    6 * zoom,
    3 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.arc(screenPos.x - 6 * zoom, topY - 26 * zoom, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pressure gauge with needle
  ctx.fillStyle = "#ddd";
  ctx.beginPath();
  ctx.arc(screenPos.x + 2 * zoom, topY - 6 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(screenPos.x + 2 * zoom, topY - 6 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  // Gauge markings
  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(
    screenPos.x + 2 * zoom,
    topY - 6 * zoom,
    3 * zoom,
    Math.PI * 0.8,
    Math.PI * 1.2
  );
  ctx.stroke();
  ctx.strokeStyle = "#f00";
  ctx.beginPath();
  ctx.arc(
    screenPos.x + 2 * zoom,
    topY - 6 * zoom,
    3 * zoom,
    Math.PI * 1.5,
    Math.PI * 1.8
  );
  ctx.stroke();
  // Needle
  const needleAngle = Math.PI * (0.9 + Math.sin(time * 2) * 0.15);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x + 2 * zoom, topY - 6 * zoom);
  ctx.lineTo(
    screenPos.x + 2 * zoom + Math.cos(needleAngle) * 3 * zoom,
    topY - 6 * zoom + Math.sin(needleAngle) * 3 * zoom
  );
  ctx.stroke();

  // Secondary fuel tank
  ctx.fillStyle = "#884020";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x + 8 * zoom,
    topY - 10 * zoom,
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
  ctx.moveTo(screenPos.x - 2 * zoom, topY - 8 * zoom);
  ctx.quadraticCurveTo(
    screenPos.x + 4 * zoom,
    topY - 14 * zoom,
    screenPos.x + 6 * zoom,
    topY - 10 * zoom
  );
  ctx.stroke();

  // Igniter housing
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - 10 * zoom,
    8 * zoom,
    6 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw nozzle in front if not facing away
  if (!facingAway) {
    drawFlamethrowerNozzle(
      ctx,
      screenPos.x,
      topY - 10 * zoom,
      rotation,
      foreshorten,
      zoom,
      tower,
      time
    );
  }
}

// Helper for flamethrower nozzle
function drawFlamethrowerNozzle(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  const baseLength = 35 * zoom;
  const nozzleLength = baseLength * (0.5 + foreshorten * 0.5);

  // Calculate nozzle end point
  const endX = pivotX + cosR * nozzleLength;
  const endY = pivotY + sinR * nozzleLength * 0.5;

  // Perpendicular for width
  const perpX = -sinR * 5 * zoom;
  const perpY = cosR * 2.5 * zoom;

  // Fuel line from tank to nozzle
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(pivotX - 4 * zoom, pivotY);
  ctx.quadraticCurveTo(
    pivotX + cosR * 6 * zoom,
    pivotY + sinR * 3 * zoom - 4 * zoom,
    pivotX + cosR * 10 * zoom,
    pivotY + sinR * 5 * zoom
  );
  ctx.stroke();

  // Nozzle body with gradient
  const nozzleGrad = ctx.createLinearGradient(
    pivotX + perpX,
    pivotY + perpY,
    pivotX - perpX,
    pivotY - perpY
  );
  nozzleGrad.addColorStop(0, "#5a5a62");
  nozzleGrad.addColorStop(0.3, "#6a6a72");
  nozzleGrad.addColorStop(0.7, "#5a5a62");
  nozzleGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = nozzleGrad;
  ctx.beginPath();
  ctx.moveTo(pivotX + perpX, pivotY + perpY);
  ctx.lineTo(endX + perpX * 0.7, endY + perpY * 0.7);
  ctx.lineTo(endX - perpX * 0.7, endY - perpY * 0.7);
  ctx.lineTo(pivotX - perpX, pivotY - perpY);
  ctx.closePath();
  ctx.fill();

  // Nozzle rings
  ctx.strokeStyle = "#7a7a82";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 3; i++) {
    const t = 0.3 + i * 0.2;
    const rx = pivotX + cosR * nozzleLength * t;
    const ry = pivotY + sinR * nozzleLength * t * 0.5;
    const ringMult = 1 - t * 0.3;
    ctx.beginPath();
    ctx.moveTo(rx + perpX * ringMult, ry + perpY * ringMult);
    ctx.lineTo(rx - perpX * ringMult, ry - perpY * ringMult);
    ctx.stroke();
  }

  // Flared nozzle tip
  ctx.fillStyle = "#3a3a42";
  const tipStart = 0.8;
  const tsx = pivotX + cosR * nozzleLength * tipStart;
  const tsy = pivotY + sinR * nozzleLength * tipStart * 0.5;
  ctx.beginPath();
  ctx.moveTo(tsx + perpX * 0.7, tsy + perpY * 0.7);
  ctx.lineTo(endX + perpX * 1.4, endY + perpY * 1.4);
  ctx.lineTo(endX - perpX * 1.4, endY - perpY * 1.4);
  ctx.lineTo(tsx - perpX * 0.7, tsy - perpY * 0.7);
  ctx.closePath();
  ctx.fill();

  // Pilot light (blue flame)
  const pilotGlow = 0.7 + Math.sin(time * 10) * 0.3;
  ctx.fillStyle = `rgba(0, 180, 255, ${pilotGlow})`;
  ctx.shadowColor = "#00aaff";
  ctx.shadowBlur = 4 * zoom;
  const pilotX = endX - cosR * 6 * zoom + perpX * 0.5;
  const pilotY = endY - sinR * 3 * zoom + perpY * 0.5;
  ctx.beginPath();
  ctx.arc(pilotX, pilotY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Flame effect when firing
  if (Date.now() - tower.lastAttack < 500) {
    const flameIntensity = 1 - (Date.now() - tower.lastAttack) / 500;
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 25 * zoom * flameIntensity;

    for (let i = 0; i < 10; i++) {
      const flameT = 1 + i * 0.12;
      const flameX = pivotX + cosR * nozzleLength * flameT;
      const flameY = pivotY + sinR * nozzleLength * flameT * 0.5;
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

// LIBRARY TOWER - Enhanced Gothic design
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

  // Attack animation - piston mechanism (top part slams down into base)
  const timeSinceFire = Date.now() - tower.lastAttack;
  let attackPulse = 0;
  let pistonOffset = 0; // Only affects top portion
  let groundShockwave = 0;
  let groundCrackPhase = 0;
  let impactFlash = 0;

  if (timeSinceFire < 500) {
    const attackPhase = timeSinceFire / 500;
    attackPulse = (1 - attackPhase) * 0.4;

    // Piston animation: top rises up, then slams into the base plate
    if (attackPhase < 0.2) {
      // Rise up phase - top section lifts
      pistonOffset = (-attackPhase / 0.2) * 12 * zoom;
    } else if (attackPhase < 0.35) {
      // Slam down phase - fast compression
      const slamPhase = (attackPhase - 0.2) / 0.15;
      pistonOffset = -12 * zoom * (1 - slamPhase * slamPhase);
      // Impact flash when hitting
      if (slamPhase > 0.8) {
        impactFlash = (slamPhase - 0.8) / 0.2;
      }
    } else if (attackPhase < 0.5) {
      // Compressed state - slight overshoot
      const compressPhase = (attackPhase - 0.35) / 0.15;
      pistonOffset = 4 * zoom * Math.sin(compressPhase * Math.PI);
      impactFlash = 1 - compressPhase;
    } else {
      // Return to rest
      const returnPhase = (attackPhase - 0.5) / 0.5;
      pistonOffset = 0;
    }

    // Ground shockwave expands after slam
    if (attackPhase > 0.3) {
      groundShockwave = (attackPhase - 0.3) / 0.7;
      groundCrackPhase = Math.min(1, (attackPhase - 0.3) / 0.5);
    }
  }

  // Base stays in place
  const shakeX = 0;
  const shakeY = 0;

  // Brown foundation platform with tech details (STAYS IN PLACE)
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

  // Lower tower body - STAYS IN PLACE (base mechanism housing)
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

  // Piston plate/anvil - the striking surface (STAYS IN PLACE)
  const plateY = screenPos.y - lowerBodyHeight * zoom;
  ctx.fillStyle = "#8a7a6a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    plateY,
    (baseWidth + 6) * zoom * 0.5,
    (baseWidth + 6) * zoom * 0.25,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#9a8a7a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    plateY - 3 * zoom,
    (baseWidth + 4) * zoom * 0.5,
    (baseWidth + 4) * zoom * 0.25,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Impact flash on the plate
  if (impactFlash > 0) {
    ctx.fillStyle = `rgba(180, 100, 255, ${impactFlash * 0.8})`;
    ctx.shadowColor = "#b466ff";
    ctx.shadowBlur = 20 * zoom * impactFlash;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      plateY - 2 * zoom,
      baseWidth * zoom * 0.4,
      baseWidth * zoom * 0.2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Piston guides/rails on sides (STAY IN PLACE)
  for (let dx of [-1, 1]) {
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(
      screenPos.x + dx * baseWidth * zoom * 0.4 - 3 * zoom,
      plateY - baseHeight * zoom * 0.6,
      6 * zoom,
      baseHeight * zoom * 0.6
    );
  }

  // UPPER PISTON SECTION - MOVES WITH pistonOffset
  const pistonTopY = plateY - 4 * zoom + pistonOffset;

  // Upper tower body - piston hammer
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

  const topY = pistonTopY - baseHeight * 0.4 * zoom;
  const sX = screenPos.x;

  // Purple accent panel lines on upper section
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse;
  ctx.strokeStyle = `rgba(180, 100, 255, ${panelGlow})`;
  ctx.lineWidth = 1 * zoom;

  // Left face tech lines on upper section
  for (let i = 1; i <= tower.level; i++) {
    const lineY =
      pistonTopY - (baseHeight * 0.4 * zoom * i) / (tower.level + 1);
    ctx.beginPath();
    ctx.moveTo(sX - w * 0.15, lineY + d * 0.25);
    ctx.lineTo(sX - w * 0.7, lineY - d * 0.15);
    ctx.stroke();
  }

  // Right face tech lines on upper section
  for (let i = 1; i <= tower.level; i++) {
    const lineY =
      pistonTopY - (baseHeight * 0.4 * zoom * i) / (tower.level + 1);
    ctx.beginPath();
    ctx.moveTo(sX + w * 0.7, lineY - d * 0.15);
    ctx.lineTo(sX + w * 0.15, lineY + d * 0.25);
    ctx.stroke();
  }

  // Piston connector ring
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    pistonTopY + 2 * zoom,
    (baseWidth - 2) * zoom * 0.5,
    (baseWidth - 2) * zoom * 0.25,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Glowing purple energy vents on lower section (STAY IN PLACE)
  for (let i = 0; i < Math.min(tower.level, 2); i++) {
    const ventY = screenPos.y - lowerBodyHeight * zoom * 0.4 - i * 10 * zoom;
    const ventGlow = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3 + attackPulse;

    ctx.fillStyle = `rgba(180, 100, 255, ${ventGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      sX - w * 0.55,
      ventY + d * 0.15,
      3 * zoom,
      1.5 * zoom,
      0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      sX + w * 0.55,
      ventY + d * 0.15,
      3 * zoom,
      1.5 * zoom,
      -0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Brown spire/antenna with purple energy - MOVES WITH PISTON
  const spireHeight = (25 + tower.level * 5) * zoom;

  ctx.fillStyle = "#4a3a2a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX - baseWidth * zoom * 0.35, topY);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.15);
  ctx.lineTo(sX + baseWidth * zoom * 0.35, topY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX + baseWidth * zoom * 0.35, topY);
  ctx.lineTo(sX + baseWidth * zoom * 0.35, topY + 4 * zoom);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.15 + 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Purple energy orb at antenna tip
  const orbGlow = 0.6 + Math.sin(time * 4) * 0.3 + attackPulse;
  const orbGrad = ctx.createRadialGradient(
    sX,
    topY - spireHeight - 8 * zoom,
    0,
    sX,
    topY - spireHeight - 8 * zoom,
    8 * zoom
  );
  orbGrad.addColorStop(0, `rgba(200, 150, 255, ${orbGlow})`);
  orbGrad.addColorStop(0.4, `rgba(150, 80, 220, ${orbGlow * 0.7})`);
  orbGrad.addColorStop(1, `rgba(100, 50, 180, 0)`);
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 8 * zoom, 8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 200, 255, ${orbGlow})`;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 8 * zoom, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Holographic windows on lower section with brown frames (STAY IN PLACE)
  const windowY = screenPos.y - lowerBodyHeight * zoom * 0.5;
  const glowIntensity = 0.5 + Math.sin(time * 2) * 0.3 + attackPulse;

  for (let dx of [-1, 1]) {
    const wx = sX + dx * 10 * zoom;

    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.moveTo(wx - 4 * zoom, windowY + 8 * zoom);
    ctx.lineTo(wx - 4 * zoom, windowY - 2 * zoom);
    ctx.quadraticCurveTo(
      wx,
      windowY - 8 * zoom,
      wx + 4 * zoom,
      windowY - 2 * zoom
    );
    ctx.lineTo(wx + 4 * zoom, windowY + 8 * zoom);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(180, 100, 255, ${glowIntensity})`;
    ctx.shadowColor = "#b466ff";
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx - 2.5 * zoom, windowY + 6 * zoom);
    ctx.lineTo(wx - 2.5 * zoom, windowY - 1 * zoom);
    ctx.quadraticCurveTo(
      wx,
      windowY - 5 * zoom,
      wx + 2.5 * zoom,
      windowY - 1 * zoom
    );
    ctx.lineTo(wx + 2.5 * zoom, windowY + 6 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Central purple core display
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(sX, topY + 5 * zoom, 8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const coreGrad = ctx.createRadialGradient(
    sX,
    topY + 5 * zoom,
    0,
    sX,
    topY + 5 * zoom,
    6 * zoom
  );
  coreGrad.addColorStop(0, `rgba(180, 100, 255, ${glowIntensity})`);
  coreGrad.addColorStop(0.5, `rgba(140, 80, 200, ${glowIntensity * 0.7})`);
  coreGrad.addColorStop(1, `rgba(100, 50, 150, ${glowIntensity * 0.4})`);
  ctx.fillStyle = coreGrad;
  ctx.shadowColor = "#b466ff";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(sX, topY + 5 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Data ring pattern
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time * 2;
    ctx.beginPath();
    ctx.moveTo(sX, topY + 5 * zoom);
    ctx.lineTo(
      sX + Math.cos(angle) * 5 * zoom,
      topY + 5 * zoom + Math.sin(angle) * 5 * zoom
    );
    ctx.stroke();
  }

  // Floating data tablets
  if (tower.level >= 2) {
    for (let i = 0; i < tower.level + 1; i++) {
      const bookAngle = time * 1.2 + i * ((Math.PI * 2) / (tower.level + 1));
      const bookRadius = 28 * zoom;
      const bookX = sX + Math.cos(bookAngle) * bookRadius;
      const bookY = topY - 18 * zoom + Math.sin(bookAngle * 2) * 8 * zoom;
      const bookFloat = Math.sin(time * 3 + i) * 3 * zoom;

      ctx.fillStyle = `rgba(180, 100, 255, 0.3)`;
      ctx.beginPath();
      ctx.ellipse(
        bookX,
        bookY + bookFloat + 2 * zoom,
        8 * zoom,
        3 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle =
        i % 3 === 0 ? "#5a4a3a" : i % 3 === 1 ? "#4a5a5a" : "#4a4a5a";
      ctx.fillRect(
        bookX - 7 * zoom,
        bookY + bookFloat - 5 * zoom,
        14 * zoom,
        10 * zoom
      );

      ctx.fillStyle = `rgba(180, 150, 255, ${
        0.6 + Math.sin(time * 5 + i) * 0.2
      })`;
      ctx.fillRect(
        bookX - 5 * zoom,
        bookY + bookFloat - 4 * zoom,
        10 * zoom,
        8 * zoom
      );
    }
  }

  // Level 3 - Energy amplifier rings
  if (tower.level === 3 && !tower.upgrade) {
    const ringGlow = 0.5 + Math.sin(time * 3) * 0.3 + attackPulse;
    ctx.strokeStyle = `rgba(180, 100, 255, ${ringGlow})`;
    ctx.lineWidth = 2 * zoom;

    ctx.beginPath();
    ctx.ellipse(
      sX,
      topY - 15 * zoom,
      18 * zoom,
      9 * zoom,
      time * 0.5,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const runeAngle = (i / 4) * Math.PI * 2 + time * 1.5;
      const rx = sX + Math.cos(runeAngle) * 22 * zoom;
      const ry = topY - 15 * zoom + Math.sin(runeAngle) * 11 * zoom;

      ctx.fillStyle = `rgba(220, 180, 255, ${ringGlow})`;
      ctx.beginPath();
      ctx.arc(rx, ry, 3 * zoom, 0, Math.PI * 2);
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
  ctx.strokeStyle = `rgba(180, 100, 255, ${
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

        ctx.strokeStyle = `rgba(180, 100, 255, ${ringAlpha})`;
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
      ctx.strokeStyle = `rgba(180, 100, 255, ${(1 - groundCrackPhase) * 0.7})`;
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

  // Central coil column
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

  // Tesla coil rings (copper)
  const ringCount = 4 + tower.level;
  for (let i = 0; i < ringCount; i++) {
    const ringProgress = (i + 1) / (ringCount + 1);
    const ringY = topY - ringProgress * (coilHeight - 18 * zoom);
    const ringSize = 14 - i * (10 / ringCount);
    const energyPulse = Math.sin(time * 6 - i * 0.8) * 0.3;

    if (Date.now() - tower.lastAttack < 300) {
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 12 * zoom;
    }

    ctx.strokeStyle = `rgb(${140 + energyPulse * 30}, ${
      90 + energyPulse * 20
    }, ${40})`;
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY + 1 * zoom,
      ringSize * zoom,
      ringSize * zoom * 0.4,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    ctx.strokeStyle = `rgb(${200 + energyPulse * 50}, ${
      140 + energyPulse * 30
    }, ${70})`;
    ctx.lineWidth = 3 * zoom;
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
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Energy orb at top - THIS IS WHERE LIGHTNING ORIGINATES
  const orbY = topY - coilHeight + 5 * zoom;
  const orbPulse = 1 + Math.sin(time * 6) * 0.2;
  const orbSize = (10 + tower.level * 2) * zoom;

  // Store the orb position for projectile origin calculations
  tower._orbScreenY = orbY;

  // Outer energy field
  const energyFieldGrad = ctx.createRadialGradient(
    screenPos.x,
    orbY,
    0,
    screenPos.x,
    orbY,
    orbSize * 2.5 * orbPulse
  );
  energyFieldGrad.addColorStop(0, "rgba(0, 255, 255, 0.15)");
  energyFieldGrad.addColorStop(0.4, "rgba(0, 200, 255, 0.08)");
  energyFieldGrad.addColorStop(0.7, "rgba(0, 150, 255, 0.03)");
  energyFieldGrad.addColorStop(1, "rgba(0, 100, 255, 0)");
  ctx.fillStyle = energyFieldGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, orbY, orbSize * 2.5 * orbPulse, 0, Math.PI * 2);
  ctx.fill();

  // Main orb
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 30 * zoom * orbPulse;
  const orbGrad = ctx.createRadialGradient(
    screenPos.x - 3 * zoom,
    orbY - 3 * zoom,
    0,
    screenPos.x,
    orbY,
    orbSize * orbPulse
  );
  orbGrad.addColorStop(0, "#ffffff");
  orbGrad.addColorStop(0.2, "#ccffff");
  orbGrad.addColorStop(0.5, "#00ffff");
  orbGrad.addColorStop(0.8, "#0088ff");
  orbGrad.addColorStop(1, "#0044aa");
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, orbY, orbSize * orbPulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Electric arcs from orb
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
    ctx.beginPath();
    ctx.moveTo(screenPos.x, orbY);
    const midX =
      screenPos.x +
      (arcEndX - screenPos.x) * 0.5 +
      (Math.random() - 0.5) * 10 * zoom;
    const midY =
      orbY + (arcEndY - orbY) * 0.5 + (Math.random() - 0.5) * 8 * zoom;
    ctx.lineTo(midX, midY);
    ctx.lineTo(arcEndX, arcEndY);
    ctx.stroke();
    ctx.shadowBlur = 0;
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
  const coilHeight = 55 * zoom;
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
    const shardDist = 10 + Math.sin(time * 3 + i * 1.5) * 3;
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

  // Main crystal core
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = (20 + attackPulse * 15) * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, crystalY, 10 * crystalPulse * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Inner crystal glow
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(screenPos.x, crystalY, 5 * crystalPulse * zoom, 0, Math.PI * 2);
  ctx.fill();
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
  const coilHeight = 45 * zoom;

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

    // Mini coil pillar
    ctx.fillStyle = "#2d5a7b";
    ctx.fillRect(
      cx - 3 * zoom * coilSize,
      cy - 20 * zoom * coilSize,
      6 * zoom * coilSize,
      20 * zoom * coilSize
    );

    // Mini orb
    const pulse = 0.8 + Math.sin(time * 6 + pos.x) * 0.2;
    ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.arc(
      cx,
      cy - 25 * zoom * coilSize,
      6 * zoom * pulse * coilSize,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Central main orb
  const mainOrbY = topY - coilHeight + 5 * zoom;
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 20 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, mainOrbY, 12 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Store orb position
  tower._orbScreenY = mainOrbY;

  // Connecting arcs between coils
  ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
  ctx.lineWidth = 2 * zoom;
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

// ARCH TOWER
function renderArchTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string }
) {
  ctx.save();
  const baseWidth = 38 + tower.level * 5;
  const baseDepth = 30 + tower.level * 4;
  const baseHeight = 16 + tower.level * 6;
  const w = baseWidth * zoom * 0.5;
  const d = baseDepth * zoom * 0.25;

  const isShockwave = tower.level === 4 && tower.upgrade === "A";
  const isSymphony = tower.level === 4 && tower.upgrade === "B";

  // Dynamic attack animation - everything moves and pulses
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

    // Arch vibrates rapidly
    archVibrate =
      Math.sin(attackPhase * Math.PI * 12) * (1 - attackPhase) * 4 * zoom;

    // Pillars spread outward then return
    if (attackPhase < 0.3) {
      pillarSpread = (attackPhase / 0.3) * 6 * zoom;
      pillarBounce = Math.sin(attackPhase * Math.PI * 10) * 3 * zoom;
    } else {
      pillarSpread = 6 * zoom * (1 - (attackPhase - 0.3) / 0.7);
      pillarBounce =
        Math.sin(attackPhase * Math.PI * 6) * (1 - attackPhase) * 2 * zoom;
    }

    // Foundation shifts slightly
    foundationShift =
      Math.sin(attackPhase * Math.PI * 8) * (1 - attackPhase) * 2 * zoom;

    // Arch lifts up during attack
    if (attackPhase < 0.2) {
      archLift = (attackPhase / 0.2) * 5 * zoom;
    } else {
      archLift = 5 * zoom * (1 - (attackPhase - 0.2) / 0.8);
    }

    // Portal expands during attack
    portalExpand = Math.sin(attackPhase * Math.PI) * 8 * zoom;
  }

  // Ambient floating animation
  const floatOffset = Math.sin(time * 2) * 2 * zoom;
  const pulseSize = 1 + Math.sin(time * 3) * 0.02;

  // === EXTENDED BUILDING BASE - Gothic collegiate structure ===
  // Lower sub-building with animated components
  const subBuildingWidth = baseWidth + 20;
  const subBuildingHeight = 18;
  const subBounce =
    isShockwave || isSymphony
      ? Math.sin(time * 6) * 2 * zoom
      : Math.sin(time * 3) * 1 * zoom;

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

  // Sub-building main structure (moves during attack)
  const subShift =
    timeSinceFire < 600
      ? Math.sin((timeSinceFire / 600) * Math.PI * 6) *
        2 *
        zoom *
        (1 - timeSinceFire / 600)
      : 0;
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

  // Gothic windows on sub-building (glow during attack)
  const windowGlowBase = 0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5;
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 2; row++) {
      const winX = screenPos.x + side * 16 * zoom + subShift * 0.5;
      const winY = screenPos.y + 2 + subBounce - row * 8 * zoom;

      // Gothic pointed arch window
      ctx.fillStyle = `rgba(50, 200, 100, ${windowGlowBase})`;
      ctx.beginPath();
      ctx.moveTo(winX - 3 * zoom, winY + 4 * zoom);
      ctx.lineTo(winX - 3 * zoom, winY);
      ctx.quadraticCurveTo(winX, winY - 4 * zoom, winX + 3 * zoom, winY);
      ctx.lineTo(winX + 3 * zoom, winY + 4 * zoom);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Mechanical resonance chambers on sides (animate during attack)
  const chamberPulse = 0.5 + attackPulse;
  for (let side = -1; side <= 1; side += 2) {
    const chamberX =
      screenPos.x +
      side * (subBuildingWidth * 0.4) * zoom +
      subShift * side * 0.3;
    const chamberY = screenPos.y + 8 * zoom + subBounce;
    const chamberRotate =
      timeSinceFire < 600
        ? Math.sin(timeSinceFire / 100) * 0.2 * (1 - timeSinceFire / 600)
        : 0;

    ctx.save();
    ctx.translate(chamberX, chamberY);
    ctx.rotate(chamberRotate * side);

    // Resonance drum
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(0, 0, 6 * zoom, 4 * zoom, 0.3 * side, 0, Math.PI * 2);
    ctx.fill();

    // Glowing membrane
    ctx.fillStyle = `rgba(50, 200, 100, ${chamberPulse})`;
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      4 * zoom * (1 + attackPulse * 0.3),
      2.5 * zoom * (1 + attackPulse * 0.3),
      0.3 * side,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Energy rings during attack
    if (timeSinceFire < 400) {
      const ringPhase = timeSinceFire / 400;
      ctx.strokeStyle = `rgba(50, 200, 100, ${(1 - ringPhase) * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        (6 + ringPhase * 8) * zoom,
        (4 + ringPhase * 5) * zoom,
        0.3 * side,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  // Energy conduit pipes connecting to pillars (pulse during attack)
  const pipeGlow = 0.3 + attackPulse * 0.6;
  ctx.strokeStyle = `rgba(50, 200, 100, ${pipeGlow})`;
  ctx.lineWidth = 2 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    const pipeStartX = screenPos.x + side * 28 * zoom;
    const pipeEndX = screenPos.x + side * (baseWidth * 0.35) * zoom;
    ctx.beginPath();
    ctx.moveTo(pipeStartX + subShift * 0.3, screenPos.y + 9 * zoom + subBounce);
    ctx.quadraticCurveTo(
      screenPos.x + side * 30 * zoom,
      screenPos.y - 5 * zoom,
      pipeEndX - pillarSpread * side * 0.3,
      screenPos.y - 10 * zoom
    );
    ctx.stroke();

    // Pipe energy nodes
    const nodeY = screenPos.y - 2 * zoom;
    ctx.fillStyle = `rgba(50, 200, 100, ${pipeGlow + 0.2})`;
    ctx.beginPath();
    ctx.arc(
      screenPos.x + side * 22 * zoom,
      nodeY,
      2 * zoom * (1 + attackPulse * 0.5),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Tan foundation platform with green tech accents (shifts during attack)
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.5,
    screenPos.y - 18 * zoom,
    //make this platform expand with the pillars
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

  // Green tech panel lines on foundation (flipped)
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse;
  ctx.strokeStyle = `rgba(50, 200, 100, ${panelGlow})`;
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

  // Tan pillars with green tech details - dynamic movement
  const pillarWidth = 14 + tower.level * 2;
  const pillarHeight = 35 + tower.level * 8;
  // Pillars spread outward and bounce during attack
  const pillarX =
    screenPos.x - baseWidth * zoom * 0.35 - archVibrate * 0.3 - pillarSpread;
  const pillarXR =
    screenPos.x + baseWidth * zoom * 0.35 + archVibrate * 0.3 + pillarSpread;
  const pw = pillarWidth * zoom * 0.5;
  const pd = pillarWidth * zoom * 0.25;

  // Left pillar - tan stone (bounces during attack)
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

  // Right pillar - tan stone (bounces opposite direction)
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

  // Green glowing strips on pillars (more intense during attack)
  for (let p of [pillarX + pillarBounce * 0.5, pillarXR - pillarBounce * 0.5]) {
    for (let i = 0; i < tower.level + 1; i++) {
      const stripY =
        screenPos.y -
        20 * zoom -
        pillarHeight * zoom * (0.2 + i * 0.25) -
        pillarBounce;
      const stripGlow =
        0.4 + Math.sin(time * 4 + i * 0.5) * 0.3 + attackPulse * 1.5;

      ctx.fillStyle = `rgba(50, 200, 100, ${stripGlow})`;
      ctx.beginPath();
      ctx.ellipse(
        p - pw * 0.5,
        stripY + pd * 0.2,
        3 * zoom,
        1.5 * zoom,
        0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        p + pw * 0.5,
        stripY + pd * 0.2,
        3 * zoom,
        1.5 * zoom,
        -0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Arch position with lift animation
  const archTopY =
    screenPos.y -
    24 * zoom -
    pillarHeight * zoom -
    6 * zoom +
    archVibrate * 0.5 -
    archLift -
    pillarBounce;
  const archCenterY = archTopY + 8 * zoom;

  // Tan arch structure with green energy conduits (vibrates during attack)
  ctx.strokeStyle = "#a89880";
  ctx.lineWidth = (14 + attackPulse * 4) * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pillarX + pillarBounce * 0.5, archTopY + 8 * zoom);
  ctx.quadraticCurveTo(
    screenPos.x + archVibrate,
    archTopY - 28 * zoom - archLift,
    pillarXR - pillarBounce * 0.5,
    archTopY + 8 * zoom
  );
  ctx.stroke();

  ctx.strokeStyle = "#c8b8a0";
  ctx.lineWidth = (10 + attackPulse * 2) * zoom;
  ctx.beginPath();
  ctx.moveTo(pillarX + pillarBounce * 0.5, archTopY + 6 * zoom);
  ctx.quadraticCurveTo(
    screenPos.x + archVibrate,
    archTopY - 18 * zoom - archLift,
    pillarXR - pillarBounce * 0.5,
    archTopY + 6 * zoom
  );
  ctx.quadraticCurveTo(
    screenPos.x + archVibrate,
    archTopY - 18 * zoom - archLift,
    pillarXR - pillarBounce * 0.5,
    archTopY + 6 * zoom
  );
  ctx.stroke();

  // Green energy conduit along arch (pulses brighter during attack)
  const conduitGlow = 0.5 + Math.sin(time * 5) * 0.3 + attackPulse * 1.5;
  ctx.strokeStyle = `rgba(50, 200, 100, ${conduitGlow})`;
  ctx.lineWidth = (2 + attackPulse * 3) * zoom;
  ctx.beginPath();
  ctx.moveTo(pillarX + pillarBounce * 0.5, archTopY + 4 * zoom);
  ctx.quadraticCurveTo(
    screenPos.x + archVibrate,
    archTopY - 16 * zoom - archLift,
    pillarXR - pillarBounce * 0.5,
    archTopY + 4 * zoom
  );
  ctx.stroke();

  // Tan keystone with green energy core (moves with arch)
  const keystoneY = archTopY - archLift;
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath();
  ctx.moveTo(screenPos.x + archVibrate - 8 * zoom, keystoneY - 10 * zoom);
  ctx.lineTo(screenPos.x + archVibrate, keystoneY - 22 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 8 * zoom, keystoneY - 10 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 6 * zoom, keystoneY - 4 * zoom);
  ctx.lineTo(screenPos.x + archVibrate - 6 * zoom, keystoneY - 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Green keystone energy core
  const coreGrad = ctx.createRadialGradient(
    screenPos.x + archVibrate,
    keystoneY - 12 * zoom,
    0,
    screenPos.x + archVibrate,
    keystoneY - 12 * zoom,
    (5 + attackPulse * 3) * zoom
  );
  const glowColor = isShockwave
    ? "255, 100, 100"
    : isSymphony
    ? "100, 200, 255"
    : "50, 200, 100";
  coreGrad.addColorStop(0, `rgba(${glowColor}, ${conduitGlow})`);
  coreGrad.addColorStop(0.5, `rgba(${glowColor}, ${conduitGlow * 0.5})`);
  coreGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(
    screenPos.x + archVibrate,
    keystoneY - 12 * zoom,
    (5 + attackPulse * 3) * zoom,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Inner portal glow - green tinted (expands during attack)
  const glowIntensity = 0.5 + Math.sin(time * 3) * 0.3 + attackPulse;
  const portalSizeX = 22 * zoom + portalExpand;
  const portalSizeY = 30 * zoom + portalExpand * 1.2;

  const portalGrad = ctx.createRadialGradient(
    screenPos.x,
    archCenterY,
    0,
    screenPos.x,
    archCenterY,
    portalSizeY
  );
  portalGrad.addColorStop(0, `rgba(${glowColor}, ${glowIntensity * 0.5})`);
  portalGrad.addColorStop(0.5, `rgba(${glowColor}, ${glowIntensity * 0.25})`);
  portalGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = portalGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    archCenterY,
    portalSizeX,
    portalSizeY,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Holographic scanlines in portal
  ctx.strokeStyle = `rgba(${glowColor}, ${glowIntensity * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  for (let sl = 0; sl < 8; sl++) {
    const sly = archCenterY - 20 * zoom + sl * 5 * zoom;
    const slw = 18 - Math.abs(sl - 4) * 3;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - slw * zoom, sly);
    ctx.lineTo(screenPos.x + slw * zoom, sly);
    ctx.stroke();
  }

  // Sound/energy waves - intensified during attack
  const waveCount = tower.level + 2;
  for (let i = 0; i < waveCount; i++) {
    const wavePhase = (time * 2 + i * 0.3) % 1;
    const waveRadius = 10 + wavePhase * 50;
    const waveAlpha =
      0.6 * (1 - wavePhase) * (glowIntensity + attackPulse * 0.5);

    ctx.strokeStyle = `rgba(${glowColor}, ${waveAlpha})`;
    ctx.lineWidth = (3 - wavePhase * 2) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      archCenterY - 5 * zoom,
      waveRadius * zoom * 0.8,
      waveRadius * zoom * 0.4,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Attack burst effect at portal center
  if (timeSinceFire < 300) {
    const burstPhase = timeSinceFire / 300;
    const burstAlpha = (1 - burstPhase) * 0.8;
    const burstSize = 15 + burstPhase * 20;

    ctx.fillStyle = `rgba(${glowColor}, ${burstAlpha})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 15 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, archCenterY, burstSize * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Expanding ring
    ctx.strokeStyle = `rgba(${glowColor}, ${burstAlpha * 0.5})`;
    ctx.lineWidth = 3 * zoom * (1 - burstPhase);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      archCenterY - 5 * zoom,
      (20 + burstPhase * 40) * zoom,
      (10 + burstPhase * 20) * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Floating music notes around the arch (ambient)
  const particleCount = 6 + tower.level;
  for (let i = 0; i < particleCount; i++) {
    const notePhase = (time * 1.2 + i * 0.4) % 3;
    const noteAngle = (i / particleCount) * Math.PI * 2 + time * 0.6;
    const noteRadius = 22 + Math.sin(notePhase * Math.PI) * 12;
    const noteX = screenPos.x + Math.cos(noteAngle) * noteRadius * zoom * 0.9;
    const noteY =
      archCenterY -
      8 * zoom +
      Math.sin(noteAngle) * noteRadius * zoom * 0.45 -
      notePhase * 10 * zoom;
    const noteAlpha = Math.max(0, 1 - notePhase / 3) * 0.7;

    if (noteAlpha > 0.1) {
      // Draw music notes
      ctx.fillStyle = `rgba(${glowColor}, ${noteAlpha})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 4 * zoom;
      ctx.font = `${(10 + Math.sin(time * 4 + i) * 2) * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const symbols = ["♪", "♫", "♬", "♩", "𝄞"];
      ctx.fillText(symbols[i % 5], noteX, noteY);
      ctx.shadowBlur = 0;

      // Note trail
      ctx.strokeStyle = `rgba(${glowColor}, ${noteAlpha * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(noteX, noteY);
      ctx.lineTo(
        noteX + Math.cos(noteAngle + Math.PI) * 10 * zoom,
        noteY + Math.sin(noteAngle + Math.PI) * 5 * zoom
      );
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

  // Sci-fi foundation with gold accents
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

  // Right side gear
  if (tower.level >= 2) {
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
  }

  // ========== GOLD COIN CONVEYOR ==========
  if (tower.level >= 2) {
    // Conveyor track
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.7, screenPos.y + 4 * zoom);
    ctx.lineTo(screenPos.x + w * 0.1, screenPos.y - h * 0.3);
    ctx.stroke();

    // Animated gold coins on conveyor
    for (let c = 0; c < 3; c++) {
      const coinPhase = (time * 0.6 + c * 0.33) % 1;
      const coinX = screenPos.x - w * 0.7 + w * 0.8 * coinPhase;
      const coinY = screenPos.y + 4 * zoom - (h * 0.3 + 4) * coinPhase;

      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.ellipse(coinX, coinY, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ========== GOLD STORAGE VAULT ==========
  // Vault door on front face
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y - h * 0.25,
    8 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Vault spokes
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 2 * zoom;
  for (let spoke = 0; spoke < 6; spoke++) {
    const spokeAngle = (spoke / 6) * Math.PI * 2 + time * 0.5;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y - h * 0.25);
    ctx.lineTo(
      screenPos.x + Math.cos(spokeAngle) * 6 * zoom,
      screenPos.y - h * 0.25 + Math.sin(spokeAngle) * 8 * zoom
    );
    ctx.stroke();
  }

  // Vault center (glowing gold)
  const vaultGlow = 0.6 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = `rgba(255, 215, 0, ${vaultGlow})`;
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y - h * 0.25, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tech panel lines (flipped orientation)
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2;
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
    2.5,
    time,
    zoom,
    "rgb(255, 215, 0)"
  );

  if (tower.level >= 2) {
    drawEnergyTube(
      ctx,
      screenPos.x + w * 0.5,
      screenPos.y + 2 * zoom,
      screenPos.x + w * 0.35,
      screenPos.y - h * 0.65,
      2.5,
      time + 0.4,
      zoom,
      "rgb(255, 200, 50)"
    );
  }

  // Glowing resource vents with enhanced glow
  for (let i = 0; i < tower.level; i++) {
    const ventY = screenPos.y - h * 0.3 - i * 12 * zoom;
    const ventGlow = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3;

    ctx.shadowColor = "#00ff66";
    ctx.shadowBlur = 6 * zoom;
    ctx.fillStyle = `rgba(0, 255, 100, ${ventGlow})`;
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

  // ========== ENHANCED ROOF WITH GOLD DOME ==========
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

  // Gold dome top
  const domeGrad = ctx.createRadialGradient(
    screenPos.x - 3 * zoom,
    topY - 20 * zoom,
    0,
    screenPos.x,
    topY - 15 * zoom,
    12 * zoom
  );
  domeGrad.addColorStop(0, "#fff8dc");
  domeGrad.addColorStop(0.3, "#c9a227");
  domeGrad.addColorStop(0.7, "#daa520");
  domeGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - 15 * zoom,
    10 * zoom,
    6 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Data screens as windows (enhanced)
  const screenGlow = 0.6 + Math.sin(time * 2) * 0.2;
  ctx.fillStyle = "#0a1a10";
  ctx.fillRect(
    screenPos.x - 12 * zoom,
    screenPos.y - baseHeight * zoom * 0.6,
    10 * zoom,
    12 * zoom
  );
  ctx.fillRect(
    screenPos.x + 2 * zoom,
    screenPos.y - baseHeight * zoom * 0.6,
    10 * zoom,
    12 * zoom
  );

  ctx.fillStyle = `rgba(0, 255, 100, ${screenGlow})`;
  ctx.fillRect(
    screenPos.x - 11 * zoom,
    screenPos.y - baseHeight * zoom * 0.6 + 1 * zoom,
    8 * zoom,
    10 * zoom
  );
  ctx.fillRect(
    screenPos.x + 3 * zoom,
    screenPos.y - baseHeight * zoom * 0.6 + 1 * zoom,
    8 * zoom,
    10 * zoom
  );

  // Stock ticker on screens
  ctx.fillStyle = "#0a2a1a";
  for (let i = 0; i < 3; i++) {
    const barY =
      screenPos.y - baseHeight * zoom * 0.6 + 3 * zoom + i * 3 * zoom;
    const barW = 3 + Math.sin(time * 8 + i) * 2;
    ctx.fillRect(screenPos.x - 10 * zoom, barY, barW * zoom, 2 * zoom);
    ctx.fillRect(screenPos.x + 4 * zoom, barY, (barW + 1) * zoom, 2 * zoom);
  }

  // ========== WARNING LIGHTS ==========
  drawWarningLight(
    ctx,
    screenPos.x - w * 0.8,
    screenPos.y - h * 0.1,
    2.5,
    time,
    zoom,
    "#00ff66",
    4
  );
  if (tower.level >= 2) {
    drawWarningLight(
      ctx,
      screenPos.x + w * 0.8,
      screenPos.y - h * 0.15,
      2.5,
      time + 0.5,
      zoom,
      "#c9a227",
      3
    );
  }

  // ========== HOLOGRAPHIC CREDIT DISPLAY (enhanced) ==========
  const coinY = topY - 32 * zoom + Math.sin(time * 3) * 5 * zoom;

  // Multiple rotating rings
  for (let ring = 0; ring < 2 + tower.level; ring++) {
    const ringAlpha = 0.3 - ring * 0.08;
    const ringSize = 18 + ring * 4;
    ctx.strokeStyle = `rgba(255, 215, 0, ${
      ringAlpha + Math.sin(time * 4 + ring) * 0.1
    })`;
    ctx.lineWidth = 2 * zoom;
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
  creditGrad.addColorStop(0, `rgba(255, 255, 200, 0.9)`);
  creditGrad.addColorStop(0.3, `rgba(255, 215, 0, 0.7)`);
  creditGrad.addColorStop(0.6, `rgba(218, 165, 32, 0.4)`);
  creditGrad.addColorStop(1, `rgba(184, 134, 11, 0)`);
  ctx.fillStyle = creditGrad;
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 20 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, 14 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Credit symbol (Princeton P with paw)
  ctx.fillStyle = "#4a3a1a";
  ctx.font = `bold ${16 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", 0, 0);
  ctx.restore();

  // ========== GOLD PARTICLE FOUNTAIN ==========
  for (let i = 0; i < tower.level + 3; i++) {
    const pPhase = (time * 2.5 + i * 0.25) % 1;
    const pY = coinY + 10 * zoom - pPhase * h * 0.6;
    const pX = screenPos.x + Math.sin(time * 4 + i * 2.5) * 12 * zoom;
    const pAlpha = Math.sin(pPhase * Math.PI) * 0.7;
    const pSize = 2 + Math.sin(time * 6 + i) * 1;

    ctx.fillStyle = `rgba(255, 215, 0, ${pAlpha})`;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(pX, pY, pSize * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Level 3+ upgrade visuals
  if (tower.level >= 3) {
    if (tower.upgrade === "A") {
      // Investment Fund - holographic stock chart (enhanced)
      ctx.strokeStyle = "#00ff66";
      ctx.lineWidth = 3 * zoom;
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 20 * zoom, topY - 40 * zoom);
      ctx.lineTo(screenPos.x - 8 * zoom, topY - 55 * zoom);
      ctx.lineTo(screenPos.x + 4 * zoom, topY - 48 * zoom);
      ctx.lineTo(screenPos.x + 20 * zoom, topY - 65 * zoom);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Arrow head
      ctx.fillStyle = "#00ff66";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 20 * zoom, topY - 65 * zoom);
      ctx.lineTo(screenPos.x + 14 * zoom, topY - 62 * zoom);
      ctx.lineTo(screenPos.x + 16 * zoom, topY - 56 * zoom);
      ctx.closePath();
      ctx.fill();

      // Data points with glow
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 6 * zoom;
      ctx.fillStyle = `rgba(0, 255, 100, 0.9)`;
      ctx.beginPath();
      ctx.arc(
        screenPos.x - 6 * zoom,
        topY - 48 * zoom,
        3 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        screenPos.x + 6 * zoom,
        topY - 41 * zoom,
        3 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else if (tower.upgrade === "B") {
      // Recruitment Center - personnel hologram
      ctx.fillStyle = "#0a2a1a";
      ctx.fillRect(
        screenPos.x - 22 * zoom,
        topY - 48 * zoom,
        16 * zoom,
        16 * zoom
      );

      // Personnel icon
      ctx.fillStyle = `rgba(0, 255, 100, ${0.6 + Math.sin(time * 3) * 0.2})`;
      ctx.beginPath();
      ctx.arc(
        screenPos.x - 14 * zoom,
        topY - 42 * zoom,
        4 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillRect(
        screenPos.x - 18 * zoom,
        topY - 38 * zoom,
        8 * zoom,
        6 * zoom
      );

      // Status bar
      ctx.fillStyle = "#0a2a1a";
      ctx.fillRect(
        screenPos.x + 6 * zoom,
        topY - 50 * zoom,
        16 * zoom,
        18 * zoom
      );
      ctx.fillStyle = "#00ff66";
      ctx.fillRect(
        screenPos.x + 8 * zoom,
        topY - 48 * zoom,
        12 * zoom * (0.5 + Math.sin(time * 2) * 0.3),
        4 * zoom
      );
      ctx.fillRect(
        screenPos.x + 8 * zoom,
        topY - 42 * zoom,
        12 * zoom * (0.7 + Math.sin(time * 2.5) * 0.2),
        4 * zoom
      );
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
    // BARRACKS BASE - Wooden military camp platform
    // Bottom dirt layer
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 14 * zoom,
      baseW + 18,
      baseD + 16,
      8,
      "#4a3a2a",
      "#3a2a1a",
      "#2a1a0a"
    );
    // Wooden plank platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 6 * zoom,
      baseW + 10,
      baseD + 9,
      6,
      "#6b5030",
      "#5a4020",
      "#4a3010"
    );
    // Top wooden deck
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 2,
      baseD + 2,
      4,
      "#8b7355",
      "#7a6244",
      "#695133"
    );

    // Wood grain lines on top
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 0.8 * zoom;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - isoW + 10 * zoom,
        screenPos.y + i * 3 * zoom - 4 * zoom
      );
      ctx.lineTo(
        screenPos.x + isoW - 10 * zoom,
        screenPos.y + i * 3 * zoom - 4 * zoom
      );
      ctx.stroke();
    }

    // Small weapon rack (left side)
    const rackX = screenPos.x - isoW * 0.6;
    const rackY = screenPos.y + 6 * zoom;
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
    const crateY = screenPos.y + 4 * zoom;
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
  } else if (tower.level === 2) {
    // GARRISON BASE - Stone military platform
    // Foundation stone
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 14 * zoom,
      baseW + 20,
      baseD + 18,
      10,
      "#4a4a52",
      "#3a3a42",
      "#2a2a32"
    );
    // Cobblestone layer
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 6 * zoom,
      baseW + 12,
      baseD + 10,
      7,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42"
    );
    // Top stone platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 4,
      baseD + 4,
      5,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52"
    );

    // Cobblestone pattern
    ctx.fillStyle = "#5a5a62";
    for (let i = -2; i <= 2; i++) {
      for (let j = -1; j <= 1; j++) {
        const sx = screenPos.x + i * 8 * zoom + (j % 2) * 4 * zoom;
        const sy = screenPos.y + j * 4 * zoom - 4 * zoom;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 3 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

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
  } else if (tower.level === 3) {
    // FORTRESS BASE - Heavy stone fortress platform
    // Deep foundation
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 16 * zoom,
      baseW + 24,
      baseD + 20,
      12,
      "#3a3a42",
      "#2a2a32",
      "#1a1a22"
    );
    // Stone wall layer
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 14,
      baseD + 12,
      8,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42"
    );
    // Top fortress platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 6,
      baseD + 6,
      6,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52"
    );

    // Stone brick pattern
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = -2; i <= 2; i++) {
      const offset = i % 2 === 0 ? 0 : 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - isoW + offset,
        screenPos.y + i * 3 * zoom - 4 * zoom
      );
      ctx.lineTo(
        screenPos.x + isoW - offset,
        screenPos.y + i * 3 * zoom - 4 * zoom
      );
      ctx.stroke();
    }

    // Mini battlements on corners
    for (const side of [-1, 1]) {
      drawIsometricPrism(
        ctx,
        screenPos.x + side * isoW * 0.7,
        screenPos.y + side * 2 * zoom,
        5,
        4,
        6,
        { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
        zoom
      );
    }

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
  } else if (tower.level === 4 && tower.upgrade === "A") {
    // ROYAL STABLE BASE - Marble Greek platform with gold accents
    // Foundation marble
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 16 * zoom,
      baseW + 26,
      baseD + 22,
      12,
      "#d0ccc4",
      "#c0bcb4",
      "#b0aca4"
    );
    // Middle marble tier
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 16,
      baseD + 14,
      8,
      "#e0dcd4",
      "#d0ccc4",
      "#c0bcb4"
    );
    // Top marble platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 8,
      baseD + 8,
      6,
      "#f0ece4",
      "#e0dcd4",
      "#d0ccc4"
    );

    // Gold edge trim
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 2 * zoom);
    ctx.lineTo(screenPos.x + isoW + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Greek meander pattern on edge
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 1 * zoom;
    for (let i = -3; i <= 3; i++) {
      const px = screenPos.x + i * 8 * zoom;
      const py = screenPos.y + Math.abs(i) * 0.5 * zoom - 2 * zoom;
      ctx.beginPath();
      ctx.rect(px - 2 * zoom, py - 2 * zoom, 4 * zoom, 4 * zoom);
      ctx.stroke();
    }

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
    // ROYAL CASTLE BASE - Grand royal platform with gold and royal insignia
    // Deep royal foundation
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 16 * zoom,
      baseW + 26,
      baseD + 22,
      14,
      "#3a3a42",
      "#2a2a32",
      "#1a1a22"
    );
    // Royal stone tier
    drawIsoDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 16,
      baseD + 14,
      9,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42"
    );
    // Top royal platform
    drawIsoDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 8,
      baseD + 8,
      6,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52"
    );

    // Gold edge trim
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

    // Royal carpet pattern
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 8 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + 4 * zoom);
    ctx.lineTo(screenPos.x + 8 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 8 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

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
      bX + 10 * zoom,
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
      bX + 10 * zoom,
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
      bX + 10 * zoom + smokeOff1,
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
    drawClockFace(towerX - 3 * zoom, towerY - 30 * zoom, 6 * zoom);

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
      bY + 16 * zoom,
      42,
      36,
      12,
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

    // Main keep (central building)
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      32,
      26,
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
    const keepTop = bY - 32 * zoom;
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) {
        drawIsometricPrism(
          ctx,
          bX - 12 * zoom + i * 6 * zoom,
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

    // Right clock tower (taller) with machinery
    const rtX = bX + 16 * zoom;
    const rtY = bY + 4 * zoom;
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
    drawClockFace(rtX - 3 * zoom, rtY - 32 * zoom, 6 * zoom, true);

    // Grand portcullis entrance
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.moveTo(bX - 8 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 8 * zoom, bY - 18 * zoom);
    ctx.arc(bX - 3 * zoom, bY - 18 * zoom, 5 * zoom, Math.PI, 0);
    ctx.lineTo(bX + 2 * zoom, bY - 2 * zoom);
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
    ctx.fillText("CENTAUR STABLES", bX, bY + 19 * zoom);
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
    ctx.fillText("ROYAL CAVALRY", bX, bY + 19 * zoom);
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

  // "ON TIME" sign board
  const signX = screenPos.x + 30 * zoom;
  const signY = screenPos.y - 15 * zoom;

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
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 3 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 2.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 2.5 * zoom, stackPos.y - 10 * zoom);
      ctx.lineTo(stackPos.x + 3 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
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

  // Use more subtle colors for hover state
  if (tower.isHovered) {
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
// ENEMY RENDERING
// ============================================================================
export function renderEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  selectedMap: string,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const worldPos = getEnemyPosition(enemy, selectedMap);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const eData = ENEMY_DATA[enemy.type];
  const time = Date.now() / 1000;
  const spawnAlpha = Math.min(1, enemy.spawnProgress);
  if (spawnAlpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = spawnAlpha;

  const size = eData.size * zoom;
  const isFlying = eData.flying;
  const floatOffset = isFlying ? Math.sin(time * 3) * 10 * zoom : 0;
  const bobOffset = Math.sin(time * 5 + enemy.pathIndex) * 2 * zoom;
  const drawY =
    screenPos.y -
    size / 2 -
    floatOffset -
    bobOffset -
    (isFlying ? 35 * zoom : 0);

  // Shadow
  ctx.fillStyle = `rgba(0,0,0,${0.35 * spawnAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 5 * zoom,
    size * 0.6,
    size * 0.3,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Status effects glow
  if (enemy.frozen) {
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 18 * zoom;
  } else if (enemy.slowEffect > 0) {
    ctx.shadowColor = "#8a2be2";
    ctx.shadowBlur = 12 * zoom;
  } else if (Date.now() < enemy.stunUntil) {
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 14 * zoom;
  } else if (enemy.burning) {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 10 * zoom;
  }

  const flashIntensity = enemy.damageFlash > 0 ? enemy.damageFlash / 200 : 0;

  drawEnemySprite(
    ctx,
    screenPos.x,
    drawY,
    size,
    enemy.type,
    eData.color,
    flashIntensity,
    time,
    isFlying,
    zoom
  );

  ctx.shadowBlur = 0;

  // Frozen overlay
  if (enemy.frozen) {
    ctx.fillStyle = "rgba(150, 220, 255, 0.35)";
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.75, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 0.3;
      const cx = screenPos.x + Math.cos(angle) * size * 0.55;
      const cy = drawY + Math.sin(angle) * size * 0.3;
      const crystalSize = (4 + Math.sin(time * 3 + i) * 2) * zoom;

      ctx.fillStyle = "rgba(200, 240, 255, 0.8)";
      ctx.beginPath();
      ctx.moveTo(cx, cy - crystalSize);
      ctx.lineTo(cx + crystalSize * 0.5, cy);
      ctx.lineTo(cx, cy + crystalSize * 0.6);
      ctx.lineTo(cx - crystalSize * 0.5, cy);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Burning effect
  if (enemy.burning) {
    for (let i = 0; i < 5; i++) {
      const flamePhase = (time * 3 + i * 0.7) % 1;
      const flameX = screenPos.x + Math.sin(time * 5 + i * 2) * size * 0.3;
      const flameY = drawY - size * 0.4 - flamePhase * size * 0.7;
      const flameSize = (1 - flamePhase) * 6 * zoom;

      const flameGrad = ctx.createRadialGradient(
        flameX,
        flameY,
        0,
        flameX,
        flameY,
        flameSize
      );
      flameGrad.addColorStop(
        0,
        `rgba(255, 255, 100, ${(1 - flamePhase) * 0.9})`
      );
      flameGrad.addColorStop(
        0.4,
        `rgba(200, 120, 0, ${(1 - flamePhase) * 0.7})`
      );
      flameGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Slowed effect
  if (
    enemy.slowed &&
    enemy.slowIntensity &&
    enemy.slowIntensity > 0 &&
    !enemy.frozen
  ) {
    const slowIntensity = enemy.slowIntensity;
    ctx.strokeStyle = `rgba(138, 43, 226, ${0.5 * slowIntensity})`;
    ctx.lineWidth = 2 * zoom;
    for (let i = 0; i < 2; i++) {
      const spiralAngle = time * 3 + i * Math.PI;
      ctx.beginPath();
      for (let t = 0; t < Math.PI * 1.5; t += 0.2) {
        const spiralR = size * 0.3 * (1 - t / (Math.PI * 3));
        const sx = screenPos.x + Math.cos(spiralAngle + t) * spiralR * 0.7;
        const sy =
          drawY + Math.sin(spiralAngle + t) * spiralR * 0.35 - size * 0.15;
        if (t === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
  }

  // Stunned effect
  if (Date.now() < enemy.stunUntil && !enemy.frozen) {
    const starCount = 3;
    ctx.fillStyle = "rgba(255, 255, 0, 0.9)";
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 8 * zoom;
    for (let i = 0; i < starCount; i++) {
      const starAngle = time * 4 + (i / starCount) * Math.PI * 2;
      const starRadius = size * 0.5;
      const sx = screenPos.x + Math.cos(starAngle) * starRadius * 0.7;
      const sy = drawY - size * 0.65 + Math.sin(starAngle) * starRadius * 0.25;
      const starSize = 5 * zoom;

      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = j % 2 === 0 ? starSize : starSize * 0.4;
        const px = sx + Math.cos(angle) * r;
        const py = sy + Math.sin(angle) * r;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // HP Bar
  if (enemy.hp < enemy.maxHp) {
    const barWidth = size * 1.3;
    const barHeight = 5 * zoom;
    const barY = drawY - size * 0.9;

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(
      screenPos.x - barWidth / 2 - 1,
      barY - 1,
      barWidth + 2,
      barHeight + 2
    );
    ctx.fillStyle = "#333";
    ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth, barHeight);

    const hpPercent = enemy.hp / enemy.maxHp;
    const hpColor =
      hpPercent > 0.5 ? "#4ade80" : hpPercent > 0.25 ? "#fbbf24" : "#ef4444";
    ctx.fillStyle = hpColor;
    ctx.fillRect(
      screenPos.x - barWidth / 2,
      barY,
      barWidth * hpPercent,
      barHeight
    );
  }

  ctx.restore();
}

function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  color: string,
  flash: number,
  time: number,
  isFlying: boolean,
  zoom: number
) {
  const bodyColor = flash > 0 ? lightenColor(color, flash * 100) : color;
  const bodyColorDark = darkenColor(bodyColor, 30);
  const bodyColorLight = lightenColor(bodyColor, 20);

  // Draw different enemy types with unique epic designs
  switch (type) {
    case "freshman":
    case "frosh":
      drawFreshmanEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "sophomore":
      drawSophomoreEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "junior":
      drawJuniorEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "senior":
      drawSeniorEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "gradstudent":
      drawGradStudentEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "professor":
      drawProfessorEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "dean":
      drawDeanEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "trustee":
      drawTrusteeEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "mascot":
      drawMascotEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom,
        isFlying
      );
      break;
    case "archer":
      drawArcherEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "mage":
      drawMageEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "catapult":
      drawCatapultEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    // New ranged enemies
    case "warlock":
      drawWarlockEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "crossbowman":
      drawCrossbowmanEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "hexer":
      drawHexerEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    // New flying enemies
    case "harpy":
      drawHarpyEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "wyvern":
      drawWyvernEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "specter":
      drawSpecterEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    // New ground enemies
    case "berserker":
      drawBerserkerEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "golem":
      drawGolemEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "necromancer":
      drawNecromancerEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    case "shadow_knight":
      drawShadowKnightEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
      break;
    default:
      drawDefaultEnemy(
        ctx,
        x,
        y,
        size,
        bodyColor,
        bodyColorDark,
        bodyColorLight,
        time,
        zoom
      );
  }
}

function drawFreshmanEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // CORRUPTED INITIATE - Possessed first-year with dark energy and floating tome
  const bobble = Math.sin(time * 6) * 2 * zoom;
  const pulseIntensity = 0.5 + Math.sin(time * 4) * 0.3;
  const runeGlow = 0.6 + Math.sin(time * 5) * 0.4;

  // Dark corruption aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.7);
  auraGrad.addColorStop(0, `rgba(74, 222, 128, ${pulseIntensity * 0.25})`);
  auraGrad.addColorStop(0.5, `rgba(34, 197, 94, ${pulseIntensity * 0.12})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Floating energy particles
  for (let i = 0; i < 5; i++) {
    const particleAngle = time * 2 + i * Math.PI * 0.4;
    const particleDist = size * 0.4 + Math.sin(time * 3 + i) * size * 0.1;
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y - size * 0.1 + Math.sin(particleAngle) * particleDist * 0.4;
    ctx.fillStyle = `rgba(74, 222, 128, ${0.4 + Math.sin(time * 4 + i) * 0.2})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow beneath
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floating forbidden tome (behind)
  ctx.save();
  ctx.translate(x - size * 0.35, y - size * 0.1 + Math.sin(time * 3) * 3);
  ctx.rotate(Math.sin(time * 2) * 0.1);
  ctx.fillStyle = "#1a0a2a";
  ctx.fillRect(-size * 0.12, -size * 0.15, size * 0.24, size * 0.3);
  ctx.fillStyle = "#2a1a4a";
  ctx.fillRect(-size * 0.1, -size * 0.13, size * 0.2, size * 0.26);
  // Glowing pages
  ctx.fillStyle = `rgba(74, 222, 128, ${runeGlow * 0.5})`;
  ctx.fillRect(-size * 0.08, -size * 0.1, size * 0.16, size * 0.2);
  // Ancient runes
  ctx.fillStyle = `rgba(74, 222, 128, ${runeGlow})`;
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ᛟᚨᛏ", 0, 0);
  ctx.restore();

  // Tattered robes (corrupted orange/green)
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  robeGrad.addColorStop(0, "#2a4a2a");
  robeGrad.addColorStop(0.3, "#4a7a4a");
  robeGrad.addColorStop(0.5, "#5a9a5a");
  robeGrad.addColorStop(0.7, "#4a7a4a");
  robeGrad.addColorStop(1, "#2a4a2a");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.45);
  ctx.quadraticCurveTo(
    x - size * 0.38,
    y - size * 0.05,
    x - size * 0.16,
    y - size * 0.28
  );
  ctx.lineTo(x + size * 0.16, y - size * 0.28);
  ctx.quadraticCurveTo(
    x + size * 0.38,
    y - size * 0.05,
    x + size * 0.32,
    y + size * 0.45
  );
  // Tattered bottom
  for (let i = 0; i < 5; i++) {
    const jagX = x - size * 0.32 + i * size * 0.16;
    const jagY =
      y +
      size * 0.45 +
      Math.sin(time * 3 + i) * size * 0.03 +
      (i % 2) * size * 0.05;
    ctx.lineTo(jagX, jagY);
  }
  ctx.closePath();
  ctx.fill();

  // Corruption veins on robe
  ctx.strokeStyle = `rgba(74, 222, 128, ${pulseIntensity * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.1,
    y + size * 0.1,
    x - size * 0.2,
    y + size * 0.3
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y);
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y + size * 0.2,
    x + size * 0.08,
    y + size * 0.35
  );
  ctx.stroke();

  // Hood casting deep shadow
  ctx.fillStyle = "#1a2a1a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.32 + bobble * 0.3,
    size * 0.26,
    size * 0.18,
    0,
    Math.PI,
    0
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, y - size * 0.32 + bobble * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.3,
    y - size * 0.1,
    x - size * 0.22,
    y + size * 0.05
  );
  ctx.lineTo(x - size * 0.16, y - size * 0.15);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.26, y - size * 0.32 + bobble * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.3,
    y - size * 0.1,
    x + size * 0.22,
    y + size * 0.05
  );
  ctx.lineTo(x + size * 0.16, y - size * 0.15);
  ctx.fill();

  // Face (pale, corrupted in shadow)
  ctx.fillStyle = "#c8e8c8";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.38 + bobble, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Corruption marks on face
  ctx.strokeStyle = "#3a8a3a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.32 + bobble);
  ctx.lineTo(x - size * 0.08, y - size * 0.25 + bobble);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.35 + bobble);
  ctx.lineTo(x + size * 0.12, y - size * 0.28 + bobble);
  ctx.stroke();

  // Possessed glowing eyes
  ctx.fillStyle = "#4ade80";
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.4 + bobble,
    size * 0.04,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.07,
    y - size * 0.4 + bobble,
    size * 0.04,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Dark pupils
  ctx.fillStyle = "#0a2a0a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.4 + bobble,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.07,
    y - size * 0.4 + bobble,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Grimacing mouth with fangs
  ctx.fillStyle = "#1a2a1a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.28 + bobble,
    size * 0.06,
    size * 0.03,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#e0e0e0";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.28 + bobble);
  ctx.lineTo(x - size * 0.02, y - size * 0.24 + bobble);
  ctx.lineTo(x - size * 0.01, y - size * 0.28 + bobble);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.03, y - size * 0.28 + bobble);
  ctx.lineTo(x + size * 0.02, y - size * 0.24 + bobble);
  ctx.lineTo(x + size * 0.01, y - size * 0.28 + bobble);
  ctx.fill();

  // Magical energy swirling from hands
  ctx.strokeStyle = `rgba(74, 222, 128, ${pulseIntensity})`;
  ctx.lineWidth = 2 * zoom;
  const handX = x + size * 0.25;
  const handY = y + size * 0.1;
  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 2 + ring * 0.3) % 1;
    ctx.globalAlpha = 1 - ringPhase;
    ctx.beginPath();
    ctx.arc(
      handX,
      handY,
      size * 0.05 + ringPhase * size * 0.15,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawSophomoreEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // ARROGANT APPRENTICE - Cocky spellcaster with elemental aura and confidence
  const swagger = Math.sin(time * 5) * 3 * zoom;
  const magicPulse = 0.6 + Math.sin(time * 4) * 0.4;

  // Blue elemental aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.65);
  auraGrad.addColorStop(0, `rgba(96, 165, 250, ${magicPulse * 0.2})`);
  auraGrad.addColorStop(0.6, `rgba(59, 130, 246, ${magicPulse * 0.1})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // Floating arcane symbols
  for (let i = 0; i < 4; i++) {
    const symbolAngle = time * 1.5 + i * Math.PI * 0.5;
    const symbolDist = size * 0.45;
    const sx = x + Math.cos(symbolAngle) * symbolDist;
    const sy = y - size * 0.1 + Math.sin(symbolAngle) * symbolDist * 0.35;
    ctx.fillStyle = `rgba(96, 165, 250, ${0.4 + Math.sin(time * 3 + i) * 0.2})`;
    ctx.font = `${size * 0.1}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["◇", "△", "○", "☆"][i], sx, sy);
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.32, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flowing apprentice robes
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y
  );
  robeGrad.addColorStop(0, "#1e3a5f");
  robeGrad.addColorStop(0.3, "#2563eb");
  robeGrad.addColorStop(0.5, "#3b82f6");
  robeGrad.addColorStop(0.7, "#2563eb");
  robeGrad.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.48);
  ctx.quadraticCurveTo(
    x - size * 0.4,
    y,
    x - size * 0.2,
    y - size * 0.3 + swagger * 0.2
  );
  ctx.lineTo(x + size * 0.2, y - size * 0.3 + swagger * 0.2);
  ctx.quadraticCurveTo(x + size * 0.4, y, x + size * 0.35, y + size * 0.48);
  ctx.closePath();
  ctx.fill();

  // Robe silver trim
  ctx.strokeStyle = "#c0c0c0";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.25 + swagger * 0.2);
  ctx.lineTo(x - size * 0.15, y + size * 0.35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.25 + swagger * 0.2);
  ctx.lineTo(x + size * 0.15, y + size * 0.35);
  ctx.stroke();

  // Apprentice sash
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.1);
  ctx.quadraticCurveTo(x, y + size * 0.05, x + size * 0.25, y - size * 0.1);
  ctx.lineTo(x + size * 0.22, y);
  ctx.quadraticCurveTo(x, y + size * 0.15, x - size * 0.22, y);
  ctx.fill();

  // Confident face
  ctx.fillStyle = "#fcd9b6";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + swagger * 0.15, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Stylish swept hair
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.52 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.3,
    y - size * 0.7,
    x - size * 0.05,
    y - size * 0.68 + swagger * 0.15
  );
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y - size * 0.72,
    x + size * 0.25,
    y - size * 0.58 + swagger * 0.15
  );
  ctx.quadraticCurveTo(
    x + size * 0.22,
    y - size * 0.48,
    x + size * 0.18,
    y - size * 0.5 + swagger * 0.15
  );
  ctx.lineTo(x - size * 0.18, y - size * 0.5 + swagger * 0.15);
  ctx.fill();
  // Hair highlight
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.62 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.05,
    y - size * 0.68,
    x + size * 0.15,
    y - size * 0.6 + swagger * 0.15
  );
  ctx.stroke();

  // Confident glowing eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.44 + swagger * 0.15,
    size * 0.055,
    size * 0.065,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.44 + swagger * 0.15,
    size * 0.055,
    size * 0.065,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Blue magical pupils
  ctx.fillStyle = "#3b82f6";
  ctx.shadowColor = "#3b82f6";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.44 + swagger * 0.15,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.44 + swagger * 0.15,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Cocky raised eyebrow
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.52 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.08,
    y - size * 0.54,
    x - size * 0.02,
    y - size * 0.5 + swagger * 0.15
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.52 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.1,
    y - size * 0.56,
    x + size * 0.14,
    y - size * 0.5 + swagger * 0.15
  );
  ctx.stroke();

  // Smug smirk
  ctx.strokeStyle = "#a16207";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.32 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.02,
    y - size * 0.28,
    x + size * 0.08,
    y - size * 0.34 + swagger * 0.15
  );
  ctx.stroke();

  // Glowing spell orb in hand
  ctx.fillStyle = `rgba(59, 130, 246, ${magicPulse})`;
  ctx.shadowColor = "#3b82f6";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.38, y + swagger * 0.1, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Inner bright core
  ctx.fillStyle = "#dbeafe";
  ctx.beginPath();
  ctx.arc(x + size * 0.38, y + swagger * 0.1, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Energy wisps
  ctx.strokeStyle = `rgba(147, 197, 253, ${magicPulse})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const wispAngle = time * 4 + i * Math.PI * 0.67;
    ctx.beginPath();
    ctx.arc(
      x + size * 0.38,
      y + swagger * 0.1,
      size * 0.12 + i * size * 0.03,
      wispAngle,
      wispAngle + Math.PI * 0.5
    );
    ctx.stroke();
  }
}

function drawJuniorEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // HAUNTED SCHOLAR - Tormented by forbidden knowledge with floating tomes
  const twitch = Math.sin(time * 8) * 2 * zoom;
  const madnessPulse = 0.5 + Math.sin(time * 5) * 0.3;
  const bookFloat = Math.sin(time * 2) * 3;

  // Purple madness aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.7);
  auraGrad.addColorStop(0, `rgba(192, 132, 252, ${madnessPulse * 0.25})`);
  auraGrad.addColorStop(0.5, `rgba(147, 51, 234, ${madnessPulse * 0.12})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Floating ancient tomes orbiting
  for (let i = 0; i < 3; i++) {
    const bookAngle = time * 1.2 + i * Math.PI * 0.67;
    const bookDist = size * 0.5;
    const bx = x + Math.cos(bookAngle) * bookDist;
    const by =
      y - size * 0.05 + Math.sin(bookAngle) * bookDist * 0.3 + bookFloat;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(Math.sin(time * 2 + i) * 0.2);
    // Book
    ctx.fillStyle = ["#4a0a2a", "#0a2a4a", "#2a0a4a"][i];
    ctx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.16);
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(-size * 0.05, -size * 0.07, size * 0.1, size * 0.14);
    // Glowing runes
    ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse})`;
    ctx.font = `${size * 0.06}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("◈", 0, size * 0.02);
    ctx.restore();
  }

  // Knowledge tendrils reaching from head
  ctx.strokeStyle = `rgba(147, 51, 234, ${madnessPulse * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    const tendrilAngle = -Math.PI * 0.6 + i * Math.PI * 0.3;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(tendrilAngle) * size * 0.15,
      y - size * 0.5 + twitch * 0.3
    );
    ctx.quadraticCurveTo(
      x +
        Math.cos(tendrilAngle) * size * 0.35 +
        Math.sin(time * 3 + i) * size * 0.1,
      y - size * 0.6 - i * size * 0.05,
      x + Math.cos(tendrilAngle) * size * 0.45,
      y - size * 0.7 + Math.sin(time * 4 + i) * size * 0.1
    );
    ctx.stroke();
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.32, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Disheveled scholar robes
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y
  );
  robeGrad.addColorStop(0, "#3b0764");
  robeGrad.addColorStop(0.3, "#6b21a8");
  robeGrad.addColorStop(0.5, "#7c3aed");
  robeGrad.addColorStop(0.7, "#6b21a8");
  robeGrad.addColorStop(1, "#3b0764");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.48);
  ctx.quadraticCurveTo(x - size * 0.38, y, x - size * 0.18, y - size * 0.3);
  ctx.lineTo(x + size * 0.18, y - size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.38, y, x + size * 0.32, y + size * 0.48);
  ctx.closePath();
  ctx.fill();

  // Torn and tattered edges
  ctx.strokeStyle = "#581c87";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    const tearX = x - size * 0.28 + i * size * 0.11;
    const tearY = y + size * 0.45 + Math.sin(time * 2 + i) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(tearX, tearY);
    ctx.lineTo(tearX + size * 0.03, tearY + size * 0.08);
    ctx.stroke();
  }

  // Ancient symbols on robe
  ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.6})`;
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⍟", x, y + size * 0.1);
  ctx.fillText("⌘", x - size * 0.15, y + size * 0.25);
  ctx.fillText("⌬", x + size * 0.15, y + size * 0.2);

  // Cracked spectacles floating slightly askew
  ctx.save();
  ctx.translate(x, y - size * 0.44 + twitch * 0.2);
  ctx.rotate(0.05 + Math.sin(time * 3) * 0.03);
  ctx.strokeStyle = "#6b7280";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.rect(-size * 0.17, -size * 0.06, size * 0.13, size * 0.1);
  ctx.rect(size * 0.04, -size * 0.06, size * 0.13, size * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.01);
  ctx.lineTo(size * 0.04, -size * 0.01);
  ctx.stroke();
  // Crack in lens
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.04);
  ctx.lineTo(-size * 0.08, size * 0.02);
  ctx.lineTo(-size * 0.12, size * 0.03);
  ctx.stroke();
  ctx.restore();

  // Gaunt, haunted face
  ctx.fillStyle = "#ddd6fe";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + twitch * 0.2, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Sunken cheeks
  ctx.fillStyle = "rgba(91, 33, 182, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    y - size * 0.35 + twitch * 0.2,
    size * 0.04,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.12,
    y - size * 0.35 + twitch * 0.2,
    size * 0.04,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Wide, terrified eyes with purple glow
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.44 + twitch * 0.2,
    size * 0.055,
    size * 0.07,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.44 + twitch * 0.2,
    size * 0.055,
    size * 0.07,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Purple irises with knowledge symbols
  ctx.fillStyle = "#7c3aed";
  ctx.shadowColor = "#7c3aed";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.1,
    y - size * 0.44 + twitch * 0.2,
    size * 0.035,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.1,
    y - size * 0.44 + twitch * 0.2,
    size * 0.035,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  // Tiny pupils (dilated from madness)
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.1,
    y - size * 0.44 + twitch * 0.2,
    size * 0.012,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.1,
    y - size * 0.44 + twitch * 0.2,
    size * 0.012,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Dark circles under eyes
  ctx.fillStyle = "rgba(91, 33, 182, 0.5)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.38 + twitch * 0.2,
    size * 0.05,
    size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.38 + twitch * 0.2,
    size * 0.05,
    size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Wild, unkempt hair with gray streaks
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.56 + twitch * 0.2,
    size * 0.2,
    size * 0.1,
    0,
    0,
    Math.PI
  );
  ctx.fill();
  // Wild strands
  for (let i = 0; i < 8; i++) {
    const hairAngle = -Math.PI * 0.4 + i * Math.PI * 0.1;
    ctx.strokeStyle = i % 3 === 0 ? "#6b7280" : "#1e1b4b";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(hairAngle) * size * 0.15,
      y - size * 0.55 + twitch * 0.2
    );
    ctx.quadraticCurveTo(
      x +
        Math.cos(hairAngle) * size * 0.25 +
        Math.sin(time * 4 + i) * size * 0.05,
      y - size * 0.7 + twitch * 0.2,
      x + Math.cos(hairAngle + 0.2) * size * 0.22,
      y - size * 0.72 + twitch * 0.2 + Math.sin(time * 5 + i) * size * 0.03
    );
    ctx.stroke();
  }

  // Trembling grimace
  ctx.strokeStyle = "#6b21a8";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.3 + twitch * 0.2);
  ctx.lineTo(x - size * 0.04, y - size * 0.28 + twitch * 0.2);
  ctx.lineTo(x, y - size * 0.3 + twitch * 0.2);
  ctx.lineTo(x + size * 0.04, y - size * 0.28 + twitch * 0.2);
  ctx.lineTo(x + size * 0.08, y - size * 0.3 + twitch * 0.2);
  ctx.stroke();
}

function drawSeniorEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // SHADOW GRADUATE - Confident dark magic user with living graduation cloak
  const strut = Math.sin(time * 4) * 2 * zoom;
  const cloakWave = Math.sin(time * 3) * 0.1;
  const powerPulse = 0.6 + Math.sin(time * 4) * 0.4;

  // Pink/magenta power aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.7);
  auraGrad.addColorStop(0, `rgba(244, 114, 182, ${powerPulse * 0.25})`);
  auraGrad.addColorStop(0.5, `rgba(219, 39, 119, ${powerPulse * 0.12})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Floating shadow wisps
  for (let i = 0; i < 4; i++) {
    const wispX = x + Math.sin(time * 2 + i * 1.5) * size * 0.4;
    const wispY = y + size * 0.3 + Math.cos(time * 2 + i) * size * 0.1;
    ctx.fillStyle = `rgba(31, 41, 55, ${0.3 + Math.sin(time * 3 + i) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(
      wispX,
      wispY,
      size * 0.08,
      size * 0.04,
      time + i,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Living graduation cloak (flows and shifts)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(cloakWave);
  const cloakGrad = ctx.createLinearGradient(
    -size * 0.4,
    -size * 0.3,
    size * 0.4,
    size * 0.5
  );
  cloakGrad.addColorStop(0, "#1f2937");
  cloakGrad.addColorStop(0.3, "#111827");
  cloakGrad.addColorStop(0.5, "#1f2937");
  cloakGrad.addColorStop(0.7, "#111827");
  cloakGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = cloakGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.38, size * 0.5);
  // Flowing bottom edge
  for (let i = 0; i < 6; i++) {
    const waveX = -size * 0.38 + i * size * 0.152;
    const waveY = size * 0.5 + Math.sin(time * 4 + i) * size * 0.04;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(size * 0.45, 0, size * 0.22, -size * 0.32 + strut * 0.1);
  ctx.lineTo(-size * 0.22, -size * 0.32 + strut * 0.1);
  ctx.quadraticCurveTo(-size * 0.45, 0, -size * 0.38, size * 0.5);
  ctx.fill();
  ctx.restore();

  // Pink/gold trim on cloak
  ctx.strokeStyle = "#f472b6";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.28 + strut * 0.1);
  ctx.lineTo(x - size * 0.2, y + size * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.28 + strut * 0.1);
  ctx.lineTo(x + size * 0.2, y + size * 0.4);
  ctx.stroke();

  // Graduation stole with arcane symbols
  ctx.fillStyle = "#f472b6";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.25 + strut * 0.1);
  ctx.lineTo(x - size * 0.15, y + size * 0.35);
  ctx.lineTo(x - size * 0.08, y + size * 0.35);
  ctx.lineTo(x - size * 0.05, y - size * 0.2 + strut * 0.1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.25 + strut * 0.1);
  ctx.lineTo(x + size * 0.15, y + size * 0.35);
  ctx.lineTo(x + size * 0.08, y + size * 0.35);
  ctx.lineTo(x + size * 0.05, y - size * 0.2 + strut * 0.1);
  ctx.fill();
  // Symbols on stole
  ctx.fillStyle = "#fdf4ff";
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("☆", x - size * 0.11, y + size * 0.1);
  ctx.fillText("◇", x + size * 0.11, y + size * 0.15);

  // Confident face
  ctx.fillStyle = "#fce7f3";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + strut * 0.15, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Stylish dark hair
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.52 + strut * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.25,
    y - size * 0.68,
    x,
    y - size * 0.7 + strut * 0.15
  );
  ctx.quadraticCurveTo(
    x + size * 0.25,
    y - size * 0.68,
    x + size * 0.18,
    y - size * 0.52 + strut * 0.15
  );
  ctx.lineTo(x + size * 0.16, y - size * 0.48 + strut * 0.15);
  ctx.lineTo(x - size * 0.16, y - size * 0.48 + strut * 0.15);
  ctx.fill();

  // Mortarboard (floating slightly)
  ctx.fillStyle = "#1f2937";
  ctx.save();
  ctx.translate(x, y - size * 0.65 + strut * 0.15 + Math.sin(time * 2) * 2);
  ctx.rotate(Math.sin(time * 1.5) * 0.05);
  // Board
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, 0);
  ctx.lineTo(0, -size * 0.08);
  ctx.lineTo(size * 0.22, 0);
  ctx.lineTo(0, size * 0.08);
  ctx.closePath();
  ctx.fill();
  // Cap base
  ctx.fillStyle = "#374151";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.02, size * 0.12, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tassel (pink, magical)
  ctx.strokeStyle = "#f472b6";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.04);
  ctx.quadraticCurveTo(
    size * 0.15 + Math.sin(time * 4) * size * 0.05,
    size * 0.08,
    size * 0.12,
    size * 0.2
  );
  ctx.stroke();
  ctx.fillStyle = "#f472b6";
  ctx.beginPath();
  ctx.arc(size * 0.12, size * 0.22, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Confident glowing eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.07,
    y - size * 0.44 + strut * 0.15,
    size * 0.045,
    size * 0.055,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.07,
    y - size * 0.44 + strut * 0.15,
    size * 0.045,
    size * 0.055,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#db2777";
  ctx.shadowColor = "#db2777";
  ctx.shadowBlur = 5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.44 + strut * 0.15,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.07,
    y - size * 0.44 + strut * 0.15,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Knowing smirk
  ctx.strokeStyle = "#9d174d";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.02,
    y - size * 0.34 + strut * 0.15,
    size * 0.06,
    0.15 * Math.PI,
    0.85 * Math.PI
  );
  ctx.stroke();

  // Glowing diploma/scroll of power
  ctx.save();
  ctx.translate(x + size * 0.4, y + size * 0.05 + strut * 0.1);
  ctx.rotate(0.3 + Math.sin(time * 2) * 0.1);
  ctx.fillStyle = "#fdf4ff";
  ctx.fillRect(-size * 0.04, -size * 0.18, size * 0.08, size * 0.36);
  // Magical glow
  ctx.strokeStyle = `rgba(244, 114, 182, ${powerPulse})`;
  ctx.lineWidth = 2 * zoom;
  ctx.strokeRect(-size * 0.05, -size * 0.19, size * 0.1, size * 0.38);
  // Seal
  ctx.fillStyle = "#db2777";
  ctx.beginPath();
  ctx.arc(0, size * 0.12, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGradStudentEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // ELDRITCH RESEARCHER - Sleep-deprived horror with sanity-breaking research
  const exhaustionSway = Math.sin(time * 1.5) * 4 * zoom;
  const insanityPulse = 0.5 + Math.sin(time * 6) * 0.3;
  const eyeTwitch = Math.sin(time * 12) * 0.5;

  // Unstable reality aura (warped space around them)
  ctx.strokeStyle = `rgba(251, 146, 60, ${insanityPulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 3; i++) {
    const warpPhase = (time + i * 0.5) % 2;
    const warpSize = size * 0.4 + warpPhase * size * 0.3;
    ctx.globalAlpha = 0.4 * (1 - warpPhase / 2);
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      warpSize,
      warpSize * 0.6,
      Math.sin(time + i) * 0.2,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Floating research papers (chaotic)
  for (let i = 0; i < 5; i++) {
    const paperAngle = time * 0.8 + i * Math.PI * 0.4;
    const paperDist = size * 0.45 + Math.sin(time * 2 + i) * size * 0.1;
    const px = x + Math.cos(paperAngle) * paperDist;
    const py = y - size * 0.1 + Math.sin(paperAngle) * paperDist * 0.4;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(time * 3 + i) * 0.5);
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(-size * 0.05, -size * 0.06, size * 0.1, size * 0.12);
    // Illegible scrawl
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 0.5 * zoom;
    for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.04, -size * 0.04 + j * size * 0.025);
      ctx.lineTo(size * 0.04, -size * 0.04 + j * size * 0.025);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tattered lab coat (stained)
  const coatGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y
  );
  coatGrad.addColorStop(0, "#d4d4d4");
  coatGrad.addColorStop(0.3, "#f5f5f5");
  coatGrad.addColorStop(0.5, "#ffffff");
  coatGrad.addColorStop(0.7, "#f5f5f5");
  coatGrad.addColorStop(1, "#d4d4d4");
  ctx.fillStyle = coatGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.5);
  ctx.quadraticCurveTo(
    x - size * 0.4,
    y,
    x - size * 0.2,
    y - size * 0.3 + exhaustionSway * 0.1
  );
  ctx.lineTo(x + size * 0.2, y - size * 0.3 + exhaustionSway * 0.1);
  ctx.quadraticCurveTo(x + size * 0.4, y, x + size * 0.35, y + size * 0.5);
  ctx.closePath();
  ctx.fill();

  // Coffee stains on coat
  ctx.fillStyle = "rgba(120, 53, 15, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    y + size * 0.15,
    size * 0.08,
    size * 0.1,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    y + size * 0.05,
    size * 0.06,
    size * 0.07,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Mysterious substance stains (glowing)
  ctx.fillStyle = `rgba(74, 222, 128, ${insanityPulse * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.18,
    y + size * 0.25,
    size * 0.04,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Pocket with pens (chaotically arranged)
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(x - size * 0.22, y - size * 0.15, size * 0.12, size * 0.02);
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(x - size * 0.2 + i * size * 0.03, y - size * 0.12);
    ctx.rotate(-0.3 + Math.sin(time * 2 + i) * 0.2);
    ctx.fillRect(-size * 0.01, -size * 0.1, size * 0.02, size * 0.1);
    ctx.restore();
  }

  // Gaunt, exhausted face
  ctx.save();
  ctx.translate(x, y - size * 0.42 + exhaustionSway * 0.15);
  ctx.rotate(exhaustionSway * 0.02);

  ctx.fillStyle = "#fef9c3";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Sunken cheeks
  ctx.fillStyle = "rgba(120, 53, 15, 0.15)";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.12,
    size * 0.02,
    size * 0.05,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    size * 0.12,
    size * 0.02,
    size * 0.05,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Scraggly beard
  ctx.fillStyle = "#78716c";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.12, size * 0.08, 0, 0, Math.PI);
  ctx.fill();
  // Stubble texture
  ctx.fillStyle = "#57534e";
  for (let i = 0; i < 12; i++) {
    const stubX = -size * 0.1 + (i % 4) * size * 0.065;
    const stubY = size * 0.05 + Math.floor(i / 4) * size * 0.04;
    ctx.fillRect(stubX, stubY, size * 0.01, size * 0.02);
  }

  // Bloodshot, twitching eyes
  ctx.fillStyle = "#fef2f2";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.08 + eyeTwitch,
    -size * 0.02,
    size * 0.055,
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    size * 0.08 + eyeTwitch,
    -size * 0.02,
    size * 0.055,
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Bloodshot veins
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 0.5 * zoom;
  for (let eye = 0; eye < 2; eye++) {
    const ex = eye === 0 ? -size * 0.08 : size * 0.08;
    for (let v = 0; v < 3; v++) {
      ctx.beginPath();
      ctx.moveTo(ex + eyeTwitch + (v - 1) * size * 0.02, -size * 0.02);
      ctx.lineTo(ex + eyeTwitch + (v - 1) * size * 0.035, -size * 0.04);
      ctx.stroke();
    }
  }
  // Dilated pupils (caffeine overdose)
  ctx.fillStyle = "#fb923c";
  ctx.shadowColor = "#fb923c";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(-size * 0.08 + eyeTwitch, -size * 0.02, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.08 + eyeTwitch, -size * 0.02, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Tiny pinprick pupils
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(-size * 0.08 + eyeTwitch, -size * 0.02, size * 0.008, 0, Math.PI * 2);
  ctx.arc(size * 0.08 + eyeTwitch, -size * 0.02, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Massive dark circles
  ctx.fillStyle = "rgba(88, 28, 135, 0.5)";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.08,
    size * 0.04,
    size * 0.06,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    size * 0.08,
    size * 0.04,
    size * 0.06,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Droopy eyelids
  ctx.fillStyle = "#fef9c3";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.08,
    -size * 0.05,
    size * 0.06,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    size * 0.08,
    -size * 0.05,
    size * 0.06,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Wild, unkempt hair
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.14, size * 0.2, size * 0.1, 0, 0, Math.PI);
  ctx.fill();
  // Chaotic strands
  for (let i = 0; i < 10; i++) {
    const hairAngle = -Math.PI * 0.5 + i * Math.PI * 0.1;
    ctx.strokeStyle = i % 3 === 0 ? "#9ca3af" : "#44403c";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(Math.cos(hairAngle) * size * 0.15, -size * 0.14);
    ctx.quadraticCurveTo(
      Math.cos(hairAngle) * size * 0.25 + Math.sin(time * 5 + i) * size * 0.08,
      -size * 0.28 + Math.sin(time * 3 + i) * size * 0.05,
      Math.cos(hairAngle + 0.3) * size * 0.2,
      -size * 0.32 + Math.sin(time * 4 + i) * size * 0.06
    );
    ctx.stroke();
  }

  ctx.restore();

  // GIANT coffee cup (essential for survival)
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(
    x + size * 0.35,
    y - size * 0.2 + exhaustionSway * 0.1,
    size * 0.18,
    size * 0.35
  );
  ctx.fillStyle = "#78350f";
  ctx.fillRect(
    x + size * 0.36,
    y - size * 0.16 + exhaustionSway * 0.1,
    size * 0.16,
    size * 0.12
  );
  // Steam (excessive)
  ctx.strokeStyle = `rgba(251, 146, 60, ${0.4 + Math.sin(time * 4) * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    const steamPhase = (time * 2 + i * 0.3) % 1.5;
    ctx.beginPath();
    ctx.moveTo(
      x + size * 0.38 + i * size * 0.03,
      y - size * 0.22 + exhaustionSway * 0.1
    );
    ctx.quadraticCurveTo(
      x + size * 0.42 + i * size * 0.03 + Math.sin(time * 5 + i) * 5,
      y - size * 0.35 - steamPhase * size * 0.15,
      x + size * 0.38 + i * size * 0.03,
      y - size * 0.5 - steamPhase * size * 0.1
    );
    ctx.stroke();
  }
}

function drawProfessorEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // ARCHLICH PROFESSOR - Ancient undead lecturer with arcane knowledge
  const hover = Math.sin(time * 2) * 3 * zoom;
  const powerPulse = 0.6 + Math.sin(time * 3) * 0.4;
  const lectureGesture = Math.sin(time * 2.5) * 0.2;

  // Red/crimson power aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.75);
  auraGrad.addColorStop(0, `rgba(239, 68, 68, ${powerPulse * 0.3})`);
  auraGrad.addColorStop(0.5, `rgba(185, 28, 28, ${powerPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Floating lecture notes (spectral)
  for (let i = 0; i < 4; i++) {
    const noteAngle = time * 1 + i * Math.PI * 0.5;
    const noteDist = size * 0.5;
    const nx = x + Math.cos(noteAngle) * noteDist;
    const ny = y - size * 0.1 + Math.sin(noteAngle) * noteDist * 0.35 + hover;
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(Math.sin(time * 2 + i) * 0.15);
    ctx.fillStyle = `rgba(254, 243, 199, ${
      0.5 + Math.sin(time * 3 + i) * 0.2
    })`;
    ctx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.16);
    // Arcane equations
    ctx.strokeStyle = `rgba(185, 28, 28, ${powerPulse})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, -size * 0.04);
    ctx.lineTo(size * 0.04, -size * 0.04);
    ctx.moveTo(-size * 0.03, 0);
    ctx.lineTo(size * 0.03, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Shadow (weakened by undeath)
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ancient tweed robes (tattered, elegant)
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y,
    x + size * 0.4,
    y
  );
  robeGrad.addColorStop(0, "#44403c");
  robeGrad.addColorStop(0.3, "#78716c");
  robeGrad.addColorStop(0.5, "#a8a29e");
  robeGrad.addColorStop(0.7, "#78716c");
  robeGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5);
  // Tattered bottom
  for (let i = 0; i < 6; i++) {
    const jagX = x - size * 0.38 + i * size * 0.152;
    const jagY =
      y +
      size * 0.5 +
      Math.sin(time * 3 + i) * size * 0.03 +
      (i % 2) * size * 0.04;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.45,
    y,
    x + size * 0.22,
    y - size * 0.32 + hover * 0.2
  );
  ctx.lineTo(x - size * 0.22, y - size * 0.32 + hover * 0.2);
  ctx.quadraticCurveTo(x - size * 0.45, y, x - size * 0.38, y + size * 0.5);
  ctx.fill();

  // Elbow patches (leather, worn)
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.38,
    y + size * 0.08 + hover * 0.1,
    size * 0.07,
    size * 0.1,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.38,
    y + size * 0.08 + hover * 0.1,
    size * 0.07,
    size * 0.1,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Crimson academic hood/collar
  ctx.fillStyle = "#b91c1c";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.28 + hover * 0.2);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.15 + hover * 0.2,
    x + size * 0.15,
    y - size * 0.28 + hover * 0.2
  );
  ctx.lineTo(x + size * 0.12, y + size * 0.1);
  ctx.quadraticCurveTo(x, y + size * 0.2, x - size * 0.12, y + size * 0.1);
  ctx.fill();
  // Ancient sigil on collar
  ctx.fillStyle = `rgba(254, 243, 199, ${powerPulse})`;
  ctx.font = `${size * 0.1}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⚗", x, y - size * 0.05 + hover * 0.2);

  // Bow tie (crimson, ethereal)
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22 + hover * 0.2);
  ctx.lineTo(x - size * 0.1, y - size * 0.26 + hover * 0.2);
  ctx.lineTo(x - size * 0.1, y - size * 0.18 + hover * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22 + hover * 0.2);
  ctx.lineTo(x + size * 0.1, y - size * 0.26 + hover * 0.2);
  ctx.lineTo(x + size * 0.1, y - size * 0.18 + hover * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - size * 0.22 + hover * 0.2, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Skeletal face with preserved flesh
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.48 + hover, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Sunken, preserved features
  ctx.fillStyle = "rgba(68, 64, 60, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.42 + hover,
    size * 0.04,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.42 + hover,
    size * 0.04,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Ancient spectacles (gold, ornate)
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.5 + hover, size * 0.07, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.5 + hover, size * 0.07, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.5 + hover);
  ctx.lineTo(x + size * 0.03, y - size * 0.5 + hover);
  ctx.moveTo(x - size * 0.17, y - size * 0.5 + hover);
  ctx.lineTo(x - size * 0.22, y - size * 0.48 + hover);
  ctx.moveTo(x + size * 0.17, y - size * 0.5 + hover);
  ctx.lineTo(x + size * 0.22, y - size * 0.48 + hover);
  ctx.stroke();

  // Glowing red eyes behind spectacles
  ctx.fillStyle = "#ef4444";
  ctx.shadowColor = "#ef4444";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.5 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.5 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Distinguished but wispy white hair
  ctx.fillStyle = "#e7e5e4";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.62 + hover,
    size * 0.18,
    size * 0.08,
    0,
    0,
    Math.PI
  );
  ctx.fill();
  // Side tufts
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.2,
    y - size * 0.48 + hover,
    size * 0.06,
    size * 0.12,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.2,
    y - size * 0.48 + hover,
    size * 0.06,
    size * 0.12,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Wispy strands
  ctx.strokeStyle = "#d6d3d1";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1 + i * size * 0.05, y - size * 0.64 + hover);
    ctx.quadraticCurveTo(
      x - size * 0.1 + i * size * 0.05 + Math.sin(time * 2 + i) * size * 0.03,
      y - size * 0.72 + hover,
      x - size * 0.08 + i * size * 0.05,
      y - size * 0.7 + hover
    );
    ctx.stroke();
  }

  // Bushy ethereal eyebrows
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.58 + hover,
    size * 0.06,
    size * 0.025,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.58 + hover,
    size * 0.06,
    size * 0.025,
    0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Knowing skeletal smile
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.38 + hover,
    size * 0.06,
    0.1 * Math.PI,
    0.9 * Math.PI
  );
  ctx.fill();
  ctx.fillStyle = "#e7e5e4";
  ctx.fillRect(
    x - size * 0.05,
    y - size * 0.38 + hover,
    size * 0.1,
    size * 0.02
  );

  // Lecturing skeletal hand
  ctx.save();
  ctx.translate(x - size * 0.45, y - size * 0.1 + hover);
  ctx.rotate(-0.4 + lectureGesture);
  // Skeletal hand
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pointing finger bone
  ctx.fillRect(-size * 0.02, -size * 0.18, size * 0.04, size * 0.18);
  // Magical spark at fingertip
  ctx.fillStyle = `rgba(239, 68, 68, ${powerPulse})`;
  ctx.shadowColor = "#ef4444";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Ancient tome floating beside
  ctx.save();
  ctx.translate(
    x + size * 0.42,
    y - size * 0.15 + hover + Math.sin(time * 2.5) * 3
  );
  ctx.rotate(Math.sin(time * 1.5) * 0.1);
  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(-size * 0.08, -size * 0.1, size * 0.16, size * 0.2);
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.16);
  // Glowing text
  ctx.fillStyle = `rgba(239, 68, 68, ${powerPulse})`;
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("∑∫", 0, size * 0.02);
  ctx.restore();
}

function drawDeanEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // DARK OVERLORD DEAN - Imposing figure with reality-warping presence
  const hover = Math.sin(time * 1.5) * 4 * zoom;
  const powerPulse = 0.6 + Math.sin(time * 3) * 0.4;
  const realityWarp = Math.sin(time * 2) * 0.05;

  // Reality distortion aura
  ctx.strokeStyle = `rgba(168, 85, 247, ${powerPulse * 0.5})`;
  ctx.lineWidth = 3 * zoom;
  for (let i = 0; i < 3; i++) {
    const warpPhase = (time * 0.5 + i * 0.5) % 2;
    const warpSize = size * 0.5 + warpPhase * size * 0.4;
    ctx.globalAlpha = 0.5 * (1 - warpPhase / 2);
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const r = warpSize + Math.sin(a * 6 + time * 3) * size * 0.05;
      const wx = x + Math.cos(a) * r;
      const wy = y + Math.sin(a) * r * 0.6;
      if (a === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Purple void aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  auraGrad.addColorStop(0, `rgba(168, 85, 247, ${powerPulse * 0.35})`);
  auraGrad.addColorStop(0.5, `rgba(91, 33, 182, ${powerPulse * 0.18})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Floating void shards
  for (let i = 0; i < 6; i++) {
    const shardAngle = time * 0.8 + (i * Math.PI) / 3;
    const shardDist = size * 0.55 + Math.sin(time * 2 + i) * size * 0.08;
    const sx = x + Math.cos(shardAngle) * shardDist;
    const sy =
      y - size * 0.1 + Math.sin(shardAngle) * shardDist * 0.4 + hover * 0.5;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(time * 2 + i);
    ctx.fillStyle = `rgba(168, 85, 247, ${0.5 + Math.sin(time * 3 + i) * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.04);
    ctx.lineTo(size * 0.02, 0);
    ctx.lineTo(0, size * 0.04);
    ctx.lineTo(-size * 0.02, 0);
    ctx.fill();
    ctx.restore();
  }

  // Void shadow beneath (darker, larger)
  ctx.fillStyle = "rgba(30, 10, 60, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magnificent flowing robes
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(realityWarp);
  const robeGrad = ctx.createLinearGradient(
    -size * 0.45,
    -size * 0.4,
    size * 0.45,
    size * 0.55
  );
  robeGrad.addColorStop(0, "#1e1b4b");
  robeGrad.addColorStop(0.3, "#312e81");
  robeGrad.addColorStop(0.5, "#3730a3");
  robeGrad.addColorStop(0.7, "#312e81");
  robeGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, size * 0.55);
  // Flowing bottom edge
  for (let i = 0; i < 8; i++) {
    const waveX = -size * 0.45 + i * size * 0.1125;
    const waveY =
      size * 0.55 +
      Math.sin(time * 3 + i) * size * 0.04 +
      (i % 2) * size * 0.03;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    size * 0.55,
    0,
    size * 0.28,
    -size * 0.38 + hover * 0.15
  );
  ctx.lineTo(-size * 0.28, -size * 0.38 + hover * 0.15);
  ctx.quadraticCurveTo(-size * 0.55, 0, -size * 0.45, size * 0.55);
  ctx.fill();
  ctx.restore();

  // Gold and purple trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.32 + hover * 0.15);
  ctx.lineTo(x - size * 0.22, y + size * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.32 + hover * 0.15);
  ctx.lineTo(x + size * 0.22, y + size * 0.45);
  ctx.stroke();

  // Ornate academic collar with gems
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.32 + hover * 0.15);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.18 + hover * 0.15,
    x + size * 0.22,
    y - size * 0.32 + hover * 0.15
  );
  ctx.lineTo(x + size * 0.18, y - size * 0.1 + hover * 0.15);
  ctx.quadraticCurveTo(
    x,
    y + hover * 0.15,
    x - size * 0.18,
    y - size * 0.1 + hover * 0.15
  );
  ctx.fill();
  // Central gem
  ctx.fillStyle = "#a855f7";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.15 + hover * 0.15, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Commanding face
  ctx.fillStyle = "#e9d5ff";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52 + hover, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Distinguished but otherworldly features
  ctx.fillStyle = "rgba(91, 33, 182, 0.15)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    y - size * 0.46 + hover,
    size * 0.04,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.12,
    y - size * 0.46 + hover,
    size * 0.04,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Glowing eyes of authority
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.54 + hover,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.54 + hover,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#a855f7";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.54 + hover,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.54 + hover,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Stern furrowed brows
  ctx.strokeStyle = "#6b21a8";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.58 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.08,
    y - size * 0.62,
    x - size * 0.02,
    y - size * 0.6 + hover
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.58 + hover);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y - size * 0.62,
    x + size * 0.02,
    y - size * 0.6 + hover
  );
  ctx.stroke();

  // Stern line mouth
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.42 + hover);
  ctx.lineTo(x + size * 0.08, y - size * 0.42 + hover);
  ctx.stroke();

  // Elaborate mortarboard (floating with power)
  ctx.save();
  ctx.translate(x, y - size * 0.72 + hover + Math.sin(time * 2) * 3);
  ctx.rotate(Math.sin(time * 1.5) * 0.03);
  // Cap base
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.04, size * 0.2, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  // Diamond-shaped board
  ctx.fillStyle = "#312e81";
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, 0);
  ctx.lineTo(0, -size * 0.1);
  ctx.lineTo(size * 0.25, 0);
  ctx.lineTo(0, size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Golden border
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Power gem on top
  ctx.fillStyle = "#a855f7";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Ornate tassel
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(
    size * 0.18 + Math.sin(time * 4) * size * 0.05,
    size * 0.12,
    size * 0.15,
    size * 0.25
  );
  ctx.stroke();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(size * 0.15, size * 0.27, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Tassel threads
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.15, size * 0.29);
    ctx.lineTo(
      size * 0.12 + i * size * 0.015 + Math.sin(time * 5 + i) * size * 0.01,
      size * 0.38
    );
    ctx.stroke();
  }
  ctx.restore();

  // Staff of office (scepter of power)
  ctx.save();
  ctx.translate(x + size * 0.45, y - size * 0.1 + hover);
  ctx.rotate(0.15 + Math.sin(time * 2) * 0.05);
  // Staff body
  ctx.fillStyle = "#1e1b4b";
  ctx.fillRect(-size * 0.025, -size * 0.35, size * 0.05, size * 0.7);
  // Gold rings
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.035, -size * 0.3, size * 0.07, size * 0.04);
  ctx.fillRect(-size * 0.035, 0, size * 0.07, size * 0.04);
  ctx.fillRect(-size * 0.035, size * 0.25, size * 0.07, size * 0.04);
  // Crown top
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.35);
  ctx.lineTo(-size * 0.04, -size * 0.45);
  ctx.lineTo(0, -size * 0.38);
  ctx.lineTo(size * 0.04, -size * 0.45);
  ctx.lineTo(size * 0.06, -size * 0.35);
  ctx.closePath();
  ctx.fill();
  // Power orb
  ctx.fillStyle = "#a855f7";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.5, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawMascotEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  isFlying: boolean
) {
  // CHAOS GRIFFIN - Fierce rival beast with blazing aura and spectral flames
  const swoop = Math.sin(time * 4) * 4 * zoom;
  const wingFlap = Math.sin(time * 10) * 0.45;
  const firePulse = 0.6 + Math.sin(time * 6) * 0.4;

  // Blazing chaos aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
  auraGrad.addColorStop(0, `rgba(34, 211, 238, ${firePulse * 0.35})`);
  auraGrad.addColorStop(0.4, `rgba(6, 182, 212, ${firePulse * 0.2})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Spectral fire particles
  for (let i = 0; i < 8; i++) {
    const particlePhase = (time * 2 + i * 0.3) % 1.5;
    const px = x + Math.sin(time * 3 + i * 1.2) * size * 0.4;
    const py = y + size * 0.2 - particlePhase * size * 0.5;
    ctx.fillStyle = `rgba(34, 211, 238, ${(1 - particlePhase / 1.5) * 0.6})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.03 * (1 - particlePhase / 2), 0, Math.PI * 2);
    ctx.fill();
  }

  // Wing shadow below (if flying)
  if (isFlying) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.7, size * 0.6, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Magnificent wings
  if (isFlying) {
    // Left wing (ethereal, feathered)
    ctx.save();
    ctx.translate(x - size * 0.25, y - size * 0.1 + swoop * 0.3);
    ctx.rotate(-0.4 - wingFlap);
    const wingGradL = ctx.createLinearGradient(0, 0, -size * 0.8, 0);
    wingGradL.addColorStop(0, "#0891b2");
    wingGradL.addColorStop(0.5, "#06b6d4");
    wingGradL.addColorStop(1, "#22d3ee");
    ctx.fillStyle = wingGradL;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-size * 0.3, -size * 0.4, -size * 0.7, -size * 0.25);
    ctx.lineTo(-size * 0.8, -size * 0.15);
    ctx.lineTo(-size * 0.65, -size * 0.05);
    ctx.lineTo(-size * 0.75, size * 0.05);
    ctx.lineTo(-size * 0.55, size * 0.08);
    ctx.lineTo(-size * 0.6, size * 0.18);
    ctx.lineTo(-size * 0.35, size * 0.12);
    ctx.quadraticCurveTo(-size * 0.15, size * 0.15, 0, size * 0.1);
    ctx.closePath();
    ctx.fill();
    // Wing feather details
    ctx.strokeStyle = "#67e8f9";
    ctx.lineWidth = 1.5 * zoom;
    for (let f = 0; f < 5; f++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.1 - f * size * 0.12, size * 0.05);
      ctx.lineTo(-size * 0.2 - f * size * 0.14, -size * 0.15);
      ctx.stroke();
    }
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.translate(x + size * 0.25, y - size * 0.1 + swoop * 0.3);
    ctx.rotate(0.4 + wingFlap);
    const wingGradR = ctx.createLinearGradient(0, 0, size * 0.8, 0);
    wingGradR.addColorStop(0, "#0891b2");
    wingGradR.addColorStop(0.5, "#06b6d4");
    wingGradR.addColorStop(1, "#22d3ee");
    ctx.fillStyle = wingGradR;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.4, size * 0.7, -size * 0.25);
    ctx.lineTo(size * 0.8, -size * 0.15);
    ctx.lineTo(size * 0.65, -size * 0.05);
    ctx.lineTo(size * 0.75, size * 0.05);
    ctx.lineTo(size * 0.55, size * 0.08);
    ctx.lineTo(size * 0.6, size * 0.18);
    ctx.lineTo(size * 0.35, size * 0.12);
    ctx.quadraticCurveTo(size * 0.15, size * 0.15, 0, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Tail (flaming)
  ctx.save();
  ctx.translate(x + size * 0.25, y + size * 0.2 + swoop * 0.2);
  ctx.rotate(Math.sin(time * 4) * 0.3);
  ctx.fillStyle = "#0891b2";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.3, size * 0.1, size * 0.5, 0);
  ctx.quadraticCurveTo(size * 0.3, -size * 0.05, 0, -size * 0.05);
  ctx.fill();
  // Tail flames
  for (let i = 0; i < 3; i++) {
    const flameY = Math.sin(time * 6 + i) * size * 0.05;
    ctx.fillStyle = `rgba(103, 232, 249, ${0.6 - i * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(size * 0.45 + i * size * 0.08, flameY);
    ctx.quadraticCurveTo(
      size * 0.55 + i * size * 0.1,
      flameY - size * 0.08,
      size * 0.6 + i * size * 0.12,
      flameY
    );
    ctx.quadraticCurveTo(
      size * 0.55 + i * size * 0.1,
      flameY + size * 0.06,
      size * 0.45 + i * size * 0.08,
      flameY
    );
    ctx.fill();
  }
  ctx.restore();

  // Powerful leonine body
  const bodyGrad = ctx.createRadialGradient(
    x,
    y + swoop * 0.2,
    0,
    x,
    y + swoop * 0.2,
    size * 0.45
  );
  bodyGrad.addColorStop(0, "#155e75");
  bodyGrad.addColorStop(0.6, "#0e7490");
  bodyGrad.addColorStop(1, "#0891b2");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.05 + swoop * 0.2,
    size * 0.35,
    size * 0.4,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Chest feathers
  ctx.fillStyle = "#a5f3fc";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.08 + swoop * 0.2,
    size * 0.18,
    size * 0.22,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Feather texture
  ctx.strokeStyle = "#67e8f9";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(
      x,
      y + size * 0.05 + swoop * 0.2,
      size * 0.08 + i * size * 0.025,
      0.6 * Math.PI,
      0.4 * Math.PI,
      true
    );
    ctx.stroke();
  }

  // Majestic eagle head
  ctx.fillStyle = "#0891b2";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.38 + swoop, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Crown crest feathers
  ctx.fillStyle = "#22d3ee";
  for (let i = 0; i < 7; i++) {
    const crestAngle = -Math.PI * 0.4 + i * Math.PI * 0.13;
    const crestLen = size * (0.15 + Math.sin(time * 5 + i) * 0.03);
    ctx.save();
    ctx.translate(
      x + Math.cos(crestAngle) * size * 0.18,
      y - size * 0.5 + swoop
    );
    ctx.rotate(crestAngle + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.03, -crestLen);
    ctx.lineTo(size * 0.03, -crestLen);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Fierce glowing eyes
  ctx.fillStyle = "#fef08a";
  ctx.shadowColor = "#fef08a";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.09,
    y - size * 0.4 + swoop,
    size * 0.065,
    size * 0.05,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.09,
    y - size * 0.4 + swoop,
    size * 0.065,
    size * 0.05,
    0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  // Predator slit pupils
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.09,
    y - size * 0.4 + swoop,
    size * 0.02,
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.09,
    y - size * 0.4 + swoop,
    size * 0.02,
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Sharp hooked beak
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.35 + swoop);
  ctx.quadraticCurveTo(
    x - size * 0.08,
    y - size * 0.32 + swoop,
    x - size * 0.05,
    y - size * 0.22 + swoop
  );
  ctx.lineTo(x, y - size * 0.18 + swoop);
  ctx.lineTo(x + size * 0.05, y - size * 0.22 + swoop);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y - size * 0.32 + swoop,
    x,
    y - size * 0.35 + swoop
  );
  ctx.fill();
  // Beak detail
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.35 + swoop);
  ctx.lineTo(x, y - size * 0.2 + swoop);
  ctx.stroke();

  // Powerful talons
  ctx.fillStyle = "#1c1917";
  for (let side of [-1, 1]) {
    ctx.save();
    ctx.translate(x + side * size * 0.2, y + size * 0.4 + swoop * 0.1);
    // Leg
    ctx.fillStyle = "#0891b2";
    ctx.fillRect(-size * 0.04, -size * 0.15, size * 0.08, size * 0.15);
    // Talons
    ctx.fillStyle = "#1c1917";
    for (let t = 0; t < 3; t++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.04 + t * size * 0.04, 0);
      ctx.lineTo(-size * 0.05 + t * size * 0.05, size * 0.12);
      ctx.lineTo(-size * 0.02 + t * size * 0.04, 0);
      ctx.fill();
    }
    ctx.restore();
  }

  // Blazing trail effect (for flying)
  if (isFlying) {
    ctx.globalAlpha = 0.4;
    for (let t = 1; t < 4; t++) {
      ctx.fillStyle = `rgba(34, 211, 238, ${0.3 - t * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(
        x + t * 6,
        y + t * 4 + swoop * 0.2,
        size * 0.25 - t * size * 0.04,
        size * 0.3 - t * size * 0.05,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawDefaultEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // VOID ACOLYTE - Mysterious shadowy figure with dark energy
  const bob = Math.sin(time * 4) * 3 * zoom;
  const voidPulse = 0.5 + Math.sin(time * 5) * 0.3;

  // Dark void aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.6);
  auraGrad.addColorStop(0, `rgba(55, 48, 163, ${voidPulse * 0.3})`);
  auraGrad.addColorStop(0.6, `rgba(30, 27, 75, ${voidPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Floating dark particles
  for (let i = 0; i < 4; i++) {
    const particleAngle = time * 2 + i * Math.PI * 0.5;
    const particleDist = size * 0.35 + Math.sin(time * 3 + i) * size * 0.08;
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y + Math.sin(particleAngle) * particleDist * 0.5;
    ctx.fillStyle = `rgba(99, 102, 241, ${0.4 + Math.sin(time * 4 + i) * 0.2})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow beneath
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.28, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shadowy robes
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  robeGrad.addColorStop(0, "#1e1b4b");
  robeGrad.addColorStop(0.3, "#312e81");
  robeGrad.addColorStop(0.5, "#3730a3");
  robeGrad.addColorStop(0.7, "#312e81");
  robeGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.45);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y,
    x - size * 0.12,
    y - size * 0.28 + bob * 0.3
  );
  ctx.lineTo(x + size * 0.12, y - size * 0.28 + bob * 0.3);
  ctx.quadraticCurveTo(x + size * 0.35, y, x + size * 0.32, y + size * 0.45);
  // Tattered bottom
  for (let i = 0; i < 4; i++) {
    const jagX = x - size * 0.32 + i * size * 0.16;
    const jagY = y + size * 0.45 + (i % 2) * size * 0.04;
    ctx.lineTo(jagX, jagY);
  }
  ctx.closePath();
  ctx.fill();

  // Arcane trim
  ctx.strokeStyle = `rgba(99, 102, 241, ${voidPulse * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2 + bob * 0.3);
  ctx.lineTo(x, y + size * 0.35);
  ctx.stroke();

  // Hood
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.3 + bob * 0.3,
    size * 0.18,
    size * 0.12,
    0,
    Math.PI,
    0
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.3 + bob * 0.3);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.1, x - size * 0.15, y);
  ctx.lineTo(x - size * 0.1, y - size * 0.15);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.3 + bob * 0.3);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.1, x + size * 0.15, y);
  ctx.lineTo(x + size * 0.1, y - size * 0.15);
  ctx.fill();

  // Pale face in shadow
  ctx.fillStyle = "#c7d2fe";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + bob, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes
  ctx.fillStyle = "#6366f1";
  ctx.shadowColor = "#6366f1";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.37 + bob, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.37 + bob, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Mysterious smile
  ctx.strokeStyle = "#4338ca";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.28 + bob,
    size * 0.04,
    0.15 * Math.PI,
    0.85 * Math.PI
  );
  ctx.stroke();

  // Small floating orb in hand
  ctx.fillStyle = `rgba(99, 102, 241, ${voidPulse})`;
  ctx.shadowColor = "#6366f1";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.22,
    y + size * 0.05 + bob * 0.5,
    size * 0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ============================================================================
// NEW ENEMY TYPES - Fantasy-style detailed sprites
// ============================================================================

function drawTrusteeEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // PLUTOCRAT ARCHMAGE - Wealthy elite with reality-bending gold magic
  const float = Math.sin(time * 1.5) * 4 * zoom;
  const goldPulse = 0.7 + Math.sin(time * 4) * 0.3;
  const wealthAura = 0.5 + Math.sin(time * 3) * 0.3;

  // Golden reality distortion field
  ctx.strokeStyle = `rgba(234, 179, 8, ${wealthAura * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 3; i++) {
    const ringPhase = (time * 0.5 + i * 0.4) % 2;
    const ringSize = size * 0.4 + ringPhase * size * 0.35;
    ctx.globalAlpha = 0.5 * (1 - ringPhase / 2);
    ctx.beginPath();
    ctx.arc(x, y, ringSize, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Radiant wealth aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${goldPulse * 0.4})`);
  auraGrad.addColorStop(0.4, `rgba(234, 179, 8, ${goldPulse * 0.2})`);
  auraGrad.addColorStop(1, "rgba(234, 179, 8, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting treasure - gold coins, gems, and artifacts
  for (let i = 0; i < 8; i++) {
    const itemAngle = time * 1.5 + i * Math.PI * 0.25;
    const itemDist = size * 0.55 + Math.sin(time * 2 + i) * size * 0.08;
    const itemX = x + Math.cos(itemAngle) * itemDist;
    const itemY =
      y - size * 0.05 + Math.sin(itemAngle) * itemDist * 0.4 + float * 0.3;
    ctx.save();
    ctx.translate(itemX, itemY);
    ctx.rotate(time * 2 + i);
    if (i % 3 === 0) {
      // Gold coin
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.05, size * 0.035, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      ctx.fillStyle = "#b8860b";
      ctx.font = `${size * 0.04}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("$", 0, size * 0.015);
    } else if (i % 3 === 1) {
      // Ruby gem
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.04);
      ctx.lineTo(size * 0.03, 0);
      ctx.lineTo(0, size * 0.04);
      ctx.lineTo(-size * 0.03, 0);
      ctx.fill();
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath();
      ctx.arc(-size * 0.01, -size * 0.015, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Emerald gem
      ctx.fillStyle = "#059669";
      ctx.fillRect(-size * 0.025, -size * 0.035, size * 0.05, size * 0.07);
      ctx.fillStyle = "#6ee7b7";
      ctx.fillRect(-size * 0.015, -size * 0.025, size * 0.015, size * 0.02);
    }
    ctx.restore();
  }

  // Lavish shadow
  ctx.fillStyle = "rgba(120, 80, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.45, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magnificent golden robes with purple velvet lining
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.45,
    y,
    x + size * 0.45,
    y
  );
  robeGrad.addColorStop(0, "#92400e");
  robeGrad.addColorStop(0.2, "#d97706");
  robeGrad.addColorStop(0.35, "#fbbf24");
  robeGrad.addColorStop(0.5, "#fcd34d");
  robeGrad.addColorStop(0.65, "#fbbf24");
  robeGrad.addColorStop(0.8, "#d97706");
  robeGrad.addColorStop(1, "#92400e");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.48, y + size * 0.55);
  // Flowing bottom
  for (let i = 0; i < 6; i++) {
    const waveX = x - size * 0.48 + i * size * 0.192;
    const waveY = y + size * 0.55 + Math.sin(time * 3 + i) * size * 0.03;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.55,
    y - size * 0.1,
    x + size * 0.22,
    y - size * 0.38 + float
  );
  ctx.lineTo(x - size * 0.22, y - size * 0.38 + float);
  ctx.quadraticCurveTo(
    x - size * 0.55,
    y - size * 0.1,
    x - size * 0.48,
    y + size * 0.55
  );
  ctx.fill();

  // Purple velvet inner lining
  ctx.fillStyle = "#581c87";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.32 + float);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.15 + float,
    x + size * 0.15,
    y - size * 0.32 + float
  );
  ctx.lineTo(x + size * 0.12, y + size * 0.3);
  ctx.quadraticCurveTo(x, y + size * 0.4, x - size * 0.12, y + size * 0.3);
  ctx.fill();

  // Ornate gold collar with massive gems
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.32 + float);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.2 + float,
    x + size * 0.2,
    y - size * 0.32 + float
  );
  ctx.lineTo(x + size * 0.18, y - size * 0.15 + float);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.05 + float,
    x - size * 0.18,
    y - size * 0.15 + float
  );
  ctx.fill();
  // Central diamond
  ctx.fillStyle = "#e0f2fe";
  ctx.shadowColor = "#e0f2fe";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28 + float);
  ctx.lineTo(x + size * 0.06, y - size * 0.2 + float);
  ctx.lineTo(x, y - size * 0.12 + float);
  ctx.lineTo(x - size * 0.06, y - size * 0.2 + float);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Distinguished aged face
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.48 + float, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Wrinkles of experience
  ctx.strokeStyle = "rgba(180, 140, 100, 0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.12,
    y - size * 0.42 + float,
    size * 0.04,
    0.3,
    Math.PI - 0.3
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.12,
    y - size * 0.42 + float,
    size * 0.04,
    0.3,
    Math.PI - 0.3
  );
  ctx.stroke();

  // Ornate golden monocle with chain
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.5 + float, size * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  // Monocle lens sparkle
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.08,
    y - size * 0.52 + float,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Gold chain
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.5 + float);
  ctx.quadraticCurveTo(
    x + size * 0.25,
    y - size * 0.35 + float,
    x + size * 0.2,
    y - size * 0.2 + float
  );
  ctx.stroke();

  // Piercing calculating eyes
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.5 + float,
    size * 0.045,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.5 + float,
    size * 0.04,
    size * 0.045,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#92400e";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.5 + float,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.arc(x + size * 0.1, y - size * 0.5 + float, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  // Eye gleam (greed)
  ctx.fillStyle = `rgba(251, 191, 36, ${goldPulse})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.5 + float,
    size * 0.012,
    0,
    Math.PI * 2
  );
  ctx.arc(x + size * 0.1, y - size * 0.5 + float, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Stern imperious mouth
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.07, y - size * 0.38 + float);
  ctx.lineTo(x + size * 0.07, y - size * 0.38 + float);
  ctx.stroke();

  // Magnificent top hat with jeweled band
  ctx.fillStyle = "#1c1917";
  // Brim
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.68 + float,
    size * 0.24,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Crown
  ctx.fillRect(
    x - size * 0.15,
    y - size * 0.95 + float,
    size * 0.3,
    size * 0.28
  );
  // Top
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.95 + float,
    size * 0.15,
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Jeweled gold band
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(
    x - size * 0.16,
    y - size * 0.78 + float,
    size * 0.32,
    size * 0.06
  );
  // Gems on band
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.75 + float,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#059669";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.75 + float, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.08,
    y - size * 0.75 + float,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Ornate staff of wealth (scepter)
  ctx.save();
  ctx.translate(x - size * 0.45, y - size * 0.15 + float);
  ctx.rotate(-0.2 + Math.sin(time * 2) * 0.05);
  // Staff body (ebony with gold inlay)
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.03, -size * 0.4, size * 0.06, size * 0.8);
  // Gold spiral inlay
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, -size * 0.35 + i * size * 0.1);
    ctx.lineTo(size * 0.03, -size * 0.3 + i * size * 0.1);
    ctx.stroke();
  }
  // Crown top with massive gem
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.4);
  ctx.lineTo(-size * 0.06, -size * 0.55);
  ctx.lineTo(0, -size * 0.48);
  ctx.lineTo(size * 0.06, -size * 0.55);
  ctx.lineTo(size * 0.08, -size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Legendary gem
  ctx.fillStyle = "#fbbf24";
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.58, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.arc(-size * 0.02, -size * 0.6, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawArcherEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // SHADOW RANGER - Ethereal hunter with spectral bow and nature magic
  const stance = Math.sin(time * 2.5) * 2 * zoom;
  const drawPull = 0.3 + Math.sin(time * 1.5) * 0.25;
  const naturePulse = 0.6 + Math.sin(time * 4) * 0.4;

  // Nature magic aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.7);
  auraGrad.addColorStop(0, `rgba(16, 185, 129, ${naturePulse * 0.25})`);
  auraGrad.addColorStop(0.5, `rgba(5, 150, 105, ${naturePulse * 0.12})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Floating leaves/nature particles
  for (let i = 0; i < 5; i++) {
    const leafAngle = time * 1.5 + i * Math.PI * 0.4;
    const leafDist = size * 0.45 + Math.sin(time * 2 + i) * size * 0.1;
    const lx = x + Math.cos(leafAngle) * leafDist;
    const ly = y + Math.sin(leafAngle) * leafDist * 0.5;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(time * 2 + i);
    ctx.fillStyle = `rgba(16, 185, 129, ${0.5 + Math.sin(time * 3 + i) * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.025, size * 0.012, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Shadow beneath
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Enchanted quiver with glowing arrows
  ctx.save();
  ctx.translate(x + size * 0.25, y - size * 0.05 + stance * 0.3);
  ctx.rotate(0.25);
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.07, -size * 0.38, size * 0.14, size * 0.45);
  // Leather texture
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.35);
  ctx.lineTo(-size * 0.05, size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.05, -size * 0.35);
  ctx.lineTo(size * 0.05, size * 0.05);
  ctx.stroke();
  // Glowing magical arrows
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = "#059669";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.045 + i * size * 0.023, -size * 0.35);
    ctx.lineTo(-size * 0.045 + i * size * 0.023, -size * 0.55);
    ctx.stroke();
    // Glowing arrowhead
    ctx.fillStyle = `rgba(16, 185, 129, ${naturePulse})`;
    ctx.shadowColor = "#10b981";
    ctx.shadowBlur = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.045 + i * size * 0.023, -size * 0.55);
    ctx.lineTo(-size * 0.06 + i * size * 0.023, -size * 0.6);
    ctx.lineTo(-size * 0.03 + i * size * 0.023, -size * 0.6);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Flowing elven cloak
  const cloakGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y
  );
  cloakGrad.addColorStop(0, "#064e3b");
  cloakGrad.addColorStop(0.3, "#047857");
  cloakGrad.addColorStop(0.5, "#059669");
  cloakGrad.addColorStop(0.7, "#047857");
  cloakGrad.addColorStop(1, "#064e3b");
  ctx.fillStyle = cloakGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5);
  // Flowing bottom edge
  for (let i = 0; i < 5; i++) {
    const waveX = x - size * 0.38 + i * size * 0.19;
    const waveY =
      y +
      size * 0.5 +
      Math.sin(time * 4 + i) * size * 0.04 +
      (i % 2) * size * 0.03;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.42,
    y - size * 0.15 + stance,
    x,
    y - size * 0.52 + stance
  );
  ctx.quadraticCurveTo(
    x - size * 0.42,
    y - size * 0.15 + stance,
    x - size * 0.38,
    y + size * 0.5
  );
  ctx.fill();

  // Elven leaf patterns on cloak (glowing)
  ctx.strokeStyle = `rgba(52, 211, 153, ${naturePulse * 0.6})`;
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(
      x - size * 0.1 + i * size * 0.1,
      y + size * 0.1 + i * size * 0.08
    );
    ctx.quadraticCurveTo(
      x - size * 0.05 + i * size * 0.1,
      y + size * 0.05 + i * size * 0.08,
      x + i * size * 0.1,
      y + size * 0.1 + i * size * 0.08
    );
    ctx.stroke();
  }

  // Leather armor underneath
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y + size * 0.35);
  ctx.lineTo(x - size * 0.2, y - size * 0.15 + stance);
  ctx.lineTo(x, y - size * 0.25 + stance);
  ctx.lineTo(x + size * 0.2, y - size * 0.15 + stance);
  ctx.lineTo(x + size * 0.18, y + size * 0.35);
  ctx.fill();

  // Elven face (ethereal beauty)
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + stance, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Pointed elven ears
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.42 + stance);
  ctx.lineTo(x - size * 0.25, y - size * 0.52 + stance);
  ctx.lineTo(x - size * 0.16, y - size * 0.38 + stance);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.42 + stance);
  ctx.lineTo(x + size * 0.25, y - size * 0.52 + stance);
  ctx.lineTo(x + size * 0.16, y - size * 0.38 + stance);
  ctx.fill();

  // Glowing emerald eyes
  ctx.fillStyle = "#10b981";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.055,
    y - size * 0.42 + stance,
    size * 0.03,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.055,
    y - size * 0.42 + stance,
    size * 0.03,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Hood shadow over face
  ctx.fillStyle = "rgba(6, 78, 59, 0.6)";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52 + stance, size * 0.18, 0, Math.PI, true);
  ctx.fill();

  // Magnificent spectral bow (pulsing with nature magic)
  ctx.save();
  ctx.translate(x - size * 0.35, y + stance);
  // Bow body with wood grain
  const bowGrad = ctx.createLinearGradient(
    -size * 0.1,
    -size * 0.4,
    size * 0.1,
    size * 0.4
  );
  bowGrad.addColorStop(0, "#059669");
  bowGrad.addColorStop(0.5, "#10b981");
  bowGrad.addColorStop(1, "#059669");
  ctx.strokeStyle = bowGrad;
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 10 * zoom;
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.42, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Elven rune carvings on bow
  ctx.fillStyle = `rgba(52, 211, 153, ${naturePulse})`;
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("◇", Math.cos(-0.2) * size * 0.38, Math.sin(-0.2) * size * 0.38);
  ctx.fillText("◇", Math.cos(0.2) * size * 0.38, Math.sin(0.2) * size * 0.38);
  ctx.restore();

  // Bowstring (magical, glowing)
  ctx.strokeStyle = `rgba(52, 211, 153, ${naturePulse})`;
  ctx.lineWidth = 1.5 * zoom;
  const bowTopX = x - size * 0.35 + Math.cos(-Math.PI * 0.45) * size * 0.42;
  const bowTopY = y + stance + Math.sin(-Math.PI * 0.45) * size * 0.42;
  const bowBotX = x - size * 0.35 + Math.cos(Math.PI * 0.45) * size * 0.42;
  const bowBotY = y + stance + Math.sin(Math.PI * 0.45) * size * 0.42;
  const pullX = x - size * 0.15 - drawPull * size * 0.18;
  ctx.beginPath();
  ctx.moveTo(bowTopX, bowTopY);
  ctx.lineTo(pullX, y + stance);
  ctx.lineTo(bowBotX, bowBotY);
  ctx.stroke();

  // Spectral arrow (nocked and glowing)
  ctx.save();
  ctx.translate(pullX, y + stance);
  ctx.rotate(Math.PI);
  // Arrow shaft
  ctx.strokeStyle = "#059669";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.4, 0);
  ctx.stroke();
  // Glowing arrowhead
  ctx.fillStyle = "#10b981";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.4, 0);
  ctx.lineTo(size * 0.48, -size * 0.035);
  ctx.lineTo(size * 0.52, 0);
  ctx.lineTo(size * 0.48, size * 0.035);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Arrow fletching (ethereal feathers)
  ctx.fillStyle = `rgba(16, 185, 129, ${naturePulse})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.06, -size * 0.04);
  ctx.lineTo(-size * 0.02, 0);
  ctx.lineTo(-size * 0.06, size * 0.04);
  ctx.fill();
  ctx.restore();
}

function drawMageEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // MAGE PROFESSOR - Arcane wizard with floating tome and magic orbs
  const float = Math.sin(time * 2.5) * 4 * zoom;
  const magicPulse = 0.6 + Math.sin(time * 4) * 0.4;

  // Magic aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.7);
  auraGrad.addColorStop(0, `rgba(139, 92, 246, ${magicPulse * 0.25})`);
  auraGrad.addColorStop(0.6, `rgba(139, 92, 246, ${magicPulse * 0.1})`);
  auraGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Floating arcane orbs
  for (let i = 0; i < 3; i++) {
    const orbAngle = time * 1.5 + i * Math.PI * 0.67;
    const orbX = x + Math.cos(orbAngle) * size * 0.55;
    const orbY = y - size * 0.2 + Math.sin(orbAngle) * size * 0.3;
    ctx.fillStyle = `rgba(167, 139, 250, ${
      0.6 + Math.sin(time * 3 + i) * 0.3
    })`;
    ctx.shadowColor = "#8b5cf6";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(orbX, orbY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.32, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arcane robes
  const robeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.4,
    x,
    y + size * 0.5
  );
  robeGrad.addColorStop(0, "#4c1d95");
  robeGrad.addColorStop(0.5, "#6d28d9");
  robeGrad.addColorStop(1, "#3b0764");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.5);
  ctx.quadraticCurveTo(
    x - size * 0.45,
    y,
    x - size * 0.15,
    y - size * 0.4 + float
  );
  ctx.lineTo(x + size * 0.15, y - size * 0.4 + float);
  ctx.quadraticCurveTo(x + size * 0.45, y, x + size * 0.4, y + size * 0.5);
  ctx.closePath();
  ctx.fill();

  // Rune patterns on robe
  ctx.strokeStyle = `rgba(167, 139, 250, ${magicPulse})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x, y + size * 0.1 + i * size * 0.08, size * 0.08, 0, Math.PI);
    ctx.stroke();
  }

  // Wizard beard
  ctx.fillStyle = "#9ca3af";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.28 + float);
  ctx.quadraticCurveTo(x - size * 0.15, y + float, x, y + size * 0.1 + float);
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y + float,
    x + size * 0.1,
    y - size * 0.28 + float
  );
  ctx.fill();

  // Face
  ctx.fillStyle = "#e0d4c4";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + float, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes
  ctx.fillStyle = "#8b5cf6";
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06,
    y - size * 0.37 + float,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.06,
    y - size * 0.37 + float,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Wizard hat
  ctx.fillStyle = "#4c1d95";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.5 + float);
  ctx.lineTo(x, y - size * 0.9 + float);
  ctx.lineTo(x + size * 0.2, y - size * 0.5 + float);
  ctx.closePath();
  ctx.fill();
  // Hat brim
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.5 + float,
    size * 0.25,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Star on hat
  ctx.fillStyle = "#fbbf24";
  ctx.font = `${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("★", x, y - size * 0.65 + float);

  // Floating spellbook
  ctx.fillStyle = "#7c2d12";
  ctx.save();
  ctx.translate(
    x - size * 0.35,
    y - size * 0.1 + float + Math.sin(time * 3) * 3
  );
  ctx.rotate(Math.sin(time * 2) * 0.1);
  ctx.fillRect(-size * 0.1, -size * 0.12, size * 0.2, size * 0.24);
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(-size * 0.08, -size * 0.1, size * 0.16, size * 0.2);
  // Glowing runes on book
  ctx.fillStyle = `rgba(139, 92, 246, ${magicPulse})`;
  ctx.font = `${size * 0.08}px serif`;
  ctx.fillText("◈", 0, 0);
  ctx.restore();
}

function drawCatapultEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // SIEGE ENGINE - Massive war machine with crew
  const recoil = Math.abs(Math.sin(time * 1.5)) * 3 * zoom;
  const armAngle = Math.sin(time * 1.5) * 0.3;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.5, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = "#5c4033";
  ctx.strokeStyle = "#3d2817";
  ctx.lineWidth = 3 * zoom;
  // Left wheel
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y + size * 0.35, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right wheel
  ctx.beginPath();
  ctx.arc(x + size * 0.35, y + size * 0.35, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Wheel spokes
  ctx.strokeStyle = "#8b7355";
  ctx.lineWidth = 2 * zoom;
  for (let w = 0; w < 2; w++) {
    const wheelX = w === 0 ? x - size * 0.35 : x + size * 0.35;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + time * 0.5;
      ctx.beginPath();
      ctx.moveTo(wheelX, y + size * 0.35);
      ctx.lineTo(
        wheelX + Math.cos(angle) * size * 0.12,
        y + size * 0.35 + Math.sin(angle) * size * 0.12
      );
      ctx.stroke();
    }
  }

  // Main frame
  ctx.fillStyle = "#654321";
  ctx.fillRect(x - size * 0.4, y + size * 0.1, size * 0.8, size * 0.2);
  // Metal bands
  ctx.fillStyle = "#4a4a52";
  ctx.fillRect(x - size * 0.35, y + size * 0.12, size * 0.08, size * 0.16);
  ctx.fillRect(x + size * 0.27, y + size * 0.12, size * 0.08, size * 0.16);

  // Throwing arm
  ctx.save();
  ctx.translate(x, y + size * 0.15);
  ctx.rotate(-0.8 + armAngle);
  ctx.fillStyle = "#8b7355";
  ctx.fillRect(-size * 0.05, -size * 0.6, size * 0.1, size * 0.6);
  // Arm metal cap
  ctx.fillStyle = "#6a6a72";
  ctx.fillRect(-size * 0.07, -size * 0.62, size * 0.14, size * 0.08);
  // Bucket/sling
  ctx.fillStyle = "#5c4033";
  ctx.beginPath();
  ctx.arc(0, -size * 0.58, size * 0.12, 0, Math.PI);
  ctx.fill();
  // Boulder in bucket
  ctx.fillStyle = "#78716c";
  ctx.beginPath();
  ctx.arc(0, -size * 0.55, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tension ropes
  ctx.strokeStyle = "#d4a574";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.2);
  ctx.lineTo(x, y - size * 0.1);
  ctx.moveTo(x + size * 0.3, y + size * 0.2);
  ctx.lineTo(x, y - size * 0.1);
  ctx.stroke();

  // Crew member (small operator)
  ctx.fillStyle = "#854d0e";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.15,
    y - size * 0.05,
    size * 0.08,
    size * 0.12,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Head
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.arc(x + size * 0.15, y - size * 0.2, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  // Helmet
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.arc(x + size * 0.15, y - size * 0.23, size * 0.07, Math.PI, 0);
  ctx.fill();
}

function drawWarlockEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // DARK WARLOCK - Shadow magic user with demonic essence
  const hover = Math.sin(time * 2) * 4 * zoom;
  const darkPulse = 0.5 + Math.sin(time * 3) * 0.3;

  // Dark void aura
  const voidGrad = ctx.createRadialGradient(
    x,
    y,
    size * 0.1,
    x,
    y,
    size * 0.75
  );
  voidGrad.addColorStop(0, `rgba(76, 29, 149, ${darkPulse * 0.4})`);
  voidGrad.addColorStop(0.5, `rgba(30, 10, 60, ${darkPulse * 0.2})`);
  voidGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Shadow tendrils
  ctx.strokeStyle = `rgba(76, 29, 149, ${darkPulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    const tendrilAngle = time * 0.8 + i * Math.PI * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.quadraticCurveTo(
      x + Math.cos(tendrilAngle) * size * 0.4,
      y + size * 0.4 + Math.sin(time * 2 + i) * size * 0.1,
      x + Math.cos(tendrilAngle) * size * 0.6,
      y + size * 0.5
    );
    ctx.stroke();
  }

  // Shadow
  ctx.fillStyle = "rgba(30, 10, 60, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark robes (tattered, flowing)
  ctx.fillStyle = "#1e0a3c";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.5);
  for (let i = 0; i < 6; i++) {
    const waveX = x - size * 0.4 + i * size * 0.16;
    const waveY = y + size * 0.5 + Math.sin(time * 3 + i) * size * 0.05;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.45,
    y,
    x + size * 0.15,
    y - size * 0.4 + hover
  );
  ctx.lineTo(x - size * 0.15, y - size * 0.4 + hover);
  ctx.quadraticCurveTo(x - size * 0.45, y, x - size * 0.4, y + size * 0.5);
  ctx.fill();

  // Skull face
  ctx.fillStyle = "#e8e0d0";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + hover, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  // Hollow eye sockets
  ctx.fillStyle = "#1e0a3c";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.07,
    y - size * 0.37 + hover,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.07,
    y - size * 0.37 + hover,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Glowing eyes within
  ctx.fillStyle = "#9333ea";
  ctx.shadowColor = "#9333ea";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.37 + hover,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.07,
    y - size * 0.37 + hover,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  // Skeletal teeth
  ctx.fillStyle = "#e8e0d0";
  ctx.fillRect(
    x - size * 0.06,
    y - size * 0.28 + hover,
    size * 0.12,
    size * 0.04
  );
  ctx.strokeStyle = "#1e0a3c";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.05 + i * size * 0.03, y - size * 0.28 + hover);
    ctx.lineTo(x - size * 0.05 + i * size * 0.03, y - size * 0.24 + hover);
    ctx.stroke();
  }

  // Hood
  ctx.fillStyle = "#0f0520";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.45 + hover,
    size * 0.22,
    size * 0.12,
    0,
    Math.PI,
    0
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.45 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.25,
    y - size * 0.2 + hover,
    x - size * 0.18,
    y - size * 0.1 + hover
  );
  ctx.moveTo(x + size * 0.22, y - size * 0.45 + hover);
  ctx.quadraticCurveTo(
    x + size * 0.25,
    y - size * 0.2 + hover,
    x + size * 0.18,
    y - size * 0.1 + hover
  );
  ctx.fill();

  // Shadow orb in hand
  ctx.fillStyle = "#4c1d95";
  ctx.shadowColor = "#9333ea";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y + hover, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  // Dark energy swirls in orb
  ctx.strokeStyle = "#1e0a3c";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y + hover, size * 0.08, time * 2, time * 2 + Math.PI);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawCrossbowmanEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // HEAVY CROSSBOWMAN - Armored ranged unit with massive crossbow
  const aim = Math.sin(time * 2) * 0.05;
  const stance = Math.sin(time * 4) * 2 * zoom;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy leather armor body
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  armorGrad.addColorStop(0, "#5c4033");
  armorGrad.addColorStop(0.5, "#78350f");
  armorGrad.addColorStop(1, "#5c4033");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.45);
  ctx.lineTo(x - size * 0.35, y - size * 0.1);
  ctx.quadraticCurveTo(x, y - size * 0.35, x + size * 0.35, y - size * 0.1);
  ctx.lineTo(x + size * 0.32, y + size * 0.45);
  ctx.closePath();
  ctx.fill();

  // Metal chest plate
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.2);
  ctx.lineTo(x - size * 0.22, y - size * 0.15);
  ctx.quadraticCurveTo(x, y - size * 0.25, x + size * 0.22, y - size * 0.15);
  ctx.lineTo(x + size * 0.2, y + size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Metal rivets
  ctx.fillStyle = "#8a8a92";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.12 + i * size * 0.12,
      y - size * 0.1,
      size * 0.02,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Face with sallet helm
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.38, size * 0.14, 0.3 * Math.PI, 2.7 * Math.PI);
  ctx.fill();

  // Sallet helmet
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.45, size * 0.18, size * 0.12, 0, Math.PI, 0);
  ctx.fill();
  // Helmet tail
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.42);
  ctx.quadraticCurveTo(
    x + size * 0.25,
    y - size * 0.38,
    x + size * 0.2,
    y - size * 0.28
  );
  ctx.lineTo(x + size * 0.1, y - size * 0.35);
  ctx.fill();
  // Visor
  ctx.fillStyle = "#3a3a42";
  ctx.fillRect(x - size * 0.12, y - size * 0.42, size * 0.24, size * 0.06);
  // Eye slit
  ctx.fillStyle = "#1a1a1e";
  ctx.fillRect(x - size * 0.1, y - size * 0.41, size * 0.2, size * 0.03);

  // Massive crossbow
  ctx.save();
  ctx.translate(x - size * 0.15, y + size * 0.05);
  ctx.rotate(aim);
  // Stock
  ctx.fillStyle = "#654321";
  ctx.fillRect(-size * 0.4, -size * 0.04, size * 0.45, size * 0.08);
  // Metal parts
  ctx.fillStyle = "#4a4a52";
  ctx.fillRect(-size * 0.42, -size * 0.05, size * 0.08, size * 0.1);
  // Bow limbs
  ctx.strokeStyle = "#3d2817";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, 0);
  ctx.quadraticCurveTo(-size * 0.55, -size * 0.2, -size * 0.45, -size * 0.35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, 0);
  ctx.quadraticCurveTo(-size * 0.55, size * 0.2, -size * 0.45, size * 0.35);
  ctx.stroke();
  // Bowstring
  ctx.strokeStyle = "#d4a574";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, -size * 0.35);
  ctx.lineTo(-size * 0.15, 0);
  ctx.lineTo(-size * 0.45, size * 0.35);
  ctx.stroke();
  // Bolt
  ctx.fillStyle = "#3d2817";
  ctx.fillRect(-size * 0.55, -size * 0.015, size * 0.3, size * 0.03);
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.moveTo(-size * 0.6, 0);
  ctx.lineTo(-size * 0.52, -size * 0.035);
  ctx.lineTo(-size * 0.52, size * 0.035);
  ctx.fill();
  ctx.restore();
}

function drawHexerEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // HEX WITCH - Fast curse caster with floating hex circles
  const sway = Math.sin(time * 3) * 3 * zoom;
  const hexPulse = 0.6 + Math.sin(time * 5) * 0.4;

  // Hex circles floating around
  ctx.strokeStyle = `rgba(190, 24, 93, ${hexPulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 3; i++) {
    const circleAngle = time * 1.2 + i * Math.PI * 0.67;
    const circleX = x + Math.cos(circleAngle) * size * 0.5;
    const circleY = y - size * 0.1 + Math.sin(circleAngle) * size * 0.25;
    ctx.beginPath();
    ctx.arc(circleX, circleY, size * 0.08, 0, Math.PI * 2);
    ctx.stroke();
    // Hex symbol inside
    ctx.fillStyle = `rgba(190, 24, 93, ${hexPulse})`;
    ctx.font = `${size * 0.1}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("✧", circleX, circleY + size * 0.03);
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.25, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tattered dress (dark pink/magenta)
  const dressGrad = ctx.createLinearGradient(
    x,
    y - size * 0.3,
    x,
    y + size * 0.5
  );
  dressGrad.addColorStop(0, "#9d174d");
  dressGrad.addColorStop(0.5, "#be185d");
  dressGrad.addColorStop(1, "#831843");
  ctx.fillStyle = dressGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.48);
  for (let i = 0; i < 5; i++) {
    const jagX = x - size * 0.35 + i * size * 0.175;
    const jagY = y + size * 0.48 + (i % 2) * size * 0.08;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y,
    x + size * 0.12,
    y - size * 0.35 + sway
  );
  ctx.lineTo(x - size * 0.12, y - size * 0.35 + sway);
  ctx.quadraticCurveTo(x - size * 0.35, y, x - size * 0.35, y + size * 0.48);
  ctx.fill();

  // Wild hair (dark flowing)
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.4 + sway);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y - size * 0.2,
    x - size * 0.3,
    y + size * 0.1
  );
  ctx.quadraticCurveTo(
    x - size * 0.25,
    y - size * 0.1,
    x - size * 0.15,
    y - size * 0.35 + sway
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.4 + sway);
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y - size * 0.2,
    x + size * 0.3,
    y + size * 0.1
  );
  ctx.quadraticCurveTo(
    x + size * 0.25,
    y - size * 0.1,
    x + size * 0.15,
    y - size * 0.35 + sway
  );
  ctx.fill();

  // Pale face
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + sway, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Sinister eyes
  ctx.fillStyle = "#be185d";
  ctx.shadowColor = "#be185d";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.05,
    y - size * 0.42 + sway,
    size * 0.035,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.05,
    y - size * 0.42 + sway,
    size * 0.035,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Wicked smile
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.32 + sway, size * 0.06, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Pointed witch hat
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.52 + sway);
  ctx.quadraticCurveTo(
    x - size * 0.05,
    y - size * 0.7 + sway,
    x + size * 0.15,
    y - size * 0.85 + sway
  );
  ctx.lineTo(x + size * 0.18, y - size * 0.52 + sway);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.52 + sway,
    size * 0.2,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Hat band
  ctx.fillStyle = "#be185d";
  ctx.fillRect(
    x - size * 0.15,
    y - size * 0.58 + sway,
    size * 0.25,
    size * 0.04
  );

  // Wand with hex crystal
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.1 + sway);
  ctx.lineTo(x + size * 0.45, y + size * 0.2);
  ctx.stroke();
  // Crystal tip
  ctx.fillStyle = "#be185d";
  ctx.shadowColor = "#be185d";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.18 + sway);
  ctx.lineTo(x + size * 0.22, y - size * 0.1 + sway);
  ctx.lineTo(x + size * 0.28, y - size * 0.1 + sway);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawHarpyEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // HARPY - Swift flying predator with razor talons
  const wingFlap = Math.sin(time * 12) * 0.4;
  const swoop = Math.sin(time * 4) * 3 * zoom;

  // Wing shadow below
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.7, size * 0.5, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left wing
  ctx.save();
  ctx.translate(x - size * 0.15, y - size * 0.1 + swoop);
  ctx.rotate(-0.3 - wingFlap);
  const wingGrad = ctx.createLinearGradient(0, 0, -size * 0.6, 0);
  wingGrad.addColorStop(0, "#6d28d9");
  wingGrad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.4, -size * 0.3, -size * 0.7, -size * 0.1);
  ctx.lineTo(-size * 0.6, size * 0.05);
  ctx.lineTo(-size * 0.45, 0);
  ctx.lineTo(-size * 0.5, size * 0.1);
  ctx.lineTo(-size * 0.3, size * 0.05);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.1, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();
  // Wing feathers
  ctx.strokeStyle = "#7c3aed";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.1 - i * size * 0.12, size * 0.02);
    ctx.lineTo(-size * 0.15 - i * size * 0.15, -size * 0.1);
    ctx.stroke();
  }
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.translate(x + size * 0.15, y - size * 0.1 + swoop);
  ctx.rotate(0.3 + wingFlap);
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.4, -size * 0.3, size * 0.7, -size * 0.1);
  ctx.lineTo(size * 0.6, size * 0.05);
  ctx.lineTo(size * 0.45, 0);
  ctx.lineTo(size * 0.5, size * 0.1);
  ctx.lineTo(size * 0.3, size * 0.05);
  ctx.quadraticCurveTo(size * 0.15, size * 0.1, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Body (feminine bird-like)
  const bodyGrad = ctx.createLinearGradient(
    x,
    y - size * 0.3,
    x,
    y + size * 0.3
  );
  bodyGrad.addColorStop(0, "#8b5cf6");
  bodyGrad.addColorStop(1, "#6d28d9");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + swoop, size * 0.2, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feathered chest
  ctx.fillStyle = "#ddd6fe";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.05 + swoop,
    size * 0.12,
    size * 0.15,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Face (fierce feminine)
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.32 + swoop, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Wild feather hair
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.42 + swoop);
  ctx.quadraticCurveTo(
    x - size * 0.2,
    y - size * 0.6,
    x - size * 0.05,
    y - size * 0.55 + swoop
  );
  ctx.quadraticCurveTo(
    x,
    y - size * 0.7,
    x + size * 0.05,
    y - size * 0.55 + swoop
  );
  ctx.quadraticCurveTo(
    x + size * 0.2,
    y - size * 0.6,
    x + size * 0.12,
    y - size * 0.42 + swoop
  );
  ctx.fill();

  // Fierce eyes
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.05,
    y - size * 0.34 + swoop,
    size * 0.035,
    size * 0.025,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.05,
    y - size * 0.34 + swoop,
    size * 0.035,
    size * 0.025,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.05,
    y - size * 0.34 + swoop,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.05,
    y - size * 0.34 + swoop,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Sharp beak
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28 + swoop);
  ctx.lineTo(x - size * 0.04, y - size * 0.22 + swoop);
  ctx.lineTo(x + size * 0.04, y - size * 0.22 + swoop);
  ctx.fill();

  // Talons
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2 * zoom;
  for (let leg = 0; leg < 2; leg++) {
    const legX = x + (leg === 0 ? -size * 0.1 : size * 0.1);
    ctx.beginPath();
    ctx.moveTo(legX, y + size * 0.25 + swoop);
    ctx.lineTo(legX, y + size * 0.45 + swoop);
    ctx.stroke();
    // Talon claws
    ctx.fillStyle = "#1a1a2e";
    for (let claw = 0; claw < 3; claw++) {
      ctx.beginPath();
      ctx.moveTo(legX + (claw - 1) * size * 0.04, y + size * 0.45 + swoop);
      ctx.lineTo(legX + (claw - 1) * size * 0.06, y + size * 0.52 + swoop);
      ctx.lineTo(legX + (claw - 1) * size * 0.02, y + size * 0.45 + swoop);
      ctx.fill();
    }
  }
}

function drawWyvernEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // WYVERN - Massive winged beast breathing poison
  const wingFlap = Math.sin(time * 6) * 0.35;
  const breathe = Math.sin(time * 2) * 2 * zoom;
  const tailSwing = Math.sin(time * 3) * 0.2;

  // Large shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.6, size * 0.6, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.save();
  ctx.translate(x + size * 0.3, y + size * 0.2);
  ctx.rotate(tailSwing);
  ctx.fillStyle = "#047857";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.4, size * 0.1, size * 0.7, 0);
  ctx.quadraticCurveTo(size * 0.4, -size * 0.05, 0, -size * 0.08);
  ctx.fill();
  // Tail spike
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.moveTo(size * 0.65, 0);
  ctx.lineTo(size * 0.85, -size * 0.08);
  ctx.lineTo(size * 0.75, size * 0.05);
  ctx.fill();
  ctx.restore();

  // Left wing
  ctx.save();
  ctx.translate(x - size * 0.2, y - size * 0.15 + breathe);
  ctx.rotate(-0.4 - wingFlap);
  const wingGrad = ctx.createLinearGradient(0, 0, -size * 0.8, 0);
  wingGrad.addColorStop(0, "#059669");
  wingGrad.addColorStop(1, "#047857");
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.3, -size * 0.4);
  ctx.lineTo(-size * 0.7, -size * 0.3);
  ctx.lineTo(-size * 0.85, -size * 0.1);
  ctx.lineTo(-size * 0.75, size * 0.05);
  ctx.lineTo(-size * 0.55, size * 0.02);
  ctx.lineTo(-size * 0.6, size * 0.15);
  ctx.lineTo(-size * 0.35, size * 0.1);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.15, 0, size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Wing membrane lines
  ctx.strokeStyle = "#065f46";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.7, -size * 0.15);
  ctx.moveTo(-size * 0.15, size * 0.05);
  ctx.lineTo(-size * 0.6, 0);
  ctx.stroke();
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.translate(x + size * 0.2, y - size * 0.15 + breathe);
  ctx.rotate(0.4 + wingFlap);
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.3, -size * 0.4);
  ctx.lineTo(size * 0.7, -size * 0.3);
  ctx.lineTo(size * 0.85, -size * 0.1);
  ctx.lineTo(size * 0.75, size * 0.05);
  ctx.lineTo(size * 0.55, size * 0.02);
  ctx.lineTo(size * 0.6, size * 0.15);
  ctx.lineTo(size * 0.35, size * 0.1);
  ctx.quadraticCurveTo(size * 0.15, size * 0.15, 0, size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Main body (dragon-like)
  const bodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.4);
  bodyGrad.addColorStop(0, "#10b981");
  bodyGrad.addColorStop(1, "#059669");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.05 + breathe,
    size * 0.3,
    size * 0.35,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Belly scales
  ctx.fillStyle = "#a7f3d0";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.1 + breathe,
    size * 0.18,
    size * 0.22,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Scale lines
  ctx.strokeStyle = "#6ee7b7";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(
      x,
      y + size * 0.1 + breathe,
      size * 0.06 + i * size * 0.04,
      0.3 * Math.PI,
      0.7 * Math.PI
    );
    ctx.stroke();
  }

  // Neck
  ctx.fillStyle = "#059669";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.2 + breathe);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.4,
    x + size * 0.05,
    y - size * 0.5 + breathe
  );
  ctx.lineTo(x + size * 0.12, y - size * 0.45 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.1,
    y - size * 0.35,
    x + size * 0.1,
    y - size * 0.2 + breathe
  );
  ctx.fill();

  // Head
  ctx.fillStyle = "#047857";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.02,
    y - size * 0.55 + breathe,
    size * 0.15,
    size * 0.12,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Snout
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.52 + breathe,
    size * 0.1,
    size * 0.06,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Glowing eyes
  ctx.fillStyle = "#fbbf24";
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.02,
    y - size * 0.58 + breathe,
    size * 0.035,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.55 + breathe,
    size * 0.03,
    size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.02,
    y - size * 0.58 + breathe,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.1,
    y - size * 0.55 + breathe,
    size * 0.012,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Horns
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.62 + breathe);
  ctx.lineTo(x + size * 0.15, y - size * 0.75 + breathe);
  ctx.lineTo(x + size * 0.12, y - size * 0.6 + breathe);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.64 + breathe);
  ctx.lineTo(x - size * 0.05, y - size * 0.78 + breathe);
  ctx.lineTo(x + size * 0.02, y - size * 0.62 + breathe);
  ctx.fill();

  // Poison breath effect
  const poisonAlpha = 0.3 + Math.sin(time * 4) * 0.2;
  ctx.fillStyle = `rgba(74, 222, 128, ${poisonAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.25,
    y - size * 0.45 + breathe,
    size * 0.1 + Math.sin(time * 5) * size * 0.03,
    size * 0.06,
    0.5,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Legs with claws
  ctx.fillStyle = "#047857";
  // Left leg
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.3 + breathe);
  ctx.lineTo(x - size * 0.2, y + size * 0.55);
  ctx.lineTo(x - size * 0.12, y + size * 0.55);
  ctx.lineTo(x - size * 0.1, y + size * 0.32 + breathe);
  ctx.fill();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y + size * 0.3 + breathe);
  ctx.lineTo(x + size * 0.2, y + size * 0.55);
  ctx.lineTo(x + size * 0.12, y + size * 0.55);
  ctx.lineTo(x + size * 0.1, y + size * 0.32 + breathe);
  ctx.fill();
  // Claws
  ctx.fillStyle = "#1a1a2e";
  for (let leg = 0; leg < 2; leg++) {
    const legX = leg === 0 ? x - size * 0.16 : x + size * 0.16;
    for (let claw = 0; claw < 3; claw++) {
      ctx.beginPath();
      ctx.moveTo(legX + (claw - 1) * size * 0.04, y + size * 0.55);
      ctx.lineTo(legX + (claw - 1) * size * 0.05, y + size * 0.62);
      ctx.lineTo(legX + (claw - 1) * size * 0.03, y + size * 0.55);
      ctx.fill();
    }
  }
}

function drawSpecterEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // SPECTER - Ghostly apparition that phases through attacks
  const phase = Math.sin(time * 2) * 5 * zoom;
  const flicker = 0.5 + Math.sin(time * 8) * 0.3;
  const waver = Math.sin(time * 4) * 0.1;

  // Ethereal trail
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = `rgba(148, 163, 184, ${0.15 - i * 0.03})`;
    ctx.beginPath();
    ctx.ellipse(
      x + i * 5,
      y + i * 3 + phase,
      size * (0.35 - i * 0.05),
      size * (0.45 - i * 0.05),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Main ghostly form
  const ghostGrad = ctx.createRadialGradient(
    x,
    y - size * 0.1,
    0,
    x,
    y,
    size * 0.5
  );
  ghostGrad.addColorStop(0, `rgba(226, 232, 240, ${flicker})`);
  ghostGrad.addColorStop(0.5, `rgba(148, 163, 184, ${flicker * 0.7})`);
  ghostGrad.addColorStop(1, `rgba(100, 116, 139, 0)`);
  ctx.fillStyle = ghostGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.4);
  for (let i = 0; i < 6; i++) {
    const waveX = x - size * 0.3 + i * size * 0.12;
    const waveY = y + size * 0.4 + Math.sin(time * 5 + i) * size * 0.08;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y,
    x + size * 0.2,
    y - size * 0.4 + phase
  );
  ctx.quadraticCurveTo(
    x,
    y - size * 0.5 + phase,
    x - size * 0.2,
    y - size * 0.4 + phase
  );
  ctx.quadraticCurveTo(x - size * 0.35, y, x - size * 0.3, y + size * 0.4);
  ctx.fill();

  // Inner dark void
  ctx.fillStyle = `rgba(30, 41, 59, ${flicker * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.1 + phase,
    size * 0.15,
    size * 0.2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Skull-like face emerging
  ctx.fillStyle = `rgba(248, 250, 252, ${flicker})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.25 + phase, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Hollow eye sockets
  ctx.fillStyle = `rgba(15, 23, 42, ${flicker})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.07,
    y - size * 0.28 + phase,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.07,
    y - size * 0.28 + phase,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Soul fire in eyes
  ctx.fillStyle = `rgba(56, 189, 248, ${flicker})`;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.28 + phase,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.07,
    y - size * 0.28 + phase,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ghostly mouth (wailing)
  ctx.fillStyle = `rgba(15, 23, 42, ${flicker * 0.7})`;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.15 + phase,
    size * 0.06,
    size * 0.08 + Math.sin(time * 6) * size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Wispy arms
  ctx.strokeStyle = `rgba(148, 163, 184, ${flicker * 0.6})`;
  ctx.lineWidth = 3 * zoom;
  // Left arm
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.1 + phase);
  ctx.quadraticCurveTo(
    x - size * 0.45 + Math.sin(time * 3) * size * 0.05,
    y + size * 0.1,
    x - size * 0.4 + waver * size,
    y + size * 0.3
  );
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.1 + phase);
  ctx.quadraticCurveTo(
    x + size * 0.45 - Math.sin(time * 3) * size * 0.05,
    y + size * 0.1,
    x + size * 0.4 - waver * size,
    y + size * 0.3
  );
  ctx.stroke();

  // Chains (bound spirit)
  ctx.strokeStyle = `rgba(71, 85, 105, ${flicker * 0.8})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.1 + phase);
  for (let i = 0; i < 5; i++) {
    ctx.arc(
      x - size * 0.15 - i * size * 0.06,
      y + size * 0.15 + phase + i * size * 0.05,
      size * 0.03,
      0,
      Math.PI * 2
    );
  }
  ctx.stroke();
}

function drawBerserkerEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // BERSERKER - Frenzied warrior charging at incredible speed
  const rage = Math.sin(time * 12) * 3 * zoom;
  const breathe = Math.sin(time * 8) * 0.08;
  const armSwing = Math.sin(time * 10) * 0.4;

  // Rage aura
  const rageGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.7);
  rageGrad.addColorStop(0, `rgba(220, 38, 38, 0.3)`);
  rageGrad.addColorStop(0.6, `rgba(220, 38, 38, 0.1)`);
  rageGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
  ctx.fillStyle = rageGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Motion blur effect
  ctx.globalAlpha = 0.3;
  for (let i = 1; i < 3; i++) {
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.ellipse(x + i * 8, y, size * 0.25, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Muscular body (fur/leather)
  const bodyGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  bodyGrad.addColorStop(0, "#7f1d1d");
  bodyGrad.addColorStop(0.5, "#dc2626");
  bodyGrad.addColorStop(1, "#7f1d1d");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.4);
  ctx.lineTo(x - size * 0.4 - breathe * size, y - size * 0.1);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.4,
    x + size * 0.4 + breathe * size,
    y - size * 0.1
  );
  ctx.lineTo(x + size * 0.35, y + size * 0.4);
  ctx.closePath();
  ctx.fill();

  // War paint stripes on body
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(x - size * 0.25, y - size * 0.15, size * 0.08, size * 0.35);
  ctx.fillRect(x + size * 0.17, y - size * 0.15, size * 0.08, size * 0.35);

  // Massive arms
  // Left arm with axe
  ctx.save();
  ctx.translate(x - size * 0.35, y - size * 0.1);
  ctx.rotate(-0.5 + armSwing);
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(-size * 0.08, 0, size * 0.16, size * 0.35);
  // Axe
  ctx.fillStyle = "#4a4a52";
  ctx.fillRect(-size * 0.03, size * 0.3, size * 0.06, size * 0.25);
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, size * 0.5);
  ctx.lineTo(-size * 0.18, size * 0.4);
  ctx.lineTo(-size * 0.18, size * 0.6);
  ctx.lineTo(-size * 0.02, size * 0.55);
  ctx.fill();
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(x + size * 0.35, y - size * 0.1);
  ctx.rotate(0.5 - armSwing);
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(-size * 0.08, 0, size * 0.16, size * 0.35);
  ctx.restore();

  // Fierce head
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + rage * 0.3, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // War paint on face
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(
    x - size * 0.15,
    y - size * 0.4 + rage * 0.3,
    size * 0.3,
    size * 0.04
  );
  ctx.fillRect(
    x - size * 0.08,
    y - size * 0.32 + rage * 0.3,
    size * 0.03,
    size * 0.08
  );
  ctx.fillRect(
    x + size * 0.05,
    y - size * 0.32 + rage * 0.3,
    size * 0.03,
    size * 0.08
  );

  // Crazed eyes (red glow)
  ctx.fillStyle = "#fef2f2";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.37 + rage * 0.3,
    size * 0.045,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.07,
    y - size * 0.37 + rage * 0.3,
    size * 0.045,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.37 + rage * 0.3,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.07,
    y - size * 0.37 + rage * 0.3,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Screaming mouth
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.26 + rage * 0.3,
    size * 0.08,
    size * 0.05 + Math.abs(rage) * 0.01,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Teeth
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(
    x - size * 0.06,
    y - size * 0.28 + rage * 0.3,
    size * 0.04,
    size * 0.025
  );
  ctx.fillRect(
    x + size * 0.02,
    y - size * 0.28 + rage * 0.3,
    size * 0.04,
    size * 0.025
  );

  // Wild hair
  ctx.fillStyle = "#991b1b";
  for (let i = 0; i < 7; i++) {
    const hairAngle = -Math.PI * 0.3 + i * Math.PI * 0.1;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(hairAngle) * size * 0.15,
      y - size * 0.45 + rage * 0.3
    );
    ctx.quadraticCurveTo(
      x +
        Math.cos(hairAngle) * size * 0.25 +
        Math.sin(time * 8 + i) * size * 0.05,
      y - size * 0.6 + rage * 0.3,
      x + Math.cos(hairAngle) * size * 0.2,
      y - size * 0.7 + rage * 0.3
    );
    ctx.lineTo(
      x + Math.cos(hairAngle) * size * 0.12,
      y - size * 0.42 + rage * 0.3
    );
    ctx.fill();
  }
}

function drawGolemEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // STONE GOLEM - Ancient construct of living stone
  const stomp = Math.abs(Math.sin(time * 2)) * 3 * zoom;
  const crackGlow = 0.4 + Math.sin(time * 3) * 0.3;

  // Heavy shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (massive stone pillars)
  ctx.fillStyle = "#57534e";
  // Left leg
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y + size * 0.15);
  ctx.lineTo(x - size * 0.35, y + size * 0.5 + stomp);
  ctx.lineTo(x - size * 0.15, y + size * 0.5 + stomp);
  ctx.lineTo(x - size * 0.1, y + size * 0.15);
  ctx.fill();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + size * 0.15);
  ctx.lineTo(x + size * 0.35, y + size * 0.5 - stomp * 0.5);
  ctx.lineTo(x + size * 0.15, y + size * 0.5 - stomp * 0.5);
  ctx.lineTo(x + size * 0.1, y + size * 0.15);
  ctx.fill();

  // Massive torso
  const stoneGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y,
    x + size * 0.4,
    y
  );
  stoneGrad.addColorStop(0, "#44403c");
  stoneGrad.addColorStop(0.3, "#57534e");
  stoneGrad.addColorStop(0.5, "#78716c");
  stoneGrad.addColorStop(0.7, "#57534e");
  stoneGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = stoneGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.2);
  ctx.lineTo(x - size * 0.45, y - size * 0.25);
  ctx.quadraticCurveTo(x, y - size * 0.45, x + size * 0.45, y - size * 0.25);
  ctx.lineTo(x + size * 0.4, y + size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Stone texture cracks
  ctx.strokeStyle = "#292524";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.3);
  ctx.lineTo(x - size * 0.15, y);
  ctx.lineTo(x - size * 0.25, y + size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.25);
  ctx.lineTo(x + size * 0.2, y + size * 0.1);
  ctx.stroke();

  // Glowing rune cracks (magical energy)
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 8 * zoom;
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.2);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size * 0.1, y - size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y + size * 0.05);
  ctx.lineTo(x + size * 0.15, y + size * 0.1);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Massive arms
  ctx.fillStyle = "#57534e";
  // Left arm
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.2);
  ctx.lineTo(x - size * 0.6, y + size * 0.15);
  ctx.lineTo(x - size * 0.5, y + size * 0.25);
  ctx.lineTo(x - size * 0.35, y - size * 0.1);
  ctx.fill();
  // Left fist
  ctx.beginPath();
  ctx.arc(x - size * 0.55, y + size * 0.25, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.4, y - size * 0.2);
  ctx.lineTo(x + size * 0.6, y + size * 0.15);
  ctx.lineTo(x + size * 0.5, y + size * 0.25);
  ctx.lineTo(x + size * 0.35, y - size * 0.1);
  ctx.fill();
  // Right fist
  ctx.beginPath();
  ctx.arc(x + size * 0.55, y + size * 0.25, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Head (angular stone block)
  ctx.fillStyle = "#78716c";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.35);
  ctx.lineTo(x - size * 0.22, y - size * 0.55);
  ctx.lineTo(x, y - size * 0.65);
  ctx.lineTo(x + size * 0.22, y - size * 0.55);
  ctx.lineTo(x + size * 0.2, y - size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Glowing eyes
  ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow + 0.3})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.48,
    size * 0.04,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.48,
    size * 0.04,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ancient rune on forehead
  ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow})`;
  ctx.font = `${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ᚷ", x, y - size * 0.55);

  // Moss/lichen patches
  ctx.fillStyle = "#4d7c0f";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.3,
    y - size * 0.1,
    size * 0.06,
    size * 0.04,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.25,
    y + size * 0.05,
    size * 0.05,
    size * 0.03,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawNecromancerEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // NECROMANCER - Dark sorcerer who raises fallen enemies
  const hover = Math.sin(time * 2) * 4 * zoom;
  const deathPulse = 0.5 + Math.sin(time * 3) * 0.3;

  // Death aura
  const deathGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.75);
  deathGrad.addColorStop(0, `rgba(30, 27, 75, ${deathPulse * 0.4})`);
  deathGrad.addColorStop(0.6, `rgba(30, 27, 75, ${deathPulse * 0.15})`);
  deathGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = deathGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Floating skull spirits
  for (let i = 0; i < 3; i++) {
    const spiritAngle = time * 1.5 + i * Math.PI * 0.67;
    const spiritX = x + Math.cos(spiritAngle) * size * 0.55;
    const spiritY = y - size * 0.1 + Math.sin(spiritAngle) * size * 0.25;
    ctx.fillStyle = `rgba(200, 200, 200, ${
      0.4 + Math.sin(time * 4 + i) * 0.2
    })`;
    ctx.beginPath();
    ctx.arc(spiritX, spiritY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    // Skull eyes
    ctx.fillStyle = `rgba(74, 222, 128, ${deathPulse})`;
    ctx.beginPath();
    ctx.arc(
      spiritX - size * 0.015,
      spiritY - size * 0.01,
      size * 0.012,
      0,
      Math.PI * 2
    );
    ctx.arc(
      spiritX + size * 0.015,
      spiritY - size * 0.01,
      size * 0.012,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Shadow
  ctx.fillStyle = "rgba(30, 27, 75, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark robes
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5);
  for (let i = 0; i < 5; i++) {
    const jagX = x - size * 0.38 + i * size * 0.19;
    const jagY = y + size * 0.5 + Math.sin(time * 4 + i) * size * 0.04;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.4,
    y,
    x + size * 0.15,
    y - size * 0.4 + hover
  );
  ctx.lineTo(x - size * 0.15, y - size * 0.4 + hover);
  ctx.quadraticCurveTo(x - size * 0.4, y, x - size * 0.38, y + size * 0.5);
  ctx.fill();

  // Bone decorations on robe
  ctx.fillStyle = "#e8e0d0";
  for (let i = 0; i < 3; i++) {
    const boneY = y - size * 0.1 + i * size * 0.15 + hover;
    ctx.beginPath();
    ctx.ellipse(x, boneY, size * 0.03, size * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Skeletal face
  ctx.fillStyle = "#e8e0d0";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + hover, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Hollow eye sockets
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.44 + hover,
    size * 0.04,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.44 + hover,
    size * 0.04,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Green necromantic eyes
  ctx.fillStyle = "#4ade80";
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06,
    y - size * 0.44 + hover,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.06,
    y - size * 0.44 + hover,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Skeletal nose hole
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.38 + hover);
  ctx.lineTo(x - size * 0.02, y - size * 0.34 + hover);
  ctx.lineTo(x + size * 0.02, y - size * 0.34 + hover);
  ctx.fill();

  // Teeth
  ctx.fillStyle = "#e8e0d0";
  ctx.fillRect(
    x - size * 0.06,
    y - size * 0.32 + hover,
    size * 0.12,
    size * 0.03
  );
  ctx.strokeStyle = "#1e1b4b";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.05 + i * size * 0.025, y - size * 0.32 + hover);
    ctx.lineTo(x - size * 0.05 + i * size * 0.025, y - size * 0.29 + hover);
    ctx.stroke();
  }

  // Hood
  ctx.fillStyle = "#0f0a2e";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.5 + hover, size * 0.2, size * 0.1, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.5 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.25,
    y - size * 0.3 + hover,
    x - size * 0.18,
    y - size * 0.15 + hover
  );
  ctx.lineTo(x - size * 0.15, y - size * 0.3 + hover);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.5 + hover);
  ctx.quadraticCurveTo(
    x + size * 0.25,
    y - size * 0.3 + hover,
    x + size * 0.18,
    y - size * 0.15 + hover
  );
  ctx.lineTo(x + size * 0.15, y - size * 0.3 + hover);
  ctx.fill();

  // Skull-topped staff
  ctx.strokeStyle = "#3d3d3d";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.2 + hover);
  ctx.lineTo(x - size * 0.4, y + size * 0.45);
  ctx.stroke();
  // Staff skull
  ctx.fillStyle = "#e8e0d0";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.35,
    y - size * 0.28 + hover,
    size * 0.08,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Skull eyes
  ctx.fillStyle = "#4ade80";
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur = 5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.37,
    y - size * 0.29 + hover,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x - size * 0.33,
    y - size * 0.29 + hover,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawShadowKnightEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number
) {
  // SHADOW KNIGHT - Fallen champion clad in cursed armor
  const stance = Math.sin(time * 3) * 2 * zoom;
  const darkPulse = 0.5 + Math.sin(time * 4) * 0.3;
  const capeWave = Math.sin(time * 5) * 0.15;

  // Dark aura
  const shadowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.7);
  shadowGrad.addColorStop(0, `rgba(24, 24, 27, ${darkPulse * 0.35})`);
  shadowGrad.addColorStop(0.6, `rgba(24, 24, 27, ${darkPulse * 0.15})`);
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tattered cape
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.25 + stance);
  ctx.quadraticCurveTo(
    x - size * 0.4 - capeWave * size,
    y + size * 0.2,
    x - size * 0.35,
    y + size * 0.5
  );
  for (let i = 0; i < 4; i++) {
    const jagX = x - size * 0.35 + i * size * 0.23;
    const jagY =
      y +
      size * 0.5 +
      (i % 2) * size * 0.06 +
      Math.sin(time * 4 + i) * size * 0.03;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.4 + capeWave * size,
    y + size * 0.2,
    x + size * 0.25,
    y - size * 0.25 + stance
  );
  ctx.fill();

  // Armored body
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  armorGrad.addColorStop(0, "#27272a");
  armorGrad.addColorStop(0.3, "#3f3f46");
  armorGrad.addColorStop(0.5, "#52525b");
  armorGrad.addColorStop(0.7, "#3f3f46");
  armorGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.35);
  ctx.lineTo(x - size * 0.35, y - size * 0.15 + stance);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.35 + stance,
    x + size * 0.35,
    y - size * 0.15 + stance
  );
  ctx.lineTo(x + size * 0.3, y + size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Armor details
  ctx.strokeStyle = "#18181b";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25 + stance);
  ctx.lineTo(x, y + size * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.05 + stance);
  ctx.lineTo(x + size * 0.25, y - size * 0.05 + stance);
  ctx.stroke();

  // Cursed runes on armor
  ctx.fillStyle = `rgba(139, 92, 246, ${darkPulse})`;
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("◆", x, y + size * 0.1);

  // Shoulder pauldrons
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.32,
    y - size * 0.15 + stance,
    size * 0.12,
    size * 0.08,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.32,
    y - size * 0.15 + stance,
    size * 0.12,
    size * 0.08,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Spikes on pauldrons
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.2 + stance);
  ctx.lineTo(x - size * 0.42, y - size * 0.35 + stance);
  ctx.lineTo(x - size * 0.32, y - size * 0.18 + stance);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.2 + stance);
  ctx.lineTo(x + size * 0.42, y - size * 0.35 + stance);
  ctx.lineTo(x + size * 0.32, y - size * 0.18 + stance);
  ctx.fill();

  // Helmet (evil great helm)
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + stance, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  // Helmet visor
  ctx.fillStyle = "#18181b";
  ctx.fillRect(
    x - size * 0.14,
    y - size * 0.45 + stance,
    size * 0.28,
    size * 0.12
  );
  // Visor slit
  ctx.fillStyle = "#0a0a0b";
  ctx.fillRect(
    x - size * 0.12,
    y - size * 0.42 + stance,
    size * 0.24,
    size * 0.04
  );
  // Glowing eyes behind visor
  ctx.fillStyle = `rgba(139, 92, 246, ${darkPulse + 0.3})`;
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06,
    y - size * 0.4 + stance,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.06,
    y - size * 0.4 + stance,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  // Helmet horns
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.52 + stance);
  ctx.lineTo(x - size * 0.2, y - size * 0.7 + stance);
  ctx.lineTo(x - size * 0.08, y - size * 0.55 + stance);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.52 + stance);
  ctx.lineTo(x + size * 0.2, y - size * 0.7 + stance);
  ctx.lineTo(x + size * 0.08, y - size * 0.55 + stance);
  ctx.fill();

  // Dark sword
  ctx.save();
  ctx.translate(x + size * 0.35, y + stance);
  ctx.rotate(0.3);
  // Blade
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.04, -size * 0.5);
  ctx.lineTo(0, -size * 0.6);
  ctx.lineTo(size * 0.04, -size * 0.5);
  ctx.closePath();
  ctx.fill();
  // Dark energy on blade
  ctx.strokeStyle = `rgba(139, 92, 246, ${darkPulse})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.lineTo(0, -size * 0.5);
  ctx.stroke();
  // Hilt
  ctx.fillStyle = "#52525b";
  ctx.fillRect(-size * 0.08, -size * 0.02, size * 0.16, size * 0.04);
  ctx.fillStyle = "#27272a";
  ctx.fillRect(-size * 0.02, 0, size * 0.04, size * 0.12);
  ctx.restore();

  // Shield (left arm)
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.1 + stance);
  ctx.lineTo(x - size * 0.5, y - size * 0.05 + stance);
  ctx.lineTo(x - size * 0.5, y + size * 0.2 + stance);
  ctx.lineTo(x - size * 0.4, y + size * 0.3 + stance);
  ctx.lineTo(x - size * 0.35, y + size * 0.2 + stance);
  ctx.closePath();
  ctx.fill();
  // Shield emblem
  ctx.fillStyle = `rgba(139, 92, 246, ${darkPulse})`;
  ctx.font = `${size * 0.1}px serif`;
  ctx.fillText("☠", x - size * 0.42, y + size * 0.12 + stance);
}
export function renderHero(
  ctx: CanvasRenderingContext2D,
  hero: Hero,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const screenPos = worldToScreen(
    hero.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const hData = HERO_DATA[hero.type];
  const time = Date.now() / 1000;

  // Selection glow
  if (hero.selected) {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3 * zoom;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 3 * zoom,
      40 * zoom,
      20 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 8 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const size = 32 * zoom;
  const attackPhase = hero.attackAnim > 0 ? hero.attackAnim / 300 : 0;
  const attackScale = attackPhase > 0 ? 1 + attackPhase * 0.2 : 1;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - size / 2);
  ctx.scale(attackScale, attackScale);

  // Draw specific hero type with attack animation
  drawHeroSprite(
    ctx,
    0,
    0,
    size,
    hero.type,
    hData.color,
    time,
    zoom,
    attackPhase
  );

  ctx.restore();

  // HP Bar
  const barWidth = 45 * zoom;
  const barHeight = 6 * zoom;
  const barY = screenPos.y - size - 18 * zoom;

  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(
    screenPos.x - barWidth / 2 - 1,
    barY - 1,
    barWidth + 2,
    barHeight + 2
  );
  ctx.fillStyle = "#333";
  ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth, barHeight);

  const hpPercent = hero.hp / hero.maxHp;
  ctx.fillStyle =
    hpPercent > 0.5 ? "#4ade80" : hpPercent > 0.25 ? "#fbbf24" : "#ef4444";
  ctx.fillRect(
    screenPos.x - barWidth / 2,
    barY,
    barWidth * hpPercent,
    barHeight
  );

  // Name tag with glow
  ctx.shadowColor = hData.color;
  ctx.shadowBlur = 4 * zoom;
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${10 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(hData.name, screenPos.x, barY - 5 * zoom);
  ctx.shadowBlur = 0;
}

function drawHeroSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  switch (type) {
    case "tiger":
      drawTigerHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "tenor":
      drawTenorHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "mathey":
      drawMatheyKnightHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "rocky":
      drawRockyHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "scott":
    case "fscott":
      drawFScottHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "captain":
      drawCaptainHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "engineer":
      drawEngineerHero(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    default:
      drawDefaultHero(ctx, x, y, size, color, time, zoom, attackPhase);
  }
}

function drawTigerHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Princeton Tiger - Dark Fantasy Apex Predator with devastating claw attacks
  const breathe = Math.sin(time * 2) * 2;
  const isAttacking = attackPhase > 0;
  const clawSwipe = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.5 : 0;
  const bodyLean = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.2 : 0;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  // === DARK FLAME AURA ===
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase + ring * 0.1) % 1;
      const ringAlpha = (1 - ringPhase) * 0.4 * attackIntensity;
      ctx.strokeStyle = `rgba(255, 80, 0, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y - size * 0.1,
        size * (0.7 + ringPhase * 0.4),
        size * (0.8 + ringPhase * 0.4),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === SHADOW BENEATH ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.5, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === MUSCULAR TIGER BODY ===
  const bodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.6);
  bodyGrad.addColorStop(0, "#ff9933");
  bodyGrad.addColorStop(0.4, "#ff6600");
  bodyGrad.addColorStop(0.7, "#cc4400");
  bodyGrad.addColorStop(1, "#8b2200");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + breathe,
    size * 0.48,
    size * 0.58 + breathe * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === DARK TIGER STRIPES ===
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 3.5 * zoom;
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const stripeY = y - size * 0.25 + i * size * 0.14 + breathe;
    const stripeWave = Math.sin(time * 2 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, stripeY + stripeWave);
    ctx.quadraticCurveTo(
      x - size * 0.15,
      stripeY - size * 0.1,
      x - size * 0.05,
      stripeY
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.35, stripeY - stripeWave);
    ctx.quadraticCurveTo(
      x + size * 0.15,
      stripeY - size * 0.1,
      x + size * 0.05,
      stripeY
    );
    ctx.stroke();
  }

  // === POWERFUL ARMS/SHOULDERS ===
  const armOffset = isAttacking ? clawSwipe * size * 0.15 : 0;
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.42 - armOffset,
    y - size * 0.08,
    size * 0.2,
    size * 0.28,
    -0.3 - clawSwipe * 0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.42 + armOffset,
    y - size * 0.08,
    size * 0.2,
    size * 0.28,
    0.3 + clawSwipe * 0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === DEADLY CLAWS ===
  for (let side = -1; side <= 1; side += 2) {
    const clawX = x + side * (size * 0.55 + armOffset * side);
    const clawY = y + size * 0.15;
    const clawExtend = isAttacking ? attackIntensity * size * 0.15 : 0;

    ctx.fillStyle = "#1a1a1a";
    for (let c = 0; c < 4; c++) {
      const clawAngle = (c - 1.5) * 0.25 + side * (clawSwipe * 0.5);
      ctx.save();
      ctx.translate(clawX, clawY);
      ctx.rotate(clawAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size * 0.02, size * 0.08 + clawExtend);
      ctx.lineTo(size * 0.02, size * 0.08 + clawExtend);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Claw slash effect during attack
    if (isAttacking && attackPhase > 0.3 && attackPhase < 0.8) {
      const slashAlpha = Math.sin(((attackPhase - 0.3) / 0.5) * Math.PI) * 0.7;
      ctx.strokeStyle = `rgba(255, 200, 100, ${slashAlpha})`;
      ctx.lineWidth = 3 * zoom;
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        ctx.moveTo(clawX, clawY);
        ctx.lineTo(
          clawX + side * size * 0.3,
          clawY + size * 0.2 + s * size * 0.08
        );
        ctx.stroke();
      }
    }
  }

  // === FIERCE TIGER HEAD ===
  const headGrad = ctx.createRadialGradient(
    x,
    y - size * 0.45,
    0,
    x,
    y - size * 0.45,
    size * 0.35
  );
  headGrad.addColorStop(0, "#ffa040");
  headGrad.addColorStop(0.6, "#d07000");
  headGrad.addColorStop(1, "#cc5500");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.45, size * 0.34, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // === HEAD STRIPES (darker, more menacing) ===
  ctx.strokeStyle = "#0a0505";
  ctx.lineWidth = 3 * zoom;
  ctx.lineCap = "round";
  // Forehead V mark
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.68);
  ctx.lineTo(x - size * 0.08, y - size * 0.48);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.68);
  ctx.lineTo(x + size * 0.08, y - size * 0.48);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.72);
  ctx.lineTo(x, y - size * 0.52);
  ctx.stroke();
  // Cheek stripes (more jagged)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.48);
  ctx.lineTo(x - size * 0.2, y - size * 0.42);
  ctx.lineTo(x - size * 0.28, y - size * 0.38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.32, y - size * 0.48);
  ctx.lineTo(x + size * 0.2, y - size * 0.42);
  ctx.lineTo(x + size * 0.28, y - size * 0.38);
  ctx.stroke();

  // === EARS (more pointed, darker tips) ===
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = "#d07000";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.25, y - size * 0.62);
    ctx.lineTo(x + side * size * 0.38, y - size * 0.85);
    ctx.lineTo(x + side * size * 0.15, y - size * 0.67);
    ctx.closePath();
    ctx.fill();
    // Dark ear tips
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.32, y - size * 0.78);
    ctx.lineTo(x + side * size * 0.38, y - size * 0.85);
    ctx.lineTo(x + side * size * 0.28, y - size * 0.76);
    ctx.closePath();
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "#ffccaa";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.24, y - size * 0.64);
    ctx.lineTo(x + side * size * 0.32, y - size * 0.75);
    ctx.lineTo(x + side * size * 0.18, y - size * 0.66);
    ctx.closePath();
    ctx.fill();
  }

  // === MUZZLE ===
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.38, size * 0.16, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#1a0a05";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.44);
  ctx.lineTo(x - size * 0.06, y - size * 0.38);
  ctx.quadraticCurveTo(x, y - size * 0.36, x + size * 0.06, y - size * 0.38);
  ctx.closePath();
  ctx.fill();

  // === GLOWING FIERCE EYES ===
  const eyeGlow = 0.8 + Math.sin(time * 4) * 0.2 + attackIntensity * 0.3;
  ctx.shadowColor = isAttacking ? "#ff3300" : "#ffcc00";
  ctx.shadowBlur = (10 + attackIntensity * 8) * zoom;
  ctx.fillStyle = isAttacking
    ? `rgba(200, 80, 0, ${eyeGlow})`
    : `rgba(255, 204, 0, ${eyeGlow})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.13,
    y - size * 0.54,
    size * 0.09,
    size * 0.065,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.13,
    y - size * 0.54,
    size * 0.09,
    size * 0.065,
    0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Slit pupils (more menacing)
  ctx.fillStyle = "#0a0505";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.13,
    y - size * 0.54,
    size * 0.025,
    size * 0.055,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.13,
    y - size * 0.54,
    size * 0.025,
    size * 0.055,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Eye glints
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.11, y - size * 0.56, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.15, y - size * 0.56, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // === ROARING MOUTH (wider during attack) ===
  const mouthOpen = isAttacking
    ? size * 0.04 + attackIntensity * size * 0.06
    : size * 0.04;
  ctx.fillStyle = "#4a0000";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.3,
    size * 0.12 + attackIntensity * 0.03,
    mouthOpen,
    0,
    0,
    Math.PI
  );
  ctx.fill();

  // Tongue
  ctx.fillStyle = "#cc4466";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.28 + mouthOpen * 0.5,
    size * 0.06,
    size * 0.03,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === MASSIVE FANGS ===
  ctx.fillStyle = "#fffff8";
  const fangSize = size * 0.1 + attackIntensity * size * 0.03;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.34);
  ctx.lineTo(x - size * 0.05, y - size * 0.24 + attackIntensity * size * 0.02);
  ctx.lineTo(x - size * 0.02, y - size * 0.34);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.34);
  ctx.lineTo(x + size * 0.05, y - size * 0.24 + attackIntensity * size * 0.02);
  ctx.lineTo(x + size * 0.02, y - size * 0.34);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // === BATTLE ROAR EFFECT ===
  if (isAttacking && attackPhase > 0.2 && attackPhase < 0.6) {
    const roarAlpha = Math.sin(((attackPhase - 0.2) / 0.4) * Math.PI) * 0.5;
    for (let w = 0; w < 3; w++) {
      const waveRadius = size * 0.5 + w * size * 0.15;
      ctx.strokeStyle = `rgba(224, 96, 0, ${roarAlpha * (1 - w * 0.3)})`;
      ctx.lineWidth = (3 - w) * zoom;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.35, waveRadius, -0.8, 0.8);
      ctx.stroke();
    }
  }

  // === POWER AURA ===
  const auraGlow = 0.3 + Math.sin(time * 4) * 0.15 + attackIntensity * 0.3;
  ctx.strokeStyle = `rgba(200, 80, 0, ${auraGlow})`;
  ctx.lineWidth = (2 + attackIntensity * 2) * zoom;
  ctx.setLineDash([5 * zoom, 3 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05, size * 0.65, size * 0.75, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTenorHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // DARK FANTASY TENOR - Triangle Club Sonic Warrior with devastating voice attacks
  const isAttacking = attackPhase > 0;
  const sonicPulse = isAttacking ? Math.sin(attackPhase * Math.PI * 3) : 0;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const singWave = Math.sin(time * 3) * 3;
  const breathe = Math.sin(time * 2) * 1.5;

  // === SONIC SHOCKWAVE AURA ===
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.5 * attackIntensity;
      ctx.strokeStyle = `rgba(147, 112, 219, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y - size * 0.2,
        size * (0.5 + ringPhase * 0.8),
        size * (0.4 + ringPhase * 0.6),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // === FORMAL TUXEDO BODY ===
  const tuxGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y
  );
  tuxGrad.addColorStop(0, "#0a0a0a");
  tuxGrad.addColorStop(0.2, "#1a1a1a");
  tuxGrad.addColorStop(0.5, "#252525");
  tuxGrad.addColorStop(0.8, "#1a1a1a");
  tuxGrad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = tuxGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.48);
  ctx.lineTo(x - size * 0.42, y - size * 0.12);
  ctx.quadraticCurveTo(x, y - size * 0.35, x + size * 0.42, y - size * 0.12);
  ctx.lineTo(x + size * 0.38, y + size * 0.48);
  ctx.closePath();
  ctx.fill();

  // Tuxedo tails
  ctx.fillStyle = "#151515";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y + size * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y + size * 0.5,
    x - size * 0.28,
    y + size * 0.65
  );
  ctx.lineTo(x - size * 0.18, y + size * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + size * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y + size * 0.5,
    x + size * 0.28,
    y + size * 0.65
  );
  ctx.lineTo(x + size * 0.18, y + size * 0.55);
  ctx.closePath();
  ctx.fill();

  // White shirt front with ruffles
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.1, y + size * 0.35);
  ctx.lineTo(x + size * 0.1, y + size * 0.35);
  ctx.lineTo(x + size * 0.14, y - size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Ruffle details
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 4; i++) {
    const ruffY = y - size * 0.1 + i * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.08, ruffY);
    ctx.quadraticCurveTo(x, ruffY + size * 0.03, x + size * 0.08, ruffY);
    ctx.stroke();
  }

  // Orange bow tie (glowing during attack)
  const bowGlow = isAttacking ? 0.5 + attackIntensity * 0.5 : 0;
  if (bowGlow > 0) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 10 * zoom * attackIntensity;
  }
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x - size * 0.12, y - size * 0.24);
  ctx.lineTo(x - size * 0.12, y - size * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x + size * 0.12, y - size * 0.24);
  ctx.lineTo(x + size * 0.12, y - size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Bow center
  ctx.fillStyle = "#cc4400";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.18, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === HEAD ===
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.48 + singWave * 0.2 + breathe * 0.1,
    size * 0.26,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Dramatic slicked back hair
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.62 + singWave * 0.2,
    size * 0.24,
    size * 0.12,
    0,
    0,
    Math.PI
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.52 + singWave * 0.2);
  ctx.quadraticCurveTo(
    x - size * 0.28,
    y - size * 0.72 + singWave * 0.2,
    x,
    y - size * 0.75 + singWave * 0.2
  );
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y - size * 0.72 + singWave * 0.2,
    x + size * 0.22,
    y - size * 0.52 + singWave * 0.2
  );
  ctx.fill();

  // Eyes (dramatic closed while singing, glowing during attack)
  if (isAttacking) {
    ctx.fillStyle = `rgba(147, 112, 219, ${0.5 + attackIntensity * 0.5})`;
    ctx.shadowColor = "#9370db";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x - size * 0.09,
      y - size * 0.5 + singWave * 0.2,
      size * 0.04,
      size * 0.02,
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      x + size * 0.09,
      y - size * 0.5 + singWave * 0.2,
      size * 0.04,
      size * 0.02,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(
      x - size * 0.09,
      y - size * 0.5 + singWave * 0.2,
      size * 0.045,
      0.2 * Math.PI,
      0.8 * Math.PI
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      x + size * 0.09,
      y - size * 0.5 + singWave * 0.2,
      size * 0.045,
      0.2 * Math.PI,
      0.8 * Math.PI
    );
    ctx.stroke();
  }

  // Singing mouth (opens wider during attack)
  const mouthOpen = isAttacking ? 0.14 + attackIntensity * 0.08 : 0.1;
  ctx.fillStyle = "#3a1515";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.36 + singWave * 0.2,
    size * 0.09,
    size * mouthOpen + singWave * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Teeth
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.rect(
    x - size * 0.06,
    y - size * 0.36 - size * mouthOpen * 0.5 + singWave * 0.2,
    size * 0.12,
    size * 0.025
  );
  ctx.fill();

  // === MUSICAL NOTES (more during attack) ===
  const noteCount = isAttacking ? 6 : 3;
  for (let i = 0; i < noteCount; i++) {
    const notePhase = (time * 2 + i * 0.5) % 2;
    const noteAngle = -0.4 + (i / noteCount) * 0.8;
    const noteX = x + size * (0.4 + notePhase * 0.5) * Math.cos(noteAngle);
    const noteY =
      y -
      size * 0.35 -
      notePhase * size * 0.6 +
      Math.sin(notePhase * Math.PI) * size * 0.15;
    const noteAlpha = (1 - notePhase / 2) * (isAttacking ? 0.9 : 0.7);

    ctx.fillStyle = `rgba(255, 102, 0, ${noteAlpha})`;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = isAttacking ? 8 * zoom : 4 * zoom;
    ctx.font = `${(14 + (isAttacking ? 4 : 0)) * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(i % 3 === 0 ? "♪" : i % 3 === 1 ? "♫" : "♬", noteX, noteY);
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // === SONIC AURA RINGS ===
  for (let i = 0; i < 3; i++) {
    const ringPhase = (time * 2 + i * 0.4) % 1;
    const ringRadius = size * (0.45 + ringPhase * 0.5);
    const ringAlpha = (1 - ringPhase) * (isAttacking ? 0.7 : 0.4);
    ctx.strokeStyle = `rgba(147, 112, 219, ${ringAlpha})`;
    ctx.lineWidth = (2.5 - i * 0.5) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.25,
      ringRadius,
      ringRadius * 0.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

function drawMatheyKnightHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // DARK FANTASY MATHEY KNIGHT - Legendary armored champion with devastating sword strikes
  const isAttacking = attackPhase > 0;
  const swordSlash = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.5) * 2.0
    : 0;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const stance = Math.sin(time * 2) * 2;
  const breathe = Math.sin(time * 2) * 1;

  // === SWORD SLASH TRAIL (during attack) ===
  if (isAttacking && attackPhase > 0.2 && attackPhase < 0.8) {
    const trailAlpha = attackIntensity * 0.6;
    ctx.strokeStyle = `rgba(255, 200, 100, ${trailAlpha})`;
    ctx.lineWidth = 6 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(
      x + size * 0.4,
      y - size * 0.2,
      size * 0.7,
      -1.2 - swordSlash * 0.5,
      -0.3 - swordSlash * 0.3
    );
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 200, ${trailAlpha * 0.5})`;
    ctx.lineWidth = 3 * zoom;
    ctx.stroke();
  }

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.4, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // === PLATE ARMOR BODY ===
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y
  );
  armorGrad.addColorStop(0, "#4a4a5a");
  armorGrad.addColorStop(0.2, "#7a7a8a");
  armorGrad.addColorStop(0.5, "#9a9aaa");
  armorGrad.addColorStop(0.8, "#7a7a8a");
  armorGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.48 + breathe);
  ctx.lineTo(x - size * 0.44, y - size * 0.08);
  ctx.lineTo(x - size * 0.28, y - size * 0.26);
  ctx.quadraticCurveTo(x, y - size * 0.35, x + size * 0.28, y - size * 0.26);
  ctx.lineTo(x + size * 0.44, y - size * 0.08);
  ctx.lineTo(x + size * 0.38, y + size * 0.48 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.stroke();

  // Armor segments and rivets
  ctx.strokeStyle = "#4a4a5a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.02);
  ctx.lineTo(x + size * 0.32, y - size * 0.02);
  ctx.moveTo(x - size * 0.3, y + size * 0.16);
  ctx.lineTo(x + size * 0.3, y + size * 0.16);
  ctx.moveTo(x - size * 0.28, y + size * 0.32);
  ctx.lineTo(x + size * 0.28, y + size * 0.32);
  ctx.stroke();

  // Rivets
  ctx.fillStyle = "#5a5a6a";
  for (let row = 0; row < 3; row++) {
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(
        x + i * size * 0.12,
        y - size * 0.02 + row * size * 0.17,
        size * 0.02,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Princeton crest on chest (glowing during attack)
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 12 * zoom * attackIntensity;
  }
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x - size * 0.12, y + size * 0.04);
  ctx.lineTo(x, y + size * 0.16);
  ctx.lineTo(x + size * 0.12, y + size * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#cc4400";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${9 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("P", x, y + size * 0.04);
  ctx.shadowBlur = 0;

  // Massive shoulder pauldrons with spikes
  for (let side = -1; side <= 1; side += 2) {
    const pauldronX = x + side * size * 0.46;
    ctx.fillStyle = "#6a6a7a";
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      y - size * 0.14,
      size * 0.18,
      size * 0.14,
      side * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = "#4a4a5a";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Pauldron spikes
    ctx.fillStyle = "#5a5a6a";
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.12, y - size * 0.22);
    ctx.lineTo(pauldronX + side * size * 0.22, y - size * 0.35);
    ctx.lineTo(pauldronX + side * size * 0.08, y - size * 0.18);
    ctx.closePath();
    ctx.fill();
  }

  // === GREAT HELM ===
  const helmGrad = ctx.createRadialGradient(
    x,
    y - size * 0.5,
    0,
    x,
    y - size * 0.5,
    size * 0.35
  );
  helmGrad.addColorStop(0, "#8a8a9a");
  helmGrad.addColorStop(0.6, "#6a6a7a");
  helmGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.3, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a3a4a";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Helm crown
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.75, size * 0.2, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Visor with breathing holes
  ctx.fillStyle = "#2a2a3a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.55);
  ctx.lineTo(x + size * 0.22, y - size * 0.55);
  ctx.lineTo(x + size * 0.18, y - size * 0.38);
  ctx.lineTo(x - size * 0.18, y - size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Visor slits with glowing eyes behind
  ctx.fillStyle = isAttacking
    ? `rgba(200, 80, 0, ${0.6 + attackIntensity * 0.4})`
    : "rgba(200, 100, 50, 0.4)";
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 6 * zoom;
  }
  for (let i = 0; i < 5; i++) {
    const slitX = x - size * 0.14 + i * size * 0.07;
    ctx.fillRect(
      slitX - size * 0.015,
      y - size * 0.52,
      size * 0.03,
      size * 0.1
    );
  }
  ctx.shadowBlur = 0;

  // === EPIC PLUME ===
  for (let i = 0; i < 7; i++) {
    const plumeX = x + (i - 3) * size * 0.05;
    const plumeWave = Math.sin(time * 4 + i * 0.4) * 4;
    const plumeLen = size * (0.35 + Math.abs(i - 3) * 0.03);

    ctx.strokeStyle = i % 2 === 0 ? "#ff6600" : "#cc4400";
    ctx.lineWidth = (5 - Math.abs(i - 3) * 0.8) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(plumeX, y - size * 0.72);
    ctx.quadraticCurveTo(
      plumeX + plumeWave * 1.5,
      y - size * 0.9 - plumeLen * 0.5,
      plumeX + plumeWave * 0.8,
      y - size * 0.72 - plumeLen
    );
    ctx.stroke();
  }

  // === SOUL-FORGED SWORD ===
  ctx.save();
  ctx.translate(x + size * 0.52, y - size * 0.08);
  ctx.rotate(-0.6 + stance * 0.05 + swordSlash * 0.8);

  // Blade with runes
  const bladeGrad = ctx.createLinearGradient(0, -size * 0.1, 0, -size * 0.75);
  bladeGrad.addColorStop(0, "#a0a0b0");
  bladeGrad.addColorStop(0.3, "#e0e0e8");
  bladeGrad.addColorStop(0.5, "#ffffff");
  bladeGrad.addColorStop(0.7, "#e0e0e8");
  bladeGrad.addColorStop(1, "#a0a0b0");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.035, -size * 0.1);
  ctx.lineTo(-size * 0.03, -size * 0.65);
  ctx.lineTo(0, -size * 0.78);
  ctx.lineTo(size * 0.03, -size * 0.65);
  ctx.lineTo(size * 0.035, -size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#707080";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Blade runes
  ctx.fillStyle = `rgba(200, 80, 0, ${0.4 + attackIntensity * 0.5})`;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, -size * 0.25 - i * size * 0.15, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ornate crossguard
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.1);
  ctx.lineTo(-size * 0.16, -size * 0.14);
  ctx.lineTo(size * 0.16, -size * 0.14);
  ctx.lineTo(size * 0.14, -size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Guard gems
  ctx.fillStyle = "#ff3300";
  ctx.beginPath();
  ctx.arc(-size * 0.1, -size * 0.12, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.1, -size * 0.12, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Wrapped hilt
  ctx.fillStyle = "#3a1a0a";
  ctx.fillRect(-size * 0.03, -size * 0.08, size * 0.06, size * 0.18);
  // Hilt wrapping
  ctx.strokeStyle = "#5a3a1a";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, -size * 0.06 + i * size * 0.04);
    ctx.lineTo(size * 0.03, -size * 0.04 + i * size * 0.04);
    ctx.stroke();
  }
  // Pommel
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(0, size * 0.12, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === KITE SHIELD ===
  ctx.save();
  ctx.translate(x - size * 0.48, y + size * 0.02);
  ctx.rotate(0.25);

  // Shield body
  const shieldGrad = ctx.createLinearGradient(-size * 0.15, 0, size * 0.15, 0);
  shieldGrad.addColorStop(0, "#cc4400");
  shieldGrad.addColorStop(0.5, "#ff6600");
  shieldGrad.addColorStop(1, "#cc4400");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.28);
  ctx.lineTo(-size * 0.18, -size * 0.16);
  ctx.lineTo(-size * 0.18, size * 0.16);
  ctx.lineTo(0, size * 0.3);
  ctx.lineTo(size * 0.18, size * 0.16);
  ctx.lineTo(size * 0.18, -size * 0.16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 3 * zoom;
  ctx.stroke();

  // Shield boss
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${14 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("M", 0, size * 0.05);

  // Shield rim details
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.24);
  ctx.lineTo(-size * 0.14, -size * 0.14);
  ctx.lineTo(-size * 0.14, size * 0.12);
  ctx.lineTo(0, size * 0.24);
  ctx.lineTo(size * 0.14, size * 0.12);
  ctx.lineTo(size * 0.14, -size * 0.14);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawRockyHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // DARK FANTASY ROCKY - Legendary Golden Squirrel with devastating tail whip attacks
  const hop = Math.abs(Math.sin(time * 6)) * 5;
  const isAttacking = attackPhase > 0;
  const tailWhip = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.5 : 0;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  // === ATTACK AURA ===
  if (isAttacking) {
    for (let ring = 0; ring < 2; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.2) % 1;
      const ringAlpha = (1 - ringPhase) * 0.4 * attackIntensity;
      ctx.strokeStyle = `rgba(218, 165, 32, ${ringAlpha})`;
      ctx.lineWidth = (2 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y - hop,
        size * (0.5 + ringPhase * 0.4),
        size * (0.45 + ringPhase * 0.35),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // === MAGNIFICENT FLUFFY TAIL ===
  const tailWave = Math.sin(time * 4 + tailWhip) * 6;
  // Tail outer layer (darker)
  ctx.fillStyle = "#6b4904";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.22 - hop * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.75 + tailWave,
    y - size * 0.15 - hop * 0.4,
    x + size * 0.55 + tailWave * 0.5,
    y - size * 0.65 - hop * 0.4
  );
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y - size * 0.35 - hop * 0.3,
    x + size * 0.17,
    y + size * 0.12 - hop * 0.3
  );
  ctx.fill();

  // Tail middle layer
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.18 - hop * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.68 + tailWave,
    y - size * 0.18 - hop * 0.4,
    x + size * 0.5 + tailWave * 0.5,
    y - size * 0.58 - hop * 0.4
  );
  ctx.quadraticCurveTo(
    x + size * 0.32,
    y - size * 0.3 - hop * 0.3,
    x + size * 0.18,
    y + size * 0.1 - hop * 0.3
  );
  ctx.fill();

  // Tail highlight
  ctx.fillStyle = "#a08030";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y + size * 0.12 - hop * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.55 + tailWave * 0.8,
    y - size * 0.12 - hop * 0.4,
    x + size * 0.44 + tailWave * 0.4,
    y - size * 0.48 - hop * 0.4
  );
  ctx.quadraticCurveTo(
    x + size * 0.34,
    y - size * 0.25 - hop * 0.3,
    x + size * 0.2,
    y + size * 0.05 - hop * 0.3
  );
  ctx.fill();

  // Tail tip glow during attack
  if (isAttacking) {
    ctx.fillStyle = `rgba(255, 200, 50, ${attackIntensity * 0.6})`;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 10 * zoom * attackIntensity;
    ctx.beginPath();
    ctx.arc(
      x + size * 0.5 + tailWave * 0.5,
      y - size * 0.6 - hop * 0.4,
      size * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === MUSCULAR BODY ===
  const bodyGrad = ctx.createRadialGradient(
    x,
    y - hop,
    0,
    x,
    y - hop,
    size * 0.42
  );
  bodyGrad.addColorStop(0, "#d4a040");
  bodyGrad.addColorStop(0.5, "#a07020");
  bodyGrad.addColorStop(0.8, "#8b6914");
  bodyGrad.addColorStop(1, "#5a4008");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - hop, size * 0.34, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body fur detail
  ctx.strokeStyle = "rgba(90, 64, 8, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 4; i++) {
    const furAngle = -0.4 + i * 0.3;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(furAngle) * size * 0.15,
      y - hop + Math.sin(furAngle) * size * 0.2
    );
    ctx.lineTo(
      x + Math.cos(furAngle) * size * 0.28,
      y - hop + Math.sin(furAngle) * size * 0.35
    );
    ctx.stroke();
  }

  // Belly
  const bellyGrad = ctx.createRadialGradient(
    x,
    y - hop + size * 0.05,
    0,
    x,
    y - hop + size * 0.05,
    size * 0.22
  );
  bellyGrad.addColorStop(0, "#fff8e8");
  bellyGrad.addColorStop(1, "#e8d0b0");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - hop + size * 0.06,
    size * 0.22,
    size * 0.26,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === HEAD ===
  const headGrad = ctx.createRadialGradient(
    x,
    y - size * 0.48 - hop,
    0,
    x,
    y - size * 0.48 - hop,
    size * 0.28
  );
  headGrad.addColorStop(0, "#b08020");
  headGrad.addColorStop(0.7, "#8b6914");
  headGrad.addColorStop(1, "#6b4904");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.48 - hop,
    size * 0.28,
    size * 0.26,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Cheeks (fluffy)
  ctx.fillStyle = "#f5deb3";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.16,
    y - size * 0.42 - hop,
    size * 0.12,
    size * 0.1,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.16,
    y - size * 0.42 - hop,
    size * 0.12,
    size * 0.1,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === EARS (tufted) ===
  for (let side = -1; side <= 1; side += 2) {
    const earX = x + side * size * 0.2;
    const earY = y - size * 0.68 - hop;

    // Outer ear
    ctx.fillStyle = "#8b6914";
    ctx.beginPath();
    ctx.ellipse(
      earX,
      earY,
      size * 0.09,
      size * 0.14,
      side * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Inner ear
    ctx.fillStyle = "#d4a030";
    ctx.beginPath();
    ctx.ellipse(
      earX,
      earY + size * 0.02,
      size * 0.06,
      size * 0.1,
      side * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Ear tuft
    ctx.fillStyle = "#a08030";
    ctx.beginPath();
    ctx.moveTo(earX, earY - size * 0.12);
    ctx.lineTo(earX + side * size * 0.04, earY - size * 0.2);
    ctx.lineTo(earX + side * size * 0.02, earY - size * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  // === EYES (big and fierce during attack) ===
  const eyeScale = isAttacking ? 1.15 : 1;
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.5 - hop,
    size * 0.09 * eyeScale,
    size * 0.11 * eyeScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.5 - hop,
    size * 0.09 * eyeScale,
    size * 0.11 * eyeScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Eye color (golden during attack)
  ctx.fillStyle = isAttacking
    ? `rgba(255, 200, 50, ${0.7 + attackIntensity * 0.3})`
    : "#c09040";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.5 - hop, size * 0.05, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.5 - hop, size * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.52 - hop, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.52 - hop, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Pupils (slits during attack)
  ctx.fillStyle = "#1a1a1a";
  if (isAttacking) {
    ctx.beginPath();
    ctx.ellipse(
      x - size * 0.1,
      y - size * 0.5 - hop,
      size * 0.015,
      size * 0.04,
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      x + size * 0.1,
      y - size * 0.5 - hop,
      size * 0.015,
      size * 0.04,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x - size * 0.1, y - size * 0.5 - hop, size * 0.025, 0, Math.PI * 2);
    ctx.arc(x + size * 0.1, y - size * 0.5 - hop, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose
  ctx.fillStyle = "#3a1a0a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.38 - hop,
    size * 0.045,
    size * 0.035,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = "#5a3a2a";
  ctx.beginPath();
  ctx.arc(x - size * 0.01, y - size * 0.39 - hop, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (snarling during attack)
  if (isAttacking) {
    ctx.fillStyle = "#3a1a0a";
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.32 - hop,
      size * 0.05,
      size * 0.035 * attackIntensity,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Teeth
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x - size * 0.03, y - size * 0.34 - hop);
    ctx.lineTo(x - size * 0.015, y - size * 0.3 - hop);
    ctx.lineTo(x + size * 0.015, y - size * 0.3 - hop);
    ctx.lineTo(x + size * 0.03, y - size * 0.34 - hop);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = "#4a2a0a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(
      x,
      y - size * 0.35 - hop,
      size * 0.05,
      0.1 * Math.PI,
      0.9 * Math.PI
    );
    ctx.stroke();
  }

  // === GOLDEN ACORN (magical) ===
  ctx.save();
  ctx.translate(x - size * 0.38, y - size * 0.08 - hop);

  // Acorn glow
  ctx.shadowColor = "#daa520";
  ctx.shadowBlur = 8 * zoom;

  // Acorn body
  const acornGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.1);
  acornGrad.addColorStop(0, "#c09030");
  acornGrad.addColorStop(0.7, "#8b6914");
  acornGrad.addColorStop(1, "#5a3a0a");
  ctx.fillStyle = acornGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.09, size * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Acorn cap
  ctx.fillStyle = "#a08020";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.08, size * 0.08, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cap texture
  ctx.strokeStyle = "#6b5010";
  ctx.lineWidth = 0.8 * zoom;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(i * size * 0.02, -size * 0.08, size * 0.015, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.restore();

  // === SPEED LINES ===
  ctx.strokeStyle = `rgba(218, 165, 32, ${0.4 + Math.sin(time * 8) * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(
      x - size * 0.5 - i * size * 0.12,
      y - size * 0.08 + i * size * 0.12 - hop * 0.5
    );
    ctx.lineTo(
      x - size * 0.75 - i * size * 0.12,
      y - size * 0.08 + i * size * 0.12 - hop * 0.5
    );
    ctx.stroke();
  }
}

function drawFScottHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // DARK FANTASY F. SCOTT FITZGERALD - Legendary Wordsmith with magical text attacks
  const isAttacking = attackPhase > 0;
  const quillFlourish = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 1.2
    : 0;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const writeGesture = Math.sin(time * 2) * 2;
  const breathe = Math.sin(time * 2) * 1;

  // === MAGICAL WORD AURA ===
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.4 * attackIntensity;
      ctx.strokeStyle = `rgba(218, 165, 32, ${ringAlpha})`;
      ctx.lineWidth = (2.5 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y - size * 0.15,
        size * (0.55 + ringPhase * 0.5),
        size * (0.6 + ringPhase * 0.5),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.38, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ELEGANT 1920S SUIT ===
  const suitGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y
  );
  suitGrad.addColorStop(0, "#252530");
  suitGrad.addColorStop(0.3, "#3a3a4a");
  suitGrad.addColorStop(0.5, "#454555");
  suitGrad.addColorStop(0.7, "#3a3a4a");
  suitGrad.addColorStop(1, "#252530");
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.48 + breathe);
  ctx.lineTo(x - size * 0.4, y - size * 0.08);
  ctx.quadraticCurveTo(x, y - size * 0.32, x + size * 0.4, y - size * 0.08);
  ctx.lineTo(x + size * 0.35, y + size * 0.48 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a1a25";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Suit lapels
  ctx.fillStyle = "#2a2a35";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.2);
  ctx.lineTo(x - size * 0.25, y + size * 0.15);
  ctx.lineTo(x - size * 0.08, y + size * 0.18);
  ctx.lineTo(x - size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.2);
  ctx.lineTo(x + size * 0.25, y + size * 0.15);
  ctx.lineTo(x + size * 0.08, y + size * 0.18);
  ctx.lineTo(x + size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Ornate vest
  const vestGrad = ctx.createLinearGradient(
    x - size * 0.15,
    y,
    x + size * 0.15,
    y
  );
  vestGrad.addColorStop(0, "#6a5535");
  vestGrad.addColorStop(0.5, "#8b7355");
  vestGrad.addColorStop(1, "#6a5535");
  ctx.fillStyle = vestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.18);
  ctx.lineTo(x - size * 0.15, y + size * 0.28);
  ctx.lineTo(x + size * 0.15, y + size * 0.28);
  ctx.lineTo(x + size * 0.12, y - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Vest buttons (golden)
  ctx.fillStyle = "#daa520";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y - size * 0.05 + i * size * 0.1, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shirt collar with ruffles
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.2);
  ctx.lineTo(x - size * 0.18, y - size * 0.08);
  ctx.quadraticCurveTo(x, y - size * 0.12, x + size * 0.18, y - size * 0.08);
  ctx.lineTo(x + size * 0.12, y - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Elegant tie (glowing during attack)
  if (isAttacking) {
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = 8 * zoom * attackIntensity;
  }
  const tieGrad = ctx.createLinearGradient(
    x,
    y - size * 0.15,
    x,
    y + size * 0.2
  );
  tieGrad.addColorStop(0, "#daa520");
  tieGrad.addColorStop(0.5, "#b8860b");
  tieGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = tieGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.16);
  ctx.lineTo(x - size * 0.06, y + size * 0.12);
  ctx.lineTo(x, y + size * 0.18);
  ctx.lineTo(x + size * 0.06, y + size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Tie knot
  ctx.fillStyle = "#c09020";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.14, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === HEAD ===
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.48, size * 0.27, 0, Math.PI * 2);
  ctx.fill();

  // Chiseled jaw
  ctx.fillStyle = "#f5d0a5";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.35);
  ctx.lineTo(x, y - size * 0.28);
  ctx.lineTo(x + size * 0.15, y - size * 0.35);
  ctx.closePath();
  ctx.fill();

  // 1920s slicked hair with part
  ctx.fillStyle = "#3a2515";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.62, size * 0.25, size * 0.14, 0, 0, Math.PI);
  ctx.fill();

  // Hair wave on side
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.58);
  ctx.quadraticCurveTo(
    x - size * 0.25,
    y - size * 0.48,
    x - size * 0.24,
    y - size * 0.38
  );
  ctx.lineWidth = 4 * zoom;
  ctx.strokeStyle = "#3a2515";
  ctx.stroke();

  // Side part line
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.7);
  ctx.lineTo(x + size * 0.12, y - size * 0.55);
  ctx.stroke();

  // === THOUGHTFUL EYES ===
  // Eye whites
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.09,
    y - size * 0.5,
    size * 0.06,
    size * 0.07,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.09,
    y - size * 0.5,
    size * 0.06,
    size * 0.07,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Irises (glowing golden during attack)
  ctx.fillStyle = isAttacking
    ? `rgba(218, 165, 32, ${0.8 + attackIntensity * 0.2})`
    : "#4a6a8a";
  if (isAttacking) {
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = 5 * zoom;
  }
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.5, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, y - size * 0.5, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Pupils
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.5, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, y - size * 0.5, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.52, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.52, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Contemplative expression
  ctx.strokeStyle = "#8b6655";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.07, y - size * 0.36);
  ctx.quadraticCurveTo(x, y - size * 0.33, x + size * 0.07, y - size * 0.36);
  ctx.stroke();

  // === MAGICAL FOUNTAIN PEN ===
  ctx.save();
  ctx.translate(
    x + size * 0.45,
    y - size * 0.02 + writeGesture + quillFlourish * 5
  );
  ctx.rotate(-0.75 + quillFlourish * 0.3);

  // Pen glow during attack
  if (isAttacking) {
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = 12 * zoom * attackIntensity;
  }

  // Pen body (ornate)
  const penGrad = ctx.createLinearGradient(
    -size * 0.02,
    -size * 0.22,
    size * 0.02,
    -size * 0.22
  );
  penGrad.addColorStop(0, "#1a1a1a");
  penGrad.addColorStop(0.3, "#2a2a2a");
  penGrad.addColorStop(0.7, "#2a2a2a");
  penGrad.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = penGrad;
  ctx.fillRect(-size * 0.025, -size * 0.22, size * 0.05, size * 0.28);

  // Gold band
  ctx.fillStyle = "#daa520";
  ctx.fillRect(-size * 0.03, -size * 0.1, size * 0.06, size * 0.03);
  ctx.fillRect(-size * 0.03, size * 0.02, size * 0.06, size * 0.03);

  // Nib (glowing gold)
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.22);
  ctx.lineTo(-size * 0.02, -size * 0.32);
  ctx.lineTo(size * 0.02, -size * 0.32);
  ctx.closePath();
  ctx.fill();

  // Ink drip during attack
  if (isAttacking && attackPhase > 0.3) {
    const dripPhase = (attackPhase - 0.3) / 0.7;
    ctx.fillStyle = `rgba(30, 20, 10, ${1 - dripPhase})`;
    ctx.beginPath();
    ctx.ellipse(
      0,
      -size * 0.34 - dripPhase * size * 0.15,
      size * 0.015,
      size * 0.02,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.restore();

  // === FLOATING MAGICAL WORDS ===
  const wordCount = isAttacking ? 6 : 4;
  const words = ["dream", "green", "light", "hope", "glory", "jazz"];
  for (let i = 0; i < wordCount; i++) {
    const wordPhase = (time * 0.8 + i * 0.5) % 3;
    const wordAngle = -0.5 + (i / wordCount) * 1.0;
    const wordX =
      x -
      size * 0.35 +
      Math.sin(wordAngle + wordPhase * Math.PI * 0.5) * size * 0.6;
    const wordY = y - size * 0.55 - wordPhase * size * 0.35;
    const wordAlpha = (1 - wordPhase / 3) * (isAttacking ? 0.9 : 0.6);

    ctx.fillStyle = `rgba(218, 165, 32, ${wordAlpha})`;
    ctx.shadowColor = "#daa520";
    ctx.shadowBlur = isAttacking ? 6 * zoom : 3 * zoom;
    ctx.font = `italic ${(11 + (isAttacking ? 3 : 0)) * zoom}px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(words[i % words.length], wordX, wordY);
  }
  ctx.shadowBlur = 0;

  // === GOLDEN AURA ===
  for (let i = 0; i < 2; i++) {
    const auraPhase = (time * 1.5 + i * 0.5) % 1;
    const auraAlpha = (1 - auraPhase) * (isAttacking ? 0.5 : 0.25);
    ctx.strokeStyle = `rgba(218, 165, 32, ${auraAlpha})`;
    ctx.lineWidth = (2.5 - i) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.12,
      size * (0.52 + auraPhase * 0.2),
      size * (0.62 + auraPhase * 0.2),
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

function drawCaptainHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Captain - Military Commander who rallies knights
  const breathe = Math.sin(time * 2) * 2;
  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2) : 0;
  const commandPose = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  // === COMMAND AURA ===
  const auraIntensity = 0.15 + Math.sin(time * 3) * 0.1;
  const auraGrad = ctx.createRadialGradient(x, y, size * 0.2, x, y, size * 0.9);
  auraGrad.addColorStop(0, `rgba(220, 38, 38, ${auraIntensity})`);
  auraGrad.addColorStop(1, `rgba(220, 38, 38, 0)`);
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.85, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // === CAPE (billowing heroically) ===
  const capeWave = Math.sin(time * 3) * 0.1;
  ctx.fillStyle = "#8b0000";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.25);
  ctx.quadraticCurveTo(
    x - size * 0.5 - capeWave * size,
    y + size * 0.3,
    x - size * 0.4,
    y + size * 0.55
  );
  ctx.lineTo(x + size * 0.4, y + size * 0.55);
  ctx.quadraticCurveTo(
    x + size * 0.5 + capeWave * size,
    y + size * 0.3,
    x + size * 0.25,
    y - size * 0.25
  );
  ctx.closePath();
  ctx.fill();

  // === ARMORED BODY ===
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y,
    x + size * 0.4,
    y
  );
  armorGrad.addColorStop(0, "#4a4a4a");
  armorGrad.addColorStop(0.3, "#6a6a6a");
  armorGrad.addColorStop(0.5, "#8a8a8a");
  armorGrad.addColorStop(0.7, "#6a6a6a");
  armorGrad.addColorStop(1, "#4a4a4a");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + breathe * 0.5,
    size * 0.38,
    size * 0.48,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Red trim on armor
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.15);
  ctx.lineTo(x, y + size * 0.1);
  ctx.lineTo(x + size * 0.35, y - size * 0.15);
  ctx.stroke();

  // === PAULDRONS (shoulder armor) ===
  ctx.fillStyle = "#5a5a5a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.42,
    y - size * 0.18,
    size * 0.18,
    size * 0.12,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.42,
    y - size * 0.18,
    size * 0.18,
    size * 0.12,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Red crests on pauldrons
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.42,
    y - size * 0.22,
    size * 0.08,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.42,
    y - size * 0.22,
    size * 0.08,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === COMMANDER'S SWORD ===
  ctx.save();
  ctx.translate(x + size * 0.5, y + size * 0.1);
  ctx.rotate(0.8 + swordSwing * 1.2);

  // Sword blade
  ctx.fillStyle = "#d4d4d4";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.04, -size * 0.55);
  ctx.lineTo(0, -size * 0.6);
  ctx.lineTo(size * 0.04, -size * 0.55);
  ctx.closePath();
  ctx.fill();

  // Blood groove
  ctx.strokeStyle = "#a0a0a0";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.08);
  ctx.lineTo(0, -size * 0.45);
  ctx.stroke();

  // Guard
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.1, -size * 0.02, size * 0.2, size * 0.04);

  // Pommel
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(0, size * 0.08, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === BANNER/FLAG (rallying symbol) ===
  ctx.save();
  ctx.translate(x - size * 0.55, y - size * 0.1);

  // Banner pole
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(-size * 0.02, -size * 0.6, size * 0.04, size * 0.7);

  // Banner fabric
  const bannerWave = Math.sin(time * 4) * 0.15;
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.55);
  ctx.quadraticCurveTo(
    size * 0.2 + bannerWave * size,
    -size * 0.5,
    size * 0.25,
    -size * 0.35
  );
  ctx.quadraticCurveTo(
    size * 0.2 + bannerWave * size * 0.5,
    -size * 0.25,
    size * 0.02,
    -size * 0.2
  );
  ctx.closePath();
  ctx.fill();

  // Banner emblem
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(size * 0.12, -size * 0.38, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === HELMETED HEAD ===
  const headGrad = ctx.createRadialGradient(
    x,
    y - size * 0.48,
    0,
    x,
    y - size * 0.48,
    size * 0.28
  );
  headGrad.addColorStop(0, "#7a7a7a");
  headGrad.addColorStop(0.6, "#5a5a5a");
  headGrad.addColorStop(1, "#3a3a3a");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.26, size * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Visor slot
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - size * 0.18, y - size * 0.52, size * 0.36, size * 0.06);

  // Red plume
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.7);
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y - size * 0.85 + Math.sin(time * 4) * size * 0.05,
    x + size * 0.25,
    y - size * 0.65
  );
  ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.6, x, y - size * 0.7);
  ctx.fill();

  // === COMMAND EFFECT WHEN ATTACKING ===
  if (isAttacking) {
    ctx.strokeStyle = `rgba(255, 215, 0, ${commandPose * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let i = 0; i < 3; i++) {
      const ringRadius = size * (0.6 + i * 0.15 + commandPose * 0.2);
      ctx.beginPath();
      ctx.ellipse(x, y, ringRadius, ringRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawEngineerHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Engineer - Tech specialist who deploys turrets
  const breathe = Math.sin(time * 2) * 1.5;
  const isAttacking = attackPhase > 0;
  const workAnimation = isAttacking ? Math.sin(attackPhase * Math.PI * 4) : 0;
  const toolSpark = isAttacking ? Math.sin(attackPhase * Math.PI * 8) : 0;

  // === TECH AURA ===
  const auraIntensity = 0.12 + Math.sin(time * 4) * 0.08;
  const auraGrad = ctx.createRadialGradient(x, y, size * 0.2, x, y, size * 0.8);
  auraGrad.addColorStop(0, `rgba(234, 179, 8, ${auraIntensity})`);
  auraGrad.addColorStop(1, `rgba(234, 179, 8, 0)`);
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.8, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.4, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // === UTILITY BACKPACK ===
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.22,
    y - size * 0.2,
    size * 0.44,
    size * 0.5,
    size * 0.08
  );
  ctx.fill();

  // Backpack details
  ctx.fillStyle = "#3a3a3a";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      x - size * 0.15,
      y - size * 0.1 + i * size * 0.12,
      size * 0.3,
      size * 0.08
    );
  }

  // Glowing tech on backpack
  ctx.fillStyle = `rgba(234, 179, 8, ${0.5 + Math.sin(time * 5) * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.15, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // === JUMPSUIT BODY ===
  const suitGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y
  );
  suitGrad.addColorStop(0, "#5a5a00");
  suitGrad.addColorStop(0.5, "#8a8a20");
  suitGrad.addColorStop(1, "#5a5a00");
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + breathe * 0.3,
    size * 0.35,
    size * 0.45,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Orange safety stripes
  ctx.fillStyle = "#ea580c";
  ctx.fillRect(x - size * 0.32, y - size * 0.15, size * 0.08, size * 0.4);
  ctx.fillRect(x + size * 0.24, y - size * 0.15, size * 0.08, size * 0.4);

  // === TOOL BELT ===
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x - size * 0.38, y + size * 0.15, size * 0.76, size * 0.1);

  // Belt pouches
  ctx.fillStyle = "#654321";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      x - size * 0.32 + i * size * 0.25,
      y + size * 0.12,
      size * 0.12,
      size * 0.15
    );
  }

  // === ARMS WITH TOOLS ===
  // Left arm holding wrench
  ctx.fillStyle = "#7a7a20";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.4,
    y - size * 0.05 + workAnimation * size * 0.05,
    size * 0.12,
    size * 0.2,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Wrench
  ctx.fillStyle = "#6a6a6a";
  ctx.save();
  ctx.translate(x - size * 0.5, y + size * 0.1);
  ctx.rotate(-0.5 + workAnimation * 0.3);
  ctx.fillRect(-size * 0.02, -size * 0.25, size * 0.04, size * 0.25);
  ctx.fillRect(-size * 0.06, -size * 0.28, size * 0.12, size * 0.06);
  ctx.restore();

  // Right arm with welding tool
  ctx.fillStyle = "#7a7a20";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.4,
    y - size * 0.05 - workAnimation * size * 0.05,
    size * 0.12,
    size * 0.2,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Welding tool
  ctx.fillStyle = "#2a2a2a";
  ctx.save();
  ctx.translate(x + size * 0.5, y + size * 0.05);
  ctx.rotate(0.3 - workAnimation * 0.2);
  ctx.fillRect(-size * 0.02, -size * 0.2, size * 0.04, size * 0.2);

  // Welding spark effect
  if (isAttacking) {
    ctx.fillStyle = `rgba(255, 200, 50, ${Math.abs(toolSpark)})`;
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(0, -size * 0.22, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // === HARD HAT HEAD ===
  // Face
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.42, size * 0.2, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hard hat
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.55, size * 0.26, size * 0.14, 0, 0, Math.PI);
  ctx.fill();

  // Hat brim
  ctx.fillStyle = "#ca9a08";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.3, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hat light
  ctx.fillStyle = `rgba(255, 255, 200, ${0.5 + Math.sin(time * 3) * 0.3})`;
  ctx.shadowColor = "#ffffaa";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Safety goggles
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - size * 0.18, y - size * 0.48, size * 0.36, size * 0.08);
  ctx.fillStyle = `rgba(100, 200, 255, 0.5)`;
  ctx.fillRect(x - size * 0.16, y - size * 0.47, size * 0.14, size * 0.06);
  ctx.fillRect(x + size * 0.02, y - size * 0.47, size * 0.14, size * 0.06);

  // Mouth
  ctx.fillStyle = "#8b4513";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.36, size * 0.04, 0, Math.PI);
  ctx.fill();

  // === GEAR ICONS (floating around) ===
  ctx.strokeStyle = `rgba(234, 179, 8, ${0.4 + Math.sin(time * 2) * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let g = 0; g < 3; g++) {
    const gearAngle = time * 2 + g * Math.PI * 0.67;
    const gearDist = size * 0.55;
    const gearX = x + Math.cos(gearAngle) * gearDist;
    const gearY = y - size * 0.1 + Math.sin(gearAngle) * gearDist * 0.4;
    const gearSize = size * 0.08;

    // Simple gear shape
    ctx.beginPath();
    for (let tooth = 0; tooth < 6; tooth++) {
      const tAngle = (tooth / 6) * Math.PI * 2 + time * 3;
      const innerR = gearSize * 0.5;
      const outerR = gearSize;
      ctx.lineTo(
        gearX + Math.cos(tAngle) * outerR,
        gearY + Math.sin(tAngle) * outerR * 0.5
      );
      ctx.lineTo(
        gearX + Math.cos(tAngle + Math.PI / 6) * innerR,
        gearY + Math.sin(tAngle + Math.PI / 6) * innerR * 0.5
      );
    }
    ctx.closePath();
    ctx.stroke();
  }
}

function drawDefaultHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Default hero fallback
  const bodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.6);
  bodyGrad.addColorStop(0, lightenColor(color, 30));
  bodyGrad.addColorStop(0.7, color);
  bodyGrad.addColorStop(1, darkenColor(color, 40));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.45, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = darkenColor(color, 50);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#ffdbac";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.25, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.27, size * 0.05, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.27, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// TROOP RENDERING - Epic detailed troop sprites
// ============================================================================
export function renderTroop(
  ctx: CanvasRenderingContext2D,
  troop: Troop,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const screenPos = worldToScreen(
    troop.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const tData = TROOP_DATA[troop.type];
  const time = Date.now() / 1000;

  // Check for large troops
  const isLargeTroop =
    troop.type === "elite" ||
    troop.type === "centaur" ||
    troop.type === "cavalry" ||
    troop.type === "knight" ||
    troop.type === "turret";
  const sizeScale = isLargeTroop ? 1.6 : 1;

  // Selection indicator - scaled for large troops
  if (troop.selected) {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 2 * zoom,
      28 * zoom * sizeScale,
      14 * zoom * sizeScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Shadow - scale based on troop type
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 5 * zoom,
    15 * zoom * sizeScale,
    7 * zoom * sizeScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Scale up level 3 elite troops and level 4 mounted troops
  let baseSize = 22;
  if (troop.type === "elite") baseSize = 30; // Level 3 Elite Guard - larger
  else if (troop.type === "centaur") baseSize = 32; // Level 4 Centaur - mounted
  else if (troop.type === "cavalry")
    baseSize = 32; // Level 4 Royal Cavalry - mounted
  else if (troop.type === "knight") baseSize = 32; // Level 4 Knight - mounted
  else if (troop.type === "turret") baseSize = 34; // Engineer's turret - medium-large
  const size = baseSize * zoom;
  const attackPhase = troop.attackAnim > 0 ? troop.attackAnim / 300 : 0;
  const attackScale = attackPhase > 0 ? 1 + attackPhase * 0.15 : 1;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - size / 2);
  ctx.scale(attackScale, attackScale);

  // Draw specific troop type with attack animation
  drawTroopSprite(
    ctx,
    0,
    0,
    size,
    troop.type,
    tData.color,
    time,
    zoom,
    attackPhase
  );

  ctx.restore();

  // HP Bar - scaled for larger troops
  if (troop.hp < troop.maxHp) {
    const barWidth = 30 * zoom * sizeScale;
    const barHeight = 4 * zoom;
    const barY = screenPos.y - size - 8 * zoom;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(
      screenPos.x - barWidth / 2 - 1,
      barY - 1,
      barWidth + 2,
      barHeight + 2
    );
    ctx.fillStyle = "#333";
    ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth, barHeight);

    const hpPercent = troop.hp / troop.maxHp;
    ctx.fillStyle =
      hpPercent > 0.5 ? "#4ade80" : hpPercent > 0.25 ? "#fbbf24" : "#ef4444";
    ctx.fillRect(
      screenPos.x - barWidth / 2,
      barY,
      barWidth * hpPercent,
      barHeight
    );
  }
}

function drawTroopSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: string,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  switch (type) {
    case "soldier":
    case "footsoldier":
      drawSoldierTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "cavalry":
      drawCavalryTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "centaur":
      drawCentaurTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "elite":
      drawEliteTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "knight":
    case "armored":
      drawKnightTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    case "turret":
      drawTurretTroop(ctx, x, y, size, color, time, zoom, attackPhase);
      break;
    default:
      drawDefaultTroop(ctx, x, y, size, color, time, zoom, attackPhase);
  }
}

function drawSoldierTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Elite Princeton Soldier - Roman Legionnaire style with epic attack animations
  const stance = Math.sin(time * 4) * 1.5;
  const breathe = Math.sin(time * 2) * 0.5;
  const footTap = Math.abs(Math.sin(time * 3)) * 1;

  // Attack animation calculations
  const isAttacking = attackPhase > 0;
  const attackSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 1.5
    : 0;
  const attackLunge = isAttacking
    ? Math.sin(attackPhase * Math.PI) * size * 0.15
    : 0;
  const bodyTwist = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.2 : 0;

  ctx.save();
  ctx.translate(attackLunge * 0.5, 0);
  ctx.rotate(bodyTwist);

  // === LEGS (animated idle stance, spread during attack) ===
  const legSpread = isAttacking ? size * 0.05 : 0;
  ctx.fillStyle = "#1a1a1a";
  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.1 - legSpread, y + size * 0.35);
  ctx.rotate(-0.05 + footTap * 0.02 - (isAttacking ? 0.15 : 0));
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.08, size * 0.18, size * 0.16, size * 0.08);
  ctx.restore();
  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.1 + legSpread, y + size * 0.35);
  ctx.rotate(0.05 - footTap * 0.02 + (isAttacking ? 0.15 : 0));
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.08, size * 0.18, size * 0.16, size * 0.08);
  ctx.restore();

  // === BODY (armored torso with Princeton orange) ===
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.38);
  ctx.lineTo(x - size * 0.25, y - size * 0.05);
  ctx.lineTo(x + size * 0.25, y - size * 0.05);
  ctx.lineTo(x + size * 0.22, y + size * 0.38);
  ctx.closePath();
  ctx.fill();

  const chestGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y,
    x + size * 0.2,
    y
  );
  chestGrad.addColorStop(0, "#cc5500");
  chestGrad.addColorStop(0.3, "#ff6600");
  chestGrad.addColorStop(0.7, "#ff6600");
  chestGrad.addColorStop(1, "#cc5500");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.35 + breathe);
  ctx.lineTo(x - size * 0.23, y - size * 0.08 + breathe);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.18 + breathe,
    x + size * 0.23,
    y - size * 0.08 + breathe
  );
  ctx.lineTo(x + size * 0.2, y + size * 0.35 + breathe);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.1 + breathe);
  ctx.lineTo(x, y + size * 0.2 + breathe);
  ctx.stroke();

  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${8 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y + size * 0.1 + breathe);

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - size * 0.2, y + size * 0.25, size * 0.4, size * 0.06);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x - size * 0.04, y + size * 0.26, size * 0.08, size * 0.04);

  // === SHIELD ARM (thrusts forward during attack) ===
  const shieldX = x - size * 0.38 + (isAttacking ? attackLunge * 0.8 : 0);
  const shieldY = y + size * 0.1 - (isAttacking ? size * 0.1 * attackSwing : 0);

  ctx.fillStyle = "#ffe0bd";
  ctx.save();
  ctx.translate(x - size * 0.28, y + size * 0.05);
  ctx.rotate(-0.3 - (isAttacking ? 0.4 : 0));
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.2);
  ctx.restore();

  // === SHIELD (moves forward and tilts during attack) ===
  ctx.save();
  ctx.translate(shieldX, shieldY);
  ctx.rotate(isAttacking ? -0.3 - attackSwing * 0.3 : -0.2);
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.18, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.15, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.085, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Shield spike for attack
  if (isAttacking) {
    ctx.fillStyle = "#e0e0e0";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.06);
    ctx.lineTo(-size * 0.02, 0);
    ctx.lineTo(size * 0.02, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === SPEAR ARM (dramatic thrust during attack) ===
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.05);
  const armSwing = isAttacking ? -1.2 + attackPhase * 2.4 : 0.2 + stance * 0.02;
  ctx.rotate(armSwing);
  ctx.fillStyle = "#ffe0bd";
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.2);
  ctx.restore();

  // === SPEAR (thrusting attack animation) ===
  ctx.save();
  const spearAngle = isAttacking
    ? -0.8 + attackPhase * 1.6
    : -0.15 + stance * 0.03;
  const spearX = x + size * 0.38 + (isAttacking ? attackLunge * 1.5 : 0);
  const spearY =
    y - size * 0.1 - (isAttacking ? size * 0.2 * (1 - attackPhase) : 0);
  ctx.translate(spearX, spearY);
  ctx.rotate(spearAngle);

  const shaftGrad = ctx.createLinearGradient(-size * 0.02, 0, size * 0.02, 0);
  shaftGrad.addColorStop(0, "#5a3a1a");
  shaftGrad.addColorStop(0.5, "#7b5030");
  shaftGrad.addColorStop(1, "#5a3a1a");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.025, -size * 0.55, size * 0.05, size * 0.7);

  const headGrad = ctx.createLinearGradient(
    -size * 0.05,
    -size * 0.65,
    size * 0.05,
    -size * 0.55
  );
  headGrad.addColorStop(0, "#e0e0e0");
  headGrad.addColorStop(0.5, "#ffffff");
  headGrad.addColorStop(1, "#a0a0a0");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.7);
  ctx.lineTo(-size * 0.05, -size * 0.55);
  ctx.lineTo(-size * 0.02, -size * 0.53);
  ctx.lineTo(size * 0.02, -size * 0.53);
  ctx.lineTo(size * 0.05, -size * 0.55);
  ctx.closePath();
  ctx.fill();

  // Spear glint (more intense during attack)
  ctx.fillStyle = isAttacking ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.ellipse(
    0,
    -size * 0.62,
    size * (isAttacking ? 0.025 : 0.015),
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Attack trail effect
  if (isAttacking && attackPhase < 0.5) {
    ctx.strokeStyle = `rgba(255, 200, 100, ${0.8 - attackPhase * 1.6})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.7);
    ctx.lineTo(0, -size * 0.3);
    ctx.stroke();
  }
  ctx.restore();

  // === HEAD ===
  ctx.fillStyle = "#ffe0bd";
  ctx.fillRect(x - size * 0.06, y - size * 0.2, size * 0.12, size * 0.1);
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // === HELMET ===
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.42,
    size * 0.18,
    size * 0.12,
    0,
    Math.PI,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.35);
  ctx.lineTo(x - size * 0.2, y - size * 0.25);
  ctx.lineTo(x - size * 0.12, y - size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.17, y - size * 0.35);
  ctx.lineTo(x + size * 0.2, y - size * 0.25);
  ctx.lineTo(x + size * 0.12, y - size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#8a8a9a";
  ctx.fillRect(x - size * 0.02, y - size * 0.42, size * 0.04, size * 0.15);

  // Epic orange plume (more dynamic during attack)
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52);
  const plumeWave = Math.sin(time * 6) + (isAttacking ? attackSwing * 2 : 0);
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const px = x + (t - 0.5) * size * 0.25 + plumeWave * 2 * (1 - t);
    const py =
      y - size * 0.52 - t * size * 0.35 - Math.sin(t * Math.PI) * size * 0.12;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 7; i >= 0; i--) {
    const t = i / 7;
    const px = x + (t - 0.5) * size * 0.25 + plumeWave * 2 * (1 - t);
    const py =
      y - size * 0.52 - t * size * 0.3 - Math.sin(t * Math.PI) * size * 0.08;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff8833";
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const px = x + (t - 0.5) * size * 0.15 + plumeWave * 1.5 * (1 - t);
    const py =
      y - size * 0.55 - t * size * 0.28 - Math.sin(t * Math.PI) * size * 0.08;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = 5; i >= 0; i--) {
    const t = i / 5;
    const px = x + (t - 0.5) * size * 0.15 + plumeWave * 1.5 * (1 - t);
    const py = y - size * 0.55 - t * size * 0.25;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // === FACE (battle cry during attack) ===
  ctx.fillStyle = "#4a3520";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.36,
    size * 0.03,
    size * (isAttacking ? 0.015 : 0.025),
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.36,
    size * 0.03,
    size * (isAttacking ? 0.015 : 0.025),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.055, y - size * 0.365, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.065, y - size * 0.365, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Battle cry mouth
  if (isAttacking) {
    ctx.fillStyle = "#4a2a1a";
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.28,
      size * 0.04,
      size * 0.03 * (1 + attackPhase * 0.5),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else {
    ctx.strokeStyle = "#8b6b5b";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04, y - size * 0.28);
    ctx.lineTo(x + size * 0.04, y - size * 0.28);
    ctx.stroke();
  }

  // Aggressive eyebrows during attack
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 1.5 * zoom;
  const browAnger = isAttacking ? 0.1 : 0;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * (0.4 - browAnger));
  ctx.lineTo(x - size * 0.03, y - size * (0.42 + browAnger));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * (0.4 - browAnger));
  ctx.lineTo(x + size * 0.03, y - size * (0.42 + browAnger));
  ctx.stroke();

  ctx.restore();
}

function drawCavalryTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // ROYAL CAVALRY CHAMPION - Epic Knight of Princeton
  const gallop = Math.sin(time * 8) * 3;
  const legCycle = Math.sin(time * 8) * 0.35;
  const headBob = Math.sin(time * 8 + 0.5) * 2;
  const breathe = Math.sin(time * 2) * 0.3;

  // Attack animation
  const isAttacking = attackPhase > 0;
  const lanceThrust = isAttacking ? Math.sin(attackPhase * Math.PI) * 2.5 : 0;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  // === ROYAL ORANGE AURA ===
  const auraIntensity = isAttacking ? 0.55 : 0.35;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Outer royal aura
  const auraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.1,
    size * 0.1,
    x,
    y + size * 0.1,
    size * 0.85
  );
  auraGrad.addColorStop(
    0,
    `rgba(224, 96, 0, ${auraIntensity * auraPulse * 0.5})`
  );
  auraGrad.addColorStop(
    0.5,
    `rgba(200, 80, 0, ${auraIntensity * auraPulse * 0.25})`
  );
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.75, size * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orange energy particles
  for (let p = 0; p < 4; p++) {
    const pAngle = (time * 2.5 + p * Math.PI * 0.5) % (Math.PI * 2);
    const pDist = size * 0.45 + Math.sin(time * 3.5 + p) * size * 0.1;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.4;
    ctx.fillStyle = `rgba(200, 120, 0, ${0.4 + Math.sin(time * 4 + p) * 0.2})`;
    ctx.beginPath();
    ctx.arc(px, py, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack energy rings
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.5 * attackIntensity;
      ctx.strokeStyle = `rgba(224, 96, 0, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.1,
        size * (0.5 + ringPhase * 0.4),
        size * (0.32 + ringPhase * 0.25),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === ROYAL WAR STEED ===
  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.48, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Horse body (dark with orange undertones)
  const bodyGrad = ctx.createRadialGradient(
    x,
    y + size * 0.1,
    0,
    x,
    y + size * 0.1,
    size * 0.5
  );
  bodyGrad.addColorStop(0, "#3a2a1a");
  bodyGrad.addColorStop(0.5, "#2a1a0a");
  bodyGrad.addColorStop(1, "#1a0a00");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.18 + gallop * 0.15,
    size * 0.46,
    size * 0.29,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Ornate royal barding (armor)
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.18 + gallop * 0.15,
    size * 0.42,
    size * 0.22,
    0,
    Math.PI * 0.7,
    Math.PI * 2.3
  );
  ctx.fill();
  // Orange trim on armor
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.18 + gallop * 0.15,
    size * 0.42,
    size * 0.22,
    0,
    Math.PI * 0.8,
    Math.PI * 2.2
  );
  ctx.stroke();
  // Decorative medallions
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 4 * zoom;
  for (let i = 0; i < 3; i++) {
    const medX = x - size * 0.2 + i * size * 0.18;
    const medY = y + size * 0.05 + gallop * 0.15;
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Horse legs (muscular with armor)
  const legGrad = ctx.createLinearGradient(0, 0, 0, size * 0.35);
  legGrad.addColorStop(0, "#2a1a0a");
  legGrad.addColorStop(1, "#1a0a00");

  // Front left leg
  ctx.save();
  ctx.translate(x - size * 0.23, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(legCycle * 1.2);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.045, 0, size * 0.09, size * 0.32);
  // Armored greave
  ctx.fillStyle = "#5a5a62";
  ctx.fillRect(-size * 0.05, size * 0.08, size * 0.1, size * 0.1);
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(-size * 0.05, size * 0.08, size * 0.1, size * 0.1);
  // Golden hoof
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.055, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Front right leg
  ctx.save();
  ctx.translate(x - size * 0.08, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(-legCycle * 0.9);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.045, 0, size * 0.09, size * 0.32);
  ctx.fillStyle = "#5a5a62";
  ctx.fillRect(-size * 0.05, size * 0.08, size * 0.1, size * 0.1);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.055, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back left leg
  ctx.save();
  ctx.translate(x + size * 0.13, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(-legCycle * 1.1);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.045, 0, size * 0.09, size * 0.32);
  ctx.fillStyle = "#5a5a62";
  ctx.fillRect(-size * 0.05, size * 0.08, size * 0.1, size * 0.1);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.055, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back right leg
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(legCycle * 0.8);
  ctx.fillStyle = legGrad;
  ctx.fillRect(-size * 0.045, 0, size * 0.09, size * 0.32);
  ctx.fillStyle = "#5a5a62";
  ctx.fillRect(-size * 0.05, size * 0.08, size * 0.1, size * 0.1);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.34, size * 0.055, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Horse neck and head
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.34, y + size * 0.08 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.5,
    y - size * 0.15 + headBob * 0.5,
    x - size * 0.58,
    y - size * 0.05 + headBob
  );
  ctx.lineTo(x - size * 0.68, y - size * 0.02 + headBob);
  ctx.lineTo(x - size * 0.55, y + size * 0.05 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.4,
    y + size * 0.12 + gallop * 0.15,
    x - size * 0.27,
    y + size * 0.18 + gallop * 0.15
  );
  ctx.fill();

  // Ornate chanfron (head armor)
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.54, y - size * 0.13 + headBob);
  ctx.lineTo(x - size * 0.68, y - size * 0.02 + headBob);
  ctx.lineTo(x - size * 0.58, y + size * 0.04 + headBob);
  ctx.lineTo(x - size * 0.5, y - size * 0.08 + headBob);
  ctx.closePath();
  ctx.fill();
  // Orange accent on chanfron
  ctx.strokeStyle = "#e06000";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.54, y - size * 0.13 + headBob);
  ctx.lineTo(x - size * 0.64, y - size * 0.02 + headBob);
  ctx.stroke();
  // Golden crest on head
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.52, y - size * 0.15 + headBob);
  ctx.lineTo(x - size * 0.5, y - size * 0.26 + headBob);
  ctx.lineTo(x - size * 0.48, y - size * 0.15 + headBob);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Glowing orange eyes
  ctx.fillStyle = "#d07000";
  ctx.shadowColor = "#e06000";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.56,
    y - size * 0.02 + headBob,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Proud ears
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.52, y - size * 0.12 + headBob);
  ctx.lineTo(x - size * 0.57, y - size * 0.22 + headBob);
  ctx.lineTo(x - size * 0.48, y - size * 0.14 + headBob);
  ctx.fill();

  // Flowing mane (dark with orange tips)
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.44, y - size * 0.12 + headBob);
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const maneX = x - size * 0.44 + t * size * 0.55;
    const maneWave = Math.sin(time * 7 + i * 0.7) * 4;
    const maneY =
      y - size * 0.24 + maneWave + gallop * (0.08 - t * 0.06) + t * size * 0.14;
    ctx.lineTo(maneX, maneY);
  }
  ctx.lineTo(x + size * 0.11, y - size * 0.02 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  // Orange flame tips on mane
  const maneGlow = 0.5 + Math.sin(time * 6) * 0.25;
  ctx.fillStyle = `rgba(224, 96, 0, ${maneGlow})`;
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const tipX = x - size * 0.38 + t * size * 0.5;
    const tipY = y - size * 0.28 + Math.sin(time * 7 + i) * 4 + gallop * 0.06;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Majestic tail
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 6 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.4, y + size * 0.12 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.58 + Math.sin(time * 6) * 8,
    y + size * 0.26,
    x + size * 0.55 + Math.sin(time * 6 + 1) * 10,
    y + size * 0.48
  );
  ctx.stroke();

  // === ROYAL KNIGHT RIDER ===
  // Ornate armored body
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.15,
    y - size * 0.2,
    x + size * 0.15,
    y - size * 0.2
  );
  armorGrad.addColorStop(0, "#4a4a52");
  armorGrad.addColorStop(0.5, "#6a6a72");
  armorGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.08 + gallop * 0.15 + breathe);
  ctx.lineTo(x - size * 0.17, y - size * 0.46 + gallop * 0.08 + breathe);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.52 + gallop * 0.08 + breathe,
    x + size * 0.17,
    y - size * 0.46 + gallop * 0.08 + breathe
  );
  ctx.lineTo(x + size * 0.15, y - size * 0.08 + gallop * 0.15 + breathe);
  ctx.closePath();
  ctx.fill();

  // Orange tabard with golden border
  ctx.fillStyle = "#e06000";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11, y - size * 0.08 + gallop * 0.15);
  ctx.lineTo(x - size * 0.13, y - size * 0.38 + gallop * 0.1);
  ctx.lineTo(x + size * 0.13, y - size * 0.38 + gallop * 0.1);
  ctx.lineTo(x + size * 0.11, y - size * 0.08 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  // Princeton "P" emblem
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y - size * 0.24 + gallop * 0.12);

  // Magnificent great helm with plume
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
  // Decorative gold rim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + gallop * 0.08, size * 0.16, 0, Math.PI * 2);
  ctx.stroke();
  // Visor with orange glow
  ctx.fillStyle = "#2a2a32";
  ctx.fillRect(
    x - size * 0.12,
    y - size * 0.6 + gallop * 0.08,
    size * 0.24,
    size * 0.06
  );
  ctx.fillStyle = `rgba(224, 96, 0, ${0.6 + Math.sin(time * 4) * 0.2})`;
  ctx.shadowColor = "#d07000";
  ctx.shadowBlur = 6 * zoom;
  ctx.fillRect(
    x - size * 0.1,
    y - size * 0.59 + gallop * 0.08,
    size * 0.2,
    size * 0.035
  );
  ctx.shadowBlur = 0;
  // Orange plume
  ctx.fillStyle = "#e06000";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.7 + gallop * 0.08);
  const plumeWave = Math.sin(time * 5) * 2;
  for (let i = 0; i < 5; i++) {
    const pY = y - size * 0.7 - i * size * 0.04 + gallop * 0.08;
    const pW = size * (0.04 + i * 0.015) + Math.sin(time * 6 + i) * 2;
    ctx.lineTo(x - pW + plumeWave, pY);
  }
  for (let i = 4; i >= 0; i--) {
    const pY = y - size * 0.7 - i * size * 0.04 + gallop * 0.08;
    const pW = size * (0.04 + i * 0.015) + Math.sin(time * 6 + i) * 2;
    ctx.lineTo(x + pW + plumeWave, pY);
  }
  ctx.closePath();
  ctx.fill();

  // === ROYAL LANCE ===
  ctx.save();
  const lanceAngle = isAttacking ? -0.35 - lanceThrust * 0.3 : -0.35;
  const lanceLunge = isAttacking
    ? size * 0.28 * Math.sin(attackPhase * Math.PI)
    : 0;
  ctx.translate(
    x + size * 0.24 + lanceLunge * 0.5,
    y - size * 0.3 + gallop * 0.12 - lanceLunge * 0.3
  );
  ctx.rotate(lanceAngle);
  // Ornate lance shaft
  const lanceGrad = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, 0);
  lanceGrad.addColorStop(0, "#5a3a1a");
  lanceGrad.addColorStop(0.5, "#7a5a3a");
  lanceGrad.addColorStop(1, "#5a3a1a");
  ctx.fillStyle = lanceGrad;
  ctx.fillRect(-size * 0.035, -size * 0.8, size * 0.07, size * 0.95);
  // Gold bands on shaft
  ctx.fillStyle = "#c9a227";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      -size * 0.04,
      -size * 0.2 - i * size * 0.25,
      size * 0.08,
      size * 0.03
    );
  }
  // Gleaming lance tip
  ctx.fillStyle = "#e0e0e0";
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.0);
  ctx.lineTo(-size * 0.06, -size * 0.8);
  ctx.lineTo(size * 0.06, -size * 0.8);
  ctx.closePath();
  ctx.fill();
  // Gold inlay on tip
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.95);
  ctx.lineTo(0, -size * 0.82);
  ctx.stroke();
  // Orange energy during attack
  if (isAttacking && attackPhase > 0.2 && attackPhase < 0.8) {
    const fireIntensity = 1 - Math.abs(attackPhase - 0.5) * 3;
    ctx.fillStyle = `rgba(224, 96, 0, ${fireIntensity * 0.7})`;
    ctx.shadowColor = "#d07000";
    ctx.shadowBlur = 15 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.0);
    ctx.lineTo(-size * 0.05, -size * 1.2);
    ctx.lineTo(size * 0.05, -size * 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  // Orange pennant
  ctx.fillStyle = "#e06000";
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.72);
  const pennantWave =
    Math.sin(time * 8) * 3 + (isAttacking ? lanceThrust * 5 : 0);
  ctx.quadraticCurveTo(
    -size * 0.18 + pennantWave,
    -size * 0.66,
    -size * 0.24 + pennantWave * 1.5,
    -size * 0.62
  );
  ctx.lineTo(-size * 0.025, -size * 0.58);
  ctx.closePath();
  ctx.fill();
  // Black "P" on pennant
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${size * 0.06}px serif`;
  ctx.fillText("P", -size * 0.1 + pennantWave * 0.5, -size * 0.64);
  ctx.restore();

  // === ROYAL SHIELD ===
  ctx.save();
  ctx.translate(x - size * 0.24, y - size * 0.16 + gallop * 0.12);
  ctx.rotate(-0.15);
  // Ornate kite shield
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.24);
  ctx.lineTo(-size * 0.14, -size * 0.13);
  ctx.lineTo(-size * 0.12, size * 0.18);
  ctx.lineTo(0, size * 0.26);
  ctx.lineTo(size * 0.12, size * 0.18);
  ctx.lineTo(size * 0.14, -size * 0.13);
  ctx.closePath();
  ctx.fill();
  // Orange field
  ctx.fillStyle = "#e06000";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.18);
  ctx.lineTo(-size * 0.1, -size * 0.08);
  ctx.lineTo(-size * 0.08, size * 0.13);
  ctx.lineTo(0, size * 0.19);
  ctx.lineTo(size * 0.08, size * 0.13);
  ctx.lineTo(size * 0.1, -size * 0.08);
  ctx.closePath();
  ctx.fill();
  // Gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Black "P" emblem
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${size * 0.1}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("P", 0, size * 0.06);
  ctx.restore();
}

function drawCentaurTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // EPIC DARK FANTASY CENTAUR ARCHER - Golden War Champion of Princeton
  const gallop = Math.sin(time * 7) * 4;
  const legCycle = Math.sin(time * 7) * 0.4;
  const breathe = Math.sin(time * 2) * 0.5;
  const tailSwish = Math.sin(time * 5);
  const hairFlow = Math.sin(time * 4);

  // Attack animation - bow draw and release
  const isAttacking = attackPhase > 0;
  const bowDraw = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const arrowFly =
    isAttacking && attackPhase > 0.5 ? (attackPhase - 0.5) * 2 : 0;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  // === MAJESTIC GOLDEN AURA (always present) ===
  const auraIntensity = isAttacking ? 0.5 : 0.3;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Outer aura glow
  const auraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.1,
    size * 0.1,
    x,
    y + size * 0.1,
    size * 0.85
  );
  auraGrad.addColorStop(
    0,
    `rgba(255, 200, 50, ${auraIntensity * auraPulse * 0.5})`
  );
  auraGrad.addColorStop(
    0.4,
    `rgba(200, 120, 0, ${auraIntensity * auraPulse * 0.3})`
  );
  auraGrad.addColorStop(1, "rgba(200, 80, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.05,
    y + size * 0.15,
    size * 0.75,
    size * 0.5,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Golden energy particles
  for (let p = 0; p < 4; p++) {
    const pAngle = (time * 2 + p * Math.PI * 0.5) % (Math.PI * 2);
    const pDist = size * 0.5 + Math.sin(time * 3 + p) * size * 0.1;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.4;
    ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(time * 5 + p) * 0.2})`;
    ctx.beginPath();
    ctx.arc(px, py, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // === DARK ENERGY AURA (during attack) ===
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.5 * attackIntensity;
      ctx.strokeStyle = `rgba(255, 200, 50, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.1,
        size * (0.55 + ringPhase * 0.4),
        size * (0.35 + ringPhase * 0.25),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.05,
    y + size * 0.55,
    size * 0.5,
    size * 0.14,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === POWERFUL HORSE BODY ===
  // Main body (golden muscular) with darker tones
  const bodyGrad = ctx.createRadialGradient(
    x + size * 0.05,
    y + size * 0.1,
    0,
    x + size * 0.05,
    y + size * 0.1,
    size * 0.5
  );
  bodyGrad.addColorStop(0, "#e8c868");
  bodyGrad.addColorStop(0.4, "#c09838");
  bodyGrad.addColorStop(0.7, "#9a7820");
  bodyGrad.addColorStop(1, "#6b5010");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    y + size * 0.15 + gallop * 0.12,
    size * 0.44,
    size * 0.26,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Muscle definition on body (darker lines)
  ctx.strokeStyle = "rgba(107,80,16,0.5)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y + size * 0.12 + gallop * 0.12,
    size * 0.16,
    0.2,
    2.6
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.28,
    y + size * 0.1 + gallop * 0.12,
    size * 0.14,
    0.4,
    2.4
  );
  ctx.stroke();

  // Battle scars on body
  ctx.strokeStyle = "rgba(80, 50, 20, 0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y + size * 0.05 + gallop * 0.12);
  ctx.lineTo(x - size * 0.02, y + size * 0.15 + gallop * 0.12);
  ctx.stroke();

  // === ARMORED BARDING ===
  // Chest armor plate
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y + size * 0.05 + gallop * 0.12);
  ctx.lineTo(x - size * 0.35, y + size * 0.2 + gallop * 0.12);
  ctx.lineTo(x - size * 0.2, y + size * 0.25 + gallop * 0.12);
  ctx.lineTo(x - size * 0.1, y + size * 0.1 + gallop * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // === POWERFUL LEGS WITH GOLD HOOVES ===
  // Front left leg
  ctx.save();
  ctx.translate(x - size * 0.18, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(legCycle * 1.1);
  // Upper leg (muscular)
  const legGrad = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  legGrad.addColorStop(0, "#9a7820");
  legGrad.addColorStop(0.5, "#c09838");
  legGrad.addColorStop(1, "#9a7820");
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, 0);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.12, -size * 0.045, size * 0.17);
  ctx.lineTo(size * 0.045, size * 0.17);
  ctx.quadraticCurveTo(size * 0.08, size * 0.12, size * 0.055, 0);
  ctx.closePath();
  ctx.fill();
  // Lower leg
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.04, size * 0.15, size * 0.08, size * 0.16);
  // Hoof (glowing gold)
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.32, size * 0.055, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Front right leg
  ctx.save();
  ctx.translate(x - size * 0.05, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(-legCycle * 0.85);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, 0);
  ctx.quadraticCurveTo(-size * 0.07, size * 0.1, -size * 0.04, size * 0.17);
  ctx.lineTo(size * 0.04, size * 0.17);
  ctx.quadraticCurveTo(size * 0.07, size * 0.1, size * 0.055, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.04, size * 0.15, size * 0.08, size * 0.16);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.32, size * 0.055, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back left leg
  ctx.save();
  ctx.translate(x + size * 0.22, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(-legCycle * 1.0);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, 0);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.12, -size * 0.045, size * 0.17);
  ctx.lineTo(size * 0.045, size * 0.17);
  ctx.quadraticCurveTo(size * 0.08, size * 0.12, size * 0.055, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.04, size * 0.15, size * 0.08, size * 0.16);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.32, size * 0.055, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Back right leg
  ctx.save();
  ctx.translate(x + size * 0.35, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(legCycle * 0.9);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.055, 0);
  ctx.quadraticCurveTo(-size * 0.07, size * 0.1, -size * 0.04, size * 0.17);
  ctx.lineTo(size * 0.04, size * 0.17);
  ctx.quadraticCurveTo(size * 0.07, size * 0.1, size * 0.055, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.04, size * 0.15, size * 0.08, size * 0.16);
  ctx.fillStyle = "#c9a227";
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.32, size * 0.055, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // === FLOWING TAIL ===
  ctx.strokeStyle = "#6b5010";
  ctx.lineWidth = 7 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.68 + tailSwish * 10,
    y + size * 0.15,
    x + size * 0.58 + tailSwish * 14,
    y + size * 0.42
  );
  ctx.stroke();
  // Tail highlight
  ctx.strokeStyle = "#c09838";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.63 + tailSwish * 7,
    y + size * 0.14,
    x + size * 0.55 + tailSwish * 10,
    y + size * 0.35
  );
  ctx.stroke();

  // === MUSCULAR HUMAN TORSO ===
  // Back muscles
  ctx.fillStyle = "#d4a060";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.05 + gallop * 0.08 + breathe,
    size * 0.22,
    size * 0.18,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Main torso (heroic build)
  const torsoGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y - size * 0.2,
    x + size * 0.22,
    y - size * 0.2
  );
  torsoGrad.addColorStop(0, "#c89050");
  torsoGrad.addColorStop(0.3, "#e8b070");
  torsoGrad.addColorStop(0.7, "#e8b070");
  torsoGrad.addColorStop(1, "#c89050");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.02 + gallop * 0.08 + breathe);
  ctx.lineTo(x - size * 0.26, y - size * 0.3 + gallop * 0.04 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.42 + gallop * 0.04 + breathe * 0.3,
    x + size * 0.26,
    y - size * 0.3 + gallop * 0.04 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.2, y + size * 0.02 + gallop * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest muscles (defined abs)
  ctx.strokeStyle = "rgba(139,90,50,0.35)";
  ctx.lineWidth = 1 * zoom;
  // Pec line
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.22 + gallop * 0.05 + breathe * 0.4);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.18 + gallop * 0.05 + breathe * 0.4,
    x + size * 0.15,
    y - size * 0.22 + gallop * 0.05 + breathe * 0.4
  );
  ctx.stroke();
  // Center line
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28 + gallop * 0.05 + breathe * 0.3);
  ctx.lineTo(x, y - size * 0.05 + gallop * 0.08 + breathe);
  ctx.stroke();

  // Orange warrior sash
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.25 + gallop * 0.05);
  ctx.lineTo(x + size * 0.12, y - size * 0.08 + gallop * 0.08);
  ctx.lineTo(x + size * 0.08, y - size * 0.02 + gallop * 0.08);
  ctx.lineTo(x - size * 0.24, y - size * 0.2 + gallop * 0.05);
  ctx.closePath();
  ctx.fill();

  // === POWERFUL ARMS ===
  // Left arm (drawing bow)
  ctx.save();
  ctx.translate(x - size * 0.28, y - size * 0.18 + gallop * 0.05);
  ctx.rotate(-0.5);
  // Upper arm
  ctx.fillStyle = "#d8a060";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.06, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.05,
    size * 0.2,
    size * 0.05,
    size * 0.1,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // Right arm (holding bowstring back)
  ctx.save();
  ctx.translate(x + size * 0.28, y - size * 0.18 + gallop * 0.05);
  ctx.rotate(0.4);
  ctx.fillStyle = "#d8a060";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.06, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(
    size * 0.03,
    size * 0.18,
    size * 0.05,
    size * 0.1,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // === HEAD ===
  // Neck
  ctx.fillStyle = "#e0a868";
  ctx.fillRect(
    x - size * 0.06,
    y - size * 0.4 + gallop * 0.04,
    size * 0.12,
    size * 0.1
  );

  // Face
  ctx.fillStyle = "#e8b878";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5 + gallop * 0.04, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Flowing golden hair
  ctx.fillStyle = "#c09838";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.58 + gallop * 0.04);
  for (let i = 0; i < 8; i++) {
    const hairAngle = -0.9 + i * 0.26;
    const hairWave = Math.sin(time * 5 + i * 0.5) * 3 + hairFlow * 2;
    const hairLen = size * (0.2 + (i > 3 ? 0.1 : 0));
    ctx.lineTo(
      x + Math.cos(hairAngle) * hairLen + hairWave * 0.5,
      y -
        size * 0.5 +
        Math.sin(hairAngle) * hairLen * 0.8 +
        hairWave +
        gallop * 0.04
    );
  }
  ctx.closePath();
  ctx.fill();
  // Hair highlight
  ctx.fillStyle = "#e0c058";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.6 + gallop * 0.04);
  for (let i = 0; i < 5; i++) {
    const hairAngle = -0.7 + i * 0.35;
    const hairWave = Math.sin(time * 5 + i * 0.6) * 2 + hairFlow * 1.5;
    ctx.lineTo(
      x + Math.cos(hairAngle) * size * 0.15 + hairWave * 0.3,
      y -
        size * 0.52 +
        Math.sin(hairAngle) * size * 0.12 +
        hairWave * 0.5 +
        gallop * 0.04
    );
  }
  ctx.closePath();
  ctx.fill();

  // Laurel crown
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.55 + gallop * 0.04,
    size * 0.12,
    Math.PI * 0.8,
    Math.PI * 0.2,
    true
  );
  ctx.stroke();
  // Laurel leaves
  ctx.fillStyle = "#c9a227";
  for (let i = 0; i < 5; i++) {
    const leafAngle = Math.PI * 0.8 - i * 0.15;
    const leafX = x + Math.cos(leafAngle) * size * 0.12;
    const leafY =
      y - size * 0.55 + Math.sin(leafAngle) * size * 0.12 + gallop * 0.04;
    ctx.beginPath();
    ctx.ellipse(
      leafX,
      leafY,
      size * 0.025,
      size * 0.012,
      leafAngle + Math.PI * 0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Fierce eyes
  ctx.fillStyle = "#4080c0";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.045,
    y - size * 0.52 + gallop * 0.04,
    size * 0.025,
    size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.045,
    y - size * 0.52 + gallop * 0.04,
    size * 0.025,
    size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.04,
    y - size * 0.525 + gallop * 0.04,
    size * 0.01,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.05,
    y - size * 0.525 + gallop * 0.04,
    size * 0.01,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Determined eyebrows
  ctx.strokeStyle = "#8b6914";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.56 + gallop * 0.04);
  ctx.lineTo(x - size * 0.02, y - size * 0.58 + gallop * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.56 + gallop * 0.04);
  ctx.lineTo(x + size * 0.02, y - size * 0.58 + gallop * 0.04);
  ctx.stroke();

  // Proud expression
  ctx.strokeStyle = "#a08060";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.46 + gallop * 0.04, size * 0.03, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // === EPIC BOW AND ARROW (facing right toward enemies) ===
  ctx.save();
  // Position bow on right side of centaur, facing right
  ctx.translate(x + size * 0.15, y - size * 0.25 + gallop * 0.06);
  ctx.rotate(0.25 + (isAttacking ? bowDraw * 0.15 : 0));

  // Ornate bow (golden accents) - flexes more during draw
  const bowBend = isAttacking ? 0.55 + bowDraw * 0.15 : 0.55;
  ctx.strokeStyle = "#6b4423";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  // Draw bow arc facing right (arrow goes to +x direction)
  ctx.arc(
    0,
    0,
    size * 0.28,
    Math.PI - bowBend * Math.PI,
    Math.PI + bowBend * Math.PI
  );
  ctx.stroke();
  // Gold inlay on bow
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();

  // Bowstring (taut - pulled further during attack)
  const stringPull = -size * (0.15 + (isAttacking ? bowDraw * 0.15 : 0));
  ctx.strokeStyle = "#f8f8dc";
  ctx.lineWidth = (isAttacking ? 2 : 1.5) * zoom;
  ctx.beginPath();
  ctx.moveTo(
    Math.cos(Math.PI - bowBend * Math.PI) * size * 0.28,
    Math.sin(Math.PI - bowBend * Math.PI) * size * 0.28
  );
  ctx.lineTo(stringPull, 0);
  ctx.lineTo(
    Math.cos(Math.PI + bowBend * Math.PI) * size * 0.28,
    Math.sin(Math.PI + bowBend * Math.PI) * size * 0.28
  );
  ctx.stroke();

  // Arrow (nocked and ready, or flying during release)
  if (!isAttacking || attackPhase < 0.5) {
    const arrowOffset = isAttacking ? bowDraw * size * 0.1 : 0;
    // Arrow shaft (pointing right)
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(
      stringPull + arrowOffset * 0.5 - size * 0.4,
      -size * 0.015,
      size * 0.4,
      size * 0.03
    );
    // Arrow fletching (on left/back side)
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.moveTo(stringPull + arrowOffset * 0.3, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.5 + size * 0.06, -size * 0.035);
    ctx.lineTo(stringPull + arrowOffset * 0.3 - size * 0.06, 0);
    ctx.lineTo(stringPull + arrowOffset * 0.5 + size * 0.06, size * 0.035);
    ctx.closePath();
    ctx.fill();
    // Arrowhead (on right/front side, gleaming, glows during draw)
    const arrowGrad = ctx.createLinearGradient(
      -size * 0.5,
      -size * 0.03,
      -size * 0.5,
      size * 0.03
    );
    arrowGrad.addColorStop(0, isAttacking ? "#ffffff" : "#e0e0e0");
    arrowGrad.addColorStop(0.5, "#ffffff");
    arrowGrad.addColorStop(1, isAttacking ? "#e0e0e0" : "#a0a0a0");
    ctx.fillStyle = arrowGrad;
    ctx.beginPath();
    ctx.moveTo(stringPull - size * 0.43, 0);
    ctx.lineTo(stringPull - size * 0.35, -size * 0.035);
    ctx.lineTo(stringPull - size * 0.37, 0);
    ctx.lineTo(stringPull - size * 0.35, size * 0.035);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Flying arrow during release phase (starts from centaur center, goes right)
  if (isAttacking && attackPhase > 0.4) {
    const flyPhase = (attackPhase - 0.4) / 0.6;
    // Arrow starts from centaur center and flies to the right
    const arrowX = x + flyPhase * size * 2.5;
    const arrowY = y - size * 0.25 + gallop * 0.06 - flyPhase * size * 0.2;

    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(-0.15); // Slight upward angle

    // Trailing glow
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 10 * zoom * (1 - flyPhase);

    // Arrow shaft
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(-size * 0.15, -size * 0.012, size * 0.35, size * 0.024);
    // Fletching (on back/left side)
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.moveTo(-size * 0.13, 0);
    ctx.lineTo(-size * 0.17, -size * 0.03);
    ctx.lineTo(-size * 0.07, 0);
    ctx.lineTo(-size * 0.17, size * 0.03);
    ctx.closePath();
    ctx.fill();
    // Arrowhead (on front/right side)
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(size * 0.22, 0);
    ctx.lineTo(size * 0.14, -size * 0.03);
    ctx.lineTo(size * 0.16, 0);
    ctx.lineTo(size * 0.14, size * 0.03);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// Elite Guard - Level 3 station troop with royal armor and halberd
function drawEliteTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  const stance = Math.sin(time * 3) * 1.2;
  const breathe = Math.sin(time * 2) * 0.5;
  const capeWave = Math.sin(time * 3.5);

  // Attack animation - halberd swing
  const isAttacking = attackPhase > 0;
  const halberdSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.5) * 1.8
    : 0;
  const bodyLean = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.15 : 0;

  // === ELITE AURA (always present, stronger during attack) ===
  const auraIntensity = isAttacking ? 0.5 : 0.25;
  const auraPulse = 0.8 + Math.sin(time * 4) * 0.2;

  // Outer aura glow
  const auraGrad = ctx.createRadialGradient(x, y, size * 0.1, x, y, size * 0.7);
  auraGrad.addColorStop(
    0,
    `rgba(255, 108, 0, ${auraIntensity * auraPulse * 0.4})`
  );
  auraGrad.addColorStop(
    0.5,
    `rgba(255, 108, 0, ${auraIntensity * auraPulse * 0.2})`
  );
  auraGrad.addColorStop(1, "rgba(255, 108, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.65, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Energy rings during attack
  if (isAttacking) {
    for (let ring = 0; ring < 2; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.2) % 1;
      const ringAlpha = (1 - ringPhase) * 0.5;
      ctx.strokeStyle = `rgba(255, 150, 50, ${ringAlpha})`;
      ctx.lineWidth = (2.5 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.1,
        size * (0.4 + ringPhase * 0.35),
        size * (0.25 + ringPhase * 0.2),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === ROYAL CAPE (longer and more dramatic) ===
  // Cape inner layer
  ctx.fillStyle = "#0a0a2a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.1 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.26 + capeWave * 4,
    y + size * 0.3,
    x - size * 0.22 + capeWave * 5,
    y + size * 0.6
  );
  ctx.lineTo(x + size * 0.1 + capeWave * 3, y + size * 0.55);
  ctx.quadraticCurveTo(
    x + size * 0.06,
    y + size * 0.2,
    x + size * 0.12,
    y - size * 0.08 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape outer layer
  ctx.fillStyle = "#1a1a4a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.12 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.22 + capeWave * 3,
    y + size * 0.2,
    x - size * 0.18 + capeWave * 4,
    y + size * 0.5
  );
  ctx.lineTo(x + size * 0.08 + capeWave * 2, y + size * 0.45);
  ctx.quadraticCurveTo(
    x + size * 0.05,
    y + size * 0.15,
    x + size * 0.1,
    y - size * 0.1 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18 + capeWave * 4, y + size * 0.5);
  ctx.lineTo(x + size * 0.08 + capeWave * 2, y + size * 0.45);
  ctx.stroke();

  // === LEGS (gold-trimmed armor) ===
  ctx.fillStyle = "#5a5a6a";
  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.07, y + size * 0.28);
  ctx.rotate(-0.06 + stance * 0.015);
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.22);
  // Gold knee guard
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  // Boot
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-size * 0.06, size * 0.18, size * 0.12, size * 0.07);
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.07, y + size * 0.28);
  ctx.rotate(0.06 - stance * 0.015);
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.22);
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.06, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a3a4a";
  ctx.fillRect(-size * 0.06, size * 0.18, size * 0.12, size * 0.07);
  ctx.restore();

  // === BODY (ornate plate armor) ===
  // Back plate
  ctx.fillStyle = "#4a4a5a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.3 + breathe);
  ctx.lineTo(x - size * 0.22, y - size * 0.08 + breathe * 0.5);
  ctx.lineTo(x + size * 0.22, y - size * 0.08 + breathe * 0.5);
  ctx.lineTo(x + size * 0.2, y + size * 0.3 + breathe);
  ctx.closePath();
  ctx.fill();

  // Front chest plate with gradient
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.18,
    y,
    x + size * 0.18,
    y
  );
  plateGrad.addColorStop(0, "#6a6a7a");
  plateGrad.addColorStop(0.3, "#8a8a9a");
  plateGrad.addColorStop(0.7, "#8a8a9a");
  plateGrad.addColorStop(1, "#6a6a7a");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y + size * 0.28 + breathe);
  ctx.lineTo(x - size * 0.2, y - size * 0.06 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.12 + breathe * 0.3,
    x + size * 0.2,
    y - size * 0.06 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.18, y + size * 0.28 + breathe);
  ctx.closePath();
  ctx.fill();

  // Gold chest emblem (Princeton shield)
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.02 + breathe);
  ctx.lineTo(x - size * 0.08, y + size * 0.08 + breathe);
  ctx.lineTo(x, y + size * 0.16 + breathe);
  ctx.lineTo(x + size * 0.08, y + size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();

  // === HALBERD (polearm weapon with attack animation) ===
  ctx.save();
  const halberdX =
    x + size * 0.25 + (isAttacking ? halberdSwing * size * 0.15 : 0);
  const halberdY =
    y - size * 0.1 - (isAttacking ? Math.abs(halberdSwing) * size * 0.1 : 0);
  ctx.translate(halberdX, halberdY);
  ctx.rotate(0.15 + stance * 0.02 + halberdSwing);

  // Pole
  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(-size * 0.02, -size * 0.5, size * 0.04, size * 0.9);

  // Axe head (glows during attack)
  if (isAttacking) {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 10 * zoom * Math.abs(halberdSwing);
  }
  ctx.fillStyle = isAttacking ? "#d0d0e0" : "#c0c0d0";
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.5);
  ctx.lineTo(-size * 0.15, -size * 0.35);
  ctx.lineTo(-size * 0.12, -size * 0.25);
  ctx.lineTo(-size * 0.02, -size * 0.3);
  ctx.closePath();
  ctx.fill();

  // Spike tip
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.55);
  ctx.lineTo(-size * 0.03, -size * 0.5);
  ctx.lineTo(size * 0.03, -size * 0.5);
  ctx.closePath();
  ctx.fill();

  // Back spike
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.4);
  ctx.lineTo(size * 0.08, -size * 0.38);
  ctx.lineTo(size * 0.02, -size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Swing trail effect
  if (isAttacking && Math.abs(halberdSwing) > 0.5) {
    ctx.strokeStyle = `rgba(255, 200, 100, ${Math.abs(halberdSwing) * 0.4})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(
      0,
      -size * 0.4,
      size * 0.2,
      -Math.PI * 0.5,
      -Math.PI * 0.5 + halberdSwing * 0.8
    );
    ctx.stroke();
  }

  ctx.restore();

  // === SHOULDERS (pauldrons with gold trim) ===
  ctx.fillStyle = "#6a6a7a";
  // Left pauldron
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.18,
    y - size * 0.04 + breathe,
    size * 0.1,
    size * 0.07,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right pauldron
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.18,
    y - size * 0.04 + breathe,
    size * 0.1,
    size * 0.07,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.stroke();

  // === HEAD (plumed helm) ===
  // Neck
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(
    x - size * 0.06,
    y - size * 0.18 + breathe,
    size * 0.12,
    size * 0.1
  );

  // Helm
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28 + breathe, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Visor
  ctx.fillStyle = "#2a2a3a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.26 + breathe,
    size * 0.08,
    size * 0.04,
    0,
    0,
    Math.PI
  );
  ctx.fill();

  // Gold crown band
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.28 + breathe,
    size * 0.12,
    Math.PI * 1.2,
    Math.PI * 1.8
  );
  ctx.stroke();

  // Plume
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4 + breathe);
  ctx.quadraticCurveTo(
    x + size * 0.15 + capeWave * 2,
    y - size * 0.5,
    x + size * 0.2 + capeWave * 3,
    y - size * 0.35 + breathe
  );
  ctx.quadraticCurveTo(
    x + size * 0.1,
    y - size * 0.32,
    x,
    y - size * 0.38 + breathe
  );
  ctx.closePath();
  ctx.fill();
}

function drawDefaultTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // Default falls back to knight
  drawKnightTroop(ctx, x, y, size, color, time, zoom, attackPhase);
}

function drawKnightTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // DARK CHAMPION - Elite Princeton Knight with Soul-Forged Greatsword
  const stance = Math.sin(time * 3) * 1;
  const breathe = Math.sin(time * 2) * 0.4;
  const capeWave = Math.sin(time * 4);

  // Attack animation - devastating overhead swing
  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 1.2) * 2.2
    : 0;
  const bodyLean = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.25 : 0;
  const attackIntensity = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;

  // === DARK FLAME AURA (always present) ===
  const auraIntensity = isAttacking ? 0.6 : 0.35;
  const auraPulse = 0.85 + Math.sin(time * 3.5) * 0.15;

  // Fiery aura gradient
  const auraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.1,
    size * 0.1,
    x,
    y + size * 0.1,
    size * 0.8
  );
  auraGrad.addColorStop(
    0,
    `rgba(255, 100, 20, ${auraIntensity * auraPulse * 0.5})`
  );
  auraGrad.addColorStop(
    0.4,
    `rgba(255, 60, 0, ${auraIntensity * auraPulse * 0.3})`
  );
  auraGrad.addColorStop(1, "rgba(200, 40, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.7, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flame wisps
  for (let w = 0; w < 3; w++) {
    const wPhase = (time * 3 + w * 1.2) % 2;
    const wAlpha = wPhase < 1 ? (1 - wPhase) * 0.4 : 0;
    const wAngle = (w / 3) * Math.PI - Math.PI * 0.5;
    const wX = x + Math.cos(wAngle) * size * 0.4;
    const wY = y + size * 0.2 - wPhase * size * 0.3;
    ctx.fillStyle = `rgba(255, 150, 50, ${wAlpha})`;
    ctx.beginPath();
    ctx.ellipse(wX, wY, 3 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // === DARK ENERGY RINGS (during attack) ===
  if (isAttacking) {
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.15) % 1;
      const ringAlpha = (1 - ringPhase) * 0.5 * attackIntensity;
      ctx.strokeStyle = `rgba(255, 80, 20, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        size * (0.55 + ringPhase * 0.35),
        size * (0.65 + ringPhase * 0.35),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // === SHADOW ===
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.45, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === FLOWING BATTLE CAPE ===
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y - size * 0.2,
    x + size * 0.1,
    y + size * 0.5
  );
  capeGrad.addColorStop(0, "#cc3300");
  capeGrad.addColorStop(0.5, "#ff5500");
  capeGrad.addColorStop(1, "#aa2200");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.3 + capeWave * 4,
    y + size * 0.2,
    x - size * 0.25 + capeWave * 6,
    y + size * 0.5
  );
  ctx.lineTo(x + size * 0.12 + capeWave * 3, y + size * 0.45);
  ctx.quadraticCurveTo(
    x + size * 0.08 + capeWave * 1.5,
    y + size * 0.12,
    x + size * 0.14,
    y - size * 0.12 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // Cape inner shadow with pattern
  ctx.fillStyle = "#8b2200";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.1 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.18 + capeWave * 2.5,
    y + size * 0.12,
    x - size * 0.12 + capeWave * 4,
    y + size * 0.38
  );
  ctx.lineTo(x + capeWave * 1.5, y + size * 0.35);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.08,
    x + size * 0.06,
    y - size * 0.08 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // === ARMORED LEGS ===
  // Dark steel greaves
  for (let side = -1; side <= 1; side += 2) {
    ctx.save();
    ctx.translate(x + side * size * 0.08, y + size * 0.32);
    ctx.rotate(side * (-0.08 + stance * 0.02));

    // Upper leg armor
    const legGrad = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
    legGrad.addColorStop(0, "#4a4a5a");
    legGrad.addColorStop(0.3, "#7a7a8a");
    legGrad.addColorStop(0.7, "#8a8a9a");
    legGrad.addColorStop(1, "#5a5a6a");
    ctx.fillStyle = legGrad;
    ctx.fillRect(-size * 0.065, 0, size * 0.13, size * 0.24);

    // Knee guard with spike
    ctx.fillStyle = "#9a9aaa";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.08, size * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a6a7a";
    ctx.beginPath();
    ctx.moveTo(0, size * 0.06);
    ctx.lineTo(-size * 0.02, size * 0.02);
    ctx.lineTo(size * 0.02, size * 0.02);
    ctx.closePath();
    ctx.fill();

    // Armored boot
    ctx.fillStyle = "#3a3a4a";
    ctx.fillRect(-size * 0.075, size * 0.2, size * 0.15, size * 0.09);
    ctx.fillStyle = "#5a5a6a";
    ctx.fillRect(-size * 0.08, size * 0.27, size * 0.16, size * 0.04);
    ctx.restore();
  }

  // === DARK PLATE ARMOR ===
  // Back plate
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.35 + breathe);
  ctx.lineTo(x - size * 0.26, y - size * 0.12 + breathe * 0.5);
  ctx.lineTo(x + size * 0.26, y - size * 0.12 + breathe * 0.5);
  ctx.lineTo(x + size * 0.24, y + size * 0.35 + breathe);
  ctx.closePath();
  ctx.fill();

  // Front chest plate with gradient
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y - size * 0.1,
    x + size * 0.22,
    y + size * 0.2
  );
  plateGrad.addColorStop(0, "#5a5a6a");
  plateGrad.addColorStop(0.2, "#8a8a9a");
  plateGrad.addColorStop(0.5, "#aaaabb");
  plateGrad.addColorStop(0.8, "#8a8a9a");
  plateGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.34 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.14 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.24 + breathe * 0.3,
    x + size * 0.24,
    y - size * 0.14 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.22, y + size * 0.34 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest plate battle damage/details
  ctx.strokeStyle = "#4a4a5a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.17 + breathe * 0.4);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + breathe * 0.7, size * 0.14, 0.25, Math.PI - 0.25);
  ctx.stroke();

  // Dark sigil on chest
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.05 + breathe);
  ctx.lineTo(x - size * 0.08, y + size * 0.08 + breathe);
  ctx.lineTo(x, y + size * 0.18 + breathe);
  ctx.lineTo(x + size * 0.08, y + size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Glowing center
  const sigilGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackIntensity * 0.4;
  ctx.fillStyle = `rgba(200, 80, 0, ${sigilGlow})`;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08 + breathe, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Battle belt
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(
    x - size * 0.2,
    y + size * 0.28 + breathe,
    size * 0.4,
    size * 0.07
  );
  // Belt skull buckle
  ctx.fillStyle = "#c0c0d0";
  ctx.beginPath();
  ctx.arc(x, y + size * 0.315 + breathe, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.012,
    y + size * 0.31 + breathe,
    size * 0.008,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.012,
    y + size * 0.31 + breathe,
    size * 0.008,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === MASSIVE PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const pauldronX = x + side * size * 0.28;
    const pauldronY = y - size * 0.08 + breathe * 0.5;

    // Main pauldron
    ctx.fillStyle = "#7a7a8a";
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      pauldronY,
      size * 0.12,
      size * 0.09,
      side * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Pauldron spike
    ctx.fillStyle = "#5a5a6a";
    ctx.beginPath();
    ctx.moveTo(pauldronX + side * size * 0.08, pauldronY - size * 0.06);
    ctx.lineTo(pauldronX + side * size * 0.18, pauldronY - size * 0.02);
    ctx.lineTo(pauldronX + side * size * 0.1, pauldronY + size * 0.02);
    ctx.closePath();
    ctx.fill();

    // Pauldron trim
    ctx.fillStyle = "#9a9aaa";
    ctx.beginPath();
    ctx.ellipse(
      pauldronX,
      pauldronY + size * 0.02,
      size * 0.1,
      size * 0.04,
      side * 0.3,
      0,
      Math.PI
    );
    ctx.fill();
  }

  // === ARMS ===
  // Left arm
  ctx.fillStyle = "#5a5a6a";
  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.02 + breathe * 0.5);
  ctx.rotate(-0.25 - (isAttacking ? bodyLean * 0.6 : 0));
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.22);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.restore();

  // Right arm (sword arm - swings dramatically)
  ctx.save();
  const armSwing = isAttacking ? -1.2 + attackPhase * 2.8 : 0.2 + stance * 0.03;
  ctx.translate(
    x + size * 0.3,
    y +
      size * 0.02 +
      breathe * 0.5 -
      (isAttacking ? size * 0.12 * swordSwing * 0.3 : 0)
  );
  ctx.rotate(armSwing);
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(-size * 0.055, 0, size * 0.11, size * 0.22);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(-size * 0.065, size * 0.17, size * 0.13, size * 0.09);
  ctx.restore();

  // === SOUL-FORGED GREATSWORD ===
  ctx.save();
  const swordAngle = isAttacking
    ? -1.4 + attackPhase * 3.2
    : -0.35 + stance * 0.04;
  const swordX = x + size * 0.4 + (isAttacking ? swordSwing * size * 0.22 : 0);
  const swordY =
    y -
    size * 0.08 +
    breathe * 0.5 -
    (isAttacking ? Math.abs(swordSwing) * size * 0.18 : 0);
  ctx.translate(swordX, swordY);
  ctx.rotate(swordAngle);

  // Wrapped handle
  ctx.fillStyle = "#2a1a10";
  ctx.fillRect(-size * 0.028, size * 0.1, size * 0.056, size * 0.2);
  ctx.strokeStyle = "#4a3525";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.028, size * 0.12 + i * size * 0.035);
    ctx.lineTo(size * 0.028, size * 0.14 + i * size * 0.035);
    ctx.stroke();
  }

  // Ornate crossguard
  ctx.fillStyle = "#8b0000";
  ctx.fillRect(-size * 0.12, size * 0.07, size * 0.24, size * 0.05);
  ctx.fillStyle = "#aa2020";
  ctx.beginPath();
  ctx.arc(-size * 0.12, size * 0.095, size * 0.03, 0, Math.PI * 2);
  ctx.arc(size * 0.12, size * 0.095, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Crossguard gems
  ctx.fillStyle = `rgba(255, 200, 50, ${0.7 + attackIntensity * 0.3})`;
  ctx.beginPath();
  ctx.arc(-size * 0.12, size * 0.095, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.12, size * 0.095, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Massive blade with dark runes
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = (15 + attackIntensity * 10) * zoom;
  }
  const bladeGrad = ctx.createLinearGradient(-size * 0.05, 0, size * 0.05, 0);
  bladeGrad.addColorStop(0, "#808090");
  bladeGrad.addColorStop(0.15, "#c0c0d0");
  bladeGrad.addColorStop(0.5, "#e8e8f0");
  bladeGrad.addColorStop(0.85, "#c0c0d0");
  bladeGrad.addColorStop(1, "#707080");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.07);
  ctx.lineTo(-size * 0.055, -size * 0.55);
  ctx.lineTo(0, -size * 0.65);
  ctx.lineTo(size * 0.055, -size * 0.55);
  ctx.lineTo(size * 0.05, size * 0.07);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Blade runes (glow during attack)
  const runeGlow = 0.3 + Math.sin(time * 4) * 0.15 + attackIntensity * 0.5;
  ctx.fillStyle = `rgba(200, 80, 0, ${runeGlow})`;
  for (let i = 0; i < 4; i++) {
    const runeY = -size * 0.1 - i * size * 0.12;
    ctx.fillRect(-size * 0.015, runeY, size * 0.03, size * 0.06);
  }

  // Blade edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05);
  ctx.lineTo(0, -size * 0.62);
  ctx.stroke();

  // Devastating swing trail
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.85) {
    const trailAlpha = Math.sin(((attackPhase - 0.15) / 0.7) * Math.PI) * 0.7;
    ctx.strokeStyle = `rgba(255, 150, 50, ${trailAlpha})`;
    ctx.lineWidth = 5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.65);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.45, size * 0.25, -size * 0.1);
    ctx.stroke();

    // Secondary trail
    ctx.strokeStyle = `rgba(255, 200, 100, ${trailAlpha * 0.5})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.65);
    ctx.quadraticCurveTo(size * 0.35, -size * 0.5, size * 0.3, -size * 0.15);
    ctx.stroke();
  }

  ctx.restore();

  // === SHIELD (on back) ===
  ctx.save();
  ctx.translate(x - size * 0.35, y + size * 0.05 + breathe);
  ctx.rotate(-0.45);
  ctx.fillStyle = "#1a1a2a";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-size * 0.1, -size * 0.12);
  ctx.lineTo(-size * 0.08, size * 0.14);
  ctx.lineTo(0, size * 0.18);
  ctx.lineTo(size * 0.08, size * 0.14);
  ctx.lineTo(size * 0.1, -size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Shield emblem
  ctx.fillStyle = "#cc4400";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.14);
  ctx.lineTo(-size * 0.06, -size * 0.06);
  ctx.lineTo(-size * 0.04, size * 0.1);
  ctx.lineTo(0, size * 0.12);
  ctx.lineTo(size * 0.04, size * 0.1);
  ctx.lineTo(size * 0.06, -size * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === GREAT HELM ===
  // Neck guard
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(
    x - size * 0.09,
    y - size * 0.24 + breathe * 0.3,
    size * 0.18,
    size * 0.14
  );

  // Great helm base
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.05,
    y - size * 0.42,
    0,
    x,
    y - size * 0.38,
    size * 0.2
  );
  helmGrad.addColorStop(0, "#9a9aaa");
  helmGrad.addColorStop(0.5, "#7a7a8a");
  helmGrad.addColorStop(1, "#5a5a6a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + breathe * 0.2, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Face plate
  ctx.fillStyle = "#5a5a6a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.44 + breathe * 0.2);
  ctx.lineTo(x - size * 0.16, y - size * 0.32 + breathe * 0.2);
  ctx.lineTo(x, y - size * 0.26 + breathe * 0.2);
  ctx.lineTo(x + size * 0.16, y - size * 0.32 + breathe * 0.2);
  ctx.lineTo(x + size * 0.14, y - size * 0.44 + breathe * 0.2);
  ctx.closePath();
  ctx.fill();

  // Visor with breathing holes
  ctx.fillStyle = "#1a1a2a";
  ctx.fillRect(
    x - size * 0.12,
    y - size * 0.42 + breathe * 0.2,
    size * 0.24,
    size * 0.05
  );
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.06 + i * size * 0.06,
      y - size * 0.35 + breathe * 0.2,
      size * 0.015,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Glowing eyes
  const eyeGlow = 0.6 + Math.sin(time * 3) * 0.3 + attackIntensity * 0.4;
  ctx.fillStyle = `rgba(255, 150, 50, ${eyeGlow})`;
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.05,
    y - size * 0.4 + breathe * 0.2,
    size * 0.018,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.05,
    y - size * 0.4 + breathe * 0.2,
    size * 0.018,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Dramatic plume
  ctx.fillStyle = "#dd4400";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.56 + breathe * 0.2);
  const crestWave =
    Math.sin(time * 5) * 1.5 + (isAttacking ? swordSwing * 1.2 : 0);
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const cx = x + (t - 0.5) * size * 0.25 + crestWave * 2.5 * (1 - t);
    const cy =
      y -
      size * 0.56 -
      t * size * 0.28 -
      Math.sin(t * Math.PI) * size * 0.1 +
      breathe * 0.2;
    ctx.lineTo(cx, cy);
  }
  for (let i = 6; i >= 0; i--) {
    const t = i / 6;
    const cx = x + (t - 0.5) * size * 0.25 + crestWave * 2.5 * (1 - t);
    const cy =
      y -
      size * 0.56 -
      t * size * 0.24 -
      Math.sin(t * Math.PI) * size * 0.06 +
      breathe * 0.2;
    ctx.lineTo(cx, cy);
  }
  ctx.closePath();
  ctx.fill();

  // Battle cry shockwave during attack
  if (isAttacking && attackPhase > 0.25 && attackPhase < 0.65) {
    const cryAlpha = Math.sin(((attackPhase - 0.25) / 0.4) * Math.PI) * 0.5;
    ctx.strokeStyle = `rgba(255, 100, 50, ${cryAlpha})`;
    ctx.lineWidth = 2.5 * zoom;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(x, y - size * 0.38, size * (0.2 + r * 0.12), -0.9, 0.9);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ============================================================================
// TURRET TROOP - Engineer's Deployable Defense Turret
// ============================================================================
function drawTurretTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // ENGINEER'S DEFENSE TURRET - Mechanical sentry gun emplacement
  const rotate = time * 0.5; // Slow rotating scan
  const isAttacking = attackPhase > 0;
  const recoil = isAttacking ? Math.sin(attackPhase * Math.PI) * 3 : 0;
  const muzzleFlash = isAttacking ? Math.sin(attackPhase * Math.PI * 2) : 0;

  // === BASE PLATFORM ===
  // Ground shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.5, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Armored base - isometric hexagonal platform
  const baseGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y,
    x + size * 0.4,
    y
  );
  baseGrad.addColorStop(0, "#3a3a42");
  baseGrad.addColorStop(0.3, "#5a5a62");
  baseGrad.addColorStop(0.7, "#4a4a52");
  baseGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = baseGrad;

  // Base platform
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.45); // Bottom
  ctx.lineTo(x - size * 0.38, y + size * 0.25);
  ctx.lineTo(x - size * 0.38, y + size * 0.1);
  ctx.lineTo(x, y - size * 0.05); // Top
  ctx.lineTo(x + size * 0.38, y + size * 0.1);
  ctx.lineTo(x + size * 0.38, y + size * 0.25);
  ctx.closePath();
  ctx.fill();

  // Base top surface
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.05, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orange warning stripes on base
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 2 * zoom;
  ctx.setLineDash([4 * zoom, 3 * zoom]);
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.05, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // === ROTATING TURRET BODY ===
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate * 0.2 + (isAttacking ? 0 : Math.sin(time * 2) * 0.15));

  // Turret housing
  const turretGrad = ctx.createLinearGradient(-size * 0.25, 0, size * 0.25, 0);
  turretGrad.addColorStop(0, "#4a4a52");
  turretGrad.addColorStop(0.3, "#6a6a72");
  turretGrad.addColorStop(0.7, "#5a5a62");
  turretGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = turretGrad;

  // Main turret body
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.05);
  ctx.lineTo(-size * 0.22, -size * 0.15);
  ctx.lineTo(-size * 0.15, -size * 0.25);
  ctx.lineTo(size * 0.15, -size * 0.25);
  ctx.lineTo(size * 0.22, -size * 0.15);
  ctx.lineTo(size * 0.2, size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Sensor dome on top
  const domeGrad = ctx.createRadialGradient(
    0,
    -size * 0.28,
    0,
    0,
    -size * 0.28,
    size * 0.15
  );
  domeGrad.addColorStop(0, "#8a8a9a");
  domeGrad.addColorStop(0.5, "#6a6a7a");
  domeGrad.addColorStop(1, "#4a4a5a");
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.arc(0, -size * 0.25, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Sensor eye (glowing)
  const sensorGlow = 0.6 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(0, 200, 255, ${sensorGlow})`;
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.25, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();

  // === GUN BARREL(S) ===
  ctx.save();
  ctx.translate(x, y - size * 0.1);

  // Dual barrels
  for (let barrel = -1; barrel <= 1; barrel += 2) {
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.roundRect(
      barrel * size * 0.08 - size * 0.04,
      -size * 0.35 + recoil,
      size * 0.08,
      size * 0.28,
      2 * zoom
    );
    ctx.fill();

    // Barrel highlights
    ctx.fillStyle = "#5a5a62";
    ctx.fillRect(
      barrel * size * 0.08 - size * 0.015,
      -size * 0.32 + recoil,
      size * 0.03,
      size * 0.22
    );

    // Muzzle brake
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.roundRect(
      barrel * size * 0.08 - size * 0.05,
      -size * 0.38 + recoil,
      size * 0.1,
      size * 0.05,
      1 * zoom
    );
    ctx.fill();
  }

  // === MUZZLE FLASH (when attacking) ===
  if (isAttacking && muzzleFlash > 0.3) {
    ctx.fillStyle = `rgba(255, 200, 100, ${muzzleFlash * 0.8})`;
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 15 * zoom;
    for (let barrel = -1; barrel <= 1; barrel += 2) {
      ctx.beginPath();
      ctx.moveTo(barrel * size * 0.08, -size * 0.38 + recoil);
      ctx.lineTo(barrel * size * 0.08 - size * 0.06, -size * 0.48 + recoil);
      ctx.lineTo(barrel * size * 0.08, -size * 0.55 + recoil);
      ctx.lineTo(barrel * size * 0.08 + size * 0.06, -size * 0.48 + recoil);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  ctx.restore();

  // === AMMUNITION FEEDS ===
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.25,
    y - size * 0.05,
    size * 0.08,
    size * 0.15,
    2 * zoom
  );
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(
    x + size * 0.17,
    y - size * 0.05,
    size * 0.08,
    size * 0.15,
    2 * zoom
  );
  ctx.fill();

  // Ammo belt details
  ctx.fillStyle = "#d97706";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      x - size * 0.24,
      y - size * 0.02 + i * size * 0.04,
      size * 0.06,
      size * 0.02
    );
    ctx.fillRect(
      x + size * 0.18,
      y - size * 0.02 + i * size * 0.04,
      size * 0.06,
      size * 0.02
    );
  }

  // === STATUS LIGHTS ===
  // Green operational light
  const statusGlow = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = `rgba(50, 255, 100, ${statusGlow})`;
  ctx.shadowColor = "#32ff64";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.15, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === TARGETING LASER (when attacking) ===
  if (isAttacking) {
    ctx.strokeStyle = `rgba(255, 0, 0, ${0.6 + muzzleFlash * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.setLineDash([3 * zoom, 2 * zoom]);
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.35);
    ctx.lineTo(x, y - size * 0.8);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // === ENGINEER EMBLEM ===
  // Small gear symbol
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.3, size * 0.06, 0, Math.PI * 2);
  ctx.stroke();
  // Gear teeth
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(angle) * size * 0.06,
      y + size * 0.3 + Math.sin(angle) * size * 0.06
    );
    ctx.lineTo(
      x + Math.cos(angle) * size * 0.09,
      y + size * 0.3 + Math.sin(angle) * size * 0.09
    );
    ctx.stroke();
  }
}

// ============================================================================
// PROJECTILE RENDERING - Fixed to come from correct positions
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

  let currentX = proj.from.x + (proj.to.x - proj.from.x) * t;
  let currentY = proj.from.y + (proj.to.y - proj.from.y) * t;

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

  // Trail
  const trailLength = 5;
  for (let i = 1; i <= trailLength; i++) {
    const trailT = Math.max(0, t - i * 0.06);
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

    const alpha = 0.35 * (1 - i / trailLength);
    ctx.fillStyle = proj.isFlamethrower
      ? `rgba(200, 80, 0, ${alpha})`
      : proj.type === "lab" || proj.type === "lightning"
      ? `rgba(0, 255, 255, ${alpha})`
      : proj.type === "arch"
      ? `rgba(50, 200, 100, ${alpha})`
      : `rgba(255, 150, 50, ${alpha})`;
    ctx.beginPath();
    ctx.arc(trailPos.x, trailPos.y, (5 - i * 0.7) * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  const projSize = proj.type === "cannon" ? 7 : proj.type === "hero" ? 6 : 5;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);
  ctx.rotate(proj.rotation);

  if (proj.type === "flame") {
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 15 * zoom;
    for (let i = 0; i < 4; i++) {
      const flameOffset = (Math.random() - 0.5) * 6 * zoom;
      const flameSize = (4 + Math.random() * 4) * zoom;
      const flameGrad = ctx.createRadialGradient(
        flameOffset,
        flameOffset * 0.5,
        0,
        flameOffset,
        flameOffset * 0.5,
        flameSize
      );
      flameGrad.addColorStop(0, "rgba(255, 255, 100, 0.9)");
      flameGrad.addColorStop(0.4, "rgba(200, 120, 0, 0.7)");
      flameGrad.addColorStop(1, "rgba(255, 50, 0, 0)");
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(flameOffset, flameOffset * 0.5, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (proj.type === "bullet") {
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 8 * zoom;
    ctx.fillStyle = "rgba(255, 200, 0, 0.6)";
    ctx.fillRect(-8 * zoom, -1.5 * zoom, 16 * zoom, 3 * zoom);
    ctx.fillStyle = "#ffdd44";
    ctx.beginPath();
    ctx.arc(4 * zoom, 0, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (proj.type === "lab" || proj.type === "lightning") {
    // Lightning bolt projectile
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 12 * zoom;

    // Electric core
    const boltGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8 * zoom);
    boltGrad.addColorStop(0, "#ffffff");
    boltGrad.addColorStop(0.3, "#ccffff");
    boltGrad.addColorStop(0.6, "#00ffff");
    boltGrad.addColorStop(1, "#0088ff");

    ctx.fillStyle = boltGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Electric sparks
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 4; i++) {
      const sparkAngle = (i / 4) * Math.PI * 2 + Date.now() / 100;
      const sparkLen = 8 + Math.random() * 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(sparkAngle) * sparkLen * zoom,
        Math.sin(sparkAngle) * sparkLen * zoom
      );
      ctx.stroke();
    }

    ctx.restore();
    return;
  }

  if (proj.type === "arch") {
    // Music note beam projectile
    const time = Date.now() / 1000;
    ctx.shadowColor = "#32c864";
    ctx.shadowBlur = 15 * zoom;

    // Glowing green core
    const noteGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * zoom);
    noteGrad.addColorStop(0, "#ffffff");
    noteGrad.addColorStop(0.3, "#aaffaa");
    noteGrad.addColorStop(0.6, "#32c864");
    noteGrad.addColorStop(1, "#228844");

    ctx.fillStyle = noteGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Music notes orbiting the projectile
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${12 * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const symbols = ["♪", "♫", "♬", "♩"];
    for (let i = 0; i < 4; i++) {
      const noteAngle = (i / 4) * Math.PI * 2 + time * 8;
      const noteRadius = 14 * zoom;
      const nx = Math.cos(noteAngle) * noteRadius;
      const ny = Math.sin(noteAngle) * noteRadius * 0.5;
      ctx.fillText(symbols[i], nx, ny);
    }

    // Musical wave rings
    ctx.strokeStyle = "rgba(50, 200, 100, 0.5)";
    ctx.lineWidth = 2 * zoom;
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (time * 4 + ring * 0.3) % 1;
      const ringSize = 5 + ringPhase * 20;
      const ringAlpha = 0.6 * (1 - ringPhase);
      ctx.strokeStyle = `rgba(50, 200, 100, ${ringAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        ringSize * zoom,
        ringSize * zoom * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Trailing music notes behind projectile
    ctx.fillStyle = "rgba(50, 200, 100, 0.7)";
    for (let i = 1; i <= 3; i++) {
      const trailOffset = -i * 12 * zoom;
      const wobble = Math.sin(time * 10 + i * 2) * 4 * zoom;
      ctx.font = `${(10 - i) * zoom}px Arial`;
      ctx.fillText(symbols[i % 4], trailOffset, wobble);
    }

    ctx.restore();
    return;
  }

  if (proj.type === "spear") {
    ctx.shadowColor = "#8b4513";
    ctx.shadowBlur = 6 * zoom;
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(-12 * zoom, -2 * zoom, 24 * zoom, 4 * zoom);
    ctx.fillStyle = "#c0c0c0";
    ctx.beginPath();
    ctx.moveTo(12 * zoom, 0);
    ctx.lineTo(4 * zoom, -4 * zoom);
    ctx.lineTo(4 * zoom, 4 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  // Default projectile
  ctx.shadowColor =
    proj.type === "cannon"
      ? "#ff6b35"
      : proj.type === "hero"
      ? "#c9a227"
      : "#c9a227";
  ctx.shadowBlur = 12 * zoom;

  const projGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, projSize * zoom);
  if (proj.type === "cannon") {
    projGradient.addColorStop(0, "#ffff00");
    projGradient.addColorStop(0.5, "#ff6600");
    projGradient.addColorStop(1, "#cc3300");
  } else {
    projGradient.addColorStop(0, "#ffffff");
    projGradient.addColorStop(0.5, "#c9a227");
    projGradient.addColorStop(1, "#ff8800");
  }

  ctx.fillStyle = projGradient;
  ctx.beginPath();
  ctx.arc(0, 0, projSize * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// EFFECT RENDERING
// ============================================================================
export function renderEffect(
  ctx: CanvasRenderingContext2D,
  effect: Effect,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  enemies: Enemy[],
  towers: Tower[],
  selectedMap: string,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const screenPos = worldToScreen(
    effect.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const progress = effect.progress;
  const alpha = 1 - progress;

  switch (effect.type) {
    case "explosion":
      const expRadius = effect.size * zoom * (0.5 + progress * 0.5);
      const expGradient = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        expRadius
      );
      expGradient.addColorStop(0, `rgba(255, 200, 50, ${alpha})`);
      expGradient.addColorStop(0.4, `rgba(200, 80, 0, ${alpha * 0.8})`);
      expGradient.addColorStop(0.7, `rgba(200, 50, 0, ${alpha * 0.5})`);
      expGradient.addColorStop(1, `rgba(100, 0, 0, 0)`);
      ctx.fillStyle = expGradient;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        expRadius,
        expRadius * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      break;

    case "lightning":
    case "zap":
    case "beam":
    case "chain":
      if (effect.targetPos) {
        const targetScreen = worldToScreen(
          effect.targetPos,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const intensity = effect.intensity || 1;

        // Find the source lab tower to get correct orb position
        let sourceX = screenPos.x;
        let sourceY = screenPos.y;

        // If we have a towerId, find that specific tower
        let sourceTower: Tower | undefined;
        if (effect.towerId) {
          sourceTower = towers.find((t) => t.id === effect.towerId);
        }

        // If no towerId or tower not found, search for nearby lab tower
        if (!sourceTower) {
          for (const tower of towers) {
            if (tower.type === "lab") {
              const towerWorld = gridToWorld(tower.pos);
              const distToEffect = Math.sqrt(
                Math.pow(towerWorld.x - effect.pos.x, 2) +
                  Math.pow(towerWorld.y - effect.pos.y, 2)
              );
              // Use larger threshold since effect pos might be offset
              if (distToEffect < 150) {
                sourceTower = tower;
                break;
              }
            }
          }
        }

        if (sourceTower) {
          const towerWorld = gridToWorld(sourceTower.pos);
          const towerScreen = worldToScreen(
            towerWorld,
            canvasWidth,
            canvasHeight,
            dpr,
            cameraOffset,
            cameraZoom
          );

          // Calculate orb position based on tower level and upgrade
          const towerLevel = effect.towerLevel || sourceTower.level;
          const towerUpgrade = effect.towerUpgrade || sourceTower.upgrade;
          const baseHeight = (25 + towerLevel * 8) * zoom;
          const topY = towerScreen.y - baseHeight;
          let coilHeight = (35 + towerLevel * 8) * zoom;

          // Adjust for level 3 upgrades
          if (towerLevel === 3) {
            if (towerUpgrade === "A") {
              coilHeight = 50 * zoom; // Focused beam
            } else if (towerUpgrade === "B") {
              coilHeight = 45 * zoom; // Chain lightning
            }
          }

          // Set source to orb position at top of coil
          sourceX = towerScreen.x;
          sourceY = topY - coilHeight + 5 * zoom;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * intensity})`;
        ctx.lineWidth = 3 * zoom * intensity;
        ctx.lineCap = "round";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 15 * zoom * intensity;

        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);

        const dx = targetScreen.x - sourceX;
        const dy = targetScreen.y - sourceY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const segments = Math.max(5, Math.floor(dist / 30));
        const jitter = 20 * zoom * intensity;

        for (let i = 1; i < segments; i++) {
          const t = i / segments;
          const baseX = sourceX + dx * t;
          const baseY = sourceY + dy * t;
          const perpX = -dy / dist;
          const perpY = dx / dist;
          const offset =
            (Math.random() - 0.5) * jitter * (1 - Math.abs(t - 0.5) * 2);
          ctx.lineTo(baseX + perpX * offset, baseY + perpY * offset);
        }
        ctx.lineTo(targetScreen.x, targetScreen.y);
        ctx.stroke();

        // Impact spark
        ctx.fillStyle = `rgba(150, 255, 255, ${alpha * intensity})`;
        ctx.beginPath();
        ctx.arc(
          targetScreen.x,
          targetScreen.y,
          8 * zoom * intensity,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
      }
      break;

    case "music_notes":
      if (effect.targetPos) {
        const targetScreen = worldToScreen(
          effect.targetPos,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom
        );
        const intensity = effect.intensity || 1;
        const noteIndex = effect.noteIndex || 0;

        // Find the source arch tower to get correct portal position
        let sourceX = screenPos.x;
        let sourceY = screenPos.y;

        let sourceTower: Tower | undefined;
        if (effect.towerId) {
          sourceTower = towers.find((t) => t.id === effect.towerId);
        }

        if (sourceTower) {
          const towerWorld = gridToWorld(sourceTower.pos);
          const towerScreen = worldToScreen(
            towerWorld,
            canvasWidth,
            canvasHeight,
            dpr,
            cameraOffset,
            cameraZoom
          );

          // Calculate portal position (arch center)
          const towerLevel = effect.towerLevel || sourceTower.level;
          const pillarHeight = (35 + towerLevel * 8) * zoom;
          const archTopY = towerScreen.y - pillarHeight - 6 * zoom;
          const archCenterY = archTopY + 8 * zoom;

          sourceX = towerScreen.x;
          sourceY = archCenterY;
        }

        const glowColor =
          effect.towerUpgrade === "A"
            ? "255, 100, 100"
            : effect.towerUpgrade === "B"
            ? "100, 200, 255"
            : "50, 200, 100";

        ctx.save();

        const time = Date.now() / 1000;
        const dx = targetScreen.x - sourceX;
        const dy = targetScreen.y - sourceY;

        // Note flies along path with wobble
        const noteT = progress;
        const wobbleAmplitude = 15 * zoom * (1 - noteT); // Wobble decreases as it approaches target
        const wobbleX = Math.sin(time * 12 + noteIndex * 1.5) * wobbleAmplitude;
        const wobbleY =
          Math.cos(time * 10 + noteIndex * 2) * wobbleAmplitude * 0.5;

        const noteX = sourceX + dx * noteT + wobbleX;
        const noteY = sourceY + dy * noteT + wobbleY;

        // Different note sizes based on index
        const noteSize = (14 + Math.sin(noteIndex * 0.7) * 4) * zoom;
        const noteAlpha =
          alpha * intensity * (noteT < 0.9 ? 1 : (1 - noteT) * 10);

        // Glow trail
        ctx.shadowColor = `rgb(${glowColor})`;
        ctx.shadowBlur = 10 * zoom;

        // Draw music note
        ctx.fillStyle = `rgba(${glowColor}, ${noteAlpha})`;
        ctx.font = `bold ${noteSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const symbols = ["♪", "♫", "♬", "♩", "𝄞"];
        ctx.fillText(symbols[noteIndex % 5], noteX, noteY);

        // Note sparkle trail
        for (let t = 0; t < 3; t++) {
          const trailT = Math.max(0, noteT - t * 0.08);
          const trailX =
            sourceX +
            dx * trailT +
            Math.sin(time * 12 + noteIndex * 1.5 + t) * wobbleAmplitude * 0.5;
          const trailY =
            sourceY +
            dy * trailT +
            Math.cos(time * 10 + noteIndex * 2 + t) * wobbleAmplitude * 0.3;
          const trailAlpha = noteAlpha * (1 - t * 0.3);

          ctx.fillStyle = `rgba(${glowColor}, ${trailAlpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, (3 - t) * zoom, 0, Math.PI * 2);
          ctx.fill();
        }

        // Impact effect at target when note arrives
        if (noteT > 0.85) {
          const impactPhase = (noteT - 0.85) / 0.15;
          const impactSize = impactPhase * 15 * zoom;
          ctx.fillStyle = `rgba(${glowColor}, ${(1 - impactPhase) * 0.6})`;
          ctx.beginPath();
          ctx.arc(targetScreen.x, targetScreen.y, impactSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
      }
      break;

    case "cannon_shot":
    case "bullet_stream":
    case "flame_burst":
      if (effect.targetPos) {
        const targetScreen = worldToScreen(
          effect.targetPos,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom
        );

        // Find the source cannon tower
        let sourceX = screenPos.x;
        let sourceY = screenPos.y;

        let sourceTower: Tower | undefined;
        if (effect.towerId) {
          sourceTower = towers.find((t) => t.id === effect.towerId);
        }

        if (sourceTower) {
          const towerWorld = gridToWorld(sourceTower.pos);
          const towerScreen = worldToScreen(
            towerWorld,
            canvasWidth,
            canvasHeight,
            dpr,
            cameraOffset,
            cameraZoom
          );

          // Calculate turret position
          const towerLevel = effect.towerLevel || sourceTower.level;
          const baseHeight = (24 + towerLevel * 10) * zoom;
          const turretY = towerScreen.y - baseHeight - 12 * zoom;

          sourceX = towerScreen.x;
          sourceY = turretY;
        }

        ctx.save();

        const dx = targetScreen.x - sourceX;
        const dy = targetScreen.y - sourceY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (effect.type === "cannon_shot") {
          // Cannon ball projectile
          const projT = progress;
          const projX = sourceX + dx * projT;
          const projY =
            sourceY + dy * projT - Math.sin(projT * Math.PI) * 20 * zoom; // Arc

          // Projectile glow
          ctx.shadowColor = "#ff6600";
          ctx.shadowBlur = 15 * zoom;

          const projGrad = ctx.createRadialGradient(
            projX,
            projY,
            0,
            projX,
            projY,
            8 * zoom
          );
          projGrad.addColorStop(0, `rgba(255, 255, 150, ${alpha})`);
          projGrad.addColorStop(0.4, `rgba(255, 150, 50, ${alpha})`);
          projGrad.addColorStop(1, `rgba(200, 80, 0, ${alpha * 0.5})`);

          ctx.fillStyle = projGrad;
          ctx.beginPath();
          ctx.arc(projX, projY, 7 * zoom, 0, Math.PI * 2);
          ctx.fill();

          // Smoke trail
          for (let t = 0; t < 4; t++) {
            const trailT = Math.max(0, projT - t * 0.08);
            const trailX = sourceX + dx * trailT;
            const trailY =
              sourceY + dy * trailT - Math.sin(trailT * Math.PI) * 20 * zoom;
            ctx.fillStyle = `rgba(100, 100, 100, ${
              alpha * (1 - t * 0.25) * 0.5
            })`;
            ctx.beginPath();
            ctx.arc(trailX, trailY, (4 - t) * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (effect.type === "bullet_stream") {
          // Gatling bullets - multiple fast projectiles
          for (let b = 0; b < 3; b++) {
            const bulletT = Math.min(1, progress * 1.5 + b * 0.1);
            if (bulletT > 0 && bulletT < 1) {
              const bulletX = sourceX + dx * bulletT;
              const bulletY = sourceY + dy * bulletT;

              ctx.fillStyle = `rgba(255, 220, 100, ${alpha})`;
              ctx.shadowColor = "#ffcc00";
              ctx.shadowBlur = 8 * zoom;
              ctx.beginPath();
              ctx.arc(bulletX, bulletY, 3 * zoom, 0, Math.PI * 2);
              ctx.fill();

              // Tracer line
              const tracerLen = 15 * zoom;
              const tracerStartT = Math.max(0, bulletT - tracerLen / dist);
              ctx.strokeStyle = `rgba(255, 200, 50, ${alpha * 0.5})`;
              ctx.lineWidth = 2 * zoom;
              ctx.beginPath();
              ctx.moveTo(
                sourceX + dx * tracerStartT,
                sourceY + dy * tracerStartT
              );
              ctx.lineTo(bulletX, bulletY);
              ctx.stroke();
            }
          }
        } else if (effect.type === "flame_burst") {
          // Flamethrower stream
          ctx.shadowColor = "#ff4400";
          ctx.shadowBlur = 20 * zoom;

          for (let f = 0; f < 8; f++) {
            const flameT = Math.min(1, progress * 1.2 + f * 0.05);
            if (flameT > 0 && flameT < 1) {
              const wobble =
                Math.sin(Date.now() / 50 + f) * 8 * zoom * (1 - flameT);
              const perpX = -dy / dist;
              const perpY = dx / dist;

              const flameX = sourceX + dx * flameT + perpX * wobble;
              const flameY = sourceY + dy * flameT + perpY * wobble * 0.5;
              const flameSize = (12 - f * 0.8 - flameT * 6) * zoom;

              const flameGrad = ctx.createRadialGradient(
                flameX,
                flameY,
                0,
                flameX,
                flameY,
                flameSize
              );
              flameGrad.addColorStop(
                0,
                `rgba(255, 255, 150, ${alpha * (1 - flameT * 0.5)})`
              );
              flameGrad.addColorStop(
                0.3,
                `rgba(255, 180, 50, ${alpha * (1 - flameT * 0.5)})`
              );
              flameGrad.addColorStop(
                0.7,
                `rgba(255, 80, 0, ${alpha * (1 - flameT * 0.7)})`
              );
              flameGrad.addColorStop(1, `rgba(200, 30, 0, 0)`);

              ctx.fillStyle = flameGrad;
              ctx.beginPath();
              ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        ctx.shadowBlur = 0;
        ctx.restore();
      }
      break;

    case "sonic":
      const sonicRadius = effect.size * zoom * (0.2 + progress * 0.8);
      for (let ring = 0; ring < 3; ring++) {
        const ringProgress = (progress + ring * 0.15) % 1;
        const ringRadius = sonicRadius * (0.3 + ringProgress * 0.7);
        const ringAlpha = (1 - ringProgress) * alpha * 0.6;

        ctx.strokeStyle = `rgba(180, 100, 255, ${ringAlpha})`;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          screenPos.y,
          ringRadius,
          ringRadius * 0.5,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
      break;

    // ========== NEW SPELL EFFECTS ==========

    case "meteor_incoming": {
      // Meteor falling from sky with warning circle
      const meteorProgress = progress;
      const targetScreen = effect.targetPos
        ? worldToScreen(
            effect.targetPos,
            canvasWidth,
            canvasHeight,
            dpr,
            cameraOffset,
            cameraZoom
          )
        : screenPos;

      // Warning circle on ground (pulsing)
      const warningPulse = 0.5 + Math.sin(Date.now() / 100) * 0.3;
      ctx.strokeStyle = `rgba(200, 80, 0, ${warningPulse})`;
      ctx.lineWidth = 3 * zoom;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.ellipse(
        targetScreen.x,
        targetScreen.y,
        effect.size * zoom * 0.6,
        effect.size * zoom * 0.3,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Meteor position (falling from sky)
      const meteorY = targetScreen.y - 300 * zoom * (1 - meteorProgress);
      const meteorX = targetScreen.x;

      // Fire trail
      for (let t = 0; t < 8; t++) {
        const trailY = meteorY - t * 15 * zoom;
        const trailAlpha = (1 - t / 8) * 0.6;
        const trailSize = (20 - t * 2) * zoom;

        const trailGrad = ctx.createRadialGradient(
          meteorX,
          trailY,
          0,
          meteorX,
          trailY,
          trailSize
        );
        trailGrad.addColorStop(0, `rgba(255, 200, 50, ${trailAlpha})`);
        trailGrad.addColorStop(0.5, `rgba(200, 80, 0, ${trailAlpha * 0.6})`);
        trailGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.arc(
          meteorX + Math.sin(t) * 3 * zoom,
          trailY,
          trailSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Meteor core
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 30 * zoom;
      const meteorGrad = ctx.createRadialGradient(
        meteorX,
        meteorY,
        0,
        meteorX,
        meteorY,
        25 * zoom
      );
      meteorGrad.addColorStop(0, "#ffffff");
      meteorGrad.addColorStop(0.3, "#ffcc00");
      meteorGrad.addColorStop(0.6, "#ff6600");
      meteorGrad.addColorStop(1, "#cc3300");
      ctx.fillStyle = meteorGrad;
      ctx.beginPath();
      ctx.arc(meteorX, meteorY, 20 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }

    case "meteor_impact": {
      // Massive explosion with shockwave
      const impactProgress = progress;

      // Ground crater
      ctx.fillStyle = `rgba(50, 30, 20, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y + 5 * zoom,
        effect.size * zoom * 0.4,
        effect.size * zoom * 0.2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Main explosion
      const expSize = effect.size * zoom * (0.3 + impactProgress * 0.7);
      ctx.shadowColor = "#ff4400";
      ctx.shadowBlur = 40 * zoom * alpha;

      const expGrad = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        expSize
      );
      expGrad.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
      expGrad.addColorStop(0.2, `rgba(255, 200, 50, ${alpha * 0.9})`);
      expGrad.addColorStop(0.5, `rgba(200, 80, 0, ${alpha * 0.7})`);
      expGrad.addColorStop(0.8, `rgba(200, 50, 0, ${alpha * 0.4})`);
      expGrad.addColorStop(1, `rgba(100, 20, 0, 0)`);
      ctx.fillStyle = expGrad;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        expSize,
        expSize * 0.6,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Shockwave rings
      for (let ring = 0; ring < 3; ring++) {
        const ringProgress = Math.min(1, impactProgress * 1.5 + ring * 0.1);
        const ringRadius = effect.size * zoom * ringProgress;
        const ringAlpha = (1 - ringProgress) * alpha * 0.5;

        ctx.strokeStyle = `rgba(255, 150, 50, ${ringAlpha})`;
        ctx.lineWidth = (4 - ring) * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          screenPos.y,
          ringRadius,
          ringRadius * 0.5,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Flying debris
      for (let d = 0; d < 12; d++) {
        const debrisAngle = (d / 12) * Math.PI * 2;
        const debrisDist =
          effect.size *
          zoom *
          0.3 *
          impactProgress *
          (0.5 + Math.sin(d * 2.5) * 0.5);
        const debrisX = screenPos.x + Math.cos(debrisAngle) * debrisDist;
        const debrisY =
          screenPos.y +
          Math.sin(debrisAngle) * debrisDist * 0.5 -
          impactProgress * 30 * zoom * Math.sin(d);

        ctx.fillStyle = `rgba(100, 60, 30, ${alpha * (1 - impactProgress)})`;
        ctx.beginPath();
        ctx.arc(debrisX, debrisY, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      break;
    }

    case "lightning_bolt": {
      // Lightning strike from sky
      const strikeProgress = progress;
      const targetScreen = effect.targetPos
        ? worldToScreen(
            effect.targetPos,
            canvasWidth,
            canvasHeight,
            dpr,
            cameraOffset,
            cameraZoom
          )
        : screenPos;

      // Sky flash
      if (strikeProgress < 0.3) {
        ctx.fillStyle = `rgba(200, 220, 255, ${(0.3 - strikeProgress) * 0.3})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Lightning bolt with branching
      ctx.save();
      ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.lineWidth = 4 * zoom;
      ctx.shadowColor = "#88aaff";
      ctx.shadowBlur = 25 * zoom;
      ctx.lineCap = "round";

      const startY = targetScreen.y - 400 * zoom;
      const segments = 12;

      // Main bolt
      ctx.beginPath();
      ctx.moveTo(targetScreen.x, startY);
      let lastX = targetScreen.x;
      let lastY = startY;

      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const baseY = startY + (targetScreen.y - startY) * t;
        const jitter = (1 - t) * 30 * zoom * (Math.random() - 0.5);
        const x = targetScreen.x + jitter;
        ctx.lineTo(x, baseY);

        // Branch lightning
        if (i > 2 && i < segments - 2 && Math.random() > 0.6) {
          ctx.moveTo(x, baseY);
          const branchAngle = (Math.random() - 0.5) * Math.PI * 0.5;
          const branchLen = 40 * zoom * Math.random();
          ctx.lineTo(
            x + Math.cos(branchAngle) * branchLen,
            baseY + Math.sin(branchAngle) * branchLen * 0.3
          );
          ctx.moveTo(x, baseY);
        }
        lastX = x;
        lastY = baseY;
      }
      ctx.lineTo(targetScreen.x, targetScreen.y);
      ctx.stroke();

      // Impact glow
      const impactGrad = ctx.createRadialGradient(
        targetScreen.x,
        targetScreen.y,
        0,
        targetScreen.x,
        targetScreen.y,
        50 * zoom
      );
      impactGrad.addColorStop(0, `rgba(200, 220, 255, ${alpha})`);
      impactGrad.addColorStop(0.3, `rgba(100, 150, 255, ${alpha * 0.6})`);
      impactGrad.addColorStop(1, `rgba(50, 80, 200, 0)`);
      ctx.fillStyle = impactGrad;
      ctx.beginPath();
      ctx.arc(targetScreen.x, targetScreen.y, 40 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();
      break;
    }

    case "freeze_wave": {
      // Expanding ice wave
      const freezeRadius = effect.size * zoom * progress;

      // Ice crystals pattern
      ctx.save();
      ctx.strokeStyle = `rgba(150, 220, 255, ${alpha * 0.6})`;
      ctx.fillStyle = `rgba(200, 240, 255, ${alpha * 0.2})`;
      ctx.lineWidth = 2 * zoom;

      // Central frost
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        freezeRadius,
        freezeRadius * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();

      // Ice crystals radiating outward
      for (let c = 0; c < 8; c++) {
        const angle = (c / 8) * Math.PI * 2;
        const crystalDist = freezeRadius * 0.8;
        const cx = screenPos.x + Math.cos(angle) * crystalDist;
        const cy = screenPos.y + Math.sin(angle) * crystalDist * 0.5;

        // Snowflake pattern
        ctx.strokeStyle = `rgba(200, 240, 255, ${alpha * 0.8})`;
        for (let arm = 0; arm < 6; arm++) {
          const armAngle = angle + (arm / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(
            cx + Math.cos(armAngle) * 8 * zoom,
            cy + Math.sin(armAngle) * 4 * zoom
          );
          ctx.stroke();
        }
      }
      ctx.restore();
      break;
    }

    case "payday_aura": {
      // Gold aura effect (rendered around enemies in main loop)
      // This effect just marks that payday is active
      break;
    }

    // ========== NEW HERO ABILITY EFFECTS ==========

    case "roar_wave": {
      // Tiger's roar shockwave
      const roarRadius = effect.size * zoom * (0.2 + progress * 0.8);

      // Orange fear energy
      ctx.save();
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 20 * zoom;

      for (let ring = 0; ring < 4; ring++) {
        const ringProgress = (progress + ring * 0.1) % 1;
        const ringRadius = roarRadius * (0.4 + ringProgress * 0.6);
        const ringAlpha = (1 - ringProgress) * alpha * 0.5;

        ctx.strokeStyle = `rgba(255, 150, 50, ${ringAlpha})`;
        ctx.lineWidth = (4 - ring) * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          screenPos.y,
          ringRadius,
          ringRadius * 0.5,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Roar lines radiating outward
      for (let line = 0; line < 12; line++) {
        const angle = (line / 12) * Math.PI * 2;
        const lineAlpha = alpha * 0.6;
        ctx.strokeStyle = `rgba(255, 200, 100, ${lineAlpha})`;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(
          screenPos.x + Math.cos(angle) * 20 * zoom,
          screenPos.y + Math.sin(angle) * 10 * zoom
        );
        ctx.lineTo(
          screenPos.x + Math.cos(angle) * roarRadius * 0.8,
          screenPos.y + Math.sin(angle) * roarRadius * 0.4
        );
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
      break;
    }

    case "high_note": {
      // Tenor's sonic blast with musical notes
      const noteRadius = effect.size * zoom * (0.3 + progress * 0.7);

      ctx.save();
      ctx.shadowColor = "#aa66ff";
      ctx.shadowBlur = 15 * zoom;

      // Purple sonic waves
      for (let wave = 0; wave < 5; wave++) {
        const waveProgress = (progress + wave * 0.08) % 1;
        const waveRadius = noteRadius * (0.3 + waveProgress * 0.7);
        const waveAlpha = (1 - waveProgress) * alpha * 0.4;

        ctx.strokeStyle = `rgba(180, 100, 255, ${waveAlpha})`;
        ctx.lineWidth = (3 - wave * 0.4) * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          screenPos.y,
          waveRadius,
          waveRadius * 0.5,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Floating musical notes
      for (let n = 0; n < 8; n++) {
        const noteAngle = (n / 8) * Math.PI * 2 + progress * Math.PI;
        const noteDist =
          noteRadius * 0.6 * (0.5 + Math.sin(progress * Math.PI * 2 + n) * 0.3);
        const noteX = screenPos.x + Math.cos(noteAngle) * noteDist;
        const noteY =
          screenPos.y +
          Math.sin(noteAngle) * noteDist * 0.5 -
          progress * 20 * zoom;
        const noteAlpha = alpha * 0.8;

        ctx.fillStyle = `rgba(200, 150, 255, ${noteAlpha})`;
        ctx.font = `${14 * zoom}px Arial`;
        ctx.fillText("♪", noteX, noteY);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
      break;
    }

    case "fortress_shield": {
      // Mathey Knight's invincibility shield
      const shieldRadius = effect.size * zoom;
      const time = Date.now() / 1000;

      ctx.save();
      ctx.shadowColor = "#6666ff";
      ctx.shadowBlur = 20 * zoom;

      // Hexagonal shield pattern
      const hexPoints = 6;
      ctx.strokeStyle = `rgba(100, 150, 255, ${
        0.6 + Math.sin(time * 5) * 0.2
      })`;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      for (let i = 0; i <= hexPoints; i++) {
        const angle = (i / hexPoints) * Math.PI * 2 - Math.PI / 2;
        const x = screenPos.x + Math.cos(angle) * shieldRadius;
        const y = screenPos.y + Math.sin(angle) * shieldRadius * 0.5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Inner glow
      const shieldGrad = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        shieldRadius
      );
      shieldGrad.addColorStop(0, `rgba(100, 150, 255, 0.1)`);
      shieldGrad.addColorStop(0.7, `rgba(100, 150, 255, 0.2)`);
      shieldGrad.addColorStop(1, `rgba(100, 150, 255, 0)`);
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        shieldRadius,
        shieldRadius * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Rotating runes
      for (let r = 0; r < 4; r++) {
        const runeAngle = time * 2 + (r / 4) * Math.PI * 2;
        const runeX = screenPos.x + Math.cos(runeAngle) * shieldRadius * 0.7;
        const runeY = screenPos.y + Math.sin(runeAngle) * shieldRadius * 0.35;

        ctx.fillStyle = `rgba(150, 200, 255, ${
          0.7 + Math.sin(time * 3 + r) * 0.3
        })`;
        ctx.font = `${10 * zoom}px Arial`;
        ctx.fillText("✦", runeX - 4 * zoom, runeY + 4 * zoom);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
      break;
    }

    case "meteor_strike": {
      // Rocky's meteor ability (similar to spell but hero-sized)
      const strikeRadius = effect.size * zoom * (0.4 + progress * 0.6);

      ctx.save();
      ctx.shadowColor = "#996633";
      ctx.shadowBlur = 25 * zoom;

      // Ground impact crater
      ctx.fillStyle = `rgba(80, 60, 40, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        strikeRadius * 0.6,
        strikeRadius * 0.3,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Dust cloud
      const dustGrad = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        strikeRadius
      );
      dustGrad.addColorStop(0, `rgba(150, 120, 80, ${alpha * 0.7})`);
      dustGrad.addColorStop(0.5, `rgba(120, 90, 60, ${alpha * 0.4})`);
      dustGrad.addColorStop(1, `rgba(80, 60, 40, 0)`);
      ctx.fillStyle = dustGrad;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 10 * zoom * progress,
        strikeRadius,
        strikeRadius * 0.6,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Rock fragments
      for (let rock = 0; rock < 8; rock++) {
        const rockAngle = (rock / 8) * Math.PI * 2;
        const rockDist = strikeRadius * 0.5 * progress;
        const rockX = screenPos.x + Math.cos(rockAngle) * rockDist;
        const rockY =
          screenPos.y +
          Math.sin(rockAngle) * rockDist * 0.5 -
          progress * 15 * zoom;

        ctx.fillStyle = `rgba(100, 80, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(rockX, rockY, (4 - progress * 2) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
      break;
    }

    case "inspiration": {
      // F. Scott's tower buff aura
      const auraRadius = effect.size * zoom * (0.5 + progress * 0.3);
      const time = Date.now() / 1000;

      ctx.save();

      // Golden light rays
      for (let ray = 0; ray < 12; ray++) {
        const rayAngle = (ray / 12) * Math.PI * 2 + time * 0.5;
        const rayAlpha = alpha * 0.3 * (0.5 + Math.sin(time * 3 + ray) * 0.5);

        ctx.strokeStyle = `rgba(255, 215, 0, ${rayAlpha})`;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(
          screenPos.x + Math.cos(rayAngle) * auraRadius,
          screenPos.y + Math.sin(rayAngle) * auraRadius * 0.5
        );
        ctx.stroke();
      }

      // Central glow
      const inspireGrad = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        auraRadius * 0.3
      );
      inspireGrad.addColorStop(0, `rgba(255, 230, 150, ${alpha * 0.4})`);
      inspireGrad.addColorStop(1, `rgba(255, 215, 0, 0)`);
      ctx.fillStyle = inspireGrad;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        auraRadius * 0.3,
        auraRadius * 0.15,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
      break;
    }

    case "knight_summon": {
      // Captain's knight summoning effect
      const summonRadius = effect.size * zoom;
      const time = Date.now() / 1000;

      ctx.save();
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 15 * zoom;

      // Summoning circle
      ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        summonRadius,
        summonRadius * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Rising energy pillars for each knight
      for (let k = 0; k < 3; k++) {
        const pillarAngle = (k / 3) * Math.PI * 2 - Math.PI / 2;
        const pillarX =
          screenPos.x + Math.cos(pillarAngle) * summonRadius * 0.6;
        const pillarY =
          screenPos.y + Math.sin(pillarAngle) * summonRadius * 0.3;
        const pillarHeight = 40 * zoom * (1 - progress);

        const pillarGrad = ctx.createLinearGradient(
          pillarX,
          pillarY,
          pillarX,
          pillarY - pillarHeight
        );
        pillarGrad.addColorStop(0, `rgba(255, 200, 100, ${alpha})`);
        pillarGrad.addColorStop(1, `rgba(255, 200, 100, 0)`);
        ctx.fillStyle = pillarGrad;
        ctx.fillRect(
          pillarX - 4 * zoom,
          pillarY - pillarHeight,
          8 * zoom,
          pillarHeight
        );
      }
      ctx.shadowBlur = 0;
      ctx.restore();
      break;
    }

    case "turret_deploy": {
      // Engineer's turret deployment effect
      const deployRadius = effect.size * zoom;

      ctx.save();
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 12 * zoom;

      // Construction sparks
      for (let spark = 0; spark < 8; spark++) {
        const sparkAngle = (spark / 8) * Math.PI * 2 + progress * Math.PI * 4;
        const sparkDist = deployRadius * 0.5 * (1 - progress * 0.5);
        const sparkX = screenPos.x + Math.cos(sparkAngle) * sparkDist;
        const sparkY =
          screenPos.y +
          Math.sin(sparkAngle) * sparkDist * 0.5 -
          progress * 10 * zoom;

        ctx.fillStyle = `rgba(255, 220, 100, ${alpha * (1 - progress)})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Build-up circle
      ctx.strokeStyle = `rgba(255, 200, 50, ${alpha})`;
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        deployRadius * (1 - progress * 0.5),
        deployRadius * 0.5 * (1 - progress * 0.5),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.shadowBlur = 0;
      ctx.restore();
      break;
    }
  }
}

// ============================================================================
// PARTICLE RENDERING
// ============================================================================
export function renderParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
) {
  const screenPos = worldToScreen(
    particle.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom
  );
  const zoom = cameraZoom || 1;
  const lifeRatio = particle.life / particle.maxLife;
  const alpha = lifeRatio;
  const size = particle.size * zoom * lifeRatio;

  ctx.save();
  ctx.globalAlpha = alpha;

  if (
    particle.type === "glow" ||
    particle.type === "light" ||
    particle.type === "magic"
  ) {
    const glowGradient = ctx.createRadialGradient(
      screenPos.x,
      screenPos.y,
      0,
      screenPos.x,
      screenPos.y,
      size * 2
    );
    glowGradient.addColorStop(0, particle.color);
    glowGradient.addColorStop(1, "transparent");
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
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
  cameraZoom?: number
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

  const isValid = isValidBuildPosition(
    gridPos,
    selectedMap,
    towers,
    gridWidth,
    gridHeight,
    40
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

  // Range preview
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
