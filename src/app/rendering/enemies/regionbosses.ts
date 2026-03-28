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
    size * 1.3,
  );
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${crackGlow * 0.28})`);
  auraGrad.addColorStop(0.2, `rgba(251, 191, 36, ${crackGlow * 0.2})`);
  auraGrad.addColorStop(0.4, `rgba(234, 88, 12, ${crackGlow * 0.14})`);
  auraGrad.addColorStop(0.6, `rgba(180, 83, 9, ${crackGlow * 0.07})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.3, size * 1.3, size * 1.3 * ISO_Y_RATIO, 0, 0, TAU);
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
  // Toe lines
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  for (let toe = 0; toe < 3; toe++) {
    const toeX = x - size * 0.34 + toe * size * 0.05 - backLegAnimL * 0.4;
    ctx.beginPath();
    ctx.moveTo(toeX, y + size * 0.5 + backLegAnimL);
    ctx.lineTo(toeX, y + size * 0.48 + backLegAnimL);
    ctx.stroke();
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
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  for (let toe = 0; toe < 3; toe++) {
    const toeX = x + size * 0.24 + toe * size * 0.05 - backLegAnimR * 0.4;
    ctx.beginPath();
    ctx.moveTo(toeX, y + size * 0.5 + backLegAnimR);
    ctx.lineTo(toeX, y + size * 0.48 + backLegAnimR);
    ctx.stroke();
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
    // Ivy leaves
    ctx.fillStyle = `rgba(34, 160, 50, ${ivyPulse * 0.7})`;
    for (let leaf = 0; leaf < 3; leaf++) {
      const lx = vineStartX + (leaf + 1) * size * 0.08;
      const ly =
        vineStartY +
        Math.sin(time * 2 + vine + leaf) * size * 0.04 +
        leaf * size * 0.025;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(Math.sin(time * 3 + leaf + vine) * 0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.02, size * 0.012, 0, 0, TAU);
      ctx.fill();
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
  // Claws (stone)
  ctx.fillStyle = "#3f3a36";
  for (let claw = 0; claw < 4; claw++) {
    const clawX = x - size * 0.37 + claw * size * 0.04 + frontLegAnimL * 0.3;
    const clawY = y + size * 0.48 + frontLegAnimL;
    ctx.beginPath();
    ctx.moveTo(clawX, clawY + size * 0.02);
    ctx.lineTo(clawX - size * 0.008, clawY + size * 0.06);
    ctx.lineTo(clawX + size * 0.008, clawY + size * 0.06);
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
  ctx.fillStyle = "#3f3a36";
  for (let claw = 0; claw < 4; claw++) {
    const clawX = x + size * 0.23 + claw * size * 0.04 + frontLegAnimR * 0.3;
    const clawY = y + size * 0.48 + frontLegAnimR;
    ctx.beginPath();
    ctx.moveTo(clawX, clawY + size * 0.02);
    ctx.lineTo(clawX - size * 0.008, clawY + size * 0.06);
    ctx.lineTo(clawX + size * 0.008, clawY + size * 0.06);
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

  // Nose / snout
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
  ctx.ellipse(headX, headY + size * 0.1, size * 0.15, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Nose detail
  ctx.fillStyle = "#3f3a36";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.06, size * 0.04, size * 0.025, 0, 0, TAU);
  ctx.fill();

  // Whisker grooves (stone-carved)
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  for (let w = 0; w < 3; w++) {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(
        headX + side * size * 0.06,
        headY + size * 0.08 + w * size * 0.015,
      );
      ctx.lineTo(
        headX + side * size * 0.2,
        headY +
          size * 0.06 +
          w * size * 0.02 +
          Math.sin(time + w) * size * 0.01,
      );
      ctx.stroke();
    }
  }

  // === JAW (opens on attack) ===
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    headX,
    headY + size * 0.14 + jawOpen,
    size * 0.13,
    size * 0.06 + jawOpen * 0.5,
    0,
    0,
    TAU,
  );
  ctx.fill();
  // Teeth
  ctx.fillStyle = "#d6d3d1";
  for (let tooth = 0; tooth < 6; tooth++) {
    const toothAngle = -Math.PI * 0.7 + tooth * Math.PI * 0.28;
    const tx = headX + Math.cos(toothAngle) * size * 0.1;
    const ty = headY + size * 0.12 + jawOpen * 0.8;
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.01, ty);
    ctx.lineTo(tx, ty + size * 0.035);
    ctx.lineTo(tx + size * 0.01, ty);
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

  // Scale pattern on main body (enhanced)
  ctx.strokeStyle = `rgba(0, 0, 0, 0.18)`;
  ctx.lineWidth = 1.2 * zoom;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 6; col++) {
      const scaleX = x - size * 0.24 + col * size * 0.1 + (row % 2) * size * 0.05;
      const scaleY = y - size * 0.15 + row * size * 0.08 + bodyUndulate;
      ctx.beginPath();
      ctx.arc(scaleX, scaleY, size * 0.028, 0, Math.PI, true);
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

    // Neck scales/detail
    for (let nsc = 0; nsc < 5; nsc++) {
      const t = (nsc + 1) / 6;
      const wave =
        Math.sin(time * 3 + neck.phaseOff + t * Math.PI) * size * 0.06;
      const nscX = neckBaseX + Math.sin(neckAngle) * neckLen * t + wave;
      const nscY =
        neckBaseY -
        neckLen * t * 0.7 +
        Math.sin(t * Math.PI * 0.5 + time * 2) * size * 0.03;
      ctx.strokeStyle = `rgba(0, 0, 0, 0.12)`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(nscX, nscY, size * 0.03 * hs, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
    }

    // Head position
    const headWave = Math.sin(time * 3 + neck.phaseOff + Math.PI) * size * 0.06;
    const headX = neckBaseX + Math.sin(neckAngle) * neckLen + headWave;
    const headY =
      neckBaseY -
      neckLen * 0.7 +
      Math.sin(Math.PI * 0.5 + time * 2) * size * 0.03;

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

    // Snout
    const snoutDir = neckAngle * 0.5;
    const snoutX = headX + Math.sin(snoutDir) * size * 0.06 * hs;
    const snoutY = headY + size * 0.05 * hs;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(
      snoutX,
      snoutY,
      size * 0.08 * hs,
      size * 0.05 * hs,
      snoutDir * 0.3,
      0,
      TAU,
    );
    ctx.fill();

    // Jaw opening
    const thisJaw = jawSnap * (ni === 1 ? 1.3 : 1);
    ctx.fillStyle = "#1a0a1a";
    ctx.beginPath();
    ctx.ellipse(
      snoutX,
      snoutY + thisJaw * 0.5,
      size * 0.06 * hs,
      size * 0.025 * hs + thisJaw * 0.5,
      0,
      0,
      TAU,
    );
    ctx.fill();

    // Fangs
    ctx.fillStyle = "#e8e0d0";
    for (const fSide of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(snoutX + fSide * size * 0.04 * hs, snoutY + thisJaw * 0.3);
      ctx.lineTo(
        snoutX + fSide * size * 0.035 * hs,
        snoutY + size * 0.04 * hs + thisJaw,
      );
      ctx.lineTo(snoutX + fSide * size * 0.025 * hs, snoutY + thisJaw * 0.3);
      ctx.closePath();
      ctx.fill();
    }

    // Dripping toxic bile
    setShadowBlur(ctx, 4 * zoom, "#22c55e");
    ctx.fillStyle = `rgba(74, 222, 128, ${toxicPulse * 0.7})`;
    for (let drip = 0; drip < 3; drip++) {
      const dripX = snoutX + (drip - 1) * size * 0.025 * hs;
      const dripPhase = (time * 2 + ni * 1.5 + drip * 0.8) % 2;
      const dripY =
        snoutY + size * 0.04 * hs + thisJaw + dripPhase * size * 0.06;
      const dripAlpha = Math.max(0, 1 - dripPhase * 0.6) * toxicPulse;
      ctx.globalAlpha = dripAlpha;
      ctx.beginPath();
      ctx.arc(dripX, dripY, size * 0.008 * hs, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    clearShadow(ctx);

    // Glowing eyes
    for (const eSide of [-1, 1]) {
      const eyeX =
        headX + eSide * size * 0.05 * hs + Math.sin(neckAngle) * size * 0.02;
      const eyeY = headY - size * 0.03 * hs;
      ctx.fillStyle = "#0a0a15";
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, size * 0.025 * hs, size * 0.02 * hs, 0, 0, TAU);
      ctx.fill();
      setShadowBlur(ctx, 10 * zoom, "#22c55e");
      const eGrad = ctx.createRadialGradient(
        eyeX,
        eyeY,
        0,
        eyeX,
        eyeY,
        size * 0.022 * hs,
      );
      eGrad.addColorStop(0, `rgba(200, 255, 200, ${toxicPulse})`);
      eGrad.addColorStop(0.5, `rgba(74, 222, 128, ${toxicPulse * 0.8})`);
      eGrad.addColorStop(1, `rgba(34, 197, 94, ${toxicPulse * 0.4})`);
      ctx.fillStyle = eGrad;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, size * 0.022 * hs, size * 0.017 * hs, 0, 0, TAU);
      ctx.fill();
      // Slit pupil
      ctx.fillStyle = `rgba(0, 40, 0, ${toxicPulse})`;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, size * 0.006 * hs, size * 0.016 * hs, 0, 0, TAU);
      ctx.fill();
      clearShadow(ctx);
    }

    // Head horns/spines (more dramatic)
    ctx.fillStyle = bodyColorDark;
    for (let horn = 0; horn < 5; horn++) {
      const hornAngle = -Math.PI * 0.7 + horn * Math.PI * 0.22 + neckAngle * 0.3;
      const hornLen = size * (0.06 + horn * 0.01 + Math.sin(horn * 2) * 0.015) * hs;
      const hornWobble = Math.sin(time * 3 + ni * 2 + horn) * size * 0.003;
      ctx.beginPath();
      ctx.moveTo(
        headX + Math.cos(hornAngle) * size * 0.09 * hs,
        headY + Math.sin(hornAngle) * size * 0.07 * hs,
      );
      ctx.lineTo(
        headX + Math.cos(hornAngle) * (size * 0.09 * hs + hornLen) + hornWobble,
        headY + Math.sin(hornAngle) * (size * 0.07 * hs + hornLen * 0.5),
      );
      ctx.lineTo(
        headX + Math.cos(hornAngle + 0.2) * size * 0.08 * hs,
        headY + Math.sin(hornAngle + 0.2) * size * 0.06 * hs,
      );
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(74, 222, 128, ${toxicPulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(
        headX + Math.cos(hornAngle) * (size * 0.09 * hs + hornLen * 0.6) + hornWobble,
        headY + Math.sin(hornAngle) * (size * 0.07 * hs + hornLen * 0.3),
        size * 0.005 * hs, 0, TAU,
      );
      ctx.fill();
      ctx.fillStyle = bodyColorDark;
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

  // === GROUND AURA (isometric) ===
  const auraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.2,
    0,
    x,
    y + size * 0.2,
    size * 1.0,
  );
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${goldPulse * 0.2})`);
  auraGrad.addColorStop(0.4, `rgba(217, 119, 6, ${goldPulse * 0.12})`);
  auraGrad.addColorStop(0.7, `rgba(180, 83, 9, ${goldPulse * 0.06})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.2, size * 1.0, size * 1.0 * ISO_Y_RATIO, 0, 0, TAU);
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
    // Wing feather lines
    ctx.strokeStyle = "#7a6020";
    ctx.lineWidth = 1.5 * zoom;
    for (let f = 0; f < 6; f++) {
      const ft = (f + 1) / 7;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.08 + f * size * 0.035);
      ctx.quadraticCurveTo(
        side * size * ft * 0.3,
        -size * 0.25 + f * size * 0.06,
        side * size * ft * 0.38,
        -size * 0.15 + f * size * 0.04,
      );
      ctx.stroke();
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

  // Muscle definition ridges
  ctx.strokeStyle = "#8a6e25";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.05 + breathe);
  ctx.quadraticCurveTo(x - size * 0.15, y + size * 0.15 + breathe, x, y + size * 0.2 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 0.05 + breathe);
  ctx.quadraticCurveTo(x + size * 0.15, y + size * 0.15 + breathe, x, y + size * 0.2 + breathe);
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
    // Toes
    ctx.strokeStyle = "#7a6020";
    ctx.lineWidth = 1.2 * zoom;
    for (let toe = 0; toe < 3; toe++) {
      const toeX = pawX - size * 0.04 + toe * size * 0.04;
      ctx.beginPath();
      ctx.moveTo(toeX, pawBaseY + size * 0.07);
      ctx.lineTo(toeX, pawBaseY + size * 0.05);
      ctx.stroke();
    }
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

  // === ICY BLUE AURA ON GROUND (isometric) ===
  const iceAuraGrad = ctx.createRadialGradient(
    x,
    y + size * 0.5,
    0,
    x,
    y + size * 0.5,
    size * 0.7,
  );
  iceAuraGrad.addColorStop(0, "rgba(56, 189, 248, 0.15)");
  iceAuraGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.08)");
  iceAuraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = iceAuraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.7, size * 0.7 * ISO_Y_RATIO, 0, 0, TAU);
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

  // Main translucent body
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
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.05 + breathe, size * 0.38, size * 0.34, 0, 0, TAU);
  ctx.fill();

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

  // === ICICLE BEARD ===
  ctx.fillStyle = "rgba(186, 230, 253, 0.75)";
  for (let icicle = 0; icicle < 7; icicle++) {
    const icX = x - size * 0.06 + icicle * size * 0.02;
    const icY = headY + size * 0.1;
    const icLen =
      size * (0.06 + Math.sin(icicle * 1.5) * 0.02) +
      Math.sin(time * 2 + icicle) * size * 0.005;
    ctx.beginPath();
    ctx.moveTo(icX - size * 0.006, icY);
    ctx.lineTo(icX, icY + icLen);
    ctx.lineTo(icX + size * 0.006, icY);
    ctx.closePath();
    ctx.fill();
  }
  // Frost on icicles
  ctx.fillStyle = `rgba(255, 255, 255, ${icePulse * 0.5})`;
  for (let icicle = 0; icicle < 7; icicle++) {
    const icX = x - size * 0.06 + icicle * size * 0.02;
    const icY = headY + size * 0.1;
    ctx.beginPath();
    ctx.arc(icX, icY + size * 0.005, size * 0.005, 0, TAU);
    ctx.fill();
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

  // === MASSIVE FIRE AURA (isometric) ===
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.2);
  auraGrad.addColorStop(0, `rgba(239, 68, 68, ${lavaPulse * 0.2})`);
  auraGrad.addColorStop(0.3, `rgba(249, 115, 22, ${lavaPulse * 0.15})`);
  auraGrad.addColorStop(0.6, `rgba(234, 88, 12, ${lavaPulse * 0.08})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 1.2, size * 1.2 * ISO_Y_RATIO, 0, 0, TAU);
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

  // Draw body segments back to front
  for (let seg = 0; seg < bodySegments; seg++) {
    const p = segmentPositions[seg];
    const t = seg / bodySegments;

    // Outer dark scale layer
    const scaleGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.width);
    scaleGrad.addColorStop(0, bodyColorLight);
    scaleGrad.addColorStop(0.4, bodyColor);
    scaleGrad.addColorStop(0.8, bodyColorDark);
    scaleGrad.addColorStop(1, "#2a0000");
    ctx.fillStyle = scaleGrad;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.width, p.width * ISO_Y_RATIO, 0, 0, TAU);
    ctx.fill();

    // Molten glow between scales
    if (seg < bodySegments - 1) {
      const next = segmentPositions[seg + 1];
      const gapX = (p.x + next.x) / 2;
      const gapY = (p.y + next.y) / 2;
      const glowAlpha = lavaPulse * 0.5 * (1 - t * 0.5);
      setShadowBlur(ctx, 6 * zoom, "#f97316");
      ctx.fillStyle = `rgba(255, 180, 50, ${glowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(gapX, gapY, p.width * 0.7, p.width * 0.25, 0, 0, TAU);
      ctx.fill();
      clearShadow(ctx);
    }

    // Scale detail lines
    ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.width * 0.6, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();
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

  // === LAVA DRIPPING from body ===
  for (let drip = 0; drip < 8; drip++) {
    const dripIdx = Math.floor((drip * bodySegments) / 8);
    if (dripIdx >= bodySegments) continue;
    const dp = segmentPositions[dripIdx];
    const dripPhase = (time * 1.5 + drip * 0.7) % 2;
    const dripX = dp.x + Math.sin(drip * 2.3) * dp.width * 0.5;
    const dripY = dp.y + dp.width * 0.4 + dripPhase * size * 0.08;
    const dripAlpha = Math.max(0, 1 - dripPhase * 0.6) * lavaPulse;
    ctx.fillStyle = `rgba(255, 180, 50, ${dripAlpha})`;
    ctx.beginPath();
    ctx.arc(dripX, dripY, size * 0.01, 0, TAU);
    ctx.fill();
    // Trail
    ctx.strokeStyle = `rgba(255, 180, 50, ${dripAlpha * 0.5})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(dripX, dp.y + dp.width * 0.3);
    ctx.lineTo(dripX, dripY);
    ctx.stroke();
  }

  // === TAIL with flame tip ===
  const tailPos = segmentPositions[0];
  const tailTipX = tailPos.x + Math.sin(time * 2) * size * 0.06;
  const tailTipY = tailPos.y + Math.cos(time * 1.5) * size * 0.04;
  // Tail end taper
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(tailPos.x - size * 0.04, tailPos.y);
  ctx.quadraticCurveTo(
    tailTipX,
    tailTipY - size * 0.02,
    tailTipX + size * 0.08,
    tailTipY,
  );
  ctx.quadraticCurveTo(
    tailTipX,
    tailTipY + size * 0.02,
    tailPos.x + size * 0.04,
    tailPos.y,
  );
  ctx.fill();
  // Flame at tail tip
  setShadowBlur(ctx, 10 * zoom, "#f97316");
  for (let flame = 0; flame < 5; flame++) {
    const flamePhase = time * 8 + flame * 1.2;
    const flameH = size * (0.04 + Math.sin(flamePhase) * 0.02);
    const flameX = tailTipX + size * 0.08 + flame * size * 0.01;
    const flameY = tailTipY;
    ctx.fillStyle =
      flame < 2
        ? `rgba(255, 255, 100, ${0.6 + Math.sin(flamePhase) * 0.3})`
        : `rgba(249, 115, 22, ${0.5 + Math.sin(flamePhase) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(flameX, flameY - flameH * 0.3);
    ctx.quadraticCurveTo(
      flameX + size * 0.02,
      flameY - flameH,
      flameX + size * 0.01,
      flameY + flameH * 0.3,
    );
    ctx.quadraticCurveTo(
      flameX - size * 0.005,
      flameY + flameH * 0.5,
      flameX,
      flameY - flameH * 0.3,
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // === MASSIVE HEAD ===
  const headPos = segmentPositions[bodySegments];
  const headX = headPos.x;
  const headBaseY = headPos.y;

  // Head shape - elongated reptilian
  const headGrad = ctx.createRadialGradient(
    headX,
    headBaseY,
    0,
    headX,
    headBaseY,
    size * 0.2,
  );
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.4, bodyColor);
  headGrad.addColorStop(0.8, bodyColorDark);
  headGrad.addColorStop(1, "#2a0000");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headBaseY, size * 0.18, size * 0.14, 0, 0, TAU);
  ctx.fill();

  // Snout
  const snoutX = headX;
  const snoutY = headBaseY + size * 0.1;
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(snoutX, snoutY, size * 0.14, size * 0.08, 0, 0, TAU);
  ctx.fill();

  // Nostrils with smoke
  for (const side of [-1, 1]) {
    const nostrilX = snoutX + side * size * 0.04;
    const nostrilY = snoutY + size * 0.03;
    ctx.fillStyle = "#1a0000";
    ctx.beginPath();
    ctx.ellipse(nostrilX, nostrilY, size * 0.015, size * 0.01, 0, 0, TAU);
    ctx.fill();
    // Smoke wisps
    ctx.strokeStyle = `rgba(150, 50, 20, ${0.3 + sin4 * 0.15})`;
    ctx.lineWidth = 1 * zoom;
    for (let smoke = 0; smoke < 2; smoke++) {
      const smokePhase = (time * 2 + smoke * 0.5 + side) % 1.5;
      ctx.beginPath();
      ctx.moveTo(nostrilX, nostrilY);
      ctx.quadraticCurveTo(
        nostrilX +
          side * size * 0.02 +
          Math.sin(time * 3 + smoke) * size * 0.01,
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

  // === OPEN MAW dripping lava ===
  // Lower jaw
  ctx.fillStyle = "#1a0000";
  ctx.beginPath();
  ctx.ellipse(
    snoutX,
    snoutY + size * 0.05 + mawGape,
    size * 0.12,
    size * 0.05 + mawGape * 0.3,
    0,
    0,
    TAU,
  );
  ctx.fill();

  // Maw interior glow
  if (mawGape > size * 0.005) {
    setShadowBlur(ctx, 8 * zoom, "#f97316");
    const mawGrad = ctx.createRadialGradient(
      snoutX,
      snoutY + size * 0.04,
      0,
      snoutX,
      snoutY + size * 0.04,
      size * 0.1,
    );
    mawGrad.addColorStop(0, `rgba(255, 200, 50, ${lavaPulse * 0.8})`);
    mawGrad.addColorStop(0.5, `rgba(249, 115, 22, ${lavaPulse * 0.5})`);
    mawGrad.addColorStop(1, `rgba(239, 68, 68, ${lavaPulse * 0.2})`);
    ctx.fillStyle = mawGrad;
    ctx.beginPath();
    ctx.ellipse(
      snoutX,
      snoutY + size * 0.04,
      size * 0.08,
      size * 0.03 + mawGape * 0.2,
      0,
      0,
      TAU,
    );
    ctx.fill();
    clearShadow(ctx);
  }

  // Teeth (upper jaw)
  ctx.fillStyle = "#e8d8b0";
  for (let tooth = 0; tooth < 8; tooth++) {
    const toothAngle = -Math.PI * 0.7 + tooth * Math.PI * 0.2;
    const tx = snoutX + Math.cos(toothAngle) * size * 0.1;
    const ty = snoutY + size * 0.01;
    const tLen = size * (0.03 + (tooth % 3 === 0 ? 0.015 : 0));
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.008, ty);
    ctx.lineTo(tx, ty + tLen + mawGape * 0.3);
    ctx.lineTo(tx + size * 0.008, ty);
    ctx.closePath();
    ctx.fill();
  }
  // Lower teeth
  for (let tooth = 0; tooth < 6; tooth++) {
    const toothAngle = -Math.PI * 0.6 + tooth * Math.PI * 0.24;
    const tx = snoutX + Math.cos(toothAngle) * size * 0.08;
    const ty = snoutY + size * 0.07 + mawGape;
    ctx.beginPath();
    ctx.moveTo(tx - size * 0.006, ty);
    ctx.lineTo(tx, ty - size * 0.025 - mawGape * 0.2);
    ctx.lineTo(tx + size * 0.006, ty);
    ctx.closePath();
    ctx.fill();
  }

  // Lava dripping from maw
  setShadowBlur(ctx, 6 * zoom, "#f97316");
  for (let ld = 0; ld < 4; ld++) {
    const ldX = snoutX - size * 0.06 + ld * size * 0.04;
    const ldPhase = (time * 2 + ld * 0.6) % 1.8;
    const ldY = snoutY + size * 0.08 + mawGape + ldPhase * size * 0.1;
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
