import type { WorldMapDrawContext } from "./drawContext";
import {
  drawMiniKnight,
  drawMiniSoldier,
  drawMiniArcher,
  drawMiniCavalry,
  drawMiniDarkKnight,
  drawMiniSkeletonWarrior,
  drawMiniEnemyArcher,
  drawMiniOrcBrute,
  drawMiniNecromancer,
  drawMiniGoblin,
  drawMiniHarpy,
  drawMiniWyvern,
  drawFallenKnight,
  drawFallenEnemy,
  drawFallenSkeleton,
} from "./worldMapBattleUnits";

export const drawBridge = (
  dc: WorldMapDrawContext,
  bx: number,
  byPct: number,
  length: number,
  angle: number
) => {
  const { ctx, getLevelY } = dc;
  const by = getLevelY(byPct);
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(angle);

  // Bridge shadow (deeper, wider)
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(length / 2, 8, length / 2 + 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stone anchor blocks at each end
  const drawAnchor = (ax: number) => {
    const anchorGrad = ctx.createLinearGradient(ax - 8, -8, ax + 8, 8);
    anchorGrad.addColorStop(0, "#6a5a4a");
    anchorGrad.addColorStop(0.5, "#4a3a2a");
    anchorGrad.addColorStop(1, "#3a2a1a");
    ctx.fillStyle = anchorGrad;
    ctx.fillRect(ax - 7, -7, 14, 14);
    // Stone lines
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(ax - 7, -1);
    ctx.lineTo(ax + 7, -1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ax - 7, 4);
    ctx.lineTo(ax + 7, 4);
    ctx.stroke();
    // Top cap
    ctx.fillStyle = "#5a4a3a";
    ctx.fillRect(ax - 8, -9, 16, 3);
  };
  drawAnchor(0);
  drawAnchor(length);

  // Bridge planks with wood grain (use flat colors instead of per-plank gradients)
  const plankWidth = 7;
  for (let p = 0; p < length / plankWidth; p++) {
    const px = p * plankWidth + 2;
    const plankY = Math.sin(p * 0.3) * 1.5;
    // Plank shadow
    ctx.fillStyle = "#2a1a0a";
    ctx.fillRect(px, plankY - 3 + 1, plankWidth - 1.5, 7);
    // Main plank (flat color, alternating for variation)
    ctx.fillStyle = p % 2 === 0 ? "#6a5030" : "#5a4020";
    ctx.fillRect(px, plankY - 3, plankWidth - 1.5, 6);
    // Highlight edge
    ctx.fillStyle = "rgba(255,220,160,0.12)";
    ctx.fillRect(px, plankY - 3, plankWidth - 1.5, 1);
  }

  // Rope railings
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  // Top rope with sag
  ctx.strokeStyle = "#6a5a40";
  ctx.beginPath();
  ctx.moveTo(3, -7);
  for (let rx = 0; rx <= length; rx += 3) {
    const sag = Math.sin((rx / length) * Math.PI) * 3;
    ctx.lineTo(rx, -7 + sag);
  }
  ctx.stroke();
  // Bottom rope
  ctx.beginPath();
  ctx.moveTo(3, 7);
  for (let rx = 0; rx <= length; rx += 3) {
    const sag = Math.sin((rx / length) * Math.PI) * 3;
    ctx.lineTo(rx, 7 + sag);
  }
  ctx.stroke();

  // Rope highlight
  ctx.strokeStyle = "rgba(160,140,100,0.25)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(3, -8);
  for (let rx = 0; rx <= length; rx += 3) {
    const sag = Math.sin((rx / length) * Math.PI) * 3;
    ctx.lineTo(rx, -8 + sag);
  }
  ctx.stroke();

  // Railing posts (vertical ropes/supports)
  ctx.strokeStyle = "#5a4a30";
  ctx.lineWidth = 1.5;
  for (let post = 8; post < length; post += 12) {
    const topSag = Math.sin((post / length) * Math.PI) * 3;
    const botSag = Math.sin((post / length) * Math.PI) * 3;
    ctx.beginPath();
    ctx.moveTo(post, -7 + topSag);
    ctx.lineTo(post, 7 + botSag);
    ctx.stroke();
  }

  ctx.restore();
};

export const drawBoulder = (
  dc: WorldMapDrawContext,
  bx: number,
  byPct: number,
  size: number
) => {
  const { ctx, getY } = dc;
  const by = getY(byPct);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(
    bx + 2,
    by + size * 0.3,
    size * 1.2,
    size * 0.4,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Boulder body with 3D shading
  const boulderGrad = ctx.createRadialGradient(
    bx - size * 0.2,
    by - size * 0.3,
    0,
    bx,
    by,
    size
  );
  boulderGrad.addColorStop(0, "#6a5a4a");
  boulderGrad.addColorStop(0.6, "#4a3a2a");
  boulderGrad.addColorStop(1, "#2a1a0a");
  ctx.fillStyle = boulderGrad;
  ctx.beginPath();
  ctx.ellipse(bx, by, size, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Highlight
  ctx.fillStyle = "rgba(120, 100, 80, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    bx - size * 0.3,
    by - size * 0.2,
    size * 0.3,
    size * 0.2,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
};

export const drawWagonWheel = (
  dc: WorldMapDrawContext,
  wx: number,
  wyPct: number,
  size: number,
  rotation: number
) => {
  const { ctx, getY } = dc;
  const wy = getY(wyPct);
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(rotation);
  // Wheel rim
  ctx.strokeStyle = "#4a3020";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.stroke();
  // Spokes
  for (let s = 0; s < 8; s++) {
    const angle = (s / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size * 0.5);
    ctx.stroke();
  }
  // Hub
  ctx.fillStyle = "#3a2010";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawArrow = (
  dc: WorldMapDrawContext,
  ax: number,
  ayPct: number,
  angle: number
) => {
  const { ctx, getY } = dc;
  const ay = getY(ayPct);
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(angle);
  // Arrow shaft sticking up from ground
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -12);
  ctx.stroke();
  // Fletching
  ctx.fillStyle = "#3a2010";
  ctx.beginPath();
  ctx.moveTo(-2, -10);
  ctx.lineTo(0, -12);
  ctx.lineTo(2, -10);
  ctx.lineTo(0, -8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

export const drawFallenShield = (
  dc: WorldMapDrawContext,
  sx: number,
  syPct: number,
  isEnemy: boolean
) => {
  const { ctx, getY, seededRandom } = dc;
  const sy = getY(syPct);
  ctx.fillStyle = isEnemy ? "#5a1010" : "#8a6a20";
  ctx.beginPath();
  ctx.ellipse(sx, sy, 5, 3, seededRandom(sx) * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = isEnemy ? "#8a0000" : "#f59e0b";
  ctx.beginPath();
  ctx.arc(sx, sy - 0.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
};

export const drawBattleScene = (
  dc: WorldMapDrawContext,
  x: number,
  yPct: number,
  flip: boolean,
  intensity: number
) => {
  const { ctx, getY, time, seededRandom } = dc;
  const y = getY(yPct);
  const t = time * 1.5 + x * 0.01;

  // Battle dust cloud
  ctx.fillStyle = "rgba(100, 80, 60, 0.18)";
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 28 + intensity * 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Determine unit mix based on seeded position
  const seed = seededRandom(x * 100 + yPct);
  const hasCavalry = seed > 0.6 && intensity >= 2;

  for (let s = 0; s < intensity; s++) {
    const offset = s * 22 * (flip ? -1 : 1);
    const combatSway = Math.sin(t + s * 1.5) * 3;
    const bob1 = Math.sin(t + s * 0.7) * 1.5;
    const bob2 = Math.sin(t + s * 0.7 + 1) * 1.5;

    const friendlyX = x + offset + (flip ? 12 : -12) + combatSway;
    const enemyX = x + offset + (flip ? -12 : 12) + Math.sin(t + 1 + s) * 2;
    const unitSeed = seededRandom(x + s * 37);

    // Friendly unit selection: knight, soldier, archer, or cavalry
    if (hasCavalry && s === 0) {
      drawMiniCavalry(ctx, friendlyX, y, t + s, flip, combatSway, bob1);
    } else if (unitSeed > 0.65) {
      drawMiniKnight(ctx, friendlyX, y, t + s, flip, combatSway, bob1);
    } else if (unitSeed > 0.3) {
      drawMiniSoldier(ctx, friendlyX, y, t + s, flip, combatSway, bob1);
    } else {
      drawMiniArcher(ctx, friendlyX, y, t + s, flip, combatSway, bob1);
    }

    // Enemy unit selection: dark knight, skeleton, archer, orc, necromancer, or goblin
    const enemySeed = seededRandom(x + s * 53 + 7);
    if (enemySeed > 0.82) {
      drawMiniDarkKnight(ctx, enemyX, y, t + s + 1, !flip, combatSway, bob2);
    } else if (enemySeed > 0.65) {
      drawMiniOrcBrute(ctx, enemyX, y, t + s + 1, !flip, combatSway, bob2);
    } else if (enemySeed > 0.48) {
      drawMiniSkeletonWarrior(
        ctx,
        enemyX,
        y,
        t + s + 1,
        !flip,
        combatSway,
        bob2
      );
    } else if (enemySeed > 0.32) {
      drawMiniNecromancer(ctx, enemyX, y, t + s + 1, !flip, combatSway, bob2);
    } else if (enemySeed > 0.16) {
      drawMiniGoblin(ctx, enemyX, y, t + s + 1, !flip, combatSway, bob2);
    } else {
      drawMiniEnemyArcher(ctx, enemyX, y, t + s + 1, !flip, combatSway, bob2);
    }
  }

  // Sparks from clashing weapons
  const sparkIntensity = Math.sin(t * 2);
  if (sparkIntensity > 0.2) {
    ctx.fillStyle = "#ffd700";
    for (let i = 0; i < 5; i++) {
      const sparkX = x + (seededRandom(x + i + Math.floor(t)) - 0.5) * 24;
      const sparkY =
        y - 6 + (seededRandom(x + i + 10 + Math.floor(t)) - 0.5) * 18;
      const sparkSize = 1 + seededRandom(i + x) * 1.5;
      ctx.globalAlpha = sparkIntensity * 0.8;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Blood splatters (subtle)
  ctx.fillStyle = "rgba(139, 0, 0, 0.15)";
  for (let i = 0; i < 3; i++) {
    const bx = x + (seededRandom(x + i * 7) - 0.5) * 30;
    const by = y + 4 + seededRandom(x + i * 7 + 1) * 4;
    ctx.beginPath();
    ctx.ellipse(
      bx,
      by,
      2 + seededRandom(i) * 3,
      1,
      seededRandom(i) * Math.PI,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
};

export const drawFlyingBattleScene = (
  dc: WorldMapDrawContext,
  x: number,
  yPct: number,
  flip: boolean,
  count: number
) => {
  const { ctx, getY, time, seededRandom } = dc;
  const y = getY(yPct);
  const t = time * 1.2 + x * 0.01;

  for (let i = 0; i < count; i++) {
    const orbitRadius = 20 + i * 15;
    const orbitSpeed = 0.6 + seededRandom(x + i * 11) * 0.3;
    const orbitOffset = seededRandom(x + i * 23) * Math.PI * 2;
    const orbitAngle = t * orbitSpeed + orbitOffset;

    const fx = x + Math.cos(orbitAngle) * orbitRadius;
    const fyOffset = Math.sin(orbitAngle) * orbitRadius * 0.3;

    const unitSeed = seededRandom(x + i * 41);
    const facing = Math.cos(orbitAngle) > 0;

    if (unitSeed > 0.45) {
      drawMiniHarpy(ctx, fx, y - 15 + fyOffset, t + i * 2, facing);
    } else {
      drawMiniWyvern(ctx, fx, y - 20 + fyOffset, t + i * 2, facing);
    }
  }
};

export const drawFallenSoldier = (
  dc: WorldMapDrawContext,
  fx: number,
  fyPct: number,
  isEnemy: boolean
) => {
  const { ctx, getY, seededRandom } = dc;
  const fy = getY(fyPct);
  const rotation = (seededRandom(fx) - 0.5) * 1.2;
  const variant = seededRandom(fx * 3 + fyPct);

  if (isEnemy) {
    if (variant > 0.5) {
      drawFallenEnemy(ctx, fx, fy, rotation);
    } else {
      drawFallenSkeleton(ctx, fx, fy, rotation);
    }
  } else {
    drawFallenKnight(ctx, fx, fy, rotation);
  }
};

export const drawKingdomCastle = (
  dc: WorldMapDrawContext,
  x: number,
  yPct: number
) => {
  const { ctx, getLevelY, time } = dc;
  const y = getLevelY(yPct);
  const sL = "#7a6a54";
  const sM = "#5a4a38";
  const sD = "#3e2e1e";
  const sX = "#2a1a0c";
  const goldB = "#ffd060";
  const goldG = "#ffcc00";
  const roof1 = "#2a4568";
  const roof2 = "#1a2a40";
  ctx.save();

  // Warm golden aura
  const aura = ctx.createRadialGradient(x, y - 55, 10, x, y - 55, 110);
  aura.addColorStop(0, "rgba(255,204,0,0.14)");
  aura.addColorStop(0.5, "rgba(255,180,40,0.04)");
  aura.addColorStop(1, "rgba(255,160,20,0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(x, y - 55, 110, 0, Math.PI * 2);
  ctx.fill();

  // Ground shadow
  const gs = ctx.createRadialGradient(x + 5, y + 18, 0, x + 5, y + 18, 72);
  gs.addColorStop(0, "rgba(0,0,0,0.45)");
  gs.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gs;
  ctx.beginPath();
  ctx.ellipse(x + 5, y + 18, 72, 22, 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Moat (blue water)
  ctx.fillStyle = "rgba(35,65,110,0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + 14, 62, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(120,170,220,0.12)";
  ctx.lineWidth = 0.7;
  for (let m = 0; m < 5; m++) {
    const mx = x - 38 + m * 19 + Math.sin(time * 1.3 + m * 1.7) * 4;
    ctx.beginPath();
    ctx.ellipse(mx, y + 14, 7, 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Drawbridge planks
  ctx.fillStyle = "#5a4020";
  ctx.fillRect(x - 10, y + 6, 20, 12);
  ctx.strokeStyle = "#3a2a10";
  ctx.lineWidth = 0.6;
  for (let p = 0; p < 4; p++) {
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 9 + p * 3);
    ctx.lineTo(x + 10, y + 9 + p * 3);
    ctx.stroke();
  }
  ctx.strokeStyle = "#6a5530";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 8);
  ctx.lineTo(x - 10, y + 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 12, y - 8);
  ctx.lineTo(x + 10, y + 6);
  ctx.stroke();

  // Outer curtain wall with buttresses
  const wG = ctx.createLinearGradient(x - 56, 0, x + 56, 0);
  wG.addColorStop(0, sX);
  wG.addColorStop(0.12, sD);
  wG.addColorStop(0.3, sM);
  wG.addColorStop(0.5, sL);
  wG.addColorStop(0.7, sM);
  wG.addColorStop(0.88, sD);
  wG.addColorStop(1, sX);
  ctx.fillStyle = wG;
  ctx.fillRect(x - 54, y - 30, 108, 42);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(x - 54, y - 30, 108, 2);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x - 54, y + 10, 108, 2);

  // Buttresses
  for (const bx of [-54, -28, 26, 52]) {
    const bg = ctx.createLinearGradient(x + bx - 3, 0, x + bx + 3, 0);
    bg.addColorStop(0, sD);
    bg.addColorStop(0.5, sM);
    bg.addColorStop(1, sD);
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(x + bx - 3, y + 12);
    ctx.lineTo(x + bx - 1, y - 28);
    ctx.lineTo(x + bx + 1, y - 28);
    ctx.lineTo(x + bx + 3, y + 12);
    ctx.closePath();
    ctx.fill();
  }

  // Stone brick pattern
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.4;
  for (let row = 0; row < 6; row++) {
    const wy = y - 28 + row * 6.5;
    ctx.beginPath();
    ctx.moveTo(x - 54, wy);
    ctx.lineTo(x + 54, wy);
    ctx.stroke();
    for (let col = 0; col < 14; col++) {
      const boff = row % 2 === 0 ? 0 : 4;
      ctx.beginPath();
      ctx.moveTo(x - 54 + col * 8 + boff, wy);
      ctx.lineTo(x - 54 + col * 8 + boff, wy + 6.5);
      ctx.stroke();
    }
  }

  // Wall crenellations (merlons + embrasures)
  for (let i = 0; i < 14; i++) {
    const cx = x - 53 + i * 8;
    if (i % 2 === 0) {
      ctx.fillStyle = sM;
      ctx.fillRect(cx, y - 38, 7, 9);
      ctx.fillStyle = sL;
      ctx.fillRect(cx, y - 38, 6.5, 8.5);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(cx, y - 38, 6.5, 1.5);
    }
  }

  // Corner turrets (smaller, flanking wall)
  const drawCornerTurret = (tx: number, isLeft: boolean) => {
    const tg = ctx.createLinearGradient(tx - 8, 0, tx + 8, 0);
    tg.addColorStop(0, isLeft ? sX : sL);
    tg.addColorStop(0.5, sM);
    tg.addColorStop(1, isLeft ? sL : sX);
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(tx - 8, y + 10);
    ctx.lineTo(tx - 7, y - 48);
    ctx.lineTo(tx + 7, y - 48);
    ctx.lineTo(tx + 8, y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 0.4;
    for (let r = 0; r < 8; r++) {
      const ry = y - 46 + r * 6.5;
      ctx.beginPath();
      ctx.moveTo(tx - 7, ry);
      ctx.quadraticCurveTo(tx, ry - 0.8, tx + 7, ry);
      ctx.stroke();
    }
    for (let c = 0; c < 3; c++) {
      const bx2 = tx - 7 + c * 5.5;
      ctx.fillStyle = sM;
      ctx.fillRect(bx2, y - 55, 4.5, 8);
      ctx.fillStyle = sL;
      ctx.fillRect(bx2, y - 55, 4, 7.5);
    }
    const rg = ctx.createLinearGradient(tx - 10, y - 68, tx + 10, y - 50);
    rg.addColorStop(0, roof2);
    rg.addColorStop(0.5, roof1);
    rg.addColorStop(1, roof2);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(tx, y - 68);
    ctx.lineTo(tx + 10, y - 50);
    ctx.lineTo(tx - 10, y - 50);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = goldB;
    ctx.beginPath();
    ctx.arc(tx, y - 69, 2, 0, Math.PI * 2);
    ctx.fill();
  };
  drawCornerTurret(x - 52, true);
  drawCornerTurret(x + 52, false);

  // Main flanking towers
  const drawMainTower = (tx: number, isLeft: boolean) => {
    const tg = ctx.createLinearGradient(tx - 15, 0, tx + 15, 0);
    if (isLeft) {
      tg.addColorStop(0, sX);
      tg.addColorStop(0.3, sD);
      tg.addColorStop(0.7, sM);
      tg.addColorStop(1, sL);
    } else {
      tg.addColorStop(0, sL);
      tg.addColorStop(0.3, sM);
      tg.addColorStop(0.7, sD);
      tg.addColorStop(1, sX);
    }
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(tx - 14, y + 10);
    ctx.lineTo(tx - 13, y - 78);
    ctx.lineTo(tx + 13, y - 78);
    ctx.lineTo(tx + 14, y + 10);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 0.4;
    for (let r = 0; r < 14; r++) {
      const ry = y - 76 + r * 6;
      ctx.beginPath();
      ctx.moveTo(tx - 13, ry);
      ctx.quadraticCurveTo(tx, ry - 1, tx + 13, ry);
      ctx.stroke();
    }

    // Machicolations (overhanging defensive gallery)
    ctx.fillStyle = sD;
    ctx.fillRect(tx - 15, y - 82, 30, 5);
    for (let mc = 0; mc < 5; mc++) {
      ctx.fillStyle = sX;
      ctx.fillRect(tx - 14 + mc * 6, y - 82, 2, 5);
    }
    ctx.fillStyle = sM;
    ctx.fillRect(tx - 15, y - 84, 30, 3);

    for (let c = 0; c < 5; c++) {
      const bx2 = tx - 13 + c * 6;
      ctx.fillStyle = sM;
      ctx.fillRect(bx2, y - 92, 5, 9);
      ctx.fillStyle = sL;
      ctx.fillRect(bx2, y - 92, 4.5, 8.5);
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(bx2, y - 92, 4.5, 1.5);
    }

    const rg = ctx.createLinearGradient(tx - 18, y - 110, tx + 18, y - 88);
    rg.addColorStop(0, roof2);
    rg.addColorStop(0.4, roof1);
    rg.addColorStop(1, roof2);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(tx, y - 110);
    ctx.lineTo(tx + 18, y - 88);
    ctx.lineTo(tx - 18, y - 88);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(180,210,240,0.06)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(tx, y - 110);
    ctx.lineTo(tx - 16, y - 89);
    ctx.stroke();

    ctx.fillStyle = goldB;
    ctx.beginPath();
    ctx.arc(tx, y - 111, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.arc(tx - 0.8, y - 112, 1, 0, Math.PI * 2);
    ctx.fill();

    // Tower windows
    for (const wy of [y - 64, y - 44]) {
      const wGlow = 0.45 + Math.sin(time * 2 + tx + wy * 0.1) * 0.2;
      const hg = ctx.createRadialGradient(tx, wy, 0, tx, wy, 9);
      hg.addColorStop(0, `rgba(255,200,80,${wGlow * 0.3})`);
      hg.addColorStop(1, "rgba(255,150,40,0)");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(tx, wy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = sX;
      ctx.beginPath();
      ctx.moveTo(tx - 4, wy + 5);
      ctx.lineTo(tx - 4, wy - 2);
      ctx.arc(tx, wy - 2, 4, Math.PI, 0);
      ctx.lineTo(tx + 4, wy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = goldG;
      ctx.globalAlpha = wGlow;
      ctx.beginPath();
      ctx.moveTo(tx - 3, wy + 4);
      ctx.lineTo(tx - 3, wy - 1);
      ctx.arc(tx, wy - 1, 3, Math.PI, 0);
      ctx.lineTo(tx + 3, wy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = sX;
      ctx.fillRect(tx - 0.4, wy - 3, 0.8, 8);
      ctx.fillRect(tx - 3, wy + 0.5, 6, 0.7);
    }

    // Guard
    const sway = Math.sin(time * 0.4 + tx * 0.12) * 1;
    ctx.fillStyle = "#7a6530";
    ctx.fillRect(tx - 2.5 + sway, y - 90, 5, 7);
    ctx.fillStyle = "#d4a040";
    ctx.beginPath();
    ctx.arc(tx + sway, y - 94, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8a7030";
    ctx.beginPath();
    ctx.arc(tx + sway, y - 96, 2.8, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = "#9a9a9a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx + 4 + sway, y - 94);
    ctx.lineTo(tx + 4 + sway, y - 112);
    ctx.stroke();
    ctx.fillStyle = "#b8b8b8";
    ctx.beginPath();
    ctx.moveTo(tx + 2.5 + sway, y - 112);
    ctx.lineTo(tx + 4 + sway, y - 117);
    ctx.lineTo(tx + 5.5 + sway, y - 112);
    ctx.closePath();
    ctx.fill();
  };
  drawMainTower(x - 40, true);
  drawMainTower(x + 40, false);

  // Central keep
  const kW = 24;
  const kG = ctx.createLinearGradient(x - kW, 0, x + kW, 0);
  kG.addColorStop(0, sD);
  kG.addColorStop(0.15, sM);
  kG.addColorStop(0.35, sL);
  kG.addColorStop(0.65, sL);
  kG.addColorStop(0.85, sM);
  kG.addColorStop(1, sD);
  ctx.fillStyle = kG;
  ctx.fillRect(x - kW, y - 100, kW * 2, 110);

  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 0.4;
  for (let row = 0; row < 17; row++) {
    const ky = y - 98 + row * 6;
    ctx.beginPath();
    ctx.moveTo(x - kW, ky);
    ctx.lineTo(x + kW, ky);
    ctx.stroke();
    for (let col = 0; col < 7; col++) {
      const koff = row % 2 === 0 ? 0 : 3.5;
      ctx.beginPath();
      ctx.moveTo(x - kW + col * 7 + koff, ky);
      ctx.lineTo(x - kW + col * 7 + koff, ky + 6);
      ctx.stroke();
    }
  }

  // Keep machicolations
  ctx.fillStyle = sD;
  ctx.fillRect(x - kW - 2, y - 104, kW * 2 + 4, 5);
  for (let mc = 0; mc < 7; mc++) {
    ctx.fillStyle = sX;
    ctx.fillRect(x - kW - 1 + mc * 7, y - 104, 2, 5);
  }
  ctx.fillStyle = sM;
  ctx.fillRect(x - kW - 2, y - 106, kW * 2 + 4, 3);

  for (let i = 0; i < 9; i++) {
    const bx = x - kW + i * 5.8;
    if (i % 2 === 0) {
      ctx.fillStyle = sM;
      ctx.fillRect(bx, y - 113, 5, 8);
      ctx.fillStyle = sL;
      ctx.fillRect(bx, y - 113, 4.5, 7.5);
    }
  }

  // Keep roof — steep hip roof with dormer
  const krG = ctx.createLinearGradient(
    x - kW - 6,
    y - 138,
    x + kW + 6,
    y - 108
  );
  krG.addColorStop(0, roof2);
  krG.addColorStop(0.3, roof1);
  krG.addColorStop(0.6, roof2);
  krG.addColorStop(1, "#0f1a28");
  ctx.fillStyle = krG;
  ctx.beginPath();
  ctx.moveTo(x, y - 138);
  ctx.lineTo(x + kW + 6, y - 108);
  ctx.lineTo(x - kW - 6, y - 108);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(180,210,240,0.06)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, y - 138);
  ctx.lineTo(x - kW - 4, y - 109);
  ctx.stroke();

  // Dormer window
  ctx.fillStyle = roof1;
  ctx.beginPath();
  ctx.moveTo(x, y - 128);
  ctx.lineTo(x + 6, y - 118);
  ctx.lineTo(x - 6, y - 118);
  ctx.closePath();
  ctx.fill();
  const dwGlow = 0.5 + Math.sin(time * 1.8) * 0.2;
  ctx.fillStyle = `rgba(255,200,80,${dwGlow})`;
  ctx.fillRect(x - 3, y - 122, 6, 5);
  ctx.fillStyle = sX;
  ctx.fillRect(x - 0.3, y - 122, 0.6, 5);
  ctx.fillRect(x - 3, y - 119.5, 6, 0.6);

  // Keep finial
  ctx.fillStyle = goldB;
  ctx.beginPath();
  ctx.arc(x, y - 139, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(x - 1, y - 140, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Royal banner
  const pG = ctx.createLinearGradient(x - 1.5, 0, x + 1.5, 0);
  pG.addColorStop(0, "#3a2510");
  pG.addColorStop(0.5, "#6a5030");
  pG.addColorStop(1, "#3a2510");
  ctx.fillStyle = pG;
  ctx.fillRect(x - 1.2, y - 164, 2.4, 28);
  ctx.fillStyle = goldB;
  ctx.beginPath();
  ctx.arc(x, y - 165, 2.5, 0, Math.PI * 2);
  ctx.fill();

  const w1 = Math.sin(time * 3.2 + x * 0.05) * 4;
  const w2 = Math.sin(time * 3.6 + x * 0.05) * 3;
  const w3 = Math.sin(time * 4 + x * 0.05) * 2.5;
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.moveTo(x + 1.2, y - 162 + 1);
  ctx.bezierCurveTo(
    x + 12,
    y - 157 + w1 + 1,
    x + 22,
    y - 152 + w2 + 1,
    x + 32,
    y - 147 + w3 + 1
  );
  ctx.bezierCurveTo(
    x + 22,
    y - 142 + w2 + 1,
    x + 12,
    y - 137 + w1 + 1,
    x + 1.2,
    y - 132 + 1
  );
  ctx.closePath();
  ctx.fill();

  const bG = ctx.createLinearGradient(x, y - 162, x + 32, y - 147);
  bG.addColorStop(0, "#e88c14");
  bG.addColorStop(0.5, goldB);
  bG.addColorStop(1, "#e88c14");
  ctx.fillStyle = bG;
  ctx.beginPath();
  ctx.moveTo(x + 1.2, y - 162);
  ctx.bezierCurveTo(
    x + 12,
    y - 157 + w1,
    x + 22,
    y - 152 + w2,
    x + 32,
    y - 147 + w3
  );
  ctx.bezierCurveTo(
    x + 22,
    y - 142 + w2,
    x + 12,
    y - 137 + w1,
    x + 1.2,
    y - 132
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#8a6010";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 3, y - 147 + w1 * 0.5);
  ctx.bezierCurveTo(
    x + 12,
    y - 147 + w1,
    x + 22,
    y - 147 + w2,
    x + 30,
    y - 147 + w3
  );
  ctx.stroke();

  // Princeton shield emblem
  const eX = x + 15,
    eY = y - 147 + w1 * 0.5;
  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.arc(eX, eY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = goldB;
  for (let p = 0; p < 5; p++) {
    const a = (p * Math.PI * 2) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(eX + Math.cos(a) * 3, eY + Math.sin(a) * 3, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grand arched gate
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 10);
  ctx.lineTo(x - 16, y - 14);
  ctx.arc(x, y - 14, 16, Math.PI, 0);
  ctx.lineTo(x + 16, y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = sD;
  ctx.beginPath();
  ctx.moveTo(x - 15, y + 10);
  ctx.lineTo(x - 15, y - 13);
  ctx.arc(x, y - 13, 15, Math.PI, 0);
  ctx.lineTo(x + 15, y + 10);
  ctx.closePath();
  ctx.fill();
  // Voussoir arch stones
  for (let v = 0; v < 7; v++) {
    const va = Math.PI + (v / 7) * Math.PI;
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(va) * 12, y - 13 + Math.sin(va) * 12);
    ctx.lineTo(x + Math.cos(va) * 16, y - 13 + Math.sin(va) * 16);
    ctx.stroke();
  }
  ctx.fillStyle = sM;
  ctx.beginPath();
  ctx.moveTo(x - 3.5, y - 28);
  ctx.lineTo(x, y - 31);
  ctx.lineTo(x + 3.5, y - 28);
  ctx.lineTo(x + 2.5, y - 24);
  ctx.lineTo(x - 2.5, y - 24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#080404";
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 10);
  ctx.lineTo(x - 12, y - 11);
  ctx.arc(x, y - 11, 12, Math.PI, 0);
  ctx.lineTo(x + 12, y + 10);
  ctx.closePath();
  ctx.fill();

  // Portcullis
  ctx.strokeStyle = "#4a4a4a";
  ctx.lineWidth = 1.2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 5, y - 20);
    ctx.lineTo(x + i * 5, y + 8);
    ctx.stroke();
  }
  for (let h = 0; h < 3; h++) {
    ctx.beginPath();
    ctx.moveTo(x - 11, y - 14 + h * 9);
    ctx.lineTo(x + 11, y - 14 + h * 9);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(200,200,200,0.07)";
  ctx.lineWidth = 0.4;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 5 - 0.5, y - 20);
    ctx.lineTo(x + i * 5 - 0.5, y + 8);
    ctx.stroke();
  }

  // Keep windows
  for (const [wx, wy, ww, wh] of [
    [x - 12, y - 78, 6, 10],
    [x + 12, y - 78, 6, 10],
    [x, y - 56, 5, 8],
  ] as [number, number, number, number][]) {
    const wGlow = 0.5 + Math.sin(time * 2 + wx * 0.1 + wy * 0.05) * 0.2;
    const hg = ctx.createRadialGradient(wx, wy, 0, wx, wy, ww * 2.5);
    hg.addColorStop(0, `rgba(255,200,80,${wGlow * 0.3})`);
    hg.addColorStop(1, "rgba(200,150,50,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(wx, wy, ww * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sX;
    ctx.beginPath();
    ctx.moveTo(wx - ww, wy + wh);
    ctx.lineTo(wx - ww, wy - wh * 0.3);
    ctx.arc(wx, wy - wh * 0.3, ww, Math.PI, 0);
    ctx.lineTo(wx + ww, wy + wh);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = goldG;
    ctx.globalAlpha = wGlow;
    ctx.beginPath();
    ctx.moveTo(wx - ww + 1, wy + wh - 1);
    ctx.lineTo(wx - ww + 1, wy - wh * 0.2);
    ctx.arc(wx, wy - wh * 0.2, ww - 1, Math.PI, 0);
    ctx.lineTo(wx + ww - 1, wy + wh - 1);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = sX;
    ctx.fillRect(wx - 0.4, wy - wh * 0.5, 0.8, wh * 1.5);
    ctx.fillRect(wx - ww + 1, wy + 1, ww * 2 - 2, 0.7);
  }

  // Torches
  const drawTorch = (tx2: number, ty2: number, ts: number) => {
    ctx.fillStyle = "#3a2a18";
    ctx.fillRect(tx2 - 1, ty2, 2, 6 * ts);
    const fh = (5 + Math.sin(time * 9 + tx2 * 0.3) * 2.5) * ts;
    const fl = 0.8 + Math.sin(time * 7 + tx2) * 0.2;
    const tGl = ctx.createRadialGradient(
      tx2,
      ty2 - fh * 0.5,
      0,
      tx2,
      ty2 - fh * 0.5,
      10 * ts
    );
    tGl.addColorStop(0, `rgba(255,180,50,${0.3 * fl})`);
    tGl.addColorStop(1, "rgba(255,120,20,0)");
    ctx.fillStyle = tGl;
    ctx.beginPath();
    ctx.arc(tx2, ty2 - fh * 0.5, 10 * ts, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,120,20,${fl * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(tx2 - 2.5 * ts, ty2);
    ctx.quadraticCurveTo(tx2, ty2 - fh, tx2 + 2.5 * ts, ty2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,220,80,${fl * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(tx2 - 1.5 * ts, ty2);
    ctx.quadraticCurveTo(tx2, ty2 - fh * 0.8, tx2 + 1.5 * ts, ty2);
    ctx.fill();
  };
  drawTorch(x - 20, y - 6, 1);
  drawTorch(x + 20, y - 6, 1);
  drawTorch(x - 50, y - 32, 0.8);
  drawTorch(x + 50, y - 32, 0.8);

  // Chimney smoke
  for (let ch = 0; ch < 2; ch++) {
    const chx = x + (ch === 0 ? -12 : 12);
    for (let s = 0; s < 5; s++) {
      const sAge = (time * 10 + s * 8 + ch * 20) % 35;
      const sy = y - 138 - sAge * 1.1;
      const sx = chx + Math.sin(time * 1.1 + s * 1.4 + ch) * (3 + sAge * 0.12);
      const sAlpha = Math.max(0, 0.18 - sAge / 45);
      if (sAlpha > 0) {
        ctx.fillStyle = `rgba(100,90,80,${sAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5 + sAge * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Garden hedge patches at base
  for (const gx of [-30, -18, 18, 30]) {
    ctx.fillStyle = "rgba(60,100,40,0.5)";
    ctx.beginPath();
    ctx.ellipse(x + gx, y + 8, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(80,130,55,0.4)";
    ctx.beginPath();
    ctx.ellipse(x + gx, y + 7, 3.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export const drawEnemyLair = (
  dc: WorldMapDrawContext,
  x: number,
  yPct: number
) => {
  const { ctx, getLevelY, time } = dc;
  const y = getLevelY(yPct);
  const ob1 = "#1a1020";
  const ob2 = "#0e0815";
  const ob3 = "#221430";
  const obsH = "#2d1a3a";
  ctx.save();

  // Ominous dark-red aura
  const aura = ctx.createRadialGradient(x, y - 60, 8, x, y - 60, 120);
  aura.addColorStop(0, "rgba(200,0,20,0.18)");
  aura.addColorStop(0.3, "rgba(140,20,60,0.08)");
  aura.addColorStop(0.6, "rgba(80,0,120,0.04)");
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(x, y - 60, 120, 0, Math.PI * 2);
  ctx.fill();

  // Ground shadow
  const gs = ctx.createRadialGradient(x + 4, y + 18, 0, x + 4, y + 18, 80);
  gs.addColorStop(0, "rgba(0,0,0,0.55)");
  gs.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gs;
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 18, 80, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lava moat
  const lavaPulse = 0.7 + Math.sin(time * 2.5) * 0.3;
  const lmG = ctx.createRadialGradient(x, y + 14, 10, x, y + 14, 65);
  lmG.addColorStop(0, `rgba(255,80,0,${0.5 * lavaPulse})`);
  lmG.addColorStop(0.5, `rgba(200,30,0,${0.35 * lavaPulse})`);
  lmG.addColorStop(1, "rgba(80,10,0,0.2)");
  ctx.fillStyle = lmG;
  ctx.beginPath();
  ctx.ellipse(x, y + 14, 65, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  // Lava bubbles
  for (let b = 0; b < 6; b++) {
    const bAge = (time * 3 + b * 5.7) % 4;
    const bx = x - 40 + b * 15 + Math.sin(b * 2.3) * 8;
    const by = y + 12 + Math.sin(b * 3.1) * 4;
    const br = (1 + bAge * 0.5) * (bAge < 3 ? 1 : 0);
    if (br > 0) {
      ctx.fillStyle = `rgba(255,140,20,${0.4 - bAge * 0.1})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Lava surface glow ripples
  ctx.strokeStyle = `rgba(255,100,20,${0.1 * lavaPulse})`;
  ctx.lineWidth = 0.6;
  for (let r = 0; r < 4; r++) {
    const rx = x - 35 + r * 22 + Math.sin(time * 1.2 + r * 2) * 6;
    ctx.beginPath();
    ctx.ellipse(rx, y + 14, 9, 2.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Bone bridge
  ctx.fillStyle = "#3a3030";
  ctx.fillRect(x - 8, y + 6, 16, 10);
  ctx.strokeStyle = "#5a4a40";
  ctx.lineWidth = 0.8;
  for (let b = 0; b < 3; b++) {
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 9 + b * 3);
    ctx.lineTo(x + 8, y + 9 + b * 3);
    ctx.stroke();
  }
  // Skull on bridge railing
  ctx.fillStyle = "#d0c8b8";
  ctx.beginPath();
  ctx.arc(x - 10, y + 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0808";
  ctx.beginPath();
  ctx.arc(x - 11, y + 3.5, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 9, y + 3.5, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d0c8b8";
  ctx.beginPath();
  ctx.arc(x + 10, y + 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a0808";
  ctx.beginPath();
  ctx.arc(x + 9, y + 3.5, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 11, y + 3.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Obsidian base platform — jagged
  const baseG = ctx.createLinearGradient(x - 60, y - 20, x + 60, y + 10);
  baseG.addColorStop(0, ob2);
  baseG.addColorStop(0.3, ob1);
  baseG.addColorStop(0.5, ob3);
  baseG.addColorStop(0.7, ob1);
  baseG.addColorStop(1, ob2);
  ctx.fillStyle = baseG;
  ctx.beginPath();
  ctx.moveTo(x - 58, y + 10);
  ctx.lineTo(x - 60, y - 15);
  ctx.lineTo(x - 52, y - 20);
  ctx.lineTo(x - 40, y - 18);
  ctx.lineTo(x - 30, y - 24);
  ctx.lineTo(x - 15, y - 22);
  ctx.lineTo(x, y - 28);
  ctx.lineTo(x + 15, y - 22);
  ctx.lineTo(x + 30, y - 24);
  ctx.lineTo(x + 40, y - 18);
  ctx.lineTo(x + 52, y - 20);
  ctx.lineTo(x + 60, y - 15);
  ctx.lineTo(x + 58, y + 10);
  ctx.closePath();
  ctx.fill();

  // Obsidian surface cracks with magma glow
  ctx.strokeStyle = `rgba(255,60,0,${0.3 + Math.sin(time * 1.5) * 0.1})`;
  ctx.lineWidth = 0.8;
  const cracks = [
    [-45, -12, -30, -18, -18, -14],
    [-10, -22, 0, -16, 12, -20],
    [20, -18, 35, -22, 48, -16],
    [-25, -8, -8, -12, 5, -6],
    [15, -8, 30, -12, 42, -6],
  ];
  for (const c of cracks) {
    ctx.beginPath();
    ctx.moveTo(x + c[0], y + c[1]);
    ctx.quadraticCurveTo(x + c[2], y + c[3], x + c[4], y + c[5]);
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(255,160,40,${0.15 + Math.sin(time * 2) * 0.05})`;
  ctx.lineWidth = 2;
  for (const c of cracks) {
    ctx.beginPath();
    ctx.moveTo(x + c[0], y + c[1]);
    ctx.quadraticCurveTo(x + c[2], y + c[3], x + c[4], y + c[5]);
    ctx.stroke();
  }

  // Jagged obsidian spires (flanking)
  const drawSpire = (sx: number, h: number, w: number, lean: number) => {
    const sg = ctx.createLinearGradient(sx - w, y - h, sx + w, y);
    sg.addColorStop(0, obsH);
    sg.addColorStop(0.3, ob3);
    sg.addColorStop(0.6, ob1);
    sg.addColorStop(1, ob2);
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(sx - w, y - 5);
    ctx.lineTo(sx - w * 0.7, y - h * 0.4);
    ctx.lineTo(sx - w * 0.3 + lean, y - h * 0.8);
    ctx.lineTo(sx + lean * 1.5, y - h);
    ctx.lineTo(sx + w * 0.3 + lean, y - h * 0.8);
    ctx.lineTo(sx + w * 0.7, y - h * 0.4);
    ctx.lineTo(sx + w, y - 5);
    ctx.closePath();
    ctx.fill();

    // Glowing edge highlight
    ctx.strokeStyle = `rgba(${lean > 0 ? "140,40,255" : "255,60,20"},0.15)`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.3 + lean, y - h * 0.8);
    ctx.lineTo(sx + lean * 1.5, y - h);
    ctx.stroke();

    // Rune mark
    const runeY = y - h * 0.5;
    const runeGlow = 0.3 + Math.sin(time * 2.5 + sx * 0.1) * 0.2;
    ctx.strokeStyle = `rgba(200,50,255,${runeGlow})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, runeY - 6);
    ctx.lineTo(sx - 3, runeY);
    ctx.lineTo(sx + 3, runeY);
    ctx.lineTo(sx, runeY + 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx - 3, runeY - 3);
    ctx.lineTo(sx + 3, runeY + 3);
    ctx.stroke();
  };
  drawSpire(x - 48, 90, 14, -2);
  drawSpire(x + 48, 90, 14, 2);
  drawSpire(x - 32, 75, 10, -1);
  drawSpire(x + 32, 75, 10, 1);

  // Central dark tower — the lair's keep
  const tW = 20;
  const tH = 130;
  const tG = ctx.createLinearGradient(x - tW, y - tH, x + tW, y);
  tG.addColorStop(0, "#1a0828");
  tG.addColorStop(0.2, ob3);
  tG.addColorStop(0.4, ob1);
  tG.addColorStop(0.6, ob1);
  tG.addColorStop(0.8, ob3);
  tG.addColorStop(1, "#0a0410");
  ctx.fillStyle = tG;
  ctx.beginPath();
  ctx.moveTo(x - tW, y - 5);
  ctx.lineTo(x - tW + 2, y - tH * 0.6);
  ctx.lineTo(x - tW * 0.6, y - tH * 0.85);
  ctx.lineTo(x, y - tH);
  ctx.lineTo(x + tW * 0.6, y - tH * 0.85);
  ctx.lineTo(x + tW - 2, y - tH * 0.6);
  ctx.lineTo(x + tW, y - 5);
  ctx.closePath();
  ctx.fill();

  // Tower surface cracks
  ctx.strokeStyle = "rgba(60,20,80,0.2)";
  ctx.lineWidth = 0.5;
  for (let r = 0; r < 10; r++) {
    const ry = y - 10 - r * 12;
    const rw = tW - r * 0.8;
    ctx.beginPath();
    ctx.moveTo(x - rw, ry);
    ctx.quadraticCurveTo(x, ry - 1.5, x + rw, ry);
    ctx.stroke();
  }

  // Glowing eye/portal at top of tower
  const eyeY = y - tH * 0.72;
  const eyePulse = 0.6 + Math.sin(time * 2) * 0.3;
  const eyeG = ctx.createRadialGradient(x, eyeY, 0, x, eyeY, 20);
  eyeG.addColorStop(0, `rgba(255,30,0,${eyePulse})`);
  eyeG.addColorStop(0.3, `rgba(200,0,40,${eyePulse * 0.5})`);
  eyeG.addColorStop(0.6, `rgba(120,0,80,${eyePulse * 0.2})`);
  eyeG.addColorStop(1, "rgba(60,0,40,0)");
  ctx.fillStyle = eyeG;
  ctx.beginPath();
  ctx.arc(x, eyeY, 20, 0, Math.PI * 2);
  ctx.fill();
  // Eye slit (horizontal evil eye)
  ctx.fillStyle = "#0a0005";
  ctx.beginPath();
  ctx.moveTo(x - 10, eyeY);
  ctx.quadraticCurveTo(x, eyeY - 6, x + 10, eyeY);
  ctx.quadraticCurveTo(x, eyeY + 6, x - 10, eyeY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255,40,0,${eyePulse})`;
  ctx.beginPath();
  ctx.moveTo(x - 8, eyeY);
  ctx.quadraticCurveTo(x, eyeY - 4, x + 8, eyeY);
  ctx.quadraticCurveTo(x, eyeY + 4, x - 8, eyeY);
  ctx.closePath();
  ctx.fill();
  // Pupil
  ctx.fillStyle = `rgba(255,220,0,${eyePulse * 0.8})`;
  ctx.beginPath();
  ctx.ellipse(x, eyeY, 2.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crown of jagged spikes at tower top
  for (let sp = 0; sp < 7; sp++) {
    const spx = x - 14 + sp * 5;
    const spH = 8 + Math.sin(sp * 1.3) * 4;
    const spLean = (sp - 3) * 0.5;
    ctx.fillStyle = ob1;
    ctx.beginPath();
    ctx.moveTo(spx - 2, y - tH * 0.85 + 2);
    ctx.lineTo(spx + spLean, y - tH * 0.85 - spH);
    ctx.lineTo(spx + 2, y - tH * 0.85 + 2);
    ctx.closePath();
    ctx.fill();
  }

  // Dark orb floating above tower
  const orbY = y - tH - 12 + Math.sin(time * 1.5) * 4;
  const orbPulse = 0.5 + Math.sin(time * 3) * 0.3;
  const orbG = ctx.createRadialGradient(x, orbY, 0, x, orbY, 14);
  orbG.addColorStop(0, `rgba(160,40,255,${orbPulse})`);
  orbG.addColorStop(0.4, `rgba(100,0,200,${orbPulse * 0.5})`);
  orbG.addColorStop(1, "rgba(40,0,80,0)");
  ctx.fillStyle = orbG;
  ctx.beginPath();
  ctx.arc(x, orbY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(200,100,255,${orbPulse * 0.8})`;
  ctx.beginPath();
  ctx.arc(x, orbY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,200,255,0.6)";
  ctx.beginPath();
  ctx.arc(x - 1.5, orbY - 1.5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Energy tendrils from orb to spires
  ctx.strokeStyle = `rgba(160,40,255,${0.12 + Math.sin(time * 2) * 0.06})`;
  ctx.lineWidth = 0.8;
  for (const [tx, th] of [
    [-48, 90],
    [48, 90],
    [-32, 75],
    [32, 75],
  ] as [number, number][]) {
    const targetY = y - th;
    ctx.beginPath();
    ctx.moveTo(x, orbY + 5);
    ctx.bezierCurveTo(
      x + tx * 0.3,
      orbY + 15,
      x + tx * 0.6,
      targetY - 20 + Math.sin(time * 3 + tx) * 5,
      x + tx,
      targetY
    );
    ctx.stroke();
  }

  // Tower windows (narrow slits with red glow)
  for (const [wy, scale] of [
    [y - 60, 1],
    [y - 40, 0.9],
    [y - 20, 0.8],
  ] as [number, number][]) {
    for (const side of [-1, 1]) {
      const wx = x + side * 8 * scale;
      const wGlow = 0.4 + Math.sin(time * 2.5 + wy * 0.1 + side) * 0.2;
      const wg = ctx.createRadialGradient(wx, wy, 0, wx, wy, 8);
      wg.addColorStop(0, `rgba(255,40,0,${wGlow * 0.4})`);
      wg.addColorStop(1, "rgba(200,0,0,0)");
      ctx.fillStyle = wg;
      ctx.beginPath();
      ctx.arc(wx, wy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#040004";
      ctx.fillRect(wx - 1.5, wy - 5 * scale, 3, 10 * scale);
      ctx.fillStyle = `rgba(255,50,10,${wGlow})`;
      ctx.fillRect(wx - 1, wy - 4 * scale, 2, 8 * scale);
    }
  }

  // Grand evil gate (maw)
  ctx.fillStyle = "#030003";
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 8);
  ctx.lineTo(x - 14, y - 8);
  ctx.bezierCurveTo(x - 10, y - 18, x + 10, y - 18, x + 14, y - 8);
  ctx.lineTo(x + 14, y + 8);
  ctx.closePath();
  ctx.fill();
  // Teeth-like protrusions on gate
  ctx.fillStyle = ob3;
  for (let t = 0; t < 5; t++) {
    const tx = x - 10 + t * 5;
    ctx.beginPath();
    ctx.moveTo(tx, y - 12 + Math.abs(t - 2) * 2);
    ctx.lineTo(tx + 1.5, y - 6);
    ctx.lineTo(tx + 3, y - 12 + Math.abs(t - 2) * 2);
    ctx.closePath();
    ctx.fill();
  }
  // Inner red glow
  const gateGlow = 0.3 + Math.sin(time * 1.8) * 0.15;
  const gg = ctx.createRadialGradient(x, y - 2, 0, x, y - 2, 14);
  gg.addColorStop(0, `rgba(255,20,0,${gateGlow})`);
  gg.addColorStop(1, "rgba(100,0,0,0)");
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(x, y - 2, 14, 0, Math.PI * 2);
  ctx.fill();

  // Flying dark particles / embers
  for (let p = 0; p < 8; p++) {
    const pAge = (time * 5 + p * 7.3) % 20;
    const px = x + Math.sin(time * 0.8 + p * 2.1) * (25 + pAge * 1.5);
    const py = y - 30 - pAge * 4;
    const pAlpha = Math.max(0, 0.4 - pAge / 25);
    if (pAlpha > 0) {
      ctx.fillStyle =
        p % 3 === 0
          ? `rgba(255,60,20,${pAlpha})`
          : `rgba(120,40,180,${pAlpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(px, py, 1 + Math.sin(p) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Dark smoke plumes
  for (let s = 0; s < 6; s++) {
    const sAge = (time * 6 + s * 11) % 40;
    const sx = x + Math.sin(time * 0.7 + s * 1.9) * (8 + sAge * 0.3);
    const sy = y - tH - 20 - sAge * 1.5;
    const sAlpha = Math.max(0, 0.15 - sAge / 50);
    if (sAlpha > 0) {
      ctx.fillStyle = `rgba(30,10,40,${sAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + sAge * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Tattered dark banner
  const w1 = Math.sin(time * 2.8 + x * 0.04) * 5;
  const w2 = Math.sin(time * 3.2 + x * 0.04) * 4;
  const w3 = Math.sin(time * 3.8 + x * 0.04) * 3;
  // Pole (black iron)
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x - 1, y - tH * 0.85 - 20, 2, 18);
  // Banner
  const bgG = ctx.createLinearGradient(x, 0, x + 30, 0);
  bgG.addColorStop(0, "#3a0808");
  bgG.addColorStop(0.5, "#5a1010");
  bgG.addColorStop(1, "#2a0505");
  ctx.fillStyle = bgG;
  ctx.beginPath();
  ctx.moveTo(x + 1, y - tH * 0.85 - 18);
  ctx.bezierCurveTo(
    x + 10,
    y - tH * 0.85 - 14 + w1,
    x + 20,
    y - tH * 0.85 - 10 + w2,
    x + 28,
    y - tH * 0.85 - 6 + w3
  );
  ctx.bezierCurveTo(
    x + 20,
    y - tH * 0.85 - 2 + w2,
    x + 10,
    y - tH * 0.85 + 2 + w1,
    x + 1,
    y - tH * 0.85 + 6
  );
  ctx.closePath();
  ctx.fill();
  // Tattered edge
  ctx.strokeStyle = "#1a0404";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + 28, y - tH * 0.85 - 6 + w3);
  for (let t = 0; t < 5; t++) {
    const ty = y - tH * 0.85 - 6 + w3 + (t - 2) * 3;
    ctx.lineTo(x + 26 + Math.sin(t * 2.3) * 3, ty);
  }
  ctx.stroke();
  // Skull emblem on banner
  const skX = x + 13,
    skY = y - tH * 0.85 - 6 + w1 * 0.4;
  ctx.fillStyle = "#c0b0a0";
  ctx.beginPath();
  ctx.arc(skX, skY - 1, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0a0005";
  ctx.beginPath();
  ctx.arc(skX - 1.2, skY - 1.5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(skX + 1.2, skY - 1.5, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0a0005";
  ctx.fillRect(skX - 1.5, skY + 1, 3, 1.5);

  ctx.restore();
};

export const drawCastleLabel = (
  dc: WorldMapDrawContext,
  cx: number,
  cyPct: number,
  label: string,
  isEnemy: boolean
) => {
  const { ctx, getLevelY } = dc;
  const cy = getLevelY(cyPct);
  const labelY = cy + 22;
  ctx.save();
  ctx.font = "bold 9px 'bc-novatica-cyr', serif";
  const tw = ctx.measureText(label).width;
  // Text shadow
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.textAlign = "center";
  ctx.fillText(label, cx + 0.8, labelY + 0.8);
  // Main text
  ctx.fillStyle = isEnemy ? "#cc4030" : "#d4a848";
  ctx.fillText(label, cx, labelY);
  // Underline accent
  ctx.strokeStyle = isEnemy ? "rgba(200,50,30,0.35)" : "rgba(210,170,70,0.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - tw * 0.55, labelY + 3);
  ctx.lineTo(cx + tw * 0.55, labelY + 3);
  ctx.stroke();
  ctx.restore();
};
