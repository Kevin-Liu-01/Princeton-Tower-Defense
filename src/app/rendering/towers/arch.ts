import type { Tower, Position } from "../../types";
import {
  ISO_PRISM_W_FACTOR,
  ISO_PRISM_D_FACTOR,
  ISO_Y_RATIO,
} from "../../constants";
import { calculateTowerStats } from "../../constants/towerStats";
import {
  drawIsometricPrism,
  drawIsoCylinder,
  drawIsoGothicWindow,
  drawIsometricRailing,
} from "./towerHelpers";

export function renderArchTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
) {
  void colors;

  ctx.save();
  // Shift the entire building up slightly
  screenPos = { x: screenPos.x, y: screenPos.y - 8 * zoom };
  const baseWidth = 38 + tower.level * 5;
  const baseDepth = 30 + tower.level * 4;
  const w = baseWidth * zoom * ISO_PRISM_W_FACTOR;
  const d = baseDepth * zoom * ISO_PRISM_D_FACTOR;

  const isShockwave = tower.level === 4 && tower.upgrade === "A";
  const isSymphony = tower.level === 4 && tower.upgrade === "B";

  let mainColor = "rgba(50, 200, 100,";
  if (isShockwave) {
    mainColor = "rgba(255, 100, 100,";
  } else if (isSymphony) {
    mainColor = "rgba(100, 200, 255,";
  }

  // Dynamic attack animation
  const timeSinceFire = Date.now() - tower.lastAttack;
  let attackPulse = 0;
  let archVibrate = 0;
  let pillarSpread = 0;
  let pillarBounce = 0;
  let foundationShift = 0;
  let archLift = 0;
  let portalExpand = 0;

  if (timeSinceFire < 600) {
    const attackPhase = timeSinceFire / 600;
    attackPulse = (1 - attackPhase) * 0.6;
    archVibrate =
      Math.sin(attackPhase * Math.PI * 12) * (1 - attackPhase) * 4 * zoom;
    if (attackPhase < 0.3) {
      pillarSpread = (attackPhase / 0.3) * 6 * zoom;
      pillarBounce = Math.sin(attackPhase * Math.PI * 10) * 3 * zoom;
    } else {
      pillarSpread = 6 * zoom * (1 - (attackPhase - 0.3) / 0.7);
      pillarBounce =
        Math.sin(attackPhase * Math.PI * 6) * (1 - attackPhase) * 2 * zoom;
    }
    foundationShift =
      Math.sin(attackPhase * Math.PI * 8) * (1 - attackPhase) * 2 * zoom;
    if (attackPhase < 0.2) {
      archLift = (attackPhase / 0.2) * 5 * zoom;
    } else {
      archLift = 5 * zoom * (1 - (attackPhase - 0.2) / 0.8);
    }
    portalExpand = Math.sin(attackPhase * Math.PI) * 8 * zoom;
  }

  // Crescendo intensity: amplifies all visual effects based on stack count
  const archStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
  const maxCrescendo = archStats.crescendoMaxStacks || 4;
  const crescendoStacks = tower.crescendoStacks || 0;
  const crescendoRatio = Math.min(crescendoStacks / maxCrescendo, 1);
  const crescendoBoost = crescendoRatio * 0.6;
  attackPulse += crescendoBoost;

  const pulseSize = 1 + Math.sin(time * 3) * 0.02 + crescendoRatio * 0.03;
  const glowColor = isShockwave
    ? "255, 100, 100"
    : isSymphony
      ? "100, 200, 255"
      : "50, 200, 100";

  // === STEPPED STONE FOUNDATION ===
  const subBuildingWidth = baseWidth + 20;
  const subBuildingHeight = 18;
  const subBounce =
    isShockwave || isSymphony
      ? Math.sin(time * 6) * 2 * zoom
      : Math.sin(time * 3) * 1 * zoom;

  // Lowest step — rough-hewn stone plinth
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 22 * zoom,
    subBuildingWidth + 12,
    baseDepth + 40,
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
    screenPos.y + 20 * zoom,
    subBuildingWidth + 8,
    baseDepth + 36,
    4,
    {
      top: "#5a4a3a",
      left: "#4a3a2a",
      right: "#3a2a1a",
      leftBack: "#6a5a4a",
      rightBack: "#5a4a3a",
    },
    zoom,
  );

  // Upper step — polished foundation
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 16 * zoom,
    subBuildingWidth,
    baseDepth + 28,
    12,
    {
      top: "#786858",
      left: "#685848",
      right: "#584838",
      leftBack: "#887868",
      rightBack: "#786858",
    },
    zoom,
  );

  // Gold trim along upper step front edge
  const fndHW = subBuildingWidth * zoom * ISO_PRISM_W_FACTOR;
  const fndHD = (baseDepth + 28) * zoom * ISO_PRISM_D_FACTOR;
  ctx.strokeStyle = `rgba(201, 162, 39, ${0.3 + Math.sin(time * 1.5) * 0.1})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - fndHW, screenPos.y + 4 * zoom);
  ctx.lineTo(screenPos.x, screenPos.y + 4 * zoom + fndHD);
  ctx.lineTo(screenPos.x + fndHW, screenPos.y + 4 * zoom);
  ctx.stroke();

  // Foundation rune circle on upper step
  const runeCircleGlow = 0.3 + Math.sin(time * 2) * 0.15;
  const runeRX = subBuildingWidth * zoom * 0.38;
  const runeRY = (baseDepth + 28) * zoom * 0.18;
  ctx.strokeStyle = `rgba(${glowColor}, ${runeCircleGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 4 * zoom,
    runeRX,
    runeRY,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Inner rune circle
  ctx.strokeStyle = `rgba(${glowColor}, ${runeCircleGlow * 0.6})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 4 * zoom,
    runeRX * 0.7,
    runeRY * 0.7,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Ground rune symbols
  const groundRunes = ["ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᛁ", "ᛃ"];
  ctx.fillStyle = `rgba(${glowColor}, ${runeCircleGlow + 0.1})`;
  ctx.font = `${8 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 8; i++) {
    const runeAngle = (i / 8) * Math.PI * 2 + time * 0.2;
    const runeX = screenPos.x + Math.cos(runeAngle) * runeRX * 0.85;
    const runeY = screenPos.y + 4 * zoom + Math.sin(runeAngle) * runeRY * 0.85;
    ctx.fillText(groundRunes[i], runeX, runeY);
  }

  // Corner buttress supports — proper isometric prism pillars
  const buttressPositions = [
    { sx: -1, sy: -1 },
    { sx: -1, sy: 1 },
    { sx: 1, sy: -1 },
    { sx: 1, sy: 1 },
  ];
  for (let corner = 0; corner < 4; corner++) {
    const bp = buttressPositions[corner];
    const cx =
      screenPos.x + bp.sx * (subBuildingWidth * 0.42) * zoom;
    const cy =
      screenPos.y + 14 * zoom + bp.sy * (baseDepth + 20) * zoom * 0.18;

    // Buttress as isometric prism
    drawIsometricPrism(
      ctx,
      cx,
      cy + 4 * zoom,
      7,
      7,
      16,
      {
        top: "#8a7a6a",
        left: "#6a5a4a",
        right: "#5a4a3a",
        leftBack: "#7a6a5a",
        rightBack: "#6a5a4a",
      },
      zoom,
    );

    // Buttress pyramid cap
    const capY2 = cy + 4 * zoom - 16 * zoom;
    ctx.fillStyle = "#9a8a7a";
    ctx.beginPath();
    ctx.moveTo(cx, capY2 - 5 * zoom);
    ctx.lineTo(cx - 4.5 * zoom, capY2);
    ctx.lineTo(cx, capY2 + 2 * zoom);
    ctx.lineTo(cx + 4.5 * zoom, capY2);
    ctx.closePath();
    ctx.fill();

    // Gold finial
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(cx, capY2 - 6 * zoom, 1.3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Buttress rune glow
    const buttressGlow = 0.4 + Math.sin(time * 3 + corner) * 0.25;
    ctx.fillStyle = `rgba(${glowColor}, ${buttressGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 3 * zoom;
    ctx.beginPath();
    ctx.arc(cx, cy - 2 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Sub-building main structure
  const subShift =
    timeSinceFire < 600
      ? Math.sin((timeSinceFire / 600) * Math.PI * 6) *
        2 *
        zoom *
        (1 - timeSinceFire / 600)
      : 0;
  const sbExpandW = subBuildingWidth - 6 + pillarSpread * 2;
  const sbExpandD = baseDepth + 22 + pillarSpread * 2;
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.4 + subShift,
    screenPos.y + 2 * zoom + subBounce,
    sbExpandW,
    sbExpandD,
    subBuildingHeight,
    {
      top: "#a89878",
      left: "#988868",
      right: "#887858",
      leftBack: "#b8a888",
      rightBack: "#a89878",
    },
    zoom,
  );

  // ========== BASE RAILING (3D isometric ring) ==========
  const archBalY = screenPos.y + 4 * zoom + subBounce;
  const archBalRX =
    (subBuildingWidth - 4 + pillarSpread * 2) * zoom * ISO_PRISM_W_FACTOR;
  const archBalRY =
    (baseDepth + 24 + pillarSpread * 2) * zoom * ISO_PRISM_D_FACTOR;
  const archBalH = 5 * zoom;
  drawIsometricRailing(
    ctx,
    screenPos.x,
    archBalY,
    archBalRX,
    archBalRY,
    archBalH,
    32,
    16,
    {
      rail: "#786858",
      topRail: "#a89878",
      backPanel: "rgba(152, 136, 104, 0.35)",
      frontPanel: "rgba(152, 136, 104, 0.25)",
    },
    zoom,
  );

  // === DETAILED STONE MASONRY ON SUB-BUILDING FACES ===
  const mortarGlow = 0.12 + Math.sin(time * 1.5) * 0.06 + attackPulse * 0.15;
  const sbHalfW = sbExpandW * zoom * ISO_PRISM_W_FACTOR;
  const sbDepthOff = sbExpandD * zoom * ISO_PRISM_D_FACTOR;
  const sbH = subBuildingHeight * zoom;
  const sbBaseY = screenPos.y + 2 * zoom + subBounce;
  const sbBaseX = screenPos.x + foundationShift * 0.4 + subShift;

  const stoneRows = 5;
  const stoneCols = 6;

  // --- Front-left face: staggered ashlar stone blocks ---
  ctx.strokeStyle = `rgba(${glowColor}, ${mortarGlow})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let row = 1; row < stoneRows; row++) {
    const t = row / stoneRows;
    ctx.beginPath();
    ctx.moveTo(sbBaseX - sbHalfW, sbBaseY - sbH + t * sbH);
    ctx.lineTo(sbBaseX, sbBaseY - sbH + t * sbH + sbDepthOff);
    ctx.stroke();
  }
  for (let row = 0; row < stoneRows; row++) {
    const t1 = row / stoneRows;
    const t2 = (row + 1) / stoneRows;
    const stagger = row % 2 === 0 ? 0 : 0.5;
    for (let col = 1; col < stoneCols; col++) {
      const s = (col + stagger) / stoneCols;
      if (s >= 1) continue;
      const jx = sbBaseX - sbHalfW + s * sbHalfW;
      const jyOff = s * sbDepthOff;
      ctx.beginPath();
      ctx.moveTo(jx, sbBaseY - sbH + t1 * sbH + jyOff);
      ctx.lineTo(jx, sbBaseY - sbH + t2 * sbH + jyOff);
      ctx.stroke();
    }
  }

  // --- Front-right face: matching staggered stone blocks ---
  for (let row = 1; row < stoneRows; row++) {
    const t = row / stoneRows;
    ctx.beginPath();
    ctx.moveTo(sbBaseX, sbBaseY - sbH + t * sbH + sbDepthOff);
    ctx.lineTo(sbBaseX + sbHalfW, sbBaseY - sbH + t * sbH);
    ctx.stroke();
  }
  for (let row = 0; row < stoneRows; row++) {
    const t1 = row / stoneRows;
    const t2 = (row + 1) / stoneRows;
    const stagger = row % 2 === 0 ? 0.5 : 0;
    for (let col = 1; col < stoneCols; col++) {
      const s = (col + stagger) / stoneCols;
      if (s >= 1) continue;
      const jx = sbBaseX + s * sbHalfW;
      const jyOff = sbDepthOff - s * sbDepthOff;
      ctx.beginPath();
      ctx.moveTo(jx, sbBaseY - sbH + t1 * sbH + jyOff);
      ctx.lineTo(jx, sbBaseY - sbH + t2 * sbH + jyOff);
      ctx.stroke();
    }
  }

  // --- Decorative horizontal string course at mid-height ---
  const bandFrac = 0.45;
  const bandBaseLeft = sbBaseY - sbH + bandFrac * sbH;
  ctx.strokeStyle = "#6a5a4a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW, bandBaseLeft);
  ctx.lineTo(sbBaseX, bandBaseLeft + sbDepthOff);
  ctx.lineTo(sbBaseX + sbHalfW, bandBaseLeft);
  ctx.stroke();
  ctx.strokeStyle = "rgba(190, 175, 155, 0.35)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW, bandBaseLeft - 1.5 * zoom);
  ctx.lineTo(sbBaseX, bandBaseLeft + sbDepthOff - 1.5 * zoom);
  ctx.lineTo(sbBaseX + sbHalfW, bandBaseLeft - 1.5 * zoom);
  ctx.stroke();
  ctx.strokeStyle = "rgba(40, 30, 20, 0.25)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW, bandBaseLeft + 2 * zoom);
  ctx.lineTo(sbBaseX, bandBaseLeft + sbDepthOff + 2 * zoom);
  ctx.lineTo(sbBaseX + sbHalfW, bandBaseLeft + 2 * zoom);
  ctx.stroke();

  // --- Top cornice molding ---
  ctx.strokeStyle = "#8a7a6a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW * 1.05, sbBaseY - sbH);
  ctx.lineTo(sbBaseX, sbBaseY - sbH + sbDepthOff);
  ctx.lineTo(sbBaseX + sbHalfW * 1.05, sbBaseY - sbH);
  ctx.stroke();
  ctx.strokeStyle = "rgba(200, 185, 165, 0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW * 1.05, sbBaseY - sbH - 1 * zoom);
  ctx.lineTo(sbBaseX, sbBaseY - sbH + sbDepthOff - 1 * zoom);
  ctx.lineTo(sbBaseX + sbHalfW * 1.05, sbBaseY - sbH - 1 * zoom);
  ctx.stroke();

  // --- Base plinth molding ---
  ctx.strokeStyle = "#6a5a4a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbBaseX - sbHalfW * 1.05, sbBaseY);
  ctx.lineTo(sbBaseX, sbBaseY + sbDepthOff);
  ctx.lineTo(sbBaseX + sbHalfW * 1.05, sbBaseY);
  ctx.stroke();

  // --- Corner quoining at front edge ---
  ctx.lineWidth = 1 * zoom;
  for (let q = 0; q < stoneRows; q++) {
    const qt1 = q / stoneRows;
    const qt2 = (q + 1) / stoneRows;
    const qy1 = sbBaseY - sbH + qt1 * sbH + sbDepthOff;
    const qy2 = sbBaseY - sbH + qt2 * sbH + sbDepthOff;
    const quoinW = 3.5 * zoom;
    ctx.fillStyle =
      q % 2 === 0 ? "rgba(140, 128, 108, 0.25)" : "rgba(160, 148, 128, 0.2)";
    ctx.beginPath();
    ctx.moveTo(sbBaseX, qy1);
    ctx.lineTo(sbBaseX - quoinW, qy1 - quoinW * 0.15);
    ctx.lineTo(sbBaseX - quoinW, qy2 - quoinW * 0.15);
    ctx.lineTo(sbBaseX, qy2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sbBaseX, qy1);
    ctx.lineTo(sbBaseX + quoinW, qy1 - quoinW * 0.15);
    ctx.lineTo(sbBaseX + quoinW, qy2 - quoinW * 0.15);
    ctx.lineTo(sbBaseX, qy2);
    ctx.closePath();
    ctx.fill();
  }

  // --- Recessed panel insets on each face ---
  const panelInset = 0.15;
  const panelT1 = 0.12;
  const panelT2 = 0.38;
  ctx.strokeStyle = "rgba(80, 65, 50, 0.3)";
  ctx.lineWidth = 1.2 * zoom;
  // Left face panel
  const lpL = sbBaseX - sbHalfW + panelInset * sbHalfW;
  const lpR = sbBaseX - sbHalfW + (1 - panelInset) * sbHalfW;
  const lpLdOff = panelInset * sbDepthOff;
  const lpRdOff = (1 - panelInset) * sbDepthOff;
  ctx.beginPath();
  ctx.moveTo(lpL, sbBaseY - sbH + panelT1 * sbH + lpLdOff);
  ctx.lineTo(lpR, sbBaseY - sbH + panelT1 * sbH + lpRdOff);
  ctx.lineTo(lpR, sbBaseY - sbH + panelT2 * sbH + lpRdOff);
  ctx.lineTo(lpL, sbBaseY - sbH + panelT2 * sbH + lpLdOff);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(120, 105, 85, 0.12)";
  ctx.fill();
  // Right face panel
  const rpL = sbBaseX + panelInset * sbHalfW;
  const rpR = sbBaseX + (1 - panelInset) * sbHalfW;
  const rpLdOff = sbDepthOff - panelInset * sbDepthOff;
  const rpRdOff = sbDepthOff - (1 - panelInset) * sbDepthOff;
  ctx.beginPath();
  ctx.moveTo(rpL, sbBaseY - sbH + panelT1 * sbH + rpLdOff);
  ctx.lineTo(rpR, sbBaseY - sbH + panelT1 * sbH + rpRdOff);
  ctx.lineTo(rpR, sbBaseY - sbH + panelT2 * sbH + rpRdOff);
  ctx.lineTo(rpL, sbBaseY - sbH + panelT2 * sbH + rpLdOff);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(120, 105, 85, 0.12)";
  ctx.fill();

  // Lower panels (below string course)
  const panelT3 = 0.55;
  const panelT4 = 0.88;
  ctx.strokeStyle = "rgba(80, 65, 50, 0.3)";
  ctx.beginPath();
  ctx.moveTo(lpL, sbBaseY - sbH + panelT3 * sbH + lpLdOff);
  ctx.lineTo(lpR, sbBaseY - sbH + panelT3 * sbH + lpRdOff);
  ctx.lineTo(lpR, sbBaseY - sbH + panelT4 * sbH + lpRdOff);
  ctx.lineTo(lpL, sbBaseY - sbH + panelT4 * sbH + lpLdOff);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(120, 105, 85, 0.1)";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rpL, sbBaseY - sbH + panelT3 * sbH + rpLdOff);
  ctx.lineTo(rpR, sbBaseY - sbH + panelT3 * sbH + rpRdOff);
  ctx.lineTo(rpR, sbBaseY - sbH + panelT4 * sbH + rpRdOff);
  ctx.lineTo(rpL, sbBaseY - sbH + panelT4 * sbH + rpLdOff);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "rgba(120, 105, 85, 0.1)";
  ctx.fill();

  // --- Subtle stone texture grain ---
  ctx.strokeStyle = "rgba(200, 185, 165, 0.1)";
  ctx.lineWidth = 0.5 * zoom;
  for (let i = 0; i < 8; i++) {
    const tx = sbBaseX + (i - 3.5) * 8 * zoom;
    const ty = sbBaseY - sbH * 0.3 + Math.sin(i * 2.1) * 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + (2 + Math.sin(i * 1.3)) * zoom, ty + 0.8 * zoom);
    ctx.stroke();
  }

  // --- Left face weathering gradient (rain stain) ---
  const lwGrad = ctx.createLinearGradient(
    sbBaseX - sbHalfW,
    sbBaseY - sbH,
    sbBaseX,
    sbBaseY,
  );
  lwGrad.addColorStop(0, "rgba(40, 30, 20, 0.12)");
  lwGrad.addColorStop(0.4, "rgba(40, 30, 20, 0.05)");
  lwGrad.addColorStop(1, "rgba(40, 30, 20, 0)");
  ctx.fillStyle = lwGrad;
  ctx.beginPath();
  ctx.moveTo(sbBaseX, sbBaseY + sbDepthOff);
  ctx.lineTo(sbBaseX - sbHalfW, sbBaseY);
  ctx.lineTo(sbBaseX - sbHalfW, sbBaseY - sbH);
  ctx.lineTo(sbBaseX, sbBaseY - sbH + sbDepthOff);
  ctx.closePath();
  ctx.fill();

  // --- Moss/weathering at base (improved with lichen patches) ---
  const mossPatches = [
    { x: -1.2, s: 3.0 },
    { x: -0.3, s: 2.2 },
    { x: 0.5, s: 2.8 },
    { x: 1.1, s: 2.0 },
    { x: -0.7, s: 1.5 },
  ];
  for (let i = 0; i < mossPatches.length; i++) {
    const mp = mossPatches[i];
    const mx = sbBaseX + mp.x * 14 * zoom;
    const my = sbBaseY - 1 * zoom;
    // Darker moss shadow
    ctx.fillStyle = `rgba(35, 80, 30, ${0.06 + Math.sin(time * 0.4 + i) * 0.02})`;
    ctx.beginPath();
    ctx.ellipse(
      mx,
      my + 0.5 * zoom,
      mp.s * zoom,
      1 * zoom,
      i * 0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Lighter moss
    ctx.fillStyle = `rgba(65, 120, 50, ${0.05 + Math.sin(time * 0.4 + i * 2) * 0.02})`;
    ctx.beginPath();
    ctx.ellipse(
      mx,
      my,
      (mp.s - 0.5) * zoom,
      0.7 * zoom,
      i * 0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // --- Ivy tendrils climbing up left face ---
  ctx.strokeStyle = "rgba(50, 100, 40, 0.08)";
  ctx.lineWidth = 1 * zoom;
  for (let iv = 0; iv < 2; iv++) {
    const ivX = sbBaseX - sbHalfW * (0.3 + iv * 0.35);
    ctx.beginPath();
    ctx.moveTo(ivX, sbBaseY);
    ctx.quadraticCurveTo(
      ivX + Math.sin(iv * 2.3) * 3 * zoom,
      sbBaseY - sbH * 0.3,
      ivX - 1 * zoom,
      sbBaseY - sbH * 0.5,
    );
    ctx.stroke();
  }

  // --- Mystical wall runes on sub-building ---
  const wallRunes = ["ᛟ", "ᛞ", "ᛒ", "ᛖ"];
  const wallRuneGlow = 0.4 + Math.sin(time * 2.5) * 0.2 + attackPulse * 0.5;
  ctx.fillStyle = `rgba(${glowColor}, ${wallRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `${10 * zoom}px serif`;
  for (let i = 0; i < 4; i++) {
    const runeX = screenPos.x + (i - 1.5) * 12 * zoom + subShift * 0.5;
    const runeY = screenPos.y + 6 * zoom + subBounce;
    ctx.fillText(wallRunes[i], runeX, runeY);
  }
  ctx.shadowBlur = 0;

  // Gothic windows on sub-building (3D isometric, flush with left/right faces)
  const windowGlowBase = 0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.5;
  const windowColors = {
    frame: "#5a4a3a",
    void: `${mainColor} ${windowGlowBase * 0.9})`,
    sill: "#5a4a3a",
  };
  for (let row = 0; row < 2; row++) {
    const cy =
      sbBaseY - sbH * (0.28 + row * 0.44) + sbDepthOff * 0.5 - 5 * zoom;
    drawIsoGothicWindow(
      ctx,
      sbBaseX - sbHalfW * 0.5,
      cy,
      7,
      9,
      "left",
      zoom,
      mainColor,
      windowGlowBase,
      windowColors,
    );
    drawIsoGothicWindow(
      ctx,
      sbBaseX + sbHalfW * 0.5,
      cy,
      7,
      9,
      "right",
      zoom,
      mainColor,
      windowGlowBase,
      windowColors,
    );
  }

  // Mystical resonance crystals on sides
  const chamberPulse = 0.5 + attackPulse;
  for (let side = -1; side <= 1; side += 2) {
    const chamberX =
      screenPos.x +
      side * ((subBuildingWidth + pillarSpread * 2) * 0.42) * zoom +
      subShift * side * 0.3;
    const chamberY = screenPos.y + 6 * zoom + subBounce;

    // Crystal housing
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.moveTo(chamberX, chamberY - 10 * zoom);
    ctx.lineTo(chamberX - 5 * zoom, chamberY - 4 * zoom);
    ctx.lineTo(chamberX - 4 * zoom, chamberY + 4 * zoom);
    ctx.lineTo(chamberX + 4 * zoom, chamberY + 4 * zoom);
    ctx.lineTo(chamberX + 5 * zoom, chamberY - 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Glowing crystal
    ctx.fillStyle = `${mainColor} ${chamberPulse})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(chamberX, chamberY - 8 * zoom);
    ctx.lineTo(chamberX - 3 * zoom, chamberY);
    ctx.lineTo(chamberX, chamberY + 2 * zoom);
    ctx.lineTo(chamberX + 3 * zoom, chamberY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Crystal energy rings during attack
    if (timeSinceFire < 400) {
      const ringPhase = timeSinceFire / 400;
      ctx.strokeStyle = `${mainColor} ${(1 - ringPhase) * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        chamberX,
        chamberY,
        (6 + ringPhase * 10) * zoom,
        (4 + ringPhase * 6) * zoom,
        0.3 * side,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  // Rigid conduit pipes with 3D rendering and mystical flow
  for (let side = -1; side <= 1; side += 2) {
    const pipeStartX = screenPos.x + side * 30 * zoom + side * pillarSpread;
    const pipeStartY = screenPos.y + 7 * zoom + subBounce;
    const pipeMidX = screenPos.x + side * 32 * zoom;
    const pipeMidY = screenPos.y - 8 * zoom;
    const pipeEndX =
      screenPos.x +
      side * (baseWidth * 0.35) * zoom -
      pillarSpread * side * 0.3;
    const pipeEndY = screenPos.y - 14 * zoom;
    const pipeR = 2.5 * zoom;

    // Pipe shadow (offset darker line)
    ctx.strokeStyle = "rgba(40, 30, 20, 0.3)";
    ctx.lineWidth = pipeR * 2 + zoom;
    ctx.beginPath();
    ctx.moveTo(pipeStartX + subShift * 0.3 + 1 * zoom, pipeStartY + 1 * zoom);
    ctx.quadraticCurveTo(
      pipeMidX + 1 * zoom,
      pipeMidY + 1 * zoom,
      pipeEndX + 1 * zoom,
      pipeEndY + 1 * zoom,
    );
    ctx.stroke();

    // Pipe body (stone conduit)
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = pipeR * 2;
    ctx.beginPath();
    ctx.moveTo(pipeStartX + subShift * 0.3, pipeStartY);
    ctx.quadraticCurveTo(pipeMidX, pipeMidY, pipeEndX, pipeEndY);
    ctx.stroke();

    // Pipe highlight edge
    ctx.strokeStyle = "rgba(160, 145, 125, 0.35)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      pipeStartX + subShift * 0.3 - 0.8 * zoom,
      pipeStartY - 0.8 * zoom,
    );
    ctx.quadraticCurveTo(
      pipeMidX - 0.8 * zoom,
      pipeMidY - 0.8 * zoom,
      pipeEndX - 0.8 * zoom,
      pipeEndY - 0.8 * zoom,
    );
    ctx.stroke();

    // Clamp bands along pipe
    for (let cb = 0; cb < 4; cb++) {
      const t = (cb + 0.5) / 4;
      const mt = 1 - t;
      const cbX =
        mt * mt * (pipeStartX + subShift * 0.3) +
        2 * mt * t * pipeMidX +
        t * t * pipeEndX;
      const cbY =
        mt * mt * pipeStartY + 2 * mt * t * pipeMidY + t * t * pipeEndY;
      ctx.strokeStyle = "#8a7a6a";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(cbX, cbY, pipeR * 1.3, pipeR * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Inner mystical energy flow (glowing core inside pipe)
    const pipeGlow = 0.3 + attackPulse * 0.6;
    ctx.strokeStyle = `rgba(${glowColor}, ${pipeGlow * 0.5})`;
    ctx.lineWidth = pipeR * 0.8;
    ctx.beginPath();
    ctx.moveTo(pipeStartX + subShift * 0.3, pipeStartY);
    ctx.quadraticCurveTo(pipeMidX, pipeMidY, pipeEndX, pipeEndY);
    ctx.stroke();

    // Flowing energy particles along pipe
    for (let p = 0; p < 4; p++) {
      const pipePhase = (time * 2 + p * 0.25 + side * 0.5) % 1;
      const pt = pipePhase;
      const mt = 1 - pt;
      const px =
        mt * mt * (pipeStartX + subShift * 0.3) +
        2 * mt * pt * pipeMidX +
        pt * pt * pipeEndX;
      const py =
        mt * mt * pipeStartY + 2 * mt * pt * pipeMidY + pt * pt * pipeEndY;
      const pAlpha = 0.5 + Math.sin(time * 8 + p) * 0.3;
      ctx.fillStyle = `rgba(${glowColor}, ${pAlpha})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 3 * zoom;
      ctx.beginPath();
      ctx.arc(px, py, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Flanged connectors at pipe ends
    for (const end of [0, 1]) {
      const eX = end === 0 ? pipeStartX + subShift * 0.3 : pipeEndX;
      const eY = end === 0 ? pipeStartY : pipeEndY;
      ctx.fillStyle = "#7a6a5a";
      ctx.beginPath();
      ctx.ellipse(eX, eY, pipeR * 1.5, pipeR * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
    }
  }

  // Upper foundation platform with arcane symbols
  drawIsometricPrism(
    ctx,
    screenPos.x + foundationShift * 0.5,
    screenPos.y - 18 * zoom,
    baseWidth + 12 + pillarSpread * 2,
    baseDepth + 18 + pillarSpread * 2,
    6,
    {
      top: "#a89880",
      left: "#988870",
      right: "#887860",
      leftBack: "#b8a890",
      rightBack: "#a89880",
    },
    zoom,
  );

  // Arcane circle on platform
  const platformGlow = 0.35 + Math.sin(time * 2.5) * 0.15 + attackPulse * 0.4;
  ctx.strokeStyle = `rgba(${glowColor}, ${platformGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y - 41 * zoom,
    (baseWidth + 8) * zoom * 0.35,
    (baseDepth + 14) * zoom * 0.18,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Platform corner rune stones
  for (const corner of [-1, 1]) {
    const stoneX = screenPos.x + corner * (baseWidth + 8) * zoom * 0.4;
    const stoneY = screenPos.y - 20 * zoom;

    // Rune stone
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.ellipse(stoneX, stoneY, 4 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rune glow on stone
    ctx.fillStyle = `rgba(${glowColor}, ${platformGlow + 0.15})`;
    ctx.font = `${6 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(corner < 0 ? "ᚠ" : "ᚢ", stoneX, stoneY + 2 * zoom);
  }

  // Arcane channel lines on upper platform (carved glowing grooves)
  const panelGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse;
  ctx.lineWidth = 1 * zoom;

  for (let i = 1; i <= 2; i++) {
    const lineY = screenPos.y - 16 * zoom - i * 4 * zoom;

    // Dark groove
    ctx.strokeStyle = "rgba(40, 30, 20, 0.25)";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.2, lineY + d * 0.3 + 0.5 * zoom);
    ctx.lineTo(screenPos.x - w * 0.9, lineY - d * 0.2 + 0.5 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.9, lineY - d * 0.2 + 0.5 * zoom);
    ctx.lineTo(screenPos.x + w * 0.2, lineY + d * 0.3 + 0.5 * zoom);
    ctx.stroke();

    // Glowing energy fill
    ctx.strokeStyle = `rgba(${glowColor}, ${panelGlow * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.2, lineY + d * 0.3);
    ctx.lineTo(screenPos.x - w * 0.9, lineY - d * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.9, lineY - d * 0.2);
    ctx.lineTo(screenPos.x + w * 0.2, lineY + d * 0.3);
    ctx.stroke();
  }

  // Corner rune medallions on upper platform
  for (const pSide of [-1, 1]) {
    const medalX = screenPos.x + pSide * (baseWidth + 4) * zoom * 0.35;
    const medalY = screenPos.y - 20 * zoom;
    const medalGlow =
      0.35 + Math.sin(time * 2.5 + pSide) * 0.15 + attackPulse * 0.25;

    // Medallion circle
    ctx.strokeStyle = "#8a7a6a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(medalX, medalY, 3.5 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Medallion glow fill
    ctx.fillStyle = `rgba(${glowColor}, ${medalGlow * 0.3})`;
    ctx.fill();

    // Medallion rune
    ctx.fillStyle = `rgba(${glowColor}, ${medalGlow})`;
    ctx.font = `${5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(pSide < 0 ? "ᚠ" : "ᚢ", medalX, medalY + 2 * zoom);
  }

  // === MYSTICAL PILLARS WITH RUNES ===
  const pillarWidth = 14 + tower.level * 2;
  const pillarHeight = 25 + tower.level * 6;
  const pillarX =
    screenPos.x - baseWidth * zoom * 0.35 - archVibrate * 0.3 - pillarSpread;
  const pillarXR =
    screenPos.x + baseWidth * zoom * 0.35 + archVibrate * 0.3 + pillarSpread;
  const pw = pillarWidth * zoom * 0.5;
  const pd = pillarWidth * zoom * ISO_PRISM_D_FACTOR;

  // Left pillar square isometric base
  const lbX = pillarX + pillarBounce * 0.5;
  const lbY = screenPos.y - 22 * zoom;
  drawIsometricPrism(
    ctx,
    lbX,
    lbY - 3 * zoom,
    pillarWidth * 1.35,
    pillarWidth * 1.35,
    2,
    {
      top: "#c0b0a0",
      left: "#b0a090",
      right: "#a09080",
      leftBack: "#d0c0b0",
      rightBack: "#c0b0a0",
    },
    zoom,
  );

  // Left pillar shaft dimensions
  const pillarBaseTop = 5;
  const pillarBottomY = screenPos.y - 22 * zoom - pillarBaseTop * zoom;
  const shaftBaseY = pillarBottomY - pillarBounce;
  const lowerShaftH = pillarHeight * zoom * 0.52;
  const transH = pillarHeight * zoom * 0.08;
  const upperShaftH = pillarHeight * zoom * 0.42;
  const leftPCX = pillarX + pillarBounce * 0.5;

  // Lower shaft (square isometric prism)
  drawIsometricPrism(
    ctx,
    leftPCX,
    shaftBaseY,
    pillarWidth * pulseSize,
    pillarWidth * pulseSize,
    pillarHeight * 0.52,
    {
      top: "#c0b098",
      left: "#b8a890",
      right: "#a89880",
      leftBack: "#d0c0a8",
      rightBack: "#c0b098",
    },
    zoom,
  );

  // Square-to-round transition torus molding
  drawIsoCylinder(
    ctx,
    leftPCX,
    shaftBaseY - lowerShaftH,
    pw * 1.2 * pulseSize,
    transH,
    {
      body: "#c8b8a0",
      dark: "#b0a088",
      light: "#d8c8b0",
      top: "#d0c0a8",
    },
  );

  // Upper shaft (cylinder connecting to arch)
  const upperCylRx = pw * 0.95 * pulseSize;
  drawIsoCylinder(
    ctx,
    leftPCX,
    shaftBaseY - lowerShaftH - transH,
    upperCylRx,
    upperShaftH,
    { body: "#b8a890", dark: "#a89880", light: "#c8b8a0", top: "#c8b8a0" },
  );

  // Stone band lines on lower shaft (isometric chevron)
  ctx.strokeStyle = "#8a7a6a";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 4; row++) {
    const rowY = shaftBaseY - 4 * zoom - row * lowerShaftH * 0.22;
    ctx.beginPath();
    ctx.moveTo(leftPCX - pw, rowY);
    ctx.lineTo(leftPCX, rowY + pd);
    ctx.lineTo(leftPCX + pw, rowY);
    ctx.stroke();
  }

  // Stone band lines on upper shaft (cylindrical arcs)
  for (let row = 0; row < 3; row++) {
    const rowY =
      shaftBaseY - lowerShaftH - transH - 4 * zoom - row * upperShaftH * 0.28;
    ctx.beginPath();
    ctx.ellipse(
      leftPCX,
      rowY,
      upperCylRx,
      upperCylRx * ISO_Y_RATIO,
      0,
      0,
      Math.PI,
    );
    ctx.stroke();
  }

  // Vertical fluting on lower shaft (isometric face lines)
  const lFluteBot = shaftBaseY - 4 * zoom;
  const lFluteTop = shaftBaseY - lowerShaftH + 2 * zoom;
  ctx.strokeStyle = "rgba(100, 85, 70, 0.35)";
  ctx.lineWidth = 1.5 * zoom;
  for (let f = 0; f < 2; f++) {
    const s = (f + 1) / 3;
    ctx.beginPath();
    ctx.moveTo(leftPCX - pw * (1 - s), lFluteBot + s * pd);
    ctx.lineTo(leftPCX - pw * (1 - s), lFluteTop + s * pd);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(leftPCX + s * pw, lFluteBot + pd * (1 - s));
    ctx.lineTo(leftPCX + s * pw, lFluteTop + pd * (1 - s));
    ctx.stroke();
  }

  // Vertical fluting on upper shaft (cylindrical)
  const fluteAngles = [
    Math.PI / 6,
    Math.PI / 3,
    Math.PI / 2,
    (2 * Math.PI) / 3,
    (5 * Math.PI) / 6,
  ];
  const uFluteBot = shaftBaseY - lowerShaftH - transH - 3 * zoom;
  const uFluteTop = shaftBaseY - pillarHeight * zoom + 4 * zoom;
  const upperCylRy = upperCylRx * 0.5;
  for (const theta of fluteAngles) {
    const fluteX = leftPCX + upperCylRx * Math.cos(theta);
    const fluteYOff = upperCylRy * Math.sin(theta);
    const fluteAlpha = 0.15 + Math.sin(theta) * 0.3;
    ctx.strokeStyle = `rgba(100, 85, 70, ${fluteAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(fluteX, uFluteBot + fluteYOff);
    ctx.lineTo(fluteX, uFluteTop + fluteYOff);
    ctx.stroke();
    ctx.strokeStyle = `rgba(200, 185, 165, ${fluteAlpha * 0.5})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(fluteX + 1 * zoom, uFluteBot + fluteYOff);
    ctx.lineTo(fluteX + 1 * zoom, uFluteTop + fluteYOff);
    ctx.stroke();
  }

  // Left pillar glowing runes
  const pillarRunes = ["ᚦ", "ᚨ", "ᚾ", "ᛊ"];
  const pillarRuneGlow = 0.5 + Math.sin(time * 3) * 0.25 + attackPulse * 0.6;
  ctx.fillStyle = `rgba(${glowColor}, ${pillarRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `${8 * zoom}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < tower.level + 1; i++) {
    const runeY =
      pillarBottomY - 11 * zoom - pillarBounce - i * pillarHeight * zoom * 0.22;
    ctx.fillText(pillarRunes[i % 4], pillarX + pillarBounce * 0.5, runeY);
  }
  ctx.shadowBlur = 0;

  // Pillar capital on left pillar - isometric 3D
  const capitalY = pillarBottomY - pillarHeight * zoom - pillarBounce;
  const lcX = pillarX + pillarBounce * 0.5;
  const capRx = upperCylRx;

  // Astragal bead (thin ring at shaft top)
  drawIsoCylinder(ctx, lcX, capitalY, capRx * 1.05, 1 * zoom, {
    body: "#b8a890",
    dark: "#a89880",
    light: "#c8b8a0",
    top: "#c0b098",
  });
  // Necking (slightly inset band)
  drawIsoCylinder(ctx, lcX, capitalY - 1 * zoom, capRx * 0.9, 1.5 * zoom, {
    body: "#c0b098",
    dark: "#b0a088",
    light: "#d0c0a8",
    top: "#c8b8a0",
  });
  // Annulet ring (thin lip before echinus)
  drawIsoCylinder(ctx, lcX, capitalY - 2.5 * zoom, capRx * 1.1, 0.8 * zoom, {
    body: "#c8b8a0",
    dark: "#b8a890",
    light: "#d8c8b0",
    top: "#d0c0a8",
  });

  // Right pillar square isometric base
  const rbX = pillarXR - pillarBounce * 0.5;
  const rbY = screenPos.y - 22 * zoom;
  drawIsometricPrism(
    ctx,
    rbX,
    rbY - 3 * zoom,
    pillarWidth * 1.35,
    pillarWidth * 1.35,
    2,
    {
      top: "#c0b0a0",
      left: "#b0a090",
      right: "#a09080",
      leftBack: "#d0c0b0",
      rightBack: "#c0b0a0",
    },
    zoom,
  );

  // Right pillar shaft
  const rightPCX = pillarXR - pillarBounce * 0.5;

  // Lower shaft (square isometric prism)
  drawIsometricPrism(
    ctx,
    rightPCX,
    shaftBaseY,
    pillarWidth * pulseSize,
    pillarWidth * pulseSize,
    pillarHeight * 0.52,
    {
      top: "#c0b098",
      left: "#b8a890",
      right: "#a89880",
      leftBack: "#d0c0a8",
      rightBack: "#c0b098",
    },
    zoom,
  );

  // Square-to-round transition torus molding
  drawIsoCylinder(
    ctx,
    rightPCX,
    shaftBaseY - lowerShaftH,
    pw * 1.2 * pulseSize,
    transH,
    {
      body: "#c8b8a0",
      dark: "#b0a088",
      light: "#d8c8b0",
      top: "#d0c0a8",
    },
  );

  // Upper shaft (cylinder connecting to arch)
  drawIsoCylinder(
    ctx,
    rightPCX,
    shaftBaseY - lowerShaftH - transH,
    upperCylRx,
    upperShaftH,
    { body: "#b8a890", dark: "#a89880", light: "#c8b8a0", top: "#c8b8a0" },
  );

  // Stone band lines on right lower shaft (isometric chevron)
  ctx.strokeStyle = "#8a7a6a";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 4; row++) {
    const rowY = shaftBaseY - 4 * zoom - row * lowerShaftH * 0.22;
    ctx.beginPath();
    ctx.moveTo(rightPCX - pw, rowY);
    ctx.lineTo(rightPCX, rowY + pd);
    ctx.lineTo(rightPCX + pw, rowY);
    ctx.stroke();
  }

  // Stone band lines on right upper shaft (cylindrical arcs)
  for (let row = 0; row < 3; row++) {
    const rowY =
      shaftBaseY - lowerShaftH - transH - 4 * zoom - row * upperShaftH * 0.28;
    ctx.beginPath();
    ctx.ellipse(
      rightPCX,
      rowY,
      upperCylRx,
      upperCylRx * ISO_Y_RATIO,
      0,
      0,
      Math.PI,
    );
    ctx.stroke();
  }

  // Vertical fluting on right lower shaft (isometric face lines)
  const rFluteBot = shaftBaseY - 4 * zoom;
  const rFluteTop = shaftBaseY - lowerShaftH + 2 * zoom;
  ctx.strokeStyle = "rgba(100, 85, 70, 0.35)";
  ctx.lineWidth = 1.5 * zoom;
  for (let f = 0; f < 2; f++) {
    const s = (f + 1) / 3;
    ctx.beginPath();
    ctx.moveTo(rightPCX - pw * (1 - s), rFluteBot + s * pd);
    ctx.lineTo(rightPCX - pw * (1 - s), rFluteTop + s * pd);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightPCX + s * pw, rFluteBot + pd * (1 - s));
    ctx.lineTo(rightPCX + s * pw, rFluteTop + pd * (1 - s));
    ctx.stroke();
  }

  // Vertical fluting on right upper shaft (cylindrical)
  const ruFluteBot = shaftBaseY - lowerShaftH - transH - 3 * zoom;
  const ruFluteTop = shaftBaseY - pillarHeight * zoom + 4 * zoom;
  for (const theta of fluteAngles) {
    const fluteX = rightPCX + upperCylRx * Math.cos(theta);
    const fluteYOff = upperCylRy * Math.sin(theta);
    const fluteAlpha = 0.15 + Math.sin(theta) * 0.3;
    ctx.strokeStyle = `rgba(100, 85, 70, ${fluteAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(fluteX, ruFluteBot + fluteYOff);
    ctx.lineTo(fluteX, ruFluteTop + fluteYOff);
    ctx.stroke();
    ctx.strokeStyle = `rgba(200, 185, 165, ${fluteAlpha * 0.5})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(fluteX + 1 * zoom, ruFluteBot + fluteYOff);
    ctx.lineTo(fluteX + 1 * zoom, ruFluteTop + fluteYOff);
    ctx.stroke();
  }

  // Right pillar glowing runes
  ctx.fillStyle = `rgba(${glowColor}, ${pillarRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  for (let i = 0; i < tower.level + 1; i++) {
    const runeY =
      pillarBottomY - 11 * zoom - pillarBounce - i * pillarHeight * zoom * 0.22;
    ctx.fillText(
      pillarRunes[(i + 2) % 4],
      pillarXR - pillarBounce * 0.5,
      runeY,
    );
  }
  ctx.shadowBlur = 0;

  // Pillar capital on right pillar - isometric 3D
  const rcX = pillarXR - pillarBounce * 0.5;

  // Astragal bead
  drawIsoCylinder(ctx, rcX, capitalY, capRx * 1.05, 1 * zoom, {
    body: "#b8a890",
    dark: "#a89880",
    light: "#c8b8a0",
    top: "#c0b098",
  });
  // Necking
  drawIsoCylinder(ctx, rcX, capitalY - 1 * zoom, capRx * 0.9, 1.5 * zoom, {
    body: "#c0b098",
    dark: "#b0a088",
    light: "#d0c0a8",
    top: "#c8b8a0",
  });
  // Annulet ring
  drawIsoCylinder(ctx, rcX, capitalY - 2.5 * zoom, capRx * 1.1, 0.8 * zoom, {
    body: "#c8b8a0",
    dark: "#b8a890",
    light: "#d8c8b0",
    top: "#d0c0a8",
  });

  // Glowing energy strips on pillars (cylindrical surface)
  const stripAngleL = (3 * Math.PI) / 4;
  const stripAngleR = Math.PI / 4;
  for (const p of [
    pillarX + pillarBounce * 0.5,
    pillarXR - pillarBounce * 0.5,
  ]) {
    for (let i = 0; i < tower.level + 2; i++) {
      const stripY =
        pillarBottomY -
        10 * zoom -
        pillarHeight * zoom * (0.15 + i * 0.2) -
        pillarBounce;
      const stripGlow =
        0.4 + Math.sin(time * 4 + i * 0.5) * 0.3 + attackPulse * 1.5;

      ctx.fillStyle = `${mainColor} ${stripGlow})`;
      ctx.beginPath();
      ctx.ellipse(
        p + pw * Math.cos(stripAngleL),
        stripY + pd * Math.sin(stripAngleL),
        3 * zoom,
        1.5 * zoom,
        0.46,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        p + pw * Math.cos(stripAngleR),
        stripY + pd * Math.sin(stripAngleR),
        3 * zoom,
        1.5 * zoom,
        -0.46,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === LEVEL 2 UNIQUE FEATURES ===
  if (tower.level >= 2) {
    // Floating mystical orbs beside pillars
    for (const side of [-1, 1]) {
      const orbX = screenPos.x + side * (baseWidth * 0.55) * zoom;
      const orbY =
        screenPos.y - 45 * zoom + Math.sin(time * 2 + side) * 4 * zoom;

      // Orb outer glow
      const orbGlow =
        0.4 + Math.sin(time * 3 + side * 2) * 0.2 + attackPulse * 0.3;
      ctx.fillStyle = `rgba(${glowColor}, ${orbGlow * 0.3})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 12 * zoom;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 8 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.fillStyle = `rgba(${glowColor}, ${orbGlow})`;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Orb energy ring
      ctx.strokeStyle = `rgba(${glowColor}, ${orbGlow * 0.6})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        orbX,
        orbY,
        6 * zoom,
        3 * zoom,
        time * 2 + side,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Ancient stone altar between pillars (3D isometric)
    const altarY = screenPos.y - 18 * zoom;
    drawIsometricPrism(
      ctx,
      screenPos.x,
      altarY,
      14,
      10,
      5,
      {
        top: "#6a5a4a",
        left: "#5a4a3a",
        right: "#4a3a2a",
        leftBack: "#7a6a5a",
        rightBack: "#6a5a4a",
      },
      zoom,
    );

    // Carved relief on altar front faces
    const altarHW = 14 * zoom * ISO_PRISM_W_FACTOR;
    const altarHD = 10 * zoom * ISO_PRISM_D_FACTOR;
    ctx.strokeStyle = "rgba(120, 105, 85, 0.3)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.strokeRect(
      screenPos.x - altarHW * 0.6,
      altarY - 3 * zoom,
      altarHW * 0.6,
      3 * zoom,
    );
    ctx.strokeRect(
      screenPos.x + altarHW * 0.1,
      altarY - 3 * zoom,
      altarHW * 0.6,
      3 * zoom,
    );

    // Gold inlay on altar edge
    ctx.strokeStyle = "rgba(201, 162, 39, 0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - altarHW, altarY - 5 * zoom);
    ctx.lineTo(screenPos.x, altarY - 5 * zoom + altarHD);
    ctx.lineTo(screenPos.x + altarHW, altarY - 5 * zoom);
    ctx.stroke();

    // Ancient tome on altar (3D book shape)
    const tomeX = screenPos.x;
    const tomeY = altarY - 6 * zoom;

    // Book spine (isometric slab)
    ctx.fillStyle = "#2a1508";
    ctx.beginPath();
    ctx.moveTo(tomeX - 5 * zoom, tomeY + 1 * zoom);
    ctx.lineTo(tomeX, tomeY + 2.5 * zoom);
    ctx.lineTo(tomeX + 5 * zoom, tomeY + 1 * zoom);
    ctx.lineTo(tomeX, tomeY - 0.5 * zoom);
    ctx.closePath();
    ctx.fill();

    // Book cover depth (front edge)
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.moveTo(tomeX - 5 * zoom, tomeY + 1 * zoom);
    ctx.lineTo(tomeX, tomeY + 2.5 * zoom);
    ctx.lineTo(tomeX, tomeY + 3.5 * zoom);
    ctx.lineTo(tomeX - 5 * zoom, tomeY + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#150800";
    ctx.beginPath();
    ctx.moveTo(tomeX, tomeY + 2.5 * zoom);
    ctx.lineTo(tomeX + 5 * zoom, tomeY + 1 * zoom);
    ctx.lineTo(tomeX + 5 * zoom, tomeY + 2 * zoom);
    ctx.lineTo(tomeX, tomeY + 3.5 * zoom);
    ctx.closePath();
    ctx.fill();

    // Page edges visible
    ctx.fillStyle = "#e8dcc0";
    ctx.beginPath();
    ctx.moveTo(tomeX - 4.5 * zoom, tomeY + 1.8 * zoom);
    ctx.lineTo(tomeX, tomeY + 3 * zoom);
    ctx.lineTo(tomeX, tomeY + 3.3 * zoom);
    ctx.lineTo(tomeX - 4.5 * zoom, tomeY + 2.1 * zoom);
    ctx.closePath();
    ctx.fill();

    // Gold corner clasps
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(tomeX - 4.5 * zoom, tomeY + 0.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tomeX + 4.5 * zoom, tomeY + 0.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Tome glowing rune on cover
    const tomeGlow = 0.5 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(${glowColor}, ${tomeGlow})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 5 * zoom;
    ctx.font = `${5 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText("ᛉ", tomeX, tomeY + 1 * zoom);
    ctx.shadowBlur = 0;

    // Tome aura glow
    const tomeAuraGrad = ctx.createRadialGradient(
      tomeX,
      tomeY,
      0,
      tomeX,
      tomeY,
      8 * zoom,
    );
    tomeAuraGrad.addColorStop(0, `rgba(${glowColor}, ${tomeGlow * 0.15})`);
    tomeAuraGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
    ctx.fillStyle = tomeAuraGrad;
    ctx.beginPath();
    ctx.ellipse(tomeX, tomeY, 8 * zoom, 5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flying arcane pages with text lines
    for (let page = 0; page < 4; page++) {
      const pagePhase = (time * 0.8 + page * 0.5) % 2;
      const pageX = screenPos.x + Math.sin(pagePhase * Math.PI * 2) * 15 * zoom;
      const pageY = altarY - 10 * zoom - pagePhase * 20 * zoom;
      const pageAlpha = Math.max(0, 1 - pagePhase / 2) * 0.6;

      if (pageAlpha > 0.1) {
        ctx.save();
        ctx.translate(pageX, pageY);
        ctx.rotate(Math.sin(time * 4 + page) * 0.3);
        // Page
        ctx.fillStyle = `rgba(255, 250, 240, ${pageAlpha})`;
        ctx.fillRect(-3 * zoom, -4 * zoom, 6 * zoom, 8 * zoom);
        // Text lines on page
        ctx.fillStyle = `rgba(60, 40, 20, ${pageAlpha * 0.4})`;
        for (let line = 0; line < 4; line++) {
          const lineW = (4 - Math.abs(line - 1.5) * 0.5) * zoom;
          ctx.fillRect(
            -lineW * 0.5,
            -2.5 * zoom + line * 1.8 * zoom,
            lineW,
            0.5 * zoom,
          );
        }
        // Glowing rune on page
        ctx.fillStyle = `rgba(${glowColor}, ${pageAlpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(0, 0, 1 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // === LEVEL 3 UNIQUE FEATURES ===
  if (tower.level >= 3) {
    // Ethereal spirit wisps circling the tower
    for (let wisp = 0; wisp < 4; wisp++) {
      const wispAngle = time * 1.5 + (wisp / 4) * Math.PI * 2;
      const wispRadius = 40 + Math.sin(time * 2 + wisp) * 8;
      const wispX = screenPos.x + Math.cos(wispAngle) * wispRadius * zoom;
      const wispY =
        screenPos.y - 50 * zoom + Math.sin(wispAngle) * wispRadius * 0.3 * zoom;

      // Wisp trail
      ctx.strokeStyle = `rgba(${glowColor}, 0.2)`;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      for (let t = 0; t < 8; t++) {
        const trailAngle = wispAngle - t * 0.15;
        const trailX = screenPos.x + Math.cos(trailAngle) * wispRadius * zoom;
        const trailY =
          screenPos.y -
          50 * zoom +
          Math.sin(trailAngle) * wispRadius * 0.3 * zoom;
        if (t === 0) ctx.moveTo(trailX, trailY);
        else ctx.lineTo(trailX, trailY);
      }
      ctx.stroke();

      // Wisp core
      const wispGlow = 0.6 + Math.sin(time * 5 + wisp * 2) * 0.3;
      ctx.fillStyle = `rgba(${glowColor}, ${wispGlow})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.arc(wispX, wispY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Dimensional rift cracks around base
    ctx.strokeStyle = `rgba(${glowColor}, ${0.4 + attackPulse * 0.4})`;
    ctx.lineWidth = 2 * zoom;
    for (let crack = 0; crack < 6; crack++) {
      const crackAngle = (crack / 6) * Math.PI * 2 + time * 0.1;
      const crackLen = (12 + Math.sin(time * 2 + crack) * 4) * zoom;
      const crackX = screenPos.x + Math.cos(crackAngle) * 35 * zoom;
      const crackY = screenPos.y + 10 * zoom + Math.sin(crackAngle) * 15 * zoom;

      ctx.beginPath();
      ctx.moveTo(crackX, crackY);
      ctx.lineTo(
        crackX + Math.cos(crackAngle) * crackLen,
        crackY + Math.sin(crackAngle) * crackLen * 0.4,
      );
      ctx.stroke();
    }

    // Ancient artifact hovering above altar
    const artifactY = screenPos.y - 35 * zoom + Math.sin(time * 2.5) * 3 * zoom;

    // Artifact glow aura
    const artifactGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse * 0.3;
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 15 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, artifactY, 10 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Artifact shape (mystical gem)
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow + 0.2})`;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, artifactY - 8 * zoom);
    ctx.lineTo(screenPos.x - 5 * zoom, artifactY);
    ctx.lineTo(screenPos.x, artifactY + 5 * zoom);
    ctx.lineTo(screenPos.x + 5 * zoom, artifactY);
    ctx.closePath();
    ctx.fill();

    // Artifact inner glow
    ctx.fillStyle = `rgba(255, 255, 255, ${artifactGlow * 0.8})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, artifactY - 1 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Rotating rune orbit around artifact
    ctx.fillStyle = `rgba(${glowColor}, ${artifactGlow})`;
    ctx.font = `${6 * zoom}px serif`;
    ctx.textAlign = "center";
    for (let r = 0; r < 4; r++) {
      const orbitAngle = time * 2 + (r / 4) * Math.PI * 2;
      const orbitX = screenPos.x + Math.cos(orbitAngle) * 8 * zoom;
      const orbitY = artifactY + Math.sin(orbitAngle) * 4 * zoom;
      ctx.fillText(["ᛗ", "ᛚ", "ᛝ", "ᛟ"][r], orbitX, orbitY);
    }
  }

  // === ARCH STRUCTURE WITH 3D VAULT ===
  const archBaseY =
    pillarBottomY - pillarHeight * zoom - pillarBounce + archVibrate * 0.5;
  const archLeftX = pillarX + pillarBounce * 0.75 - 4 * zoom;
  const archRightX = pillarXR - pillarBounce * 0.75 + 4 * zoom;
  const archMidX = (archLeftX + archRightX) / 2;
  const archSpan = archRightX - archLeftX;
  const archDepth = 8 * zoom;
  const archCurveSteps = 24;
  const outerR = archSpan * 0.58;
  const innerR = archSpan * 0.32;
  const archForeshorten = 0.9;
  const archTopY = archBaseY - outerR * archForeshorten - archLift;
  const archCenterY = archBaseY - innerR * archForeshorten * 0.45;

  // Front face of arch (filled stone band between outer and inner curves)
  ctx.fillStyle = "#b8a890";
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ox = archMidX + archVibrate + Math.cos(angle) * outerR;
    const oy = archBaseY - Math.sin(angle) * outerR * archForeshorten;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
  }
  for (let i = archCurveSteps; i >= 0; i--) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ix = archMidX + archVibrate + Math.cos(angle) * innerR;
    const iy = archBaseY - Math.sin(angle) * innerR * archForeshorten;
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  ctx.fill();

  // Strong outer arch outline
  ctx.strokeStyle = "#6a5a4a";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ox = archMidX + archVibrate + Math.cos(angle) * outerR;
    const oy = archBaseY - Math.sin(angle) * outerR * archForeshorten;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
  }
  ctx.stroke();

  // Inner arch outline
  ctx.strokeStyle = "#7a6a5a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ix = archMidX + archVibrate + Math.cos(angle) * innerR;
    const iy = archBaseY - Math.sin(angle) * innerR * archForeshorten;
    if (i === 0) ctx.moveTo(ix, iy);
    else ctx.lineTo(ix, iy);
  }
  ctx.stroke();

  // Highlight on outer edge of arch
  ctx.strokeStyle = "rgba(220, 210, 195, 0.4)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ox = archMidX + archVibrate + Math.cos(angle) * (outerR + 1 * zoom);
    const oy =
      archBaseY - Math.sin(angle) * (outerR + 1 * zoom) * archForeshorten;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
  }
  ctx.stroke();

  // Voussoir stones with alternating shade and glowing mortar joints
  const voussoirCount = 9;
  for (let v = 0; v < voussoirCount; v++) {
    const t0 = v / voussoirCount;
    const t1 = (v + 1) / voussoirCount;
    const a0 = Math.PI * (1 - t0);
    const a1 = Math.PI * (1 - t1);
    const shade = v % 2 === 0 ? 0 : 20;

    ctx.fillStyle = `rgb(${178 + shade}, ${162 + shade}, ${138 + shade})`;
    ctx.beginPath();
    ctx.moveTo(
      archMidX + archVibrate + Math.cos(a0) * outerR,
      archBaseY - Math.sin(a0) * outerR * 0.7,
    );
    ctx.lineTo(
      archMidX + archVibrate + Math.cos(a1) * outerR,
      archBaseY - Math.sin(a1) * outerR * 0.7,
    );
    ctx.lineTo(
      archMidX + archVibrate + Math.cos(a1) * innerR,
      archBaseY - Math.sin(a1) * innerR * 0.7,
    );
    ctx.lineTo(
      archMidX + archVibrate + Math.cos(a0) * innerR,
      archBaseY - Math.sin(a0) * innerR * 0.7,
    );
    ctx.closePath();
    ctx.fill();

    // Glowing mortar joint between voussoirs
    const mortarAlpha =
      0.12 + Math.sin(time * 2 + v * 0.7) * 0.08 + attackPulse * 0.25;
    ctx.strokeStyle = `rgba(${glowColor}, ${mortarAlpha})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      archMidX + archVibrate + Math.cos(a0) * outerR,
      archBaseY - Math.sin(a0) * outerR * 0.7,
    );
    ctx.lineTo(
      archMidX + archVibrate + Math.cos(a0) * innerR,
      archBaseY - Math.sin(a0) * innerR * 0.7,
    );
    ctx.stroke();
  }

  // Arch rune carvings on voussoir faces
  const archRuneGlow = 0.5 + Math.sin(time * 3) * 0.2 + attackPulse * 0.5;
  ctx.fillStyle = `rgba(${glowColor}, ${archRuneGlow})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 4 * zoom;
  ctx.font = `${7 * zoom}px serif`;
  ctx.textAlign = "center";
  const archRunes = ["ᚡ", "ᚢ", "ᚣ", "ᚤ", "ᚥ"];
  for (let i = 0; i < 5; i++) {
    const runeT = (i + 0.5) / 5;
    const runeAngle = Math.PI * (1 - runeT);
    const midRad = (outerR + innerR) / 2;
    const runeX = archMidX + archVibrate + Math.cos(runeAngle) * midRad;
    const runeY = archBaseY - Math.sin(runeAngle) * midRad * 0.7;
    ctx.fillText(archRunes[i], runeX, runeY);
  }
  ctx.shadowBlur = 0;

  // Energy conduit along inner arch curve
  const conduitGlow = 0.5 + Math.sin(time * 5) * 0.3 + attackPulse * 1.5;
  ctx.strokeStyle = `rgba(${glowColor}, ${conduitGlow})`;
  ctx.lineWidth = (2 + attackPulse * 3) * zoom;
  ctx.beginPath();
  for (let i = 0; i <= archCurveSteps; i++) {
    const t = i / archCurveSteps;
    const angle = Math.PI * (1 - t);
    const ix = archMidX + archVibrate + Math.cos(angle) * innerR;
    const iy = archBaseY - Math.sin(angle) * innerR * 0.7;
    if (i === 0) ctx.moveTo(ix, iy);
    else ctx.lineTo(ix, iy);
  }
  ctx.stroke();

  // Flowing energy particles along arch conduit
  for (let p = 0; p < 5; p++) {
    const pPhase = (time * 1.5 + p * 0.2) % 1;
    const pAngle = Math.PI * (1 - pPhase);
    const px = archMidX + archVibrate + Math.cos(pAngle) * innerR;
    const py = archBaseY - Math.sin(pAngle) * innerR * 0.7;
    ctx.fillStyle = `rgba(${glowColor}, ${0.6 + Math.sin(time * 8 + p) * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(px, py, (2 + attackPulse * 2) * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Keystone with mystical core (positioned inside the arch opening, shifted up)
  const keystoneY = archCenterY - 8 * zoom;
  ctx.fillStyle = "#d8c8b0";
  ctx.beginPath();
  ctx.moveTo(screenPos.x + archVibrate - 7 * zoom, keystoneY - 4.5 * zoom);
  ctx.lineTo(screenPos.x + archVibrate, keystoneY - 18 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 7 * zoom, keystoneY - 4.5 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 4.5 * zoom, keystoneY + 2 * zoom);
  ctx.lineTo(screenPos.x + archVibrate - 4.5 * zoom, keystoneY + 2 * zoom);
  ctx.closePath();
  ctx.fill();

  // Keystone decorative lines
  ctx.strokeStyle = "#a89878";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x + archVibrate - 4 * zoom, keystoneY - 3 * zoom);
  ctx.lineTo(screenPos.x + archVibrate, keystoneY - 14 * zoom);
  ctx.lineTo(screenPos.x + archVibrate + 4 * zoom, keystoneY - 3 * zoom);
  ctx.stroke();

  // Keystone energy core
  const coreGrad = ctx.createRadialGradient(
    screenPos.x + archVibrate,
    keystoneY - 9 * zoom,
    0,
    screenPos.x + archVibrate,
    keystoneY - 9 * zoom,
    (6 + attackPulse * 3) * zoom,
  );
  coreGrad.addColorStop(0, `rgba(255, 255, 255, ${conduitGlow})`);
  coreGrad.addColorStop(0.3, `rgba(${glowColor}, ${conduitGlow})`);
  coreGrad.addColorStop(0.6, `rgba(${glowColor}, ${conduitGlow * 0.5})`);
  coreGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(
    screenPos.x + archVibrate,
    keystoneY - 9 * zoom,
    (6 + attackPulse * 3) * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Keystone rune
  ctx.fillStyle = `rgba(${glowColor}, ${conduitGlow + 0.2})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.font = `bold ${9 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ᛉ", screenPos.x + archVibrate, keystoneY - 7.5 * zoom);
  ctx.shadowBlur = 0;

  // === ANIMATED MYSTICAL ELEMENTS ===

  // Oscillating runic rings around the arch opening (subtle)
  for (let ring = 0; ring < 3; ring++) {
    const ringPhaseOff = ring * ((Math.PI * 2) / 3);
    const ringTilt = Math.sin(time * 1.2 + ringPhaseOff) * 0.4;
    const ringRadius = (10 + ring * 4) * zoom + portalExpand * 0.2;
    const ringAlpha =
      0.12 + Math.sin(time * 2.5 + ring) * 0.06 + attackPulse * 0.2;

    ctx.strokeStyle = `rgba(${glowColor}, ${ringAlpha})`;
    ctx.lineWidth = (1.5 - ring * 0.3) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      archMidX + archVibrate,
      archCenterY,
      ringRadius,
      ringRadius * (0.35 + ringTilt * 0.15),
      time * (0.8 + ring * 0.3) + ringPhaseOff,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Small rune symbols orbiting on each ring
    const ringRuneSymbols = ["ᛏ", "ᛒ", "ᛖ", "ᛗ"];
    for (let r = 0; r < 4; r++) {
      const symAngle =
        time * (0.8 + ring * 0.3) + ringPhaseOff + (r / 4) * Math.PI * 2;
      const symX = archMidX + archVibrate + Math.cos(symAngle) * ringRadius;
      const symY =
        archCenterY +
        Math.sin(symAngle) * ringRadius * (0.35 + ringTilt * 0.15);
      ctx.fillStyle = `rgba(${glowColor}, ${ringAlpha + 0.1})`;
      ctx.font = `${(4 + ring) * zoom}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(ringRuneSymbols[r], symX, symY);
    }
  }

  // Arcane clockwork gears visible in archway
  for (let gear = 0; gear < 2; gear++) {
    const gearSide = gear === 0 ? -1 : 1;
    const gearX = archMidX + archVibrate + gearSide * 10 * zoom;
    const gearY = archCenterY + 2 * zoom;
    const gearRadius = (4 + gear * 1.5) * zoom;
    const gearRotation = time * (2 + gear) * gearSide;
    const gearAlpha =
      0.12 + Math.sin(time * 3 + gear * 2) * 0.06 + attackPulse * 0.15;
    const gearTeeth = 8;

    ctx.strokeStyle = `rgba(${glowColor}, ${gearAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    for (let t = 0; t <= gearTeeth * 2; t++) {
      const toothAngle = gearRotation + (t / (gearTeeth * 2)) * Math.PI * 2;
      const toothR = t % 2 === 0 ? gearRadius : gearRadius * 0.75;
      const tx = gearX + Math.cos(toothAngle) * toothR;
      const ty = gearY + Math.sin(toothAngle) * toothR * 0.5;
      if (t === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
    ctx.stroke();

    // Gear center hub
    ctx.fillStyle = `rgba(${glowColor}, ${gearAlpha + 0.1})`;
    ctx.beginPath();
    ctx.ellipse(gearX, gearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gear spokes
    for (let s = 0; s < 4; s++) {
      const spokeAngle = gearRotation + (s / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(gearX, gearY);
      ctx.lineTo(
        gearX + Math.cos(spokeAngle) * gearRadius * 0.7,
        gearY + Math.sin(spokeAngle) * gearRadius * 0.35,
      );
      ctx.stroke();
    }
  }

  // Pendulum swinging in center of archway
  const pendulumAngle = Math.sin(time * 2.5) * 0.4;
  const pendulumLen = 12 * zoom;
  const pendulumPivotY = archCenterY - 8 * zoom;
  const pendulumBobX =
    archMidX + archVibrate + Math.sin(pendulumAngle) * pendulumLen;
  const pendulumBobY = pendulumPivotY + Math.cos(pendulumAngle) * pendulumLen;
  const pendulumAlpha = 0.18 + attackPulse * 0.2;

  ctx.strokeStyle = `rgba(${glowColor}, ${pendulumAlpha})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(archMidX + archVibrate, pendulumPivotY);
  ctx.lineTo(pendulumBobX, pendulumBobY);
  ctx.stroke();

  ctx.fillStyle = `rgba(${glowColor}, ${pendulumAlpha + 0.15})`;
  ctx.shadowColor = `rgb(${glowColor})`;
  ctx.shadowBlur = 6 * zoom;
  ctx.beginPath();
  ctx.arc(pendulumBobX, pendulumBobY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Floating stone fragments orbiting during attacks
  if (attackPulse > 0.05) {
    for (let frag = 0; frag < 6; frag++) {
      const fragAngle = time * 4 + (frag / 6) * Math.PI * 2;
      const fragRad = (20 + Math.sin(time * 3 + frag) * 8) * zoom;
      const fragX = archMidX + Math.cos(fragAngle) * fragRad;
      const fragY =
        archCenterY +
        Math.sin(fragAngle) * fragRad * 0.4 -
        attackPulse * 10 * zoom;
      const fragSize = (2 + Math.sin(frag * 1.7) * 1) * zoom;
      const fragAlpha = attackPulse * 0.7;
      const fragRotation = time * 6 + frag * 1.2;

      ctx.save();
      ctx.translate(fragX, fragY);
      ctx.rotate(fragRotation);
      ctx.fillStyle = `rgba(180, 165, 140, ${fragAlpha})`;
      ctx.fillRect(-fragSize, -fragSize * 0.6, fragSize * 2, fragSize * 1.2);
      ctx.fillStyle = `rgba(140, 125, 100, ${fragAlpha})`;
      ctx.beginPath();
      ctx.moveTo(fragSize, -fragSize * 0.6);
      ctx.lineTo(fragSize + fragSize * 0.4, -fragSize * 0.3);
      ctx.lineTo(fragSize + fragSize * 0.4, fragSize * 0.9);
      ctx.lineTo(fragSize, fragSize * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Resonance crystals that vibrate and rotate at arch springers
  for (let cSide = -1; cSide <= 1; cSide += 2) {
    const crystalBaseX = archMidX + archVibrate + cSide * innerR * 0.5;
    const crystalBaseY = archCenterY + 6 * zoom;
    const crystalVibrate =
      Math.sin(time * 12 + cSide * 3) * (1 + attackPulse * 3) * zoom;
    const crystalAlpha =
      0.5 + Math.sin(time * 4 + cSide) * 0.2 + attackPulse * 0.3;

    ctx.save();
    ctx.translate(crystalBaseX + crystalVibrate, crystalBaseY);
    ctx.rotate(time * 1.5 * cSide * 0.1);

    ctx.fillStyle = `rgba(${glowColor}, ${crystalAlpha * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(0, -8 * zoom);
    ctx.lineTo(-3 * zoom, -2 * zoom);
    ctx.lineTo(-2 * zoom, 4 * zoom);
    ctx.lineTo(2 * zoom, 4 * zoom);
    ctx.lineTo(3 * zoom, -2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Crystal highlight face
    ctx.fillStyle = `rgba(255, 255, 255, ${crystalAlpha * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(0, -8 * zoom);
    ctx.lineTo(3 * zoom, -2 * zoom);
    ctx.lineTo(1 * zoom, -1 * zoom);
    ctx.closePath();
    ctx.fill();

    // Crystal core glow
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = (8 + attackPulse * 10) * zoom;
    ctx.fillStyle = `rgba(${glowColor}, ${crystalAlpha})`;
    ctx.beginPath();
    ctx.arc(0, -2 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // === PORTAL EFFECT ===
  const portalCenterY = archCenterY + 6 * zoom;
  const glowIntensity = 0.5 + Math.sin(time * 3) * 0.3 + attackPulse;
  const portalSizeX = 14 * zoom + portalExpand * 0.5;
  const portalSizeY = 18 * zoom + portalExpand * 0.6;

  const portalGrad = ctx.createRadialGradient(
    screenPos.x,
    portalCenterY,
    0,
    screenPos.x,
    portalCenterY,
    portalSizeY,
  );
  portalGrad.addColorStop(0, `rgba(${glowColor}, ${glowIntensity * 0.5})`);
  portalGrad.addColorStop(0.5, `rgba(${glowColor}, ${glowIntensity * 0.25})`);
  portalGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = portalGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    portalCenterY,
    portalSizeX,
    portalSizeY,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Dimensional depth rings (concentric ellipses receding into portal)
  for (let dRing = 0; dRing < 5; dRing++) {
    const depthFade = dRing / 5;
    const depthAlpha = glowIntensity * (0.15 - depthFade * 0.025);
    const depthScale = 1 - depthFade * 0.15;
    const depthY = portalCenterY + dRing * 1.5 * zoom;
    ctx.strokeStyle = `rgba(${glowColor}, ${depthAlpha})`;
    ctx.lineWidth = (1.5 - dRing * 0.2) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      depthY,
      portalSizeX * depthScale,
      portalSizeY * depthScale * 0.8,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Dimensional ripple distortion waves
  for (let ripple = 0; ripple < 3; ripple++) {
    const ripplePhase = (time * 1.5 + ripple * 0.8) % 2;
    const rippleScale = 0.3 + ripplePhase * 0.6;
    const rippleAlpha = (1 - ripplePhase / 2) * 0.2 * glowIntensity;
    if (rippleAlpha > 0.02) {
      ctx.strokeStyle = `rgba(${glowColor}, ${rippleAlpha})`;
      ctx.lineWidth = (2 - ripplePhase * 0.8) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        portalCenterY,
        portalSizeX * rippleScale,
        portalSizeY * rippleScale,
        ripple * 0.3,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  // Swirling vortex
  const vortexSpeed = time * 3;
  for (let spiral = 0; spiral < 4; spiral++) {
    const spiralOffset = (spiral / 4) * Math.PI * 2;
    ctx.strokeStyle = `rgba(${glowColor}, ${0.2 + Math.sin(time * 4 + spiral) * 0.1 + attackPulse * 0.2})`;
    ctx.lineWidth = (1.8 - spiral * 0.3) * zoom;
    ctx.beginPath();

    for (let i = 0; i <= 25; i++) {
      const t = i / 25;
      const angle = vortexSpeed + spiralOffset + t * Math.PI * 4;
      const radius = t * portalSizeX * 0.85;
      const x = screenPos.x + Math.cos(angle) * radius;
      const y =
        portalCenterY + Math.sin(angle) * radius * (portalSizeY / portalSizeX);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Inner swirl particles
  for (let p = 0; p < 10; p++) {
    const particleAngle = vortexSpeed * 1.5 + (p / 10) * Math.PI * 2;
    const particleRadius = portalSizeX * (0.25 + Math.sin(time * 5 + p) * 0.2);
    const px = screenPos.x + Math.cos(particleAngle) * particleRadius;
    const py =
      portalCenterY +
      Math.sin(particleAngle) * particleRadius * (portalSizeY / portalSizeX);

    ctx.fillStyle = `rgba(${glowColor}, ${0.5 + Math.sin(time * 6 + p) * 0.3})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(px, py, (2.5 + Math.sin(time * 8 + p) * 1) * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Central energy core in portal
  const coreSize = (4 + Math.sin(time * 4) * 1.5 + attackPulse * 2) * zoom;
  const coreGrad2 = ctx.createRadialGradient(
    screenPos.x,
    portalCenterY,
    0,
    screenPos.x,
    portalCenterY,
    coreSize * 2,
  );
  coreGrad2.addColorStop(0, `rgba(255, 255, 255, ${0.8 + attackPulse * 0.2})`);
  coreGrad2.addColorStop(0.3, `rgba(${glowColor}, ${0.6 + attackPulse * 0.3})`);
  coreGrad2.addColorStop(1, `rgba(${glowColor}, 0)`);
  ctx.fillStyle = coreGrad2;
  ctx.beginPath();
  ctx.arc(screenPos.x, portalCenterY, coreSize * 2, 0, Math.PI * 2);
  ctx.fill();

  // Mystical scanlines in portal
  ctx.strokeStyle = `rgba(${glowColor}, ${glowIntensity * 0.25})`;
  ctx.lineWidth = 1 * zoom;
  for (let sl = 0; sl < 10; sl++) {
    const sly = portalCenterY - 24 * zoom + sl * 5 * zoom;
    const slw = 20 - Math.abs(sl - 5) * 3;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - slw * zoom, sly);
    ctx.lineTo(screenPos.x + slw * zoom, sly);
    ctx.stroke();
  }

  // Sound/energy waves
  const waveCount = tower.level + 3;
  for (let i = 0; i < waveCount; i++) {
    const wavePhase = (time * 2 + i * 0.25) % 1;
    const waveRadius = 10 + wavePhase * 55;
    const waveAlpha =
      0.6 * (1 - wavePhase) * (glowIntensity + attackPulse * 0.5);

    ctx.strokeStyle = `rgba(${glowColor}, ${waveAlpha})`;
    ctx.lineWidth = (3.5 - wavePhase * 2.5) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      portalCenterY - 5 * zoom,
      waveRadius * zoom * 0.8,
      waveRadius * zoom * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Attack burst effect
  if (timeSinceFire < 300) {
    const burstPhase = timeSinceFire / 300;
    const burstAlpha = (1 - burstPhase) * 0.8;
    const burstSize = 18 + burstPhase * 25;

    ctx.fillStyle = `rgba(${glowColor}, ${burstAlpha})`;
    ctx.shadowColor = `rgb(${glowColor})`;
    ctx.shadowBlur = 20 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, portalCenterY, burstSize * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Expanding ring
    ctx.strokeStyle = `rgba(${glowColor}, ${burstAlpha * 0.5})`;
    ctx.lineWidth = 4 * zoom * (1 - burstPhase);
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      portalCenterY - 5 * zoom,
      (25 + burstPhase * 45) * zoom,
      (12 + burstPhase * 22) * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Floating music notes / arcane symbols
  const particleCount = 7 + tower.level;
  for (let i = 0; i < particleCount; i++) {
    const notePhase = (time * 1.2 + i * 0.35) % 3;
    const noteAngle = (i / particleCount) * Math.PI * 2 + time * 0.5;
    const noteRadius = 24 + Math.sin(notePhase * Math.PI) * 14;
    const noteX = screenPos.x + Math.cos(noteAngle) * noteRadius * zoom * 0.9;
    const noteY =
      portalCenterY -
      8 * zoom +
      Math.sin(noteAngle) * noteRadius * zoom * 0.45 -
      notePhase * 12 * zoom;
    const noteAlpha = Math.max(0, 1 - notePhase / 3) * 0.7;

    if (noteAlpha > 0.1) {
      ctx.fillStyle = `rgba(${glowColor}, ${noteAlpha})`;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 4 * zoom;
      ctx.font = `${(10 + Math.sin(time * 4 + i) * 2) * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const symbols = ["♪", "♫", "♬", "♩", "𝄞", "✦", "✧"];
      ctx.fillText(symbols[i % 7], noteX, noteY);
      ctx.shadowBlur = 0;

      // Note trail
      ctx.strokeStyle = `rgba(${glowColor}, ${noteAlpha * 0.3})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(noteX, noteY);
      ctx.lineTo(
        noteX + Math.cos(noteAngle + Math.PI) * 10 * zoom,
        noteY + Math.sin(noteAngle + Math.PI) * 5 * zoom,
      );
      ctx.stroke();
    }
  }

  // === SHOCKWAVE EMITTER (Level 4 Upgrade A) - EPIC DARK FANTASY ===
  if (isShockwave) {
    // Isometric diamond seismic sensors on pillars
    for (let side = -1; side <= 1; side += 2) {
      const genX =
        side < 0 ? pillarX + pillarBounce * 0.5 : pillarXR - pillarBounce * 0.5;
      const genY = pillarBottomY - pillarHeight * zoom * 0.45 - pillarBounce;
      const seismicPulse =
        0.5 + Math.sin(time * 8 + side) * 0.3 + attackPulse * 0.5;
      const dW = 10 * zoom;
      const dH = 7 * zoom;

      // Isometric diamond housing (back face)
      ctx.fillStyle = "#3a1515";
      ctx.beginPath();
      ctx.moveTo(genX, genY - dH);
      ctx.lineTo(genX + dW, genY);
      ctx.lineTo(genX, genY + dH * 0.6);
      ctx.lineTo(genX - dW, genY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5a2525";
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();

      // Diamond depth edge (3D bottom face)
      ctx.fillStyle = "#2a0c0c";
      ctx.beginPath();
      ctx.moveTo(genX - dW, genY);
      ctx.lineTo(genX, genY + dH * 0.6);
      ctx.lineTo(genX, genY + dH * 0.6 + 3 * zoom);
      ctx.lineTo(genX - dW, genY + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#200808";
      ctx.beginPath();
      ctx.moveTo(genX + dW, genY);
      ctx.lineTo(genX, genY + dH * 0.6);
      ctx.lineTo(genX, genY + dH * 0.6 + 3 * zoom);
      ctx.lineTo(genX + dW, genY + 2 * zoom);
      ctx.closePath();
      ctx.fill();

      // Inner diamond border
      ctx.strokeStyle = `rgba(255, 80, 60, ${0.3 + seismicPulse * 0.4})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(genX, genY - dH * 0.6);
      ctx.lineTo(genX + dW * 0.65, genY);
      ctx.lineTo(genX, genY + dH * 0.35);
      ctx.lineTo(genX - dW * 0.65, genY);
      ctx.closePath();
      ctx.stroke();

      // Core glow
      const coreR =
        (3.5 + Math.sin(time * 6 + side * 2) * 1 + attackPulse * 3) * zoom;
      ctx.fillStyle = `rgba(255, 80, 50, ${seismicPulse * 0.6})`;
      ctx.shadowColor = "#ff3322";
      ctx.shadowBlur = (6 + attackPulse * 10) * zoom;
      ctx.beginPath();
      ctx.moveTo(genX, genY - coreR);
      ctx.lineTo(genX + coreR * 1.4, genY);
      ctx.lineTo(genX, genY + coreR * 0.6);
      ctx.lineTo(genX - coreR * 1.4, genY);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bright hot center
      ctx.fillStyle = `rgba(255, 230, 200, ${seismicPulse})`;
      ctx.beginPath();
      ctx.arc(genX, genY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Cross-hair lines
      ctx.strokeStyle = `rgba(255, 100, 70, ${0.4 + attackPulse * 0.4})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(genX - dW * 0.45, genY);
      ctx.lineTo(genX - 2 * zoom, genY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(genX + 2 * zoom, genY);
      ctx.lineTo(genX + dW * 0.45, genY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(genX, genY - dH * 0.4);
      ctx.lineTo(genX, genY - 2 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(genX, genY + 2 * zoom);
      ctx.lineTo(genX, genY + dH * 0.2);
      ctx.stroke();
    }

    // Jagged red rune bands on pillar shafts
    for (let side = -1; side <= 1; side += 2) {
      const bpX =
        side < 0 ? pillarX + pillarBounce * 0.5 : pillarXR - pillarBounce * 0.5;
      const bandGlow = 0.3 + attackPulse * 0.6;
      ctx.strokeStyle = `rgba(255, 60, 40, ${bandGlow})`;
      ctx.lineWidth = 1.5 * zoom;
      for (let b = 0; b < 3; b++) {
        const bY =
          pillarBottomY - pillarHeight * zoom * (0.2 + b * 0.25) - pillarBounce;
        ctx.beginPath();
        for (let seg = 0; seg <= 6; seg++) {
          const sx = bpX - pw * 0.8 + (seg / 6) * pw * 1.6;
          const sy = bY + Math.sin(seg * 1.5 + time * 4) * 1.5 * zoom;
          if (seg === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    }

    // Floating debris chunks during attack
    if (attackPulse > 0.1) {
      for (let i = 0; i < 8; i++) {
        const debrisAngle = (i / 8) * Math.PI * 2 + time * 2;
        const debrisHeight = attackPulse * 25 * zoom * Math.sin(time * 5 + i);
        const debrisX = screenPos.x + Math.cos(debrisAngle) * 30 * zoom;
        const debrisY = screenPos.y + 5 * zoom - debrisHeight;
        ctx.save();
        ctx.translate(debrisX, debrisY);
        ctx.rotate(time * 6 + i);
        ctx.fillStyle = `rgba(139, 90, 60, ${attackPulse * 0.8})`;
        ctx.fillRect(-2 * zoom, -2 * zoom, 4 * zoom, 3 * zoom);
        ctx.fillStyle = `rgba(100, 60, 40, ${attackPulse * 0.6})`;
        ctx.fillRect(2 * zoom, -2 * zoom, 2 * zoom, 3 * zoom);
        ctx.restore();
      }
    }

    // Massive shockwave rings during attack
    if (timeSinceFire < 500) {
      const shockPhase = timeSinceFire / 500;
      for (let ring = 0; ring < 3; ring++) {
        const ringDelay = ring * 0.1;
        const ringPhase = Math.max(0, shockPhase - ringDelay);
        if (ringPhase > 0 && ringPhase < 1) {
          const ringRadius = 30 + ringPhase * 60;
          const ringAlpha = (1 - ringPhase) * 0.7;
          ctx.strokeStyle = `rgba(255, 100, 80, ${ringAlpha})`;
          ctx.lineWidth = (4 - ring) * zoom * (1 - ringPhase);
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            screenPos.y + 8 * zoom,
            ringRadius * zoom,
            ringRadius * 0.4 * zoom,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
    }

    // Red energy vortex in portal
    for (let v = 0; v < 12; v++) {
      const vortexAngle = time * 3 + (v / 12) * Math.PI * 2;
      const vortexRadius = 15 + Math.sin(time * 4 + v) * 5;
      const vortexX = screenPos.x + Math.cos(vortexAngle) * vortexRadius * zoom;
      const vortexY =
        portalCenterY + Math.sin(vortexAngle) * vortexRadius * 0.4 * zoom;
      ctx.fillStyle = `rgba(255, 80, 80, ${0.3 + Math.sin(time * 6 + v) * 0.15})`;
      ctx.beginPath();
      ctx.arc(vortexX, vortexY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === SYMPHONY HALL (Level 4 Upgrade B) - EPIC DARK FANTASY ===
  if (isSymphony) {
    // Isometric hexagonal resonance lenses on pillars
    for (let side = -1; side <= 1; side += 2) {
      const ampX =
        side < 0 ? pillarX + pillarBounce * 0.5 : pillarXR - pillarBounce * 0.5;
      const ampY = pillarBottomY - pillarHeight * zoom * 0.45 - pillarBounce;
      const crystalGlow =
        0.5 + Math.sin(time * 5 + side) * 0.3 + attackPulse * 0.5;
      const hR = 9 * zoom;

      // Isometric hexagon housing (back face)
      ctx.fillStyle = "#0c1a35";
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hAngle = (h / 6) * Math.PI * 2 - Math.PI / 6;
        const hx = ampX + Math.cos(hAngle) * hR;
        const hy = ampY + Math.sin(hAngle) * hR * 0.55;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1a3570";
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();

      // Hex depth edges (3D bottom)
      ctx.fillStyle = "#081228";
      ctx.beginPath();
      const hexBL = {
        x: ampX + Math.cos((Math.PI * 5) / 6) * hR,
        y: ampY + Math.sin((Math.PI * 5) / 6) * hR * 0.55,
      };
      const hexB = {
        x: ampX + Math.cos(Math.PI / 2) * hR,
        y: ampY + Math.sin(Math.PI / 2) * hR * 0.55,
      };
      const hexBR = {
        x: ampX + Math.cos(Math.PI / 6) * hR,
        y: ampY + Math.sin(Math.PI / 6) * hR * 0.55,
      };
      ctx.moveTo(hexBL.x, hexBL.y);
      ctx.lineTo(hexB.x, hexB.y);
      ctx.lineTo(hexB.x, hexB.y + 3 * zoom);
      ctx.lineTo(hexBL.x, hexBL.y + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#060e20";
      ctx.beginPath();
      ctx.moveTo(hexB.x, hexB.y);
      ctx.lineTo(hexBR.x, hexBR.y);
      ctx.lineTo(hexBR.x, hexBR.y + 2 * zoom);
      ctx.lineTo(hexB.x, hexB.y + 3 * zoom);
      ctx.closePath();
      ctx.fill();

      // Inner hexagon ring
      ctx.strokeStyle = `rgba(80, 180, 255, ${0.3 + crystalGlow * 0.4})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hAngle = (h / 6) * Math.PI * 2 - Math.PI / 6;
        const hx = ampX + Math.cos(hAngle) * hR * 0.6;
        const hy = ampY + Math.sin(hAngle) * hR * 0.6 * 0.55;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();

      // Radial spokes from center to hex vertices
      ctx.strokeStyle = `rgba(60, 150, 220, ${0.15 + crystalGlow * 0.15})`;
      ctx.lineWidth = 0.7 * zoom;
      for (let h = 0; h < 6; h++) {
        const hAngle = (h / 6) * Math.PI * 2 - Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(ampX, ampY);
        ctx.lineTo(
          ampX + Math.cos(hAngle) * hR * 0.85,
          ampY + Math.sin(hAngle) * hR * 0.85 * 0.55,
        );
        ctx.stroke();
      }

      // Glowing core lens
      const lensR =
        (3 + Math.sin(time * 4 + side * 3) * 0.8 + attackPulse * 2) * zoom;
      ctx.fillStyle = `rgba(80, 180, 255, ${crystalGlow * 0.5})`;
      ctx.shadowColor = "#55bbff";
      ctx.shadowBlur = (6 + attackPulse * 10) * zoom;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hAngle = (h / 6) * Math.PI * 2 - Math.PI / 6;
        const hx = ampX + Math.cos(hAngle) * lensR;
        const hy = ampY + Math.sin(hAngle) * lensR * 0.55;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bright center point
      ctx.fillStyle = `rgba(220, 245, 255, ${crystalGlow})`;
      ctx.beginPath();
      ctx.arc(ampX, ampY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Concentric ring ripple (like a speaker cone)
      for (let ring = 1; ring <= 3; ring++) {
        const ringAlpha =
          0.1 +
          Math.sin(time * 6 - ring * 1.2 + side) * 0.08 +
          attackPulse * 0.15;
        ctx.strokeStyle = `rgba(100, 200, 255, ${ringAlpha})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          ampX,
          ampY,
          hR * 0.2 * ring,
          hR * 0.12 * ring,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }

    // Flowing cyan energy veins on pillar shafts
    for (let side = -1; side <= 1; side += 2) {
      const bpX =
        side < 0 ? pillarX + pillarBounce * 0.5 : pillarXR - pillarBounce * 0.5;
      const veinGlow = 0.25 + Math.sin(time * 3) * 0.1 + attackPulse * 0.5;
      ctx.strokeStyle = `rgba(80, 200, 255, ${veinGlow})`;
      ctx.lineWidth = 1.2 * zoom;
      for (let v = 0; v < 2; v++) {
        const vOff = v === 0 ? -pw * 0.3 : pw * 0.3;
        ctx.beginPath();
        for (let seg = 0; seg <= 8; seg++) {
          const t = seg / 8;
          const sx =
            bpX + vOff + Math.sin(t * Math.PI * 3 + time * 2 + v) * 2 * zoom;
          const sy =
            pillarBottomY -
            pillarHeight * zoom * (0.1 + t * 0.7) -
            pillarBounce;
          if (seg === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    }

    // Floating crystalline note shards
    for (let i = 0; i < 6; i++) {
      const shardPhase = (time * 0.6 + i * 0.5) % 3;
      const shardAngle = (i / 6) * Math.PI * 2 + time * 0.3;
      const shardRadius = 28 + Math.sin(shardPhase * Math.PI * 0.5) * 8;
      const shardX = screenPos.x + Math.cos(shardAngle) * shardRadius * zoom;
      const shardY =
        portalCenterY -
        10 * zoom +
        Math.sin(shardAngle) * shardRadius * 0.3 * zoom -
        shardPhase * 6 * zoom;
      const shardAlpha = Math.max(0, 1 - shardPhase / 3) * 0.5;

      if (shardAlpha > 0.05) {
        ctx.save();
        ctx.translate(shardX, shardY);
        ctx.rotate(time * 2 + i * 1.1);
        ctx.fillStyle = `rgba(120, 210, 255, ${shardAlpha})`;
        ctx.beginPath();
        ctx.moveTo(0, -4 * zoom);
        ctx.lineTo(2 * zoom, 0);
        ctx.lineTo(0, 4 * zoom);
        ctx.lineTo(-2 * zoom, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(200, 240, 255, ${shardAlpha * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(0, -4 * zoom);
        ctx.lineTo(2 * zoom, 0);
        ctx.lineTo(0, -1 * zoom);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Harmonic wave patterns in archway
    ctx.lineWidth = 1.5 * zoom;
    for (let wave = 0; wave < 3; wave++) {
      const wAlpha = 0.25 + Math.sin(time * 2 + wave) * 0.1 + attackPulse * 0.3;
      ctx.strokeStyle = `rgba(100, 200, 255, ${wAlpha})`;
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const waveX = screenPos.x - 25 * zoom + t * 50 * zoom;
        const waveY =
          portalCenterY -
          5 * zoom +
          Math.sin(t * Math.PI * 4 + time * 5 + wave) * 6 * zoom;
        if (i === 0) ctx.moveTo(waveX, waveY);
        else ctx.lineTo(waveX, waveY);
      }
      ctx.stroke();
    }

    // Resonance aura
    const auraGlow = 0.2 + Math.sin(time * 3) * 0.1 + attackPulse * 0.3;
    const auraGrad = ctx.createRadialGradient(
      screenPos.x,
      portalCenterY,
      0,
      screenPos.x,
      portalCenterY,
      50 * zoom,
    );
    auraGrad.addColorStop(0, `rgba(100, 200, 255, ${auraGlow * 0.5})`);
    auraGrad.addColorStop(0.5, `rgba(100, 200, 255, ${auraGlow * 0.2})`);
    auraGrad.addColorStop(1, "rgba(100, 200, 255, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      portalCenterY,
      50 * zoom,
      35 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Sound beam during attack
    if (timeSinceFire < 400) {
      const beamPhase = timeSinceFire / 400;
      const beamAlpha = (1 - beamPhase) * 0.6;

      // Central beam
      ctx.fillStyle = `rgba(150, 220, 255, ${beamAlpha})`;
      ctx.shadowColor = "#99ddff";
      ctx.shadowBlur = 20 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        portalCenterY,
        (5 + beamPhase * 15) * zoom,
        (10 + beamPhase * 30) * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Concentric sound rings
      for (let ring = 0; ring < 5; ring++) {
        const ringPhase = (beamPhase + ring * 0.08) % 1;
        const ringRadius = 10 + ringPhase * 40;
        const ringAlpha = (1 - ringPhase) * beamAlpha * 0.5;

        ctx.strokeStyle = `rgba(100, 200, 255, ${ringAlpha})`;
        ctx.lineWidth = 2 * zoom * (1 - ringPhase);
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          portalCenterY,
          ringRadius * zoom,
          ringRadius * 0.5 * zoom,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }

    // Blue energy swirls
    for (let s = 0; s < 8; s++) {
      const swirlAngle = time * 2 + (s / 8) * Math.PI * 2;
      const swirlRadius = 18 + Math.sin(time * 3 + s * 0.8) * 6;
      const swirlX = screenPos.x + Math.cos(swirlAngle) * swirlRadius * zoom;
      const swirlY =
        portalCenterY + Math.sin(swirlAngle) * swirlRadius * 0.4 * zoom;

      ctx.fillStyle = `rgba(100, 200, 255, ${
        0.4 + Math.sin(time * 5 + s) * 0.2
      })`;
      ctx.beginPath();
      ctx.arc(swirlX, swirlY, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === CRESCENDO STACK INDICATOR ===
  if (maxCrescendo > 0) {
    const cresRX = (subBuildingWidth + 14) * zoom * ISO_PRISM_W_FACTOR;
    const cresRY = (baseDepth + 32) * zoom * ISO_PRISM_D_FACTOR;
    const cresY = screenPos.y + 16 * zoom;
    const arcPerStack = Math.PI / maxCrescendo;
    const arcGap = 0.05;

    // Carved groove ring in foundation stone
    ctx.strokeStyle = "rgba(20, 15, 10, 0.45)";
    ctx.lineWidth = 5.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, cresY, cresRX, cresRY, 0, 0, Math.PI);
    ctx.stroke();

    // Stone lip borders framing the groove
    ctx.strokeStyle = "rgba(100, 88, 70, 0.5)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      cresY,
      cresRX + 2.5 * zoom,
      cresRY + 1.2 * zoom,
      0,
      0,
      Math.PI,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      cresY,
      cresRX - 2.5 * zoom,
      cresRY - 1.2 * zoom,
      0,
      0,
      Math.PI,
    );
    ctx.stroke();

    // Draw each crescendo segment with crystal nodes
    for (let s = 0; s < maxCrescendo; s++) {
      const isLit = s < crescendoStacks;
      const startAngle = s * arcPerStack + arcGap;
      const endAngle = (s + 1) * arcPerStack - arcGap;
      const midAngle = (startAngle + endAngle) / 2;
      const nodeX = screenPos.x + Math.cos(midAngle) * cresRX;
      const nodeY = cresY + Math.sin(midAngle) * cresRY;

      if (isLit) {
        const stackT = s / maxCrescendo;
        const stackIntensity = 0.4 + stackT * 0.6;
        const stackPulse = Math.sin(time * 3 + s * 0.8) * 0.15;
        const glow = stackIntensity + stackPulse;

        // Outer glow arc (wide, soft)
        ctx.strokeStyle = `rgba(${glowColor}, ${glow * 0.35})`;
        ctx.lineWidth = 7 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          cresY,
          cresRX,
          cresRY,
          0,
          startAngle,
          endAngle,
        );
        ctx.stroke();

        // Main arc segment
        ctx.strokeStyle = `rgba(${glowColor}, ${glow * 0.8})`;
        ctx.lineWidth = 3.5 * zoom;
        ctx.shadowColor = `rgb(${glowColor})`;
        ctx.shadowBlur = 8 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          cresY,
          cresRX,
          cresRY,
          0,
          startAngle,
          endAngle,
        );
        ctx.stroke();

        // Inner bright core line
        ctx.strokeStyle = `rgba(255, 255, 255, ${glow * 0.35})`;
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          cresY,
          cresRX,
          cresRY,
          0,
          startAngle,
          endAngle,
        );
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Crystal node at segment midpoint
        const crystalH = (3.5 + stackIntensity * 2.5) * zoom;
        const crystalW = crystalH * 0.6;

        // Node shadow on foundation
        ctx.fillStyle = `rgba(${glowColor}, ${glow * 0.15})`;
        ctx.beginPath();
        ctx.ellipse(
          nodeX,
          nodeY + 1.5 * zoom,
          crystalW * 1.4,
          crystalW * 0.5,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Crystal body (dark face)
        ctx.fillStyle = `rgba(${glowColor}, ${glow * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(nodeX, nodeY - crystalH);
        ctx.lineTo(nodeX - crystalW, nodeY);
        ctx.lineTo(nodeX, nodeY + crystalH * 0.35);
        ctx.lineTo(nodeX + crystalW, nodeY);
        ctx.closePath();
        ctx.fill();

        // Crystal highlight facet
        ctx.fillStyle = `rgba(255, 255, 255, ${glow * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(nodeX, nodeY - crystalH);
        ctx.lineTo(nodeX + crystalW, nodeY);
        ctx.lineTo(nodeX + crystalW * 0.15, nodeY - crystalH * 0.35);
        ctx.closePath();
        ctx.fill();

        // Crystal inner glow point
        ctx.fillStyle = `rgba(255, 255, 255, ${glow * 0.6})`;
        ctx.shadowColor = `rgb(${glowColor})`;
        ctx.shadowBlur = (5 + stackIntensity * 4) * zoom;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY - crystalH * 0.2, 1.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Rising energy beam from lit node toward tower body
        const beamH =
          (18 + stackIntensity * 14 + Math.sin(time * 4 + s) * 4) * zoom;
        const beamW = (1.2 + stackIntensity * 0.8) * zoom;
        const beamGrad = ctx.createLinearGradient(
          nodeX,
          nodeY,
          nodeX,
          nodeY - beamH,
        );
        beamGrad.addColorStop(0, `rgba(${glowColor}, ${glow * 0.4})`);
        beamGrad.addColorStop(0.4, `rgba(${glowColor}, ${glow * 0.15})`);
        beamGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(nodeX - beamW, nodeY);
        ctx.lineTo(nodeX - beamW * 0.2, nodeY - beamH);
        ctx.lineTo(nodeX + beamW * 0.2, nodeY - beamH);
        ctx.lineTo(nodeX + beamW, nodeY);
        ctx.closePath();
        ctx.fill();

        // Rising particles along beam
        for (let p = 0; p < 3; p++) {
          const pPhase = (time * 1.5 + s * 0.4 + p * 0.33) % 1;
          const pY = nodeY - pPhase * beamH;
          const pAlpha = (1 - pPhase) * glow * 0.6;
          const pSize = (1.3 + Math.sin(time * 6 + p) * 0.4) * zoom;
          ctx.fillStyle = `rgba(${glowColor}, ${pAlpha})`;
          ctx.beginPath();
          ctx.arc(
            nodeX + Math.sin(time * 3 + p + s) * 1.5 * zoom,
            pY,
            pSize,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      } else {
        // Unlit segment: dim carved groove
        ctx.strokeStyle = `rgba(${glowColor}, 0.07)`;
        ctx.lineWidth = 2.5 * zoom;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          cresY,
          cresRX,
          cresRY,
          0,
          startAngle,
          endAngle,
        );
        ctx.stroke();

        // Dim dormant node marker
        ctx.fillStyle = "rgba(80, 70, 60, 0.2)";
        ctx.beginPath();
        ctx.moveTo(nodeX, nodeY - 2 * zoom);
        ctx.lineTo(nodeX - 1.5 * zoom, nodeY);
        ctx.lineTo(nodeX, nodeY + 0.8 * zoom);
        ctx.lineTo(nodeX + 1.5 * zoom, nodeY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Energy chains between consecutive lit nodes
    if (crescendoStacks >= 2) {
      const chainAlpha =
        0.15 + crescendoRatio * 0.25 + Math.sin(time * 4) * 0.08;
      ctx.strokeStyle = `rgba(${glowColor}, ${chainAlpha})`;
      ctx.lineWidth = 1 * zoom;
      for (let s = 0; s < crescendoStacks - 1; s++) {
        const a1 = (s + 0.5) * arcPerStack;
        const a2 = (s + 1.5) * arcPerStack;
        const x1 = screenPos.x + Math.cos(a1) * cresRX;
        const y1 = cresY + Math.sin(a1) * cresRY;
        const x2 = screenPos.x + Math.cos(a2) * cresRX;
        const y2 = cresY + Math.sin(a2) * cresRY;
        const cpX = (x1 + x2) / 2 + Math.sin(time * 8 + s) * 2.5 * zoom;
        const cpY = (y1 + y2) / 2 - 3.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cpX, cpY, x2, y2);
        ctx.stroke();
      }
    }

    // Crescendo aura layers (ground pool + tower body glow)
    if (crescendoRatio > 0.3) {
      const auraT = (crescendoRatio - 0.3) / 0.7;

      // Ground-level glow pool around foundation
      const poolAlpha = auraT * 0.18 + Math.sin(time * 2) * 0.04;
      const poolGrad = ctx.createRadialGradient(
        screenPos.x,
        cresY,
        0,
        screenPos.x,
        cresY,
        cresRX * 1.25,
      );
      poolGrad.addColorStop(0, `rgba(${glowColor}, ${poolAlpha * 0.35})`);
      poolGrad.addColorStop(0.5, `rgba(${glowColor}, ${poolAlpha * 0.12})`);
      poolGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        cresY,
        cresRX * 1.25,
        cresRY * 1.25,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Tower body aura (vertical glow wrapping the structure)
      const bodyAlpha = auraT * 0.12;
      const bodyGrad = ctx.createLinearGradient(
        screenPos.x,
        screenPos.y + 20 * zoom,
        screenPos.x,
        screenPos.y - 55 * zoom,
      );
      bodyGrad.addColorStop(0, `rgba(${glowColor}, ${bodyAlpha})`);
      bodyGrad.addColorStop(0.35, `rgba(${glowColor}, ${bodyAlpha * 0.4})`);
      bodyGrad.addColorStop(1, `rgba(${glowColor}, 0)`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 18 * zoom,
        (subBuildingWidth + 8) * zoom * 0.45,
        55 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Max crescendo: pulsing crown + ascending wisps
    if (crescendoRatio >= 1) {
      const crownPulse = 0.25 + Math.sin(time * 5) * 0.12;

      // Crown ring at arch level
      ctx.strokeStyle = `rgba(${glowColor}, ${crownPulse})`;
      ctx.lineWidth = 1.8 * zoom;
      ctx.shadowColor = `rgb(${glowColor})`;
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 42 * zoom,
        22 * zoom,
        10 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner crown ring
      ctx.strokeStyle = `rgba(255, 255, 255, ${crownPulse * 0.3})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 42 * zoom,
        18 * zoom,
        8 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Ascending energy wisps spiraling upward
      for (let ew = 0; ew < 6; ew++) {
        const ewPhase = (time * 1.2 + ew * 0.33) % 2;
        const ewAngle = (ew / 6) * Math.PI * 2 + time * 0.8;
        const ewRadius = (12 + Math.sin(ewPhase * Math.PI) * 8) * zoom;
        const ewX = screenPos.x + Math.cos(ewAngle) * ewRadius;
        const ewY = screenPos.y + 15 * zoom - ewPhase * 50 * zoom;
        const ewAlpha = Math.max(0, 1 - ewPhase / 2) * 0.35;

        if (ewAlpha > 0.04) {
          ctx.fillStyle = `rgba(${glowColor}, ${ewAlpha})`;
          ctx.shadowColor = `rgb(${glowColor})`;
          ctx.shadowBlur = 4 * zoom;
          ctx.beginPath();
          ctx.arc(
            ewX,
            ewY,
            (1.8 + Math.sin(time * 4 + ew) * 0.6) * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  ctx.restore();
}

// CLUB TOWER - Epic Resource Generator with mechanical gold production
