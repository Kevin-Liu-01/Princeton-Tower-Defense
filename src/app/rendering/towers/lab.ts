import type { Tower, Enemy, Position } from "../../types";
import {
  ISO_PRISM_D_FACTOR,
} from "../../constants";
import {
  drawIsometricPrism,
  drawIsometricRailing,
} from "./towerHelpers";
import { drawIsoFlushVent, traceIsoFlushRect } from "../isoFlush";
import {
  renderTeslaCoil,
  renderFocusedBeam,
  renderChainLightning,
} from "./tesla";

export function renderLabTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  ctx.save();
  const baseWidth = 30 + tower.level * 4;
  const baseHeight = 25 + tower.level * 8;
  const w = baseWidth * zoom * 0.5;
  const d = baseWidth * zoom * 0.25;
  const h = baseHeight * zoom;

  // ========== STEPPED TECH FOUNDATION ==========
  // Lowest step — heavy concrete plinth
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 12 * zoom,
    baseWidth + 16,
    baseWidth + 16,
    3,
    {
      top: "#1a2a3a",
      left: "#122230",
      right: "#0a1a28",
      leftBack: "#1d2d3d",
      rightBack: "#152535",
    },
    zoom,
  );

  // Middle step — reinforced platform
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 9 * zoom,
    baseWidth + 12,
    baseWidth + 12,
    3,
    {
      top: "#1a3545",
      left: "#142d3d",
      right: "#0e2535",
      leftBack: "#1d3848",
      rightBack: "#173040",
    },
    zoom,
  );

  // Upper step — main platform with hazard trim
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 6 * zoom,
    baseWidth + 8,
    baseWidth + 8,
    6,
    {
      top: "#1a3a4f",
      left: "#153040",
      right: "#102535",
      leftBack: "#1d4055",
      rightBack: "#183548",
    },
    zoom,
  );

  // Cyan edge glow on upper step
  const foundGlow = 0.3 + Math.sin(time * 2) * 0.15;
  const fndLabW = (baseWidth + 8) * zoom * 0.5;
  const fndLabD = (baseWidth + 8) * zoom * ISO_PRISM_D_FACTOR;
  ctx.strokeStyle = `rgba(0, 255, 255, ${foundGlow})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - fndLabW, screenPos.y);
  ctx.lineTo(screenPos.x, screenPos.y + fndLabD);
  ctx.lineTo(screenPos.x + fndLabW, screenPos.y);
  ctx.stroke();

  // Yellow/black hazard chevron stripe along front edge
  const chevCount = 6;
  for (let ch = 0; ch < chevCount; ch++) {
    const t0 = ch / chevCount;
    const t1 = (ch + 0.5) / chevCount;
    const t2 = (ch + 1) / chevCount;
    let cx0: number,
      cy0: number,
      cx1: number,
      cy1: number,
      cx2: number,
      cy2: number;
    if (ch < chevCount / 2) {
      cx0 = screenPos.x - fndLabW + fndLabW * t0 * 2;
      cy0 = screenPos.y + fndLabD * t0 * 2;
      cx1 = screenPos.x - fndLabW + fndLabW * t1 * 2;
      cy1 = screenPos.y + fndLabD * t1 * 2;
      cx2 = screenPos.x - fndLabW + fndLabW * t2 * 2;
      cy2 = screenPos.y + fndLabD * t2 * 2;
    } else {
      const st = ch - chevCount / 2;
      cx0 = screenPos.x + fndLabW * (st / (chevCount / 2)) * 2;
      cy0 = screenPos.y + fndLabD * (1 - (st / (chevCount / 2)) * 2);
      const st1 = st + 0.5;
      cx1 = screenPos.x + fndLabW * (st1 / (chevCount / 2)) * 2;
      cy1 = screenPos.y + fndLabD * (1 - (st1 / (chevCount / 2)) * 2);
      const st2 = st + 1;
      cx2 = screenPos.x + fndLabW * Math.min(1, (st2 / (chevCount / 2)) * 2);
      cy2 =
        screenPos.y + fndLabD * Math.max(0, 1 - (st2 / (chevCount / 2)) * 2);
    }
    if (ch % 2 === 0) {
      ctx.fillStyle = "rgba(200, 180, 0, 0.35)";
    } else {
      ctx.fillStyle = "rgba(20, 20, 20, 0.25)";
    }
    ctx.beginPath();
    ctx.moveTo(cx0, cy0 + 2 * zoom);
    ctx.lineTo(cx1, cy1 + 2 * zoom);
    ctx.lineTo(cx2, cy2 + 2 * zoom);
    ctx.lineTo(cx2, cy2 - 1 * zoom);
    ctx.lineTo(cx1, cy1 - 1 * zoom);
    ctx.lineTo(cx0, cy0 - 1 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Corner anchor bolts
  for (const side of [-1, 1]) {
    const boltX = screenPos.x + side * fndLabW * 0.85;
    const boltY = screenPos.y + fndLabD * 0.15;
    ctx.fillStyle = "#5a7a9a";
    ctx.beginPath();
    ctx.arc(boltX, boltY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a9ab0";
    ctx.beginPath();
    ctx.arc(boltX - 0.3 * zoom, boltY - 0.3 * zoom, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main sci-fi tower body
  drawIsometricPrism(
    ctx,
    screenPos.x,
    screenPos.y + 2 * zoom,
    baseWidth,
    baseWidth,
    baseHeight - 6,
    {
      top: "#4d7a9b",
      left: "#3a6585",
      right: "#2d5a7b",
      leftBack: "#4a7595",
      rightBack: "#3d6888",
    },
    zoom,
  );

  // ========== BASE RAILING (3D isometric ring wrapping the base) ==========
  drawIsometricRailing(
    ctx,
    screenPos.x,
    screenPos.y + 4 * zoom,
    w * 1.05,
    d * 1.05,
    5 * zoom,
    32,
    16,
    {
      rail: "#2a6a8a",
      topRail: "#3a8aaa",
      backPanel: "rgba(45, 90, 123, 0.35)",
      frontPanel: "rgba(45, 90, 123, 0.25)",
    },
    zoom,
  );

  // ========== FACE DETAILS (panel seams, rivets, weathering) ==========
  const bodyH = (baseHeight - 6) * zoom;
  const bodyTopY = screenPos.y + 2 * zoom - bodyH;

  // Left face — vertical panel seams
  ctx.strokeStyle = "rgba(30, 70, 100, 0.4)";
  ctx.lineWidth = 0.6 * zoom;
  const panelSeams = 5;
  for (let s = 1; s < panelSeams; s++) {
    const seamT = s / panelSeams;
    const seamBotX = screenPos.x - w * seamT;
    const seamBotY = screenPos.y + 2 * zoom + d * (1 - seamT) * 0.5;
    const seamTopX = seamBotX;
    const seamTopY = bodyTopY + d * (1 - seamT) * 0.5;
    ctx.beginPath();
    ctx.moveTo(seamBotX, seamBotY);
    ctx.lineTo(seamTopX, seamTopY);
    ctx.stroke();
  }

  // Right face — vertical panel seams
  for (let s = 1; s < panelSeams; s++) {
    const seamT = s / panelSeams;
    const seamBotX = screenPos.x + w * seamT;
    const seamBotY = screenPos.y + 2 * zoom + d * (1 - seamT) * 0.5;
    const seamTopX = seamBotX;
    const seamTopY = bodyTopY + d * (1 - seamT) * 0.5;
    ctx.beginPath();
    ctx.moveTo(seamBotX, seamBotY);
    ctx.lineTo(seamTopX, seamTopY);
    ctx.stroke();
  }

  // Horizontal seam lines
  const horizSeams = 5;
  for (let r = 1; r < horizSeams; r++) {
    const seamT = r / horizSeams;
    const seamY = screenPos.y + 2 * zoom - bodyH * seamT;
    // Left face
    ctx.strokeStyle = "rgba(30, 70, 100, 0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.95, seamY + d * 0.45);
    ctx.lineTo(screenPos.x, seamY + d * 0.95);
    ctx.stroke();
    // Right face
    ctx.beginPath();
    ctx.moveTo(screenPos.x, seamY + d * 0.95);
    ctx.lineTo(screenPos.x + w * 0.95, seamY + d * 0.45);
    ctx.stroke();

    // Seam highlight (lighter line just above)
    ctx.strokeStyle = "rgba(100, 160, 200, 0.12)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.95, seamY + d * 0.45 - 0.5 * zoom);
    ctx.lineTo(screenPos.x, seamY + d * 0.95 - 0.5 * zoom);
    ctx.lineTo(screenPos.x + w * 0.95, seamY + d * 0.45 - 0.5 * zoom);
    ctx.stroke();
  }

  // Rivet rows along panel seams (left face visible rivets)
  ctx.fillStyle = "#5a8aaa";
  for (let r = 0; r < horizSeams; r++) {
    const ry = screenPos.y + 2 * zoom - bodyH * ((r + 0.5) / horizSeams);
    for (let c = 0; c < 3; c++) {
      const cx = screenPos.x - w * (0.25 + c * 0.3);
      const cyOff = d * (0.75 - c * 0.15);
      ctx.beginPath();
      ctx.arc(cx, ry + cyOff, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Right face rivets
  for (let r = 0; r < horizSeams; r++) {
    const ry = screenPos.y + 2 * zoom - bodyH * ((r + 0.5) / horizSeams);
    for (let c = 0; c < 3; c++) {
      const cx = screenPos.x + w * (0.25 + c * 0.3);
      const cyOff = d * (0.75 - c * 0.15);
      ctx.beginPath();
      ctx.arc(cx, ry + cyOff, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Weathering gradient on left face (darker at bottom)
  const leftLabWeather = ctx.createLinearGradient(
    screenPos.x - w * 0.5,
    screenPos.y + 2 * zoom,
    screenPos.x - w * 0.5,
    bodyTopY,
  );
  leftLabWeather.addColorStop(0, "rgba(0, 0, 0, 0.12)");
  leftLabWeather.addColorStop(0.4, "rgba(0, 0, 0, 0.03)");
  leftLabWeather.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = leftLabWeather;
  ctx.beginPath();
  ctx.moveTo(screenPos.x, screenPos.y + 2 * zoom);
  ctx.lineTo(screenPos.x - w, screenPos.y + 2 * zoom);
  ctx.lineTo(screenPos.x - w, bodyTopY);
  ctx.lineTo(screenPos.x, bodyTopY);
  ctx.closePath();
  ctx.fill();

  // Corner reinforcement struts (improved with 3D depth)
  for (const side of [-1, 1]) {
    const strutX = screenPos.x + side * w * 0.97;
    const strutBotY = screenPos.y + d * 0.38;
    const strutTopY = screenPos.y - (baseHeight - 10) * zoom + d * 0.3;
    // Strut shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.beginPath();
    ctx.moveTo(strutX + side * 0.5 * zoom, strutBotY + 0.5 * zoom);
    ctx.lineTo(
      strutX + side * 2 * zoom + 0.5 * zoom,
      strutBotY + d * 0.12 + 0.5 * zoom,
    );
    ctx.lineTo(
      strutX + side * 2 * zoom + 0.5 * zoom,
      strutTopY + d * 0.12 + 0.5 * zoom,
    );
    ctx.lineTo(strutX + side * 0.5 * zoom, strutTopY + 0.5 * zoom);
    ctx.closePath();
    ctx.fill();
    // Main strut
    ctx.fillStyle = "#3a6a8a";
    ctx.beginPath();
    ctx.moveTo(strutX, strutBotY);
    ctx.lineTo(strutX + side * 2 * zoom, strutBotY + d * 0.12);
    ctx.lineTo(strutX + side * 2 * zoom, strutTopY + d * 0.12);
    ctx.lineTo(strutX, strutTopY);
    ctx.closePath();
    ctx.fill();
    // Strut highlight
    ctx.strokeStyle = "#6a9aba";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(strutX + side * 0.3 * zoom, strutBotY);
    ctx.lineTo(strutX + side * 0.3 * zoom, strutTopY);
    ctx.stroke();
    // Top and bottom caps
    ctx.fillStyle = "#5a8aaa";
    for (const capY of [strutBotY, strutTopY]) {
      ctx.beginPath();
      ctx.ellipse(
        strutX + side * 1 * zoom,
        capY + d * 0.06,
        2 * zoom,
        1 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Cyan accent stripes (horizontal tech bands)
  for (let band = 0; band < tower.level; band++) {
    const bandY = screenPos.y + 2 * zoom - bodyH * (0.25 + band * 0.25);
    const bandGlow = 0.2 + Math.sin(time * 2 + band * 1.5) * 0.1;
    ctx.strokeStyle = `rgba(0, 200, 255, ${bandGlow})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.92, bandY + d * 0.4);
    ctx.lineTo(screenPos.x, bandY + d * 0.85);
    ctx.lineTo(screenPos.x + w * 0.92, bandY + d * 0.4);
    ctx.stroke();
    // Band highlight
    ctx.strokeStyle = `rgba(100, 220, 255, ${bandGlow * 0.5})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.9, bandY + d * 0.4 - 0.8 * zoom);
    ctx.lineTo(screenPos.x, bandY + d * 0.85 - 0.8 * zoom);
    ctx.lineTo(screenPos.x + w * 0.9, bandY + d * 0.4 - 0.8 * zoom);
    ctx.stroke();
  }

  // ========== ROTATING ENERGY RINGS ==========
  const ringRotation = time * 2;
  for (let ring = 0; ring < 2 + tower.level; ring++) {
    const ringY = screenPos.y - h * (0.3 + ring * 0.15);
    const ringRadius = 12 + tower.level * 2 - ring * 2;
    const ringAlpha = 0.3 + Math.sin(time * 4 + ring) * 0.15;

    ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY,
      ringRadius * zoom,
      ringRadius * 0.4 * zoom,
      ringRotation + ring * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Ring energy nodes
    for (let node = 0; node < 4; node++) {
      const nodeAngle = ringRotation + ring * 0.5 + (node / 4) * Math.PI * 2;
      const nodeX = screenPos.x + Math.cos(nodeAngle) * ringRadius * zoom;
      const nodeY = ringY + Math.sin(nodeAngle) * ringRadius * 0.4 * zoom;
      ctx.fillStyle = `rgba(0, 255, 255, ${ringAlpha + 0.2})`;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== RIGID CONDUIT PIPES (following isometric faces) ==========
  for (const side of [-1, 1]) {
    const pipeStartX = screenPos.x + side * w * 0.82;
    const pipeStartY = screenPos.y + d * 0.18 + 2 * zoom;
    const pipeEndX = screenPos.x + side * w * 0.48;
    const pipeEndY = screenPos.y - h * 0.62 + d * 0.1;

    // Pipe shadow
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 4.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pipeStartX + 0.5 * zoom, pipeStartY + 0.8 * zoom);
    ctx.lineTo(pipeEndX + 0.5 * zoom, pipeEndY + 0.8 * zoom);
    ctx.stroke();

    // Pipe body
    ctx.strokeStyle = "#3a5a7a";
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(pipeStartX, pipeStartY);
    ctx.lineTo(pipeEndX, pipeEndY);
    ctx.stroke();

    // Pipe highlight
    ctx.strokeStyle = "#6a9aba";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(pipeStartX - 0.5 * zoom, pipeStartY - 0.4 * zoom);
    ctx.lineTo(pipeEndX - 0.5 * zoom, pipeEndY - 0.4 * zoom);
    ctx.stroke();

    // Pipe clamp bands
    const pipeDx = pipeEndX - pipeStartX;
    const pipeDy = pipeEndY - pipeStartY;
    for (let cl = 0; cl < 4; cl++) {
      const t = (cl + 0.5) / 4;
      const clX = pipeStartX + pipeDx * t;
      const clY = pipeStartY + pipeDy * t;
      ctx.strokeStyle = "#5a8aaa";
      ctx.lineWidth = 1.5 * zoom;
      const pAngle = Math.atan2(pipeDy, pipeDx) + Math.PI * 0.5;
      ctx.beginPath();
      ctx.moveTo(
        clX + Math.cos(pAngle) * 2.2 * zoom,
        clY + Math.sin(pAngle) * 2.2 * zoom,
      );
      ctx.lineTo(
        clX - Math.cos(pAngle) * 2.2 * zoom,
        clY - Math.sin(pAngle) * 2.2 * zoom,
      );
      ctx.stroke();
    }

    // Flanged connector at each end
    for (const endT of [0, 1]) {
      const fX = pipeStartX + pipeDx * endT;
      const fY = pipeStartY + pipeDy * endT;
      ctx.fillStyle = "#5a7a9a";
      ctx.beginPath();
      ctx.arc(fX, fY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7aaaba";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    }
  }

  // Cross-connecting pipe (follows front iso edge, left to right)
  if (tower.level >= 2) {
    const crossY = screenPos.y - h * 0.3 + d * 0.3;
    const crossLX = screenPos.x - w * 0.58;
    const crossRX = screenPos.x + w * 0.58;
    // Shadow
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(crossLX + 0.5 * zoom, crossY + 0.8 * zoom);
    ctx.lineTo(crossRX + 0.5 * zoom, crossY + 0.8 * zoom);
    ctx.stroke();
    // Body
    ctx.strokeStyle = "#3a6a8a";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(crossLX, crossY);
    ctx.lineTo(crossRX, crossY);
    ctx.stroke();
    // Highlight
    ctx.strokeStyle = "#6a9aba";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(crossLX, crossY - 0.5 * zoom);
    ctx.lineTo(crossRX, crossY - 0.5 * zoom);
    ctx.stroke();
    // Flow indicator
    const flowGlow = 0.3 + Math.sin(time * 3) * 0.15;
    const flowPhase = (time * 2) % 1;
    const flowX = crossLX + (crossRX - crossLX) * flowPhase;
    ctx.fillStyle = `rgba(0, 200, 255, ${flowGlow})`;
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(flowX, crossY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ========== SCAFFOLDING & SUPPORT STRUCTURE (Level 2+) ==========
  if (tower.level >= 2) {
    const ws = w * 1.15;
    const ds = d * 1.15;
    const scaffBase = screenPos.y + 6 * zoom;
    const scaffTopY = screenPos.y - h * 0.72;
    const scaffH = scaffBase - scaffTopY;

    // 4 isometric diamond vertices at base and top
    const labPostBase = [
      { x: screenPos.x - ws, y: scaffBase },
      { x: screenPos.x, y: scaffBase + ds },
      { x: screenPos.x + ws, y: scaffBase },
      { x: screenPos.x, y: scaffBase - ds },
    ];
    const labPostTop = [
      { x: screenPos.x - ws, y: scaffBase - scaffH },
      { x: screenPos.x, y: scaffBase + ds - scaffH },
      { x: screenPos.x + ws, y: scaffBase - scaffH },
      { x: screenPos.x, y: scaffBase - ds - scaffH },
    ];

    const labFrameLevels = tower.level >= 3 ? [0, 0.3, 0.6, 1] : [0, 0.45, 1];

    const drawLabBeam = (
      ax: number,
      ay: number,
      bx: number,
      by: number,
      thickness: number,
      color: string,
      highlightAlpha: number,
    ) => {
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = (thickness + 1.2) * zoom;
      ctx.beginPath();
      ctx.moveTo(ax, ay + 0.7 * zoom);
      ctx.lineTo(bx, by + 0.7 * zoom);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness * zoom;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      if (highlightAlpha > 0) {
        ctx.strokeStyle = `rgba(120, 220, 255, ${highlightAlpha})`;
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(ax, ay - 0.5 * zoom);
        ctx.lineTo(bx, by - 0.5 * zoom);
        ctx.stroke();
      }
    };

    const drawLabBolt = (
      bx: number,
      by: number,
      radius: number,
      glow: boolean,
    ) => {
      ctx.fillStyle = "#6a8aaa";
      ctx.beginPath();
      ctx.arc(bx, by, radius * zoom, 0, Math.PI * 2);
      ctx.fill();
      if (glow) {
        const boltGlow = 0.35 + Math.sin(time * 3 + bx * 0.1) * 0.2;
        ctx.fillStyle = `rgba(0, 200, 255, ${boltGlow})`;
        ctx.beginPath();
        ctx.arc(bx, by, radius * 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#4a6a8a";
        ctx.beginPath();
        ctx.arc(bx, by, radius * 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // --- Back faces (behind tower: edges 3->0 and 3->2) ---
    for (const frac of labFrameLevels) {
      const hy = scaffH * frac;
      const lv = { x: labPostBase[0].x, y: labPostBase[0].y - hy };
      const bv = { x: labPostBase[3].x, y: labPostBase[3].y - hy };
      const rv = { x: labPostBase[2].x, y: labPostBase[2].y - hy };
      drawLabBeam(bv.x, bv.y, lv.x, lv.y, 2, "#3a5a7a", 0);
      drawLabBeam(bv.x, bv.y, rv.x, rv.y, 2, "#2d4a6a", 0);
    }

    // Back vertical posts
    drawLabBeam(
      labPostBase[3].x,
      labPostBase[3].y,
      labPostTop[3].x,
      labPostTop[3].y,
      2.2,
      "#3a5a7a",
      0,
    );
    drawLabBeam(
      labPostBase[0].x,
      labPostBase[0].y,
      labPostTop[0].x,
      labPostTop[0].y,
      2.2,
      "#3a5a7a",
      0.03,
    );

    // Back X-braces
    if (tower.level >= 3) {
      ctx.strokeStyle = "rgba(60, 90, 120, 0.45)";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(labPostBase[3].x, labPostBase[3].y);
      ctx.lineTo(labPostTop[0].x, labPostTop[0].y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(labPostBase[0].x, labPostBase[0].y);
      ctx.lineTo(labPostTop[3].x, labPostTop[3].y);
      ctx.stroke();
    }

    // --- Front vertical posts ---
    drawLabBeam(
      labPostBase[1].x,
      labPostBase[1].y,
      labPostTop[1].x,
      labPostTop[1].y,
      2.8,
      "#5a8aaa",
      0.08,
    );
    drawLabBeam(
      labPostBase[2].x,
      labPostBase[2].y,
      labPostTop[2].x,
      labPostTop[2].y,
      2.5,
      "#4a7a9a",
      0.06,
    );

    // --- Front horizontal beams (edges 0->1 and 1->2) ---
    for (const frac of labFrameLevels) {
      const hy = scaffH * frac;
      const lv = { x: labPostBase[0].x, y: labPostBase[0].y - hy };
      const fv = { x: labPostBase[1].x, y: labPostBase[1].y - hy };
      const rv = { x: labPostBase[2].x, y: labPostBase[2].y - hy };
      drawLabBeam(lv.x, lv.y, fv.x, fv.y, 2.3, "#5a8aaa", 0.06);
      drawLabBeam(fv.x, fv.y, rv.x, rv.y, 2.3, "#4a7a9a", 0.04);
    }

    // --- Front X-braces ---
    ctx.strokeStyle = "#4a7090";
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(labPostBase[0].x, labPostBase[0].y);
    ctx.lineTo(labPostTop[1].x, labPostTop[1].y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(labPostBase[1].x, labPostBase[1].y);
    ctx.lineTo(labPostTop[0].x, labPostTop[0].y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(labPostBase[1].x, labPostBase[1].y);
    ctx.lineTo(labPostTop[2].x, labPostTop[2].y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(labPostBase[2].x, labPostBase[2].y);
    ctx.lineTo(labPostTop[1].x, labPostTop[1].y);
    ctx.stroke();

    // --- Joint bolts at all intersections ---
    for (const frac of labFrameLevels) {
      const hy = scaffH * frac;
      for (let pi = 0; pi < 4; pi++) {
        const jx = labPostBase[pi].x;
        const jy = labPostBase[pi].y - hy;
        const isFront = pi === 1 || pi === 2;
        drawLabBolt(
          jx,
          jy,
          isFront ? 2.2 : 1.5,
          isFront && frac > 0 && frac < 1,
        );
      }
    }

    // --- Power cables routed along scaffolding with sag ---
    const cableColors = ["#ff5500", "#00ccff", "#ff5500"];
    for (let cable = 0; cable < (tower.level >= 3 ? 3 : 2); cable++) {
      const cableFrac = 0.2 + cable * 0.25;
      const hy = scaffH * cableFrac;
      const sag = (3 + Math.sin(time * 1.8 + cable * 1.2) * 2) * zoom;

      // Left face cable: from left post to front post
      const cLStart = { x: labPostBase[0].x, y: labPostBase[0].y - hy };
      const cLEnd = {
        x: screenPos.x - w * 0.35,
        y: labPostBase[0].y - hy + d * 0.3,
      };
      ctx.strokeStyle = cableColors[cable % cableColors.length];
      ctx.lineWidth = 1.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(cLStart.x, cLStart.y);
      ctx.quadraticCurveTo(
        (cLStart.x + cLEnd.x) / 2,
        (cLStart.y + cLEnd.y) / 2 + sag,
        cLEnd.x,
        cLEnd.y,
      );
      ctx.stroke();

      // Cable connector at start
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.arc(cLStart.x, cLStart.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Right face cable: from right post to front post
      const cRStart = { x: labPostBase[2].x, y: labPostBase[2].y - hy };
      const cREnd = {
        x: screenPos.x + w * 0.35,
        y: labPostBase[2].y - hy + d * 0.3,
      };
      ctx.strokeStyle = cableColors[cable % cableColors.length];
      ctx.beginPath();
      ctx.moveTo(cRStart.x, cRStart.y);
      ctx.quadraticCurveTo(
        (cRStart.x + cREnd.x) / 2,
        (cRStart.y + cREnd.y) / 2 + sag,
        cREnd.x,
        cREnd.y,
      );
      ctx.stroke();

      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.arc(cRStart.x, cRStart.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Capacitor banks mounted at scaffolding joints ---
    const capPositions = [
      { post: 0, frac: 0.35, face: -1 },
      { post: 2, frac: 0.35, face: 1 },
      ...(tower.level >= 3
        ? [
            { post: 0, frac: 0.65, face: -1 },
            { post: 2, frac: 0.65, face: 1 },
          ]
        : []),
    ];
    for (let ci = 0; ci < capPositions.length; ci++) {
      const cp = capPositions[ci];
      const hy = scaffH * cp.frac;
      const capX = labPostBase[cp.post].x;
      const capY = labPostBase[cp.post].y - hy;
      const capW = 4.5 * zoom;
      const capHt = 6 * zoom;
      const capD = 2 * zoom;

      // Left face of capacitor (isometric)
      ctx.fillStyle = ci % 2 === 0 ? "#3a5a7a" : "#4a7a9a";
      ctx.beginPath();
      ctx.moveTo(capX - capW, capY);
      ctx.lineTo(capX, capY + capD);
      ctx.lineTo(capX, capY + capD - capHt);
      ctx.lineTo(capX - capW, capY - capHt);
      ctx.closePath();
      ctx.fill();

      // Right face of capacitor
      ctx.fillStyle = ci % 2 === 0 ? "#2a4a6a" : "#3a6a8a";
      ctx.beginPath();
      ctx.moveTo(capX, capY + capD);
      ctx.lineTo(capX + capW, capY);
      ctx.lineTo(capX + capW, capY - capHt);
      ctx.lineTo(capX, capY + capD - capHt);
      ctx.closePath();
      ctx.fill();

      // Top face
      ctx.fillStyle = "#5a8aaa";
      ctx.beginPath();
      ctx.moveTo(capX - capW, capY - capHt);
      ctx.lineTo(capX, capY + capD - capHt);
      ctx.lineTo(capX + capW, capY - capHt);
      ctx.lineTo(capX, capY - capD - capHt);
      ctx.closePath();
      ctx.fill();

      // Energy indicator glow ring
      const capGlow = 0.4 + Math.sin(time * 3 + ci * 1.5) * 0.25;
      ctx.strokeStyle = `rgba(0, 200, 255, ${capGlow})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        capX,
        capY - capHt * 0.5,
        capW * 0.7,
        capD * 0.7,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Terminal nubs on top
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(
        capX - capW * 0.3,
        capY - capHt - capD * 0.2,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        capX + capW * 0.3,
        capY - capHt - capD * 0.2,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // ========== SECONDARY COIL TOWERS (Level 3+) ==========
  if (tower.level >= 3) {
    const sideCoilHeight = 30 * zoom;
    const sideCoilOffsets = [-w * 1.2, w * 1.2];

    for (const offsetX of sideCoilOffsets) {
      const coilX = screenPos.x + offsetX;
      const coilBaseY = screenPos.y - h * 0.1;

      // Mini coil housing
      ctx.fillStyle = "#2a4a6a";
      ctx.beginPath();
      ctx.moveTo(coilX - 6 * zoom, coilBaseY);
      ctx.lineTo(coilX - 4 * zoom, coilBaseY - sideCoilHeight);
      ctx.lineTo(coilX + 4 * zoom, coilBaseY - sideCoilHeight);
      ctx.lineTo(coilX + 6 * zoom, coilBaseY);
      ctx.closePath();
      ctx.fill();

      // Copper coil rings (gradient-filled like Tesla coil rings)
      const miniCoilTurns = 5;
      for (let mc = 0; mc < miniCoilTurns; mc++) {
        const mcY =
          coilBaseY - (mc / miniCoilTurns) * sideCoilHeight * 0.8 - 4 * zoom;
        const mcRadius = (5 - mc * 0.5) * zoom;
        // Ring shadow (back edge)
        ctx.fillStyle = "rgb(80, 50, 25)";
        ctx.beginPath();
        ctx.ellipse(
          coilX,
          mcY + 1 * zoom,
          mcRadius,
          mcRadius * 0.4,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        // Main ring body with copper gradient
        const sGrad = ctx.createLinearGradient(
          coilX - mcRadius,
          mcY,
          coilX + mcRadius,
          mcY,
        );
        sGrad.addColorStop(0, "rgb(120, 75, 35)");
        sGrad.addColorStop(0.3, "rgb(180, 120, 55)");
        sGrad.addColorStop(0.5, "rgb(220, 160, 80)");
        sGrad.addColorStop(0.7, "rgb(180, 120, 55)");
        sGrad.addColorStop(1, "rgb(120, 75, 35)");
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.ellipse(coilX, mcY, mcRadius, mcRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ring highlight
        ctx.strokeStyle = "rgba(255, 200, 120, 0.7)";
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          coilX,
          mcY - 0.6 * zoom,
          mcRadius * 0.85,
          mcRadius * 0.32,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // Mini coil orb
      const miniOrbPulse = 0.6 + Math.sin(time * 5 + offsetX) * 0.3;
      const miniOrbY = coilBaseY - sideCoilHeight - 5 * zoom;

      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 12 * zoom;
      const miniOrbGrad = ctx.createRadialGradient(
        coilX,
        miniOrbY,
        0,
        coilX,
        miniOrbY,
        5 * zoom,
      );
      miniOrbGrad.addColorStop(0, "#ffffff");
      miniOrbGrad.addColorStop(0.4, "#88ffff");
      miniOrbGrad.addColorStop(1, "#0088ff");
      ctx.fillStyle = miniOrbGrad;
      ctx.beginPath();
      ctx.arc(coilX, miniOrbY, 5 * zoom * miniOrbPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Energy arc from side coil to main tower
      const arcAlpha = 0.4 + Math.sin(time * 6 + offsetX) * 0.3;
      ctx.strokeStyle = `rgba(0, 255, 255, ${arcAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.moveTo(coilX, miniOrbY);
      const midX = screenPos.x + offsetX * 0.3;
      const midY = screenPos.y - h * 0.75;
      ctx.quadraticCurveTo(midX, midY, screenPos.x, screenPos.y - h * 0.85);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Mini arcs from side orbs
      for (let arc = 0; arc < 3; arc++) {
        const arcAngle = time * 4 + arc * ((Math.PI * 2) / 3) + offsetX;
        const arcLen = (8 + Math.sin(time * 7 + arc) * 4) * zoom;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(coilX, miniOrbY);
        const arcEndX = coilX + Math.cos(arcAngle) * arcLen;
        const arcEndY = miniOrbY + Math.sin(arcAngle) * arcLen * 0.5;
        ctx.lineTo(
          (coilX + arcEndX) / 2 + (Math.random() - 0.5) * 4 * zoom,
          (miniOrbY + arcEndY) / 2 + (Math.random() - 0.5) * 2 * zoom,
        );
        ctx.lineTo(arcEndX, arcEndY);
        ctx.stroke();
      }
    }

    // Plasma conduits on the ground
    ctx.strokeStyle = `rgba(0, 255, 200, ${0.4 + Math.sin(time * 3) * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([4 * zoom, 4 * zoom]);
    ctx.lineDashOffset = -time * 25;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 1.5, screenPos.y + 8 * zoom);
    ctx.lineTo(screenPos.x - w * 1.1, screenPos.y + 5 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 1.5, screenPos.y + 8 * zoom);
    ctx.lineTo(screenPos.x + w * 1.1, screenPos.y + 5 * zoom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bundled wiring harness (from side coils to tower body)
    const wireColors = ["#ff4400", "#00bbdd", "#ff6622", "#00ddaa"];
    const wireCount = 4 + tower.level;
    for (let wire = 0; wire < wireCount; wire++) {
      const wireFrac = 0.08 + (wire / wireCount) * 0.55;
      const wireBaseY = screenPos.y - h * wireFrac;
      const wireSag = (2.5 + Math.sin(time * 1.6 + wire * 0.9) * 1.8) * zoom;
      const wireSpread = (wire % 2 === 0 ? 0.5 : -0.5) * zoom;

      ctx.strokeStyle = wireColors[wire % wireColors.length];
      ctx.lineWidth = (0.8 + (wire % 3) * 0.2) * zoom;

      // Left side: from side coil scaffold to tower body
      ctx.beginPath();
      ctx.moveTo(screenPos.x - w * 1.18, wireBaseY + wireSpread);
      ctx.bezierCurveTo(
        screenPos.x - w * 0.95,
        wireBaseY + wireSag + wireSpread,
        screenPos.x - w * 0.75,
        wireBaseY + wireSag * 0.6,
        screenPos.x - w * 0.5,
        wireBaseY + d * 0.15,
      );
      ctx.stroke();

      // Right side
      ctx.beginPath();
      ctx.moveTo(screenPos.x + w * 1.18, wireBaseY - wireSpread);
      ctx.bezierCurveTo(
        screenPos.x + w * 0.95,
        wireBaseY + wireSag - wireSpread,
        screenPos.x + w * 0.75,
        wireBaseY + wireSag * 0.6,
        screenPos.x + w * 0.5,
        wireBaseY + d * 0.15,
      );
      ctx.stroke();
    }

    // Wire bundle clamps at tower body entry points
    for (const side of [-1, 1]) {
      for (let ci = 0; ci < 2; ci++) {
        const clampY = screenPos.y - h * (0.18 + ci * 0.28);
        const clampX = screenPos.x + side * w * 0.52;
        ctx.fillStyle = "#3a5a7a";
        ctx.beginPath();
        ctx.ellipse(
          clampX,
          clampY + d * 0.15,
          3 * zoom,
          1.5 * zoom,
          side * 0.4,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle = "#5a8aaa";
        ctx.lineWidth = 0.6 * zoom;
        ctx.stroke();
      }
    }

    // Rotating plasma field around main tower
    for (let ring = 0; ring < 2; ring++) {
      const ringAngle = time * 2 + ring * Math.PI;
      const ringRadius = w * (0.7 + ring * 0.15);
      const ringAlpha = 0.25 + Math.sin(time * 4 + ring) * 0.15;

      ctx.strokeStyle = `rgba(0, 255, 200, ${ringAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - h * 0.5,
        ringRadius,
        ringRadius * 0.35,
        ringAngle,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Energy particles around main structure
    for (let p = 0; p < 8; p++) {
      const particleAngle = time * 3 + p * ((Math.PI * 2) / 8);
      const particleDist = w * 0.6 + Math.sin(time * 5 + p) * 5 * zoom;
      const particleY = screenPos.y - h * 0.5;
      const px = screenPos.x + Math.cos(particleAngle) * particleDist;
      const py = particleY + Math.sin(particleAngle) * particleDist * 0.35;

      ctx.fillStyle = `rgba(200, 255, 255, ${0.4 + Math.sin(time * 8 + p) * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== LEVEL 4 ENHANCED TECH COMPONENTS ==========
  if (tower.level === 4) {
    const l4TimeSinceFire = Date.now() - tower.lastAttack;
    const l4IsAttacking = l4TimeSinceFire < 400;
    const l4AttackPulse = l4IsAttacking
      ? Math.sin((l4TimeSinceFire / 400) * Math.PI)
      : 0;
    const l4Accent = tower.upgrade === "A" ? "255, 180, 80" : "110, 125, 255";

    // --- REINFORCED STRUCTURAL CROSS-BRACING ---
    ctx.strokeStyle = "#4a7a9a";
    ctx.lineWidth = 2.5 * zoom;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(screenPos.x + side * w * 1.12, screenPos.y + 2 * zoom);
      ctx.lineTo(screenPos.x + side * w * 0.3, screenPos.y - h * 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenPos.x + side * w * 0.3, screenPos.y + 2 * zoom);
      ctx.lineTo(screenPos.x + side * w * 1.12, screenPos.y - h * 0.6);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(${l4Accent}, ${0.5 + Math.sin(time * 3) * 0.2})`;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(
        screenPos.x + side * w * 0.71,
        screenPos.y - h * 0.29,
        2.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // --- ANIMATED PISTONS (corner-mounted, pump faster on attack) ---
    const pistonSlots = [
      { sx: -1.1, sy: 0.18 },
      { sx: 1.1, sy: 0.18 },
      { sx: -1.1, sy: 0.48 },
      { sx: 1.1, sy: 0.48 },
    ];
    for (let pi = 0; pi < pistonSlots.length; pi++) {
      const pp = pistonSlots[pi];
      const pX = screenPos.x + pp.sx * w;
      const pY = screenPos.y - pp.sy * h;
      const pistonExt =
        (3 + Math.sin(time * 2.5 + pi * 1.5) * 2 + l4AttackPulse * 4) * zoom;
      ctx.fillStyle = "#3a5a7a";
      ctx.fillRect(pX - 2.5 * zoom, pY - 8 * zoom, 5 * zoom, 8 * zoom);
      ctx.strokeStyle = "#5a8aaa";
      ctx.lineWidth = 0.7 * zoom;
      ctx.strokeRect(pX - 2.5 * zoom, pY - 8 * zoom, 5 * zoom, 8 * zoom);
      ctx.fillStyle = "#8ab8cc";
      ctx.fillRect(
        pX - 1 * zoom,
        pY - 8 * zoom - pistonExt,
        2 * zoom,
        pistonExt + 2 * zoom,
      );
      ctx.fillStyle = "#5a8aaa";
      ctx.beginPath();
      ctx.ellipse(
        pX,
        pY - 8 * zoom - pistonExt,
        3 * zoom,
        1.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      if (l4AttackPulse > 0.15) {
        ctx.fillStyle = `rgba(${l4Accent}, ${l4AttackPulse * 0.35})`;
        for (let v = 0; v < 3; v++) {
          const vy = ((time * 8 + v * 0.3) % 1) * 5 * zoom;
          ctx.beginPath();
          ctx.arc(
            pX + Math.sin(time * 20 + v * 7) * 2 * zoom,
            pY - 9 * zoom - pistonExt - vy,
            (1.2 + v * 0.3) * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    }

    // --- SUSPENSION INSULATORS (disc stacks hanging from scaffolding) ---
    for (const side of [-1, 1]) {
      const insX = screenPos.x + side * w * 1.08;
      const insTopY = screenPos.y - h * 0.55;
      ctx.strokeStyle = "#6a8aaa";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(insX, insTopY - 2 * zoom);
      ctx.lineTo(insX, insTopY);
      ctx.stroke();
      for (let dd = 0; dd < 4; dd++) {
        const discY = insTopY + dd * 3 * zoom;
        const discR = (3.5 - dd * 0.25) * zoom;
        ctx.fillStyle = dd % 2 === 0 ? "#5a7a9a" : "#4a6a8a";
        ctx.beginPath();
        ctx.ellipse(insX, discY, discR, discR * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${l4Accent}, 0.25)`;
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          insX,
          discY - 0.4 * zoom,
          discR * 0.6,
          discR * 0.2,
          0,
          0,
          Math.PI,
        );
        ctx.stroke();
        if (dd < 3) {
          ctx.fillStyle = "#7aa0b0";
          ctx.fillRect(
            insX - 0.4 * zoom,
            discY + discR * 0.3,
            0.8 * zoom,
            2.2 * zoom,
          );
        }
      }
    }

    // --- VIBRATION DAMPERS (Stockbridge style on power cables) ---
    for (let di = 0; di < 2; di++) {
      const dSide = di === 0 ? -1 : 1;
      const dX = screenPos.x + dSide * w * 0.85;
      const dY = screenPos.y - h * 0.35;
      const swing = Math.sin(time * 3.5 + di * 2.1) * 3 * zoom;
      ctx.fillStyle = "#5a7a9a";
      ctx.fillRect(dX - 1.8 * zoom, dY - 0.8 * zoom, 3.6 * zoom, 1.6 * zoom);
      ctx.strokeStyle = "#7a9ab0";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(dX - 5.5 * zoom, dY + 3.5 * zoom + swing);
      ctx.quadraticCurveTo(
        dX,
        dY + 0.8 * zoom,
        dX + 5.5 * zoom,
        dY + 3.5 * zoom - swing,
      );
      ctx.stroke();
      for (const ws of [-1, 1]) {
        const wX = dX + ws * 5.5 * zoom;
        const wY = dY + 3.5 * zoom + (ws === -1 ? swing : -swing);
        ctx.fillStyle = "#3a5a7a";
        ctx.beginPath();
        ctx.ellipse(wX, wY, 1.8 * zoom, 2.8 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5a8aaa";
        ctx.lineWidth = 0.4 * zoom;
        ctx.stroke();
      }
    }

    // --- CONDUCTOR BUS BARS with current flow ---
    for (const side of [-1, 1]) {
      const barX = screenPos.x + side * w * 0.5;
      const barTop = screenPos.y - h * 0.68;
      const barBot = screenPos.y - h * 0.08;
      ctx.fillStyle = "#b87333";
      ctx.fillRect(barX - 1.2 * zoom, barTop, 2.4 * zoom, barBot - barTop);
      ctx.fillStyle = "#d4944a";
      ctx.fillRect(barX - 0.4 * zoom, barTop, 0.8 * zoom, barBot - barTop);
      for (let cp = 0; cp < 4; cp++) {
        const phase = (time * 3 + cp * 0.25) % 1;
        const cpY = barTop + phase * (barBot - barTop);
        ctx.fillStyle = `rgba(${l4Accent}, ${Math.sin(phase * Math.PI) * 0.7})`;
        ctx.shadowColor = `rgba(${l4Accent}, 0.5)`;
        ctx.shadowBlur = 3 * zoom;
        ctx.beginPath();
        ctx.arc(barX, cpY, 1.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // --- COMPACT WIRE CONNECTIONS with vibration on attack ---
    for (let wi = 0; wi < 3; wi++) {
      const wireY = screenPos.y - h * (0.15 + wi * 0.18);
      const sag = Math.sin(time * 1.5 + wi * 0.7) * 2 * zoom;
      const vibrate = Math.sin(time * 15 + wi * 3) * l4AttackPulse * 1.5 * zoom;
      ctx.strokeStyle = `rgba(${l4Accent}, ${0.3 + Math.sin(time * 2 + wi) * 0.1})`;
      ctx.lineWidth = 1 * zoom;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(screenPos.x + side * w * 0.95, wireY);
        ctx.quadraticCurveTo(
          screenPos.x + side * w * 0.7,
          wireY + sag + vibrate,
          screenPos.x + side * w * 0.4,
          wireY,
        );
        ctx.stroke();
      }
    }
  }

  // ========== ROTATING CAPACITOR DISCS ==========
  const discRotation = time * 3;
  ctx.save();
  ctx.translate(screenPos.x, screenPos.y - h * 0.7);

  // Multiple rotating discs
  for (let disc = 0; disc < tower.level; disc++) {
    const discAngle = discRotation + (disc * Math.PI) / tower.level;
    const discRadius = 6 + disc * 2;
    const discY = disc * 8 * zoom;

    ctx.fillStyle = `rgba(40, 80, 120, ${0.6 - disc * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(
      0,
      discY,
      discRadius * zoom,
      discRadius * 0.4 * zoom,
      discAngle,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Disc edge glow
    ctx.strokeStyle = `rgba(0, 255, 255, ${
      0.5 + Math.sin(time * 5 + disc) * 0.3
    })`;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
  }
  ctx.restore();

  // ========== SURFACE TECH CONDUIT RUNS ==========
  const conduitGlow = 0.3 + Math.sin(time * 2.5) * 0.12;

  for (let i = 1; i <= tower.level + 1; i++) {
    const lineY =
      screenPos.y +
      2 * zoom -
      ((baseHeight - 6) * zoom * i) / (tower.level + 2);

    // Left face conduit — bezier for natural routing
    ctx.strokeStyle = `rgba(0, 200, 255, ${conduitGlow})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - w * 0.15, lineY + d * 0.25);
    ctx.quadraticCurveTo(
      screenPos.x - w * 0.5,
      lineY + d * 0.1 - 1.5 * zoom,
      screenPos.x - w * 0.82,
      lineY - d * 0.18,
    );
    ctx.stroke();

    // Right face conduit
    ctx.beginPath();
    ctx.moveTo(screenPos.x + w * 0.15, lineY + d * 0.25);
    ctx.quadraticCurveTo(
      screenPos.x + w * 0.5,
      lineY + d * 0.1 - 1.5 * zoom,
      screenPos.x + w * 0.82,
      lineY - d * 0.18,
    );
    ctx.stroke();

    // Junction boxes at endpoints
    ctx.fillStyle = "#2a5a7a";
    ctx.fillRect(
      screenPos.x - w * 0.85 - 1.5 * zoom,
      lineY - d * 0.2 - 1 * zoom,
      3 * zoom,
      2 * zoom,
    );
    ctx.fillRect(
      screenPos.x + w * 0.82 - 1.5 * zoom,
      lineY - d * 0.2 - 1 * zoom,
      3 * zoom,
      2 * zoom,
    );
  }

  // ========== RADIATOR UNITS (isometric heat exchangers) ==========
  for (const side of [-1, 1]) {
    const radX = screenPos.x + side * w * 0.75;
    const radY = screenPos.y - h * 0.15;
    const radW = 5 * zoom;
    const radHt = 14 * zoom;

    // Radiator body (isometric box)
    const radDOff = 2 * zoom;
    // Left face
    ctx.fillStyle = side === -1 ? "#1a4a6a" : "#153d5a";
    ctx.beginPath();
    ctx.moveTo(radX - radW, radY);
    ctx.lineTo(radX, radY + radDOff);
    ctx.lineTo(radX, radY + radDOff - radHt);
    ctx.lineTo(radX - radW, radY - radHt);
    ctx.closePath();
    ctx.fill();
    // Right face
    ctx.fillStyle = side === -1 ? "#153d5a" : "#1a4a6a";
    ctx.beginPath();
    ctx.moveTo(radX, radY + radDOff);
    ctx.lineTo(radX + radW, radY);
    ctx.lineTo(radX + radW, radY - radHt);
    ctx.lineTo(radX, radY + radDOff - radHt);
    ctx.closePath();
    ctx.fill();
    // Top face
    ctx.fillStyle = "#2a5a7a";
    ctx.beginPath();
    ctx.moveTo(radX - radW, radY - radHt);
    ctx.lineTo(radX, radY + radDOff - radHt);
    ctx.lineTo(radX + radW, radY - radHt);
    ctx.lineTo(radX, radY - radDOff - radHt);
    ctx.closePath();
    ctx.fill();

    // Radiator fins (horizontal lines)
    ctx.strokeStyle = "rgba(30, 80, 120, 0.5)";
    ctx.lineWidth = 0.5 * zoom;
    for (let fin = 1; fin < 8; fin++) {
      const finT = fin / 8;
      const finY = radY - radHt * finT;
      ctx.beginPath();
      ctx.moveTo(radX - radW, finY);
      ctx.lineTo(radX, finY + radDOff);
      ctx.lineTo(radX + radW, finY);
      ctx.stroke();
    }

    // Coolant inlet/outlet pipes
    ctx.fillStyle = "#3a6a8a";
    ctx.beginPath();
    ctx.arc(radX, radY - radHt - radDOff + zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(radX, radY + radDOff - zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Heat shimmer glow
    const heatGlow = 0.15 + Math.sin(time * 3 + side * 2) * 0.1;
    ctx.fillStyle = `rgba(0, 200, 255, ${heatGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      radX,
      radY - radHt * 0.5,
      radW * 1.3,
      radHt * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Exhaust vents (louvered openings on the tower face) — isometric flush
  for (let i = 0; i < tower.level; i++) {
    const ventY = screenPos.y - h * 0.3 - i * 12 * zoom;
    for (const side of [-1, 1]) {
      const ventX = screenPos.x + side * w * 0.55;
      const face = side === -1 ? "left" as const : "right" as const;
      drawIsoFlushVent(ctx, ventX, ventY, 5, 3, face, zoom, {
        frameColor: "#1a3545",
        bgColor: "#0a2030",
        slatColor: "#2a5a75",
        slats: 3,
      });
      const ventGlow = 0.25 + Math.sin(time * 4 + i * 0.5 + side) * 0.15;
      ctx.fillStyle = `rgba(0, 200, 255, ${ventGlow})`;
      traceIsoFlushRect(ctx, ventX, ventY, 4, 2.1, face, zoom);
      ctx.fill();
    }
  }

  // ========== PCB CIRCUIT TRACES WITH ANIMATED CURRENT ==========
  // Multi-path circuit traces (more complex routing)
  for (const side of [-1, 1]) {
    const traceX0 = screenPos.x + side * w * 0.35;
    const traceX1 = screenPos.x + side * w * 0.55;
    const traceX2 = screenPos.x + side * w * 0.72;

    // Main vertical trace
    ctx.strokeStyle = "#4a7a9a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(traceX0, screenPos.y - h * 0.15);
    ctx.lineTo(traceX0, screenPos.y - h * 0.35);
    ctx.stroke();

    // Horizontal branch
    ctx.beginPath();
    ctx.moveTo(traceX0, screenPos.y - h * 0.35);
    ctx.lineTo(traceX1, screenPos.y - h * 0.38);
    ctx.stroke();

    // Diagonal branch to node
    ctx.beginPath();
    ctx.moveTo(traceX1, screenPos.y - h * 0.38);
    ctx.lineTo(traceX2, screenPos.y - h * 0.48);
    ctx.stroke();

    // Secondary trace (thinner)
    ctx.strokeStyle = "#3a6a8a";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(traceX0 + side * 3 * zoom, screenPos.y - h * 0.2);
    ctx.lineTo(traceX0 + side * 3 * zoom, screenPos.y - h * 0.32);
    ctx.lineTo(traceX1, screenPos.y - h * 0.42);
    ctx.stroke();

    // Animated current pulse traveling along trace
    const currentPhase = (time * 2.5 + (side > 0 ? 0.5 : 0)) % 1;
    let cpX: number, cpY: number;
    if (currentPhase < 0.4) {
      const t = currentPhase / 0.4;
      cpX = traceX0;
      cpY = screenPos.y - h * (0.15 + t * 0.2);
    } else if (currentPhase < 0.7) {
      const t = (currentPhase - 0.4) / 0.3;
      cpX = traceX0 + (traceX1 - traceX0) * t;
      cpY =
        screenPos.y -
        h * 0.35 +
        (screenPos.y - h * 0.38 - (screenPos.y - h * 0.35)) * t;
    } else {
      const t = (currentPhase - 0.7) / 0.3;
      cpX = traceX1 + (traceX2 - traceX1) * t;
      cpY =
        screenPos.y -
        h * 0.38 +
        (screenPos.y - h * 0.48 - (screenPos.y - h * 0.38)) * t;
    }

    const pulseAlpha = Math.sin(currentPhase * Math.PI) * 0.8;
    ctx.fillStyle = `rgba(0, 220, 255, ${pulseAlpha})`;
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 5 * zoom;
    ctx.beginPath();
    ctx.arc(cpX, cpY, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Terminal node at end
    const nodeGlow = 0.5 + Math.sin(time * 4 + side * 2) * 0.25;
    ctx.fillStyle = "#2a5a7a";
    ctx.beginPath();
    ctx.arc(traceX2, screenPos.y - h * 0.48, 3.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(0, 220, 255, ${nodeGlow})`;
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(traceX2, screenPos.y - h * 0.48, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // SMD component pads along traces
    ctx.fillStyle = "#5a8aaa";
    const padPositions = [0.22, 0.28, 0.33];
    for (const padT of padPositions) {
      const padY = screenPos.y - h * padT;
      ctx.fillRect(
        traceX0 - 1.5 * zoom,
        padY - 0.8 * zoom,
        3 * zoom,
        1.6 * zoom,
      );
    }
  }

  // ========== DIAGNOSTIC DISPLAY PANEL ==========
  const dispX = screenPos.x;
  const dispY = screenPos.y - h * 0.38;
  const dispW = 12 * zoom;
  const dispH = 10 * zoom;

  // Panel housing
  ctx.fillStyle = "#0a1a28";
  ctx.fillRect(dispX - dispW * 0.5, dispY, dispW, dispH);
  // Beveled frame
  ctx.strokeStyle = "#3a6a8a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(dispX - dispW * 0.5, dispY, dispW, dispH);
  // Inner bezel
  ctx.strokeStyle = "#2a5a75";
  ctx.lineWidth = 0.5 * zoom;
  ctx.strokeRect(
    dispX - dispW * 0.5 + 1.5 * zoom,
    dispY + 1.5 * zoom,
    dispW - 3 * zoom,
    dispH - 3 * zoom,
  );

  // Screen content — scrolling hex data
  const screenGlow = 0.6 + Math.sin(time * 3) * 0.2;
  ctx.fillStyle = `rgba(0, 200, 255, ${screenGlow * 0.7})`;
  ctx.font = `${3.5 * zoom}px monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const hexChars = "0123456789ABCDEF";
  for (let row = 0; row < 3; row++) {
    let hexStr = "";
    for (let ch = 0; ch < 4; ch++) {
      const idx = Math.floor(
        (Math.sin(time * 4 + row * 2.3 + ch * 1.7) * 0.5 + 0.5) * 16,
      );
      hexStr += hexChars[idx % 16];
    }
    ctx.fillText(
      hexStr,
      dispX - dispW * 0.4,
      dispY + 2.5 * zoom + row * 3 * zoom,
    );
  }

  // Waveform overlay
  ctx.strokeStyle = `rgba(0, 255, 255, ${screenGlow})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const waveX = dispX - dispW * 0.4 + i * 1.1 * zoom;
    const waveY =
      dispY + dispH * 0.75 + Math.sin(time * 8 + i * 0.9) * 1.5 * zoom;
    if (i === 0) ctx.moveTo(waveX, waveY);
    else ctx.lineTo(waveX, waveY);
  }
  ctx.stroke();

  // Status LED
  const ledOn = Math.sin(time * 6) > 0;
  ctx.fillStyle = ledOn ? "rgba(0, 255, 100, 0.8)" : "rgba(0, 60, 30, 0.5)";
  ctx.beginPath();
  ctx.arc(dispX + dispW * 0.35, dispY + 2.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // ========== HAZARD BEACON LIGHTS ==========
  const beaconPositions = [
    { x: screenPos.x - w * 0.85, y: screenPos.y - h * 0.1, phase: 0 },
    { x: screenPos.x + w * 0.85, y: screenPos.y - h * 0.1, phase: 0.3 },
  ];
  for (const bp of beaconPositions) {
    // Beacon mount
    ctx.fillStyle = "#3a5a7a";
    ctx.fillRect(bp.x - 1.5 * zoom, bp.y, 3 * zoom, 3 * zoom);

    // Beacon dome
    ctx.fillStyle = "#2a4a6a";
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Rotating beam effect
    const beamAngle = time * 5 + bp.phase * Math.PI * 2;
    const beamAlpha = 0.4 + Math.sin(beamAngle) * 0.3;
    ctx.fillStyle = `rgba(0, 200, 255, ${beamAlpha})`;
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 5 * zoom;
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Beacon lens highlight
    ctx.fillStyle = "rgba(150, 230, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(bp.x - 0.5 * zoom, bp.y - 0.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  const topY = screenPos.y - baseHeight * zoom;

  // ========== TOP RAILING BACK HALF (behind coil/beam) ==========
  const labTopRailY = topY + 4 * zoom;
  const labTopRailRX = w * 0.88;
  const labTopRailRY = d * 0.88;
  const labTopRailH = 5 * zoom;
  const labTopRailColors = {
    rail: "#2a6a8a",
    topRail: "#3a8aaa",
    backPanel: "rgba(45, 90, 123, 0.35)",
    frontPanel: "rgba(45, 90, 123, 0.25)",
  };
  drawIsometricRailing(
    ctx,
    screenPos.x,
    labTopRailY,
    labTopRailRX,
    labTopRailRY,
    labTopRailH,
    32,
    16,
    labTopRailColors,
    zoom,
    "back",
  );

  if (tower.level === 4 && tower.upgrade === "A") {
    renderFocusedBeam(
      ctx,
      screenPos,
      topY,
      tower,
      zoom,
      time,
      enemies,
      selectedMap,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );
  } else if (tower.level === 4 && tower.upgrade === "B") {
    renderChainLightning(ctx, screenPos, topY, tower, zoom, time);
  } else {
    renderTeslaCoil(
      ctx,
      screenPos,
      topY,
      tower,
      zoom,
      time,
      enemies,
      selectedMap,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );
  }

  // ========== TOP RAILING FRONT HALF (in front of coil/beam) ==========
  // For 4B, the front railing is drawn inside renderChainLightning before sub-coils
  if (!(tower.level === 4 && tower.upgrade === "B")) {
    drawIsometricRailing(
      ctx,
      screenPos.x,
      labTopRailY,
      labTopRailRX,
      labTopRailRY,
      labTopRailH,
      32,
      16,
      labTopRailColors,
      zoom,
      "front",
    );
  }

  ctx.restore();
}

