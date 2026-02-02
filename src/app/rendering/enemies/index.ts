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

  // ENHANCED DAMAGE FLASH EFFECT - Better hurt visuals
  const hurtScalePulse = flashIntensity > 0 
    ? 1 - Math.sin(flashIntensity * Math.PI) * 0.08 // Slight shrink when hit
    : 1;
  
  // Apply scale transform for the enemy sprite
  ctx.save();
  ctx.translate(screenPos.x, drawY);
  ctx.scale(attackScalePulse * hurtScalePulse, attackScalePulse * hurtScalePulse);
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

  // ========================================================================
  // ENHANCED DAMAGE/HURT EFFECTS - Soft impact explosion effect
  // ========================================================================
  if (flashIntensity > 0) {
    const hurtPulse = Math.sin(flashIntensity * Math.PI);
    const expandPhase = 1 - flashIntensity; // Expands outward as flash fades
    
    // Soft white impact flash at center (brief, at start of hit)
    if (flashIntensity > 0.7) {
      const whiteFlash = (flashIntensity - 0.7) / 0.3;
      const flashGrad = ctx.createRadialGradient(
        screenPos.x, drawY - size * 0.05, 0,
        screenPos.x, drawY - size * 0.05, size * 0.35 * whiteFlash
      );
      flashGrad.addColorStop(0, `rgba(255, 255, 255, ${whiteFlash * 0.7})`);
      flashGrad.addColorStop(0.4, `rgba(255, 240, 220, ${whiteFlash * 0.4})`);
      flashGrad.addColorStop(1, "rgba(255, 200, 150, 0)");
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, drawY - size * 0.05, size * 0.35 * whiteFlash, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Soft expanding impact ring
    const ringRadius = size * (0.35 + expandPhase * 0.4);
    const ringAlpha = hurtPulse * 0.5;
    ctx.strokeStyle = `rgba(255, 200, 150, ${ringAlpha})`;
    ctx.lineWidth = (2.5 - expandPhase * 1.5) * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, ringRadius, ringRadius * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Soft inner glow (orange/yellow tones)
    const glowGrad = ctx.createRadialGradient(
      screenPos.x, drawY - size * 0.08, 0,
      screenPos.x, drawY, size * 0.45
    );
    glowGrad.addColorStop(0, `rgba(255, 220, 180, ${hurtPulse * 0.35})`);
    glowGrad.addColorStop(0.5, `rgba(255, 180, 120, ${hurtPulse * 0.2})`);
    glowGrad.addColorStop(1, "rgba(255, 150, 100, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.45, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Soft particles drifting outward
    const particleCount = 5;
    for (let i = 0; i < particleCount; i++) {
      const pAngle = (i / particleCount) * Math.PI * 2 + time * 0.5;
      const pDist = size * (0.25 + expandPhase * 0.35);
      const pAlpha = hurtPulse * 0.5 * (1 - expandPhase * 0.5);
      const pSize = size * 0.03 * (1 - expandPhase * 0.4);
      
      // Warm colored particles
      ctx.fillStyle = `rgba(255, ${200 - i * 15}, ${150 - i * 20}, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + Math.cos(pAngle) * pDist,
        drawY + Math.sin(pAngle) * pDist * 0.5 - expandPhase * 8 * zoom,
        pSize,
        0, Math.PI * 2
      );
      ctx.fill();
    }
    
    // Second softer expanding ring (delayed)
    if (flashIntensity < 0.7) {
      const ring2Phase = (0.7 - flashIntensity) / 0.7;
      const ring2Radius = size * (0.4 + ring2Phase * 0.5);
      const ring2Alpha = (1 - ring2Phase) * 0.3;
      ctx.strokeStyle = `rgba(255, 180, 130, ${ring2Alpha})`;
      ctx.lineWidth = (1.5 - ring2Phase) * zoom;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, drawY, ring2Radius, ring2Radius * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ========================================================================
  // ATTACK ANIMATION EFFECTS - Type-specific physical impacts
  // ========================================================================
  if (attackPhase > 0) {
    const attackPulse = Math.sin(attackPhase * Math.PI); // Peaks in middle
    const attackEase = 1 - Math.pow(1 - attackPhase, 2); // Ease out curve
    
    // Determine attack type based on enemy
    const heavyGroundSlam = ["juggernaut", "golem", "swamp_troll", "yeti", "dean", "trustee", "senior", "gradstudent", "ember_guard", "bog_creature", "protestor"].includes(enemy.type);
    const slashAttack = ["shadow_knight", "berserker", "assassin", "hexer", "thornwalker", "athlete", "fire_imp", "snow_goblin"].includes(enemy.type);
    const magicAttack = ["mage", "warlock", "necromancer", "ice_witch", "infernal", "banshee", "specter", "will_o_wisp", "cultist", "plaguebearer"].includes(enemy.type);
    const biteAttack = ["scorpion", "sandworm", "dragon", "wyvern", "scarab", "magma_spawn"].includes(enemy.type);
    
    if (heavyGroundSlam && !isFlying) {
      // === HEAVY GROUND SLAM - Cracks and shockwave ===
      
      // Ground cracks radiating from impact point
      ctx.strokeStyle = `rgba(60, 40, 20, ${attackPulse * 0.8})`;
      ctx.lineWidth = 2 * zoom;
      const crackCount = 6;
      for (let i = 0; i < crackCount; i++) {
        const crackAngle = (i / crackCount) * Math.PI * 2;
        const crackLen = size * (0.5 + attackPulse * 0.6);
        
        ctx.beginPath();
        ctx.moveTo(screenPos.x, drawY + size * 0.45);
        let cx = screenPos.x;
        let cy = drawY + size * 0.45;
        const segments = 3;
        for (let j = 0; j < segments; j++) {
          const jitter = (Math.sin(i * 7 + j * 3) * 0.3);
          cx += Math.cos(crackAngle + jitter) * (crackLen / segments);
          cy += Math.sin(crackAngle + jitter) * (crackLen / segments) * 0.3;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        
        // Branch cracks
        if (attackPulse > 0.4) {
          const branchAngle = crackAngle + (Math.sin(i * 5) > 0 ? 0.5 : -0.5);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(
            cx + Math.cos(branchAngle) * size * 0.15 * attackPulse,
            cy + Math.sin(branchAngle) * size * 0.15 * 0.3 * attackPulse
          );
          ctx.stroke();
        }
      }
      
      // Shockwave ring expanding
      const shockRadius = size * (0.4 + (1 - attackPhase) * 0.8);
      ctx.strokeStyle = `rgba(100, 80, 60, ${attackPhase * 0.5})`;
      ctx.lineWidth = 3 * zoom * attackPhase;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, drawY + size * 0.45, shockRadius, shockRadius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Dust/debris particles
      for (let i = 0; i < 8; i++) {
        const debrisAngle = (i / 8) * Math.PI * 2;
        const debrisDist = size * (0.3 + (1 - attackPhase) * 0.6);
        const debrisY = drawY + size * 0.4 - (1 - attackPhase) * 20 * zoom * Math.abs(Math.sin(i * 2));
        ctx.fillStyle = `rgba(140, 120, 80, ${attackPhase * 0.6})`;
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(debrisAngle) * debrisDist,
          debrisY,
          size * 0.03 * attackPhase,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      
      // Inner impact glow
      const impactGrad = ctx.createRadialGradient(
        screenPos.x, drawY + size * 0.4, 0,
        screenPos.x, drawY + size * 0.4, size * 0.4
      );
      impactGrad.addColorStop(0, `rgba(255, 200, 100, ${attackPulse * 0.4})`);
      impactGrad.addColorStop(0.5, `rgba(200, 150, 80, ${attackPulse * 0.2})`);
      impactGrad.addColorStop(1, "rgba(150, 100, 50, 0)");
      ctx.fillStyle = impactGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, drawY + size * 0.4, size * 0.4, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      
    } else if (slashAttack) {
      // === SLASH ATTACK - Sword/claw swipe arcs ===
      
      const slashAngle = -Math.PI * 0.3 + attackPulse * Math.PI * 0.6;
      const slashRadius = size * 0.7;
      
      // Main slash arc - multiple layers
      for (let layer = 0; layer < 3; layer++) {
        const layerRadius = slashRadius * (1 - layer * 0.1);
        const layerAlpha = attackEase * 0.7 * (1 - layer * 0.25);
        
        // Outer glow
        ctx.strokeStyle = `rgba(255, 255, 255, ${layerAlpha * 0.4})`;
        ctx.lineWidth = (6 - layer * 1.5) * zoom;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(screenPos.x, drawY, layerRadius, slashAngle - 0.5, slashAngle + 0.5);
        ctx.stroke();
        
        // Inner bright line
        ctx.strokeStyle = `rgba(255, 230, 200, ${layerAlpha})`;
        ctx.lineWidth = (3 - layer * 0.5) * zoom;
        ctx.beginPath();
        ctx.arc(screenPos.x, drawY, layerRadius, slashAngle - 0.4, slashAngle + 0.4);
        ctx.stroke();
      }
      
      // Slash trail particles
      for (let i = 0; i < 5; i++) {
        const trailAngle = slashAngle - 0.4 + (i / 4) * 0.8;
        const trailDist = slashRadius * 0.9;
        const trailAlpha = attackPulse * 0.6 * (1 - i * 0.15);
        ctx.fillStyle = `rgba(255, 240, 220, ${trailAlpha})`;
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(trailAngle) * trailDist,
          drawY + Math.sin(trailAngle) * trailDist,
          size * 0.025,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      
      // Blood/impact sparks at end of slash
      if (attackPhase < 0.4) {
        const sparkPhase = attackPhase / 0.4;
        for (let i = 0; i < 4; i++) {
          const sparkAngle = slashAngle + 0.3 + (Math.random() - 0.5) * 0.4;
          const sparkDist = slashRadius * (0.8 + (1 - sparkPhase) * 0.4);
          ctx.fillStyle = `rgba(255, 100, 100, ${sparkPhase * 0.5})`;
          ctx.beginPath();
          ctx.arc(
            screenPos.x + Math.cos(sparkAngle) * sparkDist,
            drawY + Math.sin(sparkAngle) * sparkDist,
            size * 0.02 * sparkPhase,
            0, Math.PI * 2
          );
          ctx.fill();
        }
      }
      
    } else if (magicAttack) {
      // === MAGIC ATTACK - Energy burst and runes ===
      
      // Determine magic color based on enemy type
      let magicColor = "150, 100, 255"; // Purple default
      if (enemy.type === "infernal") magicColor = "255, 100, 50";
      else if (enemy.type === "ice_witch") magicColor = "100, 200, 255";
      else if (enemy.type === "necromancer") magicColor = "100, 255, 150";
      else if (enemy.type === "banshee" || enemy.type === "specter") magicColor = "200, 255, 200";
      
      // Energy burst from hands/body
      const burstRadius = size * (0.3 + attackPulse * 0.4);
      const burstGrad = ctx.createRadialGradient(
        screenPos.x, drawY - size * 0.1, 0,
        screenPos.x, drawY - size * 0.1, burstRadius
      );
      burstGrad.addColorStop(0, `rgba(${magicColor}, ${attackPulse * 0.6})`);
      burstGrad.addColorStop(0.5, `rgba(${magicColor}, ${attackPulse * 0.3})`);
      burstGrad.addColorStop(1, `rgba(${magicColor}, 0)`);
      ctx.fillStyle = burstGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, drawY - size * 0.1, burstRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Magic rune circle
      ctx.strokeStyle = `rgba(${magicColor}, ${attackPulse * 0.5})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, drawY, size * 0.5 * attackPulse, 0, Math.PI * 2);
      ctx.stroke();
      
      // Rune symbols
      const runeCount = 4;
      for (let i = 0; i < runeCount; i++) {
        const runeAngle = (i / runeCount) * Math.PI * 2 + time * 2;
        const runeDist = size * 0.45;
        const runeX = screenPos.x + Math.cos(runeAngle) * runeDist;
        const runeY = drawY + Math.sin(runeAngle) * runeDist * 0.4;
        
        ctx.fillStyle = `rgba(${magicColor}, ${attackPulse * 0.7})`;
        ctx.beginPath();
        // Simple diamond rune shape
        ctx.moveTo(runeX, runeY - size * 0.04);
        ctx.lineTo(runeX + size * 0.025, runeY);
        ctx.lineTo(runeX, runeY + size * 0.04);
        ctx.lineTo(runeX - size * 0.025, runeY);
        ctx.closePath();
        ctx.fill();
      }
      
      // Magic particles spiraling
      for (let i = 0; i < 6; i++) {
        const pAngle = time * 4 + i * Math.PI / 3;
        const pDist = size * (0.2 + i * 0.05) * attackPulse;
        const pAlpha = attackPulse * 0.6;
        ctx.fillStyle = `rgba(${magicColor}, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(pAngle) * pDist,
          drawY - size * 0.1 + Math.sin(pAngle) * pDist * 0.5,
          size * 0.02,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      
    } else if (biteAttack) {
      // === BITE/SNAP ATTACK - Chomping jaws effect ===
      
      const biteOpen = attackPhase > 0.5 ? (attackPhase - 0.5) * 2 : 1 - attackPhase * 2;
      
      // Upper jaw arc
      ctx.strokeStyle = `rgba(255, 80, 80, ${attackEase * 0.7})`;
      ctx.lineWidth = 3 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(screenPos.x, drawY - size * 0.1, size * 0.35, 
        Math.PI * (0.2 + biteOpen * 0.3), Math.PI * (0.8 - biteOpen * 0.3));
      ctx.stroke();
      
      // Lower jaw arc
      ctx.beginPath();
      ctx.arc(screenPos.x, drawY + size * 0.1, size * 0.35, 
        -Math.PI * (0.2 + biteOpen * 0.3), -Math.PI * (0.8 - biteOpen * 0.3));
      ctx.stroke();
      
      // Teeth marks at impact
      if (attackPhase < 0.3) {
        const teethAlpha = attackPhase / 0.3;
        ctx.strokeStyle = `rgba(255, 255, 255, ${teethAlpha * 0.6})`;
        ctx.lineWidth = 2 * zoom;
        for (let i = 0; i < 5; i++) {
          const toothX = screenPos.x - size * 0.2 + i * size * 0.1;
          ctx.beginPath();
          ctx.moveTo(toothX, drawY - size * 0.05);
          ctx.lineTo(toothX, drawY + size * 0.05);
          ctx.stroke();
        }
      }
      
      // Saliva/venom droplets
      for (let i = 0; i < 3; i++) {
        const dropY = drawY + size * 0.2 + (1 - attackPhase) * size * 0.3 * (i + 1) * 0.3;
        const dropAlpha = attackPhase * 0.5;
        ctx.fillStyle = enemy.type === "scorpion" 
          ? `rgba(100, 255, 100, ${dropAlpha})` 
          : `rgba(200, 200, 255, ${dropAlpha})`;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x + (i - 1) * size * 0.1, 
          dropY, 
          size * 0.015, 
          size * 0.025, 
          0, 0, Math.PI * 2
        );
        ctx.fill();
      }
      
    } else {
      // === DEFAULT MELEE ATTACK - Slashing strike with motion lines ===
      
      // Calculate slash arc that sweeps across
      const slashProgress = 1 - attackPhase; // 0 to 1 as attack progresses
      const slashStartAngle = -Math.PI * 0.7; // Start angle (upper left)
      const slashEndAngle = Math.PI * 0.2; // End angle (lower right)
      const currentSlashAngle = slashStartAngle + (slashEndAngle - slashStartAngle) * slashProgress;
      const slashRadius = size * 0.65;
      
      // Main slash arc - bright white/yellow trail
      const slashArcStart = currentSlashAngle - 0.8;
      const slashArcEnd = currentSlashAngle;
      
      // Outer glow of slash
      ctx.strokeStyle = `rgba(255, 255, 255, ${attackEase * 0.3})`;
      ctx.lineWidth = 8 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(screenPos.x, drawY, slashRadius, slashArcStart, slashArcEnd);
      ctx.stroke();
      
      // Middle layer - warm color
      ctx.strokeStyle = `rgba(255, 230, 180, ${attackEase * 0.6})`;
      ctx.lineWidth = 5 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, drawY, slashRadius, slashArcStart + 0.1, slashArcEnd);
      ctx.stroke();
      
      // Inner bright line
      ctx.strokeStyle = `rgba(255, 255, 240, ${attackEase * 0.9})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, drawY, slashRadius, slashArcStart + 0.2, slashArcEnd);
      ctx.stroke();
      
      // Motion lines trailing behind the slash
      const lineCount = 4;
      for (let i = 0; i < lineCount; i++) {
        const lineOffset = (i + 1) * 0.15;
        const lineAngle = currentSlashAngle - lineOffset;
        const lineAlpha = attackEase * 0.5 * (1 - i * 0.2);
        const lineLen = size * (0.3 - i * 0.05);
        
        // Calculate line start and end points
        const innerRadius = slashRadius - lineLen * 0.5;
        const outerRadius = slashRadius + lineLen * 0.5;
        
        ctx.strokeStyle = `rgba(255, 240, 200, ${lineAlpha})`;
        ctx.lineWidth = (2 - i * 0.3) * zoom;
        ctx.beginPath();
        ctx.moveTo(
          screenPos.x + Math.cos(lineAngle) * innerRadius,
          drawY + Math.sin(lineAngle) * innerRadius
        );
        ctx.lineTo(
          screenPos.x + Math.cos(lineAngle) * outerRadius,
          drawY + Math.sin(lineAngle) * outerRadius
        );
        ctx.stroke();
      }
      
      // Slash tip sparkle
      const tipX = screenPos.x + Math.cos(currentSlashAngle) * slashRadius;
      const tipY = drawY + Math.sin(currentSlashAngle) * slashRadius;
      
      // Bright tip glow
      const tipGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, size * 0.15);
      tipGrad.addColorStop(0, `rgba(255, 255, 255, ${attackEase * 0.8})`);
      tipGrad.addColorStop(0.5, `rgba(255, 230, 180, ${attackEase * 0.4})`);
      tipGrad.addColorStop(1, "rgba(255, 200, 150, 0)");
      ctx.fillStyle = tipGrad;
      ctx.beginPath();
      ctx.arc(tipX, tipY, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      
      // Small sparks at impact point (near end of slash)
      if (attackPhase < 0.3) {
        const sparkPhase = (0.3 - attackPhase) / 0.3;
        for (let i = 0; i < 4; i++) {
          const sparkAngle = currentSlashAngle + (i - 1.5) * 0.3;
          const sparkDist = slashRadius + sparkPhase * size * 0.2;
          const sparkAlpha = (1 - sparkPhase) * 0.6;
          
          ctx.fillStyle = `rgba(255, ${220 - i * 20}, ${150 - i * 30}, ${sparkAlpha})`;
          ctx.beginPath();
          ctx.arc(
            screenPos.x + Math.cos(sparkAngle) * sparkDist,
            drawY + Math.sin(sparkAngle) * sparkDist,
            size * 0.025 * (1 - sparkPhase * 0.5),
            0, Math.PI * 2
          );
          ctx.fill();
        }
      }
      
      // Subtle wind/motion effect behind the slash
      if (attackPulse > 0.3) {
        const windAlpha = (attackPulse - 0.3) * 0.25;
        ctx.strokeStyle = `rgba(200, 220, 255, ${windAlpha})`;
        ctx.lineWidth = 1 * zoom;
        for (let i = 0; i < 3; i++) {
          const windAngle = currentSlashAngle - 0.5 - i * 0.2;
          const windInner = slashRadius * (0.7 - i * 0.1);
          const windOuter = slashRadius * (1.1 + i * 0.1);
          ctx.beginPath();
          ctx.moveTo(
            screenPos.x + Math.cos(windAngle) * windInner,
            drawY + Math.sin(windAngle) * windInner
          );
          ctx.quadraticCurveTo(
            screenPos.x + Math.cos(windAngle + 0.1) * slashRadius,
            drawY + Math.sin(windAngle + 0.1) * slashRadius,
            screenPos.x + Math.cos(windAngle) * windOuter,
            drawY + Math.sin(windAngle) * windOuter
          );
          ctx.stroke();
        }
      }
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

  // HP Bar with Armor Display
  // Armor is shown as a white portion on the RIGHT side of the healthbar
  // It depletes first as health drops - once health falls below (1-armor), armor is gone
  if (enemy.hp < enemy.maxHp || eData.armor > 0) {
    const barWidth = size * 1.4;
    const barHeight = 6 * zoom;
    const barY = drawY - size * 0.95;
    const barX = screenPos.x - barWidth / 2;
    const cornerRadius = 3 * zoom;
    const armor = eData.armor || 0;

    // Background with rounded corners (removed shadowBlur for performance)
    ctx.fillStyle = "rgba(10, 10, 15, 0.98)";
    ctx.beginPath();
    ctx.roundRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, cornerRadius + 1);
    ctx.fill();
    
    ctx.fillStyle = "rgba(15, 15, 20, 0.95)";
    ctx.beginPath();
    ctx.roundRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, cornerRadius);
    ctx.fill();

    // Inner background
    ctx.fillStyle = "#1f1f23";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, cornerRadius - 1);
    ctx.fill();

    const hpPercent = enemy.hp / enemy.maxHp;
    
    // Armor takes up the rightmost portion of max health
    // healthThreshold is where armor ends and pure health begins
    const healthThreshold = 1 - armor; // e.g., 0.7 if armor is 0.3
    
    // Calculate how much red health to show (capped at healthThreshold of bar)
    const redHealthPercent = Math.min(hpPercent, healthThreshold);
    const redWidth = barWidth * redHealthPercent;
    
    // Calculate how much white armor to show (only if health > healthThreshold)
    const armorPercent = Math.max(0, hpPercent - healthThreshold);
    const whiteWidth = barWidth * armorPercent;

    // Red health portion (left side)
    if (redWidth > 0) {
      const hpGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
      if (hpPercent > 0.5) {
        hpGradient.addColorStop(0, "#f87171"); // Light red
        hpGradient.addColorStop(0.5, "#ef4444"); // Red
        hpGradient.addColorStop(1, "#dc2626"); // Dark red
      } else if (hpPercent > 0.25) {
        hpGradient.addColorStop(0, "#f87171");
        hpGradient.addColorStop(0.5, "#dc2626");
        hpGradient.addColorStop(1, "#b91c1c");
      } else {
        hpGradient.addColorStop(0, "#dc2626");
        hpGradient.addColorStop(0.5, "#b91c1c");
        hpGradient.addColorStop(1, "#991b1b");
      }
      ctx.fillStyle = hpGradient;
      ctx.beginPath();
      const leftRadius = cornerRadius - 1;
      const rightRadius = whiteWidth > 0 ? 0 : (hpPercent > 0.95 ? cornerRadius - 1 : 0);
      ctx.roundRect(barX, barY, redWidth, barHeight, [leftRadius, rightRadius, rightRadius, leftRadius]);
      ctx.fill();

      // Shine highlight on red health
      const shineGrad = ctx.createLinearGradient(barX, barY, barX, barY + barHeight * 0.4);
      shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = shineGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, redWidth, barHeight * 0.4, [leftRadius, 0, 0, 0]);
      ctx.fill();
    }

    // White armor portion (right side) - only shows when health > healthThreshold
    if (whiteWidth > 0) {
      const armorStartX = barX + redWidth;
      const armorGrad = ctx.createLinearGradient(armorStartX, barY, armorStartX, barY + barHeight);
      armorGrad.addColorStop(0, "#f5f5f4"); // Light silver
      armorGrad.addColorStop(0.3, "#e7e5e4");
      armorGrad.addColorStop(0.5, "#d6d3d1"); // Silver
      armorGrad.addColorStop(0.7, "#a8a29e");
      armorGrad.addColorStop(1, "#78716c"); // Dark silver
      ctx.fillStyle = armorGrad;
      ctx.beginPath();
      const rightRadius = hpPercent > 0.95 ? cornerRadius - 1 : 0;
      ctx.roundRect(armorStartX, barY, whiteWidth, barHeight, [0, rightRadius, rightRadius, 0]);
      ctx.fill();
      
      // Metallic shine on armor
      const armorShine = ctx.createLinearGradient(armorStartX, barY, armorStartX, barY + barHeight * 0.4);
      armorShine.addColorStop(0, "rgba(255, 255, 255, 0.6)");
      armorShine.addColorStop(1, "rgba(255, 255, 255, 0.1)");
      ctx.fillStyle = armorShine;
      ctx.beginPath();
      ctx.roundRect(armorStartX, barY, whiteWidth, barHeight * 0.4, [0, rightRadius, 0, 0]);
      ctx.fill();

      // Subtle divider line between health and armor
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(armorStartX, barY);
      ctx.lineTo(armorStartX, barY + barHeight);
      ctx.stroke();
    }

    // Outer border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, cornerRadius);
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================================================
// ENEMY INSPECT MODE INDICATOR
// ============================================================================

