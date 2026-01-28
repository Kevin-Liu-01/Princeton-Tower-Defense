// Princeton Tower Defense - Enemy Rendering Module
// Renders all enemy types with unique visual designs

import type { Enemy, Position } from "../../types";
import { ENEMY_DATA } from "../../constants";
import { worldToScreen, getEnemyPosition, lightenColor, darkenColor } from "../../utils";

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
  // Use enemy's pathKey for dual-path support
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

  // PERFORMANCE OPTIMIZED: Removed expensive shadowBlur for status effects
  // Instead, we use colored outlines/overlays which are much cheaper

  const flashIntensity = enemy.damageFlash > 0 ? enemy.damageFlash / 200 : 0;

  // Calculate attack phase for animation (smooth 1-0 based on attack timing)
  // Check BOTH lastTroopAttack AND lastHeroAttack - use whichever is more recent
  const attackDuration = 450; // ms for attack animation
  const lastAttackTime = Math.max(enemy.lastTroopAttack || 0, enemy.lastHeroAttack || 0);
  const timeSinceAttack = Date.now() - lastAttackTime;
  // attackPhase goes from 1.0 (just attacked) down to 0 (animation done)
  const attackPhase = timeSinceAttack < attackDuration 
    ? 1 - (timeSinceAttack / attackDuration)
    : 0;

  // ATTACK RESIZE EFFECT - Subtle scale pulse during attack
  const attackScalePulse = attackPhase > 0 
    ? 1 + Math.sin(attackPhase * Math.PI) * 0.12 // Subtle 12% scale up at peak
    : 1;
  
  // Apply scale transform for the enemy sprite
  ctx.save();
  ctx.translate(screenPos.x, drawY);
  ctx.scale(attackScalePulse, attackScalePulse);
  ctx.translate(-screenPos.x, -drawY);

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
    zoom,
    attackPhase
  );

  // ATTACK ANIMATION EFFECTS - Subtle, elegant red visual feedback
  if (attackPhase > 0) {
    const attackPulse = Math.sin(attackPhase * Math.PI); // Peaks in middle
    const attackEase = 1 - Math.pow(1 - attackPhase, 2); // Ease out curve
    
    // Soft outer aura ring - fades outward (red)
    const ringExpand = (1 - attackPhase) * 0.4;
    ctx.strokeStyle = `rgba(255, 80, 80, ${attackPhase * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, drawY, size * (0.7 + ringExpand), 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner soft glow - red tones
    const glowGrad = ctx.createRadialGradient(
      screenPos.x, drawY - size * 0.1, 0, 
      screenPos.x, drawY, size * 0.65
    );
    glowGrad.addColorStop(0, `rgba(255, 100, 100, ${attackPulse * 0.25})`);
    glowGrad.addColorStop(0.4, `rgba(220, 60, 60, ${attackPulse * 0.15})`);
    glowGrad.addColorStop(1, `rgba(180, 40, 40, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.65, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Motion lines - red speed streaks
    ctx.lineCap = "round";
    const streakCount = 3;
    for (let i = 0; i < streakCount; i++) {
      const baseAngle = -Math.PI * 0.3 + (i / (streakCount - 1)) * Math.PI * 0.6;
      const streakAlpha = attackEase * 0.4 * (1 - Math.abs(i - 1) * 0.2);
      const streakLen = size * (0.25 + attackPulse * 0.15);
      const startDist = size * 0.55;
      
      // Create gradient for each streak
      const sx = screenPos.x + Math.cos(baseAngle) * startDist;
      const sy = drawY + Math.sin(baseAngle) * startDist * 0.5;
      const ex = screenPos.x + Math.cos(baseAngle) * (startDist + streakLen);
      const ey = drawY + Math.sin(baseAngle) * (startDist + streakLen) * 0.5;
      
      ctx.strokeStyle = `rgba(255, 120, 120, ${streakAlpha})`;
      ctx.lineWidth = (2.5 - i * 0.3) * zoom;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    
    // Small impact particles - only at attack start (first 30%)
    if (attackPhase > 0.7) {
      const burstPhase = (attackPhase - 0.7) / 0.3;
      const particleCount = 5;
      for (let i = 0; i < particleCount; i++) {
        const pAngle = (i / particleCount) * Math.PI * 2 + Math.PI * 0.1;
        const pDist = size * (0.35 + burstPhase * 0.25);
        const pAlpha = burstPhase * 0.55 * (1 - burstPhase * 0.3);
        const pSize = size * 0.025 * (1 + burstPhase * 0.5);
        
        ctx.fillStyle = `rgba(255, 100, 100, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(pAngle) * pDist,
          drawY + Math.sin(pAngle) * pDist * 0.5,
          pSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    
    // Ground impact indicator - subtle red arc beneath enemy
    if (attackPulse > 0.3) {
      const impactAlpha = (attackPulse - 0.3) * 0.35;
      ctx.strokeStyle = `rgba(180, 50, 50, ${impactAlpha})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x, 
        drawY + size * 0.4, 
        size * (0.4 + attackPulse * 0.15), 
        size * 0.1,
        0, 
        0.1 * Math.PI, 
        0.9 * Math.PI
      );
      ctx.stroke();
    }
  }
  
  // Restore canvas state after attack scale transform
  ctx.restore();

  // FROZEN EFFECT - Detailed ice crystals and frost
  if (enemy.frozen) {
    // Frost aura base - layered for depth
    ctx.fillStyle = "rgba(180, 230, 255, 0.25)";
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.9, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(150, 210, 255, 0.35)";
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.7, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Icy crystalline border
    ctx.strokeStyle = "rgba(100, 200, 255, 0.9)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.setLineDash([4 * zoom, 3 * zoom]);
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.8, size * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5 detailed ice crystals orbiting slowly
    const crystalRotation = time * 0.5;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + crystalRotation;
      const dist = size * 0.55;
      const cx = screenPos.x + Math.cos(angle) * dist;
      const cy = drawY + Math.sin(angle) * dist * 0.5;
      const cSize = (3.5 + Math.sin(i * 1.3) * 1.5) * zoom;

      // Crystal body - hexagonal ice shard
      ctx.fillStyle = "rgba(220, 245, 255, 0.9)";
      ctx.beginPath();
      ctx.moveTo(cx, cy - cSize * 1.4);
      ctx.lineTo(cx + cSize * 0.6, cy - cSize * 0.4);
      ctx.lineTo(cx + cSize * 0.6, cy + cSize * 0.4);
      ctx.lineTo(cx, cy + cSize * 0.8);
      ctx.lineTo(cx - cSize * 0.6, cy + cSize * 0.4);
      ctx.lineTo(cx - cSize * 0.6, cy - cSize * 0.4);
      ctx.closePath();
      ctx.fill();

      // Crystal highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.moveTo(cx - cSize * 0.2, cy - cSize * 1.1);
      ctx.lineTo(cx + cSize * 0.15, cy - cSize * 0.3);
      ctx.lineTo(cx - cSize * 0.35, cy - cSize * 0.2);
      ctx.closePath();
      ctx.fill();
    }

    // Floating frost particles
    for (let i = 0; i < 4; i++) {
      const pAngle = time * 2 + i * 1.57;
      const pDist = size * (0.3 + Math.sin(time * 1.5 + i) * 0.15);
      const px = screenPos.x + Math.cos(pAngle) * pDist;
      const py = drawY - size * 0.3 + Math.sin(pAngle * 0.7) * size * 0.2;
      ctx.fillStyle = `rgba(200, 240, 255, ${0.6 + Math.sin(time * 3 + i) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // BURNING EFFECT - Detailed flames with embers
  if (enemy.burning) {
    // Heat shimmer ring at base
    ctx.strokeStyle = `rgba(255, 100, 0, ${0.3 + Math.sin(time * 8) * 0.15})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY + size * 0.1, size * 0.5, size * 0.25, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Main flames - layered teardrop shapes
    for (let i = 0; i < 4; i++) {
      const flameOffset = Math.sin(time * 6 + i * 1.8) * size * 0.15;
      const flameX = screenPos.x + flameOffset + (i - 1.5) * size * 0.12;
      const baseY = drawY - size * 0.15;
      const flameHeight = (size * 0.55 + Math.sin(time * 7 + i * 2) * size * 0.15) * zoom;
      const flameWidth = (size * 0.18 + Math.sin(time * 5 + i) * size * 0.04) * zoom;
      const flicker = Math.sin(time * 10 + i * 3) * 0.15;

      // Outer red flame
      ctx.fillStyle = `rgba(220, 60, 20, ${0.75 + flicker})`;
      ctx.beginPath();
      ctx.moveTo(flameX, baseY);
      ctx.quadraticCurveTo(flameX - flameWidth, baseY - flameHeight * 0.5, flameX, baseY - flameHeight);
      ctx.quadraticCurveTo(flameX + flameWidth, baseY - flameHeight * 0.5, flameX, baseY);
      ctx.fill();

      // Inner orange/yellow core
      ctx.fillStyle = `rgba(255, ${180 + Math.floor(Math.sin(time * 8 + i) * 40)}, 50, ${0.85 + flicker})`;
      ctx.beginPath();
      ctx.moveTo(flameX, baseY);
      ctx.quadraticCurveTo(flameX - flameWidth * 0.5, baseY - flameHeight * 0.4, flameX, baseY - flameHeight * 0.7);
      ctx.quadraticCurveTo(flameX + flameWidth * 0.5, baseY - flameHeight * 0.4, flameX, baseY);
      ctx.fill();
    }

    // Rising embers/sparks
    for (let i = 0; i < 5; i++) {
      const emberPhase = (time * 2.5 + i * 0.4) % 1;
      const emberX = screenPos.x + Math.sin(time * 3 + i * 2.2) * size * 0.3;
      const emberY = drawY - size * 0.2 - emberPhase * size * 0.8;
      const emberSize = (1.5 - emberPhase) * 2 * zoom;
      const emberAlpha = (1 - emberPhase) * 0.9;

      // Ember glow
      ctx.fillStyle = `rgba(255, ${200 - Math.floor(emberPhase * 100)}, ${100 - Math.floor(emberPhase * 80)}, ${emberAlpha})`;
      ctx.beginPath();
      ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // SLOWED EFFECT - Highly visible arcane magic circles
  if (
    enemy.slowed &&
    enemy.slowIntensity &&
    enemy.slowIntensity > 0 &&
    !enemy.frozen
  ) {
    const slowIntensity = Math.max(0.6, enemy.slowIntensity); // Minimum visibility
    const pulseAlpha = 0.8 + Math.sin(time * 4) * 0.2;

    // Purple aura glow underneath for visibility
    ctx.fillStyle = `rgba(147, 51, 234, ${0.35 * slowIntensity})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.85, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer magic circle - thick rotating ring
    ctx.save();
    ctx.translate(screenPos.x, drawY);
    ctx.rotate(time * 0.8);
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.9 * slowIntensity * pulseAlpha})`;
    ctx.lineWidth = 3 * zoom;
    ctx.setLineDash([8 * zoom, 4 * zoom]);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.8, size * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Inner magic circle - solid bright ring
    ctx.strokeStyle = `rgba(216, 180, 254, ${0.95 * slowIntensity})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 6 bright rune markers rotating around
    for (let i = 0; i < 6; i++) {
      const runeAngle = time * 0.8 + (i / 6) * Math.PI * 2;
      const rx = screenPos.x + Math.cos(runeAngle) * size * 0.78;
      const ry = drawY + Math.sin(runeAngle) * size * 0.47;
      
      // Bright rune diamond
      ctx.fillStyle = `rgba(233, 213, 255, ${0.95 * slowIntensity})`;
      ctx.beginPath();
      const runeSize = 4.5 * zoom;
      ctx.moveTo(rx, ry - runeSize);
      ctx.lineTo(rx + runeSize * 0.7, ry);
      ctx.lineTo(rx, ry + runeSize);
      ctx.lineTo(rx - runeSize * 0.7, ry);
      ctx.closePath();
      ctx.fill();
      
      // Rune outline for extra pop
      ctx.strokeStyle = `rgba(147, 51, 234, ${0.8 * slowIntensity})`;
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
    }

    // Bright floating particles
    for (let i = 0; i < 5; i++) {
      const pAngle = time * 2.5 + i * 1.26;
      const pDist = size * (0.4 + Math.sin(time * 1.8 + i) * 0.12);
      const px = screenPos.x + Math.cos(pAngle) * pDist;
      const py = drawY + Math.sin(pAngle) * pDist * 0.5 - size * 0.1;
      
      ctx.fillStyle = `rgba(216, 180, 254, ${0.9 * slowIntensity})`;
      ctx.beginPath();
      ctx.arc(px, py, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // STUNNED EFFECT - Orbiting stars with trails
  if (Date.now() < enemy.stunUntil && !enemy.frozen) {
    const orbitRadius = size * 0.5;
    
    // Draw 3 detailed stars orbiting
    for (let i = 0; i < 3; i++) {
      const baseAngle = time * 4 + (i / 3) * Math.PI * 2;
      
      // Star trail (3 fading copies behind)
      for (let t = 2; t >= 0; t--) {
        const trailAngle = baseAngle - t * 0.15;
        const trailAlpha = (1 - t * 0.3) * 0.5;
        const tx = screenPos.x + Math.cos(trailAngle) * orbitRadius * 0.7;
        const ty = drawY - size * 0.65 + Math.sin(trailAngle) * orbitRadius * 0.25;
        ctx.fillStyle = `rgba(255, 255, 100, ${trailAlpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, (2 - t * 0.4) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Main star position
      const sx = screenPos.x + Math.cos(baseAngle) * orbitRadius * 0.7;
      const sy = drawY - size * 0.65 + Math.sin(baseAngle) * orbitRadius * 0.25;
      const starSize = 4 * zoom;
      
      // 4-pointed star shape
      ctx.fillStyle = "rgba(255, 255, 150, 0.95)";
      ctx.beginPath();
      ctx.moveTo(sx, sy - starSize);
      ctx.lineTo(sx + starSize * 0.3, sy - starSize * 0.3);
      ctx.lineTo(sx + starSize, sy);
      ctx.lineTo(sx + starSize * 0.3, sy + starSize * 0.3);
      ctx.lineTo(sx, sy + starSize);
      ctx.lineTo(sx - starSize * 0.3, sy + starSize * 0.3);
      ctx.lineTo(sx - starSize, sy);
      ctx.lineTo(sx - starSize * 0.3, sy - starSize * 0.3);
      ctx.closePath();
      ctx.fill();
      
      // Star center highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(sx, sy, starSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // GOLD AURA EFFECT - Floating coins (Gold Rush spell)
  if (enemy.goldAura) {
    // Draw floating coins orbiting around the enemy
    for (let i = 0; i < 5; i++) {
      const coinAngle = time * 2.5 + (i * Math.PI * 2 / 5);
      const coinOrbitX = Math.cos(coinAngle) * size * 1.0;
      const coinOrbitY = Math.sin(coinAngle) * size * 0.5; // Flattened for isometric
      const coinFloat = Math.sin(time * 4 + i * 1.2) * 6 * zoom; // Bobbing motion
      const coinX = screenPos.x + coinOrbitX;
      const coinY = drawY + coinOrbitY - 10 * zoom + coinFloat;
      const coinSize = 5 * zoom;
      
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
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(coinX, coinY, coinSize, coinSize * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Dollar sign on coin
      ctx.fillStyle = "#b8860b";
      ctx.font = `bold ${coinSize * 0.8}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", coinX, coinY);
    }
    
    // Soft golden glow underneath
    const glowAlpha = 0.25 + Math.sin(time * 3) * 0.1;
    ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.9, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
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
    // Enemies have red health bars
    const hpColor =
      hpPercent > 0.5 ? "#ef4444" : hpPercent > 0.25 ? "#dc2626" : "#b91c1c";
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
  zoom: number,
  attackPhase: number = 0
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        isFlying,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
        zoom,
        attackPhase
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
  zoom: number,
  attackPhase: number = 0
) {
  // CORRUPTED NEOPHYTE - Possessed first-year consumed by eldritch knowledge
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const bobble = Math.sin(time * 6) * 2 * zoom + (isAttacking ? attackIntensity * size * 0.15 : 0);
  const pulseIntensity = 0.5 + Math.sin(time * 4) * 0.3 + attackIntensity * 0.3;
  const runeGlow = 0.6 + Math.sin(time * 5) * 0.4 + attackIntensity * 0.4;
  const corruptionPulse = 0.4 + Math.sin(time * 7) * 0.3 + attackIntensity * 0.3;
  const chainsRattle = Math.sin(time * 8) * size * 0.02 + (isAttacking ? Math.sin(attackPhase * Math.PI * 4) * size * 0.04 : 0);

  // Void distortion field
  ctx.strokeStyle = `rgba(0, 20, 0, ${pulseIntensity * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const distortPhase = (time * 0.8 + i * 0.3) % 2;
    const distortSize = size * 0.3 + distortPhase * size * 0.4;
    ctx.globalAlpha = 0.4 * (1 - distortPhase / 2);
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.15) {
      const r = distortSize + Math.sin(a * 5 + time * 4) * size * 0.04;
      const wx = x + Math.cos(a) * r;
      const wy = y + Math.sin(a) * r * 0.7;
      if (a === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Dark corruption aura with inner darkness
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
  auraGrad.addColorStop(0, `rgba(20, 80, 20, ${pulseIntensity * 0.35})`);
  auraGrad.addColorStop(0.3, `rgba(74, 222, 128, ${pulseIntensity * 0.2})`);
  auraGrad.addColorStop(0.6, `rgba(34, 197, 94, ${pulseIntensity * 0.1})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Floating corruption particles with trails
  for (let i = 0; i < 8; i++) {
    const particleAngle = time * 2 + i * Math.PI * 0.25;
    const particleDist = size * 0.45 + Math.sin(time * 3 + i) * size * 0.12;
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y - size * 0.1 + Math.sin(particleAngle) * particleDist * 0.4;
    // Trail
    ctx.strokeStyle = `rgba(74, 222, 128, ${0.2})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(particleAngle + Math.PI) * size * 0.08, py + Math.sin(particleAngle + Math.PI) * size * 0.04);
    ctx.stroke();
    // Particle core
    ctx.fillStyle = `rgba(74, 222, 128, ${0.5 + Math.sin(time * 5 + i) * 0.3})`;
    ctx.shadowColor = "#4ade80";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02 + Math.sin(time * 6 + i) * size * 0.008, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Eldritch tentacles emerging from ground
  ctx.strokeStyle = `rgba(30, 80, 30, ${corruptionPulse * 0.7})`;
  ctx.lineWidth = 3 * zoom;
  for (let i = 0; i < 4; i++) {
    const tentacleAngle = -Math.PI * 0.8 + i * Math.PI * 0.4 + Math.sin(time * 2) * 0.1;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(tentacleAngle) * size * 0.35, y + size * 0.48);
    ctx.quadraticCurveTo(
      x + Math.cos(tentacleAngle) * size * 0.45 + Math.sin(time * 3 + i) * size * 0.08,
      y + size * 0.25,
      x + Math.cos(tentacleAngle) * size * 0.3 + Math.sin(time * 4 + i) * size * 0.1,
      y + size * 0.1 + Math.sin(time * 5 + i) * size * 0.05
    );
    ctx.stroke();
    // Tentacle tip
    ctx.fillStyle = `rgba(74, 222, 128, ${corruptionPulse})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(tentacleAngle) * size * 0.3 + Math.sin(time * 4 + i) * size * 0.1,
      y + size * 0.1 + Math.sin(time * 5 + i) * size * 0.05,
      size * 0.015,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Shadow beneath with corruption seepage
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.48, 0, x, y + size * 0.48, size * 0.35);
  shadowGrad.addColorStop(0, "rgba(20, 60, 20, 0.6)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.4)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floating forbidden tome (behind) - more ornate
  ctx.save();
  ctx.translate(x - size * 0.38, y - size * 0.15 + Math.sin(time * 3) * 4);
  ctx.rotate(Math.sin(time * 2) * 0.15);
  // Book shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(-size * 0.11, -size * 0.13, size * 0.24, size * 0.3);
  // Leather cover with metal corners
  ctx.fillStyle = "#0a1a0a";
  ctx.fillRect(-size * 0.13, -size * 0.16, size * 0.26, size * 0.32);
  ctx.fillStyle = "#1a2a1a";
  ctx.fillRect(-size * 0.11, -size * 0.14, size * 0.22, size * 0.28);
  // Metal corner plates
  ctx.fillStyle = "#3a5a3a";
  ctx.fillRect(-size * 0.13, -size * 0.16, size * 0.05, size * 0.05);
  ctx.fillRect(size * 0.08, -size * 0.16, size * 0.05, size * 0.05);
  ctx.fillRect(-size * 0.13, size * 0.11, size * 0.05, size * 0.05);
  ctx.fillRect(size * 0.08, size * 0.11, size * 0.05, size * 0.05);
  // Glowing pages with pulsing light
  ctx.fillStyle = `rgba(74, 222, 128, ${runeGlow * 0.4})`;
  ctx.fillRect(-size * 0.09, -size * 0.1, size * 0.18, size * 0.2);
  // Ancient eldritch runes
  ctx.fillStyle = `rgba(74, 222, 128, ${runeGlow})`;
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `${size * 0.07}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ᛟᚨᛏ", 0, -size * 0.02);
  ctx.fillText("ᚷᛁᚱ", 0, size * 0.06);
  ctx.shadowBlur = 0;
  // Floating pages
  for (let p = 0; p < 3; p++) {
    const pageAngle = time * 1.5 + p * Math.PI * 0.6;
    const pageX = Math.cos(pageAngle) * size * 0.15;
    const pageY = Math.sin(pageAngle) * size * 0.08 - size * 0.05;
    ctx.fillStyle = `rgba(200, 230, 200, ${0.4 + Math.sin(time * 4 + p) * 0.2})`;
    ctx.save();
    ctx.translate(pageX, pageY);
    ctx.rotate(Math.sin(time * 3 + p) * 0.3);
    ctx.fillRect(-size * 0.03, -size * 0.04, size * 0.06, size * 0.08);
    ctx.restore();
  }
  ctx.restore();

  // Ethereal chains binding the initiate
  ctx.strokeStyle = `rgba(74, 222, 128, ${corruptionPulse * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  for (let c = 0; c < 2; c++) {
    const chainSide = c === 0 ? -1 : 1;
    ctx.beginPath();
    for (let link = 0; link < 6; link++) {
      const linkX = x + chainSide * (size * 0.2 + link * size * 0.05) + chainsRattle * chainSide;
      const linkY = y - size * 0.1 + Math.sin(time * 4 + link * 0.5) * size * 0.02;
      ctx.arc(linkX, linkY, size * 0.015, 0, Math.PI * 2);
    }
    ctx.stroke();
  }

  // Tattered robes with corruption spreading
  const robeGrad = ctx.createLinearGradient(x - size * 0.35, y - size * 0.3, x + size * 0.35, y + size * 0.5);
  robeGrad.addColorStop(0, "#1a3a1a");
  robeGrad.addColorStop(0.2, "#2a5a2a");
  robeGrad.addColorStop(0.4, "#3a7a3a");
  robeGrad.addColorStop(0.6, "#4a9a4a");
  robeGrad.addColorStop(0.8, "#3a7a3a");
  robeGrad.addColorStop(1, "#1a3a1a");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.48);
  ctx.quadraticCurveTo(x - size * 0.42, y - size * 0.08, x - size * 0.18, y - size * 0.32);
  ctx.lineTo(x + size * 0.18, y - size * 0.32);
  ctx.quadraticCurveTo(x + size * 0.42, y - size * 0.08, x + size * 0.35, y + size * 0.48);
  // More dramatic tattered bottom
  for (let i = 0; i < 8; i++) {
    const jagX = x - size * 0.35 + i * size * 0.1;
    const jagY = y + size * 0.48 + Math.sin(time * 4 + i * 1.3) * size * 0.04 + (i % 2) * size * 0.06 + (i % 3) * size * 0.03;
    ctx.lineTo(jagX, jagY);
  }
  ctx.closePath();
  ctx.fill();

  // Corruption veins spreading across robe
  ctx.strokeStyle = `rgba(74, 222, 128, ${pulseIntensity * 0.7})`;
  ctx.lineWidth = 2 * zoom;
  for (let v = 0; v < 6; v++) {
    const veinStartX = x - size * 0.25 + v * size * 0.1;
    const veinStartY = y - size * 0.2 + Math.sin(v) * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(veinStartX, veinStartY);
    ctx.quadraticCurveTo(
      veinStartX + Math.sin(time * 2 + v) * size * 0.08,
      veinStartY + size * 0.15,
      veinStartX + Math.cos(v) * size * 0.1,
      y + size * 0.35
    );
    ctx.stroke();
    // Vein nodes
    ctx.fillStyle = `rgba(74, 222, 128, ${corruptionPulse})`;
    ctx.beginPath();
    ctx.arc(veinStartX + Math.cos(v) * size * 0.05, veinStartY + size * 0.1, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arcane symbols on robe
  ctx.fillStyle = `rgba(100, 255, 150, ${runeGlow * 0.6})`;
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⍟", x - size * 0.12, y + size * 0.05);
  ctx.fillText("◈", x + size * 0.12, y + size * 0.15);
  ctx.fillText("⌬", x, y + size * 0.28);

  // Hood casting deep shadow with corruption dripping
  ctx.fillStyle = "#0a1a0a";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.35 + bobble * 0.3, size * 0.28, size * 0.2, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.35 + bobble * 0.3);
  ctx.quadraticCurveTo(x - size * 0.34, y - size * 0.12, x - size * 0.26, y + size * 0.08);
  ctx.lineTo(x - size * 0.18, y - size * 0.18);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y - size * 0.35 + bobble * 0.3);
  ctx.quadraticCurveTo(x + size * 0.34, y - size * 0.12, x + size * 0.26, y + size * 0.08);
  ctx.lineTo(x + size * 0.18, y - size * 0.18);
  ctx.fill();

  // Face (pale, gaunt, corrupted)
  const faceGrad = ctx.createRadialGradient(x, y - size * 0.4 + bobble, 0, x, y - size * 0.4 + bobble, size * 0.22);
  faceGrad.addColorStop(0, "#d0f0d0");
  faceGrad.addColorStop(0.6, "#a8d8a8");
  faceGrad.addColorStop(1, "#80b080");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + bobble, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Corruption spreading across face
  ctx.strokeStyle = "#2a6a2a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.32 + bobble);
  ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.28 + bobble, x - size * 0.06, y - size * 0.24 + bobble);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.36 + bobble);
  ctx.quadraticCurveTo(x + size * 0.14, y - size * 0.3 + bobble, x + size * 0.1, y - size * 0.26 + bobble);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.54 + bobble);
  ctx.quadraticCurveTo(x + size * 0.04, y - size * 0.48 + bobble, x + size * 0.02, y - size * 0.42 + bobble);
  ctx.stroke();

  // Possessed glowing eyes with void pupils
  ctx.fillStyle = "#4ade80";
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.42 + bobble, size * 0.045, 0, Math.PI * 2);
  ctx.arc(x + size * 0.07, y - size * 0.42 + bobble, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Void center pupils
  ctx.fillStyle = "#001000";
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.42 + bobble, size * 0.018, 0, Math.PI * 2);
  ctx.arc(x + size * 0.07, y - size * 0.42 + bobble, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  // Eye reflection
  ctx.fillStyle = "rgba(200, 255, 200, 0.6)";
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.44 + bobble, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.44 + bobble, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Grimacing mouth with sharp fangs
  ctx.fillStyle = "#0a1a0a";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28 + bobble, size * 0.07, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  // Upper fangs
  ctx.fillStyle = "#e8f8e8";
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04 + f * size * 0.027, y - size * 0.29 + bobble);
    ctx.lineTo(x - size * 0.035 + f * size * 0.027, y - size * 0.24 + bobble);
    ctx.lineTo(x - size * 0.03 + f * size * 0.027, y - size * 0.29 + bobble);
    ctx.fill();
  }

  // Magical energy swirling from both hands
  for (let hand = 0; hand < 2; hand++) {
    const handX = x + (hand === 0 ? -1 : 1) * size * 0.28;
    const handY = y + size * 0.08;
    // Energy orb
    ctx.fillStyle = `rgba(74, 222, 128, ${pulseIntensity * 0.8})`;
    ctx.shadowColor = "#4ade80";
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.arc(handX, handY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Expanding rings
    ctx.strokeStyle = `rgba(74, 222, 128, ${pulseIntensity})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (time * 2.5 + ring * 0.25) % 1;
      ctx.globalAlpha = 1 - ringPhase;
      ctx.beginPath();
      ctx.arc(handX, handY, size * 0.04 + ringPhase * size * 0.18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Eldritch sigil above head
  ctx.save();
  ctx.translate(x, y - size * 0.65 + bobble + Math.sin(time * 2) * size * 0.02);
  ctx.rotate(time * 0.5);
  ctx.strokeStyle = `rgba(74, 222, 128, ${runeGlow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  // Inner triangle
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = i * Math.PI * 2 / 3 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(angle) * size * 0.05, Math.sin(angle) * size * 0.05);
    else ctx.lineTo(Math.cos(angle) * size * 0.05, Math.sin(angle) * size * 0.05);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
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
  zoom: number,
  attackPhase: number = 0
) {
  // STORM APPRENTICE - Arrogant spellcaster channeling tempest magic with crackling lightning
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const swagger = Math.sin(time * 5) * 3 * zoom + (isAttacking ? attackIntensity * size * 0.12 : 0);
  const magicPulse = 0.6 + Math.sin(time * 4) * 0.4 + attackIntensity * 0.4;
  const stormIntensity = 0.5 + Math.sin(time * 6) * 0.3 + attackIntensity * 0.5;
  const lightningFlash = (Math.random() > 0.95 || isAttacking) ? (isAttacking ? attackIntensity : 1) : 0;

  // Storm vortex aura
  ctx.save();
  for (let ring = 0; ring < 5; ring++) {
    const ringPhase = (time * 1.5 + ring * 0.3) % 2;
    const ringSize = size * 0.3 + ring * size * 0.12;
    ctx.strokeStyle = `rgba(96, 165, 250, ${(0.3 - ring * 0.05) * magicPulse})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, ringSize, time * 2 + ring, time * 2 + ring + Math.PI * 1.5);
    ctx.stroke();
  }
  ctx.restore();

  // Blue elemental aura with storm effects
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
  auraGrad.addColorStop(0, `rgba(59, 130, 246, ${magicPulse * 0.35})`);
  auraGrad.addColorStop(0.3, `rgba(96, 165, 250, ${magicPulse * 0.25})`);
  auraGrad.addColorStop(0.6, `rgba(147, 197, 253, ${magicPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Lightning bolts crackling around
  if (lightningFlash || Math.sin(time * 15) > 0.8) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    for (let bolt = 0; bolt < 2; bolt++) {
      const boltAngle = time * 3 + bolt * Math.PI;
      const startX = x + Math.cos(boltAngle) * size * 0.4;
      const startY = y - size * 0.3 + Math.sin(boltAngle) * size * 0.2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      let bx = startX, by = startY;
      for (let seg = 0; seg < 4; seg++) {
        bx += (Math.random() - 0.5) * size * 0.15;
        by += size * 0.08;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
  }

  // Floating arcane symbols with enhanced glow
  for (let i = 0; i < 6; i++) {
    const symbolAngle = time * 1.5 + i * Math.PI * 0.33;
    const symbolDist = size * 0.5 + Math.sin(time * 2 + i) * size * 0.05;
    const sx = x + Math.cos(symbolAngle) * symbolDist;
    const sy = y - size * 0.1 + Math.sin(symbolAngle) * symbolDist * 0.35;
    ctx.fillStyle = `rgba(147, 197, 253, ${0.5 + Math.sin(time * 4 + i) * 0.3})`;
    ctx.shadowColor = "#60a5fa";
    ctx.shadowBlur = 6 * zoom;
    ctx.font = `${size * 0.1}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["⚡", "◇", "△", "☆", "◈", "⍟"][i], sx, sy);
    ctx.shadowBlur = 0;
  }

  // Storm cloud wisps
  for (let w = 0; w < 4; w++) {
    const wispX = x + Math.sin(time * 1.5 + w * 1.5) * size * 0.35;
    const wispY = y - size * 0.5 + Math.cos(time * 1.2 + w) * size * 0.1;
    ctx.fillStyle = `rgba(100, 130, 170, ${0.3 + Math.sin(time * 3 + w) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(wispX, wispY, size * 0.08, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow with electrical discharge
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.48, 0, x, y + size * 0.48, size * 0.35);
  shadowGrad.addColorStop(0, "rgba(30, 58, 95, 0.5)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.35)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flowing apprentice robes with storm patterns
  const robeGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.3, x + size * 0.4, y + size * 0.5);
  robeGrad.addColorStop(0, "#0c1929");
  robeGrad.addColorStop(0.2, "#1e3a5f");
  robeGrad.addColorStop(0.4, "#2563eb");
  robeGrad.addColorStop(0.5, "#3b82f6");
  robeGrad.addColorStop(0.6, "#2563eb");
  robeGrad.addColorStop(0.8, "#1e3a5f");
  robeGrad.addColorStop(1, "#0c1929");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5);
  ctx.quadraticCurveTo(x - size * 0.44, y, x - size * 0.22, y - size * 0.32 + swagger * 0.2);
  ctx.lineTo(x + size * 0.22, y - size * 0.32 + swagger * 0.2);
  ctx.quadraticCurveTo(x + size * 0.44, y, x + size * 0.38, y + size * 0.5);
  // Dramatic flowing bottom
  for (let i = 0; i < 7; i++) {
    const waveX = x - size * 0.38 + i * size * 0.1267;
    const waveY = y + size * 0.5 + Math.sin(time * 4 + i) * size * 0.04 + (i % 2) * size * 0.03;
    ctx.lineTo(waveX, waveY);
  }
  ctx.closePath();
  ctx.fill();

  // Lightning patterns on robe
  ctx.strokeStyle = `rgba(147, 197, 253, ${stormIntensity * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let p = 0; p < 4; p++) {
    const startX = x - size * 0.2 + p * size * 0.13;
    ctx.beginPath();
    ctx.moveTo(startX, y - size * 0.15);
    let px = startX;
    for (let seg = 0; seg < 3; seg++) {
      px += (Math.random() - 0.5) * size * 0.06;
      ctx.lineTo(px, y + seg * size * 0.12);
    }
    ctx.stroke();
  }

  // Ornate silver trim with gems
  ctx.strokeStyle = "#e0e7ff";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.28 + swagger * 0.2);
  ctx.lineTo(x - size * 0.17, y + size * 0.38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.28 + swagger * 0.2);
  ctx.lineTo(x + size * 0.17, y + size * 0.38);
  ctx.stroke();
  // Gem on trim
  ctx.fillStyle = "#60a5fa";
  ctx.shadowColor = "#60a5fa";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.155, y + size * 0.1, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.155, y + size * 0.1, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Apprentice sash with arcane embroidery
  const sashGrad = ctx.createLinearGradient(x - size * 0.25, y - size * 0.1, x + size * 0.25, y);
  sashGrad.addColorStop(0, "#b8860b");
  sashGrad.addColorStop(0.5, "#fbbf24");
  sashGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = sashGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.12);
  ctx.quadraticCurveTo(x, y + size * 0.08, x + size * 0.28, y - size * 0.12);
  ctx.lineTo(x + size * 0.25, y + size * 0.02);
  ctx.quadraticCurveTo(x, y + size * 0.18, x - size * 0.25, y + size * 0.02);
  ctx.fill();
  // Sash emblem
  ctx.fillStyle = "#1e3a5f";
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⚡", x, y);

  // Confident face with magical features
  const faceGrad = ctx.createRadialGradient(x, y - size * 0.44 + swagger * 0.15, 0, x, y - size * 0.44 + swagger * 0.15, size * 0.24);
  faceGrad.addColorStop(0, "#fde8d8");
  faceGrad.addColorStop(0.7, "#fcd9b6");
  faceGrad.addColorStop(1, "#e5c4a0");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.44 + swagger * 0.15, size * 0.23, 0, Math.PI * 2);
  ctx.fill();

  // Stylish swept hair with magical highlights
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.54 + swagger * 0.15);
  ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.75, x - size * 0.05, y - size * 0.72 + swagger * 0.15);
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.78, x + size * 0.28, y - size * 0.62 + swagger * 0.15);
  ctx.quadraticCurveTo(x + size * 0.25, y - size * 0.5, x + size * 0.2, y - size * 0.52 + swagger * 0.15);
  ctx.lineTo(x - size * 0.2, y - size * 0.52 + swagger * 0.15);
  ctx.fill();
  // Magical blue streaks in hair
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.64 + swagger * 0.15);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.72, x + size * 0.2, y - size * 0.64 + swagger * 0.15);
  ctx.stroke();
  ctx.strokeStyle = "#93c5fd";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.68 + swagger * 0.15);
  ctx.quadraticCurveTo(x + size * 0.12, y - size * 0.74, x + size * 0.22, y - size * 0.58 + swagger * 0.15);
  ctx.stroke();

  // Confident glowing eyes with storm power
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.085, y - size * 0.46 + swagger * 0.15, size * 0.06, size * 0.07, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.085, y - size * 0.46 + swagger * 0.15, size * 0.06, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  // Electric blue magical pupils
  ctx.fillStyle = "#3b82f6";
  ctx.shadowColor = "#60a5fa";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.085, y - size * 0.46 + swagger * 0.15, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.085, y - size * 0.46 + swagger * 0.15, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Inner spark
  ctx.fillStyle = "#dbeafe";
  ctx.beginPath();
  ctx.arc(x - size * 0.095, y - size * 0.475 + swagger * 0.15, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.075, y - size * 0.475 + swagger * 0.15, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Cocky raised eyebrow
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.54 + swagger * 0.15);
  ctx.quadraticCurveTo(x - size * 0.09, y - size * 0.58, x - size * 0.02, y - size * 0.52 + swagger * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.54 + swagger * 0.15);
  ctx.quadraticCurveTo(x + size * 0.11, y - size * 0.6, x + size * 0.16, y - size * 0.52 + swagger * 0.15);
  ctx.stroke();

  // Smug smirk
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.07, y - size * 0.32 + swagger * 0.15);
  ctx.quadraticCurveTo(x + size * 0.02, y - size * 0.27, x + size * 0.1, y - size * 0.35 + swagger * 0.15);
  ctx.stroke();

  // Massive glowing storm orb in hand
  ctx.fillStyle = `rgba(59, 130, 246, ${magicPulse * 0.9})`;
  ctx.shadowColor = "#3b82f6";
  ctx.shadowBlur = 18 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.42, y + swagger * 0.1, size * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Inner storm core
  ctx.fillStyle = "#dbeafe";
  ctx.beginPath();
  ctx.arc(x + size * 0.42, y + swagger * 0.1, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Mini lightning in orb
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5 * zoom;
  for (let l = 0; l < 3; l++) {
    const lAngle = time * 8 + l * Math.PI * 0.67;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.42, y + swagger * 0.1);
    ctx.lineTo(
      x + size * 0.42 + Math.cos(lAngle) * size * 0.1,
      y + swagger * 0.1 + Math.sin(lAngle) * size * 0.1
    );
    ctx.stroke();
  }
  // Energy rings around orb
  ctx.strokeStyle = `rgba(147, 197, 253, ${magicPulse})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const wispAngle = time * 5 + i * Math.PI * 0.5;
    ctx.beginPath();
    ctx.arc(x + size * 0.42, y + swagger * 0.1, size * 0.15 + i * size * 0.03, wispAngle, wispAngle + Math.PI * 0.6);
    ctx.stroke();
  }

  // Secondary spell forming in other hand
  ctx.fillStyle = `rgba(147, 197, 253, ${stormIntensity * 0.6})`;
  ctx.shadowColor = "#93c5fd";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y + size * 0.1 + swagger * 0.05, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
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
  zoom: number,
  attackPhase: number = 0
) {
  // MAD ARCHIVIST - Scholar driven insane by forbidden knowledge, reality tears around them
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const twitch = Math.sin(time * 8) * 2 * zoom + Math.sin(time * 13) * 1 * zoom + (isAttacking ? attackIntensity * size * 0.15 : 0);
  const madnessPulse = 0.5 + Math.sin(time * 5) * 0.3 + attackIntensity * 0.4;
  const bookFloat = Math.sin(time * 2) * 4 + (isAttacking ? attackIntensity * 8 : 0);
  const realityTear = 0.4 + Math.sin(time * 7) * 0.3 + attackIntensity * 0.4;
  const eyeSpasm = Math.sin(time * 15) * size * 0.01 + (isAttacking ? Math.sin(attackPhase * Math.PI * 6) * size * 0.02 : 0);

  // Reality fractures around the scholar
  ctx.strokeStyle = `rgba(147, 51, 234, ${realityTear * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let f = 0; f < 5; f++) {
    const fractureAngle = time * 0.5 + f * Math.PI * 0.4;
    const fractureLen = size * (0.3 + Math.sin(time * 2 + f) * 0.1);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(fractureAngle) * size * 0.3, y + Math.sin(fractureAngle) * size * 0.2);
    for (let seg = 0; seg < 4; seg++) {
      const segX = x + Math.cos(fractureAngle) * (size * 0.3 + seg * fractureLen * 0.25) + (Math.random() - 0.5) * size * 0.05;
      const segY = y + Math.sin(fractureAngle) * (size * 0.2 + seg * fractureLen * 0.15);
      ctx.lineTo(segX, segY);
    }
    ctx.stroke();
  }

  // Purple madness aura with void tendrils
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  auraGrad.addColorStop(0, `rgba(139, 92, 246, ${madnessPulse * 0.35})`);
  auraGrad.addColorStop(0.3, `rgba(192, 132, 252, ${madnessPulse * 0.25})`);
  auraGrad.addColorStop(0.6, `rgba(147, 51, 234, ${madnessPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Floating ancient tomes orbiting with chains
  for (let i = 0; i < 5; i++) {
    const bookAngle = time * 1.2 + i * Math.PI * 0.4;
    const bookDist = size * 0.55 + Math.sin(time * 1.5 + i) * size * 0.08;
    const bx = x + Math.cos(bookAngle) * bookDist;
    const by = y - size * 0.08 + Math.sin(bookAngle) * bookDist * 0.35 + bookFloat;
    
    // Ethereal chain to book
    ctx.strokeStyle = `rgba(147, 51, 234, ${madnessPulse * 0.4})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.2);
    ctx.quadraticCurveTo(
      x + Math.cos(bookAngle) * bookDist * 0.5,
      y - size * 0.1 + Math.sin(bookAngle) * bookDist * 0.2,
      bx, by
    );
    ctx.stroke();
    
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(Math.sin(time * 2.5 + i) * 0.25);
    // Ornate book cover
    ctx.fillStyle = ["#2a0a3a", "#0a1a3a", "#3a0a2a", "#1a0a2a", "#0a2a1a"][i];
    ctx.fillRect(-size * 0.07, -size * 0.09, size * 0.14, size * 0.18);
    // Metal clasp
    ctx.fillStyle = "#8b5cf6";
    ctx.fillRect(-size * 0.075, -size * 0.02, size * 0.015, size * 0.04);
    // Aged pages
    ctx.fillStyle = "#fef9c3";
    ctx.fillRect(-size * 0.055, -size * 0.075, size * 0.11, size * 0.15);
    // Glowing forbidden runes
    ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse})`;
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 4 * zoom;
    ctx.font = `${size * 0.055}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["◈", "⍟", "⌬", "☆", "◇"][i], 0, size * 0.015);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Knowledge tendrils - eldritch whispers made visible
  ctx.strokeStyle = `rgba(147, 51, 234, ${madnessPulse * 0.6})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 7; i++) {
    const tendrilAngle = -Math.PI * 0.7 + i * Math.PI * 0.2;
    const tendrilPhase = time * 3 + i * 0.5;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(tendrilAngle) * size * 0.18, y - size * 0.52 + twitch * 0.3);
    ctx.bezierCurveTo(
      x + Math.cos(tendrilAngle) * size * 0.35 + Math.sin(tendrilPhase) * size * 0.12,
      y - size * 0.65 - i * size * 0.04,
      x + Math.cos(tendrilAngle + 0.2) * size * 0.45 + Math.cos(tendrilPhase * 1.5) * size * 0.08,
      y - size * 0.75 + Math.sin(tendrilPhase * 0.7) * size * 0.08,
      x + Math.cos(tendrilAngle) * size * 0.5,
      y - size * 0.85 + Math.sin(tendrilPhase) * size * 0.12
    );
    ctx.stroke();
    // Tendril tip glow
    ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(tendrilAngle) * size * 0.5,
      y - size * 0.85 + Math.sin(tendrilPhase) * size * 0.12,
      size * 0.015,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Floating text fragments - whispered secrets
  ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.5})`;
  ctx.font = `${size * 0.04}px serif`;
  for (let t = 0; t < 6; t++) {
    const textX = x + Math.sin(time * 1.5 + t * 1.2) * size * 0.5;
    const textY = y - size * 0.2 + Math.cos(time * 0.8 + t) * size * 0.3;
    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate(Math.sin(time * 2 + t) * 0.3);
    ctx.fillText(["truth", "void", "KNOW", "see", "END", "∞"][t], 0, 0);
    ctx.restore();
  }

  // Shadow with madness seeping out
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.5, 0, x, y + size * 0.5, size * 0.4);
  shadowGrad.addColorStop(0, "rgba(59, 7, 100, 0.5)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.4)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.38, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Disheveled scholar robes - worn and stained with ink
  const robeGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.35, x + size * 0.4, y + size * 0.55);
  robeGrad.addColorStop(0, "#1e0a30");
  robeGrad.addColorStop(0.2, "#3b0764");
  robeGrad.addColorStop(0.4, "#6b21a8");
  robeGrad.addColorStop(0.5, "#7c3aed");
  robeGrad.addColorStop(0.6, "#6b21a8");
  robeGrad.addColorStop(0.8, "#3b0764");
  robeGrad.addColorStop(1, "#1e0a30");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y + size * 0.52);
  ctx.quadraticCurveTo(x - size * 0.42, y, x - size * 0.2, y - size * 0.34);
  ctx.lineTo(x + size * 0.2, y - size * 0.34);
  ctx.quadraticCurveTo(x + size * 0.42, y, x + size * 0.36, y + size * 0.52);
  // Extremely tattered bottom
  for (let i = 0; i < 10; i++) {
    const tearX = x - size * 0.36 + i * size * 0.072;
    const tearY = y + size * 0.52 + Math.sin(time * 3 + i * 1.7) * size * 0.04 + (i % 2) * size * 0.07 + (i % 3) * size * 0.04;
    ctx.lineTo(tearX, tearY);
  }
  ctx.closePath();
  ctx.fill();

  // Ink stains on robe
  ctx.fillStyle = "rgba(30, 10, 50, 0.6)";
  for (let s = 0; s < 4; s++) {
    ctx.beginPath();
    ctx.ellipse(
      x - size * 0.15 + s * size * 0.1,
      y + size * 0.1 + Math.sin(s) * size * 0.15,
      size * 0.04,
      size * 0.06,
      Math.sin(s),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Ancient symbols burning into robe
  ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.7})`;
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `${size * 0.09}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⍟", x, y + size * 0.08);
  ctx.fillText("⌘", x - size * 0.18, y + size * 0.28);
  ctx.fillText("⌬", x + size * 0.18, y + size * 0.22);
  ctx.fillText("◈", x, y + size * 0.38);
  ctx.shadowBlur = 0;

  // Cracked spectacles floating askew with one lens missing
  ctx.save();
  ctx.translate(x, y - size * 0.46 + twitch * 0.25);
  ctx.rotate(0.08 + Math.sin(time * 3.5) * 0.05);
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 2.5 * zoom;
  // Left lens frame (lens cracked)
  ctx.beginPath();
  ctx.rect(-size * 0.18, -size * 0.065, size * 0.14, size * 0.11);
  ctx.stroke();
  // Right lens frame (lens missing)
  ctx.beginPath();
  ctx.rect(size * 0.04, -size * 0.065, size * 0.14, size * 0.11);
  ctx.stroke();
  // Bridge
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.01);
  ctx.lineTo(size * 0.04, -size * 0.01);
  ctx.stroke();
  // Multiple cracks in left lens
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.05);
  ctx.lineTo(-size * 0.08, size * 0.025);
  ctx.moveTo(-size * 0.12, -size * 0.04);
  ctx.lineTo(-size * 0.06, -size * 0.02);
  ctx.lineTo(-size * 0.1, size * 0.03);
  ctx.stroke();
  // Glowing residue in empty frame
  ctx.fillStyle = `rgba(147, 51, 234, ${madnessPulse * 0.3})`;
  ctx.fillRect(size * 0.055, -size * 0.05, size * 0.12, size * 0.08);
  ctx.restore();

  // Gaunt, haunted face - pale and drawn
  const faceGrad = ctx.createRadialGradient(x, y - size * 0.44 + twitch * 0.2, 0, x, y - size * 0.44 + twitch * 0.2, size * 0.24);
  faceGrad.addColorStop(0, "#ede9fe");
  faceGrad.addColorStop(0.5, "#ddd6fe");
  faceGrad.addColorStop(1, "#c4b5fd");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.44 + twitch * 0.2, size * 0.23, 0, Math.PI * 2);
  ctx.fill();

  // Deep sunken cheeks
  ctx.fillStyle = "rgba(91, 33, 182, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.13, y - size * 0.36 + twitch * 0.2, size * 0.05, size * 0.08, 0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.13, y - size * 0.36 + twitch * 0.2, size * 0.05, size * 0.08, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Wide, terrified eyes with eldritch knowledge burning within
  ctx.fillStyle = "#fefefe";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1 + eyeSpasm, y - size * 0.46 + twitch * 0.2, size * 0.06, size * 0.075, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1 - eyeSpasm, y - size * 0.46 + twitch * 0.2, size * 0.06, size * 0.075, 0, 0, Math.PI * 2);
  ctx.fill();
  // Purple irises with swirling knowledge
  ctx.fillStyle = "#7c3aed";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1 + eyeSpasm, y - size * 0.46 + twitch * 0.2, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1 - eyeSpasm, y - size * 0.46 + twitch * 0.2, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Tiny pinprick pupils (dilated from madness)
  ctx.fillStyle = "#0f0520";
  ctx.beginPath();
  ctx.arc(x - size * 0.1 + eyeSpasm, y - size * 0.46 + twitch * 0.2, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1 - eyeSpasm, y - size * 0.46 + twitch * 0.2, size * 0.01, 0, Math.PI * 2);
  ctx.fill();
  // Knowledge symbols in eyes
  ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.5})`;
  ctx.font = `${size * 0.02}px serif`;
  ctx.fillText("◈", x - size * 0.1 + eyeSpasm, y - size * 0.455 + twitch * 0.2);
  ctx.fillText("◈", x + size * 0.1 - eyeSpasm, y - size * 0.455 + twitch * 0.2);

  // Heavy dark circles under eyes
  ctx.fillStyle = "rgba(59, 7, 100, 0.6)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.38 + twitch * 0.2, size * 0.055, size * 0.025, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.38 + twitch * 0.2, size * 0.055, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wild, unkempt hair turning white from terror
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.58 + twitch * 0.2, size * 0.22, size * 0.12, 0, 0, Math.PI);
  ctx.fill();
  // Wild strands with gray/white streaks
  for (let i = 0; i < 12; i++) {
    const hairAngle = -Math.PI * 0.5 + i * Math.PI * 0.083;
    const isGray = i % 2 === 0;
    ctx.strokeStyle = isGray ? "#9ca3af" : "#1e1b4b";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(hairAngle) * size * 0.17, y - size * 0.57 + twitch * 0.2);
    ctx.bezierCurveTo(
      x + Math.cos(hairAngle) * size * 0.28 + Math.sin(time * 5 + i) * size * 0.06,
      y - size * 0.72 + twitch * 0.2,
      x + Math.cos(hairAngle + 0.15) * size * 0.3 + Math.cos(time * 4 + i) * size * 0.04,
      y - size * 0.78 + twitch * 0.2,
      x + Math.cos(hairAngle + 0.25) * size * 0.25,
      y - size * 0.82 + twitch * 0.2 + Math.sin(time * 6 + i) * size * 0.04
    );
    ctx.stroke();
  }

  // Trembling mouth muttering forbidden words
  ctx.fillStyle = "#3b0764";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.29 + twitch * 0.2, size * 0.05, size * 0.025 + Math.abs(Math.sin(time * 8)) * size * 0.01, 0, 0, Math.PI * 2);
  ctx.fill();
  // Whispered words escaping
  ctx.fillStyle = `rgba(147, 51, 234, ${madnessPulse * 0.4})`;
  ctx.font = `${size * 0.025}px serif`;
  const whisperY = y - size * 0.24 + twitch * 0.2;
  ctx.fillText("...", x + size * 0.08 + Math.sin(time * 4) * size * 0.02, whisperY);

  // Quill in trembling hand, dripping with glowing ink
  ctx.save();
  ctx.translate(x + size * 0.32, y + size * 0.1);
  ctx.rotate(-0.3 + Math.sin(time * 6) * 0.1);
  // Feather
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.15, size * 0.02, -size * 0.35);
  ctx.quadraticCurveTo(-size * 0.02, -size * 0.2, 0, 0);
  ctx.fill();
  // Quill tip
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.01, size * 0.08);
  ctx.lineTo(size * 0.01, size * 0.08);
  ctx.fill();
  // Dripping magical ink
  ctx.fillStyle = `rgba(147, 51, 234, ${madnessPulse})`;
  const dripPhase = (time * 3) % 1;
  ctx.beginPath();
  ctx.arc(0, size * 0.08 + dripPhase * size * 0.1, size * 0.015 * (1 - dripPhase * 0.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
  zoom: number,
  attackPhase: number = 0
) {
  // SENIOR THESIS - The Ultimate Academic Titan
  // A colossal ethereal manifestation of accumulated academic power
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const strut = Math.sin(time * 3) * 2 * zoom;
  const cloakWave = Math.sin(time * 2.5) * 0.12;
  const powerPulse = 0.5 + Math.sin(time * 3) * 0.3;
  const breathe = Math.sin(time * 2) * size * 0.02;
  const floatHeight = Math.sin(time * 1.5) * size * 0.03;
  
  // Attack animation variables
  const diplomaSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.8 : 0;
  const powerSurge = isAttacking ? attackIntensity * 0.6 : 0;
  const auraExpand = isAttacking ? 1 + attackIntensity * 0.4 : 1;

  // === LAYER 1: COSMIC VOID AURA (Background) ===
  // Outer void distortion field
  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 0.5 + ring * 0.3) % 1;
    const ringSize = size * (0.9 + ring * 0.25) * auraExpand;
    const ringAlpha = (0.15 - ring * 0.04) * (1 + powerSurge);
    ctx.strokeStyle = `rgba(219, 39, 119, ${ringAlpha})`;
    ctx.lineWidth = (2 - ring * 0.5) * zoom;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const wobble = Math.sin(a * 6 + time * 3 + ring) * size * 0.03;
      const rx = x + Math.cos(a) * (ringSize + wobble);
      const ry = y + Math.sin(a) * (ringSize * 0.55 + wobble * 0.5);
      if (a === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Inner power aura - multi-layered gradient
  const auraGrad = ctx.createRadialGradient(x, y - size * 0.1, 0, x, y, size * 0.95 * auraExpand);
  auraGrad.addColorStop(0, `rgba(251, 207, 232, ${(0.4 + powerSurge * 0.3) * powerPulse})`);
  auraGrad.addColorStop(0.25, `rgba(244, 114, 182, ${(0.25 + powerSurge * 0.2) * powerPulse})`);
  auraGrad.addColorStop(0.5, `rgba(219, 39, 119, ${(0.15 + powerSurge * 0.15) * powerPulse})`);
  auraGrad.addColorStop(0.75, `rgba(157, 23, 77, ${0.08 * powerPulse})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.95 * auraExpand, size * 0.6 * auraExpand, 0, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 2: FLOATING ARCANE ELEMENTS ===
  // Orbiting thesis chapters (ethereal pages)
  for (let i = 0; i < 8; i++) {
    const orbitAngle = time * 1.2 + i * Math.PI * 0.25;
    const orbitDist = size * 0.55 + Math.sin(time * 2 + i) * size * 0.08;
    const pageX = x + Math.cos(orbitAngle) * orbitDist;
    const pageY = y + Math.sin(orbitAngle) * orbitDist * 0.4 + floatHeight;
    const pageRot = Math.sin(time * 3 + i * 2) * 0.3;
    const pageGlow = 0.4 + Math.sin(time * 4 + i) * 0.2 + powerSurge * 0.3;
    
    ctx.save();
    ctx.translate(pageX, pageY);
    ctx.rotate(pageRot);
    // Page shadow
    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.fillRect(size * -0.04 + 1, size * -0.05 + 1, size * 0.08, size * 0.1);
    // Page body
    ctx.fillStyle = `rgba(253, 244, 255, ${pageGlow})`;
    ctx.fillRect(size * -0.04, size * -0.05, size * 0.08, size * 0.1);
    // Page text lines
    ctx.fillStyle = `rgba(157, 23, 77, ${pageGlow * 0.6})`;
    for (let line = 0; line < 4; line++) {
      ctx.fillRect(size * -0.03, size * -0.04 + line * size * 0.022, size * 0.06, size * 0.008);
    }
    // Glowing edge
    ctx.strokeStyle = `rgba(244, 114, 182, ${pageGlow * 0.8})`;
    ctx.lineWidth = 1 * zoom;
    ctx.strokeRect(size * -0.04, size * -0.05, size * 0.08, size * 0.1);
    ctx.restore();
  }

  // Floating arcane runes in a circle
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 6; i++) {
    const runeAngle = time * 0.8 + i * Math.PI / 3;
    const runeDist = size * 0.7 + Math.sin(time * 2.5 + i * 2) * size * 0.05;
    const runeX = x + Math.cos(runeAngle) * runeDist;
    const runeY = y - size * 0.15 + Math.sin(runeAngle) * runeDist * 0.35;
    const runeAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3 + powerSurge * 0.4;
    ctx.fillStyle = `rgba(244, 114, 182, ${runeAlpha})`;
    const runes = ["Σ", "Φ", "Ψ", "Ω", "∞", "π"];
    ctx.fillText(runes[i], runeX, runeY);
  }

  // === LAYER 3: SHADOW AND GROUND EFFECT ===
  // Complex shadow with distortion
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.5);
  shadowGrad.addColorStop(0, "rgba(80, 20, 60, 0.5)");
  shadowGrad.addColorStop(0.5, "rgba(40, 10, 30, 0.35)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Corruption tendrils from shadow
  ctx.strokeStyle = `rgba(157, 23, 77, ${0.3 + powerSurge * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    const tendrilAngle = Math.PI * 0.7 + i * Math.PI * 0.15;
    const tendrilWave = Math.sin(time * 3 + i * 2) * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(tendrilAngle) * size * 0.3, y + size * 0.48);
    ctx.quadraticCurveTo(
      x + Math.cos(tendrilAngle) * size * 0.4 + tendrilWave,
      y + size * 0.3,
      x + Math.cos(tendrilAngle) * size * 0.25 + tendrilWave * 1.5,
      y + size * 0.1
    );
    ctx.stroke();
  }

  // === LAYER 4: THE LIVING GRADUATION CLOAK ===
  ctx.save();
  ctx.translate(x, y + floatHeight);
  ctx.rotate(cloakWave * 0.5);
  
  // Cloak outer shadow layer
  const cloakShadowGrad = ctx.createLinearGradient(-size * 0.5, -size * 0.35, size * 0.5, size * 0.55);
  cloakShadowGrad.addColorStop(0, "#0a0510");
  cloakShadowGrad.addColorStop(0.5, "#150818");
  cloakShadowGrad.addColorStop(1, "#0a0510");
  ctx.fillStyle = cloakShadowGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.44, size * 0.52);
  for (let i = 0; i < 10; i++) {
    const waveX = -size * 0.44 + i * size * 0.098;
    const waveY = size * 0.52 + Math.sin(time * 4 + i * 1.2) * size * 0.05 + (i % 2) * size * 0.03;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(size * 0.52, size * 0.1, size * 0.28, -size * 0.34 + strut * 0.08);
  ctx.lineTo(-size * 0.28, -size * 0.34 + strut * 0.08);
  ctx.quadraticCurveTo(-size * 0.52, size * 0.1, -size * 0.44, size * 0.52);
  ctx.fill();

  // Cloak main body with gradient
  const cloakGrad = ctx.createLinearGradient(-size * 0.45, -size * 0.3, size * 0.45, size * 0.5);
  cloakGrad.addColorStop(0, "#1f1225");
  cloakGrad.addColorStop(0.2, "#2d1832");
  cloakGrad.addColorStop(0.4, "#1f1225");
  cloakGrad.addColorStop(0.6, "#2d1832");
  cloakGrad.addColorStop(0.8, "#1f1225");
  cloakGrad.addColorStop(1, "#150818");
  ctx.fillStyle = cloakGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, size * 0.48);
  for (let i = 0; i < 9; i++) {
    const waveX = -size * 0.4 + i * size * 0.1;
    const waveY = size * 0.48 + Math.sin(time * 4.5 + i * 1.3) * size * 0.04;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(size * 0.48, size * 0.05, size * 0.24, -size * 0.3 + strut * 0.1);
  ctx.lineTo(-size * 0.24, -size * 0.3 + strut * 0.1);
  ctx.quadraticCurveTo(-size * 0.48, size * 0.05, -size * 0.4, size * 0.48);
  ctx.fill();

  // Cloak magical pattern overlay
  ctx.strokeStyle = `rgba(244, 114, 182, ${0.2 + powerSurge * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    const patternY = -size * 0.2 + i * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, patternY);
    ctx.quadraticCurveTo(0, patternY + Math.sin(time * 3 + i) * size * 0.03, size * 0.25, patternY);
    ctx.stroke();
  }
  ctx.restore();

  // === LAYER 5: GOLDEN TRIM AND STOLES ===
  // Left stole with intricate pattern
  const stoleGrad = ctx.createLinearGradient(x - size * 0.2, y - size * 0.3, x - size * 0.15, y + size * 0.4);
  stoleGrad.addColorStop(0, "#f472b6");
  stoleGrad.addColorStop(0.3, "#ec4899");
  stoleGrad.addColorStop(0.5, "#f472b6");
  stoleGrad.addColorStop(0.7, "#db2777");
  stoleGrad.addColorStop(1, "#be185d");
  ctx.fillStyle = stoleGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.26 + strut * 0.1 + floatHeight);
  ctx.lineTo(x - size * 0.18, y + size * 0.42);
  ctx.quadraticCurveTo(x - size * 0.16, y + size * 0.48, x - size * 0.1, y + size * 0.42);
  ctx.lineTo(x - size * 0.06, y - size * 0.22 + strut * 0.1 + floatHeight);
  ctx.fill();
  // Right stole
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.26 + strut * 0.1 + floatHeight);
  ctx.lineTo(x + size * 0.18, y + size * 0.42);
  ctx.quadraticCurveTo(x + size * 0.16, y + size * 0.48, x + size * 0.1, y + size * 0.42);
  ctx.lineTo(x + size * 0.06, y - size * 0.22 + strut * 0.1 + floatHeight);
  ctx.fill();

  // Stole emblems and symbols
  ctx.fillStyle = "#fdf4ff";
  ctx.font = `bold ${size * 0.07}px serif`;
  const emblems = ["✦", "◆", "★", "✧"];
  for (let i = 0; i < 4; i++) {
    const emblemY = y - size * 0.05 + i * size * 0.12;
    ctx.fillText(emblems[i], x - size * 0.12, emblemY);
    ctx.fillText(emblems[(i + 2) % 4], x + size * 0.12, emblemY + size * 0.03);
  }

  // Golden trim lines
  ctx.strokeStyle = "#fcd34d";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.26 + strut * 0.1 + floatHeight);
  ctx.lineTo(x - size * 0.21, y + size * 0.44);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.17, y - size * 0.26 + strut * 0.1 + floatHeight);
  ctx.lineTo(x + size * 0.21, y + size * 0.44);
  ctx.stroke();

  // === LAYER 6: THE FACE - Wise and Powerful ===
  const headY = y - size * 0.42 + strut * 0.12 + floatHeight;
  
  // Face base
  const faceGrad = ctx.createRadialGradient(x, headY, 0, x, headY, size * 0.2);
  faceGrad.addColorStop(0, "#fdf4ff");
  faceGrad.addColorStop(0.7, "#fce7f3");
  faceGrad.addColorStop(1, "#fbcfe8");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, size * 0.18, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jaw definition
  ctx.fillStyle = "#f9a8d4";
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.12, size * 0.12, size * 0.06, 0, 0, Math.PI);
  ctx.fill();

  // Elegant dark hair with highlights
  const hairGrad = ctx.createLinearGradient(x - size * 0.2, headY - size * 0.25, x + size * 0.2, headY);
  hairGrad.addColorStop(0, "#1e1b4b");
  hairGrad.addColorStop(0.3, "#312e81");
  hairGrad.addColorStop(0.5, "#1e1b4b");
  hairGrad.addColorStop(0.7, "#312e81");
  hairGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, headY - size * 0.08);
  ctx.quadraticCurveTo(x - size * 0.28, headY - size * 0.32, x, headY - size * 0.38);
  ctx.quadraticCurveTo(x + size * 0.28, headY - size * 0.32, x + size * 0.2, headY - size * 0.08);
  ctx.quadraticCurveTo(x + size * 0.15, headY - size * 0.15, x, headY - size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.15, headY - size * 0.15, x - size * 0.2, headY - size * 0.08);
  ctx.fill();
  
  // Hair shine
  ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, headY - size * 0.25, size * 0.08, -0.8, 0.3);
  ctx.stroke();

  // === LAYER 7: THE MORTARBOARD - Floating Crown of Knowledge ===
  ctx.save();
  ctx.translate(x, headY - size * 0.32 + Math.sin(time * 2) * size * 0.015);
  ctx.rotate(Math.sin(time * 1.5) * 0.06);
  
  // Board shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, size * 0.02);
  ctx.lineTo(0, -size * 0.1);
  ctx.lineTo(size * 0.28, size * 0.02);
  ctx.lineTo(0, size * 0.12);
  ctx.closePath();
  ctx.fill();
  
  // Board top with gradient
  const boardGrad = ctx.createLinearGradient(-size * 0.25, 0, size * 0.25, 0);
  boardGrad.addColorStop(0, "#1e1b4b");
  boardGrad.addColorStop(0.5, "#312e81");
  boardGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = boardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.26, 0);
  ctx.lineTo(0, -size * 0.1);
  ctx.lineTo(size * 0.26, 0);
  ctx.lineTo(0, size * 0.1);
  ctx.closePath();
  ctx.fill();
  
  // Board edge highlight
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  
  // Cap base
  const capGrad = ctx.createRadialGradient(0, size * 0.04, 0, 0, size * 0.04, size * 0.15);
  capGrad.addColorStop(0, "#4338ca");
  capGrad.addColorStop(1, "#312e81");
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.04, size * 0.14, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Tassel - flowing and magical
  const tasselSwing = Math.sin(time * 4) * size * 0.06;
  ctx.strokeStyle = "#f472b6";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.08 + tasselSwing, size * 0.05, size * 0.1 + tasselSwing * 0.5, size * 0.18);
  ctx.stroke();
  
  // Tassel strands
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 5; i++) {
    const strandX = size * 0.1 + tasselSwing * 0.5 + (i - 2) * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(strandX, size * 0.18);
    ctx.lineTo(strandX + Math.sin(time * 5 + i) * size * 0.02, size * 0.28);
    ctx.stroke();
  }
  
  // Tassel button
  ctx.fillStyle = "#fcd34d";
  ctx.beginPath();
  ctx.arc(0, -size * 0.05, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === LAYER 8: THE EYES - Windows to Academic Power ===
  // Eye whites with slight glow
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.075, headY - size * 0.02, size * 0.055, size * 0.065, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.075, headY - size * 0.02, size * 0.055, size * 0.065, 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Irises - glowing with power
  const irisGlow = isAttacking ? 0.9 + attackIntensity * 0.1 : 0.7 + Math.sin(time * 2) * 0.2;
  ctx.fillStyle = `rgba(219, 39, 119, ${irisGlow})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.075, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.075, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.arc(x - size * 0.075, headY - size * 0.02, size * 0.018, 0, Math.PI * 2);
  ctx.arc(x + size * 0.075, headY - size * 0.02, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.085, headY - size * 0.035, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.065, headY - size * 0.035, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Confident brow lines
  ctx.strokeStyle = "#1e1b4b";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, headY - size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.075, headY - size * 0.13 - (isAttacking ? size * 0.02 : 0), x - size * 0.02, headY - size * 0.09);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, headY - size * 0.1);
  ctx.quadraticCurveTo(x + size * 0.075, headY - size * 0.13 - (isAttacking ? size * 0.02 : 0), x + size * 0.02, headY - size * 0.09);
  ctx.stroke();

  // Knowing smile
  ctx.strokeStyle = "#9d174d";
  ctx.lineWidth = 2 * zoom;
  const smileWidth = isAttacking ? 0.1 : 0.07;
  ctx.beginPath();
  ctx.arc(x, headY + size * 0.08, size * smileWidth, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // === LAYER 9: THE DIPLOMA OF POWER ===
  ctx.save();
  ctx.translate(x + size * 0.45, y + size * 0.05 + strut * 0.08 + floatHeight);
  ctx.rotate(0.35 + Math.sin(time * 2) * 0.12 + diplomaSwing);
  
  // Diploma shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(-size * 0.05 + 2, -size * 0.22 + 2, size * 0.1, size * 0.44);
  
  // Diploma scroll body
  const diplomaGrad = ctx.createLinearGradient(-size * 0.05, 0, size * 0.05, 0);
  diplomaGrad.addColorStop(0, "#fef3c7");
  diplomaGrad.addColorStop(0.3, "#fefce8");
  diplomaGrad.addColorStop(0.5, "#fef3c7");
  diplomaGrad.addColorStop(0.7, "#fefce8");
  diplomaGrad.addColorStop(1, "#fef3c7");
  ctx.fillStyle = diplomaGrad;
  ctx.fillRect(-size * 0.05, -size * 0.22, size * 0.1, size * 0.44);
  
  // Diploma edges (rolled appearance)
  ctx.fillStyle = "#fcd34d";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.22, size * 0.05, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, size * 0.22, size * 0.05, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Magical text lines
  ctx.fillStyle = `rgba(157, 23, 77, ${0.6 + powerSurge * 0.4})`;
  for (let i = 0; i < 8; i++) {
    const lineWidth = size * (0.06 - Math.abs(i - 4) * 0.005);
    ctx.fillRect(-lineWidth / 2, -size * 0.16 + i * size * 0.045, lineWidth, size * 0.015);
  }
  
  // Glowing seal
  ctx.fillStyle = `rgba(219, 39, 119, ${0.8 + powerSurge * 0.2})`;
  ctx.beginPath();
  ctx.arc(0, size * 0.15, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  
  // Seal emblem
  ctx.fillStyle = "#fcd34d";
  ctx.font = `${size * 0.04}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("P", 0, size * 0.165);
  
  // Magical glow effect around diploma
  ctx.strokeStyle = `rgba(244, 114, 182, ${powerPulse * 0.7 + powerSurge * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  ctx.strokeRect(-size * 0.06, -size * 0.23, size * 0.12, size * 0.46);
  
  ctx.restore();

  // === LAYER 10: ATTACK EFFECTS ===
  if (isAttacking) {
    // Power burst from diploma
    const burstCount = 8;
    for (let i = 0; i < burstCount; i++) {
      const burstAngle = (i / burstCount) * Math.PI * 2 + time * 3;
      const burstDist = size * 0.3 + attackIntensity * size * 0.4;
      const burstX = x + size * 0.45 + Math.cos(burstAngle) * burstDist;
      const burstY = y + size * 0.05 + Math.sin(burstAngle) * burstDist * 0.6;
      ctx.fillStyle = `rgba(244, 114, 182, ${attackIntensity * 0.5})`;
      ctx.beginPath();
      ctx.arc(burstX, burstY, size * 0.02 + attackIntensity * size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Energy wave
    ctx.strokeStyle = `rgba(219, 39, 119, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6 + attackIntensity * size * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    
    // Academic power words
    ctx.font = `italic ${size * 0.06}px Georgia`;
    ctx.fillStyle = `rgba(244, 114, 182, ${attackIntensity * 0.8})`;
    const words = ["THESIS", "DEFENSE", "QED"];
    const wordIndex = Math.floor((attackPhase * 3) % 3);
    ctx.fillText(words[wordIndex], x + size * 0.2 + attackIntensity * size * 0.3, y - size * 0.3 - attackIntensity * size * 0.2);
  }

  // === LAYER 11: AMBIENT PARTICLES ===
  // Knowledge particles floating upward
  for (let i = 0; i < 6; i++) {
    const particlePhase = (time * 0.5 + i * 0.5) % 3;
    const particleX = x - size * 0.3 + i * size * 0.12 + Math.sin(time * 2 + i) * size * 0.05;
    const particleY = y + size * 0.3 - particlePhase * size * 0.25;
    const particleAlpha = (1 - particlePhase / 3) * 0.5;
    ctx.fillStyle = `rgba(244, 114, 182, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(particleX, particleY, size * 0.015 + Math.sin(time * 4 + i) * size * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }
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
  zoom: number,
  attackPhase: number = 0
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  // VOID-TOUCHED RESEARCHER - Driven mad by dimensional research, reality warps around them
  const exhaustionSway = Math.sin(time * 1.5) * 4 * zoom + (isAttacking ? attackIntensity * size * 0.15 : 0);
  const insanityPulse = 0.5 + Math.sin(time * 6) * 0.3 + attackIntensity * 0.4;
  const eyeTwitch = Math.sin(time * 12) * 0.5 + Math.sin(time * 17) * 0.3 + (isAttacking ? attackIntensity * 0.5 : 0);
  const dimensionalRift = 0.4 + Math.sin(time * 4) * 0.3 + attackIntensity * 0.4;
  const caffeineTremor = Math.sin(time * 20) * size * 0.005 + (isAttacking ? attackIntensity * size * 0.01 : 0);

  // Dimensional instability field
  ctx.save();
  for (let layer = 0; layer < 4; layer++) {
    const layerPhase = (time * 0.6 + layer * 0.4) % 2.5;
    const layerSize = size * 0.35 + layerPhase * size * 0.35;
    ctx.strokeStyle = `rgba(251, 146, 60, ${(0.4 - layer * 0.08) * (1 - layerPhase / 2.5)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const distort = Math.sin(a * 4 + time * 3 + layer) * size * 0.06;
      const rx = layerSize + distort;
      const ry = (layerSize + distort) * 0.65;
      const px = x + Math.cos(a) * rx;
      const py = y + Math.sin(a) * ry;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // Void tears in reality
  ctx.fillStyle = `rgba(20, 10, 30, ${dimensionalRift * 0.6})`;
  for (let tear = 0; tear < 4; tear++) {
    const tearX = x + Math.sin(time * 0.8 + tear * 1.5) * size * 0.4;
    const tearY = y + Math.cos(time * 0.6 + tear) * size * 0.3 - size * 0.1;
    ctx.save();
    ctx.translate(tearX, tearY);
    ctx.rotate(time * 0.5 + tear);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.03 + Math.sin(time * 3 + tear) * size * 0.01, size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    // Void energy leaking
    ctx.strokeStyle = `rgba(251, 146, 60, ${insanityPulse * 0.5})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.08);
    ctx.quadraticCurveTo(Math.sin(time * 4 + tear) * size * 0.03, size * 0.12, 0, size * 0.15);
    ctx.stroke();
    ctx.restore();
  }

  // Floating research papers with forbidden equations
  for (let i = 0; i < 8; i++) {
    const paperAngle = time * 0.8 + i * Math.PI * 0.25;
    const paperDist = size * 0.5 + Math.sin(time * 2 + i) * size * 0.12;
    const px = x + Math.cos(paperAngle) * paperDist;
    const py = y - size * 0.12 + Math.sin(paperAngle) * paperDist * 0.4;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(time * 3.5 + i) * 0.6);
    // Aged paper
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(-size * 0.055, -size * 0.07, size * 0.11, size * 0.14);
    // Paper edge wear
    ctx.strokeStyle = "#d4a574";
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(-size * 0.055, -size * 0.07, size * 0.11, size * 0.14);
    // Forbidden equations and diagrams
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 0.5 * zoom;
    for (let j = 0; j < 5; j++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.045, -size * 0.055 + j * size * 0.022);
      ctx.lineTo(size * 0.045, -size * 0.055 + j * size * 0.022);
      ctx.stroke();
    }
    // Glowing warning symbol on some papers
    if (i % 3 === 0) {
      ctx.fillStyle = `rgba(251, 146, 60, ${insanityPulse})`;
      ctx.font = `${size * 0.04}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("⚠", 0, size * 0.04);
    }
    ctx.restore();
  }

  // Shadow with dimensional bleed
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.4);
  shadowGrad.addColorStop(0, "rgba(120, 53, 15, 0.5)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.4)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.4, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tattered lab coat with dimensional burns and chemical stains
  const coatGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.35, x + size * 0.4, y + size * 0.55);
  coatGrad.addColorStop(0, "#a3a3a3");
  coatGrad.addColorStop(0.2, "#d4d4d4");
  coatGrad.addColorStop(0.4, "#f5f5f5");
  coatGrad.addColorStop(0.5, "#ffffff");
  coatGrad.addColorStop(0.6, "#f5f5f5");
  coatGrad.addColorStop(0.8, "#d4d4d4");
  coatGrad.addColorStop(1, "#a3a3a3");
  ctx.fillStyle = coatGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.55);
  ctx.quadraticCurveTo(x - size * 0.44, y, x - size * 0.22, y - size * 0.34 + exhaustionSway * 0.1);
  ctx.lineTo(x + size * 0.22, y - size * 0.34 + exhaustionSway * 0.1);
  ctx.quadraticCurveTo(x + size * 0.44, y, x + size * 0.38, y + size * 0.55);
  // Burned and tattered bottom
  for (let i = 0; i < 9; i++) {
    const tearX = x - size * 0.38 + i * size * 0.095;
    const tearY = y + size * 0.55 + Math.sin(time * 2 + i * 1.3) * size * 0.03 + (i % 2) * size * 0.06 + (i % 3) * size * 0.03;
    ctx.lineTo(tearX, tearY);
  }
  ctx.closePath();
  ctx.fill();

  // Multiple stains - coffee, chemicals, dimensional residue
  // Coffee stains
  ctx.fillStyle = "rgba(120, 53, 15, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.18, y + size * 0.18, size * 0.09, size * 0.12, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.12, y + size * 0.08, size * 0.07, size * 0.09, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Chemical burns
  ctx.fillStyle = "rgba(20, 184, 166, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y + size * 0.3, size * 0.05, size * 0.06, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Dimensional residue (glowing)
  ctx.fillStyle = `rgba(251, 146, 60, ${insanityPulse * 0.5})`;
  ctx.shadowColor = "#fb923c";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.2, y + size * 0.28, size * 0.045, size * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Multiple pockets overflowing with tools
  ctx.fillStyle = "#e5e5e5";
  ctx.fillRect(x - size * 0.24, y - size * 0.18, size * 0.14, size * 0.16);
  ctx.strokeStyle = "#a3a3a3";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(x - size * 0.24, y - size * 0.18, size * 0.14, size * 0.16);
  // Chaotic pens and tools
  const penColors = ["#1c1917", "#dc2626", "#2563eb", "#16a34a", "#9333ea"];
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.translate(x - size * 0.22 + i * size * 0.025, y - size * 0.14);
    ctx.rotate(-0.35 + Math.sin(time * 2 + i * 0.7) * 0.25);
    ctx.fillStyle = penColors[i];
    ctx.fillRect(-size * 0.008, -size * 0.12, size * 0.016, size * 0.12);
    ctx.restore();
  }

  // Gaunt, exhausted face - nearly skeletal from sleep deprivation
  ctx.save();
  ctx.translate(x + caffeineTremor, y - size * 0.44 + exhaustionSway * 0.15);
  ctx.rotate(exhaustionSway * 0.025);

  const faceGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.24);
  faceGrad.addColorStop(0, "#fef9c3");
  faceGrad.addColorStop(0.6, "#fef3c7");
  faceGrad.addColorStop(1, "#fde68a");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Extremely sunken cheeks
  ctx.fillStyle = "rgba(120, 53, 15, 0.25)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.14, size * 0.02, size * 0.06, size * 0.1, 0.1, 0, Math.PI * 2);
  ctx.ellipse(size * 0.14, size * 0.02, size * 0.06, size * 0.1, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Scraggly unkempt beard with food bits
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.14, size * 0.14, size * 0.1, 0, 0, Math.PI);
  ctx.fill();
  // Stubble texture
  ctx.fillStyle = "#44403c";
  for (let i = 0; i < 18; i++) {
    const stubX = -size * 0.12 + (i % 6) * size * 0.04;
    const stubY = size * 0.06 + Math.floor(i / 6) * size * 0.035;
    ctx.fillRect(stubX, stubY, size * 0.012, size * 0.025);
  }
  // Crumbs in beard
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.arc(-size * 0.05, size * 0.12, size * 0.01, 0, Math.PI * 2);
  ctx.arc(size * 0.08, size * 0.1, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Bloodshot, twitching eyes with dimensional sight
  ctx.fillStyle = "#fef2f2";
  ctx.beginPath();
  ctx.ellipse(-size * 0.09 + eyeTwitch, -size * 0.02, size * 0.06, size * 0.045, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.09 + eyeTwitch, -size * 0.02, size * 0.06, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  // Heavy bloodshot veins
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 0.8 * zoom;
  for (let eye = 0; eye < 2; eye++) {
    const ex = eye === 0 ? -size * 0.09 : size * 0.09;
    for (let v = 0; v < 5; v++) {
      const vAngle = -Math.PI * 0.5 + v * Math.PI * 0.25;
      ctx.beginPath();
      ctx.moveTo(ex + eyeTwitch, -size * 0.02);
      ctx.lineTo(ex + eyeTwitch + Math.cos(vAngle) * size * 0.05, -size * 0.02 + Math.sin(vAngle) * size * 0.04);
      ctx.stroke();
    }
  }
  // Orange dimensional-touched pupils
  ctx.fillStyle = "#fb923c";
  ctx.shadowColor = "#fb923c";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(-size * 0.09 + eyeTwitch, -size * 0.02, size * 0.028, 0, Math.PI * 2);
  ctx.arc(size * 0.09 + eyeTwitch, -size * 0.02, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Tiny pinprick pupils (over-caffeinated)
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(-size * 0.09 + eyeTwitch, -size * 0.02, size * 0.007, 0, Math.PI * 2);
  ctx.arc(size * 0.09 + eyeTwitch, -size * 0.02, size * 0.007, 0, Math.PI * 2);
  ctx.fill();

  // Massive dark circles - practically bruises
  ctx.fillStyle = "rgba(88, 28, 135, 0.6)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.09, size * 0.05, size * 0.07, size * 0.03, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.09, size * 0.05, size * 0.07, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // Broken glasses held together with tape
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 2.5 * zoom;
  // Left lens (cracked)
  ctx.beginPath();
  ctx.arc(-size * 0.09, -size * 0.02, size * 0.07, 0, Math.PI * 2);
  ctx.stroke();
  // Right lens
  ctx.beginPath();
  ctx.arc(size * 0.09, -size * 0.02, size * 0.07, 0, Math.PI * 2);
  ctx.stroke();
  // Bridge with tape
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.02);
  ctx.lineTo(size * 0.02, -size * 0.02);
  ctx.stroke();
  // Tape on bridge
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(-size * 0.015, -size * 0.035, size * 0.03, size * 0.03);
  // Crack in left lens
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.04);
  ctx.lineTo(-size * 0.08, size * 0.02);
  ctx.lineTo(-size * 0.06, -size * 0.01);
  ctx.stroke();

  // Wild, unkempt hair standing on end
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.16, size * 0.22, size * 0.12, 0, 0, Math.PI);
  ctx.fill();
  // Chaotic strands with gray from stress
  for (let i = 0; i < 14; i++) {
    const hairAngle = -Math.PI * 0.55 + i * Math.PI * 0.077;
    const isGray = i % 4 === 0;
    ctx.strokeStyle = isGray ? "#9ca3af" : "#44403c";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(Math.cos(hairAngle) * size * 0.18, -size * 0.16);
    ctx.bezierCurveTo(
      Math.cos(hairAngle) * size * 0.28 + Math.sin(time * 6 + i) * size * 0.1,
      -size * 0.32 + Math.sin(time * 4 + i) * size * 0.06,
      Math.cos(hairAngle + 0.2) * size * 0.3 + Math.cos(time * 5 + i) * size * 0.05,
      -size * 0.38,
      Math.cos(hairAngle + 0.35) * size * 0.25,
      -size * 0.42 + Math.sin(time * 5 + i) * size * 0.08
    );
    ctx.stroke();
  }

  ctx.restore();

  // MASSIVE coffee thermos (industrial size)
  ctx.save();
  ctx.translate(x + size * 0.4, y - size * 0.15 + exhaustionSway * 0.1);
  // Thermos body
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.roundRect(-size * 0.1, -size * 0.08, size * 0.2, size * 0.45, size * 0.03);
  ctx.fill();
  // Metal bands
  ctx.fillStyle = "#6b7280";
  ctx.fillRect(-size * 0.1, -size * 0.02, size * 0.2, size * 0.03);
  ctx.fillRect(-size * 0.1, size * 0.25, size * 0.2, size * 0.03);
  // Coffee inside (visible through opening)
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.06, size * 0.07, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  // Excessive steam - reality-warping caffeine vapor
  ctx.strokeStyle = `rgba(251, 146, 60, ${0.5 + Math.sin(time * 5) * 0.25})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 7; i++) {
    const steamPhase = (time * 2.5 + i * 0.25) % 1.5;
    ctx.beginPath();
    ctx.moveTo(-size * 0.06 + i * size * 0.02, -size * 0.1);
    ctx.bezierCurveTo(
      -size * 0.06 + i * size * 0.02 + Math.sin(time * 6 + i) * size * 0.04,
      -size * 0.2 - steamPhase * size * 0.1,
      -size * 0.04 + i * size * 0.02 + Math.cos(time * 5 + i) * size * 0.03,
      -size * 0.35 - steamPhase * size * 0.1,
      -size * 0.06 + i * size * 0.02,
      -size * 0.5 - steamPhase * size * 0.12
    );
    ctx.stroke();
  }
  // Warning label
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-size * 0.06, size * 0.1, size * 0.12, size * 0.08);
  ctx.fillStyle = "#fef2f2";
  ctx.font = `${size * 0.03}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("☠", 0, size * 0.155);
  ctx.restore();

  // Floating equations and diagrams around head
  ctx.fillStyle = `rgba(251, 146, 60, ${insanityPulse * 0.6})`;
  ctx.font = `${size * 0.035}px serif`;
  const equations = ["E=mc²", "∫∞", "Σn→∞", "∂ψ/∂t", "ℏ"];
  for (let e = 0; e < 5; e++) {
    const eqX = x + Math.sin(time * 1.2 + e * 1.3) * size * 0.55;
    const eqY = y - size * 0.6 + Math.cos(time * 0.8 + e) * size * 0.15;
    ctx.save();
    ctx.translate(eqX, eqY);
    ctx.rotate(Math.sin(time * 1.5 + e) * 0.2);
    ctx.fillText(equations[e], 0, 0);
    ctx.restore();
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
  zoom: number,
  attackPhase: number = 0
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  // ARCHLICH PROFESSOR - Ancient undead lecturer with arcane knowledge
  const hover = Math.sin(time * 2) * 3 * zoom + (isAttacking ? attackIntensity * size * 0.12 : 0);
  const powerPulse = 0.6 + Math.sin(time * 3) * 0.4 + attackIntensity * 0.4;
  const lectureGesture = Math.sin(time * 2.5) * 0.2 + (isAttacking ? attackIntensity * 0.5 : 0);

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
  zoom: number,
  attackPhase: number = 0
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  // VOID ARCHON DEAN - Reality-bending administrator with absolute authority over space
  const hover = Math.sin(time * 1.5) * 5 * zoom + (isAttacking ? attackIntensity * size * 0.18 : 0);
  const powerPulse = 0.6 + Math.sin(time * 3) * 0.4 + attackIntensity * 0.4;
  const realityWarp = Math.sin(time * 2) * 0.06 + (isAttacking ? attackIntensity * 0.15 : 0);
  const voidTear = 0.5 + Math.sin(time * 4) * 0.3 + attackIntensity * 0.4;
  const authorityAura = 0.7 + Math.sin(time * 5) * 0.2 + attackIntensity * 0.3;

  // Reality fracturing around the dean
  ctx.save();
  for (let fracture = 0; fracture < 8; fracture++) {
    const fractureAngle = fracture * Math.PI / 4 + time * 0.3;
    const fractureLen = size * (0.4 + Math.sin(time * 2 + fracture) * 0.15);
    ctx.strokeStyle = `rgba(168, 85, 247, ${voidTear * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y);
    let fx = x, fy = y;
    for (let seg = 0; seg < 5; seg++) {
      fx += Math.cos(fractureAngle + (Math.random() - 0.5) * 0.8) * fractureLen * 0.2;
      fy += Math.sin(fractureAngle + (Math.random() - 0.5) * 0.8) * fractureLen * 0.15;
      ctx.lineTo(fx, fy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Reality distortion aura - more dramatic warping
  ctx.strokeStyle = `rgba(168, 85, 247, ${powerPulse * 0.6})`;
  ctx.lineWidth = 3 * zoom;
  for (let i = 0; i < 4; i++) {
    const warpPhase = (time * 0.5 + i * 0.4) % 2;
    const warpSize = size * 0.45 + warpPhase * size * 0.45;
    ctx.globalAlpha = 0.6 * (1 - warpPhase / 2);
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const r = warpSize + Math.sin(a * 8 + time * 4) * size * 0.06;
      const wx = x + Math.cos(a) * r;
      const wy = y + Math.sin(a) * r * 0.55;
      if (a === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Deep void aura with multiple layers
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.95);
  auraGrad.addColorStop(0, `rgba(139, 92, 246, ${powerPulse * 0.4})`);
  auraGrad.addColorStop(0.3, `rgba(168, 85, 247, ${powerPulse * 0.3})`);
  auraGrad.addColorStop(0.6, `rgba(91, 33, 182, ${powerPulse * 0.18})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.95, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting void shards with trails
  for (let i = 0; i < 8; i++) {
    const shardAngle = time * 0.9 + (i * Math.PI) / 4;
    const shardDist = size * 0.6 + Math.sin(time * 2.5 + i) * size * 0.1;
    const sx = x + Math.cos(shardAngle) * shardDist;
    const sy = y - size * 0.08 + Math.sin(shardAngle) * shardDist * 0.4 + hover * 0.4;
    // Trail
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(
      sx - Math.cos(shardAngle) * size * 0.08,
      sy - Math.sin(shardAngle) * size * 0.04
    );
    ctx.stroke();
    // Shard
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(time * 2.5 + i);
    ctx.fillStyle = `rgba(168, 85, 247, ${0.6 + Math.sin(time * 4 + i) * 0.3})`;
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.05);
    ctx.lineTo(size * 0.025, 0);
    ctx.lineTo(0, size * 0.05);
    ctx.lineTo(-size * 0.025, 0);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Void shadow beneath - reality warped
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.58, 0, x, y + size * 0.58, size * 0.55);
  shadowGrad.addColorStop(0, "rgba(30, 10, 60, 0.7)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.4)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.58, size * 0.5, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magnificent flowing robes with reality-warping edges
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(realityWarp);
  const robeGrad = ctx.createLinearGradient(-size * 0.5, -size * 0.45, size * 0.5, size * 0.6);
  robeGrad.addColorStop(0, "#0f0a2a");
  robeGrad.addColorStop(0.2, "#1e1b4b");
  robeGrad.addColorStop(0.4, "#312e81");
  robeGrad.addColorStop(0.5, "#3730a3");
  robeGrad.addColorStop(0.6, "#312e81");
  robeGrad.addColorStop(0.8, "#1e1b4b");
  robeGrad.addColorStop(1, "#0f0a2a");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.48, size * 0.58);
  // Dramatically flowing bottom edge with void wisps
  for (let i = 0; i < 10; i++) {
    const waveX = -size * 0.48 + i * size * 0.096;
    const waveY = size * 0.58 + Math.sin(time * 4 + i * 1.2) * size * 0.05 + (i % 2) * size * 0.04 + (i % 3) * size * 0.02;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(size * 0.6, 0, size * 0.3, -size * 0.42 + hover * 0.15);
  ctx.lineTo(-size * 0.3, -size * 0.42 + hover * 0.15);
  ctx.quadraticCurveTo(-size * 0.6, 0, -size * 0.48, size * 0.58);
  ctx.fill();
  ctx.restore();

  // Void energy patterns on robe
  ctx.strokeStyle = `rgba(168, 85, 247, ${voidTear * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  for (let v = 0; v < 6; v++) {
    const veinX = x - size * 0.3 + v * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(veinX, y - size * 0.2 + hover * 0.1);
    ctx.quadraticCurveTo(
      veinX + Math.sin(time * 2 + v) * size * 0.05,
      y + size * 0.1,
      veinX + Math.cos(v) * size * 0.08,
      y + size * 0.4
    );
    ctx.stroke();
  }

  // Ornate gold and purple trim with gems
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 4.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.36 + hover * 0.15);
  ctx.lineTo(x - size * 0.25, y + size * 0.48);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.36 + hover * 0.15);
  ctx.lineTo(x + size * 0.25, y + size * 0.48);
  ctx.stroke();
  // Gem accents on trim
  ctx.fillStyle = "#a855f7";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 4 * zoom;
  for (let g = 0; g < 3; g++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.225, y + size * 0.05 + g * size * 0.15, size * 0.02, 0, Math.PI * 2);
    ctx.arc(x + size * 0.225, y + size * 0.05 + g * size * 0.15, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Magnificent academic collar with massive central gem
  const collarGrad = ctx.createLinearGradient(x - size * 0.25, y - size * 0.35, x + size * 0.25, y);
  collarGrad.addColorStop(0, "#b8860b");
  collarGrad.addColorStop(0.5, "#c9a227");
  collarGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = collarGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.36 + hover * 0.15);
  ctx.quadraticCurveTo(x, y - size * 0.2 + hover * 0.15, x + size * 0.25, y - size * 0.36 + hover * 0.15);
  ctx.lineTo(x + size * 0.2, y - size * 0.08 + hover * 0.15);
  ctx.quadraticCurveTo(x, y + size * 0.05 + hover * 0.15, x - size * 0.2, y - size * 0.08 + hover * 0.15);
  ctx.fill();
  // Central void gem
  ctx.fillStyle = "#a855f7";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + hover * 0.15);
  ctx.lineTo(x + size * 0.07, y - size * 0.18 + hover * 0.15);
  ctx.lineTo(x, y - size * 0.08 + hover * 0.15);
  ctx.lineTo(x - size * 0.07, y - size * 0.18 + hover * 0.15);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Inner gem glow
  ctx.fillStyle = "#e9d5ff";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.19 + hover * 0.15, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Commanding face - otherworldly beauty
  const faceGrad = ctx.createRadialGradient(x, y - size * 0.55 + hover, 0, x, y - size * 0.55 + hover, size * 0.26);
  faceGrad.addColorStop(0, "#f3e8ff");
  faceGrad.addColorStop(0.5, "#e9d5ff");
  faceGrad.addColorStop(1, "#d8b4fe");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.55 + hover, size * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Distinguished but otherworldly features - sunken cheeks
  ctx.fillStyle = "rgba(91, 33, 182, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.13, y - size * 0.48 + hover, size * 0.045, size * 0.07, 0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.13, y - size * 0.48 + hover, size * 0.045, size * 0.07, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Intense glowing eyes of absolute authority
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.09, y - size * 0.57 + hover, size * 0.055, size * 0.065, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.09, y - size * 0.57 + hover, size * 0.055, size * 0.065, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a855f7";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.57 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, y - size * 0.57 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Void pupils
  ctx.fillStyle = "#1e0a3a";
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.57 + hover, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, y - size * 0.57 + hover, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Stern furrowed brows
  ctx.strokeStyle = "#581c87";
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.62 + hover);
  ctx.quadraticCurveTo(x - size * 0.09, y - size * 0.67, x - size * 0.02, y - size * 0.63 + hover);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.17, y - size * 0.62 + hover);
  ctx.quadraticCurveTo(x + size * 0.09, y - size * 0.67, x + size * 0.02, y - size * 0.63 + hover);
  ctx.stroke();

  // Stern authoritative mouth
  ctx.strokeStyle = "#6b21a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.43 + hover);
  ctx.lineTo(x + size * 0.09, y - size * 0.43 + hover);
  ctx.stroke();

  // Distinguished hair/crown of void energy
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.72 + hover, size * 0.2, size * 0.1, 0, 0, Math.PI);
  ctx.fill();
  // Void energy tendrils from head
  ctx.strokeStyle = `rgba(168, 85, 247, ${authorityAura * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  for (let t = 0; t < 5; t++) {
    const tendrilAngle = -Math.PI * 0.4 + t * Math.PI * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(tendrilAngle) * size * 0.15, y - size * 0.72 + hover);
    ctx.quadraticCurveTo(
      x + Math.cos(tendrilAngle) * size * 0.25 + Math.sin(time * 3 + t) * size * 0.05,
      y - size * 0.85 + hover,
      x + Math.cos(tendrilAngle) * size * 0.2,
      y - size * 0.92 + hover + Math.sin(time * 4 + t) * size * 0.03
    );
    ctx.stroke();
  }

  // Elaborate mortarboard floating with void energy
  ctx.save();
  ctx.translate(x, y - size * 0.78 + hover + Math.sin(time * 2.5) * 4);
  ctx.rotate(Math.sin(time * 1.8) * 0.04);
  // Cap base
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05, size * 0.22, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  // Diamond-shaped board with ornate edges
  ctx.fillStyle = "#312e81";
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, 0);
  ctx.lineTo(0, -size * 0.12);
  ctx.lineTo(size * 0.28, 0);
  ctx.lineTo(0, size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Golden ornate border
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 3 * zoom;
  ctx.stroke();
  // Corner gems
  ctx.fillStyle = "#a855f7";
  ctx.beginPath();
  ctx.arc(-size * 0.28, 0, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.28, 0, size * 0.025, 0, Math.PI * 2);
  ctx.arc(0, -size * 0.12, size * 0.025, 0, Math.PI * 2);
  ctx.arc(0, size * 0.12, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Central power gem
  ctx.fillStyle = "#a855f7";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Ornate golden tassel
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    size * 0.15 + Math.sin(time * 5) * size * 0.06,
    size * 0.1,
    size * 0.2 + Math.cos(time * 4) * size * 0.04,
    size * 0.2,
    size * 0.17,
    size * 0.3
  );
  ctx.stroke();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(size * 0.17, size * 0.32, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  // Tassel threads
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.17, size * 0.34);
    ctx.lineTo(
      size * 0.13 + i * size * 0.013 + Math.sin(time * 6 + i) * size * 0.012,
      size * 0.45
    );
    ctx.stroke();
  }
  ctx.restore();

  // Staff of absolute office - scepter of void authority
  ctx.save();
  ctx.translate(x + size * 0.5, y - size * 0.12 + hover);
  ctx.rotate(0.18 + Math.sin(time * 2.2) * 0.06);
  // Ornate staff body
  const staffGrad = ctx.createLinearGradient(0, -size * 0.4, 0, size * 0.4);
  staffGrad.addColorStop(0, "#1e1b4b");
  staffGrad.addColorStop(0.5, "#312e81");
  staffGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = staffGrad;
  ctx.fillRect(-size * 0.03, -size * 0.4, size * 0.06, size * 0.8);
  // Gold rings and decorations
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.04, -size * 0.35, size * 0.08, size * 0.05);
  ctx.fillRect(-size * 0.04, -size * 0.05, size * 0.08, size * 0.05);
  ctx.fillRect(-size * 0.04, size * 0.25, size * 0.08, size * 0.05);
  // Spiral gold inlay
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  for (let s = 0; s < 10; s++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, -size * 0.28 + s * size * 0.06);
    ctx.lineTo(size * 0.03, -size * 0.25 + s * size * 0.06);
    ctx.stroke();
  }
  // Crown top
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.07, -size * 0.4);
  ctx.lineTo(-size * 0.05, -size * 0.52);
  ctx.lineTo(-size * 0.02, -size * 0.45);
  ctx.lineTo(0, -size * 0.55);
  ctx.lineTo(size * 0.02, -size * 0.45);
  ctx.lineTo(size * 0.05, -size * 0.52);
  ctx.lineTo(size * 0.07, -size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Massive void power orb
  ctx.fillStyle = "#a855f7";
  ctx.shadowColor = "#a855f7";
  ctx.shadowBlur = 15 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.62, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Inner orb details
  ctx.fillStyle = "#e9d5ff";
  ctx.beginPath();
  ctx.arc(-size * 0.02, -size * 0.64, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Void energy swirling in orb
  ctx.strokeStyle = "#1e1b4b";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.62, size * 0.05, time * 3, time * 3 + Math.PI);
  ctx.stroke();
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
  isFlying: boolean,
  attackPhase: number = 0
) {
  // TEMPEST GRIFFIN - Elemental chaos beast with storm wings and lightning breath
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const swoop = Math.sin(time * 4) * 5 * zoom + (isAttacking ? attackIntensity * size * 0.2 : 0);
  const wingFlap = Math.sin(time * 12) * 0.55;
  const stormPulse = 0.6 + Math.sin(time * 6) * 0.4;
  const lightningFlash = Math.sin(time * 15) > 0.7 ? 1 : 0.3;

  // Storm cloud aura
  ctx.save();
  for (let cloud = 0; cloud < 5; cloud++) {
    const cloudAngle = time * 0.5 + cloud * Math.PI * 0.4;
    const cloudDist = size * 0.6 + Math.sin(time * 2 + cloud) * size * 0.1;
    const cx = x + Math.cos(cloudAngle) * cloudDist;
    const cy = y - size * 0.1 + Math.sin(cloudAngle) * cloudDist * 0.4;
    ctx.fillStyle = `rgba(55, 65, 81, ${0.3 - cloud * 0.05})`;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.1, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.05, cy - size * 0.03, size * 0.07, 0, Math.PI * 2);
    ctx.arc(cx - size * 0.04, cy + size * 0.02, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Lightning bolts in aura
  if (lightningFlash > 0.5) {
    ctx.strokeStyle = `rgba(103, 232, 249, ${lightningFlash})`;
    ctx.lineWidth = 2 * zoom;
    for (let bolt = 0; bolt < 3; bolt++) {
      const boltAngle = time * 2 + bolt * Math.PI * 0.67;
      ctx.beginPath();
      let bx = x + Math.cos(boltAngle) * size * 0.3;
      let by = y + Math.sin(boltAngle) * size * 0.25;
      ctx.moveTo(bx, by);
      for (let seg = 0; seg < 3; seg++) {
        bx += (Math.random() - 0.5) * size * 0.15;
        by += size * 0.08;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
  }

  // Blazing chaos aura - more intense
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  auraGrad.addColorStop(0, `rgba(34, 211, 238, ${stormPulse * 0.4})`);
  auraGrad.addColorStop(0.3, `rgba(6, 182, 212, ${stormPulse * 0.3})`);
  auraGrad.addColorStop(0.6, `rgba(8, 145, 178, ${stormPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Spectral fire particles - more numerous
  for (let i = 0; i < 12; i++) {
    const particlePhase = (time * 2.5 + i * 0.25) % 1.5;
    const px = x + Math.sin(time * 3.5 + i * 1.0) * size * 0.45;
    const py = y + size * 0.25 - particlePhase * size * 0.6;
    ctx.fillStyle = `rgba(34, 211, 238, ${(1 - particlePhase / 1.5) * 0.7})`;
    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.035 * (1 - particlePhase / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Magnificent storm wings
  if (isFlying) {
    // Left wing - feathered with lightning veins
    ctx.save();
    ctx.translate(x - size * 0.28, y - size * 0.12 + swoop * 0.3);
    ctx.rotate(-0.45 - wingFlap);
    const wingGradL = ctx.createLinearGradient(0, 0, -size * 0.9, 0);
    wingGradL.addColorStop(0, "#0e7490");
    wingGradL.addColorStop(0.3, "#0891b2");
    wingGradL.addColorStop(0.6, "#06b6d4");
    wingGradL.addColorStop(1, "#22d3ee");
    ctx.fillStyle = wingGradL;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-size * 0.35, -size * 0.45, -size * 0.8, -size * 0.3);
    ctx.lineTo(-size * 0.9, -size * 0.18);
    ctx.lineTo(-size * 0.72, -size * 0.06);
    ctx.lineTo(-size * 0.85, size * 0.06);
    ctx.lineTo(-size * 0.62, size * 0.1);
    ctx.lineTo(-size * 0.68, size * 0.22);
    ctx.lineTo(-size * 0.4, size * 0.15);
    ctx.quadraticCurveTo(-size * 0.18, size * 0.18, 0, size * 0.12);
    ctx.closePath();
    ctx.fill();
    // Wing feather details with lightning
    ctx.strokeStyle = "#67e8f9";
    ctx.lineWidth = 2 * zoom;
    for (let f = 0; f < 6; f++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.12 - f * size * 0.13, size * 0.06);
      ctx.lineTo(-size * 0.22 - f * size * 0.15, -size * 0.18);
      ctx.stroke();
    }
    // Lightning veins on wing
    ctx.strokeStyle = `rgba(165, 243, 252, ${lightningFlash * 0.6})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, 0);
    ctx.lineTo(-size * 0.35, -size * 0.1);
    ctx.lineTo(-size * 0.5, -size * 0.08);
    ctx.lineTo(-size * 0.65, -size * 0.15);
    ctx.stroke();
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.translate(x + size * 0.28, y - size * 0.12 + swoop * 0.3);
    ctx.rotate(0.45 + wingFlap);
    const wingGradR = ctx.createLinearGradient(0, 0, size * 0.9, 0);
    wingGradR.addColorStop(0, "#0e7490");
    wingGradR.addColorStop(0.3, "#0891b2");
    wingGradR.addColorStop(0.6, "#06b6d4");
    wingGradR.addColorStop(1, "#22d3ee");
    ctx.fillStyle = wingGradR;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.35, -size * 0.45, size * 0.8, -size * 0.3);
    ctx.lineTo(size * 0.9, -size * 0.18);
    ctx.lineTo(size * 0.72, -size * 0.06);
    ctx.lineTo(size * 0.85, size * 0.06);
    ctx.lineTo(size * 0.62, size * 0.1);
    ctx.lineTo(size * 0.68, size * 0.22);
    ctx.lineTo(size * 0.4, size * 0.15);
    ctx.quadraticCurveTo(size * 0.18, size * 0.18, 0, size * 0.12);
    ctx.closePath();
    ctx.fill();
    // Wing feather details
    ctx.strokeStyle = "#67e8f9";
    ctx.lineWidth = 2 * zoom;
    for (let f = 0; f < 6; f++) {
      ctx.beginPath();
      ctx.moveTo(size * 0.12 + f * size * 0.13, size * 0.06);
      ctx.lineTo(size * 0.22 + f * size * 0.15, -size * 0.18);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Storm tail with lightning
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.22 + swoop * 0.2);
  ctx.rotate(Math.sin(time * 5) * 0.35);
  // Tail base
  const tailGrad = ctx.createLinearGradient(0, 0, size * 0.6, 0);
  tailGrad.addColorStop(0, "#0e7490");
  tailGrad.addColorStop(0.5, "#0891b2");
  tailGrad.addColorStop(1, "#22d3ee");
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.04);
  ctx.quadraticCurveTo(size * 0.35, -size * 0.08, size * 0.55, 0);
  ctx.quadraticCurveTo(size * 0.35, size * 0.08, 0, size * 0.04);
  ctx.fill();
  // Tail flames - more elaborate
  for (let i = 0; i < 4; i++) {
    const flameY = Math.sin(time * 8 + i * 1.2) * size * 0.06;
    ctx.fillStyle = `rgba(103, 232, 249, ${0.7 - i * 0.12})`;
    ctx.shadowColor = "#67e8f9";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.5 + i * size * 0.1, flameY);
    ctx.quadraticCurveTo(
      size * 0.6 + i * size * 0.12,
      flameY - size * 0.1,
      size * 0.68 + i * size * 0.14,
      flameY
    );
    ctx.quadraticCurveTo(
      size * 0.6 + i * size * 0.12,
      flameY + size * 0.08,
      size * 0.5 + i * size * 0.1,
      flameY
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Powerful leonine body with armored scales
  const bodyGrad = ctx.createRadialGradient(x, y + swoop * 0.2, 0, x, y + swoop * 0.2, size * 0.48);
  bodyGrad.addColorStop(0, "#155e75");
  bodyGrad.addColorStop(0.4, "#0e7490");
  bodyGrad.addColorStop(0.7, "#0891b2");
  bodyGrad.addColorStop(1, "#06b6d4");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.06 + swoop * 0.2, size * 0.38, size * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();
  // Scale pattern
  ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const sx = x - size * 0.2 + col * size * 0.1 + (row % 2) * size * 0.05;
      const sy = y - size * 0.1 + row * size * 0.12 + swoop * 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.04, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.stroke();
    }
  }

  // Chest feathers with luminescence
  const chestGrad = ctx.createRadialGradient(x, y - size * 0.08 + swoop * 0.2, 0, x, y - size * 0.08 + swoop * 0.2, size * 0.24);
  chestGrad.addColorStop(0, "#cffafe");
  chestGrad.addColorStop(0.5, "#a5f3fc");
  chestGrad.addColorStop(1, "#67e8f9");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.08 + swoop * 0.2, size * 0.2, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  // Feather texture - more detailed
  ctx.strokeStyle = "#22d3ee";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(x, y + size * 0.06 + swoop * 0.2, size * 0.09 + i * size * 0.028, 0.55 * Math.PI, 0.45 * Math.PI, true);
    ctx.stroke();
  }

  // Majestic eagle head with crest
  const headGrad = ctx.createRadialGradient(x, y - size * 0.4 + swoop, 0, x, y - size * 0.4 + swoop, size * 0.28);
  headGrad.addColorStop(0, "#0e7490");
  headGrad.addColorStop(0.6, "#0891b2");
  headGrad.addColorStop(1, "#06b6d4");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + swoop, size * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Crown crest feathers - more elaborate
  ctx.fillStyle = "#22d3ee";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 4 * zoom;
  for (let i = 0; i < 9; i++) {
    const crestAngle = -Math.PI * 0.45 + i * Math.PI * 0.11;
    const crestLen = size * (0.18 + Math.sin(time * 6 + i * 0.8) * 0.04);
    ctx.save();
    ctx.translate(x + Math.cos(crestAngle) * size * 0.2, y - size * 0.55 + swoop);
    ctx.rotate(crestAngle + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.035, -crestLen);
    ctx.lineTo(0, -crestLen * 1.1);
    ctx.lineTo(size * 0.035, -crestLen);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.shadowBlur = 0;

  // Fierce glowing eyes with lightning reflection
  ctx.fillStyle = "#fef08a";
  ctx.shadowColor = "#fef08a";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.42 + swoop, size * 0.072, size * 0.055, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.42 + swoop, size * 0.072, size * 0.055, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Predator slit pupils
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.42 + swoop, size * 0.022, size * 0.045, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.42 + swoop, size * 0.022, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  // Lightning reflection in eyes
  ctx.fillStyle = `rgba(103, 232, 249, ${lightningFlash * 0.5})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.44 + swoop, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.44 + swoop, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Sharp hooked beak with golden sheen
  const beakGrad = ctx.createLinearGradient(x - size * 0.1, y - size * 0.35, x + size * 0.1, y - size * 0.2);
  beakGrad.addColorStop(0, "#f59e0b");
  beakGrad.addColorStop(0.5, "#fbbf24");
  beakGrad.addColorStop(1, "#f59e0b");
  ctx.fillStyle = beakGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.37 + swoop);
  ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.34 + swoop, x - size * 0.06, y - size * 0.22 + swoop);
  ctx.lineTo(x, y - size * 0.17 + swoop);
  ctx.lineTo(x + size * 0.06, y - size * 0.22 + swoop);
  ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.34 + swoop, x, y - size * 0.37 + swoop);
  ctx.fill();
  // Beak detail
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.37 + swoop);
  ctx.lineTo(x, y - size * 0.19 + swoop);
  ctx.stroke();
  // Beak hook
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.18 + swoop, size * 0.02, 0, Math.PI);
  ctx.fill();

  // Powerful talons with golden claws
  for (let side of [-1, 1]) {
    ctx.save();
    ctx.translate(x + side * size * 0.22, y + size * 0.44 + swoop * 0.1);
    // Feathered leg
    const legGrad = ctx.createLinearGradient(0, -size * 0.18, 0, 0);
    legGrad.addColorStop(0, "#0891b2");
    legGrad.addColorStop(1, "#0e7490");
    ctx.fillStyle = legGrad;
    ctx.fillRect(-size * 0.045, -size * 0.18, size * 0.09, size * 0.18);
    // Leg scales
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 1 * zoom;
    for (let s = 0; s < 4; s++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.04, -size * 0.15 + s * size * 0.04);
      ctx.lineTo(size * 0.04, -size * 0.13 + s * size * 0.04);
      ctx.stroke();
    }
    // Golden talons
    ctx.fillStyle = "#fbbf24";
    ctx.shadowColor = "#fbbf24";
    ctx.shadowBlur = 2 * zoom;
    for (let t = 0; t < 3; t++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.045 + t * size * 0.045, 0);
      ctx.lineTo(-size * 0.055 + t * size * 0.055, size * 0.14);
      ctx.lineTo(-size * 0.02 + t * size * 0.045, 0);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Blazing trail effect (for flying) - more dramatic
  if (isFlying) {
    ctx.globalAlpha = 0.5;
    for (let t = 1; t < 5; t++) {
      ctx.fillStyle = `rgba(34, 211, 238, ${0.35 - t * 0.07})`;
      ctx.beginPath();
      ctx.ellipse(
        x + t * 7,
        y + t * 5 + swoop * 0.2,
        size * 0.28 - t * size * 0.045,
        size * 0.34 - t * size * 0.06,
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
  zoom: number,
  attackPhase: number = 0
) {
  // VOID ACOLYTE - Mysterious shadowy figure with dark energy
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const bob = Math.sin(time * 4) * 3 * zoom + (isAttacking ? attackIntensity * size * 0.1 : 0);
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
  zoom: number,
  attackPhase: number = 0
) {
  // MAMMON'S CHOSEN - Corruption incarnate with gold-blood veins and wealth magic
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const float = Math.sin(time * 1.5) * 5 * zoom + (isAttacking ? attackIntensity * size * 0.15 : 0);
  const goldPulse = 0.7 + Math.sin(time * 4) * 0.3;
  const wealthAura = 0.5 + Math.sin(time * 3) * 0.3;
  const corruptionPulse = 0.6 + Math.sin(time * 5) * 0.3;
  const greedAura = 0.5 + Math.sin(time * 2.5) * 0.4;

  // Golden corruption tendrils reaching outward
  ctx.save();
  for (let tendril = 0; tendril < 6; tendril++) {
    const tendrilAngle = tendril * Math.PI / 3 + time * 0.2;
    ctx.strokeStyle = `rgba(251, 191, 36, ${wealthAura * 0.4})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y);
    let tx = x, ty = y;
    for (let seg = 0; seg < 4; seg++) {
      tx += Math.cos(tendrilAngle + Math.sin(time * 2 + seg) * 0.3) * size * 0.15;
      ty += Math.sin(tendrilAngle + Math.sin(time * 2 + seg) * 0.3) * size * 0.12;
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Golden reality distortion field - more elaborate
  ctx.strokeStyle = `rgba(234, 179, 8, ${wealthAura * 0.6})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const ringPhase = (time * 0.6 + i * 0.35) % 2;
    const ringSize = size * 0.4 + ringPhase * size * 0.4;
    ctx.globalAlpha = 0.6 * (1 - ringPhase / 2);
    ctx.beginPath();
    // Irregular ring shape
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const r = ringSize + Math.sin(a * 5 + time * 3) * size * 0.03;
      const rx = x + Math.cos(a) * r;
      const ry = y + Math.sin(a) * r * 0.6;
      if (a === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Radiant wealth aura with corruption undertones
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.95);
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${goldPulse * 0.45})`);
  auraGrad.addColorStop(0.3, `rgba(234, 179, 8, ${goldPulse * 0.3})`);
  auraGrad.addColorStop(0.6, `rgba(146, 64, 14, ${goldPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.95, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting treasure - elaborate display of wealth with magical auras
  for (let i = 0; i < 10; i++) {
    const itemAngle = time * 1.2 + i * Math.PI * 0.2;
    const itemDist = size * 0.58 + Math.sin(time * 2.5 + i) * size * 0.1;
    const itemX = x + Math.cos(itemAngle) * itemDist;
    const itemY = y - size * 0.05 + Math.sin(itemAngle) * itemDist * 0.38 + float * 0.25;
    ctx.save();
    ctx.translate(itemX, itemY);
    ctx.rotate(time * 2.5 + i);
    if (i % 4 === 0) {
      // Ancient gold coin with skull
      ctx.fillStyle = "#ffd700";
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.055, size * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.arc(0, -size * 0.005, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (i % 4 === 1) {
      // Ruby gem with inner fire
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#dc2626";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.045);
      ctx.lineTo(size * 0.035, 0);
      ctx.lineTo(0, size * 0.045);
      ctx.lineTo(-size * 0.035, 0);
      ctx.fill();
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath();
      ctx.arc(-size * 0.008, -size * 0.012, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (i % 4 === 2) {
      // Emerald with corruption
      ctx.fillStyle = "#059669";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 4 * zoom;
      ctx.fillRect(-size * 0.028, -size * 0.04, size * 0.056, size * 0.08);
      ctx.fillStyle = "#6ee7b7";
      ctx.fillRect(-size * 0.015, -size * 0.028, size * 0.015, size * 0.022);
      ctx.shadowBlur = 0;
    } else {
      // Sapphire
      ctx.fillStyle = "#2563eb";
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.04);
      ctx.lineTo(size * 0.03, -size * 0.01);
      ctx.lineTo(size * 0.02, size * 0.03);
      ctx.lineTo(-size * 0.02, size * 0.03);
      ctx.lineTo(-size * 0.03, -size * 0.01);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // Lavish shadow with gold tint
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.58, 0, x, y + size * 0.58, size * 0.5);
  shadowGrad.addColorStop(0, "rgba(120, 80, 0, 0.5)");
  shadowGrad.addColorStop(0.5, "rgba(60, 40, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.58, size * 0.5, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magnificent golden robes with purple velvet lining and corruption veins
  const robeGrad = ctx.createLinearGradient(x - size * 0.5, y, x + size * 0.5, y);
  robeGrad.addColorStop(0, "#78350f");
  robeGrad.addColorStop(0.15, "#92400e");
  robeGrad.addColorStop(0.3, "#d97706");
  robeGrad.addColorStop(0.45, "#fbbf24");
  robeGrad.addColorStop(0.55, "#fcd34d");
  robeGrad.addColorStop(0.7, "#fbbf24");
  robeGrad.addColorStop(0.85, "#d97706");
  robeGrad.addColorStop(1, "#78350f");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.52, y + size * 0.58);
  // Dramatically flowing bottom with tendrils
  for (let i = 0; i < 8; i++) {
    const waveX = x - size * 0.52 + i * size * 0.13;
    const waveY = y + size * 0.58 + Math.sin(time * 4 + i * 1.1) * size * 0.04 + (i % 2) * size * 0.025;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(x + size * 0.6, y - size * 0.1, x + size * 0.25, y - size * 0.42 + float);
  ctx.lineTo(x - size * 0.25, y - size * 0.42 + float);
  ctx.quadraticCurveTo(x - size * 0.6, y - size * 0.1, x - size * 0.52, y + size * 0.58);
  ctx.fill();

  // Gold-blood veins on robe
  ctx.strokeStyle = `rgba(251, 191, 36, ${corruptionPulse * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let v = 0; v < 5; v++) {
    const veinX = x - size * 0.35 + v * size * 0.175;
    ctx.beginPath();
    ctx.moveTo(veinX, y - size * 0.3 + float * 0.1);
    ctx.bezierCurveTo(
      veinX + Math.sin(time * 2 + v) * size * 0.06,
      y,
      veinX - Math.cos(time * 2 + v) * size * 0.04,
      y + size * 0.2,
      veinX + Math.sin(v) * size * 0.08,
      y + size * 0.45
    );
    ctx.stroke();
  }

  // Purple velvet inner lining with ornate pattern
  const innerGrad = ctx.createLinearGradient(x - size * 0.15, y, x + size * 0.15, y);
  innerGrad.addColorStop(0, "#3b0764");
  innerGrad.addColorStop(0.5, "#581c87");
  innerGrad.addColorStop(1, "#3b0764");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.36 + float);
  ctx.quadraticCurveTo(x, y - size * 0.18 + float, x + size * 0.17, y - size * 0.36 + float);
  ctx.lineTo(x + size * 0.14, y + size * 0.35);
  ctx.quadraticCurveTo(x, y + size * 0.45, x - size * 0.14, y + size * 0.35);
  ctx.fill();

  // Ornate gold collar with massive gems - more elaborate
  const collarGrad = ctx.createLinearGradient(x - size * 0.22, y - size * 0.35, x + size * 0.22, y - size * 0.1);
  collarGrad.addColorStop(0, "#b8860b");
  collarGrad.addColorStop(0.3, "#fbbf24");
  collarGrad.addColorStop(0.5, "#fcd34d");
  collarGrad.addColorStop(0.7, "#fbbf24");
  collarGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = collarGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.36 + float);
  ctx.quadraticCurveTo(x, y - size * 0.22 + float, x + size * 0.22, y - size * 0.36 + float);
  ctx.lineTo(x + size * 0.2, y - size * 0.12 + float);
  ctx.quadraticCurveTo(x, y - size * 0.02 + float, x - size * 0.2, y - size * 0.12 + float);
  ctx.fill();
  // Collar filigree
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.28 + float);
  ctx.quadraticCurveTo(x, y - size * 0.18 + float, x + size * 0.15, y - size * 0.28 + float);
  ctx.stroke();
  // Central diamond - massive
  ctx.fillStyle = "#e0f2fe";
  ctx.shadowColor = "#e0f2fe";
  ctx.shadowBlur = 14 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32 + float);
  ctx.lineTo(x + size * 0.08, y - size * 0.22 + float);
  ctx.lineTo(x, y - size * 0.1 + float);
  ctx.lineTo(x - size * 0.08, y - size * 0.22 + float);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Diamond inner gleam
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(x - size * 0.02, y - size * 0.24 + float, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  // Side rubies
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.14, y - size * 0.26 + float, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.14, y - size * 0.26 + float, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Distinguished aged face with corruption hints
  const faceGrad = ctx.createRadialGradient(x, y - size * 0.5 + float, 0, x, y - size * 0.5 + float, size * 0.24);
  faceGrad.addColorStop(0, "#fef9e7");
  faceGrad.addColorStop(0.6, "#fef3c7");
  faceGrad.addColorStop(1, "#fde68a");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5 + float, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Gold-blood veins on face
  ctx.strokeStyle = `rgba(251, 191, 36, ${greedAura * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.55 + float);
  ctx.quadraticCurveTo(x - size * 0.12, y - size * 0.45 + float, x - size * 0.18, y - size * 0.38 + float);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.55 + float);
  ctx.quadraticCurveTo(x + size * 0.12, y - size * 0.45 + float, x + size * 0.18, y - size * 0.38 + float);
  ctx.stroke();

  // Wrinkles of experience and greed
  ctx.strokeStyle = "rgba(180, 140, 100, 0.35)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.13, y - size * 0.44 + float, size * 0.045, 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.13, y - size * 0.44 + float, size * 0.045, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Ornate golden monocle with magic lens
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.11, y - size * 0.52 + float, size * 0.09, 0, Math.PI * 2);
  ctx.stroke();
  // Monocle lens with gold gleam
  ctx.fillStyle = `rgba(251, 191, 36, ${goldPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.11, y - size * 0.52 + float, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(x + size * 0.09, y - size * 0.54 + float, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Ornate gold chain
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.52 + float);
  ctx.bezierCurveTo(
    x + size * 0.28, y - size * 0.42 + float,
    x + size * 0.26, y - size * 0.28 + float,
    x + size * 0.22, y - size * 0.18 + float
  );
  ctx.stroke();

  // Piercing calculating eyes with greed glow
  ctx.fillStyle = "#fef9e7";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.09, y - size * 0.52 + float, size * 0.05, size * 0.055, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.11, y - size * 0.52 + float, size * 0.045, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Gold-touched irises
  ctx.fillStyle = "#b8860b";
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.52 + float, size * 0.028, 0, Math.PI * 2);
  ctx.arc(x + size * 0.11, y - size * 0.52 + float, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Pupils with gold gleam
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.52 + float, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.11, y - size * 0.52 + float, size * 0.01, 0, Math.PI * 2);
  ctx.fill();
  // Eye gleam (greed)
  ctx.fillStyle = `rgba(251, 191, 36, ${goldPulse})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.52 + float, size * 0.014, 0, Math.PI * 2);
  ctx.arc(x + size * 0.11, y - size * 0.52 + float, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Cruel mouth
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.38 + float);
  ctx.quadraticCurveTo(x, y - size * 0.35 + float, x + size * 0.08, y - size * 0.38 + float);
  ctx.stroke();

  // Silver streaked hair/receding hairline
  ctx.fillStyle = "#6b7280";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.68 + float, size * 0.18, size * 0.08, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 1.5 * zoom;
  for (let h = 0; h < 5; h++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.12 + h * size * 0.06, y - size * 0.68 + float);
    ctx.lineTo(x - size * 0.1 + h * size * 0.05 + Math.sin(h) * size * 0.02, y - size * 0.75 + float);
    ctx.stroke();
  }

  // Magnificent top hat with jeweled band - even more elaborate
  ctx.fillStyle = "#0f0f0f";
  // Brim with gold edge
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.72 + float, size * 0.26, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Crown
  const hatGrad = ctx.createLinearGradient(x - size * 0.17, y - size * 1.0, x + size * 0.17, y - size * 1.0);
  hatGrad.addColorStop(0, "#1c1917");
  hatGrad.addColorStop(0.5, "#374151");
  hatGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = hatGrad;
  ctx.fillRect(x - size * 0.17, y - size * 1.0 + float, size * 0.34, size * 0.3);
  // Top
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 1.0 + float, size * 0.17, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Jeweled gold band
  const bandGrad = ctx.createLinearGradient(x - size * 0.18, y - size * 0.82, x + size * 0.18, y - size * 0.82);
  bandGrad.addColorStop(0, "#b8860b");
  bandGrad.addColorStop(0.5, "#fbbf24");
  bandGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(x - size * 0.18, y - size * 0.82 + float, size * 0.36, size * 0.07);
  // Gems on band - larger and more elaborate
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.785 + float, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#059669";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.785 + float, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#2563eb";
  ctx.shadowColor = "#3b82f6";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.785 + float, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ornate staff of wealth (scepter) - more elaborate
  ctx.save();
  ctx.translate(x - size * 0.5, y - size * 0.15 + float);
  ctx.rotate(-0.22 + Math.sin(time * 2.2) * 0.06);
  // Staff body (ebony with gold inlay)
  const staffBodyGrad = ctx.createLinearGradient(-size * 0.035, 0, size * 0.035, 0);
  staffBodyGrad.addColorStop(0, "#1c1917");
  staffBodyGrad.addColorStop(0.5, "#374151");
  staffBodyGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = staffBodyGrad;
  ctx.fillRect(-size * 0.035, -size * 0.45, size * 0.07, size * 0.9);
  // Gold spiral inlay
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.035, -size * 0.4 + i * size * 0.09);
    ctx.lineTo(size * 0.035, -size * 0.35 + i * size * 0.09);
    ctx.stroke();
  }
  // Gold rings
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(-size * 0.045, -size * 0.45, size * 0.09, size * 0.04);
  ctx.fillRect(-size * 0.045, size * 0.35, size * 0.09, size * 0.04);
  // Crown top with elaborate design
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(-size * 0.09, -size * 0.45);
  ctx.lineTo(-size * 0.07, -size * 0.58);
  ctx.lineTo(-size * 0.03, -size * 0.52);
  ctx.lineTo(0, -size * 0.62);
  ctx.lineTo(size * 0.03, -size * 0.52);
  ctx.lineTo(size * 0.07, -size * 0.58);
  ctx.lineTo(size * 0.09, -size * 0.45);
  ctx.closePath();
  ctx.fill();
  // Legendary gem - soul-capturing
  ctx.fillStyle = "#fbbf24";
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 15 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.68, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Inner glow
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.arc(-size * 0.025, -size * 0.7, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Swirling souls inside gem
  ctx.strokeStyle = `rgba(120, 53, 15, ${corruptionPulse * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.68, size * 0.05, time * 4, time * 4 + Math.PI);
  ctx.stroke();
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
  zoom: number,
  attackPhase: number = 0
) {
  // PHANTOM DEADEYE - Spectral hunter with soul-piercing arrows and shadow magic
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const stance = Math.sin(time * 2.5) * 2.5 * zoom + (isAttacking ? attackIntensity * size * 0.12 : 0);
  const drawPull = 0.35 + Math.sin(time * 1.8) * 0.3;
  const shadowPulse = 0.6 + Math.sin(time * 4) * 0.4;
  const deathAura = 0.5 + Math.sin(time * 5) * 0.3;
  const soulFlicker = Math.sin(time * 8) > 0.3 ? 1 : 0.7;

  // Shadow tendrils reaching out
  ctx.save();
  for (let tendril = 0; tendril < 5; tendril++) {
    const tendrilAngle = tendril * Math.PI * 0.4 - Math.PI * 0.5 + Math.sin(time * 0.5) * 0.2;
    ctx.strokeStyle = `rgba(6, 78, 59, ${deathAura * 0.4})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    let tx = x, ty = y + size * 0.3;
    for (let seg = 0; seg < 4; seg++) {
      tx += Math.cos(tendrilAngle + Math.sin(time * 2 + seg) * 0.4) * size * 0.12;
      ty += Math.sin(tendrilAngle + Math.sin(time * 2 + seg) * 0.3) * size * 0.08;
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Death magic aura - more ominous
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
  auraGrad.addColorStop(0, `rgba(16, 185, 129, ${shadowPulse * 0.3})`);
  auraGrad.addColorStop(0.3, `rgba(5, 150, 105, ${shadowPulse * 0.2})`);
  auraGrad.addColorStop(0.6, `rgba(6, 78, 59, ${shadowPulse * 0.1})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Floating soul wisps/death leaves
  for (let i = 0; i < 8; i++) {
    const leafAngle = time * 1.2 + i * Math.PI * 0.25;
    const leafDist = size * 0.5 + Math.sin(time * 2.5 + i) * size * 0.12;
    const lx = x + Math.cos(leafAngle) * leafDist;
    const ly = y + Math.sin(leafAngle) * leafDist * 0.5;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(time * 2.5 + i);
    ctx.fillStyle = `rgba(52, 211, 153, ${0.4 + Math.sin(time * 3.5 + i) * 0.25})`;
    ctx.shadowColor = "#34d399";
    ctx.shadowBlur = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.02);
    ctx.quadraticCurveTo(size * 0.03, 0, 0, size * 0.02);
    ctx.quadraticCurveTo(-size * 0.03, 0, 0, -size * 0.02);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Shadow beneath - darker
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.35);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Enchanted quiver with soul-bound arrows
  ctx.save();
  ctx.translate(x + size * 0.28, y - size * 0.06 + stance * 0.3);
  ctx.rotate(0.28);
  // Quiver body with runes
  const quiverGrad = ctx.createLinearGradient(-size * 0.08, 0, size * 0.08, 0);
  quiverGrad.addColorStop(0, "#1c1917");
  quiverGrad.addColorStop(0.5, "#292524");
  quiverGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = quiverGrad;
  ctx.fillRect(-size * 0.08, -size * 0.4, size * 0.16, size * 0.5);
  // Leather straps
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.38);
  ctx.lineTo(-size * 0.06, size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.06, -size * 0.38);
  ctx.lineTo(size * 0.06, size * 0.08);
  ctx.stroke();
  // Soul runes on quiver
  ctx.strokeStyle = `rgba(52, 211, 153, ${shadowPulse * 0.6})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.lineTo(-size * 0.03, -size * 0.2);
  ctx.lineTo(size * 0.03, -size * 0.1);
  ctx.lineTo(0, 0);
  ctx.stroke();
  // Soul arrows
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = "#047857";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.05 + i * size * 0.02, -size * 0.38);
    ctx.lineTo(-size * 0.05 + i * size * 0.02, -size * 0.6);
    ctx.stroke();
    // Soul-fire arrowhead
    ctx.fillStyle = `rgba(52, 211, 153, ${soulFlicker})`;
    ctx.shadowColor = "#34d399";
    ctx.shadowBlur = 5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.05 + i * size * 0.02, -size * 0.6);
    ctx.lineTo(-size * 0.065 + i * size * 0.02, -size * 0.66);
    ctx.lineTo(-size * 0.035 + i * size * 0.02, -size * 0.66);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Flowing phantom cloak - more tattered and ghostly
  const cloakGrad = ctx.createLinearGradient(x - size * 0.4, y, x + size * 0.4, y);
  cloakGrad.addColorStop(0, "#022c22");
  cloakGrad.addColorStop(0.2, "#064e3b");
  cloakGrad.addColorStop(0.4, "#047857");
  cloakGrad.addColorStop(0.5, "#059669");
  cloakGrad.addColorStop(0.6, "#047857");
  cloakGrad.addColorStop(0.8, "#064e3b");
  cloakGrad.addColorStop(1, "#022c22");
  ctx.fillStyle = cloakGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.55);
  // Tattered flowing bottom edge
  for (let i = 0; i < 7; i++) {
    const waveX = x - size * 0.42 + i * size * 0.14;
    const waveY = y + size * 0.55 + Math.sin(time * 5 + i * 1.3) * size * 0.05 + (i % 2) * size * 0.04 + (i % 3) * size * 0.02;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(x + size * 0.48, y - size * 0.15 + stance, x, y - size * 0.56 + stance);
  ctx.quadraticCurveTo(x - size * 0.48, y - size * 0.15 + stance, x - size * 0.42, y + size * 0.55);
  ctx.fill();

  // Soul threads on cloak
  ctx.strokeStyle = `rgba(52, 211, 153, ${shadowPulse * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.15 + i * size * 0.1, y + size * 0.08 + i * size * 0.06);
    ctx.bezierCurveTo(
      x - size * 0.1 + i * size * 0.1 + Math.sin(time * 2 + i) * size * 0.03,
      y + size * 0.15 + i * size * 0.06,
      x - size * 0.05 + i * size * 0.1,
      y + size * 0.2 + i * size * 0.08,
      x + i * size * 0.1 + Math.cos(time * 2 + i) * size * 0.02,
      y + size * 0.25 + i * size * 0.08
    );
    ctx.stroke();
  }

  // Spectral leather armor
  const armorGrad = ctx.createLinearGradient(x - size * 0.2, y, x + size * 0.2, y);
  armorGrad.addColorStop(0, "#44403c");
  armorGrad.addColorStop(0.5, "#78350f");
  armorGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.38);
  ctx.lineTo(x - size * 0.22, y - size * 0.18 + stance);
  ctx.lineTo(x, y - size * 0.28 + stance);
  ctx.lineTo(x + size * 0.22, y - size * 0.18 + stance);
  ctx.lineTo(x + size * 0.2, y + size * 0.38);
  ctx.fill();
  // Armor details
  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2 + stance);
  ctx.lineTo(x, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.05);
  ctx.lineTo(x + size * 0.15, y + size * 0.05);
  ctx.stroke();

  // Spectral elven face
  const faceGrad = ctx.createRadialGradient(x, y - size * 0.42 + stance, 0, x, y - size * 0.42 + stance, size * 0.18);
  faceGrad.addColorStop(0, "#e7e5e4");
  faceGrad.addColorStop(0.6, "#d6d3d1");
  faceGrad.addColorStop(1, "#a8a29e");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + stance, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Pointed elven ears - longer
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.44 + stance);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.52 + stance, x - size * 0.3, y - size * 0.58 + stance);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.48 + stance, x - size * 0.18, y - size * 0.4 + stance);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.44 + stance);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.52 + stance, x + size * 0.3, y - size * 0.58 + stance);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.48 + stance, x + size * 0.18, y - size * 0.4 + stance);
  ctx.fill();

  // Glowing death-green eyes
  ctx.fillStyle = "#10b981";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + stance, size * 0.035, size * 0.028, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + stance, size * 0.035, size * 0.028, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Pupil slits
  ctx.fillStyle = "#022c22";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + stance, size * 0.01, size * 0.022, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + stance, size * 0.01, size * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Hood shadow - deeper
  ctx.fillStyle = "rgba(2, 44, 34, 0.7)";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.56 + stance, size * 0.2, 0, Math.PI, true);
  ctx.fill();
  // Hood edge details
  ctx.strokeStyle = "#064e3b";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.56 + stance, size * 0.2, 0.1, Math.PI - 0.1, true);
  ctx.stroke();

  // Magnificent spectral bow - bone and soul magic
  ctx.save();
  ctx.translate(x - size * 0.38, y + stance);
  // Bow body - bone-like with soul energy
  const bowGrad = ctx.createLinearGradient(-size * 0.12, -size * 0.45, size * 0.12, size * 0.45);
  bowGrad.addColorStop(0, "#047857");
  bowGrad.addColorStop(0.3, "#059669");
  bowGrad.addColorStop(0.5, "#10b981");
  bowGrad.addColorStop(0.7, "#059669");
  bowGrad.addColorStop(1, "#047857");
  ctx.strokeStyle = bowGrad;
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 12 * zoom;
  ctx.lineWidth = 5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.46, -Math.PI * 0.48, Math.PI * 0.48);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Bone spurs on bow
  ctx.fillStyle = "#a8a29e";
  for (let spur = 0; spur < 4; spur++) {
    const spurAngle = -Math.PI * 0.35 + spur * Math.PI * 0.23;
    ctx.save();
    ctx.translate(Math.cos(spurAngle) * size * 0.46, Math.sin(spurAngle) * size * 0.46);
    ctx.rotate(spurAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.04, -size * 0.02);
    ctx.lineTo(size * 0.08, 0);
    ctx.lineTo(size * 0.04, size * 0.02);
    ctx.fill();
    ctx.restore();
  }
  // Soul runes on bow
  ctx.fillStyle = `rgba(52, 211, 153, ${shadowPulse})`;
  ctx.shadowColor = "#34d399";
  ctx.shadowBlur = 4 * zoom;
  ctx.font = `${size * 0.07}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⚔", Math.cos(-0.25) * size * 0.4, Math.sin(-0.25) * size * 0.4);
  ctx.fillText("⚔", Math.cos(0.25) * size * 0.4, Math.sin(0.25) * size * 0.4);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Soul-string (pulsing ethereal energy)
  ctx.strokeStyle = `rgba(52, 211, 153, ${shadowPulse})`;
  ctx.lineWidth = 2 * zoom;
  const bowTopX = x - size * 0.38 + Math.cos(-Math.PI * 0.48) * size * 0.46;
  const bowTopY = y + stance + Math.sin(-Math.PI * 0.48) * size * 0.46;
  const bowBotX = x - size * 0.38 + Math.cos(Math.PI * 0.48) * size * 0.46;
  const bowBotY = y + stance + Math.sin(Math.PI * 0.48) * size * 0.46;
  const pullX = x - size * 0.15 - drawPull * size * 0.22;
  ctx.beginPath();
  ctx.moveTo(bowTopX, bowTopY);
  ctx.lineTo(pullX, y + stance);
  ctx.lineTo(bowBotX, bowBotY);
  ctx.stroke();

  // Soul-piercing arrow
  ctx.save();
  ctx.translate(pullX, y + stance);
  ctx.rotate(Math.PI);
  // Arrow shaft - spectral
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.45, 0);
  ctx.stroke();
  // Soul energy along shaft
  ctx.strokeStyle = `rgba(52, 211, 153, ${soulFlicker * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.05, 0);
  for (let w = 0; w < 8; w++) {
    ctx.lineTo(size * 0.08 + w * size * 0.045, Math.sin(time * 10 + w) * size * 0.015);
  }
  ctx.stroke();
  // Soul-fire arrowhead
  ctx.fillStyle = "#10b981";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.45, 0);
  ctx.lineTo(size * 0.52, -size * 0.04);
  ctx.lineTo(size * 0.58, 0);
  ctx.lineTo(size * 0.52, size * 0.04);
  ctx.fill();
  // Inner glow
  ctx.fillStyle = "#34d399";
  ctx.beginPath();
  ctx.arc(size * 0.5, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Arrow fletching - spectral feathers
  ctx.fillStyle = `rgba(16, 185, 129, ${shadowPulse})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.04, -size * 0.06, -size * 0.08, -size * 0.05);
  ctx.lineTo(-size * 0.02, 0);
  ctx.lineTo(-size * 0.08, size * 0.05);
  ctx.quadraticCurveTo(-size * 0.04, size * 0.06, 0, 0);
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
  zoom: number,
  attackPhase: number = 0
) {
  // MAGE PROFESSOR - Arcane wizard with floating tome and magic orbs
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const float = Math.sin(time * 2.5) * 4 * zoom + (isAttacking ? attackIntensity * size * 0.15 : 0);
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
  zoom: number,
  attackPhase: number = 0
) {
  // INFERNAL SIEGE ENGINE - Demonic war machine powered by hellfire and dark souls
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const armAngle = Math.sin(time * 1.5) * 0.35 + (isAttacking ? attackIntensity * 0.8 : 0);
  const hellGlow = 0.6 + Math.sin(time * 4) * 0.3;
  const soulWisp = 0.5 + Math.sin(time * 5) * 0.3;

  // Hellfire aura beneath
  const fireGrad = ctx.createRadialGradient(x, y + size * 0.3, 0, x, y + size * 0.3, size * 0.6);
  fireGrad.addColorStop(0, `rgba(220, 38, 38, ${hellGlow * 0.3})`);
  fireGrad.addColorStop(0.5, `rgba(180, 30, 30, ${hellGlow * 0.15})`);
  fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = fireGrad;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.3, size * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Shadow with hell-cracks
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.55, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hell cracks in ground
  ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let crack = 0; crack < 5; crack++) {
    const crackAngle = crack * Math.PI / 2.5 - Math.PI * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.48);
    let cx = x, cy = y + size * 0.48;
    for (let seg = 0; seg < 3; seg++) {
      cx += Math.cos(crackAngle) * size * 0.12;
      cy += size * 0.02;
      ctx.lineTo(cx + Math.sin(seg) * size * 0.03, cy);
    }
    ctx.stroke();
  }

  // Demonic bone wheels
  for (let w = 0; w < 2; w++) {
    const wheelX = w === 0 ? x - size * 0.38 : x + size * 0.38;
    // Wheel outer ring with teeth
    ctx.fillStyle = "#292524";
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(wheelX, y + size * 0.38, size * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bone spokes
    ctx.strokeStyle = "#78716c";
    ctx.lineWidth = 3 * zoom;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + time * 0.6;
      ctx.beginPath();
      ctx.moveTo(wheelX, y + size * 0.38);
      ctx.lineTo(wheelX + Math.cos(angle) * size * 0.14, y + size * 0.38 + Math.sin(angle) * size * 0.14);
      ctx.stroke();
    }
    // Hub skull
    ctx.fillStyle = "#a8a29e";
    ctx.beginPath();
    ctx.arc(wheelX, y + size * 0.38, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    // Skull eyes
    ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
    ctx.beginPath();
    ctx.arc(wheelX - size * 0.02, y + size * 0.37, size * 0.012, 0, Math.PI * 2);
    ctx.arc(wheelX + size * 0.02, y + size * 0.37, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
    // Wheel spikes
    ctx.fillStyle = "#1c1917";
    for (let spike = 0; spike < 8; spike++) {
      const spikeAngle = spike * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(wheelX + Math.cos(spikeAngle) * size * 0.15, y + size * 0.38 + Math.sin(spikeAngle) * size * 0.15);
      ctx.lineTo(wheelX + Math.cos(spikeAngle) * size * 0.22, y + size * 0.38 + Math.sin(spikeAngle) * size * 0.22);
      ctx.lineTo(wheelX + Math.cos(spikeAngle + 0.1) * size * 0.15, y + size * 0.38 + Math.sin(spikeAngle + 0.1) * size * 0.15);
      ctx.fill();
    }
  }

  // Main frame - demonic construction with bone and iron
  const frameGrad = ctx.createLinearGradient(x - size * 0.45, y, x + size * 0.45, y);
  frameGrad.addColorStop(0, "#292524");
  frameGrad.addColorStop(0.3, "#44403c");
  frameGrad.addColorStop(0.5, "#57534e");
  frameGrad.addColorStop(0.7, "#44403c");
  frameGrad.addColorStop(1, "#292524");
  ctx.fillStyle = frameGrad;
  ctx.fillRect(x - size * 0.45, y + size * 0.08, size * 0.9, size * 0.24);
  // Iron bands with runes
  ctx.fillStyle = "#3f3f46";
  ctx.fillRect(x - size * 0.4, y + size * 0.1, size * 0.1, size * 0.2);
  ctx.fillRect(x + size * 0.3, y + size * 0.1, size * 0.1, size * 0.2);
  ctx.fillRect(x - size * 0.05, y + size * 0.1, size * 0.1, size * 0.2);
  // Glowing runes on bands
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("◆", x - size * 0.35, y + size * 0.22);
  ctx.fillText("◆", x, y + size * 0.22);
  ctx.fillText("◆", x + size * 0.35, y + size * 0.22);

  // Throwing arm - bone reinforced with hellfire veins
  ctx.save();
  ctx.translate(x, y + size * 0.18);
  ctx.rotate(-0.85 + armAngle);
  // Arm structure
  const armGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.65);
  armGrad.addColorStop(0, "#44403c");
  armGrad.addColorStop(0.5, "#78716c");
  armGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = armGrad;
  ctx.fillRect(-size * 0.06, -size * 0.65, size * 0.12, size * 0.65);
  // Bone reinforcement
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, 0);
  ctx.lineTo(-size * 0.04, -size * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.04, 0);
  ctx.lineTo(size * 0.04, -size * 0.6);
  ctx.stroke();
  // Hellfire veins
  ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.03, -size * 0.35, 0, -size * 0.55);
  ctx.stroke();
  // Arm metal cap with skull
  ctx.fillStyle = "#3f3f46";
  ctx.fillRect(-size * 0.08, -size * 0.68, size * 0.16, size * 0.1);
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(0, -size * 0.72, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Soul-catching bucket
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.arc(0, -size * 0.64, size * 0.14, 0, Math.PI);
  ctx.fill();
  // Soul flames in bucket
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.6, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Skull projectile
  ctx.fillStyle = "#e7e5e4";
  ctx.beginPath();
  ctx.arc(0, -size * 0.58, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(-size * 0.02, -size * 0.6, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.02, -size * 0.6, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Soul-chain tension ropes
  ctx.strokeStyle = `rgba(220, 38, 38, ${soulWisp * 0.7})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.22);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.05, x, y - size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.32, y + size * 0.22);
  ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.05, x, y - size * 0.15);
  ctx.stroke();
  // Chain links
  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 1 * zoom;
  for (let link = 0; link < 4; link++) {
    const linkX = x - size * 0.28 + link * size * 0.08;
    const linkY = y + size * 0.15 - link * size * 0.08;
    ctx.beginPath();
    ctx.ellipse(linkX, linkY, size * 0.025, size * 0.015, 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Undead crew member
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.18, y - size * 0.06, size * 0.1, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Skeletal head
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(x + size * 0.18, y - size * 0.24, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Helmet (rusted and spiked)
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.arc(x + size * 0.18, y - size * 0.28, size * 0.09, Math.PI, 0);
  ctx.fill();
  // Helmet spike
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.36);
  ctx.lineTo(x + size * 0.15, y - size * 0.28);
  ctx.lineTo(x + size * 0.21, y - size * 0.28);
  ctx.fill();
  // Glowing eyes
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.16, y - size * 0.25, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.2, y - size * 0.25, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
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
  zoom: number,
  attackPhase: number = 0
) {
  // VOID ARCHLICH - Ancient undead sorcerer channeling the abyss itself
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const hover = Math.sin(time * 2) * 5 * zoom + (isAttacking ? attackIntensity * size * 0.2 : 0);
  const darkPulse = 0.5 + Math.sin(time * 3) * 0.35;
  const voidRip = 0.6 + Math.sin(time * 4) * 0.3;
  const soulDrain = Math.sin(time * 6) > 0.5 ? 1 : 0.6;

  // Reality-tearing void portal beneath
  ctx.save();
  for (let ring = 0; ring < 3; ring++) {
    const ringSize = size * (0.3 + ring * 0.15) + Math.sin(time * 2 + ring) * size * 0.05;
    ctx.strokeStyle = `rgba(76, 29, 149, ${voidRip * (0.5 - ring * 0.15)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.45, ringSize, ringSize * 0.25, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Dark void aura - more intense
  const voidGrad = ctx.createRadialGradient(x, y, size * 0.08, x, y, size * 0.85);
  voidGrad.addColorStop(0, `rgba(88, 28, 135, ${darkPulse * 0.5})`);
  voidGrad.addColorStop(0.3, `rgba(76, 29, 149, ${darkPulse * 0.35})`);
  voidGrad.addColorStop(0.6, `rgba(30, 10, 60, ${darkPulse * 0.2})`);
  voidGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Captured soul wisps orbiting
  for (let soul = 0; soul < 6; soul++) {
    const soulAngle = time * 1.5 + soul * Math.PI / 3;
    const soulDist = size * 0.5 + Math.sin(time * 2 + soul) * size * 0.08;
    const sx = x + Math.cos(soulAngle) * soulDist;
    const sy = y + Math.sin(soulAngle) * soulDist * 0.4;
    ctx.fillStyle = `rgba(167, 139, 250, ${0.4 + Math.sin(time * 4 + soul) * 0.25})`;
    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(sx, sy, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    // Soul trail
    ctx.strokeStyle = `rgba(167, 139, 250, 0.2)`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - Math.cos(soulAngle) * size * 0.08, sy - Math.sin(soulAngle) * size * 0.03);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Shadow tendrils - more elaborate
  ctx.strokeStyle = `rgba(88, 28, 135, ${darkPulse * 0.7})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 7; i++) {
    const tendrilAngle = time * 0.6 + i * Math.PI * 0.285;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.32);
    let tx = x, ty = y + size * 0.32;
    for (let seg = 0; seg < 4; seg++) {
      tx += Math.cos(tendrilAngle + Math.sin(time * 2 + seg) * 0.4) * size * 0.12;
      ty += size * 0.05 + Math.sin(time * 3 + i + seg) * size * 0.03;
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
  }

  // Deeper shadow
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.4);
  shadowGrad.addColorStop(0, "rgba(30, 10, 60, 0.7)");
  shadowGrad.addColorStop(0.6, "rgba(30, 10, 60, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.4, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark robes - more tattered and flowing
  const robeGrad = ctx.createLinearGradient(x - size * 0.45, y, x + size * 0.45, y);
  robeGrad.addColorStop(0, "#0f0520");
  robeGrad.addColorStop(0.3, "#1e0a3c");
  robeGrad.addColorStop(0.5, "#2d1450");
  robeGrad.addColorStop(0.7, "#1e0a3c");
  robeGrad.addColorStop(1, "#0f0520");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.55);
  for (let i = 0; i < 8; i++) {
    const waveX = x - size * 0.45 + i * size * 0.1125;
    const waveY = y + size * 0.55 + Math.sin(time * 4 + i * 1.2) * size * 0.06 + (i % 2) * size * 0.04;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(x + size * 0.5, y, x + size * 0.18, y - size * 0.45 + hover);
  ctx.lineTo(x - size * 0.18, y - size * 0.45 + hover);
  ctx.quadraticCurveTo(x - size * 0.5, y, x - size * 0.45, y + size * 0.55);
  ctx.fill();

  // Void symbols on robe
  ctx.strokeStyle = `rgba(147, 51, 234, ${voidRip * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let sym = 0; sym < 4; sym++) {
    const symX = x - size * 0.2 + sym * size * 0.13;
    const symY = y + size * 0.1 + sym * size * 0.08;
    ctx.beginPath();
    ctx.arc(symX, symY, size * 0.03, 0, Math.PI * 2);
    ctx.moveTo(symX, symY - size * 0.04);
    ctx.lineTo(symX, symY + size * 0.04);
    ctx.stroke();
  }

  // Ancient skull face
  const skullGrad = ctx.createRadialGradient(x, y - size * 0.38 + hover, 0, x, y - size * 0.38 + hover, size * 0.2);
  skullGrad.addColorStop(0, "#f5f5f4");
  skullGrad.addColorStop(0.6, "#e8e0d0");
  skullGrad.addColorStop(1, "#d6d3d1");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.38 + hover, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Skull cracks
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.5 + hover);
  ctx.lineTo(x - size * 0.08, y - size * 0.42 + hover);
  ctx.lineTo(x - size * 0.03, y - size * 0.35 + hover);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.48 + hover);
  ctx.lineTo(x + size * 0.06, y - size * 0.38 + hover);
  ctx.stroke();
  // Hollow eye sockets
  ctx.fillStyle = "#0f0520";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.4 + hover, size * 0.055, size * 0.065, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.08, y - size * 0.4 + hover, size * 0.055, size * 0.065, 0, 0, Math.PI * 2);
  ctx.fill();
  // Void-fire eyes
  ctx.fillStyle = "#9333ea";
  ctx.shadowColor = "#9333ea";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.4 + hover, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.4 + hover, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Skeletal nose hole
  ctx.fillStyle = "#1e0a3c";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.34 + hover);
  ctx.lineTo(x - size * 0.025, y - size * 0.28 + hover);
  ctx.lineTo(x + size * 0.025, y - size * 0.28 + hover);
  ctx.fill();
  // Grinning teeth
  ctx.fillStyle = "#e8e0d0";
  ctx.fillRect(x - size * 0.08, y - size * 0.26 + hover, size * 0.16, size * 0.045);
  ctx.strokeStyle = "#1e0a3c";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.07 + i * size * 0.028, y - size * 0.26 + hover);
    ctx.lineTo(x - size * 0.07 + i * size * 0.028, y - size * 0.215 + hover);
    ctx.stroke();
  }

  // Ornate hood with runes
  ctx.fillStyle = "#0a0315";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.52 + hover, size * 0.25, size * 0.14, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.52 + hover);
  ctx.quadraticCurveTo(x - size * 0.3, y - size * 0.25 + hover, x - size * 0.22, y - size * 0.1 + hover);
  ctx.lineTo(x - size * 0.18, y - size * 0.35 + hover);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.52 + hover);
  ctx.quadraticCurveTo(x + size * 0.3, y - size * 0.25 + hover, x + size * 0.22, y - size * 0.1 + hover);
  ctx.lineTo(x + size * 0.18, y - size * 0.35 + hover);
  ctx.fill();
  // Hood runes
  ctx.strokeStyle = `rgba(147, 51, 234, ${darkPulse})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + hover, size * 0.06, 0, Math.PI * 2);
  ctx.stroke();

  // Void orb in hand - more detailed
  ctx.fillStyle = "#4c1d95";
  ctx.shadowColor = "#9333ea";
  ctx.shadowBlur = 15 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y + size * 0.02 + hover, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  // Dark energy swirls in orb
  ctx.strokeStyle = "#1e0a3c";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y + size * 0.02 + hover, size * 0.1, time * 2, time * 2 + Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y + size * 0.02 + hover, size * 0.06, time * 3 + Math.PI, time * 3 + Math.PI * 2);
  ctx.stroke();
  // Inner glow
  ctx.fillStyle = `rgba(167, 139, 250, ${soulDrain * 0.6})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y + hover, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Skeletal hand holding orb
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.28, y + size * 0.08 + hover, size * 0.04, size * 0.02, 0.3, 0, Math.PI * 2);
  ctx.fill();
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
  zoom: number,
  attackPhase: number = 0
) {
  // DOOM ARBALIST - Cursed siege specialist with soul-piercing siege crossbow
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const aim = Math.sin(time * 2) * 0.06 + (isAttacking ? attackIntensity * 0.15 : 0);
  const stance = Math.sin(time * 4) * 2.5 * zoom;
  const curseGlow = 0.5 + Math.sin(time * 3) * 0.3;
  const boltCharge = 0.6 + Math.sin(time * 5) * 0.3;

  // Cursed ground aura
  ctx.fillStyle = `rgba(127, 29, 29, ${curseGlow * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.4, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shadow with curse marks
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.5, 0, x, y + size * 0.5, size * 0.35);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy cursed armor body
  const armorGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  armorGrad.addColorStop(0, "#292524");
  armorGrad.addColorStop(0.2, "#44403c");
  armorGrad.addColorStop(0.5, "#57534e");
  armorGrad.addColorStop(0.8, "#44403c");
  armorGrad.addColorStop(1, "#292524");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.48);
  ctx.lineTo(x - size * 0.38, y - size * 0.12);
  ctx.quadraticCurveTo(x, y - size * 0.38, x + size * 0.38, y - size * 0.12);
  ctx.lineTo(x + size * 0.35, y + size * 0.48);
  ctx.closePath();
  ctx.fill();

  // Spiked pauldrons
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.32, y - size * 0.12 + stance * 0.2, size * 0.1, size * 0.06, -0.3, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.32, y - size * 0.12 + stance * 0.2, size * 0.1, size * 0.06, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Shoulder spikes
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.14 + stance * 0.2);
  ctx.lineTo(x - size * 0.42, y - size * 0.28 + stance * 0.2);
  ctx.lineTo(x - size * 0.32, y - size * 0.12 + stance * 0.2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.14 + stance * 0.2);
  ctx.lineTo(x + size * 0.42, y - size * 0.28 + stance * 0.2);
  ctx.lineTo(x + size * 0.32, y - size * 0.12 + stance * 0.2);
  ctx.fill();

  // Runed chest plate
  const plateGrad = ctx.createLinearGradient(x - size * 0.22, y - size * 0.2, x + size * 0.22, y + size * 0.2);
  plateGrad.addColorStop(0, "#52525b");
  plateGrad.addColorStop(0.5, "#71717a");
  plateGrad.addColorStop(1, "#52525b");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.22);
  ctx.lineTo(x - size * 0.24, y - size * 0.18);
  ctx.quadraticCurveTo(x, y - size * 0.28, x + size * 0.24, y - size * 0.18);
  ctx.lineTo(x + size * 0.22, y + size * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3f3f46";
  ctx.lineWidth = 2.5 * zoom;
  ctx.stroke();
  // Curse runes on plate
  ctx.strokeStyle = `rgba(127, 29, 29, ${curseGlow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x, y + size * 0.15);
  ctx.moveTo(x - size * 0.12, y - size * 0.05);
  ctx.lineTo(x + size * 0.12, y - size * 0.05);
  ctx.stroke();
  // Skull emblem
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.02, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(x - size * 0.012, y - size * 0.025, size * 0.008, 0, Math.PI * 2);
  ctx.arc(x + size * 0.012, y - size * 0.025, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Metal rivets with glow
  ctx.fillStyle = "#71717a";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.15 + i * size * 0.1, y - size * 0.12, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
  }

  // Partially visible face under helmet
  ctx.fillStyle = "#78716c";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4, size * 0.15, 0.35 * Math.PI, 2.65 * Math.PI);
  ctx.fill();

  // Menacing sallet helmet with horn
  const helmGrad = ctx.createLinearGradient(x - size * 0.2, y - size * 0.5, x + size * 0.2, y - size * 0.35);
  helmGrad.addColorStop(0, "#3f3f46");
  helmGrad.addColorStop(0.5, "#52525b");
  helmGrad.addColorStop(1, "#3f3f46");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.2, size * 0.14, 0, Math.PI, 0);
  ctx.fill();
  // Helmet tail (longer, more menacing)
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.45);
  ctx.quadraticCurveTo(x + size * 0.3, y - size * 0.4, x + size * 0.25, y - size * 0.28);
  ctx.lineTo(x + size * 0.12, y - size * 0.38);
  ctx.fill();
  // Single horn
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.58);
  ctx.lineTo(x, y - size * 0.72);
  ctx.lineTo(x + size * 0.05, y - size * 0.58);
  ctx.fill();
  // Visor with T-slit
  ctx.fillStyle = "#27272a";
  ctx.fillRect(x - size * 0.14, y - size * 0.46, size * 0.28, size * 0.08);
  // T-shaped eye slit with red glow
  ctx.fillStyle = `rgba(127, 29, 29, ${curseGlow})`;
  ctx.shadowColor = "#7f1d1d";
  ctx.shadowBlur = 4 * zoom;
  ctx.fillRect(x - size * 0.12, y - size * 0.44, size * 0.24, size * 0.025);
  ctx.fillRect(x - size * 0.015, y - size * 0.44, size * 0.03, size * 0.05);
  ctx.shadowBlur = 0;

  // Massive siege crossbow with soul mechanism
  ctx.save();
  ctx.translate(x - size * 0.18, y + size * 0.06);
  ctx.rotate(aim);
  // Reinforced stock with bone inlay
  const stockGrad = ctx.createLinearGradient(-size * 0.45, 0, size * 0.05, 0);
  stockGrad.addColorStop(0, "#292524");
  stockGrad.addColorStop(0.5, "#44403c");
  stockGrad.addColorStop(1, "#292524");
  ctx.fillStyle = stockGrad;
  ctx.fillRect(-size * 0.45, -size * 0.05, size * 0.5, size * 0.1);
  // Bone decorations
  ctx.fillStyle = "#a8a29e";
  ctx.fillRect(-size * 0.35, -size * 0.04, size * 0.06, size * 0.08);
  ctx.fillRect(-size * 0.15, -size * 0.04, size * 0.06, size * 0.08);
  // Heavy metal parts with runes
  ctx.fillStyle = "#3f3f46";
  ctx.fillRect(-size * 0.48, -size * 0.06, size * 0.1, size * 0.12);
  // Curse rune on metal
  ctx.strokeStyle = `rgba(127, 29, 29, ${boltCharge})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(-size * 0.43, 0, size * 0.025, 0, Math.PI * 2);
  ctx.stroke();
  // Reinforced bow limbs with spikes
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, 0);
  ctx.quadraticCurveTo(-size * 0.62, -size * 0.22, -size * 0.52, -size * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, 0);
  ctx.quadraticCurveTo(-size * 0.62, size * 0.22, -size * 0.52, size * 0.4);
  ctx.stroke();
  // Limb spikes
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(-size * 0.52, -size * 0.4);
  ctx.lineTo(-size * 0.48, -size * 0.5);
  ctx.lineTo(-size * 0.55, -size * 0.42);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.52, size * 0.4);
  ctx.lineTo(-size * 0.48, size * 0.5);
  ctx.lineTo(-size * 0.55, size * 0.42);
  ctx.fill();
  // Soul-chain bowstring
  ctx.strokeStyle = `rgba(127, 29, 29, ${boltCharge * 0.8})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.52, -size * 0.4);
  ctx.lineTo(-size * 0.18, 0);
  ctx.lineTo(-size * 0.52, size * 0.4);
  ctx.stroke();
  // Soul-piercing bolt
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.62, -size * 0.018, size * 0.35, size * 0.036);
  // Glowing bolt head
  ctx.fillStyle = `rgba(127, 29, 29, ${boltCharge})`;
  ctx.shadowColor = "#7f1d1d";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.68, 0);
  ctx.lineTo(-size * 0.58, -size * 0.04);
  ctx.lineTo(-size * 0.58, size * 0.04);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Bolt fletching
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, 0);
  ctx.lineTo(-size * 0.22, -size * 0.03);
  ctx.lineTo(-size * 0.22, size * 0.03);
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
  zoom: number,
  attackPhase: number = 0
) {
  // HEX WITCH - Malevolent Curse Weaver with Forbidden Magic
  // A dark sorceress wreathed in swirling hex runes and cursed energy
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const sway = Math.sin(time * 3) * 3 * zoom + (isAttacking ? attackIntensity * size * 0.15 : 0);
  const hexPulse = 0.6 + Math.sin(time * 5) * 0.4;
  const breathe = Math.sin(time * 2.5) * size * 0.015;
  const curseIntensity = isAttacking ? 0.7 + attackIntensity * 0.3 : 0.4 + Math.sin(time * 4) * 0.2;
  const hover = Math.sin(time * 2) * size * 0.02;

  // === LAYER 1: CURSE DOMAIN AURA ===
  // Dark magic ground pool
  const poolGrad = ctx.createRadialGradient(x, y + size * 0.5, 0, x, y + size * 0.5, size * 0.55);
  poolGrad.addColorStop(0, `rgba(190, 24, 93, ${curseIntensity * 0.35})`);
  poolGrad.addColorStop(0.4, `rgba(131, 24, 67, ${curseIntensity * 0.2})`);
  poolGrad.addColorStop(0.7, `rgba(76, 29, 149, ${curseIntensity * 0.1})`);
  poolGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.55, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rippling curse rings on ground
  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 0.8 + ring * 0.4) % 1;
    const ringSize = size * (0.2 + ringPhase * 0.35);
    const ringAlpha = (0.4 - ringPhase * 0.35) * curseIntensity;
    ctx.strokeStyle = `rgba(190, 24, 93, ${ringAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.5, ringSize, ringSize * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === LAYER 2: FLOATING HEX CIRCLES - ORBITAL CURSE RUNES ===
  for (let i = 0; i < 5; i++) {
    const orbitAngle = time * 1.2 + i * Math.PI * 0.4;
    const orbitDist = size * 0.55 + Math.sin(time * 2 + i) * size * 0.08;
    const orbitX = x + Math.cos(orbitAngle) * orbitDist;
    const orbitY = y - size * 0.1 + Math.sin(orbitAngle) * orbitDist * 0.4 + hover;
    const runeSize = size * 0.1 + Math.sin(time * 4 + i * 2) * size * 0.015;
    
    // Hex rune glow (gradient instead of shadowBlur)
    const runeGlow = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, runeSize * 2.5);
    runeGlow.addColorStop(0, `rgba(190, 24, 93, ${hexPulse * 0.5})`);
    runeGlow.addColorStop(0.4, `rgba(190, 24, 93, ${hexPulse * 0.2})`);
    runeGlow.addColorStop(1, "rgba(190, 24, 93, 0)");
    ctx.fillStyle = runeGlow;
    ctx.beginPath();
    ctx.arc(orbitX, orbitY, runeSize * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Hex circle outer ring
    ctx.strokeStyle = `rgba(236, 72, 153, ${hexPulse * 0.8})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(orbitX, orbitY, runeSize, 0, Math.PI * 2);
    ctx.stroke();

    // Inner hex circle
    ctx.strokeStyle = `rgba(190, 24, 93, ${hexPulse})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(orbitX, orbitY, runeSize * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // Hex rune symbol (6-pointed star)
    ctx.fillStyle = `rgba(251, 113, 133, ${hexPulse})`;
    for (let p = 0; p < 6; p++) {
      const starAngle = time * 0.5 + p * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(orbitX, orbitY);
      ctx.lineTo(
        orbitX + Math.cos(starAngle) * runeSize * 0.5,
        orbitY + Math.sin(starAngle) * runeSize * 0.5
      );
      ctx.lineTo(
        orbitX + Math.cos(starAngle + Math.PI / 6) * runeSize * 0.25,
        orbitY + Math.sin(starAngle + Math.PI / 6) * runeSize * 0.25
      );
      ctx.fill();
    }

    // Connecting energy thread to witch
    ctx.strokeStyle = `rgba(190, 24, 93, ${0.15 + Math.sin(time * 3 + i) * 0.1})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(orbitX, orbitY);
    ctx.quadraticCurveTo(
      x + Math.cos(orbitAngle) * orbitDist * 0.5,
      y - size * 0.2 + hover,
      x,
      y - size * 0.15 + hover
    );
    ctx.stroke();
  }

  // === LAYER 3: CURSE PARTICLES ===
  for (let p = 0; p < 12; p++) {
    const particlePhase = (time * 0.6 + p * 0.15) % 1;
    const particleAngle = p * Math.PI / 6 + time * 0.3;
    const particleDist = size * (0.2 + particlePhase * 0.5);
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y - size * 0.1 - particlePhase * size * 0.4 + hover;
    const particleAlpha = (1 - particlePhase) * 0.5 * curseIntensity;
    const particleSize = size * 0.02 * (1 - particlePhase * 0.5);
    
    ctx.fillStyle = `rgba(236, 72, 153, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // === LAYER 4: SHADOW ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.35);
  shadowGrad.addColorStop(0, "rgba(76, 29, 149, 0.5)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 5: TATTERED DRESS WITH MAGICAL THREADS ===
  const dressGrad = ctx.createLinearGradient(x - size * 0.4, y, x + size * 0.4, y);
  dressGrad.addColorStop(0, "#6b21a8");
  dressGrad.addColorStop(0.3, "#9d174d");
  dressGrad.addColorStop(0.5, "#be185d");
  dressGrad.addColorStop(0.7, "#9d174d");
  dressGrad.addColorStop(1, "#6b21a8");
  ctx.fillStyle = dressGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.52);
  // Ragged bottom edge with more detail
  for (let i = 0; i < 9; i++) {
    const jagX = x - size * 0.4 + i * size * 0.1;
    const jagY = y + size * 0.52 + Math.sin(time * 4 + i * 0.8) * size * 0.04 + (i % 2) * size * 0.08;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(x + size * 0.42, y + size * 0.1, x + size * 0.18, y - size * 0.32 + sway + breathe);
  ctx.lineTo(x - size * 0.18, y - size * 0.32 + sway + breathe);
  ctx.quadraticCurveTo(x - size * 0.42, y + size * 0.1, x - size * 0.4, y + size * 0.52);
  ctx.fill();

  // Dress inner shading
  const innerDressGrad = ctx.createLinearGradient(x, y - size * 0.2, x, y + size * 0.5);
  innerDressGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  innerDressGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.2)");
  innerDressGrad.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = innerDressGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.25, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magical thread patterns on dress
  ctx.strokeStyle = `rgba(236, 72, 153, ${hexPulse * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  for (let thread = 0; thread < 5; thread++) {
    const threadX = x - size * 0.2 + thread * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(threadX, y - size * 0.1 + sway * 0.3);
    ctx.bezierCurveTo(
      threadX + Math.sin(time * 2 + thread) * size * 0.05,
      y + size * 0.1,
      threadX - Math.cos(time * 2 + thread) * size * 0.04,
      y + size * 0.3,
      threadX + Math.sin(thread) * size * 0.06,
      y + size * 0.48
    );
    ctx.stroke();
  }

  // Belt with curse gems
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(x - size * 0.22, y - size * 0.12 + sway * 0.5, size * 0.44, size * 0.05);
  // Gem centerpiece
  const gemGrad = ctx.createRadialGradient(x, y - size * 0.1 + sway * 0.5, 0, x, y - size * 0.1 + sway * 0.5, size * 0.04);
  gemGrad.addColorStop(0, "#fb7185");
  gemGrad.addColorStop(0.5, "#be185d");
  gemGrad.addColorStop(1, "#831843");
  ctx.fillStyle = gemGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.14 + sway * 0.5);
  ctx.lineTo(x - size * 0.035, y - size * 0.1 + sway * 0.5);
  ctx.lineTo(x, y - size * 0.06 + sway * 0.5);
  ctx.lineTo(x + size * 0.035, y - size * 0.1 + sway * 0.5);
  ctx.fill();

  // === LAYER 6: WILD FLOWING HAIR ===
  // Multiple hair strands for detail
  const hairColors = ["#1a1a2e", "#2d1f3d", "#1e1b4b"];
  for (let strand = 0; strand < 6; strand++) {
    const strandSide = strand < 3 ? -1 : 1;
    const strandOffset = (strand % 3) * 0.1;
    ctx.fillStyle = hairColors[strand % 3];
    ctx.beginPath();
    ctx.moveTo(x + strandSide * (size * 0.12 + strandOffset * size), y - size * 0.45 + sway);
    ctx.quadraticCurveTo(
      x + strandSide * (size * 0.35 + strandOffset * size * 0.5),
      y - size * 0.25 + Math.sin(time * 3 + strand) * size * 0.05,
      x + strandSide * (size * 0.32 + strandOffset * size * 0.3),
      y + size * 0.15 + Math.sin(time * 2.5 + strand * 0.5) * size * 0.08
    );
    ctx.quadraticCurveTo(
      x + strandSide * (size * 0.22 + strandOffset * size * 0.2),
      y - size * 0.05,
      x + strandSide * (size * 0.08 + strandOffset * size * 0.1),
      y - size * 0.4 + sway
    );
    ctx.fill();
  }

  // Hair highlights
  ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
  ctx.lineWidth = 1 * zoom;
  for (let hl = 0; hl < 4; hl++) {
    const hlSide = hl < 2 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(x + hlSide * size * (0.15 + hl * 0.05), y - size * 0.43 + sway);
    ctx.quadraticCurveTo(
      x + hlSide * size * 0.25,
      y - size * 0.1,
      x + hlSide * size * 0.28,
      y + size * 0.05
    );
    ctx.stroke();
  }

  // === LAYER 7: PALE FACE WITH DETAILS ===
  // Face glow effect (gradient)
  const faceGlow = ctx.createRadialGradient(x, y - size * 0.42 + sway, 0, x, y - size * 0.42 + sway, size * 0.22);
  faceGlow.addColorStop(0, "rgba(251, 207, 232, 0.3)");
  faceGlow.addColorStop(1, "rgba(251, 207, 232, 0)");
  ctx.fillStyle = faceGlow;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + sway, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Face base
  const faceGrad = ctx.createRadialGradient(x, y - size * 0.44 + sway, 0, x, y - size * 0.4 + sway, size * 0.16);
  faceGrad.addColorStop(0, "#fdf4ff");
  faceGrad.addColorStop(0.7, "#f5f5f5");
  faceGrad.addColorStop(1, "#e5e5e5");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + sway, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Cheek shadows
  ctx.fillStyle = "rgba(190, 24, 93, 0.15)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.38 + sway, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.08, y - size * 0.38 + sway, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye sockets (darker)
  ctx.fillStyle = "rgba(88, 28, 135, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + sway, size * 0.05, size * 0.03, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + sway, size * 0.05, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sinister eyes with glow (gradient instead of shadowBlur)
  const eyeGlow = ctx.createRadialGradient(x - size * 0.06, y - size * 0.44 + sway, 0, x - size * 0.06, y - size * 0.44 + sway, size * 0.06);
  eyeGlow.addColorStop(0, "#f472b6");
  eyeGlow.addColorStop(0.4, "rgba(236, 72, 153, 0.6)");
  eyeGlow.addColorStop(1, "rgba(236, 72, 153, 0)");
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.44 + sway, size * 0.06, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.44 + sway, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Eye cores
  ctx.fillStyle = "#be185d";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + sway, size * 0.035, size * 0.025, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + sway, size * 0.035, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(x - size * 0.055, y - size * 0.445 + sway, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.055, y - size * 0.445 + sway, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = "#fdf4ff";
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.45 + sway, size * 0.008, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.45 + sway, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Wicked smile
  ctx.strokeStyle = "#4a1942";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.34 + sway, size * 0.07, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
  // Smile corners
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.33 + sway);
  ctx.lineTo(x - size * 0.075, y - size * 0.35 + sway);
  ctx.moveTo(x + size * 0.06, y - size * 0.33 + sway);
  ctx.lineTo(x + size * 0.075, y - size * 0.35 + sway);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.42 + sway);
  ctx.lineTo(x, y - size * 0.37 + sway);
  ctx.stroke();

  // === LAYER 8: ORNATE WITCH HAT ===
  // Hat body
  const hatGrad = ctx.createLinearGradient(x - size * 0.2, y - size * 0.9 + sway, x + size * 0.2, y - size * 0.5 + sway);
  hatGrad.addColorStop(0, "#0f0f23");
  hatGrad.addColorStop(0.5, "#1a1a2e");
  hatGrad.addColorStop(1, "#2d2d44");
  ctx.fillStyle = hatGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.54 + sway);
  ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.72 + sway, x + size * 0.12, y - size * 0.92 + sway + Math.sin(time * 2) * size * 0.02);
  ctx.lineTo(x + size * 0.2, y - size * 0.54 + sway);
  ctx.closePath();
  ctx.fill();

  // Hat brim
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.54 + sway, size * 0.24, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hat band with rune pattern
  ctx.fillStyle = "#9d174d";
  ctx.fillRect(x - size * 0.17, y - size * 0.62 + sway, size * 0.28, size * 0.05);
  // Rune symbols on band
  ctx.fillStyle = "#fb7185";
  for (let r = 0; r < 4; r++) {
    const runeX = x - size * 0.12 + r * size * 0.08;
    ctx.beginPath();
    ctx.arc(runeX, y - size * 0.595 + sway, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hat gem
  const hatGem = ctx.createRadialGradient(x + size * 0.08, y - size * 0.88 + sway, 0, x + size * 0.08, y - size * 0.88 + sway, size * 0.04);
  hatGem.addColorStop(0, "#fb7185");
  hatGem.addColorStop(0.5, "#be185d");
  hatGem.addColorStop(1, "#831843");
  ctx.fillStyle = hatGem;
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.85 + sway, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 9: CURSE STAFF ===
  // Staff body
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.12 + sway);
  ctx.lineTo(x + size * 0.48, y + size * 0.35);
  ctx.stroke();

  // Staff grip wrapping
  ctx.strokeStyle = "#581c87";
  ctx.lineWidth = 2 * zoom;
  for (let w = 0; w < 5; w++) {
    const wrapY = y + size * 0.1 + w * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.34 - w * 0.02, wrapY);
    ctx.lineTo(x + size * 0.38 - w * 0.02, wrapY + size * 0.03);
    ctx.stroke();
  }

  // Crystal mounting
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.08 + sway);
  ctx.lineTo(x + size * 0.26, y - size * 0.08 + sway);
  ctx.lineTo(x + size * 0.24, y - size * 0.14 + sway);
  ctx.lineTo(x + size * 0.2, y - size * 0.14 + sway);
  ctx.fill();

  // Hex crystal with glow effect (gradient instead of shadowBlur)
  const crystalGlow = ctx.createRadialGradient(x + size * 0.22, y - size * 0.22 + sway, 0, x + size * 0.22, y - size * 0.22 + sway, size * 0.12);
  crystalGlow.addColorStop(0, `rgba(236, 72, 153, ${hexPulse * 0.6})`);
  crystalGlow.addColorStop(0.5, `rgba(190, 24, 93, ${hexPulse * 0.3})`);
  crystalGlow.addColorStop(1, "rgba(190, 24, 93, 0)");
  ctx.fillStyle = crystalGlow;
  ctx.beginPath();
  ctx.arc(x + size * 0.22, y - size * 0.22 + sway, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Crystal body
  const crystalGrad = ctx.createLinearGradient(x + size * 0.18, y - size * 0.32 + sway, x + size * 0.26, y - size * 0.14 + sway);
  crystalGrad.addColorStop(0, "#f472b6");
  crystalGrad.addColorStop(0.3, "#be185d");
  crystalGrad.addColorStop(0.7, "#9d174d");
  crystalGrad.addColorStop(1, "#831843");
  ctx.fillStyle = crystalGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.32 + sway);
  ctx.lineTo(x + size * 0.16, y - size * 0.2 + sway);
  ctx.lineTo(x + size * 0.19, y - size * 0.14 + sway);
  ctx.lineTo(x + size * 0.25, y - size * 0.14 + sway);
  ctx.lineTo(x + size * 0.28, y - size * 0.2 + sway);
  ctx.closePath();
  ctx.fill();

  // Crystal inner glow
  ctx.fillStyle = `rgba(251, 113, 133, ${hexPulse})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.22, y - size * 0.21 + sway, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Crystal energy beam (when attacking)
  if (isAttacking) {
    ctx.strokeStyle = `rgba(236, 72, 153, ${attackIntensity * 0.8})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.22, y - size * 0.32 + sway);
    ctx.lineTo(x + size * 0.22, y - size * 0.6 + sway);
    ctx.stroke();
    // Energy particles at beam tip
    for (let ep = 0; ep < 3; ep++) {
      const epAngle = time * 8 + ep * Math.PI * 0.67;
      ctx.fillStyle = `rgba(251, 113, 133, ${attackIntensity * 0.6})`;
      ctx.beginPath();
      ctx.arc(
        x + size * 0.22 + Math.cos(epAngle) * size * 0.04,
        y - size * 0.6 + sway + Math.sin(epAngle) * size * 0.04,
        size * 0.015,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // === LAYER 10: HAND HOLDING STAFF ===
  ctx.fillStyle = "#fdf4ff";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.2, y - size * 0.08 + sway, size * 0.045, size * 0.03, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Fingers
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.ellipse(
      x + size * 0.2 + f * size * 0.015 - size * 0.02,
      y - size * 0.06 + sway,
      size * 0.012,
      size * 0.025,
      0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
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
  zoom: number,
  attackPhase: number = 0
) {
  // HARPY - Storm Fury, Aerial Predator of the Tempest
  // A terrifying avian huntress with iridescent plumage and deadly talons
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const wingFlap = Math.sin(time * 10) * 0.5 + (isAttacking ? attackIntensity * 0.4 : 0);
  const swoop = Math.sin(time * 3) * 4 * zoom;
  const breathe = Math.sin(time * 4) * size * 0.01;
  const featherRuffle = Math.sin(time * 6) * 0.1;
  const windIntensity = 0.3 + Math.sin(time * 2) * 0.15;

  // === LAYER 1: WIND CURRENTS / AERIAL AURA ===
  // Swirling wind trails
  ctx.strokeStyle = `rgba(167, 139, 250, ${windIntensity * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  for (let w = 0; w < 4; w++) {
    const windPhase = (time * 1.5 + w * 0.5) % 2;
    const windY = y + size * 0.3 - windPhase * size * 0.6;
    const windAlpha = windPhase < 1 ? windPhase : 2 - windPhase;
    ctx.strokeStyle = `rgba(167, 139, 250, ${windAlpha * 0.25})`;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6 + Math.sin(time * 3 + w) * size * 0.2, windY);
    ctx.quadraticCurveTo(
      x + Math.cos(time * 2 + w) * size * 0.3,
      windY - size * 0.1,
      x + size * 0.6 + Math.sin(time * 3 + w + 1) * size * 0.2,
      windY + size * 0.05
    );
    ctx.stroke();
  }

  // Feather particles floating in air
  for (let f = 0; f < 6; f++) {
    const featherPhase = (time * 0.4 + f * 0.3) % 1;
    const featherX = x + Math.sin(time * 2 + f * 1.5) * size * 0.7;
    const featherY = y + size * 0.5 - featherPhase * size * 1.2;
    const featherAlpha = (1 - Math.abs(featherPhase - 0.5) * 2) * 0.4;
    const featherRot = time * 3 + f;
    
    ctx.save();
    ctx.translate(featherX, featherY);
    ctx.rotate(featherRot);
    ctx.fillStyle = `rgba(139, 92, 246, ${featherAlpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.015, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // === LAYER 2: WING SHADOW ON GROUND ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.65, 0, x, y + size * 0.65, size * 0.6);
  shadowGrad.addColorStop(0, "rgba(76, 29, 149, 0.35)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.2)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.65, size * (0.5 + Math.abs(wingFlap) * 0.2), size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 3: MAGNIFICENT LEFT WING ===
  ctx.save();
  ctx.translate(x - size * 0.18, y - size * 0.08 + swoop);
  ctx.rotate(-0.35 - wingFlap);

  // Wing base gradient
  const leftWingGrad = ctx.createLinearGradient(0, 0, -size * 0.9, -size * 0.2);
  leftWingGrad.addColorStop(0, "#8b5cf6");
  leftWingGrad.addColorStop(0.3, "#7c3aed");
  leftWingGrad.addColorStop(0.6, "#6d28d9");
  leftWingGrad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = leftWingGrad;

  // Detailed wing shape with multiple feather sections
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Primary flight feathers
  ctx.lineTo(-size * 0.15, -size * 0.25);
  ctx.lineTo(-size * 0.35, -size * 0.42);
  ctx.lineTo(-size * 0.55, -size * 0.48);
  ctx.lineTo(-size * 0.75, -size * 0.45);
  ctx.lineTo(-size * 0.9, -size * 0.35);
  // Wing tip feathers (jagged)
  ctx.lineTo(-size * 0.95, -size * 0.25);
  ctx.lineTo(-size * 0.88, -size * 0.18);
  ctx.lineTo(-size * 0.92, -size * 0.1);
  ctx.lineTo(-size * 0.82, -size * 0.05);
  ctx.lineTo(-size * 0.85, size * 0.05);
  ctx.lineTo(-size * 0.72, size * 0.02);
  // Secondary feathers
  ctx.lineTo(-size * 0.65, size * 0.12);
  ctx.lineTo(-size * 0.5, size * 0.08);
  ctx.lineTo(-size * 0.45, size * 0.18);
  ctx.lineTo(-size * 0.3, size * 0.12);
  ctx.lineTo(-size * 0.25, size * 0.2);
  ctx.lineTo(-size * 0.1, size * 0.15);
  ctx.quadraticCurveTo(0, size * 0.12, 0, size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Wing bone structure
  ctx.strokeStyle = "#5b21b6";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.35, -size * 0.18);
  ctx.lineTo(-size * 0.6, -size * 0.25);
  ctx.stroke();

  // Wing finger bones
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -size * 0.18);
  ctx.lineTo(-size * 0.35, -size * 0.42);
  ctx.moveTo(-size * 0.6, -size * 0.25);
  ctx.lineTo(-size * 0.75, -size * 0.45);
  ctx.moveTo(-size * 0.6, -size * 0.25);
  ctx.lineTo(-size * 0.9, -size * 0.32);
  ctx.stroke();

  // Feather detail lines
  ctx.strokeStyle = "rgba(124, 58, 237, 0.5)";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.15 - i * size * 0.09, size * 0.02 - i * size * 0.02);
    ctx.lineTo(-size * 0.2 - i * size * 0.1, -size * 0.15 - i * size * 0.025);
    ctx.stroke();
  }

  // Iridescent highlights on feathers
  ctx.fillStyle = `rgba(196, 181, 253, ${0.3 + featherRuffle * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(-size * 0.5, -size * 0.2, size * 0.08, size * 0.15, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-size * 0.75, -size * 0.25, size * 0.06, size * 0.12, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // === LAYER 4: MAGNIFICENT RIGHT WING ===
  ctx.save();
  ctx.translate(x + size * 0.18, y - size * 0.08 + swoop);
  ctx.rotate(0.35 + wingFlap);

  // Wing gradient (mirrored)
  const rightWingGrad = ctx.createLinearGradient(0, 0, size * 0.9, -size * 0.2);
  rightWingGrad.addColorStop(0, "#8b5cf6");
  rightWingGrad.addColorStop(0.3, "#7c3aed");
  rightWingGrad.addColorStop(0.6, "#6d28d9");
  rightWingGrad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = rightWingGrad;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.15, -size * 0.25);
  ctx.lineTo(size * 0.35, -size * 0.42);
  ctx.lineTo(size * 0.55, -size * 0.48);
  ctx.lineTo(size * 0.75, -size * 0.45);
  ctx.lineTo(size * 0.9, -size * 0.35);
  ctx.lineTo(size * 0.95, -size * 0.25);
  ctx.lineTo(size * 0.88, -size * 0.18);
  ctx.lineTo(size * 0.92, -size * 0.1);
  ctx.lineTo(size * 0.82, -size * 0.05);
  ctx.lineTo(size * 0.85, size * 0.05);
  ctx.lineTo(size * 0.72, size * 0.02);
  ctx.lineTo(size * 0.65, size * 0.12);
  ctx.lineTo(size * 0.5, size * 0.08);
  ctx.lineTo(size * 0.45, size * 0.18);
  ctx.lineTo(size * 0.3, size * 0.12);
  ctx.lineTo(size * 0.25, size * 0.2);
  ctx.lineTo(size * 0.1, size * 0.15);
  ctx.quadraticCurveTo(0, size * 0.12, 0, size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Wing bones
  ctx.strokeStyle = "#5b21b6";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.35, -size * 0.18);
  ctx.lineTo(size * 0.6, -size * 0.25);
  ctx.stroke();

  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.35, -size * 0.18);
  ctx.lineTo(size * 0.35, -size * 0.42);
  ctx.moveTo(size * 0.6, -size * 0.25);
  ctx.lineTo(size * 0.75, -size * 0.45);
  ctx.moveTo(size * 0.6, -size * 0.25);
  ctx.lineTo(size * 0.9, -size * 0.32);
  ctx.stroke();

  // Feather details
  ctx.strokeStyle = "rgba(124, 58, 237, 0.5)";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(size * 0.15 + i * size * 0.09, size * 0.02 - i * size * 0.02);
    ctx.lineTo(size * 0.2 + i * size * 0.1, -size * 0.15 - i * size * 0.025);
    ctx.stroke();
  }

  // Iridescent highlights
  ctx.fillStyle = `rgba(196, 181, 253, ${0.3 + featherRuffle * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(size * 0.5, -size * 0.2, size * 0.08, size * 0.15, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // === LAYER 5: ELEGANT AVIAN BODY ===
  // Body gradient with feather pattern
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.05 + swoop, 0, x, y + size * 0.1 + swoop, size * 0.35);
  bodyGrad.addColorStop(0, "#a78bfa");
  bodyGrad.addColorStop(0.4, "#8b5cf6");
  bodyGrad.addColorStop(0.7, "#7c3aed");
  bodyGrad.addColorStop(1, "#6d28d9");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.02 + swoop + breathe, size * 0.22, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body feather texture
  ctx.strokeStyle = "rgba(91, 33, 182, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const fX = x - size * 0.1 + col * size * 0.1;
      const fY = y - size * 0.1 + row * size * 0.1 + swoop;
      ctx.beginPath();
      ctx.arc(fX, fY, size * 0.04, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.stroke();
    }
  }

  // Feathered chest plumage (layered)
  const chestGrad = ctx.createRadialGradient(x, y - size * 0.08 + swoop, 0, x, y + size * 0.05 + swoop, size * 0.18);
  chestGrad.addColorStop(0, "#f5f3ff");
  chestGrad.addColorStop(0.5, "#ede9fe");
  chestGrad.addColorStop(1, "#ddd6fe");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.02 + swoop, size * 0.14, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chest feather details
  ctx.strokeStyle = "rgba(139, 92, 246, 0.25)";
  ctx.lineWidth = 1 * zoom;
  for (let cf = 0; cf < 5; cf++) {
    ctx.beginPath();
    ctx.arc(x, y - size * 0.12 + cf * size * 0.05 + swoop, size * 0.08, Math.PI * 0.7, Math.PI * 0.3, true);
    ctx.stroke();
  }

  // === LAYER 6: FIERCE HEAD AND FACE ===
  // Neck feathers
  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.22 + swoop, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head base
  const headGrad = ctx.createRadialGradient(x, y - size * 0.36 + swoop, 0, x, y - size * 0.32 + swoop, size * 0.16);
  headGrad.addColorStop(0, "#fef3c7");
  headGrad.addColorStop(0.6, "#fde68a");
  headGrad.addColorStop(1, "#fcd34d");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.34 + swoop, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Face markings (fierce pattern)
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 1.5 * zoom;
  // Eye stripes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.38 + swoop);
  ctx.lineTo(x - size * 0.06, y - size * 0.36 + swoop);
  ctx.moveTo(x + size * 0.12, y - size * 0.38 + swoop);
  ctx.lineTo(x + size * 0.06, y - size * 0.36 + swoop);
  ctx.stroke();

  // Crown feathers (elaborate crest)
  const crownColors = ["#7c3aed", "#8b5cf6", "#a78bfa", "#7c3aed", "#6d28d9"];
  for (let c = 0; c < 5; c++) {
    const crownAngle = -Math.PI * 0.7 + c * Math.PI * 0.1;
    const crownLen = size * (0.2 + (c === 2 ? 0.1 : 0)) + Math.sin(time * 5 + c) * size * 0.02;
    ctx.fillStyle = crownColors[c];
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(crownAngle) * size * 0.1, y - size * 0.44 + swoop + Math.sin(crownAngle) * size * 0.05);
    ctx.quadraticCurveTo(
      x + Math.cos(crownAngle - 0.2) * crownLen * 0.6,
      y - size * 0.5 + swoop + Math.sin(crownAngle) * crownLen * 0.3,
      x + Math.cos(crownAngle) * crownLen,
      y - size * 0.44 - crownLen * 0.8 + swoop
    );
    ctx.quadraticCurveTo(
      x + Math.cos(crownAngle + 0.2) * crownLen * 0.6,
      y - size * 0.5 + swoop + Math.sin(crownAngle) * crownLen * 0.3,
      x + Math.cos(crownAngle + 0.15) * size * 0.1,
      y - size * 0.44 + swoop + Math.sin(crownAngle + 0.15) * size * 0.05
    );
    ctx.fill();
  }

  // Fierce eyes (predator gaze)
  // Eye glow (gradient instead of shadow)
  const eyeGlowL = ctx.createRadialGradient(x - size * 0.06, y - size * 0.36 + swoop, 0, x - size * 0.06, y - size * 0.36 + swoop, size * 0.06);
  eyeGlowL.addColorStop(0, "#fbbf24");
  eyeGlowL.addColorStop(0.5, "rgba(251, 191, 36, 0.4)");
  eyeGlowL.addColorStop(1, "rgba(251, 191, 36, 0)");
  ctx.fillStyle = eyeGlowL;
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.36 + swoop, size * 0.06, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.36 + swoop, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Eye whites
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.36 + swoop, size * 0.04, size * 0.03, -0.25, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.36 + swoop, size * 0.04, size * 0.03, 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Iris
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(x - size * 0.055, y - size * 0.36 + swoop, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.055, y - size * 0.36 + swoop, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Pupils (vertical slit like bird of prey)
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.055, y - size * 0.36 + swoop, size * 0.008, size * 0.018, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.055, y - size * 0.36 + swoop, size * 0.008, size * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - size * 0.065, y - size * 0.37 + swoop, size * 0.008, 0, Math.PI * 2);
  ctx.arc(x + size * 0.045, y - size * 0.37 + swoop, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Sharp beak (detailed)
  // Upper beak
  const beakGrad = ctx.createLinearGradient(x, y - size * 0.3 + swoop, x, y - size * 0.2 + swoop);
  beakGrad.addColorStop(0, "#d97706");
  beakGrad.addColorStop(0.5, "#f59e0b");
  beakGrad.addColorStop(1, "#fbbf24");
  ctx.fillStyle = beakGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + swoop);
  ctx.quadraticCurveTo(x - size * 0.06, y - size * 0.26 + swoop, x - size * 0.04, y - size * 0.22 + swoop);
  ctx.lineTo(x, y - size * 0.25 + swoop);
  ctx.lineTo(x + size * 0.04, y - size * 0.22 + swoop);
  ctx.quadraticCurveTo(x + size * 0.06, y - size * 0.26 + swoop, x, y - size * 0.3 + swoop);
  ctx.fill();
  // Beak hook
  ctx.fillStyle = "#92400e";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25 + swoop);
  ctx.lineTo(x - size * 0.015, y - size * 0.21 + swoop);
  ctx.lineTo(x + size * 0.015, y - size * 0.21 + swoop);
  ctx.fill();
  // Nostril
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.27 + swoop, size * 0.008, size * 0.004, 0, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 7: POWERFUL TALONED LEGS ===
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 3 * zoom;
  
  // Left leg with segments
  const leftLegX = x - size * 0.1;
  const legSwing = Math.sin(time * 8) * size * 0.02;
  ctx.beginPath();
  ctx.moveTo(leftLegX, y + size * 0.28 + swoop);
  ctx.lineTo(leftLegX - size * 0.02, y + size * 0.38 + swoop + legSwing);
  ctx.lineTo(leftLegX, y + size * 0.48 + swoop);
  ctx.stroke();
  
  // Right leg
  const rightLegX = x + size * 0.1;
  ctx.beginPath();
  ctx.moveTo(rightLegX, y + size * 0.28 + swoop);
  ctx.lineTo(rightLegX + size * 0.02, y + size * 0.38 + swoop - legSwing);
  ctx.lineTo(rightLegX, y + size * 0.48 + swoop);
  ctx.stroke();

  // Leg scales
  ctx.fillStyle = "#d97706";
  for (let leg = 0; leg < 2; leg++) {
    const lx = leg === 0 ? leftLegX : rightLegX;
    for (let s = 0; s < 3; s++) {
      ctx.beginPath();
      ctx.arc(lx, y + size * 0.32 + s * size * 0.06 + swoop, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Deadly talons (detailed)
  for (let leg = 0; leg < 2; leg++) {
    const talonX = leg === 0 ? leftLegX : rightLegX;
    const talonBase = y + size * 0.48 + swoop;
    
    // Foot pad
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.ellipse(talonX, talonBase, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Individual talons
    for (let claw = 0; claw < 4; claw++) {
      const clawAngle = -0.4 + claw * 0.27;
      const clawLen = claw === 1 || claw === 2 ? size * 0.1 : size * 0.08;
      
      // Claw bone
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.moveTo(talonX + Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03, talonBase);
      ctx.lineTo(
        talonX + Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 + Math.cos(clawAngle) * clawLen * 0.5,
        talonBase + Math.sin(Math.PI * 0.5 + clawAngle * 0.3) * clawLen * 0.6
      );
      // Claw tip (curved hook)
      ctx.quadraticCurveTo(
        talonX + Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 + Math.cos(clawAngle - 0.2) * clawLen * 0.8,
        talonBase + clawLen * 0.9,
        talonX + Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 + Math.cos(clawAngle - 0.4) * clawLen,
        talonBase + clawLen * 0.75
      );
      ctx.fill();
      
      // Claw highlight
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.moveTo(
        talonX + Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 + Math.cos(clawAngle - 0.3) * clawLen * 0.85,
        talonBase + clawLen * 0.82
      );
      ctx.lineTo(
        talonX + Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 + Math.cos(clawAngle - 0.4) * clawLen,
        talonBase + clawLen * 0.75
      );
      ctx.lineTo(
        talonX + Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 + Math.cos(clawAngle - 0.5) * clawLen * 0.9,
        talonBase + clawLen * 0.7
      );
      ctx.fill();
    }
  }

  // === LAYER 8: ATTACK DIVE EFFECT ===
  if (isAttacking) {
    // Speed lines
    ctx.strokeStyle = `rgba(139, 92, 246, ${attackIntensity * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    for (let sl = 0; sl < 5; sl++) {
      const slX = x - size * 0.3 + sl * size * 0.15;
      ctx.beginPath();
      ctx.moveTo(slX, y - size * 0.5 + swoop);
      ctx.lineTo(slX + size * 0.05, y + size * 0.3 + swoop);
      ctx.stroke();
    }
    
    // Talon strike trail
    ctx.fillStyle = `rgba(251, 191, 36, ${attackIntensity * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.15, y + size * 0.6 + swoop);
    ctx.lineTo(x, y + size * 0.8 + swoop);
    ctx.lineTo(x + size * 0.15, y + size * 0.6 + swoop);
    ctx.fill();
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
  zoom: number,
  attackPhase: number = 0
) {
  // WYVERN - Ancient Draconic Terror with Venomous Breath
  // A colossal flying predator wreathed in toxic miasma
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  
  // Core animation variables
  const wingFlap = Math.sin(time * 5) * 0.4 + (isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.2 : 0);
  const breathe = Math.sin(time * 2) * size * 0.03;
  const tailSwing = Math.sin(time * 2.5) * 0.25 + (isAttacking ? attackIntensity * 0.3 : 0);
  const neckSway = Math.sin(time * 1.8) * size * 0.02;
  const hoverBob = Math.sin(time * 3) * size * 0.015;
  
  // Attack animation specifics
  const lungeLean = isAttacking ? attackIntensity * size * 0.1 : 0;
  const jawOpen = isAttacking ? attackIntensity * 0.4 : 0.1 + Math.sin(time * 4) * 0.05;
  const venomIntensity = isAttacking ? 0.6 + attackIntensity * 0.4 : 0.3 + Math.sin(time * 3) * 0.15;

  // === LAYER 1: TOXIC MIASMA AURA ===
  // Outer poison cloud
  for (let ring = 0; ring < 4; ring++) {
    const ringPhase = (time * 0.4 + ring * 0.4) % 1;
    const ringSize = size * (0.7 + ring * 0.2) * (1 + venomIntensity * 0.2);
    const ringAlpha = (0.12 - ring * 0.025) * (0.8 + venomIntensity * 0.4);
    ctx.fillStyle = `rgba(74, 222, 128, ${ringAlpha})`;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const wobble = Math.sin(a * 4 + time * 2 + ring) * size * 0.04;
      const rx = x + Math.cos(a) * (ringSize + wobble);
      const ry = y + Math.sin(a) * (ringSize * 0.5 + wobble * 0.4) + hoverBob;
      if (a === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Inner power aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  auraGrad.addColorStop(0, `rgba(16, 185, 129, ${0.25 + venomIntensity * 0.15})`);
  auraGrad.addColorStop(0.4, `rgba(5, 150, 105, ${0.15 + venomIntensity * 0.1})`);
  auraGrad.addColorStop(0.7, `rgba(4, 120, 87, ${0.08})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + hoverBob, size * 0.85, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 2: MASSIVE SEGMENTED TAIL ===
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.15 + breathe + hoverBob);
  ctx.rotate(tailSwing);
  
  // Tail segments for more detail
  const tailSegments = 6;
  for (let seg = 0; seg < tailSegments; seg++) {
    const segX = seg * size * 0.12;
    const segY = Math.sin(time * 3 + seg * 0.5) * size * 0.02;
    const segSize = size * (0.12 - seg * 0.012);
    const segGrad = ctx.createRadialGradient(segX, segY, 0, segX, segY, segSize);
    segGrad.addColorStop(0, "#10b981");
    segGrad.addColorStop(0.6, "#059669");
    segGrad.addColorStop(1, "#047857");
    ctx.fillStyle = segGrad;
    ctx.beginPath();
    ctx.ellipse(segX, segY, segSize, segSize * 0.7, seg * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // Segment ridge scales
    if (seg < tailSegments - 1) {
      ctx.fillStyle = "#065f46";
      ctx.beginPath();
      ctx.moveTo(segX, segY - segSize * 0.6);
      ctx.lineTo(segX + size * 0.03, segY - segSize * 0.9);
      ctx.lineTo(segX + size * 0.06, segY - segSize * 0.6);
      ctx.fill();
    }
  }
  
  // Deadly tail spike cluster
  const spikeBase = (tailSegments - 1) * size * 0.12;
  ctx.fillStyle = "#0f172a";
  // Main spike
  ctx.beginPath();
  ctx.moveTo(spikeBase, 0);
  ctx.lineTo(spikeBase + size * 0.25, -size * 0.05);
  ctx.lineTo(spikeBase + size * 0.22, size * 0.02);
  ctx.fill();
  // Side spikes
  ctx.beginPath();
  ctx.moveTo(spikeBase + size * 0.08, -size * 0.03);
  ctx.lineTo(spikeBase + size * 0.18, -size * 0.12);
  ctx.lineTo(spikeBase + size * 0.15, -size * 0.02);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(spikeBase + size * 0.08, size * 0.02);
  ctx.lineTo(spikeBase + size * 0.18, size * 0.1);
  ctx.lineTo(spikeBase + size * 0.15, size * 0.02);
  ctx.fill();
  // Venom drip from spike
  const dripPhase = (time * 2) % 1;
  ctx.fillStyle = `rgba(74, 222, 128, ${0.7 - dripPhase * 0.5})`;
  ctx.beginPath();
  ctx.arc(spikeBase + size * 0.24, -size * 0.05 + dripPhase * size * 0.08, size * 0.015 * (1 - dripPhase * 0.6), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === LAYER 3: MAGNIFICENT WINGS ===
  // Left wing (detailed with membrane and bones)
  ctx.save();
  ctx.translate(x - size * 0.22, y - size * 0.12 + breathe + hoverBob);
  ctx.rotate(-0.45 - wingFlap);
  
  // Wing membrane gradient
  const leftWingGrad = ctx.createLinearGradient(0, 0, -size * 0.95, -size * 0.2);
  leftWingGrad.addColorStop(0, "#10b981");
  leftWingGrad.addColorStop(0.3, "#059669");
  leftWingGrad.addColorStop(0.6, "#047857");
  leftWingGrad.addColorStop(1, "#065f46");
  ctx.fillStyle = leftWingGrad;
  
  // Main wing membrane with detailed shape
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Wing finger 1
  ctx.lineTo(-size * 0.15, -size * 0.35);
  ctx.lineTo(-size * 0.35, -size * 0.48);
  // Wing finger 2
  ctx.lineTo(-size * 0.55, -size * 0.45);
  ctx.lineTo(-size * 0.78, -size * 0.38);
  // Wing finger 3
  ctx.lineTo(-size * 0.92, -size * 0.25);
  ctx.lineTo(-size * 0.98, -size * 0.08);
  // Lower edge with membrane scallops
  ctx.lineTo(-size * 0.88, size * 0.02);
  ctx.lineTo(-size * 0.75, size * 0.08);
  ctx.lineTo(-size * 0.6, size * 0.05);
  ctx.lineTo(-size * 0.68, size * 0.18);
  ctx.lineTo(-size * 0.5, size * 0.15);
  ctx.lineTo(-size * 0.35, size * 0.12);
  ctx.lineTo(-size * 0.42, size * 0.22);
  ctx.lineTo(-size * 0.25, size * 0.18);
  ctx.quadraticCurveTo(-size * 0.1, size * 0.2, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();
  
  // Wing bone structure
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 3 * zoom;
  // Main arm bone
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.35, -size * 0.15);
  ctx.stroke();
  // Finger bones
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -size * 0.15);
  ctx.lineTo(-size * 0.35, -size * 0.48);
  ctx.moveTo(-size * 0.35, -size * 0.15);
  ctx.lineTo(-size * 0.78, -size * 0.38);
  ctx.moveTo(-size * 0.35, -size * 0.15);
  ctx.lineTo(-size * 0.95, -size * 0.15);
  ctx.stroke();
  
  // Vein details on membrane
  ctx.strokeStyle = "rgba(6, 95, 70, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let v = 0; v < 5; v++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.35 - v * size * 0.1, -size * 0.15);
    ctx.quadraticCurveTo(
      -size * 0.4 - v * size * 0.12,
      size * 0.05 + Math.sin(v) * size * 0.03,
      -size * 0.3 - v * size * 0.08,
      size * 0.12
    );
    ctx.stroke();
  }
  
  // Wing claw
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.33, -size * 0.14);
  ctx.lineTo(-size * 0.42, -size * 0.08);
  ctx.lineTo(-size * 0.35, -size * 0.12);
  ctx.fill();
  ctx.restore();

  // Right wing (mirrored)
  ctx.save();
  ctx.translate(x + size * 0.22, y - size * 0.12 + breathe + hoverBob);
  ctx.rotate(0.45 + wingFlap);
  
  const rightWingGrad = ctx.createLinearGradient(0, 0, size * 0.95, -size * 0.2);
  rightWingGrad.addColorStop(0, "#10b981");
  rightWingGrad.addColorStop(0.3, "#059669");
  rightWingGrad.addColorStop(0.6, "#047857");
  rightWingGrad.addColorStop(1, "#065f46");
  ctx.fillStyle = rightWingGrad;
  
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.15, -size * 0.35);
  ctx.lineTo(size * 0.35, -size * 0.48);
  ctx.lineTo(size * 0.55, -size * 0.45);
  ctx.lineTo(size * 0.78, -size * 0.38);
  ctx.lineTo(size * 0.92, -size * 0.25);
  ctx.lineTo(size * 0.98, -size * 0.08);
  ctx.lineTo(size * 0.88, size * 0.02);
  ctx.lineTo(size * 0.75, size * 0.08);
  ctx.lineTo(size * 0.6, size * 0.05);
  ctx.lineTo(size * 0.68, size * 0.18);
  ctx.lineTo(size * 0.5, size * 0.15);
  ctx.lineTo(size * 0.35, size * 0.12);
  ctx.lineTo(size * 0.42, size * 0.22);
  ctx.lineTo(size * 0.25, size * 0.18);
  ctx.quadraticCurveTo(size * 0.1, size * 0.2, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();
  
  // Bones and veins mirrored
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.35, -size * 0.15);
  ctx.stroke();
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.35, -size * 0.15);
  ctx.lineTo(size * 0.35, -size * 0.48);
  ctx.moveTo(size * 0.35, -size * 0.15);
  ctx.lineTo(size * 0.78, -size * 0.38);
  ctx.moveTo(size * 0.35, -size * 0.15);
  ctx.lineTo(size * 0.95, -size * 0.15);
  ctx.stroke();
  
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(size * 0.33, -size * 0.14);
  ctx.lineTo(size * 0.42, -size * 0.08);
  ctx.lineTo(size * 0.35, -size * 0.12);
  ctx.fill();
  ctx.restore();

  // === LAYER 4: MUSCULAR BODY ===
  const bodyY = y + size * 0.05 + breathe + hoverBob - lungeLean * 0.3;
  
  // Body shadow/depth layer
  ctx.fillStyle = "rgba(4, 120, 87, 0.6)";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.02, bodyY + size * 0.03, size * 0.34, size * 0.38, 0.05, 0, Math.PI * 2);
  ctx.fill();
  
  // Main body with muscle definition
  const bodyGrad = ctx.createRadialGradient(x - size * 0.1, bodyY - size * 0.1, 0, x, bodyY, size * 0.42);
  bodyGrad.addColorStop(0, "#34d399");
  bodyGrad.addColorStop(0.3, "#10b981");
  bodyGrad.addColorStop(0.7, "#059669");
  bodyGrad.addColorStop(1, "#047857");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, bodyY, size * 0.32, size * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Armored belly plates
  const bellyGrad = ctx.createLinearGradient(x, bodyY - size * 0.2, x, bodyY + size * 0.3);
  bellyGrad.addColorStop(0, "#a7f3d0");
  bellyGrad.addColorStop(0.5, "#6ee7b7");
  bellyGrad.addColorStop(1, "#a7f3d0");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(x, bodyY + size * 0.08, size * 0.2, size * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Detailed belly scale plates
  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    const plateY = bodyY - size * 0.08 + i * size * 0.065;
    const plateWidth = size * (0.18 - Math.abs(i - 2.5) * 0.02);
    ctx.beginPath();
    ctx.moveTo(x - plateWidth, plateY);
    ctx.quadraticCurveTo(x, plateY + size * 0.025, x + plateWidth, plateY);
    ctx.stroke();
  }
  
  // Dorsal ridge spikes
  for (let i = 0; i < 5; i++) {
    const spikeX = x - size * 0.1 + i * size * 0.05;
    const spikeY = bodyY - size * 0.32 + Math.abs(i - 2) * size * 0.03;
    const spikeSize = size * (0.06 - Math.abs(i - 2) * 0.01);
    ctx.fillStyle = "#065f46";
    ctx.beginPath();
    ctx.moveTo(spikeX - spikeSize * 0.4, spikeY + spikeSize * 0.3);
    ctx.lineTo(spikeX, spikeY - spikeSize);
    ctx.lineTo(spikeX + spikeSize * 0.4, spikeY + spikeSize * 0.3);
    ctx.fill();
  }

  // === LAYER 5: POWERFUL NECK ===
  const neckGrad = ctx.createLinearGradient(x - size * 0.15, y - size * 0.2, x + size * 0.1, y - size * 0.55);
  neckGrad.addColorStop(0, "#059669");
  neckGrad.addColorStop(0.5, "#10b981");
  neckGrad.addColorStop(1, "#059669");
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.18 + breathe + hoverBob);
  ctx.quadraticCurveTo(
    x - size * 0.05 + neckSway,
    y - size * 0.38,
    x + size * 0.03 + lungeLean,
    y - size * 0.52 + breathe + hoverBob
  );
  ctx.lineTo(x + size * 0.14 + lungeLean, y - size * 0.48 + breathe + hoverBob);
  ctx.quadraticCurveTo(
    x + size * 0.12 + neckSway,
    y - size * 0.32,
    x + size * 0.12,
    y - size * 0.18 + breathe + hoverBob
  );
  ctx.fill();
  
  // Neck ridges
  ctx.fillStyle = "#065f46";
  for (let i = 0; i < 4; i++) {
    const ridgeProgress = 0.2 + i * 0.2;
    const ridgeX = x - size * 0.08 + ridgeProgress * size * 0.12 + neckSway * ridgeProgress;
    const ridgeY = y - size * 0.22 - ridgeProgress * size * 0.28 + breathe + hoverBob;
    ctx.beginPath();
    ctx.moveTo(ridgeX - size * 0.02, ridgeY);
    ctx.lineTo(ridgeX, ridgeY - size * 0.04);
    ctx.lineTo(ridgeX + size * 0.02, ridgeY);
    ctx.fill();
  }

  // === LAYER 6: FEARSOME HEAD ===
  const headX = x + size * 0.04 + lungeLean;
  const headY = y - size * 0.56 + breathe + hoverBob;
  
  // Head base
  const headGrad = ctx.createRadialGradient(headX - size * 0.05, headY - size * 0.02, 0, headX, headY, size * 0.18);
  headGrad.addColorStop(0, "#10b981");
  headGrad.addColorStop(0.6, "#059669");
  headGrad.addColorStop(1, "#047857");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.16, size * 0.13, 0.35, 0, Math.PI * 2);
  ctx.fill();
  
  // Brow ridges
  ctx.fillStyle = "#047857";
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.02, headY - size * 0.08, size * 0.14, size * 0.05, 0.2, Math.PI, Math.PI * 2);
  ctx.fill();
  
  // Snout with jaw mechanics
  const snoutX = headX - size * 0.12;
  const snoutY = headY + size * 0.01 + jawOpen * size * 0.03;
  ctx.fillStyle = "#059669";
  // Upper jaw
  ctx.beginPath();
  ctx.ellipse(snoutX, snoutY - size * 0.02, size * 0.12, size * 0.06, 0.25, 0, Math.PI * 2);
  ctx.fill();
  // Lower jaw (opens when attacking)
  ctx.save();
  ctx.translate(snoutX + size * 0.02, snoutY + size * 0.02);
  ctx.rotate(jawOpen * 0.4);
  ctx.fillStyle = "#047857";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.02, size * 0.1, size * 0.04, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Teeth on lower jaw
  ctx.fillStyle = "#f0fdf4";
  for (let t = 0; t < 5; t++) {
    const toothX = -size * 0.06 + t * size * 0.025;
    ctx.beginPath();
    ctx.moveTo(toothX - size * 0.008, 0);
    ctx.lineTo(toothX, -size * 0.025);
    ctx.lineTo(toothX + size * 0.008, 0);
    ctx.fill();
  }
  ctx.restore();
  
  // Upper teeth
  ctx.fillStyle = "#f0fdf4";
  for (let t = 0; t < 6; t++) {
    const toothX = snoutX - size * 0.08 + t * size * 0.025;
    const toothY = snoutY + size * 0.02;
    ctx.beginPath();
    ctx.moveTo(toothX - size * 0.008, toothY);
    ctx.lineTo(toothX, toothY + size * 0.03);
    ctx.lineTo(toothX + size * 0.008, toothY);
    ctx.fill();
  }
  
  // Nostrils with smoke
  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.ellipse(snoutX - size * 0.06, snoutY - size * 0.04, size * 0.015, size * 0.01, 0.3, 0, Math.PI * 2);
  ctx.ellipse(snoutX - size * 0.04, snoutY - size * 0.05, size * 0.015, size * 0.01, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Nostril smoke
  for (let s = 0; s < 3; s++) {
    const smokePhase = (time * 0.8 + s * 0.4) % 1.5;
    const smokeX = snoutX - size * 0.05 + Math.sin(time * 2 + s) * size * 0.02;
    const smokeY = snoutY - size * 0.05 - smokePhase * size * 0.1;
    const smokeAlpha = (0.4 - smokePhase * 0.25) * venomIntensity;
    ctx.fillStyle = `rgba(74, 222, 128, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, size * (0.02 + smokePhase * 0.02), 0, Math.PI * 2);
    ctx.fill();
  }

  // === LAYER 7: GLOWING PREDATOR EYES ===
  // Eye sockets
  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.01, headY - size * 0.03, size * 0.05, size * 0.04, -0.2, 0, Math.PI * 2);
  ctx.ellipse(headX + size * 0.09, headY - size * 0.01, size * 0.045, size * 0.035, 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye glow (intensifies when attacking)
  const eyeGlow = isAttacking ? 0.9 + attackIntensity * 0.1 : 0.7 + Math.sin(time * 2) * 0.2;
  ctx.fillStyle = `rgba(251, 191, 36, ${eyeGlow})`;
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.01, headY - size * 0.03, size * 0.04, size * 0.03, -0.2, 0, Math.PI * 2);
  ctx.ellipse(headX + size * 0.09, headY - size * 0.01, size * 0.035, size * 0.025, 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Slit pupils (narrow when attacking)
  const pupilWidth = isAttacking ? size * 0.008 : size * 0.015;
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.01, headY - size * 0.03, pupilWidth, size * 0.025, -0.2, 0, Math.PI * 2);
  ctx.ellipse(headX + size * 0.09, headY - size * 0.01, pupilWidth * 0.9, size * 0.02, 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = "#fffbeb";
  ctx.beginPath();
  ctx.arc(headX - size * 0.02, headY - size * 0.045, size * 0.01, 0, Math.PI * 2);
  ctx.arc(headX + size * 0.08, headY - size * 0.025, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 8: CROWN OF HORNS ===
  ctx.fillStyle = "#0f172a";
  // Main horns
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.06, headY - size * 0.1);
  ctx.quadraticCurveTo(headX + size * 0.12, headY - size * 0.2, headX + size * 0.16, headY - size * 0.28);
  ctx.lineTo(headX + size * 0.12, headY - size * 0.22);
  ctx.quadraticCurveTo(headX + size * 0.1, headY - size * 0.14, headX + size * 0.08, headY - size * 0.08);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.04, headY - size * 0.12);
  ctx.quadraticCurveTo(headX - size * 0.08, headY - size * 0.24, headX - size * 0.06, headY - size * 0.32);
  ctx.lineTo(headX - size * 0.04, headY - size * 0.26);
  ctx.quadraticCurveTo(headX - size * 0.04, headY - size * 0.18, headX - size * 0.02, headY - size * 0.1);
  ctx.fill();
  
  // Horn ridges
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1 * zoom;
  for (let h = 0; h < 3; h++) {
    ctx.beginPath();
    ctx.arc(headX + size * 0.12, headY - size * 0.18 - h * size * 0.03, size * 0.02, 0, Math.PI);
    ctx.stroke();
  }
  
  // Small decorative horns
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.13, headY - size * 0.06);
  ctx.lineTo(headX + size * 0.18, headY - size * 0.12);
  ctx.lineTo(headX + size * 0.14, headY - size * 0.08);
  ctx.fill();

  // === LAYER 9: POWERFUL LEGS WITH TALONS ===
  const legY = y + size * 0.28 + breathe + hoverBob;
  
  // Left leg
  ctx.fillStyle = "#059669";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, legY - size * 0.05);
  ctx.quadraticCurveTo(x - size * 0.18, legY + size * 0.15, x - size * 0.2, legY + size * 0.3);
  ctx.lineTo(x - size * 0.12, legY + size * 0.3);
  ctx.quadraticCurveTo(x - size * 0.11, legY + size * 0.15, x - size * 0.1, legY - size * 0.02);
  ctx.fill();
  
  // Right leg
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, legY - size * 0.05);
  ctx.quadraticCurveTo(x + size * 0.18, legY + size * 0.15, x + size * 0.2, legY + size * 0.3);
  ctx.lineTo(x + size * 0.12, legY + size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.11, legY + size * 0.15, x + size * 0.1, legY - size * 0.02);
  ctx.fill();
  
  // Detailed talons
  ctx.fillStyle = "#0f172a";
  for (let leg = 0; leg < 2; leg++) {
    const legX = leg === 0 ? x - size * 0.16 : x + size * 0.16;
    const talonY = legY + size * 0.3;
    // Three front talons
    for (let claw = 0; claw < 3; claw++) {
      const clawX = legX + (claw - 1) * size * 0.04;
      ctx.beginPath();
      ctx.moveTo(clawX - size * 0.015, talonY);
      ctx.quadraticCurveTo(clawX, talonY + size * 0.02, clawX, talonY + size * 0.08);
      ctx.quadraticCurveTo(clawX + size * 0.005, talonY + size * 0.02, clawX + size * 0.015, talonY);
      ctx.fill();
    }
    // Back talon
    ctx.beginPath();
    ctx.moveTo(legX + (leg === 0 ? size * 0.03 : -size * 0.03), talonY);
    ctx.lineTo(legX + (leg === 0 ? size * 0.08 : -size * 0.08), talonY + size * 0.04);
    ctx.lineTo(legX + (leg === 0 ? size * 0.05 : -size * 0.05), talonY);
    ctx.fill();
  }

  // === LAYER 10: VENOM BREATH ATTACK ===
  if (isAttacking || venomIntensity > 0.4) {
    const breathX = snoutX - size * 0.15 - lungeLean;
    const breathY = snoutY + jawOpen * size * 0.05;
    
    // Main venom stream
    const streamLength = size * (0.3 + (isAttacking ? attackIntensity * 0.5 : 0));
    const streamGrad = ctx.createLinearGradient(breathX, breathY, breathX - streamLength, breathY);
    streamGrad.addColorStop(0, `rgba(74, 222, 128, ${venomIntensity * 0.9})`);
    streamGrad.addColorStop(0.3, `rgba(52, 211, 153, ${venomIntensity * 0.7})`);
    streamGrad.addColorStop(0.7, `rgba(16, 185, 129, ${venomIntensity * 0.4})`);
    streamGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
    ctx.fillStyle = streamGrad;
    
    ctx.beginPath();
    ctx.moveTo(breathX, breathY - size * 0.03);
    ctx.quadraticCurveTo(
      breathX - streamLength * 0.5, 
      breathY - size * 0.05 + Math.sin(time * 8) * size * 0.02,
      breathX - streamLength, 
      breathY + Math.sin(time * 6) * size * 0.04
    );
    ctx.quadraticCurveTo(
      breathX - streamLength * 0.5,
      breathY + size * 0.05 + Math.sin(time * 8 + 1) * size * 0.02,
      breathX,
      breathY + size * 0.03
    );
    ctx.closePath();
    ctx.fill();
    
    // Venom droplets/particles
    for (let d = 0; d < 8; d++) {
      const dropPhase = (time * 2 + d * 0.3) % 1;
      const dropX = breathX - dropPhase * streamLength + Math.sin(time * 5 + d) * size * 0.03;
      const dropY = breathY + Math.sin(time * 6 + d * 2) * size * 0.04;
      const dropAlpha = venomIntensity * (1 - dropPhase) * 0.8;
      ctx.fillStyle = `rgba(74, 222, 128, ${dropAlpha})`;
      ctx.beginPath();
      ctx.arc(dropX, dropY, size * 0.015 * (1 - dropPhase * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LAYER 11: ATTACK IMPACT EFFECTS ===
  if (isAttacking) {
    // Energy surge from body
    ctx.strokeStyle = `rgba(52, 211, 153, ${attackIntensity * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    for (let i = 0; i < 4; i++) {
      const surgeAngle = time * 4 + i * Math.PI * 0.5;
      const surgeX = x + Math.cos(surgeAngle) * size * 0.4;
      const surgeY = y + Math.sin(surgeAngle) * size * 0.25 + hoverBob;
      ctx.beginPath();
      ctx.arc(surgeX, surgeY, size * 0.05 + attackIntensity * size * 0.03, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Claw swipe trails
    ctx.strokeStyle = `rgba(16, 185, 129, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 3 * zoom;
    const swipePhase = attackPhase * Math.PI;
    for (let leg = 0; leg < 2; leg++) {
      const legX = leg === 0 ? x - size * 0.16 : x + size * 0.16;
      ctx.beginPath();
      ctx.arc(legX, legY + size * 0.35, size * 0.15, 
        Math.PI * (leg === 0 ? 0.8 : 0.2) + swipePhase, 
        Math.PI * (leg === 0 ? 1.2 : -0.2) + swipePhase);
      ctx.stroke();
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
  zoom: number,
  attackPhase: number = 0
) {
  // SPECTER - Tormented Soul, Ethereal Horror from Beyond the Veil
  // A terrifying ghostly apparition wreathed in ectoplasmic energy
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const phase = Math.sin(time * 2) * 5 * zoom + (isAttacking ? attackIntensity * size * 0.2 : 0);
  const flicker = 0.5 + Math.sin(time * 8) * 0.3;
  const waver = Math.sin(time * 4) * 0.1;
  const pulseIntensity = 0.4 + Math.sin(time * 3) * 0.25;
  const distortion = Math.sin(time * 6) * size * 0.02;
  const wailPhase = (time * 2) % 1;

  // === LAYER 1: DIMENSIONAL RIFT / VOID AURA ===
  // Dark void pool beneath
  const voidGrad = ctx.createRadialGradient(x, y + size * 0.5, 0, x, y + size * 0.5, size * 0.6);
  voidGrad.addColorStop(0, `rgba(15, 23, 42, ${pulseIntensity * 0.6})`);
  voidGrad.addColorStop(0.3, `rgba(30, 41, 59, ${pulseIntensity * 0.4})`);
  voidGrad.addColorStop(0.6, `rgba(51, 65, 85, ${pulseIntensity * 0.2})`);
  voidGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.6, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Void tendrils reaching up
  ctx.strokeStyle = `rgba(30, 41, 59, ${pulseIntensity * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let t = 0; t < 5; t++) {
    const tendrilAngle = t * Math.PI / 2.5 - Math.PI / 4;
    const tendrilPhase = (time * 0.5 + t * 0.3) % 1;
    const tendrilHeight = size * 0.3 * tendrilPhase;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(tendrilAngle) * size * 0.3, y + size * 0.5);
    ctx.quadraticCurveTo(
      x + Math.cos(tendrilAngle) * size * 0.25 + Math.sin(time * 3 + t) * size * 0.1,
      y + size * 0.3 - tendrilHeight * 0.5,
      x + Math.cos(tendrilAngle) * size * 0.15,
      y + size * 0.5 - tendrilHeight
    );
    ctx.stroke();
  }

  // === LAYER 2: ETHEREAL TRAIL (MOTION GHOSTS) ===
  for (let i = 0; i < 6; i++) {
    const trailOffset = i * 8;
    const trailAlpha = (0.2 - i * 0.03) * flicker;
    const trailScale = 1 - i * 0.08;
    
    // Trail body
    const trailGrad = ctx.createRadialGradient(
      x + trailOffset,
      y + i * 4 + phase,
      0,
      x + trailOffset,
      y + i * 4 + phase,
      size * 0.4 * trailScale
    );
    trailGrad.addColorStop(0, `rgba(148, 163, 184, ${trailAlpha})`);
    trailGrad.addColorStop(0.5, `rgba(100, 116, 139, ${trailAlpha * 0.5})`);
    trailGrad.addColorStop(1, "rgba(100, 116, 139, 0)");
    ctx.fillStyle = trailGrad;
    ctx.beginPath();
    ctx.ellipse(
      x + trailOffset,
      y + i * 4 + phase,
      size * 0.3 * trailScale,
      size * 0.4 * trailScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // === LAYER 3: ECTOPLASMIC PARTICLES ===
  for (let p = 0; p < 15; p++) {
    const particlePhase = (time * 0.7 + p * 0.15) % 1;
    const particleAngle = p * Math.PI / 7.5 + time * 0.3;
    const particleDist = size * (0.2 + particlePhase * 0.5);
    const px = x + Math.cos(particleAngle) * particleDist + Math.sin(time * 2 + p) * size * 0.1;
    const py = y - particlePhase * size * 0.6 + phase;
    const particleAlpha = (1 - particlePhase) * 0.5 * pulseIntensity;
    const particleSize = size * 0.025 * (1 - particlePhase * 0.5);
    
    // Particle glow
    const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, particleSize * 3);
    particleGlow.addColorStop(0, `rgba(56, 189, 248, ${particleAlpha * 0.8})`);
    particleGlow.addColorStop(0.5, `rgba(56, 189, 248, ${particleAlpha * 0.3})`);
    particleGlow.addColorStop(1, "rgba(56, 189, 248, 0)");
    ctx.fillStyle = particleGlow;
    ctx.beginPath();
    ctx.arc(px, py, particleSize * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Particle core
    ctx.fillStyle = `rgba(186, 230, 253, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // === LAYER 4: MAIN GHOSTLY FORM (LAYERED FOR DEPTH) ===
  // Outer ethereal shroud
  const outerGrad = ctx.createRadialGradient(x, y - size * 0.05 + phase, 0, x, y + size * 0.1 + phase, size * 0.65);
  outerGrad.addColorStop(0, `rgba(203, 213, 225, ${flicker * 0.7})`);
  outerGrad.addColorStop(0.4, `rgba(148, 163, 184, ${flicker * 0.5})`);
  outerGrad.addColorStop(0.7, `rgba(100, 116, 139, ${flicker * 0.2})`);
  outerGrad.addColorStop(1, "rgba(100, 116, 139, 0)");
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.5);
  // Wavy bottom edge with more detail
  for (let i = 0; i < 10; i++) {
    const waveX = x - size * 0.4 + i * size * 0.08;
    const waveY = y + size * 0.5 + Math.sin(time * 5 + i * 0.8) * size * 0.1 + (i % 2) * size * 0.05;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(x + size * 0.45, y + size * 0.1, x + size * 0.3, y - size * 0.35 + phase + distortion);
  ctx.quadraticCurveTo(x + size * 0.15, y - size * 0.55 + phase, x, y - size * 0.5 + phase);
  ctx.quadraticCurveTo(x - size * 0.15, y - size * 0.55 + phase, x - size * 0.3, y - size * 0.35 + phase - distortion);
  ctx.quadraticCurveTo(x - size * 0.45, y + size * 0.1, x - size * 0.4, y + size * 0.5);
  ctx.fill();

  // Inner spectral form
  const innerGrad = ctx.createRadialGradient(x, y - size * 0.1 + phase, 0, x, y + phase, size * 0.45);
  innerGrad.addColorStop(0, `rgba(241, 245, 249, ${flicker * 0.9})`);
  innerGrad.addColorStop(0.3, `rgba(226, 232, 240, ${flicker * 0.7})`);
  innerGrad.addColorStop(0.6, `rgba(203, 213, 225, ${flicker * 0.4})`);
  innerGrad.addColorStop(1, "rgba(203, 213, 225, 0)");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.35);
  for (let i = 0; i < 7; i++) {
    const waveX = x - size * 0.28 + i * size * 0.09;
    const waveY = y + size * 0.35 + Math.sin(time * 6 + i) * size * 0.06;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(x + size * 0.32, y, x + size * 0.2, y - size * 0.35 + phase);
  ctx.quadraticCurveTo(x, y - size * 0.45 + phase, x - size * 0.2, y - size * 0.35 + phase);
  ctx.quadraticCurveTo(x - size * 0.32, y, x - size * 0.28, y + size * 0.35);
  ctx.fill();

  // === LAYER 5: DARK VOID CORE ===
  const voidCore = ctx.createRadialGradient(x, y - size * 0.05 + phase, 0, x, y - size * 0.05 + phase, size * 0.22);
  voidCore.addColorStop(0, `rgba(15, 23, 42, ${flicker * 0.8})`);
  voidCore.addColorStop(0.5, `rgba(30, 41, 59, ${flicker * 0.5})`);
  voidCore.addColorStop(1, "rgba(30, 41, 59, 0)");
  ctx.fillStyle = voidCore;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05 + phase, size * 0.18, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Void energy swirls
  ctx.strokeStyle = `rgba(56, 189, 248, ${pulseIntensity * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let swirl = 0; swirl < 3; swirl++) {
    const swirlAngle = time * 2 + swirl * Math.PI * 0.67;
    ctx.beginPath();
    ctx.arc(
      x,
      y - size * 0.05 + phase,
      size * (0.08 + swirl * 0.04),
      swirlAngle,
      swirlAngle + Math.PI * 0.5
    );
    ctx.stroke();
  }

  // === LAYER 6: SKULL-LIKE FACE (DETAILED) ===
  // Face glow aura
  const faceGlow = ctx.createRadialGradient(x, y - size * 0.28 + phase, 0, x, y - size * 0.28 + phase, size * 0.28);
  faceGlow.addColorStop(0, `rgba(248, 250, 252, ${flicker * 0.3})`);
  faceGlow.addColorStop(0.5, `rgba(226, 232, 240, ${flicker * 0.15})`);
  faceGlow.addColorStop(1, "rgba(226, 232, 240, 0)");
  ctx.fillStyle = faceGlow;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28 + phase, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Skull base
  const skullGrad = ctx.createRadialGradient(x, y - size * 0.3 + phase, 0, x, y - size * 0.25 + phase, size * 0.2);
  skullGrad.addColorStop(0, `rgba(248, 250, 252, ${flicker})`);
  skullGrad.addColorStop(0.6, `rgba(226, 232, 240, ${flicker * 0.9})`);
  skullGrad.addColorStop(1, `rgba(203, 213, 225, ${flicker * 0.7})`);
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28 + phase, size * 0.19, 0, Math.PI * 2);
  ctx.fill();

  // Skull cracks for horror
  ctx.strokeStyle = `rgba(100, 116, 139, ${flicker * 0.5})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.42 + phase);
  ctx.lineTo(x - size * 0.08, y - size * 0.32 + phase);
  ctx.lineTo(x - size * 0.03, y - size * 0.28 + phase);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.4 + phase);
  ctx.lineTo(x + size * 0.08, y - size * 0.3 + phase);
  ctx.stroke();

  // Hollow eye sockets (deep black voids)
  ctx.fillStyle = `rgba(15, 23, 42, ${flicker})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.3 + phase, size * 0.055, size * 0.07, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.08, y - size * 0.3 + phase, size * 0.055, size * 0.07, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Soul fire in eyes (gradient glow instead of shadowBlur)
  // Left eye glow
  const leftEyeGlow = ctx.createRadialGradient(x - size * 0.08, y - size * 0.3 + phase, 0, x - size * 0.08, y - size * 0.3 + phase, size * 0.08);
  leftEyeGlow.addColorStop(0, `rgba(56, 189, 248, ${flicker})`);
  leftEyeGlow.addColorStop(0.3, `rgba(56, 189, 248, ${flicker * 0.6})`);
  leftEyeGlow.addColorStop(0.6, `rgba(14, 165, 233, ${flicker * 0.3})`);
  leftEyeGlow.addColorStop(1, "rgba(14, 165, 233, 0)");
  ctx.fillStyle = leftEyeGlow;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.3 + phase, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Right eye glow
  const rightEyeGlow = ctx.createRadialGradient(x + size * 0.08, y - size * 0.3 + phase, 0, x + size * 0.08, y - size * 0.3 + phase, size * 0.08);
  rightEyeGlow.addColorStop(0, `rgba(56, 189, 248, ${flicker})`);
  rightEyeGlow.addColorStop(0.3, `rgba(56, 189, 248, ${flicker * 0.6})`);
  rightEyeGlow.addColorStop(0.6, `rgba(14, 165, 233, ${flicker * 0.3})`);
  rightEyeGlow.addColorStop(1, "rgba(14, 165, 233, 0)");
  ctx.fillStyle = rightEyeGlow;
  ctx.beginPath();
  ctx.arc(x + size * 0.08, y - size * 0.3 + phase, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Eye cores (bright center)
  ctx.fillStyle = `rgba(186, 230, 253, ${flicker})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.3 + phase, size * 0.028, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.3 + phase, size * 0.028, 0, Math.PI * 2);
  ctx.fill();

  // Eye flame wisps
  ctx.strokeStyle = `rgba(56, 189, 248, ${flicker * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let eye = 0; eye < 2; eye++) {
    const eyeX = x + (eye === 0 ? -size * 0.08 : size * 0.08);
    for (let wisp = 0; wisp < 2; wisp++) {
      const wispAngle = -Math.PI * 0.5 + (wisp - 0.5) * 0.5 + Math.sin(time * 5 + eye + wisp) * 0.2;
      ctx.beginPath();
      ctx.moveTo(eyeX, y - size * 0.3 + phase);
      ctx.quadraticCurveTo(
        eyeX + Math.cos(wispAngle) * size * 0.04,
        y - size * 0.38 + phase,
        eyeX + Math.cos(wispAngle + 0.3) * size * 0.03,
        y - size * 0.45 + phase + Math.sin(time * 6 + wisp) * size * 0.02
      );
      ctx.stroke();
    }
  }

  // Nose cavity
  ctx.fillStyle = `rgba(30, 41, 59, ${flicker * 0.8})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22 + phase);
  ctx.lineTo(x - size * 0.025, y - size * 0.17 + phase);
  ctx.lineTo(x + size * 0.025, y - size * 0.17 + phase);
  ctx.fill();

  // Ghostly mouth (wailing expression)
  const mouthOpen = 0.08 + Math.sin(time * 6) * 0.03 + (isAttacking ? attackIntensity * 0.05 : 0);
  ctx.fillStyle = `rgba(15, 23, 42, ${flicker * 0.9})`;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.12 + phase, size * 0.07, size * mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth inner darkness gradient
  const mouthGrad = ctx.createRadialGradient(x, y - size * 0.12 + phase, 0, x, y - size * 0.12 + phase, size * 0.06);
  mouthGrad.addColorStop(0, "rgba(0, 0, 0, 0.8)");
  mouthGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = mouthGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.12 + phase, size * 0.05, size * (mouthOpen - 0.02), 0, 0, Math.PI * 2);
  ctx.fill();

  // Wail effect (sound waves)
  if (wailPhase < 0.5) {
    const wailAlpha = (0.5 - wailPhase) * 0.4 * flicker;
    ctx.strokeStyle = `rgba(148, 163, 184, ${wailAlpha})`;
    ctx.lineWidth = 1 * zoom;
    for (let wave = 0; wave < 3; wave++) {
      const waveSize = size * (0.1 + wailPhase * 0.3 + wave * 0.08);
      ctx.beginPath();
      ctx.arc(x, y - size * 0.12 + phase, waveSize, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    }
  }

  // === LAYER 7: WISPY ARMS (DETAILED) ===
  // Left arm with ethereal detail
  const armGrad = ctx.createLinearGradient(x - size * 0.25, y - size * 0.1 + phase, x - size * 0.5, y + size * 0.35);
  armGrad.addColorStop(0, `rgba(203, 213, 225, ${flicker * 0.7})`);
  armGrad.addColorStop(0.5, `rgba(148, 163, 184, ${flicker * 0.5})`);
  armGrad.addColorStop(1, `rgba(100, 116, 139, ${flicker * 0.2})`);
  
  ctx.strokeStyle = armGrad;
  ctx.lineWidth = 4 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.08 + phase);
  ctx.bezierCurveTo(
    x - size * 0.45 + Math.sin(time * 3) * size * 0.08,
    y + size * 0.05,
    x - size * 0.5 + Math.cos(time * 2.5) * size * 0.06,
    y + size * 0.2,
    x - size * 0.45 + waver * size,
    y + size * 0.35
  );
  ctx.stroke();

  // Left arm secondary wisp
  ctx.lineWidth = 2 * zoom;
  ctx.strokeStyle = `rgba(148, 163, 184, ${flicker * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.55 + Math.sin(time * 4) * size * 0.05,
    y + size * 0.25,
    x - size * 0.5,
    y + size * 0.45
  );
  ctx.stroke();

  // Left hand wisps (fingers)
  ctx.lineWidth = 1.5 * zoom;
  for (let finger = 0; finger < 4; finger++) {
    const fingerAngle = -0.3 + finger * 0.2 + Math.sin(time * 3 + finger) * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.45 + waver * size, y + size * 0.35);
    ctx.lineTo(
      x - size * 0.45 + waver * size + Math.cos(fingerAngle) * size * 0.12,
      y + size * 0.35 + Math.sin(fingerAngle + Math.PI * 0.5) * size * 0.1
    );
    ctx.stroke();
  }

  // Right arm
  ctx.strokeStyle = armGrad;
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y - size * 0.08 + phase);
  ctx.bezierCurveTo(
    x + size * 0.45 - Math.sin(time * 3) * size * 0.08,
    y + size * 0.05,
    x + size * 0.5 - Math.cos(time * 2.5) * size * 0.06,
    y + size * 0.2,
    x + size * 0.45 - waver * size,
    y + size * 0.35
  );
  ctx.stroke();

  // Right arm secondary wisp
  ctx.lineWidth = 2 * zoom;
  ctx.strokeStyle = `rgba(148, 163, 184, ${flicker * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y + size * 0.1);
  ctx.quadraticCurveTo(
    x + size * 0.55 - Math.sin(time * 4) * size * 0.05,
    y + size * 0.25,
    x + size * 0.5,
    y + size * 0.45
  );
  ctx.stroke();

  // Right hand wisps
  ctx.lineWidth = 1.5 * zoom;
  for (let finger = 0; finger < 4; finger++) {
    const fingerAngle = Math.PI - (-0.3 + finger * 0.2 + Math.sin(time * 3 + finger) * 0.1);
    ctx.beginPath();
    ctx.moveTo(x + size * 0.45 - waver * size, y + size * 0.35);
    ctx.lineTo(
      x + size * 0.45 - waver * size + Math.cos(fingerAngle) * size * 0.12,
      y + size * 0.35 + Math.sin(fingerAngle - Math.PI * 0.5) * size * 0.1
    );
    ctx.stroke();
  }

  // === LAYER 8: CHAINS OF BINDING (DETAILED) ===
  // Left chain
  ctx.strokeStyle = `rgba(71, 85, 105, ${flicker * 0.9})`;
  ctx.lineWidth = 2.5 * zoom;
  const chainStartL = { x: x - size * 0.18, y: y + size * 0.08 + phase };
  for (let link = 0; link < 7; link++) {
    const linkX = chainStartL.x - link * size * 0.055 + Math.sin(time * 2 + link * 0.5) * size * 0.02;
    const linkY = chainStartL.y + link * size * 0.05 + Math.cos(time * 3 + link) * size * 0.01;
    const linkAngle = Math.sin(time + link * 0.3) * 0.3;
    
    ctx.save();
    ctx.translate(linkX, linkY);
    ctx.rotate(linkAngle);
    ctx.strokeStyle = `rgba(71, 85, 105, ${flicker * (0.9 - link * 0.08)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.025, size * 0.035, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Right chain
  const chainStartR = { x: x + size * 0.18, y: y + size * 0.08 + phase };
  for (let link = 0; link < 7; link++) {
    const linkX = chainStartR.x + link * size * 0.055 - Math.sin(time * 2 + link * 0.5) * size * 0.02;
    const linkY = chainStartR.y + link * size * 0.05 + Math.cos(time * 3 + link) * size * 0.01;
    const linkAngle = -Math.sin(time + link * 0.3) * 0.3;
    
    ctx.save();
    ctx.translate(linkX, linkY);
    ctx.rotate(linkAngle);
    ctx.strokeStyle = `rgba(71, 85, 105, ${flicker * (0.9 - link * 0.08)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.025, size * 0.035, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Chain shackles on wrists
  ctx.fillStyle = `rgba(51, 65, 85, ${flicker * 0.8})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.32, y + size * 0.05 + phase, size * 0.04, size * 0.025, -0.3, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.32, y + size * 0.05 + phase, size * 0.04, size * 0.025, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 9: ATTACK EFFECT (SOUL DRAIN) ===
  if (isAttacking) {
    // Soul drain tendrils
    ctx.strokeStyle = `rgba(56, 189, 248, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let tendril = 0; tendril < 5; tendril++) {
      const tendrilAngle = tendril * Math.PI / 2.5 - Math.PI / 5;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.05 + phase);
      ctx.bezierCurveTo(
        x + Math.cos(tendrilAngle) * size * 0.3,
        y + Math.sin(tendrilAngle) * size * 0.2,
        x + Math.cos(tendrilAngle) * size * 0.5 + Math.sin(time * 8 + tendril) * size * 0.1,
        y + Math.sin(tendrilAngle) * size * 0.3,
        x + Math.cos(tendrilAngle) * size * 0.7,
        y + Math.sin(tendrilAngle) * size * 0.35
      );
      ctx.stroke();
    }

    // Soul orbs being drained
    for (let orb = 0; orb < 3; orb++) {
      const orbPhase = (attackIntensity + orb * 0.3) % 1;
      const orbDist = size * (0.6 - orbPhase * 0.5);
      const orbAngle = orb * Math.PI * 0.4 + time * 2;
      const orbX = x + Math.cos(orbAngle) * orbDist;
      const orbY = y + Math.sin(orbAngle) * orbDist * 0.5;
      
      const orbGlow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, size * 0.05);
      orbGlow.addColorStop(0, `rgba(186, 230, 253, ${attackIntensity * 0.8})`);
      orbGlow.addColorStop(0.5, `rgba(56, 189, 248, ${attackIntensity * 0.4})`);
      orbGlow.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = orbGlow;
      ctx.beginPath();
      ctx.arc(orbX, orbY, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LAYER 10: HOOD / SHROUD OVERLAY ===
  // Tattered hood edges
  ctx.strokeStyle = `rgba(100, 116, 139, ${flicker * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.42 + phase);
  ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.25 + phase, x - size * 0.32, y - size * 0.1 + phase);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.42 + phase);
  ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.25 + phase, x + size * 0.32, y - size * 0.1 + phase);
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
  zoom: number,
  attackPhase: number = 0
) {
  // BLOOD WARDEN - Possessed warrior channeling demonic rage through cursed runes
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const rage = Math.sin(time * 14) * 4 * zoom + (isAttacking ? attackIntensity * size * 0.25 : 0);
  const breathe = Math.sin(time * 9) * 0.1;
  const armSwing = Math.sin(time * 12) * 0.5;
  const bloodPulse = 0.6 + Math.sin(time * 6) * 0.35;
  const runeGlow = 0.5 + Math.sin(time * 4) * 0.4;

  // Blood mist aura
  for (let mist = 0; mist < 8; mist++) {
    const mistAngle = time * 0.8 + mist * Math.PI / 4;
    const mistDist = size * 0.5 + Math.sin(time * 2 + mist) * size * 0.1;
    ctx.fillStyle = `rgba(220, 38, 38, ${bloodPulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(x + Math.cos(mistAngle) * mistDist, y + Math.sin(mistAngle) * mistDist * 0.5, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rage aura - more intense
  const rageGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
  rageGrad.addColorStop(0, `rgba(220, 38, 38, ${bloodPulse * 0.4})`);
  rageGrad.addColorStop(0.4, `rgba(185, 28, 28, ${bloodPulse * 0.25})`);
  rageGrad.addColorStop(0.7, `rgba(127, 29, 29, ${bloodPulse * 0.1})`);
  rageGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = rageGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Motion blur effect - more dramatic
  ctx.globalAlpha = 0.35;
  for (let i = 1; i < 4; i++) {
    ctx.fillStyle = `rgba(185, 28, 28, ${0.3 - i * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(x + i * 9, y, size * (0.28 - i * 0.04), size * (0.38 - i * 0.05), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Blood-soaked ground
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.5, 0, x, y + size * 0.5, size * 0.4);
  shadowGrad.addColorStop(0, "rgba(127, 29, 29, 0.5)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.3)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Muscular demonic body with runes
  const bodyGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  bodyGrad.addColorStop(0, "#450a0a");
  bodyGrad.addColorStop(0.3, "#7f1d1d");
  bodyGrad.addColorStop(0.5, "#b91c1c");
  bodyGrad.addColorStop(0.7, "#7f1d1d");
  bodyGrad.addColorStop(1, "#450a0a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.42);
  ctx.lineTo(x - size * 0.45 - breathe * size, y - size * 0.12);
  ctx.quadraticCurveTo(x, y - size * 0.45, x + size * 0.45 + breathe * size, y - size * 0.12);
  ctx.lineTo(x + size * 0.38, y + size * 0.42);
  ctx.closePath();
  ctx.fill();

  // Blood rune tattoos on body
  ctx.strokeStyle = `rgba(220, 38, 38, ${runeGlow})`;
  ctx.lineWidth = 2 * zoom;
  // Left rune
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.1);
  ctx.lineTo(x - size * 0.2, y + size * 0.15);
  ctx.lineTo(x - size * 0.3, y + size * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - size * 0.25, y + size * 0.05, size * 0.04, 0, Math.PI * 2);
  ctx.stroke();
  // Right rune
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.1);
  ctx.lineTo(x + size * 0.2, y + size * 0.15);
  ctx.lineTo(x + size * 0.3, y + size * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y + size * 0.05, size * 0.04, 0, Math.PI * 2);
  ctx.stroke();

  // War paint stripes - blood-soaked
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(x - size * 0.28, y - size * 0.18, size * 0.1, size * 0.4);
  ctx.fillRect(x + size * 0.18, y - size * 0.18, size * 0.1, size * 0.4);

  // Massive demon-touched arms
  // Left arm with cursed axe
  ctx.save();
  ctx.translate(x - size * 0.4, y - size * 0.12);
  ctx.rotate(-0.55 + armSwing);
  const armGrad = ctx.createLinearGradient(0, 0, 0, size * 0.4);
  armGrad.addColorStop(0, "#b91c1c");
  armGrad.addColorStop(1, "#7f1d1d");
  ctx.fillStyle = armGrad;
  ctx.fillRect(-size * 0.1, 0, size * 0.2, size * 0.4);
  // Arm runes
  ctx.strokeStyle = `rgba(220, 38, 38, ${runeGlow * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05);
  ctx.lineTo(0, size * 0.3);
  ctx.stroke();
  // Cursed great axe
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.035, size * 0.35, size * 0.07, size * 0.35);
  // Axe head with blood glow
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, size * 0.6);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.55, -size * 0.22, size * 0.45);
  ctx.lineTo(-size * 0.22, size * 0.7);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.65, -size * 0.025, size * 0.65);
  ctx.fill();
  // Blood glow on blade
  ctx.strokeStyle = `rgba(220, 38, 38, ${bloodPulse})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.58);
  ctx.lineTo(-size * 0.18, size * 0.52);
  ctx.stroke();
  ctx.restore();

  // Right arm with spikes
  ctx.save();
  ctx.translate(x + size * 0.4, y - size * 0.12);
  ctx.rotate(0.55 - armSwing);
  ctx.fillStyle = armGrad;
  ctx.fillRect(-size * 0.1, 0, size * 0.2, size * 0.38);
  // Spiked gauntlet
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.12, size * 0.32, size * 0.24, size * 0.1);
  // Spikes
  for (let spike = 0; spike < 3; spike++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.08 + spike * size * 0.08, size * 0.42);
    ctx.lineTo(-size * 0.06 + spike * size * 0.08, size * 0.52);
    ctx.lineTo(-size * 0.04 + spike * size * 0.08, size * 0.42);
    ctx.fill();
  }
  ctx.restore();

  // Fierce demonic head
  const headGrad = ctx.createRadialGradient(x, y - size * 0.38 + rage * 0.3, 0, x, y - size * 0.38 + rage * 0.3, size * 0.22);
  headGrad.addColorStop(0, "#a8a29e");
  headGrad.addColorStop(0.6, "#78716c");
  headGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.38 + rage * 0.3, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Face runes
  ctx.strokeStyle = `rgba(220, 38, 38, ${runeGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.42 + rage * 0.3);
  ctx.lineTo(x - size * 0.1, y - size * 0.32 + rage * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.42 + rage * 0.3);
  ctx.lineTo(x + size * 0.1, y - size * 0.32 + rage * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52 + rage * 0.3);
  ctx.lineTo(x, y - size * 0.42 + rage * 0.3);
  ctx.stroke();

  // Demonic eyes (intense blood glow)
  ctx.fillStyle = "#fef2f2";
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.4 + rage * 0.3, size * 0.05, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.4 + rage * 0.3, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dc2626";
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.4 + rage * 0.3, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.4 + rage * 0.3, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Pupil slits
  ctx.fillStyle = "#450a0a";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.4 + rage * 0.3, size * 0.008, size * 0.02, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.08, y - size * 0.4 + rage * 0.3, size * 0.008, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();

  // Screaming mouth with fangs
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28 + rage * 0.3, size * 0.1, size * 0.06 + Math.abs(rage) * 0.012, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fanged teeth
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.31 + rage * 0.3);
  ctx.lineTo(x - size * 0.06, y - size * 0.24 + rage * 0.3);
  ctx.lineTo(x - size * 0.04, y - size * 0.31 + rage * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.31 + rage * 0.3);
  ctx.lineTo(x + size * 0.06, y - size * 0.24 + rage * 0.3);
  ctx.lineTo(x + size * 0.04, y - size * 0.31 + rage * 0.3);
  ctx.fill();

  // Wild flaming hair with horns
  ctx.fillStyle = "#991b1b";
  for (let i = 0; i < 9; i++) {
    const hairAngle = -Math.PI * 0.35 + i * Math.PI * 0.087;
    const hairLen = size * (0.25 + Math.sin(time * 10 + i) * 0.05);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(hairAngle) * size * 0.16, y - size * 0.5 + rage * 0.3);
    ctx.quadraticCurveTo(
      x + Math.cos(hairAngle) * size * 0.28 + Math.sin(time * 10 + i) * size * 0.06,
      y - size * 0.65 + rage * 0.3,
      x + Math.cos(hairAngle) * size * 0.22,
      y - size * 0.5 - hairLen + rage * 0.3
    );
    ctx.lineTo(x + Math.cos(hairAngle) * size * 0.13, y - size * 0.48 + rage * 0.3);
    ctx.fill();
  }
  // Small demon horns
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.52 + rage * 0.3);
  ctx.lineTo(x - size * 0.18, y - size * 0.68 + rage * 0.3);
  ctx.lineTo(x - size * 0.08, y - size * 0.5 + rage * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.52 + rage * 0.3);
  ctx.lineTo(x + size * 0.18, y - size * 0.68 + rage * 0.3);
  ctx.lineTo(x + size * 0.08, y - size * 0.5 + rage * 0.3);
  ctx.fill();
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
  zoom: number,
  attackPhase: number = 0
) {
  // NASSAU LION COLOSSUS - Animated stone lion guardian, awakened from Nassau Hall
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const prowl = Math.sin(time * 3) * 3 * zoom + (isAttacking ? attackIntensity * size * 0.2 : 0);
  const breathe = Math.sin(time * 2) * size * 0.02;
  const crackGlow = 0.5 + Math.sin(time * 3) * 0.35;
  const maneFlow = Math.sin(time * 4) * 0.08;
  const tailSwish = Math.sin(time * 5) * 0.3;
  const eyeIntensity = 0.7 + Math.sin(time * 6) * 0.3;

  // Ancient power aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${crackGlow * 0.25})`);
  auraGrad.addColorStop(0.4, `rgba(217, 119, 6, ${crackGlow * 0.15})`);
  auraGrad.addColorStop(0.7, `rgba(180, 83, 9, ${crackGlow * 0.08})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Ground cracks from weight
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let crack = 0; crack < 6; crack++) {
    const crackAngle = crack * Math.PI / 3;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.45);
    let cx = x, cy = y + size * 0.45;
    for (let seg = 0; seg < 3; seg++) {
      cx += Math.cos(crackAngle + (Math.random() - 0.5) * 0.5) * size * 0.1;
      cy += size * 0.03;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Heavy shadow
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.48, 0, x, y + size * 0.48, size * 0.5);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.6)");
  shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.4)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.55, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail (behind body)
  ctx.save();
  ctx.translate(x + size * 0.35, y + size * 0.15);
  ctx.rotate(tailSwish);
  const tailGrad = ctx.createLinearGradient(0, 0, size * 0.4, 0);
  tailGrad.addColorStop(0, "#78716c");
  tailGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.04);
  ctx.quadraticCurveTo(size * 0.25, -size * 0.08 + Math.sin(time * 6) * size * 0.03, size * 0.4, -size * 0.02);
  ctx.quadraticCurveTo(size * 0.25, size * 0.02 + Math.sin(time * 6) * size * 0.03, 0, size * 0.04);
  ctx.fill();
  // Tail tuft (stone carved)
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  for (let t = 0; t < 5; t++) {
    const tuftAngle = -Math.PI * 0.3 + t * Math.PI * 0.15;
    ctx.moveTo(size * 0.38, 0);
    ctx.quadraticCurveTo(
      size * 0.45 + Math.cos(tuftAngle) * size * 0.08,
      Math.sin(tuftAngle) * size * 0.06,
      size * 0.5 + Math.cos(tuftAngle) * size * 0.1,
      Math.sin(tuftAngle) * size * 0.1
    );
  }
  ctx.fill();
  ctx.restore();

  // Back legs
  ctx.fillStyle = "#57534e";
  // Left back leg
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.2);
  ctx.lineTo(x - size * 0.28, y + size * 0.45 + prowl * 0.3);
  ctx.lineTo(x - size * 0.35, y + size * 0.48 + prowl * 0.3);
  ctx.lineTo(x - size * 0.22, y + size * 0.48 + prowl * 0.3);
  ctx.lineTo(x - size * 0.15, y + size * 0.2);
  ctx.fill();
  // Right back leg
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + size * 0.2);
  ctx.lineTo(x + size * 0.28, y + size * 0.45 - prowl * 0.15);
  ctx.lineTo(x + size * 0.35, y + size * 0.48 - prowl * 0.15);
  ctx.lineTo(x + size * 0.22, y + size * 0.48 - prowl * 0.15);
  ctx.lineTo(x + size * 0.15, y + size * 0.2);
  ctx.fill();
  // Paw details
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.48 + prowl * 0.3);
  ctx.lineTo(x - size * 0.3, y + size * 0.45 + prowl * 0.3);
  ctx.moveTo(x - size * 0.28, y + size * 0.48 + prowl * 0.3);
  ctx.lineTo(x - size * 0.26, y + size * 0.45 + prowl * 0.3);
  ctx.stroke();

  // Massive lion body
  const bodyGrad = ctx.createRadialGradient(x, y + size * 0.05, 0, x, y + size * 0.05, size * 0.45);
  bodyGrad.addColorStop(0, "#a8a29e");
  bodyGrad.addColorStop(0.4, "#78716c");
  bodyGrad.addColorStop(0.8, "#57534e");
  bodyGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.08 + breathe, size * 0.4, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone texture on body
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  for (let tex = 0; tex < 5; tex++) {
    const texX = x - size * 0.25 + tex * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(texX, y - size * 0.1 + breathe);
    ctx.quadraticCurveTo(texX + size * 0.03, y + size * 0.05 + breathe, texX - size * 0.02, y + size * 0.2 + breathe);
    ctx.stroke();
  }

  // Glowing rune veins across body
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.6})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 8 * zoom;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.05 + breathe);
  ctx.quadraticCurveTo(x - size * 0.1, y + size * 0.1 + breathe, x + size * 0.15, y - size * 0.02 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.15 + breathe);
  ctx.lineTo(x + size * 0.2, y + size * 0.2 + breathe);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Front legs (powerful, lion-like)
  ctx.fillStyle = "#78716c";
  // Left front leg
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.08);
  ctx.lineTo(x - size * 0.38, y + size * 0.35 + prowl);
  ctx.lineTo(x - size * 0.45, y + size * 0.48 + prowl);
  ctx.lineTo(x - size * 0.3, y + size * 0.48 + prowl);
  ctx.lineTo(x - size * 0.26, y - size * 0.08);
  ctx.fill();
  // Right front leg
  ctx.beginPath();
  ctx.moveTo(x + size * 0.32, y - size * 0.08);
  ctx.lineTo(x + size * 0.38, y + size * 0.35 - prowl * 0.5);
  ctx.lineTo(x + size * 0.45, y + size * 0.48 - prowl * 0.5);
  ctx.lineTo(x + size * 0.3, y + size * 0.48 - prowl * 0.5);
  ctx.lineTo(x + size * 0.26, y - size * 0.08);
  ctx.fill();
  // Stone paws with claws
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.375, y + size * 0.48 + prowl, size * 0.08, size * 0.035, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.375, y + size * 0.48 - prowl * 0.5, size * 0.08, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  // Claws (glowing)
  ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow})`;
  for (let paw = 0; paw < 2; paw++) {
    const pawX = paw === 0 ? x - size * 0.375 : x + size * 0.375;
    const pawY = paw === 0 ? y + size * 0.48 + prowl : y + size * 0.48 - prowl * 0.5;
    for (let claw = 0; claw < 4; claw++) {
      ctx.beginPath();
      ctx.moveTo(pawX - size * 0.06 + claw * size * 0.04, pawY + size * 0.02);
      ctx.lineTo(pawX - size * 0.065 + claw * size * 0.04, pawY + size * 0.06);
      ctx.lineTo(pawX - size * 0.055 + claw * size * 0.04, pawY + size * 0.02);
      ctx.fill();
    }
  }

  // Magnificent stone mane
  ctx.fillStyle = "#57534e";
  for (let layer = 0; layer < 3; layer++) {
    for (let m = 0; m < 12; m++) {
      const maneAngle = -Math.PI * 0.7 + m * Math.PI * 0.12;
      const maneLen = size * (0.18 + layer * 0.06) + Math.sin(time * 4 + m) * size * 0.02;
      const maneX = x + Math.cos(maneAngle) * size * (0.22 + layer * 0.03);
      const maneY = y - size * 0.35 + Math.sin(maneAngle) * size * 0.1;
      ctx.save();
      ctx.translate(maneX, maneY);
      ctx.rotate(maneAngle + Math.PI * 0.5 + maneFlow + Math.sin(time * 3 + m) * 0.05);
      ctx.beginPath();
      ctx.moveTo(-size * 0.03, 0);
      ctx.quadraticCurveTo(-size * 0.04, maneLen * 0.5, -size * 0.02, maneLen);
      ctx.quadraticCurveTo(0, maneLen * 1.1, size * 0.02, maneLen);
      ctx.quadraticCurveTo(size * 0.04, maneLen * 0.5, size * 0.03, 0);
      ctx.fill();
      ctx.restore();
    }
  }
  // Glowing veins in mane
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let v = 0; v < 6; v++) {
    const vAngle = -Math.PI * 0.5 + v * Math.PI * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(vAngle) * size * 0.15, y - size * 0.38);
    ctx.lineTo(x + Math.cos(vAngle) * size * 0.35, y - size * 0.5 + Math.sin(time * 3 + v) * size * 0.03);
    ctx.stroke();
  }

  // Majestic lion head
  const headGrad = ctx.createRadialGradient(x, y - size * 0.35, 0, x, y - size * 0.35, size * 0.25);
  headGrad.addColorStop(0, "#a8a29e");
  headGrad.addColorStop(0.5, "#78716c");
  headGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.35, size * 0.22, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brow ridge
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.18, size * 0.06, 0, 0, Math.PI);
  ctx.fill();

  // Stone-carved muzzle
  ctx.fillStyle = "#78716c";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32);
  ctx.lineTo(x - size * 0.04, y - size * 0.26);
  ctx.lineTo(x + size * 0.04, y - size * 0.26);
  ctx.fill();

  // Ferocious glowing eyes
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.09, y - size * 0.42, size * 0.05, size * 0.04, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.09, y - size * 0.42, size * 0.05, size * 0.04, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Glowing irises
  ctx.fillStyle = `rgba(251, 191, 36, ${eyeIntensity})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.42, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, y - size * 0.42, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Slit pupils
  ctx.fillStyle = "#0f0a00";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.09, y - size * 0.42, size * 0.01, size * 0.025, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.09, y - size * 0.42, size * 0.01, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snarling mouth with stone fangs
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.22, size * 0.08, size * 0.04, 0, 0, Math.PI);
  ctx.fill();
  // Upper fangs
  ctx.fillStyle = "#e7e5e4";
  for (let fang = 0; fang < 2; fang++) {
    const fangX = fang === 0 ? x - size * 0.05 : x + size * 0.05;
    ctx.beginPath();
    ctx.moveTo(fangX - size * 0.015, y - size * 0.22);
    ctx.lineTo(fangX, y - size * 0.15);
    ctx.lineTo(fangX + size * 0.015, y - size * 0.22);
    ctx.fill();
  }
  // Teeth
  ctx.fillStyle = "#d6d3d1";
  for (let tooth = 0; tooth < 6; tooth++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.05 + tooth * size * 0.02, y - size * 0.21, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stone ears
  ctx.fillStyle = "#78716c";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.48);
  ctx.lineTo(x - size * 0.22, y - size * 0.62);
  ctx.lineTo(x - size * 0.1, y - size * 0.52);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.48);
  ctx.lineTo(x + size * 0.22, y - size * 0.62);
  ctx.lineTo(x + size * 0.1, y - size * 0.52);
  ctx.fill();

  // Ancient Nassau rune on forehead
  ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 10 * zoom;
  ctx.font = `bold ${size * 0.1}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ℜ", x, y - size * 0.5);
  ctx.shadowBlur = 0;

  // Weathering and moss patches
  ctx.fillStyle = "#4d7c0f";
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.32, y + size * 0.05, size * 0.04, size * 0.025, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.28, y + size * 0.12, size * 0.035, size * 0.02, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y - size * 0.55, size * 0.025, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Dust particles being kicked up
  for (let dust = 0; dust < 6; dust++) {
    const dustPhase = (time * 2 + dust * 0.4) % 1.5;
    const dustX = x - size * 0.4 + dust * size * 0.16 + Math.sin(time * 3 + dust) * size * 0.05;
    const dustY = y + size * 0.5 - dustPhase * size * 0.15;
    ctx.fillStyle = `rgba(168, 162, 158, ${(1 - dustPhase / 1.5) * 0.4})`;
    ctx.beginPath();
    ctx.arc(dustX, dustY, size * 0.015 * (1 - dustPhase / 2), 0, Math.PI * 2);
    ctx.fill();
  }
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
  zoom: number,
  attackPhase: number = 0
) {
  // LICH SOVEREIGN - Ancient undead king commanding legions of the dead
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const hover = Math.sin(time * 2) * 5 * zoom + (isAttacking ? attackIntensity * size * 0.2 : 0);
  const deathPulse = 0.5 + Math.sin(time * 3) * 0.35;
  const soulBurn = 0.6 + Math.sin(time * 5) * 0.3;
  const phylacteryGlow = 0.7 + Math.sin(time * 4) * 0.25;

  // Death domain - rippling dark energy
  for (let ring = 0; ring < 4; ring++) {
    const ringSize = size * (0.35 + ring * 0.12) + Math.sin(time * 2 + ring * 0.5) * size * 0.04;
    ctx.strokeStyle = `rgba(74, 222, 128, ${deathPulse * (0.4 - ring * 0.08)})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.48, ringSize, ringSize * 0.25, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Death aura - more intense
  const deathGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  deathGrad.addColorStop(0, `rgba(30, 27, 75, ${deathPulse * 0.5})`);
  deathGrad.addColorStop(0.3, `rgba(15, 10, 46, ${deathPulse * 0.35})`);
  deathGrad.addColorStop(0.6, `rgba(10, 10, 30, ${deathPulse * 0.2})`);
  deathGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = deathGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Floating skull spirits - more detailed
  for (let i = 0; i < 5; i++) {
    const spiritAngle = time * 1.2 + i * Math.PI * 0.4;
    const spiritDist = size * 0.58 + Math.sin(time * 2 + i) * size * 0.08;
    const spiritX = x + Math.cos(spiritAngle) * spiritDist;
    const spiritY = y - size * 0.08 + Math.sin(spiritAngle) * spiritDist * 0.35;
    // Skull glow
    ctx.fillStyle = `rgba(74, 222, 128, ${0.15 + Math.sin(time * 4 + i) * 0.1})`;
    ctx.beginPath();
    ctx.arc(spiritX, spiritY, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    // Skull
    ctx.fillStyle = `rgba(200, 200, 200, ${0.5 + Math.sin(time * 4 + i) * 0.25})`;
    ctx.beginPath();
    ctx.arc(spiritX, spiritY, size * 0.065, 0, Math.PI * 2);
    ctx.fill();
    // Skull eyes
    ctx.fillStyle = `rgba(74, 222, 128, ${soulBurn})`;
    ctx.shadowColor = "#4ade80";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(spiritX - size * 0.018, spiritY - size * 0.012, size * 0.014, 0, Math.PI * 2);
    ctx.arc(spiritX + size * 0.018, spiritY - size * 0.012, size * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Soul trail
    ctx.strokeStyle = `rgba(74, 222, 128, 0.2)`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(spiritX, spiritY);
    ctx.lineTo(spiritX - Math.cos(spiritAngle) * size * 0.1, spiritY - Math.sin(spiritAngle) * size * 0.04);
    ctx.stroke();
  }

  // Deep shadow
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.4);
  shadowGrad.addColorStop(0, "rgba(30, 27, 75, 0.6)");
  shadowGrad.addColorStop(0.5, "rgba(15, 10, 46, 0.35)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.4, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark robes with soul threads
  const robeGrad = ctx.createLinearGradient(x - size * 0.42, y, x + size * 0.42, y);
  robeGrad.addColorStop(0, "#0a0820");
  robeGrad.addColorStop(0.3, "#1e1b4b");
  robeGrad.addColorStop(0.5, "#312e81");
  robeGrad.addColorStop(0.7, "#1e1b4b");
  robeGrad.addColorStop(1, "#0a0820");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.55);
  for (let i = 0; i < 7; i++) {
    const jagX = x - size * 0.42 + i * size * 0.14;
    const jagY = y + size * 0.55 + Math.sin(time * 5 + i * 1.1) * size * 0.05 + (i % 2) * size * 0.03;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(x + size * 0.45, y, x + size * 0.18, y - size * 0.45 + hover);
  ctx.lineTo(x - size * 0.18, y - size * 0.45 + hover);
  ctx.quadraticCurveTo(x - size * 0.45, y, x - size * 0.42, y + size * 0.55);
  ctx.fill();

  // Soul threads on robe
  ctx.strokeStyle = `rgba(74, 222, 128, ${deathPulse * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let thread = 0; thread < 5; thread++) {
    const threadX = x - size * 0.25 + thread * size * 0.125;
    ctx.beginPath();
    ctx.moveTo(threadX, y - size * 0.3 + hover * 0.2);
    ctx.bezierCurveTo(
      threadX + Math.sin(time * 2 + thread) * size * 0.05,
      y,
      threadX - Math.cos(time * 2 + thread) * size * 0.04,
      y + size * 0.2,
      threadX + Math.sin(thread) * size * 0.06,
      y + size * 0.45
    );
    ctx.stroke();
  }

  // Bone decorations on robe - more elaborate
  ctx.fillStyle = "#e8e0d0";
  for (let i = 0; i < 4; i++) {
    const boneY = y - size * 0.15 + i * size * 0.14 + hover * 0.5;
    ctx.beginPath();
    ctx.ellipse(x, boneY, size * 0.04, size * 0.018, 0, 0, Math.PI * 2);
    ctx.fill();
    // Small skulls between bones
    if (i < 3) {
      ctx.beginPath();
      ctx.arc(x, boneY + size * 0.07, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.arc(x - size * 0.008, boneY + size * 0.065, size * 0.005, 0, Math.PI * 2);
      ctx.arc(x + size * 0.008, boneY + size * 0.065, size * 0.005, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e8e0d0";
    }
  }

  // Crown of souls around head
  for (let crown = 0; crown < 6; crown++) {
    const crownAngle = crown * Math.PI / 3 - Math.PI / 2;
    ctx.fillStyle = `rgba(74, 222, 128, ${soulBurn * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(crownAngle) * size * 0.2,
      y - size * 0.5 + hover + Math.sin(crownAngle) * size * 0.08
    );
    ctx.lineTo(
      x + Math.cos(crownAngle) * size * 0.28,
      y - size * 0.62 + hover + Math.sin(crownAngle) * size * 0.1 + Math.sin(time * 4 + crown) * size * 0.02
    );
    ctx.lineTo(
      x + Math.cos(crownAngle + 0.15) * size * 0.2,
      y - size * 0.5 + hover + Math.sin(crownAngle + 0.15) * size * 0.08
    );
    ctx.fill();
  }

  // Skeletal face - more detailed lich skull
  const skullGrad = ctx.createRadialGradient(x, y - size * 0.45 + hover, 0, x, y - size * 0.45 + hover, size * 0.18);
  skullGrad.addColorStop(0, "#f5f5f4");
  skullGrad.addColorStop(0.6, "#e8e0d0");
  skullGrad.addColorStop(1, "#d6d3d1");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.45 + hover, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  // Skull cracks
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.58 + hover);
  ctx.lineTo(x - size * 0.04, y - size * 0.48 + hover);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.55 + hover);
  ctx.lineTo(x + size * 0.1, y - size * 0.45 + hover);
  ctx.stroke();

  // Hollow eye sockets
  ctx.fillStyle = "#0a0820";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.07, y - size * 0.47 + hover, size * 0.045, size * 0.055, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.07, y - size * 0.47 + hover, size * 0.045, size * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soul-fire eyes
  ctx.fillStyle = "#4ade80";
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.47 + hover, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.07, y - size * 0.47 + hover, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Skeletal nose hole
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4 + hover);
  ctx.lineTo(x - size * 0.025, y - size * 0.35 + hover);
  ctx.lineTo(x + size * 0.025, y - size * 0.35 + hover);
  ctx.fill();

  // Grinning teeth
  ctx.fillStyle = "#e8e0d0";
  ctx.fillRect(x - size * 0.08, y - size * 0.33 + hover, size * 0.16, size * 0.04);
  ctx.strokeStyle = "#1e1b4b";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.07 + i * size * 0.028, y - size * 0.33 + hover);
    ctx.lineTo(x - size * 0.07 + i * size * 0.028, y - size * 0.29 + hover);
    ctx.stroke();
  }

  // Ornate hood with soul gems
  ctx.fillStyle = "#050414";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.55 + hover, size * 0.24, size * 0.12, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.55 + hover);
  ctx.quadraticCurveTo(x - size * 0.3, y - size * 0.32 + hover, x - size * 0.22, y - size * 0.15 + hover);
  ctx.lineTo(x - size * 0.18, y - size * 0.35 + hover);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y - size * 0.55 + hover);
  ctx.quadraticCurveTo(x + size * 0.3, y - size * 0.32 + hover, x + size * 0.22, y - size * 0.15 + hover);
  ctx.lineTo(x + size * 0.18, y - size * 0.35 + hover);
  ctx.fill();
  // Soul gem on hood
  ctx.fillStyle = `rgba(74, 222, 128, ${phylacteryGlow})`;
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.62 + hover, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Skull-topped staff with phylactery
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.22 + hover);
  ctx.lineTo(x - size * 0.45, y + size * 0.48);
  ctx.stroke();
  // Bone rings on staff
  ctx.fillStyle = "#a8a29e";
  ctx.fillRect(x - size * 0.465, y - size * 0.1 + hover, size * 0.05, size * 0.04);
  ctx.fillRect(x - size * 0.465, y + size * 0.15, size * 0.05, size * 0.04);
  ctx.fillRect(x - size * 0.465, y + size * 0.35, size * 0.05, size * 0.04);
  // Large staff skull
  ctx.fillStyle = "#e8e0d0";
  ctx.beginPath();
  ctx.arc(x - size * 0.4, y - size * 0.32 + hover, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Skull eyes (glowing intensely)
  ctx.fillStyle = "#4ade80";
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.43, y - size * 0.33 + hover, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x - size * 0.37, y - size * 0.33 + hover, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  // Phylactery crystal above skull
  ctx.fillStyle = `rgba(74, 222, 128, ${phylacteryGlow})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.42 + hover);
  ctx.lineTo(x - size * 0.36, y - size * 0.48 + hover);
  ctx.lineTo(x - size * 0.4, y - size * 0.56 + hover + Math.sin(time * 5) * size * 0.02);
  ctx.lineTo(x - size * 0.44, y - size * 0.48 + hover);
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
  zoom: number,
  attackPhase: number = 0
) {
  // DOOM CHAMPION - Fallen paladin corrupted by void, wielding soul-drinking blade
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const stance = Math.sin(time * 3) * 2.5 * zoom + (isAttacking ? attackIntensity * size * 0.18 : 0);
  const darkPulse = 0.5 + Math.sin(time * 4) * 0.35;
  const capeWave = Math.sin(time * 5) * 0.18;
  const voidGlow = 0.6 + Math.sin(time * 6) * 0.3;
  const soulDrain = 0.5 + Math.sin(time * 3) * 0.4;

  // Void corruption spreading from feet
  for (let corrupt = 0; corrupt < 6; corrupt++) {
    const corruptAngle = corrupt * Math.PI / 3 + time * 0.2;
    ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.48);
    let cx = x, cy = y + size * 0.48;
    for (let seg = 0; seg < 3; seg++) {
      cx += Math.cos(corruptAngle + (Math.random() - 0.5) * 0.5) * size * 0.12;
      cy += size * 0.025;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Dark aura - more intense
  const shadowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  shadowGrad.addColorStop(0, `rgba(24, 24, 27, ${darkPulse * 0.45})`);
  shadowGrad.addColorStop(0.4, `rgba(39, 39, 42, ${darkPulse * 0.3})`);
  shadowGrad.addColorStop(0.7, `rgba(24, 24, 27, ${darkPulse * 0.15})`);
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Void particles orbiting
  for (let particle = 0; particle < 8; particle++) {
    const particleAngle = time * 1.5 + particle * Math.PI / 4;
    const particleDist = size * 0.55 + Math.sin(time * 2 + particle) * size * 0.08;
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y + Math.sin(particleAngle) * particleDist * 0.4;
    ctx.fillStyle = `rgba(139, 92, 246, ${0.4 + Math.sin(time * 4 + particle) * 0.2})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Deeper shadow
  const groundShadow = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.4);
  groundShadow.addColorStop(0, "rgba(0, 0, 0, 0.6)");
  groundShadow.addColorStop(0.5, "rgba(0, 0, 0, 0.35)");
  groundShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = groundShadow;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.4, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tattered cape with void tendrils
  const capeGrad = ctx.createLinearGradient(x - size * 0.4, y, x + size * 0.4, y);
  capeGrad.addColorStop(0, "#0a0a0b");
  capeGrad.addColorStop(0.5, "#18181b");
  capeGrad.addColorStop(1, "#0a0a0b");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.28 + stance);
  ctx.quadraticCurveTo(x - size * 0.45 - capeWave * size, y + size * 0.22, x - size * 0.38, y + size * 0.55);
  for (let i = 0; i < 6; i++) {
    const jagX = x - size * 0.38 + i * size * 0.152;
    const jagY = y + size * 0.55 + (i % 2) * size * 0.08 + Math.sin(time * 5 + i * 1.2) * size * 0.04;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(x + size * 0.45 + capeWave * size, y + size * 0.22, x + size * 0.28, y - size * 0.28 + stance);
  ctx.fill();
  // Void tendrils on cape
  ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let tendril = 0; tendril < 4; tendril++) {
    const tendrilX = x - size * 0.25 + tendril * size * 0.17;
    ctx.beginPath();
    ctx.moveTo(tendrilX, y + size * 0.1);
    ctx.bezierCurveTo(
      tendrilX + Math.sin(time * 2 + tendril) * size * 0.05,
      y + size * 0.25,
      tendrilX - Math.cos(time * 2 + tendril) * size * 0.04,
      y + size * 0.4,
      tendrilX + Math.sin(tendril) * size * 0.06,
      y + size * 0.5
    );
    ctx.stroke();
  }

  // Armored body - more elaborate
  const armorGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  armorGrad.addColorStop(0, "#18181b");
  armorGrad.addColorStop(0.2, "#27272a");
  armorGrad.addColorStop(0.35, "#3f3f46");
  armorGrad.addColorStop(0.5, "#52525b");
  armorGrad.addColorStop(0.65, "#3f3f46");
  armorGrad.addColorStop(0.8, "#27272a");
  armorGrad.addColorStop(1, "#18181b");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.33, y + size * 0.38);
  ctx.lineTo(x - size * 0.38, y - size * 0.18 + stance);
  ctx.quadraticCurveTo(x, y - size * 0.4 + stance, x + size * 0.38, y - size * 0.18 + stance);
  ctx.lineTo(x + size * 0.33, y + size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Armor details and trim
  ctx.strokeStyle = "#0a0a0b";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + stance);
  ctx.lineTo(x, y + size * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.06 + stance);
  ctx.lineTo(x + size * 0.28, y - size * 0.06 + stance);
  ctx.stroke();
  // Void runes on armor
  ctx.strokeStyle = `rgba(139, 92, 246, ${darkPulse * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  // Central rune
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08, size * 0.05, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.02);
  ctx.lineTo(x, y + size * 0.14);
  ctx.moveTo(x - size * 0.04, y + size * 0.08);
  ctx.lineTo(x + size * 0.04, y + size * 0.08);
  ctx.stroke();

  // Massive shoulder pauldrons with spikes
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.35, y - size * 0.18 + stance, size * 0.14, size * 0.1, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.35, y - size * 0.18 + stance, size * 0.14, size * 0.1, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Void gem on left pauldron
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y - size * 0.18 + stance, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Multiple spikes on pauldrons
  ctx.fillStyle = "#1c1917";
  for (let spike = 0; spike < 2; spike++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.38 - spike * size * 0.05, y - size * 0.22 + stance);
    ctx.lineTo(x - size * 0.44 - spike * size * 0.06, y - size * 0.4 - spike * size * 0.05 + stance);
    ctx.lineTo(x - size * 0.34 - spike * size * 0.05, y - size * 0.2 + stance);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.38 + spike * size * 0.05, y - size * 0.22 + stance);
    ctx.lineTo(x + size * 0.44 + spike * size * 0.06, y - size * 0.4 - spike * size * 0.05 + stance);
    ctx.lineTo(x + size * 0.34 + spike * size * 0.05, y - size * 0.2 + stance);
    ctx.fill();
  }

  // Menacing helmet
  const helmGrad = ctx.createLinearGradient(x - size * 0.2, y - size * 0.55, x + size * 0.2, y - size * 0.35);
  helmGrad.addColorStop(0, "#27272a");
  helmGrad.addColorStop(0.5, "#3f3f46");
  helmGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.43 + stance, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Helmet visor
  ctx.fillStyle = "#18181b";
  ctx.fillRect(x - size * 0.16, y - size * 0.5 + stance, size * 0.32, size * 0.14);
  // T-shaped visor slit
  ctx.fillStyle = "#0a0a0b";
  ctx.fillRect(x - size * 0.14, y - size * 0.47 + stance, size * 0.28, size * 0.04);
  ctx.fillRect(x - size * 0.02, y - size * 0.47 + stance, size * 0.04, size * 0.1);
  // Glowing eyes behind visor
  ctx.fillStyle = `rgba(139, 92, 246, ${darkPulse + 0.4})`;
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.44 + stance, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.07, y - size * 0.44 + stance, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Large horns
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.58 + stance);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.7 + stance, x - size * 0.25, y - size * 0.8 + stance);
  ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.7 + stance, x - size * 0.1, y - size * 0.58 + stance);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.58 + stance);
  ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.7 + stance, x + size * 0.25, y - size * 0.8 + stance);
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.7 + stance, x + size * 0.1, y - size * 0.58 + stance);
  ctx.fill();
  // Crown spikes
  ctx.fillStyle = "#27272a";
  for (let crown = 0; crown < 5; crown++) {
    const crownAngle = -Math.PI * 0.4 + crown * Math.PI * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(crownAngle) * size * 0.18, y - size * 0.55 + stance + Math.sin(crownAngle) * size * 0.05);
    ctx.lineTo(x + Math.cos(crownAngle) * size * 0.22, y - size * 0.65 + stance);
    ctx.lineTo(x + Math.cos(crownAngle + 0.1) * size * 0.18, y - size * 0.55 + stance + Math.sin(crownAngle + 0.1) * size * 0.05);
    ctx.fill();
  }

  // Soul-drinking sword
  ctx.save();
  ctx.translate(x + size * 0.4, y + size * 0.02 + stance);
  ctx.rotate(0.35);
  // Blade with void corruption
  const bladeGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.65);
  bladeGrad.addColorStop(0, "#27272a");
  bladeGrad.addColorStop(0.5, "#3f3f46");
  bladeGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.05, -size * 0.55);
  ctx.lineTo(0, -size * 0.68);
  ctx.lineTo(size * 0.05, -size * 0.55);
  ctx.closePath();
  ctx.fill();
  // Void energy flowing on blade
  ctx.strokeStyle = `rgba(139, 92, 246, ${soulDrain})`;
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 8 * zoom;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.bezierCurveTo(
    -size * 0.02, -size * 0.25,
    size * 0.02, -size * 0.4,
    0, -size * 0.58
  );
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Blade runes
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow * 0.6})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.015, 0, Math.PI * 2);
  ctx.arc(0, -size * 0.35, size * 0.015, 0, Math.PI * 2);
  ctx.arc(0, -size * 0.5, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // Ornate crossguard
  ctx.fillStyle = "#52525b";
  ctx.fillRect(-size * 0.1, -size * 0.025, size * 0.2, size * 0.05);
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
  ctx.beginPath();
  ctx.arc(-size * 0.08, 0, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.08, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // Grip
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.025, 0, size * 0.05, size * 0.14);
  // Pommel gem
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(0, size * 0.16, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Shield (left arm) with skull emblem
  const shieldGrad = ctx.createLinearGradient(x - size * 0.55, y, x - size * 0.35, y);
  shieldGrad.addColorStop(0, "#27272a");
  shieldGrad.addColorStop(0.5, "#3f3f46");
  shieldGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.12 + stance);
  ctx.lineTo(x - size * 0.55, y - size * 0.08 + stance);
  ctx.lineTo(x - size * 0.55, y + size * 0.22 + stance);
  ctx.lineTo(x - size * 0.44, y + size * 0.35 + stance);
  ctx.lineTo(x - size * 0.38, y + size * 0.22 + stance);
  ctx.closePath();
  ctx.fill();
  // Shield border
  ctx.strokeStyle = "#52525b";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Skull emblem with glow
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(x - size * 0.465, y + size * 0.08 + stance, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.48, y + size * 0.07 + stance, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x - size * 0.45, y + size * 0.07 + stance, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
