// Winter region enemy sprites

import { ISO_Y_RATIO } from "../../constants/isometric";
import { setShadowBlur, clearShadow } from "../performance";
import { drawFrostCrystals, drawShiftingSegments, drawOrbitingDebris, drawFloatingPiece } from "./animationHelpers";
import { drawPathArm, drawPathLegs } from "./darkFantasyHelpers";

// =====================================================
// WINTER REGION TROOPS
// =====================================================

export function drawSnowGoblinEnemy(
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
  // FROST GOBLIN - Malevolent ice creature with frozen claws and cruel cunning
  const isAttacking = attackPhase > 0;
  const hop = Math.abs(Math.sin(time * 6)) * size * 0.12;
  const armWave = Math.sin(time * 5) * 0.35;
  const frostPulse = 0.6 + Math.sin(time * 3) * 0.4;
  const shiver = Math.sin(time * 20) * size * 0.01;
  size *= 1.6; // Larger size

  // Frost aura
  const frostGrad = ctx.createRadialGradient(
    x,
    y - hop,
    0,
    x,
    y - hop,
    size * 0.7,
  );
  frostGrad.addColorStop(0, `rgba(147, 197, 253, ${frostPulse * 0.1})`);
  frostGrad.addColorStop(0.5, `rgba(96, 165, 250, ${frostPulse * 0.05})`);
  frostGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = frostGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - hop, size * 0.7, size * 0.7 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();


  // Frozen footprints
  ctx.fillStyle = "rgba(147, 197, 253, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    y + size * 0.35,
    size * 0.08,
    size * 0.08 * ISO_Y_RATIO,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.15,
    y + size * 0.33,
    size * 0.08,
    size * 0.08 * ISO_Y_RATIO,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Expanding frost rings around footprints
  for (let ring = 0; ring < 2; ring++) {
    const ringPhase = (time * 0.8 + ring * 0.5) % 1;
    const ringAlpha = (1 - ringPhase) * 0.3;
    const ringRadius = size * (0.05 + ringPhase * 0.12);
    ctx.strokeStyle = `rgba(147, 197, 253, ${ringAlpha})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.15, y + size * 0.35, ringRadius, ringRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.15, y + size * 0.33, ringRadius, ringRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Big goblin feet — oversized bezier shapes with splayed toes
  ctx.fillStyle = bodyColorDark;
  for (const ftSide of [-1, 1] as const) {
    const ftX = x + ftSide * size * 0.14 + ftSide * shiver;
    const ftY = y + size * 0.28 - hop;
    ctx.beginPath();
    ctx.moveTo(ftX - ftSide * size * 0.06, ftY - size * 0.04);
    ctx.bezierCurveTo(
      ftX - ftSide * size * 0.1, ftY - size * 0.02,
      ftX - ftSide * size * 0.12, ftY + size * 0.02,
      ftX - ftSide * size * 0.08, ftY + size * 0.05,
    );
    ctx.bezierCurveTo(
      ftX - ftSide * size * 0.02, ftY + size * 0.07,
      ftX + ftSide * size * 0.06, ftY + size * 0.065,
      ftX + ftSide * size * 0.12, ftY + size * 0.04,
    );
    ctx.bezierCurveTo(
      ftX + ftSide * size * 0.14, ftY + size * 0.02,
      ftX + ftSide * size * 0.1, ftY - size * 0.03,
      ftX - ftSide * size * 0.06, ftY - size * 0.04,
    );
    ctx.fill();
  }

  // Foot claws
  ctx.fillStyle = "#1e3a5f";
  for (let foot = -1; foot <= 1; foot += 2) {
    for (let claw = 0; claw < 3; claw++) {
      const clawX = x + foot * size * 0.14 + (claw - 1) * size * 0.04 * foot;
      const clawY = y + size * 0.32 - hop;
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + foot * size * 0.02, clawY + size * 0.04);
      ctx.lineTo(clawX - foot * size * 0.01, clawY + size * 0.02);
      ctx.fill();
    }
  }

  // --- Armored legs (fast hopping stride) ---
  drawPathLegs(ctx, x + shiver, y + size * 0.05 - hop, size, time, zoom, {
    color: bodyColor,
    colorDark: bodyColorDark,
    footColor: "#1e3a5f",
    strideSpeed: 8,
    strideAmt: 0.4,
    legLen: 0.2,
    width: 0.05,
    style: 'armored',
  });

  // --- Snow Goblin arms — frantic clawing forward ---
  drawPathArm(ctx, x - size * 0.22, y - size * 0.1 - hop, size, time, zoom, -1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: "#93c5fd",
    shoulderAngle: -0.7 + Math.sin(time * 5) * 0.25 + (isAttacking ? -attackPhase * 0.5 : 0),
    elbowAngle: 0.4 + Math.sin(time * 6 + 0.8) * 0.2,
    upperLen: 0.15,
    foreLen: 0.12,
    width: 0.045,
    handRadius: 0.025,
    style: 'armored',
  });
  drawPathArm(ctx, x + size * 0.22, y - size * 0.1 - hop, size, time, zoom, 1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: "#93c5fd",
    shoulderAngle: 0.7 + Math.sin(time * 5 + Math.PI) * 0.25 + (isAttacking ? attackPhase * 0.5 : 0),
    elbowAngle: 0.4 + Math.sin(time * 6 + 2.5) * 0.2,
    upperLen: 0.15,
    foreLen: 0.12,
    width: 0.045,
    handRadius: 0.025,
    attackExtra: isAttacking ? attackPhase : 0,
    style: 'armored',
  });

  // Hunched muscular body — scrappy asymmetric frame
  const bodyGrad = ctx.createRadialGradient(
    x, y - size * 0.05 - hop, 0,
    x, y - hop, size * 0.38,
  );
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28 + shiver, y + size * 0.18 - hop);
  ctx.bezierCurveTo(
    x - size * 0.34 + shiver, y + size * 0.05 - hop,
    x - size * 0.32, y - size * 0.12 - hop,
    x - size * 0.22, y - size * 0.2 - hop,
  );
  ctx.bezierCurveTo(
    x - size * 0.12, y - size * 0.28 - hop,
    x + size * 0.05, y - size * 0.27 - hop,
    x + size * 0.18, y - size * 0.22 - hop,
  );
  ctx.bezierCurveTo(
    x + size * 0.3, y - size * 0.15 - hop,
    x + size * 0.32, y - size * 0.02 - hop,
    x + size * 0.28 + shiver, y + size * 0.15 - hop,
  );
  ctx.bezierCurveTo(
    x + size * 0.2, y + size * 0.22 - hop,
    x - size * 0.15, y + size * 0.24 - hop,
    x - size * 0.28 + shiver, y + size * 0.18 - hop,
  );
  ctx.fill();

  // Patched fur cloak detail — stitched patches
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1.5 * zoom;
  const patchData = [
    { px: -0.15, py: -0.08, pw: 0.12, ph: 0.1 },
    { px: 0.08, py: 0.0, pw: 0.1, ph: 0.08 },
    { px: -0.05, py: 0.1, pw: 0.11, ph: 0.07 },
  ];
  for (let pi = 0; pi < patchData.length; pi++) {
    const p = patchData[pi];
    const pCx = x + p.px * size + shiver;
    const pCy = y + p.py * size - hop;
    ctx.fillStyle = `rgba(${80 + pi * 30}, ${100 + pi * 20}, ${130 + pi * 10}, 0.3)`;
    ctx.beginPath();
    ctx.rect(pCx, pCy, p.pw * size, p.ph * size);
    ctx.fill();
    ctx.stroke();
    // Stitch marks
    ctx.beginPath();
    for (let st = 0; st < 3; st++) {
      const stX = pCx + st * p.pw * size * 0.4;
      ctx.moveTo(stX, pCy);
      ctx.lineTo(stX + size * 0.01, pCy - size * 0.015);
      ctx.moveTo(stX, pCy + p.ph * size);
      ctx.lineTo(stX + size * 0.01, pCy + p.ph * size + size * 0.015);
    }
    ctx.stroke();
  }

  // Frost patterns on body
  ctx.strokeStyle = `rgba(147, 197, 253, ${frostPulse * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15 - hop);
  ctx.lineTo(x - size * 0.1, y - size * 0.05 - hop);
  ctx.lineTo(x - size * 0.18, y + size * 0.05 - hop);
  ctx.moveTo(x + size * 0.12, y - size * 0.1 - hop);
  ctx.lineTo(x + size * 0.08, y + size * 0.02 - hop);
  ctx.stroke();

  // Icy belly patch — organic bezier shape
  ctx.fillStyle = bodyColorLight;
  const belCx = x;
  const belCy = y + size * 0.08 - hop;
  ctx.beginPath();
  ctx.moveTo(belCx, belCy - size * 0.1);
  ctx.bezierCurveTo(
    belCx + size * 0.1, belCy - size * 0.08,
    belCx + size * 0.16, belCy - size * 0.02,
    belCx + size * 0.14, belCy + size * 0.04,
  );
  ctx.bezierCurveTo(
    belCx + size * 0.1, belCy + size * 0.12,
    belCx - size * 0.1, belCy + size * 0.12,
    belCx - size * 0.14, belCy + size * 0.04,
  );
  ctx.bezierCurveTo(
    belCx - size * 0.16, belCy - size * 0.02,
    belCx - size * 0.1, belCy - size * 0.08,
    belCx, belCy - size * 0.1,
  );
  ctx.fill();

  // Icicle drips from body armor edges
  for (let icicle = 0; icicle < 5; icicle++) {
    const icicleX = x - size * 0.2 + icicle * size * 0.1;
    const icicleBaseY = y + size * 0.18 - hop;
    const icicleLen = size * (0.06 + Math.sin(icicle * 1.3 + time * 0.5) * 0.02);
    ctx.fillStyle = `rgba(191, 219, 254, ${0.7 + frostPulse * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(icicleX - size * 0.012, icicleBaseY);
    ctx.lineTo(icicleX, icicleBaseY + icicleLen);
    ctx.lineTo(icicleX + size * 0.012, icicleBaseY);
    ctx.fill();
    const dripPhase = (time * 0.6 + icicle * 0.2) % 1;
    if (dripPhase < 0.5) {
      ctx.fillStyle = `rgba(147, 197, 253, ${(0.5 - dripPhase) * 1.2})`;
      ctx.beginPath();
      ctx.arc(icicleX, icicleBaseY + icicleLen + dripPhase * size * 0.15, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Wiry muscular arms with frost claws
  ctx.fillStyle = bodyColor;
  // Left arm raised aggressively
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.1 - hop);
  ctx.quadraticCurveTo(
    x - size * 0.4 + armWave * size * 0.15,
    y - size * 0.2 - hop,
    x - size * 0.38 + armWave * size * 0.12,
    y - size * 0.35 - hop,
  );
  ctx.lineTo(x - size * 0.32 + armWave * size * 0.1, y - size * 0.32 - hop);
  ctx.quadraticCurveTo(
    x - size * 0.32,
    y - size * 0.15 - hop,
    x - size * 0.22,
    y - size * 0.08 - hop,
  );
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.1 - hop);
  ctx.quadraticCurveTo(
    x + size * 0.4 - armWave * size * 0.15,
    y - size * 0.15 - hop,
    x + size * 0.38 - armWave * size * 0.12,
    y - size * 0.3 - hop,
  );
  ctx.lineTo(x + size * 0.32 - armWave * size * 0.1, y - size * 0.27 - hop);
  ctx.quadraticCurveTo(
    x + size * 0.32,
    y - size * 0.12 - hop,
    x + size * 0.22,
    y - size * 0.08 - hop,
  );
  ctx.fill();

  // Crude icicle club in right hand
  ctx.save();
  const clubBaseX = x + size * 0.38 - armWave * size * 0.12;
  const clubBaseY = y - size * 0.3 - hop;
  const clubAngle = -0.6 + armWave * 0.3 + (isAttacking ? attackPhase * 0.8 : 0);
  ctx.translate(clubBaseX, clubBaseY);
  ctx.rotate(clubAngle);
  // Club shaft — rough tapered bezier
  ctx.fillStyle = "#4a6a8a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, 0);
  ctx.bezierCurveTo(-size * 0.025, -size * 0.08, -size * 0.03, -size * 0.2, -size * 0.035, -size * 0.3);
  ctx.bezierCurveTo(-size * 0.02, -size * 0.35, size * 0.02, -size * 0.35, size * 0.035, -size * 0.3);
  ctx.bezierCurveTo(size * 0.03, -size * 0.2, size * 0.025, -size * 0.08, size * 0.02, 0);
  ctx.closePath();
  ctx.fill();
  // Club head — jagged ice chunk
  ctx.fillStyle = `rgba(180, 210, 240, ${0.8 + frostPulse * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.28);
  ctx.lineTo(-size * 0.06, -size * 0.38);
  ctx.lineTo(-size * 0.02, -size * 0.42);
  ctx.lineTo(size * 0.02, -size * 0.4);
  ctx.lineTo(size * 0.05, -size * 0.36);
  ctx.lineTo(size * 0.04, -size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.29);
  ctx.lineTo(-size * 0.02, -size * 0.38);
  ctx.moveTo(size * 0.02, -size * 0.3);
  ctx.lineTo(size * 0.03, -size * 0.36);
  ctx.stroke();
  ctx.restore();

  // Ice claws on hands
  ctx.fillStyle = `rgba(147, 197, 253, ${0.8 + frostPulse * 0.2})`;
  setShadowBlur(ctx, 4 * zoom, "#93c5fd");
  for (let claw = 0; claw < 3; claw++) {
    // Left hand claws
    const leftClawAngle = -0.8 + claw * 0.3 + armWave * 0.2;
    const leftClawX = x - size * 0.38 + armWave * size * 0.12;
    const leftClawY = y - size * 0.35 - hop;
    ctx.beginPath();
    ctx.moveTo(leftClawX, leftClawY);
    ctx.lineTo(
      leftClawX + Math.cos(leftClawAngle) * size * 0.12,
      leftClawY + Math.sin(leftClawAngle) * size * 0.1,
    );
    ctx.lineTo(
      leftClawX + Math.cos(leftClawAngle + 0.15) * size * 0.06,
      leftClawY + Math.sin(leftClawAngle + 0.15) * size * 0.05,
    );
    ctx.fill();
    // Right hand claws
    const rightClawAngle = -2.3 - claw * 0.3 - armWave * 0.2;
    const rightClawX = x + size * 0.38 - armWave * size * 0.12;
    const rightClawY = y - size * 0.3 - hop;
    ctx.beginPath();
    ctx.moveTo(rightClawX, rightClawY);
    ctx.lineTo(
      rightClawX + Math.cos(rightClawAngle) * size * 0.12,
      rightClawY + Math.sin(rightClawAngle) * size * 0.1,
    );
    ctx.lineTo(
      rightClawX + Math.cos(rightClawAngle - 0.15) * size * 0.06,
      rightClawY + Math.sin(rightClawAngle - 0.15) * size * 0.05,
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // Large cruel head
  const headGrad = ctx.createRadialGradient(
    x,
    y - size * 0.38 - hop,
    0,
    x,
    y - size * 0.38 - hop,
    size * 0.28,
  );
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.6, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  // Goblin cranium — lumpy bezier skull
  ctx.fillStyle = headGrad;
  const hcx = x + shiver;
  const hcy = y - size * 0.38 - hop;
  const hR = size * 0.26;
  ctx.beginPath();
  ctx.moveTo(hcx, hcy - hR);
  ctx.bezierCurveTo(
    hcx + hR * 0.65, hcy - hR * 1.05,
    hcx + hR * 1.1, hcy - hR * 0.35,
    hcx + hR * 0.95, hcy + hR * 0.15,
  );
  ctx.bezierCurveTo(
    hcx + hR * 0.85, hcy + hR * 0.6,
    hcx + hR * 0.35, hcy + hR * 0.95,
    hcx, hcy + hR * 0.85,
  );
  ctx.bezierCurveTo(
    hcx - hR * 0.35, hcy + hR * 0.95,
    hcx - hR * 0.85, hcy + hR * 0.6,
    hcx - hR * 0.95, hcy + hR * 0.15,
  );
  ctx.bezierCurveTo(
    hcx - hR * 1.1, hcy - hR * 0.35,
    hcx - hR * 0.65, hcy - hR * 1.05,
    hcx, hcy - hR,
  );
  ctx.fill();

  // Spiky frost crown/hair
  ctx.fillStyle = `rgba(147, 197, 253, ${0.7 + frostPulse * 0.3})`;
  for (let spike = 0; spike < 5; spike++) {
    const spikeAngle = -Math.PI * 0.7 + spike * 0.35;
    const spikeLen = size * (0.15 + Math.sin(spike * 1.5) * 0.05);
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(spikeAngle) * size * 0.22,
      y - size * 0.38 - hop + Math.sin(spikeAngle) * size * 0.22,
    );
    ctx.lineTo(
      x + Math.cos(spikeAngle) * (size * 0.22 + spikeLen),
      y -
        size * 0.38 -
        hop +
        Math.sin(spikeAngle) * (size * 0.22 + spikeLen * 0.8),
    );
    ctx.lineTo(
      x + Math.cos(spikeAngle + 0.15) * size * 0.22,
      y - size * 0.38 - hop + Math.sin(spikeAngle + 0.15) * size * 0.22,
    );
    ctx.fill();
  }

  // Long wicked pointed ears with frost tips — bezier articulated
  ctx.fillStyle = bodyColor;
  // Left ear — wide base tapering to sharp point
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.42 - hop);
  ctx.bezierCurveTo(
    x - size * 0.3, y - size * 0.46 - hop,
    x - size * 0.4, y - size * 0.54 - hop,
    x - size * 0.47, y - size * 0.62 - hop,
  );
  ctx.bezierCurveTo(
    x - size * 0.44, y - size * 0.58 - hop,
    x - size * 0.38, y - size * 0.52 - hop,
    x - size * 0.32, y - size * 0.48 - hop,
  );
  ctx.bezierCurveTo(
    x - size * 0.26, y - size * 0.44 - hop,
    x - size * 0.22, y - size * 0.42 - hop,
    x - size * 0.2, y - size * 0.4 - hop,
  );
  ctx.fill();
  // Left ear inner fold
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.43 - hop);
  ctx.bezierCurveTo(
    x - size * 0.32, y - size * 0.48 - hop,
    x - size * 0.38, y - size * 0.54 - hop,
    x - size * 0.42, y - size * 0.58 - hop,
  );
  ctx.stroke();
  // Right ear
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.42 - hop);
  ctx.bezierCurveTo(
    x + size * 0.3, y - size * 0.46 - hop,
    x + size * 0.4, y - size * 0.54 - hop,
    x + size * 0.47, y - size * 0.62 - hop,
  );
  ctx.bezierCurveTo(
    x + size * 0.44, y - size * 0.58 - hop,
    x + size * 0.38, y - size * 0.52 - hop,
    x + size * 0.32, y - size * 0.48 - hop,
  );
  ctx.bezierCurveTo(
    x + size * 0.26, y - size * 0.44 - hop,
    x + size * 0.22, y - size * 0.42 - hop,
    x + size * 0.2, y - size * 0.4 - hop,
  );
  ctx.fill();
  // Right ear inner fold
  ctx.strokeStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y - size * 0.43 - hop);
  ctx.bezierCurveTo(
    x + size * 0.32, y - size * 0.48 - hop,
    x + size * 0.38, y - size * 0.54 - hop,
    x + size * 0.42, y - size * 0.58 - hop,
  );
  ctx.stroke();

  // Frost on ear tips
  ctx.fillStyle = `rgba(147, 197, 253, ${frostPulse * 0.8})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.45, y - size * 0.6 - hop, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.45, y - size * 0.6 - hop, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Deep-set malevolent eyes
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.4 - hop,
    size * 0.07,
    size * 0.08,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.4 - hop,
    size * 0.07,
    size * 0.08,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing icy irises
  ctx.fillStyle = `rgba(96, 165, 250, ${0.8 + frostPulse * 0.2})`;
  setShadowBlur(ctx, 8 * zoom, "#60a5fa");
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.4 - hop, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.4 - hop, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Slit pupils
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.4 - hop,
    size * 0.012,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.4 - hop,
    size * 0.012,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Sharp-toothed grin
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28 - hop, size * 0.1, size * 0.05, 0, 0, Math.PI);
  ctx.fill();

  // Jagged teeth
  ctx.fillStyle = `rgba(147, 197, 253, ${0.9 + frostPulse * 0.1})`;
  for (let tooth = 0; tooth < 6; tooth++) {
    const toothX = x - size * 0.075 + tooth * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(toothX, y - size * 0.3 - hop);
    ctx.lineTo(toothX + size * 0.015, y - size * 0.26 - hop);
    ctx.lineTo(toothX + size * 0.03, y - size * 0.3 - hop);
    ctx.fill();
  }

  // Frost breath mist
  ctx.fillStyle = `rgba(147, 197, 253, ${0.3 + Math.sin(time * 4) * 0.15})`;
  for (let breath = 0; breath < 3; breath++) {
    const breathX = x + Math.sin(time * 3 + breath * 1.5) * size * 0.15;
    const breathY = y - size * 0.2 - hop - breath * size * 0.05;
    ctx.beginPath();
    ctx.arc(breathX, breathY, size * (0.04 - breath * 0.01), 0, Math.PI * 2);
    ctx.fill();
  }

  // Directional frost breath cone
  const breathConeAlpha = 0.12 + Math.sin(time * 4) * 0.08;
  ctx.fillStyle = `rgba(191, 219, 254, ${breathConeAlpha})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25 - hop);
  ctx.lineTo(x + size * 0.3, y - size * 0.38 - hop + Math.sin(time * 5) * size * 0.03);
  ctx.lineTo(x + size * 0.25, y - size * 0.15 - hop + Math.sin(time * 4) * size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Swirling ice crystals
  ctx.fillStyle = "#fff";
  setShadowBlur(ctx, 4 * zoom, "#93c5fd");
  for (let c = 0; c < 6; c++) {
    const cx = x + Math.sin(time * 2.5 + c * 1.05) * size * 0.5;
    const cy =
      y - size * 0.35 + Math.cos(time * 2 + c * 1.2) * size * 0.3 - hop;
    const crystalSize = size * (0.035 + Math.sin(c) * 0.015);
    // 6-pointed ice crystal
    ctx.beginPath();
    for (let point = 0; point < 6; point++) {
      const angle = point * (Math.PI / 3) + time * 0.5;
      const px = cx + Math.cos(angle) * crystalSize;
      const py = cy + Math.sin(angle) * crystalSize;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  clearShadow(ctx);

  // --- Floating frost crystals ---
  drawFrostCrystals(ctx, x, y - size * 0.1 - hop, size * 0.35, time, zoom, {
    color: "rgba(147, 197, 253, 0.5)",
    glowColor: "rgba(220, 240, 255, 0.6)",
    count: 4,
    speed: 2.0,
    maxAlpha: 0.4,
  });

  // --- Floating ice crystal shards ---
  drawShiftingSegments(ctx, x, y - size * 0.15 - hop, size, time, zoom, {
    color: "rgba(191, 219, 254, 0.7)",
    colorAlt: "rgba(147, 197, 253, 0.5)",
    count: 5,
    orbitRadius: 0.38,
    segmentSize: 0.035,
    orbitSpeed: 2.5,
    shape: "shard",
  });

  // Frost breath mist puffs
  ctx.save();
  for (let fb = 0; fb < 4; fb++) {
    const fbPhase = (time * 1.2 + fb * 0.25) % 1;
    const fbX = x + size * 0.08 + fbPhase * size * 0.2;
    const fbY = y - size * 0.28 - hop + Math.sin(time * 5 + fb) * size * 0.02;
    const fbAlpha = (1 - fbPhase) * frostPulse * 0.2;
    const fbSize = size * (0.02 + fbPhase * 0.03);
    const fbGrad = ctx.createRadialGradient(fbX, fbY, 0, fbX, fbY, fbSize);
    fbGrad.addColorStop(0, `rgba(200, 230, 255, ${fbAlpha})`);
    fbGrad.addColorStop(1, "rgba(147, 197, 253, 0)");
    ctx.fillStyle = fbGrad;
    ctx.beginPath();
    ctx.arc(fbX, fbY, fbSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Icy ground frost creep around feet
  ctx.save();
  const frostCreepAlpha = 0.15 + frostPulse * 0.1;
  const frostCreepGrad = ctx.createRadialGradient(x, y + size * 0.3 - hop, size * 0.05, x, y + size * 0.3 - hop, size * 0.35);
  frostCreepGrad.addColorStop(0, `rgba(200, 230, 255, ${frostCreepAlpha})`);
  frostCreepGrad.addColorStop(0.6, `rgba(147, 197, 253, ${frostCreepAlpha * 0.5})`);
  frostCreepGrad.addColorStop(1, "rgba(96, 165, 250, 0)");
  ctx.fillStyle = frostCreepGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.3 - hop, size * 0.35, size * 0.15 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ice crystal particles swirling around body
  ctx.save();
  for (let ic = 0; ic < 6; ic++) {
    const icAngle = time * 2.5 + ic * Math.PI * 0.333;
    const icDist = size * (0.2 + Math.sin(time * 1.8 + ic * 2) * 0.06);
    const icX = x + Math.cos(icAngle) * icDist + shiver;
    const icY = y - size * 0.15 - hop + Math.sin(icAngle * 0.8) * size * 0.15;
    const icAlpha = 0.3 + Math.sin(time * 4 + ic * 1.5) * 0.15;
    const icSize = size * (0.02 + Math.sin(ic * 1.3) * 0.008);
    ctx.fillStyle = `rgba(200, 230, 255, ${icAlpha * frostPulse})`;
    ctx.beginPath();
    ctx.moveTo(icX, icY - icSize);
    ctx.lineTo(icX + icSize * 0.4, icY);
    ctx.lineTo(icX, icY + icSize * 0.6);
    ctx.lineTo(icX - icSize * 0.4, icY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Frost breath mist puffs
  ctx.save();
  for (let fb = 0; fb < 4; fb++) {
    const fbPhase = (time * 0.8 + fb * 0.25) % 1;
    const fbX = x + Math.sin(time * 3 + fb * 1.5) * size * 0.06 + shiver;
    const fbY = y - size * 0.28 - hop - fbPhase * size * 0.12;
    const fbAlpha = (1 - fbPhase) * 0.2 * frostPulse;
    const fbSize = size * (0.02 + fbPhase * 0.03);
    const fbGrad = ctx.createRadialGradient(fbX, fbY, 0, fbX, fbY, fbSize);
    fbGrad.addColorStop(0, `rgba(200, 230, 255, ${fbAlpha})`);
    fbGrad.addColorStop(1, "rgba(147, 197, 253, 0)");
    ctx.fillStyle = fbGrad;
    ctx.beginPath();
    ctx.arc(fbX, fbY, fbSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Attack ice shards with frost burst
  if (isAttacking) {
    const burstIntensity = Math.sin(attackPhase * Math.PI);

    // Frost burst flash from body
    const burstGrad = ctx.createRadialGradient(
      x, y - size * 0.3 - hop, 0,
      x, y - size * 0.3 - hop, size * attackPhase * 0.5,
    );
    burstGrad.addColorStop(0, `rgba(200, 230, 255, ${burstIntensity * 0.4})`);
    burstGrad.addColorStop(1, "rgba(147, 197, 253, 0)");
    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.3 - hop, size * attackPhase * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Radiating ice shard projectiles
    ctx.fillStyle = `rgba(147, 197, 253, ${attackPhase * 0.7})`;
    setShadowBlur(ctx, 4 * zoom, "#93c5fd");
    for (let shard = 0; shard < 8; shard++) {
      const shardAngle = (shard / 8) * Math.PI * 2 + time * 2;
      const shardDist = attackPhase * size * 0.6;
      const shardX = x + Math.cos(shardAngle) * shardDist;
      const shardY = y - size * 0.3 - hop + Math.sin(shardAngle) * shardDist * 0.5;
      const shardSize = size * 0.04 * (1 - attackPhase * 0.3);
      ctx.beginPath();
      ctx.moveTo(shardX, shardY - shardSize);
      ctx.lineTo(shardX + shardSize * 0.4, shardY);
      ctx.lineTo(shardX, shardY + shardSize * 0.6);
      ctx.lineTo(shardX - shardSize * 0.4, shardY);
      ctx.closePath();
      ctx.fill();
    }
    clearShadow(ctx);
  }

  // Swarm speed: ice dash afterimage trail (fading blue body copies)
  ctx.save();
  for (let ai = 0; ai < 3; ai++) {
    const aiOffset = (ai + 1) * size * 0.1 + Math.sin(time * 6 + ai) * size * 0.015;
    const aiScale = 1 - (ai + 1) * 0.13;
    const aiAlpha = [0.15, 0.10, 0.06][ai];
    ctx.globalAlpha = aiAlpha;
    ctx.fillStyle = "#93c5fd";
    ctx.beginPath();
    ctx.ellipse(
      x + aiOffset, y - hop + ai * size * 0.01,
      size * 0.12 * aiScale, size * 0.18 * aiScale,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Swarm speed: snow spray kicked up from feet
  ctx.save();
  for (let sp = 0; sp < 6; sp++) {
    const spPhase = (time * 5 + sp * 0.5) % 1.2;
    const spSide = sp % 2 === 0 ? -1 : 1;
    const spX = x + spSide * size * 0.1 + spPhase * spSide * size * 0.12;
    const spY = y + size * 0.3 - hop - spPhase * size * 0.15;
    const spAlpha = Math.max(0, 0.22 - spPhase * 0.18);
    const spR = size * 0.012 * (1 - spPhase * 0.5);
    ctx.fillStyle = `rgba(200, 225, 255, ${spAlpha})`;
    ctx.beginPath();
    ctx.arc(spX, spY, spR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawYetiEnemy(
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
  // ANCIENT YETI - Primordial ice titan, terror of the frozen wastes
  const isAttacking = attackPhase > 0;
  const breathe = Math.sin(time * 1.2) * 0.04;
  const walkPhase = time * 1.5;
  const leftStride = Math.sin(walkPhase);
  const rightStride = Math.sin(walkPhase + Math.PI);
  const leftLegLift = Math.max(0, leftStride) * size * 0.05;
  const rightLegLift = Math.max(0, rightStride) * size * 0.05;
  const leftLegFwd = leftStride * size * 0.04;
  const rightLegFwd = rightStride * size * 0.04;
  const armSwingL = Math.sin(walkPhase + Math.PI) * 0.15;
  const armSwingR = Math.sin(walkPhase) * 0.15;
  const roar = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.15 : 0;
  const chestHeave = Math.sin(time * 1.5) * 0.02;
  const frostPulse = 0.6 + Math.sin(time * 2.5) * 0.4;
  size *= 1.25; // Larger size

  // Blizzard aura effect
  const blizzardGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.0);
  blizzardGrad.addColorStop(0, "rgba(147, 197, 253, 0)");
  blizzardGrad.addColorStop(0.6, `rgba(147, 197, 253, ${frostPulse * 0.08})`);
  blizzardGrad.addColorStop(1, `rgba(96, 165, 250, ${frostPulse * 0.12})`);
  ctx.fillStyle = blizzardGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 1.0, 0, Math.PI * 2);
  ctx.fill();


  // Ice cracks radiating from feet
  ctx.strokeStyle = `rgba(147, 197, 253, ${frostPulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let crack = 0; crack < 6; crack++) {
    const crackAngle = crack * (Math.PI / 3) + Math.PI * 0.1;
    const crackLen = size * (0.35 + Math.sin(crack * 1.5) * 0.1);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(crackAngle) * size * 0.3, y + size * 0.55);
    ctx.lineTo(
      x + Math.cos(crackAngle) * crackLen,
      y + size * 0.55 + Math.sin(crackAngle * 0.3) * size * 0.08,
    );
    ctx.stroke();
  }

  // Massive tree-trunk legs with alternating heavy stride
  const legGrad = ctx.createLinearGradient(
    x,
    y + size * 0.1,
    x,
    y + size * 0.5,
  );
  legGrad.addColorStop(0, bodyColor);
  legGrad.addColorStop(0.7, bodyColorDark);
  legGrad.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = legGrad;

  // Left leg — massive bezier tree-trunk with muscular taper
  ctx.beginPath();
  const llx = x - size * 0.25 + leftLegFwd;
  const lly = y + size * 0.32 - leftLegLift;
  ctx.moveTo(llx - size * 0.14, lly - size * 0.28);
  ctx.bezierCurveTo(
    llx - size * 0.22, lly - size * 0.15,
    llx - size * 0.24, lly + size * 0.08,
    llx - size * 0.16, lly + size * 0.28,
  );
  ctx.bezierCurveTo(
    llx - size * 0.06, lly + size * 0.34,
    llx + size * 0.06, lly + size * 0.34,
    llx + size * 0.16, lly + size * 0.28,
  );
  ctx.bezierCurveTo(
    llx + size * 0.24, lly + size * 0.08,
    llx + size * 0.22, lly - size * 0.15,
    llx + size * 0.14, lly - size * 0.28,
  );
  ctx.closePath();
  ctx.fill();

  // Right leg — massive bezier tree-trunk
  ctx.beginPath();
  const rlx = x + size * 0.25 + rightLegFwd;
  const rly = y + size * 0.35 - rightLegLift;
  ctx.moveTo(rlx - size * 0.14, rly - size * 0.28);
  ctx.bezierCurveTo(
    rlx - size * 0.22, rly - size * 0.15,
    rlx - size * 0.24, rly + size * 0.08,
    rlx - size * 0.16, rly + size * 0.28,
  );
  ctx.bezierCurveTo(
    rlx - size * 0.06, rly + size * 0.34,
    rlx + size * 0.06, rly + size * 0.34,
    rlx + size * 0.16, rly + size * 0.28,
  );
  ctx.bezierCurveTo(
    rlx + size * 0.24, rly + size * 0.08,
    rlx + size * 0.22, rly - size * 0.15,
    rlx + size * 0.14, rly - size * 0.28,
  );
  ctx.closePath();
  ctx.fill();

  // Leg fur texture
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2 * zoom;
  for (let fur = 0; fur < 6; fur++) {
    const furY = y + size * 0.15 + fur * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.38 + leftLegFwd, furY - leftLegLift);
    ctx.lineTo(
      x - size * 0.42 + leftLegFwd,
      furY + size * 0.03 - leftLegLift,
    );
    ctx.moveTo(x + size * 0.38 + rightLegFwd, furY - rightLegLift);
    ctx.lineTo(
      x + size * 0.42 + rightLegFwd,
      furY + size * 0.03 - rightLegLift,
    );
    ctx.stroke();
  }

  // Snow powder shaking from fur during movement
  const strideIntensity = Math.abs(Math.sin(walkPhase * 2));
  ctx.fillStyle = `rgba(255, 255, 255, ${strideIntensity * 0.45})`;
  for (let powder = 0; powder < 8; powder++) {
    const powderSide = powder < 4 ? -1 : 1;
    const powderIdx = powder % 4;
    const powderPhase = (time * 2 + powderIdx * 0.25) % 1;
    const px = x + powderSide * size * (0.4 + powderPhase * 0.15) + Math.sin(time * 5 + powder) * size * 0.05;
    const py = y - size * 0.1 + powderIdx * size * 0.12 - powderPhase * size * 0.1;
    const powderRadius = size * 0.02 * (1 - powderPhase) * strideIntensity;
    if (powderRadius > 0.001) {
      ctx.beginPath();
      ctx.arc(px, py, powderRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Massive clawed feet — broad bezier paw shapes
  ctx.fillStyle = "#1e3a5f";
  for (const footData of [
    { fx: x - size * 0.28 + leftLegFwd, fy: y + size * 0.55 - leftLegLift, dir: -1 },
    { fx: x + size * 0.28 + rightLegFwd, fy: y + size * 0.55 - rightLegLift, dir: 1 },
  ] as const) {
    const fW = size * 0.15;
    const fH = size * 0.08;
    ctx.beginPath();
    ctx.moveTo(footData.fx - fW, footData.fy);
    ctx.bezierCurveTo(
      footData.fx - fW * 1.1, footData.fy - fH * 0.8,
      footData.fx - fW * 0.3, footData.fy - fH * 1.2,
      footData.fx, footData.fy - fH * 0.9,
    );
    ctx.bezierCurveTo(
      footData.fx + fW * 0.3, footData.fy - fH * 1.2,
      footData.fx + fW * 1.1, footData.fy - fH * 0.8,
      footData.fx + fW, footData.fy,
    );
    ctx.bezierCurveTo(
      footData.fx + fW * 0.8, footData.fy + fH,
      footData.fx - fW * 0.8, footData.fy + fH,
      footData.fx - fW, footData.fy,
    );
    ctx.fill();
  }

  // Foot claws
  ctx.fillStyle = "#0f172a";
  for (let foot = -1; foot <= 1; foot += 2) {
    const footLift = foot < 0 ? leftLegLift : rightLegLift;
    const footFwd = foot < 0 ? leftLegFwd : rightLegFwd;
    for (let claw = 0; claw < 4; claw++) {
      const clawX =
        x + foot * size * 0.28 + footFwd + (claw - 1.5) * size * 0.05 * foot;
      const clawY = y + size * 0.58 - footLift;
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + foot * size * 0.03, clawY + size * 0.06);
      ctx.lineTo(clawX - foot * size * 0.01, clawY + size * 0.03);
      ctx.fill();
    }
  }

  // Ground impact ice particles when foot lands
  const leftImpact = Math.max(0, -Math.sin(walkPhase - 0.2));
  const rightImpact = Math.max(0, -Math.sin(walkPhase + Math.PI - 0.2));
  if (leftImpact > 0.85) {
    const impactStr = (leftImpact - 0.85) * 6;
    ctx.fillStyle = `rgba(147, 197, 253, ${impactStr * 0.5})`;
    for (let d = 0; d < 4; d++) {
      ctx.beginPath();
      ctx.arc(
        x - size * 0.28 + (d - 1.5) * size * 0.06,
        y + size * 0.57,
        size * 0.025 * impactStr,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  if (rightImpact > 0.85) {
    const impactStr = (rightImpact - 0.85) * 6;
    ctx.fillStyle = `rgba(147, 197, 253, ${impactStr * 0.5})`;
    for (let d = 0; d < 4; d++) {
      ctx.beginPath();
      ctx.arc(
        x + size * 0.28 + (d - 1.5) * size * 0.06,
        y + size * 0.57,
        size * 0.025 * impactStr,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // --- Massive fleshy legs (heavy stomping stride) ---
  drawPathLegs(ctx, x, y + size * 0.12, size, time, zoom, {
    color: bodyColor,
    colorDark: bodyColorDark,
    footColor: "#1e3a5f",
    strideSpeed: 2.5,
    strideAmt: 0.25,
    legLen: 0.3,
    width: 0.1,
    style: 'fleshy',
  });

  // --- Yeti arms — gorilla knuckle-drag / chest pound ---
  drawPathArm(ctx, x - size * 0.45, y - size * 0.35, size, time, zoom, -1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: bodyColorDark,
    shoulderAngle: -0.3 + Math.sin(time * 1.5) * 0.1 + (isAttacking ? -attackPhase * 0.7 : 0),
    elbowAngle: 0.6 + Math.sin(time * 2 + 0.5) * 0.12,
    upperLen: 0.25,
    foreLen: 0.22,
    width: 0.1,
    handRadius: 0.06,
    style: 'fleshy',
  });
  drawPathArm(ctx, x + size * 0.45, y - size * 0.35, size, time, zoom, 1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: bodyColorDark,
    shoulderAngle: 0.3 + Math.sin(time * 1.5 + Math.PI) * 0.1 + (isAttacking ? attackPhase * 0.7 : 0),
    elbowAngle: 0.6 + Math.sin(time * 2 + 2) * 0.12,
    upperLen: 0.25,
    foreLen: 0.22,
    width: 0.1,
    handRadius: 0.06,
    attackExtra: isAttacking ? attackPhase : 0,
    style: 'fleshy',
  });

  // Titanic furry body — massive hunched muscular frame with bezier anatomy
  const bodyGrad = ctx.createRadialGradient(
    x, y - size * 0.15, 0,
    x, y - size * 0.1, size * 0.65,
  );
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.4, bodyColor);
  bodyGrad.addColorStop(0.8, bodyColorDark);
  bodyGrad.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.52, y + size * 0.12);
  ctx.bezierCurveTo(
    x - size * 0.62, y - size * 0.05,
    x - size * 0.65, y - size * 0.32,
    x - size * 0.48, y - size * 0.52,
  );
  ctx.bezierCurveTo(
    x - size * 0.38, y - size * 0.65,
    x - size * 0.2, y - size * 0.74 + breathe * size,
    x, y - size * 0.72 + breathe * size,
  );
  ctx.bezierCurveTo(
    x + size * 0.2, y - size * 0.74 + breathe * size,
    x + size * 0.38, y - size * 0.65,
    x + size * 0.48, y - size * 0.52,
  );
  ctx.bezierCurveTo(
    x + size * 0.65, y - size * 0.32,
    x + size * 0.62, y - size * 0.05,
    x + size * 0.52, y + size * 0.12,
  );
  ctx.bezierCurveTo(
    x + size * 0.4, y + size * 0.2,
    x + size * 0.2, y + size * 0.22,
    x, y + size * 0.2,
  );
  ctx.bezierCurveTo(
    x - size * 0.2, y + size * 0.22,
    x - size * 0.4, y + size * 0.2,
    x - size * 0.52, y + size * 0.12,
  );
  ctx.fill();

  // Layered fur rendered as overlapping stroke groups
  ctx.lineCap = "round";
  for (let furLayer = 0; furLayer < 3; furLayer++) {
    const layerY = y - size * 0.35 + furLayer * size * 0.18;
    ctx.strokeStyle = furLayer === 0 ? bodyColorLight : (furLayer === 1 ? bodyColor : bodyColorDark);
    ctx.lineWidth = (2.5 - furLayer * 0.5) * zoom;
    for (let strand = 0; strand < 8; strand++) {
      const strandX = x - size * 0.4 + strand * size * 0.1 + Math.sin(strand * 1.3 + furLayer) * size * 0.03;
      const strandLen = size * (0.06 + Math.sin(strand * 0.9 + furLayer * 1.2) * 0.02);
      const strandSway = Math.sin(time * 2 + strand * 0.8 + furLayer * 0.5) * size * 0.01;
      ctx.beginPath();
      ctx.moveTo(strandX, layerY);
      ctx.lineTo(strandX + strandSway, layerY + strandLen);
      ctx.stroke();
    }
  }

  // Chest muscle definition
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    y - size * 0.1 + chestHeave * size,
    size * 0.18,
    size * 0.22,
    -0.15,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.12,
    y - size * 0.1 + chestHeave * size,
    size * 0.18,
    size * 0.22,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Ice crystals embedded in fur
  ctx.fillStyle = `rgba(147, 197, 253, ${0.6 + frostPulse * 0.3})`;
  for (let ice = 0; ice < 5; ice++) {
    const iceX = x - size * 0.3 + ice * size * 0.15;
    const iceY = y - size * 0.3 + Math.sin(ice * 1.8) * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(iceX, iceY - size * 0.05);
    ctx.lineTo(iceX + size * 0.025, iceY);
    ctx.lineTo(iceX, iceY + size * 0.05);
    ctx.lineTo(iceX - size * 0.025, iceY);
    ctx.closePath();
    ctx.fill();
  }

  // Enormous muscular arms with stride swing
  ctx.fillStyle = bodyColor;
  const leftArmSwing = armSwingL * size * 0.4;
  const rightArmSwing = armSwingR * size * 0.4;
  const leftArmRaise =
    (isAttacking ? roar * size * 0.4 : 0) + leftArmSwing;

  // Left arm
  ctx.beginPath();
  ctx.moveTo(x - size * 0.48, y - size * 0.4);
  ctx.quadraticCurveTo(
    x - size * 0.68,
    y - size * 0.15 - leftArmRaise,
    x - size * 0.62,
    y + size * 0.22 - leftArmRaise,
  );
  ctx.quadraticCurveTo(
    x - size * 0.5,
    y + size * 0.3 - leftArmRaise,
    x - size * 0.42,
    y + size * 0.22 - leftArmRaise,
  );
  ctx.quadraticCurveTo(
    x - size * 0.48,
    y - size * 0.05 - leftArmRaise,
    x - size * 0.4,
    y - size * 0.35,
  );
  ctx.fill();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.48, y - size * 0.4);
  ctx.quadraticCurveTo(
    x + size * 0.68,
    y - size * 0.1 - rightArmSwing,
    x + size * 0.62,
    y + size * 0.28 - rightArmSwing,
  );
  ctx.quadraticCurveTo(
    x + size * 0.5,
    y + size * 0.35 - rightArmSwing,
    x + size * 0.42,
    y + size * 0.28 - rightArmSwing,
  );
  ctx.quadraticCurveTo(
    x + size * 0.48,
    y - rightArmSwing * 0.5,
    x + size * 0.4,
    y - size * 0.35,
  );
  ctx.fill();

  // Arm fur highlights
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.55, y - size * 0.25 - leftArmRaise);
  ctx.lineTo(x - size * 0.58, y - size * 0.2 - leftArmRaise);
  ctx.moveTo(x + size * 0.55, y - size * 0.2 - rightArmSwing);
  ctx.lineTo(x + size * 0.58, y - size * 0.15 - rightArmSwing);
  ctx.stroke();

  // Massive crushing hands with claws
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.6,
    y + size * 0.28 - leftArmRaise,
    size * 0.14,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.6,
    y + size * 0.32 - rightArmSwing,
    size * 0.14,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Hand claws - ice-tipped
  ctx.fillStyle = `rgba(147, 197, 253, ${0.8 + frostPulse * 0.2})`;
  for (let hand = -1; hand <= 1; hand += 2) {
    const handY =
      hand < 0
        ? y + size * 0.28 - leftArmRaise
        : y + size * 0.32 - rightArmSwing;
    for (let claw = 0; claw < 4; claw++) {
      const clawAngle =
        (hand < 0 ? Math.PI * 0.6 : Math.PI * 0.4) + claw * 0.25 * hand;
      ctx.beginPath();
      ctx.moveTo(
        x + hand * size * 0.6 + Math.cos(clawAngle) * size * 0.1,
        handY + Math.sin(clawAngle) * size * 0.1,
      );
      ctx.lineTo(
        x + hand * size * 0.6 + Math.cos(clawAngle) * size * 0.22,
        handY + Math.sin(clawAngle) * size * 0.18,
      );
      ctx.lineTo(
        x + hand * size * 0.6 + Math.cos(clawAngle + 0.12) * size * 0.1,
        handY + Math.sin(clawAngle + 0.12) * size * 0.1,
      );
      ctx.fill();
    }
  }

  // Massive flat head with feral features — wide and low
  const headGrad = ctx.createRadialGradient(
    x, y - size * 0.55, 0,
    x, y - size * 0.55, size * 0.3,
  );
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.5, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.48);
  ctx.bezierCurveTo(
    x - size * 0.3, y - size * 0.55,
    x - size * 0.25, y - size * 0.68,
    x - size * 0.12, y - size * 0.72,
  );
  ctx.bezierCurveTo(
    x - size * 0.04, y - size * 0.74,
    x + size * 0.04, y - size * 0.74,
    x + size * 0.12, y - size * 0.72,
  );
  ctx.bezierCurveTo(
    x + size * 0.25, y - size * 0.68,
    x + size * 0.3, y - size * 0.55,
    x + size * 0.28, y - size * 0.48,
  );
  ctx.bezierCurveTo(
    x + size * 0.2, y - size * 0.44,
    x - size * 0.2, y - size * 0.44,
    x - size * 0.28, y - size * 0.48,
  );
  ctx.fill();

  // Pronounced heavy brow ridge — thick shelf overhanging eyes
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.6);
  ctx.bezierCurveTo(
    x - size * 0.25, y - size * 0.67,
    x - size * 0.1, y - size * 0.68,
    x, y - size * 0.66,
  );
  ctx.bezierCurveTo(
    x + size * 0.1, y - size * 0.68,
    x + size * 0.25, y - size * 0.67,
    x + size * 0.28, y - size * 0.6,
  );
  ctx.bezierCurveTo(
    x + size * 0.22, y - size * 0.62,
    x - size * 0.22, y - size * 0.62,
    x - size * 0.28, y - size * 0.6,
  );
  ctx.fill();

  // Face fur pattern (lighter)
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.52, size * 0.18, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heavy angry brow
  ctx.strokeStyle = "#1e3a5f";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.65);
  ctx.quadraticCurveTo(
    x - size * 0.1,
    y - size * 0.6,
    x - size * 0.05,
    y - size * 0.58,
  );
  ctx.moveTo(x + size * 0.18, y - size * 0.65);
  ctx.quadraticCurveTo(
    x + size * 0.1,
    y - size * 0.6,
    x + size * 0.05,
    y - size * 0.58,
  );
  ctx.stroke();

  // Fierce glowing eyes
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.58,
    size * 0.055,
    size * 0.04,
    -0.15,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.58,
    size * 0.055,
    size * 0.04,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Icy blue glowing irises
  ctx.fillStyle = `rgba(14, 165, 233, ${0.8 + frostPulse * 0.2})`;
  setShadowBlur(ctx, 12 * zoom, "#0ea5e9");
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.58, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.58, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Slit pupils
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.58,
    size * 0.01,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.58,
    size * 0.01,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Snout/muzzle
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#1e3a5f";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.5, size * 0.04, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // Roaring mouth with massive fangs
  ctx.fillStyle = "#0f172a";
  const mouthOpen = Math.max(0.001, size * (0.06 + roar * 0.8));
  const mouthWidth = Math.max(0.001, size * 0.1 + roar * size * 0.05);
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.43, mouthWidth, mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();

  // Massive fangs
  ctx.fillStyle = "#f1f5f9";
  // Upper fangs
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.46);
  ctx.lineTo(x - size * 0.06, y - size * 0.38 - roar * size * 0.1);
  ctx.lineTo(x - size * 0.04, y - size * 0.46);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.46);
  ctx.lineTo(x + size * 0.06, y - size * 0.38 - roar * size * 0.1);
  ctx.lineTo(x + size * 0.04, y - size * 0.46);
  ctx.fill();
  // Lower fangs (when roaring)
  if (roar > 0.05) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.05, y - size * 0.4 + roar * size * 0.2);
    ctx.lineTo(x - size * 0.03, y - size * 0.46);
    ctx.lineTo(x - size * 0.01, y - size * 0.4 + roar * size * 0.2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.05, y - size * 0.4 + roar * size * 0.2);
    ctx.lineTo(x + size * 0.03, y - size * 0.46);
    ctx.lineTo(x + size * 0.01, y - size * 0.4 + roar * size * 0.2);
    ctx.fill();
  }

  // Small row of teeth
  ctx.fillStyle = "#e2e8f0";
  for (let tooth = 0; tooth < 4; tooth++) {
    const toothX = x - size * 0.04 + tooth * size * 0.025;
    ctx.beginPath();
    ctx.moveTo(toothX, y - size * 0.45);
    ctx.lineTo(toothX + size * 0.01, y - size * 0.42 - roar * size * 0.03);
    ctx.lineTo(toothX + size * 0.02, y - size * 0.45);
    ctx.fill();
  }

  // Rage roar shockwave rings during attack
  if (isAttacking && attackPhase > 0.1) {
    const roarWave = Math.sin(attackPhase * Math.PI);
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (attackPhase * 2 + ring * 0.3) % 1;
      const ringRadius = size * (0.3 + ringPhase * 0.6);
      const ringAlpha = (1 - ringPhase) * roarWave * 0.25;
      ctx.strokeStyle = `rgba(147, 197, 253, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring) * zoom;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.45, ringRadius, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
    }
  }

  // Frost breath - enhanced when attacking
  if (isAttacking && attackPhase > 0.2) {
    const breathIntensity = (attackPhase - 0.2) * 1.25;
    // Multiple breath layers
    for (let layer = 0; layer < 3; layer++) {
      const layerOffset = layer * 0.15;
      ctx.fillStyle = `rgba(200, 240, 255, ${breathIntensity * (0.4 - layer * 0.1)})`;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.42);
      ctx.quadraticCurveTo(
        x +
          size * (0.35 + layer * 0.1) +
          Math.sin(time * 10 + layer) * size * 0.05,
        y - size * (0.55 + layerOffset),
        x + size * (0.6 + layer * 0.15),
        y - size * (0.4 + layerOffset),
      );
      ctx.quadraticCurveTo(
        x + size * (0.35 + layer * 0.1),
        y - size * (0.35 + layerOffset),
        x,
        y - size * 0.42,
      );
      ctx.fill();
    }

    // Ice particles in breath
    ctx.fillStyle = `rgba(255, 255, 255, ${breathIntensity * 0.8})`;
    for (let particle = 0; particle < 8; particle++) {
      const pProgress = (attackPhase * 2 + particle * 0.12) % 1;
      const px = x + pProgress * size * 0.7;
      const py =
        y - size * 0.45 + Math.sin(particle * 1.5 + time * 8) * size * 0.1;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ambient snow/frost particles
  ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 2) * 0.3})`;
  for (let snow = 0; snow < 10; snow++) {
    const snowX = x + Math.sin(time * 1.5 + snow * 0.65) * size * 0.7;
    const snowY =
      y - size * 0.2 + Math.cos(time * 1.2 + snow * 0.8) * size * 0.5;
    ctx.beginPath();
    ctx.arc(snowX, snowY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Frost breath vapor trail from mouth
  ctx.save();
  for (let breath = 0; breath < 5; breath++) {
    const breathPhase = (time * 0.7 + breath * 0.2) % 1;
    const bx = x + size * 0.15 + breathPhase * size * 0.3;
    const by = y - size * 0.35 + Math.sin(time * 3 + breath * 1.3) * size * 0.05;
    const bAlpha = (1 - breathPhase) * frostPulse * 0.2;
    const bSize = size * (0.03 + breathPhase * 0.05);
    const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, bSize);
    bGrad.addColorStop(0, `rgba(200, 230, 255, ${bAlpha})`);
    bGrad.addColorStop(0.6, `rgba(147, 197, 253, ${bAlpha * 0.5})`);
    bGrad.addColorStop(1, "rgba(96, 165, 250, 0)");
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Blizzard snow vortex swirl
  ctx.save();
  for (let vortex = 0; vortex < 10; vortex++) {
    const vAngle = time * 1.8 + vortex * Math.PI * 0.2;
    const vDist = size * (0.5 + vortex * 0.03 + Math.sin(time * 2 + vortex) * 0.04);
    const vx = x + Math.cos(vAngle) * vDist;
    const vy = y - size * 0.1 + Math.sin(vAngle * 0.5) * size * 0.3;
    const vAlpha = (0.25 - vortex * 0.02) * frostPulse;
    ctx.fillStyle = `rgba(220, 240, 255, ${vAlpha})`;
    ctx.beginPath();
    ctx.arc(vx, vy, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // --- Floating ice crystal shards ---
  drawFrostCrystals(ctx, x, y - size * 0.15, size * 0.55, time, zoom, {
    color: "rgba(147, 197, 253, 0.45)",
    glowColor: "rgba(200, 230, 255, 0.5)",
    count: 6,
    speed: 1.5,
    maxAlpha: 0.35,
    crystalSize: 0.12,
  });

  // --- Floating ice boulder segments (diamond shape) ---
  drawShiftingSegments(ctx, x, y - size * 0.2, size, time, zoom, {
    color: "rgba(147, 197, 253, 0.6)",
    colorAlt: "rgba(191, 219, 254, 0.5)",
    count: 6,
    orbitRadius: 0.5,
    segmentSize: 0.06,
    orbitSpeed: 1.0,
    shape: "diamond",
  });

  // Blizzard swirl vortex around yeti
  ctx.save();
  for (let bz = 0; bz < 12; bz++) {
    const bzAngle = time * 2 + bz * (Math.PI * 2 / 12);
    const bzHeight = Math.sin(time * 1.5 + bz * 0.5) * size * 0.35;
    const bzDist = size * (0.4 + Math.sin(time * 1.8 + bz) * 0.1);
    const bzAlpha = frostPulse * 0.15 * (0.6 + Math.sin(time * 3 + bz) * 0.4);
    ctx.fillStyle = `rgba(200, 230, 255, ${bzAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(bzAngle) * bzDist,
      y - size * 0.1 + bzHeight,
      size * 0.03, size * 0.015, bzAngle, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  // Frost breath aura from mouth
  ctx.save();
  const breathAlpha = 0.08 + Math.sin(time * 2) * 0.04;
  const breathGrad = ctx.createRadialGradient(
    x + size * 0.12, y - size * 0.38, 0,
    x + size * 0.12, y - size * 0.38, size * 0.15,
  );
  breathGrad.addColorStop(0, `rgba(200, 240, 255, ${breathAlpha})`);
  breathGrad.addColorStop(1, "rgba(147, 197, 253, 0)");
  ctx.fillStyle = breathGrad;
  ctx.beginPath();
  ctx.arc(x + size * 0.12, y - size * 0.38, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Icicle formations at feet
  ctx.save();
  ctx.fillStyle = `rgba(191, 219, 254, ${0.4 + frostPulse * 0.2})`;
  for (let ic = 0; ic < 5; ic++) {
    const icX = x - size * 0.25 + ic * size * 0.12;
    const icY = y + size * 0.5;
    const icH = size * (0.06 + Math.sin(ic * 1.7) * 0.02);
    ctx.beginPath();
    ctx.moveTo(icX - size * 0.01, icY);
    ctx.lineTo(icX, icY - icH);
    ctx.lineTo(icX + size * 0.01, icY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawIceWitchEnemy(
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
  // FROST WITCH - Ancient sorceress of the frozen wastes, her soul bound to eternal winter
  const isAttacking = attackPhase > 0;
  const float = Math.sin(time * 1.8) * size * 0.06;
  const capeFlow = Math.sin(time * 2.5) * 0.12;
  const orbPulse = 0.7 + Math.sin(time * 3.5) * 0.3;
  const runeGlow = 0.5 + Math.sin(time * 2) * 0.5;
  const breathMist = Math.sin(time * 4) * 0.3;
  size *= 1.35; // Larger size

  // Freezing aura emanating outward
  const auraGrad = ctx.createRadialGradient(
    x,
    y + float,
    0,
    x,
    y + float,
    size * 0.9,
  );
  auraGrad.addColorStop(0, `rgba(147, 197, 253, ${orbPulse * 0.12})`);
  auraGrad.addColorStop(0.5, `rgba(96, 165, 250, ${orbPulse * 0.08})`);
  auraGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + float, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Frozen ground beneath - ice patch
  ctx.fillStyle = "rgba(147, 197, 253, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.5, size * 0.5 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ice cracks in frozen ground
  ctx.strokeStyle = `rgba(96, 165, 250, ${0.4 + runeGlow * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let crack = 0; crack < 5; crack++) {
    const crackAngle = crack * (Math.PI / 2.5) + 0.2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(crackAngle) * size * 0.15, y + size * 0.42);
    ctx.lineTo(
      x + Math.cos(crackAngle) * size * 0.45,
      y + size * 0.45 + Math.sin(crack) * size * 0.03,
    );
    ctx.stroke();
  }


  // Trailing ice mist behind
  ctx.fillStyle = `rgba(147, 197, 253, ${0.2 + breathMist * 0.15})`;
  for (let mist = 0; mist < 4; mist++) {
    const mistX = x - size * 0.25 - mist * size * 0.1;
    const mistY =
      y + size * 0.3 + float + Math.sin(time * 3 + mist) * size * 0.05;
    ctx.beginPath();
    ctx.arc(mistX, mistY, size * (0.1 - mist * 0.015), 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Ghostly legs (gliding shuffle, slow) ---
  drawPathLegs(ctx, x, y + size * 0.18 + float, size, time, zoom, {
    color: bodyColorDark,
    colorDark: "#0f172a",
    footColor: "#1e3a5f",
    strideSpeed: 2,
    strideAmt: 0.15,
    legLen: 0.18,
    width: 0.04,
    shuffle: true,
    style: 'ghostly',
  });

  // --- Ice Witch arms — elegant frost channeling ---
  drawPathArm(ctx, x - size * 0.25, y - size * 0.22 + float, size, time, zoom, -1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: "#c7d2fe",
    shoulderAngle: -1.0 + Math.sin(time * 2) * 0.12 + (isAttacking ? -attackPhase * 0.4 : 0),
    elbowAngle: -0.2 + Math.sin(time * 2.5 + 0.8) * 0.15,
    upperLen: 0.18,
    foreLen: 0.16,
    width: 0.04,
    handRadius: 0.03,
    style: 'ghostly',
  });
  drawPathArm(ctx, x + size * 0.25, y - size * 0.22 + float, size, time, zoom, 1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    handColor: "#c7d2fe",
    shoulderAngle: 0.7 + Math.sin(time * 2 + 2) * 0.1 + (isAttacking ? attackPhase * 0.5 : 0),
    elbowAngle: -0.4 + Math.sin(time * 2.8 + 1.5) * 0.12,
    upperLen: 0.18,
    foreLen: 0.16,
    width: 0.04,
    handRadius: 0.03,
    attackExtra: isAttacking ? attackPhase * 0.5 : 0,
    style: 'ghostly',
  });

  // Elaborate flowing cape/robe with multiple layers
  // Back cape layer
  ctx.fillStyle = "#1e3a5f";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.42 + float);
  ctx.quadraticCurveTo(
    x - size * 0.55 + capeFlow * size,
    y + size * 0.1,
    x - size * 0.35,
    y - size * 0.25 + float,
  );
  ctx.quadraticCurveTo(
    x,
    y - size * 0.35 + float,
    x + size * 0.35,
    y - size * 0.25 + float,
  );
  ctx.quadraticCurveTo(
    x + size * 0.55 - capeFlow * size,
    y + size * 0.1,
    x + size * 0.42,
    y + size * 0.42 + float,
  );
  ctx.quadraticCurveTo(
    x + size * 0.2,
    y + size * 0.5 + capeFlow * size * 0.5 + float,
    x,
    y + size * 0.45 + float,
  );
  ctx.quadraticCurveTo(
    x - size * 0.2,
    y + size * 0.5 - capeFlow * size * 0.5 + float,
    x - size * 0.42,
    y + size * 0.42 + float,
  );
  ctx.fill();

  // Main robe layer — elegant bezier draping with crystalline trim
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.35, y - size * 0.3 + float,
    x + size * 0.3, y + size * 0.4 + float,
  );
  robeGrad.addColorStop(0, bodyColorDark);
  robeGrad.addColorStop(0.4, bodyColor);
  robeGrad.addColorStop(0.7, bodyColorDark);
  robeGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.4 + float);
  ctx.bezierCurveTo(
    x - size * 0.5 + capeFlow * size, y + size * 0.18,
    x - size * 0.46 + capeFlow * size * 0.5, y - size * 0.1,
    x - size * 0.28, y - size * 0.32 + float,
  );
  ctx.bezierCurveTo(
    x - size * 0.18, y - size * 0.38 + float,
    x - size * 0.06, y - size * 0.4 + float,
    x, y - size * 0.38 + float,
  );
  ctx.bezierCurveTo(
    x + size * 0.06, y - size * 0.4 + float,
    x + size * 0.18, y - size * 0.38 + float,
    x + size * 0.28, y - size * 0.32 + float,
  );
  ctx.bezierCurveTo(
    x + size * 0.46 - capeFlow * size * 0.5, y - size * 0.1,
    x + size * 0.5 - capeFlow * size, y + size * 0.18,
    x + size * 0.38, y + size * 0.4 + float,
  );
  ctx.bezierCurveTo(
    x + size * 0.25, y + size * 0.44 + capeFlow * size * 0.3 + float,
    x + size * 0.08, y + size * 0.43 + float,
    x, y + size * 0.42 + float,
  );
  ctx.bezierCurveTo(
    x - size * 0.08, y + size * 0.43 + float,
    x - size * 0.25, y + size * 0.44 - capeFlow * size * 0.3 + float,
    x - size * 0.38, y + size * 0.4 + float,
  );
  ctx.fill();

  // Crystalline trim along robe edges
  ctx.strokeStyle = `rgba(191, 219, 254, ${0.4 + runeGlow * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let trim = 0; trim < 6; trim++) {
    const trimX = x - size * 0.32 + trim * size * 0.12;
    const trimY = y + size * 0.38 + Math.sin(trim * 1.2) * size * 0.02 + float;
    const trimH = size * (0.04 + Math.sin(trim * 0.8) * 0.015);
    ctx.beginPath();
    ctx.moveTo(trimX - size * 0.015, trimY);
    ctx.lineTo(trimX, trimY + trimH);
    ctx.lineTo(trimX + size * 0.015, trimY);
    ctx.stroke();
  }

  // Robe frost patterns
  ctx.strokeStyle = `rgba(147, 197, 253, ${runeGlow * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  // Frost vine pattern on robe
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.15 + float);
  ctx.quadraticCurveTo(
    x - size * 0.25,
    y + float,
    x - size * 0.15,
    y + size * 0.15 + float,
  );
  ctx.quadraticCurveTo(
    x - size * 0.22,
    y + size * 0.25 + float,
    x - size * 0.18,
    y + size * 0.35 + float,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.1 + float);
  ctx.quadraticCurveTo(
    x + size * 0.2,
    y + size * 0.05 + float,
    x + size * 0.12,
    y + size * 0.2 + float,
  );
  ctx.stroke();

  // Glowing runes on robe hem
  ctx.fillStyle = `rgba(96, 165, 250, ${runeGlow * 0.6})`;
  for (let rune = 0; rune < 5; rune++) {
    const runeX = x - size * 0.25 + rune * size * 0.12;
    const runeY = y + size * 0.32 + Math.sin(rune * 1.2) * size * 0.03 + float;
    ctx.beginPath();
    ctx.arc(runeX, runeY, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner dress/bodice — tapered bezier garment shape
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.35 + float);
  ctx.bezierCurveTo(
    x - size * 0.22, y - size * 0.2 + float,
    x - size * 0.26, y + size * 0.05 + float,
    x - size * 0.22, y + size * 0.25 + float,
  );
  ctx.bezierCurveTo(
    x - size * 0.18, y + size * 0.36 + float,
    x + size * 0.18, y + size * 0.36 + float,
    x + size * 0.22, y + size * 0.25 + float,
  );
  ctx.bezierCurveTo(
    x + size * 0.26, y + size * 0.05 + float,
    x + size * 0.22, y - size * 0.2 + float,
    x + size * 0.14, y - size * 0.35 + float,
  );
  ctx.bezierCurveTo(
    x + size * 0.06, y - size * 0.4 + float,
    x - size * 0.06, y - size * 0.4 + float,
    x - size * 0.14, y - size * 0.35 + float,
  );
  ctx.fill();

  // Corset/bodice detail
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25 + float);
  ctx.lineTo(x, y + size * 0.2 + float);
  ctx.stroke();
  for (let lace = 0; lace < 4; lace++) {
    const laceY = y - size * 0.15 + lace * size * 0.1 + float;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.08, laceY);
    ctx.lineTo(x, laceY + size * 0.03);
    ctx.lineTo(x + size * 0.08, laceY);
    ctx.stroke();
  }

  // Skeletal hand holding staff
  ctx.fillStyle = "#c7d2fe";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.18,
    y + size * 0.05 + float,
    size * 0.06,
    size * 0.05,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Bony fingers
  ctx.strokeStyle = "#a5b4fc";
  ctx.lineWidth = 2 * zoom;
  for (let finger = 0; finger < 4; finger++) {
    const fingerAngle = 0.5 + finger * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.2, y + size * 0.08 + float);
    ctx.lineTo(
      x + size * 0.2 + Math.cos(fingerAngle) * size * 0.08,
      y + size * 0.08 + float + Math.sin(fingerAngle) * size * 0.06,
    );
    ctx.stroke();
  }

  // Ornate ice staff
  ctx.strokeStyle = "#1e3a5f";
  ctx.lineWidth = 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.1 + float);
  ctx.lineTo(x + size * 0.28, y + size * 0.45 + float);
  ctx.stroke();

  // Staff ice coating
  const staffGrad = ctx.createLinearGradient(
    x + size * 0.18,
    y - size * 0.1 + float,
    x + size * 0.28,
    y + size * 0.45 + float,
  );
  staffGrad.addColorStop(0, `rgba(147, 197, 253, ${0.8 + orbPulse * 0.2})`);
  staffGrad.addColorStop(0.5, `rgba(96, 165, 250, ${0.6 + orbPulse * 0.2})`);
  staffGrad.addColorStop(1, `rgba(59, 130, 246, ${0.4 + orbPulse * 0.2})`);
  ctx.strokeStyle = staffGrad;
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.1 + float);
  ctx.lineTo(x + size * 0.28, y + size * 0.45 + float);
  ctx.stroke();

  // Staff headpiece — multi-faceted crystal formation
  ctx.fillStyle = "#1e3a5f";
  // Central crystal
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.15 + float);
  ctx.lineTo(x + size * 0.12, y - size * 0.22 + float);
  ctx.lineTo(x + size * 0.18, y - size * 0.3 + float);
  ctx.lineTo(x + size * 0.24, y - size * 0.22 + float);
  ctx.closePath();
  ctx.fill();
  // Side crystals
  ctx.fillStyle = `rgba(96, 165, 250, ${0.5 + orbPulse * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.2 + float);
  ctx.lineTo(x + size * 0.07, y - size * 0.25 + float);
  ctx.lineTo(x + size * 0.1, y - size * 0.28 + float);
  ctx.lineTo(x + size * 0.14, y - size * 0.23 + float);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y - size * 0.2 + float);
  ctx.lineTo(x + size * 0.29, y - size * 0.25 + float);
  ctx.lineTo(x + size * 0.26, y - size * 0.28 + float);
  ctx.lineTo(x + size * 0.22, y - size * 0.23 + float);
  ctx.closePath();
  ctx.fill();

  // Main ice orb on staff - multi-layered
  const orbX = x + size * 0.18;
  const orbY = y - size * 0.22 + float;
  const orbSize = size * (0.12 + orbPulse * 0.03);

  // Outer orb glow
  const outerOrbGrad = ctx.createRadialGradient(
    orbX,
    orbY,
    0,
    orbX,
    orbY,
    orbSize * 1.5,
  );
  outerOrbGrad.addColorStop(0, `rgba(147, 197, 253, ${orbPulse * 0.4})`);
  outerOrbGrad.addColorStop(0.5, `rgba(96, 165, 250, ${orbPulse * 0.2})`);
  outerOrbGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = outerOrbGrad;
  ctx.beginPath();
  ctx.arc(orbX, orbY, orbSize * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Main orb
  const mainOrbGrad = ctx.createRadialGradient(
    orbX - orbSize * 0.2,
    orbY - orbSize * 0.2,
    0,
    orbX,
    orbY,
    orbSize,
  );
  mainOrbGrad.addColorStop(0, `rgba(255, 255, 255, ${orbPulse})`);
  mainOrbGrad.addColorStop(0.3, `rgba(191, 219, 254, ${orbPulse})`);
  mainOrbGrad.addColorStop(0.6, `rgba(147, 197, 253, ${orbPulse * 0.9})`);
  mainOrbGrad.addColorStop(1, `rgba(59, 130, 246, ${orbPulse * 0.7})`);
  ctx.fillStyle = mainOrbGrad;
  setShadowBlur(ctx, 15 * zoom * orbPulse, "#60a5fa");
  ctx.beginPath();
  ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Swirling energy inside orb
  ctx.strokeStyle = `rgba(255, 255, 255, ${orbPulse * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let swirl = 0; swirl < 2; swirl++) {
    const swirlAngle = time * 3 + swirl * Math.PI;
    ctx.beginPath();
    ctx.arc(
      orbX + Math.cos(swirlAngle) * orbSize * 0.4,
      orbY + Math.sin(swirlAngle) * orbSize * 0.4,
      orbSize * 0.3,
      0,
      Math.PI,
    );
    ctx.stroke();
  }

  // Crystalline refraction sparkles around staff orb
  for (let sparkle = 0; sparkle < 8; sparkle++) {
    const sparkleAngle = time * 4 + sparkle * (Math.PI / 4);
    const sparkleDist = orbSize * (1.3 + Math.sin(time * 6 + sparkle * 2) * 0.4);
    const sx = orbX + Math.cos(sparkleAngle) * sparkleDist;
    const sy = orbY + Math.sin(sparkleAngle) * sparkleDist;
    const sparkleAlpha = 0.3 + Math.sin(time * 8 + sparkle * 1.5) * 0.3;
    const sparkleLen = size * (0.02 + Math.sin(time * 5 + sparkle) * 0.01);
    ctx.strokeStyle = `rgba(220, 235, 255, ${sparkleAlpha})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(sx - sparkleLen, sy);
    ctx.lineTo(sx + sparkleLen, sy);
    ctx.moveTo(sx, sy - sparkleLen);
    ctx.lineTo(sx, sy + sparkleLen);
    ctx.stroke();
  }

  // Elaborate hood with crown-like ice spikes — bezier sculpted
  const hoodGrad = ctx.createLinearGradient(
    x, y - size * 0.7 + float,
    x, y - size * 0.25 + float,
  );
  hoodGrad.addColorStop(0, bodyColorDark);
  hoodGrad.addColorStop(0.5, bodyColor);
  hoodGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.28 + float);
  ctx.bezierCurveTo(
    x - size * 0.34, y - size * 0.42 + float,
    x - size * 0.32, y - size * 0.6 + float,
    x - size * 0.1, y - size * 0.7 + float,
  );
  ctx.bezierCurveTo(
    x - size * 0.04, y - size * 0.76 + float,
    x + size * 0.04, y - size * 0.76 + float,
    x + size * 0.1, y - size * 0.7 + float,
  );
  ctx.bezierCurveTo(
    x + size * 0.32, y - size * 0.6 + float,
    x + size * 0.34, y - size * 0.42 + float,
    x + size * 0.25, y - size * 0.28 + float,
  );
  ctx.bezierCurveTo(
    x + size * 0.18, y - size * 0.23 + float,
    x + size * 0.08, y - size * 0.21 + float,
    x, y - size * 0.2 + float,
  );
  ctx.bezierCurveTo(
    x - size * 0.08, y - size * 0.21 + float,
    x - size * 0.18, y - size * 0.23 + float,
    x - size * 0.25, y - size * 0.28 + float,
  );
  ctx.fill();

  // Flowing hair strands emerging from hood
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 1.5 * zoom;
  ctx.lineCap = "round";
  for (let hair = 0; hair < 4; hair++) {
    const hairX = x - size * 0.15 + hair * size * 0.1;
    const hairStartY = y - size * 0.25 + float;
    const hairLen = size * (0.15 + Math.sin(hair * 1.4) * 0.04);
    const hairDrift = Math.sin(time * 2 + hair * 1.6) * size * 0.03 + capeFlow * size * 0.5;
    ctx.beginPath();
    ctx.moveTo(hairX, hairStartY);
    ctx.bezierCurveTo(
      hairX + hairDrift * 0.3, hairStartY + hairLen * 0.3,
      hairX + hairDrift * 0.7, hairStartY + hairLen * 0.6,
      hairX + hairDrift, hairStartY + hairLen,
    );
    ctx.stroke();
  }

  // Ice crown spikes on hood
  ctx.fillStyle = `rgba(147, 197, 253, ${0.7 + orbPulse * 0.3})`;
  for (let spike = 0; spike < 5; spike++) {
    const spikeX = x - size * 0.12 + spike * size * 0.06;
    const spikeHeight = size * (0.1 + Math.sin(spike * 1.5) * 0.03);
    ctx.beginPath();
    ctx.moveTo(spikeX - size * 0.02, y - size * 0.65 + float);
    ctx.lineTo(spikeX, y - size * 0.65 - spikeHeight + float);
    ctx.lineTo(spikeX + size * 0.02, y - size * 0.65 + float);
    ctx.fill();
  }

  // Hood edge frost trim
  ctx.strokeStyle = `rgba(191, 219, 254, ${0.6 + runeGlow * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.3 + float);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.22 + float,
    x + size * 0.22,
    y - size * 0.3 + float,
  );
  ctx.stroke();

  // Face in deep shadow — gaunt bezier contour
  ctx.fillStyle = "#0a0a0f";
  const fcx = x;
  const fcy = y - size * 0.4 + float;
  ctx.beginPath();
  ctx.moveTo(fcx, fcy - size * 0.12);
  ctx.bezierCurveTo(
    fcx + size * 0.1, fcy - size * 0.1,
    fcx + size * 0.15, fcy - size * 0.03,
    fcx + size * 0.12, fcy + size * 0.06,
  );
  ctx.bezierCurveTo(
    fcx + size * 0.08, fcy + size * 0.12,
    fcx - size * 0.08, fcy + size * 0.12,
    fcx - size * 0.12, fcy + size * 0.06,
  );
  ctx.bezierCurveTo(
    fcx - size * 0.15, fcy - size * 0.03,
    fcx - size * 0.1, fcy - size * 0.1,
    fcx, fcy - size * 0.12,
  );
  ctx.fill();

  // Spectral face features — subtle inner glow
  ctx.fillStyle = `rgba(147, 197, 253, ${0.15 + runeGlow * 0.1})`;
  ctx.beginPath();
  ctx.moveTo(fcx, fcy - size * 0.05);
  ctx.bezierCurveTo(
    fcx + size * 0.05, fcy - size * 0.04,
    fcx + size * 0.08, fcy + size * 0.01,
    fcx + size * 0.06, fcy + size * 0.05,
  );
  ctx.bezierCurveTo(
    fcx + size * 0.03, fcy + size * 0.08,
    fcx - size * 0.03, fcy + size * 0.08,
    fcx - size * 0.06, fcy + size * 0.05,
  );
  ctx.bezierCurveTo(
    fcx - size * 0.08, fcy + size * 0.01,
    fcx - size * 0.05, fcy - size * 0.04,
    fcx, fcy - size * 0.05,
  );
  ctx.fill();

  // Intensely glowing eyes
  ctx.fillStyle = `rgba(96, 165, 250, ${0.9 + orbPulse * 0.1})`;
  setShadowBlur(ctx, 12 * zoom, "#60a5fa");
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.44 + float,
    size * 0.035,
    size * 0.025,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.44 + float,
    size * 0.035,
    size * 0.025,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye inner glow
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06,
    y - size * 0.44 + float,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.06,
    y - size * 0.44 + float,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Frost breath mist
  ctx.fillStyle = `rgba(191, 219, 254, ${0.3 + breathMist * 0.2})`;
  for (let breath = 0; breath < 3; breath++) {
    const bx = x + Math.sin(time * 4 + breath * 1.2) * size * 0.08;
    const by = y - size * 0.32 + float - breath * size * 0.04;
    ctx.beginPath();
    ctx.arc(bx, by, size * (0.03 - breath * 0.005), 0, Math.PI * 2);
    ctx.fill();
  }

  // Orbiting ice crystals
  ctx.fillStyle = "#ffffff";
  setShadowBlur(ctx, 6 * zoom, "#93c5fd");
  for (let c = 0; c < 6; c++) {
    const angle = time * 2 + c * (Math.PI / 3);
    const orbitRadius = size * (0.4 + Math.sin(time * 1.5 + c) * 0.05);
    const cx = x + Math.cos(angle) * orbitRadius;
    const cy = y - size * 0.15 + float + Math.sin(angle * 0.5) * size * 0.2;
    const crystalSize = size * (0.04 + Math.sin(c) * 0.01);

    // 6-pointed ice crystal shape
    ctx.beginPath();
    for (let point = 0; point < 6; point++) {
      const pointAngle = point * (Math.PI / 3) + time * 0.5;
      const px = cx + Math.cos(pointAngle) * crystalSize;
      const py = cy + Math.sin(pointAngle) * crystalSize;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  clearShadow(ctx);

  // Inner orbit angular ice shards
  for (let shard = 0; shard < 4; shard++) {
    const shardAngle = -time * 3.5 + shard * (Math.PI / 2);
    const shardOrbit = size * 0.22;
    const shardX = orbX + Math.cos(shardAngle) * shardOrbit;
    const shardY = orbY + Math.sin(shardAngle) * shardOrbit * 0.6;
    const shardAlpha = 0.5 + Math.sin(time * 4 + shard) * 0.3;
    const shardLen = size * 0.035;
    ctx.fillStyle = `rgba(191, 219, 254, ${shardAlpha})`;
    ctx.beginPath();
    ctx.moveTo(shardX, shardY - shardLen);
    ctx.lineTo(shardX + shardLen * 0.3, shardY);
    ctx.lineTo(shardX, shardY + shardLen * 0.5);
    ctx.lineTo(shardX - shardLen * 0.3, shardY);
    ctx.closePath();
    ctx.fill();
  }

  // --- Orbiting ice crystals ---
  drawFrostCrystals(ctx, x, y - size * 0.1 + float, size * 0.45, time, zoom, {
    color: "rgba(191, 219, 254, 0.5)",
    glowColor: "rgba(230, 245, 255, 0.6)",
    count: 5,
    speed: 1.8,
    maxAlpha: 0.4,
    crystalSize: 0.11,
  });

  // --- Floating ice crystal shards ---
  drawShiftingSegments(ctx, x, y - size * 0.15 + float, size, time, zoom, {
    color: "rgba(191, 219, 254, 0.7)",
    colorAlt: "rgba(147, 197, 253, 0.5)",
    count: 5,
    orbitRadius: 0.42,
    segmentSize: 0.04,
    orbitSpeed: 2.0,
    shape: "shard",
  });

  // Swirling snowflake particles around witch
  ctx.save();
  for (let sf = 0; sf < 8; sf++) {
    const sfAngle = time * 1.2 + sf * Math.PI * 0.25;
    const sfDist = size * (0.35 + Math.sin(time * 1.5 + sf * 2) * 0.1);
    const sfX = x + Math.cos(sfAngle) * sfDist;
    const sfY = y + float - size * 0.1 + Math.sin(sfAngle * 1.3) * size * 0.25;
    const sfAlpha = 0.3 + Math.sin(time * 3 + sf * 1.5) * 0.15;
    ctx.fillStyle = `rgba(220, 240, 255, ${sfAlpha})`;
    ctx.beginPath();
    for (let arm = 0; arm < 6; arm++) {
      const armAngle = arm * Math.PI / 3 + time * 0.5;
      ctx.moveTo(sfX, sfY);
      ctx.lineTo(sfX + Math.cos(armAngle) * size * 0.012, sfY + Math.sin(armAngle) * size * 0.012);
    }
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${sfAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(sfX, sfY, size * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Frozen mist trailing behind cape
  ctx.save();
  for (let fm = 0; fm < 5; fm++) {
    const fmPhase = (time * 0.6 + fm * 0.2) % 1;
    const fmX = x - size * 0.05 + Math.sin(time * 0.8 + fm * 1.8) * size * 0.15;
    const fmY = y + float + size * 0.2 + fmPhase * size * 0.15;
    const fmAlpha = (1 - fmPhase) * orbPulse * 0.12;
    const fmSize = size * (0.04 + fmPhase * 0.04);
    const fmGrad = ctx.createRadialGradient(fmX, fmY, 0, fmX, fmY, fmSize);
    fmGrad.addColorStop(0, `rgba(191, 219, 254, ${fmAlpha})`);
    fmGrad.addColorStop(1, "rgba(147, 197, 253, 0)");
    ctx.fillStyle = fmGrad;
    ctx.beginPath();
    ctx.arc(fmX, fmY, fmSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Frost corona energy pulse expanding outward
  ctx.save();
  for (let corona = 0; corona < 3; corona++) {
    const coronaPhase = (time * 0.5 + corona * 0.33) % 1;
    const coronaRadius = size * (0.3 + coronaPhase * 0.35);
    const coronaAlpha = (1 - coronaPhase) * orbPulse * 0.12;
    ctx.strokeStyle = `rgba(147, 197, 253, ${coronaAlpha})`;
    ctx.lineWidth = (1.5 - coronaPhase) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + float, coronaRadius, coronaRadius * ISO_Y_RATIO * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Crystalline light refraction sparks
  ctx.save();
  for (let spark = 0; spark < 5; spark++) {
    const sparkAngle = time * 2.5 + spark * Math.PI * 0.4;
    const sparkDist = size * (0.25 + Math.sin(time * 3 + spark * 1.8) * 0.1);
    const sparkX = x + Math.cos(sparkAngle) * sparkDist;
    const sparkY = y + float - size * 0.15 + Math.sin(sparkAngle * 0.7) * size * 0.2;
    const sparkAlpha = 0.4 + Math.sin(time * 6 + spark * 2.3) * 0.3;
    const sparkLen = size * 0.025;
    ctx.strokeStyle = `rgba(220, 240, 255, ${sparkAlpha * orbPulse})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(sparkX - sparkLen, sparkY);
    ctx.lineTo(sparkX + sparkLen, sparkY);
    ctx.moveTo(sparkX, sparkY - sparkLen);
    ctx.lineTo(sparkX, sparkY + sparkLen);
    ctx.stroke();
  }
  ctx.restore();

  // Arcane frost rune circle beneath
  ctx.save();
  const runeAlpha = 0.1 + runeGlow * 0.15;
  ctx.strokeStyle = `rgba(147, 197, 253, ${runeAlpha})`;
  ctx.lineWidth = 1.5 * zoom;
  const runeRadius = size * 0.4;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.42 + float, runeRadius, runeRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let rs = 0; rs < 8; rs++) {
    const rsAngle = rs * Math.PI * 0.25 + time * 0.3;
    const rsR1 = runeRadius * 0.85;
    const rsR2 = runeRadius * 1.05;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(rsAngle) * rsR1, y + size * 0.42 + float + Math.sin(rsAngle) * rsR1 * ISO_Y_RATIO);
    ctx.lineTo(x + Math.cos(rsAngle) * rsR2, y + size * 0.42 + float + Math.sin(rsAngle) * rsR2 * ISO_Y_RATIO);
    ctx.stroke();
  }
  ctx.restore();

  // Spell casting effect when attacking
  if (isAttacking) {
    // Ice beam from staff
    ctx.strokeStyle = `rgba(147, 197, 253, ${attackPhase * 0.8})`;
    ctx.lineWidth = (3 + attackPhase * 4) * zoom;
    setShadowBlur(ctx, 15 * zoom, "#60a5fa");
    ctx.beginPath();
    ctx.moveTo(orbX, orbY);
    ctx.lineTo(
      orbX + attackPhase * size * 0.8,
      orbY - attackPhase * size * 0.3,
    );
    ctx.stroke();
    clearShadow(ctx);

    // Ice shards projectiles
    ctx.fillStyle = `rgba(191, 219, 254, ${attackPhase * 0.9})`;
    for (let shard = 0; shard < 5; shard++) {
      const shardProgress = (attackPhase + shard * 0.15) % 1;
      const sx = orbX + shardProgress * size * 0.8;
      const sy =
        orbY -
        shardProgress * size * 0.3 +
        Math.sin(shard * 2 + time * 10) * size * 0.08;
      ctx.beginPath();
      ctx.moveTo(sx, sy - size * 0.03);
      ctx.lineTo(sx + size * 0.02, sy);
      ctx.lineTo(sx, sy + size * 0.03);
      ctx.lineTo(sx - size * 0.02, sy);
      ctx.closePath();
      ctx.fill();
    }
  }
}
