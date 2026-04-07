import { WorldMapDrawContext } from "./drawContext";

// =============================================================================
// FRIENDLY UNITS (Princeton Kingdom)
// =============================================================================

export function drawMiniKnight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + 7, 6, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  const capeWave = Math.sin(t * 1.8) * 3;
  ctx.fillStyle = "#c2640a";
  ctx.beginPath();
  ctx.moveTo(x - dir * 2, y - 4 + bob);
  ctx.quadraticCurveTo(
    x - dir * 8 + capeWave,
    y + 2 + bob,
    x - dir * 6 + capeWave * 0.7,
    y + 8 + bob
  );
  ctx.lineTo(x + dir * 1, y + 6 + bob);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#555e70";
  ctx.fillRect(x - 3, y + 2 + bob, 2.5, 6);
  ctx.fillRect(x + 0.5, y + 2 + bob, 2.5, 6);
  ctx.fillStyle = "#6b7590";
  ctx.fillRect(x - 3, y + 2 + bob, 2.5, 1);
  ctx.fillRect(x + 0.5, y + 2 + bob, 2.5, 1);

  const bodyGrad = ctx.createLinearGradient(x - 5, y - 6, x + 5, y + 4);
  bodyGrad.addColorStop(0, "#8a93a8");
  bodyGrad.addColorStop(0.4, "#6b7590");
  bodyGrad.addColorStop(1, "#4a5268");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 3 + bob);
  ctx.lineTo(x - 5.5, y - 4 + bob);
  ctx.lineTo(x + 5.5, y - 4 + bob);
  ctx.lineTo(x + 5, y + 3 + bob);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(200,210,230,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y - 2 + bob, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7a84a0";
  ctx.beginPath();
  ctx.arc(x - 5, y - 5 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 5, y - 5 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d4a020";
  ctx.beginPath();
  ctx.arc(x - 5, y - 5 + bob, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 5, y - 5 + bob, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e8c090";
  ctx.beginPath();
  ctx.arc(x, y - 10 + bob, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6b7590";
  ctx.beginPath();
  ctx.arc(x, y - 11.5 + bob, 4.5, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#555e70";
  ctx.fillRect(x - 4, y - 11 + bob, 8, 2.5);
  ctx.fillStyle = "#1a1a2a";
  ctx.fillRect(x - 3, y - 10.5 + bob, 6, 1.2);
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(x, y - 16 + bob);
  ctx.lineTo(x - 1.5, y - 11 + bob);
  ctx.lineTo(x + 1.5, y - 11 + bob);
  ctx.closePath();
  ctx.fill();

  const shieldX = x + dir * 6;
  const shieldBob = Math.sin(t * 1.2) * 0.5;
  ctx.fillStyle = "#92400e";
  ctx.beginPath();
  ctx.moveTo(shieldX - 3.5, y - 6 + bob + shieldBob);
  ctx.lineTo(shieldX + 3.5, y - 6 + bob + shieldBob);
  ctx.lineTo(shieldX + 3, y + bob + shieldBob);
  ctx.lineTo(shieldX, y + 4 + bob + shieldBob);
  ctx.lineTo(shieldX - 3, y + bob + shieldBob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(shieldX, y - 5 + bob + shieldBob);
  ctx.lineTo(shieldX + 2, y - 1 + bob + shieldBob);
  ctx.lineTo(shieldX, y + 2 + bob + shieldBob);
  ctx.lineTo(shieldX - 2, y - 1 + bob + shieldBob);
  ctx.closePath();
  ctx.fill();

  const swordAngle = Math.sin(t * 1.6) * 0.9;
  ctx.save();
  ctx.translate(x - dir * 5, y - 5 + bob);
  ctx.rotate(swordAngle * dir);
  ctx.fillStyle = "#d0d0e0";
  ctx.fillRect(-1.2, -15, 2.4, 14);
  ctx.fillStyle = "#e8e8f0";
  ctx.fillRect(-0.6, -14, 1.2, 12);
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(-3, -2, 6, 2);
  ctx.fillStyle = "#b8860b";
  ctx.beginPath();
  ctx.arc(0, 1, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawMiniSoldier(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 5, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  const capeWave = Math.sin(t * 2) * 2;
  ctx.fillStyle = "#b85c0a";
  ctx.beginPath();
  ctx.moveTo(x - dir * 1.5, y - 2 + bob);
  ctx.quadraticCurveTo(
    x - dir * 6 + capeWave,
    y + 2 + bob,
    x - dir * 4 + capeWave * 0.5,
    y + 6 + bob
  );
  ctx.lineTo(x + dir * 1, y + 5 + bob);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#5a4030";
  ctx.fillRect(x - 2.5, y + 1 + bob, 2, 5);
  ctx.fillRect(x + 0.5, y + 1 + bob, 2, 5);

  ctx.fillStyle = "#7a5a30";
  ctx.beginPath();
  ctx.ellipse(x, y - 1 + bob, 4.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(160,160,170,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y - 2 + bob, 3, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e0b888";
  ctx.beginPath();
  ctx.arc(x, y - 8 + bob, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8a7030";
  ctx.beginPath();
  ctx.arc(x, y - 9.5 + bob, 3.8, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#a08040";
  ctx.beginPath();
  ctx.moveTo(x, y - 13 + bob);
  ctx.lineTo(x - 1, y - 9 + bob);
  ctx.lineTo(x + 1, y - 9 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(x + dir * 1.2, y - 8 + bob, 0.7, 0, Math.PI * 2);
  ctx.fill();

  const shieldX = x + dir * 5;
  ctx.fillStyle = "#704a20";
  ctx.beginPath();
  ctx.arc(shieldX, y - 1 + bob, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e8a020";
  ctx.beginPath();
  ctx.arc(shieldX, y - 1 + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  const spearAngle = Math.sin(t * 1.4 + 1) * 0.5;
  ctx.save();
  ctx.translate(x - dir * 4, y - 3 + bob);
  ctx.rotate(spearAngle * dir - 0.2 * dir);
  ctx.fillStyle = "#5a4020";
  ctx.fillRect(-0.8, -18, 1.6, 16);
  ctx.fillStyle = "#b0b0c0";
  ctx.beginPath();
  ctx.moveTo(-2, -18);
  ctx.lineTo(0, -22);
  ctx.lineTo(2, -18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawMiniArcher(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 4.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Short green cape
  const capeWave = Math.sin(t * 1.8) * 1.5;
  ctx.fillStyle = "#3a6828";
  ctx.beginPath();
  ctx.moveTo(x - dir * 1.5, y - 2 + bob);
  ctx.quadraticCurveTo(
    x - dir * 5 + capeWave,
    y + 2 + bob,
    x - dir * 4 + capeWave * 0.5,
    y + 5 + bob
  );
  ctx.lineTo(x + dir * 1, y + 4 + bob);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#5a4a30";
  ctx.fillRect(x - 2, y + 1 + bob, 2, 5);
  ctx.fillRect(x + 0.5, y + 1 + bob, 2, 5);

  // Leather tunic
  ctx.fillStyle = "#6a5030";
  ctx.beginPath();
  ctx.ellipse(x, y - 1 + bob, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e0b888";
  ctx.beginPath();
  ctx.arc(x, y - 8 + bob, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Feathered cap
  ctx.fillStyle = "#4a7830";
  ctx.beginPath();
  ctx.arc(x, y - 9.5 + bob, 3.5, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(x + dir * 2, y - 12 + bob);
  ctx.lineTo(x + dir * 4, y - 16 + bob);
  ctx.lineTo(x + dir * 3, y - 11 + bob);
  ctx.closePath();
  ctx.fill();
  // Eye
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(x + dir * 1.2, y - 8 + bob, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Longbow
  const drawPhase = (t * 0.6) % 5;
  const pullBack = drawPhase < 2.5 ? Math.sin(drawPhase * Math.PI * 0.4) : 0;
  ctx.save();
  ctx.translate(x + dir * 4, y - 3 + bob);
  ctx.strokeStyle = "#6a4a20";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(dir * 2, 0, 9, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();
  ctx.strokeStyle = "#c8b080";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(
    dir * 2 + Math.cos(-Math.PI * 0.4) * 9,
    Math.sin(-Math.PI * 0.4) * 9
  );
  ctx.lineTo(-dir * pullBack * 4, 0);
  ctx.lineTo(
    dir * 2 + Math.cos(Math.PI * 0.4) * 9,
    Math.sin(Math.PI * 0.4) * 9
  );
  ctx.stroke();
  if (pullBack > 0.3) {
    ctx.fillStyle = "#5a4020";
    ctx.fillRect(-dir * pullBack * 4, -0.5, dir * 11, 1);
    ctx.fillStyle = "#d4a020";
    ctx.beginPath();
    ctx.moveTo(dir * (11 - pullBack * 4), 0);
    ctx.lineTo(dir * (9 - pullBack * 4), -1.5);
    ctx.lineTo(dir * (9 - pullBack * 4), 1.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Quiver
  ctx.fillStyle = "#5a3a18";
  ctx.fillRect(x - dir * 3, y - 6 + bob, 2.5, 7);
  for (let a = 0; a < 3; a++) {
    ctx.fillStyle = "#8a7050";
    ctx.fillRect(x - dir * 2.5 + a * 0.7, y - 9 + bob, 0.5, 3);
  }
}

export function drawMiniCavalry(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;
  const gallop = Math.sin(t * 3.5) * 2;
  const legCycle = Math.sin(t * 3.5);

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  const legColors = ["#3a2516", "#2d1c10"];
  for (let leg = 0; leg < 4; leg++) {
    const legX = x + (leg - 1.5) * 5 * dir;
    const legPhase = legCycle * (leg % 2 === 0 ? 1 : -1);
    const legLen = 7 + legPhase * 2;
    ctx.fillStyle = legColors[leg % 2];
    ctx.fillRect(legX - 1, y + 1 + gallop, 2, legLen);
    ctx.fillStyle = "#1a1008";
    ctx.fillRect(legX - 1.3, y + legLen + gallop, 2.6, 1.5);
  }

  const horseGrad = ctx.createLinearGradient(x - 12, y - 4, x + 12, y + 4);
  horseGrad.addColorStop(0, "#4a3520");
  horseGrad.addColorStop(0.5, "#5a3d24");
  horseGrad.addColorStop(1, "#3a2516");
  ctx.fillStyle = horseGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - 1 + gallop, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4a3520";
  ctx.beginPath();
  ctx.moveTo(x + dir * 10, y - 3 + gallop);
  ctx.quadraticCurveTo(
    x + dir * 14,
    y - 8 + gallop,
    x + dir * 12,
    y - 14 + gallop
  );
  ctx.lineTo(x + dir * 8, y - 6 + gallop);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#5a3d24";
  ctx.beginPath();
  ctx.ellipse(x + dir * 13, y - 15 + gallop, 4, 3.5, dir * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a4d34";
  ctx.beginPath();
  ctx.ellipse(x + dir * 16, y - 14 + gallop, 2.5, 2, dir * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.arc(x + dir * 12, y - 16 + gallop, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a3520";
  ctx.beginPath();
  ctx.moveTo(x + dir * 11, y - 18 + gallop);
  ctx.lineTo(x + dir * 10, y - 22 + gallop);
  ctx.lineTo(x + dir * 12, y - 19 + gallop);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1a0e06";
  for (let m = 0; m < 5; m++) {
    const mx = x + dir * (8 + m * 1.2);
    const mWave = Math.sin(t * 2.5 + m) * 1.5;
    ctx.beginPath();
    ctx.moveTo(mx, y - 6 + gallop);
    ctx.quadraticCurveTo(
      mx - dir * 2,
      y - 10 + gallop + mWave,
      mx - dir * 1,
      y - 13 + gallop + mWave
    );
    ctx.lineTo(mx + dir * 1, y - 7 + gallop);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#1a0e06";
  const tailWave = Math.sin(t * 2) * 3;
  ctx.beginPath();
  ctx.moveTo(x - dir * 12, y - 2 + gallop);
  ctx.quadraticCurveTo(
    x - dir * 18 + tailWave,
    y - 4 + gallop,
    x - dir * 20 + tailWave * 1.3,
    y + 2 + gallop
  );
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#1a0e06";
  ctx.stroke();

  ctx.fillStyle = "rgba(180,140,60,0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y - 2 + gallop, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#646b81";
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 5 + gallop);
  ctx.lineTo(x - 4.5, y - 14 + gallop);
  ctx.lineTo(x + 4.5, y - 14 + gallop);
  ctx.lineTo(x + 4, y - 5 + gallop);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#7a84a0";
  ctx.beginPath();
  ctx.arc(x - 4.5, y - 14 + gallop, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 4.5, y - 14 + gallop, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6b7590";
  ctx.beginPath();
  ctx.arc(x, y - 19 + gallop, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#555e70";
  ctx.beginPath();
  ctx.arc(x, y - 20 + gallop, 3.2, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#1a1a2a";
  ctx.fillRect(x - 2.5, y - 19.5 + gallop, 5, 1);
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(x, y - 24 + gallop);
  ctx.lineTo(x - 1, y - 20 + gallop);
  ctx.lineTo(x + 1, y - 20 + gallop);
  ctx.closePath();
  ctx.fill();

  const lanceAngle = Math.sin(t * 1) * 0.15;
  ctx.save();
  ctx.translate(x + dir * 3, y - 12 + gallop);
  ctx.rotate(lanceAngle + dir * 0.35);
  ctx.fillStyle = "#5a4020";
  ctx.fillRect(-1, -24, 2, 28);
  ctx.fillStyle = "#c0c0d0";
  ctx.beginPath();
  ctx.moveTo(-2.5, -24);
  ctx.lineTo(0, -30);
  ctx.lineTo(2.5, -24);
  ctx.closePath();
  ctx.fill();
  const pennantWave = Math.sin(t * 2.5) * 2;
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(dir * 8 + pennantWave, -20);
  ctx.lineTo(dir * 6 + pennantWave * 0.5, -17);
  ctx.lineTo(0, -18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// =============================================================================
// ENEMY UNITS (Dark Kingdom)
// =============================================================================

export function drawMiniDarkKnight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 5.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a1a1a";
  ctx.fillRect(x - 3, y + 1 + bob, 2.5, 6);
  ctx.fillRect(x + 0.5, y + 1 + bob, 2.5, 6);

  const capeWave = Math.sin(t * 1.5) * 2.5;
  ctx.fillStyle = "#3a0808";
  ctx.beginPath();
  ctx.moveTo(x - dir * 2, y - 4 + bob);
  ctx.quadraticCurveTo(
    x - dir * 7 + capeWave,
    y + 1 + bob,
    x - dir * 5 + capeWave * 0.8,
    y + 8 + bob
  );
  ctx.lineTo(x + dir * 1, y + 6 + bob);
  ctx.closePath();
  ctx.fill();

  const bodyGrad = ctx.createLinearGradient(x - 5, y - 6, x + 5, y + 4);
  bodyGrad.addColorStop(0, "#3a2020");
  bodyGrad.addColorStop(0.5, "#2a1515");
  bodyGrad.addColorStop(1, "#1a0a0a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 2 + bob);
  ctx.lineTo(x - 5, y - 5 + bob);
  ctx.lineTo(x + 5, y - 5 + bob);
  ctx.lineTo(x + 5, y + 2 + bob);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = `rgba(255,40,20,${0.4 + Math.sin(t * 1.5) * 0.2})`;
  ctx.beginPath();
  ctx.arc(x, y - 2 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3a2020";
  ctx.beginPath();
  ctx.arc(x - 5, y - 5 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 5, y - 5 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0808";
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 5 + bob);
  ctx.lineTo(x - 8.5, y - 10 + bob);
  ctx.lineTo(x - 5.5, y - 6 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 7, y - 5 + bob);
  ctx.lineTo(x + 8.5, y - 10 + bob);
  ctx.lineTo(x + 5.5, y - 6 + bob);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#450a0a";
  ctx.beginPath();
  ctx.arc(x, y - 10 + bob, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a0808";
  ctx.beginPath();
  ctx.arc(x, y - 11.5 + bob, 4.2, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#1a0505";
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 13 + bob);
  ctx.lineTo(x - 7, y - 20 + bob);
  ctx.lineTo(x - 2, y - 13 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 4, y - 13 + bob);
  ctx.lineTo(x + 7, y - 20 + bob);
  ctx.lineTo(x + 2, y - 13 + bob);
  ctx.closePath();
  ctx.fill();

  const eyeGlow = 0.7 + Math.sin(t * 2.5) * 0.3;
  ctx.fillStyle = `rgba(255,0,0,${eyeGlow})`;
  ctx.beginPath();
  ctx.arc(x - 1.5, y - 10 + bob, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.5, y - 10 + bob, 1.2, 0, Math.PI * 2);
  ctx.fill();

  const axeAngle = Math.sin(t * 1.5 + 1.5) * 0.7;
  ctx.save();
  ctx.translate(x + dir * 5, y - 4 + bob);
  ctx.rotate(axeAngle * dir);
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(-1, -14, 2, 14);
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.moveTo(-5, -14);
  ctx.lineTo(0, -18);
  ctx.lineTo(5, -14);
  ctx.lineTo(3, -10);
  ctx.lineTo(-3, -10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(200,30,0,${0.3 + Math.sin(t * 2) * 0.1})`;
  ctx.beginPath();
  ctx.moveTo(-3, -13);
  ctx.lineTo(0, -16);
  ctx.lineTo(3, -13);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawMiniSkeletonWarrior(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 4.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#c8b898";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 2, y + 1 + bob);
  ctx.lineTo(x - 2.5, y + 6 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 1 + bob);
  ctx.lineTo(x + 2.5, y + 6 + bob);
  ctx.stroke();

  ctx.fillStyle = "#d0c0a0";
  ctx.beginPath();
  ctx.ellipse(x, y - 1 + bob, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a09070";
  ctx.lineWidth = 0.6;
  for (let r = 0; r < 3; r++) {
    ctx.beginPath();
    ctx.ellipse(x, y - 3 + r * 2 + bob, 3, 1, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#e8d8c0";
  ctx.beginPath();
  ctx.arc(x, y - 8 + bob, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d0c0a0";
  ctx.beginPath();
  ctx.arc(x, y - 5.5 + bob, 2.5, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = "#1a0808";
  ctx.beginPath();
  ctx.arc(x - 1.5, y - 8.5 + bob, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.5, y - 8.5 + bob, 1.2, 0, Math.PI * 2);
  ctx.fill();
  const socketGlow = 0.5 + Math.sin(t * 2) * 0.3;
  ctx.fillStyle = `rgba(180,40,255,${socketGlow})`;
  ctx.beginPath();
  ctx.arc(x - 1.5, y - 8.5 + bob, 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.5, y - 8.5 + bob, 0.7, 0, Math.PI * 2);
  ctx.fill();

  const swordAngle = Math.sin(t * 1.8) * 0.6;
  ctx.save();
  ctx.translate(x + dir * 4, y - 3 + bob);
  ctx.rotate(swordAngle * dir);
  ctx.fillStyle = "#8a7a60";
  ctx.fillRect(-1, -12, 2, 11);
  ctx.fillStyle = "#6a5a40";
  ctx.fillRect(-2, -1, 4, 2);
  ctx.restore();

  ctx.fillStyle = "#4a3a2a";
  ctx.beginPath();
  ctx.arc(x - dir * 4, y - 1 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
}

export function drawMiniEnemyArcher(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 4.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a1a10";
  ctx.fillRect(x - 2.5, y + 1 + bob, 2, 5);
  ctx.fillRect(x + 0.5, y + 1 + bob, 2, 5);

  ctx.fillStyle = "#3a2218";
  ctx.beginPath();
  ctx.ellipse(x, y - 1 + bob, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a1810";
  ctx.beginPath();
  ctx.arc(x, y - 8 + bob, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 7 + bob);
  ctx.lineTo(x, y - 13 + bob);
  ctx.lineTo(x + 4, y - 7 + bob);
  ctx.closePath();
  ctx.fill();

  const eyeFlicker = 0.6 + Math.sin(t * 3) * 0.2;
  ctx.fillStyle = `rgba(255,60,20,${eyeFlicker})`;
  ctx.beginPath();
  ctx.arc(x - 1.2, y - 8 + bob, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.2, y - 8 + bob, 0.8, 0, Math.PI * 2);
  ctx.fill();

  const drawPhase = (t * 0.7) % 4;
  const pullBack = drawPhase < 2 ? Math.sin(drawPhase * Math.PI * 0.5) : 0;
  ctx.save();
  ctx.translate(x + dir * 4, y - 3 + bob);
  ctx.strokeStyle = "#5a3a20";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(dir * 2, 0, 8, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();
  ctx.strokeStyle = "#8a7a60";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(
    dir * 2 + Math.cos(-Math.PI * 0.4) * 8,
    Math.sin(-Math.PI * 0.4) * 8
  );
  ctx.lineTo(-dir * pullBack * 4, 0);
  ctx.lineTo(
    dir * 2 + Math.cos(Math.PI * 0.4) * 8,
    Math.sin(Math.PI * 0.4) * 8
  );
  ctx.stroke();
  if (pullBack > 0.3) {
    ctx.fillStyle = "#4a3a20";
    ctx.fillRect(-dir * pullBack * 4, -0.5, dir * 10, 1);
    ctx.fillStyle = "#8a8a90";
    ctx.beginPath();
    ctx.moveTo(dir * (10 - pullBack * 4), 0);
    ctx.lineTo(dir * (8 - pullBack * 4), -1.5);
    ctx.lineTo(dir * (8 - pullBack * 4), 1.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = "#4a2a18";
  ctx.fillRect(x - dir * 3, y - 7 + bob, 3, 8);
  ctx.fillStyle = "#6a4a28";
  ctx.fillRect(x - dir * 3, y - 7 + bob, 3, 1);
  for (let a = 0; a < 3; a++) {
    ctx.fillStyle = "#8a7a60";
    ctx.fillRect(x - dir * 2.5 + a * 0.8, y - 10 + bob, 0.6, 3);
  }
}

export function drawMiniOrcBrute(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 7, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thick legs
  ctx.fillStyle = "#3a4a20";
  ctx.fillRect(x - 4, y + 2 + bob, 3, 7);
  ctx.fillRect(x + 1, y + 2 + bob, 3, 7);
  ctx.fillStyle = "#2a3418";
  ctx.fillRect(x - 4.5, y + 7 + bob, 3.5, 2);
  ctx.fillRect(x + 0.5, y + 7 + bob, 3.5, 2);

  // Big bulky body
  ctx.fillStyle = "#4a6830";
  ctx.beginPath();
  ctx.ellipse(x, y - 1 + bob, 7, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Crude hide vest
  ctx.fillStyle = "#5a3a18";
  ctx.beginPath();
  ctx.ellipse(x, y - 1 + bob, 5, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big arms
  ctx.fillStyle = "#4a6830";
  ctx.beginPath();
  ctx.ellipse(x - 7, y - 2 + bob, 3, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 7, y - 2 + bob, 3, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head (big jaw)
  ctx.fillStyle = "#5a7838";
  ctx.beginPath();
  ctx.arc(x, y - 10 + bob, 5, 0, Math.PI * 2);
  ctx.fill();
  // Lower jaw / underbite
  ctx.fillStyle = "#4a6830";
  ctx.beginPath();
  ctx.arc(x, y - 7 + bob, 3.5, 0, Math.PI);
  ctx.fill();
  // Tusks
  ctx.fillStyle = "#d0c8a0";
  ctx.beginPath();
  ctx.moveTo(x - 2.5, y - 7 + bob);
  ctx.lineTo(x - 3, y - 4 + bob);
  ctx.lineTo(x - 1.5, y - 6.5 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 2.5, y - 7 + bob);
  ctx.lineTo(x + 3, y - 4 + bob);
  ctx.lineTo(x + 1.5, y - 6.5 + bob);
  ctx.closePath();
  ctx.fill();

  // Beady red eyes
  const eyePulse = 0.8 + Math.sin(t * 2) * 0.2;
  ctx.fillStyle = `rgba(255,40,0,${eyePulse})`;
  ctx.beginPath();
  ctx.arc(x - 2, y - 10.5 + bob, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 2, y - 10.5 + bob, 1, 0, Math.PI * 2);
  ctx.fill();

  // Iron helm band
  ctx.fillStyle = "#4a4a40";
  ctx.fillRect(x - 5, y - 14 + bob, 10, 2.5);

  // Huge mace
  const maceAngle = Math.sin(t * 1.2) * 0.6;
  ctx.save();
  ctx.translate(x + dir * 7, y - 4 + bob);
  ctx.rotate(maceAngle * dir);
  ctx.fillStyle = "#5a4a30";
  ctx.fillRect(-1.2, -16, 2.4, 14);
  // Spiked ball
  ctx.fillStyle = "#3a3a38";
  ctx.beginPath();
  ctx.arc(0, -17, 4, 0, Math.PI * 2);
  ctx.fill();
  for (let sp = 0; sp < 6; sp++) {
    const sa = (sp / 6) * Math.PI * 2;
    ctx.fillStyle = "#2a2a28";
    ctx.beginPath();
    ctx.moveTo(Math.cos(sa) * 3, -17 + Math.sin(sa) * 3);
    ctx.lineTo(Math.cos(sa) * 6, -17 + Math.sin(sa) * 6);
    ctx.lineTo(Math.cos(sa + 0.3) * 3, -17 + Math.sin(sa + 0.3) * 3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawMiniNecromancer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 5, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Long dark robes (cover legs)
  const robeGrad = ctx.createLinearGradient(x - 5, y - 8, x + 5, y + 8);
  robeGrad.addColorStop(0, "#1a0828");
  robeGrad.addColorStop(0.5, "#120520");
  robeGrad.addColorStop(1, "#0a0212");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 6 + bob);
  ctx.lineTo(x - 4, y - 6 + bob);
  ctx.lineTo(x + 4, y - 6 + bob);
  ctx.lineTo(x + 5, y + 6 + bob);
  ctx.closePath();
  ctx.fill();

  // Robe bottom fraying
  ctx.fillStyle = "#1a0828";
  for (let f = 0; f < 4; f++) {
    const fx = x - 4 + f * 2.5;
    ctx.beginPath();
    ctx.moveTo(fx, y + 5 + bob);
    ctx.lineTo(fx + 0.5, y + 8 + bob);
    ctx.lineTo(fx + 2, y + 5 + bob);
    ctx.closePath();
    ctx.fill();
  }

  // Cowl / hood
  ctx.fillStyle = "#120520";
  ctx.beginPath();
  ctx.arc(x, y - 8 + bob, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 7 + bob);
  ctx.lineTo(x, y - 15 + bob);
  ctx.lineTo(x + 5, y - 7 + bob);
  ctx.closePath();
  ctx.fill();

  // Glowing eyes deep in hood
  const eyeGlow = 0.6 + Math.sin(t * 2.5) * 0.3;
  ctx.fillStyle = `rgba(100,255,100,${eyeGlow})`;
  ctx.beginPath();
  ctx.arc(x - 1.5, y - 8.5 + bob, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.5, y - 8.5 + bob, 1, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow aura
  ctx.fillStyle = `rgba(100,255,100,${eyeGlow * 0.15})`;
  ctx.beginPath();
  ctx.ellipse(x, y - 8.5 + bob, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Staff with glowing orb
  ctx.save();
  ctx.translate(x + dir * 5, y - 4 + bob);
  const staffSway = Math.sin(t * 0.8) * 0.15;
  ctx.rotate(staffSway * dir - 0.1 * dir);
  ctx.fillStyle = "#3a2040";
  ctx.fillRect(-0.8, -20, 1.6, 18);
  // Orb
  const orbPulse = 0.6 + Math.sin(t * 2) * 0.3;
  const orbGrad = ctx.createRadialGradient(0, -21, 0, 0, -21, 5);
  orbGrad.addColorStop(0, `rgba(120,255,120,${orbPulse})`);
  orbGrad.addColorStop(0.5, `rgba(60,200,60,${orbPulse * 0.5})`);
  orbGrad.addColorStop(1, "rgba(20,80,20,0)");
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(0, -21, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(160,255,160,${orbPulse * 0.8})`;
  ctx.beginPath();
  ctx.arc(0, -21, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Floating dark particles
  for (let p = 0; p < 3; p++) {
    const pAngle = t * 1.2 + p * ((Math.PI * 2) / 3);
    const pDist = 8 + Math.sin(t * 1.5 + p) * 2;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - 4 + bob + Math.sin(pAngle) * pDist * 0.3;
    const pAlpha = 0.3 + Math.sin(t * 2 + p) * 0.15;
    ctx.fillStyle = `rgba(80,0,120,${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawMiniGoblin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean,
  combatSway: number,
  bob: number
) {
  const dir = flip ? -1 : 1;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + 5, 4, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Scrawny legs
  ctx.fillStyle = "#5a7838";
  ctx.fillRect(x - 2, y + 1 + bob, 1.5, 4);
  ctx.fillRect(x + 0.5, y + 1 + bob, 1.5, 4);

  // Small hunched body
  ctx.fillStyle = "#4a6430";
  ctx.beginPath();
  ctx.ellipse(x, y - 1 + bob, 3.5, 4, 0.1 * dir, 0, Math.PI * 2);
  ctx.fill();
  // Torn vest
  ctx.fillStyle = "#3a2a18";
  ctx.beginPath();
  ctx.ellipse(x, y - 1 + bob, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big pointy ears
  ctx.fillStyle = "#5a7838";
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 7 + bob);
  ctx.lineTo(x - 7, y - 11 + bob);
  ctx.lineTo(x - 2, y - 5 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 3, y - 7 + bob);
  ctx.lineTo(x + 7, y - 11 + bob);
  ctx.lineTo(x + 2, y - 5 + bob);
  ctx.closePath();
  ctx.fill();

  // Head (oversized)
  ctx.fillStyle = "#5a7838";
  ctx.beginPath();
  ctx.arc(x, y - 6 + bob, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Big yellow eyes
  ctx.fillStyle = "#e8e030";
  ctx.beginPath();
  ctx.arc(x - 1.5, y - 6.5 + bob, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.5, y - 6.5 + bob, 1.3, 0, Math.PI * 2);
  ctx.fill();
  // Pupils
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.arc(x - 1.3 + dir * 0.3, y - 6.5 + bob, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 1.7 + dir * 0.3, y - 6.5 + bob, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Snaggletooth grin
  ctx.fillStyle = "#c8c088";
  ctx.beginPath();
  ctx.moveTo(x - 0.5, y - 4 + bob);
  ctx.lineTo(x, y - 2.5 + bob);
  ctx.lineTo(x + 0.5, y - 4 + bob);
  ctx.closePath();
  ctx.fill();

  // Crude dagger
  const stabAngle = Math.sin(t * 2.2) * 0.8;
  ctx.save();
  ctx.translate(x + dir * 4, y - 2 + bob);
  ctx.rotate(stabAngle * dir);
  ctx.fillStyle = "#6a6a68";
  ctx.beginPath();
  ctx.moveTo(-1, -8);
  ctx.lineTo(0, -10);
  ctx.lineTo(1, -8);
  ctx.lineTo(0.5, 0);
  ctx.lineTo(-0.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a3a20";
  ctx.fillRect(-1, 0, 2, 3);
  ctx.restore();
}

// =============================================================================
// FLYING UNITS
// =============================================================================

export function drawMiniHarpy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean
) {
  const dir = flip ? -1 : 1;
  const wingFlap = Math.sin(t * 4) * 0.6;
  const swoop = Math.sin(t * 1.2) * 3;
  const bodyBob = Math.sin(t * 2.5) * 1.5;

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(x, y + 20 + swoop * 0.5, 8, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const drawY = y + bodyBob;

  ctx.save();
  ctx.translate(x, drawY);

  ctx.save();
  ctx.rotate(-wingFlap - 0.3);
  ctx.fillStyle = "#4a2060";
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.quadraticCurveTo(-10, -8, -18, -4);
  ctx.quadraticCurveTo(-14, -2, -8, 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#6a3890";
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.quadraticCurveTo(-8, -6, -14, -3);
  ctx.quadraticCurveTo(-10, -1, -6, 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.rotate(wingFlap + 0.3);
  ctx.fillStyle = "#4a2060";
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.quadraticCurveTo(10, -8, 18, -4);
  ctx.quadraticCurveTo(14, -2, 8, 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#6a3890";
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.quadraticCurveTo(8, -6, 14, -3);
  ctx.quadraticCurveTo(10, -1, 6, 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();

  ctx.fillStyle = "#5a2870";
  ctx.beginPath();
  ctx.ellipse(x, drawY, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#6a3890";
  ctx.beginPath();
  ctx.arc(x, drawY - 6, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c8a840";
  ctx.beginPath();
  ctx.moveTo(x + dir * 2, drawY - 6);
  ctx.lineTo(x + dir * 5, drawY - 5);
  ctx.lineTo(x + dir * 2, drawY - 4.5);
  ctx.closePath();
  ctx.fill();

  const eyePulse = 0.7 + Math.sin(t * 3) * 0.3;
  ctx.fillStyle = `rgba(255,100,200,${eyePulse})`;
  ctx.beginPath();
  ctx.arc(x + dir * 1, drawY - 6.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#3a1a4a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 2, drawY + 4);
  ctx.lineTo(x - 3, drawY + 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 2, drawY + 4);
  ctx.lineTo(x + 3, drawY + 7);
  ctx.stroke();
}

export function drawMiniWyvern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  flip: boolean
) {
  const dir = flip ? -1 : 1;
  const wingFlap = Math.sin(t * 3) * 0.5;
  const swoop = Math.sin(t * 0.9) * 4;
  const bodyBob = Math.sin(t * 2) * 2;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(x, y + 25 + swoop * 0.3, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  const drawY = y + bodyBob;

  ctx.save();
  ctx.translate(x, drawY);

  ctx.save();
  ctx.rotate(-wingFlap - 0.2);
  ctx.fillStyle = "#2a3828";
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.quadraticCurveTo(-12, -14, -24, -8);
  ctx.lineTo(-20, -4);
  ctx.quadraticCurveTo(-14, -1, -8, 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(60,90,50,0.5)";
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.quadraticCurveTo(-10, -10, -20, -5);
  ctx.lineTo(-14, -1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a2a18";
  ctx.beginPath();
  ctx.moveTo(-24, -8);
  ctx.lineTo(-26, -10);
  ctx.lineTo(-23, -7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.rotate(wingFlap + 0.2);
  ctx.fillStyle = "#2a3828";
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.quadraticCurveTo(12, -14, 24, -8);
  ctx.lineTo(20, -4);
  ctx.quadraticCurveTo(14, -1, 8, 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(60,90,50,0.5)";
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.quadraticCurveTo(10, -10, 20, -5);
  ctx.lineTo(14, -1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a2a18";
  ctx.beginPath();
  ctx.moveTo(24, -8);
  ctx.lineTo(26, -10);
  ctx.lineTo(23, -7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();

  ctx.fillStyle = "#3a5038";
  ctx.beginPath();
  ctx.ellipse(x, drawY, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4a6848";
  ctx.beginPath();
  ctx.ellipse(x, drawY + 1, 3.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  const tailWave = Math.sin(t * 1.5) * 3;
  ctx.strokeStyle = "#3a5038";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - dir * 5, drawY + 2);
  ctx.quadraticCurveTo(
    x - dir * 12 + tailWave,
    drawY + 4,
    x - dir * 16 + tailWave * 1.5,
    drawY + 1
  );
  ctx.stroke();
  ctx.fillStyle = "#2a3828";
  ctx.beginPath();
  ctx.moveTo(x - dir * 16 + tailWave * 1.5, drawY + 1);
  ctx.lineTo(x - dir * 18 + tailWave * 1.5, drawY - 2);
  ctx.lineTo(x - dir * 15 + tailWave * 1.5, drawY + 3);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3a5038";
  ctx.beginPath();
  ctx.moveTo(x + dir * 4, drawY - 3);
  ctx.quadraticCurveTo(x + dir * 8, drawY - 8, x + dir * 10, drawY - 10);
  ctx.lineTo(x + dir * 7, drawY - 8);
  ctx.quadraticCurveTo(x + dir * 5, drawY - 4, x + dir * 3, drawY - 1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3a5038";
  ctx.beginPath();
  ctx.ellipse(x + dir * 11, drawY - 11, 4, 3, dir * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2a3020";
  ctx.beginPath();
  ctx.moveTo(x + dir * 9, drawY - 13);
  ctx.lineTo(x + dir * 8, drawY - 17);
  ctx.lineTo(x + dir * 10, drawY - 14);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + dir * 12, drawY - 13);
  ctx.lineTo(x + dir * 13, drawY - 17);
  ctx.lineTo(x + dir * 11, drawY - 14);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#4a6048";
  ctx.beginPath();
  ctx.ellipse(x + dir * 14, drawY - 10, 2.5, 2, dir * 0.2, 0, Math.PI * 2);
  ctx.fill();

  const fireGlow = 0.7 + Math.sin(t * 2.5) * 0.3;
  ctx.fillStyle = `rgba(255,140,20,${fireGlow})`;
  ctx.beginPath();
  ctx.arc(x + dir * 10, drawY - 12, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + dir * 12, drawY - 12, 1, 0, Math.PI * 2);
  ctx.fill();

  const breathPhase = (t * 1) % 5;
  if (breathPhase < 1.5) {
    const breathAlpha = Math.sin((breathPhase / 1.5) * Math.PI) * 0.4;
    ctx.fillStyle = `rgba(255,100,20,${breathAlpha})`;
    ctx.beginPath();
    ctx.moveTo(x + dir * 15, drawY - 10);
    ctx.quadraticCurveTo(
      x + dir * 20,
      drawY - 11,
      x + dir * 24,
      drawY - 8 + Math.sin(t * 4) * 2
    );
    ctx.quadraticCurveTo(x + dir * 20, drawY - 7, x + dir * 15, drawY - 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255,200,60,${breathAlpha * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(x + dir * 15, drawY - 10);
    ctx.quadraticCurveTo(x + dir * 18, drawY - 10.5, x + dir * 20, drawY - 9);
    ctx.quadraticCurveTo(x + dir * 18, drawY - 8.5, x + dir * 15, drawY - 9);
    ctx.closePath();
    ctx.fill();
  }
}

// =============================================================================
// FALLEN UNITS (for battlefield debris)
// =============================================================================

export function drawFallenKnight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = "rgba(100,110,130,0.5)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(80,90,110,0.5)";
  ctx.beginPath();
  ctx.arc(-5, -1, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(180,180,200,0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(4, 1);
  ctx.lineTo(12, -3);
  ctx.stroke();
  ctx.strokeStyle = "rgba(200,170,50,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(3, -1);
  ctx.lineTo(5, 3);
  ctx.stroke();
  ctx.restore();
}

export function drawFallenEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = "rgba(80,20,20,0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(60,15,15,0.4)";
  ctx.beginPath();
  ctx.arc(5, -1, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(40,10,10,0.35)";
  ctx.beginPath();
  ctx.moveTo(6, -3);
  ctx.lineTo(8, -6);
  ctx.lineTo(7, -2.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(90,90,90,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-3, 1);
  ctx.lineTo(-10, -2);
  ctx.stroke();
  ctx.restore();
}

export function drawFallenSkeleton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = "rgba(200,190,170,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(210,200,180,0.45)";
  ctx.beginPath();
  ctx.arc(-4, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(30,10,10,0.4)";
  ctx.beginPath();
  ctx.arc(-4.5, -0.5, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-3.5, -0.5, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(190,180,160,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, -1);
  ctx.lineTo(7, -2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3, 1);
  ctx.lineTo(8, 2);
  ctx.stroke();
  ctx.restore();
}
