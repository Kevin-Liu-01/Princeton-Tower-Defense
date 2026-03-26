import type { Enemy, Position, MapTheme } from "../../types";
import { ENEMY_DATA, ISO_Y_RATIO, LEVEL_DATA, SUMMON_CHANNEL_DURATION, ENEMY_REGEN_DELAY_MS } from "../../constants";
import {
  worldToScreen,
  worldToScreenRounded,
  getEnemyPosition,
  lightenColor,
  darkenColor,
} from "../../utils";
import { renderInspectIndicator, type InspectRenderPass } from "../effects/inspectIndicator";
import { renderEnemyAttackEffect } from "./attackEffects";
import { getSlowAuraColors, getEnemyFlashProfile, enemyPaletteCache } from "./types";
import { drawRegionOverlay } from "./regionOverlays";
import { getPerformanceSettings } from "../performance";

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
  drawTigerFanEnemy,
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
import {
  drawSkeletonFootmanEnemy,
  drawSkeletonKnightEnemy,
  drawSkeletonArcherEnemy,
  drawSkeletonKingEnemy,
  drawZombieShamblerEnemy,
  drawZombieBruteEnemy,
  drawZombieSpitterEnemy,
  drawGhoulEnemy,
  drawDarkKnightEnemy,
  drawDeathKnightEnemy,
} from "./darkfantasy";
import {
  drawFallenPaladinEnemy,
  drawBlackGuardEnemy,
  drawLichEnemy,
  drawWraithEnemy,
  drawBoneMageEnemy,
  drawDarkPriestEnemy,
  drawRevenantEnemy,
  drawAbominationEnemy,
  drawHellhoundEnemy,
  drawDoomHeraldEnemy,
} from "./darkfantasyB";
import {
  drawTitanOfNassauEnemy,
  drawSwampLeviathanEnemy,
  drawSphinxGuardianEnemy,
  drawFrostColossusEnemy,
  drawInfernoWyrmEnemy,
} from "./regionbosses";
import {
  drawOrbWeaverEnemy,
  drawMantisEnemy,
  drawBombardierBeetleEnemy,
  drawMosquitoEnemy,
  drawCentipedeEnemy,
  drawDragonflyEnemy,
  drawSilkMothEnemy,
  drawAntSoldierEnemy,
  drawLocustEnemy,
  drawTrapdoorSpiderEnemy,
  drawIceBeetleEnemy,
  drawFrostTickEnemy,
  drawSnowMothEnemy,
  drawFireAntEnemy,
  drawMagmaBeetleEnemy,
  drawAshMothEnemy,
  drawBroodMotherEnemy,
} from "./bugs";
import {
  drawDireBearEnemy,
  drawAncientEntEnemy,
  drawForestTrollEnemy,
  drawTimberWolfEnemy,
  drawGiantEagleEnemy,
  drawSwampHydraEnemy,
  drawGiantToadEnemy,
  drawVineSerpentEnemy,
  drawMarshTrollEnemy,
  drawPhoenixEnemy,
  drawBasiliskEnemy,
  drawDjinnEnemy,
  drawManticoreEnemy,
  drawFrostTrollEnemy,
  drawDireWolfEnemy,
  drawWendigoEnemy,
  drawMammothEnemy,
  drawLavaGolemEnemy,
  drawVolcanicDrakeEnemy,
  drawSalamanderEnemy,
} from "./fantasy";
import {
  getAbilityActivationPhase,
  renderAbilityActivation,
} from "./abilityEffects";

