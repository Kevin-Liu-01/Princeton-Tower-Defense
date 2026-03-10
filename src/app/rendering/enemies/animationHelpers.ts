// Princeton Tower Defense - Enemy Animation Helpers
// Reusable animated body part and effect functions for enemy sprites.

const TAU = Math.PI * 2;

// ============================================================================
// ANIMATED HUMANOID ARM (upper arm + forearm + hand)
// ============================================================================

export interface ArmOptions {
  upperLen?: number;
  foreLen?: number;
  width?: number;
  swingSpeed?: number;
  swingAmt?: number;
  baseAngle?: number;
  color: string;
  colorDark: string;
  handColor?: string;
  handRadius?: number;
  phaseOffset?: number;
  elbowBend?: number;
  attackExtra?: number;
}

export function drawAnimatedArm(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  size: number,
  time: number,
  zoom: number,
  side: -1 | 1,
  opts: ArmOptions,
): void {
  const upperLen = (opts.upperLen ?? 0.18) * size;
  const foreLen = (opts.foreLen ?? 0.15) * size;
  const width = (opts.width ?? 0.06) * size;
  const speed = opts.swingSpeed ?? 4;
  const amt = opts.swingAmt ?? 0.35;
  const base = (opts.baseAngle ?? 0.3) * side;
  const phase = opts.phaseOffset ?? 0;
  const elbowBendBase = opts.elbowBend ?? 0.4;
  const attackBoost = opts.attackExtra ?? 0;

  const swing = Math.sin(time * speed + phase) * amt + attackBoost * Math.sin(time * speed * 2) * 0.2;
  const shoulderAngle = base + swing;
  const elbowAngle = elbowBendBase + Math.sin(time * speed + phase + 1.2) * 0.25 * side;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(shoulderAngle);

  const grad = ctx.createLinearGradient(-width, 0, width, 0);
  grad.addColorStop(0, opts.colorDark);
  grad.addColorStop(0.5, opts.color);
  grad.addColorStop(1, opts.colorDark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, upperLen * 0.5, width, upperLen * 0.55, 0, 0, TAU);
  ctx.fill();

  ctx.translate(0, upperLen);
  ctx.rotate(elbowAngle);

  ctx.fillStyle = opts.color;
  ctx.beginPath();
  ctx.ellipse(0, foreLen * 0.45, width * 0.85, foreLen * 0.5, 0, 0, TAU);
  ctx.fill();

  const handR = (opts.handRadius ?? 0.035) * size;
  ctx.fillStyle = opts.handColor ?? opts.color;
  ctx.beginPath();
  ctx.arc(0, foreLen, handR, 0, TAU);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// ANIMATED HUMANOID LEGS (thigh + shin + foot, walking stride)
// ============================================================================

export interface LegOptions {
  legLen?: number;
  width?: number;
  strideSpeed?: number;
  strideAmt?: number;
  color: string;
  colorDark: string;
  footColor?: string;
  footLen?: number;
  shuffle?: boolean;
  phaseOffset?: number;
}

export function drawAnimatedLegs(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  hipY: number,
  size: number,
  time: number,
  zoom: number,
  opts: LegOptions,
): void {
  const halfLen = ((opts.legLen ?? 0.16) * size) / 2;
  const width = (opts.width ?? 0.055) * size;
  const speed = opts.strideSpeed ?? 5;
  const stride = opts.strideAmt ?? 0.3;
  const phase = opts.phaseOffset ?? 0;
  const isShuffle = opts.shuffle ?? false;

  for (let leg = 0; leg < 2; leg++) {
    const legSide = leg === 0 ? -1 : 1;
    const legPhase = leg === 0 ? 0 : Math.PI;
    const swing = Math.sin(time * speed + legPhase + phase) * stride;
    const kneeBend = Math.max(0, Math.sin(time * speed + legPhase + phase + 0.8)) * 0.3;

    const hipOffX = hipX + legSide * size * 0.08;

    ctx.save();
    ctx.translate(hipOffX, hipY);
    ctx.rotate(swing * (isShuffle ? 0.5 : 1));

    ctx.fillStyle = opts.colorDark;
    ctx.beginPath();
    ctx.ellipse(0, halfLen * 0.5, width, halfLen * 0.6, 0, 0, TAU);
    ctx.fill();

    ctx.translate(0, halfLen);
    ctx.rotate(kneeBend * legSide * 0.5);

    ctx.fillStyle = opts.color;
    ctx.beginPath();
    ctx.ellipse(0, halfLen * 0.45, width * 0.85, halfLen * 0.55, 0, 0, TAU);
    ctx.fill();

    const footLen = (opts.footLen ?? 0.08) * size;
    ctx.fillStyle = opts.footColor ?? opts.colorDark;
    ctx.beginPath();
    ctx.ellipse(footLen * 0.2, halfLen, footLen, width * 0.6, 0, 0, TAU);
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================================
// PULSING GLOW RINGS
// ============================================================================

export interface GlowRingOptions {
  count?: number;
  speed?: number;
  color: string;
  maxAlpha?: number;
  expansion?: number;
  lineWidth?: number;
}

export function drawPulsingGlowRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  time: number,
  zoom: number,
  opts: GlowRingOptions,
): void {
  const count = opts.count ?? 3;
  const speed = opts.speed ?? 1.5;
  const maxAlpha = opts.maxAlpha ?? 0.4;
  const expansion = opts.expansion ?? 1.5;
  const lw = (opts.lineWidth ?? 1.5) * zoom;

  ctx.lineWidth = lw;
  for (let i = 0; i < count; i++) {
    const phase = (time * speed + i * (1 / count)) % 1;
    const radius = baseRadius + phase * baseRadius * expansion;
    const alpha = (1 - phase) * maxAlpha;

    ctx.strokeStyle = opts.color.replace(/[\d.]+\)$/, `${alpha})`);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.stroke();
  }
}

// ============================================================================
// SHIFTING / FLOATING SEGMENTS (armor plates, shards, body pieces)
// ============================================================================

export interface ShiftingSegmentOptions {
  count?: number;
  orbitRadius?: number;
  segmentSize?: number;
  orbitSpeed?: number;
  bobSpeed?: number;
  bobAmt?: number;
  color: string;
  colorAlt?: string;
  shape?: "circle" | "diamond" | "shard";
  rotateWithOrbit?: boolean;
}

export function drawShiftingSegments(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  zoom: number,
  opts: ShiftingSegmentOptions,
): void {
  const count = opts.count ?? 6;
  const orbit = (opts.orbitRadius ?? 0.3) * size;
  const segSize = (opts.segmentSize ?? 0.04) * size;
  const oSpeed = opts.orbitSpeed ?? 1.5;
  const bSpeed = opts.bobSpeed ?? 3;
  const bAmt = (opts.bobAmt ?? 0.04) * size;
  const shouldRotate = opts.rotateWithOrbit ?? true;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * TAU + time * oSpeed;
    const bob = Math.sin(time * bSpeed + i * 1.7) * bAmt;
    const px = cx + Math.cos(angle) * (orbit + bob);
    const py = cy + Math.sin(angle) * (orbit * 0.6 + bob * 0.5);

    ctx.save();
    ctx.translate(px, py);
    if (shouldRotate) ctx.rotate(angle + time * 2);

    ctx.fillStyle = i % 2 === 0 ? opts.color : (opts.colorAlt ?? opts.color);

    if (opts.shape === "diamond") {
      const hs = segSize;
      ctx.beginPath();
      ctx.moveTo(0, -hs);
      ctx.lineTo(hs * 0.6, 0);
      ctx.lineTo(0, hs);
      ctx.lineTo(-hs * 0.6, 0);
      ctx.closePath();
      ctx.fill();
    } else if (opts.shape === "shard") {
      ctx.beginPath();
      ctx.moveTo(0, -segSize * 1.2);
      ctx.lineTo(segSize * 0.4, segSize * 0.5);
      ctx.lineTo(-segSize * 0.4, segSize * 0.5);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, segSize, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }
}

// ============================================================================
// ENERGY ARC / CRACKLING (lightning-like arcs between points)
// ============================================================================

export interface EnergyArcOptions {
  color: string;
  segments?: number;
  amplitude?: number;
  width?: number;
  alpha?: number;
}

export function drawEnergyArc(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  time: number,
  zoom: number,
  opts: EnergyArcOptions,
): void {
  const segs = opts.segments ?? 5;
  const amp = opts.amplitude ?? 6;
  const alpha = opts.alpha ?? 0.7;

  ctx.save();
  ctx.strokeStyle = opts.color.replace(/[\d.]+\)$/, `${alpha})`);
  ctx.lineWidth = (opts.width ?? 1.5) * zoom;
  ctx.beginPath();
  ctx.moveTo(x1, y1);

  const dx = x2 - x1;
  const dy = y2 - y1;

  for (let s = 1; s <= segs; s++) {
    const t = s / segs;
    const mx = x1 + dx * t;
    const my = y1 + dy * t;
    const jitter = s < segs
      ? (Math.sin(time * 15 + s * 3.7) * amp + Math.cos(time * 22 + s * 5.1) * amp * 0.5) * zoom
      : 0;
    const perpX = -dy / Math.sqrt(dx * dx + dy * dy) * jitter;
    const perpY = dx / Math.sqrt(dx * dx + dy * dy) * jitter;
    ctx.lineTo(mx + perpX, my + perpY);
  }
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// ORBITING PARTICLES / DEBRIS
// ============================================================================

export interface OrbitingDebrisOptions {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
  speed?: number;
  particleSize?: number;
  color: string;
  glowColor?: string;
  trailLen?: number;
}

export function drawOrbitingDebris(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  zoom: number,
  opts: OrbitingDebrisOptions,
): void {
  const count = opts.count ?? 5;
  const minR = (opts.minRadius ?? 0.25) * size;
  const maxR = (opts.maxRadius ?? 0.45) * size;
  const speed = opts.speed ?? 2;
  const pSize = (opts.particleSize ?? 0.02) * size;
  const trail = opts.trailLen ?? 3;

  for (let i = 0; i < count; i++) {
    const angle = time * speed + i * (TAU / count);
    const r = minR + (maxR - minR) * (0.5 + Math.sin(time * 1.5 + i * 2.3) * 0.5);
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r * 0.55;

    if (trail > 0 && opts.glowColor) {
      ctx.strokeStyle = opts.glowColor;
      ctx.lineWidth = pSize * 0.8;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let t = 1; t <= trail; t++) {
        const ta = angle - t * 0.15;
        const tr = r - t * pSize * 0.5;
        ctx.lineTo(cx + Math.cos(ta) * tr, cy + Math.sin(ta) * tr * 0.55);
      }
      ctx.stroke();
    }

    ctx.fillStyle = opts.color;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, TAU);
    ctx.fill();
  }
}

