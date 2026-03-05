import type { Effect, Position } from "../../types";

interface DeathAnimationParams {
  ctx: CanvasRenderingContext2D;
  screenPos: Position;
  zoom: number;
  progress: number;
  effect: Effect;
}

function getDeathSize(effect: Effect, zoom: number): number {
  return (effect.enemySize || effect.size || 20) * zoom;
}

function getDeathColor(effect: Effect): string {
  return effect.color || "#ff4444";
}

// Deterministic pseudo-random from index for consistent fragment positions across frames
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// Lightning / Dust Death
// Electric flash -> collapse into dust pile that fades
// ---------------------------------------------------------------------------
export function renderLightningDeath({
  ctx,
  screenPos,
  zoom,
  progress: t,
  effect,
}: DeathAnimationParams): void {
  const size = getDeathSize(effect, zoom);
  const cx = screenPos.x;
  const cy = screenPos.y;

  // Phase 1 (0–0.15): Bright electric flash
  if (t < 0.15) {
    const flashT = t / 0.15;
    const scale = 1 + flashT * 0.6;
    ctx.globalAlpha = (1 - flashT) * 0.9;
    ctx.fillStyle = `rgba(120, 200, 255, ${1 - flashT * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.6 * scale, size * 0.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = (1 - flashT) * 0.7;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.3 * scale, size * 0.25 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 (0.05–0.35): Electric arcs scatter outward
  if (t > 0.05 && t < 0.35) {
    const arcT = (t - 0.05) / 0.3;
    const arcCount = 6;
    for (let i = 0; i < arcCount; i++) {
      const angle = (i / arcCount) * Math.PI * 2 + i * 1.3;
      const dist = arcT * size * 1.4;
      const ax = cx + Math.cos(angle) * dist;
      const ay = cy + Math.sin(angle) * dist * 0.7 - arcT * size * 0.2;
      const segLen = size * 0.2 * (1 - arcT);

      ctx.globalAlpha = (1 - arcT) * 0.8;
      ctx.strokeStyle = i % 2 === 0 ? "#78c8ff" : "#ffffff";
      ctx.lineWidth = Math.max(1, (1 - arcT) * 2 * zoom);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      const jitter = seededRandom(i * 7 + 3) * segLen - segLen * 0.5;
      ctx.lineTo(ax + jitter, ay - segLen);
      ctx.lineTo(ax - jitter * 0.6, ay - segLen * 1.6);
      ctx.stroke();
    }
  }

  // Phase 3 (0.2–1.0): Dust pile forms and fades
  if (t > 0.2) {
    const pileT = (t - 0.2) / 0.8;
    const pileAppear = Math.min(1, pileT * 3);
    const pileFade = pileT > 0.5 ? (pileT - 0.5) / 0.5 : 0;
    const pileAlpha = pileAppear * (1 - pileFade) * 0.6;
    const pileW = size * 0.6;
    const pileH = size * 0.2;

    ctx.globalAlpha = pileAlpha;
    ctx.fillStyle = "#8b7d6b";
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.15, pileW * pileAppear, pileH * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Darker center mound
    ctx.fillStyle = "#6b5d4b";
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.12, pileW * 0.6 * pileAppear, pileH * 0.7 * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 4 (0.25–0.7): Residual sparks crackling around the dust
  if (t > 0.25 && t < 0.7) {
    const sparkT = (t - 0.25) / 0.45;
    const sparkCount = 5;
    for (let i = 0; i < sparkCount; i++) {
      const phase = seededRandom(i * 13 + 5);
      if (sparkT < phase * 0.3 || sparkT > phase * 0.7 + 0.3) continue;
      const localT = (sparkT - phase * 0.3) / (phase * 0.7 + 0.3 - phase * 0.3);
      const angle = seededRandom(i * 19) * Math.PI * 2;
      const dist = size * (0.3 + seededRandom(i * 31) * 0.3);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist * 0.5 + size * 0.1;

      ctx.globalAlpha = (1 - Math.abs(localT - 0.5) * 2) * 0.9;
      ctx.fillStyle = "#78c8ff";
      ctx.beginPath();
      ctx.arc(sx, sy, zoom * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Fire / Ash Death
// Orange flash -> dark ash pile with floating embers
// ---------------------------------------------------------------------------
export function renderFireDeath({
  ctx,
  screenPos,
  zoom,
  progress: t,
  effect,
}: DeathAnimationParams): void {
  const size = getDeathSize(effect, zoom);
  const cx = screenPos.x;
  const cy = screenPos.y;

  // Phase 1 (0–0.2): Orange/red flash
  if (t < 0.2) {
    const flashT = t / 0.2;
    const scale = 1 + flashT * 0.5;
    ctx.globalAlpha = (1 - flashT) * 0.85;
    ctx.fillStyle = `rgba(255, 120, 30, ${1 - flashT * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.55 * scale, size * 0.45 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 220, 80, ${(1 - flashT) * 0.6})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.3 * scale, size * 0.25 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 (0.1–0.4): Fire burst fragments
  if (t > 0.1 && t < 0.4) {
    const burstT = (t - 0.1) / 0.3;
    const fragCount = 7;
    for (let i = 0; i < fragCount; i++) {
      const angle = (i / fragCount) * Math.PI * 2 + i * 0.9;
      const dist = burstT * size * 1.2;
      const fx = cx + Math.cos(angle) * dist;
      const fy = cy + Math.sin(angle) * dist * 0.6 - burstT * size * 0.4;
      const fragSize = size * 0.1 * (1 - burstT);

      ctx.globalAlpha = (1 - burstT) * 0.7;
      ctx.fillStyle = i % 3 === 0 ? "#ff6600" : i % 3 === 1 ? "#ffaa00" : "#ff3300";
      ctx.beginPath();
      ctx.arc(fx, fy, fragSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 3 (0.25–1.0): Ash pile (dark grey/charcoal)
  if (t > 0.25) {
    const pileT = (t - 0.25) / 0.75;
    const pileAppear = Math.min(1, pileT * 3);
    const pileFade = pileT > 0.55 ? (pileT - 0.55) / 0.45 : 0;
    const pileAlpha = pileAppear * (1 - pileFade) * 0.65;
    const pileW = size * 0.55;
    const pileH = size * 0.18;

    // Base ash pile
    ctx.globalAlpha = pileAlpha;
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.15, pileW * pileAppear, pileH * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow (fading orange -> grey)
    const glowIntensity = Math.max(0, 1 - pileT * 1.5);
    if (glowIntensity > 0) {
      ctx.globalAlpha = pileAlpha * glowIntensity * 0.5;
      ctx.fillStyle = "#cc5500";
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.13, pileW * 0.5 * pileAppear, pileH * 0.6 * pileAppear, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 4 (0.2–0.85): Floating embers rising upward
  if (t > 0.2 && t < 0.85) {
    const emberT = (t - 0.2) / 0.65;
    const emberCount = 8;
    for (let i = 0; i < emberCount; i++) {
      const phase = seededRandom(i * 17 + 3);
      const startT = phase * 0.3;
      if (emberT < startT) continue;
      const localT = Math.min(1, (emberT - startT) / (1 - startT));

      const xSpread = (seededRandom(i * 23) - 0.5) * size * 0.8;
      const drift = (seededRandom(i * 37) - 0.5) * size * 0.3 * localT;
      const ex = cx + xSpread * (0.5 + localT * 0.5) + drift;
      const ey = cy + size * 0.1 - localT * size * 1.2;

      ctx.globalAlpha = (1 - localT) * 0.8;
      const emberSize = zoom * (1 + seededRandom(i * 41) * 1.5) * (1 - localT * 0.5);
      ctx.fillStyle = localT < 0.4 ? "#ff8800" : localT < 0.7 ? "#ff5500" : "#cc3300";
      ctx.beginPath();
      ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 5 (0.15–0.5): Thin smoke wisps
  if (t > 0.15 && t < 0.5) {
    const smokeT = (t - 0.15) / 0.35;
    ctx.globalAlpha = (1 - smokeT) * 0.2;
    const smokeSize = size * 0.4 * (1 + smokeT * 1.5);
    ctx.fillStyle = `rgba(60, 60, 60, ${(1 - smokeT) * 0.2})`;
    ctx.beginPath();
    ctx.arc(cx, cy - smokeT * size * 0.5, smokeSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Freeze / Shatter Death
// Ice-blue flash -> angular ice fragments slide outward
// ---------------------------------------------------------------------------
export function renderFreezeDeath({
  ctx,
  screenPos,
  zoom,
  progress: t,
  effect,
}: DeathAnimationParams): void {
  const size = getDeathSize(effect, zoom);
  const cx = screenPos.x;
  const cy = screenPos.y;

  // Phase 1 (0–0.15): Ice-blue flash
  if (t < 0.15) {
    const flashT = t / 0.15;
    const scale = 1 + flashT * 0.3;
    ctx.globalAlpha = (1 - flashT) * 0.85;
    ctx.fillStyle = `rgba(150, 220, 255, ${1 - flashT * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.5 * scale, size * 0.4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = (1 - flashT) * 0.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.25 * scale, size * 0.2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 (0.08–0.7): Angular ice shards slide outward
  if (t > 0.08 && t < 0.7) {
    const shardT = (t - 0.08) / 0.62;
    const shardCount = 10;
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2 + seededRandom(i * 11) * 0.5;
      const dist = shardT * size * (1.0 + seededRandom(i * 7) * 0.8);
      const sx = cx + Math.cos(angle) * dist;
      // Shards slide mostly horizontally (isometric ground), slight upward drift
      const sy = cy + Math.sin(angle) * dist * 0.5;

      const shardW = size * (0.06 + seededRandom(i * 29) * 0.08) * (1 - shardT * 0.7);
      const shardH = shardW * (1.5 + seededRandom(i * 43) * 1.5);

      ctx.globalAlpha = (1 - shardT) * 0.75;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle + seededRandom(i * 53) * 1.5);

      // Ice shard body
      ctx.fillStyle = i % 3 === 0 ? "#a0e0ff" : i % 3 === 1 ? "#d0f0ff" : "#80c8ee";
      ctx.beginPath();
      ctx.moveTo(0, -shardH * 0.5);
      ctx.lineTo(shardW * 0.5, 0);
      ctx.lineTo(0, shardH * 0.5);
      ctx.lineTo(-shardW * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      // White highlight on each shard
      ctx.globalAlpha = (1 - shardT) * 0.4;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -shardH * 0.3);
      ctx.lineTo(shardW * 0.25, 0);
      ctx.lineTo(0, shardH * 0.1);
      ctx.lineTo(-shardW * 0.25, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  // Phase 3 (0.05–0.4): Crystalline sparkles
  if (t > 0.05 && t < 0.4) {
    const sparkleT = (t - 0.05) / 0.35;
    const sparkleCount = 6;
    for (let i = 0; i < sparkleCount; i++) {
      const phase = seededRandom(i * 67);
      if (sparkleT < phase * 0.3 || sparkleT > phase * 0.5 + 0.5) continue;
      const localT = (sparkleT - phase * 0.3) / (phase * 0.5 + 0.5 - phase * 0.3);
      const twinkle = Math.sin(localT * Math.PI);

      const angle = seededRandom(i * 79) * Math.PI * 2;
      const dist = size * (0.3 + seededRandom(i * 83) * 0.8);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist * 0.5;

      ctx.globalAlpha = twinkle * 0.9;
      ctx.fillStyle = "#ffffff";
      const starSize = zoom * (1.5 + seededRandom(i * 89) * 1.5);

      // 4-point star sparkle
      ctx.beginPath();
      ctx.moveTo(sx, sy - starSize);
      ctx.lineTo(sx + starSize * 0.3, sy);
      ctx.lineTo(sx, sy + starSize);
      ctx.lineTo(sx - starSize * 0.3, sy);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx - starSize, sy);
      ctx.lineTo(sx, sy + starSize * 0.3);
      ctx.lineTo(sx + starSize, sy);
      ctx.lineTo(sx, sy - starSize * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Phase 4 (0.3–0.8): Frost mist on ground
  if (t > 0.3 && t < 0.8) {
    const mistT = (t - 0.3) / 0.5;
    const mistAlpha = (1 - mistT) * 0.2;
    const mistSize = size * 0.5 * (1 + mistT);
    ctx.globalAlpha = mistAlpha;
    ctx.fillStyle = `rgba(180, 230, 255, ${mistAlpha})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.1, mistSize, mistSize * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Sonic / Ripple Death
// Rapid vibration -> concentric sonic rings + debris scatter
// ---------------------------------------------------------------------------
export function renderSonicDeath({
  ctx,
  screenPos,
  zoom,
  progress: t,
  effect,
}: DeathAnimationParams): void {
  const size = getDeathSize(effect, zoom);
  const deathColor = getDeathColor(effect);
  const cx = screenPos.x;
  const cy = screenPos.y;

  // Phase 1 (0–0.15): Vibration blur (rapid offset silhouettes)
  if (t < 0.15) {
    const vibT = t / 0.15;
    const vibAmp = size * 0.08 * (1 - vibT);
    const vibCount = 3;
    for (let i = 0; i < vibCount; i++) {
      const offset = Math.sin(i * Math.PI * 2 / vibCount + vibT * 30) * vibAmp;
      ctx.globalAlpha = (1 - vibT) * 0.3;
      ctx.fillStyle = deathColor;
      ctx.beginPath();
      ctx.ellipse(cx + offset, cy, size * 0.35, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 2 (0.08–0.8): Concentric sonic rings
  if (t > 0.08) {
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const ringDelay = i * 0.1;
      if (t < 0.08 + ringDelay || t > 0.08 + ringDelay + 0.5) continue;
      const ringT = (t - 0.08 - ringDelay) / 0.5;
      const ringRadius = ringT * size * (1.2 + i * 0.4);
      const ringAlpha = (1 - ringT) * (0.5 - i * 0.1);

      ctx.globalAlpha = ringAlpha;
      ctx.strokeStyle = i === 0 ? "#dda0ff" : i === 1 ? "#cc80ee" : "#bb66dd";
      ctx.lineWidth = Math.max(1, (1 - ringT) * (3 - i * 0.5) * zoom);
      ctx.beginPath();
      ctx.ellipse(cx, cy, ringRadius, ringRadius * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Phase 3 (0.1–0.6): Debris particles scattered by the blast
  if (t > 0.1 && t < 0.6) {
    const debrisT = (t - 0.1) / 0.5;
    const debrisCount = 8;
    for (let i = 0; i < debrisCount; i++) {
      const angle = (i / debrisCount) * Math.PI * 2 + seededRandom(i * 17) * 0.8;
      const speed = 0.8 + seededRandom(i * 23) * 0.6;
      const dist = debrisT * size * speed * 1.5;
      const dx = cx + Math.cos(angle) * dist;
      const dy = cy + Math.sin(angle) * dist * 0.5;
      const debrisSize = size * 0.06 * (1 - debrisT);

      ctx.globalAlpha = (1 - debrisT) * 0.6;
      ctx.fillStyle = i % 2 === 0 ? deathColor : "#aaaaaa";
      ctx.fillRect(dx - debrisSize, dy - debrisSize, debrisSize * 2, debrisSize * 2);
    }
  }

  // Phase 4 (0.05–0.3): Central burst flash
  if (t > 0.05 && t < 0.3) {
    const burstT = (t - 0.05) / 0.25;
    ctx.globalAlpha = (1 - burstT) * 0.4;
    const burstSize = size * 0.3 * (1 + burstT * 0.8);
    ctx.fillStyle = `rgba(200, 160, 255, ${(1 - burstT) * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, burstSize, burstSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Poison / Dissolve Death
// Green/purple tint -> melts downward into bubbling pool -> vapor rises
// ---------------------------------------------------------------------------
export function renderPoisonDeath({
  ctx,
  screenPos,
  zoom,
  progress: t,
  effect,
}: DeathAnimationParams): void {
  const size = getDeathSize(effect, zoom);
  const cx = screenPos.x;
  const cy = screenPos.y;

  // Phase 1 (0–0.2): Green/purple flash
  if (t < 0.2) {
    const flashT = t / 0.2;
    const scale = 1 + flashT * 0.2;
    ctx.globalAlpha = (1 - flashT) * 0.7;
    ctx.fillStyle = `rgba(80, 220, 60, ${1 - flashT * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.45 * scale, size * 0.4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(160, 60, 200, ${(1 - flashT) * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.25 * scale, size * 0.22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 (0.1–0.5): Melting drips downward
  if (t > 0.1 && t < 0.5) {
    const meltT = (t - 0.1) / 0.4;
    const dripCount = 5;
    for (let i = 0; i < dripCount; i++) {
      const xOff = (seededRandom(i * 31) - 0.5) * size * 0.6;
      const dripDelay = seededRandom(i * 47) * 0.3;
      if (meltT < dripDelay) continue;
      const localT = Math.min(1, (meltT - dripDelay) / (1 - dripDelay));
      const dx = cx + xOff;
      const dy = cy + localT * size * 0.4;
      const dripSize = size * 0.08 * (1 - localT * 0.5);

      ctx.globalAlpha = (1 - localT) * 0.6;
      ctx.fillStyle = i % 2 === 0 ? "#50dc3c" : "#8040cc";
      ctx.beginPath();
      ctx.ellipse(dx, dy, dripSize * 0.7, dripSize, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 3 (0.25–0.85): Bubbling pool at the base
  if (t > 0.25 && t < 0.85) {
    const poolT = (t - 0.25) / 0.6;
    const poolAppear = Math.min(1, poolT * 2.5);
    const poolFade = poolT > 0.6 ? (poolT - 0.6) / 0.4 : 0;
    const poolAlpha = poolAppear * (1 - poolFade) * 0.5;
    const poolW = size * 0.5;
    const poolH = size * 0.15;

    // Pool base
    ctx.globalAlpha = poolAlpha;
    ctx.fillStyle = "#30aa20";
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.18, poolW * poolAppear, poolH * poolAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bubbles
    const bubbleCount = 4;
    for (let i = 0; i < bubbleCount; i++) {
      const phase = seededRandom(i * 59);
      const bubbleCycle = ((poolT * 3 + phase) % 1);
      const bx = cx + (seededRandom(i * 71) - 0.5) * poolW * poolAppear;
      const by = cy + size * 0.18 - bubbleCycle * size * 0.15;
      const bubbleSize = zoom * (1.5 + seededRandom(i * 73)) * (1 - bubbleCycle);

      ctx.globalAlpha = poolAlpha * (1 - bubbleCycle) * 0.7;
      ctx.strokeStyle = "#60ee40";
      ctx.lineWidth = zoom * 0.8;
      ctx.beginPath();
      ctx.arc(bx, by, bubbleSize, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Phase 4 (0.3–0.9): Green vapor rising upward
  if (t > 0.3 && t < 0.9) {
    const vaporT = (t - 0.3) / 0.6;
    const vaporCount = 5;
    for (let i = 0; i < vaporCount; i++) {
      const startT = seededRandom(i * 61) * 0.3;
      if (vaporT < startT) continue;
      const localT = Math.min(1, (vaporT - startT) / (1 - startT));
      const xDrift = (seededRandom(i * 67) - 0.5) * size * 0.5;
      const vx = cx + xDrift + (seededRandom(i * 83) - 0.5) * size * 0.2 * localT;
      const vy = cy + size * 0.1 - localT * size * 1.0;
      const vaporSize = size * 0.15 * (0.5 + localT * 0.5) * (1 - localT * 0.3);

      ctx.globalAlpha = (1 - localT) * 0.25;
      ctx.fillStyle = `rgba(80, 200, 60, ${(1 - localT) * 0.25})`;
      ctx.beginPath();
      ctx.arc(vx, vy, vaporSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Default Death (existing animation preserved)
// White flash -> shatter fragments -> dissolve ring -> smoke puff
// ---------------------------------------------------------------------------
export function renderDefaultDeath({
  ctx,
  screenPos,
  zoom,
  progress: t,
  effect,
}: DeathAnimationParams): void {
  const deathSize = (effect.enemySize || effect.size || 20) * zoom;
  const deathColor = effect.color || "#ff4444";

  // Phase 1 (0-0.3): Flash white and scale up
  if (t < 0.3) {
    const flashT = t / 0.3;
    const scale = 1 + flashT * 0.4;
    const flashAlpha = 1 - flashT * 0.5;
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - flashT * 0.7})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x, screenPos.y,
      deathSize * 0.5 * scale, deathSize * 0.4 * scale,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = deathColor;
    ctx.globalAlpha = flashAlpha * 0.6;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x, screenPos.y,
      deathSize * 0.4 * scale, deathSize * 0.3 * scale,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }

  // Phase 2 (0.15-0.8): Shatter fragments fly outward
  const fragCount = 8;
  if (t > 0.1 && t < 0.9) {
    const fragT = (t - 0.1) / 0.8;
    for (let i = 0; i < fragCount; i++) {
      const angle = (i / fragCount) * Math.PI * 2 + i * 0.7;
      const dist = fragT * deathSize * 1.8;
      const fragX = screenPos.x + Math.cos(angle) * dist;
      const fragY = screenPos.y + Math.sin(angle) * dist - fragT * deathSize * 0.5;
      const fragSize = deathSize * 0.15 * (1 - fragT);
      const fragAlpha = (1 - fragT) * 0.8;
      ctx.globalAlpha = fragAlpha;
      ctx.fillStyle = i % 2 === 0 ? deathColor : "#ffffff";
      ctx.fillRect(fragX - fragSize / 2, fragY - fragSize / 2, fragSize, fragSize);
    }
  }

  // Phase 3 (0.2-1.0): Dissolve ring expanding outward
  if (t > 0.15) {
    const ringT = (t - 0.15) / 0.85;
    const ringRadius = ringT * deathSize * 1.2;
    const ringAlpha = (1 - ringT) * 0.4;
    ctx.globalAlpha = ringAlpha;
    ctx.strokeStyle = deathColor;
    ctx.lineWidth = (1 - ringT) * 3 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Smoke puff at center fading out
  if (t > 0.2 && t < 1) {
    const smokeT = (t - 0.2) / 0.8;
    const smokeAlpha = (1 - smokeT) * 0.3;
    const smokeSize = deathSize * 0.3 * (1 + smokeT * 2);
    ctx.globalAlpha = smokeAlpha;
    ctx.fillStyle = `rgba(80, 80, 80, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y - smokeT * deathSize * 0.3, smokeSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Dispatcher - routes to the correct death animation based on deathCause
// ---------------------------------------------------------------------------
export function renderEnemyDeath(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  zoom: number,
  progress: number,
  effect: Effect,
): void {
  const params: DeathAnimationParams = { ctx, screenPos, zoom, progress, effect };

  switch (effect.deathCause) {
    case "lightning":
      renderLightningDeath(params);
      break;
    case "fire":
      renderFireDeath(params);
      break;
    case "freeze":
      renderFreezeDeath(params);
      break;
    case "sonic":
      renderSonicDeath(params);
      break;
    case "poison":
      renderPoisonDeath(params);
      break;
    default:
      renderDefaultDeath(params);
      break;
  }
}
