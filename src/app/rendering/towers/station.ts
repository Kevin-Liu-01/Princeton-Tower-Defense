import type { Tower, Position } from "../../types";
import { ISO_ANGLE, ISO_PRISM_D_FACTOR, ISO_Y_RATIO } from "../../constants";
import { darkenColor } from "../../utils";
import {
  drawIsometricPrism,
  drawIsoDiamond,
  drawIsoGothicWindow,
  drawIsoFlushSlit,
  drawIsoFlushRect,
  drawMerlon,
} from "./towerHelpers";
import { renderDinkyTrains } from "./dinkyTrains";

function drawWeathervane(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const vaneX =
    tower.level === 4 && tower.upgrade === "A"
      ? screenPos.x - 16 * zoom
      : tower.level === 4 && tower.upgrade === "B"
        ? screenPos.x - 16 * zoom
        : screenPos.x - 28 * zoom;
  const vaneY =
    tower.level === 4 && tower.upgrade === "A"
      ? screenPos.y - 72 * zoom
      : tower.level === 4 && tower.upgrade === "B"
        ? screenPos.y - 68 * zoom
        : screenPos.y - (38 + tower.level * 5) * zoom;
  const vaneAngle = Math.sin(time * 0.6) * 0.8 + Math.sin(time * 1.7) * 0.3;
  const vaneIsHighLevel = tower.level >= 4;
  const vanePoleColor = vaneIsHighLevel
    ? "#c9a227"
    : tower.level >= 3
      ? "#6a6a72"
      : "#b87333";
  const vaneArmLen = vaneIsHighLevel ? 5 : 7;
  const vaneHeadScale = vaneIsHighLevel ? 1 : 1.4;
  const vaneTailScale = vaneIsHighLevel ? 1 : 1.4;

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(vaneX + 0.5 * zoom, vaneY + 6.5 * zoom);
  ctx.lineTo(vaneX + 0.5 * zoom, vaneY + 0.5 * zoom);
  ctx.stroke();

  ctx.strokeStyle = vanePoleColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(vaneX, vaneY + 6 * zoom);
  ctx.lineTo(vaneX, vaneY);
  ctx.stroke();

  ctx.fillStyle = vaneIsHighLevel ? "#e8c847" : "#d4a853";
  ctx.beginPath();
  ctx.arc(vaneX, vaneY, 1.8 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.arc(vaneX - 0.4 * zoom, vaneY - 0.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(vaneX, vaneY + 2 * zoom);
  const vaneDirX = Math.cos(vaneAngle);
  const vaneDirY = Math.sin(vaneAngle) * 0.4;

  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    -vaneDirX * vaneArmLen * zoom + 0.5,
    -vaneDirY * vaneArmLen * zoom + 0.5,
  );
  ctx.lineTo(
    vaneDirX * vaneArmLen * zoom + 0.5,
    vaneDirY * vaneArmLen * zoom + 0.5,
  );
  ctx.stroke();

  ctx.strokeStyle = vaneIsHighLevel ? "#c9a227" : "#c48a30";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-vaneDirX * vaneArmLen * zoom, -vaneDirY * vaneArmLen * zoom);
  ctx.lineTo(vaneDirX * vaneArmLen * zoom, vaneDirY * vaneArmLen * zoom);
  ctx.stroke();

  ctx.fillStyle = vaneIsHighLevel ? "#c9a227" : "#c48a30";
  ctx.beginPath();
  ctx.moveTo(vaneDirX * vaneArmLen * zoom, vaneDirY * vaneArmLen * zoom);
  ctx.lineTo(
    vaneDirX * (vaneArmLen - 2) * zoom - vaneDirY * 2.5 * vaneHeadScale * zoom,
    vaneDirY * (vaneArmLen - 2) * zoom + vaneDirX * 1.5 * vaneHeadScale * zoom,
  );
  ctx.lineTo(
    vaneDirX * (vaneArmLen - 2) * zoom + vaneDirY * 2.5 * vaneHeadScale * zoom,
    vaneDirY * (vaneArmLen - 2) * zoom - vaneDirX * 1.5 * vaneHeadScale * zoom,
  );
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = vaneIsHighLevel ? "#e8c847" : "#d4a853";
  ctx.beginPath();
  ctx.moveTo(-vaneDirX * vaneArmLen * zoom, -vaneDirY * vaneArmLen * zoom);
  ctx.lineTo(
    -vaneDirX * (vaneArmLen - 1) * zoom - vaneDirY * 3.5 * vaneTailScale * zoom,
    -vaneDirY * (vaneArmLen - 1) * zoom + vaneDirX * 2 * vaneTailScale * zoom,
  );
  ctx.lineTo(
    -vaneDirX * (vaneArmLen - 1) * zoom + vaneDirY * 3.5 * vaneTailScale * zoom,
    -vaneDirY * (vaneArmLen - 1) * zoom - vaneDirX * 2 * vaneTailScale * zoom,
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function renderStationTower(
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

  ctx.save();
  // Shift the entire building up slightly
  screenPos = { x: screenPos.x, y: screenPos.y - 10 * zoom };

  // Base dimensions - scaled by level
  const baseW = 56 + tower.level * 6;
  const baseD = 44 + tower.level * 5;

  // Isometric conversion factors
  const isoW = baseW * zoom * 0.5;
  const isoD = baseD * zoom * ISO_PRISM_D_FACTOR;

  // ========== FOUNDATION (proper isometric diamond aligned with grid) ==========
  const stationDiamond = (
    cx: number,
    cy: number,
    w: number,
    d: number,
    h: number,
    topColor: string,
    leftColor: string,
    rightColor: string,
  ) =>
    drawIsoDiamond(ctx, cx, cy, w, d, h, topColor, leftColor, rightColor, zoom);

  // ========== LEVEL-SPECIFIC THEMED BASE ==========
  if (tower.level === 1) {
    // BARRACKS BASE - Wooden military camp platform with detailed texturing

    // Bottom dirt/stone foundation layer (thick, matching L2/L3 pattern)
    stationDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 22,
      baseD + 34,
      12,
      "#4a3a2a",
      "#3a2a1a",
      "#2a1a0a",
    );

    // Heavy iron bands on bottom foundation
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 22) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 34) * zoom * 0.25 + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 22) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 22) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 34) * zoom * 0.25 + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 22) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.stroke();

    // Foundation corner bolts
    ctx.fillStyle = "#6a5a4a";
    const l1FoundCorners = [
      {
        x: screenPos.x - (baseW + 22) * zoom * 0.5,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x + (baseW + 22) * zoom * 0.5,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 34) * zoom * ISO_PRISM_D_FACTOR + 12 * zoom,
      },
    ];
    for (const bolt of l1FoundCorners) {
      ctx.beginPath();
      ctx.arc(bolt.x, bolt.y, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.arc(bolt.x, bolt.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6a5a4a";
    }

    // Middle wooden plank platform (thick mid-tier)
    stationDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 12,
      baseD + 22,
      8,
      "#6b5030",
      "#5a4020",
      "#4a3010",
    );

    // Edge highlight on middle tier
    ctx.strokeStyle = "#7a6040";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 12) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 22) * zoom * 0.25 + 1 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 12) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();

    // Wooden planks texture on left face (horizontal boards)
    ctx.strokeStyle = "#4a3010";
    ctx.lineWidth = 0.8 * zoom;
    const midHw = (baseW + 12) * zoom * 0.5;
    const midHd = (baseD + 22) * zoom * 0.25;
    const midHh = 8 * zoom;
    const midCy = screenPos.y + 8 * zoom;
    const plankMargin = 2 * zoom;

    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const leftEdgeY = midCy - midHh + t * midHh;
      const startX = screenPos.x - midHw + plankMargin;
      const endX = screenPos.x - plankMargin;
      ctx.beginPath();
      ctx.moveTo(startX, leftEdgeY + (plankMargin * midHd) / midHw);
      ctx.lineTo(endX, leftEdgeY + ((midHw - plankMargin) * midHd) / midHw);
      ctx.stroke();
    }

    // Wooden planks texture on right face
    ctx.strokeStyle = "#2a1a05";
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const rLeftEdgeY = midCy - midHh + midHd + t * midHh;
      const startX = screenPos.x + plankMargin;
      const endX = screenPos.x + midHw - plankMargin;
      ctx.beginPath();
      ctx.moveTo(startX, rLeftEdgeY - (plankMargin * midHd) / midHw);
      ctx.lineTo(endX, rLeftEdgeY - ((midHw - plankMargin) * midHd) / midHw);
      ctx.stroke();
    }

    // Metal corner brackets on wooden platform
    ctx.fillStyle = "#7a6a5a";
    const bracketPositions = [
      {
        x: screenPos.x - (baseW + 10) * zoom * 0.5,
        y: screenPos.y + 2 * zoom,
      },
      {
        x: screenPos.x + (baseW + 10) * zoom * 0.5,
        y: screenPos.y + 2 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 18) * zoom * ISO_PRISM_D_FACTOR + 2 * zoom,
      },
    ];
    for (const bracket of bracketPositions) {
      ctx.beginPath();
      ctx.moveTo(bracket.x, bracket.y);
      ctx.lineTo(bracket.x - 3 * zoom, bracket.y + 4 * zoom);
      ctx.lineTo(bracket.x + 3 * zoom, bracket.y + 4 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // Nails/bolts on brackets
    ctx.fillStyle = "#4a3a2a";
    for (const bracket of bracketPositions) {
      ctx.beginPath();
      ctx.arc(bracket.x, bracket.y + 2 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top wooden deck (thicker, matching L2/L3 tier pattern)
    stationDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 4,
      baseD + 12,
      6,
      "#8b7355",
      "#7a6244",
      "#695133",
    );

    // Deck plank lines (proper isometric direction)
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 0.8 * zoom;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 2) * zoom * 0.5 + i * 4 * zoom,
        screenPos.y - 4 * zoom - i * 2 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 4 * zoom,
        screenPos.y +
          (baseD + 8) * zoom * ISO_PRISM_D_FACTOR -
          4 * zoom -
          i * 2 * zoom,
      );
      ctx.stroke();
    }

    // Deck edge trim
    ctx.strokeStyle = "#6b5030";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 2) * zoom * 0.5, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 8) * zoom * 0.25 - 4 * zoom);
    ctx.lineTo(screenPos.x + (baseW + 2) * zoom * 0.5, screenPos.y - 4 * zoom);
    ctx.stroke();

    // Corner posts
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(
      screenPos.x - (baseW + 2) * zoom * 0.5 - 2 * zoom,
      screenPos.y - 8 * zoom,
      4 * zoom,
      8 * zoom,
    );
    ctx.fillRect(
      screenPos.x + (baseW + 2) * zoom * 0.5 - 2 * zoom,
      screenPos.y - 8 * zoom,
      4 * zoom,
      8 * zoom,
    );

    // Corner post caps
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.arc(
      screenPos.x - (baseW + 2) * zoom * 0.5,
      screenPos.y - 8 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      screenPos.x + (baseW + 2) * zoom * 0.5,
      screenPos.y - 8 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Small weapon rack (left side)
    const rackX = screenPos.x - isoW * 0.6 - 12 * zoom;
    const rackY = screenPos.y + 22 * zoom;
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(rackX - 2 * zoom, rackY - 12 * zoom, 4 * zoom, 12 * zoom);
    ctx.fillRect(rackX - 4 * zoom, rackY - 12 * zoom, 8 * zoom, 2 * zoom);
    // Spears on rack
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(rackX - 2 * zoom, rackY - 10 * zoom);
    ctx.lineTo(rackX - 2 * zoom, rackY - 20 * zoom);
    ctx.moveTo(rackX + 2 * zoom, rackY - 10 * zoom);
    ctx.lineTo(rackX + 2 * zoom, rackY - 20 * zoom);
    ctx.stroke();
    ctx.fillStyle = "#aaaaaa";
    ctx.beginPath();
    ctx.moveTo(rackX - 2 * zoom, rackY - 22 * zoom);
    ctx.lineTo(rackX - 3.5 * zoom, rackY - 19 * zoom);
    ctx.lineTo(rackX - 0.5 * zoom, rackY - 19 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rackX + 2 * zoom, rackY - 22 * zoom);
    ctx.lineTo(rackX + 0.5 * zoom, rackY - 19 * zoom);
    ctx.lineTo(rackX + 3.5 * zoom, rackY - 19 * zoom);
    ctx.closePath();
    ctx.fill();

    // Supply crate (right side)
    const crateX = screenPos.x + isoW * 0.5;
    const crateY = screenPos.y + 2 * zoom;
    drawIsometricPrism(
      ctx,
      crateX,
      crateY,
      8,
      7,
      6,
      { top: "#7a6040", left: "#5a4020", right: "#4a3010" },
      zoom,
    );
    ctx.strokeStyle = "#3a2010";
    ctx.lineWidth = 0.8 * zoom;
    ctx.strokeRect(crateX - 3 * zoom, crateY - 8 * zoom, 6 * zoom, 4 * zoom);

    // Barrel
    ctx.fillStyle = "#6b5030";
    ctx.beginPath();
    ctx.ellipse(
      crateX + 8 * zoom,
      crateY - 2 * zoom,
      3 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(crateX + 5 * zoom, crateY - 8 * zoom, 6 * zoom, 6 * zoom);

    // === LEVEL 1 ENHANCEMENTS: Training Equipment & Lived-in Details ===

    // Hanging shields on wall
    const shieldWallX = screenPos.x - isoW * 0.3;
    const shieldWallY = screenPos.y - 8 * zoom;
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    ctx.moveTo(shieldWallX - 4 * zoom, shieldWallY - 6 * zoom);
    ctx.lineTo(shieldWallX - 6 * zoom, shieldWallY);
    ctx.lineTo(shieldWallX - 4 * zoom, shieldWallY + 4 * zoom);
    ctx.lineTo(shieldWallX - 2 * zoom, shieldWallY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a2a0a";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Sandbags for defense training
    ctx.fillStyle = "#9b8b7b";
    for (let sb = 0; sb < 3; sb++) {
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x + isoW * 0.2 + sb * 4 * zoom,
        screenPos.y + 10 * zoom - sb * 2 * zoom,
        4 * zoom,
        2 * zoom,
        0.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Campfire with animated flames
    const fireX = screenPos.x - isoW * 0.8;
    const fireY = screenPos.y + 8 * zoom;
    // Fire pit stones
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.ellipse(fireX, fireY, 5 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Logs
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(fireX - 3 * zoom, fireY - 1 * zoom, 6 * zoom, 2 * zoom);
    // Animated fire
    const fireFlicker = 0.6 + Math.sin(time * 8) * 0.3;
    ctx.fillStyle = `rgba(255, 150, 50, ${fireFlicker})`;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(fireX - 2 * zoom, fireY - 2 * zoom);
    ctx.quadraticCurveTo(
      fireX,
      fireY - 8 * zoom - Math.sin(time * 10) * 2,
      fireX + 2 * zoom,
      fireY - 2 * zoom,
    );
    ctx.fill();
    ctx.fillStyle = `rgba(255, 200, 100, ${fireFlicker * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(fireX - 1 * zoom, fireY - 2 * zoom);
    ctx.quadraticCurveTo(
      fireX,
      fireY - 5 * zoom - Math.sin(time * 12) * 1.5,
      fireX + 1 * zoom,
      fireY - 2 * zoom,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (tower.level === 2) {
    // GARRISON BASE - Stone military platform with detailed masonry

    // Foundation stone - heavy base
    stationDiamond(
      screenPos.x,
      screenPos.y + 17 * zoom,
      baseW + 20,
      baseD + 34,
      10,
      "#4a4a52",
      "#3a3a42",
      "#2a2a32",
    );

    // Metal reinforcement bands on foundation
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 20) * zoom * 0.5,
      screenPos.y + 12 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 34) * zoom * 0.25 + 12 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x,
      screenPos.y + (baseD + 34) * zoom * 0.25 + 12 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 20) * zoom * 0.5,
      screenPos.y + 12 * zoom,
    );
    ctx.stroke();

    // Foundation corner reinforcements
    ctx.fillStyle = "#6a6a72";
    const foundCorners = [
      {
        x: screenPos.x - (baseW + 20) * zoom * 0.5,
        y: screenPos.y + 9 * zoom,
      },
      {
        x: screenPos.x + (baseW + 20) * zoom * 0.5,
        y: screenPos.y + 9 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 34) * zoom * ISO_PRISM_D_FACTOR + 9 * zoom,
      },
    ];
    for (const corner of foundCorners) {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Inner bolt
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6a6a72";
    }

    // Cobblestone layer
    stationDiamond(
      screenPos.x,
      screenPos.y + 7 * zoom,
      baseW + 12,
      baseD + 24,
      7,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42",
    );

    // Layer edge highlight
    ctx.strokeStyle = "#7a7a82";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 12) * zoom * 0.5, screenPos.y + zoom);
    ctx.lineTo(screenPos.x, screenPos.y + (baseD + 24) * zoom * 0.25 + zoom);
    ctx.lineTo(screenPos.x + (baseW + 12) * zoom * 0.5, screenPos.y + zoom);
    ctx.stroke();

    // Top stone platform
    stationDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 4,
      baseD + 14,
      5,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52",
    );

    // Top platform flagstone pattern
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = -2; i <= 2; i++) {
      // Diagonal lines one direction
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 4) * zoom * 0.5 + i * 6 * zoom,
        screenPos.y - 5 * zoom - i * 3 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 6 * zoom,
        screenPos.y +
          (baseD + 14) * zoom * ISO_PRISM_D_FACTOR -
          5 * zoom -
          i * 3 * zoom,
      );
      ctx.stroke();
      // Diagonal lines other direction
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x + (baseW + 4) * zoom * 0.5 + i * 6 * zoom,
        screenPos.y - 5 * zoom + i * 3 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 6 * zoom,
        screenPos.y +
          (baseD + 14) * zoom * ISO_PRISM_D_FACTOR -
          5 * zoom +
          i * 3 * zoom,
      );
      ctx.stroke();
    }

    // Platform edge trim with beveled look
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 4) * zoom * 0.5, screenPos.y - 5 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 14) * zoom * 0.25 - 5 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 4) * zoom * 0.5, screenPos.y - 5 * zoom);
    ctx.stroke();

    // Decorative corner pillars
    ctx.fillStyle = "#5a5a62";
    drawIsometricPrism(
      ctx,
      screenPos.x - (baseW + 4) * zoom * 0.5,
      screenPos.y - 2 * zoom,
      4,
      4,
      8,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );
    drawIsometricPrism(
      ctx,
      screenPos.x + (baseW + 4) * zoom * 0.5,
      screenPos.y - 2 * zoom,
      4,
      4,
      8,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Pillar caps
    ctx.fillStyle = "#8a8a92";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - (baseW + 4) * zoom * 0.5,
      screenPos.y - 10 * zoom,
      3 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + (baseW + 4) * zoom * 0.5,
      screenPos.y - 10 * zoom,
      3 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Armor stand (left)
    const armorX = screenPos.x - isoW * 0.6;
    const armorY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(armorX - 1.5 * zoom, armorY - 14 * zoom, 3 * zoom, 14 * zoom);
    // Armor body
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.moveTo(armorX, armorY - 18 * zoom);
    ctx.lineTo(armorX - 5 * zoom, armorY - 12 * zoom);
    ctx.lineTo(armorX - 4 * zoom, armorY - 6 * zoom);
    ctx.lineTo(armorX + 4 * zoom, armorY - 6 * zoom);
    ctx.lineTo(armorX + 5 * zoom, armorY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    // Helmet
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.arc(armorX, armorY - 20 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Orange plume
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.ellipse(
      armorX,
      armorY - 24 * zoom,
      1.5 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Shield rack (right)
    const shieldX = screenPos.x + isoW * 0.5;
    const shieldY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(shieldX - 2 * zoom, shieldY - 10 * zoom, 4 * zoom, 10 * zoom);
    // Shields
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(shieldX - 6 * zoom, shieldY - 16 * zoom);
    ctx.lineTo(shieldX - 10 * zoom, shieldY - 10 * zoom);
    ctx.lineTo(shieldX - 6 * zoom, shieldY - 4 * zoom);
    ctx.lineTo(shieldX - 2 * zoom, shieldY - 10 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Supply crates
    drawIsometricPrism(
      ctx,
      shieldX + 8 * zoom,
      shieldY,
      7,
      6,
      5,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );

    // === LEVEL 2 ENHANCEMENTS: Military Outpost Details ===

    // Defensive sandbag wall
    ctx.fillStyle = "#8a7a6a";
    for (let row = 0; row < 2; row++) {
      for (let sb = 0; sb < 4; sb++) {
        const sbX = screenPos.x + isoW * 0.4 + sb * 5 * zoom - row * 2 * zoom;
        const sbY = screenPos.y + 12 * zoom - row * 3 * zoom;
        ctx.beginPath();
        ctx.ellipse(sbX, sbY, 4 * zoom, 2 * zoom, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Mounted crossbow on wall
    const crossbowX = screenPos.x - isoW * 0.7;
    const crossbowY = screenPos.y - 2 * zoom;
    // Mount
    ctx.fillStyle = "#5a5a62";
    ctx.fillRect(
      crossbowX - 2 * zoom,
      crossbowY - 8 * zoom,
      4 * zoom,
      8 * zoom,
    );
    // Crossbow body
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(
      crossbowX - 1 * zoom,
      crossbowY - 14 * zoom,
      2 * zoom,
      6 * zoom,
    );
    // Crossbow arms
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(crossbowX - 6 * zoom, crossbowY - 12 * zoom);
    ctx.lineTo(crossbowX, crossbowY - 14 * zoom);
    ctx.lineTo(crossbowX + 6 * zoom, crossbowY - 12 * zoom);
    ctx.stroke();
    // Bowstring
    ctx.strokeStyle = "#8a7a6a";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(crossbowX - 5 * zoom, crossbowY - 12 * zoom);
    ctx.lineTo(crossbowX + 5 * zoom, crossbowY - 12 * zoom);
    ctx.stroke();

    // Weapon barrels
    const barrelX = screenPos.x + isoW * 0.8;
    const barrelY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(barrelX, barrelY, 4 * zoom, 2.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.ellipse(
      barrelX,
      barrelY - 8 * zoom,
      3.5 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Barrel bands
    ctx.strokeStyle = "#7a6a5a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      barrelX,
      barrelY - 2 * zoom,
      3.8 * zoom,
      2.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(
      barrelX,
      barrelY - 6 * zoom,
      3.6 * zoom,
      2.1 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    // Swords sticking out of barrel
    ctx.strokeStyle = "#9a9a9a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(barrelX - 1 * zoom, barrelY - 8 * zoom);
    ctx.lineTo(barrelX - 2 * zoom, barrelY - 18 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(barrelX + 1 * zoom, barrelY - 8 * zoom);
    ctx.lineTo(barrelX + 2 * zoom, barrelY - 16 * zoom);
    ctx.stroke();
    // Sword hilts
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(barrelX - 4 * zoom, barrelY - 19 * zoom, 4 * zoom, 1.5 * zoom);
    ctx.fillRect(barrelX, barrelY - 17 * zoom, 4 * zoom, 1.5 * zoom);

    // Torch bracket on wall
    const torchX = screenPos.x + isoW * 0.3;
    const torchY = screenPos.y - 12 * zoom;
    ctx.fillStyle = "#5a5a62";
    ctx.fillRect(torchX - 1 * zoom, torchY, 2 * zoom, 8 * zoom);
    ctx.fillStyle = "#4a3a2a";
    ctx.fillRect(torchX - 1.5 * zoom, torchY - 8 * zoom, 3 * zoom, 8 * zoom);
    // Torch flame
    const torchFlame = 0.6 + Math.sin(time * 10) * 0.3;
    ctx.fillStyle = `rgba(255, 180, 60, ${torchFlame})`;
    ctx.shadowColor = "#ff8800";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(torchX - 2 * zoom, torchY - 8 * zoom);
    ctx.quadraticCurveTo(
      torchX,
      torchY - 14 * zoom - Math.sin(time * 12) * 2,
      torchX + 2 * zoom,
      torchY - 8 * zoom,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Armor rack near entrance
    const armorRackX = screenPos.x - isoW * 0.3;
    const armorRackY = screenPos.y + 6 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(
      armorRackX - 8 * zoom,
      armorRackY - 2 * zoom,
      16 * zoom,
      2 * zoom,
    );
    // Hanging chainmail
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.moveTo(armorRackX - 4 * zoom, armorRackY - 2 * zoom);
    ctx.lineTo(armorRackX - 6 * zoom, armorRackY - 12 * zoom);
    ctx.lineTo(armorRackX - 2 * zoom, armorRackY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    // Helmet on rack
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(
      armorRackX + 4 * zoom,
      armorRackY - 6 * zoom,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.ellipse(
      armorRackX + 4 * zoom,
      armorRackY - 10 * zoom,
      1 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else if (tower.level === 3) {
    // FORTRESS BASE - Heavy stone fortress platform with imposing masonry

    // Deep foundation - massive stone base
    stationDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 24,
      baseD + 38,
      12,
      "#3a3a42",
      "#2a2a32",
      "#1a1a22",
    );

    // Heavy iron bands around foundation
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 24) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 38) * zoom * 0.25 + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 24) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 24) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 38) * zoom * 0.25 + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 24) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.stroke();

    // Foundation anchor bolts
    ctx.fillStyle = "#5a5a62";
    const anchorPositions = [
      {
        x: screenPos.x - (baseW + 24) * zoom * 0.5,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x - (baseW + 24) * zoom * 0.25,
        y: screenPos.y + 15 * zoom,
      },
      {
        x: screenPos.x + (baseW + 24) * zoom * 0.25,
        y: screenPos.y + 15 * zoom,
      },
      {
        x: screenPos.x + (baseW + 24) * zoom * 0.5,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 38) * zoom * ISO_PRISM_D_FACTOR + 12 * zoom,
      },
    ];
    for (const anchor of anchorPositions) {
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }

    // Stone wall layer
    stationDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 14,
      baseD + 25,
      8,
      "#5a5a62",
      "#4a4a52",
      "#3a3a42",
    );

    // Wall edge molding
    ctx.strokeStyle = "#7a7a82";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 14) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 25) * zoom * 0.25 + 1 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 14) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();

    // Top fortress platform
    stationDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 6,
      baseD + 16,
      6,
      "#6a6a72",
      "#5a5a62",
      "#4a4a52",
    );

    // Fortress platform paving pattern
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 0.8 * zoom;
    // Cross-hatch pattern
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 6) * zoom * 0.5 + i * 5 * zoom,
        screenPos.y - 6 * zoom - i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y +
          (baseD + 16) * zoom * ISO_PRISM_D_FACTOR -
          6 * zoom -
          i * 2.5 * zoom,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x + (baseW + 6) * zoom * 0.5 + i * 5 * zoom,
        screenPos.y - 6 * zoom + i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y +
          (baseD + 16) * zoom * ISO_PRISM_D_FACTOR -
          6 * zoom +
          i * 2.5 * zoom,
      );
      ctx.stroke();
    }

    // Platform decorative border
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 6) * zoom * 0.5, screenPos.y - 6 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 16) * zoom * 0.25 - 6 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.5, screenPos.y - 6 * zoom);
    ctx.stroke();

    // Inset glow trim on platform edge
    const platformGlow = 0.3 + Math.sin(time * 2) * 0.15;
    ctx.strokeStyle = `rgba(255, 108, 0, ${platformGlow})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 6) * zoom * 0.5, screenPos.y - 5 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 16) * zoom * ISO_PRISM_D_FACTOR - 5 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.5, screenPos.y - 5 * zoom);
    ctx.stroke();

    // Mini battlements on corners - now with more detail
    for (const side of [-1, 1]) {
      drawIsometricPrism(
        ctx,
        screenPos.x + side * isoW * 0.7,
        screenPos.y + side * 2 * zoom,
        6,
        5,
        8,
        { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
        zoom,
      );
      // Battlement arrow slit — isometric flush with left face
      drawIsoFlushSlit(
        ctx,
        screenPos.x + side * isoW * 0.7,
        screenPos.y + side * 2 * zoom - 4 * zoom,
        1.2,
        4,
        "left",
        zoom,
      );
    }

    // Fortress corner towers (small)
    drawIsometricPrism(
      ctx,
      screenPos.x - (baseW + 6) * zoom * 0.5,
      screenPos.y - 2 * zoom,
      6,
      5,
      12,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );
    drawIsometricPrism(
      ctx,
      screenPos.x + (baseW + 6) * zoom * 0.5,
      screenPos.y - 2 * zoom,
      6,
      5,
      12,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Tower caps
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 6) * zoom * 0.5, screenPos.y - 18 * zoom);
    ctx.lineTo(
      screenPos.x - (baseW + 6) * zoom * 0.5 - 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.lineTo(screenPos.x - (baseW + 6) * zoom * 0.5, screenPos.y - 12 * zoom);
    ctx.lineTo(
      screenPos.x - (baseW + 6) * zoom * 0.5 + 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + (baseW + 6) * zoom * 0.5, screenPos.y - 18 * zoom);
    ctx.lineTo(
      screenPos.x + (baseW + 6) * zoom * 0.5 - 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 6) * zoom * 0.5, screenPos.y - 12 * zoom);
    ctx.lineTo(
      screenPos.x + (baseW + 6) * zoom * 0.5 + 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Catapult/Ballista (left side)
    const siegeX = screenPos.x - isoW * 0.55;
    const siegeY = screenPos.y + 6 * zoom;
    // Base frame
    ctx.fillStyle = "#4a3a2a";
    drawIsometricPrism(
      ctx,
      siegeX,
      siegeY,
      10,
      8,
      4,
      { top: "#5a4a3a", left: "#4a3a2a", right: "#3a2a1a" },
      zoom,
    );
    // Arm
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(siegeX, siegeY - 4 * zoom);
    ctx.lineTo(siegeX - 4 * zoom, siegeY - 14 * zoom);
    ctx.stroke();
    // Counterweight
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(siegeX + 3 * zoom, siegeY - 6 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Weapon rack with heavy weapons
    const hwX = screenPos.x + isoW * 0.5;
    const hwY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.fillRect(hwX - 2 * zoom, hwY - 16 * zoom, 4 * zoom, 16 * zoom);
    // Halberds
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(hwX - 4 * zoom, hwY - 14 * zoom);
    ctx.lineTo(hwX - 4 * zoom, hwY - 26 * zoom);
    ctx.moveTo(hwX + 4 * zoom, hwY - 14 * zoom);
    ctx.lineTo(hwX + 4 * zoom, hwY - 26 * zoom);
    ctx.stroke();
    // Axe heads
    ctx.fillStyle = "#8a8a92";
    for (const ox of [-4, 4]) {
      ctx.beginPath();
      ctx.moveTo(hwX + ox * zoom, hwY - 26 * zoom);
      ctx.lineTo(hwX + ox * zoom - 3 * zoom, hwY - 22 * zoom);
      ctx.lineTo(hwX + ox * zoom + 3 * zoom, hwY - 22 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // === LEVEL 3 ENHANCEMENTS: Heavy Fortress Details ===

    // Heavy armor plating on foundation
    ctx.fillStyle = "#5a5a62";
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 1.5 * zoom;
    for (let plate = 0; plate < 3; plate++) {
      const plateX = screenPos.x - isoW * 0.5 + plate * isoW * 0.5;
      const plateY = screenPos.y + 16 * zoom - plate * 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(plateX - 6 * zoom, plateY);
      ctx.lineTo(plateX - 4 * zoom, plateY - 6 * zoom);
      ctx.lineTo(plateX + 4 * zoom, plateY - 4 * zoom);
      ctx.lineTo(plateX + 6 * zoom, plateY + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Rivets on plate
      ctx.fillStyle = "#7a7a82";
      ctx.beginPath();
      ctx.arc(plateX - 2 * zoom, plateY - 2 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.arc(plateX + 2 * zoom, plateY - 1 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a62";
    }

    // Defensive spikes around foundation
    ctx.fillStyle = "#4a4a52";
    for (let spike = 0; spike < 5; spike++) {
      const spikeX = screenPos.x - isoW * 0.8 + spike * 8 * zoom;
      const spikeY = screenPos.y + 18 * zoom - spike * 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(spikeX, spikeY - 10 * zoom);
      ctx.lineTo(spikeX - 2 * zoom, spikeY);
      ctx.lineTo(spikeX + 2 * zoom, spikeY);
      ctx.closePath();
      ctx.fill();
    }

    // Mounted ballista on platform
    const ballistaX = screenPos.x - isoW * 0.65;
    const ballistaY = screenPos.y + 2 * zoom;
    // Ballista base
    ctx.fillStyle = "#4a3a2a";
    drawIsometricPrism(
      ctx,
      ballistaX,
      ballistaY,
      8,
      6,
      4,
      { top: "#5a4a3a", left: "#4a3a2a", right: "#3a2a1a" },
      zoom,
    );
    // Ballista frame
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.moveTo(ballistaX - 3 * zoom, ballistaY - 4 * zoom);
    ctx.lineTo(ballistaX, ballistaY - 16 * zoom);
    ctx.lineTo(ballistaX + 3 * zoom, ballistaY - 4 * zoom);
    ctx.closePath();
    ctx.fill();
    // Ballista arms (bow)
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ballistaX - 8 * zoom, ballistaY - 10 * zoom);
    ctx.quadraticCurveTo(
      ballistaX,
      ballistaY - 14 * zoom,
      ballistaX + 8 * zoom,
      ballistaY - 10 * zoom,
    );
    ctx.stroke();
    // Bowstring
    ctx.strokeStyle = "#8a7a6a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(ballistaX - 7 * zoom, ballistaY - 10 * zoom);
    ctx.lineTo(ballistaX, ballistaY - 8 * zoom);
    ctx.lineTo(ballistaX + 7 * zoom, ballistaY - 10 * zoom);
    ctx.stroke();
    // Loaded bolt
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(
      ballistaX - 1 * zoom,
      ballistaY - 12 * zoom,
      2 * zoom,
      8 * zoom,
    );
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.moveTo(ballistaX, ballistaY - 16 * zoom);
    ctx.lineTo(ballistaX - 2 * zoom, ballistaY - 12 * zoom);
    ctx.lineTo(ballistaX + 2 * zoom, ballistaY - 12 * zoom);
    ctx.closePath();
    ctx.fill();

    // Oil cauldrons for defense
    const cauldronX = screenPos.x + isoW * 0.7;
    const cauldronY = screenPos.y + 4 * zoom;
    // Cauldron
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(cauldronX, cauldronY, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.moveTo(cauldronX - 5 * zoom, cauldronY);
    ctx.quadraticCurveTo(
      cauldronX - 6 * zoom,
      cauldronY + 8 * zoom,
      cauldronX,
      cauldronY + 10 * zoom,
    );
    ctx.quadraticCurveTo(
      cauldronX + 6 * zoom,
      cauldronY + 8 * zoom,
      cauldronX + 5 * zoom,
      cauldronY,
    );
    ctx.closePath();
    ctx.fill();
    // Bubbling oil
    const oilBubble = 0.5 + Math.sin(time * 6) * 0.3;
    ctx.fillStyle = `rgba(60, 40, 20, ${oilBubble})`;
    ctx.beginPath();
    ctx.ellipse(
      cauldronX,
      cauldronY - 2 * zoom,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Steam from cauldron
    ctx.fillStyle = `rgba(180, 160, 140, ${oilBubble * 0.6})`;
    ctx.beginPath();
    ctx.arc(
      cauldronX + Math.sin(time * 3) * 2,
      cauldronY - 8 * zoom,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Fire under cauldron
    const cauldronFire = 0.6 + Math.sin(time * 10) * 0.3;
    ctx.fillStyle = `rgba(255, 150, 50, ${cauldronFire})`;
    ctx.beginPath();
    ctx.moveTo(cauldronX - 3 * zoom, cauldronY + 10 * zoom);
    ctx.quadraticCurveTo(
      cauldronX,
      cauldronY + 4 * zoom + Math.sin(time * 12) * 2,
      cauldronX + 3 * zoom,
      cauldronY + 10 * zoom,
    );
    ctx.fill();

    // Heavy chains hanging from walls
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2 * zoom;
    const chainX = screenPos.x + isoW * 0.2;
    const chainY = screenPos.y - 20 * zoom;
    for (let link = 0; link < 6; link++) {
      const linkY = chainY + link * 4 * zoom;
      const sway = Math.sin(time * 2 + link * 0.5) * 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        chainX + sway,
        linkY,
        2 * zoom,
        3 * zoom,
        link % 2 === 0 ? 0.3 : -0.3,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // War drums
    const drumX = screenPos.x + isoW * 0.4;
    const drumY = screenPos.y + 8 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(drumX, drumY, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a5a4a";
    ctx.beginPath();
    ctx.ellipse(drumX, drumY - 6 * zoom, 5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    // Drum skin
    ctx.fillStyle = "#c4a84a";
    ctx.beginPath();
    ctx.ellipse(
      drumX,
      drumY - 6.5 * zoom,
      4 * zoom,
      2.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Drumsticks
    ctx.fillStyle = "#7a6a5a";
    ctx.fillRect(drumX + 4 * zoom, drumY - 10 * zoom, 1.5 * zoom, 8 * zoom);
    ctx.fillRect(drumX + 6 * zoom, drumY - 9 * zoom, 1.5 * zoom, 7 * zoom);

    // Stacked cannonballs
    ctx.fillStyle = "#3a3a42";
    for (let row = 0; row < 3; row++) {
      for (let ball = 0; ball < 3 - row; ball++) {
        const ballX =
          screenPos.x - isoW * 0.3 + ball * 4 * zoom + row * 2 * zoom;
        const ballY = screenPos.y + 12 * zoom - row * 3 * zoom;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Fortification banners on walls (3D isometric)
    const bannerX2 = screenPos.x + isoW * 0.6;
    const bannerY2 = screenPos.y - 26 * zoom;
    const bWave = Math.sin(time * 3) * 2;
    const bIsoD = 1.5 * zoom;
    // Pole with isometric depth
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(bannerX2 - 1 * zoom, bannerY2);
    ctx.lineTo(bannerX2 + 1 * zoom, bannerY2);
    ctx.lineTo(bannerX2 + 1 * zoom, bannerY2 + 14 * zoom);
    ctx.lineTo(bannerX2 - 1 * zoom, bannerY2 + 14 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 1 * zoom, bannerY2);
    ctx.lineTo(bannerX2 + 1 * zoom + bIsoD, bannerY2 - bIsoD * 0.5);
    ctx.lineTo(bannerX2 + 1 * zoom + bIsoD, bannerY2 + 14 * zoom - bIsoD * 0.5);
    ctx.lineTo(bannerX2 + 1 * zoom, bannerY2 + 14 * zoom);
    ctx.closePath();
    ctx.fill();
    // Pole finial ball
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(bannerX2, bannerY2 - 1 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();
    // Triangular pennant back face (darker, offset for isometric depth)
    ctx.fillStyle = "#5a0000";
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 1 * zoom + bIsoD, bannerY2 - bIsoD * 0.5);
    ctx.quadraticCurveTo(
      bannerX2 + 6 * zoom + bWave * 0.6 + bIsoD,
      bannerY2 + 3 * zoom - bIsoD * 0.5,
      bannerX2 + 10 * zoom + bWave * 0.5 + bIsoD,
      bannerY2 + 5 * zoom - bIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      bannerX2 + 6 * zoom + bWave * 0.4 + bIsoD,
      bannerY2 + 7 * zoom - bIsoD * 0.5,
      bannerX2 + 1 * zoom + bIsoD,
      bannerY2 + 10 * zoom - bIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Triangular pennant front face
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 1 * zoom, bannerY2);
    ctx.quadraticCurveTo(
      bannerX2 + 6 * zoom + bWave * 0.6,
      bannerY2 + 3 * zoom,
      bannerX2 + 10 * zoom + bWave * 0.5,
      bannerY2 + 5 * zoom,
    );
    ctx.quadraticCurveTo(
      bannerX2 + 6 * zoom + bWave * 0.4,
      bannerY2 + 7 * zoom,
      bannerX2 + 1 * zoom,
      bannerY2 + 10 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    // Pennant outline
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 3 * zoom + bWave * 0.2, bannerY2 + 1.5 * zoom);
    ctx.quadraticCurveTo(
      bannerX2 + 5 * zoom + bWave * 0.4,
      bannerY2 + 5 * zoom,
      bannerX2 + 3 * zoom + bWave * 0.2,
      bannerY2 + 8.5 * zoom,
    );
    ctx.stroke();
    // Pennant emblem (crossed swords, positioned within triangle)
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(bannerX2 + 2.5 * zoom + bWave * 0.2, bannerY2 + 2.5 * zoom);
    ctx.lineTo(bannerX2 + 6 * zoom + bWave * 0.4, bannerY2 + 7 * zoom);
    ctx.moveTo(bannerX2 + 6 * zoom + bWave * 0.4, bannerY2 + 2.5 * zoom);
    ctx.lineTo(bannerX2 + 2.5 * zoom + bWave * 0.2, bannerY2 + 7 * zoom);
    ctx.stroke();
  } else if (tower.level === 4 && tower.upgrade === "A") {
    // CENTAUR STABLE BASE - Clay red foundation with dark clay trim and mossy vine overlay (3 tiers)

    // Bottom tier - heavy dark clay red foundation (deepest, widest)
    stationDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 26,
      baseD + 42,
      12,
      "#4a2a1a",
      "#3d1c12",
      "#30160e",
    );

    // Lighter clay trim bands on bottom tier
    ctx.strokeStyle = "#8b4532";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 26) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 42) * zoom * 0.25 + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 26) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.stroke();
    ctx.strokeStyle = "#6a3022";
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 26) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 42) * zoom * 0.25 + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 26) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.stroke();

    // Clay red rivets on bottom tier
    ctx.fillStyle = "#4a2a1a";
    const l4aAnchors = [
      {
        x: screenPos.x - (baseW + 26) * zoom * 0.5,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x - (baseW + 26) * zoom * 0.25,
        y: screenPos.y + 16 * zoom,
      },
      {
        x: screenPos.x + (baseW + 26) * zoom * 0.25,
        y: screenPos.y + 16 * zoom,
      },
      {
        x: screenPos.x + (baseW + 26) * zoom * 0.5,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 42) * zoom * ISO_PRISM_D_FACTOR + 12 * zoom,
      },
    ];
    for (const anchor of l4aAnchors) {
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8b4532";
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6a3a2a";
    }

    // Middle tier - dark clay red stone
    stationDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 16,
      baseD + 30,
      9,
      "#5a3020",
      "#4a2a1a",
      "#3d1c12",
    );

    // Lighter clay molding edge on middle tier
    ctx.strokeStyle = "#8b4532";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 30) * zoom * 0.25 + 1 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();

    // Stone mortar lines on middle tier left face
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1 * zoom;
    for (let col = 0; col < 6; col++) {
      const fluteX = screenPos.x - (baseW + 16) * zoom * 0.5 - col * 4 * zoom;
      const fluteTopY = screenPos.y + 1 * zoom + col * 0.8 * zoom;
      const fluteBottomY = screenPos.y + 8 * zoom + col * 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(fluteX, fluteTopY);
      ctx.lineTo(fluteX - 1.5 * zoom, fluteBottomY);
      ctx.stroke();
    }

    // Stone mortar lines on middle tier right face
    for (let col = 0; col < 6; col++) {
      const fluteX = screenPos.x + (baseW + 16) * zoom * 0.5 + col * 4 * zoom;
      const fluteTopY = screenPos.y + 1 * zoom + col * 0.8 * zoom;
      const fluteBottomY = screenPos.y + 8 * zoom + col * 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(fluteX, fluteTopY);
      ctx.lineTo(fluteX + 1.5 * zoom, fluteBottomY);
      ctx.stroke();
    }

    // Top tier - dark clay red platform
    stationDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 8,
      baseD + 18,
      6,
      "#6a3a2a",
      "#5a3020",
      "#4a2a1a",
    );

    // Top platform tile pattern (stone flagstones)
    ctx.strokeStyle = "rgba(60,50,40,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 8) * zoom * 0.5 + i * 5 * zoom,
        screenPos.y - 6 * zoom - i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y +
          (baseD + 18) * zoom * ISO_PRISM_D_FACTOR -
          6 * zoom -
          i * 2.5 * zoom,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x + (baseW + 8) * zoom * 0.5 + i * 5 * zoom,
        screenPos.y - 6 * zoom + i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y +
          (baseD + 18) * zoom * ISO_PRISM_D_FACTOR -
          6 * zoom +
          i * 2.5 * zoom,
      );
      ctx.stroke();
    }

    // Lighter clay edge trim
    ctx.strokeStyle = "#8b4532";
    ctx.lineWidth = 2.5 * zoom;
    ctx.shadowColor = "#6a3022";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 2 * zoom);
    ctx.lineTo(screenPos.x + isoW + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Corner clay posts
    drawIsometricPrism(
      ctx,
      screenPos.x - (baseW + 8) * zoom * 0.5,
      screenPos.y - 2 * zoom,
      5,
      5,
      10,
      { top: "#5a3020", left: "#4a2a1a", right: "#3d1c12" },
      zoom,
    );
    drawIsometricPrism(
      ctx,
      screenPos.x + (baseW + 8) * zoom * 0.5,
      screenPos.y - 2 * zoom,
      5,
      5,
      10,
      { top: "#5a3020", left: "#4a2a1a", right: "#3d1c12" },
      zoom,
    );

    // Lighter clay caps on posts
    ctx.fillStyle = "#8b4532";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - (baseW + 8) * zoom * 0.5,
      screenPos.y - 12 * zoom,
      3.5 * zoom,
      1.8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + (baseW + 8) * zoom * 0.5,
      screenPos.y - 12 * zoom,
      3.5 * zoom,
      1.8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Lanterns on posts
    ctx.fillStyle = "#5a4020";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - (baseW + 8) * zoom * 0.5,
      screenPos.y - 15 * zoom,
      2 * zoom,
      2.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + (baseW + 8) * zoom * 0.5,
      screenPos.y - 15 * zoom,
      2 * zoom,
      2.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Lantern glow
    ctx.fillStyle = "rgba(255, 180, 80, 0.5)";
    ctx.beginPath();
    ctx.arc(
      screenPos.x - (baseW + 8) * zoom * 0.5,
      screenPos.y - 16 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      screenPos.x + (baseW + 8) * zoom * 0.5,
      screenPos.y - 16 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Hay storage area (left)
    const hayX = screenPos.x - isoW * 0.6;
    const hayY = screenPos.y + 6 * zoom;
    ctx.fillStyle = "#c4a84a";
    ctx.beginPath();
    ctx.ellipse(hayX, hayY - 2 * zoom, 6 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b49830";
    ctx.beginPath();
    ctx.ellipse(
      hayX + 4 * zoom,
      hayY - 6 * zoom,
      5 * zoom,
      2.5 * zoom,
      0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Water trough
    const troughX = screenPos.x + isoW * 0.45;
    const troughY = screenPos.y + 4 * zoom;
    drawIsometricPrism(
      ctx,
      troughX,
      troughY,
      10,
      6,
      4,
      { top: "#8a8a92", left: "#7a7a82", right: "#6a6a72" },
      zoom,
    );
    // Water surface
    ctx.fillStyle = `rgba(100, 150, 200, ${0.6 + Math.sin(time * 2) * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(
      troughX,
      troughY - 4 * zoom,
      4 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Golden urn
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.ellipse(
      troughX + 10 * zoom,
      troughY - 6 * zoom,
      3 * zoom,
      5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#b8860b";
    ctx.beginPath();
    ctx.ellipse(
      troughX + 10 * zoom,
      troughY - 10 * zoom,
      2 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else {
    // ROYAL CASTLE BASE - Grand royal military fortress with detailed masonry

    // Deep royal foundation - massive stone base
    stationDiamond(
      screenPos.x,
      screenPos.y + 19 * zoom,
      baseW + 26,
      baseD + 42,
      12,
      uc("#3a3a42", "#1e2d55", "#3a3a42"),
      uc("#2a2a32", "#142248", "#2a2a32"),
      uc("#1a1a22", "#0c1438", "#1a1a22"),
    );

    // Heavy iron reinforcement bands
    ctx.strokeStyle = uc("#4a4a52", "#2a3a65", "#4a4a52");
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 26) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 42) * zoom * 0.25 + 10 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 26) * zoom * 0.5,
      screenPos.y + 10 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x - (baseW + 26) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 42) * zoom * 0.25 + 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 26) * zoom * 0.5,
      screenPos.y + 18 * zoom,
    );
    ctx.stroke();

    // Foundation anchor points with gold caps
    ctx.fillStyle = uc("#5a5a62", "#384a72", "#5a5a62");
    const anchorPoints = [
      {
        x: screenPos.x - (baseW + 26) * zoom * 0.5,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x - (baseW + 26) * zoom * 0.25,
        y: screenPos.y + 16 * zoom,
      },
      {
        x: screenPos.x + (baseW + 26) * zoom * 0.25,
        y: screenPos.y + 16 * zoom,
      },
      {
        x: screenPos.x + (baseW + 26) * zoom * 0.5,
        y: screenPos.y + 12 * zoom,
      },
      {
        x: screenPos.x,
        y: screenPos.y + (baseD + 42) * zoom * ISO_PRISM_D_FACTOR + 12 * zoom,
      },
    ];
    for (const anchor of anchorPoints) {
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Gold cap
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = uc("#5a5a62", "#384a72", "#5a5a62");
    }

    // Royal stone tier
    stationDiamond(
      screenPos.x,
      screenPos.y + 8 * zoom,
      baseW + 16,
      baseD + 30,
      9,
      uc("#5a5a62", "#384a72", "#5a5a62"),
      uc("#4a4a52", "#2a3a65", "#4a4a52"),
      uc("#3a3a42", "#1e2d55", "#3a3a42"),
    );

    // Gold decorative molding on middle tier
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.lineTo(
      screenPos.x,
      screenPos.y + (baseD + 30) * zoom * 0.25 + 1 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 16) * zoom * 0.5, screenPos.y + 1 * zoom);
    ctx.stroke();

    // Top royal platform
    stationDiamond(
      screenPos.x,
      screenPos.y,
      baseW + 8,
      baseD + 18,
      6,
      uc("#6a6a72", "#485a80", "#6a6a72"),
      uc("#5a5a62", "#384a72", "#5a5a62"),
      uc("#4a4a52", "#2a3a65", "#4a4a52"),
    );

    // Royal heraldic floor pattern
    ctx.strokeStyle = uc("#4a4a52", "#2a3a65", "#4a4a52");
    ctx.lineWidth = 0.8 * zoom;
    // Cross pattern
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x - (baseW + 8) * zoom * 0.5 + i * 5 * zoom,
        screenPos.y - 6 * zoom - i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y +
          (baseD + 18) * zoom * ISO_PRISM_D_FACTOR -
          6 * zoom -
          i * 2.5 * zoom,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(
        screenPos.x + (baseW + 8) * zoom * 0.5 + i * 5 * zoom,
        screenPos.y - 6 * zoom + i * 2.5 * zoom,
      );
      ctx.lineTo(
        screenPos.x + i * 5 * zoom,
        screenPos.y +
          (baseD + 18) * zoom * ISO_PRISM_D_FACTOR -
          6 * zoom +
          i * 2.5 * zoom,
      );
      ctx.stroke();
    }

    // Gold edge trim with royal glow
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3 * zoom;
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 2 * zoom);
    ctx.lineTo(screenPos.x + isoW + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Orange accent glow trim (inner)
    const accentGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.strokeStyle = `rgba(255, 108, 0, ${accentGlow})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - isoW - 2 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + isoD - 3 * zoom);
    ctx.lineTo(screenPos.x + isoW + 2 * zoom, screenPos.y - 5 * zoom);
    ctx.stroke();

    // Royal carpet pattern (larger, more detailed)
    ctx.fillStyle = "#8b0000";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 10 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + 6 * zoom);
    ctx.lineTo(screenPos.x + 10 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 10 * zoom);
    ctx.closePath();
    ctx.fill();
    // Carpet gold border
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    // Inner carpet pattern
    ctx.fillStyle = "#6b0000";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 6 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y + 2 * zoom);
    ctx.lineTo(screenPos.x + 6 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 7 * zoom);
    ctx.closePath();
    ctx.fill();
    // Royal crest on carpet (crown symbol)
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 3 * zoom, screenPos.y - 4 * zoom);
    ctx.lineTo(screenPos.x - 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x - 2 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x, screenPos.y - 7 * zoom);
    ctx.lineTo(screenPos.x + 2 * zoom, screenPos.y - 5 * zoom);
    ctx.lineTo(screenPos.x + 4 * zoom, screenPos.y - 6 * zoom);
    ctx.lineTo(screenPos.x + 3 * zoom, screenPos.y - 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Decorative corner fortress pillars
    ctx.fillStyle = "#5a5a62";
    drawIsometricPrism(
      ctx,
      screenPos.x - (baseW + 8) * zoom * 0.5,
      screenPos.y - 2 * zoom,
      6,
      5,
      12,
      {
        top: uc("#7a7a82", "#5570a8", "#7a7a82"),
        left: uc("#5a5a62", "#384a72", "#5a5a62"),
        right: uc("#4a4a52", "#2a3a65", "#4a4a52"),
      },
      zoom,
    );
    drawIsometricPrism(
      ctx,
      screenPos.x + (baseW + 8) * zoom * 0.5,
      screenPos.y - 2 * zoom,
      6,
      5,
      12,
      {
        top: uc("#7a7a82", "#5570a8", "#7a7a82"),
        left: uc("#5a5a62", "#384a72", "#5a5a62"),
        right: uc("#4a4a52", "#2a3a65", "#4a4a52"),
      },
      zoom,
    );

    // Pillar gold bands
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x - (baseW + 8) * zoom * 0.5,
      screenPos.y - 8 * zoom,
      3.5 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + (baseW + 8) * zoom * 0.5,
      screenPos.y - 8 * zoom,
      3.5 * zoom,
      1.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Pillar caps with finials
    ctx.fillStyle = uc("#4a4a52", "#2a3a65", "#4a4a52");
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 8) * zoom * 0.5, screenPos.y - 18 * zoom);
    ctx.lineTo(
      screenPos.x - (baseW + 8) * zoom * 0.5 - 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.lineTo(screenPos.x - (baseW + 8) * zoom * 0.5, screenPos.y - 12 * zoom);
    ctx.lineTo(
      screenPos.x - (baseW + 8) * zoom * 0.5 + 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + (baseW + 8) * zoom * 0.5, screenPos.y - 18 * zoom);
    ctx.lineTo(
      screenPos.x + (baseW + 8) * zoom * 0.5 - 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.lineTo(screenPos.x + (baseW + 8) * zoom * 0.5, screenPos.y - 12 * zoom);
    ctx.lineTo(
      screenPos.x + (baseW + 8) * zoom * 0.5 + 4 * zoom,
      screenPos.y - 14 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Gold finial spikes
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(screenPos.x - (baseW + 8) * zoom * 0.5, screenPos.y - 22 * zoom);
    ctx.lineTo(
      screenPos.x - (baseW + 8) * zoom * 0.5 - 1.5 * zoom,
      screenPos.y - 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x - (baseW + 8) * zoom * 0.5 + 1.5 * zoom,
      screenPos.y - 18 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screenPos.x + (baseW + 8) * zoom * 0.5, screenPos.y - 22 * zoom);
    ctx.lineTo(
      screenPos.x + (baseW + 8) * zoom * 0.5 - 1.5 * zoom,
      screenPos.y - 18 * zoom,
    );
    ctx.lineTo(
      screenPos.x + (baseW + 8) * zoom * 0.5 + 1.5 * zoom,
      screenPos.y - 18 * zoom,
    );
    ctx.closePath();
    ctx.fill();

    // Royal guard post (left)
    const guardX = screenPos.x - isoW * 0.6;
    const guardY = screenPos.y + 6 * zoom;
    drawIsometricPrism(
      ctx,
      guardX,
      guardY,
      8,
      6,
      16,
      {
        top: uc("#5a5a62", "#384a72", "#5a5a62"),
        left: uc("#4a4a52", "#2a3a65", "#4a4a52"),
        right: uc("#3a3a42", "#1e2d55", "#3a3a42"),
      },
      zoom,
    );
    // Guard silhouette
    ctx.fillStyle = uc("#3a3a42", "#1e2d55", "#3a3a42");
    ctx.beginPath();
    ctx.arc(guardX, guardY - 20 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(guardX - 2 * zoom, guardY - 17 * zoom, 4 * zoom, 8 * zoom);
    // Spear
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(guardX + 4 * zoom, guardY - 12 * zoom);
    ctx.lineTo(guardX + 4 * zoom, guardY - 28 * zoom);
    ctx.stroke();

    // Royal banner stand (right)
    const bannerX = screenPos.x + isoW * 0.5;
    const bannerY = screenPos.y + 4 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(
      bannerX - 1.5 * zoom,
      bannerY - 24 * zoom,
      3 * zoom,
      24 * zoom,
    );
    // Banner
    const bannerWave = Math.sin(time * 3) * 2;
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(bannerX + 1.5 * zoom, bannerY - 24 * zoom);
    ctx.quadraticCurveTo(
      bannerX + 10 * zoom + bannerWave,
      bannerY - 20 * zoom,
      bannerX + 14 * zoom + bannerWave * 0.5,
      bannerY - 18 * zoom,
    );
    ctx.lineTo(bannerX + 1.5 * zoom, bannerY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    // Crown on banner
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(bannerX + 5 * zoom + bannerWave * 0.3, bannerY - 20 * zoom);
    ctx.lineTo(bannerX + 6 * zoom + bannerWave * 0.3, bannerY - 22 * zoom);
    ctx.lineTo(bannerX + 8 * zoom + bannerWave * 0.4, bannerY - 20 * zoom);
    ctx.lineTo(bannerX + 10 * zoom + bannerWave * 0.5, bannerY - 22 * zoom);
    ctx.lineTo(bannerX + 11 * zoom + bannerWave * 0.5, bannerY - 20 * zoom);
    ctx.closePath();
    ctx.fill();

    // Treasure chest
    drawIsometricPrism(
      ctx,
      bannerX + 8 * zoom,
      bannerY,
      8,
      6,
      5,
      { top: "#8b4513", left: "#6b3503", right: "#5b2503" },
      zoom,
    );
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(bannerX + 5 * zoom, bannerY - 6 * zoom, 6 * zoom, 2 * zoom);
  }

  // Glowing edge on top platform
  const edgeGlow = 0.5 + Math.sin(time * 2) * 0.2;
  ctx.strokeStyle = `rgba(255, 108, 0, ${edgeGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.shadowColor = "#e06000";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - isoW, screenPos.y - 4 * zoom);
  ctx.lineTo(screenPos.x, screenPos.y + isoD - 4 * zoom);
  ctx.lineTo(screenPos.x + isoW, screenPos.y - 4 * zoom);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ========== TRAIN TRACKS WITH SLEEPERS AND SEPARATED RAILS ==========
  const trackLen = baseW * 0.9 * zoom;
  const trackW = 24 * zoom;

  // Helper to draw along isometric track axis
  const trackIso = (baseX: number, baseY: number, offset: number) => ({
    x: baseX + offset * zoom,
    y: baseY - offset * zoom * 0.5,
  });

  // Common track bed (gravel ballast)
  const bedColor =
    tower.level >= 4
      ? uc("#42382a", "#1e2d55", "#3a3a42")
      : tower.level >= 3
        ? "#4a4a52"
        : tower.level >= 2
          ? "#3a3a42"
          : "#5a4a3a";
  ctx.fillStyle = bedColor;
  ctx.beginPath();
  ctx.moveTo(
    screenPos.x - trackLen * 0.5,
    screenPos.y + trackLen * 0.25 - 3 * zoom,
  );
  ctx.lineTo(screenPos.x, screenPos.y - trackW * 0.12 - 3 * zoom);
  ctx.lineTo(
    screenPos.x + trackLen * 0.5,
    screenPos.y - trackLen * 0.25 - 3 * zoom,
  );
  ctx.lineTo(screenPos.x, screenPos.y + trackW * 0.12 - 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // Sleepers (wooden ties across the tracks)
  const numSleepers = 9;
  const sleeperColor =
    tower.level >= 4
      ? uc("#52483a", "#2a3a65", "#4a4a52")
      : tower.level >= 3
        ? "#5a5a62"
        : tower.level >= 2
          ? "#5a5a5a"
          : "#6b5030";
  const sleeperDark =
    tower.level >= 4
      ? uc("#42382a", "#1e2d55", "#3a3a42")
      : tower.level >= 3
        ? "#4a4a52"
        : tower.level >= 2
          ? "#4a4a4a"
          : "#5a4020";

  for (let i = 0; i < numSleepers; i++) {
    const t = i / (numSleepers - 1) - 0.5;
    const sleeperCenter = trackIso(
      screenPos.x,
      screenPos.y - 5 * zoom,
      ((t * trackLen) / zoom) * 0.85,
    );

    // Sleeper is perpendicular to track - draw as small isometric rectangle
    const sw = 12; // sleeper width (perpendicular to track)
    const sd = 3; // sleeper depth (along track)
    const sh = 2; // sleeper height

    // Top face
    ctx.fillStyle = sleeperColor;
    ctx.beginPath();
    ctx.moveTo(
      sleeperCenter.x - sw * zoom * 0.25,
      sleeperCenter.y - sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 - sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25 + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 + sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25,
      sleeperCenter.y + sw * zoom * 0.125,
    );
    ctx.closePath();
    ctx.fill();

    // Front face
    ctx.fillStyle = sleeperDark;
    ctx.beginPath();
    ctx.moveTo(
      sleeperCenter.x + sw * zoom * 0.25,
      sleeperCenter.y + sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25 + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 + sw * zoom * 0.125,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25 + sd * zoom * 0.5,
      sleeperCenter.y - sd * zoom * 0.25 + sw * zoom * 0.125 + sh * zoom,
    );
    ctx.lineTo(
      sleeperCenter.x + sw * zoom * 0.25,
      sleeperCenter.y + sw * zoom * 0.125 + sh * zoom,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Rails - two separate rails with proper 3D shape
  const railOffsets = [-4, 4]; // Distance from center line
  const railColor =
    tower.level >= 4
      ? tower.upgrade === "A"
        ? "#c9a227"
        : "#7a7a82"
      : "#6a6a6a";
  const railHighlight =
    tower.level >= 4
      ? tower.upgrade === "A"
        ? "#ffe44d"
        : "#9a9aa2"
      : "#8a8a8a";
  const railDark =
    tower.level >= 4
      ? tower.upgrade === "A"
        ? "#b8860b"
        : "#5a5a62"
      : "#4a4a4a";

  for (const railOff of railOffsets) {
    // Rail runs along the track
    const railStart = trackIso(
      screenPos.x,
      screenPos.y - 6 * zoom,
      (-trackLen / zoom) * 0.42,
    );
    const railEnd = trackIso(
      screenPos.x,
      screenPos.y - 6 * zoom,
      (trackLen / zoom) * 0.42,
    );

    // Offset perpendicular to track
    const perpX = railOff * zoom * 0.25;
    const perpY = railOff * zoom * 0.125;

    // Rail top surface (bright)
    ctx.strokeStyle = railHighlight;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(railStart.x + perpX, railStart.y + perpY);
    ctx.lineTo(railEnd.x + perpX, railEnd.y + perpY);
    ctx.stroke();

    // Rail side (dark)
    ctx.strokeStyle = railDark;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(railStart.x + perpX, railStart.y + perpY + 1.5 * zoom);
    ctx.lineTo(railEnd.x + perpX, railEnd.y + perpY + 1.5 * zoom);
    ctx.stroke();

    // Rail base flange
    ctx.strokeStyle = railColor;
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(railStart.x + perpX, railStart.y + perpY + 2.5 * zoom);
    ctx.lineTo(railEnd.x + perpX, railEnd.y + perpY + 2.5 * zoom);
    ctx.stroke();
  }

  // Rail spikes/fasteners on sleepers
  for (let i = 0; i < numSleepers; i++) {
    const t = i / (numSleepers - 1) - 0.5;
    const sleeperCenter = trackIso(
      screenPos.x,
      screenPos.y - 5 * zoom,
      ((t * trackLen) / zoom) * 0.85,
    );

    for (const railOff of railOffsets) {
      const perpX = railOff * zoom * 0.25;
      const perpY = railOff * zoom * 0.125;

      // Spike
      ctx.fillStyle = uc("#c9a227", "#8090b8", "#e06000");
      ctx.beginPath();
      ctx.arc(
        sleeperCenter.x + perpX,
        sleeperCenter.y + perpY,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Level-specific track decorations
  if (tower.level >= 3) {
    // Glowing runes between rails for fortress/royal
    const runeGlow = 0.4 + Math.sin(time * 2) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${runeGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 6 * zoom;
    for (let i = 1; i < numSleepers - 1; i += 2) {
      const t = i / (numSleepers - 1) - 0.5;
      const runePos = trackIso(
        screenPos.x,
        screenPos.y - 5 * zoom,
        ((t * trackLen) / zoom) * 0.85,
      );
      ctx.beginPath();
      ctx.arc(runePos.x, runePos.y, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  if (tower.level === 4 && tower.upgrade === "B") {
    // Maglev glow effect for royal armored
    const maglevGlow = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.strokeStyle = `rgba(255, 108, 0, ${maglevGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 10 * zoom;
    ctx.lineWidth = 2 * zoom;
    const glowStart = trackIso(
      screenPos.x,
      screenPos.y - 4 * zoom,
      (-trackLen / zoom) * 0.4,
    );
    const glowEnd = trackIso(
      screenPos.x,
      screenPos.y - 4 * zoom,
      (trackLen / zoom) * 0.4,
    );
    ctx.beginPath();
    ctx.moveTo(glowStart.x, glowStart.y);
    ctx.lineTo(glowEnd.x, glowEnd.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ---- BACK FENCE EDGES (drawn behind building body for correct isometric depth) ----
  {
    const fPostColor =
      tower.level >= 4
        ? uc("#c9a227", "#8090b8", "#c9a227")
        : tower.level >= 3
          ? "#6a6a72"
          : "#6a5230";
    const fRailColor =
      tower.level >= 4
        ? uc("#a88420", "#6878a0", "#a88420")
        : tower.level >= 3
          ? "#5a5a62"
          : "#5a4220";
    const topPlatW =
      tower.level <= 2 ? baseW + 4 : tower.level === 3 ? baseW + 6 : baseW + 8;
    const topPlatD =
      tower.level === 1
        ? baseD + 12
        : tower.level === 2
          ? baseD + 14
          : tower.level === 3
            ? baseD + 16
            : baseD + 18;
    const fW = topPlatW * zoom * 0.5;
    const fD = topPlatD * zoom * 0.25;
    const fBaseY = screenPos.y;
    const fPostH = 4 * zoom;
    const postCount = 5;

    const backFenceEdges: [number, number, number, number][] = [
      [screenPos.x + fW, fBaseY, screenPos.x, fBaseY - fD],
      [screenPos.x, fBaseY - fD, screenPos.x - fW, fBaseY],
    ];

    ctx.lineCap = "round";

    for (const [x0, y0, x1, y1] of backFenceEdges) {
      for (let p = 0; p <= postCount; p++) {
        const t = p / postCount;
        const px = x0 + (x1 - x0) * t;
        const py = y0 + (y1 - y0) * t;

        ctx.strokeStyle = fPostColor;
        ctx.lineWidth = 1.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - fPostH);
        ctx.stroke();

        ctx.fillStyle = fPostColor;
        ctx.beginPath();
        ctx.arc(px, py - fPostH, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let r = 0; r < 2; r++) {
        const railY = fPostH * (0.35 + r * 0.45);
        ctx.strokeStyle = fRailColor;
        ctx.lineWidth = 1.0 * zoom;
        ctx.beginPath();
        ctx.moveTo(x0, y0 - railY);
        ctx.lineTo(x1, y1 - railY);
        ctx.stroke();
      }
    }

    ctx.lineCap = "butt";
  }

  // ========== ROYAL CAVALRY SIDE POLE STRINGS (renders behind building) ==========
  if (tower.level === 4 && tower.upgrade === "B") {
    const purpleDark_b = "#5a2d80";
    const purpleMid_b = "#7b3fa0";
    const purpleLight_b = "#9b5fcf";
    const goldAccent_b = "#c9a227";
    const goldDark_b = "#a08020";
    const ropeColor_b = "#706050";

    const drawRope_b = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      sag: number,
    ) => {
      ctx.strokeStyle = ropeColor_b;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(
        (x1 + x2) * 0.5,
        (y1 + y2) * 0.5 + sag * zoom,
        x2,
        y2,
      );
      ctx.stroke();
    };

    const drawIsoPennant_b = (
      x: number,
      y: number,
      h: number,
      w: number,
      color: string,
      ndx: number,
      ndy: number,
    ) => {
      const wave = Math.sin(time * 0.002 + x * 0.1 + y * 0.07) * 1.0 * zoom;
      const fh = h * zoom;
      const fw = w * zoom;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x - fw * 0.5 * ndx, y - fw * 0.5 * ndy);
      ctx.lineTo(x + fw * 0.5 * ndx, y + fw * 0.5 * ndy);
      ctx.lineTo(x + wave * 0.1, y + fh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = goldAccent_b;
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
    };

    const drawIsoBunting_b = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      sag: number,
      count: number,
      colors: string[],
      flagH: number,
      flagW: number,
    ) => {
      drawRope_b(x1, y1, x2, y2, sag);
      const edx = x2 - x1;
      const edy = y2 - y1;
      const len = Math.sqrt(edx * edx + edy * edy);
      const ndx = len > 0 ? edx / len : 1;
      const ndy = len > 0 ? edy / len : 0;
      for (let i = 0; i < count; i++) {
        const t = (i + 0.5) / count;
        const rx = x1 + t * edx;
        const ry = y1 + t * edy + sag * zoom * (4 * t * (1 - t));
        drawIsoPennant_b(
          rx,
          ry,
          flagH,
          flagW,
          colors[i % colors.length],
          ndx,
          ndy,
        );
      }
    };

    const drawDecoPole_b = (x: number, baseY: number, topY: number) => {
      ctx.strokeStyle = "#4a4a52";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, topY);
      ctx.stroke();
      ctx.strokeStyle = goldDark_b;
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, topY);
      ctx.stroke();
      ctx.fillStyle = goldAccent_b;
      ctx.beginPath();
      ctx.arc(x, topY - 1.5 * zoom, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = goldDark_b;
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.ellipse(x, baseY + 1 * zoom, 3 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = goldDark_b;
      ctx.beginPath();
      ctx.ellipse(x, baseY, 2.5 * zoom, 1.2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const platLX_b = screenPos.x - isoW - 4 * zoom;
    const platLY_b = screenPos.y - 6 * zoom;
    const platBotY_b = screenPos.y + isoD - 2 * zoom;
    const platRX_b = screenPos.x + isoW + 4 * zoom;
    const platRY_b = screenPos.y - 6 * zoom;
    const platBackX_b = screenPos.x;
    const platBackY_b = 2 * platLY_b - platBotY_b;
    const bldgTopY = screenPos.y - 8 * zoom - 30 * zoom;

    const lInnerX = platBackX_b + (platLX_b - platBackX_b) * 0.2 - 2 * zoom;
    const lInnerBaseY = platBackY_b + (platLY_b - platBackY_b) * 0.2 + 6 * zoom;
    const lInnerTopY = bldgTopY + 4 * zoom;
    const lOuterX = platLX_b - 2 * zoom;
    const lOuterBaseY = platLY_b + 6 * zoom;
    const lOuterTopY = platLY_b - 28 * zoom;

    drawDecoPole_b(lInnerX, lInnerBaseY, lInnerTopY);
    drawDecoPole_b(lOuterX, lOuterBaseY, lOuterTopY);
    drawIsoBunting_b(
      lInnerX,
      lInnerTopY,
      lOuterX,
      lOuterTopY,
      6,
      6,
      [purpleDark_b, purpleMid_b, purpleLight_b],
      5.5,
      3.5,
    );
    drawIsoBunting_b(
      lInnerX,
      lInnerTopY + 12 * zoom,
      lOuterX,
      lOuterTopY + 10 * zoom,
      5,
      5,
      [purpleLight_b, purpleDark_b, purpleMid_b],
      4.5,
      3,
    );

    const rInnerX = platBackX_b + (platRX_b - platBackX_b) * 0.2 + 2 * zoom;
    const rInnerBaseY = platBackY_b + (platRY_b - platBackY_b) * 0.2 + 6 * zoom;
    const rInnerTopY = bldgTopY + 2 * zoom;
    const rOuterX = platRX_b + 2 * zoom;
    const rOuterBaseY = platRY_b + 6 * zoom;
    const rOuterTopY = platRY_b - 28 * zoom;

    drawDecoPole_b(rInnerX, rInnerBaseY, rInnerTopY);
    drawDecoPole_b(rOuterX, rOuterBaseY, rOuterTopY);
    drawIsoBunting_b(
      rInnerX,
      rInnerTopY,
      rOuterX,
      rOuterTopY,
      6,
      6,
      [purpleMid_b, purpleDark_b, purpleLight_b],
      5.5,
      3.5,
    );
    drawIsoBunting_b(
      rInnerX,
      rInnerTopY + 12 * zoom,
      rOuterX,
      rOuterTopY + 10 * zoom,
      5,
      5,
      [purpleDark_b, purpleLight_b, purpleMid_b],
      4.5,
      3,
    );
  }

  // ========== STATION BUILDING (proper isometric alignment) ==========
  const stationX = screenPos.x - 16 * zoom;
  const stationY = screenPos.y - 8 * zoom;

  // Helper: Draw proper isometric sloped roof
  const drawSlopedRoof = (
    cx: number,
    cy: number,
    w: number,
    d: number,
    h: number,
    leftColor: string,
    rightColor: string,
    frontColor: string,
  ) => {
    const hw = w * zoom * 0.5;
    const hd = d * zoom * 0.25;
    const rh = h * zoom;

    // Left slope
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rh);
    ctx.lineTo(cx - hw, cy);
    ctx.lineTo(cx - hw, cy + hd);
    ctx.lineTo(cx, cy - rh + hd * 0.5);
    ctx.closePath();
    ctx.fill();

    // Right slope
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rh);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx + hw, cy + hd);
    ctx.lineTo(cx, cy - rh + hd * 0.5);
    ctx.closePath();
    ctx.fill();

    // Front gable
    ctx.fillStyle = frontColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rh + hd * 0.5);
    ctx.lineTo(cx - hw, cy + hd);
    ctx.lineTo(cx + hw, cy + hd);
    ctx.closePath();
    ctx.fill();
  };

  // Helper: Draw working clock face
  const drawClockFace = (
    cx: number,
    cy: number,
    radius: number,
    showNumerals: boolean = false,
  ) => {
    // Clock backing
    ctx.fillStyle = "#fffff8";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Hour markers
    ctx.fillStyle = "#1a1a1a";
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const markerR = radius * 0.85;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(angle) * markerR,
        cy + Math.sin(angle) * markerR,
        radius * 0.06,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    if (showNumerals) {
      ctx.font = `${Math.max(8 * zoom, radius * 0.25)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 1; i <= 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const numeralR = radius * 0.68;
        ctx.fillText(
          String(i),
          cx + Math.cos(angle) * numeralR,
          cy + Math.sin(angle) * numeralR,
        );
      }
    }

    // Animated hands
    const hourAngle = ((time * 0.03) % (Math.PI * 2)) - Math.PI / 2;
    const minAngle = ((time * 0.2) % (Math.PI * 2)) - Math.PI / 2;

    // Hour hand
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(hourAngle) * radius * 0.5,
      cy + Math.sin(hourAngle) * radius * 0.5,
    );
    ctx.stroke();

    // Minute hand
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(minAngle) * radius * 0.75,
      cy + Math.sin(minAngle) * radius * 0.75,
    );
    ctx.stroke();

    // Center cap
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.12, 0, Math.PI * 2);
    ctx.fill();
  };

  if (tower.level === 1) {
    // ========== LEVEL 1: BARRACKS - Steampunk Wooden Training Facility ==========
    const bX = stationX;
    const bY = stationY;

    // === STEPPED FOUNDATION with exposed machinery ===
    // Bottom step — rough-hewn stone plinth (widest)
    drawIsometricPrism(
      ctx,
      bX,
      bY + 10 * zoom,
      38,
      32,
      4,
      { top: "#505050", left: "#404040", right: "#333333" },
      zoom,
    );
    // Bottom step mortar lines
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 19 * zoom, bY + 11 * zoom);
    ctx.lineTo(bX, bY + 19 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 19 * zoom);
    ctx.lineTo(bX + 19 * zoom, bY + 11 * zoom);
    ctx.stroke();
    // Bottom step highlight mortar
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 19 * zoom, bY + 10.5 * zoom);
    ctx.lineTo(bX, bY + 18.5 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 18.5 * zoom);
    ctx.lineTo(bX + 19 * zoom, bY + 10.5 * zoom);
    ctx.stroke();

    // Middle step — dressed stone
    drawIsometricPrism(
      ctx,
      bX,
      bY + 6 * zoom,
      34,
      28,
      3,
      { top: "#585858", left: "#484848", right: "#383838" },
      zoom,
    );
    // Middle step mortar line
    ctx.strokeStyle = "rgba(0,0,0,0.13)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 17 * zoom, bY + 7 * zoom);
    ctx.lineTo(bX, bY + 14.5 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 14.5 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY + 7 * zoom);
    ctx.stroke();

    // Top step — polished stone cap
    drawIsometricPrism(
      ctx,
      bX,
      bY + 3 * zoom,
      30,
      24,
      3,
      { top: "#5a5a5a", left: "#4a4a4a", right: "#3a3a3a" },
      zoom,
    );

    // Copper trim band on top step edge — left face
    ctx.strokeStyle = "#c06020";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 15 * zoom, bY + 3.5 * zoom);
    ctx.lineTo(bX, bY + 10.5 * zoom);
    ctx.stroke();
    // Trim band — right face
    ctx.beginPath();
    ctx.moveTo(bX, bY + 10.5 * zoom);
    ctx.lineTo(bX + 15 * zoom, bY + 3.5 * zoom);
    ctx.stroke();

    // Copper rivets along trim — left face
    ctx.fillStyle = "#b87333";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 12 * zoom + i * 4 * zoom,
        bY + 4.5 * zoom + i * 1.5 * zoom,
        1.1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Copper rivets along trim — right face
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(
        bX + 2 * zoom + i * 3.5 * zoom,
        bY + 10 * zoom - i * 1.5 * zoom,
        1.1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Exposed pipes on foundation (left side)
    ctx.strokeStyle = "#6b5030";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, bY + 4 * zoom);
    ctx.lineTo(bX - 18 * zoom, bY - 5 * zoom);
    ctx.quadraticCurveTo(
      bX - 18 * zoom,
      bY - 10 * zoom,
      bX - 14 * zoom,
      bY - 10 * zoom,
    );
    ctx.stroke();
    // Pipe joints
    ctx.fillStyle = "#8a7355";
    ctx.beginPath();
    ctx.arc(bX - 18 * zoom, bY + 4 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 18 * zoom, bY - 5 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Industrial louvered exhaust vent with housing
    {
      const ventX = bX + 8 * zoom;
      const ventY = bY + 1 * zoom;
      const ventW = 7 * zoom;
      const ventH = 5 * zoom;

      // Vent recess shadow
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.moveTo(ventX, ventY);
      ctx.lineTo(ventX + ventW, ventY - ventW * 0.5);
      ctx.lineTo(ventX + ventW, ventY - ventW * 0.5 + ventH);
      ctx.lineTo(ventX, ventY + ventH);
      ctx.closePath();
      ctx.fill();

      // Louvered slats (angled for airflow)
      const numSlats = 4;
      for (let s = 0; s < numSlats; s++) {
        const slatT = (s + 0.5) / numSlats;
        const slatY = ventY + slatT * ventH;
        const slatYR = ventY - ventW * 0.5 + slatT * ventH;
        ctx.fillStyle = "#4a4a4a";
        ctx.beginPath();
        ctx.moveTo(ventX + 0.5 * zoom, slatY - 0.8 * zoom);
        ctx.lineTo(ventX + ventW - 0.5 * zoom, slatYR - 0.8 * zoom);
        ctx.lineTo(ventX + ventW - 0.5 * zoom, slatYR + 0.2 * zoom);
        ctx.lineTo(ventX + 0.5 * zoom, slatY + 0.2 * zoom);
        ctx.closePath();
        ctx.fill();
        // Slat highlight
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.moveTo(ventX + 0.5 * zoom, slatY - 0.8 * zoom);
        ctx.lineTo(ventX + ventW - 0.5 * zoom, slatYR - 0.8 * zoom);
        ctx.lineTo(ventX + ventW - 0.5 * zoom, slatYR - 0.4 * zoom);
        ctx.lineTo(ventX + 0.5 * zoom, slatY - 0.4 * zoom);
        ctx.closePath();
        ctx.fill();
      }

      // Inner warm glow between slats
      const ventGlow = 0.3 + Math.sin(time * 3) * 0.15;
      ctx.fillStyle = `rgba(255, 140, 40, ${ventGlow})`;
      ctx.beginPath();
      ctx.moveTo(ventX + 1 * zoom, ventY + 1 * zoom);
      ctx.lineTo(ventX + ventW - 1 * zoom, ventY - ventW * 0.5 + 1 * zoom);
      ctx.lineTo(
        ventX + ventW - 1 * zoom,
        ventY - ventW * 0.5 + ventH - 1 * zoom,
      );
      ctx.lineTo(ventX + 1 * zoom, ventY + ventH - 1 * zoom);
      ctx.closePath();
      ctx.fill();

      // Iron frame border
      ctx.strokeStyle = "#5a5a5a";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(ventX, ventY);
      ctx.lineTo(ventX + ventW, ventY - ventW * 0.5);
      ctx.lineTo(ventX + ventW, ventY - ventW * 0.5 + ventH);
      ctx.lineTo(ventX, ventY + ventH);
      ctx.closePath();
      ctx.stroke();

      // Corner rivets
      ctx.fillStyle = "#6a6a6a";
      const ventCorners = [
        { x: ventX + 0.8 * zoom, y: ventY + 0.5 * zoom },
        { x: ventX + ventW - 0.8 * zoom, y: ventY - ventW * 0.5 + 0.5 * zoom },
        { x: ventX + 0.8 * zoom, y: ventY + ventH - 0.5 * zoom },
        {
          x: ventX + ventW - 0.8 * zoom,
          y: ventY - ventW * 0.5 + ventH - 0.5 * zoom,
        },
      ];
      for (const c of ventCorners) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Heat shimmer / steam wisps rising from vent
      const ventSteam = 0.25 + Math.sin(time * 3) * 0.15;
      const shimmerDrift = Math.sin(time * 1.8) * 2;
      ctx.fillStyle = `rgba(200, 200, 200, ${ventSteam})`;
      for (let p = 0; p < 3; p++) {
        const pT = (time * 1.5 + p * 1.2) % 3;
        const pY = ventY - 2 * zoom - pT * 4 * zoom;
        const pAlpha = Math.max(0, ventSteam * (1 - pT / 3));
        ctx.fillStyle = `rgba(200, 200, 200, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(
          ventX + ventW * 0.5 + shimmerDrift + p * 1.5 * zoom,
          pY,
          (1.5 + pT * 0.8) * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // Main wooden building
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      32,
      26,
      28,
      { top: "#9b8365", left: "#7b6345", right: "#5b4325" },
      zoom,
    );

    // Horizontal log/plank details on left face
    ctx.strokeStyle = "#4a3215";
    ctx.lineWidth = 1.2 * zoom;
    for (let i = 0; i < 5; i++) {
      const ly = bY - 4 * zoom - i * 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bX - 14 * zoom, ly + 3.5 * zoom);
      ctx.lineTo(bX - 2 * zoom, ly + 6.5 * zoom);
      ctx.stroke();
    }

    // Vertical timber frame details on right face
    ctx.strokeStyle = "#4a3215";
    for (let i = 0; i < 3; i++) {
      const lx = bX + 4 * zoom + i * 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, bY - 2 * zoom);
      ctx.lineTo(lx, bY - 26 * zoom);
      ctx.stroke();
    }

    // Iron-bound double door with stone arch frame (left face)
    {
      const isoSlope = ISO_Y_RATIO;
      const doorL = bX - 13 * zoom;
      const doorR = bX - 2 * zoom;
      const doorBot = bY - 1 * zoom;
      const doorTopL = bY - 19 * zoom;
      const doorTopR = doorTopL + (doorR - doorL) * isoSlope;
      const doorMidX = (doorL + doorR) * 0.5;
      const doorMidTopY = (doorTopL + doorTopR) * 0.5;

      // Stone step at base
      ctx.fillStyle = "#6a5a4a";
      ctx.beginPath();
      ctx.moveTo(doorL - 1 * zoom, doorBot + 1 * zoom);
      ctx.lineTo(
        doorR + 1 * zoom,
        doorBot + 1 * zoom + (doorR - doorL + 2 * zoom) * isoSlope,
      );
      ctx.lineTo(
        doorR + 1 * zoom,
        doorBot + 3 * zoom + (doorR - doorL + 2 * zoom) * isoSlope,
      );
      ctx.lineTo(doorL - 1 * zoom, doorBot + 3 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.moveTo(
        doorR + 1 * zoom,
        doorBot + 1 * zoom + (doorR - doorL + 2 * zoom) * isoSlope,
      );
      ctx.lineTo(
        doorR + 1 * zoom,
        doorBot + 3 * zoom + (doorR - doorL + 2 * zoom) * isoSlope,
      );
      ctx.lineTo(
        doorR + 2 * zoom,
        doorBot + 2.5 * zoom + (doorR - doorL + 3 * zoom) * isoSlope,
      );
      ctx.lineTo(
        doorR + 2 * zoom,
        doorBot + 0.5 * zoom + (doorR - doorL + 3 * zoom) * isoSlope,
      );
      ctx.closePath();
      ctx.fill();

      // Deep recess shadow behind the door
      ctx.fillStyle = "#1a0e05";
      ctx.beginPath();
      ctx.moveTo(doorL, doorBot);
      ctx.lineTo(doorL, doorTopL);
      ctx.lineTo(doorR, doorTopR);
      ctx.lineTo(doorR, doorBot + (doorR - doorL) * isoSlope);
      ctx.closePath();
      ctx.fill();

      // Left door panel (darker wood)
      ctx.fillStyle = "#4a3215";
      ctx.beginPath();
      ctx.moveTo(doorL + 1 * zoom, doorBot);
      ctx.lineTo(doorL + 1 * zoom, doorTopL + 1 * zoom);
      ctx.lineTo(doorMidX, doorMidTopY + 0.5 * zoom);
      ctx.lineTo(doorMidX, doorBot + (doorMidX - doorL) * isoSlope);
      ctx.closePath();
      ctx.fill();

      // Right door panel (slightly lighter)
      ctx.fillStyle = "#553b1a";
      ctx.beginPath();
      ctx.moveTo(doorMidX, doorBot + (doorMidX - doorL) * isoSlope);
      ctx.lineTo(doorMidX, doorMidTopY + 0.5 * zoom);
      ctx.lineTo(doorR - 1 * zoom, doorTopR + 1 * zoom);
      ctx.lineTo(
        doorR - 1 * zoom,
        doorBot + (doorR - doorL - 1 * zoom) * isoSlope,
      );
      ctx.closePath();
      ctx.fill();

      // Iron strap hinges (3 on each panel)
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1.8 * zoom;
      for (let h = 0; h < 3; h++) {
        const hingeY = doorBot - 3 * zoom - h * 5.5 * zoom;
        const hingeYL = hingeY;
        const hingeYR = hingeY + (doorMidX - doorL) * isoSlope;
        ctx.beginPath();
        ctx.moveTo(doorL + 1.5 * zoom, hingeYL);
        ctx.lineTo(doorMidX - 1 * zoom, hingeYR);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(doorMidX + 1 * zoom, hingeYR);
        ctx.lineTo(
          doorR - 1.5 * zoom,
          hingeYR + (doorR - doorMidX - 2.5 * zoom) * isoSlope,
        );
        ctx.stroke();
      }

      // Iron strap hinge rivets
      ctx.fillStyle = "#5a5a5a";
      for (let h = 0; h < 3; h++) {
        const hingeY = doorBot - 3 * zoom - h * 5.5 * zoom;
        ctx.beginPath();
        ctx.arc(
          doorL + 2 * zoom,
          hingeY + 0.2 * zoom,
          0.8 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.beginPath();
        ctx.arc(
          doorR - 2 * zoom,
          hingeY + (doorR - doorL - 2 * zoom) * isoSlope,
          0.8 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Door split line
      ctx.strokeStyle = "#2a1a08";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(doorMidX, doorBot + (doorMidX - doorL) * isoSlope);
      ctx.lineTo(doorMidX, doorMidTopY + 0.5 * zoom);
      ctx.stroke();

      // Stone arch frame with double molding
      ctx.strokeStyle = "#7a6a5a";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(doorL - 0.5 * zoom, doorBot);
      ctx.lineTo(doorL - 0.5 * zoom, doorTopL - 1 * zoom);
      ctx.lineTo(doorR + 0.5 * zoom, doorTopR - 1 * zoom);
      ctx.lineTo(
        doorR + 0.5 * zoom,
        doorBot + (doorR - doorL + 1 * zoom) * isoSlope,
      );
      ctx.stroke();
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(doorL - 1.5 * zoom, doorBot);
      ctx.lineTo(doorL - 1.5 * zoom, doorTopL - 2 * zoom);
      ctx.lineTo(doorR + 1.5 * zoom, doorTopR - 2 * zoom);
      ctx.lineTo(
        doorR + 1.5 * zoom,
        doorBot + (doorR - doorL + 3 * zoom) * isoSlope,
      );
      ctx.stroke();

      // Brass door ring handles with shadow
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.arc(
        doorMidX - 2.5 * zoom,
        doorBot - 8 * zoom + (doorMidX - 2.5 * zoom - doorL) * isoSlope,
        1.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(
        doorMidX + 2.5 * zoom,
        doorBot - 8 * zoom + (doorMidX + 2.5 * zoom - doorL) * isoSlope,
        1.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(
        doorMidX - 2.5 * zoom,
        doorBot - 10 * zoom + (doorMidX - 2.5 * zoom - doorL) * isoSlope,
        0.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        doorMidX + 2.5 * zoom,
        doorBot - 10 * zoom + (doorMidX + 2.5 * zoom - doorL) * isoSlope,
        0.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Warm interior light spill from door gap
      const doorGlow = 0.2 + Math.sin(time * 1.5) * 0.08;
      ctx.fillStyle = `rgba(255, 180, 80, ${doorGlow})`;
      ctx.beginPath();
      ctx.moveTo(
        doorMidX - 0.5 * zoom,
        doorBot + (doorMidX - 0.5 * zoom - doorL) * isoSlope,
      );
      ctx.lineTo(
        doorMidX + 0.5 * zoom,
        doorBot + (doorMidX + 0.5 * zoom - doorL) * isoSlope,
      );
      ctx.lineTo(doorMidX + 0.5 * zoom, doorMidTopY + 2 * zoom);
      ctx.lineTo(doorMidX - 0.5 * zoom, doorMidTopY + 2 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // Gothic arched window with stained glass (right face, isometric)
    {
      const wCx = bX + 9 * zoom;
      const wCy = bY - 20 * zoom;
      const wHalfW = 4.5 * zoom;
      const wHalfH = 6 * zoom;
      const wSlope = -0.5;

      const wTlx = wCx - wHalfW;
      const wTly = wCy - wHalfH - wHalfW * wSlope;
      const wTrx = wCx + wHalfW;
      const wTry = wCy - wHalfH + wHalfW * wSlope;
      const wBrx = wCx + wHalfW;
      const wBry = wCy + wHalfH + wHalfW * wSlope;
      const wBlx = wCx - wHalfW;
      const wBly = wCy + wHalfH - wHalfW * wSlope;

      // Gothic pointed arch peak
      const archPeakX = (wTlx + wTrx) * 0.5;
      const archPeakY = (wTly + wTry) * 0.5 - 3 * zoom;

      // Deep stone recess behind window
      ctx.fillStyle = "#1a1208";
      ctx.beginPath();
      ctx.moveTo(wBlx, wBly);
      ctx.lineTo(wTlx, wTly);
      ctx.quadraticCurveTo(
        wTlx + 1 * zoom,
        archPeakY + 1 * zoom,
        archPeakX,
        archPeakY,
      );
      ctx.quadraticCurveTo(wTrx - 1 * zoom, wTry + 1 * zoom, wTrx, wTry);
      ctx.lineTo(wBrx, wBry);
      ctx.closePath();
      ctx.fill();

      // Warm interior glow (stained glass effect)
      const winGlow1 = 0.5 + Math.sin(time * 2) * 0.2;
      const glassInset = 1.2 * zoom;
      ctx.fillStyle = `rgba(255, 180, 80, ${winGlow1})`;
      ctx.beginPath();
      ctx.moveTo(wBlx + glassInset, wBly - glassInset * 0.5);
      ctx.lineTo(wTlx + glassInset, wTly + glassInset * 0.5);
      ctx.quadraticCurveTo(
        wTlx + 2 * zoom,
        archPeakY + 2 * zoom,
        archPeakX,
        archPeakY + glassInset,
      );
      ctx.quadraticCurveTo(
        wTrx - 2 * zoom,
        wTry + 2 * zoom,
        wTrx - glassInset,
        wTry + glassInset * 0.5,
      );
      ctx.lineTo(wBrx - glassInset, wBry - glassInset * 0.5);
      ctx.closePath();
      ctx.fill();

      // Colored glass panes (amber and copper tones)
      const paneColors = [
        `rgba(200, 120, 40, ${winGlow1 * 0.5})`,
        `rgba(180, 90, 30, ${winGlow1 * 0.4})`,
        `rgba(220, 160, 60, ${winGlow1 * 0.45})`,
        `rgba(160, 80, 40, ${winGlow1 * 0.35})`,
      ];
      const wMidTopX = (wTlx + wTrx) * 0.5;
      const wMidTopY = (wTly + wTry) * 0.5;
      const wMidBotX = (wBlx + wBrx) * 0.5;
      const wMidBotY = (wBly + wBry) * 0.5;
      const wMidLeftX = (wTlx + wBlx) * 0.5;
      const wMidLeftY = (wTly + wBly) * 0.5;
      const wMidRightX = (wTrx + wBrx) * 0.5;
      const wMidRightY = (wTry + wBry) * 0.5;

      // Top-left pane
      ctx.fillStyle = paneColors[0];
      ctx.beginPath();
      ctx.moveTo(wMidLeftX, wMidLeftY);
      ctx.lineTo(wTlx + glassInset, wTly + glassInset * 0.5);
      ctx.quadraticCurveTo(
        wTlx + 2 * zoom,
        archPeakY + 2 * zoom,
        archPeakX,
        archPeakY + glassInset,
      );
      ctx.lineTo(wMidTopX, wMidTopY);
      ctx.closePath();
      ctx.fill();
      // Top-right pane
      ctx.fillStyle = paneColors[1];
      ctx.beginPath();
      ctx.moveTo(wMidTopX, wMidTopY);
      ctx.lineTo(archPeakX, archPeakY + glassInset);
      ctx.quadraticCurveTo(
        wTrx - 2 * zoom,
        wTry + 2 * zoom,
        wTrx - glassInset,
        wTry + glassInset * 0.5,
      );
      ctx.lineTo(wMidRightX, wMidRightY);
      ctx.closePath();
      ctx.fill();
      // Bottom-left pane
      ctx.fillStyle = paneColors[2];
      ctx.beginPath();
      ctx.moveTo(wBlx + glassInset, wBly - glassInset * 0.5);
      ctx.lineTo(wMidLeftX, wMidLeftY);
      ctx.lineTo(wMidBotX, wMidBotY);
      ctx.closePath();
      ctx.fill();
      // Bottom-right pane
      ctx.fillStyle = paneColors[3];
      ctx.beginPath();
      ctx.moveTo(wMidBotX, wMidBotY);
      ctx.lineTo(wMidRightX, wMidRightY);
      ctx.lineTo(wBrx - glassInset, wBry - glassInset * 0.5);
      ctx.closePath();
      ctx.fill();

      // Lead came mullion cross (dark iron)
      ctx.strokeStyle = "#2a1a08";
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(wMidTopX, wMidTopY);
      ctx.lineTo(wMidBotX, wMidBotY);
      ctx.moveTo(wMidLeftX, wMidLeftY);
      ctx.lineTo(wMidRightX, wMidRightY);
      ctx.stroke();
      // Came highlight
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(wMidTopX - 0.5 * zoom, wMidTopY);
      ctx.lineTo(wMidBotX - 0.5 * zoom, wMidBotY);
      ctx.stroke();

      // Stone arch frame with double molding
      ctx.strokeStyle = "#6a5a4a";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(wBlx - 0.5 * zoom, wBly + 0.5 * zoom);
      ctx.lineTo(wTlx - 0.5 * zoom, wTly - 0.5 * zoom);
      ctx.quadraticCurveTo(
        wTlx,
        archPeakY - 0.5 * zoom,
        archPeakX,
        archPeakY - 1.5 * zoom,
      );
      ctx.quadraticCurveTo(
        wTrx,
        wTry - 0.5 * zoom,
        wTrx + 0.5 * zoom,
        wTry - 0.5 * zoom,
      );
      ctx.lineTo(wBrx + 0.5 * zoom, wBry + 0.5 * zoom);
      ctx.stroke();
      // Outer frame
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(wBlx - 1.5 * zoom, wBly + 1 * zoom);
      ctx.lineTo(wTlx - 1.5 * zoom, wTly - 1 * zoom);
      ctx.quadraticCurveTo(
        wTlx - 0.5 * zoom,
        archPeakY - 1.5 * zoom,
        archPeakX,
        archPeakY - 3 * zoom,
      );
      ctx.quadraticCurveTo(
        wTrx + 0.5 * zoom,
        wTry - 1 * zoom,
        wTrx + 1.5 * zoom,
        wTry - 1 * zoom,
      );
      ctx.lineTo(wBrx + 1.5 * zoom, wBry + 1 * zoom);
      ctx.stroke();

      // Sill (bottom stone ledge)
      ctx.fillStyle = "#7a6a5a";
      ctx.beginPath();
      ctx.moveTo(wBlx - 1 * zoom, wBly + 0.5 * zoom);
      ctx.lineTo(wBrx + 1 * zoom, wBry + 0.5 * zoom);
      ctx.lineTo(wBrx + 1.5 * zoom, wBry + 2 * zoom);
      ctx.lineTo(wBlx - 1.5 * zoom, wBly + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Light spill below window
      ctx.fillStyle = `rgba(255, 200, 100, ${winGlow1 * 0.12})`;
      ctx.beginPath();
      ctx.moveTo(wBlx, wBly + 2 * zoom);
      ctx.lineTo(wBrx, wBry + 2 * zoom);
      ctx.lineTo(wBrx + 3 * zoom, wBry + 8 * zoom);
      ctx.lineTo(wBlx - 3 * zoom, wBly + 8 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // === HIGH-TECH ELEMENT: Power conduit on wall ===
    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX + 16 * zoom, bY - 5 * zoom);
    ctx.lineTo(bX + 16 * zoom, bY - 20 * zoom);
    ctx.stroke();
    // Conduit glow nodes
    const nodeGlow = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.fillStyle = `rgba(255, 108, 0, ${nodeGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 4 * zoom;
    ctx.beginPath();
    ctx.arc(bX + 16 * zoom, bY - 8 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX + 16 * zoom, bY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Square pyramid roof (4 triangular faces meeting at a single peak)
    const roofBaseY = bY - 24 * zoom;
    const eaveOH = 3 * zoom;
    const eHW = 18 * zoom + eaveOH;
    const eHD = 7.5 * zoom + eaveOH * 0.5;
    const rH = 22 * zoom;

    // Eave diamond corners (isometric diamond with overhang)
    const eBack = { x: bX, y: roofBaseY - eHD };
    const eRight = { x: bX + eHW, y: roofBaseY };
    const eFront = { x: bX, y: roofBaseY + eHD };
    const eLeft = { x: bX - eHW, y: roofBaseY };

    // Single peak point (center of diamond, elevated)
    const peak = { x: bX, y: roofBaseY - rH };

    // Back face (away from camera, draw first)
    ctx.fillStyle = "#4b3315";
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.lineTo(eBack.x, eBack.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.closePath();
    ctx.fill();

    // Left face (faces camera-left, brightest)
    const leftGrad = ctx.createLinearGradient(peak.x, peak.y, eLeft.x, eLeft.y);
    leftGrad.addColorStop(0, "#7b6345");
    leftGrad.addColorStop(0.4, "#8b7355");
    leftGrad.addColorStop(1, "#6b5535");
    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.closePath();
    ctx.fill();

    // Right face (faces camera-right, shadowed)
    const rightGrad = ctx.createLinearGradient(
      peak.x,
      peak.y,
      eRight.x,
      eRight.y,
    );
    rightGrad.addColorStop(0, "#6a5535");
    rightGrad.addColorStop(0.4, "#5e4a2c");
    rightGrad.addColorStop(1, "#544025");
    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.closePath();
    ctx.fill();

    // Front face left half (lit, matching left slope)
    const frontLeftGrad = ctx.createLinearGradient(
      peak.x,
      peak.y,
      eFront.x,
      eFront.y,
    );
    frontLeftGrad.addColorStop(0, "#7b6345");
    frontLeftGrad.addColorStop(0.5, "#8b7050");
    frontLeftGrad.addColorStop(1, "#6b5535");
    ctx.fillStyle = frontLeftGrad;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.closePath();
    ctx.fill();

    // Front face right half (shadowed, matching right slope)
    const frontRightGrad = ctx.createLinearGradient(
      peak.x,
      peak.y,
      eFront.x,
      eFront.y,
    );
    frontRightGrad.addColorStop(0, "#6a5535");
    frontRightGrad.addColorStop(0.5, "#5e4a2c");
    frontRightGrad.addColorStop(1, "#544025");
    ctx.fillStyle = frontRightGrad;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.closePath();
    ctx.fill();

    // Wooden shingle rows on left face
    ctx.strokeStyle = "rgba(30, 20, 8, 0.4)";
    ctx.lineWidth = 0.7 * zoom;
    for (let row = 1; row <= 6; row++) {
      const t = row / 7;
      const plX = peak.x + (eLeft.x - peak.x) * t;
      const plY = peak.y + (eLeft.y - peak.y) * t;
      const pfX = peak.x + (eFront.x - peak.x) * t;
      const pfY = peak.y + (eFront.y - peak.y) * t;
      ctx.beginPath();
      ctx.moveTo(plX, plY);
      ctx.lineTo(pfX, pfY);
      ctx.stroke();
    }

    // Wooden shingle rows on right face
    for (let row = 1; row <= 6; row++) {
      const t = row / 7;
      const prX = peak.x + (eRight.x - peak.x) * t;
      const prY = peak.y + (eRight.y - peak.y) * t;
      const pfX = peak.x + (eFront.x - peak.x) * t;
      const pfY = peak.y + (eFront.y - peak.y) * t;
      ctx.beginPath();
      ctx.moveTo(prX, prY);
      ctx.lineTo(pfX, pfY);
      ctx.stroke();
    }

    // Front face shingle rows (V-lines)
    for (let row = 1; row <= 6; row++) {
      const t = row / 7;
      const plX = peak.x + (eLeft.x - peak.x) * t;
      const plY = peak.y + (eLeft.y - peak.y) * t;
      const prX = peak.x + (eRight.x - peak.x) * t;
      const prY = peak.y + (eRight.y - peak.y) * t;
      const fcX = peak.x + (eFront.x - peak.x) * t;
      const fcY = peak.y + (eFront.y - peak.y) * t;
      ctx.beginPath();
      ctx.moveTo(plX, plY);
      ctx.lineTo(fcX, fcY);
      ctx.lineTo(prX, prY);
      ctx.stroke();
    }

    // Roof edge outlines (only viewer-facing ridges and eaves)
    ctx.strokeStyle = "rgba(40, 24, 8, 0.55)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.moveTo(peak.x, peak.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.stroke();

    // Eave edge outlines (visible front edges only)
    ctx.strokeStyle = "rgba(40, 24, 8, 0.6)";
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(eLeft.x, eLeft.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.stroke();

    // Eave fascia thickness (visible underside strip)
    ctx.fillStyle = "rgba(58, 38, 16, 0.25)";
    ctx.beginPath();
    ctx.moveTo(eLeft.x, eLeft.y);
    ctx.lineTo(eFront.x, eFront.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.lineTo(eRight.x, eRight.y + 2 * zoom);
    ctx.lineTo(eFront.x, eFront.y + 2 * zoom);
    ctx.lineTo(eLeft.x, eLeft.y + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Eave shadow outline (back edges)
    ctx.strokeStyle = "rgba(42, 26, 8, 0.2)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(eBack.x, eBack.y);
    ctx.lineTo(eLeft.x, eLeft.y);
    ctx.moveTo(eBack.x, eBack.y);
    ctx.lineTo(eRight.x, eRight.y);
    ctx.stroke();

    // Copper ridge cap rivets along front ridges
    ctx.fillStyle = "#8b7355";
    for (const corner of [eLeft, eRight]) {
      for (let ri = 1; ri <= 3; ri++) {
        const rt = ri / 4;
        const rx = peak.x + (corner.x - peak.x) * rt;
        const ry = peak.y + (corner.y - peak.y) * rt;
        ctx.beginPath();
        ctx.arc(rx, ry, 1.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Brass finial at peak with subtle glow
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(peak.x, peak.y - 1.5 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a08020";
    ctx.beginPath();
    ctx.arc(peak.x, peak.y - 1.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Finial spike
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y - 3.5 * zoom);
    ctx.lineTo(peak.x, peak.y - 8 * zoom);
    ctx.stroke();
    ctx.fillStyle = "#e8c847";
    ctx.beginPath();
    ctx.arc(peak.x, peak.y - 8 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Stone chimney with smoke stack and mortar detail
    const chimneyBaseY = roofBaseY + 4 * zoom;
    const chimX = bX + 10 * zoom;
    drawIsometricPrism(
      ctx,
      chimX,
      chimneyBaseY - 8 * zoom,
      5,
      4,
      14,
      { top: "#6a6a6a", left: "#5a5a5a", right: "#4a4a4a" },
      zoom,
    );

    // Chimney mortar lines (horizontal)
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.6 * zoom;
    for (let m = 1; m <= 4; m++) {
      const mY = chimneyBaseY - 8 * zoom - m * 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(chimX - 2.5 * zoom, mY);
      ctx.lineTo(chimX, mY + 1 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(chimX, mY + 1 * zoom);
      ctx.lineTo(chimX + 2.5 * zoom, mY);
      ctx.stroke();
    }

    // Soot staining on chimney (dark gradient)
    ctx.fillStyle = "rgba(20,15,10,0.15)";
    ctx.beginPath();
    ctx.moveTo(chimX - 2.5 * zoom, chimneyBaseY - 18 * zoom);
    ctx.lineTo(chimX, chimneyBaseY - 17 * zoom);
    ctx.lineTo(chimX, chimneyBaseY - 22 * zoom);
    ctx.lineTo(chimX - 2.5 * zoom, chimneyBaseY - 22 * zoom);
    ctx.closePath();
    ctx.fill();

    // Chimney cap with overhang
    drawIsometricPrism(
      ctx,
      chimX,
      chimneyBaseY - 22 * zoom,
      7,
      5,
      2,
      { top: "#5a5a5a", left: "#4a4a4a", right: "#3a3a3a" },
      zoom,
    );
    // Cap underside shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.moveTo(chimX - 3.5 * zoom, chimneyBaseY - 22 * zoom);
    ctx.lineTo(chimX, chimneyBaseY - 22 * zoom + 1.25 * zoom);
    ctx.lineTo(chimX + 3.5 * zoom, chimneyBaseY - 22 * zoom);
    ctx.lineTo(chimX, chimneyBaseY - 22 * zoom - 1.25 * zoom);
    ctx.closePath();
    ctx.fill();

    // Chimney fire glow at opening
    const chimneyFireGlow = 0.3 + Math.sin(time * 4) * 0.15;
    ctx.fillStyle = `rgba(255, 120, 30, ${chimneyFireGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      chimX,
      chimneyBaseY - 24.5 * zoom,
      1.8 * zoom,
      0.9 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Multi-layer smoke wisps with wind drift
    const windDrift = Math.sin(time * 0.8) * 4;
    for (let s = 0; s < 5; s++) {
      const smokeT = ((time * 0.6 + s * 0.7) % 3.5) / 3.5;
      const smokeAlpha = 0.3 * (1 - smokeT) * (1 - smokeT);
      const smokeRadius = (2 + smokeT * 3.5) * zoom;
      const smokeX = chimX + windDrift * smokeT + s * 0.8 * zoom * smokeT;
      const smokeY = chimneyBaseY - 26 * zoom - smokeT * 16 * zoom;
      ctx.fillStyle = `rgba(160, 155, 145, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // === HIGH-TECH: Small gear on side ===
    const gearX1 = bX - 16 * zoom;
    const gearY1 = bY - 6 * zoom;
    ctx.fillStyle = "#8b7355";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.5;
      const r = i % 2 === 0 ? 3 * zoom : 2.2 * zoom;
      const x = gearX1 + Math.cos(angle) * r;
      const y = gearY1 + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.ellipse(gearX1, gearY1, 1.2 * zoom, 0.6 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // (Sign removed)

    // Weathervane drawn here for level 1 so it layers behind the semaphore
    drawWeathervane(ctx, screenPos, tower, zoom, time);

    // === Railroad semaphore signal (left side) — isometric 3D ===
    {
      const sigX = bX - 14 * zoom;
      const sigY = bY - 6 * zoom;
      const poleH = 34 * zoom;
      const poleTop = sigY - poleH;
      const poleW = 1.8 * zoom;
      const isoDepth = poleW * 0.5;

      // --- Isometric base plate (thick iron slab) ---
      drawIsometricPrism(
        ctx,
        sigX,
        sigY + 1 * zoom,
        8,
        6,
        2,
        { top: "#5a5a5a", left: "#4a4a4a", right: "#3a3a3a" },
        zoom,
      );
      // Base rivets (four corners)
      ctx.fillStyle = "#6a6a6a";
      for (const [rx, ry] of [
        [-2.5, -0.2],
        [2.5, -0.2],
        [0, -1.2],
        [0, 1],
      ] as const) {
        ctx.beginPath();
        ctx.arc(
          sigX + rx * zoom,
          sigY + 1 * zoom + ry * zoom,
          0.6 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // --- 3D isometric pole (four-faced prism) ---
      // Right face (darker)
      ctx.fillStyle = "#383838";
      ctx.beginPath();
      ctx.moveTo(sigX + poleW * 0.5, sigY);
      ctx.lineTo(sigX + poleW * 0.5 + isoDepth, sigY - isoDepth * 0.5);
      ctx.lineTo(sigX + poleW * 0.5 + isoDepth, poleTop - isoDepth * 0.5);
      ctx.lineTo(sigX + poleW * 0.5, poleTop);
      ctx.closePath();
      ctx.fill();
      // Left face (lighter)
      ctx.fillStyle = "#505050";
      ctx.beginPath();
      ctx.moveTo(sigX - poleW * 0.5, sigY);
      ctx.lineTo(sigX - poleW * 0.5 - isoDepth, sigY - isoDepth * 0.5);
      ctx.lineTo(sigX - poleW * 0.5 - isoDepth, poleTop - isoDepth * 0.5);
      ctx.lineTo(sigX - poleW * 0.5, poleTop);
      ctx.closePath();
      ctx.fill();
      // Front face
      ctx.fillStyle = "#454545";
      ctx.fillRect(sigX - poleW * 0.5, poleTop, poleW, poleH);
      // Front edge highlight
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(sigX - poleW * 0.5, poleTop, 0.6 * zoom, poleH);

      // Pole iron collar bands (3 evenly spaced)
      ctx.fillStyle = "#5a5a5a";
      for (let cb = 0; cb < 3; cb++) {
        const cby = sigY - 4 * zoom - cb * 10 * zoom;
        ctx.fillRect(
          sigX - poleW * 0.5 - 0.5 * zoom,
          cby - 0.8 * zoom,
          poleW + 1 * zoom,
          1.6 * zoom,
        );
        // Band right-face extension
        ctx.fillStyle = "#484848";
        ctx.beginPath();
        ctx.moveTo(sigX + poleW * 0.5 + 0.5 * zoom, cby - 0.8 * zoom);
        ctx.lineTo(
          sigX + poleW * 0.5 + isoDepth + 0.5 * zoom,
          cby - 0.8 * zoom - isoDepth * 0.5,
        );
        ctx.lineTo(
          sigX + poleW * 0.5 + isoDepth + 0.5 * zoom,
          cby + 0.8 * zoom - isoDepth * 0.5,
        );
        ctx.lineTo(sigX + poleW * 0.5 + 0.5 * zoom, cby + 0.8 * zoom);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#5a5a5a";
      }

      // --- Diagonal support struts (isometric braces from pole to base) ---
      ctx.strokeStyle = "#4a4a4a";
      ctx.lineWidth = 1.2 * zoom;
      // Left brace
      ctx.beginPath();
      ctx.moveTo(sigX - poleW * 0.5, sigY - 8 * zoom);
      ctx.lineTo(sigX - 3.5 * zoom, sigY - 0.5 * zoom);
      ctx.stroke();
      // Right brace
      ctx.beginPath();
      ctx.moveTo(sigX + poleW * 0.5, sigY - 8 * zoom);
      ctx.lineTo(sigX + 3.5 * zoom, sigY - 0.5 * zoom);
      ctx.stroke();

      // --- Animated semaphore arm — 3D isometric blade (behind lamp) ---
      const armAngle = Math.sin(time * 0.4) * 0.35 - 0.2;
      const armLen = 11 * zoom;
      const armThick = 1.8 * zoom;
      const armDepthOff = 1 * zoom;
      const pivotX = sigX;
      const pivotY = poleTop + 2 * zoom;
      const cosA = Math.cos(armAngle);
      const sinA = Math.sin(armAngle);
      const tipX = pivotX + cosA * armLen;
      const tipY = pivotY - sinA * armLen;
      const perpX = sinA * armThick;
      const perpY = cosA * armThick;

      // Arm shadow on building
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.moveTo(pivotX + 1, pivotY + 1);
      ctx.lineTo(tipX + 1, tipY + 1);
      ctx.lineTo(tipX + perpX + 1, tipY + perpY + 1);
      ctx.lineTo(pivotX + perpX + 1, pivotY + perpY + 1);
      ctx.closePath();
      ctx.fill();

      // Arm isometric bottom face (depth)
      ctx.fillStyle = "#7a1510";
      ctx.beginPath();
      ctx.moveTo(pivotX + perpX, pivotY + perpY);
      ctx.lineTo(tipX + perpX, tipY + perpY);
      ctx.lineTo(tipX + perpX + armDepthOff, tipY + perpY - armDepthOff * 0.5);
      ctx.lineTo(
        pivotX + perpX + armDepthOff,
        pivotY + perpY - armDepthOff * 0.5,
      );
      ctx.closePath();
      ctx.fill();

      // Arm main face — red
      ctx.fillStyle = "#c03020";
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(tipX + perpX, tipY + perpY);
      ctx.lineTo(pivotX + perpX, pivotY + perpY);
      ctx.closePath();
      ctx.fill();

      // White stripe on outer third
      const st = 0.62;
      const ssx = pivotX + (tipX - pivotX) * st;
      const ssy = pivotY + (tipY - pivotY) * st;
      ctx.fillStyle = "#e8e0d0";
      ctx.beginPath();
      ctx.moveTo(ssx, ssy);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(tipX + perpX, tipY + perpY);
      ctx.lineTo(ssx + perpX, ssy + perpY);
      ctx.closePath();
      ctx.fill();

      // Arm top edge highlight
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Arm isometric top face
      ctx.fillStyle = "#d44030";
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(tipX + armDepthOff, tipY - armDepthOff * 0.5);
      ctx.lineTo(pivotX + armDepthOff, pivotY - armDepthOff * 0.5);
      ctx.closePath();
      ctx.fill();

      // Counterbalance weight at tip (3D disc)
      ctx.fillStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.ellipse(
        tipX + perpX * 0.5,
        tipY + perpY * 0.5,
        2.2 * zoom,
        1.2 * zoom,
        armAngle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.ellipse(
        tipX + perpX * 0.5,
        tipY + perpY * 0.5,
        1.5 * zoom,
        0.8 * zoom,
        armAngle,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Pivot bolt (visible brass circle)
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(
        pivotX + perpX * 0.5,
        pivotY + perpY * 0.5,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#e8c847";
      ctx.beginPath();
      ctx.arc(
        pivotX + perpX * 0.5 - 0.3 * zoom,
        pivotY + perpY * 0.5 - 0.3 * zoom,
        0.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // --- Finial cap at pole top (behind lamp, 3D sphere with specular) ---
      const finGrad = ctx.createRadialGradient(
        sigX - 0.6 * zoom,
        poleTop - 2 * zoom,
        0,
        sigX,
        poleTop - 1.2 * zoom,
        2.5 * zoom,
      );
      finGrad.addColorStop(0, "#7a7a7a");
      finGrad.addColorStop(0.5, "#5a5a5a");
      finGrad.addColorStop(1, "#3a3a3a");
      ctx.fillStyle = finGrad;
      ctx.beginPath();
      ctx.arc(sigX, poleTop - 1.2 * zoom, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.beginPath();
      ctx.arc(
        sigX - 0.5 * zoom,
        poleTop - 2 * zoom,
        0.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // --- 3D lamp housing (isometric box, drawn last = in front) ---
      const lampY = poleTop + 10 * zoom;
      drawIsometricPrism(
        ctx,
        sigX,
        lampY,
        4,
        3,
        5,
        { top: "#4a4a4a", left: "#5a5a5a", right: "#3a3a3a" },
        zoom,
      );
      // Lamp glass pane on front face (inset glow)
      const isGreen = Math.sin(time * 0.4) < 0;
      const lampGlow = 0.8 + Math.sin(time * 2.5) * 0.15;
      const lampColor = isGreen
        ? `rgba(50, 220, 80, ${lampGlow})`
        : `rgba(220, 50, 30, ${lampGlow})`;
      ctx.fillStyle = lampColor;
      ctx.fillRect(sigX - 1.2 * zoom, lampY - 4 * zoom, 2.4 * zoom, 3 * zoom);
      // Glow halo
      ctx.fillStyle = isGreen
        ? `rgba(50, 220, 80, ${lampGlow * 0.25})`
        : `rgba(220, 50, 30, ${lampGlow * 0.25})`;
      ctx.beginPath();
      ctx.arc(sigX, lampY - 2.5 * zoom, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // === Cargo crates & barrel (left side, base level) ===
    {
      const crateX = bX - 12 * zoom;
      const crateY = bY + 8 * zoom;

      // Bottom crate — weathered wood
      drawIsometricPrism(
        ctx,
        crateX,
        crateY,
        6,
        5,
        5,
        { top: "#8a7050", left: "#6a5030", right: "#4a3818" },
        zoom,
      );
      // Iron straps
      ctx.strokeStyle = "#4a4a4a";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(crateX - 3 * zoom, crateY - 2 * zoom);
      ctx.lineTo(crateX, crateY - 0.5 * zoom);
      ctx.lineTo(crateX + 3 * zoom, crateY - 2 * zoom);
      ctx.stroke();
      // Stencil mark (small diamond logo)
      ctx.fillStyle = "#c06020";
      ctx.beginPath();
      ctx.moveTo(crateX + 1.5 * zoom, crateY - 3 * zoom);
      ctx.lineTo(crateX + 2.5 * zoom, crateY - 3.8 * zoom);
      ctx.lineTo(crateX + 1.5 * zoom, crateY - 4.6 * zoom);
      ctx.lineTo(crateX + 0.5 * zoom, crateY - 3.8 * zoom);
      ctx.closePath();
      ctx.fill();

      // Top crate — slightly smaller, rotated
      drawIsometricPrism(
        ctx,
        crateX + 1 * zoom,
        crateY - 5 * zoom,
        5,
        4,
        4,
        { top: "#7a6545", left: "#5a4525", right: "#3a2d12" },
        zoom,
      );
      // Iron strap
      ctx.strokeStyle = "#4a4a4a";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(crateX - 1.5 * zoom, crateY - 7 * zoom);
      ctx.lineTo(crateX + 1 * zoom, crateY - 6 * zoom);
      ctx.lineTo(crateX + 3.5 * zoom, crateY - 7 * zoom);
      ctx.stroke();

      // Small barrel next to crates
      const barrelX = crateX - 6 * zoom;
      const barrelY = crateY - 1 * zoom;
      // Barrel body (elliptical, slightly bulging)
      const barrelGrad = ctx.createRadialGradient(
        barrelX - 0.5 * zoom,
        barrelY - 2 * zoom,
        0,
        barrelX,
        barrelY - 2 * zoom,
        3 * zoom,
      );
      barrelGrad.addColorStop(0, "#8a6a40");
      barrelGrad.addColorStop(0.7, "#6a4a28");
      barrelGrad.addColorStop(1, "#4a3018");
      ctx.fillStyle = barrelGrad;
      ctx.beginPath();
      ctx.moveTo(barrelX - 2.5 * zoom, barrelY);
      ctx.quadraticCurveTo(
        barrelX - 3 * zoom,
        barrelY - 2.5 * zoom,
        barrelX - 2.5 * zoom,
        barrelY - 5 * zoom,
      );
      ctx.lineTo(barrelX + 2.5 * zoom, barrelY - 5 * zoom);
      ctx.quadraticCurveTo(
        barrelX + 3 * zoom,
        barrelY - 2.5 * zoom,
        barrelX + 2.5 * zoom,
        barrelY,
      );
      ctx.closePath();
      ctx.fill();
      // Barrel top (ellipse)
      ctx.fillStyle = "#7a5a35";
      ctx.beginPath();
      ctx.ellipse(
        barrelX,
        barrelY - 5 * zoom,
        2.5 * zoom,
        1.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Iron hoops
      ctx.strokeStyle = "#5a5a5a";
      ctx.lineWidth = 1 * zoom;
      for (const hoopY of [barrelY - 1 * zoom, barrelY - 4 * zoom]) {
        ctx.beginPath();
        ctx.moveTo(barrelX - 2.7 * zoom, hoopY);
        ctx.quadraticCurveTo(
          barrelX,
          hoopY + 0.8 * zoom,
          barrelX + 2.7 * zoom,
          hoopY,
        );
        ctx.stroke();
      }
    }

    // === Lantern on post ===
    const lanternX = bX + 18 * zoom;
    const lanternY = bY - 20 * zoom;
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(lanternX - 1 * zoom, lanternY, 2 * zoom, 15 * zoom);
    drawIsometricPrism(
      ctx,
      lanternX,
      lanternY,
      4,
      4,
      6,
      { top: "#6a5a4a", left: "#5a4a3a", right: "#4a3a2a" },
      zoom,
    );
    const lanternGlow = 0.6 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(255, 200, 100, ${lanternGlow})`;
    ctx.shadowColor = "#ffcc66";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY - 3 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (tower.level === 2) {
    // ========== LEVEL 2: GARRISON - Industrial Stone Military Outpost ==========
    const bX = stationX;
    const bY = stationY;

    // === ENHANCED FOUNDATION with machinery ===
    // Heavy stone foundation
    drawIsometricPrism(
      ctx,
      bX,
      bY + 8 * zoom,
      40,
      34,
      8,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );

    // Foundation mortar lines - left face
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r <= 2; r++) {
      const frac = (r / 3) * 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(bX - 20 * zoom, bY + 8 * zoom - frac);
      ctx.lineTo(bX, bY + 16.5 * zoom - frac);
      ctx.stroke();
    }
    // Foundation mortar lines - right face
    for (let r = 1; r <= 2; r++) {
      const frac = (r / 3) * 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(bX, bY + 16.5 * zoom - frac);
      ctx.lineTo(bX + 20 * zoom, bY + 8 * zoom - frac);
      ctx.stroke();
    }

    // Foundation rivets
    ctx.fillStyle = "#6a6a72";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 14 * zoom + i * 6 * zoom,
        bY + 6 * zoom - i * 0.5 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Exposed steam pipes on foundation
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY + 6 * zoom);
    ctx.lineTo(bX - 20 * zoom, bY - 8 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY - 8 * zoom);
    ctx.quadraticCurveTo(
      bX - 20 * zoom,
      bY - 19 * zoom,
      bX - 14 * zoom,
      bY - 19 * zoom,
    );
    ctx.stroke();
    // Pipe valve wheel
    ctx.strokeStyle = "#8a8a92";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(bX - 20 * zoom, bY - 2 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.arc(bX - 20 * zoom, bY - 2 * zoom, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Foundation exhaust port
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.ellipse(
      bX + 14 * zoom,
      bY + 5 * zoom,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Exhaust glow
    const exhaustGlow = 0.4 + Math.sin(time * 5) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${exhaustGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      bX + 14 * zoom,
      bY + 5 * zoom,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clock tower (attached to main building)
    const towerX = bX + 14 * zoom;
    const towerY = bY - 6 * zoom;
    drawIsometricPrism(
      ctx,
      towerX,
      towerY,
      14,
      12,
      44,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Tower stone block texture - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(towerX - 7 * zoom, towerY - 44 * zoom);
    ctx.lineTo(towerX, towerY - 41 * zoom);
    ctx.lineTo(towerX, towerY + 3 * zoom);
    ctx.lineTo(towerX - 7 * zoom, towerY);
    ctx.closePath();
    ctx.clip();

    const twrStoneRows = 9;
    const twrStoneRowH = (44 * zoom) / twrStoneRows;
    const twrLeftSlope = 3 / 7;
    const twrStoneBlockW = 3.5 * zoom;

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(towerX - 7 * zoom, towerY - r * twrStoneRowH);
      ctx.lineTo(towerX, towerY + 3 * zoom - r * twrStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrStoneRows; r++) {
      const stagger = (r % 2) * (twrStoneBlockW * 0.5);
      for (
        let jx = towerX - 7 * zoom + twrStoneBlockW + stagger;
        jx < towerX;
        jx += twrStoneBlockW
      ) {
        const xOff = jx - (towerX - 7 * zoom);
        const yBase = towerY + xOff * twrLeftSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * twrStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * twrStoneRowH);
        ctx.stroke();
      }
    }
    const twrBlockSeed = [3, 1, 5, 0, 4, 2, 6];
    for (let r = 0; r < twrStoneRows; r++) {
      const stagger = (r % 2) * (twrStoneBlockW * 0.5);
      let prevX = towerX - 7 * zoom;
      let bIdx = 0;
      for (
        let jx = towerX - 7 * zoom + twrStoneBlockW + stagger;
        jx < towerX;
        jx += twrStoneBlockW
      ) {
        const shade = (twrBlockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (towerX - 7 * zoom);
          const xOff2 = jx - (towerX - 7 * zoom);
          const yB1 = towerY + xOff1 * twrLeftSlope;
          const yB2 = towerY + xOff2 * twrLeftSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * twrStoneRowH);
          ctx.lineTo(jx, yB2 - r * twrStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * twrStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * twrStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Tower stone block texture - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(towerX, towerY - 41 * zoom);
    ctx.lineTo(towerX + 7 * zoom, towerY - 44 * zoom);
    ctx.lineTo(towerX + 7 * zoom, towerY);
    ctx.lineTo(towerX, towerY + 3 * zoom);
    ctx.closePath();
    ctx.clip();

    const twrRightSlope = -3 / 7;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(towerX, towerY + 3 * zoom - r * twrStoneRowH);
      ctx.lineTo(towerX + 7 * zoom, towerY - r * twrStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrStoneRows; r++) {
      const stagger = (r % 2) * (twrStoneBlockW * 0.5);
      for (
        let jx = towerX + twrStoneBlockW + stagger;
        jx < towerX + 7 * zoom;
        jx += twrStoneBlockW
      ) {
        const xOff = jx - towerX;
        const yBase = towerY + 3 * zoom + xOff * twrRightSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * twrStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * twrStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrStoneRows; r++) {
      const stagger = (r % 2) * (twrStoneBlockW * 0.5);
      let prevX = towerX;
      let bIdx = 0;
      for (
        let jx = towerX + twrStoneBlockW + stagger;
        jx < towerX + 7 * zoom;
        jx += twrStoneBlockW
      ) {
        const shade = (twrBlockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - towerX;
          const xOff2 = jx - towerX;
          const yB1 = towerY + 3 * zoom + xOff1 * twrRightSlope;
          const yB2 = towerY + 3 * zoom + xOff2 * twrRightSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * twrStoneRowH);
          ctx.lineTo(jx, yB2 - r * twrStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * twrStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * twrStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Tower roof (pyramid with spire)
    const tRoofY = towerY - 44 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(towerX, tRoofY - 16 * zoom);
    ctx.lineTo(towerX - 8 * zoom, tRoofY);
    ctx.lineTo(towerX, tRoofY + 4 * zoom);
    ctx.lineTo(towerX + 8 * zoom, tRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(towerX, tRoofY - 16 * zoom);
    ctx.lineTo(towerX + 8 * zoom, tRoofY);
    ctx.lineTo(towerX, tRoofY + 4 * zoom);
    ctx.closePath();
    ctx.fill();

    // Tile row lines on tower roof
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const lLeftX = towerX + t * (-8 * zoom);
      const lLeftY = tRoofY - 16 * zoom + t * 16 * zoom;
      const lFrontY = tRoofY - 16 * zoom + t * 20 * zoom;
      ctx.beginPath();
      ctx.moveTo(lLeftX, lLeftY);
      ctx.lineTo(towerX, lFrontY);
      ctx.stroke();
      const rRightX = towerX + t * 8 * zoom;
      const rRightY = tRoofY - 16 * zoom + t * 16 * zoom;
      ctx.beginPath();
      ctx.moveTo(towerX, lFrontY);
      ctx.lineTo(rRightX, rRightY);
      ctx.stroke();
    }
    // Ridge line
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(towerX - 8 * zoom, tRoofY);
    ctx.lineTo(towerX, tRoofY - 16 * zoom);
    ctx.lineTo(towerX + 8 * zoom, tRoofY);
    ctx.stroke();

    // Gold finial
    ctx.fillStyle = "#c9a227";
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.arc(towerX, tRoofY - 18 * zoom, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Clock face on tower
    drawClockFace(towerX + 1 * zoom, towerY - 35 * zoom, 4 * zoom);

    // Main stone building
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      34,
      28,
      32,
      { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Stone block texture on main building - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX - 17 * zoom, bY - 32 * zoom);
    ctx.lineTo(bX, bY - 25 * zoom);
    ctx.lineTo(bX, bY + 7 * zoom);
    ctx.lineTo(bX - 17 * zoom, bY);
    ctx.closePath();
    ctx.clip();

    const bldgStoneRows = 7;
    const bldgStoneRowH = (32 * zoom) / bldgStoneRows;
    const bldgLeftSlope = 7 / 17;
    const bldgStoneBlockW = 5.5 * zoom;

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < bldgStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX - 17 * zoom, bY - r * bldgStoneRowH);
      ctx.lineTo(bX, bY + 7 * zoom - r * bldgStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < bldgStoneRows; r++) {
      const stagger = (r % 2) * (bldgStoneBlockW * 0.5);
      for (
        let jx = bX - 17 * zoom + bldgStoneBlockW + stagger;
        jx < bX;
        jx += bldgStoneBlockW
      ) {
        const xOff = jx - (bX - 17 * zoom);
        const yBase = bY + xOff * bldgLeftSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * bldgStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * bldgStoneRowH);
        ctx.stroke();
      }
    }
    const bldgBlockSeed = [2, 5, 1, 6, 3, 0, 4];
    for (let r = 0; r < bldgStoneRows; r++) {
      const stagger = (r % 2) * (bldgStoneBlockW * 0.5);
      let prevX = bX - 17 * zoom;
      let bIdx = 0;
      for (
        let jx = bX - 17 * zoom + bldgStoneBlockW + stagger;
        jx < bX;
        jx += bldgStoneBlockW
      ) {
        const shade = (bldgBlockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (bX - 17 * zoom);
          const xOff2 = jx - (bX - 17 * zoom);
          const yB1 = bY + xOff1 * bldgLeftSlope;
          const yB2 = bY + xOff2 * bldgLeftSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * bldgStoneRowH);
          ctx.lineTo(jx, yB2 - r * bldgStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * bldgStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * bldgStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone block texture on main building - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX, bY - 25 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY - 32 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY);
    ctx.lineTo(bX, bY + 7 * zoom);
    ctx.closePath();
    ctx.clip();

    const bldgRightSlope = -7 / 17;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < bldgStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX, bY + 7 * zoom - r * bldgStoneRowH);
      ctx.lineTo(bX + 17 * zoom, bY - r * bldgStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < bldgStoneRows; r++) {
      const stagger = (r % 2) * (bldgStoneBlockW * 0.5);
      for (
        let jx = bX + bldgStoneBlockW + stagger;
        jx < bX + 17 * zoom;
        jx += bldgStoneBlockW
      ) {
        const xOff = jx - bX;
        const yBase = bY + 7 * zoom + xOff * bldgRightSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * bldgStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * bldgStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < bldgStoneRows; r++) {
      const stagger = (r % 2) * (bldgStoneBlockW * 0.5);
      let prevX = bX;
      let bIdx = 0;
      for (
        let jx = bX + bldgStoneBlockW + stagger;
        jx < bX + 17 * zoom;
        jx += bldgStoneBlockW
      ) {
        const shade = (bldgBlockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - bX;
          const xOff2 = jx - bX;
          const yB1 = bY + 7 * zoom + xOff1 * bldgRightSlope;
          const yB2 = bY + 7 * zoom + xOff2 * bldgRightSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * bldgStoneRowH);
          ctx.lineTo(jx, yB2 - r * bldgStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * bldgStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * bldgStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // === HIGH-TECH: Power conduits on walls ===
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX + 17 * zoom, bY - 4 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY - 33 * zoom);
    ctx.stroke();
    // Power nodes with glow
    const powerGlow = 0.6 + Math.sin(time * 3) * 0.3;
    ctx.fillStyle = `rgba(255, 108, 0, ${powerGlow})`;
    ctx.shadowColor = "#e06000";
    ctx.shadowBlur = 6 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        bX + 17 * zoom,
        bY - 8 * zoom - i * 8 * zoom,
        2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Crenellated battlements on top (3x3 grid, sorted back-to-front)
    const crenY = bY - 32 * zoom;
    const c2hw = 34 * zoom * 0.5;
    const c2hd = 28 * zoom * 0.25;
    const c2Colors = { top: "#8a8a92", left: "#6a6a72", right: "#5a5a62" };
    const c2Merlons: { x: number; y: number }[] = [];
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        c2Merlons.push({
          x: bX + col * c2hw * 0.35 + row * c2hw * 0.35,
          y: crenY + col * c2hd * 0.35 - row * c2hd * 0.35,
        });
      }
    }
    c2Merlons.sort((a, b) => a.y - b.y);
    for (const m of c2Merlons) {
      drawMerlon(ctx, m.x, m.y, 6, 5, 6, c2Colors, zoom);
    }

    // Arched stone doorway — isometric on the left face
    {
      const dSlope = ISO_Y_RATIO;
      const dCx = bX - 8 * zoom;
      const dHW = 4 * zoom;
      const dBot = bY - 2 * zoom;
      const dArchCy = bY - 15 * zoom;
      const dArchR = dHW;
      const dSegs = 16;

      const traceDoorShape = (pad: number) => {
        const hw = dHW + pad;
        const r = dArchR + pad;
        ctx.beginPath();
        ctx.moveTo(dCx - hw, dBot + -hw * dSlope + pad);
        ctx.lineTo(dCx - hw, dArchCy + -hw * dSlope);
        for (let i = 0; i <= dSegs; i++) {
          const theta = Math.PI * (1 - i / dSegs);
          const u = hw * Math.cos(theta);
          const v = r * Math.sin(theta);
          ctx.lineTo(dCx + u, dArchCy + u * dSlope - v);
        }
        ctx.lineTo(dCx + hw, dBot + hw * dSlope + pad);
        ctx.closePath();
      };

      // Recess shadow
      ctx.save();
      ctx.translate(-0.8 * zoom, -0.4 * zoom);
      ctx.fillStyle = "#0a0a12";
      traceDoorShape(1 * zoom);
      ctx.fill();
      ctx.restore();

      // Interior void
      ctx.fillStyle = "#2a2a32";
      traceDoorShape(0);
      ctx.fill();

      // Warm glow inside
      const dGlow = 0.15 + Math.sin(time * 1.5) * 0.06;
      ctx.fillStyle = `rgba(255, 150, 80, ${dGlow})`;
      traceDoorShape(-0.8 * zoom);
      ctx.fill();

      // Arch frame
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1.5 * zoom;
      traceDoorShape(0.5 * zoom);
      ctx.stroke();

      // Iron crossbar reinforcements (follow face slope)
      ctx.strokeStyle = "#8a8a92";
      ctx.lineWidth = 1 * zoom;
      for (let h = 0; h < 2; h++) {
        const barH = (h + 1) * 4.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(dCx - dHW + 0.5 * zoom, dBot + -dHW * dSlope - barH);
        ctx.lineTo(dCx + dHW - 0.5 * zoom, dBot + dHW * dSlope - barH);
        ctx.stroke();
      }
    }

    // Gothic arrow slit windows (isometric, flush against right wall face)
    const slitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      bX + 6 * zoom,
      bY - 18 * zoom,
      2,
      8,
      "right",
      zoom,
      "rgba(255, 150, 50",
      slitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 11 * zoom,
      bY - 20 * zoom,
      2,
      8,
      "right",
      zoom,
      "rgba(255, 150, 50",
      slitGlow,
    );

    // === HIGH-TECH: Rotating radar/beacon on tower (isometric) ===
    {
      const bcPivotX = towerX;
      const bcPivotY = tRoofY - 12 * zoom;
      const bcAngle = time * 2;
      const bcCos = Math.cos(bcAngle);
      const bcSin = Math.sin(bcAngle);
      const bcArmLen = 5 * zoom;
      const bcTipX = bcPivotX + bcCos * bcArmLen;
      const bcTipY = bcPivotY + bcSin * bcArmLen * ISO_Y_RATIO;

      // Pivot hub (isometric ellipse)
      ctx.fillStyle = "#6a6a72";
      ctx.beginPath();
      ctx.ellipse(
        bcPivotX,
        bcPivotY,
        1.5 * zoom,
        0.75 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Arm
      ctx.strokeStyle = "#8a8a92";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bcPivotX, bcPivotY);
      ctx.lineTo(bcTipX, bcTipY);
      ctx.stroke();

      // Mini dish at tip (isometric, facing perpendicular to arm)
      const bcDishW = 3 * zoom * Math.abs(bcSin);
      const bcDishH = 3 * zoom;
      if (bcDishW > 0.5 * zoom) {
        const bcFacing = bcSin > 0;
        ctx.fillStyle = "#b0b0b8";
        ctx.beginPath();
        ctx.moveTo(bcTipX, bcTipY - bcDishH * 0.5);
        ctx.quadraticCurveTo(
          bcTipX + (bcFacing ? bcDishW * 0.4 : -bcDishW * 0.4),
          bcTipY,
          bcTipX,
          bcTipY + bcDishH * 0.5,
        );
        ctx.quadraticCurveTo(
          bcTipX - (bcFacing ? bcDishW * 0.1 : -bcDishW * 0.1),
          bcTipY,
          bcTipX,
          bcTipY - bcDishH * 0.5,
        );
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = "#b0b0b8";
        ctx.fillRect(
          bcTipX - 0.5 * zoom,
          bcTipY - bcDishH * 0.5,
          1 * zoom,
          bcDishH,
        );
      }

      // Blinking tip light
      const bcBlink = Math.sin(time * 6) > 0.3 ? 0.8 : 0.2;
      ctx.fillStyle = `rgba(255, 80, 0, ${bcBlink})`;
      ctx.beginPath();
      ctx.arc(bcTipX, bcTipY, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Garrison pennant on main building (triangular)
    const bannerWave2 = Math.sin(time * 3) * 2;
    const gpX = bX - 12 * zoom;
    const gpPoleBot = crenY + 2 * zoom;
    const gpPoleTop = crenY - 22 * zoom;
    const gpTop = gpPoleTop + 1 * zoom;
    const gpBot = gpPoleTop + 13 * zoom;
    const gpIsoD = 1.5 * zoom;
    // Pole with isometric depth (drawn first, behind flag)
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(gpX - 1 * zoom, gpPoleBot);
    ctx.lineTo(gpX - 1 * zoom, gpPoleTop);
    ctx.lineTo(gpX + 1 * zoom, gpPoleTop);
    ctx.lineTo(gpX + 1 * zoom, gpPoleBot);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(gpX + 1 * zoom, gpPoleTop);
    ctx.lineTo(gpX + 1 * zoom + gpIsoD * 0.5, gpPoleTop - gpIsoD * 0.25);
    ctx.lineTo(gpX + 1 * zoom + gpIsoD * 0.5, gpPoleBot - gpIsoD * 0.25);
    ctx.lineTo(gpX + 1 * zoom, gpPoleBot);
    ctx.closePath();
    ctx.fill();
    // Finial
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(gpX, gpPoleTop - 1 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Back face for depth
    ctx.fillStyle = "#a04000";
    ctx.beginPath();
    ctx.moveTo(gpX + gpIsoD, gpTop - gpIsoD * 0.5);
    ctx.quadraticCurveTo(
      gpX - 7 * zoom - bannerWave2 * 0.6 + gpIsoD,
      gpTop + 4.5 * zoom - gpIsoD * 0.5,
      gpX - 12 * zoom - bannerWave2 * 0.5 + gpIsoD,
      gpTop + 6 * zoom - gpIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      gpX - 7 * zoom - bannerWave2 * 0.4 + gpIsoD,
      gpTop + 7.5 * zoom - gpIsoD * 0.5,
      gpX + gpIsoD,
      gpBot - gpIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(gpX, gpTop);
    ctx.quadraticCurveTo(
      gpX - 7 * zoom - bannerWave2 * 0.6,
      gpTop + 4.5 * zoom,
      gpX - 12 * zoom - bannerWave2 * 0.5,
      gpTop + 6 * zoom,
    );
    ctx.quadraticCurveTo(
      gpX - 7 * zoom - bannerWave2 * 0.4,
      gpTop + 7.5 * zoom,
      gpX,
      gpBot,
    );
    ctx.closePath();
    ctx.fill();
    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(gpX - 3 * zoom - bannerWave2 * 0.2, gpTop + 1.5 * zoom);
    ctx.quadraticCurveTo(
      gpX - 5 * zoom - bannerWave2 * 0.4,
      gpTop + 6 * zoom,
      gpX - 3 * zoom - bannerWave2 * 0.2,
      gpBot - 1.5 * zoom,
    );
    ctx.stroke();

    // === Mechanical gears on side ===
    const gearX = bX - 17 * zoom;
    const gearY = bY - 20 * zoom;
    // Large gear
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 0.3;
      const r = i % 2 === 0 ? 4 * zoom : 3 * zoom;
      const x = gearX + Math.cos(angle) * r;
      const y = gearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    // Small interlocking gear
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - time * 0.4;
      const r = i % 2 === 0 ? 2.5 * zoom : 1.8 * zoom;
      const x = gearX + 5 * zoom + Math.cos(angle) * r;
      const y = gearY + 2.5 * zoom + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    // Gear centers
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(gearX, gearY, 1.5 * zoom, 0.75 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      gearX + 5 * zoom,
      gearY + 2.5 * zoom,
      1 * zoom,
      0.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // (Sign removed)
  } else if (tower.level === 3) {
    // ========== LEVEL 3: FORTRESS - Industrial Castle ==========
    const bX = stationX;
    const bY = stationY;

    // === STEPPED FOUNDATION - Industrial fortress base ===
    // Bottom step — heavy rough iron plinth (widest)
    drawIsometricPrism(
      ctx,
      bX,
      bY + 4 * zoom,
      42,
      40,
      3,
      { top: "#505058", left: "#404048", right: "#333340" },
      zoom,
    );
    // Bottom step mortar
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 21 * zoom, bY + 5 * zoom);
    ctx.lineTo(bX, bY + 14 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 14 * zoom);
    ctx.lineTo(bX + 21 * zoom, bY + 5 * zoom);
    ctx.stroke();

    // Top step — reinforced platform
    drawIsometricPrism(
      ctx,
      bX,
      bY + 1 * zoom,
      38,
      36,
      3,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );
    // Top step mortar
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.moveTo(bX - 19 * zoom, bY + 2 * zoom);
    ctx.lineTo(bX, bY + 10 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 10 * zoom);
    ctx.lineTo(bX + 19 * zoom, bY + 2 * zoom);
    ctx.stroke();

    // Iron trim band between steps — left face
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 21 * zoom, bY + 4.5 * zoom);
    ctx.lineTo(bX, bY + 14 * zoom);
    ctx.stroke();
    // Iron trim band — right face
    ctx.beginPath();
    ctx.moveTo(bX, bY + 14 * zoom);
    ctx.lineTo(bX + 21 * zoom, bY + 4.5 * zoom);
    ctx.stroke();

    // Heavy machinery in foundation - gear system on bottom step face
    const fGearX = bX + 14 * zoom;
    const fGearY = bY + 9 * zoom;
    ctx.fillStyle = "#5a5a62";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 0.2;
      const r = i % 2 === 0 ? 4 * zoom : 3 * zoom;
      const x = fGearX + Math.cos(angle) * r;
      const y = fGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(fGearX, fGearY, 1.5 * zoom, 0.75 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Steam exhaust vent on bottom step
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(
      bX - 14 * zoom,
      bY + 12 * zoom,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    const fSteam = 0.35 + Math.sin(time * 4) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${fSteam})`;
    ctx.beginPath();
    ctx.arc(
      bX - 14 * zoom + Math.sin(time * 2) * 2,
      bY + 5 * zoom,
      3.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Power conduit on bottom step face
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, bY + 10 * zoom);
    ctx.lineTo(bX + 18 * zoom, bY + 6 * zoom);
    ctx.stroke();
    // Conduit energy nodes
    const cGlow = 0.4 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(255, 108, 0, ${cGlow})`;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 12 * zoom + i * 10 * zoom,
        bY + 9 * zoom - i * 0.8 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Right clock tower (taller) with machinery
    const rtX = bX + 18 * zoom;
    const rtY = bY - 6 * zoom;
    drawIsometricPrism(
      ctx,
      rtX,
      rtY,
      12,
      10,
      48,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );

    // Stone block texture on right tower - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rtX - 6 * zoom, rtY - 48 * zoom);
    ctx.lineTo(rtX, rtY - 45.5 * zoom);
    ctx.lineTo(rtX, rtY + 2.5 * zoom);
    ctx.lineTo(rtX - 6 * zoom, rtY);
    ctx.closePath();
    ctx.clip();

    const rtStoneRows = 10;
    const rtStoneRowH = (48 * zoom) / rtStoneRows;
    const rtLeftSlope = 2.5 / 6;
    const rtBlockW = 4 * zoom;
    const rtBlockSeed = [2, 5, 1, 6, 3, 0, 4];

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < rtStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rtX - 6 * zoom, rtY - r * rtStoneRowH);
      ctx.lineTo(rtX, rtY + 2.5 * zoom - r * rtStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < rtStoneRows; r++) {
      const stagger = (r % 2) * (rtBlockW * 0.5);
      for (
        let jx = rtX - 6 * zoom + rtBlockW + stagger;
        jx < rtX;
        jx += rtBlockW
      ) {
        const xOff = jx - (rtX - 6 * zoom);
        const yBase = rtY + xOff * rtLeftSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * rtStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * rtStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < rtStoneRows; r++) {
      const stagger = (r % 2) * (rtBlockW * 0.5);
      let prevX = rtX - 6 * zoom;
      let bIdx = 0;
      for (
        let jx = rtX - 6 * zoom + rtBlockW + stagger;
        jx < rtX;
        jx += rtBlockW
      ) {
        const shade = (rtBlockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (rtX - 6 * zoom);
          const xOff2 = jx - (rtX - 6 * zoom);
          const yB1 = rtY + xOff1 * rtLeftSlope;
          const yB2 = rtY + xOff2 * rtLeftSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * rtStoneRowH);
          ctx.lineTo(jx, yB2 - r * rtStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * rtStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * rtStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone block texture on right tower - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rtX, rtY - 45.5 * zoom);
    ctx.lineTo(rtX + 6 * zoom, rtY - 48 * zoom);
    ctx.lineTo(rtX + 6 * zoom, rtY);
    ctx.lineTo(rtX, rtY + 2.5 * zoom);
    ctx.closePath();
    ctx.clip();

    const rtRightSlope = -2.5 / 6;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < rtStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rtX, rtY + 2.5 * zoom - r * rtStoneRowH);
      ctx.lineTo(rtX + 6 * zoom, rtY - r * rtStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < rtStoneRows; r++) {
      const stagger = (r % 2) * (rtBlockW * 0.5);
      for (
        let jx = rtX + rtBlockW + stagger;
        jx < rtX + 6 * zoom;
        jx += rtBlockW
      ) {
        const xOff = jx - rtX;
        const yBase = rtY + 2.5 * zoom + xOff * rtRightSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * rtStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * rtStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < rtStoneRows; r++) {
      const stagger = (r % 2) * (rtBlockW * 0.5);
      let prevX = rtX;
      let bIdx = 0;
      for (
        let jx = rtX + rtBlockW + stagger;
        jx < rtX + 6 * zoom;
        jx += rtBlockW
      ) {
        const shade = (rtBlockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - rtX;
          const xOff2 = jx - rtX;
          const yB1 = rtY + 2.5 * zoom + xOff1 * rtRightSlope;
          const yB2 = rtY + 2.5 * zoom + xOff2 * rtRightSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * rtStoneRowH);
          ctx.lineTo(jx, yB2 - r * rtStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * rtStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * rtStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Main keep (central building)
    drawIsometricPrism(
      ctx,
      bX,
      bY - 1 * zoom,
      32,
      30,
      32,
      { top: "#6a6a72", left: "#5a5a62", right: "#4a4a52" },
      zoom,
    );

    // Stone block texture on main keep - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX - 16 * zoom, bY - 33 * zoom);
    ctx.lineTo(bX, bY - 25.5 * zoom);
    ctx.lineTo(bX, bY + 6.5 * zoom);
    ctx.lineTo(bX - 16 * zoom, bY - zoom);
    ctx.closePath();
    ctx.clip();

    const stoneRows = 7;
    const stoneRowH = (32 * zoom) / stoneRows;
    const leftIsoSlope = 7.5 / 16;
    const stoneBlockW = 5.5 * zoom;

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX - 16 * zoom, bY - zoom - r * stoneRowH);
      ctx.lineTo(bX, bY + 6.5 * zoom - r * stoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stoneRows; r++) {
      const stagger = (r % 2) * (stoneBlockW * 0.5);
      for (
        let jx = bX - 16 * zoom + stoneBlockW + stagger;
        jx < bX;
        jx += stoneBlockW
      ) {
        const xOff = jx - (bX - 16 * zoom);
        const yBase = bY - zoom + xOff * leftIsoSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stoneRowH);
        ctx.stroke();
      }
    }
    const blockSeed = [2, 5, 1, 6, 3, 0, 4];
    for (let r = 0; r < stoneRows; r++) {
      const stagger = (r % 2) * (stoneBlockW * 0.5);
      let prevX = bX - 16 * zoom;
      let bIdx = 0;
      for (
        let jx = bX - 16 * zoom + stoneBlockW + stagger;
        jx < bX;
        jx += stoneBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (bX - 16 * zoom);
          const xOff2 = jx - (bX - 16 * zoom);
          const yB1 = bY - zoom + xOff1 * leftIsoSlope;
          const yB2 = bY - zoom + xOff2 * leftIsoSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stoneRowH);
          ctx.lineTo(jx, yB2 - r * stoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone block texture on main keep - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX, bY - 25.5 * zoom);
    ctx.lineTo(bX + 16 * zoom, bY - 33 * zoom);
    ctx.lineTo(bX + 16 * zoom, bY - zoom);
    ctx.lineTo(bX, bY + 6.5 * zoom);
    ctx.closePath();
    ctx.clip();

    const rightIsoSlope = -7.5 / 16;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX, bY + 6.5 * zoom - r * stoneRowH);
      ctx.lineTo(bX + 16 * zoom, bY - zoom - r * stoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stoneRows; r++) {
      const stagger = (r % 2) * (stoneBlockW * 0.5);
      for (
        let jx = bX + stoneBlockW + stagger;
        jx < bX + 16 * zoom;
        jx += stoneBlockW
      ) {
        const xOff = jx - bX;
        const yBase = bY + 6.5 * zoom + xOff * rightIsoSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stoneRows; r++) {
      const stagger = (r % 2) * (stoneBlockW * 0.5);
      let prevX = bX;
      let bIdx = 0;
      for (
        let jx = bX + stoneBlockW + stagger;
        jx < bX + 16 * zoom;
        jx += stoneBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - bX;
          const xOff2 = jx - bX;
          const yB1 = bY + 6.5 * zoom + xOff1 * rightIsoSlope;
          const yB2 = bY + 6.5 * zoom + xOff2 * rightIsoSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stoneRowH);
          ctx.lineTo(jx, yB2 - r * stoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Gothic arrow slit windows on main keep (isometric, flush against wall faces)
    const keepSlitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      bX + 6 * zoom,
      bY - 19 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(255, 150, 50",
      keepSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 12 * zoom,
      bY - 22 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(255, 150, 50",
      keepSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 6 * zoom,
      bY - 19 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(255, 150, 50",
      keepSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 12 * zoom,
      bY - 22 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(255, 150, 50",
      keepSlitGlow,
    );

    // Heavy battlements on main keep (3x3 grid, sorted back-to-front)
    const keepTop = bY - 32.5 * zoom;
    const c3hw = 32 * zoom * 0.5;
    const c3hd = 30 * zoom * 0.25;
    const c3Colors = { top: "#7a7a82", left: "#5a5a62", right: "#4a4a52" };
    const c3Merlons: { x: number; y: number }[] = [];
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        c3Merlons.push({
          x: bX + col * c3hw * 0.35 + row * c3hw * 0.35,
          y: keepTop + col * c3hd * 0.35 - row * c3hd * 0.35,
        });
      }
    }
    c3Merlons.sort((a, b) => a.y - b.y);
    for (const m of c3Merlons) {
      drawMerlon(ctx, m.x, m.y, 6, 5, 6, c3Colors, zoom);
    }

    // Left corner tower
    const ltX = bX - 16 * zoom;
    const ltY = bY + 4 * zoom;
    drawIsometricPrism(
      ctx,
      ltX,
      ltY,
      10,
      8,
      42,
      { top: "#5a5a62", left: "#4a4a52", right: "#3a3a42" },
      zoom,
    );
    // Stone block texture on left tower - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ltX - 5 * zoom, ltY - 42 * zoom);
    ctx.lineTo(ltX, ltY - 40 * zoom);
    ctx.lineTo(ltX, ltY + 2 * zoom);
    ctx.lineTo(ltX - 5 * zoom, ltY);
    ctx.closePath();
    ctx.clip();

    const ltStoneRows = 9;
    const ltStoneRowH = (42 * zoom) / ltStoneRows;
    const ltLeftSlope = 2 / 5;
    const ltBlockW = 3.5 * zoom;
    const ltBlockSeed = [2, 5, 1, 6, 3, 0, 4];

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < ltStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(ltX - 5 * zoom, ltY - r * ltStoneRowH);
      ctx.lineTo(ltX, ltY + 2 * zoom - r * ltStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < ltStoneRows; r++) {
      const stagger = (r % 2) * (ltBlockW * 0.5);
      for (
        let jx = ltX - 5 * zoom + ltBlockW + stagger;
        jx < ltX;
        jx += ltBlockW
      ) {
        const xOff = jx - (ltX - 5 * zoom);
        const yBase = ltY + xOff * ltLeftSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * ltStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * ltStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < ltStoneRows; r++) {
      const stagger = (r % 2) * (ltBlockW * 0.5);
      let prevX = ltX - 5 * zoom;
      let bIdx = 0;
      for (
        let jx = ltX - 5 * zoom + ltBlockW + stagger;
        jx < ltX;
        jx += ltBlockW
      ) {
        const shade = (ltBlockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (ltX - 5 * zoom);
          const xOff2 = jx - (ltX - 5 * zoom);
          const yB1 = ltY + xOff1 * ltLeftSlope;
          const yB2 = ltY + xOff2 * ltLeftSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * ltStoneRowH);
          ctx.lineTo(jx, yB2 - r * ltStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * ltStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * ltStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone block texture on left tower - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ltX, ltY - 40 * zoom);
    ctx.lineTo(ltX + 5 * zoom, ltY - 42 * zoom);
    ctx.lineTo(ltX + 5 * zoom, ltY);
    ctx.lineTo(ltX, ltY + 2 * zoom);
    ctx.closePath();
    ctx.clip();

    const ltRightSlope = -2 / 5;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < ltStoneRows; r++) {
      ctx.beginPath();
      ctx.moveTo(ltX, ltY + 2 * zoom - r * ltStoneRowH);
      ctx.lineTo(ltX + 5 * zoom, ltY - r * ltStoneRowH);
      ctx.stroke();
    }
    for (let r = 0; r < ltStoneRows; r++) {
      const stagger = (r % 2) * (ltBlockW * 0.5);
      for (
        let jx = ltX + ltBlockW + stagger;
        jx < ltX + 5 * zoom;
        jx += ltBlockW
      ) {
        const xOff = jx - ltX;
        const yBase = ltY + 2 * zoom + xOff * ltRightSlope;
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * ltStoneRowH);
        ctx.lineTo(jx, yBase - (r + 1) * ltStoneRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < ltStoneRows; r++) {
      const stagger = (r % 2) * (ltBlockW * 0.5);
      let prevX = ltX;
      let bIdx = 0;
      for (
        let jx = ltX + ltBlockW + stagger;
        jx < ltX + 5 * zoom;
        jx += ltBlockW
      ) {
        const shade = (ltBlockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - ltX;
          const xOff2 = jx - ltX;
          const yB1 = ltY + 2 * zoom + xOff1 * ltRightSlope;
          const yB2 = ltY + 2 * zoom + xOff2 * ltRightSlope;
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * ltStoneRowH);
          ctx.lineTo(jx, yB2 - r * ltStoneRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * ltStoneRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * ltStoneRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();
    // Tower top conical roof
    const ltRoofY = ltY - 42 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 12 * zoom);
    ctx.lineTo(ltX - 6 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 12 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Roof tile texture - left tower
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i * 0.2;
      ctx.beginPath();
      ctx.moveTo(ltX - t * 6 * zoom, ltRoofY - 12 * zoom + t * 12 * zoom);
      ctx.lineTo(ltX, ltRoofY - 12 * zoom + t * 15 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ltX, ltRoofY - 12 * zoom + t * 15 * zoom);
      ctx.lineTo(ltX + t * 6 * zoom, ltRoofY - 12 * zoom + t * 12 * zoom);
      ctx.stroke();
    }
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 12 * zoom);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.stroke();
    // Pennant on left tower (triangular, matching level 2 style)
    const flagWave = Math.sin(time * 3) * 2;
    const fp3X = ltX;
    const fp3Top = ltRoofY - 24 * zoom;
    const fp3Bot = ltRoofY - 14 * zoom;
    const fp3IsoD = 1.5 * zoom;
    // Back face for depth
    ctx.fillStyle = "#a04000";
    ctx.beginPath();
    ctx.moveTo(fp3X + fp3IsoD, fp3Top - fp3IsoD * 0.5);
    ctx.quadraticCurveTo(
      fp3X - 6 * zoom - flagWave * 0.6 + fp3IsoD,
      fp3Top + 3.5 * zoom - fp3IsoD * 0.5,
      fp3X - 10 * zoom - flagWave * 0.5 + fp3IsoD,
      fp3Top + 5 * zoom - fp3IsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      fp3X - 6 * zoom - flagWave * 0.4 + fp3IsoD,
      fp3Top + 6.5 * zoom - fp3IsoD * 0.5,
      fp3X + fp3IsoD,
      fp3Bot - fp3IsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#e06000";
    ctx.beginPath();
    ctx.moveTo(fp3X, fp3Top);
    ctx.quadraticCurveTo(
      fp3X - 6 * zoom - flagWave * 0.6,
      fp3Top + 3.5 * zoom,
      fp3X - 10 * zoom - flagWave * 0.5,
      fp3Top + 5 * zoom,
    );
    ctx.quadraticCurveTo(
      fp3X - 6 * zoom - flagWave * 0.4,
      fp3Top + 6.5 * zoom,
      fp3X,
      fp3Bot,
    );
    ctx.closePath();
    ctx.fill();
    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(fp3X - 3 * zoom - flagWave * 0.2, fp3Top + 1.5 * zoom);
    ctx.quadraticCurveTo(
      fp3X - 5 * zoom - flagWave * 0.4,
      fp3Top + 5 * zoom,
      fp3X - 3 * zoom - flagWave * 0.2,
      fp3Bot - 1.5 * zoom,
    );
    ctx.stroke();
    // Pole with isometric depth
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(fp3X - 1 * zoom, fp3Bot + 2 * zoom);
    ctx.lineTo(fp3X - 1 * zoom, fp3Top - 2 * zoom);
    ctx.lineTo(fp3X + 1 * zoom, fp3Top - 2 * zoom);
    ctx.lineTo(fp3X + 1 * zoom, fp3Bot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(fp3X + 1 * zoom, fp3Top - 2 * zoom);
    ctx.lineTo(
      fp3X + 1 * zoom + fp3IsoD * 0.5,
      fp3Top - 2 * zoom - fp3IsoD * 0.25,
    );
    ctx.lineTo(
      fp3X + 1 * zoom + fp3IsoD * 0.5,
      fp3Bot + 2 * zoom - fp3IsoD * 0.25,
    );
    ctx.lineTo(fp3X + 1 * zoom, fp3Bot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Finial
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(fp3X, fp3Top - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Tower gears
    const tGearX = rtX - 3 * zoom;
    const tGearY = rtY - 18 * zoom;
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.5;
      const r = i % 2 === 0 ? 3.5 * zoom : 2.5 * zoom;
      const x = tGearX + Math.cos(angle) * r;
      const y = tGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Tower spire
    const rtRoofY = rtY - 48 * zoom;
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 16 * zoom);
    ctx.lineTo(rtX - 7 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 3 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 16 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Roof tile texture - right tower spire
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i * 0.2;
      ctx.beginPath();
      ctx.moveTo(rtX - t * 7 * zoom, rtRoofY - 16 * zoom + t * 16 * zoom);
      ctx.lineTo(rtX, rtRoofY - 16 * zoom + t * 19 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rtX, rtRoofY - 16 * zoom + t * 19 * zoom);
      ctx.lineTo(rtX + t * 7 * zoom, rtRoofY - 16 * zoom + t * 16 * zoom);
      ctx.stroke();
    }
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 16 * zoom);
    ctx.lineTo(rtX, rtRoofY + 3 * zoom);
    ctx.stroke();
    // Bronze finial
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    ctx.arc(rtX, rtRoofY - 18 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(rtX - 1 * zoom, rtRoofY - 24 * zoom, 2 * zoom, 8 * zoom);

    // Clock on right tower (no numerals)
    drawClockFace(rtX + 1 * zoom, rtY - 36 * zoom, 4 * zoom);

    // Grand portcullis entrance — isometric on the left face
    {
      const slope = ISO_Y_RATIO;
      const gateCx = bX - 6 * zoom;
      const gateHW = 3.5 * zoom;
      const portBot = bY + 1 * zoom;
      const archCy = bY - 9 * zoom;
      const archR = gateHW;
      const archSegs = 20;

      const traceGateShape = (pad: number) => {
        const hw = gateHW + pad;
        const r = archR + pad;
        ctx.beginPath();
        ctx.moveTo(gateCx - hw, portBot + -hw * slope + pad);
        ctx.lineTo(gateCx - hw, archCy + -hw * slope);
        for (let i = 0; i <= archSegs; i++) {
          const theta = Math.PI * (1 - i / archSegs);
          const u = hw * Math.cos(theta);
          const v = r * Math.sin(theta);
          ctx.lineTo(gateCx + u, archCy + u * slope - v);
        }
        ctx.lineTo(gateCx + hw, portBot + hw * slope + pad);
        ctx.closePath();
      };

      // Deep recess shadow (offset into the wall for left face)
      ctx.save();
      ctx.translate(-1 * zoom, -0.5 * zoom);
      ctx.fillStyle = "#0a0a12";
      traceGateShape(1 * zoom);
      ctx.fill();
      ctx.restore();

      // Interior void (dark)
      ctx.fillStyle = "#1a1a22";
      traceGateShape(0);
      ctx.fill();

      // Interior warm glow from inside
      const portGlow = 0.15 + Math.sin(time * 1.5) * 0.06;
      const portGlowGrad = ctx.createLinearGradient(
        gateCx,
        portBot,
        gateCx,
        archCy - archR,
      );
      portGlowGrad.addColorStop(0, `rgba(255, 120, 40, ${portGlow * 0.5})`);
      portGlowGrad.addColorStop(0.5, `rgba(255, 100, 30, ${portGlow})`);
      portGlowGrad.addColorStop(1, "rgba(255, 80, 20, 0)");
      ctx.fillStyle = portGlowGrad;
      traceGateShape(-1 * zoom);
      ctx.fill();

      // Stone archivolt molding (double arch frame)
      ctx.strokeStyle = "#7a7a82";
      ctx.lineWidth = 2.5 * zoom;
      traceGateShape(0.5 * zoom);
      ctx.stroke();
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1.2 * zoom;
      traceGateShape(2 * zoom);
      ctx.stroke();

      // Carved keystone at arch apex
      const keystoneX = gateCx;
      const keystoneY = archCy - archR;
      ctx.fillStyle = "#7a7a82";
      ctx.beginPath();
      ctx.moveTo(keystoneX - 2 * zoom, keystoneY);
      ctx.lineTo(keystoneX, keystoneY - 3 * zoom);
      ctx.lineTo(keystoneX + 2 * zoom, keystoneY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(keystoneX, keystoneY - 1 * zoom, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Portcullis iron grid — vertical bars clipped to isometric arch
      ctx.strokeStyle = "#6a6a72";
      ctx.lineWidth = 1.5 * zoom;
      for (let v = 0; v < 4; v++) {
        const t = (v + 0.5) / 4;
        const u = gateHW * (2 * t - 1);
        const vx = gateCx + u;
        const vBot = portBot + u * slope;
        const uNorm = u / gateHW;
        const archV = archR * Math.sqrt(Math.max(0, 1 - uNorm * uNorm));
        const vTop = archCy + u * slope - archV;
        ctx.beginPath();
        ctx.moveTo(vx, vBot);
        ctx.lineTo(vx, vTop);
        ctx.stroke();
      }
      // Horizontal crossbars (follow left-face isometric slope)
      for (let h = 0; h < 3; h++) {
        const barH = (h + 1) * 3.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(
          gateCx - gateHW + 0.5 * zoom,
          portBot + -gateHW * slope - barH,
        );
        ctx.lineTo(
          gateCx + gateHW - 0.5 * zoom,
          portBot + gateHW * slope - barH,
        );
        ctx.stroke();
      }

      // Portcullis spikes at bottom (follow face slope)
      ctx.fillStyle = "#5a5a62";
      for (let sp = 0; sp < 4; sp++) {
        const t = (sp + 0.5) / 4;
        const u = gateHW * (2 * t - 1);
        const spx = gateCx + u;
        const spy = portBot + u * slope;
        ctx.beginPath();
        ctx.moveTo(spx - 0.8 * zoom, spy);
        ctx.lineTo(spx, spy + 2 * zoom);
        ctx.lineTo(spx + 0.8 * zoom, spy);
        ctx.closePath();
        ctx.fill();
      }

      // Chains on either side of the portcullis
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 1 * zoom;
      const chainBaseY = archCy - archR - 2 * zoom;
      for (const side of [-1, 1]) {
        const cu = side * (gateHW + 1.5 * zoom);
        const chainX = gateCx + cu;
        const chainY0 = chainBaseY + cu * slope;
        for (let link = 0; link < 4; link++) {
          const ly = chainY0 - link * 2.5 * zoom;
          ctx.beginPath();
          ctx.ellipse(chainX, ly, 1 * zoom, 1.2 * zoom, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Winch mechanism hint (small gear above arch)
      const winchY = chainBaseY - 12 * zoom;
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      for (let g = 0; g < 8; g++) {
        const gAngle = (g / 8) * Math.PI * 2 + time * 0.2;
        const gR = g % 2 === 0 ? 2.5 * zoom : 1.8 * zoom;
        const gx = gateCx + Math.cos(gAngle) * gR;
        const gy = winchY + Math.sin(gAngle) * gR * 0.5;
        if (g === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.ellipse(gateCx, winchY, 1 * zoom, 0.5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone step at entrance base (isometric parallelogram)
      const stepHW = gateHW + 1.5 * zoom;
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      ctx.moveTo(gateCx - stepHW, portBot + -stepHW * slope + 1 * zoom);
      ctx.lineTo(gateCx + stepHW, portBot + stepHW * slope + 1 * zoom);
      ctx.lineTo(
        gateCx + stepHW + 0.5 * zoom,
        portBot + stepHW * slope + 3 * zoom,
      );
      ctx.lineTo(
        gateCx - stepHW - 0.5 * zoom,
        portBot + -stepHW * slope + 3 * zoom,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    }

    // (Sign removed)
  } else if (tower.level === 4 && tower.upgrade === "A") {
    // ========== LEVEL 4A: CENTAUR STABLES - Verdant Training Grounds ==========
    const bX = stationX;
    const bY = stationY;

    // === STEPPED FOUNDATION - Dark clay stone with lighter clay trim ===
    // Bottom step — rough-hewn clay plinth (widest)
    drawIsometricPrism(
      ctx,
      bX,
      bY + 16 * zoom,
      44,
      38,
      5,
      { top: "#4a2518", left: "#3d1c12", right: "#30150c" },
      zoom,
    );
    // Bottom step mortar lines
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 22 * zoom, bY + 17 * zoom);
    ctx.lineTo(bX, bY + 26 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 26 * zoom);
    ctx.lineTo(bX + 22 * zoom, bY + 17 * zoom);
    ctx.stroke();
    // Bottom step highlight mortar
    ctx.strokeStyle = "rgba(139,69,50,0.08)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 22 * zoom, bY + 16.5 * zoom);
    ctx.lineTo(bX, bY + 25.5 * zoom);
    ctx.stroke();

    // Middle step — dressed clay stone
    drawIsometricPrism(
      ctx,
      bX,
      bY + 11 * zoom,
      40,
      34,
      4,
      { top: "#523020", left: "#4a2a1a", right: "#3d1c12" },
      zoom,
    );
    // Middle step mortar lines
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY + 12 * zoom);
    ctx.lineTo(bX, bY + 20 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 20 * zoom);
    ctx.lineTo(bX + 20 * zoom, bY + 12 * zoom);
    ctx.stroke();

    // Top step — polished clay cap
    drawIsometricPrism(
      ctx,
      bX,
      bY + 7 * zoom,
      36,
      30,
      4,
      { top: "#5a3020", left: "#4a2a1a", right: "#3d1c12" },
      zoom,
    );
    // Top step mortar
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 18 * zoom, bY + 8 * zoom);
    ctx.lineTo(bX, bY + 15 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 15 * zoom);
    ctx.lineTo(bX + 18 * zoom, bY + 8 * zoom);
    ctx.stroke();

    // Lighter clay trim band on middle step edge — left face
    ctx.strokeStyle = "#8b4532";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 20 * zoom, bY + 11.5 * zoom);
    ctx.lineTo(bX, bY + 20 * zoom);
    ctx.stroke();
    // Trim band — right face
    ctx.beginPath();
    ctx.moveTo(bX, bY + 20 * zoom);
    ctx.lineTo(bX + 20 * zoom, bY + 11.5 * zoom);
    ctx.stroke();

    // Darker clay trim band on bottom step edge — left face
    ctx.strokeStyle = "#6a3022";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 22 * zoom, bY + 16.5 * zoom);
    ctx.lineTo(bX, bY + 26 * zoom);
    ctx.stroke();
    // Bottom trim — right face
    ctx.beginPath();
    ctx.moveTo(bX, bY + 26 * zoom);
    ctx.lineTo(bX + 22 * zoom, bY + 16.5 * zoom);
    ctx.stroke();

    // Clay accents on middle step — left face
    ctx.fillStyle = "#8b4532";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 16 * zoom + i * 5 * zoom,
        bY + 12.5 * zoom + i * 1.4 * zoom,
        1.3 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Clay accents on bottom step — right face
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(
        bX + 2 * zoom + i * 5 * zoom,
        bY + 25 * zoom - i * 1.4 * zoom,
        1.3 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Vine trellis growing up the wall
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 22 * zoom, bY + 10 * zoom);
    ctx.lineTo(bX - 22 * zoom, bY - 20 * zoom);
    ctx.stroke();
    ctx.strokeStyle = "#3a6a2a";
    ctx.lineWidth = 1.5 * zoom;
    for (let v = 0; v < 5; v++) {
      const vy = bY + 8 * zoom - v * 6 * zoom;
      const vWave = Math.sin(time * 0.5 + v * 1.2) * 1.5;
      ctx.beginPath();
      ctx.moveTo(bX - 22 * zoom, vy);
      ctx.quadraticCurveTo(
        bX - 18 * zoom + vWave,
        vy - 3 * zoom,
        bX - 22 * zoom,
        vy - 5 * zoom,
      );
      ctx.stroke();
    }
    // Vine leaves
    ctx.fillStyle = "#4a8a3a";
    for (let lf = 0; lf < 6; lf++) {
      const ly = bY + 6 * zoom - lf * 5 * zoom;
      const lx = bX - 21 * zoom + Math.sin(lf * 2.3) * 2 * zoom;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 2.5 * zoom, 1.5 * zoom, lf * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hanging flower basket
    const basketX = bX + 18 * zoom;
    const basketY = bY + 6 * zoom;
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(basketX, basketY - 10 * zoom);
    ctx.lineTo(basketX, basketY - 4 * zoom);
    ctx.stroke();
    ctx.strokeStyle = "#7a6040";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(basketX, basketY - 2 * zoom, 4 * zoom, 0, Math.PI);
    ctx.stroke();
    // Flowers in basket
    const flowerColors = ["#d44a4a", "#e8a030", "#d070d0", "#eaea40"];
    for (let f = 0; f < 4; f++) {
      const fx = basketX - 3 * zoom + f * 2 * zoom;
      const fy = basketY - 5 * zoom - Math.abs(f - 1.5) * 1.5 * zoom;
      ctx.fillStyle = flowerColors[f];
      ctx.beginPath();
      ctx.arc(fx, fy, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#3a7a2a";
    ctx.beginPath();
    ctx.ellipse(basketX, basketY - 4 * zoom, 5 * zoom, 2 * zoom, 0, Math.PI, 0);
    ctx.fill();

    // Herb garden planter
    ctx.fillStyle = "#6a4a2a";
    ctx.beginPath();
    ctx.ellipse(
      bX - 14 * zoom,
      bY + 12 * zoom,
      6 * zoom,
      3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#4a3018";
    ctx.beginPath();
    ctx.ellipse(
      bX - 14 * zoom,
      bY + 12 * zoom,
      6 * zoom,
      3 * zoom,
      0,
      Math.PI,
      0,
    );
    ctx.fill();
    ctx.fillStyle = "#3a5a20";
    ctx.beginPath();
    ctx.ellipse(
      bX - 14 * zoom,
      bY + 11 * zoom,
      5 * zoom,
      2.5 * zoom,
      0,
      Math.PI,
      0,
    );
    ctx.fill();
    // Small herbs/plants growing
    for (let h = 0; h < 4; h++) {
      const hx = bX - 18 * zoom + h * 3 * zoom;
      const hy = bY + 8 * zoom;
      const hSway = Math.sin(time * 1.5 + h * 1.1) * 0.8;
      ctx.strokeStyle = "#3a7a2a";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 2 * zoom);
      ctx.quadraticCurveTo(
        hx + hSway,
        hy - 2 * zoom,
        hx + hSway * 0.5,
        hy - 4 * zoom,
      );
      ctx.stroke();
      ctx.fillStyle = h % 2 === 0 ? "#4a9a3a" : "#5aaa4a";
      ctx.beginPath();
      ctx.ellipse(
        hx + hSway * 0.5,
        hy - 4.5 * zoom,
        2 * zoom,
        1.2 * zoom,
        hSway * 0.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // === LEFT HORSE STABLE ===
    const lwX = bX - 16 * zoom;
    const lwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      lwX,
      lwY,
      14,
      12,
      22,
      { top: "#9b7b5b", left: "#8b6b4b", right: "#7b5b3b" },
      zoom,
    );
    // Gothic windows on left stable
    const lwSlitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      lwX + 4 * zoom,
      lwY - 15 * zoom,
      2,
      7,
      "right",
      zoom,
      "rgba(160, 210, 100",
      lwSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      lwX - 4 * zoom,
      lwY - 15 * zoom,
      2,
      7,
      "left",
      zoom,
      "rgba(160, 210, 100",
      lwSlitGlow,
    );
    // Stable roof
    drawSlopedRoof(
      lwX,
      lwY - 22 * zoom,
      18,
      15,
      10,
      "#6a5030",
      "#5a4020",
      "#7a6040",
    );
    // Stable door (isometric on left face)
    drawIsoFlushRect(ctx, lwX - 1 * zoom, lwY - 7 * zoom, 8, 14, "left", zoom, {
      fill: "#4a3015",
      recessDepth: 1,
      recessFill: "#2a1a05",
    });
    drawIsoFlushRect(
      ctx,
      lwX - 1 * zoom,
      lwY - 10.5 * zoom,
      7,
      6,
      "left",
      zoom,
      { stroke: "#3a2005", lineWidth: 1.5 },
    );
    // Horse head
    ctx.fillStyle = "#c9a868";
    ctx.beginPath();
    ctx.ellipse(
      lwX - 1 * zoom,
      lwY - 15 * zoom,
      3 * zoom,
      2.5 * zoom,
      -0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.arc(lwX + 0.5 * zoom, lwY - 10.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Brass horseshoe
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(
      lwX - 1 * zoom,
      lwY - 18 * zoom,
      3 * zoom,
      0.3 * Math.PI,
      0.7 * Math.PI,
      true,
    );
    ctx.stroke();
    // Forest green pennant on stable
    const lwFlagWave = Math.sin(time * 4) * 2;
    ctx.fillStyle = "#2d8b2d";
    ctx.beginPath();
    ctx.moveTo(lwX + 2 * zoom, lwY - 30 * zoom);
    ctx.lineTo(lwX + 2 * zoom, lwY - 38 * zoom);
    ctx.quadraticCurveTo(
      lwX + 8 * zoom + lwFlagWave,
      lwY - 36 * zoom,
      lwX + 10 * zoom + lwFlagWave,
      lwY - 34 * zoom,
    );
    ctx.lineTo(lwX + 2 * zoom, lwY - 34 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5a7040";
    ctx.fillRect(lwX + 1 * zoom, lwY - 40 * zoom, 2 * zoom, 12 * zoom);

    // === RIGHT HORSE STABLE ===
    const rwX = bX + 18 * zoom;
    const rwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      rwX,
      rwY,
      14,
      12,
      22,
      { top: "#7b8b5b", left: "#6b7b4b", right: "#5b6b3b" },
      zoom,
    );
    // Gothic windows on right stable
    drawIsoGothicWindow(
      ctx,
      rwX + 4 * zoom,
      rwY - 15 * zoom,
      2,
      7,
      "right",
      zoom,
      "rgba(160, 210, 100",
      lwSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      rwX - 4 * zoom,
      rwY - 15 * zoom,
      2,
      7,
      "left",
      zoom,
      "rgba(160, 210, 100",
      lwSlitGlow,
    );
    drawSlopedRoof(
      rwX,
      rwY - 22 * zoom,
      18,
      15,
      10,
      "#6a5030",
      "#5a4020",
      "#7a6040",
    );
    drawIsoFlushRect(
      ctx,
      rwX + 2 * zoom,
      rwY - 7 * zoom,
      8,
      14,
      "right",
      zoom,
      { fill: "#4a3015", recessDepth: 1, recessFill: "#2a1a05" },
    );
    // Horse head
    ctx.fillStyle = "#8b6b4b";
    ctx.beginPath();
    ctx.ellipse(
      rwX + 2 * zoom,
      rwY - 15 * zoom,
      3 * zoom,
      2.5 * zoom,
      0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#2a1a0a";
    ctx.beginPath();
    ctx.arc(rwX + 3.5 * zoom, rwY - 10.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Forest green pennant
    ctx.fillStyle = "#2d8b2d";
    ctx.beginPath();
    ctx.moveTo(rwX - 2 * zoom, rwY - 30 * zoom);
    ctx.lineTo(rwX - 2 * zoom, rwY - 38 * zoom);
    ctx.quadraticCurveTo(
      rwX + 4 * zoom + lwFlagWave,
      rwY - 36 * zoom,
      rwX + 6 * zoom + lwFlagWave,
      rwY - 34 * zoom,
    );
    ctx.lineTo(rwX - 2 * zoom, rwY - 34 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#b89227";
    ctx.fillRect(rwX - 3 * zoom, rwY - 40 * zoom, 2 * zoom, 12 * zoom);

    // === MAIN BUILDING - Nature Hall ===
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      30,
      24,
      34,
      { top: "#a08060", left: "#907050", right: "#806040" },
      zoom,
    );

    // Gothic windows on main building
    const hallSlitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      bX + 5 * zoom,
      bY - 17 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(160, 210, 100",
      hallSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 11 * zoom,
      bY - 20 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(160, 210, 100",
      hallSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 5 * zoom,
      bY - 17 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(160, 210, 100",
      hallSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 11 * zoom,
      bY - 20 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(160, 210, 100",
      hallSlitGlow,
    );

    // Vertical wood planks
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 12 * zoom + i * 4 * zoom, bY - 2 * zoom);
      ctx.lineTo(bX - 12 * zoom + i * 4 * zoom, bY - 32 * zoom);
      ctx.stroke();
    }

    // Lighter clay bands
    ctx.strokeStyle = "#8b4532";
    ctx.lineWidth = 2.5 * zoom;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(bX - 13 * zoom, bY - 8 * zoom - i * 10 * zoom);
      ctx.lineTo(bX + 2 * zoom, bY - 5 * zoom - i * 10 * zoom);
      ctx.stroke();
    }

    // Antler/leaf nature emblem on wall
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 5 * zoom, bY - 17 * zoom);
    ctx.quadraticCurveTo(
      bX - 10 * zoom,
      bY - 22 * zoom,
      bX - 7 * zoom,
      bY - 27 * zoom,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX - 5 * zoom, bY - 17 * zoom);
    ctx.quadraticCurveTo(bX, bY - 22 * zoom, bX - 3 * zoom, bY - 27 * zoom);
    ctx.stroke();
    ctx.fillStyle = "#4a8a3a";
    ctx.beginPath();
    ctx.ellipse(
      bX - 5 * zoom,
      bY - 20 * zoom,
      3 * zoom,
      2 * zoom,
      -0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // === ORNATE STABLE ROOF with clay tiles ===
    const roofY = bY - 34 * zoom;
    const ridgeY = roofY - 20 * zoom;
    const eaveL = bX - 21 * zoom;
    const eaveR = bX + 21 * zoom;
    const eaveY = roofY + 2 * zoom;
    const gableY = roofY + 12 * zoom;

    // Eave underside shadow for depth
    ctx.fillStyle = "rgba(40,20,10,0.25)";
    ctx.beginPath();
    ctx.moveTo(eaveL, eaveY + 1.5 * zoom);
    ctx.lineTo(bX, gableY + 1.5 * zoom);
    ctx.lineTo(eaveR, eaveY + 1.5 * zoom);
    ctx.lineTo(bX, ridgeY);
    ctx.closePath();
    ctx.fill();

    // Left roof slope - reddish brown clay tiles
    ctx.fillStyle = "#8b4532";
    ctx.beginPath();
    ctx.moveTo(bX, ridgeY);
    ctx.lineTo(eaveL, eaveY);
    ctx.lineTo(bX, gableY);
    ctx.closePath();
    ctx.fill();

    // Right roof slope - darker shade
    ctx.fillStyle = "#6a3022";
    ctx.beginPath();
    ctx.moveTo(bX, ridgeY);
    ctx.lineTo(eaveR, eaveY);
    ctx.lineTo(bX, gableY);
    ctx.closePath();
    ctx.fill();

    // Clay tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      ctx.beginPath();
      ctx.moveTo(bX + (eaveL - bX) * t, ridgeY + (eaveY - ridgeY) * t);
      ctx.lineTo(bX, ridgeY + (gableY - ridgeY) * t);
      ctx.stroke();
    }

    // Clay tile row lines - right slope
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      ctx.beginPath();
      ctx.moveTo(bX, ridgeY + (gableY - ridgeY) * t);
      ctx.lineTo(bX + (eaveR - bX) * t, ridgeY + (eaveY - ridgeY) * t);
      ctx.stroke();
    }

    // Ridge cap - dark wooden beam along roof peak
    ctx.strokeStyle = "#2a0a00";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(eaveL + 2 * zoom, eaveY - zoom);
    ctx.lineTo(bX, ridgeY);
    ctx.lineTo(eaveR - 2 * zoom, eaveY - zoom);
    ctx.stroke();

    // Rafter tails at left eave
    ctx.strokeStyle = "#5a3018";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const rx = eaveL + (bX - eaveL) * t;
      const ry = eaveY + (gableY - eaveY) * t;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2 * zoom, ry + 2.5 * zoom);
      ctx.stroke();
    }

    // Rafter tails at right eave
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const rx = eaveR + (bX - eaveR) * t;
      const ry = eaveY + (gableY - eaveY) * t;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 2 * zoom, ry + 2.5 * zoom);
      ctx.stroke();
    }

    // Front gable wall (visible under roof overhang)
    ctx.fillStyle = "#a08060";
    ctx.beginPath();
    ctx.moveTo(bX, ridgeY + 4 * zoom);
    ctx.lineTo(bX - 7 * zoom, gableY);
    ctx.lineTo(bX + 7 * zoom, gableY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Hay loft door on front gable
    ctx.fillStyle = "#4a2510";
    ctx.beginPath();
    ctx.moveTo(bX - 2.5 * zoom, gableY - 1 * zoom);
    ctx.lineTo(bX - 2.5 * zoom, gableY - 6 * zoom);
    ctx.lineTo(bX, gableY - 8 * zoom);
    ctx.lineTo(bX + 2.5 * zoom, gableY - 6 * zoom);
    ctx.lineTo(bX + 2.5 * zoom, gableY - 1 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a1505";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Hay bale peeking out of loft door
    ctx.fillStyle = "#c9a848";
    ctx.beginPath();
    ctx.ellipse(bX, gableY - 2 * zoom, 2 * zoom, 1.2 * zoom, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = "#a08828";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 1 * zoom, gableY - 2.5 * zoom);
    ctx.lineTo(bX - 1 * zoom, gableY - 1 * zoom);
    ctx.moveTo(bX + 1 * zoom, gableY - 2.5 * zoom);
    ctx.lineTo(bX + 1 * zoom, gableY - 1 * zoom);
    ctx.stroke();

    // Cupola / ventilation tower on roof peak
    const cupX = bX;
    const cupY = ridgeY - 2 * zoom;
    ctx.fillStyle = "#5a3018";
    ctx.beginPath();
    ctx.moveTo(cupX - 3.5 * zoom, cupY + 5 * zoom);
    ctx.lineTo(cupX - 3 * zoom, cupY);
    ctx.lineTo(cupX + 3 * zoom, cupY);
    ctx.lineTo(cupX + 3.5 * zoom, cupY + 5 * zoom);
    ctx.closePath();
    ctx.fill();
    // Cupola vent openings
    ctx.fillStyle = "#2a3a18";
    ctx.fillRect(cupX - 2 * zoom, cupY + 1 * zoom, 1.5 * zoom, 3 * zoom);
    ctx.fillRect(cupX + 0.5 * zoom, cupY + 1 * zoom, 1.5 * zoom, 3 * zoom);
    // Cupola peaked cap
    ctx.fillStyle = "#8b4532";
    ctx.beginPath();
    ctx.moveTo(cupX, cupY - 4 * zoom);
    ctx.lineTo(cupX - 4 * zoom, cupY);
    ctx.lineTo(cupX + 4 * zoom, cupY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#6a3022";
    ctx.beginPath();
    ctx.moveTo(cupX, cupY - 4 * zoom);
    ctx.lineTo(cupX + 4 * zoom, cupY);
    ctx.lineTo(cupX + 1 * zoom, cupY + 1 * zoom);
    ctx.closePath();
    ctx.fill();

    // Brass weathervane centaur on cupola
    ctx.fillStyle = "#c9a227";
    const vaneX = bX;
    const vaneY = cupY - 5 * zoom;
    ctx.fillRect(vaneX - 0.5 * zoom, vaneY, 1 * zoom, 5 * zoom);
    ctx.beginPath();
    ctx.ellipse(
      vaneX,
      vaneY - 3 * zoom,
      4 * zoom,
      2.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(vaneX + 1.5 * zoom, vaneY - 5 * zoom);
    ctx.lineTo(vaneX + 0.5 * zoom, vaneY - 9 * zoom);
    ctx.lineTo(vaneX + 2.5 * zoom, vaneY - 8 * zoom);
    ctx.closePath();
    ctx.fill();

    // Main entrance
    ctx.fillStyle = "#3a2010";
    ctx.beginPath();
    ctx.moveTo(bX - 6 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 6 * zoom, bY - 18 * zoom);
    ctx.arc(bX - 2 * zoom, bY - 18 * zoom, 4 * zoom, Math.PI, 0);
    ctx.lineTo(bX + 2 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Interior glow
    const interiorGlow = 0.4 + Math.sin(time * 2) * 0.15;
    ctx.fillStyle = `rgba(180, 210, 100, ${interiorGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      bX - 2 * zoom,
      bY - 10 * zoom,
      3 * zoom,
      6 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Brass arch trim
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.arc(bX, bY - 20 * zoom, 4.5 * zoom, Math.PI, 0);
    ctx.stroke();

    // Hanging herb drying rack
    const rackX = bX + 22 * zoom;
    const rackY = bY - 18 * zoom;
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(rackX - 5 * zoom, rackY - 4 * zoom);
    ctx.lineTo(rackX + 5 * zoom, rackY - 4 * zoom);
    ctx.stroke();
    // Hanging herb bundles
    const herbColors = ["#5a8a3a", "#4a7a2a", "#6a9a4a"];
    for (let hb = 0; hb < 3; hb++) {
      const hbx = rackX - 3 * zoom + hb * 3 * zoom;
      const hbSway = Math.sin(time * 1.2 + hb * 1.5) * 0.5;
      ctx.strokeStyle = "#7a6040";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(hbx, rackY - 4 * zoom);
      ctx.lineTo(hbx + hbSway, rackY);
      ctx.stroke();
      ctx.fillStyle = herbColors[hb];
      ctx.beginPath();
      ctx.ellipse(
        hbx + hbSway,
        rackY + 1 * zoom,
        1.8 * zoom,
        3 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Hay bale
    ctx.fillStyle = "#d4a017";
    ctx.beginPath();
    ctx.ellipse(
      bX + 14 * zoom,
      bY + 8 * zoom,
      5 * zoom,
      3.5 * zoom,
      0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#a08010";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // (sign removed)
  } else {
    // ========== LEVEL 4B: ROYAL CAVALRY FORTRESS - Royal Purple Military Stronghold ==========
    const bX = stationX;
    const bY = stationY;

    // === STEPPED FOUNDATION - Royal armored base with purple trim ===
    // Bottom step — rough-hewn stone plinth (widest)
    drawIsometricPrism(
      ctx,
      bX,
      bY + 16 * zoom,
      46,
      40,
      5,
      { top: "#303d6a", left: "#253460", right: "#1e2a52" },
      zoom,
    );
    // Bottom step mortar
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 23 * zoom, bY + 17 * zoom);
    ctx.lineTo(bX, bY + 26 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 26 * zoom);
    ctx.lineTo(bX + 23 * zoom, bY + 17 * zoom);
    ctx.stroke();
    // Highlight mortar
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 23 * zoom, bY + 16.5 * zoom);
    ctx.lineTo(bX, bY + 25.5 * zoom);
    ctx.stroke();

    // Middle step — dressed stone
    drawIsometricPrism(
      ctx,
      bX,
      bY + 11 * zoom,
      42,
      36,
      4,
      { top: "#35426c", left: "#2a3862", right: "#1e2d55" },
      zoom,
    );
    // Middle step mortar
    ctx.strokeStyle = "rgba(0,0,0,0.13)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 21 * zoom, bY + 12 * zoom);
    ctx.lineTo(bX, bY + 20 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 20 * zoom);
    ctx.lineTo(bX + 21 * zoom, bY + 12 * zoom);
    ctx.stroke();

    // Top step — polished cap
    drawIsometricPrism(
      ctx,
      bX,
      bY + 7 * zoom,
      38,
      32,
      4,
      { top: "#3a486e", left: "#2a3a64", right: "#1e2d55" },
      zoom,
    );
    // Top step mortar
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 19 * zoom, bY + 8 * zoom);
    ctx.lineTo(bX, bY + 15 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 15 * zoom);
    ctx.lineTo(bX + 19 * zoom, bY + 8 * zoom);
    ctx.stroke();

    // Purple trim band on middle step edge — left face
    const fndHW = 21 * zoom;
    const fndFD = 9 * zoom;
    const fndBandH = 2.5 * zoom;
    const fndBandY = 11.5 * zoom;
    ctx.fillStyle = "#7b3fa0";
    ctx.beginPath();
    ctx.moveTo(bX - fndHW, bY + fndBandY);
    ctx.lineTo(bX, bY + fndFD + fndBandY);
    ctx.lineTo(bX, bY + fndFD + fndBandY + fndBandH);
    ctx.lineTo(bX - fndHW, bY + fndBandY + fndBandH);
    ctx.closePath();
    ctx.fill();
    // Purple trim — right face
    ctx.fillStyle = "#5a2d80";
    ctx.beginPath();
    ctx.moveTo(bX, bY + fndFD + fndBandY);
    ctx.lineTo(bX + fndHW, bY + fndBandY);
    ctx.lineTo(bX + fndHW, bY + fndBandY + fndBandH);
    ctx.lineTo(bX, bY + fndFD + fndBandY + fndBandH);
    ctx.closePath();
    ctx.fill();
    // Bronze rivets along purple trim
    ctx.fillStyle = "#c9a227";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(
        bX - 16 * zoom + i * 5 * zoom,
        bY + 12.5 * zoom + i * 0.8 * zoom,
        1.3 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // === SPEAR RACK (Left side - on platform) ===
    const spearRackX = bX - 20 * zoom;
    const spearRackY = bY + 6 * zoom;
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(
      spearRackX - 2 * zoom,
      spearRackY - 16 * zoom,
      4 * zoom,
      20 * zoom,
    );
    ctx.fillRect(
      spearRackX - 5 * zoom,
      spearRackY - 16 * zoom,
      10 * zoom,
      3 * zoom,
    );
    // Spears on rack
    for (let i = 0; i < 3; i++) {
      const sx = spearRackX - 3 * zoom + i * 3 * zoom;
      ctx.strokeStyle = "#6a5030";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(sx, spearRackY - 14 * zoom);
      ctx.lineTo(sx, spearRackY - 30 * zoom);
      ctx.stroke();
      // Spear tips
      ctx.fillStyle = "#c0c0c0";
      ctx.beginPath();
      ctx.moveTo(sx, spearRackY - 33 * zoom);
      ctx.lineTo(sx - 2 * zoom, spearRackY - 28 * zoom);
      ctx.lineTo(sx + 2 * zoom, spearRackY - 28 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // === LEFT HORSE STABLE ===
    const lwX = bX - 16 * zoom;
    const lwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      lwX,
      lwY,
      14,
      12,
      24,
      { top: "#504a65", left: "#403a55", right: "#302a45" },
      zoom,
    );

    const stbRows = 5;
    const stbRowH = (24 * zoom) / stbRows;
    const stbBlockW = 3.5 * zoom;
    const blockSeed = [2, 5, 1, 6, 3, 0, 4];

    // Stone texture on left stable - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lwX - 7 * zoom, lwY - 24 * zoom);
    ctx.lineTo(lwX, lwY - 21 * zoom);
    ctx.lineTo(lwX, lwY + 3 * zoom);
    ctx.lineTo(lwX - 7 * zoom, lwY);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(30,15,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stbRows; r++) {
      ctx.beginPath();
      ctx.moveTo(lwX - 7 * zoom, lwY - r * stbRowH);
      ctx.lineTo(lwX, lwY + 3 * zoom - r * stbRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      for (
        let jx = lwX - 7 * zoom + stbBlockW + stagger;
        jx < lwX;
        jx += stbBlockW
      ) {
        const xOff = jx - (lwX - 7 * zoom);
        const yBase = lwY + xOff * (3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stbRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stbRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      let prevX = lwX - 7 * zoom;
      let bIdx = 0;
      for (
        let jx = lwX - 7 * zoom + stbBlockW + stagger;
        jx < lwX;
        jx += stbBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (lwX - 7 * zoom);
          const xOff2 = jx - (lwX - 7 * zoom);
          const yB1 = lwY + xOff1 * (3 / 7);
          const yB2 = lwY + xOff2 * (3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stbRowH);
          ctx.lineTo(jx, yB2 - r * stbRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stbRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stbRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on left stable - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lwX, lwY - 21 * zoom);
    ctx.lineTo(lwX + 7 * zoom, lwY - 24 * zoom);
    ctx.lineTo(lwX + 7 * zoom, lwY);
    ctx.lineTo(lwX, lwY + 3 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(30,15,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stbRows; r++) {
      ctx.beginPath();
      ctx.moveTo(lwX, lwY + 3 * zoom - r * stbRowH);
      ctx.lineTo(lwX + 7 * zoom, lwY - r * stbRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      for (
        let jx = lwX + stbBlockW + stagger;
        jx < lwX + 7 * zoom;
        jx += stbBlockW
      ) {
        const xOff = jx - lwX;
        const yBase = lwY + 3 * zoom + xOff * (-3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stbRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stbRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      let prevX = lwX;
      let bIdx = 0;
      for (
        let jx = lwX + stbBlockW + stagger;
        jx < lwX + 7 * zoom;
        jx += stbBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - lwX;
          const xOff2 = jx - lwX;
          const yB1 = lwY + 3 * zoom + xOff1 * (-3 / 7);
          const yB2 = lwY + 3 * zoom + xOff2 * (-3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stbRowH);
          ctx.lineTo(jx, yB2 - r * stbRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stbRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stbRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Left stable roof - left slope
    ctx.fillStyle = "#3a3055";
    ctx.beginPath();
    ctx.moveTo(lwX, lwY - 36 * zoom);
    ctx.lineTo(lwX - 9 * zoom, lwY - 24 * zoom);
    ctx.lineTo(lwX, lwY - 20.25 * zoom);
    ctx.closePath();
    ctx.fill();
    // Left stable roof - right slope
    ctx.fillStyle = "#2a2245";
    ctx.beginPath();
    ctx.moveTo(lwX, lwY - 36 * zoom);
    ctx.lineTo(lwX + 9 * zoom, lwY - 24 * zoom);
    ctx.lineTo(lwX, lwY - 20.25 * zoom);
    ctx.closePath();
    ctx.fill();
    // Tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(lwX + -9 * zoom * t, lwY - 36 * zoom + 12 * zoom * t);
      ctx.lineTo(lwX, lwY - 36 * zoom + 15.75 * zoom * t);
      ctx.stroke();
    }
    // Tile row lines - right slope
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(lwX, lwY - 36 * zoom + 15.75 * zoom * t);
      ctx.lineTo(lwX + 9 * zoom * t, lwY - 36 * zoom + 12 * zoom * t);
      ctx.stroke();
    }
    // Ridge cap beam
    ctx.strokeStyle = "#2a0a00";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(lwX - 9 * zoom + 2 * zoom, lwY - 24 * zoom - zoom);
    ctx.lineTo(lwX, lwY - 36 * zoom);
    ctx.lineTo(lwX + 9 * zoom - 2 * zoom, lwY - 24 * zoom - zoom);
    ctx.stroke();

    // Stable door (isometric on left face)
    drawIsoFlushRect(ctx, lwX - 1 * zoom, lwY - 8 * zoom, 8, 16, "left", zoom, {
      fill: "#3a2a1a",
      recessDepth: 1,
      recessFill: "#1a0a05",
    });
    drawIsoFlushRect(ctx, lwX - 1 * zoom, lwY - 12 * zoom, 7, 7, "left", zoom, {
      stroke: "#7b3fa0",
      lineWidth: 1.5,
    });
    // War horse head
    ctx.fillStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.ellipse(
      lwX - 1 * zoom,
      lwY - 11 * zoom,
      3.5 * zoom,
      2.8 * zoom,
      -0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Purple eye (subtle)
    ctx.fillStyle = "#8b5fcf";
    ctx.beginPath();
    ctx.arc(lwX + 0.5 * zoom, lwY - 11.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Bronze horseshoe
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(
      lwX - 1 * zoom,
      lwY - 20 * zoom,
      3 * zoom,
      0.3 * Math.PI,
      0.7 * Math.PI,
      true,
    );
    ctx.stroke();
    // Pennant on left stable (triangular, matching level 2 style)
    const lwFlagWave = Math.sin(time * 3) * 2;
    const lwpX = lwX + 2 * zoom;
    const lwpTop = lwY - 44 * zoom;
    const lwpBot = lwY - 34 * zoom;
    const lwpIsoD = 1.5 * zoom;
    // Back face
    ctx.fillStyle = "#5a2d80";
    ctx.beginPath();
    ctx.moveTo(lwpX + lwpIsoD, lwpTop - lwpIsoD * 0.5);
    ctx.quadraticCurveTo(
      lwpX + 5 * zoom + lwFlagWave * 0.6 + lwpIsoD,
      lwpTop + 3.5 * zoom - lwpIsoD * 0.5,
      lwpX + 8 * zoom + lwFlagWave * 0.5 + lwpIsoD,
      lwpTop + 5 * zoom - lwpIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      lwpX + 5 * zoom + lwFlagWave * 0.4 + lwpIsoD,
      lwpTop + 6.5 * zoom - lwpIsoD * 0.5,
      lwpX + lwpIsoD,
      lwpBot - lwpIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#7b3fa0";
    ctx.beginPath();
    ctx.moveTo(lwpX, lwpTop);
    ctx.quadraticCurveTo(
      lwpX + 5 * zoom + lwFlagWave * 0.6,
      lwpTop + 3.5 * zoom,
      lwpX + 8 * zoom + lwFlagWave * 0.5,
      lwpTop + 5 * zoom,
    );
    ctx.quadraticCurveTo(
      lwpX + 5 * zoom + lwFlagWave * 0.4,
      lwpTop + 6.5 * zoom,
      lwpX,
      lwpBot,
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(lwpX + 2.5 * zoom + lwFlagWave * 0.2, lwpTop + 1.5 * zoom);
    ctx.quadraticCurveTo(
      lwpX + 4 * zoom + lwFlagWave * 0.4,
      lwpTop + 5 * zoom,
      lwpX + 2.5 * zoom + lwFlagWave * 0.2,
      lwpBot - 1.5 * zoom,
    );
    ctx.stroke();
    // Pole with isometric depth
    ctx.fillStyle = "#1e2d55";
    ctx.beginPath();
    ctx.moveTo(lwpX - 1 * zoom, lwpBot + 2 * zoom);
    ctx.lineTo(lwpX - 1 * zoom, lwpTop - 2 * zoom);
    ctx.lineTo(lwpX + 1 * zoom, lwpTop - 2 * zoom);
    ctx.lineTo(lwpX + 1 * zoom, lwpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2a3a64";
    ctx.beginPath();
    ctx.moveTo(lwpX + 1 * zoom, lwpTop - 2 * zoom);
    ctx.lineTo(
      lwpX + 1 * zoom + lwpIsoD * 0.5,
      lwpTop - 2 * zoom - lwpIsoD * 0.25,
    );
    ctx.lineTo(
      lwpX + 1 * zoom + lwpIsoD * 0.5,
      lwpBot + 2 * zoom - lwpIsoD * 0.25,
    );
    ctx.lineTo(lwpX + 1 * zoom, lwpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#485882";
    ctx.beginPath();
    ctx.arc(lwpX, lwpTop - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // === RIGHT HORSE STABLE ===
    const rwX = bX + 20 * zoom;
    const rwY = bY + 6 * zoom;
    drawIsometricPrism(
      ctx,
      rwX,
      rwY,
      14,
      12,
      24,
      { top: "#504a65", left: "#403a55", right: "#302a45" },
      zoom,
    );

    // Stone texture on right stable - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rwX - 7 * zoom, rwY - 24 * zoom);
    ctx.lineTo(rwX, rwY - 21 * zoom);
    ctx.lineTo(rwX, rwY + 3 * zoom);
    ctx.lineTo(rwX - 7 * zoom, rwY);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(30,15,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stbRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rwX - 7 * zoom, rwY - r * stbRowH);
      ctx.lineTo(rwX, rwY + 3 * zoom - r * stbRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      for (
        let jx = rwX - 7 * zoom + stbBlockW + stagger;
        jx < rwX;
        jx += stbBlockW
      ) {
        const xOff = jx - (rwX - 7 * zoom);
        const yBase = rwY + xOff * (3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stbRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stbRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      let prevX = rwX - 7 * zoom;
      let bIdx = 0;
      for (
        let jx = rwX - 7 * zoom + stbBlockW + stagger;
        jx < rwX;
        jx += stbBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (rwX - 7 * zoom);
          const xOff2 = jx - (rwX - 7 * zoom);
          const yB1 = rwY + xOff1 * (3 / 7);
          const yB2 = rwY + xOff2 * (3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stbRowH);
          ctx.lineTo(jx, yB2 - r * stbRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stbRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stbRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on right stable - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rwX, rwY - 21 * zoom);
    ctx.lineTo(rwX + 7 * zoom, rwY - 24 * zoom);
    ctx.lineTo(rwX + 7 * zoom, rwY);
    ctx.lineTo(rwX, rwY + 3 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(30,15,0,0.12)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < stbRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rwX, rwY + 3 * zoom - r * stbRowH);
      ctx.lineTo(rwX + 7 * zoom, rwY - r * stbRowH);
      ctx.stroke();
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      for (
        let jx = rwX + stbBlockW + stagger;
        jx < rwX + 7 * zoom;
        jx += stbBlockW
      ) {
        const xOff = jx - rwX;
        const yBase = rwY + 3 * zoom + xOff * (-3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * stbRowH);
        ctx.lineTo(jx, yBase - (r + 1) * stbRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < stbRows; r++) {
      const stagger = (r % 2) * (stbBlockW * 0.5);
      let prevX = rwX;
      let bIdx = 0;
      for (
        let jx = rwX + stbBlockW + stagger;
        jx < rwX + 7 * zoom;
        jx += stbBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - rwX;
          const xOff2 = jx - rwX;
          const yB1 = rwY + 3 * zoom + xOff1 * (-3 / 7);
          const yB2 = rwY + 3 * zoom + xOff2 * (-3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * stbRowH);
          ctx.lineTo(jx, yB2 - r * stbRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * stbRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * stbRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Right stable roof - left slope
    ctx.fillStyle = "#3a3055";
    ctx.beginPath();
    ctx.moveTo(rwX, rwY - 36 * zoom);
    ctx.lineTo(rwX - 9 * zoom, rwY - 24 * zoom);
    ctx.lineTo(rwX, rwY - 20.25 * zoom);
    ctx.closePath();
    ctx.fill();
    // Right stable roof - right slope
    ctx.fillStyle = "#2a2245";
    ctx.beginPath();
    ctx.moveTo(rwX, rwY - 36 * zoom);
    ctx.lineTo(rwX + 9 * zoom, rwY - 24 * zoom);
    ctx.lineTo(rwX, rwY - 20.25 * zoom);
    ctx.closePath();
    ctx.fill();
    // Tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(rwX + -9 * zoom * t, rwY - 36 * zoom + 12 * zoom * t);
      ctx.lineTo(rwX, rwY - 36 * zoom + 15.75 * zoom * t);
      ctx.stroke();
    }
    // Tile row lines - right slope
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(rwX, rwY - 36 * zoom + 15.75 * zoom * t);
      ctx.lineTo(rwX + 9 * zoom * t, rwY - 36 * zoom + 12 * zoom * t);
      ctx.stroke();
    }
    // Ridge cap beam
    ctx.strokeStyle = "#2a0a00";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rwX - 9 * zoom + 2 * zoom, rwY - 24 * zoom - zoom);
    ctx.lineTo(rwX, rwY - 36 * zoom);
    ctx.lineTo(rwX + 9 * zoom - 2 * zoom, rwY - 24 * zoom - zoom);
    ctx.stroke();

    drawIsoFlushRect(
      ctx,
      rwX + 2 * zoom,
      rwY - 8 * zoom,
      8,
      16,
      "right",
      zoom,
      { fill: "#3a2a1a", recessDepth: 1, recessFill: "#1a0a05" },
    );
    // White horse
    ctx.fillStyle = "#b0b0b0";
    ctx.beginPath();
    ctx.ellipse(
      rwX + 2 * zoom,
      rwY - 11 * zoom,
      3.5 * zoom,
      2.8 * zoom,
      0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#8b5fcf";
    ctx.beginPath();
    ctx.arc(rwX + 4 * zoom, rwY - 11.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Pennant on right stable (triangular, matching level 2 style)
    const rwpX = rwX - 2 * zoom;
    const rwpTop = rwY - 44 * zoom;
    const rwpBot = rwY - 34 * zoom;
    const rwpIsoD = 1.5 * zoom;
    // Back face
    ctx.fillStyle = "#5a2d80";
    ctx.beginPath();
    ctx.moveTo(rwpX + rwpIsoD, rwpTop - rwpIsoD * 0.5);
    ctx.quadraticCurveTo(
      rwpX + 5 * zoom + lwFlagWave * 0.6 + rwpIsoD,
      rwpTop + 3.5 * zoom - rwpIsoD * 0.5,
      rwpX + 8 * zoom + lwFlagWave * 0.5 + rwpIsoD,
      rwpTop + 5 * zoom - rwpIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      rwpX + 5 * zoom + lwFlagWave * 0.4 + rwpIsoD,
      rwpTop + 6.5 * zoom - rwpIsoD * 0.5,
      rwpX + rwpIsoD,
      rwpBot - rwpIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#7b3fa0";
    ctx.beginPath();
    ctx.moveTo(rwpX, rwpTop);
    ctx.quadraticCurveTo(
      rwpX + 5 * zoom + lwFlagWave * 0.6,
      rwpTop + 3.5 * zoom,
      rwpX + 8 * zoom + lwFlagWave * 0.5,
      rwpTop + 5 * zoom,
    );
    ctx.quadraticCurveTo(
      rwpX + 5 * zoom + lwFlagWave * 0.4,
      rwpTop + 6.5 * zoom,
      rwpX,
      rwpBot,
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(rwpX + 2.5 * zoom + lwFlagWave * 0.2, rwpTop + 1.5 * zoom);
    ctx.quadraticCurveTo(
      rwpX + 4 * zoom + lwFlagWave * 0.4,
      rwpTop + 5 * zoom,
      rwpX + 2.5 * zoom + lwFlagWave * 0.2,
      rwpBot - 1.5 * zoom,
    );
    ctx.stroke();
    // Pole with isometric depth
    ctx.fillStyle = "#1e2d55";
    ctx.beginPath();
    ctx.moveTo(rwpX - 1 * zoom, rwpBot + 2 * zoom);
    ctx.lineTo(rwpX - 1 * zoom, rwpTop - 2 * zoom);
    ctx.lineTo(rwpX + 1 * zoom, rwpTop - 2 * zoom);
    ctx.lineTo(rwpX + 1 * zoom, rwpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2a3a64";
    ctx.beginPath();
    ctx.moveTo(rwpX + 1 * zoom, rwpTop - 2 * zoom);
    ctx.lineTo(
      rwpX + 1 * zoom + rwpIsoD * 0.5,
      rwpTop - 2 * zoom - rwpIsoD * 0.25,
    );
    ctx.lineTo(
      rwpX + 1 * zoom + rwpIsoD * 0.5,
      rwpBot + 2 * zoom - rwpIsoD * 0.25,
    );
    ctx.lineTo(rwpX + 1 * zoom, rwpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#485882";
    ctx.beginPath();
    ctx.arc(rwpX, rwpTop - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Heavy machinery - gear cluster (bronze, not gold)
    const fGearX = bX + 14 * zoom;
    const fGearY = bY + 9 * zoom;
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.15;
      const r = i % 2 === 0 ? 5 * zoom : 4 * zoom;
      const gx = fGearX + Math.cos(angle) * r;
      const gy = fGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4458";
    ctx.beginPath();
    ctx.ellipse(fGearX, fGearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Steam pipes on foundation
    ctx.strokeStyle = "#485882";
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 24 * zoom, bY + 10 * zoom);
    ctx.lineTo(bX - 24 * zoom, bY - 8 * zoom);
    ctx.quadraticCurveTo(
      bX - 24 * zoom,
      bY - 16 * zoom,
      bX - 16 * zoom,
      bY - 16 * zoom,
    );
    ctx.stroke();
    // Bronze pipe joints
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.arc(bX - 24 * zoom, bY + 10 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bX - 24 * zoom, bY - 8 * zoom, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Steam exhaust with purple glow
    ctx.fillStyle = "#283a68";
    ctx.beginPath();
    ctx.ellipse(
      bX - 16 * zoom,
      bY + 12 * zoom,
      4 * zoom,
      2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    const fireGlow = 0.5 + Math.sin(time * 6) * 0.25;
    ctx.fillStyle = `rgba(140, 80, 200, ${fireGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      bX - 16 * zoom,
      bY + 12 * zoom,
      2.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Steam
    const fSteam = 0.4 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(200, 200, 200, ${fSteam})`;
    ctx.beginPath();
    ctx.arc(
      bX - 16 * zoom + Math.sin(time * 2) * 2,
      bY + 4 * zoom,
      5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // === MAIN FORTRESS ===
    drawIsometricPrism(
      ctx,
      bX,
      bY,
      34,
      28,
      38,
      { top: "#485882", left: "#384a78", right: "#283a68" },
      zoom,
    );

    const fortRows = 8;
    const fortRowH = (38 * zoom) / fortRows;
    const fortBlockW = 5.5 * zoom;

    // Stone texture on main fortress - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX - 17 * zoom, bY);
    ctx.lineTo(bX, bY + 7 * zoom);
    ctx.lineTo(bX, bY - 31 * zoom);
    ctx.lineTo(bX - 17 * zoom, bY - 38 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < fortRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX - 17 * zoom, bY - r * fortRowH);
      ctx.lineTo(bX, bY + 7 * zoom - r * fortRowH);
      ctx.stroke();
    }
    for (let r = 0; r < fortRows; r++) {
      const stagger = (r % 2) * (fortBlockW * 0.5);
      for (
        let jx = bX - 17 * zoom + fortBlockW + stagger;
        jx < bX;
        jx += fortBlockW
      ) {
        const xOff = jx - (bX - 17 * zoom);
        const yBase = bY + xOff * (7 / 17);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * fortRowH);
        ctx.lineTo(jx, yBase - (r + 1) * fortRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < fortRows; r++) {
      const stagger = (r % 2) * (fortBlockW * 0.5);
      let prevX = bX - 17 * zoom;
      let bIdx = 0;
      for (
        let jx = bX - 17 * zoom + fortBlockW + stagger;
        jx < bX;
        jx += fortBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (bX - 17 * zoom);
          const xOff2 = jx - (bX - 17 * zoom);
          const yB1 = bY + xOff1 * (7 / 17);
          const yB2 = bY + xOff2 * (7 / 17);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * fortRowH);
          ctx.lineTo(jx, yB2 - r * fortRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * fortRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * fortRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on main fortress - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(bX, bY + 7 * zoom);
    ctx.lineTo(bX + 17 * zoom, bY);
    ctx.lineTo(bX + 17 * zoom, bY - 38 * zoom);
    ctx.lineTo(bX, bY - 31 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < fortRows; r++) {
      ctx.beginPath();
      ctx.moveTo(bX, bY + 7 * zoom - r * fortRowH);
      ctx.lineTo(bX + 17 * zoom, bY - r * fortRowH);
      ctx.stroke();
    }
    for (let r = 0; r < fortRows; r++) {
      const stagger = (r % 2) * (fortBlockW * 0.5);
      for (
        let jx = bX + fortBlockW + stagger;
        jx < bX + 17 * zoom;
        jx += fortBlockW
      ) {
        const xOff = jx - bX;
        const yBase = bY + 7 * zoom + xOff * (-7 / 17);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * fortRowH);
        ctx.lineTo(jx, yBase - (r + 1) * fortRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < fortRows; r++) {
      const stagger = (r % 2) * (fortBlockW * 0.5);
      let prevX = bX;
      let bIdx = 0;
      for (
        let jx = bX + fortBlockW + stagger;
        jx < bX + 17 * zoom;
        jx += fortBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - bX;
          const xOff2 = jx - bX;
          const yB1 = bY + 7 * zoom + xOff1 * (-7 / 17);
          const yB2 = bY + 7 * zoom + xOff2 * (-7 / 17);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * fortRowH);
          ctx.lineTo(jx, yB2 - r * fortRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * fortRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * fortRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Gothic arrow slit windows on fortress (isometric, flush against wall faces)
    const fortSlitGlow = 0.3 + Math.sin(time * 2) * 0.15;
    drawIsoGothicWindow(
      ctx,
      bX + 6 * zoom,
      bY - 19 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(180, 130, 255",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 12 * zoom,
      bY - 22 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(180, 130, 255",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 6 * zoom,
      bY - 19 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(180, 130, 255",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 12 * zoom,
      bY - 22 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(180, 130, 255",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX + 8 * zoom,
      bY - 33 * zoom,
      2.5,
      10,
      "right",
      zoom,
      "rgba(180, 130, 255",
      fortSlitGlow,
    );
    drawIsoGothicWindow(
      ctx,
      bX - 8 * zoom,
      bY - 33 * zoom,
      2.5,
      10,
      "left",
      zoom,
      "rgba(180, 130, 255",
      fortSlitGlow,
    );

    // Purple trim bands on walls (isometric, both faces)
    const fortHW = 17 * zoom;
    const fortFD = 7 * zoom;
    const bandH = 2.5 * zoom;
    for (let i = 0; i < 3; i++) {
      const bh = 10 * zoom + i * 10 * zoom;
      // Left face band
      ctx.fillStyle = "#7b3fa0";
      ctx.beginPath();
      ctx.moveTo(bX - fortHW, bY - bh);
      ctx.lineTo(bX, bY + fortFD - bh);
      ctx.lineTo(bX, bY + fortFD - bh + bandH);
      ctx.lineTo(bX - fortHW, bY - bh + bandH);
      ctx.closePath();
      ctx.fill();
      // Right face band
      ctx.fillStyle = "#5a2d80";
      ctx.beginPath();
      ctx.moveTo(bX, bY + fortFD - bh);
      ctx.lineTo(bX + fortHW, bY - bh);
      ctx.lineTo(bX + fortHW, bY - bh + bandH);
      ctx.lineTo(bX, bY + fortFD - bh + bandH);
      ctx.closePath();
      ctx.fill();
    }

    // Decorative crossed spears emblem on wall
    ctx.strokeStyle = "#a88217";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(bX - 10 * zoom, bY - 18 * zoom);
    ctx.lineTo(bX - 4 * zoom, bY - 30 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bX + 2 * zoom, bY - 18 * zoom);
    ctx.lineTo(bX - 4 * zoom, bY - 30 * zoom);
    ctx.stroke();
    // Shield behind spears
    ctx.fillStyle = "#7b3fa0";
    ctx.beginPath();
    ctx.moveTo(bX - 4 * zoom, bY - 33 * zoom);
    ctx.lineTo(bX - 8 * zoom, bY - 22 * zoom);
    ctx.lineTo(bX - 4 * zoom, bY - 16 * zoom);
    ctx.lineTo(bX, bY - 22 * zoom);
    ctx.closePath();
    ctx.fill();

    // Royal purple tapestry hanging from wall
    const tapX = bX + 8 * zoom;
    const tapY = bY - 16 * zoom;
    const tapWave = Math.sin(time * 1.5) * 0.8;
    ctx.fillStyle = "#5a2d80";
    ctx.beginPath();
    ctx.moveTo(tapX, tapY - 12 * zoom);
    ctx.lineTo(tapX + 6 * zoom, tapY - 14 * zoom);
    ctx.quadraticCurveTo(
      tapX + 6 * zoom + tapWave,
      tapY - 6 * zoom,
      tapX + 6 * zoom,
      tapY,
    );
    ctx.quadraticCurveTo(tapX + 3 * zoom, tapY + 2 * zoom, tapX, tapY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#7b3fa0";
    ctx.beginPath();
    ctx.moveTo(tapX + 1 * zoom, tapY - 10 * zoom);
    ctx.lineTo(tapX + 5 * zoom, tapY - 12 * zoom);
    ctx.quadraticCurveTo(
      tapX + 5 * zoom + tapWave * 0.7,
      tapY - 6 * zoom,
      tapX + 5 * zoom,
      tapY - 2 * zoom,
    );
    ctx.quadraticCurveTo(
      tapX + 3 * zoom,
      tapY,
      tapX + 1 * zoom,
      tapY - 2 * zoom,
    );
    ctx.closePath();
    ctx.fill();
    // Gold trim on tapestry
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(tapX, tapY - 12 * zoom);
    ctx.lineTo(tapX + 6 * zoom, tapY - 14 * zoom);
    ctx.stroke();
    // Gold lion/crown symbol on tapestry
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(tapX + 3 * zoom, tapY - 10 * zoom);
    ctx.lineTo(tapX + 2 * zoom, tapY - 7 * zoom);
    ctx.lineTo(tapX + 4 * zoom, tapY - 7 * zoom);
    ctx.closePath();
    ctx.fill();

    // Battlements with bronze caps (3x3 grid, sorted back-to-front)
    const keepTop = bY - 38 * zoom;
    const c4hw = 34 * zoom * 0.5;
    const c4hd = 28 * zoom * 0.25;
    const c4Colors = { top: "#b89227", left: "#485882", right: "#384a78" };
    const c4Merlons: { x: number; y: number }[] = [];
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        c4Merlons.push({
          x: bX + col * c4hw * 0.35 + row * c4hw * 0.35,
          y: keepTop + col * c4hd * 0.35 - row * c4hd * 0.35,
        });
      }
    }
    c4Merlons.sort((a, b) => a.y - b.y);
    for (const m of c4Merlons) {
      drawMerlon(ctx, m.x, m.y, 6, 5, 7, c4Colors, zoom);
    }

    // Left watchtower
    const ltX = bX - 18 * zoom;
    const ltY = bY + 4 * zoom;
    drawIsometricPrism(
      ctx,
      ltX,
      ltY,
      12,
      10,
      48,
      { top: "#485882", left: "#384a78", right: "#283a68" },
      zoom,
    );

    const twrRows = 10;
    const twrBlockW = 4 * zoom;
    const ltTwrRowH = (48 * zoom) / twrRows;

    // Stone texture on left watchtower - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ltX - 6 * zoom, ltY - 48 * zoom);
    ctx.lineTo(ltX, ltY - 45.5 * zoom);
    ctx.lineTo(ltX, ltY + 2.5 * zoom);
    ctx.lineTo(ltX - 6 * zoom, ltY);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrRows; r++) {
      ctx.beginPath();
      ctx.moveTo(ltX - 6 * zoom, ltY - r * ltTwrRowH);
      ctx.lineTo(ltX, ltY + 2.5 * zoom - r * ltTwrRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      for (
        let jx = ltX - 6 * zoom + twrBlockW + stagger;
        jx < ltX;
        jx += twrBlockW
      ) {
        const xOff = jx - (ltX - 6 * zoom);
        const yBase = ltY + xOff * (2.5 / 6);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * ltTwrRowH);
        ctx.lineTo(jx, yBase - (r + 1) * ltTwrRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      let prevX = ltX - 6 * zoom;
      let bIdx = 0;
      for (
        let jx = ltX - 6 * zoom + twrBlockW + stagger;
        jx < ltX;
        jx += twrBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (ltX - 6 * zoom);
          const xOff2 = jx - (ltX - 6 * zoom);
          const yB1 = ltY + xOff1 * (2.5 / 6);
          const yB2 = ltY + xOff2 * (2.5 / 6);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * ltTwrRowH);
          ctx.lineTo(jx, yB2 - r * ltTwrRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * ltTwrRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * ltTwrRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on left watchtower - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ltX, ltY - 45.5 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltY - 48 * zoom);
    ctx.lineTo(ltX + 6 * zoom, ltY);
    ctx.lineTo(ltX, ltY + 2.5 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrRows; r++) {
      ctx.beginPath();
      ctx.moveTo(ltX, ltY + 2.5 * zoom - r * ltTwrRowH);
      ctx.lineTo(ltX + 6 * zoom, ltY - r * ltTwrRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      for (
        let jx = ltX + twrBlockW + stagger;
        jx < ltX + 6 * zoom;
        jx += twrBlockW
      ) {
        const xOff = jx - ltX;
        const yBase = ltY + 2.5 * zoom + xOff * (-2.5 / 6);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * ltTwrRowH);
        ctx.lineTo(jx, yBase - (r + 1) * ltTwrRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      let prevX = ltX;
      let bIdx = 0;
      for (
        let jx = ltX + twrBlockW + stagger;
        jx < ltX + 6 * zoom;
        jx += twrBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - ltX;
          const xOff2 = jx - ltX;
          const yB1 = ltY + 2.5 * zoom + xOff1 * (-2.5 / 6);
          const yB2 = ltY + 2.5 * zoom + xOff2 * (-2.5 / 6);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * ltTwrRowH);
          ctx.lineTo(jx, yB2 - r * ltTwrRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * ltTwrRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * ltTwrRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Tower purple bands (isometric, both faces)
    const twrHW = 6 * zoom;
    const twrFD = 2.5 * zoom;
    const twrBandH = 2 * zoom;
    for (let i = 0; i < 3; i++) {
      const tbh = 12 * zoom + i * 12 * zoom;
      ctx.fillStyle = "#7b3fa0";
      ctx.beginPath();
      ctx.moveTo(ltX - twrHW, ltY - tbh);
      ctx.lineTo(ltX, ltY + twrFD - tbh);
      ctx.lineTo(ltX, ltY + twrFD - tbh + twrBandH);
      ctx.lineTo(ltX - twrHW, ltY - tbh + twrBandH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#5a2d80";
      ctx.beginPath();
      ctx.moveTo(ltX, ltY + twrFD - tbh);
      ctx.lineTo(ltX + twrHW, ltY - tbh);
      ctx.lineTo(ltX + twrHW, ltY - tbh + twrBandH);
      ctx.lineTo(ltX, ltY + twrFD - tbh + twrBandH);
      ctx.closePath();
      ctx.fill();
    }
    // Conical roof
    const ltRoofY = ltY - 48 * zoom;
    ctx.fillStyle = "#283a68";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX - 7 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.lineTo(ltX + 7 * zoom, ltRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1e2d55";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX + 7 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY + 3 * zoom);
    ctx.closePath();
    ctx.fill();
    // Tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(ltX - 7 * zoom * t, ltRoofY - 14 * zoom + 14 * zoom * t);
      ctx.lineTo(ltX, ltRoofY - 14 * zoom + 17 * zoom * t);
      ctx.stroke();
    }
    // Tile row lines - right slope
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(ltX, ltRoofY - 14 * zoom + 17 * zoom * t);
      ctx.lineTo(ltX + 7 * zoom * t, ltRoofY - 14 * zoom + 14 * zoom * t);
      ctx.stroke();
    }
    // Ridge line
    ctx.strokeStyle = "#1e2238";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ltX - 7 * zoom, ltRoofY);
    ctx.lineTo(ltX, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX + 7 * zoom, ltRoofY);
    ctx.stroke();
    // Bronze spike finial
    ctx.fillStyle = "#b89227";
    ctx.beginPath();
    ctx.moveTo(ltX, ltRoofY - 22 * zoom);
    ctx.lineTo(ltX - 2 * zoom, ltRoofY - 14 * zoom);
    ctx.lineTo(ltX + 2 * zoom, ltRoofY - 14 * zoom);
    ctx.closePath();
    ctx.fill();
    // Royal pennant on left tower (triangular, matching level 2/3 style)
    const flagWave = Math.sin(time * 3) * 2;
    const rbpX = ltX;
    const rbpTop = ltRoofY - 38 * zoom;
    const rbpBot = ltRoofY - 24 * zoom;
    const rbpIsoD = 1.5 * zoom;
    // Pole with isometric depth (behind flag)
    ctx.fillStyle = "#1e2d55";
    ctx.beginPath();
    ctx.moveTo(rbpX - 1 * zoom, rbpBot + 2 * zoom);
    ctx.lineTo(rbpX - 1 * zoom, rbpTop - 2 * zoom);
    ctx.lineTo(rbpX + 1 * zoom, rbpTop - 2 * zoom);
    ctx.lineTo(rbpX + 1 * zoom, rbpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2a3a64";
    ctx.beginPath();
    ctx.moveTo(rbpX + 1 * zoom, rbpTop - 2 * zoom);
    ctx.lineTo(
      rbpX + 1 * zoom + rbpIsoD * 0.5,
      rbpTop - 2 * zoom - rbpIsoD * 0.25,
    );
    ctx.lineTo(
      rbpX + 1 * zoom + rbpIsoD * 0.5,
      rbpBot + 2 * zoom - rbpIsoD * 0.25,
    );
    ctx.lineTo(rbpX + 1 * zoom, rbpBot + 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Finial
    ctx.fillStyle = "#485882";
    ctx.beginPath();
    ctx.arc(rbpX, rbpTop - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Back face for depth
    ctx.fillStyle = "#5a2d80";
    ctx.beginPath();
    ctx.moveTo(rbpX + rbpIsoD, rbpTop - rbpIsoD * 0.5);
    ctx.quadraticCurveTo(
      rbpX - 7 * zoom - flagWave * 0.6 + rbpIsoD,
      rbpTop + 5 * zoom - rbpIsoD * 0.5,
      rbpX - 12 * zoom - flagWave * 0.5 + rbpIsoD,
      rbpTop + 7 * zoom - rbpIsoD * 0.5,
    );
    ctx.quadraticCurveTo(
      rbpX - 7 * zoom - flagWave * 0.4 + rbpIsoD,
      rbpTop + 9 * zoom - rbpIsoD * 0.5,
      rbpX + rbpIsoD,
      rbpBot - rbpIsoD * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = "#7b3fa0";
    ctx.beginPath();
    ctx.moveTo(rbpX, rbpTop);
    ctx.quadraticCurveTo(
      rbpX - 7 * zoom - flagWave * 0.6,
      rbpTop + 5 * zoom,
      rbpX - 12 * zoom - flagWave * 0.5,
      rbpTop + 7 * zoom,
    );
    ctx.quadraticCurveTo(
      rbpX - 7 * zoom - flagWave * 0.4,
      rbpTop + 9 * zoom,
      rbpX,
      rbpBot,
    );
    ctx.closePath();
    ctx.fill();
    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Cloth fold highlight
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(rbpX - 3.5 * zoom - flagWave * 0.2, rbpTop + 2 * zoom);
    ctx.quadraticCurveTo(
      rbpX - 5.5 * zoom - flagWave * 0.4,
      rbpTop + 7 * zoom,
      rbpX - 3.5 * zoom - flagWave * 0.2,
      rbpBot - 2 * zoom,
    );
    ctx.stroke();

    // Right armory tower (taller)
    const rtX = bX + 18 * zoom;
    const rtY = bY + 4 * zoom;
    drawIsometricPrism(
      ctx,
      rtX,
      rtY,
      14,
      12,
      54,
      { top: "#485882", left: "#384a78", right: "#283a68" },
      zoom,
    );

    const rtTwrRowH = (54 * zoom) / twrRows;

    // Stone texture on right watchtower - left face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rtX - 7 * zoom, rtY - 54 * zoom);
    ctx.lineTo(rtX, rtY - 51 * zoom);
    ctx.lineTo(rtX, rtY + 3 * zoom);
    ctx.lineTo(rtX - 7 * zoom, rtY);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rtX - 7 * zoom, rtY - r * rtTwrRowH);
      ctx.lineTo(rtX, rtY + 3 * zoom - r * rtTwrRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      for (
        let jx = rtX - 7 * zoom + twrBlockW + stagger;
        jx < rtX;
        jx += twrBlockW
      ) {
        const xOff = jx - (rtX - 7 * zoom);
        const yBase = rtY + xOff * (3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * rtTwrRowH);
        ctx.lineTo(jx, yBase - (r + 1) * rtTwrRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      let prevX = rtX - 7 * zoom;
      let bIdx = 0;
      for (
        let jx = rtX - 7 * zoom + twrBlockW + stagger;
        jx < rtX;
        jx += twrBlockW
      ) {
        const shade = (blockSeed[r % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - (rtX - 7 * zoom);
          const xOff2 = jx - (rtX - 7 * zoom);
          const yB1 = rtY + xOff1 * (3 / 7);
          const yB2 = rtY + xOff2 * (3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * rtTwrRowH);
          ctx.lineTo(jx, yB2 - r * rtTwrRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * rtTwrRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * rtTwrRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Stone texture on right watchtower - right face
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rtX, rtY - 51 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtY - 54 * zoom);
    ctx.lineTo(rtX + 7 * zoom, rtY);
    ctx.lineTo(rtX, rtY + 3 * zoom);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8 * zoom;
    for (let r = 1; r < twrRows; r++) {
      ctx.beginPath();
      ctx.moveTo(rtX, rtY + 3 * zoom - r * rtTwrRowH);
      ctx.lineTo(rtX + 7 * zoom, rtY - r * rtTwrRowH);
      ctx.stroke();
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      for (
        let jx = rtX + twrBlockW + stagger;
        jx < rtX + 7 * zoom;
        jx += twrBlockW
      ) {
        const xOff = jx - rtX;
        const yBase = rtY + 3 * zoom + xOff * (-3 / 7);
        ctx.beginPath();
        ctx.moveTo(jx, yBase - r * rtTwrRowH);
        ctx.lineTo(jx, yBase - (r + 1) * rtTwrRowH);
        ctx.stroke();
      }
    }
    for (let r = 0; r < twrRows; r++) {
      const stagger = (r % 2) * (twrBlockW * 0.5);
      let prevX = rtX;
      let bIdx = 0;
      for (
        let jx = rtX + twrBlockW + stagger;
        jx < rtX + 7 * zoom;
        jx += twrBlockW
      ) {
        const shade = (blockSeed[(r + 3) % 7] + bIdx) % 5;
        if (shade < 2) {
          const xOff1 = prevX - rtX;
          const xOff2 = jx - rtX;
          const yB1 = rtY + 3 * zoom + xOff1 * (-3 / 7);
          const yB2 = rtY + 3 * zoom + xOff2 * (-3 / 7);
          ctx.fillStyle =
            shade === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          ctx.beginPath();
          ctx.moveTo(prevX, yB1 - r * rtTwrRowH);
          ctx.lineTo(jx, yB2 - r * rtTwrRowH);
          ctx.lineTo(jx, yB2 - (r + 1) * rtTwrRowH);
          ctx.lineTo(prevX, yB1 - (r + 1) * rtTwrRowH);
          ctx.closePath();
          ctx.fill();
        }
        prevX = jx;
        bIdx++;
      }
    }
    ctx.restore();

    // Tower machinery - bronze gears
    const tGearX = rtX - 4 * zoom;
    const tGearY = rtY - 22 * zoom;
    ctx.fillStyle = "#a88217";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + time * 0.4;
      const r = i % 2 === 0 ? 5 * zoom : 3.8 * zoom;
      const gx = tGearX + Math.cos(angle) * r;
      const gy = tGearY + Math.sin(angle) * r * 0.5;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a4458";
    ctx.beginPath();
    ctx.ellipse(tGearX, tGearY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tower spire
    const rtRoofY = rtY - 54 * zoom;
    ctx.fillStyle = "#283a68";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 18 * zoom);
    ctx.lineTo(rtX - 8 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 4 * zoom);
    ctx.lineTo(rtX + 8 * zoom, rtRoofY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1e2d55";
    ctx.beginPath();
    ctx.moveTo(rtX, rtRoofY - 18 * zoom);
    ctx.lineTo(rtX + 8 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY + 4 * zoom);
    ctx.closePath();
    ctx.fill();
    // Tile row lines - left slope
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.6 * zoom;
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(rtX - 8 * zoom * t, rtRoofY - 18 * zoom + 18 * zoom * t);
      ctx.lineTo(rtX, rtRoofY - 18 * zoom + 22 * zoom * t);
      ctx.stroke();
    }
    // Tile row lines - right slope
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(rtX, rtRoofY - 18 * zoom + 22 * zoom * t);
      ctx.lineTo(rtX + 8 * zoom * t, rtRoofY - 18 * zoom + 18 * zoom * t);
      ctx.stroke();
    }
    // Ridge line
    ctx.strokeStyle = "#1e2238";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rtX - 8 * zoom, rtRoofY);
    ctx.lineTo(rtX, rtRoofY - 18 * zoom);
    ctx.lineTo(rtX + 8 * zoom, rtRoofY);
    ctx.stroke();
    // Bronze finial
    ctx.fillStyle = "#b89227";
    ctx.fillRect(rtX - 1.5 * zoom, rtRoofY - 26 * zoom, 3 * zoom, 10 * zoom);
    ctx.fillRect(rtX - 4 * zoom, rtRoofY - 23 * zoom, 8 * zoom, 3 * zoom);

    // Royal crown ornament
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.moveTo(rtX - 3 * zoom, rtRoofY - 25 * zoom);
    ctx.lineTo(rtX - 2 * zoom, rtRoofY - 28 * zoom);
    ctx.lineTo(rtX - 0.5 * zoom, rtRoofY - 26 * zoom);
    ctx.lineTo(rtX + 0.5 * zoom, rtRoofY - 28 * zoom);
    ctx.lineTo(rtX + 2 * zoom, rtRoofY - 26 * zoom);
    ctx.lineTo(rtX + 3 * zoom, rtRoofY - 28 * zoom);
    ctx.lineTo(rtX + 4 * zoom, rtRoofY - 25 * zoom);
    ctx.closePath();
    ctx.fill();

    // Glowing forge window (purple)
    const forgeGlow = 0.5 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(150, 90, 210, ${forgeGlow})`;
    ctx.beginPath();
    ctx.arc(rtX - 3 * zoom, rtY - 38 * zoom, 5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#384a72";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Main entrance
    ctx.fillStyle = "#1a1e2a";
    ctx.beginPath();
    ctx.moveTo(bX - 7 * zoom, bY - 2 * zoom);
    ctx.lineTo(bX - 7 * zoom, bY - 20 * zoom);
    ctx.arc(bX - 2 * zoom, bY - 20 * zoom, 5 * zoom, Math.PI, 0);
    ctx.lineTo(bX + 3 * zoom, bY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    // Bronze arch
    ctx.strokeStyle = "#b89227";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(bX, bY - 20 * zoom, 5.5 * zoom, Math.PI, 0);
    ctx.stroke();
    // Interior purple glow
    const intGlow = 0.4 + Math.sin(time * 2) * 0.15;
    ctx.fillStyle = `rgba(150, 90, 210, ${intGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      bX - 2 * zoom,
      bY - 10 * zoom,
      4 * zoom,
      8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // (sign removed)
  }

  // ========== STATION DETAILS (Gears, Steam, Signs) ==========

  // Animated gear decoration (on platform edge)
  const gearX = screenPos.x + 20 * zoom;
  const gearY = screenPos.y + 2 * zoom;
  const gearSize = 4 + tower.level * 0.5;
  const gearColor =
    tower.level >= 4
      ? uc("#c9a227", "#8090b8", "#c9a227")
      : tower.level >= 3
        ? "#8a8a92"
        : "#6a5a4a";
  const gearTeeth = 8 + tower.level;

  // Main gear
  ctx.fillStyle = gearColor;
  ctx.beginPath();
  for (let i = 0; i < gearTeeth; i++) {
    const angle = (i / gearTeeth) * Math.PI * 2 + time * 0.5;
    const outerR = gearSize * zoom;
    const innerR = gearSize * 0.7 * zoom;
    const toothAngle = (0.5 / gearTeeth) * Math.PI * 2;

    if (i === 0) {
      ctx.moveTo(
        gearX + Math.cos(angle) * outerR,
        gearY + Math.sin(angle) * outerR * 0.5,
      );
    }
    ctx.lineTo(
      gearX + Math.cos(angle + toothAngle * 0.3) * outerR,
      gearY + Math.sin(angle + toothAngle * 0.3) * outerR * 0.5,
    );
    ctx.lineTo(
      gearX + Math.cos(angle + toothAngle * 0.7) * innerR,
      gearY + Math.sin(angle + toothAngle * 0.7) * innerR * 0.5,
    );
    ctx.lineTo(
      gearX + Math.cos(angle + toothAngle) * innerR,
      gearY + Math.sin(angle + toothAngle) * innerR * 0.5,
    );
  }
  ctx.closePath();
  ctx.fill();
  // Gear center
  ctx.fillStyle =
    tower.level >= 4 ? uc("#b8860b", "#6878a0", "#b8860b") : "#4a4a4a";
  ctx.beginPath();
  ctx.ellipse(
    gearX,
    gearY,
    gearSize * 0.3 * zoom,
    gearSize * 0.15 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Small secondary gear
  const gear2X = gearX - 6 * zoom;
  const gear2Y = gearY + 3 * zoom;
  const gear2Size = gearSize * 0.6;
  ctx.fillStyle = gearColor;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - time * 0.8;
    const outerR = gear2Size * zoom;
    const innerR = gear2Size * 0.65 * zoom;
    const toothAngle = (0.5 / 6) * Math.PI * 2;

    if (i === 0) {
      ctx.moveTo(
        gear2X + Math.cos(angle) * outerR,
        gear2Y + Math.sin(angle) * outerR * 0.5,
      );
    }
    ctx.lineTo(
      gear2X + Math.cos(angle + toothAngle * 0.3) * outerR,
      gear2Y + Math.sin(angle + toothAngle * 0.3) * outerR * 0.5,
    );
    ctx.lineTo(
      gear2X + Math.cos(angle + toothAngle * 0.7) * innerR,
      gear2Y + Math.sin(angle + toothAngle * 0.7) * innerR * 0.5,
    );
    ctx.lineTo(
      gear2X + Math.cos(angle + toothAngle) * innerR,
      gear2Y + Math.sin(angle + toothAngle) * innerR * 0.5,
    );
  }
  ctx.closePath();
  ctx.fill();

  // Steam vents (puffing steam)
  const ventX = screenPos.x - 28 * zoom;
  const ventY = screenPos.y - 5 * zoom;

  // Vent pipe (3D isometric cylinder)
  const vpColor = tower.level >= 3 ? "#5a5a62" : "#6b5030";
  const vpDark = tower.level >= 3 ? "#4a4a52" : "#5b4020";
  ctx.fillStyle = vpDark;
  ctx.beginPath();
  ctx.moveTo(ventX - 1.5 * zoom, ventY + 3 * zoom);
  ctx.lineTo(ventX - 1.5 * zoom, ventY);
  ctx.lineTo(ventX + 1.5 * zoom, ventY);
  ctx.lineTo(ventX + 1.5 * zoom, ventY + 3 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = vpColor;
  ctx.beginPath();
  ctx.ellipse(ventX, ventY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Steam puffs
  const steamPhase = (time * 2) % 3;
  const steamAlpha =
    steamPhase < 1 ? steamPhase : steamPhase < 2 ? 1 : 3 - steamPhase;
  if (steamAlpha > 0.1) {
    ctx.fillStyle = `rgba(200, 200, 200, ${steamAlpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(
      ventX + Math.sin(time * 2) * 2,
      ventY - 4 * zoom - steamPhase * 3 * zoom,
      (2 + steamPhase) * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = `rgba(180, 180, 180, ${steamAlpha * 0.25})`;
    ctx.beginPath();
    ctx.arc(
      ventX + Math.sin(time * 2 + 1) * 3,
      ventY - 8 * zoom - steamPhase * 4 * zoom,
      (1.5 + steamPhase * 0.8) * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // "ON TIME" sign board
  const signX = screenPos.x + 27 * zoom;
  const signY = screenPos.y - 12 * zoom;

  // Sign post (3D isometric)
  const spW = 1 * zoom;
  const spD = 0.8 * zoom;
  const spH = 18 * zoom;
  const spColor =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#5a4a3a";
  const spDark =
    tower.level >= 4 ? uc("#a08020", "#6878a0", "#a08020") : "#4a3a2a";
  ctx.fillStyle = spDark;
  ctx.beginPath();
  ctx.moveTo(signX - spW, signY + spH);
  ctx.lineTo(signX - spW, signY);
  ctx.lineTo(signX, signY - spD * 0.5);
  ctx.lineTo(signX, signY + spH - spD * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = spColor;
  ctx.beginPath();
  ctx.moveTo(signX, signY + spH - spD * 0.5);
  ctx.lineTo(signX, signY - spD * 0.5);
  ctx.lineTo(signX + spW, signY);
  ctx.lineTo(signX + spW, signY + spH);
  ctx.closePath();
  ctx.fill();

  // Sign board (3D isometric)
  const sbW = 16 * zoom;
  const sbH = 8 * zoom;
  const sbD = 2 * zoom;
  const sbLeft = signX - sbW * 0.5;
  const sbTop = signY - sbH;
  ctx.fillStyle =
    tower.level >= 4 ? uc("#302820", "#1e2838", "#2a2a32") : "#3a3a3a";
  ctx.beginPath();
  ctx.moveTo(sbLeft, sbTop);
  ctx.lineTo(sbLeft + sbW, sbTop);
  ctx.lineTo(sbLeft + sbW, sbTop + sbH);
  ctx.lineTo(sbLeft, sbTop + sbH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle =
    tower.level >= 4 ? uc("#423830", "#1e2d55", "#3a3a42") : "#4a4a4a";
  ctx.beginPath();
  ctx.moveTo(sbLeft, sbTop);
  ctx.lineTo(sbLeft + sbD * 0.5, sbTop - sbD * 0.25);
  ctx.lineTo(sbLeft + sbW + sbD * 0.5, sbTop - sbD * 0.25);
  ctx.lineTo(sbLeft + sbW, sbTop);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle =
    tower.level >= 4 ? uc("#201810", "#121828", "#1a1a22") : "#2a2a2a";
  ctx.beginPath();
  ctx.moveTo(sbLeft + sbW, sbTop);
  ctx.lineTo(sbLeft + sbW + sbD * 0.5, sbTop - sbD * 0.25);
  ctx.lineTo(sbLeft + sbW + sbD * 0.5, sbTop + sbH - sbD * 0.25);
  ctx.lineTo(sbLeft + sbW, sbTop + sbH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#e06000";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(sbLeft, sbTop);
  ctx.lineTo(sbLeft + sbW, sbTop);
  ctx.lineTo(sbLeft + sbW, sbTop + sbH);
  ctx.lineTo(sbLeft, sbTop + sbH);
  ctx.closePath();
  ctx.stroke();

  // "ON TIME" text with glow
  const onTimeGlow = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.fillStyle = `rgba(0, 255, 100, ${onTimeGlow})`;
  ctx.shadowColor = "#00ff64";
  ctx.shadowBlur = 4 * zoom;
  ctx.font = `bold ${3.5 * zoom}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("ON TIME", signX, signY - 3 * zoom);
  ctx.shadowBlur = 0;

  // Small indicator lights on sign
  for (let i = 0; i < 3; i++) {
    const lightX = signX - 5 * zoom + i * 5 * zoom;
    const lightY = signY - 1 * zoom;
    const lightOn = Math.sin(time * 4 + i * 0.5) > 0;
    ctx.fillStyle = lightOn ? "#00ff64" : "#1a3a1a";
    ctx.beginPath();
    ctx.arc(lightX, lightY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Level-specific station extras
  if (tower.level >= 2) {
    // Extra pipes
    ctx.strokeStyle =
      tower.level >= 4 ? uc("#b8860b", "#6878a0", "#b8860b") : "#6a6a72";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - 25 * zoom, screenPos.y);
    ctx.quadraticCurveTo(
      screenPos.x - 30 * zoom,
      screenPos.y - 10 * zoom,
      screenPos.x - 28 * zoom,
      screenPos.y - 5 * zoom,
    );
    ctx.stroke();
  }

  if (tower.level >= 3) {
    // Extra gear cluster
    const clusterX = screenPos.x - 30 * zoom;
    const clusterY = screenPos.y + 8 * zoom;
    ctx.fillStyle = "#5a5a62";
    ctx.beginPath();
    ctx.arc(clusterX, clusterY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a4a52";
    ctx.beginPath();
    ctx.arc(
      clusterX + 3 * zoom,
      clusterY + 1.5 * zoom,
      1.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  if (tower.level === 4) {
    // Royal crest on station
    const crestX = screenPos.x - 5 * zoom;
    const crestY = screenPos.y - 35 * zoom;
    ctx.fillStyle = "#c9a227";
    ctx.shadowColor = "#c9a227";
    ctx.shadowBlur = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(crestX, crestY - 5 * zoom);
    ctx.lineTo(crestX - 4 * zoom, crestY);
    ctx.lineTo(crestX - 3 * zoom, crestY + 2 * zoom);
    ctx.lineTo(crestX, crestY + 5 * zoom);
    ctx.lineTo(crestX + 3 * zoom, crestY + 2 * zoom);
    ctx.lineTo(crestX + 4 * zoom, crestY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Crown on crest
    ctx.fillStyle = tower.upgrade === "A" ? "#2d8b2d" : "#7b3fa0";
    ctx.beginPath();
    ctx.moveTo(crestX - 2 * zoom, crestY - 1 * zoom);
    ctx.lineTo(crestX - 1 * zoom, crestY - 3 * zoom);
    ctx.lineTo(crestX, crestY - 1.5 * zoom);
    ctx.lineTo(crestX + 1 * zoom, crestY - 3 * zoom);
    ctx.lineTo(crestX + 2 * zoom, crestY - 1 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Station state variables (used by overlays, loading dock, window reflections, etc.)
  const isSpawning = tower.spawnEffect != null && tower.spawnEffect > 0;
  const spawnIntensity = isSpawning ? Math.max(0, tower.spawnEffect! / 500) : 0;
  const isStationAttacking =
    tower.lastAttack != null && Date.now() - tower.lastAttack < 500;
  const stationAttackPulse = isStationAttacking
    ? Math.max(0, 1 - (Date.now() - tower.lastAttack) / 500)
    : 0;
  const stationActive = isSpawning || isStationAttacking;
  const stationIntensity = Math.max(spawnIntensity, stationAttackPulse);
  const levelScale = 0.8 + tower.level * 0.15;

  // ---- FRONT FENCE EDGES (drawn in front of building body) ----
  {
    const fPostColor =
      tower.level >= 4
        ? uc("#c9a227", "#8090b8", "#c9a227")
        : tower.level >= 3
          ? "#6a6a72"
          : "#6a5230";
    const fRailColor =
      tower.level >= 4
        ? uc("#a88420", "#6878a0", "#a88420")
        : tower.level >= 3
          ? "#5a5a62"
          : "#5a4220";
    const topPlatW =
      tower.level <= 2 ? baseW + 4 : tower.level === 3 ? baseW + 6 : baseW + 8;
    const topPlatD =
      tower.level === 1
        ? baseD + 12
        : tower.level === 2
          ? baseD + 14
          : tower.level === 3
            ? baseD + 16
            : baseD + 18;
    const fW = topPlatW * zoom * 0.5;
    const fD = topPlatD * zoom * 0.25;
    const fBaseY = screenPos.y;
    const fPostH = 4 * zoom;
    const postCount = 5;

    const frontFenceEdges: [number, number, number, number][] = [
      [screenPos.x, fBaseY + fD, screenPos.x + fW, fBaseY],
      [screenPos.x - fW, fBaseY, screenPos.x, fBaseY + fD],
    ];

    ctx.lineCap = "round";

    for (const [x0, y0, x1, y1] of frontFenceEdges) {
      for (let p = 0; p <= postCount; p++) {
        const t = p / postCount;
        const px = x0 + (x1 - x0) * t;
        const py = y0 + (y1 - y0) * t;

        ctx.strokeStyle = fPostColor;
        ctx.lineWidth = 1.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - fPostH);
        ctx.stroke();

        ctx.fillStyle = fPostColor;
        ctx.beginPath();
        ctx.arc(px, py - fPostH, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let r = 0; r < 2; r++) {
        const railY = fPostH * (0.35 + r * 0.45);
        ctx.strokeStyle = fRailColor;
        ctx.lineWidth = 1.0 * zoom;
        ctx.beginPath();
        ctx.moveTo(x0, y0 - railY);
        ctx.lineTo(x1, y1 - railY);
        ctx.stroke();
      }
    }

    ctx.lineCap = "butt";
  }

  // (training dummy moved below trains for z-ordering)

  // (archery target moved below trains for z-ordering)

  // ---- WINDOWS (3D isometric, aligned to building faces) ----
  const reflLightAngle = time * 0.3;
  const frameColor =
    tower.level >= 4
      ? uc("#b89227", "#7888a8", "#b89227")
      : tower.level >= 3
        ? "#5a5a62"
        : "#5a4a3a";
  const frameDark =
    tower.level >= 4
      ? uc("#8a7020", "#5a6888", "#8a7020")
      : tower.level >= 3
        ? "#4a4a52"
        : "#4a3a2a";
  const sillColor =
    tower.level >= 4
      ? uc("#a08020", "#6878a0", "#a08020")
      : tower.level >= 3
        ? "#6a6a72"
        : "#6a5a4a";

  // Isometric slope for window faces: 2:1 isometric
  // Left face runs direction (-1, -ISO_Y_RATIO) toward back-left
  // Right face runs direction (+1, -ISO_Y_RATIO) toward back-right

  // Window positions shifted northeast so they sit properly on building faces
  const winOffX = 4 * zoom;
  const winOffY = -2 * zoom;
  const windowDefs = [
    {
      cx: screenPos.x - 8 * zoom + winOffX,
      cy: screenPos.y - 16 * zoom + winOffY,
      face: "left" as const,
    },
    {
      cx: screenPos.x - 16 * zoom + winOffX,
      cy: screenPos.y - 12 * zoom + winOffY,
      face: "left" as const,
    },
    {
      cx: screenPos.x + 6 * zoom + winOffX,
      cy: screenPos.y - 16 * zoom + winOffY,
      face: "right" as const,
    },
    ...(tower.level >= 2
      ? [
          {
            cx: screenPos.x + 14 * zoom + winOffX,
            cy: screenPos.y - 12 * zoom + winOffY,
            face: "right" as const,
          },
        ]
      : []),
    ...(tower.level >= 3
      ? [
          {
            cx: screenPos.x - 22 * zoom + winOffX,
            cy: screenPos.y - 8 * zoom + winOffY,
            face: "left" as const,
          },
          {
            cx: screenPos.x + 20 * zoom + winOffX,
            cy: screenPos.y - 8 * zoom + winOffY,
            face: "right" as const,
          },
        ]
      : []),
  ];

  for (let ri = 0; ri < windowDefs.length; ri++) {
    const wDef = windowDefs[ri];
    const wx = wDef.cx;
    const wy = wDef.cy;
    const isLeft = wDef.face === "left";

    const winW = 5 * zoom;
    const winH = 6 * zoom;
    const halfW = winW * 0.5;
    const halfH = winH * 0.5;
    const slopeY = isLeft ? -ISO_Y_RATIO : ISO_Y_RATIO;

    // Parallelogram: vertical edges are straight up/down, horizontal edges follow the face
    const tlx = wx - halfW;
    const tly = wy - halfH - halfW * slopeY;
    const trx = wx + halfW;
    const trY = wy - halfH + halfW * slopeY;
    const brx = wx + halfW;
    const bry = wy + halfH + halfW * slopeY;
    const blx = wx - halfW;
    const bly = wy + halfH - halfW * slopeY;

    // Recess shadow (inset depth)
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.moveTo(tlx - 0.5 * zoom, tly - 0.5 * zoom);
    ctx.lineTo(trx + 0.5 * zoom, trY - 0.5 * zoom);
    ctx.lineTo(brx + 0.5 * zoom, bry + 0.5 * zoom);
    ctx.lineTo(blx - 0.5 * zoom, bly + 0.5 * zoom);
    ctx.closePath();
    ctx.fill();

    // Glass pane (dark with gradient)
    const glassDark =
      tower.level >= 4
        ? uc(
            "rgba(30, 25, 15, 0.9)",
            "rgba(15, 22, 42, 0.9)",
            "rgba(20, 25, 45, 0.9)",
          )
        : "rgba(30, 40, 55, 0.9)";
    const glassLight =
      tower.level >= 4
        ? uc(
            "rgba(50, 45, 35, 0.8)",
            "rgba(28, 38, 62, 0.8)",
            "rgba(40, 45, 65, 0.8)",
          )
        : "rgba(50, 60, 75, 0.8)";
    const glassGrad = ctx.createLinearGradient(tlx, tly, brx, bry);
    glassGrad.addColorStop(0, glassDark);
    glassGrad.addColorStop(1, glassLight);
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.moveTo(tlx, tly);
    ctx.lineTo(trx, trY);
    ctx.lineTo(brx, bry);
    ctx.lineTo(blx, bly);
    ctx.closePath();
    ctx.fill();

    // Warm interior glow
    const baseGlow = 0.08 + Math.sin(time * 1.5 + ri * 2.5) * 0.04;
    ctx.fillStyle = `rgba(255, 200, 120, ${baseGlow})`;
    ctx.fill();

    // Reflection sweep
    const reflPhase = Math.sin(reflLightAngle + ri * 1.5);
    if (reflPhase > 0) {
      const reflAlpha = reflPhase * 0.35;
      ctx.fillStyle = `rgba(200, 220, 255, ${reflAlpha})`;
      ctx.beginPath();
      const rMidX = (tlx + trx) * 0.5;
      const rMidY = (tly + trY) * 0.5;
      ctx.moveTo(rMidX - winW * 0.15, rMidY);
      ctx.lineTo(rMidX + winW * 0.15, rMidY + winW * slopeY * 0.3);
      ctx.lineTo(
        (blx + brx) * 0.5 + winW * 0.15,
        (bly + bry) * 0.5 + winW * slopeY * 0.3,
      );
      ctx.lineTo((blx + brx) * 0.5 - winW * 0.15, (bly + bry) * 0.5);
      ctx.closePath();
      ctx.fill();
    }

    // Window frame (isometric parallelogram)
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(tlx, tly);
    ctx.lineTo(trx, trY);
    ctx.lineTo(brx, bry);
    ctx.lineTo(blx, bly);
    ctx.closePath();
    ctx.stroke();

    // Mullion cross (follows the parallelogram)
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 0.7 * zoom;
    const midTopX = (tlx + trx) * 0.5;
    const midTopY = (tly + trY) * 0.5;
    const midBotX = (blx + brx) * 0.5;
    const midBotY = (bly + bry) * 0.5;
    const midLeftX = (tlx + blx) * 0.5;
    const midLeftY = (tly + bly) * 0.5;
    const midRightX = (trx + brx) * 0.5;
    const midRightY = (trY + bry) * 0.5;
    ctx.beginPath();
    ctx.moveTo(midTopX, midTopY);
    ctx.lineTo(midBotX, midBotY);
    ctx.moveTo(midLeftX, midLeftY);
    ctx.lineTo(midRightX, midRightY);
    ctx.stroke();

    // 3D window sill (protruding ledge)
    const sillProj = 1.5 * zoom;
    ctx.fillStyle = sillColor;
    ctx.beginPath();
    ctx.moveTo(blx - sillProj * (isLeft ? 0.3 : -0.3), bly);
    ctx.lineTo(brx + sillProj * (isLeft ? -0.3 : 0.3), bry);
    ctx.lineTo(brx + sillProj * (isLeft ? -0.3 : 0.6), bry + sillProj * 0.5);
    ctx.lineTo(blx - sillProj * (isLeft ? 0.3 : -0.6), bly + sillProj * 0.5);
    ctx.closePath();
    ctx.fill();
    // Sill front face
    ctx.fillStyle = frameDark;
    ctx.beginPath();
    ctx.moveTo(blx - sillProj * (isLeft ? 0.3 : -0.6), bly + sillProj * 0.5);
    ctx.lineTo(brx + sillProj * (isLeft ? -0.3 : 0.6), bry + sillProj * 0.5);
    ctx.lineTo(brx + sillProj * (isLeft ? -0.3 : 0.6), bry + sillProj);
    ctx.lineTo(blx - sillProj * (isLeft ? 0.3 : -0.6), bly + sillProj);
    ctx.closePath();
    ctx.fill();

    // Active glow
    if (stationActive) {
      const winGlow =
        0.2 + stationIntensity * 0.3 + Math.sin(time * 6 + ri * 1.8) * 0.1;
      ctx.fillStyle = isStationAttacking
        ? `rgba(255, 80, 40, ${winGlow})`
        : `rgba(255, 180, 80, ${winGlow})`;
      ctx.beginPath();
      ctx.moveTo(tlx + 0.5 * zoom, tly + 0.5 * zoom);
      ctx.lineTo(trx - 0.5 * zoom, trY + 0.5 * zoom);
      ctx.lineTo(brx - 0.5 * zoom, bry - 0.5 * zoom);
      ctx.lineTo(blx + 0.5 * zoom, bly - 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---- DOOR / ENTRANCE WITH 3D DEPTH ----
  const doorX = screenPos.x - 16 * zoom;
  const doorY = screenPos.y + 2 * zoom;

  // Door step/stoop (small platform in front)
  const stepColor =
    tower.level >= 4
      ? uc("#7a6852", "#485a80", "#7a6a5a")
      : tower.level >= 3
        ? "#5a5a62"
        : "#5a4a3a";
  ctx.fillStyle = stepColor;
  ctx.beginPath();
  ctx.moveTo(doorX - 5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX, doorY + 4 * zoom);
  ctx.lineTo(doorX + 5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX, doorY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Door recess shadow (3D inset)
  const drW = 4 * zoom;
  const drH = 8.5 * zoom;
  const drDepth = 1.5 * zoom;
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY - drH);
  ctx.lineTo(doorX + drW, doorY - drH);
  ctx.lineTo(doorX + drW, doorY + 2 * zoom);
  ctx.lineTo(doorX - drW, doorY + 2 * zoom);
  ctx.closePath();
  ctx.fill();
  // Recess top lip (inset depth)
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY - drH);
  ctx.lineTo(doorX - drW + drDepth * 0.4, doorY - drH - drDepth * 0.2);
  ctx.lineTo(doorX + drW + drDepth * 0.4, doorY - drH - drDepth * 0.2);
  ctx.lineTo(doorX + drW, doorY - drH);
  ctx.closePath();
  ctx.fill();

  // Door frame (3D isometric)
  const doorFrameColor =
    tower.level >= 4
      ? uc("#c9a227", "#8090b8", "#c9a227")
      : tower.level >= 3
        ? "#5a5a62"
        : "#5a4020";
  const doorFrameDark =
    tower.level >= 4
      ? uc("#a08020", "#6878a0", "#a08020")
      : tower.level >= 3
        ? "#4a4a52"
        : "#4a3010";
  // Left jamb
  ctx.fillStyle = doorFrameDark;
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY + 2 * zoom);
  ctx.lineTo(doorX - drW, doorY - drH);
  ctx.lineTo(doorX - drW + 1.5 * zoom, doorY - drH);
  ctx.lineTo(doorX - drW + 1.5 * zoom, doorY + 2 * zoom);
  ctx.closePath();
  ctx.fill();
  // Right jamb
  ctx.fillStyle = doorFrameColor;
  ctx.beginPath();
  ctx.moveTo(doorX + drW - 1.5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX + drW - 1.5 * zoom, doorY - drH);
  ctx.lineTo(doorX + drW, doorY - drH);
  ctx.lineTo(doorX + drW, doorY + 2 * zoom);
  ctx.closePath();
  ctx.fill();
  // Lintel (top bar with 3D top face)
  ctx.fillStyle = doorFrameColor;
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY - drH - 1.5 * zoom);
  ctx.lineTo(doorX + drW, doorY - drH - 1.5 * zoom);
  ctx.lineTo(doorX + drW, doorY - drH);
  ctx.lineTo(doorX - drW, doorY - drH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = doorFrameDark;
  ctx.beginPath();
  ctx.moveTo(doorX - drW, doorY - drH - 1.5 * zoom);
  ctx.lineTo(
    doorX - drW + drDepth * 0.4,
    doorY - drH - 1.5 * zoom - drDepth * 0.2,
  );
  ctx.lineTo(
    doorX + drW + drDepth * 0.4,
    doorY - drH - 1.5 * zoom - drDepth * 0.2,
  );
  ctx.lineTo(doorX + drW, doorY - drH - 1.5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Arch/lintel detail above door
  ctx.strokeStyle = doorFrameColor;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(doorX, doorY - 8 * zoom, 4 * zoom, Math.PI, 0);
  ctx.stroke();

  // Door panels (3D raised detail with isometric depth)
  const panelColor =
    tower.level >= 4
      ? uc("#3a2a1a", "#1e2838", "#3a2a1a")
      : tower.level >= 3
        ? "#3a3a42"
        : "#4a3010";
  const panelLight =
    tower.level >= 4
      ? uc("#4a3a2a", "#1e2d55", "#4a3a2a")
      : tower.level >= 3
        ? "#4a4a52"
        : "#5a4020";
  // Left door panel
  const lpx = doorX - 2.5 * zoom;
  const lpy = doorY - 7 * zoom;
  const pw = 2 * zoom;
  const ph = 8 * zoom;
  ctx.fillStyle = panelColor;
  ctx.beginPath();
  ctx.moveTo(lpx, lpy);
  ctx.lineTo(lpx + pw, lpy);
  ctx.lineTo(lpx + pw, lpy + ph);
  ctx.lineTo(lpx, lpy + ph);
  ctx.closePath();
  ctx.fill();
  // Panel raised inset (upper)
  ctx.fillStyle = panelLight;
  ctx.beginPath();
  ctx.moveTo(lpx + 0.3 * zoom, lpy + 0.5 * zoom);
  ctx.lineTo(lpx + pw - 0.3 * zoom, lpy + 0.5 * zoom);
  ctx.lineTo(lpx + pw - 0.3 * zoom, lpy + ph * 0.4);
  ctx.lineTo(lpx + 0.3 * zoom, lpy + ph * 0.4);
  ctx.closePath();
  ctx.fill();
  // Panel raised inset (lower)
  ctx.beginPath();
  ctx.moveTo(lpx + 0.3 * zoom, lpy + ph * 0.5);
  ctx.lineTo(lpx + pw - 0.3 * zoom, lpy + ph * 0.5);
  ctx.lineTo(lpx + pw - 0.3 * zoom, lpy + ph - 0.5 * zoom);
  ctx.lineTo(lpx + 0.3 * zoom, lpy + ph - 0.5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Right door panel
  const rpx = doorX + 0.5 * zoom;
  ctx.fillStyle = panelColor;
  ctx.beginPath();
  ctx.moveTo(rpx, lpy);
  ctx.lineTo(rpx + pw, lpy);
  ctx.lineTo(rpx + pw, lpy + ph);
  ctx.lineTo(rpx, lpy + ph);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = panelLight;
  ctx.beginPath();
  ctx.moveTo(rpx + 0.3 * zoom, lpy + 0.5 * zoom);
  ctx.lineTo(rpx + pw - 0.3 * zoom, lpy + 0.5 * zoom);
  ctx.lineTo(rpx + pw - 0.3 * zoom, lpy + ph * 0.4);
  ctx.lineTo(rpx + 0.3 * zoom, lpy + ph * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rpx + 0.3 * zoom, lpy + ph * 0.5);
  ctx.lineTo(rpx + pw - 0.3 * zoom, lpy + ph * 0.5);
  ctx.lineTo(rpx + pw - 0.3 * zoom, lpy + ph - 0.5 * zoom);
  ctx.lineTo(rpx + 0.3 * zoom, lpy + ph - 0.5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Center seam line
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(doorX, doorY - 7 * zoom);
  ctx.lineTo(doorX, doorY + 1 * zoom);
  ctx.stroke();

  // Door handles (3D knobs)
  const handleColor =
    tower.level >= 4 ? uc("#e8c847", "#a0b0d0", "#e8c847") : "#8a8a8a";
  const handleDark =
    tower.level >= 4 ? uc("#c9a227", "#7888a8", "#c9a227") : "#6a6a6a";
  for (const hx of [doorX + 1.8 * zoom, doorX - 1.3 * zoom]) {
    ctx.fillStyle = handleDark;
    ctx.beginPath();
    ctx.arc(hx, doorY - 3 * zoom, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = handleColor;
    ctx.beginPath();
    ctx.arc(hx, doorY - 3.2 * zoom, 0.7 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Overhead door light (3D lantern)
  const doorLightGlow = 0.5 + Math.sin(time * 2) * 0.15;
  // Lantern bracket
  ctx.strokeStyle = frameDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(doorX, doorY - drH - 1.5 * zoom);
  ctx.quadraticCurveTo(
    doorX,
    doorY - drH - 4 * zoom,
    doorX,
    doorY - drH - 3 * zoom,
  );
  ctx.stroke();
  // Light bulb
  ctx.fillStyle = `rgba(255, 220, 150, ${doorLightGlow})`;
  ctx.shadowColor = "#ffdd99";
  ctx.shadowBlur = 8 * zoom;
  ctx.beginPath();
  ctx.arc(doorX, doorY - drH - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Light cone on step
  ctx.fillStyle = `rgba(255, 220, 150, ${doorLightGlow * 0.08})`;
  ctx.beginPath();
  ctx.moveTo(doorX - 1.5 * zoom, doorY - drH - 3 * zoom);
  ctx.lineTo(doorX - 5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX + 5 * zoom, doorY + 2 * zoom);
  ctx.lineTo(doorX + 1.5 * zoom, doorY - drH - 3 * zoom);
  ctx.closePath();
  ctx.fill();

  // ---- STRUCTURAL BEAMS / TRUSSES (industrial feel) ----
  const beamColor =
    tower.level >= 4
      ? uc("#8a7020", "#5a6888", "#8a7020")
      : tower.level >= 3
        ? "#5a5a62"
        : "#5a4a3a";
  const beamHighlight =
    tower.level >= 4
      ? uc("#a08828", "#6878a0", "#a08828")
      : tower.level >= 3
        ? "#6a6a72"
        : "#6a5a4a";
  const rivetColor =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#8a8a8a";

  // Right wall cross brace with I-beam profile
  const braceRX = screenPos.x + 6 * zoom;
  const braceRY = screenPos.y - 6 * zoom;

  // Vertical I-beam columns (right wall, 3D isometric)
  const beamIsoD = 1.5 * zoom;
  for (const colOff of [0, 10]) {
    const colX = braceRX + colOff * zoom;
    // Web (center strip with depth)
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.moveTo(colX - 0.8 * zoom, braceRY - 11 * zoom);
    ctx.lineTo(colX + 0.8 * zoom, braceRY - 11 * zoom);
    ctx.lineTo(colX + 0.8 * zoom, braceRY);
    ctx.lineTo(colX - 0.8 * zoom, braceRY);
    ctx.closePath();
    ctx.fill();
    // Web side face (depth)
    ctx.fillStyle = beamHighlight;
    ctx.beginPath();
    ctx.moveTo(colX + 0.8 * zoom, braceRY - 11 * zoom);
    ctx.lineTo(
      colX + 0.8 * zoom + beamIsoD * 0.4,
      braceRY - 11 * zoom - beamIsoD * 0.2,
    );
    ctx.lineTo(colX + 0.8 * zoom + beamIsoD * 0.4, braceRY - beamIsoD * 0.2);
    ctx.lineTo(colX + 0.8 * zoom, braceRY);
    ctx.closePath();
    ctx.fill();
    // Flange top (3D)
    ctx.fillStyle = beamHighlight;
    ctx.beginPath();
    ctx.moveTo(colX - 1.8 * zoom, braceRY - 12 * zoom);
    ctx.lineTo(
      colX - 1.8 * zoom + beamIsoD * 0.4,
      braceRY - 12 * zoom - beamIsoD * 0.2,
    );
    ctx.lineTo(
      colX + 1.8 * zoom + beamIsoD * 0.4,
      braceRY - 12 * zoom - beamIsoD * 0.2,
    );
    ctx.lineTo(colX + 1.8 * zoom, braceRY - 12 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.moveTo(colX - 1.8 * zoom, braceRY - 12 * zoom);
    ctx.lineTo(colX + 1.8 * zoom, braceRY - 12 * zoom);
    ctx.lineTo(colX + 1.8 * zoom, braceRY - 11 * zoom);
    ctx.lineTo(colX - 1.8 * zoom, braceRY - 11 * zoom);
    ctx.closePath();
    ctx.fill();
    // Flange bottom (3D)
    ctx.fillStyle = beamHighlight;
    ctx.beginPath();
    ctx.moveTo(colX - 1.8 * zoom, braceRY);
    ctx.lineTo(colX - 1.8 * zoom + beamIsoD * 0.4, braceRY - beamIsoD * 0.2);
    ctx.lineTo(colX + 1.8 * zoom + beamIsoD * 0.4, braceRY - beamIsoD * 0.2);
    ctx.lineTo(colX + 1.8 * zoom, braceRY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = beamColor;
    ctx.beginPath();
    ctx.moveTo(colX - 1.8 * zoom, braceRY);
    ctx.lineTo(colX + 1.8 * zoom, braceRY);
    ctx.lineTo(colX + 1.8 * zoom, braceRY + 1 * zoom);
    ctx.lineTo(colX - 1.8 * zoom, braceRY + 1 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // Cross brace X pattern (skip for Level 1 - overlaps small roof)
  if (tower.level >= 2) {
    ctx.strokeStyle = beamColor;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(braceRX, braceRY - 11.5 * zoom);
    ctx.lineTo(braceRX + 10 * zoom, braceRY - 0.5 * zoom);
    ctx.moveTo(braceRX + 10 * zoom, braceRY - 11.5 * zoom);
    ctx.lineTo(braceRX, braceRY - 0.5 * zoom);
    ctx.stroke();
  }

  // Horizontal tie beam with I-beam profile (3D)
  ctx.fillStyle = beamHighlight;
  ctx.beginPath();
  ctx.moveTo(braceRX, braceRY - 6.5 * zoom);
  ctx.lineTo(braceRX + beamIsoD * 0.4, braceRY - 6.5 * zoom - beamIsoD * 0.2);
  ctx.lineTo(
    braceRX + 10 * zoom + beamIsoD * 0.4,
    braceRY - 6.5 * zoom - beamIsoD * 0.2,
  );
  ctx.lineTo(braceRX + 10 * zoom, braceRY - 6.5 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = beamColor;
  ctx.beginPath();
  ctx.moveTo(braceRX, braceRY - 6.5 * zoom);
  ctx.lineTo(braceRX + 10 * zoom, braceRY - 6.5 * zoom);
  ctx.lineTo(braceRX + 10 * zoom, braceRY - 5.5 * zoom);
  ctx.lineTo(braceRX, braceRY - 5.5 * zoom);
  ctx.closePath();
  ctx.fill();
  // Beam right face (depth)
  ctx.fillStyle = beamHighlight;
  ctx.beginPath();
  ctx.moveTo(braceRX + 10 * zoom, braceRY - 6.5 * zoom);
  ctx.lineTo(
    braceRX + 10 * zoom + beamIsoD * 0.4,
    braceRY - 6.5 * zoom - beamIsoD * 0.2,
  );
  ctx.lineTo(
    braceRX + 10 * zoom + beamIsoD * 0.4,
    braceRY - 5.5 * zoom - beamIsoD * 0.2,
  );
  ctx.lineTo(braceRX + 10 * zoom, braceRY - 5.5 * zoom);
  ctx.closePath();
  ctx.fill();

  // Gusset plates at brace intersections
  ctx.fillStyle = beamHighlight;
  for (const gp of [
    { x: braceRX + 5 * zoom, y: braceRY - 6 * zoom },
    { x: braceRX, y: braceRY - 11.5 * zoom },
    { x: braceRX + 10 * zoom, y: braceRY - 11.5 * zoom },
  ]) {
    ctx.beginPath();
    ctx.moveTo(gp.x, gp.y - 2 * zoom);
    ctx.lineTo(gp.x + 2 * zoom, gp.y);
    ctx.lineTo(gp.x, gp.y + 2 * zoom);
    ctx.lineTo(gp.x - 2 * zoom, gp.y);
    ctx.closePath();
    ctx.fill();
  }

  // Rivets along tie beam and at joints
  ctx.fillStyle = rivetColor;
  const rivetPositions = [
    { x: braceRX + 1 * zoom, y: braceRY - 6 * zoom },
    { x: braceRX + 5 * zoom, y: braceRY - 6 * zoom },
    { x: braceRX + 9 * zoom, y: braceRY - 6 * zoom },
    { x: braceRX + 0.5 * zoom, y: braceRY - 12 * zoom },
    { x: braceRX + 9.5 * zoom, y: braceRY - 12 * zoom },
    { x: braceRX + 0.5 * zoom, y: braceRY },
    { x: braceRX + 9.5 * zoom, y: braceRY },
  ];
  for (const riv of rivetPositions) {
    ctx.beginPath();
    ctx.arc(riv.x, riv.y, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Left wall diagonal brace (less prominent)
  const braceLX = screenPos.x - 20 * zoom;
  const braceLY = screenPos.y - 6 * zoom;
  ctx.strokeStyle = beamColor;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(braceLX, braceLY - 10 * zoom);
  ctx.lineTo(braceLX - 8 * zoom, braceLY + 2 * zoom);
  ctx.moveTo(braceLX - 8 * zoom, braceLY - 10 * zoom);
  ctx.lineTo(braceLX, braceLY + 2 * zoom);
  ctx.stroke();
  // Left brace rivets
  ctx.fillStyle = rivetColor;
  ctx.beginPath();
  ctx.arc(braceLX - 4 * zoom, braceLY - 4 * zoom, 0.7 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // ---- ROOF RIDGE LINE AND EAVES ----
  const roofRidgeY = screenPos.y - (26 + tower.level * 4) * zoom;
  ctx.strokeStyle =
    tower.level >= 4
      ? uc("#c9a227", "#8090b8", "#c9a227")
      : tower.level >= 3
        ? "#6a6a72"
        : "#7a6040";
  ctx.lineWidth = 2 * zoom;

  // Eave overhang shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 24 * zoom, roofRidgeY + 9 * zoom);
  ctx.lineTo(screenPos.x - 12 * zoom, roofRidgeY + 1 * zoom);
  ctx.lineTo(screenPos.x + 4 * zoom, roofRidgeY + 5 * zoom);
  ctx.lineTo(screenPos.x + 4 * zoom, roofRidgeY + 7 * zoom);
  ctx.lineTo(screenPos.x - 12 * zoom, roofRidgeY + 3 * zoom);
  ctx.lineTo(screenPos.x - 24 * zoom, roofRidgeY + 11 * zoom);
  ctx.closePath();
  ctx.fill();

  // Pressure gauge (on station wall, rendered after roof ridge so it's not covered)
  const gaugeX = screenPos.x - 16 * zoom;
  const gaugeY = screenPos.y - 26 * zoom;

  ctx.fillStyle =
    tower.level >= 4 ? uc("#b8860b", "#6878a0", "#b8860b") : "#8b7355";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f0f0e8";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 0.5 * zoom;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI + Math.PI;
    ctx.beginPath();
    ctx.moveTo(
      gaugeX + Math.cos(angle) * 2.2 * zoom,
      gaugeY + Math.sin(angle) * 2.2 * zoom,
    );
    ctx.lineTo(
      gaugeX + Math.cos(angle) * 2.8 * zoom,
      gaugeY + Math.sin(angle) * 2.8 * zoom,
    );
    ctx.stroke();
  }

  const needleAngle =
    Math.PI + Math.PI * 0.2 + Math.sin(time * 2) * 0.3 + Math.PI * 0.5;
  ctx.strokeStyle = "#cc0000";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(gaugeX, gaugeY);
  ctx.lineTo(
    gaugeX + Math.cos(needleAngle) * 2.5 * zoom,
    gaugeY + Math.sin(needleAngle) * 2.5 * zoom,
  );
  ctx.stroke();

  ctx.fillStyle = "#3a3a3a";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 0.8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // ---- LOADING DOCK WITH CRANE ARM ----
  const dockX = screenPos.x + 26 * zoom;
  const dockY = screenPos.y + 2 * zoom;

  // Dock platform
  stationDiamond(
    dockX,
    dockY + 4 * zoom,
    14,
    10,
    3,
    tower.level >= 4 ? uc("#7a6852", "#485a80", "#7a6a5a") : "#5a5a62",
    tower.level >= 4 ? uc("#6a5842", "#384a72", "#6a5a4a") : "#4a4a52",
    tower.level >= 4 ? uc("#5a4832", "#2a3a65", "#5a4a3a") : "#3a3a42",
  );

  // Dock bumper bollards (3D isometric)
  const bollardColor =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#cc8800";
  const bollardDark =
    tower.level >= 4 ? uc("#a08020", "#6878a0", "#a08020") : "#aa6600";
  const bollardPositions = [
    { x: dockX - 5 * zoom, y: dockY + 2 * zoom },
    { x: dockX + 4 * zoom, y: dockY + 0.5 * zoom },
  ];
  for (const bp of bollardPositions) {
    const bw = 1.5 * zoom;
    const bh = 3.5 * zoom;
    const bd = 1 * zoom;
    ctx.fillStyle = bollardDark;
    ctx.beginPath();
    ctx.moveTo(bp.x, bp.y + bh);
    ctx.lineTo(bp.x, bp.y);
    ctx.lineTo(bp.x + bw * 0.5, bp.y - bd * 0.5);
    ctx.lineTo(bp.x + bw * 0.5, bp.y + bh - bd * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = bollardColor;
    ctx.beginPath();
    ctx.moveTo(bp.x + bw * 0.5, bp.y + bh - bd * 0.5);
    ctx.lineTo(bp.x + bw * 0.5, bp.y - bd * 0.5);
    ctx.lineTo(bp.x + bw, bp.y);
    ctx.lineTo(bp.x + bw, bp.y + bh);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = bollardColor;
    ctx.beginPath();
    ctx.moveTo(bp.x, bp.y);
    ctx.lineTo(bp.x + bw * 0.5, bp.y - bd * 0.5);
    ctx.lineTo(bp.x + bw, bp.y);
    ctx.lineTo(bp.x + bw * 0.5, bp.y + bd * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Stacked crates on dock platform (3D isometric boxes)
  const dockCrateS = 2 * zoom;
  const stackedCrates = [
    {
      ox: -2,
      oy: 0,
      top: tower.level >= 4 ? uc("#c9a230", "#8090b8", "#c9a230") : "#9a7920",
      left: tower.level >= 4 ? uc("#a08020", "#6878a0", "#a08020") : "#7a5810",
      right: tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#8b6914",
    },
    {
      ox: 1,
      oy: -0.5,
      top: tower.level >= 4 ? uc("#d0a835", "#8898b8", "#d0a835") : "#a58025",
      left: tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#8b6914",
      right: tower.level >= 4 ? uc("#c9a230", "#8090b8", "#c9a230") : "#9a7920",
    },
    {
      ox: -0.5,
      oy: -2.5,
      top: tower.level >= 4 ? uc("#dab040", "#98a8c0", "#dab040") : "#b08a30",
      left: tower.level >= 4 ? uc("#c9a230", "#8090b8", "#c9a230") : "#9a7920",
      right: tower.level >= 4 ? uc("#d0a835", "#8898b8", "#d0a835") : "#a58025",
    },
  ];
  for (const scr of stackedCrates) {
    const scrx = dockX + scr.ox * zoom;
    const scry = dockY + scr.oy * zoom;
    // Top face (diamond)
    ctx.fillStyle = scr.top;
    ctx.beginPath();
    ctx.moveTo(scrx, scry - dockCrateS * 1.3);
    ctx.lineTo(scrx + dockCrateS, scry - dockCrateS);
    ctx.lineTo(scrx, scry - dockCrateS * 0.7);
    ctx.lineTo(scrx - dockCrateS, scry - dockCrateS);
    ctx.closePath();
    ctx.fill();
    // Left face
    ctx.fillStyle = scr.left;
    ctx.beginPath();
    ctx.moveTo(scrx - dockCrateS, scry - dockCrateS);
    ctx.lineTo(scrx, scry - dockCrateS * 0.7);
    ctx.lineTo(scrx, scry);
    ctx.lineTo(scrx - dockCrateS, scry - dockCrateS * 0.3);
    ctx.closePath();
    ctx.fill();
    // Right face
    ctx.fillStyle = scr.right;
    ctx.beginPath();
    ctx.moveTo(scrx + dockCrateS, scry - dockCrateS);
    ctx.lineTo(scrx, scry - dockCrateS * 0.7);
    ctx.lineTo(scrx, scry);
    ctx.lineTo(scrx + dockCrateS, scry - dockCrateS * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 0.4 * zoom;
    ctx.stroke();
  }

  // ---- VENT GRATING (3D isometric industrial detail) ----
  const ventGrateX = screenPos.x - 22 * zoom;
  const ventGrateY = screenPos.y - 6 * zoom;
  const vgW = 6 * zoom;
  const vgH = 4 * zoom;
  const vgD = 1.5 * zoom;
  // Vent recess (dark interior)
  ctx.fillStyle = "rgba(20, 20, 25, 0.7)";
  ctx.beginPath();
  ctx.moveTo(ventGrateX, ventGrateY + vgH);
  ctx.lineTo(ventGrateX, ventGrateY);
  ctx.lineTo(ventGrateX + vgD * 0.5, ventGrateY - vgD * 0.25);
  ctx.lineTo(ventGrateX + vgW + vgD * 0.5, ventGrateY - vgD * 0.25);
  ctx.lineTo(ventGrateX + vgW, ventGrateY);
  ctx.lineTo(ventGrateX + vgW, ventGrateY + vgH);
  ctx.closePath();
  ctx.fill();
  // Vent frame (3D rim)
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#8a7020", "#5a6888", "#8a7020") : "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Top lip
  ctx.fillStyle =
    tower.level >= 4 ? uc("#7a6a30", "#384a72", "#7a6a30") : "#4a4a52";
  ctx.beginPath();
  ctx.moveTo(ventGrateX, ventGrateY);
  ctx.lineTo(ventGrateX + vgD * 0.5, ventGrateY - vgD * 0.25);
  ctx.lineTo(ventGrateX + vgW + vgD * 0.5, ventGrateY - vgD * 0.25);
  ctx.lineTo(ventGrateX + vgW, ventGrateY);
  ctx.closePath();
  ctx.fill();
  // Grate slats
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#8a7020", "#5a6888", "#8a7020") : "#5a5a62";
  ctx.lineWidth = 0.6 * zoom;
  for (let vl = 0; vl < 4; vl++) {
    const vlx = ventGrateX + (vl + 0.5) * 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(vlx, ventGrateY + 0.5 * zoom);
    ctx.lineTo(vlx, ventGrateY + vgH - 0.5 * zoom);
    ctx.stroke();
  }
  // Vent glow when active
  if (stationActive) {
    const ventGlow = 0.1 + stationIntensity * 0.2;
    ctx.fillStyle = isStationAttacking
      ? `rgba(255, 80, 30, ${ventGlow})`
      : `rgba(255, 150, 50, ${ventGlow})`;
    ctx.beginPath();
    ctx.moveTo(ventGrateX + 0.5 * zoom, ventGrateY + vgH - 0.5 * zoom);
    ctx.lineTo(ventGrateX + 0.5 * zoom, ventGrateY + 0.5 * zoom);
    ctx.lineTo(ventGrateX + vgW - 0.5 * zoom, ventGrateY + 0.5 * zoom);
    ctx.lineTo(ventGrateX + vgW - 0.5 * zoom, ventGrateY + vgH - 0.5 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // ---- STATUS DISPLAY BOARD ----
  const boardX = screenPos.x + 12 * zoom;
  const boardY = screenPos.y - (22 + tower.level * 2) * zoom;
  const boardW = 12 * zoom;
  const boardH = 7 * zoom;

  // Board frame (3D isometric)
  const boardD = 2 * zoom;
  const bfLeft = boardX - boardW * 0.5;
  const bfTop = boardY - boardH * 0.5;
  // Front face
  ctx.fillStyle =
    tower.level >= 4 ? uc("#3a2a1a", "#121828", "#3a2a1a") : "#1a1a22";
  ctx.beginPath();
  ctx.moveTo(bfLeft, bfTop);
  ctx.lineTo(bfLeft + boardW, bfTop);
  ctx.lineTo(bfLeft + boardW, bfTop + boardH);
  ctx.lineTo(bfLeft, bfTop + boardH);
  ctx.closePath();
  ctx.fill();
  // Top face (depth)
  ctx.fillStyle =
    tower.level >= 4 ? uc("#4a3a2a", "#1e2838", "#4a3a2a") : "#2a2a32";
  ctx.beginPath();
  ctx.moveTo(bfLeft, bfTop);
  ctx.lineTo(bfLeft + boardD * 0.5, bfTop - boardD * 0.25);
  ctx.lineTo(bfLeft + boardW + boardD * 0.5, bfTop - boardD * 0.25);
  ctx.lineTo(bfLeft + boardW, bfTop);
  ctx.closePath();
  ctx.fill();
  // Right face (depth)
  ctx.fillStyle =
    tower.level >= 4 ? uc("#2a1a0a", "#080e1a", "#2a1a0a") : "#0a0a12";
  ctx.beginPath();
  ctx.moveTo(bfLeft + boardW, bfTop);
  ctx.lineTo(bfLeft + boardW + boardD * 0.5, bfTop - boardD * 0.25);
  ctx.lineTo(bfLeft + boardW + boardD * 0.5, bfTop + boardH - boardD * 0.25);
  ctx.lineTo(bfLeft + boardW, bfTop + boardH);
  ctx.closePath();
  ctx.fill();
  // Frame border
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(bfLeft, bfTop);
  ctx.lineTo(bfLeft + boardW, bfTop);
  ctx.lineTo(bfLeft + boardW, bfTop + boardH);
  ctx.lineTo(bfLeft, bfTop + boardH);
  ctx.closePath();
  ctx.stroke();

  // Board screen (dark green/amber depending on level)
  const screenColor =
    tower.level >= 4
      ? uc(
          "rgba(40, 35, 10, 0.9)",
          "rgba(10, 18, 35, 0.9)",
          "rgba(40, 35, 10, 0.9)",
        )
      : "rgba(10, 25, 15, 0.9)";
  ctx.fillStyle = screenColor;
  ctx.beginPath();
  ctx.moveTo(bfLeft + 1 * zoom, bfTop + 1 * zoom);
  ctx.lineTo(bfLeft + boardW - 1 * zoom, bfTop + 1 * zoom);
  ctx.lineTo(bfLeft + boardW - 1 * zoom, bfTop + boardH - 1 * zoom);
  ctx.lineTo(bfLeft + 1 * zoom, bfTop + boardH - 1 * zoom);
  ctx.closePath();
  ctx.fill();

  // Animated text ticker (scrolling dots/dashes simulating a train schedule)
  const tickerSpeed = stationActive ? time * 2 : time * 1.5;
  const dotColor =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#33cc33";
  const dotAlertColor = stationActive
    ? isStationAttacking
      ? "#ff4422"
      : "#ff6c00"
    : dotColor;
  ctx.fillStyle = dotAlertColor;
  const tickerDots = 5;
  for (let td = 0; td < tickerDots; td++) {
    const tdX =
      boardX -
      boardW * 0.4 +
      (((td * 2.5 + tickerSpeed * 2) % (boardW * 0.8)) * zoom) / zoom;
    const tdAlpha = 0.4 + Math.sin(time * 3 + td * 1.5) * 0.3;
    ctx.globalAlpha = tdAlpha;
    ctx.beginPath();
    ctx.arc(tdX + 0.75 * zoom, boardY - 0.5 * zoom, 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Status indicator dots (bottom of board)
  const statusDots = [
    { color: stationActive ? "#ff3333" : "#33cc33", x: -3 },
    { color: stationActive ? "#ffaa00" : "#33cc33", x: 0 },
    { color: "#33cc33", x: 3 },
  ];
  for (const sd of statusDots) {
    const sdBlink = 0.5 + Math.sin(time * 4 + sd.x) * 0.3;
    ctx.fillStyle = sd.color;
    ctx.globalAlpha = sdBlink;
    ctx.beginPath();
    ctx.arc(
      boardX + sd.x * zoom,
      boardY + boardH * 0.3,
      0.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Board mounting bracket (3D)
  const brkW = 1 * zoom;
  const brkH = 4 * zoom;
  const brkD = 0.8 * zoom;
  ctx.fillStyle =
    tower.level >= 4 ? uc("#8a7020", "#384a72", "#8a7020") : "#4a4a52";
  ctx.beginPath();
  ctx.moveTo(boardX - brkW, boardY + boardH * 0.5);
  ctx.lineTo(boardX + brkW, boardY + boardH * 0.5);
  ctx.lineTo(boardX + brkW, boardY + boardH * 0.5 + brkH);
  ctx.lineTo(boardX - brkW, boardY + boardH * 0.5 + brkH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle =
    tower.level >= 4 ? uc("#9a8030", "#5a6888", "#9a8030") : "#5a5a62";
  ctx.beginPath();
  ctx.moveTo(boardX + brkW, boardY + boardH * 0.5);
  ctx.lineTo(boardX + brkW + brkD, boardY + boardH * 0.5 - brkD * 0.5);
  ctx.lineTo(boardX + brkW + brkD, boardY + boardH * 0.5 + brkH - brkD * 0.5);
  ctx.lineTo(boardX + brkW, boardY + boardH * 0.5 + brkH);
  ctx.closePath();
  ctx.fill();

  // ---- ROTATING RADAR DISH (isometric, mounted on building roof) ----
  const radarBaseX = screenPos.x + 10 * zoom;
  const radarBaseY = screenPos.y - (20 + tower.level * 5) * zoom;
  const radarSpeed = stationActive ? 1.8 : 1.2;
  const radarAngle = time * radarSpeed;

  const rdMastCol =
    tower.level >= 4
      ? uc("#c9a227", "#8090b8", "#c9a227")
      : tower.level >= 3
        ? "#6a6a72"
        : "#5a4a3a";
  const rdMastDark =
    tower.level >= 4
      ? uc("#a08020", "#6878a0", "#a08020")
      : tower.level >= 3
        ? "#5a5a62"
        : "#4a3a2a";
  const rdMastLight =
    tower.level >= 4
      ? uc("#d4b030", "#98a8c0", "#d4b030")
      : tower.level >= 3
        ? "#7a7a82"
        : "#6a5a4a";

  // Mast (isometric prism)
  const rdMastH = 8 * zoom;
  drawIsometricPrism(
    ctx,
    radarBaseX,
    radarBaseY + rdMastH,
    2,
    1.5,
    rdMastH / zoom,
    { top: rdMastLight, left: rdMastDark, right: rdMastCol },
    zoom,
  );

  // Mounting bracket (isometric diamond platform)
  const rdPlatY = radarBaseY;
  drawIsometricPrism(
    ctx,
    radarBaseX,
    rdPlatY + 1 * zoom,
    6,
    5,
    1,
    { top: rdMastLight, left: rdMastDark, right: rdMastCol },
    zoom,
  );

  // Pivot post (isometric prism instead of flat rect)
  const rdPivotH = 3 * zoom;
  drawIsometricPrism(
    ctx,
    radarBaseX,
    rdPlatY,
    1.5,
    1,
    rdPivotH / zoom,
    { top: rdMastLight, left: rdMastDark, right: rdMastCol },
    zoom,
  );

  // Pivot hub (isometric ellipse)
  const rdHubY = rdPlatY - rdPivotH;
  const rdHubCol =
    tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#6a6a72";
  ctx.fillStyle = rdHubCol;
  ctx.beginPath();
  ctx.ellipse(radarBaseX, rdHubY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();

  // === 3D DISH (isometric rotation around vertical axis) ===
  const rdSinA = Math.sin(radarAngle);
  const rdCosA = Math.cos(radarAngle);
  const rdDishRadius = (6 + tower.level * 1.2) * zoom * levelScale;
  const rdDishDepth = 3 * zoom;
  const rdArmLen = 3 * zoom;

  // Dish center traces isometric ellipse as it rotates
  const rdDishCX = radarBaseX + rdSinA * rdArmLen;
  const rdDishCY = rdHubY + rdCosA * rdArmLen * ISO_Y_RATIO;

  const rdViewAngle = Math.abs(rdSinA);
  const rdEdgeView = Math.abs(rdCosA);

  // Support arm from hub to dish center
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#6a6a72";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(radarBaseX, rdHubY);
  ctx.lineTo(rdDishCX, rdDishCY);
  ctx.stroke();

  // Counter-arm stub (opposite side for balance)
  const rdCounterX = radarBaseX - rdSinA * rdArmLen * 0.4;
  const rdCounterY = rdHubY - rdCosA * rdArmLen * 0.4 * ISO_Y_RATIO;
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#a08020", "#6878a0", "#a08020") : "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(radarBaseX, rdHubY);
  ctx.lineTo(rdCounterX, rdCounterY);
  ctx.stroke();
  ctx.fillStyle =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#6a6a72";
  ctx.beginPath();
  ctx.arc(rdCounterX, rdCounterY, 1 * zoom, 0, Math.PI * 2);
  ctx.fill();

  if (rdViewAngle > 0.3) {
    const rdFaceW = rdDishRadius * rdViewAngle;
    const rdFaceH = rdDishRadius;
    const rdBowlDepth = rdDishDepth * rdEdgeView;
    const rdFacing = rdSinA > 0;

    // Bowl interior (back face of dish)
    if (rdBowlDepth > 0.5 * zoom) {
      ctx.fillStyle =
        tower.level >= 4 ? uc("#8a7020", "#5a6888", "#8a7020") : "#4a4a52";
      ctx.beginPath();
      ctx.moveTo(
        rdDishCX + (rdFacing ? rdBowlDepth : -rdBowlDepth),
        rdDishCY - rdFaceH,
      );
      ctx.quadraticCurveTo(
        rdDishCX +
          (rdFacing
            ? rdBowlDepth + rdFaceW * 0.5
            : -rdBowlDepth - rdFaceW * 0.5),
        rdDishCY,
        rdDishCX + (rdFacing ? rdBowlDepth : -rdBowlDepth),
        rdDishCY + rdFaceH,
      );
      ctx.lineTo(rdDishCX, rdDishCY + rdFaceH);
      ctx.quadraticCurveTo(
        rdDishCX + (rdFacing ? rdFaceW * 0.4 : -rdFaceW * 0.4),
        rdDishCY,
        rdDishCX,
        rdDishCY - rdFaceH,
      );
      ctx.closePath();
      ctx.fill();
    }

    // Dish face with gradient
    const rdDishGrad = ctx.createRadialGradient(
      rdDishCX,
      rdDishCY,
      0,
      rdDishCX,
      rdDishCY,
      rdFaceH,
    );
    if (tower.level >= 4) {
      rdDishGrad.addColorStop(0, uc("#fff8e0", "#e8e8f0", "#fff8e0"));
      rdDishGrad.addColorStop(0.3, uc("#e8c847", "#b0b0c8", "#e8c847"));
      rdDishGrad.addColorStop(0.7, uc("#c9a227", "#7888a8", "#c9a227"));
      rdDishGrad.addColorStop(1, uc("#a08020", "#5a6888", "#a08020"));
    } else {
      rdDishGrad.addColorStop(0, "#e0e0e8");
      rdDishGrad.addColorStop(0.3, "#c0c0c8");
      rdDishGrad.addColorStop(0.7, "#9898a8");
      rdDishGrad.addColorStop(1, "#6a6a72");
    }
    ctx.fillStyle = rdDishGrad;
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdFaceH);
    ctx.quadraticCurveTo(
      rdDishCX + (rdFacing ? rdFaceW * 0.5 : -rdFaceW * 0.5),
      rdDishCY,
      rdDishCX,
      rdDishCY + rdFaceH,
    );
    ctx.quadraticCurveTo(
      rdDishCX - (rdFacing ? rdFaceW * 0.15 : -rdFaceW * 0.15),
      rdDishCY,
      rdDishCX,
      rdDishCY - rdFaceH,
    );
    ctx.closePath();
    ctx.fill();

    // Dish edge outline
    ctx.strokeStyle =
      tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#7a7a82";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdFaceH);
    ctx.quadraticCurveTo(
      rdDishCX + (rdFacing ? rdFaceW * 0.5 : -rdFaceW * 0.5),
      rdDishCY,
      rdDishCX,
      rdDishCY + rdFaceH,
    );
    ctx.stroke();

    // Concentric ring detail on dish face
    ctx.strokeStyle =
      tower.level >= 4
        ? uc(
            "rgba(255,248,224,0.25)",
            "rgba(200,200,240,0.25)",
            "rgba(255,248,224,0.25)",
          )
        : "rgba(200,200,210,0.25)";
    ctx.lineWidth = 0.5 * zoom;
    for (let cr = 1; cr <= 3; cr++) {
      const crS = cr / 4;
      ctx.beginPath();
      ctx.moveTo(rdDishCX, rdDishCY - rdFaceH * crS);
      ctx.quadraticCurveTo(
        rdDishCX + (rdFacing ? rdFaceW * 0.4 * crS : -rdFaceW * 0.4 * crS),
        rdDishCY,
        rdDishCX,
        rdDishCY + rdFaceH * crS,
      );
      ctx.stroke();
    }

    // Feed horn / receiver (struts + node at focal point)
    const rdRecX = rdDishCX + (rdFacing ? -rdFaceW * 0.6 : rdFaceW * 0.6);
    const rdRecY = rdDishCY;
    ctx.strokeStyle =
      tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#7a7a82";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdFaceH * 0.5);
    ctx.lineTo(rdRecX, rdRecY);
    ctx.moveTo(rdDishCX, rdDishCY + rdFaceH * 0.5);
    ctx.lineTo(rdRecX, rdRecY);
    ctx.moveTo(rdDishCX, rdDishCY);
    ctx.lineTo(rdRecX, rdRecY);
    ctx.stroke();

    // Receiver node
    const rdRecCol = stationActive
      ? "#ff6633"
      : tower.level >= 4
        ? uc("#e8c847", "#a0b0d0", "#e8c847")
        : "#5a5a62";
    ctx.fillStyle = rdRecCol;
    if (stationActive) {
      ctx.shadowColor = "#ff6633";
      ctx.shadowBlur = 6 * zoom;
    }
    ctx.beginPath();
    ctx.arc(rdRecX, rdRecY, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Edge-on profile view
    const rdProfileH = rdDishRadius;
    const rdProfileW = rdDishDepth;
    const rdDir = rdCosA > 0 ? 1 : -1;

    ctx.fillStyle =
      tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#7a7a82";
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdProfileH);
    ctx.quadraticCurveTo(
      rdDishCX + rdDir * rdProfileW,
      rdDishCY,
      rdDishCX,
      rdDishCY + rdProfileH,
    );
    ctx.lineTo(rdDishCX + rdDir * 1 * zoom, rdDishCY + rdProfileH);
    ctx.quadraticCurveTo(
      rdDishCX + rdDir * (rdProfileW + 1 * zoom),
      rdDishCY,
      rdDishCX + rdDir * 1 * zoom,
      rdDishCY - rdProfileH,
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle =
      tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#5a5a62";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(rdDishCX, rdDishCY - rdProfileH);
    ctx.quadraticCurveTo(
      rdDishCX + rdDir * rdProfileW,
      rdDishCY,
      rdDishCX,
      rdDishCY + rdProfileH,
    );
    ctx.stroke();
  }

  // Sweep arc (isometric ellipse, not a flat circle)
  if (stationActive) {
    const sweepAlpha = 0.15 + stationIntensity * 0.3;
    ctx.strokeStyle = `rgba(255, 108, 0, ${sweepAlpha})`;
    ctx.lineWidth = 2 * zoom;
    const sweepR = (8 + tower.level * 2) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      radarBaseX,
      rdHubY,
      sweepR,
      sweepR * ISO_Y_RATIO,
      0,
      radarAngle,
      radarAngle + 0.5,
    );
    ctx.stroke();
  }

  // Dinky trains (extracted to separate file)
  renderDinkyTrains(ctx, tower, screenPos, zoom, time, baseW);

  // ---- TRAINING DUMMY (after trains, before crane for correct z-ordering) ----
  if (tower.level === 1) {
    const dummyX = screenPos.x + isoW * 0.55;
    const dummyY = screenPos.y + 2 * zoom;
    const dSway = Math.sin(time * 1.5) * 0.5 * zoom;

    // Isometric base plate
    ctx.fillStyle = "#5a4a3a";
    ctx.beginPath();
    ctx.moveTo(dummyX - 4 * zoom, dummyY);
    ctx.lineTo(dummyX, dummyY + 2 * zoom);
    ctx.lineTo(dummyX + 4 * zoom, dummyY);
    ctx.lineTo(dummyX, dummyY - 2 * zoom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Main wooden post (isometric prism)
    const postW = 1.8 * zoom;
    const postH = 20 * zoom;
    const postTop = dummyY - postH;
    ctx.fillStyle = "#6b5030";
    ctx.beginPath();
    ctx.moveTo(dummyX - postW, dummyY);
    ctx.lineTo(dummyX - postW, postTop);
    ctx.lineTo(dummyX, postTop - postW * 0.5);
    ctx.lineTo(dummyX + postW, postTop);
    ctx.lineTo(dummyX + postW, dummyY);
    ctx.lineTo(dummyX, dummyY + postW * 0.5);
    ctx.closePath();
    ctx.fill();
    // Post left face
    ctx.fillStyle = "#5a4020";
    ctx.beginPath();
    ctx.moveTo(dummyX - postW, dummyY);
    ctx.lineTo(dummyX - postW, postTop);
    ctx.lineTo(dummyX, postTop - postW * 0.5);
    ctx.lineTo(dummyX, dummyY + postW * 0.5);
    ctx.closePath();
    ctx.fill();
    // Post outline
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    // Crossbar (horizontal arm)
    const armY = dummyY - 14 * zoom;
    const armLen = 6 * zoom;
    const armH = 1.2 * zoom;
    ctx.fillStyle = "#6b5030";
    ctx.fillRect(dummyX - armLen, armY - armH, armLen * 2, armH * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.strokeRect(dummyX - armLen, armY - armH, armLen * 2, armH * 2);

    // Burlap torso (isometric barrel shape)
    const torsoY = dummyY - 13 * zoom;
    const torsoRx = 4.5 * zoom;
    const torsoRy = 6 * zoom;
    // Shadow side
    const torsoGrad = ctx.createLinearGradient(
      dummyX - torsoRx,
      torsoY,
      dummyX + torsoRx,
      torsoY,
    );
    torsoGrad.addColorStop(0, "#b09860");
    torsoGrad.addColorStop(0.35, "#c4aa68");
    torsoGrad.addColorStop(0.65, "#b89c58");
    torsoGrad.addColorStop(1, "#8a7840");
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.ellipse(dummyX, torsoY, torsoRx, torsoRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Burlap stitch lines (horizontal)
    ctx.strokeStyle = "rgba(80,60,20,0.35)";
    ctx.lineWidth = 0.6 * zoom;
    for (let s = -2; s <= 2; s++) {
      const sy = torsoY + s * 2.2 * zoom;
      const sw =
        torsoRx *
        Math.cos(Math.asin(Math.min(1, Math.abs(s * 2.2) / (torsoRy / zoom))));
      ctx.beginPath();
      ctx.moveTo(dummyX - sw, sy);
      ctx.lineTo(dummyX + sw, sy);
      ctx.stroke();
    }
    // Vertical stitch
    ctx.beginPath();
    ctx.moveTo(dummyX, torsoY - torsoRy + 1 * zoom);
    ctx.lineTo(dummyX, torsoY + torsoRy - 1 * zoom);
    ctx.stroke();

    // Straw tufts poking out
    ctx.strokeStyle = "#d4c478";
    ctx.lineWidth = 0.7 * zoom;
    const tufts = [
      { x: -torsoRx + 0.5, y: -2, dx: -2, dy: -1.5 },
      { x: torsoRx - 0.5, y: -1, dx: 2, dy: -1 },
      { x: -torsoRx + 1, y: 3, dx: -1.5, dy: 1.5 },
      { x: torsoRx - 1, y: 2, dx: 2, dy: 1 },
      { x: -1, y: torsoRy / zoom - 0.5, dx: -0.5, dy: 2 },
      { x: 1, y: torsoRy / zoom - 0.5, dx: 1, dy: 1.5 },
    ];
    for (const t of tufts) {
      ctx.beginPath();
      ctx.moveTo(dummyX + t.x * zoom, torsoY + t.y * zoom);
      ctx.lineTo(
        dummyX + (t.x + t.dx) * zoom + dSway,
        torsoY + (t.y + t.dy) * zoom,
      );
      ctx.stroke();
    }

    // Target rings on torso
    ctx.strokeStyle = "#cc3333";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(dummyX, torsoY, 3 * zoom, 3.5 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#dd4444";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(dummyX, torsoY, 1.5 * zoom, 1.8 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Bullseye center
    ctx.fillStyle = "#cc3333";
    ctx.beginPath();
    ctx.arc(dummyX, torsoY, 0.7 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Head (burlap sack)
    const headY = dummyY - 21 * zoom;
    const headR = 3 * zoom;
    const headGrad = ctx.createRadialGradient(
      dummyX - headR * 0.3,
      headY - headR * 0.3,
      0,
      dummyX,
      headY,
      headR,
    );
    headGrad.addColorStop(0, "#c4aa68");
    headGrad.addColorStop(0.7, "#b09860");
    headGrad.addColorStop(1, "#8a7840");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(dummyX, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    // Face markings (simple X eyes and stitched mouth)
    ctx.strokeStyle = "rgba(60,40,10,0.5)";
    ctx.lineWidth = 0.7 * zoom;
    const eyeOff = 1.2 * zoom;
    const eyeS = 0.8 * zoom;
    // Left X eye
    ctx.beginPath();
    ctx.moveTo(dummyX - eyeOff - eyeS, headY - eyeS);
    ctx.lineTo(dummyX - eyeOff + eyeS, headY + eyeS);
    ctx.moveTo(dummyX - eyeOff + eyeS, headY - eyeS);
    ctx.lineTo(dummyX - eyeOff - eyeS, headY + eyeS);
    ctx.stroke();
    // Right X eye
    ctx.beginPath();
    ctx.moveTo(dummyX + eyeOff - eyeS, headY - eyeS);
    ctx.lineTo(dummyX + eyeOff + eyeS, headY + eyeS);
    ctx.moveTo(dummyX + eyeOff + eyeS, headY - eyeS);
    ctx.lineTo(dummyX + eyeOff - eyeS, headY + eyeS);
    ctx.stroke();
    // Stitched mouth
    ctx.beginPath();
    ctx.moveTo(dummyX - 1.2 * zoom, headY + 1.2 * zoom);
    for (let m = 0; m < 4; m++) {
      const mx = dummyX - 1.2 * zoom + m * 0.8 * zoom;
      ctx.lineTo(
        mx + 0.4 * zoom,
        headY + 1.2 * zoom + (m % 2 === 0 ? -0.5 : 0.5) * zoom,
      );
    }
    ctx.stroke();

    // Rope binding at neck
    ctx.strokeStyle = "#8a7040";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      dummyX,
      dummyY - 18.5 * zoom,
      2 * zoom,
      1 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Rope binding at waist
    ctx.beginPath();
    ctx.ellipse(
      dummyX,
      torsoY + torsoRy - 1.5 * zoom,
      3.5 * zoom,
      1 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // ---- ARCHERY TARGET (level 4A, after trains, before crane) ----
  if (tower.level === 4 && tower.upgrade === "A") {
    const tgtX = screenPos.x + isoW * 0.7;
    const tgtY = screenPos.y + 4 * zoom;
    const tgtFaceY = tgtY - 14 * zoom;
    const tgtRx = 6.5 * zoom;
    const tgtRy = 6.5 * zoom;

    // Tripod back leg (drawn first, behind target)
    ctx.strokeStyle = "#5a4020";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(tgtX, tgtFaceY);
    ctx.lineTo(tgtX + 4 * zoom, tgtY + 2 * zoom);
    ctx.stroke();

    // Tripod front-left leg
    ctx.strokeStyle = "#6b5030";
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(tgtX - 1 * zoom, tgtFaceY + 1 * zoom);
    ctx.lineTo(tgtX - 5 * zoom, tgtY + 2 * zoom);
    ctx.stroke();

    // Tripod front-right leg
    ctx.beginPath();
    ctx.moveTo(tgtX + 1 * zoom, tgtFaceY + 1 * zoom);
    ctx.lineTo(tgtX + 1 * zoom, tgtY + 3 * zoom);
    ctx.stroke();

    // Straw backing (visible as thickness behind the face)
    ctx.fillStyle = "#b8a050";
    ctx.beginPath();
    ctx.ellipse(
      tgtX + 0.8 * zoom,
      tgtFaceY + 0.5 * zoom,
      tgtRx + 0.5 * zoom,
      tgtRy + 0.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Straw texture on backing edge
    ctx.strokeStyle = "#a08838";
    ctx.lineWidth = 0.5 * zoom;
    for (let s = 0; s < 12; s++) {
      const sa = (s / 12) * Math.PI * 2;
      const sx = tgtX + 0.8 * zoom + Math.cos(sa) * (tgtRx + 0.5 * zoom);
      const sy = tgtFaceY + 0.5 * zoom + Math.sin(sa) * (tgtRy + 0.5 * zoom);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(
        sx + Math.cos(sa) * 1.5 * zoom,
        sy + Math.sin(sa) * 1.5 * zoom,
      );
      ctx.stroke();
    }

    // Target face (white outer ring)
    const faceGrad = ctx.createRadialGradient(
      tgtX - tgtRx * 0.15,
      tgtFaceY - tgtRy * 0.15,
      0,
      tgtX,
      tgtFaceY,
      tgtRx,
    );
    faceGrad.addColorStop(0, "#f8f8f0");
    faceGrad.addColorStop(0.7, "#e8e8d8");
    faceGrad.addColorStop(1, "#d0d0c0");
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(tgtX, tgtFaceY, tgtRx, tgtRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Ring 1 — red
    ctx.fillStyle = "#c03030";
    ctx.beginPath();
    ctx.ellipse(tgtX, tgtFaceY, tgtRx * 0.78, tgtRy * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ring 2 — white
    ctx.fillStyle = "#f0f0e0";
    ctx.beginPath();
    ctx.ellipse(tgtX, tgtFaceY, tgtRx * 0.56, tgtRy * 0.56, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ring 3 — red
    ctx.fillStyle = "#c03030";
    ctx.beginPath();
    ctx.ellipse(tgtX, tgtFaceY, tgtRx * 0.36, tgtRy * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bullseye — gold center
    ctx.fillStyle = "#e8b820";
    ctx.beginPath();
    ctx.ellipse(tgtX, tgtFaceY, tgtRx * 0.16, tgtRy * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Specular highlight arc on face
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      tgtX,
      tgtFaceY,
      tgtRx * 0.7,
      tgtRy * 0.7,
      0,
      -Math.PI * 0.9,
      -Math.PI * 0.4,
    );
    ctx.stroke();

    // Embedded arrows
    const arrows = [
      { ax: 1.5, ay: -2.5, angle: 0.3 },
      { ax: -2, ay: 1, angle: -0.2 },
      { ax: 3, ay: 0.5, angle: 0.5 },
    ];
    for (const ar of arrows) {
      const arX = tgtX + ar.ax * zoom;
      const arY = tgtFaceY + ar.ay * zoom;
      // Arrow shaft
      ctx.strokeStyle = "#5a4020";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(arX, arY);
      ctx.lineTo(
        arX + Math.cos(ar.angle) * 4 * zoom,
        arY + Math.sin(ar.angle) * 1.5 * zoom,
      );
      ctx.stroke();
      // Fletching
      ctx.strokeStyle = "#c0c0b0";
      ctx.lineWidth = 0.6 * zoom;
      const fEndX = arX + Math.cos(ar.angle) * 4 * zoom;
      const fEndY = arY + Math.sin(ar.angle) * 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(fEndX, fEndY);
      ctx.lineTo(fEndX + 0.8 * zoom, fEndY - 1 * zoom);
      ctx.moveTo(fEndX, fEndY);
      ctx.lineTo(fEndX + 0.8 * zoom, fEndY + 1 * zoom);
      ctx.stroke();
      // Arrow tip (dark point embedded in target)
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.arc(arX, arY, 0.6 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cross-brace binding on tripod
    ctx.strokeStyle = "#8a7040";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(tgtX - 3 * zoom, tgtY - 2 * zoom);
    ctx.lineTo(tgtX + 2 * zoom, tgtY - 1 * zoom);
    ctx.stroke();
  }

  // ========== PLATFORM LAMPS (3D isometric, rendered before crane) ==========
  {
    const lampSpread = 34 + tower.level * 2;
    const lampHeight = 24 + tower.level * 3;
    const lampPositions = [
      {
        x: screenPos.x - lampSpread * zoom,
        y: screenPos.y - lampHeight * zoom,
        side: -1,
      },
      {
        x: screenPos.x + lampSpread * zoom,
        y: screenPos.y - lampHeight * zoom,
        side: 1,
      },
    ];

    const postColor =
      tower.level === 1
        ? "#4a3a28"
        : tower.level === 2
          ? "#3a3a42"
          : tower.level === 3
            ? "#2a2a32"
            : uc("#3a3020", "#2a2a38", "#3a3020");
    const postLight =
      tower.level === 1
        ? "#5a4a38"
        : tower.level === 2
          ? "#4a4a52"
          : tower.level === 3
            ? "#3a3a42"
            : uc("#4a4030", "#3a3a48", "#4a4030");
    const postAccent =
      tower.level === 1
        ? "#6a5a48"
        : tower.level === 2
          ? "#5a5a62"
          : tower.level === 3
            ? "#4a4a52"
            : uc("#5a4a30", "#4a4a58", "#5a4a30");
    const glowR =
      tower.level === 1
        ? 255
        : tower.level === 2
          ? 200
          : tower.level === 3
            ? 180
            : uc(255, 180, 255);
    const glowG =
      tower.level === 1
        ? 180
        : tower.level === 2
          ? 220
          : tower.level === 3
            ? 200
            : uc(160, 160, 160);
    const glowB =
      tower.level === 1
        ? 80
        : tower.level === 2
          ? 255
          : tower.level === 3
            ? 255
            : uc(40, 255, 40);
    const glowHex =
      tower.level === 1
        ? "#ff9632"
        : tower.level === 2
          ? "#64c8ff"
          : tower.level === 3
            ? "#80c8ff"
            : uc("#ffa028", "#b0a0ff", "#ffa028");

    for (let i = 0; i < lampPositions.length; i++) {
      const lamp = lampPositions[i];
      const postH = 34 * zoom;
      const postW = 3 * zoom;
      const postD = 2 * zoom;

      // Ground light pool (drawn first, underneath everything)
      const lampGlow = 0.6 + Math.sin(time * 2.5 + i * Math.PI) * 0.25;
      ctx.fillStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${lampGlow * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(
        lamp.x,
        lamp.y + postH + 2 * zoom,
        10 * zoom,
        5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Isometric base plate (diamond footing)
      const baseW = 4 * zoom;
      const baseD = 2.5 * zoom;
      ctx.fillStyle = postAccent;
      ctx.beginPath();
      ctx.moveTo(lamp.x, lamp.y + postH - baseD);
      ctx.lineTo(lamp.x + baseW, lamp.y + postH);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD);
      ctx.lineTo(lamp.x - baseW, lamp.y + postH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = postColor;
      ctx.beginPath();
      ctx.moveTo(lamp.x - baseW, lamp.y + postH);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD + 1.5 * zoom);
      ctx.lineTo(lamp.x - baseW, lamp.y + postH + 1.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = postLight;
      ctx.beginPath();
      ctx.moveTo(lamp.x + baseW, lamp.y + postH);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD);
      ctx.lineTo(lamp.x, lamp.y + postH + baseD + 1.5 * zoom);
      ctx.lineTo(lamp.x + baseW, lamp.y + postH + 1.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // Post left face (tapers slightly at top)
      ctx.fillStyle = postColor;
      ctx.beginPath();
      ctx.moveTo(lamp.x - postW * 0.6, lamp.y + postH);
      ctx.lineTo(lamp.x - postW * 0.4, lamp.y);
      ctx.lineTo(lamp.x + postD * 0.1, lamp.y - postD * 0.5);
      ctx.lineTo(lamp.x + postD * 0.1, lamp.y + postH - postD * 0.5);
      ctx.closePath();
      ctx.fill();

      // Post right face
      ctx.fillStyle = postLight;
      ctx.beginPath();
      ctx.moveTo(lamp.x + postD * 0.1, lamp.y + postH - postD * 0.5);
      ctx.lineTo(lamp.x + postD * 0.1, lamp.y - postD * 0.5);
      ctx.lineTo(lamp.x + postW * 0.4, lamp.y);
      ctx.lineTo(lamp.x + postW * 0.6, lamp.y + postH);
      ctx.closePath();
      ctx.fill();

      // Decorative band rings along post
      ctx.strokeStyle = postAccent;
      ctx.lineWidth = 1.2 * zoom;
      for (let band = 0; band < 3; band++) {
        const bandY = lamp.y + postH * (0.2 + band * 0.3);
        ctx.beginPath();
        ctx.moveTo(lamp.x - postW * 0.55, bandY);
        ctx.lineTo(lamp.x + postW * 0.55, bandY);
        ctx.stroke();
      }

      // Scroll bracket arm (isometric curved support with depth)
      const armDir = lamp.side;
      const armBaseY = lamp.y + 2 * zoom;
      const armTipX = lamp.x + armDir * 7 * zoom;
      const armTipY = lamp.y - 4 * zoom;

      // Bracket back face (depth)
      ctx.strokeStyle = postColor;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lamp.x, armBaseY);
      ctx.quadraticCurveTo(
        lamp.x + armDir * 5 * zoom,
        armBaseY - 1 * zoom,
        armTipX,
        armTipY,
      );
      ctx.stroke();

      // Bracket front face (lighter)
      ctx.strokeStyle = postLight;
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(lamp.x, armBaseY - 0.8 * zoom);
      ctx.quadraticCurveTo(
        lamp.x + armDir * 5 * zoom,
        armBaseY - 1.8 * zoom,
        armTipX,
        armTipY - 0.8 * zoom,
      );
      ctx.stroke();

      // Decorative scroll curl at bracket end
      ctx.strokeStyle = postAccent;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.arc(
        armTipX,
        armTipY + 1 * zoom,
        2 * zoom,
        -Math.PI * 0.5,
        Math.PI * 0.8,
      );
      ctx.stroke();

      // Hanging chain/rod from bracket to lantern
      const lanternX = armTipX;
      const lanternY = armTipY + 3 * zoom;
      ctx.strokeStyle = postColor;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(armTipX, armTipY);
      ctx.lineTo(lanternX, lanternY - 2 * zoom);
      ctx.stroke();

      // 3D isometric lantern housing
      const lw = 4.5 * zoom;
      const lh = 6 * zoom;
      const ld = 3 * zoom;

      // Lantern roof (pyramid cap)
      ctx.fillStyle = postAccent;
      ctx.beginPath();
      ctx.moveTo(lanternX, lanternY - lh * 0.5 - 2.5 * zoom);
      ctx.lineTo(lanternX - lw * 0.55, lanternY - lh * 0.5);
      ctx.lineTo(lanternX, lanternY - lh * 0.5 + ld * 0.4);
      ctx.lineTo(lanternX + lw * 0.55, lanternY - lh * 0.5);
      ctx.closePath();
      ctx.fill();

      // Lantern left face
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.moveTo(lanternX - lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX - lw * 0.5, lanternY - lh * 0.45);
      ctx.lineTo(lanternX, lanternY - lh * 0.45 - ld * 0.4);
      ctx.lineTo(lanternX, lanternY + lh * 0.4 - ld * 0.4);
      ctx.closePath();
      ctx.fill();

      // Lantern right face
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.moveTo(lanternX, lanternY + lh * 0.4 - ld * 0.4);
      ctx.lineTo(lanternX, lanternY - lh * 0.45 - ld * 0.4);
      ctx.lineTo(lanternX + lw * 0.5, lanternY - lh * 0.45);
      ctx.lineTo(lanternX + lw * 0.5, lanternY + lh * 0.4);
      ctx.closePath();
      ctx.fill();

      // Lantern frame edges
      ctx.strokeStyle = postAccent;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(lanternX - lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX - lw * 0.5, lanternY - lh * 0.45);
      ctx.moveTo(lanternX + lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX + lw * 0.5, lanternY - lh * 0.45);
      ctx.moveTo(lanternX, lanternY + lh * 0.4 - ld * 0.4);
      ctx.lineTo(lanternX, lanternY - lh * 0.45 - ld * 0.4);
      ctx.stroke();

      // Lantern bottom rim
      ctx.fillStyle = postAccent;
      ctx.beginPath();
      ctx.moveTo(lanternX - lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX, lanternY + lh * 0.4 + ld * 0.3);
      ctx.lineTo(lanternX + lw * 0.5, lanternY + lh * 0.4);
      ctx.lineTo(lanternX, lanternY + lh * 0.4 - ld * 0.3);
      ctx.closePath();
      ctx.fill();

      // Left glass pane glow
      ctx.fillStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${lampGlow * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(lanternX - lw * 0.42, lanternY + lh * 0.3);
      ctx.lineTo(lanternX - lw * 0.42, lanternY - lh * 0.3);
      ctx.lineTo(lanternX - lw * 0.05, lanternY - lh * 0.3 - ld * 0.35);
      ctx.lineTo(lanternX - lw * 0.05, lanternY + lh * 0.3 - ld * 0.35);
      ctx.closePath();
      ctx.fill();

      // Right glass pane glow (brighter)
      ctx.fillStyle = `rgba(${Math.min(255, glowR + 20)}, ${Math.min(255, glowG + 20)}, ${Math.min(255, glowB + 20)}, ${lampGlow * 0.65})`;
      ctx.beginPath();
      ctx.moveTo(lanternX + lw * 0.05, lanternY + lh * 0.3 - ld * 0.35);
      ctx.lineTo(lanternX + lw * 0.05, lanternY - lh * 0.3 - ld * 0.35);
      ctx.lineTo(lanternX + lw * 0.42, lanternY - lh * 0.3);
      ctx.lineTo(lanternX + lw * 0.42, lanternY + lh * 0.3);
      ctx.closePath();
      ctx.fill();

      // Inner flame/bulb glow
      ctx.fillStyle = `rgba(${glowR}, ${Math.max(0, glowG - 30)}, ${Math.max(0, glowB - 30)}, ${lampGlow})`;
      ctx.shadowColor = glowHex;
      ctx.shadowBlur = 10 * zoom;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Finial spike on lantern roof
      ctx.fillStyle = postAccent;
      ctx.beginPath();
      ctx.moveTo(lanternX - 0.5 * zoom, lanternY - lh * 0.5 - 2.5 * zoom);
      ctx.lineTo(lanternX, lanternY - lh * 0.5 - 4 * zoom);
      ctx.lineTo(lanternX + 0.5 * zoom, lanternY - lh * 0.5 - 2.5 * zoom);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---- CRANE ARM (rendered above train for correct layering) ----
  {
    const crMastColor =
      tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#6a6a72";
    const crMastDark =
      tower.level >= 4 ? uc("#a08020", "#6878a0", "#a08020") : "#5a5a62";
    const crMastW = 2.5 * zoom;
    const crMastD = 1.5 * zoom;
    const crMastH = 22 * zoom;
    const crMastX = dockX + 4 * zoom;
    const crMastY = dockY - 20 * zoom;
    ctx.fillStyle = crMastDark;
    ctx.beginPath();
    ctx.moveTo(crMastX, crMastY + crMastH);
    ctx.lineTo(crMastX, crMastY);
    ctx.lineTo(crMastX + crMastD * 0.5, crMastY - crMastD * 0.25);
    ctx.lineTo(crMastX + crMastD * 0.5, crMastY + crMastH - crMastD * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = crMastColor;
    ctx.beginPath();
    ctx.moveTo(crMastX + crMastD * 0.5, crMastY + crMastH - crMastD * 0.25);
    ctx.lineTo(crMastX + crMastD * 0.5, crMastY - crMastD * 0.25);
    ctx.lineTo(crMastX + crMastW, crMastY);
    ctx.lineTo(crMastX + crMastW, crMastY + crMastH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = crMastDark;
    ctx.lineWidth = 0.6 * zoom;
    for (let li = 0; li < 4; li++) {
      const ly = crMastY + 2 * zoom + li * 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(crMastX + crMastD * 0.5, ly);
      ctx.lineTo(crMastX + crMastW, ly + 2.5 * zoom);
      ctx.moveTo(crMastX + crMastW, ly);
      ctx.lineTo(crMastX + crMastD * 0.5, ly + 2.5 * zoom);
      ctx.stroke();
    }

    ctx.fillStyle = crMastColor;
    ctx.beginPath();
    ctx.arc(dockX + 5.2 * zoom, dockY - 20 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    const pulleySpin = time * (stationActive ? 0.8 : 0.5);
    for (let ps = 0; ps < 4; ps++) {
      const psA = pulleySpin + (ps / 4) * Math.PI * 2;
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(dockX + 5.2 * zoom, dockY - 20 * zoom);
      ctx.lineTo(
        dockX + 5.2 * zoom + Math.cos(psA) * 1.5 * zoom,
        dockY - 20 * zoom + Math.sin(psA) * 1.5 * zoom,
      );
      ctx.stroke();
    }

    const craneSpeed = stationActive ? 0.5 : 0.3;
    const craneAngle = time * craneSpeed;
    const craneArmLen = 14 * zoom;
    const craneArmX = dockX + 5 * zoom + Math.cos(craneAngle) * craneArmLen;
    const craneArmY =
      dockY - 20 * zoom + Math.sin(craneAngle) * craneArmLen * 0.3;

    ctx.strokeStyle =
      tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#7a7a82";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(dockX + 5 * zoom, dockY - 20 * zoom);
    ctx.lineTo(craneArmX, craneArmY);
    ctx.stroke();

    ctx.lineWidth = 0.7 * zoom;
    for (let tv = 0; tv < 3; tv++) {
      const tvT = (tv + 1) / 4;
      const tvx = dockX + 5 * zoom + (craneArmX - dockX - 5 * zoom) * tvT;
      const tvy = dockY - 20 * zoom + (craneArmY - dockY + 20 * zoom) * tvT;
      ctx.beginPath();
      ctx.moveTo(tvx, tvy - 1.5 * zoom);
      ctx.lineTo(tvx + 1.5 * zoom, tvy);
      ctx.lineTo(tvx, tvy + 1.5 * zoom);
      ctx.stroke();
    }

    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1 * zoom;
    const cableSwing = Math.sin(time * 2 + 0.5) * 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(craneArmX, craneArmY);
    ctx.quadraticCurveTo(
      craneArmX + cableSwing * 0.5,
      craneArmY + 6 * zoom,
      craneArmX + cableSwing,
      craneArmY + 10 * zoom,
    );
    ctx.stroke();

    const hangCrateSize = 2.5 * zoom;
    const hangCrateX = craneArmX + cableSwing;
    const hangCrateY = craneArmY + 10 * zoom;
    ctx.fillStyle =
      tower.level >= 4 ? uc("#c9a230", "#8090b8", "#c9a230") : "#9a7920";
    ctx.beginPath();
    ctx.moveTo(hangCrateX, hangCrateY - hangCrateSize * 0.3);
    ctx.lineTo(hangCrateX + hangCrateSize, hangCrateY);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 0.3);
    ctx.lineTo(hangCrateX - hangCrateSize, hangCrateY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle =
      tower.level >= 4 ? uc("#a08020", "#6878a0", "#a08020") : "#7a5810";
    ctx.beginPath();
    ctx.moveTo(hangCrateX - hangCrateSize, hangCrateY);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 0.3);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 1.5);
    ctx.lineTo(hangCrateX - hangCrateSize, hangCrateY + hangCrateSize * 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle =
      tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#8b6914";
    ctx.beginPath();
    ctx.moveTo(hangCrateX + hangCrateSize, hangCrateY);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 0.3);
    ctx.lineTo(hangCrateX, hangCrateY + hangCrateSize * 1.5);
    ctx.lineTo(hangCrateX + hangCrateSize, hangCrateY + hangCrateSize * 1.2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // ========== SPAWN POSITIONS ==========
  const spawnPositions = [
    { x: screenPos.x - 24 * zoom, y: screenPos.y + 22 * zoom },
    { x: screenPos.x, y: screenPos.y + 28 * zoom },
    { x: screenPos.x + 24 * zoom, y: screenPos.y + 22 * zoom },
  ];

  if (tower.showSpawnMarkers || tower.selected) {
    for (let i = 0; i < spawnPositions.length; i++) {
      const pos = spawnPositions[i];
      const occupied = (tower.occupiedSpawnSlots || [])[i];
      const pulse = 0.6 + Math.sin(time * 3 + i) * 0.3;

      ctx.strokeStyle = occupied
        ? `rgba(255, 100, 100, ${pulse * 0.6})`
        : `rgba(255, 108, 0, ${pulse})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.setLineDash([5 * zoom, 4 * zoom]);
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 14 * zoom, 7 * zoom, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = occupied
        ? "rgba(180, 80, 80, 0.9)"
        : "rgba(200, 100, 0, 0.9)";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${6 * zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText((i + 1).toString(), pos.x, pos.y + 2 * zoom);
    }
  }

  // (Spawn effect removed - no large circle effects)

  // ========== ENHANCED ANIMATED OVERLAYS ==========

  // ---- SIGNAL LIGHTS (cycling red/green/amber) ----
  const signalBaseX = screenPos.x - 30 * zoom;
  const signalBaseY = screenPos.y - (6 + tower.level * 2) * zoom;
  const sigPostW = 2.5 * zoom;
  const sigPostD = 1.5 * zoom;

  // 3D signal post (left face)
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.moveTo(signalBaseX - sigPostW * 0.5, signalBaseY + 16 * zoom);
  ctx.lineTo(signalBaseX - sigPostW * 0.5, signalBaseY);
  ctx.lineTo(signalBaseX, signalBaseY - sigPostD * 0.5);
  ctx.lineTo(signalBaseX, signalBaseY + 16 * zoom - sigPostD * 0.5);
  ctx.closePath();
  ctx.fill();

  // 3D signal post (right face)
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.moveTo(signalBaseX, signalBaseY + 16 * zoom - sigPostD * 0.5);
  ctx.lineTo(signalBaseX, signalBaseY - sigPostD * 0.5);
  ctx.lineTo(signalBaseX + sigPostW * 0.5, signalBaseY);
  ctx.lineTo(signalBaseX + sigPostW * 0.5, signalBaseY + 16 * zoom);
  ctx.closePath();
  ctx.fill();

  // 3D signal housing (left face)
  const shY = signalBaseY - 12 * zoom;
  const shW = 4 * zoom;
  const shH = 14 * zoom;
  const shD = 3 * zoom;

  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.moveTo(signalBaseX - shW, shY + shH);
  ctx.lineTo(signalBaseX - shW, shY);
  ctx.lineTo(signalBaseX - shW + shD * 0.5, shY - shD * 0.25);
  ctx.lineTo(signalBaseX - shW + shD * 0.5, shY + shH - shD * 0.25);
  ctx.closePath();
  ctx.fill();

  // 3D signal housing (right face)
  ctx.fillStyle = "#2a2a2e";
  ctx.beginPath();
  ctx.moveTo(signalBaseX - shW + shD * 0.5, shY + shH - shD * 0.25);
  ctx.lineTo(signalBaseX - shW + shD * 0.5, shY - shD * 0.25);
  ctx.lineTo(signalBaseX + shW, shY);
  ctx.lineTo(signalBaseX + shW, shY + shH);
  ctx.closePath();
  ctx.fill();

  // 3D signal housing (top face)
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.moveTo(signalBaseX - shW, shY);
  ctx.lineTo(signalBaseX - shW + shD * 0.5, shY - shD * 0.25);
  ctx.lineTo(signalBaseX + shW, shY);
  ctx.lineTo(signalBaseX + shW - shD * 0.5, shY + shD * 0.25);
  ctx.closePath();
  ctx.fill();

  // Housing visor hoods over each light
  ctx.fillStyle = "#1a1a1e";
  for (let vi = 0; vi < 3; vi++) {
    const visorY = shY + 1.5 * zoom + vi * 4.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(signalBaseX - shW - 1.5 * zoom, visorY);
    ctx.lineTo(signalBaseX - shW, visorY - 1 * zoom);
    ctx.lineTo(signalBaseX + shW, visorY - 1 * zoom);
    ctx.lineTo(signalBaseX + shW + 1.5 * zoom, visorY);
    ctx.closePath();
    ctx.fill();
  }

  const signalCycle = (time * 0.5) % 3;
  const signalColors = [
    { color: "#ff3333", glowColor: "#ff0000", label: "red" },
    { color: "#ffaa00", glowColor: "#ff8800", label: "amber" },
    { color: "#33ff33", glowColor: "#00ff00", label: "green" },
  ];

  for (let si = 0; si < 3; si++) {
    const lightY = signalBaseY - 10 * zoom + si * 4.5 * zoom;
    const isActive = Math.floor(signalCycle) === si;
    const brightness = isActive ? 0.8 + Math.sin(time * 6) * 0.2 : 0.15;
    const sc = signalColors[si];

    if (isActive) {
      ctx.shadowColor = sc.glowColor;
      ctx.shadowBlur = 8 * zoom;
    }
    ctx.fillStyle = isActive ? sc.color : `rgba(40, 40, 40, 0.8)`;
    ctx.globalAlpha = isActive ? brightness : 0.5;
    ctx.beginPath();
    ctx.arc(signalBaseX, lightY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // During active state (spawn or attack), all lights flash
  if (stationActive) {
    const alertRate = isStationAttacking ? 8 : 6;
    const alertFlash = Math.sin(time * alertRate) > 0 ? 0.9 : 0.2;
    const alertColor = isStationAttacking
      ? `rgba(255, 50, 30, ${alertFlash})`
      : `rgba(255, 108, 0, ${alertFlash})`;
    ctx.fillStyle = alertColor;
    ctx.shadowColor = isStationAttacking ? "#ff3220" : "#ff6c00";
    ctx.shadowBlur = 10 * zoom;
    for (let si = 0; si < 3; si++) {
      const lightY = signalBaseY - 10 * zoom + si * 4.5 * zoom;
      ctx.beginPath();
      ctx.arc(signalBaseX, lightY, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // ---- CONVEYOR BELT / TRANSPORT TRACK ----
  const conveyorCX = screenPos.x + 8 * zoom;
  const conveyorCY = screenPos.y + 6 * zoom;
  const conveyorLen = 20 * zoom;
  const conveyorW = 3 * zoom;
  const beltSpeed = stationActive ? time * 2.5 : time * 1.5;

  // Belt side rails (3D frame) — 2:1 iso slope
  const beltRailColor =
    tower.level >= 4
      ? uc("#8a7020", "#5a6888", "#8a7020")
      : tower.level >= 3
        ? "#4a4a52"
        : "#5a4a3a";
  const beltTilt = -ISO_ANGLE;
  ctx.strokeStyle = beltRailColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(conveyorCX - conveyorLen * 0.5, conveyorCY - conveyorW);
  ctx.lineTo(
    conveyorCX + conveyorLen * 0.5,
    conveyorCY - conveyorW - conveyorLen * 0.5,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(conveyorCX - conveyorLen * 0.5, conveyorCY);
  ctx.lineTo(
    conveyorCX + conveyorLen * 0.5,
    conveyorCY - conveyorLen * 0.5 + conveyorW,
  );
  ctx.stroke();

  // Belt surface
  ctx.fillStyle = tower.level >= 3 ? "#3a3a42" : "#4a3a2a";
  ctx.beginPath();
  ctx.moveTo(conveyorCX - conveyorLen * 0.5, conveyorCY - conveyorW);
  ctx.lineTo(
    conveyorCX + conveyorLen * 0.5,
    conveyorCY - conveyorW - conveyorLen * 0.5,
  );
  ctx.lineTo(
    conveyorCX + conveyorLen * 0.5,
    conveyorCY - conveyorLen * 0.5 + conveyorW,
  );
  ctx.lineTo(conveyorCX - conveyorLen * 0.5, conveyorCY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Roller drums at each end — tilted to match belt angle
  const rollerColor =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#6a6a72";
  for (const rEnd of [-0.5, 0.5]) {
    const rx = conveyorCX + conveyorLen * rEnd;
    const ry = conveyorCY - (rEnd + 0.5) * conveyorLen * 0.5;
    ctx.fillStyle = rollerColor;
    ctx.beginPath();
    ctx.ellipse(
      rx,
      ry - conveyorW * 0.5,
      conveyorW * 0.8,
      conveyorW * 0.4,
      beltTilt,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    const rollerSpin = time * (stationActive ? 3 : 2);
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.5 * zoom;
    for (let rs = 0; rs < 4; rs++) {
      const rsAngle = rollerSpin + rs * Math.PI * 0.5;
      const rsx = Math.cos(rsAngle) * conveyorW * 0.5;
      const rsy = Math.sin(rsAngle) * conveyorW * 0.25;
      const tCos = Math.cos(beltTilt);
      const tSin = Math.sin(beltTilt);
      ctx.beginPath();
      ctx.moveTo(
        rx + rsx * tCos - rsy * tSin,
        ry - conveyorW * 0.5 + rsx * tSin + rsy * tCos,
      );
      ctx.lineTo(
        rx - rsx * tCos + rsy * tSin,
        ry - conveyorW * 0.5 - rsx * tSin - rsy * tCos,
      );
      ctx.stroke();
    }
  }

  // Moving belt chevron segments
  ctx.lineWidth = 1.5 * zoom;
  const numSegments = 8;
  for (let seg = 0; seg < numSegments; seg++) {
    const segT = (seg / numSegments + beltSpeed * 0.1) % 1;
    const sx = conveyorCX - conveyorLen * 0.5 + segT * conveyorLen;
    const sy = conveyorCY - segT * conveyorLen * 0.5;
    ctx.strokeStyle =
      tower.level >= 4
        ? uc(
            `rgba(201, 162, 39, 0.6)`,
            `rgba(160, 160, 180, 0.6)`,
            `rgba(201, 162, 39, 0.6)`,
          )
        : `rgba(120, 120, 130, 0.6)`;
    ctx.beginPath();
    ctx.moveTo(sx, sy - conveyorW);
    ctx.lineTo(sx + 1.5 * zoom, sy - conveyorW * 0.5);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }

  // Belt glow during active state
  if (stationActive) {
    const beltGlow = 0.1 + stationIntensity * 0.15;
    ctx.fillStyle = isStationAttacking
      ? `rgba(255, 60, 30, ${beltGlow})`
      : `rgba(255, 180, 80, ${beltGlow})`;
    ctx.beginPath();
    ctx.moveTo(conveyorCX - conveyorLen * 0.5, conveyorCY - conveyorW);
    ctx.lineTo(
      conveyorCX + conveyorLen * 0.5,
      conveyorCY - conveyorW - conveyorLen * 0.5,
    );
    ctx.lineTo(
      conveyorCX + conveyorLen * 0.5,
      conveyorCY - conveyorLen * 0.5 + conveyorW,
    );
    ctx.lineTo(conveyorCX - conveyorLen * 0.5, conveyorCY);
    ctx.closePath();
    ctx.fill();
  }

  // Multiple cargo crates on belt — 3D isometric boxes
  const crateColors = [
    tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#8b6914",
    tower.level >= 4 ? uc("#a08020", "#6878a0", "#a08020") : "#7a5810",
    tower.level >= 4 ? uc("#c9a230", "#8090b8", "#c9a230") : "#9a7920",
  ];
  const crateDarkColors = [
    tower.level >= 4 ? uc("#8a6a17", "#5a6888", "#8a6a17") : "#6b4904",
    tower.level >= 4 ? uc("#806010", "#5a5a72", "#806010") : "#5a3800",
    tower.level >= 4 ? uc("#a98220", "#6878a0", "#a98220") : "#7a5910",
  ];
  for (let ci = 0; ci < 3; ci++) {
    const crateT = (beltSpeed * 0.08 + ci * 0.33) % 1;
    const crateX = conveyorCX - conveyorLen * 0.4 + crateT * conveyorLen * 0.8;
    const crateY =
      conveyorCY - (0.1 + crateT * 0.8) * conveyorLen * 0.5 - conveyorW * 0.5;
    const crateSize = (2.5 - ci * 0.3) * zoom;
    const cw = crateSize;
    const cd = crateSize * 0.5;
    const ch = crateSize * 1.2;

    // Left face
    ctx.fillStyle = crateDarkColors[ci];
    ctx.beginPath();
    ctx.moveTo(crateX - cw, crateY - ch);
    ctx.lineTo(crateX, crateY + cd - ch);
    ctx.lineTo(crateX, crateY + cd);
    ctx.lineTo(crateX - cw, crateY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Right face
    ctx.fillStyle = crateColors[ci];
    ctx.beginPath();
    ctx.moveTo(crateX + cw, crateY - ch);
    ctx.lineTo(crateX, crateY + cd - ch);
    ctx.lineTo(crateX, crateY + cd);
    ctx.lineTo(crateX + cw, crateY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Top face
    ctx.fillStyle = crateColors[ci];
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(crateX, crateY - cd - ch);
    ctx.lineTo(crateX - cw, crateY - ch);
    ctx.lineTo(crateX, crateY + cd - ch);
    ctx.lineTo(crateX + cw, crateY - ch);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ---- OSCILLATING COMM ANTENNA WITH SIGNAL WAVES ----
  // Antenna base sits on the main building roof/battlements for each level
  const antennaHeight = (12 + tower.level * 2) * zoom;
  const roofTopForAntenna =
    tower.level === 1
      ? screenPos.y - 50 * zoom
      : tower.level === 2
        ? screenPos.y - 44 * zoom
        : tower.level === 3
          ? screenPos.y - 46 * zoom
          : tower.upgrade === "A"
            ? screenPos.y - 45 * zoom
            : screenPos.y - 51 * zoom;
  const antennaX = stationX;
  const antennaY = roofTopForAntenna - antennaHeight;
  const antOscillation = Math.sin(time * 3) * 2 * zoom;

  // Antenna mast
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#6a6a72";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(antennaX, antennaY + antennaHeight);
  ctx.lineTo(antennaX + antOscillation * 0.3, antennaY);
  ctx.stroke();

  // Antenna tip node
  const antTipX = antennaX + antOscillation * 0.3;
  const antTipY = antennaY;
  ctx.fillStyle =
    tower.level >= 4 ? uc("#e8c847", "#a0b0d0", "#e8c847") : "#aaaaaa";
  ctx.beginPath();
  ctx.arc(antTipX, antTipY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Blinking LED on tip
  const ledRate = stationActive ? 10 : 8;
  const ledBlink = Math.sin(time * ledRate) > 0.3;
  if (ledBlink) {
    ctx.fillStyle = stationActive ? "#ff3333" : "#33ff33";
    ctx.shadowColor = stationActive ? "#ff0000" : "#00ff00";
    ctx.shadowBlur = (stationActive ? 10 : 6) * zoom;
    ctx.beginPath();
    ctx.arc(antTipX, antTipY - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Cross-bar elements on antenna mast
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#6a6a72";
  ctx.lineWidth = 1 * zoom;
  for (let cb = 0; cb < 3; cb++) {
    const cbY = antennaY + antennaHeight * (0.25 + cb * 0.25);
    const cbW = (3.5 - cb * 0.8) * zoom;
    const cbSway = antOscillation * (1 - cb * 0.2) * 0.3;
    ctx.beginPath();
    ctx.moveTo(antennaX + cbSway - cbW, cbY);
    ctx.lineTo(antennaX + cbSway + cbW, cbY);
    ctx.stroke();
  }

  // Signal wave arcs emanating from antenna (always blue/cyan, no red)
  const numWaves = stationActive ? 4 : 2;
  const waveSpeedMul = stationActive ? 2.5 : 2;
  for (let w = 0; w < numWaves; w++) {
    const wavePhase = (time * waveSpeedMul + w * 0.5) % 2;
    if (wavePhase < 1.5) {
      const waveR = (5 + wavePhase * 14) * zoom;
      const waveAlpha = (1 - wavePhase / 1.5) * (stationActive ? 0.45 : 0.3);
      ctx.strokeStyle = `rgba(100, 200, 255, ${waveAlpha})`;
      ctx.lineWidth = (stationActive ? 2 : 1.5) * zoom;
      ctx.beginPath();
      ctx.arc(antTipX, antTipY, waveR, -Math.PI * 0.7, -Math.PI * 0.05);
      ctx.stroke();
    }
  }

  // Signal wave particles (always blue/cyan, no red)
  const sigParticleCount = stationActive ? 4 : 2;
  for (let p = 0; p < sigParticleCount; p++) {
    const pPhase = (time * (stationActive ? 3.5 : 3) + p * 1.2) % 2;
    if (pPhase < 1.2) {
      const pDist = pPhase * 18 * zoom;
      const pAngle = -Math.PI * 0.35 + Math.sin(time * 2 + p) * 0.3;
      const pAlpha = (1 - pPhase / 1.2) * 0.7;
      ctx.fillStyle = `rgba(120, 200, 255, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(
        antTipX + Math.cos(pAngle) * pDist,
        antTipY + Math.sin(pAngle) * pDist,
        (1.8 - pPhase * 0.6) * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // (Helipad removed)

  // ---- TRACK SWITCHING MECHANISM ----
  const switchX = screenPos.x - 6 * zoom;
  const switchY = screenPos.y + 14 * zoom;
  const switchAngle = Math.sin(time * 0.8) * 0.4;

  // Track ties (3D isometric wooden cross-beams beneath switch)
  const tieColor =
    tower.level >= 4
      ? uc("#5a4832", "#2a3a65", "#5a4a3a")
      : tower.level >= 3
        ? "#4a4a52"
        : "#5a4a3a";
  const tieDark =
    tower.level >= 4
      ? uc("#4a382a", "#1e2d55", "#4a3a2a")
      : tower.level >= 3
        ? "#3a3a42"
        : "#4a3a2a";
  for (let ti = 0; ti < 3; ti++) {
    const tix = switchX + (ti - 1) * 4 * zoom;
    const tiy = switchY + (ti - 1) * 2 * zoom;
    const tw = 3 * zoom;
    const th = 1.2 * zoom;
    const td = 0.6 * zoom;
    // Top face
    ctx.fillStyle = tieColor;
    ctx.beginPath();
    ctx.moveTo(tix - tw, tiy - th * 0.5);
    ctx.lineTo(tix - tw + td, tiy - th * 0.5 - td * 0.5);
    ctx.lineTo(tix + tw + td, tiy - th * 0.5 - td * 0.5);
    ctx.lineTo(tix + tw, tiy - th * 0.5);
    ctx.closePath();
    ctx.fill();
    // Front face
    ctx.fillStyle = tieDark;
    ctx.beginPath();
    ctx.moveTo(tix - tw, tiy - th * 0.5);
    ctx.lineTo(tix + tw, tiy - th * 0.5);
    ctx.lineTo(tix + tw, tiy + th * 0.5);
    ctx.lineTo(tix - tw, tiy + th * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Guard rails (fixed outer rails)
  const guardColor =
    tower.level >= 4 ? uc("#a08020", "#6878a0", "#a08020") : "#6a6a72";
  ctx.strokeStyle = guardColor;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(switchX - 6 * zoom, switchY + 3 * zoom);
  ctx.lineTo(switchX + 6 * zoom, switchY - 3 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(switchX - 6 * zoom, switchY + 5 * zoom);
  ctx.lineTo(switchX + 6 * zoom, switchY - 1 * zoom);
  ctx.stroke();

  // Switch rail pivot point (enhanced)
  ctx.fillStyle =
    tower.level >= 4 ? uc("#8a7020", "#5a6888", "#8a7020") : "#3a3a42";
  ctx.beginPath();
  ctx.arc(switchX, switchY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
  // Pivot center bolt
  ctx.fillStyle =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#7a7a82";
  ctx.beginPath();
  ctx.arc(switchX, switchY, 1 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Switch lever rail
  ctx.save();
  ctx.translate(switchX, switchY);
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#b89227", "#7888a8", "#b89227") : "#7a7a82";
  ctx.lineWidth = 2.5 * zoom;
  const swLeverX = Math.cos(-0.5 + switchAngle) * 10 * zoom;
  const swLeverY = Math.sin(-0.5 + switchAngle) * 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(swLeverX, swLeverY);
  ctx.stroke();

  // Switch lever handle (grip at end)
  ctx.fillStyle =
    tower.level >= 4 ? uc("#c9a227", "#8090b8", "#c9a227") : "#5a5a62";
  ctx.beginPath();
  ctx.arc(swLeverX, swLeverY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle =
    tower.level >= 4 ? uc("#e8c847", "#a0b0d0", "#e8c847") : "#8a8a92";
  ctx.beginPath();
  ctx.arc(swLeverX, swLeverY, 1.2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Switch indicator light housing (3D isometric box)
  const slhW = 2.5 * zoom;
  const slhH = 5 * zoom;
  const slhD = 1.5 * zoom;
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.moveTo(-slhW, -6 * zoom + slhH);
  ctx.lineTo(-slhW, -6 * zoom);
  ctx.lineTo(-slhW + slhD * 0.5, -6 * zoom - slhD * 0.25);
  ctx.lineTo(-slhW + slhD * 0.5, -6 * zoom + slhH - slhD * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2a2a2e";
  ctx.beginPath();
  ctx.moveTo(-slhW + slhD * 0.5, -6 * zoom + slhH - slhD * 0.25);
  ctx.lineTo(-slhW + slhD * 0.5, -6 * zoom - slhD * 0.25);
  ctx.lineTo(slhW, -6 * zoom);
  ctx.lineTo(slhW, -6 * zoom + slhH);
  ctx.closePath();
  ctx.fill();
  const switchLit = switchAngle > 0;
  ctx.fillStyle = switchLit ? "#33ff33" : "#ff3333";
  ctx.shadowColor = switchLit ? "#00ff00" : "#ff0000";
  ctx.shadowBlur = (stationActive ? 8 : 4) * zoom;
  ctx.beginPath();
  ctx.arc(0, -3.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // (Active-state energy buildup

  // ---- CHIMNEY SMOKE / STEAM (passive, all levels, denser during active) ----
  const smokeX = screenPos.x - 18 * zoom;
  const smokeBaseY = screenPos.y - (22 + tower.level * 4) * zoom;
  const numSmokePuffs = stationActive
    ? 6 + tower.level
    : 3 + Math.min(tower.level, 2);
  const smokeSpeedMul = stationActive ? 1.6 : 0.8;

  for (let sm = 0; sm < numSmokePuffs; sm++) {
    const smPhase = (time * smokeSpeedMul + sm * 0.7) % 3;
    if (smPhase < 2.5) {
      const smDrift =
        Math.sin(time * 0.5 + sm * 2.3) * (stationActive ? 6 : 4) * zoom;
      const smY = smokeBaseY - smPhase * (stationActive ? 12 : 8) * zoom;
      const smR = (2 + smPhase * (stationActive ? 2.2 : 1.5)) * zoom;
      const smAlpha = Math.max(
        0,
        (1 - smPhase / 2.5) * (stationActive ? 0.35 : 0.25),
      );

      // Layered puff - darker core, lighter outer
      ctx.fillStyle = stationActive
        ? `rgba(140, 120, 100, ${smAlpha * 0.6})`
        : `rgba(160, 160, 160, ${smAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(smokeX + smDrift, smY, smR * 1.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = stationActive
        ? `rgba(200, 180, 160, ${smAlpha})`
        : `rgba(190, 190, 200, ${smAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX + smDrift, smY, smR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Secondary steam vent (right side of building)
  const vent2X = screenPos.x + 4 * zoom;
  const vent2Y = screenPos.y - (20 + tower.level * 3) * zoom;
  const steamPuffs = stationActive ? 4 : 2;
  for (let sv = 0; sv < steamPuffs; sv++) {
    const svPhase = (time * 1.2 + sv * 1.1) % 2.5;
    if (svPhase < 1.8) {
      const svDrift = Math.sin(time * 0.7 + sv * 1.7) * 3 * zoom;
      const svY = vent2Y - svPhase * 7 * zoom;
      const svR = (1.5 + svPhase * 1.2) * zoom;
      const svAlpha = Math.max(0, (1 - svPhase / 1.8) * 0.2);
      ctx.fillStyle = `rgba(200, 210, 220, ${svAlpha})`;
      ctx.beginPath();
      ctx.arc(vent2X + svDrift, svY, svR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- PLATFORM EDGE RUNNING LIGHTS ----
  const edgeLightCount = 4 + tower.level;
  for (let el = 0; el < edgeLightCount; el++) {
    const elT = el / (edgeLightCount - 1);
    const elx = screenPos.x - isoW + elT * isoW * 2;
    const ely = screenPos.y + isoD * (1 - Math.abs(elT - 0.5) * 2) + 2 * zoom;
    const elPulse = 0.2 + Math.sin(time * 3 + el * 1.2) * 0.3;
    const elAlpha = stationActive ? elPulse + stationIntensity * 0.3 : elPulse;

    ctx.fillStyle =
      tower.level >= 4
        ? uc(
            `rgba(201, 162, 39, ${elAlpha})`,
            `rgba(160, 160, 190, ${elAlpha})`,
            `rgba(201, 162, 39, ${elAlpha})`,
          )
        : `rgba(255, 200, 100, ${elAlpha})`;
    ctx.beginPath();
    ctx.arc(elx, ely, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- ROTATING WEATHERVANE (transport compass on roof peak) ----
  // For level 1, this is drawn earlier (before semaphore) to layer behind it.
  if (tower.level !== 1) {
    drawWeathervane(ctx, screenPos, tower, zoom, time);
  }

  // ---- ANIMATED GROUND-LEVEL CARGO TROLLEY (NW isometric axis) ----
  const trolleyTrackLen = 18 * zoom;
  const trolleyCX = screenPos.x - 12 * zoom;
  const trolleyCY = screenPos.y + 20 * zoom;
  const trolleySpeed = stationActive ? time * 0.8 : time * 0.5;
  const trolleyT = Math.sin(trolleySpeed) * 0.5 + 0.5;
  const trolleyX = trolleyCX - trolleyT * trolleyTrackLen;
  const trolleyY = trolleyCY - trolleyT * trolleyTrackLen * 0.5;

  // Trolley track (pair of thin rails along NW axis)
  ctx.strokeStyle =
    tower.level >= 4 ? uc("#a08020", "#6878a0", "#a08020") : "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(trolleyCX, trolleyCY);
  ctx.lineTo(trolleyCX - trolleyTrackLen, trolleyCY - trolleyTrackLen * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(trolleyCX + 2 * zoom, trolleyCY + 1 * zoom);
  ctx.lineTo(
    trolleyCX - trolleyTrackLen + 2 * zoom,
    trolleyCY - trolleyTrackLen * 0.5 + 1 * zoom,
  );
  ctx.stroke();

  // Track ties (perpendicular to NW axis = NE direction)
  ctx.strokeStyle = tower.level >= 3 ? "#4a4a52" : "#5a4a3a";
  ctx.lineWidth = 1.2 * zoom;
  for (let tt = 0; tt < 5; tt++) {
    const ttT = tt / 4;
    const ttx = trolleyCX - ttT * trolleyTrackLen;
    const tty = trolleyCY - ttT * trolleyTrackLen * 0.5;
    ctx.beginPath();
    ctx.moveTo(ttx - 1 * zoom, tty + 1 * zoom);
    ctx.lineTo(ttx + 3 * zoom, tty - 1 * zoom);
    ctx.stroke();
  }

  // Trolley body (3D isometric cart prism, rotated 90°)
  const trolleyH = 3 * zoom;
  const trolleyTop =
    tower.level >= 4
      ? uc("#b89227", "#7888a8", "#b89227")
      : tower.level >= 3
        ? "#5a5a62"
        : "#6a5a4a";
  const trolleyLeft =
    tower.level >= 4
      ? uc("#a08020", "#6878a0", "#a08020")
      : tower.level >= 3
        ? "#4a4a52"
        : "#5a4a3a";
  const trolleyRight =
    tower.level >= 4
      ? uc("#8a7020", "#5a6888", "#8a7020")
      : tower.level >= 3
        ? "#3a3a42"
        : "#4a3a2a";
  drawIsometricPrism(
    ctx,
    trolleyX,
    trolleyY + trolleyH,
    5,
    8,
    2,
    {
      top: trolleyTop,
      left: trolleyLeft,
      right: trolleyRight,
      leftBack: darkenColor(trolleyLeft, -10),
      rightBack: darkenColor(trolleyRight, -10),
    },
    zoom,
  );

  // Tiny cargo on trolley (3D isometric crate, rotated 90°)
  const cargoTop =
    tower.level >= 4 ? uc("#c9a230", "#8090b8", "#c9a230") : "#8b6914";
  drawIsometricPrism(
    ctx,
    trolleyX,
    trolleyY + 1 * zoom,
    1.5,
    3,
    2,
    {
      top: cargoTop,
      left: darkenColor(cargoTop, 20),
      right: darkenColor(cargoTop, 35),
    },
    zoom,
  );

  // Trolley wheels (along NW axis)
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.ellipse(
    trolleyX + 1 * zoom,
    trolleyY + trolleyH + 1.5 * zoom,
    1.2 * zoom,
    0.6 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    trolleyX - 1 * zoom,
    trolleyY + trolleyH - 0.5 * zoom,
    1.2 * zoom,
    0.6 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ---- HEAT SHIMMER ABOVE CHIMNEY ----
  const shimmerX = screenPos.x - 18 * zoom;
  const shimmerBaseY = screenPos.y - (26 + tower.level * 4) * zoom;
  const shimmerCount = stationActive ? 5 : 3;
  for (let sh = 0; sh < shimmerCount; sh++) {
    const shPhase = (time * 0.6 + sh * 0.8) % 2;
    if (shPhase < 1.5) {
      const shY = shimmerBaseY - shPhase * 12 * zoom;
      const shWobble = Math.sin(time * 4 + sh * 2.3) * 3 * zoom;
      const shAlpha = (1 - shPhase / 1.5) * (stationActive ? 0.08 : 0.04);
      const shW = (4 + shPhase * 2) * zoom;

      ctx.strokeStyle = `rgba(255, 220, 180, ${shAlpha})`;
      ctx.lineWidth = shW;
      ctx.beginPath();
      ctx.moveTo(shimmerX + shWobble - shW, shY);
      ctx.quadraticCurveTo(
        shimmerX + shWobble,
        shY - 2 * zoom,
        shimmerX + shWobble + shW,
        shY,
      );
      ctx.stroke();
    }
  }

  // ---- EMBER PARTICLES FROM CHIMNEY (during active state) ----
  if (stationActive) {
    const emberCount = isStationAttacking ? 6 : 3;
    for (let em = 0; em < emberCount; em++) {
      const emPhase = (time * 3 + em * 1.3) % 2.5;
      if (emPhase < 2) {
        const emDriftX = Math.sin(time * 5 + em * 4.1) * 5 * zoom;
        const emDriftY = Math.cos(time * 3 + em * 2.7) * 2 * zoom;
        const emY = shimmerBaseY - emPhase * 14 * zoom + emDriftY;
        const emAlpha = (1 - emPhase / 2) * 0.8;
        const emSize = (1.2 - emPhase * 0.3) * zoom;

        ctx.fillStyle = `rgba(255, ${140 + Math.floor(emPhase * 60)}, 40, ${emAlpha})`;
        ctx.shadowColor = "#ff8828";
        ctx.shadowBlur = 3 * zoom;
        ctx.beginPath();
        ctx.arc(shimmerX + emDriftX, emY, emSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
  }

  // ---- WIRE/CABLE CONNECTIONS (antenna to building) ----
  const wireStartX = antennaX;
  const wireStartY = antennaY + antennaHeight * 0.7;
  const wireEndX = screenPos.x - 4 * zoom;
  const wireEndY = screenPos.y - 18 * zoom;
  ctx.strokeStyle =
    tower.level >= 4
      ? uc(
          "rgba(184, 146, 39, 0.3)",
          "rgba(140, 140, 170, 0.3)",
          "rgba(184, 146, 39, 0.3)",
        )
      : "rgba(100, 100, 110, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(wireStartX, wireStartY);
  ctx.quadraticCurveTo(
    (wireStartX + wireEndX) * 0.5,
    Math.min(wireStartY, wireEndY) - 4 * zoom,
    wireEndX,
    wireEndY,
  );
  ctx.stroke();

  // Second wire (from radar to building)
  const wire2StartX = radarBaseX;
  const wire2StartY = radarBaseY + 8 * zoom;
  const wire2EndX = screenPos.x + 4 * zoom;
  const wire2EndY = screenPos.y - 16 * zoom;
  ctx.beginPath();
  ctx.moveTo(wire2StartX, wire2StartY);
  ctx.quadraticCurveTo(
    (wire2StartX + wire2EndX) * 0.5,
    Math.min(wire2StartY, wire2EndY) - 3 * zoom,
    wire2EndX,
    wire2EndY,
  );
  ctx.stroke();

  // ========== CENTAUR STABLES VINE OVERLAY (renders above everything) ==========
  if (tower.level === 4 && tower.upgrade === "A") {
    const vineGreen1 = "#2a5a1a";
    const vineGreen2 = "#3a6a2a";
    const leafGreen1 = "#4a8a3a";
    const leafGreen2 = "#3a7a2a";
    const leafGreen3 = "#5a9a4a";
    const leafDark = "#2a6020";

    const drawLeaf = (lx: number, ly: number, angle: number, size: number) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * zoom, size * 0.5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = leafDark;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(-size * zoom * 0.8, 0);
      ctx.lineTo(size * zoom * 0.8, 0);
      ctx.stroke();
      ctx.restore();
    };

    const drawVineTendril = (
      sx: number,
      sy: number,
      ex: number,
      ey: number,
      cx: number,
      cy: number,
      color: string,
      width: number,
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width * zoom;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cx, cy, ex, ey);
      ctx.stroke();
    };

    const bX = screenPos.x - 16 * zoom;
    const bY = screenPos.y - 8 * zoom;

    // --- Bottom platform tier vines (left face - thick sprawling vines) ---
    for (let v = 0; v < 6; v++) {
      const vx = screenPos.x - (baseW + 26) * zoom * 0.5 + v * 7 * zoom;
      const vy = screenPos.y + 24 * zoom + v * 1.2 * zoom;
      drawVineTendril(
        vx,
        vy,
        vx + (v % 2 === 0 ? -3 : 2) * zoom,
        vy - (8 + v) * zoom,
        vx + (v % 2 === 0 ? 3 : -2) * zoom,
        vy - 4 * zoom,
        vineGreen1,
        1.4,
      );
      ctx.fillStyle =
        v % 3 === 0 ? leafGreen1 : v % 3 === 1 ? leafGreen2 : leafGreen3;
      drawLeaf(
        vx + (v % 2 === 0 ? 2 : -1) * zoom,
        vy - 5 * zoom,
        v * 0.6 - 0.8,
        2.2,
      );
      drawLeaf(
        vx + (v % 2 === 0 ? -2 : 1.5) * zoom,
        vy - (7 + v * 0.5) * zoom,
        -v * 0.4 + 0.5,
        1.8,
      );
    }

    // --- Bottom platform tier vines (right face) ---
    for (let v = 0; v < 5; v++) {
      const vx = screenPos.x + (baseW + 26) * zoom * 0.05 + v * 8 * zoom;
      const vy = screenPos.y + 20 * zoom - v * 1.5 * zoom;
      drawVineTendril(
        vx,
        vy,
        vx + (v % 2 === 0 ? 2 : -2) * zoom,
        vy - (9 + v) * zoom,
        vx + (v % 2 === 0 ? -2 : 3) * zoom,
        vy - 5 * zoom,
        vineGreen2,
        1.3,
      );
      ctx.fillStyle = v % 2 === 0 ? leafGreen2 : leafGreen1;
      drawLeaf(
        vx + (v % 2 === 0 ? -1 : 2) * zoom,
        vy - 6 * zoom,
        v * 0.5 + 0.2,
        2.0,
      );
      drawLeaf(
        vx + (v % 2 === 0 ? 1.5 : -1.5) * zoom,
        vy - (8 + v * 0.4) * zoom,
        -v * 0.3 - 0.4,
        1.6,
      );
    }

    // --- Middle tier vine creepers (left edge draping down) ---
    for (let v = 0; v < 7; v++) {
      const vx = screenPos.x - (baseW + 16) * zoom * 0.4 + v * 6 * zoom;
      const vy = screenPos.y + 10 * zoom + v * 0.6 * zoom;
      const hangLen = (5 + v * 0.8) * zoom;
      drawVineTendril(
        vx,
        vy - hangLen,
        vx + (v % 2 === 0 ? 1 : -1.5) * zoom,
        vy,
        vx + (v % 2 === 0 ? -2 : 2) * zoom,
        vy - hangLen * 0.5,
        vineGreen1,
        1.1,
      );
      ctx.fillStyle = v % 3 === 0 ? leafGreen3 : leafGreen1;
      drawLeaf(
        vx + (v % 2 === 0 ? -1 : 1) * zoom,
        vy - hangLen * 0.6,
        v * 0.4,
        1.6,
      );
      if (v % 2 === 0) {
        ctx.fillStyle = leafGreen2;
        drawLeaf(vx, vy - hangLen * 0.3, -v * 0.3 + 1.2, 1.4);
      }
    }

    // --- Middle tier vine creepers (right edge) ---
    for (let v = 0; v < 6; v++) {
      const vx = screenPos.x + (baseW + 16) * zoom * 0.05 + v * 6 * zoom;
      const vy = screenPos.y + 8 * zoom - v * 0.5 * zoom;
      const hangLen = (4 + v * 0.6) * zoom;
      drawVineTendril(
        vx,
        vy - hangLen,
        vx + (v % 2 === 0 ? -1 : 2) * zoom,
        vy,
        vx + (v % 2 === 0 ? 2 : -1.5) * zoom,
        vy - hangLen * 0.5,
        vineGreen2,
        1.0,
      );
      ctx.fillStyle = v % 2 === 0 ? leafGreen1 : leafGreen3;
      drawLeaf(
        vx + (v % 2 === 0 ? 1 : -1) * zoom,
        vy - hangLen * 0.5,
        -v * 0.5 + 0.7,
        1.5,
      );
    }

    // --- Top platform edge vine border (dense isometric vine border) ---
    for (let v = 0; v < 10; v++) {
      const t = v / 9;
      const edgeX = screenPos.x - isoW * 0.85 + t * isoW * 1.7;
      const edgeY =
        t < 0.5
          ? screenPos.y - 6 * zoom + t * 2 * isoD * 0.8
          : screenPos.y - 6 * zoom + (1 - t) * 2 * isoD * 0.8;
      drawVineTendril(
        edgeX,
        edgeY + 2 * zoom,
        edgeX + (v % 2 === 0 ? 2 : -2) * zoom,
        edgeY - 5 * zoom,
        edgeX + (v % 2 === 0 ? -1.5 : 1.5) * zoom,
        edgeY - 2 * zoom,
        vineGreen1,
        1.2,
      );
      ctx.fillStyle = [leafGreen1, leafGreen2, leafGreen3][v % 3];
      drawLeaf(
        edgeX + (v % 2 === 0 ? 1 : -1) * zoom,
        edgeY - 4 * zoom,
        v * 0.35 - 1.5,
        1.8,
      );
      drawLeaf(
        edgeX + (v % 2 === 0 ? -1 : 0.5) * zoom,
        edgeY - 1 * zoom,
        -v * 0.25 + 0.8,
        1.5,
      );
    }

    // --- Corner post vines (thick climbing vines with many leaves) ---
    for (const postDir of [-1, 1]) {
      const postX = screenPos.x + postDir * (baseW + 8) * zoom * 0.5;
      const postBaseY = screenPos.y - 2 * zoom;
      const postTopY = screenPos.y - 14 * zoom;

      for (let seg = 0; seg < 3; seg++) {
        const sy = postBaseY - seg * 4 * zoom;
        const ey = sy - 4 * zoom;
        const cx = postX + postDir * (seg % 2 === 0 ? 2 : -2) * zoom;
        drawVineTendril(
          postX,
          sy,
          postX + postDir * (seg % 2 === 0 ? 1 : -1) * zoom,
          ey,
          cx,
          (sy + ey) * 0.5,
          vineGreen1,
          1.5,
        );
        ctx.fillStyle = seg % 2 === 0 ? leafGreen1 : leafGreen2;
        drawLeaf(cx, (sy + ey) * 0.5, postDir * (seg * 0.4 + 0.2), 1.8);
      }
      ctx.fillStyle = leafGreen3;
      drawLeaf(
        postX - postDir * 2 * zoom,
        postTopY + 2 * zoom,
        postDir * 1.2,
        2.5,
      );
      drawLeaf(postX + postDir * 1.5 * zoom, postTopY, -postDir * 0.8, 2.0);
    }

    // --- Building wall vines (climbing up stable walls, left and right) ---
    const wallBaseY = bY + 6 * zoom;
    const wallTopY = bY - 24 * zoom;

    // Left wall - thick vine trunk with branching tendrils
    for (let seg = 0; seg < 5; seg++) {
      const fy = wallBaseY - seg * 6 * zoom;
      const ty = fy - 6 * zoom;
      const wx = bX - 12 * zoom + seg * 1 * zoom;
      drawVineTendril(
        wx,
        fy,
        wx + (seg % 2 === 0 ? 2 : -1.5) * zoom,
        ty,
        wx + (seg % 2 === 0 ? -1 : 2) * zoom,
        (fy + ty) * 0.5,
        vineGreen1,
        1.6 - seg * 0.15,
      );
      ctx.fillStyle = [leafGreen1, leafGreen2, leafGreen3][seg % 3];
      drawLeaf(
        wx + (seg % 2 === 0 ? -3 : 3) * zoom,
        (fy + ty) * 0.5,
        seg * 0.4 - 0.6,
        2.0 - seg * 0.1,
      );
      if (seg % 2 === 0) {
        ctx.fillStyle = leafDark;
        drawLeaf(
          wx + (seg % 2 === 0 ? 2 : -2) * zoom,
          ty + 1 * zoom,
          -seg * 0.3 + 0.8,
          1.5,
        );
      }
    }

    // Right wall vine cluster
    for (let seg = 0; seg < 4; seg++) {
      const fy = wallBaseY - seg * 7 * zoom;
      const ty = fy - 7 * zoom;
      const wx = bX + 18 * zoom - seg * 0.5 * zoom;
      drawVineTendril(
        wx,
        fy,
        wx + (seg % 2 === 0 ? -2 : 1.5) * zoom,
        ty,
        wx + (seg % 2 === 0 ? 1.5 : -2) * zoom,
        (fy + ty) * 0.5,
        vineGreen2,
        1.4 - seg * 0.1,
      );
      ctx.fillStyle = [leafGreen2, leafGreen3, leafGreen1][seg % 3];
      drawLeaf(
        wx + (seg % 2 === 0 ? 2.5 : -2.5) * zoom,
        (fy + ty) * 0.5,
        -seg * 0.5 + 0.3,
        1.8,
      );
      ctx.fillStyle = leafGreen1;
      drawLeaf(
        wx + (seg % 2 === 0 ? -1.5 : 2) * zoom,
        ty + 2 * zoom,
        seg * 0.3,
        1.4,
      );
    }

    // --- Roof draping vines (hanging from roof edges) ---
    const roofLeftEdgeX = bX - 18 * zoom;
    const roofRightEdgeX = bX + 24 * zoom;
    const roofY = bY - 28 * zoom;

    for (let v = 0; v < 6; v++) {
      const rx = roofLeftEdgeX + v * 3 * zoom;
      const ry = roofY + v * 2 * zoom;
      const dropLen = (4 + v * 1.2) * zoom;
      drawVineTendril(
        rx,
        ry,
        rx + (v % 2 === 0 ? 1 : -1.5) * zoom,
        ry + dropLen,
        rx + (v % 2 === 0 ? -2 : 1) * zoom,
        ry + dropLen * 0.5,
        vineGreen2,
        1.0,
      );
      ctx.fillStyle = [leafGreen3, leafGreen1, leafGreen2][v % 3];
      drawLeaf(
        rx + (v % 2 === 0 ? -1.5 : 1) * zoom,
        ry + dropLen * 0.6,
        v * 0.4 + 0.5,
        1.6,
      );
    }

    for (let v = 0; v < 5; v++) {
      const rx = roofRightEdgeX - v * 3 * zoom;
      const ry = roofY + v * 2 * zoom;
      const dropLen = (3 + v * 1.0) * zoom;
      drawVineTendril(
        rx,
        ry,
        rx + (v % 2 === 0 ? -1 : 1.5) * zoom,
        ry + dropLen,
        rx + (v % 2 === 0 ? 2 : -1) * zoom,
        ry + dropLen * 0.5,
        vineGreen1,
        0.9,
      );
      ctx.fillStyle = v % 2 === 0 ? leafGreen2 : leafGreen3;
      drawLeaf(
        rx + (v % 2 === 0 ? 1 : -1) * zoom,
        ry + dropLen * 0.5,
        -v * 0.35,
        1.4,
      );
    }

    // --- Stable section vines (draping from the side stable roofs) ---
    const stableLeftX = bX - 26 * zoom;
    const stableRightX = bX + 30 * zoom;
    const stableRoofY = bY - 18 * zoom;

    for (let v = 0; v < 4; v++) {
      const sx = stableLeftX + v * 4 * zoom;
      const sy = stableRoofY + v * 1.5 * zoom;
      const drop = (5 + v) * zoom;
      drawVineTendril(
        sx,
        sy,
        sx + 1 * zoom,
        sy + drop,
        sx - 1.5 * zoom,
        sy + drop * 0.4,
        vineGreen1,
        1.1,
      );
      ctx.fillStyle = v % 2 === 0 ? leafGreen1 : leafGreen3;
      drawLeaf(sx - 1 * zoom, sy + drop * 0.5, v * 0.5, 1.7);
      drawLeaf(sx + 1.5 * zoom, sy + drop * 0.7, -v * 0.3 + 1.0, 1.3);
    }

    for (let v = 0; v < 4; v++) {
      const sx = stableRightX - v * 4 * zoom;
      const sy = stableRoofY + v * 1.5 * zoom;
      const drop = (4 + v) * zoom;
      drawVineTendril(
        sx,
        sy,
        sx - 1 * zoom,
        sy + drop,
        sx + 1.5 * zoom,
        sy + drop * 0.4,
        vineGreen2,
        1.0,
      );
      ctx.fillStyle = v % 2 === 0 ? leafGreen2 : leafGreen1;
      drawLeaf(sx + 1 * zoom, sy + drop * 0.4, -v * 0.4, 1.5);
      drawLeaf(sx - 1.5 * zoom, sy + drop * 0.65, v * 0.35 + 0.5, 1.3);
    }

    // --- Ground-level vine sprawl (around base of tower, organic spread) ---
    const groundY = screenPos.y + 6 * zoom;
    for (let v = 0; v < 8; v++) {
      const gx = screenPos.x - isoW * 0.8 + v * isoW * 0.23;
      const gy = groundY + (v % 2 === 0 ? 2 : -1) * zoom;
      const spreadX = (v % 2 === 0 ? 4 : -3) * zoom;
      const spreadY = (2 + v * 0.3) * zoom;
      drawVineTendril(
        gx,
        gy,
        gx + spreadX,
        gy - spreadY,
        gx + spreadX * 0.5,
        gy - spreadY * 0.3,
        vineGreen1,
        1.0,
      );
      ctx.fillStyle = [leafGreen1, leafGreen2, leafGreen3, leafDark][v % 4];
      drawLeaf(gx + spreadX * 0.6, gy - spreadY * 0.5, v * 0.3, 1.5);
      if (v % 3 === 0) {
        ctx.fillStyle = leafGreen3;
        drawLeaf(gx + spreadX * 0.3, gy - spreadY * 0.15, -v * 0.2 + 1.0, 1.2);
      }
    }

    // --- Fence/railing vine wraps ---
    for (let v = 0; v < 5; v++) {
      const fx = screenPos.x - isoW * 0.6 + v * isoW * 0.3;
      const fy = screenPos.y - 1 * zoom + v * 0.8 * zoom;
      drawVineTendril(
        fx,
        fy,
        fx + (v % 2 === 0 ? 3 : -2) * zoom,
        fy - 8 * zoom,
        fx + (v % 2 === 0 ? -1 : 2) * zoom,
        fy - 4 * zoom,
        vineGreen2,
        1.2,
      );
      ctx.fillStyle = v % 2 === 0 ? leafGreen1 : leafGreen2;
      drawLeaf(
        fx + (v % 2 === 0 ? -1.5 : 1.5) * zoom,
        fy - 5 * zoom,
        v * 0.4 - 0.8,
        1.8,
      );
      drawLeaf(
        fx + (v % 2 === 0 ? 2 : -1) * zoom,
        fy - 7 * zoom,
        -v * 0.3 + 0.5,
        1.4,
      );
    }
  }

  // ========== ROYAL CAVALRY BANNERS & FLAGS (front layer - renders above building) ==========
  if (tower.level === 4 && tower.upgrade === "B") {
    const bX = screenPos.x - 16 * zoom;
    const bY = screenPos.y - 8 * zoom;
    const ltX = bX - 18 * zoom;
    const ltY = bY + 4 * zoom;
    const rtX = bX + 18 * zoom;
    const rtY = bY + 4 * zoom;
    const ltTopY = ltY - 48 * zoom;
    const rtTopY = rtY - 54 * zoom;

    const purpleDark = "#5a2d80";
    const purpleMid = "#7b3fa0";
    const purpleLight = "#9b5fcf";
    const purpleDeep = "#3a1860";
    const goldAccent = "#c9a227";
    const goldDark = "#a08020";
    const ropeColor = "#706050";

    const drawRope = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      sag: number,
    ) => {
      ctx.strokeStyle = ropeColor;
      ctx.lineWidth = 1.0 * zoom;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(
        (x1 + x2) * 0.5,
        (y1 + y2) * 0.5 + sag * zoom,
        x2,
        y2,
      );
      ctx.stroke();
    };

    const drawIsoPennant = (
      x: number,
      y: number,
      h: number,
      w: number,
      color: string,
      ndx: number,
      ndy: number,
    ) => {
      const wave = Math.sin(time * 0.002 + x * 0.1 + y * 0.07) * 1.0 * zoom;
      const fh = h * zoom;
      const fw = w * zoom;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x - fw * 0.5 * ndx, y - fw * 0.5 * ndy);
      ctx.lineTo(x + fw * 0.5 * ndx, y + fw * 0.5 * ndy);
      ctx.lineTo(x + wave * 0.1, y + fh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = goldAccent;
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
    };

    const drawIsoBunting = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      sag: number,
      count: number,
      colors: string[],
      flagH: number,
      flagW: number,
    ) => {
      drawRope(x1, y1, x2, y2, sag);
      const edx = x2 - x1;
      const edy = y2 - y1;
      const len = Math.sqrt(edx * edx + edy * edy);
      const ndx = len > 0 ? edx / len : 1;
      const ndy = len > 0 ? edy / len : 0;
      for (let i = 0; i < count; i++) {
        const t = (i + 0.5) / count;
        const rx = x1 + t * edx;
        const ry = y1 + t * edy + sag * zoom * (4 * t * (1 - t));
        drawIsoPennant(
          rx,
          ry,
          flagH,
          flagW,
          colors[i % colors.length],
          ndx,
          ndy,
        );
      }
    };

    const drawWallBanner = (
      x: number,
      y: number,
      w: number,
      h: number,
      faceColor: string,
      _sideColor: string,
      hasEmblem: boolean,
      edgeDX: number,
      edgeDY: number,
    ) => {
      const wave = Math.sin(time * 0.0015 + x * 0.05) * 1.5 * zoom;
      const bw = w * zoom;
      const bh = h * zoom;
      const elen = Math.sqrt(edgeDX * edgeDX + edgeDY * edgeDY);
      const ndx = elen > 0 ? edgeDX / elen : 1;
      const ndy = elen > 0 ? edgeDY / elen : 0;

      ctx.fillStyle = faceColor;
      ctx.beginPath();
      ctx.moveTo(x - bw * 0.3 * ndx, y - bw * 0.3 * ndy);
      ctx.lineTo(x + bw * 0.7 * ndx, y + bw * 0.7 * ndy);
      ctx.lineTo(x + bw * 0.7 * ndx, y + bh + wave + bw * 0.7 * ndy);
      ctx.lineTo(
        x + bw * 0.2 * ndx,
        y + bh + wave + 2.5 * zoom + bw * 0.2 * ndy,
      );
      ctx.lineTo(x - bw * 0.3 * ndx, y + bh + wave - bw * 0.3 * ndy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = goldAccent;
      const rodHW = bw * 0.6;
      ctx.beginPath();
      ctx.moveTo(x - rodHW * ndx - 0.5 * zoom, y - rodHW * ndy - 1.2 * zoom);
      ctx.lineTo(x + rodHW * ndx + 0.5 * zoom, y + rodHW * ndy - 1.2 * zoom);
      ctx.lineTo(x + rodHW * ndx + 0.5 * zoom, y + rodHW * ndy + 0.8 * zoom);
      ctx.lineTo(x - rodHW * ndx - 0.5 * zoom, y - rodHW * ndy + 0.8 * zoom);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = goldAccent;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - bw * 0.3 * ndx, y - bw * 0.3 * ndy);
      ctx.lineTo(x - bw * 0.3 * ndx, y + bh + wave - bw * 0.3 * ndy);
      ctx.lineTo(
        x + bw * 0.2 * ndx,
        y + bh + wave + 2.5 * zoom + bw * 0.2 * ndy,
      );
      ctx.lineTo(x + bw * 0.7 * ndx, y + bh + wave + bw * 0.7 * ndy);
      ctx.lineTo(x + bw * 0.7 * ndx, y + bw * 0.7 * ndy);
      ctx.stroke();

      if (hasEmblem) {
        const ey = y + bh * 0.35;
        ctx.fillStyle = goldAccent;
        ctx.beginPath();
        ctx.moveTo(x - 1.8 * zoom, ey);
        ctx.lineTo(x - 1 * zoom, ey - 2.2 * zoom);
        ctx.lineTo(x, ey - 0.8 * zoom);
        ctx.lineTo(x + 1 * zoom, ey - 2.2 * zoom);
        ctx.lineTo(x + 1.8 * zoom, ey);
        ctx.closePath();
        ctx.fill();
      }
    };

    const drawPoleFlag = (
      x: number,
      y: number,
      poleH: number,
      fw: number,
      fh: number,
      color: string,
      dir: number,
    ) => {
      const wave = Math.sin(time * 0.002 + x * 0.08 + y * 0.06) * 1.5 * zoom;
      const ph = poleH * zoom;

      ctx.strokeStyle = goldDark;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - ph);
      ctx.stroke();

      const fW = fw * zoom;
      const fH = fh * zoom;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y - ph);
      ctx.lineTo(x + dir * fW * 0.7, y - ph + fH * 0.15 + wave * 0.3);
      ctx.lineTo(x + dir * fW * 0.1, y - ph + fH * 0.6 + wave * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = goldAccent;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      ctx.fillStyle = goldAccent;
      ctx.beginPath();
      ctx.arc(x, y - ph - 1.2 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    };

    // Platform diamond corner coordinates
    const platLX = screenPos.x - isoW - 4 * zoom;
    const platLY = screenPos.y - 6 * zoom;
    const platBotX = screenPos.x;
    const platBotY = screenPos.y + isoD - 2 * zoom;
    const platRX = screenPos.x + isoW + 4 * zoom;
    const platRY = screenPos.y - 6 * zoom;

    // Middle tier diamond corners (top face of prism at cy=screenPos.y+8, h=9)
    const midTopY = screenPos.y + 8 * zoom - 9 * zoom;
    const midLX = screenPos.x - (baseW + 16) * zoom * 0.5;
    const midLY = midTopY;
    const midBotX = screenPos.x;
    const midBotY = midTopY + (baseD + 30) * zoom * 0.25;
    const midRX = screenPos.x + (baseW + 16) * zoom * 0.5;
    const midRY = midTopY;

    // Bottom tier diamond corners (top face of prism at cy=screenPos.y+19, h=12)
    const btTopY = screenPos.y + 19 * zoom - 12 * zoom;
    const btLX = screenPos.x - (baseW + 26) * zoom * 0.5;
    const btLY = btTopY;
    const btBotX = screenPos.x;
    const btBotY = btTopY + (baseD + 42) * zoom * 0.25;
    const btRX = screenPos.x + (baseW + 26) * zoom * 0.5;
    const btRY = btTopY;

    // Edge direction vectors for each tier (left-front and right-front edges)
    const platLDx = platBotX - platLX;
    const platLDy = platBotY - platLY;
    const platRDx = platRX - platBotX;
    const platRDy = platRY - platBotY;
    const midLDx = midBotX - midLX;
    const midLDy = midBotY - midLY;
    const midRDx = midRX - midBotX;
    const midRDy = midRY - midBotY;
    const btLDx = btBotX - btLX;
    const btLDy = btBotY - btLY;
    const btRDx = btRX - btBotX;
    const btRDy = btRY - btBotY;

    // =============================================
    // 1. TOWER TOP FLAGS (pole-mounted on each tower peak)
    // =============================================
    drawPoleFlag(ltX - 2 * zoom, ltTopY + 3 * zoom, 10, 6, 8, purpleLight, -1);
    drawPoleFlag(rtX + 3 * zoom, rtTopY + 3 * zoom, 12, 6, 9, purpleMid, 1);

    // =============================================
    // 2. TOWER-TO-TOWER BUNTING (high string between tower tops)
    // =============================================
    drawIsoBunting(
      ltX,
      ltTopY + 6 * zoom,
      rtX,
      rtTopY + 6 * zoom,
      7,
      7,
      [purpleMid, purpleDark, purpleLight],
      5,
      3,
    );

    // =============================================
    // 5. WALL-MOUNTED BANNERS + FOUNDATION BANNERS (top tier)
    // =============================================
    drawWallBanner(
      ltX - 5 * zoom,
      ltY - 32 * zoom,
      5,
      11,
      purpleMid,
      purpleDark,
      true,
      platLDx,
      platLDy,
    );

    // =============================================
    // 6. TOP PLATFORM EDGE BUNTING (isometric diamond edges)
    // =============================================
    drawIsoBunting(
      platLX,
      platLY,
      platBotX,
      platBotY,
      4,
      5,
      [purpleDark, purpleMid, purpleLight],
      3.5,
      2,
    );
    drawIsoBunting(
      platBotX,
      platBotY,
      platRX,
      platRY,
      4,
      5,
      [purpleLight, purpleDark, purpleMid],
      3.5,
      2,
    );

    // =============================================
    // 7. MIDDLE TIER BUNTING + FOUNDATION BANNERS
    // =============================================
    drawIsoBunting(
      midLX,
      midLY,
      midBotX,
      midBotY,
      3,
      4,
      [purpleMid, purpleLight],
      3,
      2,
    );
    drawIsoBunting(
      midBotX,
      midBotY,
      midRX,
      midRY,
      3,
      4,
      [purpleDark, purpleMid],
      3,
      2,
    );
    // Mid tier left face banners
    drawWallBanner(
      midLX + (midBotX - midLX) * 0.3,
      midLY + (midBotY - midLY) * 0.3 - 3 * zoom,
      3,
      5,
      purpleLight,
      purpleMid,
      false,
      midLDx,
      midLDy,
    );
    drawWallBanner(
      midLX + (midBotX - midLX) * 0.7,
      midLY + (midBotY - midLY) * 0.7 - 3 * zoom,
      3,
      5,
      purpleMid,
      purpleDark,
      false,
      midLDx,
      midLDy,
    );
    // Mid tier right face banners
    drawWallBanner(
      midBotX + (midRX - midBotX) * 0.3,
      midBotY + (midRY - midBotY) * 0.3 - 3 * zoom,
      3,
      5,
      purpleDark,
      purpleDeep,
      false,
      midRDx,
      midRDy,
    );
    drawWallBanner(
      midBotX + (midRX - midBotX) * 0.7,
      midBotY + (midRY - midBotY) * 0.7 - 3 * zoom,
      3,
      5,
      purpleLight,
      purpleMid,
      false,
      midRDx,
      midRDy,
    );

    // =============================================
    // 8. BOTTOM TIER BUNTING + FOUNDATION BANNERS
    // =============================================
    drawIsoBunting(
      btLX,
      btLY,
      btBotX,
      btBotY,
      3,
      4,
      [purpleLight, purpleDark],
      3,
      2,
    );
    drawIsoBunting(
      btBotX,
      btBotY,
      btRX,
      btRY,
      3,
      4,
      [purpleMid, purpleLight],
      3,
      2,
    );
    // Bottom tier left face banners
    drawWallBanner(
      btLX + (btBotX - btLX) * 0.3,
      btLY + (btBotY - btLY) * 0.3 - 3 * zoom,
      3,
      5,
      purpleMid,
      purpleDark,
      false,
      btLDx,
      btLDy,
    );
    drawWallBanner(
      btLX + (btBotX - btLX) * 0.7,
      btLY + (btBotY - btLY) * 0.7 - 3 * zoom,
      3,
      5,
      purpleLight,
      purpleMid,
      false,
      btLDx,
      btLDy,
    );
    // Bottom tier right face banners
    drawWallBanner(
      btBotX + (btRX - btBotX) * 0.3,
      btBotY + (btRY - btBotY) * 0.3 - 3 * zoom,
      3,
      5,
      purpleDark,
      purpleDeep,
      false,
      btRDx,
      btRDy,
    );
    drawWallBanner(
      btBotX + (btRX - btBotX) * 0.7,
      btBotY + (btRY - btBotY) * 0.7 - 3 * zoom,
      3,
      5,
      purpleMid,
      purpleDark,
      false,
      btRDx,
      btRDy,
    );

    // =============================================
    // 9. STABLE ROOF BANNERS
    // =============================================
    drawWallBanner(
      bX - 24 * zoom,
      bY - 12 * zoom,
      4,
      6,
      purpleLight,
      purpleMid,
      false,
      platLDx,
      platLDy,
    );

    // =============================================
    // 10. CORNER POST FLAGS
    // =============================================
    const postLfX = screenPos.x - (baseW + 8) * zoom * 0.5;
    const postRtX = screenPos.x + (baseW + 8) * zoom * 0.5;
    const postBaseY = screenPos.y - 2 * zoom;
    drawPoleFlag(postLfX, postBaseY, 8, 4, 5, purpleMid, -1);
    drawPoleFlag(postRtX, postBaseY, 8, 4, 5, purpleLight, 1);
  }

  ctx.restore();
}
