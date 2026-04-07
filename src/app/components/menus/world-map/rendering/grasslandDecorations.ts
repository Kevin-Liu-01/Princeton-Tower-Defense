import type { WorldMapDrawContext } from "./drawContext";

export function drawTree(
  dc: WorldMapDrawContext,
  x: number,
  yPct: number,
  scale: number
) {
  const { ctx, time, seededRandom, getY } = dc;
  const y = getY(yPct);

  // Soft ground shadow with depth falloff
  const shadowGrad = ctx.createRadialGradient(
    x + 4,
    y + 7,
    0,
    x + 4,
    y + 7,
    18 * scale
  );
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.3)");
  shadowGrad.addColorStop(0.6, "rgba(0,0,0,0.1)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 7, 18 * scale, 6 * scale, 0.1, 0, Math.PI * 2);
  ctx.fill();

  for (let fi = 0; fi < 4; fi++) {
    const fx = x + (seededRandom(x + fi * 13) - 0.5) * 22 * scale;
    const fy = y + 3 + seededRandom(x + fi * 17) * 4;
    const ft = seededRandom(x + fi * 29);
    if (ft < 0.5) {
      ctx.fillStyle = ft < 0.25 ? "#e8e050" : "#e06080";
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2a6a10";
      ctx.fillRect(fx - 0.3, fy, 0.6, 3 * scale);
    } else {
      ctx.fillStyle = "#8a6040";
      ctx.fillRect(fx - 0.5, fy - 1, 1, 2.5 * scale);
      ctx.fillStyle = ft < 0.75 ? "#c04030" : "#d0a050";
      ctx.beginPath();
      ctx.ellipse(
        fx,
        fy - 1.5 * scale,
        2 * scale,
        1.2 * scale,
        0,
        Math.PI,
        Math.PI * 2
      );
      ctx.fill();
      if (ft < 0.75) {
        ctx.fillStyle = "#f0e0c0";
        ctx.beginPath();
        ctx.arc(fx - 0.5 * scale, fy - 2 * scale, 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const trunkGrad = ctx.createLinearGradient(
    x - 5 * scale,
    0,
    x + 5 * scale,
    0
  );
  trunkGrad.addColorStop(0, "#2a1008");
  trunkGrad.addColorStop(0.2, "#4a3020");
  trunkGrad.addColorStop(0.5, "#5a4030");
  trunkGrad.addColorStop(0.8, "#3a2518");
  trunkGrad.addColorStop(1, "#1a0a04");
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(x - 4.5 * scale, y + 5);
  ctx.quadraticCurveTo(
    x - 6 * scale,
    y - 4 * scale,
    x - 3.5 * scale,
    y - 14 * scale
  );
  ctx.lineTo(x + 3.5 * scale, y - 14 * scale);
  ctx.quadraticCurveTo(x + 6 * scale, y - 4 * scale, x + 4.5 * scale, y + 5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(20,10,0,0.4)";
  ctx.lineWidth = 0.6;
  for (let bi = 0; bi < 4; bi++) {
    const bx = x + (seededRandom(x + bi * 41) - 0.5) * 6 * scale;
    ctx.beginPath();
    ctx.moveTo(bx, y + 4);
    ctx.quadraticCurveTo(
      bx + (seededRandom(x + bi * 43) - 0.5) * 2 * scale,
      y - 7 * scale,
      bx - 1 * scale,
      y - 12 * scale
    );
    ctx.stroke();
  }
  ctx.fillStyle = "#2a1808";
  ctx.beginPath();
  ctx.ellipse(
    x + 1 * scale,
    y - 4 * scale,
    1.5 * scale,
    2 * scale,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 0.4;
  ctx.stroke();

  ctx.fillStyle = "rgba(60,120,40,0.5)";
  ctx.beginPath();
  ctx.ellipse(
    x - 3 * scale,
    y - 2 * scale,
    2.5 * scale,
    3.5 * scale,
    -0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(x - 1 * scale, y - 12 * scale);
  ctx.quadraticCurveTo(
    x - 8 * scale,
    y - 16 * scale,
    x - 10 * scale,
    y - 20 * scale
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 1 * scale, y - 13 * scale);
  ctx.quadraticCurveTo(
    x + 7 * scale,
    y - 15 * scale,
    x + 9 * scale,
    y - 19 * scale
  );
  ctx.stroke();
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y - 14 * scale);
  ctx.quadraticCurveTo(
    x + 2 * scale,
    y - 18 * scale,
    x + 1 * scale,
    y - 23 * scale
  );
  ctx.stroke();

  const c1 = ctx.createRadialGradient(
    x - 3 * scale,
    y - 22 * scale,
    0,
    x - 3 * scale,
    y - 22 * scale,
    14 * scale
  );
  c1.addColorStop(0, "#1a4a0a");
  c1.addColorStop(1, "#0d3006");
  ctx.fillStyle = c1;
  ctx.beginPath();
  ctx.arc(x - 3 * scale, y - 22 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.arc(x + 7 * scale, y - 20 * scale, 9 * scale, 0, Math.PI * 2);
  ctx.fill();

  const c2 = ctx.createRadialGradient(
    x,
    y - 20 * scale,
    2 * scale,
    x,
    y - 20 * scale,
    14 * scale
  );
  c2.addColorStop(0, "#2d6a18");
  c2.addColorStop(1, "#1a4a0c");
  ctx.fillStyle = c2;
  ctx.beginPath();
  ctx.arc(x, y - 20 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.fill();

  const c3 = ctx.createRadialGradient(
    x - 7 * scale,
    y - 17 * scale,
    0,
    x - 7 * scale,
    y - 17 * scale,
    10 * scale
  );
  c3.addColorStop(0, "#2a6015");
  c3.addColorStop(1, "#1d4a0f");
  ctx.fillStyle = c3;
  ctx.beginPath();
  ctx.arc(x - 7 * scale, y - 17 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.arc(x + 6 * scale, y - 17 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();

  const c4 = ctx.createRadialGradient(
    x - 2 * scale,
    y - 20 * scale,
    0,
    x - 2 * scale,
    y - 20 * scale,
    8 * scale
  );
  c4.addColorStop(0, "#4a8a30");
  c4.addColorStop(1, "#2d6a18");
  ctx.fillStyle = c4;
  ctx.beginPath();
  ctx.arc(x - 3 * scale, y - 19 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.arc(x + 5 * scale, y - 23 * scale, 7 * scale, 0, Math.PI * 2);
  ctx.fill();

  const sway = Math.sin(time * 1.2 + x * 0.1) * 1.5 * scale;
  const c5 = ctx.createRadialGradient(
    x + sway,
    y - 24 * scale,
    0,
    x + sway,
    y - 24 * scale,
    6 * scale
  );
  c5.addColorStop(0, "#5ca040");
  c5.addColorStop(1, "rgba(70,140,45,0)");
  ctx.fillStyle = c5;
  ctx.beginPath();
  ctx.arc(x + sway, y - 24 * scale, 6 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5a9a40";
  for (let li = 0; li < 10; li++) {
    const lSway = Math.sin(time * 1.5 + li * 0.8 + x * 0.05) * 1 * scale;
    const lx = x + (seededRandom(x + li * 7) - 0.5) * 20 * scale + lSway;
    const ly = y - 15 * scale - seededRandom(x + li * 7 + 1) * 14 * scale;
    ctx.beginPath();
    ctx.ellipse(
      lx,
      ly,
      2.2 * scale,
      1.4 * scale,
      seededRandom(x + li * 11) * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  for (let di = 0; di < 5; di++) {
    const dx = x + (seededRandom(x + di * 23) - 0.5) * 16 * scale;
    const dy = y - 18 * scale - seededRandom(x + di * 29) * 10 * scale;
    const shimmer = 0.12 + Math.sin(time * 2.5 + di * 1.7 + x * 0.1) * 0.08;
    ctx.fillStyle = `rgba(160, 220, 100, ${shimmer})`;
    ctx.beginPath();
    ctx.arc(dx, dy, (2 + seededRandom(x + di * 31)) * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(120, 200, 80, 0.1)";
  ctx.beginPath();
  ctx.arc(x + sway * 0.5, y - 26 * scale, 4 * scale, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCamp(dc: WorldMapDrawContext, cx: number, cyPct: number) {
  const { ctx, time, getY } = dc;
  const cy = getY(cyPct);

  const groundGrad = ctx.createRadialGradient(cx, cy + 8, 0, cx, cy + 8, 38);
  groundGrad.addColorStop(0, "rgba(90, 65, 40, 0.5)");
  groundGrad.addColorStop(0.7, "rgba(70, 55, 35, 0.3)");
  groundGrad.addColorStop(1, "rgba(60, 45, 30, 0)");
  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 38, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const tentGrad = ctx.createLinearGradient(cx - 22, cy, cx + 22, cy);
  tentGrad.addColorStop(0, "#3a2a1a");
  tentGrad.addColorStop(0.3, "#6a5a4a");
  tentGrad.addColorStop(0.5, "#7a6a58");
  tentGrad.addColorStop(0.7, "#5a4a3a");
  tentGrad.addColorStop(1, "#3a2a1a");
  ctx.fillStyle = tentGrad;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx + 24, cy + 6);
  ctx.lineTo(cx - 24, cy + 6);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx + 24, cy + 6);
  ctx.lineTo(cx - 24, cy + 6);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 0.4;
  for (let hi = -30; hi < 30; hi += 3) {
    ctx.beginPath();
    ctx.moveTo(cx + hi, cy - 25);
    ctx.lineTo(cx + hi + 15, cy + 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + hi, cy - 25);
    ctx.lineTo(cx + hi - 15, cy + 10);
    ctx.stroke();
  }
  ctx.restore();

  const openingGlow = ctx.createRadialGradient(cx, cy + 1, 0, cx, cy + 1, 12);
  openingGlow.addColorStop(0, "rgba(255, 180, 80, 0.3)");
  openingGlow.addColorStop(1, "rgba(255, 120, 40, 0)");
  ctx.fillStyle = openingGlow;
  ctx.beginPath();
  ctx.arc(cx, cy + 1, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a1008";
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 6);
  ctx.lineTo(cx, cy - 6);
  ctx.lineTo(cx + 6, cy + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255, 160, 60, 0.15)";
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + 6);
  ctx.lineTo(cx, cy - 2);
  ctx.lineTo(cx + 4, cy + 6);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(40,25,10,0.5)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx, cy + 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx - 12, cy - 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx + 12, cy - 7);
  ctx.stroke();

  ctx.fillStyle = "#3a2010";
  ctx.fillRect(cx + 20, cy - 28, 2.5, 36);
  const fw = Math.sin(time * 3 + cx) * 3;
  const fw2 = Math.sin(time * 3.5 + cx) * 2;
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(cx + 22, cy - 26);
  ctx.quadraticCurveTo(cx + 30, cy - 22 + fw, cx + 38, cy - 18 + fw2);
  ctx.quadraticCurveTo(cx + 30, cy - 14 + fw, cx + 22, cy - 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + 24, cy - 18 + fw * 0.5);
  ctx.quadraticCurveTo(
    cx + 30,
    cy - 16 + fw * 0.7,
    cx + 36,
    cy - 14 + fw2 * 0.8
  );
  ctx.stroke();
  ctx.fillStyle = "#b45309";
  ctx.beginPath();
  ctx.arc(cx + 29, cy - 18 + fw * 0.4, 1.5, 0, Math.PI * 2);
  ctx.fill();

  for (let li = 0; li < 3; li++) {
    const logAngle = (li / 3) * Math.PI * 2 + 0.5;
    const lx = cx - 12 + Math.cos(logAngle) * 10;
    const ly = cy + 4 + Math.sin(logAngle) * 4;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(logAngle + Math.PI / 2);
    const logGrad = ctx.createLinearGradient(0, -1.5, 0, 1.5);
    logGrad.addColorStop(0, "#5a4030");
    logGrad.addColorStop(0.5, "#6a5040");
    logGrad.addColorStop(1, "#3a2818");
    ctx.fillStyle = logGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.3;
    ctx.stroke();
    ctx.restore();
  }

  const glowGrad = ctx.createRadialGradient(
    cx - 12,
    cy + 2,
    0,
    cx - 12,
    cy + 2,
    16
  );
  glowGrad.addColorStop(
    0,
    `rgba(255, 150, 50, ${0.5 + Math.sin(time * 6) * 0.2})`
  );
  glowGrad.addColorStop(
    0.5,
    `rgba(255, 100, 20, ${0.15 + Math.sin(time * 5) * 0.05})`
  );
  glowGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx - 12, cy + 2, 16, 0, Math.PI * 2);
  ctx.fill();

  for (let si = 0; si < 7; si++) {
    const angle = (si / 7) * Math.PI * 2;
    const sx = cx - 12 + Math.cos(angle) * 5;
    const sy = cy + 4 + Math.sin(angle) * 2.2;
    const stoneGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 2.5);
    stoneGrad.addColorStop(0, "#5a5050");
    stoneGrad.addColorStop(1, "#3a3030");
    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 2.8, 1.6, angle * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  const flameColors = ["#ff4400", "#ff6600", "#ffaa00", "#ffcc00"];
  for (let f = 0; f < 4; f++) {
    const fh = 7 + Math.sin(time * 9 + f * 2.3) * 3;
    const fx = cx - 15 + f * 2.5;
    ctx.fillStyle = flameColors[f];
    ctx.globalAlpha = 0.7 + Math.sin(time * 8 + f * 1.5) * 0.3;
    ctx.beginPath();
    ctx.moveTo(fx - 2, cy + 3);
    ctx.quadraticCurveTo(
      fx + Math.sin(time * 7 + f) * 1.5,
      cy - fh,
      fx + 2,
      cy + 3
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (let ei = 0; ei < 6; ei++) {
    const age = (time * 22 + ei * 15) % 35;
    const ey = cy - 2 - age;
    const ex = cx - 12 + Math.sin(time * 2 + ei * 2.1) * (3 + age * 0.15);
    const eAlpha = Math.max(0, 0.8 - age / 35);
    const eSize = Math.max(0.3, 1.2 - age / 40);
    if (eAlpha > 0) {
      ctx.globalAlpha = eAlpha;
      ctx.fillStyle = age < 10 ? "#ffcc00" : "#ff6600";
      ctx.beginPath();
      ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  for (let si = 0; si < 4; si++) {
    const smokeY = cy - 10 - ((time * 16 + si * 10) % 28);
    const smokeX = cx - 12 + Math.sin(time * 1.3 + si * 1.4) * 5;
    const smokeA = 0.3 - ((time * 16 + si * 10) % 28) / 80;
    if (smokeA > 0) {
      ctx.globalAlpha = smokeA;
      ctx.fillStyle = "#999";
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, 2.5 + si * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#3a2818";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy + 5);
  ctx.lineTo(cx - 12, cy - 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 5);
  ctx.lineTo(cx - 12, cy - 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy + 5);
  ctx.lineTo(cx - 12, cy - 8);
  ctx.stroke();
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 3, 3, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 5, 2.5, Math.PI, Math.PI * 2);
  ctx.stroke();

  const crateGrad1 = ctx.createLinearGradient(cx + 24, cy + 1, cx + 34, cy + 7);
  crateGrad1.addColorStop(0, "#6a5038");
  crateGrad1.addColorStop(1, "#4a3020");
  ctx.fillStyle = crateGrad1;
  ctx.fillRect(cx + 24, cy + 1, 10, 7);
  ctx.strokeStyle = "#8a8070";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx + 24, cy + 3);
  ctx.lineTo(cx + 34, cy + 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 24, cy + 6);
  ctx.lineTo(cx + 34, cy + 6);
  ctx.stroke();
  ctx.strokeStyle = "#3a2010";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(cx + 24, cy + 1, 10, 7);
  const crateGrad2 = ctx.createLinearGradient(cx + 25, cy - 4, cx + 33, cy + 1);
  crateGrad2.addColorStop(0, "#5a4028");
  crateGrad2.addColorStop(1, "#3a2518");
  ctx.fillStyle = crateGrad2;
  ctx.fillRect(cx + 25, cy - 4, 8, 5);
  ctx.strokeStyle = "#8a8070";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(cx + 25, cy - 2);
  ctx.lineTo(cx + 33, cy - 2);
  ctx.stroke();
  ctx.strokeStyle = "#3a2010";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(cx + 25, cy - 4, 8, 5);

  ctx.fillStyle = "#4a3020";
  ctx.fillRect(cx - 30, cy, 2, 10);
  ctx.fillRect(cx - 22, cy, 2, 10);
  ctx.fillRect(cx - 31, cy - 2, 12, 2);
  ctx.strokeStyle = "#6a6a6a";
  ctx.lineWidth = 1;
  for (let s = 0; s < 3; s++) {
    ctx.beginPath();
    ctx.moveTo(cx - 28 + s * 3, cy - 1);
    ctx.lineTo(cx - 28 + s * 3, cy - 12);
    ctx.stroke();
    const spearGrad = ctx.createLinearGradient(
      cx - 29 + s * 3,
      cy - 16,
      cx - 25 + s * 3,
      cy - 12
    );
    spearGrad.addColorStop(0, "#b0b0b0");
    spearGrad.addColorStop(1, "#707070");
    ctx.fillStyle = spearGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 29 + s * 3, cy - 12);
    ctx.lineTo(cx - 27 + s * 3, cy - 16);
    ctx.lineTo(cx - 25 + s * 3, cy - 12);
    ctx.fill();
  }
}
