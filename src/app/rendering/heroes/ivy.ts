import type { Position } from "../../types";

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
  grassland: {
    glow: "52,211,153",
    glowBright: "167,243,208",
    glowWhite: "209,250,229",
    glowDark: "5,150,105",
    leaf: "74,222,128",
    leafDark: "34,197,94",
    vine: "16,185,129",
    vineDark: "15,100,60",
    rootVine: "30,100,50",
    flower: "236,72,153",
    pollen: "251,191,36",
    shadowHex: "#34d399",
    eyePupil: "#064e3b",
    canopy: ["#15803d", "#16a34a", "#22c55e", "#4ade80"],
    canopyStyle: "round",
  },
  desert: {
    glow: "218,165,32",
    glowBright: "245,208,120",
    glowWhite: "255,235,180",
    glowDark: "160,120,20",
    leaf: "154,180,72",
    leafDark: "120,140,50",
    vine: "140,160,60",
    vineDark: "90,110,40",
    rootVine: "100,85,40",
    flower: "245,130,50",
    pollen: "255,200,50",
    shadowHex: "#daa520",
    eyePupil: "#4a3a10",
    canopy: ["#5a6b20", "#7a8a30", "#9aaa40", "#baca60"],
    canopyStyle: "flat",
  },
  winter: {
    glow: "100,180,255",
    glowBright: "180,220,255",
    glowWhite: "220,240,255",
    glowDark: "40,100,180",
    leaf: "160,210,240",
    leafDark: "100,170,210",
    vine: "80,160,200",
    vineDark: "50,100,150",
    rootVine: "60,90,120",
    flower: "180,140,220",
    pollen: "220,210,255",
    shadowHex: "#64b4ff",
    eyePupil: "#102a50",
    canopy: ["#1a4a3a", "#2a6050", "#3a7a68", "#5a9a88"],
    canopyStyle: "conical",
  },
  volcanic: {
    glow: "255,100,30",
    glowBright: "255,160,80",
    glowWhite: "255,220,160",
    glowDark: "180,50,10",
    leaf: "120,50,30",
    leafDark: "80,30,15",
    vine: "160,70,20",
    vineDark: "100,40,15",
    rootVine: "70,30,15",
    flower: "255,60,20",
    pollen: "255,180,40",
    shadowHex: "#ff6420",
    eyePupil: "#3a1005",
    canopy: ["#2a1a10", "#3a2518", "#4a3020", "#5a3a28"],
    canopyStyle: "ember",
  },
  swamp: {
    glow: "0,200,180",
    glowBright: "100,240,220",
    glowWhite: "180,255,240",
    glowDark: "0,120,100",
    leaf: "40,140,80",
    leafDark: "25,100,55",
    vine: "20,150,110",
    vineDark: "10,90,60",
    rootVine: "20,70,50",
    flower: "160,80,200",
    pollen: "180,140,255",
    shadowHex: "#00c8b4",
    eyePupil: "#0a2a20",
    canopy: ["#0a3020", "#155038", "#207050", "#308a68"],
    canopyStyle: "weeping",
  },
};

let P: IvyPalette = IVY_PALETTES.grassland;

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  MORPH TRANSITION SYSTEM                                 ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const COLOSSUS_DURATION_MS = 8000;
const MORPH_DURATION_MS = 1200;

function getMorphProgress(abilityEnd: number): number {
  const now = Date.now();
  const abilityStart = abilityEnd - COLOSSUS_DURATION_MS;
  const elapsed = now - abilityStart;
  const remaining = abilityEnd - now;

  if (elapsed < 0) return 0;
  if (remaining < 0) return 0;

  if (elapsed < MORPH_DURATION_MS) {
    return elapsed / MORPH_DURATION_MS;
  }
  if (remaining < MORPH_DURATION_MS) {
    return remaining / MORPH_DURATION_MS;
  }
  return 1.0;
}

function drawMorphTransition(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, morphT: number,
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
    ctx.quadraticCurveTo(
      (ox + ix) / 2 + sway, (oy + iy) / 2 + sway,
      ix, iy,
    );
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
  x: number, y: number, s: number,
  time: number, zoom: number,
  isAttacking: boolean, atkPow: number, atkBurst: number,
) {
  const naturePulse = Math.sin(time * 2.5) * 0.5 + 0.5 + atkBurst * 0.25;
  const breathe = Math.sin(time * 1.8) * (2.5 + atkBurst * 3);
  const idleSway = Math.sin(time * 0.8) * s * (0.012 + atkBurst * 0.008);
  const leafRustle = Math.sin(time * 3) * (0.1 + atkBurst * 0.15);
  const mossGlow = 0.5 + Math.sin(time * 2) * 0.2 + atkBurst * 0.3;
  const magicPulse = Math.sin(time * 3.5) * 0.5 + 0.5;
  const bx = x + idleSway + (isAttacking ? Math.sin(atkPow * Math.PI * 5) * s * 0.015 : 0);

  drawMagicCircle(ctx, x, y, s, time, zoom, naturePulse, atkBurst);
  drawRootSystem(ctx, x, y, s, time, zoom, naturePulse, atkBurst);
  drawVineTentacles(ctx, x, y, s, time, zoom, naturePulse, "back", atkBurst);
  drawLeafCape(ctx, bx, y, s, time, zoom, naturePulse, atkBurst);
  drawSkirt(ctx, bx, y, s, time, zoom, naturePulse, atkBurst);
  drawBody(ctx, bx, y, s, breathe, time, zoom, naturePulse, atkBurst);
  drawBranchCorset(ctx, bx, y, s, time, zoom, naturePulse, mossGlow, atkBurst);
  drawShoulders(ctx, bx, y, s, time, zoom, naturePulse, mossGlow, atkBurst);
  drawArms(ctx, bx, y, s, time, zoom, isAttacking, atkBurst);
  drawCrookedStaff(ctx, bx, y, s, time, zoom, naturePulse, magicPulse, atkBurst);
  drawHead(ctx, bx, y, s, time, zoom, naturePulse, magicPulse);
  drawHair(ctx, bx, y, s, time, zoom, naturePulse, atkBurst);
  drawCrown(ctx, bx, y, s, time, zoom, naturePulse, leafRustle, atkBurst);
  drawVineTentacles(ctx, x, y, s, time, zoom, naturePulse, "front", atkBurst);
  drawNatureAura(ctx, x, y, s, time, naturePulse, isAttacking, zoom, atkBurst);
  drawMagicParticles(ctx, x, y, s, time, zoom, naturePulse, atkBurst);
  if (isAttacking) {
    drawAttackVines(ctx, x, y, s, atkBurst, time, zoom);
  }
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  MAIN ENTRY POINT                                        ║
// ╚════════════════════════════════════════════════════════════════════════════╝

export function drawIvyHero(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, color: string,
  time: number, zoom: number, attackPhase?: number,
  targetPos?: Position, abilityActive?: boolean,
  mapTheme?: string, abilityEnd?: number,
) {
  P = IVY_PALETTES[mapTheme ?? "grassland"] ?? IVY_PALETTES.grassland;

  const s = size;
  const mech = abilityActive ?? false;
  const atkPhase = attackPhase ?? 0;
  const isAttacking = atkPhase > 0 || mech;
  const atkPow = mech ? Math.max(atkPhase, 0.6) : (isAttacking ? atkPhase : 0);
  const atkBurst = Math.sin(atkPow * Math.PI);

  const morphT = (mech && abilityEnd != null) ? getMorphProgress(abilityEnd) : -1;

  // Transitioning between forms
  if (mech && morphT > 0 && morphT < 1) {
    if (morphT < 0.5) {
      drawNormalFormFull(ctx, x, y, s, time, zoom, isAttacking, atkPow, atkBurst);
    } else {
      drawColossusForm(ctx, x, y, s, time, zoom, isAttacking, atkBurst);
    }
    drawMorphTransition(ctx, x, y, s, time, zoom, morphT);
    return;
  }

  // Fully colossus
  if (mech) {
    drawColossusForm(ctx, x, y, s, time, zoom, isAttacking, atkBurst);
    return;
  }

  // Normal form
  drawNormalFormFull(ctx, x, y, s, time, zoom, isAttacking, atkPow, atkBurst);
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                         COLOSSUS FORM                                    ║
// ║  3D isometric ancient tree guardian — organic blob rendering             ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ─── Organic Blob Helper ────────────────────────────────────────────────────

function drawOrganicBlob(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number,
  bumps: number, bumpAmp: number, seed: number, rotation?: number,
) {
  const rot = rotation ?? 0;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < bumps; i++) {
    const a = (i / bumps) * Math.PI * 2;
    const w = 1
      + Math.sin(seed * 7.3 + i * 4.1) * bumpAmp
      + Math.sin(seed * 3.7 + i * 2.9) * bumpAmp * 0.5;
    pts.push({
      x: cx + Math.cos(a + rot) * rx * w,
      y: cy + Math.sin(a + rot) * ry * w,
    });
  }
  const last = pts[pts.length - 1];
  ctx.beginPath();
  ctx.moveTo((pts[0].x + last.x) / 2, (pts[0].y + last.y) / 2);
  for (let i = 0; i < pts.length; i++) {
    const nxt = pts[(i + 1) % pts.length];
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + nxt.x) / 2, (pts[i].y + nxt.y) / 2);
  }
  ctx.closePath();
}

// ─── COLOSSUS: Form Orchestrator ────────────────────────────────────────────

function drawColossusForm(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number,
  isAttacking: boolean, atkBurst: number,
) {
  const pulse = Math.sin(time * 1.5) * 0.5 + 0.5;
  const heavySway = Math.sin(time * 0.6) * s * 0.008;
  const bx = x + heavySway;

  drawColossusGroundEffect(ctx, x, y, s, time, zoom, pulse, atkBurst);
  drawColossusRootLegs(ctx, bx, y, s, time, zoom, atkBurst);
  drawColossusTrunkBody(ctx, bx, y, s, time, zoom, pulse, atkBurst);
  drawColossusBarkPlates(ctx, bx, y, s, time, zoom, pulse);
  drawColossusBranchArms(ctx, bx, y, s, time, zoom, atkBurst);
  drawColossusFace(ctx, bx, y, s, time, zoom, pulse);
  drawColossusCanopy(ctx, bx, y, s, time, zoom, pulse, atkBurst);
  drawColossusVortex(ctx, x, y, s, time, zoom, atkBurst);
  drawColossusEnergyPulse(ctx, x, y, s, time, zoom, pulse, atkBurst);
  if (isAttacking) {
    drawColossusAttackWave(ctx, x, y, s, atkBurst, time, zoom);
  }
}

// ─── COLOSSUS: Ground Effect ─────────────────────────────────────────────────

