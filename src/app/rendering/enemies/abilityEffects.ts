import { ISO_Y_RATIO } from "../../constants/isometric";
import type { EnemyAbilityType } from "../../types";

const TAU = Math.PI * 2;
const ABILITY_ACTIVATION_DURATION_MS = 600;

export interface AbilityActivationConfig {
  primary: string;
  secondary: string;
  glow: string;
  symbol: string;
  particleCount: number;
}

const ABILITY_CONFIGS: Record<EnemyAbilityType, AbilityActivationConfig> = {
  burn: {
    glow: "255, 180, 50",
    particleCount: 8,
    primary: "255, 120, 30",
    secondary: "255, 60, 10",
    symbol: "fire",
  },
  poison: {
    glow: "120, 255, 80",
    particleCount: 7,
    primary: "80, 220, 60",
    secondary: "40, 180, 30",
    symbol: "skull",
  },
  slow: {
    glow: "150, 200, 255",
    particleCount: 6,
    primary: "100, 180, 255",
    secondary: "60, 120, 220",
    symbol: "wave",
  },
  stun: {
    glow: "255, 255, 150",
    particleCount: 6,
    primary: "255, 240, 60",
    secondary: "255, 200, 20",
    symbol: "bolt",
  },
  tower_blind: {
    glow: "200, 120, 240",
    particleCount: 5,
    primary: "160, 80, 200",
    secondary: "120, 50, 170",
    symbol: "eye",
  },
  tower_disable: {
    glow: "255, 220, 80",
    particleCount: 6,
    primary: "220, 180, 40",
    secondary: "180, 140, 20",
    symbol: "lock",
  },
  tower_slow: {
    glow: "120, 170, 230",
    particleCount: 5,
    primary: "80, 140, 200",
    secondary: "50, 100, 170",
    symbol: "chain",
  },
  tower_weaken: {
    glow: "240, 100, 80",
    particleCount: 5,
    primary: "200, 60, 60",
    secondary: "160, 30, 30",
    symbol: "crack",
  },
};

export function getAbilityActivationPhase(
  lastAbilityUse: number | undefined,
  now: number
): number {
  if (!lastAbilityUse) {
    return 0;
  }
  const elapsed = now - lastAbilityUse;
  if (elapsed >= ABILITY_ACTIVATION_DURATION_MS) {
    return 0;
  }
  return 1 - elapsed / ABILITY_ACTIVATION_DURATION_MS;
}

export function renderAbilityActivation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  abilityType: EnemyAbilityType,
  phase: number,
  time: number
): void {
  if (phase <= 0) {
    return;
  }

  const config = ABILITY_CONFIGS[abilityType];
  if (!config) {
    return;
  }

  const isTowerAbility = abilityType.startsWith("tower_");

  ctx.save();

  if (isTowerAbility) {
    renderTowerAbilityActivation(ctx, x, y, size, zoom, config, phase, time);
  } else {
    renderUnitAbilityActivation(
      ctx,
      x,
      y,
      size,
      zoom,
      config,
      abilityType,
      phase,
      time
    );
  }

  ctx.restore();
}