// ============================================================================
// BODY BREATHING / PULSING SCALE
// ============================================================================

export function getBreathScale(time: number, rate: number = 2, amount: number = 0.03): number {
  return 1 + Math.sin(time * rate) * amount;
}

// ============================================================================
// GLOWING EYES EFFECT (animated pupil dilation + glow pulse)
// ============================================================================

export interface GlowingEyeOptions {
  spacing: number;
  eyeRadius: number;
  pupilRadius: number;
  irisColor: string;
  pupilColor?: string;
  glowColor: string;
  glowRadius?: number;
  pulseSpeed?: number;
  lookSpeed?: number;
  lookAmount?: number;
}

export function drawGlowingEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  opts: GlowingEyeOptions,
): void {
  const pulse = 0.6 + Math.sin(time * (opts.pulseSpeed ?? 4)) * 0.4;
  const glowR = (opts.glowRadius ?? opts.eyeRadius * 2.5) * size;
  const lookX = Math.sin(time * (opts.lookSpeed ?? 1.5)) * (opts.lookAmount ?? 0.015) * size;
  const lookY = Math.cos(time * (opts.lookSpeed ?? 1.5) * 0.7) * (opts.lookAmount ?? 0.015) * size * 0.5;

  for (let side = -1; side <= 1; side += 2) {
    const ex = cx + side * opts.spacing * size;

    const glow = ctx.createRadialGradient(ex, cy, 0, ex, cy, glowR);
    glow.addColorStop(0, opts.glowColor.replace(/[\d.]+\)$/, `${pulse * 0.5})`));
    glow.addColorStop(1, opts.glowColor.replace(/[\d.]+\)$/, "0)"));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ex, cy, glowR, 0, TAU);
    ctx.fill();

    ctx.fillStyle = opts.irisColor;
    ctx.beginPath();
    ctx.arc(ex, cy, opts.eyeRadius * size, 0, TAU);
    ctx.fill();

    const dilate = 1 + Math.sin(time * 3) * 0.15;
    ctx.fillStyle = opts.pupilColor ?? "#000";
    ctx.beginPath();
    ctx.arc(ex + lookX, cy + lookY, opts.pupilRadius * size * dilate, 0, TAU);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(
      ex - opts.eyeRadius * size * 0.25 + lookX * 0.3,
      cy - opts.eyeRadius * size * 0.25 + lookY * 0.3,
      opts.pupilRadius * size * 0.4,
      0,
      TAU,
    );
    ctx.fill();
  }
}

