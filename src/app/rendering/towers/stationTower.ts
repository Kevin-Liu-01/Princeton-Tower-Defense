// Princeton Tower Defense - Station Tower Rendering
// Troop-spawning Dinky station

import type { Tower, Position, TowerColors } from "../../types";
import { drawIsometricPrism, lightenColor, darkenColor } from "../helpers";

export function renderStationTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  ctx.save();
  const level = tower.level;

  // Draw track
  renderTrack(ctx, screenPos, tower, zoom, time);

  // Draw station building based on level
  if (level === 1) {
    renderBarracks(ctx, screenPos, tower, zoom, time, colors);
  } else if (level === 2) {
    renderGarrison(ctx, screenPos, tower, zoom, time, colors);
  } else if (level === 3) {
    renderFortress(ctx, screenPos, tower, zoom, time, colors);
  } else if (level === 4) {
    if (tower.upgrade === "A") {
      renderCentaurStables(ctx, screenPos, tower, zoom, time, colors);
    } else {
      renderRoyalCavalry(ctx, screenPos, tower, zoom, time, colors);
    }
  }

  // Draw train if animating
  if (tower.trainAnimProgress !== undefined && tower.trainAnimProgress > 0) {
    renderTrain(ctx, screenPos, tower, zoom, time);
  }

  ctx.restore();
}

// ============================================================================
// TRACK RENDERING
// ============================================================================

function renderTrack(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number
): void {
  const trackLen = 80 * zoom;
  const numSleepers = 8;

  // Track isometric helper
  const trackIso = (x: number, y: number, offset: number) => ({
    x: x + offset,
    y: y + offset * 0.5,
  });

  // Sleepers (ties)
  ctx.fillStyle = tower.level >= 4 && tower.upgrade === "A" ? "#5a4a3a" : "#4a3a2a";
  for (let i = 0; i < numSleepers; i++) {
    const t = i / (numSleepers - 1) - 0.5;
    const sleeperPos = trackIso(screenPos.x, screenPos.y - 5 * zoom, (t * trackLen) / zoom * 0.85);
    
    ctx.fillRect(
      sleeperPos.x - 12 * zoom,
      sleeperPos.y - 2 * zoom,
      24 * zoom,
      4 * zoom
    );
  }

  // Rails
  const railOffsets = [-8, 8];
  ctx.strokeStyle = tower.level >= 4 && tower.upgrade === "A" ? "#c9a227" : "#6a6a72";
  ctx.lineWidth = 3 * zoom;
  ctx.lineCap = "round";

  for (const railOff of railOffsets) {
    const start = trackIso(screenPos.x, screenPos.y - 5 * zoom, (-trackLen / zoom) * 0.4);
    const end = trackIso(screenPos.x, screenPos.y - 5 * zoom, (trackLen / zoom) * 0.4);

    ctx.beginPath();
    ctx.moveTo(start.x + railOff * zoom * 0.5, start.y + railOff * zoom * 0.25 - 1 * zoom);
    ctx.lineTo(end.x + railOff * zoom * 0.5, end.y + railOff * zoom * 0.25 - 1 * zoom);
    ctx.stroke();
  }
}

// ============================================================================
// BUILDING VARIANTS
// ============================================================================