function renderUnitAbilityActivation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  config: AbilityActivationConfig,
  abilityType: EnemyAbilityType,
  phase: number,
  time: number
): void {
  const easeOut = 1 - (1 - phase) * (1 - phase);
  const fadeAlpha = phase < 0.3 ? phase / 0.3 : 1;
  const burstRadius = size * (0.6 + (1 - easeOut) * 1.2);

  // Outer glow burst (isometric ground-plane ellipse)
  const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, burstRadius);
  glowGrad.addColorStop(0, `rgba(${config.glow}, ${0.5 * fadeAlpha * phase})`);
  glowGrad.addColorStop(
    0.4,
    `rgba(${config.primary}, ${0.3 * fadeAlpha * phase})`
  );
  glowGrad.addColorStop(1, `rgba(${config.secondary}, 0)`);
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, burstRadius, burstRadius * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Expanding ring (isometric)
  const ringRadius = size * (0.4 + (1 - phase) * 0.8);
  const ringWidth = (2.5 + phase * 1.5) * zoom;
  ctx.strokeStyle = `rgba(${config.primary}, ${0.9 * phase * fadeAlpha})`;
  ctx.lineWidth = ringWidth;
  ctx.beginPath();
  ctx.ellipse(x, y, ringRadius, ringRadius * ISO_Y_RATIO, 0, 0, TAU);
  ctx.stroke();

  // Inner bright core (isometric)
  if (phase > 0.4) {
    const corePhase = (phase - 0.4) / 0.6;
    const coreSize = size * 0.2 * corePhase;
    const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, coreSize);
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.8 * corePhase})`);
    coreGrad.addColorStop(0.5, `rgba(${config.glow}, ${0.6 * corePhase})`);
    coreGrad.addColorStop(1, `rgba(${config.primary}, 0)`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, coreSize, coreSize * ISO_Y_RATIO, 0, 0, TAU);
    ctx.fill();
  }

  // Ability-specific symbol
  renderAbilitySymbol(
    ctx,
    x,
    y - size * 0.6 * phase,
    size,
    zoom,
    config,
    abilityType,
    phase,
    time
  );

  // Burst particles
  renderActivationParticles(ctx, x, y, size, zoom, config, phase, time);
}

function renderTowerAbilityActivation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  config: AbilityActivationConfig,
  phase: number,
  time: number
): void {
  const easeOut = 1 - (1 - phase) * (1 - phase);
  const fadeAlpha = phase < 0.3 ? phase / 0.3 : 1;

  // Dark oppressive aura emanating from enemy (isometric)
  const auraRadius = size * (0.8 + (1 - easeOut) * 1.5);
  const auraGrad = ctx.createRadialGradient(x, y, size * 0.2, x, y, auraRadius);
  auraGrad.addColorStop(
    0,
    `rgba(${config.secondary}, ${0.4 * fadeAlpha * phase})`
  );
  auraGrad.addColorStop(
    0.5,
    `rgba(${config.primary}, ${0.25 * fadeAlpha * phase})`
  );
  auraGrad.addColorStop(1, `rgba(${config.secondary}, 0)`);
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, auraRadius, auraRadius * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Pulsing hex/rune ring
  const runeCount = 4;
  const ringR = size * (0.5 + (1 - phase) * 0.4);
  for (let i = 0; i < runeCount; i++) {
    const angle = time * 2 + (i / runeCount) * TAU;
    const rx = x + Math.cos(angle) * ringR;
    const ry = y + Math.sin(angle) * ringR * ISO_Y_RATIO;
    const runeSize = (4 + phase * 2) * zoom;

    ctx.fillStyle = `rgba(${config.glow}, ${0.9 * phase * fadeAlpha})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry - runeSize);
    ctx.lineTo(rx + runeSize * 0.6, ry);
    ctx.lineTo(rx, ry + runeSize);
    ctx.lineTo(rx - runeSize * 0.6, ry);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(${config.primary}, ${0.7 * phase})`;
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
  }

  // Energy tendrils reaching outward
  const tendrilCount = 3;
  for (let i = 0; i < tendrilCount; i++) {
    const angle = time * 1.5 + (i / tendrilCount) * TAU;
    const len = size * (0.8 + (1 - phase) * 0.6);
    ctx.strokeStyle = `rgba(${config.primary}, ${0.6 * phase * fadeAlpha})`;
    ctx.lineWidth = (1.5 + phase) * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segments = 5;
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const px =
        x +
        Math.cos(angle) * len * t +
        Math.sin(time * 8 + i + s) * size * 0.05;
      const py =
        y +
        Math.sin(angle) * len * t * ISO_Y_RATIO +
        Math.cos(time * 6 + i + s) * size * 0.03;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  renderActivationParticles(ctx, x, y, size, zoom, config, phase, time);
}

function renderAbilitySymbol(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  config: AbilityActivationConfig,
  abilityType: EnemyAbilityType,
  phase: number,
  _time: number
): void {
  const symbolAlpha =
    phase > 0.3 ? Math.min(1, (phase - 0.3) / 0.3) * phase : 0;
  if (symbolAlpha <= 0) {
    return;
  }

  const s = size * 0.18 * zoom;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = symbolAlpha;

  switch (abilityType) {
    case "burn": {
      drawFlameSymbol(ctx, s, config);
      break;
    }
    case "slow": {
      drawSlowSymbol(ctx, s, config);
      break;
    }
    case "poison": {
      drawPoisonSymbol(ctx, s, config);
      break;
    }
    case "stun": {
      drawBoltSymbol(ctx, s, config);
      break;
    }
  }

  ctx.restore();
}

function drawFlameSymbol(
  ctx: CanvasRenderingContext2D,
  s: number,
  config: AbilityActivationConfig
): void {
  ctx.fillStyle = `rgba(${config.glow}, 0.95)`;
  ctx.beginPath();
  ctx.moveTo(0, -s * 1.3);
  ctx.quadraticCurveTo(s * 0.6, -s * 0.4, s * 0.4, s * 0.3);
  ctx.quadraticCurveTo(s * 0.2, -s * 0.1, 0, s * 0.5);
  ctx.quadraticCurveTo(-s * 0.2, -s * 0.1, -s * 0.4, s * 0.3);
  ctx.quadraticCurveTo(-s * 0.6, -s * 0.4, 0, -s * 1.3);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 255, 200, 0.8)`;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.6);
  ctx.quadraticCurveTo(s * 0.2, -s * 0.1, 0, s * 0.3);
  ctx.quadraticCurveTo(-s * 0.2, -s * 0.1, 0, -s * 0.6);
  ctx.fill();
}

