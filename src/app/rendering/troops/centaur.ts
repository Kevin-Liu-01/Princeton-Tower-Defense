import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  drawHorseTail,
  drawMuscularHorseBody,
  drawMuscularHorseLeg,
} from "./troopHelpers";
import type { HorseLegColors } from "./troopHelpers";

export function drawCentaurTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
) {
  // EPIC ORNATE CENTAUR ARCHER - Golden War Champion of Princeton
  const gallop = Math.sin(time * 7.4) * 4.4;
  const legCycle = Math.sin(time * 7.4) * 0.44;
  const breathe = Math.sin(time * 2) * 0.5;
  const hairFlow = Math.sin(time * 4.6);
  const shimmer = Math.sin(time * 5) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  const centaurBrownDark = "#2b1c13";
  const centaurBrownMid = "#5a3d24";
  const centaurBrownLight = "#7d5d3f";
  const centaurLeafDark = "#22331e";
  const centaurLeafMid = "#395536";
  const centaurLeafLight = "#61804f";
  const centaurGoldDark = "#685026";
  const centaurGoldMid = "#9f7a3a";
  const centaurGoldLight = "#ceb270";

  // Attack animation - bow draw and release
  const isAttacking = attackPhase > 0;
  const bowDraw = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const bowBaseRotation = -0.52 + (isAttacking ? -bowDraw * 0.3 : -0.08);
  const bowX = x - size * 0.275;
  const bowY = y - size * 0.2 + gallop * 0.06;
  const bowRotation = resolveWeaponRotation(
    targetPos,
    bowX,
    bowY,
    bowBaseRotation,
    -Math.PI,
    isAttacking ? 1.0 : 0.52,
    WEAPON_LIMITS.bow,
  );
  // === MULTI-LAYERED FOREST AURA ===
  const auraIntensity = isAttacking ? 0.6 : 0.35;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Multiple layered auras for depth
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.12;
    const auraGrad = ctx.createRadialGradient(
      x + size * 0.05,
      y + size * 0.1,
      size * (0.08 + layerOffset),
      x + size * 0.05,
      y + size * 0.1,
      size * (0.9 + layerOffset * 0.3),
    );
    auraGrad.addColorStop(
      0,
      `rgba(160, 194, 96, ${auraIntensity * auraPulse * (0.5 - auraLayer * 0.12)})`,
    );
    auraGrad.addColorStop(
      0.3,
      `rgba(109, 152, 74, ${auraIntensity * auraPulse * (0.35 - auraLayer * 0.08)})`,
    );
    auraGrad.addColorStop(
      0.6,
      `rgba(84, 113, 45, ${auraIntensity * auraPulse * (0.2 - auraLayer * 0.05)})`,
    );
    auraGrad.addColorStop(1, "rgba(47, 67, 28, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      x + size * 0.05,
      y + size * 0.15,
      size * (0.8 + layerOffset * 0.2),
      size * (0.55 + layerOffset * 0.15),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Floating forest-gold rune particles
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.5 + p * Math.PI * 0.2) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 2.5 + p * 0.7) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.38;
    const pAlpha = 0.5 + Math.sin(time * 4 + p * 0.6) * 0.3;
    // Outer glow
    ctx.fillStyle = `rgba(169, 199, 104, ${pAlpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright
    ctx.fillStyle = `rgba(231, 201, 126, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // === ENERGY RINGS (during attack) ===
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6 * attackIntensity;
      ctx.strokeStyle = `rgba(177, 207, 115, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.1,
        size * (0.5 + ringPhase * 0.45),
        size * (0.32 + ringPhase * 0.28),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    // Golden spark particles
    for (let sp = 0; sp < 8; sp++) {
      const spAngle = time * 6 + (sp * Math.PI) / 4;
      const spDist = size * 0.35 + attackIntensity * size * 0.35;
      const spX = x + Math.cos(spAngle) * spDist;
      const spY = y + size * 0.1 + Math.sin(spAngle) * spDist * 0.4;
      ctx.fillStyle = `rgba(226, 203, 132, ${attackIntensity * 0.8})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === POWERFUL HORSE BODY WITH DETAILED COAT ===
  const bodyY = y + size * 0.15 + gallop * 0.12;
  drawMuscularHorseBody(
    ctx,
    x + size * 0.08,
    bodyY,
    size * 0.46,
    size * 0.28,
    size,
    zoom,
    {
      coatLight: centaurBrownLight,
      coatMid: centaurBrownMid,
      coatDark: centaurBrownDark,
      muscleHighlight: "rgba(188, 164, 109, 0.22)",
      muscleShadow: "rgba(71, 53, 34, 0.35)",
    },
  );

  // Battle scars (honorable marks)
  ctx.strokeStyle = "rgba(100, 70, 30, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.04 + gallop * 0.12);
  ctx.lineTo(x - size * 0.02, y + size * 0.16 + gallop * 0.12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y + size * 0.02 + gallop * 0.12);
  ctx.lineTo(x + size * 0.22, y + size * 0.12 + gallop * 0.12);
  ctx.stroke();

  // === ORNATE ARMORED BARDING ===
  // Chest armor plate with gradient
  const chestArmorGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y + size * 0.1,
    x - size * 0.1,
    y + size * 0.25,
  );
  chestArmorGrad.addColorStop(0, centaurLeafDark);
  chestArmorGrad.addColorStop(0.3, centaurLeafMid);
  chestArmorGrad.addColorStop(0.6, "#49663a");
  chestArmorGrad.addColorStop(1, "#2f4a29");
  ctx.fillStyle = chestArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.27, y + size * 0.03 + gallop * 0.12);
  ctx.lineTo(x - size * 0.38, y + size * 0.22 + gallop * 0.12);
  ctx.lineTo(x - size * 0.22, y + size * 0.28 + gallop * 0.12);
  ctx.lineTo(x - size * 0.08, y + size * 0.08 + gallop * 0.12);
  ctx.closePath();
  ctx.fill();

  // Armor edge highlight
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Engraved filigree on chest armor
  ctx.strokeStyle = centaurGoldLight;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.1 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x - size * 0.32,
    y + size * 0.16,
    x - size * 0.26,
    y + size * 0.2 + gallop * 0.12,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.08 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x - size * 0.26,
    y + size * 0.14,
    x - size * 0.2,
    y + size * 0.18 + gallop * 0.12,
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Chest armor gem
  ctx.fillStyle = centaurGoldMid;
  ctx.shadowColor = centaurGoldLight;
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.25,
    y + size * 0.14 + gallop * 0.12,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Back armor plate
  const backArmorGrad = ctx.createLinearGradient(
    x + size * 0.2,
    y + size * 0.0,
    x + size * 0.4,
    y + size * 0.2,
  );
  backArmorGrad.addColorStop(0, centaurLeafDark);
  backArmorGrad.addColorStop(0.5, centaurLeafMid);
  backArmorGrad.addColorStop(1, "#2f4a29");
  ctx.fillStyle = backArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + gallop * 0.12);
  ctx.lineTo(x + size * 0.42, y + size * 0.08 + gallop * 0.12);
  ctx.lineTo(x + size * 0.38, y + size * 0.22 + gallop * 0.12);
  ctx.lineTo(x + size * 0.22, y + size * 0.18 + gallop * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Back armor gem
  ctx.fillStyle = centaurGoldLight;
  ctx.shadowColor = centaurGoldLight;
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.32,
    y + size * 0.1 + gallop * 0.12,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Decorative medallion chain across body
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.22 + gallop * 0.12);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.26 + gallop * 0.12,
    x + size * 0.2,
    y + size * 0.22 + gallop * 0.12,
  );
  ctx.stroke();
  // Medallions on chain
  for (let med = 0; med < 5; med++) {
    const medX = x - size * 0.16 + med * size * 0.09;
    const medY =
      y + size * 0.24 + Math.sin(med * 0.8) * size * 0.015 + gallop * 0.12;
    ctx.fillStyle = centaurGoldLight;
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }

  // === POWERFUL LEGS WITH JOINTED ANATOMY ===
  const centaurLegColors: HorseLegColors = {
    thighLight: centaurBrownLight,
    thighMid: centaurBrownMid,
    thighDark: centaurBrownDark,
    greaveTop: centaurLeafDark,
    greaveMid: centaurLeafMid,
    greaveBottom: "#2e4a27",
    hoofColor: "#2b1f16",
    trimColor: centaurGoldMid,
  };
  drawMuscularHorseLeg(
    ctx, x - size * 0.2, y + size * 0.33 + gallop * 0.1,
    size, zoom, time, legCycle * 1.12, 0.1, 7, centaurLegColors,
  );
  drawMuscularHorseLeg(
    ctx, x - size * 0.05, y + size * 0.34 + gallop * 0.1,
    size, zoom, time, -legCycle * 0.9, 1.15, 7, centaurLegColors,
  );
  drawMuscularHorseLeg(
    ctx, x + size * 0.22, y + size * 0.34 + gallop * 0.1,
    size, zoom, time, -legCycle * 1.03, 2.15, 7, centaurLegColors,
  );
  drawMuscularHorseLeg(
    ctx, x + size * 0.37, y + size * 0.33 + gallop * 0.1,
    size, zoom, time, legCycle * 0.86, 3.0, 7, centaurLegColors,
  );

  // === MAJESTIC FLOWING TAIL ===
  drawHorseTail(
    ctx,
    x + size * 0.5,
    y + size * 0.07 + gallop * 0.12,
    size,
    zoom,
    time,
    5.6,
    3.8,
    {
      base: "#2b1c13",
      mid: "#5b4128",
      highlight: "#9e7e52",
      accent: "rgba(181, 151, 88, 0.45)",
      glowRgb: "214, 187, 118",
    },
    0.2 + Math.sin(time * 4) * 0.1,
  );

  // === ARROW QUIVER (on the back, behind torso) ===
  const quiverX = x + size * 0.14;
  const quiverY = y - size * 0.18 + gallop * 0.06;
  const quiverSway = Math.sin(time * 7.4 + 0.4) * size * 0.006;

  ctx.save();
  ctx.translate(quiverX + quiverSway, quiverY);
  ctx.rotate(0.12);

  // Quiver body — leather cylinder
  const quiverBodyGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, 0);
  quiverBodyGrad.addColorStop(0, "#3a2414");
  quiverBodyGrad.addColorStop(0.25, "#5c3e24");
  quiverBodyGrad.addColorStop(0.55, "#6e4e30");
  quiverBodyGrad.addColorStop(0.8, "#5a3c22");
  quiverBodyGrad.addColorStop(1, "#3a2414");
  ctx.fillStyle = quiverBodyGrad;
  ctx.beginPath();
  ctx.roundRect(-size * 0.04, -size * 0.28, size * 0.08, size * 0.34, size * 0.015);
  ctx.fill();

  // Leather stitching lines
  ctx.strokeStyle = "rgba(90, 60, 30, 0.5)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.26);
  ctx.lineTo(-size * 0.025, size * 0.04);
  ctx.moveTo(size * 0.025, -size * 0.26);
  ctx.lineTo(size * 0.025, size * 0.04);
  ctx.stroke();

  // Green decorative band at top
  ctx.fillStyle = centaurLeafMid;
  ctx.beginPath();
  ctx.roundRect(-size * 0.045, -size * 0.29, size * 0.09, size * 0.035, size * 0.008);
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Gold band at middle
  ctx.fillStyle = centaurGoldDark;
  ctx.beginPath();
  ctx.roundRect(-size * 0.045, -size * 0.12, size * 0.09, size * 0.025, size * 0.005);
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Bottom cap
  ctx.fillStyle = "#2e1c0f";
  ctx.beginPath();
  ctx.roundRect(-size * 0.042, size * 0.03, size * 0.084, size * 0.025, size * 0.006);
  ctx.fill();

  // Arrow shafts sticking out of quiver
  for (let a = 0; a < 5; a++) {
    const ax = -size * 0.025 + a * size * 0.013;
    const aLen = size * (0.08 + Math.sin(a * 1.7) * 0.03);
    ctx.strokeStyle = a % 2 === 0 ? "#5c3e24" : "#4a3018";
    ctx.lineWidth = 1.0 * zoom;
    ctx.beginPath();
    ctx.moveTo(ax, -size * 0.28);
    ctx.lineTo(ax + size * 0.004, -size * 0.28 - aLen);
    ctx.stroke();

    // Fletching feathers on each arrow
    ctx.fillStyle = a % 2 === 0 ? centaurLeafLight : centaurLeafMid;
    ctx.beginPath();
    ctx.moveTo(ax, -size * 0.28 - aLen + size * 0.01);
    ctx.lineTo(ax - size * 0.008, -size * 0.28 - aLen + size * 0.025);
    ctx.lineTo(ax + size * 0.004, -size * 0.28 - aLen + size * 0.028);
    ctx.closePath();
    ctx.fill();
  }

  // Quiver shoulder strap
  ctx.restore();
  ctx.strokeStyle = "#4a2a15";
  ctx.lineWidth = 2.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(quiverX + quiverSway + size * 0.02, quiverY - size * 0.22);
  ctx.quadraticCurveTo(
    x + size * 0.04, y - size * 0.34 + gallop * 0.05,
    x - size * 0.08, y - size * 0.28 + gallop * 0.05 + breathe * 0.4,
  );
  ctx.stroke();
  // Strap highlight
  ctx.strokeStyle = "rgba(110, 80, 45, 0.4)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(quiverX + quiverSway + size * 0.015, quiverY - size * 0.21);
  ctx.quadraticCurveTo(
    x + size * 0.035, y - size * 0.33 + gallop * 0.05,
    x - size * 0.075, y - size * 0.27 + gallop * 0.05 + breathe * 0.4,
  );
  ctx.stroke();

  // === HORSEHAIR CREST (rendered early so it's behind torso/neck/head) ===
  const earlyHelmCx = x;
  const earlyHelmCy = y - size * 0.57 + gallop * 0.04;
  const earlyHelmBob = gallop * 0.04;
  const crestWind = Math.sin(time * 4.6) * 2.2 + hairFlow * 1.8;
  const crestWhip = Math.sin(time * 6.5 + 0.4) * 1.2;
  const crestBaseY = earlyHelmCy - size * 0.17 + earlyHelmBob;
  const crestPeakH = size * 0.22;

  // Crest holder — raised bronze ridge
  const crestHolderGrad = ctx.createLinearGradient(earlyHelmCx - size * 0.015, 0, earlyHelmCx + size * 0.015, 0);
  crestHolderGrad.addColorStop(0, centaurGoldDark);
  crestHolderGrad.addColorStop(0.5, centaurGoldLight);
  crestHolderGrad.addColorStop(1, centaurGoldDark);
  ctx.fillStyle = crestHolderGrad;
  ctx.beginPath();
  ctx.roundRect(earlyHelmCx - size * 0.015, crestBaseY, size * 0.03, size * 0.06, size * 0.006);
  ctx.fill();

  // Shadow under plume
  ctx.fillStyle = "rgba(80, 50, 10, 0.25)";
  ctx.beginPath();
  ctx.moveTo(earlyHelmCx - size * 0.04, crestBaseY);
  ctx.quadraticCurveTo(
    earlyHelmCx + crestWind * 0.3, crestBaseY - crestPeakH * 0.85,
    earlyHelmCx + size * 0.06 + crestWind * 0.8, crestBaseY + size * 0.01,
  );
  ctx.closePath();
  ctx.fill();

  // Crest base layer (dark)
  const crestBaseGrad = ctx.createLinearGradient(earlyHelmCx, crestBaseY, earlyHelmCx, crestBaseY - crestPeakH);
  crestBaseGrad.addColorStop(0, "#7a3a10");
  crestBaseGrad.addColorStop(0.3, "#a04418");
  crestBaseGrad.addColorStop(0.6, "#c25820");
  crestBaseGrad.addColorStop(1, "#a04418");
  ctx.fillStyle = crestBaseGrad;
  ctx.beginPath();
  ctx.moveTo(earlyHelmCx - size * 0.035, crestBaseY);
  ctx.quadraticCurveTo(
    earlyHelmCx - size * 0.01 + crestWind * 0.3,
    crestBaseY - crestPeakH * 0.92,
    earlyHelmCx + crestWind * 0.5 + crestWhip * 0.2,
    crestBaseY - crestPeakH,
  );
  ctx.quadraticCurveTo(
    earlyHelmCx + size * 0.03 + crestWind * 0.7,
    crestBaseY - crestPeakH * 0.65,
    earlyHelmCx + size * 0.05 + crestWind * 0.8,
    crestBaseY,
  );
  ctx.closePath();
  ctx.fill();

  // Crest main body (bright crimson-gold)
  const crestMainGrad = ctx.createLinearGradient(earlyHelmCx, crestBaseY, earlyHelmCx + crestWind * 0.3, crestBaseY - crestPeakH);
  crestMainGrad.addColorStop(0, "#b04818");
  crestMainGrad.addColorStop(0.3, "#d46028");
  crestMainGrad.addColorStop(0.6, "#e87838");
  crestMainGrad.addColorStop(1, "#d06028");
  ctx.fillStyle = crestMainGrad;
  ctx.beginPath();
  ctx.moveTo(earlyHelmCx - size * 0.025, crestBaseY);
  ctx.quadraticCurveTo(
    earlyHelmCx - size * 0.005 + crestWind * 0.32,
    crestBaseY - crestPeakH * 0.94,
    earlyHelmCx + crestWind * 0.48 + crestWhip * 0.18,
    crestBaseY - crestPeakH * 0.96,
  );
  ctx.quadraticCurveTo(
    earlyHelmCx + size * 0.02 + crestWind * 0.65,
    crestBaseY - crestPeakH * 0.6,
    earlyHelmCx + size * 0.04 + crestWind * 0.75,
    crestBaseY,
  );
  ctx.closePath();
  ctx.fill();

  // Crest horsehair strand lines
  ctx.globalAlpha = 0.35;
  for (let cs = 0; cs < 5; cs++) {
    const csT = cs / 4;
    const csWave = Math.sin(time * 5.5 + cs * 1.1) * 1.5;
    ctx.strokeStyle = cs % 2 === 0 ? "#f0a050" : "#d88040";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(earlyHelmCx - size * 0.02 + csT * size * 0.04, crestBaseY);
    ctx.quadraticCurveTo(
      earlyHelmCx + crestWind * (0.25 + csT * 0.3) + csWave,
      crestBaseY - crestPeakH * (0.5 + csT * 0.3),
      earlyHelmCx + size * (0.01 + csT * 0.03) + crestWind * (0.5 + csT * 0.25),
      crestBaseY - crestPeakH * csT * 0.2,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === MUSCULAR HUMAN TORSO ===
  const torsoTopY = y - size * 0.46 + gallop * 0.04 + breathe * 0.3;
  const torsoBottomY = y + size * 0.02 + gallop * 0.08 + breathe;

  // Back muscles layer
  ctx.fillStyle = "#bb8246";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.07 + gallop * 0.08 + breathe,
    size * 0.255,
    size * 0.215,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Main torso with stronger V-shape and heavier upper mass
  const torsoGrad = ctx.createLinearGradient(
    x - size * 0.28,
    torsoTopY,
    x + size * 0.28,
    torsoBottomY,
  );
  torsoGrad.addColorStop(0, "#a86734");
  torsoGrad.addColorStop(0.18, "#c9884c");
  torsoGrad.addColorStop(0.42, "#ebb777");
  torsoGrad.addColorStop(0.62, "#e2a868");
  torsoGrad.addColorStop(0.82, "#c98548");
  torsoGrad.addColorStop(1, "#9f6332");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.23, torsoBottomY);
  ctx.lineTo(x - size * 0.31, y - size * 0.3 + gallop * 0.04 + breathe * 0.5);
  ctx.quadraticCurveTo(
    x,
    torsoTopY,
    x + size * 0.31,
    y - size * 0.3 + gallop * 0.04 + breathe * 0.5,
  );
  ctx.lineTo(x + size * 0.23, torsoBottomY);
  ctx.closePath();
  ctx.fill();

  // Broad lat shadows
  for (const side of [-1, 1] as const) {
    ctx.fillStyle = "rgba(102, 56, 28, 0.28)";
    ctx.beginPath();
    ctx.ellipse(
      x + side * size * 0.18,
      y - size * 0.14 + gallop * 0.06 + breathe * 0.6,
      size * 0.08,
      size * 0.15,
      side * -0.16,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Pectoral volume
  const chestShadeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.31,
    x,
    y - size * 0.12,
  );
  chestShadeGrad.addColorStop(0, "rgba(115, 65, 34, 0.34)");
  chestShadeGrad.addColorStop(0.55, "rgba(115, 65, 34, 0.14)");
  chestShadeGrad.addColorStop(1, "rgba(115, 65, 34, 0)");
  ctx.fillStyle = chestShadeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y - size * 0.29 + gallop * 0.05);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.18 + gallop * 0.05,
    x + size * 0.19,
    y - size * 0.29 + gallop * 0.05,
  );
  ctx.quadraticCurveTo(
    x,
    y - size * 0.09 + gallop * 0.08,
    x - size * 0.19,
    y - size * 0.29 + gallop * 0.05,
  );
  ctx.closePath();
  ctx.fill();

  // Chest/pec definition
  ctx.strokeStyle = "rgba(180, 130, 80, 0.42)";
  ctx.lineWidth = 1.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y - size * 0.25 + gallop * 0.05 + breathe * 0.4);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.15 + gallop * 0.05 + breathe * 0.4,
    x + size * 0.19,
    y - size * 0.25 + gallop * 0.05 + breathe * 0.4,
  );
  ctx.stroke();

  // Sternum highlight and deeper abdominal segmentation
  ctx.strokeStyle = "rgba(255, 228, 170, 0.18)";
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.31 + gallop * 0.05 + breathe * 0.3);
  ctx.lineTo(x, y - size * 0.09 + gallop * 0.08 + breathe * 0.7);
  ctx.stroke();

  ctx.strokeStyle = "rgba(116, 70, 38, 0.42)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.31 + gallop * 0.05 + breathe * 0.3);
  ctx.lineTo(x, y - size * 0.02 + gallop * 0.08 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11, y - size * 0.18 + gallop * 0.06 + breathe * 0.5);
  ctx.lineTo(x + size * 0.11, y - size * 0.18 + gallop * 0.06 + breathe * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.095, y - size * 0.1 + gallop * 0.07 + breathe * 0.7);
  ctx.lineTo(x + size * 0.095, y - size * 0.1 + gallop * 0.07 + breathe * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.075, y - size * 0.02 + gallop * 0.08 + breathe * 0.85);
  ctx.lineTo(x + size * 0.075, y - size * 0.02 + gallop * 0.08 + breathe * 0.85);
  ctx.stroke();

  // Oblique cuts and six-pack shadow masses
  ctx.strokeStyle = "rgba(96, 56, 30, 0.34)";
  ctx.lineWidth = 0.8 * zoom;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.13, y - size * 0.22 + gallop * 0.06 + breathe * 0.45);
    ctx.quadraticCurveTo(
      x + side * size * 0.07,
      y - size * 0.14 + gallop * 0.07 + breathe * 0.55,
      x + side * size * 0.05,
      y - size * 0.05 + gallop * 0.08 + breathe * 0.8,
    );
    ctx.stroke();
  }
  for (let row = 0; row < 3; row++) {
    const absY = y - size * (0.205 - row * 0.085) + gallop * (0.06 + row * 0.01) + breathe * (0.52 + row * 0.12);
    for (const side of [-1, 1] as const) {
      ctx.fillStyle = row === 0
        ? "rgba(118, 67, 36, 0.16)"
        : "rgba(104, 60, 32, 0.14)";
      ctx.beginPath();
      ctx.ellipse(
        x + side * size * 0.045,
        absY,
        size * (0.04 - row * 0.004),
        size * (0.028 - row * 0.003),
        side * 0.08,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === GOLDEN CHAINMAIL SHIRT ===
  const cmTopY = y - size * 0.34 + gallop * 0.04 + breathe * 0.35;
  const cmBotY = y + size * 0.005 + gallop * 0.08 + breathe;
  const cmCx = x;
  const cmHalfW = size * 0.225;

  // Leather-backed mail shirt for more material contrast
  const cmLeatherGrad = ctx.createLinearGradient(cmCx - cmHalfW, cmTopY, cmCx + cmHalfW, cmBotY);
  cmLeatherGrad.addColorStop(0, "rgba(74, 44, 24, 0.58)");
  cmLeatherGrad.addColorStop(0.5, "rgba(112, 70, 36, 0.62)");
  cmLeatherGrad.addColorStop(1, "rgba(68, 40, 20, 0.56)");
  ctx.fillStyle = cmLeatherGrad;
  ctx.beginPath();
  ctx.moveTo(cmCx - cmHalfW, cmBotY);
  ctx.lineTo(cmCx - cmHalfW - size * 0.045, cmTopY + size * 0.01);
  ctx.quadraticCurveTo(cmCx, cmTopY - size * 0.13, cmCx + cmHalfW + size * 0.045, cmTopY + size * 0.01);
  ctx.lineTo(cmCx + cmHalfW, cmBotY);
  ctx.closePath();
  ctx.fill();

  // Gold-edged leather yoke to break up the flat mail surface
  const yokeGrad = ctx.createLinearGradient(cmCx - cmHalfW, cmTopY - size * 0.015, cmCx + cmHalfW, cmTopY + size * 0.07);
  yokeGrad.addColorStop(0, "#3e2415");
  yokeGrad.addColorStop(0.35, "#6b4125");
  yokeGrad.addColorStop(0.6, "#8d5530");
  yokeGrad.addColorStop(1, "#422515");
  ctx.fillStyle = yokeGrad;
  ctx.beginPath();
  ctx.moveTo(cmCx - size * 0.19, cmTopY + size * 0.015);
  ctx.quadraticCurveTo(cmCx, cmTopY - size * 0.06, cmCx + size * 0.19, cmTopY + size * 0.015);
  ctx.lineTo(cmCx + size * 0.12, cmTopY + size * 0.085);
  ctx.quadraticCurveTo(cmCx, cmTopY + size * 0.045, cmCx - size * 0.12, cmTopY + size * 0.085);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  const cmGrad = ctx.createLinearGradient(cmCx - cmHalfW, cmTopY, cmCx + cmHalfW, cmBotY);
  cmGrad.addColorStop(0, "rgba(144, 114, 34, 0.72)");
  cmGrad.addColorStop(0.2, "rgba(204, 170, 62, 0.78)");
  cmGrad.addColorStop(0.5, "rgba(242, 214, 116, 0.84)");
  cmGrad.addColorStop(0.78, "rgba(194, 156, 52, 0.78)");
  cmGrad.addColorStop(1, "rgba(128, 96, 28, 0.72)");
  ctx.fillStyle = cmGrad;
  ctx.beginPath();
  ctx.moveTo(cmCx - cmHalfW + size * 0.01, cmBotY);
  ctx.lineTo(cmCx - cmHalfW - size * 0.03, cmTopY + size * 0.03);
  ctx.quadraticCurveTo(cmCx, cmTopY - size * 0.07, cmCx + cmHalfW + size * 0.03, cmTopY + size * 0.03);
  ctx.lineTo(cmCx + cmHalfW - size * 0.01, cmBotY);
  ctx.closePath();
  ctx.fill();

  const ringR = size * 0.011;
  const ringSpacingX = ringR * 2.15;
  const ringSpacingY = ringR * 1.8;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cmCx - cmHalfW + size * 0.01, cmBotY);
  ctx.lineTo(cmCx - cmHalfW - size * 0.03, cmTopY + size * 0.03);
  ctx.quadraticCurveTo(cmCx, cmTopY - size * 0.07, cmCx + cmHalfW + size * 0.03, cmTopY + size * 0.03);
  ctx.lineTo(cmCx + cmHalfW - size * 0.01, cmBotY);
  ctx.closePath();
  ctx.clip();

  for (let row = 0; row < 20; row++) {
    const ry = cmTopY + size * 0.01 + row * ringSpacingY;
    if (ry > cmBotY + ringR) break;
    const rowOffset = row % 2 === 0 ? 0 : ringSpacingX * 0.5;
    for (let col = -11; col <= 11; col++) {
      const rx = cmCx + col * ringSpacingX + rowOffset;
      if (rx < cmCx - cmHalfW - ringR * 2 || rx > cmCx + cmHalfW + ringR * 2) continue;

      const shimmer = Math.sin(time * 2.7 + row * 0.7 + col * 0.85) * 0.08;
      ctx.strokeStyle = `rgba(${180 + Math.floor(shimmer * 120)}, ${152 + Math.floor(shimmer * 90)}, ${58 + Math.floor(shimmer * 60)}, ${0.5 + shimmer})`;
      ctx.lineWidth = 0.45 * zoom;
      ctx.beginPath();
      ctx.arc(rx, ry, ringR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(82, 58, 18, 0.18)";
      ctx.beginPath();
      ctx.arc(rx, ry + ringR * 0.18, ringR * 0.58, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 240, 186, 0.22)";
      ctx.beginPath();
      ctx.arc(rx - ringR * 0.28, ry - ringR * 0.28, ringR * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const cmHighlight = ctx.createLinearGradient(cmCx - cmHalfW * 0.75, cmTopY + size * 0.04, cmCx + cmHalfW * 0.75, cmTopY + size * 0.1);
  cmHighlight.addColorStop(0, "rgba(255, 240, 180, 0)");
  cmHighlight.addColorStop(0.28, "rgba(255, 240, 180, 0.22)");
  cmHighlight.addColorStop(0.5, "rgba(255, 248, 210, 0.32)");
  cmHighlight.addColorStop(0.72, "rgba(255, 240, 180, 0.2)");
  cmHighlight.addColorStop(1, "rgba(255, 240, 180, 0)");
  ctx.fillStyle = cmHighlight;
  ctx.fillRect(cmCx - cmHalfW, cmTopY, cmHalfW * 2, cmBotY - cmTopY);

  for (const side of [-1, 1] as const) {
    ctx.strokeStyle = "rgba(92, 64, 18, 0.3)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(cmCx + side * size * 0.12, cmTopY + size * 0.05);
    ctx.lineTo(cmCx + side * size * 0.16, cmBotY - size * 0.02);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.35 * zoom;
  ctx.beginPath();
  ctx.moveTo(cmCx - cmHalfW - size * 0.03, cmTopY + size * 0.03);
  ctx.quadraticCurveTo(cmCx, cmTopY - size * 0.07, cmCx + cmHalfW + size * 0.03, cmTopY + size * 0.03);
  ctx.stroke();
  ctx.strokeStyle = centaurGoldDark;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cmCx - cmHalfW + size * 0.01, cmBotY);
  ctx.lineTo(cmCx + cmHalfW - size * 0.01, cmBotY);
  ctx.stroke();

  // Ornate warrior sash with detail
  const sashGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y - size * 0.26,
    x + size * 0.1,
    y - size * 0.04,
  );
  sashGrad.addColorStop(0, centaurLeafDark);
  sashGrad.addColorStop(0.5, centaurLeafMid);
  sashGrad.addColorStop(1, "#2e4a27");
  ctx.fillStyle = sashGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.27 + gallop * 0.05);
  ctx.lineTo(x + size * 0.14, y - size * 0.08 + gallop * 0.08);
  ctx.lineTo(x + size * 0.1, y - size * 0.02 + gallop * 0.08);
  ctx.lineTo(x - size * 0.26, y - size * 0.22 + gallop * 0.05);
  ctx.closePath();
  ctx.fill();
  // Sash gold trim
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Sash medallion
  ctx.fillStyle = centaurGoldLight;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06,
    y - size * 0.16 + gallop * 0.06,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === LEATHER HARNESS & ARMOR STRAPS ===
  const strapBob = gallop * 0.06 + breathe * 0.4;

  // Cross-body leather strap (quiver strap visible on front)
  ctx.strokeStyle = "#4a2a15";
  ctx.lineWidth = 2.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.26 + gallop * 0.05);
  ctx.quadraticCurveTo(
    x + size * 0.04, y - size * 0.14 + strapBob,
    x - size * 0.2, y - size * 0.24 + gallop * 0.05,
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(110, 80, 45, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.17, y - size * 0.255 + gallop * 0.05);
  ctx.quadraticCurveTo(
    x + size * 0.04, y - size * 0.135 + strapBob,
    x - size * 0.19, y - size * 0.235 + gallop * 0.05,
  );
  ctx.stroke();

  // Leather belt at waist
  const beltY = y - size * 0.04 + gallop * 0.08 + breathe;
  const beltGrad = ctx.createLinearGradient(x - size * 0.24, beltY, x + size * 0.24, beltY + size * 0.05);
  beltGrad.addColorStop(0, "#3c2212");
  beltGrad.addColorStop(0.35, "#6d4125");
  beltGrad.addColorStop(0.65, "#875130");
  beltGrad.addColorStop(1, "#3c2212");
  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.235, beltY - size * 0.004, size * 0.47, size * 0.045, size * 0.01);
  ctx.fill();
  ctx.strokeStyle = centaurGoldDark;
  ctx.lineWidth = 0.9 * zoom;
  ctx.stroke();

  // Belt top trim
  ctx.strokeStyle = "rgba(236, 198, 116, 0.32)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, beltY + size * 0.004);
  ctx.lineTo(x + size * 0.22, beltY + size * 0.004);
  ctx.stroke();

  // Belt buckle
  const buckleGrad = ctx.createRadialGradient(
    x - size * 0.01, beltY + size * 0.02, size * 0.006,
    x, beltY + size * 0.02, size * 0.03,
  );
  buckleGrad.addColorStop(0, centaurGoldLight);
  buckleGrad.addColorStop(0.5, centaurGoldMid);
  buckleGrad.addColorStop(1, centaurGoldDark);
  ctx.fillStyle = buckleGrad;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.04, beltY - size * 0.012, size * 0.08, size * 0.058, size * 0.01);
  ctx.fill();
  ctx.strokeStyle = centaurGoldLight;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Belt center gemstone
  ctx.fillStyle = centaurLeafLight;
  ctx.shadowColor = centaurLeafLight;
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, beltY + size * 0.017, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Belt pouches
  for (const side of [-1, 1] as const) {
    ctx.fillStyle = "#4a2a15";
    ctx.beginPath();
    ctx.roundRect(
      x + side * size * 0.13 - size * 0.028, beltY + size * 0.025,
      size * 0.056, size * 0.044, size * 0.008,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(90, 60, 30, 0.6)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }

  // === GOLDEN SHOULDER PAULDRONS ===
  for (const side of [-1, 1] as const) {
    const pauldronX = x + side * size * 0.27;
    const pauldronY = y - size * 0.3 + gallop * 0.05 + breathe * 0.4;

    ctx.save();
    ctx.translate(pauldronX, pauldronY);
    ctx.rotate(side * 0.15);

    // Leather base layer under pauldron
    const pauldLeatherGrad = ctx.createLinearGradient(0, -size * 0.05, 0, size * 0.08);
    pauldLeatherGrad.addColorStop(0, "#4e2f1b");
    pauldLeatherGrad.addColorStop(0.45, "#714427");
    pauldLeatherGrad.addColorStop(1, "#3c2415");
    ctx.fillStyle = pauldLeatherGrad;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.012, size * 0.092, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(120, 84, 50, 0.35)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Leather stitching seam
    ctx.strokeStyle = "rgba(220, 185, 120, 0.28)";
    ctx.lineWidth = 0.55 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.016, size * 0.07, size * 0.03, side * -0.15, Math.PI * 0.05, Math.PI * 0.95);
    ctx.stroke();

    // Main pauldron plate — golden cap over leather
    const pauldGrad = ctx.createRadialGradient(
      -side * size * 0.015, -size * 0.01, size * 0.01,
      0, 0, size * 0.08,
    );
    pauldGrad.addColorStop(0, "#e8d088");
    pauldGrad.addColorStop(0.3, centaurGoldLight);
    pauldGrad.addColorStop(0.6, centaurGoldMid);
    pauldGrad.addColorStop(1, centaurGoldDark);
    ctx.fillStyle = pauldGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.07, size * 0.005);
    ctx.quadraticCurveTo(0, -size * 0.07, size * 0.07, size * 0.005);
    ctx.quadraticCurveTo(0, size * 0.055, -size * 0.07, size * 0.005);
    ctx.closePath();
    ctx.fill();

    // Raised ridgeline
    ctx.strokeStyle = "rgba(240, 225, 170, 0.5)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.002, size * 0.045, size * 0.02, side * -0.18, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();

    // Green inlay band
    ctx.fillStyle = centaurLeafMid;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.018, size * 0.053, size * 0.016, side * -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Gold outer rim
    ctx.strokeStyle = centaurGoldMid;
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.07, size * 0.005);
    ctx.quadraticCurveTo(0, -size * 0.07, size * 0.07, size * 0.005);
    ctx.quadraticCurveTo(0, size * 0.055, -size * 0.07, size * 0.005);
    ctx.closePath();
    ctx.stroke();

    // Decorative leaf engravings on pauldron
    ctx.strokeStyle = centaurLeafDark;
    ctx.lineWidth = 0.6 * zoom;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(-side * size * 0.035, size * 0.006);
    ctx.quadraticCurveTo(0, -size * 0.018, side * size * 0.035, size * 0.006);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Rivets
    ctx.fillStyle = centaurGoldLight;
    for (let rv = 0; rv < 3; rv++) {
      const rvAngle = (rv / 2) * Math.PI * 0.7 + Math.PI * 0.22;
      const rvx = Math.cos(rvAngle) * size * 0.05;
      const rvy = Math.sin(rvAngle) * size * 0.03;
      ctx.beginPath();
      ctx.arc(rvx, rvy, size * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center gem
    ctx.fillStyle = centaurLeafLight;
    ctx.shadowColor = centaurLeafLight;
    ctx.shadowBlur = 3 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(0, size * 0.003, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Small leather strap tying the gold cap down
    ctx.fillStyle = "#4b2b17";
    ctx.beginPath();
    ctx.roundRect(-size * 0.018, size * 0.03, size * 0.036, size * 0.026, size * 0.005);
    ctx.fill();
    ctx.strokeStyle = centaurGoldDark;
    ctx.lineWidth = 0.45 * zoom;
    ctx.stroke();

    // Hanging leather lames below pauldron
    for (let lame = 0; lame < 3; lame++) {
      const lameY = size * 0.042 + lame * size * 0.022;
      const lameW = size * (0.055 - lame * 0.008);
      ctx.fillStyle = lame % 2 === 0 ? "#5a341b" : "#402515";
      ctx.beginPath();
      ctx.roundRect(-lameW, lameY, lameW * 2, size * 0.018, size * 0.004);
      ctx.fill();
      ctx.strokeStyle = "rgba(160, 122, 60, 0.4)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
    }

    ctx.restore();
  }

  // === POWERFUL ARMS WITH BRACERS (connecting to bow) ===
  const armGrad = ctx.createRadialGradient(
    0,
    size * 0.08,
    0,
    0,
    size * 0.08,
    size * 0.12,
  );
  armGrad.addColorStop(0, "#e8b878");
  armGrad.addColorStop(1, "#c89050");

  // Left arm → bow grip (holding the bow body)
  const centLShoulderX = x - size * 0.26;
  const centLShoulderY = y - size * 0.18 + gallop * 0.05;
  const centArmToBowAngle = Math.atan2(
    bowY - centLShoulderY,
    bowX - centLShoulderX,
  );

  ctx.save();
  ctx.translate(centLShoulderX, centLShoulderY);
  ctx.rotate(centArmToBowAngle);
  // Upper arm
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(size * 0.08, 0, size * 0.13, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(size * 0.18, 0, size * 0.11, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ornate bracer
  ctx.fillStyle = centaurGoldDark;
  ctx.beginPath();
  ctx.ellipse(size * 0.17, 0, size * 0.06, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1;
  ctx.stroke();
  // Bracer gem
  ctx.fillStyle = centaurLeafLight;
  ctx.shadowColor = centaurLeafLight;
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(size * 0.17, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Hand gripping bow
  ctx.fillStyle = "#d8a860";
  ctx.beginPath();
  ctx.arc(size * 0.24, 0, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm → bowstring nock point (pulled back behind the centaur)
  const centRShoulderX = x + size * 0.26;
  const centRShoulderY = y - size * 0.18 + gallop * 0.05;
  // Nock point: behind the bow, pulled right by bowDraw
  const nockX = bowX + size * (0.15 + bowDraw * 0.18);
  const nockY = bowY;
  const centArmToNockAngle = Math.atan2(
    nockY - centRShoulderY,
    nockX - centRShoulderX,
  );

  ctx.save();
  ctx.translate(centRShoulderX, centRShoulderY);
  ctx.rotate(centArmToNockAngle);
  // Upper arm
  ctx.fillStyle = armGrad;
  ctx.beginPath();
  ctx.ellipse(size * 0.08, 0, size * 0.13, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#e0a868";
  ctx.beginPath();
  ctx.ellipse(size * 0.16, 0, size * 0.11, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bracer
  ctx.fillStyle = centaurGoldDark;
  ctx.beginPath();
  ctx.ellipse(size * 0.15, 0, size * 0.06, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = centaurLeafLight;
  ctx.shadowColor = centaurLeafLight;
  ctx.shadowBlur = 3 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(size * 0.15, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Hand pinching the bowstring
  ctx.fillStyle = "#d8a860";
  ctx.beginPath();
  ctx.arc(size * 0.22, 0, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === ORNATE HEAD ===
  const headY = y - size * 0.52 + gallop * 0.04;
  const hairBaseY = headY + size * 0.04;

  // Deep shadow volume behind all hair. This has to render before the neck/face
  // or it reads like a brown cowl sitting on top of the skin.
  ctx.fillStyle = "#6a5010";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, headY - size * 0.09);
  ctx.quadraticCurveTo(x - size * 0.2, headY + size * 0.03, x - size * 0.17 + hairFlow * 2.2, headY + size * 0.2);
  ctx.quadraticCurveTo(x, headY + size * 0.24, x + size * 0.18 + hairFlow * 1.8, headY + size * 0.19);
  ctx.quadraticCurveTo(x + size * 0.2, headY + size * 0.02, x + size * 0.14, headY - size * 0.09);
  ctx.closePath();
  ctx.fill();

  // Neck with highlights
  const neckGrad = ctx.createLinearGradient(
    x - size * 0.06,
    y - size * 0.42,
    x + size * 0.06,
    y - size * 0.42,
  );
  neckGrad.addColorStop(0, "#c89050");
  neckGrad.addColorStop(0.5, "#e0a868");
  neckGrad.addColorStop(1, "#c89050");
  ctx.fillStyle = neckGrad;
  ctx.fillRect(
    x - size * 0.07,
    y - size * 0.42 + gallop * 0.04,
    size * 0.14,
    size * 0.12,
  );

  // Coif and aventail drape in front of the neck
  const neckGuardTopY = y - size * 0.398 + gallop * 0.04;
  const neckGuardBottomY = y - size * 0.248 + gallop * 0.05 + breathe * 0.3;
  const coifTrimGrad = ctx.createLinearGradient(x - size * 0.1, neckGuardTopY, x + size * 0.1, neckGuardTopY + size * 0.04);
  coifTrimGrad.addColorStop(0, "#5d371d");
  coifTrimGrad.addColorStop(0.5, "#8b5830");
  coifTrimGrad.addColorStop(1, "#4f2d18");
  ctx.fillStyle = coifTrimGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, neckGuardTopY + size * 0.01);
  ctx.quadraticCurveTo(x, neckGuardTopY - size * 0.02, x + size * 0.09, neckGuardTopY + size * 0.01);
  ctx.lineTo(x + size * 0.078, neckGuardTopY + size * 0.032);
  ctx.quadraticCurveTo(x, neckGuardTopY + size * 0.008, x - size * 0.078, neckGuardTopY + size * 0.032);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  const aventailGrad = ctx.createLinearGradient(x - size * 0.11, neckGuardTopY, x + size * 0.11, neckGuardBottomY);
  aventailGrad.addColorStop(0, "rgba(92, 72, 24, 0.78)");
  aventailGrad.addColorStop(0.32, "rgba(168, 138, 48, 0.86)");
  aventailGrad.addColorStop(0.58, "rgba(230, 198, 102, 0.88)");
  aventailGrad.addColorStop(1, "rgba(122, 94, 28, 0.8)");
  ctx.save();
  ctx.fillStyle = aventailGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.094, neckGuardTopY + size * 0.022);
  ctx.quadraticCurveTo(x - size * 0.1, neckGuardTopY + size * 0.07, x - size * 0.082, neckGuardBottomY - size * 0.01);
  ctx.quadraticCurveTo(x - size * 0.03, neckGuardBottomY + size * 0.028, x, neckGuardBottomY + size * 0.02);
  ctx.quadraticCurveTo(x + size * 0.03, neckGuardBottomY + size * 0.028, x + size * 0.082, neckGuardBottomY - size * 0.01);
  ctx.quadraticCurveTo(x + size * 0.1, neckGuardTopY + size * 0.07, x + size * 0.094, neckGuardTopY + size * 0.022);
  ctx.quadraticCurveTo(x, neckGuardTopY - size * 0.004, x - size * 0.094, neckGuardTopY + size * 0.022);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x - size * 0.094, neckGuardTopY + size * 0.022);
  ctx.quadraticCurveTo(x - size * 0.1, neckGuardTopY + size * 0.07, x - size * 0.082, neckGuardBottomY - size * 0.01);
  ctx.quadraticCurveTo(x - size * 0.03, neckGuardBottomY + size * 0.028, x, neckGuardBottomY + size * 0.02);
  ctx.quadraticCurveTo(x + size * 0.03, neckGuardBottomY + size * 0.028, x + size * 0.082, neckGuardBottomY - size * 0.01);
  ctx.quadraticCurveTo(x + size * 0.1, neckGuardTopY + size * 0.07, x + size * 0.094, neckGuardTopY + size * 0.022);
  ctx.quadraticCurveTo(x, neckGuardTopY - size * 0.004, x - size * 0.094, neckGuardTopY + size * 0.022);
  ctx.closePath();
  ctx.clip();

  const neckRingR = size * 0.0092;
  const neckRingSpacingX = neckRingR * 1.95;
  const neckRingSpacingY = neckRingR * 1.62;
  for (let row = 0; row < 10; row++) {
    const ringY = neckGuardTopY + size * 0.028 + row * neckRingSpacingY;
    const rowOffset = row % 2 === 0 ? 0 : neckRingSpacingX * 0.52;
    for (let col = -7; col <= 7; col++) {
      const ringX = x + col * neckRingSpacingX + rowOffset;
      const shimmer = Math.sin(time * 2.8 + row * 0.7 + col * 0.55) * 0.07;
      ctx.strokeStyle = `rgba(${204 + Math.floor(shimmer * 96)}, ${178 + Math.floor(shimmer * 84)}, ${74 + Math.floor(shimmer * 52)}, ${0.62 + shimmer})`;
      ctx.lineWidth = 0.52 * zoom;
      ctx.beginPath();
      ctx.arc(ringX, ringY, neckRingR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 240, 186, 0.22)";
      ctx.beginPath();
      ctx.arc(ringX - neckRingR * 0.22, ringY - neckRingR * 0.18, neckRingR * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Coif fold lines and trim
  ctx.strokeStyle = "rgba(92, 68, 22, 0.34)";
  ctx.lineWidth = 0.8 * zoom;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.04, neckGuardTopY + size * 0.03);
    ctx.quadraticCurveTo(
      x + side * size * 0.06,
      neckGuardTopY + size * 0.08,
      x + side * size * 0.05,
      neckGuardBottomY + size * 0.008,
    );
    ctx.stroke();
  }
  ctx.strokeStyle = centaurGoldLight;
  ctx.lineWidth = 0.95 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, neckGuardTopY + size * 0.022);
  ctx.quadraticCurveTo(x, neckGuardTopY - size * 0.004, x + size * 0.09, neckGuardTopY + size * 0.022);
  ctx.stroke();

  // Face with gradient
  const faceGrad = ctx.createRadialGradient(
    x - size * 0.02,
    y - size * 0.52 + gallop * 0.04,
    0,
    x,
    y - size * 0.5 + gallop * 0.04,
    size * 0.15,
  );
  faceGrad.addColorStop(0, "#f0c890");
  faceGrad.addColorStop(0.6, "#e8b878");
  faceGrad.addColorStop(1, "#d8a060");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.52 + gallop * 0.04, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Mail cheek curtains in front of the face edges so the coif remains visible
  for (const side of [-1, 1] as const) {
    const cheekClipX = x + side * size * 0.095;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cheekClipX, y - size * 0.61 + gallop * 0.04);
    ctx.quadraticCurveTo(
      x + side * size * 0.17,
      y - size * 0.54 + gallop * 0.04,
      x + side * size * 0.13,
      y - size * 0.42 + gallop * 0.05,
    );
    ctx.quadraticCurveTo(
      x + side * size * 0.09,
      y - size * 0.39 + gallop * 0.05,
      x + side * size * 0.045,
      y - size * 0.46 + gallop * 0.05,
    );
    ctx.quadraticCurveTo(
      x + side * size * 0.055,
      y - size * 0.55 + gallop * 0.04,
      cheekClipX,
      y - size * 0.61 + gallop * 0.04,
    );
    ctx.closePath();
    ctx.clip();

    for (let row = 0; row < 9; row++) {
      const ringY = y - size * 0.585 + gallop * 0.04 + row * size * 0.018;
      const rowOffset = row % 2 === 0 ? 0 : size * 0.008;
      for (let col = 0; col < 5; col++) {
        const ringX = x + side * (size * (0.07 + col * 0.016) + rowOffset);
        ctx.strokeStyle = "rgba(214, 186, 88, 0.72)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.arc(ringX, ringY, size * 0.0082, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 244, 196, 0.2)";
        ctx.beginPath();
        ctx.arc(ringX - side * size * 0.0015, ringY - size * 0.0015, size * 0.0018, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // === FLOWING GOLDEN HAIR (uniform curtain) ===
  const hairSway = Math.sin(time * 4.2) * 2.8 + hairFlow * 3.4 + size * 0.012;
  const hairTipLift = Math.sin(time * 5.1 + 0.4) * 1.8;
  const hairCurl = Math.sin(time * 6.4 + 0.3) * 1.5;

  // Unified rear curtain to keep the silhouette smoother and more readable
  const hairCurtainGrad = ctx.createLinearGradient(
    x - size * 0.2,
    headY - size * 0.08,
    x + size * 0.26,
    hairBaseY + size * 0.26,
  );
  hairCurtainGrad.addColorStop(0, "#735114");
  hairCurtainGrad.addColorStop(0.22, "#a17220");
  hairCurtainGrad.addColorStop(0.48, "#d4a544");
  hairCurtainGrad.addColorStop(0.76, "#be8930");
  hairCurtainGrad.addColorStop(1, "#8c5d1c");
  ctx.fillStyle = hairCurtainGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, headY - size * 0.11);
  ctx.quadraticCurveTo(
    x - size * 0.24,
    headY + size * 0.02,
    x - size * 0.17 + hairSway * 0.4,
    hairBaseY + size * 0.17,
  );
  ctx.quadraticCurveTo(
    x + size * 0.08,
    hairBaseY + size * 0.31 + hairTipLift,
    x + size * 0.24 + hairSway * 0.95,
    hairBaseY + size * 0.14,
  );
  ctx.quadraticCurveTo(
    x + size * 0.28 + hairSway * 0.55,
    headY - size * 0.005,
    x + size * 0.1,
    headY - size * 0.12,
  );
  ctx.closePath();
  ctx.fill();

  const strandGroups = [
    { startAngle: -1.08, len: 0.3, phase: 0.0, thick: 0.033, sway: 0.72, drift: 0.38 },
    { startAngle: -0.82, len: 0.32, phase: 0.45, thick: 0.036, sway: 0.82, drift: 0.55 },
    { startAngle: -0.56, len: 0.34, phase: 0.9, thick: 0.038, sway: 0.95, drift: 0.72 },
    { startAngle: -0.26, len: 0.36, phase: 1.35, thick: 0.041, sway: 1.05, drift: 0.92 },
    { startAngle: 0.02, len: 0.37, phase: 1.8, thick: 0.042, sway: 1.08, drift: 1.06 },
    { startAngle: 0.26, len: 0.37, phase: 2.25, thick: 0.04, sway: 1.04, drift: 1.16 },
    { startAngle: 0.48, len: 0.36, phase: 2.7, thick: 0.038, sway: 1.0, drift: 1.28 },
    { startAngle: 0.7, len: 0.35, phase: 3.15, thick: 0.035, sway: 0.96, drift: 1.42 },
  ];

  for (let g = 0; g < strandGroups.length; g++) {
    const sg = strandGroups[g];
    const localSway = Math.sin(time * 4.4 + sg.phase) * 2.6 + hairSway * sg.sway;
    const localLift = Math.sin(time * 5.6 + sg.phase + 0.35) * 1.3;
    const kinkA = Math.sin(time * 7.1 + sg.phase * 1.8) * size * 0.018;
    const kinkB = Math.cos(time * 6.3 + sg.phase * 2.1) * size * 0.014;
    const rootX = x + Math.cos(sg.startAngle) * size * 0.12;
    const rootY = headY - size * 0.07;
    const tipX = rootX + Math.cos(sg.startAngle + 0.28) * size * sg.len + localSway * 0.62 + size * 0.11 * sg.drift;
    const tipY = rootY + size * 0.23 + Math.sin(g * 0.36) * size * 0.02 + localLift;
    const midX = (rootX + tipX) * 0.5 + localSway * 0.34 + size * 0.04 * sg.drift + kinkA;
    const midY = (rootY + tipY) * 0.5 - size * 0.034 + kinkB * 0.25;
    const nearTipX = (midX + tipX) * 0.5 + kinkB + hairCurl * 0.6;
    const nearTipY = (midY + tipY) * 0.5 + kinkA * 0.18;

    ctx.fillStyle = "rgba(104, 78, 18, 0.42)";
    ctx.beginPath();
    ctx.moveTo(
      rootX - Math.cos(sg.startAngle + 1.57) * size * sg.thick * 0.52,
      rootY - Math.sin(sg.startAngle + 1.57) * size * sg.thick * 0.52,
    );
    ctx.quadraticCurveTo(midX - size * 0.01, midY + size * 0.01, nearTipX, nearTipY);
    ctx.quadraticCurveTo(nearTipX + kinkB * 0.5, nearTipY + size * 0.012, tipX + size * 0.004, tipY + size * 0.004);
    ctx.quadraticCurveTo(
      midX + size * 0.01,
      midY - size * 0.004,
      rootX + Math.cos(sg.startAngle + 1.57) * size * sg.thick * 0.52,
      rootY + Math.sin(sg.startAngle + 1.57) * size * sg.thick * 0.52,
    );
    ctx.closePath();
    ctx.fill();

    const strandGrad = ctx.createLinearGradient(rootX, rootY, tipX, tipY);
    strandGrad.addColorStop(0, "#9a6e1f");
    strandGrad.addColorStop(0.22, "#be8c2f");
    strandGrad.addColorStop(0.54, "#e3b85b");
    strandGrad.addColorStop(0.78, "#c88d2f");
    strandGrad.addColorStop(1, "#8d5f1b");
    ctx.fillStyle = strandGrad;
    ctx.beginPath();
    ctx.moveTo(
      rootX - Math.cos(sg.startAngle + 1.57) * size * sg.thick * 0.42,
      rootY - Math.sin(sg.startAngle + 1.57) * size * sg.thick * 0.42,
    );
    ctx.quadraticCurveTo(midX, midY, nearTipX, nearTipY);
    ctx.quadraticCurveTo(nearTipX + kinkB * 0.36, nearTipY + size * 0.01, tipX, tipY);
    ctx.quadraticCurveTo(
      midX + size * 0.008,
      midY - size * 0.008,
      rootX + Math.cos(sg.startAngle + 1.57) * size * sg.thick * 0.42,
      rootY + Math.sin(sg.startAngle + 1.57) * size * sg.thick * 0.42,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Squiggly highlight ribbons
  for (let h = 0; h < 6; h++) {
    const hT = h / 5;
    const hAngle = -0.95 + hT * 1.55;
    const hWave = Math.sin(time * 4.9 + h * 0.55) * 2.2 + hairSway * 0.75;
    const hKink = Math.sin(time * 7.4 + h * 1.1) * size * 0.016;
    const hRootX = x + Math.cos(hAngle) * size * 0.098;
    const hRootY = headY - size * 0.082;
    const hTipX = hRootX + Math.cos(hAngle + 0.22) * size * 0.26 + hWave * 0.7 + size * 0.06 * hT;
    const hTipY = hRootY + size * 0.225 + Math.sin(hT * Math.PI) * size * 0.02;

    ctx.strokeStyle = h % 2 === 0 ? "rgba(246, 222, 138, 0.52)" : "rgba(230, 198, 100, 0.44)";
    ctx.lineWidth = (0.95 + Math.sin(h * 1.4) * 0.08) * zoom;
    ctx.beginPath();
    ctx.moveTo(hRootX, hRootY);
    ctx.bezierCurveTo(
      (hRootX + hTipX) * 0.42 + hWave * 0.28,
      (hRootY + hTipY) * 0.5 - size * 0.03 + hKink,
      (hRootX + hTipX) * 0.72 + hWave * 0.34 + hKink,
      (hRootY + hTipY) * 0.62 - size * 0.008,
      hTipX,
      hTipY,
    );
    ctx.stroke();
  }

  // Shimmer on the lower curtain
  for (let sp = 0; sp < 5; sp++) {
    const spX = x - size * 0.08 + sp * size * 0.075 + hairSway * 0.26 + sp * size * 0.016;
    const spY = hairBaseY + size * 0.15 + Math.sin(time * 4.5 + sp) * size * 0.012;
    const spAlpha = 0.24 + Math.sin(time * 5.8 + sp * 0.9) * 0.12;
    ctx.fillStyle = `rgba(255, 232, 145, ${spAlpha})`;
    ctx.beginPath();
    ctx.arc(spX, spY, size * 0.007, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dramatic flyaway tails at the windward edge
  for (let f = 0; f < 3; f++) {
    const fRootX = x + size * (0.02 + f * 0.04);
    const fRootY = headY - size * (0.03 - f * 0.008);
    const fTipX = fRootX + size * (0.18 + f * 0.05) + hairSway * (0.9 + f * 0.1);
    const fTipY = fRootY + size * (0.1 + f * 0.035) + Math.sin(time * 5.2 + f) * size * 0.01;
    const fKink = Math.sin(time * 8 + f * 1.2) * size * 0.018;
    ctx.strokeStyle = f === 0 ? "rgba(233, 201, 110, 0.44)" : "rgba(197, 154, 70, 0.34)";
    ctx.lineWidth = (0.85 - f * 0.12) * zoom;
    ctx.beginPath();
    ctx.moveTo(fRootX, fRootY);
    ctx.bezierCurveTo(
      (fRootX + fTipX) * 0.38 + size * 0.04,
      fRootY - size * (0.05 + f * 0.015) + fKink,
      (fRootX + fTipX) * 0.72 + size * 0.06,
      fRootY + size * (0.01 + f * 0.02) - fKink * 0.4,
      fTipX,
      fTipY,
    );
    ctx.stroke();
  }

  // === CHALCIDIAN BRONZE HELM (open-faced Greco-Roman) ===
  const helmCx = x;
  const helmCy = headY - size * 0.05;
  const helmBob = gallop * 0.04;

  // Helm skull dome — radial gradient for bronze 3D shape
  const helmDomeGrad = ctx.createRadialGradient(
    helmCx - size * 0.03, helmCy - size * 0.08 + helmBob, size * 0.02,
    helmCx, helmCy - size * 0.04 + helmBob, size * 0.18,
  );
  helmDomeGrad.addColorStop(0, "#d4b45a");
  helmDomeGrad.addColorStop(0.25, "#c4a044");
  helmDomeGrad.addColorStop(0.5, centaurGoldMid);
  helmDomeGrad.addColorStop(0.8, centaurGoldDark);
  helmDomeGrad.addColorStop(1, "#4a3a18");
  ctx.fillStyle = helmDomeGrad;
  ctx.beginPath();
  ctx.moveTo(helmCx - size * 0.15, helmCy + size * 0.04 + helmBob);
  ctx.lineTo(helmCx - size * 0.155, helmCy - size * 0.06 + helmBob);
  ctx.quadraticCurveTo(helmCx - size * 0.12, helmCy - size * 0.18 + helmBob, helmCx, helmCy - size * 0.2 + helmBob);
  ctx.quadraticCurveTo(helmCx + size * 0.12, helmCy - size * 0.18 + helmBob, helmCx + size * 0.155, helmCy - size * 0.06 + helmBob);
  ctx.lineTo(helmCx + size * 0.15, helmCy + size * 0.04 + helmBob);
  ctx.closePath();
  ctx.fill();

  // Cheek guards — angled plates framing the face
  for (const side of [-1, 1] as const) {
    const cheekGrad = ctx.createLinearGradient(
      helmCx + side * size * 0.08, helmCy + helmBob,
      helmCx + side * size * 0.17, helmCy + size * 0.12 + helmBob,
    );
    cheekGrad.addColorStop(0, "#b8962e");
    cheekGrad.addColorStop(0.5, centaurGoldMid);
    cheekGrad.addColorStop(1, centaurGoldDark);
    ctx.fillStyle = cheekGrad;
    ctx.beginPath();
    ctx.moveTo(helmCx + side * size * 0.13, helmCy - size * 0.02 + helmBob);
    ctx.lineTo(helmCx + side * size * 0.16, helmCy + size * 0.06 + helmBob);
    ctx.quadraticCurveTo(
      helmCx + side * size * 0.14, helmCy + size * 0.13 + helmBob,
      helmCx + side * size * 0.08, helmCy + size * 0.12 + helmBob,
    );
    ctx.lineTo(helmCx + side * size * 0.06, helmCy + size * 0.04 + helmBob);
    ctx.closePath();
    ctx.fill();

    // Cheek guard hinge rivet
    ctx.fillStyle = centaurGoldLight;
    ctx.beginPath();
    ctx.arc(helmCx + side * size * 0.12, helmCy + size * 0.01 + helmBob, size * 0.007, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose guard — vertical strip
  const noseGrad = ctx.createLinearGradient(helmCx - size * 0.012, 0, helmCx + size * 0.012, 0);
  noseGrad.addColorStop(0, centaurGoldDark);
  noseGrad.addColorStop(0.5, "#d4b85a");
  noseGrad.addColorStop(1, centaurGoldDark);
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.roundRect(helmCx - size * 0.012, helmCy - size * 0.14 + helmBob, size * 0.024, size * 0.16, size * 0.005);
  ctx.fill();

  // Brow band — decorative ridge across forehead
  const browGrad = ctx.createLinearGradient(
    helmCx - size * 0.14, helmCy - size * 0.04 + helmBob,
    helmCx + size * 0.14, helmCy - size * 0.04 + helmBob,
  );
  browGrad.addColorStop(0, centaurGoldDark);
  browGrad.addColorStop(0.2, centaurGoldMid);
  browGrad.addColorStop(0.5, centaurGoldLight);
  browGrad.addColorStop(0.8, centaurGoldMid);
  browGrad.addColorStop(1, centaurGoldDark);
  ctx.fillStyle = browGrad;
  ctx.beginPath();
  ctx.moveTo(helmCx - size * 0.15, helmCy - size * 0.02 + helmBob);
  ctx.quadraticCurveTo(helmCx, helmCy - size * 0.08 + helmBob, helmCx + size * 0.15, helmCy - size * 0.02 + helmBob);
  ctx.quadraticCurveTo(helmCx, helmCy - size * 0.05 + helmBob, helmCx - size * 0.15, helmCy - size * 0.02 + helmBob);
  ctx.closePath();
  ctx.fill();

  // Brow band engraved leaf scrollwork
  ctx.strokeStyle = "rgba(60, 45, 15, 0.5)";
  ctx.lineWidth = 0.6 * zoom;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(helmCx + side * size * 0.03, helmCy - size * 0.04 + helmBob);
    ctx.quadraticCurveTo(
      helmCx + side * size * 0.07, helmCy - size * 0.06 + helmBob,
      helmCx + side * size * 0.11, helmCy - size * 0.035 + helmBob,
    );
    ctx.stroke();
  }

  // Brow band green leaf inlays
  ctx.fillStyle = centaurLeafMid;
  ctx.globalAlpha = 0.7;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.ellipse(
      helmCx + side * size * 0.07, helmCy - size * 0.042 + helmBob,
      size * 0.018, size * 0.007, side * 0.3, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Helm specular highlight on dome
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(helmCx - size * 0.05, helmCy - size * 0.12 + helmBob, size * 0.025, size * 0.06, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Faceted panel lines on dome
  ctx.strokeStyle = "rgba(80, 60, 20, 0.3)";
  ctx.lineWidth = 0.5 * zoom;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(helmCx + side * size * 0.03, helmCy - size * 0.19 + helmBob);
    ctx.quadraticCurveTo(
      helmCx + side * size * 0.06, helmCy - size * 0.08 + helmBob,
      helmCx + side * size * 0.1, helmCy + size * 0.03 + helmBob,
    );
    ctx.stroke();
  }

  // Gold edge trim around helm opening
  ctx.strokeStyle = centaurGoldLight;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(helmCx - size * 0.06, helmCy + size * 0.12 + helmBob);
  ctx.lineTo(helmCx - size * 0.13, helmCy + size * 0.02 + helmBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(helmCx + size * 0.06, helmCy + size * 0.12 + helmBob);
  ctx.lineTo(helmCx + size * 0.13, helmCy + size * 0.02 + helmBob);
  ctx.stroke();

  // === LAUREL WREATH (integrated with helm) ===
  const wreathRadius = size * 0.155;
  const wreathCy = helmCy - size * 0.04 + helmBob;

  // Gold band base
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 2.0 * zoom;
  ctx.beginPath();
  ctx.arc(helmCx, wreathCy, wreathRadius, Math.PI * 0.72, Math.PI * 0.28, true);
  ctx.stroke();

  // Leaves along the wreath — alternating sizes, dual-toned
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 8; i++) {
      const leafAngle = side === -1
        ? Math.PI * 0.72 - i * 0.09
        : Math.PI * 0.28 + i * 0.09;
      const leafX = helmCx + Math.cos(leafAngle) * wreathRadius;
      const leafY = wreathCy + Math.sin(leafAngle) * wreathRadius;
      const lSize = size * (0.028 - i * 0.0012);
      const leafRot = leafAngle + Math.PI * 0.5 * side;

      // Leaf body
      ctx.fillStyle = i % 3 === 0 ? centaurLeafLight : i % 3 === 1 ? centaurLeafMid : centaurLeafDark;
      ctx.beginPath();
      ctx.ellipse(leafX, leafY, lSize, lSize * 0.4, leafRot, 0, Math.PI * 2);
      ctx.fill();

      // Leaf vein
      ctx.strokeStyle = "rgba(30, 60, 25, 0.6)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        leafX - Math.cos(leafRot) * lSize * 0.35,
        leafY - Math.sin(leafRot) * lSize * 0.35,
      );
      ctx.lineTo(
        leafX + Math.cos(leafRot) * lSize * 0.4,
        leafY + Math.sin(leafRot) * lSize * 0.4,
      );
      ctx.stroke();

      // Highlight on leaf
      ctx.fillStyle = "rgba(160, 210, 120, 0.25)";
      ctx.beginPath();
      ctx.ellipse(leafX - Math.cos(leafRot) * lSize * 0.1, leafY - Math.sin(leafRot) * lSize * 0.1, lSize * 0.4, lSize * 0.18, leafRot, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Center crown gem
  ctx.fillStyle = centaurGoldLight;
  ctx.shadowColor = centaurGoldLight;
  ctx.shadowBlur = 6 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(helmCx, wreathCy - wreathRadius - size * 0.01, size * 0.016, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Side berries
  ctx.fillStyle = centaurGoldMid;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.arc(helmCx + side * size * 0.13, wreathCy - size * 0.08, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
  }

  // === FIERCE GLOWING EYES ===
  // Eye base
  ctx.fillStyle = "#577f45";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.05,
    y - size * 0.54 + gallop * 0.04,
    size * 0.028,
    size * 0.022,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.05,
    y - size * 0.54 + gallop * 0.04,
    size * 0.028,
    size * 0.022,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Eye glow
  ctx.fillStyle = "#8eb863";
  ctx.shadowColor = "#9ccd7a";
  ctx.shadowBlur = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.05,
    y - size * 0.54 + gallop * 0.04,
    size * 0.02,
    size * 0.015,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.05,
    y - size * 0.54 + gallop * 0.04,
    size * 0.02,
    size * 0.015,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.045,
    y - size * 0.545 + gallop * 0.04,
    size * 0.01,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.055,
    y - size * 0.545 + gallop * 0.04,
    size * 0.01,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Determined eyebrows
  ctx.strokeStyle = centaurGoldDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.58 + gallop * 0.04);
  ctx.lineTo(x - size * 0.02, y - size * 0.6 + gallop * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.09, y - size * 0.58 + gallop * 0.04);
  ctx.lineTo(x + size * 0.02, y - size * 0.6 + gallop * 0.04);
  ctx.stroke();

  // Noble expression
  ctx.strokeStyle = "#b08060";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.47 + gallop * 0.04,
    size * 0.035,
    0.15,
    Math.PI - 0.15,
  );
  ctx.stroke();

  // === MASTERWORK RECURVE BOW ===
  ctx.save();
  ctx.translate(bowX, bowY);
  ctx.rotate(bowRotation);

  const bowBend = isAttacking ? 0.64 + bowDraw * 0.25 : 0.62;
  const bowRadius = size * 0.28;
  const bendAmt = bowBend * Math.PI;
  const arcStart = Math.PI - bendAmt;
  const arcEnd = Math.PI + bendAmt;

  // Tip positions on the arc
  const topTipX = Math.cos(arcStart) * bowRadius;
  const topTipY = Math.sin(arcStart) * bowRadius;
  const botTipX = Math.cos(arcEnd) * bowRadius;
  const botTipY = Math.sin(arcEnd) * bowRadius;

  // Recurve horn kicks at tips
  const recurveKick = size * 0.04;
  const hornTopX = topTipX + recurveKick * 0.4;
  const hornTopY = topTipY - recurveKick;
  const hornBotX = botTipX + recurveKick * 0.4;
  const hornBotY = botTipY + recurveKick;

  // --- Bow arc body (clean arc) ---
  // Dark outer edge
  ctx.strokeStyle = "#2e1a0a";
  ctx.lineWidth = 3.0 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, bowRadius, arcStart, arcEnd);
  ctx.stroke();

  // Wood core with gradient
  const limbGrad = ctx.createLinearGradient(
    -bowRadius, -bowRadius * 0.5, -bowRadius * 0.3, bowRadius * 0.5,
  );
  limbGrad.addColorStop(0, "#5c3818");
  limbGrad.addColorStop(0.25, "#8a5e34");
  limbGrad.addColorStop(0.5, "#7a5028");
  limbGrad.addColorStop(0.75, "#8a5e34");
  limbGrad.addColorStop(1, "#5c3818");
  ctx.strokeStyle = limbGrad;
  ctx.lineWidth = 2.0 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, bowRadius, arcStart, arcEnd);
  ctx.stroke();

  // Inner highlight along belly of the arc
  ctx.strokeStyle = "rgba(196, 158, 96, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, bowRadius - size * 0.008, arcStart + 0.1, arcEnd - 0.1);
  ctx.stroke();

  // Gold inlay accent marks along the arc
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 1.0 * zoom;
  for (let mark = 0; mark < 3; mark++) {
    const markAngle = Math.PI + (mark - 1) * bendAmt * 0.45;
    ctx.beginPath();
    ctx.arc(0, 0, bowRadius, markAngle - 0.04, markAngle + 0.04);
    ctx.stroke();
  }

  // --- Recurve horn tips ---
  for (const side of [-1, 1] as const) {
    const tipX = side === -1 ? topTipX : botTipX;
    const tipY = side === -1 ? topTipY : botTipY;
    const hornX = side === -1 ? hornTopX : hornBotX;
    const hornY = side === -1 ? hornTopY : hornBotY;

    ctx.strokeStyle = "#4a3018";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(
      tipX + recurveKick * 0.7,
      tipY - side * recurveKick * 0.5,
      hornX,
      hornY,
    );
    ctx.stroke();

    // Gold accent on horn
    ctx.strokeStyle = centaurGoldMid;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(
      tipX + recurveKick * 0.7,
      tipY - side * recurveKick * 0.5,
      hornX,
      hornY,
    );
    ctx.stroke();

    // Nock notch
    ctx.fillStyle = "#1a0f08";
    ctx.beginPath();
    ctx.arc(hornX, hornY, size * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Leather grip wrap ---
  const gripCx = -bowRadius;
  const gripH = size * 0.055;
  const gripW = size * 0.05;
  const gripGrad = ctx.createLinearGradient(
    gripCx - gripW * 0.5, -gripH, gripCx + gripW * 0.5, gripH,
  );
  gripGrad.addColorStop(0, "#2e1c0f");
  gripGrad.addColorStop(0.4, "#4a2a15");
  gripGrad.addColorStop(1, "#24160b");
  ctx.fillStyle = gripGrad;
  ctx.beginPath();
  ctx.roundRect(gripCx - gripW * 0.5, -gripH, gripW, gripH * 2, size * 0.008);
  ctx.fill();
  ctx.strokeStyle = centaurGoldMid;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Wrap stitch lines
  ctx.strokeStyle = "rgba(80, 50, 25, 0.55)";
  ctx.lineWidth = 0.5 * zoom;
  for (let w = 0; w < 3; w++) {
    const wy = -gripH + (w + 0.5) * (gripH * 2) / 3;
    ctx.beginPath();
    ctx.moveTo(gripCx - gripW * 0.35, wy);
    ctx.lineTo(gripCx + gripW * 0.35, wy + size * 0.006);
    ctx.stroke();
  }

  // Grip gemstone
  ctx.fillStyle = centaurGoldLight;
  ctx.shadowColor = centaurGoldLight;
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(gripCx, 0, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = centaurLeafLight;
  ctx.beginPath();
  ctx.arc(gripCx, 0, size * 0.007, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // --- Bowstring - straight lines ---
  const stringPull = -size * (0.2 + (isAttacking ? bowDraw * 0.24 : 0));
  ctx.lineCap = "round";
  if (isAttacking) {
    ctx.shadowColor = "rgba(255, 215, 120, 0.6)";
    ctx.shadowBlur = 4 * zoom * bowDraw;
  }
  ctx.strokeStyle = isAttacking ? "#f5ecd4" : "#ddd5be";
  ctx.lineWidth = (isAttacking ? 1.0 : 0.8) * zoom;
  ctx.beginPath();
  ctx.moveTo(hornTopX, hornTopY);
  ctx.lineTo(stringPull, 0);
  ctx.lineTo(hornBotX, hornBotY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Nocked arrow
  if (!isAttacking || attackPhase < 0.52) {
    const arrowOffset = isAttacking ? bowDraw * size * 0.11 : 0;
    const shaftStart = stringPull + arrowOffset * 0.5 - size * 0.4;
    const shaftEnd = stringPull + arrowOffset * 0.5;
    const shaftW = size * 0.01;

    // Arrow shaft
    const shaftGrad = ctx.createLinearGradient(shaftStart, 0, shaftEnd, 0);
    shaftGrad.addColorStop(0, "#3a2414");
    shaftGrad.addColorStop(0.5, "#5c3e24");
    shaftGrad.addColorStop(1, "#3a2414");
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(shaftStart, -shaftW, shaftEnd - shaftStart, shaftW * 2);

    // Fletching vanes (three angled feathers)
    const fletchX = shaftEnd - size * 0.02;
    for (let f = -1; f <= 1; f++) {
      ctx.fillStyle = f === 0 ? centaurLeafLight : centaurLeafMid;
      ctx.globalAlpha = f === 0 ? 0.9 : 0.7;
      ctx.beginPath();
      ctx.moveTo(fletchX, 0);
      ctx.lineTo(fletchX + size * 0.055, f * size * 0.022 - size * 0.003);
      ctx.lineTo(fletchX + size * 0.06, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Nock (string notch)
    ctx.fillStyle = "#221408";
    ctx.fillRect(shaftEnd - size * 0.004, -shaftW * 1.3, size * 0.008, shaftW * 2.6);

    // Arrowhead - broadhead style
    const headX = shaftStart;
    if (isAttacking) {
      ctx.shadowColor = "#ffcf74";
      ctx.shadowBlur = 6 * zoom * bowDraw;
    }
    const headGrad = ctx.createLinearGradient(
      headX - size * 0.06,
      -size * 0.025,
      headX - size * 0.06,
      size * 0.025,
    );
    headGrad.addColorStop(0, "#bcc4d4");
    headGrad.addColorStop(0.5, isAttacking ? "#eef1fa" : "#dde2ec");
    headGrad.addColorStop(1, "#96a0b2");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.065, 0);
    ctx.lineTo(headX - size * 0.01, -size * 0.024);
    ctx.lineTo(headX + size * 0.005, 0);
    ctx.lineTo(headX - size * 0.01, size * 0.024);
    ctx.closePath();
    ctx.fill();

    // Arrowhead edge highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX - size * 0.06, 0);
    ctx.lineTo(headX - size * 0.012, -size * 0.02);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}
