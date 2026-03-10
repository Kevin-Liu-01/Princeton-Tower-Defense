import type { Tower, Position } from "../../types";
import { ISO_SIN, ISO_Y_RATIO } from "../../constants";
import { drawIsometricPrism } from "./towerHelpers";
import { drawIsoGothicWindow, drawIsoFlushSlit, drawIsoFlushRect } from "../isoFlush";

export function renderDinkyTrains(
  ctx: CanvasRenderingContext2D,
  tower: Tower,
  screenPos: Position,
  zoom: number,
  time: number,
  baseW: number,
) {
  // ========== DETAILED ISOMETRIC TRAINS ==========
  // CORRECT LAYERING: Draw cab FIRST (bottom-right), then boiler, then tender LAST (top-left)
  // This makes tender appear "in front" visually
  const trainAnimProgress = tower.trainAnimProgress || 0;
  const trainVisible = trainAnimProgress > 0 && trainAnimProgress < 1;

  if (trainVisible) {
    let trainT = 0;
    let trainAlpha = 1;

    if (trainAnimProgress < 0.25) {
      trainT = 0.45 - (trainAnimProgress / 0.25) * 0.45;
      trainAlpha = Math.min(1, trainAnimProgress / 0.15);
    } else if (trainAnimProgress < 0.75) {
      trainT = 0;
      trainAlpha = 1;
    } else {
      trainT = -((trainAnimProgress - 0.75) / 0.25) * 0.45;
      trainAlpha = Math.max(0, 1 - (trainAnimProgress - 0.75) / 0.2);
    }

    const trackLen = baseW * 0.9 * zoom;
    const trainX = screenPos.x + trackLen * trainT;
    const trainY = screenPos.y - trackLen * trainT * 0.5 - 6 * zoom;

    ctx.save();
    ctx.globalAlpha = trainAlpha;

    // Isometric offset - positive = toward bottom-right (front), negative = toward top-left (back)
    const isoOffset = (baseX: number, baseY: number, offset: number) => ({
      x: baseX + offset * zoom,
      y: baseY - offset * zoom * 0.5,
    });

    // Draw a 3D isometric horizontal cylinder along the track direction
    const drawIsoBoiler = (
      cx: number,
      cy: number,
      halfLen: number,
      radius: number,
      bodyCol: string,
      darkCol: string,
      lightCol: string,
    ) => {
      const bk = isoOffset(cx, cy, -halfLen);
      const ft = isoOffset(cx, cy, halfLen);
      const r = radius * zoom;
      const er = r * ISO_SIN;

      // === BACK CAP with outer lip for depth ===
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.ellipse(bk.x, bk.y, er + 1 * zoom, r + 1 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.ellipse(bk.x, bk.y, er, r, 0, 0, Math.PI * 2);
      ctx.fill();

      // === BODY — 16-facet cylinder with per-facet angle-based lighting ===
      const facets = 16;
      const bkPts: { x: number; y: number }[] = [];
      const ftPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= facets; i++) {
        const a = Math.PI + (i / facets) * Math.PI;
        const fy = Math.sin(a) * r;
        const fx = Math.cos(a) * er;
        bkPts.push({ x: bk.x + fx, y: bk.y + fy });
        ftPts.push({ x: ft.x + fx, y: ft.y + fy });
      }

      for (let i = 0; i < facets; i++) {
        const midAngle = Math.PI + ((i + 0.5) / facets) * Math.PI;
        const normalUp = -Math.sin(midAngle);

        ctx.fillStyle = bodyCol;
        ctx.beginPath();
        ctx.moveTo(bkPts[i].x, bkPts[i].y);
        ctx.lineTo(bkPts[i + 1].x, bkPts[i + 1].y);
        ctx.lineTo(ftPts[i + 1].x, ftPts[i + 1].y);
        ctx.lineTo(ftPts[i].x, ftPts[i].y);
        ctx.closePath();
        ctx.fill();

        if (normalUp > 0) {
          ctx.fillStyle = `rgba(255,255,255,${normalUp * 0.28})`;
        } else {
          ctx.fillStyle = `rgba(0,0,0,${-normalUp * 0.32})`;
        }
        ctx.fill();

        if (i > 0 && i < facets) {
          ctx.strokeStyle = `rgba(0,0,0,${0.04 + Math.abs(normalUp) * 0.04})`;
          ctx.lineWidth = 0.4 * zoom;
          ctx.beginPath();
          ctx.moveTo(bkPts[i].x, bkPts[i].y);
          ctx.lineTo(ftPts[i].x, ftPts[i].y);
          ctx.stroke();
        }
      }

      // === SPECULAR HIGHLIGHT — bright streak across the top ===
      const midX = (bk.x + ft.x) * 0.5;
      const midY = (bk.y + ft.y) * 0.5;
      const specGrad = ctx.createLinearGradient(
        midX,
        midY - r,
        midX,
        midY - r * 0.2,
      );
      specGrad.addColorStop(0, "rgba(255,255,255,0)");
      specGrad.addColorStop(0.3, "rgba(255,255,255,0.22)");
      specGrad.addColorStop(0.5, "rgba(255,255,255,0.3)");
      specGrad.addColorStop(0.7, "rgba(255,255,255,0.22)");
      specGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.moveTo(bk.x - er * 0.15, bk.y - r);
      ctx.lineTo(ft.x - er * 0.15, ft.y - r);
      ctx.lineTo(ft.x + er * 0.15, ft.y - r * 0.25);
      ctx.lineTo(bk.x + er * 0.15, bk.y - r * 0.25);
      ctx.closePath();
      ctx.fill();

      // === BOILER BANDS — 3D metallic rings wrapping the cylinder ===
      const numBands = 3;
      for (let b = 0; b < numBands; b++) {
        const t = (b + 1) / (numBands + 1);
        const bandCx = bk.x + (ft.x - bk.x) * t;
        const bandCy = bk.y + (ft.y - bk.y) * t;
        const bandW = 1.8 * zoom;

        ctx.strokeStyle = lightCol;
        ctx.lineWidth = bandW;
        ctx.beginPath();
        ctx.ellipse(bandCx, bandCy, er, r, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          bandCx,
          bandCy - bandW * 0.35,
          er * 0.98,
          r * 0.98,
          0,
          Math.PI * 1.15,
          Math.PI * 1.85,
        );
        ctx.stroke();

        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          bandCx,
          bandCy + bandW * 0.35,
          er * 0.98,
          r * 0.98,
          0,
          Math.PI * 1.15,
          Math.PI * 1.85,
        );
        ctx.stroke();
      }

      // === RIVETS along top and bottom seam lines ===
      const numRivets = 5;
      for (let rv = 0; rv < numRivets; rv++) {
        const t = (rv + 0.5) / numRivets;
        const rx = bk.x + (ft.x - bk.x) * t;
        const ryTop =
          bk.y - r * 0.92 + (ft.y - r * 0.92 - (bk.y - r * 0.92)) * t;
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.arc(rx, ryTop, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.beginPath();
        ctx.arc(
          rx - 0.2 * zoom,
          ryTop - 0.2 * zoom,
          0.3 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        const ryBot = bk.y + (ft.y - bk.y) * t;
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.arc(rx, ryBot, 0.6 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // === SILHOUETTE OUTLINES ===
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(bk.x - er, bk.y);
      ctx.lineTo(ft.x - er, ft.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bk.x + er, bk.y);
      ctx.lineTo(ft.x + er, ft.y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(bk.x, bk.y - r);
      ctx.lineTo(ft.x, ft.y - r);
      ctx.stroke();

      // === FRONT CAP — 3D recessed disc with radial gradient ===
      ctx.fillStyle = lightCol;
      ctx.beginPath();
      ctx.ellipse(
        ft.x,
        ft.y,
        er + 1.2 * zoom,
        r + 1.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      const capGrad = ctx.createRadialGradient(
        ft.x - er * 0.25,
        ft.y - r * 0.25,
        0,
        ft.x,
        ft.y,
        r,
      );
      capGrad.addColorStop(0, lightCol);
      capGrad.addColorStop(0.5, bodyCol);
      capGrad.addColorStop(1, darkCol);
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.ellipse(ft.x, ft.y, er, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(ft.x, ft.y, er * 0.6, r * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        ft.x,
        ft.y,
        er * 0.72,
        r * 0.72,
        0,
        -Math.PI * 0.85,
        -Math.PI * 0.15,
      );
      ctx.stroke();

      // Front cap rivets (8-point ring)
      for (let bi = 0; bi < 8; bi++) {
        const ba = (bi / 8) * Math.PI * 2;
        const bx = ft.x + Math.cos(ba) * er * 0.82;
        const by = ft.y + Math.sin(ba) * r * 0.82;
        ctx.fillStyle = "rgba(60,50,40,0.45)";
        ctx.beginPath();
        ctx.arc(bx, by, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.arc(bx - 0.15 * zoom, by - 0.15 * zoom, 0.3 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center bolt
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.arc(ft.x, ft.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.arc(
        ft.x - 0.3 * zoom,
        ft.y - 0.3 * zoom,
        0.45 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    };

    // Dark contrast track bed for Level 4 trains (makes them pop against gold buildings)
    if (tower.level >= 4) {
      const tbL = isoOffset(trainX, trainY + 5 * zoom, 15);
      const tbR = isoOffset(trainX, trainY + 5 * zoom, -15);
      const tbThick = 3 * zoom;
      const tbHalfW = 5 * zoom;
      // Track bed - dark isometric slab under the train
      ctx.fillStyle = tower.upgrade === "A" ? "#3a3530" : "#2a2825";
      ctx.beginPath();
      ctx.moveTo(tbL.x, tbL.y - tbHalfW * 0.5);
      ctx.lineTo(tbR.x, tbR.y - tbHalfW * 0.5);
      ctx.lineTo(tbR.x, tbR.y + tbHalfW * 0.5);
      ctx.lineTo(tbR.x + tbThick, tbR.y + tbHalfW * 0.5 + tbThick * 0.5);
      ctx.lineTo(tbL.x + tbThick, tbL.y + tbHalfW * 0.5 + tbThick * 0.5);
      ctx.lineTo(tbL.x, tbL.y + tbHalfW * 0.5);
      ctx.closePath();
      ctx.fill();
      // Track rails (bright metal contrast)
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1.5 * zoom;
      const r1L = isoOffset(trainX, trainY + 4 * zoom, 14);
      const r1R = isoOffset(trainX, trainY + 4 * zoom, -14);
      const r2L = isoOffset(trainX, trainY + 6 * zoom, 14);
      const r2R = isoOffset(trainX, trainY + 6 * zoom, -14);
      ctx.beginPath();
      ctx.moveTo(r1L.x, r1L.y);
      ctx.lineTo(r1R.x, r1R.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r2L.x, r2L.y);
      ctx.lineTo(r2R.x, r2R.y);
      ctx.stroke();
    }

    // Shadow (stronger for Level 4)
    ctx.fillStyle = tower.level >= 4 ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(
      trainX,
      trainY + 10 * zoom,
      18 * zoom,
      8 * zoom,
      -0.46,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Cross-track half-width — perpendicular to iso track direction.
    // Track dir is (1, -0.5); near-side (toward viewer) is (+1, +0.5).
    const CROSS_HALF = 2;

    // Draws a single wheel disc at (wx, wy)
    const drawSingleWheel = (
      wx: number, wy: number,
      iRx: number, iRy: number, rz: number,
      mainColor: string, rimColor: string, accentColor: string | undefined,
    ) => {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 3 * zoom;
      ctx.shadowOffsetY = 1 * zoom;

      const tireGrad = ctx.createLinearGradient(wx, wy - iRy, wx, wy + iRy);
      tireGrad.addColorStop(0, rimColor);
      tireGrad.addColorStop(0.4, mainColor);
      tireGrad.addColorStop(0.7, rimColor);
      tireGrad.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = tireGrad;
      ctx.beginPath();
      ctx.ellipse(wx, wy, iRx * 1.08, iRy * 1.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      const faceGrad = ctx.createRadialGradient(
        wx - iRx * 0.15, wy - iRy * 0.15, 0,
        wx, wy, rz * 0.85,
      );
      faceGrad.addColorStop(0, accentColor || mainColor);
      faceGrad.addColorStop(0.6, mainColor);
      faceGrad.addColorStop(1, rimColor);
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.ellipse(wx, wy, iRx * 0.88, iRy * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(wx, wy, iRx * 0.75, iRy * 0.75, 0, 0, Math.PI * 2);
      ctx.stroke();

      const spokeCount = 8;
      ctx.lineWidth = 1.4 * zoom;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * Math.PI * 2 + time * 3;
        ctx.strokeStyle = i % 2 === 0 ? mainColor : rimColor;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(angle) * iRx * 0.18, wy + Math.sin(angle) * iRy * 0.18);
        ctx.lineTo(wx + Math.cos(angle) * iRx * 0.72, wy + Math.sin(angle) * iRy * 0.72);
        ctx.stroke();
      }

      const hubGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, iRx * 0.22);
      hubGrad.addColorStop(0, "rgba(220,220,220,0.9)");
      hubGrad.addColorStop(0.5, accentColor || "#555");
      hubGrad.addColorStop(1, "#1a1a1a");
      ctx.fillStyle = hubGrad;
      ctx.beginPath();
      ctx.ellipse(wx, wy, iRx * 0.22, iRy * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(wx, wy, iRx * 0.95, iRy * 0.95, 0, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      ctx.restore();
    };

    // Draws a wheel PAIR (far + near side) with an axle between them.
    const drawWheel = (
      wx: number, wy: number, r: number,
      mainColor: string, rimColor: string, accentColor?: string,
    ) => {
      const rz = r * zoom;
      const iRx = rz * ISO_SIN;
      const iRy = rz;
      const ch = CROSS_HALF * zoom;

      // Far-side wheel (away from viewer — upper-left offset, dimmed)
      ctx.save();
      ctx.globalAlpha = (ctx.globalAlpha ?? 1) * 0.6;
      drawSingleWheel(wx - ch, wy - ch * 0.5, iRx, iRy, rz, mainColor, rimColor, accentColor);
      ctx.restore();

      // Axle connecting near ↔ far
      ctx.strokeStyle = "rgba(80,80,80,0.7)";
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(wx - ch, wy - ch * 0.5);
      ctx.lineTo(wx + ch, wy + ch * 0.5);
      ctx.stroke();

      // Near-side wheel (toward viewer — lower-right offset)
      drawSingleWheel(wx + ch, wy + ch * 0.5, iRx, iRy, rz, mainColor, rimColor, accentColor);
    };

    // Connecting rods between drive wheels on the near side.
    const drawConnectingRods = (
      positions: number[],
      baseX: number, baseY: number,
      rodColor: string,
    ) => {
      if (positions.length < 2) return;
      const ch = CROSS_HALF * zoom;
      const phase = time * 3;
      const crankR = 1.8 * zoom;

      // Near-side coupling rod
      ctx.strokeStyle = rodColor;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      for (let i = 0; i < positions.length; i++) {
        const wp = isoOffset(baseX, baseY, positions[i]);
        const px = wp.x + ch + Math.sin(phase) * crankR * ISO_SIN;
        const py = wp.y + ch * 0.5 + Math.cos(phase) * crankR;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Crank pins
      ctx.fillStyle = rodColor;
      for (const p of positions) {
        const wp = isoOffset(baseX, baseY, p);
        const px = wp.x + ch + Math.sin(phase) * crankR * ISO_SIN;
        const py = wp.y + ch * 0.5 + Math.cos(phase) * crankR;
        ctx.beginPath();
        ctx.arc(px, py, 1.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Far-side rod (dimmed)
      ctx.save();
      ctx.globalAlpha = (ctx.globalAlpha ?? 1) * 0.45;
      ctx.strokeStyle = rodColor;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      for (let i = 0; i < positions.length; i++) {
        const wp = isoOffset(baseX, baseY, positions[i]);
        const px = wp.x - ch + Math.sin(phase) * crankR * ISO_SIN;
        const py = wp.y - ch * 0.5 + Math.cos(phase) * crankR;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    };

    // Isometric headlight — elliptical housing with glow, bracket to anchor.
    const drawIsoHeadlight = (
      anchorX: number, anchorY: number,
      cx: number, cy: number,
      r: number,
      housingColor: string, bracketColor: string,
      glowAlpha: number,
    ) => {
      const hlRx = r * zoom * ISO_SIN;
      const hlRy = r * zoom;
      ctx.strokeStyle = bracketColor;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.fillStyle = housingColor;
      ctx.beginPath();
      ctx.ellipse(cx, cy, hlRx, hlRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 250, 200, ${glowAlpha})`;
      ctx.shadowColor = "#fffacc";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.ellipse(cx, cy, hlRx * 0.55, hlRy * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    // Isometric cowcatcher / plow — proper V-wedge flush with track direction.
    // cx,cy = base center. forwardOff = how far tip extends along track.
    // halfW = cross-track half-width at base (in world units).
    const drawIsoCowcatcher = (
      cx: number, cy: number,
      forwardOff: number, halfW: number, barH: number,
      mainCol: string, darkCol: string, barCol: string,
      barCount: number = 4,
    ) => {
      const tip = isoOffset(cx, cy, forwardOff);
      const hw = halfW * zoom;
      // Cross-track perpendicular to track (1,-0.5): near=(+1,+0.5), far=(-1,-0.5)
      const nearX = cx + hw;
      const nearY = cy + hw * 0.5;
      const farX = cx - hw;
      const farY = cy - hw * 0.5;
      const bH = barH * zoom;

      // Top face — isometric V
      ctx.fillStyle = mainCol;
      ctx.beginPath();
      ctx.moveTo(farX, farY);
      ctx.lineTo(tip.x, tip.y);
      ctx.lineTo(nearX, nearY);
      ctx.closePath();
      ctx.fill();

      // Near face (toward viewer — darker)
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.moveTo(nearX, nearY);
      ctx.lineTo(tip.x, tip.y);
      ctx.lineTo(tip.x, tip.y + bH);
      ctx.lineTo(nearX, nearY + bH);
      ctx.closePath();
      ctx.fill();

      // Far face (away from viewer — lighter)
      ctx.fillStyle = mainCol;
      ctx.beginPath();
      ctx.moveTo(farX, farY);
      ctx.lineTo(tip.x, tip.y);
      ctx.lineTo(tip.x, tip.y + bH);
      ctx.lineTo(farX, farY + bH);
      ctx.closePath();
      ctx.fill();

      // Edge outlines
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(nearX, nearY);
      ctx.lineTo(nearX, nearY + bH);
      ctx.lineTo(tip.x, tip.y + bH);
      ctx.lineTo(farX, farY + bH);
      ctx.lineTo(farX, farY);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();

      // Horizontal bars — cross-track at narrowing widths
      ctx.strokeStyle = barCol;
      ctx.lineWidth = 1.2 * zoom;
      for (let bi = 0; bi < barCount; bi++) {
        const t = (bi + 1) / (barCount + 1);
        const bCenter = isoOffset(cx, cy, forwardOff * t);
        const bHw = hw * (1 - t);
        ctx.beginPath();
        ctx.moveTo(bCenter.x - bHw, bCenter.y - bHw * 0.5 + bH * 0.5);
        ctx.lineTo(bCenter.x + bHw, bCenter.y + bHw * 0.5 + bH * 0.5);
        ctx.stroke();
      }
    };

    // Draws the complete front-of-train assembly (bumper beam, cowcatcher,
    // headlight) flush with the cab prism's right face (the isometric "front").
    // Forward projection uses isoOffset (track direction) so elements extend
    // in the correct isometric "forward" rather than along the 2D face normal.
    const drawTrainFront = (
      cabX: number, cabY: number,
      pw: number, pd: number, ph: number,
      mainCol: string, darkCol: string, accentCol: string,
      hlHousingCol: string, hlBracketCol: string,
      hlGlowAlpha: number,
      scale: number,
      cowBarCount: number,
    ) => {
      const w = pw * zoom * 0.5;
      const d = pd * zoom * 0.25;
      const h = ph * zoom;
      const s = scale;

      // Right face (front of train) corners
      const br = { x: cabX + w, y: cabY };
      const bf = { x: cabX, y: cabY + d };
      const tr = { x: cabX + w, y: cabY - h };
      const tf = { x: cabX, y: cabY - h + d };

      // Edge direction along bottom (br → bf)
      const edx = bf.x - br.x;
      const edy = bf.y - br.y;

      // Face midpoints (bottom & top edges)
      const botMid = { x: (br.x + bf.x) / 2, y: (br.y + bf.y) / 2 };
      const topMid = { x: (tr.x + tf.x) / 2, y: (tr.y + tf.y) / 2 };

      // === 3D BUMPER BEAM along front-face bottom edge ===
      // Project outer edge forward along the track via isoOffset
      const beamH = 1.5 * zoom * s;
      const beamFwd = 0.7 * s;
      const brO = isoOffset(br.x, br.y, beamFwd);
      const bfO = isoOffset(bf.x, bf.y, beamFwd);

      // Top face of beam (accent strip)
      ctx.fillStyle = accentCol;
      ctx.beginPath();
      ctx.moveTo(br.x, br.y);
      ctx.lineTo(bf.x, bf.y);
      ctx.lineTo(bfO.x, bfO.y);
      ctx.lineTo(brO.x, brO.y);
      ctx.closePath();
      ctx.fill();

      // Front face of beam (vertical drop from outer edge)
      ctx.fillStyle = mainCol;
      ctx.beginPath();
      ctx.moveTo(brO.x, brO.y);
      ctx.lineTo(bfO.x, bfO.y);
      ctx.lineTo(bfO.x, bfO.y + beamH);
      ctx.lineTo(brO.x, brO.y + beamH);
      ctx.closePath();
      ctx.fill();

      // Bottom face of beam
      ctx.fillStyle = darkCol;
      ctx.beginPath();
      ctx.moveTo(br.x, br.y + beamH);
      ctx.lineTo(bf.x, bf.y + beamH);
      ctx.lineTo(bfO.x, bfO.y + beamH);
      ctx.lineTo(brO.x, brO.y + beamH);
      ctx.closePath();
      ctx.fill();

      // Beam outlines
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(brO.x, brO.y);
      ctx.lineTo(bfO.x, bfO.y);
      ctx.lineTo(bfO.x, bfO.y + beamH);
      ctx.lineTo(brO.x, brO.y + beamH);
      ctx.closePath();
      ctx.stroke();

      // Top-face highlight
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(br.x + edx * 0.15, br.y + edy * 0.15);
      ctx.lineTo(bf.x - edx * 0.15, bf.y - edy * 0.15);
      ctx.stroke();

      // Bolts on bumper beam front face
      ctx.fillStyle = accentCol;
      for (let bi = 0; bi < 3; bi++) {
        const bt = (bi + 1) / 4;
        const bx = brO.x + edx * bt;
        const by = brO.y + edy * bt + beamH * 0.35;
        ctx.beginPath();
        ctx.arc(bx, by, 0.5 * zoom * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // === COWCATCHER V-plow flush below bumper ===
      const cowBase = {
        x: (brO.x + bfO.x) / 2,
        y: (brO.y + bfO.y) / 2 + beamH,
      };
      drawIsoCowcatcher(
        cowBase.x, cowBase.y,
        2.5 * s, 2 * s, 2.5 * s,
        mainCol, darkCol, accentCol, cowBarCount);

      // === HEADLIGHT mounted on upper front face ===
      const hlAnchor = {
        x: botMid.x + (topMid.x - botMid.x) * 0.7,
        y: botMid.y + (topMid.y - botMid.y) * 0.7,
      };
      // Project headlight center forward along track by a small amount
      const hlCenter = isoOffset(hlAnchor.x, hlAnchor.y, 1 * s);
      drawIsoHeadlight(
        hlAnchor.x, hlAnchor.y,
        hlCenter.x, hlCenter.y,
        1.8 * s,
        hlHousingCol, hlBracketCol, hlGlowAlpha);
    };

    if (tower.level === 1) {
      // ========== LEVEL 1: Classic Princeton Dinky Steam Locomotive ==========
      const cabPos = isoOffset(trainX, trainY, 7);
      const boilerPos = isoOffset(trainX, trainY, 0);
      const tenderPos = isoOffset(trainX, trainY, -7);
      const wheelY = trainY + 4.5 * zoom;

      // --- HEAVY UNDERCARRIAGE: Riveted iron chassis frame ---
      const chStart = isoOffset(trainX, trainY + 2 * zoom, -10);
      const chEnd = isoOffset(trainX, trainY + 2 * zoom, 10);
      const chassGrad = ctx.createLinearGradient(
        chStart.x,
        chStart.y,
        chEnd.x,
        chEnd.y,
      );
      chassGrad.addColorStop(0, "#2a1810");
      chassGrad.addColorStop(0.5, "#3a2818");
      chassGrad.addColorStop(1, "#1e1008");
      ctx.fillStyle = chassGrad;
      ctx.beginPath();
      ctx.moveTo(chStart.x, chStart.y);
      ctx.lineTo(chEnd.x, chEnd.y);
      ctx.lineTo(chEnd.x, chEnd.y + 3 * zoom);
      ctx.lineTo(chStart.x, chStart.y + 3 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1e1008";
      ctx.beginPath();
      ctx.moveTo(chStart.x - 2.5 * zoom, chStart.y + 1.5 * zoom);
      ctx.lineTo(chEnd.x - 2.5 * zoom, chEnd.y + 1.5 * zoom);
      ctx.lineTo(chEnd.x - 2.5 * zoom, chEnd.y + 4.5 * zoom);
      ctx.lineTo(chStart.x - 2.5 * zoom, chStart.y + 4.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // Animated pistons — proper isometric connecting rods
      drawConnectingRods([8, 3, -3, -8], trainX, wheelY, "#8a7a6a");

      // Leaf springs
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 1.5 * zoom;
      for (const so of [8, 3, -3, -8]) {
        const sp = isoOffset(trainX, wheelY - 1.5 * zoom, so);
        ctx.beginPath();
        ctx.moveTo(sp.x - 3 * zoom, sp.y + 0.5 * zoom);
        ctx.quadraticCurveTo(
          sp.x,
          sp.y - 2 * zoom,
          sp.x + 3 * zoom,
          sp.y + 0.5 * zoom,
        );
        ctx.stroke();
        ctx.strokeStyle = "#4a3a2a";
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(sp.x - 2.5 * zoom, sp.y + 1 * zoom);
        ctx.quadraticCurveTo(
          sp.x,
          sp.y - 1 * zoom,
          sp.x + 2.5 * zoom,
          sp.y + 1 * zoom,
        );
        ctx.stroke();
        ctx.strokeStyle = "#5a4a3a";
        ctx.lineWidth = 1.5 * zoom;
      }

      // --- WHEELS: Rich copper with brass hubs ---
      drawWheel(
        isoOffset(trainX, wheelY, 8).x,
        isoOffset(trainX, wheelY, 8).y,
        4,
        "#8B5E3C",
        "#5a3a1a",
        "#B87333",
      );
      drawWheel(
        isoOffset(trainX, wheelY, 3).x,
        isoOffset(trainX, wheelY, 3).y,
        4,
        "#8B5E3C",
        "#5a3a1a",
        "#B87333",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -3).x,
        isoOffset(trainX, wheelY, -3).y,
        3.5,
        "#8B5E3C",
        "#5a3a1a",
        "#B87333",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -8).x,
        isoOffset(trainX, wheelY, -8).y,
        3.5,
        "#8B5E3C",
        "#5a3a1a",
        "#B87333",
      );

      // === CAB (front, draw first - appears behind) ===
      // Rich mahogany cab body with 3D depth
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        11,
        10,
        16,
        { top: "#8B4513", left: "#6B3410", right: "#4B2408" },
        zoom,
      );

      // Wooden plank texture on left face with alternating shades
      for (let p = 0; p < 6; p++) {
        const py = cabPos.y - 2 * zoom - p * 2.3 * zoom;
        const pL = isoOffset(cabPos.x, py, -5.5);
        const pR = isoOffset(cabPos.x, py, 0);
        ctx.strokeStyle = p % 2 === 0 ? "#5a2a08" : "#4a2006";
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(pL.x - 5.5 * zoom, pL.y);
        ctx.lineTo(pR.x - 5.5 * zoom, pR.y);
        ctx.stroke();
      }
      // Plank texture on right face
      for (let p = 0; p < 6; p++) {
        const py = cabPos.y - 2 * zoom - p * 2.3 * zoom;
        ctx.strokeStyle = p % 2 === 0 ? "#3a1a04" : "#4a2408";
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(cabPos.x + 1 * zoom, py + 0.5 * p * zoom);
        ctx.lineTo(cabPos.x + 5.5 * zoom, py - 1.8 * zoom + 0.5 * p * zoom);
        ctx.stroke();
      }

      // Copper corner trim strips
      ctx.strokeStyle = "#B87333";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5.5 * zoom, cabPos.y);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y - 16 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x - 5.5 * zoom, cabPos.y);
      ctx.lineTo(cabPos.x - 5.5 * zoom, cabPos.y - 16 * zoom);
      ctx.stroke();

      // Rounded cab roof with copper drip edge
      const roofW = 6.5 * zoom;
      const roofTop = cabPos.y - 16 * zoom;
      ctx.fillStyle = "#5a3010";
      ctx.beginPath();
      ctx.moveTo(cabPos.x - roofW, roofTop + 1 * zoom);
      ctx.quadraticCurveTo(
        cabPos.x - roofW,
        roofTop - 4 * zoom,
        cabPos.x,
        roofTop - 5 * zoom,
      );
      ctx.quadraticCurveTo(
        cabPos.x + roofW,
        roofTop - 4 * zoom,
        cabPos.x + roofW,
        roofTop + 1 * zoom,
      );
      ctx.lineTo(cabPos.x + roofW, roofTop + 2 * zoom);
      ctx.lineTo(cabPos.x - roofW, roofTop + 2 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#B87333";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x - roofW, roofTop + 2 * zoom);
      ctx.lineTo(cabPos.x + roofW, roofTop + 2 * zoom);
      ctx.stroke();
      // Roof highlight arc
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.quadraticCurveTo(
        cabPos.x - roofW * 0.5,
        roofTop - 3.5 * zoom,
        cabPos.x,
        roofTop - 4.5 * zoom,
      );
      ctx.quadraticCurveTo(
        cabPos.x + roofW * 0.5,
        roofTop - 3.5 * zoom,
        cabPos.x + roofW * 0.8,
        roofTop - 1 * zoom,
      );
      ctx.stroke();

      // Arched window on right face with warm oil lamp glow
      const cabGlow = 0.55 + Math.sin(time * 2) * 0.2;
      ctx.fillStyle = "#2a1808";
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 1.5 * zoom, cabPos.y - 4 * zoom);
      ctx.lineTo(cabPos.x + 5 * zoom, cabPos.y - 5.5 * zoom);
      ctx.lineTo(cabPos.x + 5 * zoom, cabPos.y - 12 * zoom);
      ctx.quadraticCurveTo(
        cabPos.x + 3.2 * zoom,
        cabPos.y - 14 * zoom,
        cabPos.x + 1.5 * zoom,
        cabPos.y - 12 * zoom,
      );
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(255, 180, 80, ${cabGlow})`;
      ctx.shadowColor = "#ff9933";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 2 * zoom, cabPos.y - 4.5 * zoom);
      ctx.lineTo(cabPos.x + 4.5 * zoom, cabPos.y - 6 * zoom);
      ctx.lineTo(cabPos.x + 4.5 * zoom, cabPos.y - 11.5 * zoom);
      ctx.quadraticCurveTo(
        cabPos.x + 3.2 * zoom,
        cabPos.y - 13 * zoom,
        cabPos.x + 2 * zoom,
        cabPos.y - 11.5 * zoom,
      );
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      // Window mullion (cross)
      ctx.strokeStyle = "#B87333";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 1.8 * zoom, cabPos.y - 8 * zoom);
      ctx.lineTo(cabPos.x + 4.8 * zoom, cabPos.y - 9 * zoom);
      ctx.stroke();

      // Porthole window on left face
      const sideWin = isoOffset(cabPos.x, cabPos.y - 9 * zoom, -3);
      ctx.fillStyle = "#2a1808";
      ctx.beginPath();
      ctx.ellipse(
        sideWin.x - 5.5 * zoom,
        sideWin.y,
        2.5 * zoom,
        1.3 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = `rgba(255, 180, 80, ${cabGlow * 0.7})`;
      ctx.shadowColor = "#ff9933";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        sideWin.x - 5.5 * zoom,
        sideWin.y,
        1.8 * zoom,
        0.9 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#B87333";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        sideWin.x - 5.5 * zoom,
        sideWin.y,
        2.5 * zoom,
        1.3 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Brass door with handle on right face
      ctx.strokeStyle = "#B87333";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 1 * zoom, cabPos.y - 1 * zoom);
      ctx.lineTo(cabPos.x + 3 * zoom, cabPos.y - 2 * zoom);
      ctx.lineTo(cabPos.x + 3 * zoom, cabPos.y - 10 * zoom);
      ctx.quadraticCurveTo(
        cabPos.x + 2 * zoom,
        cabPos.y - 11 * zoom,
        cabPos.x + 1 * zoom,
        cabPos.y - 10 * zoom,
      );
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#C9A227";
      ctx.beginPath();
      ctx.arc(
        cabPos.x + 2.5 * zoom,
        cabPos.y - 5.5 * zoom,
        0.7 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Cab steps with handrail
      ctx.fillStyle = "#5a3818";
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 5.5 * zoom, cabPos.y + 2 * zoom);
      ctx.lineTo(cabPos.x + 8 * zoom, cabPos.y + 0.5 * zoom);
      ctx.lineTo(cabPos.x + 8 * zoom, cabPos.y + 2 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y + 3.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 6 * zoom, cabPos.y + 4 * zoom);
      ctx.lineTo(cabPos.x + 8.5 * zoom, cabPos.y + 2.5 * zoom);
      ctx.lineTo(cabPos.x + 8.5 * zoom, cabPos.y + 3.5 * zoom);
      ctx.lineTo(cabPos.x + 6 * zoom, cabPos.y + 5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#B87333";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 8 * zoom, cabPos.y - 4 * zoom);
      ctx.lineTo(cabPos.x + 8 * zoom, cabPos.y + 3 * zoom);
      ctx.stroke();

      // === BOILER (middle) - Rich copper 3D cylinder ===
      drawIsoBoiler(
        boilerPos.x,
        boilerPos.y - 5.5 * zoom,
        5,
        4.5,
        "#B87333",
        "#8B5E3C",
        "#D4956B",
      );

      // Brass boiler bands with highlights
      ctx.lineWidth = 1.8 * zoom;
      for (let b = 0; b < 4; b++) {
        const bandPos = isoOffset(
          boilerPos.x,
          boilerPos.y - 5.5 * zoom,
          -4 + b * 2.5,
        );
        ctx.strokeStyle = "#C9A227";
        ctx.beginPath();
        ctx.ellipse(
          bandPos.x,
          bandPos.y,
          4.5 * zoom * 0.55 + 0.5 * zoom,
          4.5 * zoom + 0.5 * zoom,
          0,
          Math.PI,
          Math.PI * 2,
        );
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,220,120,0.3)";
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          bandPos.x,
          bandPos.y - 0.5 * zoom,
          4.5 * zoom * 0.52,
          4.5 * zoom * 0.95,
          0,
          Math.PI * 1.2,
          Math.PI * 1.8,
        );
        ctx.stroke();
        ctx.lineWidth = 1.8 * zoom;
      }

      // Steam dome on top of boiler with brass cap
      const domePosL1 = isoOffset(
        boilerPos.x,
        boilerPos.y - 5.5 * zoom - 4.5 * zoom,
        0,
      );
      const domeGrad = ctx.createRadialGradient(
        domePosL1.x - 1 * zoom,
        domePosL1.y - 2 * zoom,
        0,
        domePosL1.x,
        domePosL1.y,
        3.5 * zoom,
      );
      domeGrad.addColorStop(0, "#D4956B");
      domeGrad.addColorStop(0.6, "#B87333");
      domeGrad.addColorStop(1, "#8B5E3C");
      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.ellipse(
        domePosL1.x,
        domePosL1.y,
        2.8 * zoom,
        4 * zoom,
        0,
        Math.PI,
        0,
      );
      ctx.fill();
      ctx.fillStyle = "#8B5E3C";
      ctx.beginPath();
      ctx.ellipse(
        domePosL1.x,
        domePosL1.y,
        2.8 * zoom,
        1.4 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#C9A227";
      ctx.beginPath();
      ctx.ellipse(
        domePosL1.x,
        domePosL1.y - 3.5 * zoom,
        1.5 * zoom,
        0.8 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(255,220,120,0.4)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        domePosL1.x,
        domePosL1.y - 3.5 * zoom,
        1.5 * zoom,
        0.8 * zoom,
        0,
        Math.PI * 1.1,
        Math.PI * 1.9,
      );
      ctx.stroke();

      // === SMOKESTACK: Victorian diamond-stack with spark catcher ===
      const stackPos = isoOffset(boilerPos.x, boilerPos.y - 14 * zoom, 3.5);
      // Base (narrow)
      ctx.fillStyle = "#3a2a1a";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 1.8 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 1.5 * zoom, stackPos.y - 4 * zoom);
      ctx.lineTo(stackPos.x + 1.5 * zoom, stackPos.y - 4 * zoom);
      ctx.lineTo(stackPos.x + 1.8 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      // Flared top (diamond shape)
      ctx.fillStyle = "#4a3a2a";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 1.5 * zoom, stackPos.y - 4 * zoom);
      ctx.lineTo(stackPos.x - 4 * zoom, stackPos.y - 12 * zoom);
      ctx.lineTo(stackPos.x + 4 * zoom, stackPos.y - 12 * zoom);
      ctx.lineTo(stackPos.x + 1.5 * zoom, stackPos.y - 4 * zoom);
      ctx.closePath();
      ctx.fill();
      // Spark catcher mesh dome — isometric elliptical
      ctx.fillStyle = "rgba(90, 80, 60, 0.5)";
      ctx.beginPath();
      ctx.ellipse(stackPos.x, stackPos.y - 13.5 * zoom, 3.5 * zoom * ISO_SIN, 3.5 * zoom, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#6a5a3a";
      ctx.lineWidth = 0.6 * zoom;
      for (let mi = 0; mi < 5; mi++) {
        const meshAngle = (mi / 5) * Math.PI;
        const meshRx = 3.5 * zoom * ISO_SIN;
        ctx.beginPath();
        ctx.moveTo(
          stackPos.x - meshRx * Math.cos(meshAngle),
          stackPos.y - 13.5 * zoom,
        );
        ctx.quadraticCurveTo(
          stackPos.x,
          stackPos.y - 17 * zoom,
          stackPos.x + meshRx * Math.cos(Math.PI - meshAngle),
          stackPos.y - 13.5 * zoom,
        );
        ctx.stroke();
      }
      // Brass cap ring at top
      ctx.strokeStyle = "#8B7333";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y - 12 * zoom,
        4.5 * zoom,
        2.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.fillStyle = "#5a4a3a";
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y - 12 * zoom,
        3.5 * zoom,
        1.8 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#2a1a0a";
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y,
        1.8 * zoom,
        0.9 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Animated smoke puffs with gradient opacity
      for (let puff = 0; puff < 5; puff++) {
        const puffAge = (time * 1.8 + puff * 1.3) % 5;
        const puffY = stackPos.y - 14 * zoom - puffAge * 5 * zoom;
        const puffX =
          stackPos.x +
          Math.sin(time * 1.5 + puff * 0.8) * (2 + puff * 1.2) * zoom;
        const puffR = (2.5 + puff * 1.8 + puffAge * 1.2) * zoom;
        const puffA = Math.max(0, 0.45 - puffAge * 0.09);
        const puffGrad = ctx.createRadialGradient(
          puffX,
          puffY,
          0,
          puffX,
          puffY,
          puffR,
        );
        puffGrad.addColorStop(0, `rgba(240, 235, 225, ${puffA})`);
        puffGrad.addColorStop(0.5, `rgba(210, 205, 195, ${puffA * 0.7})`);
        puffGrad.addColorStop(1, `rgba(180, 175, 165, 0)`);
        ctx.fillStyle = puffGrad;
        ctx.beginPath();
        ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Animated embers/sparks from stack
      for (let em = 0; em < 3; em++) {
        const emAge = (time * 3 + em * 2) % 3;
        const emX = stackPos.x + Math.sin(time * 4 + em * 2.5) * 3 * zoom;
        const emY = stackPos.y - 14 * zoom - emAge * 6 * zoom;
        const emA = Math.max(0, 0.8 - emAge * 0.3);
        ctx.fillStyle = `rgba(255, ${140 + em * 30}, 30, ${emA})`;
        ctx.shadowColor = `rgba(255, ${140 + em * 30}, 30, ${emA * 0.5})`;
        ctx.shadowBlur = 4 * zoom;
        ctx.beginPath();
        ctx.arc(emX, emY, (0.8 + Math.random() * 0.3) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Isometric headlight on boiler
      {
        const hlPos = isoOffset(boilerPos.x, boilerPos.y - 5.5 * zoom, 5);
        drawIsoHeadlight(
          boilerPos.x + 4 * zoom, boilerPos.y - 6 * zoom,
          hlPos.x, hlPos.y, 2.5,
          "#C9A227", "#8B5E3C", 0.75 + Math.sin(time * 3) * 0.2);
      }

      // Bell on bracket with brass shine
      const bellPos = isoOffset(boilerPos.x, boilerPos.y - 17 * zoom, 1);
      ctx.strokeStyle = "#8B5E3C";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(bellPos.x - 1 * zoom, bellPos.y + 3 * zoom);
      ctx.lineTo(bellPos.x, bellPos.y + 1 * zoom);
      ctx.lineTo(bellPos.x + 1 * zoom, bellPos.y + 3 * zoom);
      ctx.stroke();
      const bellGrad = ctx.createRadialGradient(
        bellPos.x - 0.5 * zoom,
        bellPos.y,
        0,
        bellPos.x,
        bellPos.y + 1.5 * zoom,
        3 * zoom,
      );
      bellGrad.addColorStop(0, "#E8C847");
      bellGrad.addColorStop(0.5, "#C9A227");
      bellGrad.addColorStop(1, "#A08020");
      ctx.fillStyle = bellGrad;
      ctx.beginPath();
      ctx.moveTo(bellPos.x - 2.5 * zoom, bellPos.y);
      ctx.quadraticCurveTo(
        bellPos.x - 3 * zoom,
        bellPos.y + 2.5 * zoom,
        bellPos.x - 1.2 * zoom,
        bellPos.y + 3.5 * zoom,
      );
      ctx.lineTo(bellPos.x + 1.2 * zoom, bellPos.y + 3.5 * zoom);
      ctx.quadraticCurveTo(
        bellPos.x + 3 * zoom,
        bellPos.y + 2.5 * zoom,
        bellPos.x + 2.5 * zoom,
        bellPos.y,
      );
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#D4B030";
      ctx.beginPath();
      ctx.ellipse(
        bellPos.x,
        bellPos.y,
        2.5 * zoom,
        1.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Bell highlight
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.ellipse(
        bellPos.x - 0.5 * zoom,
        bellPos.y - 0.3 * zoom,
        1.2 * zoom,
        0.6 * zoom,
        -0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Pressure gauge on boiler side with animated needle
      const gaugePos = isoOffset(boilerPos.x, boilerPos.y - 7 * zoom, -4.5);
      ctx.fillStyle = "#e8e0d0";
      ctx.beginPath();
      ctx.arc(gaugePos.x - 5.5 * zoom, gaugePos.y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#B87333";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 0.5 * zoom;
      for (let ti = 0; ti < 8; ti++) {
        const ta = -Math.PI * 0.75 + (ti / 7) * Math.PI * 1.5;
        ctx.beginPath();
        ctx.moveTo(
          gaugePos.x - 5.5 * zoom + Math.cos(ta) * 1.4 * zoom,
          gaugePos.y + Math.sin(ta) * 1.4 * zoom,
        );
        ctx.lineTo(
          gaugePos.x - 5.5 * zoom + Math.cos(ta) * 1.7 * zoom,
          gaugePos.y + Math.sin(ta) * 1.7 * zoom,
        );
        ctx.stroke();
      }
      const needleAngle = -Math.PI * 0.25 + Math.sin(time * 0.5) * 0.3;
      ctx.strokeStyle = "#cc0000";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(gaugePos.x - 5.5 * zoom, gaugePos.y);
      ctx.lineTo(
        gaugePos.x - 5.5 * zoom + Math.cos(needleAngle) * 1.5 * zoom,
        gaugePos.y + Math.sin(needleAngle) * 1.5 * zoom,
      );
      ctx.stroke();
      ctx.fillStyle = "#B87333";
      ctx.beginPath();
      ctx.arc(gaugePos.x - 5.5 * zoom, gaugePos.y, 0.4 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // === TENDER (back, draw last - appears in front) ===
      drawIsometricPrism(
        ctx,
        tenderPos.x,
        tenderPos.y,
        11,
        10,
        9,
        { top: "#8B4513", left: "#6B3410", right: "#4B2408" },
        zoom,
      );

      // Plank texture on faces
      for (let p = 0; p < 4; p++) {
        const py = tenderPos.y - 1 * zoom - p * 2 * zoom;
        ctx.strokeStyle = p % 2 === 0 ? "#5a2a08" : "#4a2006";
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(tenderPos.x - 5.5 * zoom - 5 * zoom, py + 2.5 * zoom);
        ctx.lineTo(tenderPos.x - 5.5 * zoom, py);
        ctx.stroke();
        ctx.strokeStyle = "#3a1a04";
        ctx.beginPath();
        ctx.moveTo(tenderPos.x + 1 * zoom, py + 0.5 * zoom);
        ctx.lineTo(tenderPos.x + 5.5 * zoom, py - 1.8 * zoom);
        ctx.stroke();
      }

      // Copper edge banding
      ctx.strokeStyle = "#B87333";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(tenderPos.x - 5.5 * zoom, tenderPos.y - 9 * zoom);
      ctx.lineTo(tenderPos.x + 5.5 * zoom, tenderPos.y - 9 * zoom);
      ctx.stroke();

      // Coal pile with gradient mound and ember glow
      const coalGrad = ctx.createRadialGradient(
        tenderPos.x,
        tenderPos.y - 10 * zoom,
        0,
        tenderPos.x,
        tenderPos.y - 9 * zoom,
        4.5 * zoom,
      );
      coalGrad.addColorStop(0, "#2a2018");
      coalGrad.addColorStop(0.5, "#1a1008");
      coalGrad.addColorStop(1, "#0a0804");
      ctx.fillStyle = coalGrad;
      ctx.beginPath();
      ctx.ellipse(
        tenderPos.x,
        tenderPos.y - 9 * zoom,
        4.5 * zoom,
        1.8 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(tenderPos.x, tenderPos.y - 9 * zoom, 4 * zoom * ISO_SIN, 4 * zoom, 0, Math.PI, 0);
      ctx.fill();

      // Deterministic coal chunks with faceted shading
      const coalSpots = [
        [0, 0, 38, 28, 18],
        [-1.5, 0.5, 42, 32, 22],
        [1.2, 0.3, 35, 25, 15],
        [-0.5, -1, 40, 30, 20],
        [1, -0.8, 36, 26, 16],
        [-1.8, -0.3, 44, 34, 24],
        [0.5, 0.7, 37, 27, 17],
        [-0.8, -1.5, 41, 31, 21],
        [1.5, -1.2, 33, 23, 13],
        [0.3, -1.8, 39, 29, 19],
        [-1.2, -1.0, 45, 35, 25],
        [0.8, -0.3, 34, 24, 14],
      ];
      for (const [cx, cy, cr, cg, cb] of coalSpots) {
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.9)`;
        ctx.beginPath();
        ctx.arc(
          tenderPos.x + cx * zoom,
          tenderPos.y - 10 * zoom + cy * zoom,
          1 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        // Faceted highlight on upper-left
        ctx.fillStyle = `rgba(${cr + 35}, ${cg + 30}, ${cb + 25}, 0.45)`;
        ctx.beginPath();
        ctx.arc(
          tenderPos.x + cx * zoom - 0.3 * zoom,
          tenderPos.y - 10.3 * zoom + cy * zoom,
          0.45 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Ember glow deep in the coal pile
      const emberGlow = 0.25 + Math.sin(time * 1.8) * 0.15;
      ctx.fillStyle = `rgba(255, 80, 20, ${emberGlow})`;
      ctx.shadowColor = "rgba(255, 80, 20, 0.5)";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        tenderPos.x - 0.5 * zoom,
        tenderPos.y - 9.5 * zoom,
        2.5 * zoom,
        1 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Glowing coal crevice lines
      const creviceGlow = 0.15 + Math.sin(time * 2.5 + 1) * 0.1;
      ctx.strokeStyle = `rgba(255, 100, 30, ${creviceGlow})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(tenderPos.x - 2 * zoom, tenderPos.y - 9.8 * zoom);
      ctx.quadraticCurveTo(
        tenderPos.x - 0.5 * zoom,
        tenderPos.y - 10.5 * zoom,
        tenderPos.x + 1.5 * zoom,
        tenderPos.y - 9.8 * zoom,
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tenderPos.x - 1 * zoom, tenderPos.y - 9.3 * zoom);
      ctx.quadraticCurveTo(
        tenderPos.x + 0.5 * zoom,
        tenderPos.y - 10 * zoom,
        tenderPos.x + 2 * zoom,
        tenderPos.y - 9.5 * zoom,
      );
      ctx.stroke();

      // Water level gauge on left face
      const tankPos = isoOffset(tenderPos.x, tenderPos.y - 3.5 * zoom, -4.5);
      ctx.fillStyle = "#B87333";
      ctx.fillRect(
        tankPos.x - 7 * zoom,
        tankPos.y - 2 * zoom,
        3 * zoom,
        5 * zoom,
      );
      ctx.strokeStyle = "#8B5E3C";
      ctx.lineWidth = 0.8 * zoom;
      ctx.strokeRect(
        tankPos.x - 7 * zoom,
        tankPos.y - 2 * zoom,
        3 * zoom,
        5 * zoom,
      );
      const waterLvl = 0.6 + Math.sin(time * 0.3) * 0.1;
      ctx.fillStyle = "#4488bb";
      ctx.fillRect(
        tankPos.x - 6.7 * zoom,
        tankPos.y - 1.7 * zoom + (1 - waterLvl) * 4.4 * zoom,
        2.4 * zoom,
        waterLvl * 4.4 * zoom,
      );
      // Glass tube highlight
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(
        tankPos.x - 6.2 * zoom,
        tankPos.y - 1.7 * zoom,
        0.6 * zoom,
        4.4 * zoom,
      );

      // Brass side railing
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1 * zoom;
      for (let i = 0; i < 3; i++) {
        const postX = tenderPos.x + 1 * zoom + i * 2.2 * zoom;
        const postBase = tenderPos.y - 4.5 * zoom - i * 1.1 * zoom;
        ctx.beginPath();
        ctx.moveTo(postX, postBase + 4.5 * zoom);
        ctx.lineTo(postX, postBase);
        ctx.stroke();
        ctx.fillStyle = "#C9A227";
        ctx.beginPath();
        ctx.arc(postX, postBase, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(tenderPos.x + 1 * zoom, tenderPos.y - 4.5 * zoom);
      ctx.lineTo(tenderPos.x + 5.4 * zoom, tenderPos.y - 6.7 * zoom);
      ctx.stroke();

      // === COUPLINGS between cars (brass chain links) ===
      const coup1 = isoOffset(trainX, trainY + 1 * zoom, 3.5);
      ctx.fillStyle = "#C9A227";
      ctx.beginPath();
      ctx.arc(coup1.x, coup1.y, 1.3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8B5E3C";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(coup1.x - 2 * zoom, coup1.y);
      ctx.lineTo(coup1.x + 2 * zoom, coup1.y);
      ctx.stroke();
      const coup2 = isoOffset(trainX, trainY + 1 * zoom, -3.5);
      ctx.fillStyle = "#C9A227";
      ctx.beginPath();
      ctx.arc(coup2.x, coup2.y, 1.3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8B5E3C";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(coup2.x - 2 * zoom, coup2.y);
      ctx.lineTo(coup2.x + 2 * zoom, coup2.y);
      ctx.stroke();

      // === PRINCETON ORANGE STRIPE (3D isometric band with glow) ===
      const stripeY = trainY - 2 * zoom;
      const stripeH = 3 * zoom;
      const stL = isoOffset(trainX, stripeY, -7);
      const stR = isoOffset(trainX, stripeY, 7);
      ctx.fillStyle = "#E77500";
      ctx.shadowColor = "rgba(231, 117, 0, 0.4)";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#FF8C1A";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 0.8 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 0.8 * zoom);
      ctx.closePath();
      ctx.fill();

      // Front assembly: bumper beam, cowcatcher, headlight flush with cab face
      drawTrainFront(cabPos.x, cabPos.y, 11, 10, 16,
        "#B87333", "#8B5E3C", "#C9A227",
        "#C9A227", "#B87333",
        0.75 + Math.sin(time * 3) * 0.2, 1.0, 4);

      // "DINKY" nameplate on boiler side — 3D raised brass plaque
      const npPos = isoOffset(boilerPos.x, boilerPos.y - 3 * zoom, -4);
      const npX = npPos.x - 7 * zoom;
      const npY = npPos.y - 1.2 * zoom;
      const npW = 5.5 * zoom;
      const npH = 2.6 * zoom;
      const npBevel = 0.6 * zoom;

      // Shadow behind plaque for depth
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.moveTo(npX + npBevel + 0.5 * zoom, npY + npBevel + 0.5 * zoom);
      ctx.lineTo(npX + npW + 0.5 * zoom, npY + npBevel + 0.5 * zoom);
      ctx.lineTo(npX + npW + 0.5 * zoom, npY + npH + 0.5 * zoom);
      ctx.lineTo(npX + npBevel + 0.5 * zoom, npY + npH + 0.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // Plaque body with gradient
      const npGrad = ctx.createLinearGradient(npX, npY, npX + npW, npY + npH);
      npGrad.addColorStop(0, "#D4A830");
      npGrad.addColorStop(0.3, "#C9A227");
      npGrad.addColorStop(0.7, "#B8960F");
      npGrad.addColorStop(1, "#A08020");
      ctx.fillStyle = npGrad;
      ctx.beginPath();
      ctx.moveTo(npX + npBevel, npY);
      ctx.lineTo(npX + npW - npBevel, npY);
      ctx.quadraticCurveTo(npX + npW, npY, npX + npW, npY + npBevel);
      ctx.lineTo(npX + npW, npY + npH - npBevel);
      ctx.quadraticCurveTo(
        npX + npW,
        npY + npH,
        npX + npW - npBevel,
        npY + npH,
      );
      ctx.lineTo(npX + npBevel, npY + npH);
      ctx.quadraticCurveTo(npX, npY + npH, npX, npY + npH - npBevel);
      ctx.lineTo(npX, npY + npBevel);
      ctx.quadraticCurveTo(npX, npY, npX + npBevel, npY);
      ctx.closePath();
      ctx.fill();

      // Top bevel highlight
      ctx.strokeStyle = "rgba(255,240,180,0.55)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(npX + npBevel, npY + 0.4 * zoom);
      ctx.lineTo(npX + npW - npBevel, npY + 0.4 * zoom);
      ctx.stroke();

      // Bottom bevel shadow
      ctx.strokeStyle = "rgba(80,60,20,0.5)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(npX + npBevel, npY + npH - 0.4 * zoom);
      ctx.lineTo(npX + npW - npBevel, npY + npH - 0.4 * zoom);
      ctx.stroke();

      // Border frame with double line
      ctx.strokeStyle = "#8B6914";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(npX + npBevel, npY);
      ctx.lineTo(npX + npW - npBevel, npY);
      ctx.quadraticCurveTo(npX + npW, npY, npX + npW, npY + npBevel);
      ctx.lineTo(npX + npW, npY + npH - npBevel);
      ctx.quadraticCurveTo(
        npX + npW,
        npY + npH,
        npX + npW - npBevel,
        npY + npH,
      );
      ctx.lineTo(npX + npBevel, npY + npH);
      ctx.quadraticCurveTo(npX, npY + npH, npX, npY + npH - npBevel);
      ctx.lineTo(npX, npY + npBevel);
      ctx.quadraticCurveTo(npX, npY, npX + npBevel, npY);
      ctx.stroke();

      // Inner frame line
      ctx.strokeStyle = "rgba(255,220,120,0.3)";
      ctx.lineWidth = 0.5 * zoom;
      const inset = 0.8 * zoom;
      ctx.strokeRect(
        npX + inset,
        npY + inset,
        npW - inset * 2,
        npH - inset * 2,
      );

      // Engraved text with shadow
      ctx.font = `bold ${1.6 * zoom}px serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(60,40,10,0.6)";
      ctx.fillText(
        "DINKY",
        npX + npW * 0.5 + 0.3 * zoom,
        npY + npH * 0.65 + 0.3 * zoom,
      );
      ctx.fillStyle = "#3a1a08";
      ctx.fillText("DINKY", npX + npW * 0.5, npY + npH * 0.65);
      // Specular highlight on text
      ctx.fillStyle = "rgba(255,240,180,0.2)";
      ctx.fillText(
        "DINKY",
        npX + npW * 0.5 - 0.15 * zoom,
        npY + npH * 0.65 - 0.15 * zoom,
      );

      // Corner rivets
      const npCorners = [
        [npX + 1 * zoom, npY + 1 * zoom],
        [npX + npW - 1 * zoom, npY + 1 * zoom],
        [npX + 1 * zoom, npY + npH - 1 * zoom],
        [npX + npW - 1 * zoom, npY + npH - 1 * zoom],
      ];
      for (const [crx, cry] of npCorners) {
        ctx.fillStyle = "#8B6914";
        ctx.beginPath();
        ctx.arc(crx, cry, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,240,180,0.3)";
        ctx.beginPath();
        ctx.arc(crx - 0.1 * zoom, cry - 0.1 * zoom, 0.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (tower.level === 2) {
      // ========== LEVEL 2: Ironclad Armored War Engine ==========
      const cabPos = isoOffset(trainX, trainY, 8);
      const locoPos = isoOffset(trainX, trainY, 0);
      const cargoPos = isoOffset(trainX, trainY, -8);
      const wheelY = trainY + 4.5 * zoom;

      // --- HEAVY STEEL UNDERCARRIAGE with riveted I-beams ---
      const chStart = isoOffset(trainX, trainY + 2 * zoom, -12);
      const chEnd = isoOffset(trainX, trainY + 2 * zoom, 12);
      const steelGrad = ctx.createLinearGradient(
        chStart.x,
        chStart.y,
        chEnd.x,
        chEnd.y,
      );
      steelGrad.addColorStop(0, "#1a1e25");
      steelGrad.addColorStop(0.5, "#2a2e35");
      steelGrad.addColorStop(1, "#1a1e25");
      ctx.fillStyle = steelGrad;
      ctx.beginPath();
      ctx.moveTo(chStart.x, chStart.y);
      ctx.lineTo(chEnd.x, chEnd.y);
      ctx.lineTo(chEnd.x, chEnd.y + 3 * zoom);
      ctx.lineTo(chStart.x, chStart.y + 3 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#151820";
      ctx.beginPath();
      ctx.moveTo(chStart.x - 3 * zoom, chStart.y + 1.5 * zoom);
      ctx.lineTo(chEnd.x - 3 * zoom, chEnd.y + 1.5 * zoom);
      ctx.lineTo(chEnd.x - 3 * zoom, chEnd.y + 4.5 * zoom);
      ctx.lineTo(chStart.x - 3 * zoom, chStart.y + 4.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // Heavy coil springs over each wheel
      ctx.strokeStyle = "#4a5060";
      ctx.lineWidth = 1.8 * zoom;
      for (const so of [11, 4, -4, -11]) {
        const sp = isoOffset(trainX, wheelY - 1.5 * zoom, so);
        ctx.beginPath();
        ctx.moveTo(sp.x - 3.5 * zoom, sp.y + 0.5 * zoom);
        ctx.quadraticCurveTo(
          sp.x,
          sp.y - 2.5 * zoom,
          sp.x + 3.5 * zoom,
          sp.y + 0.5 * zoom,
        );
        ctx.stroke();
        ctx.strokeStyle = "#3a4050";
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(sp.x - 3 * zoom, sp.y + 1.2 * zoom);
        ctx.quadraticCurveTo(
          sp.x,
          sp.y - 1.2 * zoom,
          sp.x + 3 * zoom,
          sp.y + 1.2 * zoom,
        );
        ctx.stroke();
        ctx.strokeStyle = "#4a5060";
        ctx.lineWidth = 1.8 * zoom;
      }

      // --- STEEL WHEELS with gunmetal finish ---
      drawWheel(
        isoOffset(trainX, wheelY, 11).x,
        isoOffset(trainX, wheelY, 11).y,
        4.5,
        "#3a4050",
        "#1a1e25",
        "#5a6070",
      );
      drawWheel(
        isoOffset(trainX, wheelY, 4).x,
        isoOffset(trainX, wheelY, 4).y,
        4.5,
        "#3a4050",
        "#1a1e25",
        "#5a6070",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -4).x,
        isoOffset(trainX, wheelY, -4).y,
        4.5,
        "#3a4050",
        "#1a1e25",
        "#5a6070",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -11).x,
        isoOffset(trainX, wheelY, -11).y,
        4.5,
        "#3a4050",
        "#1a1e25",
        "#5a6070",
      );

      // Animated connecting rods — proper isometric
      drawConnectingRods([11, 4, -4, -11], trainX, wheelY, "#5a6070");

      // === ARMORED CAB (front, draw first) ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        12,
        11,
        16,
        { top: "#3a4050", left: "#2a3040", right: "#1a2030" },
        zoom,
      );

      // Welded armor plate seams on both faces
      ctx.strokeStyle = "#5a6070";
      ctx.lineWidth = 0.8 * zoom;
      for (let s = 0; s < 3; s++) {
        const sy = cabPos.y - 3 * zoom - s * 4.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(cabPos.x - 6 * zoom, sy + 3 * zoom);
        ctx.lineTo(cabPos.x, sy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cabPos.x + 1 * zoom, sy);
        ctx.lineTo(cabPos.x + 6 * zoom, sy - 3 * zoom);
        ctx.stroke();
      }

      // Heavy rivet rows on both faces
      ctx.fillStyle = "#6a7080";
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
          const rx = cabPos.x - 6 * zoom - col * 0.8 * zoom + row * 0.3 * zoom;
          const ry = cabPos.y - 2 * zoom - row * 3.5 * zoom + col * 0.4 * zoom;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.7 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
        for (let col = 0; col < 4; col++) {
          const rx = cabPos.x + 1.5 * zoom + col * 1.3 * zoom;
          const ry = cabPos.y - 2 * zoom - row * 3.5 * zoom - col * 0.65 * zoom;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.7 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Armored roof with angled deflector
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y - 16 * zoom,
        14,
        13,
        2.5,
        { top: "#2a3040", left: "#1a2030", right: "#101820" },
        zoom,
      );

      // Angled front armor plate (deflector wedge)
      const frontArmor = isoOffset(cabPos.x, cabPos.y, 8);
      const armorGrad = ctx.createLinearGradient(
        frontArmor.x - 5 * zoom,
        frontArmor.y,
        frontArmor.x + 5 * zoom,
        frontArmor.y,
      );
      armorGrad.addColorStop(0, "#3a4050");
      armorGrad.addColorStop(0.5, "#4a5060");
      armorGrad.addColorStop(1, "#2a3040");
      ctx.fillStyle = armorGrad;
      ctx.beginPath();
      ctx.moveTo(frontArmor.x - 5 * zoom, frontArmor.y - 4 * zoom);
      ctx.lineTo(frontArmor.x + 5 * zoom, frontArmor.y - 10 * zoom);
      ctx.lineTo(frontArmor.x + 5 * zoom, frontArmor.y - 1 * zoom);
      ctx.lineTo(frontArmor.x - 5 * zoom, frontArmor.y + 5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5a6070";
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();
      // Welded seam on armor plate
      ctx.strokeStyle = "rgba(120,130,150,0.5)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(frontArmor.x - 5 * zoom, frontArmor.y - 4 * zoom);
      ctx.lineTo(frontArmor.x + 5 * zoom, frontArmor.y - 10 * zoom);
      ctx.stroke();

      // Green-lit vision slit
      ctx.fillStyle = "#0a0e14";
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 1.5 * zoom, cabPos.y - 9.5 * zoom);
      ctx.lineTo(cabPos.x + 6 * zoom, cabPos.y - 12 * zoom);
      ctx.lineTo(cabPos.x + 6 * zoom, cabPos.y - 10 * zoom);
      ctx.lineTo(cabPos.x + 1.5 * zoom, cabPos.y - 7.5 * zoom);
      ctx.closePath();
      ctx.fill();
      const slitGlow = 0.45 + Math.sin(time * 2) * 0.2;
      ctx.fillStyle = `rgba(60, 220, 80, ${slitGlow})`;
      ctx.shadowColor = "#40dd50";
      ctx.shadowBlur = 8 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 2 * zoom, cabPos.y - 9.2 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y - 11.5 * zoom);
      ctx.lineTo(cabPos.x + 5.5 * zoom, cabPos.y - 10.2 * zoom);
      ctx.lineTo(cabPos.x + 2 * zoom, cabPos.y - 7.9 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Periscope turret on cab roof
      const periPos = isoOffset(cabPos.x, cabPos.y - 18.5 * zoom, 2);
      drawIsometricPrism(
        ctx,
        periPos.x,
        periPos.y,
        3.5,
        3.5,
        7,
        { top: "#3a4050", left: "#2a3040", right: "#1a2030" },
        zoom,
      );
      ctx.fillStyle = "#88ccaa";
      ctx.shadowColor = "#88ccaa";
      ctx.shadowBlur = 3 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        periPos.x,
        periPos.y - 7 * zoom,
        1.2 * zoom,
        0.7 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Side armor skirts
      ctx.fillStyle = "#2a3040";
      ctx.beginPath();
      ctx.moveTo(cabPos.x - 6 * zoom - 2.5 * zoom, cabPos.y + 1 * zoom);
      ctx.lineTo(cabPos.x - 6 * zoom + 3.5 * zoom, cabPos.y - 1.8 * zoom);
      ctx.lineTo(cabPos.x - 6 * zoom + 3.5 * zoom, cabPos.y + 3.5 * zoom);
      ctx.lineTo(cabPos.x - 6 * zoom - 2.5 * zoom, cabPos.y + 5.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1a2030";
      ctx.beginPath();
      ctx.moveTo(cabPos.x + 6 * zoom, cabPos.y - 2 * zoom);
      ctx.lineTo(cabPos.x + 6 * zoom + 4.5 * zoom, cabPos.y - 4.5 * zoom);
      ctx.lineTo(cabPos.x + 6 * zoom + 4.5 * zoom, cabPos.y + 1 * zoom);
      ctx.lineTo(cabPos.x + 6 * zoom, cabPos.y + 3.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // === LOCOMOTIVE (middle) - Heavy industrial boiler ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        13,
        11,
        13,
        { top: "#3a4050", left: "#2a3040", right: "#1a2030" },
        zoom,
      );

      // Armored boiler cylinder
      drawIsoBoiler(
        locoPos.x,
        locoPos.y - 6.5 * zoom,
        5.5,
        5,
        "#3a4050",
        "#1a2030",
        "#5a6070",
      );

      // Steel reinforcement bands
      ctx.strokeStyle = "#5a6070";
      ctx.lineWidth = 2 * zoom;
      for (let b = 0; b < 3; b++) {
        const bandPos = isoOffset(
          locoPos.x,
          locoPos.y - 6.5 * zoom,
          -4 + b * 4,
        );
        ctx.beginPath();
        ctx.ellipse(
          bandPos.x,
          bandPos.y,
          5 * zoom * 0.55 + 0.4 * zoom,
          5 * zoom + 0.4 * zoom,
          0,
          Math.PI,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // Industrial exhaust stack with deflector cap
      const stackPos = isoOffset(locoPos.x, locoPos.y - 13 * zoom, 0);
      ctx.fillStyle = "#2a3040";
      ctx.beginPath();
      ctx.moveTo(stackPos.x - 3 * zoom, stackPos.y);
      ctx.lineTo(stackPos.x - 2.5 * zoom, stackPos.y - 9 * zoom);
      ctx.lineTo(stackPos.x + 2.5 * zoom, stackPos.y - 9 * zoom);
      ctx.lineTo(stackPos.x + 3 * zoom, stackPos.y);
      ctx.closePath();
      ctx.fill();
      drawIsometricPrism(
        ctx,
        stackPos.x,
        stackPos.y - 9 * zoom,
        8,
        7,
        2.5,
        { top: "#3a4050", left: "#2a3040", right: "#1a2030" },
        zoom,
      );
      ctx.strokeStyle = "#4a5060";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        stackPos.x,
        stackPos.y - 11.5 * zoom,
        4 * zoom,
        1.8 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Dark industrial smoke puffs
      for (let puff = 0; puff < 4; puff++) {
        const puffAge = (time * 1.8 + puff * 1.5) % 4.5;
        const puffY = stackPos.y - 13 * zoom - puffAge * 5 * zoom;
        const puffX =
          stackPos.x + Math.sin(time * 2 + puff * 1.2) * (2.5 + puff) * zoom;
        const puffR = (3 + puff * 1.5 + puffAge * 0.8) * zoom;
        const puffA = Math.max(0, 0.4 - puffAge * 0.09);
        const smokeGrad = ctx.createRadialGradient(
          puffX,
          puffY,
          0,
          puffX,
          puffY,
          puffR,
        );
        smokeGrad.addColorStop(0, `rgba(120, 120, 130, ${puffA})`);
        smokeGrad.addColorStop(0.6, `rgba(100, 100, 110, ${puffA * 0.6})`);
        smokeGrad.addColorStop(1, `rgba(80, 80, 90, 0)`);
        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Side-mounted steam pipes with pressure valves
      ctx.strokeStyle = "#4a5060";
      ctx.lineWidth = 2 * zoom;
      const pipeL1 = isoOffset(locoPos.x, locoPos.y - 4 * zoom, -5);
      const pipeL2 = isoOffset(locoPos.x, locoPos.y - 9 * zoom, -5);
      ctx.beginPath();
      ctx.moveTo(pipeL1.x - 6.5 * zoom, pipeL1.y);
      ctx.lineTo(pipeL2.x - 6.5 * zoom, pipeL2.y);
      ctx.stroke();
      ctx.strokeStyle = "#6a7080";
      ctx.lineWidth = 1.2 * zoom;
      const valvePos = isoOffset(locoPos.x, locoPos.y - 6.5 * zoom, -5);
      ctx.beginPath();
      ctx.arc(valvePos.x - 6.5 * zoom, valvePos.y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#E77500";
      ctx.beginPath();
      ctx.arc(valvePos.x - 6.5 * zoom, valvePos.y, 0.6 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Steam hiss effect
      const steamAlpha = 0.2 + Math.sin(time * 5) * 0.15;
      if (steamAlpha > 0.2) {
        ctx.fillStyle = `rgba(200, 200, 210, ${steamAlpha})`;
        ctx.beginPath();
        ctx.arc(
          valvePos.x - 8.5 * zoom,
          valvePos.y - 1 * zoom,
          2 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Isometric armored headlight on loco
      {
        const hlPos = { x: locoPos.x + 7 * zoom, y: locoPos.y - 9 * zoom };
        drawIsoHeadlight(
          locoPos.x + 6 * zoom, locoPos.y - 8.5 * zoom,
          hlPos.x, hlPos.y, 2.5,
          "#3a4050", "#3a4050", 0.55 + Math.sin(time * 3) * 0.2);
      }

      // === WEAPONS/CARGO CAR (back) ===
      drawIsometricPrism(
        ctx,
        cargoPos.x,
        cargoPos.y,
        13,
        11,
        11,
        { top: "#4a5060", left: "#3a4050", right: "#2a3040" },
        zoom,
      );

      // Heavy rivets on cargo car
      ctx.fillStyle = "#6a7080";
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 6; col++) {
          const rx =
            cargoPos.x - 6.5 * zoom - col * 0.7 * zoom + row * 0.2 * zoom;
          const ry =
            cargoPos.y - 1.5 * zoom - row * 4 * zoom + col * 0.35 * zoom;
          ctx.beginPath();
          ctx.arc(rx, ry, 0.6 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Arrow/gun slits with orange interior glow
      for (let s = 0; s < 2; s++) {
        const slitX = cargoPos.x + (1 + s * 3) * zoom;
        const slitY = cargoPos.y - (3.5 + s * 1.5) * zoom;
        ctx.fillStyle = "#0a0e14";
        ctx.beginPath();
        ctx.moveTo(slitX, slitY - 4 * zoom);
        ctx.lineTo(slitX + 1 * zoom, slitY - 4.3 * zoom);
        ctx.lineTo(slitX + 1 * zoom, slitY - 0.3 * zoom);
        ctx.lineTo(slitX, slitY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = `rgba(231, 117, 0, ${0.3 + Math.sin(time * 2 + s) * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(slitX + 0.2 * zoom, slitY - 3.7 * zoom);
        ctx.lineTo(slitX + 0.8 * zoom, slitY - 3.9 * zoom);
        ctx.lineTo(slitX + 0.8 * zoom, slitY - 0.6 * zoom);
        ctx.lineTo(slitX + 0.2 * zoom, slitY - 0.3 * zoom);
        ctx.closePath();
        ctx.fill();
      }

      // Shield/emblem on left face (raised Princeton medallion)
      const shield = isoOffset(cargoPos.x, cargoPos.y - 5.5 * zoom, -4.5);
      ctx.fillStyle = "#3a4050";
      ctx.beginPath();
      ctx.ellipse(
        shield.x - 5.5 * zoom,
        shield.y,
        3.5 * zoom,
        1.8 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#E77500";
      ctx.shadowColor = "#E77500";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(shield.x - 5.5 * zoom, shield.y - 2.5 * zoom);
      ctx.lineTo(shield.x - 5.5 * zoom - 2.5 * zoom, shield.y);
      ctx.lineTo(shield.x - 5.5 * zoom, shield.y + 2.5 * zoom);
      ctx.lineTo(shield.x - 5.5 * zoom + 2.5 * zoom, shield.y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Rotating turret on top of cargo car with ring base
      const turretAngle = time * 0.5;
      const turretBaseY = cargoPos.y - 11 * zoom;

      // Turret rotation ring — recessed track
      ctx.fillStyle = "#1a2030";
      ctx.beginPath();
      ctx.ellipse(
        cargoPos.x,
        turretBaseY + 0.5 * zoom,
        4 * zoom,
        2.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "#5a6070";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        cargoPos.x,
        turretBaseY + 0.5 * zoom,
        4 * zoom,
        2.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      // Ring bearing teeth (visible arc)
      ctx.strokeStyle = "rgba(100,110,130,0.5)";
      ctx.lineWidth = 0.5 * zoom;
      for (let ti = 0; ti < 12; ti++) {
        const ta = (ti / 12) * Math.PI * 2 + turretAngle;
        const tx = cargoPos.x + Math.cos(ta) * 3.5 * zoom;
        const ty = turretBaseY + 0.5 * zoom + Math.sin(ta) * 1.9 * zoom;
        if (Math.sin(ta) < 0.3) {
          ctx.beginPath();
          ctx.arc(tx, ty, 0.4 * zoom, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Turret body
      drawIsometricPrism(
        ctx,
        cargoPos.x,
        turretBaseY,
        6,
        6,
        5,
        { top: "#3a4050", left: "#2a3040", right: "#1a2030" },
        zoom,
      );

      // Turret armor rivets
      ctx.fillStyle = "#6a7080";
      for (let ri = 0; ri < 3; ri++) {
        ctx.beginPath();
        ctx.arc(
          cargoPos.x + (1 + ri * 1.8) * zoom,
          turretBaseY - (2 + ri * 0.9) * zoom,
          0.5 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Gun barrel with muzzle brake
      const barrelSwing = Math.sin(turretAngle) * 2;
      const turretBarrelEnd = isoOffset(
        cargoPos.x,
        turretBaseY - 2.5 * zoom,
        5 + barrelSwing,
      );
      const barrelStart = isoOffset(cargoPos.x, turretBaseY - 2.5 * zoom, 1);

      // Barrel mantlet (thick mount plate)
      ctx.fillStyle = "#2a3040";
      ctx.beginPath();
      ctx.ellipse(
        barrelStart.x,
        barrelStart.y,
        2 * zoom,
        1.2 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "#4a5060";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Main barrel
      ctx.strokeStyle = "#2a3040";
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(barrelStart.x, barrelStart.y);
      ctx.lineTo(turretBarrelEnd.x, turretBarrelEnd.y);
      ctx.stroke();
      // Barrel highlight stripe
      ctx.strokeStyle = "rgba(90,100,120,0.4)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(barrelStart.x, barrelStart.y - 1 * zoom);
      ctx.lineTo(turretBarrelEnd.x, turretBarrelEnd.y - 1 * zoom);
      ctx.stroke();

      // Muzzle brake — slotted box at barrel end
      const mzDir = {
        x: turretBarrelEnd.x - barrelStart.x,
        y: turretBarrelEnd.y - barrelStart.y,
      };
      const mzLen = Math.sqrt(mzDir.x * mzDir.x + mzDir.y * mzDir.y);
      const mzNx = mzDir.x / mzLen;
      const mzNy = mzDir.y / mzLen;
      const mzPerpX = -mzNy;
      const mzPerpY = mzNx;

      ctx.fillStyle = "#1a2030";
      ctx.beginPath();
      ctx.moveTo(
        turretBarrelEnd.x - mzPerpX * 2.2 * zoom,
        turretBarrelEnd.y - mzPerpY * 2.2 * zoom,
      );
      ctx.lineTo(
        turretBarrelEnd.x + mzPerpX * 2.2 * zoom,
        turretBarrelEnd.y + mzPerpY * 2.2 * zoom,
      );
      ctx.lineTo(
        turretBarrelEnd.x + mzNx * 2 * zoom + mzPerpX * 2.2 * zoom,
        turretBarrelEnd.y + mzNy * 2 * zoom + mzPerpY * 2.2 * zoom,
      );
      ctx.lineTo(
        turretBarrelEnd.x + mzNx * 2 * zoom - mzPerpX * 2.2 * zoom,
        turretBarrelEnd.y + mzNy * 2 * zoom - mzPerpY * 2.2 * zoom,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4a5060";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Muzzle brake vent slots
      for (let si = 0; si < 2; si++) {
        const slotT = 0.3 + si * 0.4;
        const slotX = turretBarrelEnd.x + mzNx * slotT * 2 * zoom;
        const slotY = turretBarrelEnd.y + mzNy * slotT * 2 * zoom;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(slotX - mzPerpX * 1.8 * zoom, slotY - mzPerpY * 1.8 * zoom);
        ctx.lineTo(slotX + mzPerpX * 1.8 * zoom, slotY + mzPerpY * 1.8 * zoom);
        ctx.stroke();
      }

      // Muzzle bore opening
      ctx.fillStyle = "#0a0e14";
      ctx.beginPath();
      ctx.arc(
        turretBarrelEnd.x + mzNx * 2 * zoom,
        turretBarrelEnd.y + mzNy * 2 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Turret viewport with scanning glow
      const viewportGlow = 0.3 + Math.sin(time * 2) * 0.1;
      ctx.fillStyle = "#0a0e14";
      ctx.beginPath();
      ctx.ellipse(
        cargoPos.x,
        turretBaseY - 5 * zoom,
        2 * zoom,
        1 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = `rgba(60, 220, 80, ${viewportGlow})`;
      ctx.shadowColor = "#40dd50";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        cargoPos.x,
        turretBaseY - 5 * zoom,
        1.5 * zoom,
        0.7 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Heavy chains between cars
      ctx.strokeStyle = "#5a6070";
      ctx.lineWidth = 2 * zoom;
      const chain1 = isoOffset(trainX, trainY + 1 * zoom, 4);
      ctx.beginPath();
      ctx.moveTo(chain1.x - 2.5 * zoom, chain1.y);
      ctx.lineTo(chain1.x + 2.5 * zoom, chain1.y);
      ctx.stroke();
      ctx.fillStyle = "#3a4050";
      ctx.beginPath();
      ctx.arc(chain1.x - 2.5 * zoom, chain1.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(chain1.x + 2.5 * zoom, chain1.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      const chain2 = isoOffset(trainX, trainY + 1 * zoom, -4);
      ctx.strokeStyle = "#5a6070";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(chain2.x - 2.5 * zoom, chain2.y);
      ctx.lineTo(chain2.x + 2.5 * zoom, chain2.y);
      ctx.stroke();
      ctx.fillStyle = "#3a4050";
      ctx.beginPath();
      ctx.arc(chain2.x - 2.5 * zoom, chain2.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(chain2.x + 2.5 * zoom, chain2.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Front assembly: armored bumper, plow, headlight flush with cab face
      drawTrainFront(cabPos.x, cabPos.y, 12, 11, 16,
        "#4a5060", "#2a3040", "#5a6070",
        "#3a4050", "#3a4050",
        0.7 + Math.sin(time * 3) * 0.2, 1.1, 4);

      // === PRINCETON ORANGE STRIPE (3D isometric band with glow) ===
      const stripeY = trainY - 2 * zoom;
      const stripeH = 3.5 * zoom;
      const stL = isoOffset(trainX, stripeY, -8);
      const stR = isoOffset(trainX, stripeY, 8);
      ctx.fillStyle = "#E77500";
      ctx.shadowColor = "rgba(231, 117, 0, 0.35)";
      ctx.shadowBlur = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#FF8C1A";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 1 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 1 * zoom);
      ctx.closePath();
      ctx.fill();
    } else if (tower.level === 3) {
      // ========== LEVEL 3: Gothic Fortress War Train ==========
      const cabPos = isoOffset(trainX, trainY, 9);
      const locoPos = isoOffset(trainX, trainY, 0);
      const fortressPos = isoOffset(trainX, trainY, -9);
      const wheelY = trainY + 4.5 * zoom;

      // --- Heavy iron chassis frame ---
      const chassisL = isoOffset(trainX, trainY + 2 * zoom, 15);
      const chassisR = isoOffset(trainX, trainY + 2 * zoom, -15);
      ctx.fillStyle = "#2a2e35";
      ctx.beginPath();
      ctx.moveTo(chassisL.x, chassisL.y);
      ctx.lineTo(chassisL.x, chassisL.y + 2.5 * zoom);
      ctx.lineTo(chassisR.x, chassisR.y + 2.5 * zoom);
      ctx.lineTo(chassisR.x, chassisR.y);
      ctx.closePath();
      ctx.fill();

      // Coil spring suspension
      const springPositions = [13, 4, -4, -13];
      for (const sp of springPositions) {
        const sPos = isoOffset(trainX, wheelY - 5 * zoom, sp);
        ctx.strokeStyle = "#5a6070";
        ctx.lineWidth = 1.5 * zoom;
        for (let si = 0; si < 5; si++) {
          const sy = sPos.y + si * 1 * zoom;
          ctx.beginPath();
          ctx.moveTo(sPos.x - 1.5 * zoom, sy);
          ctx.lineTo(sPos.x + 1.5 * zoom, sy + 0.5 * zoom);
          ctx.moveTo(sPos.x + 1.5 * zoom, sy + 0.5 * zoom);
          ctx.lineTo(sPos.x - 1.5 * zoom, sy + 1 * zoom);
          ctx.stroke();
        }
      }

      // Heavy drive wheels
      drawWheel(
        isoOffset(trainX, wheelY, 13).x,
        isoOffset(trainX, wheelY, 13).y,
        5,
        "#4a5060",
        "#2a2e35",
        "#5a6070",
      );
      drawWheel(
        isoOffset(trainX, wheelY, 4).x,
        isoOffset(trainX, wheelY, 4).y,
        5,
        "#4a5060",
        "#2a2e35",
        "#5a6070",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -4).x,
        isoOffset(trainX, wheelY, -4).y,
        5,
        "#4a5060",
        "#2a2e35",
        "#5a6070",
      );
      drawWheel(
        isoOffset(trainX, wheelY, -13).x,
        isoOffset(trainX, wheelY, -13).y,
        5,
        "#4a5060",
        "#2a2e35",
        "#5a6070",
      );
      drawConnectingRods([13, 4, -4, -13], trainX, wheelY, "#5a6070");

      // === CAB: Fortress command car with battlement crown ===
      // Angled prow/ram
      const prowPos = isoOffset(cabPos.x, cabPos.y, 8);
      const prowGrad = ctx.createLinearGradient(
        prowPos.x - 3 * zoom,
        prowPos.y,
        prowPos.x + 3 * zoom,
        prowPos.y,
      );
      prowGrad.addColorStop(0, "#3a4050");
      prowGrad.addColorStop(0.5, "#5a6070");
      prowGrad.addColorStop(1, "#2a3040");
      ctx.fillStyle = prowGrad;
      ctx.beginPath();
      ctx.moveTo(prowPos.x + 4 * zoom, prowPos.y);
      ctx.lineTo(prowPos.x, prowPos.y - 12 * zoom);
      ctx.lineTo(prowPos.x - 4 * zoom, prowPos.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5a6070";
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();

      // Main armored cab body
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        13,
        12,
        18,
        { top: "#4a5060", left: "#3a4050", right: "#2a3040" },
        zoom,
      );

      // Riveted armor plates
      ctx.fillStyle = "#6a7080";
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
          ctx.beginPath();
          ctx.arc(
            cabPos.x + (3 + col * 2.5) * zoom,
            cabPos.y - (4 + row * 4) * zoom + col * 0.6 * zoom,
            0.7 * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            cabPos.x - (3 + col * 2.5) * zoom,
            cabPos.y - (4 + row * 4) * zoom + col * 0.6 * zoom,
            0.7 * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }

      // Fire-glow arrow slit on right face
      const slitCx = cabPos.x + 3 * zoom;
      const slitCy = cabPos.y - 11 * zoom;
      ctx.fillStyle = "rgba(255, 120, 20, 0.8)";
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.moveTo(slitCx, slitCy - 2.5 * zoom);
      ctx.lineTo(slitCx + 3.5 * zoom, slitCy - 2.5 * zoom - 1.8 * zoom);
      ctx.lineTo(slitCx + 3.5 * zoom, slitCy + 0.5 * zoom - 1.8 * zoom);
      ctx.lineTo(slitCx, slitCy + 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crenellated battlements with 3D depth
      for (let i = 0; i < 4; i++) {
        const bPos = isoOffset(cabPos.x, cabPos.y - 18 * zoom, -5 + i * 3.3);
        drawIsometricPrism(
          ctx,
          bPos.x,
          bPos.y,
          3,
          3,
          4,
          { top: "#5a6070", left: "#4a5060", right: "#3a4050" },
          zoom,
        );
      }

      // Commander's lookout tower — 3D multi-facet cylinder with periscope
      const periPos = isoOffset(cabPos.x, cabPos.y - 22 * zoom, 0);
      const lookR = 2.2 * zoom;
      const lookH = 6 * zoom;
      const lookER = lookR * 0.55;

      // Base ring — recessed mounting
      ctx.fillStyle = "#3a4050";
      ctx.beginPath();
      ctx.ellipse(
        periPos.x,
        periPos.y + 0.5 * zoom,
        lookER + 1 * zoom,
        lookR + 1 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Cylinder body — 10-facet with per-facet lighting
      const lookFacets = 10;
      const bkPtsL: { x: number; y: number }[] = [];
      const ftPtsL: { x: number; y: number }[] = [];
      for (let i = 0; i <= lookFacets; i++) {
        const a = Math.PI + (i / lookFacets) * Math.PI;
        const fy = Math.sin(a) * lookR;
        const fx = Math.cos(a) * lookER;
        bkPtsL.push({ x: periPos.x + fx, y: periPos.y + fy });
        ftPtsL.push({ x: periPos.x + fx, y: periPos.y - lookH + fy });
      }

      for (let i = 0; i < lookFacets; i++) {
        const midAngle = Math.PI + ((i + 0.5) / lookFacets) * Math.PI;
        const normalUp = -Math.sin(midAngle);

        ctx.fillStyle = "#3a4050";
        ctx.beginPath();
        ctx.moveTo(bkPtsL[i].x, bkPtsL[i].y);
        ctx.lineTo(bkPtsL[i + 1].x, bkPtsL[i + 1].y);
        ctx.lineTo(ftPtsL[i + 1].x, ftPtsL[i + 1].y);
        ctx.lineTo(ftPtsL[i].x, ftPtsL[i].y);
        ctx.closePath();
        ctx.fill();

        if (normalUp > 0) {
          ctx.fillStyle = `rgba(255,255,255,${normalUp * 0.22})`;
        } else {
          ctx.fillStyle = `rgba(0,0,0,${-normalUp * 0.28})`;
        }
        ctx.fill();
      }

      // Specular highlight streak
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.moveTo(periPos.x - lookER * 0.2, periPos.y - lookR);
      ctx.lineTo(periPos.x - lookER * 0.2, periPos.y - lookH - lookR);
      ctx.lineTo(periPos.x + lookER * 0.2, periPos.y - lookH - lookR * 0.3);
      ctx.lineTo(periPos.x + lookER * 0.2, periPos.y - lookR * 0.3);
      ctx.closePath();
      ctx.fill();

      // Steel bands on cylinder
      for (let bi = 0; bi < 2; bi++) {
        const bandY = periPos.y - (2 + bi * 3) * zoom;
        ctx.strokeStyle = "#5a6070";
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.ellipse(periPos.x, bandY, lookER, lookR, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          periPos.x,
          bandY - 0.4 * zoom,
          lookER * 0.95,
          lookR * 0.95,
          0,
          Math.PI * 1.2,
          Math.PI * 1.8,
        );
        ctx.stroke();
      }

      // Top cap with radial gradient
      const lookCapGrad = ctx.createRadialGradient(
        periPos.x - lookER * 0.2,
        periPos.y - lookH - lookR * 0.2,
        0,
        periPos.x,
        periPos.y - lookH,
        lookR,
      );
      lookCapGrad.addColorStop(0, "#5a6070");
      lookCapGrad.addColorStop(0.6, "#4a5060");
      lookCapGrad.addColorStop(1, "#2a3040");
      ctx.fillStyle = lookCapGrad;
      ctx.beginPath();
      ctx.ellipse(
        periPos.x,
        periPos.y - lookH,
        lookER,
        lookR,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Periscope housing on top
      const pScopeX = periPos.x + 0.5 * zoom;
      const pScopeY = periPos.y - lookH - lookR * 0.3;
      ctx.fillStyle = "#2a3040";
      ctx.beginPath();
      ctx.moveTo(pScopeX - 0.8 * zoom, pScopeY);
      ctx.lineTo(pScopeX - 0.8 * zoom, pScopeY - 3 * zoom);
      ctx.lineTo(pScopeX + 0.8 * zoom, pScopeY - 3 * zoom);
      ctx.lineTo(pScopeX + 0.8 * zoom, pScopeY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4a5060";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Periscope viewport lens
      ctx.fillStyle = "#0a1020";
      ctx.beginPath();
      ctx.ellipse(
        pScopeX,
        pScopeY - 3 * zoom,
        1 * zoom,
        0.6 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      const pScopeGlow = 0.4 + Math.sin(time * 2.5) * 0.15;
      ctx.fillStyle = `rgba(153, 204, 255, ${pScopeGlow})`;
      ctx.shadowColor = "#99ccff";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        pScopeX,
        pScopeY - 3 * zoom,
        0.7 * zoom,
        0.4 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Observation slit on cylinder face
      ctx.fillStyle = "#0a0e14";
      ctx.beginPath();
      ctx.moveTo(periPos.x + lookER * 0.6, periPos.y - 2 * zoom);
      ctx.lineTo(periPos.x + lookER * 1.1, periPos.y - 2.5 * zoom);
      ctx.lineTo(periPos.x + lookER * 1.1, periPos.y - 4.5 * zoom);
      ctx.lineTo(periPos.x + lookER * 0.6, periPos.y - 4 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = `rgba(153, 204, 255, ${pScopeGlow * 0.5})`;
      ctx.fill();

      // === LOCOMOTIVE (middle) - War engine ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        15,
        13,
        15,
        { top: "#4a5060", left: "#3a4050", right: "#2a3040" },
        zoom,
      );

      // Armor plate welded seams on left face
      ctx.strokeStyle = "#5a6070";
      ctx.lineWidth = 0.9 * zoom;
      for (let ps = 0; ps < 3; ps++) {
        const psY = locoPos.y - (3 + ps * 4.5) * zoom;
        const psL = isoOffset(locoPos.x, psY, -7.5);
        const psR = isoOffset(locoPos.x, psY, 0);
        ctx.beginPath();
        ctx.moveTo(psL.x - 7.5 * zoom, psL.y);
        ctx.lineTo(psR.x - 7.5 * zoom, psR.y);
        ctx.stroke();
        // Welded seam highlight
        ctx.strokeStyle = "rgba(100,110,130,0.35)";
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(psL.x - 7.5 * zoom, psL.y - 0.5 * zoom);
        ctx.lineTo(psR.x - 7.5 * zoom, psR.y - 0.5 * zoom);
        ctx.stroke();
        ctx.strokeStyle = "#5a6070";
        ctx.lineWidth = 0.9 * zoom;
      }

      // Armor plate seams on right face
      for (let ps = 0; ps < 3; ps++) {
        const psY = locoPos.y - (3 + ps * 4.5) * zoom;
        ctx.beginPath();
        ctx.moveTo(locoPos.x + 1 * zoom, psY);
        ctx.lineTo(locoPos.x + 7.5 * zoom, psY - 3.5 * zoom);
        ctx.stroke();
      }

      // Rivet strips along top and bottom edges
      ctx.fillStyle = "#6a7080";
      for (let ri = 0; ri < 8; ri++) {
        const riOff = -6 + ri * 1.8;
        const riPosL = isoOffset(locoPos.x, locoPos.y - 1.5 * zoom, riOff);
        ctx.beginPath();
        ctx.arc(riPosL.x - 7.5 * zoom, riPosL.y, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
        const riPosT = isoOffset(locoPos.x, locoPos.y - 14 * zoom, riOff);
        ctx.beginPath();
        ctx.arc(riPosT.x - 7.5 * zoom, riPosT.y, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      // Right face rivet strip
      for (let ri = 0; ri < 5; ri++) {
        const rrx = locoPos.x + (1.5 + ri * 1.5) * zoom;
        const rry = locoPos.y - (2 + ri * 0.75) * zoom;
        ctx.beginPath();
        ctx.arc(rrx, rry, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rrx, rry - 12 * zoom, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Industrial exhaust vents on left face
      for (let vi = 0; vi < 2; vi++) {
        const ventPos = isoOffset(
          locoPos.x,
          locoPos.y - (5 + vi * 5) * zoom,
          -6,
        );
        const ventX = ventPos.x - 6 * zoom;
        const ventY = ventPos.y;
        const ventW = 2.5 * zoom;
        const ventH = 1.8 * zoom;

        // Vent recess
        ctx.fillStyle = "#1a2030";
        ctx.fillRect(ventX - ventW * 0.5, ventY - ventH * 0.5, ventW, ventH);

        // Louvered slats
        ctx.strokeStyle = "#4a5060";
        ctx.lineWidth = 0.6 * zoom;
        for (let si = 0; si < 3; si++) {
          const sy = ventY - ventH * 0.35 + si * ventH * 0.35;
          ctx.beginPath();
          ctx.moveTo(ventX - ventW * 0.4, sy);
          ctx.lineTo(ventX + ventW * 0.4, sy);
          ctx.stroke();
        }

        // Inner warm glow
        ctx.fillStyle = `rgba(255, 120, 40, ${0.2 + Math.sin(time * 3 + vi) * 0.1})`;
        ctx.fillRect(
          ventX - ventW * 0.35,
          ventY - ventH * 0.35,
          ventW * 0.7,
          ventH * 0.7,
        );

        // Vent frame
        ctx.strokeStyle = "#5a6070";
        ctx.lineWidth = 0.8 * zoom;
        ctx.strokeRect(ventX - ventW * 0.5, ventY - ventH * 0.5, ventW, ventH);
      }

      // Side-mounted war lanterns on brackets
      for (const side of [1, -1]) {
        const lanternPos = isoOffset(locoPos.x, locoPos.y - 9 * zoom, side * 7);
        ctx.strokeStyle = "#4a5060";
        ctx.lineWidth = 2.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(locoPos.x + side * 6 * zoom, locoPos.y - 9 * zoom);
        ctx.lineTo(lanternPos.x + side * 1 * zoom, lanternPos.y);
        ctx.stroke();
        ctx.fillStyle = "#4a5060";
        ctx.beginPath();
        for (let hi = 0; hi < 6; hi++) {
          const ha = (hi / 6) * Math.PI * 2;
          ctx.lineTo(
            lanternPos.x + side * 1 * zoom + Math.cos(ha) * 2.2 * zoom,
            lanternPos.y + Math.sin(ha) * 2.2 * zoom,
          );
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255, 180, 60, 0.9)";
        ctx.shadowColor = "#ffa030";
        ctx.shadowBlur = 8 * zoom;
        ctx.beginPath();
        ctx.arc(
          lanternPos.x + side * 1 * zoom,
          lanternPos.y,
          1.6 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Siege observation tower with arrow slits
      const towerPos = isoOffset(locoPos.x, locoPos.y - 15 * zoom, -2);
      drawIsometricPrism(
        ctx,
        towerPos.x,
        towerPos.y,
        8,
        8,
        16,
        { top: "#5a6070", left: "#4a5060", right: "#3a4050" },
        zoom,
      );

      // Arrow slits on tower with fire glow
      for (const side of [1, -1]) {
        const tSlitPos = {
          x: towerPos.x + side * 2.5 * zoom,
          y: towerPos.y - 8 * zoom,
        };
        ctx.fillStyle = "rgba(255, 120, 20, 0.65)";
        ctx.shadowColor = "#ff6600";
        ctx.shadowBlur = 4 * zoom;
        ctx.beginPath();
        ctx.moveTo(tSlitPos.x, tSlitPos.y - 2.5 * zoom);
        ctx.lineTo(tSlitPos.x + side * 2.5 * zoom, tSlitPos.y - 3 * zoom);
        ctx.lineTo(tSlitPos.x + side * 2.5 * zoom, tSlitPos.y + 0.5 * zoom);
        ctx.lineTo(tSlitPos.x, tSlitPos.y + 1 * zoom);
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Tower battlements
      for (let i = 0; i < 3; i++) {
        const tbPos = isoOffset(towerPos.x, towerPos.y - 16 * zoom, -3 + i * 3);
        drawIsometricPrism(
          ctx,
          tbPos.x,
          tbPos.y,
          2.5,
          2.5,
          3.5,
          { top: "#6a7080", left: "#4a5060", right: "#3a4050" },
          zoom,
        );
      }

      // Signal flag on tower (3D isometric, animated)
      const flagPole = { x: towerPos.x, y: towerPos.y - 19.5 * zoom };
      ctx.strokeStyle = "#2a3040";
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(flagPole.x, flagPole.y + 3.5 * zoom);
      ctx.lineTo(flagPole.x, flagPole.y - 6 * zoom);
      ctx.stroke();
      ctx.fillStyle = "#5a6070";
      ctx.beginPath();
      ctx.arc(flagPole.x, flagPole.y - 6 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      const flagWave = Math.sin(time * 3) * 0.6;
      ctx.fillStyle = "#c04000";
      ctx.beginPath();
      ctx.moveTo(flagPole.x + 1 * zoom, flagPole.y - 5 * zoom - 0.5 * zoom);
      ctx.quadraticCurveTo(
        flagPole.x + 3.5 * zoom + 1 * zoom,
        flagPole.y - 4 * zoom + flagWave * zoom - 0.5 * zoom,
        flagPole.x + 6 * zoom + 1 * zoom,
        flagPole.y - 3.5 * zoom + flagWave * zoom - 0.5 * zoom,
      );
      ctx.lineTo(flagPole.x + 1 * zoom, flagPole.y - 1.5 * zoom - 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#E77500";
      ctx.beginPath();
      ctx.moveTo(flagPole.x, flagPole.y - 5 * zoom);
      ctx.quadraticCurveTo(
        flagPole.x + 3.5 * zoom,
        flagPole.y - 4 * zoom + flagWave * zoom,
        flagPole.x + 6 * zoom,
        flagPole.y - 3.5 * zoom + flagWave * zoom,
      );
      ctx.lineTo(flagPole.x, flagPole.y - 1.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // Heavy smokestack with spark catcher dome
      const stackPos = isoOffset(locoPos.x, locoPos.y - 15 * zoom, 4.5);
      drawIsometricPrism(
        ctx,
        stackPos.x,
        stackPos.y,
        5.5,
        5.5,
        12,
        { top: "#2a3040", left: "#1a2030", right: "#101520" },
        zoom,
      );
      drawIsometricPrism(
        ctx,
        stackPos.x,
        stackPos.y - 12 * zoom,
        7.5,
        7.5,
        2.5,
        { top: "#3a4050", left: "#2a3040", right: "#1a2030" },
        zoom,
      );
      // Spark catcher mesh dome — isometric elliptical
      ctx.fillStyle = "rgba(70, 80, 90, 0.6)";
      ctx.beginPath();
      ctx.ellipse(stackPos.x, stackPos.y - 15.5 * zoom, 3.5 * zoom * ISO_SIN, 3.5 * zoom, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#5a6070";
      ctx.lineWidth = 0.7 * zoom;
      for (let mi = 0; mi < 5; mi++) {
        const meshAngle = (mi / 5) * Math.PI;
        const meshRx = 3.5 * zoom * ISO_SIN;
        ctx.beginPath();
        ctx.moveTo(
          stackPos.x - meshRx * Math.cos(meshAngle),
          stackPos.y - 15.5 * zoom,
        );
        ctx.quadraticCurveTo(
          stackPos.x,
          stackPos.y - 19 * zoom,
          stackPos.x + meshRx * Math.cos(Math.PI - meshAngle),
          stackPos.y - 15.5 * zoom,
        );
        ctx.stroke();
      }

      // Multi-layer war engine smoke plume with gradient opacity
      for (let puff = 0; puff < 6; puff++) {
        const puffAge = (time * 1.5 + puff * 1.4) % 5;
        const puffY = stackPos.y - 17 * zoom - puffAge * 5 * zoom;
        const puffX =
          stackPos.x +
          Math.sin(time * 1.8 + puff * 0.9) * (3 + puff * 1.5) * zoom;
        const puffR = (3.5 + puff * 2 + puffAge * 1.5) * zoom;
        const puffA = Math.max(0, 0.5 - puffAge * 0.1);
        const puffGrad = ctx.createRadialGradient(
          puffX,
          puffY,
          0,
          puffX,
          puffY,
          puffR,
        );
        puffGrad.addColorStop(0, `rgba(140, 140, 155, ${puffA})`);
        puffGrad.addColorStop(0.4, `rgba(120, 120, 135, ${puffA * 0.7})`);
        puffGrad.addColorStop(0.7, `rgba(100, 100, 115, ${puffA * 0.4})`);
        puffGrad.addColorStop(1, `rgba(80, 80, 95, 0)`);
        ctx.fillStyle = puffGrad;
        ctx.beginPath();
        ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
        ctx.fill();
      }

      // War embers and sparks rising from stack
      for (let em = 0; em < 5; em++) {
        const emAge = (time * 3.5 + em * 1.6) % 3.5;
        const emX = stackPos.x + Math.sin(time * 4.5 + em * 2) * 4 * zoom;
        const emY = stackPos.y - 17 * zoom - emAge * 7 * zoom;
        const emA = Math.max(0, 0.8 - emAge * 0.25);
        const emR = (0.7 + Math.sin(time * 8 + em) * 0.3) * zoom;
        ctx.fillStyle = `rgba(255, ${110 + em * 25}, 20, ${emA})`;
        ctx.shadowColor = `rgba(255, ${110 + em * 25}, 20, ${emA * 0.4})`;
        ctx.shadowBlur = 3 * zoom;
        ctx.beginPath();
        ctx.arc(emX, emY, emR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Side steam pipe with vent
      const pipeR = isoOffset(locoPos.x, locoPos.y - 4 * zoom, 8);
      ctx.strokeStyle = "#3a4050";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(pipeR.x, pipeR.y);
      ctx.lineTo(pipeR.x + 2.5 * zoom, pipeR.y - 1 * zoom);
      ctx.stroke();
      const pipeSteam = 0.25 + Math.sin(time * 5 + 1) * 0.15;
      ctx.fillStyle = `rgba(180, 185, 190, ${pipeSteam})`;
      ctx.beginPath();
      ctx.arc(
        pipeR.x + 4 * zoom,
        pipeR.y - 1.5 * zoom,
        2.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // === FORTRESS CAR (back) ===
      drawIsometricPrism(
        ctx,
        fortressPos.x,
        fortressPos.y,
        15,
        13,
        13,
        { top: "#5a6070", left: "#4a5060", right: "#3a4050" },
        zoom,
      );

      // Heavier battlements: 5 merlons
      for (let i = 0; i < 5; i++) {
        const bPos = isoOffset(
          fortressPos.x,
          fortressPos.y - 13 * zoom,
          -6 + i * 3,
        );
        drawIsometricPrism(
          ctx,
          bPos.x,
          bPos.y,
          2.5,
          2.5,
          4.5,
          { top: "#6a7080", left: "#4a5060", right: "#3a4050" },
          zoom,
        );
      }

      // Portcullis gate (isometric grid on right face)
      const portX = fortressPos.x + 2 * zoom;
      const portY = fortressPos.y - 3.5 * zoom;
      ctx.fillStyle = "#1a2030";
      ctx.beginPath();
      ctx.moveTo(portX, portY - 7 * zoom);
      ctx.lineTo(portX + 5 * zoom, portY - 7 * zoom - 2.5 * zoom);
      ctx.lineTo(portX + 5 * zoom, portY - 2.5 * zoom);
      ctx.lineTo(portX, portY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4a5060";
      ctx.lineWidth = 0.8 * zoom;
      for (let gi = 0; gi < 5; gi++) {
        const gy = portY - gi * 1.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(portX + 0.3 * zoom, gy);
        ctx.lineTo(portX + 4.7 * zoom, gy - 2.3 * zoom);
        ctx.stroke();
      }
      for (let gi = 0; gi < 4; gi++) {
        const gx = portX + (gi + 1) * 1.1 * zoom;
        ctx.beginPath();
        ctx.moveTo(gx, portY - 7 * zoom - (gi + 1) * 0.55 * zoom);
        ctx.lineTo(gx, portY - (gi + 1) * 0.55 * zoom);
        ctx.stroke();
      }

      // Rose window with stained glass effect (fiery orange)
      const roseGlow = 0.65 + Math.sin(time * 2) * 0.25;
      const rosePos = isoOffset(
        fortressPos.x,
        fortressPos.y - 7.5 * zoom,
        -5.5,
      );
      ctx.fillStyle = "#3a4050";
      ctx.beginPath();
      ctx.arc(rosePos.x, rosePos.y, 4.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 108, 0, ${roseGlow})`;
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 12 * zoom;
      ctx.beginPath();
      ctx.arc(rosePos.x, rosePos.y, 4 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(180, 60, 0, 0.5)";
      ctx.lineWidth = 0.8 * zoom;
      for (let pi = 0; pi < 8; pi++) {
        const pAngle = (pi / 8) * Math.PI * 2;
        const px = rosePos.x + Math.cos(pAngle) * 1.8 * zoom;
        const py = rosePos.y + Math.sin(pAngle) * 1.8 * zoom;
        ctx.beginPath();
        ctx.arc(px, py, 1.5 * zoom, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#fff4e0";
      ctx.beginPath();
      ctx.arc(rosePos.x, rosePos.y, 0.9 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // War banner on fortress car (3D isometric)
      const bannerPole = isoOffset(
        fortressPos.x,
        fortressPos.y - 13 * zoom,
        -7,
      );
      ctx.strokeStyle = "#3a4050";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(bannerPole.x, bannerPole.y);
      ctx.lineTo(bannerPole.x, bannerPole.y - 10 * zoom);
      ctx.stroke();
      ctx.fillStyle = "#6a7080";
      ctx.beginPath();
      ctx.arc(
        bannerPole.x,
        bannerPole.y - 10 * zoom,
        1.3 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      const bFlagWave = Math.sin(time * 2.5 + 0.5) * 0.6;
      ctx.fillStyle = "#c04000";
      ctx.beginPath();
      ctx.moveTo(bannerPole.x - 1 * zoom, bannerPole.y - 9 * zoom + 0.5 * zoom);
      ctx.quadraticCurveTo(
        bannerPole.x - 4 * zoom - 1 * zoom,
        bannerPole.y - 8 * zoom + bFlagWave * zoom + 0.5 * zoom,
        bannerPole.x - 6 * zoom - 1 * zoom,
        bannerPole.y - 7 * zoom + bFlagWave * zoom + 0.5 * zoom,
      );
      ctx.lineTo(
        bannerPole.x - 1 * zoom,
        bannerPole.y - 5.5 * zoom + 0.5 * zoom,
      );
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#E77500";
      ctx.beginPath();
      ctx.moveTo(bannerPole.x, bannerPole.y - 9 * zoom);
      ctx.quadraticCurveTo(
        bannerPole.x - 4 * zoom,
        bannerPole.y - 8 * zoom + bFlagWave * zoom,
        bannerPole.x - 6 * zoom,
        bannerPole.y - 7 * zoom + bFlagWave * zoom,
      );
      ctx.lineTo(bannerPole.x, bannerPole.y - 5.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // Murder holes
      for (let mhi = 0; mhi < 4; mhi++) {
        const mhPos = isoOffset(
          fortressPos.x,
          fortressPos.y + 1 * zoom,
          -4 + mhi * 2.5,
        );
        ctx.fillStyle = "#0a0e14";
        ctx.beginPath();
        ctx.arc(mhPos.x, mhPos.y, 0.9 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Heavy chains between cars
      ctx.strokeStyle = "#4a5060";
      ctx.lineWidth = 2 * zoom;
      for (const cOff of [5, -5]) {
        const ca = isoOffset(trainX, trainY - 2 * zoom, cOff);
        const cb = isoOffset(
          trainX,
          trainY - 2 * zoom,
          cOff > 0 ? cOff - 1 : cOff + 1,
        );
        ctx.beginPath();
        ctx.moveTo(ca.x, ca.y);
        ctx.quadraticCurveTo(
          (ca.x + cb.x) / 2,
          (ca.y + cb.y) / 2 + 2.5 * zoom,
          cb.x,
          cb.y,
        );
        ctx.stroke();
      }

      // Front assembly: fortress bumper, battering ram, headlight flush with cab
      drawTrainFront(cabPos.x, cabPos.y, 13, 12, 18,
        "#3a4050", "#1a2030", "#5a6070",
        "#3a4050", "#3a4050",
        0.75 + Math.sin(time * 3) * 0.2, 1.15, 3);

      // Princeton orange stripe
      const stripeY = trainY - 2 * zoom;
      const stripeH = 4 * zoom;
      const stL = isoOffset(trainX, stripeY, -9);
      const stR = isoOffset(trainX, stripeY, 9);
      ctx.fillStyle = "#E77500";
      ctx.shadowColor = "rgba(231, 117, 0, 0.3)";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#FF8C1A";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 1 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 1 * zoom);
      ctx.closePath();
      ctx.fill();
    } else if (tower.level === 4 && tower.upgrade === "A") {
      // ========== LEVEL 4A: Royal Marble Palace Train ==========
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 6 * zoom;

      const cabPos = isoOffset(trainX, trainY, 8);
      const locoPos = isoOffset(trainX, trainY, 0);
      const passengerPos = isoOffset(trainX, trainY, -8);
      const wheelY = trainY + 4.5 * zoom;

      // Ornate gold-trimmed chassis — isometric beam
      drawIsometricPrism(ctx, trainX, trainY + 3 * zoom, 26, 5, 2,
        { top: "#F0ECE4", left: "#E0DCD0", right: "#D0CCC0" }, zoom);
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1.5 * zoom;
      const chL4a = isoOffset(trainX, trainY + 2 * zoom, 13);
      const chR4a = isoOffset(trainX, trainY + 2 * zoom, -13);
      ctx.beginPath();
      ctx.moveTo(chL4a.x, chL4a.y);
      ctx.lineTo(chR4a.x, chR4a.y);
      ctx.stroke();
      // Decorative scrollwork arcs on right face
      ctx.lineWidth = 1 * zoom;
      for (let sci = 0; sci < 4; sci++) {
        const scPos = isoOffset(trainX, trainY + 2.5 * zoom, -7 + sci * 5);
        ctx.beginPath();
        ctx.ellipse(scPos.x, scPos.y + 1 * zoom, 1.5 * zoom * ISO_SIN, 1.5 * zoom, 0, 0, Math.PI);
        ctx.stroke();
      }

      // Gold wheels with ornate spokes
      const wPositions4a = [11, 4, -4, -11];
      for (const wp of wPositions4a) {
        const wPos = isoOffset(trainX, wheelY, wp);
        drawWheel(wPos.x, wPos.y, 4.5, "#C9A227", "#B8860B", "#E8C847");
      }
      drawConnectingRods(wPositions4a, trainX, wheelY, "#B8860B");

      // === CAB (front) - Marble palace with dome ===
      ctx.shadowBlur = 7 * zoom;
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        11,
        11,
        14,
        { top: "#FAFAF5", left: "#F0ECE4", right: "#E0DCD0" },
        zoom,
      );

      // Gold trim on all cab edges
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1.8 * zoom;
      const cabW4a = 11 * zoom * 0.5;
      const cabH4a = 14 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x + cabW4a, cabPos.y);
      ctx.lineTo(cabPos.x + cabW4a, cabPos.y - cabH4a);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x - cabW4a, cabPos.y);
      ctx.lineTo(cabPos.x - cabW4a, cabPos.y - cabH4a);
      ctx.stroke();

      // Isometric dome roof — proper 3D dome with left/right face shading
      {
        const dBaseY = cabPos.y - 14 * zoom;
        const dPeakY = cabPos.y - 21 * zoom;
        const dRx = 6.5 * zoom;
        const dRy = dRx * ISO_SIN;

        // Right face (darker)
        ctx.fillStyle = "#D8D4CC";
        ctx.beginPath();
        ctx.moveTo(cabPos.x, dBaseY + dRy);
        ctx.quadraticCurveTo(cabPos.x + dRx * 0.95, dBaseY - (dPeakY - dBaseY) * 0.2, cabPos.x + dRx * 0.15, dPeakY);
        ctx.lineTo(cabPos.x, dPeakY + 0.5 * zoom);
        ctx.closePath();
        ctx.fill();

        // Left face (lighter)
        ctx.fillStyle = "#F0ECE4";
        ctx.beginPath();
        ctx.moveTo(cabPos.x, dBaseY + dRy);
        ctx.quadraticCurveTo(cabPos.x - dRx * 0.95, dBaseY - (dPeakY - dBaseY) * 0.2, cabPos.x - dRx * 0.15, dPeakY);
        ctx.lineTo(cabPos.x, dPeakY + 0.5 * zoom);
        ctx.closePath();
        ctx.fill();

        // Back face (just above the top of the prism)
        ctx.fillStyle = "#E8E4DC";
        ctx.beginPath();
        ctx.moveTo(cabPos.x - dRx, dBaseY);
        ctx.quadraticCurveTo(cabPos.x, dBaseY - dRy * 1.5, cabPos.x + dRx, dBaseY);
        ctx.lineTo(cabPos.x, dBaseY + dRy);
        ctx.closePath();
        ctx.fill();

        // Gold trim at dome base
        ctx.strokeStyle = "#C9A227";
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.ellipse(cabPos.x, dBaseY, dRx, dRy, 0, 0, Math.PI);
        ctx.stroke();

        // Gold filigree arcs on dome
        ctx.strokeStyle = "rgba(201, 162, 39, 0.45)";
        ctx.lineWidth = 0.7 * zoom;
        for (let fi = 1; fi <= 3; fi++) {
          const t = fi / 4;
          const arcY = dBaseY + (dPeakY - dBaseY) * t;
          const arcRx = dRx * (1 - t * 0.85);
          const arcRy = dRy * (1 - t * 0.85);
          ctx.beginPath();
          ctx.ellipse(cabPos.x, arcY, arcRx, arcRy, 0, Math.PI * 0.1, Math.PI * 0.9);
          ctx.stroke();
        }
      }

      // Pointed finial spire with gold ball
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x, cabPos.y - 21 * zoom);
      ctx.lineTo(cabPos.x, cabPos.y - 25 * zoom);
      ctx.stroke();
      ctx.fillStyle = "#C9A227";
      ctx.shadowColor = "#C9A227";
      ctx.shadowBlur = 6 * zoom;
      ctx.beginPath();
      ctx.arc(cabPos.x, cabPos.y - 25.5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Arched windows — isometric gothic flush with cab faces
      {
        const cabGlow = 0.55 + Math.sin(time * 2) * 0.18;
        // Right face window
        drawIsoGothicWindow(ctx,
          cabPos.x + 3 * zoom, cabPos.y - 7.5 * zoom,
          4, 6.5, "right", zoom,
          "rgba(255, 250, 230", cabGlow,
          { frame: "#C0A060", void: "#2a1808", sill: "#C9A227" });
        // Left face window
        drawIsoGothicWindow(ctx,
          cabPos.x - 3 * zoom, cabPos.y - 7.5 * zoom,
          4, 6.5, "left", zoom,
          "rgba(255, 250, 230", cabGlow,
          { frame: "#C0A060", void: "#2a1808", sill: "#C9A227" });
      }

      // Balcony railing with balusters
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 0.8 * zoom;
      const balWinR = { x: cabPos.x + 3 * zoom, y: cabPos.y - 4 * zoom };
      for (let bi = 0; bi < 4; bi++) {
        const bx = balWinR.x - 2.5 * zoom + bi * 1.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(bx, balWinR.y + 0.5 * zoom);
        ctx.lineTo(bx, balWinR.y + 2.5 * zoom);
        ctx.stroke();
      }
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(balWinR.x - 2.5 * zoom, balWinR.y + 0.5 * zoom);
      ctx.lineTo(balWinR.x + 2.5 * zoom, balWinR.y + 0.5 * zoom);
      ctx.stroke();

      // Decorative scrollwork cornices
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 0.8 * zoom;
      for (const side of [1, -1]) {
        ctx.beginPath();
        ctx.moveTo(cabPos.x + side * 1.5 * zoom, cabPos.y - 12.5 * zoom);
        ctx.quadraticCurveTo(
          cabPos.x + side * 3.5 * zoom,
          cabPos.y - 13.5 * zoom,
          cabPos.x + side * 5 * zoom,
          cabPos.y - 12.5 * zoom,
        );
        ctx.stroke();
      }

      // === LOCOMOTIVE (middle) - Marble and gold ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        13,
        11,
        13,
        { top: "#F8F4EC", left: "#E8E4DC", right: "#D8D4CC" },
        zoom,
      );

      // Wide ornate gold bands
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 3.5 * zoom;
      for (let bi = 0; bi < 2; bi++) {
        const bandY = locoPos.y - 4.5 * zoom - bi * 5.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(locoPos.x - 6 * zoom, bandY + 3 * zoom);
        ctx.lineTo(locoPos.x + 6 * zoom, bandY - 3 * zoom);
        ctx.stroke();
      }

      // Isometric dome on locomotive
      {
        const ldBaseY = locoPos.y - 14.5 * zoom;
        const ldPeakY = locoPos.y - 19.5 * zoom;
        const ldRx = 5 * zoom;
        const ldRy = ldRx * ISO_SIN;

        ctx.fillStyle = "#D0CCC4";
        ctx.beginPath();
        ctx.moveTo(locoPos.x, ldBaseY + ldRy);
        ctx.quadraticCurveTo(locoPos.x + ldRx * 0.9, ldBaseY - 2 * zoom, locoPos.x + ldRx * 0.1, ldPeakY);
        ctx.lineTo(locoPos.x, ldPeakY + 0.5 * zoom);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#F0ECE4";
        ctx.beginPath();
        ctx.moveTo(locoPos.x, ldBaseY + ldRy);
        ctx.quadraticCurveTo(locoPos.x - ldRx * 0.9, ldBaseY - 2 * zoom, locoPos.x - ldRx * 0.1, ldPeakY);
        ctx.lineTo(locoPos.x, ldPeakY + 0.5 * zoom);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#E0DCD4";
        ctx.beginPath();
        ctx.moveTo(locoPos.x - ldRx, ldBaseY);
        ctx.quadraticCurveTo(locoPos.x, ldBaseY - ldRy * 1.5, locoPos.x + ldRx, ldBaseY);
        ctx.lineTo(locoPos.x, ldBaseY + ldRy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#C9A227";
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.ellipse(locoPos.x, ldBaseY, ldRx, ldRy, 0, 0, Math.PI);
        ctx.stroke();

        // Safety valve on dome
        ctx.fillStyle = "#B8860B";
        ctx.beginPath();
        ctx.ellipse(locoPos.x + 1.5 * zoom, ldPeakY + 1 * zoom, 1.2 * zoom * ISO_SIN, 1.2 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#DAA520";
        ctx.fillRect(locoPos.x + 1 * zoom, ldPeakY - 2.5 * zoom, 1 * zoom, 2.5 * zoom);
      }

      // Isometric fluted gold smokestack
      {
        const stackPos = isoOffset(locoPos.x, locoPos.y - 13 * zoom, 3.5);
        const stRBot = 2.2 * zoom;
        const stRTop = 3 * zoom;
        const stH = 11 * zoom;
        const stErBot = stRBot * ISO_SIN;
        const stErTop = stRTop * ISO_SIN;

        // Stack body — isometric cylinder with taper
        // Right face
        ctx.fillStyle = "#B8860B";
        ctx.beginPath();
        ctx.moveTo(stackPos.x + stErBot, stackPos.y);
        ctx.lineTo(stackPos.x + stErTop, stackPos.y - stH);
        ctx.lineTo(stackPos.x, stackPos.y - stH + stRTop * ISO_SIN);
        ctx.lineTo(stackPos.x, stackPos.y + stRBot * ISO_SIN);
        ctx.closePath();
        ctx.fill();
        // Left face
        ctx.fillStyle = "#DAA520";
        ctx.beginPath();
        ctx.moveTo(stackPos.x - stErBot, stackPos.y);
        ctx.lineTo(stackPos.x - stErTop, stackPos.y - stH);
        ctx.lineTo(stackPos.x, stackPos.y - stH + stRTop * ISO_SIN);
        ctx.lineTo(stackPos.x, stackPos.y + stRBot * ISO_SIN);
        ctx.closePath();
        ctx.fill();

        // Flute lines
        ctx.strokeStyle = "#B8860B";
        ctx.lineWidth = 0.7 * zoom;
        for (let fl = -1; fl <= 1; fl++) {
          const fOff = fl * stErBot * 0.5;
          ctx.beginPath();
          ctx.moveTo(stackPos.x + fOff, stackPos.y);
          ctx.lineTo(stackPos.x + fOff * (stRTop / stRBot), stackPos.y - stH);
          ctx.stroke();
        }

        // Top cap — isometric ellipse
        ctx.fillStyle = "#C9A227";
        ctx.shadowColor = "#C9A227";
        ctx.shadowBlur = 7 * zoom;
        ctx.beginPath();
        ctx.ellipse(stackPos.x, stackPos.y - stH, stErTop * 1.3, stRTop * ISO_SIN * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Finial on top
        ctx.fillStyle = "#C9A227";
        ctx.beginPath();
        ctx.ellipse(stackPos.x, stackPos.y - stH - 2 * zoom, 1.2 * zoom * ISO_SIN, 1.2 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();

        // Golden-tinted steam
        const steam = 0.3 + Math.sin(time * 4) * 0.15;
        ctx.fillStyle = `rgba(255, 245, 220, ${steam})`;
        ctx.beginPath();
        ctx.arc(
          stackPos.x + Math.sin(time * 3) * 3,
          stackPos.y - stH - 4 * zoom,
          5.5 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = `rgba(255, 245, 220, ${steam * 0.45})`;
        ctx.beginPath();
        ctx.arc(
          stackPos.x + Math.sin(time * 3 + 1) * 4,
          stackPos.y - stH - 9 * zoom,
          4 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Isometric headlight with brass bracket
      {
        const hlPos = { x: locoPos.x + 7 * zoom, y: locoPos.y - 8.5 * zoom };
        drawIsoHeadlight(
          locoPos.x + 5.5 * zoom, locoPos.y - 8 * zoom,
          hlPos.x, hlPos.y, 3,
          "#B8860B", "#B8860B", 0.9);
      }

      // === PASSENGER CAR (back) - Royal coach ===
      drawIsometricPrism(
        ctx,
        passengerPos.x,
        passengerPos.y,
        13,
        11,
        11,
        { top: "#F0ECE4", left: "#E0DCD4", right: "#D0CCC4" },
        zoom,
      );

      // Gold columns on right face — isometric flush lines
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1.2 * zoom;
      for (let ci = 0; ci < 4; ci++) {
        const colPos = isoOffset(passengerPos.x, passengerPos.y, -3.5 + ci * 2.5);
        const colX = colPos.x + 2.5 * zoom;
        const colTopY = colPos.y - 11 * zoom;
        const slope = -ISO_Y_RATIO;
        ctx.beginPath();
        ctx.moveTo(colX, colTopY);
        ctx.lineTo(colX, colPos.y);
        ctx.stroke();
        // Capital and base — isometric flush rects
        drawIsoFlushRect(ctx, colX, colTopY + 0.6 * zoom, 2.5, 1, "right", zoom, { fill: "#C9A227" });
        drawIsoFlushRect(ctx, colX, colPos.y - 0.6 * zoom, 2, 1, "right", zoom, { fill: "#C9A227" });
      }

      // Arched windows — isometric gothic flush with right wall
      {
        const winGlow = 0.5 + Math.sin(time * 2) * 0.18;
        for (let wi = 0; wi < 3; wi++) {
          const wPos4a = isoOffset(passengerPos.x, passengerPos.y - 5.5 * zoom, -2.5 + wi * 2.5);
          const wx = wPos4a.x + 2.5 * zoom;
          const wy = wPos4a.y;
          drawIsoGothicWindow(ctx, wx, wy, 2.8, 4.5, "right", zoom,
            "rgba(255, 250, 230", winGlow,
            { frame: "#C0A060", void: "#1a1008", sill: "#C9A227" });
        }
      }

      // Decorative roof balustrade
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 0.7 * zoom;
      for (let bi = 0; bi < 6; bi++) {
        const bpPos = isoOffset(
          passengerPos.x,
          passengerPos.y - 11 * zoom,
          -5 + bi * 2,
        );
        ctx.beginPath();
        ctx.moveTo(bpPos.x + 2.5 * zoom, bpPos.y - 0.5 * zoom);
        ctx.lineTo(bpPos.x + 2.5 * zoom, bpPos.y - 3 * zoom);
        ctx.stroke();
      }
      const balL4a = isoOffset(passengerPos.x, passengerPos.y - 14 * zoom, -5);
      const balR4a = isoOffset(passengerPos.x, passengerPos.y - 14 * zoom, 5);
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(balL4a.x + 2.5 * zoom, balL4a.y);
      ctx.lineTo(balR4a.x + 2.5 * zoom, balR4a.y);
      ctx.stroke();

      // Horse/centaur emblem (gold relief)
      ctx.fillStyle = "#C9A227";
      ctx.shadowColor = "#C9A227";
      ctx.shadowBlur = 6 * zoom;
      const horsePos = isoOffset(
        passengerPos.x,
        passengerPos.y - 5.5 * zoom,
        -4.5,
      );
      ctx.beginPath();
      ctx.moveTo(horsePos.x - 1 * zoom, horsePos.y + 3 * zoom);
      ctx.lineTo(horsePos.x - 0.5 * zoom, horsePos.y + 1 * zoom);
      ctx.lineTo(horsePos.x - 1.5 * zoom, horsePos.y - 1 * zoom);
      ctx.quadraticCurveTo(
        horsePos.x - 1 * zoom,
        horsePos.y - 3.5 * zoom,
        horsePos.x,
        horsePos.y - 3 * zoom,
      );
      ctx.lineTo(horsePos.x + 0.5 * zoom, horsePos.y - 4 * zoom);
      ctx.quadraticCurveTo(
        horsePos.x + 2 * zoom,
        horsePos.y - 2.5 * zoom,
        horsePos.x + 1 * zoom,
        horsePos.y,
      );
      ctx.lineTo(horsePos.x + 1.5 * zoom, horsePos.y + 3 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gold chains between cars
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1.8 * zoom;
      for (const cOff of [4.5, -4.5]) {
        const ca = isoOffset(trainX, trainY - 2 * zoom, cOff);
        const cb = isoOffset(
          trainX,
          trainY - 2 * zoom,
          cOff > 0 ? cOff - 1 : cOff + 1,
        );
        ctx.beginPath();
        ctx.moveTo(ca.x, ca.y);
        ctx.quadraticCurveTo(
          (ca.x + cb.x) / 2,
          (ca.y + cb.y) / 2 + 1.5 * zoom,
          cb.x,
          cb.y,
        );
        ctx.stroke();
      }

      // Royal pennant flag
      const pennantPole = isoOffset(
        passengerPos.x,
        passengerPos.y - 11 * zoom,
        0,
      );
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(pennantPole.x, pennantPole.y);
      ctx.lineTo(pennantPole.x, pennantPole.y - 7 * zoom);
      ctx.stroke();
      ctx.fillStyle = "#C9A227";
      ctx.beginPath();
      ctx.arc(
        pennantPole.x,
        pennantPole.y - 7 * zoom,
        0.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      const pWave4a = Math.sin(time * 3) * 0.5;
      ctx.fillStyle = "#C9A227";
      ctx.beginPath();
      ctx.moveTo(pennantPole.x, pennantPole.y - 7 * zoom);
      ctx.lineTo(
        pennantPole.x + 3.5 * zoom,
        pennantPole.y - 5 * zoom + pWave4a * zoom,
      );
      ctx.lineTo(pennantPole.x, pennantPole.y - 3.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // Princeton orange stripe
      const stripeY = trainY - 2 * zoom;
      const stripeH = 4 * zoom;
      const stL = isoOffset(trainX, stripeY, -8);
      const stR = isoOffset(trainX, stripeY, 8);
      ctx.fillStyle = "#E77500";
      ctx.shadowColor = "rgba(231, 117, 0, 0.3)";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#FF8C1A";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 1 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 1 * zoom);
      ctx.closePath();
      ctx.fill();

      // Front assembly: ornate gold bumper, cowcatcher, headlight flush with cab
      drawTrainFront(cabPos.x, cabPos.y, 11, 11, 14,
        "#C9A227", "#B89227", "#E8C847",
        "#C9A227", "#C9A227",
        0.75 + Math.sin(time * 3) * 0.15, 1.0, 4);
    } else {
      // ========== LEVEL 4B: Dark Royal Armored War Train ==========
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 7 * zoom;

      const cabPos = isoOffset(trainX, trainY, 9);
      const locoPos = isoOffset(trainX, trainY, 0);
      const armoredPos = isoOffset(trainX, trainY, -9);
      const wheelY = trainY + 4.5 * zoom;

      // Heavy reinforced chassis — isometric beam
      drawIsometricPrism(ctx, trainX, trainY + 3 * zoom, 30, 6, 2.5,
        { top: "#3a3e45", left: "#2a2e35", right: "#1a1e25" }, zoom);
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1.2 * zoom;
      const chL4b = isoOffset(trainX, trainY + 2 * zoom, 15);
      const chR4b = isoOffset(trainX, trainY + 2 * zoom, -15);
      ctx.beginPath();
      ctx.moveTo(chL4b.x, chL4b.y);
      ctx.lineTo(chR4b.x, chR4b.y);
      ctx.stroke();

      // Dark steel wheels with gold hub caps
      const wPositions4b = [13, 4, -4, -13];
      for (const wp of wPositions4b) {
        const wPos = isoOffset(trainX, wheelY, wp);
        drawWheel(wPos.x, wPos.y, 5, "#3a4050", "#1a1e25", "#C9A227");
      }
      drawConnectingRods(wPositions4b, trainX, wheelY, "#C9A227");

      // === ARMORED CAB (front) - War command car with crown ===
      drawIsometricPrism(
        ctx,
        cabPos.x,
        cabPos.y,
        13,
        13,
        18,
        { top: "#3a4050", left: "#2a3040", right: "#1a2030" },
        zoom,
      );

      // Gold trim on all edges
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1.8 * zoom;
      const cW4b = 13 * zoom * 0.5;
      const cD4b = 13 * zoom * 0.25;
      const cH4b = 18 * zoom;
      ctx.beginPath();
      ctx.moveTo(cabPos.x, cabPos.y + cD4b);
      ctx.lineTo(cabPos.x, cabPos.y + cD4b - cH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x + cW4b, cabPos.y);
      ctx.lineTo(cabPos.x + cW4b, cabPos.y - cH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x - cW4b, cabPos.y);
      ctx.lineTo(cabPos.x - cW4b, cabPos.y - cH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x, cabPos.y - cH4b + cD4b);
      ctx.lineTo(cabPos.x + cW4b, cabPos.y - cH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cabPos.x, cabPos.y - cH4b + cD4b);
      ctx.lineTo(cabPos.x - cW4b, cabPos.y - cH4b);
      ctx.stroke();

      // Armor plate panels with gold border (both faces)
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1 * zoom;
      for (const side of [1, -1]) {
        ctx.beginPath();
        ctx.moveTo(cabPos.x + side * 1.5 * zoom, cabPos.y - 4 * zoom);
        ctx.lineTo(cabPos.x + side * (cW4b - zoom), cabPos.y - 4.5 * zoom);
        ctx.lineTo(cabPos.x + side * (cW4b - zoom), cabPos.y - 15 * zoom);
        ctx.lineTo(cabPos.x + side * 1.5 * zoom, cabPos.y - 14.5 * zoom);
        ctx.closePath();
        ctx.stroke();
      }

      // Gold decorative rivets
      ctx.fillStyle = "#C9A227";
      for (const r of [
        { dx: 2.5, dy: -7 },
        { dx: 4.5, dy: -7.5 },
        { dx: 2.5, dy: -12 },
        { dx: 4.5, dy: -12.5 },
        { dx: -2.5, dy: -7 },
        { dx: -4.5, dy: -7.5 },
        { dx: -2.5, dy: -12 },
        { dx: -4.5, dy: -12.5 },
      ]) {
        ctx.beginPath();
        ctx.arc(
          cabPos.x + r.dx * zoom,
          cabPos.y + r.dy * zoom,
          0.7 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Vision slit — isometric flush with right face
      {
        const vsGlow = 0.4 + Math.sin(time * 2) * 0.15;
        drawIsoFlushSlit(ctx,
          cabPos.x + 4.5 * zoom, cabPos.y - 9 * zoom,
          2, 5, "right", zoom, {
            voidColor: "#0a0e14",
            frameColor: "#C9A227",
            glowColor: "rgba(60, 220, 80",
            glowAlpha: vsGlow,
          });
      }

      // Isometric crown on top — skewed to match cab top face
      {
        const crownY = cabPos.y - 18 * zoom;
        const crHw = cW4b;
        const crHd = cD4b;
        const crH = 6 * zoom;

        // Crown base band — isometric diamond matching cab top
        ctx.fillStyle = "#C9A227";
        ctx.shadowColor = "#C9A227";
        ctx.shadowBlur = 10 * zoom;
        ctx.beginPath();
        ctx.moveTo(cabPos.x - crHw, crownY);
        ctx.lineTo(cabPos.x, crownY - crHd);
        ctx.lineTo(cabPos.x + crHw, crownY);
        ctx.lineTo(cabPos.x, crownY + crHd);
        ctx.closePath();
        ctx.fill();

        // Crown tines — isometric: front-left & front-right edges
        const tines = 4;
        for (let ti = 0; ti < tines; ti++) {
          const t = (ti + 0.5) / tines;
          // Along the right edge: from (cx, cy-crHd) to (cx+crHw, cy)
          const tx = cabPos.x + crHw * t;
          const ty = crownY - crHd * (1 - t);
          ctx.beginPath();
          ctx.moveTo(tx - 1 * zoom, ty + 0.5 * zoom);
          ctx.lineTo(tx, ty - crH);
          ctx.lineTo(tx + 1 * zoom, ty + 0.5 * zoom);
          ctx.closePath();
          ctx.fill();
          // Mirror on left edge
          const tx2 = cabPos.x - crHw * t;
          const ty2 = crownY - crHd * (1 - t);
          ctx.beginPath();
          ctx.moveTo(tx2 - 1 * zoom, ty2 + 0.5 * zoom);
          ctx.lineTo(tx2, ty2 - crH);
          ctx.lineTo(tx2 + 1 * zoom, ty2 + 0.5 * zoom);
          ctx.closePath();
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Amethyst jewels at each crown peak
        ctx.fillStyle = "#9B5FC0";
        ctx.shadowColor = "#9B5FC0";
        ctx.shadowBlur = 4 * zoom;
        for (let ti = 0; ti < tines; ti++) {
          const t = (ti + 0.5) / tines;
          const tx = cabPos.x + crHw * t;
          const ty = crownY - crHd * (1 - t) - crH;
          ctx.beginPath();
          ctx.arc(tx, ty, 1.2 * zoom, 0, Math.PI * 2);
          ctx.fill();
          const tx2 = cabPos.x - crHw * t;
          const ty2 = crownY - crHd * (1 - t) - crH;
          ctx.beginPath();
          ctx.arc(tx2, ty2, 1.2 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }

        // Large center jewel
        ctx.fillStyle = "#B040FF";
        ctx.shadowColor = "#B040FF";
        ctx.shadowBlur = 6 * zoom;
        ctx.beginPath();
        ctx.arc(cabPos.x, crownY - 1 * zoom, 1.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // === LOCOMOTIVE (middle) - Heavy armored engine ===
      drawIsometricPrism(
        ctx,
        locoPos.x,
        locoPos.y,
        15,
        13,
        15,
        { top: "#3a4050", left: "#2a3040", right: "#1a2030" },
        zoom,
      );

      // Wide gold bands
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 3.5 * zoom;
      for (let bi = 0; bi < 2; bi++) {
        const bandY = locoPos.y - 5.5 * zoom - bi * 6.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(locoPos.x - 7 * zoom, bandY + 3.5 * zoom);
        ctx.lineTo(locoPos.x + 7 * zoom, bandY - 3.5 * zoom);
        ctx.stroke();
      }

      // Isometric armored dome
      {
        const adBaseY = locoPos.y - 16 * zoom;
        const adPeakY = locoPos.y - 21 * zoom;
        const adRx = 5 * zoom;
        const adRy = adRx * ISO_SIN;

        ctx.fillStyle = "#2a3040";
        ctx.beginPath();
        ctx.moveTo(locoPos.x, adBaseY + adRy);
        ctx.quadraticCurveTo(locoPos.x + adRx * 0.9, adBaseY - 1.5 * zoom, locoPos.x + adRx * 0.1, adPeakY);
        ctx.lineTo(locoPos.x, adPeakY + 0.5 * zoom);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#4a5060";
        ctx.beginPath();
        ctx.moveTo(locoPos.x, adBaseY + adRy);
        ctx.quadraticCurveTo(locoPos.x - adRx * 0.9, adBaseY - 1.5 * zoom, locoPos.x - adRx * 0.1, adPeakY);
        ctx.lineTo(locoPos.x, adPeakY + 0.5 * zoom);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#3a4050";
        ctx.beginPath();
        ctx.moveTo(locoPos.x - adRx, adBaseY);
        ctx.quadraticCurveTo(locoPos.x, adBaseY - adRy * 1.5, locoPos.x + adRx, adBaseY);
        ctx.lineTo(locoPos.x, adBaseY + adRy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#C9A227";
        ctx.lineWidth = 2.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(locoPos.x, adBaseY, adRx, adRy, 0, 0, Math.PI);
        ctx.stroke();

        // Mini crown trim on dome — isometric tines
        ctx.fillStyle = "#C9A227";
        for (let ci = 0; ci < 3; ci++) {
          const cpx = locoPos.x - 2.5 * zoom + ci * 2.5 * zoom;
          ctx.beginPath();
          ctx.moveTo(cpx - 1 * zoom, adPeakY + 0.5 * zoom);
          ctx.lineTo(cpx, adPeakY - 2.5 * zoom);
          ctx.lineTo(cpx + 1 * zoom, adPeakY + 0.5 * zoom);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Side-mounted exhaust pipes — isometric cylinders with gold valve wheels
      for (const side of [-1, 1]) {
        const epPos = isoOffset(locoPos.x, locoPos.y - 7 * zoom, side * 8);
        const pipeRx = 1.2 * zoom * ISO_SIN;
        const pipeRy = 1.2 * zoom;
        // Pipe body (vertical isometric cylinder)
        ctx.fillStyle = "#3a4050";
        ctx.beginPath();
        ctx.moveTo(epPos.x - pipeRx, epPos.y - 3.5 * zoom);
        ctx.lineTo(epPos.x - pipeRx, epPos.y + 3.5 * zoom);
        ctx.ellipse(epPos.x, epPos.y + 3.5 * zoom, pipeRx, pipeRy * 0.6, 0, Math.PI, 0);
        ctx.lineTo(epPos.x + pipeRx, epPos.y - 3.5 * zoom);
        ctx.closePath();
        ctx.fill();
        // Pipe cap
        ctx.fillStyle = "#4a5060";
        ctx.beginPath();
        ctx.ellipse(epPos.x, epPos.y - 3.5 * zoom, pipeRx, pipeRy * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Gold valve wheel
        ctx.strokeStyle = "#C9A227";
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.ellipse(epPos.x, epPos.y, pipeRx * 1.5, pipeRy * 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#C9A227";
        ctx.beginPath();
        ctx.ellipse(epPos.x, epPos.y, pipeRx * 0.4, pipeRy * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Isometric crown-topped smokestack
      {
        const stackPos = isoOffset(locoPos.x, locoPos.y - 15 * zoom, 4.5);
        const stRBot = 3.5 * zoom;
        const stRTop = 2.5 * zoom;
        const stH = 11 * zoom;
        const stErBot = stRBot * ISO_SIN;
        const stErTop = stRTop * ISO_SIN;

        // Stack body — isometric tapered cylinder
        ctx.fillStyle = "#2a3040";
        ctx.beginPath();
        ctx.moveTo(stackPos.x + stErBot, stackPos.y);
        ctx.lineTo(stackPos.x + stErTop, stackPos.y - stH);
        ctx.lineTo(stackPos.x, stackPos.y - stH + stRTop * ISO_SIN);
        ctx.lineTo(stackPos.x, stackPos.y + stRBot * ISO_SIN);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#4a5060";
        ctx.beginPath();
        ctx.moveTo(stackPos.x - stErBot, stackPos.y);
        ctx.lineTo(stackPos.x - stErTop, stackPos.y - stH);
        ctx.lineTo(stackPos.x, stackPos.y - stH + stRTop * ISO_SIN);
        ctx.lineTo(stackPos.x, stackPos.y + stRBot * ISO_SIN);
        ctx.closePath();
        ctx.fill();

        // Top cap ellipse
        ctx.fillStyle = "#3a4050";
        ctx.beginPath();
        ctx.ellipse(stackPos.x, stackPos.y - stH, stErTop * 1.2, stRTop * ISO_SIN * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#C9A227";
        ctx.lineWidth = 2.5 * zoom;
        ctx.stroke();

        // Mini crown tines on stack
        ctx.fillStyle = "#C9A227";
        ctx.shadowColor = "#C9A227";
        ctx.shadowBlur = 6 * zoom;
        for (let ci = 0; ci < 3; ci++) {
          const a = (ci / 3) * Math.PI * 2;
          const tx = stackPos.x + Math.cos(a) * stErTop * 0.8;
          const ty = stackPos.y - stH + Math.sin(a) * stRTop * ISO_SIN * 0.8;
          ctx.beginPath();
          ctx.moveTo(tx - 0.8 * zoom, ty);
          ctx.lineTo(tx, ty - 4 * zoom);
          ctx.lineTo(tx + 0.8 * zoom, ty);
          ctx.closePath();
          ctx.fill();
        }
        // Jewels at crown peaks
        ctx.fillStyle = "#9B5FC0";
        for (let ci = 0; ci < 3; ci++) {
          const a = (ci / 3) * Math.PI * 2;
          const tx = stackPos.x + Math.cos(a) * stErTop * 0.8;
          const ty = stackPos.y - stH + Math.sin(a) * stRTop * ISO_SIN * 0.8 - 4 * zoom;
          ctx.beginPath();
          ctx.arc(tx, ty, 0.8 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // War smoke
        const smoke4b = 0.35 + Math.sin(time * 4) * 0.15;
        ctx.fillStyle = `rgba(140, 140, 150, ${smoke4b})`;
        ctx.beginPath();
        ctx.arc(
          stackPos.x + Math.sin(time * 3) * 3.5,
          stackPos.y - stH - 6 * zoom,
          7 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Isometric headlight with ornate bracket
      {
        const hlPos = { x: locoPos.x + 7.5 * zoom, y: locoPos.y - 10.5 * zoom };
        drawIsoHeadlight(
          locoPos.x + 6 * zoom, locoPos.y - 10 * zoom,
          hlPos.x, hlPos.y, 3.2,
          "#C9A227", "#C9A227", 0.9);
        // Decorative spokes — isometric elliptical
        const hlRx = 3.2 * zoom * ISO_SIN;
        const hlRy = 3.2 * zoom;
        ctx.strokeStyle = "#DAA520";
        ctx.lineWidth = 1 * zoom;
        for (let ri = 0; ri < 8; ri++) {
          const ra = (ri / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(hlPos.x + Math.cos(ra) * hlRx * 0.75, hlPos.y + Math.sin(ra) * hlRy * 0.75);
          ctx.lineTo(hlPos.x + Math.cos(ra) * hlRx * 1.1, hlPos.y + Math.sin(ra) * hlRy * 1.1);
          ctx.stroke();
        }
      }

      // === ARMORED CAR (back) - War fortress ===
      drawIsometricPrism(
        ctx,
        armoredPos.x,
        armoredPos.y,
        15,
        13,
        13,
        { top: "#4a5060", left: "#3a4050", right: "#2a3040" },
        zoom,
      );

      // Gold borders on panel edges
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 2 * zoom;
      const aW4b = 15 * zoom * 0.5;
      const aD4b = 13 * zoom * 0.25;
      const aH4b = 13 * zoom;
      ctx.beginPath();
      ctx.moveTo(armoredPos.x, armoredPos.y - aH4b + aD4b);
      ctx.lineTo(armoredPos.x + aW4b, armoredPos.y - aH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(armoredPos.x, armoredPos.y - aH4b + aD4b);
      ctx.lineTo(armoredPos.x - aW4b, armoredPos.y - aH4b);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(armoredPos.x, armoredPos.y + aD4b);
      ctx.lineTo(armoredPos.x, armoredPos.y + aD4b - aH4b);
      ctx.stroke();

      // Gun ports — isometric flush slits on right face
      for (let gi = 0; gi < 2; gi++) {
        const gpPos = isoOffset(armoredPos.x, armoredPos.y - 4.5 * zoom, -3.5 + gi * 7);
        const gpX = gpPos.x + 2.5 * zoom;
        drawIsoFlushSlit(ctx, gpX, gpPos.y, 2, 3.5, "right", zoom, {
          voidColor: "#0a0e14", frameColor: "#C9A227",
        });
      }

      // Rose window — isometric ellipse flush with left face
      {
        const rwCY = armoredPos.y - 6.5 * zoom;
        const rwR = 5.5 * zoom;
        const rwSlope = ISO_Y_RATIO;
        const sgGlow = 0.65 + Math.sin(time * 2) * 0.25;

        // Outer frame
        ctx.fillStyle = "#3a4050";
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const px = armoredPos.x + Math.cos(a) * rwR * 0.6;
          const py = rwCY + Math.sin(a) * rwR - Math.cos(a) * rwR * 0.6 * rwSlope;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#C9A227";
        ctx.lineWidth = 2.5 * zoom;
        ctx.stroke();

        // Purple glow fill
        ctx.fillStyle = `rgba(140, 70, 200, ${sgGlow})`;
        ctx.shadowColor = "#7B3FA0";
        ctx.shadowBlur = 12 * zoom;
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const px = armoredPos.x + Math.cos(a) * rwR * 0.55;
          const py = rwCY + Math.sin(a) * rwR * 0.92 - Math.cos(a) * rwR * 0.55 * rwSlope;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Petal circles — isometric
        ctx.strokeStyle = "rgba(100, 40, 160, 0.5)";
        ctx.lineWidth = 0.8 * zoom;
        for (let pi = 0; pi < 8; pi++) {
          const pAngle = (pi / 8) * Math.PI * 2;
          const ppx = armoredPos.x + Math.cos(pAngle) * rwR * 0.25;
          const ppy = rwCY + Math.sin(pAngle) * rwR * 0.42 - Math.cos(pAngle) * rwR * 0.25 * rwSlope;
          ctx.beginPath();
          ctx.ellipse(ppx, ppy, rwR * 0.12, rwR * 0.22, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center jewel
        ctx.fillStyle = "#fff4e0";
        ctx.beginPath();
        ctx.ellipse(armoredPos.x, rwCY, 1.2 * zoom * 0.6, 1.2 * zoom, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Turret with crown finial
      const turretPos4b = isoOffset(armoredPos.x, armoredPos.y - 13 * zoom, 0);
      drawIsometricPrism(
        ctx,
        turretPos4b.x,
        turretPos4b.y,
        6,
        6,
        6,
        { top: "#3a4050", left: "#2a3040", right: "#1a2030" },
        zoom,
      );
      ctx.fillStyle = "#C9A227";
      ctx.shadowColor = "#C9A227";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(turretPos4b.x - 2.5 * zoom, turretPos4b.y - 6 * zoom);
      ctx.lineTo(turretPos4b.x - 1.2 * zoom, turretPos4b.y - 9 * zoom);
      ctx.lineTo(turretPos4b.x, turretPos4b.y - 7 * zoom);
      ctx.lineTo(turretPos4b.x + 1.2 * zoom, turretPos4b.y - 9 * zoom);
      ctx.lineTo(turretPos4b.x + 2.5 * zoom, turretPos4b.y - 6 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gold crown emblem with cross on left face
      ctx.fillStyle = "#C9A227";
      ctx.shadowColor = "#C9A227";
      ctx.shadowBlur = 7 * zoom;
      const crownPos = isoOffset(armoredPos.x, armoredPos.y - 11 * zoom, -7);
      ctx.beginPath();
      ctx.moveTo(crownPos.x - 4.5 * zoom, crownPos.y);
      ctx.lineTo(crownPos.x - 3.5 * zoom, crownPos.y - 3.5 * zoom);
      ctx.lineTo(crownPos.x - 1.8 * zoom, crownPos.y - 1.8 * zoom);
      ctx.lineTo(crownPos.x, crownPos.y - 4 * zoom);
      ctx.lineTo(crownPos.x + 1.8 * zoom, crownPos.y - 1.8 * zoom);
      ctx.lineTo(crownPos.x + 3.5 * zoom, crownPos.y - 3.5 * zoom);
      ctx.lineTo(crownPos.x + 4.5 * zoom, crownPos.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(crownPos.x, crownPos.y - 4 * zoom);
      ctx.lineTo(crownPos.x, crownPos.y - 7 * zoom);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(crownPos.x - 1.8 * zoom, crownPos.y - 5.8 * zoom);
      ctx.lineTo(crownPos.x + 1.8 * zoom, crownPos.y - 5.8 * zoom);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Gold-plated chains between cars
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 2.5 * zoom;
      for (const cOff of [5, -5]) {
        const ca = isoOffset(trainX, trainY - 2 * zoom, cOff);
        const cb = isoOffset(
          trainX,
          trainY - 2 * zoom,
          cOff > 0 ? cOff - 1 : cOff + 1,
        );
        ctx.beginPath();
        ctx.moveTo(ca.x, ca.y);
        ctx.quadraticCurveTo(
          (ca.x + cb.x) / 2,
          (ca.y + cb.y) / 2 + 2.5 * zoom,
          cb.x,
          cb.y,
        );
        ctx.stroke();
      }

      // Royal standard flag (3D isometric with gold trim)
      const rsPole4b = isoOffset(armoredPos.x, armoredPos.y - 19 * zoom, 0);
      ctx.strokeStyle = "#A08020";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(rsPole4b.x, rsPole4b.y + 6 * zoom);
      ctx.lineTo(rsPole4b.x, rsPole4b.y - 5 * zoom);
      ctx.stroke();
      ctx.fillStyle = "#DAA520";
      ctx.beginPath();
      ctx.arc(rsPole4b.x, rsPole4b.y - 5 * zoom, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#E8C847";
      ctx.beginPath();
      ctx.moveTo(rsPole4b.x, rsPole4b.y - 7 * zoom);
      ctx.lineTo(rsPole4b.x + 1 * zoom, rsPole4b.y - 5.5 * zoom);
      ctx.lineTo(rsPole4b.x, rsPole4b.y - 4 * zoom);
      ctx.lineTo(rsPole4b.x - 1 * zoom, rsPole4b.y - 5.5 * zoom);
      ctx.closePath();
      ctx.fill();
      const rsWave4b = Math.sin(time * 2.5) * 0.6;
      ctx.fillStyle = "#C04000";
      ctx.beginPath();
      ctx.moveTo(rsPole4b.x + 1.2 * zoom, rsPole4b.y - 4 * zoom - 0.6 * zoom);
      ctx.quadraticCurveTo(
        rsPole4b.x + 4 * zoom + 1.2 * zoom,
        rsPole4b.y - 3 * zoom + rsWave4b * zoom - 0.6 * zoom,
        rsPole4b.x + 6 * zoom + 1.2 * zoom,
        rsPole4b.y - 2 * zoom + rsWave4b * zoom - 0.6 * zoom,
      );
      ctx.lineTo(rsPole4b.x + 1.2 * zoom, rsPole4b.y - 0.5 * zoom - 0.6 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#E77500";
      ctx.beginPath();
      ctx.moveTo(rsPole4b.x, rsPole4b.y - 4 * zoom);
      ctx.quadraticCurveTo(
        rsPole4b.x + 4 * zoom,
        rsPole4b.y - 3 * zoom + rsWave4b * zoom,
        rsPole4b.x + 6 * zoom,
        rsPole4b.y - 2 * zoom + rsWave4b * zoom,
      );
      ctx.lineTo(rsPole4b.x, rsPole4b.y - 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Princeton orange stripe
      const stripeY = trainY - 2 * zoom;
      const stripeH = 4.5 * zoom;
      const stL = isoOffset(trainX, stripeY, -9);
      const stR = isoOffset(trainX, stripeY, 9);
      ctx.fillStyle = "#E77500";
      ctx.shadowColor = "rgba(231, 117, 0, 0.35)";
      ctx.shadowBlur = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stR.x, stR.y);
      ctx.lineTo(stL.x, stL.y);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#FF8C1A";
      ctx.beginPath();
      ctx.moveTo(stR.x, stR.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH);
      ctx.lineTo(stL.x, stL.y - stripeH + 1.2 * zoom);
      ctx.lineTo(stR.x, stR.y - stripeH + 1.2 * zoom);
      ctx.closePath();
      ctx.fill();

      // Front assembly: armored ram, headlight flush with cab face
      drawTrainFront(cabPos.x, cabPos.y, 13, 13, 18,
        "#3a4050", "#1a2030", "#C9A227",
        "#3a4050", "#3a4050",
        0.75 + Math.sin(time * 3) * 0.2, 1.2, 4);
    }

    ctx.restore();
  }
}