// ============================================================================
// TENDRIL / TENTACLE (animated wavy appendage)
// ============================================================================

export interface TendrilOptions {
  length?: number;
  width?: number;
  segments?: number;
  waveSpeed?: number;
  waveAmt?: number;
  color: string;
  tipColor?: string;
  tipRadius?: number;
}

export function drawAnimatedTendril(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  angle: number,
  size: number,
  time: number,
  zoom: number,
  opts: TendrilOptions,
): void {
  const length = (opts.length ?? 0.3) * size;
  const width = (opts.width ?? 0.03) * size;
  const segs = opts.segments ?? 8;
  const wSpeed = opts.waveSpeed ?? 4;
  const wAmt = (opts.waveAmt ?? 0.06) * size;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const dist = t * length;
    const wave = Math.sin(time * wSpeed + t * 4) * wAmt * t;
    const px = startX + Math.cos(angle) * dist + Math.cos(angle + Math.PI / 2) * wave;
    const py = startY + Math.sin(angle) * dist + Math.sin(angle + Math.PI / 2) * wave;
    points.push({ x: px, y: py });
  }

  ctx.strokeStyle = opts.color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineWidth = width * (1 - (i / segs) * 0.6);
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.lineCap = "butt";

  if (opts.tipColor) {
    const tip = points[points.length - 1];
    const tipR = (opts.tipRadius ?? 0.015) * size;
    ctx.fillStyle = opts.tipColor;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, tipR, 0, TAU);
    ctx.fill();
  }
}

