import type { Tower, Position } from "../../types";
import {
  ISO_PRISM_D_FACTOR,
} from "../../constants";
import {
  drawIsometricPrism,
  drawGear,
  drawIsometricRailing,
} from "./towerHelpers";

export function renderClubTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
) {
  void colors;

  ctx.save();
  const baseWidth = 34 + tower.level * 5;
  const baseHeight = 25 + tower.level * 8;
  const w = baseWidth * zoom * 0.5;
  const d = baseWidth * zoom * ISO_PRISM_D_FACTOR;
  const h = baseHeight * zoom;

  // Check if pawpoints were recently generated (flash effect)
  const recentGeneration =
    tower.lastAttack && Date.now() - tower.lastAttack < 500;
  const flashIntensity = recentGeneration
    ? Math.max(0, 1 - (Date.now() - tower.lastAttack!) / 500)
    : 0;

  // ========== STEPPED STONE FOUNDATION ==========
  // Lowest step — wide stone plinth
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 12 * zoom,
    baseWidth + 18,
    baseWidth + 18,
    3,
    {
      top: "#3a4a3a",
      left: "#2a3a2a",
      right: "#1a2a1a",
      leftBack: "#4a5a4a",
      rightBack: "#3a4a3a",
    },
    zoom,
  );

  // Middle step
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 9 * zoom,
    baseWidth + 13,
    baseWidth + 13,
    3,
    {
      top: "#3a5a3a",
      left: "#2a4a2a",
      right: "#1a3a1a",
      leftBack: "#4a6a4a",
      rightBack: "#3a5a3a",
    },
    zoom,
  );

  // Upper step with gold bevel
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 6 * zoom,
    baseWidth + 8,
    baseWidth + 8,
    6,
    {
      top: "#2a5a3a",
      left: "#1a4a2a",
      right: "#0a3a1a",
      leftBack: "#3a6a4a",
      rightBack: "#2a5a3a",
    },
    zoom,
  );

  // Gold trim along the front visible edge of upper step
  const foundGlow = 0.5 + Math.sin(time * 2) * 0.2 + flashIntensity * 0.4;
  ctx.strokeStyle = `rgba(201, 162, 39, ${foundGlow})`;
  ctx.lineWidth = 2 * zoom;
  const fndW = (baseWidth + 8) * zoom * 0.5;
  const fndD = (baseWidth + 8) * zoom * ISO_PRISM_D_FACTOR;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - fndW, screenPos.y);
  ctx.lineTo(screenPos.x, screenPos.y + fndD);
  ctx.lineTo(screenPos.x + fndW, screenPos.y);
  ctx.stroke();

  // Carved rosette medallions at front corners
  for (const side of [-1, 1]) {
    const rosX = screenPos.x + side * fndW * 0.75;
    const rosY = screenPos.y + fndD * 0.3;
    ctx.fillStyle = "#1a4a2a";
    ctx.beginPath();
    ctx.arc(rosX, rosY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    const rosGlow =
      0.4 + Math.sin(time * 3 + side * 1.5) * 0.2 + flashIntensity * 0.3;
    ctx.fillStyle = `rgba(201, 162, 39, ${rosGlow})`;
    ctx.beginPath();
    ctx.arc(rosX, rosY, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main tower body - dark green tech with gold trim
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseWidth,
    baseHeight,
    {
      top: "#3a6a4a",
      left: "#2a5a3a",
      right: "#1a4a2a",
      leftBack: "#4a7a5a",
      rightBack: "#3a6a4a",
    },
    zoom,
  );

  // ========== BASE RAILING (3D isometric ring wrapping the base) ==========
  const balRingY = screenPos.y + 2 * zoom;
  const balRingRX = w * 1.05;
  const balRingRY = d * 1.05;
  const balRingH = 6 * zoom;
  drawIsometricRailing(
    ctx,
    screenPos.x,
    balRingY,
    balRingRX,
    balRingRY,
    balRingH,
    32,
    16,
    {
      rail: "#a08020",
      topRail: "#c9a227",
      backPanel: "rgba(42, 90, 58, 0.35)",
      frontPanel: "rgba(42, 90, 58, 0.25)",
    },
    zoom,
  );

  // ========== ENTRANCE PORTICO WITH GREEK REVIVAL COLUMNS ==========
  const porticoFrontY = screenPos.y + d * 0.45;
  const porticoH = h * 0.34;
  const colPositions = [-0.32, -0.11, 0.11, 0.32];
  for (const colOff of colPositions) {
    const colX = screenPos.x + w * colOff;
    const colBase = porticoFrontY + d * Math.abs(colOff) * 0.6;
    const colTopY = colBase - porticoH;

    // Column shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.beginPath();
    ctx.moveTo(colX - 2.5 * zoom + zoom, colBase + zoom);
    ctx.lineTo(colX - 2 * zoom + zoom, colTopY + zoom);
    ctx.lineTo(colX + 2 * zoom + zoom, colTopY + zoom);
    ctx.lineTo(colX + 2.5 * zoom + zoom, colBase + zoom);
    ctx.closePath();
    ctx.fill();

    // Main column shaft — gradient for 3D roundness
    const colGrad = ctx.createLinearGradient(
      colX - 2.5 * zoom,
      colBase,
      colX + 2.5 * zoom,
      colBase,
    );
    colGrad.addColorStop(0, "#b8a888");
    colGrad.addColorStop(0.25, "#d4c9a8");
    colGrad.addColorStop(0.5, "#e8dcc0");
    colGrad.addColorStop(0.75, "#d4c9a8");
    colGrad.addColorStop(1, "#a89878");
    ctx.fillStyle = colGrad;
    ctx.beginPath();
    ctx.moveTo(colX - 2.5 * zoom, colBase);
    ctx.lineTo(colX - 2 * zoom, colTopY);
    ctx.lineTo(colX + 2 * zoom, colTopY);
    ctx.lineTo(colX + 2.5 * zoom, colBase);
    ctx.closePath();
    ctx.fill();

    // Fluting lines (vertical grooves)
    ctx.strokeStyle = "rgba(160, 140, 100, 0.3)";
    ctx.lineWidth = 0.4 * zoom;
    for (let fl = -1; fl <= 1; fl++) {
      ctx.beginPath();
      ctx.moveTo(colX + fl * 1.2 * zoom, colBase);
      ctx.lineTo(colX + fl * 1 * zoom, colTopY);
      ctx.stroke();
    }

    // Capital (Ionic-style top block)
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(colX - 3.5 * zoom, colTopY - 2 * zoom, 7 * zoom, 3 * zoom);
    ctx.strokeStyle = "#ffe88a";
    ctx.lineWidth = 0.4 * zoom;
    ctx.strokeRect(colX - 3.5 * zoom, colTopY - 2 * zoom, 7 * zoom, 3 * zoom);
    // Volute scrolls on capital
    for (const vs of [-1, 1]) {
      ctx.strokeStyle = "#dab540";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.arc(
        colX + vs * 3.5 * zoom,
        colTopY - 0.5 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 1.5,
      );
      ctx.stroke();
    }

    // Plinth (base block)
    ctx.fillStyle = "#c0b090";
    ctx.fillRect(colX - 3 * zoom, colBase - 1 * zoom, 6 * zoom, 2 * zoom);
    ctx.strokeStyle = "rgba(160, 140, 100, 0.4)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(colX - 3 * zoom, colBase - 1 * zoom, 6 * zoom, 2 * zoom);
  }

  // Entablature (beam across columns)
  const entabY = porticoFrontY - porticoH + d * 0.08;
  const entabGrad = ctx.createLinearGradient(
    screenPos.x - w * 0.38,
    entabY,
    screenPos.x - w * 0.38,
    entabY + 4 * zoom,
  );
  entabGrad.addColorStop(0, "#4a7a5a");
  entabGrad.addColorStop(1, "#2a5a3a");
  ctx.fillStyle = entabGrad;
  ctx.fillRect(screenPos.x - w * 0.38, entabY, w * 0.76, 4 * zoom);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(screenPos.x - w * 0.38, entabY, w * 0.76, 4 * zoom);

  // Frieze detail — small triglyphs
  const triCount = 5;
  for (let tri = 0; tri < triCount; tri++) {
    const triX = screenPos.x - w * 0.35 + (tri / (triCount - 1)) * w * 0.7;
    ctx.fillStyle = "#2a5a3a";
    ctx.fillRect(triX - 1.5 * zoom, entabY + 0.5 * zoom, 3 * zoom, 3 * zoom);
    ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(triX - 0.5 * zoom, entabY + 0.5 * zoom);
    ctx.lineTo(triX - 0.5 * zoom, entabY + 3.5 * zoom);
    ctx.moveTo(triX + 0.5 * zoom, entabY + 0.5 * zoom);
    ctx.lineTo(triX + 0.5 * zoom, entabY + 3.5 * zoom);
    ctx.stroke();
  }

  // Pediment (triangular gable)
  const pedGrad = ctx.createLinearGradient(
    screenPos.x,
    entabY - 9 * zoom,
    screenPos.x,
    entabY,
  );
  pedGrad.addColorStop(0, "#3a6a4a");
  pedGrad.addColorStop(1, "#2a5a3a");
  ctx.fillStyle = pedGrad;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - w * 0.4, entabY);
  ctx.lineTo(screenPos.x, entabY - 9 * zoom);
  ctx.lineTo(screenPos.x + w * 0.4, entabY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Pediment tympanum decoration (small relief)
  ctx.fillStyle = `rgba(201, 162, 39, ${0.3 + Math.sin(time * 1.5) * 0.1})`;
  ctx.beginPath();
  ctx.moveTo(screenPos.x, entabY - 6 * zoom);
  ctx.lineTo(screenPos.x + 3 * zoom, entabY - 2 * zoom);
  ctx.lineTo(screenPos.x - 3 * zoom, entabY - 2 * zoom);
  ctx.closePath();
  ctx.fill();

  // ========== ORNATE CLUB CREST ON FRONT FACE ==========
  const crestX = screenPos.x;
  const crestY = screenPos.y - h * 0.58;
  const crestR = 7 * zoom;

  // Crest backing shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.moveTo(crestX + 0.5 * zoom, crestY - crestR + 0.5 * zoom);
  ctx.lineTo(
    crestX + crestR * 0.85 + 0.5 * zoom,
    crestY - crestR * 0.35 + 0.5 * zoom,
  );
  ctx.lineTo(
    crestX + crestR * 0.85 + 0.5 * zoom,
    crestY + crestR * 0.35 + 0.5 * zoom,
  );
  ctx.lineTo(crestX + 0.5 * zoom, crestY + crestR * 1.05 + 0.5 * zoom);
  ctx.lineTo(
    crestX - crestR * 0.85 + 0.5 * zoom,
    crestY + crestR * 0.35 + 0.5 * zoom,
  );
  ctx.lineTo(
    crestX - crestR * 0.85 + 0.5 * zoom,
    crestY - crestR * 0.35 + 0.5 * zoom,
  );
  ctx.closePath();
  ctx.fill();

  // Shield body — dark green with gradient
  const crestGrad = ctx.createLinearGradient(
    crestX - crestR,
    crestY - crestR,
    crestX + crestR,
    crestY + crestR,
  );
  crestGrad.addColorStop(0, "#1a4a2a");
  crestGrad.addColorStop(0.5, "#0a3a1a");
  crestGrad.addColorStop(1, "#082a12");
  ctx.fillStyle = crestGrad;
  ctx.beginPath();
  ctx.moveTo(crestX, crestY - crestR);
  ctx.lineTo(crestX + crestR * 0.85, crestY - crestR * 0.35);
  ctx.lineTo(crestX + crestR * 0.85, crestY + crestR * 0.35);
  ctx.lineTo(crestX, crestY + crestR * 1.05);
  ctx.lineTo(crestX - crestR * 0.85, crestY + crestR * 0.35);
  ctx.lineTo(crestX - crestR * 0.85, crestY - crestR * 0.35);
  ctx.closePath();
  ctx.fill();

  // Gold border — double line
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.8 * zoom;
  ctx.stroke();
  ctx.strokeStyle = "#dab540";
  ctx.lineWidth = 0.6 * zoom;
  // Inner border
  ctx.beginPath();
  ctx.moveTo(crestX, crestY - crestR * 0.8);
  ctx.lineTo(crestX + crestR * 0.65, crestY - crestR * 0.25);
  ctx.lineTo(crestX + crestR * 0.65, crestY + crestR * 0.25);
  ctx.lineTo(crestX, crestY + crestR * 0.85);
  ctx.lineTo(crestX - crestR * 0.65, crestY + crestR * 0.25);
  ctx.lineTo(crestX - crestR * 0.65, crestY - crestR * 0.25);
  ctx.closePath();
  ctx.stroke();

  // Horizontal divider line
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(crestX - crestR * 0.7, crestY);
  ctx.lineTo(crestX + crestR * 0.7, crestY);
  ctx.stroke();

  // "P" monogram with embossed effect
  const crestGlow = 0.7 + Math.sin(time * 2) * 0.2 + flashIntensity * 0.3;
  ctx.fillStyle = `rgba(100, 80, 20, 0.3)`;
  ctx.font = `bold ${8 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", crestX + 0.3 * zoom, crestY - crestR * 0.15 + 0.3 * zoom);
  ctx.fillStyle = `rgba(201, 162, 39, ${crestGlow})`;
  ctx.fillText("P", crestX, crestY - crestR * 0.15);

  // Small crown above the shield
  ctx.fillStyle = `rgba(201, 162, 39, ${crestGlow * 0.9})`;
  ctx.beginPath();
  ctx.moveTo(crestX - 3 * zoom, crestY - crestR - 1 * zoom);
  ctx.lineTo(crestX - 4 * zoom, crestY - crestR - 4 * zoom);
  ctx.lineTo(crestX - 2 * zoom, crestY - crestR - 2.5 * zoom);
  ctx.lineTo(crestX, crestY - crestR - 5 * zoom);
  ctx.lineTo(crestX + 2 * zoom, crestY - crestR - 2.5 * zoom);
  ctx.lineTo(crestX + 4 * zoom, crestY - crestR - 4 * zoom);
  ctx.lineTo(crestX + 3 * zoom, crestY - crestR - 1 * zoom);
  ctx.closePath();
  ctx.fill();

  // ========== DORMER WINDOWS WITH TREASURY GLOW ==========
  for (let wi = 0; wi < 3; wi++) {
    const winOff = (wi - 1) * w * 0.5;
    const winX = screenPos.x + winOff;
    const winY = screenPos.y - h * 0.42 - Math.abs(wi - 1) * 2 * zoom;
    const winW = 5 * zoom;
    const winH = 7 * zoom;
    ctx.fillStyle = "#0a1a0a";
    ctx.fillRect(winX - winW * 0.5, winY - winH, winW, winH);
    const treasGlow =
      0.25 + Math.sin(time * 2.5 + wi) * 0.15 + flashIntensity * 0.5;
    const winGrad = ctx.createRadialGradient(
      winX,
      winY - winH * 0.5,
      0,
      winX,
      winY - winH * 0.5,
      winW,
    );
    winGrad.addColorStop(0, `rgba(255, 200, 50, ${treasGlow})`);
    winGrad.addColorStop(1, `rgba(100, 80, 20, ${treasGlow * 0.2})`);
    ctx.fillStyle = winGrad;
    ctx.fillRect(winX - winW * 0.5, winY - winH, winW, winH);
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * zoom;
    ctx.strokeRect(winX - winW * 0.5, winY - winH, winW, winH);
    ctx.beginPath();
    ctx.moveTo(winX, winY - winH);
    ctx.lineTo(winX, winY);
    ctx.moveTo(winX - winW * 0.5, winY - winH * 0.5);
    ctx.lineTo(winX + winW * 0.5, winY - winH * 0.5);
    ctx.stroke();
    ctx.fillStyle = "#1a3a2a";
    ctx.beginPath();
    ctx.moveTo(winX - winW * 0.7, winY - winH);
    ctx.lineTo(winX, winY - winH - 3.5 * zoom);
    ctx.lineTo(winX + winW * 0.7, winY - winH);
    ctx.closePath();
    ctx.fill();
  }

  // ========== WINDOW BOXES WITH VEGETATION ==========
  for (let wi = 0; wi < 2; wi++) {
    const boxX = screenPos.x + (wi === 0 ? -1 : 1) * w * 0.5;
    const boxY = screenPos.y - h * 0.35;
    ctx.fillStyle = "#5a3a2a";
    ctx.fillRect(boxX - 4.5 * zoom, boxY, 9 * zoom, 2.5 * zoom);
    for (let p = 0; p < 4; p++) {
      const plantX = boxX - 3 * zoom + p * 2 * zoom;
      const sway = Math.sin(time * 1.5 + p * 0.9 + wi) * 1.2 * zoom;
      ctx.fillStyle = `rgba(${40 + p * 15}, ${120 + p * 20}, ${50 + p * 10}, 0.85)`;
      ctx.beginPath();
      ctx.arc(plantX + sway, boxY - 1.5 * zoom, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    if (tower.level >= 2) {
      ctx.fillStyle = "#ffaa44";
      ctx.beginPath();
      ctx.arc(
        boxX + Math.sin(time + wi) * zoom,
        boxY - 3 * zoom,
        0.9 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // ========== ISOMETRIC BUTTRESSES & ARCHITECTURAL SUPPORTS ==========
  const buttW = baseWidth * 1.25;
  const buttHalf = buttW * zoom * 0.5;
  const buttD = buttW * zoom * ISO_PRISM_D_FACTOR;
  const buttTopY = screenPos.y - h * 0.85;

  const buttL = { x: screenPos.x - buttHalf, y: screenPos.y };
  const buttF = { x: screenPos.x, y: screenPos.y + buttD };
  const buttR = { x: screenPos.x + buttHalf, y: screenPos.y };
  const buttB = { x: screenPos.x, y: screenPos.y - buttD };
  const buttLT = { x: buttL.x, y: buttTopY };
  const buttFT = { x: buttF.x, y: buttTopY + buttD };
  const buttRT = { x: buttR.x, y: buttTopY };
  const buttBT = { x: buttB.x, y: buttTopY - buttD };

  const drawClubBeam = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thick: number,
    dark: string,
    main: string,
    light: string,
  ) => {
    ctx.strokeStyle = dark;
    ctx.lineWidth = (thick + 1.2) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1 + 0.5 * zoom);
    ctx.lineTo(x2, y2 + 0.5 * zoom);
    ctx.stroke();
    ctx.strokeStyle = main;
    ctx.lineWidth = thick * zoom;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = light;
    ctx.lineWidth = thick * 0.35 * zoom;
    ctx.beginPath();
    ctx.moveTo(x1, y1 - 0.3 * zoom);
    ctx.lineTo(x2, y2 - 0.3 * zoom);
    ctx.stroke();
  };

  const drawClubBolt = (bx: number, by: number, glow: boolean) => {
    ctx.fillStyle = glow ? "#c9a227" : "#8a7a5a";
    ctx.beginPath();
    ctx.arc(bx, by, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    if (glow) {
      ctx.fillStyle = "#ffe88a";
      ctx.beginPath();
      ctx.arc(bx - 0.3 * zoom, by - 0.3 * zoom, 0.7 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Back vertical posts
  drawClubBeam(
    buttB.x,
    buttB.y,
    buttBT.x,
    buttBT.y,
    2.2,
    "#1a3a1a",
    "#2a5a3a",
    "#3a7a4a",
  );
  drawClubBeam(
    buttL.x,
    buttL.y,
    buttLT.x,
    buttLT.y,
    2.2,
    "#1a3a1a",
    "#2a5a3a",
    "#3a7a4a",
  );

  // Back horizontal frames
  const frameLevels = Math.min(tower.level + 2, 4);
  for (let fl = 0; fl < frameLevels; fl++) {
    const t = (fl + 1) / (frameLevels + 1);
    const fBx = buttB.x + (buttBT.x - buttB.x) * t;
    const fBy = buttB.y + (buttBT.y - buttB.y) * t;
    const fLx = buttL.x + (buttLT.x - buttL.x) * t;
    const fLy = buttL.y + (buttLT.y - buttL.y) * t;
    const fRx = buttR.x + (buttRT.x - buttR.x) * t;
    const fRy = buttR.y + (buttRT.y - buttR.y) * t;
    // Back-left and back-right
    drawClubBeam(fBx, fBy, fLx, fLy, 1.5, "#1a3a1a", "#2a5a3a", "#3a7a4a");
    drawClubBeam(fBx, fBy, fRx, fRy, 1.5, "#1a3a1a", "#2a5a3a", "#3a7a4a");
    drawClubBolt(fBx, fBy, false);
  }

  // Back X-bracing
  for (let fl = 0; fl < frameLevels - 1; fl++) {
    const t0 = (fl + 1) / (frameLevels + 1);
    const t1 = (fl + 2) / (frameLevels + 1);
    const b0x = buttB.x + (buttBT.x - buttB.x) * t0;
    const b0y = buttB.y + (buttBT.y - buttB.y) * t0;
    const l0x = buttL.x + (buttLT.x - buttL.x) * t0;
    const l0y = buttL.y + (buttLT.y - buttL.y) * t0;
    const b1x = buttB.x + (buttBT.x - buttB.x) * t1;
    const b1y = buttB.y + (buttBT.y - buttB.y) * t1;
    const l1x = buttL.x + (buttLT.x - buttL.x) * t1;
    const l1y = buttL.y + (buttLT.y - buttL.y) * t1;
    ctx.strokeStyle = "rgba(42, 90, 58, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(b0x, b0y);
    ctx.lineTo(l1x, l1y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(l0x, l0y);
    ctx.lineTo(b1x, b1y);
    ctx.stroke();
  }

  // Front vertical posts
  drawClubBeam(
    buttR.x,
    buttR.y,
    buttRT.x,
    buttRT.y,
    2.5,
    "#1a4a2a",
    "#3a6a4a",
    "#5a8a6a",
  );
  drawClubBeam(
    buttF.x,
    buttF.y,
    buttFT.x,
    buttFT.y,
    2.5,
    "#1a4a2a",
    "#3a6a4a",
    "#5a8a6a",
  );

  // Front horizontal frames + gold trim
  for (let fl = 0; fl < frameLevels; fl++) {
    const t = (fl + 1) / (frameLevels + 1);
    const fFx = buttF.x + (buttFT.x - buttF.x) * t;
    const fFy = buttF.y + (buttFT.y - buttF.y) * t;
    const fRx = buttR.x + (buttRT.x - buttR.x) * t;
    const fRy = buttR.y + (buttRT.y - buttR.y) * t;
    const fLx = buttL.x + (buttLT.x - buttL.x) * t;
    const fLy = buttL.y + (buttLT.y - buttL.y) * t;
    // Front-right and front-left
    drawClubBeam(fFx, fFy, fRx, fRy, 1.8, "#1a4a2a", "#3a6a4a", "#5a8a6a");
    drawClubBeam(fFx, fFy, fLx, fLy, 1.8, "#1a4a2a", "#3a6a4a", "#5a8a6a");
    // Gold accent on front bolts
    drawClubBolt(fFx, fFy, true);
    drawClubBolt(fRx, fRy, true);
    drawClubBolt(fLx, fLy, true);
  }

  // Front X-bracing (right face only - visible)
  for (let fl = 0; fl < frameLevels - 1; fl++) {
    const t0 = (fl + 1) / (frameLevels + 1);
    const t1 = (fl + 2) / (frameLevels + 1);
    const f0x = buttF.x + (buttFT.x - buttF.x) * t0;
    const f0y = buttF.y + (buttFT.y - buttF.y) * t0;
    const r0x = buttR.x + (buttRT.x - buttR.x) * t0;
    const r0y = buttR.y + (buttRT.y - buttR.y) * t0;
    const f1x = buttF.x + (buttFT.x - buttF.x) * t1;
    const f1y = buttF.y + (buttFT.y - buttF.y) * t1;
    const r1x = buttR.x + (buttRT.x - buttR.x) * t1;
    const r1y = buttR.y + (buttRT.y - buttR.y) * t1;
    ctx.strokeStyle = "rgba(58, 106, 74, 0.5)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(f0x, f0y);
    ctx.lineTo(r1x, r1y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r0x, r0y);
    ctx.lineTo(f1x, f1y);
    ctx.stroke();
  }

  // ========== FACE DETAILS (stone blocks, weathering, gold inlays) ==========
  // Left face (visible) — stone block seams
  ctx.strokeStyle = "rgba(20, 60, 30, 0.35)";
  ctx.lineWidth = 0.6 * zoom;
  const leftFaceSeams = 5;
  for (let s = 1; s < leftFaceSeams; s++) {
    const seamT = s / leftFaceSeams;
    const seamBotX = screenPos.x - w * seamT;
    const seamBotY = screenPos.y + d * (1 - seamT) * 0.5;
    const seamTopX = seamBotX;
    const seamTopY = screenPos.y - h + d * (1 - seamT) * 0.5;
    ctx.beginPath();
    ctx.moveTo(seamBotX, seamBotY);
    ctx.lineTo(seamTopX, seamTopY);
    ctx.stroke();
  }

  // Right face (visible) — stone block seams
  for (let s = 1; s < leftFaceSeams; s++) {
    const seamT = s / leftFaceSeams;
    const seamBotX = screenPos.x + w * seamT;
    const seamBotY = screenPos.y + d * (1 - seamT) * 0.5;
    const seamTopX = seamBotX;
    const seamTopY = screenPos.y - h + d * (1 - seamT) * 0.5;
    ctx.beginPath();
    ctx.moveTo(seamBotX, seamBotY);
    ctx.lineTo(seamTopX, seamTopY);
    ctx.stroke();
  }

  // Horizontal mortar lines
  const mortarRows = 6;
  for (let r = 1; r < mortarRows; r++) {
    const mortarT = r / mortarRows;
    const mortarY = screenPos.y - h * mortarT;
    // Left face mortar
    ctx.strokeStyle = "rgba(20, 60, 30, 0.25)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.95, mortarY + d * 0.45);
    ctx.lineTo(screenPos.x, mortarY + d * 0.95);
    ctx.stroke();
    // Right face mortar
    ctx.beginPath();
    ctx.moveTo(screenPos.x, mortarY + d * 0.95);
    ctx.lineTo(screenPos.x + w * 0.95, mortarY + d * 0.45);
    ctx.stroke();
  }

  // Weathering gradient on left face (darker at bottom)
  const leftWeather = ctx.createLinearGradient(
    screenPos.x - w * 0.5,
    screenPos.y,
    screenPos.x - w * 0.5,
    screenPos.y - h,
  );
  leftWeather.addColorStop(0, "rgba(0, 0, 0, 0.12)");
  leftWeather.addColorStop(0.4, "rgba(0, 0, 0, 0.02)");
  leftWeather.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = leftWeather;
  ctx.beginPath();
  ctx.moveTo(screenPos.x, screenPos.y);
  ctx.lineTo(screenPos.x - w, screenPos.y);
  ctx.lineTo(screenPos.x - w, screenPos.y - h);
  ctx.lineTo(screenPos.x, screenPos.y - h);
  ctx.closePath();
  ctx.fill();

  // Gold inlay diamond motifs on front face
  const inlayCount = tower.level + 1;
  for (let i = 0; i < inlayCount; i++) {
    const inlayY = screenPos.y - h * (0.3 + i * 0.2);
    const inlayX = screenPos.x;
    const inlaySize = 3 * zoom;
    const inlayGlow =
      0.5 + Math.sin(time * 2 + i * 1.2) * 0.2 + flashIntensity * 0.3;
    ctx.fillStyle = `rgba(201, 162, 39, ${inlayGlow})`;
    ctx.beginPath();
    ctx.moveTo(inlayX, inlayY - inlaySize);
    ctx.lineTo(inlayX + inlaySize * 0.7, inlayY);
    ctx.lineTo(inlayX, inlayY + inlaySize);
    ctx.lineTo(inlayX - inlaySize * 0.7, inlayY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // Wall-mounted lanterns
  for (const side of [-1, 1]) {
    const lanternX = screenPos.x + side * w * 0.55;
    const lanternY = screenPos.y - h * 0.3;
    // Bracket
    ctx.strokeStyle = "#4a3a2a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(lanternX - side * 2 * zoom, lanternY + 2 * zoom);
    ctx.lineTo(lanternX, lanternY);
    ctx.lineTo(lanternX, lanternY - 4 * zoom);
    ctx.stroke();
    // Lantern body
    ctx.fillStyle = "#2a2a22";
    ctx.fillRect(lanternX - 2 * zoom, lanternY - 4 * zoom, 4 * zoom, 5 * zoom);
    // Lantern glow
    const lanternGlow =
      0.4 + Math.sin(time * 3 + side * 2) * 0.2 + flashIntensity * 0.3;
    ctx.fillStyle = `rgba(255, 200, 80, ${lanternGlow})`;
    ctx.shadowColor = "rgba(255, 180, 50, 0.4)";
    ctx.shadowBlur = 5 * zoom;
    ctx.fillRect(
      lanternX - 1.5 * zoom,
      lanternY - 3.5 * zoom,
      3 * zoom,
      4 * zoom,
    );
    ctx.shadowBlur = 0;
    // Lantern cap
    ctx.fillStyle = "#6a5a3a";
    ctx.beginPath();
    ctx.moveTo(lanternX - 2.5 * zoom, lanternY - 4 * zoom);
    ctx.lineTo(lanternX, lanternY - 6 * zoom);
    ctx.lineTo(lanternX + 2.5 * zoom, lanternY - 4 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Gold corner pilasters (tapered strips following isometric edges)
  ctx.fillStyle = "#c9a227";
  for (const side of [-1, 1]) {
    const pilX = screenPos.x + side * w * 0.97;
    const pilBotY = screenPos.y;
    const pilTopY = screenPos.y - baseHeight * zoom * 0.92;
    // Pilaster shadow
    ctx.fillStyle = "rgba(100, 80, 20, 0.4)";
    ctx.beginPath();
    ctx.moveTo(pilX + side * 1 * zoom, pilBotY + 1 * zoom);
    ctx.lineTo(pilX + side * 1.5 * zoom, pilBotY - 2 * zoom);
    ctx.lineTo(pilX + side * 1.5 * zoom, pilTopY - 1 * zoom);
    ctx.lineTo(pilX + side * 0.5 * zoom, pilTopY + 1 * zoom);
    ctx.closePath();
    ctx.fill();
    // Main pilaster
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(pilX, pilBotY);
    ctx.lineTo(pilX + side * 1.2 * zoom, pilBotY - 1.5 * zoom);
    ctx.lineTo(pilX + side * 1.2 * zoom, pilTopY);
    ctx.lineTo(pilX, pilTopY + 1.5 * zoom);
    ctx.closePath();
    ctx.fill();
    // Pilaster highlight
    ctx.strokeStyle = "#ffe88a";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(pilX + side * 0.3 * zoom, pilBotY);
    ctx.lineTo(pilX + side * 0.3 * zoom, pilTopY + 1.5 * zoom);
    ctx.stroke();
    // Capital (top ornament)
    ctx.fillStyle = "#dab540";
    ctx.beginPath();
    ctx.ellipse(
      pilX + side * 0.6 * zoom,
      pilTopY,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Base (bottom ornament)
    ctx.beginPath();
    ctx.ellipse(
      pilX + side * 0.6 * zoom,
      pilBotY - 0.5 * zoom,
      2 * zoom,
      1 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Horizontal gold cornice bands (multiple levels)
  for (let band = 0; band < tower.level; band++) {
    const bandY = screenPos.y - baseHeight * zoom * (0.25 + band * 0.25);
    // Band shadow
    ctx.strokeStyle = "rgba(100, 80, 20, 0.3)";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.92, bandY + d * 0.35 + 1 * zoom);
    ctx.lineTo(screenPos.x, bandY + d * 0.5 + 1 * zoom);
    ctx.lineTo(screenPos.x + w * 0.92, bandY + d * 0.35 + 1 * zoom);
    ctx.stroke();
    // Main band
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.92, bandY + d * 0.35);
    ctx.lineTo(screenPos.x, bandY + d * 0.5);
    ctx.lineTo(screenPos.x + w * 0.92, bandY + d * 0.35);
    ctx.stroke();
    // Band highlight
    ctx.strokeStyle = "rgba(255, 232, 138, 0.35)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.9, bandY + d * 0.35 - 1 * zoom);
    ctx.lineTo(screenPos.x, bandY + d * 0.5 - 1 * zoom);
    ctx.lineTo(screenPos.x + w * 0.9, bandY + d * 0.35 - 1 * zoom);
    ctx.stroke();
    // Dentil molding (small square blocks along the band)
    const dentilCount = 8 + tower.level * 2;
    for (let dt = 0; dt < dentilCount; dt++) {
      const dtT = (dt + 0.5) / dentilCount;
      let dtX: number, dtY: number;
      if (dtT < 0.5) {
        const t2 = dtT * 2;
        dtX =
          screenPos.x - w * 0.9 + (screenPos.x - (screenPos.x - w * 0.9)) * t2;
        dtY = bandY + d * 0.35 + (d * 0.5 - d * 0.35) * t2;
      } else {
        const t2 = (dtT - 0.5) * 2;
        dtX = screenPos.x + w * 0.9 * t2;
        dtY = bandY + d * 0.5 + (d * 0.35 - d * 0.5) * t2;
      }
      ctx.fillStyle = "#b89020";
      ctx.fillRect(dtX - 0.8 * zoom, dtY - 2.5 * zoom, 1.6 * zoom, 1.5 * zoom);
    }
  }

  const topY = screenPos.y - baseHeight * zoom;

  // ========== ROTATING GOLD GEARS ==========
  const gearRotation = time * 1.2;

  // Large main gear (gold production mechanism)
  drawGear(
    ctx,
    screenPos.x - w * 0.5,
    screenPos.y - h * 0.5,
    14 + tower.level * 2,
    9 + tower.level,
    10 + tower.level * 2,
    gearRotation,
    {
      outer: "#8b7355",
      inner: "#6b5335",
      teeth: "#a08060",
      highlight: "#c9a227",
    },
    zoom,
  );

  // Smaller meshing gear
  drawGear(
    ctx,
    screenPos.x - w * 0.2,
    screenPos.y - h * 0.65,
    10 + tower.level,
    6,
    8 + tower.level,
    -gearRotation * 1.4,
    {
      outer: "#7a6245",
      inner: "#5a4225",
      teeth: "#9a8260",
      highlight: "#c9a227",
    },
    zoom,
  );

  // Right side gear (all levels now)
  drawGear(
    ctx,
    screenPos.x + w * 0.45,
    screenPos.y - h * 0.45,
    12 + tower.level,
    8,
    9 + tower.level,
    gearRotation * 0.9,
    {
      outer: "#7a6245",
      inner: "#5a4225",
      teeth: "#9a8260",
      highlight: "#c9a227",
    },
    zoom,
  );

  // Level 2+ additional gear train
  if (tower.level >= 2) {
    drawGear(
      ctx,
      screenPos.x + w * 0.65,
      screenPos.y - h * 0.25,
      8,
      5,
      6,
      -gearRotation * 1.6,
      {
        outer: "#6a5235",
        inner: "#4a3215",
        teeth: "#8a7250",
        highlight: "#b8960b",
      },
      zoom,
    );
  }

  // ========== LEDGER BOARD (framed notice panel, left side) ==========
  const ledgerX = screenPos.x - w * 0.85;
  const ledgerY = screenPos.y - h * 0.45;
  const ledgerW = 14 * zoom;
  const ledgerH = 18 * zoom;

  // Frame background (dark wood)
  ctx.fillStyle = "#1a1208";
  ctx.fillRect(ledgerX, ledgerY, ledgerW, ledgerH);
  // Ornate gold frame
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(ledgerX, ledgerY, ledgerW, ledgerH);
  // Inner frame line
  ctx.strokeStyle = "#8a7020";
  ctx.lineWidth = 0.5 * zoom;
  ctx.strokeRect(
    ledgerX + 1.5 * zoom,
    ledgerY + 1.5 * zoom,
    ledgerW - 3 * zoom,
    ledgerH - 3 * zoom,
  );

  // Ledger content with flash effect
  const screenFlash = flashIntensity > 0 ? flashIntensity : 0;
  const screenBaseGlow = 0.5 + Math.sin(time * 3) * 0.2;

  // Gold text heading
  ctx.fillStyle = `rgba(201, 162, 39, ${screenBaseGlow + screenFlash * 0.5})`;
  if (flashIntensity > 0) {
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 8 * zoom * flashIntensity;
  }
  ctx.font = `bold ${5 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("PAW", ledgerX + ledgerW * 0.5, ledgerY + 5 * zoom);
  ctx.fillText("PTS", ledgerX + ledgerW * 0.5, ledgerY + 9 * zoom);
  ctx.shadowBlur = 0;

  // Gold value bars
  for (let i = 0; i < 4; i++) {
    const barY = ledgerY + 11 * zoom + i * 3 * zoom;
    const barWidth =
      (4 + Math.sin(time * 4 + i * 1.5) * 3 + flashIntensity * 3) * zoom;
    const barGlow =
      0.4 +
      Math.sin(time * 2 + i * 0.8) * 0.15 +
      (flashIntensity > 0 && i === Math.floor(time * 8) % 4 ? 0.3 : 0);
    ctx.fillStyle = `rgba(201, 162, 39, ${barGlow})`;
    ctx.fillRect(ledgerX + 2 * zoom, barY, barWidth, 1.5 * zoom);
  }

  // Right side notice board (level 2+)
  if (tower.level >= 2) {
    const rBoardX = screenPos.x + w * 0.55;
    const rBoardY = screenPos.y - h * 0.5;
    const rBoardW = 12 * zoom;
    const rBoardH = 16 * zoom;
    ctx.fillStyle = "#1a1208";
    ctx.fillRect(rBoardX, rBoardY, rBoardW, rBoardH);
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.strokeRect(rBoardX, rBoardY, rBoardW, rBoardH);

    // Earnings graph (gold line)
    ctx.strokeStyle = `rgba(201, 162, 39, ${screenBaseGlow + screenFlash * 0.3})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(rBoardX + 1.5 * zoom, rBoardY + rBoardH * 0.6);
    for (let i = 0; i < 7; i++) {
      const graphX = rBoardX + 1.5 * zoom + i * 1.4 * zoom;
      const graphY =
        rBoardY + rBoardH * 0.5 - Math.sin(time * 3 + i * 0.9) * 3 * zoom;
      ctx.lineTo(graphX, graphY);
    }
    ctx.stroke();

    // Flash indicator
    if (flashIntensity > 0) {
      ctx.fillStyle = `rgba(255, 215, 0, ${flashIntensity})`;
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(
        rBoardX + rBoardW * 0.5,
        rBoardY + 3 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Level 3 — framed portrait gallery
  if (tower.level >= 3) {
    const portraitCX = screenPos.x;
    const portraitCY = screenPos.y - h * 0.78;
    const pFrameW = 8 * zoom;
    const pFrameH = 10 * zoom;

    // Portrait frame
    ctx.fillStyle = "#0a0a06";
    ctx.fillRect(
      portraitCX - pFrameW * 0.5,
      portraitCY - pFrameH * 0.5,
      pFrameW,
      pFrameH,
    );
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.strokeRect(
      portraitCX - pFrameW * 0.5,
      portraitCY - pFrameH * 0.5,
      pFrameW,
      pFrameH,
    );

    // Silhouette figure inside
    const figGlow = 0.35 + Math.sin(time * 1.5) * 0.1 + flashIntensity * 0.2;
    ctx.fillStyle = `rgba(160, 130, 50, ${figGlow})`;
    ctx.beginPath();
    ctx.arc(portraitCX, portraitCY - 2 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(portraitCX - 3 * zoom, portraitCY + pFrameH * 0.35);
    ctx.lineTo(portraitCX - 2 * zoom, portraitCY);
    ctx.lineTo(portraitCX + 2 * zoom, portraitCY);
    ctx.lineTo(portraitCX + 3 * zoom, portraitCY + pFrameH * 0.35);
    ctx.closePath();
    ctx.fill();

    // Gold nameplate
    ctx.fillStyle = `rgba(201, 162, 39, ${figGlow + 0.1})`;
    ctx.fillRect(
      portraitCX - 4 * zoom,
      portraitCY + pFrameH * 0.35 + zoom,
      8 * zoom,
      2 * zoom,
    );
  }

  // ========== TREASURE CHEST (level 2+) ==========
  if (tower.level >= 2) {
    const chestX = screenPos.x - w * 0.65;
    const chestY = screenPos.y + 4 * zoom;
    const chestW = 10;
    const chestD = 8;
    const chestH = 6;

    // Chest body
    drawIsometricPrism(
      ctx,
      chestX,
      chestY,
      chestW,
      chestD,
      chestH,
      {
        top: "#5a3a1a",
        left: "#4a2a0a",
        right: "#3a1a00",
        leftBack: "#6a4a2a",
        rightBack: "#5a3a1a",
      },
      zoom,
    );

    // Gold banding on chest
    const chestHW = chestW * zoom * 0.5;
    const chestDO = chestD * zoom * ISO_PRISM_D_FACTOR;
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * zoom;
    // Horizontal band
    const bandY = chestY - chestH * zoom * 0.5;
    ctx.beginPath();
    ctx.moveTo(chestX - chestHW, bandY);
    ctx.lineTo(chestX, bandY + chestDO);
    ctx.lineTo(chestX + chestHW, bandY);
    ctx.stroke();

    // Gold latch/lock
    const lockGlow = 0.5 + Math.sin(time * 3) * 0.2 + flashIntensity * 0.4;
    ctx.fillStyle = `rgba(201, 162, 39, ${lockGlow})`;
    ctx.beginPath();
    ctx.arc(
      chestX,
      chestY - chestH * zoom * 0.5 + chestDO * 0.5,
      2 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Overflowing gold coins
    for (let gc = 0; gc < 3; gc++) {
      const gcOff = (gc - 1) * 3 * zoom;
      const gcBob = Math.sin(time * 2 + gc * 1.5) * 0.5 * zoom;
      ctx.fillStyle = "#c9a227";
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = (3 + flashIntensity * 3) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        chestX + gcOff,
        chestY - chestH * zoom - 1 * zoom + gcBob,
        2.5 * zoom,
        1.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ========== ORNATE VAULT DOOR ==========
  const vaultCX = screenPos.x;
  const vaultCY = screenPos.y - h * 0.25;

  // Heavy door surround (dark stone frame)
  ctx.fillStyle = "#2a2a22";
  ctx.beginPath();
  ctx.arc(vaultCX, vaultCY, 11 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Gold rim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(vaultCX, vaultCY, 10 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Main vault door face (brushed metal)
  const vaultGrad = ctx.createRadialGradient(
    vaultCX - 3 * zoom,
    vaultCY - 3 * zoom,
    0,
    vaultCX,
    vaultCY,
    9 * zoom,
  );
  vaultGrad.addColorStop(0, "#6a6a72");
  vaultGrad.addColorStop(0.5, "#4a4a52");
  vaultGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = vaultGrad;
  ctx.beginPath();
  ctx.arc(vaultCX, vaultCY, 9 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Inner decorative rings
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(vaultCX, vaultCY, 7 * zoom, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(vaultCX, vaultCY, 4.5 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Rivets around the vault door
  const rivetCount = 8;
  for (let rv = 0; rv < rivetCount; rv++) {
    const rvAngle = (rv / rivetCount) * Math.PI * 2;
    const rvX = vaultCX + Math.cos(rvAngle) * 7.5 * zoom;
    const rvY = vaultCY + Math.sin(rvAngle) * 7.5 * zoom;
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.arc(rvX, rvY, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9a9aa2";
    ctx.beginPath();
    ctx.arc(rvX - 0.2 * zoom, rvY - 0.2 * zoom, 0.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vault handle (rotating combination dial)
  const spokeSpeed = flashIntensity > 0 ? 2 : 0.5;
  ctx.strokeStyle = "#8a8a92";
  ctx.lineWidth = 1.5 * zoom;
  for (let spoke = 0; spoke < 4; spoke++) {
    const spokeAngle = (spoke / 4) * Math.PI * 2 + time * spokeSpeed;
    ctx.beginPath();
    ctx.moveTo(vaultCX, vaultCY);
    ctx.lineTo(
      vaultCX + Math.cos(spokeAngle) * 4 * zoom,
      vaultCY + Math.sin(spokeAngle) * 4 * zoom,
    );
    ctx.stroke();
  }

  // Vault center jewel
  const vaultGlow = 0.6 + Math.sin(time * 3) * 0.3 + flashIntensity * 0.4;
  ctx.fillStyle = `rgba(255, 215, 0, ${vaultGlow})`;
  ctx.shadowColor = "#c9a227";
  ctx.shadowBlur = (6 + flashIntensity * 10) * zoom;
  ctx.beginPath();
  ctx.arc(vaultCX, vaultCY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Highlight specular
  ctx.fillStyle = "rgba(255, 250, 220, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    vaultCX - 3 * zoom,
    vaultCY - 3 * zoom,
    3 * zoom,
    2 * zoom,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Gold filigree scroll lines
  const filigreeGlow = 0.35 + Math.sin(time * 2) * 0.15 + flashIntensity * 0.25;
  ctx.strokeStyle = `rgba(201, 162, 39, ${filigreeGlow})`;
  ctx.lineWidth = 0.8 * zoom;

  for (let i = 1; i <= tower.level + 1; i++) {
    const lineY = screenPos.y - (h * i) / (tower.level + 2);
    // Left face scroll
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.15, lineY + d * 0.25);
    ctx.quadraticCurveTo(
      screenPos.x - w * 0.5,
      lineY + d * 0.1 - 2 * zoom,
      screenPos.x - w * 0.82,
      lineY - d * 0.15,
    );
    ctx.stroke();
    // Right face scroll
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.15, lineY + d * 0.25);
    ctx.quadraticCurveTo(
      screenPos.x + w * 0.5,
      lineY + d * 0.1 - 2 * zoom,
      screenPos.x + w * 0.82,
      lineY - d * 0.15,
    );
    ctx.stroke();
  }

  // ========== ORNAMENTAL DOWNSPOUTS ==========
  for (const side of [-1, 1]) {
    const spoutX = screenPos.x + side * w * 0.65;
    const spoutTopY = screenPos.y - h * 0.7;
    const spoutBotY = screenPos.y + 4 * zoom;

    ctx.strokeStyle = "#6a5a3a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(spoutX, spoutTopY);
    ctx.lineTo(spoutX, spoutBotY - 4 * zoom);
    ctx.quadraticCurveTo(
      spoutX,
      spoutBotY,
      spoutX + side * 4 * zoom,
      spoutBotY + 2 * zoom,
    );
    ctx.stroke();

    ctx.strokeStyle = "#8a7a5a";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(spoutX - 0.6 * zoom, spoutTopY);
    ctx.lineTo(spoutX - 0.6 * zoom, spoutBotY - 4 * zoom);
    ctx.stroke();

    for (let b = 0; b < 4; b++) {
      const bandY = spoutTopY + (spoutBotY - spoutTopY) * (b / 4 + 0.1);
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(spoutX - 2 * zoom, bandY);
      ctx.lineTo(spoutX + 2 * zoom, bandY);
      ctx.stroke();
    }

    const spoutMouthGlow =
      0.15 + Math.sin(time * 2 + side) * 0.08 + flashIntensity * 0.2;
    ctx.fillStyle = `rgba(201, 162, 39, ${spoutMouthGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      spoutX + side * 4 * zoom,
      spoutBotY + 2 * zoom,
      2.5 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ========== TOP RAILING BACK HALF (behind roof/dome/chimney) ==========
  const topRailY = topY + 2 * zoom;
  const topRailRX = w * 0.88;
  const topRailRY = d * 0.88;
  const topRailH = 5 * zoom;
  const clubTopRailColors = {
    rail: "#a08020",
    topRail: "#c9a227",
    backPanel: "rgba(42, 90, 58, 0.35)",
    frontPanel: "rgba(42, 90, 58, 0.25)",
  };
  drawIsometricRailing(
    ctx,
    screenPos.x,
    topRailY,
    topRailRX,
    topRailRY,
    topRailH,
    32,
    16,
    clubTopRailColors,
    zoom,
    "back",
  );

  // ========== WAVING CLUB BANNER (behind roof, on right side) ==========
  const flagPoleX = screenPos.x + w * 0.35;
  const flagPoleTopY = topY - 28 * zoom;

  // Pole shadow
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(flagPoleX + zoom, topY - 1 * zoom);
  ctx.lineTo(flagPoleX + zoom, flagPoleTopY + zoom);
  ctx.stroke();

  // Pole shaft with metallic gradient
  ctx.strokeStyle = "#6a6a72";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(flagPoleX, topY - 2 * zoom);
  ctx.lineTo(flagPoleX, flagPoleTopY);
  ctx.stroke();
  ctx.strokeStyle = "#9a9aa2";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(flagPoleX - 0.5 * zoom, topY - 2 * zoom);
  ctx.lineTo(flagPoleX - 0.5 * zoom, flagPoleTopY);
  ctx.stroke();

  // Gold ornamental ball on top
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(flagPoleX, flagPoleTopY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe88a";
  ctx.beginPath();
  ctx.arc(
    flagPoleX - 0.5 * zoom,
    flagPoleTopY - 0.5 * zoom,
    0.8 * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Flag with wave segments for cloth-like ripple
  const flagW = 14 * zoom;
  const flagH = 9 * zoom;
  const flagTopY2 = flagPoleTopY + 2 * zoom;
  const waveSegs = 6;

  // Flag body with wave
  ctx.fillStyle = "#2a5a3a";
  ctx.beginPath();
  ctx.moveTo(flagPoleX, flagTopY2);
  for (let seg = 1; seg <= waveSegs; seg++) {
    const t = seg / waveSegs;
    const sx =
      flagPoleX + flagW * t + Math.sin(time * 3 + t * 3) * 2 * zoom * t;
    const sy = flagTopY2 + Math.sin(time * 2.5 + t * 2) * 1.5 * zoom * t;
    ctx.lineTo(sx, sy);
  }
  for (let seg = waveSegs; seg >= 0; seg--) {
    const t = seg / waveSegs;
    const sx =
      flagPoleX + flagW * t + Math.sin(time * 3 + t * 3 + 0.5) * 2.5 * zoom * t;
    const sy =
      flagTopY2 + flagH + Math.sin(time * 2.8 + t * 2) * 1.5 * zoom * t;
    ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();

  // Darker stripe across middle of flag
  ctx.fillStyle = "rgba(26, 58, 38, 0.6)";
  ctx.beginPath();
  ctx.moveTo(flagPoleX, flagTopY2 + flagH * 0.35);
  for (let seg = 1; seg <= waveSegs; seg++) {
    const t = seg / waveSegs;
    const sx =
      flagPoleX + flagW * t + Math.sin(time * 3 + t * 3) * 2 * zoom * t;
    const sy =
      flagTopY2 + flagH * 0.35 + Math.sin(time * 2.6 + t * 2) * 1.2 * zoom * t;
    ctx.lineTo(sx, sy);
  }
  for (let seg = waveSegs; seg >= 0; seg--) {
    const t = seg / waveSegs;
    const sx =
      flagPoleX + flagW * t + Math.sin(time * 3 + t * 3 + 0.3) * 2.2 * zoom * t;
    const sy =
      flagTopY2 + flagH * 0.65 + Math.sin(time * 2.7 + t * 2) * 1.2 * zoom * t;
    ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();

  // Gold border trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(flagPoleX, flagTopY2);
  for (let seg = 1; seg <= waveSegs; seg++) {
    const t = seg / waveSegs;
    const sx =
      flagPoleX + flagW * t + Math.sin(time * 3 + t * 3) * 2 * zoom * t;
    const sy = flagTopY2 + Math.sin(time * 2.5 + t * 2) * 1.5 * zoom * t;
    ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(flagPoleX, flagTopY2 + flagH);
  for (let seg = 1; seg <= waveSegs; seg++) {
    const t = seg / waveSegs;
    const sx =
      flagPoleX + flagW * t + Math.sin(time * 3 + t * 3 + 0.5) * 2.5 * zoom * t;
    const sy =
      flagTopY2 + flagH + Math.sin(time * 2.8 + t * 2) * 1.5 * zoom * t;
    ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // "EC" text with shadow
  const flagCenterX =
    flagPoleX + flagW * 0.45 + Math.sin(time * 3 + 1.5) * zoom;
  const flagCenterY = flagTopY2 + flagH * 0.5;
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.font = `bold ${6 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("EC", flagCenterX + 0.5 * zoom, flagCenterY + 0.5 * zoom);
  ctx.fillStyle = `rgba(201, 162, 39, ${0.9 + Math.sin(time * 2) * 0.1})`;
  ctx.fillText("EC", flagCenterX, flagCenterY);

  // ========== ORNATE CHIMNEY (3D isometric, left side) ==========
  const chimneyX = screenPos.x - w * 0.3;
  const chimneyBaseY = topY + 2 * zoom;
  const chimneyH = 20 * zoom;
  const chimneyW = 6;
  const chimneyD = 6;

  // Chimney shaft (isometric prism) — warm brick
  drawIsometricPrism(
    ctx,
    chimneyX,
    chimneyBaseY,
    chimneyW,
    chimneyD,
    chimneyH / zoom,
    {
      top: "#6a4a3a",
      left: "#5a3a2a",
      right: "#4a2a1a",
      leftBack: "#6a4a3a",
      rightBack: "#5a3a2a",
    },
    zoom,
  );

  // Brick mortar lines with staggered pattern
  const chHW = chimneyW * zoom * 0.5;
  const chDO = chimneyD * zoom * 0.25;
  const brickRows = 8;
  for (let br = 1; br < brickRows; br++) {
    const bry = chimneyBaseY - chimneyH * (br / brickRows);
    // Horizontal mortar
    ctx.strokeStyle = "rgba(90, 70, 55, 0.4)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(chimneyX - chHW, bry);
    ctx.lineTo(chimneyX, bry + chDO);
    ctx.lineTo(chimneyX + chHW, bry);
    ctx.stroke();

    // Staggered vertical mortar (left face)
    const vOff = br % 2 === 0 ? 0.33 : 0.66;
    ctx.beginPath();
    const vx = chimneyX - chHW * (1 - vOff);
    const vy = bry + chDO * vOff * 0.5;
    const prevBry = chimneyBaseY - chimneyH * ((br - 1) / brickRows);
    const pvx = chimneyX - chHW * (1 - vOff);
    const pvy = prevBry + chDO * vOff * 0.5;
    ctx.moveTo(vx, vy);
    ctx.lineTo(pvx, pvy);
    ctx.stroke();

    // Staggered vertical mortar (right face)
    const rvOff = br % 2 === 0 ? 0.66 : 0.33;
    const rvx = chimneyX + chHW * rvOff;
    const rvy = bry + chDO * (1 - rvOff) * 0.5;
    const prvx = chimneyX + chHW * rvOff;
    const prvy = prevBry + chDO * (1 - rvOff) * 0.5;
    ctx.beginPath();
    ctx.moveTo(rvx, rvy);
    ctx.lineTo(prvx, prvy);
    ctx.stroke();
  }

  // Chimney corbel (decorative stepped crown)
  drawIsometricPrism(
    ctx,
    chimneyX,
    chimneyBaseY - chimneyH + 2 * zoom,
    chimneyW + 1.5,
    chimneyD + 1.5,
    1.5,
    {
      top: "#7a5a4a",
      left: "#6a4a3a",
      right: "#5a3a2a",
      leftBack: "#7a5a4a",
      rightBack: "#6a4a3a",
    },
    zoom,
  );
  drawIsometricPrism(
    ctx,
    chimneyX,
    chimneyBaseY - chimneyH,
    chimneyW + 3,
    chimneyD + 3,
    2,
    {
      top: "#8a6a5a",
      left: "#7a5a4a",
      right: "#6a4a3a",
      leftBack: "#8a6a5a",
      rightBack: "#7a5a4a",
    },
    zoom,
  );

  // Gold trim ring around chimney crown
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  const crownW = (chimneyW + 3) * zoom * 0.5;
  const crownD = (chimneyD + 3) * zoom * 0.25;
  const crownY = chimneyBaseY - chimneyH - 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(chimneyX - crownW, crownY);
  ctx.lineTo(chimneyX, crownY + crownD);
  ctx.lineTo(chimneyX + crownW, crownY);
  ctx.stroke();

  // Dark chimney flue opening
  ctx.fillStyle = "#120808";
  ctx.beginPath();
  ctx.ellipse(
    chimneyX,
    crownY - 0.5 * zoom,
    crownW * 0.55,
    crownD * 0.55,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Inner ember glow
  const emberGlow = 0.15 + Math.sin(time * 2) * 0.1 + flashIntensity * 0.2;
  ctx.fillStyle = `rgba(200, 80, 20, ${emberGlow})`;
  ctx.beginPath();
  ctx.ellipse(
    chimneyX,
    crownY - 0.5 * zoom,
    crownW * 0.35,
    crownD * 0.35,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Layered smoke puffs with better dissipation
  for (let s = 0; s < 6; s++) {
    const smokeAge = (time * 0.6 + s * 0.17) % 1;
    const drift = Math.sin(time * 1.2 + s * 1.9) * (6 + smokeAge * 4) * zoom;
    const rise = smokeAge * 30 * zoom;
    const smokeY = crownY - 2 * zoom - rise;
    const smokeX = chimneyX + drift;
    const smokeAlpha = (1 - smokeAge) * 0.25 * (1 - smokeAge);
    const smokeSize = (2 + smokeAge * 7) * zoom;
    ctx.fillStyle = `rgba(170, 170, 185, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      smokeX,
      smokeY,
      smokeSize,
      smokeSize * 0.65,
      drift * 0.02,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ========== ENHANCED ROOF WITH GOLD DOME ==========
  // Antenna array on roof (level 2+)
  if (tower.level >= 2) {
    ctx.strokeStyle = "#5a6a5a";
    ctx.lineWidth = 1.5 * zoom;
    for (let ant = -1; ant <= 1; ant++) {
      ctx.beginPath();
      ctx.moveTo(screenPos.x + ant * 12 * zoom, topY - 12 * zoom);
      ctx.lineTo(screenPos.x + ant * 15 * zoom, topY - 25 * zoom);
      ctx.stroke();
      // Antenna tips
      const antGlow =
        0.5 + Math.sin(time * 5 + ant * 2) * 0.3 + flashIntensity * 0.4;
      ctx.fillStyle = `rgba(255, 100, 100, ${antGlow})`;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + ant * 15 * zoom,
        topY - 26 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // ========== DETAILED ISOMETRIC ROOF WITH TILES ==========
  const roofPeakX = screenPos.x;
  const roofPeakY = topY - 18 * zoom;
  const roofLeftX = screenPos.x - baseWidth * zoom * 0.45;
  const roofLeftY = topY + 2 * zoom;
  const roofRightX = screenPos.x + baseWidth * zoom * 0.45;
  const roofRightY = topY + 2 * zoom;
  const roofFrontX = screenPos.x;
  const roofFrontY = topY + baseWidth * zoom * 0.22;
  const roofEaveThick = 4 * zoom;

  // Left face base fill (gradient)
  const leftRoofGrad = ctx.createLinearGradient(
    roofPeakX,
    roofPeakY,
    roofLeftX,
    roofFrontY,
  );
  leftRoofGrad.addColorStop(0, "#2a5040");
  leftRoofGrad.addColorStop(0.5, "#1e3e30");
  leftRoofGrad.addColorStop(1, "#152e24");
  ctx.fillStyle = leftRoofGrad;
  ctx.beginPath();
  ctx.moveTo(roofPeakX, roofPeakY);
  ctx.lineTo(roofLeftX, roofLeftY);
  ctx.lineTo(roofFrontX, roofFrontY);
  ctx.closePath();
  ctx.fill();

  // Right face base fill (gradient, lighter for sunlit side)
  const rightRoofGrad = ctx.createLinearGradient(
    roofPeakX,
    roofPeakY,
    roofRightX,
    roofFrontY,
  );
  rightRoofGrad.addColorStop(0, "#366050");
  rightRoofGrad.addColorStop(0.5, "#2a4a3a");
  rightRoofGrad.addColorStop(1, "#1e3e2e");
  ctx.fillStyle = rightRoofGrad;
  ctx.beginPath();
  ctx.moveTo(roofPeakX, roofPeakY);
  ctx.lineTo(roofRightX, roofRightY);
  ctx.lineTo(roofFrontX, roofFrontY);
  ctx.closePath();
  ctx.fill();

  // Right side depth face
  ctx.fillStyle = "#1a3828";
  ctx.beginPath();
  ctx.moveTo(roofPeakX, roofPeakY);
  ctx.lineTo(roofRightX, roofRightY);
  ctx.lineTo(roofRightX, roofRightY + roofEaveThick);
  ctx.lineTo(roofFrontX, roofFrontY + roofEaveThick);
  ctx.closePath();
  ctx.fill();

  // Tile rows on left face (staggered shingle pattern)
  const tileRows = 7;
  for (let row = 0; row < tileRows; row++) {
    const t0 = row / tileRows;
    const t1 = (row + 1) / tileRows;
    // Row edges on left face: peak->leftBase and peak->frontBase
    const l0x = roofPeakX + (roofLeftX - roofPeakX) * t0;
    const l0y = roofPeakY + (roofLeftY - roofPeakY) * t0;
    const r0x = roofPeakX + (roofFrontX - roofPeakX) * t0;
    const r0y = roofPeakY + (roofFrontY - roofPeakY) * t0;
    const l1x = roofPeakX + (roofLeftX - roofPeakX) * t1;
    const l1y = roofPeakY + (roofLeftY - roofPeakY) * t1;
    const r1x = roofPeakX + (roofFrontX - roofPeakX) * t1;
    const r1y = roofPeakY + (roofFrontY - roofPeakY) * t1;

    // Alternating row shading
    const rowShade =
      row % 2 === 0 ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.03)";
    ctx.fillStyle = rowShade;
    ctx.beginPath();
    ctx.moveTo(l0x, l0y);
    ctx.lineTo(r0x, r0y);
    ctx.lineTo(r1x, r1y);
    ctx.lineTo(l1x, l1y);
    ctx.closePath();
    ctx.fill();

    // Horizontal row line
    ctx.strokeStyle = "rgba(10, 30, 18, 0.5)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(l1x, l1y);
    ctx.lineTo(r1x, r1y);
    ctx.stroke();

    // Vertical shingle separators (staggered)
    const tileCols = 3 + Math.floor(row * 0.8);
    const staggerOff = row % 2 === 0 ? 0 : 0.5 / tileCols;
    ctx.strokeStyle = "rgba(10, 30, 18, 0.3)";
    ctx.lineWidth = 0.4 * zoom;
    for (let col = 1; col < tileCols; col++) {
      const ct = col / tileCols + staggerOff;
      if (ct >= 1) break;
      const sx = l0x + (r0x - l0x) * ct;
      const sy = l0y + (r0y - l0y) * ct;
      const ex = l1x + (r1x - l1x) * ct;
      const ey = l1y + (r1y - l1y) * ct;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }

  // Tile rows on right face (staggered shingle pattern)
  for (let row = 0; row < tileRows; row++) {
    const t0 = row / tileRows;
    const t1 = (row + 1) / tileRows;
    const l0x = roofPeakX + (roofFrontX - roofPeakX) * t0;
    const l0y = roofPeakY + (roofFrontY - roofPeakY) * t0;
    const r0x = roofPeakX + (roofRightX - roofPeakX) * t0;
    const r0y = roofPeakY + (roofRightY - roofPeakY) * t0;
    const l1x = roofPeakX + (roofFrontX - roofPeakX) * t1;
    const l1y = roofPeakY + (roofFrontY - roofPeakY) * t1;
    const r1x = roofPeakX + (roofRightX - roofPeakX) * t1;
    const r1y = roofPeakY + (roofRightY - roofPeakY) * t1;

    const rowShade =
      row % 2 === 0 ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.05)";
    ctx.fillStyle = rowShade;
    ctx.beginPath();
    ctx.moveTo(l0x, l0y);
    ctx.lineTo(r0x, r0y);
    ctx.lineTo(r1x, r1y);
    ctx.lineTo(l1x, l1y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(10, 40, 22, 0.45)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(l1x, l1y);
    ctx.lineTo(r1x, r1y);
    ctx.stroke();

    const tileCols = 3 + Math.floor(row * 0.8);
    const staggerOff = row % 2 === 0 ? 0 : 0.5 / tileCols;
    ctx.strokeStyle = "rgba(10, 40, 22, 0.25)";
    ctx.lineWidth = 0.4 * zoom;
    for (let col = 1; col < tileCols; col++) {
      const ct = col / tileCols + staggerOff;
      if (ct >= 1) break;
      const sx = l0x + (r0x - l0x) * ct;
      const sy = l0y + (r0y - l0y) * ct;
      const ex = l1x + (r1x - l1x) * ct;
      const ey = l1y + (r1y - l1y) * ct;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }

  // Ridge cap along the peak (left edge)
  ctx.strokeStyle = "#3a6a50";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(roofPeakX, roofPeakY);
  ctx.lineTo(roofLeftX, roofLeftY);
  ctx.stroke();
  // Ridge cap along the peak (right edge)
  ctx.beginPath();
  ctx.moveTo(roofPeakX, roofPeakY);
  ctx.lineTo(roofRightX, roofRightY);
  ctx.stroke();
  // Ridge highlight
  ctx.strokeStyle = "rgba(80, 140, 100, 0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(roofPeakX, roofPeakY + 0.5 * zoom);
  ctx.lineTo(roofRightX - 1 * zoom, roofRightY + 0.5 * zoom);
  ctx.stroke();

  // Front ridge (peak to front)
  ctx.strokeStyle = "#2a5a40";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(roofPeakX, roofPeakY);
  ctx.lineTo(roofFrontX, roofFrontY);
  ctx.stroke();

  // Eave trim (bottom edges with thickness)
  ctx.strokeStyle = "#4a3a2a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(roofLeftX, roofLeftY);
  ctx.lineTo(roofFrontX, roofFrontY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(roofFrontX, roofFrontY);
  ctx.lineTo(roofRightX, roofRightY);
  ctx.stroke();
  // Eave underside highlight
  ctx.strokeStyle = "rgba(100, 80, 50, 0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(roofFrontX, roofFrontY + 1.5 * zoom);
  ctx.lineTo(roofRightX, roofRightY + 1.5 * zoom);
  ctx.stroke();

  // Gold dome with enhanced 3D shading
  const domeX = screenPos.x;
  const domeY = topY - 15 * zoom;
  const domeRX = 12 * zoom;
  const domeRY = 7 * zoom;

  // Dome shadow underneath
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(
    domeX,
    domeY + 2 * zoom,
    domeRX + zoom,
    domeRY + zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Main dome body gradient
  const domeGrad = ctx.createRadialGradient(
    domeX - 4 * zoom,
    domeY - 3 * zoom,
    0,
    domeX,
    domeY,
    domeRX,
  );
  domeGrad.addColorStop(0, flashIntensity > 0 ? "#ffffee" : "#fffadc");
  domeGrad.addColorStop(0.15, flashIntensity > 0 ? "#fff066" : "#ffe44d");
  domeGrad.addColorStop(0.4, "#dab540");
  domeGrad.addColorStop(0.65, "#c9a227");
  domeGrad.addColorStop(0.85, "#a8860b");
  domeGrad.addColorStop(1, "#7a5a08");
  ctx.fillStyle = domeGrad;
  if (flashIntensity > 0) {
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 15 * zoom * flashIntensity;
  }
  ctx.beginPath();
  ctx.ellipse(domeX, domeY, domeRX, domeRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Dome rim ring (3D base ring)
  ctx.strokeStyle = "#8b6914";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    domeX,
    domeY + domeRY * 0.7,
    domeRX * 0.95,
    domeRY * 0.35,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();

  // Specular highlight arc (bright)
  ctx.strokeStyle = "rgba(255, 250, 220, 0.6)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    domeX,
    domeY,
    domeRX * 0.7,
    domeRY * 0.65,
    0,
    Math.PI * 1.15,
    Math.PI * 1.75,
  );
  ctx.stroke();

  // Secondary subtle highlight
  ctx.strokeStyle = "rgba(255, 240, 180, 0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    domeX,
    domeY - domeRY * 0.15,
    domeRX * 0.5,
    domeRY * 0.4,
    0,
    Math.PI * 1.0,
    Math.PI * 1.9,
  );
  ctx.stroke();

  // Meridian lines on dome (longitudinal)
  ctx.strokeStyle = "rgba(138, 105, 20, 0.25)";
  ctx.lineWidth = 0.6 * zoom;
  for (let m = 0; m < 6; m++) {
    const mAngle = (m / 6) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(
      domeX + Math.cos(mAngle) * domeRX * 0.95,
      domeY + Math.sin(mAngle) * domeRY * 0.7,
    );
    ctx.quadraticCurveTo(
      domeX + Math.cos(mAngle) * domeRX * 0.3,
      domeY - domeRY * 0.9,
      domeX - Math.cos(mAngle) * domeRX * 0.95,
      domeY + Math.sin(Math.PI - mAngle) * domeRY * 0.7,
    );
    ctx.stroke();
  }

  // ========== ORNATE FINIAL (spire on top of dome) ==========
  const finialBaseY = domeY - domeRY * 0.6;

  // Finial neck/base collar
  ctx.fillStyle = "#b89020";
  ctx.beginPath();
  ctx.ellipse(
    domeX,
    finialBaseY + 2 * zoom,
    3 * zoom,
    1.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Finial shaft with taper
  const finialTipY = topY - 34 * zoom;
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(domeX - 2.5 * zoom, finialBaseY);
  ctx.lineTo(domeX - 1.2 * zoom, finialBaseY - 8 * zoom);
  ctx.lineTo(domeX - 0.6 * zoom, finialTipY + 4 * zoom);
  ctx.lineTo(domeX, finialTipY);
  ctx.lineTo(domeX + 0.6 * zoom, finialTipY + 4 * zoom);
  ctx.lineTo(domeX + 1.2 * zoom, finialBaseY - 8 * zoom);
  ctx.lineTo(domeX + 2.5 * zoom, finialBaseY);
  ctx.closePath();
  ctx.fill();

  // Shaft highlight
  ctx.strokeStyle = "rgba(255, 250, 220, 0.5)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(domeX - 0.8 * zoom, finialBaseY);
  ctx.lineTo(domeX - 0.4 * zoom, finialTipY + 3 * zoom);
  ctx.stroke();

  // Decorative knob midway
  ctx.fillStyle = "#dab540";
  ctx.beginPath();
  ctx.arc(domeX, finialBaseY - 5 * zoom, 1.8 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe88a";
  ctx.beginPath();
  ctx.arc(
    domeX - 0.4 * zoom,
    finialBaseY - 5.5 * zoom,
    0.6 * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Finial tip glow
  const finialGlow = 0.6 + Math.sin(time * 4) * 0.3 + flashIntensity * 0.4;
  ctx.fillStyle = `rgba(255, 215, 0, ${finialGlow})`;
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = (8 + flashIntensity * 10) * zoom;
  ctx.beginPath();
  ctx.arc(domeX, finialTipY, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ========== STRING LIGHTS WITH WARM GLOW ==========
  const lightCount = 7;
  for (let li = 0; li < lightCount; li++) {
    const lt = li / (lightCount - 1);
    const lx = screenPos.x - w * 0.9 + lt * w * 1.8;
    const sag = Math.sin(lt * Math.PI) * 6 * zoom;
    const ly = screenPos.y - h * 0.05 + sag;
    const lightFlicker =
      0.5 + Math.sin(time * 5 + li * 1.3) * 0.2 + flashIntensity * 0.2;
    ctx.fillStyle = `rgba(255, 220, 100, ${lightFlicker})`;
    ctx.shadowColor = "rgba(255, 200, 60, 0.6)";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(lx, ly, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (li < lightCount - 1) {
      const nlx =
        screenPos.x - w * 0.9 + ((li + 1) / (lightCount - 1)) * w * 1.8;
      const nsag = Math.sin(((li + 1) / (lightCount - 1)) * Math.PI) * 6 * zoom;
      const nly = screenPos.y - h * 0.05 + nsag;
      ctx.strokeStyle = "rgba(80, 70, 50, 0.5)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(nlx, nly);
      ctx.stroke();
    }
  }

  // ========== EXTERIOR GAS LANTERNS ==========
  const lanternPositions = [
    { x: screenPos.x - w * 0.85, y: screenPos.y - h * 0.1, phase: 0 },
    { x: screenPos.x + w * 0.85, y: screenPos.y - h * 0.15, phase: 0.5 },
  ];
  if (tower.level >= 2) {
    lanternPositions.push(
      {
        x: screenPos.x - buttHalf * 0.9,
        y: screenPos.y - h * 0.5,
        phase: 0.25,
      },
      {
        x: screenPos.x + buttHalf * 0.9,
        y: screenPos.y - h * 0.4,
        phase: 0.75,
      },
    );
  }
  for (const lp of lanternPositions) {
    // Bracket arm
    ctx.strokeStyle = "#4a3a2a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(lp.x, lp.y + 3 * zoom);
    ctx.lineTo(lp.x, lp.y - 1 * zoom);
    ctx.stroke();
    // Lantern cage
    ctx.fillStyle = "#2a2a1a";
    ctx.fillRect(lp.x - 1.5 * zoom, lp.y - 1 * zoom, 3 * zoom, 3.5 * zoom);
    // Warm glow
    const glowAlpha =
      0.5 + Math.sin(time * 4 + lp.phase * 6) * 0.2 + flashIntensity * 0.3;
    ctx.fillStyle = `rgba(255, 200, 80, ${glowAlpha})`;
    ctx.shadowColor = "rgba(255, 180, 50, 0.5)";
    ctx.shadowBlur = 4 * zoom;
    ctx.fillRect(lp.x - 1 * zoom, lp.y - 0.5 * zoom, 2 * zoom, 2.5 * zoom);
    ctx.shadowBlur = 0;
    // Tiny cap
    ctx.fillStyle = "#6a5a3a";
    ctx.beginPath();
    ctx.moveTo(lp.x - 2 * zoom, lp.y - 1 * zoom);
    ctx.lineTo(lp.x, lp.y - 2.5 * zoom);
    ctx.lineTo(lp.x + 2 * zoom, lp.y - 1 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // ========== HOLOGRAPHIC CREDIT DISPLAY ==========
  const coinY = topY - 38 * zoom + Math.sin(time * 3) * 3 * zoom;
  const coinR = 8 * zoom;

  // Ring orbit parameters
  const orbitRings = [
    { size: 14, tilt: 0.35, speed: 1.8, phase: 0 },
    { size: 17, tilt: -0.25, speed: -1.3, phase: Math.PI * 0.6 },
    { size: 20, tilt: 0.15, speed: 1.0, phase: Math.PI * 1.2 },
  ];

  // --- BACK halves of orbiting rings (drawn behind coin/dome) ---
  for (let ri = 0; ri < orbitRings.length; ri++) {
    const orb = orbitRings[ri];
    const orbAngle = time * orb.speed + orb.phase;
    const orbRX = orb.size * zoom;
    const orbRY = orb.size * 0.38 * zoom;
    const ringAlpha =
      0.3 + Math.sin(time * 3.5 + ri * 1.4) * 0.12 + flashIntensity * 0.2;
    ctx.save();
    ctx.translate(screenPos.x, coinY);
    ctx.rotate(orb.tilt);
    // Outer glow (back half)
    ctx.strokeStyle = `rgba(0, 255, 180, ${ringAlpha * 0.25})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      orbRX + zoom,
      orbRY + 0.5 * zoom,
      0,
      Math.PI,
      Math.PI * 2,
    );
    ctx.stroke();
    // Main ring (back half — upper arc is behind)
    ctx.strokeStyle = `rgba(0, 230, 160, ${ringAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, orbRX, orbRY, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    // Orbiting particle on back half
    const pAngle = orbAngle;
    const px = Math.cos(pAngle) * orbRX;
    const py = Math.sin(pAngle) * orbRY;
    if (Math.sin(pAngle) < 0) {
      ctx.fillStyle = `rgba(255, 255, 200, ${0.6 + Math.sin(time * 6 + ri) * 0.2})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3D rotating coin
  const coinRotation = time * 3;
  const coinScale = Math.cos(coinRotation);
  const coinThickness = 2 * zoom;

  ctx.save();
  ctx.translate(screenPos.x, coinY);

  // Coin edge (visible when turned)
  if (Math.abs(coinScale) < 0.95) {
    const edgeDir = coinScale > 0 ? 1 : -1;
    ctx.fillStyle = "#8b6914";
    ctx.beginPath();
    ctx.ellipse(
      edgeDir * coinThickness * 0.5,
      0,
      coinThickness * 0.5,
      coinR,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Edge ridges
    ctx.strokeStyle = "rgba(139, 105, 20, 0.4)";
    ctx.lineWidth = 0.4 * zoom;
    for (let r = -3; r <= 3; r++) {
      const ry = r * coinR * 0.25;
      ctx.beginPath();
      ctx.moveTo(0, ry);
      ctx.lineTo(edgeDir * coinThickness, ry);
      ctx.stroke();
    }
  }

  // Main coin face
  ctx.scale(coinScale, 1);

  // Coin body gradient
  const creditGrad = ctx.createRadialGradient(
    -2 * zoom,
    -2 * zoom,
    0,
    0,
    0,
    coinR,
  );
  creditGrad.addColorStop(0, flashIntensity > 0 ? "#ffffe8" : "#ffe88a");
  creditGrad.addColorStop(0.3, "#dab540");
  creditGrad.addColorStop(0.7, "#c9a227");
  creditGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = creditGrad;
  if (flashIntensity > 0) {
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 12 * zoom * flashIntensity;
  }
  ctx.beginPath();
  ctx.arc(0, 0, coinR, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Coin rim
  ctx.strokeStyle = "#a88520";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, coinR - 0.5 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = "rgba(160, 130, 30, 0.5)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, coinR * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  // Dollar sign with embossed look
  ctx.fillStyle = "rgba(90, 70, 20, 0.3)";
  ctx.font = `bold ${12 * zoom}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", 0.4 * zoom, 0.4 * zoom);
  ctx.fillStyle = "#ffe88a";
  ctx.fillText("$", 0, 0);

  // Specular highlight
  ctx.fillStyle = "rgba(255, 255, 230, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    -coinR * 0.25,
    -coinR * 0.25,
    coinR * 0.4,
    coinR * 0.3,
    -0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.restore();

  // --- FRONT halves of orbiting rings (drawn in front of coin/dome) ---
  for (let ri = 0; ri < orbitRings.length; ri++) {
    const orb = orbitRings[ri];
    const orbAngle = time * orb.speed + orb.phase;
    const orbRX = orb.size * zoom;
    const orbRY = orb.size * 0.38 * zoom;
    const ringAlpha =
      0.3 + Math.sin(time * 3.5 + ri * 1.4) * 0.12 + flashIntensity * 0.2;
    ctx.save();
    ctx.translate(screenPos.x, coinY);
    ctx.rotate(orb.tilt);
    // Outer glow (front half)
    ctx.strokeStyle = `rgba(0, 255, 180, ${ringAlpha * 0.25})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, orbRX + zoom, orbRY + 0.5 * zoom, 0, 0, Math.PI);
    ctx.stroke();
    // Main ring (front half — lower arc is in front)
    ctx.strokeStyle = `rgba(0, 230, 160, ${ringAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, orbRX, orbRY, 0, 0, Math.PI);
    ctx.stroke();
    // Orbiting particle on front half
    const pAngle = orbAngle;
    const px = Math.cos(pAngle) * orbRX;
    const py = Math.sin(pAngle) * orbRY;
    if (Math.sin(pAngle) >= 0) {
      ctx.fillStyle = `rgba(255, 255, 200, ${0.6 + Math.sin(time * 6 + ri) * 0.2})`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ========== OUTDOOR DINING AREA ==========
  const diningBaseY = screenPos.y + 10 * zoom;
  const diningX = screenPos.x + w * 0.9;
  ctx.fillStyle = "#5a4a3a";
  ctx.beginPath();
  ctx.ellipse(
    diningX,
    diningBaseY - 4 * zoom,
    5 * zoom,
    2.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#4a3a2a";
  ctx.fillRect(
    diningX - 0.8 * zoom,
    diningBaseY - 4 * zoom,
    1.6 * zoom,
    6 * zoom,
  );
  for (const cSide of [-1, 1]) {
    const chairX = diningX + cSide * 6 * zoom;
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(
      chairX - 1.5 * zoom,
      diningBaseY - 2 * zoom,
      3 * zoom,
      4 * zoom,
    );
    ctx.fillRect(
      chairX - 1.5 * zoom,
      diningBaseY - 5 * zoom,
      3 * zoom,
      1.5 * zoom,
    );
  }
  const plateGlow = 0.4 + Math.sin(time * 2) * 0.15;
  ctx.fillStyle = `rgba(255, 215, 0, ${plateGlow})`;
  ctx.beginPath();
  ctx.ellipse(
    diningX,
    diningBaseY - 5 * zoom,
    2 * zoom,
    1 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ========== GOLD SHIMMER ON BUILDING ==========
  for (let sp = 0; sp < 6 + tower.level * 2; sp++) {
    const sparklePhase = (time * 1.5 + sp * 0.37) % 1;
    const sparkleAlpha =
      Math.sin(sparklePhase * Math.PI) * (0.4 + flashIntensity * 0.4);
    if (sparkleAlpha > 0.05) {
      const spX = screenPos.x + Math.sin(sp * 2.7) * w * 0.8;
      const spY = screenPos.y - (h * sp) / (6 + tower.level * 2);
      ctx.fillStyle = `rgba(255, 230, 120, ${sparkleAlpha})`;
      ctx.beginPath();
      ctx.moveTo(spX, spY - 2 * zoom);
      ctx.lineTo(spX + 1 * zoom, spY);
      ctx.lineTo(spX, spY + 2 * zoom);
      ctx.lineTo(spX - 1 * zoom, spY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ========== GOLD PARTICLE FOUNTAIN ==========
  const particleCount = tower.level + 3 + (flashIntensity > 0 ? 4 : 0);
  for (let i = 0; i < particleCount; i++) {
    const pPhase = (time * 2.5 + i * 0.2) % 1;
    const pY = coinY + 8 * zoom - pPhase * h * 0.5;
    const pX = screenPos.x + Math.sin(time * 4 + i * 2.2) * 10 * zoom;
    const pAlpha = Math.sin(pPhase * Math.PI) * (0.7 + flashIntensity * 0.3);
    const pSize = 2 + Math.sin(time * 6 + i) * 1 + flashIntensity;

    ctx.fillStyle = `rgba(255, 215, 0, ${pAlpha})`;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = (4 + flashIntensity * 4) * zoom;
    ctx.beginPath();
    ctx.arc(pX, pY, pSize * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ========== KA-CHING GENERATION EFFECTS ==========
  if (flashIntensity > 0) {
    // Dramatic expanding gold burst ring
    const burstRadius = (1 - flashIntensity) * 40 * zoom;
    const burstAlpha = flashIntensity * 0.7;
    ctx.strokeStyle = `rgba(255, 215, 0, ${burstAlpha})`;
    ctx.lineWidth = (3 + flashIntensity * 2) * zoom;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 12 * zoom * flashIntensity;
    ctx.beginPath();
    ctx.arc(screenPos.x, topY - 15 * zoom, burstRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Second inner ring
    const innerBurst = (1 - flashIntensity) * 25 * zoom;
    ctx.strokeStyle = `rgba(255, 240, 150, ${burstAlpha * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(screenPos.x, topY - 15 * zoom, innerBurst, 0, Math.PI * 2);
    ctx.stroke();

    // Flying coins shooting outward
    for (let fc = 0; fc < 8; fc++) {
      const coinAngle = (fc / 8) * Math.PI * 2 + time * 2;
      const coinDist = (1 - flashIntensity) * 35 * zoom;
      const fcX = screenPos.x + Math.cos(coinAngle) * coinDist;
      const fcY =
        topY -
        15 * zoom +
        Math.sin(coinAngle) * coinDist * 0.5 -
        (1 - flashIntensity) * 15 * zoom;
      const fcAlpha = flashIntensity * 0.8;
      const fcSize = (2 + flashIntensity * 2) * zoom;
      ctx.fillStyle = `rgba(255, 215, 0, ${fcAlpha})`;
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 6 * zoom * flashIntensity;
      ctx.beginPath();
      ctx.ellipse(fcX, fcY, fcSize, fcSize * 0.6, coinAngle, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ka-ching "$" text floating up
    const kachingY = topY - 40 * zoom - (1 - flashIntensity) * 20 * zoom;
    ctx.fillStyle = `rgba(255, 230, 100, ${flashIntensity})`;
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 8 * zoom * flashIntensity;
    ctx.font = `bold ${(10 + flashIntensity * 6) * zoom}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+$", screenPos.x, kachingY);
    ctx.shadowBlur = 0;

    // Treasury pulse glow on building
    ctx.fillStyle = `rgba(255, 200, 50, ${flashIntensity * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - h * 0.3,
      w * 0.9,
      h * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ========== TOP RAILING FRONT HALF (in front of roof/dome/chimney/effects) ==========
  drawIsometricRailing(
    ctx,
    screenPos.x,
    topRailY,
    topRailRX,
    topRailRY,
    topRailH,
    32,
    16,
    clubTopRailColors,
    zoom,
    "front",
  );

  // ========== LEVEL 2 UNIQUE FEATURES ==========
  if (tower.level >= 2) {
    // Data banks on sides
    for (const side of [-1, 1]) {
      const bankX = screenPos.x + side * w * 0.75;
      const bankY = screenPos.y - h * 0.15;

      // Data bank housing
      ctx.fillStyle = "#2a3a2a";
      ctx.fillRect(bankX - 4 * zoom, bankY - 12 * zoom, 8 * zoom, 14 * zoom);
      ctx.strokeStyle = "#4a5a4a";
      ctx.lineWidth = 1 * zoom;
      ctx.strokeRect(bankX - 4 * zoom, bankY - 12 * zoom, 8 * zoom, 14 * zoom);

      // Blinking data lights
      for (let light = 0; light < 4; light++) {
        const lightY = bankY - 10 * zoom + light * 3 * zoom;
        const lightOn = Math.sin(time * 8 + light * 1.5 + side * 3) > 0;
        ctx.fillStyle = lightOn
          ? `rgba(0, 255, 100, 0.8)`
          : `rgba(0, 50, 20, 0.5)`;
        ctx.beginPath();
        ctx.arc(bankX, lightY, 1.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Quantum processing unit (level 2)
    ctx.fillStyle = "#1a2a2a";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - h * 0.85,
      6 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    const quantumGlow = 0.5 + Math.sin(time * 6) * 0.3;
    ctx.fillStyle = `rgba(100, 200, 255, ${quantumGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      screenPos.y - h * 0.85,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ========== LEVEL 3+ UPGRADE VISUALS ==========
  if (tower.level >= 3) {
    // Floating energy field around dome
    const fieldRotation = time * 0.8;
    ctx.strokeStyle = `rgba(0, 255, 200, ${0.3 + Math.sin(time * 2) * 0.15})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        topY - 20 * zoom,
        (18 + ring * 5) * zoom,
        (9 + ring * 2.5) * zoom,
        fieldRotation + ring * 0.5,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    if (tower.upgrade === "A") {
      // Investment Fund - holographic stock chart
      ctx.strokeStyle = "#00ff66";
      ctx.lineWidth = 3 * zoom;
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x - 22 * zoom, topY - 42 * zoom);
      ctx.lineTo(screenPos.x - 10 * zoom, topY - 58 * zoom);
      ctx.lineTo(screenPos.x + 2 * zoom, topY - 50 * zoom);
      ctx.lineTo(screenPos.x + 22 * zoom, topY - 70 * zoom);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Arrow head
      ctx.fillStyle = "#00ff66";
      ctx.beginPath();
      ctx.moveTo(screenPos.x + 22 * zoom, topY - 70 * zoom);
      ctx.lineTo(screenPos.x + 15 * zoom, topY - 66 * zoom);
      ctx.lineTo(screenPos.x + 17 * zoom, topY - 60 * zoom);
      ctx.closePath();
      ctx.fill();

      // Glowing data points
      ctx.shadowColor = "#00ff66";
      ctx.shadowBlur = 8 * zoom;
      ctx.fillStyle = `rgba(0, 255, 100, 0.9)`;
      const points = [
        { x: -10, y: -58 },
        { x: 2, y: -50 },
        { x: 14, y: -62 },
      ];
      for (const pt of points) {
        ctx.beginPath();
        ctx.arc(
          screenPos.x + pt.x * zoom,
          topY + pt.y * zoom,
          3 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    } else if (tower.upgrade === "B") {
      // Recruitment Center - personnel holograms
      ctx.fillStyle = "#0a2a1a";
      ctx.fillRect(
        screenPos.x - 24 * zoom,
        topY - 52 * zoom,
        18 * zoom,
        18 * zoom,
      );
      ctx.strokeStyle = "#2a4a3a";
      ctx.strokeRect(
        screenPos.x - 24 * zoom,
        topY - 52 * zoom,
        18 * zoom,
        18 * zoom,
      );

      // Multiple personnel icons
      for (let p = 0; p < 2; p++) {
        const personX = screenPos.x - 19 * zoom + p * 10 * zoom;
        const personGlow = 0.6 + Math.sin(time * 3 + p * 1.5) * 0.2;
        ctx.fillStyle = `rgba(0, 255, 100, ${personGlow})`;
        ctx.beginPath();
        ctx.arc(personX, topY - 44 * zoom, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(personX - 3 * zoom, topY - 40 * zoom, 6 * zoom, 5 * zoom);
      }

      // Status bars
      ctx.fillStyle = "#0a2a1a";
      ctx.fillRect(
        screenPos.x + 6 * zoom,
        topY - 54 * zoom,
        18 * zoom,
        20 * zoom,
      );
      ctx.strokeStyle = "#2a4a3a";
      ctx.strokeRect(
        screenPos.x + 6 * zoom,
        topY - 54 * zoom,
        18 * zoom,
        20 * zoom,
      );

      const bars = [
        { label: "STAFF", value: 0.5 + Math.sin(time * 2) * 0.3 },
        { label: "MORALE", value: 0.7 + Math.sin(time * 2.5) * 0.2 },
        { label: "OUTPUT", value: 0.6 + Math.sin(time * 3) * 0.25 },
      ];
      for (let i = 0; i < bars.length; i++) {
        const barY = topY - 52 * zoom + i * 6 * zoom;
        ctx.fillStyle = "#00ff66";
        ctx.fillRect(
          screenPos.x + 8 * zoom,
          barY,
          14 * zoom * bars[i].value,
          4 * zoom,
        );
      }
    }
  }

  ctx.restore();
}

// STATION TOWER - Sci-Fi Princeton Dinky Transport Hub