export function renderEnemyInspectIndicator(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  selectedMap: string,
  isSelected: boolean,
  isHovered: boolean,
  cameraOffset?: Position,
  cameraZoom?: number
) {
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
  
  const size = eData.size * zoom;
  const isFlying = eData.flying;
  const floatOffset = isFlying ? Math.sin(time * 3) * 10 * zoom : 0;
  const bobOffset = Math.sin(time * 5 + enemy.pathIndex) * 2 * zoom;
  const drawY = screenPos.y - size / 2 - floatOffset - bobOffset - (isFlying ? 35 * zoom : 0);

  ctx.save();

  // Pulsing animation
  const pulsePhase = (Math.sin(time * 4) + 1) / 2; // 0 to 1
  const baseRadius = size * 0.9;
  const pulseRadius = baseRadius + pulsePhase * 6 * zoom;
  
  // Ground circle position (below enemy)
  const groundY = screenPos.y + 8 * zoom;
  
  // Magnifying glass position (above enemy)
  const iconY = drawY - size * 0.7;
  const iconSize = 14 * zoom;
  
  // Determine colors based on state
  const isYellow = isHovered && !isSelected;
  const primaryColor = isYellow ? "rgba(251, 191, 36, 0.9)" : "rgba(168, 85, 247, 0.7)";
  const secondaryColor = isYellow ? "rgba(254, 240, 138, 0.8)" : "rgba(192, 132, 252, 0.6)";
  const iconBgColor = isYellow ? "rgba(251, 191, 36, 1)" : "rgba(139, 92, 246, 0.9)";
  const iconStrokeColor = isYellow ? "#1c1917" : "white";
  
  // ========== SELECT CIRCLE BELOW ENEMY ==========
  // Outer pulsing ring
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = (3 + pulsePhase * 1.5) * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, groundY, pulseRadius, pulseRadius * 0.45, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner circle
  ctx.strokeStyle = secondaryColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, groundY, baseRadius * 0.7, baseRadius * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Center dot
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(screenPos.x, groundY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();
  
  // ========== MAGNIFYING GLASS ABOVE ENEMY (Lucide Search style) ==========
  // Icon background circle with glow
  if (isYellow) {
    // Yellow glow for hover
    const glowGrad = ctx.createRadialGradient(screenPos.x, iconY, 0, screenPos.x, iconY, iconSize * 1.5);
    glowGrad.addColorStop(0, "rgba(251, 191, 36, 0.5)");
    glowGrad.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, iconY, iconSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Icon background
  ctx.fillStyle = iconBgColor;
  ctx.beginPath();
  ctx.arc(screenPos.x, iconY, iconSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Icon border
  ctx.strokeStyle = isYellow ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, iconY, iconSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Lucide Search icon - scaled to fit within the background circle
  // Lucide uses a 24x24 viewbox with circle at (11,11) r=8 and line from (21,21) to (16.65,16.65)
  // Scale factor to fit within iconSize
  const scale = (iconSize * 0.75) / 12; // Scale so the icon fits nicely
  const offsetX = screenPos.x - iconSize * 0.15; // Center the lens part
  const offsetY = iconY - iconSize * 0.15;
  
  ctx.strokeStyle = iconStrokeColor;
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  // Magnifying glass lens (circle) - Lucide: cx=11, cy=11, r=8
  const lensRadius = 8 * scale;
  ctx.beginPath();
  ctx.arc(offsetX, offsetY, lensRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Magnifying glass handle (line) - Lucide: from (16.65, 16.65) to (21, 21)
  // The handle starts at ~45 degrees from lens edge
  const handleStartX = offsetX + lensRadius * Math.cos(Math.PI / 4);
  const handleStartY = offsetY + lensRadius * Math.sin(Math.PI / 4);
  const handleLength = 5 * scale;
  const handleEndX = handleStartX + handleLength * Math.cos(Math.PI / 4);
  const handleEndY = handleStartY + handleLength * Math.sin(Math.PI / 4);
  
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(handleStartX, handleStartY);
  ctx.lineTo(handleEndX, handleEndY);
  ctx.stroke();
  
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  
  // ========== SELECTED STATE EXTRAS ==========
  if (isSelected) {
    // Bright selection border around enemy
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 3 * zoom;
    ctx.setLineDash([6 * zoom, 4 * zoom]);
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 1.2, size * 0.75, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Selection glow
    const selGlow = ctx.createRadialGradient(
      screenPos.x, drawY, size * 0.3,
      screenPos.x, drawY, size * 1.5
    );
    selGlow.addColorStop(0, "rgba(168, 85, 247, 0.4)");
    selGlow.addColorStop(0.6, "rgba(168, 85, 247, 0.15)");
    selGlow.addColorStop(1, "rgba(168, 85, 247, 0)");
    ctx.fillStyle = selGlow;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 1.5, size, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // "INSPECTING" text
    ctx.font = `bold ${9 * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(192, 132, 252, 0.95)";
    ctx.fillText("INSPECTING", screenPos.x, groundY + baseRadius * 0.5 + 12 * zoom);
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
    // ========== NEW ENEMY TYPES ==========
    case "cultist":
      drawCultistEnemy(
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
    case "plaguebearer":
      drawPlaguebearerEnemy(
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
    case "thornwalker":
      drawThornwalkerEnemy(
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
    case "sandworm":
      drawSandwormEnemy(
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
    case "frostling":
      drawFrostlingEnemy(
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
    case "infernal":
      drawInfernalEnemy(
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
    case "banshee":
      drawBansheeEnemy(
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
    case "juggernaut":
      drawJuggernautEnemy(
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
    case "assassin":
      drawAssassinEnemy(
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
    case "dragon":
      drawDragonEnemy(
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
    // Forest Region Troops
    case "athlete":
      drawAthleteEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "protestor":
      drawProtestorEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    // Swamp Region Troops
    case "bog_creature":
      drawBogCreatureEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "will_o_wisp":
      drawWillOWispEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "swamp_troll":
      drawSwampTrollEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    // Desert Region Troops
    case "nomad":
      drawNomadEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "scorpion":
      drawScorpionEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "scarab":
      drawScarabEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    // Winter Region Troops
    case "snow_goblin":
      drawSnowGoblinEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "yeti":
      drawYetiEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "ice_witch":
      drawIceWitchEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    // Volcanic Region Troops
    case "magma_spawn":
      drawMagmaSpawnEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "fire_imp":
      drawFireImpEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "ember_guard":
      drawEmberGuardEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
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
    // Particle core (optimized - no shadowBlur)
    ctx.fillStyle = `rgba(120, 255, 160, ${0.6 + Math.sin(time * 5 + i) * 0.3})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02 + Math.sin(time * 6 + i) * size * 0.008, 0, Math.PI * 2);
    ctx.fill();
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
  // Runes (optimized - no shadowBlur)
  ctx.fillStyle = `rgba(120, 255, 160, ${runeGlow})`;
  ctx.font = `${size * 0.07}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ᛟᚨᛏ", 0, -size * 0.02);
  ctx.fillText("ᚷᛁᚱ", 0, size * 0.06);
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

  // Possessed glowing eyes with void pupils (optimized - no shadowBlur)
  // Outer glow layer
  ctx.fillStyle = "rgba(74, 222, 128, 0.3)";
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.42 + bobble, size * 0.07, 0, Math.PI * 2);
  ctx.arc(x + size * 0.07, y - size * 0.42 + bobble, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Core
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.42 + bobble, size * 0.045, 0, Math.PI * 2);
  ctx.arc(x + size * 0.07, y - size * 0.42 + bobble, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
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
    // Energy orb (optimized - no shadowBlur)
    ctx.fillStyle = `rgba(74, 222, 128, ${pulseIntensity * 0.4})`;
    ctx.beginPath();
    ctx.arc(handX, handY, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(120, 255, 160, ${pulseIntensity * 0.9})`;
    ctx.beginPath();
    ctx.arc(handX, handY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
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

  // Floating arcane symbols (optimized - no shadowBlur)
  for (let i = 0; i < 6; i++) {
    const symbolAngle = time * 1.5 + i * Math.PI * 0.33;
    const symbolDist = size * 0.5 + Math.sin(time * 2 + i) * size * 0.05;
    const sx = x + Math.cos(symbolAngle) * symbolDist;
    const sy = y - size * 0.1 + Math.sin(symbolAngle) * symbolDist * 0.35;
    ctx.fillStyle = `rgba(180, 215, 255, ${0.6 + Math.sin(time * 4 + i) * 0.3})`;
    ctx.font = `${size * 0.1}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["⚡", "◇", "△", "☆", "◈", "⍟"][i], sx, sy);
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
  // Gem on trim (optimized - no shadowBlur)
  ctx.fillStyle = "#93c5fd";
  ctx.beginPath();
  ctx.arc(x - size * 0.155, y + size * 0.1, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.155, y + size * 0.1, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

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
  // Electric blue magical pupils (optimized - no shadowBlur)
  ctx.fillStyle = "#60a5fa";
  ctx.beginPath();
  ctx.arc(x - size * 0.085, y - size * 0.46 + swagger * 0.15, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.085, y - size * 0.46 + swagger * 0.15, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
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
  // Magic orb (optimized - layered glow instead of shadowBlur)
  ctx.fillStyle = `rgba(59, 130, 246, ${magicPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.42, y + swagger * 0.1, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(96, 165, 250, ${magicPulse * 0.9})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.42, y + swagger * 0.1, size * 0.13, 0, Math.PI * 2);
  ctx.fill();
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

  // Secondary spell forming in other hand (optimized - no shadowBlur)
  ctx.fillStyle = `rgba(200, 220, 255, ${stormIntensity * 0.7})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y + size * 0.1 + swagger * 0.05, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
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
    // Glowing forbidden runes (optimized - no shadowBlur)
    ctx.fillStyle = `rgba(220, 180, 255, ${madnessPulse})`;
    ctx.font = `${size * 0.055}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["◈", "⍟", "⌬", "☆", "◇"][i], 0, size * 0.015);
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

  // Ancient symbols burning into robe (optimized - no shadowBlur)
  ctx.fillStyle = `rgba(220, 180, 255, ${madnessPulse * 0.8})`;
  ctx.font = `${size * 0.09}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⍟", x, y + size * 0.08);
  ctx.fillText("⌘", x - size * 0.18, y + size * 0.28);
  ctx.fillText("⌬", x + size * 0.18, y + size * 0.22);
  ctx.fillText("◈", x, y + size * 0.38);

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
  // Purple irises with swirling knowledge (optimized - no shadowBlur)
  ctx.fillStyle = "#a855f7";
  ctx.beginPath();
  ctx.arc(x - size * 0.1 + eyeSpasm, y - size * 0.46 + twitch * 0.2, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1 - eyeSpasm, y - size * 0.46 + twitch * 0.2, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
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
  // Dimensional residue (optimized - no shadowBlur)
  ctx.fillStyle = `rgba(255, 180, 100, ${insanityPulse * 0.6})`;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.2, y + size * 0.28, size * 0.045, size * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();

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
  // Orange dimensional-touched pupils (optimized - no shadowBlur)
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(-size * 0.09 + eyeTwitch, -size * 0.02, size * 0.028, 0, Math.PI * 2);
  ctx.arc(size * 0.09 + eyeTwitch, -size * 0.02, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
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

  // Glowing red eyes behind spectacles (optimized - no shadowBlur)
  ctx.fillStyle = "#f87171";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.5 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.5 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

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
  ctx.fillStyle = `rgba(255, 100, 100, ${powerPulse})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
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
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.05);
    ctx.lineTo(size * 0.025, 0);
    ctx.lineTo(0, size * 0.05);
    ctx.lineTo(-size * 0.025, 0);
    ctx.fill();
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
  // Gem accents on trim (optimized - no shadowBlur)
  ctx.fillStyle = "#c084fc";
  for (let g = 0; g < 3; g++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.225, y + size * 0.05 + g * size * 0.15, size * 0.02, 0, Math.PI * 2);
    ctx.arc(x + size * 0.225, y + size * 0.05 + g * size * 0.15, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

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
  // Central void gem (optimized - layered glow)
  ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32 + hover * 0.15);
  ctx.lineTo(x + size * 0.09, y - size * 0.18 + hover * 0.15);
  ctx.lineTo(x, y - size * 0.06 + hover * 0.15);
  ctx.lineTo(x - size * 0.09, y - size * 0.18 + hover * 0.15);
  ctx.fill();
  ctx.fillStyle = "#c084fc";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + hover * 0.15);
  ctx.lineTo(x + size * 0.07, y - size * 0.18 + hover * 0.15);
  ctx.lineTo(x, y - size * 0.08 + hover * 0.15);
  ctx.lineTo(x - size * 0.07, y - size * 0.18 + hover * 0.15);
  ctx.fill();
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
  ctx.fillStyle = "#c084fc";
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.57 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, y - size * 0.57 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
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
  // Central power gem (optimized - no shadowBlur)
  ctx.fillStyle = "#c084fc";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
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
  // Massive void power orb (optimized - layered glow)
  ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
  ctx.beginPath();
  ctx.arc(0, -size * 0.62, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c084fc";
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

  // Spectral fire particles (optimized - no shadowBlur in loop)
  for (let i = 0; i < 12; i++) {
    const particlePhase = (time * 2.5 + i * 0.25) % 1.5;
    const px = x + Math.sin(time * 3.5 + i * 1.0) * size * 0.45;
    const py = y + size * 0.25 - particlePhase * size * 0.6;
    ctx.fillStyle = `rgba(100, 230, 255, ${(1 - particlePhase / 1.5) * 0.8})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.035 * (1 - particlePhase / 2), 0, Math.PI * 2);
    ctx.fill();
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
  // Tail flames (optimized - no shadowBlur in loop)
  for (let i = 0; i < 4; i++) {
    const flameY = Math.sin(time * 8 + i * 1.2) * size * 0.06;
    ctx.fillStyle = `rgba(150, 240, 255, ${0.8 - i * 0.12})`;
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

  // Crown crest feathers (optimized - no shadowBlur)
  ctx.fillStyle = "#67e8f9";
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

  // Fierce glowing eyes (optimized - no shadowBlur)
  ctx.fillStyle = "#fef9c3";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.42 + swoop, size * 0.072, size * 0.055, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.42 + swoop, size * 0.072, size * 0.055, 0.15, 0, Math.PI * 2);
  ctx.fill();
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
    // Golden talons (optimized - no shadowBlur)
    ctx.fillStyle = "#fcd34d";
    for (let t = 0; t < 3; t++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.045 + t * size * 0.045, 0);
      ctx.lineTo(-size * 0.055 + t * size * 0.055, size * 0.14);
      ctx.lineTo(-size * 0.02 + t * size * 0.045, 0);
      ctx.fill();
    }
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

  // Small floating orb in hand (optimized - no shadowBlur)
  ctx.fillStyle = `rgba(140, 140, 255, ${voidPulse})`;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.22,
    y + size * 0.05 + bob * 0.5,
    size * 0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();
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
      // Ancient gold coin with skull (optimized - no shadowBlur)
      ctx.fillStyle = "#ffe066";
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
    } else if (i % 4 === 1) {
      // Ruby gem (optimized - no shadowBlur)
      ctx.fillStyle = "#ef4444";
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
    } else if (i % 4 === 2) {
      // Emerald (optimized - no shadowBlur)
      ctx.fillStyle = "#10b981";
      ctx.fillRect(-size * 0.028, -size * 0.04, size * 0.056, size * 0.08);
      ctx.fillStyle = "#6ee7b7";
      ctx.fillRect(-size * 0.015, -size * 0.028, size * 0.015, size * 0.022);
    } else {
      // Sapphire (optimized - no shadowBlur)
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.04);
      ctx.lineTo(size * 0.03, -size * 0.01);
      ctx.lineTo(size * 0.02, size * 0.03);
      ctx.lineTo(-size * 0.02, size * 0.03);
      ctx.lineTo(-size * 0.03, -size * 0.01);
      ctx.fill();
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
  // Central diamond (optimized - no shadowBlur)
  ctx.fillStyle = "#f0f9ff";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32 + float);
  ctx.lineTo(x + size * 0.08, y - size * 0.22 + float);
  ctx.lineTo(x, y - size * 0.1 + float);
  ctx.lineTo(x - size * 0.08, y - size * 0.22 + float);
  ctx.fill();
  // Diamond inner gleam
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(x - size * 0.02, y - size * 0.24 + float, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  // Side rubies (optimized - no shadowBlur)
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x - size * 0.14, y - size * 0.26 + float, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.14, y - size * 0.26 + float, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

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
  // Eye gleam (greed - optimized no shadowBlur)
  ctx.fillStyle = `rgba(255, 220, 100, ${goldPulse})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.52 + float, size * 0.014, 0, Math.PI * 2);
  ctx.arc(x + size * 0.11, y - size * 0.52 + float, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

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
  // PHANTOM DEADEYE - Optimized version (removed expensive shadowBlur operations)
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const stance = Math.sin(time * 2.5) * 2.5 * zoom + (isAttacking ? attackIntensity * size * 0.12 : 0);
  const drawPull = 0.35 + Math.sin(time * 1.8) * 0.3;
  const shadowPulse = 0.6 + Math.sin(time * 4) * 0.4;

  // Simple shadow beneath
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.32, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Enchanted quiver with arrows (simplified - no shadowBlur)
  ctx.save();
  ctx.translate(x + size * 0.28, y - size * 0.06 + stance * 0.3);
  ctx.rotate(0.28);
  // Quiver body
  ctx.fillStyle = "#292524";
  ctx.fillRect(-size * 0.08, -size * 0.4, size * 0.16, size * 0.5);
  // Leather straps
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.38);
  ctx.lineTo(-size * 0.06, size * 0.08);
  ctx.moveTo(size * 0.06, -size * 0.38);
  ctx.lineTo(size * 0.06, size * 0.08);
  ctx.stroke();
  // Soul arrows (simplified - 3 arrows instead of 6, no shadowBlur)
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    ctx.moveTo(-size * 0.03 + i * size * 0.03, -size * 0.38);
    ctx.lineTo(-size * 0.03 + i * size * 0.03, -size * 0.58);
  }
  ctx.stroke();
  // Arrowheads (no shadowBlur)
  ctx.fillStyle = "#34d399";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.03 + i * size * 0.03, -size * 0.58);
    ctx.lineTo(-size * 0.045 + i * size * 0.03, -size * 0.64);
    ctx.lineTo(-size * 0.015 + i * size * 0.03, -size * 0.64);
    ctx.fill();
  }
  ctx.restore();

  // Flowing phantom cloak (simplified gradient)
  const cloakGrad = ctx.createLinearGradient(x - size * 0.4, y, x + size * 0.4, y);
  cloakGrad.addColorStop(0, "#022c22");
  cloakGrad.addColorStop(0.5, "#059669");
  cloakGrad.addColorStop(1, "#022c22");
  ctx.fillStyle = cloakGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.55);
  // Simplified tattered edge (fewer iterations)
  ctx.lineTo(x - size * 0.28, y + size * 0.58);
  ctx.lineTo(x - size * 0.14, y + size * 0.53);
  ctx.lineTo(x, y + size * 0.56);
  ctx.lineTo(x + size * 0.14, y + size * 0.52);
  ctx.lineTo(x + size * 0.28, y + size * 0.57);
  ctx.lineTo(x + size * 0.42, y + size * 0.55);
  ctx.quadraticCurveTo(x + size * 0.48, y - size * 0.15 + stance, x, y - size * 0.56 + stance);
  ctx.quadraticCurveTo(x - size * 0.48, y - size * 0.15 + stance, x - size * 0.42, y + size * 0.55);
  ctx.fill();

  // Cloak accent lines (simplified - 2 lines instead of 4 beziers)
  ctx.strokeStyle = `rgba(52, 211, 153, ${shadowPulse * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y + size * 0.1);
  ctx.lineTo(x - size * 0.05, y + size * 0.35);
  ctx.moveTo(x + size * 0.1, y + size * 0.12);
  ctx.lineTo(x + size * 0.05, y + size * 0.35);
  ctx.stroke();

  // Spectral leather armor (simplified gradient)
  ctx.fillStyle = "#78350f";
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
  ctx.moveTo(x - size * 0.15, y + size * 0.05);
  ctx.lineTo(x + size * 0.15, y + size * 0.05);
  ctx.stroke();

  // Spectral elven face (simplified - no gradient)
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + stance, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Pointed elven ears
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

  // Glowing death-green eyes (keep ONE shadowBlur for the signature glow)
  ctx.fillStyle = "#10b981";
  ctx.shadowColor = "#10b981";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + stance, size * 0.035, size * 0.028, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + stance, size * 0.035, size * 0.028, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Pupil slits
  ctx.fillStyle = "#022c22";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + stance, size * 0.01, size * 0.022, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + stance, size * 0.01, size * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hood shadow
  ctx.fillStyle = "rgba(2, 44, 34, 0.7)";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.56 + stance, size * 0.2, 0, Math.PI, true);
  ctx.fill();
  // Hood edge
  ctx.strokeStyle = "#064e3b";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.56 + stance, size * 0.2, 0.1, Math.PI - 0.1, true);
  ctx.stroke();

  // Spectral bow (simplified - no shadowBlur on bow)
  ctx.save();
  ctx.translate(x - size * 0.38, y + stance);
  // Bow body
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.46, -Math.PI * 0.48, Math.PI * 0.48);
  ctx.stroke();
  // Bow highlights
  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.44, -Math.PI * 0.35, Math.PI * 0.35);
  ctx.stroke();
  ctx.restore();

  // Soul-string
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

  // Nocked arrow (simplified)
  ctx.save();
  ctx.translate(pullX, y + stance);
  ctx.rotate(Math.PI);
  // Arrow shaft
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.45, 0);
  ctx.stroke();
  // Arrowhead (no shadowBlur)
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.moveTo(size * 0.45, 0);
  ctx.lineTo(size * 0.52, -size * 0.04);
  ctx.lineTo(size * 0.58, 0);
  ctx.lineTo(size * 0.52, size * 0.04);
  ctx.fill();
  // Arrow fletching
  ctx.fillStyle = `rgba(16, 185, 129, ${shadowPulse})`;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.06, -size * 0.04);
  ctx.lineTo(-size * 0.02, 0);
  ctx.lineTo(-size * 0.06, size * 0.04);
  ctx.closePath();
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

// ============================================================================
// NEW ENEMY SPRITES
// ============================================================================

function drawCultistEnemy(
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
  // FINALS WEEK CULTIST - Hooded figure with glowing runes and forbidden coffee
  const isAttacking = attackPhase > 0;
  const sway = Math.sin(time * 3) * 2 * zoom;
  const chant = Math.sin(time * 8) * 0.3;
  const runeGlow = 0.5 + Math.sin(time * 4) * 0.3 + (isAttacking ? attackPhase * 0.4 : 0);

  // Dark aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  auraGrad.addColorStop(0, `rgba(124, 45, 18, ${runeGlow * 0.3})`);
  auraGrad.addColorStop(0.5, `rgba(80, 20, 10, ${runeGlow * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tattered robes
  const robeGrad = ctx.createLinearGradient(x - size * 0.3, y, x + size * 0.3, y);
  robeGrad.addColorStop(0, "#2a1810");
  robeGrad.addColorStop(0.5, bodyColor);
  robeGrad.addColorStop(1, "#2a1810");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.45);
  ctx.lineTo(x - size * 0.35 + sway * 0.5, y + size * 0.4);
  ctx.quadraticCurveTo(x, y + size * 0.5 + chant * 2, x + size * 0.35 - sway * 0.5, y + size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Ragged hem
  ctx.strokeStyle = "#1a0a05";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 7; i++) {
    const hx = x - size * 0.3 + i * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(hx, y + size * 0.4 + Math.sin(time * 5 + i) * 2);
    ctx.lineTo(hx + size * 0.03, y + size * 0.5 + Math.sin(time * 4 + i) * 3);
    ctx.stroke();
  }

  // Hood
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x + sway * 0.2, y - size * 0.25, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Hood opening (dark void)
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.ellipse(x + sway * 0.2, y - size * 0.25, size * 0.15, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes in hood
  ctx.fillStyle = `rgba(255, 100, 50, ${runeGlow})`;
  ctx.shadowColor = "#ff6432";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.06 + sway * 0.2, y - size * 0.28, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06 + sway * 0.2, y - size * 0.28, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Floating forbidden book
  ctx.save();
  ctx.translate(x + size * 0.35, y - size * 0.05 + Math.sin(time * 2.5) * 3);
  ctx.rotate(Math.sin(time * 2) * 0.2);
  ctx.fillStyle = "#1a0a05";
  ctx.fillRect(-size * 0.08, -size * 0.1, size * 0.16, size * 0.2);
  ctx.fillStyle = `rgba(255, 120, 50, ${runeGlow})`;
  ctx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.16);
  // Rune on book
  ctx.strokeStyle = `rgba(255, 180, 100, ${runeGlow})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.06);
  ctx.lineTo(0, size * 0.04);
  ctx.moveTo(-size * 0.03, -size * 0.02);
  ctx.lineTo(size * 0.03, -size * 0.02);
  ctx.stroke();
  ctx.restore();

  // Glowing runes floating around
  for (let i = 0; i < 4; i++) {
    const runeAngle = time * 1.5 + i * Math.PI * 0.5;
    const runeDist = size * 0.5;
    const rx = x + Math.cos(runeAngle) * runeDist;
    const ry = y - size * 0.1 + Math.sin(runeAngle) * runeDist * 0.4;
    ctx.fillStyle = `rgba(255, 150, 80, ${runeGlow * (0.4 + Math.sin(time * 3 + i) * 0.2)})`;
    ctx.font = `bold ${size * 0.12}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const runes = ["☉", "☽", "⚝", "⛧"];
    ctx.fillText(runes[i], rx, ry);
  }

  // Glowing coffee cup (forbidden caffeine)
  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.05);
  ctx.fillStyle = "#3a2820";
  ctx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.14);
  // Steam
  ctx.strokeStyle = `rgba(255, 200, 150, ${0.3 + Math.sin(time * 6) * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  for (let s = 0; s < 3; s++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.02 + s * size * 0.03, -size * 0.08);
    ctx.quadraticCurveTo(
      -size * 0.02 + s * size * 0.03 + Math.sin(time * 4 + s) * size * 0.02,
      -size * 0.14,
      -size * 0.02 + s * size * 0.03,
      -size * 0.18
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlaguebearerEnemy(
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
  // FLU SEASON CARRIER - Bloated figure dripping with toxic green ooze
  const isAttacking = attackPhase > 0;
  const bloat = 1 + Math.sin(time * 2) * 0.05 + (isAttacking ? attackPhase * 0.1 : 0);
  const dripPhase = (time * 2) % 1;
  const toxicPulse = 0.5 + Math.sin(time * 3) * 0.3;

  // Toxic cloud around
  for (let c = 0; c < 5; c++) {
    const cloudAngle = time * 0.8 + c * Math.PI * 0.4;
    const cloudDist = size * 0.6 + Math.sin(time + c) * size * 0.15;
    const cx = x + Math.cos(cloudAngle) * cloudDist;
    const cy = y + Math.sin(cloudAngle) * cloudDist * 0.5;
    ctx.fillStyle = `rgba(101, 163, 13, ${0.15 + Math.sin(time * 2 + c) * 0.1})`;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.12 + Math.sin(time * 3 + c) * size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shadow with toxic puddle
  const puddleGrad = ctx.createRadialGradient(x, y + size * 0.45, 0, x, y + size * 0.45, size * 0.45);
  puddleGrad.addColorStop(0, "rgba(101, 163, 13, 0.4)");
  puddleGrad.addColorStop(0.5, "rgba(50, 80, 10, 0.3)");
  puddleGrad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
  ctx.fillStyle = puddleGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bloated body
  const bodyGrad = ctx.createRadialGradient(x, y, size * 0.1, x, y, size * 0.45 * bloat);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.6, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.4 * bloat, size * 0.45 * bloat, 0, 0, Math.PI * 2);
  ctx.fill();

  // Boils and pustules
  for (let b = 0; b < 6; b++) {
    const boilAngle = b * Math.PI * 0.33 + 0.5;
    const boilDist = size * 0.28 * bloat;
    const bx = x + Math.cos(boilAngle) * boilDist;
    const by = y + Math.sin(boilAngle) * boilDist * 0.8;
    const boilSize = size * (0.04 + Math.sin(time * 4 + b) * 0.01);
    ctx.fillStyle = `rgba(180, 200, 50, ${0.7 + Math.sin(time * 3 + b) * 0.2})`;
    ctx.beginPath();
    ctx.arc(bx, by, boilSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 150, 0.5)";
    ctx.beginPath();
    ctx.arc(bx - boilSize * 0.3, by - boilSize * 0.3, boilSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dripping ooze
  for (let d = 0; d < 4; d++) {
    const dripX = x - size * 0.25 + d * size * 0.17;
    const dripProgress = (dripPhase + d * 0.25) % 1;
    const dripY = y + size * 0.3 + dripProgress * size * 0.3;
    const dripAlpha = 1 - dripProgress;
    ctx.fillStyle = `rgba(150, 200, 50, ${dripAlpha * 0.8})`;
    ctx.beginPath();
    ctx.ellipse(dripX, dripY, size * 0.025, size * 0.05 + dripProgress * size * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hood/head covering
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 * bloat, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Sickly glowing eyes
  ctx.fillStyle = `rgba(200, 255, 100, ${toxicPulse + 0.3})`;
  ctx.shadowColor = "#c8ff64";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.38, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.08, y - size * 0.38, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Biohazard symbol on chest
  ctx.strokeStyle = `rgba(255, 255, 100, ${toxicPulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  for (let h = 0; h < 3; h++) {
    const hazAngle = -Math.PI / 2 + h * Math.PI * 2 / 3;
    ctx.beginPath();
    ctx.arc(x + Math.cos(hazAngle) * size * 0.12, y + Math.sin(hazAngle) * size * 0.12, size * 0.06, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Arms holding tissue box
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - size * 0.45, y - size * 0.05, size * 0.15, size * 0.25);
  ctx.fillRect(x + size * 0.3, y - size * 0.05, size * 0.15, size * 0.25);
  // Tissue box
  ctx.fillStyle = "#f5f5f4";
  ctx.fillRect(x - size * 0.15, y + size * 0.05, size * 0.3, size * 0.18);
  ctx.fillStyle = "#a3e635";
  ctx.fillRect(x - size * 0.12, y + size * 0.08, size * 0.24, size * 0.12);
  // Tissue sticking out
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.05);
  ctx.quadraticCurveTo(x + size * 0.05, y - size * 0.02, x, y - size * 0.08 + Math.sin(time * 5) * size * 0.02);
  ctx.quadraticCurveTo(x - size * 0.05, y - size * 0.02, x, y + size * 0.05);
  ctx.fill();
}

function drawThornwalkerEnemy(
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
  // IVY OVERGROWTH - Living plant creature with thorns and vines
  const isAttacking = attackPhase > 0;
  const rustlePhase = Math.sin(time * 4) * 0.03 + (isAttacking ? attackPhase * 0.1 : 0);
  const vineWave = Math.sin(time * 2);
  const leafPulse = 0.5 + Math.sin(time * 3) * 0.3;

  // Root shadow
  ctx.fillStyle = "rgba(22, 101, 52, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.5, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Root tendrils reaching out
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 3 * zoom;
  for (let r = 0; r < 5; r++) {
    const rootAngle = -Math.PI * 0.8 + r * Math.PI * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.4);
    ctx.quadraticCurveTo(
      x + Math.cos(rootAngle) * size * 0.3 + Math.sin(time * 2 + r) * size * 0.05,
      y + size * 0.5,
      x + Math.cos(rootAngle) * size * 0.55,
      y + size * 0.55 + Math.sin(time * 3 + r) * size * 0.03
    );
    ctx.stroke();
  }

  // Main trunk body
  const trunkGrad = ctx.createLinearGradient(x - size * 0.25, y, x + size * 0.25, y);
  trunkGrad.addColorStop(0, bodyColorDark);
  trunkGrad.addColorStop(0.5, bodyColor);
  trunkGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.4);
  ctx.quadraticCurveTo(x - size * 0.3, y, x - size * 0.15, y - size * 0.4);
  ctx.quadraticCurveTo(x, y - size * 0.55, x + size * 0.15, y - size * 0.4);
  ctx.quadraticCurveTo(x + size * 0.3, y, x + size * 0.2, y + size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Bark texture lines
  ctx.strokeStyle = "rgba(50, 30, 20, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let b = 0; b < 6; b++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.15 + b * size * 0.06, y + size * 0.3);
    ctx.lineTo(x - size * 0.12 + b * size * 0.05, y - size * 0.2);
    ctx.stroke();
  }

  // Thorns protruding
  ctx.fillStyle = "#2d3a1a";
  for (let t = 0; t < 8; t++) {
    const thornAngle = Math.PI * 0.3 + t * Math.PI * 0.25;
    const thornDist = size * 0.28;
    const tx = x + Math.cos(thornAngle) * thornDist;
    const ty = y - size * 0.15 + Math.sin(thornAngle * 0.5) * size * 0.35;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(thornAngle + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.02, size * 0.08);
    ctx.lineTo(0, size * 0.15);
    ctx.lineTo(size * 0.02, size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Winding vines
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2.5 * zoom;
  for (let v = 0; v < 3; v++) {
    ctx.beginPath();
    const vStartX = x + (v - 1) * size * 0.15;
    ctx.moveTo(vStartX, y);
    for (let vp = 0; vp < 4; vp++) {
      const vpx = vStartX + Math.sin(time * 2 + v + vp) * size * 0.1;
      const vpy = y - size * 0.1 - vp * size * 0.15;
      ctx.lineTo(vpx, vpy);
    }
    ctx.stroke();
  }

  // Leaves with animation
  for (let l = 0; l < 6; l++) {
    const leafAngle = time * 0.5 + l * Math.PI * 0.33;
    const leafDist = size * 0.35 + Math.sin(time * 2 + l) * size * 0.08;
    const lx = x + Math.cos(leafAngle) * leafDist * 0.8;
    const ly = y - size * 0.2 + Math.sin(leafAngle) * leafDist * 0.5;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(leafAngle + Math.sin(time * 3 + l) * 0.2);
    // Leaf shape
    ctx.fillStyle = `rgba(34, 197, 94, ${leafPulse + 0.3})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.05, -size * 0.04, size * 0.1, 0);
    ctx.quadraticCurveTo(size * 0.05, size * 0.04, 0, 0);
    ctx.fill();
    // Leaf vein
    ctx.strokeStyle = "rgba(22, 101, 52, 0.6)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.08, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Face carved into trunk
  ctx.fillStyle = "#0a0a0a";
  // Eyes (glowing)
  ctx.shadowColor = "#84cc16";
  ctx.shadowBlur = 6 * zoom;
  ctx.fillStyle = `rgba(132, 204, 22, ${leafPulse + 0.4})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.25, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.08, y - size * 0.25, size * 0.04, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Mouth - jagged opening
  ctx.fillStyle = "#0a0505";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.08);
  ctx.lineTo(x - size * 0.05, y - size * 0.12);
  ctx.lineTo(x, y - size * 0.08);
  ctx.lineTo(x + size * 0.05, y - size * 0.12);
  ctx.lineTo(x + size * 0.1, y - size * 0.08);
  ctx.lineTo(x + size * 0.05, y - size * 0.02);
  ctx.lineTo(x, y - size * 0.06);
  ctx.lineTo(x - size * 0.05, y - size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Flower on top
  ctx.fillStyle = "#f472b6";
  for (let p = 0; p < 5; p++) {
    const petalAngle = p * Math.PI * 0.4 + time * 0.5;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(petalAngle) * size * 0.08,
      y - size * 0.5 + Math.sin(petalAngle) * size * 0.08,
      size * 0.05,
      size * 0.08,
      petalAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

function drawSandwormEnemy(
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
  // THESIS DEVOURER - Massive worm emerging from the ground with gnashing teeth
  const isAttacking = attackPhase > 0;
  const emergePhase = Math.sin(time * 1.5) * 0.1 + 0.6 + (isAttacking ? attackPhase * 0.15 : 0);
  const mouthOpen = 0.3 + Math.sin(time * 4) * 0.15 + (isAttacking ? attackPhase * 0.3 : 0);
  const bodyWave = Math.sin(time * 2);

  // Sand disturbance around emergence point
  for (let d = 0; d < 8; d++) {
    const dustAngle = time * 0.5 + d * Math.PI * 0.25;
    const dustDist = size * 0.6 + Math.sin(time * 2 + d) * size * 0.1;
    ctx.fillStyle = `rgba(161, 98, 7, ${0.2 + Math.sin(time * 3 + d) * 0.1})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(dustAngle) * dustDist,
      y + size * 0.3 + Math.sin(dustAngle) * dustDist * 0.3,
      size * 0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Burrow hole
  const holeGrad = ctx.createRadialGradient(x, y + size * 0.4, 0, x, y + size * 0.4, size * 0.5);
  holeGrad.addColorStop(0, "#1a0f05");
  holeGrad.addColorStop(0.5, "#3d2410");
  holeGrad.addColorStop(1, "rgba(161, 98, 7, 0.3)");
  ctx.fillStyle = holeGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.4, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Worm body segments emerging
  const bodyGrad = ctx.createLinearGradient(x - size * 0.4, y, x + size * 0.4, y);
  bodyGrad.addColorStop(0, bodyColorDark);
  bodyGrad.addColorStop(0.3, bodyColor);
  bodyGrad.addColorStop(0.7, bodyColorLight);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  
  // Main body curve
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.4 + bodyWave * size * 0.08,
    y - size * 0.1,
    x - size * 0.2,
    y - size * 0.5 * emergePhase
  );
  ctx.quadraticCurveTo(
    x,
    y - size * 0.7 * emergePhase,
    x + size * 0.2,
    y - size * 0.5 * emergePhase
  );
  ctx.quadraticCurveTo(
    x + size * 0.4 - bodyWave * size * 0.08,
    y - size * 0.1,
    x + size * 0.35,
    y + size * 0.3
  );
  ctx.arc(x, y + size * 0.3, size * 0.35, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Segmented rings on body
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  for (let seg = 0; seg < 5; seg++) {
    const segY = y + size * 0.25 - seg * size * 0.15 * emergePhase;
    const segWidth = size * 0.3 - seg * size * 0.02;
    ctx.beginPath();
    ctx.ellipse(x + Math.sin(time * 2 + seg) * size * 0.02, segY, segWidth, size * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Head with mandibles
  const headY = y - size * 0.45 * emergePhase;
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Circular mouth opening
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.15 * mouthOpen + size * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Teeth rings
  for (let ring = 0; ring < 2; ring++) {
    const teethCount = 8 + ring * 4;
    const ringRadius = size * 0.12 * mouthOpen + size * 0.05 - ring * size * 0.03;
    ctx.fillStyle = ring === 0 ? "#f5f5f4" : "#d6d3d1";
    for (let t = 0; t < teethCount; t++) {
      const toothAngle = (t / teethCount) * Math.PI * 2 + time * 2;
      const tx = x + Math.cos(toothAngle) * ringRadius;
      const ty = headY + Math.sin(toothAngle) * ringRadius;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(toothAngle + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-size * 0.015, 0);
      ctx.lineTo(0, -size * 0.05);
      ctx.lineTo(size * 0.015, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Mandibles (4 pincers)
  ctx.fillStyle = "#78350f";
  for (let m = 0; m < 4; m++) {
    const mandibleAngle = m * Math.PI * 0.5 + time * 0.5;
    const mandibleOpen = mouthOpen * size * 0.15;
    ctx.save();
    ctx.translate(x + Math.cos(mandibleAngle) * (size * 0.18 + mandibleOpen), headY + Math.sin(mandibleAngle) * (size * 0.18 + mandibleOpen));
    ctx.rotate(mandibleAngle);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.04);
    ctx.quadraticCurveTo(size * 0.15, 0, 0, size * 0.04);
    ctx.quadraticCurveTo(size * 0.08, 0, 0, -size * 0.04);
    ctx.fill();
    ctx.restore();
  }

  // Glowing inner maw
  ctx.fillStyle = `rgba(255, 150, 50, ${0.3 + mouthOpen * 0.5})`;
  ctx.shadowColor = "#ff9632";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.08 * mouthOpen, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Paper scraps being devoured (flying into mouth)
  for (let p = 0; p < 4; p++) {
    const paperPhase = (time * 2 + p * 0.25) % 1;
    const paperDist = size * (0.6 - paperPhase * 0.5);
    const paperAngle = p * Math.PI * 0.5 + time;
    const px = x + Math.cos(paperAngle) * paperDist;
    const py = headY - size * 0.1 + Math.sin(paperAngle * 0.5) * paperDist * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - paperPhase) * 0.7})`;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 3 + p);
    ctx.fillRect(-size * 0.03, -size * 0.04, size * 0.06, size * 0.08);
    ctx.restore();
  }
}

function drawFrostlingEnemy(
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
  // WINTER BREAK GHOST - Ethereal ice spirit with swirling frost
  const isAttacking = attackPhase > 0;
  const floatOffset = Math.sin(time * 3) * size * 0.08;
  const shimmer = 0.6 + Math.sin(time * 5) * 0.3 + (isAttacking ? attackPhase * 0.3 : 0);
  const frostSwirl = time * 2;

  // Frost trail/aura
  for (let t = 0; t < 6; t++) {
    const trailOffset = t * 0.15;
    const trailAlpha = (1 - trailOffset) * 0.2;
    ctx.fillStyle = `rgba(125, 211, 252, ${trailAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.sin(time * 2 - t * 0.3) * size * 0.1,
      y + floatOffset + t * size * 0.08,
      size * (0.35 - t * 0.03),
      size * (0.4 - t * 0.04),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Shadow (faint, ethereal)
  ctx.fillStyle = "rgba(125, 211, 252, 0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.3, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main ghostly body
  const bodyGrad = ctx.createRadialGradient(x, y + floatOffset, 0, x, y + floatOffset, size * 0.45);
  bodyGrad.addColorStop(0, `rgba(255, 255, 255, ${shimmer * 0.9})`);
  bodyGrad.addColorStop(0.4, `rgba(186, 230, 253, ${shimmer * 0.7})`);
  bodyGrad.addColorStop(0.8, `rgba(125, 211, 252, ${shimmer * 0.4})`);
  bodyGrad.addColorStop(1, "rgba(125, 211, 252, 0)");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + floatOffset + size * 0.3);
  ctx.quadraticCurveTo(x - size * 0.35, y + floatOffset, x - size * 0.2, y + floatOffset - size * 0.35);
  ctx.quadraticCurveTo(x, y + floatOffset - size * 0.5, x + size * 0.2, y + floatOffset - size * 0.35);
  ctx.quadraticCurveTo(x + size * 0.35, y + floatOffset, x + size * 0.3, y + floatOffset + size * 0.3);
  // Wispy bottom
  for (let w = 0; w < 5; w++) {
    const wispX = x + size * 0.3 - w * size * 0.15;
    const wispY = y + floatOffset + size * 0.3 + Math.sin(time * 4 + w) * size * 0.08;
    ctx.lineTo(wispX, wispY + size * 0.15);
    ctx.lineTo(wispX - size * 0.075, y + floatOffset + size * 0.3);
  }
  ctx.closePath();
  ctx.fill();

  // Ice crystals floating around
  for (let c = 0; c < 5; c++) {
    const crystalAngle = frostSwirl + c * Math.PI * 0.4;
    const crystalDist = size * 0.45 + Math.sin(time * 2 + c) * size * 0.1;
    const cx = x + Math.cos(crystalAngle) * crystalDist;
    const cy = y + floatOffset + Math.sin(crystalAngle) * crystalDist * 0.4;
    const cSize = size * 0.04 + Math.sin(time * 3 + c) * size * 0.01;
    
    // Crystal shape
    ctx.fillStyle = `rgba(224, 242, 254, ${shimmer})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - cSize * 2);
    ctx.lineTo(cx + cSize, cy);
    ctx.lineTo(cx, cy + cSize);
    ctx.lineTo(cx - cSize, cy);
    ctx.closePath();
    ctx.fill();
  }

  // Face
  // Eyes - dark hollows with blue glow
  ctx.fillStyle = `rgba(56, 189, 248, ${shimmer})`;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y + floatOffset - size * 0.2, size * 0.05, size * 0.07, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y + floatOffset - size * 0.2, size * 0.05, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Sad/ethereal mouth
  ctx.strokeStyle = `rgba(56, 189, 248, ${shimmer * 0.8})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y + floatOffset - size * 0.05, size * 0.06, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Snowflakes falling around
  for (let s = 0; s < 8; s++) {
    const snowPhase = (time * 0.5 + s * 0.125) % 1;
    const snowX = x + Math.sin(time + s * 2) * size * 0.5;
    const snowY = y - size * 0.6 + snowPhase * size * 1.2;
    const snowAlpha = Math.sin(snowPhase * Math.PI) * 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${snowAlpha})`;
    // Simple snowflake
    ctx.beginPath();
    ctx.arc(snowX, snowY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cold breath wisps
  if (Math.sin(time * 3) > 0) {
    const breathPhase = (Math.sin(time * 3) + 1) * 0.5;
    ctx.strokeStyle = `rgba(186, 230, 253, ${breathPhase * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + floatOffset);
    ctx.quadraticCurveTo(
      x + breathPhase * size * 0.3,
      y + floatOffset + size * 0.1,
      x + breathPhase * size * 0.5,
      y + floatOffset + size * 0.2
    );
    ctx.stroke();
  }
}

function drawInfernalEnemy(
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
  // BURNOUT DEMON - Fiery demon consumed by flames of overwork
  const isAttacking = attackPhase > 0;
  const flamePulse = 0.5 + Math.sin(time * 6) * 0.3 + (isAttacking ? attackPhase * 0.4 : 0);
  const heatWave = Math.sin(time * 4) * size * 0.02;
  const rageShake = isAttacking ? Math.sin(attackPhase * Math.PI * 8) * size * 0.02 : 0;

  // Heat distortion aura
  const heatGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  heatGrad.addColorStop(0, `rgba(220, 38, 38, ${flamePulse * 0.3})`);
  heatGrad.addColorStop(0.5, `rgba(251, 146, 60, ${flamePulse * 0.15})`);
  heatGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = heatGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Charred ground shadow
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.45, 0, x, y + size * 0.45, size * 0.4);
  shadowGrad.addColorStop(0, "rgba(50, 20, 10, 0.6)");
  shadowGrad.addColorStop(0.5, "rgba(30, 10, 5, 0.4)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.4, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body - cracked obsidian with glowing cracks
  const bodyGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  bodyGrad.addColorStop(0, "#1c1917");
  bodyGrad.addColorStop(0.3, bodyColor);
  bodyGrad.addColorStop(0.7, bodyColorDark);
  bodyGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x + rageShake, y + heatWave, size * 0.35, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing cracks on body
  ctx.strokeStyle = `rgba(251, 146, 60, ${flamePulse + 0.3})`;
  ctx.shadowColor = "#fb923c";
  ctx.shadowBlur = 4 * zoom;
  ctx.lineWidth = 2 * zoom;
  // Vertical cracks
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.35);
  ctx.lineTo(x - size * 0.15, y);
  ctx.lineTo(x - size * 0.05, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.3);
  ctx.lineTo(x + size * 0.1, y + size * 0.1);
  ctx.lineTo(x + size * 0.18, y + size * 0.35);
  ctx.stroke();
  // Horizontal cracks
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.1);
  ctx.lineTo(x, y - size * 0.05);
  ctx.lineTo(x + size * 0.25, y - size * 0.12);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Flaming head
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x + rageShake, y - size * 0.35 + heatWave, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Fire hair/crown
  for (let f = 0; f < 7; f++) {
    const flameHeight = size * (0.25 + Math.sin(time * 8 + f * 1.2) * 0.1);
    const flameX = x - size * 0.18 + f * size * 0.06 + rageShake;
    const flameY = y - size * 0.5 + heatWave;
    
    // Outer flame (red)
    ctx.fillStyle = `rgba(220, 38, 38, ${flamePulse + 0.3})`;
    ctx.beginPath();
    ctx.moveTo(flameX, flameY);
    ctx.quadraticCurveTo(flameX - size * 0.03, flameY - flameHeight * 0.5, flameX, flameY - flameHeight);
    ctx.quadraticCurveTo(flameX + size * 0.03, flameY - flameHeight * 0.5, flameX, flameY);
    ctx.fill();
    
    // Inner flame (orange/yellow)
    ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse + 0.4})`;
    ctx.beginPath();
    ctx.moveTo(flameX, flameY);
    ctx.quadraticCurveTo(flameX - size * 0.015, flameY - flameHeight * 0.35, flameX, flameY - flameHeight * 0.6);
    ctx.quadraticCurveTo(flameX + size * 0.015, flameY - flameHeight * 0.35, flameX, flameY);
    ctx.fill();
  }

  // Horns
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15 + rageShake, y - size * 0.5 + heatWave);
  ctx.quadraticCurveTo(x - size * 0.25 + rageShake, y - size * 0.7 + heatWave, x - size * 0.35 + rageShake, y - size * 0.65 + heatWave);
  ctx.quadraticCurveTo(x - size * 0.2 + rageShake, y - size * 0.55 + heatWave, x - size * 0.12 + rageShake, y - size * 0.45 + heatWave);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15 + rageShake, y - size * 0.5 + heatWave);
  ctx.quadraticCurveTo(x + size * 0.25 + rageShake, y - size * 0.7 + heatWave, x + size * 0.35 + rageShake, y - size * 0.65 + heatWave);
  ctx.quadraticCurveTo(x + size * 0.2 + rageShake, y - size * 0.55 + heatWave, x + size * 0.12 + rageShake, y - size * 0.45 + heatWave);
  ctx.fill();

  // Glowing eyes
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse + 0.5})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08 + rageShake, y - size * 0.38 + heatWave, size * 0.04, size * 0.05, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.08 + rageShake, y - size * 0.38 + heatWave, size * 0.04, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Fanged mouth
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.arc(x + rageShake, y - size * 0.28 + heatWave, size * 0.08, 0, Math.PI);
  ctx.fill();
  // Fangs
  ctx.fillStyle = "#f5f5f4";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05 + rageShake, y - size * 0.28 + heatWave);
  ctx.lineTo(x - size * 0.03 + rageShake, y - size * 0.2 + heatWave);
  ctx.lineTo(x - size * 0.01 + rageShake, y - size * 0.28 + heatWave);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05 + rageShake, y - size * 0.28 + heatWave);
  ctx.lineTo(x + size * 0.03 + rageShake, y - size * 0.2 + heatWave);
  ctx.lineTo(x + size * 0.01 + rageShake, y - size * 0.28 + heatWave);
  ctx.fill();

  // Clawed arms with ember glow
  ctx.fillStyle = bodyColorDark;
  // Left arm
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.5, y + size * 0.1, x - size * 0.45, y + size * 0.3);
  ctx.lineTo(x - size * 0.35, y + size * 0.25);
  ctx.quadraticCurveTo(x - size * 0.4, y + size * 0.1, x - size * 0.25, y - size * 0.05);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 0.1);
  ctx.quadraticCurveTo(x + size * 0.5, y + size * 0.1, x + size * 0.45, y + size * 0.3);
  ctx.lineTo(x + size * 0.35, y + size * 0.25);
  ctx.quadraticCurveTo(x + size * 0.4, y + size * 0.1, x + size * 0.25, y - size * 0.05);
  ctx.fill();
  // Claw tips glowing
  ctx.fillStyle = `rgba(251, 146, 60, ${flamePulse})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.45, y + size * 0.3, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.45, y + size * 0.3, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Rising embers
  for (let e = 0; e < 6; e++) {
    const emberPhase = (time * 1.5 + e * 0.17) % 1;
    const emberX = x + Math.sin(time * 2 + e * 2) * size * 0.3;
    const emberY = y + size * 0.2 - emberPhase * size * 1.2;
    const emberAlpha = (1 - emberPhase) * 0.8;
    ctx.fillStyle = `rgba(251, 191, 36, ${emberAlpha})`;
    ctx.beginPath();
    ctx.arc(emberX, emberY, size * (0.02 - emberPhase * 0.015), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBansheeEnemy(
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
  // GRADE WAILING SPIRIT - Ghostly screaming figure with flowing form
  const isAttacking = attackPhase > 0;
  const floatOffset = Math.sin(time * 2.5) * size * 0.1;
  const screamPhase = Math.sin(time * 8);
  const wailIntensity = 0.5 + Math.abs(screamPhase) * 0.3 + (isAttacking ? attackPhase * 0.4 : 0);
  const mouthOpen = 0.3 + Math.abs(Math.sin(time * 6)) * 0.4 + (isAttacking ? attackPhase * 0.3 : 0);

  // Ethereal trail
  for (let t = 0; t < 8; t++) {
    const trailAlpha = (1 - t * 0.12) * 0.15;
    ctx.fillStyle = `rgba(226, 232, 240, ${trailAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.sin(time * 2 - t * 0.2) * size * 0.08,
      y + floatOffset + t * size * 0.1,
      size * (0.3 - t * 0.02),
      size * (0.35 - t * 0.025),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Sound wave rings (when screaming)
  if (wailIntensity > 0.6) {
    for (let wave = 0; wave < 3; wave++) {
      const wavePhase = (time * 3 + wave * 0.33) % 1;
      const waveSize = size * (0.3 + wavePhase * 0.8);
      ctx.strokeStyle = `rgba(226, 232, 240, ${(1 - wavePhase) * 0.3})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.arc(x, y + floatOffset - size * 0.1, waveSize, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.stroke();
    }
  }

  // Ghostly shadow
  ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.6, size * 0.25, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main spectral body
  const bodyGrad = ctx.createRadialGradient(x, y + floatOffset, 0, x, y + floatOffset, size * 0.5);
  bodyGrad.addColorStop(0, `rgba(255, 255, 255, ${wailIntensity * 0.8})`);
  bodyGrad.addColorStop(0.5, `rgba(226, 232, 240, ${wailIntensity * 0.5})`);
  bodyGrad.addColorStop(1, "rgba(203, 213, 225, 0)");
  ctx.fillStyle = bodyGrad;
  
  // Flowing dress-like form
  ctx.beginPath();
  ctx.moveTo(x, y + floatOffset - size * 0.5);
  ctx.quadraticCurveTo(x - size * 0.35, y + floatOffset - size * 0.2, x - size * 0.4, y + floatOffset + size * 0.2);
  // Flowing bottom edge
  for (let edge = 0; edge < 6; edge++) {
    const edgeX = x - size * 0.4 + edge * size * 0.16;
    const edgeY = y + floatOffset + size * 0.5 + Math.sin(time * 4 + edge) * size * 0.1;
    ctx.lineTo(edgeX, edgeY);
  }
  ctx.quadraticCurveTo(x + size * 0.35, y + floatOffset - size * 0.2, x, y + floatOffset - size * 0.5);
  ctx.fill();

  // Flowing hair
  ctx.fillStyle = `rgba(203, 213, 225, ${wailIntensity * 0.7})`;
  for (let h = 0; h < 5; h++) {
    const hairAngle = -Math.PI * 0.7 + h * Math.PI * 0.35;
    const hairWave = Math.sin(time * 3 + h * 0.5) * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(hairAngle) * size * 0.15, y + floatOffset - size * 0.4);
    ctx.quadraticCurveTo(
      x + Math.cos(hairAngle) * size * 0.35 + hairWave,
      y + floatOffset - size * 0.6,
      x + Math.cos(hairAngle) * size * 0.5 + hairWave * 1.5,
      y + floatOffset - size * 0.5 + Math.sin(hairAngle) * size * 0.2
    );
    ctx.quadraticCurveTo(
      x + Math.cos(hairAngle) * size * 0.3 + hairWave * 0.5,
      y + floatOffset - size * 0.5,
      x + Math.cos(hairAngle) * size * 0.1,
      y + floatOffset - size * 0.35
    );
    ctx.fill();
  }

  // Face
  // Hollow eyes
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y + floatOffset - size * 0.25, size * 0.06, size * 0.08, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y + floatOffset - size * 0.25, size * 0.06, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow
  ctx.fillStyle = `rgba(148, 163, 184, ${wailIntensity})`;
  ctx.shadowColor = "#94a3b8";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y + floatOffset - size * 0.26, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y + floatOffset - size * 0.26, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Screaming mouth
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(x, y + floatOffset - size * 0.08, size * 0.1 * mouthOpen, size * 0.15 * mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();
  // Mouth glow
  ctx.fillStyle = `rgba(148, 163, 184, ${wailIntensity * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(x, y + floatOffset - size * 0.08, size * 0.05 * mouthOpen, size * 0.08 * mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();

  // Reaching arms
  ctx.fillStyle = `rgba(226, 232, 240, ${wailIntensity * 0.6})`;
  // Left arm
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y + floatOffset);
  ctx.quadraticCurveTo(
    x - size * 0.5 + Math.sin(time * 3) * size * 0.1,
    y + floatOffset - size * 0.1,
    x - size * 0.55,
    y + floatOffset - size * 0.25 + Math.sin(time * 4) * size * 0.05
  );
  ctx.lineTo(x - size * 0.45, y + floatOffset - size * 0.2);
  ctx.quadraticCurveTo(x - size * 0.35, y + floatOffset, x - size * 0.2, y + floatOffset + size * 0.05);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + floatOffset);
  ctx.quadraticCurveTo(
    x + size * 0.5 + Math.sin(time * 3 + 1) * size * 0.1,
    y + floatOffset - size * 0.1,
    x + size * 0.55,
    y + floatOffset - size * 0.25 + Math.sin(time * 4 + 1) * size * 0.05
  );
  ctx.lineTo(x + size * 0.45, y + floatOffset - size * 0.2);
  ctx.quadraticCurveTo(x + size * 0.35, y + floatOffset, x + size * 0.2, y + floatOffset + size * 0.05);
  ctx.fill();

  // Floating grade papers
  for (let p = 0; p < 3; p++) {
    const paperAngle = time * 1.5 + p * Math.PI * 0.67;
    const paperDist = size * 0.55 + Math.sin(time * 2 + p) * size * 0.1;
    const px = x + Math.cos(paperAngle) * paperDist;
    const py = y + floatOffset + Math.sin(paperAngle * 0.5) * paperDist * 0.3;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(time * 2 + p) * 0.3);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 3 + p) * 0.2})`;
    ctx.fillRect(-size * 0.04, -size * 0.05, size * 0.08, size * 0.1);
    // F grade
    ctx.fillStyle = "#ef4444";
    ctx.font = `bold ${size * 0.06}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("F", 0, size * 0.02);
    ctx.restore();
  }
}