function drawSlowSymbol(
  ctx: CanvasRenderingContext2D,
  s: number,
  config: AbilityActivationConfig
): void {
  ctx.strokeStyle = `rgba(${config.glow}, 0.95)`;
  ctx.lineWidth = s * 0.15;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const offset = (i - 1) * s * 0.45;
    ctx.moveTo(offset - s * 0.15, -s * 0.5);
    ctx.quadraticCurveTo(offset + s * 0.2, 0, offset - s * 0.15, s * 0.5);
  }
  ctx.stroke();
}

function drawPoisonSymbol(
  ctx: CanvasRenderingContext2D,
  s: number,
  config: AbilityActivationConfig
): void {
  // Dripping drops
  ctx.fillStyle = `rgba(${config.glow}, 0.95)`;
  for (let i = 0; i < 3; i++) {
    const dx = (i - 1) * s * 0.5;
    const dy = i === 1 ? -s * 0.2 : s * 0.1;
    ctx.beginPath();
    ctx.moveTo(dx, dy - s * 0.35);
    ctx.quadraticCurveTo(dx + s * 0.2, dy, dx, dy + s * 0.25);
    ctx.quadraticCurveTo(dx - s * 0.2, dy, dx, dy - s * 0.35);
    ctx.fill();
  }

  // Crossbones hint
  ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
  ctx.lineWidth = s * 0.1;
  ctx.beginPath();
  ctx.moveTo(-s * 0.3, -s * 0.1);
  ctx.lineTo(s * 0.3, s * 0.3);
  ctx.moveTo(s * 0.3, -s * 0.1);
  ctx.lineTo(-s * 0.3, s * 0.3);
  ctx.stroke();
}

function drawBoltSymbol(
  ctx: CanvasRenderingContext2D,
  s: number,
  config: AbilityActivationConfig
): void {
  ctx.fillStyle = `rgba(${config.glow}, 0.95)`;
  ctx.beginPath();
  ctx.moveTo(s * 0.15, -s * 1);
  ctx.lineTo(-s * 0.3, -s * 0.1);
  ctx.lineTo(s * 0.05, -s * 0.1);
  ctx.lineTo(-s * 0.15, s * 0.8);
  ctx.lineTo(s * 0.3, 0);
  ctx.lineTo(-s * 0.05, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = `rgba(255, 255, 255, 0.6)`;
  ctx.beginPath();
  ctx.moveTo(s * 0.1, -s * 0.7);
  ctx.lineTo(-s * 0.1, -s * 0.1);
  ctx.lineTo(s * 0.05, -s * 0.1);
  ctx.lineTo(-s * 0.05, s * 0.4);
  ctx.closePath();
  ctx.fill();
}

function renderActivationParticles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  config: AbilityActivationConfig,
  phase: number,
  time: number
): void {
  const count = config.particleCount;
  const spread = 1 - phase;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * TAU + time * 3;
    const dist = size * (0.3 + spread * 0.9);
    const wobble = Math.sin(time * 8 + i * 2.3) * size * 0.06;
    const px = x + Math.cos(angle) * dist + wobble;
    const py = y + Math.sin(angle) * dist * ISO_Y_RATIO;
    const pSize = (2 + phase * 2.5) * zoom;
    const alpha = phase * (0.6 + Math.sin(time * 6 + i) * 0.3);

    // Particle glow
    const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, pSize * 2);
    glowGrad.addColorStop(0, `rgba(${config.glow}, ${alpha * 0.4})`);
    glowGrad.addColorStop(1, `rgba(${config.primary}, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(px, py, pSize * 2, 0, TAU);
    ctx.fill();

    // Particle core
    ctx.fillStyle = `rgba(${config.glow}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, TAU);
    ctx.fill();

    // Bright center
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize * 0.4, 0, TAU);
    ctx.fill();
  }
}
