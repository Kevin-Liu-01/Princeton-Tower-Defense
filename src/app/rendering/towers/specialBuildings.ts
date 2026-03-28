import { ISO_TAN, ISO_Y_RATIO } from "../../constants";
import type { MapTheme } from "../../constants/maps";
import {
  drawIsoFlushSlit,
  drawIsoFlushVent,
  drawIsoFlushPanel,
  drawIsoGothicWindow,
} from "../isoFlush";
import { getBarracksBuildingPalette } from "./barracksTheme";
import { drawActiveVaultBuilding } from "./vaultBuilding";
import {
  getSentinelPalette,
  SENTINEL_METAL,
  type SentinelPalette,
} from "./sentinelTheme";

function drawShadedIsoBox(
  ctx: CanvasRenderingContext2D,
  baseY: number,
  w: number,
  h: number,
  leftBot: string,
  leftTop: string,
  rightBot: string,
  rightTop: string,
  topFace: string,
): void {
  const tanA = ISO_TAN;
  const lg = ctx.createLinearGradient(-w * 0.5, baseY, -w * 0.5, baseY - h);
  lg.addColorStop(0, leftBot);
  lg.addColorStop(1, leftTop);
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  ctx.lineTo(-w, baseY - w * tanA);
  ctx.lineTo(-w, baseY - w * tanA - h);
  ctx.lineTo(0, baseY - h);
  ctx.closePath();
  ctx.fill();
  const rg = ctx.createLinearGradient(w * 0.5, baseY, w * 0.5, baseY - h);
  rg.addColorStop(0, rightBot);
  rg.addColorStop(1, rightTop);
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  ctx.lineTo(w, baseY - w * tanA);
  ctx.lineTo(w, baseY - w * tanA - h);
  ctx.lineTo(0, baseY - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = topFace;
  ctx.beginPath();
  ctx.moveTo(0, baseY - h);
  ctx.lineTo(-w, baseY - w * tanA - h);
  ctx.lineTo(0, baseY - w * tanA * 2 - h);
  ctx.lineTo(w, baseY - w * tanA - h);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// ELDRITCH SHRINE — Jade ritual altar with sacred brazier & floating runestones
// ============================================================================

const SHRINE_STONE = {
  darkest: "#1a2e2e",
  dark: "#243b3b",
  mid: "#2f4f4f",
  light: "#3d6363",
  lightest: "#4a7a7a",
  highlight: "#5c9292",
  band: "#345454",
  rivet: "#2a4242",
  jade: "#76FF03",
  jadeRgb: "118, 255, 3",
  jadeDim: "80, 180, 20",
  jadeBright: "204, 255, 144",
  gold: "#C8A64E",
  goldDim: "#8B7340",
} as const;

function drawIsoPillar(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  w: number,
  d: number,
  h: number,
  leftColor: string,
  rightColor: string,
  topColor: string,
  tanA: number,
): void {
  const isoX = w;
  const isoY = w * tanA;
  const dX = d;
  const dY = d * tanA;

  // Left face
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx - isoX, sy - isoY);
  ctx.lineTo(sx - isoX, sy - isoY - h);
  ctx.lineTo(sx, sy - h);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + dX, sy - dY);
  ctx.lineTo(sx + dX, sy - dY - h);
  ctx.lineTo(sx, sy - h);
  ctx.closePath();
  ctx.fill();

  // Top face
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(sx, sy - h);
  ctx.lineTo(sx - isoX, sy - isoY - h);
  ctx.lineTo(sx - isoX + dX, sy - isoY - dY - h);
  ctx.lineTo(sx + dX, sy - dY - h);
  ctx.closePath();
  ctx.fill();

  // Back-left face
  ctx.fillStyle = "#141e1e";
  ctx.beginPath();
  ctx.moveTo(sx - isoX, sy - isoY);
  ctx.lineTo(sx - isoX + dX, sy - isoY - dY);
  ctx.lineTo(sx - isoX + dX, sy - isoY - dY - h);
  ctx.lineTo(sx - isoX, sy - isoY - h);
  ctx.closePath();
  ctx.fill();
}

