import type { Position } from "../../types";
import { getScenePressure } from "../performance";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  anchorWeaponToHand,
  drawHorseTail,
  drawMuscularHorseBody,
  drawMuscularHorseLeg,
  drawDetailedArm,
} from "./troopHelpers";
import type { HorseLegColors, ArmColors } from "./troopHelpers";

export function drawCavalryTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position
) {
  // ROYAL CAVALRY CHAMPION - Epic Knight of Princeton with Ornate Detail
  const gallop = Math.sin(time * 8.4) * 3.6;
  const legCycle = Math.sin(time * 8.4) * 0.4;
  const headBob = Math.sin(time * 8.4 + 0.5) * 2.4;
  const breathe = Math.sin(time * 2) * 0.3;
  const shimmer = Math.sin(time * 5) * 0.5 + 0.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  const royalPurpleDark = "#201334";
  const royalPurpleMid = "#4b2b74";
  const royalPurpleLight = "#7762b2";
  const brassDark = "#5f4312";
  const brassMid = "#b98b36";
  const brassLight = "#e2c984";
  const horseCoatDark = "#23150b";
  const horseCoatMid = "#3a2516";
  const horseCoatLight = "#5a3d24";

  // Attack animation
  const isAttacking = attackPhase > 0;
  const lanceThrust = isAttacking ? Math.sin(attackPhase * Math.PI) * 2.5 : 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0

  // === MULTI-LAYERED ROYAL AURA ===
  const auraIntensity = isAttacking ? 0.65 : 0.4;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;

  // Multiple layered aura for depth
  const cavPressure = getScenePressure();
  const cavAuraLayers = cavPressure.skipNonEssentialParticles
    ? 0
    : cavPressure.skipDecorativeEffects
      ? 1
      : 3;
  for (let auraLayer = 0; auraLayer < cavAuraLayers; auraLayer++) {
    const layerOffset = auraLayer * 0.12;
    const auraGrad = ctx.createRadialGradient(
      x,
      y + size * 0.1,
      size * (0.08 + layerOffset),
      x,
      y + size * 0.1,
      size * (0.9 + layerOffset * 0.3)
    );
    auraGrad.addColorStop(
      0,
      `rgba(146, 98, 235, ${auraIntensity * auraPulse * (0.5 - auraLayer * 0.12)})`
    );
    auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + size * 0.15,
      size * (0.8 + layerOffset * 0.2),
      size * (0.52 + layerOffset * 0.12),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Floating royal rune particles
  for (let p = 0; p < 8; p++) {
    const pAngle = (time * 1.8 + p * Math.PI * 0.25) % (Math.PI * 2);
    const pDist = size * 0.55 + Math.sin(time * 2.5 + p * 0.8) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.35;
    const pAlpha = 0.5 + Math.sin(time * 3.5 + p * 0.5) * 0.3;
    ctx.fillStyle = `rgba(175, 133, 255, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.018, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.fillStyle = `rgba(225, 211, 255, ${pAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack energy rings with spark trails
  if (isAttacking) {
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6 * attackIntensity;
      ctx.strokeStyle = `rgba(161, 110, 244, ${ringAlpha})`;
      ctx.lineWidth = (3.5 - ring * 0.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.1,
        size * (0.45 + ringPhase * 0.45),
        size * (0.3 + ringPhase * 0.28),
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    // Spark particles during attack
    for (let sp = 0; sp < 6; sp++) {
      const spAngle = time * 8 + (sp * Math.PI) / 3;
      const spDist = size * 0.4 + attackIntensity * size * 0.3;
      const spX = x + Math.cos(spAngle) * spDist;
      const spY = y + size * 0.1 + Math.sin(spAngle) * spDist * 0.4;
      ctx.fillStyle = `rgba(220, 190, 255, ${attackIntensity * 0.7})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === MAJESTIC ROYAL WAR STEED ===
  const bodyY = y + size * 0.18 + gallop * 0.15;
  drawMuscularHorseBody(ctx, x, bodyY, size * 0.48, size * 0.31, size, zoom, {
    coatDark: horseCoatDark,
    coatLight: horseCoatLight,
    coatMid: horseCoatMid,
    muscleHighlight: "rgba(90, 70, 45, 0.2)",
    muscleShadow: "rgba(30, 20, 10, 0.35)",
  });

  // === ORNATE ROYAL BARDING (horse armor) ===
  // Base barding plate with gradient
  const bardingGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y + size * 0.1,
    x + size * 0.4,
    y + size * 0.25
  );
  bardingGrad.addColorStop(0, "#3a3a42");
  bardingGrad.addColorStop(0.2, "#5a5a62");
  bardingGrad.addColorStop(0.5, "#6a6a72");
  bardingGrad.addColorStop(0.8, "#5a5a62");
  bardingGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = bardingGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.18 + gallop * 0.15,
    size * 0.44,
    size * 0.24,
    0,
    Math.PI * 0.65,
    Math.PI * 2.35
  );
  ctx.fill();

  // Barding edge highlights
  ctx.strokeStyle = "#7a7a82";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.18 + gallop * 0.15,
    size * 0.44,
    size * 0.24,
    0,
    Math.PI * 0.7,
    Math.PI * 2.3
  );
  ctx.stroke();

  // Orange trim on barding with double line
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.18 + gallop * 0.15,
    size * 0.44,
    size * 0.24,
    0,
    Math.PI * 0.75,
    Math.PI * 2.25
  );
  ctx.stroke();
  ctx.strokeStyle = brassLight;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.16 + gallop * 0.15,
    size * 0.42,
    size * 0.22,
    0,
    Math.PI * 0.8,
    Math.PI * 2.2
  );
  ctx.stroke();

  // Engraved filigree patterns on barding
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.7;
  // Left swirl
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.08 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y + size * 0.15,
    x - size * 0.28,
    y + size * 0.18 + gallop * 0.15
  );
  ctx.quadraticCurveTo(
    x - size * 0.22,
    y + size * 0.22,
    x - size * 0.28,
    y + size * 0.28 + gallop * 0.15
  );
  ctx.stroke();
  // Right swirl
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + size * 0.06 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y + size * 0.12,
    x + size * 0.22,
    y + size * 0.16 + gallop * 0.15
  );
  ctx.quadraticCurveTo(
    x + size * 0.16,
    y + size * 0.2,
    x + size * 0.22,
    y + size * 0.26 + gallop * 0.15
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Ornate decorative medallions with gems
  ctx.shadowColor = brassMid;
  ctx.shadowBlur = 5 * zoom;
  for (let i = 0; i < 5; i++) {
    const medX = x - size * 0.28 + i * size * 0.14;
    const medY =
      y + size * 0.04 + gallop * 0.15 + Math.sin(i * 0.8) * size * 0.02;
    // Gold medallion base
    ctx.fillStyle = brassMid;
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.032, 0, Math.PI * 2);
    ctx.fill();
    // Inner medallion detail
    ctx.fillStyle = brassLight;
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    // Center gem (alternating colors)
    ctx.fillStyle = i % 2 === 0 ? royalPurpleLight : "#84a9ff";
    ctx.shadowColor = i % 2 === 0 ? royalPurpleLight : "#a4c4ff";
    ctx.shadowBlur = 4 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(medX, medY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Reinforced heavy barding: segmented faulds and belly plate.
  const fauldGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y + size * 0.19,
    x + size * 0.35,
    y + size * 0.31
  );
  fauldGrad.addColorStop(0, "#2f3442");
  fauldGrad.addColorStop(0.5, "#525f74");
  fauldGrad.addColorStop(1, "#2e3440");
  for (let plate = 0; plate < 6; plate++) {
    const plateX = x - size * 0.34 + plate * size * 0.11;
    const plateY =
      y + size * 0.23 + gallop * 0.15 + Math.sin(plate * 0.9) * size * 0.01;
    ctx.fillStyle = fauldGrad;
    ctx.beginPath();
    ctx.roundRect(plateX, plateY, size * 0.1, size * 0.08, size * 0.016);
    ctx.fill();
    ctx.strokeStyle = "rgba(196, 206, 224, 0.5)";
    ctx.lineWidth = 0.9 * zoom;
    ctx.stroke();
    ctx.strokeStyle = brassMid;
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.moveTo(plateX + size * 0.018, plateY + size * 0.014);
    ctx.lineTo(plateX + size * 0.082, plateY + size * 0.014);
    ctx.stroke();
  }

  const bellyGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y + size * 0.3,
    x + size * 0.2,
    y + size * 0.43
  );
  bellyGrad.addColorStop(0, "#2b2f3c");
  bellyGrad.addColorStop(0.5, "#49576e");
  bellyGrad.addColorStop(1, "#272d3a");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.21,
    y + size * 0.29 + gallop * 0.15,
    size * 0.42,
    size * 0.08,
    size * 0.02
  );
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.68)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Saddle blanket visible edge
  ctx.fillStyle = "#1a0a3a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.02 + gallop * 0.15);
  ctx.lineTo(x - size * 0.2, y + size * 0.12 + gallop * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.14 + gallop * 0.15);
  ctx.lineTo(x + size * 0.12, y + size * 0.04 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  // Gold fringe on blanket
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.12 + gallop * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.14 + gallop * 0.15);
  ctx.stroke();

  // === HORSE LEGS (jointed gait with angled hooves) ===
  const cavLegColors: HorseLegColors = {
    greaveBottom: "#4f5666",
    greaveMid: "#7a8394",
    greaveTop: "#595f6d",
    hoofColor: "#2c2017",
    thighDark: horseCoatDark,
    thighLight: horseCoatLight,
    thighMid: horseCoatMid,
    trimColor: brassMid,
  };
  drawMuscularHorseLeg(
    ctx,
    x - size * 0.25,
    y + size * 0.3 + gallop * 0.13,
    size,
    zoom,
    time,
    legCycle * 1.15,
    0.2,
    8,
    cavLegColors
  );
  drawMuscularHorseLeg(
    ctx,
    x - size * 0.08,
    y + size * 0.31 + gallop * 0.13,
    size,
    zoom,
    time,
    -legCycle * 0.95,
    1.2,
    8,
    cavLegColors
  );
  drawMuscularHorseLeg(
    ctx,
    x + size * 0.13,
    y + size * 0.31 + gallop * 0.13,
    size,
    zoom,
    time,
    -legCycle * 1.05,
    2.1,
    8,
    cavLegColors
  );
  drawMuscularHorseLeg(
    ctx,
    x + size * 0.3,
    y + size * 0.3 + gallop * 0.13,
    size,
    zoom,
    time,
    legCycle * 0.88,
    3.1,
    8,
    cavLegColors
  );

  // === HORSE NECK AND HEAD ===
  const hb = headBob;
  const gp = gallop * 0.15;

  // Muscular neck — angular wedge shape
  const neckGrad = ctx.createLinearGradient(
    x - size * 0.32,
    y + size * 0.12,
    x - size * 0.62,
    y - size * 0.12
  );
  neckGrad.addColorStop(0, "#3a2a1a");
  neckGrad.addColorStop(0.35, "#4a3620");
  neckGrad.addColorStop(0.7, "#2a1a0a");
  neckGrad.addColorStop(1, "#1a0a00");
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  // Crest (top of neck) — arched, muscular
  ctx.moveTo(x - size * 0.32, y + size * 0.04 + gp);
  ctx.bezierCurveTo(
    x - size * 0.38,
    y - size * 0.08 + hb * 0.3,
    x - size * 0.48,
    y - size * 0.2 + hb * 0.5,
    x - size * 0.58,
    y - size * 0.12 + hb
  );
  // Poll → jaw
  ctx.lineTo(x - size * 0.72, y - size * 0.06 + hb);
  // Throat — angular underside
  ctx.lineTo(x - size * 0.68, y + size * 0.04 + hb);
  ctx.bezierCurveTo(
    x - size * 0.58,
    y + size * 0.08 + hb * 0.6,
    x - size * 0.45,
    y + size * 0.16 + gp,
    x - size * 0.3,
    y + size * 0.2 + gp
  );
  ctx.closePath();
  ctx.fill();

  // Neck muscle definition — angular lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.16)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.34, y + size * 0.08 + gp);
  ctx.bezierCurveTo(
    x - size * 0.42,
    y + size * 0.02 + hb * 0.4,
    x - size * 0.52,
    y - size * 0.06 + hb * 0.6,
    x - size * 0.6,
    y - size * 0.04 + hb
  );
  ctx.stroke();
  // Jugular groove
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.33, y + size * 0.14 + gp);
  ctx.bezierCurveTo(
    x - size * 0.44,
    y + size * 0.1 + hb * 0.5,
    x - size * 0.56,
    y + size * 0.02 + hb * 0.7,
    x - size * 0.66,
    y + 0 + hb
  );
  ctx.stroke();
  // Neck highlight
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.34, y + size * 0.05 + gp);
  ctx.bezierCurveTo(
    x - size * 0.42,
    y - size * 0.06 + hb * 0.4,
    x - size * 0.5,
    y - size * 0.16 + hb * 0.6,
    x - size * 0.56,
    y - size * 0.1 + hb
  );
  ctx.stroke();
  ctx.restore();

  // Crinet (neck armor) — angular segmented plates
  const crinetGrad = ctx.createLinearGradient(
    x - size * 0.36,
    y + size * 0.04,
    x - size * 0.54,
    y - size * 0.1
  );
  crinetGrad.addColorStop(0, "#515a6d");
  crinetGrad.addColorStop(0.4, "#6d788d");
  crinetGrad.addColorStop(0.7, "#616979");
  crinetGrad.addColorStop(1, "#4a5264");
  ctx.fillStyle = crinetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + 0 + gp);
  ctx.bezierCurveTo(
    x - size * 0.4,
    y - size * 0.08 + hb * 0.4,
    x - size * 0.48,
    y - size * 0.16 + hb * 0.6,
    x - size * 0.54,
    y - size * 0.1 + hb
  );
  ctx.lineTo(x - size * 0.5, y - size * 0.04 + hb);
  ctx.bezierCurveTo(
    x - size * 0.45,
    y - size * 0.08 + hb * 0.5,
    x - size * 0.4,
    y + 0 + gp,
    x - size * 0.34,
    y + size * 0.06 + gp
  );
  ctx.closePath();
  ctx.fill();
  // Crinet segment lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 0.7 * zoom;
  for (const t of [0.25, 0.5, 0.75]) {
    const sx = x - size * (0.35 + t * 0.19);
    const sy1 = y + size * (0 - t * 0.1) + gp * (1 - t) + hb * t * 0.5;
    const sy2 = sy1 + size * 0.06;
    ctx.beginPath();
    ctx.moveTo(sx, sy1);
    ctx.lineTo(sx + size * 0.01, sy2);
    ctx.stroke();
  }
  // Crinet gold trim
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + 0 + gp);
  ctx.bezierCurveTo(
    x - size * 0.4,
    y - size * 0.08 + hb * 0.4,
    x - size * 0.48,
    y - size * 0.16 + hb * 0.6,
    x - size * 0.54,
    y - size * 0.1 + hb
  );
  ctx.stroke();

  // === ANGULAR HORSE HEAD ===
  // Skull — angular wedge with prominent jaw
  const skullGrad = ctx.createLinearGradient(
    x - size * 0.58,
    y - size * 0.15 + hb,
    x - size * 0.76,
    y + size * 0.06 + hb
  );
  skullGrad.addColorStop(0, "#4a3620");
  skullGrad.addColorStop(0.4, "#3a2818");
  skullGrad.addColorStop(1, "#2a1a0c");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  // Forehead
  ctx.moveTo(x - size * 0.56, y - size * 0.14 + hb);
  // Bridge of nose — angular
  ctx.lineTo(x - size * 0.72, y - size * 0.06 + hb);
  // Muzzle tip — sharp angle
  ctx.lineTo(x - size * 0.8, y + size * 0.01 + hb);
  // Chin/lower lip
  ctx.lineTo(x - size * 0.76, y + size * 0.06 + hb);
  // Jaw angle — prominent
  ctx.lineTo(x - size * 0.68, y + size * 0.06 + hb);
  // Throat latch
  ctx.lineTo(x - size * 0.62, y + size * 0.03 + hb);
  // Cheek
  ctx.bezierCurveTo(
    x - size * 0.58,
    y + 0 + hb,
    x - size * 0.54,
    y - size * 0.06 + hb,
    x - size * 0.56,
    y - size * 0.14 + hb
  );
  ctx.closePath();
  ctx.fill();

  // Cheekbone highlight
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.6,
    y - size * 0.04 + hb,
    size * 0.04,
    size * 0.03,
    -0.4,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // Jaw muscle definition
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.02 + hb);
  ctx.bezierCurveTo(
    x - size * 0.62,
    y + size * 0.02 + hb,
    x - size * 0.66,
    y + size * 0.04 + hb,
    x - size * 0.68,
    y + size * 0.05 + hb
  );
  ctx.stroke();

  // Nostrils — angular flared
  ctx.fillStyle = "#1a0e06";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.78, y + 0 + hb);
  ctx.bezierCurveTo(
    x - size * 0.795,
    y - size * 0.01 + hb,
    x - size * 0.79,
    y + size * 0.02 + hb,
    x - size * 0.775,
    y + size * 0.025 + hb
  );
  ctx.bezierCurveTo(
    x - size * 0.77,
    y + size * 0.01 + hb,
    x - size * 0.775,
    y - size * 0.005 + hb,
    x - size * 0.78,
    y + 0 + hb
  );
  ctx.fill();
  // Second nostril
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.755,
    y + size * 0.035 + hb,
    size * 0.012,
    size * 0.008,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // === ORNATE CHANFRON (head armor) ===
  const chanfronGrad = ctx.createLinearGradient(
    x - size * 0.56,
    y - size * 0.16 + hb,
    x - size * 0.74,
    y + size * 0.04 + hb
  );
  chanfronGrad.addColorStop(0, "#515a6d");
  chanfronGrad.addColorStop(0.3, "#6d788d");
  chanfronGrad.addColorStop(0.6, "#5f6a7e");
  chanfronGrad.addColorStop(1, "#485062");
  ctx.fillStyle = chanfronGrad;
  ctx.beginPath();
  // Angular faceguard following skull contours
  ctx.moveTo(x - size * 0.55, y - size * 0.15 + hb);
  ctx.lineTo(x - size * 0.71, y - size * 0.065 + hb);
  ctx.lineTo(x - size * 0.74, y - size * 0.01 + hb);
  ctx.lineTo(x - size * 0.68, y + size * 0.04 + hb);
  ctx.lineTo(x - size * 0.6, y + size * 0.02 + hb);
  ctx.bezierCurveTo(
    x - size * 0.56,
    y - 0 + hb,
    x - size * 0.53,
    y - size * 0.08 + hb,
    x - size * 0.55,
    y - size * 0.15 + hb
  );
  ctx.closePath();
  ctx.fill();

  // Chanfron center ridge
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.56, y - size * 0.13 + hb);
  ctx.lineTo(x - size * 0.72, y - size * 0.04 + hb);
  ctx.stroke();

  // Chanfron reinforcement lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.1 + hb);
  ctx.lineTo(x - size * 0.66, y + size * 0.02 + hb);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.54, y - size * 0.1 + hb);
  ctx.lineTo(x - size * 0.62, y + size * 0.02 + hb);
  ctx.stroke();

  // Brass accent lines on chanfron
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.55, y - size * 0.15 + hb);
  ctx.lineTo(x - size * 0.71, y - size * 0.065 + hb);
  ctx.lineTo(x - size * 0.74, y - size * 0.01 + hb);
  ctx.stroke();
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.68, y + size * 0.04 + hb);
  ctx.lineTo(x - size * 0.6, y + size * 0.02 + hb);
  ctx.stroke();

  // Muzzle guard plate
  const snoutGrad = ctx.createLinearGradient(
    x - size * 0.8,
    y - size * 0.02 + hb,
    x - size * 0.68,
    y + size * 0.06 + hb
  );
  snoutGrad.addColorStop(0, "#3a404e");
  snoutGrad.addColorStop(0.5, "#5f7086");
  snoutGrad.addColorStop(1, "#394150");
  ctx.fillStyle = snoutGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.74, y - size * 0.02 + hb);
  ctx.lineTo(x - size * 0.78, y + size * 0.005 + hb);
  ctx.lineTo(x - size * 0.75, y + size * 0.04 + hb);
  ctx.lineTo(x - size * 0.68, y + size * 0.04 + hb);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Elaborate golden crest with sharp spikes
  ctx.fillStyle = brassMid;
  ctx.shadowColor = brassLight;
  ctx.shadowBlur = 6 * zoom;
  // Center spike — taller, sharper
  ctx.beginPath();
  ctx.moveTo(x - size * 0.555, y - size * 0.16 + hb);
  ctx.lineTo(x - size * 0.535, y - size * 0.32 + hb);
  ctx.lineTo(x - size * 0.515, y - size * 0.16 + hb);
  ctx.closePath();
  ctx.fill();
  // Left spike
  ctx.beginPath();
  ctx.moveTo(x - size * 0.585, y - size * 0.14 + hb);
  ctx.lineTo(x - size * 0.61, y - size * 0.26 + hb);
  ctx.lineTo(x - size * 0.57, y - size * 0.14 + hb);
  ctx.closePath();
  ctx.fill();
  // Right spike
  ctx.beginPath();
  ctx.moveTo(x - size * 0.515, y - size * 0.14 + hb);
  ctx.lineTo(x - size * 0.48, y - size * 0.24 + hb);
  ctx.lineTo(x - size * 0.5, y - size * 0.14 + hb);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Chanfron gem
  ctx.fillStyle = royalPurpleLight;
  ctx.shadowColor = royalPurpleLight;
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x - size * 0.59, y - size * 0.08 + hb, size * 0.024, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Royal-violet eye — positioned on cheek area
  ctx.fillStyle = "#6f53b8";
  ctx.shadowColor = royalPurpleLight;
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.6, y - size * 0.03 + hb, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  // Eye inner glow
  ctx.fillStyle = "#b193ef";
  ctx.beginPath();
  ctx.arc(x - size * 0.6, y - size * 0.03 + hb, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = `rgba(255, 255, 200, ${shimmer})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.61, y - size * 0.035 + hb, size * 0.007, 0, Math.PI * 2);
  ctx.fill();
  // Iris + pupil
  ctx.fillStyle = "rgba(211, 191, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(x - size * 0.6, y - size * 0.03 + hb, size * 0.009, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c0f04";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.578,
    y - size * 0.02 + headBob,
    size * 0.0055,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Proud armored ears
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.54, y - size * 0.14 + headBob);
  ctx.lineTo(x - size * 0.6, y - size * 0.26 + headBob);
  ctx.lineTo(x - size * 0.5, y - size * 0.16 + headBob);
  ctx.fill();
  // Ear armor tips
  ctx.fillStyle = "#646f82";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.2 + headBob);
  ctx.lineTo(x - size * 0.6, y - size * 0.26 + headBob);
  ctx.lineTo(x - size * 0.56, y - size * 0.2 + headBob);
  ctx.closePath();
  ctx.fill();

  // === FLOWING MANE WITH FIRE EFFECT ===
  // Base mane (dark)
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.46, y - size * 0.14 + headBob);
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const maneX = x - size * 0.46 + t * size * 0.6;
    const maneWave = Math.sin(time * 8 + i * 0.6) * 5;
    const maneY =
      y - size * 0.28 + maneWave + gallop * (0.1 - t * 0.08) + t * size * 0.16;
    ctx.lineTo(maneX, maneY);
  }
  ctx.lineTo(x + size * 0.14, y - size * 0.04 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();

  // Mane highlight strands
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1.5;
  for (let strand = 0; strand < 5; strand++) {
    ctx.beginPath();
    const startX = x - size * 0.44 + strand * size * 0.1;
    ctx.moveTo(startX, y - size * 0.14 + headBob);
    const waveOffset = Math.sin(time * 8 + strand * 0.8) * 4;
    ctx.quadraticCurveTo(
      startX + size * 0.05 + waveOffset,
      y - size * 0.22,
      startX + size * 0.1 + waveOffset,
      y - size * 0.08 + gallop * 0.1
    );
    ctx.stroke();
  }

  // Violet shimmer at the mane tips.
  const maneGlow = 0.6 + Math.sin(time * 6) * 0.3;
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const tipX = x - size * 0.42 + t * size * 0.56;
    const tipY =
      y - size * 0.32 + Math.sin(time * 8 + i * 0.7) * 5 + gallop * 0.08;
    // Outer glow
    ctx.fillStyle = `rgba(106, 74, 186, ${maneGlow * 0.45})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
    // Inner bright
    ctx.fillStyle = `rgba(195, 166, 255, ${maneGlow})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // === MAJESTIC TAIL ===
  drawHorseTail(
    ctx,
    x + size * 0.34,
    y + size * 0.12 + gallop * 0.15,
    size,
    zoom,
    time,
    6,
    4.2,
    {
      accent: "rgba(156, 129, 219, 0.45)",
      base: "#1d130d",
      glowRgb: "193, 168, 252",
      highlight: "#5a3d24",
      mid: "#3d2616",
    },
    0.25 + maneGlow * 0.3,
    { intensity: maneGlow, rgb: "220, 200, 255", threshold: 0.3 }
  );

  // === ROYAL KNIGHT RIDER ===
  // Broader royal cape that rides above the horse silhouette.
  const riderBob = gallop * 0.1 + breathe;
  const capeFlow = Math.sin(time * 4.2) * size * 0.06;
  const capeFlow2 = Math.sin(time * 5 + 0.8) * size * 0.045;
  const capeBottomY = y + size * 0.045 + gallop * 0.04;
  const riderCapeGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y - size * 0.56 + riderBob * 0.4,
    x + size * 0.25,
    capeBottomY
  );
  riderCapeGrad.addColorStop(0, "#22123f");
  riderCapeGrad.addColorStop(0.45, royalPurpleDark);
  riderCapeGrad.addColorStop(0.75, royalPurpleMid);
  riderCapeGrad.addColorStop(1, "#2a164f");
  ctx.fillStyle = riderCapeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.46 + riderBob * 0.5);
  ctx.quadraticCurveTo(
    x - size * 0.36 + capeFlow,
    y - size * 0.2,
    x - size * 0.24 + capeFlow2,
    capeBottomY
  );
  ctx.lineTo(x + size * 0.24 + capeFlow2 * 0.6, capeBottomY - size * 0.01);
  ctx.quadraticCurveTo(
    x + size * 0.32 + capeFlow * 0.6,
    y - size * 0.18,
    x + size * 0.2,
    y - size * 0.46 + riderBob * 0.5
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(214, 172, 69, ${0.52 + shimmer * 0.2})`;
  ctx.lineWidth = 1.25 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y - size * 0.43 + riderBob * 0.5);
  ctx.quadraticCurveTo(
    x - size * 0.3 + capeFlow * 0.9,
    y - size * 0.2,
    x - size * 0.2 + capeFlow2 * 0.9,
    capeBottomY - size * 0.02
  );
  ctx.stroke();

  // === ROYAL CUIRASS (multi-plate breastplate) ===
  const cuirassTop = y - size * 0.52 + riderBob * 0.55;
  const cuirassBot = y - size * 0.085 + riderBob;

  // Base breastplate — radial gradient for 3D dome shape
  const cuirassGrad = ctx.createRadialGradient(
    x - size * 0.04,
    cuirassTop + (cuirassBot - cuirassTop) * 0.35,
    0,
    x,
    cuirassTop + (cuirassBot - cuirassTop) * 0.5,
    size * 0.38
  );
  cuirassGrad.addColorStop(0, "#8a96a8");
  cuirassGrad.addColorStop(0.3, "#7a8698");
  cuirassGrad.addColorStop(0.6, "#5a6576");
  cuirassGrad.addColorStop(1, "#3b4351");
  ctx.fillStyle = cuirassGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, cuirassBot);
  ctx.lineTo(x - size * 0.25, cuirassTop + size * 0.02);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.62 + riderBob * 0.45,
    x + size * 0.25,
    cuirassTop + size * 0.02
  );
  ctx.lineTo(x + size * 0.22, cuirassBot);
  ctx.closePath();
  ctx.fill();

  // Upper chest plate — lighter
  const upperChestGrad = ctx.createLinearGradient(
    x - size * 0.18,
    cuirassTop,
    x + size * 0.18,
    cuirassTop + size * 0.18
  );
  upperChestGrad.addColorStop(0, "rgba(130, 142, 160, 0.5)");
  upperChestGrad.addColorStop(0.5, "rgba(160, 172, 190, 0.35)");
  upperChestGrad.addColorStop(1, "rgba(100, 112, 130, 0.4)");
  ctx.fillStyle = upperChestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, cuirassTop + size * 0.15);
  ctx.lineTo(x - size * 0.24, cuirassTop + size * 0.02);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.61 + riderBob * 0.45,
    x + size * 0.24,
    cuirassTop + size * 0.02
  );
  ctx.lineTo(x + size * 0.22, cuirassTop + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Raised central ridge (medial ridge)
  const ridgeGrad = ctx.createLinearGradient(
    x - size * 0.015,
    0,
    x + size * 0.015,
    0
  );
  ridgeGrad.addColorStop(0, "rgba(90, 100, 115, 0.7)");
  ridgeGrad.addColorStop(0.5, "rgba(180, 192, 210, 0.6)");
  ridgeGrad.addColorStop(1, "rgba(90, 100, 115, 0.7)");
  ctx.fillStyle = ridgeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.012, cuirassTop + size * 0.04);
  ctx.lineTo(x + size * 0.012, cuirassTop + size * 0.04);
  ctx.lineTo(x + size * 0.015, cuirassBot - size * 0.02);
  ctx.lineTo(x - size * 0.015, cuirassBot - size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Plackart (lower breastplate) — slightly offset plate
  const plackartY = cuirassTop + (cuirassBot - cuirassTop) * 0.55;
  const plackGrad = ctx.createLinearGradient(
    x - size * 0.18,
    plackartY,
    x + size * 0.18,
    cuirassBot
  );
  plackGrad.addColorStop(0, "#4b5564");
  plackGrad.addColorStop(0.4, "#6a7688");
  plackGrad.addColorStop(1, "#3e4552");
  ctx.fillStyle = plackGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, plackartY);
  ctx.quadraticCurveTo(x, plackartY - size * 0.015, x + size * 0.2, plackartY);
  ctx.lineTo(x + size * 0.21, cuirassBot);
  ctx.lineTo(x - size * 0.21, cuirassBot);
  ctx.closePath();
  ctx.fill();

  // Plackart overlap line
  ctx.strokeStyle = "rgba(40, 48, 60, 0.7)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, plackartY + size * 0.005);
  ctx.quadraticCurveTo(
    x,
    plackartY - size * 0.01,
    x + size * 0.19,
    plackartY + size * 0.005
  );
  ctx.stroke();

  // Horizontal articulation lames on plackart
  for (let lame = 0; lame < 2; lame++) {
    const lameY = plackartY + (lame + 1) * size * 0.055;
    const lameHW = size * (0.19 - lame * 0.01);
    ctx.strokeStyle = "rgba(50, 58, 70, 0.5)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - lameHW, lameY);
    ctx.quadraticCurveTo(x, lameY - size * 0.008, x + lameHW, lameY);
    ctx.stroke();
  }

  // Gorget (neck guard) — layered collar above cuirass
  const gorgetY = cuirassTop + size * 0.01;
  const gorgetGrad = ctx.createLinearGradient(
    x - size * 0.12,
    gorgetY - size * 0.04,
    x + size * 0.12,
    gorgetY
  );
  gorgetGrad.addColorStop(0, "#4b5564");
  gorgetGrad.addColorStop(0.5, "#6a7a8e");
  gorgetGrad.addColorStop(1, "#4b5564");
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, gorgetY);
  ctx.quadraticCurveTo(x, gorgetY - size * 0.06, x + size * 0.15, gorgetY);
  ctx.quadraticCurveTo(x, gorgetY - size * 0.02, x - size * 0.15, gorgetY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Raised collar plate so the gorget reads more like layered neck armor.
  const collarPlateGrad = ctx.createLinearGradient(
    x - size * 0.11,
    gorgetY - size * 0.05,
    x + size * 0.11,
    gorgetY + size * 0.005
  );
  collarPlateGrad.addColorStop(0, "#566273");
  collarPlateGrad.addColorStop(0.5, "#8a97aa");
  collarPlateGrad.addColorStop(1, "#4e596a");
  ctx.fillStyle = collarPlateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.115, gorgetY - size * 0.002);
  ctx.quadraticCurveTo(
    x,
    gorgetY - size * 0.043,
    x + size * 0.115,
    gorgetY - size * 0.002
  );
  ctx.quadraticCurveTo(
    x,
    gorgetY - size * 0.016,
    x - size * 0.115,
    gorgetY - size * 0.002
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(214, 172, 69, 0.52)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Central throat lame / bevor
  const bevorGrad = ctx.createLinearGradient(
    x - size * 0.024,
    gorgetY - size * 0.06,
    x + size * 0.024,
    gorgetY + size * 0.045
  );
  bevorGrad.addColorStop(0, "#95a2b5");
  bevorGrad.addColorStop(0.45, "#6f7b8d");
  bevorGrad.addColorStop(1, "#46505f");
  ctx.fillStyle = bevorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.022, gorgetY - size * 0.055);
  ctx.lineTo(x + size * 0.022, gorgetY - size * 0.055);
  ctx.lineTo(x + size * 0.028, gorgetY + size * 0.03);
  ctx.quadraticCurveTo(
    x,
    gorgetY + size * 0.05,
    x - size * 0.028,
    gorgetY + size * 0.03
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.6)`;
  ctx.lineWidth = 0.65 * zoom;
  ctx.stroke();

  ctx.strokeStyle = "rgba(238, 244, 255, 0.22)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, gorgetY - size * 0.01);
  ctx.quadraticCurveTo(
    x,
    gorgetY - size * 0.032,
    x + size * 0.08,
    gorgetY - size * 0.01
  );
  ctx.moveTo(x, gorgetY - size * 0.045);
  ctx.lineTo(x, gorgetY + size * 0.03);
  ctx.stroke();

  // Specular highlights — bright spots mimicking curved steel
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    cuirassTop + size * 0.12,
    size * 0.04,
    size * 0.09,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    cuirassTop + size * 0.14,
    size * 0.03,
    size * 0.07,
    0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // Rivet lines along plate joins
  ctx.fillStyle = brassLight;
  for (const side of [-1, 1] as const) {
    for (let rv = 0; rv < 3; rv++) {
      const rvY = cuirassTop + size * 0.06 + rv * size * 0.1;
      ctx.beginPath();
      ctx.arc(
        x + side * size * 0.2,
        rvY + riderBob * (0.5 + rv * 0.1),
        size * 0.005,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Gold cuirass border trim
  ctx.strokeStyle = `rgba(179, 135, 63, 0.55)`;
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, cuirassBot);
  ctx.lineTo(x - size * 0.25, cuirassTop + size * 0.02);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.62 + riderBob * 0.45,
    x + size * 0.25,
    cuirassTop + size * 0.02
  );
  ctx.lineTo(x + size * 0.22, cuirassBot);
  ctx.stroke();

  // Arms connecting to weapons (lance + shield)
  const cavRShoulderX = x + size * 0.2;
  const cavRShoulderY = y - size * 0.28 + riderBob * 0.55;
  const cavLShoulderX = x - size * 0.2;
  const cavLShoulderY = y - size * 0.28 + riderBob * 0.55;

  // Anchor lance to hand — arm swing drives hand position
  const cavArmLen = size * 0.19;
  const cavLanceGripLocalY = size * -0.25;
  const cavArmSwing = isAttacking
    ? -0.5 + (1 - attackPhase) * 0.4
    : -0.25 + gallop * 0.01;
  const cavLanceBaseAngle = isAttacking ? -0.35 - lanceThrust * 0.35 : -0.35;
  const cavLanceAnchor = anchorWeaponToHand(
    cavRShoulderX,
    cavRShoulderY,
    cavArmLen,
    cavArmSwing,
    cavLanceGripLocalY,
    cavLanceBaseAngle,
    targetPos,
    Math.PI / 2,
    isAttacking ? 1.05 : 0.58,
    WEAPON_LIMITS.lance
  );

  const cavArmColors: ArmColors = {
    elbow: "#7a8698",
    hand: "#6a7688",
    trim: "rgba(179, 135, 63, 0.65)",
    upper: "#5a6576",
    upperDark: "#4b5564",
    upperLight: "#6a7a8e",
    vambrace: "#8693a8",
    vambraceLight: "#9aa7be",
  };

  // Right arm → lance (anchored to hand)
  ctx.save();
  ctx.translate(cavRShoulderX, cavRShoulderY);
  ctx.rotate(cavArmSwing);
  drawDetailedArm(ctx, size, cavArmLen, zoom, cavArmColors);
  ctx.restore();

  // Left arm → shield — articulated vambrace
  const cavShieldX = x - size * 0.26;
  const cavShieldY = y - size * 0.18 + gallop * 0.12;
  const cavArmToShieldAngle = Math.atan2(
    cavShieldY - cavLShoulderY,
    cavShieldX - cavLShoulderX
  );

  ctx.save();
  ctx.translate(cavLShoulderX, cavLShoulderY);
  ctx.rotate(cavArmToShieldAngle);
  drawDetailedArm(ctx, size, size * 0.17, zoom, cavArmColors);
  ctx.restore();

  // === ROYAL TABARD (heraldic surcoat over cuirass) ===
  const tabTopY = y - size * 0.4 + gallop * 0.1;
  const tabBotY = y - size * 0.06 + gallop * 0.15;
  const tabWave = Math.sin(time * 4.5) * size * 0.003;

  // Shadow layer
  ctx.fillStyle = "rgba(10, 5, 20, 0.35)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.118 + tabWave, tabBotY + size * 0.005);
  ctx.lineTo(x - size * 0.138, tabTopY + size * 0.005);
  ctx.lineTo(x + size * 0.138, tabTopY + size * 0.005);
  ctx.lineTo(x + size * 0.118 + tabWave, tabBotY + size * 0.005);
  ctx.closePath();
  ctx.fill();

  // Main tabard body — rich gradient
  const tabardGrad = ctx.createLinearGradient(
    x - size * 0.13,
    tabTopY,
    x + size * 0.13,
    tabBotY
  );
  tabardGrad.addColorStop(0, "#1a0e2a");
  tabardGrad.addColorStop(0.2, royalPurpleDark);
  tabardGrad.addColorStop(0.5, royalPurpleMid);
  tabardGrad.addColorStop(0.8, royalPurpleDark);
  tabardGrad.addColorStop(1, "#2a164f");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.112 + tabWave, tabBotY);
  ctx.lineTo(x - size * 0.135, tabTopY);
  ctx.lineTo(x + size * 0.135, tabTopY);
  ctx.lineTo(x + size * 0.112 + tabWave, tabBotY);
  ctx.closePath();
  ctx.fill();

  // Vertical centerline (gold thread)
  ctx.strokeStyle = `rgba(214, 172, 69, 0.45)`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, tabTopY + size * 0.02);
  ctx.lineTo(x + tabWave * 0.5, tabBotY - size * 0.02);
  ctx.stroke();

  // Horizontal cross-bar — heraldic cross motif
  const crossY = tabTopY + (tabBotY - tabTopY) * 0.38;
  ctx.strokeStyle = `rgba(214, 172, 69, 0.4)`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, crossY);
  ctx.lineTo(x + size * 0.09, crossY);
  ctx.stroke();

  // Gold border trim (double line)
  ctx.strokeStyle = `rgba(179, 135, 63, 0.75)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.105 + tabWave, tabBotY);
  ctx.lineTo(x - size * 0.128, tabTopY);
  ctx.lineTo(x + size * 0.128, tabTopY);
  ctx.lineTo(x + size * 0.105 + tabWave, tabBotY);
  ctx.closePath();
  ctx.stroke();
  // Inner trim
  ctx.strokeStyle = `rgba(224, 190, 122, 0.35)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.098 + tabWave, tabBotY - size * 0.01);
  ctx.lineTo(x - size * 0.12, tabTopY + size * 0.01);
  ctx.lineTo(x + size * 0.12, tabTopY + size * 0.01);
  ctx.lineTo(x + size * 0.098 + tabWave, tabBotY - size * 0.01);
  ctx.closePath();
  ctx.stroke();

  // Embroidered Princeton mark — gold shadow + dark letter
  const markY = tabTopY + (tabBotY - tabTopY) * 0.52;
  ctx.font = `bold ${size * 0.13}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = `rgba(214, 172, 69, 0.5)`;
  ctx.fillText("P", x - size * 0.002, markY - size * 0.004);
  ctx.fillStyle = "#0a0510";
  ctx.fillText("P", x + size * 0.002, markY);

  // Corner ornaments
  ctx.fillStyle = brassLight;
  for (const sx of [-1, 1] as const) {
    ctx.beginPath();
    ctx.arc(
      x + sx * size * 0.115,
      tabTopY + size * 0.02,
      size * 0.006,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      x + sx * size * 0.1 + tabWave,
      tabBotY - size * 0.02,
      size * 0.006,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Repaint the collar stack after the tabard so it stays visible,
  // but still remains underneath the later pauldrons.
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, gorgetY);
  ctx.quadraticCurveTo(x, gorgetY - size * 0.06, x + size * 0.15, gorgetY);
  ctx.quadraticCurveTo(x, gorgetY - size * 0.02, x - size * 0.15, gorgetY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  ctx.fillStyle = collarPlateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.115, gorgetY - size * 0.002);
  ctx.quadraticCurveTo(
    x,
    gorgetY - size * 0.043,
    x + size * 0.115,
    gorgetY - size * 0.002
  );
  ctx.quadraticCurveTo(
    x,
    gorgetY - size * 0.016,
    x - size * 0.115,
    gorgetY - size * 0.002
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(214, 172, 69, 0.52)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  ctx.fillStyle = bevorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.022, gorgetY - size * 0.055);
  ctx.lineTo(x + size * 0.022, gorgetY - size * 0.055);
  ctx.lineTo(x + size * 0.028, gorgetY + size * 0.03);
  ctx.quadraticCurveTo(
    x,
    gorgetY + size * 0.05,
    x - size * 0.028,
    gorgetY + size * 0.03
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.6)`;
  ctx.lineWidth = 0.65 * zoom;
  ctx.stroke();

  ctx.strokeStyle = "rgba(238, 244, 255, 0.22)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, gorgetY - size * 0.01);
  ctx.quadraticCurveTo(
    x,
    gorgetY - size * 0.032,
    x + size * 0.08,
    gorgetY - size * 0.01
  );
  ctx.moveTo(x, gorgetY - size * 0.045);
  ctx.lineTo(x, gorgetY + size * 0.03);
  ctx.stroke();

  // Waist transition between rider torso and mounted lower body.
  const cavJoinY = tabBotY - size * 0.008;
  const cavJoinBottomY = y + size * 0.055 + riderBob * 0.9;
  const cavJoinShadowGrad = ctx.createLinearGradient(
    x,
    cavJoinY - size * 0.01,
    x,
    cavJoinBottomY + size * 0.03
  );
  cavJoinShadowGrad.addColorStop(0, "rgba(15, 10, 28, 0.34)");
  cavJoinShadowGrad.addColorStop(0.5, "rgba(36, 22, 58, 0.2)");
  cavJoinShadowGrad.addColorStop(1, "rgba(15, 10, 28, 0)");
  ctx.fillStyle = cavJoinShadowGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15 + tabWave * 0.6, cavJoinY);
  ctx.quadraticCurveTo(
    x - size * 0.22,
    y - size * 0.005 + riderBob * 0.8,
    x - size * 0.135,
    cavJoinBottomY
  );
  ctx.quadraticCurveTo(
    x,
    cavJoinBottomY + size * 0.03,
    x + size * 0.135,
    cavJoinBottomY
  );
  ctx.quadraticCurveTo(
    x + size * 0.22,
    y - size * 0.005 + riderBob * 0.8,
    x + size * 0.15 + tabWave * 0.6,
    cavJoinY
  );
  ctx.closePath();
  ctx.fill();

  const cavWaistPlateGrad = ctx.createLinearGradient(
    x - size * 0.09,
    cavJoinY,
    x + size * 0.09,
    cavJoinBottomY
  );
  cavWaistPlateGrad.addColorStop(0, "#655573");
  cavWaistPlateGrad.addColorStop(0.35, royalPurpleMid);
  cavWaistPlateGrad.addColorStop(0.7, royalPurpleDark);
  cavWaistPlateGrad.addColorStop(1, "#22123f");
  ctx.fillStyle = cavWaistPlateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.085 + tabWave * 0.5, cavJoinY);
  ctx.quadraticCurveTo(
    x,
    cavJoinY - size * 0.02,
    x + size * 0.085 + tabWave * 0.5,
    cavJoinY
  );
  ctx.lineTo(x + size * 0.062, cavJoinBottomY);
  ctx.quadraticCurveTo(
    x,
    cavJoinBottomY + size * 0.022,
    x - size * 0.062,
    cavJoinBottomY
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.62)`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  ctx.strokeStyle = `rgba(224, 190, 122, 0.3)`;
  ctx.lineWidth = 0.55 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.065, cavJoinY + size * 0.004);
  ctx.quadraticCurveTo(
    x,
    cavJoinY - size * 0.008,
    x + size * 0.065,
    cavJoinY + size * 0.004
  );
  ctx.moveTo(x, cavJoinY + size * 0.012);
  ctx.lineTo(x, cavJoinBottomY + size * 0.004);
  ctx.stroke();

  ctx.fillStyle = brassLight;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.045,
      cavJoinY + size * 0.018,
      size * 0.006,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // === ARMORED FAULD (layered waist skirt) ===
  const fauldTopY = y - size * 0.09 + riderBob;
  const fauldLen = size * 0.16;
  const fauldSway = Math.sin(time * 4.2) * size * 0.005;

  for (let lame = 0; lame < 5; lame++) {
    const t = lame / 4;
    const lameY = fauldTopY + t * fauldLen;
    const lameH = size * 0.038;
    const halfW = size * (0.2 + t * 0.06);
    const sway = fauldSway * (1 + t) + gallop * t * 0.04;

    const lameGrad = ctx.createLinearGradient(
      x - halfW,
      lameY,
      x + halfW,
      lameY + lameH
    );
    lameGrad.addColorStop(0, "#1a0e2a");
    lameGrad.addColorStop(0.2, royalPurpleDark);
    lameGrad.addColorStop(0.5, royalPurpleMid);
    lameGrad.addColorStop(0.8, royalPurpleDark);
    lameGrad.addColorStop(1, "#1a0e2a");
    ctx.fillStyle = lameGrad;
    ctx.beginPath();
    ctx.moveTo(x - halfW + sway, lameY);
    ctx.quadraticCurveTo(
      x + sway * 0.5,
      lameY + lameH * 0.4,
      x + halfW + sway,
      lameY
    );
    ctx.lineTo(x + halfW + sway * 1.2, lameY + lameH);
    ctx.quadraticCurveTo(
      x + sway * 0.6,
      lameY + lameH * 1.3,
      x - halfW + sway * 1.2,
      lameY + lameH
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(179, 135, 63, ${0.35 + (1 - t) * 0.35})`;
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - halfW * 0.92 + sway, lameY + lameH * 0.5);
    ctx.quadraticCurveTo(
      x + sway * 0.5,
      lameY + lameH * 0.1,
      x + halfW * 0.92 + sway,
      lameY + lameH * 0.5
    );
    ctx.stroke();

    // Rivet at each end
    ctx.fillStyle = brassMid;
    for (const side of [-1, 1] as const) {
      ctx.beginPath();
      ctx.arc(
        x + side * halfW * 0.85 + sway,
        lameY + lameH * 0.5,
        size * 0.006,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Tasset extensions — longer armored panels on each side
  for (const side of [-1, 1] as const) {
    const tassetX = x + side * size * 0.16;
    const tassetTopY = fauldTopY + fauldLen * 0.5;
    const tassetH = size * 0.12;
    const tassetW = size * 0.09;
    const tSway = fauldSway * 1.5 + gallop * 0.03;

    const tassetGrad = ctx.createLinearGradient(
      tassetX - tassetW * 0.5,
      tassetTopY,
      tassetX + tassetW * 0.5,
      tassetTopY + tassetH
    );
    tassetGrad.addColorStop(0, royalPurpleDark);
    tassetGrad.addColorStop(0.4, royalPurpleMid);
    tassetGrad.addColorStop(1, "#1a0e2a");
    ctx.fillStyle = tassetGrad;
    ctx.beginPath();
    ctx.moveTo(tassetX - tassetW * 0.5 + tSway, tassetTopY);
    ctx.lineTo(tassetX + tassetW * 0.5 + tSway, tassetTopY);
    ctx.lineTo(tassetX + tassetW * 0.4 + tSway * 1.2, tassetTopY + tassetH);
    ctx.quadraticCurveTo(
      tassetX + tSway * 1.1,
      tassetTopY + tassetH + size * 0.015,
      tassetX - tassetW * 0.4 + tSway * 1.2,
      tassetTopY + tassetH
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(179, 135, 63, 0.55)`;
    ctx.lineWidth = 0.85 * zoom;
    ctx.beginPath();
    ctx.moveTo(tassetX - tassetW * 0.42 + tSway, tassetTopY + size * 0.01);
    ctx.lineTo(
      tassetX - tassetW * 0.34 + tSway * 1.1,
      tassetTopY + tassetH - size * 0.01
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tassetX + tassetW * 0.42 + tSway, tassetTopY + size * 0.01);
    ctx.lineTo(
      tassetX + tassetW * 0.34 + tSway * 1.1,
      tassetTopY + tassetH - size * 0.01
    );
    ctx.stroke();
  }

  // === VISIBLE NEAR-SIDE RIDING LEG ===
  const legBob = gallop * 0.06;
  const legX = x + size * 0.1;
  const hipY = fauldTopY + fauldLen * 0.55;

  // Cuisse (armored thigh) — angled forward in riding position
  const kneeX = legX + size * 0.03;
  const kneeY = hipY + size * 0.14 + legBob;

  const cuisseGrad = ctx.createLinearGradient(legX, hipY, kneeX, kneeY);
  cuisseGrad.addColorStop(0, "#596372");
  cuisseGrad.addColorStop(0.4, "#7a8698");
  cuisseGrad.addColorStop(1, "#4b5564");
  ctx.fillStyle = cuisseGrad;
  ctx.beginPath();
  ctx.moveTo(legX - size * 0.04, hipY);
  ctx.lineTo(legX + size * 0.04, hipY);
  ctx.lineTo(kneeX + size * 0.035, kneeY - size * 0.01);
  ctx.lineTo(kneeX - size * 0.035, kneeY - size * 0.01);
  ctx.closePath();
  ctx.fill();

  // Cuisse highlight
  ctx.strokeStyle = "rgba(200, 214, 232, 0.25)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(legX - size * 0.01, hipY + size * 0.01);
  ctx.lineTo(kneeX - size * 0.005, kneeY - size * 0.025);
  ctx.stroke();

  // Cuisse rivet line
  ctx.fillStyle = brassMid;
  for (let rv = 0; rv < 2; rv++) {
    const rvT = (rv + 1) / 3;
    const rvX = legX + (kneeX - legX) * rvT + size * 0.03;
    const rvY = hipY + (kneeY - hipY) * rvT;
    ctx.beginPath();
    ctx.arc(rvX, rvY, size * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }

  // Poleyn (knee guard) — rounded plate
  const poleynGrad = ctx.createRadialGradient(
    kneeX - size * 0.008,
    kneeY - size * 0.01,
    0,
    kneeX,
    kneeY,
    size * 0.045
  );
  poleynGrad.addColorStop(0, "#8a96a8");
  poleynGrad.addColorStop(0.5, "#6a7688");
  poleynGrad.addColorStop(1, "#4a5664");
  ctx.fillStyle = poleynGrad;
  ctx.beginPath();
  ctx.ellipse(kneeX, kneeY, size * 0.04, size * 0.035, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.6)`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(kneeX, kneeY, size * 0.032, 0.4, Math.PI * 2 - 0.4);
  ctx.stroke();

  // Wing fin on poleyn
  ctx.fillStyle = "#5a6576";
  ctx.beginPath();
  ctx.moveTo(kneeX + size * 0.035, kneeY - size * 0.015);
  ctx.quadraticCurveTo(
    kneeX + size * 0.06,
    kneeY - size * 0.03,
    kneeX + size * 0.05,
    kneeY + size * 0.01
  );
  ctx.lineTo(kneeX + size * 0.035, kneeY + size * 0.01);
  ctx.closePath();
  ctx.fill();

  // Greave (lower leg) — hangs slightly back under the horse
  const footX = kneeX - size * 0.02;
  const footY = kneeY + size * 0.13 + legBob * 0.5;

  const greaveGrad = ctx.createLinearGradient(kneeX, kneeY, footX, footY);
  greaveGrad.addColorStop(0, "#5a6576");
  greaveGrad.addColorStop(0.4, "#7a8698");
  greaveGrad.addColorStop(1, "#4a5664");
  ctx.fillStyle = greaveGrad;
  ctx.beginPath();
  ctx.moveTo(kneeX - size * 0.03, kneeY + size * 0.02);
  ctx.lineTo(kneeX + size * 0.025, kneeY + size * 0.02);
  ctx.lineTo(footX + size * 0.022, footY);
  ctx.lineTo(footX - size * 0.025, footY);
  ctx.closePath();
  ctx.fill();

  // Greave calf ridge
  ctx.strokeStyle = "rgba(200, 214, 232, 0.22)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(kneeX + size * 0.01, kneeY + size * 0.03);
  ctx.lineTo(footX + size * 0.008, footY - size * 0.01);
  ctx.stroke();

  // Sabaton (foot) — pointed toe in stirrup
  const sabatonGrad = ctx.createLinearGradient(
    footX - size * 0.03,
    footY,
    footX + size * 0.04,
    footY + size * 0.025
  );
  sabatonGrad.addColorStop(0, "#4a5664");
  sabatonGrad.addColorStop(0.5, "#6a7688");
  sabatonGrad.addColorStop(1, "#3e4552");
  ctx.fillStyle = sabatonGrad;
  ctx.beginPath();
  ctx.moveTo(footX - size * 0.028, footY);
  ctx.lineTo(footX + size * 0.025, footY);
  ctx.quadraticCurveTo(
    footX + size * 0.055,
    footY + size * 0.01,
    footX + size * 0.06,
    footY + size * 0.025
  );
  ctx.lineTo(footX - size * 0.018, footY + size * 0.028);
  ctx.closePath();
  ctx.fill();

  // Stirrup (metal loop under the foot)
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 1.3 * zoom;
  ctx.beginPath();
  ctx.moveTo(footX - size * 0.01, footY - size * 0.005);
  ctx.quadraticCurveTo(
    footX + size * 0.01,
    footY + size * 0.045,
    footX + size * 0.035,
    footY + size * 0.005
  );
  ctx.stroke();

  // Stirrup leather strap up to saddle
  ctx.strokeStyle = "#3a2510";
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(footX + size * 0.01, footY - size * 0.005);
  ctx.lineTo(legX + size * 0.03, hipY - size * 0.02);
  ctx.stroke();

  // === ROYAL PAULDRONS (multi-plate shoulder armor) ===
  for (const side of [-1, 1] as const) {
    const sx = x + side * size * 0.225;
    const sy = y - size * 0.404 + gallop * 0.1 + breathe;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(side * 0.18);

    // Top cop (uppermost plate with raised flange)
    const copGrad = ctx.createRadialGradient(
      -side * size * 0.02,
      -size * 0.01,
      0,
      0,
      0,
      size * 0.12
    );
    copGrad.addColorStop(0, "#8a96a8");
    copGrad.addColorStop(0.35, "#708095");
    copGrad.addColorStop(0.7, "#4b5564");
    copGrad.addColorStop(1, "#3b4351");
    ctx.fillStyle = copGrad;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.005, size * 0.12, size * 0.065, 0, 0, Math.PI * 2);
    ctx.fill();

    // Raised flange ridge along top
    ctx.strokeStyle = "rgba(180, 195, 215, 0.45)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      0,
      -size * 0.008,
      size * 0.095,
      size * 0.035,
      0,
      Math.PI * 0.95,
      Math.PI * 2.05
    );
    ctx.stroke();

    // Middle lame (second overlapping plate)
    const midLameGrad = ctx.createLinearGradient(
      -size * 0.1,
      size * 0.02,
      size * 0.1,
      size * 0.055
    );
    midLameGrad.addColorStop(0, "#465264");
    midLameGrad.addColorStop(0.45, "#6a7a8e");
    midLameGrad.addColorStop(1, "#4b5564");
    ctx.fillStyle = midLameGrad;
    ctx.beginPath();
    ctx.ellipse(
      -side * size * 0.008,
      size * 0.032,
      size * 0.098,
      size * 0.04,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Lower lame
    const lowLameGrad = ctx.createLinearGradient(
      -size * 0.08,
      size * 0.04,
      size * 0.08,
      size * 0.075
    );
    lowLameGrad.addColorStop(0, "#3e4552");
    lowLameGrad.addColorStop(0.5, "#5a6576");
    lowLameGrad.addColorStop(1, "#3e4552");
    ctx.fillStyle = lowLameGrad;
    ctx.beginPath();
    ctx.ellipse(
      -side * size * 0.015,
      size * 0.055,
      size * 0.075,
      size * 0.035,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Plate-overlap dark lines between lames
    ctx.strokeStyle = "rgba(30, 38, 50, 0.6)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      -side * size * 0.005,
      size * 0.015,
      size * 0.1,
      size * 0.025,
      0,
      0.1,
      Math.PI - 0.1
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(
      -side * size * 0.01,
      size * 0.04,
      size * 0.088,
      size * 0.022,
      0,
      0.1,
      Math.PI - 0.1
    );
    ctx.stroke();

    // Gold outer rim
    ctx.strokeStyle = `rgba(179, 135, 63, 0.7)`;
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      0,
      -size * 0.005,
      size * 0.118,
      size * 0.063,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Gold trim on lower lame
    ctx.strokeStyle = `rgba(179, 135, 63, 0.5)`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      -side * size * 0.015,
      size * 0.055,
      size * 0.073,
      size * 0.033,
      0,
      0.2,
      Math.PI - 0.2
    );
    ctx.stroke();

    // Decorative boss — central raised ornament
    const bossGrad = ctx.createRadialGradient(
      -side * size * 0.01,
      size * 0.01,
      0,
      0,
      size * 0.01,
      size * 0.025
    );
    bossGrad.addColorStop(0, "#c4a84f");
    bossGrad.addColorStop(0.5, "#9a7a2e");
    bossGrad.addColorStop(1, "rgba(100, 80, 30, 0.3)");
    ctx.fillStyle = bossGrad;
    ctx.beginPath();
    ctx.arc(0, size * 0.008, size * 0.016, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight on top cop
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(
      -side * size * 0.04,
      -size * 0.015,
      size * 0.025,
      size * 0.04,
      -0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Rivets along lame edges
    ctx.fillStyle = brassLight;
    for (let riv = 0; riv < 4; riv++) {
      const rAngle = (riv / 3) * Math.PI * 0.5 + Math.PI * 0.25;
      const rvx = Math.cos(rAngle) * size * 0.095;
      const rvy = Math.sin(rAngle) * size * 0.05 + size * 0.01;
      ctx.beginPath();
      ctx.arc(rvx, rvy, size * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }
    // Inner rivets
    for (let riv = 0; riv < 3; riv++) {
      const rAngle = (riv / 2) * Math.PI * 0.4 + Math.PI * 0.3;
      const rvx = Math.cos(rAngle) * size * 0.065;
      const rvy = Math.sin(rAngle) * size * 0.035 + size * 0.04;
      ctx.beginPath();
      ctx.arc(rvx, rvy, size * 0.005, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // === ROYAL ARMET HELMET (faceted plates with ornamental detail) ===
  const helmY = y - size * 0.6 + gallop * 0.08 + breathe * 0.2;

  // === COIF & AVENTAIL (chainmail behind helmet) ===
  const aventailSway = Math.sin(time * 4.2 + 0.3) * size * 0.008;
  const aventailBaseY = helmY + size * 0.06;
  const aventailBottomY = helmY + size * 0.28;

  // Coif — chainmail hood shape behind and around helmet
  const coifGrad = ctx.createRadialGradient(
    x,
    helmY - size * 0.04,
    size * 0.06,
    x,
    helmY + size * 0.04,
    size * 0.24
  );
  coifGrad.addColorStop(0, "#5a5e68");
  coifGrad.addColorStop(0.4, "#484c56");
  coifGrad.addColorStop(0.8, "#3a3e48");
  coifGrad.addColorStop(1, "#2e3238");
  ctx.fillStyle = coifGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, helmY - size * 0.06);
  ctx.quadraticCurveTo(
    x,
    helmY - size * 0.28,
    x + size * 0.16,
    helmY - size * 0.06
  );
  ctx.lineTo(x + size * 0.17, aventailBaseY);
  ctx.lineTo(x - size * 0.17, aventailBaseY);
  ctx.closePath();
  ctx.fill();

  // Coif chainmail ring texture
  ctx.strokeStyle = "rgba(120, 125, 140, 0.35)";
  ctx.lineWidth = 0.5 * zoom;
  for (let row = 0; row < 4; row++) {
    const ringY = helmY - size * 0.18 + row * size * 0.06;
    const rowWidth = size * (0.08 + row * 0.025);
    const offset = row % 2 === 0 ? 0 : size * 0.015;
    for (let col = -3; col <= 3; col++) {
      const ringX = x + col * size * 0.03 + offset;
      if (Math.abs(ringX - x) <= rowWidth) {
        ctx.beginPath();
        ctx.arc(ringX, ringY, size * 0.012, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // Aventail — chainmail curtain hanging from helmet base
  const aventailGrad = ctx.createLinearGradient(
    x - size * 0.18,
    aventailBaseY,
    x + size * 0.18,
    aventailBottomY
  );
  aventailGrad.addColorStop(0, "#4a4e58");
  aventailGrad.addColorStop(0.3, "#3e4250");
  aventailGrad.addColorStop(0.7, "#353944");
  aventailGrad.addColorStop(1, "#2c3038");
  ctx.fillStyle = aventailGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, aventailBaseY);
  ctx.lineTo(x + size * 0.16, aventailBaseY);
  ctx.quadraticCurveTo(
    x + size * 0.18 + aventailSway,
    aventailBottomY - size * 0.04,
    x + size * 0.14 + aventailSway,
    aventailBottomY
  );
  ctx.quadraticCurveTo(
    x + aventailSway * 0.5,
    aventailBottomY + size * 0.02,
    x - size * 0.14 + aventailSway,
    aventailBottomY
  );
  ctx.quadraticCurveTo(
    x - size * 0.18 + aventailSway,
    aventailBottomY - size * 0.04,
    x - size * 0.16,
    aventailBaseY
  );
  ctx.closePath();
  ctx.fill();

  // Aventail chainmail ring rows
  ctx.strokeStyle = "rgba(105, 112, 128, 0.32)";
  ctx.lineWidth = 0.45 * zoom;
  for (let row = 0; row < 5; row++) {
    const ringY = aventailBaseY + row * size * 0.04 + size * 0.02;
    const rowHalfW = size * (0.14 - row * 0.005);
    const offset = row % 2 === 0 ? 0 : size * 0.014;
    const sway = aventailSway * (row / 4);
    for (let col = -5; col <= 5; col++) {
      const ringX = x + col * size * 0.028 + offset + sway;
      if (Math.abs(ringX - x - sway) <= rowHalfW) {
        ctx.beginPath();
        ctx.arc(ringX, ringY, size * 0.011, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // Aventail top mounting strip (leather vervelles)
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.155,
    aventailBaseY - size * 0.012,
    size * 0.31,
    size * 0.024,
    size * 0.006
  );
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.55)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Brass vervelles (mounting studs)
  ctx.fillStyle = brassMid;
  for (let v = 0; v < 7; v++) {
    const vx = x - size * 0.13 + v * size * 0.043;
    ctx.beginPath();
    ctx.arc(vx, aventailBaseY, size * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }

  // Skull dome — radial gradient for 3D sphere
  const helmGrad = ctx.createRadialGradient(
    x - size * 0.03,
    helmY - size * 0.1,
    0,
    x,
    helmY - size * 0.05,
    size * 0.22
  );
  helmGrad.addColorStop(0, "#8a96a8");
  helmGrad.addColorStop(0.3, "#7f8ea2");
  helmGrad.addColorStop(0.6, "#5a6576");
  helmGrad.addColorStop(1, "#3b4351");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.136, helmY - size * 0.02);
  ctx.lineTo(x - size * 0.124, helmY - size * 0.14);
  ctx.lineTo(x - size * 0.07, helmY - size * 0.22);
  ctx.lineTo(x, helmY - size * 0.245);
  ctx.lineTo(x + size * 0.07, helmY - size * 0.22);
  ctx.lineTo(x + size * 0.124, helmY - size * 0.14);
  ctx.lineTo(x + size * 0.136, helmY - size * 0.02);
  ctx.lineTo(x + size * 0.11, helmY + size * 0.082);
  ctx.lineTo(x - size * 0.11, helmY + size * 0.082);
  ctx.closePath();
  ctx.fill();

  // Faceted panel lines — makes helmet look like hammered plates
  ctx.strokeStyle = "rgba(40, 48, 60, 0.55)";
  ctx.lineWidth = 0.7 * zoom;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.02, helmY - size * 0.24);
    ctx.lineTo(x + side * size * 0.05, helmY - size * 0.1);
    ctx.lineTo(x + side * size * 0.08, helmY + size * 0.04);
    ctx.stroke();
  }

  // Specular highlight on dome
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.04,
    helmY - size * 0.15,
    size * 0.025,
    size * 0.065,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // Bevor (chin guard) and cheek plates — articulated
  for (const side of [-1, 1] as const) {
    const cheekGrad = ctx.createLinearGradient(
      x + side * size * 0.04,
      helmY,
      x + side * size * 0.14,
      helmY + size * 0.1
    );
    cheekGrad.addColorStop(0, "#4a5664");
    cheekGrad.addColorStop(0.5, "#5a6678");
    cheekGrad.addColorStop(1, "#3d4755");
    ctx.fillStyle = cheekGrad;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.106, helmY + size * 0.01);
    ctx.lineTo(x + side * size * 0.14, helmY + size * 0.08);
    ctx.lineTo(x + side * size * 0.086, helmY + size * 0.1);
    ctx.lineTo(x + side * size * 0.048, helmY + size * 0.03);
    ctx.closePath();
    ctx.fill();
    // Cheek plate rivet
    ctx.fillStyle = brassMid;
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.09,
      helmY + size * 0.06,
      size * 0.005,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Raised nasal crest (medial ridge)
  const crestGrad = ctx.createLinearGradient(
    x - size * 0.016,
    0,
    x + size * 0.016,
    0
  );
  crestGrad.addColorStop(0, "rgba(80, 92, 108, 0.8)");
  crestGrad.addColorStop(0.5, "rgba(170, 185, 205, 0.65)");
  crestGrad.addColorStop(1, "rgba(80, 92, 108, 0.8)");
  ctx.fillStyle = crestGrad;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.014,
    helmY - size * 0.19,
    size * 0.028,
    size * 0.22,
    size * 0.008
  );
  ctx.fill();

  // Ornamental arch etch on forehead
  ctx.strokeStyle = `rgba(179, 135, 63, 0.65)`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, helmY - size * 0.13);
  ctx.quadraticCurveTo(
    x,
    helmY - size * 0.2,
    x + size * 0.06,
    helmY - size * 0.13
  );
  ctx.stroke();
  // Second inner arch
  ctx.strokeStyle = `rgba(179, 135, 63, 0.4)`;
  ctx.lineWidth = 0.65 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.045, helmY - size * 0.12);
  ctx.quadraticCurveTo(
    x,
    helmY - size * 0.17,
    x + size * 0.045,
    helmY - size * 0.12
  );
  ctx.stroke();

  // Lateral decorative scrollwork
  ctx.strokeStyle = `rgba(179, 135, 63, 0.35)`;
  ctx.lineWidth = 0.5 * zoom;
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.06, helmY - size * 0.1);
    ctx.quadraticCurveTo(
      x + side * size * 0.1,
      helmY - size * 0.08,
      x + side * size * 0.1,
      helmY - size * 0.02
    );
    ctx.stroke();
  }

  // Angular visor slit — darker, narrower look
  const visorGrad = ctx.createLinearGradient(
    x - size * 0.11,
    helmY - size * 0.02,
    x + size * 0.11,
    helmY + size * 0.03
  );
  visorGrad.addColorStop(0, "#1a222f");
  visorGrad.addColorStop(0.5, "#242d3a");
  visorGrad.addColorStop(1, "#1a222f");
  ctx.fillStyle = visorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.108, helmY - size * 0.018);
  ctx.lineTo(x + size * 0.108, helmY - size * 0.018);
  ctx.lineTo(x + size * 0.09, helmY + size * 0.032);
  ctx.lineTo(x - size * 0.09, helmY + size * 0.032);
  ctx.closePath();
  ctx.fill();
  // Visor rim highlight
  ctx.strokeStyle = "rgba(130, 145, 165, 0.5)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.105, helmY - size * 0.016);
  ctx.lineTo(x + size * 0.105, helmY - size * 0.016);
  ctx.stroke();

  // Glowing eyes behind visor
  const eyeGlow = 0.68 + Math.sin(time * 4.2) * 0.22;
  for (const side of [-1, 1] as const) {
    const ex = x + side * size * 0.042;
    const ey = helmY + size * 0.006;
    ctx.fillStyle = `rgba(255, 203, 140, ${0.62 + eyeGlow * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(ex, ey, size * 0.022, size * 0.012, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d88032";
    ctx.beginPath();
    ctx.arc(ex, ey, size * 0.0085, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#140903";
    ctx.beginPath();
    ctx.arc(ex + side * size * 0.001, ey, size * 0.0048, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 244, 219, ${0.6 + shimmer * 0.2})`;
    ctx.beginPath();
    ctx.arc(
      ex - side * size * 0.003,
      ey - size * 0.003,
      size * 0.0028,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Breathing vents — more detailed with slits
  ctx.fillStyle = "#1a222f";
  for (let vent = 0; vent < 5; vent++) {
    const vx = x - size * 0.078 + vent * size * 0.039;
    ctx.beginPath();
    ctx.ellipse(
      vx,
      helmY + size * 0.054,
      size * 0.007,
      size * 0.004,
      0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Gold helm edge trim — full perimeter
  ctx.strokeStyle = `rgba(179, 135, 63, 0.72)`;
  ctx.lineWidth = 1.15 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.114, helmY - size * 0.002);
  ctx.lineTo(x - size * 0.102, helmY - size * 0.12);
  ctx.lineTo(x - size * 0.065, helmY - size * 0.2);
  ctx.lineTo(x, helmY - size * 0.23);
  ctx.lineTo(x + size * 0.065, helmY - size * 0.2);
  ctx.lineTo(x + size * 0.102, helmY - size * 0.12);
  ctx.lineTo(x + size * 0.114, helmY - size * 0.002);
  ctx.stroke();

  // Bottom rim of helmet
  ctx.strokeStyle = `rgba(179, 135, 63, 0.5)`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11, helmY + size * 0.08);
  ctx.lineTo(x + size * 0.11, helmY + size * 0.08);
  ctx.stroke();

  // Crown jewel — pulsing gem at apex
  ctx.fillStyle = royalPurpleLight;
  ctx.shadowColor = royalPurpleLight;
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, helmY - size * 0.245, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  // Gem facet highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.arc(x - size * 0.005, helmY - size * 0.25, size * 0.006, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === ROYAL HORSEHAIR PLUME (tall flowing crest) ===
  const plumeWind = Math.sin(time * 4.2) * 1.8 + gallop * 0.3;
  const plumeWhip = Math.sin(time * 5.5 + 0.6) * 1;
  const plumeGusts = Math.sin(time * 3.3) * 0.5;
  const plumeBaseY = helmY - size * 0.19;
  const plumePeakH = size * 0.38;
  const plumeSpread = size * 0.2;

  // Rear drape (hair cascading behind helmet)
  ctx.fillStyle = "rgba(25, 12, 40, 0.5)";
  ctx.beginPath();
  ctx.moveTo(x + plumeSpread * 0.35, plumeBaseY);
  ctx.quadraticCurveTo(
    x + plumeSpread * 0.55 + plumeWind * 0.5,
    plumeBaseY + size * 0.03,
    x + plumeSpread * 0.45 + plumeWind * 1 + plumeGusts,
    plumeBaseY + size * 0.18
  );
  ctx.quadraticCurveTo(
    x + plumeSpread * 0.15 + plumeWind * 0.3,
    plumeBaseY + size * 0.1,
    x - plumeSpread * 0.1,
    plumeBaseY + size * 0.02
  );
  ctx.closePath();
  ctx.fill();

  // Shadow body
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.moveTo(x - plumeSpread * 0.4, plumeBaseY + size * 0.01);
  ctx.quadraticCurveTo(
    x - plumeSpread * 0.15 + plumeWind * 0.25,
    plumeBaseY - plumePeakH * 0.88,
    x + plumeWind * 0.4 + plumeWhip * 0.3,
    plumeBaseY - plumePeakH + size * 0.01
  );
  ctx.quadraticCurveTo(
    x + plumeSpread * 0.25 + plumeWind * 0.7,
    plumeBaseY - plumePeakH * 0.7,
    x + plumeSpread * 0.5 + plumeWind * 0.9,
    plumeBaseY + size * 0.01
  );
  ctx.closePath();
  ctx.fill();

  // Base layer (deep royal purple)
  const plumeBaseGrad = ctx.createLinearGradient(
    x,
    plumeBaseY,
    x,
    plumeBaseY - plumePeakH
  );
  plumeBaseGrad.addColorStop(0, "#1a0e2a");
  plumeBaseGrad.addColorStop(0.25, "#2a1844");
  plumeBaseGrad.addColorStop(0.5, "#3a2460");
  plumeBaseGrad.addColorStop(0.75, "#4a3078");
  plumeBaseGrad.addColorStop(1, "#5a3c90");
  ctx.fillStyle = plumeBaseGrad;
  ctx.beginPath();
  ctx.moveTo(x - plumeSpread * 0.38, plumeBaseY);
  ctx.quadraticCurveTo(
    x - plumeSpread * 0.14 + plumeWind * 0.28,
    plumeBaseY - plumePeakH * 0.9,
    x + plumeWind * 0.45 + plumeWhip * 0.25,
    plumeBaseY - plumePeakH
  );
  ctx.quadraticCurveTo(
    x + plumeSpread * 0.24 + plumeWind * 0.72,
    plumeBaseY - plumePeakH * 0.72,
    x + plumeSpread * 0.48 + plumeWind * 0.88,
    plumeBaseY
  );
  ctx.closePath();
  ctx.fill();

  // Main body (rich purple with gradient)
  const plumeMainGrad = ctx.createLinearGradient(
    x,
    plumeBaseY,
    x + plumeWind * 0.3,
    plumeBaseY - plumePeakH
  );
  plumeMainGrad.addColorStop(0, royalPurpleDark);
  plumeMainGrad.addColorStop(0.2, royalPurpleMid);
  plumeMainGrad.addColorStop(0.5, royalPurpleLight);
  plumeMainGrad.addColorStop(0.8, "#8a6cc8");
  plumeMainGrad.addColorStop(1, royalPurpleMid);
  ctx.fillStyle = plumeMainGrad;
  ctx.beginPath();
  ctx.moveTo(x - plumeSpread * 0.3, plumeBaseY);
  ctx.quadraticCurveTo(
    x - plumeSpread * 0.08 + plumeWind * 0.32,
    plumeBaseY - plumePeakH * 0.93,
    x + plumeWind * 0.5 + plumeWhip * 0.2,
    plumeBaseY - plumePeakH * 0.96
  );
  ctx.quadraticCurveTo(
    x + plumeSpread * 0.18 + plumeWind * 0.68,
    plumeBaseY - plumePeakH * 0.68,
    x + plumeSpread * 0.4 + plumeWind * 0.82,
    plumeBaseY
  );
  ctx.closePath();
  ctx.fill();

  // Bright highlight layer (inner shimmer)
  const plumeHiGrad = ctx.createLinearGradient(
    x,
    plumeBaseY - plumePeakH * 0.3,
    x,
    plumeBaseY - plumePeakH * 0.95
  );
  plumeHiGrad.addColorStop(0, "rgba(140, 110, 210, 0.0)");
  plumeHiGrad.addColorStop(0.3, "rgba(160, 130, 230, 0.5)");
  plumeHiGrad.addColorStop(0.7, "rgba(180, 160, 240, 0.55)");
  plumeHiGrad.addColorStop(1, "rgba(200, 180, 255, 0.4)");
  ctx.fillStyle = plumeHiGrad;
  ctx.beginPath();
  ctx.moveTo(x - plumeSpread * 0.18, plumeBaseY - plumePeakH * 0.15);
  ctx.quadraticCurveTo(
    x - plumeSpread * 0.04 + plumeWind * 0.35,
    plumeBaseY - plumePeakH * 0.9,
    x + plumeWind * 0.45 + plumeWhip * 0.15,
    plumeBaseY - plumePeakH * 0.88
  );
  ctx.quadraticCurveTo(
    x + plumeSpread * 0.12 + plumeWind * 0.55,
    plumeBaseY - plumePeakH * 0.6,
    x + plumeSpread * 0.25 + plumeWind * 0.6,
    plumeBaseY - plumePeakH * 0.1
  );
  ctx.closePath();
  ctx.fill();

  // Individual horsehair strands for texture
  for (let strand = 0; strand < 7; strand++) {
    const strandT = strand / 6;
    const strandPhase = time * (4.2 + strand * 0.5) + strand * 1.2;
    const strandBend = Math.sin(strandPhase) * (1.5 + strandT * 2.2);
    const strandAlpha = 0.2 + Math.sin(time * 2.8 + strand * 0.8) * 0.1;
    const startX = x - plumeSpread * 0.28 + strandT * plumeSpread * 0.56;
    const startY = plumeBaseY;
    const peakScale = 0.7 + Math.sin(strandT * Math.PI) * 0.3;

    ctx.strokeStyle =
      strand % 2 === 0
        ? `rgba(190, 170, 240, ${strandAlpha})`
        : `rgba(150, 120, 210, ${strandAlpha})`;
    ctx.lineWidth = (0.8 + strandT * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + plumeWind * (0.3 + strandT * 0.5) + strandBend,
      plumeBaseY - plumePeakH * peakScale,
      startX +
        plumeSpread * (0.1 + strandT * 0.2) +
        plumeWind * (0.6 + strandT * 0.4) +
        strandBend * 1.3,
      plumeBaseY - plumePeakH * peakScale * 0.2
    );
    ctx.stroke();
  }

  // Tip wisps at the peak
  for (let wisp = 0; wisp < 4; wisp++) {
    const wispT = wisp / 3;
    const wispPhase = Math.sin(time * 7 + wisp * 1.8);
    const wispAlpha = 0.25 + wispPhase * 0.12;
    const wispX =
      x -
      plumeSpread * 0.04 +
      wispT * plumeSpread * 0.18 +
      plumeWind * (0.35 + wispT * 0.2);
    const wispY = plumeBaseY - plumePeakH * (0.85 + wispT * 0.1);

    ctx.strokeStyle = `rgba(200, 180, 255, ${wispAlpha})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(wispX, wispY);
    ctx.quadraticCurveTo(
      wispX + plumeWind * 0.7 + wispPhase * size * 0.04,
      wispY - size * 0.04,
      wispX + plumeWind * 1.1 + wispPhase * size * 0.06,
      wispY + size * 0.02
    );
    ctx.stroke();
  }

  // Gold crest clamp at base of plume
  const clampGrad = ctx.createLinearGradient(
    x - plumeSpread * 0.3,
    plumeBaseY,
    x + plumeSpread * 0.3,
    plumeBaseY
  );
  clampGrad.addColorStop(0, "#6a5020");
  clampGrad.addColorStop(0.3, "#b09030");
  clampGrad.addColorStop(0.5, "#d4b450");
  clampGrad.addColorStop(0.7, "#b09030");
  clampGrad.addColorStop(1, "#6a5020");
  ctx.fillStyle = clampGrad;
  ctx.beginPath();
  ctx.roundRect(
    x - plumeSpread * 0.3,
    plumeBaseY - size * 0.01,
    plumeSpread * 0.6,
    size * 0.03,
    size * 0.007
  );
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 230, 160, ${0.2 + shimmer * 0.15})`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();
  // Clamp gem
  ctx.fillStyle = `rgba(140, 100, 220, ${0.6 + shimmer * 0.3})`;
  ctx.shadowColor = "rgba(140, 100, 220, 0.4)";
  ctx.shadowBlur = 3 * zoom;
  ctx.beginPath();
  ctx.arc(x, plumeBaseY + size * 0.005, size * 0.008, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === ORNATE ROYAL LANCE (anchored to hand) ===
  ctx.save();
  ctx.translate(cavLanceAnchor.weaponX, cavLanceAnchor.weaponY);
  ctx.rotate(cavLanceAnchor.weaponAngle);
  ctx.scale(1, 0.8);

  // Ornate lance shaft with wood grain gradient
  const lanceGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, 0);
  lanceGrad.addColorStop(0, "#4a2a10");
  lanceGrad.addColorStop(0.2, "#6a4a2a");
  lanceGrad.addColorStop(0.5, "#8a6a4a");
  lanceGrad.addColorStop(0.8, "#6a4a2a");
  lanceGrad.addColorStop(1, "#4a2a10");
  ctx.fillStyle = lanceGrad;
  ctx.fillRect(-size * 0.04, -size * 1.35, size * 0.08, size * 1.5);

  // Spiral leather wrapping (constrained to shaft bounds: y -0.85 to +0.15)
  ctx.strokeStyle = "#3a1a0a";
  ctx.lineWidth = 1.5;
  for (let wrap = 0; wrap < 5; wrap++) {
    const wrapY = -size * 0.12 + wrap * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, wrapY);
    ctx.lineTo(size * 0.04, wrapY + size * 0.04);
    ctx.stroke();
  }

  // Ornate gold bands on shaft with gems
  ctx.fillStyle = brassMid;
  for (let i = 0; i < 5; i++) {
    const bandY = -size * 0.2 - i * size * 0.24;
    ctx.fillRect(-size * 0.045, bandY, size * 0.09, size * 0.04);
    // Band engraving
    ctx.strokeStyle = brassDark;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, bandY + size * 0.02);
    ctx.lineTo(size * 0.03, bandY + size * 0.02);
    ctx.stroke();
    // Band gem
    if (i < 4) {
      ctx.fillStyle = royalPurpleLight;
      ctx.shadowColor = royalPurpleLight;
      ctx.shadowBlur = 3 * zoom * gemPulse;
      ctx.beginPath();
      ctx.arc(0, bandY + size * 0.02, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = brassMid;
    }
  }

  // Elaborate gleaming lance tip
  const tipGrad = ctx.createLinearGradient(
    -size * 0.08,
    -size * 1.35,
    size * 0.08,
    -size * 1.35
  );
  tipGrad.addColorStop(0, "#b0b0b0");
  tipGrad.addColorStop(0.3, "#e0e0e0");
  tipGrad.addColorStop(0.5, "#f0f0f0");
  tipGrad.addColorStop(0.7, "#e0e0e0");
  tipGrad.addColorStop(1, "#b0b0b0");
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.58);
  ctx.lineTo(-size * 0.07, -size * 1.35);
  ctx.lineTo(size * 0.07, -size * 1.35);
  ctx.closePath();
  ctx.fill();

  // Lance tip edge highlight
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.56);
  ctx.lineTo(-size * 0.05, -size * 1.36);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Gold inlay pattern on tip
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.52);
  ctx.lineTo(0, -size * 1.38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 1.45);
  ctx.lineTo(size * 0.025, -size * 1.45);
  ctx.stroke();

  // Ornate coronet below tip
  ctx.fillStyle = brassMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 1.35);
  ctx.lineTo(-size * 0.06, -size * 1.38);
  ctx.lineTo(size * 0.06, -size * 1.38);
  ctx.lineTo(size * 0.08, -size * 1.35);
  ctx.closePath();
  ctx.fill();

  // Royal energy during attack
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.85) {
    const fireIntensity = 1 - Math.abs(attackPhase - 0.5) * 2.5;
    // Outer energy
    ctx.fillStyle = `rgba(114, 72, 201, ${fireIntensity * 0.48})`;
    ctx.shadowColor = royalPurpleLight;
    ctx.shadowBlur = 20 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.58);
    ctx.lineTo(-size * 0.08, -size * 1.85);
    ctx.lineTo(size * 0.08, -size * 1.85);
    ctx.closePath();
    ctx.fill();
    // Inner bright core
    ctx.fillStyle = `rgba(210, 186, 255, ${fireIntensity * 0.74})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.58);
    ctx.lineTo(-size * 0.04, -size * 1.78);
    ctx.lineTo(size * 0.04, -size * 1.78);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Arc particles
    for (let fp = 0; fp < 5; fp++) {
      const fpY = -size * 1.6 - fp * size * 0.05;
      const fpX = Math.sin(time * 12 + fp * 1.5) * size * 0.04;
      ctx.fillStyle = `rgba(220, 200, 255, ${fireIntensity * (1 - fp * 0.15)})`;
      ctx.beginPath();
      ctx.arc(fpX, fpY, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ornate multi-layer pennant
  const pennantWave =
    Math.sin(time * 8) * 4 + (isAttacking ? lanceThrust * 6 : 0);
  // Pennant shadow
  ctx.fillStyle = royalPurpleDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 1.14);
  ctx.quadraticCurveTo(
    -size * 0.22 + pennantWave,
    -size * 1.08,
    -size * 0.3 + pennantWave * 1.5,
    -size * 1.04
  );
  ctx.lineTo(-size * 0.03, -size * 0.98);
  ctx.closePath();
  ctx.fill();
  // Main pennant
  ctx.fillStyle = royalPurpleMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 1.15);
  ctx.quadraticCurveTo(
    -size * 0.2 + pennantWave,
    -size * 1.09,
    -size * 0.28 + pennantWave * 1.5,
    -size * 1.05
  );
  ctx.lineTo(-size * 0.025, -size * 1);
  ctx.closePath();
  ctx.fill();
  // Pennant gold trim
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Pennant inner highlight
  ctx.fillStyle = royalPurpleLight;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 1.13);
  ctx.quadraticCurveTo(
    -size * 0.15 + pennantWave,
    -size * 1.09,
    -size * 0.2 + pennantWave * 1.2,
    -size * 1.06
  );
  ctx.lineTo(-size * 0.04, -size * 1.02);
  ctx.closePath();
  ctx.fill();
  // Black "P" on pennant with gold outline
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.8;
  ctx.font = `bold ${size * 0.07}px serif`;
  ctx.strokeText("P", -size * 0.12 + pennantWave * 0.6, -size * 1.07);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("P", -size * 0.12 + pennantWave * 0.6, -size * 1.07);
  ctx.restore();

  // === ORNATE ROYAL SHIELD ===
  ctx.save();
  ctx.translate(x - size * 0.26, y - size * 0.18 + gallop * 0.12);
  ctx.rotate(-0.15);

  // Shield shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.moveTo(size * 0.02, -size * 0.22);
  ctx.lineTo(-size * 0.13, -size * 0.11);
  ctx.lineTo(-size * 0.11, size * 0.2);
  ctx.lineTo(size * 0.02, size * 0.28);
  ctx.lineTo(size * 0.14, size * 0.2);
  ctx.lineTo(size * 0.16, -size * 0.11);
  ctx.closePath();
  ctx.fill();

  // Ornate kite shield with gradient
  const shieldGrad = ctx.createLinearGradient(-size * 0.15, 0, size * 0.15, 0);
  shieldGrad.addColorStop(0, "#2a2a32");
  shieldGrad.addColorStop(0.3, "#4a4a52");
  shieldGrad.addColorStop(0.5, "#5a5a62");
  shieldGrad.addColorStop(0.7, "#4a4a52");
  shieldGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(-size * 0.15, -size * 0.14);
  ctx.lineTo(-size * 0.13, size * 0.2);
  ctx.lineTo(0, size * 0.28);
  ctx.lineTo(size * 0.13, size * 0.2);
  ctx.lineTo(size * 0.15, -size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Shield edge highlight
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.01, -size * 0.25);
  ctx.lineTo(-size * 0.14, -size * 0.13);
  ctx.stroke();

  // Orange field with gradient
  const fieldGrad = ctx.createLinearGradient(0, -size * 0.18, 0, size * 0.2);
  fieldGrad.addColorStop(0, royalPurpleLight);
  fieldGrad.addColorStop(0.5, royalPurpleMid);
  fieldGrad.addColorStop(1, royalPurpleDark);
  ctx.fillStyle = fieldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(-size * 0.11, -size * 0.09);
  ctx.lineTo(-size * 0.09, size * 0.15);
  ctx.lineTo(0, size * 0.21);
  ctx.lineTo(size * 0.09, size * 0.15);
  ctx.lineTo(size * 0.11, -size * 0.09);
  ctx.closePath();
  ctx.fill();

  // Shield filigree engravings
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  // Top swirl
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.12);
  ctx.quadraticCurveTo(-size * 0.08, -size * 0.06, -size * 0.04, -size * 0.02);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.06, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.06, size * 0.04, -size * 0.02);
  ctx.stroke();
  // Bottom swirl
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, size * 0.1);
  ctx.quadraticCurveTo(-size * 0.06, size * 0.14, -size * 0.02, size * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.04, size * 0.1);
  ctx.quadraticCurveTo(size * 0.06, size * 0.14, size * 0.02, size * 0.16);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Filled border band — outer rim (dark edge for depth)
  ctx.strokeStyle = "#2a1a08";
  ctx.lineWidth = 3.5 * zoom;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(-size * 0.15, -size * 0.14);
  ctx.lineTo(-size * 0.13, size * 0.2);
  ctx.lineTo(0, size * 0.28);
  ctx.lineTo(size * 0.13, size * 0.2);
  ctx.lineTo(size * 0.15, -size * 0.14);
  ctx.closePath();
  ctx.stroke();

  // Main gold border — gradient that follows the shield perimeter
  const borderGradOuter = ctx.createLinearGradient(
    -size * 0.15,
    -size * 0.14,
    size * 0.15,
    size * 0.2
  );
  borderGradOuter.addColorStop(0, "#c4a240");
  borderGradOuter.addColorStop(0.15, "#e8d088");
  borderGradOuter.addColorStop(0.3, "#d4b458");
  borderGradOuter.addColorStop(0.5, "#f0e0a0");
  borderGradOuter.addColorStop(0.7, "#d4b458");
  borderGradOuter.addColorStop(0.85, "#e8d088");
  borderGradOuter.addColorStop(1, "#c4a240");
  ctx.strokeStyle = borderGradOuter;
  ctx.lineWidth = 2.2 * zoom;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(-size * 0.15, -size * 0.14);
  ctx.lineTo(-size * 0.13, size * 0.2);
  ctx.lineTo(0, size * 0.28);
  ctx.lineTo(size * 0.13, size * 0.2);
  ctx.lineTo(size * 0.15, -size * 0.14);
  ctx.closePath();
  ctx.stroke();

  // Inner highlight line — bright specular along left/top edge
  ctx.strokeStyle = "rgba(255, 245, 210, 0.55)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.255);
  ctx.lineTo(-size * 0.145, -size * 0.135);
  ctx.lineTo(-size * 0.125, size * 0.195);
  ctx.stroke();

  // Inner shadow line — darker along right/bottom for bevel
  ctx.strokeStyle = "rgba(80, 60, 20, 0.5)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.275);
  ctx.lineTo(size * 0.125, size * 0.195);
  ctx.lineTo(size * 0.145, -size * 0.135);
  ctx.stroke();

  // Inset border line — separates field from rim
  const borderGradInner = ctx.createLinearGradient(
    -size * 0.12,
    -size * 0.1,
    size * 0.12,
    size * 0.18
  );
  borderGradInner.addColorStop(0, "#8a6e28");
  borderGradInner.addColorStop(0.3, "#b09030");
  borderGradInner.addColorStop(0.5, "#c4a240");
  borderGradInner.addColorStop(0.7, "#b09030");
  borderGradInner.addColorStop(1, "#8a6e28");
  ctx.strokeStyle = borderGradInner;
  ctx.lineWidth = 0.9 * zoom;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.205);
  ctx.lineTo(-size * 0.113, -size * 0.094);
  ctx.lineTo(-size * 0.094, size * 0.155);
  ctx.lineTo(0, size * 0.215);
  ctx.lineTo(size * 0.094, size * 0.155);
  ctx.lineTo(size * 0.113, -size * 0.094);
  ctx.closePath();
  ctx.stroke();

  // Corner gems on shield — with proper gem facets
  const gemPositions: [number, number, number][] = [
    [0, -size * 0.228, size * 0.018],
    [-size * 0.12, -size * 0.05, size * 0.013],
    [size * 0.12, -size * 0.05, size * 0.013],
    [-size * 0.1, size * 0.12, size * 0.012],
    [size * 0.1, size * 0.12, size * 0.012],
    [0, size * 0.24, size * 0.011],
  ];
  for (const [gx, gy, gr] of gemPositions) {
    // Gem bezel
    ctx.fillStyle = "#7a5e1a";
    ctx.beginPath();
    ctx.arc(gx, gy, gr * 1.35, 0, Math.PI * 2);
    ctx.fill();
    // Gem body
    const gemGrad = ctx.createRadialGradient(
      gx - gr * 0.3,
      gy - gr * 0.3,
      gr * 0.1,
      gx,
      gy,
      gr
    );
    gemGrad.addColorStop(0, "#c9a0f0");
    gemGrad.addColorStop(0.4, royalPurpleLight);
    gemGrad.addColorStop(1, "#3a1a68");
    ctx.fillStyle = gemGrad;
    ctx.shadowColor = royalPurpleLight;
    ctx.shadowBlur = 4 * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Facet highlight
    ctx.fillStyle = "rgba(255, 240, 255, 0.55)";
    ctx.beginPath();
    ctx.ellipse(
      gx - gr * 0.25,
      gy - gr * 0.25,
      gr * 0.35,
      gr * 0.22,
      -0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Ornate "P" emblem — layered with glow
  ctx.font = `bold ${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Soft glow behind letter
  ctx.fillStyle = `rgba(214, 172, 69, 0.2)`;
  ctx.shadowColor = "rgba(214, 172, 69, 0.35)";
  ctx.shadowBlur = 6 * zoom;
  ctx.fillText("P", 0, size * 0.04);
  ctx.shadowBlur = 0;
  // Dark shadow
  ctx.fillStyle = "#0a0510";
  ctx.fillText("P", size * 0.003, size * 0.043);
  // Main letter
  ctx.fillStyle = "#1a1020";
  ctx.fillText("P", 0, size * 0.04);
  // Gold outline
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.7;
  ctx.strokeText("P", 0, size * 0.04);
  ctx.textBaseline = "alphabetic";

  // Shield boss — layered dome with radial gradient
  const bossGrad = ctx.createRadialGradient(
    -size * 0.008,
    size * 0.015,
    size * 0.003,
    0,
    size * 0.02,
    size * 0.028
  );
  bossGrad.addColorStop(0, "#f0e8c8");
  bossGrad.addColorStop(0.3, brassLight);
  bossGrad.addColorStop(0.6, brassMid);
  bossGrad.addColorStop(1, brassDark);
  ctx.fillStyle = bossGrad;
  ctx.beginPath();
  ctx.arc(0, size * 0.02, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6a5420";
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();
  // Boss highlight
  ctx.fillStyle = "rgba(255, 250, 230, 0.45)";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.008,
    size * 0.013,
    size * 0.01,
    size * 0.006,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}
