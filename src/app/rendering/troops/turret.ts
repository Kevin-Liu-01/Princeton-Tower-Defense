import type { Position } from "../../types";
import { ISO_Y_RATIO } from "../../constants";

export function drawTurretIsometricCrate(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  depth: number,
  colors: { top: string; side: string; front: string; outline?: string },
) {
  const depthX = depth;
  const depthY = depth * ISO_Y_RATIO;

  ctx.fillStyle = colors.top;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + depthX, top - depthY);
  ctx.lineTo(left + width + depthX, top - depthY);
  ctx.lineTo(left + width, top);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = colors.side;
  ctx.beginPath();
  ctx.moveTo(left + width, top);
  ctx.lineTo(left + width + depthX, top - depthY);
  ctx.lineTo(left + width + depthX, top + height - depthY);
  ctx.lineTo(left + width, top + height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = colors.front;
  ctx.fillRect(left, top, width, height);

  if (colors.outline) {
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + depthX, top - depthY);
    ctx.lineTo(left + width + depthX, top - depthY);
    ctx.lineTo(left + width + depthX, top + height - depthY);
    ctx.lineTo(left + width, top + height);
    ctx.lineTo(left, top + height);
    ctx.closePath();
    ctx.stroke();
  }
}

export function drawTurretBoltRow(
  ctx: CanvasRenderingContext2D,
  startX: number,
  y: number,
  count: number,
  spacing: number,
  radius: number,
  color: string,
) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(startX + i * spacing, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function projectTurretLocalPoint(
  originX: number,
  originY: number,
  rotation: number,
  squashY: number,
  localX: number,
  localY: number,
): Position {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  return {
    x: originX + cosR * localX - sinR * (localY * squashY),
    y: originY + sinR * localX + cosR * (localY * squashY),
  };
}

// ============================================================================
// TURRET TROOP - Engineer's Heavy Machine Gun Emplacement
// ============================================================================
export function drawTurretTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y2: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
) {
  const y = y2 + 8;
  const s = size * 1.5;
  const squashY = ISO_Y_RATIO;
  const engineerAccent = color || "#f59e0b";

  let rotation = 0;
  if (targetPos) {
    rotation = Math.atan2(targetPos.y - (y - s * 0.08), targetPos.x - x);
  } else {
    rotation =
      Math.PI * 0.75 +
      Math.sin(time * 0.55) * 0.18 +
      Math.sin(time * 1.45 + 0.8) * 0.05;
  }

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = ISO_Y_RATIO + Math.abs(cosR) * (1 - ISO_Y_RATIO);
  const isAttacking = attackPhase > 0;
  const fireRate = 18;
  const burstPhase = (time * fireRate) % 1;
  const inBurst = isAttacking && burstPhase < 0.58;
  const idleBob = Math.sin(time * 2.1) * s * 0.008;
  const idleHum = Math.sin(time * 1.2 + 0.6) * s * 0.004;
  const recoilOffset = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 2) * s * 0.03
    : 0;
  const turretShake = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 1.35) * s * 0.012
    : 0;
  const barrelVibration = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 2.6) * s * 0.008
    : 0;
  const heatGlow = isAttacking
    ? Math.min(1, attackPhase * 1.45 + Math.sin(time * 8.2) * 0.12)
    : 0;
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.35;

  ctx.save();

  // ── GROUND SHADOW ──
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.36, s * 0.5, s * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── SANDBAG RING ──
  const sandbagHues = ["#7a7058", "#6d6452", "#736b57", "#6a6350"];
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + 0.25;
    const bx = x + Math.cos(ang) * s * 0.38;
    const by = y + s * 0.3 + Math.sin(ang) * s * 0.15;
    ctx.fillStyle = sandbagHues[i % sandbagHues.length];
    ctx.beginPath();
    ctx.ellipse(bx, by, s * 0.075, s * 0.032, ang * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(45, 40, 30, 0.35)";
    ctx.lineWidth = s * 0.004;
    ctx.beginPath();
    ctx.ellipse(bx, by, s * 0.055, s * 0.018, ang * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── TRIPOD LEGS ──
  const platformTop = y + s * 0.02 + idleBob;
  const tripodOriginX = x - s * 0.01;
  const tripodOriginY = platformTop + s * 0.12;
  const legs = [
    { ex: x - s * 0.4, ey: y + s * 0.37 },
    { ex: x + s * 0.32, ey: y + s * 0.35 },
    { ex: x - s * 0.01, ey: y + s * 0.43 },
  ];

  ctx.lineCap = "round";
  for (const leg of legs) {
    ctx.strokeStyle = "#464c5a";
    ctx.lineWidth = s * 0.052;
    ctx.beginPath();
    ctx.moveTo(tripodOriginX, tripodOriginY);
    ctx.lineTo(leg.ex, leg.ey);
    ctx.stroke();

    ctx.strokeStyle = "#6a7180";
    ctx.lineWidth = s * 0.014;
    const t1 = 0.3;
    const t2 = 0.7;
    ctx.beginPath();
    ctx.moveTo(
      tripodOriginX + (leg.ex - tripodOriginX) * t1,
      tripodOriginY + (leg.ey - tripodOriginY) * t1,
    );
    ctx.lineTo(
      tripodOriginX + (leg.ex - tripodOriginX) * t2,
      tripodOriginY + (leg.ey - tripodOriginY) * t2,
    );
    ctx.stroke();

    ctx.fillStyle = "#555d6c";
    ctx.beginPath();
    ctx.arc(
      tripodOriginX + (leg.ex - tripodOriginX) * 0.12,
      tripodOriginY + (leg.ey - tripodOriginY) * 0.12,
      s * 0.016,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = "#1e2228";
    ctx.beginPath();
    ctx.ellipse(leg.ex, leg.ey, s * 0.06, s * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#15191e";
    ctx.lineWidth = s * 0.006;
    ctx.beginPath();
    ctx.ellipse(leg.ex, leg.ey, s * 0.05, s * 0.025, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── BASE PLATFORM ──
  const platformLeft = x - s * 0.26;

  drawTurretIsometricCrate(
    ctx,
    platformLeft,
    platformTop,
    s * 0.4,
    s * 0.15,
    s * 0.13,
    {
      top: "#5e6b56",
      side: "#465040",
      front: "#313930",
      outline: "rgba(225, 222, 196, 0.1)",
    },
  );

  drawTurretIsometricCrate(
    ctx,
    platformLeft + s * 0.04,
    platformTop - s * 0.04,
    s * 0.18,
    s * 0.09,
    s * 0.07,
    {
      top: "#4d5847",
      side: "#3a4536",
      front: "#2d352a",
      outline: "rgba(225, 222, 196, 0.07)",
    },
  );

  drawTurretBoltRow(
    ctx,
    platformLeft + s * 0.03,
    platformTop + s * 0.028,
    4,
    s * 0.08,
    s * 0.006,
    "rgba(206, 197, 150, 0.65)",
  );

  ctx.fillStyle = engineerAccent;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(
    platformLeft + s * 0.02,
    platformTop + s * 0.1,
    s * 0.24,
    s * 0.022,
  );
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(18, 18, 18, 0.7)";
  ctx.lineWidth = s * 0.007;
  for (let i = 0; i < 4; i++) {
    const sx = platformLeft + s * (0.03 + i * 0.055);
    ctx.beginPath();
    ctx.moveTo(sx, platformTop + s * 0.12);
    ctx.lineTo(sx + s * 0.035, platformTop + s * 0.085);
    ctx.stroke();
  }

  // ── TURRET RING ──
  const ringX = x;
  const ringY = platformTop - s * 0.015;

  ctx.fillStyle = "#3a4240";
  ctx.beginPath();
  ctx.ellipse(ringX, ringY + s * 0.1, s * 0.19, s * 0.095, 0, 0, Math.PI * 2);
  ctx.fill();

  const ringGrad = ctx.createLinearGradient(
    ringX - s * 0.14,
    ringY,
    ringX + s * 0.14,
    ringY,
  );
  ringGrad.addColorStop(0, "#2a3035");
  ringGrad.addColorStop(0.2, "#555d62");
  ringGrad.addColorStop(0.5, "#7a8486");
  ringGrad.addColorStop(0.8, "#555d62");
  ringGrad.addColorStop(1, "#2a3035");
  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.ellipse(
    ringX,
    ringY + s * 0.06,
    s * 0.155,
    s * 0.0775,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#282e2d";
  ctx.beginPath();
  ctx.ellipse(
    ringX,
    ringY + s * 0.06,
    s * 0.075,
    s * 0.0375,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  for (let i = 0; i < 8; i++) {
    const rivetAngle = (i / 8) * Math.PI * 2 + time * 0.12;
    ctx.fillStyle = "rgba(194, 186, 150, 0.6)";
    ctx.beginPath();
    ctx.arc(
      ringX + Math.cos(rivetAngle) * s * 0.12,
      ringY + s * 0.06 + Math.sin(rivetAngle) * s * 0.06,
      s * 0.006,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ── AMMO BOX ──
  const ammoLeft = x - s * 0.4;
  const ammoTop = platformTop - s * 0.01;

  drawTurretIsometricCrate(ctx, ammoLeft, ammoTop, s * 0.15, s * 0.12, s * 0.06, {
    top: "#55654f",
    side: "#3f4b3c",
    front: "#2b3329",
    outline: "rgba(225, 222, 196, 0.06)",
  });

  drawTurretBoltRow(
    ctx,
    ammoLeft + s * 0.02,
    ammoTop + s * 0.03,
    2,
    s * 0.045,
    s * 0.005,
    "rgba(209, 198, 150, 0.6)",
  );

  ctx.fillStyle = engineerAccent;
  ctx.globalAlpha = 0.75;
  ctx.fillRect(ammoLeft + s * 0.015, ammoTop + s * 0.08, s * 0.09, s * 0.02);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(18, 18, 18, 0.75)";
  ctx.lineWidth = s * 0.006;
  for (let i = 0; i < 2; i++) {
    const sx = ammoLeft + s * (0.02 + i * 0.03);
    ctx.beginPath();
    ctx.moveTo(sx, ammoTop + s * 0.098);
    ctx.lineTo(sx + s * 0.02, ammoTop + s * 0.08);
    ctx.stroke();
  }

  const ammoLedPulse = 0.4 + Math.sin(time * 4.2) * 0.15;
  ctx.fillStyle = `rgba(110, 255, 160, ${ammoLedPulse})`;
  ctx.beginPath();
  ctx.arc(ammoLeft + s * 0.11, ammoTop + s * 0.022, s * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // ======== GUN ASSEMBLY (rotated + isometric squash) ========
  const gunPivotX = ringX + shakeX;
  const gunPivotY = ringY - s * 0.02 + idleHum + shakeY;

  ctx.save();
  ctx.translate(gunPivotX, gunPivotY);
  ctx.rotate(rotation);
  ctx.scale(1, squashY);

  // Rear ammo feed housing
  ctx.fillStyle = "#33392e";
  ctx.beginPath();
  ctx.roundRect(-s * 0.19, -s * 0.08, s * 0.12, s * 0.16, s * 0.02);
  ctx.fill();

  // Main gun housing
  ctx.fillStyle = "#505c4a";
  ctx.beginPath();
  ctx.moveTo(-s * 0.07, -s * 0.14);
  ctx.lineTo(s * 0.12, -s * 0.17);
  ctx.lineTo(s * 0.2, 0);
  ctx.lineTo(s * 0.12, s * 0.17);
  ctx.lineTo(-s * 0.07, s * 0.14);
  ctx.lineTo(-s * 0.12, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#434d3e";
  ctx.beginPath();
  ctx.moveTo(-s * 0.02, -s * 0.11);
  ctx.lineTo(s * 0.1, -s * 0.12);
  ctx.lineTo(s * 0.15, 0);
  ctx.lineTo(s * 0.1, s * 0.12);
  ctx.lineTo(-s * 0.02, s * 0.11);
  ctx.closePath();
  ctx.fill();

  // Receiver body
  const receiverGrad = ctx.createLinearGradient(-s * 0.08, 0, s * 0.18, 0);
  receiverGrad.addColorStop(0, "#2a2e38");
  receiverGrad.addColorStop(0.15, "#4a5060");
  receiverGrad.addColorStop(0.45, "#6a7484");
  receiverGrad.addColorStop(0.75, "#4a5060");
  receiverGrad.addColorStop(1, "#2e3340");
  ctx.fillStyle = receiverGrad;
  ctx.beginPath();
  ctx.roundRect(-s * 0.06, -s * 0.078, s * 0.26, s * 0.156, s * 0.028);
  ctx.fill();

  // Gun shield - thin integrated plate at barrel root
  const shieldX = s * 0.11;
  const shieldGrad = ctx.createLinearGradient(
    shieldX,
    -s * 0.18,
    shieldX,
    s * 0.18,
  );
  shieldGrad.addColorStop(0, "#505a68");
  shieldGrad.addColorStop(0.3, "#667080");
  shieldGrad.addColorStop(0.5, "#748296");
  shieldGrad.addColorStop(0.7, "#667080");
  shieldGrad.addColorStop(1, "#4c5664");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.roundRect(shieldX - s * 0.015, -s * 0.17, s * 0.03, s * 0.34, s * 0.008);
  ctx.fill();

  ctx.strokeStyle = "rgba(160, 175, 195, 0.2)";
  ctx.lineWidth = s * 0.005;
  ctx.beginPath();
  ctx.moveTo(shieldX + s * 0.015, -s * 0.16);
  ctx.lineTo(shieldX + s * 0.015, s * 0.16);
  ctx.stroke();

  // Top rail
  ctx.fillStyle = "#5c6675";
  ctx.beginPath();
  ctx.roundRect(-s * 0.02, -s * 0.1, s * 0.13, s * 0.04, s * 0.012);
  ctx.fill();

  drawTurretBoltRow(
    ctx,
    0,
    -s * 0.08,
    3,
    s * 0.035,
    s * 0.007,
    "rgba(220, 220, 215, 0.38)",
  );

  // Optic sight
  ctx.fillStyle = "#3a424c";
  ctx.beginPath();
  ctx.roundRect(s * 0.015, -s * 0.14, s * 0.1, s * 0.055, s * 0.014);
  ctx.fill();

  ctx.fillStyle = targetPos
    ? `rgba(255, 96, 80, ${0.7 + Math.sin(time * 6.5) * 0.18})`
    : `rgba(104, 189, 255, ${0.4 + Math.sin(time * 2.8) * 0.12})`;
  ctx.beginPath();
  ctx.ellipse(s * 0.065, -s * 0.113, s * 0.03, s * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.ellipse(s * 0.055, -s * 0.12, s * 0.01, s * 0.006, 0, 0, Math.PI * 2);
  ctx.fill();

  // Barrel with cooling jacket
  const barrelStart = s * 0.13 - recoilOffset;
  const barrelEnd = s * 0.44 - recoilOffset + barrelVibration;
  const jacketLen = s * 0.2;

  for (let ring = 0; ring < 7; ring++) {
    const t = ring / 6;
    const rx = barrelStart + jacketLen * t;
    const radX = s * (0.046 - t * 0.006);
    const radY = s * (0.026 - t * 0.003);

    ctx.fillStyle = "#4e5664";
    ctx.beginPath();
    ctx.ellipse(rx, 0, radX, radY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2a2f38";
    ctx.beginPath();
    ctx.ellipse(rx, 0, radX * 0.6, radY * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (heatGlow > 0.15) {
      ctx.fillStyle = `rgba(255, 160, 70, ${heatGlow * 0.14 * (1 - t * 0.6)})`;
      ctx.beginPath();
      ctx.ellipse(rx, 0, radX * 0.8, radY * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner barrel tube
  ctx.fillStyle = "#1e222a";
  ctx.beginPath();
  ctx.roundRect(
    barrelStart - s * 0.006,
    -s * 0.016,
    barrelEnd - barrelStart,
    s * 0.032,
    s * 0.008,
  );
  ctx.fill();

  // Feed rail (underneath)
  ctx.strokeStyle = "#3e444e";
  ctx.lineWidth = s * 0.018;
  ctx.beginPath();
  ctx.moveTo(-s * 0.02, s * 0.07);
  ctx.lineTo(s * 0.16, s * 0.08);
  ctx.stroke();

  // Muzzle brake
  ctx.fillStyle = "#3a424c";
  ctx.beginPath();
  ctx.roundRect(barrelEnd - s * 0.004, -s * 0.032, s * 0.06, s * 0.064, s * 0.012);
  ctx.fill();

  ctx.strokeStyle = "#1a1e24";
  ctx.lineWidth = s * 0.004;
  for (let slot = 0; slot < 3; slot++) {
    const slotX = barrelEnd + s * (0.008 + slot * 0.015);
    ctx.beginPath();
    ctx.moveTo(slotX, -s * 0.026);
    ctx.lineTo(slotX, -s * 0.012);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(slotX, s * 0.012);
    ctx.lineTo(slotX, s * 0.026);
    ctx.stroke();
  }

  // Barrel bore
  ctx.fillStyle = "#0e1218";
  ctx.beginPath();
  ctx.ellipse(
    barrelEnd + s * 0.054,
    0,
    s * 0.014 * foreshorten + s * 0.005,
    s * 0.018,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Rear sight crosshair
  ctx.strokeStyle = "rgba(206, 195, 145, 0.35)";
  ctx.lineWidth = s * 0.008;
  ctx.beginPath();
  ctx.arc(-s * 0.14, -s * 0.11, s * 0.035, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.14, -s * 0.145);
  ctx.lineTo(-s * 0.14, -s * 0.075);
  ctx.moveTo(-s * 0.175, -s * 0.11);
  ctx.lineTo(-s * 0.105, -s * 0.11);
  ctx.stroke();

  ctx.restore();

  // ── AMMO BELT ──
  const beltStart = {
    x: ammoLeft + s * 0.12,
    y: ammoTop - s * 0.008,
  };
  const beltControl = {
    x: x - s * 0.14 - sinR * s * 0.03,
    y: platformTop - s * 0.14 - Math.abs(cosR) * s * 0.02,
  };
  const beltFeed = projectTurretLocalPoint(
    gunPivotX,
    gunPivotY,
    rotation,
    squashY,
    s * 0.02,
    -s * 0.08,
  );

  const beltWave = isAttacking ? time * 20 : time * 3;
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const nextT = Math.min(1, (i + 1) / 5);
    const wobble = Math.sin(beltWave + i * 0.9) * s * 0.006;
    const nextWobble = Math.sin(beltWave + (i + 1) * 0.9) * s * 0.006;

    const linkX =
      (1 - t) * (1 - t) * beltStart.x +
      2 * (1 - t) * t * beltControl.x +
      t * t * beltFeed.x;
    const linkY =
      (1 - t) * (1 - t) * beltStart.y +
      2 * (1 - t) * t * beltControl.y +
      t * t * beltFeed.y +
      wobble;
    const nextLinkX =
      (1 - nextT) * (1 - nextT) * beltStart.x +
      2 * (1 - nextT) * nextT * beltControl.x +
      nextT * nextT * beltFeed.x;
    const nextLinkY =
      (1 - nextT) * (1 - nextT) * beltStart.y +
      2 * (1 - nextT) * nextT * beltControl.y +
      nextT * nextT * beltFeed.y +
      nextWobble;

    ctx.strokeStyle = "#5b4d3c";
    ctx.lineWidth = s * 0.01;
    ctx.beginPath();
    ctx.moveTo(linkX, linkY);
    ctx.lineTo(nextLinkX, nextLinkY);
    ctx.stroke();

    const bulletAngle = Math.atan2(nextLinkY - linkY, nextLinkX - linkX);
    ctx.fillStyle = "#caa24d";
    ctx.beginPath();
    ctx.ellipse(
      linkX,
      linkY,
      s * 0.015,
      s * 0.007,
      bulletAngle,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#e5d0a7";
    ctx.beginPath();
    ctx.ellipse(
      linkX + Math.cos(bulletAngle) * s * 0.009,
      linkY + Math.sin(bulletAngle) * s * 0.009,
      s * 0.006,
      s * 0.003,
      bulletAngle,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ======== ATTACK EFFECTS ========
  const muzzleTip = projectTurretLocalPoint(
    gunPivotX,
    gunPivotY,
    rotation,
    squashY,
    s * 0.52 - recoilOffset + barrelVibration,
    0,
  );
  const ejectPort = projectTurretLocalPoint(
    gunPivotX,
    gunPivotY,
    rotation,
    squashY,
    s * 0.02,
    s * 0.06,
  );
  const opticLens = projectTurretLocalPoint(
    gunPivotX,
    gunPivotY,
    rotation,
    squashY,
    s * 0.065,
    -s * 0.113,
  );

  if (targetPos) {
    const lockPulse = 0.14 + Math.sin(time * 8) * 0.04;
    ctx.strokeStyle = `rgba(255, 175, 80, ${lockPulse})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.setLineDash([4 * zoom, 3 * zoom]);
    ctx.beginPath();
    ctx.moveTo(opticLens.x, opticLens.y);
    ctx.lineTo(targetPos.x, targetPos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(255, 110, 80, ${0.5 + Math.sin(time * 7) * 0.15})`;
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isAttacking && inBurst) {
    const flashIntensity =
      0.62 + Math.sin(time * fireRate * Math.PI * 2) * 0.38;
    const flashSize = s * 0.1 * flashIntensity;
    const flashX = muzzleTip.x + cosR * s * 0.012;
    const flashY = muzzleTip.y + sinR * s * 0.012;
    const flashGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      flashSize,
    );
    flashGrad.addColorStop(0, `rgba(255,255,255,${flashIntensity})`);
    flashGrad.addColorStop(
      0.2,
      `rgba(255,236,174,${flashIntensity * 0.88})`,
    );
    flashGrad.addColorStop(
      0.5,
      `rgba(255,170,78,${flashIntensity * 0.52})`,
    );
    flashGrad.addColorStop(1, "rgba(255,80,20,0)");
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 205, 120, ${flashIntensity * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(flashX, flashY);
    ctx.lineTo(
      flashX + cosR * flashSize * 1.8 + sinR * flashSize * 0.35,
      flashY + sinR * flashSize * 0.9 - cosR * flashSize * 0.18,
    );
    ctx.lineTo(
      flashX + cosR * flashSize * 1.8 - sinR * flashSize * 0.35,
      flashY + sinR * flashSize * 0.9 + cosR * flashSize * 0.18,
    );
    ctx.closePath();
    ctx.fill();
  }

  if (isAttacking && targetPos) {
    for (let tracer = 0; tracer < 3; tracer++) {
      const tracerPhase = (time * fireRate + tracer * 0.27) % 1;
      if (tracerPhase > 0.82) continue;

      const headX = muzzleTip.x + (targetPos.x - muzzleTip.x) * tracerPhase;
      const headY = muzzleTip.y + (targetPos.y - muzzleTip.y) * tracerPhase;
      const tailX = headX - cosR * s * 0.1;
      const tailY = headY - sinR * s * 0.05;
      const tracerAlpha = 1 - tracerPhase * 0.75;
      const tracerGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      tracerGrad.addColorStop(0, "rgba(255, 210, 90, 0)");
      tracerGrad.addColorStop(
        0.5,
        `rgba(255, 218, 126, ${tracerAlpha * 0.45})`,
      );
      tracerGrad.addColorStop(1, `rgba(255, 245, 210, ${tracerAlpha})`);
      ctx.strokeStyle = tracerGrad;
      ctx.lineWidth = 2.0 * zoom;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();
    }
  }

  if (isAttacking) {
    for (let casing = 0; casing < 3; casing++) {
      const casingPhase = (time * fireRate * 0.76 + casing * 0.23) % 1;
      if (casingPhase > 0.62) continue;

      const ejectProgress = casingPhase / 0.62;
      const ejectAngle = rotation + Math.PI * 0.72;
      const casingX =
        ejectPort.x +
        Math.cos(ejectAngle) * s * 0.2 * ejectProgress +
        Math.sin(time * 34 + casing * 2) * s * 0.006;
      const casingY =
        ejectPort.y +
        Math.sin(ejectAngle) * s * 0.08 * ejectProgress +
        s * 0.3 * ejectProgress * ejectProgress;
      const spin = time * 24 + casing;

      ctx.fillStyle = "#d0a54f";
      ctx.beginPath();
      ctx.ellipse(
        casingX,
        casingY,
        s * 0.012,
        s * 0.005,
        spin,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  if (isAttacking) {
    for (let smoke = 0; smoke < 3; smoke++) {
      const smokePhase = (time * 1.7 + smoke * 0.28) % 1;
      const smokeX =
        muzzleTip.x +
        cosR * s * (0.03 + smokePhase * 0.05) -
        sinR * s * 0.025 * smoke;
      const smokeY =
        muzzleTip.y +
        sinR * s * (0.015 + smokePhase * 0.03) -
        smokePhase * s * 0.08;
      const smokeSize = s * (0.018 + smokePhase * 0.025);
      ctx.fillStyle = `rgba(132, 136, 144, ${(1 - smokePhase) * (0.15 + heatGlow * 0.1)})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── STATUS INDICATORS ──
  if (heatGlow > 0.35) {
    const heatPulse = Math.sin(time * 14) > 0 ? 1 : 0.35;
    ctx.fillStyle = `rgba(255, 92, 48, ${heatPulse})`;
    ctx.beginPath();
    ctx.arc(
      gunPivotX + s * 0.05,
      gunPivotY - s * 0.08,
      s * 0.01,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // ── ENGINEER EMBLEM ──
  ctx.strokeStyle = engineerAccent;
  ctx.lineWidth = 1.2 * zoom;
  const emblemX = x + s * 0.04;
  const emblemY = platformTop + s * 0.08;
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, s * 0.025, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const toothAngle =
      (i / 6) * Math.PI * 2 + time * (isAttacking ? 1.7 : 0.35);
    ctx.beginPath();
    ctx.moveTo(
      emblemX + Math.cos(toothAngle) * s * 0.025,
      emblemY + Math.sin(toothAngle) * s * 0.025,
    );
    ctx.lineTo(
      emblemX + Math.cos(toothAngle) * s * 0.038,
      emblemY + Math.sin(toothAngle) * s * 0.038,
    );
    ctx.stroke();
  }

  ctx.restore();
}
