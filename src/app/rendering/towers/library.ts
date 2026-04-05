import type { Tower, Position } from "../../types";
import {
  ISO_PRISM_D_FACTOR,
} from "../../constants";
import {
  drawIsometricPrism,
  drawIsoOctPrism,
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

  }
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

  const is4A = tower.level === 4 && tower.upgrade === "A";
  const is4B = tower.level === 4 && tower.upgrade === "B";
  const uc = <T>(a: T, b: T, def: T): T => (is4A ? a : is4B ? b : def);

  // Stone palette: cool shadows → warm highlights (mimics real outdoor stone lighting)
  const st = {
    void: uc("#1a0606", "#060810", "#0c0810"),
    mortar: uc("#2a0e08", "#0a141e", "#181420"),
    dark: uc("#3e1c10", "#18242e", "#2a2630"),
    mid: uc("#54301e", "#283840", "#423e3e"),
    base: uc("#6c442e", "#3c4e58", "#5c5650"),
    light: uc("#885e42", "#546872", "#78705e"),
    pale: uc("#8e6c4e", "#607880", "#7e7864"),
    palest: uc("#a28260", "#728a92", "#948c78"),
    top: uc("#e0ba92", "#a8bcc6", "#d2c8a8"),
  };
  const gd = {
    main: uc("#d48028", "#7eb0cc", "#d4a428"),
    sub: uc("#c06c1e", "#6c9cba", "#c29420"),
    rgba: uc("212, 128, 40", "126, 176, 204", "212, 164, 40"),
  };
  const railRgba = uc("100, 68, 46", "56, 72, 86", "82, 76, 66");
  const mortarHl = uc("rgba(130, 92, 68,", "rgba(78, 98, 116,", "rgba(110, 100, 88,");
  const tileRgba = uc("80, 58, 40", "42, 56, 70", "68, 62, 54");
  const stTint = {
    a: uc("144, 100, 80", "102, 118, 132", "130, 120, 110"),
    b: uc("80, 48, 30", "40, 56, 70", "58, 52, 50"),
    c: uc("108, 72, 54", "66, 82, 96", "96, 86, 76"),
  };

  ctx.save();
  // Shift tower up to center on placement position
  screenPos = { x: screenPos.x, y: screenPos.y - (8 + tower.level * 2) * zoom };
  const sX = screenPos.x;
  const baseWidth = 34 + tower.level * 5;
  const baseHeight = 28 + tower.level * 8;
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
  const lvl = tower.level;
  const fndGrow = lvl * 5;
  // Lowest step — wide rough-hewn stone base
  drawIsoOctPrism(
    ctx,
    screenPos.x,
    screenPos.y + (16 + lvl * 2) * zoom,
    baseWidth + 26 + fndGrow,
    baseWidth + 26 + fndGrow,
    4 + lvl,
    st.mid,
    st.dark,
    st.mortar,
    zoom,
  );

  // Middle step — dressed stone
  drawIsoOctPrism(
    ctx,
    screenPos.x,
    screenPos.y + (12 + lvl) * zoom,
    baseWidth + 18 + fndGrow,
    baseWidth + 18 + fndGrow,
    4 + lvl,
    st.base,
    st.mid,
    st.dark,
    zoom,
  );

  // Upper step — polished foundation with rune trim
  drawIsoOctPrism(
    ctx,
    screenPos.x,
    screenPos.y + (8 + lvl) * zoom,
    baseWidth + 10 + fndGrow,
    baseWidth + 10 + fndGrow,
    6 + lvl * 2,
    st.light,
    st.base,
    st.mid,
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
  ctx.strokeStyle = `rgba(${gd.rgba}, ${0.35 + Math.sin(time * 1.5) * 0.1})`;
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
        top: st.pale,
        left: st.base,
        right: st.mid,
        leftBack: st.light,
        rightBack: st.base,
      },
      zoom,
    );

    // Pillar cap (pyramid)
    const capY = pp.y + 2 * zoom - 12 * zoom;
    ctx.fillStyle = st.palest;
    ctx.beginPath();
    ctx.moveTo(pp.x, capY - 4 * zoom);
    ctx.lineTo(pp.x - 3.5 * zoom, capY);
    ctx.lineTo(pp.x, capY + 1.5 * zoom);
    ctx.lineTo(pp.x + 3.5 * zoom, capY);
    ctx.closePath();
    ctx.fill();

    // Pillar gold finial
    ctx.fillStyle = gd.main;
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

  // Base-level aura rings (drawn before building so they layer underneath)
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
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  if (tower.level === 4 && tower.upgrade === "B") {
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
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
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
      top: st.light,
      left: st.base,
      right: st.mid,
      leftBack: st.pale,
      rightBack: st.light,
    },
    zoom,
  );

  // Ambient occlusion overlays on lower body faces
  {
    const aoBodyH = lowerBodyHeight * zoom;
    // Left face — vertical darkening gradient (darker at bottom)
    const aoLeft = ctx.createLinearGradient(
      sX - w, screenPos.y - aoBodyH, sX - w, screenPos.y,
    );
    aoLeft.addColorStop(0, "rgba(0, 0, 0, 0)");
    aoLeft.addColorStop(0.7, "rgba(0, 0, 0, 0.06)");
    aoLeft.addColorStop(1, "rgba(0, 0, 0, 0.18)");
    ctx.fillStyle = aoLeft;
    ctx.beginPath();
    ctx.moveTo(sX - w, screenPos.y);
    ctx.lineTo(sX, screenPos.y + d);
    ctx.lineTo(sX, screenPos.y + d - aoBodyH);
    ctx.lineTo(sX - w, screenPos.y - aoBodyH);
    ctx.closePath();
    ctx.fill();

    // Right face — vertical darkening + slightly more shadow
    const aoRight = ctx.createLinearGradient(
      sX + w, screenPos.y - aoBodyH, sX + w, screenPos.y,
    );
    aoRight.addColorStop(0, "rgba(0, 0, 0, 0.04)");
    aoRight.addColorStop(0.7, "rgba(0, 0, 0, 0.1)");
    aoRight.addColorStop(1, "rgba(0, 0, 0, 0.22)");
    ctx.fillStyle = aoRight;
    ctx.beginPath();
    ctx.moveTo(sX, screenPos.y + d);
    ctx.lineTo(sX + w, screenPos.y);
    ctx.lineTo(sX + w, screenPos.y - aoBodyH);
    ctx.lineTo(sX, screenPos.y + d - aoBodyH);
    ctx.closePath();
    ctx.fill();

    // Corner edge highlight on left face top-left edge
    ctx.strokeStyle = "rgba(255, 240, 210, 0.08)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(sX - w, screenPos.y);
    ctx.lineTo(sX - w, screenPos.y - aoBodyH);
    ctx.stroke();

    // Corner darkening on front-bottom vertex
    const aoCorner = ctx.createRadialGradient(
      sX, screenPos.y + d, 0,
      sX, screenPos.y + d, aoBodyH * 0.3,
    );
    aoCorner.addColorStop(0, "rgba(0, 0, 0, 0.12)");
    aoCorner.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aoCorner;
    ctx.beginPath();
    ctx.moveTo(sX - w * 0.4, screenPos.y + d * 0.6);
    ctx.lineTo(sX, screenPos.y + d);
    ctx.lineTo(sX + w * 0.4, screenPos.y + d * 0.6);
    ctx.lineTo(sX + w * 0.4, screenPos.y + d * 0.6 - aoBodyH * 0.3);
    ctx.lineTo(sX - w * 0.4, screenPos.y + d * 0.6 - aoBodyH * 0.3);
    ctx.closePath();
    ctx.fill();
  }

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
      rail: st.mid,
      topRail: st.light,
      backPanel: `rgba(${railRgba}, 0.35)`,
      frontPanel: `rgba(${railRgba}, 0.25)`,
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
      const alpha = shade === 0 ? 0.08 : shade === 1 ? 0.12 : 0.05;
      const tint =
        shade === 0
          ? stTint.a
          : shade === 1
            ? stTint.b
            : stTint.c;

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
    ctx.strokeStyle = st.mortar;
    ctx.beginPath();
    ctx.moveTo(sX - w, yEdge);
    ctx.lineTo(sX, yEdge + d);
    ctx.stroke();
    // Left face — lighter upper highlight
    ctx.strokeStyle = `${mortarHl} 0.25)`;
    ctx.beginPath();
    ctx.moveTo(sX - w, yEdge - 1 * zoom);
    ctx.lineTo(sX, yEdge + d - 1 * zoom);
    ctx.stroke();

    // Right face — dark mortar groove
    ctx.strokeStyle = st.mortar;
    ctx.beginPath();
    ctx.moveTo(sX, yEdge + d);
    ctx.lineTo(sX + w, yEdge);
    ctx.stroke();
    // Right face — lighter upper highlight
    ctx.strokeStyle = `${mortarHl} 0.25)`;
    ctx.beginPath();
    ctx.moveTo(sX, yEdge + d - 1 * zoom);
    ctx.lineTo(sX + w, yEdge - 1 * zoom);
    ctx.stroke();
  }

  // Vertical mortar joints (staggered per row for ashlar bond)
  ctx.strokeStyle = st.mortar;
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
    ctx.fillStyle = st.mid;
    ctx.beginPath();
    ctx.moveTo(scX - side * 0.5 * zoom, scY - 2.5 * zoom);
    ctx.lineTo(scX - side * 0.5 * zoom, scY + 2.5 * zoom);
    ctx.lineTo(scX + side * 1.5 * zoom, scY + 2 * zoom);
    ctx.lineTo(scX + side * 1.5 * zoom, scY - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Curved iron bracket arm
    ctx.strokeStyle = st.base;
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

    // Lantern cage (hexagonal — larger)
    const lx = lanternTipX;
    const ly = scY;
    const lSize = 3.2 * zoom;

    // Lantern top cap (pyramid)
    ctx.fillStyle = gd.main;
    ctx.beginPath();
    ctx.moveTo(lx, ly - lSize * 1.8);
    ctx.lineTo(lx - lSize * 1.1, ly - lSize * 1.1);
    ctx.lineTo(lx + lSize * 1.1, ly - lSize * 1.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = gd.sub;
    ctx.beginPath();
    ctx.moveTo(lx, ly - lSize * 1.8);
    ctx.lineTo(lx + lSize * 1.1, ly - lSize * 1.1);
    ctx.lineTo(lx + lSize * 0.8, ly - lSize * 0.9);
    ctx.closePath();
    ctx.fill();

    // Lantern body (glass panels with darker iron frame)
    ctx.fillStyle = "rgba(40, 25, 15, 0.7)";
    ctx.fillRect(lx - lSize, ly - lSize * 1.1, lSize * 2, lSize * 2);

    // Lantern glass frame struts
    ctx.strokeStyle = gd.sub;
    ctx.lineWidth = 0.8 * zoom;
    ctx.strokeRect(lx - lSize, ly - lSize * 1.1, lSize * 2, lSize * 2);
    ctx.beginPath();
    ctx.moveTo(lx, ly - lSize * 1.1);
    ctx.lineTo(lx, ly + lSize * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lx - lSize, ly - lSize * 0.1);
    ctx.lineTo(lx + lSize, ly - lSize * 0.1);
    ctx.stroke();

    // Lantern bottom finial
    ctx.fillStyle = gd.main;
    ctx.beginPath();
    ctx.moveTo(lx, ly + lSize * 1.3);
    ctx.lineTo(lx - lSize * 0.6, ly + lSize * 0.9);
    ctx.lineTo(lx + lSize * 0.6, ly + lSize * 0.9);
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
  const roseGlow = 0.7 + Math.sin(time * 1.8) * 0.2 + attackPulse * 0.3;

  // Deep stone recess around rose window (shadow surround)
  ctx.fillStyle = st.void;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius + 3.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Outer stone frame — beveled molding ring
  const frameGrad = ctx.createRadialGradient(
    screenPos.x - 2 * zoom, roseY - 2 * zoom, roseRadius,
    screenPos.x, roseY, roseRadius + 3 * zoom,
  );
  frameGrad.addColorStop(0, st.mid);
  frameGrad.addColorStop(0.5, st.pale);
  frameGrad.addColorStop(1, st.dark);
  ctx.fillStyle = frameGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius + 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Cut out the window area from the frame
  ctx.fillStyle = st.void;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius + 0.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Bright base fill so stained glass reads against light, not dark
  ctx.fillStyle = `rgba(${glowColor}, ${roseGlow * 0.6})`;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius, 0, Math.PI * 2);
  ctx.fill();

  // Background glow — intense radial bloom
  const roseGlowGrad = ctx.createRadialGradient(
    screenPos.x, roseY, 0,
    screenPos.x, roseY, roseRadius * 1.3,
  );
  roseGlowGrad.addColorStop(0, `rgba(${glowColor}, ${Math.min(1, roseGlow * 1.2)})`);
  roseGlowGrad.addColorStop(0.4, `rgba(${glowColor}, ${roseGlow * 0.85})`);
  roseGlowGrad.addColorStop(0.75, `rgba(${glowColor}, ${roseGlow * 0.35})`);
  roseGlowGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = roseGlowGrad;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 18 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Second glow pass for extra bloom spill onto surrounding wall
  ctx.fillStyle = `rgba(${glowColor}, ${roseGlow * 0.15})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 24 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius * 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Stained glass colored segments — vivid, high-alpha
  const stainedColors = [
    "rgba(220, 50, 50, 0.55)",
    "rgba(50, 50, 220, 0.55)",
    "rgba(50, 180, 50, 0.55)",
    "rgba(220, 180, 50, 0.55)",
    "rgba(180, 50, 180, 0.55)",
    "rgba(50, 180, 180, 0.55)",
    "rgba(220, 100, 50, 0.55)",
    "rgba(100, 50, 220, 0.55)",
  ];
  for (let petal = 0; petal < 8; petal++) {
    const a0 = (petal / 8) * Math.PI * 2;
    const a1 = ((petal + 1) / 8) * Math.PI * 2;
    ctx.fillStyle = stainedColors[petal];
    ctx.beginPath();
    ctx.moveTo(screenPos.x, roseY);
    ctx.arc(screenPos.x, roseY, roseRadius, a0, a1);
    ctx.closePath();
    ctx.fill();
  }

  // Gothic tracery (stone mullions) — thicker, more visible
  ctx.strokeStyle = st.mortar;
  ctx.lineWidth = 1 * zoom;
  for (let petal = 0; petal < 8; petal++) {
    const petalAngle = (petal / 8) * Math.PI * 2;
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
    const cuspR = roseRadius * 0.78;
    ctx.beginPath();
    ctx.arc(
      screenPos.x + Math.cos(midAngle) * cuspR,
      roseY + Math.sin(midAngle) * cuspR,
      roseRadius * 0.18,
      midAngle + Math.PI * 0.3,
      midAngle + Math.PI * 1.7,
    );
    ctx.stroke();
  }

  // Inner ring (middle stone circle) — thicker
  ctx.strokeStyle = st.mortar;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // Outer ring highlight (bevel edge catch)
  ctx.strokeStyle = st.pale;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, roseRadius + 2.5 * zoom, Math.PI * 1.1, Math.PI * 1.6);
  ctx.stroke();

  // Center gem with faceted highlight — blazing bright
  ctx.fillStyle = `rgba(${glowColor}, ${Math.min(1, roseGlow * 1.3)})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 10 * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, roseGlow * 0.7)})`;
  ctx.beginPath();
  ctx.arc(screenPos.x, roseY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = `rgba(255, 255, 255, ${roseGlow * 0.8})`;
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
  ctx.fillStyle = st.base;
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW - 2 * zoom, entranceY + 1 * zoom);
  ctx.lineTo(entranceX, entranceY + 3 * zoom);
  ctx.lineTo(entranceX + doorW + 2 * zoom, entranceY + 1 * zoom);
  ctx.lineTo(entranceX, entranceY - 1 * zoom);
  ctx.closePath();
  ctx.fill();
  // Step front edge
  ctx.fillStyle = st.mid;
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW - 2 * zoom, entranceY + 1 * zoom);
  ctx.lineTo(entranceX, entranceY + 3 * zoom);
  ctx.lineTo(entranceX, entranceY + 5 * zoom);
  ctx.lineTo(entranceX - doorW - 2 * zoom, entranceY + 3 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = st.dark;
  ctx.beginPath();
  ctx.moveTo(entranceX, entranceY + 3 * zoom);
  ctx.lineTo(entranceX + doorW + 2 * zoom, entranceY + 1 * zoom);
  ctx.lineTo(entranceX + doorW + 2 * zoom, entranceY + 3 * zoom);
  ctx.lineTo(entranceX, entranceY + 5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Deep door recess (shadow)
  ctx.fillStyle = st.void;
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

  // Outer archivolt (ornate arch molding — filled band)
  ctx.fillStyle = st.pale;
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW - 2.5 * zoom, entranceY);
  ctx.lineTo(entranceX - doorW - 2.5 * zoom, entranceY - doorH * 0.52);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.35,
    entranceX + doorW + 2.5 * zoom,
    entranceY - doorH * 0.52,
  );
  ctx.lineTo(entranceX + doorW + 2.5 * zoom, entranceY);
  ctx.lineTo(entranceX + doorW + 0.5 * zoom, entranceY);
  ctx.lineTo(entranceX + doorW + 0.5 * zoom, entranceY - doorH * 0.56);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.18,
    entranceX - doorW - 0.5 * zoom,
    entranceY - doorH * 0.56,
  );
  ctx.lineTo(entranceX - doorW - 0.5 * zoom, entranceY);
  ctx.closePath();
  ctx.fill();

  // Archivolt outer edge highlight
  ctx.strokeStyle = st.palest;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW - 2.5 * zoom, entranceY);
  ctx.lineTo(entranceX - doorW - 2.5 * zoom, entranceY - doorH * 0.52);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.35,
    entranceX + doorW + 2.5 * zoom,
    entranceY - doorH * 0.52,
  );
  ctx.lineTo(entranceX + doorW + 2.5 * zoom, entranceY);
  ctx.stroke();

  // Archivolt inner edge (dark recess line)
  ctx.strokeStyle = st.dark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(entranceX - doorW - 0.5 * zoom, entranceY);
  ctx.lineTo(entranceX - doorW - 0.5 * zoom, entranceY - doorH * 0.56);
  ctx.quadraticCurveTo(
    entranceX,
    entranceY - doorH * 1.18,
    entranceX + doorW + 0.5 * zoom,
    entranceY - doorH * 0.56,
  );
  ctx.lineTo(entranceX + doorW + 0.5 * zoom, entranceY);
  ctx.stroke();

  // Voussoir stone blocks along the arch
  for (let vs = 0; vs < 7; vs++) {
    const vt = (vs + 0.5) / 7;
    const outerW = doorW + 2.5 * zoom;
    const innerW = doorW + 0.5 * zoom;
    const outerPeak = doorH * 1.35;
    const innerPeak = doorH * 1.18;
    const ox = entranceX - outerW + vt * 2 * outerW;
    const oy = entranceY - doorH * 0.52 - Math.sin(vt * Math.PI) * (outerPeak - doorH * 0.52) * 0.35;
    const ix = entranceX - innerW + vt * 2 * innerW;
    const iy = entranceY - doorH * 0.56 - Math.sin(vt * Math.PI) * (innerPeak - doorH * 0.56) * 0.35;
    ctx.strokeStyle = st.mid;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ix, iy);
    ctx.stroke();
  }

  // Keystone at arch apex (larger, more ornate)
  ctx.fillStyle = st.palest;
  ctx.beginPath();
  ctx.moveTo(entranceX, entranceY - doorH * 1.0);
  ctx.lineTo(entranceX - 3 * zoom, entranceY - doorH * 0.82);
  ctx.lineTo(entranceX - 2.5 * zoom, entranceY - doorH * 0.78);
  ctx.lineTo(entranceX + 2.5 * zoom, entranceY - doorH * 0.78);
  ctx.lineTo(entranceX + 3 * zoom, entranceY - doorH * 0.82);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = st.mid;
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();
  ctx.fillStyle = gd.main;
  ctx.beginPath();
  ctx.arc(entranceX, entranceY - doorH * 0.87, 1.2 * zoom, 0, Math.PI * 2);
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
  ctx.strokeStyle = "rgba(50, 35, 25, 0.6)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(entranceX, entranceY);
  ctx.lineTo(entranceX, entranceY - doorH * 0.78);
  ctx.stroke();
  // Door panel plank lines
  for (const plankU of [0.3, 0.6]) {
    ctx.strokeStyle = "rgba(50, 35, 25, 0.3)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(entranceX - doorW * plankU, entranceY);
    ctx.lineTo(entranceX - doorW * plankU, entranceY - doorH * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(entranceX + doorW * plankU, entranceY);
    ctx.lineTo(entranceX + doorW * plankU, entranceY - doorH * 0.55);
    ctx.stroke();
  }
  // Iron strap hinges (more prominent)
  for (let h = 0; h < 3; h++) {
    const hingeY = entranceY - doorH * (0.12 + h * 0.22);
    ctx.strokeStyle = "rgba(40, 35, 30, 0.65)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(entranceX - doorW + 1.5 * zoom, hingeY);
    ctx.lineTo(entranceX - 0.5 * zoom, hingeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(entranceX + 0.5 * zoom, hingeY);
    ctx.lineTo(entranceX + doorW - 1.5 * zoom, hingeY);
    ctx.stroke();
    // Hinge rivets
    ctx.fillStyle = "rgba(90, 80, 70, 0.5)";
    ctx.beginPath();
    ctx.arc(entranceX - doorW + 2 * zoom, hingeY, 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(entranceX + doorW - 2 * zoom, hingeY, 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  // Door ring handle
  ctx.strokeStyle = "rgba(60, 50, 40, 0.6)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(entranceX, entranceY - doorH * 0.3, 1.5 * zoom, 0, Math.PI);
  ctx.stroke();

  // Torch brackets with ornate ironwork
  for (const tSide of [-1, 1]) {
    const torchX = entranceX + tSide * (doorW + 4 * zoom);
    const torchY = entranceY - doorH * 0.5;

    // Wall plate
    ctx.fillStyle = st.mid;
    ctx.fillRect(torchX - 1.5 * zoom, torchY + 1 * zoom, 3 * zoom, 4 * zoom);

    // Ornate bracket arm (curved iron)
    ctx.strokeStyle = st.base;
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
    ctx.fillStyle = st.light;
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
    const bxOuter = screenPos.x + side * w * 1.2;
    const bxDepth = side * 4 * zoom;
    const bTop = screenPos.y - lowerBodyHeight * zoom;

    // Buttress pier base (wider footing)
    ctx.fillStyle = st.dark;
    ctx.beginPath();
    ctx.moveTo(bx - side * 2 * zoom, screenPos.y + d * 0.38);
    ctx.lineTo(bxOuter + bxDepth, screenPos.y + d * 0.55);
    ctx.lineTo(bxOuter + bxDepth, screenPos.y + d * 0.55 - 4 * zoom);
    ctx.lineTo(bx - side * 2 * zoom, screenPos.y + d * 0.38 - 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Buttress outer face (side depth visible face)
    ctx.fillStyle = st.mid;
    ctx.beginPath();
    ctx.moveTo(bxOuter, screenPos.y + d * 0.48);
    ctx.lineTo(bxOuter + bxDepth, screenPos.y + d * 0.55);
    ctx.lineTo(bxOuter + bxDepth, bTop + d * 0.32);
    ctx.lineTo(bxOuter, bTop + d * 0.25);
    ctx.closePath();
    ctx.fill();

    // Buttress front face (main visible face)
    const buttFaceGrad = ctx.createLinearGradient(
      bx, screenPos.y, bxOuter, bTop,
    );
    buttFaceGrad.addColorStop(0, st.base);
    buttFaceGrad.addColorStop(0.5, st.light);
    buttFaceGrad.addColorStop(1, st.base);
    ctx.fillStyle = buttFaceGrad;
    ctx.beginPath();
    ctx.moveTo(bx, screenPos.y + d * 0.35);
    ctx.lineTo(bxOuter, screenPos.y + d * 0.48);
    ctx.lineTo(bxOuter, bTop + d * 0.25);
    ctx.lineTo(bx, bTop + d * 0.12);
    ctx.closePath();
    ctx.fill();

    // Buttress stepped stone course lines with fills
    ctx.lineWidth = 0.7 * zoom;
    for (let row = 0; row < 6; row++) {
      const rowFrac = row / 6;
      const rowY =
        screenPos.y +
        d * 0.35 -
        rowFrac * (screenPos.y + d * 0.35 - bTop - d * 0.12);
      const rowYO =
        screenPos.y +
        d * 0.48 -
        rowFrac * (screenPos.y + d * 0.48 - bTop - d * 0.25);
      ctx.strokeStyle = st.dark;
      ctx.beginPath();
      ctx.moveTo(bx, rowY);
      ctx.lineTo(bxOuter, rowYO);
      ctx.stroke();
      if (row % 2 === 0) {
        ctx.strokeStyle = `rgba(${stTint.a}, 0.06)`;
        ctx.beginPath();
        ctx.moveTo(bx, rowY - 1 * zoom);
        ctx.lineTo(bxOuter, rowYO - 1 * zoom);
        ctx.stroke();
      }
    }

    // Buttress pinnacle cap (proper 3D pointed shape)
    const pinnCX = screenPos.x + side * w * 1.02;
    ctx.fillStyle = st.pale;
    ctx.beginPath();
    ctx.moveTo(pinnCX, bTop - 8 * zoom);
    ctx.lineTo(bx, bTop + d * 0.08);
    ctx.lineTo(bxOuter, bTop + d * 0.2);
    ctx.lineTo(bxOuter + bxDepth, bTop + d * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = st.light;
    ctx.beginPath();
    ctx.moveTo(pinnCX, bTop - 8 * zoom);
    ctx.lineTo(bx, bTop + d * 0.08);
    ctx.lineTo(pinnCX, bTop + d * 0.02);
    ctx.closePath();
    ctx.fill();

    // Pinnacle finial spire
    ctx.fillStyle = st.palest;
    ctx.beginPath();
    ctx.moveTo(pinnCX, bTop - 14 * zoom);
    ctx.lineTo(pinnCX - 2 * zoom, bTop - 7 * zoom);
    ctx.lineTo(pinnCX + 2 * zoom, bTop - 7 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = gd.main;
    ctx.beginPath();
    ctx.arc(pinnCX, bTop - 14.5 * zoom, 1.3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Flying arch support (main upper arch — thicker with fill)
    const archMidX = screenPos.x + side * w * 1.15;
    const archTopY = screenPos.y - lowerBodyHeight * zoom * 0.5;
    ctx.fillStyle = st.base;
    ctx.lineWidth = 4 * zoom;
    ctx.strokeStyle = st.light;
    ctx.beginPath();
    ctx.moveTo(archMidX, archTopY);
    ctx.quadraticCurveTo(
      screenPos.x + side * w * 1.35,
      screenPos.y - lowerBodyHeight * zoom * 0.8,
      screenPos.x + side * w * 0.9,
      bTop - 2 * zoom,
    );
    ctx.stroke();
    ctx.lineWidth = 2 * zoom;
    ctx.strokeStyle = st.pale;
    ctx.beginPath();
    ctx.moveTo(archMidX, archTopY + 2 * zoom);
    ctx.quadraticCurveTo(
      screenPos.x + side * w * 1.32,
      screenPos.y - lowerBodyHeight * zoom * 0.77,
      screenPos.x + side * w * 0.92,
      bTop,
    );
    ctx.stroke();

    // Secondary lower arch (thinner)
    ctx.strokeStyle = st.light;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(archMidX, screenPos.y - lowerBodyHeight * zoom * 0.18);
    ctx.quadraticCurveTo(
      screenPos.x + side * w * 1.28,
      screenPos.y - lowerBodyHeight * zoom * 0.42,
      screenPos.x + side * w * 0.95,
      screenPos.y - lowerBodyHeight * zoom * 0.58,
    );
    ctx.stroke();
    ctx.strokeStyle = st.pale;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(archMidX, screenPos.y - lowerBodyHeight * zoom * 0.16);
    ctx.quadraticCurveTo(
      screenPos.x + side * w * 1.25,
      screenPos.y - lowerBodyHeight * zoom * 0.4,
      screenPos.x + side * w * 0.96,
      screenPos.y - lowerBodyHeight * zoom * 0.57,
    );
    ctx.stroke();

    // Buttress rune orb
    const buttressGlow =
      0.5 + Math.sin(time * 3 + side * 2) * 0.25 + attackPulse * 0.4;
    ctx.fillStyle = `rgba(${glowColor}, ${buttressGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom * buttressGlow;
    ctx.beginPath();
    ctx.arc(pinnCX, screenPos.y - lowerBodyHeight * zoom * 0.6, 2.5 * zoom, 0, Math.PI * 2);
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
      ctx.ellipse(pinnCX, pulseY, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Gargoyle sculpture at buttress top (larger, more detailed)
    const gX = screenPos.x + side * w * 1.2;
    const gY = bTop + 2 * zoom;
    const gScale = 1.4;

    // Gargoyle perch/pedestal
    ctx.fillStyle = st.base;
    ctx.beginPath();
    ctx.moveTo(gX - side * 2 * zoom, gY + 3 * zoom);
    ctx.lineTo(gX + side * 4 * zoom, gY + 2 * zoom);
    ctx.lineTo(gX + side * 4 * zoom, gY + 4 * zoom);
    ctx.lineTo(gX - side * 2 * zoom, gY + 5 * zoom);
    ctx.closePath();
    ctx.fill();

    // Gargoyle body (larger, crouching)
    ctx.fillStyle = "#585862";
    ctx.beginPath();
    ctx.ellipse(
      gX + side * 2 * zoom * gScale,
      gY,
      5 * zoom * gScale,
      3 * zoom * gScale,
      side * 0.25,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Body stone texture
    ctx.fillStyle = "rgba(80, 80, 90, 0.3)";
    ctx.beginPath();
    ctx.ellipse(
      gX + side * 1 * zoom * gScale,
      gY + 1 * zoom,
      3 * zoom * gScale,
      2 * zoom * gScale,
      side * 0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Gargoyle haunches (back legs)
    ctx.fillStyle = "#505058";
    ctx.beginPath();
    ctx.ellipse(
      gX - side * 1 * zoom,
      gY + 1 * zoom,
      3 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Gargoyle head (larger, angular)
    ctx.fillStyle = "#686872";
    ctx.beginPath();
    ctx.arc(
      gX + side * 6 * zoom * gScale,
      gY - 2 * zoom * gScale,
      3 * zoom * gScale,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Gargoyle snout / jaw (protruding)
    ctx.fillStyle = "#5c5c66";
    ctx.beginPath();
    ctx.moveTo(gX + side * 7 * zoom * gScale, gY - 1 * zoom * gScale);
    ctx.lineTo(gX + side * 10 * zoom * gScale, gY - 0.5 * zoom * gScale);
    ctx.lineTo(gX + side * 10 * zoom * gScale, gY + 1 * zoom * gScale);
    ctx.lineTo(gX + side * 7 * zoom * gScale, gY + 0.5 * zoom * gScale);
    ctx.closePath();
    ctx.fill();

    // Gargoyle horns (more prominent)
    ctx.strokeStyle = "#484852";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(gX + side * 5 * zoom * gScale, gY - 4 * zoom * gScale);
    ctx.quadraticCurveTo(
      gX + side * 3 * zoom * gScale,
      gY - 8 * zoom * gScale,
      gX + side * 4 * zoom * gScale,
      gY - 9 * zoom * gScale,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gX + side * 7 * zoom * gScale, gY - 4 * zoom * gScale);
    ctx.quadraticCurveTo(
      gX + side * 8 * zoom * gScale,
      gY - 8 * zoom * gScale,
      gX + side * 9 * zoom * gScale,
      gY - 8 * zoom * gScale,
    );
    ctx.stroke();

    // Gargoyle wings (larger, more dramatic folded shape)
    ctx.fillStyle = "#444450";
    ctx.beginPath();
    ctx.moveTo(gX + side * 0 * zoom, gY - 1 * zoom);
    ctx.quadraticCurveTo(
      gX - side * 3 * zoom,
      gY - 7 * zoom,
      gX + side * 2 * zoom,
      gY - 6 * zoom,
    );
    ctx.lineTo(gX + side * 4 * zoom, gY - 4 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3c3c48";
    ctx.beginPath();
    ctx.moveTo(gX + side * 0 * zoom, gY);
    ctx.quadraticCurveTo(
      gX - side * 4 * zoom,
      gY - 4 * zoom,
      gX + side * 1 * zoom,
      gY - 5 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Gargoyle tail (curled)
    ctx.strokeStyle = "#505058";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(gX - side * 3 * zoom, gY + 1 * zoom);
    ctx.quadraticCurveTo(
      gX - side * 6 * zoom,
      gY - 2 * zoom,
      gX - side * 5 * zoom,
      gY - 4 * zoom,
    );
    ctx.stroke();

    // Gargoyle eyes (always dimly glowing)
    const gEyeGlow = 0.3 + Math.sin(time * 2 + side) * 0.15 + attackPulse * 1.2;
    ctx.fillStyle = `rgba(${glowColor}, ${Math.min(1, gEyeGlow)})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 3 * zoom * gEyeGlow;
    ctx.beginPath();
    ctx.arc(
      gX + side * 5.5 * zoom * gScale,
      gY - 2.5 * zoom * gScale,
      1.2 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      gX + side * 7.5 * zoom * gScale,
      gY - 2.5 * zoom * gScale,
      1.2 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Gothic pinnacles on roof corners
  for (const corner of [0, 1, 2, 3]) {
    const pSide = corner < 2 ? -1 : 1;
    const pDepth = corner % 2 === 0 ? -1 : 1;
    const pinnX = screenPos.x + pSide * w * 0.75;
    const pinnBaseY = screenPos.y - lowerBodyHeight * zoom + pDepth * d * 0.3;
    const lpH = 18 * zoom;
    const lpW = 3 * zoom;

    // Gablet base transition (small diamond platform)
    ctx.fillStyle = st.pale;
    ctx.beginPath();
    ctx.moveTo(pinnX - lpW - 1.5 * zoom, pinnBaseY);
    ctx.lineTo(pinnX, pinnBaseY - 2.5 * zoom);
    ctx.lineTo(pinnX + lpW + 1.5 * zoom, pinnBaseY);
    ctx.lineTo(pinnX, pinnBaseY + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Left face of shaft
    ctx.fillStyle = st.light;
    ctx.beginPath();
    ctx.moveTo(pinnX - lpW, pinnBaseY);
    ctx.lineTo(pinnX, pinnBaseY + lpW * 0.5);
    ctx.lineTo(pinnX, pinnBaseY + lpW * 0.5 - lpH * 0.55);
    ctx.lineTo(pinnX - lpW * 0.75, pinnBaseY - lpH * 0.55);
    ctx.closePath();
    ctx.fill();

    // Right face of shaft
    ctx.fillStyle = st.base;
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnBaseY + lpW * 0.5);
    ctx.lineTo(pinnX + lpW, pinnBaseY);
    ctx.lineTo(pinnX + lpW * 0.75, pinnBaseY - lpH * 0.55);
    ctx.lineTo(pinnX, pinnBaseY + lpW * 0.5 - lpH * 0.55);
    ctx.closePath();
    ctx.fill();

    // Left face of pointed tip
    ctx.fillStyle = st.pale;
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnBaseY - lpH);
    ctx.lineTo(pinnX - lpW * 0.75, pinnBaseY - lpH * 0.5);
    ctx.lineTo(pinnX, pinnBaseY - lpH * 0.5 + lpW * 0.35);
    ctx.closePath();
    ctx.fill();

    // Right face of pointed tip
    ctx.fillStyle = st.mid;
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnBaseY - lpH);
    ctx.lineTo(pinnX, pinnBaseY - lpH * 0.5 + lpW * 0.35);
    ctx.lineTo(pinnX + lpW * 0.75, pinnBaseY - lpH * 0.5);
    ctx.closePath();
    ctx.fill();

    // Crockets along edges
    for (let c = 0; c < 5; c++) {
      const crocketFrac = 0.2 + c * 0.15;
      const crocketY = pinnBaseY - lpH * crocketFrac;
      ctx.fillStyle = gd.sub;
      ctx.beginPath();
      ctx.arc(
        pinnX - lpW * 0.6 * (1 - crocketFrac * 0.4),
        crocketY,
        0.9 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        pinnX + lpW * 0.6 * (1 - crocketFrac * 0.4),
        crocketY,
        0.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Finial orb
    ctx.fillStyle = gd.main;
    ctx.beginPath();
    ctx.arc(pinnX, pinnBaseY - lpH - 1.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 230, 150, 0.4)";
    ctx.beginPath();
    ctx.arc(pinnX - 0.4 * zoom, pinnBaseY - lpH - 2 * zoom, 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Pinnacle glow during attack
    if (attackPulse > 0.05) {
      ctx.fillStyle = `rgba(${glowColor}, ${attackPulse * 0.6})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.arc(pinnX, pinnBaseY - lpH * 0.7, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Gothic windows on lower body (flush with left/right faces)
  const windowYBase = screenPos.y - lowerBodyHeight * zoom * 0.25;
  const glowIntensity = 0.5 + Math.sin(time * 2) * 0.3 + attackPulse;
  const libraryWindowColors = {
    frame: st.dark,
    void: `${mainColor} ${glowIntensity * 0.9})`,
    sill: st.dark,
  };
  const isUpgraded = tower.level === 4 && !!tower.upgrade;

  type WinPos = { cx: number; cy: number; ww: number; wh: number; s: number };
  const lowerWins: WinPos[] = [];

  if (isUpgraded) {
    const twinW = 3.5;
    const twinH = 8;
    drawIsoGothicWindow(ctx, sX - w * 0.82, windowYBase + 0.18 * d, twinW, twinH, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX - w * 0.18, windowYBase + 0.82 * d, twinW, twinH, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + w * 0.82, windowYBase + 0.18 * d, twinW, twinH, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + w * 0.18, windowYBase + 0.82 * d, twinW, twinH, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
    lowerWins.push(
      { cx: sX - w * 0.82, cy: windowYBase + 0.18 * d, ww: twinW, wh: twinH, s: 0.5 },
      { cx: sX - w * 0.18, cy: windowYBase + 0.82 * d, ww: twinW, wh: twinH, s: 0.5 },
      { cx: sX + w * 0.82, cy: windowYBase + 0.18 * d, ww: twinW, wh: twinH, s: -0.5 },
      { cx: sX + w * 0.18, cy: windowYBase + 0.82 * d, ww: twinW, wh: twinH, s: -0.5 },
    );
  } else {
    drawIsoGothicWindow(ctx, sX - w * 0.5, windowYBase + 0.5 * d, 5, 10, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + w * 0.5, windowYBase + 0.5 * d, 5, 10, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
    lowerWins.push(
      { cx: sX - w * 0.5, cy: windowYBase + 0.5 * d, ww: 5, wh: 10, s: 0.5 },
      { cx: sX + w * 0.5, cy: windowYBase + 0.5 * d, ww: 5, wh: 10, s: -0.5 },
    );
  }

  // Window hood molds (drip moldings), mullions, and tracery
  for (const wp of lowerWins) {
    const hw = wp.ww * zoom * 0.5;
    const hh = wp.wh * zoom * 0.5;
    const peak = hh + 2.5 * zoom;
    const ext = 2 * zoom;

    // Stone hood mold arch surround
    ctx.strokeStyle = st.pale;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(wp.cx - hw - ext, wp.cy + hh + (-hw - ext) * wp.s);
    ctx.lineTo(wp.cx - hw - ext, wp.cy - hh + (-hw - ext) * wp.s);
    ctx.lineTo(wp.cx, wp.cy - peak - ext);
    ctx.lineTo(wp.cx + hw + ext, wp.cy - hh + (hw + ext) * wp.s);
    ctx.lineTo(wp.cx + hw + ext, wp.cy + hh + (hw + ext) * wp.s);
    ctx.stroke();

    // Hood mold highlight (catches upper-left light)
    ctx.strokeStyle = st.palest;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(wp.cx - hw - ext, wp.cy - hh + (-hw - ext) * wp.s - zoom);
    ctx.lineTo(wp.cx, wp.cy - peak - ext - zoom);
    ctx.lineTo(wp.cx + hw + ext, wp.cy - hh + (hw + ext) * wp.s - zoom);
    ctx.stroke();

    // Stone mullion (vertical divider)
    ctx.strokeStyle = st.dark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(wp.cx, wp.cy - peak + 1.5 * zoom);
    ctx.lineTo(wp.cx, wp.cy + hh);
    ctx.stroke();

    // Tracery fork at top of mullion
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(wp.cx, wp.cy - peak + 3 * zoom);
    ctx.quadraticCurveTo(
      wp.cx - hw * 0.4, wp.cy - hh + (-hw * 0.4) * wp.s,
      wp.cx - hw + zoom, wp.cy - hh + (-hw + zoom) * wp.s,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wp.cx, wp.cy - peak + 3 * zoom);
    ctx.quadraticCurveTo(
      wp.cx + hw * 0.4, wp.cy - hh + (hw * 0.4) * wp.s,
      wp.cx + hw - zoom, wp.cy - hh + (hw - zoom) * wp.s,
    );
    ctx.stroke();
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

  ctx.fillStyle = st.palest;
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

  ctx.fillStyle = st.top;
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
  ctx.strokeStyle = st.dark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(sX, plateY - 2 * zoom, stoneRX + 2 * zoom, stoneRY + 1 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Stone tablet surface (darker than plate, like inlaid stone)
  ctx.fillStyle = st.base;
  ctx.beginPath();
  ctx.ellipse(sX, plateY - 2 * zoom, stoneRX + 1 * zoom, stoneRY + 0.5 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = st.light;
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
    ctx.fillStyle = st.dark;
    ctx.fillRect(
      railX - 4 * zoom + (dx > 0 ? 6 * zoom : 0),
      railTop,
      2 * zoom,
      railH,
    );

    // Main rail body
    ctx.fillStyle = st.mid;
    ctx.fillRect(railX - 4 * zoom, railTop, 8 * zoom, railH);

    // Rail highlight edge
    ctx.fillStyle = st.light;
    ctx.fillRect(
      railX - 4 * zoom + (dx < 0 ? 0 : 6 * zoom),
      railTop,
      2 * zoom,
      railH,
    );

    // Rail cap (chamfered top)
    ctx.fillStyle = st.pale;
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
      ctx.fillStyle = gd.main;
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
      top: st.pale,
      left: st.light,
      right: st.base,
      leftBack: st.palest,
      rightBack: st.pale,
    },
    zoom,
  );

  // Ambient occlusion on upper body faces
  {
    const aoUW = (baseWidth - 4) * zoom * 0.5;
    const aoUD = (baseWidth - 4) * zoom * ISO_PRISM_D_FACTOR;
    const aoUH = baseHeight * 0.4 * zoom;
    const aoLeft = ctx.createLinearGradient(sX - aoUW, pistonTopY - aoUH, sX - aoUW, pistonTopY);
    aoLeft.addColorStop(0, "rgba(0, 0, 0, 0)");
    aoLeft.addColorStop(0.7, "rgba(0, 0, 0, 0.05)");
    aoLeft.addColorStop(1, "rgba(0, 0, 0, 0.15)");
    ctx.fillStyle = aoLeft;
    ctx.beginPath();
    ctx.moveTo(sX - aoUW, pistonTopY);
    ctx.lineTo(sX, pistonTopY + aoUD);
    ctx.lineTo(sX, pistonTopY + aoUD - aoUH);
    ctx.lineTo(sX - aoUW, pistonTopY - aoUH);
    ctx.closePath();
    ctx.fill();
    const aoRight = ctx.createLinearGradient(sX + aoUW, pistonTopY - aoUH, sX + aoUW, pistonTopY);
    aoRight.addColorStop(0, "rgba(0, 0, 0, 0.03)");
    aoRight.addColorStop(0.7, "rgba(0, 0, 0, 0.08)");
    aoRight.addColorStop(1, "rgba(0, 0, 0, 0.18)");
    ctx.fillStyle = aoRight;
    ctx.beginPath();
    ctx.moveTo(sX, pistonTopY + aoUD);
    ctx.lineTo(sX + aoUW, pistonTopY);
    ctx.lineTo(sX + aoUW, pistonTopY - aoUH);
    ctx.lineTo(sX, pistonTopY + aoUD - aoUH);
    ctx.closePath();
    ctx.fill();
  }

  // Piston connector ring — ornate cornice band with 3D depth
  const connRX = (baseWidth - 2) * zoom * 0.5;
  const connRY = (baseWidth - 2) * zoom * ISO_PRISM_D_FACTOR;
  const connY = pistonTopY + 2 * zoom;
  const connDepth = 3.5 * zoom;

  // Ring body top face (back half first)
  ctx.fillStyle = st.base;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, connY, connRX, connRY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left half of top face matches left face
  ctx.fillStyle = st.light;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, connY, connRX, connRY, 0, Math.PI * 0.5, Math.PI * 1.5);
  ctx.closePath();
  ctx.fill();

  // Front lip / cornice depth (vertical face on front arc)
  const lipSegments = 32;
  for (let seg = 0; seg < lipSegments; seg++) {
    const a0 = (seg / lipSegments) * Math.PI;
    const a1 = ((seg + 1) / lipSegments) * Math.PI;
    if (Math.sin((a0 + a1) / 2) <= 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * connRX;
    const y0 = connY + Math.sin(a0) * connRY;
    const x1 = screenPos.x + Math.cos(a1) * connRX;
    const y1 = connY + Math.sin(a1) * connRY;
    const lipShade = a0 < Math.PI * 0.5 ? st.mid : st.dark;
    ctx.fillStyle = lipShade;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1, y1 + connDepth);
    ctx.lineTo(x0, y0 + connDepth);
    ctx.closePath();
    ctx.fill();
  }

  // Gold trim along top edge
  ctx.strokeStyle = `rgba(${gd.rgba}, 0.5)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, connY - 0.5 * zoom, connRX * 0.96, connRY * 0.96, 0, 0, Math.PI);
  ctx.stroke();

  // Lower gold trim along bottom edge of lip
  ctx.strokeStyle = `rgba(${gd.rgba}, 0.3)`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI;
    const px = screenPos.x + Math.cos(a) * connRX;
    const py = connY + Math.sin(a) * connRY + connDepth;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Front border (top)
  ctx.strokeStyle = st.dark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, connY, connRX, connRY, 0, 0, Math.PI);
  ctx.stroke();

  // Dentil molding along connector ring (3D blocks on lip)
  for (let dm = 1; dm < 12; dm++) {
    const dmAngle = (dm / 12) * Math.PI;
    const dmX = screenPos.x + Math.cos(dmAngle) * connRX * 0.93;
    const dmY = connY + Math.sin(dmAngle) * connRY * 0.93;
    ctx.fillStyle = st.palest;
    ctx.fillRect(dmX - 1 * zoom, dmY - 1 * zoom, 2 * zoom, 1.5 * zoom);
    ctx.fillStyle = st.pale;
    ctx.fillRect(dmX - 1 * zoom, dmY + 0.5 * zoom, 2 * zoom, connDepth * 0.5);
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
          ? stTint.a
          : shade === 1
            ? stTint.b
            : stTint.c;
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
    ctx.strokeStyle = st.mortar;
    ctx.beginPath();
    ctx.moveTo(sX - uw, yEdge);
    ctx.lineTo(sX, yEdge + ud);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sX, yEdge + ud);
    ctx.lineTo(sX + uw, yEdge);
    ctx.stroke();
    ctx.strokeStyle = `${mortarHl} 0.2)`;
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
  // Placed above the Gothic windows, centered on each face
  for (let i = 0; i < Math.min(tower.level, 3); i++) {
    const ventFrac = 0.55 + i * 0.12;
    const ventBaseY = screenPos.y - lowerBodyHeight * zoom * ventFrac;
    const ventGlow =
      0.3 + Math.sin(time * 4 + i * 0.5) * 0.15 + attackPulse * 0.3;

    for (const side of [-1, 1]) {
      const ventU = 0.5;
      const vx = sX + side * w * ventU;
      const face = side === -1 ? ("left" as const) : ("right" as const);
      const vy = ventBaseY + (1 - ventU) * d;

      drawIsoFlushVent(ctx, vx, vy, 4, 3, face, zoom, {
        frameColor: st.dark,
        bgColor: st.void,
        slatColor: st.base,
        slats: 3,
      });

      ctx.fillStyle = `rgba(${glowColor}, ${ventGlow * 0.5})`;
      traceIsoFlushRect(ctx, vx, vy, 3, 2, face, zoom);
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
    const pinnH = 15 * zoom;
    const pinnW = 3 * zoom;

    // Gablet base (small gabled roof transition)
    ctx.fillStyle = st.pale;
    ctx.beginPath();
    ctx.moveTo(pinnX - pinnW - 1 * zoom, pinnY);
    ctx.lineTo(pinnX, pinnY - 2 * zoom);
    ctx.lineTo(pinnX + pinnW + 1 * zoom, pinnY);
    ctx.lineTo(pinnX, pinnY + 1.5 * zoom);
    ctx.closePath();
    ctx.fill();

    // Left face of pinnacle shaft
    ctx.fillStyle = st.light;
    ctx.beginPath();
    ctx.moveTo(pinnX - pinnW, pinnY);
    ctx.lineTo(pinnX, pinnY + pinnW * 0.5);
    ctx.lineTo(pinnX, pinnY + pinnW * 0.5 - pinnH * 0.6);
    ctx.lineTo(pinnX - pinnW * 0.7, pinnY - pinnH * 0.6);
    ctx.closePath();
    ctx.fill();

    // Right face of pinnacle shaft
    ctx.fillStyle = st.base;
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnY + pinnW * 0.5);
    ctx.lineTo(pinnX + pinnW, pinnY);
    ctx.lineTo(pinnX + pinnW * 0.7, pinnY - pinnH * 0.6);
    ctx.lineTo(pinnX, pinnY + pinnW * 0.5 - pinnH * 0.6);
    ctx.closePath();
    ctx.fill();

    // Left face of pointed tip
    ctx.fillStyle = st.pale;
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnY - pinnH);
    ctx.lineTo(pinnX - pinnW * 0.7, pinnY - pinnH * 0.55);
    ctx.lineTo(pinnX, pinnY - pinnH * 0.55 + pinnW * 0.35);
    ctx.closePath();
    ctx.fill();

    // Right face of pointed tip
    ctx.fillStyle = st.mid;
    ctx.beginPath();
    ctx.moveTo(pinnX, pinnY - pinnH);
    ctx.lineTo(pinnX, pinnY - pinnH * 0.55 + pinnW * 0.35);
    ctx.lineTo(pinnX + pinnW * 0.7, pinnY - pinnH * 0.55);
    ctx.closePath();
    ctx.fill();

    // Crockets along edges
    for (let c = 0; c < 4; c++) {
      const crocketFrac = 0.25 + c * 0.18;
      const crocketY = pinnY - pinnH * crocketFrac;
      ctx.fillStyle = st.palest;
      ctx.beginPath();
      ctx.arc(
        pinnX - pinnW * 0.6 * (1 - crocketFrac * 0.5),
        crocketY,
        0.9 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = st.light;
      ctx.beginPath();
      ctx.arc(
        pinnX + pinnW * 0.6 * (1 - crocketFrac * 0.5),
        crocketY,
        0.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Finial orb at top
    ctx.fillStyle = gd.main;
    ctx.beginPath();
    ctx.arc(pinnX, pinnY - pinnH - 1.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 230, 150, 0.4)";
    ctx.beginPath();
    ctx.arc(pinnX - 0.4 * zoom, pinnY - pinnH - 2 * zoom, 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== OBSERVATION BALCONY ==========
  const balconyY = topY + 4 * zoom;
  const balconyW = baseWidth * zoom * 0.48;
  const balconyD = baseWidth * zoom * 0.24;

  // Balcony underside (corbel support — 3D depth)
  ctx.fillStyle = st.dark;
  ctx.beginPath();
  ctx.moveTo(sX - balconyW, balconyY);
  ctx.lineTo(sX, balconyY + balconyD);
  ctx.lineTo(sX, balconyY + balconyD + 3 * zoom);
  ctx.lineTo(sX - balconyW * 0.7, balconyY + 3 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = st.mortar;
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
    ctx.fillStyle = st.base;
    ctx.beginPath();
    ctx.moveTo(cbX - 1.5 * zoom, cbY + 3 * zoom);
    ctx.lineTo(cbX, cbY + 6 * zoom);
    ctx.lineTo(cbX + 1.5 * zoom, cbY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Balcony floor (isometric slab)
  ctx.fillStyle = st.light;
  ctx.beginPath();
  ctx.moveTo(sX - balconyW, balconyY);
  ctx.lineTo(sX, balconyY - balconyD);
  ctx.lineTo(sX + balconyW, balconyY);
  ctx.lineTo(sX, balconyY + balconyD);
  ctx.closePath();
  ctx.fill();

  // Balcony floor tile pattern
  ctx.strokeStyle = `rgba(${tileRgba}, 0.3)`;
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
  ctx.strokeStyle = `rgba(${gd.rgba}, 0.35)`;
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
    ctx.fillStyle = `rgba(${railRgba}, 0.45)`;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p1.x, p1.y - railH);
    ctx.lineTo(p0.x, p0.y - railH);
    ctx.closePath();
    ctx.fill();

    // Gothic arch cutout (decorative)
    ctx.strokeStyle = `rgba(${tileRgba}, 0.5)`;
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
    ctx.fillStyle = st.base;
    ctx.fillRect(post.x - 1 * zoom, post.y - railH, 2 * zoom, railH);
    // Post cap (gold finial)
    ctx.fillStyle = gd.main;
    ctx.beginPath();
    ctx.moveTo(post.x, post.y - railH - 1.5 * zoom);
    ctx.lineTo(post.x - 1.2 * zoom, post.y - railH);
    ctx.lineTo(post.x + 1.2 * zoom, post.y - railH);
    ctx.closePath();
    ctx.fill();
  }

  // Upper railing bar
  ctx.strokeStyle = st.base;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(railPosts[0].x, railPosts[0].y - railH);
  for (let i = 1; i < railPosts.length; i++) {
    ctx.lineTo(railPosts[i].x, railPosts[i].y - railH);
  }
  ctx.stroke();

  // Lower railing bar
  ctx.strokeStyle = st.mid;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(railPosts[0].x, railPosts[0].y - railH * 0.35);
  for (let i = 1; i < railPosts.length; i++) {
    ctx.lineTo(railPosts[i].x, railPosts[i].y - railH * 0.35);
  }
  ctx.stroke();

  // Compute spireHeight early so orbital effects can reference it
  const spireHeight = (24 + tower.level * 5) * zoom;

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

  const spireW = baseWidth * zoom * 0.38;
  const spireD = baseWidth * zoom * 0.19;
  const apexY = topY - spireHeight;

  // Overhanging eaves cornice with 3D depth
  const eaveExt = 3 * zoom;
  ctx.fillStyle = st.pale;
  ctx.beginPath();
  ctx.moveTo(sX - spireW - eaveExt, topY + 1 * zoom);
  ctx.lineTo(sX, topY - spireD - eaveExt * 0.5);
  ctx.lineTo(sX + spireW + eaveExt, topY + 1 * zoom);
  ctx.lineTo(sX, topY + spireD + eaveExt * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = st.base;
  ctx.beginPath();
  ctx.moveTo(sX - spireW - eaveExt, topY + 1 * zoom);
  ctx.lineTo(sX, topY + spireD + eaveExt * 0.5);
  ctx.lineTo(sX, topY + spireD + eaveExt * 0.5 + 3 * zoom);
  ctx.lineTo(sX - spireW - eaveExt, topY + 4 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = st.dark;
  ctx.beginPath();
  ctx.moveTo(sX, topY + spireD + eaveExt * 0.5);
  ctx.lineTo(sX + spireW + eaveExt, topY + 1 * zoom);
  ctx.lineTo(sX + spireW + eaveExt, topY + 4 * zoom);
  ctx.lineTo(sX, topY + spireD + eaveExt * 0.5 + 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // Left roof face with gradient (lit side — catches upper-left light)
  const leftRoofGrad = ctx.createLinearGradient(
    sX - spireW, topY, sX, apexY,
  );
  leftRoofGrad.addColorStop(0, st.mid);
  leftRoofGrad.addColorStop(0.4, st.dark);
  leftRoofGrad.addColorStop(1, st.mortar);
  ctx.fillStyle = leftRoofGrad;
  ctx.beginPath();
  ctx.moveTo(sX, apexY);
  ctx.lineTo(sX - spireW, topY);
  ctx.lineTo(sX, topY + spireD);
  ctx.closePath();
  ctx.fill();

  // Right roof face with gradient (shadow side)
  const rightRoofGrad = ctx.createLinearGradient(
    sX + spireW, topY, sX, apexY,
  );
  rightRoofGrad.addColorStop(0, st.mortar);
  rightRoofGrad.addColorStop(0.4, st.void);
  rightRoofGrad.addColorStop(1, st.void);
  ctx.fillStyle = rightRoofGrad;
  ctx.beginPath();
  ctx.moveTo(sX, apexY);
  ctx.lineTo(sX, topY + spireD);
  ctx.lineTo(sX + spireW, topY);
  ctx.closePath();
  ctx.fill();

  // Slate shingle course lines on left face
  const numCourses = 10;
  ctx.lineWidth = 0.5 * zoom;
  for (let c = 1; c < numCourses; c++) {
    const t = c / numCourses;
    const lEdgeX = sX - spireW * (1 - t);
    const lEdgeY = topY + (apexY - topY) * t;
    const fEdgeY = topY + spireD * (1 - t) + (apexY - topY) * t;
    ctx.strokeStyle = c % 2 === 0
      ? `rgba(${stTint.b}, 0.25)`
      : `rgba(${stTint.a}, 0.12)`;
    ctx.beginPath();
    ctx.moveTo(lEdgeX, lEdgeY);
    ctx.lineTo(sX, fEdgeY);
    ctx.stroke();
  }

  // Slate shingle course lines on right face
  for (let c = 1; c < numCourses; c++) {
    const t = c / numCourses;
    const rEdgeX = sX + spireW * (1 - t);
    const rEdgeY = topY + (apexY - topY) * t;
    const fEdgeY = topY + spireD * (1 - t) + (apexY - topY) * t;
    ctx.strokeStyle = c % 2 === 0
      ? "rgba(10, 5, 0, 0.2)"
      : "rgba(20, 10, 5, 0.08)";
    ctx.beginPath();
    ctx.moveTo(sX, fEdgeY);
    ctx.lineTo(rEdgeX, rEdgeY);
    ctx.stroke();
  }

  // Vertical shingle stagger marks (brick-bond pattern)
  ctx.lineWidth = 0.3 * zoom;
  ctx.strokeStyle = `rgba(${stTint.b}, 0.12)`;
  for (let c = 0; c < numCourses - 1; c++) {
    const t1 = c / numCourses;
    const t2 = (c + 1) / numCourses;
    const nTicks = Math.max(1, Math.floor(3 * (1 - t1)));
    for (let s = 0; s < nTicks; s++) {
      const u = (s + (c % 2) * 0.5 + 0.5) / (nTicks + 1);
      if (u < 0.1 || u > 0.9) continue;
      const x1L = sX - spireW * (1 - t1);
      const y1L = topY + (apexY - topY) * t1;
      const y1F = topY + spireD * (1 - t1) + (apexY - topY) * t1;
      const x2L = sX - spireW * (1 - t2);
      const y2L = topY + (apexY - topY) * t2;
      const y2F = topY + spireD * (1 - t2) + (apexY - topY) * t2;
      ctx.beginPath();
      ctx.moveTo(x1L + (sX - x1L) * u, y1L + (y1F - y1L) * u);
      ctx.lineTo(x2L + (sX - x2L) * u, y2L + (y2F - y2L) * u);
      ctx.stroke();
    }
  }

  // Front ridge — raised lead cap with 3D depth (two-tone filled strip)
  {
    const ridgeHW = 1.8 * zoom;
    // Left lit side of front ridge cap
    ctx.fillStyle = st.palest;
    ctx.beginPath();
    ctx.moveTo(sX - ridgeHW, topY + spireD);
    ctx.lineTo(sX, topY + spireD - ridgeHW * 0.3);
    ctx.lineTo(sX, apexY);
    ctx.lineTo(sX - ridgeHW * 0.3, apexY + 1 * zoom);
    ctx.closePath();
    ctx.fill();
    // Right shadow side of front ridge cap
    ctx.fillStyle = st.mid;
    ctx.beginPath();
    ctx.moveTo(sX, topY + spireD - ridgeHW * 0.3);
    ctx.lineTo(sX + ridgeHW, topY + spireD);
    ctx.lineTo(sX + ridgeHW * 0.3, apexY + 1 * zoom);
    ctx.lineTo(sX, apexY);
    ctx.closePath();
    ctx.fill();
    // Gold center highlight line
    ctx.strokeStyle = `rgba(${gd.rgba}, 0.2)`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(sX, topY + spireD - ridgeHW * 0.3);
    ctx.lineTo(sX, apexY);
    ctx.stroke();
  }

  // Left ridge — raised lead cap
  {
    const ridgeHW = 1.2 * zoom;
    ctx.fillStyle = st.palest;
    ctx.beginPath();
    ctx.moveTo(sX - spireW, topY);
    ctx.lineTo(sX - spireW + ridgeHW * 0.5, topY - ridgeHW * 0.4);
    ctx.lineTo(sX + ridgeHW * 0.15, apexY);
    ctx.lineTo(sX, apexY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = st.light;
    ctx.beginPath();
    ctx.moveTo(sX - spireW, topY);
    ctx.lineTo(sX - spireW - ridgeHW * 0.5, topY + ridgeHW * 0.4);
    ctx.lineTo(sX - ridgeHW * 0.15, apexY);
    ctx.lineTo(sX, apexY);
    ctx.closePath();
    ctx.fill();
  }

  // Right ridge — raised lead cap
  {
    const ridgeHW = 1 * zoom;
    ctx.fillStyle = st.base;
    ctx.beginPath();
    ctx.moveTo(sX + spireW, topY);
    ctx.lineTo(sX + spireW - ridgeHW * 0.5, topY - ridgeHW * 0.4);
    ctx.lineTo(sX - ridgeHW * 0.15, apexY);
    ctx.lineTo(sX, apexY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = st.dark;
    ctx.beginPath();
    ctx.moveTo(sX + spireW, topY);
    ctx.lineTo(sX + spireW + ridgeHW * 0.5, topY + ridgeHW * 0.4);
    ctx.lineTo(sX + ridgeHW * 0.15, apexY);
    ctx.lineTo(sX, apexY);
    ctx.closePath();
    ctx.fill();
  }

  // Ridge crockets — larger, properly placed decorative stone buds
  for (let rc = 0; rc < 7; rc++) {
    const t = 0.08 + rc * 0.12;
    // Front ridge crockets (most visible)
    const frY = topY + spireD * (1 - t) + (apexY - topY) * t;
    const crSize = (1.6 - t * 0.6) * zoom;
    // Left bud (lit)
    ctx.fillStyle = st.palest;
    ctx.beginPath();
    ctx.arc(sX - 1.8 * zoom, frY - 0.8 * zoom, crSize, 0, Math.PI * 2);
    ctx.fill();
    // Right bud (shadow)
    ctx.fillStyle = st.light;
    ctx.beginPath();
    ctx.arc(sX + 1.8 * zoom, frY + 0.3 * zoom, crSize * 0.85, 0, Math.PI * 2);
    ctx.fill();
    // Center tip (gold accent at every other crocket)
    if (rc % 2 === 0) {
      ctx.fillStyle = `rgba(${gd.rgba}, 0.35)`;
      ctx.beginPath();
      ctx.arc(sX, frY - 0.3 * zoom, crSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Left ridge crockets
    const lrX = sX - spireW * (1 - t);
    const lrY = topY + (apexY - topY) * t;
    ctx.fillStyle = st.top;
    ctx.beginPath();
    ctx.arc(lrX + 0.5 * zoom, lrY - 1 * zoom, crSize * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = st.pale;
    ctx.beginPath();
    ctx.arc(lrX - 0.5 * zoom, lrY + 0.5 * zoom, crSize * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Right ridge crockets
    const rrX = sX + spireW * (1 - t);
    ctx.fillStyle = st.base;
    ctx.beginPath();
    ctx.arc(rrX - 0.5 * zoom, lrY - 0.8 * zoom, crSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dormer window (lucarne) on left face
  {
    const dt = 0.22;
    const dW = 5 * zoom;
    const dH = 8 * zoom;
    const dlx = sX - spireW * (1 - dt);
    const dly = topY + (apexY - topY) * dt;
    const dfy = topY + spireD * (1 - dt) + (apexY - topY) * dt;
    const dcx = dlx + (sX - dlx) * 0.45;
    const dcy = dly + (dfy - dly) * 0.45;
    ctx.fillStyle = st.dark;
    ctx.beginPath();
    ctx.moveTo(dcx - dW * 0.1, dcy - dH * 0.85);
    ctx.lineTo(dcx - dW, dcy);
    ctx.lineTo(dcx + dW * 0.5, dcy + dW * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = st.pale;
    ctx.beginPath();
    ctx.moveTo(dcx - dW * 0.8, dcy + 0.5 * zoom);
    ctx.lineTo(dcx + dW * 0.35, dcy + dW * 0.2);
    ctx.lineTo(dcx + dW * 0.35, dcy + dH * 0.35);
    ctx.lineTo(dcx - dW * 0.8, dcy + dH * 0.35);
    ctx.closePath();
    ctx.fill();
    const dormerGlow = 0.35 + Math.sin(time * 2) * 0.15;
    ctx.fillStyle = `rgba(${glowColor}, ${dormerGlow})`;
    ctx.beginPath();
    ctx.moveTo(dcx - dW * 0.5, dcy + dH * 0.3);
    ctx.lineTo(dcx - dW * 0.5, dcy - dH * 0.12);
    ctx.quadraticCurveTo(dcx - dW * 0.1, dcy - dH * 0.4, dcx + dW * 0.2, dcy - dH * 0.08);
    ctx.lineTo(dcx + dW * 0.2, dcy + dH * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = st.dark;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // Dormer window (lucarne) on right face
  {
    const dt = 0.28;
    const dW = 4.5 * zoom;
    const dH = 7 * zoom;
    const drx = sX + spireW * (1 - dt);
    const dry = topY + (apexY - topY) * dt;
    const dfy = topY + spireD * (1 - dt) + (apexY - topY) * dt;
    const dcx = drx + (sX - drx) * 0.45;
    const dcy = dry + (dfy - dry) * 0.45;
    ctx.fillStyle = st.void;
    ctx.beginPath();
    ctx.moveTo(dcx + dW * 0.1, dcy - dH * 0.8);
    ctx.lineTo(dcx - dW * 0.5, dcy + dW * 0.25);
    ctx.lineTo(dcx + dW, dcy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = st.base;
    ctx.beginPath();
    ctx.moveTo(dcx - dW * 0.35, dcy + dW * 0.2);
    ctx.lineTo(dcx + dW * 0.8, dcy + 0.5 * zoom);
    ctx.lineTo(dcx + dW * 0.8, dcy + dH * 0.3);
    ctx.lineTo(dcx - dW * 0.35, dcy + dH * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(${glowColor}, ${0.25 + Math.sin(time * 2.3) * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(dcx + dW * 0.5, dcy + dH * 0.25);
    ctx.lineTo(dcx + dW * 0.5, dcy - dH * 0.08);
    ctx.quadraticCurveTo(dcx + dW * 0.1, dcy - dH * 0.35, dcx - dW * 0.15, dcy - dH * 0.05);
    ctx.lineTo(dcx - dW * 0.15, dcy + dH * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = st.mortar;
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }

  // Glowing rune bands on spire faces
  const spireRunes = ["ᚷ", "ᚹ", "ᚺ", "ᛁ"];
  for (let band = 0; band < 4; band++) {
    const t = 0.2 + band * 0.18;
    const lBandX = sX - spireW * (1 - t);
    const lBandY = topY + (apexY - topY) * t;
    const fBandY = topY + spireD * (1 - t) + (apexY - topY) * t;
    const rBandX = sX + spireW * (1 - t);
    const bandRuneGlow = 0.3 + Math.sin(time * 3 + band) * 0.2 + attackPulse * 0.25;
    ctx.strokeStyle = `rgba(${glowColor}, ${bandRuneGlow * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(lBandX, lBandY);
    ctx.lineTo(sX, fBandY);
    ctx.lineTo(rBandX, lBandY);
    ctx.stroke();
    ctx.fillStyle = `rgba(${glowColor}, ${bandRuneGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.font = `${5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(spireRunes[band], (lBandX + sX) / 2, (lBandY + fBandY) / 2);
    ctx.shadowBlur = 0;
  }

  // Spire finial (ornate gold cap with orb)
  ctx.fillStyle = gd.main;
  ctx.beginPath();
  ctx.moveTo(sX, apexY - 7 * zoom);
  ctx.lineTo(sX - 3 * zoom, apexY + 2 * zoom);
  ctx.lineTo(sX + 3 * zoom, apexY + 2 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sX, apexY - 8 * zoom, 1.8 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 230, 150, 0.5)";
  ctx.beginPath();
  ctx.arc(sX - 0.5 * zoom, apexY - 8.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
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
  ctx.strokeStyle = gd.main;
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
  ctx.strokeStyle = st.dark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(sX, clockCenterY, clockR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = st.dark;
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
  ctx.strokeStyle = st.mortar;
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

  ctx.fillStyle = gd.main;
  ctx.beginPath();
  ctx.arc(sX, clockCenterY, 0.7 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Central arcane core display
  ctx.fillStyle = st.dark;
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

  ctx.strokeStyle = st.dark;
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
  const upperWins: WinPos[] = [];

  if (isUpgraded) {
    const twinW = 3.5;
    const twinH = 8;
    drawIsoGothicWindow(ctx, sX - uw * 0.7, topWinYBase + 0.3 * ud, twinW, twinH, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX - uw * 0.3, topWinYBase + 0.7 * ud, twinW, twinH, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + uw * 0.7, topWinYBase + 0.3 * ud, twinW, twinH, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + uw * 0.3, topWinYBase + 0.7 * ud, twinW, twinH, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
    upperWins.push(
      { cx: sX - uw * 0.7, cy: topWinYBase + 0.3 * ud, ww: twinW, wh: twinH, s: 0.5 },
      { cx: sX - uw * 0.3, cy: topWinYBase + 0.7 * ud, ww: twinW, wh: twinH, s: 0.5 },
      { cx: sX + uw * 0.7, cy: topWinYBase + 0.3 * ud, ww: twinW, wh: twinH, s: -0.5 },
      { cx: sX + uw * 0.3, cy: topWinYBase + 0.7 * ud, ww: twinW, wh: twinH, s: -0.5 },
    );
  } else {
    drawIsoGothicWindow(ctx, sX - uw * 0.5, topWinYBase + 0.5 * ud, 5, 10, "left", zoom, mainColor, glowIntensity, libraryWindowColors);
    drawIsoGothicWindow(ctx, sX + uw * 0.5, topWinYBase + 0.5 * ud, 5, 10, "right", zoom, mainColor, glowIntensity, libraryWindowColors);
    upperWins.push(
      { cx: sX - uw * 0.5, cy: topWinYBase + 0.5 * ud, ww: 5, wh: 10, s: 0.5 },
      { cx: sX + uw * 0.5, cy: topWinYBase + 0.5 * ud, ww: 5, wh: 10, s: -0.5 },
    );
  }

  // Upper window hood molds, mullions, and tracery
  for (const wp of upperWins) {
    const hw = wp.ww * zoom * 0.5;
    const hh = wp.wh * zoom * 0.5;
    const peak = hh + 2.5 * zoom;
    const ext = 2 * zoom;

    ctx.strokeStyle = st.pale;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(wp.cx - hw - ext, wp.cy + hh + (-hw - ext) * wp.s);
    ctx.lineTo(wp.cx - hw - ext, wp.cy - hh + (-hw - ext) * wp.s);
    ctx.lineTo(wp.cx, wp.cy - peak - ext);
    ctx.lineTo(wp.cx + hw + ext, wp.cy - hh + (hw + ext) * wp.s);
    ctx.lineTo(wp.cx + hw + ext, wp.cy + hh + (hw + ext) * wp.s);
    ctx.stroke();

    ctx.strokeStyle = st.palest;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(wp.cx - hw - ext, wp.cy - hh + (-hw - ext) * wp.s - zoom);
    ctx.lineTo(wp.cx, wp.cy - peak - ext - zoom);
    ctx.lineTo(wp.cx + hw + ext, wp.cy - hh + (hw + ext) * wp.s - zoom);
    ctx.stroke();

    ctx.strokeStyle = st.dark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(wp.cx, wp.cy - peak + 1.5 * zoom);
    ctx.lineTo(wp.cx, wp.cy + hh);
    ctx.stroke();

    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(wp.cx, wp.cy - peak + 3 * zoom);
    ctx.quadraticCurveTo(
      wp.cx - hw * 0.4, wp.cy - hh + (-hw * 0.4) * wp.s,
      wp.cx - hw + zoom, wp.cy - hh + (-hw + zoom) * wp.s,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wp.cx, wp.cy - peak + 3 * zoom);
    ctx.quadraticCurveTo(
      wp.cx + hw * 0.4, wp.cy - hh + (hw * 0.4) * wp.s,
      wp.cx + hw - zoom, wp.cy - hh + (hw - zoom) * wp.s,
    );
    ctx.stroke();
  }

  ctx.restore();
}

// LAB TOWER - Tesla coil with fixed projectile origins