function drawJuggernautEnemy(
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
  // ENDOWED CHAIR - Massive armored titan with academic regalia
  const isAttacking = attackPhase > 0;
  const stomp = Math.sin(time * 2) * size * 0.02;
  const powerPulse = 0.5 + Math.sin(time * 3) * 0.2 + (isAttacking ? attackPhase * 0.3 : 0);
  const groundShake = isAttacking ? Math.sin(attackPhase * Math.PI * 6) * size * 0.015 : 0;

  // Ground crack effect
  ctx.strokeStyle = "rgba(68, 64, 60, 0.4)";
  ctx.lineWidth = 2 * zoom;
  for (let crack = 0; crack < 6; crack++) {
    const crackAngle = crack * Math.PI / 3 + Math.sin(time) * 0.1;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.5);
    ctx.lineTo(
      x + Math.cos(crackAngle) * size * (0.4 + Math.sin(time + crack) * 0.1),
      y + size * 0.5 + Math.sin(crackAngle) * size * 0.15
    );
    ctx.stroke();
  }

  // Heavy shadow
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.5, 0, x, y + size * 0.5, size * 0.55);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x + groundShake, y + size * 0.5, size * 0.55, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Massive legs
  ctx.fillStyle = bodyColorDark;
  // Left leg
  ctx.fillRect(x - size * 0.25 + groundShake, y + size * 0.15 + stomp, size * 0.18, size * 0.35);
  // Right leg
  ctx.fillRect(x + size * 0.07 + groundShake, y + size * 0.15 - stomp, size * 0.18, size * 0.35);
  // Armored knee guards
  ctx.fillStyle = "#52525b";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.16 + groundShake, y + size * 0.22 + stomp, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.16 + groundShake, y + size * 0.22 - stomp, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Massive armored body
  const bodyGrad = ctx.createLinearGradient(x - size * 0.45, y, x + size * 0.45, y);
  bodyGrad.addColorStop(0, "#27272a");
  bodyGrad.addColorStop(0.3, bodyColor);
  bodyGrad.addColorStop(0.7, bodyColorDark);
  bodyGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4 + groundShake, y + size * 0.35);
  ctx.lineTo(x - size * 0.45 + groundShake, y - size * 0.1);
  ctx.quadraticCurveTo(x + groundShake, y - size * 0.35, x + size * 0.45 + groundShake, y - size * 0.1);
  ctx.lineTo(x + size * 0.4 + groundShake, y + size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Academic robe over armor (gold trim)
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35 + groundShake, y - size * 0.05);
  ctx.quadraticCurveTo(x + groundShake, y + size * 0.1, x + size * 0.35 + groundShake, y - size * 0.05);
  ctx.lineTo(x + size * 0.4 + groundShake, y + size * 0.4);
  ctx.lineTo(x - size * 0.4 + groundShake, y + size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Gold trim
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35 + groundShake, y - size * 0.05);
  ctx.quadraticCurveTo(x + groundShake, y + size * 0.1, x + size * 0.35 + groundShake, y - size * 0.05);
  ctx.stroke();

  // Chest emblem (university seal)
  ctx.fillStyle = `rgba(212, 175, 55, ${powerPulse})`;
  ctx.beginPath();
  ctx.arc(x + groundShake, y + size * 0.05, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Shield design
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(x + groundShake, y - size * 0.02);
  ctx.lineTo(x - size * 0.05 + groundShake, y + size * 0.02);
  ctx.lineTo(x - size * 0.05 + groundShake, y + size * 0.08);
  ctx.lineTo(x + groundShake, y + size * 0.12);
  ctx.lineTo(x + size * 0.05 + groundShake, y + size * 0.08);
  ctx.lineTo(x + size * 0.05 + groundShake, y + size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Massive shoulder pauldrons
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.42 + groundShake, y - size * 0.12, size * 0.18, size * 0.12, -0.3, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.42 + groundShake, y - size * 0.12, size * 0.18, size * 0.12, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Gold rivets
  ctx.fillStyle = "#d4af37";
  for (let r = 0; r < 3; r++) {
    ctx.beginPath();
    ctx.arc(x - size * 0.45 + r * size * 0.05 + groundShake, y - size * 0.12, size * 0.02, 0, Math.PI * 2);
    ctx.arc(x + size * 0.35 + r * size * 0.05 + groundShake, y - size * 0.12, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Powerful arms
  ctx.fillStyle = bodyColor;
  // Left arm with gauntlet
  ctx.fillRect(x - size * 0.5 + groundShake, y - size * 0.08, size * 0.12, size * 0.35);
  ctx.fillStyle = "#52525b";
  ctx.fillRect(x - size * 0.52 + groundShake, y + size * 0.18, size * 0.16, size * 0.1);
  // Right arm
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x + size * 0.38 + groundShake, y - size * 0.08, size * 0.12, size * 0.35);
  ctx.fillStyle = "#52525b";
  ctx.fillRect(x + size * 0.36 + groundShake, y + size * 0.18, size * 0.16, size * 0.1);

  // Helmeted head with academic cap
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x + groundShake, y - size * 0.35, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Helmet visor
  ctx.fillStyle = "#18181b";
  ctx.fillRect(x - size * 0.15 + groundShake, y - size * 0.42, size * 0.3, size * 0.12);
  // Glowing eyes
  ctx.fillStyle = `rgba(212, 175, 55, ${powerPulse + 0.4})`;
  ctx.shadowColor = "#d4af37";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.07 + groundShake, y - size * 0.37, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.07 + groundShake, y - size * 0.37, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Academic mortarboard on helmet
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(x - size * 0.2 + groundShake, y - size * 0.58, size * 0.4, size * 0.06);
  // Tassel
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15 + groundShake, y - size * 0.55);
  ctx.quadraticCurveTo(x + size * 0.25 + groundShake, y - size * 0.45, x + size * 0.22 + groundShake + Math.sin(time * 3) * size * 0.05, y - size * 0.35);
  ctx.stroke();
  ctx.fillStyle = "#d4af37";
  ctx.beginPath();
  ctx.arc(x + size * 0.22 + groundShake + Math.sin(time * 3) * size * 0.05, y - size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Giant ceremonial mace
  ctx.save();
  ctx.translate(x + size * 0.45 + groundShake, y + size * 0.15);
  ctx.rotate(0.3);
  // Mace shaft
  ctx.fillStyle = "#78350f";
  ctx.fillRect(-size * 0.025, 0, size * 0.05, size * 0.4);
  // Mace head
  ctx.fillStyle = "#d4af37";
  ctx.beginPath();
  ctx.arc(0, -size * 0.08, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Mace decorations
  ctx.fillStyle = "#b8860b";
  for (let spike = 0; spike < 6; spike++) {
    const spikeAngle = spike * Math.PI / 3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(spikeAngle) * size * 0.06, -size * 0.08 + Math.sin(spikeAngle) * size * 0.06);
    ctx.lineTo(Math.cos(spikeAngle) * size * 0.12, -size * 0.08 + Math.sin(spikeAngle) * size * 0.12);
    ctx.lineTo(Math.cos(spikeAngle + 0.3) * size * 0.06, -size * 0.08 + Math.sin(spikeAngle + 0.3) * size * 0.06);
    ctx.fill();
  }
  ctx.restore();
}

function drawAssassinEnemy(
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
  // CURVE WRECKER - Fast, shadowy figure with deadly precision
  const isAttacking = attackPhase > 0;
  const dashPhase = Math.sin(time * 8) * 0.1;
  const shadowFlicker = 0.4 + Math.sin(time * 6) * 0.2 + (isAttacking ? attackPhase * 0.4 : 0);
  const lean = Math.sin(time * 4) * 0.1;

  // Motion blur/afterimage trail
  for (let trail = 0; trail < 4; trail++) {
    const trailAlpha = (1 - trail * 0.25) * 0.15;
    ctx.fillStyle = `rgba(30, 27, 75, ${trailAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x - trail * size * 0.08,
      y,
      size * 0.25,
      size * 0.4,
      lean,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Faint shadow
  ctx.fillStyle = "rgba(30, 27, 75, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.25, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crouched body
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  
  const bodyGrad = ctx.createLinearGradient(-size * 0.25, 0, size * 0.25, 0);
  bodyGrad.addColorStop(0, "rgba(30, 27, 75, 0.9)");
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(1, "rgba(30, 27, 75, 0.9)");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05, size * 0.22, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hood
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(0, -size * 0.28, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  // Hood point
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.42);
  ctx.lineTo(0, -size * 0.55);
  ctx.lineTo(size * 0.1, -size * 0.42);
  ctx.closePath();
  ctx.fill();

  // Dark void face
  ctx.fillStyle = "#0a0a0f";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.28, size * 0.12, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes (calculating)
  ctx.fillStyle = `rgba(167, 139, 250, ${shadowFlicker + 0.4})`;
  ctx.shadowColor = "#a78bfa";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.ellipse(-size * 0.05, -size * 0.3, size * 0.03, size * 0.015, 0, 0, Math.PI * 2);
  ctx.ellipse(size * 0.05, -size * 0.3, size * 0.03, size * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();

  // Arms with daggers
  ctx.fillStyle = bodyColor;
  // Left arm reaching forward
  ctx.save();
  ctx.translate(x - size * 0.18, y - size * 0.05);
  ctx.rotate(-0.5 + dashPhase);
  ctx.fillRect(-size * 0.04, 0, size * 0.08, size * 0.25);
  // Dagger
  ctx.fillStyle = "#52525b";
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.25);
  ctx.lineTo(0, size * 0.42);
  ctx.lineTo(size * 0.015, size * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(167, 139, 250, ${shadowFlicker})`;
  ctx.fillRect(-size * 0.02, size * 0.22, size * 0.04, size * 0.04);
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(x + size * 0.18, y - size * 0.05);
  ctx.rotate(0.5 - dashPhase);
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-size * 0.04, 0, size * 0.08, size * 0.25);
  // Dagger
  ctx.fillStyle = "#52525b";
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, size * 0.25);
  ctx.lineTo(0, size * 0.42);
  ctx.lineTo(size * 0.015, size * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(167, 139, 250, ${shadowFlicker})`;
  ctx.fillRect(-size * 0.02, size * 0.22, size * 0.04, size * 0.04);
  ctx.restore();

  // Speed lines
  ctx.strokeStyle = `rgba(167, 139, 250, ${shadowFlicker * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let line = 0; line < 4; line++) {
    const lineY = y - size * 0.3 + line * size * 0.2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, lineY);
    ctx.lineTo(x - size * 0.8 - Math.random() * size * 0.2, lineY + Math.sin(time * 10 + line) * size * 0.02);
    ctx.stroke();
  }

  // Calculator/test paper being slashed
  if (isAttacking) {
    const slashPhase = attackPhase;
    ctx.save();
    ctx.translate(x + size * 0.3, y);
    ctx.rotate(slashPhase * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - slashPhase) * 0.8})`;
    ctx.fillRect(-size * 0.05, -size * 0.06, size * 0.1, size * 0.12);
    // Slash mark
    ctx.strokeStyle = `rgba(239, 68, 68, ${(1 - slashPhase)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.08, -size * 0.08);
    ctx.lineTo(size * 0.08, size * 0.08);
    ctx.stroke();
    ctx.restore();
  }

  // Smoke/shadow particles
  for (let p = 0; p < 4; p++) {
    const particlePhase = (time * 2 + p * 0.25) % 1;
    const px = x - size * 0.3 - particlePhase * size * 0.3;
    const py = y + size * 0.1 + Math.sin(time * 3 + p) * size * 0.1;
    const particleAlpha = (1 - particlePhase) * 0.3;
    ctx.fillStyle = `rgba(30, 27, 75, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDragonEnemy(
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
  // ANCIENT ALUMNUS - Legendary dragon with Princeton colors, massive and majestic
  const isAttacking = attackPhase > 0;
  const wingFlap = Math.sin(time * 3) * 0.3;
  const breathPulse = 0.5 + Math.sin(time * 4) * 0.3 + (isAttacking ? attackPhase * 0.5 : 0);
  const hover = Math.sin(time * 2) * size * 0.05;
  const headBob = Math.sin(time * 2.5) * size * 0.02;

  // Epic aura/glow
  const auraGrad = ctx.createRadialGradient(x, y + hover, 0, x, y + hover, size * 1.2);
  auraGrad.addColorStop(0, `rgba(159, 18, 57, ${breathPulse * 0.2})`);
  auraGrad.addColorStop(0.5, `rgba(255, 100, 50, ${breathPulse * 0.1})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y + hover, size * 1.2, 0, Math.PI * 2);
  ctx.fill();


  // WINGS (behind body)
  // Left wing
  ctx.save();
  ctx.translate(x - size * 0.3, y - size * 0.1 + hover);
  ctx.rotate(-0.5 + wingFlap);
  const wingGrad = ctx.createLinearGradient(0, 0, -size * 0.8, -size * 0.4);
  wingGrad.addColorStop(0, bodyColor);
  wingGrad.addColorStop(0.5, bodyColorLight);
  wingGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.2, -size * 0.4, -size * 0.6, -size * 0.5);
  ctx.lineTo(-size * 0.8, -size * 0.3);
  ctx.quadraticCurveTo(-size * 0.5, -size * 0.2, -size * 0.3, 0);
  ctx.lineTo(-size * 0.6, size * 0.1);
  ctx.quadraticCurveTo(-size * 0.3, size * 0.05, 0, size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Wing membrane lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  for (let w = 0; w < 4; w++) {
    ctx.beginPath();
    ctx.moveTo(0, size * 0.02 * w);
    ctx.quadraticCurveTo(-size * 0.3, -size * 0.15 - w * size * 0.08, -size * 0.6 + w * size * 0.08, -size * 0.4 + w * size * 0.1);
    ctx.stroke();
  }
  ctx.restore();

  // Right wing
  ctx.save();
  ctx.translate(x + size * 0.3, y - size * 0.1 + hover);
  ctx.rotate(0.5 - wingFlap);
  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.2, -size * 0.4, size * 0.6, -size * 0.5);
  ctx.lineTo(size * 0.8, -size * 0.3);
  ctx.quadraticCurveTo(size * 0.5, -size * 0.2, size * 0.3, 0);
  ctx.lineTo(size * 0.6, size * 0.1);
  ctx.quadraticCurveTo(size * 0.3, size * 0.05, 0, size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Wing membrane lines
  for (let w = 0; w < 4; w++) {
    ctx.beginPath();
    ctx.moveTo(0, size * 0.02 * w);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.15 - w * size * 0.08, size * 0.6 - w * size * 0.08, -size * 0.4 + w * size * 0.1);
    ctx.stroke();
  }
  ctx.restore();

  // Tail
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.3 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.5 + Math.sin(time * 2) * size * 0.1,
    y + size * 0.5 + hover,
    x - size * 0.7 + Math.sin(time * 2.5) * size * 0.15,
    y + size * 0.35 + hover
  );
  ctx.quadraticCurveTo(
    x - size * 0.5 + Math.sin(time * 2) * size * 0.1,
    y + size * 0.4 + hover,
    x - size * 0.1, y + size * 0.25 + hover
  );
  ctx.fill();
  // Tail spikes
  ctx.fillStyle = bodyColorDark;
  for (let ts = 0; ts < 4; ts++) {
    const tailX = x - size * 0.2 - ts * size * 0.12 + Math.sin(time * 2 + ts * 0.3) * size * 0.03;
    const tailY = y + size * 0.38 + ts * size * 0.03 + hover;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(tailX - size * 0.02, tailY - size * 0.08);
    ctx.lineTo(tailX + size * 0.02, tailY);
    ctx.fill();
  }

  // Main body
  const bodyGradient = ctx.createLinearGradient(x - size * 0.4, y, x + size * 0.4, y);
  bodyGradient.addColorStop(0, bodyColorDark);
  bodyGradient.addColorStop(0.3, bodyColor);
  bodyGradient.addColorStop(0.7, bodyColorLight);
  bodyGradient.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1 + hover, size * 0.4, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly scales
  ctx.fillStyle = lightenColor(bodyColor, 20);
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15 + hover, size * 0.25, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  // Scale pattern
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 1 * zoom;
  for (let scale = 0; scale < 5; scale++) {
    ctx.beginPath();
    ctx.arc(x, y - size * 0.1 + scale * size * 0.1 + hover, size * 0.22, 0.3 * Math.PI, 0.7 * Math.PI);
    ctx.stroke();
  }

  // Legs
  ctx.fillStyle = bodyColor;
  // Front left
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.2 + hover);
  ctx.quadraticCurveTo(x - size * 0.4, y + size * 0.45, x - size * 0.35, y + size * 0.55);
  ctx.lineTo(x - size * 0.25, y + size * 0.5);
  ctx.quadraticCurveTo(x - size * 0.25, y + size * 0.35, x - size * 0.2, y + size * 0.2);
  ctx.fill();
  // Front right
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y + size * 0.2 + hover);
  ctx.quadraticCurveTo(x + size * 0.4, y + size * 0.45, x + size * 0.35, y + size * 0.55);
  ctx.lineTo(x + size * 0.25, y + size * 0.5);
  ctx.quadraticCurveTo(x + size * 0.25, y + size * 0.35, x + size * 0.2, y + size * 0.2);
  ctx.fill();
  // Claws
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(x - size * 0.38, y + size * 0.56, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x - size * 0.33, y + size * 0.58, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.38, y + size * 0.56, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.33, y + size * 0.58, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.2 + hover);
  ctx.quadraticCurveTo(x, y - size * 0.4 + hover + headBob, x + size * 0.05, y - size * 0.5 + hover + headBob);
  ctx.lineTo(x + size * 0.15, y - size * 0.45 + hover + headBob);
  ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.3 + hover + headBob, x + size * 0.1, y - size * 0.15 + hover);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, y - size * 0.55 + hover + headBob, size * 0.18, size * 0.12, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Snout
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.58 + hover + headBob);
  ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.55 + hover + headBob, x + size * 0.42, y - size * 0.5 + hover + headBob);
  ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.48 + hover + headBob, x + size * 0.2, y - size * 0.52 + hover + headBob);
  ctx.closePath();
  ctx.fill();

  // Nostrils with smoke
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.arc(x + size * 0.38, y - size * 0.52 + hover + headBob, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.35, y - size * 0.54 + hover + headBob, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // Smoke wisps
  if (breathPulse > 0.6) {
    ctx.strokeStyle = `rgba(200, 200, 200, ${(breathPulse - 0.6) * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    for (let smoke = 0; smoke < 2; smoke++) {
      const smokePhase = (time * 2 + smoke * 0.5) % 1;
      ctx.beginPath();
      ctx.moveTo(x + size * 0.38, y - size * 0.52 + hover + headBob);
      ctx.quadraticCurveTo(
        x + size * 0.45 + smokePhase * size * 0.1,
        y - size * 0.55 - smokePhase * size * 0.1 + hover + headBob,
        x + size * 0.5 + smokePhase * size * 0.15,
        y - size * 0.6 - smokePhase * size * 0.15 + hover + headBob
      );
      ctx.stroke();
    }
  }

  // Horns (majestic curved horns)
  ctx.fillStyle = "#44403c";
  // Left horn
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.62 + hover + headBob);
  ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.8 + hover + headBob, x - size * 0.2, y - size * 0.85 + hover + headBob);
  ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.75 + hover + headBob, x + size * 0.02, y - size * 0.6 + hover + headBob);
  ctx.fill();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.62 + hover + headBob);
  ctx.quadraticCurveTo(x + size * 0.25, y - size * 0.75 + hover + headBob, x + size * 0.35, y - size * 0.78 + hover + headBob);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.7 + hover + headBob, x + size * 0.15, y - size * 0.58 + hover + headBob);
  ctx.fill();

  // Crown spikes on head
  ctx.fillStyle = bodyColorDark;
  for (let spike = 0; spike < 4; spike++) {
    const spikeX = x - size * 0.02 + spike * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(spikeX, y - size * 0.62 + hover + headBob);
    ctx.lineTo(spikeX + size * 0.015, y - size * 0.68 - spike * size * 0.01 + hover + headBob);
    ctx.lineTo(spikeX + size * 0.03, y - size * 0.62 + hover + headBob);
    ctx.fill();
  }

  // Eyes (ancient and knowing)
  ctx.fillStyle = "#fbbf24";
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.05, y - size * 0.56 + hover + headBob, size * 0.035, size * 0.025, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Pupil (slit)
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.05, y - size * 0.56 + hover + headBob, size * 0.01, size * 0.02, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Fire breath (when attacking)
  if (isAttacking && attackPhase > 0.3) {
    const firePhase = (attackPhase - 0.3) / 0.7;
    const fireLength = size * 0.8 * firePhase;
    
    // Fire cone
    const fireGrad = ctx.createLinearGradient(
      x + size * 0.4, y - size * 0.5 + hover + headBob,
      x + size * 0.4 + fireLength, y - size * 0.4 + hover + headBob
    );
    fireGrad.addColorStop(0, `rgba(255, 255, 200, ${firePhase})`);
    fireGrad.addColorStop(0.3, `rgba(255, 200, 50, ${firePhase * 0.9})`);
    fireGrad.addColorStop(0.6, `rgba(255, 100, 0, ${firePhase * 0.7})`);
    fireGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
    
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.4, y - size * 0.52 + hover + headBob);
    ctx.quadraticCurveTo(
      x + size * 0.5 + fireLength * 0.5, y - size * 0.7 + hover + headBob,
      x + size * 0.4 + fireLength, y - size * 0.4 + Math.sin(time * 10) * size * 0.1 + hover + headBob
    );
    ctx.quadraticCurveTo(
      x + size * 0.5 + fireLength * 0.5, y - size * 0.3 + hover + headBob,
      x + size * 0.4, y - size * 0.48 + hover + headBob
    );
    ctx.fill();
  }

  // Princeton "P" emblem on chest
  ctx.fillStyle = `rgba(255, 140, 0, ${breathPulse * 0.8})`;
  ctx.font = `bold ${size * 0.15}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y + size * 0.15 + hover);
}

