import type { Enemy, Position, MapTheme } from "../../types";
import { ENEMY_DATA, ISO_Y_RATIO, LEVEL_DATA } from "../../constants";
import {
  worldToScreen,
  worldToScreenRounded,
  getEnemyPosition,
  lightenColor,
  darkenColor,
} from "../../utils";
import { renderInspectIndicator } from "../effects/inspectIndicator";
import { renderEnemyAttackEffect } from "./attackEffects";
import { getSlowAuraColors, getEnemyFlashProfile, enemyPaletteCache } from "./types";
import { drawRegionOverlay } from "./regionOverlays";

const mapThemeCache = new Map<string, MapTheme>();

function getMapTheme(selectedMap: string): MapTheme {
  const cached = mapThemeCache.get(selectedMap);
  if (cached) return cached;
  const levelData = LEVEL_DATA[selectedMap];
  const theme: MapTheme = (levelData?.theme as MapTheme) || "grassland";
  mapThemeCache.set(selectedMap, theme);
  return theme;
}

import {
  drawFreshmanEnemy,
  drawSophomoreEnemy,
  drawJuniorEnemy,
  drawSeniorEnemy,
  drawGradStudentEnemy,
  drawProfessorEnemy,
  drawDeanEnemy,
} from "./academic";
import {
  drawMascotEnemy,
  drawDefaultEnemy,
  drawTrusteeEnemy,
} from "./special";
import {
  drawArcherEnemy,
  drawMageEnemy,
  drawCatapultEnemy,
  drawWarlockEnemy,
  drawCrossbowmanEnemy,
  drawHexerEnemy,
} from "./ranged";
import {
  drawHarpyEnemy,
  drawWyvernEnemy,
} from "./flying";
import {
  drawSpecterEnemy,
  drawBerserkerEnemy,
  drawGolemEnemy,
  drawNecromancerEnemy,
  drawShadowKnightEnemy,
  drawCultistEnemy,
  drawPlaguebearerEnemy,
} from "./undead";
import {
  drawThornwalkerEnemy,
  drawSandwormEnemy,
  drawFrostlingEnemy,
  drawInfernalEnemy,
  drawBansheeEnemy,
  drawJuggernautEnemy,
  drawAssassinEnemy,
  drawDragonEnemy,
} from "./elemental";
import {
  drawAthleteEnemy,
  drawProtestorEnemy,
} from "./forest";
import {
  drawBogCreatureEnemy,
  drawWillOWispEnemy,
  drawSwampTrollEnemy,
} from "./swamp";
import {
  drawNomadEnemy,
  drawScorpionEnemy,
  drawScarabEnemy,
} from "./desert";
import {
  drawSnowGoblinEnemy,
  drawYetiEnemy,
  drawIceWitchEnemy,
} from "./winter";
import {
  drawMagmaSpawnEnemy,
  drawFireImpEnemy,
  drawEmberGuardEnemy,
} from "./volcanic";

