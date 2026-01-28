import type {
  Tower,
  Enemy,
  Effect,
  Particle,
  Position,
} from "../types";
import { worldToScreen, gridToWorld } from "../utils";

// Tower rendering 
export {
  renderTower,
  renderTowerRange,
  renderStationRange,
  renderTowerPreview,
} from "./towers";

export { renderSpecialBuilding } from "./towers/specialBuildings";


// Enemy rendering 
export { renderEnemy } from "./enemies";

// Hero rendering 
export { renderHero } from "./heroes";

// Troop rendering 
export { renderTroop } from "./troops";

// Hazard rendering
export { renderHazard } from "./hazards";

// Projectile rendering
export { renderProjectile } from "./projectiles";

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

          // Calculate barrel end position based on rotation
          const rotation = effect.rotation || sourceTower.rotation || 0;
          const cosR = Math.cos(rotation);
          const sinR = Math.sin(rotation);
          const foreshorten = Math.abs(cosR);

          // Turret radius - barrel starts from inside the turret
          const turretRadius = (towerLevel >= 3 ? 10 : 8) * zoom;

          // Barrel length varies by level
          const baseBarrelLength = (30 + towerLevel * 12) * zoom;
          const barrelLength = baseBarrelLength * (0.4 + foreshorten * 0.6);

          // Projectile spawns from barrel end (turret radius + barrel length)
          const totalLength = turretRadius + barrelLength;
          sourceX = towerScreen.x + cosR * totalLength;
          sourceY = turretY + sinR * totalLength * 0.5;
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
          // Gatling bullets - spawn from barrel end, not center
          // Calculate barrel end position based on rotation
          const rotation = effect.rotation || 0;
          const cosR = Math.cos(rotation);
          const sinR = Math.sin(rotation);
          const foreshorten = Math.abs(cosR);

          // Barrel length adjusted for foreshortening
          const barrelOffset = -42 * zoom * (0.5 + foreshorten * 0.5);

          // Actual bullet source is at the end of the barrel
          const bulletSourceX = sourceX + cosR * barrelOffset;
          const bulletSourceY = sourceY + sinR * barrelOffset * 0.5;

          // Recalculate distance from new source
          const bulletDx = targetScreen.x - bulletSourceX;
          const bulletDy = targetScreen.y - bulletSourceY;
          const bulletDist = Math.sqrt(
            bulletDx * bulletDx + bulletDy * bulletDy
          );

          // Multiple spinning barrels = multiple bullet streams
          for (let barrel = 0; barrel < 3; barrel++) {
            // Slight perpendicular offset for each barrel
            const barrelAngle =
              (Date.now() / 50 + (barrel * Math.PI * 2) / 8) % (Math.PI * 2);
            const perpOffset = Math.sin(barrelAngle) * 3 * zoom;
            const perpX = -sinR * perpOffset;
            const perpY = cosR * perpOffset * 0.5;

            const thisSourceX = bulletSourceX + perpX;
            const thisSourceY = bulletSourceY + perpY;

            for (let b = 0; b < 2; b++) {
              const bulletT = Math.min(
                1,
                progress * 1.8 + barrel * 0.08 + b * 0.12
              );
              if (bulletT > 0 && bulletT < 1) {
                const bulletX = thisSourceX + bulletDx * bulletT;
                const bulletY = thisSourceY + bulletDy * bulletT;

                ctx.fillStyle = `rgba(255, 220, 100, ${alpha})`;
                ctx.shadowColor = "#ffcc00";
                ctx.shadowBlur = 10 * zoom;
                ctx.beginPath();
                ctx.arc(bulletX, bulletY, 3.5 * zoom, 0, Math.PI * 2);
                ctx.fill();

                // Hot core
                ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(bulletX, bulletY, 1.5 * zoom, 0, Math.PI * 2);
                ctx.fill();

                // Tracer line
                const tracerLen = 18 * zoom;
                const tracerStartT = Math.max(
                  0,
                  bulletT - tracerLen / bulletDist
                );
                ctx.strokeStyle = `rgba(255, 180, 50, ${alpha * 0.6})`;
                ctx.lineWidth = 2.5 * zoom;
                ctx.beginPath();
                ctx.moveTo(
                  thisSourceX + bulletDx * tracerStartT,
                  thisSourceY + bulletDy * tracerStartT
                );
                ctx.lineTo(bulletX, bulletY);
                ctx.stroke();
              }
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

    case "meteor_falling": {
      // DETAILED Falling meteor animation - comes from TOP RIGHT
      if (!effect.targetPos) break;
      
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
      const groundGlowAlpha = progress * progress * 0.6;
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
        const emberProgress = (i / 8) * 0.7;
        const emberBaseX = meteorX - Math.cos(trailAngle) * outerTrailLength * emberProgress;
        const emberBaseY = meteorY - Math.sin(trailAngle) * outerTrailLength * emberProgress;
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
      
      // Jagged rocky meteor shape
      ctx.save();
      ctx.translate(meteorX, meteorY);
      ctx.rotate(Date.now() / 500 + meteorIdx);
      
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
        const jag = 0.7 + Math.sin(i * 3 + meteorIdx) * 0.3;
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
        const emberY = meteorY + Math.sin(orbitAngle) * orbitDist * 0.7;
        
        const emberGlow = ctx.createRadialGradient(emberX, emberY, 0, emberX, emberY, 5 * zoom);
        emberGlow.addColorStop(0, `rgba(255, 255, 200, ${alpha * 0.9})`);
        emberGlow.addColorStop(0.5, `rgba(255, 180, 50, ${alpha * 0.5})`);
        emberGlow.addColorStop(1, "rgba(255, 100, 0, 0)");
        ctx.fillStyle = emberGlow;
        ctx.beginPath();
        ctx.arc(emberX, emberY, 5 * zoom, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, ${200 + Math.floor(Math.random() * 55)}, ${100 + Math.floor(Math.random() * 100)}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(emberX, emberY, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

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
      const auraRadius = effect.size * zoom;
      const time = Date.now() / 1000;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(time * 3) * 0.2})`;
      ctx.lineWidth = 4 * zoom;
      ctx.setLineDash([15, 10]);
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        auraRadius,
        auraRadius * 0.5,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

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

    case "boulder_strike": {
      // Rocky's boulder throw ability - boulder flies from pos to targetPos
      ctx.save();
      
      const targetPos = effect.targetPos || effect.pos;
      const targetScreenPos = worldToScreen(
        targetPos,
        canvasWidth,
        canvasHeight,
        dpr,
        cameraOffset,
        cameraZoom
      );
      
      // Calculate current boulder position along the arc
      const startX = screenPos.x;
      const startY = screenPos.y;
      const endX = targetScreenPos.x;
      const endY = targetScreenPos.y;
      
      // Boulder travels in an arc
      const travelProgress = Math.min(progress * 1.5, 1); // Boulder reaches target at 66% of effect duration
      const currentX = startX + (endX - startX) * travelProgress;
      const arcHeight = 80 * zoom; // Height of the arc
      const arcY = -Math.sin(travelProgress * Math.PI) * arcHeight;
      const currentY = startY + (endY - startY) * travelProgress + arcY;
      
      const boulderSize = effect.size * zoom * 0.4;
      const rotation = travelProgress * Math.PI * 4; // Boulder rotates as it flies
      
      if (travelProgress < 1) {
        // Draw shadow on ground
        const shadowX = currentX;
        const shadowY = startY + (endY - startY) * travelProgress;
        const shadowScale = 1 - Math.abs(arcY) / (arcHeight * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * alpha * shadowScale})`;
        ctx.beginPath();
        ctx.ellipse(shadowX, shadowY + 5 * zoom, boulderSize * 0.8, boulderSize * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw the flying boulder
        ctx.save();
        ctx.translate(currentX, currentY);
        ctx.rotate(rotation);
        
        // Boulder shadow/depth
        ctx.shadowColor = "#4a3a2a";
        ctx.shadowBlur = 8 * zoom;
        ctx.shadowOffsetY = 3 * zoom;
        
        // Main boulder body - irregular rock shape
        const bGrad = ctx.createRadialGradient(-boulderSize * 0.3, -boulderSize * 0.3, 0, 0, 0, boulderSize);
        bGrad.addColorStop(0, "#a08060");
        bGrad.addColorStop(0.4, "#7a6040");
        bGrad.addColorStop(0.8, "#5a4030");
        bGrad.addColorStop(1, "#3a2820");
        ctx.fillStyle = bGrad;
        
        // Draw irregular rock shape
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const variance = 0.7 + (Math.sin(i * 2.7 + rotation * 0.1) * 0.3);
          const r = boulderSize * variance;
          if (i === 0) {
            ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          } else {
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
        }
        ctx.closePath();
        ctx.fill();
        
        // Rock texture/cracks
        ctx.strokeStyle = `rgba(40, 30, 20, 0.5)`;
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(-boulderSize * 0.3, -boulderSize * 0.2);
        ctx.lineTo(boulderSize * 0.2, boulderSize * 0.3);
        ctx.moveTo(boulderSize * 0.1, -boulderSize * 0.4);
        ctx.lineTo(-boulderSize * 0.1, boulderSize * 0.1);
        ctx.stroke();
        
        // Highlight
        ctx.fillStyle = `rgba(180, 150, 120, 0.4)`;
        ctx.beginPath();
        ctx.ellipse(-boulderSize * 0.25, -boulderSize * 0.25, boulderSize * 0.3, boulderSize * 0.2, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Trailing dust particles
        for (let i = 0; i < 3; i++) {
          const trailProgress = Math.max(0, travelProgress - i * 0.1);
          const trailX = startX + (endX - startX) * trailProgress;
          const trailArcY = -Math.sin(trailProgress * Math.PI) * arcHeight;
          const trailY = startY + (endY - startY) * trailProgress + trailArcY;
          const dustAlpha = alpha * 0.3 * (1 - i * 0.3);
          const dustSize = boulderSize * 0.2 * (1 - i * 0.2);
          
          ctx.fillStyle = `rgba(150, 130, 100, ${dustAlpha})`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, dustSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Impact effect (when boulder lands)
      if (travelProgress >= 0.9) {
        const impactProgress = (travelProgress - 0.9) / 0.1;
        const impactAlpha = alpha * (1 - impactProgress);
        const impactRadius = boulderSize * (1 + impactProgress * 2);
        
        // Dust cloud
        const dustGrad = ctx.createRadialGradient(
          endX, endY, 0,
          endX, endY, impactRadius * 2
        );
        dustGrad.addColorStop(0, `rgba(140, 110, 70, ${impactAlpha * 0.8})`);
        dustGrad.addColorStop(0.5, `rgba(110, 85, 50, ${impactAlpha * 0.5})`);
        dustGrad.addColorStop(1, `rgba(80, 60, 35, 0)`);
        ctx.fillStyle = dustGrad;
        ctx.beginPath();
        ctx.ellipse(endX, endY, impactRadius * 2, impactRadius, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ground crack/crater
        ctx.strokeStyle = `rgba(60, 45, 30, ${impactAlpha})`;
        ctx.lineWidth = 2 * zoom;
        for (let c = 0; c < 6; c++) {
          const crackAngle = (c / 6) * Math.PI * 2;
          const crackLen = impactRadius * (0.8 + Math.random() * 0.4);
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX + Math.cos(crackAngle) * crackLen,
            endY + Math.sin(crackAngle) * crackLen * 0.5
          );
          ctx.stroke();
        }
        
        // Flying debris
        for (let d = 0; d < 5; d++) {
          const debrisAngle = (d / 5) * Math.PI * 2 + impactProgress;
          const debrisDist = impactRadius * impactProgress * 1.5;
          const debrisX = endX + Math.cos(debrisAngle) * debrisDist;
          const debrisY = endY + Math.sin(debrisAngle) * debrisDist * 0.5 - impactProgress * 20 * zoom;
          
          ctx.fillStyle = `rgba(90, 70, 45, ${impactAlpha})`;
          ctx.beginPath();
          ctx.arc(debrisX, debrisY, (3 - impactProgress * 2) * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
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


// Re-export environment effects
export { renderEnvironment, renderAmbientVisuals } from "./maps/environment";

// Re-export path rendering functions
export {
  renderPath,
  renderSecondaryPath,
  gridToWorldPath,
  generateSmoothPath,
  addPathWobble,
  createSeededRandom,
  catmullRom,
  hexToRgba,
  type PathRenderContext,
} from "./scene/path";

// Re-export fog effects
export { renderRoadEndFog } from "./effects/fog";
