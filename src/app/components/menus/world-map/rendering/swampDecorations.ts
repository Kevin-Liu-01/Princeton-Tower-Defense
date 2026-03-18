import type { WorldMapDrawContext } from "./drawContext";

export function drawRuins(
  dc: WorldMapDrawContext,
  rx: number,
  ryPct: number,
  scale: number,
  tint?: string,
) {
  const { ctx, getY, seededRandom } = dc;
  const ry = getY(ryPct);
  const seed = rx * 3.7 + ryPct * 11.3;
  const stoneBase = tint || "#5a5048";
  const stoneDark = tint
    ? tint.replace(/[0-9a-f]{2}/gi, (m) => {
        const v = Math.max(0, parseInt(m, 16) - 30);
        return v.toString(16).padStart(2, "0");
      })
    : "#3a3028";

  // Rubble shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(
    rx + 2 * scale,
    ry + 3 * scale,
    18 * scale,
    6 * scale,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Scattered rubble stones
  for (let i = 0; i < 8; i++) {
    const sx = rx + (seededRandom(seed + i * 7) - 0.5) * 28 * scale;
    const sy = ry + (seededRandom(seed + i * 7 + 1) - 0.3) * 10 * scale;
    const ss = (1.5 + seededRandom(seed + i * 7 + 2) * 3) * scale;
    ctx.fillStyle =
      seededRandom(seed + i * 7 + 3) > 0.5 ? stoneBase : stoneDark;
    ctx.beginPath();
    ctx.ellipse(
      sx,
      sy,
      ss,
      ss * 0.6,
      seededRandom(seed + i * 7 + 4) * 1.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Standing wall fragments
  const wallCount = 2 + Math.floor(seededRandom(seed + 50) * 2);
  for (let w = 0; w < wallCount; w++) {
    const wx = rx + (seededRandom(seed + w * 13 + 60) - 0.5) * 22 * scale;
    const wy = ry + (seededRandom(seed + w * 13 + 61) - 0.5) * 4 * scale;
    const wh = (8 + seededRandom(seed + w * 13 + 62) * 14) * scale;
    const ww = (3 + seededRandom(seed + w * 13 + 63) * 3) * scale;
    const wallGrad = ctx.createLinearGradient(wx - ww, 0, wx + ww, 0);
    wallGrad.addColorStop(0, stoneDark);
    wallGrad.addColorStop(0.5, stoneBase);
    wallGrad.addColorStop(1, stoneDark);
    ctx.fillStyle = wallGrad;
    // Jagged top edge
    ctx.beginPath();
    ctx.moveTo(wx - ww, wy);
    ctx.lineTo(wx - ww, wy - wh * 0.7);
    const jaggedPts = 3 + Math.floor(seededRandom(seed + w * 13 + 64) * 3);
    for (let j = 0; j <= jaggedPts; j++) {
      const jt = j / jaggedPts;
      const jx = wx - ww + jt * ww * 2;
      const jy =
        wy - wh * (0.6 + seededRandom(seed + w * 13 + j * 5 + 70) * 0.4);
      ctx.lineTo(jx, jy);
    }
    ctx.lineTo(wx + ww, wy);
    ctx.closePath();
    ctx.fill();
    // Mortar lines
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.4 * scale;
    for (let m = 0; m < 3; m++) {
      const my = wy - (m + 1) * wh * 0.2;
      ctx.beginPath();
      ctx.moveTo(wx - ww, my);
      ctx.lineTo(wx + ww, my + scale * 0.5);
      ctx.stroke();
    }
  }

  // Broken arch (50% chance)
  if (seededRandom(seed + 100) > 0.5) {
    const archX = rx + (seededRandom(seed + 101) - 0.5) * 10 * scale;
    const archY = ry - 2 * scale;
    const archW = 8 * scale;
    const archH = 10 * scale;
    ctx.strokeStyle = stoneBase;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(archX - archW, archY);
    ctx.lineTo(archX - archW, archY - archH * 0.6);
    ctx.arc(archX, archY - archH * 0.6, archW, Math.PI, Math.PI * 1.65);
    ctx.stroke();
    // Second pillar (partial)
    ctx.beginPath();
    ctx.moveTo(archX + archW, archY);
    ctx.lineTo(archX + archW, archY - archH * 0.4);
    ctx.stroke();
  }

  // Vine/moss growth
  ctx.fillStyle = "rgba(60,100,40,0.25)";
  for (let v = 0; v < 4; v++) {
    const vx = rx + (seededRandom(seed + v * 11 + 120) - 0.5) * 20 * scale;
    const vy = ry - seededRandom(seed + v * 11 + 121) * 10 * scale;
    ctx.beginPath();
    ctx.ellipse(
      vx,
      vy,
      2 * scale,
      1.5 * scale,
      seededRandom(seed + v * 11 + 122),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

export function drawWatchTower(
  dc: WorldMapDrawContext,
  tx: number,
  tyPct: number,
) {
  const { ctx, getLevelY, time } = dc;
  const ty = getLevelY(tyPct);

  // Tower shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(tx + 5, ty + 9, 16, 6, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Wide stone foundation
  const baseGrad = ctx.createLinearGradient(tx - 14, ty, tx + 14, ty);
  baseGrad.addColorStop(0, "#2a2020");
  baseGrad.addColorStop(0.5, "#4a3a30");
  baseGrad.addColorStop(1, "#2a2020");
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.moveTo(tx - 14, ty + 6);
  ctx.lineTo(tx + 14, ty + 6);
  ctx.lineTo(tx + 11, ty - 2);
  ctx.lineTo(tx - 11, ty - 2);
  ctx.closePath();
  ctx.fill();

  // Cylindrical tower body with rounded shading
  const towerGrad = ctx.createLinearGradient(tx - 10, 0, tx + 10, 0);
  towerGrad.addColorStop(0, "#3a2a1a");
  towerGrad.addColorStop(0.15, "#4a3a2a");
  towerGrad.addColorStop(0.4, "#6a5a4a");
  towerGrad.addColorStop(0.6, "#7a6a58");
  towerGrad.addColorStop(0.85, "#4a3a2a");
  towerGrad.addColorStop(1, "#2a1a0a");
  ctx.fillStyle = towerGrad;
  ctx.beginPath();
  ctx.moveTo(tx - 10, ty + 2);
  ctx.quadraticCurveTo(tx - 11, ty - 18, tx - 10, ty - 38);
  ctx.lineTo(tx + 10, ty - 38);
  ctx.quadraticCurveTo(tx + 11, ty - 18, tx + 10, ty + 2);
  ctx.closePath();
  ctx.fill();

  // Curved stone mortar lines
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.5;
  for (let row = 0; row < 8; row++) {
    const ry = ty - 35 + row * 5;
    ctx.beginPath();
    ctx.moveTo(tx - 10, ry);
    ctx.quadraticCurveTo(tx, ry + 0.5, tx + 10, ry);
    ctx.stroke();
    for (let col = 0; col < 3; col++) {
      const offset = row % 2 === 0 ? 0 : 3;
      ctx.beginPath();
      ctx.moveTo(tx - 9 + col * 6 + offset, ry);
      ctx.lineTo(tx - 9 + col * 6 + offset, ry + 5);
      ctx.stroke();
    }
  }

  // Ivy / moss growing up left side
  ctx.fillStyle = "rgba(40,100,30,0.6)";
  for (let iv = 0; iv < 10; iv++) {
    const ivyY = ty + 2 - iv * 4.2;
    const ivyX = tx - 9 + Math.sin(iv * 1.3) * 2;
    ctx.beginPath();
    ctx.ellipse(
      ivyX,
      ivyY,
      3 + Math.sin(iv * 0.7) * 1.5,
      2.5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = "rgba(50,120,35,0.4)";
  for (let iv = 0; iv < 6; iv++) {
    const ivyY = ty - 2 - iv * 6;
    const ivyX = tx - 8 + Math.sin(iv * 1.5 + 0.3) * 2.5;
    ctx.beginPath();
    ctx.ellipse(ivyX - 2, ivyY, 2, 1.2, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ivyX + 1, ivyY + 1, 1.8, 1, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Platform with 3D overhang
  const platGrad = ctx.createLinearGradient(
    tx - 14,
    ty - 45,
    tx - 14,
    ty - 38,
  );
  platGrad.addColorStop(0, "#5a4a3a");
  platGrad.addColorStop(1, "#3a2a1a");
  ctx.fillStyle = platGrad;
  ctx.fillRect(tx - 14, ty - 45, 28, 10);
  ctx.fillStyle = "#6a5a48";
  ctx.fillRect(tx - 14, ty - 45, 28, 3);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(tx - 14, ty - 38, 28, 2);

  // Crenellations with depth
  for (let ci = 0; ci < 4; ci++) {
    const bx = tx - 13.5 + ci * 7;
    ctx.fillStyle = "#2a1a0a";
    ctx.fillRect(bx + 1, ty - 49, 5, 9);
    const crenGrad = ctx.createLinearGradient(bx, ty - 49, bx + 5, ty - 49);
    crenGrad.addColorStop(0, "#5a4a3a");
    crenGrad.addColorStop(1, "#4a3a2a");
    ctx.fillStyle = crenGrad;
    ctx.fillRect(bx, ty - 49, 4, 8);
    ctx.fillStyle = "#7a6a58";
    ctx.fillRect(bx, ty - 49, 4, 2);
  }

  // Lower window (level 1) with warm flickering glow
  const winGlow1 = ctx.createRadialGradient(tx, ty - 12, 0, tx, ty - 12, 8);
  winGlow1.addColorStop(
    0,
    `rgba(255, 200, 100, ${0.5 + Math.sin(time * 2.3 + tx) * 0.25})`,
  );
  winGlow1.addColorStop(1, "rgba(255, 150, 50, 0)");
  ctx.fillStyle = winGlow1;
  ctx.beginPath();
  ctx.arc(tx, ty - 12, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1a0a";
  ctx.fillRect(tx - 3, ty - 18, 6, 10);
  ctx.fillStyle = `rgba(255, 190, 90, ${0.45 + Math.sin(time * 2.3 + tx) * 0.2})`;
  ctx.fillRect(tx - 2, ty - 17, 4, 8);
  ctx.fillStyle = "#2a1a0a";
  ctx.fillRect(tx - 0.4, ty - 17, 0.8, 8);
  ctx.fillRect(tx - 2, ty - 13.5, 4, 0.8);

  // Upper window (level 2) with spiral staircase hint
  const winGlow2 = ctx.createRadialGradient(tx, ty - 28, 0, tx, ty - 28, 7);
  winGlow2.addColorStop(
    0,
    `rgba(255, 200, 100, ${0.4 + Math.sin(time * 1.8 + tx + 1) * 0.2})`,
  );
  winGlow2.addColorStop(1, "rgba(255, 150, 50, 0)");
  ctx.fillStyle = winGlow2;
  ctx.beginPath();
  ctx.arc(tx, ty - 28, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1a0a";
  ctx.fillRect(tx - 2.5, ty - 33, 5, 8);
  ctx.fillStyle = `rgba(255, 180, 80, ${0.4 + Math.sin(time * 1.8 + tx + 1) * 0.2})`;
  ctx.fillRect(tx - 1.5, ty - 32, 3, 6);
  ctx.strokeStyle = `rgba(180, 120, 50, ${0.2 + Math.sin(time * 1.8 + tx + 1) * 0.1})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(tx, ty - 29, 1.5, 0, Math.PI * 1.3);
  ctx.stroke();

  // Conical roof with shading
  const roofGrad = ctx.createLinearGradient(
    tx - 10,
    ty - 62,
    tx + 10,
    ty - 48,
  );
  roofGrad.addColorStop(0, "#6a3020");
  roofGrad.addColorStop(0.5, "#8a4030");
  roofGrad.addColorStop(1, "#4a2018");
  ctx.fillStyle = roofGrad;
  ctx.beginPath();
  ctx.moveTo(tx, ty - 62);
  ctx.lineTo(tx + 12, ty - 48);
  ctx.lineTo(tx - 12, ty - 48);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#9a5040";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(tx, ty - 62);
  ctx.lineTo(tx - 12, ty - 48);
  ctx.stroke();

  // Pennant flag at top
  ctx.fillStyle = "#4a3020";
  ctx.fillRect(tx - 0.8, ty - 70, 1.6, 12);
  const pfw = Math.sin(time * 3.5 + tx * 0.5) * 2;
  const pfw2 = Math.sin(time * 4 + tx * 0.5) * 1.5;
  ctx.fillStyle = "#cc3030";
  ctx.beginPath();
  ctx.moveTo(tx + 1, ty - 69);
  ctx.quadraticCurveTo(tx + 8, ty - 67 + pfw, tx + 14, ty - 65 + pfw2);
  ctx.lineTo(tx + 1, ty - 61);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#aa2020";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(tx + 3, ty - 65 + pfw * 0.3);
  ctx.quadraticCurveTo(
    tx + 8,
    ty - 64 + pfw * 0.5,
    tx + 12,
    ty - 63 + pfw2 * 0.6,
  );
  ctx.stroke();

  // Arched door with wood texture
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.moveTo(tx - 5, ty + 5);
  ctx.lineTo(tx - 5, ty - 5);
  ctx.arc(tx, ty - 5, 5, Math.PI, 0);
  ctx.lineTo(tx + 5, ty + 5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(tx - 2, ty + 5);
  ctx.lineTo(tx - 2, ty - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tx + 2, ty + 5);
  ctx.lineTo(tx + 2, ty - 4);
  ctx.stroke();
  ctx.fillStyle = "#8a7a60";
  ctx.beginPath();
  ctx.arc(tx + 3, ty - 1, 0.8, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCrater(
  dc: WorldMapDrawContext,
  cx: number,
  cyPct: number,
  size: number,
) {
  const { ctx, getY, seededRandom, time } = dc;
  const cy = getY(cyPct);

  // Cracked earth lines radiating outward
  ctx.strokeStyle = "rgba(20,15,5,0.3)";
  ctx.lineWidth = 0.8;
  for (let ci = 0; ci < 8; ci++) {
    const angle = (ci / 8) * Math.PI * 2 + seededRandom(cx + ci * 7) * 0.4;
    const len = size * 1.5 + seededRandom(cx + ci * 11) * size * 0.8;
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(angle) * size * 0.6,
      cy + Math.sin(angle) * size * 0.25,
    );
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len * 0.4);
    ctx.stroke();
    if (seededRandom(cx + ci * 19) > 0.4) {
      const branchAngle = angle + (seededRandom(cx + ci * 23) - 0.5) * 0.8;
      const midX = cx + Math.cos(angle) * len * 0.7;
      const midY = cy + Math.sin(angle) * len * 0.28;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX + Math.cos(branchAngle) * size * 0.5,
        midY + Math.sin(branchAngle) * size * 0.2,
      );
      ctx.stroke();
    }
  }

  // Scorch marks radiating outward
  for (let si = 0; si < 6; si++) {
    const angle = (si / 6) * Math.PI * 2 + seededRandom(cx + si * 3) * 0.5;
    const dist = size * 0.9 + seededRandom(cx + si * 5) * size * 0.5;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist * 0.4;
    const scorchGrad = ctx.createRadialGradient(
      sx,
      sy,
      0,
      sx,
      sy,
      size * 0.4,
    );
    scorchGrad.addColorStop(0, "rgba(15,10,5,0.25)");
    scorchGrad.addColorStop(1, "rgba(15,10,5,0)");
    ctx.fillStyle = scorchGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, size * 0.4, size * 0.18, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // Outer rim (raised edge)
  const rimGrad = ctx.createRadialGradient(
    cx,
    cy,
    size * 0.7,
    cx,
    cy,
    size * 1.3,
  );
  rimGrad.addColorStop(0, "rgba(50,40,25,0)");
  rimGrad.addColorStop(0.5, "rgba(55,42,28,0.5)");
  rimGrad.addColorStop(1, "rgba(40,30,20,0)");
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, size * 1.3, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mid ring
  ctx.fillStyle = "#2e2218";
  ctx.beginPath();
  ctx.ellipse(cx, cy, size * 1.0, size * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring (deeper)
  ctx.fillStyle = "#221a10";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 1, size * 0.65, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Center (darkest, deepest)
  const centerGrad = ctx.createRadialGradient(
    cx,
    cy - 1,
    0,
    cx,
    cy - 1,
    size * 0.4,
  );
  centerGrad.addColorStop(0, "#0a0805");
  centerGrad.addColorStop(1, "#1a1208");
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 1, size * 0.35, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing embers in center that pulse
  const emberPulse = 0.3 + Math.sin(time * 3 + cx * 0.5) * 0.2;
  const emberGrad = ctx.createRadialGradient(
    cx,
    cy - 1,
    0,
    cx,
    cy - 1,
    size * 0.3,
  );
  emberGrad.addColorStop(0, `rgba(255, 80, 20, ${emberPulse})`);
  emberGrad.addColorStop(0.5, `rgba(200, 50, 10, ${emberPulse * 0.4})`);
  emberGrad.addColorStop(1, "rgba(150, 30, 0, 0)");
  ctx.fillStyle = emberGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 1, size * 0.3, size * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Small pulsing ember dots
  for (let ei = 0; ei < 3; ei++) {
    const edx = cx + (seededRandom(cx + ei * 37) - 0.5) * size * 0.4;
    const edy = cy - 1 + (seededRandom(cx + ei * 41) - 0.5) * size * 0.15;
    const ePulse = 0.5 + Math.sin(time * 4 + ei * 2 + cx * 0.3) * 0.3;
    ctx.fillStyle = `rgba(255, 120, 30, ${ePulse})`;
    ctx.beginPath();
    ctx.arc(edx, edy, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Debris / rocks scattered around the rim
  for (let di = 0; di < 6; di++) {
    const dAngle = (di / 6) * Math.PI * 2 + seededRandom(cx + di * 47) * 0.6;
    const dDist = size * 0.9 + seededRandom(cx + di * 53) * size * 0.4;
    const dx = cx + Math.cos(dAngle) * dDist;
    const dy = cy + Math.sin(dAngle) * dDist * 0.42;
    const dSize = 1 + seededRandom(cx + di * 59) * 2;
    const rockGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dSize);
    rockGrad.addColorStop(0, "#5a4a3a");
    rockGrad.addColorStop(1, "#3a2a1a");
    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    ctx.ellipse(
      dx,
      dy,
      dSize,
      dSize * 0.7,
      seededRandom(cx + di * 61) * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Rim highlight (top edge catching light)
  ctx.strokeStyle = "rgba(80,65,45,0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    cy - 1,
    size * 1.0,
    size * 0.42,
    0,
    Math.PI * 1.1,
    Math.PI * 1.9,
  );
  ctx.stroke();
}

export function drawWillowTree(
  dc: WorldMapDrawContext,
  x: number,
  yPct: number,
  scale: number,
) {
  const { ctx, getY, seededRandom, time } = dc;
  const y = getY(yPct);

  // --- Base fog / mist around tree base ---
  for (let f = 0; f < 4; f++) {
    const fogX = x + Math.sin(time * 0.3 + f * 1.7 + x) * 8 * scale;
    const fogY = y + 2 + f * 2 * scale;
    const fogW = 18 * scale + f * 6 * scale;
    const fogH = 4 * scale + f * 2 * scale;
    const fogAlpha = 0.06 - f * 0.012;
    ctx.fillStyle = `rgba(140, 190, 150, ${fogAlpha})`;
    ctx.beginPath();
    ctx.ellipse(fogX, fogY, fogW, fogH, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Murky water reflection shadow ---
  ctx.fillStyle = "rgba(20, 40, 20, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x + 5, y + 4, 16 * scale, 6 * scale, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // --- Exposed root system spreading into water with moss ---
  for (let r = 0; r < 7; r++) {
    const rSeed = seededRandom(x * 7 + r * 13);
    const rAngle = ((r - 3) / 3) * 1.1;
    const rLen = (8 + rSeed * 10) * scale;
    const rx1 = x + Math.cos(rAngle - 0.3) * 3 * scale;
    const ry1 = y - 2;
    const rx2 = x + Math.cos(rAngle) * rLen * 0.6;
    const ry2 = y + 2 + rSeed * 3;
    const rx3 = x + Math.cos(rAngle + 0.1) * rLen;
    const ry3 = y + 3 + rSeed * 5;

    // Root stroke
    ctx.strokeStyle = r % 2 === 0 ? "#1a1612" : "#15120e";
    ctx.lineWidth = (2.5 - r * 0.15) * scale;
    ctx.beginPath();
    ctx.moveTo(x + (r - 3) * 1.5 * scale, y - 2);
    ctx.bezierCurveTo(rx1, ry1, rx2, ry2, rx3, ry3);
    ctx.stroke();

    // Moss on roots
    if (r % 2 === 0) {
      ctx.fillStyle = `rgba(60, 110, 50, ${0.35 + rSeed * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(
        rx2,
        ry2 - 1,
        2.5 * scale,
        1.2 * scale,
        rAngle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // --- Gnarled, twisted trunk with visible wood grain via bezier curves ---
  const trunkGrad = ctx.createLinearGradient(
    x - 6 * scale,
    0,
    x + 6 * scale,
    0,
  );
  trunkGrad.addColorStop(0, "#080805");
  trunkGrad.addColorStop(0.2, "#161410");
  trunkGrad.addColorStop(0.4, "#1e1c16");
  trunkGrad.addColorStop(0.6, "#141210");
  trunkGrad.addColorStop(0.8, "#0e0d0a");
  trunkGrad.addColorStop(1, "#060604");
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(x - 4 * scale, y);
  ctx.bezierCurveTo(
    x - 8 * scale,
    y - 6 * scale,
    x - 6 * scale,
    y - 14 * scale,
    x - 3 * scale,
    y - 18 * scale,
  );
  ctx.bezierCurveTo(
    x - 6 * scale,
    y - 22 * scale,
    x - 4 * scale,
    y - 27 * scale,
    x,
    y - 30 * scale,
  );
  ctx.bezierCurveTo(
    x + 4 * scale,
    y - 27 * scale,
    x + 6 * scale,
    y - 22 * scale,
    x + 3 * scale,
    y - 18 * scale,
  );
  ctx.bezierCurveTo(
    x + 6 * scale,
    y - 14 * scale,
    x + 8 * scale,
    y - 6 * scale,
    x + 4 * scale,
    y,
  );
  ctx.closePath();
  ctx.fill();

  // Wood grain lines along trunk
  ctx.lineWidth = 0.5 * scale;
  for (let g = 0; g < 6; g++) {
    const gx = x + (g - 2.5) * 1.2 * scale;
    const grainAlpha = 0.08 + seededRandom(x + g * 17) * 0.06;
    ctx.strokeStyle = `rgba(255, 240, 200, ${grainAlpha})`;
    ctx.beginPath();
    ctx.moveTo(gx, y - 2 * scale);
    ctx.bezierCurveTo(
      gx - 1.5 * scale,
      y - 10 * scale,
      gx + 1.5 * scale,
      y - 20 * scale,
      gx - 0.5 * scale,
      y - 28 * scale,
    );
    ctx.stroke();
  }

  // Bark knots (larger, more detailed)
  const drawKnot = (kx: number, ky: number, kr: number, kAngle: number) => {
    ctx.fillStyle = "#0a0806";
    ctx.beginPath();
    ctx.ellipse(
      kx,
      ky,
      kr * 1.2 * scale,
      kr * 1.8 * scale,
      kAngle,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(40, 35, 25, 0.4)";
    ctx.lineWidth = 0.4 * scale;
    ctx.beginPath();
    ctx.ellipse(kx, ky, kr * 0.6 * scale, kr * scale, kAngle, 0, Math.PI * 2);
    ctx.stroke();
  };
  drawKnot(x - 1 * scale, y - 12 * scale, 2, 0.3);
  drawKnot(x + 2 * scale, y - 22 * scale, 1.5, -0.2);
  drawKnot(x - 2 * scale, y - 6 * scale, 1.2, 0.5);

  // --- Bioluminescent mushroom clusters on trunk (simplified, no per-mushroom gradients) ---
  const drawMushroom = (
    mx: number,
    my: number,
    mScale: number,
    seed: number,
  ) => {
    const glowPhase = Math.sin(time * 2.2 + seed * 3.1) * 0.5 + 0.5;
    // Glow halo (flat color)
    ctx.fillStyle = `rgba(80, 220, 120, ${0.08 + glowPhase * 0.1})`;
    ctx.beginPath();
    ctx.arc(mx, my, 5 * mScale * scale, 0, Math.PI * 2);
    ctx.fill();
    // Mushroom stem
    ctx.fillStyle = `rgba(180, 200, 170, ${0.5 + glowPhase * 0.2})`;
    ctx.fillRect(
      mx - 0.5 * mScale * scale,
      my,
      1 * mScale * scale,
      3 * mScale * scale,
    );
    // Mushroom cap
    ctx.fillStyle = `rgba(100, 230, 130, ${0.5 + glowPhase * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(
      mx,
      my,
      2.5 * mScale * scale,
      1.5 * mScale * scale,
      0,
      Math.PI,
      Math.PI * 2,
    );
    ctx.fill();
  };
  // Cluster of mushrooms at various heights on trunk
  drawMushroom(x + 3.5 * scale, y - 7 * scale, 1.0, x + 1);
  drawMushroom(x + 4.5 * scale, y - 9 * scale, 0.7, x + 2);
  drawMushroom(x - 3 * scale, y - 15 * scale, 0.9, x + 3);
  drawMushroom(x - 4 * scale, y - 13 * scale, 0.6, x + 4);
  drawMushroom(x + 2 * scale, y - 20 * scale, 0.5, x + 5);

  // --- Heavy drooping canopy with 6 layered depth shade layers ---
  // Layer 1 (deepest/darkest back)
  ctx.fillStyle = "#0e1a0e";
  ctx.beginPath();
  ctx.arc(x - 6 * scale, y - 30 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.arc(x + 10 * scale, y - 28 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.arc(x, y - 26 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Layer 2
  ctx.fillStyle = "#152215";
  ctx.beginPath();
  ctx.arc(x - 4 * scale, y - 32 * scale, 13 * scale, 0, Math.PI * 2);
  ctx.arc(x + 8 * scale, y - 30 * scale, 11 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Layer 3
  ctx.fillStyle = "#1a2a1a";
  ctx.beginPath();
  ctx.arc(x - 14 * scale, y - 27 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.arc(x + 14 * scale, y - 27 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Layer 4
  ctx.fillStyle = "#243524";
  ctx.beginPath();
  ctx.arc(x, y - 34 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.arc(x - 12 * scale, y - 26 * scale, 11 * scale, 0, Math.PI * 2);
  ctx.arc(x + 12 * scale, y - 26 * scale, 11 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Layer 5 (mid-highlight)
  ctx.fillStyle = "#2e422e";
  ctx.beginPath();
  ctx.arc(x + 2 * scale, y - 36 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.arc(x - 8 * scale, y - 30 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.arc(x + 10 * scale, y - 32 * scale, 7 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Layer 6 (top highlights)
  ctx.fillStyle = "#3a4e3a";
  ctx.beginPath();
  ctx.arc(x + 4 * scale, y - 38 * scale, 6 * scale, 0, Math.PI * 2);
  ctx.arc(x - 6 * scale, y - 34 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // --- Spider webs between branches ---
  ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
  ctx.lineWidth = 0.3 * scale;
  // Web 1 (left side)
  const webCx1 = x - 10 * scale;
  const webCy1 = y - 28 * scale;
  for (let s = 0; s < 5; s++) {
    const angle = -0.3 + s * 0.35;
    ctx.beginPath();
    ctx.moveTo(webCx1, webCy1);
    ctx.lineTo(
      webCx1 + Math.cos(angle) * 7 * scale,
      webCy1 + Math.sin(angle) * 7 * scale,
    );
    ctx.stroke();
  }
  // Web radial rings
  for (let ring = 1; ring <= 3; ring++) {
    ctx.beginPath();
    for (let s = 0; s <= 5; s++) {
      const angle = -0.3 + s * 0.35;
      const rr = ring * 2.2 * scale;
      const px = webCx1 + Math.cos(angle) * rr;
      const py = webCy1 + Math.sin(angle) * rr;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  // Web 2 (right side)
  const webCx2 = x + 9 * scale;
  const webCy2 = y - 26 * scale;
  for (let s = 0; s < 4; s++) {
    const angle = 0.5 + s * 0.4;
    ctx.beginPath();
    ctx.moveTo(webCx2, webCy2);
    ctx.lineTo(
      webCx2 + Math.cos(angle) * 5 * scale,
      webCy2 + Math.sin(angle) * 5 * scale,
    );
    ctx.stroke();
  }
  for (let ring = 1; ring <= 2; ring++) {
    ctx.beginPath();
    for (let s = 0; s <= 4; s++) {
      const angle = 0.5 + s * 0.4;
      const rr = ring * 2 * scale;
      const px = webCx2 + Math.cos(angle) * rr;
      const py = webCy2 + Math.sin(angle) * rr;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // --- Much longer, more numerous hanging moss/vines with leaf clusters ---
  ctx.lineWidth = 1.0 * scale;
  for (let i = 0; i < 14; i++) {
    const vx = x - 18 * scale + i * 2.8 * scale;
    const vy = y - 22 * scale + seededRandom(x + i * 3) * 10 * scale;
    const len =
      22 * scale +
      Math.sin(time * 1.5 + i + x) * 5 +
      seededRandom(x + i) * 14;
    const sway = Math.sin(time * 1.0 + i * 0.6 + x * 0.01) * (3 + i * 0.3);

    // Vine with flat color (was per-vine gradient)
    ctx.strokeStyle = "#1e2e1e";
    ctx.lineWidth = (1.2 - i * 0.04) * scale;

    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.bezierCurveTo(
      vx + sway * 0.3,
      vy + len * 0.25,
      vx + sway * 0.8,
      vy + len * 0.55,
      vx + sway * 0.2,
      vy + len,
    );
    ctx.stroke();

    // Leaf clusters at the ends and midpoint
    if (i % 2 === 0) {
      // Mid-vine leaf
      const mlx = vx + sway * 0.55;
      const mly = vy + len * 0.5;
      ctx.fillStyle = "#264a26";
      ctx.beginPath();
      ctx.ellipse(
        mlx - 1,
        mly,
        1.5 * scale,
        2.8 * scale,
        0.4 + sway * 0.05,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#1e3e1e";
      ctx.beginPath();
      ctx.ellipse(
        mlx + 1.5,
        mly + 1,
        1.2 * scale,
        2.2 * scale,
        -0.3 + sway * 0.03,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // End leaf cluster
    const elx = vx + sway * 0.2;
    const ely = vy + len;
    ctx.fillStyle = "#2a4a2a";
    ctx.beginPath();
    ctx.ellipse(
      elx,
      ely,
      2 * scale,
      3 * scale,
      0.3 + sway * 0.02,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    if (i % 3 === 0) {
      ctx.fillStyle = "#224422";
      ctx.beginPath();
      ctx.ellipse(
        elx + 1.5,
        ely - 1,
        1.5 * scale,
        2.5 * scale,
        -0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#1c3a1c";
      ctx.beginPath();
      ctx.ellipse(
        elx - 1.5,
        ely + 1,
        1.3 * scale,
        2 * scale,
        0.6,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

export function drawSwampPool(
  dc: WorldMapDrawContext,
  px: number,
  pyPct: number,
  psize: number,
) {
  const { ctx, getY, seededRandom, time } = dc;
  const py = getY(pyPct);
  const poolAngle = seededRandom(px) * 0.3;

  // --- Dark murky water base ---
  const poolGrad = ctx.createRadialGradient(px, py, 0, px, py, psize * 1.4);
  poolGrad.addColorStop(0, "rgba(12, 30, 20, 0.75)");
  poolGrad.addColorStop(0.4, "rgba(20, 42, 30, 0.65)");
  poolGrad.addColorStop(0.7, "rgba(30, 52, 35, 0.45)");
  poolGrad.addColorStop(1, "rgba(40, 60, 40, 0.15)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(px, py, psize * 1.3, psize * 0.5, poolAngle, 0, Math.PI * 2);
  ctx.fill();

  // --- Algae patches (green-yellow tint) ---
  for (let a = 0; a < 3; a++) {
    const ax = px + (seededRandom(px + a * 31) - 0.5) * psize * 1.6;
    const ay = py + (seededRandom(px + a * 47) - 0.5) * psize * 0.3;
    const aw = psize * (0.2 + seededRandom(px + a * 19) * 0.25);
    const ah = aw * 0.4;
    ctx.fillStyle = `rgba(90, 140, 40, ${0.12 + seededRandom(px + a * 53) * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(
      ax,
      ay,
      aw,
      ah,
      seededRandom(px + a * 7) * 1.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // --- Animated ripple rings expanding outward ---
  for (let r = 0; r < 3; r++) {
    const ripplePhase = ((time * 0.6 + r * 2.1 + px * 0.05) % 4) / 4;
    const rippleR = psize * 0.3 + ripplePhase * psize * 0.8;
    const rippleAlpha = (1 - ripplePhase) * 0.15;
    const rippleCx = px + (seededRandom(px + r * 71) - 0.5) * psize * 0.6;
    const rippleCy = py + (seededRandom(px + r * 37) - 0.5) * psize * 0.15;
    ctx.strokeStyle = `rgba(120, 180, 130, ${rippleAlpha})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(
      rippleCx,
      rippleCy,
      rippleR,
      rippleR * 0.38,
      poolAngle,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // --- Reflected tree silhouettes in water (dark, inverted) ---
  ctx.fillStyle = "rgba(10, 20, 10, 0.12)";
  for (let t = 0; t < 2; t++) {
    const tx = px + (t === 0 ? -psize * 0.35 : psize * 0.3);
    const ty = py;
    ctx.beginPath();
    ctx.moveTo(tx - 1.5, ty);
    ctx.lineTo(tx + 1.5, ty);
    ctx.lineTo(tx + 0.5, ty + psize * 0.3);
    ctx.lineTo(tx - 0.5, ty + psize * 0.3);
    ctx.closePath();
    ctx.fill();
    // Reflected canopy blob
    ctx.beginPath();
    ctx.ellipse(tx, ty + psize * 0.05, 4 + t, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Lily pads floating on surface ---
  for (let lp = 0; lp < 3; lp++) {
    const lpSeed = seededRandom(px * 3 + lp * 97);
    const lpx = px + (lpSeed - 0.5) * psize * 1.4;
    const lpy = py + (seededRandom(px + lp * 61) - 0.5) * psize * 0.25;
    const lpR = (2.5 + lpSeed * 2) * (psize / 20);
    const lpAngle = seededRandom(px + lp * 41) * Math.PI * 2;

    // Pad body (circle with notch)
    ctx.fillStyle = `rgba(40, ${100 + Math.floor(lpSeed * 40)}, 45, 0.7)`;
    ctx.beginPath();
    ctx.moveTo(
      lpx + lpR * Math.cos(lpAngle),
      lpy + lpR * 0.4 * Math.sin(lpAngle),
    );
    for (let a = 0.15; a <= 1.85; a += 0.05) {
      const angle = lpAngle + a * Math.PI;
      ctx.lineTo(
        lpx + lpR * Math.cos(angle),
        lpy + lpR * 0.4 * Math.sin(angle),
      );
    }
    ctx.closePath();
    ctx.fill();
    // Highlight vein
    ctx.strokeStyle = "rgba(80, 160, 70, 0.3)";
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(lpx, lpy);
    ctx.lineTo(
      lpx + lpR * 0.7 * Math.cos(lpAngle + Math.PI),
      lpy + lpR * 0.28 * Math.sin(lpAngle + Math.PI),
    );
    ctx.stroke();

    // Tiny flower on some lily pads
    if (lp === 0) {
      const flx = lpx + Math.cos(lpAngle + 1) * lpR * 0.3;
      const fly = lpy + Math.sin(lpAngle + 1) * lpR * 0.12;
      // Petals
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2;
        ctx.fillStyle = "rgba(255, 220, 240, 0.6)";
        ctx.beginPath();
        ctx.ellipse(
          flx + Math.cos(pa) * 1.2,
          fly + Math.sin(pa) * 0.5,
          1.0,
          0.5,
          pa,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      // Center
      ctx.fillStyle = "rgba(255, 230, 80, 0.7)";
      ctx.beginPath();
      ctx.arc(flx, fly, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Occasional fish shadow moving under surface ---
  const fishPhase = (time * 0.4 + px * 0.02) % 6;
  if (fishPhase < 4) {
    const fishProgress = fishPhase / 4;
    const fishX = px - psize * 0.8 + fishProgress * psize * 1.6;
    const fishY = py + Math.sin(fishProgress * Math.PI * 2) * psize * 0.08;
    const fishAlpha = Math.sin(fishProgress * Math.PI) * 0.18;
    ctx.fillStyle = `rgba(15, 30, 20, ${fishAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      fishX,
      fishY,
      3.5,
      1.2,
      fishProgress * 0.3 - 0.15,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(fishX - 3.5, fishY);
    ctx.lineTo(fishX - 5.5, fishY - 1.5);
    ctx.lineTo(fishX - 5.5, fishY + 1.5);
    ctx.closePath();
    ctx.fill();
  }

  // --- Surface reflection highlight ---
  ctx.fillStyle = `rgba(100, 160, 110, ${0.08 + Math.sin(time * 1.5 + px) * 0.04})`;
  ctx.beginPath();
  ctx.ellipse(
    px - psize * 0.3,
    py - psize * 0.1,
    psize * 0.4,
    psize * 0.12,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

export function drawSwampGas(
  dc: WorldMapDrawContext,
  x: number,
  yPct: number,
) {
  const { ctx, getY, seededRandom, time } = dc;
  const y = getY(yPct);
  const tOffset = x * 0.1;

  // Draw 3 bubbles per source at different phases
  for (let b = 0; b < 3; b++) {
    const bSeed = seededRandom(x + b * 77);
    const speed = 18 + b * 6;
    const cycleLen = 35 + b * 10;
    const phase =
      ((time * speed + tOffset * 50 + b * 40) % cycleLen) / cycleLen;
    const bubbleY = y - phase * 32;
    const bubbleX = x + Math.sin(time * 3 + b * 2.1 + x) * 2;
    const bubbleR = (1.2 + bSeed * 2.5) * (1 - phase * 0.3);
    const opacity = 1 - phase;

    // Pop splash at the top
    if (phase > 0.9) {
      const popProgress = (phase - 0.9) / 0.1;
      const popAlpha = (1 - popProgress) * 0.35;
      ctx.strokeStyle = `rgba(120, 255, 140, ${popAlpha})`;
      ctx.lineWidth = 0.4;
      for (let sp = 0; sp < 4; sp++) {
        const spAngle = (sp / 4) * Math.PI * 2 + time;
        const spR = popProgress * 5;
        ctx.beginPath();
        ctx.moveTo(
          bubbleX + Math.cos(spAngle) * spR * 0.3,
          bubbleY + Math.sin(spAngle) * spR * 0.3,
        );
        ctx.lineTo(
          bubbleX + Math.cos(spAngle) * spR,
          bubbleY + Math.sin(spAngle) * spR,
        );
        ctx.stroke();
      }
    }

    // Greenish toxic glow halo around bubble
    const glowGrad = ctx.createRadialGradient(
      bubbleX,
      bubbleY,
      0,
      bubbleX,
      bubbleY,
      bubbleR * 3.5,
    );
    glowGrad.addColorStop(0, `rgba(100, 255, 120, ${opacity * 0.2})`);
    glowGrad.addColorStop(0.5, `rgba(80, 220, 100, ${opacity * 0.08})`);
    glowGrad.addColorStop(1, "rgba(60, 180, 80, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleR * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Bubble body
    if (phase < 0.92) {
      ctx.fillStyle = `rgba(100, 255, 120, ${opacity * 0.3})`;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleR, 0, Math.PI * 2);
      ctx.fill();
      // Bubble highlight
      ctx.fillStyle = `rgba(180, 255, 200, ${opacity * 0.25})`;
      ctx.beginPath();
      ctx.arc(
        bubbleX - bubbleR * 0.3,
        bubbleY - bubbleR * 0.3,
        bubbleR * 0.35,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

export function drawFireflies(
  dc: WorldMapDrawContext,
  xBase: number,
  yPct: number,
) {
  const { ctx, getY, time } = dc;
  const yBase = getY(yPct);
  const t = time * 0.8 + xBase * 0.1;

  // Figure-8 flight pattern (lemniscate)
  const loopScale = 18;
  const denom = 1 + Math.sin(t) * Math.sin(t);
  const fx = xBase + (loopScale * Math.cos(t)) / denom;
  const fy = yBase + ((loopScale * Math.sin(t) * Math.cos(t)) / denom) * 0.6;

  const glow = 0.5 + Math.sin(time * 4.5 + xBase * 0.3) * 0.5;

  // Fading trail behind the firefly
  for (let trail = 1; trail <= 5; trail++) {
    const tPast = t - trail * 0.12;
    const denomP = 1 + Math.sin(tPast) * Math.sin(tPast);
    const tx = xBase + (loopScale * Math.cos(tPast)) / denomP;
    const ty =
      yBase +
      ((loopScale * Math.sin(tPast) * Math.cos(tPast)) / denomP) * 0.6;
    const trailAlpha = glow * (1 - trail / 6) * 0.35;
    ctx.fillStyle = `rgba(210, 255, 120, ${trailAlpha})`;
    ctx.beginPath();
    ctx.arc(tx, ty, 1.2 - trail * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Warm glow halo
  const haloGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 6);
  haloGrad.addColorStop(0, `rgba(220, 255, 120, ${glow * 0.5})`);
  haloGrad.addColorStop(0.4, `rgba(200, 240, 100, ${glow * 0.15})`);
  haloGrad.addColorStop(1, "rgba(180, 220, 80, 0)");
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(fx, fy, 6, 0, Math.PI * 2);
  ctx.fill();

  // Firefly body
  ctx.fillStyle = `rgba(220, 255, 120, ${glow})`;
  ctx.beginPath();
  ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
  ctx.fill();
}