function renderBarracks(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  const bX = screenPos.x - 16 * zoom;
  const bY = screenPos.y - 8 * zoom;

  // Foundation
  drawIsometricPrism(ctx, bX, bY + 6 * zoom, 36, 30, 6, {
    top: "#5a5a5a",
    left: "#4a4a4a",
    right: "#3a3a3a",
  }, zoom);

  // Main building
  drawIsometricPrism(ctx, bX, bY, 32, 26, 28, {
    top: "#9b8365",
    left: "#7b6345",
    right: "#5b4325",
  }, zoom);

  // Roof
  const roofY = bY - 28 * zoom;
  ctx.fillStyle = "#6a5a3a";
  ctx.beginPath();
  ctx.moveTo(bX, roofY - 16 * zoom);
  ctx.lineTo(bX - 18 * zoom, roofY);
  ctx.lineTo(bX, roofY + 8 * zoom);
  ctx.lineTo(bX + 18 * zoom, roofY);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = "#4a3215";
  ctx.fillRect(bX - 8 * zoom, bY - 16 * zoom, 10 * zoom, 16 * zoom);

  // Window glow
  const glow = 0.5 + Math.sin(time * 2) * 0.2;
  ctx.fillStyle = `rgba(255, 200, 100, ${glow})`;
  ctx.fillRect(bX + 5 * zoom, bY - 18 * zoom, 6 * zoom, 8 * zoom);

  // Sign
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(bX - 18 * zoom, roofY + 6 * zoom, 24 * zoom, 10 * zoom);
  ctx.fillStyle = "#e06000";
  ctx.font = `bold ${5 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("BARRACKS", bX - 6 * zoom, roofY + 13 * zoom);
}

function renderGarrison(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  const bX = screenPos.x - 16 * zoom;
  const bY = screenPos.y - 8 * zoom;

  // Foundation
  drawIsometricPrism(ctx, bX, bY + 8 * zoom, 40, 34, 8, {
    top: "#5a5a62",
    left: "#4a4a52",
    right: "#3a3a42",
  }, zoom);

  // Stone building
  drawIsometricPrism(ctx, bX, bY, 36, 30, 36, {
    top: "#7a7a82",
    left: "#5a5a62",
    right: "#4a4a52",
  }, zoom);

  // Crenellations
  const topY = bY - 36 * zoom;
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 4; i++) {
    const cx = bX - 14 * zoom + i * 8 * zoom;
    ctx.fillRect(cx, topY - 6 * zoom, 4 * zoom, 6 * zoom);
  }

  // Flag
  ctx.fillStyle = "#3a3a42";
  ctx.fillRect(bX + 12 * zoom, topY - 20 * zoom, 2 * zoom, 20 * zoom);
  ctx.fillStyle = "#e06000";
  const flagWave = Math.sin(time * 3) * 2;
  ctx.beginPath();
  ctx.moveTo(bX + 14 * zoom, topY - 20 * zoom);
  ctx.quadraticCurveTo(bX + 22 * zoom + flagWave, topY - 16 * zoom, bX + 14 * zoom, topY - 12 * zoom);
  ctx.fill();

  // Sign
  ctx.fillStyle = "#4a4a52";
  ctx.fillRect(bX - 14 * zoom, topY + 10 * zoom, 20 * zoom, 8 * zoom);
  ctx.fillStyle = "#e06000";
  ctx.font = `bold ${5 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("GARRISON", bX - 4 * zoom, topY + 16 * zoom);
}

function renderFortress(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  const bX = screenPos.x - 16 * zoom;
  const bY = screenPos.y - 8 * zoom;

  // Large foundation
  drawIsometricPrism(ctx, bX, bY + 10 * zoom, 44, 38, 10, {
    top: "#5a5a62",
    left: "#4a4a52",
    right: "#3a3a42",
  }, zoom);

  // Main fortress
  drawIsometricPrism(ctx, bX, bY, 40, 34, 44, {
    top: "#6a6a72",
    left: "#5a5a62",
    right: "#4a4a52",
  }, zoom);

  // Tower
  const towerX = bX + 14 * zoom;
  drawIsometricPrism(ctx, towerX, bY - 20 * zoom, 12, 12, 30, {
    top: "#7a7a82",
    left: "#5a5a62",
    right: "#4a4a52",
  }, zoom);

  // Tower crenellations
  const towerTopY = bY - 50 * zoom;
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const cx = towerX + Math.cos(angle) * 5 * zoom;
    const cy = towerTopY + Math.sin(angle) * 2.5 * zoom;
    ctx.fillRect(cx - 2 * zoom, cy - 4 * zoom, 4 * zoom, 4 * zoom);
  }

  // Beacon fire
  const firePulse = 0.6 + Math.sin(time * 5) * 0.4;
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 15 * zoom;
  ctx.fillStyle = `rgba(255, 150, 50, ${firePulse})`;
  ctx.beginPath();
  ctx.arc(towerX, towerTopY - 8 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Gate
  ctx.fillStyle = "#3a3a42";
  ctx.fillRect(bX - 10 * zoom, bY - 20 * zoom, 14 * zoom, 20 * zoom);
  
  // Portcullis pattern
  ctx.strokeStyle = "#2a2a32";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(bX - 8 * zoom + i * 4 * zoom, bY - 20 * zoom);
    ctx.lineTo(bX - 8 * zoom + i * 4 * zoom, bY);
    ctx.stroke();
  }

  // Sign
  ctx.fillStyle = "#e06000";
  ctx.font = `bold ${6 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("FORTRESS", bX - 3 * zoom, bY - 46 * zoom);
}

function renderCentaurStables(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  const bX = screenPos.x - 16 * zoom;
  const bY = screenPos.y - 8 * zoom;

  // Stable building
  drawIsometricPrism(ctx, bX, bY + 8 * zoom, 46, 40, 8, {
    top: "#6a5a4a",
    left: "#5a4a3a",
    right: "#4a3a2a",
  }, zoom);

  drawIsometricPrism(ctx, bX, bY, 42, 36, 40, {
    top: "#8b7355",
    left: "#6b5335",
    right: "#4b3315",
  }, zoom);

  // Horse head decoration
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(bX + 15 * zoom, bY - 45 * zoom, 8 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(bX + 17 * zoom, bY - 46 * zoom, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Hay bales
  ctx.fillStyle = "#daa520";
  ctx.fillRect(bX - 18 * zoom, bY - 5 * zoom, 8 * zoom, 6 * zoom);
  ctx.fillRect(bX + 14 * zoom, bY - 5 * zoom, 8 * zoom, 6 * zoom);

  // Sign
  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(bX - 16 * zoom, bY - 52 * zoom, 28 * zoom, 10 * zoom);
  ctx.fillStyle = "#c9a227";
  ctx.font = `bold ${5 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("STABLES", bX - 2 * zoom, bY - 45 * zoom);
}

function renderRoyalCavalry(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors
): void {
  const bX = screenPos.x - 16 * zoom;
  const bY = screenPos.y - 8 * zoom;

  // Grand building
  drawIsometricPrism(ctx, bX, bY + 10 * zoom, 48, 42, 10, {
    top: "#5a5a62",
    left: "#4a4a52",
    right: "#3a3a42",
  }, zoom);

  drawIsometricPrism(ctx, bX, bY, 44, 38, 48, {
    top: "#7a7a82",
    left: "#5a5a62",
    right: "#4a4a52",
  }, zoom);

  // Royal banner
  ctx.fillStyle = "#3a3a42";
  ctx.fillRect(bX, bY - 58 * zoom, 3 * zoom, 25 * zoom);

  const bannerWave = Math.sin(time * 3) * 3;
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(bX + 3 * zoom, bY - 58 * zoom);
  ctx.quadraticCurveTo(bX + 18 * zoom + bannerWave, bY - 50 * zoom, bX + 3 * zoom, bY - 42 * zoom);
  ctx.fill();

  // Crown emblem
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(bX + 8 * zoom, bY - 52 * zoom);
  ctx.lineTo(bX + 6 * zoom, bY - 48 * zoom);
  ctx.lineTo(bX + 10 * zoom, bY - 48 * zoom);
  ctx.closePath();
  ctx.fill();

  // Armor stands
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.ellipse(bX - 12 * zoom, bY - 10 * zoom, 4 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bX + 16 * zoom, bY - 10 * zoom, 4 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sign
  ctx.fillStyle = "#dc2626";
  ctx.font = `bold ${5 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ROYAL CAVALRY", bX - 2 * zoom, bY - 60 * zoom);
}

// ============================================================================
// TRAIN RENDERING
// ============================================================================

function renderTrain(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number
): void {
  const progress = tower.trainAnimProgress || 0;
  const trackLen = 80 * zoom;

  // Train position along track
  let trainOffset: number;
  if (tower.trainArriving) {
    trainOffset = -trackLen * 0.6 + progress * trackLen * 0.6;
  } else if (tower.trainDeparting) {
    trainOffset = progress * trackLen * 0.6;
  } else {
    trainOffset = 0;
  }

  const trainX = screenPos.x + trainOffset;
  const trainY = screenPos.y - 8 * zoom + trainOffset * 0.5;

  // Train body
  ctx.fillStyle = "#4a4a52";
  ctx.fillRect(trainX - 15 * zoom, trainY - 18 * zoom, 30 * zoom, 14 * zoom);

  // Cabin
  ctx.fillStyle = "#e06000";
  ctx.fillRect(trainX + 5 * zoom, trainY - 24 * zoom, 10 * zoom, 10 * zoom);

  // Wheels
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(trainX - 8 * zoom, trainY - 4 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(trainX + 8 * zoom, trainY - 4 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Smokestack
  ctx.fillStyle = "#3a3a42";
  ctx.fillRect(trainX - 10 * zoom, trainY - 28 * zoom, 6 * zoom, 10 * zoom);

  // Steam
  if (tower.trainArriving || tower.trainDeparting) {
    const steamAlpha = 0.4 + Math.sin(time * 8) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${steamAlpha})`;
    for (let i = 0; i < 3; i++) {
      const puffOffset = (time * 3 + i * 0.3) % 1;
      const puffX = trainX - 7 * zoom + Math.sin(time * 5 + i) * 3;
      const puffY = trainY - 30 * zoom - puffOffset * 15 * zoom;
      const puffSize = (3 + puffOffset * 4) * zoom;
      ctx.beginPath();
      ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
