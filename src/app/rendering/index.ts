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
    ctx.shadowColor = isSelected ? "#ffd700" : "#ffffff";
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
    ctx.fillStyle = "#ffd700";
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 6 * zoom;
    drawStar(ctx, screenPos.x, starY, 8 * zoom, 4 * zoom, "#ffd700");
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

  // Glowing vents/lights on front faces
  const ventGlow = 0.6 + Math.sin(time * 4) * 0.3;
  ctx.fillStyle = `rgba(255, 102, 0, ${ventGlow})`;

  // Right face vents
  for (let i = 0; i < Math.min(level, 3); i++) {
    const ventY = y - height * zoom * 0.3 - i * 14 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x + w * 0.55,
      ventY + d * 0.2,
      3 * zoom,
      2 * zoom,
      -0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Left face vents
  for (let i = 0; i < Math.min(level, 3); i++) {
    const ventY = y - height * zoom * 0.3 - i * 14 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x - w * 0.55,
      ventY + d * 0.2,
      3 * zoom,
      2 * zoom,
      0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
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
    flashGrad.addColorStop(0.4, `rgba(255, 150, 0, ${flash * 0.7})`);
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
    flashGrad.addColorStop(1, `rgba(255, 100, 0, 0)`);
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

  // Glowing vents on sides
  for (let i = 0; i < tower.level; i++) {
    const ventY = screenPos.y - h * 0.3 - i * 12 * zoom;
    const ventGlow = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3;

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
  }

  // Circuit board patterns (flipped)
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

  // Node points with glow (at flipped circuit endpoints)
  const nodeGlow = 0.6 + Math.sin(time * 5) * 0.3;
  ctx.fillStyle = `rgba(0, 255, 255, ${nodeGlow})`;
  ctx.beginPath();
  ctx.arc(
    screenPos.x - w * 0.7,
    screenPos.y - h * 0.5,
    2 * zoom,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    screenPos.x + w * 0.7,
    screenPos.y - h * 0.5,
    2 * zoom,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Data screen on front
  ctx.fillStyle = "#0a2030";
  const screenW = 8 * zoom;
  const screenH = 6 * zoom;
  ctx.fillRect(
    screenPos.x - screenW / 2,
    screenPos.y - h * 0.35,
    screenW,
    screenH
  );

  // Screen content (scrolling data)
  ctx.fillStyle = `rgba(0, 255, 255, 0.7)`;
  for (let i = 0; i < 3; i++) {
    const lineOffset = (time * 20 + i * 2) % 6;
    ctx.fillRect(
      screenPos.x - screenW / 2 + 1 * zoom,
      screenPos.y - h * 0.35 + lineOffset * zoom,
      (3 + Math.sin(time * 10 + i) * 2) * zoom,
      1 * zoom
    );
  }

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

// CLUB TOWER - Sci-fi Resource Generator
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

  // Sci-fi foundation
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

  // Main tower body - dark green tech
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

  // Glowing resource vents
  for (let i = 0; i < tower.level; i++) {
    const ventY = screenPos.y - h * 0.3 - i * 12 * zoom;
    const ventGlow = 0.5 + Math.sin(time * 4 + i * 0.5) * 0.3;

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
  }

  // Tech roof structure
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

  // Data screens as windows
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

  // Data bars on screens
  ctx.fillStyle = "#0a2a1a";
  for (let i = 0; i < 3; i++) {
    const barY =
      screenPos.y - baseHeight * zoom * 0.6 + 3 * zoom + i * 3 * zoom;
    const barW = 3 + Math.sin(time * 8 + i) * 2;
    ctx.fillRect(screenPos.x - 10 * zoom, barY, barW * zoom, 2 * zoom);
    ctx.fillRect(screenPos.x + 4 * zoom, barY, (barW + 1) * zoom, 2 * zoom);
  }

  // Holographic credit/resource display
  const coinY = topY - 28 * zoom + Math.sin(time * 3) * 5 * zoom;

  // Energy ring around credit symbol
  ctx.strokeStyle = `rgba(0, 255, 100, ${0.4 + Math.sin(time * 4) * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, coinY, 16 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Holographic credit symbol
  const coinRotation = time * 4;
  ctx.save();
  ctx.translate(screenPos.x, coinY);
  ctx.scale(Math.cos(coinRotation), 1);

  // Outer glow
  const creditGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14 * zoom);
  creditGrad.addColorStop(0, `rgba(0, 255, 100, 0.8)`);
  creditGrad.addColorStop(0.5, `rgba(0, 200, 80, 0.5)`);
  creditGrad.addColorStop(1, `rgba(0, 150, 60, 0)`);
  ctx.fillStyle = creditGrad;
  ctx.shadowColor = "#00ff66";
  ctx.shadowBlur = 15 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, 12 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Credit symbol
  ctx.fillStyle = "#003318";
  ctx.font = `bold ${14 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("¤", 0, 0);
  ctx.restore();

  // Resource flow particles
  for (let i = 0; i < tower.level + 2; i++) {
    const pPhase = (time * 2 + i * 0.4) % 1;
    const pY = screenPos.y - pPhase * h * 1.5;
    const pX = screenPos.x + Math.sin(time * 3 + i * 2) * 8 * zoom;
    const pAlpha = Math.sin(pPhase * Math.PI) * 0.6;

    ctx.fillStyle = `rgba(0, 255, 100, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(pX, pY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Level 3+ upgrade visuals
  if (tower.level >= 3) {
    if (tower.upgrade === "A") {
      // Investment Fund - holographic stock chart
      ctx.strokeStyle = "#00ff66";
      ctx.lineWidth = 3 * zoom;
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 18 * zoom, topY - 35 * zoom);
      ctx.lineTo(screenPos.x - 6 * zoom, topY - 48 * zoom);
      ctx.lineTo(screenPos.x + 6 * zoom, topY - 41 * zoom);
      ctx.lineTo(screenPos.x + 18 * zoom, topY - 55 * zoom);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Arrow head
      ctx.fillStyle = "#00ff66";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 18 * zoom, topY - 55 * zoom);
      ctx.lineTo(screenPos.x + 12 * zoom, topY - 53 * zoom);
      ctx.lineTo(screenPos.x + 14 * zoom, topY - 47 * zoom);
      ctx.closePath();
      ctx.fill();

      // Data points
      ctx.fillStyle = `rgba(0, 255, 100, 0.8)`;
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
    const hd = d * zoom * 0.3;
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

    // Left face
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy - hh); // Top-left
    ctx.lineTo(cx, cy - hh + hd); // Top-right
    ctx.lineTo(cx, cy + hd); // Bottom-right
    ctx.lineTo(cx - hw, cy); // Bottom-left
    ctx.closePath();
    ctx.fill();

    // Right face
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(cx + hw, cy - hh); // Top-right
    ctx.lineTo(cx + hw, cy); // Bottom-right
    ctx.lineTo(cx, cy + hd); // Bottom
    ctx.lineTo(cx, cy - hh + hd); // Top
    ctx.closePath();
    ctx.fill();
  };

  // Platform layers (bottom to top)
  drawIsoDiamond(
    screenPos.x,
    screenPos.y + 12 * zoom,
    baseW + 16,
    baseD + 14,
    6,
    "#2a2a32",
    "#1a1a22",
    "#0a0a12"
  );
  drawIsoDiamond(
    screenPos.x,
    screenPos.y + 6 * zoom,
    baseW + 8,
    baseD + 7,
    5,
    "#3a3a42",
    "#2a2a32",
    "#1a1a22"
  );
  drawIsoDiamond(
    screenPos.x,
    screenPos.y,
    baseW,
    baseD,
    4,
    "#4a4a52",
    "#3a3a42",
    "#2a2a32"
  );

  // Glowing edge on top platform
  const edgeGlow = 0.5 + Math.sin(time * 2) * 0.2;
  ctx.strokeStyle = `rgba(255, 108, 0, ${edgeGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.shadowColor = "#ff6c00";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - isoW, screenPos.y - 4 * zoom);
  ctx.lineTo(screenPos.x, screenPos.y + isoD - 4 * zoom);
  ctx.lineTo(screenPos.x + isoW, screenPos.y - 4 * zoom);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ========== MAGLEV TRACK (aligned with isometric X-axis) ==========
  const trackLen = baseW * 0.75 * zoom;
  const trackW = 14 * zoom;

  // Track follows isometric X-axis (top-left to bottom-right diagonal)
  // Track bed
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(
    screenPos.x - trackLen * 0.5,
    screenPos.y + trackLen * 0.25 - 4 * zoom
  );
  ctx.lineTo(screenPos.x, screenPos.y - trackW * 0.15 - 4 * zoom);
  ctx.lineTo(
    screenPos.x + trackLen * 0.5,
    screenPos.y - trackLen * 0.25 - 4 * zoom
  );
  ctx.lineTo(screenPos.x, screenPos.y + trackW * 0.15 - 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Track surface with Princeton orange accent
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.moveTo(
    screenPos.x - trackLen * 0.48,
    screenPos.y + trackLen * 0.24 - 6 * zoom
  );
  ctx.lineTo(screenPos.x, screenPos.y - trackW * 0.1 - 6 * zoom);
  ctx.lineTo(
    screenPos.x + trackLen * 0.48,
    screenPos.y - trackLen * 0.24 - 6 * zoom
  );
  ctx.lineTo(screenPos.x, screenPos.y + trackW * 0.1 - 6 * zoom);
  ctx.closePath();
  ctx.fill();

  // Maglev rails (Princeton orange glow)
  const railGlow = 0.6 + Math.sin(time * 3) * 0.25;
  ctx.strokeStyle = `rgba(255, 108, 0, ${railGlow})`;
  ctx.lineWidth = 3 * zoom;
  ctx.shadowColor = "#ff6c00";
  ctx.shadowBlur = 6 * zoom;

  for (const offset of [-4, 4]) {
    const ox = offset * zoom * 0.5;
    const oy = offset * zoom * 0.25;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - trackLen * 0.45 + ox,
      screenPos.y + trackLen * 0.225 + oy - 6 * zoom
    );
    ctx.lineTo(
      screenPos.x + trackLen * 0.45 + ox,
      screenPos.y - trackLen * 0.225 + oy - 6 * zoom
    );
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Track power nodes with Princeton shield symbols
  const numNodes = 5 + tower.level;
  for (let i = 0; i < numNodes; i++) {
    const t = i / (numNodes - 1) - 0.5;
    const nx = screenPos.x + trackLen * t;
    const ny = screenPos.y - trackLen * t * 0.5 - 6 * zoom;

    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(nx - 3 * zoom, ny);
    ctx.lineTo(nx, ny - 2 * zoom);
    ctx.lineTo(nx + 3 * zoom, ny);
    ctx.lineTo(nx, ny + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    if (i % 2 === 0) {
      ctx.fillStyle = `rgba(255, 108, 0, ${
        0.5 + Math.sin(time * 4 + i) * 0.3
      })`;
      ctx.beginPath();
      ctx.arc(nx, ny, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== STATION BUILDING (proper isometric alignment) ==========
  const stationX = screenPos.x - 16 * zoom;
  const stationY = screenPos.y - 8 * zoom;

  // Helper for isometric building with proper roof
  const drawStation = (
    bW: number,
    bD: number,
    bH: number,
    roofH: number,
    level: number
  ) => {
    const hw = bW * zoom * 0.5;
    const hd = bD * zoom * 0.25;
    const hh = bH * zoom;
    const rh = roofH * zoom;

    // Building body using drawIsometricPrism (already correct)
    drawIsometricPrism(
      ctx,
      stationX,
      stationY,
      bW,
      bD,
      bH,
      { top: "#3a3a42", left: "#2a2a32", right: "#1a1a22" },
      zoom
    );

    const roofY = stationY - hh;

    // Proper isometric pyramid roof
    // The roof should match the building's footprint
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.moveTo(stationX, roofY - rh); // Peak
    ctx.lineTo(stationX - hw, roofY); // Left
    ctx.lineTo(stationX, roofY + hd); // Front
    ctx.lineTo(stationX + hw, roofY); // Right
    ctx.closePath();
    ctx.fill();

    // Roof right face
    ctx.fillStyle = "#0a0a12";
    ctx.beginPath();
    ctx.moveTo(stationX, roofY - rh); // Peak
    ctx.lineTo(stationX + hw, roofY); // Right
    ctx.lineTo(stationX, roofY + hd); // Front
    ctx.closePath();
    ctx.fill();

    return roofY;
  };

  if (tower.level === 1) {
    // LEVEL 1: Dinky Junction
    const roofY = drawStation(26, 22, 34, 18, 1);

    // Antenna with beacon
    ctx.fillStyle = "#2a2a32";
    ctx.fillRect(stationX - 1.5 * zoom, roofY - 36 * zoom, 3 * zoom, 20 * zoom);
    const beaconGlow = 0.6 + Math.sin(time * 4) * 0.4;
    ctx.fillStyle = `rgba(255, 108, 0, ${beaconGlow})`;
    ctx.shadowColor = "#ff6c00";
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.arc(stationX, roofY - 37 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Display window
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(
      stationX - 7 * zoom,
      stationY - 20 * zoom,
      12 * zoom,
      10 * zoom
    );
    ctx.fillStyle = `rgba(255, 108, 0, ${0.5 + Math.sin(time * 2) * 0.2})`;
    ctx.fillRect(
      stationX - 6 * zoom,
      stationY - 19 * zoom,
      10 * zoom,
      8 * zoom
    );

    // Princeton tiger stripe pattern on door
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(stationX - 5 * zoom, stationY - 7 * zoom, 9 * zoom, 7 * zoom);
    ctx.fillStyle = "#ff6c00";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(
        stationX - 4 * zoom + i * 3 * zoom,
        stationY - 6 * zoom,
        1.5 * zoom,
        5 * zoom
      );
    }

    // DINKY sign
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(stationX - 11 * zoom, roofY + 14 * zoom, 22 * zoom, 9 * zoom);
    ctx.strokeStyle = `rgba(255, 108, 0, ${0.8 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.strokeRect(
      stationX - 11 * zoom,
      roofY + 14 * zoom,
      22 * zoom,
      9 * zoom
    );
    ctx.fillStyle = `rgba(255, 108, 0, 0.95)`;
    ctx.shadowColor = "#ff6c00";
    ctx.shadowBlur = 8 * zoom;
    ctx.font = `bold ${6 * zoom}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("DINKY", stationX, roofY + 21 * zoom);
    ctx.shadowBlur = 0;
  } else if (tower.level === 2) {
    // LEVEL 2: Dinky Central with Clock Tower
    const roofY = drawStation(30, 26, 38, 20, 2);

    // Clock tower
    const towerX = stationX;
    const towerBaseY = roofY - 6 * zoom;
    drawIsometricPrism(
      ctx,
      towerX,
      towerBaseY,
      12,
      10,
      32,
      { top: "#3a3a42", left: "#2a2a32", right: "#1a1a22" },
      zoom
    );

    const clockY = towerBaseY - 32 * zoom;

    // Tower spire roof
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.moveTo(towerX, clockY - 20 * zoom);
    ctx.lineTo(towerX - 8 * zoom, clockY);
    ctx.lineTo(towerX, clockY + 5 * zoom);
    ctx.lineTo(towerX + 8 * zoom, clockY);
    ctx.closePath();
    ctx.fill();

    // Finial
    ctx.fillStyle = "#ffd700";
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(towerX, clockY - 22 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clock face
    ctx.fillStyle = "#fffff0";
    ctx.beginPath();
    ctx.arc(towerX, clockY + 12 * zoom, 7 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Clock hands
    const hourAngle = (time * 0.05) % (Math.PI * 2);
    const minAngle = (time * 0.3) % (Math.PI * 2);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(towerX, clockY + 12 * zoom);
    ctx.lineTo(
      towerX + Math.sin(hourAngle) * 4 * zoom,
      clockY + 12 * zoom - Math.cos(hourAngle) * 4 * zoom
    );
    ctx.stroke();
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(towerX, clockY + 12 * zoom);
    ctx.lineTo(
      towerX + Math.sin(minAngle) * 5.5 * zoom,
      clockY + 12 * zoom - Math.cos(minAngle) * 5.5 * zoom
    );
    ctx.stroke();

    // Windows with Princeton orange glow
    for (let i = 0; i < 2; i++) {
      const winX = stationX + (i - 0.5) * 12 * zoom;
      ctx.fillStyle = "#0a0a12";
      ctx.fillRect(winX - 4 * zoom, stationY - 16 * zoom, 8 * zoom, 12 * zoom);
      ctx.fillStyle = `rgba(255, 108, 0, ${
        0.5 + Math.sin(time * 2 + i) * 0.2
      })`;
      ctx.fillRect(winX - 3 * zoom, stationY - 15 * zoom, 6 * zoom, 10 * zoom);
    }

    // Entrance with tiger stripes
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(stationX - 6 * zoom, stationY - 8 * zoom, 11 * zoom, 8 * zoom);
    ctx.fillStyle = "#ff6c00";
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(
        stationX - 5 * zoom + i * 3 * zoom,
        stationY - 7 * zoom,
        1.5 * zoom,
        6 * zoom
      );
    }

    // DINKY sign
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(stationX - 13 * zoom, roofY + 16 * zoom, 26 * zoom, 10 * zoom);
    ctx.strokeStyle = `rgba(255, 108, 0, ${0.8 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.strokeRect(
      stationX - 13 * zoom,
      roofY + 16 * zoom,
      26 * zoom,
      10 * zoom
    );
    ctx.fillStyle = `rgba(255, 108, 0, 0.95)`;
    ctx.shadowColor = "#ff6c00";
    ctx.shadowBlur = 8 * zoom;
    ctx.font = `bold ${6.5 * zoom}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("DINKY", stationX, roofY + 24 * zoom);
    ctx.shadowBlur = 0;
  } else {
    // LEVEL 3: Princeton Junction Grand Terminal
    const roofY = drawStation(36, 30, 44, 24, 3);

    // Flying buttresses
    for (const side of [-1, 1]) {
      const buttX = stationX + side * 20 * zoom;
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.moveTo(buttX, stationY);
      ctx.lineTo(buttX + side * 6 * zoom, stationY + 3 * zoom);
      ctx.lineTo(buttX + side * 4 * zoom, stationY - 36 * zoom);
      ctx.lineTo(buttX, stationY - 30 * zoom);
      ctx.closePath();
      ctx.fill();

      // Orange accent line
      ctx.strokeStyle = `rgba(255, 108, 0, ${0.5 + Math.sin(time * 3) * 0.2})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(buttX + side * 5 * zoom, stationY + 1 * zoom);
      ctx.lineTo(buttX + side * 3 * zoom, stationY - 34 * zoom);
      ctx.stroke();
    }

    // Central spire with Princeton shield
    ctx.fillStyle = "#2a2a32";
    ctx.fillRect(stationX - 3 * zoom, roofY - 50 * zoom, 6 * zoom, 28 * zoom);

    // Energy ring (orange)
    const coreGlow = 0.7 + Math.sin(time * 4) * 0.3;
    ctx.strokeStyle = `rgba(255, 108, 0, ${coreGlow})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.shadowColor = "#ff6c00";
    ctx.shadowBlur = 12 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      stationX,
      roofY - 38 * zoom,
      6 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Spire beacon
    ctx.fillStyle = `rgba(255, 108, 0, ${coreGlow})`;
    ctx.beginPath();
    ctx.arc(stationX, roofY - 52 * zoom, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Rose window with Princeton tiger
    ctx.fillStyle = "#0a0a12";
    ctx.beginPath();
    ctx.arc(stationX, roofY - 12 * zoom, 9 * zoom, 0, Math.PI * 2);
    ctx.fill();

    const roseGlow = 0.6 + Math.sin(time * 2) * 0.3;
    const roseGrad = ctx.createRadialGradient(
      stationX,
      roofY - 12 * zoom,
      0,
      stationX,
      roofY - 12 * zoom,
      8 * zoom
    );
    roseGrad.addColorStop(0, `rgba(255, 180, 100, ${roseGlow})`);
    roseGrad.addColorStop(0.5, `rgba(255, 108, 0, ${roseGlow * 0.8})`);
    roseGrad.addColorStop(1, `rgba(200, 80, 0, ${roseGlow * 0.5})`);
    ctx.fillStyle = roseGrad;
    ctx.shadowColor = "#ff6c00";
    ctx.shadowBlur = 12 * zoom;
    ctx.beginPath();
    ctx.arc(stationX, roofY - 12 * zoom, 7 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Tiger stripes in rose window
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2 * zoom;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 0.3;
      ctx.beginPath();
      ctx.moveTo(stationX, roofY - 12 * zoom);
      ctx.lineTo(
        stationX + Math.cos(angle) * 6 * zoom,
        roofY - 12 * zoom + Math.sin(angle) * 6 * zoom
      );
      ctx.stroke();
    }

    // Grand entrance with columns
    ctx.fillStyle = "#3a3a42";
    ctx.fillRect(
      stationX - 14 * zoom,
      stationY - 26 * zoom,
      5 * zoom,
      26 * zoom
    );
    ctx.fillRect(
      stationX + 9 * zoom,
      stationY - 26 * zoom,
      5 * zoom,
      26 * zoom
    );

    // Column accents
    ctx.fillStyle = `rgba(255, 108, 0, ${0.5 + Math.sin(time * 3) * 0.2})`;
    ctx.fillRect(
      stationX - 12 * zoom,
      stationY - 24 * zoom,
      1.5 * zoom,
      22 * zoom
    );
    ctx.fillRect(
      stationX + 10.5 * zoom,
      stationY - 24 * zoom,
      1.5 * zoom,
      22 * zoom
    );

    // Grand entrance
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(
      stationX - 9 * zoom,
      stationY - 10 * zoom,
      16 * zoom,
      10 * zoom
    );
    ctx.fillStyle = `rgba(255, 108, 0, ${0.4 + Math.sin(time * 1.5) * 0.15})`;
    ctx.shadowColor = "#ff6c00";
    ctx.shadowBlur = 12 * zoom;
    ctx.fillRect(stationX - 8 * zoom, stationY - 9 * zoom, 14 * zoom, 8 * zoom);
    ctx.shadowBlur = 0;

    // Tiger silhouette in entrance
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(
      stationX,
      stationY - 5 * zoom,
      4 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Side windows
    for (const side of [-1, 1]) {
      const winX = stationX + side * 16 * zoom;
      ctx.fillStyle = "#0a0a12";
      ctx.fillRect(winX - 3 * zoom, stationY - 20 * zoom, 6 * zoom, 14 * zoom);
      ctx.fillStyle = `rgba(255, 108, 0, ${
        0.45 + Math.sin(time * 2 + side) * 0.15
      })`;
      ctx.fillRect(
        winX - 2.5 * zoom,
        stationY - 19 * zoom,
        5 * zoom,
        12 * zoom
      );
    }

    // PRINCETON JUNCTION sign
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(stationX - 18 * zoom, roofY + 18 * zoom, 36 * zoom, 12 * zoom);
    ctx.strokeStyle = `rgba(255, 108, 0, ${0.8 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.strokeRect(
      stationX - 18 * zoom,
      roofY + 18 * zoom,
      36 * zoom,
      12 * zoom
    );

    // Corner decorations
    ctx.fillStyle = "#ff6c00";
    for (let c = 0; c < 4; c++) {
      const cx = stationX + ((c % 2) * 2 - 1) * 18 * zoom;
      const cy = roofY + 18 * zoom + (c >= 2 ? 12 : 0) * zoom;
      ctx.beginPath();
      ctx.arc(cx, cy, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = `rgba(255, 108, 0, 0.95)`;
    ctx.shadowColor = "#ff6c00";
    ctx.shadowBlur = 10 * zoom;
    ctx.font = `bold ${5 * zoom}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("PRINCETON JCT", stationX, roofY + 26 * zoom);
    ctx.shadowBlur = 0;
  }

  // ========== MAGLEV TRAIN ==========
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

    const trackLen = baseW * 0.75 * zoom;
    const trainX = screenPos.x + trackLen * trainT;
    const trainY = screenPos.y - trackLen * trainT * 0.5 - 12 * zoom;

    ctx.save();
    ctx.globalAlpha = trainAlpha;

    const tW = (22 + tower.level * 4) * zoom;
    const tD = (12 + tower.level * 2) * zoom;
    const tH = (12 + tower.level * 3) * zoom;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(
      trainX + 2 * zoom,
      trainY + 14 * zoom,
      tW * 0.45,
      tD * 0.25,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Train body - sleek design with Princeton colors
    const bodyGrad = ctx.createLinearGradient(
      trainX - tW * 0.5,
      trainY,
      trainX + tW * 0.5,
      trainY
    );
    bodyGrad.addColorStop(0, "#2a2a32");
    bodyGrad.addColorStop(0.3, "#4a4a52");
    bodyGrad.addColorStop(0.5, "#5a5a62");
    bodyGrad.addColorStop(0.7, "#4a4a52");
    bodyGrad.addColorStop(1, "#2a2a32");
    ctx.fillStyle = bodyGrad;

    // Main body
    ctx.beginPath();
    ctx.moveTo(trainX - tW * 0.5, trainY);
    ctx.lineTo(trainX - tW * 0.42, trainY - tH);
    ctx.lineTo(trainX + tW * 0.42, trainY - tH);
    ctx.lineTo(trainX + tW * 0.5, trainY);
    ctx.closePath();
    ctx.fill();

    // Train bottom
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.moveTo(trainX - tW * 0.5, trainY);
    ctx.lineTo(trainX + tW * 0.5, trainY);
    ctx.lineTo(trainX + tW * 0.45, trainY + tD * 0.35);
    ctx.lineTo(trainX - tW * 0.45, trainY + tD * 0.35);
    ctx.closePath();
    ctx.fill();

    // Nose cone
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(trainX + tW * 0.5, trainY);
    ctx.lineTo(trainX + tW * 0.7, trainY - tH * 0.35);
    ctx.lineTo(trainX + tW * 0.5, trainY - tH * 0.85);
    ctx.lineTo(trainX + tW * 0.42, trainY - tH);
    ctx.lineTo(trainX + tW * 0.42, trainY);
    ctx.closePath();
    ctx.fill();

    // Princeton orange stripe
    ctx.fillStyle = "#ff6c00";
    ctx.fillRect(trainX - tW * 0.45, trainY - tH * 0.4, tW * 0.88, 4 * zoom);

    // Windows
    ctx.fillStyle = `rgba(200, 230, 255, ${0.6 + Math.sin(time * 3) * 0.15})`;
    ctx.fillRect(trainX - tW * 0.35, trainY - tH * 0.85, tW * 0.6, tH * 0.25);

    // Glow strip
    ctx.fillStyle = `rgba(255, 108, 0, ${0.6 + Math.sin(time * 4) * 0.3})`;
    ctx.shadowColor = "#ff6c00";
    ctx.shadowBlur = 6 * zoom;
    ctx.fillRect(trainX - tW * 0.46, trainY - 2 * zoom, tW * 0.9, 2.5 * zoom);
    ctx.shadowBlur = 0;

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
        `rgba(255, 150, 0, ${(1 - flamePhase) * 0.7})`
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
  // DARK FANTASY FRESHMAN - Corrupted young scholar with ominous aura
  const bobble = Math.sin(time * 8) * 2 * zoom;
  const wobble = Math.sin(time * 6) * 0.05;

  // Shadow beneath
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.25, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark aura wisps
  ctx.strokeStyle = `rgba(80, 60, 120, ${0.3 + Math.sin(time * 4) * 0.15})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 3; i++) {
    const auraPhase = (time * 2 + i * 0.7) % 2;
    const auraY = y - auraPhase * size * 0.3;
    const auraAlpha = Math.max(0, 1 - auraPhase);
    ctx.globalAlpha = auraAlpha * 0.4;
    ctx.beginPath();
    ctx.arc(
      x + Math.sin(time * 3 + i) * size * 0.1,
      auraY,
      size * 0.1 * (1 + auraPhase * 0.5),
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Oversized cursed backpack (dark purple)
  ctx.fillStyle = "#2a1a4a";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1, size * 0.38, size * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0a3a";
  ctx.fillRect(x - size * 0.28, y - size * 0.22, size * 0.56, size * 0.38);
  // Glowing rune on backpack
  ctx.fillStyle = `rgba(150, 100, 200, ${0.5 + Math.sin(time * 3) * 0.3})`;
  ctx.font = `${8 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ᚨ", x, y + size * 0.15);

  // Body (corrupted orange hoodie with dark stains)
  const hoodieGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  hoodieGrad.addColorStop(0, "#aa4400");
  hoodieGrad.addColorStop(0.3, "#cc5500");
  hoodieGrad.addColorStop(0.5, "#dd6610");
  hoodieGrad.addColorStop(0.7, "#cc5500");
  hoodieGrad.addColorStop(1, "#aa4400");
  ctx.fillStyle = hoodieGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.38);
  ctx.quadraticCurveTo(
    x - size * 0.38,
    y - size * 0.08,
    x - size * 0.16,
    y - size * 0.27
  );
  ctx.lineTo(x + size * 0.16, y - size * 0.27);
  ctx.quadraticCurveTo(
    x + size * 0.38,
    y - size * 0.08,
    x + size * 0.32,
    y + size * 0.38
  );
  ctx.closePath();
  ctx.fill();

  // Dark stain on hoodie
  ctx.fillStyle = "rgba(40, 20, 60, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y + size * 0.1,
    size * 0.1,
    size * 0.12,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Hood (darker)
  ctx.fillStyle = "#993300";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.3 + bobble * 0.3,
    size * 0.24,
    size * 0.16,
    0,
    Math.PI,
    0
  );
  ctx.fill();

  // Face (pale, corrupted)
  ctx.fillStyle = "#e8d8c8";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.37 + bobble, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Big nervous glowing eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.09,
    y - size * 0.4 + bobble,
    size * 0.085,
    size * 0.11,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.09,
    y - size * 0.4 + bobble,
    size * 0.085,
    size * 0.11,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Pupils (purple-tinted, darting nervously)
  const pupilOffset = Math.sin(time * 4) * size * 0.025;
  ctx.fillStyle = "#4a2060";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.09 + pupilOffset,
    y - size * 0.4 + bobble,
    size * 0.045,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.09 + pupilOffset,
    y - size * 0.4 + bobble,
    size * 0.045,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Eye glow
  ctx.fillStyle = `rgba(150, 100, 200, ${0.3 + Math.sin(time * 5) * 0.2})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.09 + pupilOffset,
    y - size * 0.4 + bobble,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.09 + pupilOffset,
    y - size * 0.4 + bobble,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Worried eyebrows (darker)
  ctx.strokeStyle = "#3a2015";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.52 + bobble);
  ctx.lineTo(x - size * 0.02, y - size * 0.48 + bobble);
  ctx.moveTo(x + size * 0.16, y - size * 0.52 + bobble);
  ctx.lineTo(x + size * 0.02, y - size * 0.48 + bobble);
  ctx.stroke();

  // Small worried mouth
  ctx.strokeStyle = "#6a4535";
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.28 + bobble,
    size * 0.06,
    0.2 * Math.PI,
    0.8 * Math.PI
  );
  ctx.stroke();
  ctx.arc(
    x,
    y - size * 0.28 + bobble,
    size * 0.06,
    0.2 * Math.PI,
    0.8 * Math.PI
  );
  ctx.stroke();

  // Lanyard with ID
  ctx.strokeStyle = "#ff6600";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.2);
  ctx.lineTo(x - size * 0.05, y + size * 0.1);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.fillRect(x - size * 0.1, y + size * 0.05, size * 0.12, size * 0.15);
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
  // DARK FANTASY SOPHOMORE - Overconfident corrupted student with cursed coffee
  const walkCycle = Math.sin(time * 6) * 3 * zoom;

  // Shadow beneath
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.28, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (dark casual clothes with ominous blue)
  const shirtGrad = ctx.createLinearGradient(
    x,
    y - size * 0.3,
    x,
    y + size * 0.4
  );
  shirtGrad.addColorStop(0, "#2a5080");
  shirtGrad.addColorStop(0.5, "#3a6090");
  shirtGrad.addColorStop(1, "#1a3060");
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.38);
  ctx.lineTo(x - size * 0.34, y - size * 0.13);
  ctx.quadraticCurveTo(x, y - size * 0.38, x + size * 0.34, y - size * 0.13);
  ctx.lineTo(x + size * 0.3, y + size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Dark stains on shirt
  ctx.fillStyle = "rgba(20, 10, 40, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    y + size * 0.05,
    size * 0.08,
    size * 0.1,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Dark jeans
  ctx.fillStyle = "#2a3a5a";
  ctx.fillRect(x - size * 0.22, y + size * 0.2, size * 0.18, size * 0.28);
  ctx.fillRect(x + size * 0.04, y + size * 0.2, size * 0.18, size * 0.28);

  // Head (slightly pale)
  ctx.fillStyle = "#e8d8c8";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + walkCycle * 0.3, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Messy dark hair with unnatural highlights
  ctx.fillStyle = "#2a1a18";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.55 + walkCycle * 0.3,
    size * 0.22,
    size * 0.13,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  for (let i = 0; i < 6; i++) {
    const angle = -0.5 + i * 0.2;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(angle) * size * 0.16,
      y - size * 0.58 + walkCycle * 0.3
    );
    ctx.lineTo(
      x + Math.cos(angle) * size * 0.24,
      y - size * 0.7 + walkCycle * 0.3 + Math.sin(time * 3 + i) * 2
    );
    ctx.lineWidth = 3.5 * zoom;
    ctx.strokeStyle = "#2a1a18";
    ctx.stroke();
  }
  // Hair highlight (purple tint)
  ctx.strokeStyle = "rgba(80, 50, 100, 0.4)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.05,
    y - size * 0.6 + walkCycle * 0.3,
    size * 0.1,
    -0.5,
    0.5
  );
  ctx.stroke();

  // Confident but unsettling eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.09,
    y - size * 0.44 + walkCycle * 0.3,
    size * 0.065,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.09,
    y - size * 0.44 + walkCycle * 0.3,
    size * 0.065,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Green-tinted pupils with glow
  ctx.fillStyle = "#1a4a2a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.09,
    y - size * 0.44 + walkCycle * 0.3,
    size * 0.04,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.09,
    y - size * 0.44 + walkCycle * 0.3,
    size * 0.04,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Eerie eye glow
  ctx.fillStyle = `rgba(50, 150, 80, ${0.3 + Math.sin(time * 4) * 0.15})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.09,
    y - size * 0.44 + walkCycle * 0.3,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.09,
    y - size * 0.44 + walkCycle * 0.3,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Arrogant smirk
  ctx.strokeStyle = "#5a4535";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.02,
    y - size * 0.34 + walkCycle * 0.3,
    size * 0.07,
    0.85 * Math.PI,
    0.15 * Math.PI,
    true
  );
  ctx.stroke();

  // Cursed coffee cup with glowing contents
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x + size * 0.36, y - size * 0.08, size * 0.14, size * 0.2);
  ctx.fillStyle = `rgba(100, 50, 150, ${0.6 + Math.sin(time * 3) * 0.3})`;
  ctx.fillRect(x + size * 0.37, y - size * 0.05, size * 0.12, size * 0.08);
  // Cursed steam
  ctx.strokeStyle = `rgba(150, 100, 180, ${0.4 + Math.sin(time * 5) * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const steamPhase = (time * 2 + i * 0.5) % 1.5;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.39 + i * size * 0.04, y - size * 0.1);
    ctx.quadraticCurveTo(
      x + size * 0.42 + i * size * 0.04 + Math.sin(time * 4 + i) * 4,
      y - size * 0.2 - steamPhase * size * 0.1,
      x + size * 0.39 + i * size * 0.04,
      y - size * 0.3 - steamPhase * size * 0.1
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
  // DARK FANTASY JUNIOR - Overworked scholar with cursed knowledge
  const stressTwitch = Math.sin(time * 10) * 1.5 * zoom;

  // Shadow beneath
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark energy wisps from stress
  ctx.strokeStyle = `rgba(100, 60, 140, ${0.25 + Math.sin(time * 5) * 0.1})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const wispPhase = (time * 1.5 + i * 0.5) % 2;
    const wispX = x + Math.sin(time * 2 + i) * size * 0.2;
    const wispY = y - size * 0.5 - wispPhase * size * 0.2;
    ctx.beginPath();
    ctx.moveTo(wispX, wispY + size * 0.15);
    ctx.quadraticCurveTo(
      wispX + Math.sin(time * 4 + i) * size * 0.1,
      wispY + size * 0.05,
      wispX,
      wispY
    );
    ctx.stroke();
  }

  // Stack of cursed/ancient books
  const bookColors = ["#4a0a0a", "#0a0a4a", "#0a3a0a"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = bookColors[i];
    ctx.fillRect(
      x - size * 0.42,
      y - size * 0.12 + i * size * 0.09,
      size * 0.28,
      size * 0.08
    );
    // Glowing runes on book spines
    ctx.fillStyle = `rgba(200, 150, 255, ${
      0.3 + Math.sin(time * 3 + i) * 0.2
    })`;
    ctx.font = `${5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("⁂", x - size * 0.28, y - size * 0.06 + i * size * 0.09);
  }

  // Body (worn scholar's shirt)
  ctx.fillStyle = "#d8d0c0";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.27, y + size * 0.38);
  ctx.lineTo(x - size * 0.3, y - size * 0.13);
  ctx.lineTo(x, y - size * 0.27);
  ctx.lineTo(x + size * 0.3, y - size * 0.13);
  ctx.lineTo(x + size * 0.27, y + size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Stains on shirt
  ctx.fillStyle = "rgba(60, 40, 80, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y + size * 0.1,
    size * 0.06,
    size * 0.08,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Dark buttons
  ctx.fillStyle = "#3a3a4a";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y - size * 0.1 + i * size * 0.12, size * 0.028, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head (pale, stressed)
  ctx.fillStyle = "#e0d0c0";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Cracked/ancient glasses
  ctx.strokeStyle = "#2a2a3a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.rect(x - size * 0.19, y - size * 0.5, size * 0.15, size * 0.12);
  ctx.rect(x + size * 0.04, y - size * 0.5, size * 0.15, size * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.44);
  ctx.lineTo(x + size * 0.04, y - size * 0.44);
  ctx.stroke();
  // Glasses crack
  ctx.strokeStyle = "rgba(100, 100, 120, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.5);
  ctx.lineTo(x - size * 0.08, y - size * 0.42);
  ctx.stroke();

  // Tired eyes with purple glow behind glasses
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.11,
    y - size * 0.44,
    size * 0.05,
    size * 0.055,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.11,
    y - size * 0.44,
    size * 0.05,
    size * 0.055,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#4a3a5a";
  ctx.beginPath();
  ctx.arc(x - size * 0.11, y - size * 0.44, size * 0.032, 0, Math.PI * 2);
  ctx.arc(x + size * 0.11, y - size * 0.44, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  // Eldritch eye glow
  ctx.fillStyle = `rgba(150, 100, 200, ${0.25 + Math.sin(time * 6) * 0.15})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.11, y - size * 0.44, size * 0.018, 0, Math.PI * 2);
  ctx.arc(x + size * 0.11, y - size * 0.44, size * 0.018, 0, Math.PI * 2);
  ctx.fill();

  // Heavy dark circles (from forbidden knowledge)
  ctx.fillStyle = "rgba(80, 50, 100, 0.45)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.11,
    y - size * 0.38,
    size * 0.06,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.11,
    y - size * 0.38,
    size * 0.06,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Disheveled hair with gray streaks
  ctx.fillStyle = "#2a1a10";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.55, size * 0.22, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Gray stress streaks
  ctx.strokeStyle = "#6a6a7a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.58);
  ctx.lineTo(x - size * 0.08, y - size * 0.65);
  ctx.stroke();
  // Stray hairs twitching
  ctx.strokeStyle = "#2a1a10";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12 + stressTwitch, y - size * 0.6);
  ctx.lineTo(x - size * 0.18 + stressTwitch * 1.5, y - size * 0.72);
  ctx.moveTo(x + size * 0.06, y - size * 0.6);
  ctx.lineTo(x + size * 0.12, y - size * 0.68);
  ctx.stroke();

  // Grimace of despair
  ctx.strokeStyle = "#5a4535";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.3);
  ctx.lineTo(x + size * 0.09, y - size * 0.3);
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
  // Confident senior with graduation gear hints
  const strut = Math.sin(time * 5) * 2 * zoom;

  // Body (nice blazer)
  const blazerGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  blazerGrad.addColorStop(0, "#1a1a2e");
  blazerGrad.addColorStop(0.5, "#2a2a4e");
  blazerGrad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = blazerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.4);
  ctx.lineTo(x - size * 0.35, y - size * 0.1);
  ctx.lineTo(x - size * 0.15, y - size * 0.25);
  ctx.lineTo(x, y - size * 0.3);
  ctx.lineTo(x + size * 0.15, y - size * 0.25);
  ctx.lineTo(x + size * 0.35, y - size * 0.1);
  ctx.lineTo(x + size * 0.3, y + size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Lapels
  ctx.fillStyle = "#2a2a4e";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.25);
  ctx.lineTo(x - size * 0.15, y + size * 0.1);
  ctx.lineTo(x, y + size * 0.05);
  ctx.lineTo(x + size * 0.15, y + size * 0.1);
  ctx.lineTo(x + size * 0.1, y - size * 0.25);
  ctx.lineTo(x, y - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Tie
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x - size * 0.04, y + size * 0.15);
  ctx.lineTo(x, y + size * 0.2);
  ctx.lineTo(x + size * 0.04, y + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + strut * 0.2, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Styled hair
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.55 + strut * 0.2,
    size * 0.2,
    size * 0.1,
    0,
    0,
    Math.PI
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.5 + strut * 0.2);
  ctx.quadraticCurveTo(
    x - size * 0.25,
    y - size * 0.6 + strut * 0.2,
    x - size * 0.1,
    y - size * 0.62 + strut * 0.2
  );
  ctx.quadraticCurveTo(
    x,
    y - size * 0.58 + strut * 0.2,
    x + size * 0.1,
    y - size * 0.55 + strut * 0.2
  );
  ctx.lineTo(x + size * 0.18, y - size * 0.5 + strut * 0.2);
  ctx.fill();

  // Confident eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.44 + strut * 0.2,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.44 + strut * 0.2,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#2a4a2a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.44 + strut * 0.2,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.44 + strut * 0.2,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Confident smirk
  ctx.strokeStyle = "#8b6655";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.34 + strut * 0.2,
    size * 0.08,
    0.1 * Math.PI,
    0.9 * Math.PI
  );
  ctx.stroke();

  // Diploma/scroll in hand
  ctx.fillStyle = "#f5f5dc";
  ctx.save();
  ctx.translate(x + size * 0.38, y + size * 0.05);
  ctx.rotate(0.3);
  ctx.fillRect(-size * 0.04, -size * 0.15, size * 0.08, size * 0.3);
  ctx.fillStyle = "#8b0000";
  ctx.fillRect(-size * 0.05, -size * 0.15, size * 0.1, size * 0.03);
  ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.03);
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
  // Exhausted grad student with coffee and papers
  const exhaustionSway = Math.sin(time * 2) * 3 * zoom;

  // Body (wrinkled shirt)
  ctx.fillStyle = "#6a8a9a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.4);
  ctx.lineTo(x - size * 0.3, y - size * 0.15);
  ctx.quadraticCurveTo(x, y - size * 0.3, x + size * 0.3, y - size * 0.15);
  ctx.lineTo(x + size * 0.28, y + size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Wrinkle lines
  ctx.strokeStyle = "#5a7a8a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.1);
  ctx.lineTo(x - size * 0.1, y + size * 0.2);
  ctx.moveTo(x + size * 0.1, y - size * 0.05);
  ctx.lineTo(x + size * 0.15, y + size * 0.15);
  ctx.stroke();

  // Head (tilted from exhaustion)
  ctx.save();
  ctx.translate(x, y - size * 0.4);
  ctx.rotate(exhaustionSway * 0.02);

  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Messy beard/stubble
  ctx.fillStyle = "rgba(60, 50, 40, 0.4)";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.15, size * 0.1, 0, 0, Math.PI);
  ctx.fill();

  // Very tired eyes (half closed)
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.08,
    -size * 0.02,
    size * 0.05,
    size * 0.03,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    size * 0.08,
    -size * 0.02,
    size * 0.05,
    size * 0.03,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#4a3a2a";
  ctx.beginPath();
  ctx.arc(-size * 0.08, -size * 0.02, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.08, -size * 0.02, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Heavy dark circles
  ctx.fillStyle = "rgba(80, 60, 100, 0.5)";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.08,
    size * 0.03,
    size * 0.06,
    size * 0.03,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    size * 0.08,
    size * 0.03,
    size * 0.06,
    size * 0.03,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Droopy eyelids
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.08,
    -size * 0.04,
    size * 0.055,
    size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    size * 0.08,
    -size * 0.04,
    size * 0.055,
    size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Messy hair
  ctx.fillStyle = "#3a2a15";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.12, size * 0.2, size * 0.1, 0, 0, Math.PI);
  ctx.fill();
  for (let i = 0; i < 7; i++) {
    const hairAngle = -0.6 + i * 0.2;
    ctx.strokeStyle = "#3a2a15";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(Math.cos(hairAngle) * size * 0.15, -size * 0.15);
    ctx.quadraticCurveTo(
      Math.cos(hairAngle) * size * 0.2,
      -size * 0.25 + Math.sin(time * 2 + i) * 2,
      Math.cos(hairAngle + 0.3) * size * 0.18,
      -size * 0.22
    );
    ctx.stroke();
  }

  ctx.restore();

  // Large coffee cup
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + size * 0.32, y - size * 0.15, size * 0.15, size * 0.25);
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(x + size * 0.32, y - size * 0.12, size * 0.15, size * 0.08);
  // Cup logo
  ctx.fillStyle = "#228b22";
  ctx.beginPath();
  ctx.arc(x + size * 0.395, y + size * 0.02, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Papers scattered
  ctx.fillStyle = "#fff";
  ctx.save();
  ctx.translate(x - size * 0.35, y + size * 0.1);
  ctx.rotate(-0.2);
  ctx.fillRect(0, 0, size * 0.15, size * 0.2);
  ctx.restore();
  ctx.fillStyle = "#eee";
  ctx.save();
  ctx.translate(x - size * 0.38, y + size * 0.15);
  ctx.rotate(0.1);
  ctx.fillRect(0, 0, size * 0.15, size * 0.2);
  ctx.restore();
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
  // Distinguished professor with tweed jacket and bow tie
  const lectureGesture = Math.sin(time * 3) * 2 * zoom;

  // Body (tweed jacket)
  const tweedGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y
  );
  tweedGrad.addColorStop(0, "#6b5b4b");
  tweedGrad.addColorStop(0.3, "#7b6b5b");
  tweedGrad.addColorStop(0.5, "#8b7b6b");
  tweedGrad.addColorStop(0.7, "#7b6b5b");
  tweedGrad.addColorStop(1, "#6b5b4b");
  ctx.fillStyle = tweedGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.45);
  ctx.lineTo(x - size * 0.38, y - size * 0.1);
  ctx.lineTo(x - size * 0.2, y - size * 0.28);
  ctx.lineTo(x, y - size * 0.33);
  ctx.lineTo(x + size * 0.2, y - size * 0.28);
  ctx.lineTo(x + size * 0.38, y - size * 0.1);
  ctx.lineTo(x + size * 0.32, y + size * 0.45);
  ctx.closePath();
  ctx.fill();

  // Elbow patches
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.35 + lectureGesture,
    y + size * 0.1,
    size * 0.06,
    size * 0.08,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.35,
    y + size * 0.1,
    size * 0.06,
    size * 0.08,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Shirt collar
  ctx.fillStyle = "#f8f8ff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.25);
  ctx.lineTo(x - size * 0.08, y - size * 0.1);
  ctx.lineTo(x, y - size * 0.15);
  ctx.lineTo(x + size * 0.08, y - size * 0.1);
  ctx.lineTo(x + size * 0.12, y - size * 0.25);
  ctx.closePath();
  ctx.fill();

  // Bow tie
  ctx.fillStyle = "#8b0000";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x - size * 0.08, y - size * 0.22);
  ctx.lineTo(x - size * 0.08, y - size * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x + size * 0.08, y - size * 0.22);
  ctx.lineTo(x + size * 0.08, y - size * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - size * 0.18, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.45, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Grey/white hair (distinguished)
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.58, size * 0.22, size * 0.12, 0, 0, Math.PI);
  ctx.fill();
  // Side hair
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.22,
    y - size * 0.45,
    size * 0.08,
    size * 0.15,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.22,
    y - size * 0.45,
    size * 0.08,
    size * 0.15,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Wise eyes with glasses
  ctx.strokeStyle = "#8b7355";
  ctx.lineWidth = 2 * zoom;
  // Round spectacles
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.47, size * 0.07, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.47, size * 0.07, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.47);
  ctx.lineTo(x + size * 0.03, y - size * 0.47);
  ctx.moveTo(x - size * 0.17, y - size * 0.47);
  ctx.lineTo(x - size * 0.22, y - size * 0.45);
  ctx.moveTo(x + size * 0.17, y - size * 0.47);
  ctx.lineTo(x + size * 0.22, y - size * 0.45);
  ctx.stroke();

  // Eyes behind glasses
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.47, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.47, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a5a6a";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.47, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.47, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Bushy eyebrows
  ctx.fillStyle = "#a0a0a0";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.54,
    size * 0.06,
    size * 0.02,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.54,
    size * 0.06,
    size * 0.02,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Knowing smile
  ctx.strokeStyle = "#8b6655";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35, size * 0.08, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Lecturing hand gesture
  ctx.fillStyle = "#ffe0bd";
  ctx.save();
  ctx.translate(
    x - size * 0.42 + lectureGesture * 2,
    y - size * 0.05 - lectureGesture
  );
  ctx.rotate(-0.5 + lectureGesture * 0.1);
  // Hand
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pointing finger
  ctx.fillRect(-size * 0.02, -size * 0.15, size * 0.04, size * 0.15);
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
  // Imposing dean with formal robes
  const floatBob = Math.sin(time * 2) * 2 * zoom;

  // Academic robe (flowing)
  const robeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.3,
    x,
    y + size * 0.5
  );
  robeGrad.addColorStop(0, "#1a1a1a");
  robeGrad.addColorStop(0.5, "#2a2a2a");
  robeGrad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.5);
  ctx.quadraticCurveTo(x - size * 0.5, y, x - size * 0.25, y - size * 0.3);
  ctx.lineTo(x, y - size * 0.4);
  ctx.lineTo(x + size * 0.25, y - size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.5, y, x + size * 0.4, y + size * 0.5);
  ctx.closePath();
  ctx.fill();

  // Robe details (gold trim)
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.3);
  ctx.lineTo(x - size * 0.15, y + size * 0.4);
  ctx.moveTo(x + size * 0.15, y - size * 0.3);
  ctx.lineTo(x + size * 0.15, y + size * 0.4);
  ctx.stroke();

  // Academic hood (with Princeton colors)
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.25);
  ctx.quadraticCurveTo(x, y - size * 0.1, x + size * 0.2, y - size * 0.25);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.1, x, y + size * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.15,
    y + size * 0.1,
    x - size * 0.2,
    y - size * 0.25
  );
  ctx.fill();

  // Head
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5 + floatBob, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Mortarboard cap
  ctx.fillStyle = "#1a1a1a";
  // Cap base
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.65 + floatBob,
    size * 0.22,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Cap top (square board)
  ctx.save();
  ctx.translate(x, y - size * 0.68 + floatBob);
  ctx.rotate(0.1);
  ctx.fillRect(-size * 0.2, -size * 0.02, size * 0.4, size * 0.04);
  ctx.fillRect(-size * 0.02, -size * 0.2, size * 0.04, size * 0.4);
  ctx.restore();
  // Tassel
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.68 + floatBob);
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y - size * 0.6 + floatBob,
    x + size * 0.2,
    y - size * 0.5 + floatBob
  );
  ctx.stroke();
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.2,
    y - size * 0.48 + floatBob,
    size * 0.04,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Stern eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.52 + floatBob,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.52 + floatBob,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#2a3a4a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.52 + floatBob,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.52 + floatBob,
    size * 0.03,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Furrowed brows
  ctx.strokeStyle = "#5a4a3a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.56 + floatBob);
  ctx.lineTo(x - size * 0.04, y - size * 0.58 + floatBob);
  ctx.moveTo(x + size * 0.14, y - size * 0.56 + floatBob);
  ctx.lineTo(x + size * 0.04, y - size * 0.58 + floatBob);
  ctx.stroke();

  // Stern mouth
  ctx.strokeStyle = "#8b6655";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.4 + floatBob);
  ctx.lineTo(x + size * 0.08, y - size * 0.4 + floatBob);
  ctx.stroke();

  // Aura of authority
  ctx.strokeStyle = `rgba(218, 165, 32, ${0.3 + Math.sin(time * 2) * 0.15})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 0.5, size * 0.65, 0, 0, Math.PI * 2);
  ctx.stroke();
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
  // Fierce rival mascot (could be a lion, bulldog, etc.)
  const bounce = Math.sin(time * 6) * 4 * zoom;
  const wingFlap = Math.sin(time * 12) * 0.4;

  if (isFlying) {
    // Flying mascot with wings
    // Wings
    ctx.fillStyle = "rgba(100, 150, 200, 0.8)";
    ctx.save();
    ctx.translate(x - size * 0.5, y);
    ctx.rotate(wingFlap - 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-size * 0.4, -size * 0.3, -size * 0.6, 0);
    ctx.quadraticCurveTo(-size * 0.4, size * 0.1, 0, 0);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x + size * 0.5, y);
    ctx.rotate(-wingFlap + 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.4, -size * 0.3, size * 0.6, 0);
    ctx.quadraticCurveTo(size * 0.4, size * 0.1, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  // Body (beast-like)
  const bodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.5);
  bodyGrad.addColorStop(0, "#8b0000");
  bodyGrad.addColorStop(0.7, "#5a0000");
  bodyGrad.addColorStop(1, "#3a0000");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + bounce * 0.3, size * 0.4, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fur texture
  ctx.strokeStyle = "#4a0000";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 8; i++) {
    const furAngle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(furAngle) * size * 0.3,
      y + bounce * 0.3 + Math.sin(furAngle) * size * 0.35
    );
    ctx.lineTo(
      x + Math.cos(furAngle) * size * 0.45,
      y + bounce * 0.3 + Math.sin(furAngle) * size * 0.5
    );
    ctx.stroke();
  }

  // Head
  ctx.fillStyle = "#8b0000";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + bounce, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Mane
  ctx.fillStyle = "#5a0000";
  for (let i = 0; i < 12; i++) {
    const maneAngle = (i / 12) * Math.PI * 2;
    const maneLength = size * (0.35 + Math.sin(time * 4 + i) * 0.05);
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.35 + bounce);
    ctx.lineTo(
      x + Math.cos(maneAngle) * maneLength,
      y - size * 0.35 + bounce + Math.sin(maneAngle) * maneLength * 0.8
    );
    ctx.lineTo(
      x + Math.cos(maneAngle + 0.15) * size * 0.25,
      y - size * 0.35 + bounce + Math.sin(maneAngle + 0.15) * size * 0.2
    );
    ctx.closePath();
    ctx.fill();
  }

  // Fierce eyes (glowing)
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 8 * zoom;
  ctx.fillStyle = "#ffff00";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.38 + bounce,
    size * 0.08,
    size * 0.06,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.38 + bounce,
    size * 0.08,
    size * 0.06,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Pupils (menacing slits)
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.38 + bounce,
    size * 0.02,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.38 + bounce,
    size * 0.02,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Snarling mouth with fangs
  ctx.fillStyle = "#3a0000";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.22 + bounce,
    size * 0.12,
    size * 0.08,
    0,
    0,
    Math.PI
  );
  ctx.fill();

  // Fangs
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.22 + bounce);
  ctx.lineTo(x - size * 0.06, y - size * 0.12 + bounce);
  ctx.lineTo(x - size * 0.04, y - size * 0.22 + bounce);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.22 + bounce);
  ctx.lineTo(x + size * 0.06, y - size * 0.12 + bounce);
  ctx.lineTo(x + size * 0.04, y - size * 0.22 + bounce);
  ctx.fill();

  // Claws
  ctx.fillStyle = "#1a1a1a";
  for (let side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.35, y + size * 0.3);
      ctx.lineTo(x + side * (size * 0.4 + i * size * 0.05), y + size * 0.45);
      ctx.lineTo(x + side * size * 0.38, y + size * 0.32);
      ctx.closePath();
      ctx.fill();
    }
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
  // Generic student enemy
  const bob = Math.sin(time * 6) * 2 * zoom;

  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.35, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Head
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + bob, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Simple face
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.37 + bob, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.37 + bob, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#8b6655";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28 + bob, size * 0.05, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
}

// ============================================================================
// HERO RENDERING - Epic detailed hero sprites
// ============================================================================
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
    ctx.strokeStyle = "#ffd700";
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
    case "fscott":
      drawFScottHero(ctx, x, y, size, color, time, zoom, attackPhase);
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
  headGrad.addColorStop(0.6, "#ff8c00");
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
    ctx.fillStyle = "#ff8c00";
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
    ? `rgba(255, 100, 0, ${eyeGlow})`
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
      ctx.strokeStyle = `rgba(255, 140, 0, ${roarAlpha * (1 - w * 0.3)})`;
      ctx.lineWidth = (3 - w) * zoom;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.35, waveRadius, -0.8, 0.8);
      ctx.stroke();
    }
  }

  // === POWER AURA ===
  const auraGlow = 0.3 + Math.sin(time * 4) * 0.15 + attackIntensity * 0.3;
  ctx.strokeStyle = `rgba(255, 100, 0, ${auraGlow})`;
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
    ? `rgba(255, 100, 0, ${0.6 + attackIntensity * 0.4})`
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
  ctx.fillStyle = `rgba(255, 100, 0, ${0.4 + attackIntensity * 0.5})`;
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
    ctx.shadowColor = "#ffd700";
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
    troop.type === "knight";
  const sizeScale = isLargeTroop ? 1.6 : 1;

  // Selection indicator - scaled for large troops
  if (troop.selected) {
    ctx.strokeStyle = "#ffd700";
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
  if (troop.type === "elite")
    baseSize = 34; // Level 3 Elite Guard - much larger
  else if (troop.type === "centaur") baseSize = 42; // Level 4 Centaur - massive
  else if (troop.type === "knight") baseSize = 40; // Level 4 Knight/Cavalry - massive
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
  ctx.fillStyle = "#ffd700";
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
  // Epic Princeton Knight on War Horse with sword attack animation
  const gallop = Math.sin(time * 8) * 3;
  const legCycle = Math.sin(time * 8) * 0.35;
  const headBob = Math.sin(time * 8 + 0.5) * 2;
  const tailSwish = Math.sin(time * 5) * 0.4;

  // Attack animation - sword swing
  const isAttacking = attackPhase > 0;
  const swordSwing = isAttacking ? Math.sin(attackPhase * Math.PI) * 2.5 : 0;
  const breathe = Math.sin(time * 2) * 0.3;

  // === WAR HORSE ===
  // Horse body (muscular, armored)
  const bodyGrad = ctx.createRadialGradient(
    x,
    y + size * 0.1,
    0,
    x,
    y + size * 0.1,
    size * 0.5
  );
  bodyGrad.addColorStop(0, "#6a4a3a");
  bodyGrad.addColorStop(0.6, "#5a3a2a");
  bodyGrad.addColorStop(1, "#4a2a1a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.18 + gallop * 0.15,
    size * 0.42,
    size * 0.26,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Horse armor (barding)
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.18 + gallop * 0.15,
    size * 0.38,
    size * 0.18,
    0,
    Math.PI * 0.8,
    Math.PI * 2.2
  );
  ctx.fill();
  // Armor detail
  ctx.strokeStyle = "#6a6a7a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.15 + gallop * 0.15);
  ctx.lineTo(x + size * 0.3, y + size * 0.15 + gallop * 0.15);
  ctx.stroke();

  // Horse legs (animated galloping)
  ctx.fillStyle = "#4a2a1a";
  // Front left leg
  ctx.save();
  ctx.translate(x - size * 0.22, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(legCycle * 1.2);
  ctx.fillRect(-size * 0.035, 0, size * 0.07, size * 0.28);
  // Knee joint
  ctx.fillStyle = "#3a1a0a";
  ctx.beginPath();
  ctx.arc(0, size * 0.12, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Hoof
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.045, size * 0.24, size * 0.09, size * 0.06);
  ctx.restore();

  // Front right leg
  ctx.save();
  ctx.translate(x - size * 0.08, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(-legCycle * 0.9);
  ctx.fillStyle = "#4a2a1a";
  ctx.fillRect(-size * 0.035, 0, size * 0.07, size * 0.28);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.045, size * 0.24, size * 0.09, size * 0.06);
  ctx.restore();

  // Back left leg
  ctx.save();
  ctx.translate(x + size * 0.12, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(-legCycle * 1.1);
  ctx.fillStyle = "#4a2a1a";
  ctx.fillRect(-size * 0.035, 0, size * 0.07, size * 0.28);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.045, size * 0.24, size * 0.09, size * 0.06);
  ctx.restore();

  // Back right leg
  ctx.save();
  ctx.translate(x + size * 0.26, y + size * 0.38 + gallop * 0.15);
  ctx.rotate(legCycle * 0.8);
  ctx.fillStyle = "#4a2a1a";
  ctx.fillRect(-size * 0.035, 0, size * 0.07, size * 0.28);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.045, size * 0.24, size * 0.09, size * 0.06);
  ctx.restore();

  // Horse neck and head
  ctx.fillStyle = "#5a3a2a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.08 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.48,
    y - size * 0.15 + headBob * 0.5,
    x - size * 0.55,
    y - size * 0.05 + headBob
  );
  ctx.lineTo(x - size * 0.62, y - size * 0.02 + headBob);
  ctx.lineTo(x - size * 0.52, y + size * 0.05 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.38,
    y + size * 0.12 + gallop * 0.15,
    x - size * 0.25,
    y + size * 0.18 + gallop * 0.15
  );
  ctx.fill();

  // Horse head armor (chanfron)
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.52, y - size * 0.12 + headBob);
  ctx.lineTo(x - size * 0.62, y - size * 0.02 + headBob);
  ctx.lineTo(x - size * 0.55, y + size * 0.02 + headBob);
  ctx.lineTo(x - size * 0.48, y - size * 0.08 + headBob);
  ctx.closePath();
  ctx.fill();

  // Horse eye
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.52,
    y - size * 0.02 + headBob,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.515,
    y - size * 0.025 + headBob,
    size * 0.01,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Horse ears
  ctx.fillStyle = "#5a3a2a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.12 + headBob);
  ctx.lineTo(x - size * 0.52, y - size * 0.22 + headBob);
  ctx.lineTo(x - size * 0.46, y - size * 0.14 + headBob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y - size * 0.12 + headBob);
  ctx.lineTo(x - size * 0.44, y - size * 0.2 + headBob);
  ctx.lineTo(x - size * 0.4, y - size * 0.13 + headBob);
  ctx.fill();

  // Horse mane (flowing)
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y - size * 0.12 + headBob);
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const maneX = x - size * 0.42 + t * size * 0.52;
    const maneWave = Math.sin(time * 7 + i * 0.7) * 3;
    const maneY =
      y - size * 0.2 + maneWave + gallop * (0.08 - t * 0.06) + t * size * 0.1;
    ctx.lineTo(maneX, maneY);
  }
  ctx.lineTo(x + size * 0.1, y - size * 0.02 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();

  // Horse tail (swishing)
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.38, y + size * 0.12 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.55 + Math.sin(time * 6) * 8,
    y + size * 0.25,
    x + size * 0.52 + Math.sin(time * 6 + 1) * 10,
    y + size * 0.45
  );
  ctx.stroke();

  // === KNIGHT RIDER ===
  // Armored body
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.15,
    y - size * 0.2,
    x + size * 0.15,
    y - size * 0.2
  );
  armorGrad.addColorStop(0, "#7a7a8a");
  armorGrad.addColorStop(0.5, "#9a9aaa");
  armorGrad.addColorStop(1, "#7a7a8a");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.08 + gallop * 0.15 + breathe);
  ctx.lineTo(x - size * 0.16, y - size * 0.42 + gallop * 0.08 + breathe);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.48 + gallop * 0.08 + breathe,
    x + size * 0.16,
    y - size * 0.42 + gallop * 0.08 + breathe
  );
  ctx.lineTo(x + size * 0.14, y - size * 0.08 + gallop * 0.15 + breathe);
  ctx.closePath();
  ctx.fill();

  // Orange tabard over armor
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.08 + gallop * 0.15);
  ctx.lineTo(x - size * 0.12, y - size * 0.35 + gallop * 0.1);
  ctx.lineTo(x + size * 0.12, y - size * 0.35 + gallop * 0.1);
  ctx.lineTo(x + size * 0.1, y - size * 0.08 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  // Black "P" on tabard
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${7 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y - size * 0.22 + gallop * 0.12);

  // Great helm
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.55 + gallop * 0.08, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  // Visor slit
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(
    x - size * 0.1,
    y - size * 0.57 + gallop * 0.08,
    size * 0.2,
    size * 0.05
  );
  // Helm crest
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.68 + gallop * 0.08);
  ctx.lineTo(x - size * 0.03, y - size * 0.55 + gallop * 0.08);
  ctx.lineTo(x + size * 0.03, y - size * 0.55 + gallop * 0.08);
  ctx.closePath();
  ctx.fill();

  // === LANCE (jousting position with attack animation) ===
  ctx.save();
  const lanceAngle = isAttacking ? -0.35 - swordSwing * 0.5 : -0.35;
  const lanceLunge = isAttacking
    ? size * 0.2 * Math.sin(attackPhase * Math.PI)
    : 0;
  ctx.translate(
    x + size * 0.22 + lanceLunge * 0.5,
    y - size * 0.28 + gallop * 0.12 - lanceLunge * 0.3
  );
  ctx.rotate(lanceAngle);
  // Lance shaft
  const lanceGrad = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, 0);
  lanceGrad.addColorStop(0, "#5a3a1a");
  lanceGrad.addColorStop(0.5, "#7b5030");
  lanceGrad.addColorStop(1, "#5a3a1a");
  ctx.fillStyle = lanceGrad;
  ctx.fillRect(-size * 0.025, -size * 0.7, size * 0.05, size * 0.85);
  // Lance tip (glows during attack)
  const tipGrad = ctx.createLinearGradient(0, -size * 0.8, 0, -size * 0.7);
  tipGrad.addColorStop(0, isAttacking ? "#ffffff" : "#e0e0e0");
  tipGrad.addColorStop(1, isAttacking ? "#d0d0d0" : "#a0a0a0");
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.85);
  ctx.lineTo(-size * 0.04, -size * 0.7);
  ctx.lineTo(size * 0.04, -size * 0.7);
  ctx.closePath();
  ctx.fill();
  // Attack impact effect
  if (isAttacking && attackPhase > 0.3 && attackPhase < 0.7) {
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 15 * zoom;
    ctx.strokeStyle = `rgba(255, 215, 0, ${
      1 - Math.abs(attackPhase - 0.5) * 4
    })`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.85);
    ctx.lineTo(0, -size * 1.1);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  // Lance pennant
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.68);
  const pennantWave =
    Math.sin(time * 8) * 3 + (isAttacking ? swordSwing * 5 : 0);
  ctx.quadraticCurveTo(
    -size * 0.15 + pennantWave,
    -size * 0.62,
    -size * 0.2 + pennantWave * 1.5,
    -size * 0.58
  );
  ctx.lineTo(-size * 0.02, -size * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === SHIELD (kite shield with Princeton crest) ===
  ctx.save();
  ctx.translate(x - size * 0.22, y - size * 0.15 + gallop * 0.12);
  ctx.rotate(-0.15);
  // Shield body
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-size * 0.12, -size * 0.1);
  ctx.lineTo(-size * 0.1, size * 0.15);
  ctx.lineTo(0, size * 0.22);
  ctx.lineTo(size * 0.1, size * 0.15);
  ctx.lineTo(size * 0.12, -size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Orange field
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.15);
  ctx.lineTo(-size * 0.08, -size * 0.06);
  ctx.lineTo(-size * 0.06, size * 0.1);
  ctx.lineTo(0, size * 0.15);
  ctx.lineTo(size * 0.06, size * 0.1);
  ctx.lineTo(size * 0.08, -size * 0.06);
  ctx.closePath();
  ctx.fill();
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
    `rgba(255, 150, 0, ${auraIntensity * auraPulse * 0.3})`
  );
  auraGrad.addColorStop(1, "rgba(255, 100, 0, 0)");
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
  ctx.strokeStyle = "#ffd700";
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
  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "#ffd700";
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
  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "#ffd700";
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
  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "#ffd700";
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
  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "#ffd700";
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
  ctx.strokeStyle = "#ffd700";
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
  ctx.fillStyle = "#ffd700";
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

  // === EPIC BOW AND ARROW ===
  ctx.save();
  ctx.translate(x - size * 0.4, y - size * 0.12 + gallop * 0.06);
  ctx.rotate(-0.25 - (isAttacking ? bowDraw * 0.2 : 0));

  // Ornate bow (golden accents) - flexes more during draw
  const bowBend = isAttacking ? 0.55 + bowDraw * 0.15 : 0.55;
  ctx.strokeStyle = "#6b4423";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, -bowBend * Math.PI, bowBend * Math.PI);
  ctx.stroke();
  // Gold inlay on bow
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, -0.5 * Math.PI, 0.5 * Math.PI);
  ctx.stroke();

  // Bowstring (taut - pulled further during attack)
  const stringPull = size * (0.15 + (isAttacking ? bowDraw * 0.15 : 0));
  ctx.strokeStyle = "#f8f8dc";
  ctx.lineWidth = (isAttacking ? 2 : 1.5) * zoom;
  ctx.beginPath();
  ctx.moveTo(
    Math.cos(-bowBend * Math.PI) * size * 0.28,
    Math.sin(-bowBend * Math.PI) * size * 0.28
  );
  ctx.lineTo(stringPull, 0);
  ctx.lineTo(
    Math.cos(bowBend * Math.PI) * size * 0.28,
    Math.sin(bowBend * Math.PI) * size * 0.28
  );
  ctx.stroke();

  // Arrow (nocked and ready, or flying during release)
  if (!isAttacking || attackPhase < 0.5) {
    const arrowOffset = isAttacking ? bowDraw * size * 0.1 : 0;
    // Arrow shaft
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(
      stringPull - arrowOffset * 0.5,
      -size * 0.015,
      size * 0.4,
      size * 0.03
    );
    // Arrow fletching
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.moveTo(stringPull - arrowOffset * 0.3, 0);
    ctx.lineTo(stringPull - arrowOffset * 0.5 - size * 0.06, -size * 0.035);
    ctx.lineTo(stringPull - arrowOffset * 0.3 + size * 0.06, 0);
    ctx.lineTo(stringPull - arrowOffset * 0.5 - size * 0.06, size * 0.035);
    ctx.closePath();
    ctx.fill();
    // Arrowhead (gleaming, glows during draw)
    const arrowGrad = ctx.createLinearGradient(
      size * 0.5,
      -size * 0.03,
      size * 0.5,
      size * 0.03
    );
    arrowGrad.addColorStop(0, isAttacking ? "#ffffff" : "#e0e0e0");
    arrowGrad.addColorStop(0.5, "#ffffff");
    arrowGrad.addColorStop(1, isAttacking ? "#e0e0e0" : "#a0a0a0");
    ctx.fillStyle = arrowGrad;
    ctx.beginPath();
    ctx.moveTo(size * 0.58, 0);
    ctx.lineTo(size * 0.5, -size * 0.035);
    ctx.lineTo(size * 0.52, 0);
    ctx.lineTo(size * 0.5, size * 0.035);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Flying arrow during release phase
  if (isAttacking && attackPhase > 0.4) {
    const flyPhase = (attackPhase - 0.4) / 0.6;
    const arrowX = x - size * 0.3 + flyPhase * size * 2.5;
    const arrowY = y - size * 0.15 + gallop * 0.06 - flyPhase * size * 0.3;

    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(-0.35);

    // Trailing glow
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 10 * zoom * (1 - flyPhase);

    // Arrow shaft
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(-size * 0.2, -size * 0.012, size * 0.35, size * 0.024);
    // Fletching
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.moveTo(-size * 0.18, 0);
    ctx.lineTo(-size * 0.22, -size * 0.03);
    ctx.lineTo(-size * 0.12, 0);
    ctx.lineTo(-size * 0.22, size * 0.03);
    ctx.closePath();
    ctx.fill();
    // Arrowhead
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(size * 0.18, 0);
    ctx.lineTo(size * 0.1, -size * 0.03);
    ctx.lineTo(size * 0.12, 0);
    ctx.lineTo(size * 0.1, size * 0.03);
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
  ctx.strokeStyle = "#ffd700";
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
  ctx.fillStyle = "#ffd700";
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
  ctx.fillStyle = "#ffd700";
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
  ctx.fillStyle = "#ffd700";
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
  ctx.strokeStyle = "#ffd700";
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
  ctx.strokeStyle = "#ffd700";
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
  ctx.fillStyle = `rgba(255, 100, 0, ${sigilGlow})`;
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
  ctx.fillStyle = `rgba(255, 100, 0, ${runeGlow})`;
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
      ? `rgba(255, 100, 0, ${alpha})`
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
      flameGrad.addColorStop(0.4, "rgba(255, 150, 0, 0.7)");
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
      ? "#ffd700"
      : "#ffd700";
  ctx.shadowBlur = 12 * zoom;

  const projGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, projSize * zoom);
  if (proj.type === "cannon") {
    projGradient.addColorStop(0, "#ffff00");
    projGradient.addColorStop(0.5, "#ff6600");
    projGradient.addColorStop(1, "#cc3300");
  } else {
    projGradient.addColorStop(0, "#ffffff");
    projGradient.addColorStop(0.5, "#ffd700");
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
      expGradient.addColorStop(0.4, `rgba(255, 100, 0, ${alpha * 0.8})`);
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