// =====================================================
// FOREST REGION TROOPS
// =====================================================

function drawAthleteEnemy(
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
  // VARSITY RUNNER - Elite sprinter with dynamic running animation
  const isAttacking = attackPhase > 0;
  const attackBoost = isAttacking ? 1.3 : 1; // Run faster when attacking
  const runCycle = Math.sin(time * 14 * attackBoost) * 0.4;
  const armSwing = Math.sin(time * 14 * attackBoost) * 0.5;
  const bounce = Math.abs(Math.sin(time * 14 * attackBoost)) * 4 * zoom;
  const leanForward = 0.15 + (isAttacking ? 0.1 : 0); // Lean more when attacking

  // Motion blur trails (speed effect)
  ctx.globalAlpha = isAttacking ? 0.2 : 0.15;
  ctx.fillStyle = bodyColor;
  for (let trail = 1; trail <= 3; trail++) {
    ctx.beginPath();
    ctx.ellipse(x - trail * 6 * zoom, y - size * 0.15, size * 0.25, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Ground shadow (elongated for speed)
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, y + size * 0.45, size * 0.45, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- LEGS with detailed anatomy ---
  const skinTone = "#e8c4a0";
  const skinHighlight = "#f5dcc4";
  const skinShadow = "#d4a574";

  // Back leg (bent back in running stride)
  ctx.save();
  ctx.translate(x - size * 0.1, y + size * 0.1 - bounce);
  ctx.rotate(runCycle * 0.6 + leanForward);
  // Thigh
  const thighGrad = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  thighGrad.addColorStop(0, skinShadow);
  thighGrad.addColorStop(0.5, skinTone);
  thighGrad.addColorStop(1, skinHighlight);
  ctx.fillStyle = thighGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.08, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Calf
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.28, size * 0.06, size * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Running shoe
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(size * 0.05, size * 0.38, size * 0.1, size * 0.04, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Shoe accent stripe
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, size * 0.36);
  ctx.lineTo(size * 0.1, size * 0.38);
  ctx.stroke();
  ctx.restore();

  // Front leg (extended forward)
  ctx.save();
  ctx.translate(x + size * 0.1, y + size * 0.1 - bounce);
  ctx.rotate(-runCycle * 0.6 + leanForward);
  // Thigh
  ctx.fillStyle = thighGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.09, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  // Calf
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.ellipse(-size * 0.02, size * 0.28, size * 0.065, size * 0.11, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Running shoe
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(-size * 0.04, size * 0.38, size * 0.1, size * 0.045, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Shoe accent
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.04, size * 0.36);
  ctx.lineTo(-size * 0.1, size * 0.39);
  ctx.stroke();
  ctx.restore();

  // --- SHORTS with detail ---
  const shortsGrad = ctx.createLinearGradient(x - size * 0.2, y, x + size * 0.2, y);
  shortsGrad.addColorStop(0, "#1e3a5f");
  shortsGrad.addColorStop(0.5, "#2d4a6f");
  shortsGrad.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = shortsGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.02 - bounce);
  ctx.lineTo(x - size * 0.18, y + size * 0.18 - bounce);
  ctx.lineTo(x, y + size * 0.15 - bounce);
  ctx.lineTo(x + size * 0.18, y + size * 0.18 - bounce);
  ctx.lineTo(x + size * 0.22, y - size * 0.02 - bounce);
  ctx.closePath();
  ctx.fill();
  // Shorts side stripe
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - bounce);
  ctx.lineTo(x - size * 0.16, y + size * 0.15 - bounce);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - bounce);
  ctx.lineTo(x + size * 0.16, y + size * 0.15 - bounce);
  ctx.stroke();

  // --- TORSO (Athletic jersey) ---
  ctx.save();
  ctx.translate(x, y - size * 0.18 - bounce);
  ctx.rotate(leanForward * 0.3);
  // Jersey body gradient
  const jerseyGrad = ctx.createLinearGradient(-size * 0.25, -size * 0.2, size * 0.25, size * 0.2);
  jerseyGrad.addColorStop(0, bodyColorDark);
  jerseyGrad.addColorStop(0.3, bodyColor);
  jerseyGrad.addColorStop(0.7, bodyColor);
  jerseyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = jerseyGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, size * 0.15);
  ctx.quadraticCurveTo(-size * 0.28, 0, -size * 0.22, -size * 0.18);
  ctx.lineTo(-size * 0.08, -size * 0.22);
  ctx.quadraticCurveTo(0, -size * 0.24, size * 0.08, -size * 0.22);
  ctx.lineTo(size * 0.22, -size * 0.18);
  ctx.quadraticCurveTo(size * 0.28, 0, size * 0.25, size * 0.15);
  ctx.closePath();
  ctx.fill();
  // Jersey V-neck
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.18);
  ctx.lineTo(0, -size * 0.08);
  ctx.lineTo(size * 0.06, -size * 0.18);
  ctx.closePath();
  ctx.fill();
  // Jersey shoulder stripes
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.15);
  ctx.lineTo(-size * 0.25, -size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.2, -size * 0.15);
  ctx.lineTo(size * 0.25, -size * 0.05);
  ctx.stroke();
  // Jersey number (on chest)
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${size * 0.18}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("23", 0, size * 0.02);
  // Number outline
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.5 * zoom;
  ctx.strokeText("23", 0, size * 0.02);
  ctx.restore();

  // --- ARMS (pumping motion) ---
  // Back arm
  ctx.save();
  ctx.translate(x - size * 0.28, y - size * 0.18 - bounce);
  ctx.rotate(-armSwing * 0.7 + leanForward);
  // Upper arm (sleeve)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.08, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(size * 0.02, size * 0.22, size * 0.055, size * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Fist
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.arc(size * 0.04, size * 0.32, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front arm
  ctx.save();
  ctx.translate(x + size * 0.28, y - size * 0.18 - bounce);
  ctx.rotate(armSwing * 0.7 + leanForward);
  // Upper arm
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.08, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(-size * 0.02, size * 0.22, size * 0.055, size * 0.1, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Fist
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.arc(-size * 0.04, size * 0.32, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- HEAD with detailed features ---
  const headY = y - size * 0.52 - bounce;

  // Neck
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.32 - bounce, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head shape
  const headGrad = ctx.createRadialGradient(x - size * 0.05, headY - size * 0.05, 0, x, headY, size * 0.2);
  headGrad.addColorStop(0, skinHighlight);
  headGrad.addColorStop(0.7, skinTone);
  headGrad.addColorStop(1, skinShadow);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Short athletic hair
  ctx.fillStyle = "#2d1f1a";
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.02, size * 0.17, Math.PI * 1.15, Math.PI * 1.85);
  ctx.quadraticCurveTo(x, headY - size * 0.22, x, headY - size * 0.18);
  ctx.fill();

  // Sweatband
  const bandGrad = ctx.createLinearGradient(x - size * 0.2, headY, x + size * 0.2, headY);
  bandGrad.addColorStop(0, bodyColorDark);
  bandGrad.addColorStop(0.5, bodyColor);
  bandGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bandGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.19, Math.PI * 1.05, Math.PI * 1.95);
  ctx.arc(x, headY, size * 0.15, Math.PI * 1.95, Math.PI * 1.05, true);
  ctx.closePath();
  ctx.fill();
  // Sweatband logo
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.15, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Determined eyebrows
  ctx.strokeStyle = "#3d2d1a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, headY - size * 0.06);
  ctx.lineTo(x - size * 0.04, headY - size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.04, headY - size * 0.04);
  ctx.lineTo(x + size * 0.12, headY - size * 0.06);
  ctx.stroke();

  // Focused eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.07, headY + size * 0.01, size * 0.04, size * 0.03, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.07, headY + size * 0.01, size * 0.04, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupils (looking ahead)
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(x - size * 0.065 + size * 0.01, headY + size * 0.01, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.075 + size * 0.01, headY + size * 0.01, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.moveTo(x, headY + size * 0.02);
  ctx.lineTo(x - size * 0.025, headY + size * 0.08);
  ctx.lineTo(x + size * 0.025, headY + size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Determined mouth (slight grimace of effort)
  ctx.strokeStyle = "#8b5a4a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, headY + size * 0.12);
  ctx.quadraticCurveTo(x, headY + size * 0.1, x + size * 0.05, headY + size * 0.12);
  ctx.stroke();

  // Sweat droplets (effort effect)
  ctx.fillStyle = "rgba(135, 206, 250, 0.6)";
  const sweatPhase = (time * 3) % 1;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.2, headY + sweatPhase * size * 0.3, size * 0.02, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - size * 0.18, headY + size * 0.05 + sweatPhase * size * 0.2, size * 0.015, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawProtestorEnemy(
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
  // CAMPUS PROTESTOR - Passionate student activist with detailed sign and outfit
  const isAttacking = attackPhase > 0;
  const attackIntensity = isAttacking ? 1.4 : 1; // More vigorous when attacking
  const signWave = Math.sin(time * 4.5 * attackIntensity) * (isAttacking ? 0.25 : 0.18);
  const marchBob = Math.abs(Math.sin(time * 7 * attackIntensity)) * 3 * zoom;
  const legPhase = Math.sin(time * 7 * attackIntensity);
  const chantPhase = Math.sin(time * 8 * attackIntensity);
  const armRaise = 0.1 + Math.abs(Math.sin(time * 4 * attackIntensity)) * (isAttacking ? 0.25 : 0.15);

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.4, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- LEGS (jeans with details) ---
  const jeansColor = "#2d4263";
  const jeansDark = "#1e2d4a";
  const jeansLight = "#3d5273";

  // Back leg
  ctx.save();
  ctx.translate(x - size * 0.1, y + size * 0.15 - marchBob);
  ctx.rotate(legPhase * 0.25);
  // Jeans leg
  const legGrad = ctx.createLinearGradient(-size * 0.08, 0, size * 0.08, 0);
  legGrad.addColorStop(0, jeansDark);
  legGrad.addColorStop(0.5, jeansColor);
  legGrad.addColorStop(1, jeansDark);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, 0);
  ctx.lineTo(-size * 0.08, size * 0.32);
  ctx.lineTo(size * 0.08, size * 0.32);
  ctx.lineTo(size * 0.1, 0);
  ctx.closePath();
  ctx.fill();
  // Jeans cuff
  ctx.fillStyle = jeansLight;
  ctx.fillRect(-size * 0.09, size * 0.28, size * 0.18, size * 0.04);
  // Sneaker
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.09, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  // Sneaker accent
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(-size * 0.03, size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front leg
  ctx.save();
  ctx.translate(x + size * 0.1, y + size * 0.15 - marchBob);
  ctx.rotate(-legPhase * 0.25);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, 0);
  ctx.lineTo(-size * 0.08, size * 0.32);
  ctx.lineTo(size * 0.08, size * 0.32);
  ctx.lineTo(size * 0.1, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = jeansLight;
  ctx.fillRect(-size * 0.09, size * 0.28, size * 0.18, size * 0.04);
  // Sneaker
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.09, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(-size * 0.03, size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- HOODIE BODY with details ---
  const hoodieGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  hoodieGrad.addColorStop(0, bodyColorDark);
  hoodieGrad.addColorStop(0.3, bodyColor);
  hoodieGrad.addColorStop(0.7, bodyColor);
  hoodieGrad.addColorStop(1, bodyColorDark);

  // Main hoodie body
  ctx.fillStyle = hoodieGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.18 - marchBob);
  ctx.quadraticCurveTo(x - size * 0.38, y - size * 0.1 - marchBob, x - size * 0.25, y - size * 0.28 - marchBob);
  ctx.lineTo(x + size * 0.25, y - size * 0.28 - marchBob);
  ctx.quadraticCurveTo(x + size * 0.38, y - size * 0.1 - marchBob, x + size * 0.32, y + size * 0.18 - marchBob);
  ctx.closePath();
  ctx.fill();

  // Hoodie front pocket
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.05 - marchBob);
  ctx.quadraticCurveTo(x, y + size * 0.12 - marchBob, x + size * 0.2, y + size * 0.05 - marchBob);
  ctx.lineTo(x + size * 0.18, y + size * 0.15 - marchBob);
  ctx.quadraticCurveTo(x, y + size * 0.18 - marchBob, x - size * 0.18, y + size * 0.15 - marchBob);
  ctx.closePath();
  ctx.fill();
  // Pocket opening
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.08 - marchBob);
  ctx.quadraticCurveTo(x, y + size * 0.12 - marchBob, x + size * 0.15, y + size * 0.08 - marchBob);
  ctx.stroke();

  // Hoodie strings
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.2 - marchBob);
  ctx.lineTo(x - size * 0.1, y + size * 0.02 - marchBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.2 - marchBob);
  ctx.lineTo(x + size * 0.1, y + size * 0.02 - marchBob);
  ctx.stroke();
  // String aglets
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y + size * 0.04 - marchBob, size * 0.015, size * 0.03, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y + size * 0.04 - marchBob, size * 0.015, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- SIGN POLE ---
  const poleX = x + size * 0.22;
  const poleTopY = y - size * 0.85 - marchBob;
  ctx.strokeStyle = "#5d4037";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(poleX, y + size * 0.05 - marchBob);
  ctx.lineTo(poleX + signWave * size * 0.5, poleTopY);
  ctx.stroke();
  // Wood grain detail
  ctx.strokeStyle = "#8d6e63";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(poleX - size * 0.01, y - size * 0.2 - marchBob);
  ctx.lineTo(poleX + signWave * size * 0.3, y - size * 0.5 - marchBob);
  ctx.stroke();

  // --- PROTEST SIGN ---
  ctx.save();
  ctx.translate(poleX + signWave * size * 0.5, poleTopY - size * 0.15);
  ctx.rotate(signWave * 0.8);

  // Sign board with dimension
  ctx.fillStyle = "#f0f0e8";
  ctx.beginPath();
  ctx.moveTo(-size * 0.38, -size * 0.22);
  ctx.lineTo(size * 0.38, -size * 0.22);
  ctx.lineTo(size * 0.4, -size * 0.2);
  ctx.lineTo(size * 0.4, size * 0.18);
  ctx.lineTo(size * 0.38, size * 0.2);
  ctx.lineTo(-size * 0.38, size * 0.2);
  ctx.closePath();
  ctx.fill();
  // Sign edge shadow
  ctx.fillStyle = "#d0d0c8";
  ctx.beginPath();
  ctx.moveTo(size * 0.38, -size * 0.22);
  ctx.lineTo(size * 0.4, -size * 0.2);
  ctx.lineTo(size * 0.4, size * 0.18);
  ctx.lineTo(size * 0.38, size * 0.2);
  ctx.lineTo(size * 0.38, -size * 0.22);
  ctx.fill();
  // Sign border
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 3 * zoom;
  ctx.strokeRect(-size * 0.36, -size * 0.2, size * 0.72, size * 0.38);

  // Sign text - "GO TIGERS!"
  ctx.fillStyle = bodyColor;
  ctx.font = `bold ${size * 0.14}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GO", 0, -size * 0.08);
  ctx.fillStyle = "#000";
  ctx.font = `bold ${size * 0.12}px sans-serif`;
  ctx.fillText("TIGERS!", 0, size * 0.06);

  // Decorative stars
  ctx.fillStyle = bodyColorLight;
  ctx.font = `${size * 0.08}px sans-serif`;
  ctx.fillText("★", -size * 0.28, -size * 0.08);
  ctx.fillText("★", size * 0.28, -size * 0.08);
  ctx.restore();

  // --- ARMS ---
  const skinTone = "#e8c4a0";
  const skinHighlight = "#f5dcc4";

  // Left arm (down, in pocket or relaxed)
  ctx.save();
  ctx.translate(x - size * 0.32, y - size * 0.12 - marchBob);
  // Hoodie sleeve
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.1, size * 0.1, size * 0.12, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(-size * 0.02, size * 0.25, size * 0.06, size * 0.1, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Hand in pocket area
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.arc(-size * 0.02, size * 0.35, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm (raised holding sign)
  ctx.save();
  ctx.translate(x + size * 0.28, y - size * 0.12 - marchBob);
  ctx.rotate(-armRaise);
  // Hoodie sleeve
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.08, size * 0.1, size * 0.12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Forearm reaching up
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(size * 0.03, -size * 0.22, size * 0.055, size * 0.12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Hand gripping pole
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.arc(size * 0.05, -size * 0.34, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- HEAD with beanie and expressive face ---
  const headX = x - size * 0.02;
  const headY = y - size * 0.42 - marchBob;

  // Neck
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(headX, y - size * 0.26 - marchBob, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const headGrad = ctx.createRadialGradient(headX - size * 0.03, headY - size * 0.03, 0, headX, headY, size * 0.18);
  headGrad.addColorStop(0, skinHighlight);
  headGrad.addColorStop(0.8, skinTone);
  headGrad.addColorStop(1, "#d4a574");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.17, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.16, headY, size * 0.03, size * 0.05, 0, 0, Math.PI * 2);
  ctx.ellipse(headX + size * 0.16, headY, size * 0.03, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Beanie with ribbed texture
  const beanieGrad = ctx.createLinearGradient(headX - size * 0.2, headY, headX + size * 0.2, headY);
  beanieGrad.addColorStop(0, bodyColorDark);
  beanieGrad.addColorStop(0.5, bodyColor);
  beanieGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = beanieGrad;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.02, size * 0.19, Math.PI * 0.95, Math.PI * 2.05);
  ctx.quadraticCurveTo(headX, headY - size * 0.28, headX, headY - size * 0.24);
  ctx.closePath();
  ctx.fill();

  // Beanie ribbing lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    const ribX = headX - size * 0.12 + i * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(ribX, headY - size * 0.08);
    ctx.quadraticCurveTo(ribX, headY - size * 0.18, ribX + size * 0.01, headY - size * 0.22);
    ctx.stroke();
  }

  // Beanie fold/cuff
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.04, size * 0.18, Math.PI * 0.98, Math.PI * 2.02);
  ctx.arc(headX, headY - size * 0.04, size * 0.15, Math.PI * 2.02, Math.PI * 0.98, true);
  ctx.closePath();
  ctx.fill();

  // Pom-pom with fluffy texture
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.3, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Pom-pom fluff detail
  ctx.fillStyle = bodyColorLight;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + time * 0.5;
    ctx.beginPath();
    ctx.arc(
      headX + Math.cos(angle) * size * 0.04,
      headY - size * 0.3 + Math.sin(angle) * size * 0.04,
      size * 0.025,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Expressive eyebrows (raised in enthusiasm)
  ctx.strokeStyle = "#4a3728";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.11, headY - size * 0.06 - chantPhase * size * 0.02);
  ctx.quadraticCurveTo(headX - size * 0.07, headY - size * 0.09 - chantPhase * size * 0.02, headX - size * 0.03, headY - size * 0.06);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.03, headY - size * 0.06);
  ctx.quadraticCurveTo(headX + size * 0.07, headY - size * 0.09 - chantPhase * size * 0.02, headX + size * 0.11, headY - size * 0.06 - chantPhase * size * 0.02);
  ctx.stroke();

  // Passionate eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.07, headY + size * 0.01, size * 0.035, size * 0.028, 0, 0, Math.PI * 2);
  ctx.ellipse(headX + size * 0.07, headY + size * 0.01, size * 0.035, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupils
  ctx.fillStyle = "#2d1f1a";
  ctx.beginPath();
  ctx.arc(headX - size * 0.065, headY + size * 0.01, size * 0.018, 0, Math.PI * 2);
  ctx.arc(headX + size * 0.075, headY + size * 0.01, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(headX - size * 0.07, headY, size * 0.006, 0, Math.PI * 2);
  ctx.arc(headX + size * 0.07, headY, size * 0.006, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.moveTo(headX, headY + size * 0.02);
  ctx.lineTo(headX - size * 0.02, headY + size * 0.07);
  ctx.lineTo(headX + size * 0.02, headY + size * 0.07);
  ctx.closePath();
  ctx.fill();

  // Open mouth (chanting!) - animated
  const mouthOpen = 0.03 + Math.abs(chantPhase) * 0.03;
  ctx.fillStyle = "#8b4a4a";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.12, size * 0.05, size * mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();
  // Teeth hint
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.rect(headX - size * 0.03, headY + size * 0.1, size * 0.06, size * 0.015);
  ctx.fill();
  // Tongue
  ctx.fillStyle = "#c77070";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.13, size * 0.025, size * 0.015, 0, 0, Math.PI);
  ctx.fill();

  // Rosy cheeks (passionate)
  ctx.fillStyle = "rgba(255, 150, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.1, headY + size * 0.05, size * 0.03, size * 0.02, 0, 0, Math.PI * 2);
  ctx.ellipse(headX + size * 0.1, headY + size * 0.05, size * 0.03, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
}

// =====================================================
// SWAMP REGION TROOPS
// =====================================================

function drawBogCreatureEnemy(
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
  // BOG LURKER - Shambling eldritch swamp abomination with writhing tendrils
  const isAttacking = attackPhase > 0;
  const sway = Math.sin(time * 2) * 0.12;
  const drip = (time * 2) % 1;
  const pulse = 0.85 + Math.sin(time * 3) * 0.15;
  const breathe = Math.sin(time * 1.5) * 0.03;
  size *= 1.4; // Larger size

  // Toxic aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  auraGrad.addColorStop(0, "rgba(34, 197, 94, 0)");
  auraGrad.addColorStop(0.7, `rgba(34, 197, 94, ${pulse * 0.08})`);
  auraGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Deep shadow with murky puddle
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.55, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Murky water reflection
  ctx.fillStyle = "rgba(34, 87, 22, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.1, y + size * 0.48, size * 0.25, size * 0.08, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Writhing tentacle roots emerging from below
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 4 * zoom;
  for (let t = 0; t < 5; t++) {
    const angle = (t / 5) * Math.PI * 2 + time * 0.5;
    const tentacleWave = Math.sin(time * 3 + t * 1.2) * 0.15;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * size * 0.3, y + size * 0.35);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * size * (0.45 + tentacleWave),
      y + size * 0.2,
      x + Math.cos(angle) * size * (0.5 + tentacleWave * 0.5),
      y + size * 0.4
    );
    ctx.stroke();
  }

  // Massive muddy legs with exposed bone/roots
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.22, y + size * 0.2, size * 0.18, size * 0.3, sway * 0.25, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.22, y + size * 0.2, size * 0.18, size * 0.3, -sway * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  // Root-like veins on legs
  ctx.strokeStyle = "#1a2e05";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.05);
  ctx.lineTo(x - size * 0.25, y + size * 0.35);
  ctx.moveTo(x - size * 0.18, y + size * 0.1);
  ctx.lineTo(x - size * 0.15, y + size * 0.3);
  ctx.moveTo(x + size * 0.22, y + size * 0.05);
  ctx.lineTo(x + size * 0.25, y + size * 0.35);
  ctx.stroke();

  // Main body - twisted amorphous mass with rib-like protrusions
  const bodyGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.5, x + size * 0.3, y + size * 0.2);
  bodyGrad.addColorStop(0, bodyColorDark);
  bodyGrad.addColorStop(0.4, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y);
  ctx.quadraticCurveTo(x - size * 0.55, y - size * 0.35, x - size * 0.25, y - size * 0.6);
  ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.72 + sway * size * 0.1 + breathe * size, x, y - size * 0.65);
  ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.72 + sway * size * 0.1 + breathe * size, x + size * 0.25, y - size * 0.6);
  ctx.quadraticCurveTo(x + size * 0.55, y - size * 0.35, x + size * 0.45, y);
  ctx.quadraticCurveTo(x + size * 0.35, y + size * 0.15, x, y + size * 0.15);
  ctx.quadraticCurveTo(x - size * 0.35, y + size * 0.15, x - size * 0.45, y);
  ctx.fill();

  // Exposed rib-like structures
  ctx.strokeStyle = "#2d1f0d";
  ctx.lineWidth = 3 * zoom;
  for (let r = 0; r < 4; r++) {
    const ribY = y - size * 0.1 - r * size * 0.12;
    const ribCurve = Math.sin(time * 2 + r) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35 + ribCurve, ribY);
    ctx.quadraticCurveTo(x - size * 0.15, ribY - size * 0.05, x, ribY);
    ctx.quadraticCurveTo(x + size * 0.15, ribY - size * 0.05, x + size * 0.35 - ribCurve, ribY);
    ctx.stroke();
  }

  // Rotting flesh patches with different textures
  ctx.fillStyle = "rgba(82, 54, 25, 0.6)";
  for (let i = 0; i < 7; i++) {
    const patchX = x + Math.sin(i * 1.2 + time * 0.3) * size * 0.25;
    const patchY = y - size * 0.25 + Math.cos(i * 1.7) * size * 0.2;
    const patchSize = size * (0.06 + Math.sin(i) * 0.03);
    ctx.beginPath();
    ctx.ellipse(patchX, patchY, patchSize, patchSize * 0.7, i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Oozing slime trails with bioluminescence
  ctx.fillStyle = `rgba(132, 204, 22, ${0.6 + Math.sin(time * 4) * 0.2})`;
  for (let d = 0; d < 5; d++) {
    const dripX = x - size * 0.25 + d * size * 0.12;
    const dripPhase = (drip + d * 0.2) % 1;
    const dripY = y - size * 0.1 + dripPhase * size * 0.5;
    const dripLength = size * (0.08 + dripPhase * 0.06);
    ctx.beginPath();
    ctx.ellipse(dripX, dripY, size * 0.025, dripLength, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shoulder growths/tumors
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x - size * 0.38, y - size * 0.35, size * 0.12, 0, Math.PI * 2);
  ctx.arc(x + size * 0.35, y - size * 0.3, size * 0.1, 0, Math.PI * 2);
  ctx.arc(x - size * 0.32, y - size * 0.22, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Glowing pustules
  ctx.fillStyle = `rgba(162, 255, 82, ${pulse * 0.8})`;
  ctx.shadowColor = "#84cc16";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.38, y - size * 0.35, size * 0.05, 0, Math.PI * 2);
  ctx.arc(x + size * 0.25, y - size * 0.15, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x - size * 0.15, y, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Multiple glowing eyes in asymmetric positions (eldritch horror style)
  ctx.fillStyle = "#84cc16";
  ctx.shadowColor = "#84cc16";
  ctx.shadowBlur = 12 * zoom;
  // Main eyes
  ctx.beginPath();
  ctx.arc(x - size * 0.18, y - size * 0.42, size * 0.08, 0, Math.PI * 2);
  ctx.arc(x + size * 0.12, y - size * 0.4, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Extra smaller eyes
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y - size * 0.35, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x - size * 0.08, y - size * 0.52, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.02, y - size * 0.38, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Slit pupils with vertical orientation
  ctx.fillStyle = "#0a1f05";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.18, y - size * 0.42, size * 0.025, size * 0.05, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.12, y - size * 0.4, size * 0.02, size * 0.045, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.25, y - size * 0.35, size * 0.012, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gaping mouth with jagged teeth
  ctx.fillStyle = "#0d0d0d";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.25, size * 0.12, size * 0.08 + (isAttacking ? size * 0.05 : 0), 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Jagged teeth
  ctx.fillStyle = "#a8a29e";
  for (let tooth = 0; tooth < 6; tooth++) {
    const toothX = x - size * 0.08 + tooth * size * 0.032;
    const toothHeight = size * (0.04 + Math.sin(tooth * 1.5) * 0.015);
    ctx.beginPath();
    ctx.moveTo(toothX, y - size * 0.29);
    ctx.lineTo(toothX + size * 0.015, y - size * 0.29 + toothHeight);
    ctx.lineTo(toothX + size * 0.03, y - size * 0.29);
    ctx.fill();
  }

  // Fungal/moss growths on head with spores
  ctx.fillStyle = "#166534";
  ctx.beginPath();
  ctx.arc(x - size * 0.15, y - size * 0.62, size * 0.07, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.6, size * 0.06, 0, Math.PI * 2);
  ctx.arc(x + size * 0.2, y - size * 0.55, size * 0.045, 0, Math.PI * 2);
  ctx.arc(x - size * 0.05, y - size * 0.67, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  
  // Fungal stalks
  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.55);
  ctx.lineTo(x - size * 0.15, y - size * 0.68);
  ctx.moveTo(x + size * 0.08, y - size * 0.52);
  ctx.lineTo(x + size * 0.1, y - size * 0.65);
  ctx.stroke();

  // Floating spores
  ctx.fillStyle = `rgba(132, 204, 22, ${0.5 + Math.sin(time * 2) * 0.3})`;
  for (let s = 0; s < 6; s++) {
    const sporeX = x + Math.sin(time * 1.5 + s * 1.1) * size * 0.5;
    const sporeY = y - size * 0.4 + Math.cos(time * 2 + s * 0.8) * size * 0.3;
    ctx.beginPath();
    ctx.arc(sporeX, sporeY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWillOWispEnemy(
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
  // WILL-O'-WISP - Malevolent spirit of the drowned dead, lures travelers to doom
  const isAttacking = attackPhase > 0;
  const float = Math.sin(time * 2.5) * size * 0.2;
  const pulse = 0.6 + Math.sin(time * 4) * 0.4;
  const flicker = 0.75 + Math.random() * 0.25;
  const spiralTime = time * 1.5;
  size *= 1.5; // Larger size

  // Haunting aura - multiple layers
  for (let layer = 3; layer >= 0; layer--) {
    const layerSize = size * (0.9 + layer * 0.25);
    const layerAlpha = pulse * 0.12 * (1 - layer * 0.2) * flicker;
    const glowGrad = ctx.createRadialGradient(x, y + float, 0, x, y + float, layerSize);
    glowGrad.addColorStop(0, `rgba(180, 255, 120, ${layerAlpha * 0.8})`);
    glowGrad.addColorStop(0.3, `rgba(132, 204, 22, ${layerAlpha})`);
    glowGrad.addColorStop(0.6, `rgba(74, 222, 128, ${layerAlpha * 0.5})`);
    glowGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y + float, layerSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spectral energy trails spiraling around
  ctx.strokeStyle = `rgba(180, 255, 150, ${pulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let spiral = 0; spiral < 3; spiral++) {
    const spiralOffset = spiral * (Math.PI * 2 / 3);
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = spiralTime + spiralOffset + t * Math.PI * 2;
      const radius = size * (0.3 + t * 0.4);
      const sx = x + Math.cos(angle) * radius;
      const sy = y + float + Math.sin(angle) * radius * 0.5 - t * size * 0.3;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // Outer flame wisps - ethereal tendrils
  ctx.fillStyle = `rgba(132, 204, 22, ${pulse * 0.6 * flicker})`;
  for (let w = 0; w < 5; w++) {
    const wispAngle = (w / 5) * Math.PI * 2 + time * 1.2;
    const wispDist = size * (0.35 + Math.sin(time * 3 + w) * 0.1);
    const wispX = x + Math.cos(wispAngle) * wispDist;
    const wispY = y + float + Math.sin(wispAngle) * wispDist * 0.4;
    ctx.beginPath();
    ctx.moveTo(wispX, wispY + size * 0.15);
    ctx.quadraticCurveTo(
      wispX + Math.cos(wispAngle) * size * 0.15,
      wispY - size * 0.1,
      wispX,
      wispY - size * 0.2 - Math.sin(time * 5 + w) * size * 0.08
    );
    ctx.quadraticCurveTo(
      wispX - Math.cos(wispAngle) * size * 0.1,
      wispY,
      wispX,
      wispY + size * 0.15
    );
    ctx.fill();
  }

  // Main ethereal body - ghostly flame shape
  const bodyGrad = ctx.createLinearGradient(x, y - size * 0.5 + float, x, y + size * 0.4 + float);
  bodyGrad.addColorStop(0, `rgba(220, 255, 200, ${pulse * flicker})`);
  bodyGrad.addColorStop(0.3, bodyColorLight);
  bodyGrad.addColorStop(0.7, bodyColor);
  bodyGrad.addColorStop(1, `rgba(74, 222, 128, ${pulse * 0.3})`);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.55 + float + Math.sin(time * 6) * size * 0.05);
  ctx.bezierCurveTo(
    x + size * 0.25, y - size * 0.4 + float,
    x + size * 0.4, y - size * 0.1 + float,
    x + size * 0.3, y + size * 0.2 + float
  );
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.35 + float, x, y + size * 0.4 + float);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.35 + float, x - size * 0.3, y + size * 0.2 + float);
  ctx.bezierCurveTo(
    x - size * 0.4, y - size * 0.1 + float,
    x - size * 0.25, y - size * 0.4 + float,
    x, y - size * 0.55 + float + Math.sin(time * 6) * size * 0.05
  );
  ctx.fill();

  // Inner spectral layers
  ctx.fillStyle = `rgba(200, 255, 180, ${pulse * 0.7 * flicker})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4 + float);
  ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.15 + float, x + size * 0.15, y + size * 0.15 + float);
  ctx.quadraticCurveTo(x, y + size * 0.25 + float, x - size * 0.15, y + size * 0.15 + float);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.15 + float, x, y - size * 0.4 + float);
  ctx.fill();

  // Bright core with pulsing heart
  const coreGrad = ctx.createRadialGradient(x, y - size * 0.05 + float, 0, x, y - size * 0.05 + float, size * 0.2);
  coreGrad.addColorStop(0, `rgba(255, 255, 255, ${pulse * flicker})`);
  coreGrad.addColorStop(0.4, `rgba(220, 255, 200, ${pulse * 0.8})`);
  coreGrad.addColorStop(1, "rgba(132, 204, 22, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05 + float, size * 0.18 * pulse, size * 0.22 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ghostly skull face emerging from within
  ctx.fillStyle = `rgba(0, 0, 0, ${pulse * 0.5})`;
  // Eye sockets - hollow and menacing
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.12 + float, size * 0.06, size * 0.08, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.12 + float, size * 0.06, size * 0.08, 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner eye glow - sinister
  ctx.fillStyle = `rgba(255, 255, 200, ${pulse * flicker})`;
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.12 + float, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.12 + float, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Nose cavity
  ctx.fillStyle = `rgba(0, 0, 0, ${pulse * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.02 + float);
  ctx.lineTo(x - size * 0.025, y + size * 0.04 + float);
  ctx.lineTo(x + size * 0.025, y + size * 0.04 + float);
  ctx.closePath();
  ctx.fill();

  // Screaming mouth
  ctx.fillStyle = `rgba(0, 0, 0, ${pulse * 0.45})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.12 + float, size * 0.08, size * 0.05 + (isAttacking ? size * 0.03 : 0), 0, 0, Math.PI * 2);
  ctx.fill();

  // Descending soul trails
  ctx.strokeStyle = `rgba(132, 204, 22, ${pulse * 0.35})`;
  ctx.lineWidth = 3 * zoom;
  for (let t = 0; t < 4; t++) {
    const trailPhase = (time * 1.5 + t * 0.5) % 1;
    const trailX = x + Math.sin(t * 2.1) * size * 0.25;
    ctx.beginPath();
    ctx.moveTo(trailX, y + size * 0.3 + float);
    ctx.quadraticCurveTo(
      trailX + Math.sin(time * 3 + t) * size * 0.15,
      y + size * 0.5 + trailPhase * size * 0.3 + float,
      trailX + Math.sin(time * 4 + t) * size * 0.2,
      y + size * 0.7 + trailPhase * size * 0.4 + float
    );
    ctx.stroke();
  }

  // Floating ember particles
  ctx.fillStyle = `rgba(200, 255, 150, ${pulse * 0.8})`;
  for (let p = 0; p < 8; p++) {
    const particleAngle = time * 2 + p * 0.8;
    const particleDist = size * (0.4 + Math.sin(time * 3 + p) * 0.15);
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y + float - size * 0.2 + Math.sin(particleAngle * 0.7) * size * 0.2;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02 + Math.sin(time * 5 + p) * size * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSwampTrollEnemy(
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
  // SWAMP TROLL - Massive corrupted brute covered in parasitic growths and ancient rot
  const isAttacking = attackPhase > 0;
  const breathe = Math.sin(time * 1.2) * 0.06;
  const stomp = Math.abs(Math.sin(time * 2.5)) * 4 * zoom;
  const rage = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.1 : 0;
  const muscleFlexPhase = Math.sin(time * 2) * 0.03;
  size *= 1.3; // Larger size

  // Ground impact crater shadow
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.55, size * 0.65, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Murky footprint puddles
  ctx.fillStyle = "rgba(34, 87, 22, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.25, y + size * 0.5, size * 0.15, size * 0.06, -0.2, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.3, y + size * 0.48, size * 0.12, size * 0.05, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Massive tree-trunk legs with bark-like texture
  const legGrad = ctx.createLinearGradient(x - size * 0.3, y, x - size * 0.2, y + size * 0.4);
  legGrad.addColorStop(0, bodyColor);
  legGrad.addColorStop(0.5, bodyColorDark);
  legGrad.addColorStop(1, "#1a1a0a");
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.28, y + size * 0.25 - stomp * 0.4, size * 0.22, size * 0.35, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.28, y + size * 0.28, size * 0.22, size * 0.35, 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Leg bark/skin texture
  ctx.strokeStyle = "#2d2a1a";
  ctx.lineWidth = 2 * zoom;
  for (let leg = -1; leg <= 1; leg += 2) {
    for (let line = 0; line < 4; line++) {
      ctx.beginPath();
      ctx.moveTo(x + leg * size * 0.18, y + size * 0.05 + line * size * 0.1);
      ctx.lineTo(x + leg * size * 0.35, y + size * 0.1 + line * size * 0.12);
      ctx.stroke();
    }
  }

  // Massive hunched body with muscle definition
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.2, 0, x, y - size * 0.2, size * 0.7);
  bodyGrad.addColorStop(0, bodyColor);
  bodyGrad.addColorStop(0.6, bodyColorDark);
  bodyGrad.addColorStop(1, "#1a2010");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.55, y + size * 0.05);
  ctx.quadraticCurveTo(x - size * 0.65 + muscleFlexPhase * size, y - size * 0.35, x - size * 0.4, y - size * 0.6);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.75 + breathe * size, x, y - size * 0.72 + breathe * size);
  ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.75 + breathe * size, x + size * 0.4, y - size * 0.6);
  ctx.quadraticCurveTo(x + size * 0.65 - muscleFlexPhase * size, y - size * 0.35, x + size * 0.55, y + size * 0.05);
  ctx.quadraticCurveTo(x + size * 0.3, y + size * 0.2, x, y + size * 0.18);
  ctx.quadraticCurveTo(x - size * 0.3, y + size * 0.2, x - size * 0.55, y + size * 0.05);
  ctx.fill();

  // Spine ridges along the back
  ctx.fillStyle = "#2d3a1a";
  for (let spine = 0; spine < 5; spine++) {
    const spineX = x - size * 0.15 + spine * size * 0.08;
    const spineY = y - size * 0.55 - Math.sin(spine * 0.8) * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(spineX - size * 0.03, spineY + size * 0.05);
    ctx.lineTo(spineX, spineY - size * 0.08 - Math.sin(time * 2 + spine) * size * 0.02);
    ctx.lineTo(spineX + size * 0.03, spineY + size * 0.05);
    ctx.fill();
  }

  // Rotting belly with exposed ribs/wounds
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.08, size * 0.35, size * 0.28 + breathe * size, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wound/scar marks on belly
  ctx.strokeStyle = "#4a1a1a";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.05);
  ctx.moveTo(x + size * 0.05, y - size * 0.2);
  ctx.lineTo(x + size * 0.2, y);
  ctx.stroke();

  // Massive arms with exposed muscle
  ctx.fillStyle = bodyColor;
  // Left arm - raised for attack
  const leftArmRaise = isAttacking ? rage * size * 0.3 : 0;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.7 - muscleFlexPhase * size, y - size * 0.1 - leftArmRaise, x - size * 0.65, y + size * 0.25 - leftArmRaise);
  ctx.quadraticCurveTo(x - size * 0.55, y + size * 0.35 - leftArmRaise, x - size * 0.45, y + size * 0.28 - leftArmRaise);
  ctx.quadraticCurveTo(x - size * 0.5, y, x - size * 0.42, y - size * 0.28);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y - size * 0.35);
  ctx.quadraticCurveTo(x + size * 0.7 + muscleFlexPhase * size, y - size * 0.05, x + size * 0.65, y + size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.55, y + size * 0.4, x + size * 0.45, y + size * 0.32);
  ctx.quadraticCurveTo(x + size * 0.5, y + size * 0.05, x + size * 0.42, y - size * 0.28);
  ctx.fill();

  // Forearm muscle striations
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.55, y - size * 0.15 - leftArmRaise);
  ctx.lineTo(x - size * 0.6, y + size * 0.1 - leftArmRaise);
  ctx.moveTo(x + size * 0.55, y - size * 0.1);
  ctx.lineTo(x + size * 0.58, y + size * 0.15);
  ctx.stroke();

  // Massive boulder-crushing fists with claws
  ctx.fillStyle = "#2a2a1a";
  ctx.beginPath();
  ctx.arc(x - size * 0.62, y + size * 0.32 - leftArmRaise, size * 0.15, 0, Math.PI * 2);
  ctx.arc(x + size * 0.62, y + size * 0.35, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Claws
  ctx.fillStyle = "#1a1a0a";
  for (let claw = 0; claw < 3; claw++) {
    // Left hand claws
    const clawAngle = -0.5 + claw * 0.3;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.62 + Math.cos(clawAngle) * size * 0.12, y + size * 0.32 - leftArmRaise + Math.sin(clawAngle) * size * 0.12);
    ctx.lineTo(x - size * 0.62 + Math.cos(clawAngle) * size * 0.22, y + size * 0.32 - leftArmRaise + Math.sin(clawAngle) * size * 0.18);
    ctx.lineTo(x - size * 0.62 + Math.cos(clawAngle + 0.15) * size * 0.12, y + size * 0.32 - leftArmRaise + Math.sin(clawAngle + 0.15) * size * 0.12);
    ctx.fill();
    // Right hand claws
    ctx.beginPath();
    ctx.moveTo(x + size * 0.62 + Math.cos(-clawAngle) * size * 0.12, y + size * 0.35 + Math.sin(-clawAngle) * size * 0.12);
    ctx.lineTo(x + size * 0.62 + Math.cos(-clawAngle) * size * 0.22, y + size * 0.35 + Math.sin(-clawAngle) * size * 0.18);
    ctx.lineTo(x + size * 0.62 + Math.cos(-clawAngle - 0.15) * size * 0.12, y + size * 0.35 + Math.sin(-clawAngle - 0.15) * size * 0.12);
    ctx.fill();
  }

  // Hunched shoulders with moss/barnacle growths
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.42, y - size * 0.45, size * 0.18, size * 0.14, -0.3, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.42, y - size * 0.45, size * 0.18, size * 0.14, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Small brutish head sunk into shoulders
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Heavy brow ridge casting shadow
  ctx.fillStyle = "#1a2010";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.64, size * 0.25, size * 0.1, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  
  // Brow ridge detail
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.62, size * 0.24, size * 0.08, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Rage-filled glowing eyes
  ctx.fillStyle = "#ef4444";
  ctx.shadowColor = "#ef4444";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.58, size * 0.055, size * 0.04, -0.2, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.58, size * 0.055, size * 0.04, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Tiny angry pupils
  ctx.fillStyle = "#1a0505";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.58, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.58, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Broken nose
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.55);
  ctx.lineTo(x - size * 0.04, y - size * 0.48);
  ctx.lineTo(x + size * 0.02, y - size * 0.46);
  ctx.closePath();
  ctx.fill();

  // Massive jaw with underbite and tusks
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.45, size * 0.18, size * 0.12, 0, 0, Math.PI);
  ctx.fill();
  
  // Yellowed tusks jutting upward
  ctx.fillStyle = "#d4c9a8";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.48);
  ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.55, x - size * 0.12, y - size * 0.62);
  ctx.lineTo(x - size * 0.1, y - size * 0.55);
  ctx.quadraticCurveTo(x - size * 0.12, y - size * 0.5, x - size * 0.1, y - size * 0.48);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.48);
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.55, x + size * 0.12, y - size * 0.62);
  ctx.lineTo(x + size * 0.1, y - size * 0.55);
  ctx.quadraticCurveTo(x + size * 0.12, y - size * 0.5, x + size * 0.1, y - size * 0.48);
  ctx.fill();
  
  // Tusk cracks/age
  ctx.strokeStyle = "#8a7a5a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y - size * 0.52);
  ctx.lineTo(x - size * 0.14, y - size * 0.57);
  ctx.moveTo(x + size * 0.13, y - size * 0.53);
  ctx.lineTo(x + size * 0.12, y - size * 0.58);
  ctx.stroke();

  // Parasitic moss and fungal growths on body
  ctx.fillStyle = "#166534";
  ctx.beginPath();
  ctx.arc(x - size * 0.4, y - size * 0.5, size * 0.1, 0, Math.PI * 2);
  ctx.arc(x + size * 0.38, y - size * 0.48, size * 0.09, 0, Math.PI * 2);
  ctx.arc(x - size * 0.35, y - size * 0.58, size * 0.06, 0, Math.PI * 2);
  ctx.arc(x + size * 0.45, y - size * 0.35, size * 0.07, 0, Math.PI * 2);
  ctx.arc(x - size * 0.5, y - size * 0.25, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  
  // Glowing fungal caps
  ctx.fillStyle = `rgba(132, 204, 22, ${0.6 + Math.sin(time * 3) * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.4, y - size * 0.52, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.38, y - size * 0.5, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Dripping slime/ichor
  ctx.fillStyle = `rgba(132, 204, 22, ${0.5 + Math.sin(time * 4) * 0.2})`;
  for (let drip = 0; drip < 4; drip++) {
    const dripX = x - size * 0.3 + drip * size * 0.2;
    const dripPhase = (time * 1.5 + drip * 0.3) % 1;
    const dripY = y - size * 0.3 + dripPhase * size * 0.4;
    ctx.beginPath();
    ctx.ellipse(dripX, dripY, size * 0.02, size * 0.05 + dripPhase * size * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rage steam/breath when attacking
  if (isAttacking) {
    ctx.fillStyle = `rgba(100, 150, 80, ${attackPhase * 0.4})`;
    for (let steam = 0; steam < 3; steam++) {
      const steamX = x + Math.sin(time * 8 + steam) * size * 0.15;
      const steamY = y - size * 0.45 - attackPhase * size * 0.2 - steam * size * 0.08;
      ctx.beginPath();
      ctx.arc(steamX, steamY, size * 0.06 * (1 - steam * 0.2), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// =====================================================
// DESERT REGION TROOPS
// =====================================================

function drawNomadEnemy(
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
  // DESERT NOMAD - Cursed wanderer of the endless sands, bound by ancient dark pacts
  const isAttacking = attackPhase > 0;
  const walk = Math.sin(time * 4) * 0.08;
  const robeSway = Math.sin(time * 2.5) * 0.06;
  const cloakBillow = Math.sin(time * 3) * 0.04;
  const runeGlow = 0.5 + Math.sin(time * 3) * 0.5;
  size *= 1.35; // Larger size

  // Sandstorm aura around feet
  ctx.fillStyle = `rgba(194, 154, 108, ${0.15 + Math.sin(time * 5) * 0.08})`;
  for (let dust = 0; dust < 6; dust++) {
    const dustAngle = time * 2 + dust * 1.05;
    const dustDist = size * (0.3 + Math.sin(time * 4 + dust) * 0.1);
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(dustAngle) * dustDist,
      y + size * 0.35 + Math.sin(dustAngle * 0.5) * size * 0.05,
      size * 0.06,
      0, Math.PI * 2
    );
    ctx.fill();
  }

  // Deep shadow
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trailing shadow wisps
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  for (let trail = 0; trail < 3; trail++) {
    const trailX = x - size * 0.3 - trail * size * 0.12;
    const trailY = y + size * 0.35 + Math.sin(time * 3 + trail) * size * 0.05;
    ctx.beginPath();
    ctx.ellipse(trailX, trailY, size * 0.08, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tattered flowing robe with layered cloth
  const robeGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.4, x + size * 0.3, y + size * 0.4);
  robeGrad.addColorStop(0, bodyColorDark);
  robeGrad.addColorStop(0.4, bodyColor);
  robeGrad.addColorStop(0.8, bodyColorDark);
  robeGrad.addColorStop(1, "#1a1510");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.4);
  ctx.quadraticCurveTo(x - size * 0.5 + cloakBillow * size, y + size * 0.1, x - size * 0.35, y - size * 0.25);
  ctx.quadraticCurveTo(x - size * 0.25, y - size * 0.5 + robeSway * size, x, y - size * 0.55);
  ctx.quadraticCurveTo(x + size * 0.25, y - size * 0.5 + robeSway * size, x + size * 0.35, y - size * 0.25);
  ctx.quadraticCurveTo(x + size * 0.5 - cloakBillow * size, y + size * 0.1, x + size * 0.4, y + size * 0.4);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.45 + walk * size, x, y + size * 0.4);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.45 - walk * size, x - size * 0.4, y + size * 0.4);
  ctx.fill();

  // Tattered robe edges
  ctx.fillStyle = bodyColorDark;
  for (let tatter = 0; tatter < 7; tatter++) {
    const tatterX = x - size * 0.35 + tatter * size * 0.12;
    const tatterLen = size * (0.06 + Math.sin(tatter * 1.5) * 0.03);
    const tatterSway = Math.sin(time * 4 + tatter * 0.8) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(tatterX - size * 0.02, y + size * 0.38);
    ctx.lineTo(tatterX + tatterSway, y + size * 0.38 + tatterLen);
    ctx.lineTo(tatterX + size * 0.02, y + size * 0.38);
    ctx.fill();
  }

  // Multiple robe fold lines for depth
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1.5 * zoom;
  for (let fold = 0; fold < 4; fold++) {
    const foldX = x - size * 0.2 + fold * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(foldX, y - size * 0.2 + fold * size * 0.05);
    ctx.quadraticCurveTo(foldX + size * 0.02, y + size * 0.1, foldX - size * 0.01, y + size * 0.38);
    ctx.stroke();
  }

  // Ancient rune markings on robe (glowing)
  ctx.strokeStyle = `rgba(251, 191, 36, ${runeGlow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  // Left rune
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.1);
  ctx.lineTo(x - size * 0.25, y + size * 0.05);
  ctx.lineTo(x - size * 0.15, y + size * 0.05);
  ctx.lineTo(x - size * 0.2, y + size * 0.15);
  ctx.stroke();
  // Right rune
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y);
  ctx.lineTo(x + size * 0.2, y + size * 0.1);
  ctx.lineTo(x + size * 0.1, y + size * 0.08);
  ctx.moveTo(x + size * 0.18, y + size * 0.05);
  ctx.arc(x + size * 0.15, y + size * 0.05, size * 0.03, 0, Math.PI * 2);
  ctx.stroke();

  // Inner robe layer
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05, size * 0.22, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Concealed hands with dark magic
  ctx.fillStyle = "#2a2520";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.32, y + size * 0.05, size * 0.08, size * 0.06, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Magic glow from hidden hand
  ctx.fillStyle = `rgba(251, 191, 36, ${runeGlow * 0.4})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.32, y + size * 0.05, size * 0.04 + runeGlow * size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Deep hood casting darkness
  const hoodGrad = ctx.createLinearGradient(x, y - size * 0.65, x, y - size * 0.25);
  hoodGrad.addColorStop(0, bodyColor);
  hoodGrad.addColorStop(0.4, bodyColorDark);
  hoodGrad.addColorStop(1, "#0a0805");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.3);
  ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.55, x - size * 0.15, y - size * 0.68);
  ctx.quadraticCurveTo(x, y - size * 0.72 + robeSway * size * 0.5, x + size * 0.15, y - size * 0.68);
  ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.55, x + size * 0.28, y - size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.15, y - size * 0.22, x, y - size * 0.2);
  ctx.quadraticCurveTo(x - size * 0.15, y - size * 0.22, x - size * 0.28, y - size * 0.3);
  ctx.fill();

  // Hood edge detail
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.32);
  ctx.quadraticCurveTo(x, y - size * 0.22, x + size * 0.25, y - size * 0.32);
  ctx.stroke();

  // Face in absolute darkness
  ctx.fillStyle = "#050505";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.4, size * 0.15, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes from the void
  ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + runeGlow * 0.3})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.07, y - size * 0.43, size * 0.035, size * 0.025, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.07, y - size * 0.43, size * 0.035, size * 0.025, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Faint skull-like features in the darkness
  ctx.strokeStyle = `rgba(50, 40, 30, ${0.4 + Math.sin(time * 2) * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.38);
  ctx.lineTo(x, y - size * 0.33);
  ctx.lineTo(x + size * 0.03, y - size * 0.38);
  ctx.stroke();

  // Ornate cursed staff with skull
  ctx.strokeStyle = "#3d2914";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y - size * 0.35);
  ctx.lineTo(x + size * 0.35, y + size * 0.45);
  ctx.stroke();
  
  // Staff wood grain
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.29, y - size * 0.2);
  ctx.lineTo(x + size * 0.32, y + size * 0.1);
  ctx.moveTo(x + size * 0.31, y);
  ctx.lineTo(x + size * 0.34, y + size * 0.3);
  ctx.stroke();

  // Skull ornament on staff
  ctx.fillStyle = "#d4c9a8";
  ctx.beginPath();
  ctx.arc(x + size * 0.28, y - size * 0.45, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Skull eye sockets
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y - size * 0.47, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.31, y - size * 0.47, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Skull glowing eyes
  ctx.fillStyle = `rgba(251, 191, 36, ${runeGlow})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y - size * 0.47, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.31, y - size * 0.47, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Skull jaw
  ctx.fillStyle = "#c4b998";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.28, y - size * 0.4, size * 0.05, size * 0.03, 0, 0, Math.PI);
  ctx.fill();

  // Floating sand/dust particles
  ctx.fillStyle = `rgba(194, 154, 108, ${0.5 + Math.sin(time * 2) * 0.3})`;
  for (let p = 0; p < 8; p++) {
    const pAngle = time * 1.5 + p * 0.8;
    const pDist = size * (0.4 + Math.sin(time * 2 + p) * 0.15);
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle * 0.6) * size * 0.3;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark magic tendrils when attacking
  if (isAttacking) {
    ctx.strokeStyle = `rgba(251, 146, 60, ${attackPhase * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let tendril = 0; tendril < 4; tendril++) {
      const tAngle = attackPhase * Math.PI * 2 + tendril * (Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(x - size * 0.32, y + size * 0.05);
      ctx.quadraticCurveTo(
        x - size * 0.32 + Math.cos(tAngle) * size * 0.3,
        y + size * 0.05 + Math.sin(tAngle) * size * 0.2,
        x - size * 0.32 + Math.cos(tAngle) * size * 0.5,
        y + size * 0.05 + Math.sin(tAngle) * size * 0.35
      );
      ctx.stroke();
    }
  }
}

function drawScorpionEnemy(
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
  // GIANT SCORPION - Ancient armored desert predator with venomous stinger
  const isAttacking = attackPhase > 0;
  const legWave = Math.sin(time * 6);
  const tailSway = Math.sin(time * 2.5) * 0.25;
  const clawSnap = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.4 : 0;
  const breathe = Math.sin(time * 2) * 0.02;
  const venomDrip = (time * 2) % 1;
  size *= 1.5; // Larger size

  // Ground disturbance shadow
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.35, size * 0.65, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Disturbed sand around creature
  ctx.fillStyle = "rgba(139, 119, 89, 0.3)";
  for (let sand = 0; sand < 8; sand++) {
    const sandAngle = sand * (Math.PI / 4) + time * 0.3;
    const sandDist = size * (0.5 + Math.sin(time * 2 + sand) * 0.08);
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(sandAngle) * sandDist,
      y + size * 0.32 + Math.sin(sandAngle * 0.5) * size * 0.05,
      size * 0.08,
      size * 0.03,
      sandAngle,
      0, Math.PI * 2
    );
    ctx.fill();
  }

  // Armored segmented legs (4 on each side) with joints
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 4; leg++) {
      const legPhase = legWave + leg * 0.6;
      const legBaseX = x + side * (size * 0.12 + leg * size * 0.1);
      const legMidX = legBaseX + side * size * 0.22;
      const legEndX = legBaseX + side * size * 0.4;
      const legMidY = y + size * 0.12 + Math.sin(legPhase) * size * 0.08;
      const legEndY = y + size * 0.3;
      
      // Leg segments with gradient
      const legGrad = ctx.createLinearGradient(legBaseX, y, legEndX, legEndY);
      legGrad.addColorStop(0, bodyColor);
      legGrad.addColorStop(1, bodyColorDark);
      
      ctx.strokeStyle = legGrad;
      ctx.lineWidth = 5 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(legBaseX, y + size * 0.08);
      ctx.lineTo(legMidX, legMidY);
      ctx.lineTo(legEndX, legEndY);
      ctx.stroke();
      
      // Leg joints
      ctx.fillStyle = bodyColorDark;
      ctx.beginPath();
      ctx.arc(legMidX, legMidY, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
      
      // Leg spikes/hairs
      ctx.strokeStyle = "#1a1510";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(legMidX, legMidY);
      ctx.lineTo(legMidX + side * size * 0.05, legMidY - size * 0.06);
      ctx.stroke();
    }
  }

  // Rear body segment (abdomen)
  const abdomenGrad = ctx.createRadialGradient(x, y + size * 0.08, 0, x, y + size * 0.08, size * 0.35);
  abdomenGrad.addColorStop(0, bodyColorLight);
  abdomenGrad.addColorStop(0.5, bodyColor);
  abdomenGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdomenGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.08, size * 0.4 + breathe * size, size * 0.25 + breathe * size, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Abdomen armor plating lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  for (let plate = 0; plate < 4; plate++) {
    const plateY = y - size * 0.05 + plate * size * 0.08;
    ctx.beginPath();
    ctx.ellipse(x, plateY, size * 0.35 - plate * size * 0.03, size * 0.02, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Thorax/middle segment
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 0.32, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head/carapace with armored plates
  const headGrad = ctx.createLinearGradient(x, y - size * 0.35, x, y - size * 0.1);
  headGrad.addColorStop(0, bodyColorDark);
  headGrad.addColorStop(0.5, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.22, size * 0.28, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head armor ridges
  ctx.strokeStyle = "#1a1510";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.32);
  ctx.lineTo(x, y - size * 0.25);
  ctx.lineTo(x + size * 0.15, y - size * 0.32);
  ctx.stroke();

  // Mandibles
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.35);
  ctx.lineTo(x - size * 0.12, y - size * 0.42);
  ctx.lineTo(x - size * 0.05, y - size * 0.38);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.35);
  ctx.lineTo(x + size * 0.12, y - size * 0.42);
  ctx.lineTo(x + size * 0.05, y - size * 0.38);
  ctx.fill();

  // Massive crushing pincers
  // Left pincer arm
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.15);
  ctx.quadraticCurveTo(x - size * 0.4, y - size * 0.2, x - size * 0.5, y - size * 0.3);
  ctx.lineTo(x - size * 0.45, y - size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.25, x - size * 0.22, y - size * 0.18);
  ctx.fill();
  
  // Left claw with serrated edges
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.3);
  ctx.lineTo(x - size * 0.55 - clawSnap * size * 0.12, y - size * 0.42);
  ctx.lineTo(x - size * 0.58 - clawSnap * size * 0.1, y - size * 0.5);
  ctx.lineTo(x - size * 0.52, y - size * 0.42);
  ctx.lineTo(x - size * 0.48 + clawSnap * size * 0.08, y - size * 0.35);
  ctx.lineTo(x - size * 0.45, y - size * 0.35);
  ctx.closePath();
  ctx.fill();
  // Claw serrations
  ctx.fillStyle = "#1a1510";
  for (let serr = 0; serr < 3; serr++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.52 - clawSnap * size * 0.06, y - size * 0.38 - serr * size * 0.04);
    ctx.lineTo(x - size * 0.55 - clawSnap * size * 0.06, y - size * 0.4 - serr * size * 0.04);
    ctx.lineTo(x - size * 0.52 - clawSnap * size * 0.06, y - size * 0.42 - serr * size * 0.04);
    ctx.fill();
  }

  // Right pincer arm
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.15);
  ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.2, x + size * 0.5, y - size * 0.3);
  ctx.lineTo(x + size * 0.45, y - size * 0.35);
  ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.25, x + size * 0.22, y - size * 0.18);
  ctx.fill();
  
  // Right claw
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y - size * 0.3);
  ctx.lineTo(x + size * 0.55 + clawSnap * size * 0.12, y - size * 0.42);
  ctx.lineTo(x + size * 0.58 + clawSnap * size * 0.1, y - size * 0.5);
  ctx.lineTo(x + size * 0.52, y - size * 0.42);
  ctx.lineTo(x + size * 0.48 - clawSnap * size * 0.08, y - size * 0.35);
  ctx.lineTo(x + size * 0.45, y - size * 0.35);
  ctx.closePath();
  ctx.fill();
  // Claw serrations
  ctx.fillStyle = "#1a1510";
  for (let serr = 0; serr < 3; serr++) {
    ctx.beginPath();
    ctx.moveTo(x + size * 0.52 + clawSnap * size * 0.06, y - size * 0.38 - serr * size * 0.04);
    ctx.lineTo(x + size * 0.55 + clawSnap * size * 0.06, y - size * 0.4 - serr * size * 0.04);
    ctx.lineTo(x + size * 0.52 + clawSnap * size * 0.06, y - size * 0.42 - serr * size * 0.04);
    ctx.fill();
  }

  // Articulated segmented tail curving upward
  let tailX = x + size * 0.05;
  let tailY = y + size * 0.2;
  const tailSegments = 7;
  for (let seg = 0; seg < tailSegments; seg++) {
    const segProgress = seg / tailSegments;
    const segSize = size * (0.12 - seg * 0.012);
    const tailCurve = Math.pow(segProgress, 1.5) * Math.PI * 0.6;
    const segSway = tailSway * (1 + seg * 0.15);
    
    tailX += Math.cos(tailCurve + segSway) * size * 0.08;
    tailY -= Math.sin(tailCurve + segSway) * size * 0.1;
    
    const segGrad = ctx.createRadialGradient(tailX, tailY, 0, tailX, tailY, segSize);
    segGrad.addColorStop(0, bodyColorLight);
    segGrad.addColorStop(0.6, bodyColor);
    segGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = segGrad;
    ctx.beginPath();
    ctx.arc(tailX, tailY, segSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Segment armor lines
    if (seg > 0) {
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.arc(tailX, tailY, segSize * 0.8, 0, Math.PI);
      ctx.stroke();
    }
  }

  // Venomous stinger bulb
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(tailX + size * 0.05, tailY - size * 0.03, size * 0.08, size * 0.06, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Deadly stinger
  const stingerGrad = ctx.createLinearGradient(tailX + size * 0.08, tailY, tailX + size * 0.2, tailY - size * 0.15);
  stingerGrad.addColorStop(0, "#4a1a1a");
  stingerGrad.addColorStop(0.5, "#7c2d12");
  stingerGrad.addColorStop(1, "#0a0505");
  ctx.fillStyle = stingerGrad;
  ctx.beginPath();
  ctx.moveTo(tailX + size * 0.08, tailY - size * 0.02);
  ctx.quadraticCurveTo(tailX + size * 0.15, tailY - size * 0.08, tailX + size * 0.2, tailY - size * 0.2);
  ctx.lineTo(tailX + size * 0.12, tailY - size * 0.05);
  ctx.lineTo(tailX + size * 0.08, tailY + size * 0.02);
  ctx.closePath();
  ctx.fill();
  
  // Venom drip glow
  ctx.fillStyle = `rgba(34, 197, 94, ${0.7 + Math.sin(time * 4) * 0.3})`;
  ctx.shadowColor = "#22c55e";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(tailX + size * 0.19, tailY - size * 0.18 + venomDrip * size * 0.05, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Dripping venom
  if (venomDrip > 0.3) {
    ctx.fillStyle = `rgba(34, 197, 94, ${(1 - venomDrip) * 0.8})`;
    ctx.beginPath();
    ctx.ellipse(tailX + size * 0.19, tailY - size * 0.1 + venomDrip * size * 0.15, size * 0.015, size * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Multiple glowing eyes (8 eyes like a real scorpion)
  ctx.fillStyle = "#1a0505";
  // Central pair
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.28, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.28, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Side pairs
  ctx.beginPath();
  ctx.arc(x - size * 0.15, y - size * 0.24, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.15, y - size * 0.24, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x - size * 0.18, y - size * 0.2, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.18, y - size * 0.2, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye glow
  ctx.fillStyle = `rgba(220, 38, 38, ${0.6 + Math.sin(time * 3) * 0.3})`;
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.28, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.28, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Attack stance venom spray
  if (isAttacking && attackPhase > 0.5) {
    ctx.fillStyle = `rgba(34, 197, 94, ${(attackPhase - 0.5) * 0.5})`;
    for (let spray = 0; spray < 5; spray++) {
      const sprayAngle = -Math.PI * 0.3 + spray * 0.15 + Math.sin(time * 10) * 0.1;
      const sprayDist = (attackPhase - 0.5) * 2 * size * 0.4;
      ctx.beginPath();
      ctx.arc(
        tailX + size * 0.2 + Math.cos(sprayAngle) * sprayDist,
        tailY - size * 0.2 + Math.sin(sprayAngle) * sprayDist,
        size * 0.02,
        0, Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function drawScarabEnemy(
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
  // SACRED SCARAB - Cursed undying beetle infused with dark pharaonic magic
  const isAttacking = attackPhase > 0;
  const legScuttle = Math.sin(time * 12) * 0.25;
  const wingFlutter = Math.sin(time * 15) * 0.15;
  const runeGlow = 0.5 + Math.sin(time * 3) * 0.5;
  const shimmer = 0.7 + Math.sin(time * 8) * 0.3;
  const hoverFloat = Math.sin(time * 4) * size * 0.03;
  size *= 1.8; // Much larger size

  // Mystical aura
  const auraGrad = ctx.createRadialGradient(x, y + hoverFloat, 0, x, y + hoverFloat, size * 0.7);
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${runeGlow * 0.15})`);
  auraGrad.addColorStop(0.5, `rgba(217, 119, 6, ${runeGlow * 0.08})`);
  auraGrad.addColorStop(1, "rgba(180, 83, 9, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y + hoverFloat, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Shadow with magical distortion
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.3, size * 0.4 + Math.sin(time * 5) * size * 0.02, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Articulated legs with joints (3 pairs)
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 3; leg++) {
      const legPhase = legScuttle + leg * 0.8;
      const legBaseX = x + side * (size * 0.08 + leg * size * 0.08);
      const legBaseY = y + size * 0.05 + hoverFloat;
      const legMidX = legBaseX + side * size * 0.15;
      const legMidY = legBaseY + size * 0.08 + Math.sin(legPhase) * size * 0.04;
      const legEndX = legMidX + side * size * 0.12;
      const legEndY = y + size * 0.25;

      // Leg segments
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = 3 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(legBaseX, legBaseY);
      ctx.lineTo(legMidX, legMidY);
      ctx.lineTo(legEndX, legEndY);
      ctx.stroke();

      // Leg joints
      ctx.fillStyle = "#1a1510";
      ctx.beginPath();
      ctx.arc(legMidX, legMidY, size * 0.02, 0, Math.PI * 2);
      ctx.fill();

      // Leg spines
      ctx.strokeStyle = "#0a0805";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(legMidX, legMidY);
      ctx.lineTo(legMidX + side * size * 0.03, legMidY - size * 0.04);
      ctx.stroke();

      // Clawed feet
      ctx.fillStyle = "#0a0805";
      ctx.beginPath();
      ctx.moveTo(legEndX, legEndY);
      ctx.lineTo(legEndX + side * size * 0.03, legEndY + size * 0.02);
      ctx.lineTo(legEndX + side * size * 0.01, legEndY + size * 0.04);
      ctx.fill();
    }
  }

  // Main carapace with iridescent sheen
  const shellGrad = ctx.createRadialGradient(x - size * 0.1, y - size * 0.1 + hoverFloat, 0, x, y + hoverFloat, size * 0.35);
  shellGrad.addColorStop(0, bodyColorLight);
  shellGrad.addColorStop(0.3, bodyColor);
  shellGrad.addColorStop(0.7, bodyColorDark);
  shellGrad.addColorStop(1, "#1a1510");
  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + hoverFloat, size * 0.38, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell ridge pattern
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28 + hoverFloat);
  ctx.lineTo(x, y + size * 0.28 + hoverFloat);
  ctx.stroke();

  // Shell texture lines
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1 * zoom;
  for (let ridge = 0; ridge < 5; ridge++) {
    const ridgeOffset = (ridge - 2) * size * 0.08;
    ctx.beginPath();
    ctx.ellipse(x + ridgeOffset, y + hoverFloat, size * 0.03, size * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Wing cases with hieroglyphic patterns
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1 - wingFlutter * size, y + hoverFloat, size * 0.18, size * 0.24, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1 + wingFlutter * size, y + hoverFloat, size * 0.18, size * 0.24, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Glowing hieroglyphic runes on wings
  ctx.strokeStyle = `rgba(251, 191, 36, ${runeGlow * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  // Left wing runes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15 - wingFlutter * size, y - size * 0.1 + hoverFloat);
  ctx.lineTo(x - size * 0.1 - wingFlutter * size, y + hoverFloat);
  ctx.lineTo(x - size * 0.18 - wingFlutter * size, y + size * 0.1 + hoverFloat);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - size * 0.12 - wingFlutter * size, y - size * 0.05 + hoverFloat, size * 0.03, 0, Math.PI * 2);
  ctx.stroke();
  // Right wing runes
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15 + wingFlutter * size, y - size * 0.1 + hoverFloat);
  ctx.lineTo(x + size * 0.1 + wingFlutter * size, y + hoverFloat);
  ctx.lineTo(x + size * 0.18 + wingFlutter * size, y + size * 0.1 + hoverFloat);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.12 + wingFlutter * size, y - size * 0.05 + hoverFloat, size * 0.03, 0, Math.PI * 2);
  ctx.stroke();

  // Translucent wings visible beneath
  if (wingFlutter > 0.05) {
    ctx.fillStyle = `rgba(200, 180, 140, ${wingFlutter * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.2, y + hoverFloat, size * 0.25, size * 0.3, -0.2, 0, Math.PI * 2);
    ctx.ellipse(x + size * 0.2, y + hoverFloat, size * 0.25, size * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Armored head with horn
  const headGrad = ctx.createLinearGradient(x, y - size * 0.45 + hoverFloat, x, y - size * 0.25 + hoverFloat);
  headGrad.addColorStop(0, bodyColorDark);
  headGrad.addColorStop(0.5, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.33 + hoverFloat, size * 0.16, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head crest/horn
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.4 + hoverFloat);
  ctx.quadraticCurveTo(x, y - size * 0.55 + hoverFloat, x + size * 0.08, y - size * 0.4 + hoverFloat);
  ctx.lineTo(x + size * 0.05, y - size * 0.38 + hoverFloat);
  ctx.quadraticCurveTo(x, y - size * 0.48 + hoverFloat, x - size * 0.05, y - size * 0.38 + hoverFloat);
  ctx.closePath();
  ctx.fill();

  // Ornate antennae with fan-like tips
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.4 + hoverFloat);
  ctx.quadraticCurveTo(x - size * 0.12, y - size * 0.5 + hoverFloat, x - size * 0.18, y - size * 0.52 + hoverFloat);
  ctx.moveTo(x + size * 0.08, y - size * 0.4 + hoverFloat);
  ctx.quadraticCurveTo(x + size * 0.12, y - size * 0.5 + hoverFloat, x + size * 0.18, y - size * 0.52 + hoverFloat);
  ctx.stroke();

  // Antenna fan tips
  ctx.fillStyle = bodyColor;
  for (let fan = 0; fan < 3; fan++) {
    const fanAngle = -0.4 + fan * 0.2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.18, y - size * 0.52 + hoverFloat);
    ctx.lineTo(x - size * 0.18 + Math.cos(fanAngle) * size * 0.06, y - size * 0.52 + hoverFloat + Math.sin(fanAngle) * size * 0.06);
    ctx.lineTo(x - size * 0.18 + Math.cos(fanAngle + 0.1) * size * 0.04, y - size * 0.52 + hoverFloat + Math.sin(fanAngle + 0.1) * size * 0.04);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.18, y - size * 0.52 + hoverFloat);
    ctx.lineTo(x + size * 0.18 + Math.cos(-fanAngle) * size * 0.06, y - size * 0.52 + hoverFloat + Math.sin(-fanAngle) * size * 0.06);
    ctx.lineTo(x + size * 0.18 + Math.cos(-fanAngle - 0.1) * size * 0.04, y - size * 0.52 + hoverFloat + Math.sin(-fanAngle - 0.1) * size * 0.04);
    ctx.fill();
  }

  // Compound eyes with magical glow
  ctx.fillStyle = "#0a0805";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.35 + hoverFloat, size * 0.05, size * 0.04, -0.2, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.08, y - size * 0.35 + hoverFloat, size * 0.05, size * 0.04, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eye glow
  ctx.fillStyle = `rgba(251, 191, 36, ${runeGlow})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.35 + hoverFloat, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.35 + hoverFloat, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Mandibles
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.28 + hoverFloat);
  ctx.lineTo(x - size * 0.08, y - size * 0.22 + hoverFloat);
  ctx.lineTo(x - size * 0.02, y - size * 0.25 + hoverFloat);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05, y - size * 0.28 + hoverFloat);
  ctx.lineTo(x + size * 0.08, y - size * 0.22 + hoverFloat);
  ctx.lineTo(x + size * 0.02, y - size * 0.25 + hoverFloat);
  ctx.fill();

  // Iridescent shimmer highlights
  ctx.fillStyle = `rgba(255, 240, 200, ${shimmer * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.12, y - size * 0.08 + hoverFloat, size * 0.06, size * 0.1, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(200, 255, 220, ${shimmer * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.08, y + size * 0.05 + hoverFloat, size * 0.04, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Floating magical particles
  ctx.fillStyle = `rgba(251, 191, 36, ${runeGlow * 0.7})`;
  for (let p = 0; p < 6; p++) {
    const pAngle = time * 2 + p * 1.05;
    const pDist = size * (0.45 + Math.sin(time * 3 + p) * 0.1);
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + hoverFloat + Math.sin(pAngle * 0.7) * size * 0.2;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack burst effect
  if (isAttacking) {
    ctx.strokeStyle = `rgba(251, 191, 36, ${attackPhase * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let ray = 0; ray < 8; ray++) {
      const rayAngle = ray * (Math.PI / 4) + time * 3;
      const rayLen = attackPhase * size * 0.4;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(rayAngle) * size * 0.3, y + hoverFloat + Math.sin(rayAngle) * size * 0.2);
      ctx.lineTo(x + Math.cos(rayAngle) * (size * 0.3 + rayLen), y + hoverFloat + Math.sin(rayAngle) * (size * 0.2 + rayLen * 0.6));
      ctx.stroke();
    }
  }
}

// =====================================================
// WINTER REGION TROOPS
// =====================================================

function drawSnowGoblinEnemy(
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
  // FROST GOBLIN - Malevolent ice creature with frozen claws and cruel cunning
  const isAttacking = attackPhase > 0;
  const hop = Math.abs(Math.sin(time * 6)) * size * 0.12;
  const armWave = Math.sin(time * 5) * 0.35;
  const frostPulse = 0.6 + Math.sin(time * 3) * 0.4;
  const shiver = Math.sin(time * 20) * size * 0.01;
  size *= 1.6; // Larger size

  // Frost aura
  const frostGrad = ctx.createRadialGradient(x, y - hop, 0, x, y - hop, size * 0.7);
  frostGrad.addColorStop(0, `rgba(147, 197, 253, ${frostPulse * 0.1})`);
  frostGrad.addColorStop(0.5, `rgba(96, 165, 250, ${frostPulse * 0.05})`);
  frostGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = frostGrad;
  ctx.beginPath();
  ctx.arc(x, y - hop, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Ice crystal shadow
  ctx.fillStyle = "rgba(30, 58, 95, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.38, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Frozen footprints
  ctx.fillStyle = "rgba(147, 197, 253, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.15, y + size * 0.35, size * 0.08, size * 0.04, -0.2, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.15, y + size * 0.33, size * 0.08, size * 0.04, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Clawed feet with ice crystals
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.14 + shiver, y + size * 0.28 - hop, size * 0.1, size * 0.06, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.14 - shiver, y + size * 0.28 - hop, size * 0.1, size * 0.06, 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Foot claws
  ctx.fillStyle = "#1e3a5f";
  for (let foot = -1; foot <= 1; foot += 2) {
    for (let claw = 0; claw < 3; claw++) {
      const clawX = x + foot * size * 0.14 + (claw - 1) * size * 0.04 * foot;
      const clawY = y + size * 0.32 - hop;
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + foot * size * 0.02, clawY + size * 0.04);
      ctx.lineTo(clawX - foot * size * 0.01, clawY + size * 0.02);
      ctx.fill();
    }
  }

  // Hunched muscular body
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.05 - hop, 0, x, y - hop, size * 0.35);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x + shiver, y - size * 0.02 - hop, size * 0.28, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Frost patterns on body
  ctx.strokeStyle = `rgba(147, 197, 253, ${frostPulse * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15 - hop);
  ctx.lineTo(x - size * 0.1, y - size * 0.05 - hop);
  ctx.lineTo(x - size * 0.18, y + size * 0.05 - hop);
  ctx.moveTo(x + size * 0.12, y - size * 0.1 - hop);
  ctx.lineTo(x + size * 0.08, y + size * 0.02 - hop);
  ctx.stroke();

  // Icy belly patch
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.08 - hop, size * 0.15, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wiry muscular arms with frost claws
  ctx.fillStyle = bodyColor;
  // Left arm raised aggressively
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.1 - hop);
  ctx.quadraticCurveTo(
    x - size * 0.4 + armWave * size * 0.15,
    y - size * 0.2 - hop,
    x - size * 0.38 + armWave * size * 0.12,
    y - size * 0.35 - hop
  );
  ctx.lineTo(x - size * 0.32 + armWave * size * 0.1, y - size * 0.32 - hop);
  ctx.quadraticCurveTo(x - size * 0.32, y - size * 0.15 - hop, x - size * 0.22, y - size * 0.08 - hop);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.1 - hop);
  ctx.quadraticCurveTo(
    x + size * 0.4 - armWave * size * 0.15,
    y - size * 0.15 - hop,
    x + size * 0.38 - armWave * size * 0.12,
    y - size * 0.3 - hop
  );
  ctx.lineTo(x + size * 0.32 - armWave * size * 0.1, y - size * 0.27 - hop);
  ctx.quadraticCurveTo(x + size * 0.32, y - size * 0.12 - hop, x + size * 0.22, y - size * 0.08 - hop);
  ctx.fill();

  // Ice claws on hands
  ctx.fillStyle = `rgba(147, 197, 253, ${0.8 + frostPulse * 0.2})`;
  ctx.shadowColor = "#93c5fd";
  ctx.shadowBlur = 4 * zoom;
  for (let claw = 0; claw < 3; claw++) {
    // Left hand claws
    const leftClawAngle = -0.8 + claw * 0.3 + armWave * 0.2;
    const leftClawX = x - size * 0.38 + armWave * size * 0.12;
    const leftClawY = y - size * 0.35 - hop;
    ctx.beginPath();
    ctx.moveTo(leftClawX, leftClawY);
    ctx.lineTo(leftClawX + Math.cos(leftClawAngle) * size * 0.12, leftClawY + Math.sin(leftClawAngle) * size * 0.1);
    ctx.lineTo(leftClawX + Math.cos(leftClawAngle + 0.15) * size * 0.06, leftClawY + Math.sin(leftClawAngle + 0.15) * size * 0.05);
    ctx.fill();
    // Right hand claws
    const rightClawAngle = -2.3 - claw * 0.3 - armWave * 0.2;
    const rightClawX = x + size * 0.38 - armWave * size * 0.12;
    const rightClawY = y - size * 0.3 - hop;
    ctx.beginPath();
    ctx.moveTo(rightClawX, rightClawY);
    ctx.lineTo(rightClawX + Math.cos(rightClawAngle) * size * 0.12, rightClawY + Math.sin(rightClawAngle) * size * 0.1);
    ctx.lineTo(rightClawX + Math.cos(rightClawAngle - 0.15) * size * 0.06, rightClawY + Math.sin(rightClawAngle - 0.15) * size * 0.05);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Large cruel head
  const headGrad = ctx.createRadialGradient(x, y - size * 0.38 - hop, 0, x, y - size * 0.38 - hop, size * 0.28);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.6, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x + shiver, y - size * 0.38 - hop, size * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Spiky frost crown/hair
  ctx.fillStyle = `rgba(147, 197, 253, ${0.7 + frostPulse * 0.3})`;
  for (let spike = 0; spike < 5; spike++) {
    const spikeAngle = -Math.PI * 0.7 + spike * 0.35;
    const spikeLen = size * (0.15 + Math.sin(spike * 1.5) * 0.05);
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(spikeAngle) * size * 0.22,
      y - size * 0.38 - hop + Math.sin(spikeAngle) * size * 0.22
    );
    ctx.lineTo(
      x + Math.cos(spikeAngle) * (size * 0.22 + spikeLen),
      y - size * 0.38 - hop + Math.sin(spikeAngle) * (size * 0.22 + spikeLen * 0.8)
    );
    ctx.lineTo(
      x + Math.cos(spikeAngle + 0.15) * size * 0.22,
      y - size * 0.38 - hop + Math.sin(spikeAngle + 0.15) * size * 0.22
    );
    ctx.fill();
  }

  // Long wicked pointed ears with frost tips
  ctx.fillStyle = bodyColor;
  // Left ear
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.42 - hop);
  ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.5 - hop, x - size * 0.45, y - size * 0.6 - hop);
  ctx.lineTo(x - size * 0.38, y - size * 0.52 - hop);
  ctx.quadraticCurveTo(x - size * 0.28, y - size * 0.45 - hop, x - size * 0.2, y - size * 0.4 - hop);
  ctx.fill();
  // Right ear
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.42 - hop);
  ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.5 - hop, x + size * 0.45, y - size * 0.6 - hop);
  ctx.lineTo(x + size * 0.38, y - size * 0.52 - hop);
  ctx.quadraticCurveTo(x + size * 0.28, y - size * 0.45 - hop, x + size * 0.2, y - size * 0.4 - hop);
  ctx.fill();
  
  // Frost on ear tips
  ctx.fillStyle = `rgba(147, 197, 253, ${frostPulse * 0.8})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.45, y - size * 0.6 - hop, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.45, y - size * 0.6 - hop, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Deep-set malevolent eyes
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.4 - hop, size * 0.07, size * 0.08, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.4 - hop, size * 0.07, size * 0.08, 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Glowing icy irises
  ctx.fillStyle = `rgba(96, 165, 250, ${0.8 + frostPulse * 0.2})`;
  ctx.shadowColor = "#60a5fa";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.4 - hop, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.4 - hop, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Slit pupils
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.4 - hop, size * 0.012, size * 0.03, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.4 - hop, size * 0.012, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sharp-toothed grin
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28 - hop, size * 0.1, size * 0.05, 0, 0, Math.PI);
  ctx.fill();
  
  // Jagged teeth
  ctx.fillStyle = `rgba(147, 197, 253, ${0.9 + frostPulse * 0.1})`;
  for (let tooth = 0; tooth < 6; tooth++) {
    const toothX = x - size * 0.075 + tooth * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(toothX, y - size * 0.3 - hop);
    ctx.lineTo(toothX + size * 0.015, y - size * 0.26 - hop);
    ctx.lineTo(toothX + size * 0.03, y - size * 0.3 - hop);
    ctx.fill();
  }

  // Frost breath mist
  ctx.fillStyle = `rgba(147, 197, 253, ${0.3 + Math.sin(time * 4) * 0.15})`;
  for (let breath = 0; breath < 3; breath++) {
    const breathX = x + Math.sin(time * 3 + breath * 1.5) * size * 0.15;
    const breathY = y - size * 0.2 - hop - breath * size * 0.05;
    ctx.beginPath();
    ctx.arc(breathX, breathY, size * (0.04 - breath * 0.01), 0, Math.PI * 2);
    ctx.fill();
  }

  // Swirling ice crystals
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#93c5fd";
  ctx.shadowBlur = 4 * zoom;
  for (let c = 0; c < 6; c++) {
    const cx = x + Math.sin(time * 2.5 + c * 1.05) * size * 0.5;
    const cy = y - size * 0.35 + Math.cos(time * 2 + c * 1.2) * size * 0.3 - hop;
    const crystalSize = size * (0.035 + Math.sin(c) * 0.015);
    // 6-pointed ice crystal
    ctx.beginPath();
    for (let point = 0; point < 6; point++) {
      const angle = point * (Math.PI / 3) + time * 0.5;
      const px = cx + Math.cos(angle) * crystalSize;
      const py = cy + Math.sin(angle) * crystalSize;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Attack ice shards
  if (isAttacking) {
    ctx.fillStyle = `rgba(147, 197, 253, ${attackPhase * 0.7})`;
    for (let shard = 0; shard < 5; shard++) {
      const shardAngle = -Math.PI * 0.5 + shard * 0.25 - 0.5;
      const shardDist = attackPhase * size * 0.6;
      const shardX = x + Math.cos(shardAngle) * shardDist;
      const shardY = y - size * 0.3 - hop + Math.sin(shardAngle) * shardDist;
      ctx.beginPath();
      ctx.moveTo(shardX, shardY - size * 0.04);
      ctx.lineTo(shardX + size * 0.02, shardY);
      ctx.lineTo(shardX, shardY + size * 0.04);
      ctx.lineTo(shardX - size * 0.02, shardY);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawYetiEnemy(
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
  // ANCIENT YETI - Primordial ice titan, terror of the frozen wastes
  const isAttacking = attackPhase > 0;
  const breathe = Math.sin(time * 1.2) * 0.04;
  const stomp = Math.abs(Math.sin(time * 1.8)) * 5 * zoom;
  const roar = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.15 : 0;
  const chestHeave = Math.sin(time * 1.5) * 0.02;
  const frostPulse = 0.6 + Math.sin(time * 2.5) * 0.4;
  size *= 1.25; // Larger size

  // Blizzard aura effect
  const blizzardGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.0);
  blizzardGrad.addColorStop(0, "rgba(147, 197, 253, 0)");
  blizzardGrad.addColorStop(0.6, `rgba(147, 197, 253, ${frostPulse * 0.08})`);
  blizzardGrad.addColorStop(1, `rgba(96, 165, 250, ${frostPulse * 0.12})`);
  ctx.fillStyle = blizzardGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Ground frost crack shadow
  ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.6, size * 0.6, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Ice cracks radiating from feet
  ctx.strokeStyle = `rgba(147, 197, 253, ${frostPulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let crack = 0; crack < 6; crack++) {
    const crackAngle = crack * (Math.PI / 3) + Math.PI * 0.1;
    const crackLen = size * (0.35 + Math.sin(crack * 1.5) * 0.1);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(crackAngle) * size * 0.3, y + size * 0.55);
    ctx.lineTo(
      x + Math.cos(crackAngle) * crackLen,
      y + size * 0.55 + Math.sin(crackAngle * 0.3) * size * 0.08
    );
    ctx.stroke();
  }

  // Massive tree-trunk legs with thick fur
  const legGrad = ctx.createLinearGradient(x, y + size * 0.1, x, y + size * 0.5);
  legGrad.addColorStop(0, bodyColor);
  legGrad.addColorStop(0.7, bodyColorDark);
  legGrad.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.25, y + size * 0.32 - stomp * 0.3, size * 0.22, size * 0.32, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.25, y + size * 0.35, size * 0.22, size * 0.32, 0.12, 0, Math.PI * 2);
  ctx.fill();
  
  // Leg fur texture
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2 * zoom;
  for (let fur = 0; fur < 6; fur++) {
    const furY = y + size * 0.15 + fur * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.38, furY - stomp * 0.2);
    ctx.lineTo(x - size * 0.42, furY + size * 0.03 - stomp * 0.2);
    ctx.moveTo(x + size * 0.38, furY);
    ctx.lineTo(x + size * 0.42, furY + size * 0.03);
    ctx.stroke();
  }

  // Massive clawed feet
  ctx.fillStyle = "#1e3a5f";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.28, y + size * 0.55 - stomp * 0.15, size * 0.15, size * 0.08, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.28, y + size * 0.55, size * 0.15, size * 0.08, 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Foot claws
  ctx.fillStyle = "#0f172a";
  for (let foot = -1; foot <= 1; foot += 2) {
    for (let claw = 0; claw < 4; claw++) {
      const clawX = x + foot * size * 0.28 + (claw - 1.5) * size * 0.05 * foot;
      const clawY = y + size * 0.58 - (foot < 0 ? stomp * 0.15 : 0);
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + foot * size * 0.03, clawY + size * 0.06);
      ctx.lineTo(clawX - foot * size * 0.01, clawY + size * 0.03);
      ctx.fill();
    }
  }

  // Titanic furry body with muscle definition
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.15, 0, x, y - size * 0.1, size * 0.6);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.4, bodyColor);
  bodyGrad.addColorStop(0.8, bodyColorDark);
  bodyGrad.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.52, y + size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.6, y - size * 0.2, x - size * 0.45, y - size * 0.55);
  ctx.quadraticCurveTo(x - size * 0.25, y - size * 0.72 + breathe * size, x, y - size * 0.7 + breathe * size);
  ctx.quadraticCurveTo(x + size * 0.25, y - size * 0.72 + breathe * size, x + size * 0.45, y - size * 0.55);
  ctx.quadraticCurveTo(x + size * 0.6, y - size * 0.2, x + size * 0.52, y + size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.3, y + size * 0.2, x, y + size * 0.18);
  ctx.quadraticCurveTo(x - size * 0.3, y + size * 0.2, x - size * 0.52, y + size * 0.12);
  ctx.fill();

  // Chest muscle definition
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.12, y - size * 0.1 + chestHeave * size, size * 0.18, size * 0.22, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.12, y - size * 0.1 + chestHeave * size, size * 0.18, size * 0.22, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Ice crystals embedded in fur
  ctx.fillStyle = `rgba(147, 197, 253, ${0.6 + frostPulse * 0.3})`;
  for (let ice = 0; ice < 5; ice++) {
    const iceX = x - size * 0.3 + ice * size * 0.15;
    const iceY = y - size * 0.3 + Math.sin(ice * 1.8) * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(iceX, iceY - size * 0.05);
    ctx.lineTo(iceX + size * 0.025, iceY);
    ctx.lineTo(iceX, iceY + size * 0.05);
    ctx.lineTo(iceX - size * 0.025, iceY);
    ctx.closePath();
    ctx.fill();
  }

  // Enormous muscular arms
  ctx.fillStyle = bodyColor;
  // Left arm - potentially raised for attack
  const leftArmRaise = isAttacking ? roar * size * 0.4 : 0;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.48, y - size * 0.4);
  ctx.quadraticCurveTo(x - size * 0.68, y - size * 0.15 - leftArmRaise, x - size * 0.62, y + size * 0.22 - leftArmRaise);
  ctx.quadraticCurveTo(x - size * 0.5, y + size * 0.3 - leftArmRaise, x - size * 0.42, y + size * 0.22 - leftArmRaise);
  ctx.quadraticCurveTo(x - size * 0.48, y - size * 0.05 - leftArmRaise, x - size * 0.4, y - size * 0.35);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y - size * 0.4);
  ctx.quadraticCurveTo(x + size * 0.68, y - size * 0.1, x + size * 0.62, y + size * 0.28);
  ctx.quadraticCurveTo(x + size * 0.5, y + size * 0.35, x + size * 0.42, y + size * 0.28);
  ctx.quadraticCurveTo(x + size * 0.48, y, x + size * 0.4, y - size * 0.35);
  ctx.fill();

  // Arm fur highlights
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.55, y - size * 0.25 - leftArmRaise);
  ctx.lineTo(x - size * 0.58, y - size * 0.2 - leftArmRaise);
  ctx.moveTo(x + size * 0.55, y - size * 0.2);
  ctx.lineTo(x + size * 0.58, y - size * 0.15);
  ctx.stroke();

  // Massive crushing hands with claws
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x - size * 0.6, y + size * 0.28 - leftArmRaise, size * 0.14, 0, Math.PI * 2);
  ctx.arc(x + size * 0.6, y + size * 0.32, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  
  // Hand claws - ice-tipped
  ctx.fillStyle = `rgba(147, 197, 253, ${0.8 + frostPulse * 0.2})`;
  for (let hand = -1; hand <= 1; hand += 2) {
    const handY = hand < 0 ? y + size * 0.28 - leftArmRaise : y + size * 0.32;
    for (let claw = 0; claw < 4; claw++) {
      const clawAngle = (hand < 0 ? Math.PI * 0.6 : Math.PI * 0.4) + claw * 0.25 * hand;
      ctx.beginPath();
      ctx.moveTo(x + hand * size * 0.6 + Math.cos(clawAngle) * size * 0.1, handY + Math.sin(clawAngle) * size * 0.1);
      ctx.lineTo(x + hand * size * 0.6 + Math.cos(clawAngle) * size * 0.22, handY + Math.sin(clawAngle) * size * 0.18);
      ctx.lineTo(x + hand * size * 0.6 + Math.cos(clawAngle + 0.12) * size * 0.1, handY + Math.sin(clawAngle + 0.12) * size * 0.1);
      ctx.fill();
    }
  }

  // Massive head with feral features
  const headGrad = ctx.createRadialGradient(x, y - size * 0.55, 0, x, y - size * 0.55, size * 0.28);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.5, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.55, size * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Pronounced brow ridge
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.62, size * 0.25, size * 0.08, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Face fur pattern (lighter)
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.52, size * 0.18, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy angry brow
  ctx.strokeStyle = "#1e3a5f";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.65);
  ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.6, x - size * 0.05, y - size * 0.58);
  ctx.moveTo(x + size * 0.18, y - size * 0.65);
  ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.6, x + size * 0.05, y - size * 0.58);
  ctx.stroke();

  // Fierce glowing eyes
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.58, size * 0.055, size * 0.04, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.58, size * 0.055, size * 0.04, 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Icy blue glowing irises
  ctx.fillStyle = `rgba(14, 165, 233, ${0.8 + frostPulse * 0.2})`;
  ctx.shadowColor = "#0ea5e9";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.58, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.58, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Slit pupils
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.1, y - size * 0.58, size * 0.01, size * 0.025, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.1, y - size * 0.58, size * 0.01, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout/muzzle
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = "#1e3a5f";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.5, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Roaring mouth with massive fangs
  ctx.fillStyle = "#0f172a";
  const mouthOpen = Math.max(0.001, size * (0.06 + roar * 0.8));
  const mouthWidth = Math.max(0.001, size * 0.1 + roar * size * 0.05);
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.43, mouthWidth, mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();

  // Massive fangs
  ctx.fillStyle = "#f1f5f9";
  // Upper fangs
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.46);
  ctx.lineTo(x - size * 0.06, y - size * 0.38 - roar * size * 0.1);
  ctx.lineTo(x - size * 0.04, y - size * 0.46);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.46);
  ctx.lineTo(x + size * 0.06, y - size * 0.38 - roar * size * 0.1);
  ctx.lineTo(x + size * 0.04, y - size * 0.46);
  ctx.fill();
  // Lower fangs (when roaring)
  if (roar > 0.05) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.05, y - size * 0.4 + roar * size * 0.2);
    ctx.lineTo(x - size * 0.03, y - size * 0.46);
    ctx.lineTo(x - size * 0.01, y - size * 0.4 + roar * size * 0.2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.05, y - size * 0.4 + roar * size * 0.2);
    ctx.lineTo(x + size * 0.03, y - size * 0.46);
    ctx.lineTo(x + size * 0.01, y - size * 0.4 + roar * size * 0.2);
    ctx.fill();
  }

  // Small row of teeth
  ctx.fillStyle = "#e2e8f0";
  for (let tooth = 0; tooth < 4; tooth++) {
    const toothX = x - size * 0.04 + tooth * size * 0.025;
    ctx.beginPath();
    ctx.moveTo(toothX, y - size * 0.45);
    ctx.lineTo(toothX + size * 0.01, y - size * 0.42 - roar * size * 0.03);
    ctx.lineTo(toothX + size * 0.02, y - size * 0.45);
    ctx.fill();
  }

  // Frost breath - enhanced when attacking
  if (isAttacking && attackPhase > 0.2) {
    const breathIntensity = (attackPhase - 0.2) * 1.25;
    // Multiple breath layers
    for (let layer = 0; layer < 3; layer++) {
      const layerOffset = layer * 0.15;
      ctx.fillStyle = `rgba(200, 240, 255, ${breathIntensity * (0.4 - layer * 0.1)})`;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.42);
      ctx.quadraticCurveTo(
        x + size * (0.35 + layer * 0.1) + Math.sin(time * 10 + layer) * size * 0.05,
        y - size * (0.55 + layerOffset),
        x + size * (0.6 + layer * 0.15),
        y - size * (0.4 + layerOffset)
      );
      ctx.quadraticCurveTo(
        x + size * (0.35 + layer * 0.1),
        y - size * (0.35 + layerOffset),
        x,
        y - size * 0.42
      );
      ctx.fill();
    }
    
    // Ice particles in breath
    ctx.fillStyle = `rgba(255, 255, 255, ${breathIntensity * 0.8})`;
    for (let particle = 0; particle < 8; particle++) {
      const pProgress = (attackPhase * 2 + particle * 0.12) % 1;
      const px = x + pProgress * size * 0.7;
      const py = y - size * 0.45 + Math.sin(particle * 1.5 + time * 8) * size * 0.1;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ambient snow/frost particles
  ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 2) * 0.3})`;
  for (let snow = 0; snow < 10; snow++) {
    const snowX = x + Math.sin(time * 1.5 + snow * 0.65) * size * 0.7;
    const snowY = y - size * 0.2 + Math.cos(time * 1.2 + snow * 0.8) * size * 0.5;
    ctx.beginPath();
    ctx.arc(snowX, snowY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawIceWitchEnemy(
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
  // FROST WITCH - Ancient sorceress of the frozen wastes, her soul bound to eternal winter
  const isAttacking = attackPhase > 0;
  const float = Math.sin(time * 1.8) * size * 0.06;
  const capeFlow = Math.sin(time * 2.5) * 0.12;
  const orbPulse = 0.7 + Math.sin(time * 3.5) * 0.3;
  const runeGlow = 0.5 + Math.sin(time * 2) * 0.5;
  const breathMist = Math.sin(time * 4) * 0.3;
  size *= 1.35; // Larger size

  // Freezing aura emanating outward
  const auraGrad = ctx.createRadialGradient(x, y + float, 0, x, y + float, size * 0.9);
  auraGrad.addColorStop(0, `rgba(147, 197, 253, ${orbPulse * 0.12})`);
  auraGrad.addColorStop(0.5, `rgba(96, 165, 250, ${orbPulse * 0.08})`);
  auraGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y + float, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Frozen ground beneath - ice patch
  ctx.fillStyle = "rgba(147, 197, 253, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.5, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Ice cracks in frozen ground
  ctx.strokeStyle = `rgba(96, 165, 250, ${0.4 + runeGlow * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let crack = 0; crack < 5; crack++) {
    const crackAngle = crack * (Math.PI / 2.5) + 0.2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(crackAngle) * size * 0.15, y + size * 0.42);
    ctx.lineTo(x + Math.cos(crackAngle) * size * 0.45, y + size * 0.45 + Math.sin(crack) * size * 0.03);
    ctx.stroke();
  }

  // Shadow with icy tint
  ctx.fillStyle = "rgba(30, 58, 95, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.42, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trailing ice mist behind
  ctx.fillStyle = `rgba(147, 197, 253, ${0.2 + breathMist * 0.15})`;
  for (let mist = 0; mist < 4; mist++) {
    const mistX = x - size * 0.25 - mist * size * 0.1;
    const mistY = y + size * 0.3 + float + Math.sin(time * 3 + mist) * size * 0.05;
    ctx.beginPath();
    ctx.arc(mistX, mistY, size * (0.1 - mist * 0.015), 0, Math.PI * 2);
    ctx.fill();
  }

  // Elaborate flowing cape/robe with multiple layers
  // Back cape layer
  ctx.fillStyle = "#1e3a5f";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.42 + float);
  ctx.quadraticCurveTo(x - size * 0.55 + capeFlow * size, y + size * 0.1, x - size * 0.35, y - size * 0.25 + float);
  ctx.quadraticCurveTo(x, y - size * 0.35 + float, x + size * 0.35, y - size * 0.25 + float);
  ctx.quadraticCurveTo(x + size * 0.55 - capeFlow * size, y + size * 0.1, x + size * 0.42, y + size * 0.42 + float);
  ctx.quadraticCurveTo(x + size * 0.2, y + size * 0.5 + capeFlow * size * 0.5 + float, x, y + size * 0.45 + float);
  ctx.quadraticCurveTo(x - size * 0.2, y + size * 0.5 - capeFlow * size * 0.5 + float, x - size * 0.42, y + size * 0.42 + float);
  ctx.fill();

  // Main robe layer
  const robeGrad = ctx.createLinearGradient(x - size * 0.35, y - size * 0.3 + float, x + size * 0.3, y + size * 0.4 + float);
  robeGrad.addColorStop(0, bodyColorDark);
  robeGrad.addColorStop(0.4, bodyColor);
  robeGrad.addColorStop(0.7, bodyColorDark);
  robeGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.4 + float);
  ctx.quadraticCurveTo(x - size * 0.48 + capeFlow * size, y + size * 0.05, x - size * 0.28, y - size * 0.32 + float);
  ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.4 + float, x, y - size * 0.38 + float);
  ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.4 + float, x + size * 0.28, y - size * 0.32 + float);
  ctx.quadraticCurveTo(x + size * 0.48 - capeFlow * size, y + size * 0.05, x + size * 0.38, y + size * 0.4 + float);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.45 + capeFlow * size * 0.3 + float, x, y + size * 0.42 + float);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.45 - capeFlow * size * 0.3 + float, x - size * 0.38, y + size * 0.4 + float);
  ctx.fill();

  // Robe frost patterns
  ctx.strokeStyle = `rgba(147, 197, 253, ${runeGlow * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  // Frost vine pattern on robe
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.15 + float);
  ctx.quadraticCurveTo(x - size * 0.25, y + float, x - size * 0.15, y + size * 0.15 + float);
  ctx.quadraticCurveTo(x - size * 0.22, y + size * 0.25 + float, x - size * 0.18, y + size * 0.35 + float);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.1 + float);
  ctx.quadraticCurveTo(x + size * 0.2, y + size * 0.05 + float, x + size * 0.12, y + size * 0.2 + float);
  ctx.stroke();

  // Glowing runes on robe hem
  ctx.fillStyle = `rgba(96, 165, 250, ${runeGlow * 0.6})`;
  for (let rune = 0; rune < 5; rune++) {
    const runeX = x - size * 0.25 + rune * size * 0.12;
    const runeY = y + size * 0.32 + Math.sin(rune * 1.2) * size * 0.03 + float;
    ctx.beginPath();
    ctx.arc(runeX, runeY, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner dress/bodice
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.02 + float, size * 0.24, size * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Corset/bodice detail
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25 + float);
  ctx.lineTo(x, y + size * 0.2 + float);
  ctx.stroke();
  for (let lace = 0; lace < 4; lace++) {
    const laceY = y - size * 0.15 + lace * size * 0.1 + float;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.08, laceY);
    ctx.lineTo(x, laceY + size * 0.03);
    ctx.lineTo(x + size * 0.08, laceY);
    ctx.stroke();
  }

  // Skeletal hand holding staff
  ctx.fillStyle = "#c7d2fe";
  ctx.beginPath();
  ctx.ellipse(x + size * 0.18, y + size * 0.05 + float, size * 0.06, size * 0.05, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Bony fingers
  ctx.strokeStyle = "#a5b4fc";
  ctx.lineWidth = 2 * zoom;
  for (let finger = 0; finger < 4; finger++) {
    const fingerAngle = 0.5 + finger * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.2, y + size * 0.08 + float);
    ctx.lineTo(
      x + size * 0.2 + Math.cos(fingerAngle) * size * 0.08,
      y + size * 0.08 + float + Math.sin(fingerAngle) * size * 0.06
    );
    ctx.stroke();
  }

  // Ornate ice staff
  ctx.strokeStyle = "#1e3a5f";
  ctx.lineWidth = 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.1 + float);
  ctx.lineTo(x + size * 0.28, y + size * 0.45 + float);
  ctx.stroke();
  
  // Staff ice coating
  const staffGrad = ctx.createLinearGradient(x + size * 0.18, y - size * 0.1 + float, x + size * 0.28, y + size * 0.45 + float);
  staffGrad.addColorStop(0, `rgba(147, 197, 253, ${0.8 + orbPulse * 0.2})`);
  staffGrad.addColorStop(0.5, `rgba(96, 165, 250, ${0.6 + orbPulse * 0.2})`);
  staffGrad.addColorStop(1, `rgba(59, 130, 246, ${0.4 + orbPulse * 0.2})`);
  ctx.strokeStyle = staffGrad;
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.1 + float);
  ctx.lineTo(x + size * 0.28, y + size * 0.45 + float);
  ctx.stroke();

  // Staff headpiece - crystalline formation
  ctx.fillStyle = "#1e3a5f";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.15 + float);
  ctx.lineTo(x + size * 0.12, y - size * 0.22 + float);
  ctx.lineTo(x + size * 0.18, y - size * 0.28 + float);
  ctx.lineTo(x + size * 0.24, y - size * 0.22 + float);
  ctx.closePath();
  ctx.fill();

  // Main ice orb on staff - multi-layered
  const orbX = x + size * 0.18;
  const orbY = y - size * 0.22 + float;
  const orbSize = size * (0.12 + orbPulse * 0.03);
  
  // Outer orb glow
  const outerOrbGrad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbSize * 1.5);
  outerOrbGrad.addColorStop(0, `rgba(147, 197, 253, ${orbPulse * 0.4})`);
  outerOrbGrad.addColorStop(0.5, `rgba(96, 165, 250, ${orbPulse * 0.2})`);
  outerOrbGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = outerOrbGrad;
  ctx.beginPath();
  ctx.arc(orbX, orbY, orbSize * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Main orb
  const mainOrbGrad = ctx.createRadialGradient(orbX - orbSize * 0.2, orbY - orbSize * 0.2, 0, orbX, orbY, orbSize);
  mainOrbGrad.addColorStop(0, `rgba(255, 255, 255, ${orbPulse})`);
  mainOrbGrad.addColorStop(0.3, `rgba(191, 219, 254, ${orbPulse})`);
  mainOrbGrad.addColorStop(0.6, `rgba(147, 197, 253, ${orbPulse * 0.9})`);
  mainOrbGrad.addColorStop(1, `rgba(59, 130, 246, ${orbPulse * 0.7})`);
  ctx.fillStyle = mainOrbGrad;
  ctx.shadowColor = "#60a5fa";
  ctx.shadowBlur = 15 * zoom * orbPulse;
  ctx.beginPath();
  ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Swirling energy inside orb
  ctx.strokeStyle = `rgba(255, 255, 255, ${orbPulse * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let swirl = 0; swirl < 2; swirl++) {
    const swirlAngle = time * 3 + swirl * Math.PI;
    ctx.beginPath();
    ctx.arc(orbX + Math.cos(swirlAngle) * orbSize * 0.4, orbY + Math.sin(swirlAngle) * orbSize * 0.4, orbSize * 0.3, 0, Math.PI);
    ctx.stroke();
  }

  // Elaborate hood with crown-like ice spikes
  const hoodGrad = ctx.createLinearGradient(x, y - size * 0.7 + float, x, y - size * 0.25 + float);
  hoodGrad.addColorStop(0, bodyColorDark);
  hoodGrad.addColorStop(0.5, bodyColor);
  hoodGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.28 + float);
  ctx.quadraticCurveTo(x - size * 0.32, y - size * 0.55 + float, x - size * 0.1, y - size * 0.7 + float);
  ctx.quadraticCurveTo(x, y - size * 0.75 + float, x + size * 0.1, y - size * 0.7 + float);
  ctx.quadraticCurveTo(x + size * 0.32, y - size * 0.55 + float, x + size * 0.25, y - size * 0.28 + float);
  ctx.quadraticCurveTo(x + size * 0.12, y - size * 0.22 + float, x, y - size * 0.2 + float);
  ctx.quadraticCurveTo(x - size * 0.12, y - size * 0.22 + float, x - size * 0.25, y - size * 0.28 + float);
  ctx.fill();

  // Ice crown spikes on hood
  ctx.fillStyle = `rgba(147, 197, 253, ${0.7 + orbPulse * 0.3})`;
  for (let spike = 0; spike < 5; spike++) {
    const spikeX = x - size * 0.12 + spike * size * 0.06;
    const spikeHeight = size * (0.1 + Math.sin(spike * 1.5) * 0.03);
    ctx.beginPath();
    ctx.moveTo(spikeX - size * 0.02, y - size * 0.65 + float);
    ctx.lineTo(spikeX, y - size * 0.65 - spikeHeight + float);
    ctx.lineTo(spikeX + size * 0.02, y - size * 0.65 + float);
    ctx.fill();
  }

  // Hood edge frost trim
  ctx.strokeStyle = `rgba(191, 219, 254, ${0.6 + runeGlow * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.3 + float);
  ctx.quadraticCurveTo(x, y - size * 0.22 + float, x + size * 0.22, y - size * 0.3 + float);
  ctx.stroke();

  // Face in deep shadow - gaunt and skeletal
  ctx.fillStyle = "#0a0a0f";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.4 + float, size * 0.14, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spectral face features
  ctx.fillStyle = `rgba(147, 197, 253, ${0.15 + runeGlow * 0.1})`;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.38 + float, size * 0.08, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Intensely glowing eyes
  ctx.fillStyle = `rgba(96, 165, 250, ${0.9 + orbPulse * 0.1})`;
  ctx.shadowColor = "#60a5fa";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + float, size * 0.035, size * 0.025, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + float, size * 0.035, size * 0.025, 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye inner glow
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.44 + float, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.44 + float, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Frost breath mist
  ctx.fillStyle = `rgba(191, 219, 254, ${0.3 + breathMist * 0.2})`;
  for (let breath = 0; breath < 3; breath++) {
    const bx = x + Math.sin(time * 4 + breath * 1.2) * size * 0.08;
    const by = y - size * 0.32 + float - breath * size * 0.04;
    ctx.beginPath();
    ctx.arc(bx, by, size * (0.03 - breath * 0.005), 0, Math.PI * 2);
    ctx.fill();
  }

  // Orbiting ice crystals
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#93c5fd";
  ctx.shadowBlur = 6 * zoom;
  for (let c = 0; c < 6; c++) {
    const angle = time * 2 + c * (Math.PI / 3);
    const orbitRadius = size * (0.4 + Math.sin(time * 1.5 + c) * 0.05);
    const cx = x + Math.cos(angle) * orbitRadius;
    const cy = y - size * 0.15 + float + Math.sin(angle * 0.5) * size * 0.2;
    const crystalSize = size * (0.04 + Math.sin(c) * 0.01);
    
    // 6-pointed ice crystal shape
    ctx.beginPath();
    for (let point = 0; point < 6; point++) {
      const pointAngle = point * (Math.PI / 3) + time * 0.5;
      const px = cx + Math.cos(pointAngle) * crystalSize;
      const py = cy + Math.sin(pointAngle) * crystalSize;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Spell casting effect when attacking
  if (isAttacking) {
    // Ice beam from staff
    ctx.strokeStyle = `rgba(147, 197, 253, ${attackPhase * 0.8})`;
    ctx.lineWidth = (3 + attackPhase * 4) * zoom;
    ctx.shadowColor = "#60a5fa";
    ctx.shadowBlur = 15 * zoom;
    ctx.beginPath();
    ctx.moveTo(orbX, orbY);
    ctx.lineTo(orbX + attackPhase * size * 0.8, orbY - attackPhase * size * 0.3);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Ice shards projectiles
    ctx.fillStyle = `rgba(191, 219, 254, ${attackPhase * 0.9})`;
    for (let shard = 0; shard < 5; shard++) {
      const shardProgress = (attackPhase + shard * 0.15) % 1;
      const sx = orbX + shardProgress * size * 0.8;
      const sy = orbY - shardProgress * size * 0.3 + Math.sin(shard * 2 + time * 10) * size * 0.08;
      ctx.beginPath();
      ctx.moveTo(sx, sy - size * 0.03);
      ctx.lineTo(sx + size * 0.02, sy);
      ctx.lineTo(sx, sy + size * 0.03);
      ctx.lineTo(sx - size * 0.02, sy);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// =====================================================
// VOLCANIC REGION TROOPS
// =====================================================

function drawMagmaSpawnEnemy(
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
  // MAGMA SPAWN - Primordial elemental of living molten rock, born from volcanic fury
  const isAttacking = attackPhase > 0;
  const bubble = Math.sin(time * 4);
  const flow = time * 2 % 1;
  const glow = 0.65 + Math.sin(time * 3) * 0.35;
  const surge = Math.sin(time * 2.5) * 0.04;
  const rage = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.15 : 0;
  size *= 1.5; // Larger size

  // Intense heat distortion aura
  const heatGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  heatGrad.addColorStop(0, `rgba(251, 146, 60, ${glow * 0.15})`);
  heatGrad.addColorStop(0.4, `rgba(234, 88, 12, ${glow * 0.1})`);
  heatGrad.addColorStop(0.7, `rgba(194, 65, 12, ${glow * 0.05})`);
  heatGrad.addColorStop(1, "rgba(124, 45, 18, 0)");
  ctx.fillStyle = heatGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Scorched earth underneath
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.35, size * 0.55, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Lava pool beneath
  const poolGrad = ctx.createRadialGradient(x, y + size * 0.32, 0, x, y + size * 0.32, size * 0.45);
  poolGrad.addColorStop(0, `rgba(251, 191, 36, ${glow * 0.6})`);
  poolGrad.addColorStop(0.5, `rgba(234, 88, 12, ${glow * 0.4})`);
  poolGrad.addColorStop(1, "rgba(124, 45, 18, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.32, size * 0.4, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dripping lava trails to ground
  ctx.fillStyle = `rgba(251, 191, 36, ${0.6 + glow * 0.3})`;
  for (let drip = 0; drip < 4; drip++) {
    const dripX = x - size * 0.25 + drip * size * 0.18;
    const dripPhase = (flow + drip * 0.25) % 1;
    const dripY = y + size * 0.1 + dripPhase * size * 0.25;
    ctx.beginPath();
    ctx.ellipse(dripX, dripY, size * 0.025, size * 0.06 * (1 - dripPhase * 0.5), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main molten body - amorphous shifting mass
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.1, 0, x, y, size * 0.45);
  bodyGrad.addColorStop(0, "#fef3c7");
  bodyGrad.addColorStop(0.2, bodyColorLight);
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(0.8, bodyColorDark);
  bodyGrad.addColorStop(1, "#7c2d12");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.22);
  ctx.quadraticCurveTo(x - size * 0.48 + surge * size, y - size * 0.05 + bubble * size * 0.06, x - size * 0.3, y - size * 0.38);
  ctx.quadraticCurveTo(x - size * 0.15, y - size * 0.52 + bubble * size * 0.04, x, y - size * 0.5 + bubble * size * 0.03);
  ctx.quadraticCurveTo(x + size * 0.15, y - size * 0.52 + bubble * size * 0.04, x + size * 0.3, y - size * 0.38);
  ctx.quadraticCurveTo(x + size * 0.48 - surge * size, y - size * 0.05 - bubble * size * 0.06, x + size * 0.4, y + size * 0.22);
  ctx.quadraticCurveTo(x + size * 0.2, y + size * 0.32 + surge * size, x, y + size * 0.3);
  ctx.quadraticCurveTo(x - size * 0.2, y + size * 0.32 - surge * size, x - size * 0.4, y + size * 0.22);
  ctx.fill();

  // Cooled rock patches (darker areas)
  ctx.fillStyle = "#451a03";
  for (let rock = 0; rock < 6; rock++) {
    const rockX = x + Math.sin(rock * 1.1 + time * 0.2) * size * 0.25;
    const rockY = y - size * 0.15 + Math.cos(rock * 1.4) * size * 0.2;
    const rockSize = size * (0.06 + Math.sin(rock) * 0.02);
    ctx.beginPath();
    ctx.ellipse(rockX, rockY, rockSize, rockSize * 0.7, rock * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing molten crack network
  ctx.strokeStyle = `rgba(251, 191, 36, ${glow})`;
  ctx.lineWidth = 3 * zoom;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 8 * zoom;
  // Main crack patterns
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.3);
  ctx.quadraticCurveTo(x - size * 0.15, y - size * 0.1, x - size * 0.2, y + size * 0.1);
  ctx.lineTo(x - size * 0.28, y + size * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.35);
  ctx.quadraticCurveTo(x + size * 0.25, y - size * 0.15, x + size * 0.15, y + size * 0.05);
  ctx.lineTo(x + size * 0.22, y + size * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.25);
  ctx.lineTo(x + size * 0.08, y - size * 0.05);
  ctx.lineTo(x, y + size * 0.12);
  ctx.stroke();
  // Branching cracks
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.1);
  ctx.lineTo(x - size * 0.08, y - size * 0.05);
  ctx.moveTo(x + size * 0.25, y - size * 0.15);
  ctx.lineTo(x + size * 0.32, y - size * 0.08);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Intensely bright molten core
  const coreGrad = ctx.createRadialGradient(x, y - size * 0.12, 0, x, y - size * 0.12, size * 0.28);
  coreGrad.addColorStop(0, `rgba(255, 255, 230, ${glow})`);
  coreGrad.addColorStop(0.3, `rgba(254, 243, 199, ${glow * 0.8})`);
  coreGrad.addColorStop(0.6, `rgba(251, 191, 36, ${glow * 0.5})`);
  coreGrad.addColorStop(1, "rgba(251, 146, 60, 0)");
  ctx.fillStyle = coreGrad;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 15 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.12, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Magma pseudopod arms
  ctx.fillStyle = bodyColor;
  // Left arm extending
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.5, y - size * 0.05 + rage * size, x - size * 0.45, y + size * 0.15);
  ctx.quadraticCurveTo(x - size * 0.35, y + size * 0.2, x - size * 0.32, y + size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.4, y, x - size * 0.35, y - size * 0.1);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.1);
  ctx.quadraticCurveTo(x + size * 0.5, y - rage * size, x + size * 0.48, y + size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.38, y + size * 0.18, x + size * 0.34, y + size * 0.08);
  ctx.quadraticCurveTo(x + size * 0.42, y - size * 0.02, x + size * 0.35, y - size * 0.1);
  ctx.fill();

  // Arm lava glow
  ctx.strokeStyle = `rgba(251, 191, 36, ${glow * 0.7})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.02);
  ctx.lineTo(x - size * 0.38, y + size * 0.12);
  ctx.moveTo(x + size * 0.42, y + size * 0.05);
  ctx.lineTo(x + size * 0.4, y + size * 0.13);
  ctx.stroke();

  // Fierce glowing eyes - deep set in molten face
  ctx.fillStyle = "#0a0502";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.12, y - size * 0.22, size * 0.07, size * 0.055, -0.15, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.12, y - size * 0.22, size * 0.07, size * 0.055, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Inner eye fire
  ctx.fillStyle = `rgba(255, 255, 200, ${glow})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.12, y - size * 0.22, size * 0.045, size * 0.035, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.12, y - size * 0.22, size * 0.045, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Burning pupils
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(x - size * 0.12, y - size * 0.22, size * 0.018, 0, Math.PI * 2);
  ctx.arc(x + size * 0.12, y - size * 0.22, size * 0.018, 0, Math.PI * 2);
  ctx.fill();

  // Jagged mouth crack
  ctx.fillStyle = `rgba(255, 255, 200, ${glow * 0.9})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.08);
  ctx.lineTo(x - size * 0.08, y - size * 0.04);
  ctx.lineTo(x - size * 0.03, y - size * 0.07);
  ctx.lineTo(x + size * 0.02, y - size * 0.03);
  ctx.lineTo(x + size * 0.08, y - size * 0.06);
  ctx.lineTo(x + size * 0.12, y - size * 0.02);
  ctx.lineTo(x + size * 0.08, y + size * 0.02);
  ctx.lineTo(x + size * 0.02, y - size * 0.01);
  ctx.lineTo(x - size * 0.04, y + size * 0.02);
  ctx.lineTo(x - size * 0.1, y - size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Bubbling lava on surface
  ctx.fillStyle = `rgba(251, 191, 36, ${glow * 0.8})`;
  for (let b = 0; b < 5; b++) {
    const bx = x - size * 0.2 + b * size * 0.1;
    const bubblePhase = Math.abs(Math.sin(time * 3 + b * 1.2));
    const by = y - size * 0.4 - bubblePhase * size * 0.12;
    const bSize = size * (0.035 + bubblePhase * 0.02);
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rising embers/sparks
  ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + glow * 0.3})`;
  for (let ember = 0; ember < 8; ember++) {
    const emberPhase = (time * 1.5 + ember * 0.12) % 1;
    const ex = x + Math.sin(ember * 1.3 + time * 2) * size * 0.35;
    const ey = y - size * 0.3 - emberPhase * size * 0.5;
    const emberSize = size * 0.02 * (1 - emberPhase);
    ctx.beginPath();
    ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smoke wisps
  ctx.fillStyle = `rgba(100, 80, 60, ${0.3 - flow * 0.2})`;
  for (let smoke = 0; smoke < 3; smoke++) {
    const sx = x + Math.sin(smoke * 2.1 + time) * size * 0.2;
    const smokePhase = (flow + smoke * 0.3) % 1;
    const sy = y - size * 0.5 - smokePhase * size * 0.4;
    ctx.beginPath();
    ctx.arc(sx, sy, size * (0.06 + smokePhase * 0.04), 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack eruption effect
  if (isAttacking) {
    ctx.fillStyle = `rgba(251, 191, 36, ${attackPhase * 0.7})`;
    for (let erupt = 0; erupt < 6; erupt++) {
      const eruptAngle = -Math.PI * 0.8 + erupt * 0.25;
      const eruptDist = attackPhase * size * 0.5;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(eruptAngle) * eruptDist,
        y - size * 0.35 + Math.sin(eruptAngle) * eruptDist * 0.6,
        size * 0.04,
        0, Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function drawFireImpEnemy(
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
  // FIRE IMP - Mischievous demon of infernal flames, delighting in chaos and destruction
  const isAttacking = attackPhase > 0;
  const hop = Math.abs(Math.sin(time * 8)) * size * 0.15;
  const armWave = Math.sin(time * 6) * 0.5;
  const flameFlicker = 0.75 + Math.random() * 0.25;
  const bodyPulse = 0.95 + Math.sin(time * 5) * 0.05;
  const cackleBounce = Math.sin(time * 12) * size * 0.02;
  size *= 1.7; // Much larger size

  // Intense fiery aura
  const auraGrad = ctx.createRadialGradient(x, y - hop, 0, x, y - hop, size * 0.7);
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${flameFlicker * 0.2})`);
  auraGrad.addColorStop(0.4, `rgba(251, 146, 60, ${flameFlicker * 0.15})`);
  auraGrad.addColorStop(0.7, `rgba(234, 88, 12, ${flameFlicker * 0.08})`);
  auraGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y - hop, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Scorched ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.35, size * 0.3, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Ember trail on ground
  ctx.fillStyle = `rgba(251, 146, 60, ${0.4 + flameFlicker * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.32, size * 0.15, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Clawed feet with fire wisps
  ctx.fillStyle = "#7c2d12";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.12 + cackleBounce, y + size * 0.2 - hop, size * 0.08, size * 0.12, -0.25, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.12 - cackleBounce, y + size * 0.2 - hop, size * 0.08, size * 0.12, 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  // Foot claws
  ctx.fillStyle = "#451a03";
  for (let foot = -1; foot <= 1; foot += 2) {
    for (let claw = 0; claw < 3; claw++) {
      const clawX = x + foot * size * 0.12 + (claw - 1) * size * 0.03 * foot;
      const clawY = y + size * 0.28 - hop;
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + foot * size * 0.02, clawY + size * 0.04);
      ctx.lineTo(clawX - foot * size * 0.01, clawY + size * 0.02);
      ctx.fill();
    }
  }

  // Sinuous demonic body
  const bodyGrad = ctx.createRadialGradient(x, y - size * 0.05 - hop, 0, x, y - size * 0.05 - hop, size * 0.25);
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05 - hop, size * 0.22 * bodyPulse, size * 0.25 * bodyPulse, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body flame patterns
  ctx.strokeStyle = `rgba(251, 191, 36, ${flameFlicker * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.2 - hop);
  ctx.quadraticCurveTo(x - size * 0.05, y - size * 0.1 - hop, x - size * 0.12, y + size * 0.05 - hop);
  ctx.moveTo(x + size * 0.08, y - size * 0.15 - hop);
  ctx.quadraticCurveTo(x + size * 0.12, y - size * 0.05 - hop, x + size * 0.06, y + size * 0.08 - hop);
  ctx.stroke();

  // Belly ember glow
  ctx.fillStyle = `rgba(251, 191, 36, ${flameFlicker * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.02 - hop, size * 0.1, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wiry muscular arms reaching outward
  ctx.fillStyle = bodyColor;
  // Left arm raised in mischief
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.1 - hop);
  ctx.quadraticCurveTo(
    x - size * 0.35 + armWave * size * 0.12,
    y - size * 0.2 - hop,
    x - size * 0.32 + armWave * size * 0.1,
    y - size * 0.35 - hop
  );
  ctx.lineTo(x - size * 0.26 + armWave * size * 0.08, y - size * 0.32 - hop);
  ctx.quadraticCurveTo(x - size * 0.28, y - size * 0.15 - hop, x - size * 0.18, y - size * 0.08 - hop);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.1 - hop);
  ctx.quadraticCurveTo(
    x + size * 0.35 - armWave * size * 0.12,
    y - size * 0.15 - hop,
    x + size * 0.32 - armWave * size * 0.1,
    y - size * 0.3 - hop
  );
  ctx.lineTo(x + size * 0.26 - armWave * size * 0.08, y - size * 0.27 - hop);
  ctx.quadraticCurveTo(x + size * 0.28, y - size * 0.12 - hop, x + size * 0.18, y - size * 0.08 - hop);
  ctx.fill();

  // Clawed hands with fire
  ctx.fillStyle = "#7c2d12";
  ctx.beginPath();
  ctx.arc(x - size * 0.32 + armWave * size * 0.1, y - size * 0.37 - hop, size * 0.06, 0, Math.PI * 2);
  ctx.arc(x + size * 0.32 - armWave * size * 0.1, y - size * 0.32 - hop, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  
  // Hand claws
  ctx.fillStyle = "#451a03";
  for (let hand = -1; hand <= 1; hand += 2) {
    const handX = hand < 0 ? x - size * 0.32 + armWave * size * 0.1 : x + size * 0.32 - armWave * size * 0.1;
    const handY = hand < 0 ? y - size * 0.37 - hop : y - size * 0.32 - hop;
    for (let claw = 0; claw < 3; claw++) {
      const clawAngle = (hand < 0 ? -Math.PI * 0.6 : -Math.PI * 0.4) + claw * 0.25 * hand;
      ctx.beginPath();
      ctx.moveTo(handX + Math.cos(clawAngle) * size * 0.04, handY + Math.sin(clawAngle) * size * 0.04);
      ctx.lineTo(handX + Math.cos(clawAngle) * size * 0.1, handY + Math.sin(clawAngle) * size * 0.08);
      ctx.lineTo(handX + Math.cos(clawAngle + 0.15) * size * 0.04, handY + Math.sin(clawAngle + 0.15) * size * 0.04);
      ctx.fill();
    }
  }

  // Fireball forming in hand when attacking
  if (isAttacking) {
    const fireballGrad = ctx.createRadialGradient(
      x - size * 0.32 + armWave * size * 0.1, y - size * 0.42 - hop, 0,
      x - size * 0.32 + armWave * size * 0.1, y - size * 0.42 - hop, size * 0.08 * attackPhase
    );
    fireballGrad.addColorStop(0, `rgba(255, 255, 200, ${attackPhase})`);
    fireballGrad.addColorStop(0.5, `rgba(251, 191, 36, ${attackPhase * 0.8})`);
    fireballGrad.addColorStop(1, `rgba(234, 88, 12, ${attackPhase * 0.4})`);
    ctx.fillStyle = fireballGrad;
    ctx.shadowColor = "#fbbf24";
    ctx.shadowBlur = 10 * zoom * attackPhase;
    ctx.beginPath();
    ctx.arc(x - size * 0.32 + armWave * size * 0.1, y - size * 0.42 - hop, size * 0.08 * attackPhase, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Large impish head
  const headGrad = ctx.createRadialGradient(x, y - size * 0.35 - hop, 0, x, y - size * 0.35 - hop, size * 0.2);
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.6, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x + cackleBounce, y - size * 0.35 - hop, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Pointed ears
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.38 - hop);
  ctx.quadraticCurveTo(x - size * 0.25, y - size * 0.42 - hop, x - size * 0.28, y - size * 0.5 - hop);
  ctx.lineTo(x - size * 0.2, y - size * 0.42 - hop);
  ctx.quadraticCurveTo(x - size * 0.17, y - size * 0.4 - hop, x - size * 0.14, y - size * 0.36 - hop);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.38 - hop);
  ctx.quadraticCurveTo(x + size * 0.25, y - size * 0.42 - hop, x + size * 0.28, y - size * 0.5 - hop);
  ctx.lineTo(x + size * 0.2, y - size * 0.42 - hop);
  ctx.quadraticCurveTo(x + size * 0.17, y - size * 0.4 - hop, x + size * 0.14, y - size * 0.36 - hop);
  ctx.fill();

  // Wicked curved horns
  ctx.fillStyle = "#451a03";
  // Left horn
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.48 - hop);
  ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.6 - hop, x - size * 0.08, y - size * 0.7 - hop);
  ctx.lineTo(x - size * 0.05, y - size * 0.62 - hop);
  ctx.quadraticCurveTo(x - size * 0.12, y - size * 0.55 - hop, x - size * 0.07, y - size * 0.48 - hop);
  ctx.fill();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.48 - hop);
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.6 - hop, x + size * 0.08, y - size * 0.7 - hop);
  ctx.lineTo(x + size * 0.05, y - size * 0.62 - hop);
  ctx.quadraticCurveTo(x + size * 0.12, y - size * 0.55 - hop, x + size * 0.07, y - size * 0.48 - hop);
  ctx.fill();

  // Horn glow tips
  ctx.fillStyle = `rgba(251, 191, 36, ${flameFlicker * 0.7})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.7 - hop, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.7 - hop, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Large mischievous eyes
  ctx.fillStyle = "#0a0502";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08 + cackleBounce, y - size * 0.38 - hop, size * 0.055, size * 0.06, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.08 + cackleBounce, y - size * 0.38 - hop, size * 0.055, size * 0.06, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Glowing irises
  ctx.fillStyle = `rgba(254, 243, 199, ${flameFlicker})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.08 + cackleBounce, y - size * 0.38 - hop, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08 + cackleBounce, y - size * 0.38 - hop, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Sinister red pupils
  ctx.fillStyle = "#b91c1c";
  ctx.beginPath();
  ctx.arc(x - size * 0.08 + cackleBounce, y - size * 0.38 - hop, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08 + cackleBounce, y - size * 0.38 - hop, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // Wide cackling grin with fangs
  ctx.fillStyle = "#0a0502";
  ctx.beginPath();
  ctx.ellipse(x + cackleBounce, y - size * 0.28 - hop, size * 0.1, size * 0.05 + Math.abs(cackleBounce), 0, 0, Math.PI);
  ctx.fill();

  // Sharp fangs
  ctx.fillStyle = "#fef3c7";
  // Upper fangs
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06 + cackleBounce, y - size * 0.3 - hop);
  ctx.lineTo(x - size * 0.05 + cackleBounce, y - size * 0.24 - hop);
  ctx.lineTo(x - size * 0.04 + cackleBounce, y - size * 0.3 - hop);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.06 + cackleBounce, y - size * 0.3 - hop);
  ctx.lineTo(x + size * 0.05 + cackleBounce, y - size * 0.24 - hop);
  ctx.lineTo(x + size * 0.04 + cackleBounce, y - size * 0.3 - hop);
  ctx.fill();
  // Lower fangs
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03 + cackleBounce, y - size * 0.26 - hop);
  ctx.lineTo(x - size * 0.02 + cackleBounce, y - size * 0.3 - hop);
  ctx.lineTo(x - size * 0.01 + cackleBounce, y - size * 0.26 - hop);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.03 + cackleBounce, y - size * 0.26 - hop);
  ctx.lineTo(x + size * 0.02 + cackleBounce, y - size * 0.3 - hop);
  ctx.lineTo(x + size * 0.01 + cackleBounce, y - size * 0.26 - hop);
  ctx.fill();

  // Flaming hair/crown
  ctx.fillStyle = bodyColorLight;
  for (let f = 0; f < 5; f++) {
    const fx = x - size * 0.12 + f * size * 0.06 + cackleBounce;
    const fHeight = size * (0.18 + Math.sin(time * 10 + f * 1.5) * 0.06);
    const fWave = Math.sin(time * 8 + f) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.025, y - size * 0.5 - hop);
    ctx.quadraticCurveTo(fx + fWave, y - size * 0.5 - fHeight - hop, fx + size * 0.025, y - size * 0.5 - hop);
    ctx.fill();
  }

  // Flame wisps around flames
  ctx.fillStyle = `rgba(251, 191, 36, ${flameFlicker * 0.5})`;
  for (let wisp = 0; wisp < 4; wisp++) {
    const wispX = x + Math.sin(time * 6 + wisp * 1.5) * size * 0.15;
    const wispY = y - size * 0.55 - hop - Math.abs(Math.sin(time * 8 + wisp)) * size * 0.15;
    ctx.beginPath();
    ctx.arc(wispX, wispY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flame tail curling behind
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.15 - hop);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.22 - hop, x + size * 0.22, y + size * 0.15 - hop + Math.sin(time * 6) * size * 0.06);
  ctx.quadraticCurveTo(x + size * 0.28, y + size * 0.08 - hop, x + size * 0.25, y + size * 0.02 - hop);
  ctx.quadraticCurveTo(x + size * 0.18, y + size * 0.12 - hop, x + size * 0.1, y + size * 0.18 - hop);
  ctx.quadraticCurveTo(x + size * 0.05, y + size * 0.17 - hop, x, y + size * 0.15 - hop);
  ctx.fill();

  // Tail flame tip
  ctx.fillStyle = `rgba(251, 191, 36, ${flameFlicker})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y + size * 0.02 - hop + Math.sin(time * 8) * size * 0.03, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Rising embers
  ctx.fillStyle = `rgba(251, 191, 36, ${0.6 + flameFlicker * 0.3})`;
  for (let ember = 0; ember < 6; ember++) {
    const emberPhase = (time * 2 + ember * 0.15) % 1;
    const ex = x + Math.sin(ember * 1.8 + time * 3) * size * 0.25;
    const ey = y - size * 0.3 - hop - emberPhase * size * 0.4;
    const emberSize = size * 0.015 * (1 - emberPhase);
    ctx.beginPath();
    ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEmberGuardEnemy(
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
  // EMBER GUARD - Elite infernal knight forged in volcanic fire, wielding a blade of living flame
  const isAttacking = attackPhase > 0;
  const march = Math.sin(time * 3) * 0.06;
  const flamePulse = 0.6 + Math.sin(time * 2.5) * 0.4;
  const breathe = Math.sin(time * 2) * 0.02;
  const swordSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.3 : 0;
  size *= 1.4; // Larger size

  // Intense heat aura
  const heatGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  heatGrad.addColorStop(0, `rgba(251, 191, 36, ${flamePulse * 0.12})`);
  heatGrad.addColorStop(0.5, `rgba(249, 115, 22, ${flamePulse * 0.08})`);
  heatGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
  ctx.fillStyle = heatGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Fire glow pool underneath
  const poolGrad = ctx.createRadialGradient(x, y + size * 0.48, 0, x, y + size * 0.48, size * 0.5);
  poolGrad.addColorStop(0, `rgba(251, 191, 36, ${flamePulse * 0.35})`);
  poolGrad.addColorStop(0.5, `rgba(249, 115, 22, ${flamePulse * 0.2})`);
  poolGrad.addColorStop(1, "rgba(124, 45, 18, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.5, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy armored legs with molten joints
  // Left leg
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.05 + march * size);
  ctx.lineTo(x - size * 0.25, y + size * 0.2 + march * size);
  ctx.lineTo(x - size * 0.28, y + size * 0.4);
  ctx.lineTo(x - size * 0.12, y + size * 0.4);
  ctx.lineTo(x - size * 0.1, y + size * 0.2 + march * size);
  ctx.lineTo(x - size * 0.12, y + size * 0.05 + march * size);
  ctx.closePath();
  ctx.fill();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y + size * 0.05 - march * size);
  ctx.lineTo(x + size * 0.08, y + size * 0.2 - march * size);
  ctx.lineTo(x + size * 0.1, y + size * 0.4);
  ctx.lineTo(x + size * 0.26, y + size * 0.4);
  ctx.lineTo(x + size * 0.23, y + size * 0.2 - march * size);
  ctx.lineTo(x + size * 0.2, y + size * 0.05 - march * size);
  ctx.closePath();
  ctx.fill();

  // Leg armor details
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.15 + march * size);
  ctx.lineTo(x - size * 0.15, y + size * 0.15 + march * size);
  ctx.moveTo(x + size * 0.13, y + size * 0.15 - march * size);
  ctx.lineTo(x + size * 0.18, y + size * 0.15 - march * size);
  ctx.stroke();

  // Molten knee joints
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse * 0.7})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.18, y + size * 0.2 + march * size, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.16, y + size * 0.2 - march * size, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Armored boots with spikes
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.2, y + size * 0.45, size * 0.1, size * 0.06, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.18, y + size * 0.45, size * 0.1, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Boot spikes
  ctx.fillStyle = "#1a0a02";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.42);
  ctx.lineTo(x - size * 0.32, y + size * 0.38);
  ctx.lineTo(x - size * 0.26, y + size * 0.4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.26, y + size * 0.42);
  ctx.lineTo(x + size * 0.3, y + size * 0.38);
  ctx.lineTo(x + size * 0.24, y + size * 0.4);
  ctx.fill();

  // Massive armored torso
  const armorGrad = ctx.createLinearGradient(x - size * 0.35, y - size * 0.35, x + size * 0.35, y + size * 0.1);
  armorGrad.addColorStop(0, bodyColorDark);
  armorGrad.addColorStop(0.3, bodyColor);
  armorGrad.addColorStop(0.6, bodyColorDark);
  armorGrad.addColorStop(1, "#451a03");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.1);
  ctx.lineTo(x - size * 0.38, y - size * 0.15 + breathe * size);
  ctx.lineTo(x - size * 0.35, y - size * 0.35);
  ctx.lineTo(x - size * 0.2, y - size * 0.42);
  ctx.lineTo(x, y - size * 0.45 + breathe * size);
  ctx.lineTo(x + size * 0.2, y - size * 0.42);
  ctx.lineTo(x + size * 0.35, y - size * 0.35);
  ctx.lineTo(x + size * 0.38, y - size * 0.15 + breathe * size);
  ctx.lineTo(x + size * 0.32, y + size * 0.1);
  ctx.closePath();
  ctx.fill();

  // Chest plate segments
  ctx.strokeStyle = "#1a0a02";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.35);
  ctx.lineTo(x - size * 0.2, y - size * 0.1);
  ctx.lineTo(x - size * 0.25, y + size * 0.05);
  ctx.moveTo(x + size * 0.25, y - size * 0.35);
  ctx.lineTo(x + size * 0.2, y - size * 0.1);
  ctx.lineTo(x + size * 0.25, y + size * 0.05);
  ctx.stroke();

  // Horizontal armor bands
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.28);
  ctx.lineTo(x + size * 0.25, y - size * 0.28);
  ctx.moveTo(x - size * 0.22, y - size * 0.12);
  ctx.lineTo(x + size * 0.22, y - size * 0.12);
  ctx.stroke();

  // Glowing infernal core in chest
  const coreGrad = ctx.createRadialGradient(x, y - size * 0.2, 0, x, y - size * 0.2, size * 0.15);
  coreGrad.addColorStop(0, `rgba(255, 255, 200, ${flamePulse})`);
  coreGrad.addColorStop(0.3, `rgba(251, 191, 36, ${flamePulse * 0.9})`);
  coreGrad.addColorStop(0.6, `rgba(249, 115, 22, ${flamePulse * 0.6})`);
  coreGrad.addColorStop(1, "rgba(194, 65, 12, 0)");
  ctx.fillStyle = coreGrad;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 15 * zoom * flamePulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.2, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Core rune symbol
  ctx.strokeStyle = `rgba(255, 255, 200, ${flamePulse * 0.8})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28);
  ctx.lineTo(x, y - size * 0.12);
  ctx.moveTo(x - size * 0.06, y - size * 0.2);
  ctx.lineTo(x + size * 0.06, y - size * 0.2);
  ctx.stroke();

  // Heavily armored arms
  ctx.fillStyle = bodyColor;
  // Left arm
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.32);
  ctx.quadraticCurveTo(x - size * 0.48, y - size * 0.2, x - size * 0.45, y + size * 0.05);
  ctx.lineTo(x - size * 0.35, y + size * 0.05);
  ctx.quadraticCurveTo(x - size * 0.38, y - size * 0.15, x - size * 0.32, y - size * 0.28);
  ctx.fill();
  // Right arm (sword arm - raised when attacking)
  const armRaise = swordSwing * size * 0.2;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.32);
  ctx.quadraticCurveTo(x + size * 0.5, y - size * 0.25 - armRaise, x + size * 0.48, y - size * 0.05 - armRaise);
  ctx.lineTo(x + size * 0.38, y - size * 0.05 - armRaise);
  ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.2 - armRaise, x + size * 0.32, y - size * 0.28);
  ctx.fill();

  // Arm armor details
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y - size * 0.15);
  ctx.lineTo(x - size * 0.38, y - size * 0.15);
  ctx.moveTo(x + size * 0.44, y - size * 0.15 - armRaise);
  ctx.lineTo(x + size * 0.4, y - size * 0.15 - armRaise);
  ctx.stroke();

  // Massive spiked pauldrons
  ctx.fillStyle = bodyColorDark;
  // Left pauldron
  ctx.beginPath();
  ctx.ellipse(x - size * 0.4, y - size * 0.35, size * 0.15, size * 0.1, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Right pauldron
  ctx.beginPath();
  ctx.ellipse(x + size * 0.4, y - size * 0.35 - armRaise * 0.3, size * 0.15, size * 0.1, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Pauldron spikes
  ctx.fillStyle = "#1a0a02";
  // Left spikes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.48, y - size * 0.38);
  ctx.lineTo(x - size * 0.55, y - size * 0.48);
  ctx.lineTo(x - size * 0.45, y - size * 0.4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y - size * 0.42);
  ctx.lineTo(x - size * 0.45, y - size * 0.52);
  ctx.lineTo(x - size * 0.38, y - size * 0.44);
  ctx.fill();
  // Right spikes
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y - size * 0.38 - armRaise * 0.3);
  ctx.lineTo(x + size * 0.55, y - size * 0.48 - armRaise * 0.3);
  ctx.lineTo(x + size * 0.45, y - size * 0.4 - armRaise * 0.3);
  ctx.fill();

  // Gauntlets with clawed fingers
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.arc(x - size * 0.44, y + size * 0.08, size * 0.08, 0, Math.PI * 2);
  ctx.arc(x + size * 0.46, y + size * 0.0 - armRaise, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Gauntlet claws
  ctx.fillStyle = "#1a0a02";
  for (let claw = 0; claw < 4; claw++) {
    // Left hand
    const lClawAngle = 0.3 + claw * 0.25;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.44 + Math.cos(lClawAngle) * size * 0.06, y + size * 0.08 + Math.sin(lClawAngle) * size * 0.06);
    ctx.lineTo(x - size * 0.44 + Math.cos(lClawAngle) * size * 0.12, y + size * 0.08 + Math.sin(lClawAngle) * size * 0.1);
    ctx.lineTo(x - size * 0.44 + Math.cos(lClawAngle + 0.1) * size * 0.06, y + size * 0.08 + Math.sin(lClawAngle + 0.1) * size * 0.06);
    ctx.fill();
  }

  // Imposing helmet with face guard
  const helmetGrad = ctx.createLinearGradient(x, y - size * 0.7, x, y - size * 0.45);
  helmetGrad.addColorStop(0, bodyColorDark);
  helmetGrad.addColorStop(0.5, bodyColor);
  helmetGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = helmetGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Helmet face plate
  ctx.fillStyle = "#1a0a02";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.55);
  ctx.lineTo(x - size * 0.18, y - size * 0.45);
  ctx.lineTo(x - size * 0.12, y - size * 0.4);
  ctx.lineTo(x, y - size * 0.38);
  ctx.lineTo(x + size * 0.12, y - size * 0.4);
  ctx.lineTo(x + size * 0.18, y - size * 0.45);
  ctx.lineTo(x + size * 0.15, y - size * 0.55);
  ctx.closePath();
  ctx.fill();

  // Helmet crest/plume
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.72);
  ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.65, x - size * 0.06, y - size * 0.52);
  ctx.lineTo(x + size * 0.06, y - size * 0.52);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.65, x, y - size * 0.72);
  ctx.fill();

  // Crest flame effect
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse * 0.8})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.72);
  ctx.quadraticCurveTo(x + Math.sin(time * 8) * size * 0.05, y - size * 0.82, x, y - size * 0.9 + Math.sin(time * 6) * size * 0.05);
  ctx.quadraticCurveTo(x - Math.sin(time * 8) * size * 0.05, y - size * 0.8, x, y - size * 0.72);
  ctx.fill();

  // Helmet horns
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.6);
  ctx.quadraticCurveTo(x - size * 0.28, y - size * 0.65, x - size * 0.3, y - size * 0.75);
  ctx.lineTo(x - size * 0.24, y - size * 0.65);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.58, x - size * 0.16, y - size * 0.55);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.6);
  ctx.quadraticCurveTo(x + size * 0.28, y - size * 0.65, x + size * 0.3, y - size * 0.75);
  ctx.lineTo(x + size * 0.24, y - size * 0.65);
  ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.58, x + size * 0.16, y - size * 0.55);
  ctx.fill();

  // Visor slit with burning eyes
  ctx.fillStyle = "#050202";
  ctx.fillRect(x - size * 0.13, y - size * 0.55, size * 0.26, size * 0.08);

  // Fierce glowing eyes behind visor
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.07, y - size * 0.51, size * 0.035, size * 0.025, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.07, y - size * 0.51, size * 0.035, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Fire breathing from visor when attacking
  if (isAttacking && attackPhase > 0.5) {
    ctx.fillStyle = `rgba(251, 191, 36, ${(attackPhase - 0.5) * 1.2})`;
    for (let breath = 0; breath < 4; breath++) {
      const bx = x + Math.sin(time * 12 + breath) * size * 0.1;
      const bDist = (attackPhase - 0.5) * 2 * size * 0.3;
      const by = y - size * 0.48 + bDist;
      ctx.beginPath();
      ctx.arc(bx, by, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // FLAMING GREATSWORD
  // Sword hilt/handle
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y - size * 0.05 - armRaise);
  ctx.lineTo(x + size * 0.52, y + size * 0.15 - armRaise);
  ctx.lineTo(x + size * 0.46, y + size * 0.15 - armRaise);
  ctx.closePath();
  ctx.fill();

  // Sword crossguard
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.49, y - size * 0.08 - armRaise, size * 0.08, size * 0.03, 0.2 - swordSwing, 0, Math.PI * 2);
  ctx.fill();

  // Blade base (metal)
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.46, y - size * 0.1 - armRaise);
  ctx.lineTo(x + size * 0.55, y - size * 0.45 - armRaise - swordSwing * size * 0.2);
  ctx.lineTo(x + size * 0.52, y - size * 0.1 - armRaise);
  ctx.closePath();
  ctx.fill();

  // Blade molten edge
  const bladeGrad = ctx.createLinearGradient(
    x + size * 0.46, y - size * 0.1 - armRaise,
    x + size * 0.55, y - size * 0.45 - armRaise
  );
  bladeGrad.addColorStop(0, `rgba(251, 191, 36, ${flamePulse})`);
  bladeGrad.addColorStop(0.5, `rgba(254, 243, 199, ${flamePulse})`);
  bladeGrad.addColorStop(1, `rgba(251, 191, 36, ${flamePulse * 0.8})`);
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.47, y - size * 0.12 - armRaise);
  ctx.lineTo(x + size * 0.54, y - size * 0.43 - armRaise - swordSwing * size * 0.2);
  ctx.lineTo(x + size * 0.51, y - size * 0.12 - armRaise);
  ctx.closePath();
  ctx.fill();

  // Blade fire aura
  ctx.fillStyle = `rgba(251, 191, 36, ${flamePulse * 0.5})`;
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 12 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.45, y - size * 0.15 - armRaise);
  ctx.quadraticCurveTo(
    x + size * 0.6 + Math.sin(time * 8) * size * 0.04,
    y - size * 0.3 - armRaise - swordSwing * size * 0.1,
    x + size * 0.53, y - size * 0.48 - armRaise - swordSwing * size * 0.2
  );
  ctx.quadraticCurveTo(
    x + size * 0.5, y - size * 0.35 - armRaise - swordSwing * size * 0.15,
    x + size * 0.45, y - size * 0.15 - armRaise
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Blade embers
  ctx.fillStyle = `rgba(255, 255, 200, ${flamePulse * 0.8})`;
  for (let ember = 0; ember < 5; ember++) {
    const emberPhase = (time * 2 + ember * 0.2) % 1;
    const emberX = x + size * 0.5 + Math.sin(ember * 2 + time * 6) * size * 0.08;
    const emberY = y - size * 0.15 - armRaise - emberPhase * size * 0.35;
    ctx.beginPath();
    ctx.arc(emberX, emberY, size * 0.015 * (1 - emberPhase), 0, Math.PI * 2);
    ctx.fill();
  }

  // Rising heat from armor
  ctx.fillStyle = `rgba(251, 146, 60, ${0.3 + Math.sin(time * 3) * 0.15})`;
  for (let heat = 0; heat < 4; heat++) {
    const hx = x + Math.sin(heat * 1.5 + time * 2) * size * 0.2;
    const heatPhase = (time * 1.5 + heat * 0.25) % 1;
    const hy = y - size * 0.3 - heatPhase * size * 0.3;
    ctx.beginPath();
    ctx.arc(hx, hy, size * 0.03 * (1 - heatPhase * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
}
