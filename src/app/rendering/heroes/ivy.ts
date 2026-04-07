import { ISO_Y_RATIO } from "../../constants/isometric";
import type { Position } from "../../types";
import {
  setShadowBlur,
  clearShadow,
  getPerformanceSettings,
  getScenePressure,
} from "../performance";

let _simpleGrad = false;

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  REGIONAL COLOR PALETTE SYSTEM                           ║
// ╚════════════════════════════════════════════════════════════════════════════╝

interface IvyPalette {
  glow: string;
  glowBright: string;
  glowWhite: string;
  glowDark: string;
  leaf: string;
  leafDark: string;
  vine: string;
  vineDark: string;
  rootVine: string;
  flower: string;
  pollen: string;
  shadowHex: string;
  eyePupil: string;
  canopy: [string, string, string, string];
  canopyStyle: "round" | "flat" | "conical" | "ember" | "weeping";
}

const IVY_PALETTES: Record<string, IvyPalette> = {
  desert: {
    canopy: ["#5a6b20", "#7a8a30", "#9aaa40", "#baca60"],
    canopyStyle: "flat",
    eyePupil: "#4a3a10",
    flower: "245,130,50",
    glow: "218,165,32",
    glowBright: "245,208,120",
    glowDark: "160,120,20",
    glowWhite: "255,235,180",
    leaf: "154,180,72",
    leafDark: "120,140,50",
    pollen: "255,200,50",
    rootVine: "100,85,40",
    shadowHex: "#daa520",
    vine: "140,160,60",
    vineDark: "90,110,40",
  },
  grassland: {
    canopy: ["#15803d", "#16a34a", "#22c55e", "#4ade80"],
    canopyStyle: "round",
    eyePupil: "#064e3b",
    flower: "236,72,153",
    glow: "52,211,153",
    glowBright: "167,243,208",
    glowDark: "5,150,105",
    glowWhite: "209,250,229",
    leaf: "74,222,128",
    leafDark: "34,197,94",
    pollen: "251,191,36",
    rootVine: "30,100,50",
    shadowHex: "#34d399",
    vine: "16,185,129",
    vineDark: "15,100,60",
  },
  swamp: {
    canopy: ["#0a3020", "#155038", "#207050", "#308a68"],
    canopyStyle: "weeping",
    eyePupil: "#0a2a20",
    flower: "160,80,200",
    glow: "0,200,180",
    glowBright: "100,240,220",
    glowDark: "0,120,100",
    glowWhite: "180,255,240",
    leaf: "40,140,80",
    leafDark: "25,100,55",
    pollen: "180,140,255",
    rootVine: "20,70,50",
    shadowHex: "#00c8b4",
    vine: "20,150,110",
    vineDark: "10,90,60",
  },
  volcanic: {
    canopy: ["#2a1a10", "#3a2518", "#4a3020", "#5a3a28"],
    canopyStyle: "ember",
    eyePupil: "#3a1005",
    flower: "255,60,20",
    glow: "255,100,30",
    glowBright: "255,160,80",
    glowDark: "180,50,10",
    glowWhite: "255,220,160",
    leaf: "120,50,30",
    leafDark: "80,30,15",
    pollen: "255,180,40",
    rootVine: "70,30,15",
    shadowHex: "#ff6420",
    vine: "160,70,20",
    vineDark: "100,40,15",
  },
  winter: {
    canopy: ["#1a4a3a", "#2a6050", "#3a7a68", "#5a9a88"],
    canopyStyle: "conical",
    eyePupil: "#102a50",
    flower: "180,140,220",
    glow: "100,180,255",
    glowBright: "180,220,255",
    glowDark: "40,100,180",
    glowWhite: "220,240,255",
    leaf: "160,210,240",
    leafDark: "100,170,210",
    pollen: "220,210,255",
    rootVine: "60,90,120",
    shadowHex: "#64b4ff",
    vine: "80,160,200",
    vineDark: "50,100,150",
  },
};

let P: IvyPalette = IVY_PALETTES.grassland;

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  MORPH TRANSITION SYSTEM                                 ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const MORPH_DURATION_MS = 1200;

function getMorphProgress(abilityEnd: number): number {
  const now = Date.now();
  const remaining = abilityEnd - now;
  if (remaining <= 0) {
    return 1;
  }
  return 1 - remaining / MORPH_DURATION_MS;
}

