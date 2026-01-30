// Princeton Tower Defense - Effects Rendering Module
// Renders visual effects, projectiles, and particles

import type { Effect, Projectile, Particle, Position, Tower, Enemy, Troop, Hero } from "../../types";
import { worldToScreen, gridToWorld, distance } from "../../utils";
import { drawLightningBolt, drawExplosion, lightenColor, darkenColor } from "../helpers";

// Re-export fog effects
export { renderRoadEndFog } from "./fog";

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
): void {
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

  ctx.save();

  switch (effect.type) {
    case "explosion":
      drawExplosion(ctx, screenPos.x, screenPos.y, effect.size, progress, zoom);
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
        drawLightningBolt(ctx, screenPos.x, screenPos.y, targetScreen.x, targetScreen.y, intensity, zoom, alpha);

        // Impact spark
        ctx.fillStyle = `rgba(150, 255, 255, ${alpha * intensity})`;
        ctx.beginPath();
        ctx.arc(targetScreen.x, targetScreen.y, 8 * zoom * intensity, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "sonic":
      // Sound wave rings
      ctx.strokeStyle = `rgba(50, 200, 100, ${alpha * 0.6})`;
      ctx.lineWidth = 2 * zoom;
      for (let ring = 0; ring < 3; ring++) {
        const ringProgress = progress + ring * 0.15;
        if (ringProgress < 1) {
          const ringRadius = ringProgress * effect.size * zoom * 0.5;
          const ringAlpha = (1 - ringProgress) * 0.6;
          ctx.strokeStyle = `rgba(50, 200, 100, ${ringAlpha})`;
          ctx.beginPath();
          ctx.ellipse(screenPos.x, screenPos.y, ringRadius, ringRadius * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      break;

    case "slowField":
    case "freezeField":
      const fieldColor = effect.type === "freezeField" ? "100, 200, 255" : "100, 150, 200";
      const fieldRadius = effect.size * zoom * 0.5;
      ctx.fillStyle = `rgba(${fieldColor}, ${alpha * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, fieldRadius, fieldRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${fieldColor}, ${alpha * 0.5})`;
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();
      break;

    case "arcaneField":
      const arcaneRadius = effect.size * zoom * 0.5;
      const arcaneGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, arcaneRadius
      );
      arcaneGrad.addColorStop(0, `rgba(150, 100, 255, ${alpha * 0.3})`);
      arcaneGrad.addColorStop(0.7, `rgba(100, 50, 200, ${alpha * 0.2})`);
      arcaneGrad.addColorStop(1, "rgba(50, 0, 100, 0)");
      ctx.fillStyle = arcaneGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, arcaneRadius, arcaneRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
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
        const noteIndex = effect.noteIndex || 0;
        const symbols = ["♪", "♫", "♬", "♩", "𝄞"];

        const dx = targetScreen.x - screenPos.x;
        const dy = targetScreen.y - screenPos.y;
        const noteX = screenPos.x + dx * progress;
        const noteY = screenPos.y + dy * progress + Math.sin(Date.now() / 100 + noteIndex) * 5 * zoom;

        ctx.fillStyle = `rgba(50, 200, 100, ${alpha})`;
        ctx.font = `${14 * zoom}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(symbols[noteIndex % 5], noteX, noteY);
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

        if (effect.type === "flame_burst") {
          // Flame effect
          const flameGrad = ctx.createRadialGradient(
            screenPos.x, screenPos.y, 0,
            screenPos.x, screenPos.y, 30 * zoom
          );
          flameGrad.addColorStop(0, `rgba(255, 200, 50, ${alpha})`);
          flameGrad.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`);
          flameGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y, 30 * zoom * (1 - progress * 0.5), 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Tracer line
          ctx.strokeStyle = effect.type === "bullet_stream" 
            ? `rgba(255, 200, 0, ${alpha})` 
            : `rgba(255, 150, 50, ${alpha})`;
          ctx.lineWidth = 3 * zoom;
          ctx.beginPath();
          ctx.moveTo(screenPos.x, screenPos.y);
          ctx.lineTo(
            screenPos.x + (targetScreen.x - screenPos.x) * (1 - progress),
            screenPos.y + (targetScreen.y - screenPos.y) * (1 - progress)
          );
          ctx.stroke();
        }
      }
      break;

    case "roar_wave":
      // Circular expanding wave
      const waveRadius = progress * 150 * zoom;
      ctx.strokeStyle = `rgba(255, 150, 50, ${alpha * 0.6})`;
      ctx.lineWidth = 4 * zoom * (1 - progress);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, waveRadius, waveRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case "meteor_strike":
    case "meteor_incoming":
    case "meteor_falling":
    case "meteor_impact":
      if (effect.type === "meteor_incoming") {
        // Incoming indicator (legacy)
        ctx.strokeStyle = `rgba(255, 100, 50, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
        ctx.lineWidth = 2 * zoom;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, 30 * zoom, 15 * zoom, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (effect.type === "meteor_falling" && effect.targetPos) {
        // DETAILED Falling meteor animation - comes from TOP RIGHT
        const targetScreen = worldToScreen(
          effect.targetPos,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom
        );
        
        // Calculate meteor position along fall path (top right to target)
        const meteorX = screenPos.x + (targetScreen.x - screenPos.x) * progress;
        const meteorY = screenPos.y + (targetScreen.y - screenPos.y) * progress;
        const meteorIdx = effect.meteorIndex || 0;
        
        // ========== GROUND EFFECTS ==========
        // Pulsing danger zone indicator
        const pulseSpeed = 60;
        const warningAlpha = 0.4 + Math.sin(Date.now() / pulseSpeed) * 0.25;
        const warningSize = 55 * zoom * (0.4 + progress * 0.6);
        
        // Outer warning ring
        ctx.strokeStyle = `rgba(255, 50, 20, ${warningAlpha * 0.6})`;
        ctx.lineWidth = 3 * zoom;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.ellipse(targetScreen.x, targetScreen.y, warningSize * 1.2, warningSize * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Inner warning ring
        ctx.strokeStyle = `rgba(255, 100, 30, ${warningAlpha})`;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.ellipse(targetScreen.x, targetScreen.y, warningSize, warningSize * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Ground glow intensifies as meteor approaches
        const groundGlowAlpha = progress * progress * 0.6; // Quadratic for dramatic ramp-up
        const groundGlowRadius = 70 * zoom;
        const groundGlow = ctx.createRadialGradient(
          targetScreen.x, targetScreen.y, 0,
          targetScreen.x, targetScreen.y, groundGlowRadius
        );
        groundGlow.addColorStop(0, `rgba(255, 200, 100, ${groundGlowAlpha})`);
        groundGlow.addColorStop(0.3, `rgba(255, 120, 30, ${groundGlowAlpha * 0.7})`);
        groundGlow.addColorStop(0.6, `rgba(255, 60, 0, ${groundGlowAlpha * 0.4})`);
        groundGlow.addColorStop(1, "rgba(200, 30, 0, 0)");
        ctx.fillStyle = groundGlow;
        ctx.beginPath();
        ctx.ellipse(targetScreen.x, targetScreen.y, groundGlowRadius, groundGlowRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // ========== METEOR TRAIL ==========
        const trailAngle = Math.atan2(targetScreen.y - screenPos.y, targetScreen.x - screenPos.x);
        
        // Outermost smoke/heat trail
        const smokeTrailLength = 120 * zoom;
        const smokeStartX = meteorX - Math.cos(trailAngle) * smokeTrailLength;
        const smokeStartY = meteorY - Math.sin(trailAngle) * smokeTrailLength;
        ctx.strokeStyle = `rgba(100, 50, 20, ${alpha * 0.2})`;
        ctx.lineWidth = 35 * zoom;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(smokeStartX, smokeStartY);
        ctx.lineTo(meteorX, meteorY);
        ctx.stroke();
        
        // Outer fire trail (orange glow)
        const outerTrailLength = 100 * zoom;
        const outerStartX = meteorX - Math.cos(trailAngle) * outerTrailLength;
        const outerStartY = meteorY - Math.sin(trailAngle) * outerTrailLength;
        const outerTrailGrad = ctx.createLinearGradient(outerStartX, outerStartY, meteorX, meteorY);
        outerTrailGrad.addColorStop(0, "rgba(255, 80, 0, 0)");
        outerTrailGrad.addColorStop(0.4, `rgba(255, 100, 20, ${alpha * 0.3})`);
        outerTrailGrad.addColorStop(0.8, `rgba(255, 150, 50, ${alpha * 0.5})`);
        outerTrailGrad.addColorStop(1, `rgba(255, 200, 100, ${alpha * 0.7})`);
        ctx.strokeStyle = outerTrailGrad;
        ctx.lineWidth = 25 * zoom;
        ctx.beginPath();
        ctx.moveTo(outerStartX, outerStartY);
        ctx.lineTo(meteorX, meteorY);
        ctx.stroke();
        
        // Core fire trail (bright yellow-white)
        const coreTrailLength = 80 * zoom;
        const coreStartX = meteorX - Math.cos(trailAngle) * coreTrailLength;
        const coreStartY = meteorY - Math.sin(trailAngle) * coreTrailLength;
        const coreTrailGrad = ctx.createLinearGradient(coreStartX, coreStartY, meteorX, meteorY);
        coreTrailGrad.addColorStop(0, "rgba(255, 150, 50, 0)");
        coreTrailGrad.addColorStop(0.3, `rgba(255, 200, 100, ${alpha * 0.5})`);
        coreTrailGrad.addColorStop(0.7, `rgba(255, 230, 150, ${alpha * 0.8})`);
        coreTrailGrad.addColorStop(1, `rgba(255, 255, 220, ${alpha})`);
        ctx.strokeStyle = coreTrailGrad;
        ctx.lineWidth = 14 * zoom;
        ctx.beginPath();
        ctx.moveTo(coreStartX, coreStartY);
        ctx.lineTo(meteorX, meteorY);
        ctx.stroke();
        
        // Inner white-hot trail
        const innerTrailLength = 50 * zoom;
        const innerStartX = meteorX - Math.cos(trailAngle) * innerTrailLength;
        const innerStartY = meteorY - Math.sin(trailAngle) * innerTrailLength;
        const innerTrailGrad = ctx.createLinearGradient(innerStartX, innerStartY, meteorX, meteorY);
        innerTrailGrad.addColorStop(0, "rgba(255, 255, 200, 0)");
        innerTrailGrad.addColorStop(0.5, `rgba(255, 255, 230, ${alpha * 0.6})`);
        innerTrailGrad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
        ctx.strokeStyle = innerTrailGrad;
        ctx.lineWidth = 6 * zoom;
        ctx.beginPath();
        ctx.moveTo(innerStartX, innerStartY);
        ctx.lineTo(meteorX, meteorY);
        ctx.stroke();
        
        // ========== SCATTERED EMBER PARTICLES IN TRAIL ==========
        for (let i = 0; i < 8; i++) {
          const emberProgress = (i / 8) * 0.7; // Spread along trail
          const emberBaseX = meteorX - Math.cos(trailAngle) * outerTrailLength * emberProgress;
          const emberBaseY = meteorY - Math.sin(trailAngle) * outerTrailLength * emberProgress;
          // Add perpendicular scatter
          const perpAngle = trailAngle + Math.PI / 2;
          const scatter = Math.sin(Date.now() / 80 + i * 2 + meteorIdx) * 15 * zoom;
          const emberX = emberBaseX + Math.cos(perpAngle) * scatter;
          const emberY = emberBaseY + Math.sin(perpAngle) * scatter;
          const emberAlpha = alpha * (1 - emberProgress) * 0.8;
          const emberSize = (2 + Math.random() * 2) * zoom;
          
          ctx.fillStyle = `rgba(255, ${180 + Math.floor(Math.random() * 75)}, ${50 + Math.floor(Math.random() * 50)}, ${emberAlpha})`;
          ctx.beginPath();
          ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // ========== METEOR BODY ==========
        const meteorSize = effect.size * zoom * 0.5;
        
        // Huge outer glow
        const hugeGlow = ctx.createRadialGradient(
          meteorX, meteorY, 0,
          meteorX, meteorY, meteorSize * 3
        );
        hugeGlow.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.4})`);
        hugeGlow.addColorStop(0.4, `rgba(255, 100, 30, ${alpha * 0.2})`);
        hugeGlow.addColorStop(1, "rgba(200, 50, 0, 0)");
        ctx.fillStyle = hugeGlow;
        ctx.beginPath();
        ctx.arc(meteorX, meteorY, meteorSize * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Main fire glow around meteor
        const meteorGlow = ctx.createRadialGradient(
          meteorX, meteorY, 0,
          meteorX, meteorY, meteorSize * 2
        );
        meteorGlow.addColorStop(0, `rgba(255, 255, 230, ${alpha})`);
        meteorGlow.addColorStop(0.2, `rgba(255, 230, 150, ${alpha})`);
        meteorGlow.addColorStop(0.4, `rgba(255, 180, 50, ${alpha * 0.9})`);
        meteorGlow.addColorStop(0.7, `rgba(255, 100, 0, ${alpha * 0.6})`);
        meteorGlow.addColorStop(1, "rgba(200, 50, 0, 0)");
        ctx.fillStyle = meteorGlow;
        ctx.beginPath();
        ctx.arc(meteorX, meteorY, meteorSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Jagged rocky meteor shape (irregular polygon)
        ctx.save();
        ctx.translate(meteorX, meteorY);
        ctx.rotate(Date.now() / 500 + meteorIdx); // Slow rotation
        
        const rockGrad = ctx.createRadialGradient(
          -meteorSize * 0.3, -meteorSize * 0.3, 0,
          0, 0, meteorSize * 1.2
        );
        rockGrad.addColorStop(0, `rgba(180, 140, 100, ${alpha})`);
        rockGrad.addColorStop(0.3, `rgba(120, 80, 50, ${alpha})`);
        rockGrad.addColorStop(0.6, `rgba(80, 50, 30, ${alpha})`);
        rockGrad.addColorStop(1, `rgba(50, 30, 20, ${alpha * 0.9})`);
        ctx.fillStyle = rockGrad;
        
        // Draw jagged rock shape
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const jag = 0.7 + Math.sin(i * 3 + meteorIdx) * 0.3; // Jagged edges
          const r = meteorSize * jag;
          if (i === 0) {
            ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          } else {
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
        }
        ctx.closePath();
        ctx.fill();
        
        // Rocky texture - cracks
        ctx.strokeStyle = `rgba(40, 25, 15, ${alpha * 0.6})`;
        ctx.lineWidth = 1.5 * zoom;
        for (let i = 0; i < 4; i++) {
          const crackAngle = (i / 4) * Math.PI * 2 + 0.3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(crackAngle) * meteorSize * 0.6, Math.sin(crackAngle) * meteorSize * 0.6);
          ctx.stroke();
        }
        
        ctx.restore();
        
        // Hot molten spots on meteor
        const hotSpots = [
          { x: -0.3, y: -0.4, size: 0.3 },
          { x: 0.25, y: -0.2, size: 0.2 },
          { x: -0.15, y: 0.35, size: 0.25 },
        ];
        for (const spot of hotSpots) {
          const spotX = meteorX + spot.x * meteorSize;
          const spotY = meteorY + spot.y * meteorSize;
          const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spot.size * meteorSize);
          spotGrad.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
          spotGrad.addColorStop(0.5, `rgba(255, 200, 100, ${alpha * 0.7})`);
          spotGrad.addColorStop(1, "rgba(255, 150, 50, 0)");
          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.arc(spotX, spotY, spot.size * meteorSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // ========== ORBITING EMBER PARTICLES ==========
        for (let i = 0; i < 6; i++) {
          const orbitAngle = (Date.now() / 60 + i * (Math.PI * 2 / 6)) + meteorIdx;
          const orbitDist = meteorSize * (1.3 + Math.sin(Date.now() / 100 + i) * 0.2);
          const emberX = meteorX + Math.cos(orbitAngle) * orbitDist;
          const emberY = meteorY + Math.sin(orbitAngle) * orbitDist * 0.7; // Slightly elliptical
          
          // Ember glow
          const emberGlow = ctx.createRadialGradient(emberX, emberY, 0, emberX, emberY, 5 * zoom);
          emberGlow.addColorStop(0, `rgba(255, 255, 200, ${alpha * 0.9})`);
          emberGlow.addColorStop(0.5, `rgba(255, 180, 50, ${alpha * 0.5})`);
          emberGlow.addColorStop(1, "rgba(255, 100, 0, 0)");
          ctx.fillStyle = emberGlow;
          ctx.beginPath();
          ctx.arc(emberX, emberY, 5 * zoom, 0, Math.PI * 2);
          ctx.fill();
          
          // Ember core
          ctx.fillStyle = `rgba(255, ${200 + Math.floor(Math.random() * 55)}, ${100 + Math.floor(Math.random() * 100)}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(emberX, emberY, 2 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
        
      } else {
        // ========== DRAMATIC IMPACT EXPLOSION ==========
        const impactRadius = effect.size * zoom * (0.3 + progress * 0.8);
        
        // Screen flash at very start of impact
        if (progress < 0.15) {
          const flashAlpha = (0.15 - progress) / 0.15 * 0.3;
          ctx.fillStyle = `rgba(255, 200, 100, ${flashAlpha})`;
          ctx.fillRect(0, 0, canvasWidth * dpr, canvasHeight * dpr);
        }
        
        // Outer shockwave (expands fast)
        const shockRadius = impactRadius * 2 * (0.5 + progress * 1.5);
        const shockAlpha = alpha * 0.4 * (1 - progress * 0.8);
        ctx.strokeStyle = `rgba(255, 150, 50, ${shockAlpha})`;
        ctx.lineWidth = 4 * zoom * (1 - progress * 0.7);
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, shockRadius, shockRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Second shockwave
        const shock2Radius = impactRadius * 1.5 * (0.3 + progress * 1.2);
        const shock2Alpha = alpha * 0.5 * (1 - progress * 0.6);
        ctx.strokeStyle = `rgba(255, 100, 30, ${shock2Alpha})`;
        ctx.lineWidth = 6 * zoom * (1 - progress * 0.5);
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, shock2Radius, shock2Radius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Ground scorch mark
        const scorchRadius = impactRadius * 0.9;
        const scorchGrad = ctx.createRadialGradient(
          screenPos.x, screenPos.y, 0,
          screenPos.x, screenPos.y, scorchRadius
        );
        scorchGrad.addColorStop(0, `rgba(30, 20, 10, ${alpha * 0.6})`);
        scorchGrad.addColorStop(0.5, `rgba(50, 30, 15, ${alpha * 0.4})`);
        scorchGrad.addColorStop(1, "rgba(40, 25, 10, 0)");
        ctx.fillStyle = scorchGrad;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, scorchRadius, scorchRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Main explosion fireball
        const fireGrad = ctx.createRadialGradient(
          screenPos.x, screenPos.y - impactRadius * 0.2, 0,
          screenPos.x, screenPos.y, impactRadius
        );
        fireGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        fireGrad.addColorStop(0.1, `rgba(255, 255, 200, ${alpha})`);
        fireGrad.addColorStop(0.25, `rgba(255, 220, 100, ${alpha * 0.95})`);
        fireGrad.addColorStop(0.4, `rgba(255, 150, 30, ${alpha * 0.85})`);
        fireGrad.addColorStop(0.6, `rgba(255, 80, 0, ${alpha * 0.6})`);
        fireGrad.addColorStop(0.8, `rgba(180, 40, 0, ${alpha * 0.3})`);
        fireGrad.addColorStop(1, "rgba(100, 20, 0, 0)");
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, impactRadius, impactRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Rising fire column
        const columnHeight = impactRadius * 1.5 * (1 - progress * 0.5);
        const columnWidth = impactRadius * 0.6 * (1 - progress * 0.3);
        const columnGrad = ctx.createLinearGradient(
          screenPos.x, screenPos.y,
          screenPos.x, screenPos.y - columnHeight
        );
        columnGrad.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.8})`);
        columnGrad.addColorStop(0.3, `rgba(255, 130, 30, ${alpha * 0.6})`);
        columnGrad.addColorStop(0.6, `rgba(255, 80, 0, ${alpha * 0.3})`);
        columnGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
        ctx.fillStyle = columnGrad;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y - columnHeight * 0.5, columnWidth, columnHeight * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Explosion debris/chunks flying outward
        for (let i = 0; i < 12; i++) {
          const debrisAngle = (i / 12) * Math.PI * 2;
          const debrisDist = impactRadius * (0.5 + progress * 1.2);
          const debrisX = screenPos.x + Math.cos(debrisAngle) * debrisDist;
          const debrisY = screenPos.y + Math.sin(debrisAngle) * debrisDist * 0.5 - progress * 30 * zoom;
          const debrisAlpha = alpha * (1 - progress * 0.5);
          const debrisSize = (4 + Math.sin(i) * 2) * zoom * (1 - progress * 0.3);
          
          // Debris glow
          ctx.fillStyle = `rgba(255, ${150 + Math.floor(Math.random() * 100)}, 50, ${debrisAlpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(debrisX, debrisY, debrisSize * 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Debris core
          ctx.fillStyle = `rgba(255, 200, 100, ${debrisAlpha})`;
          ctx.beginPath();
          ctx.arc(debrisX, debrisY, debrisSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Inner white-hot core
        const coreRadius = impactRadius * 0.35 * (1 - progress * 0.6);
        const coreGrad = ctx.createRadialGradient(
          screenPos.x, screenPos.y, 0,
          screenPos.x, screenPos.y, coreRadius
        );
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        coreGrad.addColorStop(0.5, `rgba(255, 255, 200, ${alpha * 0.8})`);
        coreGrad.addColorStop(1, "rgba(255, 230, 150, 0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "freeze_wave":
      const freezeRadius = progress * 120 * zoom;
      ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.7})`;
      ctx.lineWidth = 3 * zoom * (1 - progress);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, freezeRadius, freezeRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Ice crystals
      ctx.fillStyle = `rgba(200, 230, 255, ${alpha * 0.5})`;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Date.now() / 500;
        const cx = screenPos.x + Math.cos(angle) * freezeRadius * 0.8;
        const cy = screenPos.y + Math.sin(angle) * freezeRadius * 0.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 5 * zoom);
        ctx.lineTo(cx + 3 * zoom, cy);
        ctx.lineTo(cx, cy + 5 * zoom);
        ctx.lineTo(cx - 3 * zoom, cy);
        ctx.closePath();
        ctx.fill();
      }
      break;

    case "inspiration":
      // Buff aura
      const inspireRadius = effect.size * zoom;
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.5})`;
      ctx.lineWidth = 2 * zoom;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, inspireRadius, inspireRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rising sparkles
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      for (let i = 0; i < 5; i++) {
        const sparkleX = screenPos.x + (Math.random() - 0.5) * inspireRadius * 2;
        const sparkleY = screenPos.y - progress * 50 * zoom + (Math.random() - 0.5) * 20 * zoom;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    // ========================================================================
    // PHYSICAL ATTACK EFFECTS - Slashes, impacts, swipes
    // ========================================================================
    
    case "melee_slash":
      // Sword/claw slash arc effect
      const slashAngle = effect.slashAngle || 0;
      const slashWidth = effect.slashWidth || Math.PI * 0.6;
      const slashRadius = effect.size * zoom * (0.3 + progress * 0.7);
      const slashAlpha = alpha * 0.9;
      
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(slashAngle);
      
      // Multiple slash arcs for thickness
      for (let layer = 0; layer < 3; layer++) {
        const layerRadius = slashRadius * (1 - layer * 0.15);
        const layerAlpha = slashAlpha * (1 - layer * 0.25);
        
        // Outer glow
        ctx.strokeStyle = `rgba(255, 255, 255, ${layerAlpha * 0.3})`;
        ctx.lineWidth = (8 - layer * 2) * zoom;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, 0, layerRadius, -slashWidth / 2, slashWidth / 2);
        ctx.stroke();
        
        // Inner bright line
        ctx.strokeStyle = `rgba(255, 240, 200, ${layerAlpha})`;
        ctx.lineWidth = (4 - layer) * zoom;
        ctx.beginPath();
        ctx.arc(0, 0, layerRadius, -slashWidth / 2, slashWidth / 2);
        ctx.stroke();
      }
      
      // Slash tip sparkles
      const tipAngle1 = -slashWidth / 2;
      const tipAngle2 = slashWidth / 2;
      const sparkleSize = 4 * zoom * (1 - progress);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${slashAlpha})`;
      ctx.beginPath();
      ctx.arc(Math.cos(tipAngle2) * slashRadius, Math.sin(tipAngle2) * slashRadius, sparkleSize, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      break;
      
    case "melee_smash":
      // Heavy ground pound effect
      const smashProgress = progress;
      const smashRadius = effect.size * zoom;
      
      // Ground crack lines radiating outward
      ctx.strokeStyle = `rgba(139, 90, 43, ${alpha * 0.8})`;
      ctx.lineWidth = 3 * zoom * (1 - smashProgress * 0.5);
      
      for (let i = 0; i < 8; i++) {
        const crackAngle = (i / 8) * Math.PI * 2;
        const crackLen = smashRadius * (0.5 + smashProgress * 0.5);
        const jitter1 = (Math.sin(i * 3.7) * 0.3);
        const jitter2 = (Math.cos(i * 2.3) * 0.2);
        
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(
          screenPos.x + Math.cos(crackAngle + jitter1) * crackLen * 0.5,
          screenPos.y + Math.sin(crackAngle + jitter1) * crackLen * 0.3
        );
        ctx.lineTo(
          screenPos.x + Math.cos(crackAngle + jitter2) * crackLen,
          screenPos.y + Math.sin(crackAngle + jitter2) * crackLen * 0.5
        );
        ctx.stroke();
      }
      
      // Dust cloud
      const dustGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, smashRadius
      );
      dustGrad.addColorStop(0, `rgba(180, 150, 100, ${alpha * 0.4})`);
      dustGrad.addColorStop(0.5, `rgba(150, 120, 80, ${alpha * 0.2})`);
      dustGrad.addColorStop(1, "rgba(120, 100, 70, 0)");
      ctx.fillStyle = dustGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, smashRadius, smashRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Impact flash at center
      if (smashProgress < 0.3) {
        const flashAlpha = (0.3 - smashProgress) / 0.3 * alpha;
        ctx.fillStyle = `rgba(255, 220, 150, ${flashAlpha})`;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, smashRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case "melee_swipe":
      // Quick claw swipe - three parallel marks
      const swipeAngle = effect.slashAngle || 0;
      const swipeLen = effect.size * zoom * (0.4 + progress * 0.6);
      const swipeAlpha = alpha * 0.85;
      
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(swipeAngle);
      
      // Three claw marks
      for (let claw = 0; claw < 3; claw++) {
        const clawOffset = (claw - 1) * 8 * zoom;
        const clawDelay = claw * 0.1;
        const clawProgress = Math.max(0, progress - clawDelay) / (1 - clawDelay);
        const clawAlpha = swipeAlpha * (1 - clawProgress * 0.5);
        
        // Claw mark gradient
        const clawGrad = ctx.createLinearGradient(-swipeLen * 0.5, 0, swipeLen * 0.5, 0);
        clawGrad.addColorStop(0, `rgba(255, 100, 100, 0)`);
        clawGrad.addColorStop(0.2, `rgba(255, 150, 150, ${clawAlpha})`);
        clawGrad.addColorStop(0.5, `rgba(255, 200, 200, ${clawAlpha})`);
        clawGrad.addColorStop(0.8, `rgba(255, 150, 150, ${clawAlpha})`);
        clawGrad.addColorStop(1, `rgba(255, 100, 100, 0)`);
        
        ctx.strokeStyle = clawGrad;
        ctx.lineWidth = 3 * zoom;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-swipeLen * 0.5, clawOffset);
        ctx.lineTo(swipeLen * 0.5, clawOffset);
        ctx.stroke();
      }
      
      ctx.restore();
      break;
      
    case "impact_hit":
      // Generic hit impact - star burst
      const hitSize = effect.size * zoom;
      const hitAlpha = alpha;
      const hitColor = effect.color || "255, 255, 255";
      
      // Central flash
      const hitGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, hitSize * (0.5 + progress * 0.5)
      );
      hitGrad.addColorStop(0, `rgba(${hitColor}, ${hitAlpha})`);
      hitGrad.addColorStop(0.3, `rgba(${hitColor}, ${hitAlpha * 0.6})`);
      hitGrad.addColorStop(1, `rgba(${hitColor}, 0)`);
      ctx.fillStyle = hitGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, hitSize * (0.5 + progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
      
      // Radiating lines
      ctx.strokeStyle = `rgba(${hitColor}, ${hitAlpha * 0.8})`;
      ctx.lineWidth = 2 * zoom * (1 - progress);
      for (let i = 0; i < 6; i++) {
        const rayAngle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const rayLen = hitSize * (0.3 + progress * 0.7);
        ctx.beginPath();
        ctx.moveTo(
          screenPos.x + Math.cos(rayAngle) * hitSize * 0.2,
          screenPos.y + Math.sin(rayAngle) * hitSize * 0.2
        );
        ctx.lineTo(
          screenPos.x + Math.cos(rayAngle) * rayLen,
          screenPos.y + Math.sin(rayAngle) * rayLen
        );
        ctx.stroke();
      }
      break;
      
    case "ground_crack":
      // Ground crack from heavy attack
      const crackSize = effect.size * zoom;
      const crackAlpha = alpha * 0.9;
      
      ctx.strokeStyle = `rgba(60, 40, 20, ${crackAlpha})`;
      ctx.lineWidth = 2 * zoom;
      
      // Main cracks
      for (let i = 0; i < 5; i++) {
        const baseAngle = (i / 5) * Math.PI * 2;
        const crackLen = crackSize * (0.6 + Math.random() * 0.4) * (0.3 + progress * 0.7);
        
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        
        let x = screenPos.x;
        let y = screenPos.y;
        const segments = 3 + Math.floor(Math.random() * 2);
        for (let j = 0; j < segments; j++) {
          const segAngle = baseAngle + (Math.random() - 0.5) * 0.5;
          const segLen = crackLen / segments;
          x += Math.cos(segAngle) * segLen;
          y += Math.sin(segAngle) * segLen * 0.5;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
      
    case "dust_cloud":
      // Dust particles rising from impact
      const dustSize = effect.size * zoom;
      const dustAlpha = alpha * 0.6;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = dustSize * (0.3 + progress * 0.7) * (0.7 + Math.sin(i * 2) * 0.3);
        const pSize = (3 + Math.sin(i * 3) * 2) * zoom * (1 - progress * 0.5);
        const rise = progress * 15 * zoom;
        
        ctx.fillStyle = `rgba(160, 140, 100, ${dustAlpha * (1 - i * 0.08)})`;
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(angle) * dist,
          screenPos.y + Math.sin(angle) * dist * 0.5 - rise,
          pSize,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      break;
      
    // ========================================================================
    // AOE ATTACK EFFECTS
    // ========================================================================
    
    case "aoe_ring":
      // Expanding damage ring
      const ringRadius = effect.size * zoom * (0.2 + progress * 0.8);
      const ringColor = effect.color || "255, 100, 100";
      const ringAlpha = alpha * 0.8;
      
      // Outer ring
      ctx.strokeStyle = `rgba(${ringColor}, ${ringAlpha})`;
      ctx.lineWidth = 4 * zoom * (1 - progress * 0.5);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, ringRadius, ringRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner fill
      const aoeFill = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, ringRadius
      );
      aoeFill.addColorStop(0, `rgba(${ringColor}, ${ringAlpha * 0.3})`);
      aoeFill.addColorStop(0.7, `rgba(${ringColor}, ${ringAlpha * 0.1})`);
      aoeFill.addColorStop(1, `rgba(${ringColor}, 0)`);
      ctx.fillStyle = aoeFill;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, ringRadius, ringRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case "shockwave":
      // Ground shockwave - multiple expanding rings
      for (let wave = 0; wave < 3; wave++) {
        const waveDelay = wave * 0.15;
        const waveProgress = Math.max(0, (progress - waveDelay) / (1 - waveDelay));
        if (waveProgress <= 0) continue;
        
        const waveRadius = effect.size * zoom * waveProgress;
        const waveAlpha = alpha * (1 - waveProgress) * 0.6;
        
        ctx.strokeStyle = `rgba(200, 150, 100, ${waveAlpha})`;
        ctx.lineWidth = (4 - wave) * zoom;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, waveRadius, waveRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
      
    case "magic_burst":
      // Magic AoE burst - purple energy
      const burstRadius = effect.size * zoom * (0.3 + progress * 0.7);
      const burstAlpha = alpha * 0.9;
      
      // Magical glow
      const magicGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, burstRadius
      );
      magicGrad.addColorStop(0, `rgba(200, 150, 255, ${burstAlpha * 0.5})`);
      magicGrad.addColorStop(0.5, `rgba(150, 100, 200, ${burstAlpha * 0.3})`);
      magicGrad.addColorStop(1, "rgba(100, 50, 150, 0)");
      ctx.fillStyle = magicGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, burstRadius, burstRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Magic particles
      ctx.fillStyle = `rgba(220, 180, 255, ${burstAlpha})`;
      for (let i = 0; i < 8; i++) {
        const pAngle = (i / 8) * Math.PI * 2 + progress * 4;
        const pDist = burstRadius * (0.5 + progress * 0.5);
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(pAngle) * pDist,
          screenPos.y + Math.sin(pAngle) * pDist * 0.5,
          3 * zoom * (1 - progress * 0.5),
          0, Math.PI * 2
        );
        ctx.fill();
      }
      break;
      
    case "fire_nova":
      // Fire explosion ring
      const fireRadius = effect.size * zoom * (0.2 + progress * 0.8);
      const fireAlpha = alpha;
      
      // Fire fill
      const fireGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, fireRadius
      );
      fireGrad.addColorStop(0, `rgba(255, 255, 200, ${fireAlpha * 0.6})`);
      fireGrad.addColorStop(0.3, `rgba(255, 200, 50, ${fireAlpha * 0.4})`);
      fireGrad.addColorStop(0.6, `rgba(255, 100, 0, ${fireAlpha * 0.3})`);
      fireGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, fireRadius, fireRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Fire ring edge
      ctx.strokeStyle = `rgba(255, 150, 50, ${fireAlpha * 0.8})`;
      ctx.lineWidth = 3 * zoom * (1 - progress * 0.5);
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, fireRadius, fireRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
      
    case "ice_nova":
      // Ice explosion ring
      const iceRadius = effect.size * zoom * (0.2 + progress * 0.8);
      const iceAlpha = alpha;
      
      // Ice fill
      const iceGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, iceRadius
      );
      iceGrad.addColorStop(0, `rgba(255, 255, 255, ${iceAlpha * 0.6})`);
      iceGrad.addColorStop(0.3, `rgba(200, 230, 255, ${iceAlpha * 0.4})`);
      iceGrad.addColorStop(0.6, `rgba(100, 180, 255, ${iceAlpha * 0.3})`);
      iceGrad.addColorStop(1, "rgba(50, 150, 200, 0)");
      ctx.fillStyle = iceGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, iceRadius, iceRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Ice crystals at edge
      ctx.fillStyle = `rgba(200, 230, 255, ${iceAlpha * 0.8})`;
      for (let i = 0; i < 8; i++) {
        const cAngle = (i / 8) * Math.PI * 2;
        const cx = screenPos.x + Math.cos(cAngle) * iceRadius;
        const cy = screenPos.y + Math.sin(cAngle) * iceRadius * 0.5;
        const cSize = 5 * zoom * (1 - progress * 0.5);
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - cSize);
        ctx.lineTo(cx + cSize * 0.6, cy);
        ctx.lineTo(cx, cy + cSize);
        ctx.lineTo(cx - cSize * 0.6, cy);
        ctx.closePath();
        ctx.fill();
      }
      break;
      
    case "dark_nova":
      // Dark magic burst
      const darkRadius = effect.size * zoom * (0.2 + progress * 0.8);
      const darkAlpha = alpha;
      
      // Dark fill
      const darkGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, darkRadius
      );
      darkGrad.addColorStop(0, `rgba(100, 0, 150, ${darkAlpha * 0.5})`);
      darkGrad.addColorStop(0.4, `rgba(60, 0, 100, ${darkAlpha * 0.4})`);
      darkGrad.addColorStop(0.7, `rgba(30, 0, 50, ${darkAlpha * 0.3})`);
      darkGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = darkGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, darkRadius, darkRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Dark tendrils
      ctx.strokeStyle = `rgba(150, 50, 200, ${darkAlpha * 0.6})`;
      ctx.lineWidth = 2 * zoom;
      for (let i = 0; i < 6; i++) {
        const tAngle = (i / 6) * Math.PI * 2 + progress * 2;
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.quadraticCurveTo(
          screenPos.x + Math.cos(tAngle + 0.3) * darkRadius * 0.6,
          screenPos.y + Math.sin(tAngle + 0.3) * darkRadius * 0.3,
          screenPos.x + Math.cos(tAngle) * darkRadius,
          screenPos.y + Math.sin(tAngle) * darkRadius * 0.5
        );
        ctx.stroke();
      }
      break;
      
    // ========================================================================
    // PROJECTILE IMPACT EFFECTS
    // ========================================================================
    
    case "arrow_hit":
      // Arrow stuck in ground
      const arrowAngle = effect.rotation || -Math.PI / 4;
      const arrowAlpha = alpha;
      
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(arrowAngle);
      
      // Arrow shaft sticking out
      ctx.fillStyle = `rgba(90, 64, 32, ${arrowAlpha})`;
      ctx.fillRect(-2 * zoom, -15 * zoom, 4 * zoom, 12 * zoom);
      
      // Fletching
      ctx.fillStyle = `rgba(200, 50, 50, ${arrowAlpha})`;
      ctx.beginPath();
      ctx.moveTo(0, -15 * zoom);
      ctx.lineTo(-4 * zoom, -12 * zoom);
      ctx.lineTo(0, -13 * zoom);
      ctx.lineTo(4 * zoom, -12 * zoom);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      break;
      
    case "magic_impact":
      // Magic projectile impact sparkles
      const magicSize = effect.size * zoom;
      const magicAlpha = alpha;
      const magicColor = effect.color || "150, 100, 255";
      
      // Central burst
      const magicImpactGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, magicSize
      );
      magicImpactGrad.addColorStop(0, `rgba(255, 255, 255, ${magicAlpha})`);
      magicImpactGrad.addColorStop(0.3, `rgba(${magicColor}, ${magicAlpha * 0.7})`);
      magicImpactGrad.addColorStop(1, `rgba(${magicColor}, 0)`);
      ctx.fillStyle = magicImpactGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, magicSize * (0.5 + progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
      
      // Sparkles flying out
      ctx.fillStyle = `rgba(${magicColor}, ${magicAlpha * 0.8})`;
      for (let i = 0; i < 6; i++) {
        const sAngle = (i / 6) * Math.PI * 2;
        const sDist = magicSize * progress;
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(sAngle) * sDist,
          screenPos.y + Math.sin(sAngle) * sDist * 0.5,
          2 * zoom * (1 - progress),
          0, Math.PI * 2
        );
        ctx.fill();
      }
      break;
      
    case "fire_impact":
      // Fireball explosion
      const fireImpactRadius = effect.size * zoom * (0.3 + progress * 0.7);
      const fireImpactAlpha = alpha;
      
      // Fire explosion
      const fireImpactGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y - fireImpactRadius * 0.2, 0,
        screenPos.x, screenPos.y, fireImpactRadius
      );
      fireImpactGrad.addColorStop(0, `rgba(255, 255, 200, ${fireImpactAlpha})`);
      fireImpactGrad.addColorStop(0.2, `rgba(255, 200, 50, ${fireImpactAlpha * 0.9})`);
      fireImpactGrad.addColorStop(0.5, `rgba(255, 100, 0, ${fireImpactAlpha * 0.6})`);
      fireImpactGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
      ctx.fillStyle = fireImpactGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, fireImpactRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Ember particles
      ctx.fillStyle = `rgba(255, 200, 50, ${fireImpactAlpha * 0.8})`;
      for (let i = 0; i < 8; i++) {
        const eAngle = (i / 8) * Math.PI * 2;
        const eDist = fireImpactRadius * (0.6 + progress * 0.4);
        const eRise = progress * 20 * zoom;
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(eAngle) * eDist,
          screenPos.y + Math.sin(eAngle) * eDist * 0.5 - eRise,
          3 * zoom * (1 - progress * 0.5),
          0, Math.PI * 2
        );
        ctx.fill();
      }
      break;
      
    case "rock_impact":
      // Boulder crash - debris and dust
      const rockSize = effect.size * zoom;
      const rockAlpha = alpha;
      
      // Impact crater
      ctx.fillStyle = `rgba(80, 60, 40, ${rockAlpha * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, rockSize * 0.6, rockSize * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Flying debris
      ctx.fillStyle = `rgba(120, 100, 80, ${rockAlpha})`;
      for (let i = 0; i < 10; i++) {
        const dAngle = (i / 10) * Math.PI * 2;
        const dDist = rockSize * (0.3 + progress * 0.7);
        const dRise = Math.sin(progress * Math.PI) * 15 * zoom;
        const dSize = (4 + Math.sin(i * 2) * 2) * zoom * (1 - progress * 0.5);
        
        ctx.beginPath();
        ctx.arc(
          screenPos.x + Math.cos(dAngle) * dDist,
          screenPos.y + Math.sin(dAngle) * dDist * 0.5 - dRise,
          dSize,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      
      // Dust cloud
      ctx.fillStyle = `rgba(150, 130, 100, ${rockAlpha * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, rockSize, rockSize * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case "poison_splash":
      // Poison splatter
      const poisonRadius = effect.size * zoom;
      const poisonAlpha = alpha;
      
      // Poison puddle
      const poisonGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, poisonRadius
      );
      poisonGrad.addColorStop(0, `rgba(100, 200, 50, ${poisonAlpha * 0.6})`);
      poisonGrad.addColorStop(0.5, `rgba(80, 180, 30, ${poisonAlpha * 0.4})`);
      poisonGrad.addColorStop(1, "rgba(60, 150, 20, 0)");
      ctx.fillStyle = poisonGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, poisonRadius, poisonRadius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Bubbles
      ctx.fillStyle = `rgba(150, 255, 100, ${poisonAlpha * 0.7})`;
      for (let i = 0; i < 5; i++) {
        const bx = screenPos.x + (Math.sin(i * 2.5) - 0.5) * poisonRadius;
        const by = screenPos.y + (Math.cos(i * 1.7) - 0.5) * poisonRadius * 0.3 - progress * 10 * zoom;
        const bSize = 3 * zoom * (1 - progress * 0.3);
        ctx.beginPath();
        ctx.arc(bx, by, bSize, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case "frost_impact":
      // Ice shatter effect
      const frostRadius = effect.size * zoom;
      const frostAlpha = alpha;
      
      // Ice burst
      const frostGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, frostRadius
      );
      frostGrad.addColorStop(0, `rgba(255, 255, 255, ${frostAlpha * 0.8})`);
      frostGrad.addColorStop(0.4, `rgba(200, 230, 255, ${frostAlpha * 0.5})`);
      frostGrad.addColorStop(1, "rgba(100, 180, 255, 0)");
      ctx.fillStyle = frostGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, frostRadius * (0.5 + progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
      
      // Ice shards flying out
      ctx.fillStyle = `rgba(200, 240, 255, ${frostAlpha})`;
      for (let i = 0; i < 6; i++) {
        const shardAngle = (i / 6) * Math.PI * 2;
        const shardDist = frostRadius * progress;
        const sx = screenPos.x + Math.cos(shardAngle) * shardDist;
        const sy = screenPos.y + Math.sin(shardAngle) * shardDist * 0.5;
        const shardSize = 6 * zoom * (1 - progress * 0.5);
        
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(shardAngle);
        ctx.beginPath();
        ctx.moveTo(0, -shardSize);
        ctx.lineTo(shardSize * 0.4, 0);
        ctx.lineTo(0, shardSize);
        ctx.lineTo(-shardSize * 0.4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      break;
      
    // ========================================================================
    // HERO SPECIAL EFFECTS
    // ========================================================================
    
    case "tiger_slash":
      // Tiger claw attack - triple slash marks
      const tigerAngle = effect.slashAngle || 0;
      const tigerSize = effect.size * zoom;
      const tigerAlpha = alpha;
      
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(tigerAngle);
      
      // Three claw marks
      for (let claw = 0; claw < 3; claw++) {
        const clawY = (claw - 1) * 10 * zoom;
        const clawProgress = Math.max(0, progress - claw * 0.08) / (1 - claw * 0.08);
        const clawLen = tigerSize * (0.4 + clawProgress * 0.6);
        const clawAlpha = tigerAlpha * (1 - clawProgress * 0.3);
        
        // Claw glow
        ctx.shadowColor = "#ff8800";
        ctx.shadowBlur = 8 * zoom;
        
        // Claw arc
        ctx.strokeStyle = `rgba(255, 200, 100, ${clawAlpha})`;
        ctx.lineWidth = 4 * zoom * (1 - clawProgress * 0.3);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, clawY, clawLen, -0.3, 0.3);
        ctx.stroke();
        
        // Inner bright line
        ctx.strokeStyle = `rgba(255, 255, 200, ${clawAlpha})`;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.arc(0, clawY, clawLen, -0.3, 0.3);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      }
      
      ctx.restore();
      break;
      
    case "knight_cleave":
      // Mathey Knight sword swing - heavy sweeping arc
      const knightAngle = effect.slashAngle || 0;
      const knightSize = effect.size * zoom;
      const knightAlpha = alpha;
      
      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(knightAngle);
      
      // Sword trail glow
      ctx.shadowColor = "#6366f1";
      ctx.shadowBlur = 15 * zoom;
      
      // Wide sweeping arc
      const arcWidth = Math.PI * 0.8;
      const arcRadius = knightSize * (0.4 + progress * 0.6);
      
      // Outer glow
      ctx.strokeStyle = `rgba(99, 102, 241, ${knightAlpha * 0.5})`;
      ctx.lineWidth = 12 * zoom * (1 - progress * 0.5);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, -arcWidth / 2, arcWidth / 2);
      ctx.stroke();
      
      // Inner bright arc
      ctx.strokeStyle = `rgba(200, 200, 255, ${knightAlpha})`;
      ctx.lineWidth = 4 * zoom;
      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, -arcWidth / 2, arcWidth / 2);
      ctx.stroke();
      
      // Sparks at the arc tip
      const tipX = Math.cos(arcWidth / 2) * arcRadius;
      const tipY = Math.sin(arcWidth / 2) * arcRadius;
      ctx.fillStyle = `rgba(255, 255, 255, ${knightAlpha})`;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 5 * zoom * (1 - progress), 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.restore();
      break;
      
    case "scott_quill":
      // F Scott pen/quill attack - ink splash and literary flourish
      const scottSize = effect.size * zoom;
      const scottAlpha = alpha;
      
      // Ink splash
      const inkGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, scottSize
      );
      inkGrad.addColorStop(0, `rgba(20, 184, 166, ${scottAlpha * 0.6})`);
      inkGrad.addColorStop(0.5, `rgba(13, 148, 136, ${scottAlpha * 0.4})`);
      inkGrad.addColorStop(1, "rgba(15, 118, 110, 0)");
      ctx.fillStyle = inkGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, scottSize * (0.4 + progress * 0.6), 0, Math.PI * 2);
      ctx.fill();
      
      // Floating letters/words (literary effect)
      ctx.fillStyle = `rgba(94, 234, 212, ${scottAlpha * 0.8})`;
      ctx.font = `${10 * zoom}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const words = ["✦", "★", "◆", "✧"];
      for (let i = 0; i < 4; i++) {
        const wAngle = (i / 4) * Math.PI * 2 + progress * 3;
        const wDist = scottSize * (0.4 + progress * 0.5);
        const wx = screenPos.x + Math.cos(wAngle) * wDist;
        const wy = screenPos.y + Math.sin(wAngle) * wDist * 0.5 - progress * 10 * zoom;
        ctx.fillText(words[i], wx, wy);
      }
      break;
      
    case "sonic_blast":
      // Tenor multi-target sonic attack
      const sonicSize = effect.size * zoom;
      const sonicAlpha = alpha;
      
      // Multiple expanding sonic rings
      for (let ring = 0; ring < 4; ring++) {
        const ringDelay = ring * 0.1;
        const ringProgress = Math.max(0, (progress - ringDelay) / (1 - ringDelay));
        if (ringProgress <= 0) continue;
        
        const ringRadius = sonicSize * ringProgress;
        const ringAlphaVal = sonicAlpha * (1 - ringProgress) * 0.7;
        
        ctx.strokeStyle = `rgba(139, 92, 246, ${ringAlphaVal})`;
        ctx.lineWidth = (4 - ring) * zoom;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y, ringRadius, ringRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Central burst
      const burstGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, sonicSize * 0.3
      );
      burstGrad.addColorStop(0, `rgba(200, 180, 255, ${sonicAlpha})`);
      burstGrad.addColorStop(0.5, `rgba(139, 92, 246, ${sonicAlpha * 0.5})`);
      burstGrad.addColorStop(1, "rgba(100, 50, 200, 0)");
      ctx.fillStyle = burstGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, sonicSize * 0.3 * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
      
      // Music notes floating
      ctx.fillStyle = `rgba(220, 200, 255, ${sonicAlpha * 0.9})`;
      ctx.font = `${12 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const notes = ["♪", "♫", "♬"];
      for (let i = 0; i < 3; i++) {
        const nAngle = (i / 3) * Math.PI * 2 + progress * 5;
        const nDist = sonicSize * (0.3 + progress * 0.5);
        ctx.fillText(
          notes[i],
          screenPos.x + Math.cos(nAngle) * nDist,
          screenPos.y + Math.sin(nAngle) * nDist * 0.4
        );
      }
      break;

    // ========== TOWER DEBUFF EFFECTS ==========
    case "tower_debuff_slow": {
      // Blue clock/timer effect - slowed attack speed
      const towerSlowSize = effect.size * zoom;
      const towerSlowPulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
      
      // Outer ring
      ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.6 * towerSlowPulse})`;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, towerSlowSize * 0.8, towerSlowSize * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Clock hands effect
      const clockAngle = Date.now() / 500;
      ctx.strokeStyle = `rgba(147, 197, 253, ${alpha * 0.8})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - towerSlowSize * 0.2);
      ctx.lineTo(screenPos.x + Math.cos(clockAngle) * towerSlowSize * 0.4, screenPos.y - towerSlowSize * 0.2 + Math.sin(clockAngle) * towerSlowSize * 0.2);
      ctx.stroke();
      
      // Floating hourglass symbol
      ctx.fillStyle = `rgba(191, 219, 254, ${alpha * 0.9})`;
      ctx.font = `bold ${14 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⏳", screenPos.x, screenPos.y - towerSlowSize * 0.6 - Math.sin(Date.now() / 300) * 3 * zoom);
      break;
    }

    case "tower_debuff_weaken": {
      // Red damage down effect
      const towerWeakenSize = effect.size * zoom;
      const towerWeakenPulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
      
      // Red aura
      const towerWeakenGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, towerWeakenSize
      );
      towerWeakenGrad.addColorStop(0, `rgba(239, 68, 68, ${alpha * 0.3 * towerWeakenPulse})`);
      towerWeakenGrad.addColorStop(0.5, `rgba(185, 28, 28, ${alpha * 0.2})`);
      towerWeakenGrad.addColorStop(1, "rgba(127, 29, 29, 0)");
      ctx.fillStyle = towerWeakenGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, towerWeakenSize, towerWeakenSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Down arrow
      ctx.fillStyle = `rgba(252, 165, 165, ${alpha * 0.9})`;
      ctx.font = `bold ${16 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⬇", screenPos.x, screenPos.y - towerWeakenSize * 0.5 - Math.sin(Date.now() / 200) * 4 * zoom);
      break;
    }

    case "tower_debuff_blind": {
      // Purple eye effect - reduced range
      const towerBlindSize = effect.size * zoom;
      const towerBlindPulse = Math.sin(Date.now() / 250) * 0.25 + 0.75;
      
      // Purple haze
      const towerBlindGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, towerBlindSize * 1.2
      );
      towerBlindGrad.addColorStop(0, `rgba(168, 85, 247, ${alpha * 0.25 * towerBlindPulse})`);
      towerBlindGrad.addColorStop(0.6, `rgba(126, 34, 206, ${alpha * 0.15})`);
      towerBlindGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
      ctx.fillStyle = towerBlindGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, towerBlindSize * 1.2, towerBlindSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Closed eye symbol
      ctx.fillStyle = `rgba(216, 180, 254, ${alpha * 0.9})`;
      ctx.font = `bold ${14 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("👁", screenPos.x, screenPos.y - towerBlindSize * 0.5);
      // Strike through
      ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.8})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 8 * zoom, screenPos.y - towerBlindSize * 0.5 - 5 * zoom);
      ctx.lineTo(screenPos.x + 8 * zoom, screenPos.y - towerBlindSize * 0.5 + 5 * zoom);
      ctx.stroke();
      break;
    }

    case "tower_debuff_disable": {
      // Rose/red full disable effect
      const towerDisableSize = effect.size * zoom;
      const towerDisablePulse = Math.sin(Date.now() / 100) * 0.4 + 0.6;
      
      // Intense red aura
      const towerDisableGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, towerDisableSize * 1.3
      );
      towerDisableGrad.addColorStop(0, `rgba(225, 29, 72, ${alpha * 0.4 * towerDisablePulse})`);
      towerDisableGrad.addColorStop(0.4, `rgba(190, 18, 60, ${alpha * 0.3})`);
      towerDisableGrad.addColorStop(0.7, `rgba(136, 19, 55, ${alpha * 0.15})`);
      towerDisableGrad.addColorStop(1, "rgba(76, 5, 25, 0)");
      ctx.fillStyle = towerDisableGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, towerDisableSize * 1.3, towerDisableSize * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // X symbol
      ctx.strokeStyle = `rgba(251, 113, 133, ${alpha * 0.9})`;
      ctx.lineWidth = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 10 * zoom, screenPos.y - towerDisableSize * 0.3 - 10 * zoom);
      ctx.lineTo(screenPos.x + 10 * zoom, screenPos.y - towerDisableSize * 0.3 + 10 * zoom);
      ctx.moveTo(screenPos.x + 10 * zoom, screenPos.y - towerDisableSize * 0.3 - 10 * zoom);
      ctx.lineTo(screenPos.x - 10 * zoom, screenPos.y - towerDisableSize * 0.3 + 10 * zoom);
      ctx.stroke();
      
      // "DISABLED" text
      ctx.fillStyle = `rgba(254, 205, 211, ${alpha * 0.8})`;
      ctx.font = `bold ${8 * zoom}px Arial`;
      ctx.fillText("DISABLED", screenPos.x, screenPos.y - towerDisableSize * 0.7);
      break;
    }

    // ========== UNIT STATUS EFFECT VISUALS ==========
    case "status_burning": {
      // Fire effect on unit
      const statusBurnSize = effect.size * zoom;
      const statusBurnFlicker = Math.random() * 0.3 + 0.7;
      
      // Fire particles rising
      for (let i = 0; i < 5; i++) {
        const fireX = screenPos.x + (Math.random() - 0.5) * statusBurnSize * 0.6;
        const fireY = screenPos.y - Math.random() * statusBurnSize * 0.8 - progress * statusBurnSize * 0.5;
        const fireSize = (3 + Math.random() * 4) * zoom * (1 - progress * 0.5);
        
        const fireGradient = ctx.createRadialGradient(fireX, fireY, 0, fireX, fireY, fireSize);
        fireGradient.addColorStop(0, `rgba(255, 255, 150, ${alpha * statusBurnFlicker})`);
        fireGradient.addColorStop(0.4, `rgba(255, 150, 50, ${alpha * 0.8 * statusBurnFlicker})`);
        fireGradient.addColorStop(1, "rgba(255, 50, 0, 0)");
        ctx.fillStyle = fireGradient;
        ctx.beginPath();
        ctx.arc(fireX, fireY, fireSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Base fire glow
      ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, statusBurnSize * 0.5, statusBurnSize * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "status_slowed": {
      // Ice/frost effect
      const statusSlowedSize = effect.size * zoom;
      const statusFrostPulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
      
      // Frost aura
      const statusFrostGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, statusSlowedSize * 0.8
      );
      statusFrostGrad.addColorStop(0, `rgba(147, 197, 253, ${alpha * 0.4 * statusFrostPulse})`);
      statusFrostGrad.addColorStop(0.5, `rgba(96, 165, 250, ${alpha * 0.2})`);
      statusFrostGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = statusFrostGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, statusSlowedSize * 0.8, statusSlowedSize * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Ice crystals
      ctx.strokeStyle = `rgba(191, 219, 254, ${alpha * 0.7})`;
      ctx.lineWidth = 1.5 * zoom;
      for (let i = 0; i < 4; i++) {
        const crystalAngle = (i / 4) * Math.PI * 2 + Date.now() / 1000;
        const crystalDist = statusSlowedSize * 0.4;
        const cx = screenPos.x + Math.cos(crystalAngle) * crystalDist;
        const cy = screenPos.y + Math.sin(crystalAngle) * crystalDist * 0.5 - statusSlowedSize * 0.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 4 * zoom);
        ctx.lineTo(cx + 3 * zoom, cy);
        ctx.lineTo(cx, cy + 4 * zoom);
        ctx.lineTo(cx - 3 * zoom, cy);
        ctx.closePath();
        ctx.stroke();
      }
      break;
    }

    case "status_poisoned": {
      // Poison drip effect
      const statusPoisonSize = effect.size * zoom;
      const statusPoisonPulse = Math.sin(Date.now() / 250) * 0.25 + 0.75;
      
      // Green toxic aura
      const statusPoisonGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, statusPoisonSize * 0.7
      );
      statusPoisonGrad.addColorStop(0, `rgba(34, 197, 94, ${alpha * 0.35 * statusPoisonPulse})`);
      statusPoisonGrad.addColorStop(0.5, `rgba(22, 163, 74, ${alpha * 0.2})`);
      statusPoisonGrad.addColorStop(1, "rgba(21, 128, 61, 0)");
      ctx.fillStyle = statusPoisonGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, statusPoisonSize * 0.7, statusPoisonSize * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Poison bubbles
      for (let i = 0; i < 3; i++) {
        const bubbleX = screenPos.x + (Math.sin(Date.now() / 200 + i * 2) * statusPoisonSize * 0.3);
        const bubbleY = screenPos.y - (Date.now() / 10 + i * 100) % (statusPoisonSize * 0.6);
        const bubbleSize = (2 + i) * zoom;
        ctx.fillStyle = `rgba(134, 239, 172, ${alpha * 0.6 * (1 - (bubbleY - screenPos.y + statusPoisonSize * 0.6) / (statusPoisonSize * 0.6))})`;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Skull symbol
      ctx.fillStyle = `rgba(187, 247, 208, ${alpha * 0.8})`;
      ctx.font = `${10 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☠", screenPos.x, screenPos.y - statusPoisonSize * 0.5);
      break;
    }

    case "status_stunned": {
      // Stars circling effect
      const statusStunSize = effect.size * zoom;
      const statusStunRotation = Date.now() / 200;
      
      // Dazed spiral
      ctx.strokeStyle = `rgba(250, 204, 21, ${alpha * 0.5})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 4; angle += 0.2) {
        const spiralRadius = (angle / (Math.PI * 4)) * statusStunSize * 0.5;
        const sx = screenPos.x + Math.cos(angle + statusStunRotation) * spiralRadius;
        const sy = screenPos.y - statusStunSize * 0.4 + Math.sin(angle + statusStunRotation) * spiralRadius * 0.4;
        if (angle === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      
      // Circling stars
      ctx.fillStyle = `rgba(253, 224, 71, ${alpha * 0.9})`;
      ctx.font = `${10 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < 3; i++) {
        const starAngle = (i / 3) * Math.PI * 2 + statusStunRotation;
        const starDist = statusStunSize * 0.4;
        const starX = screenPos.x + Math.cos(starAngle) * starDist;
        const starY = screenPos.y - statusStunSize * 0.4 + Math.sin(starAngle) * starDist * 0.4;
        ctx.fillText("★", starX, starY);
      }
      break;
    }

    default:
      // Generic effect
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, effect.size * zoom * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// PROJECTILE RENDERING
// ============================================================================

