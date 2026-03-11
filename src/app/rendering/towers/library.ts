import type { Tower, Position } from "../../types";
import {
  ISO_PRISM_D_FACTOR,
} from "../../constants";
import {
  drawIsometricPrism,
  drawIsoGothicWindow,
  drawIsometricRailing,
  drawIsoFlushVent,
} from "./towerHelpers";
import { traceIsoFlushRect } from "../isoFlush";

export function getEllipseHalfBounds(
  rx: number,
  ry: number,
  rotation: number,
): [number, number, number, number] {
  const sinR = Math.sin(rotation);
  const cosR = Math.cos(rotation);
  const crossT = Math.atan2(-rx * sinR, ry * cosR);
  // Test at π/2 past the crossing — far enough to avoid sign-flip instability
  const checkT = crossT + Math.PI * 0.5;
  const checkDy = rx * Math.cos(checkT) * sinR + ry * Math.sin(checkT) * cosR;
  const o = 0.03; // small overlap prevents hairline seam gaps
  if (checkDy < 0) {
    return [
      crossT - o,
      crossT + Math.PI + o,
      crossT + Math.PI - o,
      crossT + Math.PI * 2 + o,
    ];
  }
  return [
    crossT + Math.PI - o,
    crossT + Math.PI * 2 + o,
    crossT - o,
    crossT + Math.PI + o,
  ];
}

