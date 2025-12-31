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
  const spinAngle = time * 25; // Faster spin

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

  // Gun shield (armored plate) with tech details
  const shieldGrad = ctx.createLinearGradient(
    screenPos.x - 16 * zoom,
    topY - 6 * zoom,
    screenPos.x + 16 * zoom,
    topY - 24 * zoom
  );
  shieldGrad.addColorStop(0, "#4a4a52");
  shieldGrad.addColorStop(0.3, "#5a5a62");
  shieldGrad.addColorStop(0.7, "#4a4a52");
  shieldGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 16 * zoom, topY - 6 * zoom);
  ctx.lineTo(screenPos.x - 12 * zoom, topY - 22 * zoom);
  ctx.lineTo(screenPos.x + 12 * zoom, topY - 22 * zoom);
  ctx.lineTo(screenPos.x + 16 * zoom, topY - 6 * zoom);
  ctx.closePath();
  ctx.fill();

  // Shield edge highlight
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 12 * zoom, topY - 22 * zoom);
  ctx.lineTo(screenPos.x + 12 * zoom, topY - 22 * zoom);
  ctx.stroke();

  // Shield tech lines
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 8 * zoom, topY - 10 * zoom);
  ctx.lineTo(screenPos.x - 6 * zoom, topY - 18 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(screenPos.x + 8 * zoom, topY - 10 * zoom);
  ctx.lineTo(screenPos.x + 6 * zoom, topY - 18 * zoom);
  ctx.stroke();

  // Shield rivets
  ctx.fillStyle = "#7a7a82";
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.arc(
      screenPos.x + i * 10 * zoom,
      topY - 14 * zoom,
      2 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Central turret mechanism
  const turretGrad = ctx.createRadialGradient(
    screenPos.x - 2 * zoom,
    topY - 16 * zoom,
    0,
    screenPos.x,
    topY - 14 * zoom,
    14 * zoom
  );
  turretGrad.addColorStop(0, "#6a6a72");
  turretGrad.addColorStop(0.5, "#5a5a62");
  turretGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = turretGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - 14 * zoom,
    12 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Ammo feed mechanism
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 6 * zoom, topY - 8 * zoom);
  ctx.lineTo(screenPos.x - 10 * zoom, topY - 4 * zoom);
  ctx.lineTo(screenPos.x - 8 * zoom, topY - 4 * zoom);
  ctx.lineTo(screenPos.x - 4 * zoom, topY - 8 * zoom);
  ctx.closePath();
  ctx.fill();

  // Power core with pulsing glow
  const coreGlow = 0.7 + Math.sin(time * 8) * 0.3;
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(screenPos.x, topY - 14 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const coreGrad = ctx.createRadialGradient(
    screenPos.x,
    topY - 14 * zoom,
    0,
    screenPos.x,
    topY - 14 * zoom,
    5 * zoom
  );
  coreGrad.addColorStop(0, `rgba(255, 220, 100, ${coreGlow})`);
  coreGrad.addColorStop(0.4, `rgba(255, 180, 50, ${coreGlow * 0.7})`);
  coreGrad.addColorStop(1, `rgba(255, 100, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, topY - 14 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

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
}

// Helper for gatling barrel cluster
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

  const baseLength = 38 * zoom;
  const barrelLength = baseLength * (0.5 + foreshorten * 0.5);

  // Calculate barrel end point
  const endX = pivotX + cosR * barrelLength;
  const endY = pivotY + sinR * barrelLength * 0.5;

  // Barrel housing (cylindrical, isometric)
  const housingGrad = ctx.createLinearGradient(
    pivotX,
    pivotY - 10 * zoom,
    pivotX,
    pivotY + 10 * zoom
  );
  housingGrad.addColorStop(0, "#5a5a62");
  housingGrad.addColorStop(0.3, "#6a6a72");
  housingGrad.addColorStop(0.7, "#5a5a62");
  housingGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = housingGrad;
  ctx.beginPath();
  ctx.ellipse(
    pivotX + cosR * 8 * zoom,
    pivotY + sinR * 4 * zoom,
    10 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Multiple spinning barrels (6 barrels in circular arrangement)
  for (let i = 0; i < 6; i++) {
    const barrelAngle = spinAngle + (i / 6) * Math.PI * 2;
    const barrelDepth = Math.cos(barrelAngle);
    const barrelOffset = Math.sin(barrelAngle) * 5 * zoom;

    // Only draw barrels that should be visible
    if (barrelDepth > -0.5) {
      const shade = 0.35 + barrelDepth * 0.35;
      const barrelColor = Math.floor(60 + shade * 50);

      // Perpendicular offset in isometric space
      const perpX = -sinR * barrelOffset;
      const perpY = cosR * barrelOffset * 0.5;

      // Barrel body
      ctx.fillStyle = `rgb(${barrelColor}, ${barrelColor}, ${barrelColor + 8})`;
      ctx.beginPath();
      const bStartX = pivotX + cosR * 8 * zoom + perpX;
      const bStartY = pivotY + sinR * 4 * zoom + perpY;
      const bEndX = endX + perpX * 0.8;
      const bEndY = endY + perpY * 0.8;

      // Tapered barrel
      const bw = 2.5 * zoom;
      const perpBX = -sinR * bw;
      const perpBY = cosR * bw * 0.5;

      ctx.moveTo(bStartX + perpBX, bStartY + perpBY);
      ctx.lineTo(bEndX + perpBX * 0.7, bEndY + perpBY * 0.7);
      ctx.lineTo(bEndX - perpBX * 0.7, bEndY - perpBY * 0.7);
      ctx.lineTo(bStartX - perpBX, bStartY - perpBY);
      ctx.closePath();
      ctx.fill();

      // Barrel bore
      if (barrelDepth > 0.3) {
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(
          bEndX,
          bEndY,
          1.5 * zoom * foreshorten + 0.5 * zoom,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  // Front barrel plate
  const plateX = endX - cosR * 4 * zoom;
  const plateY = endY - sinR * 2 * zoom;
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(
    plateX,
    plateY,
    8 * zoom * foreshorten + 3 * zoom,
    6 * zoom,
    rotation,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Muzzle flash when firing
  if (Date.now() - tower.lastAttack < 60) {
    const flash = 1 - (Date.now() - tower.lastAttack) / 60;
    const flashX = endX + cosR * 6 * zoom;
    const flashY = endY + sinR * 3 * zoom;

    ctx.shadowColor = "#ffdd00";
    ctx.shadowBlur = 15 * zoom;

    const flashGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      12 * zoom * flash
    );
    flashGrad.addColorStop(0, `rgba(255, 255, 200, ${flash})`);
    flashGrad.addColorStop(0.3, `rgba(255, 220, 100, ${flash * 0.8})`);
    flashGrad.addColorStop(1, `rgba(255, 150, 0, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, 12 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
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
  const coilHeight = 50 * zoom;

  // Enhanced base structure
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 5 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Support structure
  ctx.fillStyle = "#2d5a7b";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 10 * zoom, topY);
  ctx.lineTo(screenPos.x - 6 * zoom, topY - coilHeight + 15 * zoom);
  ctx.lineTo(screenPos.x + 6 * zoom, topY - coilHeight + 15 * zoom);
  ctx.lineTo(screenPos.x + 10 * zoom, topY);
  ctx.closePath();
  ctx.fill();

  // Large focusing dish
  ctx.fillStyle = "#3d7a9e";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - coilHeight + 10 * zoom,
    22 * zoom,
    16 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#2d5a7b";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner dish glow
  ctx.fillStyle = "#00ffff";
  ctx.globalAlpha = 0.3 + Math.sin(time * 4) * 0.2;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY - coilHeight + 10 * zoom,
    16 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.globalAlpha = 1;

  // Central emitter
  const emitterY = topY - coilHeight + 5 * zoom;
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 15 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, emitterY, 8 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Store emitter position
  tower._orbScreenY = emitterY;

  // Crackling energy around dish
  for (let i = 0; i < 8; i++) {
    const angle = time * 3 + i * (Math.PI / 4);
    const dist = 18 + Math.sin(time * 6 + i) * 4;
    const ex = screenPos.x + Math.cos(angle) * dist * zoom;
    const ey =
      topY - coilHeight + 10 * zoom + Math.sin(angle) * dist * 0.5 * zoom;

    ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + Math.random() * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, emitterY);
    ctx.lineTo(ex, ey);
    ctx.stroke();
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

  // Tan foundation platform with green tech accents (shifts during attack)
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.5,
    screenPos.y + 8 * zoom,
    baseWidth + 12,
    baseDepth + 12,
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
    const lineY = screenPos.y + 6 * zoom - i * 4 * zoom;
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
    screenPos.y - pillarBounce,
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
    screenPos.y - pillarBounce,
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
        screenPos.y - pillarHeight * zoom * (0.2 + i * 0.25) - pillarBounce;
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
    archTopY - 20 * zoom - archLift,
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

// STATION TOWER - Grandiose Gothic Dinky train station
function renderStationTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string }
) {
  ctx.save();
  const isCentaur = tower.level === 4 && tower.upgrade === "A";
  const isKnight = tower.level === 4 && tower.upgrade === "B";

  // More compact scale - reduced from original
  const levelScale = 1 + tower.level * 0.05;
  const baseWidth = 48 + tower.level * 8; // Reduced from 60 + 12
  const baseDepth = 36 + tower.level * 6; // Reduced from 45 + 10

  // ========== GRAND PLATFORM FOUNDATION WITH FANTASY DETAILS ==========
  const foundationColors =
    tower.level === 1
      ? { t: "#5a5046", l: "#4a4036", r: "#3a3026" }
      : tower.level === 2
      ? { t: "#8b6b5b", l: "#7b5b4b", r: "#6b4b3b" }
      : { t: "#9b8b7b", l: "#8b7b6b", r: "#7b6b5b" };

  // Bottom foundation tier with decorative edge
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 10 * zoom,
    baseWidth + 20,
    baseDepth + 16,
    4,
    {
      top: foundationColors.t,
      left: foundationColors.l,
      right: foundationColors.r,
    },
    zoom
  );

  // Middle platform tier
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 6 * zoom,
    baseWidth + 10,
    baseDepth + 8,
    4,
    {
      top: tower.level >= 2 ? "#7b6b5b" : "#6b6055",
      left: tower.level >= 2 ? "#6b5b4b" : "#5b5045",
      right: tower.level >= 2 ? "#5b4b3b" : "#4b4035",
    },
    zoom
  );

  // Top platform (track bed)
  const trackBedColor =
    tower.level === 3 ? "#8b7b6b" : tower.level === 2 ? "#6b5b4b" : "#5b5045";
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 2 * zoom,
    baseWidth,
    baseDepth,
    3,
    { top: trackBedColor, left: "#4a4036", right: "#3a3026" },
    zoom
  );

  // Fantasy stone carvings on foundation
  const w = baseWidth * zoom * 0.5;
  const d = baseDepth * zoom * 0.25;
  ctx.strokeStyle = tower.level >= 2 ? "#9a8a7a" : "#7a7066";
  ctx.lineWidth = 1 * zoom;

  // Decorative lines on left face
  for (let i = 0; i < tower.level + 1; i++) {
    const ly = screenPos.y + 8 * zoom - i * 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.9, ly + d * 0.3);
    ctx.lineTo(screenPos.x - w * 0.2, ly - d * 0.2);
    ctx.stroke();
  }

  // Decorative lines on right face
  for (let i = 0; i < tower.level + 1; i++) {
    const ly = screenPos.y + 8 * zoom - i * 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.2, ly - d * 0.2);
    ctx.lineTo(screenPos.x + w * 0.9, ly + d * 0.3);
    ctx.stroke();
  }

  // Level 2+: Decorative corner pillars
  if (tower.level >= 2) {
    ctx.fillStyle = "#8b7b6b";
    // Front corners
    ctx.beginPath();
    ctx.arc(
      screenPos.x - w * 0.85,
      screenPos.y + d * 0.3,
      3 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      screenPos.x + w * 0.85,
      screenPos.y + d * 0.3,
      3 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Level 3: Gold trim and gems
  if (tower.level >= 3) {
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w, screenPos.y + 2 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + 2 * zoom - d);
    ctx.lineTo(screenPos.x + w, screenPos.y + 2 * zoom);
    ctx.stroke();

    // Gem accents
    const gemGlow = 0.6 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = `rgba(255, 50, 50, ${gemGlow})`;
    ctx.beginPath();
    ctx.arc(
      screenPos.x,
      screenPos.y - d + 2 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // ========== ISOMETRIC TRAIN TRACKS (compact) ==========
  const trackLen = baseWidth * 0.8 * zoom;
  const trackCenterX = screenPos.x;
  const trackCenterY = screenPos.y - 1 * zoom;
  const trackWidth = 8 * zoom * levelScale;

  // Gravel ballast bed
  ctx.fillStyle = "#3a3530";
  ctx.beginPath();
  ctx.moveTo(trackCenterX - trackLen * 0.5, trackCenterY);
  ctx.lineTo(trackCenterX, trackCenterY - trackWidth);
  ctx.lineTo(trackCenterX + trackLen * 0.5, trackCenterY);
  ctx.lineTo(trackCenterX, trackCenterY + trackWidth);
  ctx.closePath();
  ctx.fill();

  // Gravel top
  ctx.fillStyle = "#4a4540";
  ctx.beginPath();
  ctx.moveTo(trackCenterX - trackLen * 0.48, trackCenterY - 1.5 * zoom);
  ctx.lineTo(trackCenterX, trackCenterY - trackWidth * 0.8 - 1.5 * zoom);
  ctx.lineTo(trackCenterX + trackLen * 0.48, trackCenterY - 1.5 * zoom);
  ctx.lineTo(trackCenterX, trackCenterY + trackWidth * 0.8 - 1.5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Wooden sleepers (compact)
  const numTies = 5 + tower.level;
  for (let i = 0; i < numTies; i++) {
    const t = ((i - (numTies - 1) / 2) / ((numTies - 1) / 2)) * 0.42;
    const tieX = trackCenterX + trackLen * t;
    const tieY = trackCenterY - 2.5 * zoom;
    const tieHalfLen = 5 * zoom * levelScale;
    const tieHalfWid = 1.2 * zoom;

    ctx.fillStyle = tower.level >= 2 ? "#7b6050" : "#6b5040";
    ctx.beginPath();
    ctx.moveTo(tieX - tieHalfWid, tieY - tieHalfLen);
    ctx.lineTo(tieX + tieHalfWid, tieY - tieHalfLen);
    ctx.lineTo(tieX + tieHalfWid, tieY + tieHalfLen);
    ctx.lineTo(tieX - tieHalfWid, tieY + tieHalfLen);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = tower.level >= 2 ? "#6a5040" : "#5a4030";
    ctx.beginPath();
    ctx.moveTo(tieX - tieHalfWid, tieY + tieHalfLen);
    ctx.lineTo(tieX + tieHalfWid, tieY + tieHalfLen);
    ctx.lineTo(tieX + tieHalfWid, tieY + tieHalfLen + 1.5 * zoom);
    ctx.lineTo(tieX - tieHalfWid, tieY + tieHalfLen + 1.5 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Rails
  const railGap = 3 * zoom * levelScale;
  const railColor =
    tower.level === 3 ? "#aaa" : tower.level === 2 ? "#999" : "#888";
  for (const side of [-1, 1]) {
    const railY = trackCenterY + railGap * side - 3 * zoom;

    ctx.fillStyle = railColor;
    ctx.beginPath();
    ctx.moveTo(trackCenterX - trackLen * 0.46, railY);
    ctx.lineTo(trackCenterX + trackLen * 0.46, railY);
    ctx.lineTo(trackCenterX + trackLen * 0.46, railY + 1.2 * zoom);
    ctx.lineTo(trackCenterX - trackLen * 0.46, railY + 1.2 * zoom);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.moveTo(trackCenterX - trackLen * 0.46, railY + 1.2 * zoom);
    ctx.lineTo(trackCenterX + trackLen * 0.46, railY + 1.2 * zoom);
    ctx.lineTo(trackCenterX + trackLen * 0.46, railY + 2.5 * zoom);
    ctx.lineTo(trackCenterX - trackLen * 0.46, railY + 2.5 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // ========== COMPACT STATION BUILDING ==========
  const stationX = screenPos.x - 26 * zoom; // Reduced offset
  const stationY = screenPos.y - 6 * zoom;

  if (tower.level === 1) {
    // ========== LEVEL 1: COZY VICTORIAN STATION (compact) ==========
    const buildingH = 28; // Reduced from 35

    drawIsometricPrism(
      ctx,
      stationX,
      stationY,
      26,
      20,
      buildingH,
      {
        top: "#a87858",
        left: "#986848",
        right: "#884838",
        leftBack: "#b88868",
        rightBack: "#a87858",
      },
      zoom
    );

    // Fantasy stone details on walls
    ctx.strokeStyle = "#7a5838";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 2; i++) {
      const ly = stationY - buildingH * zoom * (0.3 + i * 0.3);
      ctx.beginPath();
      ctx.moveTo(stationX - 13 * zoom * 0.9, ly + 5 * zoom * 0.3);
      ctx.lineTo(stationX - 13 * zoom * 0.2, ly - 5 * zoom * 0.2);
      ctx.stroke();
    }

    const roofY = stationY - buildingH * zoom;

    // Steep Victorian roof
    ctx.fillStyle = "#4a3525";
    ctx.beginPath();
    ctx.moveTo(stationX, roofY - 22 * zoom);
    ctx.lineTo(stationX - 16 * zoom, roofY);
    ctx.lineTo(stationX, roofY + 10 * zoom);
    ctx.lineTo(stationX + 16 * zoom, roofY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#5a4535";
    ctx.beginPath();
    ctx.moveTo(stationX, roofY - 22 * zoom);
    ctx.lineTo(stationX + 16 * zoom, roofY);
    ctx.lineTo(stationX + 16 * zoom, roofY + 4 * zoom);
    ctx.lineTo(stationX, roofY + 10 * zoom + 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Chimney
    drawIsometricPrism(
      ctx,
      stationX + 8 * zoom,
      roofY - 4 * zoom,
      5,
      4,
      14,
      { top: "#654535", left: "#554030", right: "#453525" },
      zoom
    );

    // Window with glow
    const winY = stationY - buildingH * zoom * 0.5;
    ctx.fillStyle = "#2a1a0a";
    ctx.fillRect(stationX - 5 * zoom, winY - 6 * zoom, 10 * zoom, 9 * zoom);
    ctx.fillStyle = `rgba(255, 200, 100, ${0.5 + Math.sin(time * 2) * 0.2})`;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 8 * zoom;
    ctx.fillRect(stationX - 4 * zoom, winY - 5 * zoom, 8 * zoom, 7 * zoom);
    ctx.shadowBlur = 0;

    // Arched entrance
    ctx.fillStyle = "#3a2515";
    ctx.beginPath();
    ctx.moveTo(stationX - 6 * zoom, stationY);
    ctx.lineTo(stationX - 6 * zoom, stationY - 14 * zoom);
    ctx.quadraticCurveTo(
      stationX,
      stationY - 20 * zoom,
      stationX + 6 * zoom,
      stationY - 14 * zoom
    );
    ctx.lineTo(stationX + 6 * zoom, stationY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(255, 180, 100, ${0.4 + Math.sin(time * 1.5) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(stationX - 5 * zoom, stationY);
    ctx.lineTo(stationX - 5 * zoom, stationY - 12 * zoom);
    ctx.quadraticCurveTo(
      stationX,
      stationY - 17 * zoom,
      stationX + 5 * zoom,
      stationY - 12 * zoom
    );
    ctx.lineTo(stationX + 5 * zoom, stationY);
    ctx.closePath();
    ctx.fill();

    // Sign
    ctx.fillStyle = "#6b2020";
    ctx.fillRect(stationX - 10 * zoom, roofY + 1 * zoom, 20 * zoom, 8 * zoom);
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1 * zoom;
    ctx.strokeRect(stationX - 10 * zoom, roofY + 1 * zoom, 20 * zoom, 8 * zoom);
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${5.5 * zoom}px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText("DINKY", stationX, roofY + 7.5 * zoom);
  } else if (tower.level === 2) {
    // ========== LEVEL 2: GRAND CLOCK TOWER (compact) ==========
    const buildingH = 34; // Reduced from 42

    drawIsometricPrism(
      ctx,
      stationX,
      stationY,
      30,
      26,
      buildingH,
      {
        top: "#b86848",
        left: "#a85838",
        right: "#984828",
        leftBack: "#c87858",
        rightBack: "#b86848",
      },
      zoom
    );

    // Fantasy brick pattern details
    ctx.strokeStyle = "#8a4828";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 3; i++) {
      const ly = stationY - buildingH * zoom * (0.2 + i * 0.25);
      ctx.beginPath();
      ctx.moveTo(stationX - 15 * zoom * 0.9, ly + 6.5 * zoom * 0.3);
      ctx.lineTo(stationX - 15 * zoom * 0.2, ly - 6.5 * zoom * 0.2);
      ctx.stroke();
    }

    const roofY = stationY - buildingH * zoom;

    // Mansard roof
    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.moveTo(stationX, roofY - 12 * zoom);
    ctx.lineTo(stationX - 20 * zoom, roofY);
    ctx.lineTo(stationX, roofY + 12 * zoom);
    ctx.lineTo(stationX + 20 * zoom, roofY);
    ctx.closePath();
    ctx.fill();

    // Clock tower
    drawIsometricPrism(
      ctx,
      stationX,
      roofY - 4 * zoom,
      14,
      12,
      28,
      { top: "#c87858", left: "#b86848", right: "#a85838" },
      zoom
    );

    const towerTopY = roofY - 4 * zoom - 28 * zoom;

    // Tower spire
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.moveTo(stationX, towerTopY - 18 * zoom);
    ctx.lineTo(stationX - 10 * zoom, towerTopY);
    ctx.lineTo(stationX, towerTopY + 6 * zoom);
    ctx.lineTo(stationX + 10 * zoom, towerTopY);
    ctx.closePath();
    ctx.fill();

    // Gold finial
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.moveTo(stationX - 1.5 * zoom, towerTopY - 18 * zoom);
    ctx.lineTo(stationX, towerTopY - 26 * zoom);
    ctx.lineTo(stationX + 1.5 * zoom, towerTopY - 18 * zoom);
    ctx.closePath();
    ctx.fill();

    // Clock face
    ctx.fillStyle = "#fffff5";
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(stationX, towerTopY + 10 * zoom, 8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // Clock markers
    ctx.fillStyle = "#333";
    for (let h = 0; h < 12; h++) {
      const angle = (h / 12) * Math.PI * 2 - Math.PI / 2;
      const markerX = stationX + Math.cos(angle) * 6.5 * zoom;
      const markerY = towerTopY + 10 * zoom + Math.sin(angle) * 6.5 * zoom;
      ctx.beginPath();
      ctx.arc(markerX, markerY, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clock hands
    const hourAngle = (time * 0.05) % (Math.PI * 2);
    const minuteAngle = (time * 0.3) % (Math.PI * 2);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineCap = "round";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(stationX, towerTopY + 10 * zoom);
    ctx.lineTo(
      stationX + Math.sin(hourAngle) * 4 * zoom,
      towerTopY + 10 * zoom - Math.cos(hourAngle) * 4 * zoom
    );
    ctx.stroke();
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(stationX, towerTopY + 10 * zoom);
    ctx.lineTo(
      stationX + Math.sin(minuteAngle) * 6 * zoom,
      towerTopY + 10 * zoom - Math.cos(minuteAngle) * 6 * zoom
    );
    ctx.stroke();

    // Windows
    ctx.fillStyle = "#2a1a0a";
    for (let i = 0; i < 2; i++) {
      ctx.fillRect(
        stationX - 10 * zoom + i * 12 * zoom,
        stationY - buildingH * 0.5 * zoom - 5 * zoom,
        6 * zoom,
        8 * zoom
      );
      ctx.fillStyle = `rgba(255, 200, 100, ${
        0.45 + Math.sin(time * 2 + i) * 0.15
      })`;
      ctx.fillRect(
        stationX - 9 * zoom + i * 12 * zoom,
        stationY - buildingH * 0.5 * zoom - 4 * zoom,
        4 * zoom,
        6 * zoom
      );
      ctx.fillStyle = "#2a1a0a";
    }
  } else {
    // ========== LEVEL 3: MAJESTIC GOTHIC STATION (compact) ==========
    const buildingH = 40; // Reduced from original

    // Main gothic structure
    drawIsometricPrism(
      ctx,
      stationX,
      stationY,
      34,
      28,
      buildingH,
      {
        top: "#c89878",
        left: "#b88868",
        right: "#a87858",
        leftBack: "#d8a888",
        rightBack: "#c89878",
      },
      zoom
    );

    // Gothic window arches carved in stone
    ctx.strokeStyle = "#987858";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 3; i++) {
      const ly = stationY - buildingH * zoom * (0.15 + i * 0.25);
      ctx.beginPath();
      ctx.moveTo(stationX - 17 * zoom * 0.9, ly + 7 * zoom * 0.3);
      ctx.lineTo(stationX - 17 * zoom * 0.2, ly - 7 * zoom * 0.2);
      ctx.stroke();
    }

    const roofY = stationY - buildingH * zoom;

    // Grand gothic roof with multiple peaks
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.moveTo(stationX, roofY - 30 * zoom);
    ctx.lineTo(stationX - 22 * zoom, roofY);
    ctx.lineTo(stationX, roofY + 14 * zoom);
    ctx.lineTo(stationX + 22 * zoom, roofY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.moveTo(stationX, roofY - 30 * zoom);
    ctx.lineTo(stationX + 22 * zoom, roofY);
    ctx.lineTo(stationX + 22 * zoom, roofY + 5 * zoom);
    ctx.lineTo(stationX, roofY + 14 * zoom + 5 * zoom);
    ctx.closePath();
    ctx.fill();

    // Gold cross finial
    ctx.fillStyle = "#daa520";
    ctx.fillRect(stationX - 1.5 * zoom, roofY - 38 * zoom, 3 * zoom, 10 * zoom);
    ctx.fillRect(stationX - 5 * zoom, roofY - 35 * zoom, 10 * zoom, 2.5 * zoom);

    // Decorative gothic arches
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(stationX - 12 * zoom, roofY - 5 * zoom);
    ctx.quadraticCurveTo(
      stationX,
      roofY - 18 * zoom,
      stationX + 12 * zoom,
      roofY - 5 * zoom
    );
    ctx.stroke();

    // Rose window
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.arc(stationX, roofY - 10 * zoom, 8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    const roseGlow = 0.5 + Math.sin(time * 2) * 0.3;
    const roseGrad = ctx.createRadialGradient(
      stationX,
      roofY - 10 * zoom,
      0,
      stationX,
      roofY - 10 * zoom,
      7 * zoom
    );
    roseGrad.addColorStop(0, `rgba(255, 100, 100, ${roseGlow})`);
    roseGrad.addColorStop(0.5, `rgba(200, 50, 150, ${roseGlow * 0.7})`);
    roseGrad.addColorStop(1, `rgba(100, 50, 200, ${roseGlow * 0.5})`);
    ctx.fillStyle = roseGrad;
    ctx.beginPath();
    ctx.arc(stationX, roofY - 10 * zoom, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Rose window spokes
    ctx.strokeStyle = "#1a0a00";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(stationX, roofY - 10 * zoom);
      ctx.lineTo(
        stationX + Math.cos(angle) * 6 * zoom,
        roofY - 10 * zoom + Math.sin(angle) * 6 * zoom
      );
      ctx.stroke();
    }

    // Grand arched entrance with columns
    ctx.fillStyle = "#987858";
    ctx.fillRect(
      stationX - 12 * zoom,
      stationY - 20 * zoom,
      4 * zoom,
      20 * zoom
    );
    ctx.fillRect(
      stationX + 8 * zoom,
      stationY - 20 * zoom,
      4 * zoom,
      20 * zoom
    );

    ctx.fillStyle = "#3a2515";
    ctx.beginPath();
    ctx.moveTo(stationX - 8 * zoom, stationY);
    ctx.lineTo(stationX - 8 * zoom, stationY - 16 * zoom);
    ctx.quadraticCurveTo(
      stationX,
      stationY - 24 * zoom,
      stationX + 8 * zoom,
      stationY - 16 * zoom
    );
    ctx.lineTo(stationX + 8 * zoom, stationY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(255, 180, 100, ${0.4 + Math.sin(time * 1.5) * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(stationX - 6 * zoom, stationY);
    ctx.lineTo(stationX - 6 * zoom, stationY - 14 * zoom);
    ctx.quadraticCurveTo(
      stationX,
      stationY - 21 * zoom,
      stationX + 6 * zoom,
      stationY - 14 * zoom
    );
    ctx.lineTo(stationX + 6 * zoom, stationY);
    ctx.closePath();
    ctx.fill();

    // "PRINCETON JUNCTION" sign with gold lettering
    ctx.fillStyle = "#4a1010";
    ctx.fillRect(stationX - 14 * zoom, roofY + 18 * zoom, 28 * zoom, 10 * zoom);
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * zoom;
    ctx.strokeRect(
      stationX - 14 * zoom,
      roofY + 18 * zoom,
      28 * zoom,
      10 * zoom
    );
    ctx.fillStyle = "#daa520";
    ctx.font = `bold ${5 * zoom}px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText("PRINCETON", stationX, roofY + 25 * zoom);
  }
  // ========== ISOMETRIC TRAIN (properly enclosed box) ==========
  // Train animates along horizontal tracks (left-right), arrives when spawning

  const trainAnimProgress = tower.trainAnimProgress || 0;
  const trainVisible = trainAnimProgress > 0 && trainAnimProgress < 1;

  if (trainVisible) {
    // Train position along horizontal track (left-right)
    let trainT = 0;
    let trainAlpha = 1;

    if (trainAnimProgress < 0.25) {
      // Arriving from right
      trainT = 0.45 - (trainAnimProgress / 0.25) * 0.45;
      trainAlpha = Math.min(1, trainAnimProgress / 0.15);
    } else if (trainAnimProgress < 0.75) {
      // Stopped at platform
      trainT = 0;
      trainAlpha = 1;
    } else {
      // Departing to left
      trainT = -((trainAnimProgress - 0.75) / 0.25) * 0.45;
      trainAlpha = Math.max(0, 1 - (trainAnimProgress - 0.75) / 0.2);
    }

    // Train center position on track (horizontal movement)
    const trainX = trackCenterX + trackLen * trainT;
    const trainY = trackCenterY - 8 * zoom;
    const wheelSpin = time * 10 + trainAnimProgress * 30;

    ctx.save();
    ctx.globalAlpha = trainAlpha;

    // Train dimensions - proper isometric box
    const tWidth = (22 + tower.level * 4) * zoom; // Left-right width
    const tDepth = (10 + tower.level * 2) * zoom; // Front-back depth
    const tHeight = (12 + tower.level * 3) * zoom; // Vertical height

    // Isometric offsets (matching drawIsometricPrism)
    const w = tWidth * 0.5;
    const d = tDepth * 0.25;

    // Train body colors based on level
    const bodyTop =
      tower.level === 1 ? "#a86040" : tower.level === 2 ? "#785030" : "#584030";
    const bodyLeft =
      tower.level === 1 ? "#986030" : tower.level === 2 ? "#684020" : "#483020";
    const bodyRight =
      tower.level === 1 ? "#784020" : tower.level === 2 ? "#583010" : "#382010";
    const bodyFront =
      tower.level === 1 ? "#885025" : tower.level === 2 ? "#603015" : "#402010";

    // Train shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(
      trainX + 3 * zoom,
      trainY + 12 * zoom,
      w * 0.9,
      d * 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Undercarriage/wheels base
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.moveTo(trainX - w, trainY + 2 * zoom);
    ctx.lineTo(trainX, trainY - d + 2 * zoom);
    ctx.lineTo(trainX + w, trainY + 2 * zoom);
    ctx.lineTo(trainX, trainY + d + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Wheels with spinning spokes
    for (const wx of [-0.6, 0.6]) {
      const wheelX = trainX + w * wx;
      const wheelY = trainY + 3 * zoom;

      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.ellipse(wheelX, wheelY, 4 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Animated spokes
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1 * zoom;
      for (let s = 0; s < 4; s++) {
        const spokeAngle = wheelSpin + (s * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(wheelX, wheelY);
        ctx.lineTo(
          wheelX + Math.cos(spokeAngle) * 3 * zoom,
          wheelY + Math.sin(spokeAngle) * 1.8 * zoom
        );
        ctx.stroke();
      }
    }

    // === MAIN BODY - Proper isometric box with all visible faces ===

    // Back-left face (partially visible)
    ctx.fillStyle = bodyLeft;
    ctx.beginPath();
    ctx.moveTo(trainX, trainY - d); // back center
    ctx.lineTo(trainX - w, trainY); // left corner
    ctx.lineTo(trainX - w, trainY - tHeight); // left corner top
    ctx.lineTo(trainX, trainY - d - tHeight); // back center top
    ctx.closePath();
    ctx.fill();

    // Back-right face (partially visible)
    ctx.fillStyle = bodyRight;
    ctx.beginPath();
    ctx.moveTo(trainX, trainY - d); // back center
    ctx.lineTo(trainX + w, trainY); // right corner
    ctx.lineTo(trainX + w, trainY - tHeight); // right corner top
    ctx.lineTo(trainX, trainY - d - tHeight); // back center top
    ctx.closePath();
    ctx.fill();

    // Front-left face (main visible left side)
    ctx.fillStyle = bodyLeft;
    ctx.beginPath();
    ctx.moveTo(trainX - w, trainY); // left corner bottom
    ctx.lineTo(trainX, trainY + d); // front center bottom
    ctx.lineTo(trainX, trainY + d - tHeight); // front center top
    ctx.lineTo(trainX - w, trainY - tHeight); // left corner top
    ctx.closePath();
    ctx.fill();

    // Front-right face (main visible right side)
    ctx.fillStyle = bodyRight;
    ctx.beginPath();
    ctx.moveTo(trainX + w, trainY); // right corner bottom
    ctx.lineTo(trainX, trainY + d); // front center bottom
    ctx.lineTo(trainX, trainY + d - tHeight); // front center top
    ctx.lineTo(trainX + w, trainY - tHeight); // right corner top
    ctx.closePath();
    ctx.fill();

    // Top face
    ctx.fillStyle = bodyTop;
    ctx.beginPath();
    ctx.moveTo(trainX - w, trainY - tHeight); // left
    ctx.lineTo(trainX, trainY - d - tHeight); // back
    ctx.lineTo(trainX + w, trainY - tHeight); // right
    ctx.lineTo(trainX, trainY + d - tHeight); // front
    ctx.closePath();
    ctx.fill();

    // Princeton orange stripe on front-right face
    ctx.fillStyle = "#ff6600";
    const stripeTop = trainY - tHeight * 0.65;
    const stripeBot = trainY - tHeight * 0.45;
    ctx.beginPath();
    ctx.moveTo(trainX + w, stripeBot);
    ctx.lineTo(trainX, trainY + d - tHeight * 0.45);
    ctx.lineTo(trainX, trainY + d - tHeight * 0.65);
    ctx.lineTo(trainX + w, stripeTop);
    ctx.closePath();
    ctx.fill();

    // Princeton orange stripe on front-left face
    ctx.beginPath();
    ctx.moveTo(trainX - w, stripeBot);
    ctx.lineTo(trainX, trainY + d - tHeight * 0.45);
    ctx.lineTo(trainX, trainY + d - tHeight * 0.65);
    ctx.lineTo(trainX - w, stripeTop);
    ctx.closePath();
    ctx.fill();

    // Windows on front-right face with warm glow
    const windowGlow = 0.7 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(255, 220, 100, ${windowGlow})`;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 6 * zoom;

    // Windows on right side
    for (let win = 0; win < 2; win++) {
      const winXoff = w * (0.3 + win * 0.4);
      const winYoff = tHeight * 0.7;
      ctx.fillRect(
        trainX + winXoff - 3 * zoom,
        trainY - winYoff - 3 * zoom,
        5 * zoom,
        5 * zoom
      );
    }
    ctx.shadowBlur = 0;

    // Locomotive cab roof (raised section at back)
    const cabW = w * 0.4;
    const cabD = d * 0.6;
    const cabH = 5 * zoom;
    const cabX = trainX - w * 0.5;
    const cabY = trainY - tHeight;

    // Cab top
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(cabX - cabW, cabY - cabH);
    ctx.lineTo(cabX, cabY - cabD - cabH);
    ctx.lineTo(cabX + cabW, cabY - cabH);
    ctx.lineTo(cabX, cabY + cabD - cabH);
    ctx.closePath();
    ctx.fill();

    // Cab front
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.moveTo(cabX + cabW, cabY - cabH);
    ctx.lineTo(cabX, cabY + cabD - cabH);
    ctx.lineTo(cabX, cabY + cabD);
    ctx.lineTo(cabX + cabW, cabY);
    ctx.closePath();
    ctx.fill();

    // Smokestack
    const stackX = trainX + w * 0.3;
    const stackY = trainY - tHeight - 2 * zoom;
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.ellipse(
      stackX,
      stackY - 6 * zoom,
      3 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillRect(stackX - 2.5 * zoom, stackY - 6 * zoom, 5 * zoom, 6 * zoom);

    // Headlamp at front
    const lampGlow = 0.8 + Math.sin(time * 4) * 0.2;
    ctx.fillStyle = `rgba(255, 255, 200, ${lampGlow})`;
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      trainX + w * 0.85,
      trainY - tHeight * 0.3,
      3 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Steam puffs when moving
    if (trainAnimProgress < 0.25 || trainAnimProgress > 0.75) {
      for (let p = 0; p < 4; p++) {
        const puffPhase = (time * 4 + p * 0.25) % 1;
        const puffX = stackX + puffPhase * 8 * zoom;
        const puffY = stackY - 8 * zoom - puffPhase * 15 * zoom;
        const puffSize = (2 + puffPhase * 5) * zoom;
        const puffAlpha = 0.5 * (1 - puffPhase);
        ctx.fillStyle = `rgba(200, 200, 200, ${puffAlpha})`;
        ctx.beginPath();
        ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // ========== SPAWN POSITIONS (spread out in front of station) ==========
  const spawnPositions = [
    { x: screenPos.x - 25 * zoom, y: screenPos.y + 22 * zoom },
    { x: screenPos.x, y: screenPos.y + 28 * zoom },
    { x: screenPos.x + 25 * zoom, y: screenPos.y + 22 * zoom },
  ];

  // Show spawn position markers when tower is selected
  if (tower.showSpawnMarkers || tower.selected) {
    for (let i = 0; i < spawnPositions.length; i++) {
      const pos = spawnPositions[i];
      const occupied = (tower.occupiedSpawnSlots || [])[i];

      // Pulsing indicator
      const pulse = 0.6 + Math.sin(time * 3 + i) * 0.3;
      ctx.strokeStyle = occupied
        ? `rgba(255, 100, 100, ${pulse * 0.6})`
        : `rgba(100, 255, 100, ${pulse})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 14 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Slot number badge
      ctx.fillStyle = occupied
        ? "rgba(180, 80, 80, 0.9)"
        : "rgba(80, 180, 80, 0.9)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${7 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText((i + 1).toString(), pos.x, pos.y + 2.5 * zoom);
    }
  }

  // ========== SPAWN EFFECT ==========
  if (tower.spawnEffect && tower.spawnEffect > 0) {
    const effectProgress = 1 - tower.spawnEffect / 500;
    ctx.strokeStyle = `rgba(255, 200, 100, ${1 - effectProgress})`;
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

    // Sparkle particles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 2;
      const dist = 30 * zoom * (1 + effectProgress * 0.4);
      const sparkX = screenPos.x + Math.cos(angle) * dist;
      const sparkY = screenPos.y + 8 * zoom + Math.sin(angle) * dist * 0.5;

      ctx.fillStyle = `rgba(255, 220, 150, ${(1 - effectProgress) * 0.8})`;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 3 * zoom * (1 - effectProgress), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== PASSIVE ANIMATION - Platform lights (smaller) ==========
  const lampPositions = [
    { x: screenPos.x - 40 * zoom, y: screenPos.y - 32 * zoom },
    { x: screenPos.x + 40 * zoom, y: screenPos.y - 32 * zoom },
  ];
  for (let i = 0; i < lampPositions.length; i++) {
    const lamp = lampPositions[i];
    // Lamp post - thinner and shorter
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(
      lamp.x - 1.5 * zoom,
      screenPos.y - 28 * zoom,
      3 * zoom,
      30 * zoom
    );
    // Lamp housing - smaller
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.moveTo(lamp.x - 4 * zoom, lamp.y + 3 * zoom);
    ctx.lineTo(lamp.x, lamp.y - 3 * zoom);
    ctx.lineTo(lamp.x + 4 * zoom, lamp.y + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Lamp glow - smaller
    const lampGlow = 0.6 + Math.sin(time * 2.5 + i * Math.PI) * 0.25;
    ctx.fillStyle = `rgba(255, 220, 150, ${lampGlow})`;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y + 1 * zoom, 3 * zoom, 0, Math.PI * 2);
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
  // Young student with backpack - scared expression, big eyes
  const bobble = Math.sin(time * 8) * 2 * zoom;

  // Oversized backpack
  ctx.fillStyle = "#2255aa";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1, size * 0.35, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a4488";
  ctx.fillRect(x - size * 0.25, y - size * 0.2, size * 0.5, size * 0.35);

  // Body (hoodie)
  const hoodieGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  hoodieGrad.addColorStop(0, "#ff6600");
  hoodieGrad.addColorStop(0.5, "#ff8833");
  hoodieGrad.addColorStop(1, "#ff6600");
  ctx.fillStyle = hoodieGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.35);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y - size * 0.1,
    x - size * 0.15,
    y - size * 0.25
  );
  ctx.lineTo(x + size * 0.15, y - size * 0.25);
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y - size * 0.1,
    x + size * 0.3,
    y + size * 0.35
  );
  ctx.closePath();
  ctx.fill();

  // Hood
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28, size * 0.22, size * 0.15, 0, Math.PI, 0);
  ctx.fill();

  // Face
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + bobble, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Big nervous eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.38 + bobble,
    size * 0.08,
    size * 0.1,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.38 + bobble,
    size * 0.08,
    size * 0.1,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Pupils (darting nervously)
  const pupilOffset = Math.sin(time * 4) * size * 0.02;
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08 + pupilOffset,
    y - size * 0.38 + bobble,
    size * 0.04,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.08 + pupilOffset,
    y - size * 0.38 + bobble,
    size * 0.04,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Worried eyebrows
  ctx.strokeStyle = "#5a3825";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.48 + bobble);
  ctx.lineTo(x - size * 0.02, y - size * 0.45 + bobble);
  ctx.moveTo(x + size * 0.14, y - size * 0.48 + bobble);
  ctx.lineTo(x + size * 0.02, y - size * 0.45 + bobble);
  ctx.stroke();

  // Small frown
  ctx.strokeStyle = "#8b6655";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
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
  // More confident student with coffee cup
  const walkCycle = Math.sin(time * 6) * 3 * zoom;

  // Body (casual clothes)
  const shirtGrad = ctx.createLinearGradient(
    x,
    y - size * 0.3,
    x,
    y + size * 0.4
  );
  shirtGrad.addColorStop(0, "#4a90d9");
  shirtGrad.addColorStop(1, "#3a70b9");
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.35);
  ctx.lineTo(x - size * 0.32, y - size * 0.15);
  ctx.quadraticCurveTo(x, y - size * 0.35, x + size * 0.32, y - size * 0.15);
  ctx.lineTo(x + size * 0.28, y + size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Jeans
  ctx.fillStyle = "#3a5a8a";
  ctx.fillRect(x - size * 0.2, y + size * 0.2, size * 0.16, size * 0.25);
  ctx.fillRect(x + size * 0.04, y + size * 0.2, size * 0.16, size * 0.25);

  // Head
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + walkCycle * 0.3, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Hair (messy)
  ctx.fillStyle = "#4a3728";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.52 + walkCycle * 0.3,
    size * 0.2,
    size * 0.12,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    const angle = -0.4 + i * 0.2;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(angle) * size * 0.15,
      y - size * 0.55 + walkCycle * 0.3
    );
    ctx.lineTo(
      x + Math.cos(angle) * size * 0.22,
      y - size * 0.65 + walkCycle * 0.3 + Math.sin(time * 3 + i) * 2
    );
    ctx.lineWidth = 3 * zoom;
    ctx.strokeStyle = "#4a3728";
    ctx.stroke();
  }

  // Confident eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.42 + walkCycle * 0.3,
    size * 0.06,
    size * 0.07,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.42 + walkCycle * 0.3,
    size * 0.06,
    size * 0.07,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#2a5a3a";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.42 + walkCycle * 0.3,
    size * 0.035,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.42 + walkCycle * 0.3,
    size * 0.035,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Slight smirk
  ctx.strokeStyle = "#8b6655";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.02,
    y - size * 0.32 + walkCycle * 0.3,
    size * 0.06,
    0.9 * Math.PI,
    0.1 * Math.PI,
    true
  );
  ctx.stroke();

  // Coffee cup in hand
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + size * 0.35, y - size * 0.05, size * 0.12, size * 0.18);
  ctx.fillStyle = "#6b4423";
  ctx.fillRect(x + size * 0.35, y - size * 0.02, size * 0.12, size * 0.06);
  // Steam
  ctx.strokeStyle = "rgba(200, 200, 200, 0.6)";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + size * 0.38 + i * size * 0.05, y - size * 0.08);
    ctx.quadraticCurveTo(
      x + size * 0.4 + i * size * 0.05 + Math.sin(time * 4 + i) * 3,
      y - size * 0.18,
      x + size * 0.38 + i * size * 0.05,
      y - size * 0.25
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
  // Academic with books and glasses - stressed but determined
  const stressTwitch = Math.sin(time * 10) * 1 * zoom;

  // Stack of books held
  for (let i = 0; i < 3; i++) {
    const bookColors = ["#8b0000", "#00008b", "#006400"];
    ctx.fillStyle = bookColors[i];
    ctx.fillRect(
      x - size * 0.4,
      y - size * 0.1 + i * size * 0.08,
      size * 0.25,
      size * 0.07
    );
  }

  // Body (button-up shirt)
  ctx.fillStyle = "#f5f5dc";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y + size * 0.35);
  ctx.lineTo(x - size * 0.28, y - size * 0.15);
  ctx.lineTo(x, y - size * 0.25);
  ctx.lineTo(x + size * 0.28, y - size * 0.15);
  ctx.lineTo(x + size * 0.25, y + size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Buttons
  ctx.fillStyle = "#aaa";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y - size * 0.1 + i * size * 0.12, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Glasses
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.rect(x - size * 0.17, y - size * 0.48, size * 0.13, size * 0.1);
  ctx.rect(x + size * 0.04, y - size * 0.48, size * 0.13, size * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.43);
  ctx.lineTo(x + size * 0.04, y - size * 0.43);
  ctx.stroke();

  // Tired eyes behind glasses
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.43,
    size * 0.045,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.43,
    size * 0.045,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.43, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.43, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Dark circles under eyes
  ctx.fillStyle = "rgba(100, 80, 120, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.38,
    size * 0.05,
    size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.38,
    size * 0.05,
    size * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Stressed hair (slightly disheveled)
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.52, size * 0.2, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Stray hairs
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1 + stressTwitch, y - size * 0.58);
  ctx.lineTo(x - size * 0.15 + stressTwitch, y - size * 0.68);
  ctx.moveTo(x + size * 0.05, y - size * 0.58);
  ctx.lineTo(x + size * 0.1, y - size * 0.65);
  ctx.stroke();

  // Grimace
  ctx.strokeStyle = "#8b6655";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.3);
  ctx.lineTo(x + size * 0.08, y - size * 0.3);
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
  const attackScale =
    hero.attackAnim > 0 ? 1 + (hero.attackAnim / 300) * 0.25 : 1;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - size / 2);
  ctx.scale(attackScale, attackScale);

  // Draw specific hero type
  drawHeroSprite(ctx, 0, 0, size, hero.type, hData.color, time, zoom);

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
  zoom: number
) {
  switch (type) {
    case "tiger":
      drawTigerHero(ctx, x, y, size, color, time, zoom);
      break;
    case "tenor":
      drawTenorHero(ctx, x, y, size, color, time, zoom);
      break;
    case "mathey":
      drawMatheyKnightHero(ctx, x, y, size, color, time, zoom);
      break;
    case "rocky":
      drawRockyHero(ctx, x, y, size, color, time, zoom);
      break;
    case "fscott":
      drawFScottHero(ctx, x, y, size, color, time, zoom);
      break;
    default:
      drawDefaultHero(ctx, x, y, size, color, time, zoom);
  }
}

function drawTigerHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number
) {
  // Princeton Tiger - fierce mascot warrior
  const breathe = Math.sin(time * 2) * 2;

  // Body (muscular tiger torso)
  const bodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.6);
  bodyGrad.addColorStop(0, "#ff8c00");
  bodyGrad.addColorStop(0.7, "#ff6600");
  bodyGrad.addColorStop(1, "#cc4400");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + breathe,
    size * 0.45,
    size * 0.55 + breathe * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Tiger stripes on body
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 3 * zoom;
  for (let i = 0; i < 4; i++) {
    const stripeY = y - size * 0.2 + i * size * 0.15 + breathe;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.3, stripeY);
    ctx.quadraticCurveTo(x - size * 0.1, stripeY - size * 0.08, x, stripeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.3, stripeY);
    ctx.quadraticCurveTo(x + size * 0.1, stripeY - size * 0.08, x, stripeY);
    ctx.stroke();
  }

  // Powerful arms/shoulders
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.4,
    y - size * 0.1,
    size * 0.18,
    size * 0.25,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.4,
    y - size * 0.1,
    size * 0.18,
    size * 0.25,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Tiger head
  ctx.fillStyle = "#ff8c00";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.45, size * 0.32, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head stripes
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2.5 * zoom;
  // Forehead stripes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.65);
  ctx.lineTo(x - size * 0.1, y - size * 0.5);
  ctx.moveTo(x + size * 0.15, y - size * 0.65);
  ctx.lineTo(x + size * 0.1, y - size * 0.5);
  ctx.moveTo(x, y - size * 0.7);
  ctx.lineTo(x, y - size * 0.55);
  ctx.stroke();

  // Cheek stripes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.45);
  ctx.lineTo(x - size * 0.18, y - size * 0.4);
  ctx.moveTo(x + size * 0.28, y - size * 0.45);
  ctx.lineTo(x + size * 0.18, y - size * 0.4);
  ctx.stroke();

  // Ears
  ctx.fillStyle = "#ff8c00";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.6);
  ctx.lineTo(x - size * 0.35, y - size * 0.8);
  ctx.lineTo(x - size * 0.15, y - size * 0.65);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.6);
  ctx.lineTo(x + size * 0.35, y - size * 0.8);
  ctx.lineTo(x + size * 0.15, y - size * 0.65);
  ctx.closePath();
  ctx.fill();
  // Inner ears
  ctx.fillStyle = "#ffccaa";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.23, y - size * 0.62);
  ctx.lineTo(x - size * 0.3, y - size * 0.72);
  ctx.lineTo(x - size * 0.18, y - size * 0.64);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.23, y - size * 0.62);
  ctx.lineTo(x + size * 0.3, y - size * 0.72);
  ctx.lineTo(x + size * 0.18, y - size * 0.64);
  ctx.closePath();
  ctx.fill();

  // Muzzle
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.38, size * 0.15, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.42);
  ctx.lineTo(x - size * 0.05, y - size * 0.38);
  ctx.lineTo(x + size * 0.05, y - size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Fierce eyes (glowing)
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 8 * zoom;
  ctx.fillStyle = "#ffcc00";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    y - size * 0.52,
    size * 0.08,
    size * 0.06,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.12,
    y - size * 0.52,
    size * 0.08,
    size * 0.06,
    0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Pupils
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    y - size * 0.52,
    size * 0.03,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.12,
    y - size * 0.52,
    size * 0.03,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Roaring mouth
  ctx.fillStyle = "#8b0000";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.32, size * 0.1, size * 0.06, 0, 0, Math.PI);
  ctx.fill();

  // Fangs
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.34);
  ctx.lineTo(x - size * 0.04, y - size * 0.26);
  ctx.lineTo(x - size * 0.02, y - size * 0.34);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.06, y - size * 0.34);
  ctx.lineTo(x + size * 0.04, y - size * 0.26);
  ctx.lineTo(x + size * 0.02, y - size * 0.34);
  ctx.closePath();
  ctx.fill();

  // Power aura
  ctx.strokeStyle = `rgba(255, 140, 0, ${0.4 + Math.sin(time * 4) * 0.2})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 0.6, size * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawTenorHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number
) {
  // Triangle Club singer with musical powers
  const singWave = Math.sin(time * 3) * 3;

  // Body (formal tuxedo)
  const tuxGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  tuxGrad.addColorStop(0, "#1a1a1a");
  tuxGrad.addColorStop(0.3, "#2a2a2a");
  tuxGrad.addColorStop(0.7, "#2a2a2a");
  tuxGrad.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = tuxGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.45);
  ctx.lineTo(x - size * 0.38, y - size * 0.15);
  ctx.lineTo(x, y - size * 0.3);
  ctx.lineTo(x + size * 0.38, y - size * 0.15);
  ctx.lineTo(x + size * 0.35, y + size * 0.45);
  ctx.closePath();
  ctx.fill();

  // White shirt front
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.25);
  ctx.lineTo(x - size * 0.08, y + size * 0.3);
  ctx.lineTo(x + size * 0.08, y + size * 0.3);
  ctx.lineTo(x + size * 0.12, y - size * 0.25);
  ctx.closePath();
  ctx.fill();

  // Bow tie
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x - size * 0.1, y - size * 0.25);
  ctx.lineTo(x - size * 0.1, y - size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x + size * 0.1, y - size * 0.25);
  ctx.lineTo(x + size * 0.1, y - size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.45 + singWave * 0.2, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Slicked back hair
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.58 + singWave * 0.2,
    size * 0.22,
    size * 0.1,
    0,
    0,
    Math.PI
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.5 + singWave * 0.2);
  ctx.quadraticCurveTo(
    x - size * 0.25,
    y - size * 0.65 + singWave * 0.2,
    x,
    y - size * 0.68 + singWave * 0.2
  );
  ctx.quadraticCurveTo(
    x + size * 0.25,
    y - size * 0.65 + singWave * 0.2,
    x + size * 0.2,
    y - size * 0.5 + singWave * 0.2
  );
  ctx.fill();

  // Eyes (closed while singing)
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.47 + singWave * 0.2,
    size * 0.04,
    0.2 * Math.PI,
    0.8 * Math.PI
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.47 + singWave * 0.2,
    size * 0.04,
    0.2 * Math.PI,
    0.8 * Math.PI
  );
  ctx.stroke();

  // Singing mouth
  ctx.fillStyle = "#4a2020";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.35 + singWave * 0.2,
    size * 0.08,
    size * 0.1 + singWave * 0.02,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Musical notes emanating
  ctx.fillStyle = `rgba(255, 102, 0, ${0.6 + Math.sin(time * 5) * 0.3})`;
  ctx.font = `${16 * zoom}px Arial`;
  ctx.textAlign = "center";
  for (let i = 0; i < 3; i++) {
    const notePhase = (time * 2 + i * 0.8) % 2;
    const noteX = x + size * 0.4 + Math.sin(notePhase * Math.PI) * size * 0.2;
    const noteY = y - size * 0.3 - notePhase * size * 0.5;
    const noteAlpha = 1 - notePhase / 2;
    ctx.globalAlpha = noteAlpha;
    ctx.fillText(i % 2 === 0 ? "♪" : "♫", noteX, noteY);
  }
  ctx.globalAlpha = 1;

  // Sonic aura rings
  for (let i = 0; i < 3; i++) {
    const ringPhase = (time * 2 + i * 0.4) % 1;
    const ringRadius = size * (0.4 + ringPhase * 0.4);
    ctx.strokeStyle = `rgba(147, 112, 219, ${0.5 * (1 - ringPhase)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.2,
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
  zoom: number
) {
  // Medieval knight from Mathey College
  const stance = Math.sin(time * 2) * 2;

  // Body (plate armor)
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  armorGrad.addColorStop(0, "#6a6a7a");
  armorGrad.addColorStop(0.3, "#9a9aaa");
  armorGrad.addColorStop(0.5, "#cacaca");
  armorGrad.addColorStop(0.7, "#9a9aaa");
  armorGrad.addColorStop(1, "#6a6a7a");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.45);
  ctx.lineTo(x - size * 0.4, y - size * 0.1);
  ctx.lineTo(x - size * 0.25, y - size * 0.25);
  ctx.lineTo(x, y - size * 0.3);
  ctx.lineTo(x + size * 0.25, y - size * 0.25);
  ctx.lineTo(x + size * 0.4, y - size * 0.1);
  ctx.lineTo(x + size * 0.35, y + size * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#4a4a5a";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Armor segments
  ctx.strokeStyle = "#5a5a6a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y);
  ctx.lineTo(x + size * 0.3, y);
  ctx.moveTo(x - size * 0.28, y + size * 0.15);
  ctx.lineTo(x + size * 0.28, y + size * 0.15);
  ctx.stroke();

  // Princeton crest on chest
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.15);
  ctx.lineTo(x - size * 0.1, y + size * 0.05);
  ctx.lineTo(x, y + size * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${8 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText("P", x, y + size * 0.05);

  // Shoulder pauldrons
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.42,
    y - size * 0.15,
    size * 0.15,
    size * 0.12,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.42,
    y - size * 0.15,
    size * 0.15,
    size * 0.12,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Helmet
  ctx.fillStyle = "#9a9aaa";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.45, size * 0.28, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Visor
  ctx.fillStyle = "#3a3a4a";
  ctx.beginPath();
  ctx.rect(x - size * 0.2, y - size * 0.52, size * 0.4, size * 0.15);
  ctx.fill();
  // Visor slits
  ctx.strokeStyle = "#1a1a2a";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    const slitX = x - size * 0.15 + i * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(slitX, y - size * 0.5);
    ctx.lineTo(slitX, y - size * 0.4);
    ctx.stroke();
  }

  // Plume
  ctx.fillStyle = "#ff6600";
  for (let i = 0; i < 5; i++) {
    const plumeX = x + (i - 2) * size * 0.06;
    const plumeWave = Math.sin(time * 4 + i * 0.5) * 3;
    ctx.beginPath();
    ctx.moveTo(plumeX, y - size * 0.65);
    ctx.quadraticCurveTo(
      plumeX + plumeWave,
      y - size * 0.85,
      plumeX + plumeWave * 0.5,
      y - size
    );
    ctx.lineWidth = 4 * zoom;
    ctx.strokeStyle = "#ff6600";
    ctx.stroke();
  }

  // Sword (raised)
  ctx.save();
  ctx.translate(x + size * 0.5, y - size * 0.1);
  ctx.rotate(-0.5 + stance * 0.05);
  // Blade
  const bladeGrad = ctx.createLinearGradient(0, -size * 0.1, 0, -size * 0.7);
  bladeGrad.addColorStop(0, "#c0c0c0");
  bladeGrad.addColorStop(0.5, "#ffffff");
  bladeGrad.addColorStop(1, "#c0c0c0");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.1);
  ctx.lineTo(-size * 0.025, -size * 0.6);
  ctx.lineTo(0, -size * 0.7);
  ctx.lineTo(size * 0.025, -size * 0.6);
  ctx.lineTo(size * 0.03, -size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#808080";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Crossguard
  ctx.fillStyle = "#daa520";
  ctx.fillRect(-size * 0.1, -size * 0.12, size * 0.2, size * 0.04);
  // Hilt
  ctx.fillStyle = "#4a2a0a";
  ctx.fillRect(-size * 0.025, -size * 0.08, size * 0.05, size * 0.15);
  ctx.restore();

  // Shield (on left arm)
  ctx.save();
  ctx.translate(x - size * 0.45, y);
  ctx.rotate(0.2);
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.25);
  ctx.lineTo(-size * 0.15, -size * 0.15);
  ctx.lineTo(-size * 0.15, size * 0.15);
  ctx.lineTo(0, size * 0.25);
  ctx.lineTo(size * 0.15, size * 0.15);
  ctx.lineTo(size * 0.15, -size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Shield emblem
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${12 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText("M", 0, size * 0.05);
  ctx.restore();
}

function drawRockyHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number
) {
  // Rocky the squirrel - agile and quick
  const hop = Math.abs(Math.sin(time * 6)) * 5;

  // Fluffy tail
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + size * 0.2);
  ctx.quadraticCurveTo(
    x + size * 0.7 + Math.sin(time * 4) * 5,
    y - size * 0.2,
    x + size * 0.5,
    y - size * 0.6 - hop * 0.3
  );
  ctx.quadraticCurveTo(
    x + size * 0.3,
    y - size * 0.3,
    x + size * 0.15,
    y + size * 0.1
  );
  ctx.fill();
  // Tail lighter stripe
  ctx.fillStyle = "#a08030";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.55 + Math.sin(time * 4) * 4,
    y - size * 0.15,
    x + size * 0.42,
    y - size * 0.5 - hop * 0.3
  );
  ctx.quadraticCurveTo(
    x + size * 0.32,
    y - size * 0.25,
    x + size * 0.18,
    y + size * 0.08
  );
  ctx.fill();

  // Body
  const bodyGrad = ctx.createRadialGradient(
    x,
    y - hop,
    0,
    x,
    y - hop,
    size * 0.4
  );
  bodyGrad.addColorStop(0, "#c09040");
  bodyGrad.addColorStop(0.7, "#8b6914");
  bodyGrad.addColorStop(1, "#6b4904");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - hop, size * 0.32, size * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly
  ctx.fillStyle = "#f5deb3";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - hop + size * 0.05,
    size * 0.2,
    size * 0.25,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Head
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.45 - hop,
    size * 0.26,
    size * 0.24,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Cheeks
  ctx.fillStyle = "#f5deb3";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    y - size * 0.4 - hop,
    size * 0.1,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.15,
    y - size * 0.4 - hop,
    size * 0.1,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Ears
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.18,
    y - size * 0.65 - hop,
    size * 0.08,
    size * 0.12,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.18,
    y - size * 0.65 - hop,
    size * 0.08,
    size * 0.12,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Inner ears
  ctx.fillStyle = "#d4a030";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.18,
    y - size * 0.64 - hop,
    size * 0.05,
    size * 0.08,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.18,
    y - size * 0.64 - hop,
    size * 0.05,
    size * 0.08,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Eyes (big and cute)
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.48 - hop,
    size * 0.08,
    size * 0.1,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.48 - hop,
    size * 0.08,
    size * 0.1,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Eye highlights
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.5 - hop, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.5 - hop, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#4a2a0a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.38 - hop,
    size * 0.04,
    size * 0.03,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Little smile
  ctx.strokeStyle = "#4a2a0a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 - hop, size * 0.04, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Holding acorn
  ctx.fillStyle = "#5a3a1a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.35,
    y - size * 0.05 - hop,
    size * 0.08,
    size * 0.1,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#8b6914";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.35,
    y - size * 0.13 - hop,
    size * 0.07,
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Speed lines when moving
  ctx.strokeStyle = `rgba(139, 105, 20, ${0.3 + Math.sin(time * 8) * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(
      x - size * 0.5 - i * size * 0.1,
      y - size * 0.1 + i * size * 0.1
    );
    ctx.lineTo(
      x - size * 0.7 - i * size * 0.1,
      y - size * 0.1 + i * size * 0.1
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
  zoom: number
) {
  // F. Scott Fitzgerald - 1920s writer aesthetic
  const writeGesture = Math.sin(time * 2) * 2;

  // Body (1920s suit)
  const suitGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y
  );
  suitGrad.addColorStop(0, "#3a3a4a");
  suitGrad.addColorStop(0.5, "#4a4a5a");
  suitGrad.addColorStop(1, "#3a3a4a");
  ctx.fillStyle = suitGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.45);
  ctx.lineTo(x - size * 0.35, y - size * 0.1);
  ctx.lineTo(x, y - size * 0.28);
  ctx.lineTo(x + size * 0.35, y - size * 0.1);
  ctx.lineTo(x + size * 0.32, y + size * 0.45);
  ctx.closePath();
  ctx.fill();

  // Vest
  ctx.fillStyle = "#8b7355";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.2);
  ctx.lineTo(x - size * 0.18, y + size * 0.25);
  ctx.lineTo(x + size * 0.18, y + size * 0.25);
  ctx.lineTo(x + size * 0.15, y - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Shirt collar
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.22);
  ctx.lineTo(x - size * 0.15, y - size * 0.1);
  ctx.lineTo(x, y - size * 0.15);
  ctx.lineTo(x + size * 0.15, y - size * 0.1);
  ctx.lineTo(x + size * 0.1, y - size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Tie
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x - size * 0.05, y + size * 0.1);
  ctx.lineTo(x, y + size * 0.15);
  ctx.lineTo(x + size * 0.05, y + size * 0.1);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.45, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // 1920s slicked hair
  ctx.fillStyle = "#4a3020";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.58, size * 0.23, size * 0.12, 0, 0, Math.PI);
  ctx.fill();
  // Side part
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.55);
  ctx.quadraticCurveTo(
    x - size * 0.2,
    y - size * 0.45,
    x - size * 0.22,
    y - size * 0.4
  );
  ctx.lineWidth = 3 * zoom;
  ctx.strokeStyle = "#4a3020";
  ctx.stroke();

  // Thoughtful eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.47,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.47,
    size * 0.05,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#4a6a8a";
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.47, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.47, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Contemplative expression
  ctx.strokeStyle = "#8b6655";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.35);
  ctx.quadraticCurveTo(x, y - size * 0.33, x + size * 0.06, y - size * 0.35);
  ctx.stroke();

  // Fountain pen in hand
  ctx.save();
  ctx.translate(x + size * 0.4, y - size * 0.05 + writeGesture);
  ctx.rotate(-0.8);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-size * 0.02, -size * 0.2, size * 0.04, size * 0.25);
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-size * 0.015, -size * 0.28);
  ctx.lineTo(size * 0.015, -size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Floating words/letters
  ctx.fillStyle = `rgba(218, 165, 32, ${0.5 + Math.sin(time * 3) * 0.3})`;
  ctx.font = `italic ${10 * zoom}px Georgia`;
  const words = ["dream", "green", "light", "hope"];
  for (let i = 0; i < 4; i++) {
    const wordPhase = (time + i * 0.7) % 3;
    const wordX = x - size * 0.3 + Math.sin(wordPhase * Math.PI) * size * 0.4;
    const wordY = y - size * 0.5 - wordPhase * size * 0.4;
    const wordAlpha = 1 - wordPhase / 3;
    ctx.globalAlpha = wordAlpha * 0.6;
    ctx.fillText(words[i], wordX, wordY);
  }
  ctx.globalAlpha = 1;

  // Golden aura
  ctx.strokeStyle = `rgba(218, 165, 32, ${0.3 + Math.sin(time * 2) * 0.15})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawDefaultHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number
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

  // Selection indicator
  if (troop.selected) {
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y + 2 * zoom,
      28 * zoom,
      14 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 5 * zoom,
    15 * zoom,
    7 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const size = 22 * zoom;
  const attackScale =
    troop.attackAnim > 0 ? 1 + (troop.attackAnim / 300) * 0.2 : 1;

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - size / 2);
  ctx.scale(attackScale, attackScale);

  // Draw specific troop type
  drawTroopSprite(ctx, 0, 0, size, troop.type, tData.color, time, zoom);

  ctx.restore();

  // HP Bar
  if (troop.hp < troop.maxHp) {
    const barWidth = 30 * zoom;
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
  zoom: number
) {
  switch (type) {
    case "soldier":
    case "footsoldier":
      drawSoldierTroop(ctx, x, y, size, color, time, zoom);
      break;
    case "cavalry":
      drawCavalryTroop(ctx, x, y, size, color, time, zoom);
      break;
    case "centaur":
      drawCentaurTroop(ctx, x, y, size, color, time, zoom);
      break;
    case "elite":
      drawEliteTroop(ctx, x, y, size, color, time, zoom);
      break;
    case "knight":
    case "armored":
      drawKnightTroop(ctx, x, y, size, color, time, zoom);
      break;
    default:
      drawDefaultTroop(ctx, x, y, size, color, time, zoom);
  }
}

function drawSoldierTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number
) {
  // Elite Princeton Soldier - Roman Legionnaire style with Princeton colors
  const stance = Math.sin(time * 4) * 1.5;
  const breathe = Math.sin(time * 2) * 0.5;
  const footTap = Math.abs(Math.sin(time * 3)) * 1;

  // === LEGS (animated idle stance) ===
  ctx.fillStyle = "#1a1a1a";
  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.1, y + size * 0.35);
  ctx.rotate(-0.05 + footTap * 0.02);
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  // Boot
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.08, size * 0.18, size * 0.16, size * 0.08);
  ctx.restore();
  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.1, y + size * 0.35);
  ctx.rotate(0.05 - footTap * 0.02);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.22);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-size * 0.08, size * 0.18, size * 0.16, size * 0.08);
  ctx.restore();

  // === BODY (armored torso with Princeton orange) ===
  // Back plate
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.38);
  ctx.lineTo(x - size * 0.25, y - size * 0.05);
  ctx.lineTo(x + size * 0.25, y - size * 0.05);
  ctx.lineTo(x + size * 0.22, y + size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Front chest plate with orange
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

  // Chest muscle definition
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.1 + breathe);
  ctx.lineTo(x, y + size * 0.2 + breathe);
  ctx.stroke();

  // Princeton "P" on chest
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${8 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y + size * 0.1 + breathe);

  // Black belt with gold buckle
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - size * 0.2, y + size * 0.25, size * 0.4, size * 0.06);
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(x - size * 0.04, y + size * 0.26, size * 0.08, size * 0.04);

  // === ARMS ===
  // Left arm (holding shield)
  ctx.fillStyle = "#ffe0bd";
  ctx.save();
  ctx.translate(x - size * 0.28, y + size * 0.05);
  ctx.rotate(-0.3);
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.2);
  ctx.restore();

  // Right arm (holding spear, animated)
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.05);
  ctx.rotate(0.2 + stance * 0.02);
  ctx.fillStyle = "#ffe0bd";
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.2);
  ctx.restore();

  // === SHIELD (detailed round shield) ===
  ctx.save();
  ctx.translate(x - size * 0.38, y + size * 0.1);
  // Shield rim
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.18, size * 0.16, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Shield face
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.15, size * 0.13, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Orange center
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.1, size * 0.085, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Shield boss (center spike)
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === SPEAR (animated) ===
  ctx.save();
  ctx.translate(x + size * 0.38, y - size * 0.1);
  ctx.rotate(-0.15 + stance * 0.03);
  // Shaft with wood grain
  const shaftGrad = ctx.createLinearGradient(-size * 0.02, 0, size * 0.02, 0);
  shaftGrad.addColorStop(0, "#5a3a1a");
  shaftGrad.addColorStop(0.5, "#7b5030");
  shaftGrad.addColorStop(1, "#5a3a1a");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.025, -size * 0.55, size * 0.05, size * 0.7);
  // Spearhead (gleaming)
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
  // Spear glint
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.62, size * 0.015, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === HEAD ===
  // Neck
  ctx.fillStyle = "#ffe0bd";
  ctx.fillRect(x - size * 0.06, y - size * 0.2, size * 0.12, size * 0.1);

  // Face
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // === HELMET (Roman-style with orange plume) ===
  // Helmet dome
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
  // Helmet side guards
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
  // Nose guard
  ctx.fillStyle = "#8a8a9a";
  ctx.fillRect(x - size * 0.02, y - size * 0.42, size * 0.04, size * 0.15);

  // Epic orange plume (animated)
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52);
  const plumeWave = Math.sin(time * 6);
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
  // Plume highlight
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

  // === FACE DETAILS ===
  // Determined eyes
  ctx.fillStyle = "#4a3520";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.36,
    size * 0.03,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.36,
    size * 0.03,
    size * 0.025,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.055, y - size * 0.365, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.065, y - size * 0.365, size * 0.01, 0, Math.PI * 2);
  ctx.fill();
  // Eyebrows (determined)
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.4);
  ctx.lineTo(x - size * 0.03, y - size * 0.42);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.4);
  ctx.lineTo(x + size * 0.03, y - size * 0.42);
  ctx.stroke();
  // Mouth (stern)
  ctx.strokeStyle = "#8b6b5b";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.28);
  ctx.lineTo(x + size * 0.04, y - size * 0.28);
  ctx.stroke();
}

function drawCavalryTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number
) {
  // Epic Princeton Knight on War Horse
  const gallop = Math.sin(time * 8) * 3;
  const legCycle = Math.sin(time * 8) * 0.35;
  const headBob = Math.sin(time * 8 + 0.5) * 2;
  const tailSwish = Math.sin(time * 5) * 0.4;
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

  // === LANCE (jousting position) ===
  ctx.save();
  ctx.translate(x + size * 0.22, y - size * 0.28 + gallop * 0.12);
  ctx.rotate(-0.35);
  // Lance shaft
  const lanceGrad = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, 0);
  lanceGrad.addColorStop(0, "#5a3a1a");
  lanceGrad.addColorStop(0.5, "#7b5030");
  lanceGrad.addColorStop(1, "#5a3a1a");
  ctx.fillStyle = lanceGrad;
  ctx.fillRect(-size * 0.025, -size * 0.7, size * 0.05, size * 0.85);
  // Lance tip
  const tipGrad = ctx.createLinearGradient(0, -size * 0.8, 0, -size * 0.7);
  tipGrad.addColorStop(0, "#e0e0e0");
  tipGrad.addColorStop(1, "#a0a0a0");
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.85);
  ctx.lineTo(-size * 0.04, -size * 0.7);
  ctx.lineTo(size * 0.04, -size * 0.7);
  ctx.closePath();
  ctx.fill();
  // Lance pennant
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.68);
  const pennantWave = Math.sin(time * 8) * 3;
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
  zoom: number
) {
  // Epic Mythical Centaur Archer - Golden Princeton Champion
  const gallop = Math.sin(time * 7) * 4;
  const legCycle = Math.sin(time * 7) * 0.4;
  const breathe = Math.sin(time * 2) * 0.5;
  const tailSwish = Math.sin(time * 5);
  const hairFlow = Math.sin(time * 4);

  // === POWERFUL HORSE BODY ===
  // Main body (golden muscular)
  const bodyGrad = ctx.createRadialGradient(
    x + size * 0.05,
    y + size * 0.1,
    0,
    x + size * 0.05,
    y + size * 0.1,
    size * 0.5
  );
  bodyGrad.addColorStop(0, "#e8c868");
  bodyGrad.addColorStop(0.5, "#c09838");
  bodyGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    y + size * 0.15 + gallop * 0.12,
    size * 0.42,
    size * 0.24,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Muscle definition on body
  ctx.strokeStyle = "rgba(139,105,20,0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.05,
    y + size * 0.12 + gallop * 0.12,
    size * 0.15,
    0.3,
    2.5
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.25,
    y + size * 0.1 + gallop * 0.12,
    size * 0.12,
    0.5,
    2.3
  );
  ctx.stroke();

  // === POWERFUL LEGS ===
  // Front left leg
  ctx.save();
  ctx.translate(x - size * 0.18, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(legCycle * 1.1);
  // Upper leg (muscular)
  ctx.fillStyle = "#c09838";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.quadraticCurveTo(-size * 0.07, size * 0.12, -size * 0.04, size * 0.16);
  ctx.lineTo(size * 0.04, size * 0.16);
  ctx.quadraticCurveTo(size * 0.07, size * 0.12, size * 0.05, 0);
  ctx.closePath();
  ctx.fill();
  // Lower leg
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.035, size * 0.14, size * 0.07, size * 0.15);
  // Hoof (golden)
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.3, size * 0.05, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front right leg
  ctx.save();
  ctx.translate(x - size * 0.05, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(-legCycle * 0.85);
  ctx.fillStyle = "#c09838";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.quadraticCurveTo(-size * 0.06, size * 0.1, -size * 0.035, size * 0.16);
  ctx.lineTo(size * 0.035, size * 0.16);
  ctx.quadraticCurveTo(size * 0.06, size * 0.1, size * 0.05, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.035, size * 0.14, size * 0.07, size * 0.15);
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.3, size * 0.05, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Back left leg
  ctx.save();
  ctx.translate(x + size * 0.22, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(-legCycle * 1.0);
  ctx.fillStyle = "#c09838";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.quadraticCurveTo(-size * 0.07, size * 0.12, -size * 0.04, size * 0.16);
  ctx.lineTo(size * 0.04, size * 0.16);
  ctx.quadraticCurveTo(size * 0.07, size * 0.12, size * 0.05, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.035, size * 0.14, size * 0.07, size * 0.15);
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.3, size * 0.05, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Back right leg
  ctx.save();
  ctx.translate(x + size * 0.35, y + size * 0.34 + gallop * 0.1);
  ctx.rotate(legCycle * 0.9);
  ctx.fillStyle = "#c09838";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.quadraticCurveTo(-size * 0.06, size * 0.1, -size * 0.035, size * 0.16);
  ctx.lineTo(size * 0.035, size * 0.16);
  ctx.quadraticCurveTo(size * 0.06, size * 0.1, size * 0.05, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a08028";
  ctx.fillRect(-size * 0.035, size * 0.14, size * 0.07, size * 0.15);
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.3, size * 0.05, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === FLOWING TAIL ===
  ctx.strokeStyle = "#8b6914";
  ctx.lineWidth = 6 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.65 + tailSwish * 8,
    y + size * 0.15,
    x + size * 0.55 + tailSwish * 12,
    y + size * 0.38
  );
  ctx.stroke();
  // Tail highlight
  ctx.strokeStyle = "#c09838";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x + size * 0.6 + tailSwish * 6,
    y + size * 0.12,
    x + size * 0.5 + tailSwish * 10,
    y + size * 0.32
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
  ctx.rotate(-0.25);

  // Ornate bow (golden accents)
  ctx.strokeStyle = "#6b4423";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, -0.55 * Math.PI, 0.55 * Math.PI);
  ctx.stroke();
  // Gold inlay on bow
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, -0.5 * Math.PI, 0.5 * Math.PI);
  ctx.stroke();

  // Bowstring (taut)
  ctx.strokeStyle = "#f8f8dc";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    Math.cos(-0.55 * Math.PI) * size * 0.28,
    Math.sin(-0.55 * Math.PI) * size * 0.28
  );
  ctx.lineTo(size * 0.15, 0); // Pulled back
  ctx.lineTo(
    Math.cos(0.55 * Math.PI) * size * 0.28,
    Math.sin(0.55 * Math.PI) * size * 0.28
  );
  ctx.stroke();

  // Arrow (nocked and ready)
  // Arrow shaft
  ctx.fillStyle = "#5a3a1a";
  ctx.fillRect(size * 0.12, -size * 0.015, size * 0.4, size * 0.03);
  // Arrow fletching
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(size * 0.14, 0);
  ctx.lineTo(size * 0.08, -size * 0.035);
  ctx.lineTo(size * 0.2, 0);
  ctx.lineTo(size * 0.08, size * 0.035);
  ctx.closePath();
  ctx.fill();
  // Arrowhead (gleaming)
  const arrowGrad = ctx.createLinearGradient(
    size * 0.5,
    -size * 0.03,
    size * 0.5,
    size * 0.03
  );
  arrowGrad.addColorStop(0, "#e0e0e0");
  arrowGrad.addColorStop(0.5, "#ffffff");
  arrowGrad.addColorStop(1, "#a0a0a0");
  ctx.fillStyle = arrowGrad;
  ctx.beginPath();
  ctx.moveTo(size * 0.58, 0);
  ctx.lineTo(size * 0.5, -size * 0.035);
  ctx.lineTo(size * 0.52, 0);
  ctx.lineTo(size * 0.5, size * 0.035);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Elite Guard - Level 3 station troop with royal armor and halberd
function drawEliteTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number
) {
  const stance = Math.sin(time * 3) * 1.2;
  const breathe = Math.sin(time * 2) * 0.5;
  const capeWave = Math.sin(time * 3.5);

  // === ROYAL CAPE ===
  ctx.fillStyle = "#1a1a3a"; // Dark blue royal cape
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

  // === HALBERD (polearm weapon) ===
  ctx.save();
  ctx.translate(x + size * 0.25, y - size * 0.1);
  ctx.rotate(0.15 + stance * 0.02);

  // Pole
  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(-size * 0.02, -size * 0.5, size * 0.04, size * 0.9);

  // Axe head
  ctx.fillStyle = "#c0c0d0";
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
  zoom: number
) {
  // Default falls back to knight
  drawKnightTroop(ctx, x, y, size, color, time, zoom);
}

function drawKnightTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number
) {
  // Elite Princeton Knight - Heavy armored warrior with great sword
  const stance = Math.sin(time * 3) * 1;
  const breathe = Math.sin(time * 2) * 0.4;
  const capeWave = Math.sin(time * 4);

  // === FLOWING CAPE ===
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.25 + capeWave * 3,
    y + size * 0.15,
    x - size * 0.2 + capeWave * 5,
    y + size * 0.45
  );
  ctx.lineTo(x + size * 0.1 + capeWave * 2, y + size * 0.4);
  ctx.quadraticCurveTo(
    x + size * 0.05 + capeWave * 1,
    y + size * 0.1,
    x + size * 0.12,
    y - size * 0.12 + breathe
  );
  ctx.closePath();
  ctx.fill();
  // Cape inner shadow
  ctx.fillStyle = "#cc4400";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.1 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.15 + capeWave * 2,
    y + size * 0.1,
    x - size * 0.1 + capeWave * 3,
    y + size * 0.35
  );
  ctx.lineTo(x + capeWave, y + size * 0.32);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.05,
    x + size * 0.05,
    y - size * 0.08 + breathe
  );
  ctx.closePath();
  ctx.fill();

  // === LEGS (armored) ===
  ctx.fillStyle = "#7a7a8a";
  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.08, y + size * 0.32);
  ctx.rotate(-0.08 + stance * 0.02);
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.24);
  // Knee guard
  ctx.fillStyle = "#9a9aaa";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.1, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Boot
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(-size * 0.07, size * 0.2, size * 0.14, size * 0.08);
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.08, y + size * 0.32);
  ctx.rotate(0.08 - stance * 0.02);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.24);
  ctx.fillStyle = "#9a9aaa";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.1, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a5a6a";
  ctx.fillRect(-size * 0.07, size * 0.2, size * 0.14, size * 0.08);
  ctx.restore();

  // === BODY (full plate armor) ===
  // Back plate
  ctx.fillStyle = "#6a6a7a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.35 + breathe);
  ctx.lineTo(x - size * 0.24, y - size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.24, y - size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.22, y + size * 0.35 + breathe);
  ctx.closePath();
  ctx.fill();

  // Front chest plate
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y,
    x + size * 0.2,
    y
  );
  plateGrad.addColorStop(0, "#8a8a9a");
  plateGrad.addColorStop(0.3, "#aaaabb");
  plateGrad.addColorStop(0.7, "#aaaabb");
  plateGrad.addColorStop(1, "#8a8a9a");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.32 + breathe);
  ctx.lineTo(x - size * 0.22, y - size * 0.12 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.22 + breathe * 0.3,
    x + size * 0.22,
    y - size * 0.12 + breathe * 0.5
  );
  ctx.lineTo(x + size * 0.2, y + size * 0.32 + breathe);
  ctx.closePath();
  ctx.fill();

  // Chest plate details
  ctx.strokeStyle = "#6a6a7a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.15 + breathe * 0.4);
  ctx.lineTo(x, y + size * 0.15 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + breathe * 0.7, size * 0.12, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Orange tabard overlay
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.32 + breathe);
  ctx.lineTo(x - size * 0.1, y + size * 0.05 + breathe);
  ctx.lineTo(x + size * 0.1, y + size * 0.05 + breathe);
  ctx.lineTo(x + size * 0.12, y + size * 0.32 + breathe);
  ctx.closePath();
  ctx.fill();
  // Black "P" emblem
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${8 * zoom}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y + size * 0.18 + breathe);

  // Belt
  ctx.fillStyle = "#4a4a5a";
  ctx.fillRect(
    x - size * 0.18,
    y + size * 0.28 + breathe,
    size * 0.36,
    size * 0.06
  );
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(
    x - size * 0.04,
    y + size * 0.29 + breathe,
    size * 0.08,
    size * 0.04
  );

  // === PAULDRONS (shoulder armor) ===
  // Left pauldron
  ctx.fillStyle = "#9a9aaa";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.26,
    y - size * 0.08 + breathe * 0.5,
    size * 0.1,
    size * 0.08,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.26,
    y - size * 0.06 + breathe * 0.5,
    size * 0.08,
    size * 0.05,
    -0.3,
    0,
    Math.PI
  );
  ctx.fill();

  // Right pauldron
  ctx.fillStyle = "#9a9aaa";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.26,
    y - size * 0.08 + breathe * 0.5,
    size * 0.1,
    size * 0.08,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.26,
    y - size * 0.06 + breathe * 0.5,
    size * 0.08,
    size * 0.05,
    0.3,
    0,
    Math.PI
  );
  ctx.fill();

  // === ARMS ===
  // Left arm
  ctx.fillStyle = "#7a7a8a";
  ctx.save();
  ctx.translate(x - size * 0.28, y + size * 0.02 + breathe * 0.5);
  ctx.rotate(-0.2);
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.2);
  // Gauntlet
  ctx.fillStyle = "#8a8a9a";
  ctx.fillRect(-size * 0.06, size * 0.16, size * 0.12, size * 0.08);
  ctx.restore();

  // Right arm (holding sword)
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.02 + breathe * 0.5);
  ctx.rotate(0.15 + stance * 0.03);
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(-size * 0.05, 0, size * 0.1, size * 0.2);
  ctx.fillStyle = "#8a8a9a";
  ctx.fillRect(-size * 0.06, size * 0.16, size * 0.12, size * 0.08);
  ctx.restore();

  // === GREAT SWORD ===
  ctx.save();
  ctx.translate(x + size * 0.38, y - size * 0.05 + breathe * 0.5);
  ctx.rotate(-0.3 + stance * 0.04);

  // Sword handle
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(-size * 0.025, size * 0.1, size * 0.05, size * 0.18);
  // Leather wrap
  ctx.strokeStyle = "#6a5040";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, size * 0.12 + i * size * 0.04);
    ctx.lineTo(size * 0.025, size * 0.14 + i * size * 0.04);
    ctx.stroke();
  }

  // Crossguard
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(-size * 0.1, size * 0.08, size * 0.2, size * 0.04);
  ctx.beginPath();
  ctx.arc(-size * 0.1, size * 0.1, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.1, size * 0.1, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Blade
  const bladeGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, 0);
  bladeGrad.addColorStop(0, "#c0c0c0");
  bladeGrad.addColorStop(0.3, "#ffffff");
  bladeGrad.addColorStop(0.7, "#ffffff");
  bladeGrad.addColorStop(1, "#a0a0a0");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, size * 0.08);
  ctx.lineTo(-size * 0.05, -size * 0.5);
  ctx.lineTo(0, -size * 0.58);
  ctx.lineTo(size * 0.05, -size * 0.5);
  ctx.lineTo(size * 0.04, size * 0.08);
  ctx.closePath();
  ctx.fill();
  // Blade edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.06);
  ctx.lineTo(0, -size * 0.55);
  ctx.stroke();
  // Blade glint
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.3, size * 0.015, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // === SHIELD (on back, visible from side) ===
  ctx.save();
  ctx.translate(x - size * 0.32, y + size * 0.05 + breathe);
  ctx.rotate(-0.4);
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.18);
  ctx.lineTo(-size * 0.08, -size * 0.1);
  ctx.lineTo(-size * 0.06, size * 0.12);
  ctx.lineTo(0, size * 0.16);
  ctx.lineTo(size * 0.06, size * 0.12);
  ctx.lineTo(size * 0.08, -size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.12);
  ctx.lineTo(-size * 0.05, -size * 0.06);
  ctx.lineTo(-size * 0.03, size * 0.08);
  ctx.lineTo(0, size * 0.1);
  ctx.lineTo(size * 0.03, size * 0.08);
  ctx.lineTo(size * 0.05, -size * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === HEAD (great helm) ===
  // Neck guard
  ctx.fillStyle = "#7a7a8a";
  ctx.fillRect(
    x - size * 0.08,
    y - size * 0.22 + breathe * 0.3,
    size * 0.16,
    size * 0.12
  );

  // Great helm
  ctx.fillStyle = "#8a8a9a";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.38 + breathe * 0.2, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Helm face plate
  ctx.fillStyle = "#7a7a8a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.42 + breathe * 0.2);
  ctx.lineTo(x - size * 0.14, y - size * 0.3 + breathe * 0.2);
  ctx.lineTo(x, y - size * 0.25 + breathe * 0.2);
  ctx.lineTo(x + size * 0.14, y - size * 0.3 + breathe * 0.2);
  ctx.lineTo(x + size * 0.12, y - size * 0.42 + breathe * 0.2);
  ctx.closePath();
  ctx.fill();

  // Visor slit
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(
    x - size * 0.1,
    y - size * 0.4 + breathe * 0.2,
    size * 0.2,
    size * 0.045
  );
  // Eye gleam
  ctx.fillStyle = `rgba(255, 200, 100, ${0.5 + Math.sin(time * 3) * 0.3})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.04,
    y - size * 0.385 + breathe * 0.2,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.04,
    y - size * 0.385 + breathe * 0.2,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Helm crest (orange plume)
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52 + breathe * 0.2);
  const crestWave = Math.sin(time * 5);
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const cx = x + (t - 0.5) * size * 0.2 + crestWave * 2 * (1 - t);
    const cy =
      y -
      size * 0.52 -
      t * size * 0.25 -
      Math.sin(t * Math.PI) * size * 0.08 +
      breathe * 0.2;
    ctx.lineTo(cx, cy);
  }
  for (let i = 5; i >= 0; i--) {
    const t = i / 5;
    const cx = x + (t - 0.5) * size * 0.2 + crestWave * 2 * (1 - t);
    const cy =
      y -
      size * 0.52 -
      t * size * 0.22 -
      Math.sin(t * Math.PI) * size * 0.05 +
      breathe * 0.2;
    ctx.lineTo(cx, cy);
  }
  ctx.closePath();
  ctx.fill();
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
