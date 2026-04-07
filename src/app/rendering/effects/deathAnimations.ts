import type { Effect, Position } from "../../types";

// True isometric y-compression ratio (30° axes, tile ratio √3:1).
// Ground-plane circles project to ellipses with ry = rx * TRUE_ISO_Y_RATIO.
const TRUE_ISO_Y_RATIO = 1 / Math.sqrt(3); // ≈ 0.577

const MIN_ALPHA = 0.02;
const TAU = Math.PI * 2;

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
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43_758.5453;
  return x - Math.floor(x);
}

function easeOutCubic(t: number): number {
  const u = 1 - t;
  return 1 - u * u * u;
}

function easeInQuad(t: number): number {
  return t * t;
}

function easeOutQuad(t: number): number {
  const u = 1 - t;
  return 1 - u * u;
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
): void {
  if (r < 1.5) {
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  } else {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Shared dust pile renderer — used by lightning, sonic, and default deaths.
// ---------------------------------------------------------------------------
function renderDustPile(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  zoom: number,
  pileAlpha: number,
  pileFade: number,
  pileAppear: number,
  pileW: number,
  pileH: number,
  colors: readonly [string, string, string, string]
): void {
  if (pileAlpha < MIN_ALPHA) {
    return;
  }
  const pa = pileAppear;
  const [shadow, base, mid, highlight] = colors;

  ctx.globalAlpha = pileAlpha * 0.3;
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    groundY + 3 * zoom,
    pileW * 1.2 * pa,
    pileH * 1.15 * pa,
    0,
    0,
    TAU
  );
  ctx.fill();

  ctx.globalAlpha = pileAlpha * 0.85;
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(cx, groundY, pileW * pa, pileH * pa, 0, 0, TAU);
  ctx.fill();

  ctx.globalAlpha = pileAlpha * 0.9;
  ctx.fillStyle = mid;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    groundY - pileH * 0.3 * pa,
    pileW * 0.6 * pa,
    pileH * 0.55 * pa,
    0,
    0,
    TAU
  );
  ctx.fill();

  if (pileAlpha * 0.4 >= MIN_ALPHA) {
    ctx.globalAlpha = pileAlpha * 0.4;
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.ellipse(
      cx - pileW * 0.08,
      groundY - pileH * 0.4 * pa,
      pileW * 0.25 * pa,
      pileH * 0.2 * pa,
      0,
      0,
      TAU
    );
    ctx.fill();
  }

  const speckAlpha = pileAlpha * 0.55 * (1 - pileFade);
  if (speckAlpha >= MIN_ALPHA) {
    const speckColors = [shadow, base, mid];
    ctx.globalAlpha = speckAlpha;
    for (let i = 0; i < 6; i++) {
      const angle = seededRandom(i * 47) * TAU;
      const dist = pileW * (0.5 + seededRandom(i * 53) * 0.7) * pa;
      ctx.fillStyle = speckColors[i % 3];
      drawDot(
        ctx,
        cx + Math.cos(angle) * dist,
        groundY + Math.sin(angle) * dist * TRUE_ISO_Y_RATIO,
        zoom * (1.5 + seededRandom(i * 61) * 2)
      );
    }
  }
}

// Shared helper to compute standard pile timing from a phase start
function pileTimings(
  t: number,
  start: number
): { pileAlpha: number; pileFade: number; pileAppear: number } {
  const pileT = (t - start) / (1 - start);
  const pileAppear = Math.min(1, easeOutCubic(pileT * 4));
  const pileFade = pileT > 0.6 ? easeInQuad((pileT - 0.6) / 0.4) : 0;
  return { pileAlpha: pileAppear * (1 - pileFade), pileAppear, pileFade };
}

