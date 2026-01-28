// Princeton Tower Defense - Effects Rendering Module
// Renders visual effects, projectiles, and particles

import type { Effect, Projectile, Particle, Position, Tower, Enemy } from "../../types";
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