function drawColossusGroundEffect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, pulse: number, atkBurst: number,
) {
  const groundY = y + s * 0.32;

  // Large isometric ambient occlusion shadow
  const aoRx = s * (0.65 + atkBurst * 0.1);
  const aoRy = aoRx * 0.28;
  const aoGrad = ctx.createRadialGradient(x, groundY, s * 0.05, x, groundY, aoRx);
  aoGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  aoGrad.addColorStop(0.4, "rgba(0,0,0,0.2)");
  aoGrad.addColorStop(0.7, "rgba(0,0,0,0.08)");
  aoGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aoGrad;
  ctx.beginPath();
  ctx.ellipse(x, groundY, aoRx, aoRy, 0, 0, Math.PI * 2);
  ctx.fill();

  // Radiating root impressions in the ground
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + time * 0.04;
    const len = s * (0.38 + Math.sin(time * 0.3 + i * 0.9) * 0.05);
    const tipX = x + Math.cos(a) * len;
    const tipY = groundY + Math.sin(a) * len * 0.22;
    // Dark shadow line
    ctx.strokeStyle = `rgba(0,0,0,${0.1 + pulse * 0.03})`;
    ctx.lineWidth = (2.5 + Math.sin(i * 1.5) * 0.8) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5, groundY + Math.sin(a) * len * 0.1 + s * 0.008,
      tipX, tipY,
    );
    ctx.stroke();
    // Highlight edge offset toward top-left
    ctx.strokeStyle = `rgba(${P.rootVine},${0.06 + pulse * 0.02})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - 0.5, groundY - 0.5);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5 - 0.5, groundY + Math.sin(a) * len * 0.1 + s * 0.008 - 0.5,
      tipX - 0.5, tipY - 0.5,
    );
    ctx.stroke();
  }

  // Magic circle runes with glow (isometric squash)
  const circleR = s * (0.52 + atkBurst * 0.12);
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(1, 0.28);
  ctx.rotate(time * 0.15);

  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 8 * zoom;
  ctx.strokeStyle = `rgba(${P.glow},${0.2 + pulse * 0.1})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, circleR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${P.glowBright},${0.12 + pulse * 0.06})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, circleR * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${P.glowDark},${0.08 + pulse * 0.04})`;
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, circleR * 1.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Rune diamonds
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rx = Math.cos(a) * circleR * 0.9;
    const ry = Math.sin(a) * circleR * 0.9;
    const runeA = (0.35 + Math.sin(time * 2.5 + i * 1.4) * 0.2) * (0.6 + pulse * 0.4);
    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 4 * zoom;
    ctx.fillStyle = `rgba(${P.glowBright},${runeA})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry - s * 0.03);
    ctx.lineTo(rx + s * 0.018, ry);
    ctx.lineTo(rx, ry + s * 0.025);
    ctx.lineTo(rx - s * 0.018, ry);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Ground cracks with highlight edge
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + time * 0.1;
    const len = s * (0.32 + Math.sin(time * 2 + i * 1.8) * 0.06);
    const crackAlpha = 0.16 + Math.sin(time * 3 + i) * 0.06 + atkBurst * 0.08;
    const tipX = x + Math.cos(a) * len;
    const tipY = groundY + Math.sin(a) * len * 0.22;
    // Dark crack
    ctx.strokeStyle = `rgba(10,6,2,${crackAlpha + 0.08})`;
    ctx.lineWidth = (2.0 + Math.sin(time * 4 + i * 2) * 0.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5, groundY + Math.sin(a) * len * 0.1,
      tipX, tipY,
    );
    ctx.stroke();
    // Lit highlight edge (offset toward top-left light source)
    ctx.strokeStyle = `rgba(${P.glow},${crackAlpha * 0.4})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - 0.7, groundY - 0.7);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5 - 0.7, groundY + Math.sin(a) * len * 0.1 - 0.7,
      tipX - 0.7, tipY - 0.7,
    );
    ctx.stroke();
  }
}

// ─── COLOSSUS: Root Legs ─────────────────────────────────────────────────────

function drawColossusRootLegs(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, atkBurst: number,
) {
  const roots = [
    { side: -1, angle: -0.4, width: 0.08, seed: 1.2 },
    { side: -1, angle: -0.15, width: 0.065, seed: 3.4 },
    { side: 1, angle: 0.15, width: 0.065, seed: 5.6 },
    { side: 1, angle: 0.4, width: 0.08, seed: 7.8 },
  ];

  for (let i = 0; i < roots.length; i++) {
    const r = roots[i];
    const sway = Math.sin(time * 0.8 + i * 1.2) * s * 0.01;
    const baseX = x + r.side * s * 0.12;
    const baseY = y + s * 0.12;
    const footX = x + r.side * s * (0.28 + Math.abs(r.angle) * 0.3) + sway;
    const footY = y + s * 0.36;

    // Root as thick organic blob shape with 3D radial gradient
    const rootMidX = (baseX + footX) / 2 + sway * 0.3;
    const rootMidY = (baseY + footY) / 2;
    const rootRx = s * r.width * 1.8;
    const rootRy = s * 0.14;
    const rootAngle = Math.atan2(footY - baseY, footX - baseX);

    const hlOffX = rootMidX - rootRx * 0.25;
    const hlOffY = rootMidY - rootRy * 0.35;
    const rootGrad = ctx.createRadialGradient(hlOffX, hlOffY, s * 0.01, rootMidX, rootMidY, rootRx);
    rootGrad.addColorStop(0, "#6a5028");
    rootGrad.addColorStop(0.3, "#5a4020");
    rootGrad.addColorStop(0.6, "#3d2a14");
    rootGrad.addColorStop(1, "#1a1208");
    ctx.fillStyle = rootGrad;

    ctx.save();
    ctx.translate(rootMidX, rootMidY);
    ctx.rotate(rootAngle);
    drawOrganicBlob(ctx, 0, 0, rootRx, rootRy * 0.7, 10, 0.15, r.seed);
    ctx.fill();
    ctx.restore();

    // Bark ridge lines (shadow + highlight pairs)
    for (let k = 0; k < 4; k++) {
      const t = 0.15 + k * 0.2;
      const lx = baseX + (footX - baseX) * t + sway * t;
      const ly = baseY + (footY - baseY) * t;
      const lw = s * r.width * (1.3 - t * 0.5);
      ctx.strokeStyle = "rgba(15,10,4,0.4)";
      ctx.lineWidth = 0.9 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx - lw, ly);
      ctx.quadraticCurveTo(lx + Math.sin(time + k) * s * 0.005, ly + s * 0.005, lx + lw, ly);
      ctx.stroke();
      ctx.strokeStyle = "rgba(90,64,32,0.18)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx - lw, ly - 1);
      ctx.quadraticCurveTo(lx + Math.sin(time + k) * s * 0.005, ly + s * 0.005 - 1, lx + lw, ly - 1);
      ctx.stroke();
    }

    // Glowing vein along root with shadowBlur
    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 4 * zoom;
    ctx.strokeStyle = `rgba(${P.glow},${0.28 + Math.sin(time * 2.5 + i) * 0.1})`;
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY + s * 0.02);
    ctx.bezierCurveTo(
      baseX + sway * 0.5, (baseY + footY) * 0.5 + s * 0.01,
      footX - sway * 0.3, footY - s * 0.05,
      footX, footY - s * 0.01,
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Foot: spread with sub-roots as small organic shapes
    ctx.fillStyle = "#2d1e0e";
    drawOrganicBlob(ctx, footX, footY, s * 0.065, s * 0.022, 8, 0.2, r.seed + 10);
    ctx.fill();

    for (let sr = 0; sr < 3; sr++) {
      const subA = r.angle + (sr - 1) * 0.5 + Math.sin(time * 0.5 + sr) * 0.1;
      const subLen = s * 0.05;
      const subTipX = footX + Math.cos(subA) * subLen;
      const subTipY = footY + Math.abs(Math.sin(subA)) * subLen * 0.3 + s * 0.008;
      ctx.fillStyle = "rgba(45,30,14,0.5)";
      drawOrganicBlob(ctx, subTipX, subTipY, s * 0.02, s * 0.008, 6, 0.2, r.seed + sr * 3);
      ctx.fill();
    }

    // Joint knob where root meets trunk: 3D sphere with highlight
    const knobR = s * 0.035;
    const knobGrad = ctx.createRadialGradient(
      baseX - knobR * 0.3, baseY - knobR * 0.3, knobR * 0.1,
      baseX, baseY, knobR,
    );
    knobGrad.addColorStop(0, "#7a5830");
    knobGrad.addColorStop(0.4, "#5a4020");
    knobGrad.addColorStop(0.8, "#3a2810");
    knobGrad.addColorStop(1, "#1a1208");
    ctx.fillStyle = knobGrad;
    ctx.beginPath();
    ctx.arc(baseX, baseY, knobR, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── COLOSSUS: Trunk Body ────────────────────────────────────────────────────

function drawColossusTrunkBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, pulse: number, atkBurst: number,
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
    const secGrad = ctx.createRadialGradient(hlX, hlY, s * 0.01, x, secY, secRx);
    secGrad.addColorStop(0, "#6a5028");
    secGrad.addColorStop(0.25, "#5a4020");
    secGrad.addColorStop(0.5, "#4a3418");
    secGrad.addColorStop(0.75, "#3a2810");
    secGrad.addColorStop(1, "#241a0a");
    ctx.fillStyle = secGrad;
    drawOrganicBlob(ctx, x + Math.sin(i * 1.7) * s * 0.005, secY, secRx, secRy, 12, 0.12, secSeed);
    ctx.fill();
  }

  // Connecting trunk fill with 3D radial gradient
  const trunkGrad = ctx.createRadialGradient(
    x - s * 0.06, y - s * 0.1, s * 0.02,
    x, y - s * 0.05, s * 0.25,
  );
  trunkGrad.addColorStop(0, "rgba(90,64,32,0.5)");
  trunkGrad.addColorStop(0.3, "rgba(74,52,24,0.4)");
  trunkGrad.addColorStop(0.6, "rgba(61,42,20,0.3)");
  trunkGrad.addColorStop(1, "rgba(36,26,10,0.2)");
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(x - topW, trunkTop);
  ctx.bezierCurveTo(x - topW * 1.15, trunkTop + trunkH * 0.3,
    x - botW * 1.1, trunkBot - s * 0.06,
    x - botW, trunkBot);
  ctx.lineTo(x + botW, trunkBot);
  ctx.bezierCurveTo(x + botW * 1.1, trunkBot - s * 0.06,
    x + topW * 1.15, trunkTop + trunkH * 0.3,
    x + topW, trunkTop);
  ctx.closePath();
  ctx.fill();

  // Deep bark grooves (dark shadow line + highlight line offset 1px)
  for (let i = 0; i < 7; i++) {
    const gx = x - topW * 0.7 + i * topW * 0.23;
    const wobble = Math.sin(i * 2.3 + 0.5) * s * 0.01;
    ctx.strokeStyle = "rgba(15,10,4,0.5)";
    ctx.lineWidth = 1.0 * zoom;
    ctx.beginPath();
    ctx.moveTo(gx + wobble, trunkTop + s * 0.02);
    ctx.bezierCurveTo(
      gx + wobble - s * 0.005, trunkTop + trunkH * 0.35,
      gx - wobble + s * 0.008, trunkTop + trunkH * 0.65,
      gx - wobble * 0.5, trunkBot - s * 0.02,
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(100,75,40,0.18)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(gx + wobble - 1, trunkTop + s * 0.02 - 0.5);
    ctx.bezierCurveTo(
      gx + wobble - s * 0.005 - 1, trunkTop + trunkH * 0.35 - 0.5,
      gx - wobble + s * 0.008 - 1, trunkTop + trunkH * 0.65 - 0.5,
      gx - wobble * 0.5 - 1, trunkBot - s * 0.02 - 0.5,
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
    ctx.quadraticCurveTo(x + Math.sin(i * 1.7) * s * 0.02, cy + s * 0.004, x + cw, cy);
    ctx.stroke();
    ctx.strokeStyle = "rgba(90,64,32,0.15)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - cw, cy - 0.8);
    ctx.quadraticCurveTo(x + Math.sin(i * 1.7) * s * 0.02, cy + s * 0.004 - 0.8, x + cw, cy - 0.8);
    ctx.stroke();
  }

  // Glowing veins with shadowBlur glow
  const veinAlpha = 0.3 + pulse * 0.25 + atkBurst * 0.15;
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 6 * zoom;
  ctx.strokeStyle = `rgba(${P.glow},${veinAlpha})`;
  ctx.lineWidth = 1.8 * zoom;
  const veins = [
    { sx: -0.08, sy: -0.22, ex: -0.14, ey: 0.08 },
    { sx: 0.06, sy: -0.2, ex: 0.12, ey: 0.1 },
    { sx: -0.02, sy: -0.25, ex: -0.05, ey: 0.05 },
    { sx: 0.1, sy: -0.18, ex: 0.18, ey: 0.0 },
    { sx: -0.1, sy: -0.15, ex: -0.18, ey: 0.02 },
  ];
  for (const v of veins) {
    ctx.beginPath();
    ctx.moveTo(x + v.sx * s, y + v.sy * s);
    ctx.bezierCurveTo(
      x + (v.sx + v.ex) * 0.4 * s, y + (v.sy + v.ey) * 0.4 * s + s * 0.02,
      x + (v.sx + v.ex) * 0.6 * s, y + (v.sy + v.ey) * 0.6 * s - s * 0.01,
      x + v.ex * s, y + v.ey * s,
    );
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Knothole: concentric dark ellipses with inner glow
  ctx.fillStyle = "#0e0a04";
  ctx.beginPath();
  ctx.ellipse(x + s * 0.08, y - s * 0.02, s * 0.03, s * 0.022, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1208";
  ctx.beginPath();
  ctx.ellipse(x + s * 0.08, y - s * 0.02, s * 0.022, s * 0.015, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 3 * zoom;
  ctx.fillStyle = `rgba(${P.glow},${0.18 + pulse * 0.12})`;
  ctx.beginPath();
  ctx.ellipse(x + s * 0.08, y - s * 0.02, s * 0.014, s * 0.009, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

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
    drawOrganicBlob(ctx, mx - mr * 0.1, my - mr * 0.15, mr * 0.6, mr * 0.3, 7, 0.15, m.seed + 5);
    ctx.fill();
  }

  // Contour edges: dark on shadow side (right), bright on highlight side (left)
  ctx.strokeStyle = "rgba(20,14,6,0.45)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + topW - s * 0.01, trunkTop + s * 0.04);
  ctx.bezierCurveTo(
    x + topW * 1.05, trunkTop + trunkH * 0.3,
    x + botW * 0.95, trunkBot - s * 0.1,
    x + botW - s * 0.02, trunkBot - s * 0.02,
  );
  ctx.stroke();

  ctx.strokeStyle = `rgba(90,64,32,${0.3 + pulse * 0.1})`;
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - topW + s * 0.01, trunkTop + s * 0.04);
  ctx.bezierCurveTo(
    x - topW * 1.05, trunkTop + trunkH * 0.3,
    x - botW * 0.95, trunkBot - s * 0.1,
    x - botW + s * 0.02, trunkBot - s * 0.02,
  );
  ctx.stroke();
}

// ─── COLOSSUS: Bark Armor Plates ─────────────────────────────────────────────

function drawColossusBarkPlates(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, pulse: number,
) {
  const plates = [
    { cx: 0, cy: -0.12, w: 0.18, h: 0.1, rot: 0, seed: 30 },
    { cx: -0.1, cy: -0.04, w: 0.12, h: 0.08, rot: -0.15, seed: 32 },
    { cx: 0.1, cy: -0.04, w: 0.12, h: 0.08, rot: 0.15, seed: 34 },
    { cx: 0, cy: 0.04, w: 0.15, h: 0.07, rot: 0, seed: 36 },
    { cx: -0.08, cy: 0.1, w: 0.1, h: 0.06, rot: -0.1, seed: 38 },
    { cx: 0.08, cy: 0.1, w: 0.1, h: 0.06, rot: 0.1, seed: 40 },
  ];

  for (let i = 0; i < plates.length; i++) {
    const p = plates[i];
    const px = x + p.cx * s;
    const py = y + p.cy * s;
    const hw = p.w * s * 0.5;
    const hh = p.h * s * 0.5;

    // 3D radial gradient: highlight upper-left
    const plateGrad = ctx.createRadialGradient(
      px - hw * 0.25, py - hh * 0.3, hh * 0.1,
      px, py, hw,
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
    drawOrganicBlob(ctx, -hw * 0.1, -hh * 0.25, hw * 0.6, hh * 0.4, 8, 0.1, p.seed + 1);
    ctx.fill();

    // Rim light on upper edge
    ctx.strokeStyle = "rgba(130,100,60,0.25)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(-hw * 0.05, -hh * 0.5, hw * 0.7, hh * 0.2, 0, Math.PI * 0.8, Math.PI * 0.2, true);
    ctx.stroke();

    ctx.restore();

    // Glowing seam lines between plates
    if (i < plates.length - 1) {
      const seamAlpha = 0.15 + pulse * 0.1 + Math.sin(time * 3 + i) * 0.05;
      ctx.shadowColor = P.shadowHex;
      ctx.shadowBlur = 3 * zoom;
      ctx.strokeStyle = `rgba(${P.glow},${seamAlpha})`;
      ctx.lineWidth = 1.0 * zoom;
      ctx.beginPath();
      ctx.moveTo(px - s * 0.08, py + p.h * s * 0.5);
      ctx.lineTo(px + s * 0.08, py + p.h * s * 0.5);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Central Tree of Life rune with shadow glow
  const runeGlow = 0.45 + pulse * 0.4;
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = (8 + pulse * 5) * zoom;
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
  ctx.shadowBlur = 0;
}

// ─── COLOSSUS: Branch Arms ───────────────────────────────────────────────────

function drawColossusBranchArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, atkBurst: number,
) {
  for (const side of [-1, 1]) {
    const shoulderX = x + side * s * 0.2;
    const shoulderY = y - s * 0.15;
    const swingAngle = Math.sin(time * 1.5 + side * 1.2) * 0.2 + atkBurst * Math.sin(time * 6 + side) * 0.4;
    const armLen = s * 0.42;

    ctx.save();
    ctx.translate(shoulderX, shoulderY);
    ctx.rotate(side * 0.35 + swingAngle);

    // Upper arm as organic tapered blob with 3D gradient
    const upperMidY = armLen * 0.28;
    const upperRx = s * 0.058;
    const upperRy = armLen * 0.45;
    const upperGrad = ctx.createRadialGradient(
      -upperRx * 0.3, upperMidY - upperRy * 0.2, s * 0.01,
      0, upperMidY, upperRx * 1.2,
    );
    upperGrad.addColorStop(0, "#6a5028");
    upperGrad.addColorStop(0.3, "#5a4020");
    upperGrad.addColorStop(0.7, "#4a3418");
    upperGrad.addColorStop(1, "#3a2810");
    ctx.fillStyle = upperGrad;
    drawOrganicBlob(ctx, 0, upperMidY, upperRx, upperRy, 10, 0.1, side * 13 + 50);
    ctx.fill();

    // Bark ridges on upper arm
    ctx.strokeStyle = "rgba(20,14,6,0.35)";
    ctx.lineWidth = 0.6 * zoom;
    for (let k = 0; k < 3; k++) {
      const ky = armLen * (0.08 + k * 0.14);
      ctx.beginPath();
      ctx.moveTo(-s * 0.04, ky);
      ctx.lineTo(s * 0.04, ky + s * 0.003);
      ctx.stroke();
    }

    // Glowing vein along upper arm
    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 3 * zoom;
    ctx.strokeStyle = `rgba(${P.glow},${0.28 + atkBurst * 0.2})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.01);
    ctx.bezierCurveTo(s * 0.01, armLen * 0.2, -s * 0.01, armLen * 0.4, 0, armLen * 0.52);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Elbow joint as 3D sphere
    ctx.save();
    ctx.translate(0, armLen * 0.5);
    const elbowR = s * 0.032;
    const elbowGrad = ctx.createRadialGradient(
      -elbowR * 0.3, -elbowR * 0.3, elbowR * 0.1,
      0, 0, elbowR,
    );
    elbowGrad.addColorStop(0, "#7a5830");
    elbowGrad.addColorStop(0.5, "#5a4020");
    elbowGrad.addColorStop(1, "#2a1a08");
    ctx.fillStyle = elbowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, elbowR, 0, Math.PI * 2);
    ctx.fill();

    // Forearm as organic tapered blob
    ctx.rotate(0.35 + atkBurst * 0.5);
    const foreLen = armLen * 0.48;
    const foreMidY = foreLen * 0.5;
    const foreRx = s * 0.045;
    const foreRy = foreLen * 0.42;
    const foreGrad = ctx.createRadialGradient(
      -foreRx * 0.25, foreMidY - foreRy * 0.2, s * 0.005,
      0, foreMidY, foreRx * 1.1,
    );
    foreGrad.addColorStop(0, "#5a4420");
    foreGrad.addColorStop(0.4, "#4a3418");
    foreGrad.addColorStop(1, "#3a2810");
    ctx.fillStyle = foreGrad;
    drawOrganicBlob(ctx, 0, foreMidY, foreRx, foreRy, 9, 0.12, side * 17 + 60);
    ctx.fill();

    // Thorn claws: thick with sharp highlight tip
    const clawBase = foreLen * 0.9;
    for (let c = 0; c < 4; c++) {
      const clawAngle = (c - 1.5) * 0.3;
      const clawLen = s * (0.075 + Math.abs(c - 1.5) * 0.01);
      const clawBaseX = (c - 1.5) * s * 0.018;
      const clawTipX = clawBaseX + Math.sin(clawAngle) * clawLen;
      const clawTipY = clawBase + Math.cos(clawAngle) * clawLen;

      ctx.strokeStyle = "#2a1a08";
      ctx.lineWidth = (3.5 + atkBurst * 1.0) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(clawBaseX, clawBase);
      ctx.lineTo(clawTipX, clawTipY);
      ctx.stroke();

      ctx.shadowColor = P.shadowHex;
      ctx.shadowBlur = 3 * zoom;
      ctx.fillStyle = `rgba(${P.glow},${0.5 + atkBurst * 0.4})`;
      ctx.beginPath();
      ctx.arc(clawTipX, clawTipY, (2.0 + atkBurst * 0.6) * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // Sub-branches as small organic offshoots
    for (let b = 0; b < 3; b++) {
      const by = b * armLen * 0.15 + armLen * 0.1;
      const bSide = b % 2 === 0 ? 1 : -1;
      const bLen = s * 0.045;
      const bTipX = bSide * (s * 0.04 + bLen);
      const bTipY = by - bLen * 0.5;

      ctx.strokeStyle = "#4a3018";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bSide * s * 0.04, by);
      ctx.lineTo(bTipX, bTipY);
      ctx.stroke();

      ctx.fillStyle = `rgba(${P.leaf},${0.45 + atkBurst * 0.15})`;
      drawOrganicBlob(ctx, bTipX, bTipY, s * 0.014, s * 0.007, 6, 0.2, b * 5 + side * 9 + 70);
      ctx.fill();
    }

    // Vine spirals wrapping arm with 3D highlight
    for (let v = 0; v < 5; v++) {
      const vy = v * armLen * 0.1 + armLen * 0.05;
      const vPhase = time * 2 + v * 1.3 + side;
      ctx.strokeStyle = `rgba(${P.glow},${0.22 + atkBurst * 0.15})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.arc(0, vy, s * 0.042, vPhase, vPhase + Math.PI * 0.6);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${P.glowBright},${0.1 + atkBurst * 0.08})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.arc(-0.5, vy - 0.5, s * 0.042, vPhase, vPhase + Math.PI * 0.4);
      ctx.stroke();
    }

    // Shoulder joint: glowing 3D sphere
    const shR = s * 0.048;
    const shGrad = ctx.createRadialGradient(
      -shR * 0.25, -shR * 0.25, shR * 0.1,
      0, 0, shR,
    );
    shGrad.addColorStop(0, "#7a5830");
    shGrad.addColorStop(0.35, "#5a4020");
    shGrad.addColorStop(0.7, "#3a2810");
    shGrad.addColorStop(1, "#1a1208");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.arc(0, 0, shR, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 4 * zoom;
    ctx.fillStyle = `rgba(${P.glow},${0.15 + Math.sin(time * 3 + side) * 0.08})`;
    ctx.beginPath();
    ctx.arc(0, 0, shR * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

// ─── COLOSSUS: Face (deep carved bark) ───────────────────────────────────────

function drawColossusFace(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, pulse: number,
) {
  const faceY = y - s * 0.25;

  // Carved brow ridge with highlight top / shadow bottom
  ctx.strokeStyle = "#2a1a08";
  ctx.lineWidth = 3.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.13, faceY - s * 0.015);
  ctx.bezierCurveTo(x - s * 0.04, faceY - s * 0.045, x + s * 0.04, faceY - s * 0.045, x + s * 0.13, faceY - s * 0.015);
  ctx.stroke();
  ctx.strokeStyle = "rgba(100,75,40,0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.12, faceY - s * 0.02);
  ctx.bezierCurveTo(x - s * 0.04, faceY - s * 0.05, x + s * 0.04, faceY - s * 0.05, x + s * 0.12, faceY - s * 0.02);
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
    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = (12 + pulse * 8) * zoom;
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.035);
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
    ctx.shadowBlur = 0;

    // Bright eye specular highlight
    ctx.fillStyle = `rgba(255,255,255,${0.65 + pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(eyeX + side * s * 0.006, eyeY - s * 0.004, s * 0.006, 0, Math.PI * 2);
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

  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 5 * zoom;
  const mouthGlow = 0.35 + pulse * 0.25 + Math.sin(time * 2) * 0.1;
  ctx.fillStyle = `rgba(${P.glow},${mouthGlow})`;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.035, mouthY + s * 0.002);
  ctx.quadraticCurveTo(x, mouthY + s * 0.01, x + s * 0.035, mouthY + s * 0.002);
  ctx.quadraticCurveTo(x, mouthY + s * 0.005, x - s * 0.035, mouthY + s * 0.002);
  ctx.fill();
  ctx.shadowBlur = 0;

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
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 3 * zoom;
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
  ctx.shadowBlur = 0;

  // Bark wrinkle lines radiating from eyes/mouth (shadow + highlight pairs)
  const wrinkles = [
    { sx: -0.06, sy: -0.03, ex: -0.13, ey: 0.02 },
    { sx: 0.06, sy: -0.03, ex: 0.13, ey: 0.02 },
    { sx: -0.04, sy: 0.035, ex: -0.1, ey: 0.06 },
    { sx: 0.04, sy: 0.035, ex: 0.1, ey: 0.06 },
    { sx: -0.02, sy: -0.04, ex: -0.06, ey: -0.06 },
    { sx: 0.02, sy: -0.04, ex: 0.06, ey: -0.06 },
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
  x: number, y: number, s: number,
  time: number, zoom: number, pulse: number, atkBurst: number,
) {
  const canopyY = y - s * 0.38;
  const canopyR = s * 0.35;

  // Branch framework
  const branchCount = 6;
  for (let i = 0; i < branchCount; i++) {
    const a = (i / branchCount) * Math.PI - Math.PI * 0.5 + Math.sin(time * 0.4 + i) * 0.05;
    const bLen = s * (0.22 + Math.sin(i * 1.7) * 0.04);
    const bx2 = x + Math.cos(a) * bLen;
    const by2 = canopyY + Math.sin(a) * bLen * 0.6 - s * 0.05;

    ctx.strokeStyle = "#4a3018";
    ctx.lineWidth = (2.5 - i * 0.15) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.3);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * bLen * 0.4, canopyY + Math.sin(a) * bLen * 0.3 - s * 0.02,
      bx2, by2,
    );
    ctx.stroke();

    for (let sb = 0; sb < 2; sb++) {
      const subT = 0.5 + sb * 0.25;
      const subX = x + Math.cos(a) * bLen * subT;
      const subY = canopyY + Math.sin(a) * bLen * subT * 0.6 - s * 0.05 * (1 - subT);
      const subA = a + (sb % 2 === 0 ? 0.5 : -0.5);
      const subLen = s * 0.06;
      ctx.strokeStyle = "#3a2510";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(subX, subY);
      ctx.lineTo(subX + Math.cos(subA) * subLen, subY + Math.sin(subA) * subLen * 0.5);
      ctx.stroke();
    }
  }

  // ── Style-specific canopy shapes using organic blob clusters ──

  if (P.canopyStyle === "flat") {
    // Wide flat arrangement with sparse gaps — sandy-olive gradient
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
      const grad = ctx.createRadialGradient(bx - b.rx * canopyR * 0.2, by - b.ry * s * 0.3, s * 0.01, bx, by, b.rx * canopyR);
      grad.addColorStop(0, `rgba(${hexToRgb(P.canopy[ci])},${0.75 + pulse * 0.08})`);
      grad.addColorStop(1, `rgba(${hexToRgb(P.canopy[0])},${0.45 + pulse * 0.05})`);
      ctx.fillStyle = grad;
      drawOrganicBlob(ctx, bx, by, b.rx * canopyR, b.ry * s, 10, 0.18, b.seed + time * 0.05);
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
      drawOrganicBlob(ctx, bx, by, b.rx * canopyR, b.ry * s, 9, 0.15, b.seed + time * 0.03);
      ctx.fill();
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + time * 0.12;
      const leafDist = canopyR * (1.1 + Math.sin(i * 2.3) * 0.1);
      const lx = x + Math.cos(a) * leafDist;
      const ly = canopyY + Math.sin(a) * leafDist * 0.25;
      ctx.fillStyle = `rgba(${P.leaf},${0.4 + pulse * 0.12})`;
      drawOrganicBlob(ctx, lx, ly, s * 0.015, s * 0.006, 6, 0.2, i * 3.1);
      ctx.fill();
    }
  } else if (P.canopyStyle === "conical") {
    // Triangular stack of blob layers narrowing toward top
    const layers = 5;
    for (let i = 0; i < layers; i++) {
      const t = i / (layers - 1);
      const layerY = canopyY + s * 0.08 - t * s * 0.35;
      const layerW = canopyR * (0.9 - t * 0.7);
      const ci = Math.min(i, 3);
      const alpha = 0.7 - t * 0.1;
      // Back shadow blob
      ctx.fillStyle = `rgba(${hexToRgb(P.canopy[0])},${alpha * 0.4})`;
      drawOrganicBlob(ctx, x, layerY + s * 0.01, layerW * 1.05, s * 0.04, 10, 0.12, 120 + i * 3);
      ctx.fill();
      // Main blob layer with gradient
      const grad = ctx.createRadialGradient(x - layerW * 0.2, layerY - s * 0.02, s * 0.005, x, layerY, layerW);
      grad.addColorStop(0, `rgba(${hexToRgb(P.canopy[ci])},${alpha + pulse * 0.08})`);
      grad.addColorStop(1, `rgba(${hexToRgb(P.canopy[0])},${alpha * 0.6})`);
      ctx.fillStyle = grad;
      drawOrganicBlob(ctx, x, layerY, layerW, s * (0.035 + (1 - t) * 0.015), 10, 0.15, 130 + i * 3 + time * 0.02);
      ctx.fill();
      // Frost highlight on top edge
      ctx.strokeStyle = `rgba(${P.glowBright},${0.3 + pulse * 0.12})`;
      ctx.lineWidth = 0.9 * zoom;
      ctx.beginPath();
      ctx.ellipse(x, layerY - s * 0.01, layerW * 0.8, s * 0.008, 0, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
    // Frost sparkles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI - Math.PI * 0.5;
      const dist = canopyR * (0.5 + Math.sin(i * 1.9) * 0.15);
      const fx = x + Math.cos(angle) * dist;
      const fy = canopyY - s * 0.05 + Math.sin(angle) * dist * 0.4;
      const fAlpha = 0.3 + Math.sin(time * 3.5 + i * 1.2) * 0.2;
      ctx.fillStyle = `rgba(${P.glowWhite},${fAlpha})`;
      ctx.beginPath();
      ctx.arc(fx, fy, s * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (P.canopyStyle === "ember") {
    // Almost no foliage — 2-3 dark ash remnant blobs
    ctx.fillStyle = `rgba(${hexToRgb(P.canopy[0])},${0.3 + pulse * 0.05})`;
    drawOrganicBlob(ctx, x - canopyR * 0.1, canopyY, canopyR * 0.4, canopyR * 0.22, 10, 0.2, 140 + time * 0.02);
    ctx.fill();
    ctx.fillStyle = `rgba(${hexToRgb(P.canopy[1])},${0.2 + pulse * 0.04})`;
    drawOrganicBlob(ctx, x + canopyR * 0.15, canopyY - s * 0.01, canopyR * 0.3, canopyR * 0.16, 9, 0.18, 145);
    ctx.fill();
    ctx.fillStyle = `rgba(${hexToRgb(P.canopy[2])},${0.12 + pulse * 0.03})`;
    drawOrganicBlob(ctx, x, canopyY - s * 0.02, canopyR * 0.22, canopyR * 0.12, 8, 0.15, 148);
    ctx.fill();

    // 20+ floating ember particles with hot cores rising upward
    for (let i = 0; i < 22; i++) {
      const phase = (time * 0.5 + i * 0.0455) % 1;
      const drift = Math.sin(time * 1.5 + i * 2.1) * canopyR * 0.6;
      const ex = x + drift;
      const ey = canopyY + s * 0.06 - phase * s * 0.55;
      const eAlpha = Math.sin(phase * Math.PI) * (0.55 + atkBurst * 0.15);
      const eSize = (1.8 + Math.sin(i * 1.3) * 0.7) * zoom;

      ctx.shadowColor = P.shadowHex;
      ctx.shadowBlur = 3 * zoom;
      ctx.fillStyle = `rgba(${P.pollen},${eAlpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Hot core
      ctx.fillStyle = `rgba(${P.glowWhite},${eAlpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(ex, ey, eSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (P.canopyStyle === "weeping") {
    // Dome of organic blobs plus hanging vine strands with bioluminescent tips
    const domeBlobs = [
      { dx: 0, dy: 0, rx: 0.85, ry: 0.5, ci: 0, seed: 150 },
      { dx: -0.15, dy: 0.01, rx: 0.55, ry: 0.35, ci: 1, seed: 152 },
      { dx: 0.18, dy: 0.005, rx: 0.5, ry: 0.33, ci: 1, seed: 154 },
      { dx: -0.05, dy: -0.01, rx: 0.6, ry: 0.38, ci: 2, seed: 156 },
      { dx: 0.08, dy: -0.015, rx: 0.45, ry: 0.28, ci: 3, seed: 158 },
    ];
    // Shadow blobs underneath
    ctx.fillStyle = `rgba(0,0,0,0.1)`;
    drawOrganicBlob(ctx, x, canopyY + s * 0.03, canopyR * 0.9, canopyR * 0.5, 12, 0.15, 149);
    ctx.fill();
    for (const b of domeBlobs) {
      const bx = x + b.dx * canopyR;
      const by = canopyY + b.dy * s;
      const grad = ctx.createRadialGradient(bx - b.rx * canopyR * 0.15, by - b.ry * canopyR * 0.2, s * 0.01, bx, by, b.rx * canopyR);
      grad.addColorStop(0, `rgba(${hexToRgb(P.canopy[b.ci])},${0.7 + pulse * 0.08})`);
      grad.addColorStop(1, `rgba(${hexToRgb(P.canopy[0])},${0.35})`);
      ctx.fillStyle = grad;
      drawOrganicBlob(ctx, bx, by, b.rx * canopyR, b.ry * canopyR, 11, 0.15, b.seed + time * 0.03);
      ctx.fill();
    }
    // Hanging vine strands (thick drooping bezier with 3D width)
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const hangBaseR = canopyR * (0.85 + Math.sin(i * 1.7) * 0.1);
      const hangX = x + Math.cos(angle) * hangBaseR;
      const hangTopY = canopyY + Math.sin(angle) * hangBaseR * 0.45;
      const hangLen = s * (0.1 + Math.sin(i * 2.3) * 0.04 + atkBurst * 0.03);
      const sway = Math.sin(time * 1.5 + i * 0.8) * s * 0.012;

      ctx.strokeStyle = `rgba(${P.vine},${0.35 + pulse * 0.12})`;
      ctx.lineWidth = (1.5 + Math.sin(i) * 0.4) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hangX, hangTopY);
      ctx.quadraticCurveTo(hangX + sway, hangTopY + hangLen * 0.6, hangX + sway * 1.5, hangTopY + hangLen);
      ctx.stroke();

      // Bioluminescent tip
      if (i % 2 === 0) {
        const tipX = hangX + sway * 1.5;
        const tipY = hangTopY + hangLen + s * 0.005;
        ctx.shadowColor = P.shadowHex;
        ctx.shadowBlur = 4 * zoom;
        ctx.fillStyle = `rgba(${P.glow},${0.4 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(tipX, tipY, s * 0.005, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    // Scattered leaf clusters
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + time * 0.15;
      const leafDist = canopyR * (0.9 + Math.sin(i * 2.3) * 0.12);
      const lx = x + Math.cos(a) * leafDist;
      const ly = canopyY + Math.sin(a) * leafDist * 0.5;
      ctx.fillStyle = `rgba(${P.leaf},${0.4 + pulse * 0.12})`;
      drawOrganicBlob(ctx, lx, ly, s * 0.013, s * 0.006, 6, 0.2, i * 2.7);
      ctx.fill();
    }
  } else {
    // Round (grassland) — dome of 6 large organic blobs + 12 small detail blobs
    const backLayer = [
      { dx: 0, dy: 0.015, rx: 0.75, ry: 0.5, ci: 0, seed: 160 },
      { dx: -0.2, dy: 0.01, rx: 0.45, ry: 0.35, ci: 0, seed: 162 },
      { dx: 0.22, dy: 0.01, rx: 0.42, ry: 0.33, ci: 0, seed: 164 },
    ];
    // Shadow blobs underneath
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    drawOrganicBlob(ctx, x, canopyY + s * 0.025, canopyR * 0.8, canopyR * 0.45, 12, 0.12, 159);
    ctx.fill();
    for (const b of backLayer) {
      const bx = x + b.dx * canopyR;
      const by = canopyY + b.dy * s;
      ctx.fillStyle = `rgba(${hexToRgb(P.canopy[b.ci])},${0.65 + pulse * 0.06})`;
      drawOrganicBlob(ctx, bx, by, b.rx * canopyR, b.ry * canopyR, 11, 0.15, b.seed + time * 0.03);
      ctx.fill();
    }
    const frontLayer = [
      { dx: -0.1, dy: -0.005, rx: 0.55, ry: 0.4, ci: 1, seed: 170 },
      { dx: 0.12, dy: 0.0, rx: 0.5, ry: 0.38, ci: 2, seed: 172 },
      { dx: 0, dy: -0.015, rx: 0.45, ry: 0.3, ci: 3, seed: 174 },
    ];
    for (const b of frontLayer) {
      const bx = x + b.dx * canopyR;
      const by = canopyY + b.dy * s;
      const grad = ctx.createRadialGradient(bx - b.rx * canopyR * 0.2, by - b.ry * canopyR * 0.25, s * 0.01, bx, by, b.rx * canopyR);
      grad.addColorStop(0, `rgba(${hexToRgb(P.canopy[b.ci])},${0.7 + pulse * 0.1})`);
      grad.addColorStop(1, `rgba(${hexToRgb(P.canopy[Math.max(b.ci - 1, 0)])},${0.4})`);
      ctx.fillStyle = grad;
      drawOrganicBlob(ctx, bx, by, b.rx * canopyR, b.ry * canopyR, 10, 0.14, b.seed + time * 0.04);
      ctx.fill();
    }
    // Individual leaf clusters scattered on top
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + time * 0.15;
      const leafDist = canopyR * (0.65 + Math.sin(i * 2.3) * 0.15);
      const lx = x + Math.cos(a) * leafDist;
      const ly = canopyY + Math.sin(a) * leafDist * 0.5;
      ctx.fillStyle = `rgba(${P.leaf},${0.5 + pulse * 0.15 + Math.sin(time * 3 + i) * 0.1})`;
      drawOrganicBlob(ctx, lx, ly, s * 0.016, s * 0.007, 6, 0.2, i * 3.3 + 180);
      ctx.fill();
    }
    // Dappled light spots on top
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + time * 0.08;
      const dx = Math.cos(a) * canopyR * 0.4;
      const dy = Math.sin(a) * canopyR * 0.25 - canopyR * 0.15;
      ctx.fillStyle = `rgba(${P.glowBright},${0.12 + Math.sin(time * 2.5 + i * 1.8) * 0.06})`;
      ctx.beginPath();
      ctx.arc(x + dx, canopyY + dy, s * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Flowers/decorations (skip for ember)
  if (P.canopyStyle !== "ember") {
    const flowers = [
      { a: 0.3, d: 0.6, color: P.flower },
      { a: 1.5, d: 0.5, color: P.pollen },
      { a: 2.8, d: 0.7, color: P.flower },
      { a: 4.2, d: 0.55, color: P.pollen },
      { a: 5.5, d: 0.65, color: P.glowBright },
    ];
    for (const f of flowers) {
      const fx = x + Math.cos(f.a + time * 0.1) * canopyR * f.d;
      const fy = canopyY + Math.sin(f.a + time * 0.1) * canopyR * f.d * 0.5;
      const bloomAlpha = 0.5 + pulse * 0.2;

      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2 + time * 0.3;
        const pr = s * 0.008;
        ctx.fillStyle = `rgba(${f.color},${bloomAlpha * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(pa) * pr, fy + Math.sin(pa) * pr, s * 0.006, s * 0.003, pa, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(${P.pollen},${bloomAlpha})`;
      ctx.beginPath();
      ctx.arc(fx, fy, s * 0.003, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner canopy glow
  const canopyGlow = ctx.createRadialGradient(x, canopyY, 0, x, canopyY, canopyR * 0.6);
  canopyGlow.addColorStop(0, `rgba(${P.glowBright},${0.14 + pulse * 0.07})`);
  canopyGlow.addColorStop(0.5, `rgba(${P.glow},${0.06 + pulse * 0.03})`);
  canopyGlow.addColorStop(1, `rgba(${P.glowDark},0)`);
  ctx.fillStyle = canopyGlow;
  ctx.beginPath();
  ctx.ellipse(x, canopyY, canopyR * 0.7, canopyR * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Falling particles (ember rises instead)
  if (P.canopyStyle !== "ember") {
    for (let i = 0; i < 6; i++) {
      const phase = (time * 0.4 + i * 0.167) % 1;
      const fallX = x + Math.sin(time * 1.2 + i * 1.8) * canopyR * 0.5;
      const fallY = canopyY + phase * s * 0.6;
      const fallAlpha = Math.sin(phase * Math.PI) * 0.4;
      const fallRot = time * 3 + i * 2;

      ctx.fillStyle = `rgba(${P.leaf},${fallAlpha})`;
      ctx.save();
      ctx.translate(fallX, fallY);
      ctx.rotate(fallRot);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.008, s * 0.003, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// ─── COLOSSUS: Leaf Vortex ───────────────────────────────────────────────────

function drawColossusVortex(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, atkBurst: number,
) {
  const leafCount = 16 + Math.floor(atkBurst * 8);
  for (let i = 0; i < leafCount; i++) {
    const orbit = (i < leafCount * 0.5) ? 0.55 : 0.75;
    const speed = (i < leafCount * 0.5) ? 1.5 : -1.0;
    const a = time * speed + (i / leafCount) * Math.PI * 2;
    const r = s * (orbit + Math.sin(time * 2 + i * 1.3) * 0.06);
    const lx = x + Math.cos(a) * r;
    const ly = y - s * 0.1 + Math.sin(a * 0.7 + time * 0.8) * s * 0.15;
    const lAlpha = 0.35 + Math.sin(time * 3 + i * 0.8) * 0.15 + atkBurst * 0.15;
    const lSize = (1.5 + Math.sin(i * 1.1) * 0.5 + atkBurst * 0.5) * zoom;

    // Trailing glow behind each leaf
    ctx.fillStyle = `rgba(${P.glow},${lAlpha * 0.3})`;
    const trailA = a - speed * 0.15;
    const trailX = x + Math.cos(trailA) * r;
    const trailY = y - s * 0.1 + Math.sin(trailA * 0.7 + time * 0.8) * s * 0.15;
    ctx.beginPath();
    ctx.arc(trailX, trailY, lSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Leaf body
    ctx.fillStyle = `rgba(${P.leaf},${lAlpha})`;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(time * 2.5 + i * 1.4);
    ctx.beginPath();
    ctx.ellipse(0, 0, lSize, lSize * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    // Midrib line through center
    ctx.strokeStyle = `rgba(${P.leafDark},${lAlpha * 0.5})`;
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(-lSize * 0.8, 0);
    ctx.lineTo(lSize * 0.8, 0);
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 0; i < 10; i++) {
    const phase = (time * 0.35 + i * 0.1) % 1;
    const mx = x + Math.sin(time * 0.8 + i * 1.4) * s * 0.45;
    const my = y + s * 0.15 - phase * s * 0.7;
    const mAlpha = Math.sin(phase * Math.PI) * (0.35 + atkBurst * 0.15);
    ctx.fillStyle = `rgba(${P.pollen},${mAlpha})`;
    ctx.beginPath();
    ctx.arc(mx, my, (1.2 + atkBurst * 0.4) * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── COLOSSUS: Energy Pulse ──────────────────────────────────────────────────

function drawColossusEnergyPulse(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, pulse: number, atkBurst: number,
) {
  const auraR = s * (0.7 + pulse * 0.1 + atkBurst * 0.15);
  const aG = ctx.createRadialGradient(x, y, s * 0.15, x, y, auraR);
  aG.addColorStop(0, `rgba(${P.glow},${0.1 + pulse * 0.05})`);
  aG.addColorStop(0.4, `rgba(${P.vine},${0.04 + pulse * 0.02})`);
  aG.addColorStop(1, `rgba(${P.glowDark},0)`);
  ctx.fillStyle = aG;
  ctx.beginPath();
  ctx.arc(x, y, auraR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(${P.glow},${0.2 + Math.sin(time * 3) * 0.08 + atkBurst * 0.1})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  for (let i = 0; i < 50; i++) {
    const a = (i / 50) * Math.PI * 2 + time * 1.5;
    const r = s * (0.5 + Math.sin(a * 4 + time * 3) * 0.04);
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r * 0.45;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Isometric ground ring
  const groundRingY = y + s * 0.3;
  const ringR = s * (0.45 + pulse * 0.05 + atkBurst * 0.1);
  ctx.save();
  ctx.translate(x, groundRingY);
  ctx.scale(1, 0.3);
  ctx.strokeStyle = `rgba(${P.glow},${0.12 + pulse * 0.06 + atkBurst * 0.08})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < 8; i++) {
    const phase = (time * 1.0 + i * 0.125) % 1;
    const spiralA = time * 2 + i * (Math.PI * 2 / 8);
    const spiralR = s * (0.2 + phase * 0.3);
    const px = x + Math.cos(spiralA) * spiralR;
    const py = y - s * 0.1 + Math.sin(spiralA) * spiralR * 0.4 - phase * s * 0.15;
    const pAlpha = Math.sin(phase * Math.PI) * (0.5 + atkBurst * 0.25);
    const pSize = (1.2 + atkBurst * 1) * zoom;

    ctx.fillStyle = `rgba(${P.glowBright},${pAlpha})`;
    ctx.beginPath();
    ctx.moveTo(px, py - pSize);
    ctx.lineTo(px + pSize * 0.5, py);
    ctx.lineTo(px, py + pSize);
    ctx.lineTo(px - pSize * 0.5, py);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── COLOSSUS: Attack Wave ───────────────────────────────────────────────────

function drawColossusAttackWave(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  atkBurst: number, time: number, zoom: number,
) {
  // Impact shockwave: isometric ellipse ring expanding
  const waveR = s * 0.65 * atkBurst;
  ctx.save();
  ctx.translate(x, y + s * 0.28);
  ctx.scale(1, 0.3);
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 8 * zoom;
  ctx.strokeStyle = `rgba(${P.glow},${atkBurst * 0.35})`;
  ctx.lineWidth = (3 + atkBurst * 2) * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, waveR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Root eruptions as thick organic blob shapes
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + time * 2;
    const vineLen = s * (0.55 + i * 0.015) * atkBurst;
    const sway = Math.sin(time * 5 + i * 0.8) * s * 0.04 * atkBurst;
    const tipX = x + Math.cos(a) * vineLen;
    const tipY = y + Math.sin(a) * vineLen * 0.45;

    // Root body as filled organic tapered shape
    const rootMidX = (x + tipX) / 2;
    const rootMidY = (y + s * 0.1 + tipY) / 2;
    const rootAngle = Math.atan2(tipY - y - s * 0.1, tipX - x);
    const rootRx = vineLen * 0.4;
    const rootRy = s * 0.03 * atkBurst;

    // 3D gradient: highlight on one side
    const hlOff = s * 0.015;
    const rootGrad = ctx.createRadialGradient(
      rootMidX - Math.sin(rootAngle) * hlOff, rootMidY + Math.cos(rootAngle) * hlOff, s * 0.005,
      rootMidX, rootMidY, rootRx * 0.6,
    );
    rootGrad.addColorStop(0, `rgba(90,64,32,${atkBurst * 0.7})`);
    rootGrad.addColorStop(0.5, `rgba(61,42,20,${atkBurst * 0.5})`);
    rootGrad.addColorStop(1, `rgba(26,18,8,${atkBurst * 0.3})`);
    ctx.fillStyle = rootGrad;

    ctx.save();
    ctx.translate(rootMidX + sway * 0.3, rootMidY);
    ctx.rotate(rootAngle);
    drawOrganicBlob(ctx, 0, 0, rootRx, rootRy, 8, 0.2, i * 2.3 + 200);
    ctx.fill();
    ctx.restore();

    // Bark texture lines on erupting root
    ctx.strokeStyle = `rgba(15,10,4,${atkBurst * 0.3})`;
    ctx.lineWidth = 0.6 * zoom;
    for (let k = 0; k < 2; k++) {
      const t = 0.3 + k * 0.3;
      const lx = x + (tipX - x) * t + sway * t;
      const ly = y + s * 0.1 + (tipY - y - s * 0.1) * t;
      ctx.beginPath();
      ctx.moveTo(lx - s * 0.015, ly);
      ctx.lineTo(lx + s * 0.015, ly);
      ctx.stroke();
    }

    // Ground crack at each eruption point
    const emergeX = x + Math.cos(a) * s * 0.1;
    const emergeY = y + s * 0.28 + Math.sin(a) * s * 0.03;
    for (let c = 0; c < 3; c++) {
      const crackA = a + (c - 1) * 0.4;
      const crackLen = s * 0.06 * atkBurst;
      ctx.strokeStyle = `rgba(10,6,2,${atkBurst * 0.25})`;
      ctx.lineWidth = 1.0 * zoom;
      ctx.beginPath();
      ctx.moveTo(emergeX, emergeY);
      ctx.lineTo(emergeX + Math.cos(crackA) * crackLen, emergeY + Math.sin(crackA) * crackLen * 0.3);
      ctx.stroke();
    }

    // Thorn tip with bright highlight
    const thornSize = s * 0.04 * atkBurst;
    ctx.fillStyle = `rgba(${P.leafDark},${atkBurst * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(tipX + Math.cos(a) * thornSize, tipY + Math.sin(a) * thornSize * 0.4);
    ctx.lineTo(tipX + Math.cos(a + 2.3) * thornSize * 0.5, tipY + Math.sin(a + 2.3) * thornSize * 0.4);
    ctx.lineTo(tipX + Math.cos(a - 2.3) * thornSize * 0.5, tipY + Math.sin(a - 2.3) * thornSize * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(${P.glowBright},${atkBurst * 0.5})`;
    ctx.beginPath();
    ctx.arc(tipX + Math.cos(a) * thornSize, tipY + Math.sin(a) * thornSize * 0.4, zoom * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Dirt/debris particles kicked up
    if (i % 3 === 0) {
      for (let d = 0; d < 3; d++) {
        const debrisPhase = (time * 3 + d * 0.33 + i * 0.5) % 1;
        const dx = emergeX + Math.sin(time * 4 + d * 2 + i) * s * 0.02;
        const dy = emergeY - debrisPhase * s * 0.06;
        const dAlpha = Math.sin(debrisPhase * Math.PI) * atkBurst * 0.4;
        ctx.fillStyle = `rgba(80,55,30,${dAlpha})`;
        ctx.beginPath();
        ctx.arc(dx, dy, s * 0.004, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Leaf burst at root tip (2-3 leaves)
    if (i % 4 === 0) {
      for (let l = 0; l < 2; l++) {
        const leafA = a + (l - 0.5) * 0.8;
        const leafDist = s * 0.03 * atkBurst;
        const leafX = tipX + Math.cos(leafA) * leafDist;
        const leafY = tipY + Math.sin(leafA) * leafDist * 0.5 - s * 0.01;
        ctx.fillStyle = `rgba(${P.leaf},${atkBurst * 0.45})`;
        ctx.save();
        ctx.translate(leafX, leafY);
        ctx.rotate(time * 4 + l + i);
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.012, s * 0.005, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // Ground-level energy wave: glowing crack pattern on the floor
  const waveAlpha = atkBurst * 0.25;
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 4 * zoom;
  for (let c = 0; c < 12; c++) {
    const cAngle = (c / 12) * Math.PI * 2;
    const cLen = s * (0.3 + Math.sin(time * 2 + c) * 0.05) * atkBurst;
    ctx.strokeStyle = `rgba(${P.glow},${waveAlpha})`;
    ctx.lineWidth = (2.2 - c * 0.05) * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.28);
    ctx.bezierCurveTo(
      x + Math.cos(cAngle) * cLen * 0.4, y + s * 0.29,
      x + Math.cos(cAngle) * cLen * 0.7, y + s * 0.28 + Math.sin(cAngle) * cLen * 0.2,
      x + Math.cos(cAngle) * cLen, y + s * 0.28 + Math.sin(cAngle) * cLen * 0.3,
    );
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                         NORMAL FORM                                      ║
// ║  Ornate Elven Forest Queen — living armor, nature magic, regal detail   ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// ─── MAGIC CIRCLE ───────────────────────────────────────────────────────────

function drawMagicCircle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, atkBurst: number,
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
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, atkBurst: number,
) {
  const count = 12 + Math.floor(atkBurst * 4);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + time * (0.15 + atkBurst * 0.3);
    const rootLen = s * (0.28 + Math.sin(time * (0.4 + atkBurst * 2) + i * 0.9) * 0.07);
    const rootX = x + Math.cos(angle) * rootLen;
    const rootY = y + s * 0.32 + Math.sin(angle) * rootLen * 0.3;
    const rootAlpha = 0.18 + naturePulse * 0.1 + atkBurst * 0.08;

    ctx.strokeStyle = `rgba(${P.rootVine},${rootAlpha})`;
    ctx.lineWidth = (2 + Math.sin(i * 1.3) * 0.8 + atkBurst) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.26);
    ctx.bezierCurveTo(
      x + Math.cos(angle) * rootLen * 0.35, y + s * 0.3 + Math.sin(angle) * rootLen * 0.1,
      x + Math.cos(angle) * rootLen * 0.7, y + s * 0.28 + Math.sin(angle) * rootLen * 0.25,
      rootX, rootY,
    );
    ctx.stroke();

    if (i % 2 === 0) {
      ctx.fillStyle = `rgba(${P.glow},${rootAlpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(rootX, rootY, s * (0.012 + atkBurst * 0.006), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── VINE TENTACLES ─────────────────────────────────────────────────────────

function drawVineTentacles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number,
  layer: "back" | "front", atkBurst: number,
) {
  const tentacles = layer === "back"
    ? [
      { angle: 0.7, len: 0.55, phase: 0 },
      { angle: 1.3, len: 0.45, phase: 1.1 },
      { angle: 2.0, len: 0.50, phase: 2.3 },
      { angle: 2.7, len: 0.40, phase: 3.6 },
      { angle: 3.3, len: 0.42, phase: 4.8 },
    ]
    : [
      { angle: -0.4, len: 0.52, phase: 0.5 },
      { angle: -1.1, len: 0.46, phase: 1.7 },
      { angle: -1.8, len: 0.44, phase: 2.9 },
      { angle: -2.5, len: 0.38, phase: 4.2 },
    ];

  const speed = 1.3 + atkBurst * 3;
  const swayMult = 1 + atkBurst * 1.5;

  for (const vine of tentacles) {
    const baseAngle = vine.angle + Math.sin(time * (0.6 + atkBurst * 1.5) + vine.phase) * (0.2 + atkBurst * 0.15);
    const vineLen = s * vine.len * (1 + atkBurst * 0.25);
    const sway1 = Math.sin(time * speed + vine.phase) * s * 0.07 * swayMult;
    const sway2 = Math.sin(time * (speed + 0.5) + vine.phase * 1.3) * s * 0.05 * swayMult;

    const startX = x + Math.cos(baseAngle) * s * 0.14;
    const startY = y + Math.sin(baseAngle) * s * 0.08;
    const cp1X = startX + Math.cos(baseAngle) * vineLen * 0.3 + sway1 * 0.4;
    const cp1Y = startY + Math.sin(baseAngle) * vineLen * 0.2 + s * 0.03;
    const cp2X = startX + Math.cos(baseAngle) * vineLen * 0.65 + sway1;
    const cp2Y = startY + Math.sin(baseAngle) * vineLen * 0.35 + s * 0.05;
    const endX = startX + Math.cos(baseAngle) * vineLen + sway2;
    const endY = startY + Math.sin(baseAngle) * vineLen * 0.4 + s * 0.08;

    const vineGrad = ctx.createLinearGradient(startX, startY, endX, endY);
    vineGrad.addColorStop(0, `rgba(${P.vineDark},${0.75 + naturePulse * 0.12})`);
    vineGrad.addColorStop(0.35, `rgba(${P.glowDark},${0.6 + atkBurst * 0.15})`);
    vineGrad.addColorStop(0.7, `rgba(${P.vine},${0.4 + atkBurst * 0.1})`);
    vineGrad.addColorStop(1, `rgba(${P.glow},${0.12 + atkBurst * 0.1})`);

    ctx.strokeStyle = vineGrad;
    ctx.lineWidth = (3.5 - vine.len * 2 + atkBurst * 0.8) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
    ctx.stroke();

    for (let t = 0; t < 5; t++) {
      const tF = 0.15 + t * 0.17;
      const tx = startX + (endX - startX) * tF + Math.sin(time * (1.5 + atkBurst * 3) + t + vine.phase) * s * 0.012;
      const ty = startY + (endY - startY) * tF + s * 0.025 * tF;
      const thornSide = t % 2 === 0 ? 1 : -1;
      const thornLen = s * (0.015 + atkBurst * 0.005);

      ctx.strokeStyle = `rgba(20,100,60,${0.35 + atkBurst * 0.15})`;
      ctx.lineWidth = (0.8 + atkBurst * 0.3) * zoom;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + thornSide * thornLen * 0.7, ty - thornLen);
      ctx.stroke();
    }

    for (let l = 0; l < 4; l++) {
      const lF = 0.2 + l * 0.2;
      const lx = startX + (endX - startX) * lF + Math.sin(time * (2 + atkBurst * 3) + l + vine.phase) * s * 0.02;
      const ly = startY + (endY - startY) * lF + s * 0.025 * lF;
      const leafSize = s * (0.02 + l * 0.003 + atkBurst * 0.004);
      const lA = 0.5 + naturePulse * 0.25 + atkBurst * 0.15;

      ctx.fillStyle = `rgba(${P.leafDark},${lA})`;
      ctx.beginPath();
      ctx.moveTo(lx, ly + leafSize * 0.5);
      ctx.bezierCurveTo(lx - leafSize, ly - leafSize * 0.2, lx - leafSize * 0.3, ly - leafSize, lx, ly - leafSize * 0.4);
      ctx.bezierCurveTo(lx + leafSize * 0.3, ly - leafSize, lx + leafSize, ly - leafSize * 0.2, lx, ly + leafSize * 0.5);
      ctx.fill();

      ctx.strokeStyle = `rgba(22,163,74,${lA * 0.35})`;
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, ly - leafSize * 0.3);
      ctx.lineTo(lx, ly + leafSize * 0.4);
      ctx.stroke();
    }

    const curlAngle = baseAngle + Math.sin(time * (2 + atkBurst * 2) + vine.phase) * 0.7;
    ctx.strokeStyle = `rgba(${P.glow},${0.3 + naturePulse * 0.12 + atkBurst * 0.1})`;
    ctx.lineWidth = (0.8 + atkBurst * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    for (let sp = 0; sp < 8; sp++) {
      const t = sp / 8;
      const spiralR = s * 0.03 * (1 - t);
      const spiralA = curlAngle + t * 3;
      ctx.lineTo(endX + Math.cos(spiralA) * spiralR, endY + Math.sin(spiralA) * spiralR * 0.5);
    }
    ctx.stroke();
  }
}

// ─── LEAF CAPE ──────────────────────────────────────────────────────────────

function drawLeafCape(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, atkBurst: number,
) {
  const vineWave = Math.sin(time * (1.2 + atkBurst * 2)) * (0.15 + atkBurst * 0.1);
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
    x - s * 0.38, y + s * 0.08 + vineWave * s * 0.04,
    x - s * 0.34, y + s * 0.3,
    x - capeW, y + s * 0.44,
  );
  ctx.lineTo(x + capeW, y + s * 0.44);
  ctx.bezierCurveTo(
    x + s * 0.34, y + s * 0.3,
    x + s * 0.38, y + s * 0.08 - vineWave * s * 0.04,
    x + s * 0.2, y - s * 0.16,
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
    { cx: -0.08, cy: 0.0, angle: 0.3, sz: 0.04 },
    { cx: 0.06, cy: 0.05, angle: -0.4, sz: 0.035 },
    { cx: -0.12, cy: 0.12, angle: 0.5, sz: 0.04 },
    { cx: 0.1, cy: 0.15, angle: -0.2, sz: 0.038 },
    { cx: -0.04, cy: 0.22, angle: 0.1, sz: 0.032 },
    { cx: 0.02, cy: -0.04, angle: -0.6, sz: 0.03 },
    { cx: -0.15, cy: 0.06, angle: 0.7, sz: 0.028 },
    { cx: 0.13, cy: 0.25, angle: -0.3, sz: 0.035 },
    { cx: 0.0, cy: 0.1, angle: 0.0, sz: 0.04 },
    { cx: -0.06, cy: 0.28, angle: 0.4, sz: 0.03 },
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
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 3 * zoom;
  ctx.strokeStyle = `rgba(${P.glow},${0.18 + naturePulse * 0.1 + atkBurst * 0.08})`;
  ctx.lineWidth = 0.9 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.2, y - s * 0.16);
    ctx.bezierCurveTo(
      x + side * s * 0.36, y + s * 0.08,
      x + side * s * 0.32, y + s * 0.3,
      x + side * capeW, y + s * 0.44,
    );
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

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
  ctx.quadraticCurveTo(tolX - s * 0.025, tolY - s * 0.065, tolX - s * 0.02, tolY - s * 0.07);
  ctx.moveTo(tolX, tolY - s * 0.04);
  ctx.quadraticCurveTo(tolX + s * 0.025, tolY - s * 0.065, tolX + s * 0.02, tolY - s * 0.07);
  ctx.moveTo(tolX, tolY - s * 0.02);
  ctx.quadraticCurveTo(tolX - s * 0.02, tolY - s * 0.04, tolX - s * 0.015, tolY - s * 0.05);
  ctx.moveTo(tolX, tolY - s * 0.02);
  ctx.quadraticCurveTo(tolX + s * 0.02, tolY - s * 0.04, tolX + s * 0.015, tolY - s * 0.05);
  ctx.moveTo(tolX, tolY + s * 0.04);
  ctx.quadraticCurveTo(tolX - s * 0.02, tolY + s * 0.06, tolX - s * 0.025, tolY + s * 0.065);
  ctx.moveTo(tolX, tolY + s * 0.04);
  ctx.quadraticCurveTo(tolX + s * 0.02, tolY + s * 0.06, tolX + s * 0.025, tolY + s * 0.065);
  ctx.stroke();

  // Scalloped leaf edge at bottom — 18 overlapping leaves
  for (let i = 0; i < 18; i++) {
    const t = i / 18;
    const hx = x - capeW + t * capeW * 2;
    const hy = y + s * 0.42 + Math.sin(time * (1.8 + atkBurst * 3) + i * 0.7) * s * (0.012 + atkBurst * 0.008);
    const hSize = s * (0.025 + atkBurst * 0.005);

    ctx.fillStyle = `rgba(20,80,40,${0.45 + naturePulse * 0.12 + atkBurst * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.bezierCurveTo(hx - hSize, hy + hSize * 0.8, hx, hy + hSize * 1.6, hx + hSize, hy + hSize * 0.8);
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
    const clG = ctx.createRadialGradient(clX - clR * 0.2, clY - clR * 0.2, 0, clX, clY, clR);
    clG.addColorStop(0, `rgb(${P.glowWhite})`);
    clG.addColorStop(0.3, `rgb(${P.glowBright})`);
    clG.addColorStop(0.6, P.shadowHex);
    clG.addColorStop(1, "#065f46");
    ctx.fillStyle = clG;
    ctx.beginPath();
    ctx.arc(clX, clY, clR, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 6 * zoom;
    ctx.fillStyle = `rgba(${P.glowBright},${0.25 + naturePulse * 0.12})`;
    ctx.beginPath();
    ctx.arc(clX, clY, clR * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = `rgba(255,255,255,${0.5 + naturePulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(clX - clR * 0.2, clY - clR * 0.25, clR * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── SKIRT ──────────────────────────────────────────────────────────────────

function drawSkirt(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, atkBurst: number,
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
  const rightSway = Math.sin(time * swaySpeed + 1) * s * (0.02 + atkBurst * 0.02);
  ctx.bezierCurveTo(x - s * 0.22 + leftSway, skirtTop + s * 0.08, x - s * 0.24 + leftSway, skirtBot - s * 0.04, x - s * 0.2 + leftSway, skirtBot);
  ctx.lineTo(x + s * 0.2 + rightSway, skirtBot);
  ctx.bezierCurveTo(x + s * 0.24 + rightSway, skirtBot - s * 0.04, x + s * 0.22 + rightSway, skirtTop + s * 0.08, x + s * 0.13, skirtTop);
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
      ctx.quadraticCurveTo(lx - leafSz * 0.6, ry + leafSz * 0.2, lx, ry + leafSz * 0.6);
      ctx.quadraticCurveTo(lx + leafSz * 0.6, ry + leafSz * 0.2, lx, ry - leafSz * 0.3);
      ctx.fill();
    }

    // Glowing seam line between rows
    ctx.strokeStyle = `rgba(${P.glow},${0.08 + naturePulse * 0.04})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - rowW, ry + s * 0.008);
    ctx.bezierCurveTo(x - rowW * 0.3, ry + s * 0.012, x + rowW * 0.3, ry + s * 0.006, x + rowW, ry + s * 0.008);
    ctx.stroke();
  }

  // Vine belt at waistline with gem buckle
  const beltY = skirtTop + s * 0.01;
  ctx.strokeStyle = `rgba(${P.vineDark},${0.5 + naturePulse * 0.15})`;
  ctx.lineWidth = 2.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.13, beltY);
  ctx.bezierCurveTo(x - s * 0.04, beltY - s * 0.006, x + s * 0.04, beltY + s * 0.004, x + s * 0.13, beltY);
  ctx.stroke();

  const buckleR = s * 0.012;
  const buckleG = ctx.createRadialGradient(x - buckleR * 0.2, beltY - buckleR * 0.2, 0, x, beltY, buckleR);
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
  x: number, y: number, s: number,
  breathe: number, time: number, zoom: number, naturePulse: number, atkBurst: number,
) {
  const bodyW = s * (0.17 + breathe * 0.002 + atkBurst * 0.01) * 1.15;
  const bodyH = s * (0.26 + breathe * 0.003 + atkBurst * 0.015) * 1.1;

  const bodyGrad = ctx.createRadialGradient(x, y - s * 0.03, s * 0.03, x, y + s * 0.01, bodyH);
  bodyGrad.addColorStop(0, "#2d6a48");
  bodyGrad.addColorStop(0.2, "#1e5235");
  bodyGrad.addColorStop(0.5, "#164028");
  bodyGrad.addColorStop(0.8, "#0d2e1c");
  bodyGrad.addColorStop(1, "#081a10");

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bark grain texture underneath
  ctx.strokeStyle = "rgba(10,30,18,0.2)";
  ctx.lineWidth = 0.4 * zoom;
  for (let i = 0; i < 6; i++) {
    const gx = x - bodyW * 0.5 + i * bodyW * 0.2;
    ctx.beginPath();
    ctx.moveTo(gx, y - bodyH * 0.6);
    ctx.bezierCurveTo(gx + s * 0.003, y - bodyH * 0.2, gx - s * 0.003, y + bodyH * 0.2, gx + s * 0.002, y + bodyH * 0.5);
    ctx.stroke();
  }

  // Bark armor plates (3-4 organic shapes with 3D radial gradient)
  const armorPlates = [
    { cx: 0, cy: -0.06, rx: 0.1, ry: 0.08, seed: 300 },
    { cx: -0.06, cy: 0.04, rx: 0.07, ry: 0.06, seed: 302 },
    { cx: 0.06, cy: 0.04, rx: 0.07, ry: 0.06, seed: 304 },
    { cx: 0, cy: 0.12, rx: 0.08, ry: 0.05, seed: 306 },
  ];
  for (let i = 0; i < armorPlates.length; i++) {
    const ap = armorPlates[i];
    const px = x + ap.cx * s;
    const py = y + ap.cy * s;
    const prx = ap.rx * s;
    const pry = ap.ry * s;
    const plateGrad = ctx.createRadialGradient(
      px - prx * 0.3, py - pry * 0.35, prx * 0.05,
      px, py, prx,
    );
    plateGrad.addColorStop(0, "#3a6848");
    plateGrad.addColorStop(0.3, "#2a5238");
    plateGrad.addColorStop(0.6, "#1e4028");
    plateGrad.addColorStop(1, "#102818");
    ctx.fillStyle = plateGrad;
    drawOrganicBlob(ctx, px, py, prx, pry, 10, 0.12, ap.seed);
    ctx.fill();

    ctx.fillStyle = "rgba(60,100,70,0.15)";
    drawOrganicBlob(ctx, px - prx * 0.1, py - pry * 0.2, prx * 0.55, pry * 0.35, 8, 0.1, ap.seed + 1);
    ctx.fill();
  }

  // Glowing nature veins between armor plates
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 3 * zoom;
  const veinAlpha = 0.15 + naturePulse * 0.1 + atkBurst * 0.12;
  ctx.strokeStyle = `rgba(${P.glow},${veinAlpha})`;
  ctx.lineWidth = 0.8 * zoom;
  const seamLines = [
    { sx: -0.06, sy: -0.02, ex: 0.06, ey: -0.02 },
    { sx: -0.03, sy: 0.06, ex: 0.03, ey: 0.06 },
    { sx: -0.08, sy: 0.0, ex: -0.02, ey: 0.08 },
    { sx: 0.08, sy: 0.0, ex: 0.02, ey: 0.08 },
  ];
  for (const seam of seamLines) {
    ctx.beginPath();
    ctx.moveTo(x + seam.sx * s, y + seam.sy * s);
    ctx.quadraticCurveTo(
      x + (seam.sx + seam.ex) * 0.5 * s, y + (seam.sy + seam.ey) * 0.5 * s + s * 0.008,
      x + seam.ex * s, y + seam.ey * s,
    );
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Inner body glow showing through armor seams
  const glowR = s * (0.12 + atkBurst * 0.05);
  const glow = ctx.createRadialGradient(x, y - s * 0.04, 0, x, y, glowR);
  glow.addColorStop(0, `rgba(${P.glowBright},${0.12 + atkBurst * 0.2})`);
  glow.addColorStop(0.5, `rgba(${P.glow},${0.06 + atkBurst * 0.1})`);
  glow.addColorStop(1, `rgba(${P.glowDark},0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.04, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Rim light on upper-left edge
  ctx.strokeStyle = `rgba(110,231,183,${0.18 + naturePulse * 0.12 + atkBurst * 0.15})`;
  ctx.lineWidth = (1.2 + atkBurst * 0.5) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, -0.9, Math.PI * 0.35);
  ctx.stroke();
}

// ─── BRANCH CORSET ──────────────────────────────────────────────────────────

function drawBranchCorset(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, mossGlow: number, atkBurst: number,
) {
  // 5 branches per side wrapping the torso
  for (const side of [-1, 1]) {
    for (let b = 0; b < 5; b++) {
      const bY = y - s * 0.18 + b * s * 0.065;
      const curve = Math.sin(time * 1.2 + b * 1.5 + side) * s * 0.008;
      const bW = s * (0.15 - b * 0.008);

      ctx.strokeStyle = `rgba(74,48,24,${0.55 + b * 0.06})`;
      ctx.lineWidth = (3.0 - b * 0.2 + atkBurst * 0.5) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x + side * s * 0.02, bY);
      ctx.bezierCurveTo(
        x + side * bW * 0.6 + curve, bY - s * 0.015,
        x + side * bW + curve, bY + s * 0.01,
        x + side * bW * 0.7, bY + s * 0.03,
      );
      ctx.stroke();

      // Bark texture bumps along each branch
      for (let k = 0; k < 4; k++) {
        const bt = 0.2 + k * 0.2;
        const bx = x + side * (s * 0.02 + (bW * 0.7 - s * 0.02) * bt) + curve * bt;
        const by = bY + s * 0.015 * bt;
        ctx.fillStyle = `rgba(60,40,20,${0.3 + b * 0.04})`;
        ctx.beginPath();
        ctx.arc(bx, by, s * 0.004, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Vine trim along top and bottom of corset
  ctx.strokeStyle = `rgba(${P.vine},${0.25 + naturePulse * 0.1})`;
  ctx.lineWidth = 0.7 * zoom;
  for (const yOff of [-0.18, 0.14]) {
    const ty = y + yOff * s;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.14, ty);
    for (let i = 1; i <= 8; i++) {
      const t = i / 8;
      const wx = x - s * 0.14 + t * s * 0.28;
      const wy = ty + Math.sin(t * Math.PI * 3 + time * 1.5) * s * 0.004;
      ctx.lineTo(wx, wy);
    }
    ctx.stroke();
  }

  // 4 embedded gem stones with glow halos
  const gemPositions = [
    { dx: -0.06, dy: -0.1 }, { dx: 0.06, dy: -0.05 },
    { dx: -0.04, dy: 0.02 }, { dx: 0.04, dy: 0.08 },
  ];
  for (const gp of gemPositions) {
    const gx = x + gp.dx * s;
    const gy = y + gp.dy * s;
    const gr = s * 0.008;
    const gemG = ctx.createRadialGradient(gx - gr * 0.2, gy - gr * 0.2, 0, gx, gy, gr);
    gemG.addColorStop(0, `rgb(${P.glowWhite})`);
    gemG.addColorStop(0.5, P.shadowHex);
    gemG.addColorStop(1, `rgb(${P.glowDark})`);
    ctx.fillStyle = gemG;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 4 * zoom;
    ctx.fillStyle = `rgba(${P.glowBright},${0.2 + naturePulse * 0.1})`;
    ctx.beginPath();
    ctx.arc(gx, gy, gr * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Larger, more elaborate Tree of Life rune
  const runeGlow = 0.45 + naturePulse * 0.6 + atkBurst * 0.3;
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = (6 + atkBurst * 6) * zoom;
  ctx.strokeStyle = `rgba(${P.glow},${runeGlow})`;
  ctx.lineWidth = (2.0 + atkBurst * 0.5) * zoom;

  // Main trunk
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.01);
  ctx.lineTo(x, y - s * 0.14);
  ctx.stroke();

  // Upper branches — 3 tiers
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.11);
  ctx.quadraticCurveTo(x - s * 0.05, y - s * 0.155, x - s * 0.04, y - s * 0.17);
  ctx.moveTo(x, y - s * 0.11);
  ctx.quadraticCurveTo(x + s * 0.05, y - s * 0.155, x + s * 0.04, y - s * 0.17);
  ctx.moveTo(x, y - s * 0.08);
  ctx.quadraticCurveTo(x - s * 0.04, y - s * 0.115, x - s * 0.035, y - s * 0.13);
  ctx.moveTo(x, y - s * 0.08);
  ctx.quadraticCurveTo(x + s * 0.04, y - s * 0.115, x + s * 0.035, y - s * 0.13);
  ctx.moveTo(x, y - s * 0.055);
  ctx.quadraticCurveTo(x - s * 0.025, y - s * 0.08, x - s * 0.022, y - s * 0.09);
  ctx.moveTo(x, y - s * 0.055);
  ctx.quadraticCurveTo(x + s * 0.025, y - s * 0.08, x + s * 0.022, y - s * 0.09);
  ctx.stroke();

  // Roots at base
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.01);
  ctx.quadraticCurveTo(x - s * 0.035, y + s * 0.025, x - s * 0.045, y + s * 0.035);
  ctx.moveTo(x, y - s * 0.01);
  ctx.quadraticCurveTo(x + s * 0.035, y + s * 0.025, x + s * 0.045, y + s * 0.035);
  ctx.moveTo(x, y + s * 0.005);
  ctx.quadraticCurveTo(x - s * 0.02, y + s * 0.03, x - s * 0.03, y + s * 0.04);
  ctx.moveTo(x, y + s * 0.005);
  ctx.quadraticCurveTo(x + s * 0.02, y + s * 0.03, x + s * 0.03, y + s * 0.04);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 8+ moss patches drawn as organic blob shapes
  const mossPts = [
    { dx: -0.1, dy: -0.1, r: 0.014 }, { dx: 0.09, dy: -0.06, r: 0.012 },
    { dx: -0.07, dy: 0.0, r: 0.013 }, { dx: 0.06, dy: -0.01, r: 0.011 },
    { dx: -0.11, dy: 0.05, r: 0.012 }, { dx: 0.1, dy: 0.06, r: 0.011 },
    { dx: -0.04, dy: 0.1, r: 0.01 }, { dx: 0.03, dy: 0.09, r: 0.013 },
    { dx: 0.0, dy: -0.15, r: 0.01 },
  ];
  for (let i = 0; i < mossPts.length; i++) {
    const mp = mossPts[i];
    const mx = x + mp.dx * s;
    const my = y + mp.dy * s;
    const mr = mp.r * s;
    ctx.fillStyle = `rgba(${P.leafDark},${0.18 + mossGlow * 0.12})`;
    drawOrganicBlob(ctx, mx, my, mr, mr * 0.6, 7, 0.2, i * 3.3 + 310);
    ctx.fill();
  }
}

// ─── SHOULDERS ──────────────────────────────────────────────────────────────

function drawShoulders(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, mossGlow: number, atkBurst: number,
) {
  for (const side of [-1, 1]) {
    const sx = x + side * s * 0.2;
    const sy = y - s * 0.16;
    const paulR = s * 0.07;

    // Large bark pauldron — dark base
    const paulGrad = ctx.createRadialGradient(
      sx - paulR * 0.3, sy - paulR * 0.35, paulR * 0.05,
      sx, sy, paulR,
    );
    paulGrad.addColorStop(0, "#5a4828");
    paulGrad.addColorStop(0.3, "#4a3820");
    paulGrad.addColorStop(0.6, "#3a2c18");
    paulGrad.addColorStop(1, "#2a2010");
    ctx.fillStyle = paulGrad;
    drawOrganicBlob(ctx, sx, sy, paulR, paulR * 0.55, 10, 0.15, side * 13 + 320);
    ctx.fill();

    // Lighter top highlight blob
    ctx.fillStyle = "rgba(80,65,40,0.2)";
    drawOrganicBlob(ctx, sx - paulR * 0.1, sy - paulR * 0.2, paulR * 0.55, paulR * 0.28, 8, 0.1, side * 7 + 325);
    ctx.fill();

    // Vine wrapping around pauldron edge
    ctx.strokeStyle = `rgba(${P.vine},${0.3 + naturePulse * 0.1})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(sx, sy, paulR * 0.9, paulR * 0.45, side * 0.3, 0, Math.PI * 1.4);
    ctx.stroke();

    // Glowing rune sigils on each pauldron
    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 4 * zoom;
    ctx.strokeStyle = `rgba(${P.glow},${0.3 + naturePulse * 0.2 + Math.sin(time * 2.5 + side * 2) * 0.1})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy - paulR * 0.3);
    ctx.lineTo(sx + side * paulR * 0.15, sy);
    ctx.lineTo(sx, sy + paulR * 0.25);
    ctx.lineTo(sx - side * paulR * 0.15, sy);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx - paulR * 0.2, sy);
    ctx.lineTo(sx + paulR * 0.2, sy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 2-3 flowers per shoulder in a cluster
    for (let f = 0; f < 3; f++) {
      const flAngle = (f / 3) * Math.PI * 2 + side * 0.5;
      const flDist = paulR * 0.35;
      const bloomX = sx + Math.cos(flAngle) * flDist;
      const bloomY = sy - paulR * 0.15 + Math.sin(flAngle) * flDist * 0.4;
      const petalAlpha = 0.45 + naturePulse * 0.2 + atkBurst * 0.12;

      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2 + time * 0.5 + f * 0.8;
        const pr = s * 0.009;
        ctx.fillStyle = `rgba(${P.flower},${petalAlpha * 0.45})`;
        ctx.beginPath();
        ctx.ellipse(bloomX + Math.cos(pa) * pr, bloomY + Math.sin(pa) * pr, s * 0.006, s * 0.003, pa, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(${P.pollen},${petalAlpha})`;
      ctx.beginPath();
      ctx.arc(bloomX, bloomY, s * 0.003, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hanging leaf fringe below pauldron (7 small leaves)
    for (let l = 0; l < 7; l++) {
      const la = ((l + 0.5) / 7) * Math.PI * 0.8 + Math.PI * 0.1;
      const lBaseX = sx + Math.cos(la + Math.PI * 0.5 * side) * paulR * 0.7;
      const lBaseY = sy + paulR * 0.35;
      const leafSway = Math.sin(time * 2.5 + l * 0.9 + side * 1.5) * s * 0.004;
      const leafLen = s * (0.018 + Math.sin(l * 1.3) * 0.004);
      ctx.fillStyle = `rgba(${P.leaf},${0.4 + naturePulse * 0.15})`;
      ctx.save();
      ctx.translate(lBaseX + leafSway, lBaseY);
      ctx.rotate(Math.PI * 0.5 + leafSway * 2);
      ctx.beginPath();
      ctx.ellipse(0, leafLen * 0.5, s * 0.004, leafLen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Pollen glow around shoulder cluster
    ctx.fillStyle = `rgba(${P.pollen},${(0.45 + naturePulse * 0.2) * 0.12})`;
    ctx.beginPath();
    ctx.arc(sx, sy - paulR * 0.15, paulR * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── ARMS ───────────────────────────────────────────────────────────────────

function drawArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, isAttacking: boolean, atkBurst: number,
) {
  const armSwing = isAttacking ? Math.sin(atkBurst * Math.PI * 3) * 0.5 : 0;

  for (const side of [-1, 1]) {
    const shX = x + side * s * 0.18;
    const shY = y - s * 0.1;
    const elX = shX + side * s * 0.11;
    const elY = shY + s * 0.11 + armSwing * side * s * 0.04;

    const armGrad = ctx.createLinearGradient(shX, shY, elX, elY);
    armGrad.addColorStop(0, "#1e5235");
    armGrad.addColorStop(0.5, "#1a4530");
    armGrad.addColorStop(1, "#164028");
    ctx.strokeStyle = armGrad;
    ctx.lineWidth = (4.5 + atkBurst * 0.5) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.quadraticCurveTo(shX + side * s * 0.03, shY + s * 0.06, elX, elY);
    ctx.stroke();

    // Vine bracers on forearms (4 wraps per arm)
    ctx.strokeStyle = `rgba(${P.vine},${0.35 + atkBurst * 0.12})`;
    ctx.lineWidth = 0.9 * zoom;
    for (let v = 0; v < 4; v++) {
      const t = (v + 0.3) / 5;
      const vx = shX + (elX - shX) * t;
      const vy = shY + (elY - shY) * t;
      ctx.beginPath();
      ctx.arc(vx + side * s * 0.012, vy, s * 0.014, 0, Math.PI);
      ctx.stroke();
    }

    // Bark gauntlet pieces on outer forearm
    const gauntT = 0.65;
    const gx = shX + (elX - shX) * gauntT;
    const gy = shY + (elY - shY) * gauntT;
    const gauntGrad = ctx.createRadialGradient(
      gx - s * 0.008, gy - s * 0.008, s * 0.002,
      gx, gy, s * 0.025,
    );
    gauntGrad.addColorStop(0, "#5a4828");
    gauntGrad.addColorStop(0.5, "#3a2c18");
    gauntGrad.addColorStop(1, "#2a2010");
    ctx.fillStyle = gauntGrad;
    drawOrganicBlob(ctx, gx + side * s * 0.01, gy, s * 0.022, s * 0.015, 8, 0.15, side * 11 + 340);
    ctx.fill();

    // Nature energy glow particles trailing along arm
    for (let p = 0; p < 3; p++) {
      const pt = (time * 1.5 + p * 0.33 + side * 0.5) % 1;
      const px = shX + (elX - shX) * pt;
      const py = shY + (elY - shY) * pt;
      const pAlpha = Math.sin(pt * Math.PI) * (0.25 + atkBurst * 0.15);
      ctx.fillStyle = `rgba(${P.glow},${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px + side * s * 0.008, py, s * 0.004, 0, Math.PI * 2);
      ctx.fill();
    }

    // Leaf ornaments at the wrist
    const wristX = elX + side * s * 0.005;
    const wristY = elY + s * 0.01;
    for (let l = 0; l < 2; l++) {
      const la = (l - 0.5) * 0.8 + side * 0.3;
      const leafSz = s * 0.012;
      ctx.fillStyle = `rgba(${P.leaf},${0.4 + atkBurst * 0.12})`;
      ctx.save();
      ctx.translate(wristX, wristY);
      ctx.rotate(la + Math.sin(time * 2 + l) * 0.2);
      ctx.beginPath();
      ctx.ellipse(0, leafSz * 0.5, s * 0.004, leafSz, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (side === 1) {
      const handX = elX;
      const handY = elY + s * 0.05;
      ctx.fillStyle = "#1e5235";
      ctx.beginPath();
      ctx.ellipse(handX, handY, s * 0.022, s * 0.028, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── CROOKED STAFF ──────────────────────────────────────────────────────────

function drawCrookedStaff(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, magicPulse: number, atkBurst: number,
) {
  const staffX = x - s * 0.28;
  const staffTopY = y - s * 0.56;
  const staffBotY = y + s * 0.3;

  // Thicker, more gnarled shaft
  ctx.strokeStyle = "#4a3018";
  ctx.lineWidth = (4.2 + atkBurst * 0.5) * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(staffX + s * 0.015, staffBotY);
  ctx.bezierCurveTo(
    staffX - s * 0.025, staffBotY - s * 0.15,
    staffX + s * 0.03, y - s * 0.05,
    staffX - s * 0.018, y - s * 0.2,
  );
  ctx.bezierCurveTo(
    staffX - s * 0.035, y - s * 0.32,
    staffX + s * 0.045, y - s * 0.42,
    staffX - s * 0.02, staffTopY,
  );
  ctx.stroke();

  ctx.strokeStyle = "#5a3e22";
  ctx.lineWidth = 2.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(staffX + s * 0.015, staffBotY);
  ctx.bezierCurveTo(
    staffX - s * 0.018, staffBotY - s * 0.15,
    staffX + s * 0.024, y - s * 0.05,
    staffX - s * 0.012, y - s * 0.2,
  );
  ctx.stroke();

  const knots = [0.25, 0.5, 0.72];
  for (const kt of knots) {
    const ky = staffBotY + (staffTopY - staffBotY) * kt;
    const kx = staffX + Math.sin(kt * 5) * s * 0.012;
    ctx.fillStyle = "#3a2510";
    ctx.beginPath();
    ctx.ellipse(kx, ky, s * 0.012, s * 0.008, Math.sin(kt) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5 vine wraps (thicker than before)
  ctx.strokeStyle = `rgba(${P.glowDark},${0.45 + atkBurst * 0.15})`;
  ctx.lineWidth = (1.4 + atkBurst * 0.3) * zoom;
  for (let v = 0; v < 5; v++) {
    const t = 0.1 + v * 0.18;
    const vy = staffBotY + (staffTopY - staffBotY) * t;
    const vx = staffX + Math.sin(t * 5) * s * 0.01;
    ctx.beginPath();
    ctx.arc(vx, vy, s * 0.02, -0.6, Math.PI + 0.6);
    ctx.stroke();

    // Small leaf cluster where vines attach
    if (v % 2 === 0) {
      const lx = vx + s * 0.02;
      const ly = vy;
      ctx.fillStyle = `rgba(${P.leaf},${0.35 + naturePulse * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(lx, ly, s * 0.008, s * 0.004, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fork prongs
  const forkX = staffX - s * 0.02;
  const forkY = staffTopY + s * 0.01;

  const prongs = [
    { dx: -0.04, dy: -0.1, curve: -0.03 },
    { dx: 0.0, dy: -0.12, curve: 0.01 },
    { dx: 0.045, dy: -0.09, curve: 0.04 },
  ];
  ctx.strokeStyle = "#4a3018";
  ctx.lineWidth = 2.2 * zoom;
  for (const p of prongs) {
    ctx.beginPath();
    ctx.moveTo(forkX, forkY);
    ctx.quadraticCurveTo(forkX + p.curve * s, forkY + p.dy * s * 0.5, forkX + p.dx * s, forkY + p.dy * s);
    ctx.stroke();
  }

  // Hanging crystalline drops from fork prongs
  for (let d = 0; d < 3; d++) {
    const prong = prongs[d];
    const dropX = forkX + prong.dx * s * 0.7;
    const dropY = forkY + prong.dy * s * 0.6 + s * 0.01;
    const dropSway = Math.sin(time * 2.5 + d * 1.2) * s * 0.003;
    const dropR = s * 0.005;

    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 3 * zoom;
    ctx.fillStyle = `rgba(${P.glowBright},${0.5 + magicPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(dropX + dropSway, dropY, dropR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `rgba(${P.vine},${0.25 + naturePulse * 0.1})`;
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(forkX + prong.dx * s * 0.5, forkY + prong.dy * s * 0.4);
    ctx.lineTo(dropX + dropSway, dropY - dropR);
    ctx.stroke();
  }

  // Crystal — 30% larger
  const crystalX = forkX;
  const crystalY = forkY - s * 0.07;
  const crystalR = s * (0.048 + atkBurst * 0.012) * 1.3;

  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = (15 + atkBurst * 12) * zoom;
  const cGrad = ctx.createRadialGradient(crystalX, crystalY, 0, crystalX, crystalY, crystalR);
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
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // 8 facet lines inside crystal
  ctx.strokeStyle = `rgba(${P.glowBright},0.3)`;
  ctx.lineWidth = 0.5 * zoom;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(crystalX, crystalY);
    ctx.lineTo(crystalX + Math.cos(a) * crystalR * 0.85, crystalY + Math.sin(a) * crystalR * 0.85);
    ctx.stroke();
  }

  // Stronger crystal glow halo
  const glowAlpha = 0.25 + Math.sin(time * 3) * 0.12 + atkBurst * 0.25;
  ctx.fillStyle = `rgba(${P.glowBright},${glowAlpha})`;
  ctx.beginPath();
  ctx.arc(crystalX, crystalY, crystalR * (2.5 + atkBurst * 0.6), 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255,255,255,${0.5 + magicPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(crystalX - crystalR * 0.2, crystalY - crystalR * 0.3, crystalR * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

// ─── HEAD ───────────────────────────────────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, magicPulse: number,
) {
  const headY = y - s * 0.33;

  // Hood
  const hoodGrad = ctx.createRadialGradient(x, headY + s * 0.01, 0, x, headY, s * 0.16);
  hoodGrad.addColorStop(0, "#1a4030");
  hoodGrad.addColorStop(0.4, "#0d3320");
  hoodGrad.addColorStop(0.8, "#082618");
  hoodGrad.addColorStop(1, "#051a10");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, s * 0.13, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hood leaf trim — small leaf shapes along the hood edge
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const lx = x + Math.cos(a) * s * 0.125;
    const ly = headY + Math.sin(a) * s * 0.115;
    const leafSz = s * 0.008;
    ctx.fillStyle = `rgba(${P.leafDark},${0.3 + naturePulse * 0.1})`;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(a + Math.PI * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, leafSz, leafSz * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Face
  const faceGrad = ctx.createRadialGradient(x, headY + s * 0.008, 0, x, headY, s * 0.1);
  faceGrad.addColorStop(0, "#b08868");
  faceGrad.addColorStop(0.15, "#a08060");
  faceGrad.addColorStop(0.3, "#8b6f47");
  faceGrad.addColorStop(0.55, "#6b5535");
  faceGrad.addColorStop(0.8, "#4a3a20");
  faceGrad.addColorStop(1, "#3a2a15");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY + s * 0.008, s * 0.098, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const ly = headY - s * 0.015 + i * s * 0.02;
    const lw = s * (0.065 - Math.abs(i - 1) * 0.01);
    ctx.strokeStyle = "rgba(70,50,30,0.15)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - lw, ly);
    ctx.bezierCurveTo(x - lw * 0.3, ly + s * 0.003, x + lw * 0.3, ly - s * 0.002, x + lw, ly);
    ctx.stroke();
  }

  // Eyes — 20% larger with stronger glow
  for (const side of [-1, 1]) {
    const eyeX = x + side * s * 0.042;
    const eyeY = headY - s * 0.002;
    const eyeScale = 1.2;

    const egAlpha = 0.3 + naturePulse * 0.22 + magicPulse * 0.15;
    const eg = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.05);
    eg.addColorStop(0, `rgba(${P.glowBright},${egAlpha})`);
    eg.addColorStop(1, `rgba(${P.glow},0)`);
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${P.glow},${0.88 + naturePulse * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(eyeX - s * 0.028 * eyeScale, eyeY);
    ctx.quadraticCurveTo(eyeX, eyeY - s * 0.016 * eyeScale, eyeX + s * 0.028 * eyeScale, eyeY);
    ctx.quadraticCurveTo(eyeX, eyeY + s * 0.013 * eyeScale, eyeX - s * 0.028 * eyeScale, eyeY);
    ctx.fill();

    ctx.fillStyle = P.eyePupil;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.008, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,${0.65 + magicPulse * 0.25})`;
    ctx.beginPath();
    ctx.arc(eyeX + side * s * 0.006, eyeY - s * 0.005, s * 0.0035, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrow
    ctx.strokeStyle = "rgba(40,25,10,0.35)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX - side * s * 0.02, eyeY - s * 0.008);
    ctx.quadraticCurveTo(eyeX - side * s * 0.03, eyeY - s * 0.016, eyeX - side * s * 0.035, eyeY - s * 0.012);
    ctx.stroke();

    // Nature markings / tattoos under each eye
    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 2 * zoom;
    ctx.strokeStyle = `rgba(${P.glow},${0.3 + naturePulse * 0.15})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX - side * s * 0.01, eyeY + s * 0.01);
    ctx.quadraticCurveTo(eyeX + side * s * 0.005, eyeY + s * 0.022, eyeX + side * s * 0.02, eyeY + s * 0.018);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeX - side * s * 0.005, eyeY + s * 0.015);
    ctx.quadraticCurveTo(eyeX + side * s * 0.008, eyeY + s * 0.028, eyeX + side * s * 0.018, eyeY + s * 0.025);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Forehead gem / crystal
  const gemX = x;
  const gemY = headY - s * 0.035;
  const gemR = s * 0.008;
  const gemG = ctx.createRadialGradient(gemX - gemR * 0.2, gemY - gemR * 0.2, 0, gemX, gemY, gemR);
  gemG.addColorStop(0, `rgb(${P.glowWhite})`);
  gemG.addColorStop(0.4, `rgb(${P.glowBright})`);
  gemG.addColorStop(1, P.shadowHex);
  ctx.fillStyle = gemG;
  ctx.beginPath();
  ctx.arc(gemX, gemY, gemR, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 3 * zoom;
  ctx.fillStyle = `rgba(${P.glowBright},${0.2 + naturePulse * 0.12})`;
  ctx.beginPath();
  ctx.arc(gemX, gemY, gemR * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Cheek blush
  for (const side of [-1, 1]) {
    ctx.fillStyle = "rgba(180,100,80,0.08)";
    ctx.beginPath();
    ctx.ellipse(x + side * s * 0.035, headY + s * 0.018, s * 0.02, s * 0.012, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // More detailed lip line
  ctx.strokeStyle = "rgba(139,92,60,0.4)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.024, headY + s * 0.035);
  ctx.quadraticCurveTo(x, headY + s * 0.03, x + s * 0.024, headY + s * 0.035);
  ctx.stroke();
  ctx.strokeStyle = "rgba(160,110,75,0.25)";
  ctx.lineWidth = 0.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.018, headY + s * 0.038);
  ctx.quadraticCurveTo(x, headY + s * 0.042, x + s * 0.018, headY + s * 0.038);
  ctx.stroke();

  // Freckles using palette leaf color
  const freckles = [
    { dx: -0.025, dy: 0.015 }, { dx: -0.015, dy: 0.02 },
    { dx: 0.02, dy: 0.012 }, { dx: 0.028, dy: 0.018 },
    { dx: -0.032, dy: 0.022 }, { dx: 0.016, dy: 0.024 },
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
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, atkBurst: number,
) {
  const headY = y - s * 0.33;
  const hairSpeed = 1.5 + atkBurst * 3;
  const hairSway = 0.03 + atkBurst * 0.025;

  const strands = [
    { sx: -0.08, angle: 2.3, len: 0.3 },
    { sx: -0.1, angle: 2.5, len: 0.35 },
    { sx: -0.06, angle: 2.1, len: 0.28 },
    { sx: 0.08, angle: 0.8, len: 0.3 },
    { sx: 0.1, angle: 0.6, len: 0.35 },
    { sx: 0.06, angle: 0.9, len: 0.28 },
    { sx: -0.03, angle: 2.8, len: 0.22 },
    { sx: 0.03, angle: 0.3, len: 0.22 },
    { sx: -0.11, angle: 2.65, len: 0.32 },
    { sx: 0.11, angle: 0.45, len: 0.32 },
    { sx: -0.12, angle: 2.4, len: 0.26 },
    { sx: 0.12, angle: 0.7, len: 0.26 },
  ];

  for (let i = 0; i < strands.length; i++) {
    const st = strands[i];
    const startX = x + st.sx * s;
    const startY = headY + s * 0.04;
    const sway = Math.sin(time * hairSpeed + i * 1.1) * s * hairSway;
    const endX = startX + Math.cos(st.angle) * s * st.len + sway;
    const endY = startY + Math.sin(st.angle) * s * st.len * 0.6 + Math.abs(sway) * 0.3;

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
      startX + sway * 0.3, startY + s * st.len * 0.25,
      endX - sway * 0.2, endY - s * st.len * 0.15,
      endX, endY,
    );
    ctx.stroke();

    // Leaf decoration on every 2nd strand
    if (i % 2 === 0) {
      const lx = (startX + endX) / 2 + sway * 0.4;
      const ly = (startY + endY) / 2;
      ctx.fillStyle = `rgba(${P.leaf},${0.4 + naturePulse * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(lx, ly, s * 0.01, s * 0.005, st.angle + Math.sin(time * 2.5 + i) * 0.3, 0, Math.PI * 2);
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
    { dx: -0.07, dy: -0.3 }, { dx: 0.05, dy: -0.28 },
    { dx: -0.1, dy: -0.26 }, { dx: 0.09, dy: -0.32 },
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
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, leafRustle: number, atkBurst: number,
) {
  const headY = y - s * 0.33;
  const crownBase = headY - s * 0.1;

  // Crown band
  ctx.strokeStyle = "#5a3e20";
  ctx.lineWidth = (3.0 + atkBurst * 0.4) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, crownBase + s * 0.015, s * 0.12, s * 0.03, 0, Math.PI * 0.08, Math.PI * 0.92);
  ctx.stroke();

  for (const side of [-1, 1]) {
    const baseX = x + side * s * 0.06;
    const sway = Math.sin(time * (1.0 + atkBurst * 2) + side * 0.5) * s * (0.008 + atkBurst * 0.006);

    // Main antler — thicker
    const tip1X = baseX + side * s * 0.2 + sway;
    const tip1Y = crownBase - s * 0.26;
    ctx.strokeStyle = "#5a3e20";
    ctx.lineWidth = (3.5 + atkBurst * 0.3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(baseX, crownBase);
    ctx.bezierCurveTo(
      baseX + side * s * 0.04, crownBase - s * 0.07,
      baseX + side * s * 0.14 + sway * 0.5, crownBase - s * 0.17,
      tip1X, tip1Y,
    );
    ctx.stroke();

    // Secondary antler
    const tip2X = baseX + side * s * 0.1 + sway * 0.7;
    const tip2Y = crownBase - s * 0.2;
    ctx.lineWidth = (2.2 + atkBurst * 0.2) * zoom;
    ctx.beginPath();
    ctx.moveTo(baseX + side * s * 0.035, crownBase - s * 0.05);
    ctx.quadraticCurveTo(baseX + side * s * 0.08 + sway * 0.3, crownBase - s * 0.14, tip2X, tip2Y);
    ctx.stroke();

    // 7 sub-branches per side
    const subs = [
      { t: 0.2, ang: side * 0.5, len: 0.05 },
      { t: 0.35, ang: side * 0.65, len: 0.055 },
      { t: 0.5, ang: side * 0.4, len: 0.05 },
      { t: 0.65, ang: side * -0.3, len: 0.04 },
      { t: 0.45, ang: side * -0.45, len: 0.035 },
      { t: 0.8, ang: side * 0.55, len: 0.045 },
      { t: 0.9, ang: side * 0.3, len: 0.035 },
    ];
    for (const sb of subs) {
      const bx = baseX + (tip1X - baseX) * sb.t + sway * sb.t;
      const by = crownBase + (tip1Y - crownBase) * sb.t;
      const subAngle = -Math.PI / 2 + sb.ang + Math.sin(time * (1.3 + atkBurst * 2) + sb.t * 3) * 0.1;
      const subLen = s * sb.len;

      ctx.strokeStyle = "#4a3018";
      ctx.lineWidth = (1.3 + atkBurst * 0.2) * zoom;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(subAngle) * subLen, by + Math.sin(subAngle) * subLen);
      ctx.stroke();

      // 3-4 leaves per sub-branch cluster
      const ltx = bx + Math.cos(subAngle) * subLen;
      const lty = by + Math.sin(subAngle) * subLen;
      const leafCount = 3 + Math.floor(Math.abs(sb.ang) * 2);
      for (let l = 0; l < leafCount; l++) {
        const la = subAngle + (l - (leafCount - 1) / 2) * 0.35 + leafRustle + Math.sin(time * (3 + atkBurst * 3) + l + sb.t) * 0.15;
        const lSize = s * (0.018 + l * 0.003 + atkBurst * 0.003);
        const lAlpha = 0.55 + naturePulse * 0.2 + atkBurst * 0.12;

        ctx.fillStyle = `rgba(${P.leaf},${lAlpha})`;
        ctx.beginPath();
        const lox = ltx + Math.cos(la) * lSize * 0.2;
        const loy = lty + Math.sin(la) * lSize * 0.2;
        ctx.moveTo(lox, loy + lSize * 0.4);
        ctx.bezierCurveTo(lox - lSize * 0.7, loy - lSize * 0.1, lox - lSize * 0.2, loy - lSize * 0.7, lox, loy - lSize * 0.3);
        ctx.bezierCurveTo(lox + lSize * 0.2, loy - lSize * 0.7, lox + lSize * 0.7, loy - lSize * 0.1, lox, loy + lSize * 0.4);
        ctx.fill();
      }
    }

    // Glowing berries along antlers (5 per side)
    for (let b = 0; b < 5; b++) {
      const bt = 0.2 + b * 0.16;
      const bx2 = baseX + (tip1X - baseX) * bt + sway * bt;
      const by2 = crownBase + (tip1Y - crownBase) * bt;
      const berryR = s * (0.005 + Math.sin(b * 1.7) * 0.001);
      ctx.shadowColor = P.shadowHex;
      ctx.shadowBlur = 3 * zoom;
      ctx.fillStyle = `rgba(${P.flower},${0.55 + naturePulse * 0.2 + Math.sin(time * 3 + b * 1.5) * 0.15})`;
      ctx.beginPath();
      ctx.arc(bx2 + side * s * 0.008, by2, berryR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
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
      ctx.quadraticCurveTo(vtx + dSway, vty + dLen * 0.5, vtx + dSway * 1.5, vty + dLen);
      ctx.stroke();
    }

    // Antler tip glow
    for (const tip of [{ x: tip1X, y: tip1Y }, { x: tip2X, y: tip2Y }]) {
      const tG = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, s * (0.03 + atkBurst * 0.012));
      tG.addColorStop(0, `rgba(${P.glowBright},${0.45 + naturePulse * 0.25 + atkBurst * 0.15})`);
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
    const pColor = ring === 0 ? P.glowBright : ring === 1 ? P.flower : ring === 2 ? P.pollen : P.glowWhite;
    for (let p = 0; p < pCount; p++) {
      const pa = (p / pCount) * Math.PI * 2 - Math.PI / 2 + time * (0.3 - ring * 0.12) + ring * 0.4;
      const px = x + Math.cos(pa) * pR;
      const py = bloomY + Math.sin(pa) * pR;
      ctx.fillStyle = `rgba(${pColor},${bloomPulse * pAlpha})`;
      ctx.beginPath();
      ctx.ellipse(px, py, s * (0.014 - ring * 0.002) * bloomScale, s * (0.007 - ring * 0.001) * bloomScale, pa, 0, Math.PI * 2);
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
    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 3 * zoom;
    ctx.fillStyle = `rgba(${P.pollen},${fPulse + naturePulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(fx, fy, s * 0.004 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ─── NATURE AURA ────────────────────────────────────────────────────────────

function drawNatureAura(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, naturePulse: number, isAttacking: boolean, zoom: number, atkBurst: number,
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
    const bAngle = time * 0.9 + i * (Math.PI * 2 / 3);
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
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, atkBurst: number,
) {
  const particleCount = 8 + Math.floor(atkBurst * 8);
  for (let i = 0; i < particleCount; i++) {
    const phase = (time * (1.2 + atkBurst * 1.5) + i * (1 / particleCount)) % 1;
    const spiralAngle = time * 1.5 + i * (Math.PI * 2 / particleCount);
    const spiralR = s * (0.15 + phase * 0.25 + atkBurst * 0.1);
    const px = x + Math.cos(spiralAngle) * spiralR;
    const py = y - s * 0.1 + Math.sin(spiralAngle) * spiralR * 0.4 - phase * s * 0.2;
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
  x: number, y: number, s: number,
  atkBurst: number, time: number, zoom: number,
) {
  // Shockwave ring on the ground (isometric ellipse pulse)
  const waveR = s * 0.6 * atkBurst;
  ctx.save();
  ctx.translate(x, y + s * 0.27);
  ctx.scale(1, 0.3);
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 6 * zoom;
  ctx.strokeStyle = `rgba(${P.glow},${atkBurst * 0.35})`;
  ctx.lineWidth = (2.5 + atkBurst * 1.5) * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, waveR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(${P.glowBright},${atkBurst * 0.15})`;
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, waveR * 1.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();

  // 12 erupting vines
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + time * 1.5;
    const vineLen = s * (0.5 + i * 0.02) * atkBurst;
    const sway = Math.sin(time * 6 + i * 1.0) * s * 0.04 * atkBurst;
    const mid1X = x + Math.cos(angle) * vineLen * 0.35 + sway * 0.5;
    const mid1Y = y + Math.sin(angle) * vineLen * 0.2 + sway * 0.25;
    const tipX = x + Math.cos(angle) * vineLen;
    const tipY = y + Math.sin(angle) * vineLen * 0.5;

    // Thicker vine gradient (lineWidth * 1.5)
    const vGrad = ctx.createLinearGradient(x, y, tipX, tipY);
    vGrad.addColorStop(0, `rgba(${P.glowDark},${atkBurst * 0.65})`);
    vGrad.addColorStop(0.6, `rgba(${P.vine},${atkBurst * 0.4})`);
    vGrad.addColorStop(1, `rgba(${P.glow},${atkBurst * 0.15})`);
    ctx.strokeStyle = vGrad;
    ctx.lineWidth = (6.0 - i * 0.2) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(mid1X * 0.5 + x * 0.5, mid1Y * 0.5 + y * 0.5, mid1X, mid1Y, tipX, tipY);
    ctx.stroke();

    // Larger thorn tip with bright glow highlight
    const thornSize = s * 0.04 * atkBurst;
    ctx.fillStyle = `rgba(${P.leafDark},${atkBurst * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(tipX + Math.cos(angle) * thornSize, tipY + Math.sin(angle) * thornSize * 0.5);
    ctx.lineTo(tipX + Math.cos(angle + 2.3) * thornSize * 0.55, tipY + Math.sin(angle + 2.3) * thornSize * 0.55);
    ctx.lineTo(tipX + Math.cos(angle - 2.3) * thornSize * 0.55, tipY + Math.sin(angle - 2.3) * thornSize * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = P.shadowHex;
    ctx.shadowBlur = 4 * zoom;
    ctx.fillStyle = `rgba(${P.glowBright},${atkBurst * 0.55})`;
    ctx.beginPath();
    ctx.arc(tipX + Math.cos(angle) * thornSize * 0.7, tipY + Math.sin(angle) * thornSize * 0.35, zoom * 2.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3 leaf particles per vine
    for (let l = 0; l < 3; l++) {
      const lT = 0.25 + l * 0.22;
      const lx = x + (tipX - x) * lT + Math.sin(time * 5 + i + l) * s * 0.02;
      const ly = y + (tipY - y) * lT;
      ctx.fillStyle = `rgba(${P.leaf},${atkBurst * 0.5})`;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle + l * 0.8 + time * 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.015, s * 0.007, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Brighter ground impact cracks
  const crackAlpha = atkBurst * 0.4;
  ctx.shadowColor = P.shadowHex;
  ctx.shadowBlur = 3 * zoom;
  for (let c = 0; c < 12; c++) {
    const cAngle = (c / 12) * Math.PI * 2;
    const cLen = s * (0.22 + Math.sin(time * 2.5 + c) * 0.05) * atkBurst;
    ctx.strokeStyle = `rgba(${P.glow},${crackAlpha})`;
    ctx.lineWidth = (2.0 - c * 0.04) * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.27);
    ctx.bezierCurveTo(
      x + Math.cos(cAngle) * cLen * 0.4, y + s * 0.28,
      x + Math.cos(cAngle) * cLen * 0.7, y + s * 0.27 + Math.sin(cAngle) * cLen * 0.2,
      x + Math.cos(cAngle) * cLen, y + s * 0.27 + Math.sin(cAngle) * cLen * 0.3,
    );
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                         HELPERS                                          ║
// ╚════════════════════════════════════════════════════════════════════════════╝

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}
