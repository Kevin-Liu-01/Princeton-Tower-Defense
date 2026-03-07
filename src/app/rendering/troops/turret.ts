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
  const y = y2 + 10;
  const s = size * 1.72;
  const squashY = ISO_Y_RATIO;
  const engineerAccent = color || "#f59e0b";

  let rotation = 0;
  if (targetPos) {
    rotation = Math.atan2(targetPos.y - (y - s * 0.08), targetPos.x - x);
  } else {
    rotation =
      Math.PI * 0.75 +
      Math.sin(time * 0.55) * 0.24 +
      Math.sin(time * 1.45 + 0.8) * 0.07;
  }

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = ISO_Y_RATIO + Math.abs(cosR) * (1 - ISO_Y_RATIO);
  const isAttacking = attackPhase > 0;
  const fireRate = 18;
  const burstPhase = (time * fireRate) % 1;
  const inBurst = isAttacking && burstPhase < 0.58;
  const idleBob = Math.sin(time * 2.1) * s * 0.012;
  const idleHum = Math.sin(time * 1.2 + 0.6) * s * 0.006;
  const recoilOffset = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 2) * s * 0.05
    : 0;
  const turretShake = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 1.35) * s * 0.018
    : 0;
  const barrelVibration = isAttacking
    ? Math.sin(time * fireRate * Math.PI * 2.6) * s * 0.012
    : 0;
  const heatGlow = isAttacking
    ? Math.min(1, attackPhase * 1.45 + Math.sin(time * 8.2) * 0.12)
    : 0;
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.35;

  ctx.save();

  ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.42, s * 0.58, s * 0.29, 0, 0, Math.PI * 2);
  ctx.fill();

  const platformLeft = x - s * 0.36;
  const platformTop = y + s * 0.06 + idleBob;

  drawTurretIsometricCrate(
    ctx,
    platformLeft,
    platformTop,
    s * 0.46,
    s * 0.2,
    s * 0.15,
    {
      top: "#66735f",
      side: "#495344",
      front: "#31392e",
      outline: "rgba(225, 222, 196, 0.08)",
    },
  );

  drawTurretIsometricCrate(
    ctx,
    x - s * 0.31,
    platformTop - s * 0.065,
    s * 0.21,
    s * 0.14,
    s * 0.09,
    {
      top: "#4d5848",
      side: "#374133",
      front: "#2d352a",
      outline: "rgba(225, 222, 196, 0.06)",
    },
  );

  ctx.fillStyle = "#42503a";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.08, platformTop + s * 0.03);
  ctx.lineTo(x + s * 0.16, platformTop + s * 0.03);
  ctx.lineTo(x + s * 0.28, platformTop + s * 0.11);
  ctx.lineTo(x + s * 0.03, platformTop + s * 0.11);
  ctx.closePath();
  ctx.fill();

  drawTurretBoltRow(
    ctx,
    platformLeft + s * 0.03,
    platformTop + s * 0.035,
    5,
    s * 0.09,
    s * 0.008,
    "rgba(206, 197, 150, 0.75)",
  );

  const stabilizers = [
    {
      startX: x - s * 0.22,
      startY: platformTop + s * 0.19,
      endX: x - s * 0.46,
      endY: y + s * 0.4,
    },
    {
      startX: x + s * 0.08,
      startY: platformTop + s * 0.18,
      endX: x + s * 0.37,
      endY: y + s * 0.38,
    },
    {
      startX: x - s * 0.03,
      startY: platformTop + s * 0.2,
      endX: x - s * 0.02,
      endY: y + s * 0.47,
    },
  ] as const;

  ctx.lineCap = "round";
  for (const stabilizer of stabilizers) {
    ctx.strokeStyle = "#464c5b";
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(stabilizer.startX, stabilizer.startY);
    ctx.lineTo(stabilizer.endX, stabilizer.endY);
    ctx.stroke();

    ctx.strokeStyle = "#7a8293";
    ctx.lineWidth = s * 0.018;
    ctx.beginPath();
    ctx.moveTo(
      stabilizer.startX + (stabilizer.endX - stabilizer.startX) * 0.22,
      stabilizer.startY + (stabilizer.endY - stabilizer.startY) * 0.22,
    );
    ctx.lineTo(
      stabilizer.startX + (stabilizer.endX - stabilizer.startX) * 0.66,
      stabilizer.startY + (stabilizer.endY - stabilizer.startY) * 0.66,
    );
    ctx.stroke();

    ctx.fillStyle = "#242831";
    ctx.beginPath();
    ctx.ellipse(
      stabilizer.endX,
      stabilizer.endY,
      s * 0.07,
      s * 0.035,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  const ringX = x - s * 0.02;
  const ringY = platformTop - s * 0.01;

  ctx.fillStyle = "#404947";
  ctx.beginPath();
  ctx.ellipse(
    ringX,
    ringY + s * 0.12,
    s * 0.22,
    s * 0.11,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const ringGrad = ctx.createLinearGradient(
    ringX - s * 0.16,
    ringY,
    ringX + s * 0.16,
    ringY,
  );
  ringGrad.addColorStop(0, "#252a30");
  ringGrad.addColorStop(0.25, "#586062");
  ringGrad.addColorStop(0.5, "#7a8686");
  ringGrad.addColorStop(0.75, "#586062");
  ringGrad.addColorStop(1, "#252a30");
  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.ellipse(
    ringX,
    ringY + s * 0.08,
    s * 0.17,
    s * 0.085,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#2a302f";
  ctx.beginPath();
  ctx.ellipse(
    ringX,
    ringY + s * 0.08,
    s * 0.095,
    s * 0.0475,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  for (let i = 0; i < 10; i++) {
    const rivetAngle = (i / 10) * Math.PI * 2 + time * 0.15;
    ctx.fillStyle = "rgba(194, 186, 150, 0.72)";
    ctx.beginPath();
    ctx.arc(
      ringX + Math.cos(rivetAngle) * s * 0.135,
      ringY + s * 0.08 + Math.sin(rivetAngle) * s * 0.0675,
      s * 0.008,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  const ammoLeft = x - s * 0.5;
  const ammoTop = platformTop + s * 0.01;
  drawTurretIsometricCrate(
    ctx,
    ammoLeft,
    ammoTop,
    s * 0.19,
    s * 0.16,
    s * 0.08,
    {
      top: "#55654f",
      side: "#3f4b3c",
      front: "#2b3329",
      outline: "rgba(225, 222, 196, 0.06)",
    },
  );
  drawTurretBoltRow(
    ctx,
    ammoLeft + s * 0.03,
    ammoTop + s * 0.045,
    3,
    s * 0.045,
    s * 0.007,
    "rgba(209, 198, 150, 0.72)",
  );
  ctx.fillStyle = engineerAccent;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(ammoLeft + s * 0.02, ammoTop + s * 0.1, s * 0.13, s * 0.03);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(18, 18, 18, 0.85)";
  ctx.lineWidth = s * 0.009;
  for (let i = 0; i < 3; i++) {
    const stripeX = ammoLeft + s * (0.035 + i * 0.04);
    ctx.beginPath();
    ctx.moveTo(stripeX, ammoTop + s * 0.13);
    ctx.lineTo(stripeX + s * 0.03, ammoTop + s * 0.1);
    ctx.stroke();
  }

  const gunPivotX = ringX + shakeX;
  const gunPivotY = ringY - s * 0.03 + idleHum + shakeY;

  ctx.save();
  ctx.translate(gunPivotX, gunPivotY);
  ctx.rotate(rotation);
  ctx.scale(1, squashY);

  // Gun shield - protective armor plate facing the target
  const shieldGrad = ctx.createLinearGradient(
    s * 0.06,
    -s * 0.32,
    s * 0.06,
    s * 0.32,
  );
  shieldGrad.addColorStop(0, "#4e5868");
  shieldGrad.addColorStop(0.2, "#6a7888");
  shieldGrad.addColorStop(0.4, "#788a9e");
  shieldGrad.addColorStop(0.6, "#6a7888");
  shieldGrad.addColorStop(0.8, "#586878");
  shieldGrad.addColorStop(1, "#4a5464");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(-s * 0.02, -s * 0.3);
  ctx.quadraticCurveTo(s * 0.08, -s * 0.34, s * 0.14, -s * 0.28);
  ctx.lineTo(s * 0.16, s * 0.28);
  ctx.quadraticCurveTo(s * 0.08, s * 0.34, -s * 0.02, s * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(140, 155, 175, 0.25)";
  ctx.lineWidth = s * 0.008;
  ctx.beginPath();
  ctx.moveTo(-s * 0.02, -s * 0.3);
  ctx.quadraticCurveTo(s * 0.08, -s * 0.34, s * 0.14, -s * 0.28);
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const rivetY = -s * 0.22 + i * s * 0.11;
    ctx.fillStyle = "rgba(200, 195, 170, 0.45)";
    ctx.beginPath();
    ctx.arc(s * 0.11, rivetY, s * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(80, 90, 110, 0.3)";
  ctx.lineWidth = s * 0.003;
  ctx.beginPath();
  ctx.moveTo(s * 0.02, -s * 0.15);
  ctx.lineTo(s * 0.08, -s * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.04, s * 0.1);
  ctx.lineTo(s * 0.1, s * 0.18);
  ctx.stroke();

  ctx.fillStyle = "#31392d";
  ctx.beginPath();
  ctx.roundRect(-s * 0.24, -s * 0.11, s * 0.17, s * 0.22, s * 0.03);
  ctx.fill();

  ctx.fillStyle = "#586550";
  ctx.beginPath();
  ctx.moveTo(-s * 0.07, -s * 0.18);
  ctx.lineTo(s * 0.2, -s * 0.23);
  ctx.lineTo(s * 0.3, 0);
  ctx.lineTo(s * 0.2, s * 0.23);
  ctx.lineTo(-s * 0.07, s * 0.18);
  ctx.lineTo(-s * 0.14, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#434d40";
  ctx.beginPath();
  ctx.moveTo(-s * 0.02, -s * 0.14);
  ctx.lineTo(s * 0.17, -s * 0.16);
  ctx.lineTo(s * 0.23, 0);
  ctx.lineTo(s * 0.17, s * 0.16);
  ctx.lineTo(-s * 0.02, s * 0.14);
  ctx.closePath();
  ctx.fill();

  const receiverGrad = ctx.createLinearGradient(-s * 0.1, 0, s * 0.26, 0);
  receiverGrad.addColorStop(0, "#262a34");
  receiverGrad.addColorStop(0.2, "#4e5565");
  receiverGrad.addColorStop(0.5, "#727c90");
  receiverGrad.addColorStop(0.82, "#4b5260");
  receiverGrad.addColorStop(1, "#2b3039");
  ctx.fillStyle = receiverGrad;
  ctx.beginPath();
  ctx.roundRect(-s * 0.08, -s * 0.1, s * 0.36, s * 0.2, s * 0.035);
  ctx.fill();

  ctx.fillStyle = "#6c7689";
  ctx.beginPath();
  ctx.roundRect(-s * 0.03, -s * 0.14, s * 0.19, s * 0.06, s * 0.02);
  ctx.fill();
  drawTurretBoltRow(
    ctx,
    -s * 0.01,
    -s * 0.11,
    3,
    s * 0.055,
    s * 0.01,
    "rgba(221, 221, 216, 0.45)",
  );

  ctx.fillStyle = "#3f464d";
  ctx.beginPath();
  ctx.roundRect(s * 0.01, -s * 0.19, s * 0.17, s * 0.08, s * 0.02);
  ctx.fill();
  ctx.fillStyle = targetPos
    ? `rgba(255, 96, 80, ${0.75 + Math.sin(time * 6.5) * 0.18})`
    : `rgba(104, 189, 255, ${0.45 + Math.sin(time * 2.8) * 0.12})`;
  ctx.beginPath();
  ctx.ellipse(s * 0.1, -s * 0.15, s * 0.045, s * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath();
  ctx.ellipse(s * 0.085, -s * 0.16, s * 0.014, s * 0.009, 0, 0, Math.PI * 2);
  ctx.fill();

  const barrelStartLocalX = s * 0.16 - recoilOffset;
  const barrelEndLocalX = s * 0.67 - recoilOffset + barrelVibration;
  const jacketLength = s * 0.34;
  for (let ring = 0; ring < 9; ring++) {
    const t = ring / 8;
    const ringLocalX = barrelStartLocalX + jacketLength * t;
    const radiusX = s * (0.06 - t * 0.008);
    const radiusY = s * (0.034 - t * 0.004);
    ctx.fillStyle = "#525a67";
    ctx.beginPath();
    ctx.ellipse(ringLocalX, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2a2f39";
    ctx.beginPath();
    ctx.ellipse(
      ringLocalX,
      0,
      radiusX * 0.65,
      radiusY * 0.45,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    if (heatGlow > 0.15) {
      ctx.fillStyle = `rgba(255, 160, 70, ${heatGlow * 0.16 * (1 - t * 0.65)})`;
      ctx.beginPath();
      ctx.ellipse(
        ringLocalX,
        0,
        radiusX * 0.82,
        radiusY * 0.75,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  ctx.fillStyle = "#1f232b";
  ctx.beginPath();
  ctx.roundRect(
    barrelStartLocalX - s * 0.01,
    -s * 0.022,
    barrelEndLocalX - barrelStartLocalX,
    s * 0.044,
    s * 0.012,
  );
  ctx.fill();

  ctx.strokeStyle = "#40464f";
  ctx.lineWidth = s * 0.026;
  ctx.beginPath();
  ctx.moveTo(-s * 0.03, s * 0.1);
  ctx.lineTo(s * 0.24, s * 0.12);
  ctx.stroke();

  ctx.fillStyle = "#3b434c";
  ctx.beginPath();
  ctx.roundRect(
    barrelEndLocalX - s * 0.005,
    -s * 0.045,
    s * 0.085,
    s * 0.09,
    s * 0.018,
  );
  ctx.fill();

  ctx.fillStyle = "#11161c";
  ctx.beginPath();
  ctx.ellipse(
    barrelEndLocalX + s * 0.075,
    0,
    s * 0.02 * foreshorten + s * 0.01,
    s * 0.026,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.strokeStyle = "rgba(206, 195, 145, 0.44)";
  ctx.lineWidth = s * 0.012;
  ctx.beginPath();
  ctx.arc(-s * 0.18, -s * 0.14, s * 0.05, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.18, -s * 0.19);
  ctx.lineTo(-s * 0.18, -s * 0.09);
  ctx.moveTo(-s * 0.23, -s * 0.14);
  ctx.lineTo(-s * 0.13, -s * 0.14);
  ctx.stroke();

  ctx.restore();

  const beltStart = {
    x: ammoLeft + s * 0.16,
    y: ammoTop - s * 0.01,
  };
  const beltControl = {
    x: x - s * 0.2 - sinR * s * 0.05,
    y: platformTop - s * 0.2 - Math.abs(cosR) * s * 0.03,
  };
  const beltFeed = projectTurretLocalPoint(
    gunPivotX,
    gunPivotY,
    rotation,
    squashY,
    s * 0.03,
    -s * 0.11,
  );

  const beltWave = isAttacking ? time * 20 : time * 3;
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const nextT = Math.min(1, (i + 1) / 7);
    const wobble = Math.sin(beltWave + i * 0.9) * s * 0.01;
    const nextWobble = Math.sin(beltWave + (i + 1) * 0.9) * s * 0.01;

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
    ctx.lineWidth = s * 0.015;
    ctx.beginPath();
    ctx.moveTo(linkX, linkY);
    ctx.lineTo(nextLinkX, nextLinkY);
    ctx.stroke();

    const bulletAngle = Math.atan2(nextLinkY - linkY, nextLinkX - linkX);
    ctx.fillStyle = "#caa24d";
    ctx.beginPath();
    ctx.ellipse(linkX, linkY, s * 0.02, s * 0.009, bulletAngle, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e5d0a7";
    ctx.beginPath();
    ctx.ellipse(
      linkX + Math.cos(bulletAngle) * s * 0.012,
      linkY + Math.sin(bulletAngle) * s * 0.012,
      s * 0.008,
      s * 0.004,
      bulletAngle,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  const muzzleTip = projectTurretLocalPoint(
    gunPivotX,
    gunPivotY,
    rotation,
    squashY,
    s * 0.78 - recoilOffset + barrelVibration,
    0,
  );
  const ejectPort = projectTurretLocalPoint(
    gunPivotX,
    gunPivotY,
    rotation,
    squashY,
    s * 0.02,
    s * 0.08,
  );
  const opticLens = projectTurretLocalPoint(
    gunPivotX,
    gunPivotY,
    rotation,
    squashY,
    s * 0.1,
    -s * 0.15,
  );

  if (targetPos) {
    const lockPulse = 0.18 + Math.sin(time * 8) * 0.05;
    ctx.strokeStyle = `rgba(255, 175, 80, ${lockPulse})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.setLineDash([4 * zoom, 3 * zoom]);
    ctx.beginPath();
    ctx.moveTo(opticLens.x, opticLens.y);
    ctx.lineTo(targetPos.x, targetPos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(255, 110, 80, ${0.55 + Math.sin(time * 7) * 0.18})`;
    ctx.beginPath();
    ctx.arc(targetPos.x, targetPos.y, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isAttacking && inBurst) {
    const flashIntensity = 0.62 + Math.sin(time * fireRate * Math.PI * 2) * 0.38;
    const flashSize = s * 0.14 * flashIntensity;
    const flashX = muzzleTip.x + cosR * s * 0.02;
    const flashY = muzzleTip.y + sinR * s * 0.02;
    const flashGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      flashSize,
    );
    flashGrad.addColorStop(0, `rgba(255,255,255,${flashIntensity})`);
    flashGrad.addColorStop(0.2, `rgba(255,236,174,${flashIntensity * 0.88})`);
    flashGrad.addColorStop(0.5, `rgba(255,170,78,${flashIntensity * 0.52})`);
    flashGrad.addColorStop(1, "rgba(255,80,20,0)");
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 205, 120, ${flashIntensity * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(flashX, flashY);
    ctx.lineTo(
      flashX + cosR * flashSize * 2.3 + sinR * flashSize * 0.45,
      flashY + sinR * flashSize * 1.2 - cosR * flashSize * 0.25,
    );
    ctx.lineTo(
      flashX + cosR * flashSize * 2.3 - sinR * flashSize * 0.45,
      flashY + sinR * flashSize * 1.2 + cosR * flashSize * 0.25,
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
      const tailX = headX - cosR * s * 0.16;
      const tailY = headY - sinR * s * 0.08;
      const tracerAlpha = 1 - tracerPhase * 0.75;
      const tracerGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      tracerGrad.addColorStop(0, "rgba(255, 210, 90, 0)");
      tracerGrad.addColorStop(
        0.5,
        `rgba(255, 218, 126, ${tracerAlpha * 0.45})`,
      );
      tracerGrad.addColorStop(1, `rgba(255, 245, 210, ${tracerAlpha})`);
      ctx.strokeStyle = tracerGrad;
      ctx.lineWidth = 2.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();
    }
  }

  if (isAttacking) {
    for (let casing = 0; casing < 4; casing++) {
      const casingPhase = (time * fireRate * 0.76 + casing * 0.23) % 1;
      if (casingPhase > 0.62) continue;

      const ejectProgress = casingPhase / 0.62;
      const ejectAngle = rotation + Math.PI * 0.72;
      const casingX =
        ejectPort.x +
        Math.cos(ejectAngle) * s * 0.28 * ejectProgress +
        Math.sin(time * 34 + casing * 2) * s * 0.01;
      const casingY =
        ejectPort.y +
        Math.sin(ejectAngle) * s * 0.12 * ejectProgress +
        s * 0.42 * ejectProgress * ejectProgress;
      const spin = time * 24 + casing;

      ctx.fillStyle = "#d0a54f";
      ctx.beginPath();
      ctx.ellipse(
        casingX,
        casingY,
        s * 0.016,
        s * 0.007,
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
        cosR * s * (0.06 + smokePhase * 0.08) -
        sinR * s * 0.04 * smoke;
      const smokeY =
        muzzleTip.y +
        sinR * s * (0.03 + smokePhase * 0.06) -
        smokePhase * s * 0.12;
      const smokeSize = s * (0.025 + smokePhase * 0.04);
      ctx.fillStyle = `rgba(132, 136, 144, ${(1 - smokePhase) * (0.18 + heatGlow * 0.12)})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const ammoLedPulse = 0.45 + Math.sin(time * 4.2) * 0.16;
  ctx.fillStyle = `rgba(110, 255, 160, ${ammoLedPulse})`;
  ctx.beginPath();
  ctx.arc(ammoLeft + s * 0.15, ammoTop + s * 0.03, s * 0.012, 0, Math.PI * 2);
  ctx.fill();

  if (heatGlow > 0.35) {
    const heatPulse = Math.sin(time * 14) > 0 ? 1 : 0.35;
    ctx.fillStyle = `rgba(255, 92, 48, ${heatPulse})`;
    ctx.beginPath();
    ctx.arc(
      gunPivotX + s * 0.08,
      gunPivotY - s * 0.12,
      s * 0.014,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.strokeStyle = engineerAccent;
  ctx.lineWidth = 1.4 * zoom;
  const emblemX = x - s * 0.07;
  const emblemY = platformTop + s * 0.125;
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, s * 0.032, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const toothAngle =
      (i / 6) * Math.PI * 2 + time * (isAttacking ? 1.7 : 0.35);
    ctx.beginPath();
    ctx.moveTo(
      emblemX + Math.cos(toothAngle) * s * 0.032,
      emblemY + Math.sin(toothAngle) * s * 0.032,
    );
    ctx.lineTo(
      emblemX + Math.cos(toothAngle) * s * 0.046,
      emblemY + Math.sin(toothAngle) * s * 0.046,
    );
    ctx.stroke();
  }

  ctx.restore();
}