// Shared zap-style death used by both lightning (blue) and sonic (green)
function renderZapDeath(
  { ctx, screenPos, zoom, progress: t }: DeathAnimationParams,
  size: number,
  flashColors: readonly [string, string],
  bodyColor: string,
  outlineColor: string,
  arcColors: readonly [string, string],
  particleColors: readonly [string, string, string],
  sparkColor: string
): void {
  const cx = screenPos.x;
  const cy = screenPos.y;
  const groundY = cy + size * 0.25;

  // Phase 1 (0–0.08): Flash
  if (t < 0.08) {
    const flashT = t / 0.08;
    const scale = 0.4 + easeOutCubic(flashT) * 0.8;
    const flashAlpha = 1 - easeInQuad(flashT) * 0.4;

    ctx.globalAlpha = flashAlpha * 0.4;
    ctx.fillStyle = flashColors[0];
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.7 * scale, size * 0.55 * scale, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = flashAlpha * 0.6;
    ctx.fillStyle = flashColors[1];
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.45 * scale, size * 0.35 * scale, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.2 * scale, size * 0.15 * scale, 0, 0, TAU);
    ctx.fill();
  }

  // Phase 2 (0.04–0.22): Body disintegrates
  if (t > 0.04 && t < 0.22) {
    const collapseT = easeInQuad((t - 0.04) / 0.18);
    const bodyH = size * 0.7 * (1 - collapseT);
    const bodyW = size * 0.35 * (1 + collapseT * 0.8);
    const alpha = (1 - collapseT) * 0.65;

    if (alpha >= MIN_ALPHA) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy + size * 0.25 * collapseT,
        bodyW,
        Math.max(2, bodyH),
        0,
        0,
        TAU
      );
      ctx.fill();

      ctx.globalAlpha = (1 - collapseT) * 0.6;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = Math.max(1, 2 * zoom * (1 - collapseT));
      ctx.stroke();
    }
  }

  // Phase 3 (0.03–0.28): Arcs radiating outward
  if (t > 0.03 && t < 0.28) {
    const arcT = easeOutCubic((t - 0.03) / 0.25);
    const baseAlpha = (1 - arcT) * 0.9;
    if (baseAlpha >= MIN_ALPHA) {
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * TAU + seededRandom(i * 7) * 0.6;
        const dist = arcT * size * (1.2 + seededRandom(i * 11) * 0.8);
        const ax = cx + Math.cos(angle) * dist;
        const ay =
          cy + Math.sin(angle) * dist * TRUE_ISO_Y_RATIO - arcT * size * 0.15;

        ctx.globalAlpha = baseAlpha;
        ctx.strokeStyle = i % 2 === 0 ? "#ffffff" : arcColors[i % 2];
        ctx.lineWidth = Math.max(0.5, (1 - arcT) * 2.5 * zoom);
        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(angle) * size * 0.2,
          cy + Math.sin(angle) * size * 0.1
        );
        ctx.lineTo(
          cx +
            Math.cos(angle + 0.3) * dist * 0.5 +
            seededRandom(i * 13) * size * 0.15,
          cy + Math.sin(angle + 0.3) * dist * 0.25 - size * 0.1
        );
        ctx.lineTo(ax, ay);
        ctx.stroke();

        ctx.globalAlpha = (1 - arcT) * 0.95;
        ctx.fillStyle = "#ffffff";
        drawDot(
          ctx,
          ax,
          ay,
          zoom * (1.5 + seededRandom(i * 17) * 1.5) * (1 - arcT)
        );
      }
    }
  }

  // Phase 4 (0.06–0.25): Disintegration particles
  if (t > 0.06 && t < 0.25) {
    const partT = (t - 0.06) / 0.19;
    const baseAlpha = (1 - partT) * 0.8;
    if (baseAlpha >= MIN_ALPHA) {
      ctx.globalAlpha = baseAlpha;
      for (let i = 0; i < 8; i++) {
        const angle = seededRandom(i * 23) * TAU;
        const speed = 0.5 + seededRandom(i * 29) * 0.8;
        const dist = easeOutQuad(partT) * size * speed * 1.5;
        ctx.fillStyle = particleColors[i % 3];
        drawDot(
          ctx,
          cx + Math.cos(angle) * dist,
          cy +
            Math.sin(angle) * dist * TRUE_ISO_Y_RATIO -
            partT * size * (0.3 + seededRandom(i * 37) * 0.5),
          zoom * (1 + seededRandom(i * 41) * 2) * (1 - partT)
        );
      }
    }
  }

  // Phase 5 (0.1–0.35): Dust cloud
  if (t > 0.1 && t < 0.35) {
    const dustT = (t - 0.1) / 0.25;
    for (let i = 0; i < 4; i++) {
      const delay = seededRandom(i * 51) * 0.15;
      if (dustT < delay) {
        continue;
      }
      const localT = Math.min(1, (dustT - delay) / (1 - delay));
      const alpha = (1 - easeInQuad(localT)) * 0.3;
      if (alpha < MIN_ALPHA) {
        continue;
      }
      const cloudSize =
        size * (0.25 + i * 0.08) * (0.3 + easeOutQuad(localT) * 0.7);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#9a8a7a";
      ctx.beginPath();
      ctx.ellipse(
        cx + (seededRandom(i * 57) - 0.5) * size * 0.6 * easeOutQuad(localT),
        groundY - localT * size * 0.6,
        cloudSize,
        cloudSize * TRUE_ISO_Y_RATIO,
        0,
        0,
        TAU
      );
      ctx.fill();
    }
  }

  // Phase 6 (0.15–1.0): Dust pile
  if (t > 0.15) {
    const { pileAlpha, pileFade, pileAppear } = pileTimings(t, 0.15);
    const pileW = size * 1.1;
    renderDustPile(
      ctx,
      cx,
      groundY,
      zoom,
      pileAlpha,
      pileFade,
      pileAppear,
      pileW,
      pileW * TRUE_ISO_Y_RATIO,
      ["#2a2015", "#7a6e5e", "#908070", "#b0a090"]
    );
  }

  // Phase 7 (0.18–0.5): Residual sparks
  if (t > 0.18 && t < 0.5) {
    const sparkT = (t - 0.18) / 0.32;
    const fadeAlpha = 1 - sparkT;
    if (fadeAlpha >= MIN_ALPHA) {
      for (let i = 0; i < 5; i++) {
        const phase = seededRandom(i * 13 + 5);
        if (Math.sin((sparkT * 8 + phase * 6) * Math.PI) <= 0.3) {
          continue;
        }
        const twinkle = Math.abs(Math.sin((sparkT * 12 + phase * 4) * Math.PI));
        const alpha = twinkle * 0.9 * fadeAlpha;
        if (alpha < MIN_ALPHA) {
          continue;
        }
        const angle = seededRandom(i * 19) * TAU;
        const dist = size * (0.2 + seededRandom(i * 31) * 0.4);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = sparkColor;
        drawDot(
          ctx,
          cx + Math.cos(angle) * dist,
          groundY - size * 0.05 + Math.sin(angle) * dist * TRUE_ISO_Y_RATIO,
          zoom * (1.5 + seededRandom(i * 37) * 1.5)
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Lightning / Dust Death — Duration: 1800ms
// ---------------------------------------------------------------------------
export function renderLightningDeath(params: DeathAnimationParams): void {
  const size = getDeathSize(params.effect, params.zoom);
  renderZapDeath(
    params,
    size,
    ["#4488ff", "#88ccff"],
    "#3a4466",
    "#66aaff",
    ["#88ccff", "#5599ff"],
    ["#88bbdd", "#667799", "#aaccee"],
    "#88ccff"
  );
}

// ---------------------------------------------------------------------------
// Sonic / Shockwave Death — Duration: 1800ms
// ---------------------------------------------------------------------------
export function renderSonicDeath(params: DeathAnimationParams): void {
  const size = getDeathSize(params.effect, params.zoom);
  renderZapDeath(
    params,
    size,
    ["#44aa44", "#88ee88"],
    "#3a5a3a",
    "#66cc66",
    ["#88ee88", "#55cc55"],
    ["#88cc88", "#668866", "#aaddaa"],
    "#88ee88"
  );
}

// ---------------------------------------------------------------------------
// Fire / Ash Death — Duration: 2000ms
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

    ctx.globalAlpha = flashAlpha * 0.3;
    ctx.fillStyle = "#ff2200";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.8 * scale, size * 0.65 * scale, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = flashAlpha * 0.55;
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.5 * scale, size * 0.4 * scale, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = flashAlpha * 0.85;
    ctx.fillStyle = "#ffcc44";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.25 * scale, size * 0.2 * scale, 0, 0, TAU);
    ctx.fill();
  }

  // Phase 2 (0.04–0.2): Body burns away
  if (t > 0.04 && t < 0.2) {
    const burnT = easeInQuad((t - 0.04) / 0.16);
    const alpha = (1 - burnT) * 0.55;
    if (alpha >= MIN_ALPHA) {
      const bodyH = size * 0.7 * (1 - burnT);
      const bodyW = size * 0.35 * (1 + burnT * 0.5);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#1a0800";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy + size * 0.2 * burnT,
        bodyW,
        Math.max(2, bodyH),
        0,
        0,
        TAU
      );
      ctx.fill();
      ctx.globalAlpha = (1 - burnT) * 0.7;
      ctx.strokeStyle = "#ff6600";
      ctx.lineWidth = Math.max(1, 3 * zoom * (1 - burnT));
      ctx.stroke();
    }
  }

  // Phase 3 (0.05–0.3): Fire fragments scatter outward
  if (t > 0.05 && t < 0.3) {
    const burstT = easeOutCubic((t - 0.05) / 0.25);
    const baseAlpha = (1 - burstT) * 0.85;
    if (baseAlpha >= MIN_ALPHA) {
      const fireColors = ["#ffcc00", "#ff8800", "#ff4400", "#ff2200"];
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * TAU + seededRandom(i * 11) * 0.5;
        const speed = 0.6 + seededRandom(i * 19) * 0.7;
        const dist = burstT * size * speed * 1.6;
        ctx.globalAlpha = baseAlpha;
        ctx.fillStyle = fireColors[i % 4];
        drawDot(
          ctx,
          cx + Math.cos(angle) * dist,
          cy + Math.sin(angle) * dist * TRUE_ISO_Y_RATIO - burstT * size * 0.25,
          size * (0.06 + seededRandom(i * 23) * 0.08) * (1 - burstT * 0.7)
        );
      }
    }
  }

  // Phase 4 (0.08–0.35): Flame tongues rising
  if (t > 0.08 && t < 0.35) {
    const flameT = (t - 0.08) / 0.27;
    for (let i = 0; i < 5; i++) {
      const delay = seededRandom(i * 31) * 0.15;
      if (flameT < delay) {
        continue;
      }
      const localT = Math.min(1, (flameT - delay) / (1 - delay));
      const alpha = (1 - localT) * 0.7;
      if (alpha < MIN_ALPHA) {
        continue;
      }
      const flameH =
        size * (0.6 + seededRandom(i * 43) * 0.6) * (1 - easeInQuad(localT));
      const flameW = size * 0.12 * (1 - localT * 0.5);

      ctx.globalAlpha = alpha;
      ctx.fillStyle =
        localT < 0.3 ? "#ffaa00" : localT < 0.6 ? "#ff6600" : "#cc3300";
      ctx.beginPath();
      ctx.ellipse(
        cx + (seededRandom(i * 37) - 0.5) * size * 0.7,
        groundY - flameH * 0.5,
        flameW,
        flameH * 0.5,
        0,
        0,
        TAU
      );
      ctx.fill();
    }
  }

  // Phase 5 (0.15–1.0): Charred ash pile with embers
  if (t > 0.15) {
    const pileT = (t - 0.15) / 0.85;
    const pileAppear = Math.min(1, easeOutCubic(pileT * 4));
    const pileFade = pileT > 0.6 ? easeInQuad((pileT - 0.6) / 0.4) : 0;
    const pileAlpha = pileAppear * (1 - pileFade);
    const pileW = size * 1.05;
    const pileH = pileW * TRUE_ISO_Y_RATIO;
    const pa = pileAppear;

    if (pileAlpha >= MIN_ALPHA) {
      ctx.globalAlpha = pileAlpha * 0.25;
      ctx.fillStyle = "#0a0500";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        groundY + 3 * zoom,
        pileW * 1.2 * pa,
        pileH * 1.15 * pa,
        0,
        0,
        TAU
      );
      ctx.fill();

      ctx.globalAlpha = pileAlpha * 0.85;
      ctx.fillStyle = "#222222";
      ctx.beginPath();
      ctx.ellipse(cx, groundY, pileW * pa, pileH * pa, 0, 0, TAU);
      ctx.fill();

      ctx.globalAlpha = pileAlpha * 0.7;
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        groundY - pileH * 0.25 * pa,
        pileW * 0.55 * pa,
        pileH * 0.45 * pa,
        0,
        0,
        TAU
      );
      ctx.fill();

      const glowIntensity = Math.max(0, 1 - pileT * 1.3);
      if (glowIntensity > 0) {
        const pulse = 0.7 + 0.3 * Math.sin(pileT * 15);
        const ga = pileAlpha * glowIntensity * pulse;
        if (ga * 0.65 >= MIN_ALPHA) {
          ctx.globalAlpha = ga * 0.65;
          ctx.fillStyle = "#cc3300";
          ctx.beginPath();
          ctx.ellipse(
            cx,
            groundY - pileH * 0.08,
            pileW * 0.5 * pa,
            pileH * 0.4 * pa,
            0,
            0,
            TAU
          );
          ctx.fill();
        }
      }

      // Ember dots (reduced from 9)
      const glowI = Math.max(0, 1 - pileT * 1.3);
      for (let i = 0; i < 5; i++) {
        const emberGlow = Math.max(0, glowI + seededRandom(i * 71) * 0.2);
        if (emberGlow <= 0) {
          continue;
        }
        const flicker =
          0.5 + 0.5 * Math.sin(pileT * 20 + seededRandom(i * 77) * 10);
        const alpha = pileAlpha * emberGlow * flicker * 0.9;
        if (alpha < MIN_ALPHA) {
          continue;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ff8800";
        drawDot(
          ctx,
          cx + (seededRandom(i * 79) - 0.5) * pileW * 0.75 * pa,
          groundY + (seededRandom(i * 83) - 0.5) * pileH * 0.5 * pa,
          zoom * (1.5 + seededRandom(i * 89) * 2)
        );
      }
    }
  }

  // Phase 6 (0.12–0.65): Floating embers rising
  if (t > 0.12 && t < 0.65) {
    const emberT = (t - 0.12) / 0.53;
    for (let i = 0; i < 7; i++) {
      const startT = seededRandom(i * 17 + 3) * 0.3;
      if (emberT < startT) {
        continue;
      }
      const localT = Math.min(1, (emberT - startT) / (1 - startT));
      const alpha = (1 - easeInQuad(localT)) * 0.85;
      if (alpha < MIN_ALPHA) {
        continue;
      }

      const xSpread = (seededRandom(i * 23) - 0.5) * size * 0.8;
      const drift = (seededRandom(i * 37) - 0.5) * size * 0.5 * localT;
      const sway =
        Math.sin(localT * Math.PI * 3 + seededRandom(i * 41) * 6) * size * 0.08;

      ctx.globalAlpha = alpha;
      ctx.fillStyle =
        localT < 0.25 ? "#ffdd44" : localT < 0.5 ? "#ff8800" : "#cc3300";
      drawDot(
        ctx,
        cx + xSpread * (0.2 + localT * 0.8) + drift + sway,
        groundY - localT * size * 2,
        zoom * (1 + seededRandom(i * 43) * 2) * (1 - localT * 0.4)
      );
    }
  }

  // Phase 7 (0.15–0.55): Smoke wisps rising
  if (t > 0.15 && t < 0.55) {
    const smokeT = (t - 0.15) / 0.4;
    for (let i = 0; i < 3; i++) {
      const delay = seededRandom(i * 97) * 0.15;
      if (smokeT < delay) {
        continue;
      }
      const localT = Math.min(1, (smokeT - delay) / (1 - delay));
      const alpha = (1 - easeInQuad(localT)) * 0.25;
      if (alpha < MIN_ALPHA) {
        continue;
      }
      const smokeSize = size * (0.2 + i * 0.1) * (0.5 + easeOutQuad(localT));

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#444444";
      ctx.beginPath();
      ctx.ellipse(
        cx +
          (seededRandom(i * 101) - 0.5) * size * 0.4 +
          Math.sin(localT * TAU + i) * size * 0.1,
        groundY - localT * size * 1.5,
        smokeSize,
        smokeSize * TRUE_ISO_Y_RATIO,
        0,
        0,
        TAU
      );
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Freeze / Shatter Death — Duration: 800ms
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
    ctx.ellipse(cx, cy, size * 0.6 * scale, size * 0.5 * scale, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = (1 - flashT * 0.3) * 0.8;
    ctx.fillStyle = "#ccf0ff";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.3 * scale, size * 0.25 * scale, 0, 0, TAU);
    ctx.fill();
  }

  // Phase 2 (0.08–0.75): Ice shards fly outward — compute diamond verts directly
  if (t > 0.08 && t < 0.75) {
    const shardT = easeOutCubic((t - 0.08) / 0.67);
    const baseAlpha = (1 - shardT) * 0.85;
    if (baseAlpha >= MIN_ALPHA) {
      const shardColors = ["#a0e0ff", "#d8f4ff", "#80c8ee"];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * TAU + seededRandom(i * 11) * 0.4;
        const speed = 0.8 + seededRandom(i * 7) * 0.6;
        const dist = shardT * size * speed * 1.5;
        const sx = cx + Math.cos(angle) * dist;
        const sy =
          cy + Math.sin(angle) * dist * TRUE_ISO_Y_RATIO + shardT * size * 0.15;
        const shardW =
          size * (0.06 + seededRandom(i * 29) * 0.08) * (1 - shardT * 0.5);
        const shardH = shardW * (1.8 + seededRandom(i * 43) * 2.5);
        const rot = angle + shardT * (seededRandom(i * 53) - 0.5) * 4;
        const cosR = Math.cos(rot);
        const sinR = Math.sin(rot);
        const hw = shardW * 0.5;
        const hh = shardH * 0.5;

        ctx.globalAlpha = baseAlpha;
        ctx.fillStyle = shardColors[i % 3];
        ctx.beginPath();
        ctx.moveTo(sx - sinR * hh, sy + cosR * hh * -1);
        ctx.lineTo(sx + cosR * hw, sy + sinR * hw);
        ctx.lineTo(sx + sinR * hh, sy - cosR * hh * -1);
        ctx.lineTo(sx - cosR * hw, sy - sinR * hw);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // Phase 3 (0.05–0.55): Crystalline sparkles twinkling
  if (t > 0.05 && t < 0.55) {
    const sparkleT = (t - 0.05) / 0.5;
    for (let i = 0; i < 6; i++) {
      const phase = seededRandom(i * 67);
      if (Math.sin((sparkleT * 6 + phase * 8) * Math.PI) <= 0.2) {
        continue;
      }
      const twinkle = Math.abs(Math.sin((sparkleT * 10 + phase * 5) * Math.PI));
      const alpha = twinkle * 0.95 * (1 - sparkleT);
      if (alpha < MIN_ALPHA) {
        continue;
      }
      const angle = seededRandom(i * 79) * TAU;
      const dist =
        size * (0.3 + seededRandom(i * 83) * 1) * easeOutQuad(sparkleT);
      const starX = cx + Math.cos(angle) * dist;
      const starY = cy + Math.sin(angle) * dist * TRUE_ISO_Y_RATIO;
      const starSize =
        zoom * (2 + seededRandom(i * 89) * 2.5) * (1 - sparkleT * 0.5);
      const q = starSize * 0.25;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(starX, starY - starSize);
      ctx.lineTo(starX + q, starY);
      ctx.lineTo(starX, starY + starSize);
      ctx.lineTo(starX - q, starY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Phase 4 (0.3–0.85): Frost mist on ground
  if (t > 0.3 && t < 0.85) {
    const mistT = (t - 0.3) / 0.55;
    const mistAlpha = (1 - easeInQuad(mistT)) * 0.3;
    if (mistAlpha >= MIN_ALPHA) {
      const mistW = size * 0.9 * (0.5 + easeOutQuad(mistT) * 0.5);
      ctx.globalAlpha = mistAlpha;
      ctx.fillStyle = "#b0e8ff";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy + size * 0.2,
        mistW,
        mistW * TRUE_ISO_Y_RATIO,
        0,
        0,
        TAU
      );
      ctx.fill();
    }
  }
}

// ---------------------------------------------------------------------------
// Poison / Dissolve Death — Duration: 1200ms
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
    ctx.ellipse(cx, cy, size * 0.6 * scale, size * 0.5 * scale, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = (1 - flashT * 0.3) * 0.65;
    ctx.fillStyle = "#55ee33";
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.3 * scale, size * 0.25 * scale, 0, 0, TAU);
    ctx.fill();
  }

  // Phase 2 (0.06–0.35): Body melts
  if (t > 0.06 && t < 0.35) {
    const meltT = easeInQuad((t - 0.06) / 0.29);
    const dripColors = ["#44cc22", "#7733aa", "#33bb11"];
    for (let i = 0; i < 5; i++) {
      const dripDelay = seededRandom(i * 47) * 0.2;
      if (meltT < dripDelay) {
        continue;
      }
      const localT = Math.min(1, (meltT - dripDelay) / (1 - dripDelay));
      const alpha = (1 - localT) * 0.7;
      if (alpha < MIN_ALPHA) {
        continue;
      }
      const xOff = (seededRandom(i * 31) - 0.5) * size * 0.8;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = dripColors[i % 3];
      ctx.beginPath();
      ctx.ellipse(
        cx + xOff * (1 - localT * 0.3),
        cy + easeInQuad(localT) * size * 0.6,
        size * 0.06 * (1 - localT * 0.3),
        size * 0.12 * (0.5 + localT * 0.5),
        0,
        0,
        TAU
      );
      ctx.fill();
    }
  }

  // Phase 3 (0.2–0.85): Bubbling toxic pool
  if (t > 0.2 && t < 0.85) {
    const poolT = (t - 0.2) / 0.65;
    const poolAppear = Math.min(1, easeOutCubic(poolT * 3));
    const poolFade = poolT > 0.6 ? easeInQuad((poolT - 0.6) / 0.4) : 0;
    const poolAlpha = poolAppear * (1 - poolFade) * 0.65;
    if (poolAlpha >= MIN_ALPHA) {
      const poolW = size * 0.8;
      const poolH = poolW * TRUE_ISO_Y_RATIO;

      ctx.globalAlpha = poolAlpha;
      ctx.fillStyle = "#28aa18";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        groundY,
        poolW * poolAppear,
        poolH * poolAppear,
        0,
        0,
        TAU
      );
      ctx.fill();

      ctx.globalAlpha = poolAlpha * 0.6;
      ctx.fillStyle = "#1a7710";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        groundY,
        poolW * 0.5 * poolAppear,
        poolH * 0.5 * poolAppear,
        0,
        0,
        TAU
      );
      ctx.fill();

      // Bubbles (reduced)
      for (let i = 0; i < 4; i++) {
        const phase = seededRandom(i * 59);
        const bubbleCycle = (poolT * 5 + phase) % 1;
        const alpha = poolAlpha * (1 - bubbleCycle) * 0.7;
        if (alpha < MIN_ALPHA) {
          continue;
        }
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "#66ff44";
        ctx.lineWidth = zoom * 0.8;
        ctx.beginPath();
        ctx.arc(
          cx + (seededRandom(i * 71) - 0.5) * poolW * 0.8 * poolAppear,
          groundY - bubbleCycle * size * 0.25,
          zoom * (2 + seededRandom(i * 73) * 2) * (1 - bubbleCycle),
          0,
          TAU
        );
        ctx.stroke();
      }
    }
  }

  // Phase 4 (0.25–0.8): Toxic vapor wisps
  if (t > 0.25 && t < 0.8) {
    const vaporT = (t - 0.25) / 0.55;
    for (let i = 0; i < 5; i++) {
      const startT = seededRandom(i * 61) * 0.3;
      if (vaporT < startT) {
        continue;
      }
      const localT = Math.min(1, (vaporT - startT) / (1 - startT));
      const alpha = (1 - easeInQuad(localT)) * 0.3;
      if (alpha < MIN_ALPHA) {
        continue;
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = i % 2 === 0 ? "#44cc22" : "#7744aa";
      drawDot(
        ctx,
        cx +
          (seededRandom(i * 67) - 0.5) * size * 0.6 +
          Math.sin(localT * Math.PI * 2.5 + i * 2) * size * 0.1,
        groundY - localT * size * 1.5,
        size * 0.15 * (0.3 + easeOutQuad(localT) * 0.7) * (1 - localT * 0.3)
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Default Death — Dust Disintegration — Duration: 1500ms
// ---------------------------------------------------------------------------
export function renderDefaultDeath({
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

  const groundColors = effect.regionGroundColors || [
    "#5a4e3e",
    "#4a3e2e",
    "#3a2e1e",
  ];
  const baseColor = groundColors[0];
  const midColor = groundColors[1] || groundColors[0];
  const darkColor = groundColors[2] || groundColors[1] || groundColors[0];
  const lightColor = lightenColor(baseColor, 35);

  // Phase 1 (0–0.25): Body crumbles
  if (t < 0.25) {
    const crumbleT = easeInQuad(t / 0.25);
    const bodyAlpha = (1 - crumbleT) * 0.6;
    if (bodyAlpha >= MIN_ALPHA) {
      const bodyH = size * 0.7 * (1 - crumbleT);
      const bodyW = size * 0.3 * (1 + crumbleT * 1.2);
      const bodyY = cy + size * 0.25 * crumbleT;

      ctx.globalAlpha = bodyAlpha;
      ctx.fillStyle = midColor;
      ctx.beginPath();
      ctx.ellipse(cx, bodyY, bodyW, Math.max(1, bodyH), 0, 0, TAU);
      ctx.fill();

      for (let i = 0; i < 6; i++) {
        const spawnT = seededRandom(i * 13) * 0.5;
        if (crumbleT < spawnT) {
          continue;
        }
        const localT = Math.min(1, (crumbleT - spawnT) / (1 - spawnT));
        const alpha = (1 - crumbleT) * (1 - localT) * 0.6;
        if (alpha < MIN_ALPHA) {
          continue;
        }
        const angle = seededRandom(i * 17) * TAU;
        const drift = localT * size * (0.15 + seededRandom(i * 23) * 0.25);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = i % 2 === 0 ? baseColor : midColor;
        drawDot(
          ctx,
          cx + Math.cos(angle) * drift,
          bodyY +
            Math.sin(angle) * drift * TRUE_ISO_Y_RATIO -
            localT * size * 0.05,
          zoom * (1 + seededRandom(i * 29) * 1.5) * (1 - localT)
        );
      }
    }
  }

  // Phase 2 (0.08–0.45): Dust burst
  if (t > 0.08 && t < 0.45) {
    const burstT = (t - 0.08) / 0.37;
    const baseAlpha = (1 - easeInQuad(burstT)) * 0.7;
    if (baseAlpha >= MIN_ALPHA) {
      const outT = easeOutCubic(burstT);
      const fall = easeInQuad(burstT) * size * 0.4;
      const burstColors = [baseColor, midColor, darkColor];
      ctx.globalAlpha = baseAlpha;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * TAU + seededRandom(i * 31) * 0.6;
        const speed = 0.4 + seededRandom(i * 37) * 0.7;
        const dist = outT * size * speed * 1.3;
        ctx.fillStyle = burstColors[i % 3];
        drawDot(
          ctx,
          cx + Math.cos(angle) * dist,
          cy + Math.sin(angle) * dist * TRUE_ISO_Y_RATIO + fall,
          zoom * (1.5 + seededRandom(i * 41) * 2.5) * (1 - burstT * 0.6)
        );
      }
    }
  }

  // Phase 3 (0.12–0.5): Dust cloud puffs
  if (t > 0.12 && t < 0.5) {
    const cloudT = (t - 0.12) / 0.38;
    for (let i = 0; i < 4; i++) {
      const delay = seededRandom(i * 51) * 0.2;
      if (cloudT < delay) {
        continue;
      }
      const localT = Math.min(1, (cloudT - delay) / (1 - delay));
      const alpha = (1 - easeInQuad(localT)) * 0.3;
      if (alpha < MIN_ALPHA) {
        continue;
      }
      const rise = localT < 0.4 ? localT / 0.4 : 1 - (localT - 0.4) / 0.6;
      const cloudSize =
        size * (0.18 + i * 0.06) * (0.3 + easeOutQuad(localT) * 0.7);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = i % 2 === 0 ? baseColor : midColor;
      ctx.beginPath();
      ctx.ellipse(
        cx + (seededRandom(i * 53) - 0.5) * size * 0.7 * easeOutQuad(localT),
        groundY - rise * size * 0.4,
        cloudSize,
        cloudSize * TRUE_ISO_Y_RATIO,
        0,
        0,
        TAU
      );
      ctx.fill();
    }
  }

  // Phase 4 (0.15–0.55): Settling motes
  if (t > 0.15 && t < 0.55) {
    const settleT = (t - 0.15) / 0.4;
    const settleColors = [lightColor, baseColor, midColor];
    for (let i = 0; i < 8; i++) {
      const startT = seededRandom(i * 59) * 0.35;
      if (settleT < startT) {
        continue;
      }
      const localT = Math.min(1, (settleT - startT) / (1 - startT));
      const alpha = (1 - easeInQuad(localT)) * 0.55;
      if (alpha < MIN_ALPHA) {
        continue;
      }
      const xSpread = (seededRandom(i * 61) - 0.5) * size * 1;
      const sway =
        Math.sin(localT * TAU + seededRandom(i * 67) * 6) * size * 0.06;
      const startY = cy - size * 0.2;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = settleColors[i % 3];
      drawDot(
        ctx,
        cx + xSpread * (0.3 + localT * 0.7) + sway,
        startY + (groundY - startY) * localT,
        zoom * (1 + seededRandom(i * 71) * 1.5) * (1 - localT * 0.4)
      );
    }
  }

  // Phase 5 (0.2–1.0): Dust pile
  if (t > 0.2) {
    const { pileAlpha, pileFade, pileAppear } = pileTimings(t, 0.2);
    if (pileAlpha >= MIN_ALPHA) {
      const pileW = size * 1;
      const pileH = pileW * TRUE_ISO_Y_RATIO;

      ctx.globalAlpha = pileAlpha * 0.2;
      ctx.fillStyle = darkColor;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        groundY + 3 * zoom,
        pileW * 1.15 * pileAppear,
        pileH * 1.1 * pileAppear,
        0,
        0,
        TAU
      );
      ctx.fill();

      ctx.globalAlpha = pileAlpha * 0.35;
      ctx.fillStyle = midColor;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        groundY,
        pileW * pileAppear,
        pileH * pileAppear,
        0,
        0,
        TAU
      );
      ctx.fill();

      ctx.globalAlpha = pileAlpha * 0.7;
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        groundY - pileH * 0.15 * pileAppear,
        pileW * 0.6 * pileAppear,
        pileH * 0.5 * pileAppear,
        0,
        0,
        TAU
      );
      ctx.fill();

      if (pileAlpha * 0.3 >= MIN_ALPHA) {
        ctx.globalAlpha = pileAlpha * 0.3;
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.ellipse(
          cx - pileW * 0.06,
          groundY - pileH * 0.25 * pileAppear,
          pileW * 0.25 * pileAppear,
          pileH * 0.18 * pileAppear,
          0,
          0,
          TAU
        );
        ctx.fill();
      }

      const speckAlpha = pileAlpha * 0.4 * (1 - pileFade);
      if (speckAlpha >= MIN_ALPHA) {
        const speckColors = [darkColor, midColor, baseColor];
        ctx.globalAlpha = speckAlpha;
        for (let i = 0; i < 6; i++) {
          const angle = seededRandom(i * 47) * TAU;
          const dist =
            pileW * (0.45 + seededRandom(i * 53) * 0.65) * pileAppear;
          ctx.fillStyle = speckColors[i % 3];
          drawDot(
            ctx,
            cx + Math.cos(angle) * dist,
            groundY + Math.sin(angle) * dist * TRUE_ISO_Y_RATIO,
            zoom * (1 + seededRandom(i * 61) * 1.5)
          );
        }
      }
    }
  }
}

function lightenColor(hex: string, amount: number): string {
  const r = Math.min(255, Number.parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, Number.parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, Number.parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------
export function renderEnemyDeath(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  zoom: number,
  progress: number,
  effect: Effect
): void {
  const params: DeathAnimationParams = {
    ctx,
    effect,
    progress,
    screenPos,
    zoom,
  };

  switch (effect.deathCause) {
    case "lightning": {
      renderLightningDeath(params);
      break;
    }
    case "fire": {
      renderFireDeath(params);
      break;
    }
    case "freeze": {
      renderFreezeDeath(params);
      break;
    }
    case "sonic": {
      renderSonicDeath(params);
      break;
    }
    case "poison": {
      renderPoisonDeath(params);
      break;
    }
    default: {
      renderDefaultDeath(params);
      break;
    }
  }
}
