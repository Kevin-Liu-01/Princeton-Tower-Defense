import type { Tower, Enemy, Position } from "../../types";
import {
  ISO_PRISM_D_FACTOR,
} from "../../constants";
import {
  drawIsometricRailing,
} from "./towerHelpers";

export function renderTeslaCoil(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  void enemies;
  void selectedMap;
  void canvasWidth;
  void canvasHeight;
  void dpr;
  void cameraOffset;
  void cameraZoom;

  const coilHeight = (35 + tower.level * 8) * zoom;
  const isAttacking = Date.now() - tower.lastAttack < 300;
  const attackIntensity = isAttacking
    ? Math.max(0, 1 - (Date.now() - tower.lastAttack) / 300)
    : 0;
  const ringCount = 6 + tower.level * 2;

  const ringPositions: { y: number; size: number; progress: number }[] = [];
  for (let ri = 0; ri < ringCount; ri++) {
    const rp = (ri + 1) / (ringCount + 1);
    const ry = topY - rp * (coilHeight - 18 * zoom) * 1.15;
    const rs = 14 - rp * 8;
    ringPositions.push({ y: ry, size: rs, progress: rp });
  }

  // Coil base platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 5 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#2a4a5f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    16 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Base energy pulse - ground-level glow intensifying when attacking
  const basePulseAlpha =
    0.04 +
    Math.sin(time * 2) * 0.02 +
    (isAttacking ? attackIntensity * 0.35 : 0);
  if (basePulseAlpha > 0.03) {
    const basePulseSize = 20 * zoom * (1 + Math.sin(time * 8) * 0.08);
    if (isAttacking) {
      ctx.shadowColor = "#00aaff";
      ctx.shadowBlur = 15 * zoom * attackIntensity;
    }
    ctx.fillStyle = `rgba(0, 150, 255, ${basePulseAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY + 3 * zoom,
      basePulseSize,
      basePulseSize * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Radial pulse ring
    if (isAttacking) {
      const pulseExpand = ((Date.now() - tower.lastAttack) / 300) * 22 * zoom;
      const pulseRingAlpha =
        attackIntensity * 0.4 * (1 - pulseExpand / (22 * zoom));
      if (pulseRingAlpha > 0) {
        ctx.strokeStyle = `rgba(0, 200, 255, ${pulseRingAlpha})`;
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          topY + 3 * zoom,
          pulseExpand,
          pulseExpand * 0.4,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }
  }

  // === BASE-LEVEL MECHANICAL SUBSYSTEMS (compact, tucked below coils) ===
  const baseY = topY;
  const baseR = 16 * zoom;

  // Small conductor stubs around the base (4 copper posts)
  for (let ci = 0; ci < 4; ci++) {
    const cAngle = (ci / 4) * Math.PI * 2 + Math.PI * 0.25;
    const cpx = Math.cos(cAngle);
    const cpy = Math.sin(cAngle) * 0.5;
    const stubX = screenPos.x + cpx * baseR;
    const stubY = baseY + cpy * baseR;
    const stubH = 8 * zoom;
    const vibrate = isAttacking
      ? Math.sin(time * 25 + ci * 2) * 1 * attackIntensity * zoom
      : 0;
    const shimmer = Math.sin(time * 3 + ci) * 20;

    ctx.strokeStyle = `rgb(${100 + shimmer}, ${65 + shimmer * 0.5}, 30)`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(stubX + vibrate + 0.5 * zoom, stubY + 0.5 * zoom);
    ctx.lineTo(stubX + vibrate + 0.5 * zoom, stubY - stubH + 0.5 * zoom);
    ctx.stroke();

    ctx.strokeStyle = `rgb(${170 + shimmer}, ${115 + shimmer * 0.5}, 55)`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(stubX + vibrate, stubY);
    ctx.lineTo(stubX + vibrate, stubY - stubH);
    ctx.stroke();

    // Top rivet
    ctx.fillStyle = "#ccaa77";
    ctx.beginPath();
    ctx.arc(stubX + vibrate, stubY - stubH, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    if (isAttacking) {
      ctx.shadowColor = "#00aaff";
      ctx.shadowBlur = 4 * zoom * attackIntensity;
      ctx.fillStyle = `rgba(100, 200, 255, ${0.3 * attackIntensity})`;
      ctx.beginPath();
      ctx.arc(stubX + vibrate, stubY - stubH, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // 2 small suspension insulators hanging from base bracket (back-side)
  for (const iAngle of [Math.PI * 0.85, Math.PI * 1.15]) {
    const ipx = Math.cos(iAngle);
    const ipy = Math.sin(iAngle) * 0.5;
    const armEndX = screenPos.x + ipx * (baseR + 4 * zoom);
    const armEndY = baseY + ipy * (baseR + 4 * zoom);

    ctx.strokeStyle = "#667788";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x + ipx * 8 * zoom, baseY + ipy * 8 * zoom);
    ctx.lineTo(armEndX, armEndY);
    ctx.stroke();

    const sway =
      Math.sin(time * 1.5 + iAngle) *
      (isAttacking ? 0.15 + attackIntensity * 0.2 : 0.04);
    for (let d = 0; d < 2; d++) {
      const discY = armEndY + (d + 1) * 2.5 * zoom;
      const discX = armEndX + Math.sin(sway) * (d + 1) * 1.5 * zoom;
      const discR = (2.8 - d * 0.4) * zoom;
      const dg = ctx.createLinearGradient(
        discX - discR,
        discY,
        discX + discR,
        discY,
      );
      dg.addColorStop(0, "#8B7355");
      dg.addColorStop(0.5, "#D8C098");
      dg.addColorStop(1, "#8B7355");
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.ellipse(discX, discY, discR, discR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Central coil column - Enhanced 3D cylindrical structure
  const columnGrad = ctx.createLinearGradient(
    screenPos.x - 10 * zoom,
    0,
    screenPos.x + 10 * zoom,
    0,
  );
  columnGrad.addColorStop(0, "#1a3a4f");
  columnGrad.addColorStop(0.25, "#3a6a8f");
  columnGrad.addColorStop(0.5, "#4a7a9f");
  columnGrad.addColorStop(0.75, "#3a6a8f");
  columnGrad.addColorStop(1, "#1a3a4f");
  ctx.fillStyle = columnGrad;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - 8 * zoom, topY);
  ctx.lineTo(screenPos.x - 5 * zoom, topY - coilHeight + 12 * zoom);
  ctx.lineTo(screenPos.x + 5 * zoom, topY - coilHeight + 12 * zoom);
  ctx.lineTo(screenPos.x + 8 * zoom, topY);
  ctx.closePath();
  ctx.fill();

  // Add vertical structural ribs for better 3D effect
  ctx.strokeStyle = "#2a5a7f";
  ctx.lineWidth = 1.5 * zoom;
  for (let rib = -1; rib <= 1; rib++) {
    const ribX = screenPos.x + rib * 4 * zoom;
    const topRibX = screenPos.x + rib * 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(ribX, topY);
    ctx.lineTo(topRibX, topY - coilHeight + 12 * zoom);
    ctx.stroke();
  }

  // Column energy veins - pulsing blue lines along the column surface
  for (let v = 0; v < 3; v++) {
    const vAngle = (v / 3) * Math.PI + time * 0.3;
    const vx = Math.cos(vAngle) * 0.3;
    const baseVeinX = screenPos.x + vx * 8 * zoom;
    const topVeinX = screenPos.x + vx * 5 * zoom;
    const vAlpha =
      0.12 +
      Math.sin(time * 4 + v * 2.1) * 0.08 +
      (isAttacking ? attackIntensity * 0.35 : 0);
    ctx.strokeStyle = `rgba(0, 180, 255, ${vAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(baseVeinX, topY);
    ctx.lineTo(topVeinX, topY - coilHeight + 12 * zoom);
    ctx.stroke();
    if (isAttacking) {
      ctx.shadowColor = "#00ccff";
      ctx.shadowBlur = 4 * zoom * attackIntensity;
      ctx.strokeStyle = `rgba(0, 220, 255, ${0.25 * attackIntensity})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(baseVeinX, topY);
      ctx.lineTo(topVeinX, topY - coilHeight + 12 * zoom);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Dual counter-rotating energy helix spiraling up the column
  const helixTurns = 3 + tower.level;
  const helixPts = helixTurns * 10;
  const helixSpeed = time * (1.5 + (isAttacking ? 3 * attackIntensity : 0));
  for (let strand = 0; strand < 2; strand++) {
    const strandDir = strand === 0 ? 1 : -1;
    const strandAlpha =
      strand === 0
        ? isAttacking
          ? 0.25 + attackIntensity * 0.35
          : 0.12
        : isAttacking
          ? 0.15 + attackIntensity * 0.2
          : 0.08;
    ctx.strokeStyle = `rgba(${strand === 0 ? "0, 220, 255" : "100, 200, 255"}, ${strandAlpha})`;
    ctx.lineWidth = (strand === 0 ? 1.5 : 1) * zoom;
    if (isAttacking && strand === 0) {
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 5 * zoom * attackIntensity;
    }
    ctx.beginPath();
    for (let h = 0; h <= helixPts; h++) {
      const ht = h / helixPts;
      const hAngle =
        strandDir * ht * helixTurns * Math.PI * 2 +
        helixSpeed * (strand === 0 ? 1 : 0.7);
      const hRadius = (10 - strand) * zoom * (1 - ht * 0.35);
      const hx = screenPos.x + Math.cos(hAngle) * hRadius;
      const hy =
        topY - ht * (coilHeight - 12 * zoom) + Math.sin(hAngle) * hRadius * 0.3;
      if (h === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // === FRONT-SIDE BASE INSULATORS (compact, at base level) ===
  for (const iAngle of [Math.PI * 0.15, Math.PI * 1.85]) {
    const ipx = Math.cos(iAngle);
    const ipy = Math.sin(iAngle) * 0.5;
    const armEndX = screenPos.x + ipx * (baseR + 4 * zoom);
    const armEndY = baseY + ipy * (baseR + 4 * zoom);

    ctx.strokeStyle = "#667788";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x + ipx * 8 * zoom, baseY + ipy * 8 * zoom);
    ctx.lineTo(armEndX, armEndY);
    ctx.stroke();

    const sway =
      Math.sin(time * 1.5 + iAngle) *
      (isAttacking ? 0.15 + attackIntensity * 0.2 : 0.04);
    for (let d = 0; d < 2; d++) {
      const discY = armEndY + (d + 1) * 2.5 * zoom;
      const discX = armEndX + Math.sin(sway) * (d + 1) * 1.5 * zoom;
      const discR = (2.8 - d * 0.4) * zoom;
      const dg = ctx.createLinearGradient(
        discX - discR,
        discY,
        discX + discR,
        discY,
      );
      dg.addColorStop(0, "#8B7355");
      dg.addColorStop(0.5, "#D8C098");
      dg.addColorStop(1, "#8B7355");
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.ellipse(discX, discY, discR, discR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Tesla coil rings with mechanical components
  for (let i = 0; i < ringCount; i++) {
    const ringBob =
      Math.sin(time * 3 + i * 0.8) * 0.6 * zoom +
      (isAttacking
        ? Math.sin(time * 12 + i * 1.5) * 1.5 * zoom * attackIntensity
        : 0);
    const ringY = ringPositions[i].y + ringBob;
    const ringSizeBase = ringPositions[i].size;
    const sizePulse =
      1 +
      Math.sin(time * 4 + i * 0.6) * 0.03 +
      (isAttacking ? Math.sin(time * 10 + i) * 0.08 * attackIntensity : 0);
    const ringSize = ringSizeBase * sizePulse;
    const energyPulse =
      Math.sin(time * 6 - i * 0.5) * 0.4 +
      (isAttacking ? Math.sin(time * 15 + i) * 0.3 * attackIntensity : 0);
    const ringRotation =
      time * (0.8 + (isAttacking ? 2.5 * attackIntensity : 0)) + i * 0.4;

    // Blue glow effect when firing
    if (isAttacking) {
      ctx.shadowColor = "#00aaff";
      ctx.shadowBlur = (12 + attackIntensity * 8) * zoom;
      ctx.fillStyle = `rgba(0, 150, 255, ${0.3 + attackIntensity * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        ringY,
        (ringSize + 2) * zoom,
        (ringSize + 2) * zoom * 0.4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ring shadow (back edge) - darker copper
    ctx.fillStyle = `rgb(${80 + energyPulse * 15}, ${50 + energyPulse * 10}, ${25})`;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY + 2.5 * zoom,
      ringSize * zoom,
      ringSize * zoom * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Main ring body - copper with 3D effect and rotation animation
    const rotOffset =
      Math.sin(ringRotation) *
      (1.5 + (isAttacking ? 2.5 * attackIntensity : 0)) *
      zoom;
    const ringGrad = ctx.createLinearGradient(
      screenPos.x - ringSize * zoom + rotOffset,
      ringY,
      screenPos.x + ringSize * zoom + rotOffset,
      ringY,
    );
    const blueShift = isAttacking ? attackIntensity * 60 : 0;
    ringGrad.addColorStop(
      0,
      `rgb(${120 + energyPulse * 25 - blueShift * 0.3}, ${75 + energyPulse * 15 + blueShift * 0.5}, ${35 + blueShift})`,
    );
    ringGrad.addColorStop(
      0.3,
      `rgb(${180 + energyPulse * 40 - blueShift * 0.3}, ${120 + energyPulse * 25 + blueShift * 0.5}, ${55 + blueShift})`,
    );
    ringGrad.addColorStop(
      0.5,
      `rgb(${220 + energyPulse * 35 - blueShift * 0.3}, ${160 + energyPulse * 30 + blueShift * 0.5}, ${80 + blueShift})`,
    );
    ringGrad.addColorStop(
      0.7,
      `rgb(${180 + energyPulse * 40 - blueShift * 0.3}, ${120 + energyPulse * 25 + blueShift * 0.5}, ${55 + blueShift})`,
    );
    ringGrad.addColorStop(
      1,
      `rgb(${120 + energyPulse * 25 - blueShift * 0.3}, ${75 + energyPulse * 15 + blueShift * 0.5}, ${35 + blueShift})`,
    );

    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY,
      ringSize * zoom,
      ringSize * zoom * 0.4,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Ring highlight with rotation shift
    ctx.strokeStyle = `rgba(255, ${200 + energyPulse * 55}, ${120 + energyPulse * 30 + blueShift}, ${0.6 + energyPulse * 0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x + rotOffset * 0.3,
      ringY - 1 * zoom,
      ringSize * zoom * 0.85,
      ringSize * zoom * 0.35,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Rotating tick marks around ring (gauge-like dial marks)
    for (let t = 0; t < 8; t++) {
      const tAngle = ringRotation + (t / 8) * Math.PI * 2;
      const tInR = ringSize * 0.6 * zoom;
      const tOutR = ringSize * 0.82 * zoom;
      const tx1 = screenPos.x + Math.cos(tAngle) * tInR;
      const ty1 = ringY + Math.sin(tAngle) * tInR * 0.4;
      const tx2 = screenPos.x + Math.cos(tAngle) * tOutR;
      const ty2 = ringY + Math.sin(tAngle) * tOutR * 0.4;
      ctx.strokeStyle = `rgba(255, 200, 120, ${0.2 + energyPulse * 0.1 + (isAttacking ? attackIntensity * 0.25 : 0)})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
    }

    // Inner ring detail ellipse
    ctx.strokeStyle = `rgba(200, 150, 80, ${0.18 + energyPulse * 0.08})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      ringY,
      ringSize * zoom * 0.55,
      ringSize * zoom * 0.22,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Energy glow between rings (every other ring)
    if (i > 0 && i % 2 === 0) {
      const glowAlpha = 0.2 + energyPulse * 0.2 + (isAttacking ? 0.4 : 0);
      ctx.fillStyle = `rgba(0, 200, 255, ${glowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        ringY + (coilHeight / ringCount) * 0.6,
        ringSize * zoom * 0.6,
        ringSize * zoom * 0.25,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Animated energy flow on ring (when attacking) - enhanced blue glow
    if (isAttacking) {
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 12 * zoom;
      const flowAngle = time * 10 + i * 0.7;
      const flowX = screenPos.x + Math.cos(flowAngle) * ringSize * zoom;
      const flowY = ringY + Math.sin(flowAngle) * ringSize * zoom * 0.4;
      ctx.fillStyle = "rgba(100, 220, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(flowX, flowY, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Secondary flow particle
      const flow2Angle = flowAngle + Math.PI;
      const flow2X = screenPos.x + Math.cos(flow2Angle) * ringSize * zoom;
      const flow2Y = ringY + Math.sin(flow2Angle) * ringSize * zoom * 0.4;
      ctx.fillStyle = "rgba(50, 180, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(flow2X, flow2Y, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Third flow particle for more dramatic effect
      const flow3Angle = flowAngle + Math.PI * 0.5;
      const flow3X = screenPos.x + Math.cos(flow3Angle) * ringSize * zoom;
      const flow3Y = ringY + Math.sin(flow3Angle) * ringSize * zoom * 0.4;
      ctx.fillStyle = "rgba(150, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(flow3X, flow3Y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Electromagnetic field lines between adjacent rings
    if (i > 0) {
      const prevRingData = ringPositions[i - 1];
      const prevRY =
        prevRingData.y + Math.sin(time * 3 + (i - 1) * 0.8) * 0.6 * zoom;
      const fieldAlpha = isAttacking ? 0.25 + attackIntensity * 0.45 : 0.08;
      for (let fl = 0; fl < 4; fl++) {
        const fAngle =
          time * (1.8 + (isAttacking ? 3 * attackIntensity : 0)) +
          i * 0.7 +
          fl * (Math.PI * 0.5);
        const fAmpBase = (2.5 + Math.sin(time * 3.5 + fl * 1.2) * 1.2) * zoom;
        const fAmp = fAmpBase * (1 + (isAttacking ? attackIntensity * 0.8 : 0));
        const fMidY = (ringY + prevRY) * 0.5;
        const fStartX = screenPos.x + Math.cos(fAngle) * ringSize * zoom * 0.35;
        const fEndX =
          screenPos.x +
          Math.cos(fAngle) * prevRingData.size * sizePulse * zoom * 0.35;
        const fCtrlX =
          screenPos.x + Math.cos(fAngle + Math.sin(time * 2) * 0.3) * fAmp;

        ctx.strokeStyle = `rgba(80, 200, 255, ${fieldAlpha * (0.4 + Math.sin(time * 5 + fl * 1.5) * 0.3)})`;
        ctx.lineWidth =
          (0.6 + (isAttacking ? attackIntensity * 0.6 : 0)) * zoom;
        ctx.beginPath();
        ctx.moveTo(fStartX, ringY);
        ctx.quadraticCurveTo(fCtrlX, fMidY, fEndX, prevRY);
        ctx.stroke();
      }
    }

    // Ring edge sparking
    if (isAttacking || Math.sin(time * 8 + i * 3.7) > 0.82) {
      const numEdgeSparks = isAttacking ? 2 : 1;
      for (let es = 0; es < numEdgeSparks; es++) {
        const spkAngle = time * (12 + es * 7) + i * 2.3 + es * Math.PI;
        const spkEdgeX = screenPos.x + Math.cos(spkAngle) * ringSize * zoom;
        const spkEdgeY = ringY + Math.sin(spkAngle) * ringSize * zoom * 0.4;
        const spkAlpha = 0.5 + attackIntensity * 0.5;

        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 5 * zoom;
        ctx.fillStyle = `rgba(200, 255, 255, ${spkAlpha})`;
        ctx.beginPath();
        ctx.arc(
          spkEdgeX,
          spkEdgeY,
          (1 + attackIntensity * 0.8) * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        const boltLen =
          (3.5 + Math.sin(time * 18 + es) * 2) * zoom * (1 + attackIntensity);
        const boltAng = spkAngle + Math.sin(time * 10 + es * 3) * 0.6;
        ctx.strokeStyle = `rgba(150, 255, 255, ${spkAlpha * 0.8})`;
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(spkEdgeX, spkEdgeY);
        const midBX =
          spkEdgeX +
          Math.cos(boltAng) * boltLen * 0.5 +
          Math.sin(time * 25 + es) * zoom;
        const midBY = spkEdgeY + Math.sin(boltAng) * boltLen * 0.2;
        ctx.lineTo(midBX, midBY);
        ctx.lineTo(
          spkEdgeX + Math.cos(boltAng) * boltLen,
          spkEdgeY + Math.sin(boltAng) * boltLen * 0.3,
        );
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }

  // === BASE-LEVEL MECHANICAL DETAILS (pistons, dampers, jumpers at base) ===
  {
    // Small pistons around the base platform
    const basePistonAngles = [
      Math.PI * 0.25,
      Math.PI * 0.75,
      Math.PI * 1.25,
      Math.PI * 1.75,
    ];
    for (const pAngle of basePistonAngles) {
      const ppx = Math.cos(pAngle);
      const ppy = Math.sin(pAngle) * 0.5;
      const pistonBaseX = screenPos.x + ppx * 14 * zoom;
      const pistonBaseY = topY + 2 * zoom + ppy * 14 * zoom;
      const pistonExt = isAttacking
        ? 3 * zoom +
          Math.sin(time * 18 + pAngle * 3) * 3 * zoom * attackIntensity
        : 3 * zoom + Math.sin(time * 2 + pAngle) * 0.5 * zoom;

      // Cylinder housing
      ctx.fillStyle = "#4a5a6a";
      ctx.beginPath();
      ctx.ellipse(
        pistonBaseX,
        pistonBaseY,
        2.5 * zoom,
        1.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Piston rod
      ctx.strokeStyle = "#8a9aaa";
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(pistonBaseX, pistonBaseY);
      ctx.lineTo(pistonBaseX, pistonBaseY - pistonExt);
      ctx.stroke();

      // Rod tip
      ctx.fillStyle = "#aabbcc";
      ctx.beginPath();
      ctx.arc(pistonBaseX, pistonBaseY - pistonExt, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Pressure glow when attacking
      if (isAttacking) {
        ctx.fillStyle = `rgba(0, 180, 255, ${0.3 * attackIntensity})`;
        ctx.beginPath();
        ctx.arc(pistonBaseX, pistonBaseY - pistonExt, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Vibration damper springs at base sides
    for (const dAngle of [0, Math.PI]) {
      const dpx = Math.cos(dAngle);
      const dpy = Math.sin(dAngle) * 0.5;
      const damperX = screenPos.x + dpx * 16 * zoom;
      const damperY = topY + 3 * zoom + dpy * 8 * zoom;
      const compress = isAttacking
        ? Math.sin(time * 15 + dAngle) * 2 * zoom * attackIntensity
        : 0;

      // Spring zigzag
      ctx.strokeStyle = "#7a8a7a";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      const springH = 6 * zoom + compress;
      for (let s = 0; s <= 4; s++) {
        const sy = damperY - (s / 4) * springH;
        const sx = damperX + (s % 2 === 0 ? -1.5 : 1.5) * zoom;
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Mass block at top
      ctx.fillStyle = "#5a6a7a";
      ctx.fillRect(
        damperX - 2.5 * zoom,
        damperY - springH - 2 * zoom,
        5 * zoom,
        2 * zoom,
      );
    }

    // Jumper wires between base conductors
    for (const pair of [
      { from: Math.PI * 0.25, to: Math.PI * 0.75 },
      { from: Math.PI * 1.25, to: Math.PI * 1.75 },
    ]) {
      const fx = screenPos.x + Math.cos(pair.from) * 14 * zoom;
      const fy = topY + Math.sin(pair.from) * 0.5 * 7 * zoom;
      const tx = screenPos.x + Math.cos(pair.to) * 14 * zoom;
      const ty = topY + Math.sin(pair.to) * 0.5 * 7 * zoom;
      const ctrlY = Math.min(fy, ty) + 6 * zoom;

      // Wire
      ctx.strokeStyle = "#aa4444";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo((fx + tx) / 2, ctrlY, tx, ty);
      ctx.stroke();

      // Insulation bands
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 2 * zoom;
      for (let b = 0.2; b <= 0.8; b += 0.3) {
        const bx =
          (1 - b) * (1 - b) * fx +
          2 * (1 - b) * b * ((fx + tx) / 2) +
          b * b * tx;
        const by =
          (1 - b) * (1 - b) * fy + 2 * (1 - b) * b * ctrlY + b * b * ty;
        ctx.beginPath();
        ctx.arc(bx, by, 1 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spark when attacking
      if (isAttacking) {
        const sparkT = (time * 6 + pair.from) % 1;
        const omt = 1 - sparkT;
        const sx =
          omt * omt * fx +
          2 * omt * sparkT * ((fx + tx) / 2) +
          sparkT * sparkT * tx;
        const sy =
          omt * omt * fy + 2 * omt * sparkT * ctrlY + sparkT * sparkT * ty;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 4 * zoom;
        ctx.fillStyle = `rgba(200, 255, 255, ${0.7 * attackIntensity})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // === RESONANCE PULSE RINGS (expanding during attacks) ===
  if (isAttacking || attackIntensity > 0) {
    const pulseCount = 3;
    for (let pr = 0; pr < pulseCount; pr++) {
      const pulseAge = (time * 2 + pr * 1.2) % 2.0;
      if (pulseAge < 1.5) {
        const pulseFrac = pulseAge / 1.5;
        const pulseAlpha = (1 - pulseFrac) * 0.3 * attackIntensity;
        const pulseRadius = (8 + pulseFrac * 25) * zoom;
        const pulseY = topY - coilHeight * 0.5;

        ctx.strokeStyle = `rgba(80, 200, 255, ${pulseAlpha})`;
        ctx.lineWidth = (1.5 - pulseFrac * 0.8) * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screenPos.x,
          pulseY,
          pulseRadius,
          pulseRadius * 0.35,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();

        if (pulseAlpha > 0.1) {
          ctx.strokeStyle = `rgba(180, 240, 255, ${pulseAlpha * 0.5})`;
          ctx.lineWidth = 0.5 * zoom;
          ctx.beginPath();
          ctx.ellipse(
            screenPos.x,
            pulseY,
            pulseRadius * 0.95,
            pulseRadius * 0.33,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
    }
  }

  // === AMBIENT EM HUM (passive vertical energy column) ===
  const humAlpha =
    0.04 +
    Math.sin(time * 2) * 0.02 +
    (isAttacking ? attackIntensity * 0.12 : 0);
  const humGrad = ctx.createLinearGradient(
    screenPos.x,
    topY,
    screenPos.x,
    topY - coilHeight,
  );
  humGrad.addColorStop(0, "rgba(0, 150, 255, 0)");
  humGrad.addColorStop(0.3, `rgba(0, 180, 255, ${humAlpha})`);
  humGrad.addColorStop(0.7, `rgba(0, 200, 255, ${humAlpha * 1.5})`);
  humGrad.addColorStop(1, "rgba(100, 220, 255, 0)");
  ctx.fillStyle = humGrad;
  const humWidth =
    (4 + Math.sin(time * 3) * 1 + (isAttacking ? attackIntensity * 3 : 0)) *
    zoom;
  ctx.fillRect(
    screenPos.x - humWidth / 2,
    topY - coilHeight,
    humWidth,
    coilHeight,
  );

  // Energy orb at top - THIS IS WHERE LIGHTNING ORIGINATES
  const orbY = topY - coilHeight + 5 * zoom;
  const orbPulse = 1 + Math.sin(time * 6) * 0.2 + attackIntensity * 0.3;
  const orbSize = (10 + tower.level * 2) * zoom;

  // Store the orb position for projectile origin calculations
  tower._orbScreenY = orbY;

  // Outer energy field - brighter when attacking
  const fieldAlphaBase = isAttacking ? 0.25 : 0.15;
  const energyFieldGrad = ctx.createRadialGradient(
    screenPos.x,
    orbY,
    0,
    screenPos.x,
    orbY,
    orbSize * (2.5 + attackIntensity * 0.5) * orbPulse,
  );
  energyFieldGrad.addColorStop(
    0,
    `rgba(0, 255, 255, ${fieldAlphaBase + attackIntensity * 0.2})`,
  );
  energyFieldGrad.addColorStop(
    0.4,
    `rgba(0, 200, 255, ${0.08 + attackIntensity * 0.15})`,
  );
  energyFieldGrad.addColorStop(
    0.7,
    `rgba(0, 150, 255, ${0.03 + attackIntensity * 0.08})`,
  );
  energyFieldGrad.addColorStop(1, "rgba(0, 100, 255, 0)");
  ctx.fillStyle = energyFieldGrad;
  ctx.beginPath();
  ctx.arc(
    screenPos.x,
    orbY,
    orbSize * (2.5 + attackIntensity * 0.5) * orbPulse,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Main orb - increased glow when attacking
  ctx.shadowColor = isAttacking ? "#88ffff" : "#00ffff";
  ctx.shadowBlur = (30 + attackIntensity * 25) * zoom * orbPulse;
  const orbGrad = ctx.createRadialGradient(
    screenPos.x - 3 * zoom,
    orbY - 3 * zoom,
    0,
    screenPos.x,
    orbY,
    orbSize * orbPulse,
  );
  // Brighter gradient when attacking
  if (isAttacking) {
    orbGrad.addColorStop(0, "#ffffff");
    orbGrad.addColorStop(0.15, "#ffffff");
    orbGrad.addColorStop(0.35, "#ccffff");
    orbGrad.addColorStop(0.6, "#00ffff");
    orbGrad.addColorStop(0.85, "#0088ff");
    orbGrad.addColorStop(1, "#0066cc");
  } else {
    orbGrad.addColorStop(0, "#ffffff");
    orbGrad.addColorStop(0.2, "#ccffff");
    orbGrad.addColorStop(0.5, "#00ffff");
    orbGrad.addColorStop(0.8, "#0088ff");
    orbGrad.addColorStop(1, "#0044aa");
  }
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, orbY, orbSize * orbPulse, 0, Math.PI * 2);
  ctx.fill();

  // Bright solid glowing core when attacking
  if (isAttacking) {
    // Solid bright core
    const coreGrad = ctx.createRadialGradient(
      screenPos.x,
      orbY,
      0,
      screenPos.x,
      orbY,
      orbSize * 0.5 * orbPulse,
    );
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${attackIntensity})`);
    coreGrad.addColorStop(0.5, `rgba(220, 255, 255, ${attackIntensity * 0.9})`);
    coreGrad.addColorStop(1, `rgba(150, 255, 255, ${attackIntensity * 0.5})`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, orbY, orbSize * 0.5 * orbPulse, 0, Math.PI * 2);
    ctx.fill();

    // Inner intense white point
    ctx.fillStyle = `rgba(255, 255, 255, ${attackIntensity})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, orbY, orbSize * 0.2 * orbPulse, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Electric arcs from orb - 3D multi-layered lightning bolts
  const arcCount = 6 + tower.level * 2;
  for (let i = 0; i < arcCount; i++) {
    const arcAngle = time * 2.5 + i * ((Math.PI * 2) / arcCount);
    const arcLength = (20 + Math.sin(time * 11 + i * 3.7) * 10) * zoom;
    const segCount = 5 + Math.floor(Math.sin(time * 7 + i * 2.1) * 1.5 + 1.5);

    const boltPts: { x: number; y: number }[] = [{ x: screenPos.x, y: orbY }];
    for (let s = 1; s <= segCount; s++) {
      const t = s / segCount;
      const jAmp = (1 - t * 0.3) * 8 * zoom;
      const jx = Math.sin(time * 20 + i * 4.1 + s * 6.3) * jAmp;
      const jy = Math.cos(time * 16 + i * 3.7 + s * 8.9) * jAmp * 0.4;
      boltPts.push({
        x: screenPos.x + Math.cos(arcAngle) * arcLength * t + jx,
        y: orbY + Math.sin(arcAngle) * arcLength * 0.4 * t + jy,
      });
    }

    // Layer 1: wide blurry glow
    ctx.save();
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10 * zoom;
    ctx.strokeStyle = `rgba(0, 180, 255, ${0.18 + attackIntensity * 0.15})`;
    ctx.lineWidth = 4 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++)
      ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();
    ctx.restore();

    // Layer 2: bright cyan core
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + attackIntensity * 0.3})`;
    ctx.lineWidth = 1.8 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++)
      ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();

    // Layer 3: thin white-hot center
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + attackIntensity * 0.3})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++)
      ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();

    // Glow node at tip
    const tip = boltPts[boltPts.length - 1];
    ctx.fillStyle = `rgba(200, 255, 255, ${0.5 + attackIntensity * 0.3})`;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Sub-branches from the middle of every other bolt
    if (i % 2 === 0) {
      const bIdx = Math.max(1, Math.floor(segCount * 0.45));
      const bp = boltPts[bIdx];
      const bAngle = arcAngle + Math.sin(time * 10 + i * 2.3) * 0.9;
      const bLen = arcLength * 0.45;
      const bMid = {
        x:
          bp.x +
          Math.cos(bAngle) * bLen * 0.5 +
          Math.sin(time * 22 + i) * 2 * zoom,
        y: bp.y + Math.sin(bAngle) * bLen * 0.2,
      };
      const bEnd = {
        x: bp.x + Math.cos(bAngle) * bLen,
        y: bp.y + Math.sin(bAngle) * bLen * 0.35,
      };

      ctx.strokeStyle = `rgba(0, 220, 255, ${0.3 + attackIntensity * 0.2})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(180, 255, 255, ${0.4 + attackIntensity * 0.25})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + attackIntensity * 0.2})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();
    }
  }

  // Ground-level electricity crackling to nearby rings
  if (Date.now() - tower.lastAttack < 300) {
    for (let g = 0; g < 5; g++) {
      const groundArc = time * 12 + g * 1.5;
      const gx = screenPos.x + Math.sin(groundArc) * 12 * zoom;
      const gy = topY + 3 * zoom;
      const gmx = screenPos.x + Math.sin(groundArc + 0.5) * 6 * zoom;
      const gmy = topY - 2 * zoom;

      ctx.save();
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 6 * zoom;
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.15 * attackIntensity})`;
      ctx.lineWidth = 3 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(screenPos.x, topY);
      ctx.lineTo(gmx, gmy);
      ctx.lineTo(gx, gy);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 * attackIntensity})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, topY);
      ctx.lineTo(gmx, gmy);
      ctx.lineTo(gx, gy);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * attackIntensity})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(screenPos.x, topY);
      ctx.lineTo(gmx, gmy);
      ctx.lineTo(gx, gy);
      ctx.stroke();
    }
  }
}

export function renderFocusedBeam(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  void enemies;
  void selectedMap;
  void canvasWidth;
  void canvasHeight;
  void dpr;
  void cameraOffset;
  void cameraZoom;

  const coilHeight = 65 * zoom;
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 400;
  const attackPulse = isAttacking
    ? Math.sin((timeSinceFire / 400) * Math.PI)
    : 0;

  // === MASSIVE REINFORCED ARCANE BASE ===
  ctx.fillStyle = "#0a1a2a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 8 * zoom,
    28 * zoom,
    14 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing rune circle
  ctx.strokeStyle = `rgba(255, 180, 80, ${0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 6 * zoom,
    24 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Arcane runes
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + time * 0.5;
    const runeX = screenPos.x + Math.cos(angle) * 22 * zoom;
    const runeY = topY + 6 * zoom + Math.sin(angle) * 11 * zoom;
    const runeGlow = 0.4 + Math.sin(time * 3 + i) * 0.2 + attackPulse * 0.5;
    ctx.fillStyle = `rgba(255, 200, 100, ${runeGlow})`;
    ctx.font = `${8 * zoom}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ"][i], runeX, runeY);
  }

  // Elevated tech platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 3 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // --- CONDUCTOR RINGS around base (rotating dashed) ---
  for (let cr = 0; cr < 3; cr++) {
    const crR = (20 + cr * 2) * zoom;
    const crAlpha = 0.25 + Math.sin(time * 4 + cr) * 0.1 + attackPulse * 0.25;
    ctx.strokeStyle = `rgba(184, 115, 51, ${crAlpha})`;
    ctx.lineWidth = 1.8 * zoom;
    ctx.setLineDash([3 * zoom, 4 * zoom]);
    ctx.lineDashOffset = -time * 20 + cr * 8;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY + 4 * zoom,
      crR,
      crR * 0.5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    // Conductor nodes on ring
    for (let cn = 0; cn < 4; cn++) {
      const nodeAngle = time * 1.5 + cr * 0.7 + (cn / 4) * Math.PI * 2;
      const nx = screenPos.x + Math.cos(nodeAngle) * crR;
      const ny = topY + 4 * zoom + Math.sin(nodeAngle) * crR * 0.5;
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255, 200, 100, ${crAlpha + 0.15})`;
      ctx.beginPath();
      ctx.arc(nx, ny, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.setLineDash([]);

  // Platform machinery spokes
  ctx.strokeStyle = "#2a5a7f";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    const detailAngle = (i / 5) * Math.PI * 2 + time;
    const detailX = screenPos.x + Math.cos(detailAngle) * 18 * zoom;
    const detailY = topY + 3 * zoom + Math.sin(detailAngle) * 9 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, topY + 3 * zoom);
    ctx.lineTo(detailX, detailY);
    ctx.stroke();
  }

  // --- VIBRATION DAMPERS between pylons (Stockbridge style) ---
  for (let vd = 0; vd < 2; vd++) {
    const vdSide = vd === 0 ? -1 : 1;
    const vdX = screenPos.x + vdSide * 8 * zoom;
    const vdY = topY - coilHeight * 0.35;
    const vdSwing = Math.sin(time * 4 + vd * 1.8) * 2 * zoom;
    ctx.fillStyle = "#4a6a8a";
    ctx.fillRect(vdX - 1.5 * zoom, vdY - 0.7 * zoom, 3 * zoom, 1.4 * zoom);
    ctx.strokeStyle = "#6a8aaa";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(vdX - 4 * zoom, vdY + 3 * zoom + vdSwing);
    ctx.quadraticCurveTo(
      vdX,
      vdY + 0.7 * zoom,
      vdX + 4 * zoom,
      vdY + 3 * zoom - vdSwing,
    );
    ctx.stroke();
    for (const ws of [-1, 1]) {
      const wx = vdX + ws * 4 * zoom;
      const wy = vdY + 3 * zoom + (ws === -1 ? vdSwing : -vdSwing);
      ctx.fillStyle = "#3a5a7a";
      ctx.beginPath();
      ctx.ellipse(wx, wy, 1.5 * zoom, 2.2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === COIL AMPLIFIERS - BACK PASS (behind pylons) ===
  for (let i = 0; i < 4; i++) {
    const coilAngle = (i / 4) * Math.PI * 2 + time;
    if (Math.sin(coilAngle) >= 0) continue;
    const coilX = screenPos.x + Math.cos(coilAngle) * 16 * zoom;
    const coilY = topY - 4 * zoom + Math.sin(coilAngle) * 8 * zoom;

    // Amplifier base
    ctx.fillStyle = "#2d5a7b";
    ctx.beginPath();
    ctx.ellipse(coilX, coilY, 4 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Copper coil rings (gradient-filled like Tesla coil rings)
    const coilRingH = 12 * zoom;
    const coilRingR = 5.5 * zoom;
    for (let ct = 0; ct < 4; ct++) {
      const turnY = coilY - 2 * zoom - ct * (coilRingH / 4);
      // Ring shadow (back edge)
      ctx.fillStyle = "rgb(80, 50, 25)";
      ctx.beginPath();
      ctx.ellipse(
        coilX,
        turnY + 1.5 * zoom,
        coilRingR,
        coilRingR * 0.4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Main ring body with copper gradient
      const rGrad = ctx.createLinearGradient(
        coilX - coilRingR,
        turnY,
        coilX + coilRingR,
        turnY,
      );
      rGrad.addColorStop(0, "rgb(120, 75, 35)");
      rGrad.addColorStop(0.3, "rgb(180, 120, 55)");
      rGrad.addColorStop(0.5, "rgb(220, 160, 80)");
      rGrad.addColorStop(0.7, "rgb(180, 120, 55)");
      rGrad.addColorStop(1, "rgb(120, 75, 35)");
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.ellipse(coilX, turnY, coilRingR, coilRingR * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ring highlight
      ctx.strokeStyle = "rgba(255, 200, 120, 0.7)";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        coilX,
        turnY - 0.8 * zoom,
        coilRingR * 0.85,
        coilRingR * 0.32,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Glowing energy sphere on top of coil
    const sphereY = coilY - 2 * zoom - coilRingH - 3 * zoom;
    const spherePulse =
      0.7 + Math.sin(time * 5 + i * 1.5) * 0.3 + attackPulse * 0.3;
    ctx.save();
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = (10 + attackPulse * 12) * zoom;
    const sphereGrad = ctx.createRadialGradient(
      coilX,
      sphereY,
      0,
      coilX,
      sphereY,
      4.5 * zoom,
    );
    sphereGrad.addColorStop(0, "#ffffff");
    sphereGrad.addColorStop(0.3, "#aaeeff");
    sphereGrad.addColorStop(0.7, "#2299dd");
    sphereGrad.addColorStop(1, "rgba(0, 100, 200, 0.3)");
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(coilX, sphereY, 4.5 * zoom * spherePulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3D layered lightning from amplifier to dish
    const ampSegCnt = 5;
    const ampEndX = screenPos.x;
    const ampEndY = topY - coilHeight + 12 * zoom;
    const ampBoltPts: { x: number; y: number }[] = [
      { x: coilX, y: coilY - 6 * zoom },
    ];
    for (let s = 1; s <= ampSegCnt; s++) {
      const t = s / ampSegCnt;
      const jAmp = (1 - t * 0.3) * 7 * zoom;
      ampBoltPts.push({
        x:
          coilX +
          (ampEndX - coilX) * t +
          Math.sin(time * 20 + i * 5.1 + s * 6.3) * jAmp,
        y:
          coilY -
          6 * zoom +
          (ampEndY - (coilY - 6 * zoom)) * t +
          Math.cos(time * 16 + i * 3.7 + s * 8.9) * jAmp * 0.4,
      });
    }
    ctx.save();
    ctx.shadowColor = "#ffaa44";
    ctx.shadowBlur = 8 * zoom;
    ctx.strokeStyle = `rgba(255, 180, 80, ${0.18 + attackPulse * 0.15})`;
    ctx.lineWidth = 3.5 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(ampBoltPts[0].x, ampBoltPts[0].y);
    for (let p = 1; p < ampBoltPts.length; p++)
      ctx.lineTo(ampBoltPts[p].x, ampBoltPts[p].y);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = `rgba(255, 220, 130, ${0.45 + attackPulse * 0.35})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ampBoltPts[0].x, ampBoltPts[0].y);
    for (let p = 1; p < ampBoltPts.length; p++)
      ctx.lineTo(ampBoltPts[p].x, ampBoltPts[p].y);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 220, ${0.4 + attackPulse * 0.3})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(ampBoltPts[0].x, ampBoltPts[0].y);
    for (let p = 1; p < ampBoltPts.length; p++)
      ctx.lineTo(ampBoltPts[p].x, ampBoltPts[p].y);
    ctx.stroke();
  }

  // === SUPPORT PYLONS with PISTONS & SUSPENSION INSULATORS ===
  for (let i = -1; i <= 1; i += 2) {
    const pylonX = screenPos.x + i * 9 * zoom;

    // Pylon body - wider with isometric left/right face shading
    const pylonBaseW = 6;
    const pylonTopW = 4;
    // Left face (darker)
    ctx.fillStyle = "#1a4a6b";
    ctx.beginPath();
    ctx.moveTo(pylonX - pylonBaseW * zoom, topY);
    ctx.lineTo(pylonX, topY + 2 * zoom);
    ctx.lineTo(pylonX, topY - coilHeight + 18 * zoom);
    ctx.lineTo(pylonX - pylonTopW * zoom, topY - coilHeight + 20 * zoom);
    ctx.closePath();
    ctx.fill();
    // Right face (lighter)
    ctx.fillStyle = "#3d7a9b";
    ctx.beginPath();
    ctx.moveTo(pylonX + pylonBaseW * zoom, topY);
    ctx.lineTo(pylonX, topY + 2 * zoom);
    ctx.lineTo(pylonX, topY - coilHeight + 18 * zoom);
    ctx.lineTo(pylonX + pylonTopW * zoom, topY - coilHeight + 20 * zoom);
    ctx.closePath();
    ctx.fill();
    // Edge highlights
    ctx.strokeStyle = "#6aadcc";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(pylonX - pylonBaseW * zoom, topY);
    ctx.lineTo(pylonX - pylonTopW * zoom, topY - coilHeight + 20 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pylonX + pylonBaseW * zoom, topY);
    ctx.lineTo(pylonX + pylonTopW * zoom, topY - coilHeight + 20 * zoom);
    ctx.stroke();
    // Top cap
    ctx.fillStyle = "#4d8aab";
    ctx.beginPath();
    ctx.moveTo(pylonX - pylonTopW * zoom, topY - coilHeight + 20 * zoom);
    ctx.lineTo(pylonX, topY - coilHeight + 18 * zoom);
    ctx.lineTo(pylonX + pylonTopW * zoom, topY - coilHeight + 20 * zoom);
    ctx.lineTo(pylonX, topY - coilHeight + 22 * zoom);
    ctx.closePath();
    ctx.fill();

    // Pylon horizontal tech panel lines
    for (let pl = 0; pl < 4; pl++) {
      const plY = topY - (pl * (coilHeight - 20 * zoom)) / 5;
      const plW = pylonBaseW - pl * 0.4;
      ctx.strokeStyle = "#4a8aaa";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(pylonX - plW * zoom, plY);
      ctx.lineTo(pylonX + plW * zoom, plY);
      ctx.stroke();
    }

    // --- HYDRAULIC PISTON on each pylon ---
    const pistonExt =
      (4 + Math.sin(time * 2 + i * 1.2) * 2 + attackPulse * 6) * zoom;
    const pistonBaseY = topY - coilHeight * 0.4;
    ctx.fillStyle = "#3a5a7a";
    ctx.fillRect(
      pylonX + i * 5 * zoom - 2 * zoom,
      pistonBaseY - 6 * zoom,
      4 * zoom,
      6 * zoom,
    );
    ctx.strokeStyle = "#5a8aaa";
    ctx.lineWidth = 0.6 * zoom;
    ctx.strokeRect(
      pylonX + i * 5 * zoom - 2 * zoom,
      pistonBaseY - 6 * zoom,
      4 * zoom,
      6 * zoom,
    );
    ctx.fillStyle = "#8abace";
    ctx.fillRect(
      pylonX + i * 5 * zoom - 0.8 * zoom,
      pistonBaseY - 6 * zoom - pistonExt,
      1.6 * zoom,
      pistonExt + 1.5 * zoom,
    );
    ctx.fillStyle = "#5a9aba";
    ctx.beginPath();
    ctx.ellipse(
      pylonX + i * 5 * zoom,
      pistonBaseY - 6 * zoom - pistonExt,
      2.5 * zoom,
      1 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (attackPulse > 0.2) {
      ctx.fillStyle = `rgba(255, 200, 100, ${attackPulse * 0.3})`;
      for (let v = 0; v < 2; v++) {
        const vy = ((time * 10 + v * 0.4) % 1) * 4 * zoom;
        ctx.beginPath();
        ctx.arc(
          pylonX + i * 5 * zoom,
          pistonBaseY - 7 * zoom - pistonExt - vy,
          (1 + v * 0.3) * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // --- SUSPENSION INSULATORS hanging from pylon crossarm ---
    const insX = pylonX + i * 7 * zoom;
    const insTopY = topY - coilHeight * 0.25;
    ctx.strokeStyle = "#6a8aaa";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(pylonX + i * 3 * zoom, insTopY - 3 * zoom);
    ctx.lineTo(insX, insTopY);
    ctx.stroke();
    for (let dd = 0; dd < 3; dd++) {
      const discY = insTopY + dd * 2.8 * zoom;
      const discR = (3 - dd * 0.2) * zoom;
      ctx.fillStyle = dd % 2 === 0 ? "#6a8a9a" : "#5a7a8a";
      ctx.beginPath();
      ctx.ellipse(insX, discY, discR, discR * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c09040";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        insX,
        discY - 0.3 * zoom,
        discR * 0.6,
        discR * 0.18,
        0,
        0,
        Math.PI,
      );
      ctx.stroke();
      if (dd < 2) {
        ctx.fillStyle = "#7aa0b0";
        ctx.fillRect(
          insX - 0.3 * zoom,
          discY + discR * 0.3,
          0.6 * zoom,
          2 * zoom,
        );
      }
    }
    // Wire from insulator to tower body with sag
    const insBottomY = insTopY + 2 * 2.8 * zoom + 2 * zoom;
    const wireSag = Math.sin(time * 2 + i) * 1.5 * zoom;
    ctx.strokeStyle = "rgba(255, 180, 80, 0.35)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(insX, insBottomY);
    ctx.quadraticCurveTo(
      insX - i * 3 * zoom,
      insBottomY + 5 * zoom + wireSag,
      screenPos.x + i * 3 * zoom,
      topY + 2 * zoom,
    );
    ctx.stroke();

    // Energy conduit on pylon with flowing current
    const conduitGlow = 0.5 + Math.sin(time * 4 + i) * 0.3 + attackPulse * 0.5;
    ctx.strokeStyle = `rgba(255, 200, 100, ${conduitGlow})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(pylonX, topY - 5 * zoom);
    ctx.lineTo(pylonX, topY - coilHeight + 25 * zoom);
    ctx.stroke();
    for (let fp = 0; fp < 3; fp++) {
      const fpPhase = (time * 4 + fp * 0.33) % 1;
      const fpY = topY - 5 * zoom - fpPhase * (coilHeight - 30 * zoom);
      ctx.fillStyle = `rgba(255, 220, 150, ${Math.sin(fpPhase * Math.PI) * 0.8})`;
      ctx.beginPath();
      ctx.arc(pylonX, fpY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pylon energy node
    ctx.fillStyle = `rgba(255, 200, 100, ${conduitGlow})`;
    ctx.shadowColor = "#ffaa44";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.arc(pylonX, topY - coilHeight + 22 * zoom, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // === COIL AMPLIFIERS - FRONT PASS (in front of pylons) ===
  for (let i = 0; i < 4; i++) {
    const coilAngle = (i / 4) * Math.PI * 2 + time;
    if (Math.sin(coilAngle) < 0) continue;
    const coilX = screenPos.x + Math.cos(coilAngle) * 16 * zoom;
    const coilY = topY - 4 * zoom + Math.sin(coilAngle) * 8 * zoom;

    // Amplifier base
    ctx.fillStyle = "#2d5a7b";
    ctx.beginPath();
    ctx.ellipse(coilX, coilY, 4 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // Copper coil rings (gradient-filled like Tesla coil rings)
    const coilRingH = 12 * zoom;
    const coilRingR = 5.5 * zoom;
    for (let ct = 0; ct < 4; ct++) {
      const turnY = coilY - 2 * zoom - ct * (coilRingH / 4);
      // Ring shadow (back edge)
      ctx.fillStyle = "rgb(80, 50, 25)";
      ctx.beginPath();
      ctx.ellipse(
        coilX,
        turnY + 1.5 * zoom,
        coilRingR,
        coilRingR * 0.4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Main ring body with copper gradient
      const rGrad = ctx.createLinearGradient(
        coilX - coilRingR,
        turnY,
        coilX + coilRingR,
        turnY,
      );
      rGrad.addColorStop(0, "rgb(120, 75, 35)");
      rGrad.addColorStop(0.3, "rgb(180, 120, 55)");
      rGrad.addColorStop(0.5, "rgb(220, 160, 80)");
      rGrad.addColorStop(0.7, "rgb(180, 120, 55)");
      rGrad.addColorStop(1, "rgb(120, 75, 35)");
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.ellipse(coilX, turnY, coilRingR, coilRingR * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ring highlight
      ctx.strokeStyle = "rgba(255, 200, 120, 0.7)";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        coilX,
        turnY - 0.8 * zoom,
        coilRingR * 0.85,
        coilRingR * 0.32,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Glowing energy sphere on top of coil
    const sphereY = coilY - 2 * zoom - coilRingH - 3 * zoom;
    const spherePulse =
      0.7 + Math.sin(time * 5 + i * 1.5) * 0.3 + attackPulse * 0.3;
    ctx.save();
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = (10 + attackPulse * 12) * zoom;
    const sphereGrad = ctx.createRadialGradient(
      coilX,
      sphereY,
      0,
      coilX,
      sphereY,
      4.5 * zoom,
    );
    sphereGrad.addColorStop(0, "#ffffff");
    sphereGrad.addColorStop(0.3, "#aaeeff");
    sphereGrad.addColorStop(0.7, "#2299dd");
    sphereGrad.addColorStop(1, "rgba(0, 100, 200, 0.3)");
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(coilX, sphereY, 4.5 * zoom * spherePulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3D layered lightning from amplifier to dish
    const ampSegCnt = 5;
    const ampEndX = screenPos.x;
    const ampEndY = topY - coilHeight + 12 * zoom;
    const ampBoltPts: { x: number; y: number }[] = [
      { x: coilX, y: coilY - 6 * zoom },
    ];
    for (let s = 1; s <= ampSegCnt; s++) {
      const t = s / ampSegCnt;
      const jAmp = (1 - t * 0.3) * 7 * zoom;
      ampBoltPts.push({
        x:
          coilX +
          (ampEndX - coilX) * t +
          Math.sin(time * 20 + i * 5.1 + s * 6.3) * jAmp,
        y:
          coilY -
          6 * zoom +
          (ampEndY - (coilY - 6 * zoom)) * t +
          Math.cos(time * 16 + i * 3.7 + s * 8.9) * jAmp * 0.4,
      });
    }
    ctx.save();
    ctx.shadowColor = "#ffaa44";
    ctx.shadowBlur = 8 * zoom;
    ctx.strokeStyle = `rgba(255, 180, 80, ${0.18 + attackPulse * 0.15})`;
    ctx.lineWidth = 3.5 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(ampBoltPts[0].x, ampBoltPts[0].y);
    for (let p = 1; p < ampBoltPts.length; p++)
      ctx.lineTo(ampBoltPts[p].x, ampBoltPts[p].y);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = `rgba(255, 220, 130, ${0.45 + attackPulse * 0.35})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ampBoltPts[0].x, ampBoltPts[0].y);
    for (let p = 1; p < ampBoltPts.length; p++)
      ctx.lineTo(ampBoltPts[p].x, ampBoltPts[p].y);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 220, ${0.4 + attackPulse * 0.3})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(ampBoltPts[0].x, ampBoltPts[0].y);
    for (let p = 1; p < ampBoltPts.length; p++)
      ctx.lineTo(ampBoltPts[p].x, ampBoltPts[p].y);
    ctx.stroke();
  }

  // --- CAPACITOR BANK under dish with charge-up ---
  for (let cb = 0; cb < 5; cb++) {
    const cbAngle = (cb / 5) * Math.PI * 2 + time * 0.3;
    const cbR = 14 * zoom;
    const cbX = screenPos.x + Math.cos(cbAngle) * cbR;
    const cbY = topY - coilHeight * 0.55 + Math.sin(cbAngle) * cbR * 0.5;
    const charge = Math.max(
      0,
      Math.min(1, 0.3 + Math.sin(time * 2.5 + cb) * 0.25 + attackPulse * 0.5),
    );
    ctx.fillStyle = "#1a3a5a";
    ctx.beginPath();
    ctx.ellipse(cbX, cbY, 2.5 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 200, 100, ${charge * 0.6})`;
    ctx.beginPath();
    ctx.ellipse(
      cbX,
      cbY + (1 - charge) * 3 * zoom,
      1.8 * zoom,
      charge * 3 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#b87333";
    ctx.beginPath();
    ctx.arc(cbX, cbY - 4 * zoom, 0.7 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ring below pylon amplifiers
  const ringGlow = 0.4 + Math.sin(time * 3) * 0.2 + attackPulse * 0.5;
  ctx.strokeStyle = `rgba(255, 200, 100, ${ringGlow})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const ringAngle = (i / 4) * Math.PI * 2 + time;
    const ringX = screenPos.x + Math.cos(ringAngle) * 16 * zoom;
    const ringY = topY + 2 * zoom + Math.sin(ringAngle) * 8 * zoom;
    ctx.beginPath();
    ctx.ellipse(ringX, ringY, 6 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // --- TENSION / STRAIN ASSEMBLIES on dish supports ---
  for (let ta = 0; ta < 2; ta++) {
    const taSide = ta === 0 ? -1 : 1;
    const taX = screenPos.x + taSide * 18 * zoom;
    const taY = topY - coilHeight * 0.5;
    ctx.fillStyle = "#4a6a8a";
    ctx.beginPath();
    ctx.moveTo(taX - 1 * zoom, taY - 3 * zoom);
    ctx.lineTo(taX + 1 * zoom, taY - 3 * zoom);
    ctx.lineTo(taX + 1.5 * zoom, taY);
    ctx.lineTo(taX + 1 * zoom, taY + 3 * zoom);
    ctx.lineTo(taX - 1 * zoom, taY + 3 * zoom);
    ctx.lineTo(taX - 1.5 * zoom, taY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a8aaa";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(taX, taY - 3 * zoom);
    ctx.lineTo(taX + taSide * 4 * zoom, taY - 10 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(taX, taY + 3 * zoom);
    ctx.lineTo(taX + taSide * 4 * zoom, taY + 10 * zoom);
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 200, 100, ${0.3 + attackPulse * 0.4})`;
    ctx.beginPath();
    ctx.arc(taX, taY, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // === MASSIVE FOCUSING DISH ===
  const dishY = topY - coilHeight + 12 * zoom;
  const dishSize = 28 + attackPulse * 4;

  // Dish shadow/depth
  ctx.fillStyle = "rgba(0, 10, 20, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x + 2 * zoom,
    dishY + 2 * zoom,
    (dishSize + 2) * zoom,
    (dishSize + 2) * 0.72 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Outer dish ring
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    dishY,
    dishSize * zoom,
    dishSize * 0.72 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Dish metallic gradient (improved)
  const dishGrad = ctx.createRadialGradient(
    screenPos.x - 8 * zoom,
    dishY - 4 * zoom,
    0,
    screenPos.x,
    dishY,
    dishSize * zoom,
  );
  dishGrad.addColorStop(0, "#7dbadd");
  dishGrad.addColorStop(0.25, "#5d9abe");
  dishGrad.addColorStop(0.5, "#3d7a9e");
  dishGrad.addColorStop(0.75, "#2d5a7b");
  dishGrad.addColorStop(1, "#1a3a4f");
  ctx.fillStyle = dishGrad;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    dishY,
    (dishSize - 3) * zoom,
    (dishSize * 0.72 - 2) * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Dish surface radial tech patterns
  for (let rl = 0; rl < 8; rl++) {
    const rlAngle = (rl / 8) * Math.PI * 2;
    ctx.strokeStyle = "rgba(100, 160, 200, 0.2)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      screenPos.x + Math.cos(rlAngle) * 5 * zoom,
      dishY + Math.sin(rlAngle) * 3.5 * zoom,
    );
    ctx.lineTo(
      screenPos.x + Math.cos(rlAngle) * (dishSize - 4) * zoom,
      dishY + Math.sin(rlAngle) * (dishSize - 4) * 0.72 * zoom,
    );
    ctx.stroke();
  }

  // Inner dish concentric rings
  for (let ring = 0; ring < 4; ring++) {
    const ringSize = dishSize - 6 - ring * 4;
    const irGlow = 0.2 + Math.sin(time * 3 + ring) * 0.1 + attackPulse * 0.3;
    ctx.strokeStyle = `rgba(255, 200, 100, ${irGlow})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      dishY,
      ringSize * zoom,
      ringSize * 0.72 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // --- DISH HYDRAULIC ACTUATORS (tilt mechanism) ---
  for (let da = 0; da < 3; da++) {
    const daAngle = (da / 3) * Math.PI * 2 + Math.PI / 6;
    const daBaseX = screenPos.x + Math.cos(daAngle) * (dishSize - 8) * zoom;
    const daBaseY = dishY + Math.sin(daAngle) * (dishSize - 8) * 0.72 * zoom;
    const daExt = (3 + Math.sin(time * 2 + da) * 1.5 + attackPulse * 3) * zoom;
    ctx.strokeStyle = "#5a8aaa";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(daBaseX, daBaseY);
    ctx.lineTo(daBaseX, daBaseY + daExt);
    ctx.stroke();
    ctx.fillStyle = "#3a6a8a";
    ctx.fillRect(
      daBaseX - 1.5 * zoom,
      daBaseY + daExt - 1 * zoom,
      3 * zoom,
      4 * zoom,
    );
    ctx.fillStyle = "#8abace";
    ctx.fillRect(daBaseX - 0.5 * zoom, daBaseY - 0.5 * zoom, 1 * zoom, daExt);
  }

  // === CENTRAL FOCUS CRYSTAL ===
  const crystalY = dishY - 5 * zoom;
  const crystalPulse = 1 + Math.sin(time * 5) * 0.1 + attackPulse * 0.3;

  // Crystal housing
  ctx.fillStyle = "#2d5a7b";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    crystalY + 8 * zoom,
    8 * zoom,
    4 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Floating crystal shards (faceted, bobbing)
  for (let i = 0; i < 6; i++) {
    const shardAngle = (i / 6) * Math.PI * 2 + time * 2;
    const shardDist = 15 + Math.sin(time * 3 + i * 1.2) * 3;
    const shardX = screenPos.x + Math.cos(shardAngle) * shardDist * zoom;
    const shardY = crystalY + Math.sin(shardAngle) * shardDist * 0.4 * zoom;
    const shardBob = Math.sin(time * 4 + i * 0.8) * 2 * zoom;
    ctx.fillStyle = `rgba(255, 220, 150, ${0.5 + attackPulse * 0.4})`;
    ctx.shadowColor = "#ffaa44";
    ctx.shadowBlur = 5 * zoom;
    ctx.beginPath();
    ctx.moveTo(shardX, shardY - 5 * zoom + shardBob);
    ctx.lineTo(shardX - 2 * zoom, shardY + shardBob);
    ctx.lineTo(shardX, shardY + 3 * zoom + shardBob);
    ctx.lineTo(shardX + 2 * zoom, shardY + shardBob);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Main crystal core
  ctx.fillStyle = "#ffcc66";
  ctx.shadowColor = isAttacking ? "#ffdd88" : "#ffaa44";
  ctx.shadowBlur = (20 + attackPulse * 25) * zoom;
  ctx.beginPath();
  ctx.arc(screenPos.x, crystalY, 10 * crystalPulse * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Inner crystal glow
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(screenPos.x, crystalY, 5 * crystalPulse * zoom, 0, Math.PI * 2);
  ctx.fill();

  if (attackPulse > 0.1) {
    const flashSize = 8 * crystalPulse * zoom * (1 + attackPulse * 0.5);
    ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, crystalY, flashSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, crystalY, flashSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  tower._orbScreenY = crystalY;

  // === CRACKLING ENERGY ARCS (3D layered) ===
  for (let i = 0; i < 12; i++) {
    const angle = time * 3 + i * (Math.PI / 6);
    const dist = 20 + Math.sin(time * 6 + i) * 5;
    const ex = screenPos.x + Math.cos(angle) * dist * zoom;
    const ey = dishY + Math.sin(angle) * dist * 0.5 * zoom;
    const segCnt = 3;
    const crackPts: { x: number; y: number }[] = [
      { x: screenPos.x, y: crystalY },
    ];
    for (let s = 1; s <= segCnt; s++) {
      const t = s / segCnt;
      const jAmp = (1 - t * 0.3) * 7 * zoom;
      crackPts.push({
        x:
          screenPos.x +
          (ex - screenPos.x) * t +
          Math.sin(time * 22 + i * 4.3 + s * 6.1) * jAmp,
        y:
          crystalY +
          (ey - crystalY) * t +
          Math.cos(time * 18 + i * 3.1 + s * 8.7) * jAmp * 0.4,
      });
    }
    ctx.save();
    ctx.shadowColor = "#ffaa44";
    ctx.shadowBlur = 8 * zoom;
    ctx.strokeStyle = `rgba(255, 180, 80, ${0.15 + attackPulse * 0.12})`;
    ctx.lineWidth = 3 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(crackPts[0].x, crackPts[0].y);
    for (let p = 1; p < crackPts.length; p++)
      ctx.lineTo(crackPts[p].x, crackPts[p].y);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = `rgba(255, 220, 130, ${0.4 + attackPulse * 0.3})`;
    ctx.lineWidth = (1.2 + attackPulse * 0.5) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(crackPts[0].x, crackPts[0].y);
    for (let p = 1; p < crackPts.length; p++)
      ctx.lineTo(crackPts[p].x, crackPts[p].y);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 220, ${0.35 + attackPulse * 0.25})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(crackPts[0].x, crackPts[0].y);
    for (let p = 1; p < crackPts.length; p++)
      ctx.lineTo(crackPts[p].x, crackPts[p].y);
    ctx.stroke();
  }

  // === BEAM CHARGING EFFECT ===
  if (isAttacking) {
    const beamPhase = timeSinceFire / 400;
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = (beamPhase + ring * 0.15) % 1;
      const ringRadius = 5 + ringPhase * 25;
      const ringAlpha = (1 - ringPhase) * 0.6;
      ctx.strokeStyle = `rgba(255, 220, 130, ${ringAlpha})`;
      ctx.lineWidth = 2 * zoom * (1 - ringPhase);
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        crystalY,
        ringRadius * zoom,
        ringRadius * 0.5 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - beamPhase) * 0.8})`;
    ctx.beginPath();
    ctx.arc(
      screenPos.x,
      crystalY,
      15 * (1 - beamPhase * 0.5) * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // --- WIRE NETWORK connecting dish to platform ---
  for (let wn = 0; wn < 4; wn++) {
    const wnAngle = (wn / 4) * Math.PI * 2 + time * 0.2;
    const startX = screenPos.x + Math.cos(wnAngle) * (dishSize - 5) * zoom;
    const startWY = dishY + Math.sin(wnAngle) * (dishSize - 5) * 0.72 * zoom;
    const endX = screenPos.x + Math.cos(wnAngle + 0.3) * 16 * zoom;
    const endWY = topY + 2 * zoom + Math.sin(wnAngle + 0.3) * 8 * zoom;
    const midX = (startX + endX) / 2;
    const midY =
      (startWY + endWY) / 2 + 8 * zoom + Math.sin(time * 2 + wn) * 2 * zoom;
    const vibrate = Math.sin(time * 12 + wn * 4) * attackPulse * 1.5 * zoom;
    ctx.strokeStyle = `rgba(184, 115, 51, ${0.3 + Math.sin(time * 2 + wn) * 0.1})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(startX, startWY);
    ctx.quadraticCurveTo(midX + vibrate, midY, endX, endWY);
    ctx.stroke();
  }
}

export function renderChainLightning(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const coilHeight = 65 * zoom;
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 400;
  const attackPulse = isAttacking
    ? Math.sin((timeSinceFire / 400) * Math.PI)
    : 0;

  // === REINFORCED BASE PLATFORM ===
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 5 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Dark iron foundation
  ctx.fillStyle = "#0a1a2a";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 8 * zoom,
    28 * zoom,
    14 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Pulsing tech ring
  ctx.strokeStyle = `rgba(80, 200, 255, ${0.3 + Math.sin(time * 2) * 0.15 + attackPulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 6 * zoom,
    24 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // --- CONDUCTOR RINGS around base (animated dashed) ---
  for (let cr = 0; cr < 3; cr++) {
    const crR = (19 + cr * 2) * zoom;
    const crAlpha = 0.2 + Math.sin(time * 3.5 + cr) * 0.1 + attackPulse * 0.2;
    ctx.strokeStyle = `rgba(100, 180, 220, ${crAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.setLineDash([3 * zoom, 3 * zoom]);
    ctx.lineDashOffset = -time * 15 + cr * 10;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY + 5 * zoom,
      crR,
      crR * 0.5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Elevated tech platform
  ctx.fillStyle = "#1a3a4f";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 3 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Platform machinery spokes
  ctx.strokeStyle = "#2a5a7f";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    const detailAngle = (i / 5) * Math.PI * 2 + time;
    const detailX = screenPos.x + Math.cos(detailAngle) * 18 * zoom;
    const detailY = topY + 3 * zoom + Math.sin(detailAngle) * 9 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, topY + 3 * zoom);
    ctx.lineTo(detailX, detailY);
    ctx.stroke();
  }

  // --- COPPER COIL RINGS - BACK HALVES (behind central pillar) ---
  const mainCoilTurns = 7;
  const mainCoilH = coilHeight - 28 * zoom;
  const mainCoilR = 8 * zoom;
  for (let ct = 0; ct < mainCoilTurns; ct++) {
    const turnY = topY - 5 * zoom - ct * (mainCoilH / mainCoilTurns);
    // Back half shadow
    ctx.fillStyle = "rgb(65, 40, 20)";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      turnY + 1.5 * zoom,
      mainCoilR,
      mainCoilR * 0.4,
      0,
      Math.PI,
      Math.PI * 2,
    );
    ctx.closePath();
    ctx.fill();
    // Back half body (dark copper)
    ctx.fillStyle = "rgb(100, 60, 30)";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      turnY,
      mainCoilR,
      mainCoilR * 0.4,
      0,
      Math.PI,
      Math.PI * 2,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Central pillar - wider with isometric face shading
  const cpBaseW = 8;
  const cpTopW = 5;
  // Left face (darker)
  ctx.fillStyle = "#1a4a6b";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - cpBaseW * zoom, topY);
  ctx.lineTo(screenPos.x, topY + 3 * zoom);
  ctx.lineTo(screenPos.x, topY - coilHeight + 18 * zoom);
  ctx.lineTo(screenPos.x - cpTopW * zoom, topY - coilHeight + 20 * zoom);
  ctx.closePath();
  ctx.fill();
  // Right face (lighter)
  ctx.fillStyle = "#3d7a9b";
  ctx.beginPath();
  ctx.moveTo(screenPos.x + cpBaseW * zoom, topY);
  ctx.lineTo(screenPos.x, topY + 3 * zoom);
  ctx.lineTo(screenPos.x, topY - coilHeight + 18 * zoom);
  ctx.lineTo(screenPos.x + cpTopW * zoom, topY - coilHeight + 20 * zoom);
  ctx.closePath();
  ctx.fill();
  // Edge highlights
  ctx.strokeStyle = "#6aadcc";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(screenPos.x - cpBaseW * zoom, topY);
  ctx.lineTo(screenPos.x - cpTopW * zoom, topY - coilHeight + 20 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(screenPos.x + cpBaseW * zoom, topY);
  ctx.lineTo(screenPos.x + cpTopW * zoom, topY - coilHeight + 20 * zoom);
  ctx.stroke();
  // Top cap
  ctx.fillStyle = "#4d8aab";
  ctx.beginPath();
  ctx.moveTo(screenPos.x - cpTopW * zoom, topY - coilHeight + 20 * zoom);
  ctx.lineTo(screenPos.x, topY - coilHeight + 18 * zoom);
  ctx.lineTo(screenPos.x + cpTopW * zoom, topY - coilHeight + 20 * zoom);
  ctx.lineTo(screenPos.x, topY - coilHeight + 22 * zoom);
  ctx.closePath();
  ctx.fill();

  // Central pillar tech lines
  for (let pl = 0; pl < 5; pl++) {
    const plY = topY - (pl * (coilHeight - 20 * zoom)) / 6;
    const plW = cpBaseW - pl * 0.5;
    ctx.strokeStyle = "rgba(80, 160, 200, 0.35)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x - plW * zoom, plY);
    ctx.lineTo(screenPos.x + plW * zoom, plY);
    ctx.stroke();
  }

  // --- COPPER COIL RINGS - FRONT HALVES (in front of central pillar) ---
  for (let ct = 0; ct < mainCoilTurns; ct++) {
    const turnY = topY - 5 * zoom - ct * (mainCoilH / mainCoilTurns);
    // Front half shadow
    ctx.fillStyle = "rgb(80, 50, 25)";
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      turnY + 1.5 * zoom,
      mainCoilR,
      mainCoilR * 0.4,
      0,
      0,
      Math.PI,
    );
    ctx.closePath();
    ctx.fill();
    // Front half body with copper gradient
    const mcGrad = ctx.createLinearGradient(
      screenPos.x - mainCoilR,
      turnY,
      screenPos.x + mainCoilR,
      turnY,
    );
    mcGrad.addColorStop(0, "rgb(120, 75, 35)");
    mcGrad.addColorStop(0.3, "rgb(180, 120, 55)");
    mcGrad.addColorStop(0.5, "rgb(220, 160, 80)");
    mcGrad.addColorStop(0.7, "rgb(180, 120, 55)");
    mcGrad.addColorStop(1, "rgb(120, 75, 35)");
    ctx.fillStyle = mcGrad;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, turnY, mainCoilR, mainCoilR * 0.4, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    // Front half highlight
    ctx.strokeStyle = "rgba(255, 200, 120, 0.7)";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      turnY - 0.8 * zoom,
      mainCoilR * 0.85,
      mainCoilR * 0.32,
      0,
      0.15,
      Math.PI - 0.15,
    );
    ctx.stroke();
  }

  // === TOP RAILING FRONT HALF (so sub-coils render on top) ===
  const bw4 = 30 + tower.level * 4;
  const railW = bw4 * zoom * 0.5;
  const railD = bw4 * zoom * ISO_PRISM_D_FACTOR;
  const railY = topY + 4 * zoom;
  const railRX = railW * 0.88;
  const railRY = railD * 0.88;
  const railH = 5 * zoom;
  drawIsometricRailing(
    ctx,
    screenPos.x,
    railY,
    railRX,
    railRY,
    railH,
    32,
    16,
    {
      rail: "#2a6a8a",
      topRail: "#3a8aaa",
      backPanel: "rgba(45, 90, 123, 0.35)",
      frontPanel: "rgba(45, 90, 123, 0.25)",
    },
    zoom,
    "front",
  );

  // === SUB-COIL TOWERS with PISTONS, 3D COILS, and INSULATORS ===
  const coilPositions = [
    { x: 0, y: -10, size: 0.7 },
    { x: -19, y: 0, size: 0.7 },
    { x: 19, y: 0, size: 0.7 },
    { x: 0, y: 10, size: 0.8 },
  ];

  for (const pos of coilPositions) {
    const cx = screenPos.x + pos.x * zoom;
    const cy = topY + pos.y * zoom - 0.5 * zoom;
    const coilSize = pos.size;

    // Base platform
    ctx.fillStyle = "#1a3a4f";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      8 * zoom * coilSize,
      4 * zoom * coilSize,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Amplifier housing
    ctx.fillStyle = "#3a6a8f";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy - 2 * zoom * coilSize,
      10 * zoom * coilSize,
      5 * zoom * coilSize,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Inner tech ring
    ctx.fillStyle = "#2a4a5f";
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy - 1 * zoom * coilSize,
      6 * zoom * coilSize,
      3 * zoom * coilSize,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // --- COPPER COIL RINGS - BACK HALVES (behind sub-tower pillar) ---
    const subCoilTurns = 4;
    const subCoilH = 14 * zoom * coilSize;
    const subCoilR = 6 * zoom * coilSize;
    for (let ct = 0; ct < subCoilTurns; ct++) {
      const turnY = cy - 4 * zoom * coilSize - ct * (subCoilH / subCoilTurns);
      // Back half shadow
      ctx.fillStyle = "rgb(65, 40, 20)";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        turnY + 1.5 * zoom * coilSize,
        subCoilR,
        subCoilR * 0.4,
        0,
        Math.PI,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.fill();
      // Back half body (dark copper)
      ctx.fillStyle = "rgb(100, 60, 30)";
      ctx.beginPath();
      ctx.ellipse(cx, turnY, subCoilR, subCoilR * 0.4, 0, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    // Pillar - wider with isometric face shading
    const subPillarW = 4 * zoom * coilSize;
    const subPillarH = 20 * zoom * coilSize;
    // Left face
    ctx.fillStyle = "#1d4a6b";
    ctx.beginPath();
    ctx.moveTo(cx - subPillarW, cy);
    ctx.lineTo(cx, cy + 1.5 * zoom * coilSize);
    ctx.lineTo(cx, cy - subPillarH);
    ctx.lineTo(cx - subPillarW * 0.7, cy - subPillarH);
    ctx.closePath();
    ctx.fill();
    // Right face
    ctx.fillStyle = "#3a7a9b";
    ctx.beginPath();
    ctx.moveTo(cx + subPillarW, cy);
    ctx.lineTo(cx, cy + 1.5 * zoom * coilSize);
    ctx.lineTo(cx, cy - subPillarH);
    ctx.lineTo(cx + subPillarW * 0.7, cy - subPillarH);
    ctx.closePath();
    ctx.fill();
    // Edge
    ctx.strokeStyle = "#6aadcc";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx - subPillarW, cy);
    ctx.lineTo(cx - subPillarW * 0.7, cy - subPillarH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + subPillarW, cy);
    ctx.lineTo(cx + subPillarW * 0.7, cy - subPillarH);
    ctx.stroke();

    // --- COPPER COIL RINGS - FRONT HALVES (in front of sub-tower pillar) ---
    for (let ct = 0; ct < subCoilTurns; ct++) {
      const turnY = cy - 4 * zoom * coilSize - ct * (subCoilH / subCoilTurns);
      // Front half shadow
      ctx.fillStyle = "rgb(80, 50, 25)";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        turnY + 1.5 * zoom * coilSize,
        subCoilR,
        subCoilR * 0.4,
        0,
        0,
        Math.PI,
      );
      ctx.closePath();
      ctx.fill();
      // Front half body with copper gradient
      const scGrad = ctx.createLinearGradient(
        cx - subCoilR,
        turnY,
        cx + subCoilR,
        turnY,
      );
      scGrad.addColorStop(0, "rgb(120, 75, 35)");
      scGrad.addColorStop(0.3, "rgb(180, 120, 55)");
      scGrad.addColorStop(0.5, "rgb(220, 160, 80)");
      scGrad.addColorStop(0.7, "rgb(180, 120, 55)");
      scGrad.addColorStop(1, "rgb(120, 75, 35)");
      ctx.fillStyle = scGrad;
      ctx.beginPath();
      ctx.ellipse(cx, turnY, subCoilR, subCoilR * 0.4, 0, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      // Front half highlight
      ctx.strokeStyle = "rgba(255, 200, 120, 0.7)";
      ctx.lineWidth = 1.2 * zoom * coilSize;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        turnY - 0.8 * zoom * coilSize,
        subCoilR * 0.85,
        subCoilR * 0.32,
        0,
        0.15,
        Math.PI - 0.15,
      );
      ctx.stroke();
    }

    // --- PISTON on each sub-coil ---
    const subPistonExt =
      (3 + Math.sin(time * 3 + pos.x * 0.5) * 2 + attackPulse * 5) *
      zoom *
      coilSize;
    const subPistonDir = pos.x > 0 ? 1 : pos.x < 0 ? -1 : pos.y < 0 ? 1 : -1;
    const subPistonX = cx + subPistonDir * 5 * zoom * coilSize;
    const subPistonY = cy - 12 * zoom * coilSize;
    ctx.fillStyle = "#3a5a7a";
    ctx.fillRect(
      subPistonX - 1.8 * zoom,
      subPistonY - 5 * zoom * coilSize,
      3.6 * zoom,
      5 * zoom * coilSize,
    );
    ctx.fillStyle = "#8abace";
    ctx.fillRect(
      subPistonX - 0.7 * zoom,
      subPistonY - 5 * zoom * coilSize - subPistonExt,
      1.4 * zoom,
      subPistonExt + 1.5 * zoom,
    );
    ctx.fillStyle = "#5a9aba";
    ctx.beginPath();
    ctx.ellipse(
      subPistonX,
      subPistonY - 5 * zoom * coilSize - subPistonExt,
      2 * zoom,
      0.8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (attackPulse > 0.15) {
      ctx.fillStyle = `rgba(80, 200, 255, ${attackPulse * 0.3})`;
      for (let v = 0; v < 2; v++) {
        const vy = ((time * 10 + v * 0.4) % 1) * 3 * zoom;
        ctx.beginPath();
        ctx.arc(
          subPistonX,
          subPistonY - 5.5 * zoom * coilSize - subPistonExt - vy,
          (0.8 + v * 0.3) * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // --- SUSPENSION INSULATOR on wire from sub-coil ---
    const insDir = pos.x !== 0 ? Math.sign(pos.x) : pos.y < 0 ? -0.7 : 0.7;
    const subInsX = cx + insDir * 8 * zoom * coilSize;
    const subInsTopY = cy - 15 * zoom * coilSize;
    ctx.strokeStyle = "#6a8aaa";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx + insDir * 3 * zoom * coilSize, subInsTopY);
    ctx.lineTo(subInsX, subInsTopY + 2 * zoom);
    ctx.stroke();
    for (let dd = 0; dd < 3; dd++) {
      const discY = subInsTopY + 2 * zoom + dd * 2.5 * zoom * coilSize;
      const discR = (2.5 - dd * 0.15) * zoom * coilSize;
      ctx.fillStyle = dd % 2 === 0 ? "#5a7a9a" : "#4a6a8a";
      ctx.beginPath();
      ctx.ellipse(subInsX, discY, discR, discR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mini orb with electricity
    const miniOrbY = cy - 25 * zoom * coilSize;
    const pulse = 0.8 + Math.sin(time * 6 + pos.x) * 0.2 + attackPulse * 0.3;
    const miniOrbSize = 6 * zoom * pulse * coilSize;

    const miniFieldAlpha = isAttacking ? 0.25 : 0.15;
    const miniFieldGrad = ctx.createRadialGradient(
      cx,
      miniOrbY,
      0,
      cx,
      miniOrbY,
      miniOrbSize * (2 + attackPulse * 0.5),
    );
    miniFieldGrad.addColorStop(
      0,
      `rgba(80, 200, 255, ${miniFieldAlpha + attackPulse * 0.2})`,
    );
    miniFieldGrad.addColorStop(
      0.5,
      `rgba(40, 160, 255, ${0.08 + attackPulse * 0.12})`,
    );
    miniFieldGrad.addColorStop(1, "rgba(0, 120, 255, 0)");
    ctx.fillStyle = miniFieldGrad;
    ctx.beginPath();
    ctx.arc(
      cx,
      miniOrbY,
      miniOrbSize * (2 + attackPulse * 0.5),
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.shadowColor = isAttacking ? "#88ffff" : "#00ccff";
    ctx.shadowBlur = (15 + attackPulse * 15) * zoom * pulse;
    const miniOrbGrad = ctx.createRadialGradient(
      cx - 1.5 * zoom * coilSize,
      miniOrbY - 1.5 * zoom * coilSize,
      0,
      cx,
      miniOrbY,
      miniOrbSize,
    );
    if (isAttacking) {
      miniOrbGrad.addColorStop(0, "#ffffff");
      miniOrbGrad.addColorStop(0.15, "#ffffff");
      miniOrbGrad.addColorStop(0.35, "#ccffff");
      miniOrbGrad.addColorStop(0.6, "#00ddff");
      miniOrbGrad.addColorStop(0.85, "#0088ff");
      miniOrbGrad.addColorStop(1, "#0066cc");
    } else {
      miniOrbGrad.addColorStop(0, "#ffffff");
      miniOrbGrad.addColorStop(0.25, "#ccffff");
      miniOrbGrad.addColorStop(0.5, "#00ccff");
      miniOrbGrad.addColorStop(0.8, "#0088ff");
      miniOrbGrad.addColorStop(1, "#0044aa");
    }
    ctx.fillStyle = miniOrbGrad;
    ctx.beginPath();
    ctx.arc(cx, miniOrbY, miniOrbSize, 0, Math.PI * 2);
    ctx.fill();

    if (attackPulse > 0.1) {
      const miniCoreGrad = ctx.createRadialGradient(
        cx,
        miniOrbY,
        0,
        cx,
        miniOrbY,
        miniOrbSize * 0.5,
      );
      miniCoreGrad.addColorStop(0, `rgba(255, 255, 255, ${attackPulse})`);
      miniCoreGrad.addColorStop(
        0.5,
        `rgba(220, 255, 255, ${attackPulse * 0.9})`,
      );
      miniCoreGrad.addColorStop(1, `rgba(150, 255, 255, ${attackPulse * 0.5})`);
      ctx.fillStyle = miniCoreGrad;
      ctx.beginPath();
      ctx.arc(cx, miniOrbY, miniOrbSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
      ctx.beginPath();
      ctx.arc(cx, miniOrbY, miniOrbSize * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Mini electric arcs (3D layered)
    const miniArcCount = 5;
    for (let a = 0; a < miniArcCount; a++) {
      const arcAngle = time * 3 + a * ((Math.PI * 2) / miniArcCount) + pos.x;
      const arcLength =
        (9 + Math.sin(time * 13 + a * 4.3 + pos.x) * 4) * zoom * coilSize;
      const segCnt = 3;
      const miniPts: { x: number; y: number }[] = [{ x: cx, y: miniOrbY }];
      for (let s = 1; s <= segCnt; s++) {
        const t = s / segCnt;
        const jAmp = (1 - t * 0.35) * 4 * zoom * coilSize;
        miniPts.push({
          x:
            cx +
            Math.cos(arcAngle) * arcLength * t +
            Math.sin(time * 22 + a * 5 + s * 7) * jAmp,
          y:
            miniOrbY +
            Math.sin(arcAngle) * arcLength * 0.4 * t +
            Math.cos(time * 18 + a * 4 + s * 9) * jAmp * 0.5,
        });
      }
      ctx.save();
      ctx.shadowColor = "#00ccff";
      ctx.shadowBlur = 6 * zoom;
      ctx.strokeStyle = `rgba(40, 180, 255, ${0.15 + attackPulse * 0.12})`;
      ctx.lineWidth = 3 * zoom * coilSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(miniPts[0].x, miniPts[0].y);
      for (let p = 1; p < miniPts.length; p++)
        ctx.lineTo(miniPts[p].x, miniPts[p].y);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = `rgba(80, 220, 255, ${0.45 + attackPulse * 0.25})`;
      ctx.lineWidth = 1.2 * zoom * coilSize;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(miniPts[0].x, miniPts[0].y);
      for (let p = 1; p < miniPts.length; p++)
        ctx.lineTo(miniPts[p].x, miniPts[p].y);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + attackPulse * 0.2})`;
      ctx.lineWidth = 0.5 * zoom * coilSize;
      ctx.beginPath();
      ctx.moveTo(miniPts[0].x, miniPts[0].y);
      for (let p = 1; p < miniPts.length; p++)
        ctx.lineTo(miniPts[p].x, miniPts[p].y);
      ctx.stroke();
    }
  }

  // --- VIBRATION DAMPERS on wires between sub-coils ---
  for (let vd = 0; vd < 3; vd++) {
    const vdAngle = (vd / 3) * Math.PI * 2 + 0.5;
    const vdX = screenPos.x + Math.cos(vdAngle) * 10 * zoom;
    const vdY = topY - coilHeight * 0.3 + Math.sin(vdAngle) * 5 * zoom;
    const swing = Math.sin(time * 3.8 + vd * 1.6) * 2.5 * zoom;
    ctx.fillStyle = "#4a6a8a";
    ctx.fillRect(vdX - 1.2 * zoom, vdY - 0.5 * zoom, 2.4 * zoom, 1 * zoom);
    ctx.strokeStyle = "#6a8aaa";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(vdX - 3.5 * zoom, vdY + 2.5 * zoom + swing);
    ctx.quadraticCurveTo(
      vdX,
      vdY + 0.5 * zoom,
      vdX + 3.5 * zoom,
      vdY + 2.5 * zoom - swing,
    );
    ctx.stroke();
    for (const ws of [-1, 1]) {
      const wx = vdX + ws * 3.5 * zoom;
      const wy = vdY + 2.5 * zoom + (ws === -1 ? swing : -swing);
      ctx.fillStyle = "#3a5a7a";
      ctx.beginPath();
      ctx.ellipse(wx, wy, 1.2 * zoom, 1.8 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- CAPACITOR BANK (circular arrangement with charge indicators) ---
  for (let cb = 0; cb < 6; cb++) {
    const cbAngle = (cb / 6) * Math.PI * 2 + time * 0.4;
    const cbR = 13 * zoom;
    const cbX = screenPos.x + Math.cos(cbAngle) * cbR;
    const cbY = topY - coilHeight * 0.75 + Math.sin(cbAngle) * cbR * 0.5;
    const charge = Math.max(
      0,
      Math.min(
        1,
        0.3 + Math.sin(time * 2.5 + cb * 0.8) * 0.25 + attackPulse * 0.5,
      ),
    );
    ctx.fillStyle = "#1a3a5a";
    ctx.beginPath();
    ctx.ellipse(cbX, cbY, 2.2 * zoom, 3.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(80, 200, 255, ${charge * 0.6})`;
    ctx.beginPath();
    ctx.ellipse(
      cbX,
      cbY + (1 - charge) * 2.5 * zoom,
      1.5 * zoom,
      charge * 2.5 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#b87333";
    ctx.beginPath();
    ctx.arc(cbX, cbY - 3.5 * zoom, 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- TENSION / STRAIN ASSEMBLIES between sub-coils ---
  for (let ta = 0; ta < 2; ta++) {
    const taSide = ta === 0 ? -1 : 1;
    const taX = screenPos.x + taSide * 20 * zoom;
    const taY = topY - coilHeight * 0.12;
    ctx.fillStyle = "#4a6a8a";
    ctx.beginPath();
    ctx.moveTo(taX - 0.8 * zoom, taY - 2.5 * zoom);
    ctx.lineTo(taX + 0.8 * zoom, taY - 2.5 * zoom);
    ctx.lineTo(taX + 1.2 * zoom, taY);
    ctx.lineTo(taX + 0.8 * zoom, taY + 2.5 * zoom);
    ctx.lineTo(taX - 0.8 * zoom, taY + 2.5 * zoom);
    ctx.lineTo(taX - 1.2 * zoom, taY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a8aaa";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(taX, taY - 2.5 * zoom);
    ctx.lineTo(taX + taSide * 3 * zoom, taY - 8 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(taX, taY + 2.5 * zoom);
    ctx.lineTo(taX + taSide * 3 * zoom, taY + 8 * zoom);
    ctx.stroke();
    ctx.fillStyle = `rgba(80, 200, 255, ${0.3 + attackPulse * 0.4})`;
    ctx.beginPath();
    ctx.arc(taX, taY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // === CENTRAL MAIN ORB ===
  const mainOrbY = topY - coilHeight + 4 * zoom - attackPulse * 5 * zoom;
  const mainOrbPulse = 0.9 + Math.sin(time * 5) * 0.2 + attackPulse * 0.3;
  const mainOrbSize = 12 * zoom * mainOrbPulse;

  tower._orbScreenY = mainOrbY;

  // Outer energy field
  const mainFieldAlpha = isAttacking ? 0.3 : 0.2;
  const energyFieldGrad = ctx.createRadialGradient(
    screenPos.x,
    mainOrbY,
    0,
    screenPos.x,
    mainOrbY,
    mainOrbSize * (2.5 + attackPulse * 0.5),
  );
  energyFieldGrad.addColorStop(
    0,
    `rgba(80, 220, 255, ${mainFieldAlpha + attackPulse * 0.25})`,
  );
  energyFieldGrad.addColorStop(
    0.4,
    `rgba(40, 180, 255, ${0.1 + attackPulse * 0.15})`,
  );
  energyFieldGrad.addColorStop(
    0.7,
    `rgba(20, 140, 255, ${0.05 + attackPulse * 0.1})`,
  );
  energyFieldGrad.addColorStop(1, "rgba(0, 100, 255, 0)");
  ctx.fillStyle = energyFieldGrad;
  ctx.beginPath();
  ctx.arc(
    screenPos.x,
    mainOrbY,
    mainOrbSize * (2.5 + attackPulse * 0.5),
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Main orb gradient
  ctx.shadowColor = isAttacking ? "#88ffff" : "#00ccff";
  ctx.shadowBlur = (30 + attackPulse * 30) * zoom * mainOrbPulse;
  const mainOrbGrad = ctx.createRadialGradient(
    screenPos.x - 4 * zoom,
    mainOrbY - 4 * zoom,
    0,
    screenPos.x,
    mainOrbY,
    mainOrbSize,
  );
  if (isAttacking) {
    mainOrbGrad.addColorStop(0, "#ffffff");
    mainOrbGrad.addColorStop(0.15, "#ffffff");
    mainOrbGrad.addColorStop(0.35, "#ccffff");
    mainOrbGrad.addColorStop(0.6, "#00ddff");
    mainOrbGrad.addColorStop(0.85, "#0088ff");
    mainOrbGrad.addColorStop(1, "#0066cc");
  } else {
    mainOrbGrad.addColorStop(0, "#ffffff");
    mainOrbGrad.addColorStop(0.2, "#ccffff");
    mainOrbGrad.addColorStop(0.5, "#00ccff");
    mainOrbGrad.addColorStop(0.8, "#0088ff");
    mainOrbGrad.addColorStop(1, "#0044aa");
  }
  ctx.fillStyle = mainOrbGrad;
  ctx.beginPath();
  ctx.arc(screenPos.x, mainOrbY, mainOrbSize, 0, Math.PI * 2);
  ctx.fill();

  if (attackPulse > 0.1) {
    const coreGrad = ctx.createRadialGradient(
      screenPos.x,
      mainOrbY,
      0,
      screenPos.x,
      mainOrbY,
      mainOrbSize * 0.5,
    );
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${attackPulse})`);
    coreGrad.addColorStop(0.5, `rgba(220, 255, 255, ${attackPulse * 0.9})`);
    coreGrad.addColorStop(1, `rgba(150, 255, 255, ${attackPulse * 0.5})`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(screenPos.x, mainOrbY, mainOrbSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${attackPulse})`;
    ctx.beginPath();
    ctx.arc(screenPos.x, mainOrbY, mainOrbSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // === MAIN ORB LIGHTNING ARCS with sub-branches ===
  const mainArcCount = 8 + Math.floor(attackPulse * 5);
  for (let i = 0; i < mainArcCount; i++) {
    const arcAngle = time * 2.5 + i * ((Math.PI * 2) / mainArcCount);
    const arcLength = (22 + Math.sin(time * 11 + i * 3.7) * 12) * zoom;
    const segCount = 5 + Math.floor(Math.sin(time * 7 + i * 2.1) * 1.5 + 1.5);
    const boltPts: { x: number; y: number }[] = [
      { x: screenPos.x, y: mainOrbY },
    ];
    for (let s = 1; s <= segCount; s++) {
      const t = s / segCount;
      const jAmp = (1 - t * 0.3) * 9 * zoom;
      boltPts.push({
        x:
          screenPos.x +
          Math.cos(arcAngle) * arcLength * t +
          Math.sin(time * 20 + i * 4.1 + s * 6.3) * jAmp,
        y:
          mainOrbY +
          Math.sin(arcAngle) * arcLength * 0.4 * t +
          Math.cos(time * 16 + i * 3.7 + s * 8.9) * jAmp * 0.4,
      });
    }
    ctx.save();
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 10 * zoom;
    ctx.strokeStyle = `rgba(40, 180, 255, ${0.2 + attackPulse * 0.18})`;
    ctx.lineWidth = 4.5 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++)
      ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = `rgba(80, 230, 255, ${0.55 + attackPulse * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++)
      ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.65 + attackPulse * 0.3})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(boltPts[0].x, boltPts[0].y);
    for (let p = 1; p < boltPts.length; p++)
      ctx.lineTo(boltPts[p].x, boltPts[p].y);
    ctx.stroke();
    const tip = boltPts[boltPts.length - 1];
    ctx.fillStyle = `rgba(200, 255, 255, ${0.55 + attackPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    if (i % 2 === 0) {
      const bIdx = Math.max(1, Math.floor(segCount * 0.45));
      const bp = boltPts[bIdx];
      const bAngle = arcAngle + Math.sin(time * 10 + i * 2.3) * 0.9;
      const bLen = arcLength * 0.45;
      const bMid = {
        x:
          bp.x +
          Math.cos(bAngle) * bLen * 0.5 +
          Math.sin(time * 22 + i) * 2 * zoom,
        y: bp.y + Math.sin(bAngle) * bLen * 0.2,
      };
      const bEnd = {
        x: bp.x + Math.cos(bAngle) * bLen,
        y: bp.y + Math.sin(bAngle) * bLen * 0.35,
      };
      ctx.strokeStyle = `rgba(60, 220, 255, ${0.3 + attackPulse * 0.25})`;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();
      ctx.strokeStyle = `rgba(180, 255, 255, ${0.4 + attackPulse * 0.25})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + attackPulse * 0.2})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(bp.x, bp.y);
      ctx.lineTo(bMid.x, bMid.y);
      ctx.lineTo(bEnd.x, bEnd.y);
      ctx.stroke();
    }
  }

  // === CONNECTING ARCS between sub-coils and main orb (3D layered) ===
  for (let i = 0; i < coilPositions.length; i++) {
    const pos = coilPositions[i];
    const cx = screenPos.x + pos.x * zoom;
    const cy = topY + pos.y * zoom - 0.5 * zoom - 25 * zoom * pos.size;
    const segCnt = 4;
    const connPts: { x: number; y: number }[] = [{ x: cx, y: cy }];
    for (let s = 1; s <= segCnt; s++) {
      const t = s / segCnt;
      const jAmp = (1 - Math.abs(t - 0.5) * 2) * 10 * zoom;
      connPts.push({
        x:
          cx +
          (screenPos.x - cx) * t +
          Math.sin(time * 18 + i * 5 + s * 7) * jAmp,
        y:
          cy +
          (mainOrbY - cy) * t +
          Math.cos(time * 14 + i * 3 + s * 5) * jAmp * 0.35,
      });
    }
    ctx.save();
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 8 * zoom;
    ctx.strokeStyle = `rgba(40, 180, 255, ${0.15 + attackPulse * 0.15})`;
    ctx.lineWidth = 4 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(connPts[0].x, connPts[0].y);
    for (let p = 1; p < connPts.length; p++)
      ctx.lineTo(connPts[p].x, connPts[p].y);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = `rgba(80, 230, 255, ${0.45 + attackPulse * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(connPts[0].x, connPts[0].y);
    for (let p = 1; p < connPts.length; p++)
      ctx.lineTo(connPts[p].x, connPts[p].y);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + attackPulse * 0.25})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(connPts[0].x, connPts[0].y);
    for (let p = 1; p < connPts.length; p++)
      ctx.lineTo(connPts[p].x, connPts[p].y);
    ctx.stroke();
  }

  // --- WIRE MESH between sub-coils (with attack vibration) ---
  for (let wm = 0; wm < coilPositions.length; wm++) {
    const from = coilPositions[wm];
    const to = coilPositions[(wm + 1) % coilPositions.length];
    const fX = screenPos.x + from.x * zoom;
    const fY = topY + from.y * zoom - 0.5 * zoom - 15 * zoom * from.size;
    const tX = screenPos.x + to.x * zoom;
    const tY = topY + to.y * zoom - 8 * zoom - 15 * zoom * to.size;
    const mX = (fX + tX) / 2;
    const mY = (fY + tY) / 2 + 5 * zoom + Math.sin(time * 2 + wm) * 1.5 * zoom;
    const vibrate = Math.sin(time * 12 + wm * 3) * attackPulse * 1.5 * zoom;
    ctx.strokeStyle = `rgba(100, 180, 220, ${0.25 + Math.sin(time * 2 + wm) * 0.08})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(fX, fY);
    ctx.quadraticCurveTo(mX + vibrate, mY, tX, tY);
    ctx.stroke();
  }
}

// ARCH TOWER - Mystical Fantasy Portal with Ancient Runes
