import { ENEMY_DATA } from "../../../../constants/enemies";
import { LEVEL_DATA } from "../../../../constants/maps";
import type { MapTheme } from "../../../../constants/maps";
import { LEVEL_WAVES } from "../../../../constants/waves";
import { drawEnemySprite } from "../../../../rendering/enemies";
import type { EnemyType } from "../../../../types";

const PREVIEW_ENEMY_SIZE = 16;
const PREVIEW_ENEMY_ZOOM = 0.5;

const levelEnemyCache = new Map<string, EnemyType[]>();

function getUniqueEnemiesForLevel(levelId: string): EnemyType[] {
  const cached = levelEnemyCache.get(levelId);
  if (cached) {
    return cached;
  }

  const waves = LEVEL_WAVES[levelId];
  if (!waves) {
    return [];
  }

  const seen = new Set<EnemyType>();
  for (const wave of waves) {
    for (const group of wave) {
      seen.add(group.type as EnemyType);
    }
  }
  const result = [...seen];
  levelEnemyCache.set(levelId, result);
  return result;
}

function getLevelTheme(levelId: string): MapTheme {
  return LEVEL_DATA[levelId]?.theme ?? "grassland";
}

const ENEMY_ARC_SLOTS: { angle: number; radius: number }[] = [
  { angle: -0.2, radius: 48 },
  { angle: 0.55, radius: 54 },
  { angle: -0.9, radius: 46 },
  { angle: 1.1, radius: 56 },
  { angle: -1.45, radius: 50 },
];

/**
 * Draws enemies surrounding a center point (the hero position).
 * The hero itself is drawn separately by the renderer using drawWorldMapHero.
 */
export function drawLevelBattlePreview(
  ctx: CanvasRenderingContext2D,
  heroX: number,
  heroY: number,
  levelId: string,
  time: number,
  isMobile: boolean
) {
  const enemies = getUniqueEnemiesForLevel(levelId);
  if (enemies.length === 0) {
    return;
  }

  const theme = getLevelTheme(levelId);
  const displayCount = isMobile ? 3 : 5;
  const shownEnemies = enemies.slice(0, displayCount);

  // Battle dust cloud centered on the hero
  ctx.fillStyle = "rgba(100, 80, 60, 0.13)";
  ctx.beginPath();
  ctx.ellipse(heroX, heroY + 8, 50, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Collect enemy draw data for depth sorting
  const enemyDrawCalls: {
    x: number;
    y: number;
    shadowY: number;
    eType: EnemyType;
    color: string;
    isFlying: boolean;
    attackPhase: number;
    facingLeft: boolean;
  }[] = [];

  for (let i = 0; i < shownEnemies.length; i++) {
    const eType = shownEnemies[i];
    const eData = ENEMY_DATA[eType];
    if (!eData) {
      continue;
    }

    const slot = ENEMY_ARC_SLOTS[i % ENEMY_ARC_SLOTS.length];
    const sway = Math.sin(time * 1.2 + i * 1.7) * 3;
    const bob = Math.sin(time * 2 + i * 0.9) * 2;
    const isFlying = eData.flying;
    const flyOffset = isFlying ? -16 + Math.sin(time * 1.8 + i) * 5 : 0;
    const attackPhase = Math.max(0, Math.sin(time * 1.8 + i * 1.5)) * 0.35;

    const ex = heroX + Math.cos(slot.angle) * slot.radius + sway;
    const ey =
      heroY + Math.sin(slot.angle) * slot.radius * 0.45 + bob + flyOffset;
    const facingLeft = ex > heroX;

    enemyDrawCalls.push({
      attackPhase,
      color: eData.color,
      eType,
      facingLeft,
      isFlying,
      shadowY: heroY + Math.sin(slot.angle) * slot.radius * 0.45 + 10,
      x: ex,
      y: ey,
    });
  }

  enemyDrawCalls.sort((a, b) => a.shadowY - b.shadowY);

  for (const e of enemyDrawCalls) {
    drawPreviewEnemy(ctx, e, theme, time);
  }

  // Weapon clash sparks around the hero
  const sparkPhase = Math.sin(time * 2.5);
  if (sparkPhase > 0.2) {
    const sparkAlpha = (sparkPhase - 0.2) * 0.7;
    ctx.fillStyle = `rgba(255,215,0,${sparkAlpha * 0.6})`;
    for (let s = 0; s < 5; s++) {
      const angle = time * 3 + s * ((Math.PI * 2) / 5);
      const dist = 10 + Math.sin(time * 5 + s * 2) * 5;
      const sx = heroX + Math.cos(angle) * dist;
      const sy = heroY - 4 + Math.sin(angle) * dist * 0.4;
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + sparkPhase * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(255,255,200,${sparkAlpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(heroX, heroY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPreviewEnemy(
  ctx: CanvasRenderingContext2D,
  e: {
    x: number;
    y: number;
    shadowY: number;
    eType: EnemyType;
    color: string;
    isFlying: boolean;
    attackPhase: number;
    facingLeft: boolean;
  },
  theme: MapTheme,
  time: number
) {
  ctx.fillStyle = `rgba(0,0,0,${e.isFlying ? 0.1 : 0.2})`;
  ctx.beginPath();
  ctx.ellipse(
    e.x,
    e.shadowY,
    PREVIEW_ENEMY_SIZE * 0.32,
    PREVIEW_ENEMY_SIZE * 0.12,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.save();
  ctx.translate(e.x, e.y);
  if (e.facingLeft) {
    ctx.scale(-1, 1);
  }

  drawEnemySprite(
    ctx,
    0,
    0,
    PREVIEW_ENEMY_SIZE,
    e.eType,
    e.color,
    0,
    time,
    e.isFlying,
    PREVIEW_ENEMY_ZOOM,
    e.attackPhase,
    theme
  );

  ctx.restore();
}
