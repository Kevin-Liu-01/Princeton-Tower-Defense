import type { HeroType } from "../../../../types";
import { drawHeroSprite } from "../../../../rendering/heroes";
import { HERO_DATA } from "../../../../constants/heroes";

const HERO_MAP_SIZE = 22;
const HERO_MAP_ZOOM = 0.7;

const HERO_MAP_SCALE: Partial<Record<HeroType, number>> = {
  ivy: 1.5,
};

export function drawWorldMapHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  heroType: HeroType,
  time: number,
  isMoving: boolean,
  facingRight: boolean,
  attackPhase: number = 0,
  isMobile: boolean = false,
) {
  const heroData = HERO_DATA[heroType];
  if (!heroData) return;

  const idleBob = isMoving ? 0 : Math.sin(time * 2) * 1.5;
  const runBob = isMoving ? Math.abs(Math.sin(time * 10)) * 3 : 0;
  const totalBob = idleBob + runBob;

  ctx.save();
  const shadowScale = isMoving ? 0.85 : 1;
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 10 * shadowScale, 3 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!isMobile) {
    // Selection glow ring (skip on mobile to save per-frame gradient/stroke work)
    const glowPulse = 0.25 + Math.sin(time * 3) * 0.1;
    ctx.strokeStyle = `rgba(255,200,60,${glowPulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y + 6, 12, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Dust trail when running (fewer particles on mobile)
  if (isMoving) {
    const dustCount = isMobile ? 2 : 4;
    for (let d = 0; d < dustCount; d++) {
      const dustAge = (time * 6 + d * 1.5) % 3;
      if (dustAge > 2) continue;
      const dustAlpha = (1 - dustAge / 2) * 0.25;
      const dustX = x + (facingRight ? -1 : 1) * (8 + dustAge * 6 + d * 3);
      const dustY = y + 6 - dustAge * 2;
      const dustSize = 2 + dustAge * 1.5;
      ctx.fillStyle = `rgba(140,120,90,${dustAlpha})`;
      ctx.beginPath();
      ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.translate(x, y - totalBob);
  if (!facingRight) {
    ctx.scale(-1, 1);
  }

  const scale = HERO_MAP_SCALE[heroType] ?? 1;
  drawHeroSprite(
    ctx,
    0,
    0,
    HERO_MAP_SIZE * scale,
    heroType,
    heroData.color,
    time,
    HERO_MAP_ZOOM * scale,
    attackPhase,
  );

  ctx.restore();
  ctx.restore();
}