// ============================================================================
// FLOATING BODY SWAY (returns x/y offsets for natural idle movement)
// ============================================================================

export function getIdleSway(
  time: number,
  speed: number = 2,
  amountX: number = 2,
  amountY: number = 1.5,
  phase: number = 0,
): { dx: number; dy: number } {
  return {
    dx: Math.sin(time * speed + phase) * amountX,
    dy: Math.cos(time * speed * 0.7 + phase) * amountY,
  };
}

// ============================================================================
// SHOULDER PAD / ARMOR PIECE (animated floating piece)
// ============================================================================

export interface FloatingPieceOptions {
  width: number;
  height: number;
  color: string;
  colorEdge?: string;
  bobSpeed?: number;
  bobAmt?: number;
  rotateSpeed?: number;
  rotateAmt?: number;
}

export function drawFloatingPiece(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  time: number,
  phase: number,
  opts: FloatingPieceOptions,
): void {
  const w = opts.width * size;
  const h = opts.height * size;
  const bob = Math.sin(time * (opts.bobSpeed ?? 3) + phase) * (opts.bobAmt ?? 0.02) * size;
  const rot = Math.sin(time * (opts.rotateSpeed ?? 2) + phase) * (opts.rotateAmt ?? 0.1);

  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(rot);

  const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  grad.addColorStop(0, opts.colorEdge ?? opts.color);
  grad.addColorStop(0.5, opts.color);
  grad.addColorStop(1, opts.colorEdge ?? opts.color);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, TAU);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// POISON BUBBLES (swamp enemies – rising bubbles that pop)