export function renderProjectile(
  ctx: CanvasRenderingContext2D,
  proj: Projectile,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
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

  ctx.save();

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

  ctx.translate(screenPos.x, screenPos.y);
  ctx.rotate(proj.rotation);

  const projSize = proj.type === "cannon" ? 7 : proj.type === "hero" ? 6 : 5;

  if (proj.type === "flame") {
    // Flame projectile
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 15 * zoom;
    for (let i = 0; i < 4; i++) {
      const flameOffset = (Math.random() - 0.5) * 6 * zoom;
      const flameSize = (4 + Math.random() * 4) * zoom;
      const flameGrad = ctx.createRadialGradient(flameOffset, flameOffset * 0.5, 0, flameOffset, flameOffset * 0.5, flameSize);
      flameGrad.addColorStop(0, "rgba(255, 255, 100, 0.9)");
      flameGrad.addColorStop(0.4, "rgba(200, 120, 0, 0.7)");
      flameGrad.addColorStop(1, "rgba(255, 50, 0, 0)");
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(flameOffset, flameOffset * 0.5, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (proj.type === "bullet") {
    // Bullet tracer
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 8 * zoom;
    ctx.fillStyle = "rgba(255, 200, 0, 0.6)";
    ctx.fillRect(-8 * zoom, -1.5 * zoom, 16 * zoom, 3 * zoom);
    ctx.fillStyle = "#ffdd44";
    ctx.beginPath();
    ctx.arc(4 * zoom, 0, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  } else if (proj.type === "lab" || proj.type === "lightning") {
    // Lightning bolt
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 12 * zoom;
    const boltGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8 * zoom);
    boltGrad.addColorStop(0, "#ffffff");
    boltGrad.addColorStop(0.3, "#ccffff");
    boltGrad.addColorStop(0.6, "#00ffff");
    boltGrad.addColorStop(1, "#0088ff");
    ctx.fillStyle = boltGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  } else if (proj.type === "arch") {
    // Music note
    ctx.shadowColor = "#32c864";
    ctx.shadowBlur = 15 * zoom;
    const noteGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * zoom);
    noteGrad.addColorStop(0, "#ffffff");
    noteGrad.addColorStop(0.3, "#aaffaa");
    noteGrad.addColorStop(0.6, "#32c864");
    noteGrad.addColorStop(1, "#228844");
    ctx.fillStyle = noteGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Default projectile
    ctx.shadowColor = proj.type === "cannon" ? "#ff6b35" : "#c9a227";
    ctx.shadowBlur = 12 * zoom;
    const projGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, projSize * zoom);
    if (proj.type === "cannon") {
      projGrad.addColorStop(0, "#ffff00");
      projGrad.addColorStop(0.5, "#ff6600");
      projGrad.addColorStop(1, "#cc3300");
    } else {
      projGrad.addColorStop(0, "#ffffff");
      projGrad.addColorStop(0.5, "#c9a227");
      projGrad.addColorStop(1, "#ff8800");
    }
    ctx.fillStyle = projGrad;
    ctx.beginPath();
    ctx.arc(0, 0, projSize * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
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
): void {
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
  ctx.fillStyle = particle.color;

  switch (particle.type) {
    case "spark":
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "smoke":
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "fire":
      const fireGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, size);
      fireGrad.addColorStop(0, "#ffff00");
      fireGrad.addColorStop(0.5, particle.color);
      fireGrad.addColorStop(1, "rgba(200, 0, 0, 0)");
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "ice":
      ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y - size);
      ctx.lineTo(screenPos.x + size * 0.7, screenPos.y);
      ctx.lineTo(screenPos.x, screenPos.y + size);
      ctx.lineTo(screenPos.x - size * 0.7, screenPos.y);
      ctx.closePath();
      ctx.fill();
      break;

    case "gold":
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#c9a227";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "magic":
      ctx.fillStyle = "#8b5cf6";
      ctx.shadowColor = "#8b5cf6";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// TOWER DEBUFF EFFECTS RENDERING
// ============================================================================

// RGB color type for debuff colors
interface DebuffColor {
  r: number;
  g: number;
  b: number;
}

// Helper to create rgba string from color and alpha
function rgba(color: DebuffColor, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

// Helper function to draw a broken/dimmed star (inverted, sad look)
function drawDebuffStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: DebuffColor,
  alpha: number,
  broken: boolean = false
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation + Math.PI); // Inverted (points down for sad effect)
  
  const points = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    // Add slight wobble for broken effect
    const wobble = broken ? Math.sin(i * 1.3) * size * 0.15 : 0;
    const px = Math.cos(angle) * (radius + wobble);
    const py = Math.sin(angle) * (radius + wobble);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  
  // Fill with gradient for depth
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
  grad.addColorStop(0, rgba(color, alpha * 0.9));
  grad.addColorStop(0.6, rgba(color, alpha * 0.5));
  grad.addColorStop(1, rgba(color, alpha * 0.2));
  ctx.fillStyle = grad;
  ctx.fill();
  
  // Darker outline
  ctx.strokeStyle = rgba(color, alpha * 0.7);
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Add crack lines if broken
  if (broken) {
    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.4})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.3);
    ctx.lineTo(size * 0.2, size * 0.4);
    ctx.moveTo(-size * 0.1, 0);
    ctx.lineTo(size * 0.3, size * 0.1);
    ctx.stroke();
  }
  
  ctx.restore();
}

