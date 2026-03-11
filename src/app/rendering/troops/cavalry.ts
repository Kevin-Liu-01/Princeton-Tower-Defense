import type { Position } from "../../types";
import {
  resolveWeaponRotation,
  WEAPON_LIMITS,
  TROOP_MASTERWORK_STYLES,
  drawTroopMasterworkFinish,
  drawHorseTail,
  drawMuscularHorseBody,
  drawMuscularHorseLeg,
} from "./troopHelpers";
import type { HorseLegColors } from "./troopHelpers";

export function drawCavalryTroop(
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
  for (let auraLayer = 0; auraLayer < 3; auraLayer++) {
    const layerOffset = auraLayer * 0.12;
    const auraGrad = ctx.createRadialGradient(
      x,
      y + size * 0.1,
      size * (0.08 + layerOffset),
      x,
      y + size * 0.1,
      size * (0.9 + layerOffset * 0.3),
    );
    auraGrad.addColorStop(
      0,
      `rgba(146, 98, 235, ${auraIntensity * auraPulse * (0.5 - auraLayer * 0.12)})`,
    );
    auraGrad.addColorStop(
      0.4,
      `rgba(110, 70, 204, ${auraIntensity * auraPulse * (0.3 - auraLayer * 0.08)})`,
    );
    auraGrad.addColorStop(
      0.7,
      `rgba(72, 46, 150, ${auraIntensity * auraPulse * (0.15 - auraLayer * 0.04)})`,
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
      Math.PI * 2,
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
        Math.PI * 2,
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
  drawMuscularHorseBody(
    ctx,
    x,
    bodyY,
    size * 0.48,
    size * 0.31,
    size,
    zoom,
    {
      coatLight: horseCoatLight,
      coatMid: horseCoatMid,
      coatDark: horseCoatDark,
      muscleHighlight: "rgba(90, 70, 45, 0.2)",
      muscleShadow: "rgba(30, 20, 10, 0.35)",
    },
  );

  // === ORNATE ROYAL BARDING (horse armor) ===
  // Base barding plate with gradient
  const bardingGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y + size * 0.1,
    x + size * 0.4,
    y + size * 0.25,
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
    Math.PI * 2.35,
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
    Math.PI * 2.3,
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
    Math.PI * 2.25,
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
    Math.PI * 2.2,
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
    y + size * 0.18 + gallop * 0.15,
  );
  ctx.quadraticCurveTo(
    x - size * 0.22,
    y + size * 0.22,
    x - size * 0.28,
    y + size * 0.28 + gallop * 0.15,
  );
  ctx.stroke();
  // Right swirl
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + size * 0.06 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y + size * 0.12,
    x + size * 0.22,
    y + size * 0.16 + gallop * 0.15,
  );
  ctx.quadraticCurveTo(
    x + size * 0.16,
    y + size * 0.2,
    x + size * 0.22,
    y + size * 0.26 + gallop * 0.15,
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
    y + size * 0.31,
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
    y + size * 0.43,
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
    size * 0.02,
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
    thighLight: horseCoatLight,
    thighMid: horseCoatMid,
    thighDark: horseCoatDark,
    greaveTop: "#595f6d",
    greaveMid: "#7a8394",
    greaveBottom: "#4f5666",
    hoofColor: "#2c2017",
    trimColor: brassMid,
  };
  drawMuscularHorseLeg(
    ctx, x - size * 0.25, y + size * 0.36 + gallop * 0.13,
    size, zoom, time, legCycle * 1.15, 0.2, 8, cavLegColors,
  );
  drawMuscularHorseLeg(
    ctx, x - size * 0.08, y + size * 0.37 + gallop * 0.13,
    size, zoom, time, -legCycle * 0.95, 1.2, 8, cavLegColors,
  );
  drawMuscularHorseLeg(
    ctx, x + size * 0.13, y + size * 0.37 + gallop * 0.13,
    size, zoom, time, -legCycle * 1.05, 2.1, 8, cavLegColors,
  );
  drawMuscularHorseLeg(
    ctx, x + size * 0.3, y + size * 0.36 + gallop * 0.13,
    size, zoom, time, legCycle * 0.88, 3.1, 8, cavLegColors,
  );

  // === HORSE NECK AND HEAD ===
  // Neck with gradient
  const neckGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y + size * 0.1,
    x - size * 0.6,
    y - size * 0.1,
  );
  neckGrad.addColorStop(0, "#3a2a1a");
  neckGrad.addColorStop(0.5, "#2a1a0a");
  neckGrad.addColorStop(1, "#1a0a00");
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y + size * 0.08 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.52,
    y - size * 0.18 + headBob * 0.5,
    x - size * 0.6,
    y - size * 0.06 + headBob,
  );
  ctx.lineTo(x - size * 0.72, y - size * 0.03 + headBob);
  ctx.lineTo(x - size * 0.58, y + size * 0.06 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.42,
    y + size * 0.14 + gallop * 0.15,
    x - size * 0.28,
    y + size * 0.2 + gallop * 0.15,
  );
  ctx.fill();

  // Neck armor plate (crinet)
  ctx.fillStyle = "#616979";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.02 + gallop * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.48,
    y - size * 0.12 + headBob * 0.5,
    x - size * 0.54,
    y - size * 0.08 + headBob,
  );
  ctx.lineTo(x - size * 0.5, y - size * 0.02 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.44,
    y + size * 0.06 + gallop * 0.15,
    x - size * 0.36,
    y + size * 0.08 + gallop * 0.15,
  );
  ctx.closePath();
  ctx.fill();
  // Crinet gold trim
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // === ORNATE CHANFRON (head armor) ===
  // Base chanfron
  const chanfronGrad = ctx.createLinearGradient(
    x - size * 0.7,
    y - size * 0.05,
    x - size * 0.5,
    y - size * 0.15,
  );
  chanfronGrad.addColorStop(0, "#485062");
  chanfronGrad.addColorStop(0.5, "#6d788d");
  chanfronGrad.addColorStop(1, "#515a6d");
  ctx.fillStyle = chanfronGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.56, y - size * 0.16 + headBob);
  ctx.lineTo(x - size * 0.72, y - size * 0.03 + headBob);
  ctx.lineTo(x - size * 0.6, y + size * 0.05 + headBob);
  ctx.lineTo(x - size * 0.52, y - size * 0.1 + headBob);
  ctx.closePath();
  ctx.fill();

  // Chanfron engravings
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.1 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.64,
    y - size * 0.06,
    x - size * 0.6,
    y - size * 0.02 + headBob,
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Extra heavy chanfron reinforcement for warhorse durability.
  const facePlateGrad = ctx.createLinearGradient(
    x - size * 0.66,
    y - size * 0.13 + headBob,
    x - size * 0.54,
    y + size * 0.06 + headBob,
  );
  facePlateGrad.addColorStop(0, "#3a404e");
  facePlateGrad.addColorStop(0.45, "#5f7086");
  facePlateGrad.addColorStop(1, "#394150");
  ctx.fillStyle = facePlateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.67, y - size * 0.13 + headBob);
  ctx.lineTo(x - size * 0.71, y - size * 0.02 + headBob);
  ctx.lineTo(x - size * 0.61, y + size * 0.055 + headBob);
  ctx.lineTo(x - size * 0.54, y - size * 0.08 + headBob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.75)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.65, y - size * 0.11 + headBob);
  ctx.lineTo(x - size * 0.68, y - size * 0.02 + headBob);
  ctx.lineTo(x - size * 0.6, y + size * 0.04 + headBob);
  ctx.stroke();

  // Brass accent lines on chanfron
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.56, y - size * 0.15 + headBob);
  ctx.lineTo(x - size * 0.68, y - size * 0.03 + headBob);
  ctx.stroke();

  // Extended snout plate and muzzle to improve horse profile.
  const snoutGrad = ctx.createLinearGradient(
    x - size * 0.78,
    y - size * 0.03 + headBob,
    x - size * 0.62,
    y + size * 0.08 + headBob,
  );
  snoutGrad.addColorStop(0, "#4d3321");
  snoutGrad.addColorStop(0.55, "#6a4a30");
  snoutGrad.addColorStop(1, "#3e2618");
  ctx.fillStyle = snoutGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.73, y - size * 0.045 + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.79,
    y + size * 0.005 + headBob,
    x - size * 0.75,
    y + size * 0.06 + headBob,
  );
  ctx.quadraticCurveTo(
    x - size * 0.69,
    y + size * 0.1 + headBob,
    x - size * 0.62,
    y + size * 0.045 + headBob,
  );
  ctx.lineTo(x - size * 0.66, y - size * 0.02 + headBob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.7)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.72, y - size * 0.025 + headBob);
  ctx.lineTo(x - size * 0.66, y + size * 0.024 + headBob);
  ctx.stroke();
  ctx.fillStyle = "#2b1a11";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.73,
    y + size * 0.02 + headBob,
    size * 0.014,
    size * 0.009,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x - size * 0.705,
    y + size * 0.036 + headBob,
    size * 0.012,
    size * 0.008,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Elaborate golden crest with multiple spikes
  ctx.fillStyle = brassMid;
  ctx.shadowColor = brassLight;
  ctx.shadowBlur = 6 * zoom;
  // Center spike
  ctx.beginPath();
  ctx.moveTo(x - size * 0.54, y - size * 0.16 + headBob);
  ctx.lineTo(x - size * 0.52, y - size * 0.3 + headBob);
  ctx.lineTo(x - size * 0.5, y - size * 0.16 + headBob);
  ctx.closePath();
  ctx.fill();
  // Side spikes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.58, y - size * 0.14 + headBob);
  ctx.lineTo(x - size * 0.6, y - size * 0.24 + headBob);
  ctx.lineTo(x - size * 0.56, y - size * 0.14 + headBob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.14 + headBob);
  ctx.lineTo(x - size * 0.46, y - size * 0.22 + headBob);
  ctx.lineTo(x - size * 0.48, y - size * 0.14 + headBob);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Chanfron gem
  ctx.fillStyle = royalPurpleLight;
  ctx.shadowColor = royalPurpleLight;
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.58,
    y - size * 0.08 + headBob,
    size * 0.022,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Royal-violet eyes.
  ctx.fillStyle = "#6f53b8";
  ctx.shadowColor = royalPurpleLight;
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.58,
    y - size * 0.02 + headBob,
    size * 0.035,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Eye inner glow
  ctx.fillStyle = "#b193ef";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.58,
    y - size * 0.02 + headBob,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = `rgba(255, 255, 200, ${shimmer})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.59,
    y - size * 0.025 + headBob,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Iris + pupil for stronger expression
  ctx.fillStyle = "rgba(211, 191, 255, 0.9)";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.58,
    y - size * 0.02 + headBob,
    size * 0.01,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#1c0f04";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.578,
    y - size * 0.02 + headBob,
    size * 0.0055,
    0,
    Math.PI * 2,
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
      y - size * 0.08 + gallop * 0.1,
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
    x + size * 0.42,
    y + size * 0.12 + gallop * 0.15,
    size,
    zoom,
    time,
    6.0,
    4.2,
    {
      base: "#1d130d",
      mid: "#3d2616",
      highlight: "#5a3d24",
      accent: "rgba(156, 129, 219, 0.45)",
      glowRgb: "193, 168, 252",
    },
    0.25 + maneGlow * 0.3,
    { rgb: "220, 200, 255", intensity: maneGlow, threshold: 0.3 },
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
    capeBottomY,
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
    capeBottomY,
  );
  ctx.lineTo(x + size * 0.24 + capeFlow2 * 0.6, capeBottomY - size * 0.01);
  ctx.quadraticCurveTo(
    x + size * 0.32 + capeFlow * 0.6,
    y - size * 0.18,
    x + size * 0.2,
    y - size * 0.46 + riderBob * 0.5,
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
    capeBottomY - size * 0.02,
  );
  ctx.stroke();

  // Tempered steel torso with wider knightly silhouette.
  const cuirassGrad = ctx.createLinearGradient(
    x - size * 0.24,
    y - size * 0.5,
    x + size * 0.24,
    y - size * 0.06,
  );
  cuirassGrad.addColorStop(0, "#3e4552");
  cuirassGrad.addColorStop(0.25, "#596372");
  cuirassGrad.addColorStop(0.5, "#7a8698");
  cuirassGrad.addColorStop(0.75, "#5a6576");
  cuirassGrad.addColorStop(1, "#3b4351");
  ctx.fillStyle = cuirassGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.21, y - size * 0.085 + riderBob);
  ctx.lineTo(x - size * 0.24, y - size * 0.5 + riderBob * 0.55);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.61 + riderBob * 0.45,
    x + size * 0.24,
    y - size * 0.5 + riderBob * 0.55,
  );
  ctx.lineTo(x + size * 0.21, y - size * 0.085 + riderBob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(200, 214, 232, 0.5)";
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.55 + riderBob * 0.45);
  ctx.lineTo(x, y - size * 0.12 + riderBob * 0.9);
  ctx.stroke();
  ctx.strokeStyle = "rgba(50, 58, 70, 0.65)";
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.182, y - size * 0.22 + riderBob * 0.8);
  ctx.lineTo(x + size * 0.182, y - size * 0.22 + riderBob * 0.8);
  ctx.moveTo(x - size * 0.165, y - size * 0.35 + riderBob * 0.65);
  ctx.lineTo(x + size * 0.165, y - size * 0.35 + riderBob * 0.65);
  ctx.stroke();

  // Arms for better mounted silhouette readability.
  const rightArmBaseX = x + size * 0.23;
  const rightArmBaseY = y - size * 0.28 + riderBob * 0.55;
  const rightArmBaseAngle = isAttacking
    ? -1.24 + attackPhase * 0.65
    : -0.92 + Math.sin(time * 2.1) * 0.06;
  const rightArmAngle = resolveWeaponRotation(
    targetPos,
    rightArmBaseX,
    rightArmBaseY,
    rightArmBaseAngle,
    Math.PI / 2,
    isAttacking ? 0.95 : 0.52,
    WEAPON_LIMITS.rightArm,
  );
  ctx.save();
  ctx.translate(rightArmBaseX, rightArmBaseY);
  ctx.rotate(rightArmAngle);
  ctx.fillStyle = "#5e697b";
  ctx.fillRect(-size * 0.045, 0, size * 0.09, size * 0.19);
  ctx.fillStyle = "#8693a8";
  ctx.fillRect(-size * 0.052, size * 0.135, size * 0.104, size * 0.07);
  ctx.strokeStyle = `rgba(214, 172, 69, 0.72)`;
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(-size * 0.052, size * 0.135, size * 0.104, size * 0.07);
  ctx.restore();

  ctx.save();
  ctx.translate(x - size * 0.24, y - size * 0.28 + riderBob * 0.55);
  ctx.rotate(-0.36 + Math.sin(time * 1.8) * 0.05);
  ctx.fillStyle = "#5b6678";
  ctx.fillRect(-size * 0.043, 0, size * 0.086, size * 0.18);
  ctx.fillStyle = "#7d8ca2";
  ctx.fillRect(-size * 0.05, size * 0.13, size * 0.1, size * 0.068);
  ctx.strokeStyle = `rgba(214, 172, 69, 0.65)`;
  ctx.lineWidth = 0.95 * zoom;
  ctx.strokeRect(-size * 0.05, size * 0.13, size * 0.1, size * 0.068);
  ctx.restore();

  // Tabard with subtle trim (less extreme gold).
  const tabardGrad = ctx.createLinearGradient(
    x - size * 0.12,
    y - size * 0.38 + gallop * 0.1,
    x + size * 0.12,
    y - size * 0.04 + gallop * 0.15,
  );
  tabardGrad.addColorStop(0, royalPurpleDark);
  tabardGrad.addColorStop(0.5, royalPurpleMid);
  tabardGrad.addColorStop(1, "#41256a");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.112, y - size * 0.08 + gallop * 0.15);
  ctx.lineTo(x - size * 0.132, y - size * 0.39 + gallop * 0.1);
  ctx.lineTo(x + size * 0.132, y - size * 0.39 + gallop * 0.1);
  ctx.lineTo(x + size * 0.112, y - size * 0.08 + gallop * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.8)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.103, y - size * 0.1 + gallop * 0.15);
  ctx.lineTo(x - size * 0.122, y - size * 0.36 + gallop * 0.1);
  ctx.lineTo(x + size * 0.122, y - size * 0.36 + gallop * 0.1);
  ctx.lineTo(x + size * 0.103, y - size * 0.1 + gallop * 0.15);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = `rgba(224, 190, 122, 0.5)`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.34 + gallop * 0.1);
  ctx.lineTo(x, y - size * 0.12 + gallop * 0.15);
  ctx.stroke();

  // Embroidered Princeton mark.
  ctx.fillStyle = "#121212";
  ctx.font = `bold ${size * 0.13}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x + size * 0.004, y - size * 0.232 + gallop * 0.12);
  ctx.fillStyle = "rgba(216, 189, 133, 0.5)";
  ctx.fillText("P", x - size * 0.002, y - size * 0.236 + gallop * 0.12);

  // Improved articulated shoulder armor.
  for (const side of [-1, 1] as const) {
    const sx = x + side * size * 0.225;
    const sy = y - size * 0.404 + gallop * 0.1 + breathe;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(side * 0.18);
    const shoulderGrad = ctx.createLinearGradient(
      -size * 0.11,
      -size * 0.02,
      size * 0.11,
      size * 0.08,
    );
    shoulderGrad.addColorStop(0, "#4b5564");
    shoulderGrad.addColorStop(0.5, "#708095");
    shoulderGrad.addColorStop(1, "#465264");
    ctx.fillStyle = shoulderGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.115, size * 0.078, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#606f82";
    ctx.beginPath();
    ctx.ellipse(
      -side * size * 0.012,
      size * 0.027,
      size * 0.086,
      size * 0.05,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#556377";
    ctx.beginPath();
    ctx.ellipse(
      -side * size * 0.02,
      size * 0.048,
      size * 0.064,
      size * 0.04,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = `rgba(179, 135, 63, 0.72)`;
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.11, size * 0.074, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = brassLight;
    for (let riv = 0; riv < 3; riv++) {
      const ry = -size * 0.02 + riv * size * 0.036;
      ctx.beginPath();
      ctx.arc(-side * size * 0.08, ry, size * 0.0075, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Faceted sallet/armet hybrid helmet.
  const helmY = y - size * 0.6 + gallop * 0.08 + breathe * 0.2;
  const helmGrad = ctx.createLinearGradient(
    x - size * 0.16,
    helmY - size * 0.2,
    x + size * 0.16,
    helmY + size * 0.08,
  );
  helmGrad.addColorStop(0, "#505a69");
  helmGrad.addColorStop(0.46, "#7f8ea2");
  helmGrad.addColorStop(1, "#4c5766");
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

  // Bevor and cheek plates.
  ctx.fillStyle = "#3d4755";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.106, helmY + size * 0.01);
  ctx.lineTo(x - size * 0.14, helmY + size * 0.08);
  ctx.lineTo(x - size * 0.086, helmY + size * 0.1);
  ctx.lineTo(x - size * 0.048, helmY + size * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.106, helmY + size * 0.01);
  ctx.lineTo(x + size * 0.14, helmY + size * 0.08);
  ctx.lineTo(x + size * 0.086, helmY + size * 0.1);
  ctx.lineTo(x + size * 0.048, helmY + size * 0.03);
  ctx.closePath();
  ctx.fill();

  // Nasal crest and ornamental etch.
  ctx.fillStyle = "#667689";
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.014,
    helmY - size * 0.19,
    size * 0.028,
    size * 0.22,
    size * 0.008,
  );
  ctx.fill();
  ctx.strokeStyle = `rgba(179, 135, 63, 0.72)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.055, helmY - size * 0.14);
  ctx.quadraticCurveTo(
    x,
    helmY - size * 0.19,
    x + size * 0.055,
    helmY - size * 0.14,
  );
  ctx.stroke();

  // Angular visor slit with visible irises/pupils.
  const visorGrad = ctx.createLinearGradient(
    x - size * 0.11,
    helmY - size * 0.02,
    x + size * 0.11,
    helmY + size * 0.03,
  );
  visorGrad.addColorStop(0, "#242d3a");
  visorGrad.addColorStop(1, "#1a222f");
  ctx.fillStyle = visorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.108, helmY - size * 0.018);
  ctx.lineTo(x + size * 0.108, helmY - size * 0.018);
  ctx.lineTo(x + size * 0.09, helmY + size * 0.032);
  ctx.lineTo(x - size * 0.09, helmY + size * 0.032);
  ctx.closePath();
  ctx.fill();

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
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Breathing vents.
  ctx.fillStyle = "#1a222f";
  for (let vent = 0; vent < 4; vent++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.07 + vent * size * 0.046,
      helmY + size * 0.052,
      size * 0.0065,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Subtle helm trim and top jewel.
  ctx.strokeStyle = `rgba(179, 135, 63, 0.75)`;
  ctx.lineWidth = 1.15 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.114, helmY - size * 0.002);
  ctx.lineTo(x - size * 0.102, helmY - size * 0.12);
  ctx.lineTo(x, helmY - size * 0.22);
  ctx.lineTo(x + size * 0.102, helmY - size * 0.12);
  ctx.lineTo(x + size * 0.114, helmY - size * 0.002);
  ctx.stroke();
  ctx.fillStyle = royalPurpleLight;
  ctx.shadowColor = royalPurpleLight;
  ctx.shadowBlur = 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, helmY - size * 0.245, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Streamlined plume.
  const plumeWave = Math.sin(time * 4.8) * 2.4;
  const plumeWave2 = Math.sin(time * 5.3 + 0.5) * 1.8;
  ctx.fillStyle = royalPurpleDark;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.01, helmY - size * 0.18);
  for (let i = 0; i < 6; i++) {
    const py = helmY - size * 0.18 - i * size * 0.045;
    const pw = size * (0.04 + i * 0.017) + Math.sin(time * 6.8 + i * 0.8) * 2;
    ctx.lineTo(x - pw + plumeWave + size * 0.01, py);
  }
  for (let i = 5; i >= 0; i--) {
    const py = helmY - size * 0.18 - i * size * 0.045;
    const pw = size * (0.04 + i * 0.017) + Math.sin(time * 6.8 + i * 0.8) * 2;
    ctx.lineTo(x + pw + plumeWave + size * 0.01, py);
  }
  ctx.closePath();
  ctx.fill();
  const plumeGrad = ctx.createLinearGradient(
    x,
    helmY - size * 0.18,
    x,
    helmY - size * 0.47,
  );
  plumeGrad.addColorStop(0, royalPurpleMid);
  plumeGrad.addColorStop(0.45, royalPurpleLight);
  plumeGrad.addColorStop(1, royalPurpleDark);
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.moveTo(x, helmY - size * 0.18);
  for (let i = 0; i < 6; i++) {
    const py = helmY - size * 0.18 - i * size * 0.045;
    const pw =
      size * (0.034 + i * 0.015) + Math.sin(time * 6.8 + i * 0.8) * 1.7;
    ctx.lineTo(x - pw + plumeWave2, py);
  }
  for (let i = 5; i >= 0; i--) {
    const py = helmY - size * 0.18 - i * size * 0.045;
    const pw =
      size * (0.034 + i * 0.015) + Math.sin(time * 6.8 + i * 0.8) * 1.7;
    ctx.lineTo(x + pw + plumeWave2, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(215, 197, 252, 0.58)";
  ctx.lineWidth = 1 * zoom;
  ctx.globalAlpha = 0.6;
  for (let feather = 0; feather < 4; feather++) {
    const offset = (feather - 1.5) * size * 0.015;
    const fw = Math.sin(time * 7 + feather * 0.7) * 1.7;
    ctx.beginPath();
    ctx.moveTo(x + offset, helmY - size * 0.2);
    ctx.quadraticCurveTo(
      x + offset + fw,
      helmY - size * 0.31,
      x + offset + plumeWave2 * 0.5,
      helmY - size * 0.46,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === ORNATE ROYAL LANCE ===
  ctx.save();
  const lanceBaseAngle = isAttacking ? -0.35 - lanceThrust * 0.35 : -0.35;
  const lanceLunge = isAttacking
    ? size * 0.32 * Math.sin(attackPhase * Math.PI)
    : 0;
  const lanceX = x + size * 0.26 + lanceLunge * 0.5;
  const lanceY = y - size * 0.32 + gallop * 0.12 - lanceLunge * 0.3;
  const lanceAngle = resolveWeaponRotation(
    targetPos,
    lanceX,
    lanceY,
    lanceBaseAngle,
    Math.PI / 2,
    isAttacking ? 1.05 : 0.58,
    WEAPON_LIMITS.lance,
  );
  ctx.translate(lanceX, lanceY);
  ctx.rotate(lanceAngle);

  // Ornate lance shaft with wood grain gradient
  const lanceGrad = ctx.createLinearGradient(-size * 0.04, 0, size * 0.04, 0);
  lanceGrad.addColorStop(0, "#4a2a10");
  lanceGrad.addColorStop(0.2, "#6a4a2a");
  lanceGrad.addColorStop(0.5, "#8a6a4a");
  lanceGrad.addColorStop(0.8, "#6a4a2a");
  lanceGrad.addColorStop(1, "#4a2a10");
  ctx.fillStyle = lanceGrad;
  ctx.fillRect(-size * 0.04, -size * 0.85, size * 0.08, size * 1.0);

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
  for (let i = 0; i < 4; i++) {
    const bandY = -size * 0.2 - i * size * 0.2;
    ctx.fillRect(-size * 0.045, bandY, size * 0.09, size * 0.04);
    // Band engraving
    ctx.strokeStyle = brassDark;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, bandY + size * 0.02);
    ctx.lineTo(size * 0.03, bandY + size * 0.02);
    ctx.stroke();
    // Band gem
    if (i < 3) {
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
    -size * 0.85,
    size * 0.08,
    -size * 0.85,
  );
  tipGrad.addColorStop(0, "#b0b0b0");
  tipGrad.addColorStop(0.3, "#e0e0e0");
  tipGrad.addColorStop(0.5, "#f0f0f0");
  tipGrad.addColorStop(0.7, "#e0e0e0");
  tipGrad.addColorStop(1, "#b0b0b0");
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.08);
  ctx.lineTo(-size * 0.07, -size * 0.85);
  ctx.lineTo(size * 0.07, -size * 0.85);
  ctx.closePath();
  ctx.fill();

  // Lance tip edge highlight
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.06);
  ctx.lineTo(-size * 0.05, -size * 0.86);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Gold inlay pattern on tip
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 1.02);
  ctx.lineTo(0, -size * 0.88);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.95);
  ctx.lineTo(size * 0.025, -size * 0.95);
  ctx.stroke();

  // Ornate coronet below tip
  ctx.fillStyle = brassMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.85);
  ctx.lineTo(-size * 0.06, -size * 0.88);
  ctx.lineTo(size * 0.06, -size * 0.88);
  ctx.lineTo(size * 0.08, -size * 0.85);
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
    ctx.moveTo(0, -size * 1.08);
    ctx.lineTo(-size * 0.08, -size * 1.35);
    ctx.lineTo(size * 0.08, -size * 1.35);
    ctx.closePath();
    ctx.fill();
    // Inner bright core
    ctx.fillStyle = `rgba(210, 186, 255, ${fireIntensity * 0.74})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.08);
    ctx.lineTo(-size * 0.04, -size * 1.28);
    ctx.lineTo(size * 0.04, -size * 1.28);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Arc particles
    for (let fp = 0; fp < 5; fp++) {
      const fpY = -size * 1.1 - fp * size * 0.05;
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
  ctx.moveTo(-size * 0.03, -size * 0.74);
  ctx.quadraticCurveTo(
    -size * 0.22 + pennantWave,
    -size * 0.68,
    -size * 0.3 + pennantWave * 1.5,
    -size * 0.64,
  );
  ctx.lineTo(-size * 0.03, -size * 0.58);
  ctx.closePath();
  ctx.fill();
  // Main pennant
  ctx.fillStyle = royalPurpleMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, -size * 0.75);
  ctx.quadraticCurveTo(
    -size * 0.2 + pennantWave,
    -size * 0.69,
    -size * 0.28 + pennantWave * 1.5,
    -size * 0.65,
  );
  ctx.lineTo(-size * 0.025, -size * 0.6);
  ctx.closePath();
  ctx.fill();
  // Pennant gold trim
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Pennant inner highlight
  ctx.fillStyle = royalPurpleLight;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.73);
  ctx.quadraticCurveTo(
    -size * 0.15 + pennantWave,
    -size * 0.69,
    -size * 0.2 + pennantWave * 1.2,
    -size * 0.66,
  );
  ctx.lineTo(-size * 0.04, -size * 0.62);
  ctx.closePath();
  ctx.fill();
  // Black "P" on pennant with gold outline
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.8;
  ctx.font = `bold ${size * 0.07}px serif`;
  ctx.strokeText("P", -size * 0.12 + pennantWave * 0.6, -size * 0.67);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("P", -size * 0.12 + pennantWave * 0.6, -size * 0.67);
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

  // Double gold trim
  ctx.strokeStyle = brassLight;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(-size * 0.15, -size * 0.14);
  ctx.lineTo(-size * 0.13, size * 0.2);
  ctx.lineTo(0, size * 0.28);
  ctx.lineTo(size * 0.13, size * 0.2);
  ctx.lineTo(size * 0.15, -size * 0.14);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = brassDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.23);
  ctx.lineTo(-size * 0.12, -size * 0.12);
  ctx.lineTo(-size * 0.1, size * 0.17);
  ctx.lineTo(0, size * 0.24);
  ctx.lineTo(size * 0.1, size * 0.17);
  ctx.lineTo(size * 0.12, -size * 0.12);
  ctx.closePath();
  ctx.stroke();

  // Corner gems on shield
  ctx.fillStyle = royalPurpleLight;
  ctx.shadowColor = royalPurpleLight;
  ctx.shadowBlur = 4 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(0, -size * 0.22, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-size * 0.1, size * 0.12, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.1, size * 0.12, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Ornate "P" emblem with shadow
  ctx.fillStyle = "#0a0a0a";
  ctx.font = `bold ${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("P", size * 0.005, size * 0.065);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText("P", 0, size * 0.06);
  // Gold outline on P
  ctx.strokeStyle = brassMid;
  ctx.lineWidth = 0.6;
  ctx.strokeText("P", 0, size * 0.06);

  // Shield boss (center boss)
  ctx.fillStyle = brassMid;
  ctx.beginPath();
  ctx.arc(0, size * 0.02, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = brassLight;
  ctx.beginPath();
  ctx.arc(0, size * 0.02, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  drawTroopMasterworkFinish(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    TROOP_MASTERWORK_STYLES.cavalry,
    { mounted: true, vanguard: true },
  );
}