function drawMorphTransition(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  morphT: number
) {
  const coverage = morphT;

  // Vine tendrils wrapping inward from edges
  const tendrilCount = Math.floor(6 + coverage * 14);
  for (let i = 0; i < tendrilCount; i++) {
    const angle = (i / tendrilCount) * Math.PI * 2 + time * 0.5;
    const outerR = s * 0.65;
    const innerR = s * (0.65 - coverage * 0.55);
    const ox = x + Math.cos(angle) * outerR;
    const oy = y + Math.sin(angle) * outerR * 0.5;
    const ix = x + Math.cos(angle + coverage * 0.5) * innerR;
    const iy = y + Math.sin(angle + coverage * 0.5) * innerR * 0.5;
    const sway = Math.sin(time * 4 + i * 1.3) * s * 0.025 * coverage;

    ctx.strokeStyle = `rgba(${P.vine},${0.2 + coverage * 0.5})`;
    ctx.lineWidth = (1.5 + coverage * 2) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.quadraticCurveTo((ox + ix) / 2 + sway, (oy + iy) / 2 + sway, ix, iy);
    ctx.stroke();

    if (i % 2 === 0) {
      ctx.fillStyle = `rgba(${P.leaf},${0.3 + coverage * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(ix, iy, s * 0.01, s * 0.005, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Converging leaf particles
  const leafCount = Math.floor(coverage * 16);
  for (let i = 0; i < leafCount; i++) {
    const phase = (time * 1.5 + i * 0.25) % 1;
    const angle = (i / Math.max(leafCount, 1)) * Math.PI * 2 + time * 0.8;
    const dist = s * (0.5 * (1 - coverage * 0.8) + (1 - phase) * 0.2);
    const lx = x + Math.cos(angle) * dist;
    const ly = y + Math.sin(angle) * dist * 0.5;
    const lAlpha = coverage * Math.sin(phase * Math.PI) * 0.5;

    ctx.fillStyle = `rgba(${P.leaf},${lAlpha})`;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(time * 3 + i * 1.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.01 * zoom, s * 0.004 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bright flash at peak coverage (>0.85)
  if (coverage > 0.85) {
    const flashIntensity = (coverage - 0.85) / 0.15;
    const flashAlpha = flashIntensity * 0.6;
    const flashGrad = ctx.createRadialGradient(x, y, 0, x, y, s * 0.5);
    flashGrad.addColorStop(0, `rgba(${P.glowWhite},${flashAlpha})`);
    flashGrad.addColorStop(0.4, `rgba(${P.glowBright},${flashAlpha * 0.5})`);
    flashGrad.addColorStop(1, `rgba(${P.glow},0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  NORMAL FORM ORCHESTRATOR                                ║
// ╚════════════════════════════════════════════════════════════════════════════╝

function drawNormalFormFull(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  atkPow: number,
  atkBurst: number
) {
  const naturePulse = Math.sin(time * 2.5) * 0.5 + 0.5 + atkBurst * 0.25;
  const breathe = Math.sin(time * 1.8) * (3.5 + atkBurst * 3);
  const idleSway =
    Math.sin(time * 0.8) * s * (0.018 + atkBurst * 0.008) +
    Math.sin(time * 1.3 + 0.7) * s * 0.006;
  const hover = Math.sin(time * 1.5) * s * 0.02;
  const leafRustle = Math.sin(time * 3) * (0.15 + atkBurst * 0.15);
  const mossGlow = 0.5 + Math.sin(time * 2) * 0.2 + atkBurst * 0.3;
  const magicPulse = Math.sin(time * 3.5) * 0.5 + 0.5;
  const bx =
    x +
    idleSway +
    (isAttacking ? Math.sin(atkPow * Math.PI * 5) * s * 0.015 : 0);
  const by = y + hover;

  if (!_simpleGrad) {
    drawMagicCircle(ctx, x, y, s, time, zoom, naturePulse, atkBurst);
  }
  drawRootSystem(ctx, x, y, s, time, zoom, naturePulse, atkBurst);
  drawVineTentacles(ctx, x, y, s, time, zoom, naturePulse, atkBurst);
  drawLeafCape(ctx, bx, by, s, time, zoom, naturePulse, atkBurst);
  drawSkirt(ctx, bx, by, s, time, zoom, naturePulse, atkBurst);
  drawBody(ctx, bx, by, s, breathe, time, zoom, naturePulse, atkBurst);
  drawBranchCorset(ctx, bx, by, s, time, zoom, naturePulse, mossGlow, atkBurst);
  drawShoulders(ctx, bx, by, s, time, zoom, naturePulse, mossGlow, atkBurst);
  drawArms(ctx, bx, by, s, time, zoom, isAttacking, atkBurst);
  drawCrookedStaff(
    ctx,
    bx,
    by,
    s,
    time,
    zoom,
    naturePulse,
    magicPulse,
    atkBurst
  );
  drawHead(ctx, bx, by, s, time, zoom, naturePulse, magicPulse);
  drawHair(ctx, bx, by, s, time, zoom, naturePulse, atkBurst);
  drawCrown(ctx, bx, by, s, time, zoom, naturePulse, leafRustle, atkBurst);
  if (!_simpleGrad) {
    drawNatureAura(
      ctx,
      x,
      y,
      s,
      time,
      naturePulse,
      isAttacking,
      zoom,
      atkBurst
    );
    drawMagicParticles(ctx, x, y, s, time, zoom, naturePulse, atkBurst);
  }
  if (isAttacking) {
    drawAttackVines(ctx, x, y, s, atkBurst, time, zoom);
  }
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  MAIN ENTRY POINT                                        ║
// ╚════════════════════════════════════════════════════════════════════════════╝

export function drawIvyHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase?: number,
  targetPos?: Position,
  abilityActive?: boolean,
  mapTheme?: string,
  abilityEnd?: number
) {
  P = IVY_PALETTES[mapTheme ?? "grassland"] ?? IVY_PALETTES.grassland;
  const perf = getPerformanceSettings();
  const pressure = getScenePressure();
  _simpleGrad = perf.simplifiedGradients || pressure.forceSimplifiedGradients;

  const s = size;
  const isColossus = abilityActive ?? false;
  const atkPhase = attackPhase ?? 0;
  const isAttacking = atkPhase > 0 || isColossus;
  const atkPow = isColossus
    ? Math.max(atkPhase, 0.6)
    : isAttacking
      ? atkPhase
      : 0;
  const atkBurst = Math.sin(atkPow * Math.PI);
  const hasActiveAttack = atkPhase > 0;

  const morphT = abilityEnd != null ? getMorphProgress(abilityEnd) : 1;
  const isMorphing = morphT > 0 && morphT < 1;

  // Morphing TO Colossus
  if (isColossus && isMorphing) {
    if (morphT < 0.5) {
      drawNormalFormFull(
        ctx,
        x,
        y,
        s,
        time,
        zoom,
        isAttacking,
        atkPow,
        atkBurst
      );
    } else {
      drawColossusForm(ctx, x, y, s, time, zoom, hasActiveAttack, atkBurst);
    }
    drawMorphTransition(ctx, x, y, s, time, zoom, morphT);
    return;
  }

  // Morphing FROM Colossus back to Warden
  if (!isColossus && isMorphing) {
    const reverseT = 1 - morphT;
    if (reverseT > 0.5) {
      drawColossusForm(ctx, x, y, s, time, zoom, hasActiveAttack, atkBurst);
    } else {
      drawNormalFormFull(
        ctx,
        x,
        y,
        s,
        time,
        zoom,
        isAttacking,
        atkPow,
        atkBurst
      );
    }
    drawMorphTransition(ctx, x, y, s, time, zoom, reverseT);
    return;
  }

  // Steady Colossus
  if (isColossus) {
    drawColossusForm(ctx, x, y, s, time, zoom, hasActiveAttack, atkBurst);
    return;
  }

  // Steady Warden
  drawNormalFormFull(ctx, x, y, s, time, zoom, isAttacking, atkPow, atkBurst);
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                         COLOSSUS FORM                                    ║
// ║  3D isometric ancient tree guardian — organic blob rendering             ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ─── Organic Blob Helper ────────────────────────────────────────────────────

function drawOrganicBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  bumps: number,
  bumpAmp: number,
  seed: number,
  rotation?: number
) {
  const rot = rotation ?? 0;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < bumps; i++) {
    const a = (i / bumps) * Math.PI * 2;
    const w =
      1 +
      Math.sin(seed * 7.3 + i * 4.1) * bumpAmp +
      Math.sin(seed * 3.7 + i * 2.9) * bumpAmp * 0.5;
    pts.push({
      x: cx + Math.cos(a + rot) * rx * w,
      y: cy + Math.sin(a + rot) * ry * w,
    });
  }
  const last = pts.at(-1);
  ctx.beginPath();
  ctx.moveTo((pts[0].x + last.x) / 2, (pts[0].y + last.y) / 2);
  for (let i = 0; i < pts.length; i++) {
    const nxt = pts[(i + 1) % pts.length];
    ctx.quadraticCurveTo(
      pts[i].x,
      pts[i].y,
      (pts[i].x + nxt.x) / 2,
      (pts[i].y + nxt.y) / 2
    );
  }
  ctx.closePath();
}

// ─── COLOSSUS: Form Orchestrator ────────────────────────────────────────────

function drawColossusForm(
  ctx: CanvasRenderingContext2D,
  x: number,
  yIn: number,
  s: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  atkBurst: number
) {
  const y = yIn + s * 0.12;
  const pulse = Math.sin(time * 1.5) * 0.5 + 0.5;
  const heavySway = Math.sin(time * 0.6) * s * 0.008;
  const bx = x + heavySway;

  // Organic upper-body sway — two layered sine waves for natural, animalistic movement
  const canopySway =
    Math.sin(time * 1.2) * 0.04 +
    Math.sin(time * 0.7) * 0.025 +
    atkBurst * Math.sin(time * 4) * 0.06;
  const pivotY = y + s * 0.1;

  // Ground plane: flat effects behind all vertical elements
  if (!_simpleGrad) {
    drawColossusGroundEffect(ctx, x, y, s, time, zoom, pulse, atkBurst);
    drawColossusEnergyPulse(ctx, x, y, s, time, zoom, pulse, atkBurst);
  }
  if (isAttacking) {
    drawColossusAttackWave(ctx, x, y, s, atkBurst, time, zoom);
  }

  // Base: roots and atmospheric particles
  drawColossusRootLegs(ctx, bx, y, s, time, zoom, atkBurst);
  if (!_simpleGrad) {
    drawColossusVortex(ctx, x, y, s, time, zoom, atkBurst);
  }

  // Trunk body
  drawColossusTrunkBody(ctx, bx, y, s, time, zoom, pulse, atkBurst);
  drawColossusBarkPlates(ctx, bx, y, s, time, zoom, pulse);

  // Face and canopy
  ctx.save();
  ctx.translate(bx, pivotY);
  ctx.rotate(canopySway);
  ctx.translate(-bx, -pivotY);
  drawColossusFace(ctx, bx, y, s, time, zoom, pulse);
  drawColossusCanopy(ctx, bx, y, s, time, zoom, pulse, atkBurst);
  ctx.restore();

  // Arms rendered above everything (including canopy)
  drawColossusBranchArms(ctx, bx, y, s, time, zoom, atkBurst, pulse);
}

// ─── COLOSSUS: Ground Effect ─────────────────────────────────────────────────

function drawColossusGroundEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  pulse: number,
  atkBurst: number
) {
  const groundY = y + s * 0.32;
  const isoY = ISO_Y_RATIO;

  // Outer soft ambient occlusion — very wide, gentle fade
  const aoOuterRx = s * (0.82 + atkBurst * 0.12);
  const aoOuterGrad = ctx.createRadialGradient(
    x,
    groundY,
    s * 0.1,
    x,
    groundY,
    aoOuterRx
  );
  aoOuterGrad.addColorStop(0, "rgba(0,0,0,0.12)");
  aoOuterGrad.addColorStop(0.6, "rgba(0,0,0,0.04)");
  aoOuterGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aoOuterGrad;
  ctx.beginPath();
  ctx.ellipse(x, groundY, aoOuterRx, aoOuterRx * isoY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Core ambient occlusion shadow (isometric ellipse)
  const aoRx = s * (0.65 + atkBurst * 0.1);
  const aoGrad = ctx.createRadialGradient(
    x,
    groundY,
    s * 0.05,
    x,
    groundY,
    aoRx
  );
  aoGrad.addColorStop(0, "rgba(0,0,0,0.45)");
  aoGrad.addColorStop(0.3, "rgba(0,0,0,0.25)");
  aoGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
  aoGrad.addColorStop(0.85, "rgba(0,0,0,0.03)");
  aoGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aoGrad;
  ctx.beginPath();
  ctx.ellipse(x, groundY, aoRx, aoRx * isoY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Radiating root impressions in the ground (isometric Y compression)
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + time * 0.04;
    const len = s * (0.4 + Math.sin(time * 0.3 + i * 0.9) * 0.06);
    const tipX = x + Math.cos(a) * len;
    const tipY = groundY + Math.sin(a) * len * isoY;
    const midX = x + Math.cos(a) * len * 0.5;
    const midY = groundY + Math.sin(a) * len * 0.5 * isoY + s * 0.006;
    ctx.strokeStyle = `rgba(0,0,0,${0.12 + pulse * 0.04})`;
    ctx.lineWidth = (2.8 + Math.sin(i * 1.5) * 0.8) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();
    // Highlight edge offset toward top-left light
    ctx.strokeStyle = `rgba(${P.rootVine},${0.07 + pulse * 0.03})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - 0.5, groundY - 0.5);
    ctx.quadraticCurveTo(midX - 0.5, midY - 0.5, tipX - 0.5, tipY - 0.5);
    ctx.stroke();
    // Glowing tip at end of root impression
    if (i % 3 === 0) {
      ctx.fillStyle = `rgba(${P.glow},${0.12 + pulse * 0.06})`;
      ctx.beginPath();
      ctx.arc(tipX, tipY, s * 0.005, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Magic circle runes with glow — proper isometric squash
  const circleR = s * (0.52 + atkBurst * 0.12);
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(1, isoY);
  ctx.rotate(time * 0.15);

  setShadowBlur(ctx, 10 * zoom, P.shadowHex);
  ctx.strokeStyle = `rgba(${P.glow},${0.22 + pulse * 0.12})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, circleR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${P.glowBright},${0.14 + pulse * 0.07})`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, circleR * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${P.glowDark},${0.1 + pulse * 0.05})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, circleR * 1.18, 0, Math.PI * 2);
  ctx.stroke();

  // Inner detail ring with dashed style
  ctx.setLineDash([s * 0.03, s * 0.02]);
  ctx.strokeStyle = `rgba(${P.glow},${0.08 + pulse * 0.04})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, circleR * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  clearShadow(ctx);

  // Rune diamonds with connecting arc segments
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rx = Math.cos(a) * circleR * 0.9;
    const ry = Math.sin(a) * circleR * 0.9;
    const runeA =
      (0.35 + Math.sin(time * 2.5 + i * 1.4) * 0.2) * (0.6 + pulse * 0.4);
    setShadowBlur(ctx, 5 * zoom, P.shadowHex);
    ctx.fillStyle = `rgba(${P.glowBright},${runeA})`;
    const dSize = s * 0.028;
    ctx.beginPath();
    ctx.moveTo(rx, ry - dSize);
    ctx.lineTo(rx + dSize * 0.6, ry);
    ctx.lineTo(rx, ry + dSize * 0.8);
    ctx.lineTo(rx - dSize * 0.6, ry);
    ctx.closePath();
    ctx.fill();
    clearShadow(ctx);

    // Small connecting arc between adjacent rune diamonds
    if (i % 2 === 0) {
      const nextA = ((i + 1) / 12) * Math.PI * 2;
      const nrx = Math.cos(nextA) * circleR * 0.9;
      const nry = Math.sin(nextA) * circleR * 0.9;
      ctx.strokeStyle = `rgba(${P.glow},${runeA * 0.4})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.quadraticCurveTo(
        (rx + nrx) * 0.5 * 0.85,
        (ry + nry) * 0.5 * 0.85,
        nrx,
        nry
      );
      ctx.stroke();
    }
  }

  // Counter-rotating inner rune ring
  ctx.save();
  ctx.rotate(-time * 0.25);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const irx = Math.cos(a) * circleR * 0.55;
    const iry = Math.sin(a) * circleR * 0.55;
    const irAlpha =
      (0.2 + Math.sin(time * 3 + i * 2.1) * 0.1) * (0.5 + pulse * 0.3);
    ctx.fillStyle = `rgba(${P.glow},${irAlpha})`;
    ctx.beginPath();
    ctx.arc(irx, iry, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
    // Cross rune mark
    ctx.strokeStyle = `rgba(${P.glowBright},${irAlpha * 0.7})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(irx - s * 0.01, iry);
    ctx.lineTo(irx + s * 0.01, iry);
    ctx.moveTo(irx, iry - s * 0.01);
    ctx.lineTo(irx, iry + s * 0.01);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();

  // Ground cracks with highlight edge (isometric Y compression)
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + time * 0.1;
    const len = s * (0.34 + Math.sin(time * 2 + i * 1.8) * 0.06);
    const crackAlpha = 0.16 + Math.sin(time * 3 + i) * 0.06 + atkBurst * 0.08;
    const tipX = x + Math.cos(a) * len;
    const tipY = groundY + Math.sin(a) * len * isoY;
    const midX = x + Math.cos(a) * len * 0.5;
    const midY = groundY + Math.sin(a) * len * 0.5 * isoY;
    ctx.strokeStyle = `rgba(10,6,2,${crackAlpha + 0.08})`;
    ctx.lineWidth = (2.2 + Math.sin(time * 4 + i * 2) * 0.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${P.glow},${crackAlpha * 0.4})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - 0.7, groundY - 0.7);
    ctx.quadraticCurveTo(midX - 0.7, midY - 0.7, tipX - 0.7, tipY - 0.7);
    ctx.stroke();
    // Forked sub-cracks at tips
    if (i % 3 === 0) {
      for (let f = 0; f < 2; f++) {
        const forkA = a + (f === 0 ? 0.3 : -0.3);
        const forkLen = s * 0.06;
        const fTipX = tipX + Math.cos(forkA) * forkLen;
        const fTipY = tipY + Math.sin(forkA) * forkLen * isoY;
        ctx.strokeStyle = `rgba(10,6,2,${crackAlpha * 0.6})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(fTipX, fTipY);
        ctx.stroke();
      }
    }
  }

  // Scattered ground moss patches (isometric flat ellipses)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.4;
    const dist = s * (0.32 + Math.sin(i * 2.7) * 0.08);
    const mx = x + Math.cos(a) * dist;
    const my = groundY + Math.sin(a) * dist * isoY;
    const mr = s * (0.018 + Math.sin(i * 1.9) * 0.005);
    ctx.fillStyle = `rgba(${P.leafDark},${0.15 + pulse * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(mx, my, mr, mr * isoY, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── COLOSSUS: Root Legs ─────────────────────────────────────────────────────

function drawColossusRootLegs(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  atkBurst: number
) {
  const isoY = ISO_Y_RATIO;
  const groundY = y + s * 0.32;
  const hipOriginY = y + s * 0.1;
  const hipRadius = s * 0.13;
  const footRadius = s * 0.52;

  // 6 legs evenly spaced around an isometric ellipse (60° apart)
  const LEG_COUNT = 6;
  const LEG_SEEDS = [1.2, 3.4, 2.1, 4.5, 5.6, 7.8];
  const LEG_WIDTHS = [0.08, 0.07, 0.065, 0.065, 0.07, 0.08];

  for (let i = 0; i < LEG_COUNT; i++) {
    const baseAngle = (i / LEG_COUNT) * Math.PI * 2 - Math.PI * 0.5;
    const seed = LEG_SEEDS[i];
    const rootWidth = LEG_WIDTHS[i];

    // Tripod gait: alternate legs (even/odd) lift on opposite phases
    const gaitPhase = i % 2 === 0 ? 0 : Math.PI;
    const walkCycle = Math.sin(time * 2.2 + gaitPhase);
    const isLifted = walkCycle > 0;
    const liftAmount = isLifted ? walkCycle * s * 0.04 : 0;
    const strideAngleShift = Math.sin(time * 2.2 + gaitPhase) * 0.06;

    const legAngle = baseAngle + strideAngleShift;

    // Hip: on a small isometric ellipse at the trunk base
    const hipX = x + Math.cos(legAngle) * hipRadius;
    const hipY = hipOriginY + Math.sin(legAngle) * hipRadius * isoY;

    // Foot: on a larger isometric ellipse at ground level
    const footX = x + Math.cos(legAngle) * footRadius;
    const footY = groundY + Math.sin(legAngle) * footRadius * isoY - liftAmount;

    // Knee: arches upward and outward from the hip–foot midpoint
    const kneeMidX = (hipX + footX) / 2;
    const kneeMidY = (hipY + footY) / 2;
    const kneeRise = s * 0.2 + liftAmount * 0.5;
    const kneeBob = Math.sin(time * 2.2 + gaitPhase + 0.5) * s * 0.015;
    // Push knee outward along the leg's radial direction
    const kneeOutward = s * 0.08;
    const kneeX = kneeMidX + Math.cos(legAngle) * kneeOutward;
    const kneeY =
      kneeMidY + Math.sin(legAngle) * kneeOutward * isoY - kneeRise - kneeBob;

    // Draw the two leg segments (upper + lower)
    drawRootLegSegment(ctx, hipX, hipY, kneeX, kneeY, s, rootWidth, 1, zoom);
    drawRootLegSegment(
      ctx,
      kneeX,
      kneeY,
      footX,
      footY,
      s,
      rootWidth * 0.8,
      0.7,
      zoom
    );

    // Glowing vein along entire leg
    setShadowBlur(ctx, 5 * zoom, P.shadowHex);
    ctx.strokeStyle = `rgba(${P.glow},${0.3 + Math.sin(time * 2.5 + i) * 0.12})`;
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.quadraticCurveTo(kneeX, kneeY, footX, footY);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${P.glowBright},${0.1 + Math.sin(time * 3 + i * 0.7) * 0.06})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.quadraticCurveTo(kneeX, kneeY, footX, footY);
    ctx.stroke();
    clearShadow(ctx);

    // Knee joint knob
    const kneeR = s * 0.032;
    const kneeGrad = ctx.createRadialGradient(
      kneeX - kneeR * 0.3,
      kneeY - kneeR * 0.3,
      kneeR * 0.1,
      kneeX,
      kneeY,
      kneeR
    );
    kneeGrad.addColorStop(0, "#7a5830");
    kneeGrad.addColorStop(0.5, "#5a4020");
    kneeGrad.addColorStop(1, "#2a1a08");
    ctx.fillStyle = kneeGrad;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, kneeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${P.glow},${0.12 + Math.sin(time * 2 + i) * 0.06})`;
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, kneeR * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Foot: organic blob gripping the ground
    const footRx = s * 0.05;
    const footRy = footRx * isoY;
    ctx.fillStyle = "#2d1e0e";
    drawOrganicBlob(ctx, footX, footY, footRx, footRy, 8, 0.22, seed + 10);
    ctx.fill();
    ctx.fillStyle = "rgba(90,64,32,0.15)";
    drawOrganicBlob(
      ctx,
      footX - footRx * 0.15,
      footY - footRy * 0.25,
      footRx * 0.45,
      footRy * 0.35,
      6,
      0.15,
      seed + 11
    );
    ctx.fill();

    // Small root tendrils radiating outward from foot
    for (let sr = 0; sr < 3; sr++) {
      const subA = legAngle + (sr - 1) * 0.45 + Math.sin(time * 0.5 + sr) * 0.1;
      const subLen = s * (0.035 + sr * 0.006);
      const subTipX = footX + Math.cos(subA) * subLen;
      const subTipY = footY + Math.sin(subA) * subLen * isoY + s * 0.003;
      ctx.strokeStyle = "rgba(45,30,14,0.55)";
      ctx.lineWidth = (1.5 - sr * 0.2) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(footX, footY);
      ctx.quadraticCurveTo(
        (footX + subTipX) / 2,
        (footY + subTipY) / 2 + s * 0.002,
        subTipX,
        subTipY
      );
      ctx.stroke();
    }

    // Ground contact shadow under foot (fades when lifted)
    ctx.fillStyle = `rgba(0,0,0,${isLifted ? 0.06 : 0.15})`;
    ctx.beginPath();
    ctx.ellipse(
      footX,
      groundY + Math.sin(legAngle) * footRadius * isoY + s * 0.005,
      footRx * 1.1,
      footRy * 0.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Hip joint knob
    const hipR = s * 0.036;
    const hipGrad = ctx.createRadialGradient(
      hipX - hipR * 0.3,
      hipY - hipR * 0.3,
      hipR * 0.1,
      hipX,
      hipY,
      hipR
    );
    hipGrad.addColorStop(0, "#7a5830");
    hipGrad.addColorStop(0.4, "#5a4020");
    hipGrad.addColorStop(0.8, "#3a2810");
    hipGrad.addColorStop(1, "#1a1208");
    ctx.fillStyle = hipGrad;
    ctx.beginPath();
    ctx.arc(hipX, hipY, hipR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${P.glow},${0.1 + Math.sin(time * 2 + i) * 0.05})`;
    ctx.beginPath();
    ctx.arc(hipX, hipY, hipR * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Moss tuft on upper segment of every other leg
    if (i % 2 === 0) {
      const mossMidX = (hipX + kneeX) / 2;
      const mossMidY = (hipY + kneeY) / 2;
      ctx.fillStyle = `rgba(${P.leafDark},${0.2 + Math.sin(time + i) * 0.06})`;
      drawOrganicBlob(
        ctx,
        mossMidX,
        mossMidY - s * 0.01,
        s * 0.018,
        s * 0.01,
        7,
        0.2,
        seed + 20 + i
      );
      ctx.fill();
    }
  }
}

// ─── Root Leg Segment: tapered bark trapezoid between two joints ─────────────

function drawRootLegSegment(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  s: number,
  widthFactor: number,
  taperStart: number,
  zoom: number
) {
  const segCount = 3;
  for (let seg = 0; seg < segCount; seg++) {
    const t0 = seg / segCount;
    const t1 = (seg + 1) / segCount;
    const px0 = x0 + (x1 - x0) * t0;
    const py0 = y0 + (y1 - y0) * t0;
    const px1 = x0 + (x1 - x0) * t1;
    const py1 = y0 + (y1 - y0) * t1;
    const w0 = s * widthFactor * (taperStart - t0 * 0.35);
    const w1 = s * widthFactor * (taperStart - t1 * 0.35);
    const angle = Math.atan2(py1 - py0, px1 - px0);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);

    const segGrad = ctx.createLinearGradient(
      px0 + nx * w0,
      py0 + ny * w0,
      px0 - nx * w0,
      py0 - ny * w0
    );
    segGrad.addColorStop(0, "#7a5830");
    segGrad.addColorStop(0.3, "#5a4020");
    segGrad.addColorStop(0.7, "#3d2a14");
    segGrad.addColorStop(1, "#1a1208");
    ctx.fillStyle = segGrad;
    ctx.beginPath();
    ctx.moveTo(px0 + nx * w0, py0 + ny * w0);
    ctx.lineTo(px1 + nx * w1, py1 + ny * w1);
    ctx.lineTo(px1 - nx * w1, py1 - ny * w1);
    ctx.lineTo(px0 - nx * w0, py0 - ny * w0);
    ctx.closePath();
    ctx.fill();

    // Bark ridge
    if (seg > 0) {
      const ridgeMidX = (px0 + px1) / 2;
      const ridgeMidY = (py0 + py1) / 2;
      ctx.strokeStyle = "rgba(15,10,4,0.4)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(ridgeMidX + nx * w0 * 0.7, ridgeMidY + ny * w0 * 0.7);
      ctx.lineTo(ridgeMidX - nx * w0 * 0.7, ridgeMidY - ny * w0 * 0.7);
      ctx.stroke();
    }
  }
}

// ─── COLOSSUS: Trunk Body ────────────────────────────────────────────────────

function drawColossusTrunkBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  pulse: number,
  atkBurst: number
) {
  const trunkTop = y - s * 0.28;
  const trunkBot = y + s * 0.15;
  const trunkH = trunkBot - trunkTop;
  const topW = s * 0.17;
  const botW = s * 0.22;

  // Stacked organic blob cross-sections creating barrel trunk
  const sections = 6;
  for (let i = 0; i < sections; i++) {
    const t = i / (sections - 1);
    const secY = trunkTop + trunkH * t;
    const secRx = s * (0.17 + t * 0.06 + Math.sin(i * 1.3) * 0.008);
    const secRy = s * (0.032 + t * 0.01);
    const secSeed = i * 2.7 + 11;
    const hlX = x - secRx * 0.3;
    const hlY = secY - secRy * 0.4;
    const secGrad = ctx.createRadialGradient(
      hlX,
      hlY,
      s * 0.01,
      x,
      secY,
      secRx
    );
    secGrad.addColorStop(0, "#6a5028");
    secGrad.addColorStop(0.25, "#5a4020");
    secGrad.addColorStop(0.5, "#4a3418");
    secGrad.addColorStop(0.75, "#3a2810");
    secGrad.addColorStop(1, "#241a0a");
    ctx.fillStyle = secGrad;
    drawOrganicBlob(
      ctx,
      x + Math.sin(i * 1.7) * s * 0.005,
      secY,
      secRx,
      secRy,
      12,
      0.12,
      secSeed
    );
    ctx.fill();
  }

  // Connecting trunk fill with 3D radial gradient
  const trunkGrad = ctx.createRadialGradient(
    x - s * 0.06,
    y - s * 0.1,
    s * 0.02,
    x,
    y - s * 0.05,
    s * 0.25
  );
  trunkGrad.addColorStop(0, "rgba(90,64,32,0.5)");
  trunkGrad.addColorStop(0.3, "rgba(74,52,24,0.4)");
  trunkGrad.addColorStop(0.6, "rgba(61,42,20,0.3)");
  trunkGrad.addColorStop(1, "rgba(36,26,10,0.2)");
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(x - topW, trunkTop);
  ctx.bezierCurveTo(
    x - topW * 1.15,
    trunkTop + trunkH * 0.3,
    x - botW * 1.1,
    trunkBot - s * 0.06,
    x - botW,
    trunkBot
  );
  ctx.lineTo(x + botW, trunkBot);
  ctx.bezierCurveTo(
    x + botW * 1.1,
    trunkBot - s * 0.06,
    x + topW * 1.15,
    trunkTop + trunkH * 0.3,
    x + topW,
    trunkTop
  );
  ctx.closePath();
  ctx.fill();

  // Deep bark grooves (dark shadow line + highlight line offset 1px)
  for (let i = 0; i < 7; i++) {
    const gx = x - topW * 0.7 + i * topW * 0.23;
    const wobble = Math.sin(i * 2.3 + 0.5) * s * 0.01;
    ctx.strokeStyle = "rgba(15,10,4,0.5)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(gx + wobble, trunkTop + s * 0.02);
    ctx.bezierCurveTo(
      gx + wobble - s * 0.005,
      trunkTop + trunkH * 0.35,
      gx - wobble + s * 0.008,
      trunkTop + trunkH * 0.65,
      gx - wobble * 0.5,
      trunkBot - s * 0.02
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(100,75,40,0.18)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(gx + wobble - 1, trunkTop + s * 0.02 - 0.5);
    ctx.bezierCurveTo(
      gx + wobble - s * 0.005 - 1,
      trunkTop + trunkH * 0.35 - 0.5,
      gx - wobble + s * 0.008 - 1,
      trunkTop + trunkH * 0.65 - 0.5,
      gx - wobble * 0.5 - 1,
      trunkBot - s * 0.02 - 0.5
    );
    ctx.stroke();
  }

  // Horizontal bark crack rings
  for (let i = 0; i < 5; i++) {
    const cy = trunkTop + s * 0.05 + i * s * 0.07;
    const cw = topW * (0.6 + i * 0.08);
    ctx.strokeStyle = "rgba(15,10,4,0.35)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - cw, cy);
    ctx.quadraticCurveTo(
      x + Math.sin(i * 1.7) * s * 0.02,
      cy + s * 0.004,
      x + cw,
      cy
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(90,64,32,0.15)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - cw, cy - 0.8);
    ctx.quadraticCurveTo(
      x + Math.sin(i * 1.7) * s * 0.02,
      cy + s * 0.004 - 0.8,
      x + cw,
      cy - 0.8
    );
    ctx.stroke();
  }

  // Glowing veins with shadowBlur glow
  const veinAlpha = 0.3 + pulse * 0.25 + atkBurst * 0.15;
  setShadowBlur(ctx, 6 * zoom, P.shadowHex);
  ctx.strokeStyle = `rgba(${P.glow},${veinAlpha})`;
  ctx.lineWidth = 1.8 * zoom;
  const veins = [
    { ex: -0.14, ey: 0.08, sx: -0.08, sy: -0.22 },
    { ex: 0.12, ey: 0.1, sx: 0.06, sy: -0.2 },
    { ex: -0.05, ey: 0.05, sx: -0.02, sy: -0.25 },
    { ex: 0.18, ey: 0, sx: 0.1, sy: -0.18 },
    { ex: -0.18, ey: 0.02, sx: -0.1, sy: -0.15 },
  ];
  for (const v of veins) {
    ctx.beginPath();
    ctx.moveTo(x + v.sx * s, y + v.sy * s);
    ctx.bezierCurveTo(
      x + (v.sx + v.ex) * 0.4 * s,
      y + (v.sy + v.ey) * 0.4 * s + s * 0.02,
      x + (v.sx + v.ex) * 0.6 * s,
      y + (v.sy + v.ey) * 0.6 * s - s * 0.01,
      x + v.ex * s,
      y + v.ey * s
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Knothole: concentric dark ellipses with inner glow
  ctx.fillStyle = "#0e0a04";
  ctx.beginPath();
  ctx.ellipse(
    x + s * 0.08,
    y - s * 0.02,
    s * 0.03,
    s * 0.022,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#1a1208";
  ctx.beginPath();
  ctx.ellipse(
    x + s * 0.08,
    y - s * 0.02,
    s * 0.022,
    s * 0.015,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  setShadowBlur(ctx, 3 * zoom, P.shadowHex);
  ctx.fillStyle = `rgba(${P.glow},${0.18 + pulse * 0.12})`;
  ctx.beginPath();
  ctx.ellipse(
    x + s * 0.08,
    y - s * 0.02,
    s * 0.014,
    s * 0.009,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  clearShadow(ctx);

  // Moss: organic blob shapes with highlight on top
  const mossPts = [
    { dx: -0.15, dy: -0.05, r: 0.028, seed: 20 },
    { dx: 0.14, dy: 0.06, r: 0.022, seed: 22 },
    { dx: -0.1, dy: 0.1, r: 0.02, seed: 24 },
    { dx: 0.04, dy: -0.15, r: 0.017, seed: 26 },
  ];
  for (const m of mossPts) {
    const mx = x + m.dx * s;
    const my = y + m.dy * s;
    const mr = s * m.r;
    ctx.fillStyle = `rgba(${P.leafDark},${0.25 + pulse * 0.1})`;
    drawOrganicBlob(ctx, mx, my, mr, mr * 0.55, 8, 0.2, m.seed);
    ctx.fill();
    ctx.fillStyle = `rgba(${P.leaf},${0.15 + pulse * 0.08})`;
    drawOrganicBlob(
      ctx,
      mx - mr * 0.1,
      my - mr * 0.15,
      mr * 0.6,
      mr * 0.3,
      7,
      0.15,
      m.seed + 5
    );
    ctx.fill();
  }

  // Contour edges: dark on shadow side (right), bright on highlight side (left)
  ctx.strokeStyle = "rgba(20,14,6,0.45)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + topW - s * 0.01, trunkTop + s * 0.04);
  ctx.bezierCurveTo(
    x + topW * 1.05,
    trunkTop + trunkH * 0.3,
    x + botW * 0.95,
    trunkBot - s * 0.1,
    x + botW - s * 0.02,
    trunkBot - s * 0.02
  );
  ctx.stroke();

  ctx.strokeStyle = `rgba(90,64,32,${0.3 + pulse * 0.1})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - topW + s * 0.01, trunkTop + s * 0.04);
  ctx.bezierCurveTo(
    x - topW * 1.05,
    trunkTop + trunkH * 0.3,
    x - botW * 0.95,
    trunkBot - s * 0.1,
    x - botW + s * 0.02,
    trunkBot - s * 0.02
  );
  ctx.stroke();
}

// ─── COLOSSUS: Bark Armor Plates ─────────────────────────────────────────────

function drawColossusBarkPlates(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  pulse: number
) {
  const plates = [
    { cx: 0, cy: -0.12, h: 0.1, rot: 0, seed: 30, w: 0.18 },
    { cx: -0.1, cy: -0.04, h: 0.08, rot: -0.15, seed: 32, w: 0.12 },
    { cx: 0.1, cy: -0.04, h: 0.08, rot: 0.15, seed: 34, w: 0.12 },
    { cx: 0, cy: 0.04, h: 0.07, rot: 0, seed: 36, w: 0.15 },
    { cx: -0.08, cy: 0.1, h: 0.06, rot: -0.1, seed: 38, w: 0.1 },
    { cx: 0.08, cy: 0.1, h: 0.06, rot: 0.1, seed: 40, w: 0.1 },
  ];

  for (let i = 0; i < plates.length; i++) {
    const p = plates[i];
    const px = x + p.cx * s;
    const py = y + p.cy * s;
    const hw = p.w * s * 0.5;
    const hh = p.h * s * 0.5;

    // 3D radial gradient: highlight upper-left
    const plateGrad = ctx.createRadialGradient(
      px - hw * 0.25,
      py - hh * 0.3,
      hh * 0.1,
      px,
      py,
      hw
    );
    plateGrad.addColorStop(0, "#6a5430");
    plateGrad.addColorStop(0.4, "#5a4428");
    plateGrad.addColorStop(0.7, "#4a3820");
    plateGrad.addColorStop(1, "#3a2c18");
    ctx.fillStyle = plateGrad;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(p.rot);
    drawOrganicBlob(ctx, 0, 0, hw, hh, 10, 0.12, p.seed);
    ctx.fill();

    // Lighter top highlight blob
    ctx.fillStyle = "rgba(100,80,48,0.2)";
    drawOrganicBlob(
      ctx,
      -hw * 0.1,
      -hh * 0.25,
      hw * 0.6,
      hh * 0.4,
      8,
      0.1,
      p.seed + 1
    );
    ctx.fill();

    // Rim light on upper edge
    ctx.strokeStyle = "rgba(130,100,60,0.25)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      -hw * 0.05,
      -hh * 0.5,
      hw * 0.7,
      hh * 0.2,
      0,
      Math.PI * 0.8,
      Math.PI * 0.2,
      true
    );
    ctx.stroke();

    ctx.restore();

    // Glowing seam lines between plates
    if (i < plates.length - 1) {
      const seamAlpha = 0.15 + pulse * 0.1 + Math.sin(time * 3 + i) * 0.05;
      setShadowBlur(ctx, 3 * zoom, P.shadowHex);
      ctx.strokeStyle = `rgba(${P.glow},${seamAlpha})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(px - s * 0.08, py + p.h * s * 0.5);
      ctx.lineTo(px + s * 0.08, py + p.h * s * 0.5);
      ctx.stroke();
      clearShadow(ctx);
    }
  }

  // Central Tree of Life rune with shadow glow
  const runeGlow = 0.45 + pulse * 0.4;
  setShadowBlur(ctx, (8 + pulse * 5) * zoom, P.shadowHex);
  ctx.strokeStyle = `rgba(${P.glow},${runeGlow})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.01);
  ctx.lineTo(x, y - s * 0.14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.1);
  ctx.quadraticCurveTo(x - s * 0.05, y - s * 0.15, x - s * 0.04, y - s * 0.16);
  ctx.moveTo(x, y - s * 0.1);
  ctx.quadraticCurveTo(x + s * 0.05, y - s * 0.15, x + s * 0.04, y - s * 0.16);
  ctx.moveTo(x, y - s * 0.06);
  ctx.quadraticCurveTo(x - s * 0.04, y - s * 0.1, x - s * 0.035, y - s * 0.11);
  ctx.moveTo(x, y - s * 0.06);
  ctx.quadraticCurveTo(x + s * 0.04, y - s * 0.1, x + s * 0.035, y - s * 0.11);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.01);
  ctx.quadraticCurveTo(x - s * 0.04, y + s * 0.03, x - s * 0.05, y + s * 0.04);
  ctx.moveTo(x, y - s * 0.01);
  ctx.quadraticCurveTo(x + s * 0.04, y + s * 0.03, x + s * 0.05, y + s * 0.04);
  ctx.stroke();
  clearShadow(ctx);
}

// ─── COLOSSUS: Branch Arms ───────────────────────────────────────────────────

function drawColossusBranchArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  atkBurst: number,
  pulse: number
) {
  const isoY = ISO_Y_RATIO;

  for (const side of [-1, 1]) {
    const shoulderX = x + side * s * 0.22;
    const shoulderY = y - s * 0.15;

    const idleSwing = Math.sin(time * 1.5 + side * 1.2) * 0.15;
    // Idle: arms hang outward symmetrically (positive = right arm out, negative = left arm out)
    const idleAngle = side * 0.5 + idleSwing;
    // Raised: both arms lift up symmetrically (toward negative = upward in canvas rotation)
    const raisedAngle = side * 0.3 - 0.8 + idleSwing;
    // Slam: both arms come down toward center-ground
    const slamAngle = side * 0.15 + 1.3;
    const shoulderRot =
      atkBurst > 0
        ? raisedAngle + (slamAngle - raisedAngle) * atkBurst
        : idleAngle;
    const armLen = s * 0.44;

    ctx.save();
    ctx.translate(shoulderX, shoulderY);
    ctx.rotate(shoulderRot);

    // Multi-segment upper arm with gradient trapezoids
    const upperSegs = 4;
    for (let seg = 0; seg < upperSegs; seg++) {
      const t0 = seg / upperSegs;
      const t1 = (seg + 1) / upperSegs;
      const y0 = armLen * 0.02 + t0 * armLen * 0.48;
      const y1 = armLen * 0.02 + t1 * armLen * 0.48;
      const w0 = s * (0.06 - t0 * 0.012);
      const w1 = s * (0.06 - t1 * 0.012);
      const segGrad = ctx.createLinearGradient(-w0, y0, w0, y0);
      segGrad.addColorStop(0, "#7a5830");
      segGrad.addColorStop(0.3, "#5a4020");
      segGrad.addColorStop(0.7, "#4a3418");
      segGrad.addColorStop(1, "#2a1a08");
      ctx.fillStyle = segGrad;
      ctx.beginPath();
      ctx.moveTo(-w0, y0);
      ctx.lineTo(-w1, y1);
      ctx.lineTo(w1, y1);
      ctx.lineTo(w0, y0);
      ctx.closePath();
      ctx.fill();
      // Bark ridge per segment
      if (seg > 0) {
        ctx.strokeStyle = "rgba(15,10,4,0.4)";
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(-w0 * 0.8, y0 + s * 0.001);
        ctx.lineTo(w0 * 0.8, y0 + s * 0.002);
        ctx.stroke();
        ctx.strokeStyle = "rgba(90,64,32,0.18)";
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(-w0 * 0.8, y0 - 0.5);
        ctx.lineTo(w0 * 0.8, y0);
        ctx.stroke();
      }
    }

    // Glowing vein along upper arm
    setShadowBlur(ctx, 4 * zoom, P.shadowHex);
    ctx.strokeStyle = `rgba(${P.glow},${0.3 + atkBurst * 0.22})`;
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.01);
    ctx.bezierCurveTo(
      s * 0.012,
      armLen * 0.15,
      -s * 0.012,
      armLen * 0.35,
      0,
      armLen * 0.5
    );
    ctx.stroke();
    ctx.strokeStyle = `rgba(${P.glowBright},${0.1 + atkBurst * 0.08})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.01);
    ctx.bezierCurveTo(
      s * 0.012,
      armLen * 0.15,
      -s * 0.012,
      armLen * 0.35,
      0,
      armLen * 0.5
    );
    ctx.stroke();
    clearShadow(ctx);

    // Foliage bush clusters along upper arm
    const upperBushes = [
      { offX: 1, rx: 0.04, ry: 0.03, seed: side * 20 + 40, t: 0.15 },
      { offX: -1, rx: 0.045, ry: 0.032, seed: side * 20 + 55, t: 0.35 },
      { offX: 1, rx: 0.038, ry: 0.026, seed: side * 20 + 68, t: 0.55 },
    ];
    for (const ub of upperBushes) {
      const ubY = armLen * 0.02 + ub.t * armLen * 0.48;
      const ubW = s * (0.06 - ub.t * 0.012);
      const ubX = ub.offX * ubW * 0.85;
      const ci = P.canopy[Math.floor(ub.seed % 4)];
      const grad = ctx.createRadialGradient(
        ubX,
        ubY,
        s * 0.004,
        ubX,
        ubY,
        s * ub.rx
      );
      grad.addColorStop(0, `rgba(${hexToRgb(ci)},${0.65 + pulse * 0.1})`);
      grad.addColorStop(
        1,
        `rgba(${hexToRgb(P.canopy[0])},${0.3 + pulse * 0.05})`
      );
      ctx.fillStyle = grad;
      drawOrganicBlob(
        ctx,
        ubX,
        ubY,
        s * ub.rx,
        s * ub.ry,
        7,
        0.22,
        ub.seed + time * 0.04
      );
      ctx.fill();
    }

    // Elbow joint as 3D sphere
    ctx.save();
    ctx.translate(0, armLen * 0.5);
    const elbowR = s * 0.035;
    const elbowGrad = ctx.createRadialGradient(
      -elbowR * 0.3,
      -elbowR * 0.3,
      elbowR * 0.1,
      0,
      0,
      elbowR
    );
    elbowGrad.addColorStop(0, "#7a5830");
    elbowGrad.addColorStop(0.5, "#5a4020");
    elbowGrad.addColorStop(1, "#2a1a08");
    ctx.fillStyle = elbowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, elbowR, 0, Math.PI * 2);
    ctx.fill();
    // Elbow glow ring
    ctx.strokeStyle = `rgba(${P.glow},${0.12 + atkBurst * 0.1})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, elbowR * 1.3, 0, Math.PI * 2);
    ctx.stroke();

    // Multi-segment forearm — bends sharply outward at the elbow, straightens during smash
    const idleElbow = 7.05;
    const elbowBend =
      atkBurst > 0 ? idleElbow * (1 - atkBurst * 0.85) : idleElbow;
    const impactJitter =
      atkBurst > 0.85 ? (Math.random() - 0.5) * s * 0.006 * atkBurst : 0;
    ctx.rotate(elbowBend);
    if (impactJitter !== 0) {
      ctx.translate(impactJitter, impactJitter);
    }
    const foreLen = armLen * 0.5;
    const foreSegs = 3;
    for (let seg = 0; seg < foreSegs; seg++) {
      const t0 = seg / foreSegs;
      const t1 = (seg + 1) / foreSegs;
      const y0 = t0 * foreLen;
      const y1 = t1 * foreLen;
      const w0 = s * (0.048 - t0 * 0.012);
      const w1 = s * (0.048 - t1 * 0.012);
      const fGrad = ctx.createLinearGradient(-w0, y0, w0, y0);
      fGrad.addColorStop(0, "#6a4820");
      fGrad.addColorStop(0.35, "#5a3818");
      fGrad.addColorStop(0.7, "#4a2c12");
      fGrad.addColorStop(1, "#2a1808");
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.moveTo(-w0, y0);
      ctx.lineTo(-w1, y1);
      ctx.lineTo(w1, y1);
      ctx.lineTo(w0, y0);
      ctx.closePath();
      ctx.fill();
    }

    // Forearm vein
    setShadowBlur(ctx, 3 * zoom, P.shadowHex);
    ctx.strokeStyle = `rgba(${P.glow},${0.22 + atkBurst * 0.18})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      s * 0.008,
      foreLen * 0.3,
      -s * 0.008,
      foreLen * 0.6,
      0,
      foreLen * 0.9
    );
    ctx.stroke();
    clearShadow(ctx);

    // Foliage clusters along forearm
    const foreArmBushes = [
      { offX: 1, rx: 0.035, ry: 0.025, seed: 60, t: 0.2 },
      { offX: -1, rx: 0.04, ry: 0.028, seed: 72, t: 0.5 },
      { offX: 1, rx: 0.032, ry: 0.022, seed: 85, t: 0.75 },
    ];
    for (const fb of foreArmBushes) {
      const fbY = fb.t * foreLen;
      const fbThick = s * (0.048 - fb.t * 0.012);
      const fbX = fb.offX * fbThick * 0.9;
      const ci = P.canopy[Math.floor(fb.seed % 4)];
      const grad = ctx.createRadialGradient(
        fbX,
        fbY,
        s * 0.005,
        fbX,
        fbY,
        s * fb.rx
      );
      grad.addColorStop(0, `rgba(${hexToRgb(ci)},${0.7 + pulse * 0.08})`);
      grad.addColorStop(
        1,
        `rgba(${hexToRgb(P.canopy[0])},${0.35 + pulse * 0.05})`
      );
      ctx.fillStyle = grad;
      drawOrganicBlob(
        ctx,
        fbX,
        fbY,
        s * fb.rx,
        s * fb.ry,
        8,
        0.2,
        fb.seed + time * 0.04
      );
      ctx.fill();
    }

    // Bush fist at end of forearm (canopy-style foliage cluster)
    const fistY = foreLen * 0.85;
    const fistR = s * (0.09 + atkBurst * 0.025);
    const fistBlobs = [
      { dx: 0, dy: 0, rx: 1, ry: 0.85, seed: side * 30 + 200 },
      { dx: -0.35, dy: -0.25, rx: 0.7, ry: 0.6, seed: side * 30 + 210 },
      { dx: 0.3, dy: -0.15, rx: 0.65, ry: 0.55, seed: side * 30 + 220 },
      { dx: 0.1, dy: 0.35, rx: 0.6, ry: 0.5, seed: side * 30 + 230 },
    ];
    for (let bi = 0; bi < fistBlobs.length; bi++) {
      const fb = fistBlobs[bi];
      const bx = fb.dx * fistR;
      const by = fistY + fb.dy * fistR;
      const ci = P.canopy[Math.min(bi, 3)];
      const grad = ctx.createRadialGradient(
        bx - fb.rx * fistR * 0.15,
        by - fb.ry * fistR * 0.2,
        s * 0.005,
        bx,
        by,
        fb.rx * fistR
      );
      grad.addColorStop(0, `rgba(${hexToRgb(ci)},${0.75 + pulse * 0.1})`);
      grad.addColorStop(
        1,
        `rgba(${hexToRgb(P.canopy[0])},${0.4 + pulse * 0.06})`
      );
      ctx.fillStyle = grad;
      drawOrganicBlob(
        ctx,
        bx,
        by,
        fb.rx * fistR,
        fb.ry * fistR,
        10,
        0.22,
        fb.seed + time * 0.05
      );
      ctx.fill();
    }
    // Glow core inside fist bush
    setShadowBlur(ctx, 6 * zoom, P.shadowHex);
    ctx.fillStyle = `rgba(${P.glow},${0.2 + atkBurst * 0.35 + pulse * 0.08})`;
    ctx.beginPath();
    ctx.arc(0, fistY, fistR * 0.4, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);

    ctx.restore(); // forearm + elbow
    ctx.restore(); // shoulder arm transform

    // Sub-branches as isometric offshoots (use ISO_Y_RATIO for radial Y)
    for (let b = 0; b < 5; b++) {
      const bAngle = side * (0.4 + b * 0.35) + Math.sin(time * 0.6 + b) * 0.08;
      const bDist = s * (0.08 + b * 0.035);
      const bBaseX = shoulderX + Math.cos(bAngle) * bDist * 0.3;
      const bBaseY = shoulderY + Math.sin(bAngle) * bDist * 0.3;
      const bLen = s * (0.05 + Math.sin(b * 1.7) * 0.012);
      const bTipX = bBaseX + Math.cos(bAngle) * bLen;
      const bTipY = bBaseY + Math.sin(bAngle) * bLen * isoY;

      ctx.strokeStyle = "#4a3018";
      ctx.lineWidth = (1.8 - b * 0.15) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(bBaseX, bBaseY);
      ctx.quadraticCurveTo(
        (bBaseX + bTipX) / 2 + Math.sin(time + b) * s * 0.004,
        (bBaseY + bTipY) / 2,
        bTipX,
        bTipY
      );
      ctx.stroke();

      ctx.fillStyle = `rgba(${P.leaf},${0.45 + atkBurst * 0.15})`;
      drawOrganicBlob(
        ctx,
        bTipX,
        bTipY,
        s * 0.016,
        s * 0.016 * isoY,
        6,
        0.2,
        b * 5 + side * 9 + 70
      );
      ctx.fill();
    }

    // Vine spirals wrapping arm — isometric ellipses
    ctx.save();
    ctx.translate(shoulderX, shoulderY);
    ctx.rotate(shoulderRot);
    for (let v = 0; v < 6; v++) {
      const vy = v * armLen * 0.08 + armLen * 0.06;
      const vPhase = time * 2 + v * 1.3 + side;
      const vRx = s * 0.048;
      const vRy = vRx * isoY;
      ctx.strokeStyle = `rgba(${P.glow},${0.24 + atkBurst * 0.15})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(0, vy, vRx, vRy, 0, vPhase, vPhase + Math.PI * 0.6);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${P.glowBright},${0.1 + atkBurst * 0.08})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.ellipse(-0.5, vy - 0.5, vRx, vRy, 0, vPhase, vPhase + Math.PI * 0.4);
      ctx.stroke();
    }
    ctx.restore();

    // Shoulder joint: glowing 3D sphere
    const shR = s * 0.05;
    const shGrad = ctx.createRadialGradient(
      shoulderX - shR * 0.25,
      shoulderY - shR * 0.25,
      shR * 0.1,
      shoulderX,
      shoulderY,
      shR
    );
    shGrad.addColorStop(0, "#7a5830");
    shGrad.addColorStop(0.35, "#5a4020");
    shGrad.addColorStop(0.7, "#3a2810");
    shGrad.addColorStop(1, "#1a1208");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.arc(shoulderX, shoulderY, shR, 0, Math.PI * 2);
    ctx.fill();

    // Shoulder rune glow
    setShadowBlur(ctx, 5 * zoom, P.shadowHex);
    ctx.fillStyle = `rgba(${P.glow},${0.18 + Math.sin(time * 3 + side) * 0.1})`;
    ctx.beginPath();
    ctx.arc(shoulderX, shoulderY, shR * 0.45, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);

    // Shoulder moss/lichen
    ctx.fillStyle = `rgba(${P.leafDark},${0.2 + Math.sin(time * 0.8 + side * 2) * 0.06})`;
    drawOrganicBlob(
      ctx,
      shoulderX + side * s * 0.025,
      shoulderY - s * 0.015,
      s * 0.02,
      s * 0.012,
      7,
      0.2,
      side * 33 + 80
    );
    ctx.fill();
  }
}

// ─── COLOSSUS: Face (deep carved bark) ───────────────────────────────────────

function drawColossusFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  pulse: number
) {
  const faceY = y - s * 0.25;

  // Carved brow ridge with highlight top / shadow bottom
  ctx.strokeStyle = "#2a1a08";
  ctx.lineWidth = 3.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.13, faceY - s * 0.015);
  ctx.bezierCurveTo(
    x - s * 0.04,
    faceY - s * 0.045,
    x + s * 0.04,
    faceY - s * 0.045,
    x + s * 0.13,
    faceY - s * 0.015
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(100,75,40,0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.12, faceY - s * 0.02);
  ctx.bezierCurveTo(
    x - s * 0.04,
    faceY - s * 0.05,
    x + s * 0.04,
    faceY - s * 0.05,
    x + s * 0.12,
    faceY - s * 0.02
  );
  ctx.stroke();

  // Deeper eye sockets: concentric diamonds going darker inward
  for (const side of [-1, 1]) {
    const eyeX = x + side * s * 0.06;
    const eyeY = faceY + s * 0.005;

    for (let d = 0; d < 3; d++) {
      const scale = 1 - d * 0.25;
      const darkness = 0.3 + d * 0.25;
      ctx.fillStyle = `rgba(10,8,6,${darkness})`;
      ctx.beginPath();
      ctx.moveTo(eyeX - s * 0.038 * scale, eyeY);
      ctx.lineTo(eyeX, eyeY - s * 0.028 * scale);
      ctx.lineTo(eyeX + s * 0.038 * scale, eyeY);
      ctx.lineTo(eyeX, eyeY + s * 0.022 * scale);
      ctx.closePath();
      ctx.fill();
    }

    // Glowing eyes with STRONG bloom
    const eyeGlow = 0.75 + pulse * 0.25;
    setShadowBlur(ctx, (12 + pulse * 8) * zoom, P.shadowHex);
    const eyeGrad = ctx.createRadialGradient(
      eyeX,
      eyeY,
      0,
      eyeX,
      eyeY,
      s * 0.035
    );
    eyeGrad.addColorStop(0, `rgba(${P.glowWhite},${eyeGlow})`);
    eyeGrad.addColorStop(0.2, `rgba(${P.glowBright},${eyeGlow * 0.85})`);
    eyeGrad.addColorStop(0.5, `rgba(${P.glow},${eyeGlow * 0.5})`);
    eyeGrad.addColorStop(0.8, `rgba(${P.glowDark},${eyeGlow * 0.2})`);
    eyeGrad.addColorStop(1, `rgba(${P.glowDark},0)`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.moveTo(eyeX - s * 0.032, eyeY);
    ctx.lineTo(eyeX, eyeY - s * 0.022);
    ctx.lineTo(eyeX + s * 0.032, eyeY);
    ctx.lineTo(eyeX, eyeY + s * 0.017);
    ctx.closePath();
    ctx.fill();
    clearShadow(ctx);

    // Bright eye specular highlight
    ctx.fillStyle = `rgba(255,255,255,${0.65 + pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(
      eyeX + side * s * 0.006,
      eyeY - s * 0.004,
      s * 0.006,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Mouth: dark carved slit with inner glow
  const mouthY = faceY + s * 0.04;
  ctx.fillStyle = "#060402";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.045, mouthY);
  ctx.quadraticCurveTo(x, mouthY + s * 0.015, x + s * 0.045, mouthY);
  ctx.quadraticCurveTo(x, mouthY + s * 0.004, x - s * 0.045, mouthY);
  ctx.fill();

  setShadowBlur(ctx, 5 * zoom, P.shadowHex);
  const mouthGlow = 0.35 + pulse * 0.25 + Math.sin(time * 2) * 0.1;
  ctx.fillStyle = `rgba(${P.glow},${mouthGlow})`;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.035, mouthY + s * 0.002);
  ctx.quadraticCurveTo(x, mouthY + s * 0.01, x + s * 0.035, mouthY + s * 0.002);
  ctx.quadraticCurveTo(
    x,
    mouthY + s * 0.005,
    x - s * 0.035,
    mouthY + s * 0.002
  );
  ctx.fill();
  clearShadow(ctx);

  // Breath mist particles
  for (let i = 0; i < 4; i++) {
    const phase = (time * 0.8 + i * 0.25) % 1;
    const mx = x + Math.sin(time * 2 + i * 1.5) * s * 0.02;
    const my = mouthY + s * 0.01 + phase * s * 0.04;
    const mAlpha = Math.sin(phase * Math.PI) * (0.15 + pulse * 0.08);
    ctx.fillStyle = `rgba(${P.glowBright},${mAlpha})`;
    ctx.beginPath();
    ctx.arc(mx, my, s * 0.005 * (1 - phase * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheek runes with glow
  setShadowBlur(ctx, 3 * zoom, P.shadowHex);
  const runeAlpha = 0.25 + pulse * 0.18;
  ctx.strokeStyle = `rgba(${P.glowBright},${runeAlpha})`;
  ctx.lineWidth = 0.8 * zoom;
  for (const side of [-1, 1]) {
    const rx = x + side * s * 0.1;
    const ry = faceY + s * 0.01;
    ctx.beginPath();
    ctx.moveTo(rx, ry - s * 0.022);
    ctx.lineTo(rx + side * s * 0.012, ry);
    ctx.lineTo(rx, ry + s * 0.022);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx - side * s * 0.006, ry);
    ctx.lineTo(rx + side * s * 0.016, ry);
    ctx.stroke();
  }
  clearShadow(ctx);

  // Bark wrinkle lines radiating from eyes/mouth (shadow + highlight pairs)
  const wrinkles = [
    { ex: -0.13, ey: 0.02, sx: -0.06, sy: -0.03 },
    { ex: 0.13, ey: 0.02, sx: 0.06, sy: -0.03 },
    { ex: -0.1, ey: 0.06, sx: -0.04, sy: 0.035 },
    { ex: 0.1, ey: 0.06, sx: 0.04, sy: 0.035 },
    { ex: -0.06, ey: -0.06, sx: -0.02, sy: -0.04 },
    { ex: 0.06, ey: -0.06, sx: 0.02, sy: -0.04 },
  ];
  for (const w of wrinkles) {
    const wx1 = x + w.sx * s;
    const wy1 = faceY + w.sy * s;
    const wx2 = x + w.ex * s;
    const wy2 = faceY + w.ey * s;
    ctx.strokeStyle = "rgba(30,20,10,0.3)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx1, wy1);
    ctx.lineTo(wx2, wy2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(90,64,32,0.15)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx1 - 0.5, wy1 - 0.5);
    ctx.lineTo(wx2 - 0.5, wy2 - 0.5);
    ctx.stroke();
  }
}

// ─── COLOSSUS: Canopy (organic foliage blob clusters) ─────────────────────

function drawColossusCanopy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  pulse: number,
  atkBurst: number
) {
  const isoY = ISO_Y_RATIO;
  const canopyY = y - s * 0.38;
  const canopyR = s * 0.35;

  // Branch framework (isometric Y compression on radial positions)
  const branchCount = 8;
  for (let i = 0; i < branchCount; i++) {
    const a =
      (i / branchCount) * Math.PI -
      Math.PI * 0.5 +
      Math.sin(time * 0.4 + i) * 0.05;
    const bLen = s * (0.24 + Math.sin(i * 1.7) * 0.04);
    const bx2 = x + Math.cos(a) * bLen;
    const by2 = canopyY + Math.sin(a) * bLen * isoY - s * 0.05;

    // Branch with gradient stroke
    const brGrad = ctx.createLinearGradient(x, y - s * 0.3, bx2, by2);
    brGrad.addColorStop(0, "#5a3818");
    brGrad.addColorStop(1, "#3a2510");
    ctx.strokeStyle = brGrad;
    ctx.lineWidth = (2.8 - i * 0.12) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.3);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * bLen * 0.4,
      canopyY + Math.sin(a) * bLen * 0.3 * isoY - s * 0.02,
      bx2,
      by2
    );
    ctx.stroke();
    // Highlight edge
    ctx.strokeStyle = "rgba(90,64,32,0.15)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - 0.5, y - s * 0.3 - 0.5);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * bLen * 0.4 - 0.5,
      canopyY + Math.sin(a) * bLen * 0.3 * isoY - s * 0.02 - 0.5,
      bx2 - 0.5,
      by2 - 0.5
    );
    ctx.stroke();

    // Sub-branches with isometric Y
    for (let sb = 0; sb < 3; sb++) {
      const subT = 0.35 + sb * 0.22;
      const subX = x + Math.cos(a) * bLen * subT;
      const subY =
        canopyY + Math.sin(a) * bLen * subT * isoY - s * 0.05 * (1 - subT);
      const subA = a + (sb % 2 === 0 ? 0.5 : -0.5);
      const subLen = s * (0.06 + sb * 0.008);
      ctx.strokeStyle = "#3a2510";
      ctx.lineWidth = (1.2 - sb * 0.1) * zoom;
      ctx.beginPath();
      ctx.moveTo(subX, subY);
      ctx.lineTo(
        subX + Math.cos(subA) * subLen,
        subY + Math.sin(subA) * subLen * isoY
      );
      ctx.stroke();
      // Leaf blob at tip
      if (sb < 2) {
        ctx.fillStyle = `rgba(${P.leaf},${0.3 + pulse * 0.08})`;
        const tipX = subX + Math.cos(subA) * subLen;
        const tipY = subY + Math.sin(subA) * subLen * isoY;
        drawOrganicBlob(
          ctx,
          tipX,
          tipY,
          s * 0.01,
          s * 0.01 * isoY,
          5,
          0.2,
          i * 7 + sb * 3
        );
        ctx.fill();
      }
    }
  }

  // ── Style-specific canopy shapes using organic blob clusters ──

  if (P.canopyStyle === "flat") {
    const backBlobs = [
      { dx: -0.2, dy: 0.02, rx: 0.2, ry: 0.06, seed: 100 },
      { dx: 0.22, dy: 0.015, rx: 0.18, ry: 0.055, seed: 102 },
      { dx: 0, dy: 0.01, rx: 0.23, ry: 0.065, seed: 104 },
    ];
    for (let i = 0; i < backBlobs.length; i++) {
      const b = backBlobs[i];
      const bx = x + b.dx * canopyR;
      const by = canopyY + b.dy * s;
      const ci = Math.min(i, 3);
      const grad = ctx.createRadialGradient(
        bx - b.rx * canopyR * 0.2,
        by - b.ry * s * 0.3,
        s * 0.01,
        bx,
        by,
        b.rx * canopyR
      );
      grad.addColorStop(
        0,
        `rgba(${hexToRgb(P.canopy[ci])},${0.75 + pulse * 0.08})`
      );
      grad.addColorStop(
        1,
        `rgba(${hexToRgb(P.canopy[0])},${0.45 + pulse * 0.05})`
      );
      ctx.fillStyle = grad;
      drawOrganicBlob(
        ctx,
        bx,
        by,
        b.rx * canopyR,
        b.ry * s,
        10,
        0.18,
        b.seed + time * 0.05
      );
      ctx.fill();
    }
    const frontBlobs = [
      { dx: -0.1, dy: -0.01, rx: 0.15, ry: 0.05, seed: 110 },
      { dx: 0.12, dy: -0.005, rx: 0.14, ry: 0.048, seed: 112 },
      { dx: 0.02, dy: -0.015, rx: 0.12, ry: 0.04, seed: 114 },
    ];
    for (let i = 0; i < frontBlobs.length; i++) {
      const b = frontBlobs[i];
      const bx = x + b.dx * canopyR;
      const by = canopyY + b.dy * s;
      const ci = Math.min(i + 1, 3);
      ctx.fillStyle = `rgba(${hexToRgb(P.canopy[ci])},${0.55 + pulse * 0.1})`;
      drawOrganicBlob(
        ctx,
        bx,
        by,
        b.rx * canopyR,
        b.ry * s,
        9,
        0.15,
        b.seed + time * 0.03
      );
      ctx.fill();
    }
    // Isometric leaf orbit
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + time * 0.12;
      const leafDist = canopyR * (1.1 + Math.sin(i * 2.3) * 0.1);
      const lx = x + Math.cos(a) * leafDist;
      const ly = canopyY + Math.sin(a) * leafDist * isoY;
      ctx.fillStyle = `rgba(${P.leaf},${0.4 + pulse * 0.12})`;
      drawOrganicBlob(
        ctx,
        lx,
        ly,
        s * 0.015,
        s * 0.015 * isoY,
        6,
        0.2,
        i * 3.1
      );
      ctx.fill();
    }
  } else if (P.canopyStyle === "conical") {
    const layers = 5;
    for (let i = 0; i < layers; i++) {
      const t = i / (layers - 1);
      const layerY = canopyY + s * 0.08 - t * s * 0.35;
      const layerW = canopyR * (0.9 - t * 0.7);
      const ci = Math.min(i, 3);
      const alpha = 0.7 - t * 0.1;
      ctx.fillStyle = `rgba(${hexToRgb(P.canopy[0])},${alpha * 0.4})`;
      drawOrganicBlob(
        ctx,
        x,
        layerY + s * 0.01,
        layerW * 1.05,
        s * 0.04,
        10,
        0.12,
        120 + i * 3
      );
      ctx.fill();
      const grad = ctx.createRadialGradient(
        x - layerW * 0.2,
        layerY - s * 0.02,
        s * 0.005,
        x,
        layerY,
        layerW
      );
      grad.addColorStop(
        0,
        `rgba(${hexToRgb(P.canopy[ci])},${alpha + pulse * 0.08})`
      );
      grad.addColorStop(1, `rgba(${hexToRgb(P.canopy[0])},${alpha * 0.6})`);
      ctx.fillStyle = grad;
      drawOrganicBlob(
        ctx,
        x,
        layerY,
        layerW,
        s * (0.035 + (1 - t) * 0.015),
        10,
        0.15,
        130 + i * 3 + time * 0.02
      );
      ctx.fill();
      ctx.strokeStyle = `rgba(${P.glowBright},${0.3 + pulse * 0.12})`;
      ctx.lineWidth = 0.9 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        layerY - s * 0.01,
        layerW * 0.8,
        s * 0.008,
        0,
        Math.PI * 0.15,
        Math.PI * 0.85
      );
      ctx.stroke();
    }
    // Frost sparkles (isometric)
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI - Math.PI * 0.5;
      const dist = canopyR * (0.5 + Math.sin(i * 1.9) * 0.15);
      const fx = x + Math.cos(angle) * dist;
      const fy = canopyY - s * 0.05 + Math.sin(angle) * dist * isoY;
      const fAlpha = 0.3 + Math.sin(time * 3.5 + i * 1.2) * 0.2;
      ctx.fillStyle = `rgba(${P.glowWhite},${fAlpha})`;
      ctx.beginPath();
      ctx.arc(fx, fy, s * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (P.canopyStyle === "ember") {
    ctx.fillStyle = `rgba(${hexToRgb(P.canopy[0])},${0.3 + pulse * 0.05})`;
    drawOrganicBlob(
      ctx,
      x - canopyR * 0.1,
      canopyY,
      canopyR * 0.4,
      canopyR * 0.22,
      10,
      0.2,
      140 + time * 0.02
    );
    ctx.fill();
    ctx.fillStyle = `rgba(${hexToRgb(P.canopy[1])},${0.2 + pulse * 0.04})`;
    drawOrganicBlob(
      ctx,
      x + canopyR * 0.15,
      canopyY - s * 0.01,
      canopyR * 0.3,
      canopyR * 0.16,
      9,
      0.18,
      145
    );
    ctx.fill();
    ctx.fillStyle = `rgba(${hexToRgb(P.canopy[2])},${0.12 + pulse * 0.03})`;
    drawOrganicBlob(
      ctx,
      x,
      canopyY - s * 0.02,
      canopyR * 0.22,
      canopyR * 0.12,
      8,
      0.15,
      148
    );
    ctx.fill();

    for (let i = 0; i < 24; i++) {
      const phase = (time * 0.5 + i * 0.042) % 1;
      const orbitA = time * 0.3 + i * 0.26;
      const drift = Math.sin(time * 1.5 + i * 2.1) * canopyR * 0.6;
      const ex = x + drift + Math.cos(orbitA) * canopyR * 0.15;
      const ey = canopyY + s * 0.06 - phase * s * 0.55;
      const eAlpha = Math.sin(phase * Math.PI) * (0.55 + atkBurst * 0.15);
      const eSize = (1.8 + Math.sin(i * 1.3) * 0.7) * zoom;

      setShadowBlur(ctx, 3 * zoom, P.shadowHex);
      ctx.fillStyle = `rgba(${P.pollen},${eAlpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
      ctx.fill();
      clearShadow(ctx);
      ctx.fillStyle = `rgba(${P.glowWhite},${eAlpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(ex, ey, eSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (P.canopyStyle === "weeping") {
    const domeBlobs = [
      { ci: 0, dx: 0, dy: 0, rx: 0.85, ry: 0.5, seed: 150 },
      { ci: 1, dx: -0.15, dy: 0.01, rx: 0.55, ry: 0.35, seed: 152 },
      { ci: 1, dx: 0.18, dy: 0.005, rx: 0.5, ry: 0.33, seed: 154 },
      { ci: 2, dx: -0.05, dy: -0.01, rx: 0.6, ry: 0.38, seed: 156 },
      { ci: 3, dx: 0.08, dy: -0.015, rx: 0.45, ry: 0.28, seed: 158 },
    ];
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    drawOrganicBlob(
      ctx,
      x,
      canopyY + s * 0.03,
      canopyR * 0.9,
      canopyR * 0.5,
      12,
      0.15,
      149
    );
    ctx.fill();
    for (const b of domeBlobs) {
      const bx = x + b.dx * canopyR;
      const by = canopyY + b.dy * s;
      const grad = ctx.createRadialGradient(
        bx - b.rx * canopyR * 0.15,
        by - b.ry * canopyR * 0.2,
        s * 0.01,
        bx,
        by,
        b.rx * canopyR
      );
      grad.addColorStop(
        0,
        `rgba(${hexToRgb(P.canopy[b.ci])},${0.7 + pulse * 0.08})`
      );
      grad.addColorStop(1, `rgba(${hexToRgb(P.canopy[0])},${0.35})`);
      ctx.fillStyle = grad;
      drawOrganicBlob(
        ctx,
        bx,
        by,
        b.rx * canopyR,
        b.ry * canopyR,
        11,
        0.15,
        b.seed + time * 0.03
      );
      ctx.fill();
    }
    // Hanging vine strands — isometric attachment points
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const hangBaseR = canopyR * (0.85 + Math.sin(i * 1.7) * 0.1);
      const hangX = x + Math.cos(angle) * hangBaseR;
      const hangTopY = canopyY + Math.sin(angle) * hangBaseR * isoY;
      const hangLen = s * (0.1 + Math.sin(i * 2.3) * 0.04 + atkBurst * 0.03);
      const vineSway = Math.sin(time * 1.5 + i * 0.8) * s * 0.014;

      ctx.strokeStyle = `rgba(${P.vine},${0.38 + pulse * 0.12})`;
      ctx.lineWidth = (1.6 + Math.sin(i) * 0.4) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hangX, hangTopY);
      ctx.quadraticCurveTo(
        hangX + vineSway,
        hangTopY + hangLen * 0.6,
        hangX + vineSway * 1.5,
        hangTopY + hangLen
      );
      ctx.stroke();
      // Vine highlight
      ctx.strokeStyle = `rgba(${P.glowDark},${0.1 + pulse * 0.04})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(hangX - 0.5, hangTopY - 0.5);
      ctx.quadraticCurveTo(
        hangX + vineSway - 0.5,
        hangTopY + hangLen * 0.6 - 0.5,
        hangX + vineSway * 1.5 - 0.5,
        hangTopY + hangLen - 0.5
      );
      ctx.stroke();

      if (i % 2 === 0) {
        const tipX = hangX + vineSway * 1.5;
        const tipY = hangTopY + hangLen + s * 0.005;
        setShadowBlur(ctx, 5 * zoom, P.shadowHex);
        ctx.fillStyle = `rgba(${P.glow},${0.45 + pulse * 0.22})`;
        ctx.beginPath();
        ctx.arc(tipX, tipY, s * 0.006, 0, Math.PI * 2);
        ctx.fill();
        clearShadow(ctx);
      }
    }
    // Isometric leaf orbit
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + time * 0.15;
      const leafDist = canopyR * (0.9 + Math.sin(i * 2.3) * 0.12);
      const lx = x + Math.cos(a) * leafDist;
      const ly = canopyY + Math.sin(a) * leafDist * isoY;
      ctx.fillStyle = `rgba(${P.leaf},${0.4 + pulse * 0.12})`;
      drawOrganicBlob(
        ctx,
        lx,
        ly,
        s * 0.014,
        s * 0.014 * isoY,
        6,
        0.2,
        i * 2.7
      );
      ctx.fill();
    }
  } else {
    // Round (grassland) — dome of organic blobs
    const backLayer = [
      { ci: 0, dx: 0, dy: 0.015, rx: 0.75, ry: 0.5, seed: 160 },
      { ci: 0, dx: -0.2, dy: 0.01, rx: 0.45, ry: 0.35, seed: 162 },
      { ci: 0, dx: 0.22, dy: 0.01, rx: 0.42, ry: 0.33, seed: 164 },
    ];
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    drawOrganicBlob(
      ctx,
      x,
      canopyY + s * 0.025,
      canopyR * 0.8,
      canopyR * 0.45,
      12,
      0.12,
      159
    );
    ctx.fill();
    for (const b of backLayer) {
      const bx = x + b.dx * canopyR;
      const by = canopyY + b.dy * s;
      ctx.fillStyle = `rgba(${hexToRgb(P.canopy[b.ci])},${0.65 + pulse * 0.06})`;
      drawOrganicBlob(
        ctx,
        bx,
        by,
        b.rx * canopyR,
        b.ry * canopyR,
        11,
        0.15,
        b.seed + time * 0.03
      );
      ctx.fill();
    }
    const frontLayer = [
      { ci: 1, dx: -0.1, dy: -0.005, rx: 0.55, ry: 0.4, seed: 170 },
      { ci: 2, dx: 0.12, dy: 0, rx: 0.5, ry: 0.38, seed: 172 },
      { ci: 3, dx: 0, dy: -0.015, rx: 0.45, ry: 0.3, seed: 174 },
    ];
    for (const b of frontLayer) {
      const bx = x + b.dx * canopyR;
      const by = canopyY + b.dy * s;
      const grad = ctx.createRadialGradient(
        bx - b.rx * canopyR * 0.2,
        by - b.ry * canopyR * 0.25,
        s * 0.01,
        bx,
        by,
        b.rx * canopyR
      );
      grad.addColorStop(
        0,
        `rgba(${hexToRgb(P.canopy[b.ci])},${0.7 + pulse * 0.1})`
      );
      grad.addColorStop(
        1,
        `rgba(${hexToRgb(P.canopy[Math.max(b.ci - 1, 0)])},${0.4})`
      );
      ctx.fillStyle = grad;
      drawOrganicBlob(
        ctx,
        bx,
        by,
        b.rx * canopyR,
        b.ry * canopyR,
        10,
        0.14,
        b.seed + time * 0.04
      );
      ctx.fill();
    }
    // Isometric leaf clusters
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + time * 0.15;
      const leafDist = canopyR * (0.65 + Math.sin(i * 2.3) * 0.15);
      const lx = x + Math.cos(a) * leafDist;
      const ly = canopyY + Math.sin(a) * leafDist * isoY;
      ctx.fillStyle = `rgba(${P.leaf},${0.5 + pulse * 0.15 + Math.sin(time * 3 + i) * 0.1})`;
      drawOrganicBlob(
        ctx,
        lx,
        ly,
        s * 0.016,
        s * 0.016 * isoY,
        6,
        0.2,
        i * 3.3 + 180
      );
      ctx.fill();
    }
    // Dappled light spots (isometric orbit)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + time * 0.08;
      const ldx = Math.cos(a) * canopyR * 0.4;
      const ldy = Math.sin(a) * canopyR * 0.4 * isoY - canopyR * 0.15;
      ctx.fillStyle = `rgba(${P.glowBright},${0.12 + Math.sin(time * 2.5 + i * 1.8) * 0.06})`;
      ctx.beginPath();
      ctx.arc(x + ldx, canopyY + ldy, s * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Flowers/decorations (skip for ember) — isometric Y on orbit
  if (P.canopyStyle !== "ember") {
    const flowers = [
      { a: 0.3, color: P.flower, d: 0.6 },
      { a: 1.5, color: P.pollen, d: 0.5 },
      { a: 2.8, color: P.flower, d: 0.7 },
      { a: 4.2, color: P.pollen, d: 0.55 },
      { a: 5.5, color: P.glowBright, d: 0.65 },
      { a: 3.6, color: P.flower, d: 0.45 },
    ];
    for (const f of flowers) {
      const fAngle = f.a + time * 0.1;
      const fx = x + Math.cos(fAngle) * canopyR * f.d;
      const fy = canopyY + Math.sin(fAngle) * canopyR * f.d * isoY;
      const bloomAlpha = 0.5 + pulse * 0.2;

      for (let p = 0; p < 6; p++) {
        const pa = (p / 6) * Math.PI * 2 + time * 0.3;
        const pr = s * 0.009;
        ctx.fillStyle = `rgba(${f.color},${bloomAlpha * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(
          fx + Math.cos(pa) * pr,
          fy + Math.sin(pa) * pr,
          s * 0.006,
          s * 0.003,
          pa,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.fillStyle = `rgba(${P.pollen},${bloomAlpha})`;
      ctx.beginPath();
      ctx.arc(fx, fy, s * 0.004, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner canopy glow (isometric ellipse)
  const canopyGlow = ctx.createRadialGradient(
    x,
    canopyY,
    0,
    x,
    canopyY,
    canopyR * 0.6
  );
  canopyGlow.addColorStop(0, `rgba(${P.glowBright},${0.15 + pulse * 0.08})`);
  canopyGlow.addColorStop(0.5, `rgba(${P.glow},${0.07 + pulse * 0.04})`);
  canopyGlow.addColorStop(1, `rgba(${P.glowDark},0)`);
  ctx.fillStyle = canopyGlow;
  ctx.beginPath();
  ctx.ellipse(
    x,
    canopyY,
    canopyR * 0.7,
    canopyR * 0.7 * isoY,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Falling particles (ember rises instead)
  if (P.canopyStyle !== "ember") {
    for (let i = 0; i < 8; i++) {
      const phase = (time * 0.4 + i * 0.125) % 1;
      const fallOrbitA = time * 0.3 + i * 0.79;
      const fallX =
        x +
        Math.sin(time * 1.2 + i * 1.8) * canopyR * 0.5 +
        Math.cos(fallOrbitA) * s * 0.03;
      const fallY = canopyY + phase * s * 0.6;
      const fallAlpha = Math.sin(phase * Math.PI) * 0.42;
      const fallRot = time * 3 + i * 2;

      ctx.fillStyle = `rgba(${P.leaf},${fallAlpha})`;
      ctx.save();
      ctx.translate(fallX, fallY);
      ctx.rotate(fallRot);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.009, s * 0.004, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// ─── COLOSSUS: Leaf Vortex ───────────────────────────────────────────────────

function drawColossusVortex(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  atkBurst: number
) {
  const isoY = ISO_Y_RATIO;
  const vortexCenterY = y - s * 0.08;

  // Isometric orbit rings (inner + outer, counter-rotating)
  const leafCount = 20 + Math.floor(atkBurst * 10);
  for (let i = 0; i < leafCount; i++) {
    const isInner = i < leafCount * 0.45;
    const orbitR = s * (isInner ? 0.5 : 0.72);
    const speed = isInner ? 1.6 : -1.1;
    const vertBob = s * (isInner ? 0.08 : 0.12);
    const a = time * speed + (i / leafCount) * Math.PI * 2;
    const r = orbitR + Math.sin(time * 2 + i * 1.3) * s * 0.05;
    const lx = x + Math.cos(a) * r;
    const ly =
      vortexCenterY +
      Math.sin(a) * r * isoY +
      Math.sin(a * 0.7 + time * 0.8) * vertBob;
    const lAlpha = 0.38 + Math.sin(time * 3 + i * 0.8) * 0.15 + atkBurst * 0.18;
    const lSize = (1.6 + Math.sin(i * 1.1) * 0.5 + atkBurst * 0.6) * zoom;

    // Trailing glow behind each leaf (isometric orbit)
    ctx.fillStyle = `rgba(${P.glow},${lAlpha * 0.3})`;
    const trailA = a - speed * 0.15;
    const trailR = orbitR + Math.sin(time * 2 + i * 1.3 - 0.3) * s * 0.05;
    const trailX = x + Math.cos(trailA) * trailR;
    const trailY =
      vortexCenterY +
      Math.sin(trailA) * trailR * isoY +
      Math.sin(trailA * 0.7 + time * 0.8) * vertBob;
    ctx.beginPath();
    ctx.arc(trailX, trailY, lSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Leaf body with vein
    ctx.fillStyle = `rgba(${P.leaf},${lAlpha})`;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(time * 2.5 + i * 1.4);
    ctx.beginPath();
    ctx.ellipse(0, 0, lSize, lSize * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${P.leafDark},${lAlpha * 0.5})`;
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(-lSize * 0.8, 0);
    ctx.lineTo(lSize * 0.8, 0);
    ctx.stroke();
    // Side veins
    for (let v = 0; v < 2; v++) {
      const vx = (-0.3 + v * 0.6) * lSize;
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx + lSize * 0.15, -lSize * 0.2);
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx + lSize * 0.15, lSize * 0.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Rising pollen/mist particles (isometric spread)
  for (let i = 0; i < 14; i++) {
    const phase = (time * 0.35 + i * 0.071) % 1;
    const orbitA = time * 0.5 + i * 0.45;
    const orbitR = s * (0.25 + Math.sin(i * 1.9) * 0.1);
    const mx = x + Math.cos(orbitA) * orbitR;
    const my =
      y + s * 0.15 - phase * s * 0.7 + Math.sin(orbitA) * orbitR * isoY * 0.3;
    const mAlpha = Math.sin(phase * Math.PI) * (0.38 + atkBurst * 0.18);
    ctx.fillStyle = `rgba(${P.pollen},${mAlpha})`;
    ctx.beginPath();
    ctx.arc(mx, my, (1.4 + atkBurst * 0.5) * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Pollen glow core
    if (i % 3 === 0) {
      ctx.fillStyle = `rgba(${P.glowWhite},${mAlpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(mx, my, (0.6 + atkBurst * 0.2) * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── COLOSSUS: Energy Pulse ──────────────────────────────────────────────────

function drawColossusEnergyPulse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  pulse: number,
  atkBurst: number
) {
  const isoY = ISO_Y_RATIO;

  // Isometric aura ellipse
  const auraR = s * (0.7 + pulse * 0.1 + atkBurst * 0.15);
  const aG = ctx.createRadialGradient(x, y, s * 0.15, x, y, auraR);
  aG.addColorStop(0, `rgba(${P.glow},${0.12 + pulse * 0.06})`);
  aG.addColorStop(0.35, `rgba(${P.vine},${0.05 + pulse * 0.03})`);
  aG.addColorStop(0.7, `rgba(${P.glowDark},${0.02 + pulse * 0.01})`);
  aG.addColorStop(1, `rgba(${P.glowDark},0)`);
  ctx.fillStyle = aG;
  ctx.beginPath();
  ctx.ellipse(x, y, auraR, auraR * isoY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wavy energy boundary — isometric ellipse outline
  ctx.strokeStyle = `rgba(${P.glow},${0.22 + Math.sin(time * 3) * 0.08 + atkBurst * 0.12})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 + time * 1.5;
    const r = s * (0.52 + Math.sin(a * 5 + time * 3) * 0.04);
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r * isoY;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // Second inner wavy ring
  ctx.strokeStyle = `rgba(${P.glowBright},${0.1 + Math.sin(time * 2.5) * 0.05 + atkBurst * 0.06})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2 - time * 1.2;
    const r = s * (0.38 + Math.sin(a * 6 + time * 4) * 0.03);
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r * isoY;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // Ground ring — proper isometric ellipse
  const groundRingY = y + s * 0.3;
  const ringR = s * (0.48 + pulse * 0.06 + atkBurst * 0.1);
  ctx.strokeStyle = `rgba(${P.glow},${0.14 + pulse * 0.07 + atkBurst * 0.08})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, groundRingY, ringR, ringR * isoY, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Inner ground ring
  ctx.strokeStyle = `rgba(${P.glowBright},${0.06 + pulse * 0.04})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    groundRingY,
    ringR * 0.75,
    ringR * 0.75 * isoY,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Spiraling energy diamonds — isometric orbits
  for (let i = 0; i < 10; i++) {
    const phase = (time * 1 + i * 0.1) % 1;
    const spiralA = time * 2 + i * ((Math.PI * 2) / 10);
    const spiralR = s * (0.2 + phase * 0.32);
    const px = x + Math.cos(spiralA) * spiralR;
    const py =
      y - s * 0.08 + Math.sin(spiralA) * spiralR * isoY - phase * s * 0.18;
    const pAlpha = Math.sin(phase * Math.PI) * (0.5 + atkBurst * 0.25);
    const pSize = (1.4 + atkBurst * 1) * zoom;

    ctx.fillStyle = `rgba(${P.glowBright},${pAlpha})`;
    ctx.beginPath();
    ctx.moveTo(px, py - pSize);
    ctx.lineTo(px + pSize * 0.5, py);
    ctx.lineTo(px, py + pSize);
    ctx.lineTo(px - pSize * 0.5, py);
    ctx.closePath();
    ctx.fill();
    // Trailing glow
    const trailA = spiralA - 0.3;
    const trailR = s * (0.2 + phase * 0.28);
    const tx = x + Math.cos(trailA) * trailR;
    const ty =
      y - s * 0.08 + Math.sin(trailA) * trailR * isoY - phase * s * 0.16;
    ctx.fillStyle = `rgba(${P.glow},${pAlpha * 0.25})`;
    ctx.beginPath();
    ctx.arc(tx, ty, pSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── COLOSSUS: Attack Wave ───────────────────────────────────────────────────

function drawColossusAttackWave(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  atkBurst: number,
  time: number,
  zoom: number
) {
  const isoY = ISO_Y_RATIO;
  const groundY = y + s * 0.28;

  // Impact shockwave: proper isometric ellipse ring expanding
  const waveR = s * 0.68 * atkBurst;
  setShadowBlur(ctx, 10 * zoom, P.shadowHex);
  ctx.strokeStyle = `rgba(${P.glow},${atkBurst * 0.38})`;
  ctx.lineWidth = (3.5 + atkBurst * 2.5) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, groundY, waveR, waveR * isoY, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Inner shockwave ring
  ctx.strokeStyle = `rgba(${P.glowBright},${atkBurst * 0.2})`;
  ctx.lineWidth = (1.5 + atkBurst * 1) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, groundY, waveR * 0.7, waveR * 0.7 * isoY, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Outer fading ring
  ctx.strokeStyle = `rgba(${P.glowDark},${atkBurst * 0.12})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, groundY, waveR * 1.2, waveR * 1.2 * isoY, 0, 0, Math.PI * 2);
  ctx.stroke();
  clearShadow(ctx);

  // Root eruptions radiating isometrically
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + time * 2;
    const vineLen = s * (0.58 + i * 0.012) * atkBurst;
    const sway = Math.sin(time * 5 + i * 0.8) * s * 0.04 * atkBurst;
    const tipX = x + Math.cos(a) * vineLen;
    const tipY = y + Math.sin(a) * vineLen * isoY;

    // Multi-segment erupting root
    const rootSegs = 4;
    const rootPts: { x: number; y: number }[] = [];
    for (let seg = 0; seg <= rootSegs; seg++) {
      const t = seg / rootSegs;
      const segSway = sway * t * Math.sin(time * 4 + seg * 1.2);
      rootPts.push({
        x: x + (tipX - x) * t + segSway,
        y: y + s * 0.1 + (tipY - y - s * 0.1) * t,
      });
    }

    // Filled segment trapezoids with gradients
    for (let seg = 0; seg < rootSegs; seg++) {
      const p0 = rootPts[seg];
      const p1 = rootPts[seg + 1];
      const t0 = seg / rootSegs;
      const t1 = (seg + 1) / rootSegs;
      const w0 = s * (0.035 - t0 * 0.008) * atkBurst;
      const w1 = s * (0.035 - t1 * 0.008) * atkBurst;
      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);

      const segGrad = ctx.createLinearGradient(
        p0.x + nx * w0,
        p0.y + ny * w0,
        p0.x - nx * w0,
        p0.y - ny * w0
      );
      segGrad.addColorStop(0, `rgba(90,64,32,${atkBurst * 0.7})`);
      segGrad.addColorStop(0.4, `rgba(61,42,20,${atkBurst * 0.55})`);
      segGrad.addColorStop(1, `rgba(26,18,8,${atkBurst * 0.35})`);
      ctx.fillStyle = segGrad;
      ctx.beginPath();
      ctx.moveTo(p0.x + nx * w0, p0.y + ny * w0);
      ctx.lineTo(p1.x + nx * w1, p1.y + ny * w1);
      ctx.lineTo(p1.x - nx * w1, p1.y - ny * w1);
      ctx.lineTo(p0.x - nx * w0, p0.y - ny * w0);
      ctx.closePath();
      ctx.fill();
    }

    // Bark texture lines on erupting root
    ctx.strokeStyle = `rgba(15,10,4,${atkBurst * 0.35})`;
    ctx.lineWidth = 0.7 * zoom;
    for (let k = 0; k < 3; k++) {
      const t = 0.2 + k * 0.25;
      const idx = Math.min(Math.floor(t * rootSegs), rootSegs - 1);
      const rp = rootPts[idx];
      ctx.beginPath();
      ctx.moveTo(rp.x - s * 0.018, rp.y);
      ctx.lineTo(rp.x + s * 0.018, rp.y);
      ctx.stroke();
    }

    // Glowing vein along root
    setShadowBlur(ctx, 3 * zoom, P.shadowHex);
    ctx.strokeStyle = `rgba(${P.glow},${atkBurst * 0.35})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(rootPts[0].x, rootPts[0].y);
    for (let seg = 1; seg <= rootSegs; seg++) {
      ctx.lineTo(rootPts[seg].x, rootPts[seg].y);
    }
    ctx.stroke();
    clearShadow(ctx);

    // Ground crack at each eruption point (isometric Y)
    const emergeX = x + Math.cos(a) * s * 0.1;
    const emergeY = groundY + Math.sin(a) * s * 0.1 * isoY;
    for (let c = 0; c < 3; c++) {
      const crackA = a + (c - 1) * 0.4;
      const crackLen = s * 0.07 * atkBurst;
      ctx.strokeStyle = `rgba(10,6,2,${atkBurst * 0.28})`;
      ctx.lineWidth = 1.1 * zoom;
      ctx.beginPath();
      ctx.moveTo(emergeX, emergeY);
      ctx.lineTo(
        emergeX + Math.cos(crackA) * crackLen,
        emergeY + Math.sin(crackA) * crackLen * isoY
      );
      ctx.stroke();
    }

    // Thorn tip with bright highlight (isometric Y compression)
    const thornSize = s * 0.042 * atkBurst;
    ctx.fillStyle = `rgba(${P.leafDark},${atkBurst * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(
      tipX + Math.cos(a) * thornSize,
      tipY + Math.sin(a) * thornSize * isoY
    );
    ctx.lineTo(
      tipX + Math.cos(a + 2.3) * thornSize * 0.5,
      tipY + Math.sin(a + 2.3) * thornSize * isoY
    );
    ctx.lineTo(
      tipX + Math.cos(a - 2.3) * thornSize * 0.5,
      tipY + Math.sin(a - 2.3) * thornSize * isoY
    );
    ctx.closePath();
    ctx.fill();
    setShadowBlur(ctx, 4 * zoom, P.shadowHex);
    ctx.fillStyle = `rgba(${P.glowBright},${atkBurst * 0.55})`;
    ctx.beginPath();
    ctx.arc(
      tipX + Math.cos(a) * thornSize,
      tipY + Math.sin(a) * thornSize * isoY,
      zoom * 1.8,
      0,
      Math.PI * 2
    );
    ctx.fill();
    clearShadow(ctx);

    // Dirt/debris particles kicked up
    if (i % 3 === 0) {
      for (let d = 0; d < 4; d++) {
        const debrisPhase = (time * 3 + d * 0.25 + i * 0.5) % 1;
        const dx = emergeX + Math.sin(time * 4 + d * 2 + i) * s * 0.025;
        const dy = emergeY - debrisPhase * s * 0.07;
        const dAlpha = Math.sin(debrisPhase * Math.PI) * atkBurst * 0.45;
        ctx.fillStyle = `rgba(80,55,30,${dAlpha})`;
        ctx.beginPath();
        ctx.arc(dx, dy, s * 0.005, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Leaf burst at root tip (isometric Y)
    if (i % 3 === 0) {
      for (let l = 0; l < 3; l++) {
        const leafA = a + (l - 1) * 0.7;
        const leafDist = s * 0.035 * atkBurst;
        const leafX = tipX + Math.cos(leafA) * leafDist;
        const leafY = tipY + Math.sin(leafA) * leafDist * isoY - s * 0.008;
        ctx.fillStyle = `rgba(${P.leaf},${atkBurst * 0.5})`;
        ctx.save();
        ctx.translate(leafX, leafY);
        ctx.rotate(time * 4 + l + i);
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.013, s * 0.005, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // Ground-level energy wave: isometric glowing crack pattern
  const waveAlpha = atkBurst * 0.28;
  setShadowBlur(ctx, 5 * zoom, P.shadowHex);
  for (let c = 0; c < 16; c++) {
    const cAngle = (c / 16) * Math.PI * 2;
    const cLen = s * (0.32 + Math.sin(time * 2 + c) * 0.06) * atkBurst;
    const cTipX = x + Math.cos(cAngle) * cLen;
    const cTipY = groundY + Math.sin(cAngle) * cLen * isoY;
    ctx.strokeStyle = `rgba(${P.glow},${waveAlpha})`;
    ctx.lineWidth = (2.2 - c * 0.04) * zoom;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.bezierCurveTo(
      x + Math.cos(cAngle) * cLen * 0.4,
      groundY + Math.sin(cAngle) * cLen * 0.4 * isoY,
      x + Math.cos(cAngle) * cLen * 0.7,
      groundY + Math.sin(cAngle) * cLen * 0.7 * isoY,
      cTipX,
      cTipY
    );
    ctx.stroke();
    // Highlight edge
    ctx.strokeStyle = `rgba(${P.glowBright},${waveAlpha * 0.3})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - 0.5, groundY - 0.5);
    ctx.bezierCurveTo(
      x + Math.cos(cAngle) * cLen * 0.4 - 0.5,
      groundY + Math.sin(cAngle) * cLen * 0.4 * isoY - 0.5,
      x + Math.cos(cAngle) * cLen * 0.7 - 0.5,
      groundY + Math.sin(cAngle) * cLen * 0.7 * isoY - 0.5,
      cTipX - 0.5,
      cTipY - 0.5
    );
    ctx.stroke();
  }
  clearShadow(ctx);
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                         NORMAL FORM                                      ║
// ║  Ornate Elven Forest Queen — living armor, nature magic, regal detail   ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ─── WARDEN HEALING AURA ────────────────────────────────────────────────────

function drawHealingAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number
) {
  const isoY = ISO_Y_RATIO;
  const healRadius = s * 2.8;
  const pulse = Math.sin(time * 2) * 0.5 + 0.5;
  const alpha = 0.08 + pulse * 0.07;

  ctx.save();
  const grad = ctx.createRadialGradient(
    x,
    y,
    healRadius * 0.3,
    x,
    y,
    healRadius
  );
  grad.addColorStop(0, `rgba(${P.glow},${alpha * 0.6})`);
  grad.addColorStop(0.6, `rgba(${P.glow},${alpha * 0.3})`);
  grad.addColorStop(1, `rgba(${P.glow},0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, healRadius, healRadius * isoY, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(${P.glow},${0.15 + pulse * 0.12})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.setLineDash([6 * zoom, 4 * zoom]);
  ctx.lineDashOffset = -time * 40;
  ctx.beginPath();
  ctx.ellipse(x, y, healRadius, healRadius * isoY, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${P.glowBright},${0.06 + pulse * 0.06})`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.setLineDash([]);
  const innerR = healRadius * (0.6 + pulse * 0.05);
  ctx.beginPath();
  ctx.ellipse(x, y, innerR, innerR * isoY, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// ─── MAGIC CIRCLE ───────────────────────────────────────────────────────────

function drawMagicCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  atkBurst: number
) {
  const radius = s * (0.35 + atkBurst * 0.15);
  const circleY = y + s * 0.28;
  const alpha = 0.08 + naturePulse * 0.05 + atkBurst * 0.12;

  ctx.save();
  ctx.translate(x, circleY);
  ctx.scale(1, 0.35);
  ctx.rotate(time * 0.3);

  ctx.strokeStyle = `rgba(${P.glowDark},${alpha * 0.35})`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${P.glow},${alpha})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${P.glowBright},${alpha * 0.7})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rx = Math.cos(a) * radius * 0.85;
    const ry = Math.sin(a) * radius * 0.85;
    const runeAlpha = alpha * (0.6 + Math.sin(time * 2 + i * 1.2) * 0.3);
    ctx.fillStyle = `rgba(${P.glowBright},${runeAlpha})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry - s * 0.02);
    ctx.lineTo(rx + s * 0.01, ry);
    ctx.lineTo(rx, ry + s * 0.015);
    ctx.lineTo(rx - s * 0.01, ry);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// ─── ROOT SYSTEM ────────────────────────────────────────────────────────────

function drawRootSystem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  atkBurst: number
) {
  const isoY = ISO_Y_RATIO;
  const groundY = y + s * 0.32;
  const baseY = y + s * 0.24;
  const hipR = s * 0.1;
  const footR = s * 0.38;

  // 8 thick roots radiating isometrically from the skirt hem
  const ROOT_COUNT = 8;
  for (let i = 0; i < ROOT_COUNT; i++) {
    const angle = (i / ROOT_COUNT) * Math.PI * 2 + Math.PI * 0.125;
    const sway = Math.sin(time * 0.6 + i * 1.4) * s * 0.006;

    const hipX = x + Math.cos(angle) * hipR;
    const hipY = baseY + Math.sin(angle) * hipR * isoY;
    const footX = x + Math.cos(angle) * footR + sway;
    const footY = groundY + Math.sin(angle) * footR * isoY;

    // Curved midpoint that hugs the ground
    const midX = (hipX + footX) / 2 + Math.cos(angle) * s * 0.03;
    const midY =
      groundY + Math.sin(angle) * (hipR + footR) * 0.5 * isoY - s * 0.01;

    // Root thickness tapers from base to tip
    const baseWidth = s * (0.04 + (i % 2) * 0.01);
    const tipWidth = s * 0.012;

    // Draw root as tapered segments along a bezier
    const segCount = 4;
    const pts: { x: number; y: number }[] = [];
    for (let seg = 0; seg <= segCount; seg++) {
      const t = seg / segCount;
      const u = 1 - t;
      pts.push({
        x: u * u * hipX + 2 * u * t * midX + t * t * footX,
        y: u * u * hipY + 2 * u * t * midY + t * t * footY,
      });
    }

    for (let seg = 0; seg < segCount; seg++) {
      const p0 = pts[seg];
      const p1 = pts[seg + 1];
      const t0 = seg / segCount;
      const t1 = (seg + 1) / segCount;
      const w0 = baseWidth * (1 - t0 * 0.65) + tipWidth * t0;
      const w1 = baseWidth * (1 - t1 * 0.65) + tipWidth * t1;
      const a = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const nx = -Math.sin(a);
      const ny = Math.cos(a);

      const segG = ctx.createLinearGradient(
        p0.x + nx * w0,
        p0.y + ny * w0,
        p0.x - nx * w0,
        p0.y - ny * w0
      );
      const alpha = 0.75 + naturePulse * 0.1 + atkBurst * 0.1;
      segG.addColorStop(0, `rgba(90,65,35,${alpha * 0.6})`);
      segG.addColorStop(0.3, `rgba(60,42,22,${alpha})`);
      segG.addColorStop(0.7, `rgba(40,28,14,${alpha})`);
      segG.addColorStop(1, `rgba(20,14,6,${alpha * 0.6})`);
      ctx.fillStyle = segG;
      ctx.beginPath();
      ctx.moveTo(p0.x + nx * w0, p0.y + ny * w0);
      ctx.lineTo(p1.x + nx * w1, p1.y + ny * w1);
      ctx.lineTo(p1.x - nx * w1, p1.y - ny * w1);
      ctx.lineTo(p0.x - nx * w0, p0.y - ny * w0);
      ctx.closePath();
      ctx.fill();

      if (seg > 0) {
        ctx.strokeStyle = "rgba(15,10,4,0.35)";
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(p0.x + nx * w0 * 0.7, p0.y + ny * w0 * 0.7);
        ctx.lineTo(p0.x - nx * w0 * 0.7, p0.y - ny * w0 * 0.7);
        ctx.stroke();
      }
    }

    // Glowing vein along root
    setShadowBlur(ctx, 3 * zoom, P.shadowHex);
    ctx.strokeStyle = `rgba(${P.glow},${0.2 + naturePulse * 0.1 + atkBurst * 0.08})`;
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let seg = 1; seg <= segCount; seg++) {
      ctx.lineTo(pts[seg].x, pts[seg].y);
    }
    ctx.stroke();
    clearShadow(ctx);

    // Foot blob where root meets the ground
    const fRx = s * 0.022;
    const fRy = fRx * isoY;
    ctx.fillStyle = `rgba(35,24,12,${0.6 + naturePulse * 0.1})`;
    drawOrganicBlob(ctx, footX, footY, fRx, fRy, 7, 0.2, i * 3.7 + 10);
    ctx.fill();

    // Small sub-roots at tip
    for (let sr = 0; sr < 2; sr++) {
      const subA = angle + (sr - 0.5) * 0.6;
      const subLen = s * (0.03 + sr * 0.005);
      const subTipX = footX + Math.cos(subA) * subLen;
      const subTipY = footY + Math.sin(subA) * subLen * isoY + s * 0.002;
      ctx.strokeStyle = `rgba(${P.rootVine},${0.35 + naturePulse * 0.1})`;
      ctx.lineWidth = (1.2 - sr * 0.2) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(footX, footY);
      ctx.quadraticCurveTo(
        (footX + subTipX) / 2,
        (footY + subTipY) / 2,
        subTipX,
        subTipY
      );
      ctx.stroke();
    }

    // Ground contact shadow
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.beginPath();
    ctx.ellipse(
      footX,
      footY + s * 0.003,
      fRx * 1.3,
      fRy * 0.5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Joint knob where root meets skirt
    const knobR = s * 0.02;
    const knobG = ctx.createRadialGradient(
      hipX - knobR * 0.3,
      hipY - knobR * 0.3,
      knobR * 0.1,
      hipX,
      hipY,
      knobR
    );
    knobG.addColorStop(0, "#6a4828");
    knobG.addColorStop(0.5, "#4a3218");
    knobG.addColorStop(1, "#1a1208");
    ctx.fillStyle = knobG;
    ctx.beginPath();
    ctx.arc(hipX, hipY, knobR, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── SEGMENTED TENTACLE HELPER ──────────────────────────────────────────────

function drawSegmentedTentacle(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  baseAngle: number,
  vineLen: number,
  s: number,
  time: number,
  zoom: number,
  segCount: number,
  phase: number,
  atkBurst: number,
  naturePulse: number,
  baseThick: number,
  showLeaves: boolean,
  showThorns: boolean,
  showGlow: boolean,
  attackLash: boolean
) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segCount; i++) {
    const t = i / segCount;
    const wind1 =
      Math.sin(time * 2.2 + phase + t * 5.5) * s * 0.04 * (0.2 + t * 0.8);
    const wind2 = Math.cos(time * 3.1 + phase * 1.3 + t * 3.8) * s * 0.02 * t;
    const lash = attackLash
      ? Math.sin(atkBurst * Math.PI * 3 + t * 5) * s * 0.055 * atkBurst * t * t
      : 0;
    const curl = t * t * 0.55 + Math.sin(time * 1.5 + phase) * t * 0.3;
    const eff = baseAngle + curl;
    const perp = eff + Math.PI * 0.5;
    pts.push({
      x:
        startX +
        Math.cos(eff) * vineLen * t +
        Math.cos(perp) * (wind1 + wind2 + lash),
      y:
        startY +
        Math.sin(eff) * vineLen * t * 0.5 +
        Math.sin(perp) * (wind1 + wind2 + lash) * 0.5 +
        s * 0.035 * t * t,
    });
  }

  for (let i = 0; i < segCount; i++) {
    const t = i / segCount;
    const thick = s * (baseThick * (1 - t * 0.75) + atkBurst * 0.005);
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const px = Math.cos(angle + Math.PI * 0.5);
    const py = Math.sin(angle + Math.PI * 0.5);

    const segG = ctx.createLinearGradient(
      p1.x + px * thick,
      p1.y + py * thick,
      p1.x - px * thick,
      p1.y - py * thick
    );
    const a = 0.65 + naturePulse * 0.1 + atkBurst * 0.12;
    segG.addColorStop(0, `rgba(${P.vineDark},${a * 0.55})`);
    segG.addColorStop(0.25, `rgba(${P.vine},${a})`);
    segG.addColorStop(0.5, `rgba(${P.vine},${a * 1.08})`);
    segG.addColorStop(0.75, `rgba(${P.vine},${a})`);
    segG.addColorStop(1, `rgba(${P.vineDark},${a * 0.55})`);

    ctx.fillStyle = segG;
    ctx.beginPath();
    ctx.moveTo(p1.x + px * thick, p1.y + py * thick);
    ctx.lineTo(p2.x + px * thick * 0.86, p2.y + py * thick * 0.86);
    ctx.lineTo(p2.x - px * thick * 0.86, p2.y - py * thick * 0.86);
    ctx.lineTo(p1.x - px * thick, p1.y - py * thick);
    ctx.closePath();
    ctx.fill();

    if (i % 2 === 0 && i > 0) {
      ctx.strokeStyle = `rgba(${P.vineDark},${0.35 + atkBurst * 0.12})`;
      ctx.lineWidth = Math.max(0.5, (1.6 - t * 1) * zoom);
      ctx.beginPath();
      ctx.moveTo(p1.x + px * thick * 0.9, p1.y + py * thick * 0.9);
      ctx.lineTo(p1.x - px * thick * 0.9, p1.y - py * thick * 0.9);
      ctx.stroke();
    }

    if (showThorns && i % 3 === 1 && i < segCount - 1) {
      const thornSide = i % 6 < 3 ? 1 : -1;
      const thornLen = s * (0.018 + atkBurst * 0.005) * (1 - t * 0.5);
      const thornBx = p1.x + px * thick * 0.75 * thornSide;
      const thornBy = p1.y + py * thick * 0.75 * thornSide;
      const thornA = angle + thornSide * (0.55 + Math.sin(time * 2 + i) * 0.12);
      const thornTx = thornBx + Math.cos(thornA) * thornLen;
      const thornTy = thornBy + Math.sin(thornA) * thornLen;
      const thornW = s * 0.005 * (1 - t * 0.3);

      const tG = ctx.createLinearGradient(thornBx, thornBy, thornTx, thornTy);
      tG.addColorStop(0, `rgba(${P.vineDark},0.5)`);
      tG.addColorStop(0.5, "rgba(45,30,18,0.6)");
      tG.addColorStop(1, "rgba(85,65,40,0.7)");
      ctx.fillStyle = tG;
      ctx.beginPath();
      ctx.moveTo(
        thornBx - Math.cos(angle) * thornW,
        thornBy - Math.sin(angle) * thornW
      );
      ctx.lineTo(thornTx, thornTy);
      ctx.lineTo(
        thornBx + Math.cos(angle) * thornW,
        thornBy + Math.sin(angle) * thornW
      );
      ctx.closePath();
      ctx.fill();
    }

    if (showLeaves && i % 4 === 2 && i < segCount - 2) {
      const leafSide = i % 8 < 4 ? 1 : -1;
      const lx = p1.x + px * thick * leafSide;
      const ly = p1.y + py * thick * leafSide;
      const leafSz = s * (0.02 + naturePulse * 0.004) * (1 - t * 0.4);
      const leafAng =
        angle + leafSide * (0.8 + Math.sin(time * 2.5 + i * 0.7) * 0.25);
      const lAlpha = 0.45 + naturePulse * 0.2 + atkBurst * 0.1;
      const lox = lx + Math.cos(leafAng) * leafSz * 0.25;
      const loy = ly + Math.sin(leafAng) * leafSz * 0.25;

      ctx.fillStyle = `rgba(${P.leaf},${lAlpha})`;
      ctx.beginPath();
      ctx.moveTo(lox, loy + leafSz * 0.35);
      ctx.bezierCurveTo(
        lox - leafSz * 0.6,
        loy - leafSz * 0.1,
        lox - leafSz * 0.2,
        loy - leafSz * 0.6,
        lox,
        loy - leafSz * 0.25
      );
      ctx.bezierCurveTo(
        lox + leafSz * 0.2,
        loy - leafSz * 0.6,
        lox + leafSz * 0.6,
        loy - leafSz * 0.1,
        lox,
        loy + leafSz * 0.35
      );
      ctx.fill();

      ctx.strokeStyle = `rgba(${P.leafDark},${lAlpha * 0.35})`;
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(lox, loy - leafSz * 0.2);
      ctx.lineTo(lox, loy + leafSz * 0.3);
      ctx.stroke();
    }
  }

  if (showGlow) {
    ctx.strokeStyle = `rgba(${P.glow},${0.12 + naturePulse * 0.08 + atkBurst * 0.1})`;
    ctx.lineWidth = (0.7 + atkBurst * 0.4) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= segCount; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    for (let i = 2; i < segCount; i += 3) {
      const pt = pts[i];
      const nA =
        0.15 + Math.sin(time * 3.2 + phase + i * 1.5) * 0.1 + atkBurst * 0.12;
      ctx.fillStyle = `rgba(${P.glowBright},${nA})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, s * 0.005 + atkBurst * s * 0.003, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tipEnd = pts[segCount];
  const prev = pts[segCount - 1];
  const tipA = Math.atan2(tipEnd.y - prev.y, tipEnd.x - prev.x);
  const curlD = Math.sin(time * 2 + phase) * 0.7;

  ctx.strokeStyle = `rgba(${P.glow},${0.2 + naturePulse * 0.1 + atkBurst * 0.1})`;
  ctx.lineWidth = (0.6 + atkBurst * 0.3) * zoom;
  ctx.beginPath();
  ctx.moveTo(tipEnd.x, tipEnd.y);
  for (let sp = 1; sp <= 10; sp++) {
    const t = sp / 10;
    const spirR = s * 0.022 * (1 - t);
    const spirA = tipA + curlD + t * Math.PI * 2.5;
    ctx.lineTo(
      tipEnd.x + Math.cos(spirA) * spirR,
      tipEnd.y + Math.sin(spirA) * spirR * 0.5
    );
  }
  ctx.stroke();

  setShadowBlur(ctx, 3 * zoom, P.shadowHex);
  ctx.fillStyle = `rgba(${P.glowBright},${0.25 + atkBurst * 0.18 + Math.sin(time * 3.5 + phase) * 0.08})`;
  ctx.beginPath();
  ctx.arc(tipEnd.x, tipEnd.y, s * 0.007 + atkBurst * s * 0.004, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

// ─── VINE TENTACLES (Dense articulated branch array behind the head) ────────

interface BranchDef {
  outerAngle: number;
  rise: number;
  len: number;
  phase: number;
  segs: number;
  thick: number;
  joints?: number[]; // fractional positions where sharp bends occur
  jointAngle?: number; // bend magnitude at joints (radians)
  hasLeaves?: boolean;
  hasThorns?: boolean;
}

function buildBranchPath(
  spineX: number,
  spineY: number,
  s: number,
  t: BranchDef,
  time: number,
  atkBurst: number
): { x: number; y: number }[] {
  const segCount = t.segs;
  const totalLen = s * t.len * (1 + atkBurst * 0.25);
  const swayX =
    Math.sin(time * 1.4 + t.phase) * s * 0.025 +
    Math.sin(time * 2.3 + t.phase * 0.7) * s * 0.01;
  const swayY =
    Math.cos(time * 1.1 + t.phase * 1.3) * s * 0.018 +
    Math.cos(time * 1.9 + t.phase * 0.5) * s * 0.008;
  const pts: { x: number; y: number }[] = [];

  let cumAngle = 0;
  for (let seg = 0; seg <= segCount; seg++) {
    const frac = seg / segCount;
    const riseCurve = Math.sin(frac * Math.PI * 0.8) * t.rise;
    const spreadFrac = frac * frac;
    const wind =
      Math.sin(time * 2.2 + t.phase + frac * 5) * s * 0.035 * frac +
      Math.sin(time * 3.4 + t.phase * 0.8 + frac * 7) * s * 0.012 * frac;
    const wind2 =
      Math.cos(time * 2.8 + t.phase * 1.5 + frac * 3.5) * s * 0.018 * frac;
    const lash =
      atkBurst *
      Math.sin(atkBurst * Math.PI * 3 + frac * 5) *
      s *
      0.04 *
      frac *
      frac;

    // Accumulate joint deflections for sharp bends
    if (t.joints) {
      for (const jf of t.joints) {
        const jSeg = Math.floor(jf * segCount);
        if (seg === jSeg) {
          cumAngle +=
            (t.jointAngle ?? 0.5) *
            (Math.sin(time * 1.3 + t.phase + jf * 4) +
              Math.sin(time * 2.1 + t.phase * 1.6 + jf * 2.5) * 0.3);
        }
      }
    }

    pts.push({
      x:
        spineX +
        Math.cos(t.outerAngle + cumAngle) * totalLen * spreadFrac +
        swayX * frac +
        wind +
        lash,
      y:
        spineY -
        s * riseCurve +
        Math.sin(t.outerAngle + cumAngle) * totalLen * spreadFrac * 0.3 +
        s * 0.08 * frac * frac +
        swayY * frac +
        wind2 * 0.5,
    });
  }
  return pts;
}

function drawBranchSegments(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  atkBurst: number,
  t: BranchDef
) {
  const segCount = t.segs;
  const hasLeaves = t.hasLeaves !== false;
  const hasThorns = t.hasThorns !== false;

  for (let seg = 0; seg < segCount; seg++) {
    const frac = seg / segCount;
    const thick = s * (t.thick * (1 - frac * 0.7) + atkBurst * 0.004);
    const p0 = pts[seg];
    const p1 = pts[seg + 1];
    const a = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const px = Math.cos(a + Math.PI * 0.5);
    const py = Math.sin(a + Math.PI * 0.5);

    const al = 0.65 + naturePulse * 0.1 + atkBurst * 0.12;
    const segG = ctx.createLinearGradient(
      p0.x + px * thick,
      p0.y + py * thick,
      p0.x - px * thick,
      p0.y - py * thick
    );
    segG.addColorStop(0, `rgba(${P.vineDark},${al * 0.55})`);
    segG.addColorStop(0.25, `rgba(${P.vine},${al})`);
    segG.addColorStop(0.5, `rgba(${P.vine},${al * 1.08})`);
    segG.addColorStop(0.75, `rgba(${P.vine},${al})`);
    segG.addColorStop(1, `rgba(${P.vineDark},${al * 0.55})`);
    ctx.fillStyle = segG;
    ctx.beginPath();
    ctx.moveTo(p0.x + px * thick, p0.y + py * thick);
    ctx.lineTo(p1.x + px * thick * 0.88, p1.y + py * thick * 0.88);
    ctx.lineTo(p1.x - px * thick * 0.88, p1.y - py * thick * 0.88);
    ctx.lineTo(p0.x - px * thick, p0.y - py * thick);
    ctx.closePath();
    ctx.fill();

    // Joint ridges
    if (seg % 2 === 0 && seg > 0) {
      ctx.strokeStyle = `rgba(${P.vineDark},${0.35 + atkBurst * 0.12})`;
      ctx.lineWidth = Math.max(0.5, (1.4 - frac * 0.8) * zoom);
      ctx.beginPath();
      ctx.moveTo(p0.x + px * thick * 0.9, p0.y + py * thick * 0.9);
      ctx.lineTo(p0.x - px * thick * 0.9, p0.y - py * thick * 0.9);
      ctx.stroke();
    }

    // Articulated joint knobs at defined positions
    if (t.joints) {
      for (const jf of t.joints) {
        const jSeg = Math.floor(jf * segCount);
        if (seg === jSeg) {
          const jR = thick * 1.4;
          const jGrad = ctx.createRadialGradient(
            p0.x - jR * 0.15,
            p0.y - jR * 0.15,
            jR * 0.1,
            p0.x,
            p0.y,
            jR
          );
          jGrad.addColorStop(0, `rgba(${P.vine},${al * 0.9})`);
          jGrad.addColorStop(0.5, `rgba(${P.vineDark},${al * 0.7})`);
          jGrad.addColorStop(1, `rgba(${P.vineDark},${al * 0.3})`);
          ctx.fillStyle = jGrad;
          ctx.beginPath();
          ctx.arc(p0.x, p0.y, jR, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(${P.vineDark},${0.4 + atkBurst * 0.1})`;
          ctx.lineWidth = 0.6 * zoom;
          ctx.beginPath();
          ctx.arc(p0.x, p0.y, jR * 0.7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Thorns
    if (hasThorns && seg % 3 === 1 && seg < segCount - 1) {
      const thornSide = seg % 6 < 3 ? 1 : -1;
      const thornLen = s * (0.016 + atkBurst * 0.004) * (1 - frac * 0.5);
      const thornBx = p0.x + px * thick * 0.75 * thornSide;
      const thornBy = p0.y + py * thick * 0.75 * thornSide;
      const thornA = a + thornSide * (0.55 + Math.sin(time * 2 + seg) * 0.12);
      const thornTx = thornBx + Math.cos(thornA) * thornLen;
      const thornTy = thornBy + Math.sin(thornA) * thornLen;
      const thornW = s * 0.004 * (1 - frac * 0.3);
      const tG = ctx.createLinearGradient(thornBx, thornBy, thornTx, thornTy);
      tG.addColorStop(0, `rgba(${P.vineDark},0.5)`);
      tG.addColorStop(0.5, "rgba(45,30,18,0.6)");
      tG.addColorStop(1, "rgba(85,65,40,0.7)");
      ctx.fillStyle = tG;
      ctx.beginPath();
      ctx.moveTo(
        thornBx - Math.cos(a) * thornW,
        thornBy - Math.sin(a) * thornW
      );
      ctx.lineTo(thornTx, thornTy);
      ctx.lineTo(
        thornBx + Math.cos(a) * thornW,
        thornBy + Math.sin(a) * thornW
      );
      ctx.closePath();
      ctx.fill();
    }

    // Leaves
    if (
      hasLeaves &&
      seg % 4 === 2 &&
      seg > segCount * 0.3 &&
      seg < segCount - 2
    ) {
      const leafSide = seg % 8 < 4 ? 1 : -1;
      const lx = p0.x + px * thick * leafSide;
      const ly = p0.y + py * thick * leafSide;
      const leafSz = s * (0.018 + naturePulse * 0.003) * (1 - frac * 0.4);
      const leafAng =
        a + leafSide * (0.8 + Math.sin(time * 2.5 + seg * 0.7) * 0.25);
      const lAlpha = 0.45 + naturePulse * 0.2 + atkBurst * 0.1;
      const lox = lx + Math.cos(leafAng) * leafSz * 0.25;
      const loy = ly + Math.sin(leafAng) * leafSz * 0.25;
      ctx.fillStyle = `rgba(${P.leaf},${lAlpha})`;
      ctx.beginPath();
      ctx.moveTo(lox, loy + leafSz * 0.35);
      ctx.bezierCurveTo(
        lox - leafSz * 0.6,
        loy - leafSz * 0.1,
        lox - leafSz * 0.2,
        loy - leafSz * 0.6,
        lox,
        loy - leafSz * 0.25
      );
      ctx.bezierCurveTo(
        lox + leafSz * 0.2,
        loy - leafSz * 0.6,
        lox + leafSz * 0.6,
        loy - leafSz * 0.1,
        lox,
        loy + leafSz * 0.35
      );
      ctx.fill();
    }
  }

  // Glowing vein
  ctx.strokeStyle = `rgba(${P.glow},${0.12 + naturePulse * 0.08 + atkBurst * 0.1})`;
  ctx.lineWidth = (0.7 + atkBurst * 0.3) * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let seg = 1; seg <= segCount; seg++) {
    ctx.lineTo(pts[seg].x, pts[seg].y);
  }
  ctx.stroke();

  // Glowing tip with curl
  const tipEnd = pts[segCount];
  const tipPrev = pts[segCount - 1];
  const tipA = Math.atan2(tipEnd.y - tipPrev.y, tipEnd.x - tipPrev.x);
  const curlD = Math.sin(time * 2 + t.phase) * 0.7;
  ctx.strokeStyle = `rgba(${P.glow},${0.2 + naturePulse * 0.1 + atkBurst * 0.1})`;
  ctx.lineWidth = (0.6 + atkBurst * 0.3) * zoom;
  ctx.beginPath();
  ctx.moveTo(tipEnd.x, tipEnd.y);
  for (let sp = 1; sp <= 10; sp++) {
    const f = sp / 10;
    const spirR = s * 0.02 * (1 - f);
    const spirA = tipA + curlD + f * Math.PI * 2.5;
    ctx.lineTo(
      tipEnd.x + Math.cos(spirA) * spirR,
      tipEnd.y + Math.sin(spirA) * spirR * 0.5
    );
  }
  ctx.stroke();
  setShadowBlur(ctx, 3 * zoom, P.shadowHex);
  ctx.fillStyle = `rgba(${P.glowBright},${0.25 + atkBurst * 0.18 + Math.sin(time * 3.5 + t.phase) * 0.08})`;
  ctx.beginPath();
  ctx.arc(tipEnd.x, tipEnd.y, s * 0.007 + atkBurst * s * 0.004, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

function drawVineTentacles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  atkBurst: number
) {
  const spineX = x;
  const spineY = y - s * 0.12;

  // 4 primary Doc-Ock tentacles (thick, long, jointed)
  const primary: BranchDef[] = [
    {
      jointAngle: 0.45,
      joints: [0.35, 0.65],
      len: 0.7,
      outerAngle: Math.PI - 1.1,
      phase: 0,
      rise: 0.42,
      segs: 16,
      thick: 0.036,
    },
    {
      jointAngle: 0.4,
      joints: [0.3, 0.6],
      len: 0.78,
      outerAngle: Math.PI - 0.45,
      phase: 1.8,
      rise: 0.48,
      segs: 18,
      thick: 0.034,
    },
    {
      jointAngle: 0.4,
      joints: [0.3, 0.6],
      len: 0.78,
      outerAngle: -0.45,
      phase: 3.2,
      rise: 0.48,
      segs: 18,
      thick: 0.034,
    },
    {
      jointAngle: 0.45,
      joints: [0.35, 0.65],
      len: 0.7,
      outerAngle: -1.1,
      phase: 4.6,
      rise: 0.42,
      segs: 16,
      thick: 0.036,
    },
  ];

  // 4 medium branches — arch high behind the head with visible elbow joints
  const medium: BranchDef[] = [
    {
      hasThorns: false,
      jointAngle: 0.6,
      joints: [0.4],
      len: 0.55,
      outerAngle: Math.PI - 0.8,
      phase: 0.9,
      rise: 0.55,
      segs: 12,
      thick: 0.026,
    },
    {
      jointAngle: 0.55,
      joints: [0.45, 0.75],
      len: 0.48,
      outerAngle: Math.PI - 0.2,
      phase: 2.5,
      rise: 0.62,
      segs: 10,
      thick: 0.024,
    },
    {
      jointAngle: 0.55,
      joints: [0.45, 0.75],
      len: 0.48,
      outerAngle: -0.2,
      phase: 4.1,
      rise: 0.62,
      segs: 10,
      thick: 0.024,
    },
    {
      hasThorns: false,
      jointAngle: 0.6,
      joints: [0.4],
      len: 0.55,
      outerAngle: -0.8,
      phase: 5.5,
      rise: 0.55,
      segs: 12,
      thick: 0.026,
    },
  ];

  // 6 small wispy branches — shorter, thinner, more erratic, rise high
  const small: BranchDef[] = [
    {
      hasLeaves: false,
      hasThorns: false,
      jointAngle: 0.7,
      joints: [0.5],
      len: 0.38,
      outerAngle: Math.PI - 1.35,
      phase: 0.5,
      rise: 0.35,
      segs: 8,
      thick: 0.018,
    },
    {
      hasLeaves: false,
      hasThorns: false,
      len: 0.35,
      outerAngle: Math.PI - 0.65,
      phase: 1.3,
      rise: 0.58,
      segs: 8,
      thick: 0.016,
    },
    {
      hasLeaves: false,
      hasThorns: false,
      jointAngle: 0.5,
      joints: [0.4, 0.7],
      len: 0.32,
      outerAngle: Math.PI + 0.05,
      phase: 2.9,
      rise: 0.68,
      segs: 7,
      thick: 0.014,
    },
    {
      hasLeaves: false,
      hasThorns: false,
      jointAngle: 0.5,
      joints: [0.4, 0.7],
      len: 0.32,
      outerAngle: -0.05,
      phase: 3.7,
      rise: 0.68,
      segs: 7,
      thick: 0.014,
    },
    {
      hasLeaves: false,
      hasThorns: false,
      len: 0.35,
      outerAngle: -0.65,
      phase: 5,
      rise: 0.58,
      segs: 8,
      thick: 0.016,
    },
    {
      hasLeaves: false,
      hasThorns: false,
      jointAngle: 0.7,
      joints: [0.5],
      len: 0.38,
      outerAngle: -1.35,
      phase: 5.8,
      rise: 0.35,
      segs: 8,
      thick: 0.018,
    },
  ];

  // Draw back-to-front: small first (furthest back), then medium, then primary
  const allBranches = [...small, ...medium, ...primary];
  for (const br of allBranches) {
    const pts = buildBranchPath(spineX, spineY, s, br, time, atkBurst);
    drawBranchSegments(ctx, pts, s, time, zoom, naturePulse, atkBurst, br);
  }
}

// ─── LEAF CAPE ──────────────────────────────────────────────────────────────

function drawLeafCape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  atkBurst: number
) {
  const vineWave =
    Math.sin(time * (1.2 + atkBurst * 2)) * (0.15 + atkBurst * 0.1);
  const capeW = s * 0.28;

  const capeGrad = ctx.createLinearGradient(x, y - s * 0.18, x, y + s * 0.44);
  capeGrad.addColorStop(0, "#143828");
  capeGrad.addColorStop(0.2, "#0d3020");
  capeGrad.addColorStop(0.45, "#0a2818");
  capeGrad.addColorStop(0.7, "#082010");
  capeGrad.addColorStop(1, "rgba(5,18,10,0.4)");

  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.16);
  ctx.bezierCurveTo(
    x - s * 0.38,
    y + s * 0.08 + vineWave * s * 0.04,
    x - s * 0.34,
    y + s * 0.3,
    x - capeW,
    y + s * 0.44
  );
  ctx.lineTo(x + capeW, y + s * 0.44);
  ctx.bezierCurveTo(
    x + s * 0.34,
    y + s * 0.3,
    x + s * 0.38,
    y + s * 0.08 - vineWave * s * 0.04,
    x + s * 0.2,
    y - s * 0.16
  );
  ctx.closePath();
  ctx.fill();

  // Diagonal vine cross-hatch overlay
  ctx.strokeStyle = `rgba(${P.vine},${0.06 + naturePulse * 0.03})`;
  ctx.lineWidth = 0.4 * zoom;
  for (let i = 0; i < 8; i++) {
    const hy = y - s * 0.08 + i * s * 0.06;
    const hw = s * (0.1 + i * 0.02);
    ctx.beginPath();
    ctx.moveTo(x - hw, hy);
    ctx.lineTo(x - hw + s * 0.08, hy + s * 0.06);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + hw, hy);
    ctx.lineTo(x + hw - s * 0.08, hy + s * 0.06);
    ctx.stroke();
  }

  // Leaf vein embroidery across the cape surface
  ctx.strokeStyle = `rgba(${P.vine},${0.12 + naturePulse * 0.06 + atkBurst * 0.06})`;
  ctx.lineWidth = 0.6 * zoom;
  const embroideryLeaves = [
    { angle: 0.3, cx: -0.08, cy: 0, sz: 0.04 },
    { angle: -0.4, cx: 0.06, cy: 0.05, sz: 0.035 },
    { angle: 0.5, cx: -0.12, cy: 0.12, sz: 0.04 },
    { angle: -0.2, cx: 0.1, cy: 0.15, sz: 0.038 },
    { angle: 0.1, cx: -0.04, cy: 0.22, sz: 0.032 },
    { angle: -0.6, cx: 0.02, cy: -0.04, sz: 0.03 },
    { angle: 0.7, cx: -0.15, cy: 0.06, sz: 0.028 },
    { angle: -0.3, cx: 0.13, cy: 0.25, sz: 0.035 },
    { angle: 0, cx: 0, cy: 0.1, sz: 0.04 },
    { angle: 0.4, cx: -0.06, cy: 0.28, sz: 0.03 },
  ];
  for (const leaf of embroideryLeaves) {
    const lx = x + leaf.cx * s;
    const ly = y + leaf.cy * s;
    const sz = leaf.sz * s;
    ctx.beginPath();
    ctx.moveTo(lx - sz * 0.5, ly);
    ctx.quadraticCurveTo(lx, ly - sz * 0.6, lx + sz * 0.5, ly);
    ctx.quadraticCurveTo(lx, ly + sz * 0.6, lx - sz * 0.5, ly);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lx - sz * 0.4, ly);
    ctx.lineTo(lx + sz * 0.4, ly);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lx, ly - sz * 0.3);
    ctx.lineTo(lx, ly + sz * 0.3);
    ctx.stroke();
  }

  // Glowing vine trim along both side edges
  setShadowBlur(ctx, 3 * zoom, P.shadowHex);
  ctx.strokeStyle = `rgba(${P.glow},${0.18 + naturePulse * 0.1 + atkBurst * 0.08})`;
  ctx.lineWidth = 0.9 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.2, y - s * 0.16);
    ctx.bezierCurveTo(
      x + side * s * 0.36,
      y + s * 0.08,
      x + side * s * 0.32,
      y + s * 0.3,
      x + side * capeW,
      y + s * 0.44
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Central Tree of Life emblem on upper back
  const tolX = x;
  const tolY = y - s * 0.02;
  ctx.strokeStyle = `rgba(${P.glow},${0.15 + naturePulse * 0.08})`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(tolX, tolY + s * 0.04);
  ctx.lineTo(tolX, tolY - s * 0.06);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tolX, tolY - s * 0.04);
  ctx.quadraticCurveTo(
    tolX - s * 0.025,
    tolY - s * 0.065,
    tolX - s * 0.02,
    tolY - s * 0.07
  );
  ctx.moveTo(tolX, tolY - s * 0.04);
  ctx.quadraticCurveTo(
    tolX + s * 0.025,
    tolY - s * 0.065,
    tolX + s * 0.02,
    tolY - s * 0.07
  );
  ctx.moveTo(tolX, tolY - s * 0.02);
  ctx.quadraticCurveTo(
    tolX - s * 0.02,
    tolY - s * 0.04,
    tolX - s * 0.015,
    tolY - s * 0.05
  );
  ctx.moveTo(tolX, tolY - s * 0.02);
  ctx.quadraticCurveTo(
    tolX + s * 0.02,
    tolY - s * 0.04,
    tolX + s * 0.015,
    tolY - s * 0.05
  );
  ctx.moveTo(tolX, tolY + s * 0.04);
  ctx.quadraticCurveTo(
    tolX - s * 0.02,
    tolY + s * 0.06,
    tolX - s * 0.025,
    tolY + s * 0.065
  );
  ctx.moveTo(tolX, tolY + s * 0.04);
  ctx.quadraticCurveTo(
    tolX + s * 0.02,
    tolY + s * 0.06,
    tolX + s * 0.025,
    tolY + s * 0.065
  );
  ctx.stroke();

  // Scalloped leaf edge at bottom — 18 overlapping leaves
  for (let i = 0; i < 18; i++) {
    const t = i / 18;
    const hx = x - capeW + t * capeW * 2;
    const hy =
      y +
      s * 0.42 +
      Math.sin(time * (1.8 + atkBurst * 3) + i * 0.7) *
        s *
        (0.012 + atkBurst * 0.008);
    const hSize = s * (0.025 + atkBurst * 0.005);

    ctx.fillStyle = `rgba(20,80,40,${0.45 + naturePulse * 0.12 + atkBurst * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.bezierCurveTo(
      hx - hSize,
      hy + hSize * 0.8,
      hx,
      hy + hSize * 1.6,
      hx + hSize,
      hy + hSize * 0.8
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(${P.vine},${0.2 + naturePulse * 0.08})`;
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(hx, hy + hSize * 0.15);
    ctx.lineTo(hx, hy + hSize * 1.3);
    ctx.stroke();
  }

  // Ornate gem clasps at shoulders (2.5x size with glow halos)
  for (const side of [-1, 1]) {
    const clX = x + side * s * 0.18;
    const clY = y - s * 0.16;
    const clR = s * 0.045;
    const clG = ctx.createRadialGradient(
      clX - clR * 0.2,
      clY - clR * 0.2,
      0,
      clX,
      clY,
      clR
    );
    clG.addColorStop(0, `rgb(${P.glowWhite})`);
    clG.addColorStop(0.3, `rgb(${P.glowBright})`);
    clG.addColorStop(0.6, P.shadowHex);
    clG.addColorStop(1, "#065f46");
    ctx.fillStyle = clG;
    ctx.beginPath();
    ctx.arc(clX, clY, clR, 0, Math.PI * 2);
    ctx.fill();

    setShadowBlur(ctx, 6 * zoom, P.shadowHex);
    ctx.fillStyle = `rgba(${P.glowBright},${0.25 + naturePulse * 0.12})`;
    ctx.beginPath();
    ctx.arc(clX, clY, clR * 2.2, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);

    ctx.fillStyle = `rgba(255,255,255,${0.5 + naturePulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(clX - clR * 0.2, clY - clR * 0.25, clR * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── SKIRT ──────────────────────────────────────────────────────────────────

function drawSkirt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  atkBurst: number
) {
  const skirtTop = y + s * 0.05;
  const skirtBot = y + s * 0.32;
  const swaySpeed = 1.5 + atkBurst * 3;

  const skGrad = ctx.createLinearGradient(x, skirtTop, x, skirtBot);
  skGrad.addColorStop(0, "#1a4030");
  skGrad.addColorStop(0.3, "#153525");
  skGrad.addColorStop(0.7, "#0d2818");
  skGrad.addColorStop(1, "#082010");

  ctx.fillStyle = skGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.13, skirtTop);
  const leftSway = Math.sin(time * swaySpeed) * s * (0.02 + atkBurst * 0.02);
  const rightSway =
    Math.sin(time * swaySpeed + 1) * s * (0.02 + atkBurst * 0.02);
  ctx.bezierCurveTo(
    x - s * 0.22 + leftSway,
    skirtTop + s * 0.08,
    x - s * 0.24 + leftSway,
    skirtBot - s * 0.04,
    x - s * 0.2 + leftSway,
    skirtBot
  );
  ctx.lineTo(x + s * 0.2 + rightSway, skirtBot);
  ctx.bezierCurveTo(
    x + s * 0.24 + rightSway,
    skirtBot - s * 0.04,
    x + s * 0.22 + rightSway,
    skirtTop + s * 0.08,
    x + s * 0.13,
    skirtTop
  );
  ctx.closePath();
  ctx.fill();

  // Leaf scale pattern — rows of overlapping tiny leaf shapes
  const rows = 5;
  const skirtH = skirtBot - skirtTop;
  for (let row = 0; row < rows; row++) {
    const ry = skirtTop + skirtH * (0.18 + row * 0.16);
    const rowW = s * (0.12 + row * 0.018);
    const leavesPerRow = 6 + row;
    for (let l = 0; l < leavesPerRow; l++) {
      const t = (l + 0.5) / leavesPerRow;
      const lx = x - rowW + t * rowW * 2;
      const leafSz = s * (0.012 + row * 0.001);
      const leafAlpha = 0.2 + naturePulse * 0.08 + row * 0.02;
      ctx.fillStyle = `rgba(${P.leafDark},${leafAlpha})`;
      ctx.beginPath();
      ctx.moveTo(lx, ry - leafSz * 0.3);
      ctx.quadraticCurveTo(
        lx - leafSz * 0.6,
        ry + leafSz * 0.2,
        lx,
        ry + leafSz * 0.6
      );
      ctx.quadraticCurveTo(
        lx + leafSz * 0.6,
        ry + leafSz * 0.2,
        lx,
        ry - leafSz * 0.3
      );
      ctx.fill();
    }

    // Glowing seam line between rows
    ctx.strokeStyle = `rgba(${P.glow},${0.08 + naturePulse * 0.04})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - rowW, ry + s * 0.008);
    ctx.bezierCurveTo(
      x - rowW * 0.3,
      ry + s * 0.012,
      x + rowW * 0.3,
      ry + s * 0.006,
      x + rowW,
      ry + s * 0.008
    );
    ctx.stroke();
  }

  // Vine belt at waistline with gem buckle
  const beltY = skirtTop + s * 0.01;
  ctx.strokeStyle = `rgba(${P.vineDark},${0.5 + naturePulse * 0.15})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.13, beltY);
  ctx.bezierCurveTo(
    x - s * 0.04,
    beltY - s * 0.006,
    x + s * 0.04,
    beltY + s * 0.004,
    x + s * 0.13,
    beltY
  );
  ctx.stroke();

  const buckleR = s * 0.012;
  const buckleG = ctx.createRadialGradient(
    x - buckleR * 0.2,
    beltY - buckleR * 0.2,
    0,
    x,
    beltY,
    buckleR
  );
  buckleG.addColorStop(0, `rgb(${P.glowWhite})`);
  buckleG.addColorStop(0.5, P.shadowHex);
  buckleG.addColorStop(1, "#065f46");
  ctx.fillStyle = buckleG;
  ctx.beginPath();
  ctx.arc(x, beltY, buckleR, 0, Math.PI * 2);
  ctx.fill();

  // Side slit detail with vine trim
  for (const side of [-1, 1]) {
    const slitX = x + side * s * 0.18;
    const slitTopY = skirtBot - s * 0.1;
    ctx.strokeStyle = `rgba(${P.vine},${0.15 + naturePulse * 0.06})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(slitX + leftSway * side * 0.3, slitTopY);
    ctx.lineTo(slitX + (side > 0 ? rightSway : leftSway) * 0.5, skirtBot);
    ctx.stroke();
  }

  // Hanging leaf tassels at hem
  for (let i = 0; i < 8; i++) {
    const t = (i + 0.5) / 8;
    const tx = x - s * 0.18 + t * s * 0.36;
    const tSway = Math.sin(time * (2 + atkBurst * 2) + i * 0.9) * s * 0.006;
    const tLen = s * (0.02 + Math.sin(i * 1.7) * 0.005);
    ctx.fillStyle = `rgba(${P.leaf},${0.35 + naturePulse * 0.12})`;
    ctx.save();
    ctx.translate(tx + tSway, skirtBot + tLen * 0.5);
    ctx.rotate(tSway * 3);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.006, tLen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── BODY ───────────────────────────────────────────────────────────────────

function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  breathe: number,
  time: number,
  zoom: number,
  naturePulse: number,
  atkBurst: number
) {
  const bodyW = s * (0.17 + breathe * 0.002 + atkBurst * 0.01) * 1.15;
  const bodyH = s * (0.26 + breathe * 0.003 + atkBurst * 0.015) * 1.1;

  // ── SHADOW DEPTH ELLIPSE ──────────────────────────────────────────
  ctx.fillStyle = "#061208";
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.008, bodyW * 1.03, bodyH * 1.02, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── BASE TORSO ────────────────────────────────────────────────────
  const bodyGrad = ctx.createRadialGradient(
    x,
    y - s * 0.03,
    s * 0.03,
    x,
    y + s * 0.01,
    bodyH
  );
  bodyGrad.addColorStop(0, "#2d6a48");
  bodyGrad.addColorStop(0.2, "#1e5235");
  bodyGrad.addColorStop(0.5, "#164028");
  bodyGrad.addColorStop(0.8, "#0d2e1c");
  bodyGrad.addColorStop(1, "#081a10");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── BARK TEXTURE OVERLAY — curved plate boundaries ────────────────
  const plateBounds = [
    { ex: 0, ey: 0.18, sx: 0, sy: -0.2 },
    { ex: -0.06, ey: 0.16, sx: -0.08, sy: -0.18 },
    { ex: 0.06, ey: 0.16, sx: 0.08, sy: -0.18 },
  ];
  for (let i = 0; i < plateBounds.length; i++) {
    const pb = plateBounds[i];
    const drift = Math.sin(time * 0.8 + i * 1.5) * s * 0.002;
    ctx.strokeStyle = "rgba(10,30,18,0.25)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + pb.sx * s + drift, y + pb.sy * s);
    ctx.bezierCurveTo(
      x + pb.sx * s + s * 0.004 + drift,
      y + (pb.sy + pb.ey) * 0.3 * s,
      x + pb.ex * s - s * 0.004 + drift,
      y + (pb.sy + pb.ey) * 0.7 * s,
      x + pb.ex * s + drift,
      y + pb.ey * s
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(60,100,70,0.12)";
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + pb.sx * s + drift + 0.5, y + pb.sy * s + 0.5);
    ctx.bezierCurveTo(
      x + pb.sx * s + s * 0.004 + drift + 0.5,
      y + (pb.sy + pb.ey) * 0.3 * s + 0.5,
      x + pb.ex * s - s * 0.004 + drift + 0.5,
      y + (pb.sy + pb.ey) * 0.7 * s + 0.5,
      x + pb.ex * s + drift + 0.5,
      y + pb.ey * s + 0.5
    );
    ctx.stroke();
  }

  // ── STRUCTURED BARK PLATE ARMOR ───────────────────────────────────
  const barkPlates = [
    { cx: 0, cy: -0.07, h: 0.12, label: "chest", w: 0.1 },
    { cx: -0.08, cy: 0, h: 0.1, label: "leftSide", w: 0.065 },
    { cx: 0.08, cy: 0, h: 0.1, label: "rightSide", w: 0.065 },
    { cx: -0.035, cy: 0.1, h: 0.065, label: "lowerLeft", w: 0.06 },
    { cx: 0.035, cy: 0.1, h: 0.065, label: "lowerRight", w: 0.06 },
  ];
  for (let pi = 0; pi < barkPlates.length; pi++) {
    const bp = barkPlates[pi];
    const px = x + bp.cx * s;
    const py = y + bp.cy * s;
    const pw = bp.w * s + Math.sin(time * 1.2 + pi * 1.1) * s * 0.002;
    const ph = bp.h * s + Math.sin(time * 1.5 + pi * 0.8) * s * 0.001;

    const SEGS = 4;
    const segH = ph / SEGS;
    for (let si = 0; si < SEGS; si++) {
      const t0 = si / SEGS;
      const t1 = (si + 1) / SEGS;
      const topY = py - ph * 0.5 + si * segH;
      const botY = topY + segH;
      const topW = pw * (1 - t0 * 0.15);
      const botW = pw * (1 - t1 * 0.15);

      const segG = ctx.createLinearGradient(px - topW, topY, px + topW, topY);
      const sh = si % 2 === 0 ? 0 : 8;
      segG.addColorStop(0, `rgb(${30 + sh},${56 + sh},${40 + sh})`);
      segG.addColorStop(0.3, `rgb(${46 + sh},${80 + sh},${56 + sh})`);
      segG.addColorStop(0.5, `rgb(${54 + sh},${92 + sh},${64 + sh})`);
      segG.addColorStop(0.7, `rgb(${46 + sh},${80 + sh},${56 + sh})`);
      segG.addColorStop(1, `rgb(${30 + sh},${56 + sh},${40 + sh})`);

      ctx.fillStyle = segG;
      ctx.beginPath();
      ctx.moveTo(px - topW, topY);
      ctx.lineTo(px + topW, topY);
      ctx.lineTo(px + botW, botY);
      ctx.lineTo(px - botW, botY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(80,120,85,${0.2 + si * 0.05})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(px - topW * 0.95, topY + 0.5);
      ctx.lineTo(px + topW * 0.95, topY + 0.5);
      ctx.stroke();
      ctx.strokeStyle = "rgba(5,15,8,0.3)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(px - topW * 0.95, topY);
      ctx.lineTo(px + topW * 0.95, topY);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(5,15,8,0.25)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(px - pw, py - ph * 0.5);
    ctx.lineTo(px - pw * (1 - 0.15), py + ph * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + pw, py - ph * 0.5);
    ctx.lineTo(px + pw * (1 - 0.15), py + ph * 0.5);
    ctx.stroke();

    const crackA = 0.08 + breathe * 0.01 + atkBurst * 0.08;
    ctx.strokeStyle = `rgba(${P.glow},${crackA})`;
    ctx.lineWidth = (0.4 + atkBurst * 0.2) * zoom;
    ctx.beginPath();
    ctx.moveTo(px - pw * 0.3, py - ph * 0.2);
    ctx.bezierCurveTo(
      px - pw * 0.05,
      py - ph * 0.05,
      px + pw * 0.05,
      py + ph * 0.1,
      px + pw * 0.25,
      py + ph * 0.2
    );
    ctx.stroke();
  }

  // Knot bumps at plate intersections
  const plateKnots = [
    { kx: 0, ky: -0.01 },
    { kx: -0.04, ky: 0.06 },
    { kx: 0.04, ky: 0.06 },
  ];
  for (let ki = 0; ki < plateKnots.length; ki++) {
    const pk = plateKnots[ki];
    const kx = x + pk.kx * s;
    const ky = y + pk.ky * s;
    const kSz = s * (0.01 + Math.sin(ki * 4.3) * 0.002);
    const kG = ctx.createRadialGradient(
      kx - kSz * 0.2,
      ky - kSz * 0.2,
      kSz * 0.1,
      kx,
      ky,
      kSz
    );
    kG.addColorStop(0, "#5a7858");
    kG.addColorStop(0.5, "#2a4830");
    kG.addColorStop(1, "#1a3018");
    ctx.fillStyle = kG;
    ctx.beginPath();
    ctx.ellipse(
      kx,
      ky,
      kSz,
      kSz * 0.65,
      Math.sin(ki * 3) * 0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(5,15,8,0.25)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.arc(kx, ky, kSz * 0.45, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── VEIN LINES along plate edges ──────────────────────────────────
  setShadowBlur(ctx, 3 * zoom, P.shadowHex);
  const veinPaths = [
    { ex: 0.09, ey: -0.04, sx: -0.09, sy: -0.04 },
    { ex: 0, ey: -0.01, sx: -0.05, sy: -0.13 },
    { ex: 0, ey: -0.01, sx: 0.05, sy: -0.13 },
    { ex: -0.06, ey: 0.13, sx: -0.1, sy: -0.01 },
    { ex: 0.06, ey: 0.13, sx: 0.1, sy: -0.01 },
    { ex: 0.035, ey: 0.06, sx: -0.035, sy: 0.06 },
  ];
  for (let vi = 0; vi < veinPaths.length; vi++) {
    const vn = veinPaths[vi];
    const pulse = Math.sin(time * 2.8 + vi * 0.8) * 0.06;
    const vAlpha = 0.15 + naturePulse * 0.12 + atkBurst * 0.15 + pulse;
    ctx.strokeStyle = `rgba(${P.glow},${vAlpha})`;
    ctx.lineWidth =
      (0.8 + Math.sin(time * 3 + vi) * 0.2 + atkBurst * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(x + vn.sx * s, y + vn.sy * s);
    ctx.quadraticCurveTo(
      x + (vn.sx + vn.ex) * 0.5 * s,
      y + (vn.sy + vn.ey) * 0.5 * s + s * 0.008,
      x + vn.ex * s,
      y + vn.ey * s
    );
    ctx.stroke();

    if (vi % 2 === 0) {
      const nodeX = x + (vn.sx + vn.ex) * 0.5 * s;
      const nodeY = y + (vn.sy + vn.ey) * 0.5 * s + s * 0.004;
      ctx.fillStyle = `rgba(${P.glowBright},${0.15 + pulse + atkBurst * 0.12})`;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, s * 0.004, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  clearShadow(ctx);

  // ── INNER GLOW ────────────────────────────────────────────────────
  const glowR = s * (0.14 + atkBurst * 0.06);
  const glow = ctx.createRadialGradient(x, y - s * 0.04, 0, x, y, glowR);
  glow.addColorStop(0, `rgba(${P.glowBright},${0.14 + atkBurst * 0.22})`);
  glow.addColorStop(0.5, `rgba(${P.glow},${0.07 + atkBurst * 0.12})`);
  glow.addColorStop(1, `rgba(${P.glowDark},0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.04, glowR, 0, Math.PI * 2);
  ctx.fill();

  // ── RIM HIGHLIGHT following plate structure ────────────────────────
  const rimAlpha =
    0.2 + naturePulse * 0.14 + atkBurst * 0.16 + Math.sin(time * 2) * 0.04;
  ctx.strokeStyle = `rgba(110,231,183,${rimAlpha})`;
  ctx.lineWidth = (1.3 + atkBurst * 0.6 + Math.sin(time * 3) * 0.2) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, -0.9, Math.PI * 0.35);
  ctx.stroke();

  // ── DELIBERATE MOSS ACCENTS at plate edges ────────────────────────
  const mossPts = [
    { dx: -0.1, dy: -0.08, r: 0.013 },
    { dx: 0.1, dy: -0.08, r: 0.012 },
    { dx: -0.08, dy: 0.06, r: 0.011 },
    { dx: 0.08, dy: 0.06, r: 0.011 },
    { dx: 0, dy: 0.14, r: 0.01 },
  ];
  for (let mi = 0; mi < mossPts.length; mi++) {
    const mp = mossPts[mi];
    const mx = x + mp.dx * s;
    const my = y + mp.dy * s;
    const mGrow = Math.sin(time * 1.5 + mi * 1.2) * 0.15;
    const mr = (mp.r + mGrow * 0.003) * s;
    ctx.fillStyle = `rgba(${P.leafDark},${0.22 + Math.sin(time * 2 + mi * 0.8) * 0.05 + atkBurst * 0.08})`;
    drawOrganicBlob(
      ctx,
      mx,
      my,
      mr,
      mr * 0.6,
      7,
      0.2,
      mi * 3.3 + 310 + time * 0.3
    );
    ctx.fill();
  }
}

// ─── BRANCH CORSET ──────────────────────────────────────────────────────────

function drawBranchCorset(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  mossGlow: number,
  atkBurst: number
) {
  for (const side of [-1, 1]) {
    for (let b = 0; b < 7; b++) {
      const bY = y - s * 0.2 + b * s * 0.055;
      const curve =
        Math.sin(time * 1.2 + b * 1.5 + side) * s * (0.01 + atkBurst * 0.005);
      const bW = s * (0.16 - b * 0.006);
      const breathShift = Math.sin(time * 1.8 + b * 0.4) * s * 0.002;

      const bGrad = ctx.createLinearGradient(
        x + side * s * 0.02,
        bY,
        x + side * bW * 0.7,
        bY + s * 0.03
      );
      bGrad.addColorStop(0, `rgba(82,56,28,${0.6 + b * 0.05})`);
      bGrad.addColorStop(0.5, `rgba(65,42,22,${0.55 + b * 0.05})`);
      bGrad.addColorStop(1, `rgba(50,32,16,${0.45 + b * 0.04})`);
      ctx.strokeStyle = bGrad;
      ctx.lineWidth = (3.2 - b * 0.15 + atkBurst * 0.6) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x + side * s * 0.02, bY + breathShift);
      ctx.bezierCurveTo(
        x + side * bW * 0.5 + curve,
        bY - s * 0.018 + breathShift,
        x + side * bW * 0.85 + curve,
        bY + s * 0.005 + breathShift,
        x + side * bW * 0.7,
        bY + s * 0.03 + breathShift
      );
      ctx.stroke();

      ctx.strokeStyle = `rgba(90,60,30,${0.15 + b * 0.02})`;
      ctx.lineWidth = (1.5 - b * 0.1) * zoom;
      ctx.beginPath();
      ctx.moveTo(x + side * s * 0.02, bY + breathShift - s * 0.002);
      ctx.bezierCurveTo(
        x + side * bW * 0.45 + curve,
        bY - s * 0.014 + breathShift,
        x + side * bW * 0.75 + curve,
        bY + s * 0.002 + breathShift,
        x + side * bW * 0.6,
        bY + s * 0.025 + breathShift
      );
      ctx.stroke();

      for (let k = 0; k < 5; k++) {
        const bt = 0.15 + k * 0.17;
        const bx =
          x + side * (s * 0.02 + (bW * 0.7 - s * 0.02) * bt) + curve * bt;
        const by = bY + s * 0.015 * bt + breathShift * bt;
        ctx.fillStyle = `rgba(55,38,18,${0.3 + b * 0.04})`;
        ctx.beginPath();
        ctx.arc(
          bx,
          by,
          s * (0.004 + Math.sin(k * 2.3) * 0.001),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      if (b % 2 === 1) {
        const spT = 0.6;
        const spx =
          x + side * (s * 0.02 + (bW * 0.7 - s * 0.02) * spT) + curve * spT;
        const spy = bY + s * 0.015 * spT + breathShift * spT;
        const spLen = s * 0.015;
        const spDir = side * (0.4 + Math.sin(time * 1.5 + b) * 0.15);
        ctx.strokeStyle = `rgba(${P.vine},${0.3 + naturePulse * 0.1})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(spx, spy);
        ctx.quadraticCurveTo(
          spx + Math.cos(spDir) * spLen * 0.6,
          spy + Math.sin(spDir) * spLen * 0.4,
          spx + Math.cos(spDir) * spLen,
          spy + Math.sin(spDir) * spLen
        );
        ctx.stroke();
      }
    }
  }

  ctx.strokeStyle = `rgba(${P.vine},${0.3 + naturePulse * 0.12})`;
  ctx.lineWidth = 0.8 * zoom;
  for (const yOff of [-0.2, -0.05, 0.08, 0.15]) {
    const ty = y + yOff * s;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.15, ty);
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const wx = x - s * 0.15 + t * s * 0.3;
      const wy =
        ty + Math.sin(t * Math.PI * 3.5 + time * 1.8 + yOff * 5) * s * 0.005;
      ctx.lineTo(wx, wy);
    }
    ctx.stroke();
  }

  const gemPositions = [
    { dx: -0.06, dy: -0.12 },
    { dx: 0.06, dy: -0.07 },
    { dx: -0.04, dy: 0 },
    { dx: 0.04, dy: 0.06 },
    { dx: 0, dy: -0.04 },
    { dx: -0.07, dy: 0.08 },
  ];
  for (let g = 0; g < gemPositions.length; g++) {
    const gp = gemPositions[g];
    const gx = x + gp.dx * s;
    const gy = y + gp.dy * s;
    const gr = s * (0.007 + Math.sin(time * 2.5 + g * 1.3) * 0.001);
    const gemG = ctx.createRadialGradient(
      gx - gr * 0.2,
      gy - gr * 0.2,
      0,
      gx,
      gy,
      gr
    );
    gemG.addColorStop(0, `rgb(${P.glowWhite})`);
    gemG.addColorStop(0.5, P.shadowHex);
    gemG.addColorStop(1, `rgb(${P.glowDark})`);
    ctx.fillStyle = gemG;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();

    setShadowBlur(ctx, (4 + Math.sin(time * 3.5 + g) * 2) * zoom, P.shadowHex);
    ctx.fillStyle = `rgba(${P.glowBright},${0.2 + naturePulse * 0.12 + atkBurst * 0.08})`;
    ctx.beginPath();
    ctx.arc(gx, gy, gr * 2.8, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  }

  const runeGlow = 0.45 + naturePulse * 0.6 + atkBurst * 0.3;
  setShadowBlur(ctx, (6 + atkBurst * 6) * zoom, P.shadowHex);
  ctx.strokeStyle = `rgba(${P.glow},${runeGlow})`;
  ctx.lineWidth = (2 + atkBurst * 0.5) * zoom;

  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.01);
  ctx.lineTo(x, y - s * 0.15);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.12);
  ctx.quadraticCurveTo(
    x - s * 0.055,
    y - s * 0.16,
    x - s * 0.045,
    y - s * 0.18
  );
  ctx.moveTo(x, y - s * 0.12);
  ctx.quadraticCurveTo(
    x + s * 0.055,
    y - s * 0.16,
    x + s * 0.045,
    y - s * 0.18
  );
  ctx.moveTo(x, y - s * 0.09);
  ctx.quadraticCurveTo(x - s * 0.045, y - s * 0.12, x - s * 0.04, y - s * 0.14);
  ctx.moveTo(x, y - s * 0.09);
  ctx.quadraticCurveTo(x + s * 0.045, y - s * 0.12, x + s * 0.04, y - s * 0.14);
  ctx.moveTo(x, y - s * 0.065);
  ctx.quadraticCurveTo(x - s * 0.03, y - s * 0.09, x - s * 0.025, y - s * 0.1);
  ctx.moveTo(x, y - s * 0.065);
  ctx.quadraticCurveTo(x + s * 0.03, y - s * 0.09, x + s * 0.025, y - s * 0.1);
  ctx.moveTo(x, y - s * 0.04);
  ctx.quadraticCurveTo(
    x - s * 0.018,
    y - s * 0.06,
    x - s * 0.015,
    y - s * 0.07
  );
  ctx.moveTo(x, y - s * 0.04);
  ctx.quadraticCurveTo(
    x + s * 0.018,
    y - s * 0.06,
    x + s * 0.015,
    y - s * 0.07
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.01);
  ctx.quadraticCurveTo(
    x - s * 0.04,
    y + s * 0.035,
    x - s * 0.05,
    y + s * 0.045
  );
  ctx.moveTo(x, y + s * 0.01);
  ctx.quadraticCurveTo(
    x + s * 0.04,
    y + s * 0.035,
    x + s * 0.05,
    y + s * 0.045
  );
  ctx.moveTo(x, y + s * 0.02);
  ctx.quadraticCurveTo(
    x - s * 0.025,
    y + s * 0.04,
    x - s * 0.035,
    y + s * 0.05
  );
  ctx.moveTo(x, y + s * 0.02);
  ctx.quadraticCurveTo(
    x + s * 0.025,
    y + s * 0.04,
    x + s * 0.035,
    y + s * 0.05
  );
  ctx.stroke();

  for (const tip of [
    { x: x - s * 0.045, y: y - s * 0.18 },
    { x: x + s * 0.045, y: y - s * 0.18 },
    { x: x - s * 0.04, y: y - s * 0.14 },
    { x: x + s * 0.04, y: y - s * 0.14 },
  ]) {
    ctx.fillStyle = `rgba(${P.glowBright},${runeGlow * 0.4})`;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, s * 0.003, 0, Math.PI * 2);
    ctx.fill();
  }
  clearShadow(ctx);

  const mossPts = [
    { dx: -0.1, dy: -0.12, r: 0.014 },
    { dx: 0.09, dy: -0.08, r: 0.012 },
    { dx: -0.07, dy: -0.02, r: 0.013 },
    { dx: 0.06, dy: -0.03, r: 0.011 },
    { dx: -0.11, dy: 0.03, r: 0.012 },
    { dx: 0.1, dy: 0.04, r: 0.011 },
    { dx: -0.04, dy: 0.1, r: 0.01 },
    { dx: 0.03, dy: 0.09, r: 0.013 },
    { dx: 0, dy: -0.17, r: 0.01 },
    { dx: -0.12, dy: -0.06, r: 0.009 },
    { dx: 0.11, dy: -0.01, r: 0.01 },
  ];
  for (let i = 0; i < mossPts.length; i++) {
    const mp = mossPts[i];
    const mx = x + mp.dx * s;
    const my = y + mp.dy * s;
    const mr = mp.r * s;
    ctx.fillStyle = `rgba(${P.leafDark},${0.2 + mossGlow * 0.14 + Math.sin(time * 1.5 + i * 1.1) * 0.04})`;
    drawOrganicBlob(
      ctx,
      mx,
      my,
      mr,
      mr * 0.6,
      7,
      0.2,
      i * 3.3 + 310 + time * 0.2
    );
    ctx.fill();
  }
}

// ─── SHOULDERS ──────────────────────────────────────────────────────────────

function drawShoulders(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  mossGlow: number,
  atkBurst: number
) {
  for (const side of [-1, 1]) {
    const sx = x + side * s * 0.2;
    const sy = y - s * 0.16;
    const paulR = s * 0.08;

    const spikeCount = 5;
    for (let sp = 0; sp < spikeCount; sp++) {
      const spAngle =
        (sp / spikeCount) * Math.PI + (side === 1 ? 0 : Math.PI) + side * 0.3;
      const spBaseR = paulR * 0.75;
      const spLen = paulR * (0.35 + (sp % 2 === 0 ? 0.1 : 0));
      const spWidth = paulR * 0.12;
      const bpx = sx + Math.cos(spAngle) * spBaseR;
      const bpy = sy + Math.sin(spAngle) * spBaseR * 0.55;
      const tpx = sx + Math.cos(spAngle) * (spBaseR + spLen);
      const tpy = sy + Math.sin(spAngle) * (spBaseR + spLen) * 0.55;
      const spPerp = spAngle + Math.PI * 0.5;

      const spG = ctx.createLinearGradient(bpx, bpy, tpx, tpy);
      spG.addColorStop(0, "#4a3820");
      spG.addColorStop(0.4, "#3a2c18");
      spG.addColorStop(0.8, "#2a2010");
      spG.addColorStop(1, "#5a4a38");
      ctx.fillStyle = spG;
      ctx.beginPath();
      ctx.moveTo(
        bpx + Math.cos(spPerp) * spWidth,
        bpy + Math.sin(spPerp) * spWidth
      );
      ctx.lineTo(tpx, tpy);
      ctx.lineTo(
        bpx - Math.cos(spPerp) * spWidth,
        bpy - Math.sin(spPerp) * spWidth
      );
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(100,80,50,0.25)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        bpx + Math.cos(spPerp) * spWidth * 0.5,
        bpy + Math.sin(spPerp) * spWidth * 0.5
      );
      ctx.lineTo(tpx, tpy);
      ctx.stroke();
    }

    const paulGrad = ctx.createRadialGradient(
      sx - paulR * 0.25,
      sy - paulR * 0.3,
      paulR * 0.05,
      sx,
      sy,
      paulR
    );
    paulGrad.addColorStop(0, "#5e4c2c");
    paulGrad.addColorStop(0.2, "#4e3c22");
    paulGrad.addColorStop(0.5, "#3e2e18");
    paulGrad.addColorStop(0.8, "#2e2010");
    paulGrad.addColorStop(1, "#201808");
    ctx.fillStyle = paulGrad;
    drawOrganicBlob(
      ctx,
      sx,
      sy,
      paulR,
      paulR * 0.55,
      12,
      0.15,
      side * 13 + 320 + time * 0.08
    );
    ctx.fill();

    ctx.fillStyle = "rgba(85,70,45,0.2)";
    drawOrganicBlob(
      ctx,
      sx - paulR * 0.12,
      sy - paulR * 0.2,
      paulR * 0.5,
      paulR * 0.25,
      8,
      0.1,
      side * 7 + 325
    );
    ctx.fill();

    ctx.strokeStyle = "rgba(15,10,5,0.2)";
    ctx.lineWidth = 0.5 * zoom;
    drawOrganicBlob(
      ctx,
      sx,
      sy,
      paulR * 1.02,
      paulR * 0.56,
      12,
      0.15,
      side * 13 + 320 + time * 0.08
    );
    ctx.stroke();

    for (let vw = 0; vw < 3; vw++) {
      const vwAngle =
        (vw / 3) * Math.PI * 0.6 +
        side * 0.2 +
        Math.sin(time * 1 + vw * 1.2) * 0.08;
      ctx.strokeStyle = `rgba(${P.vine},${0.3 + naturePulse * 0.1 + vw * 0.05})`;
      ctx.lineWidth = (0.8 + vw * 0.15) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        sx,
        sy,
        paulR * (0.85 - vw * 0.08),
        paulR * (0.42 - vw * 0.04),
        side * 0.3 + vwAngle,
        0,
        Math.PI * 1.4
      );
      ctx.stroke();
    }

    setShadowBlur(ctx, 5 * zoom, P.shadowHex);
    const runeA =
      0.3 +
      naturePulse * 0.22 +
      Math.sin(time * 2.5 + side * 2) * 0.12 +
      atkBurst * 0.15;
    ctx.strokeStyle = `rgba(${P.glow},${runeA})`;
    ctx.lineWidth = (0.8 + atkBurst * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy - paulR * 0.32);
    ctx.lineTo(sx + side * paulR * 0.18, sy);
    ctx.lineTo(sx, sy + paulR * 0.28);
    ctx.lineTo(sx - side * paulR * 0.18, sy);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx - paulR * 0.22, sy);
    ctx.lineTo(sx + paulR * 0.22, sy);
    ctx.moveTo(sx, sy - paulR * 0.22);
    ctx.lineTo(sx, sy + paulR * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx, sy, paulR * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    clearShadow(ctx);

    const runeGemG = ctx.createRadialGradient(
      sx - s * 0.002,
      sy - s * 0.002,
      0,
      sx,
      sy,
      s * 0.008
    );
    runeGemG.addColorStop(0, `rgb(${P.glowWhite})`);
    runeGemG.addColorStop(0.5, P.shadowHex);
    runeGemG.addColorStop(1, `rgb(${P.glowDark})`);
    ctx.fillStyle = runeGemG;
    ctx.beginPath();
    ctx.arc(sx, sy, s * 0.007, 0, Math.PI * 2);
    ctx.fill();

    for (let f = 0; f < 4; f++) {
      const flAngle = (f / 4) * Math.PI * 2 + side * 0.5 + time * 0.15;
      const flDist = paulR * 0.38;
      const bloomX = sx + Math.cos(flAngle) * flDist;
      const bloomY = sy - paulR * 0.12 + Math.sin(flAngle) * flDist * 0.4;
      const petalAlpha = 0.5 + naturePulse * 0.2 + atkBurst * 0.12;

      for (let p = 0; p < 6; p++) {
        const pa = (p / 6) * Math.PI * 2 + time * 0.5 + f * 0.8;
        const pr = s * 0.01;
        ctx.fillStyle = `rgba(${P.flower},${petalAlpha * 0.45})`;
        ctx.beginPath();
        ctx.ellipse(
          bloomX + Math.cos(pa) * pr,
          bloomY + Math.sin(pa) * pr,
          s * 0.007,
          s * 0.003,
          pa,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.fillStyle = `rgba(${P.pollen},${petalAlpha})`;
      ctx.beginPath();
      ctx.arc(bloomX, bloomY, s * 0.0035, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let l = 0; l < 9; l++) {
      const la = ((l + 0.5) / 9) * Math.PI * 0.9 + Math.PI * 0.05;
      const lBaseX = sx + Math.cos(la + Math.PI * 0.5 * side) * paulR * 0.72;
      const lBaseY = sy + paulR * 0.38;
      const leafSway = Math.sin(time * 2.8 + l * 0.8 + side * 1.5) * s * 0.005;
      const leafLen = s * (0.02 + Math.sin(l * 1.3) * 0.005);
      ctx.fillStyle = `rgba(${P.leaf},${0.42 + naturePulse * 0.16 + atkBurst * 0.08})`;
      ctx.save();
      ctx.translate(lBaseX + leafSway, lBaseY);
      ctx.rotate(Math.PI * 0.5 + leafSway * 2.5);
      ctx.beginPath();
      ctx.ellipse(0, leafLen * 0.5, s * 0.0045, leafLen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = `rgba(${P.pollen},${(0.5 + naturePulse * 0.22) * 0.12})`;
    ctx.beginPath();
    ctx.arc(sx, sy - paulR * 0.12, paulR * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── ARMS ───────────────────────────────────────────────────────────────────

function drawArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  atkBurst: number
) {
  const armSwing = isAttacking ? Math.sin(atkBurst * Math.PI * 3) * 0.5 : 0;

  for (const side of [-1, 1]) {
    const shX = x + side * s * 0.18;
    const shY = y - s * 0.1;
    const midX = shX + side * s * 0.06;
    const midY = shY + s * 0.06 + armSwing * side * s * 0.02;
    const elX = shX + side * s * 0.12;
    const elY = shY + s * 0.12 + armSwing * side * s * 0.04;

    const armGrad = ctx.createLinearGradient(shX, shY, elX, elY);
    armGrad.addColorStop(0, "#1e5235");
    armGrad.addColorStop(0.35, "#1a4830");
    armGrad.addColorStop(0.7, "#164028");
    armGrad.addColorStop(1, "#123820");
    ctx.strokeStyle = armGrad;
    ctx.lineWidth = (5 + atkBurst * 0.6) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.bezierCurveTo(
      shX + side * s * 0.02,
      shY + s * 0.03,
      midX,
      midY,
      elX,
      elY
    );
    ctx.stroke();

    ctx.strokeStyle = "rgba(30,80,55,0.2)";
    ctx.lineWidth = (2.5 + atkBurst * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(shX - side * s * 0.005, shY - s * 0.003);
    ctx.bezierCurveTo(
      shX + side * s * 0.015,
      shY + s * 0.025,
      midX - side * s * 0.005,
      midY - s * 0.003,
      elX - side * s * 0.005,
      elY
    );
    ctx.stroke();

    for (let v = 0; v < 6; v++) {
      const t = (v + 0.2) / 7;
      const vx = shX + (elX - shX) * t;
      const vy = shY + (elY - shY) * t;
      const vinePhase = Math.sin(time * 1.8 + v * 0.9 + side * 1.3) * 0.08;
      const vineAlpha =
        0.35 + atkBurst * 0.12 + Math.sin(time * 2.5 + v * 1.1) * 0.06;
      ctx.strokeStyle = `rgba(${P.vine},${vineAlpha})`;
      ctx.lineWidth = (0.9 + v * 0.05) * zoom;
      ctx.beginPath();
      ctx.arc(
        vx + side * s * 0.012,
        vy,
        Math.abs(s * (0.015 + vinePhase * 0.5)),
        -0.3,
        Math.PI + 0.3
      );
      ctx.stroke();
    }

    const gauntPlates = [
      { rx: 0.024, ry: 0.016, t: 0.5 },
      { rx: 0.026, ry: 0.018, t: 0.7 },
      { rx: 0.02, ry: 0.014, t: 0.85 },
    ];
    for (let g = 0; g < gauntPlates.length; g++) {
      const gp = gauntPlates[g];
      const gx = shX + (elX - shX) * gp.t + side * s * 0.01;
      const gy = shY + (elY - shY) * gp.t;
      const gauntGrad = ctx.createRadialGradient(
        gx - s * 0.006,
        gy - s * 0.006,
        s * 0.002,
        gx,
        gy,
        gp.rx * s
      );
      gauntGrad.addColorStop(0, "#5e4c2c");
      gauntGrad.addColorStop(0.4, "#4a3820");
      gauntGrad.addColorStop(0.8, "#362a16");
      gauntGrad.addColorStop(1, "#2a2010");
      ctx.fillStyle = gauntGrad;
      drawOrganicBlob(
        ctx,
        gx,
        gy,
        gp.rx * s,
        gp.ry * s,
        8,
        0.15,
        side * 11 + 340 + g * 7
      );
      ctx.fill();

      ctx.strokeStyle = `rgba(${P.glow},${0.1 + Math.sin(time * 2.8 + g * 1.5) * 0.05})`;
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(gx - gp.rx * s * 0.3, gy);
      ctx.lineTo(gx + gp.rx * s * 0.3, gy);
      ctx.stroke();
    }

    for (let p = 0; p < 5; p++) {
      const pt = (time * 1.5 + p * 0.2 + side * 0.5) % 1;
      const px = shX + (elX - shX) * pt;
      const py = shY + (elY - shY) * pt;
      const pAlpha = Math.sin(pt * Math.PI) * (0.28 + atkBurst * 0.18);
      const pSize = s * (0.004 + Math.sin(time * 4 + p) * 0.001);
      ctx.fillStyle = `rgba(${P.glow},${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px + side * s * 0.008, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }

    const wristX = elX + side * s * 0.005;
    const wristY = elY + s * 0.01;
    for (let l = 0; l < 4; l++) {
      const la = (l - 1.5) * 0.55 + side * 0.3;
      const leafSz = s * (0.013 + l * 0.002);
      const leafSway = Math.sin(time * 2.5 + l * 0.8 + side) * 0.15;
      ctx.fillStyle = `rgba(${P.leaf},${0.42 + atkBurst * 0.12 + Math.sin(time * 3 + l) * 0.05})`;
      ctx.save();
      ctx.translate(wristX, wristY);
      ctx.rotate(la + leafSway);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -s * 0.004,
        -leafSz * 0.3,
        -s * 0.002,
        -leafSz * 0.8,
        0,
        -leafSz
      );
      ctx.bezierCurveTo(
        s * 0.002,
        -leafSz * 0.8,
        s * 0.004,
        -leafSz * 0.3,
        0,
        0
      );
      ctx.fill();
      ctx.restore();
    }

    if (side === 1) {
      const handX = elX;
      const handY = elY + s * 0.05;
      const handGrad = ctx.createRadialGradient(
        handX - s * 0.005,
        handY - s * 0.005,
        0,
        handX,
        handY,
        s * 0.028
      );
      handGrad.addColorStop(0, "#2a6a48");
      handGrad.addColorStop(0.5, "#1e5235");
      handGrad.addColorStop(1, "#144028");
      ctx.fillStyle = handGrad;
      ctx.beginPath();
      ctx.ellipse(handX, handY, s * 0.024, s * 0.03, 0.2, 0, Math.PI * 2);
      ctx.fill();

      for (let fg = 0; fg < 3; fg++) {
        const fAngle = 0.2 + fg * 0.3 + Math.sin(time * 2 + fg) * 0.08;
        const fLen = s * 0.018;
        ctx.strokeStyle = "#1a4530";
        ctx.lineWidth = 1.5 * zoom;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(
          handX + Math.cos(fAngle) * s * 0.015,
          handY + Math.sin(fAngle) * s * 0.02
        );
        ctx.lineTo(
          handX + Math.cos(fAngle) * (s * 0.015 + fLen),
          handY + Math.sin(fAngle) * (s * 0.02 + fLen)
        );
        ctx.stroke();
      }
    }
  }
}

// ─── BRANCH STAFF ───────────────────────────────────────────────────────────

function drawCrookedStaff(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  magicPulse: number,
  atkBurst: number
) {
  ctx.save();

  // Lean the staff further outward with idle sway
  const staffSway =
    Math.sin(time * 1.2 + 0.5) * 0.04 + Math.sin(time * 2.1) * 0.015;
  const anchorX = x - s * 0.12;
  const anchorY = y + s * 0.06;
  ctx.translate(anchorX, anchorY);
  ctx.rotate(-0.18 + staffSway);
  ctx.translate(-anchorX, -anchorY);

  // Build a gnarled spine with 14 segments
  const SEG_COUNT = 14;
  const staffBotX = x - s * 0.22;
  const staffBotY = y + s * 0.32;
  const staffTopX = x - s * 0.28;
  const staffTopY = y - s * 0.58;

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= SEG_COUNT; i++) {
    const t = i / SEG_COUNT;
    const lx = staffBotX + (staffTopX - staffBotX) * t;
    const ly = staffBotY + (staffTopY - staffBotY) * t;
    const gnarlX =
      Math.sin(t * 8.5 + 2.3) * s * 0.018 + Math.sin(t * 4.1 + 0.7) * s * 0.012;
    const gnarlY = Math.cos(t * 6.3 + 1.1) * s * 0.008;
    pts.push({ x: lx + gnarlX, y: ly + gnarlY });
  }

  // Tapered bark trapezoid segments
  for (let i = 0; i < SEG_COUNT; i++) {
    const t0 = i / SEG_COUNT;
    const t1 = (i + 1) / SEG_COUNT;
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const a = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const px = Math.cos(a + Math.PI * 0.5);
    const py = Math.sin(a + Math.PI * 0.5);
    const w0 = s * (0.028 - t0 * 0.013);
    const w1 = s * (0.028 - t1 * 0.013);

    const segG = ctx.createLinearGradient(
      p0.x + px * w0,
      p0.y + py * w0,
      p0.x - px * w0,
      p0.y - py * w0
    );
    segG.addColorStop(0, "#7a5830");
    segG.addColorStop(0.3, "#5a4020");
    segG.addColorStop(0.7, "#4a3418");
    segG.addColorStop(1, "#2a1a08");
    ctx.fillStyle = segG;
    ctx.beginPath();
    ctx.moveTo(p0.x + px * w0, p0.y + py * w0);
    ctx.lineTo(p1.x + px * w1, p1.y + py * w1);
    ctx.lineTo(p1.x - px * w1, p1.y - py * w1);
    ctx.lineTo(p0.x - px * w0, p0.y - py * w0);
    ctx.closePath();
    ctx.fill();

    // Bark ridge lines
    if (i > 0 && i % 2 === 0) {
      ctx.strokeStyle = "rgba(15,10,4,0.4)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(p0.x + px * w0 * 0.85, p0.y + py * w0 * 0.85);
      ctx.lineTo(p0.x - px * w0 * 0.85, p0.y - py * w0 * 0.85);
      ctx.stroke();
      ctx.strokeStyle = "rgba(90,64,32,0.18)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(p0.x + px * w0 * 0.8, p0.y + py * w0 * 0.8 - 0.5);
      ctx.lineTo(p0.x - px * w0 * 0.8, p0.y - py * w0 * 0.8);
      ctx.stroke();
    }
  }

  // Knot bumps — 3D radial-gradient spheres
  const knotPositions = [0.2, 0.45, 0.7];
  for (const kt of knotPositions) {
    const idx = Math.floor(kt * SEG_COUNT);
    const kp = pts[idx];
    const kSize = s * (0.014 + Math.sin(kt * 7) * 0.004);
    const kGrad = ctx.createRadialGradient(
      kp.x - kSize * 0.2,
      kp.y - kSize * 0.2,
      kSize * 0.1,
      kp.x,
      kp.y,
      kSize
    );
    kGrad.addColorStop(0, "#6a4828");
    kGrad.addColorStop(0.5, "#3a2510");
    kGrad.addColorStop(1, "#2a1808");
    ctx.fillStyle = kGrad;
    ctx.beginPath();
    ctx.ellipse(
      kp.x,
      kp.y,
      kSize,
      kSize * 0.7,
      Math.sin(kt * 5) * 0.6,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(15,10,4,0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, kSize * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Sub-branches sprouting from the main shaft
  const subBranches = [
    { angle: 0.6, at: 0.3, len: 0.08, side: 1 },
    { angle: -0.5, at: 0.5, len: 0.1, side: -1 },
    { angle: 0.7, at: 0.65, len: 0.07, side: 1 },
    { angle: -0.65, at: 0.8, len: 0.09, side: -1 },
    { angle: 0.4, at: 0.55, len: 0.06, side: 1 },
  ];
  for (const br of subBranches) {
    const idx = Math.floor(br.at * SEG_COUNT);
    const bp = pts[idx];
    const nextP = pts[Math.min(idx + 1, SEG_COUNT)];
    const segA = Math.atan2(nextP.y - bp.y, nextP.x - bp.x);
    const brA = segA + br.angle + Math.sin(time * 1.5 + br.at * 3) * 0.06;
    const brLen = s * br.len;
    const tipX = bp.x + Math.cos(brA) * brLen;
    const tipY = bp.y + Math.sin(brA) * brLen;

    ctx.strokeStyle = "#4a3418";
    ctx.lineWidth = (2 - br.at * 0.6) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bp.x, bp.y);
    ctx.quadraticCurveTo(
      bp.x +
        Math.cos(brA) * brLen * 0.5 +
        Math.sin(time * 0.8 + br.at * 5) * s * 0.003,
      bp.y + Math.sin(brA) * brLen * 0.5,
      tipX,
      tipY
    );
    ctx.stroke();

    const leafSz = s * (0.012 + naturePulse * 0.003);
    ctx.fillStyle = `rgba(${P.leaf},${0.4 + naturePulse * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(tipX, tipY, leafSz, leafSz * 0.5, brA, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moss patches using organic blobs
  const mossSpots = [0.15, 0.35, 0.6, 0.82];
  for (const mp of mossSpots) {
    const idx = Math.floor(mp * SEG_COUNT);
    const mpt = pts[idx];
    const mossW = s * (0.022 + Math.sin(mp * 9) * 0.006);
    const mossH = mossW * 0.4;
    ctx.fillStyle = `rgba(${P.vine},${0.25 + naturePulse * 0.1})`;
    drawOrganicBlob(ctx, mpt.x, mpt.y, mossW, mossH, 7, 0.25, mp * 13 + 42);
    ctx.fill();
  }

  // Vine wraps spiraling around the shaft
  ctx.strokeStyle = `rgba(${P.glowDark},${0.45 + atkBurst * 0.15})`;
  ctx.lineWidth = (1.2 + atkBurst * 0.3) * zoom;
  for (let v = 0; v < 5; v++) {
    const t = 0.08 + v * 0.18;
    const idx = Math.floor(t * SEG_COUNT);
    const vp = pts[idx];
    const vW = s * (0.022 - t * 0.006);
    ctx.beginPath();
    ctx.arc(vp.x, vp.y, vW, -0.6, Math.PI + 0.6);
    ctx.stroke();
  }

  // Fork prongs at the crown
  const topPt = pts[SEG_COUNT];
  const prePt = pts[SEG_COUNT - 1];
  const topA = Math.atan2(topPt.y - prePt.y, topPt.x - prePt.x);

  const prongs = [
    { curve: -0.35, da: -0.6, len: 0.1 },
    { curve: 0.1, da: -0.15, len: 0.12 },
    { curve: 0.4, da: 0.45, len: 0.09 },
  ];
  ctx.strokeStyle = "#4a3018";
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  for (const p of prongs) {
    const pA = topA + p.da;
    const tipPx = topPt.x + Math.cos(pA) * s * p.len;
    const tipPy = topPt.y + Math.sin(pA) * s * p.len;
    ctx.beginPath();
    ctx.moveTo(topPt.x, topPt.y);
    ctx.quadraticCurveTo(
      topPt.x + Math.cos(pA + p.curve) * s * p.len * 0.5,
      topPt.y + Math.sin(pA + p.curve) * s * p.len * 0.5,
      tipPx,
      tipPy
    );
    ctx.stroke();
  }

  // Crystal orb cradled in fork
  const crystalX = topPt.x + Math.cos(topA) * s * 0.03;
  const crystalY = topPt.y + Math.sin(topA) * s * 0.03 - s * 0.04;
  const crystalR = s * (0.048 + atkBurst * 0.012) * 1.3;

  setShadowBlur(ctx, (15 + atkBurst * 12) * zoom, P.shadowHex);
  const cGrad = ctx.createRadialGradient(
    crystalX,
    crystalY,
    0,
    crystalX,
    crystalY,
    crystalR
  );
  cGrad.addColorStop(0, `rgba(${P.glowWhite},${0.95 + magicPulse * 0.05})`);
  cGrad.addColorStop(0.2, `rgb(${P.glowBright})`);
  cGrad.addColorStop(0.5, P.shadowHex);
  cGrad.addColorStop(0.8, `rgb(${P.glowDark})`);
  cGrad.addColorStop(1, "#047857");
  ctx.fillStyle = cGrad;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const cr = i % 2 === 0 ? crystalR : crystalR * 0.85;
    const cx = crystalX + Math.cos(a) * cr;
    const cy = crystalY + Math.sin(a) * cr;
    if (i === 0) {
      ctx.moveTo(cx, cy);
    } else {
      ctx.lineTo(cx, cy);
    }
  }
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);

  // Facet lines inside crystal
  ctx.strokeStyle = `rgba(${P.glowBright},0.3)`;
  ctx.lineWidth = 0.5 * zoom;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(crystalX, crystalY);
    ctx.lineTo(
      crystalX + Math.cos(a) * crystalR * 0.85,
      crystalY + Math.sin(a) * crystalR * 0.85
    );
    ctx.stroke();
  }

  // Glow halo
  const glowAlpha = 0.25 + Math.sin(time * 3) * 0.12 + atkBurst * 0.25;
  ctx.fillStyle = `rgba(${P.glowBright},${glowAlpha})`;
  ctx.beginPath();
  ctx.arc(
    crystalX,
    crystalY,
    crystalR * (2.5 + atkBurst * 0.6),
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = `rgba(255,255,255,${0.5 + magicPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(
    crystalX - crystalR * 0.2,
    crystalY - crystalR * 0.3,
    crystalR * 0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

// ─── HEAD ───────────────────────────────────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  magicPulse: number
) {
  const headY = y - s * 0.33;

  // ── SEGMENTED BARK HELMET SHELL ──────────────────────────────────
  const helmetCX = x;
  const helmetCY = headY - s * 0.01;
  const helmetRX = s * 0.135;
  const helmetRY = s * 0.12;
  const HELM_PLATES = 6;

  ctx.fillStyle = "#0d2210";
  ctx.beginPath();
  ctx.ellipse(helmetCX, helmetCY, helmetRX, helmetRY, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < HELM_PLATES; i++) {
    const a0 = (i / HELM_PLATES) * Math.PI * 2 - Math.PI * 0.5;
    const a1 = ((i + 1) / HELM_PLATES) * Math.PI * 2 - Math.PI * 0.5;
    const aMid = (a0 + a1) * 0.5;

    const ox0 = helmetCX + Math.cos(a0) * helmetRX;
    const oy0 = helmetCY + Math.sin(a0) * helmetRY;
    const ox1 = helmetCX + Math.cos(a1) * helmetRX;
    const oy1 = helmetCY + Math.sin(a1) * helmetRY;
    const ix0 = helmetCX + Math.cos(a0) * helmetRX * 0.3;
    const iy0 = helmetCY + Math.sin(a0) * helmetRY * 0.3;
    const ix1 = helmetCX + Math.cos(a1) * helmetRX * 0.3;
    const iy1 = helmetCY + Math.sin(a1) * helmetRY * 0.3;

    const perpX = Math.cos(aMid);
    const perpY = Math.sin(aMid);
    const segG = ctx.createLinearGradient(
      helmetCX + perpX * helmetRX,
      helmetCY + perpY * helmetRY,
      helmetCX - perpX * helmetRX * 0.3,
      helmetCY - perpY * helmetRY * 0.3
    );
    const sh = i % 2 === 0 ? 0 : 10;
    segG.addColorStop(0, `rgb(${74 + sh},${96 + sh},${64 + sh})`);
    segG.addColorStop(0.3, `rgb(${56 + sh},${80 + sh},${48 + sh})`);
    segG.addColorStop(0.7, `rgb(${38 + sh},${64 + sh},${32 + sh})`);
    segG.addColorStop(1, `rgb(${20 + sh},${42 + sh},${18 + sh})`);

    ctx.fillStyle = segG;
    ctx.beginPath();
    ctx.moveTo(ix0, iy0);
    ctx.lineTo(ox0, oy0);
    ctx.quadraticCurveTo(
      helmetCX + Math.cos(aMid) * helmetRX * 1.12,
      helmetCY + Math.sin(aMid) * helmetRY * 1.12,
      ox1,
      oy1
    );
    ctx.lineTo(ix1, iy1);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(5,15,8,0.4)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(ox0, oy0);
    ctx.lineTo(ix0, iy0);
    ctx.stroke();
    ctx.strokeStyle = "rgba(80,110,75,0.18)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(ox0 + 0.5, oy0 + 0.5);
    ctx.lineTo(ix0 + 0.5, iy0 + 0.5);
    ctx.stroke();
  }

  // Knot bumps on helmet — 3D radial-gradient spheres
  const helmKnots = [Math.PI * 0.15, Math.PI * 0.85, Math.PI * 1.55];
  for (const ka of helmKnots) {
    const kx = helmetCX + Math.cos(ka) * helmetRX * 0.72;
    const ky = helmetCY + Math.sin(ka) * helmetRY * 0.72;
    const kSz = s * (0.012 + Math.sin(ka * 3.7) * 0.003);
    const kGrad = ctx.createRadialGradient(
      kx - kSz * 0.2,
      ky - kSz * 0.2,
      kSz * 0.1,
      kx,
      ky,
      kSz
    );
    kGrad.addColorStop(0, "#5a7858");
    kGrad.addColorStop(0.5, "#2a4030");
    kGrad.addColorStop(1, "#1a2818");
    ctx.fillStyle = kGrad;
    ctx.beginPath();
    ctx.ellipse(
      kx,
      ky,
      kSz,
      kSz * 0.65,
      Math.sin(ka * 5) * 0.6,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(5,15,8,0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.arc(kx, ky, kSz * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Vine wraps spiraling around helmet
  ctx.strokeStyle = `rgba(${P.vine},${0.4 + naturePulse * 0.12})`;
  ctx.lineWidth = (1 + naturePulse * 0.2) * zoom;
  for (let v = 0; v < 4; v++) {
    const startA = -Math.PI * 0.4 + v * Math.PI * 0.55;
    ctx.beginPath();
    ctx.ellipse(
      helmetCX,
      helmetCY,
      helmetRX * (0.92 + v * 0.04),
      helmetRY * (0.92 + v * 0.04),
      0,
      startA,
      startA + Math.PI * 0.35
    );
    ctx.stroke();
  }

  // Proper bezier leaf shapes along helmet edge
  for (let i = 0; i < 8; i++) {
    const la = (i / 8) * Math.PI * 2 + Math.sin(time * 0.8 + i) * 0.05;
    const lx = helmetCX + Math.cos(la) * helmetRX * 1.02;
    const ly = helmetCY + Math.sin(la) * helmetRY * 1.02;
    const leafLen = s * (0.018 + Math.sin(i * 1.7) * 0.004);
    const leafDir = la + Math.PI * 0.5;

    ctx.fillStyle = `rgba(${P.leaf},${0.35 + naturePulse * 0.15})`;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(leafDir);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      leafLen * 0.3,
      -leafLen * 0.3,
      leafLen * 0.7,
      -leafLen * 0.25,
      leafLen,
      0
    );
    ctx.bezierCurveTo(
      leafLen * 0.7,
      leafLen * 0.25,
      leafLen * 0.3,
      leafLen * 0.3,
      0,
      0
    );
    ctx.fill();
    ctx.strokeStyle = `rgba(${P.vineDark},0.3)`;
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(leafLen * 0.85, 0);
    ctx.stroke();
    ctx.restore();
  }

  // ── TAPERED FACE SHAPE ──────────────────────────────────────────
  const faceW = s * 0.098;
  const faceH = s * 0.09;
  const faceCY = headY + s * 0.008;
  const chinTaper = s * 0.015;

  const faceGrad = ctx.createRadialGradient(
    x,
    faceCY - faceH * 0.1,
    0,
    x,
    faceCY,
    faceH * 1.1
  );
  faceGrad.addColorStop(0, "#c09878");
  faceGrad.addColorStop(0.15, "#b08868");
  faceGrad.addColorStop(0.3, "#9a7755");
  faceGrad.addColorStop(0.55, "#7a6040");
  faceGrad.addColorStop(0.8, "#5a4428");
  faceGrad.addColorStop(1, "#3a2a15");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.moveTo(x, faceCY - faceH);
  ctx.bezierCurveTo(
    x + faceW * 0.7,
    faceCY - faceH,
    x + faceW,
    faceCY - faceH * 0.5,
    x + faceW,
    faceCY
  );
  ctx.bezierCurveTo(
    x + faceW,
    faceCY + faceH * 0.4,
    x + faceW * 0.5,
    faceCY + faceH * 0.8,
    x,
    faceCY + faceH + chinTaper
  );
  ctx.bezierCurveTo(
    x - faceW * 0.5,
    faceCY + faceH * 0.8,
    x - faceW,
    faceCY + faceH * 0.4,
    x - faceW,
    faceCY
  );
  ctx.bezierCurveTo(
    x - faceW,
    faceCY - faceH * 0.5,
    x - faceW * 0.7,
    faceCY - faceH,
    x,
    faceCY - faceH
  );
  ctx.closePath();
  ctx.fill();

  // Forehead creases
  for (let i = 0; i < 3; i++) {
    const ly = headY - s * 0.015 + i * s * 0.02;
    const lw = s * (0.065 - Math.abs(i - 1) * 0.01);
    ctx.strokeStyle = "rgba(70,50,30,0.12)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - lw, ly);
    ctx.bezierCurveTo(
      x - lw * 0.3,
      ly + s * 0.003,
      x + lw * 0.3,
      ly - s * 0.002,
      x + lw,
      ly
    );
    ctx.stroke();
  }

  // ── EYES — larger with iris gradient ring ─────────────────────────
  const eyeScale = 1.55;
  for (const side of [-1, 1]) {
    const eyeX = x + side * s * 0.042;
    const eyeY = headY - s * 0.002;

    const egAlpha = 0.35 + naturePulse * 0.22 + magicPulse * 0.15;
    const eg = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.06);
    eg.addColorStop(0, `rgba(${P.glowBright},${egAlpha})`);
    eg.addColorStop(1, `rgba(${P.glow},0)`);
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(240,230,215,0.15)";
    ctx.beginPath();
    ctx.moveTo(eyeX - s * 0.032 * eyeScale, eyeY);
    ctx.quadraticCurveTo(
      eyeX,
      eyeY - s * 0.02 * eyeScale,
      eyeX + s * 0.032 * eyeScale,
      eyeY
    );
    ctx.quadraticCurveTo(
      eyeX,
      eyeY + s * 0.016 * eyeScale,
      eyeX - s * 0.032 * eyeScale,
      eyeY
    );
    ctx.fill();

    const irisR = s * 0.016;
    const irisG = ctx.createRadialGradient(
      eyeX,
      eyeY,
      irisR * 0.15,
      eyeX,
      eyeY,
      irisR
    );
    irisG.addColorStop(0, P.eyePupil);
    irisG.addColorStop(0.3, `rgb(${P.glowDark})`);
    irisG.addColorStop(0.65, `rgb(${P.glow})`);
    irisG.addColorStop(0.85, `rgb(${P.glowBright})`);
    irisG.addColorStop(1, `rgba(${P.glow},0.6)`);
    ctx.fillStyle = irisG;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, irisR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${P.glow},${0.88 + naturePulse * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(eyeX - s * 0.032 * eyeScale, eyeY);
    ctx.quadraticCurveTo(
      eyeX,
      eyeY - s * 0.02 * eyeScale,
      eyeX + s * 0.032 * eyeScale,
      eyeY
    );
    ctx.quadraticCurveTo(
      eyeX,
      eyeY + s * 0.016 * eyeScale,
      eyeX - s * 0.032 * eyeScale,
      eyeY
    );
    ctx.fill();

    ctx.fillStyle = P.eyePupil;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.01, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,${0.7 + magicPulse * 0.25})`;
    ctx.beginPath();
    ctx.arc(
      eyeX + side * s * 0.007,
      eyeY - s * 0.006,
      s * 0.004,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${0.3 + magicPulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(
      eyeX - side * s * 0.004,
      eyeY + s * 0.004,
      s * 0.002,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.strokeStyle = "rgba(40,25,10,0.4)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX - side * s * 0.022, eyeY - s * 0.014);
    ctx.quadraticCurveTo(
      eyeX,
      eyeY - s * 0.025,
      eyeX + side * s * 0.025,
      eyeY - s * 0.016
    );
    ctx.stroke();

    setShadowBlur(ctx, 2 * zoom, P.shadowHex);
    ctx.strokeStyle = `rgba(${P.glow},${0.3 + naturePulse * 0.15})`;
    ctx.lineWidth = 0.5 * zoom;
    const markDefs = [
      { cx: 0.005, cy: 0.024, ex: 0.022, ey: 0.02, sx: -0.01, sy: 0.012 },
      { cx: 0.008, cy: 0.03, ex: 0.02, ey: 0.028, sx: -0.005, sy: 0.017 },
      { cx: 0.01, cy: 0.018, ex: 0.028, ey: 0.014, sx: -0.008, sy: 0.008 },
      { cx: 0.01, cy: 0.036, ex: 0.015, ey: 0.034, sx: 0, sy: 0.022 },
    ];
    for (const m of markDefs) {
      ctx.beginPath();
      ctx.moveTo(eyeX + side * m.sx * s, eyeY + m.sy * s);
      ctx.quadraticCurveTo(
        eyeX + side * m.cx * s,
        eyeY + m.cy * s,
        eyeX + side * m.ex * s,
        eyeY + m.ey * s
      );
      ctx.stroke();
    }
    clearShadow(ctx);
  }

  // ── NOSE BRIDGE ───────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(80,55,30,0.2)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, headY - s * 0.005);
  ctx.lineTo(x, headY + s * 0.018);
  ctx.stroke();
  for (const nSide of [-1, 1]) {
    ctx.strokeStyle = "rgba(60,40,20,0.18)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.arc(x + nSide * s * 0.008, headY + s * 0.02, s * 0.004, 0, Math.PI);
    ctx.stroke();
  }

  // ── FACETED FOREHEAD GEM ────────────────────────────────────────
  const gemX = x;
  const gemY = headY - s * 0.04;
  const gemR = s * 0.014;

  setShadowBlur(ctx, (6 + magicPulse * 5) * zoom, P.shadowHex);
  const gemG = ctx.createRadialGradient(gemX, gemY, 0, gemX, gemY, gemR);
  gemG.addColorStop(0, `rgba(${P.glowWhite},${0.95 + magicPulse * 0.05})`);
  gemG.addColorStop(0.2, `rgb(${P.glowBright})`);
  gemG.addColorStop(0.5, P.shadowHex);
  gemG.addColorStop(0.8, `rgb(${P.glowDark})`);
  gemG.addColorStop(1, "#047857");
  ctx.fillStyle = gemG;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ga = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const cr = i % 2 === 0 ? gemR : gemR * 0.8;
    const gx = gemX + Math.cos(ga) * cr;
    const gy = gemY + Math.sin(ga) * cr;
    if (i === 0) {
      ctx.moveTo(gx, gy);
    } else {
      ctx.lineTo(gx, gy);
    }
  }
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);

  ctx.strokeStyle = `rgba(${P.glowBright},0.35)`;
  ctx.lineWidth = 0.4 * zoom;
  for (let i = 0; i < 8; i++) {
    const fa = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(gemX, gemY);
    ctx.lineTo(
      gemX + Math.cos(fa) * gemR * 0.8,
      gemY + Math.sin(fa) * gemR * 0.8
    );
    ctx.stroke();
  }

  const gemGlowA = 0.2 + Math.sin(time * 3) * 0.1 + naturePulse * 0.15;
  ctx.fillStyle = `rgba(${P.glowBright},${gemGlowA})`;
  ctx.beginPath();
  ctx.arc(gemX, gemY, gemR * 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255,255,255,${0.55 + magicPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(gemX - gemR * 0.2, gemY - gemR * 0.3, gemR * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // ── CHEEKBONE HIGHLIGHTS ──────────────────────────────────────────
  for (const side of [-1, 1]) {
    const chG = ctx.createRadialGradient(
      x + side * s * 0.04,
      headY + s * 0.01,
      0,
      x + side * s * 0.04,
      headY + s * 0.01,
      s * 0.025
    );
    chG.addColorStop(0, "rgba(210,170,130,0.15)");
    chG.addColorStop(0.5, "rgba(180,130,90,0.08)");
    chG.addColorStop(1, "rgba(160,110,70,0)");
    ctx.fillStyle = chG;
    ctx.beginPath();
    ctx.ellipse(
      x + side * s * 0.04,
      headY + s * 0.01,
      s * 0.025,
      s * 0.015,
      side * 0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // ── CUPID'S BOW LIPS ─────────────────────────────────────────────
  const lipY = headY + s * 0.035;
  ctx.fillStyle = "rgba(160,95,65,0.35)";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.024, lipY);
  ctx.quadraticCurveTo(x - s * 0.012, lipY - s * 0.006, x, lipY - s * 0.003);
  ctx.quadraticCurveTo(x + s * 0.012, lipY - s * 0.006, x + s * 0.024, lipY);
  ctx.quadraticCurveTo(x + s * 0.015, lipY + s * 0.003, x, lipY + s * 0.002);
  ctx.quadraticCurveTo(x - s * 0.015, lipY + s * 0.003, x - s * 0.024, lipY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(145,85,55,0.25)";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.02, lipY + s * 0.002);
  ctx.quadraticCurveTo(x, lipY + s * 0.012, x + s * 0.02, lipY + s * 0.002);
  ctx.quadraticCurveTo(x, lipY + s * 0.005, x - s * 0.02, lipY + s * 0.002);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(100,60,35,0.3)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.024, lipY);
  ctx.quadraticCurveTo(x, lipY - s * 0.002, x + s * 0.024, lipY);
  ctx.stroke();

  // Freckles
  const freckles = [
    { dx: -0.025, dy: 0.015 },
    { dx: -0.015, dy: 0.02 },
    { dx: 0.02, dy: 0.012 },
    { dx: 0.028, dy: 0.018 },
    { dx: -0.032, dy: 0.022 },
    { dx: 0.016, dy: 0.024 },
  ];
  for (const f of freckles) {
    ctx.fillStyle = `rgba(${P.leaf},0.18)`;
    ctx.beginPath();
    ctx.arc(x + f.dx * s, headY + f.dy * s, s * 0.003, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── HAIR ───────────────────────────────────────────────────────────────────

function drawHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  atkBurst: number
) {
  const headY = y - s * 0.33;
  const hairSpeed = 1.5 + atkBurst * 3;
  const hairSway = 0.03 + atkBurst * 0.025;

  const strands = [
    { angle: 2.3, len: 0.3, sx: -0.08 },
    { angle: 2.5, len: 0.35, sx: -0.1 },
    { angle: 2.1, len: 0.28, sx: -0.06 },
    { angle: 0.8, len: 0.3, sx: 0.08 },
    { angle: 0.6, len: 0.35, sx: 0.1 },
    { angle: 0.9, len: 0.28, sx: 0.06 },
    { angle: 2.8, len: 0.22, sx: -0.03 },
    { angle: 0.3, len: 0.22, sx: 0.03 },
    { angle: 2.65, len: 0.32, sx: -0.11 },
    { angle: 0.45, len: 0.32, sx: 0.11 },
    { angle: 2.4, len: 0.26, sx: -0.12 },
    { angle: 0.7, len: 0.26, sx: 0.12 },
  ];

  for (let i = 0; i < strands.length; i++) {
    const st = strands[i];
    const startX = x + st.sx * s;
    const startY = headY + s * 0.04;
    const sway = Math.sin(time * hairSpeed + i * 1.1) * s * hairSway;
    const endX = startX + Math.cos(st.angle) * s * st.len + sway;
    const endY =
      startY + Math.sin(st.angle) * s * st.len * 0.6 + Math.abs(sway) * 0.3;

    const hGrad = ctx.createLinearGradient(startX, startY, endX, endY);
    hGrad.addColorStop(0, "rgba(15,80,45,0.7)");
    hGrad.addColorStop(0.4, "rgba(10,60,35,0.5)");
    hGrad.addColorStop(1, "rgba(5,40,25,0.2)");

    ctx.strokeStyle = hGrad;
    ctx.lineWidth = (2.2 - i * 0.06 + atkBurst * 0.4) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + sway * 0.3,
      startY + s * st.len * 0.25,
      endX - sway * 0.2,
      endY - s * st.len * 0.15,
      endX,
      endY
    );
    ctx.stroke();

    // Leaf decoration on every 2nd strand
    if (i % 2 === 0) {
      const lx = (startX + endX) / 2 + sway * 0.4;
      const ly = (startY + endY) / 2;
      ctx.fillStyle = `rgba(${P.leaf},${0.4 + naturePulse * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(
        lx,
        ly,
        s * 0.01,
        s * 0.005,
        st.angle + Math.sin(time * 2.5 + i) * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Vine wrap around strands 2, 5, 9
    if (i === 2 || i === 5 || i === 9) {
      ctx.strokeStyle = `rgba(${P.vine},${0.2 + naturePulse * 0.08})`;
      ctx.lineWidth = 0.4 * zoom;
      for (let w = 0; w < 4; w++) {
        const wt = 0.25 + w * 0.15;
        const wx = startX + (endX - startX) * wt;
        const wy = startY + (endY - startY) * wt;
        ctx.beginPath();
        ctx.arc(wx + sway * wt * 0.4, wy, s * 0.008, 0, Math.PI);
        ctx.stroke();
      }
    }
  }

  // Tiny flower buds scattered in hair
  const budPositions = [
    { dx: -0.07, dy: -0.3 },
    { dx: 0.05, dy: -0.28 },
    { dx: -0.1, dy: -0.26 },
    { dx: 0.09, dy: -0.32 },
  ];
  for (const bud of budPositions) {
    ctx.fillStyle = `rgba(${P.flower},${0.4 + naturePulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(x + bud.dx * s, y + bud.dy * s, s * 0.004, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── CROWN ──────────────────────────────────────────────────────────────────

function drawCrown(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  leafRustle: number,
  atkBurst: number
) {
  const headY = y - s * 0.33;
  const crownBase = headY - s * 0.1;

  // Crown band
  ctx.strokeStyle = "#5a3e20";
  ctx.lineWidth = (3 + atkBurst * 0.4) * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    crownBase + s * 0.015,
    s * 0.12,
    s * 0.03,
    0,
    Math.PI * 0.08,
    Math.PI * 0.92
  );
  ctx.stroke();

  for (const side of [-1, 1]) {
    const baseX = x + side * s * 0.06;
    const sway =
      Math.sin(time * (1 + atkBurst * 2) + side * 0.5) *
      s *
      (0.008 + atkBurst * 0.006);

    // Main antler — thicker
    const tip1X = baseX + side * s * 0.2 + sway;
    const tip1Y = crownBase - s * 0.26;
    ctx.strokeStyle = "#5a3e20";
    ctx.lineWidth = (3.5 + atkBurst * 0.3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(baseX, crownBase);
    ctx.bezierCurveTo(
      baseX + side * s * 0.04,
      crownBase - s * 0.07,
      baseX + side * s * 0.14 + sway * 0.5,
      crownBase - s * 0.17,
      tip1X,
      tip1Y
    );
    ctx.stroke();

    // Secondary antler
    const tip2X = baseX + side * s * 0.1 + sway * 0.7;
    const tip2Y = crownBase - s * 0.2;
    ctx.lineWidth = (2.2 + atkBurst * 0.2) * zoom;
    ctx.beginPath();
    ctx.moveTo(baseX + side * s * 0.035, crownBase - s * 0.05);
    ctx.quadraticCurveTo(
      baseX + side * s * 0.08 + sway * 0.3,
      crownBase - s * 0.14,
      tip2X,
      tip2Y
    );
    ctx.stroke();

    // 7 sub-branches per side
    const subs = [
      { ang: side * 0.5, len: 0.05, t: 0.2 },
      { ang: side * 0.65, len: 0.055, t: 0.35 },
      { ang: side * 0.4, len: 0.05, t: 0.5 },
      { ang: side * -0.3, len: 0.04, t: 0.65 },
      { ang: side * -0.45, len: 0.035, t: 0.45 },
      { ang: side * 0.55, len: 0.045, t: 0.8 },
      { ang: side * 0.3, len: 0.035, t: 0.9 },
    ];
    for (const sb of subs) {
      const bx = baseX + (tip1X - baseX) * sb.t + sway * sb.t;
      const by = crownBase + (tip1Y - crownBase) * sb.t;
      const subAngle =
        -Math.PI / 2 +
        sb.ang +
        Math.sin(time * (1.3 + atkBurst * 2) + sb.t * 3) * 0.1;
      const subLen = s * sb.len;

      ctx.strokeStyle = "#4a3018";
      ctx.lineWidth = (1.3 + atkBurst * 0.2) * zoom;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(
        bx + Math.cos(subAngle) * subLen,
        by + Math.sin(subAngle) * subLen
      );
      ctx.stroke();

      // 3-4 leaves per sub-branch cluster
      const ltx = bx + Math.cos(subAngle) * subLen;
      const lty = by + Math.sin(subAngle) * subLen;
      const leafCount = 3 + Math.floor(Math.abs(sb.ang) * 2);
      for (let l = 0; l < leafCount; l++) {
        const la =
          subAngle +
          (l - (leafCount - 1) / 2) * 0.35 +
          leafRustle +
          Math.sin(time * (3 + atkBurst * 3) + l + sb.t) * 0.15;
        const lSize = s * (0.018 + l * 0.003 + atkBurst * 0.003);
        const lAlpha = 0.55 + naturePulse * 0.2 + atkBurst * 0.12;

        ctx.fillStyle = `rgba(${P.leaf},${lAlpha})`;
        ctx.beginPath();
        const lox = ltx + Math.cos(la) * lSize * 0.2;
        const loy = lty + Math.sin(la) * lSize * 0.2;
        ctx.moveTo(lox, loy + lSize * 0.4);
        ctx.bezierCurveTo(
          lox - lSize * 0.7,
          loy - lSize * 0.1,
          lox - lSize * 0.2,
          loy - lSize * 0.7,
          lox,
          loy - lSize * 0.3
        );
        ctx.bezierCurveTo(
          lox + lSize * 0.2,
          loy - lSize * 0.7,
          lox + lSize * 0.7,
          loy - lSize * 0.1,
          lox,
          loy + lSize * 0.4
        );
        ctx.fill();
      }
    }

    // Glowing berries along antlers (5 per side)
    for (let b = 0; b < 5; b++) {
      const bt = 0.2 + b * 0.16;
      const bx2 = baseX + (tip1X - baseX) * bt + sway * bt;
      const by2 = crownBase + (tip1Y - crownBase) * bt;
      const berryR = s * (0.005 + Math.sin(b * 1.7) * 0.001);
      setShadowBlur(ctx, 3 * zoom, P.shadowHex);
      ctx.fillStyle = `rgba(${P.flower},${0.55 + naturePulse * 0.2 + Math.sin(time * 3 + b * 1.5) * 0.15})`;
      ctx.beginPath();
      ctx.arc(bx2 + side * s * 0.008, by2, berryR, 0, Math.PI * 2);
      ctx.fill();
      clearShadow(ctx);
    }

    // Dangling vine ornaments from 2-3 branch tips
    for (let v = 0; v < 2; v++) {
      const vSub = subs[v * 3];
      const vbx = baseX + (tip1X - baseX) * vSub.t + sway * vSub.t;
      const vby = crownBase + (tip1Y - crownBase) * vSub.t;
      const vAngle = -Math.PI / 2 + vSub.ang;
      const vtx = vbx + Math.cos(vAngle) * s * vSub.len;
      const vty = vby + Math.sin(vAngle) * s * vSub.len;
      const dSway = Math.sin(time * 2 + v * 1.5 + side) * s * 0.004;
      const dLen = s * 0.025;

      ctx.strokeStyle = `rgba(${P.vine},${0.25 + naturePulse * 0.1})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(vtx, vty);
      ctx.quadraticCurveTo(
        vtx + dSway,
        vty + dLen * 0.5,
        vtx + dSway * 1.5,
        vty + dLen
      );
      ctx.stroke();
    }

    // Antler tip glow
    for (const tip of [
      { x: tip1X, y: tip1Y },
      { x: tip2X, y: tip2Y },
    ]) {
      const tG = ctx.createRadialGradient(
        tip.x,
        tip.y,
        0,
        tip.x,
        tip.y,
        s * (0.03 + atkBurst * 0.012)
      );
      tG.addColorStop(
        0,
        `rgba(${P.glowBright},${0.45 + naturePulse * 0.25 + atkBurst * 0.15})`
      );
      tG.addColorStop(1, `rgba(${P.glow},0)`);
      ctx.fillStyle = tG;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, s * (0.03 + atkBurst * 0.012), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Central bloom — 50% larger with 4 petal rings
  const bloomY = crownBase - s * 0.04;
  const bloomScale = 1.5;
  const bloomPulse = 0.7 + naturePulse * 0.3 + atkBurst * 0.2;

  for (let ring = 0; ring < 4; ring++) {
    const pCount = [10, 7, 5, 3][ring];
    const pR = s * [0.05, 0.038, 0.025, 0.015][ring] * bloomScale;
    const pAlpha = [0.35, 0.45, 0.55, 0.7][ring];
    const pColor =
      ring === 0
        ? P.glowBright
        : ring === 1
          ? P.flower
          : ring === 2
            ? P.pollen
            : P.glowWhite;
    for (let p = 0; p < pCount; p++) {
      const pa =
        (p / pCount) * Math.PI * 2 -
        Math.PI / 2 +
        time * (0.3 - ring * 0.12) +
        ring * 0.4;
      const px = x + Math.cos(pa) * pR;
      const py = bloomY + Math.sin(pa) * pR;
      ctx.fillStyle = `rgba(${pColor},${bloomPulse * pAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        px,
        py,
        s * (0.014 - ring * 0.002) * bloomScale,
        s * (0.007 - ring * 0.001) * bloomScale,
        pa,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  ctx.fillStyle = `rgba(${P.pollen},${bloomPulse})`;
  ctx.beginPath();
  ctx.arc(x, bloomY, s * 0.012 * bloomScale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(${P.pollen},${bloomPulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(x, bloomY, s * 0.03 * bloomScale, 0, Math.PI * 2);
  ctx.fill();

  // Firefly / mote particles hovering near the crown
  for (let i = 0; i < 4; i++) {
    const fAngle = time * 1.2 + i * Math.PI * 0.5;
    const fDist = s * (0.15 + Math.sin(time * 2 + i * 1.7) * 0.04);
    const fx = x + Math.cos(fAngle) * fDist;
    const fy = crownBase - s * 0.12 + Math.sin(fAngle * 0.7 + time) * s * 0.04;
    const fPulse = 0.3 + Math.sin(time * 4 + i * 2.3) * 0.25;
    setShadowBlur(ctx, 3 * zoom, P.shadowHex);
    ctx.fillStyle = `rgba(${P.pollen},${fPulse + naturePulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(fx, fy, s * 0.004 * zoom, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  }
}

// ─── NATURE AURA ────────────────────────────────────────────────────────────

function drawNatureAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  naturePulse: number,
  isAttacking: boolean,
  zoom: number,
  atkBurst: number
) {
  const auraR = s * (0.6 + naturePulse * 0.1 + atkBurst * 0.2);
  const auraA = 0.08 + naturePulse * 0.04 + atkBurst * 0.06;

  const aG = ctx.createRadialGradient(x, y, s * 0.1, x, y, auraR);
  aG.addColorStop(0, `rgba(${P.glow},${auraA})`);
  aG.addColorStop(0.4, `rgba(${P.vine},${auraA * 0.4})`);
  aG.addColorStop(1, `rgba(${P.glowDark},0)`);
  ctx.fillStyle = aG;
  ctx.beginPath();
  ctx.arc(x, y, auraR, 0, Math.PI * 2);
  ctx.fill();

  // 16+ orbiting leaf particles
  const leafCount = 16 + Math.floor(atkBurst * 5);
  for (let i = 0; i < leafCount; i++) {
    const phase = (time * (0.6 + atkBurst * 0.5) + i * (1 / leafCount)) % 1;
    const angle = time * (0.8 + atkBurst * 0.5) + (i * Math.PI * 2) / leafCount;
    const dist = s * (0.2 + phase * 0.32);
    const lx = x + Math.cos(angle) * dist;
    const ly = y - s * 0.1 + Math.sin(angle * 0.7 + time) * s * 0.13;
    const lAlpha = Math.sin(phase * Math.PI) * (0.4 + atkBurst * 0.2);
    const lSize = (1.5 + Math.sin(i * 1.1) * 0.5 + atkBurst) * zoom;

    ctx.fillStyle = `rgba(${P.leaf},${lAlpha})`;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(time * (2 + atkBurst * 2) + i * 1.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, lSize, lSize * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3 butterfly / moth particles (small chevron shapes)
  for (let i = 0; i < 3; i++) {
    const bAngle = time * 0.9 + i * ((Math.PI * 2) / 3);
    const bDist = s * (0.28 + Math.sin(time * 1.5 + i * 2) * 0.08);
    const bx = x + Math.cos(bAngle) * bDist;
    const by = y - s * 0.08 + Math.sin(bAngle * 0.6 + time * 1.2) * s * 0.12;
    const bAlpha = 0.3 + Math.sin(time * 3 + i * 1.4) * 0.15;
    const wingSpan = s * 0.01;
    const wingFlap = Math.sin(time * 8 + i * 2) * 0.4;

    ctx.fillStyle = `rgba(${P.glowBright},${bAlpha})`;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(bAngle + Math.PI * 0.5);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-wingSpan, -wingSpan * (0.6 + wingFlap));
    ctx.lineTo(-wingSpan * 0.3, -wingSpan * 0.15);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(wingSpan, -wingSpan * (0.6 + wingFlap));
    ctx.lineTo(wingSpan * 0.3, -wingSpan * 0.15);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // 12+ pollen motes
  for (let i = 0; i < 13; i++) {
    const phase = (time * (0.4 + atkBurst * 0.3) + i * (1 / 13)) % 1;
    const mx = x + Math.sin(time * 0.6 + i * 1.4) * s * 0.38;
    const my = y + s * 0.15 - phase * s * 0.75;
    const mAlpha = Math.sin(phase * Math.PI) * (0.3 + atkBurst * 0.15);

    ctx.fillStyle = `rgba(${P.pollen},${mAlpha})`;
    ctx.beginPath();
    ctx.arc(mx, my, zoom * (1 + atkBurst * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground-level leaf scatter (5 flat ellipses at feet)
  for (let i = 0; i < 5; i++) {
    const gx = x + (i - 2) * s * 0.08 + Math.sin(time * 0.3 + i * 2) * s * 0.02;
    const gy = y + s * 0.3 + Math.sin(i * 1.5) * s * 0.008;
    const gRot = i * 0.8 + Math.sin(time * 0.5 + i) * 0.2;
    ctx.fillStyle = `rgba(${P.leaf},${0.15 + naturePulse * 0.06})`;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(1, 0.3);
    ctx.rotate(gRot);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.012, s * 0.006, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── MAGIC PARTICLES ────────────────────────────────────────────────────────

function drawMagicParticles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  naturePulse: number,
  atkBurst: number
) {
  const particleCount = 8 + Math.floor(atkBurst * 8);
  for (let i = 0; i < particleCount; i++) {
    const phase = (time * (1.2 + atkBurst * 1.5) + i * (1 / particleCount)) % 1;
    const spiralAngle = time * 1.5 + i * ((Math.PI * 2) / particleCount);
    const spiralR = s * (0.15 + phase * 0.25 + atkBurst * 0.1);
    const px = x + Math.cos(spiralAngle) * spiralR;
    const py =
      y - s * 0.1 + Math.sin(spiralAngle) * spiralR * 0.4 - phase * s * 0.2;
    const pAlpha = Math.sin(phase * Math.PI) * (0.5 + atkBurst * 0.3);
    const pSize = (1 + Math.sin(i) * 0.5 + atkBurst * 1.5) * zoom;

    ctx.fillStyle = `rgba(${P.glowBright},${pAlpha})`;
    ctx.beginPath();
    ctx.moveTo(px, py - pSize);
    ctx.lineTo(px + pSize * 0.6, py);
    ctx.lineTo(px, py + pSize);
    ctx.lineTo(px - pSize * 0.6, py);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── ATTACK VINES ───────────────────────────────────────────────────────────

function drawAttackVines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  atkBurst: number,
  time: number,
  zoom: number
) {
  const waveR = s * 0.65 * atkBurst;
  ctx.save();
  ctx.translate(x, y + s * 0.27);
  ctx.scale(1, 0.3);
  setShadowBlur(ctx, 8 * zoom, P.shadowHex);
  ctx.strokeStyle = `rgba(${P.glow},${atkBurst * 0.4})`;
  ctx.lineWidth = (3 + atkBurst * 2) * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, waveR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(${P.glowBright},${atkBurst * 0.18})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, waveR * 1.18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(${P.glowDark},${atkBurst * 0.12})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, waveR * 0.75, 0, Math.PI * 2);
  ctx.stroke();
  clearShadow(ctx);
  ctx.restore();

  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2 + time * 0.8;
    const eLen = s * (0.55 + i * 0.02) * atkBurst;
    const ePhase = time * 4 + i * 1.3;
    drawSegmentedTentacle(
      ctx,
      x,
      y + s * 0.02,
      angle,
      eLen,
      s,
      time,
      zoom,
      Math.floor(8 + atkBurst * 4),
      ePhase,
      atkBurst,
      0.5,
      0.038 + atkBurst * 0.008,
      atkBurst > 0.3,
      true,
      true,
      true
    );
  }

  for (let i = 0; i < 20; i++) {
    const dAngle = (i / 20) * Math.PI * 2 + time * 3;
    const dDist =
      s * (0.1 + atkBurst * 0.35) * (0.5 + Math.sin(time * 6 + i * 1.7) * 0.3);
    const dx = x + Math.cos(dAngle) * dDist;
    const dy = y + Math.sin(dAngle) * dDist * 0.4 + s * 0.15;
    const dAlpha = atkBurst * 0.5 * (0.6 + Math.sin(time * 5 + i) * 0.3);
    const dRot = time * 5 + i * 2.1;
    ctx.fillStyle =
      i % 3 === 0
        ? `rgba(${P.leaf},${dAlpha})`
        : i % 3 === 1
          ? `rgba(${P.vine},${dAlpha * 0.7})`
          : `rgba(${P.glowBright},${dAlpha * 0.5})`;
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(dRot);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.008 * zoom, s * 0.003 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  setShadowBlur(ctx, 4 * zoom, P.shadowHex);
  for (let c = 0; c < 16; c++) {
    const cAngle = (c / 16) * Math.PI * 2;
    const cLen = s * (0.25 + Math.sin(time * 2.5 + c) * 0.06) * atkBurst;
    const crackAlpha = atkBurst * 0.45;
    const crG = ctx.createLinearGradient(
      x,
      y + s * 0.27,
      x + Math.cos(cAngle) * cLen,
      y + s * 0.27 + Math.sin(cAngle) * cLen * 0.3
    );
    crG.addColorStop(0, `rgba(${P.glowBright},${crackAlpha})`);
    crG.addColorStop(0.5, `rgba(${P.glow},${crackAlpha * 0.6})`);
    crG.addColorStop(1, `rgba(${P.glowDark},0)`);
    ctx.strokeStyle = crG;
    ctx.lineWidth = (2.2 - c * 0.04) * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.27);
    ctx.bezierCurveTo(
      x + Math.cos(cAngle) * cLen * 0.4,
      y + s * 0.28,
      x + Math.cos(cAngle) * cLen * 0.7,
      y + s * 0.27 + Math.sin(cAngle) * cLen * 0.2,
      x + Math.cos(cAngle) * cLen,
      y + s * 0.27 + Math.sin(cAngle) * cLen * 0.3
    );
    ctx.stroke();

    if (c % 3 === 0) {
      const emergeX = x + Math.cos(cAngle) * cLen;
      const emergeY = y + s * 0.27 + Math.sin(cAngle) * cLen * 0.3;
      ctx.fillStyle = `rgba(${P.vine},${crackAlpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(emergeX, emergeY, s * 0.008 * atkBurst, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  clearShadow(ctx);
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                         HELPERS                                          ║
// ╚════════════════════════════════════════════════════════════════════════════╝

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