function drawEldritchShrineBuilding(
  ctx: CanvasRenderingContext2D,
  s: number,
  time: number,
): void {
  const healCycle = Date.now() % 5000;
  const isHealing = healCycle < 1200;
  const pulse = Math.sin(time * 2.7) * 0.5 + 0.5;
  const S = SHRINE_STONE;
  const s2 = s * 1.1;
  const tanA = ISO_TAN;

  const baseW = 34 * s2;
  const baseH = 7 * s2;
  const midW = 26 * s2;
  const midH = 6 * s2;
  const altarW = 18 * s2;
  const altarH = 10 * s2;
  const pilW = 5 * s2;
  const pilD = 4 * s2;
  const pilH = 44 * s2;

  ctx.translate(0, baseW * tanA);

  // ── Ground shadow ──
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, -baseW * tanA + 4 * s2, 52 * s2, 26 * s2, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Sacred ground circle with runes ──
  ctx.save();
  ctx.translate(0, -baseW * tanA + 2 * s2);
  ctx.scale(1, ISO_Y_RATIO);
  const circleGlow = isHealing ? 0.35 : 0.12 + pulse * 0.08;
  ctx.strokeStyle = `rgba(${S.jadeRgb}, ${circleGlow})`;
  ctx.lineWidth = 2.2 * s2;
  ctx.beginPath();
  ctx.arc(0, 0, 46 * s2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(${S.jadeRgb}, ${circleGlow * 0.6})`;
  ctx.lineWidth = 1.4 * s2;
  ctx.setLineDash([8 * s2, 6 * s2]);
  ctx.beginPath();
  ctx.arc(0, 0, 40 * s2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const elderRunes = [
    "ᚠ",
    "ᚢ",
    "ᚦ",
    "ᚱ",
    "ᚺ",
    "ᛃ",
    "ᛗ",
    "ᛟ",
    "ᛉ",
    "ᛞ",
    "ᚲ",
    "ᛋ",
  ];
  ctx.font = `bold ${6.5 * s2}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - time * 0.15;
    const rx = Math.cos(a) * 34 * s2;
    const ry = Math.sin(a) * 34 * s2;
    const runeAlpha = isHealing
      ? 0.6 + Math.sin(time * 4 + i * 0.5) * 0.3
      : 0.2 + Math.sin(time * 1.5 + i * 0.8) * 0.1;
    ctx.fillStyle = `rgba(${S.jadeBright}, ${runeAlpha})`;
    ctx.fillText(elderRunes[i], rx, ry);
  }

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.strokeStyle = `rgba(${S.jadeDim}, ${0.3 + pulse * 0.2})`;
    ctx.lineWidth = (i % 2 === 0 ? 1.8 : 1) * s2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 40 * s2, Math.sin(a) * 40 * s2);
    ctx.lineTo(Math.cos(a) * 46 * s2, Math.sin(a) * 46 * s2);
    ctx.stroke();
  }
  ctx.restore();

  // ── Ground glow ──
  const groundGlow = ctx.createRadialGradient(
    0,
    -baseW * tanA,
    0,
    0,
    -baseW * tanA,
    55 * s2,
  );
  groundGlow.addColorStop(
    0,
    `rgba(${S.jadeRgb}, ${isHealing ? 0.2 : 0.06 + pulse * 0.04})`,
  );
  groundGlow.addColorStop(
    0.6,
    `rgba(${S.jadeRgb}, ${isHealing ? 0.08 : 0.02})`,
  );
  groundGlow.addColorStop(1, "transparent");
  ctx.fillStyle = groundGlow;
  ctx.beginPath();
  ctx.ellipse(0, -baseW * tanA, 55 * s2, 28 * s2, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── WIDE BASE PLATFORM ──
  drawShadedIsoBox(
    ctx,
    0,
    baseW,
    baseH,
    S.darkest,
    S.dark,
    S.mid,
    S.light,
    S.lightest,
  );

  // Base trim bands
  ctx.strokeStyle = S.band;
  ctx.lineWidth = 1.5 * s2;
  const bandY1 = -baseH * 0.35;
  ctx.beginPath();
  ctx.moveTo(0, bandY1);
  ctx.lineTo(-baseW, -baseW * tanA + bandY1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, bandY1);
  ctx.lineTo(baseW, -baseW * tanA + bandY1);
  ctx.stroke();

  // Center seam
  ctx.strokeStyle = S.rivet;
  ctx.lineWidth = 1 * s2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -baseH);
  ctx.stroke();

  // Rivet studs
  for (let side = -1; side <= 1; side += 2) {
    for (let r = 0; r < 4; r++) {
      const rx = side * baseW * (0.18 + r * 0.22);
      const ry =
        -baseW * tanA * (0.18 + r * 0.22) * Math.abs(side) - baseH * 0.5;
      ctx.fillStyle = S.highlight;
      ctx.beginPath();
      ctx.arc(rx, ry, 1.1 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Jade inlay lines on base faces
  for (let side = -1; side <= 1; side += 2) {
    const inlayAlpha = isHealing ? 0.4 : 0.12 + pulse * 0.08;
    ctx.strokeStyle = `rgba(${S.jadeRgb}, ${inlayAlpha})`;
    ctx.lineWidth = 1 * s2;
    const ix1 = side * baseW * 0.4;
    const iy1 = -baseW * tanA * 0.4 * Math.abs(side) - baseH * 0.25;
    const ix2 = side * baseW * 0.7;
    const iy2 = -baseW * tanA * 0.7 * Math.abs(side) - baseH * 0.25;
    ctx.beginPath();
    ctx.moveTo(ix1, iy1);
    ctx.lineTo(ix2, iy2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ix1, iy1 - baseH * 0.4);
    ctx.lineTo(ix2, iy2 - baseH * 0.4);
    ctx.stroke();
  }

  // Flush panels on base faces
  for (let side = -1; side <= 1; side += 2) {
    const face: "left" | "right" = side < 0 ? "left" : "right";
    const panelX = side * baseW * 0.55;
    const panelY = -baseW * tanA * 0.55 - baseH * 0.5;
    drawIsoFlushPanel(ctx, panelX, panelY, 5, 3, face, s2, {
      fill: S.darkest,
      borderColor: S.band,
      recessDepth: 0.4,
      innerGlow: `rgba(${S.jadeRgb}, ${isHealing ? 0.15 : 0.03 + pulse * 0.04})`,
    });
  }

  // ── MID TIER ──
  const midY = -baseH - 3 * s2;
  drawShadedIsoBox(
    ctx,
    midY,
    midW,
    midH,
    S.darkest,
    S.dark,
    S.mid,
    S.light,
    S.lightest,
  );

  ctx.strokeStyle = S.rivet;
  ctx.lineWidth = 1 * s2;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(0, midY - midH);
  ctx.stroke();

  // Gold trim on mid tier
  ctx.strokeStyle = S.goldDim;
  ctx.lineWidth = 1.2 * s2;
  const midBandY = midY - midH * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, midBandY);
  ctx.lineTo(-midW, -midW * tanA + midBandY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, midBandY);
  ctx.lineTo(midW, -midW * tanA + midBandY);
  ctx.stroke();

  // Flush slits on mid faces
  for (let i = 0; i < 2; i++) {
    const slitGlow = isHealing ? 0.35 + pulse * 0.2 : 0.08 + pulse * 0.06;
    const sx = -midW * (0.35 + i * 0.3);
    const sy = midY - midW * tanA * (0.35 + i * 0.3) - midH * 0.45;
    drawIsoFlushSlit(ctx, sx, sy, 1.2, 4, "left", s2, {
      voidColor: "rgba(8, 20, 15, 0.9)",
      glowColor: `rgba(${S.jadeRgb}`,
      glowAlpha: slitGlow,
    });
  }
  for (let i = 0; i < 2; i++) {
    const slitGlow = isHealing ? 0.35 + pulse * 0.2 : 0.08 + pulse * 0.06;
    const sx = midW * (0.35 + i * 0.3);
    const sy = midY - midW * tanA * (0.35 + i * 0.3) - midH * 0.45;
    drawIsoFlushSlit(ctx, sx, sy, 1.2, 4, "right", s2, {
      voidColor: "rgba(8, 20, 15, 0.9)",
      glowColor: `rgba(${S.jadeRgb}`,
      glowAlpha: slitGlow,
    });
  }

  // ── PILLARS at the center of each base diamond side ──
  // Diamond vertices: front (0,0), left (-baseW,-baseW*tanA),
  // back (0,-2*baseW*tanA), right (baseW,-baseW*tanA).
  // Pillar front-vertex is offset so the prism is centered on the side midpoint.
  const pilCenterOffX = (pilD - pilW) / 2;
  const pilCenterOffY = ((pilW + pilD) * tanA) / 2;
  const sideCenters = [
    // back-left side center (left→back midpoint)
    { tx: -baseW * 0.65, ty: -baseW * tanA * 1 - baseH },
    // back-right side center (right→back midpoint)
    { tx: baseW * 0.65, ty: -baseW * tanA * 1 - baseH },
    // front-left side center (front→left midpoint)
    { tx: -baseW * 0.5, ty: baseW * tanA * 0.05 - baseH },
    // front-right side center (front→right midpoint)
    { tx: baseW * 0.5, ty: baseW * tanA * 0.05 - baseH },
  ];
  const pillarCorners = sideCenters.map((c) => ({
    sx: c.tx - pilCenterOffX,
    sy: c.ty + pilCenterOffY,
  }));

  const drawPillarWithCrystal = (pIdx: number) => {
    const p = pillarCorners[pIdx];

    // Pillar base cap (wider isometric box)
    const capW = pilW * 1.4;
    const capD = pilD * 1.4;
    const capH = 3 * s2;
    drawIsoPillar(
      ctx,
      p.sx - (capW - pilW) * 0.5,
      p.sy + (capW - pilW) * 0.5 * tanA,
      capW,
      capD,
      capH,
      S.dark,
      S.light,
      S.lightest,
      tanA,
    );

    // Pillar shaft
    const shaftBaseY = p.sy - capH + (capW - pilW) * 0.5 * tanA;
    const leftGrad = ctx.createLinearGradient(
      p.sx,
      shaftBaseY,
      p.sx,
      shaftBaseY - pilH,
    );
    leftGrad.addColorStop(0, S.darkest);
    leftGrad.addColorStop(0.5, S.dark);
    leftGrad.addColorStop(1, S.mid);
    const rightGrad = ctx.createLinearGradient(
      p.sx,
      shaftBaseY,
      p.sx,
      shaftBaseY - pilH,
    );
    rightGrad.addColorStop(0, S.mid);
    rightGrad.addColorStop(0.5, S.light);
    rightGrad.addColorStop(1, S.lightest);

    // Left face
    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.moveTo(p.sx, shaftBaseY);
    ctx.lineTo(p.sx - pilW, shaftBaseY - pilW * tanA);
    ctx.lineTo(p.sx - pilW, shaftBaseY - pilW * tanA - pilH);
    ctx.lineTo(p.sx, shaftBaseY - pilH);
    ctx.closePath();
    ctx.fill();

    // Right face
    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.moveTo(p.sx, shaftBaseY);
    ctx.lineTo(p.sx + pilD, shaftBaseY - pilD * tanA);
    ctx.lineTo(p.sx + pilD, shaftBaseY - pilD * tanA - pilH);
    ctx.lineTo(p.sx, shaftBaseY - pilH);
    ctx.closePath();
    ctx.fill();

    // Back-left face
    ctx.fillStyle = "#141e1e";
    ctx.beginPath();
    ctx.moveTo(p.sx - pilW, shaftBaseY - pilW * tanA);
    ctx.lineTo(p.sx - pilW + pilD, shaftBaseY - pilW * tanA - pilD * tanA);
    ctx.lineTo(
      p.sx - pilW + pilD,
      shaftBaseY - pilW * tanA - pilD * tanA - pilH,
    );
    ctx.lineTo(p.sx - pilW, shaftBaseY - pilW * tanA - pilH);
    ctx.closePath();
    ctx.fill();

    // Top face
    ctx.fillStyle = S.highlight;
    ctx.beginPath();
    ctx.moveTo(p.sx, shaftBaseY - pilH);
    ctx.lineTo(p.sx - pilW, shaftBaseY - pilW * tanA - pilH);
    ctx.lineTo(
      p.sx - pilW + pilD,
      shaftBaseY - pilW * tanA - pilD * tanA - pilH,
    );
    ctx.lineTo(p.sx + pilD, shaftBaseY - pilD * tanA - pilH);
    ctx.closePath();
    ctx.fill();

    // Front edge highlight
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 0.8 * s2;
    ctx.beginPath();
    ctx.moveTo(p.sx, shaftBaseY);
    ctx.lineTo(p.sx, shaftBaseY - pilH);
    ctx.stroke();

    // Gold bands
    ctx.strokeStyle = S.goldDim;
    ctx.lineWidth = 1 * s2;
    for (const frac of [0.3, 0.6]) {
      const bandAtY = shaftBaseY - pilH * frac;
      ctx.beginPath();
      ctx.moveTo(p.sx - pilW, bandAtY - pilW * tanA);
      ctx.lineTo(p.sx, bandAtY);
      ctx.lineTo(p.sx + pilD, bandAtY - pilD * tanA);
      ctx.stroke();
    }

    // Pillar top cap
    const topCapY = shaftBaseY - pilH;
    drawIsoPillar(
      ctx,
      p.sx - (capW - pilW) * 0.5,
      topCapY + (capW - pilW) * 0.5 * tanA,
      capW,
      capD,
      capH,
      S.mid,
      S.highlight,
      S.lightest,
      tanA,
    );

    // Crystal finial
    const crystalGlow = 0.5 + Math.sin(time * 3 + pIdx * 1.5) * 0.3;
    const crystalBaseY = topCapY - capH + (capW - pilW) * 0.5 * tanA;
    const cSize = 8 * s2;
    const cMidX = p.sx + (pilD - pilW) * 0.5;

    ctx.shadowBlur = (isHealing ? 16 : 8) * s2;
    ctx.shadowColor = `rgba(${S.jadeRgb}, ${crystalGlow})`;

    // Left crystal facet
    ctx.fillStyle = `rgba(50, 160, 70, ${0.7 + crystalGlow * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(cMidX, crystalBaseY - cSize * 1.3);
    ctx.lineTo(cMidX - cSize * 0.5, crystalBaseY - cSize * 0.3);
    ctx.lineTo(cMidX, crystalBaseY + cSize * 0.15);
    ctx.closePath();
    ctx.fill();

    // Right crystal facet
    ctx.fillStyle = `rgba(90, 210, 110, ${0.7 + crystalGlow * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(cMidX, crystalBaseY - cSize * 1.3);
    ctx.lineTo(cMidX + cSize * 0.5, crystalBaseY - cSize * 0.3);
    ctx.lineTo(cMidX, crystalBaseY + cSize * 0.15);
    ctx.closePath();
    ctx.fill();

    // Inner crystal highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + crystalGlow * 0.25})`;
    ctx.beginPath();
    ctx.moveTo(cMidX, crystalBaseY - cSize * 1.1);
    ctx.lineTo(cMidX - cSize * 0.15, crystalBaseY - cSize * 0.25);
    ctx.lineTo(cMidX, crystalBaseY);
    ctx.lineTo(cMidX + cSize * 0.15, crystalBaseY - cSize * 0.25);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
  };

  // Draw back pillars first (depth ordering)
  drawPillarWithCrystal(0);
  drawPillarWithCrystal(1);

  // ── CENTRAL ALTAR BLOCK ──
  const altarY = midY - midH;
  drawShadedIsoBox(
    ctx,
    altarY,
    altarW,
    altarH,
    S.darkest,
    S.dark,
    S.mid,
    S.light,
    S.lightest,
  );

  // Altar gold trim top edge
  ctx.strokeStyle = S.gold;
  ctx.lineWidth = 1.2 * s2;
  ctx.beginPath();
  ctx.moveTo(0, altarY - altarH);
  ctx.lineTo(-altarW, altarY - altarW * tanA - altarH);
  ctx.lineTo(0, altarY - altarW * tanA * 2 - altarH);
  ctx.lineTo(altarW, altarY - altarW * tanA - altarH);
  ctx.closePath();
  ctx.stroke();

  // Center seam
  ctx.strokeStyle = S.rivet;
  ctx.lineWidth = 1 * s2;
  ctx.beginPath();
  ctx.moveTo(0, altarY);
  ctx.lineTo(0, altarY - altarH);
  ctx.stroke();

  // Eldritch sigils carved into altar faces
  const sigilAlpha = isHealing ? 0.5 + pulse * 0.3 : 0.15 + pulse * 0.1;
  ctx.strokeStyle = `rgba(${S.jadeRgb}, ${sigilAlpha})`;
  ctx.lineWidth = 1.2 * s2;

  // Left face sigil
  const slx = -altarW * 0.5;
  const sly = altarY - altarW * tanA * 0.5 - altarH * 0.5;
  ctx.beginPath();
  ctx.arc(slx, sly, 4 * s2, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(slx - 2 * s2, sly - 2 * s2, 2.5 * s2, Math.PI * 0.5, Math.PI * 2);
  ctx.stroke();

  // Right face sigil
  const srx = altarW * 0.5;
  const sry = altarY - altarW * tanA * 0.5 - altarH * 0.5;
  ctx.beginPath();
  ctx.moveTo(srx - 3 * s2, sry - 4 * s2);
  ctx.lineTo(srx, sry + 3 * s2);
  ctx.lineTo(srx + 3 * s2, sry - 4 * s2);
  ctx.moveTo(srx - 2 * s2, sry - 1 * s2);
  ctx.lineTo(srx + 2 * s2, sry - 1 * s2);
  ctx.stroke();

  // ── Buttresses connecting pillars to altar ──
  const buttData = [
    { px: -baseW * 0.78, mx: -altarW * 0.9, faceColor: S.dark },
    { px: baseW * 0.78, mx: altarW * 0.9, faceColor: S.light },
  ];
  buttData.forEach((b) => {
    const by = -baseW * tanA * 0.45 - baseH;
    const ty = altarY - altarW * tanA * 0.5 - altarH * 0.3;
    const bw = 3.5 * s2;
    ctx.fillStyle = b.faceColor;
    ctx.beginPath();
    ctx.moveTo(b.px, by);
    ctx.lineTo(b.px + (b.px < 0 ? bw : -bw), by);
    ctx.lineTo(b.mx + (b.px < 0 ? bw * 0.6 : -bw * 0.6), ty);
    ctx.lineTo(b.mx, ty);
    ctx.closePath();
    ctx.fill();

    const buttGlow = isHealing ? 0.4 : 0.1 + pulse * 0.08;
    ctx.strokeStyle = `rgba(${S.jadeRgb}, ${buttGlow})`;
    ctx.lineWidth = 1 * s2;
    ctx.beginPath();
    ctx.moveTo(b.px + (b.px < 0 ? bw * 0.5 : -bw * 0.5), by);
    ctx.lineTo(b.mx + (b.px < 0 ? bw * 0.3 : -bw * 0.3), ty);
    ctx.stroke();
  });

  // ── SACRED BRAZIER (isometric bowl on altar top) ──
  const brazierCX = 0;
  const altarTopY = altarY - altarH - altarW * tanA;

  // Brazier pedestal (small isometric box)
  const pedW = 7 * s2;
  const pedH = 5 * s2;
  drawIsoPillar(
    ctx,
    brazierCX,
    altarTopY + 2 * s2,
    pedW,
    pedW,
    pedH,
    "#3E2723",
    "#5D4037",
    "#6D4C41",
    tanA,
  );

  // Brazier bowl — wider rim on the pedestal
  const rimW = 11 * s2;
  const rimH = 3 * s2;
  drawIsoPillar(
    ctx,
    brazierCX,
    altarTopY - pedH + 2 * s2 + pedW * tanA,
    rimW,
    rimW,
    rimH,
    "#4E342E",
    "#6D4C41",
    "#795548",
    tanA,
  );

  // Gold rim outline
  ctx.strokeStyle = S.gold;
  ctx.lineWidth = 1.3 * s2;
  const rimTopY = altarTopY - pedH - rimH + 2 * s2 + pedW * tanA;
  ctx.beginPath();
  ctx.moveTo(brazierCX, rimTopY);
  ctx.lineTo(brazierCX - rimW, rimTopY - rimW * tanA);
  ctx.lineTo(brazierCX - rimW + rimW, rimTopY - rimW * tanA - rimW * tanA);
  ctx.lineTo(brazierCX + rimW, rimTopY - rimW * tanA);
  ctx.closePath();
  ctx.stroke();

  // Inner void (dark depression)
  const voidCX = brazierCX + (rimW - rimW) * 0.5 * 0;
  const voidCY = rimTopY - rimW * tanA;
  ctx.fillStyle = "#0a1510";
  ctx.beginPath();
  ctx.ellipse(voidCX, voidCY, rimW * 0.6, rimW * tanA * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw front pillars on top (depth ordering)
  drawPillarWithCrystal(2);
  drawPillarWithCrystal(3);

  // ── SACRED FLAME ──
  const flameBaseY = rimTopY - rimW * tanA - 2 * s2;
  const flamePulse = 0.85 + Math.sin(time * 10) * 0.15;
  const flameSize = (isHealing ? 26 : 20) * s2 * flamePulse;

  // Broad aura glow
  const auraGrad = ctx.createRadialGradient(
    0,
    flameBaseY,
    0,
    0,
    flameBaseY,
    flameSize * 2,
  );
  auraGrad.addColorStop(0, `rgba(${S.jadeRgb}, ${isHealing ? 0.35 : 0.18})`);
  auraGrad.addColorStop(0.5, `rgba(${S.jadeRgb}, ${isHealing ? 0.12 : 0.06})`);
  auraGrad.addColorStop(1, "transparent");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, flameBaseY, flameSize * 2, 0, Math.PI * 2);
  ctx.fill();

  // Flame tongues
  for (let t = 0; t < 5; t++) {
    const tAngle = time * 4 + (t * Math.PI * 2) / 5;
    const tLen = (14 + Math.sin(time * 7 + t * 1.3) * 5) * s2 * flamePulse;
    const tx = Math.cos(tAngle) * 5 * s2;
    const ty = flameBaseY + Math.sin(tAngle) * 2.5 * s2;

    const tongueGrad = ctx.createLinearGradient(tx, ty, tx, ty - tLen);
    tongueGrad.addColorStop(0, `rgba(${S.jadeBright}, 0.9)`);
    tongueGrad.addColorStop(0.4, `rgba(${S.jadeRgb}, 0.6)`);
    tongueGrad.addColorStop(1, "transparent");

    ctx.fillStyle = tongueGrad;
    ctx.beginPath();
    ctx.moveTo(tx - 3 * s2, ty);
    ctx.quadraticCurveTo(
      tx + Math.sin(time * 9 + t) * 5 * s2,
      ty - tLen * 0.5,
      tx + Math.sin(time * 6 + t * 2) * 2 * s2,
      ty - tLen,
    );
    ctx.quadraticCurveTo(
      tx - Math.sin(time * 9 + t) * 5 * s2,
      ty - tLen * 0.5,
      tx + 3 * s2,
      ty,
    );
    ctx.fill();
  }

  // Core flame
  const coreGrad = ctx.createRadialGradient(
    0,
    flameBaseY,
    0,
    0,
    flameBaseY,
    flameSize * 0.6,
  );
  coreGrad.addColorStop(0, "#FFFFFF");
  coreGrad.addColorStop(0.25, "#E8F5E9");
  coreGrad.addColorStop(0.5, "#CCFF90");
  coreGrad.addColorStop(0.8, `rgba(${S.jadeRgb}, 0.4)`);
  coreGrad.addColorStop(1, "transparent");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, flameBaseY, flameSize * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // ── FLOATING RUNESTONES ──
  for (let i = 0; i < 6; i++) {
    ctx.save();
    const orbitAngle = time * 0.5 + (i * Math.PI * 2) / 6;
    const orbitRadius = 30 * s2;
    const bob = Math.sin(time * 2.2 + i * 1.1) * 6 * s2;
    const rx = Math.cos(orbitAngle) * orbitRadius;
    const ry = flameBaseY - 8 * s2 + Math.sin(orbitAngle) * 10 * s2 + bob;

    ctx.translate(rx, ry);

    const stoneW = (4 + Math.sin(i * 2.1) * 1) * s2;
    const stoneD = (3 + Math.sin(i * 1.7) * 0.8) * s2;
    const stoneH = (8 + Math.sin(i * 2.5) * 2) * s2;

    // Runestone as proper isometric prism
    drawIsoPillar(
      ctx,
      0,
      0,
      stoneW,
      stoneD,
      stoneH,
      S.darkest,
      S.mid,
      S.light,
      tanA,
    );

    // Rune inscription glow on the front edge
    const runeGlow = isHealing ? 1 : 0.4 + Math.sin(time * 4 + i) * 0.3;
    ctx.shadowBlur = (isHealing ? 10 : 5) * s2;
    ctx.shadowColor = S.jade;
    ctx.strokeStyle = `rgba(${S.jadeBright}, ${runeGlow})`;
    ctx.lineWidth = 1.3 * s2;

    const midH2 = -stoneH * 0.5;
    ctx.beginPath();
    if (i % 3 === 0) {
      ctx.moveTo(0, midH2 - stoneH * 0.25);
      ctx.lineTo(0, midH2 + stoneH * 0.25);
      ctx.moveTo(-stoneW * 0.3, midH2);
      ctx.lineTo(stoneW * 0.3, midH2);
    } else if (i % 3 === 1) {
      ctx.moveTo(-stoneW * 0.25, midH2 - stoneH * 0.2);
      ctx.lineTo(stoneW * 0.25, midH2 + stoneH * 0.2);
      ctx.moveTo(stoneW * 0.25, midH2 - stoneH * 0.2);
      ctx.lineTo(-stoneW * 0.25, midH2 + stoneH * 0.2);
    } else {
      ctx.moveTo(0, midH2 - stoneH * 0.25);
      ctx.lineTo(-stoneW * 0.3, midH2 + stoneH * 0.15);
      ctx.lineTo(stoneW * 0.3, midH2 + stoneH * 0.15);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // ── AMBIENT PARTICLES ──
  for (let p = 0; p < 10; p++) {
    const pTime = time + p * 0.7;
    const pLifeCycle = (pTime * 0.4) % 1;
    const pAngle = p * (Math.PI / 5) + time * 0.25;
    const pDist = 12 * s2 + pLifeCycle * 30 * s2;
    const px = Math.cos(pAngle) * pDist;
    const py = flameBaseY - pLifeCycle * 45 * s2 + Math.sin(pTime * 2) * 4 * s2;
    const pAlpha = Math.sin(pLifeCycle * Math.PI) * (isHealing ? 0.7 : 0.45);
    const pSize = (1.2 + Math.sin(pTime * 3) * 0.5) * s2;

    ctx.fillStyle = `rgba(${S.jadeBright}, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── HEALING PULSE EFFECT ──
  if (isHealing) {
    const prog = healCycle / 1200;

    ctx.save();
    ctx.translate(0, -baseW * tanA + 2 * s2);
    ctx.scale(1, ISO_Y_RATIO);

    for (let ring = 0; ring < 3; ring++) {
      const ringProg = Math.max(0, prog - ring * 0.12);
      if (ringProg > 0) {
        const ringAlpha = (1 - ringProg) * (1 - ring * 0.3) * 0.8;
        const ringRad = 200 * ringProg * s2;
        ctx.strokeStyle = `rgba(${S.jadeRgb}, ${ringAlpha})`;
        ctx.lineWidth = (3.5 - ring) * s2;
        ctx.beginPath();
        ctx.arc(0, 0, ringRad, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = `rgba(${S.jadeBright}, ${0.85 * (1 - prog)})`;
    for (let sym = 0; sym < 6; sym++) {
      const symAngle = (sym * Math.PI) / 3 + time * 0.5;
      const symDist = 25 + prog * 70;
      const sx = Math.cos(symAngle) * symDist * s2;
      const sy = Math.sin(symAngle) * symDist * s2;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(symAngle);
      ctx.fillRect(-1.5 * s2, -4.5 * s2, 3 * s2, 9 * s2);
      ctx.fillRect(-4.5 * s2, -1.5 * s2, 9 * s2, 3 * s2);
      ctx.restore();
    }
    ctx.restore();

    const beamAlpha = 0.35 * (1 - prog);
    const beamGrad = ctx.createLinearGradient(
      0,
      flameBaseY,
      0,
      flameBaseY - 110 * s2,
    );
    beamGrad.addColorStop(0, `rgba(${S.jadeBright}, ${beamAlpha})`);
    beamGrad.addColorStop(0.4, `rgba(${S.jadeRgb}, ${beamAlpha * 0.5})`);
    beamGrad.addColorStop(1, "transparent");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(-7 * s2, flameBaseY);
    ctx.lineTo(-3 * s2, flameBaseY - 110 * s2);
    ctx.lineTo(3 * s2, flameBaseY - 110 * s2);
    ctx.lineTo(7 * s2, flameBaseY);
    ctx.fill();
  }
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
  const specGrad = ctx.createRadialGradient(
    specSX,
    specSY,
    0,
    specSX,
    specSY,
    10 * s2,
  );
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
  const spec2Grad = ctx.createRadialGradient(
    spec2SX,
    spec2SY,
    0,
    spec2SX,
    spec2SY,
    7 * s2,
  );
  spec2Grad.addColorStop(0, `rgba(255, 255, 255, ${0.18 + pulse * 0.1})`);
  spec2Grad.addColorStop(0.5, `rgba(${glowRgb}, ${0.08 + pulse * 0.06})`);
  spec2Grad.addColorStop(1, "transparent");
  ctx.fillStyle = spec2Grad;
  ctx.beginPath();
  ctx.arc(spec2SX, spec2SY, 7 * s2, 0, Math.PI * 2);
  ctx.fill();

  // === INNER CORE GLOW ===
  const coreGlow = ctx.createRadialGradient(
    0,
    crystalTopY + 24 * s2,
    0,
    0,
    crystalTopY + 24 * s2,
    30 * s2,
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
  warmupProgress: number,
  palette: SentinelPalette,
): void {
  const charge = Math.max(0, Math.min(1, chargeProgress));
  const wu = Math.max(0, Math.min(1, warmupProgress));
  const s2 = s * 1.12;
  const tanA = ISO_TAN;
  const hotRgb = palette.hotRgb;
  const lerpR = Math.round(
    palette.crystalBaseR + (palette.crystalR - palette.crystalBaseR) * charge,
  );
  const lerpG = Math.round(
    palette.crystalBaseG + (palette.crystalG - palette.crystalBaseG) * charge,
  );
  const lerpB = Math.round(
    palette.crystalBaseB + (palette.crystalB - palette.crystalBaseB) * charge,
  );
  const glowRgb = `${lerpR}, ${lerpG}, ${lerpB}`;
  const grayRgb = "145, 148, 155";
  const M = SENTINEL_METAL;
  const readyFlash =
    charge >= 0.85
      ? (Math.sin(time * 14) * 0.5 + 0.5) * 0.5 * ((charge - 0.85) / 0.15)
      : 0;
  const runes = ["ᚠ", "ᚲ", "ᚾ", "ᛗ", "ᛋ", "ᛉ", "ᛞ", "ᛟ"];

  // Warmup sub-phases (eased with smoothstep-like clamped ramps)
  const wuCapOpen = Math.max(0, Math.min(1, (wu - 0.0) / 0.3)); // 0-30%: cap splits open
  const wuCrystalRise = Math.max(0, Math.min(1, (wu - 0.2) / 0.5)); // 20-70%: crystal elevates
  const wuMechDeploy = Math.max(0, Math.min(1, (wu - 0.3) / 0.4)); // 30-70%: gears/pistons activate
  const wuRingDeploy = Math.max(0, Math.min(1, (wu - 0.5) / 0.5)); // 50-100%: gimbal/rings/drones deploy

  const baseW = 36 * s2;
  const baseH = 8 * s2;
  const midW = 27 * s2;
  const midH = 12 * s2;
  const towerW = 14 * s2;
  const towerH = 34 * s2;
  const capW = 18 * s2;
  const capH = 4 * s2;

  ctx.translate(0, baseW * tanA);

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(0, -baseW * tanA + 4 * s2, 52 * s2, 26 * s2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Charge rune circle on ground - only visible after warmup starts
  if (wu > 0.05) {
    const runeCount = 16;
    const litRuneCount = Math.floor(charge * runeCount);
    ctx.save();
    ctx.translate(0, -baseW * tanA + 2.5 * s2);
    ctx.scale(1, ISO_Y_RATIO);
    const groundAlpha = wu;
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.3 + charge * 0.35 + readyFlash) * groundAlpha})`;
    ctx.lineWidth = 2.3 * s2;
    ctx.setLineDash([10 * s2, 7 * s2]);
    ctx.beginPath();
    ctx.arc(0, 0, 44 * s2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (charge > 0.02) {
      ctx.strokeStyle = `rgba(${hotRgb}, ${(0.5 + charge * 0.4 + readyFlash) * groundAlpha})`;
      ctx.lineWidth = 3.5 * s2;
      ctx.beginPath();
      ctx.arc(0, 0, 38 * s2, -Math.PI / 2, -Math.PI / 2 + charge * Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.35 + charge * 0.45) * groundAlpha})`;
    ctx.lineWidth = 1.7 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, 32 * s2, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < runeCount; i++) {
      const a = (i / runeCount) * Math.PI * 2 - Math.PI / 2;
      const isLit = i < litRuneCount;
      const isActivating = i === litRuneCount && charge < 1;
      const partialBright = isActivating
        ? charge * runeCount - litRuneCount
        : 0;
      const runeAlpha =
        (isLit
          ? 0.7 + Math.sin(time * 4 + i * 0.6) * 0.2 + readyFlash
          : 0.25 +
            Math.sin(time * 1.5 + i * 0.8) * 0.08 +
            partialBright * 0.4) * groundAlpha;
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
        ctx.fillStyle = `rgba(${Math.min(255, palette.crystalR + 40)}, ${Math.min(255, palette.crystalG + 40)}, ${Math.min(255, palette.crystalB + 20)}, ${(0.15 + readyFlash * 0.3) * groundAlpha})`;
        ctx.beginPath();
        ctx.arc(rx, ry, 5 * s2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const tickLit = i / 12 < charge;
      ctx.strokeStyle = tickLit
        ? `rgba(${Math.min(255, palette.crystalR + 50)}, ${Math.min(255, palette.crystalG + 50)}, ${Math.min(255, palette.crystalB + 40)}, ${(0.6 + readyFlash) * groundAlpha})`
        : `rgba(${grayRgb}, ${0.3 * groundAlpha})`;
      ctx.lineWidth = (i % 3 === 0 ? 2 : 1.2) * s2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 28 * s2, Math.sin(a) * 28 * s2);
      ctx.lineTo(Math.cos(a) * 34 * s2, Math.sin(a) * 34 * s2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // === WIDE BASE PLATFORM ===
  drawShadedIsoBox(
    ctx,
    0,
    baseW,
    baseH,
    M.darkest,
    M.dark,
    M.mid,
    M.light,
    M.lightest,
  );
  ctx.strokeStyle = M.band;
  ctx.lineWidth = 1.5 * s2;
  for (let band = 1; band <= 2; band++) {
    const by = -baseH * (band / 3);
    ctx.beginPath();
    ctx.moveTo(0, by);
    ctx.lineTo(-baseW, -baseW * tanA + by);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, by);
    ctx.lineTo(baseW, -baseW * tanA + by);
    ctx.stroke();
  }
  ctx.strokeStyle = M.rivet;
  ctx.lineWidth = 1 * s2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -baseH);
  ctx.stroke();

  // Rivet studs along base edges
  for (let side = -1; side <= 1; side += 2) {
    for (let r = 0; r < 4; r++) {
      const rx = side * baseW * (0.2 + r * 0.22);
      const ry =
        -baseW * tanA * (0.2 + r * 0.22) * Math.abs(side) - baseH * 0.5;
      ctx.fillStyle = M.highlight;
      ctx.beginPath();
      ctx.arc(rx, ry, 1.2 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Exhaust vents flush with base faces
  for (let v = 0; v < 3; v++) {
    const leftVx = -baseW * (0.15 + v * 0.25);
    const leftVy = -baseW * tanA * (0.15 + v * 0.25) - baseH * 0.3;
    const ventGlowL = wu > 0.3 ? (0.05 + charge * 0.2) * wuMechDeploy : 0;
    drawIsoFlushVent(ctx, leftVx, leftVy, 4, 3, "left", s2, {
      frameColor: M.dark,
      bgColor: M.darkest,
      slatColor: ventGlowL > 0 ? `rgba(${hotRgb}, ${ventGlowL + 0.15})` : M.mid,
      slats: 3,
    });
  }
  for (let v = 0; v < 2; v++) {
    const rightVx = baseW * (0.25 + v * 0.3);
    const rightVy = -baseW * tanA * (0.25 + v * 0.3) - baseH * 0.4;
    const ventGlowR = wu > 0.3 ? (0.04 + charge * 0.15) * wuMechDeploy : 0;
    drawIsoFlushVent(ctx, rightVx, rightVy, 3.5, 2.5, "right", s2, {
      frameColor: M.mid,
      bgColor: M.darkest,
      slatColor:
        ventGlowR > 0 ? `rgba(${hotRgb}, ${ventGlowR + 0.1})` : M.light,
      slats: 2,
    });
  }
  // Decorative flush panels on base faces
  for (let side = -1; side <= 1; side += 2) {
    const face: "left" | "right" = side < 0 ? "left" : "right";
    const panelX = side * baseW * 0.7;
    const panelY = -baseW * tanA * 0.7 - baseH * 0.55;
    drawIsoFlushPanel(ctx, panelX, panelY, 5, 3, face, s2, {
      fill: M.darkest,
      borderColor: M.band,
      recessDepth: 0.5,
      innerGlow: `rgba(${glowRgb}, ${(0.03 + charge * 0.08) * wu})`,
    });
  }

  // === ANIMATED MECHANICAL GEARS on base sides - spin up during warmup ===
  if (wuMechDeploy > 0) {
    const gearPhase = time * (0.5 + charge * 2.5) * wuMechDeploy;
    for (let side = -1; side <= 1; side += 2) {
      const gx = side * baseW * 0.55;
      const gy = -baseW * tanA * 0.55 * Math.abs(side) - baseH * 0.4;
      const gearR = 5 * s2;
      const toothCount = 8;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(side * gearPhase);
      ctx.globalAlpha = wuMechDeploy;
      ctx.strokeStyle = `rgba(${glowRgb}, ${0.2 + charge * 0.5})`;
      ctx.lineWidth = 1.2 * s2;
      ctx.beginPath();
      ctx.arc(0, 0, gearR * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      for (let t = 0; t < toothCount; t++) {
        const ta = (t / toothCount) * Math.PI * 2;
        const ix = Math.cos(ta) * gearR * 0.7;
        const iy = Math.sin(ta) * gearR * 0.7;
        const ox = Math.cos(ta) * gearR;
        const oy = Math.sin(ta) * gearR;
        ctx.fillStyle = side < 0 ? M.dark : M.mid;
        ctx.beginPath();
        ctx.moveTo(ix - 1.3 * s2, iy);
        ctx.lineTo(ox - 1.3 * s2, oy);
        ctx.lineTo(ox + 1.3 * s2, oy);
        ctx.lineTo(ix + 1.3 * s2, iy);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = `rgba(${glowRgb}, ${0.15 + charge * 0.3})`;
      ctx.beginPath();
      ctx.arc(0, 0, 1.8 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // Runic glyph ring on base top - fade in with warmup
  if (wu > 0.1) {
    ctx.font = `bold ${7.2 * s2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const runeOpacity = Math.min(1, wu * 1.5);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 - time * (0.2 + charge * 0.7) * wu;
      const rx = Math.cos(a) * 30 * s2;
      const ry = Math.sin(a) * 15 * s2 - baseW * tanA + 2 * s2;
      const runeCharge = i / 14 < charge ? 1 : 0;
      const alpha =
        (runeCharge
          ? 0.4 +
            Math.sin(time * 2.8 + i * 0.9) * 0.18 +
            charge * 0.3 +
            readyFlash
          : 0.2 + Math.sin(time * 1.2 + i * 0.9) * 0.06) * runeOpacity;
      ctx.fillStyle = `rgba(${runeCharge ? hotRgb : grayRgb}, ${Math.max(0.12, alpha)})`;
      ctx.fillText(runes[i % runes.length], rx, ry);
    }
  }

  // === MID SECTION ===
  const midY = -baseH;
  drawShadedIsoBox(
    ctx,
    midY,
    midW,
    midH,
    M.darkest,
    M.dark,
    M.mid,
    M.light,
    M.lightest,
  );

  // Flush slits on mid-section left face
  for (let i = 0; i < 3; i++) {
    const sx = -midW * (0.3 + i * 0.22);
    const sy = midY - midW * tanA * (0.3 + i * 0.22) - midH * 0.4;
    const slitGlow =
      wu > 0.3 ? (0.1 + charge * 0.4 + readyFlash * 0.3) * wuMechDeploy : 0.05;
    drawIsoFlushSlit(ctx, sx, sy, 1.5, 6, "left", s2, {
      voidColor: "rgba(8, 3, 5, 0.9)",
      glowColor: slitGlow > 0.05 ? `rgba(${glowRgb}` : null,
      glowAlpha: slitGlow,
    });
  }
  // Flush slits on mid-section right face
  for (let i = 0; i < 3; i++) {
    const sx = midW * (0.3 + i * 0.22);
    const sy = midY - midW * tanA * (0.3 + i * 0.22) - midH * 0.4;
    const slitGlow =
      wu > 0.3 ? (0.1 + charge * 0.4 + readyFlash * 0.3) * wuMechDeploy : 0.05;
    drawIsoFlushSlit(ctx, sx, sy, 1.5, 6, "right", s2, {
      voidColor: "rgba(8, 3, 5, 0.9)",
      glowColor: slitGlow > 0.05 ? `rgba(${glowRgb}` : null,
      glowAlpha: slitGlow,
    });
  }
  // Decorative flush panels between slits on mid faces
  for (let side = -1; side <= 1; side += 2) {
    const face: "left" | "right" = side < 0 ? "left" : "right";
    for (let p = 0; p < 2; p++) {
      const px = side * midW * (0.42 + p * 0.28);
      const py = midY - midW * tanA * (0.42 + p * 0.28) - midH * 0.72;
      drawIsoFlushPanel(ctx, px, py, 3.5, 2.5, face, s2, {
        fill: M.darkest,
        borderColor: M.band,
        recessDepth: 0.6,
        innerGlow: `rgba(${glowRgb}, ${(0.04 + charge * 0.12) * wu})`,
      });
    }
  }
  ctx.strokeStyle = M.band;
  ctx.lineWidth = 2 * s2;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(0, midY - midH);
  ctx.stroke();
  // Horizontal trim band on mid section for definition
  ctx.strokeStyle = M.highlight;
  ctx.lineWidth = 0.8 * s2;
  const midBandY = midY - midH * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, midBandY);
  ctx.lineTo(-midW, -midW * tanA + midBandY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, midBandY);
  ctx.lineTo(midW, -midW * tanA + midBandY);
  ctx.stroke();

  // Power coupling bolts on mid section
  for (let side = -1; side <= 1; side += 2) {
    for (let b = 0; b < 2; b++) {
      const bx = side * midW * (0.35 + b * 0.3);
      const by =
        midY - midW * tanA * (0.35 + b * 0.3) * Math.abs(side) - midH * 0.6;
      ctx.fillStyle = M.highlight;
      ctx.beginPath();
      ctx.arc(bx, by, 1.8 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = M.darkest;
      ctx.beginPath();
      ctx.arc(bx, by, 0.8 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Structural cross-bracing on right face
  ctx.strokeStyle = `rgba(100, 104, 112, 0.35)`;
  ctx.lineWidth = 0.8 * s2;
  ctx.beginPath();
  ctx.moveTo(midW * 0.15, midY - midW * tanA * 0.15 - midH * 0.15);
  ctx.lineTo(midW * 0.7, midY - midW * tanA * 0.7 - midH * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(midW * 0.7, midY - midW * tanA * 0.7 - midH * 0.15);
  ctx.lineTo(midW * 0.15, midY - midW * tanA * 0.15 - midH * 0.8);
  ctx.stroke();

  // === HYDRAULIC PISTONS - extend during warmup mechDeploy phase ===
  if (wuMechDeploy > 0) {
    const pistonExtend = wuMechDeploy * charge * 10 * s2;
    for (let side = -1; side <= 1; side += 2) {
      const px = side * midW * 0.7;
      const pBaseY = midY - midW * tanA * 0.7 * Math.abs(side) - midH * 0.3;
      const cylW = 2.5 * s2;
      const cylH = 6 * s2 + pistonExtend;
      const rodW = 1.2 * s2;
      const rodH = 4 * s2 + pistonExtend * 0.6;
      ctx.globalAlpha = wuMechDeploy;
      ctx.fillStyle = side < 0 ? M.darkest : M.mid;
      ctx.fillRect(px - cylW / 2, pBaseY - cylH, cylW, cylH);
      ctx.fillStyle = `rgba(${glowRgb}, ${0.15 + charge * 0.4})`;
      ctx.fillRect(px - rodW / 2, pBaseY - cylH - rodH, rodW, rodH);
      ctx.fillStyle = `rgba(${hotRgb}, ${0.2 + charge * 0.5 + readyFlash})`;
      ctx.beginPath();
      ctx.arc(px, pBaseY - cylH - rodH, 2 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // === CORNER BUTTRESSES ===
  const buttData = [
    { bx: -baseW * 0.82, mx: -midW * 0.55, face: M.dark },
    { bx: baseW * 0.82, mx: midW * 0.55, face: M.light },
  ];
  buttData.forEach((b) => {
    const by = -baseW * tanA * 0.5 - baseH;
    const ty = midY - midW * tanA * 0.28 - midH * 0.7;
    const bw = 4 * s2;
    ctx.fillStyle = b.face;
    ctx.beginPath();
    ctx.moveTo(b.bx, by);
    ctx.lineTo(b.bx + (b.bx < 0 ? bw : -bw), by);
    ctx.lineTo(b.mx + (b.bx < 0 ? bw * 0.7 : -bw * 0.7), ty);
    ctx.lineTo(b.mx, ty);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.06 + charge * 0.3) * wu})`;
    ctx.lineWidth = 1.2 * s2;
    ctx.beginPath();
    ctx.moveTo(b.bx + (b.bx < 0 ? bw * 0.5 : -bw * 0.5), by);
    ctx.lineTo(b.mx + (b.bx < 0 ? bw * 0.35 : -bw * 0.35), ty);
    ctx.stroke();
  });

  // === ENERGY CONDUIT NODES at buttress junctions - glow during warmup ===
  if (wuMechDeploy > 0) {
    buttData.forEach((b) => {
      const nodeX = b.mx;
      const nodeY = midY - midW * tanA * 0.28 - midH * 0.7;
      const nodeR = (2 + charge * 1.5) * s2 * wuMechDeploy;
      const nGrad = ctx.createRadialGradient(
        nodeX,
        nodeY,
        0,
        nodeX,
        nodeY,
        nodeR * 2,
      );
      nGrad.addColorStop(
        0,
        `rgba(${hotRgb}, ${(0.4 + charge * 0.5 + readyFlash) * wuMechDeploy})`,
      );
      nGrad.addColorStop(1, "transparent");
      ctx.fillStyle = nGrad;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeR * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${hotRgb}, ${(0.5 + charge * 0.4) * wuMechDeploy})`;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // === CENTRAL TOWER ===
  const towerBaseY = midY - midH;
  const twLG = ctx.createLinearGradient(0, towerBaseY, 0, towerBaseY - towerH);
  twLG.addColorStop(0, M.darkest);
  twLG.addColorStop(0.5, M.dark);
  twLG.addColorStop(1, M.mid);
  ctx.fillStyle = twLG;
  ctx.beginPath();
  ctx.moveTo(0, towerBaseY);
  ctx.lineTo(-towerW, towerBaseY - towerW * tanA);
  ctx.lineTo(-towerW, towerBaseY - towerW * tanA - towerH);
  ctx.lineTo(0, towerBaseY - towerH);
  ctx.closePath();
  ctx.fill();
  const twRG = ctx.createLinearGradient(0, towerBaseY, 0, towerBaseY - towerH);
  twRG.addColorStop(0, M.mid);
  twRG.addColorStop(0.5, M.light);
  twRG.addColorStop(1, M.lightest);
  ctx.fillStyle = twRG;
  ctx.beginPath();
  ctx.moveTo(0, towerBaseY);
  ctx.lineTo(towerW, towerBaseY - towerW * tanA);
  ctx.lineTo(towerW, towerBaseY - towerW * tanA - towerH);
  ctx.lineTo(0, towerBaseY - towerH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = M.highlight;
  ctx.beginPath();
  ctx.moveTo(0, towerBaseY - towerH);
  ctx.lineTo(-towerW, towerBaseY - towerW * tanA - towerH);
  ctx.lineTo(0, towerBaseY - towerW * tanA * 2 - towerH);
  ctx.lineTo(towerW, towerBaseY - towerW * tanA - towerH);
  ctx.closePath();
  ctx.fill();

  // Arrow slits flush with tower faces
  for (let row = 0; row < 3; row++) {
    const rowY = towerBaseY - towerH * (0.22 + row * 0.24);
    const slitAlpha = wu > 0.3 ? 0.06 + charge * 0.3 : 0.03;
    const slitCY = rowY - 3.5 * s2;
    drawIsoFlushSlit(ctx, -towerW * 0.48, slitCY, 1.2, 7, "left", s2, {
      voidColor: "rgba(6, 2, 4, 0.92)",
      glowColor: slitAlpha > 0.03 ? `rgba(${glowRgb}` : null,
      glowAlpha: slitAlpha,
    });
    drawIsoFlushSlit(ctx, towerW * 0.48, slitCY, 1.2, 7, "right", s2, {
      voidColor: "rgba(6, 2, 4, 0.92)",
      glowColor: slitAlpha > 0.03 ? `rgba(${glowRgb}` : null,
      glowAlpha: slitAlpha,
    });
  }
  // Gothic arch windows on tower faces (between slit rows)
  const winGlow = wu > 0.3 ? 0.15 + charge * 0.4 + readyFlash * 0.2 : 0.08;
  const winY1 = towerBaseY - towerH * 0.34;
  const winY2 = towerBaseY - towerH * 0.58;
  drawIsoGothicWindow(
    ctx,
    -towerW * 0.35,
    winY1,
    3,
    5,
    "left",
    s2,
    `rgba(${glowRgb}`,
    winGlow,
    { frame: M.dark, void: M.darkest, sill: M.highlight },
  );
  drawIsoGothicWindow(
    ctx,
    towerW * 0.35,
    winY1,
    3,
    5,
    "right",
    s2,
    `rgba(${glowRgb}`,
    winGlow,
    { frame: M.mid, void: M.darkest, sill: M.highlight },
  );
  drawIsoGothicWindow(
    ctx,
    -towerW * 0.25,
    winY2,
    2.5,
    4.5,
    "left",
    s2,
    `rgba(${glowRgb}`,
    winGlow * 0.8,
    { frame: M.dark, void: M.darkest, sill: M.highlight },
  );
  drawIsoGothicWindow(
    ctx,
    towerW * 0.25,
    winY2,
    2.5,
    4.5,
    "right",
    s2,
    `rgba(${glowRgb}`,
    winGlow * 0.8,
    { frame: M.mid, void: M.darkest, sill: M.highlight },
  );
  // Flush tech panels on tower faces
  for (let side = -1; side <= 1; side += 2) {
    const face: "left" | "right" = side < 0 ? "left" : "right";
    drawIsoFlushPanel(
      ctx,
      side * towerW * 0.3,
      towerBaseY - towerH * 0.82,
      4,
      3,
      face,
      s2,
      {
        fill: M.darkest,
        borderColor: M.band,
        recessDepth: 0.5,
        innerGlow: `rgba(${glowRgb}, ${(0.05 + charge * 0.15) * wu})`,
      },
    );
  }

  // Iron rivet bands with bolts
  ctx.strokeStyle = M.band;
  ctx.lineWidth = 1 * s2;
  for (let i = 0; i < 4; i++) {
    const iy = towerBaseY - towerH * ((i + 1) / 5);
    ctx.beginPath();
    ctx.moveTo(-towerW, iy - towerW * tanA);
    ctx.lineTo(0, iy);
    ctx.lineTo(towerW, iy - towerW * tanA);
    ctx.stroke();
    // Band bolts
    for (let side = -1; side <= 1; side += 2) {
      const bx = side * towerW * 0.5;
      const by = iy - towerW * tanA * 0.5 * Math.abs(side);
      ctx.fillStyle = M.highlight;
      ctx.beginPath();
      ctx.arc(bx, by, 0.9 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = M.rivet;
  ctx.lineWidth = 1 * s2;
  ctx.beginPath();
  ctx.moveTo(0, towerBaseY);
  ctx.lineTo(0, towerBaseY - towerH);
  ctx.stroke();

  // Reinforcing plates on tower corners with flush rendering
  for (let side = -1; side <= 1; side += 2) {
    const face: "left" | "right" = side < 0 ? "left" : "right";
    const plateX = side * towerW * 0.85;
    const plateMidY = towerBaseY - towerH * 0.5 - towerW * tanA * 0.85;
    const plateH = towerH * 0.6;
    drawIsoFlushPanel(ctx, plateX, plateMidY, 2.5, plateH / s2, face, s2, {
      fill: side < 0 ? M.dark : M.light,
      borderColor: "rgba(0,0,0,0.25)",
      recessDepth: 0.3,
    });
    ctx.fillStyle = M.highlight;
    ctx.beginPath();
    ctx.arc(plateX, plateMidY - plateH * 0.4, 0.8 * s2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(plateX, plateMidY + plateH * 0.4, 0.8 * s2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(plateX, plateMidY, 0.8 * s2, 0, Math.PI * 2);
    ctx.fill();
  }

  // === ENERGY CONDUITS - glow fills upward during warmup ===
  const conduitLevel = wuMechDeploy;
  const conduitAlpha = (0.12 + charge * 0.5 + readyFlash) * conduitLevel;
  const conduitH = towerH * Math.max(0.08, charge) * conduitLevel;
  if (conduitLevel > 0) {
    ctx.strokeStyle = `rgba(${glowRgb}, ${conduitAlpha})`;
    ctx.lineWidth = 1.4 * s2;
    for (let i = 0; i < 3; i++) {
      const xOff = (i - 1) * 4.5 * s2;
      ctx.beginPath();
      ctx.moveTo(xOff, towerBaseY);
      ctx.lineTo(xOff, towerBaseY - conduitH);
      ctx.stroke();
    }
    if (charge > 0.05) {
      const particleCount = 4 + Math.floor(charge * 6);
      for (let p = 0; p < particleCount; p++) {
        const pPhase = (time * (2 + charge * 4) + p * 0.7) % 1;
        const pY = towerBaseY - conduitH * pPhase;
        const pX = ((p % 3) - 1) * 4.5 * s2;
        const pSize = (1 + charge * 1.5) * s2;
        const pAlpha =
          Math.sin(pPhase * Math.PI) * (0.3 + charge * 0.5) * conduitLevel;
        ctx.fillStyle = `rgba(${hotRgb}, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(pX, pY, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // === ROTATING TARGETING DISH - appears during mechDeploy ===
  if (wuMechDeploy > 0.1) {
    const dishY = towerBaseY - towerH * 0.65;
    const dishR = 5 * s2 * wuMechDeploy;
    const dishAngle = time * (0.8 + charge * 3.5) * wuMechDeploy;
    ctx.save();
    ctx.translate(0, dishY);
    ctx.scale(1, 0.5);
    ctx.rotate(dishAngle);
    ctx.globalAlpha = wuMechDeploy;
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.3 + charge * 0.5 + readyFlash})`;
    ctx.lineWidth = 1.5 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, dishR, 0, Math.PI * 2);
    ctx.stroke();
    for (let sp = 0; sp < 4; sp++) {
      const sa = (sp / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sa) * dishR, Math.sin(sa) * dishR);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(${hotRgb}, ${0.3 + charge * 0.5})`;
    ctx.beginPath();
    ctx.arc(0, 0, 1.5 * s2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // === RETRACTING ARMOR PLATES - open during warmup (flush with faces) ===
  if (wuMechDeploy > 0) {
    const plateOpen = wuMechDeploy * charge * 8 * s2;
    const plateY = towerBaseY - towerH * 0.4;
    for (let side = -1; side <= 1; side += 2) {
      const face: "left" | "right" = side < 0 ? "left" : "right";
      const px = side * (towerW * 0.5 + plateOpen);
      const plateCY = plateY - 4 * s2;
      ctx.globalAlpha = wuMechDeploy;
      drawIsoFlushPanel(ctx, px, plateCY, 3, 8, face, s2, {
        fill: side < 0 ? M.darkest : M.mid,
        borderColor: `rgba(${glowRgb}, ${0.1 + charge * 0.35})`,
        recessDepth: 0.4,
        innerGlow: `rgba(${glowRgb}, ${(0.03 + charge * 0.12) * wuMechDeploy})`,
      });
      ctx.fillStyle = M.rivet;
      ctx.beginPath();
      ctx.arc(side * towerW * 0.5, plateCY, 1.2 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // === MECHANICAL CRANK GEARS on tower sides ===
  if (wuMechDeploy > 0) {
    const gearPhase = time * (0.5 + charge * 2.5) * wuMechDeploy;
    for (let gIdx = 0; gIdx < 2; gIdx++) {
      const gSide = gIdx === 0 ? -1 : 1;
      const gcx = gSide * towerW * 0.85;
      const gcy =
        towerBaseY - towerH * (0.25 + gIdx * 0.35) - towerW * tanA * 0.5;
      const gcR = 3.5 * s2;
      const gcTeeth = 6;
      ctx.save();
      ctx.translate(gcx, gcy);
      ctx.rotate(gSide * gearPhase * 1.4);
      ctx.globalAlpha = wuMechDeploy;
      ctx.fillStyle = gSide < 0 ? M.darkest : M.dark;
      ctx.beginPath();
      ctx.arc(0, 0, gcR * 0.65, 0, Math.PI * 2);
      ctx.fill();
      for (let gt = 0; gt < gcTeeth; gt++) {
        const gta = (gt / gcTeeth) * Math.PI * 2;
        ctx.fillStyle = gSide < 0 ? M.dark : M.mid;
        ctx.beginPath();
        ctx.moveTo(
          Math.cos(gta) * gcR * 0.5 - 1.1 * s2,
          Math.sin(gta) * gcR * 0.5,
        );
        ctx.lineTo(Math.cos(gta) * gcR - 1.1 * s2, Math.sin(gta) * gcR);
        ctx.lineTo(Math.cos(gta) * gcR + 1.1 * s2, Math.sin(gta) * gcR);
        ctx.lineTo(
          Math.cos(gta) * gcR * 0.5 + 1.1 * s2,
          Math.sin(gta) * gcR * 0.5,
        );
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = `rgba(${glowRgb}, ${0.1 + charge * 0.25})`;
      ctx.beginPath();
      ctx.arc(0, 0, 1.2 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // === TURRET CAP - splits open during warmup ===
  const capY = towerBaseY - towerH;
  const capSplit = wuCapOpen * 8 * s2;
  // Left half of cap
  ctx.save();
  ctx.translate(-capSplit, 0);
  drawShadedIsoBox(
    ctx,
    capY,
    capW * 0.52,
    capH,
    M.darkest,
    M.dark,
    M.mid,
    M.light,
    M.lightest,
  );
  ctx.restore();
  // Right half of cap
  ctx.save();
  ctx.translate(capSplit, 0);
  drawShadedIsoBox(
    ctx,
    capY,
    capW * 0.52,
    capH,
    M.darkest,
    M.dark,
    M.mid,
    M.light,
    M.lightest,
  );
  ctx.restore();

  // Battlements also split
  const merlonCount = 8;
  for (let i = 0; i < merlonCount; i++) {
    const a = (i / merlonCount) * Math.PI * 2;
    const splitOffset = Math.cos(a) < 0 ? -capSplit : capSplit;
    const mx = Math.cos(a) * capW * 0.82 + splitOffset;
    const my = capY - capH - capW * tanA + Math.sin(a) * capW * 0.41;
    const mw = 2.5 * s2;
    const mh = 3.5 * s2;
    ctx.fillStyle = Math.sin(a) < 0 ? M.mid : M.light;
    ctx.fillRect(mx - mw / 2, my - mh, mw, mh);
    ctx.fillStyle = M.highlight;
    ctx.fillRect(mx - mw / 2, my - mh, mw, 1.2 * s2);
  }

  // === SHIELD DOME - expands during warmup ===
  const shieldScale = wuCapOpen;
  if (shieldScale > 0.05) {
    const shieldY = capY - capH + 2 * s2;
    ctx.save();
    ctx.translate(0, shieldY);
    ctx.scale(1, ISO_Y_RATIO);
    const shieldGrad = ctx.createRadialGradient(
      0,
      -4 * s2,
      3 * s2,
      0,
      0,
      28 * s2,
    );
    shieldGrad.addColorStop(
      0,
      `rgba(${glowRgb}, ${(0.18 + charge * 0.22 + readyFlash * 0.2) * shieldScale})`,
    );
    shieldGrad.addColorStop(
      0.55,
      `rgba(${glowRgb}, ${(0.1 + charge * 0.18) * shieldScale})`,
    );
    shieldGrad.addColorStop(1, `rgba(${grayRgb}, 0)`);
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 28 * s2 * shieldScale, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.3 + charge * 0.4 + readyFlash) * shieldScale})`;
    ctx.lineWidth = 1.9 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, 28 * s2 * shieldScale, Math.PI, 0);
    ctx.stroke();
    ctx.restore();
  }

  // === CRYSTAL ELEVATION - rises from inside the tower ===
  // At wuCrystalRise=0 crystal is hidden inside tower; at 1 it's at full height above cap
  const crystalRestY = capY - capH - 16 * s2;
  const crystalHiddenY = capY + 6 * s2;
  const coreY =
    crystalHiddenY + (crystalRestY - crystalHiddenY) * wuCrystalRise;

  // === GIMBAL HOUSING - unfolds with ringDeploy ===
  const gimbalR = 16 * s2;
  const gimbalAngle = time * (0.5 + charge * 1.8);
  const gimbalScale = wuRingDeploy;

  if (gimbalScale > 0.05) {
    // Gimbal outer ring (back half)
    ctx.save();
    ctx.translate(0, coreY + 5 * s2);
    ctx.scale(gimbalScale, ISO_Y_RATIO * gimbalScale);
    ctx.strokeStyle = `rgba(100, 104, 112, ${(0.5 + charge * 0.3) * gimbalScale})`;
    ctx.lineWidth = 2.5 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, gimbalR + 2 * s2, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Gimbal inner ring (back half)
    ctx.save();
    ctx.translate(0, coreY + 5 * s2);
    ctx.scale(gimbalScale, ISO_Y_RATIO * gimbalScale);
    ctx.rotate(gimbalAngle * gimbalScale);
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.3 + charge * 0.4) * gimbalScale})`;
    ctx.lineWidth = 2 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, gimbalR - 3 * s2, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Guidance rings (back half) - deploy with ringDeploy
  const drawGuidanceRings = (frontHalf: boolean): void => {
    if (wuRingDeploy < 0.05) return;
    const arcStart = frontHalf ? 0 : Math.PI;
    const arcEnd = frontHalf ? Math.PI : Math.PI * 2;
    ctx.save();
    ctx.translate(0, coreY + 5 * s2);
    ctx.scale(wuRingDeploy, ISO_Y_RATIO * wuRingDeploy);
    const ringSpd = (0.7 + charge * 3.0) * wuRingDeploy;
    for (let i = 0; i < 2; i++) {
      ctx.save();
      ctx.rotate((i === 0 ? 1 : -1) * time * (ringSpd + i * 0.25));
      ctx.strokeStyle = `rgba(${glowRgb}, ${(0.25 + charge * 0.45 + readyFlash) * wuRingDeploy})`;
      ctx.lineWidth = (2.4 - i * 0.5) * s2;
      ctx.setLineDash([(10 + i * 3) * s2, (7 + i * 2) * s2]);
      ctx.beginPath();
      ctx.arc(0, 0, (29 - i * 9) * s2, arcStart, arcEnd);
      ctx.stroke();
      ctx.restore();
    }
    ctx.setLineDash([]);
    ctx.restore();
  };

  drawGuidanceRings(false);

  // === ISOMETRIC HEXAGONAL CRYSTAL — proper 3D faceted prism ===
  if (wuCrystalRise > 0.05) {
    const crystalAlpha = Math.min(1, wuCrystalRise * 1.5);
    ctx.globalAlpha = crystalAlpha;

    // Hexagonal prism crystal in 2:1 isometric.
    // 6 vertices on top, 6 on bottom, pointed tip above, pointed base below.
    const cW = 7.5 * s2; // half-width of hex at widest
    const cH = 18 * s2; // total body height
    const tipH = 8 * s2; // pointed tip height
    const baseH = 6 * s2; // pointed base height
    const isoSq = ISO_Y_RATIO;

    // Hex vertices (top ring) — 6 points of a flat-top hex projected isometrically
    const hexPts = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      return { x: Math.cos(a) * cW, y: Math.sin(a) * cW * isoSq };
    });

    const bodyTop = coreY - cH * 0.5;
    const bodyBot = coreY + cH * 0.5;
    const tipY = bodyTop - tipH;
    const baseY = bodyBot + baseH;

    // Color helpers
    const cR = lerpR,
      cG = lerpG,
      cB = lerpB;
    const darkMul = 0.35 + charge * 0.15;
    const midMul = 0.55 + charge * 0.15;
    const litMul = 0.75 + charge * 0.15;
    const brightMul = 0.9 + charge * 0.1;
    const edgeAlpha = 0.4 + charge * 0.4;

    // Outer glow halo behind crystal
    const coreGlow = ctx.createRadialGradient(0, coreY, 0, 0, coreY, 16 * s2);
    coreGlow.addColorStop(
      0,
      `rgba(${Math.min(255, cR + 60)}, ${Math.min(255, cG + 60)}, ${Math.min(255, cB + 60)}, ${0.4 + charge * 0.4 + readyFlash * 0.15})`,
    );
    coreGlow.addColorStop(0.5, `rgba(${glowRgb}, ${0.12 + charge * 0.2})`);
    coreGlow.addColorStop(1, `rgba(${grayRgb}, 0)`);
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, coreY, 16 * s2, 0, Math.PI * 2);
    ctx.fill();

    // --- BACK FACES (indices 3,4,5 → drawn first for depth) ---
    for (const fi of [3, 4, 5]) {
      const ni = (fi + 1) % 6;
      const mul = fi === 4 ? darkMul : fi === 3 ? midMul : darkMul;
      const fG = ctx.createLinearGradient(
        hexPts[fi].x,
        bodyTop,
        hexPts[fi].x,
        bodyBot,
      );
      fG.addColorStop(
        0,
        `rgba(${Math.round(cR * mul)}, ${Math.round(cG * mul)}, ${Math.round(cB * mul)}, ${0.7 + charge * 0.25})`,
      );
      fG.addColorStop(
        1,
        `rgba(${Math.round(cR * mul * 0.7)}, ${Math.round(cG * mul * 0.7)}, ${Math.round(cB * mul * 0.7)}, ${0.6 + charge * 0.3})`,
      );
      ctx.fillStyle = fG;
      ctx.beginPath();
      ctx.moveTo(hexPts[fi].x, bodyTop + hexPts[fi].y);
      ctx.lineTo(hexPts[ni].x, bodyTop + hexPts[ni].y);
      ctx.lineTo(hexPts[ni].x, bodyBot + hexPts[ni].y);
      ctx.lineTo(hexPts[fi].x, bodyBot + hexPts[fi].y);
      ctx.closePath();
      ctx.fill();
    }

    // Back tip triangles
    for (const fi of [3, 4, 5]) {
      const ni = (fi + 1) % 6;
      ctx.fillStyle = `rgba(${Math.round(cR * darkMul * 0.8)}, ${Math.round(cG * darkMul * 0.8)}, ${Math.round(cB * darkMul * 0.8)}, ${0.55 + charge * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(hexPts[fi].x, bodyTop + hexPts[fi].y);
      ctx.lineTo(hexPts[ni].x, bodyTop + hexPts[ni].y);
      ctx.lineTo(0, tipY);
      ctx.closePath();
      ctx.fill();
    }

    // Back base triangles
    for (const fi of [3, 4, 5]) {
      const ni = (fi + 1) % 6;
      ctx.fillStyle = `rgba(${Math.round(cR * darkMul * 0.6)}, ${Math.round(cG * darkMul * 0.6)}, ${Math.round(cB * darkMul * 0.6)}, ${0.5 + charge * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(hexPts[fi].x, bodyBot + hexPts[fi].y);
      ctx.lineTo(hexPts[ni].x, bodyBot + hexPts[ni].y);
      ctx.lineTo(0, baseY);
      ctx.closePath();
      ctx.fill();
    }

    // --- FRONT FACES (indices 0,1,2) — drawn on top for depth ---
    // Face 0 (front-right): brightest (lit by light from upper-right)
    // Face 1 (front): medium
    // Face 2 (front-left): medium-dark
    for (const fi of [2, 1, 0]) {
      const ni = (fi + 1) % 6;
      const mul = fi === 0 ? brightMul : fi === 1 ? litMul : midMul;
      const fG = ctx.createLinearGradient(
        hexPts[fi].x,
        bodyTop,
        hexPts[ni].x,
        bodyBot,
      );
      fG.addColorStop(
        0,
        `rgba(${Math.min(255, Math.round(cR * mul))}, ${Math.min(255, Math.round(cG * mul))}, ${Math.min(255, Math.round(cB * mul))}, ${0.75 + charge * 0.2})`,
      );
      fG.addColorStop(
        1,
        `rgba(${Math.round(cR * mul * 0.8)}, ${Math.round(cG * mul * 0.8)}, ${Math.round(cB * mul * 0.8)}, ${0.65 + charge * 0.25})`,
      );
      ctx.fillStyle = fG;
      ctx.beginPath();
      ctx.moveTo(hexPts[fi].x, bodyTop + hexPts[fi].y);
      ctx.lineTo(hexPts[ni].x, bodyTop + hexPts[ni].y);
      ctx.lineTo(hexPts[ni].x, bodyBot + hexPts[ni].y);
      ctx.lineTo(hexPts[fi].x, bodyBot + hexPts[fi].y);
      ctx.closePath();
      ctx.fill();
    }

    // Front tip triangles (pointed top)
    for (const fi of [2, 1, 0]) {
      const ni = (fi + 1) % 6;
      const mul = fi === 0 ? brightMul : fi === 1 ? litMul * 1.1 : midMul;
      ctx.fillStyle = `rgba(${Math.min(255, Math.round(cR * mul))}, ${Math.min(255, Math.round(cG * mul))}, ${Math.min(255, Math.round(cB * mul))}, ${0.7 + charge * 0.25})`;
      ctx.beginPath();
      ctx.moveTo(hexPts[fi].x, bodyTop + hexPts[fi].y);
      ctx.lineTo(hexPts[ni].x, bodyTop + hexPts[ni].y);
      ctx.lineTo(0, tipY);
      ctx.closePath();
      ctx.fill();
    }

    // Front base triangles (pointed bottom)
    for (const fi of [2, 1, 0]) {
      const ni = (fi + 1) % 6;
      const mul =
        fi === 0 ? litMul * 0.8 : fi === 1 ? midMul * 0.9 : darkMul * 0.9;
      ctx.fillStyle = `rgba(${Math.round(cR * mul)}, ${Math.round(cG * mul)}, ${Math.round(cB * mul)}, ${0.6 + charge * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(hexPts[fi].x, bodyBot + hexPts[fi].y);
      ctx.lineTo(hexPts[ni].x, bodyBot + hexPts[ni].y);
      ctx.lineTo(0, baseY);
      ctx.closePath();
      ctx.fill();
    }

    // Edge wireframe for facet definition
    ctx.strokeStyle = `rgba(${Math.min(255, cR + 80)}, ${Math.min(255, cG + 70)}, ${Math.min(255, cB + 60)}, ${edgeAlpha})`;
    ctx.lineWidth = 0.7 * s2;
    for (let i = 0; i < 6; i++) {
      const ni = (i + 1) % 6;
      // Body vertical edges
      ctx.beginPath();
      ctx.moveTo(hexPts[i].x, bodyTop + hexPts[i].y);
      ctx.lineTo(hexPts[i].x, bodyBot + hexPts[i].y);
      ctx.stroke();
      // Top edges
      ctx.beginPath();
      ctx.moveTo(hexPts[i].x, bodyTop + hexPts[i].y);
      ctx.lineTo(hexPts[ni].x, bodyTop + hexPts[ni].y);
      ctx.stroke();
      // Bottom edges
      ctx.beginPath();
      ctx.moveTo(hexPts[i].x, bodyBot + hexPts[i].y);
      ctx.lineTo(hexPts[ni].x, bodyBot + hexPts[ni].y);
      ctx.stroke();
      // Tip ridges
      ctx.beginPath();
      ctx.moveTo(hexPts[i].x, bodyTop + hexPts[i].y);
      ctx.lineTo(0, tipY);
      ctx.stroke();
      // Base ridges
      ctx.beginPath();
      ctx.moveTo(hexPts[i].x, bodyBot + hexPts[i].y);
      ctx.lineTo(0, baseY);
      ctx.stroke();
    }

    // Specular highlight streak on front-right face
    const specAlpha = 0.15 + charge * 0.25 + readyFlash * 0.1;
    const specG = ctx.createLinearGradient(
      hexPts[0].x * 0.6,
      bodyTop,
      hexPts[1].x * 0.4,
      bodyBot,
    );
    specG.addColorStop(0, `rgba(255, 255, 255, ${specAlpha * 0.7})`);
    specG.addColorStop(0.3, `rgba(255, 255, 255, ${specAlpha})`);
    specG.addColorStop(0.7, `rgba(255, 255, 255, ${specAlpha * 0.5})`);
    specG.addColorStop(1, `rgba(255, 255, 255, 0)`);
    ctx.fillStyle = specG;
    ctx.beginPath();
    const sp0 = hexPts[0],
      sp1 = hexPts[1];
    const inset = 0.2;
    ctx.moveTo(
      sp0.x * (1 - inset) + sp1.x * inset,
      bodyTop + sp0.y * (1 - inset) + sp1.y * inset,
    );
    ctx.lineTo(
      sp1.x * (1 - inset) + sp0.x * inset,
      bodyTop + sp1.y * (1 - inset) + sp0.y * inset,
    );
    ctx.lineTo(
      sp1.x * (1 - inset) + sp0.x * inset,
      bodyBot + sp1.y * (1 - inset) + sp0.y * inset,
    );
    ctx.lineTo(
      sp0.x * (1 - inset) + sp1.x * inset,
      bodyBot + sp0.y * (1 - inset) + sp1.y * inset,
    );
    ctx.closePath();
    ctx.fill();

    // Internal refraction lines (shimmer with charge)
    if (charge > 0.1) {
      ctx.strokeStyle = `rgba(${Math.min(255, cR + 100)}, ${Math.min(255, cG + 90)}, ${Math.min(255, cB + 80)}, ${charge * 0.3 + readyFlash * 0.15})`;
      ctx.lineWidth = 0.5 * s2;
      for (let r = 0; r < 3; r++) {
        const rPhase = time * 0.5 + r * 2.1;
        const ry = coreY + Math.sin(rPhase) * cH * 0.35;
        const rx = Math.cos(rPhase * 1.3) * cW * 0.6;
        ctx.beginPath();
        ctx.moveTo(rx - cW * 0.5, ry - 2 * s2);
        ctx.lineTo(rx + cW * 0.5, ry + 2 * s2);
        ctx.stroke();
      }
    }

    // Inner core hotspot
    ctx.fillStyle = `rgba(${Math.min(255, cR + 80)}, ${Math.min(255, cG + 80)}, ${Math.min(255, cB + 80)}, ${0.3 + charge * 0.5 + readyFlash})`;
    ctx.beginPath();
    ctx.arc(0, coreY + 1.5 * s2, (2 + charge * 1) * s2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  // Gimbal front halves
  if (gimbalScale > 0.05) {
    ctx.save();
    ctx.translate(0, coreY + 5 * s2);
    ctx.scale(gimbalScale, ISO_Y_RATIO * gimbalScale);
    ctx.strokeStyle = `rgba(120, 124, 132, ${(0.5 + charge * 0.3) * gimbalScale})`;
    ctx.lineWidth = 2.5 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, gimbalR + 2 * s2, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(0, coreY + 5 * s2);
    ctx.scale(gimbalScale, ISO_Y_RATIO * gimbalScale);
    ctx.rotate(gimbalAngle * gimbalScale);
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.35 + charge * 0.45 + readyFlash) * gimbalScale})`;
    ctx.lineWidth = 2 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, gimbalR - 3 * s2, 0, Math.PI);
    ctx.stroke();
    for (let ch = 0; ch < 4; ch++) {
      const cha = (ch / 4) * Math.PI * 2;
      const cix = Math.cos(cha) * (gimbalR - 3 * s2);
      const ciy = Math.sin(cha) * (gimbalR - 3 * s2);
      ctx.fillStyle = `rgba(${hotRgb}, ${(0.3 + charge * 0.4 + readyFlash) * gimbalScale})`;
      ctx.beginPath();
      ctx.arc(cix, ciy, 1.5 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawGuidanceRings(true);

  // === ASSEMBLING FRAGMENTS - deploy from far away during warmup ===
  if (wuRingDeploy > 0.1) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + time * 0.3;
      const maxD = 50 * s2 + (1 - wuRingDeploy) * 40 * s2;
      const minD = 8 * s2;
      const dist = maxD - (maxD - minD) * charge;
      const fx = Math.cos(a) * dist;
      const fy = coreY + 5 * s2 + Math.sin(a) * dist * 0.5;
      const fSize = (3 + charge * 2) * s2 * wuRingDeploy;
      ctx.fillStyle = `rgba(${glowRgb}, ${(0.25 + charge * 0.5 + readyFlash) * wuRingDeploy})`;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(a + time * (0.8 + charge * 4));
      ctx.fillRect(-fSize / 2, -fSize / 2, fSize, fSize);
      ctx.restore();
    }
  }

  // === ORBITING DRONES - deploy outward during ringDeploy ===
  if (wuRingDeploy > 0.15) {
    const droneSpd = (0.6 + charge * 2.0) * wuRingDeploy;
    const droneOrbitR = 30 * s2 * wuRingDeploy;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + time * (droneSpd + i * 0.04);
      const x = Math.cos(a) * droneOrbitR;
      const y = coreY + 12 * s2 + Math.sin(a) * 12 * s2 * wuRingDeploy;
      const sz = (4.4 + (i % 2) * 1.3) * s2 * wuRingDeploy;
      const tetherG = ctx.createLinearGradient(0, coreY, x, y);
      tetherG.addColorStop(
        0,
        `rgba(${glowRgb}, ${(0.08 + charge * 0.25) * wuRingDeploy})`,
      );
      tetherG.addColorStop(
        1,
        `rgba(${glowRgb}, ${(0.02 + charge * 0.1) * wuRingDeploy})`,
      );
      ctx.strokeStyle = tetherG;
      ctx.lineWidth = 0.7 * s2;
      ctx.beginPath();
      ctx.moveTo(0, coreY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = `rgba(${glowRgb}, ${(0.35 + charge * 0.4 + readyFlash) * wuRingDeploy})`;
      ctx.beginPath();
      ctx.moveTo(x, y - sz);
      ctx.lineTo(x - 2.2 * s2, y);
      ctx.lineTo(x, y + sz);
      ctx.lineTo(x + 2.2 * s2, y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(${glowRgb}, ${(0.25 + charge * 0.45) * wuRingDeploy})`;
      ctx.lineWidth = 1.1 * s2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(a + 0.7) * 7 * s2,
        y + Math.sin(a + 0.7) * 4 * s2,
      );
      ctx.stroke();
      ctx.fillStyle = `rgba(${hotRgb}, ${(0.15 + charge * 0.3 + readyFlash * 0.2) * wuRingDeploy})`;
      ctx.beginPath();
      ctx.arc(x, y, 2 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === SWEEP BEAM - only active once fully warmed up ===
  if (wu > 0.8) {
    const beamAlpha = Math.min(1, (wu - 0.8) / 0.2);
    const sweepAng = time * (0.8 + charge * 3.0);
    const beamX = Math.cos(sweepAng) * 44 * s2;
    const beamY = Math.sin(sweepAng) * 22 * s2;
    const beamG = ctx.createLinearGradient(0, coreY + 2 * s2, beamX, beamY);
    beamG.addColorStop(
      0,
      `rgba(${glowRgb}, ${(0.2 + charge * 0.55 + readyFlash) * beamAlpha})`,
    );
    beamG.addColorStop(1, "transparent");
    ctx.strokeStyle = beamG;
    ctx.lineWidth = (2 + charge * 2) * s2;
    ctx.beginPath();
    ctx.moveTo(0, coreY + 2 * s2);
    ctx.lineTo(beamX, beamY);
    ctx.stroke();
  }

  // === SEQUENTIAL ACTIVATION INDICATORS ===
  if (wuMechDeploy > 0) {
    const indicatorCount = 6;
    const litIndicators = Math.floor(charge * indicatorCount);
    for (let ind = 0; ind < indicatorCount; ind++) {
      const indY = towerBaseY - towerH * ((ind + 0.5) / indicatorCount);
      const indX = towerW + 3 * s2;
      const isLit = ind < litIndicators;
      const isActivating = ind === litIndicators && charge < 1;
      const partial = isActivating
        ? charge * indicatorCount - litIndicators
        : 0;
      const indR = 1.8 * s2;
      if (isLit) {
        const indGlow = ctx.createRadialGradient(
          indX,
          indY - towerW * tanA,
          0,
          indX,
          indY - towerW * tanA,
          indR * 3,
        );
        indGlow.addColorStop(
          0,
          `rgba(${hotRgb}, ${(0.3 + readyFlash * 0.2) * wuMechDeploy})`,
        );
        indGlow.addColorStop(1, "transparent");
        ctx.fillStyle = indGlow;
        ctx.beginPath();
        ctx.arc(indX, indY - towerW * tanA, indR * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = isLit
        ? `rgba(${hotRgb}, ${(0.7 + Math.sin(time * 3 + ind) * 0.15 + readyFlash) * wuMechDeploy})`
        : `rgba(${grayRgb}, ${(0.25 + partial * 0.45) * wuMechDeploy})`;
      ctx.beginPath();
      ctx.arc(indX, indY - towerW * tanA, indR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ready burst halo
  if (charge >= 0.85 && wu >= 1) {
    const burstIntensity = (charge - 0.85) / 0.15;
    const burstG = ctx.createRadialGradient(0, coreY, 0, 0, coreY, 35 * s2);
    burstG.addColorStop(
      0,
      `rgba(255, 220, 200, ${(0.15 + readyFlash * 0.25) * burstIntensity})`,
    );
    burstG.addColorStop(
      0.5,
      `rgba(${hotRgb}, ${(0.08 + readyFlash * 0.15) * burstIntensity})`,
    );
    burstG.addColorStop(1, "transparent");
    ctx.fillStyle = burstG;
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
  warmupProgress: number,
): void {
  const charge = Math.max(0, Math.min(1, chargeProgress));
  const wu = Math.max(0, Math.min(1, warmupProgress));
  const stage =
    enemyHeatCount === 0
      ? 0
      : enemyHeatCount <= 3
        ? 1
        : enemyHeatCount <= 6
          ? 2
          : 3;
  const surge = Math.sin(time * 7.6 + 1.1) * 0.5 + 0.5;
  const s2 = s * 1.16;
  const tanA = ISO_TAN;
  const hotRgb = [
    "240, 131, 58",
    "250, 148, 66",
    "255, 168, 82",
    "255, 198, 120",
  ][stage];
  const stageR = [240, 250, 255, 255][stage];
  const stageG = [131, 148, 168, 198][stage];
  const stageB = [58, 66, 82, 120][stage];
  const lerpR = Math.round(120 + (stageR - 120) * charge);
  const lerpG = Math.round(120 + (stageG - 120) * charge);
  const lerpB = Math.round(130 + (stageB - 130) * charge);
  const glowRgb = `${lerpR}, ${lerpG}, ${lerpB}`;
  const grayRgb = "120, 120, 130";
  const readyFlash =
    charge >= 0.98 ? (Math.sin(time * 11) * 0.5 + 0.5) * 0.35 : 0;
  const runeSet = ["ᚠ", "ᛋ", "ᚱ", "ᛟ", "ᚲ", "ᛞ", "ᛇ", "ᚹ"];

  // Warmup sub-phases
  const wuGearSpin = Math.max(0, Math.min(1, (wu - 0.0) / 0.3)); // 0-30%: base gear activates
  const wuColumnRise = Math.max(0, Math.min(1, (wu - 0.15) / 0.45)); // 15-60%: column telescopes up
  const wuPanelExtend = Math.max(0, Math.min(1, (wu - 0.2) / 0.4)); // 20-60%: solar panels extend
  const wuRingExpand = Math.max(0, Math.min(1, (wu - 0.4) / 0.4)); // 40-80%: armillary rings expand
  const wuCoreLift = Math.max(0, Math.min(1, (wu - 0.55) / 0.45)); // 55-100%: sun core rises and ignites

  const baseW = 34 * s2;
  const baseH = 8 * s2;
  const pedRX = 20 * s2;
  const pedRY = pedRX * ISO_Y_RATIO;
  const pedH = 10 * s2;
  const colRX = 6 * s2;
  const colRY = colRX * ISO_Y_RATIO;
  const fullColH = 36 * s2;
  const colH = fullColH * Math.max(0.3, wuColumnRise);
  const armR = 22 * s2;

  ctx.translate(0, baseW * tanA);

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.beginPath();
  ctx.ellipse(0, -baseW * tanA + 5 * s2, 50 * s2, 24 * s2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floor glow - intensifies during warmup
  if (wu > 0.05) {
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
      `rgba(${glowRgb}, ${(0.12 + charge * 0.22 + readyFlash * 0.15) * wu})`,
    );
    floorGlow.addColorStop(
      0.52,
      `rgba(${glowRgb}, ${(0.05 + charge * 0.1) * wu})`,
    );
    floorGlow.addColorStop(1, "transparent");
    ctx.fillStyle = floorGlow;
    ctx.beginPath();
    ctx.ellipse(0, -baseW * tanA, 64 * s2, 30 * s2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Charge fill arc on ground
  const railY = -baseW * tanA + 2.2 * s2;
  const railOuterR = 44 * s2;
  const railMidR = 35 * s2;
  const railInnerR = 25 * s2;
  if (charge > 0.02 && wu > 0.1) {
    ctx.save();
    ctx.translate(0, railY);
    ctx.scale(1, ISO_Y_RATIO);
    ctx.strokeStyle = `rgba(${hotRgb}, ${(0.35 + charge * 0.5 + readyFlash) * wu})`;
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

  // Rail/rune system
  const drawSunforgeRail = (frontHalf: boolean): void => {
    if (wu < 0.1) return;
    const arcStart = frontHalf ? 0 : Math.PI;
    const arcEnd = frontHalf ? Math.PI : Math.PI * 2;
    ctx.save();
    ctx.translate(0, railY);
    ctx.scale(1, ISO_Y_RATIO);
    ctx.globalAlpha = wu;
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.15 + charge * 0.2 + readyFlash * 0.1})`;
    ctx.lineWidth = 7.4 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, railMidR + 1.5 * s2, arcStart, arcEnd);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.4 + readyFlash})`;
    ctx.lineWidth = 3 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, railOuterR, arcStart, arcEnd);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.35})`;
    ctx.lineWidth = 2.2 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, railMidR, arcStart, arcEnd);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.22 + charge * 0.35})`;
    ctx.lineWidth = 1.5 * s2;
    ctx.setLineDash([7 * s2, 5 * s2]);
    ctx.beginPath();
    ctx.arc(0, 0, railInnerR, arcStart, arcEnd);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + time * (0.12 + charge * 0.2) * wu;
      const isFront = Math.sin(a) >= 0;
      if (isFront !== frontHalf) continue;
      const ix = Math.cos(a) * (railMidR + 1.3 * s2);
      const iy = Math.sin(a) * (railMidR + 1.3 * s2);
      const ox = Math.cos(a) * (railOuterR - 1.2 * s2);
      const oy = Math.sin(a) * (railOuterR - 1.2 * s2);
      const tickLit = i / 18 < charge;
      ctx.strokeStyle = tickLit
        ? `rgba(255, 228, 188, ${0.55 + surge * 0.3 + readyFlash})`
        : `rgba(${grayRgb}, 0.3)`;
      ctx.lineWidth = (i % 3 === 0 ? 1.9 : 1.2) * s2;
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ox, oy);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) {
      const a =
        time * (0.4 + i * 0.18 + charge * 0.5) * wu + (i * Math.PI * 2) / 4;
      const x = Math.cos(a) * 39 * s2;
      const y = Math.sin(a) * 39 * s2;
      if (y >= 0 !== frontHalf) continue;
      ctx.fillStyle = `rgba(${glowRgb}, ${0.25 + charge * 0.5 + readyFlash})`;
      ctx.beginPath();
      ctx.arc(x, y, (1.8 + charge * 1.2) * s2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  };

  const drawSunforgeRunes = (frontHalf: boolean): void => {
    if (wu < 0.15) return;
    ctx.font = `bold ${6.8 * s2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const litRunes = Math.floor(charge * 16);
    const runeOpacity = Math.min(1, wu * 1.5);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 - time * (0.2 + charge * 0.25) * wu;
      const x = Math.cos(a) * 31.5 * s2;
      const y = Math.sin(a) * 15.7 * s2 + railY;
      if (Math.sin(a) >= 0 !== frontHalf) continue;
      const isLit = i < litRunes;
      const alpha =
        (isLit
          ? 0.45 +
            Math.sin(time * 2.9 + i * 0.8) * 0.14 +
            charge * 0.3 +
            readyFlash
          : 0.22 + Math.sin(time * 1.2 + i * 0.8) * 0.06) * runeOpacity;
      ctx.fillStyle = isLit
        ? `rgba(${hotRgb}, ${Math.max(0.14, alpha)})`
        : `rgba(${grayRgb}, ${Math.max(0.12, alpha)})`;
      ctx.fillText(runeSet[i % runeSet.length], x, y);
    }
  };

  drawSunforgeRail(false);
  drawSunforgeRunes(false);

  // === BASE PLATFORM ===
  drawShadedIsoBox(
    ctx,
    0,
    baseW,
    baseH,
    "#241a0e",
    "#342a16",
    "#44361e",
    "#544628",
    "#645630",
  );

  // Multiple trim bands for richer detail
  for (let bandIdx = 0; bandIdx < 3; bandIdx++) {
    const bandFrac = [0.2, 0.5, 0.82][bandIdx];
    const bandY = -baseH * bandFrac;
    const bandAlpha = [0.35, 0.5, 0.35][bandIdx];
    const bandWidth = [0.8, 1.3, 0.9][bandIdx];
    ctx.strokeStyle = `rgba(140, 110, 60, ${bandAlpha})`;
    ctx.lineWidth = bandWidth * s2;
    ctx.beginPath();
    ctx.moveTo(0, bandY);
    ctx.lineTo(-baseW, -baseW * tanA + bandY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, bandY);
    ctx.lineTo(baseW, -baseW * tanA + bandY);
    ctx.stroke();
  }
  // Center spine line
  ctx.strokeStyle = "rgba(160, 120, 60, 0.4)";
  ctx.lineWidth = 1 * s2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -baseH);
  ctx.stroke();
  // Edge highlight on top edges for bevel effect
  ctx.strokeStyle = "rgba(180, 150, 80, 0.3)";
  ctx.lineWidth = 0.6 * s2;
  ctx.beginPath();
  ctx.moveTo(0, -baseH);
  ctx.lineTo(-baseW, -baseW * tanA - baseH);
  ctx.stroke();
  ctx.strokeStyle = "rgba(200, 170, 100, 0.25)";
  ctx.beginPath();
  ctx.moveTo(0, -baseH);
  ctx.lineTo(baseW, -baseW * tanA - baseH);
  ctx.stroke();

  // Rivet studs along base (both faces, staggered)
  for (let side = -1; side <= 1; side += 2) {
    for (let r = 0; r < 4; r++) {
      const frac = 0.18 + r * 0.2;
      const rx = side * baseW * frac;
      const ry = -baseW * tanA * frac * Math.abs(side) - baseH * 0.25;
      ctx.fillStyle = "#8a7840";
      ctx.beginPath();
      ctx.arc(rx, ry, 1.2 * s2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a4820";
      ctx.beginPath();
      ctx.arc(rx + 0.3 * s2, ry + 0.3 * s2, 0.5 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let r = 0; r < 3; r++) {
      const frac = 0.25 + r * 0.25;
      const rx = side * baseW * frac;
      const ry = -baseW * tanA * frac * Math.abs(side) - baseH * 0.72;
      ctx.fillStyle = "#7a6838";
      ctx.beginPath();
      ctx.arc(rx, ry, 1 * s2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Flush vent gratings on base faces
  for (let v = 0; v < 2; v++) {
    const leftVx = -baseW * (0.3 + v * 0.3);
    const leftVy = -baseW * tanA * (0.3 + v * 0.3) - baseH * 0.65;
    drawIsoFlushVent(ctx, leftVx, leftVy, 5, 4, "left", s2, {
      frameColor: "#38260e",
      bgColor: "rgba(10, 6, 2, 0.85)",
      slatColor: `rgba(${glowRgb}, ${0.08 + charge * 0.2})`,
      slats: 3,
    });
  }
  for (let v = 0; v < 2; v++) {
    const rightVx = baseW * (0.25 + v * 0.35);
    const rightVy = -baseW * tanA * (0.25 + v * 0.35) - baseH * 0.5;
    drawIsoFlushVent(ctx, rightVx, rightVy, 4, 3, "right", s2, {
      frameColor: "#584020",
      bgColor: "rgba(10, 6, 2, 0.85)",
      slatColor: `rgba(${glowRgb}, ${0.06 + charge * 0.15})`,
      slats: 2,
    });
  }
  // Decorative bronze panels on base faces
  for (let side = -1; side <= 1; side += 2) {
    const face: "left" | "right" = side < 0 ? "left" : "right";
    const px = side * baseW * 0.65;
    const py = -baseW * tanA * 0.65 - baseH * 0.35;
    drawIsoFlushPanel(ctx, px, py, 4, 2.5, face, s2, {
      fill: "#2a1c0c",
      borderColor: "rgba(140, 110, 60, 0.4)",
      recessDepth: 0.5,
      innerGlow: `rgba(${glowRgb}, ${(0.03 + charge * 0.1) * wu})`,
    });
  }
  // Flush slits on base for added detail
  for (let side = -1; side <= 1; side += 2) {
    const face: "left" | "right" = side < 0 ? "left" : "right";
    const sx = side * baseW * 0.45;
    const sy = -baseW * tanA * 0.45 - baseH * 0.5;
    drawIsoFlushSlit(ctx, sx, sy, 1, 4, face, s2, {
      voidColor: "rgba(10, 6, 2, 0.8)",
      glowColor: wu > 0.1 ? `rgba(${glowRgb}` : null,
      glowAlpha: (0.08 + charge * 0.15) * wu,
    });
  }

  // === ROTATING BASE GEAR PLATE - spins up during wuGearSpin ===
  if (wuGearSpin > 0) {
    const gearPlateY = -baseH - baseW * tanA + 1 * s2;
    const gearPlateR = 16 * s2;
    const gearTeethCount = 16;
    const gearAngle = time * (0.2 + charge * 0.6) * wuGearSpin;
    ctx.save();
    ctx.translate(0, gearPlateY);
    ctx.scale(1, ISO_Y_RATIO);
    ctx.rotate(gearAngle);
    ctx.globalAlpha = wuGearSpin;
    // Gear body with gradient
    const gearGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, gearPlateR);
    gearGrad.addColorStop(0, "rgba(100, 80, 40, 0.5)");
    gearGrad.addColorStop(0.7, "rgba(80, 60, 30, 0.45)");
    gearGrad.addColorStop(1, "rgba(60, 45, 22, 0.4)");
    ctx.fillStyle = gearGrad;
    ctx.beginPath();
    ctx.arc(0, 0, gearPlateR, 0, Math.PI * 2);
    ctx.fill();
    // Gear teeth
    ctx.strokeStyle = `rgba(${glowRgb}, ${0.15 + charge * 0.25})`;
    ctx.lineWidth = 1.2 * s2;
    for (let gt = 0; gt < gearTeethCount; gt++) {
      const gta = (gt / gearTeethCount) * Math.PI * 2;
      const iR = gearPlateR * 0.78;
      const oR = gearPlateR * 1.08;
      const toothHalfWidth = 0.1;
      ctx.fillStyle =
        gt % 2 === 0 ? "rgba(100, 80, 40, 0.5)" : "rgba(80, 60, 30, 0.45)";
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(gta - toothHalfWidth) * iR,
        Math.sin(gta - toothHalfWidth) * iR,
      );
      ctx.lineTo(
        Math.cos(gta - toothHalfWidth * 0.7) * oR,
        Math.sin(gta - toothHalfWidth * 0.7) * oR,
      );
      ctx.lineTo(
        Math.cos(gta + toothHalfWidth * 0.7) * oR,
        Math.sin(gta + toothHalfWidth * 0.7) * oR,
      );
      ctx.lineTo(
        Math.cos(gta + toothHalfWidth) * iR,
        Math.sin(gta + toothHalfWidth) * iR,
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Inner ring
    ctx.strokeStyle = "rgba(120, 90, 40, 0.55)";
    ctx.lineWidth = 1.8 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, gearPlateR * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    // Spoke lines
    ctx.strokeStyle = "rgba(100, 80, 40, 0.35)";
    ctx.lineWidth = 0.8 * s2;
    for (let sp = 0; sp < 6; sp++) {
      const spa = (sp / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(spa) * gearPlateR * 0.2,
        Math.sin(spa) * gearPlateR * 0.2,
      );
      ctx.lineTo(
        Math.cos(spa) * gearPlateR * 0.53,
        Math.sin(spa) * gearPlateR * 0.53,
      );
      ctx.stroke();
    }
    // Center hub
    ctx.fillStyle = `rgba(${glowRgb}, ${0.12 + charge * 0.2})`;
    ctx.beginPath();
    ctx.arc(0, 0, gearPlateR * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(140, 110, 50, 0.6)";
    ctx.lineWidth = 1 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, gearPlateR * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // === CIRCULAR BRONZE PEDESTAL ===
  const pedCY = -baseH - baseW * tanA;
  // Back half of cylinder wall (darker)
  ctx.fillStyle = "#2a1c0c";
  ctx.beginPath();
  ctx.ellipse(0, pedCY, pedRX, pedRY, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(pedRX, pedCY - pedH);
  ctx.ellipse(0, pedCY - pedH, pedRX, pedRY, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  // Front half with richer gradient
  const pedGrad = ctx.createLinearGradient(-pedRX, 0, pedRX, 0);
  pedGrad.addColorStop(0, "#38260e");
  pedGrad.addColorStop(0.2, "#4e3618");
  pedGrad.addColorStop(0.4, "#6a5030");
  pedGrad.addColorStop(0.6, "#7a6038");
  pedGrad.addColorStop(0.8, "#6a5030");
  pedGrad.addColorStop(1, "#4e3618");
  ctx.fillStyle = pedGrad;
  ctx.beginPath();
  ctx.ellipse(0, pedCY, pedRX, pedRY, 0, 0, Math.PI);
  ctx.lineTo(-pedRX, pedCY - pedH);
  ctx.ellipse(0, pedCY - pedH, pedRX, pedRY, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();
  // Edge lines
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-pedRX, pedCY);
  ctx.lineTo(-pedRX, pedCY - pedH);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pedRX, pedCY);
  ctx.lineTo(pedRX, pedCY - pedH);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, pedCY, pedRX, pedRY, 0, 0, Math.PI);
  ctx.stroke();
  // Top surface with concentric detail rings
  ctx.fillStyle = "#7a5c34";
  ctx.beginPath();
  ctx.ellipse(0, pedCY - pedH, pedRX, pedRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(100, 80, 40, 0.35)";
  ctx.lineWidth = 0.7 * s2;
  ctx.beginPath();
  ctx.ellipse(0, pedCY - pedH, pedRX * 0.9, pedRY * 0.9, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, pedCY - pedH, pedRX, pedRY, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Energy rings on top surface (warmup-dependent)
  if (wu > 0.1) {
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.2 + charge * 0.3) * wu})`;
    ctx.lineWidth = 1.2 * s2;
    ctx.beginPath();
    ctx.ellipse(0, pedCY - pedH, pedRX * 0.75, pedRY * 0.75, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.15 + charge * 0.25) * wu})`;
    ctx.beginPath();
    ctx.ellipse(0, pedCY - pedH, pedRX * 0.45, pedRY * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.08 + charge * 0.15) * wu})`;
    ctx.lineWidth = 0.6 * s2;
    ctx.setLineDash([3 * s2, 3 * s2]);
    ctx.beginPath();
    ctx.ellipse(0, pedCY - pedH, pedRX * 0.6, pedRY * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // Multiple decorative band rings on cylinder wall (front arc)
  const bandPositions = [0.25, 0.5, 0.75];
  for (const bfrac of bandPositions) {
    const bandY = pedCY - pedH * bfrac;
    const bandR = pedRX + (bfrac === 0.5 ? 1.5 : 0.8) * s2;
    const bandRy = pedRY + (bfrac === 0.5 ? 0.75 : 0.4) * s2;
    ctx.strokeStyle =
      bfrac === 0.5 ? "rgba(170, 130, 70, 0.6)" : "rgba(140, 110, 55, 0.4)";
    ctx.lineWidth = (bfrac === 0.5 ? 2 : 1.2) * s2;
    ctx.beginPath();
    ctx.ellipse(0, bandY, bandR, bandRy, 0, 0, Math.PI);
    ctx.stroke();
  }
  // Engraved solar glyphs on pedestal front
  if (wu > 0.05) {
    const glyphAlpha = Math.min(1, wu * 1.5);
    const glyphCount = 6;
    for (let gi = 0; gi < glyphCount; gi++) {
      const ga = (gi / glyphCount) * Math.PI + 0.15;
      const gx = Math.cos(ga) * pedRX * 0.8;
      const gy = Math.sin(ga) * pedRY * 0.8 + pedCY - pedH * 0.5;
      const lit = gi / glyphCount < charge;
      ctx.fillStyle = lit
        ? `rgba(${hotRgb}, ${(0.3 + charge * 0.3 + readyFlash) * glyphAlpha})`
        : `rgba(120, 90, 45, ${0.15 * glyphAlpha})`;
      ctx.font = `bold ${4.5 * s2}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(runeSet[gi % runeSet.length], gx, gy);
    }
  }

  // Pedestal mechanical coupling nodes (visible front arc)
  for (let i = 0; i < 7; i++) {
    const nodeA = (i / 7) * Math.PI + 0.08;
    const nR = pedRX + 1.5 * s2;
    const nRy = pedRY + 0.75 * s2;
    const nxp = Math.cos(nodeA) * nR;
    const nyp = Math.sin(nodeA) * nRy + pedCY - pedH * 0.5;
    ctx.fillStyle = "#8a6c38";
    ctx.beginPath();
    ctx.arc(nxp, nyp, 1.6 * s2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#342610";
    ctx.beginPath();
    ctx.arc(nxp, nyp, 0.7 * s2, 0, Math.PI * 2);
    ctx.fill();
    // Highlight dot
    ctx.fillStyle = "rgba(180, 150, 80, 0.3)";
    ctx.beginPath();
    ctx.arc(nxp - 0.4 * s2, nyp - 0.4 * s2, 0.4 * s2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hydraulic brace struts on pedestal sides with pistons
  for (let side = -1; side <= 1; side += 2) {
    const strutX = side * pedRX * 0.65;
    const strutTop = pedCY - pedH * 0.9;
    const strutBot = pedCY - pedH * 0.1;
    const strutMid = (strutTop + strutBot) * 0.5;
    // Outer cylinder
    ctx.strokeStyle = "rgba(100, 80, 40, 0.55)";
    ctx.lineWidth = 2 * s2;
    ctx.beginPath();
    ctx.moveTo(strutX, strutBot);
    ctx.lineTo(strutX * 0.9, strutTop);
    ctx.stroke();
    // Inner piston rod
    ctx.strokeStyle = "rgba(150, 120, 65, 0.4)";
    ctx.lineWidth = 0.8 * s2;
    ctx.beginPath();
    ctx.moveTo(strutX * 0.97, strutBot + (strutMid - strutBot) * 0.2);
    ctx.lineTo(strutX * 0.92, strutMid);
    ctx.stroke();
    // Pivot joint
    ctx.fillStyle = "#8a6c38";
    ctx.beginPath();
    ctx.arc(strutX, strutBot, 1.5 * s2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#342610";
    ctx.beginPath();
    ctx.arc(strutX, strutBot, 0.6 * s2, 0, Math.PI * 2);
    ctx.fill();
    // Energy glow at center
    ctx.fillStyle = `rgba(${glowRgb}, ${(0.08 + charge * 0.2) * wu})`;
    ctx.beginPath();
    ctx.arc(strutX * 0.95, strutMid, 1.5 * s2, 0, Math.PI * 2);
    ctx.fill();
  }

  // === SOLAR COLLECTOR PANELS - extend during wuPanelExtend ===
  if (wuPanelExtend > 0) {
    const panelExtend = wuPanelExtend * charge * 10 * s2;
    const panelCount = 4;
    for (let pi = 0; pi < panelCount; pi++) {
      const pa = (pi / panelCount) * Math.PI * 2 + time * 0.05 * wuPanelExtend;
      const panelDist = pedRX + 2 * s2 + panelExtend;
      const px = Math.cos(pa) * panelDist;
      const py = pedCY - pedH * 0.5 + Math.sin(pa) * panelDist * ISO_Y_RATIO;
      const pw = 8 * s2 * wuPanelExtend;
      const ph = 4 * s2 * wuPanelExtend;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(pa * 0.3);
      ctx.scale(1, 0.5);
      ctx.globalAlpha = wuPanelExtend;
      const panelGrad = ctx.createLinearGradient(-pw / 2, 0, pw / 2, 0);
      panelGrad.addColorStop(
        0,
        `rgba(${Math.round(lerpR * 0.5)}, ${Math.round(lerpG * 0.4)}, ${Math.round(lerpB * 0.3)}, ${0.5 + charge * 0.3})`,
      );
      panelGrad.addColorStop(
        0.5,
        `rgba(${lerpR}, ${lerpG}, ${lerpB}, ${0.4 + charge * 0.3})`,
      );
      panelGrad.addColorStop(
        1,
        `rgba(${Math.round(lerpR * 0.5)}, ${Math.round(lerpG * 0.4)}, ${Math.round(lerpB * 0.3)}, ${0.5 + charge * 0.3})`,
      );
      ctx.fillStyle = panelGrad;
      ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
      ctx.strokeStyle = `rgba(${glowRgb}, ${0.2 + charge * 0.4})`;
      ctx.lineWidth = 0.8 * s2;
      ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
      ctx.beginPath();
      ctx.moveTo(0, -ph / 2);
      ctx.lineTo(0, ph / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
      ctx.strokeStyle = `rgba(120, 90, 45, ${0.5 * wuPanelExtend})`;
      ctx.lineWidth = 1 * s2;
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(pa) * pedRX,
        pedCY - pedH * 0.5 + Math.sin(pa) * pedRX * ISO_Y_RATIO,
      );
      ctx.lineTo(px, py);
      ctx.stroke();
    }
  }

  // === CENTRAL BRONZE COLUMN - telescopes up during wuColumnRise ===
  const colBY = pedCY - pedH;
  // Back half of column
  ctx.fillStyle = "#2a1c0c";
  ctx.beginPath();
  ctx.ellipse(0, colBY, colRX, colRY, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(colRX, colBY - colH);
  ctx.ellipse(0, colBY - colH, colRX, colRY, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  // Front half with richer gradient and specular highlight
  const colGrad = ctx.createLinearGradient(-colRX, 0, colRX, 0);
  colGrad.addColorStop(0, "#38240e");
  colGrad.addColorStop(0.2, "#5e4420");
  colGrad.addColorStop(0.4, "#7a5c30");
  colGrad.addColorStop(0.55, "#8a6c3a");
  colGrad.addColorStop(0.7, "#7a5c30");
  colGrad.addColorStop(0.85, "#5e4420");
  colGrad.addColorStop(1, "#483418");
  ctx.fillStyle = colGrad;
  ctx.beginPath();
  ctx.ellipse(0, colBY, colRX, colRY, 0, 0, Math.PI);
  ctx.lineTo(-colRX, colBY - colH);
  ctx.ellipse(0, colBY - colH, colRX, colRY, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();
  // Specular highlight stripe
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, colBY, colRX, colRY, 0, 0, Math.PI);
  ctx.lineTo(-colRX, colBY - colH);
  ctx.ellipse(0, colBY - colH, colRX, colRY, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.clip();
  const specGrad = ctx.createLinearGradient(colRX * 0.1, 0, colRX * 0.5, 0);
  specGrad.addColorStop(0, "rgba(255, 230, 180, 0)");
  specGrad.addColorStop(0.4, "rgba(255, 230, 180, 0.12)");
  specGrad.addColorStop(0.6, "rgba(255, 230, 180, 0.08)");
  specGrad.addColorStop(1, "rgba(255, 230, 180, 0)");
  ctx.fillStyle = specGrad;
  ctx.fillRect(-colRX, colBY - colH - colRY, colRX * 2, colH + colRY * 2);
  ctx.restore();
  // Edge lines with subtle shadow
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-colRX, colBY);
  ctx.lineTo(-colRX, colBY - colH);
  ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.moveTo(colRX, colBY);
  ctx.lineTo(colRX, colBY - colH);
  ctx.stroke();
  // Decorative fluting lines along column
  ctx.strokeStyle = "rgba(60, 45, 20, 0.25)";
  ctx.lineWidth = 0.5 * s2;
  for (let fl = 0; fl < 4; fl++) {
    const flAngle = (fl / 5 + 0.1) * Math.PI;
    const flx = Math.cos(flAngle) * colRX;
    ctx.beginPath();
    ctx.moveTo(flx, colBY + Math.sin(flAngle) * colRY);
    ctx.lineTo(flx, colBY - colH + Math.sin(flAngle) * colRY);
    ctx.stroke();
  }
  // Static ring bands at column joints
  for (let ri = 0; ri < 3; ri++) {
    const ringFrac = [0.15, 0.5, 0.85][ri];
    const ringY = colBY - colH * ringFrac;
    ctx.strokeStyle = "rgba(140, 110, 55, 0.45)";
    ctx.lineWidth = 1.5 * s2;
    ctx.beginPath();
    ctx.ellipse(0, ringY, colRX + 1 * s2, colRY + 0.5 * s2, 0, 0, Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "rgba(90, 70, 35, 0.3)";
    ctx.lineWidth = 0.6 * s2;
    ctx.beginPath();
    ctx.ellipse(
      0,
      ringY + 1.2 * s2,
      colRX + 0.5 * s2,
      colRY + 0.25 * s2,
      0,
      0,
      Math.PI,
    );
    ctx.stroke();
  }

  // Animated pulsing ring bands along column
  if (wuColumnRise > 0.2) {
    const bandAlphaBase = Math.min(1, (wuColumnRise - 0.2) / 0.3);
    for (let i = 0; i < 4; i++) {
      const baseBandPos = (i + 1) / 5;
      const pulsedPos =
        baseBandPos +
        Math.sin(time * (1.5 + charge * 2) + i * 1.2) * 0.03 * charge;
      const bandY = colBY - colH * Math.max(0.05, Math.min(0.95, pulsedPos));
      const bandAlpha =
        (0.3 + charge * 0.4 + Math.sin(time * 2 + i * 0.8) * 0.15) *
        bandAlphaBase;
      ctx.strokeStyle = `rgba(${lerpR}, ${lerpG}, ${lerpB}, ${bandAlpha})`;
      ctx.lineWidth = (1.8 + charge * 0.5) * s2;
      ctx.beginPath();
      ctx.ellipse(0, bandY, colRX + 1.5 * s2, colRY + 0.75 * s2, 0, 0, Math.PI);
      ctx.stroke();
    }
  }

  // Column energy veins
  if (charge > 0.1 && wuColumnRise > 0.4) {
    const veinAlpha = Math.min(1, (wuColumnRise - 0.4) / 0.3);
    const veinCount = 3;
    for (let v = 0; v < veinCount; v++) {
      const vAngle = (v / veinCount) * Math.PI;
      const vx = Math.cos(vAngle) * colRX * 0.5;
      ctx.strokeStyle = `rgba(${hotRgb}, ${charge * 0.35 * veinAlpha + readyFlash * 0.2})`;
      ctx.lineWidth = 0.8 * s2;
      ctx.beginPath();
      ctx.moveTo(vx, colBY);
      for (let seg = 1; seg <= 8; seg++) {
        const sy = colBY - colH * (seg / 8);
        const sx = vx + Math.sin(time * 3 + v * 2 + seg * 0.5) * 1.5 * s2;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
  }

  // Column junction bolts
  for (let i = 0; i < 4; i++) {
    const boltA = (i / 4) * Math.PI + 0.2;
    const boltR = colRX + 0.5 * s2;
    const boltY = colBY - colH * (0.2 + i * 0.2);
    const bx = Math.cos(boltA) * boltR;
    const by = boltY + Math.sin(boltA) * boltR * ISO_Y_RATIO;
    ctx.fillStyle = "#9a7a44";
    ctx.beginPath();
    ctx.arc(bx, by, 1.2 * s2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Column top cap
  ctx.fillStyle = "#8a6a3a";
  ctx.beginPath();
  ctx.ellipse(
    0,
    colBY - colH,
    colRX + 2 * s2,
    (colRX + 2 * s2) * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Mechanical ring on top cap
  ctx.strokeStyle = "rgba(160, 130, 70, 0.5)";
  ctx.lineWidth = 1.5 * s2;
  ctx.beginPath();
  ctx.ellipse(
    0,
    colBY - colH,
    colRX * 0.7,
    colRX * 0.7 * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // === ARMILLARY SPHERE - rings expand from collapsed during wuRingExpand ===
  const armCY = colBY - colH - 4 * s2;
  const ringSpd = (0.4 + charge * 1.4) * wuRingExpand;
  const ringScale = wuRingExpand;

  const drawArmRing = (
    tilt: number,
    speed: number,
    width: number,
    radius: number,
    front: boolean,
  ): void => {
    if (ringScale < 0.05) return;
    const effectiveR = radius * ringScale;
    ctx.save();
    ctx.translate(0, armCY);
    ctx.scale(ringScale, ISO_Y_RATIO * ringScale);
    ctx.rotate(time * speed + tilt);
    const aStart = front ? 0 : Math.PI;
    const aEnd = front ? Math.PI : Math.PI * 2;
    ctx.strokeStyle = `rgba(${glowRgb}, ${(0.35 + charge * 0.45 + readyFlash) * ringScale})`;
    ctx.lineWidth = width * s2;
    ctx.beginPath();
    ctx.arc(0, 0, effectiveR / ringScale, aStart, aEnd);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${Math.min(255, lerpR + 40)}, ${Math.min(255, lerpG + 40)}, ${Math.min(255, lerpB + 30)}, ${(0.2 + charge * 0.3) * ringScale})`;
    ctx.lineWidth = 0.8 * s2;
    ctx.beginPath();
    ctx.arc(0, 0, effectiveR / ringScale - width * 0.4 * s2, aStart, aEnd);
    ctx.stroke();
    for (let j = 0; j < 2; j++) {
      const na = aStart + ((j + 0.5) / 2) * (aEnd - aStart);
      ctx.fillStyle = `rgba(${Math.min(255, lerpR + 60)}, ${Math.min(255, lerpG + 50)}, ${Math.min(255, lerpB + 40)}, ${(0.4 + charge * 0.4) * ringScale})`;
      ctx.beginPath();
      ctx.arc(
        (Math.cos(na) * effectiveR) / ringScale,
        (Math.sin(na) * effectiveR) / ringScale,
        2.5 * s2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  };

  // Back halves of armillary rings
  drawArmRing(0, ringSpd, 3, armR, false);
  drawArmRing(Math.PI / 3, -ringSpd * 0.7, 2.5, armR, false);
  drawArmRing((Math.PI * 2) / 3, ringSpd * 1.3, 2, armR, false);
  drawArmRing(Math.PI / 5, ringSpd * 0.5, 1.8, armR * 0.8, false);
  drawArmRing((Math.PI * 4) / 5, -ringSpd * 0.9, 1.5, armR * 0.65, false);

  // Orbiting planetary orbs (back half)
  if (wuRingExpand > 0.3) {
    const orbAlpha = Math.min(1, (wuRingExpand - 0.3) / 0.4);
    const orbCount = 3;
    for (let oi = 0; oi < orbCount; oi++) {
      const orbSpeed = (0.3 + oi * 0.2 + charge * 0.5) * wuRingExpand;
      const orbAngle = time * orbSpeed + (oi * Math.PI * 2) / orbCount;
      const orbDist = (armR * 0.6 + oi * 3 * s2) * wuRingExpand;
      const ox = Math.cos(orbAngle) * orbDist;
      const oy = armCY + Math.sin(orbAngle) * orbDist * ISO_Y_RATIO;
      if (Math.sin(orbAngle) >= 0) continue;
      const orbR = (2 + oi * 0.5) * s2;
      ctx.globalAlpha = orbAlpha;
      ctx.strokeStyle = `rgba(${glowRgb}, ${0.1 + charge * 0.2})`;
      ctx.lineWidth = 0.6 * s2;
      ctx.beginPath();
      for (let tr = 0; tr < 8; tr++) {
        const trA = orbAngle - tr * 0.12;
        const trx = Math.cos(trA) * orbDist;
        const tryy = armCY + Math.sin(trA) * orbDist * ISO_Y_RATIO;
        if (tr === 0) ctx.moveTo(trx, tryy);
        else ctx.lineTo(trx, tryy);
      }
      ctx.stroke();
      const orbGrad = ctx.createRadialGradient(
        ox - orbR * 0.3,
        oy - orbR * 0.3,
        0,
        ox,
        oy,
        orbR,
      );
      const orbColors = ["200, 160, 80", "180, 100, 50", "150, 130, 90"][oi];
      orbGrad.addColorStop(0, `rgba(255, 230, 180, ${0.6 + charge * 0.3})`);
      orbGrad.addColorStop(0.5, `rgba(${orbColors}, ${0.5 + charge * 0.3})`);
      orbGrad.addColorStop(1, `rgba(${orbColors}, ${0.3 + charge * 0.2})`);
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // === SUN CORE - rises from column top during wuCoreLift ===
  const coreHiddenY = colBY - colH + 2 * s2;
  const coreRestY = armCY;
  const sunCoreY = coreHiddenY + (coreRestY - coreHiddenY) * wuCoreLift;
  const coronaR = 16 * s2;
  const innerR = 8 * s2;

  if (wuCoreLift > 0.05) {
    const coreAlpha = Math.min(1, wuCoreLift * 1.5);
    ctx.globalAlpha = coreAlpha;

    // Corona glow
    const coronaGrad = ctx.createRadialGradient(
      0,
      sunCoreY,
      0,
      0,
      sunCoreY,
      coronaR,
    );
    coronaGrad.addColorStop(
      0,
      `rgba(${Math.min(255, lerpR + 80)}, ${Math.min(255, lerpG + 80)}, ${Math.min(255, lerpB + 60)}, ${0.5 + charge * 0.4 + readyFlash * 0.15})`,
    );
    coronaGrad.addColorStop(0.35, `rgba(${glowRgb}, ${0.4 + charge * 0.5})`);
    coronaGrad.addColorStop(1, `rgba(${grayRgb}, 0.05)`);
    ctx.fillStyle = coronaGrad;
    ctx.beginPath();
    ctx.arc(0, sunCoreY, coronaR * wuCoreLift, 0, Math.PI * 2);
    ctx.fill();

    // Corona ray spikes
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + time * 0.3;
      const rayLen = (7 + Math.sin(time * 4 + i * 1.3) * 3.5) * s2 * wuCoreLift;
      const rw = (1 + charge * 0.8) * s2;
      const rx = Math.cos(a);
      const ry = Math.sin(a);
      const rGrad = ctx.createLinearGradient(
        rx * innerR,
        sunCoreY + ry * innerR,
        rx * (innerR + rayLen),
        sunCoreY + ry * (innerR + rayLen),
      );
      rGrad.addColorStop(
        0,
        `rgba(${glowRgb}, ${0.3 + charge * 0.5 + readyFlash})`,
      );
      rGrad.addColorStop(1, "transparent");
      ctx.strokeStyle = rGrad;
      ctx.lineWidth = rw;
      ctx.beginPath();
      ctx.moveTo(rx * innerR, sunCoreY + ry * innerR);
      ctx.lineTo(rx * (innerR + rayLen), sunCoreY + ry * (innerR + rayLen));
      ctx.stroke();
    }

    // Solar flare arcs
    if (charge > 0.2 && wuCoreLift > 0.5) {
      const flareAlpha = Math.min(1, (wuCoreLift - 0.5) / 0.3);
      const flareCount = 3 + Math.floor(charge * 3);
      for (let fi = 0; fi < flareCount; fi++) {
        const fAngle = time * (0.8 + fi * 0.3) + fi * 1.7;
        const fStartR = innerR + 2 * s2;
        const fEndR = armR * (0.6 + fi * 0.08) * wuCoreLift;
        const sx = Math.cos(fAngle) * fStartR;
        const sy = sunCoreY + Math.sin(fAngle) * fStartR;
        const ex = Math.cos(fAngle + 0.4) * fEndR;
        const ey = sunCoreY + Math.sin(fAngle + 0.4) * fEndR * 0.5;
        const cpx = (sx + ex) / 2 + Math.sin(time * 5 + fi) * 6 * s2;
        const cpy = (sy + ey) / 2 - 5 * s2;
        const flareGrad = ctx.createLinearGradient(sx, sy, ex, ey);
        flareGrad.addColorStop(
          0,
          `rgba(${hotRgb}, ${charge * 0.5 * flareAlpha + readyFlash * 0.2})`,
        );
        flareGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = flareGrad;
        ctx.lineWidth = (0.8 + charge * 0.8) * s2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cpx, cpy, ex, ey);
        ctx.stroke();
      }
    }

    // Faceted sun crystal
    const sLG = ctx.createLinearGradient(-7 * s2, sunCoreY, 0, sunCoreY);
    sLG.addColorStop(
      0,
      `rgba(${Math.round(lerpR * 0.55)}, ${Math.round(lerpG * 0.45)}, ${Math.round(lerpB * 0.3)}, ${0.7 + charge * 0.25})`,
    );
    sLG.addColorStop(
      1,
      `rgba(${lerpR}, ${lerpG}, ${lerpB}, ${0.8 + charge * 0.15})`,
    );
    ctx.fillStyle = sLG;
    ctx.beginPath();
    ctx.moveTo(0, sunCoreY - 10 * s2);
    ctx.lineTo(-7 * s2, sunCoreY - 1 * s2);
    ctx.lineTo(-4 * s2, sunCoreY + 8 * s2);
    ctx.lineTo(0, sunCoreY + 2 * s2);
    ctx.closePath();
    ctx.fill();
    const sRG = ctx.createLinearGradient(0, sunCoreY, 7 * s2, sunCoreY);
    sRG.addColorStop(
      0,
      `rgba(${lerpR}, ${lerpG}, ${lerpB}, ${0.8 + charge * 0.15})`,
    );
    sRG.addColorStop(
      1,
      `rgba(${Math.round(lerpR * 0.7)}, ${Math.round(lerpG * 0.6)}, ${Math.round(lerpB * 0.4)}, ${0.7 + charge * 0.25})`,
    );
    ctx.fillStyle = sRG;
    ctx.beginPath();
    ctx.moveTo(0, sunCoreY - 10 * s2);
    ctx.lineTo(7 * s2, sunCoreY - 1 * s2);
    ctx.lineTo(4 * s2, sunCoreY + 8 * s2);
    ctx.lineTo(0, sunCoreY + 2 * s2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(${Math.min(255, lerpR + 30)}, ${Math.min(255, lerpG + 20)}, ${Math.min(255, lerpB + 10)}, ${0.5 + charge * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(-4 * s2, sunCoreY + 8 * s2);
    ctx.lineTo(4 * s2, sunCoreY + 8 * s2);
    ctx.lineTo(0, sunCoreY + 2 * s2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(${Math.min(255, lerpR + 60)}, ${Math.min(255, lerpG + 50)}, ${Math.min(255, lerpB + 40)}, ${0.6 + charge * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(0, sunCoreY - 10 * s2);
    ctx.lineTo(-3 * s2, sunCoreY - 6 * s2);
    ctx.lineTo(0, sunCoreY - 4 * s2);
    ctx.lineTo(3 * s2, sunCoreY - 6 * s2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(${Math.min(255, lerpR + 80)}, ${Math.min(255, lerpG + 70)}, ${Math.min(255, lerpB + 50)}, ${0.3 + charge * 0.4})`;
    ctx.lineWidth = 0.8 * s2;
    ctx.beginPath();
    ctx.moveTo(0, sunCoreY - 10 * s2);
    ctx.lineTo(-7 * s2, sunCoreY - 1 * s2);
    ctx.lineTo(-4 * s2, sunCoreY + 8 * s2);
    ctx.lineTo(4 * s2, sunCoreY + 8 * s2);
    ctx.lineTo(7 * s2, sunCoreY - 1 * s2);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, sunCoreY - 10 * s2);
    ctx.lineTo(0, sunCoreY + 2 * s2);
    ctx.stroke();

    if (charge > 0.1) {
      ctx.strokeStyle = `rgba(${Math.min(255, lerpR + 100)}, ${Math.min(255, lerpG + 90)}, ${Math.min(255, lerpB + 70)}, ${charge * 0.3})`;
      ctx.lineWidth = 0.4 * s2;
      ctx.beginPath();
      ctx.moveTo(-4 * s2, sunCoreY + 1 * s2);
      ctx.lineTo(3 * s2, sunCoreY - 5 * s2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4 * s2, sunCoreY);
      ctx.lineTo(-2 * s2, sunCoreY + 5 * s2);
      ctx.stroke();
    }

    // Inner glow
    const innerGlow = ctx.createRadialGradient(
      0,
      sunCoreY,
      0,
      0,
      sunCoreY,
      innerR,
    );
    const sunEyeR = Math.round(180 + 75 * charge);
    const sunEyeG = Math.round(180 + 75 * charge);
    const sunEyeB = Math.round(185 + 55 * charge);
    innerGlow.addColorStop(
      0,
      `rgba(${sunEyeR}, ${sunEyeG}, ${sunEyeB}, ${0.6 + charge * 0.3 + readyFlash * 0.1})`,
    );
    innerGlow.addColorStop(0.5, `rgba(${glowRgb}, ${0.2 + charge * 0.3})`);
    innerGlow.addColorStop(1, `rgba(${grayRgb}, 0)`);
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(0, sunCoreY, innerR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${sunEyeR}, ${sunEyeG}, ${sunEyeB}, ${0.35 + charge * 0.5 + readyFlash})`;
    ctx.beginPath();
    ctx.arc(0, sunCoreY + 0.5 * s2, (2.2 + charge * 1.5) * s2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  // Front halves of armillary rings
  drawArmRing(0, ringSpd, 3, armR, true);
  drawArmRing(Math.PI / 3, -ringSpd * 0.7, 2.5, armR, true);
  drawArmRing((Math.PI * 2) / 3, ringSpd * 1.3, 2, armR, true);
  drawArmRing(Math.PI / 5, ringSpd * 0.5, 1.8, armR * 0.8, true);
  drawArmRing((Math.PI * 4) / 5, -ringSpd * 0.9, 1.5, armR * 0.65, true);

  // Front halves of orbiting planetary orbs
  if (wuRingExpand > 0.3) {
    const orbAlpha = Math.min(1, (wuRingExpand - 0.3) / 0.4);
    const orbCount = 3;
    for (let oi = 0; oi < orbCount; oi++) {
      const orbSpeed = (0.3 + oi * 0.2 + charge * 0.5) * wuRingExpand;
      const orbAngle = time * orbSpeed + (oi * Math.PI * 2) / orbCount;
      const orbDist = (armR * 0.6 + oi * 3 * s2) * wuRingExpand;
      const ox = Math.cos(orbAngle) * orbDist;
      const oy = armCY + Math.sin(orbAngle) * orbDist * ISO_Y_RATIO;
      if (Math.sin(orbAngle) < 0) continue;
      const orbR = (2 + oi * 0.5) * s2;
      ctx.globalAlpha = orbAlpha;
      ctx.strokeStyle = `rgba(${glowRgb}, ${0.1 + charge * 0.2})`;
      ctx.lineWidth = 0.6 * s2;
      ctx.beginPath();
      for (let tr = 0; tr < 8; tr++) {
        const trA = orbAngle - tr * 0.12;
        const trx = Math.cos(trA) * orbDist;
        const tryy = armCY + Math.sin(trA) * orbDist * ISO_Y_RATIO;
        if (tr === 0) ctx.moveTo(trx, tryy);
        else ctx.lineTo(trx, tryy);
      }
      ctx.stroke();
      const orbGrad = ctx.createRadialGradient(
        ox - orbR * 0.3,
        oy - orbR * 0.3,
        0,
        ox,
        oy,
        orbR,
      );
      const orbColors = ["200, 160, 80", "180, 100, 50", "150, 130, 90"][oi];
      orbGrad.addColorStop(0, `rgba(255, 230, 180, ${0.6 + charge * 0.3})`);
      orbGrad.addColorStop(0.5, `rgba(${orbColors}, ${0.5 + charge * 0.3})`);
      orbGrad.addColorStop(1, `rgba(${orbColors}, ${0.3 + charge * 0.2})`);
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Front rail/runes
  drawSunforgeRail(true);
  drawSunforgeRunes(true);

  // Floating solar shards - deploy after rings expand
  if (wuRingExpand > 0.5) {
    const shardAlpha = Math.min(1, (wuRingExpand - 0.5) / 0.3);
    const shardCount = 6 + stage * 2;
    for (let i = 0; i < shardCount; i++) {
      const a =
        (i / shardCount) * Math.PI * 2 +
        time * (0.5 + stage * 0.2 + charge * 0.5);
      const x = Math.cos(a) * (30 + stage * 4) * s2;
      const y = armCY + 14 * s2 + Math.sin(a * 1.32) * (12 + stage * 1.6) * s2;
      const h = (4 + (i % 3)) * s2;
      ctx.fillStyle = `rgba(${glowRgb}, ${(0.3 + charge * 0.45 + readyFlash) * shardAlpha})`;
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x - 2.3 * s2, y);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + 2.3 * s2, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Solar charge arcs - only after core is lifted
  if (wuCoreLift > 0.5) {
    const arcAlpha = Math.min(1, (wuCoreLift - 0.5) / 0.3);
    const arcCount = 2 + Math.floor(charge * 3);
    for (let i = 0; i < arcCount; i++) {
      const a = (i / arcCount) * Math.PI * 2 + time * (0.6 + charge * 0.8);
      const sx = Math.cos(a) * 10 * s2;
      const sy = sunCoreY + Math.sin(a * 1.2) * 5 * s2;
      const ex = Math.cos(a + 0.35) * (36 + stage * 4) * s2;
      const ey = sunCoreY + 34 * s2 + Math.sin(a + 0.35) * 14 * s2;
      const grad = ctx.createLinearGradient(sx, sy, ex, ey);
      grad.addColorStop(
        0,
        `rgba(${glowRgb}, ${(0.15 + charge * 0.55 + readyFlash) * arcAlpha})`,
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
  }

  // Heat shimmer effect
  if (charge > 0.3 && wuCoreLift > 0.7) {
    const shimAlpha = Math.min(1, (wuCoreLift - 0.7) / 0.2);
    const shimmerCount = 4 + Math.floor(charge * 4);
    for (let shi = 0; shi < shimmerCount; shi++) {
      const shX = (Math.sin(time * 3 + shi * 1.5) * 8 - 4) * s2;
      const shY = sunCoreY - (shi * 4 + Math.sin(time * 2 + shi) * 3) * s2;
      const shAlpha = (1 - shi / shimmerCount) * charge * 0.15 * shimAlpha;
      ctx.strokeStyle = `rgba(255, 200, 150, ${shAlpha})`;
      ctx.lineWidth = (2 + Math.sin(time * 4 + shi) * 1) * s2;
      ctx.beginPath();
      ctx.moveTo(shX - 3 * s2, shY);
      ctx.quadraticCurveTo(shX, shY - 2 * s2, shX + 3 * s2, shY);
      ctx.stroke();
    }
  }

  // Charge indicator orbs
  if (wuGearSpin > 0.3) {
    const indAlpha = Math.min(1, (wuGearSpin - 0.3) / 0.3);
    const indicatorCount = 8;
    const litIndicators = Math.floor(charge * indicatorCount);
    for (let ind = 0; ind < indicatorCount; ind++) {
      const indA = (ind / indicatorCount) * Math.PI * 2 - Math.PI / 2;
      const indDist = pedRX + 6 * s2;
      const indX = Math.cos(indA) * indDist;
      const indYPos =
        pedCY - pedH * 0.5 + Math.sin(indA) * indDist * ISO_Y_RATIO;
      const isLit = ind < litIndicators;
      const isActivating = ind === litIndicators && charge < 1;
      const partial = isActivating
        ? charge * indicatorCount - litIndicators
        : 0;
      const indR = 1.5 * s2;
      if (isLit) {
        const indGlow = ctx.createRadialGradient(
          indX,
          indYPos,
          0,
          indX,
          indYPos,
          indR * 3,
        );
        indGlow.addColorStop(
          0,
          `rgba(${hotRgb}, ${(0.25 + readyFlash * 0.15) * indAlpha})`,
        );
        indGlow.addColorStop(1, "transparent");
        ctx.fillStyle = indGlow;
        ctx.beginPath();
        ctx.arc(indX, indYPos, indR * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = isLit
        ? `rgba(${hotRgb}, ${(0.6 + Math.sin(time * 3 + ind) * 0.15 + readyFlash) * indAlpha})`
        : `rgba(${grayRgb}, ${(0.2 + partial * 0.4) * indAlpha})`;
      ctx.beginPath();
      ctx.arc(indX, indYPos, indR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ready burst halo
  if (charge >= 0.98 && wu >= 1) {
    const burstG = ctx.createRadialGradient(
      0,
      sunCoreY,
      0,
      0,
      sunCoreY,
      30 * s2,
    );
    burstG.addColorStop(0, `rgba(255, 240, 210, ${0.12 + readyFlash * 0.2})`);
    burstG.addColorStop(0.5, `rgba(${hotRgb}, ${0.06 + readyFlash * 0.12})`);
    burstG.addColorStop(1, "transparent");
    ctx.fillStyle = burstG;
    ctx.beginPath();
    ctx.arc(0, sunCoreY, 30 * s2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Per-type sprite scale overrides (multiplied with base zoom)
const SPECIAL_SPRITE_SCALE: Partial<Record<string, number>> = {
  vault: 1.2,
  beacon: 0.9,
  shrine: 1.5,
  barracks: 1.3,
  chrono_relay: 1.3,
  sentinel_nexus: 1.3,
  sunforge_orrery: 1.3,
};

// Per-type Y position multiplier (fraction of canvas size for the anchor point)
const SPECIAL_SPRITE_Y_MULT: Partial<Record<string, number>> = {
  vault: 0.82,
  beacon: 0.82,
  shrine: 0.62,
  barracks: 0.82,
  chrono_relay: 0.72,
  sentinel_nexus: 0.72,
  sunforge_orrery: 0.72,
};

export function drawSpecialBuildingSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  type: string,
  time: number,
): void {
  const typeScale = SPECIAL_SPRITE_SCALE[type] ?? 1.0;
  const yMult = SPECIAL_SPRITE_Y_MULT[type] ?? 0.62;
  const zoom = (size / 72) * typeScale;
  const adjustedY = cy * (yMult / 0.62);
  renderSpecialBuilding(ctx, cx, adjustedY, zoom, type, 100, 100, 0, 3, 0.5, 1);
}

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
  warmupProgress: number = 1,
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
      drawSentinelNexusBuilding(
        ctx,
        s,
        time,
        chargeProgress,
        warmupProgress,
        getSentinelPalette(mapTheme),
      );
      break;
    }

    case "sunforge_orrery": {
      drawSunforgeOrreryBuilding(
        ctx,
        s,
        time,
        boostedTowerCount,
        chargeProgress,
        warmupProgress,
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
      const geo = drawActiveVaultBuilding(
        ctx,
        s2,
        w,
        h,
        tanAngle,
        roofOffset,
        time,
        isFlashing,
      );
      const { bodyY, roofPeakY, parH, rcy, lWallPt, rWallPt } = geo;

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
      drawEldritchShrineBuilding(ctx, s, time);
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
          const edy = rB.y - eaveH - (rL.y - eaveH);
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
          const edy = rR.y - eaveH - (rB.y - eaveH);
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
        ctx.fillRect(
          rB.x - 3.5 * s,
          rB.y - eaveH - parH - 6 * s - 1.5 * s,
          7 * s,
          1.5 * s,
        );
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(
          rB.x - 0.8 * s,
          rB.y - eaveH - parH - 4.5 * s,
          1.6 * s,
          3 * s,
        );
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
        ctx.lineTo(
          bStartX + bW * 0.5,
          bStartY + bH + Math.sin(bannerTime + 3) * 2 * s,
        );
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
        ctx.lineTo(
          bStartX + bW * 0.5,
          bStartY + bH + Math.sin(bannerTime + 3) * 2 * s,
        );
        ctx.lineTo(bStartX, bStartY + bH * 0.7);
        ctx.closePath();
        ctx.fill();

        // Banner overlay — richer crimson with wave-driven shading
        ctx.save();
        ctx.clip();
        const banGrad = ctx.createLinearGradient(
          bStartX,
          bStartY,
          bStartX,
          bStartY + bH,
        );
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
          ctx.fillStyle =
            wave > 0 ? `rgba(255,200,150,${alpha})` : `rgba(0,0,0,${alpha})`;
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
        ctx.lineTo(
          bStartX + bW * 0.5,
          bStartY + bH + Math.sin(bannerTime + 3) * 2 * s,
        );
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
        ctx.quadraticCurveTo(
          cX,
          cY + cR * 1.2 * si,
          cX + cR * si,
          cY + cR * 0.3 * si,
        );
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
          const flx = bStartX + bW * 0.5 * ft;
          const fly =
            bStartY +
            bH * 0.7 * (1 - ft) +
            (bH + Math.sin(bannerTime + 3) * 2 * s) * ft;
          ctx.beginPath();
          ctx.arc(flx, fly + 1 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
          // Right tail edge
          const frx = bStartX + bW * 0.5 + bW * 0.5 * (1 - ft);
          const frt = 1 - ft;
          const fry =
            (bStartY + bH + Math.sin(bannerTime + 3) * 2 * s) * (1 - frt) +
            (bStartY + bH * 0.7 + tailWaveR3) * frt;
          ctx.beginPath();
          ctx.arc(frx, fry + 1 * s, 0.8 * s, 0, Math.PI * 2);
          ctx.fill();
        }

        // Iron ring mounts (banner hangs from crossbar)
        ctx.fillStyle = "#546E7A";
        for (let ri = 0; ri < 4; ri++) {
          const rx = bStartX + (bW / 3) * ri;
          const ry =
            bStartY - 1 * s + Math.sin(bannerTime + (ri / 3) * 6) * 1 * s;
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
