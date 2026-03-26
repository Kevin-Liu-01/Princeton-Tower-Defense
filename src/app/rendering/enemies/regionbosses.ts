// Princeton Tower Defense - Region Boss Enemy Sprite Functions
// 5 mega-boss enemies: the climactic encounters of each region.

import { drawRadialAura } from "./helpers";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawGlowingEyes,
  drawShadowWisps,
  drawPoisonBubbles,
  drawOrbitingDebris,
  drawAnimatedTendril,
  drawFloatingPiece,
  drawPulsingGlowRings,
  drawShiftingSegments,
  drawEmberSparks,
  drawFrostCrystals,
} from "./animationHelpers";
import { drawPathArm, drawPathLegs } from "./darkFantasyHelpers";
import { ISO_Y_RATIO } from "../../constants/isometric";

const TAU = Math.PI * 2;

// ============================================================================
// 1. TITAN OF NASSAU — THE NASSAU COLOSSUS (Grassland Boss)
//    Colossal living stone tiger statue from Nassau Hall. Size 52.
//    Princeton orange & stone gray. The awakened guardian.
// ============================================================================

export function drawTitanOfNassauEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const sin2 = Math.sin(time * 2);
  const sin25 = Math.sin(time * 2.5);
  const sin3 = Math.sin(time * 3);
  const sin4 = Math.sin(time * 4);
  const sin5 = Math.sin(time * 5);
  const sin6 = Math.sin(time * 6);
  const sin8 = Math.sin(time * 8);
  const cos3 = Math.cos(time * 3);
  const cos4 = Math.cos(time * 4);
  const prowl =
    sin3 * 3 * zoom + (isAttacking ? attackIntensity * size * 0.25 : 0);
  const breathe = sin2 * size * 0.025;
  const crackGlow = 0.5 + sin3 * 0.35;
  const maneFlow = sin4 * 0.08;
  const tailSwish = sin5 * 0.35;
  const eyeIntensity = 0.7 + sin6 * 0.3;
  const jawOpen =
    sin25 * size * 0.01 + (isAttacking ? attackIntensity * size * 0.04 : 0);
  const shoulderShift = sin3 * size * 0.015;

  // === GROUND POWER AURA (enhanced with multiple layers) ===
  const auraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.3,
    0,
    x,
    y + size * 0.3,
    size * 1.6,
  );
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${crackGlow * 0.32})`);
  auraGrad.addColorStop(0.15, `rgba(251, 191, 36, ${crackGlow * 0.24})`);
  auraGrad.addColorStop(0.3, `rgba(234, 88, 12, ${crackGlow * 0.16})`);
  auraGrad.addColorStop(0.5, `rgba(180, 83, 9, ${crackGlow * 0.09})`);
  auraGrad.addColorStop(0.75, `rgba(120, 60, 5, ${crackGlow * 0.04})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.3, size * 1.6, size * 1.6 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Outer authority haze layer
  const hazeGrad = ctx.createRadialGradient(x, y + size * 0.3, size * 1.0, x, y + size * 0.3, size * 1.8);
  hazeGrad.addColorStop(0, `rgba(234, 88, 12, ${crackGlow * 0.06})`);
  hazeGrad.addColorStop(0.5, `rgba(180, 83, 9, ${crackGlow * 0.03})`);
  hazeGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = hazeGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.3, size * 1.8, size * 1.8 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Secondary inner aura (bright core)
  const coreAura = ctx.createRadialGradient(x, y + size * 0.2, 0, x, y + size * 0.2, size * 0.6);
  coreAura.addColorStop(0, `rgba(255, 230, 100, ${crackGlow * 0.12})`);
  coreAura.addColorStop(0.5, `rgba(251, 191, 36, ${crackGlow * 0.06})`);
  coreAura.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = coreAura;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.2, size * 0.6, size * 0.6 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Pulsing glow rings on ground (isometric)
  ctx.save();
  ctx.translate(x, y + size * 0.45);
  ctx.scale(1, ISO_Y_RATIO);
  drawPulsingGlowRings(ctx, 0, 0, size * 0.7, time, zoom, {
    count: 4,
    speed: 1.5,
    color: "rgba(251, 191, 36, 0.3)",
    maxAlpha: 0.3,
    expansion: 0.45,
    lineWidth: 2.5,
  });
  ctx.restore();

  // === EARTHQUAKE GROUND RINGS (concentric step pulses) ===
  ctx.save();
  ctx.translate(x, y + size * 0.48);
  ctx.scale(1, ISO_Y_RATIO);
  const stepCycle = (time * 0.8) % TAU;
  for (let ring = 0; ring < 4; ring++) {
    const ringPhase = (stepCycle + ring * 1.2) % TAU;
    const ringExpand = (Math.sin(ringPhase) + 1) * 0.5;
    const ringR = size * (0.3 + ringExpand * 0.9);
    const ringAlpha = Math.max(0, 0.35 - ringExpand * 0.35);
    ctx.strokeStyle = `rgba(251, 191, 36, ${ringAlpha})`;
    ctx.lineWidth = (3.5 - ring * 0.6) * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(234, 88, 12, ${ringAlpha * 0.5})`;
    ctx.lineWidth = (2 - ring * 0.3) * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, ringR + size * 0.015, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();

  // Ancient rune circle on ground
  ctx.save();
  ctx.translate(x, y + size * 0.48);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.55, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.48, 0, TAU);
  ctx.stroke();
  for (let rune = 0; rune < 12; rune++) {
    const runeAngle = (rune * TAU) / 12 + time * 0.3;
    const rx = Math.cos(runeAngle) * size * 0.515;
    const ry = Math.sin(runeAngle) * size * 0.515;
    ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(rx, ry - size * 0.02);
    ctx.lineTo(rx + size * 0.012, ry);
    ctx.lineTo(rx, ry + size * 0.02);
    ctx.lineTo(rx - size * 0.012, ry);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === GROUND CRACKS radiating from footsteps (isometric ground plane) ===
  ctx.save();
  ctx.translate(x, y + size * 0.48);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.5})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let crack = 0; crack < 8; crack++) {
    const crackAngle = (crack * TAU) / 8 + Math.sin(crack * 1.7) * 0.15;
    ctx.beginPath();
    let cx0 = 0;
    let cy0 = 0;
    ctx.moveTo(cx0, cy0);
    for (let seg = 0; seg < 4; seg++) {
      const bend = Math.sin(crack * 2.3 + seg * 1.9) * 0.25;
      cx0 += Math.cos(crackAngle + bend) * size * 0.12;
      cy0 += Math.sin(crackAngle + bend) * size * 0.06;
      ctx.lineTo(cx0, cy0);
    }
    ctx.stroke();
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(
      cx0 + Math.cos(crackAngle + 0.7) * size * 0.09,
      cy0 + Math.sin(crackAngle + 0.7) * size * 0.09,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(
      cx0 + Math.cos(crackAngle - 0.5) * size * 0.07,
      cy0 + Math.sin(crackAngle - 0.5) * size * 0.07,
    );
    ctx.stroke();
    ctx.lineWidth = 2.5 * zoom;
  }
  ctx.restore();

  // === ORBITING ROCK DEBRIS ===
  drawOrbitingDebris(ctx, x, y, size, time, zoom, {
    count: 10,
    minRadius: 0.6,
    maxRadius: 0.85,
    speed: 0.6,
    particleSize: 0.04,
    color: "#78716c",
    glowColor: "rgba(251,191,36,0.3)",
    trailLen: 0.3,
  });

  // === TAIL (behind body) ===
  ctx.save();
  ctx.translate(x + size * 0.42, y + size * 0.12);
  ctx.rotate(tailSwish);
  const tailGrad = ctx.createLinearGradient(0, 0, size * 0.5, 0);
  tailGrad.addColorStop(0, "#78716c");
  tailGrad.addColorStop(0.6, "#57534e");
  tailGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = tailGrad;
  const tailWave = sin6 * size * 0.04;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.05);
  ctx.bezierCurveTo(
    size * 0.15,
    -size * 0.09 + tailWave,
    size * 0.3,
    -size * 0.06 - tailWave,
    size * 0.5,
    -size * 0.02,
  );
  ctx.bezierCurveTo(
    size * 0.3,
    size * 0.04 - tailWave,
    size * 0.15,
    size * 0.03 + tailWave,
    0,
    size * 0.05,
  );
  ctx.fill();
  // Tail tuft - stone carved plume
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  for (let t = 0; t < 7; t++) {
    const tuftAngle = -Math.PI * 0.35 + t * Math.PI * 0.11;
    ctx.moveTo(size * 0.48, 0);
    ctx.quadraticCurveTo(
      size * 0.56 + Math.cos(tuftAngle) * size * 0.09,
      Math.sin(tuftAngle) * size * 0.07,
      size * 0.62 + Math.cos(tuftAngle) * size * 0.12,
      Math.sin(tuftAngle) * size * 0.12,
    );
  }
  ctx.fill();
  // Golden energy in tuft
  setShadowBlur(ctx, 6 * zoom, "#fbbf24");
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.7})`;
  ctx.lineWidth = 2 * zoom;
  for (let t = 0; t < 3; t++) {
    const tuftAngle = -Math.PI * 0.2 + t * Math.PI * 0.2;
    ctx.beginPath();
    ctx.moveTo(size * 0.48, 0);
    ctx.quadraticCurveTo(
      size * 0.54,
      Math.sin(tuftAngle + time * 2) * size * 0.05,
      size * 0.58 + Math.cos(tuftAngle) * size * 0.08,
      Math.sin(tuftAngle) * size * 0.08,
    );
    ctx.stroke();
  }
  clearShadow(ctx);
  ctx.restore();

  // === BACK LEGS (behind body) ===
  const stoneGrad = (lx: number, ly: number, lw: number, lh: number) => {
    const g = ctx.createLinearGradient(lx, ly, lx + lw, ly + lh);
    g.addColorStop(0, "#78716c");
    g.addColorStop(0.5, "#a8a29e");
    g.addColorStop(1, "#57534e");
    return g;
  };
  // Left back leg
  const backLegAnimL = sin3 * size * 0.06;
  ctx.fillStyle = stoneGrad(
    x - size * 0.3,
    y + size * 0.15,
    size * 0.12,
    size * 0.35,
  );
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.18);
  ctx.quadraticCurveTo(
    x - size * 0.26,
    y + size * 0.32,
    x - size * 0.3 - backLegAnimL * 0.4,
    y + size * 0.48 + backLegAnimL,
  );
  ctx.lineTo(
    x - size * 0.38 - backLegAnimL * 0.4,
    y + size * 0.5 + backLegAnimL,
  );
  ctx.lineTo(x - size * 0.2, y + size * 0.5 + backLegAnimL);
  ctx.lineTo(x - size * 0.16, y + size * 0.18);
  ctx.fill();
  // Paw
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.29 - backLegAnimL * 0.4,
    y + size * 0.5 + backLegAnimL,
    size * 0.09,
    size * 0.09 * ISO_Y_RATIO,
    0,
    0,
    TAU,
  );
  ctx.fill();
  // Individual stone toes with cracked joints
  for (let toe = 0; toe < 4; toe++) {
    const toeX = x - size * 0.36 + toe * size * 0.045 - backLegAnimL * 0.4;
    const toeY = y + size * 0.5 + backLegAnimL;
    ctx.fillStyle = "#57534e";
    ctx.beginPath();
    ctx.ellipse(toeX, toeY, size * 0.018, size * 0.012, 0, 0, TAU);
    ctx.fill();
    // Cracked joint line
    ctx.strokeStyle = "#44403c";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(toeX - size * 0.008, toeY - size * 0.01);
    ctx.lineTo(toeX + size * 0.005, toeY - size * 0.008);
    ctx.stroke();
    // Stone claw
    ctx.fillStyle = "#3f3a36";
    ctx.beginPath();
    ctx.moveTo(toeX - size * 0.006, toeY + size * 0.008);
    ctx.lineTo(toeX, toeY + size * 0.025);
    ctx.lineTo(toeX + size * 0.006, toeY + size * 0.008);
    ctx.closePath();
    ctx.fill();
  }

  // Right back leg
  const backLegAnimR = -sin3 * size * 0.06;
  ctx.fillStyle = stoneGrad(
    x + size * 0.16,
    y + size * 0.15,
    size * 0.12,
    size * 0.35,
  );
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y + size * 0.18);
  ctx.quadraticCurveTo(
    x + size * 0.26,
    y + size * 0.32,
    x + size * 0.3 - backLegAnimR * 0.4,
    y + size * 0.48 + backLegAnimR,
  );
  ctx.lineTo(
    x + size * 0.38 - backLegAnimR * 0.4,
    y + size * 0.5 + backLegAnimR,
  );
  ctx.lineTo(x + size * 0.2, y + size * 0.5 + backLegAnimR);
  ctx.lineTo(x + size * 0.16, y + size * 0.18);
  ctx.fill();
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.29 - backLegAnimR * 0.4,
    y + size * 0.5 + backLegAnimR,
    size * 0.09,
    size * 0.09 * ISO_Y_RATIO,
    0,
    0,
    TAU,
  );
  ctx.fill();
  // Individual stone toes with cracked joints (right back)
  for (let toe = 0; toe < 4; toe++) {
    const toeX = x + size * 0.22 + toe * size * 0.045 - backLegAnimR * 0.4;
    const toeY = y + size * 0.5 + backLegAnimR;
    ctx.fillStyle = "#57534e";
    ctx.beginPath();
    ctx.ellipse(toeX, toeY, size * 0.018, size * 0.012, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#44403c";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(toeX - size * 0.008, toeY - size * 0.01);
    ctx.lineTo(toeX + size * 0.005, toeY - size * 0.008);
    ctx.stroke();
    ctx.fillStyle = "#3f3a36";
    ctx.beginPath();
    ctx.moveTo(toeX - size * 0.006, toeY + size * 0.008);
    ctx.lineTo(toeX, toeY + size * 0.025);
    ctx.lineTo(toeX + size * 0.006, toeY + size * 0.008);
    ctx.closePath();
    ctx.fill();
  }

  // === MASSIVE TIGER BODY ===
  const bodyGrad = ctx.createRadialGradient(
    x,
    y + size * 0.06,
    0,
    x,
    y + size * 0.06,
    size * 0.52,
  );
  bodyGrad.addColorStop(0, "#a8a29e");
  bodyGrad.addColorStop(0.3, "#78716c");
  bodyGrad.addColorStop(0.7, "#57534e");
  bodyGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.08 + breathe,
    size * 0.48,
    size * 0.36,
    0,
    0,
    TAU,
  );
  ctx.fill();

  // Stone panel seams on body
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.8 * zoom;
  for (let seam = 0; seam < 6; seam++) {
    const seamY = y - size * 0.1 + seam * size * 0.09 + breathe;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.36, seamY);
    ctx.quadraticCurveTo(
      x,
      seamY + size * 0.025,
      x + size * 0.34,
      seamY - size * 0.015,
    );
    ctx.stroke();
  }

  // Vertical stone cracks
  ctx.lineWidth = 1.2 * zoom;
  for (let vCrack = 0; vCrack < 4; vCrack++) {
    const vx = x - size * 0.2 + vCrack * size * 0.13;
    ctx.beginPath();
    ctx.moveTo(vx, y - size * 0.15 + breathe);
    ctx.quadraticCurveTo(
      vx + size * 0.03,
      y + size * 0.08 + breathe,
      vx - size * 0.02,
      y + size * 0.28 + breathe,
    );
    ctx.stroke();
  }

  // Tiger stripe pattern carved into stone
  ctx.strokeStyle = "#3f3a36";
  ctx.lineWidth = 2.5 * zoom;
  const stripePositions = [
    { sx: -0.3, sy: -0.05, ex: -0.2, ey: 0.15, cpx: -0.35, cpy: 0.06 },
    { sx: -0.15, sy: -0.12, ex: -0.08, ey: 0.18, cpx: -0.2, cpy: 0.04 },
    { sx: 0.0, sy: -0.14, ex: 0.05, ey: 0.2, cpx: -0.05, cpy: 0.02 },
    { sx: 0.12, sy: -0.12, ex: 0.18, ey: 0.18, cpx: 0.08, cpy: 0.05 },
    { sx: 0.25, sy: -0.05, ex: 0.33, ey: 0.15, cpx: 0.22, cpy: 0.08 },
  ];
  for (const stripe of stripePositions) {
    ctx.beginPath();
    ctx.moveTo(x + stripe.sx * size, y + stripe.sy * size + breathe);
    ctx.quadraticCurveTo(
      x + stripe.cpx * size,
      y + stripe.cpy * size + breathe,
      x + stripe.ex * size,
      y + stripe.ey * size + breathe,
    );
    ctx.stroke();
  }

  // === SURFACE CARVINGS — Princeton shield and Latin inscriptions ===
  ctx.strokeStyle = "#3f3a36";
  ctx.lineWidth = 1.5 * zoom;
  // Princeton shield carving on right flank
  const shieldCX = x + size * 0.15;
  const shieldCY = y + size * 0.02 + breathe;
  ctx.beginPath();
  ctx.moveTo(shieldCX, shieldCY - size * 0.06);
  ctx.lineTo(shieldCX + size * 0.04, shieldCY - size * 0.04);
  ctx.lineTo(shieldCX + size * 0.04, shieldCY + size * 0.02);
  ctx.lineTo(shieldCX, shieldCY + size * 0.05);
  ctx.lineTo(shieldCX - size * 0.04, shieldCY + size * 0.02);
  ctx.lineTo(shieldCX - size * 0.04, shieldCY - size * 0.04);
  ctx.closePath();
  ctx.stroke();
  // Chevron inside shield
  ctx.beginPath();
  ctx.moveTo(shieldCX - size * 0.025, shieldCY - size * 0.01);
  ctx.lineTo(shieldCX, shieldCY + size * 0.015);
  ctx.lineTo(shieldCX + size * 0.025, shieldCY - size * 0.01);
  ctx.stroke();
  // Latin inscription band on left flank
  ctx.font = `${size * 0.028}px serif`;
  ctx.fillStyle = "#44403c";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.save();
  ctx.translate(x - size * 0.18, y + size * 0.06 + breathe);
  ctx.rotate(-0.12);
  ctx.fillText("DEI SVB", 0, 0);
  ctx.fillText("NVMINE", 0, size * 0.035);
  ctx.restore();
  // Mortar gap lines between stone blocks (body)
  ctx.strokeStyle = "rgba(63, 58, 54, 0.5)";
  ctx.lineWidth = 1 * zoom;
  for (let blockRow = 0; blockRow < 5; blockRow++) {
    const bY = y - size * 0.12 + blockRow * size * 0.1 + breathe;
    ctx.setLineDash([size * 0.04, size * 0.02]);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.36, bY);
    ctx.quadraticCurveTo(x, bY + size * 0.015, x + size * 0.34, bY - size * 0.005);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // === GOLDEN RUNE CIRCUITS ===
  setShadowBlur(ctx, 10 * zoom, "#fbbf24");
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.7})`;
  ctx.lineWidth = 2.5 * zoom;
  // Main circuit along spine
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.04 + breathe);
  ctx.bezierCurveTo(
    x - size * 0.15,
    y + size * 0.12 + breathe,
    x + size * 0.1,
    y - size * 0.06 + breathe,
    x + size * 0.35,
    y + size * 0.02 + breathe,
  );
  ctx.stroke();
  // Branch circuits
  ctx.lineWidth = 1.8 * zoom;
  for (let branch = 0; branch < 5; branch++) {
    const bx = x - size * 0.25 + branch * size * 0.13;
    const by = y + size * 0.02 + Math.sin(branch * 1.5) * size * 0.06 + breathe;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + size * 0.04, by - size * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - size * 0.03, by + size * 0.08);
    ctx.stroke();
  }
  // Rune circuit dots (junction points)
  ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow * 0.9})`;
  for (let dot = 0; dot < 7; dot++) {
    const dx = x - size * 0.3 + dot * size * 0.1;
    const dy =
      y + size * 0.01 + Math.sin(dot * 1.8 + time) * size * 0.04 + breathe;
    ctx.beginPath();
    ctx.arc(dx, dy, size * 0.015, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // === IVY VINES growing across body ===
  const ivyPulse = 0.5 + sin4 * 0.3;
  ctx.strokeStyle = `rgba(34, 120, 50, ${ivyPulse * 0.8})`;
  ctx.lineWidth = 2 * zoom;
  for (let vine = 0; vine < 4; vine++) {
    const vineStartX = x - size * 0.35 + vine * size * 0.22;
    const vineStartY = y - size * 0.15 + vine * size * 0.05 + breathe;
    ctx.beginPath();
    ctx.moveTo(vineStartX, vineStartY);
    for (let seg = 0; seg < 5; seg++) {
      const segX = vineStartX + seg * size * 0.06;
      const segY =
        vineStartY +
        Math.sin(time * 2 + vine + seg * 0.8) * size * 0.04 +
        seg * size * 0.03;
      ctx.lineTo(segX, segY);
    }
    ctx.stroke();
    // Ivy leaves — 5-lobed ivy leaf shapes with veins
    for (let leaf = 0; leaf < 4; leaf++) {
      const lx = vineStartX + (leaf + 0.8) * size * 0.07;
      const ly =
        vineStartY +
        Math.sin(time * 2 + vine + leaf) * size * 0.04 +
        leaf * size * 0.022;
      const leafSize = size * (0.022 + Math.sin(leaf * 1.7) * 0.005);
      const leafRot = Math.sin(time * 3 + leaf + vine) * 0.35 + (leaf % 2 === 0 ? 0.3 : -0.3);
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(leafRot);
      // 5-lobed ivy leaf shape
      ctx.fillStyle = `rgba(34, 160, 50, ${ivyPulse * 0.75})`;
      ctx.beginPath();
      ctx.moveTo(0, leafSize);
      ctx.bezierCurveTo(-leafSize * 0.4, leafSize * 0.6, -leafSize * 1.1, leafSize * 0.3, -leafSize * 0.9, -leafSize * 0.2);
      ctx.bezierCurveTo(-leafSize * 0.8, -leafSize * 0.5, -leafSize * 0.5, -leafSize * 0.8, -leafSize * 0.15, -leafSize * 0.6);
      ctx.bezierCurveTo(-leafSize * 0.05, -leafSize * 0.9, 0.05 * leafSize, -leafSize * 0.9, leafSize * 0.15, -leafSize * 0.6);
      ctx.bezierCurveTo(leafSize * 0.5, -leafSize * 0.8, leafSize * 0.8, -leafSize * 0.5, leafSize * 0.9, -leafSize * 0.2);
      ctx.bezierCurveTo(leafSize * 1.1, leafSize * 0.3, leafSize * 0.4, leafSize * 0.6, 0, leafSize);
      ctx.fill();
      // Leaf veins
      ctx.strokeStyle = `rgba(20, 100, 30, ${ivyPulse * 0.5})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, leafSize);
      ctx.lineTo(0, -leafSize * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-leafSize * 0.6, -leafSize * 0.35);
      ctx.moveTo(0, 0);
      ctx.lineTo(leafSize * 0.6, -leafSize * 0.35);
      ctx.stroke();
      ctx.restore();
    }
  }
  // Green magic glow on vines
  setShadowBlur(ctx, 5 * zoom, "#22c55e");
  ctx.strokeStyle = `rgba(34, 197, 94, ${ivyPulse * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  for (let v = 0; v < 3; v++) {
    const vx = x - size * 0.2 + v * size * 0.2;
    const vy = y - size * 0.05 + breathe;
    ctx.beginPath();
    ctx.arc(vx, vy + sin4 * size * 0.02, size * 0.03, 0, TAU);
    ctx.stroke();
  }
  clearShadow(ctx);

  // === IVY VINE ENERGY PULSE (traveling glow along vines) ===
  for (let vine = 0; vine < 4; vine++) {
    const epStartX = x - size * 0.35 + vine * size * 0.22;
    const epStartY = y - size * 0.15 + vine * size * 0.05 + breathe;
    const pulseT = (time * 1.5 + vine * 0.8) % 1;
    for (let seg = 0; seg < 5; seg++) {
      const segT = seg / 5;
      const dist = Math.abs(segT - pulseT);
      if (dist < 0.3) {
        const pulseAlpha = (1 - dist / 0.3) * 0.6;
        const segX = epStartX + seg * size * 0.06;
        const segY = epStartY + Math.sin(time * 2 + vine + seg * 0.8) * size * 0.04 + seg * size * 0.03;
        const pulseGrad = ctx.createRadialGradient(segX, segY, 0, segX, segY, size * 0.03);
        pulseGrad.addColorStop(0, `rgba(74, 255, 128, ${pulseAlpha})`);
        pulseGrad.addColorStop(0.4, `rgba(34, 197, 94, ${pulseAlpha * 0.5})`);
        pulseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = pulseGrad;
        ctx.beginPath();
        ctx.arc(segX, segY, size * 0.03, 0, TAU);
        ctx.fill();
      }
    }
  }

  // === FRONT LEGS ===
  // Left front leg
  const frontLegAnimL = -sin3 * size * 0.07;
  ctx.fillStyle = stoneGrad(
    x - size * 0.38,
    y + size * 0.0,
    size * 0.14,
    size * 0.4,
  );
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.0);
  ctx.quadraticCurveTo(
    x - size * 0.34,
    y + size * 0.2,
    x - size * 0.32 + frontLegAnimL * 0.3,
    y + size * 0.45 + frontLegAnimL,
  );
  ctx.lineTo(
    x - size * 0.4 + frontLegAnimL * 0.3,
    y + size * 0.48 + frontLegAnimL,
  );
  ctx.lineTo(
    x - size * 0.22 + frontLegAnimL * 0.3,
    y + size * 0.48 + frontLegAnimL,
  );
  ctx.lineTo(x - size * 0.24, y + size * 0.0);
  ctx.fill();
  // Muscular definition
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.05);
  ctx.quadraticCurveTo(
    x - size * 0.3,
    y + size * 0.15,
    x - size * 0.27,
    y + size * 0.25,
  );
  ctx.stroke();
  // Paw
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.31 + frontLegAnimL * 0.3,
    y + size * 0.48 + frontLegAnimL,
    size * 0.1,
    size * 0.1 * ISO_Y_RATIO,
    0,
    0,
    TAU,
  );
  ctx.fill();
  // Individual stone toes with cracked joints and claws (left front)
  for (let toe = 0; toe < 4; toe++) {
    const toeX = x - size * 0.37 + toe * size * 0.04 + frontLegAnimL * 0.3;
    const toeY = y + size * 0.48 + frontLegAnimL;
    ctx.fillStyle = "#57534e";
    ctx.beginPath();
    ctx.ellipse(toeX, toeY + size * 0.01, size * 0.02, size * 0.013, toe * 0.15, 0, TAU);
    ctx.fill();
    // Joint crack
    ctx.strokeStyle = "#44403c";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(toeX - size * 0.01, toeY);
    ctx.quadraticCurveTo(toeX, toeY + size * 0.005, toeX + size * 0.008, toeY - size * 0.002);
    ctx.stroke();
    // Stone claw
    ctx.fillStyle = "#3f3a36";
    ctx.beginPath();
    ctx.moveTo(toeX - size * 0.008, toeY + size * 0.02);
    ctx.lineTo(toeX, toeY + size * 0.06);
    ctx.lineTo(toeX + size * 0.008, toeY + size * 0.02);
    ctx.closePath();
    ctx.fill();
  }

  // Right front leg
  const frontLegAnimR = sin3 * size * 0.07;
  ctx.fillStyle = stoneGrad(
    x + size * 0.24,
    y + size * 0.0,
    size * 0.14,
    size * 0.4,
  );
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y + size * 0.0);
  ctx.quadraticCurveTo(
    x + size * 0.34,
    y + size * 0.2,
    x + size * 0.32 + frontLegAnimR * 0.3,
    y + size * 0.45 + frontLegAnimR,
  );
  ctx.lineTo(
    x + size * 0.4 + frontLegAnimR * 0.3,
    y + size * 0.48 + frontLegAnimR,
  );
  ctx.lineTo(
    x + size * 0.22 + frontLegAnimR * 0.3,
    y + size * 0.48 + frontLegAnimR,
  );
  ctx.lineTo(x + size * 0.24, y + size * 0.0);
  ctx.fill();
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y + size * 0.05);
  ctx.quadraticCurveTo(
    x + size * 0.3,
    y + size * 0.15,
    x + size * 0.27,
    y + size * 0.25,
  );
  ctx.stroke();
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.31 + frontLegAnimR * 0.3,
    y + size * 0.48 + frontLegAnimR,
    size * 0.1,
    size * 0.1 * ISO_Y_RATIO,
    0,
    0,
    TAU,
  );
  ctx.fill();
  // Individual stone toes with cracked joints and claws (right front)
  for (let toe = 0; toe < 4; toe++) {
    const toeX = x + size * 0.23 + toe * size * 0.04 + frontLegAnimR * 0.3;
    const toeY = y + size * 0.48 + frontLegAnimR;
    ctx.fillStyle = "#57534e";
    ctx.beginPath();
    ctx.ellipse(toeX, toeY + size * 0.01, size * 0.02, size * 0.013, -toe * 0.15, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#44403c";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(toeX - size * 0.01, toeY);
    ctx.quadraticCurveTo(toeX, toeY + size * 0.005, toeX + size * 0.008, toeY - size * 0.002);
    ctx.stroke();
    ctx.fillStyle = "#3f3a36";
    ctx.beginPath();
    ctx.moveTo(toeX - size * 0.008, toeY + size * 0.02);
    ctx.lineTo(toeX, toeY + size * 0.06);
    ctx.lineTo(toeX + size * 0.008, toeY + size * 0.02);
    ctx.closePath();
    ctx.fill();
  }

  // === GOLDEN SHOULDER ARMOR on body ===
  for (const side of [-1, 1]) {
    const armorX = x + side * size * 0.38;
    const armorY = y - size * 0.02 + breathe;
    const armGrad = ctx.createRadialGradient(armorX, armorY, 0, armorX, armorY, size * 0.1);
    armGrad.addColorStop(0, "#fbbf24");
    armGrad.addColorStop(0.5, "#c4a35a");
    armGrad.addColorStop(1, "#7a6020");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.ellipse(armorX, armorY, size * 0.09, size * 0.07, side * 0.3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(armorX, armorY, size * 0.07, size * 0.055, side * 0.3, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow * 0.9})`;
    ctx.beginPath();
    ctx.arc(armorX, armorY, size * 0.018, 0, TAU);
    ctx.fill();
  }

  // === ORNATE CHEST MEDALLION ===
  const medalX = x;
  const medalY = y - size * 0.05 + breathe;
  setShadowBlur(ctx, 10 * zoom, "#fbbf24");
  const medalGrad = ctx.createRadialGradient(medalX, medalY, 0, medalX, medalY, size * 0.06);
  medalGrad.addColorStop(0, "#fff7c2");
  medalGrad.addColorStop(0.4, "#fbbf24");
  medalGrad.addColorStop(0.8, "#c4a35a");
  medalGrad.addColorStop(1, "#7a6020");
  ctx.fillStyle = medalGrad;
  ctx.beginPath();
  ctx.arc(medalX, medalY, size * 0.055, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(medalX, medalY, size * 0.04, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 200, 50, ${crackGlow})`;
  ctx.beginPath();
  ctx.moveTo(medalX, medalY - size * 0.025);
  ctx.lineTo(medalX + size * 0.02, medalY);
  ctx.lineTo(medalX, medalY + size * 0.025);
  ctx.lineTo(medalX - size * 0.02, medalY);
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);

  // === STONE MANE with golden energy veins ===
  const maneGrad = ctx.createRadialGradient(
    x,
    y - size * 0.2,
    0,
    x,
    y - size * 0.2,
    size * 0.45,
  );
  maneGrad.addColorStop(0, "#b5afa8");
  maneGrad.addColorStop(0.3, "#a8a29e");
  maneGrad.addColorStop(0.6, "#78716c");
  maneGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = maneGrad;
  // Mane tufts
  for (let mt = 0; mt < 16; mt++) {
    const maneAngle = -Math.PI * 0.8 + mt * Math.PI * 0.1 + maneFlow;
    const maneLen = size * (0.24 + Math.sin(mt * 1.3) * 0.08);
    const mx = x + Math.cos(maneAngle) * size * 0.22;
    const my = y - size * 0.22 + Math.sin(maneAngle) * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.quadraticCurveTo(
      mx + Math.cos(maneAngle) * maneLen * 0.6 + sin4 * size * 0.02,
      my + Math.sin(maneAngle) * maneLen * 0.6,
      mx + Math.cos(maneAngle) * maneLen,
      my + Math.sin(maneAngle) * maneLen,
    );
    ctx.lineTo(
      mx + Math.cos(maneAngle + 0.15) * maneLen * 0.8,
      my + Math.sin(maneAngle + 0.15) * maneLen * 0.7,
    );
    ctx.closePath();
    ctx.fill();
  }
  // Golden energy veins in mane
  setShadowBlur(ctx, 8 * zoom, "#fbbf24");
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.8})`;
  ctx.lineWidth = 2 * zoom;
  for (let ev = 0; ev < 6; ev++) {
    const evAngle = -Math.PI * 0.5 + ev * Math.PI * 0.2 + maneFlow;
    const evLen = size * 0.18;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(evAngle) * size * 0.15,
      y - size * 0.22 + Math.sin(evAngle) * size * 0.1,
    );
    ctx.lineTo(
      x + Math.cos(evAngle) * (size * 0.15 + evLen),
      y - size * 0.22 + Math.sin(evAngle) * (size * 0.1 + evLen * 0.4),
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // === MASSIVE HEAD ===
  const headX = x;
  const headY = y - size * 0.28 + breathe;
  const headGrad = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    size * 0.22,
  );
  headGrad.addColorStop(0, "#a8a29e");
  headGrad.addColorStop(0.5, "#78716c");
  headGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.2, size * 0.18, 0, 0, TAU);
  ctx.fill();

  // Brow ridge
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    headX,
    headY - size * 0.08,
    size * 0.18,
    size * 0.06,
    0,
    Math.PI,
    TAU,
  );
  ctx.fill();

  // Chiseled muzzle — angular stone snout with carved planes
  const snoutGrad = ctx.createRadialGradient(
    headX,
    headY + size * 0.08,
    0,
    headX,
    headY + size * 0.08,
    size * 0.14,
  );
  snoutGrad.addColorStop(0, "#8a8580");
  snoutGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = snoutGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.14, headY + size * 0.04);
  ctx.bezierCurveTo(headX - size * 0.16, headY + size * 0.1, headX - size * 0.1, headY + size * 0.16, headX, headY + size * 0.18);
  ctx.bezierCurveTo(headX + size * 0.1, headY + size * 0.16, headX + size * 0.16, headY + size * 0.1, headX + size * 0.14, headY + size * 0.04);
  ctx.closePath();
  ctx.fill();
  // Muzzle ridge lines (chiseled planes)
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX, headY + size * 0.02);
  ctx.lineTo(headX, headY + size * 0.16);
  ctx.stroke();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.06, headY + size * 0.04);
    ctx.bezierCurveTo(headX + side * size * 0.08, headY + size * 0.08, headX + side * size * 0.06, headY + size * 0.13, headX + side * size * 0.03, headY + size * 0.16);
    ctx.stroke();
  }

  // Deep-set nose pad (carved depression)
  ctx.fillStyle = "#3f3a36";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.035, headY + size * 0.05);
  ctx.quadraticCurveTo(headX, headY + size * 0.035, headX + size * 0.035, headY + size * 0.05);
  ctx.quadraticCurveTo(headX, headY + size * 0.07, headX - size * 0.035, headY + size * 0.05);
  ctx.fill();
  // Nostril carvings
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#2a2520";
    ctx.beginPath();
    ctx.ellipse(headX + side * size * 0.018, headY + size * 0.055, size * 0.008, size * 0.005, side * 0.3, 0, TAU);
    ctx.fill();
  }

  // Whisker grooves (deep stone-carved channels)
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 2 * zoom;
  for (let w = 0; w < 3; w++) {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(
        headX + side * size * 0.05,
        headY + size * 0.08 + w * size * 0.015,
      );
      ctx.bezierCurveTo(
        headX + side * size * 0.1,
        headY + size * 0.07 + w * size * 0.018,
        headX + side * size * 0.15,
        headY + size * 0.065 + w * size * 0.02 + Math.sin(time + w) * size * 0.008,
        headX + side * size * 0.22,
        headY + size * 0.06 + w * size * 0.022 + Math.sin(time + w) * size * 0.01,
      );
      ctx.stroke();
    }
  }
  // Whisker dot holes (carved pits where whiskers emerge)
  ctx.fillStyle = "#3a3530";
  for (const side of [-1, 1]) {
    for (let dot = 0; dot < 3; dot++) {
      ctx.beginPath();
      ctx.arc(headX + side * size * (0.04 + dot * 0.012), headY + size * 0.08 + dot * size * 0.012, size * 0.004, 0, TAU);
      ctx.fill();
    }
  }

  // === JAW (opens on attack) — massive stone jaw with carved fangs ===
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.12, headY + size * 0.12 + jawOpen * 0.3);
  ctx.bezierCurveTo(headX - size * 0.13, headY + size * 0.16 + jawOpen, headX - size * 0.06, headY + size * 0.2 + jawOpen, headX, headY + size * 0.21 + jawOpen);
  ctx.bezierCurveTo(headX + size * 0.06, headY + size * 0.2 + jawOpen, headX + size * 0.13, headY + size * 0.16 + jawOpen, headX + size * 0.12, headY + size * 0.12 + jawOpen * 0.3);
  ctx.closePath();
  ctx.fill();
  // Jaw hinge crack lines
  ctx.strokeStyle = "#3f3a36";
  ctx.lineWidth = 1 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.12, headY + size * 0.1);
    ctx.lineTo(headX + side * size * 0.13, headY + size * 0.14 + jawOpen * 0.5);
    ctx.stroke();
  }
  // Large carved fangs (saber-tooth style)
  ctx.fillStyle = "#d6d3d1";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.06, headY + size * 0.1);
    ctx.bezierCurveTo(headX + side * size * 0.055, headY + size * 0.14, headX + side * size * 0.04, headY + size * 0.18, headX + side * size * 0.045, headY + size * 0.22 + jawOpen * 0.6);
    ctx.lineTo(headX + side * size * 0.065, headY + size * 0.1);
    ctx.closePath();
    ctx.fill();
    // Fang crack detail
    ctx.strokeStyle = "#b0aba6";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.058, headY + size * 0.12);
    ctx.lineTo(headX + side * size * 0.05, headY + size * 0.18);
    ctx.stroke();
  }
  // Smaller teeth row
  ctx.fillStyle = "#d6d3d1";
  for (let tooth = 0; tooth < 5; tooth++) {
    const toothAngle = -Math.PI * 0.6 + tooth * Math.PI * 0.3;
    const tx = headX + Math.cos(toothAngle) * size * 0.08;
    const ty = headY + size * 0.11 + jawOpen * 0.6;
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.007, ty);
    ctx.lineTo(tx, ty + size * 0.025);
    ctx.lineTo(tx + size * 0.007, ty);
    ctx.closePath();
    ctx.fill();
  }

  // Fire breath particles when attacking
  if (isAttacking) {
    setShadowBlur(ctx, 12 * zoom, "#f97316");
    for (let fp = 0; fp < 8; fp++) {
      const firePhase = (time * 8 + fp * 0.8) % TAU;
      const fireX =
        headX + Math.cos(firePhase * 0.5) * size * (0.15 + fp * 0.04);
      const fireY = headY + size * 0.18 + jawOpen + fp * size * 0.025;
      const fireAlpha = (1 - fp / 8) * attackIntensity;
      ctx.fillStyle =
        fp < 3
          ? `rgba(255, 255, 100, ${fireAlpha * 0.8})`
          : `rgba(249, 115, 22, ${fireAlpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(fireX, fireY, size * (0.02 - fp * 0.002), 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);
  }

  // === BLAZING EYES ===
  for (const side of [-1, 1]) {
    const eyeX = headX + side * size * 0.08;
    const eyeY = headY - size * 0.02;
    // Eye socket
    ctx.fillStyle = "#2a2420";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.04, size * 0.035, 0, 0, TAU);
    ctx.fill();
    // Fire eye
    setShadowBlur(ctx, 14 * zoom, "#f97316");
    const eyeGrad = ctx.createRadialGradient(
      eyeX,
      eyeY,
      0,
      eyeX,
      eyeY,
      size * 0.035,
    );
    eyeGrad.addColorStop(0, `rgba(255, 255, 200, ${eyeIntensity})`);
    eyeGrad.addColorStop(0.4, `rgba(249, 115, 22, ${eyeIntensity * 0.9})`);
    eyeGrad.addColorStop(1, `rgba(234, 88, 12, ${eyeIntensity * 0.5})`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.035, size * 0.03, 0, 0, TAU);
    ctx.fill();
    // Pupil slit
    ctx.fillStyle = `rgba(120, 30, 0, ${eyeIntensity})`;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.008, size * 0.025, 0, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
    // Fire trail from eye
    ctx.strokeStyle = `rgba(249, 115, 22, ${eyeIntensity * 0.5})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX + side * size * 0.04, eyeY);
    ctx.quadraticCurveTo(
      eyeX + side * size * 0.08,
      eyeY - size * 0.02 + sin8 * size * 0.01,
      eyeX + side * size * 0.12,
      eyeY - size * 0.04 + sin8 * size * 0.02,
    );
    ctx.stroke();

    // Enhanced fire eye radial glow halo
    const eyeHaloGrad = ctx.createRadialGradient(eyeX, eyeY, size * 0.01, eyeX, eyeY, size * 0.09);
    eyeHaloGrad.addColorStop(0, `rgba(255, 200, 50, ${eyeIntensity * 0.45})`);
    eyeHaloGrad.addColorStop(0.3, `rgba(249, 115, 22, ${eyeIntensity * 0.25})`);
    eyeHaloGrad.addColorStop(0.6, `rgba(234, 88, 12, ${eyeIntensity * 0.1})`);
    eyeHaloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = eyeHaloGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.09, 0, TAU);
    ctx.fill();
    // Flame wisps drifting upward from eye
    for (let wisp = 0; wisp < 3; wisp++) {
      const wispPhase = time * 4 + wisp * 2.1 + side * 1.5;
      const wispLen = size * (0.06 + Math.sin(wispPhase) * 0.02);
      const wispAlpha = (0.4 + Math.sin(wispPhase * 0.7) * 0.2) * eyeIntensity;
      ctx.strokeStyle = `rgba(255, 180, 50, ${wispAlpha})`;
      ctx.lineWidth = (2 - wisp * 0.4) * zoom;
      ctx.beginPath();
      ctx.moveTo(eyeX + side * size * 0.04, eyeY);
      ctx.bezierCurveTo(
        eyeX + side * size * (0.06 + wisp * 0.02),
        eyeY - size * 0.03 + Math.sin(wispPhase) * size * 0.015,
        eyeX + side * size * (0.1 + wisp * 0.02),
        eyeY - size * 0.05 + Math.cos(wispPhase) * size * 0.02,
        eyeX + side * (size * 0.04 + wispLen),
        eyeY - size * 0.06 + Math.sin(wispPhase * 1.3) * size * 0.025,
      );
      ctx.stroke();
    }
  }

  // === EARS (stone) ===
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#57534e";
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.12, headY - size * 0.1);
    ctx.lineTo(headX + side * size * 0.16, headY - size * 0.24);
    ctx.lineTo(headX + side * size * 0.06, headY - size * 0.12);
    ctx.closePath();
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "#44403c";
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.12, headY - size * 0.12);
    ctx.lineTo(headX + side * size * 0.14, headY - size * 0.2);
    ctx.lineTo(headX + side * size * 0.08, headY - size * 0.13);
    ctx.closePath();
    ctx.fill();
  }

  // === ORNATE CROWN / DIADEM on head ===
  setShadowBlur(ctx, 12 * zoom, "#fbbf24");
  const crownY = headY - size * 0.14;
  ctx.fillStyle = "#c4a35a";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.16, crownY + size * 0.04);
  ctx.lineTo(headX - size * 0.14, crownY);
  ctx.lineTo(headX - size * 0.1, crownY + size * 0.02);
  ctx.lineTo(headX - size * 0.06, crownY - size * 0.04);
  ctx.lineTo(headX - size * 0.02, crownY + size * 0.01);
  ctx.lineTo(headX, crownY - size * 0.06);
  ctx.lineTo(headX + size * 0.02, crownY + size * 0.01);
  ctx.lineTo(headX + size * 0.06, crownY - size * 0.04);
  ctx.lineTo(headX + size * 0.1, crownY + size * 0.02);
  ctx.lineTo(headX + size * 0.14, crownY);
  ctx.lineTo(headX + size * 0.16, crownY + size * 0.04);
  ctx.lineTo(headX + size * 0.15, crownY + size * 0.08);
  ctx.lineTo(headX - size * 0.15, crownY + size * 0.08);
  ctx.closePath();
  ctx.fill();
  // Crown gems
  const gemColors = ["#ef4444", "#3b82f6", "#ef4444"];
  const gemOffsets = [-0.06, 0, 0.06];
  for (let g = 0; g < 3; g++) {
    ctx.fillStyle = gemColors[g];
    ctx.beginPath();
    ctx.arc(headX + gemOffsets[g] * size, crownY - size * (g === 1 ? 0.04 : 0.02), size * 0.015, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${crackGlow * 0.6})`;
    ctx.beginPath();
    ctx.arc(headX + gemOffsets[g] * size - size * 0.005, crownY - size * (g === 1 ? 0.045 : 0.025), size * 0.006, 0, TAU);
    ctx.fill();
  }
  // Crown band
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.15, crownY + size * 0.06);
  ctx.lineTo(headX + size * 0.15, crownY + size * 0.06);
  ctx.stroke();
  clearShadow(ctx);

  // === PRINCETON "P" GLYPH on forehead ===
  setShadowBlur(ctx, 15 * zoom, "#fbbf24");
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow})`;
  ctx.lineWidth = 3 * zoom;
  ctx.font = `bold ${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow})`;
  ctx.fillText("P", headX, headY - size * 0.04);
  clearShadow(ctx);

  // Forehead rune circle around P
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.04, size * 0.06, 0, TAU);
  ctx.stroke();

  // === SHOULDER ARMOR PLATES (floating stone) ===
  for (const side of [-1, 1]) {
    const plateX = x + side * size * 0.35;
    const plateY =
      y - size * 0.05 + breathe + Math.sin(time * 2 + side) * size * 0.015;
    drawFloatingPiece(ctx, plateX, plateY, size, time, side * 1.5, {
      width: 0.12,
      height: 0.08,
      color: "#78716c",
      colorEdge: "#57534e",
      bobSpeed: 2,
      bobAmt: 0.015,
      rotateSpeed: 0.5,
      rotateAmt: 0.1,
    });
  }

  // === CRUMBLING STONE PARTICLES (falling fragments) ===
  for (let frag = 0; frag < 8; frag++) {
    const fragPhase = (time * 0.8 + frag * 0.45) % 2.5;
    const fragStartX = x + Math.sin(frag * 2.7) * size * 0.3;
    const fragStartY = y - size * 0.1 + Math.cos(frag * 1.9) * size * 0.15;
    const fragX = fragStartX + Math.sin(time + frag) * size * 0.02;
    const fragY = fragStartY + fragPhase * size * 0.2;
    const fragAlpha = Math.max(0, 0.6 - fragPhase * 0.25);
    const fragSz = size * (0.015 + Math.sin(frag * 3.1) * 0.005);
    ctx.fillStyle = `rgba(120, 113, 108, ${fragAlpha})`;
    ctx.save();
    ctx.translate(fragX, fragY);
    ctx.rotate(time * 2 + frag * 1.3);
    ctx.fillRect(-fragSz, -fragSz * 0.7, fragSz * 2, fragSz * 1.4);
    ctx.restore();
  }

  // === SHADOW WISPS for ancient power ===
  drawShadowWisps(ctx, x, y + size * 0.3, size, time, zoom, {
    count: 6,
    speed: 1.5,
    color: "rgba(120, 113, 108, 0.3)",
    maxAlpha: 0.3,
  });
}

// ============================================================================
// 2. SWAMP LEVIATHAN — THE THESIS HYDRA (Swamp Boss)
//    Multi-headed serpentine horror. Size 50. Deep swamp green / toxic purple.
// ============================================================================

export function drawSwampLeviathanEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const sin15 = Math.sin(time * 1.5);
  const sin2 = Math.sin(time * 2);
  const sin3 = Math.sin(time * 3);
  const sin4 = Math.sin(time * 4);
  const sin5 = Math.sin(time * 5);
  const sin6 = Math.sin(time * 6);
  const cos2 = Math.cos(time * 2);
  const cos3 = Math.cos(time * 3);
  const bodyUndulate = sin2 * size * 0.03;
  const toxicPulse = 0.5 + sin3 * 0.35;
  const neckWeave = sin4 * 0.15;
  const jawSnap = isAttacking
    ? attackIntensity * size * 0.05
    : sin5 * size * 0.005;

  // === TOXIC MIST AURA (isometric ground plane) ===
  const mistGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.0);
  mistGrad.addColorStop(0, `rgba(74, 222, 128, ${toxicPulse * 0.15})`);
  mistGrad.addColorStop(0.4, `rgba(34, 197, 94, ${toxicPulse * 0.1})`);
  mistGrad.addColorStop(0.7, `rgba(88, 28, 135, ${toxicPulse * 0.06})`);
  mistGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = mistGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 1.0, size * 1.0 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // === SWAMP MIST EFFECT (low-lying fog particles) ===
  ctx.save();
  for (let mist = 0; mist < 10; mist++) {
    const mistPhase = (time * 0.3 + mist * 0.7) % 3;
    const mistPX = x + Math.sin(time * 0.5 + mist * 1.4) * size * 0.6;
    const mistPY = y + size * 0.35 + Math.sin(mist * 2.1) * size * 0.08;
    const mistSz = size * (0.07 + Math.sin(time * 0.8 + mist) * 0.025);
    const mistA = Math.max(0, 0.25 - Math.abs(mistPhase - 1.5) * 0.15);
    const mistPGrad = ctx.createRadialGradient(mistPX, mistPY, 0, mistPX, mistPY, mistSz);
    mistPGrad.addColorStop(0, `rgba(74, 222, 128, ${mistA})`);
    mistPGrad.addColorStop(0.5, `rgba(34, 120, 60, ${mistA * 0.5})`);
    mistPGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = mistPGrad;
    ctx.beginPath();
    ctx.ellipse(mistPX, mistPY, mistSz, mistSz * 0.4, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // === SWAMP WATER SPLASHES at base (isometric) ===
  ctx.strokeStyle = `rgba(74, 222, 128, ${toxicPulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let splash = 0; splash < 6; splash++) {
    const sAngle = (splash * TAU) / 6 + time * 0.5;
    const sR = size * (0.4 + Math.sin(time * 2 + splash * 1.2) * 0.05);
    const sx = x + Math.cos(sAngle) * sR;
    const sy = y + size * 0.45 + Math.sin(sAngle) * sR * ISO_Y_RATIO;
    ctx.beginPath();
    ctx.arc(
      sx,
      sy,
      size * 0.02 + Math.sin(time * 3 + splash) * size * 0.01,
      0,
      Math.PI,
      true,
    );
    ctx.stroke();
  }

  // Poison bubbles
  drawPoisonBubbles(ctx, x, y + size * 0.3, size * 0.6, time, zoom, {
    count: 12,
    speed: 1.2,
    color: "rgba(74, 222, 128, 0.5)",
    maxAlpha: 0.5,
    maxSize: 0.04,
    spread: 0.8,
  });

  // === SHADOW WISPS ===
  drawShadowWisps(ctx, x, y + size * 0.2, size, time, zoom, {
    count: 8,
    speed: 1,
    color: "rgba(88, 28, 135, 0.25)",
    maxAlpha: 0.3,
  });

  // === MASSIVE COILED TAIL SECTION ===
  // Draw the coiled serpent body in an S-curve
  ctx.save();
  const tailSegments = 16;
  ctx.lineWidth = size * 0.14;
  ctx.lineCap = "round";
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    for (let seg = 0; seg <= tailSegments; seg++) {
      const t = seg / tailSegments;
      const segX =
        x +
        size * 0.4 * t -
        size * 0.2 +
        Math.sin(t * Math.PI * 2 + time * 1.5) * size * 0.15;
      const segY =
        y +
        size * 0.3 -
        t * size * 0.05 +
        Math.cos(t * Math.PI * 1.5 + time) * size * 0.08;
      if (seg === 0) ctx.moveTo(segX, segY);
      else ctx.lineTo(segX, segY);
    }
    if (pass === 0) {
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = size * 0.16;
      ctx.stroke();
    } else {
      const tailGrad = ctx.createLinearGradient(
        x - size * 0.2,
        y + size * 0.2,
        x + size * 0.2,
        y + size * 0.35,
      );
      tailGrad.addColorStop(0, bodyColor);
      tailGrad.addColorStop(0.5, bodyColorLight);
      tailGrad.addColorStop(1, bodyColor);
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = size * 0.12;
      ctx.stroke();
    }
  }
  ctx.restore();

  // Tail tip
  const tailTipX =
    x + size * 0.2 + Math.sin(time * 1.5 + Math.PI * 2) * size * 0.15;
  const tailTipY =
    y + size * 0.25 + Math.cos(time + Math.PI * 1.5) * size * 0.08;
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(tailTipX, tailTipY - size * 0.04);
  ctx.quadraticCurveTo(
    tailTipX + size * 0.12,
    tailTipY,
    tailTipX,
    tailTipY + size * 0.04,
  );
  ctx.closePath();
  ctx.fill();

  // Scale shimmer on tail
  for (let sc = 0; sc < 10; sc++) {
    const st = sc / 10;
    const scX =
      x +
      size * 0.4 * st -
      size * 0.2 +
      Math.sin(st * Math.PI * 2 + time * 1.5) * size * 0.15;
    const scY =
      y +
      size * 0.3 -
      st * size * 0.05 +
      Math.cos(st * Math.PI * 1.5 + time) * size * 0.08;
    const scaleAlpha = 0.15 + Math.sin(time * 3 + sc) * 0.1;
    ctx.fillStyle = `rgba(74, 222, 128, ${scaleAlpha})`;
    ctx.beginPath();
    ctx.arc(scX, scY, size * 0.015, 0, TAU);
    ctx.fill();
  }

  // === WRITHING BODY SHIMMER (rippling highlight along serpent body) ===
  for (let shimmer = 0; shimmer < 14; shimmer++) {
    const shT = shimmer / 14;
    const shimmerPhase = (time * 2.5 + shT * TAU) % TAU;
    const shimmerIntensity = (Math.sin(shimmerPhase) + 1) * 0.5;
    const shX = x + size * 0.4 * shT - size * 0.2 + Math.sin(shT * Math.PI * 2 + time * 1.5) * size * 0.15;
    const shY = y + size * 0.3 - shT * size * 0.05 + Math.cos(shT * Math.PI * 1.5 + time) * size * 0.08;
    const shimGrad = ctx.createRadialGradient(shX, shY, 0, shX, shY, size * 0.035);
    shimGrad.addColorStop(0, `rgba(150, 255, 180, ${shimmerIntensity * 0.35})`);
    shimGrad.addColorStop(0.5, `rgba(74, 222, 128, ${shimmerIntensity * 0.15})`);
    shimGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = shimGrad;
    ctx.beginPath();
    ctx.arc(shX, shY, size * 0.035, 0, TAU);
    ctx.fill();
  }

  // === TENDRILS hanging from body ===
  for (let tendril = 0; tendril < 5; tendril++) {
    const tendrilX = x - size * 0.2 + tendril * size * 0.1;
    const tendrilY = y + size * 0.2 + Math.sin(time + tendril) * size * 0.02;
    const tendrilAngle = Math.PI * 0.5 + Math.sin(time * 2 + tendril) * 0.2;
    drawAnimatedTendril(
      ctx,
      tendrilX,
      tendrilY,
      tendrilAngle,
      size,
      time,
      zoom,
      {
        length: 0.18,
        width: 0.015,
        segments: 5,
        waveSpeed: 2,
        waveAmt: 0.08,
        color: bodyColorDark,
        tipColor: "rgba(74, 222, 128, 0.6)",
        tipRadius: 0.01,
      },
    );
  }

  // === MAIN BODY (central mass, enhanced) ===
  const mainBodyGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.42);
  mainBodyGrad.addColorStop(0, bodyColorLight);
  mainBodyGrad.addColorStop(0.3, bodyColor);
  mainBodyGrad.addColorStop(0.6, bodyColorDark);
  mainBodyGrad.addColorStop(0.85, "#1a1a2e");
  mainBodyGrad.addColorStop(1, "#0a0a15");
  ctx.fillStyle = mainBodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + bodyUndulate, size * 0.38, size * 0.32, 0, 0, TAU);
  ctx.fill();

  // Lighter underbelly with luminescent glow
  const bellyGrad = ctx.createLinearGradient(
    x,
    y - size * 0.2,
    x,
    y + size * 0.3,
  );
  bellyGrad.addColorStop(0, "rgba(0,0,0,0)");
  bellyGrad.addColorStop(0.4, `rgba(200, 230, 200, 0.12)`);
  bellyGrad.addColorStop(0.7, `rgba(200, 230, 200, 0.25)`);
  bellyGrad.addColorStop(1, `rgba(200, 230, 200, 0.35)`);
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.06 + bodyUndulate, size * 0.28, size * 0.24, 0, 0, TAU);
  ctx.fill();

  // === BIOLUMINESCENT VEIN PATTERN ===
  setShadowBlur(ctx, 8 * zoom, "#22c55e");
  ctx.strokeStyle = `rgba(74, 222, 128, ${toxicPulse * 0.7})`;
  ctx.lineWidth = 2.5 * zoom;
  const veinPaths = [
    { sx: -0.15, sy: -0.15, cx: 0.05, cy: 0, ex: -0.1, ey: 0.2 },
    { sx: 0.15, sy: -0.15, cx: -0.05, cy: 0.05, ex: 0.12, ey: 0.2 },
    { sx: 0, sy: -0.2, cx: -0.1, cy: -0.05, ex: 0, ey: 0.15 },
    { sx: -0.25, sy: 0, cx: -0.1, cy: 0.1, ex: 0.05, ey: 0.18 },
    { sx: 0.25, sy: 0, cx: 0.1, cy: 0.1, ex: -0.05, ey: 0.18 },
  ];
  for (const vein of veinPaths) {
    ctx.beginPath();
    ctx.moveTo(x + vein.sx * size, y + vein.sy * size + bodyUndulate);
    ctx.quadraticCurveTo(
      x + vein.cx * size, y + vein.cy * size + bodyUndulate,
      x + vein.ex * size, y + vein.ey * size + bodyUndulate,
    );
    ctx.stroke();
  }
  // Bioluminescent nodes at vein junctions
  ctx.fillStyle = `rgba(74, 222, 128, ${toxicPulse * 0.9})`;
  for (const vein of veinPaths) {
    ctx.beginPath();
    ctx.arc(x + vein.cx * size, y + vein.cy * size + bodyUndulate, size * 0.015, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // Individually drawn overlapping scales on main body
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 7; col++) {
      const scaleX = x - size * 0.26 + col * size * 0.09 + (row % 2) * size * 0.045;
      const scaleY = y - size * 0.18 + row * size * 0.07 + bodyUndulate;
      const scaleW = size * 0.032;
      const scaleH = size * 0.038;
      const distFromCenter = Math.sqrt(Math.pow((scaleX - x) / (size * 0.38), 2) + Math.pow((scaleY - y) / (size * 0.32), 2));
      if (distFromCenter > 0.85) continue;
      const scaleShade = 0.12 + Math.sin(row * 1.3 + col * 0.7 + time * 0.5) * 0.06;
      ctx.fillStyle = `rgba(0, 0, 0, ${scaleShade})`;
      ctx.beginPath();
      ctx.moveTo(scaleX, scaleY - scaleH * 0.3);
      ctx.bezierCurveTo(scaleX - scaleW, scaleY, scaleX - scaleW * 0.7, scaleY + scaleH, scaleX, scaleY + scaleH * 0.7);
      ctx.bezierCurveTo(scaleX + scaleW * 0.7, scaleY + scaleH, scaleX + scaleW, scaleY, scaleX, scaleY - scaleH * 0.3);
      ctx.fill();
      ctx.strokeStyle = `rgba(0, 0, 0, ${scaleShade * 1.2})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(scaleX, scaleY - scaleH * 0.3);
      ctx.bezierCurveTo(scaleX - scaleW, scaleY, scaleX - scaleW * 0.7, scaleY + scaleH, scaleX, scaleY + scaleH * 0.7);
      ctx.bezierCurveTo(scaleX + scaleW * 0.7, scaleY + scaleH, scaleX + scaleW, scaleY, scaleX, scaleY - scaleH * 0.3);
      ctx.stroke();
      // Scale ridge highlight
      ctx.strokeStyle = `rgba(150, 255, 180, ${scaleShade * 0.3})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(scaleX - scaleW * 0.5, scaleY + scaleH * 0.1);
      ctx.quadraticCurveTo(scaleX, scaleY - scaleH * 0.15, scaleX + scaleW * 0.5, scaleY + scaleH * 0.1);
      ctx.stroke();
    }
  }

  // Iridescent scale shimmer (more prominent)
  for (let irid = 0; irid < 12; irid++) {
    const iridAngle = (irid * TAU) / 12 + time * 0.8;
    const iridR = size * 0.22;
    const iridX = x + Math.cos(iridAngle) * iridR;
    const iridY = y + Math.sin(iridAngle) * iridR * 0.75 + bodyUndulate;
    const iridAlpha = 0.12 + Math.sin(time * 4 + irid * 1.2) * 0.1;
    const hue = Math.floor(120 + Math.sin(time * 2 + irid) * 40);
    ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${iridAlpha})`;
    ctx.beginPath();
    ctx.arc(iridX, iridY, size * 0.022, 0, TAU);
    ctx.fill();
  }

  // === VENOM SACS (glowing pouches on sides) ===
  for (const side of [-1, 1]) {
    const sacX = x + side * size * 0.3;
    const sacY = y + size * 0.05 + bodyUndulate;
    const sacPulse = 0.5 + Math.sin(time * 2.5 + side) * 0.3;
    setShadowBlur(ctx, 8 * zoom, "#22c55e");
    const sacGrad = ctx.createRadialGradient(sacX, sacY, 0, sacX, sacY, size * 0.06);
    sacGrad.addColorStop(0, `rgba(180, 255, 150, ${sacPulse * 0.8})`);
    sacGrad.addColorStop(0.4, `rgba(74, 222, 128, ${sacPulse * 0.6})`);
    sacGrad.addColorStop(1, `rgba(34, 197, 94, ${sacPulse * 0.2})`);
    ctx.fillStyle = sacGrad;
    ctx.beginPath();
    ctx.ellipse(sacX, sacY, size * 0.05, size * 0.04, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(sacX, sacY, size * 0.05, size * 0.04, 0, 0, TAU);
    ctx.stroke();
    clearShadow(ctx);
  }

  // === DORSAL SPINE RIDGE along body ===
  for (let spine = 0; spine < 8; spine++) {
    const spineAngle = -Math.PI * 0.4 + spine * Math.PI * 0.12;
    const spineBaseX = x + Math.cos(spineAngle) * size * 0.28;
    const spineBaseY = y + Math.sin(spineAngle) * size * 0.22 + bodyUndulate;
    const spineH = size * (0.05 + Math.sin(spine * 1.7) * 0.02);
    const wobble = Math.sin(time * 3 + spine) * size * 0.005;
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(spineBaseX - size * 0.012, spineBaseY);
    ctx.lineTo(spineBaseX + wobble, spineBaseY - spineH);
    ctx.lineTo(spineBaseX + size * 0.012, spineBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(74, 222, 128, ${toxicPulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(spineBaseX + wobble, spineBaseY - spineH * 0.7, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // === THREE NECKS AND HEADS ===
  const neckConfigs = [
    { angle: -0.4, phaseOff: 0, headScale: 1.0 },
    { angle: 0.0, phaseOff: 1.2, headScale: 1.15 },
    { angle: 0.4, phaseOff: 2.4, headScale: 1.0 },
  ];

  for (let ni = 0; ni < neckConfigs.length; ni++) {
    const neck = neckConfigs[ni];
    const neckAngle = neck.angle + Math.sin(time * 2 + neck.phaseOff) * 0.15;
    const hs = neck.headScale;

    // Neck body (thick, segmented)
    const neckSegments = 8;
    const neckLen = size * 0.45 * hs;
    const neckBaseX = x + Math.sin(neck.angle) * size * 0.12;
    const neckBaseY = y - size * 0.15 + bodyUndulate;

    // Draw neck with multiple widths for taper
    ctx.save();
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      for (let seg = 0; seg <= neckSegments; seg++) {
        const t = seg / neckSegments;
        const wave =
          Math.sin(time * 3 + neck.phaseOff + t * Math.PI) * size * 0.06;
        const nx = neckBaseX + Math.sin(neckAngle) * neckLen * t + wave;
        const ny =
          neckBaseY -
          neckLen * t * 0.7 +
          Math.sin(t * Math.PI * 0.5 + time * 2) * size * 0.03;
        if (seg === 0) ctx.moveTo(nx, ny);
        else ctx.lineTo(nx, ny);
      }
      if (pass === 0) {
        ctx.strokeStyle = bodyColorDark;
        ctx.lineWidth = size * (0.1 * hs);
        ctx.lineCap = "round";
        ctx.stroke();
      } else {
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = size * (0.07 * hs);
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }
    ctx.restore();

    // Neck muscle/tendon detail and overlapping scales
    for (let nsc = 0; nsc < 7; nsc++) {
      const t = (nsc + 0.5) / 8;
      const wave =
        Math.sin(time * 3 + neck.phaseOff + t * Math.PI) * size * 0.06;
      const nscX = neckBaseX + Math.sin(neckAngle) * neckLen * t + wave;
      const nscY =
        neckBaseY -
        neckLen * t * 0.7 +
        Math.sin(t * Math.PI * 0.5 + time * 2) * size * 0.03;
      const neckWidth = size * 0.04 * hs * (1 - t * 0.3);
      // Overlapping scale ring
      ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(nscX, nscY, neckWidth, neckWidth * 0.6, neckAngle * 0.3, 0, TAU);
      ctx.stroke();
      // Visible tendon lines running along neck
      for (let tendon = 0; tendon < 3; tendon++) {
        const tOff = (tendon - 1) * neckWidth * 0.6;
        const nextT = Math.min(1, t + 0.12);
        const nextWave = Math.sin(time * 3 + neck.phaseOff + nextT * Math.PI) * size * 0.06;
        const nextX = neckBaseX + Math.sin(neckAngle) * neckLen * nextT + nextWave;
        const nextY = neckBaseY - neckLen * nextT * 0.7 + Math.sin(nextT * Math.PI * 0.5 + time * 2) * size * 0.03;
        ctx.strokeStyle = `rgba(40, 60, 40, 0.12)`;
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(nscX + tOff * Math.cos(neckAngle), nscY + tOff * Math.sin(neckAngle * 0.3));
        ctx.lineTo(nextX + tOff * Math.cos(neckAngle), nextY + tOff * Math.sin(neckAngle * 0.3));
        ctx.stroke();
      }
      // Muscle bulge contour
      if (nsc % 2 === 0) {
        ctx.strokeStyle = `rgba(30, 50, 30, 0.08)`;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.arc(nscX, nscY, neckWidth * 1.1, -Math.PI * 0.3, Math.PI * 0.3);
        ctx.stroke();
      }
    }

    // Head position
    const headWave = Math.sin(time * 3 + neck.phaseOff + Math.PI) * size * 0.06;
    const headX = neckBaseX + Math.sin(neckAngle) * neckLen + headWave;
    const headY =
      neckBaseY -
      neckLen * 0.7 +
      Math.sin(Math.PI * 0.5 + time * 2) * size * 0.03;

    // Per-head colored glow halo (each head pulses independently)
    const headGlowRGB = [
      [74, 222, 128],
      [34, 200, 180],
      [150, 222, 74],
    ];
    const hgc = headGlowRGB[ni];
    const headGlowPulse = 0.4 + Math.sin(time * 3 + ni * TAU / 3) * 0.3;
    const hGlowGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, size * 0.16 * hs);
    hGlowGrad.addColorStop(0, `rgba(${hgc[0]}, ${hgc[1]}, ${hgc[2]}, ${headGlowPulse * 0.45})`);
    hGlowGrad.addColorStop(0.4, `rgba(${hgc[0]}, ${hgc[1]}, ${hgc[2]}, ${headGlowPulse * 0.2})`);
    hGlowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = hGlowGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, size * 0.16 * hs, 0, TAU);
    ctx.fill();

    // Head shape
    const hGrad = ctx.createRadialGradient(
      headX,
      headY,
      0,
      headX,
      headY,
      size * 0.12 * hs,
    );
    hGrad.addColorStop(0, bodyColorLight);
    hGrad.addColorStop(0.5, bodyColor);
    hGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.ellipse(
      headX,
      headY,
      size * 0.11 * hs,
      size * 0.09 * hs,
      neckAngle * 0.3,
      0,
      TAU,
    );
    ctx.fill();

    // Per-head differentiation: horn count, eye size, jaw shape
    const headTraits = [
      { hornCount: 3, eyeScale: 0.9, jawWidth: 1.0, tongueLen: 1.0 },
      { hornCount: 5, eyeScale: 1.2, jawWidth: 1.15, tongueLen: 1.3 },
      { hornCount: 4, eyeScale: 0.85, jawWidth: 0.95, tongueLen: 0.9 },
    ];
    const traits = headTraits[ni];

    // Upper jaw / snout — angular serpent skull shape
    const snoutDir = neckAngle * 0.5;
    const snoutX = headX + Math.sin(snoutDir) * size * 0.06 * hs;
    const snoutY = headY + size * 0.05 * hs;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(snoutX - size * 0.07 * hs, snoutY - size * 0.02 * hs);
    ctx.bezierCurveTo(
      snoutX - size * 0.08 * hs, snoutY + size * 0.01 * hs,
      snoutX - size * 0.04 * hs, snoutY + size * 0.04 * hs,
      snoutX + Math.sin(snoutDir) * size * 0.04 * hs, snoutY + size * 0.04 * hs,
    );
    ctx.bezierCurveTo(
      snoutX + size * 0.04 * hs, snoutY + size * 0.04 * hs,
      snoutX + size * 0.08 * hs, snoutY + size * 0.01 * hs,
      snoutX + size * 0.07 * hs, snoutY - size * 0.02 * hs,
    );
    ctx.closePath();
    ctx.fill();
    // Upper jaw bone ridge
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(snoutX - size * 0.05 * hs, snoutY - size * 0.01 * hs);
    ctx.quadraticCurveTo(snoutX, snoutY - size * 0.03 * hs, snoutX + size * 0.05 * hs, snoutY - size * 0.01 * hs);
    ctx.stroke();

    // Lower jaw (opens independently) — distinct mandible shape
    const thisJaw = jawSnap * (ni === 1 ? 1.3 : 1);
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.moveTo(snoutX - size * 0.06 * hs * traits.jawWidth, snoutY + size * 0.01 * hs);
    ctx.bezierCurveTo(
      snoutX - size * 0.065 * hs * traits.jawWidth, snoutY + size * 0.03 * hs + thisJaw,
      snoutX - size * 0.03 * hs, snoutY + size * 0.05 * hs + thisJaw,
      snoutX, snoutY + size * 0.055 * hs + thisJaw,
    );
    ctx.bezierCurveTo(
      snoutX + size * 0.03 * hs, snoutY + size * 0.05 * hs + thisJaw,
      snoutX + size * 0.065 * hs * traits.jawWidth, snoutY + size * 0.03 * hs + thisJaw,
      snoutX + size * 0.06 * hs * traits.jawWidth, snoutY + size * 0.01 * hs,
    );
    ctx.closePath();
    ctx.fill();
    // Jaw hinge detail
    for (const jSide of [-1, 1]) {
      ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(snoutX + jSide * size * 0.06 * hs, snoutY, size * 0.008 * hs, 0, TAU);
      ctx.stroke();
    }

    // Mouth interior
    ctx.fillStyle = "#1a0a1a";
    ctx.beginPath();
    ctx.ellipse(
      snoutX,
      snoutY + thisJaw * 0.4 + size * 0.01 * hs,
      size * 0.05 * hs * traits.jawWidth,
      size * 0.015 * hs + thisJaw * 0.4,
      0, 0, TAU,
    );
    ctx.fill();

    // Upper fangs — large curved pair + smaller teeth row
    ctx.fillStyle = "#e8e0d0";
    for (const fSide of [-1, 1]) {
      // Large curved fang
      ctx.beginPath();
      ctx.moveTo(snoutX + fSide * size * 0.04 * hs, snoutY + size * 0.01 * hs);
      ctx.bezierCurveTo(
        snoutX + fSide * size * 0.042 * hs, snoutY + size * 0.025 * hs,
        snoutX + fSide * size * 0.038 * hs, snoutY + size * 0.04 * hs + thisJaw * 0.5,
        snoutX + fSide * size * 0.035 * hs, snoutY + size * 0.055 * hs + thisJaw * 0.7,
      );
      ctx.lineTo(snoutX + fSide * size * 0.025 * hs, snoutY + size * 0.01 * hs);
      ctx.closePath();
      ctx.fill();
    }
    // Smaller teeth row along upper jaw
    for (let tooth = 0; tooth < 4; tooth++) {
      const tX = snoutX + (tooth - 1.5) * size * 0.018 * hs;
      ctx.beginPath();
      ctx.moveTo(tX - size * 0.004 * hs, snoutY + size * 0.02 * hs);
      ctx.lineTo(tX, snoutY + size * 0.035 * hs + thisJaw * 0.3);
      ctx.lineTo(tX + size * 0.004 * hs, snoutY + size * 0.02 * hs);
      ctx.closePath();
      ctx.fill();
    }
    // Lower jaw teeth (pointing up)
    for (let tooth = 0; tooth < 3; tooth++) {
      const tX = snoutX + (tooth - 1) * size * 0.02 * hs;
      const tBaseY = snoutY + size * 0.04 * hs + thisJaw;
      ctx.beginPath();
      ctx.moveTo(tX - size * 0.004 * hs, tBaseY);
      ctx.lineTo(tX, tBaseY - size * 0.02 * hs);
      ctx.lineTo(tX + size * 0.004 * hs, tBaseY);
      ctx.closePath();
      ctx.fill();
    }

    // Forked tongue (flickering)
    if (thisJaw > size * 0.005 || Math.sin(time * 6 + ni * 2) > 0.3) {
      const tongueFlick = Math.sin(time * 8 + ni * 1.7) * size * 0.015;
      const tongueBaseX = snoutX + Math.sin(snoutDir) * size * 0.02;
      const tongueBaseY = snoutY + size * 0.03 * hs + thisJaw * 0.4;
      const tLen = size * 0.06 * hs * traits.tongueLen;
      ctx.strokeStyle = "#8a2040";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(tongueBaseX, tongueBaseY);
      ctx.quadraticCurveTo(tongueBaseX + tongueFlick, tongueBaseY + tLen * 0.5, tongueBaseX + tongueFlick * 0.5, tongueBaseY + tLen * 0.7);
      ctx.stroke();
      // Fork
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(tongueBaseX + tongueFlick * 0.5, tongueBaseY + tLen * 0.7);
      ctx.lineTo(tongueBaseX + tongueFlick * 0.5 - size * 0.012 * hs, tongueBaseY + tLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tongueBaseX + tongueFlick * 0.5, tongueBaseY + tLen * 0.7);
      ctx.lineTo(tongueBaseX + tongueFlick * 0.5 + size * 0.012 * hs, tongueBaseY + tLen);
      ctx.stroke();
    }

    // Dripping toxic bile
    for (let drip = 0; drip < 3; drip++) {
      const dripX = snoutX + (drip - 1) * size * 0.025 * hs;
      const dripPhase = (time * 2 + ni * 1.5 + drip * 0.8) % 2;
      const dripY =
        snoutY + size * 0.05 * hs + thisJaw + dripPhase * size * 0.08;
      const dripAlpha = Math.max(0, 1 - dripPhase * 0.55) * toxicPulse;
      ctx.fillStyle = `rgba(74, 222, 128, ${dripAlpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(dripX, dripY, size * 0.008 * hs, 0, TAU);
      ctx.fill();
    }

    // Glowing eyes — size varies per head
    for (const eSide of [-1, 1]) {
      const eyeX =
        headX + eSide * size * 0.05 * hs + Math.sin(neckAngle) * size * 0.02;
      const eyeY = headY - size * 0.03 * hs;
      const eScale = traits.eyeScale;
      ctx.fillStyle = "#0a0a15";
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, size * 0.025 * hs * eScale, size * 0.02 * hs * eScale, 0, 0, TAU);
      ctx.fill();
      setShadowBlur(ctx, 10 * zoom, "#22c55e");
      const eGrad = ctx.createRadialGradient(
        eyeX, eyeY, 0,
        eyeX, eyeY, size * 0.022 * hs * eScale,
      );
      eGrad.addColorStop(0, `rgba(200, 255, 200, ${toxicPulse})`);
      eGrad.addColorStop(0.5, `rgba(74, 222, 128, ${toxicPulse * 0.8})`);
      eGrad.addColorStop(1, `rgba(34, 197, 94, ${toxicPulse * 0.4})`);
      ctx.fillStyle = eGrad;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, size * 0.022 * hs * eScale, size * 0.017 * hs * eScale, 0, 0, TAU);
      ctx.fill();
      // Slit pupil
      ctx.fillStyle = `rgba(0, 40, 0, ${toxicPulse})`;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, size * 0.006 * hs * eScale, size * 0.016 * hs * eScale, 0, 0, TAU);
      ctx.fill();
      // Brow ridge above eye
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY - size * 0.01 * hs, size * 0.028 * hs * eScale, Math.PI + 0.3, TAU - 0.3);
      ctx.stroke();
      clearShadow(ctx);
    }

    // Head horns/spines — count varies per head
    ctx.fillStyle = bodyColorDark;
    const hornCount = traits.hornCount;
    for (let horn = 0; horn < hornCount; horn++) {
      const hornAngle = -Math.PI * 0.7 + horn * (Math.PI * 0.9 / hornCount) + neckAngle * 0.3;
      const hornLen = size * (0.06 + horn * 0.008 + Math.sin(horn * 2) * 0.015) * hs;
      const hornWobble = Math.sin(time * 3 + ni * 2 + horn) * size * 0.003;
      const hornWidth = size * 0.015 * hs;
      ctx.beginPath();
      ctx.moveTo(
        headX + Math.cos(hornAngle) * size * 0.09 * hs - Math.sin(hornAngle) * hornWidth,
        headY + Math.sin(hornAngle) * size * 0.07 * hs + Math.cos(hornAngle) * hornWidth,
      );
      ctx.quadraticCurveTo(
        headX + Math.cos(hornAngle) * (size * 0.09 * hs + hornLen * 0.6) + hornWobble,
        headY + Math.sin(hornAngle) * (size * 0.07 * hs + hornLen * 0.35),
        headX + Math.cos(hornAngle) * (size * 0.09 * hs + hornLen) + hornWobble,
        headY + Math.sin(hornAngle) * (size * 0.07 * hs + hornLen * 0.5),
      );
      ctx.quadraticCurveTo(
        headX + Math.cos(hornAngle) * (size * 0.09 * hs + hornLen * 0.6) + hornWobble,
        headY + Math.sin(hornAngle) * (size * 0.07 * hs + hornLen * 0.35) + hornWidth * 0.5,
        headX + Math.cos(hornAngle) * size * 0.09 * hs + Math.sin(hornAngle) * hornWidth,
        headY + Math.sin(hornAngle) * size * 0.07 * hs - Math.cos(hornAngle) * hornWidth,
      );
      ctx.closePath();
      ctx.fill();
      // Horn ridges
      ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
      ctx.lineWidth = 0.6 * zoom;
      for (let ridge = 0; ridge < 3; ridge++) {
        const rt = 0.3 + ridge * 0.2;
        const rx = headX + Math.cos(hornAngle) * (size * 0.09 * hs + hornLen * rt) + hornWobble * rt;
        const ry = headY + Math.sin(hornAngle) * (size * 0.07 * hs + hornLen * rt * 0.5);
        ctx.beginPath();
        ctx.arc(rx, ry, hornWidth * 0.6, hornAngle + Math.PI * 0.5, hornAngle - Math.PI * 0.5);
        ctx.stroke();
      }
    }

    // Neck frill/fin behind head
    ctx.fillStyle = `rgba(${ni === 1 ? "100, 60, 120" : "50, 80, 60"}, ${toxicPulse * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.06 * hs, headY + size * 0.03 * hs);
    ctx.quadraticCurveTo(
      headX - size * 0.1 * hs, headY - size * 0.08 * hs,
      headX, headY - size * 0.1 * hs,
    );
    ctx.quadraticCurveTo(
      headX + size * 0.1 * hs, headY - size * 0.08 * hs,
      headX + size * 0.06 * hs, headY + size * 0.03 * hs,
    );
    ctx.closePath();
    ctx.fill();
  }

  // === POISON CLOUD PARTICLES orbiting ===
  drawOrbitingDebris(ctx, x, y - size * 0.1, size, time, zoom, {
    count: 8,
    minRadius: 0.5,
    maxRadius: 0.75,
    speed: 0.8,
    particleSize: 0.025,
    color: "rgba(74, 222, 128, 0.5)",
    glowColor: "rgba(34, 197, 94, 0.3)",
    trailLen: 0.4,
  });

  // === ACADEMIC PAPER DEBRIS (floating fragments in toxic aura) ===
  for (let paper = 0; paper < 8; paper++) {
    const paperPhase = (time * 0.4 + paper * 0.6) % 3;
    const paperPX = x + Math.sin(time * 0.7 + paper * 1.8) * size * 0.5;
    const paperPY = y - size * 0.2 + paperPhase * size * 0.25;
    const paperAlpha = Math.max(0, 0.5 - paperPhase * 0.18);
    const paperRot = time * 1.5 + paper * 2.3;
    ctx.save();
    ctx.translate(paperPX, paperPY);
    ctx.rotate(paperRot);
    ctx.fillStyle = `rgba(255, 255, 240, ${paperAlpha})`;
    ctx.fillRect(-size * 0.015, -size * 0.01, size * 0.03, size * 0.02);
    ctx.strokeStyle = `rgba(200, 200, 180, ${paperAlpha * 0.6})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(-size * 0.015, -size * 0.01, size * 0.03, size * 0.02);
    ctx.strokeStyle = `rgba(100, 100, 80, ${paperAlpha * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.012, -size * 0.004);
    ctx.lineTo(size * 0.012, -size * 0.004);
    ctx.moveTo(-size * 0.012, size * 0.002);
    ctx.lineTo(size * 0.012, size * 0.002);
    ctx.stroke();
    ctx.restore();
  }

  // === TOXIC PULSE RINGS ===
  drawPulsingGlowRings(ctx, x, y, size * 0.55, time, zoom, {
    count: 2,
    speed: 2,
    color: "rgba(88, 28, 135, 0.25)",
    maxAlpha: 0.2,
    expansion: 0.35,
    lineWidth: 1.5,
  });
}

// ============================================================================
// 3. SPHINX GUARDIAN — THE MIDTERM SPHINX (Desert Boss)
//    Colossal golden sphinx. Size 54. Gold and sandstone.
// ============================================================================

export function drawSphinxGuardianEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const sin2 = Math.sin(time * 2);
  const sin25 = Math.sin(time * 2.5);
  const sin3 = Math.sin(time * 3);
  const sin4 = Math.sin(time * 4);
  const sin5 = Math.sin(time * 5);
  const sin6 = Math.sin(time * 6);
  const cos2 = Math.cos(time * 2);
  const cos3 = Math.cos(time * 3);
  const breathe = sin2 * size * 0.02;
  const goldPulse = 0.5 + sin3 * 0.35;
  const wingFold = 0.3 + sin25 * 0.05;
  const pawShift = sin3 * size * 0.04;
  const thirdEyePulse = 0.6 + sin4 * 0.4;
  const sandSwirl = time * 0.8;
  const heatShimmer = sin5 * size * 0.005;

  // === HEAT SHIMMER / GROUND DISTORTION ===
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let shimmer = 0; shimmer < 3; shimmer++) {
    const shimmerY = y + size * 0.45 + shimmer * size * 0.03;
    const shimmerX = heatShimmer * (shimmer + 1) * 3;
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.ellipse(x + shimmerX, shimmerY, size * 0.6, size * 0.015, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // === GOLDEN RADIANCE AURA (massive layered) ===
  const outerAuraGrad = ctx.createRadialGradient(x, y + size * 0.2, size * 0.8, x, y + size * 0.2, size * 1.6);
  outerAuraGrad.addColorStop(0, `rgba(217, 119, 6, ${goldPulse * 0.06})`);
  outerAuraGrad.addColorStop(0.5, `rgba(180, 83, 9, ${goldPulse * 0.03})`);
  outerAuraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = outerAuraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.2, size * 1.6, size * 1.6 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  const auraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.2,
    0,
    x,
    y + size * 0.2,
    size * 1.2,
  );
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${goldPulse * 0.25})`);
  auraGrad.addColorStop(0.2, `rgba(251, 191, 36, ${goldPulse * 0.18})`);
  auraGrad.addColorStop(0.4, `rgba(217, 119, 6, ${goldPulse * 0.12})`);
  auraGrad.addColorStop(0.65, `rgba(180, 83, 9, ${goldPulse * 0.06})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.2, size * 1.2, size * 1.2 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Pulsing glow rings (isometric)
  ctx.save();
  ctx.translate(x, y + size * 0.4);
  ctx.scale(1, ISO_Y_RATIO);
  drawPulsingGlowRings(ctx, 0, 0, size * 0.65, time, zoom, {
    count: 3,
    speed: 1.2,
    color: "rgba(251, 191, 36, 0.2)",
    maxAlpha: 0.2,
    expansion: 0.35,
    lineWidth: 1.5,
  });
  ctx.restore();

  // === TIME DISTORTION EFFECT (concentric pulsing rings) ===
  ctx.save();
  ctx.translate(x, y + size * 0.1);
  ctx.scale(1, ISO_Y_RATIO);
  for (let distRing = 0; distRing < 3; distRing++) {
    const distPhase = (time * 0.6 + distRing * 0.8) % TAU;
    const distExpand = (Math.sin(distPhase) + 1) * 0.5;
    const distR = size * (0.45 + distExpand * 0.3);
    const distAlpha = Math.max(0, 0.18 - distExpand * 0.18) * (1 - distRing * 0.25);
    ctx.strokeStyle = `rgba(251, 191, 36, ${distAlpha})`;
    ctx.lineWidth = (2 - distRing * 0.4) * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, distR, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(217, 119, 6, ${distAlpha * 0.5})`;
    ctx.lineWidth = (1 - distRing * 0.2) * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, distR + size * 0.01, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();

  // === RIDDLE HIEROGLYPH CIRCLES (rotating symbol rings) ===
  ctx.save();
  ctx.translate(x, y - size * 0.05);
  const hieroglyphs = ["\u25B3", "\u25C7", "\u25CB", "\u2625", "\u25C8", "\u25BD", "\u2B21", "\u2726"];
  for (let hRing = 0; hRing < 3; hRing++) {
    const hRingR = size * (0.52 + hRing * 0.14);
    const hRingSpeed = (hRing % 2 === 0 ? 1 : -1) * 0.4;
    const hRingOffset = time * hRingSpeed + hRing * 1.2;
    const symbolCount = 8 + hRing * 4;
    const hRingAlpha = 0.3 + Math.sin(time * 2 + hRing) * 0.15;
    ctx.font = `${size * 0.028}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(251, 191, 36, ${hRingAlpha})`;
    for (let sym = 0; sym < symbolCount; sym++) {
      const symAngle = (sym * TAU) / symbolCount + hRingOffset;
      const sx = Math.cos(symAngle) * hRingR;
      const sy = Math.sin(symAngle) * hRingR * ISO_Y_RATIO;
      ctx.fillText(hieroglyphs[sym % hieroglyphs.length], sx, sy);
    }
    ctx.strokeStyle = `rgba(251, 191, 36, ${hRingAlpha * 0.25})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, hRingR, hRingR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();

  // === ORBITING HIEROGLYPHIC SYMBOLS ===
  drawShiftingSegments(ctx, x, y - size * 0.1, size, time, zoom, {
    count: 8,
    orbitRadius: 0.65,
    segmentSize: 0.04,
    orbitSpeed: 0.6,
    bobSpeed: 2,
    bobAmt: 0.03,
    color: "#fbbf24",
    colorAlt: "#d97706",
    shape: "diamond",
    rotateWithOrbit: true,
  });

  // === SAND PARTICLES SWIRLING ===
  drawOrbitingDebris(ctx, x, y + size * 0.1, size, time, zoom, {
    count: 14,
    minRadius: 0.55,
    maxRadius: 0.9,
    speed: 0.5,
    particleSize: 0.015,
    color: "#d4a574",
    glowColor: "rgba(251, 191, 36, 0.2)",
    trailLen: 0.5,
  });

  // === ENHANCED SAND SWIRL (golden dust vortex at base) ===
  ctx.save();
  ctx.translate(x, y + size * 0.42);
  ctx.scale(1, ISO_Y_RATIO);
  for (let dust = 0; dust < 16; dust++) {
    const dustAngle = (dust * TAU) / 16 + sandSwirl + Math.sin(dust * 1.7) * 0.3;
    const dustR = size * (0.3 + Math.sin(time * 1.2 + dust * 0.8) * 0.1);
    const dustX = Math.cos(dustAngle) * dustR;
    const dustY = Math.sin(dustAngle) * dustR;
    const dustAlpha = 0.25 + Math.sin(time * 2 + dust) * 0.15;
    const dustSz = size * (0.008 + Math.sin(dust * 2.3) * 0.003);
    const dustGrad = ctx.createRadialGradient(dustX, dustY, 0, dustX, dustY, dustSz * 3);
    dustGrad.addColorStop(0, `rgba(251, 191, 36, ${dustAlpha * 0.5})`);
    dustGrad.addColorStop(0.5, `rgba(212, 165, 116, ${dustAlpha * 0.3})`);
    dustGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = dustGrad;
    ctx.beginPath();
    ctx.arc(dustX, dustY, dustSz * 3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(212, 165, 116, ${dustAlpha})`;
    ctx.beginPath();
    ctx.arc(dustX, dustY, dustSz, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // === STONE WINGS (folded against body) ===
  for (const side of [-1, 1] as const) {
    ctx.save();
    ctx.translate(x + side * size * 0.3, y - size * 0.05 + breathe);
    ctx.rotate(side * wingFold);
    const wingGrad = ctx.createLinearGradient(
      0,
      -size * 0.3,
      side * size * 0.35,
      size * 0.1,
    );
    wingGrad.addColorStop(0, "#c4a35a");
    wingGrad.addColorStop(0.4, "#b8963e");
    wingGrad.addColorStop(0.8, "#9a7d2e");
    wingGrad.addColorStop(1, "#7a6020");
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.1);
    ctx.quadraticCurveTo(
      side * size * 0.15,
      -size * 0.35,
      side * size * 0.35,
      -size * 0.28,
    );
    ctx.quadraticCurveTo(
      side * size * 0.4,
      -size * 0.15,
      side * size * 0.38,
      size * 0.05,
    );
    ctx.quadraticCurveTo(side * size * 0.25, size * 0.15, 0, size * 0.12);
    ctx.closePath();
    ctx.fill();
    // Individual feather layers (primary feathers)
    for (let f = 0; f < 8; f++) {
      const ft = (f + 0.5) / 8;
      const featherBaseX = side * size * ft * 0.12;
      const featherBaseY = -size * 0.06 + f * size * 0.025;
      const featherTipX = side * size * ft * 0.4;
      const featherTipY = -size * 0.28 + f * size * 0.05;
      const featherW = size * (0.025 - f * 0.001);
      const fShade = 0.12 + f * 0.02;
      // Feather shape (pointed oval)
      ctx.fillStyle = `rgba(122, 96, 32, ${0.3 + fShade})`;
      ctx.beginPath();
      ctx.moveTo(featherBaseX, featherBaseY);
      ctx.bezierCurveTo(
        (featherBaseX + featherTipX) * 0.5 - featherW * side * 0.5, (featherBaseY + featherTipY) * 0.5 - featherW,
        featherTipX - featherW * side * 0.3, featherTipY + featherW * 0.5,
        featherTipX, featherTipY,
      );
      ctx.bezierCurveTo(
        featherTipX + featherW * side * 0.3, featherTipY + featherW * 0.5,
        (featherBaseX + featherTipX) * 0.5 + featherW * side * 0.5, (featherBaseY + featherTipY) * 0.5 + featherW,
        featherBaseX, featherBaseY,
      );
      ctx.fill();
      // Feather rachis (central shaft)
      ctx.strokeStyle = "#6a5018";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(featherBaseX, featherBaseY);
      ctx.lineTo(featherTipX, featherTipY);
      ctx.stroke();
      // Barb lines (3 per feather)
      ctx.strokeStyle = `rgba(106, 80, 24, 0.25)`;
      ctx.lineWidth = 0.5 * zoom;
      for (let barb = 0; barb < 3; barb++) {
        const bt = 0.25 + barb * 0.25;
        const bx = featherBaseX + (featherTipX - featherBaseX) * bt;
        const by = featherBaseY + (featherTipY - featherBaseY) * bt;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + featherW * side * 0.6, by - featherW * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + featherW * side * 0.6, by + featherW * 0.4);
        ctx.stroke();
      }
    }
    // Secondary (covert) feathers — shorter, closer to body
    for (let sf = 0; sf < 5; sf++) {
      const sft = (sf + 0.5) / 5;
      const sfx = side * size * sft * 0.15;
      const sfy = -size * 0.02 + sf * size * 0.025;
      const stx = side * size * sft * 0.28;
      const sty = -size * 0.12 + sf * size * 0.035;
      ctx.fillStyle = `rgba(154, 125, 46, 0.35)`;
      ctx.beginPath();
      ctx.moveTo(sfx, sfy);
      ctx.quadraticCurveTo((sfx + stx) * 0.5 + side * size * 0.01, (sfy + sty) * 0.5 - size * 0.01, stx, sty);
      ctx.quadraticCurveTo((sfx + stx) * 0.5 - side * size * 0.01, (sfy + sty) * 0.5 + size * 0.01, sfx, sfy);
      ctx.fill();
    }
    // Golden edge highlight
    setShadowBlur(ctx, 4 * zoom, "#fbbf24");
    ctx.strokeStyle = `rgba(251, 191, 36, ${goldPulse * 0.5})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.1);
    ctx.quadraticCurveTo(
      side * size * 0.15,
      -size * 0.35,
      side * size * 0.35,
      -size * 0.28,
    );
    ctx.stroke();
    clearShadow(ctx);
    ctx.restore();
  }

  // === MASSIVE LION BODY (enhanced) ===
  const bodyGrad = ctx.createRadialGradient(
    x,
    y + size * 0.08,
    0,
    x,
    y + size * 0.08,
    size * 0.52,
  );
  bodyGrad.addColorStop(0, "#d4b870");
  bodyGrad.addColorStop(0.3, "#c4a35a");
  bodyGrad.addColorStop(0.6, "#b8963e");
  bodyGrad.addColorStop(0.85, "#9a7d2e");
  bodyGrad.addColorStop(1, "#7a6020");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1 + breathe, size * 0.5, size * 0.36, 0, 0, TAU);
  ctx.fill();

  // Enhanced muscle definition — lion haunches, shoulder, ribcage
  ctx.strokeStyle = "#8a6e25";
  ctx.lineWidth = 2 * zoom;
  // Shoulder muscles
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.05 + breathe);
  ctx.bezierCurveTo(x - size * 0.28, y + size * 0.03 + breathe, x - size * 0.2, y + size * 0.12 + breathe, x - size * 0.1, y + size * 0.18 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 0.05 + breathe);
  ctx.bezierCurveTo(x + size * 0.28, y + size * 0.03 + breathe, x + size * 0.2, y + size * 0.12 + breathe, x + size * 0.1, y + size * 0.18 + breathe);
  ctx.stroke();
  // Haunch muscle curves (rear)
  ctx.lineWidth = 1.8 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.35, y + size * 0.05 + breathe);
    ctx.bezierCurveTo(x + side * size * 0.38, y + size * 0.12 + breathe, x + side * size * 0.35, y + size * 0.22 + breathe, x + side * size * 0.28, y + size * 0.3 + breathe);
    ctx.stroke();
  }
  // Ribcage contour lines
  ctx.strokeStyle = "rgba(138, 110, 37, 0.3)";
  ctx.lineWidth = 1.2 * zoom;
  for (let rib = 0; rib < 4; rib++) {
    const ribY = y - size * 0.02 + rib * size * 0.05 + breathe;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, ribY);
    ctx.quadraticCurveTo(x, ribY + size * 0.015, x + size * 0.2, ribY);
    ctx.stroke();
  }
  // Spine line
  ctx.strokeStyle = "#8a6e25";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.02 + breathe);
  ctx.bezierCurveTo(x - size * 0.15, y - size * 0.05 + breathe, x + size * 0.15, y - size * 0.05 + breathe, x + size * 0.35, y + size * 0.02 + breathe);
  ctx.stroke();

  // Sandstone texture cracks
  ctx.strokeStyle = "#7a6020";
  ctx.lineWidth = 1.5 * zoom;
  for (let crack = 0; crack < 8; crack++) {
    const crackX = x - size * 0.33 + crack * size * 0.1;
    const crackYstart = y - size * 0.1 + breathe + Math.sin(crack * 2.1) * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(crackX, crackYstart);
    ctx.quadraticCurveTo(
      crackX + size * 0.02, crackYstart + size * 0.12,
      crackX - size * 0.015, crackYstart + size * 0.22,
    );
    ctx.stroke();
  }

  // Hieroglyph carvings on body flanks
  ctx.strokeStyle = "rgba(122, 96, 32, 0.4)";
  ctx.lineWidth = 1 * zoom;
  // Ankh symbol (left flank)
  const hgX = x - size * 0.22;
  const hgY = y + size * 0.02 + breathe;
  ctx.beginPath();
  ctx.ellipse(hgX, hgY - size * 0.02, size * 0.012, size * 0.016, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hgX, hgY);
  ctx.lineTo(hgX, hgY + size * 0.04);
  ctx.moveTo(hgX - size * 0.015, hgY + size * 0.012);
  ctx.lineTo(hgX + size * 0.015, hgY + size * 0.012);
  ctx.stroke();
  // Eye of Horus (right flank)
  const ehX = x + size * 0.22;
  const ehY = y + size * 0.02 + breathe;
  ctx.beginPath();
  ctx.ellipse(ehX, ehY, size * 0.015, size * 0.01, 0, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ehX + size * 0.015, ehY);
  ctx.quadraticCurveTo(ehX + size * 0.03, ehY + size * 0.005, ehX + size * 0.035, ehY + size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ehX, ehY + size * 0.01);
  ctx.quadraticCurveTo(ehX - size * 0.01, ehY + size * 0.025, ehX - size * 0.005, ehY + size * 0.04);
  ctx.stroke();
  // Cartouche border with hieroglyphs inside
  ctx.strokeStyle = "rgba(122, 96, 32, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.18 + breathe, size * 0.06, size * 0.025, 0, 0, TAU);
  ctx.stroke();
  ctx.font = `${size * 0.02}px serif`;
  ctx.fillStyle = "rgba(122, 96, 32, 0.3)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u25B3\u25C7\u25CB", x, y + size * 0.18 + breathe);

  // === CURLED TAIL (behind body) ===
  const tailBaseX = x + size * 0.4;
  const tailBaseY = y + size * 0.15 + breathe;
  const tailCurl = Math.sin(time * 2) * 0.2;
  ctx.save();
  ctx.translate(tailBaseX, tailBaseY);
  ctx.rotate(tailCurl);
  const tailGrad = ctx.createLinearGradient(0, 0, size * 0.2, -size * 0.15);
  tailGrad.addColorStop(0, "#b8963e");
  tailGrad.addColorStop(0.7, "#9a7d2e");
  tailGrad.addColorStop(1, "#7a6020");
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.025);
  ctx.bezierCurveTo(size * 0.08, -size * 0.04, size * 0.16, -size * 0.12, size * 0.2, -size * 0.18);
  ctx.bezierCurveTo(size * 0.22, -size * 0.22, size * 0.18, -size * 0.24, size * 0.14, -size * 0.22);
  ctx.bezierCurveTo(size * 0.12, -size * 0.2, size * 0.14, -size * 0.15, size * 0.16, -size * 0.12);
  ctx.bezierCurveTo(size * 0.12, -size * 0.06, size * 0.06, -size * 0.01, 0, size * 0.025);
  ctx.closePath();
  ctx.fill();
  // Tail tuft
  ctx.fillStyle = "#7a6020";
  ctx.beginPath();
  ctx.ellipse(size * 0.16, -size * 0.2, size * 0.025, size * 0.02, tailCurl + 0.5, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Golden veins in cracks (enhanced network)
  setShadowBlur(ctx, 8 * zoom, "#fbbf24");
  ctx.strokeStyle = `rgba(251, 191, 36, ${goldPulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  const goldVeins = [
    { sx: -0.2, sy: -0.05, cx: -0.1, cy: 0.08, ex: 0.05, ey: 0.15 },
    { sx: 0.2, sy: -0.05, cx: 0.1, cy: 0.08, ex: -0.05, ey: 0.15 },
    { sx: -0.1, sy: -0.12, cx: 0, cy: 0, ex: 0.1, ey: 0.1 },
    { sx: 0, sy: -0.15, cx: 0.08, cy: -0.05, ex: 0.15, ey: 0.1 },
  ];
  for (const gv of goldVeins) {
    ctx.beginPath();
    ctx.moveTo(x + gv.sx * size, y + gv.sy * size + breathe);
    ctx.quadraticCurveTo(x + gv.cx * size, y + gv.cy * size + breathe, x + gv.ex * size, y + gv.ey * size + breathe);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(251, 191, 36, ${goldPulse * 0.8})`;
  for (const gv of goldVeins) {
    ctx.beginPath();
    ctx.arc(x + gv.cx * size, y + gv.cy * size + breathe, size * 0.01, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // === ORNATE PECTORAL COLLAR (Egyptian-style) ===
  const pectoralY = y - size * 0.15 + breathe;
  for (let ring = 0; ring < 3; ring++) {
    const ringW = size * (0.32 - ring * 0.06);
    const ringH = size * (0.08 + ring * 0.03);
    const ringGrad = ctx.createLinearGradient(x - ringW, pectoralY, x + ringW, pectoralY);
    ringGrad.addColorStop(0, "#7a6020");
    ringGrad.addColorStop(0.3, "#fbbf24");
    ringGrad.addColorStop(0.5, "#d4b870");
    ringGrad.addColorStop(0.7, "#fbbf24");
    ringGrad.addColorStop(1, "#7a6020");
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.ellipse(x, pectoralY + ring * size * 0.06, ringW, ringH, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#9a7d2e";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
  }
  // Pectoral gems
  const pGemColors = ["#ef4444", "#3b82f6", "#22c55e", "#fbbf24", "#ef4444", "#3b82f6"];
  for (let gem = 0; gem < 6; gem++) {
    const gemAngle = -Math.PI * 0.4 + gem * Math.PI * 0.16;
    const gemR = size * 0.26;
    const gx = x + Math.cos(gemAngle) * gemR;
    const gy = pectoralY + size * 0.02 + Math.sin(gemAngle) * size * 0.04;
    ctx.fillStyle = pGemColors[gem];
    ctx.beginPath();
    ctx.arc(gx, gy, size * 0.012, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${goldPulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(gx - size * 0.003, gy - size * 0.003, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // === FRONT PAWS ===
  for (const side of [-1, 1]) {
    const pawX = x + side * size * 0.28 + pawShift * side;
    const pawBaseY = y + size * 0.35 + breathe;
    // Foreleg
    const legGrad = ctx.createLinearGradient(
      pawX - size * 0.05,
      pawBaseY - size * 0.25,
      pawX + size * 0.05,
      pawBaseY,
    );
    legGrad.addColorStop(0, "#c4a35a");
    legGrad.addColorStop(0.6, "#b8963e");
    legGrad.addColorStop(1, "#9a7d2e");
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.moveTo(pawX - size * 0.06, pawBaseY - size * 0.25);
    ctx.quadraticCurveTo(
      pawX - size * 0.07,
      pawBaseY - size * 0.1,
      pawX - size * 0.08,
      pawBaseY + size * 0.06,
    );
    ctx.lineTo(pawX + size * 0.08, pawBaseY + size * 0.06);
    ctx.quadraticCurveTo(
      pawX + size * 0.07,
      pawBaseY - size * 0.1,
      pawX + size * 0.06,
      pawBaseY - size * 0.25,
    );
    ctx.closePath();
    ctx.fill();
    // Paw
    ctx.fillStyle = "#9a7d2e";
    ctx.beginPath();
    ctx.ellipse(
      pawX,
      pawBaseY + size * 0.08,
      size * 0.1,
      size * 0.1 * ISO_Y_RATIO,
      0,
      0,
      TAU,
    );
    ctx.fill();
    // Individual toes with pad detail
    for (let toe = 0; toe < 4; toe++) {
      const toeX = pawX - size * 0.045 + toe * size * 0.032;
      const toeY = pawBaseY + size * 0.07;
      // Toe shape
      ctx.fillStyle = "#a58a3a";
      ctx.beginPath();
      ctx.ellipse(toeX, toeY, size * 0.016, size * 0.012, (toe - 1.5) * 0.15, 0, TAU);
      ctx.fill();
      // Toe pad
      ctx.fillStyle = "#8a7028";
      ctx.beginPath();
      ctx.ellipse(toeX, toeY + size * 0.005, size * 0.009, size * 0.006, 0, 0, TAU);
      ctx.fill();
      // Claw
      ctx.fillStyle = "#5a4010";
      ctx.beginPath();
      ctx.moveTo(toeX - size * 0.004, toeY + size * 0.01);
      ctx.lineTo(toeX, toeY + size * 0.025);
      ctx.lineTo(toeX + size * 0.004, toeY + size * 0.01);
      ctx.closePath();
      ctx.fill();
    }
    // Main pad
    ctx.fillStyle = "#8a7028";
    ctx.beginPath();
    ctx.ellipse(pawX, pawBaseY + size * 0.065, size * 0.04, size * 0.02, 0, 0, TAU);
    ctx.fill();
  }

  // Back legs (partially visible behind body)
  for (const side of [-1, 1]) {
    const bLegX = x + side * size * 0.2;
    const bLegY = y + size * 0.2 + breathe;
    ctx.fillStyle = "#9a7d2e";
    ctx.beginPath();
    ctx.moveTo(bLegX - size * 0.05, bLegY);
    ctx.quadraticCurveTo(
      bLegX - size * 0.07,
      bLegY + size * 0.15,
      bLegX - size * 0.06,
      bLegY + size * 0.28,
    );
    ctx.lineTo(bLegX + size * 0.06, bLegY + size * 0.28);
    ctx.quadraticCurveTo(
      bLegX + size * 0.07,
      bLegY + size * 0.15,
      bLegX + size * 0.05,
      bLegY,
    );
    ctx.closePath();
    ctx.fill();
    // Paw
    ctx.fillStyle = "#7a6020";
    ctx.beginPath();
    ctx.ellipse(bLegX, bLegY + size * 0.3, size * 0.08, size * 0.08 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.fill();
  }

  // === ANKH held in right paw ===
  ctx.save();
  ctx.translate(x + size * 0.34 + pawShift, y + size * 0.2 + breathe);
  const ankhRot = sin3 * 0.05 + (isAttacking ? attackIntensity * 0.3 : 0);
  ctx.rotate(ankhRot);
  setShadowBlur(ctx, 8 * zoom, "#fbbf24");
  ctx.strokeStyle = `rgba(251, 191, 36, ${goldPulse * 0.9})`;
  ctx.lineWidth = 3 * zoom;
  // Ankh loop
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.12, size * 0.035, size * 0.045, 0, 0, TAU);
  ctx.stroke();
  // Ankh stem
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.075);
  ctx.lineTo(0, size * 0.08);
  ctx.stroke();
  // Ankh crossbar
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.03);
  ctx.lineTo(size * 0.04, -size * 0.03);
  ctx.stroke();
  clearShadow(ctx);
  // Ankh glow core
  ctx.fillStyle = `rgba(255, 230, 150, ${goldPulse * 0.6})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.12, size * 0.02, 0, TAU);
  ctx.fill();
  ctx.restore();

  // === PHARAOH HEAD with golden headdress (nemes) ===
  const headX = x;
  const headY = y - size * 0.32 + breathe;

  // Nemes headdress (draped cloth shape)
  const nemesGrad = ctx.createLinearGradient(
    headX - size * 0.2,
    headY - size * 0.15,
    headX + size * 0.2,
    headY + size * 0.15,
  );
  nemesGrad.addColorStop(0, "#c4a35a");
  nemesGrad.addColorStop(0.3, "#fbbf24");
  nemesGrad.addColorStop(0.5, "#c4a35a");
  nemesGrad.addColorStop(0.7, "#fbbf24");
  nemesGrad.addColorStop(1, "#c4a35a");
  ctx.fillStyle = nemesGrad;
  // Main nemes shape
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.2);
  ctx.quadraticCurveTo(
    headX - size * 0.2,
    headY - size * 0.15,
    headX - size * 0.22,
    headY,
  );
  ctx.quadraticCurveTo(
    headX - size * 0.24,
    headY + size * 0.15,
    headX - size * 0.18,
    headY + size * 0.25,
  );
  ctx.lineTo(headX - size * 0.1, headY + size * 0.22);
  ctx.quadraticCurveTo(
    headX,
    headY + size * 0.12,
    headX + size * 0.1,
    headY + size * 0.22,
  );
  ctx.lineTo(headX + size * 0.18, headY + size * 0.25);
  ctx.quadraticCurveTo(
    headX + size * 0.24,
    headY + size * 0.15,
    headX + size * 0.22,
    headY,
  );
  ctx.quadraticCurveTo(
    headX + size * 0.2,
    headY - size * 0.15,
    headX,
    headY - size * 0.2,
  );
  ctx.closePath();
  ctx.fill();

  // Nemes stripes
  ctx.strokeStyle = "#9a7d2e";
  ctx.lineWidth = 1.5 * zoom;
  for (let stripe = 0; stripe < 8; stripe++) {
    const st = -0.18 + stripe * 0.05;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.2, headY + st * size);
    ctx.quadraticCurveTo(
      headX,
      headY + st * size - size * 0.015,
      headX + size * 0.2,
      headY + st * size,
    );
    ctx.stroke();
  }

  // Face
  const faceGrad = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    size * 0.14,
  );
  faceGrad.addColorStop(0, "#d4a574");
  faceGrad.addColorStop(0.5, "#c4935a");
  faceGrad.addColorStop(1, "#a07840");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.02, size * 0.13, size * 0.14, 0, 0, TAU);
  ctx.fill();

  // Facial features
  // Kohl-lined eyes
  for (const side of [-1, 1]) {
    const eyeX = headX + side * size * 0.05;
    const eyeY = headY;
    // Kohl outline
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.035, size * 0.02, side * 0.1, 0, TAU);
    ctx.stroke();
    // Eye white
    ctx.fillStyle = "#f0e6d0";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.03, size * 0.017, 0, 0, TAU);
    ctx.fill();
    // Supernatural iris
    setShadowBlur(ctx, 8 * zoom, "#fbbf24");
    const irisGrad = ctx.createRadialGradient(
      eyeX,
      eyeY,
      0,
      eyeX,
      eyeY,
      size * 0.02,
    );
    irisGrad.addColorStop(0, `rgba(255, 230, 100, ${goldPulse})`);
    irisGrad.addColorStop(0.5, `rgba(251, 191, 36, ${goldPulse * 0.9})`);
    irisGrad.addColorStop(1, `rgba(180, 120, 20, ${goldPulse * 0.7})`);
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.02, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
    // Pupil
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.008, 0, TAU);
    ctx.fill();
    // Kohl wing
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX + side * size * 0.035, eyeY);
    ctx.lineTo(eyeX + side * size * 0.06, eyeY - size * 0.01);
    ctx.stroke();

    // Eye of judgment radiance halo
    const judgmentGrad = ctx.createRadialGradient(eyeX, eyeY, size * 0.005, eyeX, eyeY, size * 0.07);
    judgmentGrad.addColorStop(0, `rgba(255, 255, 200, ${goldPulse * 0.5})`);
    judgmentGrad.addColorStop(0.3, `rgba(251, 191, 36, ${goldPulse * 0.25})`);
    judgmentGrad.addColorStop(0.6, `rgba(217, 119, 6, ${goldPulse * 0.1})`);
    judgmentGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = judgmentGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.07, 0, TAU);
    ctx.fill();
    // Judgment beam lines radiating from eye
    ctx.strokeStyle = `rgba(251, 191, 36, ${goldPulse * 0.2})`;
    ctx.lineWidth = 1 * zoom;
    for (let beam = 0; beam < 6; beam++) {
      const beamAngle = (beam * TAU) / 6 + time * 0.5 + side;
      ctx.beginPath();
      ctx.moveTo(eyeX + Math.cos(beamAngle) * size * 0.025, eyeY + Math.sin(beamAngle) * size * 0.02);
      ctx.lineTo(eyeX + Math.cos(beamAngle) * size * 0.07, eyeY + Math.sin(beamAngle) * size * 0.06);
      ctx.stroke();
    }
  }

  // Nose
  ctx.strokeStyle = "#8a6840";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX, headY + size * 0.02);
  ctx.lineTo(headX - size * 0.015, headY + size * 0.06);
  ctx.lineTo(headX + size * 0.015, headY + size * 0.06);
  ctx.stroke();

  // Lips
  ctx.strokeStyle = "#9a6840";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.04, headY + size * 0.09);
  ctx.quadraticCurveTo(
    headX,
    headY + size * 0.085,
    headX + size * 0.04,
    headY + size * 0.09,
  );
  ctx.stroke();

  // False beard (pharaoh beard)
  const beardGrad = ctx.createLinearGradient(
    headX,
    headY + size * 0.12,
    headX,
    headY + size * 0.3,
  );
  beardGrad.addColorStop(0, "#c4a35a");
  beardGrad.addColorStop(0.5, "#b8963e");
  beardGrad.addColorStop(1, "#9a7d2e");
  ctx.fillStyle = beardGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.025, headY + size * 0.12);
  ctx.lineTo(headX - size * 0.02, headY + size * 0.28);
  ctx.lineTo(headX + size * 0.02, headY + size * 0.28);
  ctx.lineTo(headX + size * 0.025, headY + size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Beard ridges
  ctx.strokeStyle = "#7a6020";
  ctx.lineWidth = 1 * zoom;
  for (let br = 0; br < 5; br++) {
    const brY = headY + size * 0.14 + br * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.022, brY);
    ctx.lineTo(headX + size * 0.022, brY);
    ctx.stroke();
  }

  // Uraeus (cobra) at forehead
  ctx.fillStyle = "#c4a35a";
  ctx.beginPath();
  ctx.moveTo(headX, headY - size * 0.14);
  ctx.quadraticCurveTo(
    headX - size * 0.02,
    headY - size * 0.2,
    headX,
    headY - size * 0.25,
  );
  ctx.quadraticCurveTo(
    headX + size * 0.02,
    headY - size * 0.2,
    headX,
    headY - size * 0.14,
  );
  ctx.fill();
  // Cobra hood
  ctx.fillStyle = "#9a7d2e";
  ctx.beginPath();
  ctx.ellipse(
    headX,
    headY - size * 0.22,
    size * 0.025,
    size * 0.015,
    0,
    0,
    TAU,
  );
  ctx.fill();
  // Cobra eyes
  ctx.fillStyle = "#ff4444";
  ctx.beginPath();
  ctx.arc(headX - size * 0.01, headY - size * 0.22, size * 0.005, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(headX + size * 0.01, headY - size * 0.22, size * 0.005, 0, TAU);
  ctx.fill();

  // === THIRD EYE on forehead ===
  setShadowBlur(ctx, 15 * zoom, "#fbbf24");
  const thirdEyeGrad = ctx.createRadialGradient(
    headX,
    headY - size * 0.08,
    0,
    headX,
    headY - size * 0.08,
    size * 0.03,
  );
  thirdEyeGrad.addColorStop(0, `rgba(255, 255, 200, ${thirdEyePulse})`);
  thirdEyeGrad.addColorStop(0.4, `rgba(251, 191, 36, ${thirdEyePulse * 0.9})`);
  thirdEyeGrad.addColorStop(1, `rgba(234, 88, 12, ${thirdEyePulse * 0.5})`);
  ctx.fillStyle = thirdEyeGrad;
  ctx.beginPath();
  // Diamond eye shape
  ctx.moveTo(headX, headY - size * 0.105);
  ctx.quadraticCurveTo(
    headX + size * 0.03,
    headY - size * 0.08,
    headX,
    headY - size * 0.055,
  );
  ctx.quadraticCurveTo(
    headX - size * 0.03,
    headY - size * 0.08,
    headX,
    headY - size * 0.105,
  );
  ctx.fill();
  clearShadow(ctx);
  // Third eye pupil
  ctx.fillStyle = `rgba(40, 10, 0, ${thirdEyePulse})`;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.08, size * 0.01, 0, TAU);
  ctx.fill();

  // Solar flare rings around third eye
  setShadowBlur(ctx, 6 * zoom, "#fbbf24");
  ctx.strokeStyle = `rgba(251, 191, 36, ${thirdEyePulse * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.08, size * 0.04, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(251, 191, 36, ${thirdEyePulse * 0.15})`;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.08, size * 0.06, 0, TAU);
  ctx.stroke();
  clearShadow(ctx);

  // Rays from third eye (always visible, enhanced when attacking)
  setShadowBlur(ctx, 10 * zoom, "#fbbf24");
  const rayIntensity = isAttacking ? attackIntensity * 0.7 : thirdEyePulse * 0.15;
  const rayLen = isAttacking ? size * 0.3 : size * 0.12;
  ctx.strokeStyle = `rgba(251, 191, 36, ${rayIntensity})`;
  ctx.lineWidth = isAttacking ? 2.5 * zoom : 1.5 * zoom;
  for (let ray = 0; ray < 8; ray++) {
    const rayAngle = -Math.PI * 0.5 + (ray - 3.5) * 0.2 + Math.sin(time * 3 + ray) * 0.05;
    ctx.beginPath();
    ctx.moveTo(headX, headY - size * 0.08);
    ctx.lineTo(
      headX + Math.cos(rayAngle) * rayLen,
      headY - size * 0.08 + Math.sin(rayAngle) * rayLen,
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // === GOLDEN SCARAB on chest ===
  const scarabX = x;
  const scarabY = y - size * 0.08 + breathe;
  setShadowBlur(ctx, 6 * zoom, "#fbbf24");
  ctx.fillStyle = `rgba(251, 191, 36, ${goldPulse * 0.9})`;
  ctx.beginPath();
  ctx.ellipse(scarabX, scarabY, size * 0.04, size * 0.03, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#9a7d2e";
  ctx.beginPath();
  ctx.moveTo(scarabX, scarabY - size * 0.03);
  ctx.lineTo(scarabX + size * 0.015, scarabY);
  ctx.lineTo(scarabX, scarabY + size * 0.015);
  ctx.lineTo(scarabX - size * 0.015, scarabY);
  ctx.closePath();
  ctx.fill();
  // Scarab wings
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(scarabX - size * 0.02, scarabY, size * 0.025, Math.PI * 0.3, Math.PI * 1.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(scarabX + size * 0.02, scarabY, size * 0.025, -Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();
  clearShadow(ctx);
}

// ============================================================================
// 4. FROST COLOSSUS — THE JANUARY TITAN (Winter Boss)
//    Enormous crystalline ice giant. Size 52. Icy blue and white.
// ============================================================================

export function drawFrostColossusEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const sin15 = Math.sin(time * 1.5);
  const sin2 = Math.sin(time * 2);
  const sin25 = Math.sin(time * 2.5);
  const sin3 = Math.sin(time * 3);
  const sin4 = Math.sin(time * 4);
  const sin5 = Math.sin(time * 5);
  const sin6 = Math.sin(time * 6);
  const sin8 = Math.sin(time * 8);
  const cos3 = Math.cos(time * 3);
  const cos4 = Math.cos(time * 4);
  const breathe = sin2 * size * 0.02;
  const icePulse = 0.5 + sin3 * 0.35;
  const crystalShift = sin4 * size * 0.015;
  const bob = Math.abs(sin3) * size * 0.015;
  const headY = y - size * 0.42 - bob;
  const stomp = isAttacking ? Math.abs(sin8) * size * 0.03 : 0;

  // === ICY BLUE AURA ON GROUND (isometric, enhanced) ===
  const iceOuterGrad = ctx.createRadialGradient(x, y + size * 0.5, size * 0.6, x, y + size * 0.5, size * 1.2);
  iceOuterGrad.addColorStop(0, `rgba(56, 189, 248, ${icePulse * 0.05})`);
  iceOuterGrad.addColorStop(0.5, `rgba(186, 230, 253, ${icePulse * 0.025})`);
  iceOuterGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = iceOuterGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 1.2, size * 1.2 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  const iceAuraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.5,
    0,
    x,
    y + size * 0.5,
    size * 0.85,
  );
  iceAuraGrad.addColorStop(0, `rgba(186, 230, 253, ${icePulse * 0.2})`);
  iceAuraGrad.addColorStop(0.3, `rgba(56, 189, 248, ${icePulse * 0.14})`);
  iceAuraGrad.addColorStop(0.6, `rgba(56, 189, 248, ${icePulse * 0.07})`);
  iceAuraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = iceAuraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.85, size * 0.85 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Ground freezing effect (isometric ground plane)
  ctx.save();
  ctx.translate(x, y + size * 0.48);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.strokeStyle = `rgba(186, 230, 253, ${icePulse * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  for (let freeze = 0; freeze < 8; freeze++) {
    const fAngle = (freeze * TAU) / 8 + time * 0.2;
    const fLen = size * (0.35 + Math.sin(time + freeze * 1.5) * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const fEndX = Math.cos(fAngle) * fLen;
    const fEndY = Math.sin(fAngle) * fLen;
    ctx.lineTo(fEndX, fEndY);
    ctx.stroke();
    ctx.lineWidth = 1 * zoom;
    for (let branch = 0; branch < 2; branch++) {
      const bAngle = fAngle + (branch === 0 ? 0.5 : -0.5);
      const bLen = fLen * 0.4;
      ctx.beginPath();
      ctx.moveTo(fEndX, fEndY);
      ctx.lineTo(
        fEndX + Math.cos(bAngle) * bLen,
        fEndY + Math.sin(bAngle) * bLen,
      );
      ctx.stroke();
    }
    ctx.lineWidth = 2 * zoom;
  }
  ctx.restore();

  // === FROST CRYSTALLIZATION SPREAD (detailed ice patterns on ground) ===
  ctx.save();
  ctx.translate(x, y + size * 0.48);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.strokeStyle = `rgba(200, 240, 255, ${icePulse * 0.3})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let crystal = 0; crystal < 12; crystal++) {
    const cAngle = (crystal * TAU) / 12 + time * 0.15;
    const cLen = size * (0.18 + Math.sin(time * 0.5 + crystal) * 0.05);
    const cx0 = Math.cos(cAngle) * size * 0.16;
    const cy0 = Math.sin(cAngle) * size * 0.16;
    const cEndX = Math.cos(cAngle) * (size * 0.16 + cLen);
    const cEndY = Math.sin(cAngle) * (size * 0.16 + cLen);
    ctx.beginPath();
    ctx.moveTo(cx0, cy0);
    ctx.lineTo(cEndX, cEndY);
    ctx.stroke();
    for (let branch = 0; branch < 3; branch++) {
      const bT = (branch + 1) / 4;
      const bx = cx0 + (cEndX - cx0) * bT;
      const by = cy0 + (cEndY - cy0) * bT;
      const bLen = cLen * 0.22 * (1 - bT * 0.3);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(cAngle + 0.5) * bLen, by + Math.sin(cAngle + 0.5) * bLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(cAngle - 0.5) * bLen, by + Math.sin(cAngle - 0.5) * bLen);
      ctx.stroke();
    }
  }
  ctx.restore();

  // === FROST CRYSTALS orbiting ===
  drawFrostCrystals(ctx, x, y - size * 0.1, size * 0.7, time, zoom, {
    count: 10,
    speed: 0.7,
    color: "rgba(186, 230, 253, 0.6)",
    glowColor: "rgba(56, 189, 248, 0.3)",
    maxAlpha: 0.6,
    crystalSize: 0.03,
  });

  // === SNOWFLAKE PARTICLES ===
  for (let snow = 0; snow < 12; snow++) {
    const snowPhase = (time * 0.5 + snow * 0.5) % 3;
    const snowX = x + Math.sin(time * 0.8 + snow * 1.3) * size * 0.5;
    const snowY = y - size * 0.5 + snowPhase * size * 0.35;
    const snowAlpha = Math.max(0, 0.5 - snowPhase * 0.2);
    ctx.fillStyle = `rgba(255, 255, 255, ${snowAlpha})`;
    ctx.beginPath();
    ctx.arc(snowX, snowY, size * 0.008 + Math.sin(snow) * size * 0.004, 0, TAU);
    ctx.fill();
    // Tiny snowflake spokes
    ctx.strokeStyle = `rgba(186, 230, 253, ${snowAlpha * 0.6})`;
    ctx.lineWidth = 0.5 * zoom;
    for (let spoke = 0; spoke < 6; spoke++) {
      const spokeAngle = (spoke * TAU) / 6;
      ctx.beginPath();
      ctx.moveTo(snowX, snowY);
      ctx.lineTo(
        snowX + Math.cos(spokeAngle) * size * 0.01,
        snowY + Math.sin(spokeAngle) * size * 0.01,
      );
      ctx.stroke();
    }
  }

  // === ANIMATED LEGS ===
  drawPathLegs(ctx, x, y + size * 0.2, size, time, zoom, {
    legLen: 0.3,
    width: 0.08,
    strideSpeed: 2.5,
    strideAmt: 0.15,
    color: bodyColor,
    colorDark: bodyColorDark,
    footColor: "#e0f2fe",
    footLen: 0.08,
    style: "armored",
  });

  // === MASSIVE ICE BODY ===
  // Internal blizzard visible through semi-transparent body
  ctx.save();
  ctx.globalAlpha = 0.6;
  const innerStormGrad = ctx.createRadialGradient(
    x,
    y - size * 0.05,
    0,
    x,
    y - size * 0.05,
    size * 0.35,
  );
  innerStormGrad.addColorStop(0, "rgba(186, 230, 253, 0.4)");
  innerStormGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.2)");
  innerStormGrad.addColorStop(1, "rgba(14, 165, 233, 0.1)");
  ctx.fillStyle = innerStormGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.05 + breathe,
    size * 0.36,
    size * 0.32,
    0,
    0,
    TAU,
  );
  ctx.fill();
  // Swirling blizzard particles inside
  for (let bliz = 0; bliz < 8; bliz++) {
    const bAngle = time * 3 + (bliz * TAU) / 8;
    const bR = size * (0.1 + Math.sin(time * 2 + bliz) * 0.08);
    const bx = x + Math.cos(bAngle) * bR;
    const by = y - size * 0.05 + Math.sin(bAngle) * bR * 0.8 + breathe;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 4 + bliz) * 0.15})`;
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.012, 0, TAU);
    ctx.fill();
  }
  // Enhanced inner blizzard - additional swirling particles with glow
  for (let ib = 0; ib < 6; ib++) {
    const ibAngle = time * 4.5 + (ib * TAU) / 6 + Math.PI;
    const ibR = size * (0.06 + Math.sin(time * 3 + ib * 1.5) * 0.07);
    const ibx = x + Math.cos(ibAngle) * ibR;
    const iby = y - size * 0.05 + Math.sin(ibAngle) * ibR * 0.7 + breathe;
    const ibAlpha = 0.4 + Math.sin(time * 5 + ib) * 0.2;
    const ibGrad = ctx.createRadialGradient(ibx, iby, 0, ibx, iby, size * 0.018);
    ibGrad.addColorStop(0, `rgba(255, 255, 255, ${ibAlpha})`);
    ibGrad.addColorStop(0.5, `rgba(186, 230, 253, ${ibAlpha * 0.5})`);
    ibGrad.addColorStop(1, "rgba(186, 230, 253, 0)");
    ctx.fillStyle = ibGrad;
    ctx.beginPath();
    ctx.arc(ibx, iby, size * 0.018, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // === AURORA BOREALIS effect behind body ===
  ctx.save();
  ctx.globalAlpha = 0.12 + Math.sin(time * 1.5) * 0.06;
  for (let aurora = 0; aurora < 5; aurora++) {
    const auroraY = y - size * 0.6 + aurora * size * 0.08;
    const auroraWave = Math.sin(time * 1.5 + aurora * 0.8) * size * 0.15;
    const hue = 180 + aurora * 20 + Math.sin(time + aurora) * 15;
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
    ctx.lineWidth = (4 + aurora * 2) * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, auroraY);
    ctx.quadraticCurveTo(x + auroraWave, auroraY - size * 0.05, x + size * 0.5, auroraY);
    ctx.stroke();
  }
  ctx.restore();

  // Main body — angular crystal faceted shape (not smooth ellipse)
  const bodyGrad = ctx.createRadialGradient(
    x, y - size * 0.05, size * 0.05,
    x, y - size * 0.05, size * 0.4,
  );
  bodyGrad.addColorStop(0, "rgba(230, 248, 255, 0.9)");
  bodyGrad.addColorStop(0.25, "rgba(224, 242, 254, 0.85)");
  bodyGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.75)");
  bodyGrad.addColorStop(0.75, "rgba(125, 211, 252, 0.65)");
  bodyGrad.addColorStop(1, "rgba(56, 189, 248, 0.5)");
  ctx.fillStyle = bodyGrad;
  // Angular faceted body silhouette
  const facetPoints = 12;
  ctx.beginPath();
  for (let fp = 0; fp <= facetPoints; fp++) {
    const angle = (fp / facetPoints) * TAU;
    const baseR = size * 0.36;
    const facetVar = size * 0.04 * Math.sin(fp * 2.3 + 0.5);
    const r = baseR + facetVar;
    const px = x + Math.cos(angle) * r * 1.05;
    const py = y - size * 0.05 + breathe + Math.sin(angle) * r * 0.94;
    if (fp === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Crystal facet edge lines (visible flat surface boundaries)
  ctx.strokeStyle = "rgba(200, 240, 255, 0.4)";
  ctx.lineWidth = 1.2 * zoom;
  for (let fp = 0; fp < facetPoints; fp++) {
    const angle = (fp / facetPoints) * TAU;
    const baseR = size * 0.36;
    const facetVar = size * 0.04 * Math.sin(fp * 2.3 + 0.5);
    const r = baseR + facetVar;
    const px = x + Math.cos(angle) * r * 1.05;
    const py = y - size * 0.05 + breathe + Math.sin(angle) * r * 0.94;
    // Radial facet line from edge to center
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(x + Math.cos(angle) * r * 0.4, y - size * 0.05 + breathe + Math.sin(angle) * r * 0.35);
    ctx.stroke();
  }

  // Internal trapped objects visible through translucent ice
  ctx.save();
  ctx.globalAlpha = 0.25;
  // Trapped figure silhouette (darker shape inside)
  ctx.fillStyle = "rgba(30, 60, 90, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.08, y - size * 0.02 + breathe, size * 0.04, size * 0.08, -0.2, 0, TAU);
  ctx.fill();
  // Trapped weapon shape
  ctx.fillStyle = "rgba(40, 70, 100, 0.4)";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.15 + breathe);
  ctx.lineTo(x + size * 0.14, y + size * 0.08 + breathe);
  ctx.lineTo(x + size * 0.11, y + size * 0.08 + breathe);
  ctx.closePath();
  ctx.fill();
  // Trapped skull shape
  ctx.fillStyle = "rgba(50, 80, 110, 0.35)";
  ctx.beginPath();
  ctx.arc(x + size * 0.05, y - size * 0.1 + breathe, size * 0.03, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.04, y - size * 0.07 + breathe);
  ctx.lineTo(x + size * 0.05, y - size * 0.04 + breathe);
  ctx.lineTo(x + size * 0.06, y - size * 0.07 + breathe);
  ctx.closePath();
  ctx.fill();
  // Trapped shield fragment
  ctx.fillStyle = "rgba(35, 65, 95, 0.3)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.05 + breathe);
  ctx.lineTo(x - size * 0.12, y + size * 0.02 + breathe);
  ctx.lineTo(x - size * 0.09, y + size * 0.05 + breathe);
  ctx.lineTo(x - size * 0.12, y + size * 0.1 + breathe);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === ICE RUNE PATTERNS carved on body ===
  setShadowBlur(ctx, 10 * zoom, "#38bdf8");
  ctx.strokeStyle = `rgba(56, 189, 248, ${icePulse * 0.8})`;
  ctx.lineWidth = 2.5 * zoom;
  const iceVeinPaths = [
    { sx: -0.22, sy: -0.25, mx: -0.06, my: -0.05, ex: 0.16, ey: 0.18 },
    { sx: 0.2, sy: -0.22, mx: 0.06, my: 0.02, ex: -0.14, ey: 0.22 },
    { sx: -0.12, sy: -0.32, mx: 0.0, my: -0.12, ex: 0.12, ey: 0.12 },
    { sx: 0.0, sy: -0.36, mx: 0.1, my: -0.16, ex: 0.22, ey: 0.06 },
    { sx: -0.18, sy: 0.0, mx: -0.06, my: 0.12, ex: 0.12, ey: 0.2 },
    { sx: 0.16, sy: 0.0, mx: 0.06, my: 0.12, ex: -0.1, ey: 0.2 },
  ];
  for (const vein of iceVeinPaths) {
    ctx.beginPath();
    ctx.moveTo(x + vein.sx * size, y + vein.sy * size + breathe);
    ctx.quadraticCurveTo(
      x + vein.mx * size, y + vein.my * size + breathe,
      x + vein.ex * size, y + vein.ey * size + breathe,
    );
    ctx.stroke();
  }
  // Branch veins
  ctx.lineWidth = 1.5 * zoom;
  for (const vein of iceVeinPaths) {
    ctx.beginPath();
    ctx.moveTo(x + vein.mx * size, y + vein.my * size + breathe);
    ctx.lineTo(x + vein.mx * size + size * 0.08, y + vein.my * size + size * 0.07 + breathe);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + vein.mx * size, y + vein.my * size + breathe);
    ctx.lineTo(x + vein.mx * size - size * 0.06, y + vein.my * size + size * 0.05 + breathe);
    ctx.stroke();
  }
  // Rune nodes at vein junctions
  ctx.fillStyle = `rgba(200, 240, 255, ${icePulse * 0.9})`;
  for (const vein of iceVeinPaths) {
    ctx.beginPath();
    ctx.arc(x + vein.mx * size, y + vein.my * size + breathe, size * 0.012, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // === CRACKING ICE BODY HIGHLIGHTS (bright cyan fracture lines with glow) ===
  const crackPulse = 0.4 + Math.sin(time * 2.5) * 0.3;
  const iceCrackPaths = [
    { sx: -0.15, sy: -0.25, ex: 0.1, ey: 0.05 },
    { sx: 0.12, sy: -0.2, ex: -0.08, ey: 0.1 },
    { sx: -0.05, sy: -0.3, ex: 0.15, ey: -0.1 },
    { sx: 0.08, sy: 0.0, ex: -0.12, ey: 0.15 },
    { sx: -0.2, sy: -0.05, ex: -0.05, ey: 0.2 },
  ];
  for (const icc of iceCrackPaths) {
    const ccGrad = ctx.createLinearGradient(
      x + icc.sx * size, y + icc.sy * size + breathe,
      x + icc.ex * size, y + icc.ey * size + breathe,
    );
    ccGrad.addColorStop(0, `rgba(200, 240, 255, ${crackPulse * 0.1})`);
    ccGrad.addColorStop(0.5, `rgba(150, 230, 255, ${crackPulse * 0.6})`);
    ccGrad.addColorStop(1, `rgba(200, 240, 255, ${crackPulse * 0.1})`);
    ctx.strokeStyle = ccGrad;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + icc.sx * size, y + icc.sy * size + breathe);
    ctx.lineTo(x + icc.ex * size, y + icc.ey * size + breathe);
    ctx.stroke();
    const ccMidX = x + (icc.sx + icc.ex) * 0.5 * size;
    const ccMidY = y + (icc.sy + icc.ey) * 0.5 * size + breathe;
    const ccGlowGrad = ctx.createRadialGradient(ccMidX, ccMidY, 0, ccMidX, ccMidY, size * 0.03);
    ccGlowGrad.addColorStop(0, `rgba(200, 245, 255, ${crackPulse * 0.4})`);
    ccGlowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = ccGlowGrad;
    ctx.beginPath();
    ctx.arc(ccMidX, ccMidY, size * 0.03, 0, TAU);
    ctx.fill();
  }

  // === FROZEN RUNIC SIGILS on torso ===
  setShadowBlur(ctx, 6 * zoom, "#7dd3fc");
  ctx.strokeStyle = `rgba(186, 230, 253, ${icePulse * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  // Central sigil
  ctx.beginPath();
  ctx.arc(x, y - size * 0.05 + breathe, size * 0.08, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - size * 0.05 + breathe, size * 0.06, 0, TAU);
  ctx.stroke();
  // Cross lines in sigil
  for (let sig = 0; sig < 4; sig++) {
    const sigAngle = sig * (Math.PI / 2) + time * 0.3;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(sigAngle) * size * 0.06,
      y - size * 0.05 + breathe + Math.sin(sigAngle) * size * 0.06,
    );
    ctx.lineTo(
      x + Math.cos(sigAngle) * size * 0.1,
      y - size * 0.05 + breathe + Math.sin(sigAngle) * size * 0.1,
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // === CRYSTALLINE ARMOR PLATES (floating) ===
  const armorConfigs = [
    { cx: -0.25, cy: -0.15, w: 0.12, h: 0.14, phase: 0 },
    { cx: 0.25, cy: -0.15, w: 0.12, h: 0.14, phase: 1.5 },
    { cx: -0.15, cy: 0.1, w: 0.1, h: 0.08, phase: 0.8 },
    { cx: 0.15, cy: 0.1, w: 0.1, h: 0.08, phase: 2.0 },
    { cx: 0.0, cy: -0.28, w: 0.08, h: 0.06, phase: 1.0 },
    { cx: 0.0, cy: 0.18, w: 0.1, h: 0.06, phase: 2.5 },
  ];
  for (const armor of armorConfigs) {
    const ax =
      x + armor.cx * size + Math.sin(time * 1.5 + armor.phase) * size * 0.01;
    const ay =
      y -
      size * 0.05 +
      armor.cy * size +
      breathe +
      Math.sin(time * 2 + armor.phase) * size * 0.015;
    drawFloatingPiece(ctx, ax, ay, size, time, armor.phase, {
      width: armor.w,
      height: armor.h,
      color: "rgba(186, 230, 253, 0.7)",
      colorEdge: "rgba(56, 189, 248, 0.5)",
      bobSpeed: 1.5,
      bobAmt: 0.012,
      rotateSpeed: 0.3,
      rotateAmt: 0.15,
    });
  }

  // === ANIMATED ARMS — frost colossus crushing spread ===
  for (const side of [-1, 1] as const) {
    drawPathArm(
      ctx,
      x + side * size * 0.3,
      y - size * 0.2,
      size,
      time,
      zoom,
      side,
      {
        upperLen: 0.22,
        foreLen: 0.2,
        width: 0.07,
        shoulderAngle: side * (0.9 + Math.sin(time * 1.5 + side * 0.5) * 0.1 + (isAttacking ? attackIntensity * 0.5 : 0)),
        elbowAngle: 0.3 + Math.sin(time * 2 + side * 1.5) * 0.1,
        color: bodyColor,
        colorDark: bodyColorDark,
        handColor: "#e0f2fe",
        handRadius: 0.04,
        style: "armored",
      },
    );
  }

  // === ICE CROWN with jagged spikes (enhanced) ===
  const crownBaseY = headY + size * 0.03;
  const crownSpikes = [
    { offset: -0.1, height: -0.18, width: 0.025 },
    { offset: -0.06, height: -0.24, width: 0.028 },
    { offset: -0.02, height: -0.28, width: 0.025 },
    { offset: 0.02, height: -0.32, width: 0.032 },
    { offset: 0.06, height: -0.28, width: 0.025 },
    { offset: 0.1, height: -0.22, width: 0.028 },
    { offset: -0.13, height: -0.12, width: 0.02 },
    { offset: 0.13, height: -0.12, width: 0.02 },
  ];
  // Inner glow behind spikes
  setShadowBlur(ctx, 15 * zoom, "#38bdf8");
  ctx.fillStyle = `rgba(186, 230, 253, ${icePulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, crownBaseY - size * 0.15, size * 0.12, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Crystal spikes with prismatic shimmer
  for (const spike of crownSpikes) {
    const spikeTop = crownBaseY + spike.height * size + Math.sin(time * 2 + spike.offset * 10) * size * 0.015;
    // Spike body
    const spikeGrad = ctx.createLinearGradient(
      x + spike.offset * size, crownBaseY,
      x + spike.offset * size, spikeTop,
    );
    spikeGrad.addColorStop(0, "rgba(186, 230, 253, 0.9)");
    spikeGrad.addColorStop(0.5, "rgba(224, 242, 254, 0.95)");
    spikeGrad.addColorStop(1, "rgba(255, 255, 255, 1)");
    ctx.fillStyle = spikeGrad;
    ctx.beginPath();
    ctx.moveTo(x + spike.offset * size - spike.width * size, crownBaseY);
    ctx.lineTo(x + spike.offset * size, spikeTop);
    ctx.lineTo(x + spike.offset * size + spike.width * size, crownBaseY);
    ctx.closePath();
    ctx.fill();
    // Prismatic edge highlight
    ctx.strokeStyle = `rgba(180, 200, 255, ${icePulse * 0.6})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + spike.offset * size - spike.width * size * 0.5, crownBaseY);
    ctx.lineTo(x + spike.offset * size, spikeTop);
    ctx.stroke();
  }
  // Crown base ring (double ring)
  setShadowBlur(ctx, 10 * zoom, "#38bdf8");
  ctx.strokeStyle = `rgba(56, 189, 248, ${icePulse * 0.9})`;
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, crownBaseY, size * 0.15, size * 0.05, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(186, 230, 253, ${icePulse * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, crownBaseY - size * 0.015, size * 0.13, size * 0.04, 0, 0, TAU);
  ctx.stroke();
  clearShadow(ctx);

  // Crown gems (3 jewels)
  const crownGemPositions = [-0.05, 0, 0.05];
  for (let cg = 0; cg < 3; cg++) {
    const cgX = x + crownGemPositions[cg] * size;
    const cgY = crownBaseY - size * 0.01;
    setShadowBlur(ctx, 6 * zoom, "#38bdf8");
    ctx.fillStyle = `rgba(56, 189, 248, ${icePulse})`;
    ctx.beginPath();
    ctx.moveTo(cgX, cgY - size * 0.015);
    ctx.lineTo(cgX + size * 0.01, cgY);
    ctx.lineTo(cgX, cgY + size * 0.015);
    ctx.lineTo(cgX - size * 0.01, cgY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${icePulse * 0.7})`;
    ctx.beginPath();
    ctx.arc(cgX - size * 0.003, cgY - size * 0.003, size * 0.004, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // === MASSIVE HEAD ===
  const headGrad = ctx.createRadialGradient(x, headY, 0, x, headY, size * 0.16);
  headGrad.addColorStop(0, "rgba(224, 242, 254, 0.9)");
  headGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.8)");
  headGrad.addColorStop(1, "rgba(125, 211, 252, 0.65)");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, size * 0.14, size * 0.16, 0, 0, TAU);
  ctx.fill();

  // Face cracks
  ctx.strokeStyle = `rgba(56, 189, 248, ${icePulse * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, headY - size * 0.08);
  ctx.lineTo(x - size * 0.03, headY + size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.04, headY - size * 0.06);
  ctx.lineTo(x + size * 0.06, headY + size * 0.02);
  ctx.stroke();

  // === ICICLE BEARD (individual pointed shapes with varying lengths) ===
  for (let icicle = 0; icicle < 9; icicle++) {
    const icX = x - size * 0.07 + icicle * size * 0.018;
    const icY = headY + size * 0.1;
    const icLen =
      size * (0.04 + Math.sin(icicle * 1.7 + 0.3) * 0.03 + (icicle === 4 ? 0.03 : 0)) +
      Math.sin(time * 2 + icicle) * size * 0.005;
    const icWidth = size * (0.005 + Math.sin(icicle * 0.8) * 0.002);
    // Icicle body with gradient
    const icicleGrad = ctx.createLinearGradient(icX, icY, icX, icY + icLen);
    icicleGrad.addColorStop(0, "rgba(200, 240, 255, 0.85)");
    icicleGrad.addColorStop(0.4, "rgba(186, 230, 253, 0.75)");
    icicleGrad.addColorStop(1, "rgba(150, 220, 250, 0.5)");
    ctx.fillStyle = icicleGrad;
    ctx.beginPath();
    ctx.moveTo(icX - icWidth * 1.5, icY);
    ctx.lineTo(icX - icWidth * 0.3, icY + icLen);
    ctx.lineTo(icX + icWidth * 0.3, icY + icLen);
    ctx.lineTo(icX + icWidth * 1.5, icY);
    ctx.closePath();
    ctx.fill();
    // Icicle edge highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(icX - icWidth, icY);
    ctx.lineTo(icX - icWidth * 0.2, icY + icLen * 0.95);
    ctx.stroke();
    // Frost bulge at attachment
    ctx.fillStyle = `rgba(255, 255, 255, ${icePulse * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(icX, icY, icWidth * 2, icWidth, 0, 0, TAU);
    ctx.fill();
  }

  // === ICICLE FORMATIONS ON ARMS (individual pointed shapes) ===
  for (const side of [-1, 1]) {
    const armIcicleBaseX = x + side * size * 0.35;
    const armIcicleBaseY = y - size * 0.08 + breathe;
    for (let aic = 0; aic < 4; aic++) {
      const aicX = armIcicleBaseX + aic * side * size * 0.02;
      const aicY = armIcicleBaseY + aic * size * 0.04;
      const aicLen = size * (0.035 + Math.sin(aic * 2.1) * 0.015);
      ctx.fillStyle = "rgba(186, 230, 253, 0.6)";
      ctx.beginPath();
      ctx.moveTo(aicX - size * 0.004, aicY);
      ctx.lineTo(aicX, aicY + aicLen);
      ctx.lineTo(aicX + size * 0.004, aicY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // === GLOWING BLUE EYES with frost trails ===
  for (const side of [-1, 1]) {
    const eyeX = x + side * size * 0.055;
    const eyeY = headY - size * 0.02;
    // Eye socket
    ctx.fillStyle = "rgba(14, 116, 144, 0.8)";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.03, size * 0.025, 0, 0, TAU);
    ctx.fill();
    // Glowing eye
    setShadowBlur(ctx, 14 * zoom, "#38bdf8");
    const eyeGrad = ctx.createRadialGradient(
      eyeX,
      eyeY,
      0,
      eyeX,
      eyeY,
      size * 0.025,
    );
    eyeGrad.addColorStop(0, `rgba(255, 255, 255, ${icePulse})`);
    eyeGrad.addColorStop(0.4, `rgba(186, 230, 253, ${icePulse * 0.9})`);
    eyeGrad.addColorStop(1, `rgba(56, 189, 248, ${icePulse * 0.5})`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.025, size * 0.02, 0, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
    // Frost trails from eyes
    ctx.strokeStyle = `rgba(186, 230, 253, ${icePulse * 0.5})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX + side * size * 0.03, eyeY);
    ctx.bezierCurveTo(
      eyeX + side * size * 0.06,
      eyeY - size * 0.015 + sin5 * size * 0.008,
      eyeX + side * size * 0.09,
      eyeY - size * 0.005 + sin6 * size * 0.01,
      eyeX + side * size * 0.12,
      eyeY - size * 0.02 + sin5 * size * 0.015,
    );
    ctx.stroke();
  }

  // Mouth - grim line with cold breath
  ctx.strokeStyle = "rgba(14, 116, 144, 0.6)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, headY + size * 0.06);
  ctx.quadraticCurveTo(
    x,
    headY + size * 0.065,
    x + size * 0.04,
    headY + size * 0.06,
  );
  ctx.stroke();

  // Cold breath effect
  ctx.save();
  ctx.globalAlpha = 0.25 + sin3 * 0.1;
  for (let breath = 0; breath < 4; breath++) {
    const bPhase = (time + breath * 0.5) % 2;
    const bx = x + Math.sin(time * 2 + breath) * size * 0.03;
    const by = headY + size * 0.08 + bPhase * size * 0.08;
    const bSize = size * (0.015 + bPhase * 0.015);
    ctx.fillStyle = "rgba(186, 230, 253, 0.4)";
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // === PULSING GLOW RINGS ===
  drawPulsingGlowRings(ctx, x, y, size * 0.5, time, zoom, {
    count: 2,
    speed: 1.8,
    color: "rgba(56, 189, 248, 0.2)",
    maxAlpha: 0.2,
    expansion: 0.3,
    lineWidth: 1.5,
  });

  // === FROZEN AURA RINGS (expanding frost rings on ground) ===
  ctx.save();
  ctx.translate(x, y + size * 0.45);
  ctx.scale(1, ISO_Y_RATIO);
  for (let frostRing = 0; frostRing < 3; frostRing++) {
    const frPhase = (time * 1.2 + frostRing * 1.5) % TAU;
    const frExpand = (Math.sin(frPhase) + 1) * 0.5;
    const frR = size * (0.4 + frExpand * 0.5);
    const frAlpha = Math.max(0, 0.22 - frExpand * 0.22);
    ctx.strokeStyle = `rgba(186, 230, 253, ${frAlpha})`;
    ctx.lineWidth = (2.5 - frostRing * 0.5) * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, frR, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(56, 189, 248, ${frAlpha * 0.5})`;
    ctx.lineWidth = (1 - frostRing * 0.2) * zoom;
    ctx.beginPath();
    ctx.arc(0, 0, frR + size * 0.01, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();

  // === ENHANCED SNOWFALL (larger, more detailed snowflakes) ===
  for (let flake = 0; flake < 8; flake++) {
    const flakePhase = (time * 0.4 + flake * 0.45) % 2.5;
    const flakeX = x + Math.sin(time * 0.6 + flake * 1.6) * size * 0.55;
    const flakeY = y - size * 0.55 + flakePhase * size * 0.4;
    const flakeAlpha = Math.max(0, 0.55 - flakePhase * 0.22);
    const flakeR = size * (0.012 + Math.sin(flake * 2.1) * 0.004);
    const flakeGrad = ctx.createRadialGradient(flakeX, flakeY, 0, flakeX, flakeY, flakeR * 2);
    flakeGrad.addColorStop(0, `rgba(255, 255, 255, ${flakeAlpha * 0.6})`);
    flakeGrad.addColorStop(0.5, `rgba(186, 230, 253, ${flakeAlpha * 0.3})`);
    flakeGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = flakeGrad;
    ctx.beginPath();
    ctx.arc(flakeX, flakeY, flakeR * 2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${flakeAlpha})`;
    ctx.beginPath();
    ctx.arc(flakeX, flakeY, flakeR, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(186, 230, 253, ${flakeAlpha * 0.5})`;
    ctx.lineWidth = 0.5 * zoom;
    for (let spoke = 0; spoke < 6; spoke++) {
      const spokeAngle = (spoke * TAU) / 6 + time * 0.5 + flake;
      ctx.beginPath();
      ctx.moveTo(flakeX, flakeY);
      ctx.lineTo(flakeX + Math.cos(spokeAngle) * flakeR * 1.5, flakeY + Math.sin(spokeAngle) * flakeR * 1.5);
      ctx.stroke();
    }
  }
}

// ============================================================================
// 5. INFERNO WYRM — THE BURNOUT WYRM (Volcanic Boss)
//    TITANIC lava serpent. Size 56 (LARGEST enemy in game).
//    Deep red and molten orange. The most impressive and terrifying sprite.
// ============================================================================

export function drawInfernoWyrmEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const sin15 = Math.sin(time * 1.5);
  const sin2 = Math.sin(time * 2);
  const sin25 = Math.sin(time * 2.5);
  const sin3 = Math.sin(time * 3);
  const sin4 = Math.sin(time * 4);
  const sin5 = Math.sin(time * 5);
  const sin6 = Math.sin(time * 6);
  const sin8 = Math.sin(time * 8);
  const cos2 = Math.cos(time * 2);
  const cos3 = Math.cos(time * 3);
  const cos4 = Math.cos(time * 4);
  const lavaPulse = 0.5 + sin3 * 0.35;
  const bodyUndulate = sin2 * size * 0.03;
  const mawGape = isAttacking
    ? attackIntensity * size * 0.06
    : sin25 * size * 0.008;
  const heatDistort = sin5 * size * 0.004;

  // === HEAT SHIMMER / DISTORTION ===
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let h = 0; h < 5; h++) {
    const hx = x + Math.sin(time * 1.5 + h * 1.8) * size * 0.3;
    const hy = y - size * 0.6 - h * size * 0.08;
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.ellipse(
      hx,
      hy,
      size * 0.15,
      size * 0.03,
      Math.sin(time + h) * 0.3,
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.restore();

  // === GROUND SCORCHING (spreading heat beneath the wyrm) ===
  const scorchGrad = ctx.createRadialGradient(x, y + size * 0.5, 0, x, y + size * 0.5, size * 0.9);
  scorchGrad.addColorStop(0, `rgba(255, 100, 20, ${lavaPulse * 0.2})`);
  scorchGrad.addColorStop(0.3, `rgba(200, 50, 10, ${lavaPulse * 0.12})`);
  scorchGrad.addColorStop(0.6, `rgba(120, 20, 5, ${lavaPulse * 0.06})`);
  scorchGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = scorchGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // === MASSIVE FIRE AURA (isometric, enhanced with heat distortion) ===
  const outerHeatGrad = ctx.createRadialGradient(x, y, size * 1.0, x, y, size * 1.7);
  outerHeatGrad.addColorStop(0, `rgba(234, 88, 12, ${lavaPulse * 0.05})`);
  outerHeatGrad.addColorStop(0.5, `rgba(180, 40, 10, ${lavaPulse * 0.025})`);
  outerHeatGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = outerHeatGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 1.7, size * 1.7 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.4);
  auraGrad.addColorStop(0, `rgba(239, 68, 68, ${lavaPulse * 0.22})`);
  auraGrad.addColorStop(0.2, `rgba(249, 115, 22, ${lavaPulse * 0.16})`);
  auraGrad.addColorStop(0.45, `rgba(234, 88, 12, ${lavaPulse * 0.1})`);
  auraGrad.addColorStop(0.7, `rgba(180, 40, 10, ${lavaPulse * 0.04})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 1.4, size * 1.4 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Charred ground cracks (isometric ground plane)
  ctx.save();
  ctx.translate(x, y + size * 0.48);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.strokeStyle = `rgba(239, 68, 68, ${lavaPulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let gc = 0; gc < 10; gc++) {
    const gcAngle = (gc * TAU) / 10 + Math.sin(gc * 2) * 0.2;
    const gcLen = size * (0.25 + Math.sin(gc * 1.7 + time * 0.5) * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    let gcX = 0;
    let gcY = 0;
    for (let seg = 0; seg < 3; seg++) {
      const bend = Math.sin(gc * 2.3 + seg * 1.9) * 0.3;
      gcX += Math.cos(gcAngle + bend) * gcLen * 0.35;
      gcY += Math.sin(gcAngle + bend) * gcLen * 0.15;
      ctx.lineTo(gcX, gcY);
    }
    ctx.stroke();
  }
  ctx.restore();

  // === MAGMA POOLS beneath (isometric) ===
  for (let pool = 0; pool < 4; pool++) {
    const poolAngle = (pool * TAU) / 4 + time * 0.15;
    const poolR = size * (0.35 + Math.sin(pool * 2.5) * 0.08);
    const poolX = x + Math.cos(poolAngle) * poolR;
    const poolY = y + size * 0.47 + Math.sin(poolAngle) * poolR * ISO_Y_RATIO;
    const poolGrad = ctx.createRadialGradient(
      poolX,
      poolY,
      0,
      poolX,
      poolY,
      size * 0.06,
    );
    poolGrad.addColorStop(0, `rgba(255, 200, 50, ${lavaPulse * 0.6})`);
    poolGrad.addColorStop(0.5, `rgba(249, 115, 22, ${lavaPulse * 0.4})`);
    poolGrad.addColorStop(1, `rgba(239, 68, 68, ${lavaPulse * 0.15})`);
    ctx.fillStyle = poolGrad;
    ctx.beginPath();
    ctx.ellipse(poolX, poolY, size * 0.06, size * 0.06 * ISO_Y_RATIO, 0, 0, TAU);
    ctx.fill();
  }

  // === EMBER SPARKS ===
  drawEmberSparks(ctx, x, y - size * 0.1, size * 0.8, time, zoom, {
    count: 16,
    speed: 1.5,
    color: "rgba(249, 115, 22, 0.7)",
    coreColor: "rgba(255, 255, 100, 0.9)",
    maxAlpha: 0.7,
    sparkSize: 0.025,
  });

  // === VOLCANIC ERUPTION PARTICLES (erupting upward from body) ===
  for (let erupt = 0; erupt < 10; erupt++) {
    const eruptPhase = (time * 1.5 + erupt * 0.55) % 2;
    const eruptX = x + Math.sin(time * 0.8 + erupt * 2.1) * size * 0.25;
    const eruptY = y - size * 0.1 - eruptPhase * size * 0.35;
    const eruptAlpha = Math.max(0, 0.7 - eruptPhase * 0.4) * lavaPulse;
    const eruptSz = size * (0.012 + Math.sin(erupt * 1.7) * 0.005);
    const eruptGrad = ctx.createRadialGradient(eruptX, eruptY, 0, eruptX, eruptY, eruptSz * 2.5);
    eruptGrad.addColorStop(0, `rgba(255, 255, 100, ${eruptAlpha})`);
    eruptGrad.addColorStop(0.4, `rgba(255, 150, 50, ${eruptAlpha * 0.5})`);
    eruptGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = eruptGrad;
    ctx.beginPath();
    ctx.arc(eruptX, eruptY, eruptSz * 2.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 200, 50, ${eruptAlpha})`;
    ctx.beginPath();
    ctx.arc(eruptX, eruptY, eruptSz, 0, TAU);
    ctx.fill();
  }

  // === FIRE PULSING RINGS (isometric) ===
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ISO_Y_RATIO);
  drawPulsingGlowRings(ctx, 0, 0, size * 0.7, time, zoom, {
    count: 3,
    speed: 2,
    color: "rgba(239, 68, 68, 0.25)",
    maxAlpha: 0.25,
    expansion: 0.4,
    lineWidth: 2,
  });
  ctx.restore();

  // === MASSIVE SERPENTINE BODY in S-curve ===
  const bodySegments = 24;
  const segmentPositions: { x: number; y: number; width: number }[] = [];

  // Compute S-curve positions
  for (let seg = 0; seg <= bodySegments; seg++) {
    const t = seg / bodySegments;
    const curveX =
      x + Math.sin(t * Math.PI * 2.5 + time * 1.2) * size * 0.3 * (1 - t * 0.3);
    const curveY =
      y +
      size * 0.35 -
      t * size * 0.8 +
      Math.cos(t * Math.PI + time * 0.8) * size * 0.1;
    const width = size * (0.16 - t * 0.08) * (1 + Math.sin(t * Math.PI) * 0.15);
    segmentPositions.push({ x: curveX, y: curveY, width });
  }

  // Draw body shadow (underneath)
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let seg = 0; seg < bodySegments; seg++) {
    const p = segmentPositions[seg];
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.ellipse(
      p.x + size * 0.02,
      p.y + size * 0.02,
      p.width * 1.1,
      p.width * 0.6,
      0,
      0,
      TAU,
    );
    ctx.fill();
  }
  ctx.restore();

  // Draw body segments back to front with overlapping armored scales
  for (let seg = 0; seg < bodySegments; seg++) {
    const p = segmentPositions[seg];
    const t = seg / bodySegments;

    // Main segment body
    const scaleGrad = ctx.createRadialGradient(p.x, p.y - p.width * 0.15, p.width * 0.1, p.x, p.y, p.width);
    scaleGrad.addColorStop(0, bodyColorLight);
    scaleGrad.addColorStop(0.35, bodyColor);
    scaleGrad.addColorStop(0.75, bodyColorDark);
    scaleGrad.addColorStop(1, "#2a0000");
    ctx.fillStyle = scaleGrad;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.width, p.width * 0.65, 0, 0, TAU);
    ctx.fill();

    // Overlapping individual scales on each segment
    const scaleRows = 3;
    const scalesPerRow = Math.max(3, Math.round(6 * (1 - t * 0.4)));
    for (let row = 0; row < scaleRows; row++) {
      const rowY = p.y - p.width * 0.3 + row * p.width * 0.3;
      const rowW = p.width * (0.9 - row * 0.1);
      for (let sc = 0; sc < scalesPerRow; sc++) {
        const scT = (sc + (row % 2) * 0.5) / scalesPerRow;
        const scX = p.x - rowW + scT * rowW * 2;
        const scW = rowW / scalesPerRow * 1.3;
        const scH = p.width * 0.22;
        const distFromCenter = Math.abs(scT - 0.5) * 2;
        if (distFromCenter > 0.95) continue;
        ctx.fillStyle = row % 2 === 0 ? bodyColorDark : bodyColor;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(scX - scW * 0.5, rowY);
        ctx.quadraticCurveTo(scX, rowY - scH * 0.3, scX + scW * 0.5, rowY);
        ctx.quadraticCurveTo(scX, rowY + scH, scX - scW * 0.5, rowY);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Scale edge highlight (top of each segment)
    ctx.strokeStyle = "rgba(120, 40, 20, 0.3)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.width * 0.85, p.width * 0.5, 0, -Math.PI, 0);
    ctx.stroke();

    // Individual larger overlapping belly scutes (ventral scales)
    const scuteCount = Math.max(2, Math.round(4 * (1 - t * 0.4)));
    for (let scute = 0; scute < scuteCount; scute++) {
      const scuteX = p.x - p.width * 0.4 + (scute + 0.5) / scuteCount * p.width * 0.8;
      const scuteY = p.y + p.width * 0.25;
      const scuteW = p.width * 0.35 / scuteCount;
      ctx.strokeStyle = "rgba(100, 30, 15, 0.25)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(scuteX - scuteW, scuteY);
      ctx.lineTo(scuteX + scuteW, scuteY);
      ctx.stroke();
    }

    // Joint plates between segments
    if (seg < bodySegments - 1) {
      const next = segmentPositions[seg + 1];
      const gapX = (p.x + next.x) / 2;
      const gapY = (p.y + next.y) / 2;
      const glowAlpha = lavaPulse * 0.5 * (1 - t * 0.5);
      const jointAngle = Math.atan2(next.y - p.y, next.x - p.x);

      // Articulation plate (overlapping armor edge)
      ctx.fillStyle = `rgba(30, 8, 8, 0.5)`;
      ctx.beginPath();
      ctx.ellipse(gapX, gapY, p.width * 0.7, p.width * 0.18, jointAngle, 0, TAU);
      ctx.fill();

      // Visible joint gap with molten glow
      ctx.strokeStyle = `rgba(80, 20, 10, 0.5)`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(gapX, gapY, p.width * 0.65, p.width * 0.15, jointAngle, 0, TAU);
      ctx.stroke();

      setShadowBlur(ctx, 6 * zoom, "#f97316");
      ctx.fillStyle = `rgba(255, 180, 50, ${glowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(gapX, gapY, p.width * 0.5, p.width * 0.1, jointAngle, 0, TAU);
      ctx.fill();
      clearShadow(ctx);
    }
  }

  // === LAVA BODY CRACKS (bright orange/yellow fracture lines) ===
  for (let lc = 0; lc < bodySegments - 2; lc += 3) {
    const lcp = segmentPositions[lc];
    const lcNext = segmentPositions[lc + 2];
    const lcAlpha = lavaPulse * 0.6 * (1 - lc / bodySegments * 0.5);
    const lcGrad = ctx.createLinearGradient(lcp.x, lcp.y, lcNext.x, lcNext.y);
    lcGrad.addColorStop(0, `rgba(255, 200, 50, ${lcAlpha * 0.2})`);
    lcGrad.addColorStop(0.5, `rgba(255, 255, 150, ${lcAlpha})`);
    lcGrad.addColorStop(1, `rgba(255, 200, 50, ${lcAlpha * 0.2})`);
    ctx.strokeStyle = lcGrad;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(lcp.x + lcp.width * 0.3, lcp.y);
    ctx.lineTo(lcNext.x - lcNext.width * 0.3, lcNext.y);
    ctx.stroke();
    const lcMidX = (lcp.x + lcNext.x) / 2;
    const lcMidY = (lcp.y + lcNext.y) / 2;
    const lcGlowGrad = ctx.createRadialGradient(lcMidX, lcMidY, 0, lcMidX, lcMidY, size * 0.02);
    lcGlowGrad.addColorStop(0, `rgba(255, 255, 150, ${lcAlpha * 0.5})`);
    lcGlowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = lcGlowGrad;
    ctx.beginPath();
    ctx.arc(lcMidX, lcMidY, size * 0.02, 0, TAU);
    ctx.fill();
  }

  // === OBSIDIAN ARMOR PLATES on body ===
  for (let plate = 0; plate < 8; plate++) {
    const plateIdx = Math.floor((plate * bodySegments) / 8) + 2;
    if (plateIdx >= bodySegments) continue;
    const pp = segmentPositions[plateIdx];
    const plateAngle = Math.sin(time * 1.5 + plate) * 0.1;
    const plateW = pp.width * 0.6;
    const plateH = pp.width * 0.35;
    ctx.save();
    ctx.translate(pp.x, pp.y);
    ctx.rotate(plateAngle);
    const plateGrad = ctx.createLinearGradient(-plateW, 0, plateW, 0);
    plateGrad.addColorStop(0, "#1a0000");
    plateGrad.addColorStop(0.3, "#2a1010");
    plateGrad.addColorStop(0.5, "#3a2020");
    plateGrad.addColorStop(0.7, "#2a1010");
    plateGrad.addColorStop(1, "#1a0000");
    ctx.fillStyle = plateGrad;
    ctx.beginPath();
    ctx.moveTo(-plateW, -plateH * 0.3);
    ctx.lineTo(-plateW * 0.8, -plateH);
    ctx.lineTo(plateW * 0.8, -plateH);
    ctx.lineTo(plateW, -plateH * 0.3);
    ctx.lineTo(plateW * 0.9, plateH * 0.5);
    ctx.lineTo(-plateW * 0.9, plateH * 0.5);
    ctx.closePath();
    ctx.fill();
    // Lava vein on plate
    setShadowBlur(ctx, 4 * zoom, "#f97316");
    ctx.strokeStyle = `rgba(255, 150, 50, ${lavaPulse * 0.7})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-plateW * 0.5, -plateH * 0.5);
    ctx.lineTo(0, 0);
    ctx.lineTo(plateW * 0.5, -plateH * 0.5);
    ctx.stroke();
    clearShadow(ctx);
    ctx.restore();
  }

  // === VOLCANIC SPINES along the back (enhanced) ===
  for (let spine = 0; spine < 20; spine++) {
    const spineIdx = Math.floor((spine * bodySegments) / 20);
    if (spineIdx >= bodySegments) continue;
    const sp = segmentPositions[spineIdx];
    const spineHeight = size * (0.07 + Math.sin(spine * 1.3) * 0.025 + (spine % 3 === 0 ? 0.02 : 0));
    const spineWobble = Math.sin(time * 3 + spine * 0.5) * size * 0.006;
    // Spine base shadow
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.ellipse(sp.x, sp.y - sp.width * 0.4, size * 0.02, size * 0.008, 0, 0, TAU);
    ctx.fill();
    // Spine body
    const spineGrad = ctx.createLinearGradient(sp.x, sp.y - sp.width * 0.4, sp.x, sp.y - sp.width * 0.4 - spineHeight);
    spineGrad.addColorStop(0, bodyColorDark);
    spineGrad.addColorStop(0.7, "#3a1010");
    spineGrad.addColorStop(1, "#5a2020");
    ctx.fillStyle = spineGrad;
    ctx.beginPath();
    ctx.moveTo(sp.x - size * 0.018, sp.y - sp.width * 0.4);
    ctx.lineTo(sp.x + spineWobble, sp.y - sp.width * 0.4 - spineHeight);
    ctx.lineTo(sp.x + size * 0.018, sp.y - sp.width * 0.4);
    ctx.closePath();
    ctx.fill();
    // Spine glow (molten core)
    setShadowBlur(ctx, 6 * zoom, "#f97316");
    ctx.fillStyle = `rgba(255, 180, 50, ${lavaPulse * 0.7})`;
    ctx.beginPath();
    ctx.arc(sp.x + spineWobble, sp.y - sp.width * 0.4 - spineHeight * 0.6, size * 0.01, 0, TAU);
    ctx.fill();
    // Molten veins on spine
    ctx.strokeStyle = `rgba(255, 150, 50, ${lavaPulse * 0.4})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y - sp.width * 0.4);
    ctx.lineTo(sp.x + spineWobble, sp.y - sp.width * 0.4 - spineHeight * 0.6);
    ctx.stroke();
    clearShadow(ctx);
  }

  // === FIRE MANE / CREST along upper body ===
  setShadowBlur(ctx, 10 * zoom, "#f97316");
  for (let mane = 0; mane < 10; mane++) {
    const maneIdx =
      Math.floor((mane * (bodySegments * 0.4)) / 10) +
      Math.floor(bodySegments * 0.5);
    if (maneIdx >= bodySegments) continue;
    const mp = segmentPositions[maneIdx];
    const manePhase = time * 5 + mane * 0.8;
    const maneHeight = size * (0.05 + Math.sin(manePhase) * 0.025);
    const maneAlpha = 0.5 + Math.sin(manePhase * 0.5) * 0.3;
    ctx.fillStyle = `rgba(255, 200, 50, ${maneAlpha})`;
    ctx.beginPath();
    ctx.moveTo(mp.x - size * 0.02, mp.y - mp.width * 0.4);
    ctx.quadraticCurveTo(
      mp.x + Math.sin(manePhase) * size * 0.02,
      mp.y - mp.width * 0.4 - maneHeight,
      mp.x + size * 0.02,
      mp.y - mp.width * 0.4,
    );
    ctx.fill();
    // Secondary flame layer
    ctx.fillStyle = `rgba(249, 115, 22, ${maneAlpha * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(mp.x - size * 0.015, mp.y - mp.width * 0.35);
    ctx.quadraticCurveTo(
      mp.x + Math.sin(manePhase + 1) * size * 0.015,
      mp.y - mp.width * 0.35 - maneHeight * 0.7,
      mp.x + size * 0.015,
      mp.y - mp.width * 0.35,
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // === LAVA DRIPPING from body (enhanced with radial gradient halos) ===
  for (let drip = 0; drip < 8; drip++) {
    const dripIdx = Math.floor((drip * bodySegments) / 8);
    if (dripIdx >= bodySegments) continue;
    const dp = segmentPositions[dripIdx];
    const dripPhase = (time * 1.5 + drip * 0.7) % 2;
    const dripX = dp.x + Math.sin(drip * 2.3) * dp.width * 0.5;
    const dripY = dp.y + dp.width * 0.4 + dripPhase * size * 0.1;
    const dripAlpha = Math.max(0, 1 - dripPhase * 0.55) * lavaPulse;
    const dripHaloGrad = ctx.createRadialGradient(dripX, dripY, 0, dripX, dripY, size * 0.025);
    dripHaloGrad.addColorStop(0, `rgba(255, 255, 150, ${dripAlpha * 0.6})`);
    dripHaloGrad.addColorStop(0.3, `rgba(255, 180, 50, ${dripAlpha * 0.3})`);
    dripHaloGrad.addColorStop(0.7, `rgba(249, 115, 22, ${dripAlpha * 0.1})`);
    dripHaloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = dripHaloGrad;
    ctx.beginPath();
    ctx.arc(dripX, dripY, size * 0.025, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 200, 50, ${dripAlpha})`;
    ctx.beginPath();
    ctx.arc(dripX, dripY, size * 0.012, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 180, 50, ${dripAlpha * 0.5})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(dripX, dp.y + dp.width * 0.3);
    ctx.lineTo(dripX, dripY);
    ctx.stroke();
  }

  // === TAIL with barbed tip ===
  const tailPos = segmentPositions[0];
  const tailSwish = Math.sin(time * 2) * size * 0.06;
  const tailTipX = tailPos.x + tailSwish;
  const tailTipY = tailPos.y + Math.cos(time * 1.5) * size * 0.04;

  // Tapered tail body
  const tailGrad = ctx.createLinearGradient(tailPos.x, tailPos.y, tailTipX + size * 0.1, tailTipY);
  tailGrad.addColorStop(0, bodyColorDark);
  tailGrad.addColorStop(0.6, "#3a1010");
  tailGrad.addColorStop(1, "#2a0808");
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(tailPos.x - size * 0.05, tailPos.y);
  ctx.bezierCurveTo(
    tailPos.x + size * 0.02, tailTipY - size * 0.025,
    tailTipX - size * 0.02, tailTipY - size * 0.015,
    tailTipX + size * 0.06, tailTipY,
  );
  ctx.bezierCurveTo(
    tailTipX - size * 0.02, tailTipY + size * 0.015,
    tailPos.x + size * 0.02, tailTipY + size * 0.025,
    tailPos.x + size * 0.05, tailPos.y,
  );
  ctx.closePath();
  ctx.fill();

  // Tail scale rings
  ctx.strokeStyle = "rgba(60, 15, 15, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let ring = 0; ring < 6; ring++) {
    const rt = (ring + 1) / 7;
    const rx = tailPos.x + (tailTipX + size * 0.06 - tailPos.x) * rt;
    const ry = tailPos.y + (tailTipY - tailPos.y) * rt;
    const rw = size * 0.04 * (1 - rt * 0.7);
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, rw * 0.4, Math.atan2(tailTipY - tailPos.y, tailTipX - tailPos.x), -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();
  }

  // Barbed tail tip — three-pronged barb
  const barbBaseX = tailTipX + size * 0.06;
  const barbBaseY = tailTipY;
  const barbWobble = Math.sin(time * 3) * size * 0.004;
  const barbGrad = ctx.createLinearGradient(barbBaseX, barbBaseY, barbBaseX + size * 0.08, barbBaseY);
  barbGrad.addColorStop(0, "#2a0808");
  barbGrad.addColorStop(0.5, "#4a1515");
  barbGrad.addColorStop(1, "#3a1010");
  ctx.fillStyle = barbGrad;
  // Central barb (longest)
  ctx.beginPath();
  ctx.moveTo(barbBaseX, barbBaseY - size * 0.012);
  ctx.bezierCurveTo(
    barbBaseX + size * 0.03, barbBaseY - size * 0.008 + barbWobble,
    barbBaseX + size * 0.06, barbBaseY - size * 0.003,
    barbBaseX + size * 0.08, barbBaseY + barbWobble,
  );
  ctx.bezierCurveTo(
    barbBaseX + size * 0.06, barbBaseY + size * 0.003,
    barbBaseX + size * 0.03, barbBaseY + size * 0.008 + barbWobble,
    barbBaseX, barbBaseY + size * 0.012,
  );
  ctx.closePath();
  ctx.fill();
  // Upper barb
  ctx.beginPath();
  ctx.moveTo(barbBaseX + size * 0.01, barbBaseY - size * 0.01);
  ctx.lineTo(barbBaseX + size * 0.05, barbBaseY - size * 0.04 + barbWobble);
  ctx.lineTo(barbBaseX + size * 0.03, barbBaseY - size * 0.005);
  ctx.closePath();
  ctx.fill();
  // Lower barb
  ctx.beginPath();
  ctx.moveTo(barbBaseX + size * 0.01, barbBaseY + size * 0.01);
  ctx.lineTo(barbBaseX + size * 0.05, barbBaseY + size * 0.04 + barbWobble);
  ctx.lineTo(barbBaseX + size * 0.03, barbBaseY + size * 0.005);
  ctx.closePath();
  ctx.fill();
  // Barb lava veins
  setShadowBlur(ctx, 6 * zoom, "#f97316");
  ctx.strokeStyle = `rgba(255, 150, 50, ${lavaPulse * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(barbBaseX, barbBaseY);
  ctx.lineTo(barbBaseX + size * 0.07, barbBaseY + barbWobble);
  ctx.stroke();
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(barbBaseX + size * 0.015, barbBaseY - size * 0.008);
  ctx.lineTo(barbBaseX + size * 0.04, barbBaseY - size * 0.03 + barbWobble);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(barbBaseX + size * 0.015, barbBaseY + size * 0.008);
  ctx.lineTo(barbBaseX + size * 0.04, barbBaseY + size * 0.03 + barbWobble);
  ctx.stroke();
  clearShadow(ctx);

  // === MASSIVE HEAD with detailed jaw anatomy ===
  const headPos = segmentPositions[bodySegments];
  const headX = headPos.x;
  const headBaseY = headPos.y;

  // Skull base - angular cranium shape with bone ridges
  const skullGrad = ctx.createRadialGradient(
    headX, headBaseY - size * 0.02, size * 0.04,
    headX, headBaseY, size * 0.2,
  );
  skullGrad.addColorStop(0, bodyColorLight);
  skullGrad.addColorStop(0.3, bodyColor);
  skullGrad.addColorStop(0.7, bodyColorDark);
  skullGrad.addColorStop(1, "#2a0000");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.17, headBaseY + size * 0.02);
  ctx.bezierCurveTo(
    headX - size * 0.2, headBaseY - size * 0.06,
    headX - size * 0.15, headBaseY - size * 0.16,
    headX, headBaseY - size * 0.15,
  );
  ctx.bezierCurveTo(
    headX + size * 0.15, headBaseY - size * 0.16,
    headX + size * 0.2, headBaseY - size * 0.06,
    headX + size * 0.17, headBaseY + size * 0.02,
  );
  ctx.closePath();
  ctx.fill();

  // Brow ridges (visible bone structure)
  ctx.strokeStyle = "#3a1010";
  ctx.lineWidth = 2.5 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX, headBaseY - size * 0.1);
    ctx.bezierCurveTo(
      headX + side * size * 0.06, headBaseY - size * 0.12,
      headX + side * size * 0.12, headBaseY - size * 0.1,
      headX + side * size * 0.16, headBaseY - size * 0.04,
    );
    ctx.stroke();
  }

  // Upper jaw / snout - elongated reptilian muzzle
  const snoutX = headX;
  const snoutY = headBaseY + size * 0.06;
  const snoutGrad = ctx.createLinearGradient(
    snoutX - size * 0.14, snoutY, snoutX + size * 0.14, snoutY,
  );
  snoutGrad.addColorStop(0, bodyColorDark);
  snoutGrad.addColorStop(0.3, bodyColor);
  snoutGrad.addColorStop(0.7, bodyColor);
  snoutGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = snoutGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.15, headBaseY + size * 0.01);
  ctx.bezierCurveTo(
    headX - size * 0.16, snoutY,
    headX - size * 0.12, snoutY + size * 0.06,
    headX, snoutY + size * 0.08,
  );
  ctx.bezierCurveTo(
    headX + size * 0.12, snoutY + size * 0.06,
    headX + size * 0.16, snoutY,
    headX + size * 0.15, headBaseY + size * 0.01,
  );
  ctx.closePath();
  ctx.fill();

  // Snout bone ridge (center ridge line)
  ctx.strokeStyle = "#3a1515";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX, headBaseY - size * 0.08);
  ctx.bezierCurveTo(
    headX, headBaseY,
    headX, snoutY + size * 0.04,
    headX, snoutY + size * 0.07,
  );
  ctx.stroke();

  // Lateral skull ridges
  ctx.lineWidth = 1.5 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.04, headBaseY - size * 0.06);
    ctx.bezierCurveTo(
      headX + side * size * 0.06, headBaseY,
      headX + side * size * 0.05, snoutY + size * 0.02,
      headX + side * size * 0.03, snoutY + size * 0.06,
    );
    ctx.stroke();
  }

  // Scale plates on snout
  ctx.strokeStyle = "rgba(60, 20, 20, 0.35)";
  ctx.lineWidth = 1 * zoom;
  for (let sp = 0; sp < 5; sp++) {
    const spY = headBaseY + sp * size * 0.025;
    const spW = size * (0.12 - sp * 0.015);
    ctx.beginPath();
    ctx.arc(headX, spY, spW, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }

  // Nostrils with smoke wisps
  for (const side of [-1, 1]) {
    const nostrilX = snoutX + side * size * 0.04;
    const nostrilY = snoutY + size * 0.05;
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.ellipse(nostrilX, nostrilY, size * 0.018, size * 0.012, side * 0.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(150, 50, 20, ${0.3 + sin4 * 0.15})`;
    ctx.lineWidth = 1 * zoom;
    for (let smoke = 0; smoke < 2; smoke++) {
      const smokePhase = (time * 2 + smoke * 0.5 + side) % 1.5;
      ctx.beginPath();
      ctx.moveTo(nostrilX, nostrilY);
      ctx.quadraticCurveTo(
        nostrilX + side * size * 0.02 + Math.sin(time * 3 + smoke) * size * 0.01,
        nostrilY + size * 0.03 + smokePhase * size * 0.04,
        nostrilX + side * size * 0.03,
        nostrilY + size * 0.05 + smokePhase * size * 0.06,
      );
      ctx.stroke();
    }
  }

  // === VOLCANIC HORNS (massive, imposing) ===
  for (const side of [-1, 1]) {
    const hornBaseX = headX + side * size * 0.13;
    const hornBaseY = headBaseY - size * 0.09;
    const hornTipX = hornBaseX + side * size * 0.18;
    const hornTipY = hornBaseY - size * 0.24 + Math.sin(time * 2 + side) * size * 0.012;
    
    // Horn shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.moveTo(hornBaseX + side * size * 0.01, hornBaseY + size * 0.01);
    ctx.quadraticCurveTo(
      hornBaseX + side * size * 0.1, hornBaseY - size * 0.1,
      hornTipX + side * size * 0.01, hornTipY + size * 0.01,
    );
    ctx.lineTo(hornBaseX + side * size * 0.04, hornBaseY + size * 0.01);
    ctx.closePath();
    ctx.fill();
    
    // Main horn body with gradient
    const hornGrad = ctx.createLinearGradient(hornBaseX, hornBaseY, hornTipX, hornTipY);
    hornGrad.addColorStop(0, "#2a0a0a");
    hornGrad.addColorStop(0.3, "#3a1515");
    hornGrad.addColorStop(0.6, "#4a2020");
    hornGrad.addColorStop(1, "#6a3030");
    ctx.fillStyle = hornGrad;
    ctx.beginPath();
    ctx.moveTo(hornBaseX - side * size * 0.01, hornBaseY);
    ctx.quadraticCurveTo(
      hornBaseX + side * size * 0.1, hornBaseY - size * 0.14,
      hornTipX, hornTipY,
    );
    ctx.lineTo(hornBaseX + side * size * 0.03, hornBaseY);
    ctx.closePath();
    ctx.fill();
    
    // Horn ridges (more detailed)
    ctx.strokeStyle = "#5a2525";
    ctx.lineWidth = 1.5 * zoom;
    for (let ridge = 0; ridge < 6; ridge++) {
      const rT = (ridge + 1) / 7;
      const rx = hornBaseX + (hornTipX - hornBaseX) * rT;
      const ry = hornBaseY + (hornTipY - hornBaseY) * rT;
      const rWidth = size * 0.02 * (1 - rT * 0.6);
      ctx.beginPath();
      ctx.moveTo(rx - side * rWidth, ry + size * 0.008);
      ctx.lineTo(rx + side * rWidth, ry + size * 0.008);
      ctx.stroke();
    }
    
    // Molten lava flowing through horn cracks
    setShadowBlur(ctx, 8 * zoom, "#f97316");
    ctx.strokeStyle = `rgba(255, 180, 50, ${lavaPulse * 0.8})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(hornBaseX + side * size * 0.01, hornBaseY);
    ctx.quadraticCurveTo(
      hornBaseX + side * size * 0.08, hornBaseY - size * 0.1,
      hornTipX - side * size * 0.02, hornTipY + size * 0.02,
    );
    ctx.stroke();
    
    // Horn glow tip (intense)
    ctx.fillStyle = `rgba(255, 200, 50, ${lavaPulse * 0.9})`;
    ctx.beginPath();
    ctx.arc(hornTipX, hornTipY, size * 0.015, 0, TAU);
    ctx.fill();
    // Flame wisps from horn tip
    for (let wisp = 0; wisp < 3; wisp++) {
      const wispPhase = time * 6 + wisp * 2;
      const wispH = size * (0.02 + Math.sin(wispPhase) * 0.01);
      ctx.fillStyle = `rgba(255, 180, 50, ${(0.5 + Math.sin(wispPhase) * 0.3) * lavaPulse})`;
      ctx.beginPath();
      ctx.moveTo(hornTipX, hornTipY);
      ctx.quadraticCurveTo(
        hornTipX + side * size * 0.01 + Math.sin(wispPhase) * size * 0.01,
        hornTipY - wispH,
        hornTipX + side * size * 0.02,
        hornTipY - wispH * 2,
      );
      ctx.quadraticCurveTo(
        hornTipX - side * size * 0.005,
        hornTipY - wispH,
        hornTipX, hornTipY,
      );
      ctx.fill();
    }
    clearShadow(ctx);
  }

  // === OPEN MAW with detailed jaw anatomy ===
  // Lower jaw — separate bone structure from upper jaw
  const jawDrop = mawGape;
  const lowerJawY = snoutY + size * 0.06 + jawDrop;
  const lowerJawGrad = ctx.createLinearGradient(
    snoutX - size * 0.12, lowerJawY, snoutX + size * 0.12, lowerJawY,
  );
  lowerJawGrad.addColorStop(0, "#2a0a0a");
  lowerJawGrad.addColorStop(0.3, bodyColorDark);
  lowerJawGrad.addColorStop(0.5, bodyColor);
  lowerJawGrad.addColorStop(0.7, bodyColorDark);
  lowerJawGrad.addColorStop(1, "#2a0a0a");
  ctx.fillStyle = lowerJawGrad;
  ctx.beginPath();
  ctx.moveTo(snoutX - size * 0.13, snoutY + size * 0.03);
  ctx.bezierCurveTo(
    snoutX - size * 0.14, lowerJawY,
    snoutX - size * 0.08, lowerJawY + size * 0.04,
    snoutX, lowerJawY + size * 0.05,
  );
  ctx.bezierCurveTo(
    snoutX + size * 0.08, lowerJawY + size * 0.04,
    snoutX + size * 0.14, lowerJawY,
    snoutX + size * 0.13, snoutY + size * 0.03,
  );
  ctx.closePath();
  ctx.fill();

  // Lower jaw bone ridge
  ctx.strokeStyle = "#3a1515";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(snoutX, lowerJawY + size * 0.04);
  ctx.bezierCurveTo(
    snoutX - size * 0.01, lowerJawY + size * 0.02,
    snoutX - size * 0.08, lowerJawY - size * 0.01,
    snoutX - size * 0.12, snoutY + size * 0.04,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(snoutX, lowerJawY + size * 0.04);
  ctx.bezierCurveTo(
    snoutX + size * 0.01, lowerJawY + size * 0.02,
    snoutX + size * 0.08, lowerJawY - size * 0.01,
    snoutX + size * 0.12, snoutY + size * 0.04,
  );
  ctx.stroke();

  // Maw interior glow (visible between jaws)
  if (jawDrop > size * 0.003) {
    setShadowBlur(ctx, 8 * zoom, "#f97316");
    const mawGrad = ctx.createRadialGradient(
      snoutX, snoutY + size * 0.05 + jawDrop * 0.3, 0,
      snoutX, snoutY + size * 0.05 + jawDrop * 0.3, size * 0.1,
    );
    mawGrad.addColorStop(0, `rgba(255, 220, 80, ${lavaPulse * 0.9})`);
    mawGrad.addColorStop(0.4, `rgba(249, 115, 22, ${lavaPulse * 0.6})`);
    mawGrad.addColorStop(1, `rgba(180, 40, 10, ${lavaPulse * 0.2})`);
    ctx.fillStyle = mawGrad;
    ctx.beginPath();
    ctx.moveTo(snoutX - size * 0.1, snoutY + size * 0.04);
    ctx.quadraticCurveTo(snoutX, snoutY + size * 0.06 + jawDrop * 0.5, snoutX + size * 0.1, snoutY + size * 0.04);
    ctx.quadraticCurveTo(snoutX, lowerJawY + size * 0.02, snoutX - size * 0.1, snoutY + size * 0.04);
    ctx.fill();
    clearShadow(ctx);
  }

  // Upper jaw teeth - multiple rows (outer large fangs + inner smaller teeth)
  ctx.fillStyle = "#f0e8d0";
  for (let row = 0; row < 2; row++) {
    const toothCount = row === 0 ? 8 : 6;
    const toothRadius = size * (row === 0 ? 0.11 : 0.08);
    const toothLen = size * (row === 0 ? 0.035 : 0.02);
    const toothW = size * (row === 0 ? 0.009 : 0.006);
    for (let tooth = 0; tooth < toothCount; tooth++) {
      const toothAngle = -Math.PI * 0.7 + tooth * (Math.PI * 1.4 / toothCount);
      const tx = snoutX + Math.cos(toothAngle) * toothRadius;
      const ty = snoutY + size * 0.02 + row * size * 0.01;
      const tL = toothLen + (tooth % 3 === 0 ? size * 0.015 : 0);
      ctx.fillStyle = row === 0 ? "#f0e8d0" : "#e0d0b0";
      ctx.beginPath();
      ctx.moveTo(tx - toothW, ty);
      ctx.lineTo(tx, ty + tL + jawDrop * 0.25);
      ctx.lineTo(tx + toothW, ty);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Lower jaw teeth (pointing upward)
  for (let row = 0; row < 2; row++) {
    const toothCount = row === 0 ? 6 : 4;
    const toothRadius = size * (row === 0 ? 0.09 : 0.06);
    const toothLen = size * (row === 0 ? 0.03 : 0.018);
    const toothW = size * (row === 0 ? 0.007 : 0.005);
    for (let tooth = 0; tooth < toothCount; tooth++) {
      const toothAngle = -Math.PI * 0.6 + tooth * (Math.PI * 1.2 / toothCount);
      const tx = snoutX + Math.cos(toothAngle) * toothRadius;
      const ty = lowerJawY + size * 0.02;
      ctx.fillStyle = row === 0 ? "#e8dcc0" : "#d8ccb0";
      ctx.beginPath();
      ctx.moveTo(tx - toothW, ty);
      ctx.lineTo(tx, ty - toothLen - jawDrop * 0.15);
      ctx.lineTo(tx + toothW, ty);
      ctx.closePath();
      ctx.fill();
    }
  }

  // === FORKED TONGUE (flickers out when attacking or occasionally) ===
  const tongueExtend = isAttacking ? attackIntensity * 0.8 : Math.max(0, Math.sin(time * 4) * 0.3 - 0.1);
  if (tongueExtend > 0.01) {
    const tongueLen = size * 0.12 * tongueExtend;
    const tongueBaseY = snoutY + size * 0.06 + jawDrop * 0.4;
    const tongueFlick = Math.sin(time * 12) * size * 0.02;
    ctx.strokeStyle = `rgba(200, 40, 40, ${0.7 + tongueExtend * 0.3})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(snoutX, tongueBaseY);
    ctx.quadraticCurveTo(
      snoutX + tongueFlick * 0.3, tongueBaseY + tongueLen * 0.5,
      snoutX + tongueFlick, tongueBaseY + tongueLen * 0.65,
    );
    ctx.stroke();
    // Left fork
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(snoutX + tongueFlick, tongueBaseY + tongueLen * 0.65);
    ctx.quadraticCurveTo(
      snoutX + tongueFlick - size * 0.015, tongueBaseY + tongueLen * 0.8,
      snoutX + tongueFlick - size * 0.025, tongueBaseY + tongueLen,
    );
    ctx.stroke();
    // Right fork
    ctx.beginPath();
    ctx.moveTo(snoutX + tongueFlick, tongueBaseY + tongueLen * 0.65);
    ctx.quadraticCurveTo(
      snoutX + tongueFlick + size * 0.015, tongueBaseY + tongueLen * 0.8,
      snoutX + tongueFlick + size * 0.025, tongueBaseY + tongueLen,
    );
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  // Lava dripping from maw
  setShadowBlur(ctx, 6 * zoom, "#f97316");
  for (let ld = 0; ld < 5; ld++) {
    const ldX = snoutX - size * 0.08 + ld * size * 0.04;
    const ldPhase = (time * 2 + ld * 0.6) % 1.8;
    const ldY = lowerJawY + size * 0.02 + ldPhase * size * 0.1;
    const ldAlpha = Math.max(0, 1 - ldPhase * 0.6) * lavaPulse;
    ctx.fillStyle = `rgba(255, 180, 50, ${ldAlpha})`;
    ctx.beginPath();
    ctx.arc(ldX, ldY, size * 0.008 + ldPhase * size * 0.003, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // === GLOWING EYES ===
  for (const side of [-1, 1]) {
    const eyeX = headX + side * size * 0.08;
    const eyeY = headBaseY - size * 0.04;
    // Eye socket
    ctx.fillStyle = "#2a0000";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.04, size * 0.03, side * 0.15, 0, TAU);
    ctx.fill();
    // Blazing eye
    setShadowBlur(ctx, 16 * zoom, "#ef4444");
    const eyeGrad = ctx.createRadialGradient(
      eyeX,
      eyeY,
      0,
      eyeX,
      eyeY,
      size * 0.035,
    );
    eyeGrad.addColorStop(0, `rgba(255, 255, 150, ${lavaPulse})`);
    eyeGrad.addColorStop(0.3, `rgba(255, 200, 50, ${lavaPulse * 0.9})`);
    eyeGrad.addColorStop(0.6, `rgba(249, 115, 22, ${lavaPulse * 0.7})`);
    eyeGrad.addColorStop(1, `rgba(239, 68, 68, ${lavaPulse * 0.4})`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.035, size * 0.025, side * 0.15, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
    // Slit pupil
    ctx.fillStyle = `rgba(80, 0, 0, ${lavaPulse})`;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.008, size * 0.022, side * 0.15, 0, TAU);
    ctx.fill();
    // Eye fire trail
    ctx.strokeStyle = `rgba(249, 115, 22, ${lavaPulse * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(eyeX + side * size * 0.035, eyeY);
    ctx.bezierCurveTo(
      eyeX + side * size * 0.06,
      eyeY - size * 0.01,
      eyeX + side * size * 0.08,
      eyeY - size * 0.02 + sin6 * size * 0.01,
      eyeX + side * size * 0.1,
      eyeY - size * 0.03 + sin6 * size * 0.015,
    );
    ctx.stroke();
  }

  // === INTERNAL GLOW through scale gaps ===
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let glow = 0; glow < bodySegments - 1; glow++) {
    const p = segmentPositions[glow];
    const next = segmentPositions[glow + 1];
    const gapX = (p.x + next.x) / 2;
    const gapY = (p.y + next.y) / 2;
    const internalGlow = 0.05 + Math.sin(time * 3 + glow * 0.5) * 0.03;
    ctx.fillStyle = `rgba(255, 150, 50, ${internalGlow})`;
    ctx.beginPath();
    ctx.arc(gapX, gapY, p.width * 0.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // === FIRE BREATH when attacking ===
  if (isAttacking) {
    setShadowBlur(ctx, 15 * zoom, "#f97316");
    const breathLen = attackIntensity * size * 0.4;
    for (let fb = 0; fb < 12; fb++) {
      const fbT = fb / 12;
      const fbX = snoutX + Math.sin(time * 10 + fb) * size * 0.04 * fbT;
      const fbY = snoutY + size * 0.12 + mawGape + fbT * breathLen;
      const fbSize = size * (0.02 + fbT * 0.03) * (1 - fbT * 0.3);
      const fbAlpha = (1 - fbT) * attackIntensity;
      ctx.fillStyle =
        fbT < 0.3
          ? `rgba(255, 255, 200, ${fbAlpha * 0.9})`
          : fbT < 0.6
            ? `rgba(255, 200, 50, ${fbAlpha * 0.7})`
            : `rgba(239, 68, 68, ${fbAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(fbX, fbY, fbSize, 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);
  }

  // === HEAD CREST / RIDGE (dramatic multi-layered) ===
  // Back crest layer
  ctx.fillStyle = "#2a0a0a";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headBaseY - size * 0.1);
  ctx.quadraticCurveTo(headX, headBaseY - size * 0.22 + Math.sin(time * 3) * size * 0.015, headX + size * 0.06, headBaseY - size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Front crest
  const crestGrad = ctx.createLinearGradient(headX, headBaseY - size * 0.1, headX, headBaseY - size * 0.2);
  crestGrad.addColorStop(0, bodyColorDark);
  crestGrad.addColorStop(0.5, "#4a1515");
  crestGrad.addColorStop(1, "#6a2525");
  ctx.fillStyle = crestGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.045, headBaseY - size * 0.1);
  ctx.quadraticCurveTo(headX, headBaseY - size * 0.19 + Math.sin(time * 3) * size * 0.012, headX + size * 0.045, headBaseY - size * 0.1);
  ctx.closePath();
  ctx.fill();
  // Crest glow veins
  setShadowBlur(ctx, 8 * zoom, "#f97316");
  ctx.strokeStyle = `rgba(255, 180, 50, ${lavaPulse * 0.8})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.03, headBaseY - size * 0.1);
  ctx.quadraticCurveTo(headX, headBaseY - size * 0.16, headX + size * 0.03, headBaseY - size * 0.1);
  ctx.stroke();
  // Crest flame tips
  for (let cf = 0; cf < 3; cf++) {
    const cfX = headX + (cf - 1) * size * 0.02;
    const cfY = headBaseY - size * 0.15 + Math.sin(time * 5 + cf) * size * 0.01;
    ctx.fillStyle = `rgba(255, 200, 50, ${lavaPulse * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(cfX - size * 0.005, cfY);
    ctx.lineTo(cfX, cfY - size * 0.025 - Math.sin(time * 6 + cf) * size * 0.01);
    ctx.lineTo(cfX + size * 0.005, cfY);
    ctx.closePath();
    ctx.fill();
  }
  clearShadow(ctx);

  // === MOLTEN CORE (glowing between upper segments) ===
  const coreIdx = Math.floor(bodySegments * 0.7);
  if (coreIdx < bodySegments) {
    const cp = segmentPositions[coreIdx];
    setShadowBlur(ctx, 15 * zoom, "#f97316");
    const coreGrad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, cp.width * 0.5);
    coreGrad.addColorStop(0, `rgba(255, 255, 150, ${lavaPulse * 0.8})`);
    coreGrad.addColorStop(0.3, `rgba(255, 200, 50, ${lavaPulse * 0.5})`);
    coreGrad.addColorStop(0.6, `rgba(249, 115, 22, ${lavaPulse * 0.3})`);
    coreGrad.addColorStop(1, `rgba(239, 68, 68, ${lavaPulse * 0.1})`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.width * 0.5, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // === FLAME TRAIL (fiery wake behind body segments) ===
  for (let ft = 0; ft < 6; ft++) {
    const ftIdx = Math.min(ft, bodySegments - 1);
    const ftp = segmentPositions[ftIdx];
    const ftPhase = time * 6 + ft * 1.3;
    const ftH = size * (0.035 + Math.sin(ftPhase) * 0.018);
    const ftAlpha = (0.4 + Math.sin(ftPhase * 0.7) * 0.2) * lavaPulse * (1 - ft * 0.12);
    const ftX = ftp.x + Math.sin(ftPhase) * size * 0.015;
    const ftY = ftp.y - ftp.width * 0.5 - ftH * 0.5;
    const ftGrad = ctx.createRadialGradient(ftX, ftY, 0, ftX, ftY, ftH * 1.5);
    ftGrad.addColorStop(0, `rgba(255, 200, 50, ${ftAlpha})`);
    ftGrad.addColorStop(0.4, `rgba(249, 115, 22, ${ftAlpha * 0.5})`);
    ftGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = ftGrad;
    ctx.beginPath();
    ctx.arc(ftX, ftY, ftH * 1.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 100, ${ftAlpha * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(ftX - size * 0.01, ftp.y - ftp.width * 0.5);
    ctx.quadraticCurveTo(ftX + Math.sin(ftPhase) * size * 0.01, ftY - ftH, ftX + size * 0.01, ftp.y - ftp.width * 0.5);
    ctx.fill();
  }

  // === ORBITING DEBRIS ===
  drawOrbitingDebris(ctx, x, y - size * 0.1, size, time, zoom, {
    count: 8,
    minRadius: 0.6,
    maxRadius: 0.9,
    speed: 0.5,
    particleSize: 0.03,
    color: "#7f1d1d",
    glowColor: "rgba(249, 115, 22, 0.4)",
    trailLen: 0.3,
  });
}
