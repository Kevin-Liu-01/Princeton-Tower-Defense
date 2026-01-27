// Princeton Tower Defense - Enemy Rendering Module
// Renders all enemy types with unique visual designs

import type { Enemy, Position } from "../../types";
import { ENEMY_DATA } from "../../constants";
import { getEnemyPosition, worldToScreen } from "../../utils";
import { lightenColor, darkenColor, drawHealthBar } from "../helpers";

// ============================================================================
// MAIN ENEMY RENDER FUNCTION
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
): void {
  const enemyData = ENEMY_DATA[enemy.type];
  if (!enemyData) return;

  const pathKey = enemy.pathKey || selectedMap;
  const worldPos = getEnemyPosition(enemy, pathKey);
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

  // Spawn animation
  const spawnScale = Math.min(1, enemy.spawnProgress);
  const size = enemyData.size * zoom * spawnScale;

  ctx.save();

  // Flying enemies float
  let floatOffset = 0;
  if (enemyData.flying) {
    floatOffset = Math.sin(time * 3 + enemy.pathIndex) * 5 * zoom;
  }

  // Shadow
  ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * spawnScale})`;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 5 * zoom + floatOffset * 0.2,
    size * 0.8,
    size * 0.4,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Slow effect indicator
  if (enemy.slowEffect > 0 || enemy.slowed) {
    ctx.strokeStyle = `rgba(100, 150, 255, ${0.3 + enemy.slowEffect * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - floatOffset,
      size * 1.2,
      size * 0.6,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Frozen effect
  if (enemy.frozen) {
    ctx.fillStyle = "rgba(150, 200, 255, 0.4)";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - floatOffset,
      size * 1.3,
      size * 0.7,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Burning effect
  if (enemy.burning) {
    const fireAlpha = 0.4 + Math.sin(time * 10) * 0.2;
    ctx.fillStyle = `rgba(255, 100, 0, ${fireAlpha})`;
    ctx.beginPath();
    ctx.arc(
      screenPos.x + (Math.random() - 0.5) * size * 0.3,
      screenPos.y - floatOffset - size * 0.5 + (Math.random() - 0.5) * size * 0.3,
      size * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Gold aura effect (Gold Rush spell) - Floating coins
  if (enemy.goldAura) {
    // Draw floating coins orbiting around the enemy
    for (let i = 0; i < 5; i++) {
      const coinAngle = time * 2.5 + (i * Math.PI * 2 / 5);
      const coinOrbitX = Math.cos(coinAngle) * size * 1.3;
      const coinOrbitY = Math.sin(coinAngle) * size * 0.65; // Flattened for isometric
      const coinFloat = Math.sin(time * 4 + i * 1.2) * 4 * zoom; // Bobbing motion
      const coinX = screenPos.x + coinOrbitX;
      const coinY = screenPos.y - floatOffset + coinOrbitY - 8 * zoom + coinFloat;
      const coinSize = 4 * zoom;
      
      // Coin body (gold)
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.ellipse(coinX, coinY, coinSize, coinSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Coin highlight
      ctx.fillStyle = "#fff8dc";
      ctx.beginPath();
      ctx.ellipse(coinX - coinSize * 0.2, coinY - coinSize * 0.15, coinSize * 0.4, coinSize * 0.25, -0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Coin edge/shadow
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(coinX, coinY, coinSize, coinSize * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Soft golden glow underneath
    const glowAlpha = 0.2 + Math.sin(time * 3) * 0.1;
    ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - floatOffset,
      size * 1.2,
      size * 0.6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Draw enemy sprite
  const flash = enemy.damageFlash;
  drawEnemySprite(
    ctx,
    screenPos.x,
    screenPos.y - floatOffset,
    size,
    enemy.type,
    enemyData.color,
    flash,
    time,
    enemyData.flying,
    zoom
  );

  // Health bar
  if (enemy.hp < enemy.maxHp) {
    const hpPercent = enemy.hp / enemy.maxHp;
    drawHealthBar(
      ctx,
      screenPos.x,
      screenPos.y - floatOffset - size - 8 * zoom,
      24,
      4,
      hpPercent,
      zoom,
      true // enemies have red health bars
    );
  }

  // Combat indicator
  if (enemy.inCombat) {
    ctx.fillStyle = `rgba(255, 50, 50, ${0.5 + Math.sin(time * 6) * 0.3})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y - floatOffset - size - 15 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// ENEMY SPRITE DRAWING
// ============================================================================

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
): void {
  const bodyColor = flash > 0 ? lightenColor(color, flash * 100) : color;
  const bodyColorDark = darkenColor(bodyColor, 30);
  const bodyColorLight = lightenColor(bodyColor, 20);

  // Default enemy shape (can be extended with type-specific rendering)
  ctx.save();

  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.8, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Darker bottom
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1, size * 0.7, size * 0.35, 0, 0, Math.PI);
  ctx.fill();

  // Highlight
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.2, y - size * 0.2, size * 0.3, size * 0.15, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.25, y - size * 0.1, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y - size * 0.1, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x - size * 0.22, y - size * 0.08, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.28, y - size * 0.08, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Type-specific additions
  if (isFlying) {
    // Wings
    const wingFlap = Math.sin(time * 12) * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, 0.6)`;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.6, y - size * 0.2, size * 0.4, size * 0.2 + wingFlap * size, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.6, y - size * 0.2, size * 0.4, size * 0.2 + wingFlap * size, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boss crown (for special enemies)
  if (type === "trustee" || type === "dean" || type === "golem" || type === "shadow_knight") {
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.6);
    ctx.lineTo(x - size * 0.3, y - size * 0.3);
    ctx.lineTo(x - size * 0.15, y - size * 0.4);
    ctx.lineTo(x, y - size * 0.5);
    ctx.lineTo(x + size * 0.15, y - size * 0.4);
    ctx.lineTo(x + size * 0.3, y - size * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // Ranged indicator (staff/bow)
  if (type === "archer" || type === "mage" || type === "warlock" || type === "hexer") {
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.3, y);
    ctx.lineTo(x + size * 0.7, y - size * 0.3);
    ctx.stroke();
  }

  ctx.restore();
}