export function renderEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  selectedMap: string,
  cameraOffset?: Position,
  cameraZoom?: number,
  enemyDensityHint: number = 0,
) {
  const pathKey = enemy.pathKey || selectedMap;
  const worldPos = getEnemyPosition(enemy, pathKey);
  const screenPos = worldToScreenRounded(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const zoom = cameraZoom || 1;
  const eData = ENEMY_DATA[enemy.type];
  const now = Date.now();
  const time = now / 1000;
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
    size * 0.6 * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const lowDetailFx = enemyDensityHint > 90;
  const minimalDetailFx = enemyDensityHint > 160;
  const flashProfile = getEnemyFlashProfile(enemy.type, eData.category);
  const damageFlashIntensity =
    enemy.damageFlash > 0
      ? Math.min(1, enemy.damageFlash / (minimalDetailFx ? 340 : 260))
      : 0;

  const attackDuration = 450;
  const lastAttackTime = Math.max(
    enemy.lastTroopAttack || 0,
    enemy.lastHeroAttack || 0,
  );
  const timeSinceAttack = now - lastAttackTime;
  const attackPhase =
    timeSinceAttack < attackDuration ? 1 - timeSinceAttack / attackDuration : 0;

  const attackScalePulse =
    attackPhase > 0
      ? 1 + Math.sin(attackPhase * Math.PI) * 0.12
      : 1;

  const hurtScalePulse =
    damageFlashIntensity > 0
      ? 1 - Math.sin(damageFlashIntensity * Math.PI) * (minimalDetailFx ? 0.015 : 0.03)
      : 1;

  const facingFlip = enemy.facingRight ? -1 : 1;
  ctx.save();
  ctx.translate(screenPos.x, drawY);
  ctx.scale(
    attackScalePulse * hurtScalePulse * facingFlip,
    attackScalePulse * hurtScalePulse,
  );
  ctx.translate(-screenPos.x, -drawY);

  const region = getMapTheme(selectedMap);

  drawEnemySprite(
    ctx,
    screenPos.x,
    drawY,
    size,
    enemy.type,
    eData.color,
    damageFlashIntensity,
    time,
    isFlying,
    zoom,
    attackPhase,
    region,
  );

  if (damageFlashIntensity > 0) {
    const hurtAlpha = damageFlashIntensity * (minimalDetailFx ? 0.16 : 0.24);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const hurtTint = flashProfile.innerColor.match(/\d+/g) || ["255", "210", "190"];
    ctx.fillStyle = `rgba(${hurtTint[0]}, ${hurtTint[1]}, ${hurtTint[2]}, ${hurtAlpha})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.52, size * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!lowDetailFx) {
      ctx.strokeStyle = `rgba(255, 185, 150, ${hurtAlpha * 0.8})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, drawY, size * 0.58, size * 0.38, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Regeneration visual
  const hasRegenTrait = eData.traits?.includes("regenerating");
  if (!minimalDetailFx && hasRegenTrait && !enemy.inCombat && enemy.hp < enemy.maxHp) {
    const regenPulse = 0.3 + 0.2 * Math.sin(time * 3);
    const regenGrad = ctx.createRadialGradient(
      screenPos.x, drawY, 0,
      screenPos.x, drawY, size * 0.6,
    );
    regenGrad.addColorStop(0, `rgba(50, 255, 100, ${regenPulse * 0.25})`);
    regenGrad.addColorStop(0.5, `rgba(30, 200, 80, ${regenPulse * 0.15})`);
    regenGrad.addColorStop(1, "rgba(20, 150, 60, 0)");
    ctx.fillStyle = regenGrad;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.6, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const sparkAngle = time * 2 + i * 2.1;
      const sparkDist = size * 0.3;
      const sparkY = drawY - Math.abs(Math.sin(time * 1.5 + i)) * size * 0.4;
      ctx.fillStyle = `rgba(100, 255, 150, ${regenPulse * 0.6})`;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + Math.cos(sparkAngle) * sparkDist,
        sparkY,
        2 * zoom, 0, Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Attack animation effects
  if (!minimalDetailFx && attackPhase > 0) {
    renderEnemyAttackEffect(
      ctx,
      enemy.type,
      screenPos.x,
      drawY,
      size,
      attackPhase,
      time,
      zoom,
      isFlying,
      eData.color,
      enemy.pathIndex,
    );
  }

  ctx.restore();

  // Frozen effect
  if (enemy.frozen) {
    ctx.fillStyle = "rgba(180, 230, 255, 0.25)";
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.9, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(150, 210, 255, 0.35)";
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.7, size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(100, 200, 255, 0.9)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.setLineDash([4 * zoom, 3 * zoom]);
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.8, size * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const crystalRotation = time * 0.5;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + crystalRotation;
      const dist = size * 0.55;
      const cx = screenPos.x + Math.cos(angle) * dist;
      const cy = drawY + Math.sin(angle) * dist * ISO_Y_RATIO;
      const cSize = (3.5 + Math.sin(i * 1.3) * 1.5) * zoom;

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

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.moveTo(cx - cSize * 0.2, cy - cSize * 1.1);
      ctx.lineTo(cx + cSize * 0.15, cy - cSize * 0.3);
      ctx.lineTo(cx - cSize * 0.35, cy - cSize * 0.2);
      ctx.closePath();
      ctx.fill();
    }

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

  // Burning effect
  if (enemy.burning) {
    ctx.strokeStyle = `rgba(255, 100, 0, ${0.3 + Math.sin(time * 8) * 0.15})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      drawY + size * 0.1,
      size * 0.5,
      size * 0.25,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const flameOffset = Math.sin(time * 6 + i * 1.8) * size * 0.15;
      const flameX = screenPos.x + flameOffset + (i - 1.5) * size * 0.12;
      const baseY = drawY - size * 0.15;
      const flameHeight =
        (size * 0.55 + Math.sin(time * 7 + i * 2) * size * 0.15) * zoom;
      const flameWidth =
        (size * 0.18 + Math.sin(time * 5 + i) * size * 0.04) * zoom;
      const flicker = Math.sin(time * 10 + i * 3) * 0.15;

      ctx.fillStyle = `rgba(220, 60, 20, ${0.75 + flicker})`;
      ctx.beginPath();
      ctx.moveTo(flameX, baseY);
      ctx.quadraticCurveTo(
        flameX - flameWidth,
        baseY - flameHeight * 0.5,
        flameX,
        baseY - flameHeight,
      );
      ctx.quadraticCurveTo(
        flameX + flameWidth,
        baseY - flameHeight * 0.5,
        flameX,
        baseY,
      );
      ctx.fill();

      ctx.fillStyle = `rgba(255, ${180 + Math.floor(Math.sin(time * 8 + i) * 40)}, 50, ${0.85 + flicker})`;
      ctx.beginPath();
      ctx.moveTo(flameX, baseY);
      ctx.quadraticCurveTo(
        flameX - flameWidth * 0.5,
        baseY - flameHeight * 0.4,
        flameX,
        baseY - flameHeight * 0.7,
      );
      ctx.quadraticCurveTo(
        flameX + flameWidth * 0.5,
        baseY - flameHeight * 0.4,
        flameX,
        baseY,
      );
      ctx.fill();
    }

    for (let i = 0; i < 5; i++) {
      const emberPhase = (time * 2.5 + i * 0.4) % 1;
      const emberX = screenPos.x + Math.sin(time * 3 + i * 2.2) * size * 0.3;
      const emberY = drawY - size * 0.2 - emberPhase * size * 0.8;
      const emberSize = (1.5 - emberPhase) * 2 * zoom;
      const emberAlpha = (1 - emberPhase) * 0.9;

      ctx.fillStyle = `rgba(255, ${200 - Math.floor(emberPhase * 100)}, ${100 - Math.floor(emberPhase * 80)}, ${emberAlpha})`;
      ctx.beginPath();
      ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
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
    const slowIntensity = Math.max(0.6, enemy.slowIntensity);
    const pulseAlpha = 0.8 + Math.sin(time * 4) * 0.2;
    const sc = getSlowAuraColors(enemy.slowSource);

    ctx.fillStyle = `rgba(${sc.aura}, ${0.35 * slowIntensity})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.85, size * 0.85 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(screenPos.x, drawY);
    ctx.rotate(time * 0.8);
    ctx.strokeStyle = `rgba(${sc.ring}, ${0.9 * slowIntensity * pulseAlpha})`;
    ctx.lineWidth = 3 * zoom;
    ctx.setLineDash([8 * zoom, 4 * zoom]);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.8, size * 0.48, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = `rgba(${sc.inner}, ${0.95 * slowIntensity})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const runeAngle = time * 0.8 + (i / 6) * Math.PI * 2;
      const rx = screenPos.x + Math.cos(runeAngle) * size * 0.78;
      const ry = drawY + Math.sin(runeAngle) * size * 0.47;

      ctx.fillStyle = `rgba(${sc.rune}, ${0.95 * slowIntensity})`;
      ctx.beginPath();
      const runeSize = 4.5 * zoom;
      ctx.moveTo(rx, ry - runeSize);
      ctx.lineTo(rx + runeSize * 0.7, ry);
      ctx.lineTo(rx, ry + runeSize);
      ctx.lineTo(rx - runeSize * 0.7, ry);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(${sc.runeOutline}, ${0.8 * slowIntensity})`;
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
    }

    for (let i = 0; i < 5; i++) {
      const pAngle = time * 2.5 + i * 1.26;
      const pDist = size * (0.4 + Math.sin(time * 1.8 + i) * 0.12);
      const px = screenPos.x + Math.cos(pAngle) * pDist;
      const py = drawY + Math.sin(pAngle) * pDist * 0.5 - size * 0.1;

      ctx.fillStyle = `rgba(${sc.particle}, ${0.9 * slowIntensity})`;
      ctx.beginPath();
      ctx.arc(px, py, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Stunned effect
  if (Date.now() < enemy.stunUntil && !enemy.frozen) {
    const orbitRadius = size * 0.5;

    for (let i = 0; i < 3; i++) {
      const baseAngle = time * 4 + (i / 3) * Math.PI * 2;

      for (let t = 2; t >= 0; t--) {
        const trailAngle = baseAngle - t * 0.15;
        const trailAlpha = (1 - t * 0.3) * 0.5;
        const tx = screenPos.x + Math.cos(trailAngle) * orbitRadius * 0.7;
        const ty =
          drawY - size * 0.65 + Math.sin(trailAngle) * orbitRadius * ISO_Y_RATIO;
        ctx.fillStyle = `rgba(255, 255, 100, ${trailAlpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, (2 - t * 0.4) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      const sx = screenPos.x + Math.cos(baseAngle) * orbitRadius * 0.7;
      const sy = drawY - size * 0.65 + Math.sin(baseAngle) * orbitRadius * ISO_Y_RATIO;
      const starSize = 4 * zoom;

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

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(sx, sy, starSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Gold aura effect
  if (enemy.goldAura) {
    for (let i = 0; i < 5; i++) {
      const coinAngle = time * 2.5 + (i * Math.PI * 2) / 5;
      const coinOrbitX = Math.cos(coinAngle) * size * 1.0;
      const coinOrbitY = Math.sin(coinAngle) * size * ISO_Y_RATIO;
      const coinFloat = Math.sin(time * 4 + i * 1.2) * 6 * zoom;
      const coinX = screenPos.x + coinOrbitX;
      const coinY = drawY + coinOrbitY - 10 * zoom + coinFloat;
      const coinSize = 5 * zoom;

      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.ellipse(coinX, coinY, coinSize, coinSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff8dc";
      ctx.beginPath();
      ctx.ellipse(
        coinX - coinSize * 0.2,
        coinY - coinSize * 0.15,
        coinSize * 0.4,
        coinSize * 0.25,
        -0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(coinX, coinY, coinSize, coinSize * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#b8860b";
      ctx.font = `bold ${coinSize * 0.8}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", coinX, coinY);
    }

    const glowAlpha = 0.25 + Math.sin(time * 3) * 0.1;
    ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // HP bar with armor display
  if (enemy.hp < enemy.maxHp || eData.armor > 0) {
    const barWidth = size * 1.4;
    const barHeight = 6 * zoom;
    const barY = drawY - size * 0.95;
    const barX = screenPos.x - barWidth / 2;
    const cornerRadius = 3 * zoom;
    const armor = eData.armor || 0;

    ctx.fillStyle = "rgba(10, 10, 15, 0.98)";
    ctx.beginPath();
    ctx.roundRect(
      barX - 2,
      barY - 2,
      barWidth + 4,
      barHeight + 4,
      cornerRadius + 1,
    );
    ctx.fill();

    ctx.fillStyle = "rgba(15, 15, 20, 0.95)";
    ctx.beginPath();
    ctx.roundRect(
      barX - 1,
      barY - 1,
      barWidth + 2,
      barHeight + 2,
      cornerRadius,
    );
    ctx.fill();

    ctx.fillStyle = "#1f1f23";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, cornerRadius - 1);
    ctx.fill();

    const hpPercent = enemy.hp / enemy.maxHp;
    const healthThreshold = 1 - armor;
    const redHealthPercent = Math.min(hpPercent, healthThreshold);
    const redWidth = barWidth * redHealthPercent;
    const armorPercent = Math.max(0, hpPercent - healthThreshold);
    const whiteWidth = barWidth * armorPercent;

    if (redWidth > 0) {
      const hpGradient = ctx.createLinearGradient(
        barX,
        barY,
        barX,
        barY + barHeight,
      );
      if (hpPercent > 0.5) {
        hpGradient.addColorStop(0, "#f87171");
        hpGradient.addColorStop(0.5, "#ef4444");
        hpGradient.addColorStop(1, "#dc2626");
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
      const rightRadius =
        whiteWidth > 0 ? 0 : hpPercent > 0.95 ? cornerRadius - 1 : 0;
      ctx.roundRect(barX, barY, redWidth, barHeight, [
        leftRadius,
        rightRadius,
        rightRadius,
        leftRadius,
      ]);
      ctx.fill();

      const shineGrad = ctx.createLinearGradient(
        barX,
        barY,
        barX,
        barY + barHeight * 0.4,
      );
      shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = shineGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, redWidth, barHeight * 0.4, [
        leftRadius,
        0,
        0,
        0,
      ]);
      ctx.fill();
    }

    if (whiteWidth > 0) {
      const armorStartX = barX + redWidth;
      const armorGrad = ctx.createLinearGradient(
        armorStartX,
        barY,
        armorStartX,
        barY + barHeight,
      );
      armorGrad.addColorStop(0, "#f5f5f4");
      armorGrad.addColorStop(0.3, "#e7e5e4");
      armorGrad.addColorStop(0.5, "#d6d3d1");
      armorGrad.addColorStop(0.7, "#a8a29e");
      armorGrad.addColorStop(1, "#78716c");
      ctx.fillStyle = armorGrad;
      ctx.beginPath();
      const rightRadius = hpPercent > 0.95 ? cornerRadius - 1 : 0;
      ctx.roundRect(armorStartX, barY, whiteWidth, barHeight, [
        0,
        rightRadius,
        rightRadius,
        0,
      ]);
      ctx.fill();

      const armorShine = ctx.createLinearGradient(
        armorStartX,
        barY,
        armorStartX,
        barY + barHeight * 0.4,
      );
      armorShine.addColorStop(0, "rgba(255, 255, 255, 0.6)");
      armorShine.addColorStop(1, "rgba(255, 255, 255, 0.1)");
      ctx.fillStyle = armorShine;
      ctx.beginPath();
      ctx.roundRect(armorStartX, barY, whiteWidth, barHeight * 0.4, [
        0,
        rightRadius,
        0,
        0,
      ]);
      ctx.fill();

      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(armorStartX, barY);
      ctx.lineTo(armorStartX, barY + barHeight);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(
      barX - 1,
      barY - 1,
      barWidth + 2,
      barHeight + 2,
      cornerRadius,
    );
    ctx.stroke();
  }

  ctx.restore();
}

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
  cameraZoom?: number,
) {
  const pathKey = enemy.pathKey || selectedMap;
  const worldPos = getEnemyPosition(enemy, pathKey);
  const screenPos = worldToScreen(
    worldPos,
    canvasWidth,
    canvasHeight,
    dpr,
    cameraOffset,
    cameraZoom,
  );
  const zoom = cameraZoom || 1;
  const eData = ENEMY_DATA[enemy.type];
  const time = Date.now() / 1000;

  const size = eData.size;
  const sizeZoomed = size * zoom;
  const isFlying = eData.flying;
  const floatOffset = isFlying ? Math.sin(time * 3) * 10 * zoom : 0;
  const bobOffset = Math.sin(time * 5 + enemy.pathIndex) * 2 * zoom;
  const drawY =
    screenPos.y -
    sizeZoomed / 2 -
    floatOffset -
    bobOffset -
    (isFlying ? 35 * zoom : 0);

  renderInspectIndicator(ctx, {
    screenPos,
    drawY,
    zoom,
    unitSize: size,
    isSelected,
    isHovered,
  });
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
  attackPhase: number = 0,
  region: MapTheme = "grassland",
) {
  let bodyColor = color;
  let bodyColorDark: string;
  let bodyColorLight: string;
  if (flash > 0) {
    bodyColor = lightenColor(color, flash * 100);
    bodyColorDark = darkenColor(bodyColor, 30);
    bodyColorLight = lightenColor(bodyColor, 20);
  } else {
    const cachedPalette = enemyPaletteCache.get(color);
    if (cachedPalette) {
      bodyColorDark = cachedPalette.dark;
      bodyColorLight = cachedPalette.light;
    } else {
      bodyColorDark = darkenColor(color, 30);
      bodyColorLight = lightenColor(color, 20);
      enemyPaletteCache.set(color, {
        dark: bodyColorDark,
        light: bodyColorLight,
      });
    }
  }

  switch (type) {
    case "frosh":
      drawFreshmanEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "sophomore":
      drawSophomoreEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "junior":
      drawJuniorEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "senior":
      drawSeniorEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "gradstudent":
      drawGradStudentEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "professor":
      drawProfessorEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "dean":
      drawDeanEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "trustee":
      drawTrusteeEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "mascot":
      drawMascotEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, isFlying, attackPhase);
      break;
    case "archer":
      drawArcherEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "mage":
      drawMageEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "catapult":
      drawCatapultEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "warlock":
      drawWarlockEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "crossbowman":
      drawCrossbowmanEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "hexer":
      drawHexerEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "harpy":
      drawHarpyEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "wyvern":
      drawWyvernEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "specter":
      drawSpecterEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "berserker":
      drawBerserkerEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "golem":
      drawGolemEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "necromancer":
      drawNecromancerEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "shadow_knight":
      drawShadowKnightEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "cultist":
      drawCultistEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "plaguebearer":
      drawPlaguebearerEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "thornwalker":
      drawThornwalkerEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "sandworm":
      drawSandwormEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "frostling":
      drawFrostlingEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "infernal":
      drawInfernalEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "banshee":
      drawBansheeEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "juggernaut":
      drawJuggernautEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "assassin":
      drawAssassinEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "dragon":
      drawDragonEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "athlete":
      drawAthleteEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "protestor":
      drawProtestorEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "bog_creature":
      drawBogCreatureEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "will_o_wisp":
      drawWillOWispEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "swamp_troll":
      drawSwampTrollEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "nomad":
      drawNomadEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "scorpion":
      drawScorpionEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "scarab":
      drawScarabEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "snow_goblin":
      drawSnowGoblinEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "yeti":
      drawYetiEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "ice_witch":
      drawIceWitchEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
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
      drawDefaultEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
  }

  drawRegionOverlay(ctx, x, y, size, type, region, time, zoom);
}
