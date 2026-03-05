import type { Effect, Position } from "../../types";
import { ISO_Y_RATIO } from "../../constants";

interface DeathAnimationParams {
  ctx: CanvasRenderingContext2D;
  screenPos: Position;
  zoom: number;
  progress: number;
  effect: Effect;
}

function getDeathSize(effect: Effect, zoom: number): number {
  return Math.max(14, (effect.enemySize || effect.size || 18) * 0.6) * zoom;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) * (1 - t) * (1 - t);
}

function easeInQuad(t: number): number {
  return t * t;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

// ---------------------------------------------------------------------------
// Lightning / Dust Death
// Violent electric flash -> body disintegrates with sparks -> dust pile settles
// Duration: 1800ms
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
  const groundY = cy + size * 0.25;

  // Phase 1 (0–0.08): Electric flash
  if (t < 0.08) {
    const flashT = t / 0.08;
    const scale = 0.4 + easeOutCubic(flashT) * 0.8;
    const flashAlpha = 1 - easeInQuad(flashT) * 0.4;

    // Outer electric glow
    ctx.globalAlpha = flashAlpha * 0.4;
    ctx.fillStyle = "#4488ff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.7 * scale, size * 0.55 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mid ring
    ctx.globalAlpha = flashAlpha * 0.6;
    ctx.fillStyle = "#88ccff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.45 * scale, size * 0.35 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // White-hot core
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.2 * scale, size * 0.15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 (0.04–0.22): Body disintegrates - silhouette breaks apart vertically
  if (t > 0.04 && t < 0.22) {
    const collapseT = easeInQuad((t - 0.04) / 0.18);
    const bodyH = size * 0.7 * (1 - collapseT);
    const bodyW = size * 0.35 * (1 + collapseT * 0.8);

    // Darkened silhouette crumbling into the ground
    ctx.globalAlpha = (1 - collapseT) * 0.65;
    ctx.fillStyle = "#3a4466";
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.25 * collapseT, bodyW, Math.max(2, bodyH), 0, 0, Math.PI * 2);
    ctx.fill();

    // Electric outline on body as it breaks
    ctx.globalAlpha = (1 - collapseT) * 0.6;
    ctx.strokeStyle = "#66aaff";
    ctx.lineWidth = Math.max(1, 2 * zoom * (1 - collapseT));
    ctx.stroke();
  }

  // Phase 3 (0.03–0.28): Electric arcs & spark shower radiating outward
  if (t > 0.03 && t < 0.28) {
    const arcT = easeOutCubic((t - 0.03) / 0.25);
    const arcCount = 10;
    for (let i = 0; i < arcCount; i++) {
      const angle = (i / arcCount) * Math.PI * 2 + seededRandom(i * 7) * 0.6;
      const dist = arcT * size * (1.2 + seededRandom(i * 11) * 0.8);
      const ax = cx + Math.cos(angle) * dist;
      const ay = cy + Math.sin(angle) * dist * ISO_Y_RATIO - arcT * size * 0.15;

      // Jagged lightning bolt segments
      ctx.globalAlpha = (1 - arcT) * 0.9;
      ctx.strokeStyle = i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#88ccff" : "#5599ff";
      ctx.lineWidth = Math.max(0.5, (1 - arcT) * 2.5 * zoom);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * size * 0.2, cy + Math.sin(angle) * size * 0.1);
      const mid1x = cx + Math.cos(angle + 0.3) * dist * 0.5 + seededRandom(i * 13) * size * 0.15;
      const mid1y = cy + Math.sin(angle + 0.3) * dist * 0.25 - size * 0.1;
      ctx.lineTo(mid1x, mid1y);
      ctx.lineTo(ax, ay);
      ctx.stroke();

      // Bright dot at the tip
      ctx.globalAlpha = (1 - arcT) * 0.95;
      ctx.fillStyle = "#ffffff";
      const dotSize = zoom * (1.5 + seededRandom(i * 17) * 1.5) * (1 - arcT);
      ctx.beginPath();
      ctx.arc(ax, ay, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 4 (0.06–0.25): Disintegration particles flying up and out
  if (t > 0.06 && t < 0.25) {
    const partT = (t - 0.06) / 0.19;
    const partCount = 14;
    for (let i = 0; i < partCount; i++) {
      const angle = seededRandom(i * 23) * Math.PI * 2;
      const speed = 0.5 + seededRandom(i * 29) * 0.8;
      const dist = easeOutQuad(partT) * size * speed * 1.5;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist * 0.4 - partT * size * (0.3 + seededRandom(i * 37) * 0.5);
      const pSize = zoom * (1 + seededRandom(i * 41) * 2) * (1 - partT);

      ctx.globalAlpha = (1 - partT) * 0.8;
      ctx.fillStyle = i % 3 === 0 ? "#88bbdd" : i % 3 === 1 ? "#667799" : "#aaccee";
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 5 (0.1–0.35): Dust cloud billowing up from collapse point
  if (t > 0.1 && t < 0.35) {
    const dustT = (t - 0.1) / 0.25;
    for (let i = 0; i < 5; i++) {
      const delay = seededRandom(i * 51) * 0.15;
      if (dustT < delay) continue;
      const localT = Math.min(1, (dustT - delay) / (1 - delay));
      const driftX = (seededRandom(i * 57) - 0.5) * size * 0.6;
      const cloudX = cx + driftX * easeOutQuad(localT);
      const cloudY = groundY - localT * size * 0.6;
      const cloudSize = size * (0.25 + i * 0.08) * (0.3 + easeOutQuad(localT) * 0.7);

      ctx.globalAlpha = (1 - easeInQuad(localT)) * 0.3;
      ctx.fillStyle = "#9a8a7a";
      ctx.beginPath();
      ctx.ellipse(cloudX, cloudY, cloudSize, cloudSize * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 6 (0.15–1.0): Dust pile on the ground - appears, sits, then fades
  if (t > 0.15) {
    const pileT = (t - 0.15) / 0.85;
    const pileAppear = Math.min(1, easeOutCubic(pileT * 4));
    const pileFade = pileT > 0.6 ? easeInQuad((pileT - 0.6) / 0.4) : 0;
    const pileAlpha = pileAppear * (1 - pileFade);
    const pileW = size * 1.1;
    const pileH = size * 0.35;

    // Soft shadow beneath
    ctx.globalAlpha = pileAlpha * 0.3;
    ctx.fillStyle = "#2a2015";
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 3 * zoom, pileW * 1.2 * pileAppear, pileH * 1.15 * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main pile base - warm grey-brown
    ctx.globalAlpha = pileAlpha * 0.85;
    ctx.fillStyle = "#7a6e5e";
    ctx.beginPath();
    ctx.ellipse(cx, groundY, pileW * pileAppear, pileH * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Raised center mound
    ctx.globalAlpha = pileAlpha * 0.9;
    ctx.fillStyle = "#908070";
    ctx.beginPath();
    ctx.ellipse(cx, groundY - pileH * 0.3 * pileAppear, pileW * 0.6 * pileAppear, pileH * 0.55 * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Light highlight on top
    ctx.globalAlpha = pileAlpha * 0.4;
    ctx.fillStyle = "#b0a090";
    ctx.beginPath();
    ctx.ellipse(cx - pileW * 0.08, groundY - pileH * 0.4 * pileAppear, pileW * 0.25 * pileAppear, pileH * 0.2 * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scattered debris chunks around pile
    for (let i = 0; i < 10; i++) {
      const angle = seededRandom(i * 47) * Math.PI * 2;
      const dist = pileW * (0.5 + seededRandom(i * 53) * 0.7) * pileAppear;
      const speckX = cx + Math.cos(angle) * dist;
      const speckY = groundY + Math.sin(angle) * dist * 0.3;
      const speckSize = zoom * (1.5 + seededRandom(i * 61) * 2);
      ctx.globalAlpha = pileAlpha * 0.55 * (1 - pileFade);
      ctx.fillStyle = i % 3 === 0 ? "#6a5c4a" : i % 3 === 1 ? "#847464" : "#5a4e3e";
      ctx.beginPath();
      ctx.arc(speckX, speckY, speckSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 7 (0.18–0.5): Residual electric sparks crackling over the pile
  if (t > 0.18 && t < 0.5) {
    const sparkT = (t - 0.18) / 0.32;
    for (let i = 0; i < 8; i++) {
      const phase = seededRandom(i * 13 + 5);
      const on = Math.sin((sparkT * 8 + phase * 6) * Math.PI) > 0.3;
      if (!on) continue;
      const twinkle = Math.abs(Math.sin((sparkT * 12 + phase * 4) * Math.PI));
      const angle = seededRandom(i * 19) * Math.PI * 2;
      const dist = size * (0.2 + seededRandom(i * 31) * 0.4);
      const sx = cx + Math.cos(angle) * dist;
      const sy = groundY - size * 0.05 + Math.sin(angle) * dist * 0.3;

      ctx.globalAlpha = twinkle * 0.9 * (1 - sparkT);
      ctx.fillStyle = "#88ccff";
      const sparkSize = zoom * (1.5 + seededRandom(i * 37) * 1.5);
      ctx.beginPath();
      ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
      ctx.fill();

      // Glow halo
      ctx.globalAlpha = twinkle * 0.25 * (1 - sparkT);
      ctx.fillStyle = "#4488ff";
      ctx.beginPath();
      ctx.arc(sx, sy, sparkSize * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Fire / Ash Death
// Fierce fireball flash -> body burns away with rising flames -> charred ash
// pile with glowing embers and rising smoke
// Duration: 2000ms
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
  const groundY = cy + size * 0.25;

  // Phase 1 (0–0.1): Fireball flash
  if (t < 0.1) {
    const flashT = t / 0.1;
    const scale = 0.4 + easeOutCubic(flashT) * 0.9;
    const flashAlpha = 1 - easeInQuad(flashT) * 0.3;

    // Outer heat distortion ring
    ctx.globalAlpha = flashAlpha * 0.3;
    ctx.fillStyle = "#ff2200";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.8 * scale, size * 0.65 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orange fire ring
    ctx.globalAlpha = flashAlpha * 0.55;
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.5 * scale, size * 0.4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yellow-white core
    ctx.globalAlpha = flashAlpha * 0.85;
    ctx.fillStyle = "#ffcc44";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.25 * scale, size * 0.2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // White-hot center
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.1 * scale, size * 0.08 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 (0.04–0.2): Body burns away - charring silhouette with fire outline
  if (t > 0.04 && t < 0.2) {
    const burnT = easeInQuad((t - 0.04) / 0.16);
    const bodyH = size * 0.7 * (1 - burnT);
    const bodyW = size * 0.35 * (1 + burnT * 0.5);

    // Charred body
    ctx.globalAlpha = (1 - burnT) * 0.55;
    ctx.fillStyle = "#1a0800";
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.2 * burnT, bodyW, Math.max(2, bodyH), 0, 0, Math.PI * 2);
    ctx.fill();

    // Fire consuming the edges
    ctx.globalAlpha = (1 - burnT) * 0.7;
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = Math.max(1, 3 * zoom * (1 - burnT));
    ctx.stroke();
  }

  // Phase 3 (0.05–0.3): Fire burst - flaming fragments scatter outward
  if (t > 0.05 && t < 0.3) {
    const burstT = easeOutCubic((t - 0.05) / 0.25);
    const fragCount = 16;
    for (let i = 0; i < fragCount; i++) {
      const angle = (i / fragCount) * Math.PI * 2 + seededRandom(i * 11) * 0.5;
      const speed = 0.6 + seededRandom(i * 19) * 0.7;
      const dist = burstT * size * speed * 1.6;
      const fx = cx + Math.cos(angle) * dist;
      const fy = cy + Math.sin(angle) * dist * 0.45 - burstT * size * 0.25;
      const fragSize = size * (0.06 + seededRandom(i * 23) * 0.08) * (1 - burstT * 0.7);

      ctx.globalAlpha = (1 - burstT) * 0.85;
      ctx.fillStyle = i % 4 === 0 ? "#ffcc00" : i % 4 === 1 ? "#ff8800" : i % 4 === 2 ? "#ff4400" : "#ff2200";
      ctx.beginPath();
      ctx.arc(fx, fy, fragSize, 0, Math.PI * 2);
      ctx.fill();

      // Tiny trail behind each fragment
      if (burstT > 0.1) {
        ctx.globalAlpha = (1 - burstT) * 0.3;
        const trailX = fx - Math.cos(angle) * fragSize * 3;
        const trailY = fy - Math.sin(angle) * fragSize * 1.5 + burstT * size * 0.08;
        ctx.beginPath();
        ctx.arc(trailX, trailY, fragSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Phase 4 (0.08–0.35): Tall flame tongues rising from the death point
  if (t > 0.08 && t < 0.35) {
    const flameT = (t - 0.08) / 0.27;
    const flameCount = 7;
    for (let i = 0; i < flameCount; i++) {
      const delay = seededRandom(i * 31) * 0.15;
      if (flameT < delay) continue;
      const localT = Math.min(1, (flameT - delay) / (1 - delay));
      const xOff = (seededRandom(i * 37) - 0.5) * size * 0.7;
      const flameX = cx + xOff;
      const flameH = size * (0.6 + seededRandom(i * 43) * 0.6) * (1 - easeInQuad(localT));
      const flameW = size * 0.12 * (1 - localT * 0.5);

      // Flame body (tall pointed ellipse)
      ctx.globalAlpha = (1 - localT) * 0.7;
      ctx.fillStyle = localT < 0.3 ? "#ffaa00" : localT < 0.6 ? "#ff6600" : "#cc3300";
      ctx.beginPath();
      ctx.ellipse(flameX, groundY - flameH * 0.5, flameW, flameH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bright inner core
      ctx.globalAlpha = (1 - localT) * 0.5;
      ctx.fillStyle = "#ffdd66";
      ctx.beginPath();
      ctx.ellipse(flameX, groundY - flameH * 0.35, flameW * 0.4, flameH * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 5 (0.15–1.0): Charred ash pile with glowing embers
  if (t > 0.15) {
    const pileT = (t - 0.15) / 0.85;
    const pileAppear = Math.min(1, easeOutCubic(pileT * 4));
    const pileFade = pileT > 0.6 ? easeInQuad((pileT - 0.6) / 0.4) : 0;
    const pileAlpha = pileAppear * (1 - pileFade);
    const pileW = size * 1.05;
    const pileH = size * 0.32;

    // Shadow
    ctx.globalAlpha = pileAlpha * 0.25;
    ctx.fillStyle = "#0a0500";
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 3 * zoom, pileW * 1.2 * pileAppear, pileH * 1.15 * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark charcoal base
    ctx.globalAlpha = pileAlpha * 0.85;
    ctx.fillStyle = "#222222";
    ctx.beginPath();
    ctx.ellipse(cx, groundY, pileW * pileAppear, pileH * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lighter ash mound
    ctx.globalAlpha = pileAlpha * 0.7;
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.ellipse(cx, groundY - pileH * 0.25 * pileAppear, pileW * 0.55 * pileAppear, pileH * 0.45 * pileAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner ember glow - pulses and fades over time
    const glowIntensity = Math.max(0, 1 - pileT * 1.3);
    if (glowIntensity > 0) {
      const pulse = 0.7 + 0.3 * Math.sin(pileT * 15);
      ctx.globalAlpha = pileAlpha * glowIntensity * 0.65 * pulse;
      ctx.fillStyle = "#cc3300";
      ctx.beginPath();
      ctx.ellipse(cx, groundY - pileH * 0.08, pileW * 0.5 * pileAppear, pileH * 0.4 * pileAppear, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = pileAlpha * glowIntensity * 0.4 * pulse;
      ctx.fillStyle = "#ff7700";
      ctx.beginPath();
      ctx.ellipse(cx, groundY - pileH * 0.1, pileW * 0.3 * pileAppear, pileH * 0.25 * pileAppear, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Individual ember dots
    for (let i = 0; i < 9; i++) {
      const emberGlow = Math.max(0, glowIntensity + seededRandom(i * 71) * 0.2);
      if (emberGlow <= 0) continue;
      const flicker = 0.5 + 0.5 * Math.sin(pileT * 20 + seededRandom(i * 77) * 10);
      const ex = cx + (seededRandom(i * 79) - 0.5) * pileW * 0.75 * pileAppear;
      const ey = groundY + (seededRandom(i * 83) - 0.5) * pileH * 0.5 * pileAppear;
      const eSize = zoom * (1.5 + seededRandom(i * 89) * 2);

      ctx.globalAlpha = pileAlpha * emberGlow * flicker * 0.9;
      ctx.fillStyle = "#ff8800";
      ctx.beginPath();
      ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
      ctx.fill();

      // Ember glow halo
      ctx.globalAlpha = pileAlpha * emberGlow * flicker * 0.2;
      ctx.fillStyle = "#ff4400";
      ctx.beginPath();
      ctx.arc(ex, ey, eSize * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 6 (0.12–0.65): Floating embers rising from the pyre
  if (t > 0.12 && t < 0.65) {
    const emberT = (t - 0.12) / 0.53;
    const emberCount = 12;
    for (let i = 0; i < emberCount; i++) {
      const startT = seededRandom(i * 17 + 3) * 0.3;
      if (emberT < startT) continue;
      const localT = Math.min(1, (emberT - startT) / (1 - startT));

      const xSpread = (seededRandom(i * 23) - 0.5) * size * 0.8;
      const drift = (seededRandom(i * 37) - 0.5) * size * 0.5 * localT;
      const sway = Math.sin(localT * Math.PI * 3 + seededRandom(i * 41) * 6) * size * 0.08;
      const ex = cx + xSpread * (0.2 + localT * 0.8) + drift + sway;
      const ey = groundY - localT * size * 2.0;
      const emberSize = zoom * (1 + seededRandom(i * 43) * 2) * (1 - localT * 0.4);

      ctx.globalAlpha = (1 - easeInQuad(localT)) * 0.85;
      ctx.fillStyle = localT < 0.25 ? "#ffdd44" : localT < 0.5 ? "#ff8800" : "#cc3300";
      ctx.beginPath();
      ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
      ctx.fill();

      // Subtle glow trail
      ctx.globalAlpha = (1 - easeInQuad(localT)) * 0.2;
      ctx.beginPath();
      ctx.arc(ex, ey, emberSize * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 7 (0.15–0.55): Dark smoke wisps rising
  if (t > 0.15 && t < 0.55) {
    const smokeT = (t - 0.15) / 0.4;
    for (let i = 0; i < 4; i++) {
      const delay = seededRandom(i * 97) * 0.15;
      if (smokeT < delay) continue;
      const localT = Math.min(1, (smokeT - delay) / (1 - delay));
      const smokeSize = size * (0.2 + i * 0.1) * (0.5 + easeOutQuad(localT) * 1.0);
      const sx = cx + (seededRandom(i * 101) - 0.5) * size * 0.4;
      const sway = Math.sin(localT * Math.PI * 2 + i) * size * 0.1;

      ctx.globalAlpha = (1 - easeInQuad(localT)) * 0.25;
      ctx.fillStyle = "#444444";
      ctx.beginPath();
      ctx.ellipse(sx + sway, groundY - localT * size * 1.5, smokeSize, smokeSize * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Freeze / Shatter Death
// Flash-freeze -> crystalline body shatters into ice shards + sparkles
// Duration: 800ms
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
    const scale = 0.4 + easeOutCubic(flashT) * 0.7;

    ctx.globalAlpha = (1 - flashT * 0.3) * 0.5;
    ctx.fillStyle = "#88ccff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.6 * scale, size * 0.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = (1 - flashT * 0.3) * 0.8;
    ctx.fillStyle = "#ccf0ff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.3 * scale, size * 0.25 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = (1 - flashT * 0.3);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.1 * scale, size * 0.08 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 (0.08–0.75): Angular ice shards fly outward with rotation
  if (t > 0.08 && t < 0.75) {
    const shardT = easeOutCubic((t - 0.08) / 0.67);
    const shardCount = 14;
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2 + seededRandom(i * 11) * 0.4;
      const speed = 0.8 + seededRandom(i * 7) * 0.6;
      const dist = shardT * size * speed * 1.5;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist * ISO_Y_RATIO + shardT * size * 0.15;

      const shardW = size * (0.06 + seededRandom(i * 29) * 0.08) * (1 - shardT * 0.5);
      const shardH = shardW * (1.8 + seededRandom(i * 43) * 2.5);

      ctx.globalAlpha = (1 - shardT) * 0.85;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle + shardT * (seededRandom(i * 53) - 0.5) * 4);

      // Shard body
      ctx.fillStyle = i % 3 === 0 ? "#a0e0ff" : i % 3 === 1 ? "#d8f4ff" : "#80c8ee";
      ctx.beginPath();
      ctx.moveTo(0, -shardH * 0.5);
      ctx.lineTo(shardW * 0.5, 0);
      ctx.lineTo(0, shardH * 0.5);
      ctx.lineTo(-shardW * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      // Glint highlight
      ctx.globalAlpha = (1 - shardT) * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -shardH * 0.3);
      ctx.lineTo(shardW * 0.2, -shardH * 0.05);
      ctx.lineTo(0, shardH * 0.1);
      ctx.lineTo(-shardW * 0.2, -shardH * 0.05);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  // Phase 3 (0.05–0.55): Crystalline sparkles twinkling
  if (t > 0.05 && t < 0.55) {
    const sparkleT = (t - 0.05) / 0.5;
    const sparkleCount = 10;
    for (let i = 0; i < sparkleCount; i++) {
      const phase = seededRandom(i * 67);
      const on = Math.sin((sparkleT * 6 + phase * 8) * Math.PI) > 0.2;
      if (!on) continue;
      const twinkle = Math.abs(Math.sin((sparkleT * 10 + phase * 5) * Math.PI));
      const angle = seededRandom(i * 79) * Math.PI * 2;
      const dist = size * (0.3 + seededRandom(i * 83) * 1.0) * easeOutQuad(sparkleT);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist * ISO_Y_RATIO;
      const starSize = zoom * (2 + seededRandom(i * 89) * 2.5) * (1 - sparkleT * 0.5);

      ctx.globalAlpha = twinkle * 0.95 * (1 - sparkleT);
      ctx.fillStyle = "#ffffff";
      // 4-point star
      ctx.beginPath();
      ctx.moveTo(sx, sy - starSize);
      ctx.lineTo(sx + starSize * 0.25, sy);
      ctx.lineTo(sx, sy + starSize);
      ctx.lineTo(sx - starSize * 0.25, sy);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx - starSize, sy);
      ctx.lineTo(sx, sy + starSize * 0.25);
      ctx.lineTo(sx + starSize, sy);
      ctx.lineTo(sx, sy - starSize * 0.25);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Phase 4 (0.3–0.85): Frost mist on the ground
  if (t > 0.3 && t < 0.85) {
    const mistT = (t - 0.3) / 0.55;
    const mistAlpha = (1 - easeInQuad(mistT)) * 0.3;
    const mistW = size * 0.9 * (0.5 + easeOutQuad(mistT) * 0.5);
    const mistH = mistW * 0.3;
    ctx.globalAlpha = mistAlpha;
    ctx.fillStyle = "#b0e8ff";
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.2, mistW, mistH, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Sonic / Ripple Death
// Violent vibration -> shockwave rings blast outward + debris scatter
// Duration: 650ms
// ---------------------------------------------------------------------------
export function renderSonicDeath({
  ctx,
  screenPos,
  zoom,
  progress: t,
  effect,
}: DeathAnimationParams): void {
  const size = getDeathSize(effect, zoom);
  const deathColor = effect.color || "#ff4444";
  const cx = screenPos.x;
  const cy = screenPos.y;

  // Phase 1 (0–0.1): Vibration with afterimages
  if (t < 0.1) {
    const vibT = t / 0.1;
    const vibAmp = size * 0.08 * (1 - vibT);
    for (let i = 0; i < 4; i++) {
      const offset = Math.sin(i * Math.PI * 2 / 4 + vibT * 50) * vibAmp;
      ctx.globalAlpha = (1 - vibT) * (0.4 - i * 0.08);
      ctx.fillStyle = deathColor;
      ctx.beginPath();
      ctx.ellipse(cx + offset, cy, size * 0.2, size * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 2 (0.04–0.25): Purple central burst
  if (t > 0.04 && t < 0.25) {
    const burstT = easeOutCubic((t - 0.04) / 0.21);
    const burstSize = size * 0.3 * (0.4 + burstT * 0.6);
    ctx.globalAlpha = (1 - burstT) * 0.55;
    ctx.fillStyle = "#cc88ff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, burstSize, burstSize * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = (1 - burstT) * 0.3;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, burstSize * 0.4, burstSize * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 3 (0.06–0.85): Concentric shockwave rings
  if (t > 0.06) {
    const ringCount = 5;
    for (let i = 0; i < ringCount; i++) {
      const ringDelay = i * 0.06;
      const ringEnd = 0.06 + ringDelay + 0.55;
      if (t < 0.06 + ringDelay || t > ringEnd) continue;
      const ringT = easeOutCubic((t - 0.06 - ringDelay) / 0.55);
      const ringRadius = ringT * size * (1.5 + i * 0.4);
      const ringAlpha = (1 - ringT) * (0.55 - i * 0.08);

      ctx.globalAlpha = Math.max(0, ringAlpha);
      ctx.strokeStyle = i === 0 ? "#eeccff" : i === 1 ? "#cc99ee" : i === 2 ? "#aa77dd" : "#9966cc";
      ctx.lineWidth = Math.max(0.5, (1 - ringT) * (3 - i * 0.4) * zoom);
      ctx.beginPath();
      ctx.ellipse(cx, cy, ringRadius, ringRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Phase 4 (0.08–0.55): Debris particles blasted outward
  if (t > 0.08 && t < 0.55) {
    const debrisT = easeOutCubic((t - 0.08) / 0.47);
    const debrisCount = 12;
    for (let i = 0; i < debrisCount; i++) {
      const angle = (i / debrisCount) * Math.PI * 2 + seededRandom(i * 17) * 0.7;
      const speed = 0.7 + seededRandom(i * 23) * 0.6;
      const dist = debrisT * size * speed * 2.0;
      const dx = cx + Math.cos(angle) * dist;
      const dy = cy + Math.sin(angle) * dist * 0.45;
      const debrisSize = size * 0.06 * (1 - debrisT * 0.6);

      ctx.globalAlpha = (1 - debrisT) * 0.75;
      ctx.fillStyle = i % 2 === 0 ? deathColor : "#bbbbbb";
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(debrisT * (seededRandom(i * 29) - 0.5) * 6);
      ctx.fillRect(-debrisSize, -debrisSize, debrisSize * 2, debrisSize * 2);
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------------------
// Poison / Dissolve Death
// Green toxic flash -> melting body drips into bubbling pool -> toxic vapor
// Duration: 1200ms
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
  const groundY = cy + size * 0.25;

  // Phase 1 (0–0.12): Green toxic flash
  if (t < 0.12) {
    const flashT = t / 0.12;
    const scale = 0.4 + easeOutCubic(flashT) * 0.6;

    ctx.globalAlpha = (1 - flashT * 0.3) * 0.45;
    ctx.fillStyle = "#22aa00";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.6 * scale, size * 0.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = (1 - flashT * 0.3) * 0.65;
    ctx.fillStyle = "#55ee33";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.3 * scale, size * 0.25 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = (1 - flashT * 0.3) * 0.35;
    ctx.fillStyle = "#aa55dd";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.15 * scale, size * 0.12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 (0.06–0.35): Body melts - dripping downward
  if (t > 0.06 && t < 0.35) {
    const meltT = easeInQuad((t - 0.06) / 0.29);
    const dripCount = 8;
    for (let i = 0; i < dripCount; i++) {
      const xOff = (seededRandom(i * 31) - 0.5) * size * 0.8;
      const dripDelay = seededRandom(i * 47) * 0.2;
      if (meltT < dripDelay) continue;
      const localT = Math.min(1, (meltT - dripDelay) / (1 - dripDelay));

      const dx = cx + xOff * (1 - localT * 0.3);
      const dy = cy + easeInQuad(localT) * size * 0.6;
      const dripW = size * 0.06 * (1 - localT * 0.3);
      const dripH = size * 0.12 * (0.5 + localT * 0.5);

      ctx.globalAlpha = (1 - localT) * 0.7;
      ctx.fillStyle = i % 3 === 0 ? "#44cc22" : i % 3 === 1 ? "#7733aa" : "#33bb11";
      ctx.beginPath();
      ctx.ellipse(dx, dy, dripW, dripH, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Phase 3 (0.2–0.85): Bubbling toxic pool
  if (t > 0.2 && t < 0.85) {
    const poolT = (t - 0.2) / 0.65;
    const poolAppear = Math.min(1, easeOutCubic(poolT * 3));
    const poolFade = poolT > 0.6 ? easeInQuad((poolT - 0.6) / 0.4) : 0;
    const poolAlpha = poolAppear * (1 - poolFade) * 0.65;
    const poolW = size * 0.8;
    const poolH = size * 0.25;

    // Outer pool
    ctx.globalAlpha = poolAlpha;
    ctx.fillStyle = "#28aa18";
    ctx.beginPath();
    ctx.ellipse(cx, groundY, poolW * poolAppear, poolH * poolAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Darker center
    ctx.globalAlpha = poolAlpha * 0.6;
    ctx.fillStyle = "#1a7710";
    ctx.beginPath();
    ctx.ellipse(cx, groundY, poolW * 0.5 * poolAppear, poolH * 0.5 * poolAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Purple sheen
    ctx.globalAlpha = poolAlpha * 0.25;
    ctx.fillStyle = "#8844cc";
    ctx.beginPath();
    ctx.ellipse(cx - poolW * 0.15, groundY - poolH * 0.1, poolW * 0.3 * poolAppear, poolH * 0.35 * poolAppear, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated bubbles
    for (let i = 0; i < 7; i++) {
      const phase = seededRandom(i * 59);
      const bubbleCycle = ((poolT * 5 + phase) % 1);
      const bx = cx + (seededRandom(i * 71) - 0.5) * poolW * 0.8 * poolAppear;
      const by = groundY - bubbleCycle * size * 0.25;
      const bubbleSize = zoom * (2 + seededRandom(i * 73) * 2) * (1 - bubbleCycle);

      ctx.globalAlpha = poolAlpha * (1 - bubbleCycle) * 0.7;
      ctx.strokeStyle = "#66ff44";
      ctx.lineWidth = zoom * 0.8;
      ctx.beginPath();
      ctx.arc(bx, by, bubbleSize, 0, Math.PI * 2);
      ctx.stroke();

      // Pop highlight
      if (bubbleCycle > 0.85) {
        ctx.globalAlpha = poolAlpha * (1 - (bubbleCycle - 0.85) / 0.15) * 0.6;
        ctx.fillStyle = "#88ff66";
        ctx.beginPath();
        ctx.arc(bx, by, bubbleSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Phase 4 (0.25–0.8): Toxic vapor wisps rising
  if (t > 0.25 && t < 0.8) {
    const vaporT = (t - 0.25) / 0.55;
    const vaporCount = 8;
    for (let i = 0; i < vaporCount; i++) {
      const startT = seededRandom(i * 61) * 0.3;
      if (vaporT < startT) continue;
      const localT = Math.min(1, (vaporT - startT) / (1 - startT));
      const xDrift = (seededRandom(i * 67) - 0.5) * size * 0.6;
      const sway = Math.sin(localT * Math.PI * 2.5 + i * 2) * size * 0.1;
      const vx = cx + xDrift + sway;
      const vy = groundY - localT * size * 1.5;
      const vaporSize = size * 0.15 * (0.3 + easeOutQuad(localT) * 0.7) * (1 - localT * 0.3);

      ctx.globalAlpha = (1 - easeInQuad(localT)) * 0.3;
      ctx.fillStyle = i % 2 === 0 ? "#44cc22" : "#7744aa";
      ctx.beginPath();
      ctx.arc(vx, vy, vaporSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Default Death
// Quick white flash -> colored fragments scatter -> expanding ring -> smoke
// Duration: 600ms
// ---------------------------------------------------------------------------
export function renderDefaultDeath({
  ctx,
  screenPos,
  zoom,
  progress: t,
  effect,
}: DeathAnimationParams): void {
  const deathSize = Math.max(14, (effect.enemySize || effect.size || 18) * 0.6) * zoom;
  const deathColor = effect.color || "#ff4444";
  const cx = screenPos.x;
  const cy = screenPos.y;

  // Phase 1 (0–0.25): White flash burst
  if (t < 0.25) {
    const flashT = t / 0.25;
    const scale = 0.3 + easeOutCubic(flashT) * 0.6;
    const flashAlpha = 1 - easeInQuad(flashT) * 0.6;

    ctx.globalAlpha = flashAlpha * 0.4;
    ctx.fillStyle = deathColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, deathSize * 0.35 * scale, deathSize * 0.28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = flashAlpha * 0.8;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, deathSize * 0.18 * scale, deathSize * 0.14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 (0.1–0.85): Fragment scatter
  if (t > 0.1 && t < 0.85) {
    const fragT = easeOutCubic((t - 0.1) / 0.75);
    const fragCount = 10;
    for (let i = 0; i < fragCount; i++) {
      const angle = (i / fragCount) * Math.PI * 2 + seededRandom(i * 7) * 0.5;
      const speed = 0.6 + seededRandom(i * 13) * 0.6;
      const dist = fragT * deathSize * speed * 1.8;
      const fragX = cx + Math.cos(angle) * dist;
      const fragY = cy + Math.sin(angle) * dist * ISO_Y_RATIO - fragT * deathSize * 0.3;
      const fragSize = deathSize * 0.1 * (1 - fragT * 0.7);

      ctx.globalAlpha = (1 - fragT) * 0.8;
      ctx.fillStyle = i % 2 === 0 ? deathColor : "#ffffff";
      ctx.save();
      ctx.translate(fragX, fragY);
      ctx.rotate(fragT * (seededRandom(i * 19) - 0.5) * 4);
      ctx.fillRect(-fragSize * 0.5, -fragSize * 0.5, fragSize, fragSize);
      ctx.restore();
    }
  }

  // Phase 3 (0.15–0.9): Expanding dissolve ring
  if (t > 0.15 && t < 0.9) {
    const ringT = easeOutCubic((t - 0.15) / 0.75);
    const ringRadius = ringT * deathSize * 1.3;
    ctx.globalAlpha = (1 - ringT) * 0.4;
    ctx.strokeStyle = deathColor;
    ctx.lineWidth = Math.max(0.5, (1 - ringT) * 2.5 * zoom);
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Phase 4 (0.2–1.0): Smoke puff
  if (t > 0.2) {
    const smokeT = (t - 0.2) / 0.8;
    const smokeAlpha = (1 - easeInQuad(smokeT)) * 0.25;
    const smokeSize = deathSize * 0.3 * (0.5 + easeOutQuad(smokeT) * 2);
    ctx.globalAlpha = smokeAlpha;
    ctx.fillStyle = "#666666";
    ctx.beginPath();
    ctx.arc(cx, cy - smokeT * deathSize * 0.4, smokeSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Dispatcher
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
