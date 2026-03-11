import type { Tower, Enemy, Effect, Position } from "../types";
import { ISO_Y_RATIO } from "../constants";
import { worldToScreen, gridToWorld } from "../utils";
import { drawOrganicBlobAt, type LightningColorScheme } from "./helpers";
import { renderTargetingReticle, RETICLE_COLORS } from "./ui/reticles";
import { getScenePressure } from "./performance";

// Performance utilities - critical for Firefox
export {
  isFirefox,
  getPerformanceSettings,
  setPerformanceSettings,
  setShadowBlur,
  clearShadow,
  clearGradientCache,
  getPerformanceDebugInfo,
  getScenePressure,
} from "./performance";

// Tower rendering
export {
  renderTower,
  renderTowerGroundTransition,
  getTowerFoundationSize,
  renderTowerRange,
  renderStationRange,
  renderTowerPreview,
} from "./towers";

export { renderSpecialBuilding } from "./towers/specialBuildings";

// Enemy rendering
export { renderEnemy, renderEnemyInspectIndicator } from "./enemies";

// Hero rendering
export { renderHero } from "./heroes";

// Troop rendering
export { renderTroop } from "./troops";

// Hazard rendering
export { renderHazard } from "./hazards";

// Projectile rendering
export { renderProjectile, setProjectileRenderTime } from "./projectiles";