export function drawLibraryOrbitalEffects(
  ctx: CanvasRenderingContext2D,
  drawFront: boolean,
  screenPos: Position,
  topY: number,
  spireHeight: number,
  baseHeight: number,
  lowerBodyHeight: number,
  mainColor: string,
  glowColor: string,
  zoom: number,
  time: number,
  attackPulse: number,
  shakeY: number,
  tower: Tower,
) {
  const sX = screenPos.x;

  // Floating arcane rings — small flat ellipses (no rotation)
  for (let ring = 0; ring < 3; ring++) {
    const ringY = topY - 10 * zoom - spireHeight * (0.35 + ring * 0.2);
    const ringSize = (3.5 - ring * 0.4) * zoom;
    const ringRY = ringSize * 0.4;
    const ringAlpha =
      0.55 + Math.sin(time * 2.5 + ring * 1.1) * 0.12 + attackPulse * 0.35;

    // Outer glow
    ctx.strokeStyle = `${mainColor} ${ringAlpha * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      sX,
      ringY,
      ringSize + 0.5 * zoom,
      ringRY + 0.2 * zoom,
      0,
      drawFront ? 0 : Math.PI,
      drawFront ? Math.PI : Math.PI * 2,
    );
    ctx.stroke();

    // Main ring stroke
    ctx.strokeStyle = `${mainColor} ${ringAlpha})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      sX,
      ringY,
      ringSize,
      ringRY,
      0,
      drawFront ? 0 : Math.PI,
      drawFront ? Math.PI : Math.PI * 2,
    );
    ctx.stroke();
  }

  // Level 2+: Floating ancient tomes (isometric orbit with depth sorting)
  if (tower.level >= 2) {
    for (let i = 0; i < tower.level; i++) {
      const bookAngle = time * 1.0 + i * ((Math.PI * 2) / tower.level);
      if (Math.sin(bookAngle) >= 0 !== drawFront) continue;

      const bookRadius = 30 * zoom;
      const bookX = sX + Math.cos(bookAngle) * bookRadius;
      const bookOrbitY =
        topY - 20 * zoom + Math.sin(bookAngle) * bookRadius * 0.35;
      const bookFloat = Math.sin(time * 3 + i) * 3 * zoom;
      const pageFlutter = Math.sin(time * 6 + i * 1.7) * 0.3;

      ctx.fillStyle = `${mainColor} 0.25)`;
      ctx.beginPath();
      ctx.ellipse(
        bookX,
        bookOrbitY + bookFloat + 3 * zoom,
        9 * zoom,
        3.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.save();
      ctx.translate(bookX, bookOrbitY + bookFloat);
      ctx.rotate(pageFlutter * 0.15);

      const bookCoverColor =
        i % 3 === 0 ? "#6a4a3a" : i % 3 === 1 ? "#4a5a6a" : "#5a4a6a";
      ctx.fillStyle = bookCoverColor;
      ctx.fillRect(-8 * zoom, -6 * zoom, 16 * zoom, 12 * zoom);

      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(-8 * zoom, -6 * zoom, 2 * zoom, 12 * zoom);

      ctx.fillStyle = "#c9a227";
      ctx.fillRect(-7.5 * zoom, -4 * zoom, 1 * zoom, 8 * zoom);

      ctx.fillStyle = "#e8dcc8";
      const pageOffset = Math.sin(time * 8 + i * 2) * 1 * zoom;
      ctx.fillRect(
        8 * zoom - 1 * zoom,
        -5 * zoom + pageOffset,
        1 * zoom,
        10 * zoom,
      );

      ctx.fillStyle = `rgba(${glowColor}, ${0.6 + Math.sin(time * 5 + i) * 0.2})`;
      ctx.fillRect(-5 * zoom, -5 * zoom, 12 * zoom, 10 * zoom);

      ctx.fillStyle = "#3a2a1a";
      ctx.font = `${6 * zoom}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(["ᚠ", "ᚢ", "ᚦ"][i % 3], 1 * zoom, 2 * zoom);

      for (let p = 0; p < 2; p++) {
        const pagePhase = (time * 2 + i * 0.7 + p * 0.5) % 2;
        if (pagePhase < 1) {
          const pageLift = pagePhase * 12 * zoom;
          const pageDrift = Math.sin(pagePhase * Math.PI) * 6 * zoom;
          const pageAlpha = 1 - pagePhase;
          ctx.fillStyle = `rgba(230, 220, 200, ${pageAlpha * 0.7})`;
          ctx.save();
          ctx.translate(pageDrift, -pageLift);
          ctx.rotate(pagePhase * 1.5 + p);
          ctx.fillRect(-3 * zoom, -2 * zoom, 6 * zoom, 4 * zoom);
          ctx.restore();
        }
      }

      ctx.restore();

      ctx.fillStyle = `rgba(${glowColor}, ${0.3 + Math.sin(time * 4 + i) * 0.15})`;
      for (let trail = 0; trail < 3; trail++) {
        const trailAngle = bookAngle - (trail + 1) * 0.15;
        const trailX = sX + Math.cos(trailAngle) * bookRadius;
        const trailY =
          topY - 20 * zoom + Math.sin(trailAngle) * bookRadius * 0.35;
        const trailSize = (2 - trail * 0.5) * zoom;
        ctx.globalAlpha = 0.3 - trail * 0.08;
        ctx.beginPath();
        ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Knowledge orbs / wisps (depth-sorted by orbit angle)
    for (let orb = 0; orb < 5; orb++) {
      const orbAngle = time * 0.6 + (orb * (Math.PI * 2)) / 5;
      if (Math.sin(orbAngle) >= 0 !== drawFront) continue;

      const orbVertical = Math.sin(time * 1.5 + orb * 1.2) * 20 * zoom;
      const orbRadius = (25 + Math.sin(time * 0.8 + orb) * 10) * zoom;
      const orbX = sX + Math.cos(orbAngle) * orbRadius;
      const orbY = screenPos.y - lowerBodyHeight * zoom * 0.4 + orbVertical;
      const orbAlpha = 0.3 + Math.sin(time * 3 + orb * 0.8) * 0.15;

      ctx.fillStyle = `rgba(${glowColor}, ${orbAlpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${glowColor}, ${orbAlpha})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let wt = 1; wt <= 3; wt++) {
        const wtAngle = orbAngle - wt * 0.08;
        const wtX = sX + Math.cos(wtAngle) * orbRadius;
        const wtY =
          screenPos.y -
          lowerBodyHeight * zoom * 0.4 +
          Math.sin(time * 1.5 + orb * 1.2 - wt * 0.05) * 20 * zoom;
        ctx.fillStyle = `rgba(${glowColor}, ${orbAlpha * (1 - wt * 0.3)})`;
        ctx.beginPath();
        ctx.arc(wtX, wtY, (1.5 - wt * 0.3) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Level 3+: Runic barrier circle (split arcs) + nodes + crystal shards
  if (tower.level >= 3) {
    const barrierGlow = 0.4 + Math.sin(time * 2.5) * 0.2 + attackPulse * 0.3;
    const barrierRotation = time * 0.3;
    const barrierRX = 22 * zoom;
    const barrierRY = 11 * zoom;

    ctx.strokeStyle = `rgba(${glowColor}, ${barrierGlow})`;
    ctx.lineWidth = 2 * zoom;
    const [bbS, bbE, bfS, bfE] = getEllipseHalfBounds(
      barrierRX,
      barrierRY,
      barrierRotation,
    );
    ctx.beginPath();
    ctx.ellipse(
      sX,
      topY - 15 * zoom,
      barrierRX,
      barrierRY,
      barrierRotation,
      drawFront ? bfS : bbS,
      drawFront ? bfE : bbE,
    );
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      const nodeAngle = (i / 6) * Math.PI * 2 + time * 1.2;
      if (Math.sin(nodeAngle) >= 0 !== drawFront) continue;

      const nodeX = sX + Math.cos(nodeAngle) * 24 * zoom;
      const nodeY = topY - 15 * zoom + Math.sin(nodeAngle) * 12 * zoom;

      ctx.fillStyle = `rgba(${glowColor}, ${barrierGlow + 0.2})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    for (let i = 0; i < 4; i++) {
      const crystalAngle = time * 0.8 + (i / 4) * Math.PI * 2;
      if (Math.sin(crystalAngle) >= 0 !== drawFront) continue;

      const crystalRadius = 35 + Math.sin(time * 2 + i) * 5;
      const crystalX = sX + Math.cos(crystalAngle) * crystalRadius * zoom;
      const crystalY =
        topY - 30 * zoom + Math.sin(crystalAngle) * crystalRadius * 0.3 * zoom;
      const crystalFloat = Math.sin(time * 3 + i * 1.5) * 4 * zoom;

      ctx.fillStyle = `rgba(${glowColor}, ${0.3 + Math.sin(time * 4 + i) * 0.15})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(crystalX, crystalY + crystalFloat - 8 * zoom);
      ctx.lineTo(crystalX - 4 * zoom, crystalY + crystalFloat);
      ctx.lineTo(crystalX, crystalY + crystalFloat + 5 * zoom);
      ctx.lineTo(crystalX + 4 * zoom, crystalY + crystalFloat);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Level 3 energy amplifier rings (split arcs + nodes)
  if (tower.level === 3 && !tower.upgrade) {
    const ampRingGlow = 0.5 + Math.sin(time * 3) * 0.3 + attackPulse;
    const ampRotation = time * 0.5;
    const ampRX = 20 * zoom;
    const ampRY = 10 * zoom;

    ctx.strokeStyle = `${mainColor} ${ampRingGlow})`;
    ctx.lineWidth = 2.5 * zoom;
    const [abS, abE, afS, afE] = getEllipseHalfBounds(
      ampRX,
      ampRY,
      ampRotation,
    );
    ctx.beginPath();
    ctx.ellipse(
      sX,
      topY - 18 * zoom,
      ampRX,
      ampRY,
      ampRotation,
      drawFront ? afS : abS,
      drawFront ? afE : abE,
    );
    ctx.stroke();

    for (let i = 0; i < 5; i++) {
      const runeAngle = (i / 5) * Math.PI * 2 + time * 1.5;
      if (Math.sin(runeAngle) >= 0 !== drawFront) continue;

      const rx = sX + Math.cos(runeAngle) * 24 * zoom;
      const ry = topY - 18 * zoom + Math.sin(runeAngle) * 12 * zoom;

      ctx.fillStyle = `rgba(220, 180, 255, ${ampRingGlow})`;
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Level 4B: Orbiting crystals + dashed ring (depth-sorted)
  if (tower.level === 4 && tower.upgrade === "B") {
    for (let i = 0; i < 6; i++) {
      const crystalAngle = (i * Math.PI) / 3 + time * 0.5;
      if (Math.sin(crystalAngle) >= 0 !== drawFront) continue;

      const cx = sX + Math.cos(crystalAngle) * 25 * zoom;
      const cy = topY - 10 * zoom + Math.sin(crystalAngle) * 12 * zoom;
      const crystalSize = (8 + Math.sin(time * 2 + i) * 3) * zoom;

      ctx.fillStyle = "rgba(100, 200, 255, 0.3)";
      ctx.shadowColor = "#66ddff";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        crystalSize * 0.8,
        crystalSize * 0.4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(150, 230, 255, 0.9)";
      ctx.beginPath();
      ctx.moveTo(cx, cy - crystalSize);
      ctx.lineTo(cx + crystalSize * 0.5, cy);
      ctx.lineTo(cx, cy + crystalSize * 0.7);
      ctx.lineTo(cx - crystalSize * 0.5, cy);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = `rgba(100, 200, 255, ${0.4 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4 * zoom, 4 * zoom]);
    ctx.beginPath();
    ctx.ellipse(
      sX,
      screenPos.y + shakeY,
      40 * zoom,
      20 * zoom,
      0,
      drawFront ? 0 : Math.PI,
      drawFront ? Math.PI : Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Energy field aura around tower base (split arc, drawn at foundation level)
  const auraSize = 30 + Math.sin(time * 3) * 5;
  ctx.strokeStyle = `${mainColor} ${0.35 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    sX,
    screenPos.y + shakeY + 8 * zoom,
    auraSize * zoom,
    auraSize * zoom * 0.5,
    0,
    drawFront ? 0 : Math.PI,
    drawFront ? Math.PI : Math.PI * 2,
  );
  ctx.stroke();
}

// LIBRARY TOWER - Kingdom Fantasy Gothic Design with Mystical Elements
export function renderLibraryTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
) {
  void colors;

  ctx.save();
  const sX = screenPos.x;
  const baseWidth = 34 + tower.level * 5;
  const baseHeight = 30 + tower.level * 10;
  const w = baseWidth * zoom * 0.5;
  const d = baseWidth * zoom * ISO_PRISM_D_FACTOR;

  let mainColor = "rgba(180, 100, 255,";
  let glowColor = "180, 100, 255";

  if (tower.level > 3 && tower.upgrade === "A") {
    mainColor = "rgba(255, 150, 100,";
    glowColor = "255, 150, 100";
  } else if (tower.level > 3 && tower.upgrade === "B") {
    mainColor = "rgba(100, 150, 255,";
    glowColor = "100, 150, 255";
  }

  // Attack animation - piston mechanism
  const timeSinceFire = Date.now() - tower.lastAttack;
  let attackPulse = 0;
  let pistonOffset = 0;
  let groundShockwave = 0;
  let groundCrackPhase = 0;
  let impactFlash = 0;

  if (timeSinceFire < 500) {
    const attackPhase = timeSinceFire / 500;
    attackPulse = (1 - attackPhase) * 0.4;

    if (attackPhase < 0.2) {
      pistonOffset = (-attackPhase / 0.2) * 12 * zoom;
    } else if (attackPhase < 0.35) {
      const slamPhase = (attackPhase - 0.2) / 0.15;
      pistonOffset = -12 * zoom * (1 - slamPhase * slamPhase);
      if (slamPhase > 0.8) {
        impactFlash = (slamPhase - 0.8) / 0.2;
      }
    } else if (attackPhase < 0.5) {
      const compressPhase = (attackPhase - 0.35) / 0.15;
      pistonOffset = 4 * zoom * Math.sin(compressPhase * Math.PI);
      impactFlash = 1 - compressPhase;
    } else {
      pistonOffset = 0;
    }

    if (attackPhase > 0.3) {
      groundShockwave = (attackPhase - 0.3) / 0.7;
      groundCrackPhase = Math.min(1, (attackPhase - 0.3) / 0.5);
    }
  }

  const shakeY = 0;

  // ========== STEPPED STONE FOUNDATION ==========
  // Lowest step — wide rough-hewn stone base
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 14 * zoom,
    baseWidth + 20,
    baseWidth + 20,
    3,
    {
      top: "#3a2a1a",
      left: "#2a1a0a",
      right: "#1a0a00",
      leftBack: "#4a3a2a",
      rightBack: "#3a2a1a",
    },
    zoom,
  );

  // Middle step — dressed stone
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 11 * zoom,
    baseWidth + 14,
    baseWidth + 14,
    3,
    {
      top: "#4a3a2a",
      left: "#3a2a1a",
      right: "#2a1a0a",
      leftBack: "#5a4a3a",
      rightBack: "#4a3a2a",
    },
    zoom,
  );

  // Upper step — polished foundation with rune trim
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 8 * zoom,
    baseWidth + 10,
    baseWidth + 10,
    8,
    {
      top: "#5a4a3a",
      left: "#4a3a2a",
      right: "#3a2a1a",
      leftBack: "#6a5a4a",
      rightBack: "#5a4a3a",
    },
    zoom,
  );

  // Mystical rune circle inscribed on upper step
  const groundRuneGlow = 0.25 + Math.sin(time * 2) * 0.12 + attackPulse * 0.3;
  ctx.strokeStyle = `rgba(${glowColor}, ${groundRuneGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  const fndRX = (baseWidth + 10) * zoom * 0.4;
  const fndRY = (baseWidth + 10) * zoom * 0.2;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 4 * zoom,
    fndRX,
    fndRY,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  // Inner rune circle
  ctx.strokeStyle = `rgba(${glowColor}, ${groundRuneGlow * 0.6})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 4 * zoom,
    fndRX * 0.7,
    fndRY * 0.7,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Ground rune symbols
  const groundRunes = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ"];
  ctx.fillStyle = `rgba(${glowColor}, ${groundRuneGlow + 0.1})`;
  ctx.font = `${7 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 6; i++) {
    const runeAngle = (i / 6) * Math.PI * 2 + time * 0.15;
    const runeX = screenPos.x + Math.cos(runeAngle) * fndRX * 0.85;
    const runeY = screenPos.y + 4 * zoom + Math.sin(runeAngle) * fndRY * 0.85;
    ctx.fillText(groundRunes[i], runeX, runeY);
  }

  // Gold trim along upper step front edge
  const fndW2 = (baseWidth + 10) * zoom * 0.5;
  const fndD2 = (baseWidth + 10) * zoom * ISO_PRISM_D_FACTOR;
  ctx.strokeStyle = `rgba(201, 162, 39, ${0.35 + Math.sin(time * 1.5) * 0.1})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - fndW2, screenPos.y);
  ctx.lineTo(screenPos.x, screenPos.y + fndD2);
  ctx.lineTo(screenPos.x + fndW2, screenPos.y);
  ctx.stroke();

  // Foundation corner pillars with proper 3D isometric prism
  const pillarPositions = [
    { x: screenPos.x - fndW2 * 0.85, y: screenPos.y + fndD2 * 0.15 },
    { x: screenPos.x - fndW2 * 0.35, y: screenPos.y + fndD2 * 0.65 },
    { x: screenPos.x + fndW2 * 0.35, y: screenPos.y + fndD2 * 0.65 },
    { x: screenPos.x + fndW2 * 0.85, y: screenPos.y + fndD2 * 0.15 },
  ];
  for (let corner = 0; corner < pillarPositions.length; corner++) {
    const pp = pillarPositions[corner];

    // Pillar as isometric prism
    drawIsometricPrism(
      ctx,
      pp.x,
      pp.y + 2 * zoom,
      5,
      5,
      12,
      {
        top: "#7a6a5a",
        left: "#5a4a3a",
        right: "#4a3a2a",
        leftBack: "#6a5a4a",
        rightBack: "#5a4a3a",
      },
      zoom,
    );

    // Pillar cap (pyramid)
    const capY = pp.y + 2 * zoom - 12 * zoom;
    ctx.fillStyle = "#8a7a6a";
    ctx.beginPath();
    ctx.moveTo(pp.x, capY - 4 * zoom);
    ctx.lineTo(pp.x - 3.5 * zoom, capY);
    ctx.lineTo(pp.x, capY + 1.5 * zoom);
    ctx.lineTo(pp.x + 3.5 * zoom, capY);
    ctx.closePath();
    ctx.fill();

    // Pillar gold finial
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(pp.x, capY - 5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Pillar rune glow
    const pillarGlow =
      0.4 + Math.sin(time * 3 + corner) * 0.2 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${pillarGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 3 * zoom;
    ctx.beginPath();
    ctx.arc(pp.x, pp.y - 4 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Ground-level attack effects (drawn before tower body so building occludes inner portion)
  const lowerBodyHeight = baseHeight * 0.5;

  if (tower.level === 4 && tower.upgrade === "A") {
    const wavePhase = (time * 2) % 1;
    const waveRadius = 30 + wavePhase * 60;
    ctx.strokeStyle = `rgba(255, 100, 50, ${0.7 * (1 - wavePhase)})`;
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      sX,
      screenPos.y + shakeY + 5 * zoom,
      waveRadius * zoom * 0.7,
      waveRadius * zoom * 0.35,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 150, 50, 0.5)`;
    ctx.lineWidth = 2 * zoom;
    for (let i = 0; i < 6; i++) {
      const crackAngle = (i / 6) * Math.PI * 2 + time * 0.2;
      ctx.beginPath();
      ctx.moveTo(sX, screenPos.y + shakeY + 5 * zoom);
      ctx.lineTo(
        sX + Math.cos(crackAngle) * 35 * zoom,
        screenPos.y + shakeY + 5 * zoom + Math.sin(crackAngle) * 17 * zoom,
      );
      ctx.stroke();
    }
  }

  if (groundShockwave > 0 && groundShockwave < 1) {
    if (groundShockwave < 0.3) {
      const flashAlpha = (1 - groundShockwave / 0.3) * 0.5;
      const flashGrad = ctx.createRadialGradient(
        sX,
        screenPos.y + 5 * zoom,
        0,
        sX,
        screenPos.y + 5 * zoom,
        25 * zoom,
      );
      flashGrad.addColorStop(0, `${mainColor} ${flashAlpha})`);
      flashGrad.addColorStop(0.5, `rgba(${glowColor}, ${flashAlpha * 0.3})`);
      flashGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.ellipse(
        sX,
        screenPos.y + 5 * zoom,
        25 * zoom,
        12 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    for (let ring = 0; ring < 4; ring++) {
      const ringDelay = ring * 0.12;
      const ringPhase = Math.max(0, groundShockwave - ringDelay);
      if (ringPhase > 0 && ringPhase < 1) {
        const ringRadius = 25 + ringPhase * 80;
        const ringAlpha = (1 - ringPhase) * 0.6;
        const ringWidth = (5 - ring) * (1 - ringPhase * 0.5);
        ctx.strokeStyle = `${mainColor} ${ringAlpha})`;
        ctx.lineWidth = ringWidth * zoom;
        ctx.beginPath();
        ctx.ellipse(
          sX,
          screenPos.y + 5 * zoom,
          ringRadius * zoom,
          ringRadius * zoom * 0.5,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }

    if (groundCrackPhase > 0) {
      ctx.lineWidth = 2 * zoom;
      for (let i = 0; i < 12; i++) {
        const crackAngle = (i / 12) * Math.PI * 2 + Math.PI / 24;
        const crackLength = 25 + groundCrackPhase * 60;
        const crackAlpha = (1 - groundCrackPhase) * 0.7;
        ctx.strokeStyle = `${mainColor} ${crackAlpha})`;
        const seg1X =
          sX +
          Math.cos(crackAngle) * crackLength * 0.35 * zoom +
          Math.sin(i * 3 + time * 5) * 3 * zoom;
        const seg1Y =
          screenPos.y +
          5 * zoom +
          Math.sin(crackAngle) * crackLength * 0.18 * zoom;
        const seg2X =
          sX +
          Math.cos(crackAngle) * crackLength * 0.7 * zoom +
          Math.cos(i * 2 + time * 3) * 5 * zoom;
        const seg2Y =
          screenPos.y +
          5 * zoom +
          Math.sin(crackAngle) * crackLength * 0.35 * zoom;
        const endX =
          sX +
          Math.cos(crackAngle) * crackLength * zoom +
          Math.cos(i * 2 + time * 3) * 8 * zoom;
        const endY =
          screenPos.y +
          5 * zoom +
          Math.sin(crackAngle) * crackLength * 0.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(sX, screenPos.y + 5 * zoom);
        ctx.lineTo(seg1X, seg1Y);
        ctx.lineTo(seg2X, seg2Y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        if (i % 2 === 0 && groundCrackPhase > 0.3) {
          const branchAlpha = crackAlpha * 0.5;
          ctx.strokeStyle = `${mainColor} ${branchAlpha})`;
          ctx.lineWidth = 1 * zoom;
          const branchAngle = crackAngle + (i % 3 === 0 ? 0.3 : -0.3);
          ctx.beginPath();
          ctx.moveTo(seg1X, seg1Y);
          ctx.lineTo(
            seg1X + Math.cos(branchAngle) * crackLength * 0.25 * zoom,
            seg1Y + Math.sin(branchAngle) * crackLength * 0.12 * zoom,
          );
          ctx.stroke();
          ctx.lineWidth = 2 * zoom;
        }
      }
      ctx.fillStyle = `rgba(${glowColor}, ${(1 - groundCrackPhase) * 0.5})`;
      for (let i = 0; i < 6; i++) {
        const markAngle = (i / 6) * Math.PI * 2;
        const markR = (15 + groundCrackPhase * 30) * zoom;
        ctx.beginPath();
        ctx.arc(
          sX + Math.cos(markAngle) * markR,
          screenPos.y + 5 * zoom + Math.sin(markAngle) * markR * 0.5,
          2 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    for (let i = 0; i < 10; i++) {
      const debrisAngle = (i / 10) * Math.PI * 2 + time * 0.5;
      const debrisPhase = (groundShockwave + i * 0.08) % 1;
      const debrisRadius = 15 + debrisPhase * 50;
      const debrisHeight = Math.sin(debrisPhase * Math.PI) * 35;
      const debrisAlpha = (1 - debrisPhase) * 0.8;
      const dxPos = sX + Math.cos(debrisAngle) * debrisRadius * zoom;
      const dyPos =
        screenPos.y +
        5 * zoom +
        Math.sin(debrisAngle) * debrisRadius * 0.5 * zoom -
        debrisHeight * zoom;
      ctx.fillStyle = `rgba(100, 80, 60, ${debrisAlpha})`;
      ctx.beginPath();
      ctx.arc(dxPos, dyPos, (2 + (i % 3)) * zoom, 0, Math.PI * 2);
      ctx.fill();
      if (i % 2 === 0) {
        ctx.fillStyle = `rgba(${glowColor}, ${debrisAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(dxPos + 1 * zoom, dyPos - 1 * zoom, 1 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let dc = 0; dc < 4; dc++) {
      const dustAngle = (dc / 4) * Math.PI * 2 + 0.4;
      const dustPhase = Math.max(0, groundShockwave - dc * 0.05);
      if (dustPhase > 0) {
        const dustH = dustPhase * 25 * zoom;
        const dustAlpha = (1 - dustPhase) * 0.25;
        const dustX = sX + Math.cos(dustAngle) * 12 * zoom;
        const dustBaseY =
          screenPos.y + 5 * zoom + Math.sin(dustAngle) * 6 * zoom;
        const dustGrad = ctx.createLinearGradient(
          dustX,
          dustBaseY,
          dustX,
          dustBaseY - dustH,
        );
        dustGrad.addColorStop(0, `rgba(140, 120, 100, ${dustAlpha})`);
        dustGrad.addColorStop(1, `rgba(140, 120, 100, 0)`);
        ctx.fillStyle = dustGrad;
        ctx.fillRect(dustX - 3 * zoom, dustBaseY - dustH, 6 * zoom, dustH);
      }
    }

    for (let pg = 0; pg < 8; pg++) {
      const pagePhase = (groundShockwave + pg * 0.1) % 1;
      if (pagePhase < 0.9) {
        const pageAngle = (pg / 8) * Math.PI * 2 + time * 2;
        const pageRadius = 10 + pagePhase * 45;
        const pageHeight = Math.sin(pagePhase * Math.PI) * 40;
        const pageAlpha = (1 - pagePhase) * 0.7;
        const pageSpin = time * 5 + pg * 1.3;
        const pgX = sX + Math.cos(pageAngle) * pageRadius * zoom;
        const pgY =
          screenPos.y +
          5 * zoom +
          Math.sin(pageAngle) * pageRadius * 0.4 * zoom -
          pageHeight * zoom;
        ctx.save();
        ctx.translate(pgX, pgY);
        ctx.rotate(pageSpin);
        ctx.fillStyle = `rgba(230, 220, 200, ${pageAlpha})`;
        ctx.fillRect(-3 * zoom, -2 * zoom, 6 * zoom, 4 * zoom);
        ctx.fillStyle = `rgba(60, 40, 20, ${pageAlpha * 0.5})`;
        ctx.fillRect(-2 * zoom, -1 * zoom, 4 * zoom, 0.5 * zoom);
        ctx.fillRect(-2 * zoom, 0.5 * zoom, 3 * zoom, 0.5 * zoom);
        ctx.restore();
      }
    }
  }

  // Lower tower body
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseWidth,
    lowerBodyHeight,
    {
      top: "#6a5a4a",
      left: "#5a4a3a",
      right: "#4a3a2a",
      leftBack: "#7a6a5a",
      rightBack: "#6a5a4a",
    },
    zoom,
  );

  // ========== BASE RAILING (3D isometric ring) ==========
  drawIsometricRailing(
    ctx,
    screenPos.x,
    screenPos.y + 2 * zoom,
    w * 1.05,
    d * 1.05,
    5 * zoom,
    32,
    16,
    {
      rail: "#4a3a2a",
      topRail: "#6a5a4a",
      backPanel: "rgba(90, 74, 58, 0.35)",
      frontPanel: "rgba(90, 74, 58, 0.25)",
    },
    zoom,
  );

  // Stone block pattern on lower body — flush isometric mortar joints
  const bodyH = lowerBodyHeight * zoom;
  const numMortarRows = tower.level === 1 ? 3 : 5;
  ctx.lineWidth = 1 * zoom;

  // Wall texturing — subtle stone block fills on each face
  for (let row = 0; row <= numMortarRows; row++) {
    const frac1 = row / (numMortarRows + 1);
    const frac2 = (row + 1) / (numMortarRows + 1);
    const stagger = row % 2 === 0 ? 0 : 1 / 6;
    for (let col = 0; col < 3; col++) {
      const u1 = Math.max(0, col / 3 + stagger);
      const u2 = Math.min(1, (col + 1) / 3 + stagger);
      if (u1 >= u2) continue;

      const shade = (row * 3 + col) % 3;
      const alpha = shade === 0 ? 0.05 : shade === 1 ? 0.08 : 0.03;
      const tint =
        shade === 0
          ? "138, 122, 106"
          : shade === 1
            ? "74, 58, 42"
            : "100, 84, 68";

      // Left face block (parallelogram flush with wall)
      ctx.fillStyle = `rgba(${tint}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(sX - w * (1 - u1), screenPos.y + u1 * d - frac1 * bodyH);
      ctx.lineTo(sX - w * (1 - u2), screenPos.y + u2 * d - frac1 * bodyH);
      ctx.lineTo(sX - w * (1 - u2), screenPos.y + u2 * d - frac2 * bodyH);
      ctx.lineTo(sX - w * (1 - u1), screenPos.y + u1 * d - frac2 * bodyH);
      ctx.closePath();
      ctx.fill();

      // Right face block (mirrored)
      ctx.beginPath();
      ctx.moveTo(sX + w * (1 - u1), screenPos.y + u1 * d - frac1 * bodyH);
      ctx.lineTo(sX + w * (1 - u2), screenPos.y + u2 * d - frac1 * bodyH);
      ctx.lineTo(sX + w * (1 - u2), screenPos.y + u2 * d - frac2 * bodyH);
      ctx.lineTo(sX + w * (1 - u1), screenPos.y + u1 * d - frac2 * bodyH);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Horizontal mortar lines (flush edge-to-edge)
  for (let row = 1; row <= numMortarRows; row++) {
    const frac = row / (numMortarRows + 1);
    const yEdge = screenPos.y - frac * bodyH;

    // Left face — dark mortar groove
    ctx.strokeStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.moveTo(sX - w, yEdge);
    ctx.lineTo(sX, yEdge + d);
    ctx.stroke();
    // Left face — lighter upper highlight
    ctx.strokeStyle = "rgba(120, 100, 80, 0.25)";
    ctx.beginPath();
    ctx.moveTo(sX - w, yEdge - 1 * zoom);
    ctx.lineTo(sX, yEdge + d - 1 * zoom);
    ctx.stroke();

    // Right face — dark mortar groove
    ctx.strokeStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.moveTo(sX, yEdge + d);
    ctx.lineTo(sX + w, yEdge);
    ctx.stroke();
    // Right face — lighter upper highlight
    ctx.strokeStyle = "rgba(120, 100, 80, 0.25)";
    ctx.beginPath();
    ctx.moveTo(sX, yEdge + d - 1 * zoom);
    ctx.lineTo(sX + w, yEdge - 1 * zoom);
    ctx.stroke();
  }

  // Vertical mortar joints (staggered per row for ashlar bond)
  ctx.strokeStyle = "#2a1a0a";
  for (let row = 0; row <= numMortarRows; row++) {
    const frac1 = row / (numMortarRows + 1);
    const frac2 = (row + 1) / (numMortarRows + 1);
    const stagger = row % 2 === 0 ? 0.0 : 1 / 6;
    for (let col = 1; col < 3; col++) {
      const u = col / 3 + stagger;
      if (u > 0.95 || u < 0.05) continue;

      // Left face vertical joint
      const ljX = sX - w * (1 - u);
      ctx.beginPath();
      ctx.moveTo(ljX, screenPos.y + u * d - frac1 * bodyH);
      ctx.lineTo(ljX, screenPos.y + u * d - frac2 * bodyH);
      ctx.stroke();

      // Right face vertical joint (mirrored)
      const rjX = sX + w * (1 - u);
      ctx.beginPath();
      ctx.moveTo(rjX, screenPos.y + u * d - frac1 * bodyH);
      ctx.lineTo(rjX, screenPos.y + u * d - frac2 * bodyH);
      ctx.stroke();
    }
  }

  // Left-face weathering gradient (rain stain effect)
  const leftWeatherGrad = ctx.createLinearGradient(
    sX - w,
    screenPos.y - bodyH,
    sX,
    screenPos.y,
  );
  leftWeatherGrad.addColorStop(0, "rgba(30, 20, 10, 0.12)");
  leftWeatherGrad.addColorStop(0.5, "rgba(30, 20, 10, 0.04)");
  leftWeatherGrad.addColorStop(1, "rgba(30, 20, 10, 0)");
  ctx.fillStyle = leftWeatherGrad;
  ctx.beginPath();
  ctx.moveTo(sX, screenPos.y + d);
  ctx.lineTo(sX - w, screenPos.y);
  ctx.lineTo(sX - w, screenPos.y - bodyH);
  ctx.lineTo(sX, screenPos.y - bodyH + d);
  ctx.closePath();
  ctx.fill();

  // Mystical wall runes on lower body
  const wallRuneGlow = 0.4 + Math.sin(time * 2.5) * 0.2 + attackPulse * 0.4;
  ctx.fillStyle = `rgba(${glowColor}, ${wallRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 5 * zoom;
  ctx.font = `${8 * zoom}px serif`;
  const wallRunes = ["ᛟ", "ᛞ", "ᛒ"];
  for (let i = 0; i < 3; i++) {
    const runeX = screenPos.x + (i - 1) * 10 * zoom;
    const runeY = screenPos.y - lowerBodyHeight * zoom * 0.3;
    ctx.fillText(wallRunes[i], runeX, runeY);
  }
  ctx.shadowBlur = 0;

  // ========== ORNATE WALL LANTERNS WITH ARCANE CHAINS ==========
  const sconcePosns: { x: number; y: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const side = i < 2 ? -1 : 1;
    const idx = i % 2;
    const scX = screenPos.x + side * w * (0.45 + idx * 0.3);
    const scY = screenPos.y - lowerBodyHeight * zoom * (0.2 + idx * 0.35);
    sconcePosns.push({ x: scX, y: scY });

    const lanternTipX = scX + side * 5 * zoom;

    // Ornate wall mount plate
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.moveTo(scX - side * 0.5 * zoom, scY - 2.5 * zoom);
    ctx.lineTo(scX - side * 0.5 * zoom, scY + 2.5 * zoom);
    ctx.lineTo(scX + side * 1.5 * zoom, scY + 2 * zoom);
    ctx.lineTo(scX + side * 1.5 * zoom, scY - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Curved iron bracket arm
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(scX + side * 1 * zoom, scY);
    ctx.quadraticCurveTo(
      scX + side * 3 * zoom,
      scY - 4 * zoom,
      lanternTipX,
      scY - 1 * zoom,
    );
    ctx.stroke();
    // Scroll flourish at bracket end
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(
      scX + side * 1 * zoom,
      scY - 1.5 * zoom,
      1 * zoom,
      0,
      Math.PI * 1.2,
    );
    ctx.stroke();

    // Lantern cage (hexagonal)
    const lx = lanternTipX;
    const ly = scY;
    const lSize = 2.5 * zoom;

    // Lantern top cap
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(lx, ly - lSize * 1.8);
    ctx.lineTo(lx - lSize, ly - lSize * 1.2);
    ctx.lineTo(lx + lSize, ly - lSize * 1.2);
    ctx.closePath();
    ctx.fill();

    // Lantern body (glass panels)
    ctx.fillStyle = "rgba(60, 40, 20, 0.6)";
    ctx.fillRect(lx - lSize, ly - lSize * 1.2, lSize * 2, lSize * 2);

    // Lantern glass frame struts
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 0.6 * zoom;
    ctx.strokeRect(lx - lSize, ly - lSize * 1.2, lSize * 2, lSize * 2);
    ctx.beginPath();
    ctx.moveTo(lx, ly - lSize * 1.2);
    ctx.lineTo(lx, ly + lSize * 0.8);
    ctx.stroke();

    // Lantern bottom finial
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(lx, ly + lSize * 1.2);
    ctx.lineTo(lx - lSize * 0.5, ly + lSize * 0.8);
    ctx.lineTo(lx + lSize * 0.5, ly + lSize * 0.8);
    ctx.closePath();
    ctx.fill();

    // Flame inside lantern
    const flameFlicker =
      0.5 +
      Math.sin(time * 8 + i * 2.3) * 0.2 +
      Math.sin(time * 12.7 + i * 1.1) * 0.1;
    ctx.fillStyle = `rgba(255, 200, 100, ${flameFlicker})`;
    ctx.shadowColor = "rgba(255, 180, 80, 0.6)";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      lx,
      ly - lSize * 0.2,
      lSize * 0.5,
      lSize * 0.8,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Hot core
    ctx.fillStyle = `rgba(255, 255, 220, ${flameFlicker * 0.7})`;
    ctx.beginPath();
    ctx.ellipse(
      lx,
      ly - lSize * 0.3,
      lSize * 0.2,
      lSize * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Light spill on wall
    const spillGrad = ctx.createRadialGradient(
      scX + side * 2 * zoom,
      scY,
      0,
      scX + side * 2 * zoom,
      scY,
      6 * zoom,
    );
    spillGrad.addColorStop(0, `rgba(255, 200, 120, ${flameFlicker * 0.12})`);
    spillGrad.addColorStop(1, "rgba(255, 200, 120, 0)");
    ctx.fillStyle = spillGrad;
    ctx.fillRect(scX - 6 * zoom, scY - 6 * zoom, 12 * zoom, 12 * zoom);
  }

  // Arcane chains of light connecting lanterns on each side
  for (let side = 0; side < 2; side++) {
    const s0 = sconcePosns[side * 2];
    const s1 = sconcePosns[side * 2 + 1];
    const dir = side === 0 ? -1 : 1;
    const chainGlow =
      0.25 + Math.sin(time * 3 + side) * 0.15 + attackPulse * 0.3;

    // Main catenary chain
    ctx.strokeStyle = `rgba(${glowColor}, ${chainGlow})`;
    ctx.lineWidth = 1 * zoom;
    ctx.setLineDash([3 * zoom, 3 * zoom]);
    const ch0X = s0.x + dir * 5 * zoom;
    const ch1X = s1.x + dir * 5 * zoom;
    const midX = (ch0X + ch1X) / 2 + dir * 4 * zoom;
    const midY =
      (s0.y + s1.y) / 2 + 8 * zoom + Math.sin(time * 2 + side) * 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(ch0X, s0.y);
    ctx.quadraticCurveTo(midX, midY, ch1X, s1.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Second parallel chain (thinner)
    ctx.strokeStyle = `rgba(${glowColor}, ${chainGlow * 0.4})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.setLineDash([2 * zoom, 4 * zoom]);
    ctx.beginPath();
    ctx.moveTo(ch0X, s0.y + 2 * zoom);
    ctx.quadraticCurveTo(midX, midY + 3 * zoom, ch1X, s1.y + 2 * zoom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Travelling spark along main chain
    const sparkT = (time * 1.5 + side * 0.5) % 1;
    const sparkX =
      ch0X * (1 - sparkT) * (1 - sparkT) +
      midX * 2 * sparkT * (1 - sparkT) +
      ch1X * sparkT * sparkT;
    const sparkY =
      s0.y * (1 - sparkT) * (1 - sparkT) +
      midY * 2 * sparkT * (1 - sparkT) +
      s1.y * sparkT * sparkT;
    ctx.fillStyle = `rgba(${glowColor}, ${0.7 + Math.sin(time * 10) * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Trailing spark particles
    for (let tp = 1; tp <= 3; tp++) {
      const trailT = (sparkT - tp * 0.04 + 1) % 1;
      const tpX =
        ch0X * (1 - trailT) * (1 - trailT) +
        midX * 2 * trailT * (1 - trailT) +
        ch1X * trailT * trailT;
      const tpY =
        s0.y * (1 - trailT) * (1 - trailT) +
        midY * 2 * trailT * (1 - trailT) +
        s1.y * trailT * trailT;
      ctx.fillStyle = `rgba(${glowColor}, ${0.5 - tp * 0.12})`;
      ctx.beginPath();
      ctx.arc(tpX, tpY, (1.2 - tp * 0.2) * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // ========== ROSE WINDOW (stained glass) on front face ==========
  const roseY = screenPos.y - lowerBodyHeight * zoom * 0.65;
  const roseRadius = 7 * zoom;
  const roseGlow = 0.5 + Math.sin(time * 1.8) * 0.2 + attackPulse * 0.3;

  // Outer stone frame with molding
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius + 2 * zoom, 0, Math.PI * 2);
  ctx.stroke();
  // Inner frame
  ctx.strokeStyle = "#5a4a3a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius + 0.5 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Background glow
  ctx.fillStyle = `rgba(${glowColor}, ${roseGlow * 0.4})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Stained glass colored segments
  const stainedColors = [
    "rgba(180, 50, 50, 0.35)",
    "rgba(50, 50, 180, 0.35)",
    "rgba(50, 150, 50, 0.35)",
    "rgba(180, 150, 50, 0.35)",
    "rgba(150, 50, 150, 0.35)",
    "rgba(50, 150, 150, 0.35)",
    "rgba(180, 80, 50, 0.35)",
    "rgba(80, 50, 180, 0.35)",
  ];
  for (let petal = 0; petal < 8; petal++) {
    const a0 = (petal / 8) * Math.PI * 2;
    const a1 = ((petal + 1) / 8) * Math.PI * 2;

    // Outer petal segment (colored glass)
    ctx.fillStyle = stainedColors[petal];
    ctx.beginPath();
    ctx.moveTo(screenPos.x, roseY);
    ctx.arc(screenPos.x, roseY, roseRadius, a0, a1);
    ctx.closePath();
    ctx.fill();
  }

  // Gothic tracery (stone mullions)
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 0.8 * zoom;
  for (let petal = 0; petal < 8; petal++) {
    const petalAngle = (petal / 8) * Math.PI * 2;

    // Radial spoke
    ctx.beginPath();
    ctx.moveTo(screenPos.x, roseY);
    ctx.lineTo(
      screenPos.x + Math.cos(petalAngle) * roseRadius,
      roseY + Math.sin(petalAngle) * roseRadius,
    );
    ctx.stroke();

    // Inner trefoil arcs between spokes
    const midAngle = petalAngle + Math.PI / 8;
    const innerR = roseRadius * 0.55;
    ctx.beginPath();
    ctx.arc(
      screenPos.x + Math.cos(midAngle) * innerR * 0.5,
      roseY + Math.sin(midAngle) * innerR * 0.5,
      innerR * 0.4,
      midAngle - Math.PI * 0.5,
      midAngle + Math.PI * 0.5,
    );
    ctx.stroke();

    // Outer cusps between spokes
    const cuspAngle = midAngle;
    const cuspR = roseRadius * 0.78;
    ctx.beginPath();
    ctx.arc(
      screenPos.x + Math.cos(cuspAngle) * cuspR,
      roseY + Math.sin(cuspAngle) * cuspR,
      roseRadius * 0.18,
      cuspAngle + Math.PI * 0.3,
      cuspAngle + Math.PI * 1.7,
    );
    ctx.stroke();
  }

  // Inner ring (middle stone circle)
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // Center gem with faceted highlight
  ctx.fillStyle = `rgba(${glowColor}, ${roseGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 5 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Gem highlight
  ctx.fillStyle = `rgba(255, 255, 255, ${roseGlow * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x - 0.5 * zoom,
    roseY - 0.5 * zoom,
    1 * zoom,
    0.6 * zoom,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Sequentially appearing/fading arcane glyphs on walls
  const glyphSymbols = ["⊕", "⊗", "⊙", "◈", "◇", "△"];
  ctx.font = `${6 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 6; i++) {
    const glyphCycle = (time * 0.4 + i * 0.6) % (glyphSymbols.length * 0.6);
    const glyphFade =
      Math.max(0, 1 - Math.abs(glyphCycle - i * 0.6) * 2.5) *
      (0.6 + attackPulse * 0.4);
    if (glyphFade <= 0) continue;

    const side = i < 3 ? -1 : 1;
    const idx = i % 3;
    const gx = screenPos.x + side * (w * 0.3 + idx * w * 0.2);
    const gy = screenPos.y - lowerBodyHeight * zoom * (0.15 + idx * 0.22);

    ctx.fillStyle = `rgba(${glowColor}, ${glyphFade})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom * glyphFade;
    ctx.fillText(glyphSymbols[i], gx, gy);
  }
  ctx.shadowBlur = 0;

  // ========== GRAND ENTRANCE DOORWAY ==========
  const entranceX = screenPos.x;
  const entranceY = screenPos.y - 2 * zoom;
  const doorW = 6 * zoom;
  const doorH = 12 * zoom;

  // Stone step at entrance base
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW - 2 * zoom, entranceY + 1 * zoom);
  ctx.lineTo(entranceX, entranceY + 3 * zoom);
  ctx.lineTo(entranceX + doorW + 2 * zoom, entranceY + 1 * zoom);
  ctx.lineTo(entranceX, entranceY - 1 * zoom);
  ctx.closePath();
  ctx.fill();
  // Step front edge
  ctx.fillStyle = "#4a3a2a";
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW - 2 * zoom, entranceY + 1 * zoom);
  ctx.lineTo(entranceX, entranceY + 3 * zoom);
  ctx.lineTo(entranceX, entranceY + 5 * zoom);
  ctx.lineTo(entranceX - doorW - 2 * zoom, entranceY + 3 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.moveTo(entranceX, entranceY + 3 * zoom);
  ctx.lineTo(entranceX + doorW + 2 * zoom, entranceY + 1 * zoom);
  ctx.lineTo(entranceX + doorW + 2 * zoom, entranceY + 3 * zoom);
  ctx.lineTo(entranceX, entranceY + 5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Deep door recess (shadow)
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW, entranceY);
  ctx.lineTo(entranceX - doorW, entranceY - doorH * 0.6);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.2,
    entranceX + doorW,
    entranceY - doorH * 0.6,
  );
  ctx.lineTo(entranceX + doorW, entranceY);
  ctx.closePath();
  ctx.fill();

  // Outer archivolt (ornate arch molding)
  ctx.strokeStyle = "#6a5a4a";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW - 1.5 * zoom, entranceY);
  ctx.lineTo(entranceX - doorW - 1.5 * zoom, entranceY - doorH * 0.55);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.3,
    entranceX + doorW + 1.5 * zoom,
    entranceY - doorH * 0.55,
  );
  ctx.lineTo(entranceX + doorW + 1.5 * zoom, entranceY);
  ctx.stroke();

  // Inner archivolt
  ctx.strokeStyle = "#5a4a3a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW + 0.5 * zoom, entranceY);
  ctx.lineTo(entranceX - doorW + 0.5 * zoom, entranceY - doorH * 0.58);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.15,
    entranceX + doorW - 0.5 * zoom,
    entranceY - doorH * 0.58,
  );
  ctx.lineTo(entranceX + doorW - 0.5 * zoom, entranceY);
  ctx.stroke();

  // Keystone at arch apex
  ctx.fillStyle = "#7a6a5a";
  ctx.beginPath();
  ctx.moveTo(entranceX, entranceY - doorH * 0.95);
  ctx.lineTo(entranceX - 2.5 * zoom, entranceY - doorH * 0.82);
  ctx.lineTo(entranceX + 2.5 * zoom, entranceY - doorH * 0.82);
  ctx.closePath();
  ctx.fill();
  // Gold inlay on keystone
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(entranceX, entranceY - doorH * 0.87, 1 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Warm interior glow through door
  const doorGlow = 0.4 + Math.sin(time * 6) * 0.1 + Math.sin(time * 9.3) * 0.08;
  const doorGrad = ctx.createRadialGradient(
    entranceX,
    entranceY - doorH * 0.4,
    0,
    entranceX,
    entranceY - doorH * 0.4,
    doorW * 1.2,
  );
  doorGrad.addColorStop(0, `rgba(255, 200, 120, ${doorGlow})`);
  doorGrad.addColorStop(0.6, `rgba(255, 160, 60, ${doorGlow * 0.5})`);
  doorGrad.addColorStop(1, `rgba(200, 100, 30, 0)`);
  ctx.fillStyle = doorGrad;
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW + 1.5 * zoom, entranceY);
  ctx.lineTo(entranceX - doorW + 1.5 * zoom, entranceY - doorH * 0.55);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.1,
    entranceX + doorW - 1.5 * zoom,
    entranceY - doorH * 0.55,
  );
  ctx.lineTo(entranceX + doorW - 1.5 * zoom, entranceY);
  ctx.closePath();
  ctx.fill();

  // Iron-bound door panels (visible inside arch)
  ctx.strokeStyle = "rgba(80, 60, 40, 0.4)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(entranceX, entranceY);
  ctx.lineTo(entranceX, entranceY - doorH * 0.75);
  ctx.stroke();
  // Iron strap hinges
  for (let h = 0; h < 3; h++) {
    const hingeY = entranceY - doorH * (0.15 + h * 0.22);
    ctx.strokeStyle = "rgba(60, 50, 40, 0.5)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(entranceX - doorW + 2 * zoom, hingeY);
    ctx.lineTo(entranceX - 1 * zoom, hingeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(entranceX + 1 * zoom, hingeY);
    ctx.lineTo(entranceX + doorW - 2 * zoom, hingeY);
    ctx.stroke();
  }

  // Torch brackets with ornate ironwork
  for (const tSide of [-1, 1]) {
    const torchX = entranceX + tSide * (doorW + 4 * zoom);
    const torchY = entranceY - doorH * 0.5;

    // Wall plate
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(torchX - 1.5 * zoom, torchY + 1 * zoom, 3 * zoom, 4 * zoom);

    // Ornate bracket arm (curved iron)
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(torchX, torchY + 3 * zoom);
    ctx.quadraticCurveTo(
      torchX + tSide * 3 * zoom,
      torchY - 1 * zoom,
      torchX + tSide * 1 * zoom,
      torchY - 3 * zoom,
    );
    ctx.stroke();

    // Torch bowl (cup shape)
    ctx.fillStyle = "#6a5a3a";
    ctx.beginPath();
    ctx.moveTo(torchX + tSide * 0 * zoom - 2.5 * zoom, torchY - 2 * zoom);
    ctx.lineTo(torchX + tSide * 0 * zoom + 2.5 * zoom, torchY - 2 * zoom);
    ctx.lineTo(torchX + tSide * 0 * zoom + 2 * zoom, torchY - 4 * zoom);
    ctx.lineTo(torchX + tSide * 0 * zoom - 2 * zoom, torchY - 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Animated flame (multi-layer)
    const fl1 = Math.sin(time * 10 + tSide * 3) * 0.15;
    const fl2 = Math.sin(time * 14 + tSide * 5) * 0.1;
    const flameH = (5 + Math.sin(time * 8 + tSide) * 1.5) * zoom;

    // Outer flame glow
    ctx.fillStyle = `rgba(255, 150, 50, ${0.3 + fl1 * 0.5})`;
    ctx.shadowColor = "rgba(255, 180, 50, 0.6)";
    ctx.shadowBlur = 10 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      torchX,
      torchY - 5 * zoom,
      3.5 * zoom,
      flameH * 0.7,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Main flame body
    ctx.fillStyle = `rgba(255, 220, 100, ${0.8 + fl1})`;
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(torchX - 2 * zoom, torchY - 4 * zoom);
    ctx.quadraticCurveTo(
      torchX + fl2 * zoom * 4,
      torchY - flameH - 2 * zoom,
      torchX,
      torchY - flameH - 4 * zoom,
    );
    ctx.quadraticCurveTo(
      torchX - fl2 * zoom * 3,
      torchY - flameH - 2 * zoom,
      torchX + 2 * zoom,
      torchY - 4 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Inner hot core
    ctx.fillStyle = `rgba(255, 255, 200, ${0.6 + fl2})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(torchX - 1 * zoom, torchY - 4.5 * zoom);
    ctx.quadraticCurveTo(
      torchX,
      torchY - flameH * 0.5 - 2 * zoom,
      torchX,
      torchY - flameH * 0.6 - 3 * zoom,
    );
    ctx.quadraticCurveTo(
      torchX,
      torchY - flameH * 0.5 - 2 * zoom,
      torchX + 1 * zoom,
      torchY - 4.5 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Smoke wisp above flame
    const smokePhase = (time * 2 + tSide * 1.5) % 3;
    if (smokePhase < 2) {
      const smokeAlpha = 0.1 * (1 - smokePhase / 2);
      const smokeY2 = torchY - flameH - 6 * zoom - smokePhase * 8 * zoom;
      ctx.fillStyle = `rgba(120, 110, 100, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        torchX + Math.sin(time * 3 + tSide) * 2 * zoom,
        smokeY2,
        2 * zoom * (1 + smokePhase * 0.3),
        1.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Flying buttresses (Gothic supports) with 3D isometric depth
  for (const side of [-1, 1]) {
    const bx = screenPos.x + side * w * 0.85;
    const bxOuter = screenPos.x + side * w * 1.15;
    const bTop = screenPos.y - lowerBodyHeight * zoom;

    // Buttress side face (3D depth)
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.moveTo(bxOuter, screenPos.y + d * 0.45);
    ctx.lineTo(bxOuter + side * 3 * zoom, screenPos.y + d * 0.5);
    ctx.lineTo(bxOuter + side * 3 * zoom, bTop + d * 0.3);
    ctx.lineTo(bxOuter, bTop + d * 0.25);
    ctx.closePath();
    ctx.fill();

    // Buttress front face
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.moveTo(bx, screenPos.y + d * 0.35);
    ctx.lineTo(bxOuter, screenPos.y + d * 0.45);
    ctx.lineTo(bxOuter, bTop + d * 0.25);
    ctx.lineTo(bx, bTop + d * 0.15);
    ctx.closePath();
    ctx.fill();

    // Buttress stone course lines
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 0.7 * zoom;
    for (let row = 0; row < 4; row++) {
      const rowFrac = row / 4;
      const rowY =
        screenPos.y +
        d * 0.35 -
        rowFrac * (screenPos.y + d * 0.35 - bTop - d * 0.15);
      ctx.beginPath();
      ctx.moveTo(bx, rowY);
      ctx.lineTo(bxOuter, rowY + d * 0.1);
      ctx.stroke();
    }

    // Buttress pinnacle cap (3D pointed)
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 1.0, bTop - 6 * zoom);
    ctx.lineTo(bx, bTop + d * 0.1);
    ctx.lineTo(bxOuter, bTop + d * 0.2);
    ctx.lineTo(bxOuter + side * 3 * zoom, bTop + d * 0.25);
    ctx.closePath();
    ctx.fill();

    // Pinnacle finial on buttress
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.moveTo(screenPos.x + side * w * 1.0, bTop - 10 * zoom);
    ctx.lineTo(screenPos.x + side * w * 0.95, bTop - 5 * zoom);
    ctx.lineTo(screenPos.x + side * w * 1.05, bTop - 5 * zoom);
    ctx.closePath();
    ctx.fill();

    // Flying arch support (double arch for Gothic feel)
    ctx.strokeStyle = "#4a3a2a";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + side * w * 1.1,
      screenPos.y - lowerBodyHeight * zoom * 0.5,
    );
    ctx.quadraticCurveTo(
      screenPos.x + side * w * 1.3,
      screenPos.y - lowerBodyHeight * zoom * 0.8,
      screenPos.x + side * w * 0.9,
      bTop - 2 * zoom,
    );
    ctx.stroke();

    // Secondary lower arch
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + side * w * 1.1,
      screenPos.y - lowerBodyHeight * zoom * 0.2,
    );
    ctx.quadraticCurveTo(
      screenPos.x + side * w * 1.25,
      screenPos.y - lowerBodyHeight * zoom * 0.45,
      screenPos.x + side * w * 0.95,
      screenPos.y - lowerBodyHeight * zoom * 0.6,
    );
    ctx.stroke();

    // Buttress rune orb
    const buttressGlow =
      0.5 + Math.sin(time * 3 + side * 2) * 0.25 + attackPulse * 0.4;
    ctx.fillStyle = `rgba(${glowColor}, ${buttressGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom * buttressGlow;
    ctx.beginPath();
    ctx.arc(
      screenPos.x + side * w * 1.0,
      screenPos.y - lowerBodyHeight * zoom * 0.6,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Energy pulse through buttresses during attack
    if (attackPulse > 0.05) {
      const pulseT = (time * 6) % 1;
      const pulseY = screenPos.y - lowerBodyHeight * zoom * pulseT;
      const pulseAlpha = attackPulse * (1 - Math.abs(pulseT - 0.5) * 2) * 0.8;
      ctx.fillStyle = `rgba(${glowColor}, ${pulseAlpha})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + side * w * 1.0,
        pulseY,
        4 * zoom,
        2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Gargoyle sculpture at buttress top
    const gargoyleX = screenPos.x + side * w * 1.15;
    const gargoyleY = bTop + 2 * zoom;

    // Gargoyle body
    ctx.fillStyle = "#5a5a5a";
    ctx.beginPath();
    ctx.ellipse(
      gargoyleX + side * 2 * zoom,
      gargoyleY,
      4 * zoom,
      2.5 * zoom,
      side * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Gargoyle head
    ctx.fillStyle = "#6a6a6a";
    ctx.beginPath();
    ctx.arc(
      gargoyleX + side * 5 * zoom,
      gargoyleY - 1.5 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Gargoyle horns
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(gargoyleX + side * 4 * zoom, gargoyleY - 3 * zoom);
    ctx.lineTo(gargoyleX + side * 3 * zoom, gargoyleY - 6 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gargoyleX + side * 6 * zoom, gargoyleY - 3 * zoom);
    ctx.lineTo(gargoyleX + side * 7 * zoom, gargoyleY - 6 * zoom);
    ctx.stroke();

    // Gargoyle wings (folded)
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.moveTo(gargoyleX + side * 1 * zoom, gargoyleY - 1 * zoom);
    ctx.quadraticCurveTo(
      gargoyleX - side * 1 * zoom,
      gargoyleY - 5 * zoom,
      gargoyleX + side * 3 * zoom,
      gargoyleY - 3 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Gargoyle eyes glow during attack
    const gargoyleEyeGlow = attackPulse * 1.5;
    if (gargoyleEyeGlow > 0.05) {
      ctx.fillStyle = `rgba(255, 50, 50, ${Math.min(1, gargoyleEyeGlow)})`;
      ctx.shadowColor = "rgba(255, 50, 50, 0.8)";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.arc(
        gargoyleX + side * 4.5 * zoom,
        gargoyleY - 2 * zoom,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        gargoyleX + side * 6 * zoom,
        gargoyleY - 2 * zoom,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Gothic pinnacles on roof corners
  for (const corner of [0, 1, 2, 3]) {
    const pSide = corner < 2 ? -1 : 1;
    const pDepth = corner % 2 === 0 ? -1 : 1;
    const pinnX = screenPos.x + pSide * w * 0.75;
    const pinnBaseY = screenPos.y - lowerBodyHeight * zoom + pDepth * d * 0.3;

    // Pinnacle shaft
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.moveTo(pinnX - 2 * zoom, pinnBaseY);
    ctx.lineTo(pinnX + 2 * zoom, pinnBaseY);
    ctx.lineTo(pinnX + 1.5 * zoom, pinnBaseY - 10 * zoom);
    ctx.lineTo(pinnX - 1.5 * zoom, pinnBaseY - 10 * zoom);
    ctx.closePath();
    ctx.fill();

    // Pinnacle pointed tip
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnBaseY - 16 * zoom);
    ctx.lineTo(pinnX - 2.5 * zoom, pinnBaseY - 9 * zoom);
    ctx.lineTo(pinnX + 2.5 * zoom, pinnBaseY - 9 * zoom);
    ctx.closePath();
    ctx.fill();

    // Crocket (decorative knob) on pinnacle
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(pinnX, pinnBaseY - 16.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Small side crockets
    ctx.fillStyle = "#b89020";
    ctx.beginPath();
    ctx.arc(
      pinnX - 1.8 * zoom,
      pinnBaseY - 12 * zoom,
      0.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      pinnX + 1.8 * zoom,
      pinnBaseY - 12 * zoom,
      0.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Pinnacle glow during attack
    if (attackPulse > 0.05) {
      ctx.fillStyle = `rgba(${glowColor}, ${attackPulse * 0.6})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.arc(pinnX, pinnBaseY - 14 * zoom, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Gothic windows on lower body (flush with left/right faces)
  const windowYBase = screenPos.y - lowerBodyHeight * zoom * 0.25;
  const glowIntensity = 0.5 + Math.sin(time * 2) * 0.3 + attackPulse;
  const libraryWindowColors = {
    frame: "#3a2a1a",
    void: `${mainColor} ${glowIntensity * 0.9})`,
    sill: "#3a2a1a",
  };
  const isUpgraded = tower.level === 4 && !!tower.upgrade;

  if (isUpgraded) {
    // Two windows per side for EQ Smasher / Blizzard towers — spread toward edges
    const twinW = 3.5;
    const twinH = 8;
    drawIsoGothicWindow(ctx, sX - w * 0.82, windowYBase + 0.18 * d, twinW, twinH, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX - w * 0.18, windowYBase + 0.82 * d, twinW, twinH, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + w * 0.82, windowYBase + 0.18 * d, twinW, twinH, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + w * 0.18, windowYBase + 0.82 * d, twinW, twinH, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
  } else {
    drawIsoGothicWindow(ctx, sX - w * 0.5, windowYBase + 0.5 * d, 5, 10, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + w * 0.5, windowYBase + 0.5 * d, 5, 10, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
  }

  // Piston plate/anvil
  const plateY = screenPos.y - lowerBodyHeight * zoom;

  // Outer plate ring
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    plateY + 2 * zoom,
    (baseWidth + 8) * zoom * 0.5,
    (baseWidth + 8) * zoom * ISO_PRISM_D_FACTOR,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#8a7a6a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    plateY,
    (baseWidth + 6) * zoom * 0.5,
    (baseWidth + 6) * zoom * ISO_PRISM_D_FACTOR,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#9a8a7a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    plateY - 3 * zoom,
    (baseWidth + 4) * zoom * 0.5,
    (baseWidth + 4) * zoom * ISO_PRISM_D_FACTOR,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Arcane inscription stone recessed into piston plate
  const stoneRX = baseWidth * zoom * 0.28;
  const stoneRY = baseWidth * zoom * 0.14;
  const runeGlow = 0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5;

  // Recessed groove around stone
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(sX, plateY - 2 * zoom, stoneRX + 2 * zoom, stoneRY + 1 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Stone tablet surface (darker than plate, like inlaid stone)
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(sX, plateY - 2 * zoom, stoneRX + 1 * zoom, stoneRY + 0.5 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a5a4a";
  ctx.beginPath();
  ctx.ellipse(sX, plateY - 3 * zoom, stoneRX, stoneRY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing rune circle inscribed on stone
  ctx.strokeStyle = `${mainColor} ${runeGlow * 0.6})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(sX, plateY - 3 * zoom, stoneRX * 0.85, stoneRY * 0.85, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Central arcane inscription text
  ctx.fillStyle = `rgba(${glowColor}, ${runeGlow * 0.9})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 4 * zoom;
  ctx.font = `${5 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ᛗᛚᛝ", sX, plateY - 3 * zoom);
  ctx.shadowBlur = 0;

  // Orbiting rune symbols around the stone rim
  ctx.font = `${4 * zoom}px serif`;
  const plateRunes = ["ᛗ", "ᛚ", "ᛝ", "ᛟ"];
  for (let i = 0; i < 4; i++) {
    const prAngle = (i / 4) * Math.PI * 2 + time * 0.5;
    const prX = sX + Math.cos(prAngle) * stoneRX * 0.7;
    const prY = plateY - 3 * zoom + Math.sin(prAngle) * stoneRY * 0.7;
    ctx.fillStyle = `rgba(${glowColor}, ${runeGlow * 0.5})`;
    ctx.fillText(plateRunes[i], prX, prY);
  }

  // Impact flash
  if (impactFlash > 0) {
    ctx.fillStyle = `${mainColor} ${impactFlash * 0.8})`;
    ctx.shadowColor = "#b466ff";
    ctx.shadowBlur = 20 * zoom * impactFlash;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      plateY - 2 * zoom,
      baseWidth * zoom * 0.4,
      baseWidth * zoom * 0.2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Piston guides — 3D stone-and-iron pilasters
  for (const dx of [-1, 1]) {
    const railX = screenPos.x + dx * baseWidth * zoom * 0.4;
    const railTop = plateY - baseHeight * zoom * 0.6;
    const railH = baseHeight * zoom * 0.6;

    // Shadow side of rail
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(
      railX - 4 * zoom + (dx > 0 ? 6 * zoom : 0),
      railTop,
      2 * zoom,
      railH,
    );

    // Main rail body
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(railX - 4 * zoom, railTop, 8 * zoom, railH);

    // Rail highlight edge
    ctx.fillStyle = "#6a5a4a";
    ctx.fillRect(
      railX - 4 * zoom + (dx < 0 ? 0 : 6 * zoom),
      railTop,
      2 * zoom,
      railH,
    );

    // Rail cap (chamfered top)
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.moveTo(railX - 5 * zoom, railTop);
    ctx.lineTo(railX, railTop - 3 * zoom);
    ctx.lineTo(railX + 5 * zoom, railTop);
    ctx.closePath();
    ctx.fill();

    // Gold rivets with shadow
    for (let r = 0; r < 5; r++) {
      const rivetY =
        plateY - baseHeight * zoom * 0.12 - r * baseHeight * zoom * 0.11;
      // Rivet shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.arc(
        railX + 0.5 * zoom,
        rivetY + 0.5 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Rivet
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(railX, rivetY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Rivet highlight
      ctx.fillStyle = "rgba(255, 220, 150, 0.4)";
      ctx.beginPath();
      ctx.arc(
        railX - 0.4 * zoom,
        rivetY - 0.4 * zoom,
        0.6 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Carved rune on rail midpoint
    const runeY2 = plateY - baseHeight * zoom * 0.35;
    const runeAlpha =
      0.35 + Math.sin(time * 2.5 + dx * 1.5) * 0.15 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${runeAlpha})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 3 * zoom;
    ctx.font = `${5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(dx < 0 ? "ᛉ" : "ᛊ", railX, runeY2);
    ctx.shadowBlur = 0;
  }

  // UPPER PISTON SECTION
  const pistonTopY = plateY - 4 * zoom + pistonOffset;

  // Upper tower body
  drawIsometricPrism(
    ctx,
    screenPos.x,
    pistonTopY,
    baseWidth - 4,
    baseWidth - 4,
    baseHeight * 0.4,
    {
      top: "#7a6a5a",
      left: "#6a5a4a",
      right: "#5a4a3a",
      leftBack: "#8a7a6a",
      rightBack: "#7a6a5a",
    },
    zoom,
  );

  // Piston connector ring — ornate cornice band
  const connRX = (baseWidth - 2) * zoom * 0.5;
  const connRY = (baseWidth - 2) * zoom * ISO_PRISM_D_FACTOR;
  const connY = pistonTopY + 2 * zoom;

  // Ring body (back half)
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(screenPos.x, connY, connRX, connRY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left half matches left face
  ctx.fillStyle = "#6a5a4a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    connY,
    connRX,
    connRY,
    0,
    Math.PI * 0.5,
    Math.PI * 1.5,
  );
  ctx.closePath();
  ctx.fill();

  // Gold trim on connector ring
  ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    connY - 1 * zoom,
    connRX * 0.95,
    connRY * 0.95,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();

  // Front border
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, connY, connRX, connRY, 0, 0, Math.PI);
  ctx.stroke();

  // Dentil molding along connector ring (front arc)
  ctx.fillStyle = "#7a6a5a";
  for (let dm = 0; dm < 10; dm++) {
    const dmAngle = (dm / 10) * Math.PI;
    const dmX = screenPos.x + Math.cos(dmAngle) * connRX * 0.92;
    const dmY = connY + Math.sin(dmAngle) * connRY * 0.92;
    ctx.fillRect(dmX - 0.8 * zoom, dmY - 1.5 * zoom, 1.6 * zoom, 1.5 * zoom);
  }

  // Stone blocks on upper section — flush isometric mortar + texturing
  const uw = (baseWidth - 4) * zoom * 0.5;
  const ud = (baseWidth - 4) * zoom * ISO_PRISM_D_FACTOR;
  const upperH = baseHeight * 0.4 * zoom;
  ctx.lineWidth = 1 * zoom;

  // Upper body wall texturing
  for (let row = 0; row < 4; row++) {
    const uf1 = row / 5;
    const uf2 = (row + 1) / 5;
    const uStagger = row % 2 === 0 ? 0 : 1 / 6;
    for (let col = 0; col < 3; col++) {
      const u1 = Math.max(0, col / 3 + uStagger);
      const u2 = Math.min(1, (col + 1) / 3 + uStagger);
      if (u1 >= u2) continue;
      const shade = (row * 3 + col) % 3;
      const alpha = shade === 0 ? 0.04 : shade === 1 ? 0.06 : 0.02;
      const tint =
        shade === 0
          ? "138, 122, 106"
          : shade === 1
            ? "74, 58, 42"
            : "100, 84, 68";
      ctx.fillStyle = `rgba(${tint}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(sX - uw * (1 - u1), pistonTopY + u1 * ud - uf1 * upperH);
      ctx.lineTo(sX - uw * (1 - u2), pistonTopY + u2 * ud - uf1 * upperH);
      ctx.lineTo(sX - uw * (1 - u2), pistonTopY + u2 * ud - uf2 * upperH);
      ctx.lineTo(sX - uw * (1 - u1), pistonTopY + u1 * ud - uf2 * upperH);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sX + uw * (1 - u1), pistonTopY + u1 * ud - uf1 * upperH);
      ctx.lineTo(sX + uw * (1 - u2), pistonTopY + u2 * ud - uf1 * upperH);
      ctx.lineTo(sX + uw * (1 - u2), pistonTopY + u2 * ud - uf2 * upperH);
      ctx.lineTo(sX + uw * (1 - u1), pistonTopY + u1 * ud - uf2 * upperH);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Upper body flush mortar lines
  for (let row = 1; row <= 4; row++) {
    const frac = row / 5;
    const yEdge = pistonTopY - frac * upperH;
    ctx.strokeStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.moveTo(sX - uw, yEdge);
    ctx.lineTo(sX, yEdge + ud);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sX, yEdge + ud);
    ctx.lineTo(sX + uw, yEdge);
    ctx.stroke();
    ctx.strokeStyle = "rgba(120, 100, 80, 0.2)";
    ctx.beginPath();
    ctx.moveTo(sX - uw, yEdge - 1 * zoom);
    ctx.lineTo(sX, yEdge + ud - 1 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sX, yEdge + ud - 1 * zoom);
    ctx.lineTo(sX + uw, yEdge - 1 * zoom);
    ctx.stroke();
  }

  const topY = pistonTopY - baseHeight * 0.4 * zoom;

  // Mystical rune accent bands (per level)
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse;
  ctx.lineWidth = 1 * zoom;

  for (let i = 1; i <= tower.level; i++) {
    const lineY =
      pistonTopY +
      16 * zoom -
      (baseHeight * 0.6 * zoom * i) / (tower.level + 1);
    ctx.strokeStyle = `${mainColor} ${panelGlow * 0.5})`;
    // Left face accent — flush isometric (partial span t=0.1 to t=0.9)
    ctx.beginPath();
    ctx.moveTo(sX - uw * 0.9, lineY + 0.1 * ud);
    ctx.lineTo(sX - uw * 0.1, lineY + 0.9 * ud);
    ctx.stroke();
    // Right face accent — flush isometric
    ctx.beginPath();
    ctx.moveTo(sX + uw * 0.9, lineY + 0.1 * ud);
    ctx.lineTo(sX + uw * 0.1, lineY + 0.9 * ud);
    ctx.stroke();

    // Small rune glyph at the center of each accent band
    const bandRuneAlpha =
      0.3 + Math.sin(time * 2.5 + i * 1.2) * 0.15 + attackPulse * 0.2;
    ctx.fillStyle = `rgba(${glowColor}, ${bandRuneAlpha})`;
    ctx.font = `${4 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("ᛏ", sX - uw * 0.5, lineY + 0.5 * ud);
    ctx.fillText("ᛏ", sX + uw * 0.5, lineY + 0.5 * ud);
  }

  // Gothic louvered exhaust vents — isometric flush with wall faces
  for (let i = 0; i < Math.min(tower.level, 3); i++) {
    const ventY = screenPos.y - lowerBodyHeight * zoom * 0.35 - i * 8 * zoom;
    const ventGlow =
      0.3 + Math.sin(time * 4 + i * 0.5) * 0.15 + attackPulse * 0.3;

    for (const side of [-1, 1]) {
      const vx = sX + side * w * 0.55;
      const face = side === -1 ? ("left" as const) : ("right" as const);
      const vy = ventY + (side === -1 ? d * 0.55 * 0.15 : d * 0.55 * 0.15);

      drawIsoFlushVent(ctx, vx, vy, 5, 3.5, face, zoom, {
        frameColor: "#3a2a1a",
        bgColor: "#1a0a00",
        slatColor: "#5a4a3a",
        slats: 3,
      });

      // Warm arcane glow from within
      ctx.fillStyle = `rgba(${glowColor}, ${ventGlow * 0.5})`;
      traceIsoFlushRect(ctx, vx, vy, 4, 2.5, face, zoom);
      ctx.fill();
    }
  }

  // ========== GOTHIC PINNACLES ON ROOF CORNERS ==========
  for (const corner of [
    { dx: -1, dy: -0.4 },
    { dx: 1, dy: -0.4 },
    { dx: -0.8, dy: 0.25 },
    { dx: 0.8, dy: 0.25 },
  ]) {
    const pinnX = sX + corner.dx * (baseWidth - 4) * zoom * 0.45;
    const pinnY = topY + corner.dy * (baseWidth - 4) * zoom * 0.2;
    const pinnH = 10 * zoom;

    // Pinnacle base
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(pinnX - 2 * zoom, pinnY - 2 * zoom, 4 * zoom, 4 * zoom);

    // Pinnacle spire
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnY - pinnH);
    ctx.lineTo(pinnX - 2.5 * zoom, pinnY - 2 * zoom);
    ctx.lineTo(pinnX + 2.5 * zoom, pinnY - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Pinnacle crocket (decorative bumps)
    ctx.fillStyle = "#7a6a5a";
    for (let c = 0; c < 3; c++) {
      const crocketFrac = 0.3 + c * 0.25;
      const crocketX =
        pinnX + (c % 2 === 0 ? -1 : 1) * 2 * zoom * (1 - crocketFrac);
      const crocketY = pinnY - pinnH * crocketFrac;
      ctx.beginPath();
      ctx.arc(crocketX, crocketY, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pinnacle finial (tiny orb at top)
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(pinnX, pinnY - pinnH - 1.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== OBSERVATION BALCONY ==========
  const balconyY = topY + 4 * zoom;
  const balconyW = baseWidth * zoom * 0.48;
  const balconyD = baseWidth * zoom * 0.24;

  // Balcony underside (corbel support — 3D depth)
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.moveTo(sX - balconyW, balconyY);
  ctx.lineTo(sX, balconyY + balconyD);
  ctx.lineTo(sX, balconyY + balconyD + 3 * zoom);
  ctx.lineTo(sX - balconyW * 0.7, balconyY + 3 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a1a0a";
  ctx.beginPath();
  ctx.moveTo(sX, balconyY + balconyD);
  ctx.lineTo(sX + balconyW, balconyY);
  ctx.lineTo(sX + balconyW * 0.7, balconyY + 3 * zoom);
  ctx.lineTo(sX, balconyY + balconyD + 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // Corbel brackets (decorative supports)
  for (const cb of [-0.6, 0, 0.6]) {
    const cbX = sX + cb * balconyW * 0.7;
    const cbY = balconyY + balconyD * (1 - Math.abs(cb) * 0.7);
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.moveTo(cbX - 1.5 * zoom, cbY + 3 * zoom);
    ctx.lineTo(cbX, cbY + 6 * zoom);
    ctx.lineTo(cbX + 1.5 * zoom, cbY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Balcony floor (isometric slab)
  ctx.fillStyle = "#6a5a4a";
  ctx.beginPath();
  ctx.moveTo(sX - balconyW, balconyY);
  ctx.lineTo(sX, balconyY - balconyD);
  ctx.lineTo(sX + balconyW, balconyY);
  ctx.lineTo(sX, balconyY + balconyD);
  ctx.closePath();
  ctx.fill();

  // Balcony floor tile pattern
  ctx.strokeStyle = "rgba(74, 58, 42, 0.3)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX - balconyW * 0.5, balconyY + balconyD * 0.5);
  ctx.lineTo(sX + balconyW * 0.5, balconyY - balconyD * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sX - balconyW * 0.5, balconyY - balconyD * 0.5);
  ctx.lineTo(sX + balconyW * 0.5, balconyY + balconyD * 0.5);
  ctx.stroke();

  // Balcony gold edge trim
  ctx.strokeStyle = "rgba(201, 162, 39, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX - balconyW, balconyY);
  ctx.lineTo(sX, balconyY + balconyD);
  ctx.lineTo(sX + balconyW, balconyY);
  ctx.stroke();

  // Stone balustrade railing with Gothic tracery
  const railH = 6 * zoom;
  const railPosts = [
    { x: sX - balconyW * 0.8, y: balconyY + balconyD * 0.2 },
    { x: sX - balconyW * 0.4, y: balconyY + balconyD * 0.6 },
    { x: sX, y: balconyY + balconyD },
    { x: sX + balconyW * 0.4, y: balconyY + balconyD * 0.6 },
    { x: sX + balconyW * 0.8, y: balconyY + balconyD * 0.2 },
  ];

  // Panel infills between posts (Gothic trefoil cutouts)
  for (let pi = 0; pi < railPosts.length - 1; pi++) {
    const p0 = railPosts[pi];
    const p1 = railPosts[pi + 1];
    const midRailX = (p0.x + p1.x) / 2;
    const midRailY = (p0.y + p1.y) / 2;

    // Panel fill
    ctx.fillStyle = "rgba(90, 74, 58, 0.45)";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p1.x, p1.y - railH);
    ctx.lineTo(p0.x, p0.y - railH);
    ctx.closePath();
    ctx.fill();

    // Gothic arch cutout (decorative)
    ctx.strokeStyle = "rgba(74, 58, 42, 0.5)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      p0.x + (p1.x - p0.x) * 0.2,
      p0.y + (p1.y - p0.y) * 0.2 - 1 * zoom,
    );
    ctx.quadraticCurveTo(
      midRailX,
      midRailY - railH * 0.8,
      p0.x + (p1.x - p0.x) * 0.8,
      p0.y + (p1.y - p0.y) * 0.8 - 1 * zoom,
    );
    ctx.stroke();
  }

  for (const post of railPosts) {
    // Post with chamfered top
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(post.x - 1 * zoom, post.y - railH, 2 * zoom, railH);
    // Post cap (gold finial)
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(post.x, post.y - railH - 1.5 * zoom);
    ctx.lineTo(post.x - 1.2 * zoom, post.y - railH);
    ctx.lineTo(post.x + 1.2 * zoom, post.y - railH);
    ctx.closePath();
    ctx.fill();
  }

  // Upper railing bar
  ctx.strokeStyle = "#5a4a3a";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(railPosts[0].x, railPosts[0].y - railH);
  for (let i = 1; i < railPosts.length; i++) {
    ctx.lineTo(railPosts[i].x, railPosts[i].y - railH);
  }
  ctx.stroke();

  // Lower railing bar
  ctx.strokeStyle = "#4a3a2a";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(railPosts[0].x, railPosts[0].y - railH * 0.35);
  for (let i = 1; i < railPosts.length; i++) {
    ctx.lineTo(railPosts[i].x, railPosts[i].y - railH * 0.35);
  }
  ctx.stroke();

  // Compute spireHeight early so orbital effects can reference it
  const spireHeight = (28 + tower.level * 6) * zoom;

  // Back halves of orbital effects (drawn behind the spire)
  drawLibraryOrbitalEffects(
    ctx,
    false,
    screenPos,
    topY,
    spireHeight,
    baseHeight,
    lowerBodyHeight,
    mainColor,
    glowColor,
    zoom,
    time,
    attackPulse,
    shakeY,
    tower,
  );

  // ========== ENHANCED GOTHIC SPIRE ==========

  // Spire base platform
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(
    sX,
    topY + 2 * zoom,
    baseWidth * zoom * 0.38,
    baseWidth * zoom * 0.19,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Spire back face
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX - baseWidth * zoom * 0.32, topY);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12);
  ctx.closePath();
  ctx.fill();

  // Spire front face
  ctx.fillStyle = "#4a3a2a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12);
  ctx.lineTo(sX + baseWidth * zoom * 0.32, topY);
  ctx.closePath();
  ctx.fill();

  // Spire right face
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX + baseWidth * zoom * 0.32, topY);
  ctx.lineTo(sX + baseWidth * zoom * 0.32, topY + 3 * zoom);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12 + 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // Spire ridge line
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight);
  ctx.lineTo(sX, topY + baseWidth * zoom * 0.12);
  ctx.stroke();

  // Ornamental spire bands with runes
  const spireRunes = ["ᚷ", "ᚹ", "ᚺ", "ᛁ"];
  for (let band = 0; band < 4; band++) {
    const bandY = topY - spireHeight * (0.2 + band * 0.2);
    const bandWidth = baseWidth * zoom * 0.32 * (0.9 - band * 0.15);

    // Band line
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(sX - bandWidth, bandY + bandWidth * 0.35);
    ctx.lineTo(sX, bandY - bandWidth * 0.15);
    ctx.lineTo(sX + bandWidth, bandY + bandWidth * 0.35);
    ctx.stroke();

    // Band rune
    const bandRuneGlow =
      0.5 + Math.sin(time * 3 + band) * 0.25 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${bandRuneGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.font = `${5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(spireRunes[band], sX, bandY);
    ctx.shadowBlur = 0;
  }

  // Spire finial (decorative top piece)
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(sX, topY - spireHeight - 6 * zoom);
  ctx.lineTo(sX - 3 * zoom, topY - spireHeight + 2 * zoom);
  ctx.lineTo(sX + 3 * zoom, topY - spireHeight + 2 * zoom);
  ctx.closePath();
  ctx.fill();

  // Faceted crystal at top (diamond shape with multiple facets)
  const crystalCenterY = topY - spireHeight - 10 * zoom;
  const crystalSize = (3 + tower.level * 0.5) * zoom;
  const crystalGlow = 0.7 + Math.sin(time * 4) * 0.2 + attackPulse * 0.5;

  // Crystal outer glow
  ctx.fillStyle = `rgba(${glowColor}, ${crystalGlow * 0.2})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(sX, crystalCenterY, crystalSize * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Crystal facets (hexagonal shape with visible faces)
  const facetAngles = 6;
  for (let f = 0; f < facetAngles; f++) {
    const fAngle1 = (f / facetAngles) * Math.PI * 2 - Math.PI / 2;
    const fAngle2 = ((f + 1) / facetAngles) * Math.PI * 2 - Math.PI / 2;

    // Upper facet (lighter)
    const facetBright = 0.5 + (f % 2) * 0.2;
    ctx.fillStyle = `rgba(${glowColor}, ${crystalGlow * facetBright})`;
    ctx.beginPath();
    ctx.moveTo(sX, crystalCenterY - crystalSize * 1.2);
    ctx.lineTo(
      sX + Math.cos(fAngle1) * crystalSize,
      crystalCenterY + Math.sin(fAngle1) * crystalSize * 0.5,
    );
    ctx.lineTo(
      sX + Math.cos(fAngle2) * crystalSize,
      crystalCenterY + Math.sin(fAngle2) * crystalSize * 0.5,
    );
    ctx.closePath();
    ctx.fill();

    // Lower facet (darker)
    ctx.fillStyle = `rgba(${glowColor}, ${crystalGlow * facetBright * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(sX, crystalCenterY + crystalSize * 1.2);
    ctx.lineTo(
      sX + Math.cos(fAngle1) * crystalSize,
      crystalCenterY + Math.sin(fAngle1) * crystalSize * 0.5,
    );
    ctx.lineTo(
      sX + Math.cos(fAngle2) * crystalSize,
      crystalCenterY + Math.sin(fAngle2) * crystalSize * 0.5,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Crystal highlight (specular)
  ctx.fillStyle = `rgba(255, 255, 255, ${crystalGlow * 0.6})`;
  ctx.beginPath();
  ctx.ellipse(
    sX - crystalSize * 0.25,
    crystalCenterY - crystalSize * 0.4,
    crystalSize * 0.3,
    crystalSize * 0.2,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Lightning rod / magical antenna extending from crystal
  const antennaBaseY = crystalCenterY - crystalSize * 1.2;
  const antennaH = 8 * zoom;

  // Main antenna shaft
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX, antennaBaseY);
  ctx.lineTo(sX, antennaBaseY - antennaH);
  ctx.stroke();

  // Antenna crossbars
  ctx.lineWidth = 0.8 * zoom;
  for (let ab = 0; ab < 3; ab++) {
    const abY = antennaBaseY - antennaH * (0.3 + ab * 0.25);
    const abW = (3 - ab) * zoom;
    ctx.beginPath();
    ctx.moveTo(sX - abW, abY);
    ctx.lineTo(sX + abW, abY);
    ctx.stroke();
  }

  // Antenna tip spark
  const sparkAlpha = 0.4 + Math.sin(time * 8) * 0.3 + attackPulse * 0.5;
  ctx.fillStyle = `rgba(${glowColor}, ${sparkAlpha})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(sX, antennaBaseY - antennaH, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Lightning crackle from antenna during attack
  if (attackPulse > 0.15) {
    ctx.strokeStyle = `rgba(${glowColor}, ${attackPulse})`;
    ctx.lineWidth = 1 * zoom;
    for (let bolt = 0; bolt < 3; bolt++) {
      const boltAngle = time * 12 + bolt * 2.1;
      ctx.beginPath();
      ctx.moveTo(sX, antennaBaseY - antennaH);
      let bx = sX;
      let by = antennaBaseY - antennaH;
      for (let seg = 0; seg < 4; seg++) {
        bx += Math.cos(boltAngle + seg * 1.5) * 4 * zoom;
        by += Math.sin(boltAngle + seg * 0.8) * 3 * zoom - 1 * zoom;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
  }

  // Small clock face above core display
  const clockCenterY = topY - 24 * zoom;
  const clockR = 3.5 * zoom;

  ctx.fillStyle = "rgba(240, 230, 210, 0.85)";
  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(sX, clockCenterY, clockR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#3a2a1a";
  for (let h = 0; h < 12; h++) {
    const hAngle = (h / 12) * Math.PI * 2 - Math.PI / 2;
    const markerLen = h % 3 === 0 ? 1 * zoom : 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      sX + Math.cos(hAngle) * (clockR - markerLen),
      clockCenterY + Math.sin(hAngle) * (clockR - markerLen),
    );
    ctx.lineTo(
      sX + Math.cos(hAngle) * (clockR - 0.5 * zoom),
      clockCenterY + Math.sin(hAngle) * (clockR - 0.5 * zoom),
    );
    ctx.lineWidth = h % 3 === 0 ? 0.7 * zoom : 0.4 * zoom;
    ctx.stroke();
  }

  const hourAngle = ((time * 0.02) % (Math.PI * 2)) - Math.PI / 2;
  const minuteAngle = ((time * 0.24) % (Math.PI * 2)) - Math.PI / 2;
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX, clockCenterY);
  ctx.lineTo(
    sX + Math.cos(hourAngle) * clockR * 0.45,
    clockCenterY + Math.sin(hourAngle) * clockR * 0.45,
  );
  ctx.stroke();
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(sX, clockCenterY);
  ctx.lineTo(
    sX + Math.cos(minuteAngle) * clockR * 0.65,
    clockCenterY + Math.sin(minuteAngle) * clockR * 0.65,
  );
  ctx.stroke();

  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(sX, clockCenterY, 0.7 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Central arcane core display
  ctx.fillStyle = "#3a2a1a";
  ctx.beginPath();
  ctx.arc(sX, topY + 6 * zoom, 9 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const coreGrad = ctx.createRadialGradient(
    sX,
    topY + 6 * zoom,
    0,
    sX,
    topY + 6 * zoom,
    7 * zoom,
  );
  coreGrad.addColorStop(0, `${mainColor} ${glowIntensity})`);
  if (tower.level > 3 && tower.upgrade === "A") {
    coreGrad.addColorStop(0.5, `rgba(200, 120, 50, ${glowIntensity * 0.7})`);
    coreGrad.addColorStop(1, `rgba(150, 80, 30, ${glowIntensity * 0.4})`);
  } else if (tower.level > 3 && tower.upgrade === "B") {
    coreGrad.addColorStop(0.5, `rgba(60, 120, 200, ${glowIntensity * 0.7})`);
    coreGrad.addColorStop(1, `rgba(40, 80, 160, ${glowIntensity * 0.4})`);
  } else {
    coreGrad.addColorStop(0.5, `rgba(140, 80, 200, ${glowIntensity * 0.7})`);
    coreGrad.addColorStop(1, `rgba(100, 50, 150, ${glowIntensity * 0.4})`);
  }
  ctx.fillStyle = coreGrad;
  ctx.shadowColor =
    tower.level > 3 && tower.upgrade === "A"
      ? "#ff9944"
      : tower.level > 3 && tower.upgrade === "B"
        ? "#4488ff"
        : "#b466ff";
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(sX, topY + 6 * zoom, 7 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "#3a2a1a";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time * 2;
    ctx.beginPath();
    ctx.moveTo(sX, topY + 6 * zoom);
    ctx.lineTo(
      sX + Math.cos(angle) * 6 * zoom,
      topY + 6 * zoom + Math.sin(angle) * 6 * zoom,
    );
    ctx.stroke();
  }

  // Front halves of orbital effects (drawn in front of the spire and body)
  drawLibraryOrbitalEffects(
    ctx,
    true,
    screenPos,
    topY,
    spireHeight,
    baseHeight,
    lowerBodyHeight,
    mainColor,
    glowColor,
    zoom,
    time,
    attackPulse,
    shakeY,
    tower,
  );

  // Energy orb at tip
  const orbGlow = 0.6 + Math.sin(time * 4) * 0.3 + attackPulse;
  const orbSize = (12 + tower.level * 2 + attackPulse * 5) * zoom;

  // Outer energy field
  const outerGrad = ctx.createRadialGradient(
    sX,
    topY - spireHeight - 10 * zoom,
    0,
    sX,
    topY - spireHeight - 10 * zoom,
    orbSize * 1.5,
  );
  outerGrad.addColorStop(0, `${mainColor} ${orbGlow * 0.3})`);
  outerGrad.addColorStop(0.5, `rgba(${glowColor}, ${orbGlow * 0.15})`);
  outerGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 10 * zoom, orbSize * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Main orb
  const orbGrad = ctx.createRadialGradient(
    sX - 2 * zoom,
    topY - spireHeight - 12 * zoom,
    0,
    sX,
    topY - spireHeight - 10 * zoom,
    orbSize,
  );

  if (tower.level <= 3) {
    orbGrad.addColorStop(0, `rgba(255, 220, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.3, `rgba(200, 150, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.6, `rgba(150, 80, 220, ${orbGlow * 0.7})`);
    orbGrad.addColorStop(1, `rgba(100, 50, 180, 0)`);
  } else if (tower.level === 4 && tower.upgrade === "A") {
    orbGrad.addColorStop(0, `rgba(255, 220, 180, ${orbGlow})`);
    orbGrad.addColorStop(0.3, `rgba(255, 180, 100, ${orbGlow})`);
    orbGrad.addColorStop(0.6, `rgba(220, 100, 40, ${orbGlow * 0.7})`);
    orbGrad.addColorStop(1, `rgba(180, 60, 30, 0)`);
  } else {
    orbGrad.addColorStop(0, `rgba(180, 240, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.3, `rgba(100, 200, 255, ${orbGlow})`);
    orbGrad.addColorStop(0.6, `rgba(40, 150, 220, ${orbGlow * 0.7})`);
    orbGrad.addColorStop(1, `rgba(30, 100, 180, 0)`);
  }

  ctx.fillStyle = orbGrad;
  ctx.shadowColor =
    tower.level > 3 && tower.upgrade === "A"
      ? "#ff9944"
      : tower.level > 3 && tower.upgrade === "B"
        ? "#4488ff"
        : "#b466ff";
  ctx.shadowBlur = 15 * zoom * orbGlow;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 10 * zoom, orbSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Inner core
  ctx.fillStyle =
    tower.level > 3 && tower.upgrade === "A"
      ? `rgba(255, 240, 220, ${orbGlow})`
      : tower.level > 3 && tower.upgrade === "B"
        ? `rgba(220, 240, 255, ${orbGlow})`
        : `rgba(255, 230, 255, ${orbGlow})`;
  ctx.beginPath();
  ctx.arc(sX, topY - spireHeight - 10 * zoom, 3.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Energy tendrils during attack
  if (attackPulse > 0.1) {
    for (let t = 0; t < 5; t++) {
      const tendrilAngle = time * 5 + (t / 5) * Math.PI * 2;
      const tendrilLen = (18 + attackPulse * 22) * zoom;
      ctx.strokeStyle = `${mainColor} ${attackPulse * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(sX, topY - spireHeight - 10 * zoom);
      ctx.quadraticCurveTo(
        sX + Math.cos(tendrilAngle) * tendrilLen * 0.5,
        topY -
          spireHeight -
          10 * zoom +
          Math.sin(tendrilAngle) * tendrilLen * 0.3,
        sX + Math.cos(tendrilAngle + 0.3) * tendrilLen,
        topY -
          spireHeight -
          10 * zoom +
          Math.sin(tendrilAngle + 0.3) * tendrilLen * 0.5,
      );
      ctx.stroke();
    }
  }

  // (Scroll removed — arcane runes are now inscribed on the piston plate)

  // ========== LEVEL 3 UNIQUE FEATURES ==========
  // (Barrier circle, nodes, and crystal shards are now drawn via drawLibraryOrbitalEffects)
  if (tower.level >= 3) {
    // Ancient artifact pedestal glow
    const artifactGlow = 0.5 + Math.sin(time * 3) * 0.25;
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(
      sX,
      screenPos.y - lowerBodyHeight * zoom - 8 * zoom,
      12 * zoom,
      6 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // (Energy amplifier rings are now drawn via drawLibraryOrbitalEffects)

  // Gothic windows on top level (drawn last; move with piston)
  const topWinYBase = pistonTopY - upperH * 0.35;

  if (isUpgraded) {
    const twinW = 3.5;
    const twinH = 8;
    drawIsoGothicWindow(ctx, sX - uw * 0.7, topWinYBase + 0.3 * ud, twinW, twinH, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX - uw * 0.3, topWinYBase + 0.7 * ud, twinW, twinH, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + uw * 0.7, topWinYBase + 0.3 * ud, twinW, twinH, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + uw * 0.3, topWinYBase + 0.7 * ud, twinW, twinH, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
  } else {
    drawIsoGothicWindow(ctx, sX - uw * 0.5, topWinYBase + 0.5 * ud, 5, 10, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + uw * 0.5, topWinYBase + 0.5 * ud, 5, 10, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
  }

  ctx.restore();
}

// LAB TOWER - Tesla coil with fixed projectile origins