// Lucide-style icon drawers
function drawSlowIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: DebuffColor, alpha: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  // Clock circle
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  
  // Clock hands (pointing down for sad/slow feel)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, size * 0.35); // Long hand pointing down
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.25, size * 0.15); // Short hand
  ctx.stroke();
  
  ctx.restore();
}

function drawWeakenIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: DebuffColor, alpha: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  // Trending down arrow (Lucide trending-down style)
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, -size * 0.3);
  ctx.lineTo(0, size * 0.1);
  ctx.lineTo(size * 0.5, -size * 0.15);
  ctx.stroke();
  
  // Arrow head pointing down-right
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -size * 0.15);
  ctx.lineTo(size * 0.2, -size * 0.15);
  ctx.moveTo(size * 0.5, -size * 0.15);
  ctx.lineTo(size * 0.5, size * 0.15);
  ctx.stroke();
  
  ctx.restore();
}

function drawBlindIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: DebuffColor, alpha: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  // Eye shape (Lucide eye-off style)
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.6, size * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Pupil
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
  ctx.stroke();
  
  // Diagonal slash through
  ctx.strokeStyle = rgba({ r: 200, g: 60, b: 60 }, alpha);
  ctx.lineWidth = size * 0.18;
  ctx.beginPath();
  ctx.moveTo(-size * 0.7, -size * 0.5);
  ctx.lineTo(size * 0.7, size * 0.5);
  ctx.stroke();
  
  ctx.restore();
}

function drawDisableIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: DebuffColor, alpha: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  // Circle with slash (Lucide ban style)
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
  ctx.stroke();
  
  // Diagonal slash
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, -size * 0.45);
  ctx.lineTo(size * 0.45, size * 0.45);
  ctx.stroke();
  
  ctx.restore();
}

export function renderTowerDebuffEffects(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  screenPos: Position,
  zoom: number
): void {
  if (!tower.debuffs || tower.debuffs.length === 0) return;
  
  // Guard against invalid position or zoom values
  if (!screenPos || !isFinite(screenPos.x) || !isFinite(screenPos.y) || !isFinite(zoom) || zoom <= 0) {
    return;
  }
  
  const now = Date.now();
  const activeDebuffs = tower.debuffs.filter(d => d.until > now);
  
  if (activeDebuffs.length === 0) return;
  
  ctx.save();
  
  const baseSize = 35; // Tower visual radius
  const time = now / 1000;
  
  for (const debuff of activeDebuffs) {
    const remaining = (debuff.until - now) / 1000;
    const alpha = Math.min(1, remaining / 2); // Fade out in last 2 seconds
    
    // Determine debuff-specific colors (all muted/dark for sad effect)
    let primaryColor: DebuffColor;
    let secondaryColor: DebuffColor;
    let glowColor: DebuffColor;
    
    switch (debuff.type) {
      case "slow":
        primaryColor = { r: 100, g: 140, b: 180 }; // Muted cold blue
        secondaryColor = { r: 60, g: 90, b: 130 };
        glowColor = { r: 80, g: 120, b: 160 };
        break;
      case "weaken":
        primaryColor = { r: 180, g: 80, b: 80 }; // Muted blood red
        secondaryColor = { r: 130, g: 50, b: 50 };
        glowColor = { r: 150, g: 60, b: 60 };
        break;
      case "blind":
        primaryColor = { r: 120, g: 80, b: 140 }; // Muted purple
        secondaryColor = { r: 80, g: 50, b: 100 };
        glowColor = { r: 100, g: 60, b: 120 };
        break;
      case "disable":
        primaryColor = { r: 60, g: 60, b: 70 }; // Dark gray/black
        secondaryColor = { r: 40, g: 40, b: 50 };
        glowColor = { r: 80, g: 80, b: 90 };
        break;
      default:
        primaryColor = { r: 100, g: 100, b: 100 };
        secondaryColor = { r: 70, g: 70, b: 70 };
        glowColor = { r: 90, g: 90, b: 90 };
    }
    
    // Dark oppressive aura underneath
    const auraGrad = ctx.createRadialGradient(
      screenPos.x, screenPos.y, 0,
      screenPos.x, screenPos.y, baseSize * zoom * 1.3
    );
    auraGrad.addColorStop(0, rgba(secondaryColor, alpha * 0.25));
    auraGrad.addColorStop(0.5, rgba(glowColor, alpha * 0.15));
    auraGrad.addColorStop(1, rgba(secondaryColor, 0));
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y, baseSize * zoom * 1.3, baseSize * zoom * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Dripping/falling particles for sad effect
    for (let i = 0; i < 4; i++) {
      const dropPhase = ((time * 0.5 + i * 0.25) % 1);
      const dropX = screenPos.x + Math.sin(i * 2.1 + time * 0.3) * baseSize * zoom * 0.6;
      const dropY = screenPos.y - baseSize * zoom * 0.3 + dropPhase * baseSize * zoom * 1.2;
      const dropAlpha = Math.sin(dropPhase * Math.PI) * alpha * 0.6;
      const dropSize = (2 + Math.sin(i) * 0.5) * zoom;
      
      // Teardrop shape
      ctx.fillStyle = rgba(primaryColor, dropAlpha);
      ctx.beginPath();
      ctx.ellipse(dropX, dropY, dropSize * 0.6, dropSize, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 3 rotating broken stars (counterclockwise for ominous feel)
    const starRadius = baseSize * zoom * 0.7;
    const starSize = 6 * zoom;
    const rotationSpeed = -time * 1.2; // Negative for counterclockwise
    
    for (let i = 0; i < 3; i++) {
      const starAngle = rotationSpeed + (i * Math.PI * 2) / 3;
      const starX = screenPos.x + Math.cos(starAngle) * starRadius;
      const starY = screenPos.y + Math.sin(starAngle) * starRadius * 0.5; // Flattened for isometric
      
      // Pulsing/flickering effect
      const flicker = 0.6 + Math.sin(time * 4 + i * 1.5) * 0.4;
      
      drawDebuffStar(
        ctx,
        starX,
        starY - baseSize * zoom * 0.35, // Float above tower
        starSize * flicker,
        starAngle + time * 0.5, // Spin individually too
        primaryColor,
        alpha * flicker,
        true // Broken/cracked
      );
    }
    
    // Icon position and pulse
    const iconY = screenPos.y - baseSize * zoom * 0.85;
    const iconPulse = 0.8 + Math.sin(time * 2) * 0.2;
    const iconSize = 8 * zoom;
    const circleRadius = iconSize * 1.3;
    
    // Draw circle background for icon contrast
    const circleBgGrad = ctx.createRadialGradient(
      screenPos.x, iconY, 0,
      screenPos.x, iconY, circleRadius
    );
    circleBgGrad.addColorStop(0, `rgba(20, 20, 25, ${alpha * 0.85})`);
    circleBgGrad.addColorStop(0.7, `rgba(30, 30, 35, ${alpha * 0.75})`);
    circleBgGrad.addColorStop(1, `rgba(40, 40, 45, ${alpha * 0.5})`);
    ctx.fillStyle = circleBgGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, iconY, circleRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Circle border
    ctx.strokeStyle = rgba(primaryColor, alpha * 0.6);
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, iconY, circleRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw Lucide-style icon based on debuff type
    switch (debuff.type) {
      case "slow":
        drawSlowIcon(ctx, screenPos.x, iconY, iconSize, primaryColor, alpha * iconPulse);
        break;
      case "weaken":
        drawWeakenIcon(ctx, screenPos.x, iconY, iconSize, primaryColor, alpha * iconPulse);
        break;
      case "blind":
        drawBlindIcon(ctx, screenPos.x, iconY, iconSize, primaryColor, alpha * iconPulse);
        break;
      case "disable":
        drawDisableIcon(ctx, screenPos.x, iconY, iconSize, primaryColor, alpha * iconPulse);
        break;
    }
    
    // Subtle dark vignette ring
    ctx.strokeStyle = rgba(secondaryColor, alpha * 0.3);
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([3 * zoom, 5 * zoom]);
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y, baseSize * zoom * 0.9, baseSize * zoom * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  ctx.restore();
}

// ============================================================================
// TROOP/HERO STATUS EFFECT RENDERING
// ============================================================================

export function renderUnitStatusEffects(
  ctx: CanvasRenderingContext2D,
  unit: Troop | Hero,
  screenPos: Position,
  zoom: number
): void {
  // Guard against invalid position or zoom values
  if (!screenPos || !isFinite(screenPos.x) || !isFinite(screenPos.y) || !isFinite(zoom) || zoom <= 0) {
    return;
  }
  
  const now = Date.now();
  ctx.save();
  
  const baseSize = 15; // Unit visual radius
  let effectIndex = 0;
  
  // Burning effect
  if (unit.burning && unit.burnUntil && unit.burnUntil > now) {
    const remaining = (unit.burnUntil - now) / 1000;
    const alpha = Math.min(1, remaining / 2);
    const flicker = Math.random() * 0.3 + 0.7;
    
    // Fire particles rising
    for (let i = 0; i < 4; i++) {
      const fireX = screenPos.x + (Math.random() - 0.5) * baseSize * zoom * 0.8;
      const fireY = screenPos.y - Math.random() * baseSize * zoom - (now % 500) / 500 * baseSize * zoom * 0.5;
      const fireSize = (2 + Math.random() * 3) * zoom;
      
      const fireGrad = ctx.createRadialGradient(fireX, fireY, 0, fireX, fireY, fireSize);
      fireGrad.addColorStop(0, `rgba(255, 255, 150, ${alpha * flicker})`);
      fireGrad.addColorStop(0.4, `rgba(255, 120, 50, ${alpha * 0.8 * flicker})`);
      fireGrad.addColorStop(1, "rgba(255, 50, 0, 0)");
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(fireX, fireY, fireSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Fire icon
    ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.9})`;
    ctx.font = `${8 * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔥", screenPos.x - baseSize * zoom * 0.8, screenPos.y - baseSize * zoom * 1.2);
    effectIndex++;
  }
  
  // Slowed/Frozen effect
  if (unit.slowed && unit.slowUntil && unit.slowUntil > now) {
    const remaining = (unit.slowUntil - now) / 1000;
    const alpha = Math.min(1, remaining / 2);
    const frostPulse = Math.sin(now / 300) * 0.2 + 0.8;
    
    // Frost aura
    const frostGrad = ctx.createRadialGradient(
      screenPos.x, screenPos.y, 0,
      screenPos.x, screenPos.y, baseSize * zoom
    );
    frostGrad.addColorStop(0, `rgba(147, 197, 253, ${alpha * 0.3 * frostPulse})`);
    frostGrad.addColorStop(0.6, `rgba(96, 165, 250, ${alpha * 0.15})`);
    frostGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.fillStyle = frostGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, baseSize * zoom, 0, Math.PI * 2);
    ctx.fill();
    
    // Ice crystals
    ctx.strokeStyle = `rgba(191, 219, 254, ${alpha * 0.6})`;
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 3; i++) {
      const crystalAngle = (i / 3) * Math.PI * 2 + now / 800;
      const crystalDist = baseSize * zoom * 0.7;
      const cx = screenPos.x + Math.cos(crystalAngle) * crystalDist;
      const cy = screenPos.y + Math.sin(crystalAngle) * crystalDist * 0.5 - baseSize * zoom * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 3 * zoom);
      ctx.lineTo(cx + 2 * zoom, cy);
      ctx.lineTo(cx, cy + 3 * zoom);
      ctx.lineTo(cx - 2 * zoom, cy);
      ctx.closePath();
      ctx.stroke();
    }
    
    // Snowflake icon
    ctx.fillStyle = `rgba(191, 219, 254, ${alpha * 0.9})`;
    ctx.font = `${8 * zoom}px Arial`;
    ctx.fillText("❄", screenPos.x + baseSize * zoom * 0.8 * (effectIndex > 0 ? 1 : 0), screenPos.y - baseSize * zoom * 1.2);
    effectIndex++;
  }
  
  // Poisoned effect
  if (unit.poisoned && unit.poisonUntil && unit.poisonUntil > now) {
    const remaining = (unit.poisonUntil - now) / 1000;
    const alpha = Math.min(1, remaining / 2);
    const poisonPulse = Math.sin(now / 250) * 0.25 + 0.75;
    
    // Toxic aura
    const poisonGrad = ctx.createRadialGradient(
      screenPos.x, screenPos.y, 0,
      screenPos.x, screenPos.y, baseSize * zoom * 0.9
    );
    poisonGrad.addColorStop(0, `rgba(34, 197, 94, ${alpha * 0.25 * poisonPulse})`);
    poisonGrad.addColorStop(0.5, `rgba(22, 163, 74, ${alpha * 0.15})`);
    poisonGrad.addColorStop(1, "rgba(21, 128, 61, 0)");
    ctx.fillStyle = poisonGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, baseSize * zoom * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    // Poison bubbles
    for (let i = 0; i < 2; i++) {
      const bubbleX = screenPos.x + (Math.sin(now / 200 + i * 2) * baseSize * zoom * 0.4);
      const bubbleY = screenPos.y - (now / 15 + i * 50) % (baseSize * zoom);
      const bubbleSize = (1.5 + i * 0.5) * zoom;
      ctx.fillStyle = `rgba(134, 239, 172, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Skull icon
    ctx.fillStyle = `rgba(187, 247, 208, ${alpha * 0.8})`;
    ctx.font = `${8 * zoom}px Arial`;
    const offsetX = effectIndex > 0 ? effectIndex * baseSize * zoom * 0.6 : 0;
    ctx.fillText("☠", screenPos.x + offsetX, screenPos.y - baseSize * zoom * 1.2);
    effectIndex++;
  }
  
  // Stunned effect
  if (unit.stunned && unit.stunUntil && unit.stunUntil > now) {
    const remaining = (unit.stunUntil - now) / 1000;
    const alpha = Math.min(1, remaining / 2);
    const rotation = now / 200;
    
    // Daze spiral
    ctx.strokeStyle = `rgba(250, 204, 21, ${alpha * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 3; angle += 0.3) {
      const spiralRadius = (angle / (Math.PI * 3)) * baseSize * zoom * 0.6;
      const sx = screenPos.x + Math.cos(angle + rotation) * spiralRadius;
      const sy = screenPos.y - baseSize * zoom * 0.7 + Math.sin(angle + rotation) * spiralRadius * 0.4;
      if (angle === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    
    // Circling stars
    ctx.fillStyle = `rgba(253, 224, 71, ${alpha * 0.9})`;
    ctx.font = `${7 * zoom}px Arial`;
    for (let i = 0; i < 3; i++) {
      const starAngle = (i / 3) * Math.PI * 2 + rotation;
      const starDist = baseSize * zoom * 0.5;
      const starX = screenPos.x + Math.cos(starAngle) * starDist;
      const starY = screenPos.y - baseSize * zoom * 0.7 + Math.sin(starAngle) * starDist * 0.3;
      ctx.fillText("★", starX, starY);
    }
  }
  
  ctx.restore();
}