const RIGHT_FACING_ENEMY_SPRITES = new Set([
  "catapult",
  "dire_wolf",
  "timber_wolf",
  "mammoth",
  "vine_serpent",
  "volcanic_drake",
  "salamander",
]);

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

  // These enemy sprites are drawn facing right instead of the default left,
  // so we invert the flip (same pattern as cavalry/centaur in troops renderer).
  const spriteReversed = RIGHT_FACING_ENEMY_SPRITES.has(enemy.type);
  const effectiveFacingRight = spriteReversed ? !enemy.facingRight : enemy.facingRight;
  const facingFlip = effectiveFacingRight ? -1 : 1;
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
    ctx.ellipse(screenPos.x, drawY, size * 0.56, size * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!lowDetailFx) {
      const rimTint = flashProfile.rimColor.match(/\d+/g) || ["255", "185", "150"];
      ctx.strokeStyle = `rgba(${rimTint[0]}, ${rimTint[1]}, ${rimTint[2]}, ${hurtAlpha * 0.8})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, drawY, size * 0.62, size * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Regeneration visual
  const hasRegenTrait = eData.traits?.includes("regenerating");
  const regenReady = !enemy.inCombat && now - (enemy.lastDamageTaken ?? 0) > ENEMY_REGEN_DELAY_MS;
  if (!minimalDetailFx && hasRegenTrait && regenReady && enemy.hp < enemy.maxHp) {
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

  // Ability activation flash
  if (!minimalDetailFx && enemy.lastAbilityType && enemy.lastAbilityUse) {
    const abilityPhase = getAbilityActivationPhase(enemy.lastAbilityUse, now);
    if (abilityPhase > 0) {
      renderAbilityActivation(
        ctx,
        screenPos.x,
        drawY,
        size,
        zoom,
        enemy.lastAbilityType,
        abilityPhase,
        time,
      );
    }
  }

  // Frozen effect
  if (enemy.frozen) {
    // Icy ground shadow
    const frostGrad = ctx.createRadialGradient(screenPos.x, drawY + size * 0.1, 0, screenPos.x, drawY + size * 0.1, size * 1.0);
    frostGrad.addColorStop(0, "rgba(120, 200, 255, 0.2)");
    frostGrad.addColorStop(0.5, "rgba(80, 170, 240, 0.12)");
    frostGrad.addColorStop(1, "rgba(60, 140, 220, 0)");
    ctx.fillStyle = frostGrad;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY + size * 0.1, size * 1.0, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner frost shell
    const shellPulse = 0.25 + Math.sin(time * 2) * 0.08;
    ctx.fillStyle = `rgba(180, 230, 255, ${shellPulse})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.85, size * 0.85 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(150, 215, 255, ${shellPulse + 0.1})`;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.65, size * 0.65 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated frost ring
    ctx.save();
    ctx.translate(screenPos.x, drawY);
    ctx.rotate(time * 0.3);
    ctx.strokeStyle = `rgba(100, 200, 255, ${0.85 + Math.sin(time * 3) * 0.15})`;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([5 * zoom, 3 * zoom]);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.78, size * 0.78 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Crystal shards
    const crystalRotation = time * 0.5;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + crystalRotation;
      const dist = size * (0.5 + Math.sin(time * 1.2 + i * 0.8) * 0.08);
      const cx = screenPos.x + Math.cos(angle) * dist;
      const cy = drawY + Math.sin(angle) * dist * ISO_Y_RATIO;
      const cSize = (3.5 + Math.sin(i * 1.3 + time) * 1.5) * zoom;
      const sparkle = 0.8 + Math.sin(time * 5 + i * 2.1) * 0.2;

      ctx.fillStyle = `rgba(220, 245, 255, ${sparkle})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy - cSize * 1.5);
      ctx.lineTo(cx + cSize * 0.5, cy - cSize * 0.3);
      ctx.lineTo(cx + cSize * 0.5, cy + cSize * 0.4);
      ctx.lineTo(cx, cy + cSize * 0.9);
      ctx.lineTo(cx - cSize * 0.5, cy + cSize * 0.4);
      ctx.lineTo(cx - cSize * 0.5, cy - cSize * 0.3);
      ctx.closePath();
      ctx.fill();

      // Crystal highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${sparkle * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(cx - cSize * 0.15, cy - cSize * 1.2);
      ctx.lineTo(cx + cSize * 0.12, cy - cSize * 0.2);
      ctx.lineTo(cx - cSize * 0.3, cy - cSize * 0.15);
      ctx.closePath();
      ctx.fill();

      // Crystal edge glow
      ctx.strokeStyle = `rgba(180, 230, 255, ${sparkle * 0.5})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(cx, cy - cSize * 1.5);
      ctx.lineTo(cx + cSize * 0.5, cy - cSize * 0.3);
      ctx.lineTo(cx + cSize * 0.5, cy + cSize * 0.4);
      ctx.lineTo(cx, cy + cSize * 0.9);
      ctx.lineTo(cx - cSize * 0.5, cy + cSize * 0.4);
      ctx.lineTo(cx - cSize * 0.5, cy - cSize * 0.3);
      ctx.closePath();
      ctx.stroke();
    }

    // Floating ice motes
    for (let i = 0; i < 5; i++) {
      const pAngle = time * 1.5 + i * 1.26;
      const pDist = size * (0.3 + Math.sin(time * 1.2 + i) * 0.15);
      const px = screenPos.x + Math.cos(pAngle) * pDist;
      const py = drawY - size * 0.3 + Math.sin(pAngle * 0.7 + time) * size * 0.2;
      const moteAlpha = 0.5 + Math.sin(time * 4 + i * 1.7) * 0.3;

      const moteGrad = ctx.createRadialGradient(px, py, 0, px, py, 3 * zoom);
      moteGrad.addColorStop(0, `rgba(255, 255, 255, ${moteAlpha})`);
      moteGrad.addColorStop(1, `rgba(200, 240, 255, 0)`);
      ctx.fillStyle = moteGrad;
      ctx.beginPath();
      ctx.arc(px, py, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Burning effect
  if (enemy.burning) {
    // Heat shimmer glow under the enemy
    const heatGrad = ctx.createRadialGradient(screenPos.x, drawY, 0, screenPos.x, drawY, size * 0.9);
    heatGrad.addColorStop(0, `rgba(255, 100, 20, ${0.2 + Math.sin(time * 6) * 0.08})`);
    heatGrad.addColorStop(0.5, `rgba(255, 60, 0, ${0.1 + Math.sin(time * 5) * 0.05})`);
    heatGrad.addColorStop(1, "rgba(255, 40, 0, 0)");
    ctx.fillStyle = heatGrad;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fire ring at base
    const ringPulse = 0.35 + Math.sin(time * 8) * 0.15;
    ctx.strokeStyle = `rgba(255, 120, 20, ${ringPulse})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY + size * 0.05, size * 0.5, size * 0.5 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Main flames (5 for better coverage)
    for (let i = 0; i < 5; i++) {
      const flameOffset = Math.sin(time * 6 + i * 1.4) * size * 0.15;
      const flameX = screenPos.x + flameOffset + (i - 2) * size * 0.1;
      const baseY = drawY - size * 0.1;
      const flameHeight = (size * 0.6 + Math.sin(time * 7 + i * 2) * size * 0.18) * zoom;
      const flameWidth = (size * 0.16 + Math.sin(time * 5 + i) * size * 0.04) * zoom;
      const flicker = Math.sin(time * 12 + i * 3) * 0.12;

      // Outer flame (dark red)
      ctx.fillStyle = `rgba(200, 50, 10, ${0.7 + flicker})`;
      ctx.beginPath();
      ctx.moveTo(flameX, baseY);
      ctx.quadraticCurveTo(flameX - flameWidth * 1.1, baseY - flameHeight * 0.45, flameX, baseY - flameHeight);
      ctx.quadraticCurveTo(flameX + flameWidth * 1.1, baseY - flameHeight * 0.45, flameX, baseY);
      ctx.fill();

      // Middle flame (bright orange)
      ctx.fillStyle = `rgba(255, ${160 + Math.floor(Math.sin(time * 8 + i) * 40)}, 30, ${0.85 + flicker})`;
      ctx.beginPath();
      ctx.moveTo(flameX, baseY);
      ctx.quadraticCurveTo(flameX - flameWidth * 0.7, baseY - flameHeight * 0.4, flameX, baseY - flameHeight * 0.75);
      ctx.quadraticCurveTo(flameX + flameWidth * 0.7, baseY - flameHeight * 0.4, flameX, baseY);
      ctx.fill();

      // Inner flame core (yellow-white)
      ctx.fillStyle = `rgba(255, ${220 + Math.floor(Math.sin(time * 10 + i) * 30)}, ${120 + Math.floor(Math.sin(time * 9 + i) * 50)}, ${0.8 + flicker})`;
      ctx.beginPath();
      ctx.moveTo(flameX, baseY);
      ctx.quadraticCurveTo(flameX - flameWidth * 0.35, baseY - flameHeight * 0.3, flameX, baseY - flameHeight * 0.5);
      ctx.quadraticCurveTo(flameX + flameWidth * 0.35, baseY - flameHeight * 0.3, flameX, baseY);
      ctx.fill();
    }

    // Rising embers with trails
    for (let i = 0; i < 6; i++) {
      const emberPhase = (time * 2.5 + i * 0.35) % 1;
      const drift = Math.sin(time * 3 + i * 2.2) * size * 0.35;
      const emberX = screenPos.x + drift;
      const emberY = drawY - size * 0.15 - emberPhase * size * 1.0;
      const emberSize = (1.8 - emberPhase * 1.2) * zoom;
      const emberAlpha = (1 - emberPhase) * 0.85;

      // Ember trail
      if (emberPhase > 0.1) {
        ctx.strokeStyle = `rgba(255, ${180 - Math.floor(emberPhase * 80)}, 50, ${emberAlpha * 0.4})`;
        ctx.lineWidth = emberSize * 0.6;
        ctx.beginPath();
        ctx.moveTo(emberX, emberY);
        ctx.lineTo(emberX - drift * 0.15, emberY + size * 0.12);
        ctx.stroke();
      }

      // Ember glow
      const eGrad = ctx.createRadialGradient(emberX, emberY, 0, emberX, emberY, emberSize * 2.5);
      eGrad.addColorStop(0, `rgba(255, ${200 - Math.floor(emberPhase * 100)}, ${80 - Math.floor(emberPhase * 60)}, ${emberAlpha * 0.5})`);
      eGrad.addColorStop(1, "rgba(255, 100, 0, 0)");
      ctx.fillStyle = eGrad;
      ctx.beginPath();
      ctx.arc(emberX, emberY, emberSize * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Ember core
      ctx.fillStyle = `rgba(255, ${220 - Math.floor(emberPhase * 120)}, ${100 - Math.floor(emberPhase * 80)}, ${emberAlpha})`;
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

    // Gradient aura fill
    const auraGrad = ctx.createRadialGradient(screenPos.x, drawY, 0, screenPos.x, drawY, size * 0.9);
    auraGrad.addColorStop(0, `rgba(${sc.aura}, ${0.3 * slowIntensity})`);
    auraGrad.addColorStop(0.6, `rgba(${sc.aura}, ${0.15 * slowIntensity})`);
    auraGrad.addColorStop(1, `rgba(${sc.aura}, 0)`);
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated outer ring
    ctx.save();
    ctx.translate(screenPos.x, drawY);
    ctx.rotate(time * 0.8);
    ctx.strokeStyle = `rgba(${sc.ring}, ${0.85 * slowIntensity * pulseAlpha})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.setLineDash([8 * zoom, 4 * zoom]);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.8, size * 0.8 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Inner pulsing ring
    const innerPulse = size * (0.48 + Math.sin(time * 3) * 0.04);
    ctx.strokeStyle = `rgba(${sc.inner}, ${0.9 * slowIntensity})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY, innerPulse, innerPulse * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting rune diamonds with glow
    for (let i = 0; i < 6; i++) {
      const runeAngle = time * 0.8 + (i / 6) * Math.PI * 2;
      const rx = screenPos.x + Math.cos(runeAngle) * size * 0.78;
      const ry = drawY + Math.sin(runeAngle) * size * 0.78 * ISO_Y_RATIO;
      const runeSize = 4.5 * zoom;
      const runeGlow = 0.85 + Math.sin(time * 5 + i * 1.1) * 0.15;

      // Rune glow
      const rGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, runeSize * 2);
      rGrad.addColorStop(0, `rgba(${sc.rune}, ${0.3 * slowIntensity * runeGlow})`);
      rGrad.addColorStop(1, `rgba(${sc.rune}, 0)`);
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, runeSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // Rune diamond
      ctx.fillStyle = `rgba(${sc.rune}, ${runeGlow * slowIntensity})`;
      ctx.beginPath();
      ctx.moveTo(rx, ry - runeSize);
      ctx.lineTo(rx + runeSize * 0.7, ry);
      ctx.lineTo(rx, ry + runeSize);
      ctx.lineTo(rx - runeSize * 0.7, ry);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(${sc.runeOutline}, ${0.75 * slowIntensity})`;
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
    }

    // Floating mist particles with trails
    for (let i = 0; i < 6; i++) {
      const pAngle = time * 2.2 + i * 1.05;
      const pDist = size * (0.35 + Math.sin(time * 1.8 + i) * 0.15);
      const px = screenPos.x + Math.cos(pAngle) * pDist;
      const py = drawY + Math.sin(pAngle) * pDist * 0.5 - size * 0.1;
      const pAlpha = (0.7 + Math.sin(time * 4 + i * 1.5) * 0.25) * slowIntensity;

      // Particle glow
      const pGrad = ctx.createRadialGradient(px, py, 0, px, py, 4 * zoom);
      pGrad.addColorStop(0, `rgba(${sc.particle}, ${pAlpha * 0.5})`);
      pGrad.addColorStop(1, `rgba(${sc.particle}, 0)`);
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${sc.particle}, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Stunned effect
  if (now < enemy.stunUntil && !enemy.frozen) {
    const stunRemaining = (enemy.stunUntil - now) / 1000;
    const stunPulse = 0.7 + Math.sin(time * 6) * 0.3;

    // Concussion ring pulse
    const ringPhase = (time * 3) % 1;
    const concussionR = size * (0.3 + ringPhase * 0.6);
    ctx.strokeStyle = `rgba(255, 240, 100, ${(1 - ringPhase) * 0.4 * stunPulse})`;
    ctx.lineWidth = (2 - ringPhase * 1.5) * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, drawY - size * 0.5, concussionR, concussionR * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Daze glow above head
    const dazeGrad = ctx.createRadialGradient(
      screenPos.x, drawY - size * 0.65, 0,
      screenPos.x, drawY - size * 0.65, size * 0.35,
    );
    dazeGrad.addColorStop(0, `rgba(255, 255, 150, ${0.2 * stunPulse})`);
    dazeGrad.addColorStop(1, "rgba(255, 240, 80, 0)");
    ctx.fillStyle = dazeGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, drawY - size * 0.65, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting stars with sparkle trails
    const orbitRadius = size * 0.5;
    const starCount = stunRemaining > 1 ? 4 : 3;

    for (let i = 0; i < starCount; i++) {
      const baseAngle = time * 4.5 + (i / starCount) * Math.PI * 2;

      // Star trail
      for (let t = 3; t >= 0; t--) {
        const trailAngle = baseAngle - t * 0.12;
        const trailAlpha = (1 - t * 0.22) * 0.45;
        const tx = screenPos.x + Math.cos(trailAngle) * orbitRadius * 0.7;
        const ty = drawY - size * 0.65 + Math.sin(trailAngle) * orbitRadius * ISO_Y_RATIO;
        ctx.fillStyle = `rgba(255, 255, 100, ${trailAlpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, (2.5 - t * 0.45) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      const sx = screenPos.x + Math.cos(baseAngle) * orbitRadius * 0.7;
      const sy = drawY - size * 0.65 + Math.sin(baseAngle) * orbitRadius * ISO_Y_RATIO;
      const starSize = (4 + Math.sin(time * 8 + i * 2) * 0.8) * zoom;

      // Star glow
      const sGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, starSize * 2);
      sGrad.addColorStop(0, "rgba(255, 255, 180, 0.4)");
      sGrad.addColorStop(1, "rgba(255, 255, 100, 0)");
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, starSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // Star body (8-point)
      ctx.fillStyle = `rgba(255, 255, 150, ${0.9 + Math.sin(time * 6 + i) * 0.1})`;
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

      // Bright center sparkle
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(sx, sy, starSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Small sparkle motes
    for (let i = 0; i < 3; i++) {
      const moteAngle = time * 6 + i * 2.1;
      const moteDist = size * 0.25;
      const mx = screenPos.x + Math.cos(moteAngle) * moteDist;
      const my = drawY - size * 0.7 + Math.sin(moteAngle * 1.3) * size * 0.1;
      const moteAlpha = 0.4 + Math.sin(time * 10 + i * 3) * 0.4;
      ctx.fillStyle = `rgba(255, 255, 200, ${moteAlpha})`;
      ctx.beginPath();
      ctx.arc(mx, my, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Hex Ward aura effect
  if (enemy.hexWard && enemy.hexWardUntil && enemy.hexWardUntil > now) {
    const cursePulse = 0.7 + Math.sin(time * 4.5) * 0.25;
    const remainingRatio = Math.max(0.35, Math.min(1, (enemy.hexWardUntil - now) / 4000));

    const hexGlow = ctx.createRadialGradient(
      screenPos.x,
      drawY,
      0,
      screenPos.x,
      drawY,
      size * 0.95,
    );
    hexGlow.addColorStop(0, `rgba(168, 85, 247, ${0.18 * cursePulse})`);
    hexGlow.addColorStop(0.55, `rgba(147, 51, 234, ${0.12 * remainingRatio})`);
    hexGlow.addColorStop(1, "rgba(88, 28, 135, 0)");
    ctx.fillStyle = hexGlow;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      drawY,
      size * 0.92,
      size * 0.92 * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.save();
    ctx.translate(screenPos.x, drawY - size * 0.08);
    ctx.rotate(time * 0.9);
    ctx.strokeStyle = `rgba(217, 70, 239, ${0.7 * cursePulse})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 3;
      const px = Math.cos(angle) * size * 0.78;
      const py = Math.sin(angle) * size * 0.52;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.rotate(-time * 1.7);
    ctx.strokeStyle = `rgba(244, 114, 182, ${0.5 * cursePulse})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < 4; i++) {
      const runeAngle = time * 1.8 + (i * Math.PI * 2) / 4;
      const rx = screenPos.x + Math.cos(runeAngle) * size * 0.78;
      const ry = drawY - size * 0.12 + Math.sin(runeAngle) * size * 0.32;
      const runeSize = size * 0.08;

      ctx.fillStyle = `rgba(232, 121, 249, ${0.55 + Math.sin(time * 6 + i) * 0.18})`;
      ctx.beginPath();
      ctx.moveTo(rx, ry - runeSize);
      ctx.lineTo(rx + runeSize * 0.7, ry);
      ctx.lineTo(rx, ry + runeSize);
      ctx.lineTo(rx - runeSize * 0.7, ry);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
    }

    ctx.fillStyle = `rgba(245, 208, 254, ${0.9 * cursePulse})`;
    ctx.font = `bold ${Math.max(10, size * 0.22)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⌬", screenPos.x, drawY - size * 0.82);
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

  // Summoning channel ritual effect
  if (enemy.summoning && enemy.summonStartTime) {
    const channelElapsed = now - enemy.summonStartTime;
    const channelProgress = Math.min(1, channelElapsed / SUMMON_CHANNEL_DURATION);
    const summonColor = eData.color || "#7722cc";
    const ritualRadius = size * (0.8 + channelProgress * 0.6);
    const ritualY = screenPos.y + 5 * zoom;

    ctx.save();
    ctx.globalAlpha = spawnAlpha * (0.4 + channelProgress * 0.4);

    // Outer ritual ring — rotating
    const ringRotation = time * 3;
    ctx.strokeStyle = summonColor;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4 * zoom, 6 * zoom]);
    ctx.lineDashOffset = -time * 40;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, ritualY, ritualRadius, ritualRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner pulse ring
    const pulseScale = 0.5 + Math.sin(time * 6) * 0.15;
    ctx.strokeStyle = summonColor;
    ctx.lineWidth = 1.5 * zoom;
    ctx.globalAlpha = spawnAlpha * (0.3 + channelProgress * 0.5) * (0.6 + Math.sin(time * 8) * 0.4);
    ctx.beginPath();
    ctx.ellipse(screenPos.x, ritualY, ritualRadius * pulseScale, ritualRadius * pulseScale * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rune marks around the circle
    const runeCount = 4;
    ctx.globalAlpha = spawnAlpha * channelProgress * 0.8;
    ctx.fillStyle = summonColor;
    for (let i = 0; i < runeCount; i++) {
      const angle = ringRotation + (i * Math.PI * 2) / runeCount;
      const rx = screenPos.x + Math.cos(angle) * ritualRadius * 0.85;
      const ry = ritualY + Math.sin(angle) * ritualRadius * 0.85 * ISO_Y_RATIO;
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5 * zoom * (0.7 + channelProgress * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }

    // Energy column rising from the summoner
    if (channelProgress > 0.3) {
      const columnAlpha = (channelProgress - 0.3) * 1.4;
      const columnHeight = size * 1.2 * channelProgress;
      const colGrad = ctx.createLinearGradient(screenPos.x, drawY, screenPos.x, drawY - columnHeight);
      colGrad.addColorStop(0, summonColor);
      colGrad.addColorStop(1, "transparent");
      ctx.globalAlpha = spawnAlpha * columnAlpha * 0.35;
      ctx.fillStyle = colGrad;
      ctx.beginPath();
      ctx.ellipse(screenPos.x, drawY, size * 0.3, columnHeight, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.save();
    ctx.globalAlpha = spawnAlpha;
  }

  // HP bar with armor display
  if (getPerformanceSettings().showHealthBars && (enemy.hp < enemy.maxHp || eData.armor > 0)) {
    const barWidth = size * 1.4;
    const barHeight = 6 * zoom;
    const barY = drawY - size * 1.3;
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
  renderPass: InspectRenderPass = "all",
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
    unitType: "enemy",
    renderPass,
  });
}

export function drawEnemySprite(
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
    case "tiger_fan":
      drawTigerFanEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
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
    case "skeleton_footman":
      drawSkeletonFootmanEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "skeleton_knight":
      drawSkeletonKnightEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "skeleton_archer":
      drawSkeletonArcherEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "skeleton_king":
      drawSkeletonKingEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "zombie_shambler":
      drawZombieShamblerEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "zombie_brute":
      drawZombieBruteEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "zombie_spitter":
      drawZombieSpitterEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "ghoul":
      drawGhoulEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "dark_knight":
      drawDarkKnightEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "death_knight":
      drawDeathKnightEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "fallen_paladin":
      drawFallenPaladinEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "black_guard":
      drawBlackGuardEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "lich":
      drawLichEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "wraith":
      drawWraithEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "bone_mage":
      drawBoneMageEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "dark_priest":
      drawDarkPriestEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "revenant":
      drawRevenantEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "abomination":
      drawAbominationEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "hellhound":
      drawHellhoundEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "doom_herald":
      drawDoomHeraldEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "titan_of_nassau":
      drawTitanOfNassauEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "swamp_leviathan":
      drawSwampLeviathanEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "sphinx_guardian":
      drawSphinxGuardianEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "frost_colossus":
      drawFrostColossusEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "inferno_wyrm":
      drawInfernoWyrmEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "orb_weaver":
      drawOrbWeaverEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "mantis":
      drawMantisEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "bombardier_beetle":
      drawBombardierBeetleEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "mosquito":
      drawMosquitoEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "centipede":
      drawCentipedeEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "dragonfly":
      drawDragonflyEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "silk_moth":
      drawSilkMothEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "ant_soldier":
      drawAntSoldierEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "locust":
      drawLocustEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "trapdoor_spider":
      drawTrapdoorSpiderEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "ice_beetle":
      drawIceBeetleEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "frost_tick":
      drawFrostTickEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "snow_moth":
      drawSnowMothEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "fire_ant":
      drawFireAntEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "magma_beetle":
      drawMagmaBeetleEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "ash_moth":
      drawAshMothEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "brood_mother":
      drawBroodMotherEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "dire_bear":
      drawDireBearEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "ancient_ent":
      drawAncientEntEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "forest_troll":
      drawForestTrollEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "timber_wolf":
      drawTimberWolfEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "giant_eagle":
      drawGiantEagleEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "swamp_hydra":
      drawSwampHydraEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "giant_toad":
      drawGiantToadEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "vine_serpent":
      drawVineSerpentEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "marsh_troll":
      drawMarshTrollEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "phoenix":
      drawPhoenixEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "basilisk":
      drawBasiliskEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "djinn":
      drawDjinnEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "manticore":
      drawManticoreEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "frost_troll":
      drawFrostTrollEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "dire_wolf":
      drawDireWolfEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "wendigo":
      drawWendigoEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "mammoth":
      drawMammothEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "lava_golem":
      drawLavaGolemEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "volcanic_drake":
      drawVolcanicDrakeEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    case "salamander":
      drawSalamanderEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
      break;
    default:
      drawDefaultEnemy(ctx, x, y, size, bodyColor, bodyColorDark, bodyColorLight, time, zoom, attackPhase);
  }

  drawRegionOverlay(ctx, x, y, size, type, region, time, zoom);
}