// ============================================================================
// EFFECT RENDERING
// ============================================================================
function hashString32(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function tracePolyline(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>
): void {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
}

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
  cameraZoom?: number,
  effectDensityHint: number = 0,
) {
  const screenPos = worldToScreen(
    effect.pos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
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
        expRadius,
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
        Math.PI * 2,
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
          cameraZoom,
        );
        const intensity = Math.max(0, effect.intensity || 1);
        const scenePressure = getScenePressure();
        const lightningPressure = effectDensityHint + enemies.length * 0.25
          + (scenePressure.skipDecorativeEffects ? 40 : 0);
        const lowDetail = lightningPressure > 60 || scenePressure.forceSimplifiedGradients;
        const minimalDetail = lightningPressure > 90 || scenePressure.simplifyEnemies;

        const BOLT_PALETTES: Record<LightningColorScheme, {
          outer: string; mid: string; core: string;
          branch: string; branchCore: string;
          impactCenter: string; impactMid: string; impactEdge: string;
        }> = {
          blue: {
            outer: "30, 100, 255", mid: "0, 220, 255", core: "220, 255, 255",
            branch: "0, 200, 255", branchCore: "200, 255, 255",
            impactCenter: "200, 255, 255", impactMid: "0, 200, 255", impactEdge: "0, 100, 255",
          },
          yellow: {
            outer: "255, 170, 30", mid: "255, 230, 50", core: "255, 255, 220",
            branch: "255, 200, 0", branchCore: "255, 255, 200",
            impactCenter: "255, 255, 200", impactMid: "255, 200, 0", impactEdge: "255, 140, 0",
          },
          red: {
            outer: "255, 60, 30", mid: "255, 100, 80", core: "255, 220, 210",
            branch: "255, 80, 40", branchCore: "255, 200, 190",
            impactCenter: "255, 220, 210", impactMid: "255, 80, 40", impactEdge: "200, 20, 0",
          },
          violet: {
            outer: "70, 65, 230", mid: "110, 110, 255", core: "215, 225, 255",
            branch: "100, 100, 255", branchCore: "200, 210, 255",
            impactCenter: "215, 225, 255", impactMid: "100, 100, 255", impactEdge: "40, 35, 180",
          },
        };
        const boltScheme: LightningColorScheme =
          (effect.color as LightningColorScheme) ||
          (effect.type === "beam" ? "yellow" : "blue");
        const bp = BOLT_PALETTES[boltScheme] || BOLT_PALETTES.blue;

        // Find the source lab tower to get correct orb position
        let sourceX = screenPos.x;
        let sourceY = screenPos.y;

        // If we have a towerId, find that specific tower
        let sourceTower: Tower | undefined;
        if (effect.towerId) {
          sourceTower = towers.find((t) => t.id === effect.towerId);
        }

        // Fallback lookup is only useful for direct bolts. Chain hops are enemy-to-enemy links.
        if (!sourceTower && effect.type !== "chain") {
          for (const tower of towers) {
            if (tower.type === "lab") {
              const towerWorld = gridToWorld(tower.pos);
              const diffX = towerWorld.x - effect.pos.x;
              const diffY = towerWorld.y - effect.pos.y;
              const distToEffect = Math.sqrt(diffX * diffX + diffY * diffY);
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
            cameraZoom,
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

        // Lightning-specific alpha: full brightness on strike, then slow fade-out
        const effectAlpha = progress < 0.3
          ? 1
          : Math.max(0, (1 - progress) / 0.7);

        const dx = targetScreen.x - sourceX;
        const dy = targetScreen.y - sourceY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const angle = Math.atan2(dy, dx);
        const timeBucket = Math.floor(
          Date.now() / (minimalDetail ? 90 : lowDetail ? 70 : 50)
        );
        const seedBase = (hashString32(effect.id) ^ timeBucket) >>> 0;
        const noise = (seed: number) => seededNoise(seedBase + seed);

        const segments = minimalDetail
          ? Math.max(3, Math.floor(dist / 42))
          : lowDetail
            ? Math.max(4, Math.floor(dist / 30))
            : Math.max(6, Math.floor(dist / 22));
        const jitter = (minimalDetail ? 8 : lowDetail ? 14 : 22) * zoom * intensity;
        const mainPts: { x: number; y: number }[] = [
          { x: sourceX, y: sourceY },
        ];
        for (let i = 1; i < segments; i++) {
          const t = i / segments;
          const baseX = sourceX + dx * t;
          const baseY = sourceY + dy * t;
          const taper = 1 - Math.abs(t - 0.5) * 1.6;
          const n = (noise(17 + i * 17) - 0.5) * 2;
          const offset = n * jitter * Math.max(0, taper);
          mainPts.push({
            x: baseX + perpX * offset,
            y: baseY + perpY * offset,
          });
        }
        mainPts.push({ x: targetScreen.x, y: targetScreen.y });

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 0;

        // Layer 1: wide outer glow (no shadowBlur — just a wide translucent stroke)
        ctx.strokeStyle = `rgba(${bp.outer}, ${effectAlpha * 0.22 * intensity})`;
        ctx.lineWidth = (minimalDetail ? 5 : lowDetail ? 8 : 12) * zoom * intensity;
        tracePolyline(ctx, mainPts);
        ctx.stroke();

        // Layer 2: mid glow
        ctx.strokeStyle = `rgba(${bp.mid}, ${effectAlpha * 0.55 * intensity})`;
        ctx.lineWidth = (minimalDetail ? 2.5 : lowDetail ? 3.5 : 5) * zoom * intensity;
        tracePolyline(ctx, mainPts);
        ctx.stroke();

        if (!minimalDetail) {
          // Layer 3: white-hot core
          ctx.strokeStyle = `rgba(${bp.core}, ${effectAlpha * 0.9 * intensity})`;
          ctx.lineWidth = (lowDetail ? 1.2 : 1.8) * zoom * intensity;
          tracePolyline(ctx, mainPts);
          ctx.stroke();

          if (!lowDetail) {
            // Single branch fork
            const branchIdx = 1 + Math.floor(noise(41) * (segments - 2));
            const branchPt = mainPts[branchIdx];
            const branchAngle = angle + (noise(73) - 0.5) * Math.PI * 0.8;
            const branchLen = (12 + noise(53) * 20) * zoom * intensity;
            const brPts = [{ x: branchPt.x, y: branchPt.y }];
            for (let s = 1; s <= 2; s++) {
              const bt = s / 2;
              const bn = (noise(31 + s * 19) - 0.5) * 7 * zoom;
              brPts.push({
                x: branchPt.x + Math.cos(branchAngle) * branchLen * bt + Math.cos(branchAngle + Math.PI / 2) * bn,
                y: branchPt.y + Math.sin(branchAngle) * branchLen * bt + Math.sin(branchAngle + Math.PI / 2) * bn,
              });
            }

            ctx.strokeStyle = `rgba(${bp.branch}, ${effectAlpha * 0.35 * intensity})`;
            ctx.lineWidth = 2.4 * zoom * intensity;
            tracePolyline(ctx, brPts);
            ctx.stroke();

            ctx.strokeStyle = `rgba(${bp.branchCore}, ${effectAlpha * 0.6 * intensity})`;
            ctx.lineWidth = 0.9 * zoom * intensity;
            tracePolyline(ctx, brPts);
            ctx.stroke();
          }
        }

        // Impact glow halo
        const impactPulse = 0.7 + noise(913) * 0.3;
        if (!minimalDetail) {
          const impactRadius = (lowDetail ? 9 : 14) * zoom * intensity;
          const impGrad = ctx.createRadialGradient(
            targetScreen.x,
            targetScreen.y,
            0,
            targetScreen.x,
            targetScreen.y,
            impactRadius,
          );
          impGrad.addColorStop(0, `rgba(${bp.impactCenter}, ${effectAlpha * 0.6 * intensity * impactPulse})`);
          impGrad.addColorStop(0.4, `rgba(${bp.impactMid}, ${effectAlpha * 0.3 * intensity})`);
          impGrad.addColorStop(1, `rgba(${bp.impactEdge}, 0)`);
          ctx.fillStyle = impGrad;
          ctx.beginPath();
          ctx.arc(targetScreen.x, targetScreen.y, impactRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // White-hot impact dot
        ctx.fillStyle = `rgba(255, 255, 255, ${effectAlpha * 0.8 * intensity * impactPulse})`;
        ctx.beginPath();
        ctx.arc(
          targetScreen.x,
          targetScreen.y,
          (minimalDetail ? 2.2 : 3) * zoom * intensity,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
      }
      break;

    case "sentinel_lockon": {
      const pulse = 0.55 + Math.sin(Date.now() / 60) * 0.45;
      const radius = (effect.size || 70) * zoom * (0.5 + progress * 0.3);

      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.scale(1, ISO_Y_RATIO);
      ctx.strokeStyle = `rgba(255, 228, 230, ${alpha * (0.6 + pulse * 0.28)})`;
      ctx.fillStyle = `rgba(190, 24, 93, ${alpha * (0.14 + pulse * 0.1)})`;
      ctx.lineWidth = 2.8 * zoom;
      ctx.setLineDash([10 * zoom, 8 * zoom]);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const cross = radius * 0.2;
      ctx.strokeStyle = `rgba(255, 237, 213, ${alpha * (0.75 + pulse * 0.18)})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - cross, screenPos.y);
      ctx.lineTo(screenPos.x + cross, screenPos.y);
      ctx.moveTo(screenPos.x, screenPos.y - cross * 0.65);
      ctx.lineTo(screenPos.x, screenPos.y + cross * 0.65);
      ctx.stroke();
      break;
    }

    case "sentinel_impact": {
      const impactRadius = Math.max(24, effect.size * zoom * progress);
      const coreRadius = Math.max(5, impactRadius * 0.16);
      const ringAlpha = alpha * 0.7;

      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.scale(1, ISO_Y_RATIO);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, impactRadius);
      glow.addColorStop(0, `rgba(255, 228, 230, ${alpha * 0.46})`);
      glow.addColorStop(0.45, `rgba(251, 113, 133, ${alpha * 0.31})`);
      glow.addColorStop(1, "rgba(136, 19, 55, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, impactRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(251, 113, 133, ${ringAlpha})`;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.arc(0, 0, impactRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = `rgba(255, 237, 213, ${alpha * 0.82})`;
      ctx.lineWidth = 2.2 * zoom;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + progress * 0.3;
        const start = impactRadius * 0.18;
        const end = impactRadius * (0.45 + (i % 2) * 0.14);
        ctx.beginPath();
        ctx.moveTo(
          screenPos.x + Math.cos(angle) * start,
          screenPos.y + Math.sin(angle) * start * 0.6
        );
        ctx.lineTo(
          screenPos.x + Math.cos(angle) * end,
          screenPos.y + Math.sin(angle) * end * 0.6
        );
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.92})`;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "sunforge_beam": {
      if (effect.targetPos) {
        const targetScreen = worldToScreen(
          effect.targetPos,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom,
        );
        const intensity = Math.max(0, effect.intensity || 1);
        const dx = targetScreen.x - screenPos.x;
        const dy = targetScreen.y - screenPos.y;
        const distanceLen = Math.hypot(dx, dy) || 1;
        const nx = dx / distanceLen;
        const ny = dy / distanceLen;
        const px = -ny;
        const py = nx;
        const wobble = Math.sin(Date.now() / 80 + hashString32(effect.id) * 0.002) * 6 * zoom;

        const sourceX = screenPos.x + px * wobble * 0.35;
        const sourceY = screenPos.y + py * wobble * 0.35;
        const targetX = targetScreen.x + px * wobble;
        const targetY = targetScreen.y + py * wobble;

        const beamGrad = ctx.createLinearGradient(sourceX, sourceY, targetX, targetY);
        beamGrad.addColorStop(0, `rgba(255, 244, 214, ${alpha * 0.92 * intensity})`);
        beamGrad.addColorStop(0.35, `rgba(251, 146, 60, ${alpha * 0.72 * intensity})`);
        beamGrad.addColorStop(1, `rgba(249, 115, 22, ${alpha * 0.22 * intensity})`);

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(251, 146, 60, 0.85)";
        ctx.shadowBlur = 18 * zoom * intensity;

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 7 * zoom * intensity;
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.quadraticCurveTo(
          sourceX + dx * 0.42 + px * 12 * zoom,
          sourceY + dy * 0.42 + py * 12 * zoom,
          targetX,
          targetY
        );
        ctx.stroke();

        ctx.shadowBlur = 10 * zoom * intensity;
        ctx.strokeStyle = `rgba(255, 255, 240, ${alpha * 0.82 * intensity})`;
        ctx.lineWidth = 2.4 * zoom * intensity;
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        for (let i = 0; i < 3; i++) {
          const arcAngle = (Date.now() / 260 + i * 2.1) % (Math.PI * 2);
          const arcLen = (8 + i * 3) * zoom;
          ctx.strokeStyle = `rgba(255, 222, 173, ${alpha * (0.45 - i * 0.1)})`;
          ctx.lineWidth = (1.6 - i * 0.3) * zoom;
          ctx.beginPath();
          ctx.moveTo(sourceX, sourceY);
          ctx.lineTo(
            sourceX + Math.cos(arcAngle) * arcLen,
            sourceY + Math.sin(arcAngle) * arcLen * 0.6
          );
          ctx.stroke();
        }

        ctx.restore();
      }
      break;
    }

    case "sunforge_impact": {
      const pulse = 0.55 + Math.sin(Date.now() / 65) * 0.45;
      const impactRadius = Math.max(20, effect.size * zoom * (0.38 + progress * 0.9));
      const shockRadius = impactRadius * (0.62 + pulse * 0.2);

      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);
      ctx.scale(1, ISO_Y_RATIO);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, impactRadius);
      glow.addColorStop(0, `rgba(255, 237, 213, ${alpha * 0.66})`);
      glow.addColorStop(0.38, `rgba(251, 146, 60, ${alpha * 0.44})`);
      glow.addColorStop(0.75, `rgba(249, 115, 22, ${alpha * 0.22})`);
      glow.addColorStop(1, "rgba(124, 45, 18, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, impactRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 210, 140, ${alpha * (0.62 + pulse * 0.2)})`;
      ctx.lineWidth = 3.2 * zoom;
      ctx.setLineDash([9 * zoom, 7 * zoom]);
      ctx.beginPath();
      ctx.arc(0, 0, shockRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const rayCount = 7;
      ctx.strokeStyle = `rgba(255, 237, 213, ${alpha * 0.86})`;
      ctx.lineWidth = 2.3 * zoom;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + progress * 0.45;
        const inner = impactRadius * 0.18;
        const outer = impactRadius * (0.52 + (i % 2) * 0.16);
        ctx.beginPath();
        ctx.moveTo(
          screenPos.x + Math.cos(angle) * inner,
          screenPos.y + Math.sin(angle) * inner * 0.6
        );
        ctx.lineTo(
          screenPos.x + Math.cos(angle) * outer,
          screenPos.y + Math.sin(angle) * outer * 0.6
        );
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(255, 255, 245, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, Math.max(3, impactRadius * 0.12), 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "music_notes":
      if (effect.targetPos) {
        const targetScreen = worldToScreen(
          effect.targetPos,
          canvasWidth,
          canvasHeight,
          dpr,
          cameraOffset,
          cameraZoom,
        );
        const intensity = Math.max(0, effect.intensity || 1);
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
            cameraZoom,
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
          cameraZoom,
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
            cameraZoom,
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

          // Barrel pitch — towers are elevated, barrels aim down at enemies
          const towerElev = (towerLevel >= 3 ? 35 : 25) * zoom;
          const barrelPitch = Math.atan2(towerElev, barrelLength * 2.5);
          const pitchRate = Math.sin(barrelPitch) * 0.5;

          // Projectile spawns from barrel end (turret radius + barrel length)
          const totalLength = turretRadius + barrelLength;
          sourceX = towerScreen.x + cosR * totalLength;
          sourceY =
            turretY + sinR * totalLength * 0.5 + totalLength * pitchRate;
        }

        ctx.save();

        const dx = targetScreen.x - sourceX;
        const dy = targetScreen.y - sourceY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (effect.type === "cannon_shot") {
          const projT = progress;
          const arcHeight = 15 * zoom;
          const projX = sourceX + dx * projT;
          const projY =
            sourceY + dy * projT - Math.sin(projT * Math.PI) * arcHeight;

          const flightAngle = Math.atan2(
            dy - Math.cos(projT * Math.PI) * Math.PI * arcHeight,
            dx,
          );
          const now = Date.now();
          const pulse = 0.85 + Math.sin(now / 40) * 0.15;

          // Energy trail — tapered gradient streaks along flight path
          const trailSegments = 10;
          for (let t = trailSegments - 1; t >= 0; t--) {
            const tFrac = t / trailSegments;
            const trailT = Math.max(0, projT - tFrac * 0.2);
            const trailX = sourceX + dx * trailT;
            const trailY =
              sourceY +
              dy * trailT -
              Math.sin(trailT * Math.PI) * arcHeight;
            const trailFade = (1 - tFrac) * alpha;
            const trailR = (5 - tFrac * 4) * zoom;

            const trailGrad = ctx.createRadialGradient(
              trailX,
              trailY,
              0,
              trailX,
              trailY,
              trailR,
            );
            trailGrad.addColorStop(
              0,
              `rgba(255, 200, 80, ${trailFade * 0.5 * (1 - tFrac)})`,
            );
            trailGrad.addColorStop(
              0.5,
              `rgba(255, 140, 30, ${trailFade * 0.25 * (1 - tFrac)})`,
            );
            trailGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);
            ctx.fillStyle = trailGrad;
            ctx.beginPath();
            ctx.arc(trailX, trailY, trailR, 0, Math.PI * 2);
            ctx.fill();
          }

          // Elongated energy streak (connects trail to orb)
          if (projT > 0.05) {
            const streakT = Math.max(0, projT - 0.12);
            const streakX = sourceX + dx * streakT;
            const streakY =
              sourceY +
              dy * streakT -
              Math.sin(streakT * Math.PI) * arcHeight;
            const streakGrad = ctx.createLinearGradient(
              streakX,
              streakY,
              projX,
              projY,
            );
            streakGrad.addColorStop(0, `rgba(255, 160, 40, 0)`);
            streakGrad.addColorStop(0.4, `rgba(255, 190, 60, ${alpha * 0.3})`);
            streakGrad.addColorStop(1, `rgba(255, 230, 140, ${alpha * 0.6})`);
            ctx.strokeStyle = streakGrad;
            ctx.lineWidth = 3 * zoom;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(streakX, streakY);
            ctx.lineTo(projX, projY);
            ctx.stroke();

            // Thinner hot inner streak
            const innerGrad = ctx.createLinearGradient(
              streakX,
              streakY,
              projX,
              projY,
            );
            innerGrad.addColorStop(0, `rgba(255, 240, 200, 0)`);
            innerGrad.addColorStop(0.6, `rgba(255, 255, 220, ${alpha * 0.35})`);
            innerGrad.addColorStop(1, `rgba(255, 255, 245, ${alpha * 0.7})`);
            ctx.strokeStyle = innerGrad;
            ctx.lineWidth = 1.2 * zoom;
            ctx.beginPath();
            ctx.moveTo(streakX, streakY);
            ctx.lineTo(projX, projY);
            ctx.stroke();
          }

          // Crackling energy wisps radiating from the orb
          for (let w = 0; w < 4; w++) {
            const wispAngle =
              flightAngle + Math.PI + ((w * Math.PI) / 2 + now / 60);
            const wispLen = (6 + Math.sin(now / 30 + w * 2.1) * 3) * zoom;
            const wispEndX = projX + Math.cos(wispAngle) * wispLen;
            const wispEndY = projY + Math.sin(wispAngle) * wispLen;
            ctx.strokeStyle = `rgba(255, 220, 100, ${alpha * 0.4})`;
            ctx.lineWidth = 0.8 * zoom;
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            ctx.quadraticCurveTo(
              projX + Math.cos(wispAngle + 0.3) * wispLen * 0.6,
              projY + Math.sin(wispAngle + 0.3) * wispLen * 0.6,
              wispEndX,
              wispEndY,
            );
            ctx.stroke();
          }

          // Outer ambient glow
          ctx.shadowColor = "#ffaa00";
          ctx.shadowBlur = 22 * zoom * pulse;
          const ambientR = 16 * zoom * pulse;
          const ambientGrad = ctx.createRadialGradient(
            projX,
            projY,
            0,
            projX,
            projY,
            ambientR,
          );
          ambientGrad.addColorStop(0, `rgba(255, 220, 100, ${alpha * 0.5})`);
          ambientGrad.addColorStop(0.3, `rgba(255, 170, 40, ${alpha * 0.3})`);
          ambientGrad.addColorStop(0.6, `rgba(255, 120, 10, ${alpha * 0.12})`);
          ambientGrad.addColorStop(1, `rgba(200, 60, 0, 0)`);
          ctx.fillStyle = ambientGrad;
          ctx.beginPath();
          ctx.arc(projX, projY, ambientR, 0, Math.PI * 2);
          ctx.fill();

          // Energy distortion ring
          const ringR = (8 + Math.sin(now / 25) * 1.5) * zoom;
          ctx.strokeStyle = `rgba(255, 200, 80, ${alpha * 0.35})`;
          ctx.lineWidth = 1 * zoom;
          ctx.beginPath();
          ctx.ellipse(
            projX,
            projY,
            ringR,
            ringR * 0.55,
            flightAngle,
            0,
            Math.PI * 2,
          );
          ctx.stroke();

          // Energy orb core — bright pulsating sphere
          const orbR = 5 * zoom * pulse;
          const orbGrad = ctx.createRadialGradient(
            projX - 1 * zoom,
            projY - 1 * zoom,
            0,
            projX,
            projY,
            orbR,
          );
          orbGrad.addColorStop(0, `rgba(255, 255, 245, ${alpha})`);
          orbGrad.addColorStop(0.3, `rgba(255, 240, 180, ${alpha * 0.95})`);
          orbGrad.addColorStop(0.6, `rgba(255, 190, 60, ${alpha * 0.8})`);
          orbGrad.addColorStop(1, `rgba(255, 130, 10, ${alpha * 0.4})`);
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(projX, projY, orbR, 0, Math.PI * 2);
          ctx.fill();

          // White-hot center
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9 * pulse})`;
          ctx.beginPath();
          ctx.arc(projX, projY, 2 * zoom, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
        } else if (effect.type === "bullet_stream") {
          const rotation = effect.rotation || 0;
          const cosR = Math.cos(rotation);
          const sinR = Math.sin(rotation);
          const foreshorten = Math.abs(cosR);

          const barrelOffset = -42 * zoom * (0.5 + foreshorten * 0.5);
          const bulletSourceX = sourceX + cosR * barrelOffset;
          const bulletSourceY = sourceY + sinR * barrelOffset * 0.5;

          const bulletDx = targetScreen.x - bulletSourceX;
          const bulletDy = targetScreen.y - bulletSourceY;
          const bulletDist = Math.sqrt(
            bulletDx * bulletDx + bulletDy * bulletDy,
          );
          const now = Date.now();

          for (let barrel = 0; barrel < 4; barrel++) {
            const barrelAngle =
              (now / 50 + (barrel * Math.PI * 2) / 8) % (Math.PI * 2);
            const perpOffset = Math.sin(barrelAngle) * 3 * zoom;
            const perpX = -sinR * perpOffset;
            const perpY = cosR * perpOffset * 0.5;

            const thisSourceX = bulletSourceX + perpX;
            const thisSourceY = bulletSourceY + perpY;

            for (let b = 0; b < 3; b++) {
              const bulletT = Math.min(
                1,
                progress * 2.0 + barrel * 0.06 + b * 0.1,
              );
              if (bulletT <= 0 || bulletT >= 1) continue;

              const bulletX = thisSourceX + bulletDx * bulletT;
              const bulletY = thisSourceY + bulletDy * bulletT;
              const fadeAlpha = alpha * (1 - bulletT * 0.3);

              // Tapered tracer trail with gradient
              const tracerLen = 28 * zoom;
              const tracerStartT = Math.max(
                0,
                bulletT - tracerLen / bulletDist,
              );
              const trailStartX = thisSourceX + bulletDx * tracerStartT;
              const trailStartY = thisSourceY + bulletDy * tracerStartT;

              // Outer glow trail
              const trailGrad = ctx.createLinearGradient(
                trailStartX,
                trailStartY,
                bulletX,
                bulletY,
              );
              trailGrad.addColorStop(0, `rgba(255, 120, 20, 0)`);
              trailGrad.addColorStop(0.3, `rgba(255, 160, 40, ${fadeAlpha * 0.25})`);
              trailGrad.addColorStop(0.7, `rgba(255, 200, 60, ${fadeAlpha * 0.5})`);
              trailGrad.addColorStop(1, `rgba(255, 230, 100, ${fadeAlpha * 0.7})`);
              ctx.strokeStyle = trailGrad;
              ctx.lineWidth = 4 * zoom;
              ctx.lineCap = "round";
              ctx.beginPath();
              ctx.moveTo(trailStartX, trailStartY);
              ctx.lineTo(bulletX, bulletY);
              ctx.stroke();

              // Hot inner trail
              const innerGrad = ctx.createLinearGradient(
                trailStartX,
                trailStartY,
                bulletX,
                bulletY,
              );
              innerGrad.addColorStop(0, `rgba(255, 220, 120, 0)`);
              innerGrad.addColorStop(0.5, `rgba(255, 240, 180, ${fadeAlpha * 0.4})`);
              innerGrad.addColorStop(1, `rgba(255, 255, 220, ${fadeAlpha * 0.8})`);
              ctx.strokeStyle = innerGrad;
              ctx.lineWidth = 1.8 * zoom;
              ctx.beginPath();
              ctx.moveTo(trailStartX, trailStartY);
              ctx.lineTo(bulletX, bulletY);
              ctx.stroke();

              // Bullet head glow
              ctx.shadowColor = "#ffaa00";
              ctx.shadowBlur = 14 * zoom;

              const headGrad = ctx.createRadialGradient(
                bulletX,
                bulletY,
                0,
                bulletX,
                bulletY,
                5 * zoom,
              );
              headGrad.addColorStop(0, `rgba(255, 255, 230, ${fadeAlpha})`);
              headGrad.addColorStop(0.35, `rgba(255, 220, 100, ${fadeAlpha * 0.9})`);
              headGrad.addColorStop(0.7, `rgba(255, 160, 40, ${fadeAlpha * 0.5})`);
              headGrad.addColorStop(1, `rgba(255, 100, 0, 0)`);
              ctx.fillStyle = headGrad;
              ctx.beginPath();
              ctx.arc(bulletX, bulletY, 5 * zoom, 0, Math.PI * 2);
              ctx.fill();

              // White-hot core (elongated along flight path)
              ctx.shadowBlur = 0;
              ctx.fillStyle = `rgba(255, 255, 245, ${fadeAlpha * 0.95})`;
              ctx.beginPath();
              ctx.ellipse(
                bulletX,
                bulletY,
                3 * zoom,
                1.2 * zoom,
                Math.atan2(bulletDy, bulletDx),
                0,
                Math.PI * 2,
              );
              ctx.fill();

              // Micro-spark near bullet (only for leading bullets)
              if (b === 0 && bulletT > 0.15) {
                const sparkSeed = barrel * 7 + Math.floor(now / 30);
                const sparkAngle =
                  ((sparkSeed * 2654435761) % 628) / 100;
                const sparkDist = (2 + ((sparkSeed * 1103515245) % 4)) * zoom;
                const sparkX = bulletX + Math.cos(sparkAngle) * sparkDist;
                const sparkY = bulletY + Math.sin(sparkAngle) * sparkDist;
                ctx.fillStyle = `rgba(255, 240, 180, ${fadeAlpha * 0.6})`;
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, 0.8 * zoom, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // Muzzle heat haze at source
          if (progress < 0.3) {
            const hazeAlpha = alpha * (1 - progress / 0.3) * 0.3;
            const hazeGrad = ctx.createRadialGradient(
              bulletSourceX,
              bulletSourceY,
              0,
              bulletSourceX,
              bulletSourceY,
              8 * zoom,
            );
            hazeGrad.addColorStop(0, `rgba(255, 200, 100, ${hazeAlpha})`);
            hazeGrad.addColorStop(0.5, `rgba(255, 150, 50, ${hazeAlpha * 0.5})`);
            hazeGrad.addColorStop(1, `rgba(255, 100, 0, 0)`);
            ctx.fillStyle = hazeGrad;
            ctx.beginPath();
            ctx.arc(bulletSourceX, bulletSourceY, 8 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (effect.type === "flame_burst") {
          const now = Date.now();

          // Bezier arc: flame leaves nozzle along barrel direction,
          // then curves smoothly toward the target — no sharp angle break.
          const flameRotation = effect.rotation || 0;
          const barrelCos = Math.cos(flameRotation);
          const barrelSin = Math.sin(flameRotation);
          const barrelDirX = barrelCos;
          const barrelDirY = barrelSin * 0.5;

          // P0 = source (nozzle tip), P2 = target
          const p0x = sourceX;
          const p0y = sourceY;
          const p2x = targetScreen.x;
          const p2y = targetScreen.y;

          // P1 = control point along barrel direction, ~45% of the way out
          const ctrlDist = dist * 0.45;
          const p1x = p0x + barrelDirX * ctrlDist;
          const p1y = p0y + barrelDirY * ctrlDist;

          // Evaluate quadratic bezier at parameter t
          const bezX = (t: number) => {
            const u = 1 - t;
            return u * u * p0x + 2 * u * t * p1x + t * t * p2x;
          };
          const bezY = (t: number) => {
            const u = 1 - t;
            return u * u * p0y + 2 * u * t * p1y + t * t * p2y;
          };

          // Tangent direction at t (for perpendicular wobble)
          const bezTanX = (t: number) => {
            return 2 * (1 - t) * (p1x - p0x) + 2 * t * (p2x - p1x);
          };
          const bezTanY = (t: number) => {
            return 2 * (1 - t) * (p1y - p0y) + 2 * t * (p2y - p1y);
          };
          const bezPerp = (t: number) => {
            const tx = bezTanX(t);
            const ty = bezTanY(t);
            const tLen = Math.sqrt(tx * tx + ty * ty) || 1;
            return { x: -ty / tLen, y: tx / tLen };
          };

          // Ambient heat glow
          const headT = Math.min(1, progress * 1.3) * 0.5;
          const headX = bezX(headT);
          const headY = bezY(headT);
          const heatR = 30 * zoom;
          const heatGrad = ctx.createRadialGradient(
            headX,
            headY,
            0,
            headX,
            headY,
            heatR,
          );
          heatGrad.addColorStop(0, `rgba(255, 120, 20, ${alpha * 0.12})`);
          heatGrad.addColorStop(0.5, `rgba(255, 60, 0, ${alpha * 0.06})`);
          heatGrad.addColorStop(1, `rgba(200, 30, 0, 0)`);
          ctx.fillStyle = heatGrad;
          ctx.beginPath();
          ctx.arc(headX, headY, heatR, 0, Math.PI * 2);
          ctx.fill();

          // Smoke layer (drawn behind flame)
          for (let s = 0; s < 5; s++) {
            const smokeT = Math.min(
              1,
              progress * 1.1 + s * 0.06 + 0.15,
            );
            if (smokeT <= 0.2 || smokeT >= 1) continue;
            const smokeFrac = (smokeT - 0.2) / 0.8;
            const sp = bezPerp(smokeT);
            const smokeWobble =
              Math.sin(now / 70 + s * 1.7) * 10 * zoom * smokeFrac;
            const smokeRise = -smokeFrac * 8 * zoom;
            const smokeX = bezX(smokeT) + sp.x * smokeWobble;
            const smokeY = bezY(smokeT) + sp.y * smokeWobble + smokeRise;
            const smokeR = (4 + smokeFrac * 10) * zoom;
            const smokeAlpha = alpha * (1 - smokeFrac) * 0.25;
            ctx.fillStyle = `rgba(50, 45, 40, ${smokeAlpha})`;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.shadowColor = "#ff4400";
          ctx.shadowBlur = 25 * zoom;

          // Outer flame body — blobs along bezier arc
          for (let f = 0; f < 12; f++) {
            const flameT = Math.min(1, progress * 1.3 + f * 0.035);
            if (flameT <= 0 || flameT >= 1) continue;

            const turb1 = Math.sin(now / 45 + f * 1.3) * 6;
            const turb2 = Math.sin(now / 28 + f * 2.7) * 3;
            const wobble = (turb1 + turb2) * zoom * (0.3 + flameT * 0.7);
            const fp = bezPerp(flameT);

            const spread = 1 + flameT * 1.8;
            const flameX = bezX(flameT) + fp.x * wobble * spread;
            const flameY = bezY(flameT) + fp.y * wobble * spread;
            const flameR = (8 + flameT * 6 - f * 0.2) * zoom * spread * 0.6;

            const r = 255;
            const g = Math.floor(255 - flameT * 180);
            const b = Math.floor(100 - flameT * 90);
            const fadeA = alpha * (1 - flameT * 0.6) * (1 - f * 0.02);

            const fGrad = ctx.createRadialGradient(
              flameX,
              flameY,
              0,
              flameX,
              flameY,
              flameR,
            );
            fGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${fadeA})`);
            fGrad.addColorStop(
              0.4,
              `rgba(${r}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 40)}, ${fadeA * 0.7})`,
            );
            fGrad.addColorStop(
              0.75,
              `rgba(${Math.floor(r * 0.8)}, ${Math.max(0, g - 120)}, 0, ${fadeA * 0.3})`,
            );
            fGrad.addColorStop(1, `rgba(180, 20, 0, 0)`);
            ctx.fillStyle = fGrad;
            ctx.beginPath();
            ctx.arc(flameX, flameY, flameR, 0, Math.PI * 2);
            ctx.fill();
          }

          // Hot inner core along bezier arc
          ctx.shadowBlur = 15 * zoom;
          ctx.shadowColor = "#ffcc00";
          for (let c = 0; c < 8; c++) {
            const coreT = Math.min(1, progress * 1.3 + c * 0.04);
            if (coreT <= 0 || coreT >= 0.7) continue;

            const cp = bezPerp(coreT);
            const coreTurb =
              Math.sin(now / 35 + c * 1.9) * 2.5 * zoom * coreT;
            const coreX = bezX(coreT) + cp.x * coreTurb;
            const coreY = bezY(coreT) + cp.y * coreTurb;
            const coreR = (3.5 - coreT * 3) * zoom;
            const coreAlpha = alpha * (1 - coreT / 0.7) * 0.9;

            const coreGrad = ctx.createRadialGradient(
              coreX,
              coreY,
              0,
              coreX,
              coreY,
              coreR,
            );
            coreGrad.addColorStop(
              0,
              `rgba(255, 255, 240, ${coreAlpha})`,
            );
            coreGrad.addColorStop(
              0.5,
              `rgba(255, 240, 160, ${coreAlpha * 0.7})`,
            );
            coreGrad.addColorStop(1, `rgba(255, 200, 80, 0)`);
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(coreX, coreY, coreR, 0, Math.PI * 2);
            ctx.fill();
          }

          // Bright embers along the arc
          ctx.shadowBlur = 0;
          for (let e = 0; e < 6; e++) {
            const emberSeed = Math.floor(now / 40) + e * 31;
            const emberT = Math.min(
              1,
              progress * 1.2 + ((emberSeed * 2654435761) % 100) / 250,
            );
            if (emberT <= 0.05 || emberT >= 0.95) continue;

            const ep = bezPerp(emberT);
            const emberWobble =
              Math.sin(emberSeed * 0.7) * 12 * zoom * emberT;
            const emberDrift = -emberT * 4 * zoom;
            const emberX = bezX(emberT) + ep.x * emberWobble;
            const emberY = bezY(emberT) + ep.y * emberWobble + emberDrift;
            const emberAlpha = alpha * (1 - emberT) * 0.8;
            ctx.fillStyle = `rgba(255, 240, 150, ${emberAlpha})`;
            ctx.beginPath();
            ctx.arc(emberX, emberY, 1.2 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }

          // Nozzle flare at the source
          if (progress < 0.4) {
            const nozzleAlpha = alpha * (1 - progress / 0.4) * 0.7;
            const nozzleR = 6 * zoom;
            const nozzleGrad = ctx.createRadialGradient(
              p0x,
              p0y,
              0,
              p0x,
              p0y,
              nozzleR,
            );
            nozzleGrad.addColorStop(
              0,
              `rgba(255, 255, 220, ${nozzleAlpha})`,
            );
            nozzleGrad.addColorStop(
              0.4,
              `rgba(255, 200, 80, ${nozzleAlpha * 0.6})`,
            );
            nozzleGrad.addColorStop(1, `rgba(255, 120, 20, 0)`);
            ctx.fillStyle = nozzleGrad;
            ctx.beginPath();
            ctx.arc(p0x, p0y, nozzleR, 0, Math.PI * 2);
            ctx.fill();
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
          Math.PI * 2,
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
        cameraZoom,
      );

      // Calculate meteor position along fall path (top right to target)
      const meteorX = screenPos.x + (targetScreen.x - screenPos.x) * progress;
      const meteorY = screenPos.y + (targetScreen.y - screenPos.y) * progress;
      const meteorIdx = effect.meteorIndex || 0;

      // ========== GROUND EFFECTS ==========
      // Pulsing danger zone indicator
      const warningAlpha = 0.4 + Math.sin(progress * 25) * 0.25;
      const warningSize = 55 * zoom * (0.4 + progress * 0.6);

      // Outer warning ring
      ctx.strokeStyle = `rgba(255, 50, 20, ${warningAlpha * 0.6})`;
      ctx.lineWidth = 3 * zoom;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.ellipse(
        targetScreen.x,
        targetScreen.y,
        warningSize * 1.2,
        warningSize * 0.6,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner warning ring
      ctx.strokeStyle = `rgba(255, 100, 30, ${warningAlpha})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        targetScreen.x,
        targetScreen.y,
        warningSize,
        warningSize * 0.5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Ground glow intensifies as meteor approaches
      const groundGlowAlpha = progress * progress * 0.6;
      const groundGlowRadius = 70 * zoom;
      const groundGlow = ctx.createRadialGradient(
        targetScreen.x,
        targetScreen.y,
        0,
        targetScreen.x,
        targetScreen.y,
        groundGlowRadius,
      );
      groundGlow.addColorStop(0, `rgba(255, 200, 100, ${groundGlowAlpha})`);
      groundGlow.addColorStop(
        0.3,
        `rgba(255, 120, 30, ${groundGlowAlpha * 0.7})`,
      );
      groundGlow.addColorStop(
        0.6,
        `rgba(255, 60, 0, ${groundGlowAlpha * 0.4})`,
      );
      groundGlow.addColorStop(1, "rgba(200, 30, 0, 0)");
      ctx.fillStyle = groundGlow;
      ctx.beginPath();
      ctx.ellipse(
        targetScreen.x,
        targetScreen.y,
        groundGlowRadius,
        groundGlowRadius * 0.5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // ========== METEOR TRAIL ==========
      const trailAngle = Math.atan2(
        targetScreen.y - screenPos.y,
        targetScreen.x - screenPos.x,
      );

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
      const outerTrailGrad = ctx.createLinearGradient(
        outerStartX,
        outerStartY,
        meteorX,
        meteorY,
      );
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
      const coreTrailGrad = ctx.createLinearGradient(
        coreStartX,
        coreStartY,
        meteorX,
        meteorY,
      );
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
      const innerTrailGrad = ctx.createLinearGradient(
        innerStartX,
        innerStartY,
        meteorX,
        meteorY,
      );
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
      const mSeed = hashString32(effect.id);
      for (let i = 0; i < 10; i++) {
        const emberFrac = (i / 10) * 0.75;
        const emberBaseX =
          meteorX - Math.cos(trailAngle) * outerTrailLength * emberFrac;
        const emberBaseY =
          meteorY - Math.sin(trailAngle) * outerTrailLength * emberFrac;
        const perpAngle = trailAngle + Math.PI / 2;
        const scatter =
          Math.sin(progress * 20 + i * 2.3 + meteorIdx) * 16 * zoom;
        const emberX = emberBaseX + Math.cos(perpAngle) * scatter;
        const emberY = emberBaseY + Math.sin(perpAngle) * scatter;
        const emberAlpha = alpha * (1 - emberFrac) * 0.85;
        const emberSize = (1.5 + seededNoise(mSeed + i * 3) * 2.5) * zoom;

        const eG = 180 + Math.floor(seededNoise(mSeed + i * 5) * 75);
        const eB = 40 + Math.floor(seededNoise(mSeed + i * 7) * 60);
        const emberGrad = ctx.createRadialGradient(emberX, emberY, 0, emberX, emberY, emberSize * 1.8);
        emberGrad.addColorStop(0, `rgba(255, ${eG}, ${eB}, ${emberAlpha})`);
        emberGrad.addColorStop(0.5, `rgba(255, ${eG - 40}, ${Math.max(0, eB - 20)}, ${emberAlpha * 0.5})`);
        emberGrad.addColorStop(1, `rgba(200, 60, 0, 0)`);
        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.arc(emberX, emberY, emberSize * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // ========== METEOR BODY ==========
      const meteorSize = effect.size * zoom * 0.5;

      // Huge outer glow
      const hugeGlow = ctx.createRadialGradient(
        meteorX,
        meteorY,
        0,
        meteorX,
        meteorY,
        meteorSize * 3,
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
        meteorX,
        meteorY,
        0,
        meteorX,
        meteorY,
        meteorSize * 2,
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
      ctx.rotate(progress * 8 + meteorIdx);

      const rockGrad = ctx.createRadialGradient(
        -meteorSize * 0.3,
        -meteorSize * 0.3,
        0,
        0,
        0,
        meteorSize * 1.2,
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
        ctx.lineTo(
          Math.cos(crackAngle) * meteorSize * 0.6,
          Math.sin(crackAngle) * meteorSize * 0.6,
        );
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
        const spotGrad = ctx.createRadialGradient(
          spotX,
          spotY,
          0,
          spotX,
          spotY,
          spot.size * meteorSize,
        );
        spotGrad.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
        spotGrad.addColorStop(0.5, `rgba(255, 200, 100, ${alpha * 0.7})`);
        spotGrad.addColorStop(1, "rgba(255, 150, 50, 0)");
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(spotX, spotY, spot.size * meteorSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // ========== ORBITING EMBER PARTICLES ==========
      for (let i = 0; i < 8; i++) {
        const orbitAngle =
          progress * 15 + i * ((Math.PI * 2) / 8) + meteorIdx;
        const orbitDist =
          meteorSize * (1.2 + Math.sin(progress * 10 + i * 1.1) * 0.25);
        const emberX = meteorX + Math.cos(orbitAngle) * orbitDist;
        const emberY = meteorY + Math.sin(orbitAngle) * orbitDist * 0.65;
        const eSize = (3 + seededNoise(mSeed + i * 11) * 3) * zoom;

        const emberGlow = ctx.createRadialGradient(emberX, emberY, 0, emberX, emberY, eSize * 1.6);
        emberGlow.addColorStop(0, `rgba(255, 255, 210, ${alpha * 0.9})`);
        emberGlow.addColorStop(0.3, `rgba(255, 200, 80, ${alpha * 0.6})`);
        emberGlow.addColorStop(0.7, `rgba(255, 130, 20, ${alpha * 0.3})`);
        emberGlow.addColorStop(1, "rgba(200, 60, 0, 0)");
        ctx.fillStyle = emberGlow;
        ctx.beginPath();
        ctx.arc(emberX, emberY, eSize * 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 240, 180, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(emberX, emberY, eSize * 0.4, 0, Math.PI * 2);
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
            cameraZoom,
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
        Math.PI * 2,
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
          trailSize,
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
          Math.PI * 2,
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
        25 * zoom,
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
      const ip = progress;
      const sx = screenPos.x;
      const sy = screenPos.y;
      const sz = effect.size * zoom;

      // Deep ground crater with dark scorch
      const craterAlpha = alpha * (0.8 - ip * 0.3);
      const craterGrad = ctx.createRadialGradient(sx, sy + 4 * zoom, 0, sx, sy + 4 * zoom, sz * 0.5);
      craterGrad.addColorStop(0, `rgba(20, 10, 5, ${craterAlpha})`);
      craterGrad.addColorStop(0.4, `rgba(40, 20, 10, ${craterAlpha * 0.7})`);
      craterGrad.addColorStop(0.7, `rgba(60, 30, 10, ${craterAlpha * 0.4})`);
      craterGrad.addColorStop(1, "rgba(50, 25, 10, 0)");
      ctx.fillStyle = craterGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy + 4 * zoom, sz * 0.5, sz * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Massive mushroom cloud explosion — layered for depth
      ctx.shadowColor = "#ff4400";
      ctx.shadowBlur = 60 * zoom * alpha;

      // Outer heat haze
      const hazeSize = sz * (0.6 + ip * 1.4);
      const hazeGrad = ctx.createRadialGradient(sx, sy - ip * 20 * zoom, 0, sx, sy - ip * 20 * zoom, hazeSize);
      hazeGrad.addColorStop(0, `rgba(255, 180, 60, ${alpha * 0.5 * (1 - ip)})`);
      hazeGrad.addColorStop(0.3, `rgba(255, 100, 20, ${alpha * 0.35 * (1 - ip)})`);
      hazeGrad.addColorStop(0.6, `rgba(200, 50, 0, ${alpha * 0.2 * (1 - ip)})`);
      hazeGrad.addColorStop(1, "rgba(150, 30, 0, 0)");
      ctx.fillStyle = hazeGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy - ip * 20 * zoom, hazeSize, hazeSize * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner fireball core
      const coreSize = sz * (0.4 + ip * 0.5) * (1 - ip * 0.3);
      const coreGrad = ctx.createRadialGradient(sx, sy - ip * 12 * zoom, 0, sx, sy - ip * 12 * zoom, coreSize);
      coreGrad.addColorStop(0, `rgba(255, 255, 240, ${alpha})`);
      coreGrad.addColorStop(0.15, `rgba(255, 240, 160, ${alpha})`);
      coreGrad.addColorStop(0.35, `rgba(255, 200, 50, ${alpha * 0.95})`);
      coreGrad.addColorStop(0.55, `rgba(255, 120, 10, ${alpha * 0.8})`);
      coreGrad.addColorStop(0.8, `rgba(200, 50, 0, ${alpha * 0.5})`);
      coreGrad.addColorStop(1, "rgba(120, 20, 0, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy - ip * 12 * zoom, coreSize, coreSize * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rising smoke column
      if (ip > 0.15) {
        const smokeFrac = (ip - 0.15) / 0.85;
        const smokeY = sy - smokeFrac * 70 * zoom;
        const smokeR = sz * 0.3 * smokeFrac;
        const smokeA = alpha * (1 - smokeFrac) * 0.35;
        ctx.fillStyle = `rgba(60, 50, 40, ${smokeA})`;
        ctx.beginPath();
        ctx.ellipse(sx, smokeY, smokeR, smokeR * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground-level fire shockwave rings — expanding rapidly
      for (let ring = 0; ring < 4; ring++) {
        const rp = Math.min(1, ip * 2.0 + ring * 0.08);
        const rRadius = sz * rp * (0.8 + ring * 0.15);
        const rAlpha = (1 - rp) * alpha * (0.6 - ring * 0.1);
        if (rAlpha <= 0) continue;

        const rGrad = ctx.createRadialGradient(sx, sy, rRadius * 0.85, sx, sy, rRadius);
        rGrad.addColorStop(0, "rgba(255, 150, 50, 0)");
        rGrad.addColorStop(0.5, `rgba(255, ${120 - ring * 20}, ${30 - ring * 5}, ${rAlpha})`);
        rGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.ellipse(sx, sy, rRadius, rRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flying ember debris
      for (let d = 0; d < 18; d++) {
        const dSeed = hashString32(effect.id + d);
        const dAngle = (dSeed % 628) / 100;
        const dSpeed = 0.4 + (dSeed % 60) / 100;
        const dDist = sz * 0.4 * ip * dSpeed;
        const dGrav = ip * ip * 25 * zoom;
        const dx = sx + Math.cos(dAngle) * dDist;
        const dy = sy + Math.sin(dAngle) * dDist * 0.5 - ip * 40 * zoom * (1 - ip) + dGrav;
        const dAlpha = alpha * (1 - ip) * 0.9;
        if (dAlpha <= 0) continue;

        const dSize = (2 + (dSeed % 3)) * zoom;
        const dGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dSize * 2);
        dGrad.addColorStop(0, `rgba(255, 240, 150, ${dAlpha})`);
        dGrad.addColorStop(0.5, `rgba(255, 150, 30, ${dAlpha * 0.6})`);
        dGrad.addColorStop(1, "rgba(200, 60, 0, 0)");
        ctx.fillStyle = dGrad;
        ctx.beginPath();
        ctx.arc(dx, dy, dSize * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 220, 120, ${dAlpha})`;
        ctx.beginPath();
        ctx.arc(dx, dy, dSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright white flash at center (first 30% of animation)
      if (ip < 0.3) {
        const flashA = (0.3 - ip) / 0.3 * alpha * 0.7;
        const flashR = sz * 0.6;
        const flashGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, flashR);
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashA})`);
        flashGrad.addColorStop(0.3, `rgba(255, 255, 200, ${flashA * 0.6})`);
        flashGrad.addColorStop(1, "rgba(255, 200, 100, 0)");
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, flashR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      break;
    }

    case "lightning_bolt": {
      const sp = progress;
      const ts = effect.targetPos
        ? worldToScreen(effect.targetPos, canvasWidth, canvasHeight, dpr, cameraOffset, cameraZoom)
        : screenPos;

      // Dramatic sky flash with blue-white tint
      if (sp < 0.5) {
        const flashPhase = sp / 0.5;
        const flashA = Math.pow(1 - flashPhase, 2) * 0.45;
        ctx.fillStyle = `rgba(180, 210, 255, ${flashA})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        // Secondary warm flash near impact
        const warmR = 300 * zoom;
        const warmGrad = ctx.createRadialGradient(ts.x, ts.y, 0, ts.x, ts.y, warmR);
        warmGrad.addColorStop(0, `rgba(220, 230, 255, ${flashA * 0.8})`);
        warmGrad.addColorStop(0.5, `rgba(150, 180, 255, ${flashA * 0.3})`);
        warmGrad.addColorStop(1, "rgba(100, 130, 255, 0)");
        ctx.fillStyle = warmGrad;
        ctx.beginPath();
        ctx.arc(ts.x, ts.y, warmR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const boltSeed = hashString32(effect.id);
      const skyY = ts.y - 800 * zoom;
      const segs = 28;

      // Build main bolt with seeded jitter for temporal coherence
      const boltPts: { x: number; y: number }[] = [{ x: ts.x + (seededNoise(boltSeed) - 0.5) * 20 * zoom, y: skyY }];
      for (let i = 1; i <= segs; i++) {
        const t = i / segs;
        const baseY = skyY + (ts.y - skyY) * t;
        const jScale = (1 - t * 0.6) * 55 * zoom;
        const jx = ts.x + (seededNoise(boltSeed + i * 7) - 0.5) * jScale;
        boltPts.push({ x: jx, y: baseY });
      }
      boltPts.push({ x: ts.x, y: ts.y });

      // Layer 1: Deep outer corona (very wide, deep blue)
      ctx.strokeStyle = `rgba(60, 80, 200, ${alpha * 0.15})`;
      ctx.lineWidth = 28 * zoom;
      ctx.shadowColor = "#4466cc";
      ctx.shadowBlur = 80 * zoom;
      tracePolyline(ctx, boltPts);
      ctx.stroke();

      // Layer 2: Electric outer glow
      ctx.strokeStyle = `rgba(100, 140, 255, ${alpha * 0.3})`;
      ctx.lineWidth = 18 * zoom;
      ctx.shadowColor = "#6699ff";
      ctx.shadowBlur = 50 * zoom;
      tracePolyline(ctx, boltPts);
      ctx.stroke();

      // Layer 3: Bright mid glow
      ctx.strokeStyle = `rgba(170, 200, 255, ${alpha * 0.65})`;
      ctx.lineWidth = 9 * zoom;
      ctx.shadowColor = "#aaccff";
      ctx.shadowBlur = 30 * zoom;
      tracePolyline(ctx, boltPts);
      ctx.stroke();

      // Layer 4: Searing white-hot core
      ctx.strokeStyle = `rgba(240, 248, 255, ${alpha})`;
      ctx.lineWidth = 3.5 * zoom;
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 18 * zoom;
      tracePolyline(ctx, boltPts);
      ctx.stroke();

      // Branch lightning — short jagged forks
      ctx.shadowBlur = 14 * zoom;
      ctx.shadowColor = "#88aaff";
      for (let i = 3; i < boltPts.length - 3; i++) {
        const branchChance = seededNoise(boltSeed + i * 13);
        if (branchChance < 0.45) continue;
        const bp = boltPts[i];
        const nextPt = boltPts[i + 1];
        const mainAngle = Math.atan2(nextPt.y - bp.y, nextPt.x - bp.x);
        const side = seededNoise(boltSeed + i * 19) > 0.5 ? 1 : -1;
        const bAngle = mainAngle + side * (0.4 + seededNoise(boltSeed + i * 23) * 0.5);
        const bLen = (15 + seededNoise(boltSeed + i * 29) * 25) * zoom;

        const branchSegs = 3;
        const brPts: { x: number; y: number }[] = [{ x: bp.x, y: bp.y }];
        for (let j = 1; j <= branchSegs; j++) {
          const t = j / branchSegs;
          const jitter = (seededNoise(boltSeed + i * 41 + j * 17) - 0.5) * 8 * zoom * (1 - t);
          brPts.push({
            x: bp.x + Math.cos(bAngle) * bLen * t + Math.cos(bAngle + Math.PI / 2) * jitter,
            y: bp.y + Math.sin(bAngle) * bLen * t + Math.sin(bAngle + Math.PI / 2) * jitter,
          });
        }

        ctx.strokeStyle = `rgba(130, 170, 255, ${alpha * 0.35})`;
        ctx.lineWidth = 4 * zoom;
        tracePolyline(ctx, brPts);
        ctx.stroke();

        ctx.strokeStyle = `rgba(220, 235, 255, ${alpha * 0.7})`;
        ctx.lineWidth = 1.2 * zoom;
        tracePolyline(ctx, brPts);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Ground impact — massive electric explosion
      const impR = 100 * zoom;
      const impGrad = ctx.createRadialGradient(ts.x, ts.y, 0, ts.x, ts.y, impR);
      impGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      impGrad.addColorStop(0.1, `rgba(220, 235, 255, ${alpha * 0.95})`);
      impGrad.addColorStop(0.25, `rgba(150, 190, 255, ${alpha * 0.7})`);
      impGrad.addColorStop(0.5, `rgba(80, 130, 255, ${alpha * 0.35})`);
      impGrad.addColorStop(1, "rgba(40, 60, 180, 0)");
      ctx.fillStyle = impGrad;
      ctx.beginPath();
      ctx.arc(ts.x, ts.y, impR, 0, Math.PI * 2);
      ctx.fill();

      // Ground electric shockwave ring
      const shockR = 70 * zoom * (0.3 + sp * 0.7);
      const shockA = alpha * (1 - sp) * 0.6;
      ctx.strokeStyle = `rgba(150, 200, 255, ${shockA})`;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.ellipse(ts.x, ts.y, shockR, shockR * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Electric sparks radiating from impact
      for (let s = 0; s < 10; s++) {
        const sAngle = seededNoise(boltSeed + s * 41) * Math.PI * 2;
        const sDist = (20 + seededNoise(boltSeed + s * 47) * 50) * zoom * sp;
        const ex = ts.x + Math.cos(sAngle) * sDist;
        const ey = ts.y + Math.sin(sAngle) * sDist * 0.5;
        const sparkA = alpha * (1 - sp) * 0.8;
        ctx.fillStyle = `rgba(200, 230, 255, ${sparkA})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

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
        Math.PI * 2,
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
            cy + Math.sin(armAngle) * 4 * zoom,
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
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      break;
    }

    // ========== SPELL GROUND SCORCH EFFECTS ==========

    case "fire_scorch": {
      const sx = screenPos.x;
      const sy = screenPos.y;
      const scorchR = effect.size * zoom * 0.55;
      const fa = alpha;
      const fSeed = hashString32(effect.id);

      // Irregular scorch shape — use clipping path for organic look
      ctx.save();
      ctx.beginPath();
      const lobes = 10;
      for (let i = 0; i <= lobes; i++) {
        const a = (i / lobes) * Math.PI * 2;
        const wobble = 0.8 + seededNoise(fSeed + i * 7) * 0.4;
        const rx = scorchR * wobble;
        const ry = scorchR * 0.5 * wobble;
        const px = sx + Math.cos(a) * rx;
        const py = sy + Math.sin(a) * ry;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.clip();

      // Deep charred ground base
      const baseGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, scorchR);
      baseGrad.addColorStop(0, `rgba(10, 5, 2, ${fa * 0.65})`);
      baseGrad.addColorStop(0.25, `rgba(25, 12, 5, ${fa * 0.55})`);
      baseGrad.addColorStop(0.5, `rgba(40, 18, 6, ${fa * 0.4})`);
      baseGrad.addColorStop(0.75, `rgba(55, 25, 8, ${fa * 0.2})`);
      baseGrad.addColorStop(1, "rgba(45, 20, 6, 0)");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(sx - scorchR * 1.1, sy - scorchR * 0.6, scorchR * 2.2, scorchR * 1.2);

      // Glowing ember rim (first 55%)
      if (progress < 0.55) {
        const ep = progress / 0.55;
        const emberA = fa * (1 - ep) * 0.65;
        const rimGrad = ctx.createRadialGradient(sx, sy, scorchR * 0.55, sx, sy, scorchR);
        rimGrad.addColorStop(0, "rgba(255, 120, 20, 0)");
        rimGrad.addColorStop(0.35, `rgba(255, 90, 10, ${emberA * 0.5})`);
        rimGrad.addColorStop(0.7, `rgba(220, 50, 0, ${emberA * 0.7})`);
        rimGrad.addColorStop(1, "rgba(150, 20, 0, 0)");
        ctx.fillStyle = rimGrad;
        ctx.fillRect(sx - scorchR * 1.1, sy - scorchR * 0.6, scorchR * 2.2, scorchR * 1.2);

        // Small glowing ember specks
        for (let e = 0; e < 8; e++) {
          const eA = seededNoise(fSeed + e * 31) * Math.PI * 2;
          const eD = scorchR * (0.4 + seededNoise(fSeed + e * 37) * 0.5);
          const ex = sx + Math.cos(eA) * eD;
          const ey = sy + Math.sin(eA) * eD * 0.5;
          const eSize = (1.5 + seededNoise(fSeed + e * 43) * 2) * zoom;
          const eGlow = emberA * (0.5 + seededNoise(fSeed + e * 47) * 0.5);
          ctx.fillStyle = `rgba(255, ${140 + Math.floor(seededNoise(fSeed + e * 53) * 80)}, 30, ${eGlow})`;
          ctx.beginPath();
          ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Radial crack lines — charred fractures
      ctx.strokeStyle = `rgba(15, 8, 3, ${fa * 0.35})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.lineCap = "round";
      for (let c = 0; c < 6; c++) {
        const cA = seededNoise(fSeed + c * 71) * Math.PI * 2;
        const cLen = scorchR * (0.35 + seededNoise(fSeed + c * 73) * 0.5);
        const midOff = (seededNoise(fSeed + c * 79) - 0.5) * 10 * zoom;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(
          sx + Math.cos(cA) * cLen * 0.5 + midOff,
          sy + Math.sin(cA) * cLen * 0.25 + midOff * 0.4,
          sx + Math.cos(cA) * cLen,
          sy + Math.sin(cA) * cLen * 0.5
        );
        ctx.stroke();
      }

      // Smoke wisps rising (first 65%)
      if (progress < 0.65) {
        const wA = fa * (1 - progress / 0.65) * 0.2;
        for (let w = 0; w < 3; w++) {
          const wAngle = seededNoise(fSeed + w * 91) * Math.PI * 2;
          const wD = scorchR * (0.15 + seededNoise(fSeed + w * 97) * 0.4);
          const wx = sx + Math.cos(wAngle) * wD;
          const wy = sy + Math.sin(wAngle) * wD * 0.5 - progress * 20 * zoom;
          const wR = (4 + seededNoise(fSeed + w * 101) * 5) * zoom;
          const wGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, wR);
          wGrad.addColorStop(0, `rgba(80, 60, 40, ${wA})`);
          wGrad.addColorStop(1, "rgba(60, 45, 30, 0)");
          ctx.fillStyle = wGrad;
          ctx.beginPath();
          ctx.arc(wx, wy, wR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      break;
    }

    case "lightning_scorch": {
      const lx = screenPos.x;
      const ly = screenPos.y;
      const lR = effect.size * zoom * 0.5;
      const la = alpha;
      const lSeed = hashString32(effect.id);

      // Glass-fused circular base with blue tint
      const baseGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lR);
      baseGrad.addColorStop(0, `rgba(8, 10, 25, ${la * 0.55})`);
      baseGrad.addColorStop(0.3, `rgba(15, 20, 40, ${la * 0.45})`);
      baseGrad.addColorStop(0.6, `rgba(25, 30, 55, ${la * 0.3})`);
      baseGrad.addColorStop(0.85, `rgba(30, 35, 50, ${la * 0.12})`);
      baseGrad.addColorStop(1, "rgba(20, 25, 40, 0)");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(lx, ly, lR, lR * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glassy surface sheen
      const sheenA = la * 0.15;
      const sheenGrad = ctx.createRadialGradient(lx - lR * 0.2, ly - lR * 0.1, 0, lx, ly, lR * 0.6);
      sheenGrad.addColorStop(0, `rgba(180, 210, 255, ${sheenA})`);
      sheenGrad.addColorStop(0.5, `rgba(120, 160, 230, ${sheenA * 0.4})`);
      sheenGrad.addColorStop(1, "rgba(80, 120, 200, 0)");
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.ellipse(lx, ly, lR * 0.6, lR * 0.3, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Lichtenberg figure veins — branching fractal lightning scars
      ctx.lineCap = "round";
      for (let v = 0; v < 8; v++) {
        const vA = seededNoise(lSeed + v * 7) * Math.PI * 2;
        const vLen = lR * (0.5 + seededNoise(lSeed + v * 13) * 0.45);
        const segments = 3 + Math.floor(seededNoise(lSeed + v * 17) * 3);
        const pts: { x: number; y: number }[] = [{ x: lx, y: ly }];
        for (let s = 1; s <= segments; s++) {
          const frac = s / segments;
          const jitter = (seededNoise(lSeed + v * 19 + s * 23) - 0.5) * 12 * zoom;
          pts.push({
            x: lx + Math.cos(vA) * vLen * frac + jitter,
            y: ly + Math.sin(vA) * vLen * 0.5 * frac + jitter * 0.4,
          });
        }

        // Outer glow
        ctx.strokeStyle = `rgba(80, 140, 255, ${la * 0.3})`;
        ctx.lineWidth = 3.5 * zoom;
        tracePolyline(ctx, pts);
        ctx.stroke();

        // Bright core
        ctx.strokeStyle = `rgba(190, 220, 255, ${la * 0.55})`;
        ctx.lineWidth = 1.2 * zoom;
        tracePolyline(ctx, pts);
        ctx.stroke();

        // Branch fork from midpoint
        if (seededNoise(lSeed + v * 29) > 0.4 && pts.length > 2) {
          const mid = pts[Math.floor(pts.length / 2)];
          const bA = vA + (seededNoise(lSeed + v * 31) - 0.5) * 1.5;
          const bLen = vLen * 0.35;
          const bEnd = {
            x: mid.x + Math.cos(bA) * bLen,
            y: mid.y + Math.sin(bA) * bLen * 0.5,
          };
          ctx.strokeStyle = `rgba(140, 190, 255, ${la * 0.35})`;
          ctx.lineWidth = 2 * zoom;
          ctx.beginPath();
          ctx.moveTo(mid.x, mid.y);
          ctx.lineTo(bEnd.x, bEnd.y);
          ctx.stroke();
          ctx.strokeStyle = `rgba(210, 235, 255, ${la * 0.45})`;
          ctx.lineWidth = 0.8 * zoom;
          ctx.beginPath();
          ctx.moveTo(mid.x, mid.y);
          ctx.lineTo(bEnd.x, bEnd.y);
          ctx.stroke();
        }
      }

      // Residual electric crackles (first 45%)
      if (progress < 0.45) {
        const crackA = la * (1 - progress / 0.45) * 0.7;
        for (let s = 0; s < 5; s++) {
          const sA = seededNoise(lSeed + s * 41) * Math.PI * 2;
          const sD = lR * (0.15 + seededNoise(lSeed + s * 47) * 0.6);
          const sx2 = lx + Math.cos(sA) * sD;
          const sy2 = ly + Math.sin(sA) * sD * 0.5;
          const sR = (2 + seededNoise(lSeed + s * 53) * 3) * zoom;
          const sGrad = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, sR);
          sGrad.addColorStop(0, `rgba(230, 245, 255, ${crackA})`);
          sGrad.addColorStop(0.4, `rgba(140, 190, 255, ${crackA * 0.5})`);
          sGrad.addColorStop(1, "rgba(80, 130, 220, 0)");
          ctx.fillStyle = sGrad;
          ctx.beginPath();
          ctx.arc(sx2, sy2, sR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Central impact glow
      const cGlowA = la * 0.25;
      const cGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lR * 0.35);
      cGrad.addColorStop(0, `rgba(180, 215, 255, ${cGlowA})`);
      cGrad.addColorStop(0.6, `rgba(100, 150, 235, ${cGlowA * 0.35})`);
      cGrad.addColorStop(1, "rgba(60, 100, 200, 0)");
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.ellipse(lx, ly, lR * 0.35, lR * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
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
          Math.PI * 2,
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
          screenPos.y + Math.sin(angle) * 10 * zoom,
        );
        ctx.lineTo(
          screenPos.x + Math.cos(angle) * roarRadius * 0.8,
          screenPos.y + Math.sin(angle) * roarRadius * 0.4,
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
          Math.PI * 2,
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
      // Mathey Knight's FORTRESS SHIELD - Impenetrable blue defensive barrier
      const shieldRadius = effect.size * zoom;
      const time = Date.now() / 1000;
      const pulsePhase = 0.85 + Math.sin(time * 3) * 0.15;

      ctx.save();

      // === OUTER DEFENSIVE RIPPLES (expanding waves) ===
      for (let wave = 0; wave < 4; wave++) {
        const wavePhase = (time * 0.6 + wave * 0.25) % 1;
        const waveRadius = shieldRadius * (0.6 + wavePhase * 0.5);
        const waveAlpha = alpha * 0.35 * (1 - wavePhase);

        ctx.strokeStyle = `rgba(59, 130, 246, ${waveAlpha})`;
        ctx.lineWidth = (2.5 - wave * 0.5) * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          screenPos.y,
          waveRadius,
          waveRadius * 0.5,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // === HEXAGONAL SHIELD LATTICE (multiple layers) ===
      const hexPoints = 6;
      for (let layer = 0; layer < 3; layer++) {
        const layerRadius = shieldRadius * (0.6 + layer * 0.15);
        const layerRotation =
          time * (layer % 2 === 0 ? 0.5 : -0.3) + layer * 0.2;
        const layerAlpha = alpha * (0.5 - layer * 0.1);

        ctx.strokeStyle = `rgba(96, 165, 250, ${layerAlpha})`;
        ctx.lineWidth = (3 - layer * 0.5) * zoom;
        ctx.beginPath();
        for (let i = 0; i <= hexPoints; i++) {
          const angle =
            (i / hexPoints) * Math.PI * 2 - Math.PI / 2 + layerRotation;
          const x = screenPos.x + Math.cos(angle) * layerRadius;
          const y = screenPos.y + Math.sin(angle) * layerRadius * 0.5;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // === INNER ENERGY FIELD (layered blue gradients) ===
      // Outer azure glow
      const outerShield = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        shieldRadius * 0.85,
      );
      outerShield.addColorStop(0, `rgba(59, 130, 246, ${alpha * 0.1})`);
      outerShield.addColorStop(
        0.5,
        `rgba(59, 130, 246, ${alpha * 0.15 * pulsePhase})`,
      );
      outerShield.addColorStop(0.8, `rgba(37, 99, 235, ${alpha * 0.1})`);
      outerShield.addColorStop(1, "rgba(37, 99, 235, 0)");
      ctx.fillStyle = outerShield;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        shieldRadius * 0.85,
        shieldRadius * 0.42,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Inner bright core
      const coreShield = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        shieldRadius * 0.35,
      );
      coreShield.addColorStop(0, `rgba(191, 219, 254, ${alpha * 0.4})`);
      coreShield.addColorStop(0.5, `rgba(147, 197, 253, ${alpha * 0.25})`);
      coreShield.addColorStop(1, "rgba(96, 165, 250, 0)");
      ctx.fillStyle = coreShield;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        shieldRadius * 0.35,
        shieldRadius * 0.17,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // === DEFENSIVE RUNE CIRCLE ===
      ctx.strokeStyle = `rgba(191, 219, 254, ${alpha * 0.5})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.setLineDash([8 * zoom, 4 * zoom]);
      ctx.lineDashOffset = -time * 30;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        shieldRadius * 0.5,
        shieldRadius * 0.25,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // === ORBITING SHIELD RUNES ===
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 10 * zoom;
      const runeSymbols = ["🛡️", "⚔️", "🏰", "✦", "🛡️", "⚔️"];
      ctx.font = `${10 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let r = 0; r < 6; r++) {
        const runeAngle = time * 1.2 + (r / 6) * Math.PI * 2;
        const runeRadius = shieldRadius * 0.65;
        const runeX = screenPos.x + Math.cos(runeAngle) * runeRadius;
        const runeY = screenPos.y + Math.sin(runeAngle) * runeRadius * 0.5;
        const runeAlpha = 0.6 + Math.sin(time * 2.5 + r * 1.2) * 0.25;

        ctx.globalAlpha = alpha * runeAlpha;
        ctx.fillStyle = `rgba(191, 219, 254, ${runeAlpha})`;
        ctx.fillText(runeSymbols[r], runeX, runeY);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // === ENERGY SPARKS (floating around shield) ===
      for (let spark = 0; spark < 12; spark++) {
        const sparkAngle = (spark / 12) * Math.PI * 2 + time * 0.9;
        const sparkWobble = Math.sin(time * 4 + spark * 0.7) * 8 * zoom;
        const sparkDist = shieldRadius * 0.7 + sparkWobble;
        const sparkX = screenPos.x + Math.cos(sparkAngle) * sparkDist;
        const sparkY = screenPos.y + Math.sin(sparkAngle) * sparkDist * 0.5;
        const sparkAlpha = alpha * (0.4 + Math.sin(time * 5 + spark) * 0.3);
        const sparkSize = (2 + Math.sin(time * 6 + spark * 0.9) * 1) * zoom;

        ctx.fillStyle = `rgba(147, 197, 253, ${sparkAlpha})`;
        ctx.shadowColor = "#93c5fd";
        ctx.shadowBlur = 5 * zoom;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // === CENTRAL SHIELD ICON ===
      ctx.globalAlpha = alpha * (0.7 + Math.sin(time * 2) * 0.2);
      ctx.font = `bold ${18 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 15 * zoom;
      ctx.fillText("🛡️", screenPos.x, screenPos.y - 2 * zoom);
      ctx.globalAlpha = 1;
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
        Math.PI * 2,
      );
      ctx.fill();

      // Dust cloud
      const dustGrad = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        strikeRadius,
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
        Math.PI * 2,
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
        cameraZoom,
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
        ctx.ellipse(
          shadowX,
          shadowY + 5 * zoom,
          boulderSize * 0.8,
          boulderSize * 0.3,
          0,
          0,
          Math.PI * 2,
        );
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
        const bGrad = ctx.createRadialGradient(
          -boulderSize * 0.3,
          -boulderSize * 0.3,
          0,
          0,
          0,
          boulderSize,
        );
        bGrad.addColorStop(0, "#a08060");
        bGrad.addColorStop(0.4, "#7a6040");
        bGrad.addColorStop(0.8, "#5a4030");
        bGrad.addColorStop(1, "#3a2820");
        ctx.fillStyle = bGrad;

        // Draw irregular rock shape
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const variance = 0.7 + Math.sin(i * 2.7 + rotation * 0.1) * 0.3;
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
        ctx.ellipse(
          -boulderSize * 0.25,
          -boulderSize * 0.25,
          boulderSize * 0.3,
          boulderSize * 0.2,
          -0.5,
          0,
          Math.PI * 2,
        );
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
          endX,
          endY,
          0,
          endX,
          endY,
          impactRadius * 2,
        );
        dustGrad.addColorStop(0, `rgba(140, 110, 70, ${impactAlpha * 0.8})`);
        dustGrad.addColorStop(0.5, `rgba(110, 85, 50, ${impactAlpha * 0.5})`);
        dustGrad.addColorStop(1, `rgba(80, 60, 35, 0)`);
        ctx.fillStyle = dustGrad;
        ctx.beginPath();
        ctx.ellipse(
          endX,
          endY,
          impactRadius * 2,
          impactRadius,
          0,
          0,
          Math.PI * 2,
        );
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
            endY + Math.sin(crackAngle) * crackLen * 0.5,
          );
          ctx.stroke();
        }

        // Flying debris
        for (let d = 0; d < 5; d++) {
          const debrisAngle = (d / 5) * Math.PI * 2 + impactProgress;
          const debrisDist = impactRadius * impactProgress * 1.5;
          const debrisX = endX + Math.cos(debrisAngle) * debrisDist;
          const debrisY =
            endY +
            Math.sin(debrisAngle) * debrisDist * 0.5 -
            impactProgress * 20 * zoom;

          ctx.fillStyle = `rgba(90, 70, 45, ${impactAlpha})`;
          ctx.beginPath();
          ctx.arc(
            debrisX,
            debrisY,
            (3 - impactProgress * 2) * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }

      ctx.restore();
      break;
    }

    case "inspiration": {
      // F. Scott's INSPIRATION - Literary brilliance empowering towers
      const time = Date.now() / 1000;
      const auraRadius = effect.size * zoom * (0.6 + progress * 0.25);
      const pulsePhase = Math.sin(time * 2) * 0.15;

      ctx.save();

      // === OUTER TEAL ENERGY RING (expanding waves) ===
      for (let ring = 0; ring < 3; ring++) {
        const ringPhase = (time * 0.8 + ring * 0.33) % 1;
        const ringRadius = auraRadius * (0.5 + ringPhase * 0.5);
        const ringAlpha = alpha * 0.4 * (1 - ringPhase);

        ctx.strokeStyle = `rgba(20, 184, 166, ${ringAlpha})`;
        ctx.lineWidth = (3 - ring) * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          screenPos.y,
          ringRadius,
          ringRadius * 0.5,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // === LITERARY ENERGY SPIRAL (book pages / manuscript swirl) ===
      ctx.strokeStyle = `rgba(255, 248, 220, ${alpha * 0.5})`;
      ctx.lineWidth = 2 * zoom;
      for (let arm = 0; arm < 4; arm++) {
        ctx.beginPath();
        for (let i = 0; i < 30; i++) {
          const t = i / 30;
          const spiralAngle =
            time * 1.5 + arm * Math.PI * 0.5 + t * Math.PI * 1.5;
          const spiralDist = auraRadius * (0.15 + t * 0.65);
          const x = screenPos.x + Math.cos(spiralAngle) * spiralDist;
          const y = screenPos.y + Math.sin(spiralAngle) * spiralDist * 0.5;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // === FLOATING GOLDEN QUILL SPARKS ===
      for (let spark = 0; spark < 16; spark++) {
        const sparkAngle = (spark / 16) * Math.PI * 2 + time * 0.7;
        const sparkDist =
          auraRadius * (0.3 + Math.sin(time * 3 + spark * 0.8) * 0.15);
        const sparkX = screenPos.x + Math.cos(sparkAngle) * sparkDist;
        const sparkY = screenPos.y + Math.sin(sparkAngle) * sparkDist * 0.5;
        const sparkAlpha = alpha * (0.5 + Math.sin(time * 4 + spark) * 0.3);
        const sparkSize = (2 + Math.sin(time * 5 + spark * 1.3) * 1) * zoom;

        ctx.fillStyle = `rgba(255, 215, 0, ${sparkAlpha})`;
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 8 * zoom;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // === CENTRAL INSPIRATION GLOW (teal + gold layered) ===
      // Outer teal aura
      const outerGlow = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        auraRadius * 0.5,
      );
      outerGlow.addColorStop(
        0,
        `rgba(20, 184, 166, ${alpha * 0.25 + pulsePhase * 0.1})`,
      );
      outerGlow.addColorStop(0.5, `rgba(20, 184, 166, ${alpha * 0.1})`);
      outerGlow.addColorStop(1, "rgba(20, 184, 166, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        auraRadius * 0.5,
        auraRadius * 0.25,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Inner golden core
      const coreGlow = ctx.createRadialGradient(
        screenPos.x,
        screenPos.y,
        0,
        screenPos.x,
        screenPos.y,
        auraRadius * 0.2,
      );
      coreGlow.addColorStop(0, `rgba(255, 230, 150, ${alpha * 0.6})`);
      coreGlow.addColorStop(0.6, `rgba(255, 215, 0, ${alpha * 0.3})`);
      coreGlow.addColorStop(1, "rgba(255, 215, 0, 0)");
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y,
        auraRadius * 0.2,
        auraRadius * 0.1,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // === ORBITING BOOK SYMBOLS ===
      ctx.font = `bold ${12 * zoom}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const symbols = ["📖", "✒️", "📜", "💫"];
      for (let sym = 0; sym < 4; sym++) {
        const symAngle = time * 0.8 + (sym / 4) * Math.PI * 2;
        const symDist = auraRadius * 0.55;
        const symX = screenPos.x + Math.cos(symAngle) * symDist;
        const symY =
          screenPos.y + Math.sin(symAngle) * symDist * 0.5 - 5 * zoom;
        const symAlpha = 0.6 + Math.sin(time * 2.5 + sym) * 0.2;

        ctx.globalAlpha = alpha * symAlpha;
        ctx.fillText(symbols[sym], symX, symY);
      }
      ctx.globalAlpha = 1;

      // === RISING INSPIRATION PARTICLES ===
      for (let p = 0; p < 8; p++) {
        const pPhase = (time * 0.5 + p * 0.125) % 1;
        const pAngle = (p / 8) * Math.PI * 2;
        const pDist = auraRadius * 0.3;
        const pX =
          screenPos.x +
          Math.cos(pAngle) * pDist +
          Math.sin(time * 2 + p) * 5 * zoom;
        const pY =
          screenPos.y + Math.sin(pAngle) * pDist * 0.5 - pPhase * 40 * zoom;
        const pAlpha = alpha * (1 - pPhase) * 0.7;

        ctx.fillStyle = `rgba(255, 248, 220, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(pX, pY, (2 + (1 - pPhase) * 2) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      break;
    }

    case "knight_summon": {
      // Captain's knight summoning effect
      const summonRadius = effect.size * zoom;

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
        Math.PI * 2,
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
          pillarY - pillarHeight,
        );
        pillarGrad.addColorStop(0, `rgba(255, 200, 100, ${alpha})`);
        pillarGrad.addColorStop(1, `rgba(255, 200, 100, 0)`);
        ctx.fillStyle = pillarGrad;
        ctx.fillRect(
          pillarX - 4 * zoom,
          pillarY - pillarHeight,
          8 * zoom,
          pillarHeight,
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
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.shadowBlur = 0;
      ctx.restore();
      break;
    }

    case "mortar_launch": {
      // Mortar launch muzzle blast - upward smoke burst
      const launchSize = effect.size * zoom * (0.5 + progress);
      const launchAlpha = (1 - progress) * 0.8;

      // Muzzle flash
      if (progress < 0.3) {
        const flashP = progress / 0.3;
        const flashSize = launchSize * (1 + flashP * 0.5);
        const flashGrad = ctx.createRadialGradient(
          screenPos.x, screenPos.y, 0,
          screenPos.x, screenPos.y, flashSize,
        );
        flashGrad.addColorStop(0, `rgba(255, 220, 100, ${(1 - flashP) * 0.9})`);
        flashGrad.addColorStop(0.4, `rgba(255, 140, 40, ${(1 - flashP) * 0.6})`);
        flashGrad.addColorStop(1, "rgba(255, 60, 0, 0)");
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, flashSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rising smoke puffs
      for (let p = 0; p < 5; p++) {
        const pProgress = Math.min(1, progress * 2 + p * 0.1);
        const py = screenPos.y - pProgress * 30 * zoom;
        const px = screenPos.x + Math.sin(pProgress * 4 + p) * 6 * zoom;
        const pSize = (4 + p * 2) * zoom * pProgress;
        const pAlpha = launchAlpha * (1 - pProgress) * 0.5;
        ctx.fillStyle = `rgba(120, 100, 80, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "mortar_impact": {
      const ip = progress;
      const sx = screenPos.x;
      const sy = screenPos.y;
      const sz = effect.size * zoom;
      const seed = hashString32(effect.id);
      const blobPts = 16;

      // Ground scorch — flat organic blob, no gradient
      ctx.fillStyle = `rgba(35, 18, 6, ${alpha * 0.55 * (1 - ip * 0.3)})`;
      drawOrganicBlobAt(ctx, sx, sy, sz * 0.6, sz * 0.28, seed, 0.12, blobPts);
      ctx.fill();

      // Central fireball (early phase) — layered organic blobs
      if (ip < 0.5) {
        const fireP = ip / 0.5;
        const fAlpha = (1 - fireP) * alpha;
        const fY = sy - fireP * 10 * zoom;
        const fSize = sz * 0.8 * (0.3 + fireP * 0.7);

        // Outer orange glow
        ctx.fillStyle = `rgba(255, 90, 10, ${fAlpha * 0.35})`;
        drawOrganicBlobAt(ctx, sx, fY, fSize, fSize * 0.7, seed + 1, 0.2, blobPts);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = `rgba(255, 220, 120, ${fAlpha * 0.7})`;
        drawOrganicBlobAt(ctx, sx, fY, fSize * 0.5, fSize * 0.35, seed + 2, 0.18, blobPts);
        ctx.fill();
      }

      // Expanding shockwave ring — single organic ring stroke, no gradient
      const rp = Math.min(1, ip * 1.5);
      const rRadius = sz * rp * 0.8;
      const rAlpha = (1 - rp) * alpha * 0.45;
      if (rAlpha > 0.01) {
        ctx.strokeStyle = `rgba(255, 120, 30, ${rAlpha})`;
        ctx.lineWidth = Math.max(1, 3 * zoom * (1 - rp));
        drawOrganicBlobAt(ctx, sx, sy, rRadius, rRadius * 0.5, seed + 3, 0.1, blobPts);
        ctx.stroke();
      }

      // Debris — fewer chunks, batched into one path per color group
      const debrisCount = 5;
      for (let d = 0; d < debrisCount; d++) {
        const dAngle = (d / debrisCount) * Math.PI * 2 + seed * 0.1;
        const dDist = sz * 0.3 * ip * (0.5 + (d % 3) * 0.3);
        const dx = sx + Math.cos(dAngle) * dDist;
        const dy = sy + Math.sin(dAngle) * dDist * 0.5 - ip * (1 - ip) * 20 * zoom;
        const dSize = (2 + (d & 1)) * zoom * (1 - ip);
        if (dSize < 0.5) continue;
        ctx.fillStyle = `rgba(${110 + d * 12}, ${65 + d * 6}, ${32}, ${alpha * (1 - ip) * 0.65})`;
        drawOrganicBlobAt(ctx, dx, dy, dSize, dSize * 0.8, seed + 10 + d, 0.25, 8);
        ctx.fill();
      }

      // Smoke puffs (later phase) — organic blobs rising
      if (ip > 0.2) {
        const smokeP = (ip - 0.2) / 0.8;
        for (let s = 0; s < 3; s++) {
          const sp = Math.min(1, smokeP + s * 0.18);
          const smokeY = sy - sp * 38 * zoom;
          const smokeX = sx + Math.sin(sp * 3 + s) * 7 * zoom;
          const smokeR = (6 + s * 3.5) * zoom * sp;
          const smokeA = alpha * (1 - sp) * 0.25;
          if (smokeA < 0.01) continue;
          ctx.fillStyle = `rgba(75, 68, 58, ${smokeA})`;
          drawOrganicBlobAt(ctx, smokeX, smokeY, smokeR, smokeR * 0.85, seed + 20 + s, 0.2, 10);
          ctx.fill();
        }
      }
      break;
    }

    case "ember_impact": {
      const ep = progress;
      const ex = screenPos.x;
      const ey = screenPos.y;
      const esz = effect.size * zoom;
      const eSeed = hashString32(effect.id);
      const eBlobPts = 14;

      // Molten lava puddle — flat isometric ellipse that lingers and cools
      const puddleR = esz * 0.55 * (0.3 + Math.min(1, ep * 3) * 0.7);
      const puddleCool = Math.max(0, ep - 0.4) / 0.6;
      const puddleAlpha = alpha * (1 - puddleCool * 0.5);
      const lavaR = Math.floor(220 - puddleCool * 100);
      const lavaG = Math.floor(100 - puddleCool * 70);
      const lavaB = Math.floor(10 + puddleCool * 15);
      ctx.fillStyle = `rgba(${lavaR}, ${lavaG}, ${lavaB}, ${puddleAlpha * 0.5})`;
      drawOrganicBlobAt(ctx, ex, ey, puddleR, puddleR * 0.45, eSeed, 0.15, eBlobPts);
      ctx.fill();

      // Inner bright core — hot magma center
      if (ep < 0.7) {
        const coreAlpha = (1 - ep / 0.7) * alpha;
        const coreR = puddleR * 0.5;
        ctx.fillStyle = `rgba(255, 200, 60, ${coreAlpha * 0.6})`;
        drawOrganicBlobAt(ctx, ex, ey, coreR, coreR * 0.45, eSeed + 1, 0.2, 10);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 180, ${coreAlpha * 0.4})`;
        drawOrganicBlobAt(ctx, ex, ey, coreR * 0.4, coreR * 0.18, eSeed + 2, 0.15, 8);
        ctx.fill();
      }

      // Lava splatter — droplets flying outward
      if (ep < 0.5) {
        const splatP = ep / 0.5;
        const splatCount = 8;
        for (let ls = 0; ls < splatCount; ls++) {
          const sAngle = (ls / splatCount) * Math.PI * 2 + eSeed * 0.1;
          const sDist = esz * 0.35 * splatP * (0.6 + (ls % 3) * 0.25);
          const sx = ex + Math.cos(sAngle) * sDist;
          const sy = ey + Math.sin(sAngle) * sDist * 0.5 - splatP * (1 - splatP) * 14 * zoom;
          const sSize = (1.8 + (ls & 1) * 1.2) * zoom * (1 - splatP);
          if (sSize < 0.4) continue;
          const sGlow = ls % 3 === 0 ? 255 : 200;
          ctx.fillStyle = `rgba(${sGlow}, ${80 + ls * 8}, 10, ${alpha * (1 - splatP) * 0.7})`;
          ctx.beginPath();
          ctx.ellipse(sx, sy, sSize, sSize * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Expanding heat wave ring
      const heatP = Math.min(1, ep * 2);
      const heatR = esz * heatP * 0.7;
      const heatAlpha = (1 - heatP) * alpha * 0.35;
      if (heatAlpha > 0.01) {
        ctx.strokeStyle = `rgba(255, 120, 20, ${heatAlpha})`;
        ctx.lineWidth = Math.max(1, 2.5 * zoom * (1 - heatP));
        drawOrganicBlobAt(ctx, ex, ey, heatR, heatR * 0.45, eSeed + 5, 0.1, eBlobPts);
        ctx.stroke();
      }

      // Rising ember sparks (later phase)
      if (ep > 0.15) {
        const sparkP = (ep - 0.15) / 0.85;
        for (let sp = 0; sp < 5; sp++) {
          const spT = Math.min(1, sparkP + sp * 0.12);
          const sparkAngle = (sp / 5) * Math.PI * 2 + eSeed * 0.3;
          const sparkDrift = Math.sin(spT * 4 + sp) * 5 * zoom;
          const sparkX = ex + Math.cos(sparkAngle) * esz * 0.15 + sparkDrift;
          const sparkY = ey - spT * 30 * zoom + Math.sin(sparkAngle) * esz * 0.08;
          const sparkA = alpha * (1 - spT) * 0.6;
          if (sparkA < 0.01) continue;
          const sparkSize = (1.5 + sp * 0.4) * zoom * (1 - spT * 0.5);
          ctx.fillStyle = `rgba(255, ${140 + sp * 20}, ${20 + sp * 10}, ${sparkA})`;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Smoke plumes (mid-to-late)
      if (ep > 0.3) {
        const smokeP = (ep - 0.3) / 0.7;
        for (let sm = 0; sm < 3; sm++) {
          const smT = Math.min(1, smokeP + sm * 0.15);
          const smokeX = ex + Math.sin(smT * 2.5 + sm * 1.8) * 6 * zoom;
          const smokeY = ey - smT * 32 * zoom;
          const smokeR = (5 + sm * 3) * zoom * smT;
          const smokeA = alpha * (1 - smT) * 0.2;
          if (smokeA < 0.01) continue;
          ctx.fillStyle = `rgba(60, 45, 30, ${smokeA})`;
          drawOrganicBlobAt(ctx, smokeX, smokeY, smokeR, smokeR * 0.8, eSeed + 10 + sm, 0.2, 10);
          ctx.fill();
        }
      }
      break;
    }

    case "ember_field": {
      // Burning ember pile on the ground
      const emberSize = effect.size * zoom;
      const time = Date.now() / 1000;

      // Ground fire glow
      const fireGrad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, emberSize,
      );
      const pulse = Math.sin(time * 4) * 0.15 + 0.5;
      fireGrad.addColorStop(0, `rgba(255, 120, 20, ${alpha * pulse})`);
      fireGrad.addColorStop(0.5, `rgba(255, 60, 0, ${alpha * pulse * 0.5})`);
      fireGrad.addColorStop(1, "rgba(200, 20, 0, 0)");
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, screenPos.y, emberSize, emberSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Individual ember sparks
      for (let e = 0; e < 6; e++) {
        const eAngle = time * 2 + e * Math.PI / 3;
        const eR = emberSize * 0.4 * (0.5 + Math.sin(eAngle * 2) * 0.3);
        const ex = screenPos.x + Math.cos(eAngle) * eR;
        const ey = screenPos.y + Math.sin(eAngle) * eR * 0.5;
        const eAlpha = alpha * (0.4 + Math.sin(eAngle * 3) * 0.3);
        ctx.fillStyle = `rgba(255, ${150 + Math.floor(Math.sin(eAngle) * 60)}, 30, ${eAlpha})`;
        ctx.beginPath();
        ctx.arc(ex, ey - Math.abs(Math.sin(eAngle * 1.5)) * 4 * zoom, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case "missile_trail": {
      // Missile smoke trail effect
      const trailLen = effect.size * zoom;
      for (let t = 0; t < 6; t++) {
        const tp = t / 6;
        const tx = screenPos.x - tp * trailLen * 0.3;
        const ty = screenPos.y + tp * 5 * zoom;
        const tSize = (2 + t * 1.5) * zoom;
        const tAlpha = alpha * (1 - tp) * 0.3;
        ctx.fillStyle = `rgba(180, 170, 160, ${tAlpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, tSize, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }
}

// ============================================================================
// MISSILE TARGET RETICLE — delegates to centralized reticle system
// ============================================================================
export { renderTargetingReticle, RETICLE_COLORS } from "./ui/reticles";

export function renderMissileTargetReticle(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  zoom: number,
  timeSeconds: number,
  cooldownProgress?: number,
): void {
  renderTargetingReticle(ctx, {
    x: screenPos.x,
    y: screenPos.y,
    zoom,
    time: timeSeconds,
    color: RETICLE_COLORS.orange,
    glowColor: { r: 255, g: 80, b: 0 },
    radius: 62,
    cooldownProgress,
    cooldownColor: RETICLE_COLORS.orange,
  });
}

// Particle rendering — delegated to dedicated particles module
export { renderParticle } from "./particles";
export {
  initParticlePool,
  acquireParticle,
  updateParticles as updateParticlePool,
  getActiveParticles,
  getActiveParticleCount,
  clearParticlePool,
  enforceParticleCap,
} from "./particles";

// Re-export environment effects
export { renderEnvironment, renderAmbientVisuals } from "./maps/environment";

// Re-export path utilities used by the current rendering pipeline
export { renderPath } from "./maps";
export { gridToWorldPath, hexToRgba } from "../utils";

// Re-export fog effects
export { drawRoadEndFog, computeFogCounts } from "./effects/fog";
export type { RgbColor, DrawRoadEndFogParams } from "./effects/fog";

// Re-export debuff/status effect rendering functions
export { renderTowerDebuffEffects, renderUnitStatusEffects } from "./effects";

// Re-export unified inspect indicator
export { renderInspectIndicator, renderUnitInspectIndicator, type InspectIndicatorConfig } from "./effects/inspectIndicator";

// Re-export UI rendering functions for troop movement
export {
  renderTroopMoveRange,
  renderPathTargetIndicator,
  renderTroopSelectionUI,
  type TroopMoveRangeConfig,
  type PathTargetConfig,
} from "./ui";
