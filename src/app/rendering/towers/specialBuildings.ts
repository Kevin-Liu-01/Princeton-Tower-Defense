import { ISO_TAN, ISO_Y_RATIO } from "../../constants";
import type { MapTheme } from "../../constants/maps";
import { drawIsoFlushSlit, drawIsoFlushDoor } from "../isoFlush";
import { getBarracksBuildingPalette } from "./barracksTheme";

// === SHARED MECHANICAL DRAWING HELPERS for special buildings ===

function drawSpecialGear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  teeth: number,
  rotation: number,
  s: number,
  bodyColor: string,
  rimColor: string,
  hubColor: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.rotate(rotation);
  const tw = (Math.PI / teeth) * 0.55;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    ctx.fillStyle = rimColor;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - tw) * radius * 0.8, Math.sin(a - tw) * radius * 0.8);
    ctx.lineTo(Math.cos(a - tw * 0.35) * radius, Math.sin(a - tw * 0.35) * radius);
    ctx.lineTo(Math.cos(a + tw * 0.35) * radius, Math.sin(a + tw * 0.35) * radius);
    ctx.lineTo(Math.cos(a + tw) * radius * 0.8, Math.sin(a + tw) * radius * 0.8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.8 * s;
  ctx.stroke();
  ctx.fillStyle = "rgba(25, 22, 20, 0.85)";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hubColor;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rimColor;
  ctx.lineWidth = 1.3 * s;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * radius * 0.24, Math.sin(a) * radius * 0.24);
    ctx.lineTo(Math.cos(a) * radius * 0.74, Math.sin(a) * radius * 0.74);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHydraulicPiston(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  length: number,
  extension: number,
  s: number,
  cylinderColor: string,
  rodColor: string,
  glowRgb: string,
): void {
  const cylW = 4.5 * s;
  const rodW = 2.2 * s;
  const cylLen = length * 0.48;
  const rodLen = length * (0.12 + extension * 0.4);
  ctx.fillStyle = cylinderColor;
  ctx.fillRect(x - cylW / 2, baseY - cylLen, cylW, cylLen);
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.7 * s;
  ctx.strokeRect(x - cylW / 2, baseY - cylLen, cylW, cylLen);
  ctx.strokeStyle = "rgba(100, 95, 88, 0.5)";
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(x - cylW / 2, baseY - cylLen * 0.3);
  ctx.lineTo(x + cylW / 2, baseY - cylLen * 0.3);
  ctx.moveTo(x - cylW / 2, baseY - cylLen * 0.7);
  ctx.lineTo(x + cylW / 2, baseY - cylLen * 0.7);
  ctx.stroke();
  const rodGrad = ctx.createLinearGradient(x - rodW / 2, 0, x + rodW / 2, 0);
  rodGrad.addColorStop(0, rodColor);
  rodGrad.addColorStop(0.35, "rgba(175, 170, 160, 0.9)");
  rodGrad.addColorStop(0.65, "rgba(180, 175, 165, 0.9)");
  rodGrad.addColorStop(1, rodColor);
  ctx.fillStyle = rodGrad;
  ctx.fillRect(x - rodW / 2, baseY - cylLen - rodLen, rodW, rodLen);
  ctx.fillStyle = "rgba(95, 90, 82, 0.9)";
  ctx.beginPath();
  ctx.ellipse(x, baseY - cylLen - rodLen, rodW * 0.9, rodW * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(70, 65, 58, 0.85)";
  ctx.beginPath();
  ctx.ellipse(x, baseY, cylW * 0.6, cylW * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(${glowRgb}, ${0.06 + extension * 0.2})`;
  ctx.beginPath();
  ctx.arc(x, baseY - cylLen, 3.5 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawExpandingShieldPlate(
  ctx: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
  dir: number,
  expansion: number,
  plateH: number,
  s: number,
  darkFace: string,
  lightFace: string,
  topFace: string,
  glowRgb: string,
): void {
  const plateW = (5 + expansion * 16) * s;
  const thickness = 3.2 * s;
  const deployX = anchorX + dir * expansion * 8 * s;
  const tanA = ISO_TAN;
  ctx.fillStyle = dir < 0 ? darkFace : lightFace;
  ctx.beginPath();
  ctx.moveTo(deployX, anchorY);
  ctx.lineTo(deployX + dir * plateW, anchorY - plateW * tanA * 0.25);
  ctx.lineTo(deployX + dir * plateW, anchorY - plateW * tanA * 0.25 - plateH);
  ctx.lineTo(deployX, anchorY - plateH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.7 * s;
  ctx.stroke();
  ctx.fillStyle = topFace;
  ctx.beginPath();
  ctx.moveTo(deployX, anchorY - plateH);
  ctx.lineTo(deployX + dir * plateW, anchorY - plateW * tanA * 0.25 - plateH);
  ctx.lineTo(
    deployX + dir * plateW + dir * thickness,
    anchorY - plateW * tanA * 0.25 - plateH - thickness * tanA,
  );
  ctx.lineTo(deployX + dir * thickness, anchorY - plateH - thickness * tanA);
  ctx.closePath();
  ctx.fill();
  if (expansion > 0.12) {
    ctx.strokeStyle = `rgba(${glowRgb}, ${expansion * 0.45})`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(deployX + dir * plateW, anchorY - plateW * tanA * 0.25);
    ctx.lineTo(deployX + dir * plateW, anchorY - plateW * tanA * 0.25 - plateH);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(130, 120, 108, 0.6)";
  for (let i = 0; i < 3; i++) {
    const t = 0.2 + i * 0.3;
    ctx.beginPath();
    ctx.arc(
      deployX + dir * plateW * t,
      anchorY - plateH * 0.5 - plateW * tanA * 0.125 * t,
      1.3 * s,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = "rgba(80, 75, 68, 0.8)";
  ctx.beginPath();
  ctx.arc(anchorX, anchorY - plateH * 0.5, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
}

// Special Building Types rendering
function drawChronoRelayBuilding(
  ctx: CanvasRenderingContext2D,
  s: number,
  time: number,
  boostedTowerCount: number,
): void {
  const stage =
    boostedTowerCount === 0
      ? 0
      : boostedTowerCount <= 2
        ? 1
        : boostedTowerCount <= 4
          ? 2
          : 3;
  const pulse = Math.sin(time * 2.7) * 0.5 + 0.5;
  const fastPulse = Math.sin(time * 6.1 + 0.8) * 0.5 + 0.5;
  const power = 0.28 + stage * 0.24;
  const s2 = s * 1.13;
  const tanA = ISO_TAN;
  const hue = 208 + stage * 18 + Math.sin(time * 0.8) * 16;
  const glowRgb = [
    "126, 145, 186",
    "156, 167, 255",
    "180, 196, 255",
    "222, 230, 255",
  ][stage];
  const runes = ["ᚠ", "ᚢ", "ᚦ", "ᚱ", "ᚺ", "ᛃ", "ᛗ", "ᛟ"];

  const baseW = 33 * s2;
  const baseH = 9 * s2;
  const upperW = 23 * s2;
  const upperH = 8 * s2;
  const crystalH = 68 * s2;
  const crystalW = 14 * s2;
  const crystalTopY = -baseH - upperH - crystalH;

  // Center the iso diamond on the tile (bottom vertex was at origin)
  ctx.translate(0, baseW * tanA);

  ctx.fillStyle = "rgba(0,0,0,0.38)";
  ctx.beginPath();
  ctx.ellipse(0, -baseW * tanA + 4 * s2, 48 * s2, 24 * s2, 0, 0, Math.PI * 2);
  ctx.fill();

  const groundGlow = ctx.createRadialGradient(
    0,
    -baseW * tanA,
    0,
    0,
    -baseW * tanA,
    66 * s2,
  );
  groundGlow.addColorStop(
    0,
    `rgba(${glowRgb}, ${0.17 + pulse * 0.18 + power * 0.12})`,
  );
  groundGlow.addColorStop(0.5, `rgba(${glowRgb}, ${0.06 + pulse * 0.08})`);
  groundGlow.addColorStop(1, "transparent");
  ctx.fillStyle = groundGlow;
  ctx.beginPath();
  ctx.ellipse(0, -baseW * tanA, 62 * s2, 30 * s2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lower plinth (3D isometric)
  ctx.fillStyle = "#2f3848";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-baseW, -baseW * tanA);
  ctx.lineTo(-baseW, -baseW * tanA - baseH);
  ctx.lineTo(0, -baseH);
  ctx.fill();
  ctx.fillStyle = "#4e5f77";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(baseW, -baseW * tanA);
  ctx.lineTo(baseW, -baseW * tanA - baseH);
  ctx.lineTo(0, -baseH);
  ctx.fill();
  ctx.fillStyle = "#667a95";
  ctx.beginPath();
  ctx.moveTo(0, -baseH);
  ctx.lineTo(-baseW, -baseW * tanA - baseH);
  ctx.lineTo(0, -baseW * tanA * 2 - baseH);
  ctx.lineTo(baseW, -baseW * tanA - baseH);
  ctx.closePath();
  ctx.fill();

  // Upper crystal seat
  const upperY = -baseH;
  ctx.fillStyle = "#232d3d";
  ctx.beginPath();
  ctx.moveTo(0, upperY);
  ctx.lineTo(-upperW, upperY - upperW * tanA);
  ctx.lineTo(-upperW, upperY - upperW * tanA - upperH);
  ctx.lineTo(0, upperY - upperH);
  ctx.fill();
  ctx.fillStyle = "#42526a";
  ctx.beginPath();
  ctx.moveTo(0, upperY);
  ctx.lineTo(upperW, upperY - upperW * tanA);
  ctx.lineTo(upperW, upperY - upperW * tanA - upperH);
  ctx.lineTo(0, upperY - upperH);
  ctx.fill();
  ctx.fillStyle = "#5e7492";
  ctx.beginPath();
  ctx.moveTo(0, upperY - upperH);
  ctx.lineTo(-upperW, upperY - upperW * tanA - upperH);
  ctx.lineTo(0, upperY - upperW * tanA * 2 - upperH);
  ctx.lineTo(upperW, upperY - upperW * tanA - upperH);
  ctx.closePath();
  ctx.fill();

  // Circular railing + spinning clock ring
  const railY = -baseW * tanA + 1.8 * s2;
  const railR = 40 * s2;
  const railInner = 33 * s2;
  const drawChronoRail = (frontHalf: boolean): void => {
    const arcStart = frontHalf ? 0 : Math.PI;
    const arcEnd = frontHalf ? Math.PI : Math.PI * 2;
    ctx.save();
    ctx.translate(0, railY);
    ctx.scale(1, ISO_Y_RATIO);
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.36 + pulse * 0.2})`;
    ctx.lineWidth = 2.6 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, railR, arcStart, arcEnd);
    ctx.stroke();
    ctx.strokeStyle = "rgba(135, 154, 188, 0.7)";
    ctx.lineWidth = 2.1 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, railInner, arcStart, arcEnd);
    ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const px = Math.cos(a) * railR;
      const py = Math.sin(a) * railR;
      const isFront = py >= 0;
      if (isFront !== frontHalf) continue;
      ctx.strokeStyle = "rgba(165, 180, 212, 0.78)";
      ctx.lineWidth = 1.5 * s2;
      ctx.beginPath();
      ctx.moveTo(px, py - 8 * s2);
      ctx.lineTo(px, py + 4 * s2);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Back half goes first so the crystal can occlude it naturally.
  drawChronoRail(false);

  // Clock face
  ctx.save();
  ctx.translate(0, railY);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.save();
  ctx.rotate(time * (0.36 + stage * 0.09));
  ctx.strokeStyle = `rgba(${glowRgb}, ${0.45 + fastPulse * 0.25})`;
  ctx.lineWidth = 2 * s2;
  ctx.setLineDash([8 * s2, 6 * s2]);
  ctx.beginPath();
  ctx.arc(0, 0, 26 * s2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < 12; i++) {
    const tickA = (i / 12) * Math.PI * 2;
    const tx1 = Math.cos(tickA) * 20 * s2;
    const ty1 = Math.sin(tickA) * 20 * s2;
    const tx2 = Math.cos(tickA) * 25 * s2;
    const ty2 = Math.sin(tickA) * 25 * s2;
    ctx.strokeStyle = "rgba(224, 232, 255, 0.85)";
    ctx.lineWidth = (i % 3 === 0 ? 2.1 : 1.3) * s2;
    ctx.beginPath();
    ctx.moveTo(tx1, ty1);
    ctx.lineTo(tx2, ty2);
    ctx.stroke();
  }
  const minuteA = time * (1.45 + stage * 0.28);
  const hourA = time * (0.32 + stage * 0.08);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.9 * s2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(minuteA) * 19 * s2, Math.sin(minuteA) * 19 * s2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(${glowRgb}, 0.92)`;
  ctx.lineWidth = 2.4 * s2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(hourA) * 13 * s2, Math.sin(hourA) * 13 * s2);
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // Giant 3D isometric faceted crystal — uses game's iso convention:
  // front=(0,y), left=(-w,y-w*tanA), back=(0,y-2w*tanA), right=(w,y-w*tanA)
  const crystalBaseY = upperY - upperH;

  // Cross-section widths at 3 levels + apex
  const midCY = crystalBaseY - crystalH * 0.33;
  const tapCY = crystalBaseY - crystalH * 0.82;
  const midCW = crystalW * 1.12;
  const tapCW = crystalW * 0.3;

  // Isometric diamond vertices at each level (same convention as base body)
  const bF = { x: 0, y: crystalBaseY };
  const bL = { x: -crystalW, y: crystalBaseY - crystalW * tanA };
  const bB = { x: 0, y: crystalBaseY - 2 * crystalW * tanA };
  const bR = { x: crystalW, y: crystalBaseY - crystalW * tanA };

  const mF = { x: 0, y: midCY };
  const mL = { x: -midCW, y: midCY - midCW * tanA };
  const mB = { x: 0, y: midCY - 2 * midCW * tanA };
  const mR = { x: midCW, y: midCY - midCW * tanA };

  const tF = { x: 0, y: tapCY };
  const tL = { x: -tapCW, y: tapCY - tapCW * tanA };
  const tB = { x: 0, y: tapCY - 2 * tapCW * tanA };
  const tR = { x: tapCW, y: tapCY - tapCW * tanA };

  const apx = { x: 0, y: crystalTopY };

  // Hue offsets — left face darker (less light), right face brighter
  const leftH = hue - 18;
  const rightH = hue + 14;

  let cg: CanvasGradient;

  // === LEFT FACE (front→left edge, darker) ===
  // Lower section (base → mid-bulge)
  cg = ctx.createLinearGradient(bL.x, bL.y, mL.x, mL.y);
  cg.addColorStop(0, `hsl(${leftH}, 46%, 36%)`);
  cg.addColorStop(1, `hsl(${leftH + 6}, 56%, 44%)`);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(bF.x, bF.y);
  ctx.lineTo(bL.x, bL.y);
  ctx.lineTo(mL.x, mL.y);
  ctx.lineTo(mF.x, mF.y);
  ctx.closePath();
  ctx.fill();
  // Upper section (mid → taper)
  cg = ctx.createLinearGradient(mL.x, mL.y, tL.x, tL.y);
  cg.addColorStop(0, `hsl(${leftH + 6}, 56%, 44%)`);
  cg.addColorStop(1, `hsl(${leftH + 12}, 66%, 54%)`);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(mF.x, mF.y);
  ctx.lineTo(mL.x, mL.y);
  ctx.lineTo(tL.x, tL.y);
  ctx.lineTo(tF.x, tF.y);
  ctx.closePath();
  ctx.fill();
  // Apex section (taper → apex)
  cg = ctx.createLinearGradient(tL.x, tL.y, apx.x, apx.y);
  cg.addColorStop(0, `hsl(${leftH + 12}, 66%, 54%)`);
  cg.addColorStop(1, `hsl(${leftH + 20}, 78%, 66%)`);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(tF.x, tF.y);
  ctx.lineTo(tL.x, tL.y);
  ctx.lineTo(apx.x, apx.y);
  ctx.closePath();
  ctx.fill();

  // === RIGHT FACE (right→front edge, brighter) ===
  // Lower section
  cg = ctx.createLinearGradient(bR.x, bR.y, mR.x, mR.y);
  cg.addColorStop(0, `hsl(${rightH}, 52%, 48%)`);
  cg.addColorStop(1, `hsl(${rightH + 8}, 64%, 56%)`);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(bF.x, bF.y);
  ctx.lineTo(bR.x, bR.y);
  ctx.lineTo(mR.x, mR.y);
  ctx.lineTo(mF.x, mF.y);
  ctx.closePath();
  ctx.fill();
  // Upper section
  cg = ctx.createLinearGradient(mR.x, mR.y, tR.x, tR.y);
  cg.addColorStop(0, `hsl(${rightH + 8}, 64%, 56%)`);
  cg.addColorStop(1, `hsl(${rightH + 16}, 76%, 66%)`);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(mF.x, mF.y);
  ctx.lineTo(mR.x, mR.y);
  ctx.lineTo(tR.x, tR.y);
  ctx.lineTo(tF.x, tF.y);
  ctx.closePath();
  ctx.fill();
  // Apex section
  cg = ctx.createLinearGradient(tR.x, tR.y, apx.x, apx.y);
  cg.addColorStop(0, `hsl(${rightH + 16}, 76%, 66%)`);
  cg.addColorStop(1, `hsl(${rightH + 26}, 92%, 80%)`);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(tF.x, tF.y);
  ctx.lineTo(tR.x, tR.y);
  ctx.lineTo(apx.x, apx.y);
  ctx.closePath();
  ctx.fill();

  // === MID-LEVEL TOP DIAMOND (widest belt ring) ===
  cg = ctx.createLinearGradient(mL.x, mL.y, mR.x, mR.y);
  cg.addColorStop(0, `hsl(${hue + 4}, 68%, 52%)`);
  cg.addColorStop(0.5, `hsl(${hue + 16}, 82%, 66%)`);
  cg.addColorStop(1, `hsl(${hue + 28}, 90%, 76%)`);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(mF.x, mF.y);
  ctx.lineTo(mL.x, mL.y);
  ctx.lineTo(mB.x, mB.y);
  ctx.lineTo(mR.x, mR.y);
  ctx.closePath();
  ctx.fill();

  // === TAPER-LEVEL TOP DIAMOND ===
  ctx.fillStyle = `hsl(${hue + 20}, 86%, 72%)`;
  ctx.beginPath();
  ctx.moveTo(tF.x, tF.y);
  ctx.lineTo(tL.x, tL.y);
  ctx.lineTo(tB.x, tB.y);
  ctx.lineTo(tR.x, tR.y);
  ctx.closePath();
  ctx.fill();

  // === APEX CAP (tiny bright diamond) ===
  const apxCW = 2.5 * s2;
  ctx.fillStyle = `hsl(${hue + 32}, 96%, 88%)`;
  ctx.beginPath();
  ctx.moveTo(0, crystalTopY);
  ctx.lineTo(-apxCW, crystalTopY - apxCW * tanA);
  ctx.lineTo(0, crystalTopY - 2 * apxCW * tanA);
  ctx.lineTo(apxCW, crystalTopY - apxCW * tanA);
  ctx.closePath();
  ctx.fill();

  // === EDGE OUTLINES ===
  ctx.strokeStyle = `rgba(${glowRgb}, ${0.35 + pulse * 0.2})`;
  ctx.lineWidth = 1.3 * s2;
  // Front ridge (all front vertices from base to apex)
  ctx.beginPath();
  ctx.moveTo(bF.x, bF.y);
  ctx.lineTo(mF.x, mF.y);
  ctx.lineTo(tF.x, tF.y);
  ctx.lineTo(apx.x, apx.y);
  ctx.stroke();
  // Left ridge
  ctx.beginPath();
  ctx.moveTo(bL.x, bL.y);
  ctx.lineTo(mL.x, mL.y);
  ctx.lineTo(tL.x, tL.y);
  ctx.lineTo(apx.x, apx.y);
  ctx.stroke();
  // Right ridge
  ctx.beginPath();
  ctx.moveTo(bR.x, bR.y);
  ctx.lineTo(mR.x, mR.y);
  ctx.lineTo(tR.x, tR.y);
  ctx.lineTo(apx.x, apx.y);
  ctx.stroke();
  // Horizontal diamond rings
  ctx.strokeStyle = `rgba(${glowRgb}, ${0.25 + pulse * 0.15})`;
  ctx.lineWidth = 1 * s2;
  // Base ring
  ctx.beginPath();
  ctx.moveTo(bF.x, bF.y);
  ctx.lineTo(bL.x, bL.y);
  ctx.lineTo(bB.x, bB.y);
  ctx.lineTo(bR.x, bR.y);
  ctx.closePath();
  ctx.stroke();
  // Mid ring
  ctx.beginPath();
  ctx.moveTo(mF.x, mF.y);
  ctx.lineTo(mL.x, mL.y);
  ctx.lineTo(mB.x, mB.y);
  ctx.lineTo(mR.x, mR.y);
  ctx.closePath();
  ctx.stroke();
  // Taper ring
  ctx.beginPath();
  ctx.moveTo(tF.x, tF.y);
  ctx.lineTo(tL.x, tL.y);
  ctx.lineTo(tB.x, tB.y);
  ctx.lineTo(tR.x, tR.y);
  ctx.closePath();
  ctx.stroke();

  // === SPECULAR HIGHLIGHTS ===
  const specPhase = Math.sin(time * 1.8) * 0.5 + 0.5;
  const specSY = mR.y + (tR.y - mR.y) * specPhase;
  const specSX = mR.x * 0.35 * (1 - specPhase * 0.55);
  const specGrad = ctx.createRadialGradient(specSX, specSY, 0, specSX, specSY, 10 * s2);
  specGrad.addColorStop(0, `rgba(255, 255, 255, ${0.28 + pulse * 0.14})`);
  specGrad.addColorStop(0.4, `rgba(${glowRgb}, ${0.12 + pulse * 0.08})`);
  specGrad.addColorStop(1, "transparent");
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specSX, specSY, 10 * s2, 0, Math.PI * 2);
  ctx.fill();
  // Secondary on left face
  const spec2Phase = Math.sin(time * 1.3 + 1.6) * 0.5 + 0.5;
  const spec2SY = mL.y + (tL.y - mL.y) * spec2Phase;
  const spec2SX = mL.x * 0.3 * (1 - spec2Phase * 0.5);
  const spec2Grad = ctx.createRadialGradient(spec2SX, spec2SY, 0, spec2SX, spec2SY, 7 * s2);
  spec2Grad.addColorStop(0, `rgba(255, 255, 255, ${0.18 + pulse * 0.1})`);
  spec2Grad.addColorStop(0.5, `rgba(${glowRgb}, ${0.08 + pulse * 0.06})`);
  spec2Grad.addColorStop(1, "transparent");
  ctx.fillStyle = spec2Grad;
  ctx.beginPath();
  ctx.arc(spec2SX, spec2SY, 7 * s2, 0, Math.PI * 2);
  ctx.fill();

  // === INNER CORE GLOW ===
  const coreGlow = ctx.createRadialGradient(
    0, crystalTopY + 24 * s2, 0,
    0, crystalTopY + 24 * s2, 30 * s2,
  );
  coreGlow.addColorStop(
    0,
    `rgba(${glowRgb}, ${0.46 + pulse * 0.22 + power * 0.15})`,
  );
  coreGlow.addColorStop(0.55, `rgba(${glowRgb}, ${0.16 + pulse * 0.1})`);
  coreGlow.addColorStop(1, "transparent");
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(0, crystalTopY + 24 * s2, 30 * s2, 0, Math.PI * 2);
  ctx.fill();

  // Inner light veins
  ctx.strokeStyle = `rgba(240, 245, 255, ${0.4 + fastPulse * 0.25})`;
  ctx.lineWidth = 1.2 * s2;
  ctx.beginPath();
  ctx.moveTo(bF.x, bF.y);
  ctx.lineTo(mF.x, mF.y);
  ctx.lineTo(tF.x, tF.y);
  ctx.lineTo(apx.x, apx.y);
  ctx.stroke();
  // Cross veins at mid and taper
  ctx.strokeStyle = `rgba(220, 230, 255, ${0.22 + fastPulse * 0.18})`;
  ctx.lineWidth = 0.9 * s2;
  ctx.beginPath();
  ctx.moveTo(mL.x * 0.55, mL.y + (mF.y - mL.y) * 0.4);
  ctx.lineTo(mR.x * 0.55, mR.y + (mF.y - mR.y) * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tL.x * 0.6, tL.y + (tF.y - tL.y) * 0.35);
  ctx.lineTo(tR.x * 0.6, tR.y + (tF.y - tR.y) * 0.35);
  ctx.stroke();

  // Front half on top sells the 3D railing depth.
  drawChronoRail(true);

  // Rune belt around base
  ctx.font = `bold ${7.4 * s2}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + time * 0.18;
    const rx = Math.cos(a) * 30 * s2;
    const ry = Math.sin(a) * 15 * s2 + railY;
    const flicker = 0.28 + Math.sin(time * 2.2 + i * 0.9) * 0.2 + power * 0.22;
    ctx.fillStyle = `rgba(${glowRgb}, ${Math.max(0.1, flicker)})`;
    ctx.fillText(runes[i % runes.length], rx, ry);
  }

  // Floating chrono fragments
  const fragmentCount = 7 + stage * 2;
  for (let i = 0; i < fragmentCount; i++) {
    const a = (i / fragmentCount) * Math.PI * 2 + time * (0.65 + stage * 0.22);
    const rX = Math.cos(a) * (26 + stage * 3) * s2;
    const rY = Math.sin(a) * (11 + stage * 1.4) * s2;
    const y = crystalTopY + 30 * s2 + rY;
    const h = (4 + (i % 3)) * s2;
    ctx.fillStyle = `rgba(${glowRgb}, ${0.42 + pulse * 0.35})`;
    ctx.beginPath();
    ctx.moveTo(rX, y - h);
    ctx.lineTo(rX - 2.4 * s2, y);
    ctx.lineTo(rX, y + h);
    ctx.lineTo(rX + 2.4 * s2, y);
    ctx.closePath();
    ctx.fill();
  }

  // Power-up arcs
  if (stage >= 1) {
    const arcCount = stage + 1;
    for (let i = 0; i < arcCount; i++) {
      const a = (i / arcCount) * Math.PI * 2 + time * (1 + stage * 0.2);
      const sx = Math.cos(a) * 11 * s2;
      const sy = crystalTopY + 22 * s2 + Math.sin(a * 1.4) * 5 * s2;
      const ex = Math.cos(a + 0.4) * (34 + stage * 4) * s2;
      const ey = crystalTopY + 47 * s2 + Math.sin(a + 0.4) * 14 * s2;
      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(0, `rgba(${glowRgb}, ${0.62 + pulse * 0.2})`);
      grad.addColorStop(1, "transparent");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2 * s2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(
        (sx + ex) * 0.5 + Math.sin(time * 7 + i) * 4 * s2,
        (sy + ey) * 0.5,
      );
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }
}