// ============================================================================

export interface PoisonBubbleOptions {
  count?: number;
  speed?: number;
  color: string;
  maxAlpha?: number;
  maxSize?: number;
  spread?: number;
}

export function drawPoisonBubbles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  time: number,
  zoom: number,
  opts: PoisonBubbleOptions,
): void {
  const count = opts.count ?? 5;
  const speed = opts.speed ?? 1.2;
  const maxAlpha = opts.maxAlpha ?? 0.5;
  const maxBubbleR = (opts.maxSize ?? 0.12) * baseRadius;
  const spread = (opts.spread ?? 1.0) * baseRadius;

  for (let i = 0; i < count; i++) {
    const seed = i * 2.39996;
    const phase = (time * speed + seed) % 1;
    const offsetX = Math.sin(seed * 7.3) * spread * 0.6;
    const riseDist = phase * baseRadius * 1.4;
    const bx = cx + offsetX + Math.sin(time * 2 + seed) * baseRadius * 0.1;
    const by = cy - riseDist;
    const popPhase = phase > 0.8 ? (phase - 0.8) / 0.2 : 0;
    const bubbleR = maxBubbleR * (0.4 + phase * 0.6) * (1 + popPhase * 0.5);
    const alpha = (1 - popPhase) * maxAlpha * (phase < 0.15 ? phase / 0.15 : 1);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = opts.color;
    ctx.beginPath();
    ctx.arc(bx, by, bubbleR * zoom, 0, TAU);
    ctx.fill();

    if (popPhase <= 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(
        bx - bubbleR * 0.25 * zoom,
        by - bubbleR * 0.25 * zoom,
        bubbleR * 0.3 * zoom,
        0,
        TAU,
      );
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ============================================================================
// SAND DUST (desert enemies – swirling sand particles)
// ============================================================================

export interface SandDustOptions {
  count?: number;
  speed?: number;
  color: string;
  maxAlpha?: number;
  spread?: number;
  particleSize?: number;
}

export function drawSandDust(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  time: number,
  zoom: number,
  opts: SandDustOptions,
): void {
  const count = opts.count ?? 8;
  const speed = opts.speed ?? 2.0;
  const maxAlpha = opts.maxAlpha ?? 0.4;
  const spread = (opts.spread ?? 1.2) * baseRadius;
  const pSize = (opts.particleSize ?? 0.06) * baseRadius;

  for (let i = 0; i < count; i++) {
    const seed = i * 1.618;
    const angle = time * speed * (0.6 + seed * 0.1) + seed * TAU;
    const drift = Math.sin(time * 1.5 + seed * 3.1) * spread * 0.15;
    const r = spread * (0.3 + Math.sin(time * 0.8 + seed * 2.7) * 0.3) + drift;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r * 0.5;
    const alpha = maxAlpha * (0.3 + Math.sin(time * 3 + seed * 4.1) * 0.3);
    const sz = pSize * (0.5 + Math.sin(time * 2 + seed) * 0.3) * zoom;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = opts.color;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle * 0.5);
    ctx.fillRect(-sz, -sz * 0.5, sz * 2, sz);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ============================================================================
// FROST CRYSTALS (winter enemies – floating spinning ice shards)
// ============================================================================

export interface FrostCrystalOptions {
  count?: number;
  speed?: number;
  color: string;
  glowColor?: string;
  maxAlpha?: number;
  crystalSize?: number;
}

export function drawFrostCrystals(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  time: number,
  zoom: number,
  opts: FrostCrystalOptions,
): void {
  const count = opts.count ?? 5;
  const speed = opts.speed ?? 1.8;
  const maxAlpha = opts.maxAlpha ?? 0.5;
  const crystalSize = (opts.crystalSize ?? 0.1) * baseRadius;

  for (let i = 0; i < count; i++) {
    const seed = i * 2.094;
    const angle = time * speed + seed;
    const orbitR = baseRadius * (0.6 + Math.sin(time + seed * 1.7) * 0.2);
    const px = cx + Math.cos(angle) * orbitR;
    const py = cy + Math.sin(angle) * orbitR * 0.5;
    const bob = Math.sin(time * 3 + seed * 2) * baseRadius * 0.08;
    const alpha = maxAlpha * (0.5 + Math.sin(time * 2.5 + seed) * 0.3);
    const cs = crystalSize * (0.6 + Math.sin(time * 1.5 + seed * 3) * 0.2) * zoom;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(px, py + bob);
    ctx.rotate(time * 2 + seed);

    ctx.fillStyle = opts.color;
    ctx.beginPath();
    ctx.moveTo(0, -cs);
    ctx.lineTo(cs * 0.4, 0);
    ctx.lineTo(0, cs * 0.6);
    ctx.lineTo(-cs * 0.4, 0);
    ctx.closePath();
    ctx.fill();

    if (opts.glowColor) {
      ctx.fillStyle = opts.glowColor;
      ctx.beginPath();
      ctx.moveTo(0, -cs * 0.5);
      ctx.lineTo(cs * 0.15, 0);
      ctx.lineTo(0, cs * 0.3);
      ctx.lineTo(-cs * 0.15, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ============================================================================
// EMBER SPARKS (volcanic enemies – rising ember particles with trails)
// ============================================================================

export interface EmberSparkOptions {
  count?: number;
  speed?: number;
  color: string;
  coreColor?: string;
  maxAlpha?: number;
  sparkSize?: number;
}

export function drawEmberSparks(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  time: number,
  zoom: number,
  opts: EmberSparkOptions,
): void {
  const count = opts.count ?? 6;
  const speed = opts.speed ?? 1.5;
  const maxAlpha = opts.maxAlpha ?? 0.6;
  const sparkSize = (opts.sparkSize ?? 0.05) * baseRadius;

  for (let i = 0; i < count; i++) {
    const seed = i * 1.73;
    const phase = (time * speed + seed) % 1;
    const offsetX = Math.sin(seed * 5.1) * baseRadius * 0.7;
    const riseSpeed = 0.5 + Math.sin(seed * 3.3) * 0.3;
    const riseDist = phase * baseRadius * 1.6 * riseSpeed;
    const wobble = Math.sin(time * 4 + seed * 2.7) * baseRadius * 0.15;
    const px = cx + offsetX + wobble * phase;
    const py = cy - riseDist;
    const alpha = maxAlpha * (1 - phase) * (phase < 0.1 ? phase / 0.1 : 1);
    const sz = sparkSize * (1 - phase * 0.5) * zoom;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = opts.coreColor ?? "rgba(255, 255, 200, 0.9)";
    ctx.beginPath();
    ctx.arc(px, py, sz * 0.5, 0, TAU);
    ctx.fill();

    ctx.fillStyle = opts.color;
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, TAU);
    ctx.fill();

    if (phase < 0.7) {
      ctx.strokeStyle = opts.color.replace(/[\d.]+\)$/, `${alpha * 0.4})`);
      ctx.lineWidth = sz * 0.6;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - wobble * 0.3, py + riseDist * 0.15);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

// ============================================================================
// SHADOW WISPS (undead enemies – dark spectral tendrils)
// ============================================================================

export interface ShadowWispOptions {
  count?: number;
  speed?: number;
  color: string;
  maxAlpha?: number;
  wispLength?: number;
}

export function drawShadowWisps(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  time: number,
  zoom: number,
  opts: ShadowWispOptions,
): void {
  const count = opts.count ?? 4;
  const speed = opts.speed ?? 1.2;
  const maxAlpha = opts.maxAlpha ?? 0.35;
  const wispLen = (opts.wispLength ?? 0.4) * baseRadius;

  for (let i = 0; i < count; i++) {
    const seed = i * (TAU / count);
    const angle = seed + Math.sin(time * speed + i * 1.5) * 0.6;
    const startR = baseRadius * 0.4;
    const sx = cx + Math.cos(angle) * startR;
    const sy = cy + Math.sin(angle) * startR * 0.55;

    ctx.save();
    ctx.globalAlpha = maxAlpha * (0.5 + Math.sin(time * 2 + seed) * 0.3);
    ctx.strokeStyle = opts.color;
    ctx.lineWidth = (2 + Math.sin(time * 3 + seed) * 1) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy);

    const segs = 5;
    for (let s = 1; s <= segs; s++) {
      const t = s / segs;
      const endAngle = angle + Math.sin(time * speed * 1.5 + seed + s * 0.8) * 0.4;
      const r = startR + wispLen * t;
      const wx = cx + Math.cos(endAngle) * r + Math.sin(time * 2.5 + s) * baseRadius * 0.05;
      const wy = cy + Math.sin(endAngle) * r * 0.55;
      ctx.lineTo(wx, wy);
    }
    ctx.stroke();

    const tipR = baseRadius * 0.04 * zoom;
    const tipAngle = angle + Math.sin(time * speed * 1.5 + seed + 5 * 0.8) * 0.4;
    const tipDist = startR + wispLen;
    ctx.fillStyle = opts.color;
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(tipAngle) * tipDist,
      cy + Math.sin(tipAngle) * tipDist * 0.55,
      tipR,
      0,
      TAU,
    );
    ctx.fill();
    ctx.restore();
  }
}

// ============================================================================
// ARCANE SPARKLES (magic enemies – twinkling star particles)
// ============================================================================

export interface ArcaneSparkleOptions {
  count?: number;
  speed?: number;
  color: string;
  maxAlpha?: number;
  sparkleSize?: number;
}

export function drawArcaneSparkles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  time: number,
  zoom: number,
  opts: ArcaneSparkleOptions,
): void {
  const count = opts.count ?? 6;
  const speed = opts.speed ?? 2.0;
  const maxAlpha = opts.maxAlpha ?? 0.5;
  const sparkleSize = (opts.sparkleSize ?? 0.08) * baseRadius;

  for (let i = 0; i < count; i++) {
    const seed = i * 2.199;
    const angle = time * speed * 0.3 + seed;
    const r = baseRadius * (0.3 + Math.sin(time * 0.7 + seed * 1.4) * 0.35);
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r * 0.55;
    const twinkle = Math.sin(time * 6 + seed * 3.7);
    const alpha = maxAlpha * Math.max(0, twinkle);
    const sz = sparkleSize * (0.3 + Math.max(0, twinkle) * 0.7) * zoom;

    if (alpha <= 0.01) continue;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = opts.color;
    ctx.translate(px, py);

    ctx.beginPath();
    ctx.moveTo(0, -sz);
    ctx.lineTo(sz * 0.2, -sz * 0.2);
    ctx.lineTo(sz, 0);
    ctx.lineTo(sz * 0.2, sz * 0.2);
    ctx.lineTo(0, sz);
    ctx.lineTo(-sz * 0.2, sz * 0.2);
    ctx.lineTo(-sz, 0);
    ctx.lineTo(-sz * 0.2, -sz * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================================
// LEAF SWIRL (forest enemies – swirling leaves / nature particles)
// ============================================================================

export interface LeafSwirlOptions {
  count?: number;
  speed?: number;
  color: string;
  colorAlt?: string;
  maxAlpha?: number;
  leafSize?: number;
}

export function drawLeafSwirl(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  time: number,
  zoom: number,
  opts: LeafSwirlOptions,
): void {
  const count = opts.count ?? 5;
  const speed = opts.speed ?? 1.5;
  const maxAlpha = opts.maxAlpha ?? 0.45;
  const leafSize = (opts.leafSize ?? 0.08) * baseRadius;

  for (let i = 0; i < count; i++) {
    const seed = i * 1.886;
    const angle = time * speed + seed;
    const orbitR = baseRadius * (0.5 + Math.sin(time * 0.6 + seed) * 0.25);
    const px = cx + Math.cos(angle) * orbitR;
    const py = cy + Math.sin(angle) * orbitR * 0.45;
    const flutter = Math.sin(time * 5 + seed * 2.3);
    const alpha = maxAlpha * (0.4 + Math.sin(time * 1.5 + seed * 3) * 0.3);
    const ls = leafSize * (0.7 + flutter * 0.15) * zoom;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(px, py);
    ctx.rotate(angle + flutter * 0.5);

    ctx.fillStyle = i % 2 === 0 ? opts.color : (opts.colorAlt ?? opts.color);
    ctx.beginPath();
    ctx.moveTo(0, -ls);
    ctx.quadraticCurveTo(ls * 0.6, -ls * 0.2, ls * 0.1, ls * 0.5);
    ctx.quadraticCurveTo(0, ls * 0.3, -ls * 0.1, ls * 0.5);
    ctx.quadraticCurveTo(-ls * 0.6, -ls * 0.2, 0, -ls);
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================================
// WIND GUSTS (flying/storm enemies – sweeping wind streaks)
// ============================================================================

export interface WindGustOptions {
  count?: number;
  speed?: number;
  color: string;
  maxAlpha?: number;
  gustLength?: number;
}

export function drawWindGusts(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  baseRadius: number,
  time: number,
  zoom: number,
  opts: WindGustOptions,
): void {
  const count = opts.count ?? 4;
  const speed = opts.speed ?? 2.5;
  const maxAlpha = opts.maxAlpha ?? 0.3;
  const gustLen = (opts.gustLength ?? 0.5) * baseRadius;

  for (let i = 0; i < count; i++) {
    const seed = i * 1.571;
    const phase = (time * speed + seed) % 1;
    const startY = cy + (Math.sin(seed * 3.1) - 0.5) * baseRadius * 0.8;
    const startX = cx - baseRadius * 0.6;
    const progress = phase;
    const gx = startX + progress * baseRadius * 2;
    const gy = startY + Math.sin(time * 3 + seed) * baseRadius * 0.1;
    const alpha = maxAlpha * Math.sin(progress * Math.PI);
    const len = gustLen * (0.5 + Math.sin(time + seed) * 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = opts.color;
    ctx.lineWidth = (1.5 + Math.sin(time * 2 + seed) * 0.5) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(gx - len * 0.5, gy);
    ctx.quadraticCurveTo(
      gx,
      gy + Math.sin(time * 4 + seed) * baseRadius * 0.05,
      gx + len * 0.5,
      gy - Math.sin(time * 3 + seed * 2) * baseRadius * 0.03,
    );
    ctx.stroke();
    ctx.restore();
  }
}
