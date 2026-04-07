import { drawOrganicBlobAt } from "../../../../rendering/helpers";
import type { WorldMapDrawContext } from "./drawContext";

export function drawAshTree(
  dc: WorldMapDrawContext,
  ax: number,
  ayPct: number,
  scale: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const ay = getY(ayPct);
  const treeSeed = ax * 7.3 + ayPct * 11.1;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(
    ax + 3 * scale,
    ay + 4 * scale,
    10 * scale,
    4 * scale,
    0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Ash/soot ground patch
  ctx.fillStyle = "rgba(30,20,15,0.3)";
  ctx.beginPath();
  ctx.ellipse(ax, ay + 2 * scale, 8 * scale, 3 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main trunk — thick, charred, slightly twisted
  const trunkH = (35 + seededRandom(treeSeed) * 15) * scale;
  const trunkLean = (seededRandom(treeSeed + 1) - 0.5) * 6 * scale;
  const trunkW = (3.5 + seededRandom(treeSeed + 2) * 1.5) * scale;
  const trunkTopX = ax + trunkLean;
  const trunkTopY = ay - trunkH;
  const trunkMidX =
    ax + trunkLean * 0.4 + (seededRandom(treeSeed + 3) - 0.5) * 4 * scale;
  const trunkMidY = ay - trunkH * 0.55;

  const trunkGrad = ctx.createLinearGradient(ax - trunkW, ay, ax + trunkW, ay);
  trunkGrad.addColorStop(0, "#0a0808");
  trunkGrad.addColorStop(0.3, "#1e1614");
  trunkGrad.addColorStop(0.5, "#2a201c");
  trunkGrad.addColorStop(0.7, "#1a1210");
  trunkGrad.addColorStop(1, "#0a0808");
  ctx.strokeStyle = trunkGrad;
  ctx.lineWidth = trunkW;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.quadraticCurveTo(trunkMidX, trunkMidY, trunkTopX, trunkTopY);
  ctx.stroke();

  // Bark cracks with faint inner glow
  ctx.lineWidth = 0.6 * scale;
  for (let c = 0; c < 5; c++) {
    const ct = 0.15 + c * 0.16;
    const cx =
      ax +
      (trunkTopX - ax) * ct +
      (seededRandom(treeSeed + c * 7 + 10) - 0.5) * 2 * scale;
    const cy = ay + (trunkTopY - ay) * ct;
    ctx.strokeStyle = `rgba(180,60,10,${0.15 + seededRandom(treeSeed + c * 7 + 11) * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(cx - 1.5 * scale, cy - 1 * scale);
    ctx.lineTo(cx + 1.5 * scale, cy + 1.5 * scale);
    ctx.stroke();
  }

  // Gnarled branches — multiple claw-like limbs reaching upward
  const branchCount = 3 + Math.floor(seededRandom(treeSeed + 20) * 3);
  for (let b = 0; b < branchCount; b++) {
    const bSeed = treeSeed + b * 31 + 50;
    const bFrac = 0.45 + seededRandom(bSeed) * 0.5;
    const bStartX =
      ax +
      (trunkTopX - ax) * bFrac +
      (seededRandom(bSeed + 1) - 0.5) * 2 * scale;
    const bStartY = ay + (trunkTopY - ay) * bFrac;
    const bSide = seededRandom(bSeed + 2) > 0.5 ? 1 : -1;
    const bAngle =
      -0.3 +
      seededRandom(bSeed + 3) * 0.6 +
      bSide * (0.3 + seededRandom(bSeed + 4) * 0.5);
    const bLen = (12 + seededRandom(bSeed + 5) * 14) * scale;
    const bEndX = bStartX + Math.cos(bAngle - Math.PI / 2) * bLen;
    const bEndY = bStartY + Math.sin(bAngle - Math.PI / 2) * bLen;
    const bCpX = bStartX + (bEndX - bStartX) * 0.5 + bSide * 4 * scale;
    const bCpY = bStartY + (bEndY - bStartY) * 0.6;

    // Branch stroke
    const bWidth = (2.2 - bFrac * 1.2) * scale;
    ctx.strokeStyle = "#1a1210";
    ctx.lineWidth = bWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bStartX, bStartY);
    ctx.quadraticCurveTo(bCpX, bCpY, bEndX, bEndY);
    ctx.stroke();

    // Sub-branches (smaller twigs at the end)
    for (let sb = 0; sb < 2; sb++) {
      const sbSeed = bSeed + sb * 17 + 100;
      const sbLen = (4 + seededRandom(sbSeed) * 6) * scale;
      const sbAngle =
        bAngle - Math.PI / 2 + (seededRandom(sbSeed + 1) - 0.5) * 1.2;
      const sbX = bEndX + Math.cos(sbAngle) * sbLen;
      const sbY = bEndY + Math.sin(sbAngle) * sbLen;
      ctx.strokeStyle = "#151010";
      ctx.lineWidth = bWidth * 0.45;
      ctx.beginPath();
      ctx.moveTo(bEndX, bEndY);
      ctx.lineTo(sbX, sbY);
      ctx.stroke();
    }

    // Ember dots along branches
    const emberCount = 1 + Math.floor(seededRandom(bSeed + 7) * 3);
    for (let e = 0; e < emberCount; e++) {
      const et = 0.3 + seededRandom(bSeed + e * 13 + 200) * 0.6;
      const mt = 1 - et;
      const eX = mt * mt * bStartX + 2 * mt * et * bCpX + et * et * bEndX;
      const eY = mt * mt * bStartY + 2 * mt * et * bCpY + et * et * bEndY;
      const ePulse = 0.5 + Math.sin(time * 3 + bSeed + e * 2.1) * 0.3;
      const eSize = (1.2 + seededRandom(bSeed + e * 13 + 201) * 1.5) * scale;
      // Glow halo
      const eGlow = ctx.createRadialGradient(eX, eY, 0, eX, eY, eSize * 3);
      eGlow.addColorStop(0, `rgba(255,120,30,${ePulse * 0.35})`);
      eGlow.addColorStop(1, "rgba(255,80,10,0)");
      ctx.fillStyle = eGlow;
      ctx.beginPath();
      ctx.arc(eX, eY, eSize * 3, 0, Math.PI * 2);
      ctx.fill();
      // Bright core
      ctx.fillStyle = `rgba(255,160,50,${ePulse * 0.8})`;
      ctx.beginPath();
      ctx.arc(eX, eY, eSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,220,120,${ePulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(eX, eY, eSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Trunk ember dots
  for (let e = 0; e < 4; e++) {
    const et = 0.2 + e * 0.18;
    const eX =
      ax +
      (trunkTopX - ax) * et +
      (seededRandom(treeSeed + e * 19 + 300) - 0.5) * trunkW * 0.8;
    const eY = ay + (trunkTopY - ay) * et;
    const ePulse = 0.4 + Math.sin(time * 2.5 + treeSeed + e * 1.8) * 0.3;
    const eSize = (1 + seededRandom(treeSeed + e * 19 + 301) * 1.2) * scale;
    const eGlow = ctx.createRadialGradient(eX, eY, 0, eX, eY, eSize * 2.5);
    eGlow.addColorStop(0, `rgba(255,100,20,${ePulse * 0.4})`);
    eGlow.addColorStop(1, "rgba(255,60,10,0)");
    ctx.fillStyle = eGlow;
    ctx.beginPath();
    ctx.arc(eX, eY, eSize * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,140,40,${ePulse * 0.7})`;
    ctx.beginPath();
    ctx.arc(eX, eY, eSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smoldering base glow
  const baseGlow = ctx.createRadialGradient(ax, ay, 0, ax, ay, 6 * scale);
  baseGlow.addColorStop(
    0,
    `rgba(200,60,10,${0.12 + Math.sin(time * 1.5 + treeSeed) * 0.05})`
  );
  baseGlow.addColorStop(1, "rgba(150,30,5,0)");
  ctx.fillStyle = baseGlow;
  ctx.beginPath();
  ctx.arc(ax, ay, 6 * scale, 0, Math.PI * 2);
  ctx.fill();
}

export function drawVolcano(
  dc: WorldMapDrawContext,
  vx: number,
  vyPct: number,
  vw: number,
  heightPx: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const vy = getY(vyPct);
  const hw = vw / 2;
  const vSeed = vx * 1.7 + vyPct * 4.3;

  // --- Ambient lava glow underneath — organic shape ---
  const ambientGlow = ctx.createRadialGradient(
    vx,
    vy,
    hw * 0.3,
    vx,
    vy - heightPx * 0.3,
    hw * 1.4
  );
  ambientGlow.addColorStop(
    0,
    `rgba(200, 60, 10, ${0.12 + Math.sin(time * 1.5 + vx) * 0.04})`
  );
  ambientGlow.addColorStop(
    0.5,
    `rgba(120, 30, 5, ${0.06 + Math.sin(time * 2 + vx) * 0.02})`
  );
  ambientGlow.addColorStop(1, "rgba(80, 20, 5, 0)");
  ctx.fillStyle = ambientGlow;
  drawOrganicBlobAt(
    ctx,
    vx,
    vy - heightPx * 0.2,
    hw * 1.3,
    heightPx * 0.8,
    vSeed + 50,
    0.12,
    14
  );
  ctx.fill();

  // --- Ground shadow — organic ---
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  drawOrganicBlobAt(
    ctx,
    vx + 4,
    vy + 8,
    hw * 0.7,
    heightPx * 0.15,
    vSeed + 60,
    0.15,
    12
  );
  ctx.fill();

  // --- BACK SLOPE (shadowed right side for 3D) ---
  const backGrad = ctx.createLinearGradient(
    vx,
    vy - heightPx,
    vx + hw * 0.6,
    vy
  );
  backGrad.addColorStop(0, "#2a1510");
  backGrad.addColorStop(0.4, "#1e0e0a");
  backGrad.addColorStop(1, "#140808");
  ctx.fillStyle = backGrad;
  ctx.beginPath();
  ctx.moveTo(vx + hw * 0.12, vy - heightPx);
  // Organic rocky right edge using bezier curves
  ctx.bezierCurveTo(
    vx + hw * 0.22,
    vy - heightPx * 0.7,
    vx + hw * 0.38,
    vy - heightPx * 0.4,
    vx + hw * 0.55,
    vy + 6
  );
  ctx.lineTo(vx + hw * 0.12, vy + 6);
  ctx.closePath();
  ctx.fill();

  // --- FRONT SLOPE (lit left side) ---
  const frontGrad = ctx.createLinearGradient(
    vx - hw * 0.6,
    vy - heightPx,
    vx + hw * 0.1,
    vy
  );
  frontGrad.addColorStop(0, "#4a2a20");
  frontGrad.addColorStop(0.15, "#583028");
  frontGrad.addColorStop(0.35, "#4a2520");
  frontGrad.addColorStop(0.55, "#3a1a15");
  frontGrad.addColorStop(0.75, "#2a1210");
  frontGrad.addColorStop(1, "#1a0a08");
  ctx.fillStyle = frontGrad;
  ctx.beginPath();
  ctx.moveTo(vx - hw * 0.12, vy - heightPx);
  // Organic rocky left edge
  ctx.bezierCurveTo(
    vx - hw * 0.25,
    vy - heightPx * 0.65,
    vx - hw * 0.42,
    vy - heightPx * 0.3,
    vx - hw * 0.55,
    vy + 6
  );
  ctx.lineTo(vx + hw * 0.12, vy + 6);
  ctx.lineTo(vx + hw * 0.12, vy - heightPx);
  ctx.closePath();
  ctx.fill();

  // --- Buttress ridge/spur on left side for mass ---
  const buttGrad = ctx.createLinearGradient(
    vx - hw * 0.55,
    vy - heightPx * 0.4,
    vx - hw * 0.2,
    vy
  );
  buttGrad.addColorStop(0, "#3a2018");
  buttGrad.addColorStop(0.6, "#2a1410");
  buttGrad.addColorStop(1, "#1a0a08");
  ctx.fillStyle = buttGrad;
  ctx.beginPath();
  ctx.moveTo(vx - hw * 0.35, vy - heightPx * 0.45);
  ctx.bezierCurveTo(
    vx - hw * 0.52,
    vy - heightPx * 0.32,
    vx - hw * 0.62,
    vy - heightPx * 0.15,
    vx - hw * 0.65,
    vy + 6
  );
  ctx.lineTo(vx - hw * 0.55, vy + 6);
  ctx.bezierCurveTo(
    vx - hw * 0.48,
    vy - heightPx * 0.1,
    vx - hw * 0.38,
    vy - heightPx * 0.28,
    vx - hw * 0.35,
    vy - heightPx * 0.45
  );
  ctx.closePath();
  ctx.fill();

  // --- Rocky ridge details on front face ---
  ctx.save();
  for (let r = 0; r < 5; r++) {
    const ridgeY = vy - heightPx * (0.15 + r * 0.15);
    const ridgeW = hw * (0.5 - r * 0.06);
    const ridgeLight = 30 + r * 8;
    ctx.strokeStyle = `rgba(${ridgeLight + 20}, ${ridgeLight}, ${ridgeLight - 5}, 0.25)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(vx - ridgeW, ridgeY + seededRandom(vx + r) * 4);
    ctx.quadraticCurveTo(
      vx - ridgeW * 0.3,
      ridgeY - 2 + seededRandom(vx + r + 1) * 3,
      vx + ridgeW * 0.4,
      ridgeY + 1 + seededRandom(vx + r + 2) * 3
    );
    ctx.stroke();
  }
  ctx.restore();

  // --- Surface rock texture (small marks) ---
  ctx.save();
  ctx.globalAlpha = 0.15;
  for (let t = 0; t < 12; t++) {
    const tx = vx + (seededRandom(vx + t * 13) - 0.5) * hw * 0.8;
    const ty = vy - seededRandom(vx + t * 13 + 1) * heightPx * 0.85;
    const ts = 1.5 + seededRandom(vx + t * 13 + 2) * 3;
    ctx.fillStyle = seededRandom(t + vx) > 0.5 ? "#5a3a2a" : "#1a0a06";
    ctx.beginPath();
    ctx.ellipse(tx, ty, ts, ts * 0.4, seededRandom(t) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // --- Glowing fissures/cracks across the rock face ---
  ctx.save();
  for (let fi = 0; fi < 5; fi++) {
    const fiStartX = vx + (seededRandom(vSeed + fi * 11) - 0.5) * hw * 0.7;
    const fiStartY =
      vy - heightPx * (0.2 + seededRandom(vSeed + fi * 13) * 0.6);
    const fiLen = 6 + seededRandom(vSeed + fi * 15) * 12;
    const fiAngle = -0.3 + seededRandom(vSeed + fi * 17) * 1.2;
    const fiEndX = fiStartX + Math.cos(fiAngle) * fiLen;
    const fiEndY = fiStartY + Math.sin(fiAngle) * fiLen;
    const fiPulse = 0.4 + Math.sin(time * 2.5 + fi * 1.7 + vSeed) * 0.3;

    ctx.strokeStyle = `rgba(255, 120, 30, ${fiPulse * 0.5})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fiStartX, fiStartY);
    ctx.quadraticCurveTo(
      (fiStartX + fiEndX) / 2 + (seededRandom(vSeed + fi * 19) - 0.5) * 5,
      (fiStartY + fiEndY) / 2,
      fiEndX,
      fiEndY
    );
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 200, 80, ${fiPulse * 0.6})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 240, 180, ${fiPulse * 0.3})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  ctx.restore();

  // --- Cooled lava patches on slopes (dark organic blobs) ---
  ctx.save();
  ctx.globalAlpha = 0.3;
  for (let cp = 0; cp < 6; cp++) {
    const cpX = vx + (seededRandom(vSeed + cp * 21) - 0.5) * hw * 0.8;
    const cpY = vy - heightPx * (0.1 + seededRandom(vSeed + cp * 23) * 0.65);
    const cpW = 3 + seededRandom(vSeed + cp * 25) * 6;
    const cpH = 2 + seededRandom(vSeed + cp * 27) * 3;
    ctx.fillStyle = seededRandom(vSeed + cp) > 0.5 ? "#1a0a06" : "#0d0503";
    drawOrganicBlobAt(ctx, cpX, cpY, cpW, cpH, vSeed + cp * 4.1, 0.3, 8);
    ctx.fill();
  }
  ctx.restore();

  // --- Base rubble/boulders around the volcano ---
  for (let br = 0; br < 8; br++) {
    const brAngle =
      (br / 8) * Math.PI * 2 + seededRandom(vSeed + br * 31) * 0.4;
    const brDist = hw * (0.5 + seededRandom(vSeed + br * 33) * 0.2);
    const brX = vx + Math.cos(brAngle) * brDist;
    const brY = vy + 4 + Math.sin(brAngle) * brDist * 0.25;
    const brSize = 2 + seededRandom(vSeed + br * 35) * 4;
    const brShade = 20 + Math.floor(seededRandom(vSeed + br * 37) * 25);
    ctx.fillStyle = `rgb(${brShade + 10}, ${brShade}, ${brShade - 5})`;
    drawOrganicBlobAt(
      ctx,
      brX,
      brY,
      brSize,
      brSize * 0.55,
      vSeed + br * 2.3,
      0.25,
      7
    );
    ctx.fill();
  }

  // --- LAVA FLOWS (winding rivers with branching tributaries) ---
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let f = 0; f < 3; f++) {
    const fSeed = seededRandom(vx + f * 17);
    const flowStartX = vx - hw * 0.08 + f * hw * 0.08;
    const flowEndX = vx + (f - 1) * hw * 0.35 + fSeed * hw * 0.15;
    const flowMid1X =
      flowStartX + (flowEndX - flowStartX) * 0.3 + (fSeed - 0.5) * 12;
    const flowMid1Y = vy - heightPx * 0.65;
    const flowMid2X =
      flowStartX + (flowEndX - flowStartX) * 0.65 + (fSeed - 0.5) * 18;
    const flowMid2Y = vy - heightPx * 0.3;
    const flowPulse = 0.55 + Math.sin(time * 2.2 + f * 1.8 + vx * 0.01) * 0.2;

    const drawFlowPath = () => {
      ctx.beginPath();
      ctx.moveTo(flowStartX, vy - heightPx + 7);
      ctx.bezierCurveTo(
        flowMid1X,
        flowMid1Y,
        flowMid2X,
        flowMid2Y,
        flowEndX,
        vy + 2
      );
    };

    // Scorched rock bleed along flow
    ctx.strokeStyle = `rgba(60, 15, 5, ${flowPulse * 0.25})`;
    ctx.lineWidth = 10;
    drawFlowPath();
    ctx.stroke();

    // Outer glow (wide, dim)
    ctx.strokeStyle = `rgba(180, 40, 5, ${flowPulse * 0.35})`;
    ctx.lineWidth = 7;
    drawFlowPath();
    ctx.stroke();

    // Main lava body
    ctx.strokeStyle = `rgba(220, 80, 15, ${flowPulse * 0.7})`;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Bright core
    ctx.strokeStyle = `rgba(255, 180, 60, ${flowPulse * 0.55})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hot white center
    ctx.strokeStyle = `rgba(255, 240, 180, ${flowPulse * 0.3})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Branching tributary from mid-flow
    const tribX =
      flowStartX + (flowEndX - flowStartX) * 0.55 + (fSeed - 0.5) * 8;
    const tribY = vy - heightPx * 0.4;
    const tribEndX = tribX + (seededRandom(vSeed + f * 41) - 0.3) * hw * 0.3;
    const tribEndY = vy + 1;
    const tribPulse = flowPulse * 0.7;

    ctx.strokeStyle = `rgba(200, 50, 10, ${tribPulse * 0.3})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tribX, tribY);
    ctx.quadraticCurveTo(
      tribX + (tribEndX - tribX) * 0.4,
      tribY + (tribEndY - tribY) * 0.6,
      tribEndX,
      tribEndY
    );
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 140, 40, ${tribPulse * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 230, 150, ${tribPulse * 0.25})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // --- CRATER ---
  // Crater rim (dark rock ring)
  const craterW = hw * 0.28;
  const craterH = heightPx * 0.12;
  const craterY = vy - heightPx + 2;

  // Rim shadow
  ctx.fillStyle = "#0a0404";
  ctx.beginPath();
  ctx.ellipse(vx, craterY + 3, craterW + 2, craterH + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rim rock with gradient
  const rimGrad = ctx.createRadialGradient(
    vx - craterW * 0.3,
    craterY - 2,
    0,
    vx,
    craterY,
    craterW + 4
  );
  rimGrad.addColorStop(0, "#5a3020");
  rimGrad.addColorStop(0.5, "#3a1a12");
  rimGrad.addColorStop(1, "#1a0a06");
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.ellipse(vx, craterY, craterW + 3, craterH + 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crater pit (deep dark)
  ctx.fillStyle = "#080303";
  ctx.beginPath();
  ctx.ellipse(vx, craterY + 1, craterW - 1, craterH - 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Visible lava pool inside crater
  const glowPulse = 0.6 + Math.sin(time * 2.8 + vx * 0.02) * 0.25;
  const craterLavaGrad = ctx.createRadialGradient(
    vx - craterW * 0.15,
    craterY,
    0,
    vx,
    craterY + 1,
    craterW * 0.8
  );
  craterLavaGrad.addColorStop(0, `rgba(255, 240, 140, ${glowPulse * 0.9})`);
  craterLavaGrad.addColorStop(0.3, `rgba(255, 160, 40, ${glowPulse * 0.8})`);
  craterLavaGrad.addColorStop(0.7, `rgba(220, 60, 10, ${glowPulse * 0.6})`);
  craterLavaGrad.addColorStop(1, `rgba(120, 20, 5, ${glowPulse * 0.3})`);
  ctx.fillStyle = craterLavaGrad;
  ctx.beginPath();
  ctx.ellipse(
    vx,
    craterY + 1,
    craterW * 0.75,
    craterH * 0.7,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Bubbles in crater lava
  for (let bub = 0; bub < 3; bub++) {
    const bubPhase = (time * 1.5 + bub * 2.1 + vSeed) % 3;
    if (bubPhase < 1.5) {
      const bubScale = Math.sin((bubPhase / 1.5) * Math.PI);
      const bubX = vx + (seededRandom(vSeed + bub * 41) - 0.5) * craterW * 0.5;
      const bubY =
        craterY + (seededRandom(vSeed + bub * 43) - 0.5) * craterH * 0.3;
      const bubR = (1.5 + seededRandom(vSeed + bub * 45) * 2) * bubScale;
      ctx.strokeStyle = `rgba(255, 220, 100, ${0.6 * bubScale})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(bubX, bubY, bubR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Lava glow from crater (pulsing, extends upward)
  const lavaGlow = ctx.createRadialGradient(
    vx,
    craterY + 1,
    0,
    vx,
    craterY + 1,
    craterW * 1.8
  );
  lavaGlow.addColorStop(0, `rgba(255, 220, 100, ${glowPulse * 0.5})`);
  lavaGlow.addColorStop(0.2, `rgba(255, 140, 40, ${glowPulse * 0.35})`);
  lavaGlow.addColorStop(0.5, `rgba(200, 60, 10, ${glowPulse * 0.15})`);
  lavaGlow.addColorStop(1, "rgba(120, 30, 5, 0)");
  ctx.fillStyle = lavaGlow;
  ctx.beginPath();
  ctx.arc(vx, craterY + 1, craterW * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Rim highlight (hot edge glint)
  ctx.strokeStyle = `rgba(255, 130, 40, ${0.3 + Math.sin(time * 3 + vx) * 0.15})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(
    vx,
    craterY,
    craterW + 1,
    craterH + 1,
    0,
    Math.PI + 0.5,
    Math.PI * 2 - 0.5
  );
  ctx.stroke();

  // --- Heat shimmer distortion above crater ---
  ctx.save();
  ctx.globalAlpha = 0.035 + Math.sin(time * 3.5 + vx) * 0.015;
  for (let hs = 0; hs < 5; hs++) {
    const hsY = craterY - 10 - hs * 8;
    ctx.fillStyle = "#ff6020";
    ctx.beginPath();
    for (let hx = vx - hw * 0.3; hx < vx + hw * 0.3; hx += 3) {
      const distort = Math.sin(time * 7 + hx * 0.1 + hs * 0.9) * (2 + hs * 0.5);
      if (hx === vx - hw * 0.3) {
        ctx.moveTo(hx, hsY + distort);
      } else {
        ctx.lineTo(hx, hsY + distort);
      }
    }
    ctx.lineTo(vx + hw * 0.3, hsY + 5);
    ctx.lineTo(vx - hw * 0.3, hsY + 5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // --- SMOKE PLUME (volumetric with organic shapes) ---
  for (let s = 0; s < 8; s++) {
    const smokeAge = (time * 10 + s * 12) % 65;
    const smokeY2 = craterY - smokeAge * 1.2;
    const drift = Math.sin(time * 0.8 + s * 2.2) * (4 + smokeAge * 0.3);
    const smokeR = 5 + smokeAge * 0.5;
    const alpha = Math.max(0, 0.35 - smokeAge / 80);
    if (alpha <= 0) {
      continue;
    }

    ctx.fillStyle = `rgba(45, 35, 30, ${alpha})`;
    drawOrganicBlobAt(
      ctx,
      vx + drift,
      smokeY2,
      smokeR,
      smokeR * 0.8,
      vSeed + s * 3.7,
      0.2,
      10
    );
    ctx.fill();

    ctx.fillStyle = `rgba(60, 50, 42, ${alpha * 0.4})`;
    drawOrganicBlobAt(
      ctx,
      vx + drift + smokeR * 0.35,
      smokeY2 - smokeR * 0.25,
      smokeR * 0.65,
      smokeR * 0.55,
      vSeed + s * 5.1,
      0.2,
      8
    );
    ctx.fill();

    if (smokeAge < 20) {
      ctx.fillStyle = `rgba(180, 70, 15, ${alpha * 0.4})`;
      drawOrganicBlobAt(
        ctx,
        vx + drift,
        smokeY2 + smokeR * 0.35,
        smokeR * 0.45,
        smokeR * 0.35,
        vSeed + s * 7.3,
        0.25,
        8
      );
      ctx.fill();
    }
  }

  // --- Volcanic bombs (ejected glowing rocks arcing out) ---
  for (let vb = 0; vb < 3; vb++) {
    const vbCycle = (time * 8 + vb * 18 + vSeed) % 50;
    if (vbCycle > 35) {
      continue;
    }
    const vbProgress = vbCycle / 35;
    const vbAngle =
      -Math.PI * 0.5 + (seededRandom(vSeed + vb * 51) - 0.5) * 1.2;
    const vbSpeed = 15 + seededRandom(vSeed + vb * 53) * 10;
    const vbX = vx + Math.cos(vbAngle) * vbSpeed * vbProgress;
    const vbY =
      craterY +
      Math.sin(vbAngle) * vbSpeed * vbProgress +
      20 * vbProgress * vbProgress;
    const vbAlpha = Math.max(0, 1 - vbProgress * 1.2);
    const vbSize = 1.5 + seededRandom(vSeed + vb * 55) * 1.5;

    ctx.fillStyle = `rgba(255, 120, 20, ${vbAlpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(vbX, vbY, vbSize + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 220, 80, ${vbAlpha})`;
    ctx.beginPath();
    ctx.arc(vbX, vbY, vbSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Scattered embers from crater ---
  for (let e = 0; e < 6; e++) {
    const eAge = (time * 25 + e * 16 + vx) % 45;
    const eX = vx + Math.sin(time * 3 + e * 2.5 + vx) * (3 + eAge * 0.35);
    const eY = craterY - eAge * 0.9;
    const eAlpha = Math.max(0, 0.8 - eAge / 35);
    if (eAlpha > 0) {
      ctx.fillStyle = `rgba(255, ${150 + Math.floor(seededRandom(e + vx) * 80)}, 30, ${eAlpha})`;
      ctx.beginPath();
      ctx.arc(eX, eY, 1 + seededRandom(e + vx) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Falling ash particles around the volcano ---
  ctx.save();
  for (let ash = 0; ash < 5; ash++) {
    const ashX = vx + (seededRandom(vSeed + ash * 61) - 0.5) * hw * 1.4;
    const ashCycle = (time * 8 + ash * 11 + vSeed) % 40;
    const ashY = craterY - 20 + ashCycle * 1.5;
    const ashDrift = Math.sin(time * 1.2 + ash * 1.8) * 3;
    const ashAlpha = Math.max(0, 0.3 - ashCycle / 60);
    if (ashAlpha > 0) {
      ctx.fillStyle = `rgba(80, 65, 55, ${ashAlpha})`;
      ctx.beginPath();
      ctx.arc(
        ashX + ashDrift,
        ashY,
        0.8 + seededRandom(vSeed + ash * 63) * 0.8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawLavaPool(
  dc: WorldMapDrawContext,
  px: number,
  pyPct: number,
  width: number,
  heightRatio: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const py = getY(pyPct);
  const h = width * heightRatio;
  const seed = px * 2.3 + pyPct * 5.1;

  // Heat distortion shimmer above pool
  ctx.save();
  ctx.globalAlpha = 0.04 + Math.sin(time * 3 + px) * 0.02;
  for (let hh = 0; hh < 4; hh++) {
    const heatY = py - h - 5 - hh * 6;
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    for (let hx = px - width; hx < px + width; hx += 4) {
      const distort = Math.sin(time * 6 + hx * 0.08 + hh * 0.7) * 2;
      if (hx === px - width) {
        ctx.moveTo(hx, heatY + distort);
      } else {
        ctx.lineTo(hx, heatY + distort);
      }
    }
    ctx.lineTo(px + width, heatY + 4);
    ctx.lineTo(px - width, heatY + 4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Outer glow — organic shape
  const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, width * 1.6);
  glowGrad.addColorStop(
    0,
    `rgba(255,100,30,${0.28 + Math.sin(time * 2) * 0.1})`
  );
  glowGrad.addColorStop(
    0.4,
    `rgba(255,60,20,${0.15 + Math.sin(time * 2.5) * 0.06})`
  );
  glowGrad.addColorStop(1, "rgba(200,40,10,0)");
  ctx.fillStyle = glowGrad;
  drawOrganicBlobAt(ctx, px, py, width * 1.6, h * 1.6, seed + 10, 0.12, 16);
  ctx.fill();

  // Cooled lava crust edge — organic
  ctx.fillStyle = "#2a1a0c";
  drawOrganicBlobAt(ctx, px, py, width + 5, h + 4, seed + 0.3, 0.2, 20);
  ctx.fill();
  // Rocky crust bumps along edge
  for (let ec = 0; ec < 10; ec++) {
    const angle = (ec / 10) * Math.PI * 2 + seededRandom(px + ec + 100) * 0.3;
    const edgeR = width + 3 + seededRandom(px + ec) * 4;
    const edgeX = px + Math.cos(angle) * edgeR * 0.95;
    const edgeY = py + Math.sin(angle) * edgeR * heightRatio * 0.95;
    ctx.fillStyle = seededRandom(px + ec + 50) > 0.5 ? "#3a2214" : "#221008";
    drawOrganicBlobAt(
      ctx,
      edgeX,
      edgeY,
      3 + seededRandom(px + ec + 60) * 3,
      2 + seededRandom(px + ec + 61) * 2,
      ec * 4.3,
      0.3,
      8
    );
    ctx.fill();
  }

  // Main lava surface — organic blob
  const lavaGrad = ctx.createRadialGradient(
    px - width * 0.2,
    py - h * 0.2,
    0,
    px,
    py,
    width
  );
  lavaGrad.addColorStop(0, "#ffdd55");
  lavaGrad.addColorStop(0.2, "#ffaa22");
  lavaGrad.addColorStop(0.5, "#ee5511");
  lavaGrad.addColorStop(0.8, "#cc2200");
  lavaGrad.addColorStop(1, "#881100");
  ctx.fillStyle = lavaGrad;
  drawOrganicBlobAt(ctx, px, py, width, h, seed, 0.18, 18);
  ctx.fill();

  // Crusted dark surface patches — organic blobs
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (let cr = 0; cr < 5; cr++) {
    const crX = px - width * 0.5 + seededRandom(px + cr * 19) * width;
    const crY = py - h * 0.3 + seededRandom(px + cr * 23) * h * 0.6;
    const crSize = 4 + seededRandom(px + cr * 29) * 8;
    const crDx = (crX - px) / width;
    const crDy = (crY - py) / h;
    if (crDx * crDx + crDy * crDy < 0.7) {
      ctx.fillStyle = "rgba(30,15,10,0.6)";
      drawOrganicBlobAt(
        ctx,
        crX,
        crY,
        crSize,
        crSize * 0.6,
        cr * 7.1,
        0.25,
        10
      );
      ctx.fill();
      ctx.strokeStyle = `rgba(255,180,60,${0.4 + Math.sin(time * 3 + cr) * 0.2})`;
      ctx.lineWidth = 1;
      drawOrganicBlobAt(
        ctx,
        crX,
        crY,
        crSize + 1,
        crSize * 0.6 + 1,
        cr * 7.1,
        0.25,
        10
      );
      ctx.stroke();
    }
  }
  ctx.restore();

  // Bubbles forming and popping
  for (let b = 0; b < 6; b++) {
    const bubbleCycle = (time * 2.5 + b * 1.2 + px * 0.1) % 2.5;
    const bx = px - width * 0.5 + seededRandom(px + b) * width;
    const by = py - h * 0.3 + seededRandom(px + b + 10) * h * 0.6;
    const bDx = (bx - px) / width;
    const bDy = (by - py) / h;
    if (bDx * bDx + bDy * bDy < 0.7) {
      if (bubbleCycle < 1.8) {
        const bSize = 1.5 + bubbleCycle * 2.5;
        ctx.fillStyle = `rgba(255,200,100,${0.5 - bubbleCycle * 0.2})`;
        ctx.beginPath();
        ctx.arc(bx, by, bSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,240,180,${0.3 - bubbleCycle * 0.1})`;
        ctx.beginPath();
        ctx.arc(
          bx - bSize * 0.3,
          by - bSize * 0.3,
          bSize * 0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else if (bubbleCycle < 2.1) {
        const popPhase = (bubbleCycle - 1.8) / 0.3;
        ctx.fillStyle = `rgba(255,180,60,${0.6 - popPhase * 0.6})`;
        for (let sp = 0; sp < 4; sp++) {
          const spAngle = (sp / 4) * Math.PI * 2 + b;
          const spDist = 3 + popPhase * 6;
          ctx.beginPath();
          ctx.arc(
            bx + Math.cos(spAngle) * spDist,
            by + Math.sin(spAngle) * spDist * 0.5,
            1.5 - popPhase,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }

  // Surface shimmer — organic curves
  ctx.strokeStyle = `rgba(255,220,150,${0.3 + Math.sin(time * 4) * 0.15})`;
  ctx.lineWidth = 1;
  drawOrganicBlobAt(
    ctx,
    px - width * 0.2,
    py - h * 0.1,
    width * 0.3,
    h * 0.2,
    seed + 20,
    0.2,
    8
  );
  ctx.stroke();
  drawOrganicBlobAt(
    ctx,
    px + width * 0.15,
    py + h * 0.1,
    width * 0.2,
    h * 0.15,
    seed + 30,
    0.2,
    8
  );
  ctx.stroke();
}

export function drawLavaRiver(
  dc: WorldMapDrawContext,
  points: number[][],
  riverWidth?: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const rw = riverWidth || 7;
  const seed = points[0][0] * 1.7 + points[0][1] * 3.3;

  const tracePath = (offsetX: number, offsetY: number) => {
    const pts = points.map((p) => [p[0] + offsetX, getY(p[1]) + offsetY]);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    if (pts.length === 2) {
      ctx.lineTo(pts[1][0], pts[1][1]);
    } else {
      const tension = 0.35;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[Math.min(pts.length - 1, i + 1)];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const cp1x = p1[0] + (p2[0] - p0[0]) * tension;
        const cp1y = p1[1] + (p2[1] - p0[1]) * tension;
        const cp2x = p2[0] - (p3[0] - p1[0]) * tension;
        const cp2y = p2[1] - (p3[1] - p1[1]) * tension;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
      }
    }
  };

  const sampleSpline = (t: number): [number, number] => {
    const totalSegs = points.length - 1;
    const rawIdx = t * totalSegs;
    const segIdx = Math.min(Math.floor(rawIdx), totalSegs - 1);
    const segT = rawIdx - segIdx;
    const x =
      points[segIdx][0] + (points[segIdx + 1][0] - points[segIdx][0]) * segT;
    const yPct =
      points[segIdx][1] + (points[segIdx + 1][1] - points[segIdx][1]) * segT;
    return [x, getY(yPct)];
  };

  const pulse = 0.5 + Math.sin(time * 2) * 0.5;

  // Scorched terrain bleed — ground discoloration along the banks
  tracePath(0, 0);
  ctx.strokeStyle = "rgba(50,20,5,0.12)";
  ctx.lineWidth = rw * 6;
  ctx.stroke();

  // Ambient heat glow — wide, soft
  tracePath(0, 0);
  ctx.strokeStyle = `rgba(255,60,0,${0.06 + pulse * 0.03})`;
  ctx.lineWidth = rw * 5;
  ctx.stroke();

  tracePath(0, 0);
  ctx.strokeStyle = `rgba(255,80,10,${0.1 + pulse * 0.05})`;
  ctx.lineWidth = rw * 3.5;
  ctx.stroke();

  // Cooled rock bank — organic edge with bumps
  tracePath(0, 0);
  ctx.strokeStyle = "#1a0c06";
  ctx.lineWidth = rw * 2.4;
  ctx.stroke();

  // Bank texture — rocky crust detail
  tracePath(0, 0);
  ctx.strokeStyle = "rgba(40,22,10,0.7)";
  ctx.lineWidth = rw * 2;
  ctx.stroke();

  // Inner bank highlight (hot rock edge)
  tracePath(0, 0);
  ctx.strokeStyle = `rgba(120,40,10,${0.4 + pulse * 0.15})`;
  ctx.lineWidth = rw * 1.6;
  ctx.stroke();

  // Main molten lava body
  tracePath(0, 0);
  ctx.strokeStyle = `rgba(255,${90 + pulse * 50},${10 + pulse * 25},0.92)`;
  ctx.lineWidth = rw;
  ctx.stroke();

  // Bright hot vein
  tracePath(0, 0);
  ctx.strokeStyle = `rgba(255,200,80,${0.5 + pulse * 0.25})`;
  ctx.lineWidth = rw * 0.5;
  ctx.stroke();

  // White-hot core — animated width
  tracePath(0, 0);
  ctx.strokeStyle = `rgba(255,240,180,${0.2 + pulse * 0.2})`;
  ctx.lineWidth = rw * 0.2 + Math.sin(time * 4) * 0.5;
  ctx.stroke();

  // Organic blob pools where the river widens at bends
  for (let i = 1; i < points.length - 1; i++) {
    const poolX = points[i][0];
    const poolY = getY(points[i][1]);
    const poolR = rw * 0.6 + seededRandom(seed + i * 7) * rw * 0.4;
    // Lava pool at bend
    const bendGrad = ctx.createRadialGradient(
      poolX,
      poolY,
      0,
      poolX,
      poolY,
      poolR * 1.5
    );
    bendGrad.addColorStop(0, `rgba(255,200,80,${0.3 + pulse * 0.15})`);
    bendGrad.addColorStop(0.5, `rgba(255,100,20,${0.2 + pulse * 0.1})`);
    bendGrad.addColorStop(1, "rgba(180,40,5,0)");
    ctx.fillStyle = bendGrad;
    drawOrganicBlobAt(
      ctx,
      poolX,
      poolY,
      poolR * 1.5,
      poolR,
      seed + i * 3.7,
      0.25,
      10
    );
    ctx.fill();
  }

  // Rock formations along banks — organic blobs
  for (let rb = 0; rb < points.length * 3; rb++) {
    const t = rb / (points.length * 3 - 1);
    const [sx, sy] = sampleSpline(t);
    const side = seededRandom(seed + rb * 11) > 0.5 ? 1 : -1;
    const offset = rw * 1.2 + seededRandom(seed + rb * 11 + 1) * rw * 0.8;
    const perpAngle =
      t < 0.99
        ? Math.atan2(
            sampleSpline(Math.min(1, t + 0.05))[1] - sy,
            sampleSpline(Math.min(1, t + 0.05))[0] - sx
          ) +
          Math.PI / 2
        : 0;
    const rockX = sx + Math.cos(perpAngle) * offset * side;
    const rockY = sy + Math.sin(perpAngle) * offset * side;
    const rockR = 2 + seededRandom(seed + rb * 11 + 2) * 4;
    ctx.fillStyle =
      seededRandom(seed + rb * 11 + 3) > 0.5 ? "#2a1508" : "#1a0c04";
    drawOrganicBlobAt(ctx, rockX, rockY, rockR, rockR * 0.6, rb * 3.1, 0.3, 8);
    ctx.fill();
  }

  // Drifting dark crust chunks
  for (let r = 0; r < 6; r++) {
    const speed = 5 + seededRandom(r + seed * 0.01) * 4;
    const raftProgress = ((time * speed + r * 18 + seed * 0.1) % 100) / 100;
    const [raftX, raftY] = sampleSpline(raftProgress);
    const raftSize = 1.5 + seededRandom(seed + r * 11) * 2;
    ctx.fillStyle = `rgba(35,18,10,${0.5 + seededRandom(r * 7) * 0.3})`;
    drawOrganicBlobAt(
      ctx,
      raftX,
      raftY,
      raftSize,
      raftSize * 0.5,
      r * 4.3,
      0.3,
      6
    );
    ctx.fill();
    ctx.strokeStyle = `rgba(255,120,30,${0.2 + pulse * 0.15})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Rising embers along the river
  for (let e = 0; e < 6; e++) {
    const eAge = (time * 12 + e * 15 + seed * 0.3) % 35;
    const eT = e / 5;
    const [ex0, ey0] = sampleSpline(eT);
    const ex = ex0 + Math.sin(time * 2 + e * 3) * 5;
    const ey = ey0 - eAge * 1.5;
    const eAlpha = Math.max(0, 0.7 - eAge / 25);
    if (eAlpha > 0) {
      const eSize = 1.2 - eAge * 0.025;
      if (eSize > 0.3) {
        ctx.fillStyle = `rgba(255,${180 - eAge * 4},${50 - eAge},${eAlpha})`;
        ctx.beginPath();
        ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Steam wisps at junction points
  for (let i = 1; i < points.length - 1; i++) {
    for (let s = 0; s < 3; s++) {
      const sAge = (time * 6 + s * 10 + i * 8) % 22;
      const sx = points[i][0] + Math.sin(time * 1.5 + s + i) * 6 + (s - 1) * 5;
      const sy = getY(points[i][1]) - 4 - sAge * 1.2;
      const sAlpha = Math.max(0, 0.12 - sAge / 35);
      if (sAlpha > 0) {
        ctx.fillStyle = `rgba(180,170,160,${sAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + sAge * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

export function drawObsidianSpire(
  dc: WorldMapDrawContext,
  sx: number,
  syPct: number,
  scale: number
) {
  const { ctx, getY, time } = dc;
  const sy = getY(syPct);

  // Shadow
  ctx.fillStyle = "rgba(20, 10, 10, 0.35)";
  ctx.beginPath();
  ctx.ellipse(
    sx + 5 * scale,
    sy + 4 * scale,
    14 * scale,
    5 * scale,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Purple/blue magical glow at base
  const magicGlow = ctx.createRadialGradient(
    sx,
    sy - 15 * scale,
    0,
    sx,
    sy - 15 * scale,
    20 * scale
  );
  magicGlow.addColorStop(
    0,
    `rgba(120, 80, 200, ${0.15 + Math.sin(time * 2 + sx) * 0.08})`
  );
  magicGlow.addColorStop(
    0.5,
    `rgba(80, 60, 180, ${0.08 + Math.sin(time * 1.5 + sx) * 0.04})`
  );
  magicGlow.addColorStop(1, "rgba(60, 40, 150, 0)");
  ctx.fillStyle = magicGlow;
  ctx.beginPath();
  ctx.arc(sx, sy - 15 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Main spire body
  const spireGrad = ctx.createLinearGradient(
    sx - 10 * scale,
    sy,
    sx + 10 * scale,
    sy - 42 * scale
  );
  spireGrad.addColorStop(0, "#1a1018");
  spireGrad.addColorStop(0.3, "#2a1a25");
  spireGrad.addColorStop(0.5, "#18101a");
  spireGrad.addColorStop(0.7, "#100a12");
  spireGrad.addColorStop(1, "#0a050a");
  ctx.fillStyle = spireGrad;
  ctx.beginPath();
  ctx.moveTo(sx - 10 * scale, sy + 2 * scale);
  ctx.lineTo(sx - 8 * scale, sy - 12 * scale);
  ctx.lineTo(sx - 6 * scale, sy - 25 * scale);
  ctx.lineTo(sx - 3 * scale, sy - 36 * scale);
  ctx.lineTo(sx - 2 * scale, sy - 42 * scale);
  ctx.lineTo(sx + 1 * scale, sy - 38 * scale);
  ctx.lineTo(sx + 3 * scale, sy - 35 * scale);
  ctx.lineTo(sx + 6 * scale, sy - 22 * scale);
  ctx.lineTo(sx + 8 * scale, sy - 18 * scale);
  ctx.lineTo(sx + 10 * scale, sy + 2 * scale);
  ctx.closePath();
  ctx.fill();

  // Reflective glass-like surface highlight (specular band)
  ctx.save();
  ctx.globalAlpha = 0.25;
  const reflectGrad = ctx.createLinearGradient(
    sx - 6 * scale,
    sy,
    sx - 2 * scale,
    sy - 40 * scale
  );
  reflectGrad.addColorStop(0, "rgba(120, 100, 140, 0)");
  reflectGrad.addColorStop(0.3, "rgba(140, 120, 160, 0.5)");
  reflectGrad.addColorStop(0.5, "rgba(180, 160, 200, 0.6)");
  reflectGrad.addColorStop(0.7, "rgba(140, 120, 160, 0.3)");
  reflectGrad.addColorStop(1, "rgba(120, 100, 140, 0)");
  ctx.fillStyle = reflectGrad;
  ctx.beginPath();
  ctx.moveTo(sx - 7 * scale, sy - 5 * scale);
  ctx.lineTo(sx - 4 * scale, sy - 32 * scale);
  ctx.lineTo(sx - 2 * scale, sy - 30 * scale);
  ctx.lineTo(sx - 5 * scale, sy - 5 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Colored highlight reflections (blue/purple)
  ctx.fillStyle = `rgba(100, 80, 200, ${0.12 + Math.sin(time * 1.5 + sx * 0.3) * 0.06})`;
  ctx.beginPath();
  ctx.moveTo(sx + 4 * scale, sy - 10 * scale);
  ctx.lineTo(sx + 6 * scale, sy - 20 * scale);
  ctx.lineTo(sx + 7 * scale, sy - 18 * scale);
  ctx.lineTo(sx + 5 * scale, sy - 8 * scale);
  ctx.closePath();
  ctx.fill();

  // Geometric fracture patterns
  ctx.strokeStyle = "rgba(80, 60, 100, 0.35)";
  ctx.lineWidth = 0.8;
  // Diagonal fractures
  ctx.beginPath();
  ctx.moveTo(sx - 8 * scale, sy - 8 * scale);
  ctx.lineTo(sx - 3 * scale, sy - 20 * scale);
  ctx.lineTo(sx + 2 * scale, sy - 15 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx + 5 * scale, sy - 5 * scale);
  ctx.lineTo(sx + 2 * scale, sy - 18 * scale);
  ctx.lineTo(sx - 1 * scale, sy - 30 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx - 5 * scale, sy - 15 * scale);
  ctx.lineTo(sx + 4 * scale, sy - 25 * scale);
  ctx.stroke();

  // Glowing magma cracks (brighter)
  ctx.strokeStyle = `rgba(255, 100, 30, ${0.6 + Math.sin(time * 3 + sx) * 0.3})`;
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(sx - 4 * scale, sy - 5 * scale);
  ctx.lineTo(sx - 2 * scale, sy - 18 * scale);
  ctx.lineTo(sx + 2 * scale, sy - 25 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx + 3 * scale, sy - 8 * scale);
  ctx.lineTo(sx + 5 * scale, sy - 20 * scale);
  ctx.stroke();

  // Crack glow aura
  ctx.save();
  ctx.globalAlpha = 0.15 + Math.sin(time * 2.5 + sx) * 0.08;
  ctx.strokeStyle = "rgba(255, 120, 60, 0.4)";
  ctx.lineWidth = 5 * scale;
  ctx.beginPath();
  ctx.moveTo(sx - 4 * scale, sy - 5 * scale);
  ctx.lineTo(sx - 2 * scale, sy - 18 * scale);
  ctx.lineTo(sx + 2 * scale, sy - 25 * scale);
  ctx.stroke();
  ctx.restore();
}

export function drawDemonStatue(
  dc: WorldMapDrawContext,
  dx: number,
  dyPct: number,
  scale: number
) {
  const { ctx, getY, time } = dc;
  const dy = getY(dyPct);

  // Ritual circle at base (glowing runes)
  ctx.save();
  const circleRadius = 18 * scale;
  // Outer circle glow
  const ritualGlow = ctx.createRadialGradient(
    dx,
    dy,
    circleRadius * 0.5,
    dx,
    dy,
    circleRadius * 1.3
  );
  ritualGlow.addColorStop(
    0,
    `rgba(180, 40, 20, ${0.1 + Math.sin(time * 1.5) * 0.05})`
  );
  ritualGlow.addColorStop(1, "rgba(150, 30, 15, 0)");
  ctx.fillStyle = ritualGlow;
  ctx.beginPath();
  ctx.arc(dx, dy, circleRadius * 1.3, 0, Math.PI * 2);
  ctx.fill();
  // Circle line
  ctx.strokeStyle = `rgba(200, 60, 30, ${0.4 + Math.sin(time * 2) * 0.15})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(dx, dy, circleRadius, 0, Math.PI * 2);
  ctx.stroke();
  // Inner circle
  ctx.beginPath();
  ctx.arc(dx, dy, circleRadius * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  // Runic symbols around circle
  for (let r = 0; r < 8; r++) {
    const runeAngle = (r / 8) * Math.PI * 2 + time * 0.2;
    const runeX = dx + Math.cos(runeAngle) * circleRadius * 0.85;
    const runeY = dy + Math.sin(runeAngle) * circleRadius * 0.85 * 0.5;
    ctx.fillStyle = `rgba(255, 80, 30, ${0.5 + Math.sin(time * 3 + r) * 0.3})`;
    ctx.beginPath();
    ctx.arc(runeX, runeY, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Pedestal (stepped)
  ctx.fillStyle = "#2a1a18";
  ctx.fillRect(dx - 14 * scale, dy - 5 * scale, 28 * scale, 10 * scale);
  ctx.fillStyle = "#3a2a28";
  ctx.fillRect(dx - 12 * scale, dy - 9 * scale, 24 * scale, 6 * scale);
  ctx.fillStyle = "#352520";
  ctx.fillRect(dx - 10 * scale, dy - 12 * scale, 20 * scale, 5 * scale);

  // Body (wider torso)
  const statueGrad = ctx.createLinearGradient(
    dx - 10 * scale,
    dy - 42 * scale,
    dx + 10 * scale,
    dy - 12 * scale
  );
  statueGrad.addColorStop(0, "#2a2025");
  statueGrad.addColorStop(0.3, "#3a2a30");
  statueGrad.addColorStop(0.6, "#2a2025");
  statueGrad.addColorStop(1, "#1a1015");
  ctx.fillStyle = statueGrad;
  ctx.beginPath();
  ctx.moveTo(dx - 9 * scale, dy - 12 * scale);
  ctx.lineTo(dx - 8 * scale, dy - 22 * scale);
  ctx.lineTo(dx - 10 * scale, dy - 28 * scale);
  ctx.lineTo(dx - 7 * scale, dy - 34 * scale);
  ctx.lineTo(dx - 5 * scale, dy - 38 * scale);
  ctx.lineTo(dx + 5 * scale, dy - 38 * scale);
  ctx.lineTo(dx + 7 * scale, dy - 34 * scale);
  ctx.lineTo(dx + 10 * scale, dy - 28 * scale);
  ctx.lineTo(dx + 8 * scale, dy - 22 * scale);
  ctx.lineTo(dx + 9 * scale, dy - 12 * scale);
  ctx.closePath();
  ctx.fill();

  // Wings (spread outward)
  ctx.fillStyle = "#1a1018";
  // Left wing
  ctx.beginPath();
  ctx.moveTo(dx - 7 * scale, dy - 30 * scale);
  ctx.quadraticCurveTo(
    dx - 22 * scale,
    dy - 45 * scale,
    dx - 28 * scale,
    dy - 38 * scale
  );
  ctx.quadraticCurveTo(
    dx - 25 * scale,
    dy - 32 * scale,
    dx - 18 * scale,
    dy - 28 * scale
  );
  ctx.quadraticCurveTo(
    dx - 22 * scale,
    dy - 26 * scale,
    dx - 24 * scale,
    dy - 20 * scale
  );
  ctx.quadraticCurveTo(
    dx - 18 * scale,
    dy - 22 * scale,
    dx - 8 * scale,
    dy - 24 * scale
  );
  ctx.closePath();
  ctx.fill();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(dx + 7 * scale, dy - 30 * scale);
  ctx.quadraticCurveTo(
    dx + 22 * scale,
    dy - 45 * scale,
    dx + 28 * scale,
    dy - 38 * scale
  );
  ctx.quadraticCurveTo(
    dx + 25 * scale,
    dy - 32 * scale,
    dx + 18 * scale,
    dy - 28 * scale
  );
  ctx.quadraticCurveTo(
    dx + 22 * scale,
    dy - 26 * scale,
    dx + 24 * scale,
    dy - 20 * scale
  );
  ctx.quadraticCurveTo(
    dx + 18 * scale,
    dy - 22 * scale,
    dx + 8 * scale,
    dy - 24 * scale
  );
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = "#2a2025";
  ctx.beginPath();
  ctx.arc(dx, dy - 42 * scale, 7 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Horns (curved and detailed)
  ctx.fillStyle = "#1a1015";
  ctx.beginPath();
  ctx.moveTo(dx - 4 * scale, dy - 46 * scale);
  ctx.quadraticCurveTo(
    dx - 14 * scale,
    dy - 55 * scale,
    dx - 12 * scale,
    dy - 48 * scale
  );
  ctx.lineTo(dx - 6 * scale, dy - 44 * scale);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(dx + 4 * scale, dy - 46 * scale);
  ctx.quadraticCurveTo(
    dx + 14 * scale,
    dy - 55 * scale,
    dx + 12 * scale,
    dy - 48 * scale
  );
  ctx.lineTo(dx + 6 * scale, dy - 44 * scale);
  ctx.fill();

  // Glowing runic inscriptions on body
  ctx.strokeStyle = `rgba(255, 80, 30, ${0.4 + Math.sin(time * 3 + dx) * 0.25})`;
  ctx.lineWidth = 1;
  // Rune lines on torso
  ctx.beginPath();
  ctx.moveTo(dx - 3 * scale, dy - 18 * scale);
  ctx.lineTo(dx, dy - 22 * scale);
  ctx.lineTo(dx + 3 * scale, dy - 18 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(dx - 4 * scale, dy - 26 * scale);
  ctx.lineTo(dx, dy - 30 * scale);
  ctx.lineTo(dx + 4 * scale, dy - 26 * scale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(dx, dy - 16 * scale);
  ctx.lineTo(dx, dy - 32 * scale);
  ctx.stroke();

  // Glowing eyes
  ctx.fillStyle = `rgba(255, 50, 20, ${0.8 + Math.sin(time * 4 + dx) * 0.2})`;
  ctx.beginPath();
  ctx.arc(dx - 2.5 * scale, dy - 43 * scale, 1.8 * scale, 0, Math.PI * 2);
  ctx.arc(dx + 2.5 * scale, dy - 43 * scale, 1.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Eye glow aura
  const eyeGlow = ctx.createRadialGradient(
    dx,
    dy - 43 * scale,
    0,
    dx,
    dy - 43 * scale,
    12 * scale
  );
  eyeGlow.addColorStop(
    0,
    `rgba(255, 50, 20, ${0.25 + Math.sin(time * 3) * 0.1})`
  );
  eyeGlow.addColorStop(1, "rgba(255, 50, 20, 0)");
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(dx, dy - 43 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.fill();
}

export function drawFireElemental(
  dc: WorldMapDrawContext,
  fx: number,
  fyPct: number,
  scale: number
) {
  const { ctx, getY, time } = dc;
  const fy = getY(fyPct);
  const bob = Math.sin(time * 3 + fx) * 3;

  // Heat wave distortion ring
  ctx.save();
  ctx.globalAlpha = 0.04 + Math.sin(time * 3 + fx) * 0.02;
  for (let ring = 0; ring < 3; ring++) {
    const ringSize = 18 + ring * 8;
    ctx.strokeStyle = "#ff6600";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const distort = Math.sin(time * 5 + a * 3 + ring) * 2;
      const rx = fx + Math.cos(a) * (ringSize + distort) * scale;
      const ry =
        fy -
        12 * scale +
        bob +
        Math.sin(a) * (ringSize * 0.6 + distort) * scale;
      if (a === 0) {
        ctx.moveTo(rx, ry);
      } else {
        ctx.lineTo(rx, ry);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // Glow aura
  const auraGrad = ctx.createRadialGradient(
    fx,
    fy - 15 * scale + bob,
    0,
    fx,
    fy - 15 * scale + bob,
    28 * scale
  );
  auraGrad.addColorStop(
    0,
    `rgba(255, 160, 60, ${0.35 + Math.sin(time * 4 + fx) * 0.12})`
  );
  auraGrad.addColorStop(
    0.3,
    `rgba(255, 100, 30, ${0.2 + Math.sin(time * 3) * 0.08})`
  );
  auraGrad.addColorStop(
    0.6,
    `rgba(255, 60, 15, ${0.1 + Math.sin(time * 2.5) * 0.04})`
  );
  auraGrad.addColorStop(1, "rgba(255, 40, 10, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(fx, fy - 15 * scale + bob, 28 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Body flames (layered for better shape)
  for (let layer = 0; layer < 3; layer++) {
    for (let f = 0; f < 6; f++) {
      const flameHeight =
        22 -
        layer * 4 +
        Math.sin(time * 7 + f * 1.1 + layer * 0.5) * (8 - layer * 2);
      const flameWidth = 9 - layer * 1.5 - f * 0.6;
      const flamex = fx - 10 * scale + f * 4 * scale;
      const flamey = fy + bob + layer * 2 * scale;
      const r = Math.max(0, 255 - f * 15 - layer * 20);
      const g = Math.max(0, 80 + f * 30 + layer * 30);
      const b = Math.max(0, 10 + f * 8 + layer * 15);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.75 - layer * 0.15 - f * 0.05})`;
      ctx.beginPath();
      ctx.moveTo(flamex - flameWidth * scale * 0.5, flamey);
      ctx.quadraticCurveTo(
        flamex - flameWidth * scale * 0.2,
        flamey - flameHeight * scale * 0.6,
        flamex,
        flamey - flameHeight * scale
      );
      ctx.quadraticCurveTo(
        flamex + flameWidth * scale * 0.2,
        flamey - flameHeight * scale * 0.6,
        flamex + flameWidth * scale * 0.5,
        flamey
      );
      ctx.fill();
    }
  }

  // Face features
  // Eyes (bright yellow with dark slits)
  ctx.fillStyle = "#ffff66";
  ctx.beginPath();
  ctx.ellipse(
    fx - 4 * scale,
    fy - 14 * scale + bob,
    2.5 * scale,
    2 * scale,
    -0.1,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    fx + 4 * scale,
    fy - 14 * scale + bob,
    2.5 * scale,
    2 * scale,
    0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Pupils (menacing slits)
  ctx.fillStyle = "#cc4400";
  ctx.fillRect(fx - 4.5 * scale, fy - 15 * scale + bob, 1 * scale, 3 * scale);
  ctx.fillRect(fx + 3.5 * scale, fy - 15 * scale + bob, 1 * scale, 3 * scale);
  // Mouth (jagged grin)
  ctx.strokeStyle = `rgba(255, 220, 80, ${0.6 + Math.sin(time * 3) * 0.2})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(fx - 5 * scale, fy - 8 * scale + bob);
  ctx.lineTo(fx - 3 * scale, fy - 7 * scale + bob);
  ctx.lineTo(fx - 1 * scale, fy - 9 * scale + bob);
  ctx.lineTo(fx + 1 * scale, fy - 7 * scale + bob);
  ctx.lineTo(fx + 3 * scale, fy - 9 * scale + bob);
  ctx.lineTo(fx + 5 * scale, fy - 8 * scale + bob);
  ctx.stroke();

  // Trailing fire particles behind
  for (let tp = 0; tp < 8; tp++) {
    const trailAge = (time * 25 + tp * 8 + fx) % 30;
    const trailX =
      fx + Math.sin(time * 2 + tp * 1.5) * (4 + trailAge * 0.3) * scale;
    const trailY = fy + bob + trailAge * 0.8;
    const trailSize = (2.5 - trailAge * 0.06) * scale;
    if (trailSize > 0.3 && trailAge < 25) {
      const trailAlpha = Math.max(0, 0.6 - trailAge / 30);
      ctx.fillStyle = `rgba(255, ${120 + trailAge * 3}, ${30 + trailAge * 2}, ${trailAlpha})`;
      ctx.beginPath();
      ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawBurningRuins(
  dc: WorldMapDrawContext,
  rx: number,
  ryPct: number,
  scale: number
) {
  const { ctx, getY, time, seededRandom } = dc;
  const ry = getY(ryPct);

  // Scattered debris and rubble base
  ctx.fillStyle = "#2a2020";
  for (let r = 0; r < 12; r++) {
    const rubX = rx - 30 * scale + seededRandom(rx + r) * 60 * scale;
    const rubY = ry + seededRandom(rx + r + 10) * 10 * scale;
    const rubSize = 3 + seededRandom(rx + r + 20) * 7;
    ctx.fillStyle =
      r % 3 === 0 ? "#2a2020" : r % 3 === 1 ? "#332828" : "#241818";
    ctx.beginPath();
    ctx.arc(rubX, rubY, rubSize * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Standing columns (3 at varying heights)
  const columnPositions = [
    { h: 35, w: 5, x: -20 },
    { h: 28, w: 6, x: -5 },
    { h: 22, w: 5, x: 15 },
  ];
  columnPositions.forEach((col) => {
    const colGrad = ctx.createLinearGradient(
      rx + col.x * scale,
      ry - col.h * scale,
      rx + (col.x + col.w) * scale,
      ry
    );
    colGrad.addColorStop(0, "#3a2a28");
    colGrad.addColorStop(0.5, "#2a1a18");
    colGrad.addColorStop(1, "#221515");
    ctx.fillStyle = colGrad;
    ctx.fillRect(
      rx + col.x * scale,
      ry - col.h * scale,
      col.w * scale,
      (col.h + 5) * scale
    );

    // Column top (broken/jagged)
    ctx.fillStyle = "#2a1a18";
    ctx.beginPath();
    ctx.moveTo(rx + col.x * scale, ry - col.h * scale);
    ctx.lineTo(rx + (col.x + 1) * scale, ry - (col.h + 4) * scale);
    ctx.lineTo(rx + (col.x + 2.5) * scale, ry - (col.h + 1) * scale);
    ctx.lineTo(rx + (col.x + 4) * scale, ry - (col.h + 3) * scale);
    ctx.lineTo(rx + (col.x + col.w) * scale, ry - col.h * scale);
    ctx.closePath();
    ctx.fill();

    // Column texture lines
    ctx.strokeStyle = "rgba(80, 55, 45, 0.3)";
    ctx.lineWidth = 0.6;
    for (let cl = 0; cl < 3; cl++) {
      const lineX = rx + (col.x + 1.5 + cl * 1) * scale;
      ctx.beginPath();
      ctx.moveTo(lineX, ry - col.h * scale);
      ctx.lineTo(lineX, ry + 2 * scale);
      ctx.stroke();
    }
  });

  // Collapsed arch between first two columns
  ctx.strokeStyle = "#3a2a28";
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(rx - 18 * scale, ry - 32 * scale);
  ctx.quadraticCurveTo(
    rx - 10 * scale,
    ry - 40 * scale,
    rx - 3 * scale,
    ry - 26 * scale
  );
  ctx.stroke();

  // Fallen arch pieces on ground
  ctx.fillStyle = "#2a1a18";
  ctx.beginPath();
  ctx.ellipse(
    rx - 12 * scale,
    ry + 3 * scale,
    8 * scale,
    3 * scale,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    rx + 8 * scale,
    ry + 5 * scale,
    6 * scale,
    2.5 * scale,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Multiple fire sources
  const firePositions = [
    { size: 1, x: -18, y: -28 },
    { size: 0.8, x: -3, y: -22 },
    { size: 0.9, x: 16, y: -18 },
    { size: 0.6, x: -10, y: -8 },
    { size: 0.5, x: 8, y: -5 },
  ];
  firePositions.forEach((fire, fi) => {
    const flameX = rx + fire.x * scale;
    const flameY = ry + fire.y * scale;
    const fSize = fire.size;

    // Fire glow
    const fGlow = ctx.createRadialGradient(
      flameX,
      flameY,
      0,
      flameX,
      flameY,
      10 * scale * fSize
    );
    fGlow.addColorStop(
      0,
      `rgba(255, 120, 30, ${0.2 + Math.sin(time * 4 + fi) * 0.1})`
    );
    fGlow.addColorStop(1, "rgba(255, 60, 10, 0)");
    ctx.fillStyle = fGlow;
    ctx.beginPath();
    ctx.arc(flameX, flameY, 10 * scale * fSize, 0, Math.PI * 2);
    ctx.fill();

    // Flame tongues
    for (let ft = 0; ft < 3; ft++) {
      const fh = (12 + Math.sin(time * 8 + fi * 2.5 + ft * 1.3) * 5) * fSize;
      const fw = (3 + ft * 0.8) * fSize;
      const ftx = flameX + (ft - 1) * 3 * scale * fSize;
      ctx.fillStyle = `rgba(${255 - ft * 25}, ${80 + ft * 50}, ${20 + ft * 10}, ${0.85 - ft * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(ftx - fw * scale, flameY);
      ctx.quadraticCurveTo(ftx, flameY - fh * scale, ftx + fw * scale, flameY);
      ctx.fill();
    }
  });

  // Thick smoke rising
  for (let s = 0; s < 6; s++) {
    const smokePhase = (time * 18 + s * 12) % 55;
    const smokeX =
      rx - 15 * scale + s * 7 * scale + Math.sin(time * 0.8 + s) * 6;
    const smokeY = ry - 30 * scale - smokePhase;
    const smokeSize = 7 + smokePhase * 0.35;
    ctx.fillStyle = `rgba(45, 35, 35, ${Math.max(0, 0.4 - smokePhase / 70)})`;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, smokeSize * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}
