// Princeton Tower Defense - Cannon Tower Rendering
// High-tech mechanical artillery platform

import type { Tower, Enemy, Position, TowerColors } from "../../types";
import { gridToWorld, worldToScreen, distance } from "../../utils";
import { getEnemyPosition } from "../../utils";
import {
  drawIsometricPrism,
  drawGear,
  drawSteamVent,
  drawEnergyTube,
  drawWarningLight,
  lightenColor,
  darkenColor,
} from "../helpers";
import { drawMechanicalTowerBase } from "./towerBase";

// ============================================================================
// CANNON TOWER MAIN RENDER
// ============================================================================

export function renderCannonTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: TowerColors,
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
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
  ctx.ellipse(screenPos.x, topY + 2 * zoom, baseWidth * 0.5 * zoom, baseWidth * 0.25 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing tech ring
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.strokeStyle = `rgba(255, 102, 0, ${pulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, topY + 2 * zoom, baseWidth * 0.45 * zoom, baseWidth * 0.22 * zoom, 0, 0, Math.PI * 2);
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

// ============================================================================
// STANDARD CANNON (Level 1-2)
// ============================================================================

function renderStandardCannon(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number
): void {
  const level = tower.level;
  const rotation = tower.rotation || 0;
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // Turret housing
  const turretRadius = (8 + level * 2) * zoom;
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, topY - 8 * zoom, turretRadius, turretRadius * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Turret body
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, topY - 12 * zoom, turretRadius * 0.9, turretRadius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Barrel
  const barrelLength = (30 + level * 10) * zoom;
  const adjustedBarrelLength = barrelLength * (0.4 + foreshorten * 0.6);
  const barrelWidth = (4 + level) * zoom;

  ctx.save();
  ctx.translate(screenPos.x, topY - 12 * zoom);

  // Barrel shadow
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.moveTo(-barrelWidth, 2 * zoom);
  ctx.lineTo(cosR * adjustedBarrelLength - barrelWidth * 0.5, sinR * adjustedBarrelLength * 0.5 + 2 * zoom);
  ctx.lineTo(cosR * adjustedBarrelLength + barrelWidth * 0.5, sinR * adjustedBarrelLength * 0.5 + 2 * zoom);
  ctx.lineTo(barrelWidth, 2 * zoom);
  ctx.closePath();
  ctx.fill();

  // Main barrel
  const barrelGrad = ctx.createLinearGradient(
    -barrelWidth,
    0,
    cosR * adjustedBarrelLength,
    sinR * adjustedBarrelLength * 0.5
  );
  barrelGrad.addColorStop(0, "#5a5a62");
  barrelGrad.addColorStop(0.5, "#6a6a72");
  barrelGrad.addColorStop(1, "#4a4a52");

  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.moveTo(-barrelWidth, 0);
  ctx.lineTo(cosR * adjustedBarrelLength - barrelWidth * 0.5, sinR * adjustedBarrelLength * 0.5);
  ctx.lineTo(cosR * adjustedBarrelLength + barrelWidth * 0.5, sinR * adjustedBarrelLength * 0.5);
  ctx.lineTo(barrelWidth, 0);
  ctx.closePath();
  ctx.fill();

  // Barrel tip
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.arc(
    cosR * adjustedBarrelLength,
    sinR * adjustedBarrelLength * 0.5,
    barrelWidth * 1.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();

  // Muzzle flash effect (when recently fired)
  const timeSinceAttack = Date.now() - tower.lastAttack;
  if (timeSinceAttack < 150) {
    const flashIntensity = 1 - timeSinceAttack / 150;
    const flashX = screenPos.x + cosR * adjustedBarrelLength;
    const flashY = topY - 12 * zoom + sinR * adjustedBarrelLength * 0.5;

    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 20 * zoom * flashIntensity;
    ctx.fillStyle = `rgba(255, 200, 50, ${flashIntensity})`;
    ctx.beginPath();
    ctx.arc(flashX, flashY, 8 * zoom * flashIntensity, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ============================================================================
// HEAVY CANNON (Level 3)
// ============================================================================

function renderHeavyCannon(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number
): void {
  const rotation = tower.rotation || 0;
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // Reinforced turret base
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, topY - 5 * zoom, 14 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy turret body
  drawIsometricPrism(
    ctx,
    screenPos.x,
    topY - 10 * zoom,
    20,
    20,
    12,
    {
      top: "#6a6a72",
      left: "#5a5a62",
      right: "#4a4a52",
    },
    zoom
  );

  // Dual barrels
  const barrelLength = 50 * zoom;
  const adjustedBarrelLength = barrelLength * (0.4 + foreshorten * 0.6);
  const barrelWidth = 5 * zoom;
  const barrelSpacing = 4 * zoom;

  ctx.save();
  ctx.translate(screenPos.x, topY - 18 * zoom);

  // Draw two barrels
  for (let barrel = -1; barrel <= 1; barrel += 2) {
    const perpX = -sinR * barrelSpacing * barrel;
    const perpY = cosR * barrelSpacing * barrel * 0.5;

    // Barrel body
    ctx.fillStyle = "#5a5a62";
    ctx.beginPath();
    ctx.moveTo(perpX - barrelWidth * 0.5, perpY);
    ctx.lineTo(perpX + cosR * adjustedBarrelLength - barrelWidth * 0.3, perpY + sinR * adjustedBarrelLength * 0.5);
    ctx.lineTo(perpX + cosR * adjustedBarrelLength + barrelWidth * 0.3, perpY + sinR * adjustedBarrelLength * 0.5);
    ctx.lineTo(perpX + barrelWidth * 0.5, perpY);
    ctx.closePath();
    ctx.fill();

    // Barrel tip
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.arc(
      perpX + cosR * adjustedBarrelLength,
      perpY + sinR * adjustedBarrelLength * 0.5,
      barrelWidth * 0.8,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();

  // Stabilizer fins
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 12 * zoom, topY - 22 * zoom);
  ctx.lineTo(screenPos.x - 16 * zoom, topY - 26 * zoom);
  ctx.lineTo(screenPos.x - 12 * zoom, topY - 26 * zoom);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(screenPos.x + 12 * zoom, topY - 22 * zoom);
  ctx.lineTo(screenPos.x + 16 * zoom, topY - 26 * zoom);
  ctx.lineTo(screenPos.x + 12 * zoom, topY - 26 * zoom);
  ctx.closePath();
  ctx.fill();

  // Muzzle flash
  const timeSinceAttack = Date.now() - tower.lastAttack;
  if (timeSinceAttack < 200) {
    const flashIntensity = 1 - timeSinceAttack / 200;
    for (let barrel = -1; barrel <= 1; barrel += 2) {
      const perpX = -sinR * barrelSpacing * barrel;
      const perpY = cosR * barrelSpacing * barrel * 0.5;
      const flashX = screenPos.x + perpX + cosR * adjustedBarrelLength;
      const flashY = topY - 18 * zoom + perpY + sinR * adjustedBarrelLength * 0.5;

      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 25 * zoom * flashIntensity;
      ctx.fillStyle = `rgba(255, 200, 50, ${flashIntensity})`;
      ctx.beginPath();
      ctx.arc(flashX, flashY, 10 * zoom * flashIntensity, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}

// ============================================================================
// GATLING GUN (Level 4A)
// ============================================================================

function renderGatlingGun(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number
): void {
  const rotation = tower.rotation || 0;
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // Heavy base mount
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, topY - 3 * zoom, 16 * zoom, 10 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rotating housing
  const spinSpeed = 8;
  const barrelSpin = time * spinSpeed;

  ctx.save();
  ctx.translate(screenPos.x, topY - 15 * zoom);

  // Housing body
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.ellipse(0, 0, 10 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Multiple rotating barrels
  const numBarrels = 6;
  const barrelLength = 45 * zoom;
  const adjustedBarrelLength = barrelLength * (0.4 + foreshorten * 0.6);
  const barrelRadius = 6 * zoom;

  for (let i = 0; i < numBarrels; i++) {
    const barrelAngle = (i / numBarrels) * Math.PI * 2 + barrelSpin;
    const offsetX = Math.cos(barrelAngle) * barrelRadius;
    const offsetY = Math.sin(barrelAngle) * barrelRadius * 0.5;

    // Barrel
    ctx.fillStyle = i % 2 === 0 ? "#6a6a72" : "#5a5a62";
    ctx.beginPath();
    ctx.moveTo(offsetX - 2 * zoom, offsetY);
    ctx.lineTo(offsetX + cosR * adjustedBarrelLength - 1 * zoom, offsetY + sinR * adjustedBarrelLength * 0.5);
    ctx.lineTo(offsetX + cosR * adjustedBarrelLength + 1 * zoom, offsetY + sinR * adjustedBarrelLength * 0.5);
    ctx.lineTo(offsetX + 2 * zoom, offsetY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // Muzzle flash (rapid fire effect)
  const timeSinceAttack = Date.now() - tower.lastAttack;
  if (timeSinceAttack < 80) {
    const flashIntensity = 1 - timeSinceAttack / 80;
    const flashX = screenPos.x + cosR * adjustedBarrelLength;
    const flashY = topY - 15 * zoom + sinR * adjustedBarrelLength * 0.5;

    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 15 * zoom * flashIntensity;
    ctx.fillStyle = `rgba(255, 220, 100, ${flashIntensity})`;
    ctx.beginPath();
    ctx.arc(flashX, flashY, 6 * zoom * flashIntensity, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Ammo belt
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 15 * zoom, topY - 5 * zoom);
  ctx.quadraticCurveTo(
    screenPos.x - 20 * zoom,
    topY + 10 * zoom,
    screenPos.x - 10 * zoom,
    topY + 15 * zoom
  );
  ctx.stroke();

  // Ammo box
  ctx.fillStyle = "#4a4a52";
  ctx.fillRect(screenPos.x - 18 * zoom, topY + 12 * zoom, 12 * zoom, 8 * zoom);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(screenPos.x - 16 * zoom, topY + 14 * zoom, 3 * zoom, 4 * zoom);
}

// ============================================================================
// FLAMETHROWER (Level 4B)
// ============================================================================

function renderFlamethrower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number
): void {
  const rotation = tower.rotation || 0;
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // Fuel tank base
  ctx.fillStyle = "#4a4a52";
  ctx.beginPath();
  ctx.ellipse(screenPos.x + 8 * zoom, topY - 5 * zoom, 10 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tank body
  drawIsometricPrism(
    ctx,
    screenPos.x + 8 * zoom,
    topY - 10 * zoom,
    16,
    12,
    20,
    {
      top: "#ef4444",
      left: "#dc2626",
      right: "#b91c1c",
    },
    zoom
  );

  // Warning stripes
  ctx.fillStyle = "#1a1a1a";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(
      screenPos.x + 2 * zoom,
      topY - 8 * zoom - i * 6 * zoom,
      12 * zoom,
      2 * zoom
    );
  }

  // Nozzle housing
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(screenPos.x - 5 * zoom, topY - 15 * zoom, 8 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nozzle barrel
  const nozzleLength = 35 * zoom;
  const adjustedNozzleLength = nozzleLength * (0.4 + foreshorten * 0.6);

  ctx.save();
  ctx.translate(screenPos.x - 5 * zoom, topY - 15 * zoom);

  // Wide nozzle
  ctx.fillStyle = "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(-4 * zoom, 0);
  ctx.lineTo(cosR * adjustedNozzleLength - 6 * zoom, sinR * adjustedNozzleLength * 0.5);
  ctx.lineTo(cosR * adjustedNozzleLength + 6 * zoom, sinR * adjustedNozzleLength * 0.5);
  ctx.lineTo(4 * zoom, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Pilot light
  const pilotFlicker = 0.7 + Math.sin(time * 15) * 0.3;
  ctx.fillStyle = `rgba(100, 200, 255, ${pilotFlicker})`;
  ctx.beginPath();
  ctx.arc(
    screenPos.x - 5 * zoom + cosR * 8 * zoom,
    topY - 15 * zoom + sinR * 4 * zoom,
    2 * zoom,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Flame effect (when firing)
  const timeSinceAttack = Date.now() - tower.lastAttack;
  if (timeSinceAttack < 200) {
    const flameIntensity = 1 - timeSinceAttack / 200;
    const flameX = screenPos.x - 5 * zoom + cosR * adjustedNozzleLength;
    const flameY = topY - 15 * zoom + sinR * adjustedNozzleLength * 0.5;

    // Multi-layered flame
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 30 * zoom * flameIntensity;

    // Outer flame
    const outerGrad = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, 25 * zoom);
    outerGrad.addColorStop(0, `rgba(255, 100, 0, ${flameIntensity * 0.8})`);
    outerGrad.addColorStop(0.5, `rgba(255, 50, 0, ${flameIntensity * 0.5})`);
    outerGrad.addColorStop(1, "rgba(100, 0, 0, 0)");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(flameX, flameY, 25 * zoom * flameIntensity, 0, Math.PI * 2);
    ctx.fill();

    // Inner flame
    const innerGrad = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, 15 * zoom);
    innerGrad.addColorStop(0, `rgba(255, 255, 100, ${flameIntensity})`);
    innerGrad.addColorStop(0.5, `rgba(255, 200, 50, ${flameIntensity * 0.8})`);
    innerGrad.addColorStop(1, "rgba(255, 100, 0, 0)");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(flameX, flameY, 15 * zoom * flameIntensity, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  // Fuel gauge
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(screenPos.x + 14 * zoom, topY - 25 * zoom, 4 * zoom, 12 * zoom);
  const fuelLevel = 0.6 + Math.sin(time * 0.5) * 0.1;
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(
    screenPos.x + 14 * zoom,
    topY - 25 * zoom + (1 - fuelLevel) * 12 * zoom,
    4 * zoom,
    fuelLevel * 12 * zoom
  );
}