function drawSentinelNexusBuilding(
  ctx: CanvasRenderingContext2D,
  s: number,
  time: number,
  chargeProgress: number,
): void {
  const charge = Math.max(0, Math.min(1, chargeProgress));
  const pulse = Math.sin(time * 3.4) * 0.5 + 0.5;
  const surge = Math.sin(time * 8.2 + 0.8) * 0.5 + 0.5;
  const s2 = s * 1.12;
  const tanA = ISO_TAN;
  const hotRgb = "255, 110, 96";
  // Smooth gray → red color ramp across 0-1 charge
  const lerpR = Math.round(120 + 135 * charge);
  const lerpG = Math.round(120 - 10 * charge);
  const lerpB = Math.round(130 - 34 * charge);
  const glowRgb = `${lerpR}, ${lerpG}, ${lerpB}`;
  const grayRgb = "120, 120, 130";
  const chargeGlow = 0.45 + charge * 0.55;
  const runes = ["ᚠ", "ᚲ", "ᚾ", "ᛗ", "ᛋ", "ᛉ", "ᛞ", "ᛟ"];
  const readyFlash =
    charge >= 0.98 ? (Math.sin(time * 12) * 0.5 + 0.5) * 0.4 : 0;

  const baseW = 35 * s2;
  const baseH = 9 * s2;
  const upperW = 24 * s2;
  const upperH = 8 * s2;
  const towerH = 40 * s2;

  // Center the iso diamond on the tile (bottom vertex was at origin)
  ctx.translate(0, baseW * tanA);

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, -baseW * tanA + 4 * s2, 50 * s2, 24 * s2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Charge-up ground rune circle: runes light up sequentially as charge fills
  const runeCount = 16;
  const litRuneCount = Math.floor(charge * runeCount);
  ctx.save();
  ctx.translate(0, -baseW * tanA + 2.5 * s2);
  ctx.scale(1, ISO_Y_RATIO);

  // Outer reticle ring - always visible, gray→red with charge
  ctx.strokeStyle = `rgba(${glowRgb}, ${0.3 + charge * 0.35 + readyFlash})`;
  ctx.lineWidth = 2.3 * s2;
  ctx.setLineDash([10 * s2, 7 * s2]);
  ctx.beginPath();
  ctx.arc(0, 0, 44 * s2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Charge fill arc - sweeps around as charge increases
  if (charge > 0.02) {
    ctx.strokeStyle = `rgba(${hotRgb}, ${0.5 + charge * 0.4 + readyFlash})`;
    ctx.lineWidth = 3.5 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, 38 * s2, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2);
    ctx.stroke();
  }

  // Inner ring - always visible, gray→tinted
  ctx.strokeStyle = `rgba(${glowRgb}, ${0.35 + charge * 0.45})`;
  ctx.lineWidth = 1.7 * s2;
  ctx.beginPath();
  ctx.arc(0, 0, 32 * s2, 0, Math.PI * 2);
  ctx.stroke();

  // Sequential rune activation around the circle
  for (let i = 0; i < runeCount; i++) {
    const a = (i / runeCount) * Math.PI * 2 - Math.PI / 2;
    const isLit = i < litRuneCount;
    const isActivating = i === litRuneCount && charge < 1;
    const partialBright = isActivating ? charge * runeCount - litRuneCount : 0;
    const runeAlpha = isLit
      ? 0.7 + Math.sin(time * 4 + i * 0.6) * 0.2 + readyFlash
      : 0.25 + Math.sin(time * 1.5 + i * 0.8) * 0.08 + partialBright * 0.4;
    const rx = Math.cos(a) * 28 * s2;
    const ry = Math.sin(a) * 28 * s2;
    ctx.font = `bold ${7.2 * s2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isLit
      ? `rgba(${hotRgb}, ${runeAlpha})`
      : `rgba(${grayRgb}, ${runeAlpha})`;
    ctx.fillText(runes[i % runes.length], rx, ry);

    if (isLit) {
      ctx.fillStyle = `rgba(255, 200, 180, ${0.15 + readyFlash * 0.3})`;
      ctx.beginPath();
      ctx.arc(rx, ry, 5 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Tick marks - always visible, gray when unlit
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const tx = Math.cos(a) * 28 * s2;
    const ty = Math.sin(a) * 28 * s2;
    const tickLit = i / 12 < charge;
    ctx.strokeStyle = tickLit
      ? `rgba(255, 215, 205, ${0.6 + readyFlash})`
      : `rgba(${grayRgb}, 0.3)`;
    ctx.lineWidth = (i % 3 === 0 ? 2 : 1.2) * s2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(Math.cos(a) * 34 * s2, Math.sin(a) * 34 * s2);
    ctx.stroke();
  }
  ctx.restore();

  // Base body
  ctx.fillStyle = "#422926";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-baseW, -baseW * tanA);
  ctx.lineTo(-baseW, -baseW * tanA - baseH);
  ctx.lineTo(0, -baseH);
  ctx.fill();
  ctx.fillStyle = "#6b3a35";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(baseW, -baseW * tanA);
  ctx.lineTo(baseW, -baseW * tanA - baseH);
  ctx.lineTo(0, -baseH);
  ctx.fill();
  ctx.fillStyle = "#8a4a45";
  ctx.beginPath();
  ctx.moveTo(0, -baseH);
  ctx.lineTo(-baseW, -baseW * tanA - baseH);
  ctx.lineTo(0, -baseW * tanA * 2 - baseH);
  ctx.lineTo(baseW, -baseW * tanA - baseH);
  ctx.closePath();
  ctx.fill();

  // Runic glyph ring on the base - gray when uncharged, colored when lit
  ctx.font = `bold ${7.2 * s2}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 - time * (0.16 + charge * 0.3);
    const rx = Math.cos(a) * 30 * s2;
    const ry = Math.sin(a) * 15 * s2 - baseW * tanA + 2 * s2;
    const runeCharge = i / 14 < charge ? 1 : 0;
    const alpha = runeCharge
      ? 0.4 + Math.sin(time * 2.8 + i * 0.9) * 0.18 + charge * 0.3 + readyFlash
      : 0.2 + Math.sin(time * 1.2 + i * 0.9) * 0.06;
    ctx.fillStyle = `rgba(${runeCharge ? hotRgb : grayRgb}, ${Math.max(0.12, alpha)})`;
    ctx.fillText(runes[i % runes.length], rx, ry);
  }

  // Upper plate
  const upperY = -baseH;
  ctx.fillStyle = "#311f1d";
  ctx.beginPath();
  ctx.moveTo(0, upperY);
  ctx.lineTo(-upperW, upperY - upperW * tanA);
  ctx.lineTo(-upperW, upperY - upperW * tanA - upperH);
  ctx.lineTo(0, upperY - upperH);
  ctx.fill();
  ctx.fillStyle = "#5a3430";
  ctx.beginPath();
  ctx.moveTo(0, upperY);
  ctx.lineTo(upperW, upperY - upperW * tanA);
  ctx.lineTo(upperW, upperY - upperW * tanA - upperH);
  ctx.lineTo(0, upperY - upperH);
  ctx.fill();
  ctx.fillStyle = "#7d4741";
  ctx.beginPath();
  ctx.moveTo(0, upperY - upperH);
  ctx.lineTo(-upperW, upperY - upperW * tanA - upperH);
  ctx.lineTo(0, upperY - upperW * tanA * 2 - upperH);
  ctx.lineTo(upperW, upperY - upperW * tanA - upperH);
  ctx.closePath();
  ctx.fill();

  // === SPINNING GEARS on base flanks ===
  const gearSpeed = 0.5 + charge * 2.2;
  const gearRimColor = `rgba(${charge > 0.3 ? glowRgb : grayRgb}, ${0.35 + charge * 0.35})`;
  const gearHubColor = `rgba(${glowRgb}, ${0.3 + charge * 0.4})`;
  drawSpecialGear(
    ctx, -baseW * 0.72, -baseW * tanA - baseH * 0.4,
    9 * s2, 10, time * gearSpeed, s2,
    "rgba(65, 38, 34, 0.85)", gearRimColor, gearHubColor,
  );
  drawSpecialGear(
    ctx, baseW * 0.72, -baseW * tanA - baseH * 0.4,
    9 * s2, 10, -time * gearSpeed + Math.PI / 10, s2,
    "rgba(65, 38, 34, 0.85)", gearRimColor, gearHubColor,
  );
  drawSpecialGear(
    ctx, -baseW * 0.38, -baseW * tanA - baseH * 0.25,
    5.5 * s2, 8, -time * gearSpeed * 1.6, s2,
    "rgba(55, 32, 28, 0.8)", gearRimColor, gearHubColor,
  );
  drawSpecialGear(
    ctx, baseW * 0.38, -baseW * tanA - baseH * 0.25,
    5.5 * s2, 8, time * gearSpeed * 1.6, s2,
    "rgba(55, 32, 28, 0.8)", gearRimColor, gearHubColor,
  );

  // === EXPANDING SIDE SHIELDS ===
  const shieldExp = charge * (0.7 + Math.sin(time * 1.5) * 0.15);
  drawExpandingShieldPlate(
    ctx, -upperW * 0.5, upperY - upperW * tanA * 0.45,
    -1, shieldExp, 18 * s2, s2,
    "#3a2422", "#5a3430", "#4d2d28", glowRgb,
  );
  drawExpandingShieldPlate(
    ctx, upperW * 0.5, upperY - upperW * tanA * 0.45,
    1, shieldExp, 18 * s2, s2,
    "#5a3430", "#6b3a35", "#5a3430", glowRgb,
  );

  // Side generators with charge-reactive crystals
  const generators = [
    { x: -upperW * 0.95, y: upperY - upperW * tanA * 0.65, h: 25 * s2 },
    { x: upperW * 0.95, y: upperY - upperW * tanA * 0.65, h: 27 * s2 },
  ];
  generators.forEach((g, idx) => {
    const w = 7 * s2;
    ctx.fillStyle = idx === 0 ? "#3d2422" : "#643532";
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + (idx === 0 ? -w : w), g.y - 3 * s2);
    ctx.lineTo(g.x + (idx === 0 ? -w : w), g.y - g.h);
    ctx.lineTo(g.x, g.y - g.h + 4 * s2);
    ctx.closePath();
    ctx.fill();

    // Crystal tip: gray at 0, builds color with charge
    const crystalSize = (3.2 + charge * 1.2) * s2;
    const crystalAlpha = 0.45 + charge * 0.4 + readyFlash;
    ctx.fillStyle = `rgba(${glowRgb}, ${crystalAlpha})`;
    ctx.beginPath();
    ctx.arc(
      g.x + (idx === 0 ? -2.3 : 2.3) * s2,
      g.y - g.h + 5 * s2,
      crystalSize,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Energy accumulation glow around crystal - always visible
    const haloR = (5 + charge * 4 + readyFlash * 3) * s2;
    const haloGrad = ctx.createRadialGradient(
      g.x + (idx === 0 ? -2.3 : 2.3) * s2,
      g.y - g.h + 5 * s2,
      0,
      g.x + (idx === 0 ? -2.3 : 2.3) * s2,
      g.y - g.h + 5 * s2,
      haloR,
    );
    haloGrad.addColorStop(0, `rgba(${glowRgb}, ${0.12 + 0.25 * charge})`);
    haloGrad.addColorStop(1, "transparent");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(
      g.x + (idx === 0 ? -2.3 : 2.3) * s2,
      g.y - g.h + 5 * s2,
      haloR,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  // Main targeting tower
  const towerBaseY = upperY - upperH - 1.5 * s2;
  const towerW = 13 * s2;
  ctx.fillStyle = "#3a2220";
  ctx.beginPath();
  ctx.moveTo(0, towerBaseY);
  ctx.lineTo(-towerW, towerBaseY - towerW * tanA);
  ctx.lineTo(-towerW, towerBaseY - towerW * tanA - towerH);
  ctx.lineTo(0, towerBaseY - towerH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#6c3934";
  ctx.beginPath();
  ctx.moveTo(0, towerBaseY);
  ctx.lineTo(towerW, towerBaseY - towerW * tanA);
  ctx.lineTo(towerW, towerBaseY - towerW * tanA - towerH);
  ctx.lineTo(0, towerBaseY - towerH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#8f4b45";
  ctx.beginPath();
  ctx.moveTo(0, towerBaseY - towerH);
  ctx.lineTo(-towerW, towerBaseY - towerW * tanA - towerH);
  ctx.lineTo(0, towerBaseY - towerW * tanA * 2 - towerH);
  ctx.lineTo(towerW, towerBaseY - towerW * tanA - towerH);
  ctx.closePath();
  ctx.fill();

  // === VERTICAL HYDRAULIC PISTONS on tower flanks ===
  const pistonBob = Math.sin(time * 2.8) * 0.5 + 0.5;
  const pistonExt = 0.25 + charge * 0.45 + pistonBob * 0.3;
  drawHydraulicPiston(
    ctx, -towerW - 5 * s2, towerBaseY - 3 * s2,
    towerH * 0.55, pistonExt, s2,
    "#3d2422", "rgba(130, 125, 115, 0.85)", glowRgb,
  );
  drawHydraulicPiston(
    ctx, towerW + 5 * s2, towerBaseY - 3 * s2,
    towerH * 0.55, pistonExt, s2,
    "#643532", "rgba(130, 125, 115, 0.85)", glowRgb,
  );

  // === HYDRAULIC STABILIZER ARMS to generators ===
  generators.forEach((g, idx) => {
    const armPulse = Math.sin(time * 3.2 + idx * Math.PI) * 0.5 + 0.5;
    const armAlpha = 0.3 + charge * 0.4 + armPulse * 0.12;
    const armW = (2.2 + charge * 1.5) * s2;
    const sx = (idx === 0 ? -1 : 1) * towerW * 0.85;
    const sy = towerBaseY - towerH * 0.35;
    const ex = g.x + (idx === 0 ? -3 : 3) * s2;
    const ey = g.y - g.h * 0.45;
    ctx.strokeStyle = `rgba(55, 38, 32, ${armAlpha + 0.25})`;
    ctx.lineWidth = armW + 2.5 * s2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) * 0.5, Math.min(sy, ey) - 6 * s2, ex, ey);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${glowRgb}, ${armAlpha * 0.55})`;
    ctx.lineWidth = armW * 0.45;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) * 0.5, Math.min(sy, ey) - 6 * s2, ex, ey);
    ctx.stroke();
    ctx.fillStyle = "rgba(95, 88, 78, 0.7)";
    ctx.beginPath();
    ctx.arc(sx, sy, 2.2 * s2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex, ey, 2.2 * s2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Charge conduit lines running up the tower face - always visible
  const conduitAlpha = 0.12 + charge * 0.5 + readyFlash;
  const conduitH = towerH * Math.max(0.08, charge);
  ctx.strokeStyle = `rgba(${glowRgb}, ${conduitAlpha})`;
  ctx.lineWidth = 1.4 * s2;
  for (let i = 0; i < 3; i++) {
    const xOff = (i - 1) * 4 * s2;
    ctx.beginPath();
    ctx.moveTo(xOff, towerBaseY);
    ctx.lineTo(xOff, towerBaseY - conduitH);
    ctx.stroke();
  }

  // Ancient shield dome - always visible, gray→colored
  const shieldY = towerBaseY - towerH + 7 * s2;
  ctx.save();
  ctx.translate(0, shieldY);
  ctx.scale(1, ISO_Y_RATIO);
  const shieldGrad = ctx.createRadialGradient(
    0,
    -4 * s2,
    3 * s2,
    0,
    0,
    30 * s2,
  );
  shieldGrad.addColorStop(
    0,
    `rgba(${glowRgb}, ${0.18 + charge * 0.22 + readyFlash * 0.2})`,
  );
  shieldGrad.addColorStop(0.55, `rgba(${glowRgb}, ${0.1 + charge * 0.18})`);
  shieldGrad.addColorStop(1, `rgba(${grayRgb}, 0)`);
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 30 * s2, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(${glowRgb}, ${0.3 + charge * 0.4 + readyFlash})`;
  ctx.lineWidth = 1.9 * s2;
  ctx.beginPath();
  ctx.arc(0, 0, 30 * s2, Math.PI, 0);
  ctx.stroke();
  ctx.restore();

  // Generator core + targeting lens
  const coreY = towerBaseY - towerH - 12 * s2;
  const drawSentinelGuidanceRings = (frontHalf: boolean): void => {
    const arcStart = frontHalf ? 0 : Math.PI;
    const arcEnd = frontHalf ? Math.PI : Math.PI * 2;
    ctx.save();
    ctx.translate(0, coreY + 5 * s2);
    ctx.scale(1, ISO_Y_RATIO);
    // Ring speed increases with charge
    const ringSpeed = 0.5 + charge * 1.8;
    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.rotate((i === 0 ? 1 : -1) * time * (ringSpeed + i * 0.25));
      ctx.strokeStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.45 + readyFlash})`;
      ctx.lineWidth = (2.4 - i * 0.5) * s2;
      ctx.setLineDash([(10 + i * 3) * s2, (7 + i * 2) * s2]);
      ctx.beginPath();
      ctx.arc(0, 0, (31 - i * 9) * s2, arcStart, arcEnd);
      ctx.stroke();
      ctx.restore();
    }
    ctx.setLineDash([]);
    ctx.restore();
  };

  drawSentinelGuidanceRings(false);

  // Core crystal: always visible, gray→red with charge, full size
  const coreSize = 14 * s2;
  const coreGrad = ctx.createRadialGradient(0, coreY, 0, 0, coreY, coreSize);
  const coreWhiteR = Math.round(180 + 75 * charge);
  const coreWhiteG = Math.round(180 + 62 * charge);
  const coreWhiteB = Math.round(185 + 51 * charge);
  coreGrad.addColorStop(
    0,
    `rgba(${coreWhiteR}, ${coreWhiteG}, ${coreWhiteB}, ${0.55 + charge * 0.4 + readyFlash * 0.15})`,
  );
  coreGrad.addColorStop(0.45, `rgba(${glowRgb}, ${0.4 + charge * 0.5})`);
  coreGrad.addColorStop(1, `rgba(${grayRgb}, 0.08)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(0, coreY - 13 * s2);
  ctx.lineTo(-8 * s2, coreY - 2.5 * s2);
  ctx.lineTo(-4.2 * s2, coreY + 10 * s2);
  ctx.lineTo(4.2 * s2, coreY + 10 * s2);
  ctx.lineTo(8 * s2, coreY - 2.5 * s2);
  ctx.closePath();
  ctx.fill();

  // Inner eye: gray dot at 0, brightens to white
  const eyeR = Math.round(180 + 75 * charge);
  const eyeG = Math.round(180 + 75 * charge);
  const eyeB = Math.round(185 + 70 * charge);
  ctx.fillStyle = `rgba(${eyeR}, ${eyeG}, ${eyeB}, ${0.35 + charge * 0.5 + readyFlash})`;
  ctx.beginPath();
  ctx.arc(0, coreY + 1.5 * s2, (2 + charge * 0.8) * s2, 0, Math.PI * 2);
  ctx.fill();

  drawSentinelGuidanceRings(true);

  // Assembling ruin fragments: always visible, gray at 0, converge as charge nears 1
  const fragmentCount = 6;
  for (let i = 0; i < fragmentCount; i++) {
    const a = (i / fragmentCount) * Math.PI * 2 + time * 0.3;
    const maxDist = 50 * s2;
    const minDist = 8 * s2;
    const dist = maxDist - (maxDist - minDist) * charge;
    const fx = Math.cos(a) * dist;
    const fy = coreY + 5 * s2 + Math.sin(a) * dist * 0.5;
    const fSize = (3 + charge * 2) * s2;
    const fragAlpha = 0.25 + charge * 0.5 + readyFlash;
    ctx.fillStyle = `rgba(${glowRgb}, ${fragAlpha})`;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(a + time * (0.5 + charge * 2));
    ctx.fillRect(-fSize / 2, -fSize / 2, fSize, fSize);
    ctx.restore();
  }

  // Orbiting ancient targeting drones - always visible, gray→red
  const droneCount = 4;
  const droneSpeed = 0.4 + charge * 1.0;
  for (let i = 0; i < droneCount; i++) {
    const a = (i / droneCount) * Math.PI * 2 + time * (droneSpeed + i * 0.04);
    const x = Math.cos(a) * 30 * s2;
    const y = coreY + 12 * s2 + Math.sin(a) * 12 * s2;
    const size = (4.4 + (i % 2) * 1.3) * s2;
    ctx.fillStyle = `rgba(${glowRgb}, ${0.35 + charge * 0.4 + readyFlash})`;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - 2.2 * s2, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x + 2.2 * s2, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.45})`;
    ctx.lineWidth = 1.1 * s2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a + 0.7) * 7 * s2, y + Math.sin(a + 0.7) * 4 * s2);
    ctx.stroke();
  }

  // Sweep beam - always visible, gray→red
  const sweepAngle = time * (0.5 + charge * 1.5);
  const beamX = Math.cos(sweepAngle) * 44 * s2;
  const beamY = Math.sin(sweepAngle) * 22 * s2;
  const beamGrad = ctx.createLinearGradient(0, coreY + 2 * s2, beamX, beamY);
  beamGrad.addColorStop(
    0,
    `rgba(${glowRgb}, ${0.2 + charge * 0.55 + readyFlash})`,
  );
  beamGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = beamGrad;
  ctx.lineWidth = (2 + charge * 2) * s2;
  ctx.beginPath();
  ctx.moveTo(0, coreY + 2 * s2);
  ctx.lineTo(beamX, beamY);
  ctx.stroke();

  // Generator links - always visible, gray→colored
  generators.forEach((g, idx) => {
    const arc = Math.sin(time * 5 + idx * 2) * 0.5 + 0.5;
    const linkGrad = ctx.createLinearGradient(
      0,
      coreY + 4 * s2,
      g.x,
      g.y - g.h + 2 * s2,
    );
    linkGrad.addColorStop(
      0,
      `rgba(${glowRgb}, ${0.25 + charge * 0.4 + arc * 0.12})`,
    );
    linkGrad.addColorStop(
      1,
      `rgba(${glowRgb}, ${0.12 + charge * 0.2 + arc * 0.1})`,
    );
    ctx.strokeStyle = linkGrad;
    ctx.lineWidth = (1.4 + charge * 0.6) * s2;
    ctx.beginPath();
    ctx.moveTo(0, coreY + 4 * s2);
    ctx.lineTo(g.x * 0.45, coreY + 10 * s2 + (idx === 0 ? -3 : 3) * s2);
    ctx.lineTo(g.x + (idx === 0 ? -2 : 2) * s2, g.y - g.h + 2 * s2);
    ctx.stroke();
  });

  // Charged-ready energy burst halo when at 100%
  if (charge >= 0.98) {
    const burstGrad = ctx.createRadialGradient(0, coreY, 0, 0, coreY, 35 * s2);
    burstGrad.addColorStop(
      0,
      `rgba(255, 220, 200, ${0.15 + readyFlash * 0.25})`,
    );
    burstGrad.addColorStop(0.5, `rgba(${hotRgb}, ${0.08 + readyFlash * 0.15})`);
    burstGrad.addColorStop(1, "transparent");
    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(0, coreY, 35 * s2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSunforgeOrreryBuilding(
  ctx: CanvasRenderingContext2D,
  s: number,
  time: number,
  enemyHeatCount: number,
  chargeProgress: number,
): void {
  const charge = Math.max(0, Math.min(1, chargeProgress));
  const stage =
    enemyHeatCount === 0
      ? 0
      : enemyHeatCount <= 3
        ? 1
        : enemyHeatCount <= 6
          ? 2
          : 3;
  const pulse = Math.sin(time * 3.1) * 0.5 + 0.5;
  const surge = Math.sin(time * 7.6 + 1.1) * 0.5 + 0.5;
  const s2 = s * 1.16;
  const tanA = ISO_TAN;
  const hotRgb = [
    "240, 131, 58",
    "250, 148, 66",
    "255, 168, 82",
    "255, 198, 120",
  ][stage];
  // Smooth gray → orange/gold color ramp across 0-1 charge
  const stageR = [240, 250, 255, 255][stage];
  const stageG = [131, 148, 168, 198][stage];
  const stageB = [58, 66, 82, 120][stage];
  const lerpR = Math.round(120 + (stageR - 120) * charge);
  const lerpG = Math.round(120 + (stageG - 120) * charge);
  const lerpB = Math.round(130 + (stageB - 130) * charge);
  const glowRgb = `${lerpR}, ${lerpG}, ${lerpB}`;
  const grayRgb = "120, 120, 130";
  const chargeGlow = 0.45 + charge * 0.55;
  const readyFlash =
    charge >= 0.98 ? (Math.sin(time * 11) * 0.5 + 0.5) * 0.35 : 0;
  const runeSet = ["ᚠ", "ᛋ", "ᚱ", "ᛟ", "ᚲ", "ᛞ", "ᛇ", "ᚹ"];

  const baseW = 34 * s2;
  const baseH = 9 * s2;
  const upperW = 23 * s2;
  const upperH = 8 * s2;
  const coreY = -baseH - upperH - 38 * s2;

  // Center the iso diamond on the tile (bottom vertex was at origin)
  ctx.translate(0, baseW * tanA);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.beginPath();
  ctx.ellipse(0, -baseW * tanA + 5 * s2, 50 * s2, 24 * s2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orrery glow circle - UNDER the base, intensity scales with charge
  const railY = -baseW * tanA + 2.2 * s2;
  const railOuterR = 44 * s2;
  const railMidR = 35 * s2;
  const railInnerR = 25 * s2;

  const floorGlow = ctx.createRadialGradient(
    0,
    -baseW * tanA,
    0,
    0,
    -baseW * tanA,
    66 * s2,
  );
  floorGlow.addColorStop(
    0,
    `rgba(${glowRgb}, ${0.12 + charge * 0.22 + readyFlash * 0.15})`,
  );
  floorGlow.addColorStop(0.52, `rgba(${glowRgb}, ${0.05 + charge * 0.1})`);
  floorGlow.addColorStop(1, "transparent");
  ctx.fillStyle = floorGlow;
  ctx.beginPath();
  ctx.ellipse(0, -baseW * tanA, 64 * s2, 30 * s2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Charge fill arc on the ground plane
  if (charge > 0.02) {
    ctx.save();
    ctx.translate(0, railY);
    ctx.scale(1, ISO_Y_RATIO);
    ctx.strokeStyle = `rgba(${hotRgb}, ${0.35 + charge * 0.5 + readyFlash})`;
    ctx.lineWidth = 4 * s2;
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      railOuterR + 3 * s2,
      -Math.PI / 2,
      -Math.PI / 2 + charge * Math.PI * 2,
    );
    ctx.stroke();
    ctx.restore();
  }

  // Back rail/runes first (rendered under the base body)
  const drawSunforgeRail = (frontHalf: boolean): void => {
    const arcStart = frontHalf ? 0 : Math.PI;
    const arcEnd = frontHalf ? Math.PI : Math.PI * 2;
    ctx.save();
    ctx.translate(0, railY);
    ctx.scale(1, ISO_Y_RATIO);

    // Broad halo - always visible, gray→warm
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.15 + charge * 0.2 + readyFlash * 0.1})`;
    ctx.lineWidth = 7.4 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, railMidR + 1.5 * s2, arcStart, arcEnd);
    ctx.stroke();

    // Outer ring
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.4 + readyFlash})`;
    ctx.lineWidth = 3 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, railOuterR, arcStart, arcEnd);
    ctx.stroke();

    // Mid ring
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.35})`;
    ctx.lineWidth = 2.2 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, railMidR, arcStart, arcEnd);
    ctx.stroke();

    // Inner segmented ring
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.22 + charge * 0.35})`;
    ctx.lineWidth = 1.5 * s2;
    ctx.setLineDash([7 * s2, 5 * s2]);
    ctx.beginPath();
    ctx.arc(0, 0, railInnerR, arcStart, arcEnd);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tick marks - gray when unlit, colored when lit
    const tickCount = 18;
    for (let i = 0; i < tickCount; i++) {
      const a = (i / tickCount) * Math.PI * 2 + time * (0.12 + charge * 0.2);
      const isFront = Math.sin(a) >= 0;
      if (isFront !== frontHalf) continue;
      const ix = Math.cos(a) * (railMidR + 1.3 * s2);
      const iy = Math.sin(a) * (railMidR + 1.3 * s2);
      const ox = Math.cos(a) * (railOuterR - 1.2 * s2);
      const oy = Math.sin(a) * (railOuterR - 1.2 * s2);
      const tickLit = i / tickCount < charge;
      ctx.strokeStyle = tickLit
        ? `rgba(255, 228, 188, ${0.55 + surge * 0.3 + readyFlash})`
        : `rgba(${grayRgb}, 0.3)`;
      ctx.lineWidth = (i % 3 === 0 ? 1.9 : 1.2) * s2;
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ox, oy);
      ctx.stroke();
    }

    // Orbiting sparks - always visible, gray→warm
    for (let i = 0; i < 4; i++) {
      const a = time * (0.4 + i * 0.18 + charge * 0.5) + (i * Math.PI * 2) / 4;
      const x = Math.cos(a) * 39 * s2;
      const y = Math.sin(a) * 39 * s2;
      const isFront = y >= 0;
      if (isFront !== frontHalf) continue;
      ctx.fillStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.5 + readyFlash})`;
      ctx.beginPath();
      ctx.arc(x, y, (1.8 + charge * 1.2) * s2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawSunforgeRunes = (frontHalf: boolean): void => {
    ctx.font = `bold ${6.8 * s2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const totalRunes = 16;
    const litRunes = Math.floor(charge * totalRunes);
    for (let i = 0; i < totalRunes; i++) {
      const a = (i / totalRunes) * Math.PI * 2 - time * (0.2 + charge * 0.25);
      const x = Math.cos(a) * 31.5 * s2;
      const y = Math.sin(a) * 15.7 * s2 + railY;
      const isFront = Math.sin(a) >= 0;
      if (isFront !== frontHalf) continue;
      const isLit = i < litRunes;
      const alpha = isLit
        ? 0.45 +
          Math.sin(time * 2.9 + i * 0.8) * 0.14 +
          charge * 0.3 +
          readyFlash
        : 0.22 + Math.sin(time * 1.2 + i * 0.8) * 0.06;
      ctx.fillStyle = isLit
        ? `rgba(${hotRgb}, ${Math.max(0.14, alpha)})`
        : `rgba(${grayRgb}, ${Math.max(0.12, alpha)})`;
      ctx.fillText(runeSet[i % runeSet.length], x, y);
    }
  };

  // Back rail/runes FIRST (under the base)
  drawSunforgeRail(false);
  drawSunforgeRunes(false);

  // Bronze/obsidian base
  ctx.fillStyle = "#3a271c";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-baseW, -baseW * tanA);
  ctx.lineTo(-baseW, -baseW * tanA - baseH);
  ctx.lineTo(0, -baseH);
  ctx.fill();
  ctx.fillStyle = "#5f3a24";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(baseW, -baseW * tanA);
  ctx.lineTo(baseW, -baseW * tanA - baseH);
  ctx.lineTo(0, -baseH);
  ctx.fill();
  ctx.fillStyle = "#77462d";
  ctx.beginPath();
  ctx.moveTo(0, -baseH);
  ctx.lineTo(-baseW, -baseW * tanA - baseH);
  ctx.lineTo(0, -baseW * tanA * 2 - baseH);
  ctx.lineTo(baseW, -baseW * tanA - baseH);
  ctx.closePath();
  ctx.fill();

  // === SPINNING GEARS at base mechanism ===
  const orrGearSpeed = 0.4 + charge * 2.0;
  const orrGearRim = `rgba(${charge > 0.3 ? glowRgb : grayRgb}, ${0.3 + charge * 0.4})`;
  const orrGearHub = `rgba(${glowRgb}, ${0.25 + charge * 0.45})`;
  drawSpecialGear(
    ctx, -baseW * 0.68, -baseW * tanA - baseH * 0.35,
    10 * s2, 12, time * orrGearSpeed, s2,
    "rgba(58, 39, 28, 0.85)", orrGearRim, orrGearHub,
  );
  drawSpecialGear(
    ctx, baseW * 0.68, -baseW * tanA - baseH * 0.35,
    10 * s2, 12, -time * orrGearSpeed + Math.PI / 12, s2,
    "rgba(58, 39, 28, 0.85)", orrGearRim, orrGearHub,
  );
  drawSpecialGear(
    ctx, 0, -baseW * tanA * 2 - baseH * 0.6,
    6 * s2, 8, time * orrGearSpeed * 1.5, s2,
    "rgba(50, 34, 24, 0.8)", orrGearRim, orrGearHub,
  );

  // Upper crucible
  const upperY = -baseH;
  ctx.fillStyle = "#2a1a15";
  ctx.beginPath();
  ctx.moveTo(0, upperY);
  ctx.lineTo(-upperW, upperY - upperW * tanA);
  ctx.lineTo(-upperW, upperY - upperW * tanA - upperH);
  ctx.lineTo(0, upperY - upperH);
  ctx.fill();
  ctx.fillStyle = "#4d2a1d";
  ctx.beginPath();
  ctx.moveTo(0, upperY);
  ctx.lineTo(upperW, upperY - upperW * tanA);
  ctx.lineTo(upperW, upperY - upperW * tanA - upperH);
  ctx.lineTo(0, upperY - upperH);
  ctx.fill();
  ctx.fillStyle = "#6a3a28";
  ctx.beginPath();
  ctx.moveTo(0, upperY - upperH);
  ctx.lineTo(-upperW, upperY - upperW * tanA - upperH);
  ctx.lineTo(0, upperY - upperW * tanA * 2 - upperH);
  ctx.lineTo(upperW, upperY - upperW * tanA - upperH);
  ctx.closePath();
  ctx.fill();

  // === EXPANDING HEAT SHIELDS from crucible ===
  const heatShieldExp = charge * (0.65 + Math.sin(time * 1.2) * 0.18);
  drawExpandingShieldPlate(
    ctx, -upperW * 0.55, upperY - upperW * tanA * 0.4,
    -1, heatShieldExp, 16 * s2, s2,
    "#2a1a15", "#4d2a1d", "#3d2219", glowRgb,
  );
  drawExpandingShieldPlate(
    ctx, upperW * 0.55, upperY - upperW * tanA * 0.4,
    1, heatShieldExp, 16 * s2, s2,
    "#4d2a1d", "#6a3a28", "#4d2a1d", glowRgb,
  );

  // === VERTICAL ACTUATORS with bobbing motion ===
  const orrPistonBob = Math.sin(time * 2.2) * 0.5 + 0.5;
  const orrPistonExt = 0.2 + charge * 0.5 + orrPistonBob * 0.3;
  drawHydraulicPiston(
    ctx, -upperW - 6 * s2, upperY - upperH - 2 * s2,
    28 * s2, orrPistonExt, s2,
    "#2a1a15", "rgba(130, 120, 105, 0.85)", glowRgb,
  );
  drawHydraulicPiston(
    ctx, upperW + 6 * s2, upperY - upperH - 2 * s2,
    28 * s2, orrPistonExt, s2,
    "#4d2a1d", "rgba(130, 120, 105, 0.85)", glowRgb,
  );

  // Rotating orrery rings - always visible, gray→colored
  const ringSpeed = 0.4 + charge * 1.4;
  ctx.save();
  ctx.translate(0, coreY + 24 * s2);
  ctx.scale(1, ISO_Y_RATIO);
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate((i === 0 ? 1 : -1) * time * (ringSpeed + i * 0.26));
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.45 + readyFlash})`;
    ctx.lineWidth = (2.6 - i * 0.5) * s2;
    ctx.setLineDash([(10 + i * 3) * s2, (6 + i * 3) * s2]);
    ctx.beginPath();
    ctx.arc(0, 0, (28 - i * 8) * s2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.setLineDash([]);
  ctx.restore();

  // Central sun core crystal - always visible, gray→golden
  const coreGrad = ctx.createRadialGradient(0, coreY, 0, 0, coreY, 22 * s2);
  const sunWhiteR = Math.round(180 + 75 * charge);
  const sunWhiteG = Math.round(180 + 68 * charge);
  const sunWhiteB = Math.round(185 + 47 * charge);
  coreGrad.addColorStop(
    0,
    `rgba(${sunWhiteR}, ${sunWhiteG}, ${sunWhiteB}, ${0.5 + charge * 0.42 + readyFlash * 0.15})`,
  );
  coreGrad.addColorStop(0.35, `rgba(${glowRgb}, ${0.4 + charge * 0.5})`);
  coreGrad.addColorStop(1, `rgba(${grayRgb}, 0.08)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(0, coreY - 16 * s2);
  ctx.lineTo(-10 * s2, coreY - 2 * s2);
  ctx.lineTo(-5 * s2, coreY + 14 * s2);
  ctx.lineTo(5 * s2, coreY + 14 * s2);
  ctx.lineTo(10 * s2, coreY - 2 * s2);
  ctx.closePath();
  ctx.fill();

  // Inner sun dot - gray at 0, blazes when charged
  const sunEyeR = Math.round(180 + 75 * charge);
  const sunEyeG = Math.round(180 + 75 * charge);
  const sunEyeB = Math.round(185 + 55 * charge);
  ctx.fillStyle = `rgba(${sunEyeR}, ${sunEyeG}, ${sunEyeB}, ${0.35 + charge * 0.5 + readyFlash})`;
  ctx.beginPath();
  ctx.arc(0, coreY + 2 * s2, (2.2 + charge * 1.5) * s2, 0, Math.PI * 2);
  ctx.fill();

  // Assembling solar fragments - always visible, gray→warm
  const fragmentCount = 8;
  for (let i = 0; i < fragmentCount; i++) {
    const a = (i / fragmentCount) * Math.PI * 2 + time * 0.4;
    const maxDist = 45 * s2;
    const minDist = 6 * s2;
    const dist = maxDist - (maxDist - minDist) * charge;
    const fx = Math.cos(a) * dist;
    const fy = coreY + 8 * s2 + Math.sin(a) * dist * 0.45;
    const fSize = (2.5 + charge * 2) * s2;
    ctx.fillStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.5 + readyFlash})`;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(a + time * (0.4 + charge * 2));
    ctx.beginPath();
    ctx.moveTo(0, -fSize);
    ctx.lineTo(-fSize * 0.6, 0);
    ctx.lineTo(0, fSize);
    ctx.lineTo(fSize * 0.6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Launch pylons with charge-reactive tips
  const pylons = [
    { x: -17 * s2, y: coreY + 10 * s2, h: 24 * s2 },
    { x: 17 * s2, y: coreY + 10 * s2, h: 26 * s2 },
  ];
  pylons.forEach((p, idx) => {
    const dir = idx === 0 ? -1 : 1;
    ctx.fillStyle = idx === 0 ? "#41281f" : "#633626";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + dir * 7 * s2, p.y - 3 * s2);
    ctx.lineTo(p.x + dir * 7 * s2, p.y - p.h);
    ctx.lineTo(p.x, p.y - p.h + 4 * s2);
    ctx.closePath();
    ctx.fill();

    // Pylon tip - always visible, gray→warm
    const tipSize = (3 + charge * 1.2) * s2;
    ctx.fillStyle = `rgba(${glowRgb}, ${0.4 + charge * 0.4 + readyFlash})`;
    ctx.beginPath();
    ctx.arc(p.x + dir * 2.2 * s2, p.y - p.h + 5 * s2, tipSize, 0, Math.PI * 2);
    ctx.fill();

    // Pylon halo - always visible
    const haloR = (4 + charge * 4 + readyFlash * 3) * s2;
    const haloGrad = ctx.createRadialGradient(
      p.x + dir * 2.2 * s2,
      p.y - p.h + 5 * s2,
      0,
      p.x + dir * 2.2 * s2,
      p.y - p.h + 5 * s2,
      haloR,
    );
    haloGrad.addColorStop(0, `rgba(${glowRgb}, ${0.1 + 0.2 * charge})`);
    haloGrad.addColorStop(1, "transparent");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(p.x + dir * 2.2 * s2, p.y - p.h + 5 * s2, haloR, 0, Math.PI * 2);
    ctx.fill();
  });

  // === HYDRAULIC STABILIZER ARMS to pylons ===
  pylons.forEach((p, idx) => {
    const stabPulse = Math.sin(time * 2.8 + idx * Math.PI) * 0.5 + 0.5;
    const stabAlpha = 0.25 + charge * 0.4 + stabPulse * 0.15;
    const stabW = (2 + charge * 1.8) * s2;
    const sx = (idx === 0 ? -1 : 1) * upperW * 0.6;
    const sy = upperY - upperW * tanA * 0.5 - upperH;
    const ex = p.x + (idx === 0 ? -1 : 1) * 3 * s2;
    const ey = p.y - p.h * 0.4;
    ctx.strokeStyle = `rgba(50, 33, 24, ${stabAlpha + 0.2})`;
    ctx.lineWidth = stabW + 2.5 * s2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) * 0.5, Math.min(sy, ey) - 5 * s2, ex, ey);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${glowRgb}, ${stabAlpha * 0.5})`;
    ctx.lineWidth = stabW * 0.4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + ex) * 0.5, Math.min(sy, ey) - 5 * s2, ex, ey);
    ctx.stroke();
    ctx.fillStyle = "rgba(90, 82, 72, 0.7)";
    ctx.beginPath();
    ctx.arc(sx, sy, 2 * s2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex, ey, 2 * s2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Front rail/runes last for proper depth
  drawSunforgeRail(true);
  drawSunforgeRunes(true);

  // Floating solar shards - always visible, gray→warm
  const shardCount = 6 + stage * 2;
  for (let i = 0; i < shardCount; i++) {
    const a =
      (i / shardCount) * Math.PI * 2 +
      time * (0.5 + stage * 0.2 + charge * 0.5);
    const x = Math.cos(a) * (30 + stage * 4) * s2;
    const y = coreY + 14 * s2 + Math.sin(a * 1.32) * (12 + stage * 1.6) * s2;
    const h = (4 + (i % 3)) * s2;
    ctx.fillStyle = `rgba(${glowRgb}, ${0.3 + charge * 0.45 + readyFlash})`;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x - 2.3 * s2, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + 2.3 * s2, y);
    ctx.closePath();
    ctx.fill();
  }

  // Solar charge arcs - always visible, gray→warm
  const arcCount = 2 + Math.floor(charge * 3);
  for (let i = 0; i < arcCount; i++) {
    const a = (i / arcCount) * Math.PI * 2 + time * (0.6 + charge * 0.8);
    const sx = Math.cos(a) * 10 * s2;
    const sy = coreY + Math.sin(a * 1.2) * 5 * s2;
    const ex = Math.cos(a + 0.35) * (36 + stage * 4) * s2;
    const ey = coreY + 34 * s2 + Math.sin(a + 0.35) * 14 * s2;
    const grad = ctx.createLinearGradient(sx, sy, ex, ey);
    grad.addColorStop(
      0,
      `rgba(${glowRgb}, ${0.15 + charge * 0.55 + readyFlash})`,
    );
    grad.addColorStop(1, "transparent");
    ctx.strokeStyle = grad;
    ctx.lineWidth = (1.2 + charge * 1.3) * s2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(
      (sx + ex) * 0.5 + Math.sin(time * 8 + i) * 4 * s2,
      (sy + ey) * 0.5,
    );
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // Ready burst halo
  if (charge >= 0.98) {
    const burstGrad = ctx.createRadialGradient(0, coreY, 0, 0, coreY, 30 * s2);
    burstGrad.addColorStop(
      0,
      `rgba(255, 240, 210, ${0.12 + readyFlash * 0.2})`,
    );
    burstGrad.addColorStop(0.5, `rgba(${hotRgb}, ${0.06 + readyFlash * 0.12})`);
    burstGrad.addColorStop(1, "transparent");
    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(0, coreY, 30 * s2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Special Building Types rendering
export function renderSpecialBuilding(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  zoom: number,
  specType: string,
  specHp: number | undefined,
  specialTowerHp: number | null,
  vaultFlash: number,
  boostedTowerCount: number = 0,
  chargeProgress: number = 0,
  mapTheme?: MapTheme,
): void {
  const s = zoom;
  const time = Date.now() / 1000;

  ctx.save();
  ctx.translate(screenX, screenY);

  switch (specType) {
    case "beacon": {
      // =====================================================================
      // ANCIENT BEACON - EPIC 4-STAGE MYSTICAL TOWER
      // Stage 0 (Dormant): 0 towers boosted
      // Stage 1 (Awakening): 1-2 towers boosted
      // Stage 2 (Empowered): 3-4 towers boosted
      // Stage 3 (Ascended): 5+ towers boosted
      // =====================================================================

      // Determine power stage based on boosted towers
      const powerStage =
        boostedTowerCount === 0
          ? 0
          : boostedTowerCount <= 2
            ? 1
            : boostedTowerCount <= 4
              ? 2
              : 3;

      const s2 = s * 1.15;
      const basePulse = Math.sin(time * 3) * 0.5 + 0.5;
      const fastPulse = Math.sin(time * 6) * 0.5 + 0.5;

      // Power-dependent values
      const powerIntensity = 0.3 + powerStage * 0.23; // 0.3 -> 0.53 -> 0.76 -> 0.99

      // Color schemes per stage
      const stageColors = [
        {
          primary: "#607D8B",
          secondary: "#455A64",
          glow: "#78909C",
          accent: "#90A4AE",
        }, // Dormant - grey/dim
        {
          primary: "#00BCD4",
          secondary: "#0097A7",
          glow: "#00E5FF",
          accent: "#80DEEA",
        }, // Awakening - cyan
        {
          primary: "#00E5FF",
          secondary: "#00B8D4",
          glow: "#40F0FF",
          accent: "#A7FFEB",
        }, // Empowered - bright cyan
        {
          primary: "#E0F7FA",
          secondary: "#80FFFF",
          glow: "#FFFFFF",
          accent: "#F0FFFF",
        }, // Ascended - white/blazing
      ];
      const colors = stageColors[powerStage];

      // Elder Futhark Runes for authenticity
      const elderFuthark = [
        "ᚠ",
        "ᚢ",
        "ᚦ",
        "ᚨ",
        "ᚱ",
        "ᚲ",
        "ᚷ",
        "ᚹ",
        "ᚺ",
        "ᚾ",
        "ᛁ",
        "ᛃ",
        "ᛇ",
        "ᛈ",
        "ᛉ",
        "ᛊ",
        "ᛏ",
        "ᛒ",
        "ᛖ",
        "ᛗ",
        "ᛚ",
        "ᛜ",
        "ᛞ",
        "ᛟ",
      ];

      const tanA = ISO_TAN;

      // =====================================================
      // 1. MASSIVE GROUND EFFECT & SHADOW
      // =====================================================

      // Outer mystical circle (stage 2+)
      if (powerStage >= 2) {
        const circleRadius = 45 * s2 + Math.sin(time * 2) * 3 * s2;
        ctx.save();
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 + basePulse * 0.15})`;
        ctx.lineWidth = 2 * s2;
        ctx.setLineDash([8 * s2, 4 * s2]);
        ctx.beginPath();
        ctx.ellipse(
          0,
          5 * s2,
          circleRadius,
          circleRadius * ISO_Y_RATIO,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Ground rune circle (more elaborate at higher stages) - NO SHADOW for performance
      const groundRuneCount = 6 + powerStage * 2;
      ctx.font = `bold ${(7 + powerStage) * s2}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < groundRuneCount; i++) {
        const angle =
          (i / groundRuneCount) * Math.PI * 2 +
          time * 0.3 * (powerStage > 0 ? 1 : 0);
        const radius = 35 * s2;
        const rx = Math.cos(angle) * radius;
        const ry = Math.sin(angle) * radius * ISO_Y_RATIO + 5 * s2;
        const runeOpacity =
          powerStage === 0
            ? 0.2
            : 0.3 +
              basePulse * 0.4 +
              (i % 3 === Math.floor(time * 2) % 3 ? 0.3 : 0);
        ctx.fillStyle = `rgba(0, 229, 255, ${runeOpacity * powerIntensity})`;
        ctx.fillText(elderFuthark[i % elderFuthark.length], rx, ry);
      }

      // Ground shadow
      ctx.fillStyle = `rgba(0,0,0,${0.25 + powerStage * 0.05})`;
      ctx.beginPath();
      ctx.ellipse(0, 3 * s2, 38 * s2, 38 * ISO_Y_RATIO * s2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ground glow effect (increases with power)
      if (powerStage > 0) {
        const groundGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 40 * s2);
        groundGlow.addColorStop(0, `rgba(0, 229, 255, ${0.1 * powerStage})`);
        groundGlow.addColorStop(0.5, `rgba(0, 180, 200, ${0.05 * powerStage})`);
        groundGlow.addColorStop(1, "transparent");
        ctx.fillStyle = groundGlow;
        ctx.beginPath();
        ctx.ellipse(0, 0, 45 * s2, 45 * ISO_Y_RATIO * s2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // =====================================================
      // MONOLITH DRAWING FUNCTION (used for depth-correct ordering)
      // =====================================================
      const stoneCount = 6;
      const stoneRadius = 30 * s2;

      const drawMonolith = (i: number, drawEnergyLine: boolean) => {
        const stoneAngle = (i / stoneCount) * Math.PI * 2 - Math.PI / 2;
        const sx = Math.cos(stoneAngle) * stoneRadius;
        const sy = Math.sin(stoneAngle) * stoneRadius * ISO_Y_RATIO + 2 * s2;
        const stoneHeight = (22 + (i % 3) * 5) * s2;
        const stoneW = 5 * s2;
        const stoneD = 3 * s2;

        const isoX = stoneW;
        const isoY = stoneW * tanA;
        const depthX = stoneD;
        const depthY = stoneD * tanA;

        ctx.save();

        // LEFT FACE of monolith (darker)
        const leftGrad = ctx.createLinearGradient(
          sx - isoX,
          sy,
          sx,
          sy - stoneHeight,
        );
        leftGrad.addColorStop(0, "#2D3842");
        leftGrad.addColorStop(0.5, "#3D4852");
        leftGrad.addColorStop(1, "#2a3640");
        ctx.fillStyle = leftGrad;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - isoX, sy - isoY);
        ctx.lineTo(sx - isoX, sy - isoY - stoneHeight);
        ctx.lineTo(sx, sy - stoneHeight);
        ctx.closePath();
        ctx.fill();

        // RIGHT FACE of monolith (lighter)
        const rightGrad = ctx.createLinearGradient(
          sx,
          sy,
          sx + isoX,
          sy - stoneHeight,
        );
        rightGrad.addColorStop(0, "#4A5A68");
        rightGrad.addColorStop(0.5, "#5A6A78");
        rightGrad.addColorStop(1, "#4A5A68");
        ctx.fillStyle = rightGrad;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + isoX, sy - isoY);
        ctx.lineTo(sx + isoX, sy - isoY - stoneHeight);
        ctx.lineTo(sx, sy - stoneHeight);
        ctx.closePath();
        ctx.fill();

        // TOP FACE of monolith (brightest - isometric diamond)
        ctx.fillStyle = "#607D8B";
        ctx.beginPath();
        ctx.moveTo(sx, sy - stoneHeight);
        ctx.lineTo(sx - isoX, sy - isoY - stoneHeight);
        ctx.lineTo(sx - isoX + depthX, sy - isoY - depthY - stoneHeight);
        ctx.lineTo(sx + depthX, sy - depthY - stoneHeight);
        ctx.closePath();
        ctx.fill();

        // Back-left face for depth
        ctx.fillStyle = "#1a2830";
        ctx.beginPath();
        ctx.moveTo(sx - isoX, sy - isoY);
        ctx.lineTo(sx - isoX + depthX, sy - isoY - depthY);
        ctx.lineTo(sx - isoX + depthX, sy - isoY - depthY - stoneHeight);
        ctx.lineTo(sx - isoX, sy - isoY - stoneHeight);
        ctx.closePath();
        ctx.fill();

        // Stone edge highlights
        ctx.strokeStyle = "#6A7A88";
        ctx.lineWidth = 0.5 * s2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy - stoneHeight);
        ctx.stroke();

        // Weathering/crack details
        ctx.strokeStyle = "#2a3640";
        ctx.lineWidth = 0.5 * s2;
        ctx.beginPath();
        ctx.moveTo(sx - isoX * 0.5, sy - stoneHeight * 0.3);
        ctx.lineTo(sx - isoX * 0.3, sy - stoneHeight * 0.5);
        ctx.moveTo(sx + isoX * 0.4, sy - isoY * 0.4 - stoneHeight * 0.6);
        ctx.lineTo(sx + isoX * 0.6, sy - isoY * 0.6 - stoneHeight * 0.4);
        ctx.stroke();

        // Carved runes on stones - NO SHADOW for performance
        const stoneRuneActive = powerStage > 0;
        const runeY = sy - stoneHeight * 0.5;
        ctx.font = `bold ${7 * s2}px serif`;
        ctx.textAlign = "center";

        if (stoneRuneActive) {
          const runePulse = Math.sin(time * 3 + i * 0.8) * 0.3 + 0.7;

          // Brighter colors instead of shadow blur
          ctx.fillStyle = `rgba(100, 255, 255, ${runePulse * powerIntensity})`;
          ctx.fillText(
            elderFuthark[(i * 3) % elderFuthark.length],
            sx - isoX * 0.5,
            runeY - isoY * 0.3,
          );

          ctx.fillStyle = `rgba(80, 240, 255, ${runePulse * powerIntensity * 0.85})`;
          ctx.fillText(
            elderFuthark[(i * 3 + 1) % elderFuthark.length],
            sx + isoX * 0.5,
            runeY - isoY * 0.3,
          );

          ctx.fillStyle = `rgba(60, 220, 255, ${runePulse * powerIntensity * 0.6})`;
          ctx.font = `bold ${5 * s2}px serif`;
          ctx.fillText(
            elderFuthark[(i * 3 + 2) % elderFuthark.length],
            sx - isoX * 0.5,
            runeY + 8 * s2,
          );

          // Glowing top edge when active
          ctx.strokeStyle = `rgba(0, 229, 255, ${runePulse * powerIntensity * 0.5})`;
          ctx.lineWidth = 1 * s2;
          ctx.beginPath();
          ctx.moveTo(sx, sy - stoneHeight);
          ctx.lineTo(sx - isoX, sy - isoY - stoneHeight);
          ctx.lineTo(sx - isoX + depthX, sy - isoY - depthY - stoneHeight);
          ctx.lineTo(sx + depthX, sy - depthY - stoneHeight);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(80, 100, 110, 0.5)`;
          ctx.fillText(
            elderFuthark[(i * 3) % elderFuthark.length],
            sx - isoX * 0.5,
            runeY - isoY * 0.3,
          );
          ctx.fillStyle = `rgba(90, 110, 120, 0.4)`;
          ctx.fillText(
            elderFuthark[(i * 3 + 1) % elderFuthark.length],
            sx + isoX * 0.5,
            runeY - isoY * 0.3,
          );
        }

        ctx.restore();

        // Energy connection lines from stones to center (stage 2+) - NO SHADOW
        if (drawEnergyLine && powerStage >= 2) {
          const lineAlpha = 0.3 + fastPulse * 0.4;
          ctx.strokeStyle = `rgba(0, 229, 255, ${lineAlpha})`;
          ctx.lineWidth = 1.5 * s2;
          ctx.setLineDash([4 * s2, 4 * s2]);
          ctx.beginPath();
          ctx.moveTo(sx, sy - stoneHeight * 0.5);
          ctx.lineTo(0, -30 * s2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      };

      // Determine which monoliths are "back" (should render before spire)
      // Back monoliths have negative sin(angle), meaning they're at the top of the isometric view
      const backMonoliths: number[] = [];
      const frontMonoliths: number[] = [];
      for (let i = 0; i < stoneCount; i++) {
        const stoneAngle = (i / stoneCount) * Math.PI * 2 - Math.PI / 2;
        if (Math.sin(stoneAngle) < 0) {
          backMonoliths.push(i);
        } else {
          frontMonoliths.push(i);
        }
      }

      // =====================================================
      // 2a. DRAW BACK MONOLITHS (behind the spire)
      // =====================================================
      for (const i of backMonoliths) {
        drawMonolith(i, true);
      }

      // =====================================================
      // 2b. TIERED OBSIDIAN/CRYSTAL BASE PLATFORM
      // =====================================================
      const drawHexPlatform = (
        hw: number,
        hh: number,
        y: number,
        c1: string,
        c2: string,
        c3: string,
        glowColor?: string,
      ) => {
        ctx.save();
        ctx.translate(0, y + 4 * s2);

        // Left face
        const leftGrad = ctx.createLinearGradient(-hw, 0, 0, 0);
        leftGrad.addColorStop(0, c1);
        leftGrad.addColorStop(1, c2);
        ctx.fillStyle = leftGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-hw, -hw * tanA);
        ctx.lineTo(-hw, -hw * tanA - hh);
        ctx.lineTo(0, -hh);
        ctx.fill();

        // Right face
        const rightGrad = ctx.createLinearGradient(0, 0, hw, 0);
        rightGrad.addColorStop(0, c2);
        rightGrad.addColorStop(1, c1);
        ctx.fillStyle = rightGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(hw, -hw * tanA);
        ctx.lineTo(hw, -hw * tanA - hh);
        ctx.lineTo(0, -hh);
        ctx.fill();

        // Top face
        ctx.fillStyle = c3;
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(-hw, -hw * tanA - hh);
        ctx.lineTo(0, -hw * tanA * 2 - hh);
        ctx.lineTo(hw, -hw * tanA - hh);
        ctx.fill();

        // Edge highlights - no shadow for performance
        if (glowColor && powerStage > 0) {
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 1.5 * s2;
          ctx.beginPath();
          ctx.moveTo(-hw, -hw * tanA - hh);
          ctx.lineTo(0, -hw * tanA * 2 - hh);
          ctx.lineTo(hw, -hw * tanA - hh);
          ctx.stroke();
        }

        ctx.restore();
      };

      // Bottom tier
      drawHexPlatform(
        24 * s2,
        8 * s2,
        8 * s2,
        "#37474F",
        "#455A64",
        "#546E7A",
        powerStage > 0
          ? `rgba(0, 229, 255, ${0.3 * powerIntensity})`
          : undefined,
      );
      // Middle tier
      drawHexPlatform(
        18 * s2,
        6 * s2,
        -4 * s2,
        "#2C3E50",
        "#34495E",
        "#4A5568",
        powerStage > 0
          ? `rgba(0, 229, 255, ${0.4 * powerIntensity})`
          : undefined,
      );
      // Top tier (crystal-like)
      drawHexPlatform(
        12 * s2,
        5 * s2,
        -14 * s2,
        "#1a2a3a",
        "#243447",
        "#2d3d4d",
        powerStage > 0
          ? `rgba(0, 229, 255, ${0.5 * powerIntensity})`
          : undefined,
      );

      // =====================================================
      // 3. THE CENTRAL OBELISK SPIRE (FLAT SQUARE TOP)
      // =====================================================
      const spireW = 8 * s2;
      const spireH = 65 * s2;
      const baseY = -20 * s2;
      const topW = 5 * s2; // Width of flat square top
      const topY = baseY - spireH;

      // Spire left face (trapezoid shape - wider at bottom, narrower flat top)
      const spireGradL = ctx.createLinearGradient(-spireW, baseY, 0, topY);
      spireGradL.addColorStop(0, "#1a2a3a");
      spireGradL.addColorStop(0.5, "#243447");
      spireGradL.addColorStop(1, "#0d1a26");
      ctx.fillStyle = spireGradL;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(-spireW, baseY - spireW * tanA);
      ctx.lineTo(-topW, topY - topW * tanA);
      ctx.lineTo(0, topY);
      ctx.fill();

      // Spire right face
      const spireGradR = ctx.createLinearGradient(0, baseY, spireW, topY);
      spireGradR.addColorStop(0, "#2d3d4d");
      spireGradR.addColorStop(0.5, "#3d4d5d");
      spireGradR.addColorStop(1, "#1a2a3a");
      ctx.fillStyle = spireGradR;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(spireW, baseY - spireW * tanA);
      ctx.lineTo(topW, topY - topW * tanA);
      ctx.lineTo(0, topY);
      ctx.fill();

      // Flat square top surface (isometric diamond)
      const topGrad = ctx.createLinearGradient(-topW, topY, topW, topY);
      topGrad.addColorStop(0, "#3d5060");
      topGrad.addColorStop(0.5, "#4a6070");
      topGrad.addColorStop(1, "#3d5060");
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(-topW, topY - topW * tanA);
      ctx.lineTo(0, topY - topW * tanA * 2);
      ctx.lineTo(topW, topY - topW * tanA);
      ctx.closePath();
      ctx.fill();

      // Top surface glow effect (power dependent)
      if (powerStage > 0) {
        const topGlowAlpha = 0.3 + basePulse * 0.4 * powerIntensity;
        ctx.fillStyle = `rgba(0, 229, 255, ${topGlowAlpha * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(0, topY);
        ctx.lineTo(-topW, topY - topW * tanA);
        ctx.lineTo(0, topY - topW * tanA * 2);
        ctx.lineTo(topW, topY - topW * tanA);
        ctx.closePath();
        ctx.fill();
      }

      // Spire edge highlights (power dependent) - reduced shadow
      if (powerStage > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(100, 255, 255, ${0.4 + basePulse * 0.4 * powerIntensity})`;
        ctx.lineWidth = 1.5 * s2;
        // Only use shadow on stage 3 (ascended)
        if (powerStage === 3) {
          ctx.shadowBlur = 8 * s2;
          ctx.shadowColor = colors.glow;
        }

        // Left edge
        ctx.beginPath();
        ctx.moveTo(-spireW, baseY - spireW * tanA);
        ctx.lineTo(-topW, topY - topW * tanA);
        ctx.stroke();

        // Right edge
        ctx.beginPath();
        ctx.moveTo(spireW, baseY - spireW * tanA);
        ctx.lineTo(topW, topY - topW * tanA);
        ctx.stroke();

        // Top edges
        ctx.beginPath();
        ctx.moveTo(-topW, topY - topW * tanA);
        ctx.lineTo(0, topY - topW * tanA * 2);
        ctx.lineTo(topW, topY - topW * tanA);
        ctx.stroke();

        ctx.restore();
      }

      // =====================================================
      // 4. CARVED RUNES ON SPIRE (SCROLLING) - NO SHADOW for performance
      // =====================================================
      const runeRows = 4 + powerStage;
      const scrollSpeed = powerStage === 0 ? 0 : 8 + powerStage * 4;
      const scroll = (time * scrollSpeed) % 60;

      ctx.save();
      ctx.font = `bold ${(6 + powerStage) * s2}px serif`;
      ctx.textAlign = "center";
      for (let face = 0; face < 2; face++) {
        const side = face === 0 ? -1 : 1;

        for (let r = 0; r < runeRows; r++) {
          const baseRuneY = baseY - 15 * s2 - r * 12 * s2 + scroll * s2;
          if (
            baseRuneY > baseY - 5 * s2 ||
            baseRuneY < baseY - spireH + 10 * s2
          )
            continue;

          const heightProgress = (baseY - baseRuneY) / spireH;
          const xOffset = side * (spireW * 0.6 * (1 - heightProgress * 0.7));
          const yOffset = baseRuneY + Math.abs(xOffset) * tanA * 0.5;

          // Rune visibility based on stage - brighter colors instead of shadow
          const runeActive = powerStage > 0;
          const runeBrightness = runeActive
            ? (0.5 +
                basePulse * 0.4 +
                (r === Math.floor(time * 3) % runeRows ? 0.2 : 0)) *
              powerIntensity
            : 0.15;

          ctx.fillStyle = runeActive
            ? `rgba(80, 255, 255, ${runeBrightness})`
            : `rgba(80, 100, 120, ${runeBrightness})`;
          ctx.fillText(
            elderFuthark[(r + face * 5) % elderFuthark.length],
            xOffset,
            yOffset,
          );
        }
      }
      ctx.restore();

      // =====================================================
      // 5. ORBITAL RUNE RINGS (MORE AT HIGHER STAGES)
      // =====================================================
      const ringCount = 1 + powerStage;
      for (let ring = 0; ring < ringCount; ring++) {
        ctx.save();
        const ringY =
          baseY -
          25 * s2 -
          ring * 18 * s2 +
          Math.sin(time * 1.5 + ring) * 3 * s2;
        const ringRadius = (16 + ring * 4) * s2;
        const rotationSpeed = (ring % 2 === 0 ? 1 : -1) * (0.5 + ring * 0.3);
        const ringRotation = time * rotationSpeed;

        ctx.translate(0, ringY);
        ctx.scale(1, 0.45);
        ctx.rotate(ringRotation);

        // Ring base (dashed line)
        const ringAlpha = powerStage === 0 ? 0.15 : 0.25 + basePulse * 0.25;
        ctx.strokeStyle = `rgba(0, 229, 255, ${ringAlpha * powerIntensity})`;
        ctx.lineWidth = (1.5 + powerStage * 0.5) * s2;
        ctx.setLineDash([(6 + powerStage * 2) * s2, (8 - powerStage) * s2]);
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Floating runes on ring (stage 1+) - NO SHADOW for performance
        if (powerStage > 0) {
          const runesOnRing = 4 + ring * 2;
          ctx.font = `bold ${(5 + powerStage) * s2}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          for (let i = 0; i < runesOnRing; i++) {
            const runeAngle = (i / runesOnRing) * Math.PI * 2;
            const runeX = Math.cos(runeAngle) * ringRadius;
            const runeY = Math.sin(runeAngle) * ringRadius;
            const runeAlpha = 0.6 + Math.sin(time * 4 + i + ring) * 0.3;

            ctx.save();
            ctx.rotate(-ringRotation);
            ctx.scale(1, 1 / 0.45);
            ctx.translate(runeX * 0.45, runeY);

            ctx.fillStyle = `rgba(80, 255, 255, ${runeAlpha * powerIntensity})`;
            ctx.fillText(
              elderFuthark[(i + ring * 4) % elderFuthark.length],
              0,
              0,
            );
            ctx.restore();
          }
        }

        ctx.restore();
      }

      // =====================================================
      // 8. ENERGY BEAMS (STAGE 3 - ASCENDED)
      // =====================================================
      const coreY = baseY - spireH - 18 * s2 + Math.sin(time * 2) * 4 * s2;
      const coreSize = (12 + powerStage * 3) * s2;
      if (powerStage === 3) {
        // Vertical beam to sky
        const beamGrad = ctx.createLinearGradient(0, coreY, 0, coreY - 80 * s2);
        beamGrad.addColorStop(0, `rgba(0, 229, 255, ${0.6 + fastPulse * 0.3})`);
        beamGrad.addColorStop(
          0.5,
          `rgba(0, 229, 255, ${0.3 + fastPulse * 0.2})`,
        );
        beamGrad.addColorStop(1, "transparent");

        ctx.save();
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-4 * s2, coreY);
        ctx.lineTo(-2 * s2, coreY - 80 * s2);
        ctx.lineTo(2 * s2, coreY - 80 * s2);
        ctx.lineTo(4 * s2, coreY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Horizontal energy waves
        for (let wave = 0; wave < 3; wave++) {
          const waveY = coreY + wave * 25 * s2;
          const wavePhase = (time * 2 + wave * 0.5) % 1;
          const waveRadius = 20 * s2 + wavePhase * 40 * s2;
          const waveAlpha = (1 - wavePhase) * 0.4;

          ctx.save();
          ctx.strokeStyle = `rgba(0, 229, 255, ${waveAlpha})`;
          ctx.lineWidth = 2 * s2;
          ctx.beginPath();
          ctx.ellipse(
            0,
            waveY,
            waveRadius,
            waveRadius * 0.4,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
          ctx.restore();
        }
      }

      // =====================================================
      // 6. THE CORE NEXUS SPHERE (TOP OF SPIRE)
      // =====================================================

      // Outer energy aura (stage 2+)
      if (powerStage >= 2) {
        const auraSize = coreSize * 2.5 + Math.sin(time * 4) * 5 * s2;
        const auraGrad = ctx.createRadialGradient(
          0,
          coreY,
          0,
          0,
          coreY,
          auraSize,
        );
        auraGrad.addColorStop(0, `rgba(0, 229, 255, ${0.3 * powerIntensity})`);
        auraGrad.addColorStop(
          0.5,
          `rgba(0, 180, 220, ${0.15 * powerIntensity})`,
        );
        auraGrad.addColorStop(1, "transparent");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, coreY, auraSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core glow field - reduced shadow for performance
      ctx.save();
      ctx.shadowBlur = powerStage >= 2 ? 15 * s2 : 8 * s2;
      ctx.shadowColor = colors.glow;

      const coreGrad = ctx.createRadialGradient(
        0,
        coreY,
        0,
        0,
        coreY,
        coreSize,
      );
      if (powerStage === 3) {
        // Ascended - blazing white core
        coreGrad.addColorStop(0, "#FFFFFF");
        coreGrad.addColorStop(0.2, "#F0FFFF");
        coreGrad.addColorStop(0.5, "#80FFFF");
        coreGrad.addColorStop(0.8, "#00E5FF");
        coreGrad.addColorStop(1, "transparent");
      } else if (powerStage === 2) {
        // Empowered - bright cyan
        coreGrad.addColorStop(0, "#FFFFFF");
        coreGrad.addColorStop(0.3, "#B2EBF2");
        coreGrad.addColorStop(0.6, "#00E5FF");
        coreGrad.addColorStop(1, "transparent");
      } else if (powerStage === 1) {
        // Awakening - soft cyan
        coreGrad.addColorStop(0, "#E0F7FA");
        coreGrad.addColorStop(0.4, "#80DEEA");
        coreGrad.addColorStop(0.7, "#26C6DA");
        coreGrad.addColorStop(1, "transparent");
      } else {
        // Dormant - dim grey
        coreGrad.addColorStop(0, "#B0BEC5");
        coreGrad.addColorStop(0.4, "#78909C");
        coreGrad.addColorStop(0.7, "#546E7A");
        coreGrad.addColorStop(1, "transparent");
      }

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, coreY, coreSize, 0, Math.PI * 2);
      ctx.fill();

      // Inner core (bright center)
      if (powerStage > 0) {
        const innerSize = coreSize * 0.4;
        ctx.fillStyle =
          powerStage === 3
            ? "#FFFFFF"
            : `rgba(255, 255, 255, ${0.6 + fastPulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(0, coreY, innerSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // =====================================================
      // 7. DRAW FRONT MONOLITHS (in front of the spire)
      // =====================================================
      for (const i of frontMonoliths) {
        drawMonolith(i, true);
      }

      // =====================================================
      // 8. PARTICLE EFFECTS & ENERGY SPARKS - NO SHADOW for performance
      // =====================================================
      // Rising energy particles - reduced count and no shadows
      const particleCount = powerStage * 2; // Reduced from *4
      for (let i = 0; i < particleCount; i++) {
        const particlePhase = (time * 0.8 + i * 0.3) % 2;
        const particleY = baseY - particlePhase * 50 * s2;
        const particleX = Math.sin(time * 2 + i * 1.5) * 15 * s2;
        const particleAlpha = (1 - particlePhase / 2) * 0.8;
        const particleSize = (2 + Math.sin(time * 5 + i) * 1) * s2;

        if (particlePhase < 1.8) {
          ctx.fillStyle = `rgba(150, 255, 255, ${particleAlpha})`;
          ctx.beginPath();
          ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Occasional lightning/energy sparks (stage 2+) - no shadow
      if (powerStage >= 2 && Math.random() > 0.92) {
        ctx.strokeStyle = `rgba(200, 255, 255, ${0.6 + Math.random() * 0.4})`;
        ctx.lineWidth = 1 * s2;
        ctx.beginPath();
        const sparkStartY = coreY + 10 * s2;
        ctx.moveTo(0, sparkStartY);
        let sparkX = 0,
          sparkY = sparkStartY;
        for (let seg = 0; seg < 3; seg++) {
          sparkX += (Math.random() - 0.5) * 15 * s2;
          sparkY += (8 + Math.random() * 8) * s2;
          ctx.lineTo(sparkX, sparkY);
        }
        ctx.stroke();
      }

      // =====================================================
      // 9. AMBIENT RUNE PARTICLES (FLOATING) - NO SHADOW for performance
      // =====================================================
      if (powerStage >= 1) {
        const floatingRuneCount = powerStage; // Reduced from *2
        ctx.font = `${(6 + powerStage) * s2}px serif`;
        ctx.textAlign = "center";
        for (let i = 0; i < floatingRuneCount; i++) {
          const floatPhase = (time * 0.3 + i * 0.7) % 3;
          const floatY = 10 * s2 - floatPhase * 40 * s2;
          const floatX = Math.sin(time * 0.8 + i * 2.1) * (25 + i * 5) * s2;
          const floatAlpha = Math.sin((floatPhase / 3) * Math.PI) * 0.5;

          if (floatAlpha > 0.05) {
            ctx.fillStyle = `rgba(100, 255, 255, ${floatAlpha})`;
            ctx.fillText(
              elderFuthark[(i * 7) % elderFuthark.length],
              floatX,
              floatY,
            );
          }
        }
      }

      break;
    }

    case "chrono_relay": {
      drawChronoRelayBuilding(ctx, s, time, boostedTowerCount);
      break;
    }

    case "sentinel_nexus": {
      drawSentinelNexusBuilding(ctx, s, time, chargeProgress);
      break;
    }

    case "sunforge_orrery": {
      drawSunforgeOrreryBuilding(
        ctx,
        s,
        time,
        boostedTowerCount,
        chargeProgress,
      );
      break;
    }

    case "vault": {
      const hpPct =
        specialTowerHp !== null && specHp
          ? Math.min(specialTowerHp / specHp, 1)
          : 1;
      const isFlashing = vaultFlash > 0;
      const s2 = s * 1.2;

      const w = 26 * s2;
      const h = 36 * s2;
      const tanAngle = ISO_TAN;
      const roofOffset = w * tanAngle * 2;

      // Center the iso diamond on the tile (bottom vertex was at origin)
      ctx.translate(0, w * tanAngle);

      // Ground Shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(0, -w * tanAngle, 38 * s2, 20 * s2, 0, 0, Math.PI * 2);
      ctx.fill();

      // STATE: DESTROYED
      if (
        hpPct <= 0 ||
        specHp === 0 ||
        (specHp !== undefined && specialTowerHp === null)
      ) {
        const dBaseH = 8 * s2;
        const stubH = h * 0.38;
        const rStubH = h * 0.22;

        // Scorched ground base with radial burn
        const rubbleGrad = ctx.createRadialGradient(
          0,
          -w * tanAngle * 0.5,
          0,
          0,
          -w * tanAngle * 0.5,
          w * 1.4,
        );
        rubbleGrad.addColorStop(0, "#2A1F15");
        rubbleGrad.addColorStop(0.6, "#3D3228");
        rubbleGrad.addColorStop(1, "#4A4035");
        ctx.fillStyle = rubbleGrad;
        ctx.beginPath();
        ctx.moveTo(-w - 6 * s2, 0);
        ctx.lineTo(0, 10 * s2);
        ctx.lineTo(w + 8 * s2, 2 * s2);
        ctx.lineTo(0, -w * tanAngle * 2 - 4 * s2);
        ctx.closePath();
        ctx.fill();

        // Scorch marks on ground
        ctx.fillStyle = "rgba(15, 10, 5, 0.35)";
        ctx.beginPath();
        ctx.ellipse(-5 * s2, -4 * s2, 14 * s2, 7 * s2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8 * s2, -7 * s2, 11 * s2, 5 * s2, 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Broken left wall stub with jagged top
        const lWallGrad = ctx.createLinearGradient(
          -w,
          -dBaseH - w * tanAngle,
          0,
          -dBaseH,
        );
        lWallGrad.addColorStop(0, "#4A3A2A");
        lWallGrad.addColorStop(1, "#6B5B4B");
        ctx.fillStyle = lWallGrad;
        ctx.beginPath();
        ctx.moveTo(0, -dBaseH);
        ctx.lineTo(-w, -dBaseH - w * tanAngle);
        ctx.lineTo(-w, -dBaseH - w * tanAngle - stubH);
        ctx.lineTo(-w * 0.78, -dBaseH - w * tanAngle * 0.78 - stubH - 4 * s2);
        ctx.lineTo(-w * 0.55, -dBaseH - w * tanAngle * 0.55 - stubH + 3 * s2);
        ctx.lineTo(-w * 0.3, -dBaseH - w * tanAngle * 0.3 - stubH - 2 * s2);
        ctx.lineTo(0, -dBaseH - stubH + 6 * s2);
        ctx.closePath();
        ctx.fill();

        // Inner wall thickness visible on jagged edge
        ctx.fillStyle = "#3D2E20";
        ctx.beginPath();
        ctx.moveTo(-w * 0.78, -dBaseH - w * tanAngle * 0.78 - stubH - 4 * s2);
        ctx.lineTo(-w * 0.78, -dBaseH - w * tanAngle * 0.78 - stubH - 1 * s2);
        ctx.lineTo(-w * 0.55, -dBaseH - w * tanAngle * 0.55 - stubH + 6 * s2);
        ctx.lineTo(-w * 0.55, -dBaseH - w * tanAngle * 0.55 - stubH + 3 * s2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#352A1E";
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, -dBaseH - w * tanAngle * 0.3 - stubH - 2 * s2);
        ctx.lineTo(-w * 0.3, -dBaseH - w * tanAngle * 0.3 - stubH + 1 * s2);
        ctx.lineTo(0, -dBaseH - stubH + 9 * s2);
        ctx.lineTo(0, -dBaseH - stubH + 6 * s2);
        ctx.closePath();
        ctx.fill();

        // Stone course lines on left wall stub
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.7 * s2;
        for (let row = 0; row < 3; row++) {
          const frac = 0.15 + row * 0.28;
          const ry = -dBaseH - stubH * frac;
          ctx.beginPath();
          ctx.moveTo(-w + 3 * s2, ry - (w - 3 * s2) * tanAngle);
          ctx.lineTo(-3 * s2, ry);
          ctx.stroke();
        }

        // Cracks on left wall
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1 * s2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.85, -dBaseH - w * tanAngle * 0.85 - stubH * 0.2);
        ctx.lineTo(-w * 0.6, -dBaseH - w * tanAngle * 0.6 - stubH * 0.5);
        ctx.lineTo(-w * 0.45, -dBaseH - w * tanAngle * 0.45 - stubH * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w * 0.4, -dBaseH - w * tanAngle * 0.4);
        ctx.lineTo(-w * 0.25, -dBaseH - w * tanAngle * 0.25 - stubH * 0.35);
        ctx.stroke();

        // Shorter right wall fragment
        const rWallGrad = ctx.createLinearGradient(
          0,
          -dBaseH,
          w,
          -dBaseH - w * tanAngle,
        );
        rWallGrad.addColorStop(0, "#8A7A65");
        rWallGrad.addColorStop(1, "#6B5B48");
        ctx.fillStyle = rWallGrad;
        ctx.beginPath();
        ctx.moveTo(0, -dBaseH);
        ctx.lineTo(w, -dBaseH - w * tanAngle);
        ctx.lineTo(w, -dBaseH - w * tanAngle - rStubH);
        ctx.lineTo(w * 0.65, -dBaseH - w * tanAngle * 0.65 - rStubH + 2 * s2);
        ctx.lineTo(w * 0.35, -dBaseH - w * tanAngle * 0.35 - rStubH - 3 * s2);
        ctx.lineTo(0, -dBaseH - rStubH + 3 * s2);
        ctx.closePath();
        ctx.fill();

        // Inner wall edge on right stub
        ctx.fillStyle = "#5A4A38";
        ctx.beginPath();
        ctx.moveTo(w * 0.65, -dBaseH - w * tanAngle * 0.65 - rStubH + 2 * s2);
        ctx.lineTo(w * 0.65, -dBaseH - w * tanAngle * 0.65 - rStubH + 5 * s2);
        ctx.lineTo(w * 0.35, -dBaseH - w * tanAngle * 0.35 - rStubH);
        ctx.lineTo(w * 0.35, -dBaseH - w * tanAngle * 0.35 - rStubH - 3 * s2);
        ctx.closePath();
        ctx.fill();

        // Scattered rubble blocks with highlights/shadows
        const rubble = [
          { x: w * 0.55, y: -3 * s2, bw: 8, bh: 5, rot: 0.3, c: "#6B5D4D" },
          { x: w * 0.25, y: 4 * s2, bw: 10, bh: 6, rot: -0.5, c: "#5A4A3A" },
          { x: -w * 0.45, y: 5 * s2, bw: 7, bh: 4, rot: 0.8, c: "#7A6A55" },
          { x: -w * 0.85, y: -1 * s2, bw: 9, bh: 5, rot: -0.2, c: "#6B5D4D" },
          { x: w * 0.8, y: -5 * s2, bw: 6, bh: 4, rot: 1.1, c: "#5A4A3A" },
          { x: -2 * s2, y: 7 * s2, bw: 11, bh: 6, rot: -0.35, c: "#8B7355" },
          { x: -w * 0.6, y: 4 * s2, bw: 5, bh: 3, rot: 0.6, c: "#4A3A2A" },
          { x: w * 0.45, y: -8 * s2, bw: 7, bh: 4, rot: -0.7, c: "#6B5D4D" },
          { x: -w * 0.15, y: -10 * s2, bw: 6, bh: 4, rot: 0.4, c: "#5A4A3A" },
          { x: w * 0.1, y: 2 * s2, bw: 5, bh: 3, rot: -0.9, c: "#7A6A55" },
        ];
        rubble.forEach((b) => {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rot);
          ctx.fillStyle = b.c;
          ctx.fillRect(
            (-b.bw / 2) * s2,
            (-b.bh / 2) * s2,
            b.bw * s2,
            b.bh * s2,
          );
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect((-b.bw / 2) * s2, (-b.bh / 2) * s2, b.bw * s2, 1.5 * s2);
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fillRect(
            (-b.bw / 2) * s2,
            (b.bh / 2 - 1.5) * s2,
            b.bw * s2,
            1.5 * s2,
          );
          ctx.restore();
        });

        // Fallen vault door lying cracked among rubble
        ctx.save();
        ctx.translate(w * 0.3, -2 * s2);
        ctx.rotate(0.12);

        ctx.fillStyle = "#3A3025";
        ctx.strokeStyle = "#2A1F15";
        ctx.lineWidth = 2 * s2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 13 * s2, 10 * s2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bolt ring
        ctx.strokeStyle = "#2D2520";
        ctx.lineWidth = 1 * s2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 11 * s2, 8.5 * s2, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let bolt = 0; bolt < 8; bolt++) {
          const ba = (bolt * Math.PI * 2) / 8;
          ctx.fillStyle = "#352D25";
          ctx.beginPath();
          ctx.arc(
            Math.cos(ba) * 11 * s2,
            Math.sin(ba) * 8.5 * s2,
            1.2 * s2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }

        // Inner ring
        ctx.fillStyle = "#4A4035";
        ctx.strokeStyle = "#35302A";
        ctx.lineWidth = 1 * s2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 9 * s2, 7 * s2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dial face
        ctx.fillStyle = "#55504A";
        ctx.beginPath();
        ctx.ellipse(0, 0, 5.5 * s2, 4.2 * s2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Broken spokes
        ctx.strokeStyle = "#2A2018";
        ctx.lineWidth = 1.3 * s2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(4.5 * s2, -2.8 * s2);
        ctx.moveTo(0, 0);
        ctx.lineTo(-3.5 * s2, 3 * s2);
        ctx.moveTo(0, 0);
        ctx.lineTo(-2 * s2, -3.5 * s2);
        ctx.stroke();

        // Crack across the door
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1.2 * s2;
        ctx.beginPath();
        ctx.moveTo(-11 * s2, -3 * s2);
        ctx.lineTo(-4 * s2, 1 * s2);
        ctx.lineTo(3 * s2, -2 * s2);
        ctx.lineTo(12 * s2, 1 * s2);
        ctx.stroke();
        ctx.restore();

        // Bent handle bar nearby
        ctx.save();
        ctx.translate(w * 0.7, -6 * s2);
        ctx.rotate(-0.4);
        ctx.fillStyle = "#3A3025";
        ctx.fillRect(-1.5 * s2, -6 * s2, 3 * s2, 12 * s2);
        ctx.fillStyle = "#4A4035";
        ctx.beginPath();
        ctx.arc(0, -6 * s2, 2.5 * s2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Warm ember glow from within the ruins
        const emberGlow = ctx.createRadialGradient(
          -w * 0.15,
          -dBaseH - stubH * 0.3,
          0,
          -w * 0.15,
          -dBaseH - stubH * 0.3,
          22 * s2,
        );
        emberGlow.addColorStop(
          0,
          `rgba(255, 110, 35, ${0.08 + Math.sin(time * 2) * 0.03})`,
        );
        emberGlow.addColorStop(0.4, "rgba(255, 70, 15, 0.04)");
        emberGlow.addColorStop(1, "transparent");
        ctx.fillStyle = emberGlow;
        ctx.beginPath();
        ctx.arc(-w * 0.15, -dBaseH - stubH * 0.3, 22 * s2, 0, Math.PI * 2);
        ctx.fill();

        // Smoke wisps rising from multiple points
        for (let i = 0; i < 5; i++) {
          const sp = (time * 0.7 + i * 1.3) % 5;
          const sa = Math.max(0, 0.25 - sp * 0.05);
          const sx = Math.sin(time * 0.4 + i * 2.2) * 7 * s2 + (i - 2) * 5 * s2;
          const sy = -dBaseH - stubH * 0.4 - sp * 14 * s2;
          const sr = (3 + sp * 2.8) * s2;
          ctx.fillStyle = `rgba(55, 50, 45, ${sa})`;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Floating ember particles
        for (let i = 0; i < 4; i++) {
          const ep = (time * 1.3 + i * 1.7) % 3;
          const ea = Math.max(0, 0.7 - ep * 0.25);
          const ex = Math.sin(time * 1.1 + i * 2.8) * 14 * s2;
          const ey = -dBaseH - stubH * 0.2 - ep * 20 * s2;
          const hueVal = 140 + Math.sin(time * 4 + i) * 70;
          ctx.fillStyle = `rgba(255, ${Math.round(hueVal)}, 25, ${ea})`;
          ctx.beginPath();
          ctx.arc(
            ex,
            ey,
            (0.8 + Math.sin(time * 3 + i) * 0.4) * s2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }

        // Dust motes drifting
        for (let i = 0; i < 3; i++) {
          const dp = (time * 0.4 + i * 2.5) % 4;
          const da = 0.15 - dp * 0.035;
          if (da > 0) {
            const dx = Math.sin(time * 0.3 + i * 4) * w * 0.6;
            const dy = -w * tanAngle - dp * 8 * s2;
            ctx.fillStyle = `rgba(180, 170, 150, ${da})`;
            ctx.beginPath();
            ctx.arc(dx, dy, (2 + dp) * s2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      // STATE: ACTIVE VAULT
      const c = isFlashing
        ? {
            baseLight: "#E8E8E8",
            baseDark: "#C0C0C0",
            wallLeft: "#D4A5A5",
            wallRight: "#E8BFBF",
            wallTop: "#F0D0D0",
            frame: "#CC8080",
            trim: "#B06060",
            dark: "#6B3030",
            accent: "#FFFFFF",
            glow: "#FF6B6B",
          }
        : {
            baseLight: "#686868",
            baseDark: "#424242",
            wallLeft: "#7E6B52",
            wallRight: "#9C8464",
            wallTop: "#B09A7A",
            frame: "#6E5540",
            trim: "#90704E",
            dark: "#2D2118",
            accent: "#C8A860",
            glow: "#4CB898",
          };

      // Stone Foundation Base
      const baseH = 10 * s2;
      const bw = w + 4 * s2;
      const bTan = tanAngle;

      // Left face
      const baseGradL = ctx.createLinearGradient(-bw, 0, 0, 0);
      baseGradL.addColorStop(0, "#262626");
      baseGradL.addColorStop(0.5, c.baseDark);
      baseGradL.addColorStop(1, "#4A4A4A");
      ctx.fillStyle = baseGradL;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-bw, -bw * bTan);
      ctx.lineTo(-bw, -bw * bTan - baseH);
      ctx.lineTo(0, -baseH);
      ctx.fill();

      // Right face
      const baseGradR = ctx.createLinearGradient(0, 0, bw, 0);
      baseGradR.addColorStop(0, "#585858");
      baseGradR.addColorStop(0.5, c.baseLight);
      baseGradR.addColorStop(1, "#4A4A4A");
      ctx.fillStyle = baseGradR;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(bw, -bw * bTan);
      ctx.lineTo(bw, -bw * bTan - baseH);
      ctx.lineTo(0, -baseH);
      ctx.fill();

      // Top face
      const baseTopGrad = ctx.createLinearGradient(
        -bw,
        -bw * bTan - baseH,
        bw,
        -bw * bTan - baseH,
      );
      baseTopGrad.addColorStop(0, "#484848");
      baseTopGrad.addColorStop(0.5, "#555555");
      baseTopGrad.addColorStop(1, "#4A4A4A");
      ctx.fillStyle = baseTopGrad;
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(-bw, -bw * bTan - baseH);
      ctx.lineTo(0, -bw * bTan * 2 - baseH);
      ctx.lineTo(bw, -bw * bTan - baseH);
      ctx.closePath();
      ctx.fill();

      // Iron banding — horizontal bands across foundation
      ctx.strokeStyle = "rgba(0,0,0,0.22)";
      ctx.lineWidth = 1.2 * s2;
      ctx.beginPath();
      ctx.moveTo(0, -baseH * 0.45);
      ctx.lineTo(-bw, -bw * bTan - baseH * 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -baseH * 0.45);
      ctx.lineTo(bw, -bw * bTan - baseH * 0.45);
      ctx.stroke();

      // Highlight edge on top of foundation
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1 * s2;
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(-bw, -bw * bTan - baseH);
      ctx.moveTo(0, -baseH);
      ctx.lineTo(bw, -bw * bTan - baseH);
      ctx.stroke();

      // Corner rivets on foundation
      const foundRivets = [
        { x: 0, y: -baseH * 0.45 },
        { x: -bw * 0.5, y: -bw * bTan * 0.5 - baseH * 0.45 },
        { x: bw * 0.5, y: -bw * bTan * 0.5 - baseH * 0.45 },
      ];
      foundRivets.forEach((rv) => {
        ctx.fillStyle = "#383838";
        ctx.beginPath();
        ctx.arc(rv.x, rv.y, 2 * s2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath();
        ctx.arc(rv.x - 0.4 * s2, rv.y - 0.4 * s2, 0.8 * s2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Main Vault Body
      const bodyY = -baseH;

      // Left wall
      const wallGradL = ctx.createLinearGradient(
        -w,
        bodyY - w * tanAngle,
        0,
        bodyY,
      );
      wallGradL.addColorStop(0, "#4E4030");
      wallGradL.addColorStop(0.3, c.wallLeft);
      wallGradL.addColorStop(0.8, "#6E5E4E");
      wallGradL.addColorStop(1, "#5A4A3A");
      ctx.fillStyle = wallGradL;
      ctx.beginPath();
      ctx.moveTo(0, bodyY);
      ctx.lineTo(-w, bodyY - w * tanAngle);
      ctx.lineTo(-w, bodyY - w * tanAngle - h);
      ctx.lineTo(0, bodyY - h);
      ctx.closePath();
      ctx.fill();

      // Right wall
      const wallGradR = ctx.createLinearGradient(
        0,
        bodyY,
        w,
        bodyY - w * tanAngle,
      );
      wallGradR.addColorStop(0, "#A89474");
      wallGradR.addColorStop(0.3, c.wallRight);
      wallGradR.addColorStop(0.8, "#8A7A64");
      wallGradR.addColorStop(1, "#7A6A55");
      ctx.fillStyle = wallGradR;
      ctx.beginPath();
      ctx.moveTo(0, bodyY);
      ctx.lineTo(w, bodyY - w * tanAngle);
      ctx.lineTo(w, bodyY - w * tanAngle - h);
      ctx.lineTo(0, bodyY - h);
      ctx.closePath();
      ctx.fill();

      // Top face
      const topGrad = ctx.createLinearGradient(
        0,
        bodyY - h - roofOffset,
        0,
        bodyY - h,
      );
      topGrad.addColorStop(0, "#A89878");
      topGrad.addColorStop(0.5, c.wallTop);
      topGrad.addColorStop(1, "#9A8A70");
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.moveTo(0, bodyY - h);
      ctx.lineTo(-w, bodyY - w * tanAngle - h);
      ctx.lineTo(0, bodyY - roofOffset - h);
      ctx.lineTo(w, bodyY - w * tanAngle - h);
      ctx.closePath();
      ctx.fill();

      // Wall edge highlights for 3D definition
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1 * s2;
      // Top edge of left wall
      ctx.beginPath();
      ctx.moveTo(0, bodyY - h);
      ctx.lineTo(-w, bodyY - w * tanAngle - h);
      ctx.stroke();
      // Front edge
      ctx.beginPath();
      ctx.moveTo(0, bodyY);
      ctx.lineTo(0, bodyY - h);
      ctx.stroke();

      // Base molding strip at bottom of walls
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.moveTo(0, bodyY);
      ctx.lineTo(-w, bodyY - w * tanAngle);
      ctx.lineTo(-w, bodyY - w * tanAngle - 3 * s2);
      ctx.lineTo(0, bodyY - 3 * s2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.moveTo(0, bodyY);
      ctx.lineTo(w, bodyY - w * tanAngle);
      ctx.lineTo(w, bodyY - w * tanAngle - 3 * s2);
      ctx.lineTo(0, bodyY - 3 * s2);
      ctx.closePath();
      ctx.fill();

      // Stone course lines on left wall
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, bodyY);
      ctx.lineTo(-w, bodyY - w * tanAngle);
      ctx.lineTo(-w, bodyY - w * tanAngle - h);
      ctx.lineTo(0, bodyY - h);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 0.6 * s2;
      const courseCount = 6;
      for (let row = 1; row < courseCount; row++) {
        const frac = row / courseCount;
        const ly = bodyY - h * frac;
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(-w, ly - w * tanAngle);
        ctx.stroke();
        const jointCount = 3;
        for (let j = 0; j < jointCount; j++) {
          const jfrac = (j + (row % 2 === 0 ? 0.5 : 0)) / jointCount;
          const jx = -w * jfrac;
          const jyTop = ly - w * tanAngle * jfrac;
          const jyBot =
            bodyY - h * ((row - 1) / courseCount) - w * tanAngle * jfrac;
          ctx.beginPath();
          ctx.moveTo(jx, jyTop);
          ctx.lineTo(jx, jyBot);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Stone course lines on right wall
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, bodyY);
      ctx.lineTo(w, bodyY - w * tanAngle);
      ctx.lineTo(w, bodyY - w * tanAngle - h);
      ctx.lineTo(0, bodyY - h);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 0.6 * s2;
      for (let row = 1; row < courseCount; row++) {
        const frac = row / courseCount;
        const ry = bodyY - h * frac;
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(w, ry - w * tanAngle);
        ctx.stroke();
        const jointCount = 3;
        for (let j = 0; j < jointCount; j++) {
          const jfrac = (j + (row % 2 === 0 ? 0.5 : 0)) / jointCount;
          const jx = w * jfrac;
          const jyTop = ry - w * tanAngle * jfrac;
          const jyBot =
            bodyY - h * ((row - 1) / courseCount) - w * tanAngle * jfrac;
          ctx.beginPath();
          ctx.moveTo(jx, jyTop);
          ctx.lineTo(jx, jyBot);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Decorative Wall Panels (recessed)
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.moveTo(-3 * s2, bodyY - h * 0.15);
      ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle + 3 * s2 - h * 0.15);
      ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
      ctx.lineTo(-3 * s2, bodyY - h + 5 * s2);
      ctx.closePath();
      ctx.fill();
      // Panel highlight edge (top)
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.8 * s2;
      ctx.beginPath();
      ctx.moveTo(-3 * s2, bodyY - h + 5 * s2);
      ctx.lineTo(-w + 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
      ctx.stroke();

      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.beginPath();
      ctx.moveTo(3 * s2, bodyY - h * 0.15);
      ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle + 3 * s2 - h * 0.15);
      ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
      ctx.lineTo(3 * s2, bodyY - h + 5 * s2);
      ctx.closePath();
      ctx.fill();
      // Panel highlight edge (top)
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.8 * s2;
      ctx.beginPath();
      ctx.moveTo(3 * s2, bodyY - h + 5 * s2);
      ctx.lineTo(w - 5 * s2, bodyY - w * tanAngle - h + 5 * s2);
      ctx.stroke();

      // Corner Pilasters
      ctx.fillStyle = c.frame;
      ctx.beginPath();
      ctx.moveTo(0, bodyY);
      ctx.lineTo(-4 * s2, bodyY - 2 * s2);
      ctx.lineTo(-4 * s2, bodyY - h + 2 * s2);
      ctx.lineTo(0, bodyY - h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = c.trim;
      ctx.beginPath();
      ctx.moveTo(w, bodyY - w * tanAngle);
      ctx.lineTo(w - 4 * s2, bodyY - w * tanAngle + 2 * s2);
      ctx.lineTo(w - 4 * s2, bodyY - w * tanAngle - h + 2 * s2);
      ctx.lineTo(w, bodyY - w * tanAngle - h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#4A3A2A";
      ctx.beginPath();
      ctx.moveTo(-w, bodyY - w * tanAngle);
      ctx.lineTo(-w + 4 * s2, bodyY - w * tanAngle + 2 * s2);
      ctx.lineTo(-w + 4 * s2, bodyY - w * tanAngle - h + 2 * s2);
      ctx.lineTo(-w, bodyY - w * tanAngle - h);
      ctx.closePath();
      ctx.fill();

      // Cornice/Crown Molding with dentil detail
      const corniceH = 6 * s2;

      // Left cornice face
      const corGradL = ctx.createLinearGradient(
        -w - 2 * s2,
        bodyY - w * tanAngle - h,
        0,
        bodyY - h,
      );
      corGradL.addColorStop(0, "#6A5840");
      corGradL.addColorStop(1, c.trim);
      ctx.fillStyle = corGradL;
      ctx.beginPath();
      ctx.moveTo(0, bodyY - h);
      ctx.lineTo(-w - 2 * s2, bodyY - w * tanAngle - h - 1 * s2);
      ctx.lineTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH);
      ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
      ctx.closePath();
      ctx.fill();

      // Right cornice face
      const corGradR = ctx.createLinearGradient(
        0,
        bodyY - h,
        w + 2 * s2,
        bodyY - w * tanAngle - h,
      );
      corGradR.addColorStop(0, c.accent);
      corGradR.addColorStop(1, "#A08850");
      ctx.fillStyle = corGradR;
      ctx.beginPath();
      ctx.moveTo(0, bodyY - h);
      ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - 1 * s2);
      ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH);
      ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
      ctx.closePath();
      ctx.fill();

      // Dentil blocks along left cornice
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      const dentilCount = 5;
      for (let d = 0; d < dentilCount; d++) {
        const dfrac = (d + 0.5) / (dentilCount + 1);
        const dx = -w * dfrac - 2 * s2 * dfrac;
        const dy = bodyY - w * tanAngle * dfrac - h - 1 * s2 * dfrac;
        ctx.fillRect(
          dx - 1.5 * s2,
          dy - corniceH + 1 * s2,
          2.5 * s2,
          corniceH - 2 * s2,
        );
      }
      // Dentil blocks along right cornice
      for (let d = 0; d < dentilCount; d++) {
        const dfrac = (d + 0.5) / (dentilCount + 1);
        const dx = w * dfrac + 2 * s2 * dfrac;
        const dy = bodyY - w * tanAngle * dfrac - h - 1 * s2 * dfrac;
        ctx.fillRect(
          dx - 1.5 * s2,
          dy - corniceH + 1 * s2,
          2.5 * s2,
          corniceH - 2 * s2,
        );
      }

      // Top edge line
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 1.5 * s2;
      ctx.beginPath();
      ctx.moveTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH);
      ctx.lineTo(0, bodyY - h - corniceH + 2 * s2);
      ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH);
      ctx.stroke();

      // Highlight under cornice top
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.8 * s2;
      ctx.beginPath();
      ctx.moveTo(-w - 2 * s2, bodyY - w * tanAngle - h - corniceH + 1.5 * s2);
      ctx.lineTo(0, bodyY - h - corniceH + 3.5 * s2);
      ctx.lineTo(w + 2 * s2, bodyY - w * tanAngle - h - corniceH + 1.5 * s2);
      ctx.stroke();

      // Rivets
      const rivetPositions = [
        { x: -w + 3 * s2, yBase: bodyY - w * tanAngle },
        { x: w - 3 * s2, yBase: bodyY - w * tanAngle },
        { x: -2 * s2, yBase: bodyY },
        { x: 2 * s2, yBase: bodyY },
      ];

      rivetPositions.forEach((pos) => {
        for (let i = 0; i < 4; i++) {
          const ry = pos.yBase - h * 0.2 - i * h * 0.22;
          ctx.fillStyle = c.frame;
          ctx.beginPath();
          ctx.arc(pos.x, ry, 3 * s2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = c.dark;
          ctx.beginPath();
          ctx.arc(pos.x, ry, 1.5 * s2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.beginPath();
          ctx.arc(pos.x - 0.5 * s2, ry - 0.5 * s2, 0.8 * s2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Central Crest — shield with keyhole emblem, flush on left wall
      ctx.save();
      ctx.translate(-w * 0.5, bodyY - w * tanAngle * 0.5 - h * 0.5);
      // Skew to match the left wall's isometric slope
      ctx.transform(1, tanAngle, 0, 1, 0, 0);

      // Shield outer border
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.moveTo(0, -11 * s2);
      ctx.lineTo(-9 * s2, -7 * s2);
      ctx.lineTo(-9 * s2, 4 * s2);
      ctx.quadraticCurveTo(-9 * s2, 10 * s2, 0, 15 * s2);
      ctx.quadraticCurveTo(9 * s2, 10 * s2, 9 * s2, 4 * s2);
      ctx.lineTo(9 * s2, -7 * s2);
      ctx.closePath();
      ctx.fill();

      // Shield inner field
      const shieldGrad = ctx.createLinearGradient(0, -9 * s2, 0, 12 * s2);
      shieldGrad.addColorStop(0, c.trim);
      shieldGrad.addColorStop(0.5, c.accent);
      shieldGrad.addColorStop(1, c.trim);
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.moveTo(0, -8 * s2);
      ctx.lineTo(-6 * s2, -5 * s2);
      ctx.lineTo(-6 * s2, 3 * s2);
      ctx.quadraticCurveTo(-6 * s2, 8 * s2, 0, 12 * s2);
      ctx.quadraticCurveTo(6 * s2, 8 * s2, 6 * s2, 3 * s2);
      ctx.lineTo(6 * s2, -5 * s2);
      ctx.closePath();
      ctx.fill();

      // Keyhole circle
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.arc(0, -2 * s2, 3.5 * s2, 0, Math.PI * 2);
      ctx.fill();

      // Keyhole slot
      ctx.beginPath();
      ctx.moveTo(-2 * s2, 0);
      ctx.lineTo(-1.2 * s2, 8 * s2);
      ctx.lineTo(1.2 * s2, 8 * s2);
      ctx.lineTo(2 * s2, 0);
      ctx.closePath();
      ctx.fill();

      // Keyhole inner highlight
      ctx.fillStyle = isFlashing ? c.glow : "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.arc(0, -2 * s2, 1.8 * s2, 0, Math.PI * 2);
      ctx.fill();

      // Shield border line
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 1.5 * s2;
      ctx.beginPath();
      ctx.moveTo(0, -8 * s2);
      ctx.lineTo(-6 * s2, -5 * s2);
      ctx.lineTo(-6 * s2, 3 * s2);
      ctx.quadraticCurveTo(-6 * s2, 8 * s2, 0, 12 * s2);
      ctx.quadraticCurveTo(6 * s2, 8 * s2, 6 * s2, 3 * s2);
      ctx.lineTo(6 * s2, -5 * s2);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // The Grand Vault Door — flush with right wall
      ctx.save();
      const doorCenterX = w * 0.5;
      const doorCenterY = bodyY - h * 0.5 - w * tanAngle * 0.5;
      ctx.translate(doorCenterX, doorCenterY);
      // Skew everything to match the right wall's iso slope
      ctx.transform(1, -tanAngle, 0, 1, 0, 0);

      // Door frame — heavy reinforced border (simple rect, transform handles skew)
      const dfGrad = ctx.createLinearGradient(-11 * s2, 0, 15 * s2, 0);
      dfGrad.addColorStop(0, "#4A3A2A");
      dfGrad.addColorStop(0.5, c.frame);
      dfGrad.addColorStop(1, "#5A4A38");
      ctx.fillStyle = dfGrad;
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 2.5 * s2;
      ctx.fillRect(-11 * s2, -15 * s2, 26 * s2, 32 * s2);
      ctx.strokeRect(-11 * s2, -15 * s2, 26 * s2, 32 * s2);

      // Door inner plate
      const dpGrad = ctx.createLinearGradient(
        -8 * s2,
        -12 * s2,
        12 * s2,
        14 * s2,
      );
      dpGrad.addColorStop(0, "#5C4C3C");
      dpGrad.addColorStop(0.4, c.trim);
      dpGrad.addColorStop(0.6, c.trim);
      dpGrad.addColorStop(1, "#685848");
      ctx.fillStyle = dpGrad;
      ctx.fillRect(-8 * s2, -12 * s2, 20 * s2, 26 * s2);

      // Reinforcement bands
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(-9 * s2, -6 * s2, 22 * s2, 2.5 * s2);
      ctx.fillRect(-9 * s2, 5 * s2, 22 * s2, 2.5 * s2);

      // Hinge plates on left side
      ctx.fillStyle = c.dark;
      ctx.fillRect(-10 * s2, -13 * s2, 4 * s2, 7 * s2);
      ctx.fillRect(-10 * s2, 7 * s2, 4 * s2, 7 * s2);
      ctx.fillStyle = c.frame;
      ctx.beginPath();
      ctx.arc(-8 * s2, -10 * s2, 1.5 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-8 * s2, 11 * s2, 1.5 * s2, 0, Math.PI * 2);
      ctx.fill();

      // Outer dial ring
      ctx.fillStyle = c.dark;
      ctx.beginPath();
      ctx.arc(2 * s2, 1 * s2, 12 * s2, 0, Math.PI * 2);
      ctx.fill();

      // Dial face — metallic gradient
      const dialGrad = ctx.createRadialGradient(
        1 * s2,
        -0.5 * s2,
        0,
        2 * s2,
        1 * s2,
        10 * s2,
      );
      dialGrad.addColorStop(0, "#9A8A78");
      dialGrad.addColorStop(0.3, c.frame);
      dialGrad.addColorStop(0.7, "#5A4A38");
      dialGrad.addColorStop(1, c.dark);
      ctx.fillStyle = dialGrad;
      ctx.beginPath();
      ctx.arc(2 * s2, 1 * s2, 10 * s2, 0, Math.PI * 2);
      ctx.fill();

      // Notch ring
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.5 * s2;
      ctx.beginPath();
      ctx.arc(2 * s2, 1 * s2, 9 * s2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = c.dark;
      for (let n = 0; n < 12; n++) {
        const notchAngle = (n * Math.PI * 2) / 12;
        const nx = 2 * s2 + Math.cos(notchAngle) * 9 * s2;
        const ny = 1 * s2 + Math.sin(notchAngle) * 9 * s2;
        ctx.beginPath();
        ctx.arc(nx, ny, 1.2 * s2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inner dial plate
      const innerGrad = ctx.createRadialGradient(
        1.5 * s2,
        0,
        0,
        2 * s2,
        1 * s2,
        7 * s2,
      );
      innerGrad.addColorStop(0, c.accent);
      innerGrad.addColorStop(0.5, c.trim);
      innerGrad.addColorStop(1, c.frame);
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(2 * s2, 1 * s2, 6.5 * s2, 0, Math.PI * 2);
      ctx.fill();

      // Concentric groove ring
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5 * s2;
      ctx.beginPath();
      ctx.arc(2 * s2, 1 * s2, 5 * s2, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating wheel spokes
      const dialSpeed = time * 1.2;
      ctx.save();
      ctx.translate(2 * s2, 1 * s2);
      ctx.rotate(dialSpeed);

      // Hub
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(0, 0, 4.5 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 0.5 * s2;
      ctx.stroke();

      // 4-spoke wheel
      ctx.strokeStyle = c.dark;
      ctx.lineWidth = 2 * s2;
      for (let spoke = 0; spoke < 4; spoke++) {
        const spokeAngle = (spoke * Math.PI * 2) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(spokeAngle) * 4 * s2,
          Math.sin(spokeAngle) * 4 * s2,
        );
        ctx.stroke();
      }

      // Spoke end caps
      ctx.fillStyle = c.trim;
      for (let spoke = 0; spoke < 4; spoke++) {
        const spokeAngle = (spoke * Math.PI * 2) / 4;
        ctx.beginPath();
        ctx.arc(
          Math.cos(spokeAngle) * 3.8 * s2,
          Math.sin(spokeAngle) * 3.8 * s2,
          1.2 * s2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Center glow gem
      ctx.shadowColor = c.glow;
      ctx.shadowBlur = isFlashing ? 30 : 14;
      ctx.fillStyle = isFlashing ? "#FFF" : c.glow;
      ctx.beginPath();
      ctx.arc(0, 0, 2.2 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(-0.5 * s2, -0.5 * s2, 1 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Handle/Lever (inside the wall-flush transform)
      ctx.save();
      ctx.translate(13 * s2, 7 * s2);
      ctx.fillStyle = c.dark;
      ctx.fillRect(-3.5 * s2, -2 * s2, 7 * s2, 4 * s2);
      ctx.fillStyle = "#3A3028";
      ctx.fillRect(-2 * s2, -9 * s2, 4 * s2, 18 * s2);
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(0, -9 * s2, 3 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.arc(-0.5 * s2, -9.5 * s2, 1.2 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(0, 9 * s2, 3 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.arc(-0.5 * s2, 8.5 * s2, 1.2 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();

      // Roof Parapet — raised edge all around the iso diamond
      const roofPeakY = bodyY - h - roofOffset;
      const parH = 3.5 * s2;

      // Roof diamond outer vertices (top of walls)
      const rf = { x: 0, y: bodyY - h };
      const rl = { x: -w, y: bodyY - w * tanAngle - h };
      const rb = { x: 0, y: roofPeakY };
      const rr = { x: w, y: bodyY - w * tanAngle - h };

      // Roof diamond center
      const rcx = 0;
      const rcy = bodyY - h - w * tanAngle;

      // Inner diamond vertices (inset for parapet thickness)
      const pi = 0.78;
      const rfi = { x: rcx + (rf.x - rcx) * pi, y: rcy + (rf.y - rcy) * pi };
      const rli = { x: rcx + (rl.x - rcx) * pi, y: rcy + (rl.y - rcy) * pi };
      const rbi = { x: rcx + (rb.x - rcx) * pi, y: rcy + (rb.y - rcy) * pi };
      const rri = { x: rcx + (rr.x - rcx) * pi, y: rcy + (rr.y - rcy) * pi };

      // Front-left parapet outer face (darker, facing viewer)
      const parGradL = ctx.createLinearGradient(rl.x, rl.y, rf.x, rf.y);
      parGradL.addColorStop(0, "#5A4A38");
      parGradL.addColorStop(1, c.trim);
      ctx.fillStyle = parGradL;
      ctx.beginPath();
      ctx.moveTo(rf.x, rf.y);
      ctx.lineTo(rl.x, rl.y);
      ctx.lineTo(rl.x, rl.y - parH);
      ctx.lineTo(rf.x, rf.y - parH);
      ctx.closePath();
      ctx.fill();

      // Front-right parapet outer face (lighter, facing viewer)
      const parGradR = ctx.createLinearGradient(rf.x, rf.y, rr.x, rr.y);
      parGradR.addColorStop(0, c.accent);
      parGradR.addColorStop(1, "#A08850");
      ctx.fillStyle = parGradR;
      ctx.beginPath();
      ctx.moveTo(rr.x, rr.y);
      ctx.lineTo(rf.x, rf.y);
      ctx.lineTo(rf.x, rf.y - parH);
      ctx.lineTo(rr.x, rr.y - parH);
      ctx.closePath();
      ctx.fill();

      // Parapet top ledge strips (all 4 edges)
      ctx.fillStyle = c.wallTop;
      // Front-left strip
      ctx.beginPath();
      ctx.moveTo(rf.x, rf.y - parH);
      ctx.lineTo(rl.x, rl.y - parH);
      ctx.lineTo(rli.x, rli.y - parH);
      ctx.lineTo(rfi.x, rfi.y - parH);
      ctx.closePath();
      ctx.fill();
      // Back-left strip
      ctx.beginPath();
      ctx.moveTo(rl.x, rl.y - parH);
      ctx.lineTo(rb.x, rb.y - parH);
      ctx.lineTo(rbi.x, rbi.y - parH);
      ctx.lineTo(rli.x, rli.y - parH);
      ctx.closePath();
      ctx.fill();
      // Back-right strip
      ctx.fillStyle = "#B8A882";
      ctx.beginPath();
      ctx.moveTo(rb.x, rb.y - parH);
      ctx.lineTo(rr.x, rr.y - parH);
      ctx.lineTo(rri.x, rri.y - parH);
      ctx.lineTo(rbi.x, rbi.y - parH);
      ctx.closePath();
      ctx.fill();
      // Front-right strip
      ctx.beginPath();
      ctx.moveTo(rr.x, rr.y - parH);
      ctx.lineTo(rf.x, rf.y - parH);
      ctx.lineTo(rfi.x, rfi.y - parH);
      ctx.lineTo(rri.x, rri.y - parH);
      ctx.closePath();
      ctx.fill();

      // Inner roof floor visible through parapet (slightly darker)
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.moveTo(rfi.x, rfi.y - parH);
      ctx.lineTo(rli.x, rli.y - parH);
      ctx.lineTo(rbi.x, rbi.y - parH);
      ctx.lineTo(rri.x, rri.y - parH);
      ctx.closePath();
      ctx.fill();

      // Parapet outer edge highlight
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.8 * s2;
      ctx.beginPath();
      ctx.moveTo(rl.x, rl.y - parH);
      ctx.lineTo(rf.x, rf.y - parH);
      ctx.lineTo(rr.x, rr.y - parH);
      ctx.stroke();

      // Inner parapet shadow line
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.6 * s2;
      ctx.beginPath();
      ctx.moveTo(rli.x, rli.y - parH);
      ctx.lineTo(rfi.x, rfi.y - parH);
      ctx.lineTo(rri.x, rri.y - parH);
      ctx.stroke();

      // Center Ornament — small iso box sitting on the roof floor center
      const dcW = w * 0.18;
      const dcH = 3.5 * s2;
      // Left face
      ctx.fillStyle = c.frame;
      ctx.beginPath();
      ctx.moveTo(rcx, rcy - parH);
      ctx.lineTo(rcx - dcW, rcy - dcW * tanAngle - parH);
      ctx.lineTo(rcx - dcW, rcy - dcW * tanAngle - parH - dcH);
      ctx.lineTo(rcx, rcy - parH - dcH);
      ctx.closePath();
      ctx.fill();
      // Right face
      ctx.fillStyle = c.trim;
      ctx.beginPath();
      ctx.moveTo(rcx, rcy - parH);
      ctx.lineTo(rcx + dcW, rcy - dcW * tanAngle - parH);
      ctx.lineTo(rcx + dcW, rcy - dcW * tanAngle - parH - dcH);
      ctx.lineTo(rcx, rcy - parH - dcH);
      ctx.closePath();
      ctx.fill();
      // Top face (tiny iso diamond)
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.moveTo(rcx, rcy - parH - dcH);
      ctx.lineTo(rcx - dcW, rcy - dcW * tanAngle - parH - dcH);
      ctx.lineTo(rcx, rcy - dcW * tanAngle * 2 - parH - dcH);
      ctx.lineTo(rcx + dcW, rcy - dcW * tanAngle - parH - dcH);
      ctx.closePath();
      ctx.fill();

      // Orb on center ornament
      const orbY = rcy - parH - dcH - dcW * tanAngle - 2.5 * s2;
      ctx.fillStyle = c.dark;
      ctx.fillRect(-1 * s2, orbY + 1 * s2, 2 * s2, 2.5 * s2);
      const orbGrad = ctx.createRadialGradient(
        -0.5 * s2,
        orbY - 0.6 * s2,
        0,
        0,
        orbY,
        2.8 * s2,
      );
      orbGrad.addColorStop(0, "#E8D8A0");
      orbGrad.addColorStop(0.5, c.accent);
      orbGrad.addColorStop(1, c.trim);
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(0, orbY, 2.8 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(-0.7 * s2, orbY - 0.7 * s2, 1 * s2, 0, Math.PI * 2);
      ctx.fill();

      // Ambient Glow — pulsing
      const glowPulse = 0.12 + Math.sin(time * 2.5) * 0.04;
      const ambientGlow = ctx.createRadialGradient(
        doorCenterX,
        doorCenterY,
        0,
        doorCenterX,
        doorCenterY,
        28 * s2,
      );
      if (isFlashing) {
        ambientGlow.addColorStop(0, "rgba(255, 100, 100, 0.25)");
        ambientGlow.addColorStop(0.5, "rgba(255, 100, 100, 0.08)");
        ambientGlow.addColorStop(1, "transparent");
      } else {
        ambientGlow.addColorStop(0, `rgba(76, 184, 152, ${glowPulse})`);
        ambientGlow.addColorStop(0.5, `rgba(76, 184, 152, ${glowPulse * 0.4})`);
        ambientGlow.addColorStop(1, "transparent");
      }
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(doorCenterX, doorCenterY, 28 * s2, 0, Math.PI * 2);
      ctx.fill();

      // ── Damage Effects ──
      // Helper: point on left wall at fractional position (fx across, fy up)
      const lWallPt = (fx: number, fy: number) => ({
        x: -w * fx,
        y: bodyY - w * tanAngle * fx - h * fy,
      });
      // Helper: point on right wall
      const rWallPt = (fx: number, fy: number) => ({
        x: w * fx,
        y: bodyY - w * tanAngle * fx - h * fy,
      });

      if (hpPct < 0.85) {
        const dmg = Math.min(1, (0.85 - hpPct) / 0.85);

        // Progressive wall darkening — clipped to each wall face
        const sootAlpha = 0.04 + dmg * 0.12;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, bodyY);
        ctx.lineTo(-w, bodyY - w * tanAngle);
        ctx.lineTo(-w, bodyY - w * tanAngle - h);
        ctx.lineTo(0, bodyY - h);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = `rgba(20, 15, 8, ${sootAlpha})`;
        ctx.fillRect(
          -w - 2 * s2,
          bodyY - w * tanAngle - h - 2 * s2,
          w + 4 * s2,
          h + w * tanAngle + 4 * s2,
        );
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, bodyY);
        ctx.lineTo(w, bodyY - w * tanAngle);
        ctx.lineTo(w, bodyY - w * tanAngle - h);
        ctx.lineTo(0, bodyY - h);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = `rgba(20, 15, 8, ${sootAlpha * 0.7})`;
        ctx.fillRect(
          -2 * s2,
          bodyY - w * tanAngle - h - 2 * s2,
          w + 4 * s2,
          h + w * tanAngle + 4 * s2,
        );
        ctx.restore();

        // Tier 1: Cracks on left wall (clipped, iso-aligned)
        const crAlpha = 0.25 + dmg * 0.35;
        const crW = (0.7 + dmg * 1.5) * s2;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, bodyY);
        ctx.lineTo(-w, bodyY - w * tanAngle);
        ctx.lineTo(-w, bodyY - w * tanAngle - h);
        ctx.lineTo(0, bodyY - h);
        ctx.closePath();
        ctx.clip();

        ctx.strokeStyle = `rgba(15, 10, 5, ${crAlpha})`;
        ctx.lineWidth = crW;
        ctx.lineCap = "round";
        // Main crack with branches
        let p = lWallPt(0.82, 0.18);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        p = lWallPt(0.65, 0.35);
        ctx.lineTo(p.x, p.y);
        p = lWallPt(0.48, 0.28);
        ctx.lineTo(p.x, p.y);
        p = lWallPt(0.3, 0.42);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        // Branch 1
        ctx.lineWidth = crW * 0.6;
        p = lWallPt(0.65, 0.35);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        p = lWallPt(0.55, 0.48);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        // Branch 2
        p = lWallPt(0.48, 0.28);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        p = lWallPt(0.42, 0.15);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();

        // Tier 2: More cracks + scorch marks (< 60%)
        if (hpPct < 0.6) {
          // Additional crack on left wall upper area
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, bodyY);
          ctx.lineTo(-w, bodyY - w * tanAngle);
          ctx.lineTo(-w, bodyY - w * tanAngle - h);
          ctx.lineTo(0, bodyY - h);
          ctx.closePath();
          ctx.clip();
          ctx.strokeStyle = `rgba(15, 10, 5, ${crAlpha})`;
          ctx.lineWidth = crW;
          ctx.lineCap = "round";
          p = lWallPt(0.7, 0.62);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          p = lWallPt(0.5, 0.72);
          ctx.lineTo(p.x, p.y);
          p = lWallPt(0.25, 0.65);
          ctx.lineTo(p.x, p.y);
          p = lWallPt(0.1, 0.8);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          // Scorch mark overlay
          ctx.fillStyle = "rgba(30, 18, 5, 0.12)";
          ctx.beginPath();
          const sc = lWallPt(0.55, 0.4);
          ctx.ellipse(sc.x, sc.y, 10 * s2, 14 * s2, -0.25, 0, Math.PI * 2);
          ctx.fill();
          // Missing stone void
          ctx.fillStyle = "rgba(10, 8, 5, 0.35)";
          const mv = lWallPt(0.45, 0.3);
          ctx.fillRect(mv.x - 3 * s2, mv.y - 2 * s2, 6 * s2, 4 * s2);
          ctx.restore();

          // Cracks on right wall (clipped)
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, bodyY);
          ctx.lineTo(w, bodyY - w * tanAngle);
          ctx.lineTo(w, bodyY - w * tanAngle - h);
          ctx.lineTo(0, bodyY - h);
          ctx.closePath();
          ctx.clip();
          ctx.strokeStyle = `rgba(15, 10, 5, ${crAlpha * 0.8})`;
          ctx.lineWidth = crW * 0.9;
          ctx.lineCap = "round";
          let rp = rWallPt(0.4, 0.3);
          ctx.beginPath();
          ctx.moveTo(rp.x, rp.y);
          rp = rWallPt(0.58, 0.48);
          ctx.lineTo(rp.x, rp.y);
          rp = rWallPt(0.72, 0.38);
          ctx.lineTo(rp.x, rp.y);
          ctx.stroke();
          // Branch
          ctx.lineWidth = crW * 0.5;
          rp = rWallPt(0.58, 0.48);
          ctx.beginPath();
          ctx.moveTo(rp.x, rp.y);
          rp = rWallPt(0.65, 0.62);
          ctx.lineTo(rp.x, rp.y);
          ctx.stroke();
          ctx.restore();
        }

        // Tier 3: Fallen debris + missing blocks + deep fractures (< 45%)
        if (hpPct < 0.45) {
          // Missing stone voids on left wall
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, bodyY);
          ctx.lineTo(-w, bodyY - w * tanAngle);
          ctx.lineTo(-w, bodyY - w * tanAngle - h);
          ctx.lineTo(0, bodyY - h);
          ctx.closePath();
          ctx.clip();
          ctx.fillStyle = "rgba(8, 5, 2, 0.4)";
          const v1 = lWallPt(0.7, 0.55);
          ctx.fillRect(v1.x - 4 * s2, v1.y - 3 * s2, 8 * s2, 6 * s2);
          const v2 = lWallPt(0.35, 0.7);
          ctx.fillRect(v2.x - 3 * s2, v2.y - 2 * s2, 6 * s2, 5 * s2);
          ctx.restore();

          // Missing block on right wall
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, bodyY);
          ctx.lineTo(w, bodyY - w * tanAngle);
          ctx.lineTo(w, bodyY - w * tanAngle - h);
          ctx.lineTo(0, bodyY - h);
          ctx.closePath();
          ctx.clip();
          ctx.fillStyle = "rgba(8, 5, 2, 0.35)";
          const v3 = rWallPt(0.55, 0.45);
          ctx.fillRect(v3.x - 3 * s2, v3.y - 2.5 * s2, 7 * s2, 5 * s2);
          ctx.restore();

          // Fallen stone debris at base (rotated rectangles)
          const deb = [
            {
              x: -w * 0.25,
              y: bodyY + 2.5 * s2,
              bw: 6,
              bh: 3.5,
              rot: 0.35,
              c: "#6B5B4B",
            },
            {
              x: -w * 0.08,
              y: bodyY + 1.5 * s2,
              bw: 4.5,
              bh: 2.5,
              rot: -0.5,
              c: "#5A4A3A",
            },
            {
              x: w * 0.35,
              y: bodyY - w * tanAngle * 0.35 + 2 * s2,
              bw: 5.5,
              bh: 3,
              rot: 0.7,
              c: "#7A6A55",
            },
            {
              x: -w * 0.5,
              y: bodyY - w * tanAngle * 0.5 + 1.5 * s2,
              bw: 4,
              bh: 2.5,
              rot: -0.3,
              c: "#5A4A3A",
            },
            {
              x: w * 0.55,
              y: bodyY - w * tanAngle * 0.55 + 1 * s2,
              bw: 3.5,
              bh: 2,
              rot: 0.9,
              c: "#6B5B4B",
            },
          ];
          deb.forEach((d) => {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rot);
            ctx.fillStyle = d.c;
            ctx.fillRect(
              (-d.bw / 2) * s2,
              (-d.bh / 2) * s2,
              d.bw * s2,
              d.bh * s2,
            );
            ctx.fillStyle = "rgba(255,255,255,0.06)";
            ctx.fillRect((-d.bw / 2) * s2, (-d.bh / 2) * s2, d.bw * s2, 1 * s2);
            ctx.restore();
          });

          // Deep structural fracture across left wall
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, bodyY);
          ctx.lineTo(-w, bodyY - w * tanAngle);
          ctx.lineTo(-w, bodyY - w * tanAngle - h);
          ctx.lineTo(0, bodyY - h);
          ctx.closePath();
          ctx.clip();
          ctx.strokeStyle = "rgba(30, 15, 0, 0.5)";
          ctx.lineWidth = 2.2 * s2;
          ctx.lineCap = "round";
          p = lWallPt(0.92, 0.05);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          p = lWallPt(0.6, 0.45);
          ctx.lineTo(p.x, p.y);
          p = lWallPt(0.35, 0.35);
          ctx.lineTo(p.x, p.y);
          p = lWallPt(0.1, 0.75);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Tier 4: Critical — fires, smoke, beacon (< 35%)
      if (hpPct < 0.35 && hpPct > 0) {
        const flk1 = Math.sin(time * 20) > 0;
        const flk2 = Math.sin(time * 15 + 1) > 0;

        // Fire sources at crack intersection points
        const fires = [
          { ...lWallPt(0.6, 0.45), sz: 1 },
          { ...lWallPt(0.3, 0.7), sz: 0.75 },
          { ...rWallPt(0.55, 0.48), sz: 0.85 },
        ];
        fires.forEach((fp, idx) => {
          const flk = idx % 2 === 0 ? flk1 : flk2;
          ctx.save();
          ctx.translate(fp.x, fp.y);
          // Warm glow
          const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, 12 * s2 * fp.sz);
          fg.addColorStop(0, `rgba(255, 140, 30, ${flk ? 0.22 : 0.12})`);
          fg.addColorStop(1, "transparent");
          ctx.fillStyle = fg;
          ctx.beginPath();
          ctx.arc(0, 0, 12 * s2 * fp.sz, 0, Math.PI * 2);
          ctx.fill();
          // Layered flame tongues
          for (let f = 2; f >= 0; f--) {
            const fh = (5 + f * 3.5) * s2 * fp.sz;
            const fw = (1.5 + f * 0.8) * s2 * fp.sz;
            const fx = Math.sin(time * (10 + f * 4) + idx * 2 + f) * 2.5 * s2;
            const colors = [
              [flk ? "#FFF8E1" : "#FFECB3"],
              [flk ? "#FFB74D" : "#FF9800"],
              [flk ? "#F44336" : "#D32F2F"],
            ];
            ctx.fillStyle = colors[f][0];
            ctx.beginPath();
            ctx.moveTo(fx - fw, 0);
            ctx.quadraticCurveTo(fx - fw * 0.4, -fh * 0.5, fx, -fh);
            ctx.quadraticCurveTo(fx + fw * 0.4, -fh * 0.5, fx + fw, 0);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        });

        // Smoke columns from fire points
        fires.forEach((fp, idx) => {
          for (let i = 0; i < 3; i++) {
            const sp = (time * 0.8 + i * 1.2 + idx * 0.7) % 4.5;
            const sa = Math.max(0, 0.2 - sp * 0.04);
            const sx = fp.x + Math.sin(time * 0.5 + i + idx) * 4 * s2;
            const sy = fp.y - sp * 14 * s2;
            const sr = (2.5 + sp * 2.5) * s2;
            ctx.fillStyle = `rgba(40, 35, 30, ${sa})`;
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Glowing fracture on left wall (clipped)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, bodyY);
        ctx.lineTo(-w, bodyY - w * tanAngle);
        ctx.lineTo(-w, bodyY - w * tanAngle - h);
        ctx.lineTo(0, bodyY - h);
        ctx.closePath();
        ctx.clip();
        ctx.strokeStyle = flk1 ? "#FFEB3B" : "#FF9800";
        ctx.shadowColor = "#FF5722";
        ctx.shadowBlur = 10 * s2;
        ctx.lineWidth = 2.5 * s2;
        ctx.lineCap = "round";
        let gp = lWallPt(0.92, 0.05);
        ctx.beginPath();
        ctx.moveTo(gp.x, gp.y);
        gp = lWallPt(0.6, 0.45);
        ctx.lineTo(gp.x, gp.y);
        gp = lWallPt(0.35, 0.35);
        ctx.lineTo(gp.x, gp.y);
        gp = lWallPt(0.1, 0.75);
        ctx.lineTo(gp.x, gp.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Alarm beacon on center roof ornament
        const bY = rcy - parH - 3.5 * s2 - w * 0.18 * tanAngle - 6 * s2;
        ctx.save();
        ctx.translate(0, bY);
        ctx.fillStyle = flk1 ? "#FF1744" : "#B71C1C";
        ctx.shadowColor = "#FF1744";
        ctx.shadowBlur = 18 * s2;
        ctx.beginPath();
        ctx.arc(0, 0, 4 * s2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.rotate(time * 5);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + (flk2 ? 0.25 : 0)})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(7 * s2, -3 * s2);
        ctx.lineTo(7 * s2, 3 * s2);
        ctx.fill();
        ctx.restore();

        // Sparks near fires
        if (Math.random() > 0.78) {
          fires.forEach((fp) => {
            const sx = fp.x + (Math.random() - 0.5) * 10 * s2;
            const sy = fp.y - Math.random() * 15 * s2;
            ctx.fillStyle = `rgba(255, ${200 + Math.round(Math.random() * 55)}, ${80 + Math.round(Math.random() * 80)}, 0.9)`;
            ctx.beginPath();
            ctx.arc(sx, sy, (0.8 + Math.random() * 0.8) * s2, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      // Health Bar
      if (specialTowerHp !== null && specHp) {
        const barWidth = 70 * s2;
        const barHeight = 10 * s2;
        const yOffset = roofPeakY - 22 * s2;

        ctx.save();
        ctx.translate(0, yOffset);

        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.rect(
          -barWidth / 2 - 2 * s2,
          -2 * s2,
          barWidth + 4 * s2,
          barHeight + 4 * s2,
        );
        ctx.fill();

        ctx.fillStyle = "#2D2D2D";
        ctx.beginPath();
        ctx.rect(-barWidth / 2, 0, barWidth, barHeight);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        const hpColorStr =
          hpPct > 0.6 ? "#4CAF50" : hpPct > 0.3 ? "#FF9800" : "#F44336";
        const grad = ctx.createLinearGradient(
          -barWidth / 2,
          0,
          barWidth / 2,
          0,
        );
        grad.addColorStop(0, hpColorStr);
        grad.addColorStop(1, isFlashing ? "#FFF" : hpColorStr);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.rect(
          -barWidth / 2 + 2 * s2,
          2 * s2,
          (barWidth - 4 * s2) * hpPct,
          barHeight - 4 * s2,
        );
        ctx.fill();

        ctx.fillStyle = "#E0E0E0";
        ctx.font = `800 ${7 * s2}px "bc-novatica-cyr", Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.fillText("PROTECT THE VAULT", 0, -4 * s2);
        ctx.restore();
      }
      break;
    }

    case "shrine": {
      const healCycle = Date.now() % 5000;
      const isHealing = healCycle < 1200;
      const s2 = s * 1.1;

      const w = 32 * s2;
      const h = 12 * s2;
      const tanA = ISO_TAN;

      // Center the iso diamond on the tile (bottom vertex was at origin)
      ctx.translate(0, w * tanA);

      // Foundation Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(0, -w * tanA, 45 * s2, 25 * s2, 0, 0, Math.PI * 2);
      ctx.fill();

      const drawOrnateStep = (
        sw: number,
        sh: number,
        gradL: CanvasGradient | string,
        gradR: CanvasGradient | string,
        topColor?: string,
      ) => {
        ctx.fillStyle = gradL;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-sw, -sw * tanA);
        ctx.lineTo(-sw, -sw * tanA - sh);
        ctx.lineTo(0, -sh);
        ctx.fill();
        ctx.fillStyle = gradR;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sw, -sw * tanA);
        ctx.lineTo(sw, -sw * tanA - sh);
        ctx.lineTo(0, -sh);
        ctx.fill();
        if (topColor) {
          ctx.fillStyle = topColor;
          ctx.beginPath();
          ctx.moveTo(0, -sh);
          ctx.lineTo(-sw, -sw * tanA - sh);
          ctx.lineTo(0, -sw * tanA * 2 - sh);
          ctx.lineTo(sw, -sw * tanA - sh);
          ctx.closePath();
          ctx.fill();
        }
      };

      // Tiered Base
      ctx.save();

      const baseGradL1 = ctx.createLinearGradient(-w, 0, 0, 0);
      baseGradL1.addColorStop(0, "#37474F");
      baseGradL1.addColorStop(1, "#455A64");
      const baseGradR1 = ctx.createLinearGradient(0, 0, w, 0);
      baseGradR1.addColorStop(0, "#607D8B");
      baseGradR1.addColorStop(1, "#546E7A");
      drawOrnateStep(w, h, baseGradL1, baseGradR1, "#4E5D63");

      ctx.strokeStyle = "#78909C";
      ctx.lineWidth = 1.5 * s2;
      ctx.beginPath();
      ctx.moveTo(-w, -w * tanA - h);
      ctx.lineTo(0, -h);
      ctx.lineTo(w, -w * tanA - h);
      ctx.stroke();

      ctx.translate(0, -h);
      const w2 = w * 0.75;
      const baseGradL2 = ctx.createLinearGradient(-w2, 0, 0, 0);
      baseGradL2.addColorStop(0, "#2E4A52");
      baseGradL2.addColorStop(1, "#3D5C5F");
      const baseGradR2 = ctx.createLinearGradient(0, 0, w2, 0);
      baseGradR2.addColorStop(0, "#4A7C7F");
      baseGradR2.addColorStop(1, "#3D6B6E");
      drawOrnateStep(w2, h * 1.2, baseGradL2, baseGradR2, "#456563");

      ctx.strokeStyle = "rgba(118, 255, 3, 0.3)";
      ctx.lineWidth = 1 * s2;
      ctx.beginPath();
      ctx.moveTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
      ctx.lineTo(-w2 * 0.5 - 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
      ctx.moveTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
      ctx.lineTo(-w2 * 0.5 + 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
      ctx.moveTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
      ctx.lineTo(-w2 * 0.5, -w2 * tanA * 0.5 - h * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
      ctx.lineTo(w2 * 0.5 - 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
      ctx.moveTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
      ctx.lineTo(w2 * 0.5 + 3 * s2, -w2 * tanA * 0.5 - h * 0.6);
      ctx.moveTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.3);
      ctx.lineTo(w2 * 0.5, -w2 * tanA * 0.5 - h * 0.9);
      ctx.stroke();

      ctx.translate(0, -h * 1.2);
      const w3 = w * 0.45;
      const baseGradL3 = ctx.createLinearGradient(-w3, 0, 0, 0);
      baseGradL3.addColorStop(0, "#1B3A3D");
      baseGradL3.addColorStop(1, "#2A4F52");
      const baseGradR3 = ctx.createLinearGradient(0, 0, w3, 0);
      baseGradR3.addColorStop(0, "#3D6B6E");
      baseGradR3.addColorStop(1, "#2E5558");
      drawOrnateStep(w3, h * 0.8, baseGradL3, baseGradR3, "#355855");

      ctx.restore();

      // Corner Pillars with Crystals
      const pillarPositions = [
        { x: -w * 0.7, y: -w * tanA * 0.7, side: "left" },
        { x: w * 0.7, y: -w * tanA * 0.7, side: "right" },
        { x: -w * 0.35, y: -w * tanA * 0.35 - h, side: "left" },
        { x: w * 0.35, y: -w * tanA * 0.35 - h, side: "right" },
      ];

      pillarPositions.forEach((pil, idx) => {
        ctx.save();
        ctx.translate(pil.x, pil.y);

        ctx.fillStyle = pil.side === "left" ? "#37474F" : "#546E7A";
        ctx.fillRect(-4 * s2, -2 * s2, 8 * s2, 4 * s2);

        const pillarGrad = ctx.createLinearGradient(-3 * s2, 0, 3 * s2, 0);
        if (pil.side === "left") {
          pillarGrad.addColorStop(0, "#2E4A52");
          pillarGrad.addColorStop(0.5, "#3D5C5F");
          pillarGrad.addColorStop(1, "#2E4A52");
        } else {
          pillarGrad.addColorStop(0, "#3D6B6E");
          pillarGrad.addColorStop(0.5, "#4A8285");
          pillarGrad.addColorStop(1, "#3D6B6E");
        }
        ctx.fillStyle = pillarGrad;
        ctx.fillRect(-3 * s2, -2 * s2, 6 * s2, -25 * s2);

        ctx.fillStyle = pil.side === "left" ? "#455A64" : "#607D8B";
        ctx.fillRect(-5 * s2, -27 * s2, 10 * s2, 4 * s2);

        const crystalGlow = 0.5 + Math.sin(time * 3 + idx) * 0.3;
        ctx.shadowBlur = (isHealing ? 15 : 8) * s2;
        ctx.shadowColor = `rgba(118, 255, 3, ${crystalGlow})`;

        ctx.fillStyle = `rgba(144, 238, 144, ${0.7 + crystalGlow * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(0, -40 * s2);
        ctx.lineTo(-4 * s2, -32 * s2);
        ctx.lineTo(-3 * s2, -27 * s2);
        ctx.lineTo(3 * s2, -27 * s2);
        ctx.lineTo(4 * s2, -32 * s2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + crystalGlow * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(0, -38 * s2);
        ctx.lineTo(-2 * s2, -33 * s2);
        ctx.lineTo(0, -30 * s2);
        ctx.lineTo(2 * s2, -33 * s2);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // Sacred Bowl/Brazier
      ctx.save();
      const bowlY = -h * 2.2;
      ctx.translate(0, bowlY);

      ctx.fillStyle = "#4E342E";
      ctx.beginPath();
      ctx.ellipse(0, 0, 14 * s2, 7 * s2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.ellipse(0, -2 * s2, 11 * s2, 5 * s2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 1.5 * s2;
      ctx.beginPath();
      ctx.ellipse(0, 2 * s2, 13 * s2, 6.5 * s2, 0, 0, Math.PI, true);
      ctx.stroke();

      ctx.fillStyle = "#3E2723";
      ctx.fillRect(-5 * s2, 4 * s2, 10 * s2, 8 * s2);
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(-4 * s2, 4 * s2, 8 * s2, 8 * s2);
      ctx.restore();

      // Floating Runestones
      for (let i = 0; i < 5; i++) {
        ctx.save();
        const orbitAngle = time * 0.6 + (i * Math.PI * 2) / 5;
        const orbitRadius = 28 * s2;
        const bob = Math.sin(time * 2.5 + i * 1.2) * 5 * s2;
        const rx = Math.cos(orbitAngle) * orbitRadius;
        const ry = -45 * s2 + Math.sin(orbitAngle) * 12 * s2 + bob;

        ctx.translate(rx, ry);
        ctx.rotate(Math.sin(time + i) * 0.2);

        const stoneSize = (6 + Math.sin(i * 2) * 2) * s2;

        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.moveTo(2 * s2, -stoneSize + 2 * s2);
        ctx.lineTo(stoneSize + 2 * s2, 2 * s2);
        ctx.lineTo(2 * s2, stoneSize + 2 * s2);
        ctx.lineTo(-stoneSize + 2 * s2, 2 * s2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#1B3A3D";
        ctx.beginPath();
        ctx.moveTo(0, -stoneSize);
        ctx.lineTo(-stoneSize, 0);
        ctx.lineTo(0, stoneSize);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#2E5558";
        ctx.beginPath();
        ctx.moveTo(0, -stoneSize);
        ctx.lineTo(stoneSize, 0);
        ctx.lineTo(0, stoneSize);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        const runeGlow = isHealing ? 1 : 0.5 + Math.sin(time * 4 + i) * 0.3;
        ctx.shadowBlur = (isHealing ? 12 : 6) * s2;
        ctx.shadowColor = "#76FF03";
        ctx.strokeStyle = `rgba(204, 255, 144, ${runeGlow})`;
        ctx.lineWidth = 1.5 * s2;

        ctx.beginPath();
        if (i % 3 === 0) {
          ctx.moveTo(0, -stoneSize * 0.6);
          ctx.lineTo(0, stoneSize * 0.6);
          ctx.moveTo(-stoneSize * 0.3, -stoneSize * 0.2);
          ctx.lineTo(stoneSize * 0.3, stoneSize * 0.2);
        } else if (i % 3 === 1) {
          ctx.moveTo(-stoneSize * 0.4, -stoneSize * 0.4);
          ctx.lineTo(stoneSize * 0.4, stoneSize * 0.4);
          ctx.moveTo(stoneSize * 0.4, -stoneSize * 0.4);
          ctx.lineTo(-stoneSize * 0.4, stoneSize * 0.4);
        } else {
          ctx.moveTo(0, -stoneSize * 0.5);
          ctx.lineTo(-stoneSize * 0.4, stoneSize * 0.3);
          ctx.lineTo(stoneSize * 0.4, stoneSize * 0.3);
          ctx.closePath();
        }
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Central Sacred Flame
      const flameY = bowlY - 8 * s2;
      const flamePulse = 0.85 + Math.sin(time * 10) * 0.15;
      const flameSize = 22 * s2 * flamePulse;

      const auraGrad = ctx.createRadialGradient(
        0,
        flameY,
        0,
        0,
        flameY,
        flameSize * 1.8,
      );
      auraGrad.addColorStop(0, "rgba(118, 255, 3, 0.3)");
      auraGrad.addColorStop(0.5, "rgba(118, 255, 3, 0.1)");
      auraGrad.addColorStop(1, "transparent");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, flameY, flameSize * 1.8, 0, Math.PI * 2);
      ctx.fill();

      const fireGrad = ctx.createRadialGradient(
        0,
        flameY,
        0,
        0,
        flameY,
        flameSize,
      );
      fireGrad.addColorStop(0, "#FFFFFF");
      fireGrad.addColorStop(0.2, "#E8F5E9");
      fireGrad.addColorStop(0.4, "#CCFF90");
      fireGrad.addColorStop(0.7, "rgba(118, 255, 3, 0.5)");
      fireGrad.addColorStop(1, "transparent");

      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(0, flameY, flameSize, 0, Math.PI * 2);
      ctx.fill();

      for (let t = 0; t < 4; t++) {
        const tendrilAngle = time * 3 + (t * Math.PI) / 2;
        const tendrilLen = (12 + Math.sin(time * 6 + t) * 4) * s2;
        const tx = Math.cos(tendrilAngle) * 8 * s2;
        const ty = flameY + Math.sin(tendrilAngle) * 4 * s2 - tendrilLen * 0.5;

        const tendrilGrad = ctx.createLinearGradient(
          tx,
          ty,
          tx,
          ty - tendrilLen,
        );
        tendrilGrad.addColorStop(0, "rgba(204, 255, 144, 0.8)");
        tendrilGrad.addColorStop(1, "transparent");

        ctx.fillStyle = tendrilGrad;
        ctx.beginPath();
        ctx.moveTo(tx - 3 * s2, ty);
        ctx.quadraticCurveTo(
          tx + Math.sin(time * 8 + t) * 4 * s2,
          ty - tendrilLen * 0.5,
          tx,
          ty - tendrilLen,
        );
        ctx.quadraticCurveTo(
          tx - Math.sin(time * 8 + t) * 4 * s2,
          ty - tendrilLen * 0.5,
          tx + 3 * s2,
          ty,
        );
        ctx.fill();
      }

      // Ambient Floating Particles
      for (let p = 0; p < 8; p++) {
        const pTime = time + p * 0.8;
        const pLifeCycle = (pTime * 0.5) % 1;
        const pAngle = p * (Math.PI / 4) + time * 0.3;
        const pDist = 15 * s2 + pLifeCycle * 25 * s2;
        const px = Math.cos(pAngle) * pDist;
        const py = flameY - pLifeCycle * 40 * s2 + Math.sin(pTime * 2) * 5 * s2;
        const pAlpha = Math.sin(pLifeCycle * Math.PI) * 0.6;
        const pSize = (1 + Math.sin(pTime * 3) * 0.5) * s2;

        ctx.fillStyle = `rgba(204, 255, 144, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sacred Circle on Ground
      const circleY = -w * tanA * 2;
      ctx.save();
      ctx.scale(1, ISO_Y_RATIO);
      ctx.strokeStyle = "rgba(118, 255, 3, 0.15)";
      ctx.lineWidth = 2 * s2;
      ctx.beginPath();
      ctx.arc(0, circleY, 38 * s2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([4 * s2, 4 * s2]);
      ctx.beginPath();
      ctx.arc(0, circleY, 32 * s2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(118, 255, 3, 0.2)";
      for (let d = 0; d < 4; d++) {
        const dAngle = (d * Math.PI) / 2;
        const dx = Math.cos(dAngle) * 35 * s2;
        const dy = circleY + Math.sin(dAngle) * 35 * s2;
        ctx.beginPath();
        ctx.arc(dx, dy, 3 * s2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // HEALING PULSE EFFECT
      if (isHealing) {
        const prog = healCycle / 1200;
        const ringRad = 200 * prog;
        const pulseY = -w * tanA * 2;

        ctx.save();
        ctx.scale(1, ISO_Y_RATIO);

        for (let ring = 0; ring < 3; ring++) {
          const ringProg = Math.max(0, prog - ring * 0.15);
          if (ringProg > 0) {
            const ringAlpha = (1 - ringProg) * (1 - ring * 0.3);
            ctx.strokeStyle = `rgba(118, 255, 3, ${ringAlpha})`;
            ctx.lineWidth = (4 - ring) * s2;
            ctx.beginPath();
            ctx.arc(0, pulseY, ringRad * s2 * (1 - ring * 0.2), 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(204, 255, 144, ${0.9 * (1 - prog)})`;
        for (let sym = 0; sym < 6; sym++) {
          const symAngle = (sym * Math.PI) / 3 + time * 0.5;
          const symDist = 25 + prog * 60;
          const sx = Math.cos(symAngle) * symDist * s2;
          const sy =
            pulseY - prog * 80 * s2 + Math.sin(symAngle) * symDist * s2 * 0.5;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(symAngle);

          ctx.fillRect(-1.5 * s2, -5 * s2, 3 * s2, 10 * s2);
          ctx.fillRect(-5 * s2, -1.5 * s2, 10 * s2, 3 * s2);
          ctx.restore();
        }
        ctx.restore();

        const beamAlpha = 0.4 * (1 - prog);
        const beamGrad = ctx.createLinearGradient(0, flameY, 0, -100 * s2);
        beamGrad.addColorStop(0, `rgba(204, 255, 144, ${beamAlpha})`);
        beamGrad.addColorStop(0.5, `rgba(118, 255, 3, ${beamAlpha * 0.5})`);
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-8 * s2, flameY);
        ctx.lineTo(-4 * s2, -100 * s2);
        ctx.lineTo(4 * s2, -100 * s2);
        ctx.lineTo(8 * s2, flameY);
        ctx.fill();
      }

      break;
    }

    case "barracks": {
      const bp = getBarracksBuildingPalette(mapTheme);
      const spawnCycle = Date.now() % 12000;
      const isSpawning = spawnCycle < 1500;
      const isPreparing = spawnCycle > 10500;

      const w = 34 * s;
      const h = 36 * s;
      const tanA = ISO_TAN;

      // Center the iso diamond on the tile (bottom vertex was at origin)
      ctx.translate(0, w * tanA);

      // Spawn Effect — ground circles (drawn under building)
      if (isSpawning) {
        const spawnCircleY = -w * tanA * 2;
        ctx.save();
        ctx.translate(0, spawnCircleY * 0.5);
        ctx.scale(1, ISO_Y_RATIO);
        ctx.rotate(time * 2);
        ctx.strokeStyle = `rgba(${bp.glowRgb}, ${1 - spawnCycle / 1500})`;
        ctx.lineWidth = 3 * s;
        ctx.setLineDash([8 * s, 4 * s]);
        ctx.beginPath();
        ctx.arc(0, 0, 45 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(-time * 3);
        ctx.strokeStyle = `rgba(${bp.glowRgbBright}, ${0.8 * (1 - spawnCycle / 1500)})`;
        ctx.setLineDash([4 * s, 8 * s]);
        ctx.beginPath();
        ctx.arc(0, 0, 30 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Foundation Shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, -w * tanA, 44 * s, 22 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone Foundation/Base Platform
      const baseH = 10 * s;
      const bw = w + 3 * s;
      const bTanOff = bw * tanA + 2 * s;
      // Left face
      const baseGradL = ctx.createLinearGradient(-bw, -bTanOff, 0, 0);
      baseGradL.addColorStop(0, bp.foundationL[0]);
      baseGradL.addColorStop(0.5, bp.foundationL[1]);
      baseGradL.addColorStop(1, bp.foundationL[2]);
      ctx.fillStyle = baseGradL;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-bw, -bTanOff);
      ctx.lineTo(-bw, -bTanOff - baseH);
      ctx.lineTo(0, -baseH);
      ctx.fill();
      // Right face
      const baseGradR = ctx.createLinearGradient(0, 0, bw, -bTanOff);
      baseGradR.addColorStop(0, bp.foundationR[0]);
      baseGradR.addColorStop(0.5, bp.foundationR[1]);
      baseGradR.addColorStop(1, bp.foundationR[2]);
      ctx.fillStyle = baseGradR;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(bw, -bTanOff);
      ctx.lineTo(bw, -bTanOff - baseH);
      ctx.lineTo(0, -baseH);
      ctx.fill();
      // Top face
      ctx.fillStyle = bp.foundationTop;
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(-bw, -bTanOff - baseH);
      ctx.lineTo(0, -bTanOff * 2 - baseH + 2 * s);
      ctx.lineTo(bw, -bTanOff - baseH);
      ctx.closePath();
      ctx.fill();
      // Iron banding across foundation
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 1.2 * s;
      for (let band = 0; band < 2; band++) {
        const by = -baseH * (0.35 + band * 0.4);
        ctx.beginPath();
        ctx.moveTo(-bw, -bTanOff + by);
        ctx.lineTo(0, by);
        ctx.lineTo(bw, -bTanOff + by);
        ctx.stroke();
      }
      // Foundation top edge highlight
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(-bw, -bTanOff - baseH);
      ctx.lineTo(0, -baseH);
      ctx.lineTo(bw, -bTanOff - baseH);
      ctx.stroke();
      // Corner rivets
      const rivetR = 1.5 * s;
      ctx.fillStyle = bp.stoneDark;
      ctx.beginPath();
      ctx.arc(0, -baseH * 0.5, rivetR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-bw * 0.5, -bTanOff * 0.5 - baseH * 0.5, rivetR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bw * 0.5, -bTanOff * 0.5 - baseH * 0.5, rivetR, 0, Math.PI * 2);
      ctx.fill();

      // ── Foundation Stone Courses — horizontal mortar lines ──
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.6 * s;
      for (let row = 0; row < 3; row++) {
        const fy = -baseH * ((row + 1) / 4);
        ctx.beginPath();
        ctx.moveTo(-bw, -bTanOff + fy);
        ctx.lineTo(0, fy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, fy);
        ctx.lineTo(bw, -bTanOff + fy);
        ctx.stroke();
      }
      // Vertical mortar joints on left face
      for (let row = 0; row < 3; row++) {
        const fy1 = -baseH * (row / 4);
        const fy2 = -baseH * ((row + 1) / 4);
        const offset = row % 2 === 0 ? 0.33 : 0.66;
        for (let j = 1; j <= 2; j++) {
          const jt = j * offset;
          const jx = -bw * jt;
          const jyBase = -bTanOff * jt;
          ctx.beginPath();
          ctx.moveTo(jx, jyBase + fy1);
          ctx.lineTo(jx, jyBase + fy2);
          ctx.stroke();
        }
      }
      // Vertical mortar joints on right face
      for (let row = 0; row < 3; row++) {
        const fy1 = -baseH * (row / 4);
        const fy2 = -baseH * ((row + 1) / 4);
        const offset = row % 2 === 0 ? 0.33 : 0.66;
        for (let j = 1; j <= 2; j++) {
          const jt = j * offset;
          const jx = bw * jt;
          const jyBase = -bTanOff * jt;
          ctx.beginPath();
          ctx.moveTo(jx, jyBase + fy1);
          ctx.lineTo(jx, jyBase + fy2);
          ctx.stroke();
        }
      }

      // ── Foundation Stepped Plinth — wider base course ──
      {
        const plinthH = 3 * s;
        const plinthExt = 3 * s;
        const pw = bw + plinthExt;
        const pTanOff = pw * tanA + 2 * s;
        ctx.fillStyle = bp.plinth[0];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-pw, -pTanOff);
        ctx.lineTo(-pw, -pTanOff - plinthH);
        ctx.lineTo(0, -plinthH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = bp.plinth[1];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(pw, -pTanOff);
        ctx.lineTo(pw, -pTanOff - plinthH);
        ctx.lineTo(0, -plinthH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = bp.plinth[2];
        ctx.beginPath();
        ctx.moveTo(0, -plinthH);
        ctx.lineTo(-pw, -pTanOff - plinthH);
        ctx.lineTo(0, -pTanOff * 2 - plinthH + 2 * s);
        ctx.lineTo(pw, -pTanOff - plinthH);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(-pw, -pTanOff - plinthH);
        ctx.lineTo(0, -plinthH);
        ctx.lineTo(pw, -pTanOff - plinthH);
        ctx.stroke();
      }

      // ── Foundation Drain Grates — small dark rectangles at base ──
      {
        const gratePositions = [
          { x: -bw * 0.4, yOff: -bTanOff * 0.4, wall: "left" as const },
          { x: bw * 0.6, yOff: -bTanOff * 0.6, wall: "right" as const },
        ];
        gratePositions.forEach((gp) => {
          ctx.save();
          ctx.translate(gp.x, gp.yOff - baseH * 0.15);
          if (gp.wall === "left") {
            ctx.transform(1, tanA, 0, 1, 0, 0);
          } else {
            ctx.transform(1, -tanA, 0, 1, 0, 0);
          }
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(-3 * s, -2 * s, 6 * s, 4 * s);
          ctx.strokeStyle = bp.stoneDark;
          ctx.lineWidth = 0.8 * s;
          for (let gi = 0; gi < 3; gi++) {
            const gx = -2 * s + gi * 2 * s;
            ctx.beginPath();
            ctx.moveTo(gx, -2 * s);
            ctx.lineTo(gx, 2 * s);
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      // Main Building Faces
      const wallGradL = ctx.createLinearGradient(
        -w,
        -w * tanA - baseH,
        0,
        -baseH,
      );
      wallGradL.addColorStop(0, bp.wallL[0]);
      wallGradL.addColorStop(0.3, bp.wallL[1]);
      wallGradL.addColorStop(0.7, bp.wallL[2]);
      wallGradL.addColorStop(1, bp.wallL[3]);
      ctx.fillStyle = wallGradL;
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(-w, -w * tanA - baseH);
      ctx.lineTo(-w, -w * tanA - h - baseH);
      ctx.lineTo(0, -h - baseH);
      ctx.fill();

      const wallGradR = ctx.createLinearGradient(
        0,
        -baseH,
        w,
        -w * tanA - baseH,
      );
      wallGradR.addColorStop(0, bp.wallR[0]);
      wallGradR.addColorStop(0.3, bp.wallR[1]);
      wallGradR.addColorStop(0.7, bp.wallR[2]);
      wallGradR.addColorStop(1, bp.wallR[3]);
      ctx.fillStyle = wallGradR;
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(w, -w * tanA - baseH);
      ctx.lineTo(w, -w * tanA - h - baseH);
      ctx.lineTo(0, -h - baseH);
      ctx.fill();

      // Wall edge highlights for 3D definition
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(0, -h - baseH);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.moveTo(-w, -w * tanA - baseH);
      ctx.lineTo(-w, -w * tanA - h - baseH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w, -w * tanA - baseH);
      ctx.lineTo(w, -w * tanA - h - baseH);
      ctx.stroke();

      // Base molding strip
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(-w, -w * tanA - baseH);
      ctx.lineTo(-w, -w * tanA - baseH - 3 * s);
      ctx.lineTo(0, -baseH - 3 * s);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(w, -w * tanA - baseH);
      ctx.lineTo(w, -w * tanA - baseH - 3 * s);
      ctx.lineTo(0, -baseH - 3 * s);
      ctx.fill();

      // Masonry Detail — clipped to each wall for precision
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(-w, -w * tanA - baseH);
      ctx.lineTo(-w, -w * tanA - h - baseH);
      ctx.lineTo(0, -h - baseH);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.7 * s;
      for (let row = 1; row < 6; row++) {
        const yOff = -(h / 6) * row - baseH;
        ctx.beginPath();
        ctx.moveTo(-w - 1 * s, -w * tanA + yOff);
        ctx.lineTo(1 * s, yOff);
        ctx.stroke();
        const off = row % 2 === 0 ? 5 * s : 0;
        for (let col = 1; col < 4; col++) {
          const xL = (-w / 4) * col + off * 0.2;
          ctx.beginPath();
          ctx.moveTo(xL, yOff - h / 6 + Math.abs(xL) * tanA);
          ctx.lineTo(xL, yOff + Math.abs(xL) * tanA);
          ctx.stroke();
        }
      }
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, -baseH);
      ctx.lineTo(w, -w * tanA - baseH);
      ctx.lineTo(w, -w * tanA - h - baseH);
      ctx.lineTo(0, -h - baseH);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 0.7 * s;
      for (let row = 1; row < 6; row++) {
        const yOff = -(h / 6) * row - baseH;
        ctx.beginPath();
        ctx.moveTo(-1 * s, yOff);
        ctx.lineTo(w + 1 * s, -w * tanA + yOff);
        ctx.stroke();
        const off = row % 2 === 0 ? 5 * s : 0;
        for (let col = 1; col < 4; col++) {
          const xR = (w / 4) * col - off * 0.2;
          ctx.beginPath();
          ctx.moveTo(xR, yOff - h / 6 + xR * tanA);
          ctx.lineTo(xR, yOff + xR * tanA);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Corner Quoin Stones — iso-aligned blocks along front edge
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const qy = -baseH - 4 * s - i * (h / 5.5);
        const qh = 8 * s;
        const qw = 5 * s;
        // Left quoin (iso-aligned to left wall)
        ctx.fillStyle = i % 2 === 0 ? bp.quoinL[0] : bp.quoinL[1];
        ctx.beginPath();
        ctx.moveTo(0, qy);
        ctx.lineTo(-qw, qy - qw * tanA);
        ctx.lineTo(-qw, qy - qw * tanA - qh);
        ctx.lineTo(0, qy - qh);
        ctx.closePath();
        ctx.fill();
        // Right quoin (iso-aligned to right wall)
        ctx.fillStyle = i % 2 === 0 ? bp.quoinR[0] : bp.quoinR[1];
        ctx.beginPath();
        ctx.moveTo(0, qy);
        ctx.lineTo(qw, qy - qw * tanA);
        ctx.lineTo(qw, qy - qw * tanA - qh);
        ctx.lineTo(0, qy - qh);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Cornice molding at wall-roof junction
      const corniceH = 5 * s;
      const corniceY = -h - baseH;
      const cornGradL = ctx.createLinearGradient(
        -w,
        -w * tanA + corniceY,
        0,
        corniceY,
      );
      cornGradL.addColorStop(0, bp.corniceL[0]);
      cornGradL.addColorStop(1, bp.corniceL[1]);
      ctx.fillStyle = cornGradL;
      ctx.beginPath();
      ctx.moveTo(0, corniceY);
      ctx.lineTo(-w - 2 * s, -w * tanA + corniceY - 1 * s);
      ctx.lineTo(-w - 2 * s, -(w + 2 * s) * tanA + corniceY - 1 * s - corniceH);
      ctx.lineTo(0, corniceY - corniceH);
      ctx.closePath();
      ctx.fill();
      const cornGradR = ctx.createLinearGradient(
        0,
        corniceY,
        w,
        -w * tanA + corniceY,
      );
      cornGradR.addColorStop(0, bp.corniceR[0]);
      cornGradR.addColorStop(1, bp.corniceR[1]);
      ctx.fillStyle = cornGradR;
      ctx.beginPath();
      ctx.moveTo(0, corniceY);
      ctx.lineTo(w + 2 * s, -w * tanA + corniceY - 1 * s);
      ctx.lineTo(w + 2 * s, -(w + 2 * s) * tanA + corniceY - 1 * s - corniceH);
      ctx.lineTo(0, corniceY - corniceH);
      ctx.closePath();
      ctx.fill();
      // Cornice top highlight
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(-w - 2 * s, -(w + 2 * s) * tanA + corniceY - 1 * s - corniceH);
      ctx.lineTo(0, corniceY - corniceH);
      ctx.lineTo(w + 2 * s, -(w + 2 * s) * tanA + corniceY - 1 * s - corniceH);
      ctx.stroke();
      // Dentil blocks along cornice
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      const dentilCount = 6;
      for (let i = 0; i < dentilCount; i++) {
        const t = (i + 0.5) / dentilCount;
        const dx = -w * t;
        const dy = -w * tanA * t + corniceY - corniceH * 0.3;
        ctx.fillRect(dx - 1.5 * s, dy - 2 * s, 3 * s, 3.5 * s);
        const drx = w * t;
        const dry = -w * tanA * t + corniceY - corniceH * 0.3;
        ctx.fillRect(drx - 1.5 * s, dry - 2 * s, 3 * s, 3.5 * s);
      }

      // (Battlements are drawn on the roof faces below)

      // Arrow Slit Windows — isometric flush with wall faces (two rows)
      {
        const slitHighY = -w * tanA * 0.5 - h * 0.7 - baseH;
        drawIsoFlushSlit(ctx, -w * 0.5, slitHighY, 2.5, 9, "left", s, {
          glowColor: isPreparing ? `rgba(${bp.glowRgb}` : undefined,
          glowAlpha: 0.4,
        });
        drawIsoFlushSlit(ctx, w * 0.5, slitHighY, 2.5, 9, "right", s, {
          glowColor: isPreparing ? `rgba(${bp.glowRgb}` : undefined,
          glowAlpha: 0.4,
        });
        // Second row — flanking slits further out
        const slitLowY = -w * tanA * 0.3 - h * 0.38 - baseH;
        drawIsoFlushSlit(ctx, -w * 0.75, slitLowY, 2, 7, "left", s, {});
        drawIsoFlushSlit(ctx, w * 0.75, slitLowY, 2, 7, "right", s, {});
        drawIsoFlushSlit(
          ctx,
          -w * 0.25,
          slitLowY + w * tanA * 0.25,
          2,
          7,
          "left",
          s,
          {},
        );
        drawIsoFlushSlit(
          ctx,
          w * 0.25,
          slitLowY + w * tanA * 0.25,
          2,
          7,
          "right",
          s,
          {},
        );
      }

      // The Grand Archway Door
      const doorY = -baseH - 6 * s;
      ctx.save();
      if (isPreparing || isSpawning) {
        ctx.shadowBlur = 20 * s;
        ctx.shadowColor = bp.glowHex;
      }

      // Archway stone surround (voussoirs)
      ctx.fillStyle = bp.stoneMid;
      ctx.beginPath();
      ctx.moveTo(-12 * s, doorY);
      ctx.lineTo(-12 * s, doorY - 18 * s);
      ctx.quadraticCurveTo(0, doorY - 30 * s, 12 * s, doorY - 18 * s);
      ctx.lineTo(12 * s, doorY);
      ctx.lineTo(9.5 * s, doorY);
      ctx.lineTo(9.5 * s, doorY - 17 * s);
      ctx.quadraticCurveTo(0, doorY - 27 * s, -9.5 * s, doorY - 17 * s);
      ctx.lineTo(-9.5 * s, doorY);
      ctx.closePath();
      ctx.fill();
      // Voussoir lines
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.8 * s;
      for (let vi = 0; vi < 7; vi++) {
        const angle = -Math.PI + (Math.PI / 8) * (vi + 1);
        const ix = Math.cos(angle) * 9.5 * s;
        const iy = doorY - 18 * s + Math.sin(angle) * 9.5 * s;
        const ox = Math.cos(angle) * 12 * s;
        const oy = doorY - 18 * s + Math.sin(angle) * 12 * s;
        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(ox, oy);
        ctx.stroke();
      }

      // Keystone at arch apex
      ctx.fillStyle = "#4E342E";
      ctx.beginPath();
      ctx.moveTo(-3.5 * s, doorY - 24 * s);
      ctx.lineTo(0, doorY - 28 * s);
      ctx.lineTo(3.5 * s, doorY - 24 * s);
      ctx.lineTo(2.5 * s, doorY - 21 * s);
      ctx.lineTo(-2.5 * s, doorY - 21 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.moveTo(-1.5 * s, doorY - 23 * s);
      ctx.lineTo(0, doorY - 26 * s);
      ctx.lineTo(1.5 * s, doorY - 23 * s);
      ctx.closePath();
      ctx.fill();

      // Door interior
      const archGrad = ctx.createLinearGradient(0, doorY - 22 * s, 0, doorY);
      archGrad.addColorStop(0, "#0a0a12");
      archGrad.addColorStop(0.5, isPreparing ? bp.doorGlowDark : "#1a1a2e");
      archGrad.addColorStop(1, isPreparing ? bp.doorGlowMid : "#263238");
      ctx.fillStyle = archGrad;
      ctx.beginPath();
      ctx.moveTo(-8.5 * s, doorY);
      ctx.lineTo(-8.5 * s, doorY - 16 * s);
      ctx.quadraticCurveTo(0, doorY - 25 * s, 8.5 * s, doorY - 16 * s);
      ctx.lineTo(8.5 * s, doorY);
      ctx.fill();

      // Iron portcullis bars
      ctx.strokeStyle = "rgba(80, 70, 60, 0.55)";
      ctx.lineWidth = 1.2 * s;
      for (let pi = -2; pi <= 2; pi++) {
        const px = pi * 3.5 * s;
        ctx.beginPath();
        ctx.moveTo(px, doorY);
        ctx.lineTo(px, doorY - 16 * s - (8.5 * s - Math.abs(px)) * 0.6);
        ctx.stroke();
      }
      // Horizontal portcullis crossbars
      ctx.lineWidth = 1 * s;
      for (let phi = 0; phi < 3; phi++) {
        const pby = doorY - 4 * s - phi * 6 * s;
        ctx.beginPath();
        ctx.moveTo(-8 * s, pby);
        ctx.lineTo(8 * s, pby);
        ctx.stroke();
      }

      // Door plank line (center seam)
      ctx.strokeStyle = "rgba(78, 52, 46, 0.2)";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(0, doorY);
      ctx.lineTo(0, doorY - 22 * s);
      ctx.stroke();

      // Iron reinforcement straps across the door
      ctx.strokeStyle = "rgba(40, 30, 20, 0.5)";
      ctx.lineWidth = 2 * s;
      for (let si = 0; si < 2; si++) {
        const sy = doorY - 5 * s - si * 8 * s;
        const halfW = 8 * s;
        ctx.beginPath();
        ctx.moveTo(-halfW, sy);
        ctx.lineTo(halfW, sy);
        ctx.stroke();
        ctx.fillStyle = "#3E2723";
        ctx.beginPath();
        ctx.arc(-halfW + 2 * s, sy, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(halfW - 2 * s, sy, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Door handle/ring knocker
      ctx.strokeStyle = "#5D4037";
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(3.5 * s, doorY - 9 * s, 2 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#4E342E";
      ctx.beginPath();
      ctx.arc(3.5 * s, doorY - 11 * s, 1 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Wall-mounted Torches with iron brackets
      const torchFlicker = Math.sin(time * 8) * 0.15 + 0.85;
      const torchFlicker2 = Math.sin(time * 11 + 1.5) * 0.12 + 0.88;
      const torchPositions = [
        { x: -16 * s, y: doorY - 14 * s, flk: torchFlicker },
        { x: 16 * s, y: doorY - 14 * s, flk: torchFlicker2 },
      ];
      torchPositions.forEach((tp) => {
        ctx.save();
        ctx.translate(tp.x, tp.y);
        // Iron bracket arm
        ctx.strokeStyle = "#3E2723";
        ctx.lineWidth = 2 * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 8 * s);
        ctx.lineTo(0, 3 * s);
        ctx.lineTo(tp.x < 0 ? 3 * s : -3 * s, 0);
        ctx.stroke();
        // Torch body
        ctx.fillStyle = "#5D4037";
        ctx.fillRect(-1.5 * s, -1 * s, 3 * s, 7 * s);
        ctx.fillStyle = "#4E342E";
        ctx.fillRect(-2.5 * s, 4 * s, 5 * s, 2.5 * s);
        // Warm glow on wall
        const glow = ctx.createRadialGradient(0, -3 * s, 0, 0, -3 * s, 16 * s);
        glow.addColorStop(0, `rgba(255, 150, 50, ${tp.flk * 0.15})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -3 * s, 16 * s, 0, Math.PI * 2);
        ctx.fill();
        // Flame — 3 layers
        ctx.shadowBlur = 10 * s;
        ctx.shadowColor = `rgba(255, 120, 30, ${tp.flk})`;
        const flameOff = Math.sin(time * 12 + (tp.x < 0 ? 0 : 2)) * 1.5 * s;
        ctx.fillStyle = `rgba(255, 80, 20, ${tp.flk * 0.7})`;
        ctx.beginPath();
        ctx.ellipse(flameOff * 0.5, -3 * s, 3.5 * s, 6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 180, 50, ${tp.flk})`;
        ctx.beginPath();
        ctx.ellipse(
          flameOff * 0.3,
          -4 * s,
          2.5 * s,
          4.5 * s,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = `rgba(255, 240, 120, ${tp.flk})`;
        ctx.beginPath();
        ctx.ellipse(0, -4.5 * s, 1.2 * s, 2.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // ── Crossed Spears — flush with right wall ──
      ctx.save();
      ctx.translate(w * 0.55, -w * tanA * 0.55 - h * 0.55 - baseH);
      ctx.transform(1, -tanA, 0, 1, 0, 0);
      ctx.strokeStyle = "#5D4037";
      ctx.lineWidth = 1.8 * s;
      ctx.lineCap = "round";
      // Spear shaft 1 (diagonal)
      ctx.beginPath();
      ctx.moveTo(-8 * s, 10 * s);
      ctx.lineTo(8 * s, -10 * s);
      ctx.stroke();
      // Spear shaft 2 (crossed)
      ctx.beginPath();
      ctx.moveTo(8 * s, 10 * s);
      ctx.lineTo(-8 * s, -10 * s);
      ctx.stroke();
      // Spearheads (triangular tips)
      ctx.fillStyle = "#78909C";
      ctx.beginPath();
      ctx.moveTo(8 * s, -10 * s);
      ctx.lineTo(6.5 * s, -13.5 * s);
      ctx.lineTo(10 * s, -13.5 * s);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8 * s, -10 * s);
      ctx.lineTo(-9.5 * s, -13.5 * s);
      ctx.lineTo(-6.5 * s, -13.5 * s);
      ctx.closePath();
      ctx.fill();
      // Central binding wrap
      ctx.fillStyle = "#8D6E63";
      ctx.fillRect(-2 * s, -2 * s, 4 * s, 4 * s);
      ctx.strokeStyle = "#6D4C41";
      ctx.lineWidth = 0.8 * s;
      ctx.strokeRect(-2 * s, -2 * s, 4 * s, 4 * s);
      ctx.restore();

      // ── Weapon Rack — flush with left wall ──
      ctx.save();
      ctx.translate(-w * 0.55, -w * tanA * 0.55 - h * 0.32 - baseH);
      ctx.transform(1, tanA, 0, 1, 0, 0);
      // Rack frame (horizontal bar + 2 uprights)
      ctx.strokeStyle = "#5D4037";
      ctx.lineWidth = 2 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-9 * s, 0);
      ctx.lineTo(9 * s, 0);
      ctx.stroke();
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(-8 * s, -1 * s);
      ctx.lineTo(-8 * s, 10 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8 * s, -1 * s);
      ctx.lineTo(8 * s, 10 * s);
      ctx.stroke();
      // Swords hanging from rack
      const swordXs = [-5, 0, 5];
      swordXs.forEach((sx) => {
        // Blade
        ctx.strokeStyle = "#90A4AE";
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(sx * s, 1 * s);
        ctx.lineTo(sx * s, 12 * s);
        ctx.stroke();
        // Hilt crossguard
        ctx.strokeStyle = "#8D6E63";
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo((sx - 2) * s, 1 * s);
        ctx.lineTo((sx + 2) * s, 1 * s);
        ctx.stroke();
        // Pommel
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(sx * s, -0.5 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // ── Supply Crates — iso boxes at building base ──
      {
        const crates = [
          {
            x: w * 0.65,
            y: -w * tanA * 0.65,
            bw: 8,
            bh: 7,
            bd: 6,
            c1: "#5D4037",
            c2: "#795548",
            c3: "#6D4C41",
          },
          {
            x: w * 0.85,
            y: -w * tanA * 0.85 - 2 * s,
            bw: 7,
            bh: 6,
            bd: 5,
            c1: "#4E342E",
            c2: "#6D4C41",
            c3: "#5D4037",
          },
          {
            x: w * 0.72,
            y: -w * tanA * 0.72 - 7 * s,
            bw: 6,
            bh: 5,
            bd: 5,
            c1: "#5D4037",
            c2: "#795548",
            c3: "#6D4C41",
          },
        ];
        crates.forEach((cr) => {
          const cbw = cr.bw * s;
          const cbh = cr.bh * s;
          const cbd = cr.bd * s;
          const cx = cr.x;
          const cy = cr.y;
          // Left face
          ctx.fillStyle = cr.c1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - cbw * 0.5, cy - cbw * tanA * 0.5);
          ctx.lineTo(cx - cbw * 0.5, cy - cbw * tanA * 0.5 - cbh);
          ctx.lineTo(cx, cy - cbh);
          ctx.closePath();
          ctx.fill();
          // Right face
          ctx.fillStyle = cr.c2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + cbd * 0.5, cy - cbd * tanA * 0.5);
          ctx.lineTo(cx + cbd * 0.5, cy - cbd * tanA * 0.5 - cbh);
          ctx.lineTo(cx, cy - cbh);
          ctx.closePath();
          ctx.fill();
          // Top face
          ctx.fillStyle = cr.c3;
          ctx.beginPath();
          ctx.moveTo(cx, cy - cbh);
          ctx.lineTo(cx - cbw * 0.5, cy - cbw * tanA * 0.5 - cbh);
          ctx.lineTo(
            cx - cbw * 0.5 + cbd * 0.5,
            cy - cbw * tanA * 0.5 - cbd * tanA * 0.5 - cbh,
          );
          ctx.lineTo(cx + cbd * 0.5, cy - cbd * tanA * 0.5 - cbh);
          ctx.closePath();
          ctx.fill();
          // Iron strap across front face
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(cx - cbw * 0.5, cy - cbw * tanA * 0.5 - cbh * 0.5);
          ctx.lineTo(cx, cy - cbh * 0.5);
          ctx.lineTo(cx + cbd * 0.5, cy - cbd * tanA * 0.5 - cbh * 0.5);
          ctx.stroke();
        });
      }

      // ── Sandbag Barricade — iso-aligned bags in front of door ──
      {
        const bagW = 7 * s;
        const bagD = 4 * s;
        const bagH = 3 * s;
        const drawIsoBag = (bx: number, by: number, shade: number) => {
          const cL = shade > 0 ? "#8D7B5A" : "#7D6B4A";
          const cR = shade > 0 ? "#A08E6A" : "#9B8B6A";
          const cT = shade > 0 ? "#B09E78" : "#A08E6A";
          // Left face
          ctx.fillStyle = cL;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - bagW * 0.5, by - bagW * tanA * 0.5);
          ctx.lineTo(bx - bagW * 0.5, by - bagW * tanA * 0.5 - bagH);
          ctx.lineTo(bx, by - bagH);
          ctx.closePath();
          ctx.fill();
          // Right face
          ctx.fillStyle = cR;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + bagD * 0.5, by - bagD * tanA * 0.5);
          ctx.lineTo(bx + bagD * 0.5, by - bagD * tanA * 0.5 - bagH);
          ctx.lineTo(bx, by - bagH);
          ctx.closePath();
          ctx.fill();
          // Top face (slightly puffy)
          ctx.fillStyle = cT;
          ctx.beginPath();
          ctx.moveTo(bx, by - bagH);
          ctx.lineTo(bx - bagW * 0.5, by - bagW * tanA * 0.5 - bagH);
          ctx.lineTo(
            bx - bagW * 0.5 + bagD * 0.5,
            by - bagW * tanA * 0.5 - bagD * tanA * 0.5 - bagH,
          );
          ctx.lineTo(bx + bagD * 0.5, by - bagD * tanA * 0.5 - bagH);
          ctx.closePath();
          ctx.fill();
          // Tie line
          ctx.strokeStyle = "rgba(60,45,25,0.25)";
          ctx.lineWidth = 0.6 * s;
          ctx.beginPath();
          ctx.moveTo(bx - bagW * 0.25, by - bagW * tanA * 0.25 - bagH);
          ctx.lineTo(
            bx - bagW * 0.25 + bagD * 0.5,
            by - bagW * tanA * 0.25 - bagD * tanA * 0.5 - bagH,
          );
          ctx.stroke();
        };
        // Bottom row (3 bags)
        drawIsoBag(-8 * s, 1 * s, 0);
        drawIsoBag(-1 * s, 1 * s, 1);
        drawIsoBag(6 * s, 1 * s, 0);
        // Top row (2 bags stacked, offset)
        drawIsoBag(-5 * s, 1 * s - bagH, 1);
        drawIsoBag(2 * s, 1 * s - bagH, 0);
      }

      // ── Training Dummy — iso-aligned near left side ──
      ctx.save();
      ctx.translate(-w * 0.85, -w * tanA * 0.85 + 2 * s);
      {
        // Iso pole (small iso box)
        const pW = 1.5 * s;
        ctx.fillStyle = "#5D4037";
        ctx.beginPath();
        ctx.moveTo(-pW, -pW * tanA);
        ctx.lineTo(-pW, -pW * tanA - 18 * s);
        ctx.lineTo(0, -18 * s);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#795548";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(pW, -pW * tanA);
        ctx.lineTo(pW, -pW * tanA - 18 * s);
        ctx.lineTo(0, -18 * s);
        ctx.closePath();
        ctx.fill();
        // Cross-arm (iso-aligned horizontal bar)
        ctx.fillStyle = "#5D4037";
        ctx.beginPath();
        ctx.moveTo(-5 * s, -14 * s - 5 * s * tanA);
        ctx.lineTo(5 * s, -14 * s - 5 * s * tanA);
        ctx.lineTo(5 * s, -15.5 * s - 5 * s * tanA);
        ctx.lineTo(-5 * s, -15.5 * s - 5 * s * tanA);
        ctx.closePath();
        ctx.fill();
        // Straw body — iso diamond torso
        const torsoW = 4 * s;
        const torsoH = 8 * s;
        const torsoY = -7 * s;
        ctx.fillStyle = "#C8B480";
        ctx.beginPath();
        ctx.moveTo(0, torsoY - torsoH);
        ctx.lineTo(-torsoW, torsoY - torsoH * 0.5);
        ctx.lineTo(0, torsoY);
        ctx.lineTo(torsoW, torsoY - torsoH * 0.5);
        ctx.closePath();
        ctx.fill();
        // Lighter inner diamond
        ctx.fillStyle = "#B8A470";
        ctx.beginPath();
        ctx.moveTo(0, torsoY - torsoH + 2 * s);
        ctx.lineTo(-torsoW + 1 * s, torsoY - torsoH * 0.5);
        ctx.lineTo(0, torsoY - 2 * s);
        ctx.lineTo(torsoW - 1 * s, torsoY - torsoH * 0.5);
        ctx.closePath();
        ctx.fill();
        // Target rings painted on torso
        ctx.strokeStyle = "rgba(180, 30, 30, 0.5)";
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(0, torsoY - torsoH * 0.5 - 2 * s);
        ctx.lineTo(-2 * s, torsoY - torsoH * 0.5);
        ctx.lineTo(0, torsoY - torsoH * 0.5 + 2 * s);
        ctx.lineTo(2 * s, torsoY - torsoH * 0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "rgba(180, 30, 30, 0.35)";
        ctx.beginPath();
        ctx.arc(0, torsoY - torsoH * 0.5, 1 * s, 0, Math.PI * 2);
        ctx.fill();
        // Head (small iso diamond)
        ctx.fillStyle = "#C8B480";
        ctx.beginPath();
        ctx.moveTo(0, -16.5 * s);
        ctx.lineTo(-2 * s, -15 * s);
        ctx.lineTo(0, -13.5 * s);
        ctx.lineTo(2 * s, -15 * s);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // (Barrels drawn after building for front layering)

      // (Corner turrets drawn after roof for proper layering)

      // ── The Roof — Isometric Hip Pyramid ──
      const roofH = 28 * s;
      const roofOH = 7 * s;
      const roofBase = -h - baseH;
      const roofCY = roofBase - w * tanA;
      const ow = w + roofOH;

      // Roof base diamond vertices (with overhang)
      const rF = { x: 0, y: roofCY + ow * tanA };
      const rL = { x: -ow, y: roofCY };
      const rB = { x: 0, y: roofCY - ow * tanA };
      const rR = { x: ow, y: roofCY };
      const peak = { x: 0, y: roofCY - roofH };

      // Eave band — visible front-left and front-right strips
      const eaveH = 4 * s;
      ctx.fillStyle = "#1a1a28";
      ctx.beginPath();
      ctx.moveTo(rF.x, rF.y);
      ctx.lineTo(rL.x, rL.y);
      ctx.lineTo(rL.x, rL.y - eaveH);
      ctx.lineTo(rF.x, rF.y - eaveH);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#252538";
      ctx.beginPath();
      ctx.moveTo(rR.x, rR.y);
      ctx.lineTo(rF.x, rF.y);
      ctx.lineTo(rF.x, rF.y - eaveH);
      ctx.lineTo(rR.x, rR.y - eaveH);
      ctx.closePath();
      ctx.fill();
      // Eave bottom highlight
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(rL.x, rL.y);
      ctx.lineTo(rF.x, rF.y);
      ctx.lineTo(rR.x, rR.y);
      ctx.stroke();

      // ── Back Parapet & Merlons (drawn before roof faces so they appear behind) ──
      {
        const parH = 5 * s;
        // Back-left parapet wall (rL → rB)
        ctx.fillStyle = bp.wallL[0];
        ctx.beginPath();
        ctx.moveTo(rL.x, rL.y - eaveH);
        ctx.lineTo(rB.x, rB.y - eaveH);
        ctx.lineTo(rB.x, rB.y - eaveH - parH);
        ctx.lineTo(rL.x, rL.y - eaveH - parH);
        ctx.closePath();
        ctx.fill();
        // Back-right parapet wall (rB → rR)
        ctx.fillStyle = bp.wallL[1];
        ctx.beginPath();
        ctx.moveTo(rB.x, rB.y - eaveH);
        ctx.lineTo(rR.x, rR.y - eaveH);
        ctx.lineTo(rR.x, rR.y - eaveH - parH);
        ctx.lineTo(rB.x, rB.y - eaveH - parH);
        ctx.closePath();
        ctx.fill();
        const mH = 5 * s;
        const mHW = 3 * s;
        const mCount = 5;
        // Merlons along back-left eave edge (rL → rB)
        for (let mi = 0; mi < mCount; mi++) {
          const t = (mi + 0.5) / (mCount + 0.5);
          const mx = rL.x * (1 - t) + rB.x * t;
          const my =
            (rL.y - eaveH - parH) * (1 - t) + (rB.y - eaveH - parH) * t;
          const edx = rB.x - rL.x;
          const edy = (rB.y - eaveH) - (rL.y - eaveH);
          const eLen = Math.sqrt(edx * edx + edy * edy);
          const nx = (edx / eLen) * mHW;
          const ny = (edy / eLen) * mHW;
          ctx.fillStyle = mi % 2 === 0 ? bp.wallL[0] : bp.stoneDark;
          ctx.beginPath();
          ctx.moveTo(mx - nx, my - ny);
          ctx.lineTo(mx + nx, my + ny);
          ctx.lineTo(mx + nx, my + ny - mH);
          ctx.lineTo(mx - nx, my - ny - mH);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = bp.wallL[2];
          ctx.beginPath();
          ctx.moveTo(mx - nx, my - ny - mH);
          ctx.lineTo(mx + nx, my + ny - mH);
          ctx.lineTo(mx + nx - 2 * s, my + ny - mH - 1 * s);
          ctx.lineTo(mx - nx - 2 * s, my - ny - mH - 1 * s);
          ctx.closePath();
          ctx.fill();
        }
        // Merlons along back-right eave edge (rB → rR)
        for (let mi = 0; mi < mCount; mi++) {
          const t = (mi + 0.5) / (mCount + 0.5);
          const mx = rB.x * (1 - t) + rR.x * t;
          const my =
            (rB.y - eaveH - parH) * (1 - t) + (rR.y - eaveH - parH) * t;
          const edx = rR.x - rB.x;
          const edy = (rR.y - eaveH) - (rB.y - eaveH);
          const eLen = Math.sqrt(edx * edx + edy * edy);
          const nx = (edx / eLen) * mHW;
          const ny = (edy / eLen) * mHW;
          ctx.fillStyle = mi % 2 === 0 ? bp.wallL[1] : bp.wallL[0];
          ctx.beginPath();
          ctx.moveTo(mx - nx, my - ny);
          ctx.lineTo(mx + nx, my + ny);
          ctx.lineTo(mx + nx, my + ny - mH);
          ctx.lineTo(mx - nx, my - ny - mH);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = bp.wallL[2];
          ctx.beginPath();
          ctx.moveTo(mx - nx, my - ny - mH);
          ctx.lineTo(mx + nx, my + ny - mH);
          ctx.lineTo(mx + nx + 2 * s, my + ny - mH - 1 * s);
          ctx.lineTo(mx - nx + 2 * s, my - ny - mH - 1 * s);
          ctx.closePath();
          ctx.fill();
        }
        // Back corner cap at rB
        ctx.fillStyle = bp.wallL[1];
        ctx.beginPath();
        ctx.moveTo(rB.x - 3 * s, rB.y - eaveH - parH);
        ctx.lineTo(rB.x + 3 * s, rB.y - eaveH - parH);
        ctx.lineTo(rB.x + 3 * s, rB.y - eaveH - parH - 6 * s);
        ctx.lineTo(rB.x - 3 * s, rB.y - eaveH - parH - 6 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = bp.wallL[2];
        ctx.fillRect(rB.x - 3.5 * s, rB.y - eaveH - parH - 6 * s - 1.5 * s, 7 * s, 1.5 * s);
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(rB.x - 0.8 * s, rB.y - eaveH - parH - 4.5 * s, 1.6 * s, 3 * s);
      }

      // Pyramid faces — back pair first, then front pair
      // Back-left face
      ctx.fillStyle = "#1E2D3D";
      ctx.beginPath();
      ctx.moveTo(rL.x, rL.y - eaveH);
      ctx.lineTo(rB.x, rB.y - eaveH);
      ctx.lineTo(peak.x, peak.y);
      ctx.closePath();
      ctx.fill();
      // Back-right face
      ctx.fillStyle = "#243444";
      ctx.beginPath();
      ctx.moveTo(rB.x, rB.y - eaveH);
      ctx.lineTo(rR.x, rR.y - eaveH);
      ctx.lineTo(peak.x, peak.y);
      ctx.closePath();
      ctx.fill();

      // Front-left face (most visible, darker — light from right)
      const roofGradFL = ctx.createLinearGradient(rL.x, rL.y, peak.x, peak.y);
      roofGradFL.addColorStop(0, "#1B2631");
      roofGradFL.addColorStop(0.4, "#212F3C");
      roofGradFL.addColorStop(1, "#283747");
      ctx.fillStyle = roofGradFL;
      ctx.beginPath();
      ctx.moveTo(rF.x, rF.y - eaveH);
      ctx.lineTo(rL.x, rL.y - eaveH);
      ctx.lineTo(peak.x, peak.y);
      ctx.closePath();
      ctx.fill();

      // Front-right face (lighter — catches light)
      const roofGradFR = ctx.createLinearGradient(rR.x, rR.y, peak.x, peak.y);
      roofGradFR.addColorStop(0, "#2C3E50");
      roofGradFR.addColorStop(0.5, "#34495E");
      roofGradFR.addColorStop(1, "#3A5068");
      ctx.fillStyle = roofGradFR;
      ctx.beginPath();
      ctx.moveTo(rR.x, rR.y - eaveH);
      ctx.lineTo(rF.x, rF.y - eaveH);
      ctx.lineTo(peak.x, peak.y);
      ctx.closePath();
      ctx.fill();

      // Tile course lines — front-left face
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.8 * s;
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        const ax = rF.x * (1 - t) + peak.x * t;
        const ay = (rF.y - eaveH) * (1 - t) + peak.y * t;
        const bx = rL.x * (1 - t) + peak.x * t;
        const by = (rL.y - eaveH) * (1 - t) + peak.y * t;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      // Tile course lines — front-right face
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        const ax = rR.x * (1 - t) + peak.x * t;
        const ay = (rR.y - eaveH) * (1 - t) + peak.y * t;
        const bx = rF.x * (1 - t) + peak.x * t;
        const by = (rF.y - eaveH) * (1 - t) + peak.y * t;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // ── Roof Parapet — stone battlement wall along eave edges ──
      {
        const parH = 5 * s;
        ctx.fillStyle = "#4A5C65";
        ctx.beginPath();
        ctx.moveTo(rF.x, rF.y - eaveH);
        ctx.lineTo(rL.x, rL.y - eaveH);
        ctx.lineTo(rL.x, rL.y - eaveH - parH);
        ctx.lineTo(rF.x, rF.y - eaveH - parH);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#566D78";
        ctx.beginPath();
        ctx.moveTo(rR.x, rR.y - eaveH);
        ctx.lineTo(rF.x, rF.y - eaveH);
        ctx.lineTo(rF.x, rF.y - eaveH - parH);
        ctx.lineTo(rR.x, rR.y - eaveH - parH);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(rL.x, rL.y - eaveH - parH);
        ctx.lineTo(rF.x, rF.y - eaveH - parH);
        ctx.lineTo(rR.x, rR.y - eaveH - parH);
        ctx.stroke();

        // (Merlons and corner caps drawn after turrets for front layering)
      }

      // Ridge lines (visible edges)
      ctx.strokeStyle = "#4E342E";
      ctx.lineWidth = 3 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(rL.x, rL.y - eaveH);
      ctx.lineTo(peak.x, peak.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rF.x, rF.y - eaveH);
      ctx.lineTo(peak.x, peak.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rR.x, rR.y - eaveH);
      ctx.lineTo(peak.x, peak.y);
      ctx.stroke();
      // Ridge highlight (front edges only)
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(rF.x, rF.y - eaveH);
      ctx.lineTo(peak.x, peak.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rR.x, rR.y - eaveH);
      ctx.lineTo(peak.x, peak.y);
      ctx.stroke();

      // Peak finial — golden spearhead
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(peak.x, peak.y - 10 * s);
      ctx.lineTo(peak.x - 3.5 * s, peak.y - 1 * s);
      ctx.lineTo(peak.x + 3.5 * s, peak.y - 1 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#FFA000";
      ctx.beginPath();
      ctx.arc(peak.x, peak.y - 4 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      // Finial highlight
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(peak.x - 1 * s, peak.y - 5 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // ── Corner Watchtower Turrets (drawn after roof for layering) ──
      {
        const turretR = 7 * s;
        const turretH = 14 * s;
        const turretCapH = 8 * s;
        const tBaseY = corniceY - corniceH;
        const turrets = [
          { x: -w, y: -w * tanA + tBaseY, side: "left" as const },
          { x: w, y: -w * tanA + tBaseY, side: "right" as const },
        ];
        turrets.forEach((tt) => {
          ctx.save();
          ctx.translate(tt.x, tt.y);
          const tLc = tt.side === "left" ? bp.wallL[0] : bp.wallL[1];
          ctx.fillStyle = tLc;
          ctx.beginPath();
          ctx.moveTo(-turretR, 0);
          ctx.lineTo(-turretR, -turretH);
          ctx.lineTo(0, -turretH);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
          const tRc = tt.side === "left" ? bp.wallR[2] : bp.wallR[1];
          ctx.fillStyle = tRc;
          ctx.beginPath();
          ctx.moveTo(turretR, 0);
          ctx.lineTo(turretR, -turretH);
          ctx.lineTo(0, -turretH);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = bp.foundationTop;
          ctx.beginPath();
          ctx.moveTo(0, -turretH + turretR * tanA);
          ctx.lineTo(-turretR, -turretH);
          ctx.lineTo(0, -turretH - turretR * tanA);
          ctx.lineTo(turretR, -turretH);
          ctx.closePath();
          ctx.fill();
          const tmH = 3.5 * s;
          const tmW = 2.5 * s;
          for (let mi = 0; mi < 2; mi++) {
            const tmx = -turretR + (mi + 0.5) * (turretR / 1.5);
            ctx.fillStyle = tLc;
            ctx.fillRect(tmx - tmW * 0.5, -turretH - tmH, tmW, tmH);
            ctx.fillStyle = "rgba(255,255,255,0.05)";
            ctx.fillRect(tmx - tmW * 0.5, -turretH - tmH, tmW, 1 * s);
          }
          for (let mi = 0; mi < 2; mi++) {
            const tmx = (mi + 0.5) * (turretR / 1.5);
            ctx.fillStyle = tRc;
            ctx.fillRect(tmx - tmW * 0.5, -turretH - tmH, tmW, tmH);
            ctx.fillStyle = "rgba(255,255,255,0.05)";
            ctx.fillRect(tmx - tmW * 0.5, -turretH - tmH, tmW, 1 * s);
          }
          ctx.fillStyle = "#1a1a2e";
          ctx.fillRect(-1 * s, -turretH * 0.7, 2 * s, 5 * s);
          ctx.fillRect(-2 * s, -turretH * 0.5, 4 * s, 1.5 * s);
          ctx.fillStyle = "#1B2631";
          ctx.beginPath();
          ctx.moveTo(0, -turretH - tmH - turretCapH);
          ctx.lineTo(-turretR - 1 * s, -turretH - tmH);
          ctx.lineTo(0, -turretH - tmH + turretR * tanA);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#283747";
          ctx.beginPath();
          ctx.moveTo(0, -turretH - tmH - turretCapH);
          ctx.lineTo(turretR + 1 * s, -turretH - tmH);
          ctx.lineTo(0, -turretH - tmH + turretR * tanA);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.06)";
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.moveTo(0, -turretH - tmH - turretCapH);
          ctx.lineTo(0, -turretH - tmH + turretR * tanA);
          ctx.stroke();
          ctx.fillStyle = "#8B0000";
          ctx.beginPath();
          ctx.moveTo(0, -turretH - tmH - turretCapH);
          ctx.lineTo(5 * s, -turretH - tmH - turretCapH - 2 * s);
          ctx.lineTo(5 * s, -turretH - tmH - turretCapH + 3 * s);
          ctx.lineTo(0, -turretH - tmH - turretCapH + 1 * s);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      // ── Merlons & Corner Caps (drawn after turrets for front layering) ──
      {
        const parH = 5 * s;
        const mH = 5 * s;
        const mHW = 3 * s;
        const mCount = 5;
        // Merlons along front-left eave edge
        for (let mi = 0; mi < mCount; mi++) {
          const t = (mi + 0.5) / (mCount + 0.5);
          const mx = rF.x * (1 - t) + rL.x * t;
          const my =
            (rF.y - eaveH - parH) * (1 - t) + (rL.y - eaveH - parH) * t;
          const edx = rL.x - rF.x;
          const edy = rL.y - eaveH - (rF.y - eaveH);
          const eLen = Math.sqrt(edx * edx + edy * edy);
          const nx = (edx / eLen) * mHW;
          const ny = (edy / eLen) * mHW;
          ctx.fillStyle = mi % 2 === 0 ? bp.wallL[3] : bp.wallL[2];
          ctx.beginPath();
          ctx.moveTo(mx - nx, my - ny);
          ctx.lineTo(mx + nx, my + ny);
          ctx.lineTo(mx + nx, my + ny - mH);
          ctx.lineTo(mx - nx, my - ny - mH);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = bp.wallR[2];
          ctx.beginPath();
          ctx.moveTo(mx - nx, my - ny - mH);
          ctx.lineTo(mx + nx, my + ny - mH);
          ctx.lineTo(mx + nx + 2 * s, my + ny - mH - 1 * s);
          ctx.lineTo(mx - nx + 2 * s, my - ny - mH - 1 * s);
          ctx.closePath();
          ctx.fill();
        }
        // Merlons along front-right eave edge
        for (let mi = 0; mi < mCount; mi++) {
          const t = (mi + 0.5) / (mCount + 0.5);
          const mx = rR.x * (1 - t) + rF.x * t;
          const my =
            (rR.y - eaveH - parH) * (1 - t) + (rF.y - eaveH - parH) * t;
          const edx = rF.x - rR.x;
          const edy = rF.y - eaveH - (rR.y - eaveH);
          const eLen = Math.sqrt(edx * edx + edy * edy);
          const nx = (edx / eLen) * mHW;
          const ny = (edy / eLen) * mHW;
          ctx.fillStyle = mi % 2 === 0 ? bp.wallR[2] : bp.wallR[3];
          ctx.beginPath();
          ctx.moveTo(mx - nx, my - ny);
          ctx.lineTo(mx + nx, my + ny);
          ctx.lineTo(mx + nx, my + ny - mH);
          ctx.lineTo(mx - nx, my - ny - mH);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = bp.wallR[1];
          ctx.beginPath();
          ctx.moveTo(mx - nx, my - ny - mH);
          ctx.lineTo(mx + nx, my + ny - mH);
          ctx.lineTo(mx + nx - 2 * s, my + ny - mH - 1 * s);
          ctx.lineTo(mx - nx - 2 * s, my - ny - mH - 1 * s);
          ctx.closePath();
          ctx.fill();
        }
        // Corner merlon caps at rF, rL, rR
        const cornerPts = [
          { x: rF.x, y: rF.y - eaveH - parH },
          { x: rL.x, y: rL.y - eaveH - parH },
          { x: rR.x, y: rR.y - eaveH - parH },
        ];
        cornerPts.forEach((cp) => {
          ctx.fillStyle = bp.foundationTop;
          ctx.beginPath();
          ctx.moveTo(cp.x - 3 * s, cp.y);
          ctx.lineTo(cp.x + 3 * s, cp.y);
          ctx.lineTo(cp.x + 3 * s, cp.y - 6 * s);
          ctx.lineTo(cp.x - 3 * s, cp.y - 6 * s);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = bp.wallR[2];
          ctx.fillRect(cp.x - 3.5 * s, cp.y - 6 * s - 1.5 * s, 7 * s, 1.5 * s);
          ctx.fillStyle = "#1a1a2e";
          ctx.fillRect(cp.x - 0.8 * s, cp.y - 4.5 * s, 1.6 * s, 3 * s);
        });
      }

      // Waving Banner — medieval gonfalon style
      ctx.save();
      {
        const poleX = -w * 0.45;
        const poleY = -w * tanA * 0.35 - h - baseH - 22 * s;
        ctx.translate(poleX, poleY);
        const poleH = 35 * s;

        // Pole shadow
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(-1 * s, 2 * s, 4 * s, -poleH);

        // Pole body — tapered wood with grain gradient
        const poleGrad = ctx.createLinearGradient(-2 * s, 0, 2 * s, 0);
        poleGrad.addColorStop(0, "#4E342E");
        poleGrad.addColorStop(0.3, "#795548");
        poleGrad.addColorStop(0.6, "#8D6E63");
        poleGrad.addColorStop(1, "#5D4037");
        ctx.fillStyle = poleGrad;
        ctx.beginPath();
        ctx.moveTo(-2 * s, 0);
        ctx.lineTo(-1.5 * s, -poleH);
        ctx.lineTo(1.5 * s, -poleH);
        ctx.lineTo(2 * s, 0);
        ctx.closePath();
        ctx.fill();

        // Pole highlight edge
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 0.6 * s;
        ctx.beginPath();
        ctx.moveTo(-0.5 * s, 0);
        ctx.lineTo(-0.3 * s, -poleH);
        ctx.stroke();

        // Iron bands on pole
        const bandColor = "#37474F";
        const bandPositions = [0.15, 0.4, 0.65, 0.85];
        bandPositions.forEach((bp) => {
          const by = -poleH * bp;
          ctx.fillStyle = bandColor;
          ctx.fillRect(-2.5 * s, by - 1 * s, 5 * s, 2 * s);
          ctx.strokeStyle = "rgba(255,255,255,0.08)";
          ctx.lineWidth = 0.5 * s;
          ctx.beginPath();
          ctx.moveTo(-2.5 * s, by - 1 * s);
          ctx.lineTo(2.5 * s, by - 1 * s);
          ctx.stroke();
        });

        // Iron crossbar for hanging banner
        const crossY = -poleH * 0.88;
        const crossLen = 15 * s;
        ctx.fillStyle = "#455A64";
        ctx.fillRect(0, crossY - 1 * s, crossLen, 2.5 * s);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 0.5 * s;
        ctx.beginPath();
        ctx.moveTo(0, crossY - 1 * s);
        ctx.lineTo(crossLen, crossY - 1 * s);
        ctx.stroke();
        // Crossbar end finial (small ball)
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(crossLen, crossY + 0.25 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.arc(crossLen - 0.5 * s, crossY - 0.5 * s, 0.8 * s, 0, Math.PI * 2);
        ctx.fill();

        // Pole top finial — golden spearhead
        const finY = -poleH;
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.moveTo(0, finY - 8 * s);
        ctx.lineTo(-2.5 * s, finY - 1.5 * s);
        ctx.lineTo(2.5 * s, finY - 1.5 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FFC107";
        ctx.beginPath();
        ctx.moveTo(0, finY - 6.5 * s);
        ctx.lineTo(-1.2 * s, finY - 2 * s);
        ctx.lineTo(1.2 * s, finY - 2 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FFA000";
        ctx.beginPath();
        ctx.ellipse(0, finY - 1 * s, 3 * s, 1.2 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ctx.arc(-0.6 * s, finY - 5 * s, 0.8 * s, 0, Math.PI * 2);
        ctx.fill();

        // Banner cloth — hangs from crossbar
        const bannerTime = time * 2.5;
        const bW = 13 * s;
        const bH = 18 * s;
        const bStartX = 1 * s;
        const bStartY = crossY + 1.5 * s;

        // Drop shadow
        ctx.save();
        ctx.translate(2 * s, 2 * s);
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY);
        for (let i = 0; i <= bW; i += s) {
          const t = i / bW;
          const wave = Math.sin(bannerTime + t * 6) * 3 * s * t;
          ctx.lineTo(bStartX + i, bStartY + wave);
        }
        const tailWaveR = Math.sin(bannerTime + 6) * 3 * s;
        ctx.lineTo(bStartX + bW, bStartY + bH * 0.7 + tailWaveR);
        ctx.lineTo(bStartX + bW * 0.5, bStartY + bH + Math.sin(bannerTime + 3) * 2 * s);
        ctx.lineTo(bStartX, bStartY + bH * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Main banner — dark crimson base
        ctx.fillStyle = "#7B1818";
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY);
        for (let i = 0; i <= bW; i += s) {
          const t = i / bW;
          const wave = Math.sin(bannerTime + t * 6) * 3 * s * t;
          ctx.lineTo(bStartX + i, bStartY + wave);
        }
        const tailWaveR2 = Math.sin(bannerTime + 6) * 3 * s;
        ctx.lineTo(bStartX + bW, bStartY + bH * 0.7 + tailWaveR2);
        ctx.lineTo(bStartX + bW * 0.5, bStartY + bH + Math.sin(bannerTime + 3) * 2 * s);
        ctx.lineTo(bStartX, bStartY + bH * 0.7);
        ctx.closePath();
        ctx.fill();

        // Banner overlay — richer crimson with wave-driven shading
        ctx.save();
        ctx.clip();
        const banGrad = ctx.createLinearGradient(bStartX, bStartY, bStartX, bStartY + bH);
        banGrad.addColorStop(0, "#C62828");
        banGrad.addColorStop(0.3, "#B71C1C");
        banGrad.addColorStop(0.6, "#8B0000");
        banGrad.addColorStop(1, "#6A0000");
        ctx.fillStyle = banGrad;
        ctx.fillRect(bStartX, bStartY - 5 * s, bW + 2 * s, bH + 10 * s);

        // Vertical wave-based light/dark stripes for cloth folds
        for (let i = 0; i <= bW; i += s) {
          const t = i / bW;
          const wave = Math.sin(bannerTime + t * 6);
          const alpha = wave > 0 ? wave * 0.12 : -wave * 0.15;
          ctx.fillStyle = wave > 0
            ? `rgba(255,200,150,${alpha})`
            : `rgba(0,0,0,${alpha})`;
          const wy = Math.sin(bannerTime + t * 6) * 3 * s * t;
          ctx.fillRect(bStartX + i, bStartY + wy - 2 * s, s, bH);
        }
        ctx.restore();

        // Gold trim border — top edge
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY);
        for (let i = 0; i <= bW; i += s) {
          const t = i / bW;
          const wave = Math.sin(bannerTime + t * 6) * 3 * s * t;
          ctx.lineTo(bStartX + i, bStartY + wave);
        }
        ctx.stroke();

        // Gold trim border — left & right edges + swallowtail
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY);
        ctx.lineTo(bStartX, bStartY + bH * 0.7);
        ctx.lineTo(bStartX + bW * 0.5, bStartY + bH + Math.sin(bannerTime + 3) * 2 * s);
        const tailWaveR3 = Math.sin(bannerTime + 6) * 3 * s;
        ctx.lineTo(bStartX + bW, bStartY + bH * 0.7 + tailWaveR3);
        ctx.stroke();

        // Central crest — Princeton shield
        const cX = bStartX + bW * 0.5 + Math.sin(bannerTime + 3) * 1.5 * s;
        const cY = bStartY + bH * 0.32 + Math.sin(bannerTime + 3) * 1 * s;
        const cR = 5.5 * s;

        // Shield outline
        ctx.fillStyle = "#1a1a2e";
        ctx.beginPath();
        ctx.moveTo(cX, cY - cR * 1.1);
        ctx.lineTo(cX - cR, cY - cR * 0.3);
        ctx.lineTo(cX - cR, cY + cR * 0.3);
        ctx.quadraticCurveTo(cX, cY + cR * 1.2, cX + cR, cY + cR * 0.3);
        ctx.lineTo(cX + cR, cY - cR * 0.3);
        ctx.closePath();
        ctx.fill();

        // Shield field — orange
        const shieldGrad = ctx.createLinearGradient(cX, cY - cR, cX, cY + cR);
        shieldGrad.addColorStop(0, "#FF9800");
        shieldGrad.addColorStop(0.5, "#f97316");
        shieldGrad.addColorStop(1, "#E65100");
        ctx.fillStyle = shieldGrad;
        const si = 0.75;
        ctx.beginPath();
        ctx.moveTo(cX, cY - cR * 1.1 * si);
        ctx.lineTo(cX - cR * si, cY - cR * 0.3 * si);
        ctx.lineTo(cX - cR * si, cY + cR * 0.3 * si);
        ctx.quadraticCurveTo(cX, cY + cR * 1.2 * si, cX + cR * si, cY + cR * 0.3 * si);
        ctx.lineTo(cX + cR * si, cY - cR * 0.3 * si);
        ctx.closePath();
        ctx.fill();

        // Shield chevron
        ctx.strokeStyle = "#1a1a2e";
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(cX - cR * 0.6, cY);
        ctx.lineTo(cX, cY - cR * 0.5);
        ctx.lineTo(cX + cR * 0.6, cY);
        ctx.stroke();

        // Shield highlight
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.moveTo(cX, cY - cR * 0.8);
        ctx.lineTo(cX - cR * 0.5, cY - cR * 0.15);
        ctx.lineTo(cX, cY + cR * 0.1);
        ctx.lineTo(cX + cR * 0.5, cY - cR * 0.15);
        ctx.closePath();
        ctx.fill();

        // Gold fringe tassels along bottom swallowtail edges
        ctx.fillStyle = "#FFD700";
        const fringeCount = 6;
        for (let fi = 0; fi < fringeCount; fi++) {
          const ft = (fi + 0.5) / fringeCount;
          // Left tail edge
          const flx = bStartX + (bW * 0.5) * ft;
          const fly = bStartY + bH * 0.7 * (1 - ft) + (bH + Math.sin(bannerTime + 3) * 2 * s) * ft;
          ctx.beginPath();
          ctx.arc(flx, fly + 1 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
          // Right tail edge
          const frx = bStartX + bW * 0.5 + (bW * 0.5) * (1 - ft);
          const frt = 1 - ft;
          const fry = (bStartY + bH + Math.sin(bannerTime + 3) * 2 * s) * (1 - frt) +
            (bStartY + bH * 0.7 + tailWaveR3) * frt;
          ctx.beginPath();
          ctx.arc(frx, fry + 1 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }

        // Iron ring mounts (banner hangs from crossbar)
        ctx.fillStyle = "#546E7A";
        for (let ri = 0; ri < 4; ri++) {
          const rx = bStartX + (bW / 3) * ri;
          const ry = bStartY - 1 * s + Math.sin(bannerTime + (ri / 3) * 6) * 1 * s;
          ctx.beginPath();
          ctx.arc(rx, ry, 1.2 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Shield Emblem — flush with left wall face
      ctx.save();
      ctx.translate(-w * 0.5, -w * tanA * 0.5 - h * 0.72 - baseH);
      ctx.transform(1, tanA, 0, 1, 0, 0);
      // Outer shield border
      const shR = 9 * s;
      ctx.fillStyle = bp.stoneDark;
      ctx.beginPath();
      ctx.moveTo(0, -shR);
      ctx.lineTo(-shR * 0.9, -shR * 0.4);
      ctx.lineTo(-shR * 0.9, shR * 0.3);
      ctx.quadraticCurveTo(0, shR * 1.1, shR * 0.9, shR * 0.3);
      ctx.lineTo(shR * 0.9, -shR * 0.4);
      ctx.closePath();
      ctx.fill();
      // Inner shield field
      const shGrad = ctx.createLinearGradient(0, -shR * 0.7, 0, shR * 0.7);
      shGrad.addColorStop(0, "#FF8C00");
      shGrad.addColorStop(0.5, "#f97316");
      shGrad.addColorStop(1, "#E65100");
      ctx.fillStyle = shGrad;
      const sI = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, -shR * sI);
      ctx.lineTo(-shR * 0.9 * sI, -shR * 0.4 * sI);
      ctx.lineTo(-shR * 0.9 * sI, shR * 0.3 * sI);
      ctx.quadraticCurveTo(0, shR * 1.1 * sI, shR * 0.9 * sI, shR * 0.3 * sI);
      ctx.lineTo(shR * 0.9 * sI, -shR * 0.4 * sI);
      ctx.closePath();
      ctx.fill();
      // Crossed swords icon
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 1.8 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-4 * s, -3 * s);
      ctx.lineTo(4 * s, 5 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4 * s, -3 * s);
      ctx.lineTo(-4 * s, 5 * s);
      ctx.stroke();
      // Sword hilts
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.moveTo(-5.5 * s, -2 * s);
      ctx.lineTo(-2.5 * s, -4 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(5.5 * s, -2 * s);
      ctx.lineTo(2.5 * s, -4 * s);
      ctx.stroke();
      // Shield highlight
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.moveTo(0, -shR * sI);
      ctx.lineTo(-shR * 0.4 * sI, -shR * 0.15 * sI);
      ctx.lineTo(0, 0);
      ctx.lineTo(shR * 0.4 * sI, -shR * 0.15 * sI);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ── Barrel cluster — front of building ──
      {
        const barrels = [
          { x: w * 0.45, y: -w * tanA * 0.45 + 8 * s },
          { x: w * 0.65, y: -w * tanA * 0.65 + 8 * s },
        ];
        barrels.forEach((br) => {
          const barH = 9 * s;
          const barRx = 4 * s;
          const barRy = 2 * s;
          ctx.fillStyle = "#6D4C41";
          ctx.beginPath();
          ctx.ellipse(br.x, br.y, barRx, barRy, 0, 0, Math.PI);
          ctx.lineTo(br.x - barRx, br.y - barH);
          ctx.ellipse(br.x, br.y - barH, barRx, barRy, 0, Math.PI, 0, true);
          ctx.lineTo(br.x + barRx, br.y);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#5D4037";
          ctx.beginPath();
          ctx.ellipse(br.x, br.y - barH, barRx, barRy, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 0.8 * s;
          ctx.beginPath();
          ctx.ellipse(
            br.x,
            br.y - barH * 0.25,
            barRx,
            barRy * 0.9,
            0,
            0,
            Math.PI,
          );
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(
            br.x,
            br.y - barH * 0.75,
            barRx,
            barRy * 0.9,
            0,
            0,
            Math.PI,
          );
          ctx.stroke();
        });
      }

      // Spawn Effect — beam and particles (drawn on top)
      if (isSpawning) {
        const beamAlpha = 0.6 * (1 - spawnCycle / 1500);
        const beamGrad = ctx.createLinearGradient(0, doorY, 0, -120 * s);
        beamGrad.addColorStop(0, `rgba(79, 195, 247, ${beamAlpha})`);
        beamGrad.addColorStop(0.3, `rgba(100, 220, 255, ${beamAlpha * 0.7})`);
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(-12 * s, doorY);
        ctx.lineTo(-8 * s, -120 * s);
        ctx.lineTo(8 * s, -120 * s);
        ctx.lineTo(12 * s, doorY);
        ctx.fill();

        for (let i = 0; i < 5; i++) {
          const px = (Math.sin(time * 4 + i * 1.5) * 15 - 7.5) * s;
          const py = doorY - 20 * s - ((time * 40 + i * 20) % 60) * s;
          const pAlpha =
            (1 - spawnCycle / 1500) * (0.5 + Math.sin(time * 10 + i) * 0.3);
          ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
          ctx.beginPath();
          ctx.arc(px, py, 2 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      break;
    }
  }

  ctx.restore();
}
