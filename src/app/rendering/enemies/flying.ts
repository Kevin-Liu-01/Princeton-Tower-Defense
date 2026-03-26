import { ISO_Y_RATIO } from "../../constants/isometric";
import { drawWindGusts, drawEmberSparks, drawShiftingSegments, drawOrbitingDebris, drawFloatingPiece, drawAnimatedTendril } from "./animationHelpers";
import { drawPathArm, drawPathLegs } from "./darkFantasyHelpers";

export function drawHarpyEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  // HARPY - Storm Fury, Aerial Predator of the Tempest
  // A terrifying avian huntress with iridescent plumage and deadly talons
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const wingFlap =
    Math.sin(time * 10) * 0.5 + (isAttacking ? attackIntensity * 0.4 : 0);
  const swoop = Math.sin(time * 3) * 4 * zoom;
  const breathe = Math.sin(time * 4) * size * 0.01;
  const featherRuffle = Math.sin(time * 6) * 0.1;
  const windIntensity = 0.3 + Math.sin(time * 2) * 0.15;

  // === LAYER 1: WIND CURRENTS / AERIAL AURA ===
  // Swirling wind trails
  ctx.strokeStyle = `rgba(167, 139, 250, ${windIntensity * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  for (let w = 0; w < 4; w++) {
    const windPhase = (time * 1.5 + w * 0.5) % 2;
    const windY = y + size * 0.3 - windPhase * size * 0.6;
    const windAlpha = windPhase < 1 ? windPhase : 2 - windPhase;
    ctx.strokeStyle = `rgba(167, 139, 250, ${windAlpha * 0.25})`;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6 + Math.sin(time * 3 + w) * size * 0.2, windY);
    ctx.quadraticCurveTo(
      x + Math.cos(time * 2 + w) * size * 0.3,
      windY - size * 0.1,
      x + size * 0.6 + Math.sin(time * 3 + w + 1) * size * 0.2,
      windY + size * 0.05,
    );
    ctx.stroke();
  }

  // Feather particles floating in air
  for (let f = 0; f < 6; f++) {
    const featherPhase = (time * 0.4 + f * 0.3) % 1;
    const featherX = x + Math.sin(time * 2 + f * 1.5) * size * 0.7;
    const featherY = y + size * 0.5 - featherPhase * size * 1.2;
    const featherAlpha = (1 - Math.abs(featherPhase - 0.5) * 2) * 0.4;
    const featherRot = time * 3 + f;

    ctx.save();
    ctx.translate(featherX, featherY);
    ctx.rotate(featherRot);
    ctx.fillStyle = `rgba(139, 92, 246, ${featherAlpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.015, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Wind swirl particles orbiting the wings
  for (let ws = 0; ws < 5; ws++) {
    const swirlAngle = time * 3.5 + ws * (Math.PI * 2) / 5;
    const swirlRadius = size * (0.55 + Math.sin(time * 1.2 + ws) * 0.1);
    const swirlX = x + Math.cos(swirlAngle) * swirlRadius;
    const swirlY =
      y - size * 0.05 + Math.sin(swirlAngle) * swirlRadius * 0.35 + swoop;
    const swirlAlpha = 0.2 + Math.sin(time * 2 + ws * 1.3) * 0.1;
    ctx.strokeStyle = `rgba(196, 181, 253, ${swirlAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(swirlX, swirlY, size * 0.025, swirlAngle, swirlAngle + Math.PI);
    ctx.stroke();
  }

  // === LAYER 3: MAGNIFICENT LEFT WING ===
  ctx.save();
  ctx.translate(x - size * 0.18, y - size * 0.08 + swoop);
  ctx.rotate(-0.35 - wingFlap);

  // Wing base gradient
  const leftWingGrad = ctx.createLinearGradient(0, 0, -size * 0.9, -size * 0.2);
  leftWingGrad.addColorStop(0, "#8b5cf6");
  leftWingGrad.addColorStop(0.3, "#7c3aed");
  leftWingGrad.addColorStop(0.6, "#6d28d9");
  leftWingGrad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = leftWingGrad;

  // Detailed wing shape with multiple feather sections
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Primary flight feathers
  ctx.lineTo(-size * 0.15, -size * 0.25);
  ctx.lineTo(-size * 0.35, -size * 0.42);
  ctx.lineTo(-size * 0.55, -size * 0.48);
  ctx.lineTo(-size * 0.75, -size * 0.45);
  ctx.lineTo(-size * 0.9, -size * 0.35);
  // Wing tip feathers (jagged)
  ctx.lineTo(-size * 0.95, -size * 0.25);
  ctx.lineTo(-size * 0.88, -size * 0.18);
  ctx.lineTo(-size * 0.92, -size * 0.1);
  ctx.lineTo(-size * 0.82, -size * 0.05);
  ctx.lineTo(-size * 0.85, size * 0.05);
  ctx.lineTo(-size * 0.72, size * 0.02);
  // Secondary feathers
  ctx.lineTo(-size * 0.65, size * 0.12);
  ctx.lineTo(-size * 0.5, size * 0.08);
  ctx.lineTo(-size * 0.45, size * 0.18);
  ctx.lineTo(-size * 0.3, size * 0.12);
  ctx.lineTo(-size * 0.25, size * 0.2);
  ctx.lineTo(-size * 0.1, size * 0.15);
  ctx.quadraticCurveTo(0, size * 0.12, 0, size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Wing membrane inner glow - pulses with wingbeat
  const leftMembraneAlpha = 0.1 + Math.abs(wingFlap) * 0.12;
  const leftMembraneGlow = ctx.createRadialGradient(
    -size * 0.45, -size * 0.15, 0,
    -size * 0.45, -size * 0.15, size * 0.45,
  );
  leftMembraneGlow.addColorStop(0, `rgba(167, 139, 250, ${leftMembraneAlpha * 1.5})`);
  leftMembraneGlow.addColorStop(0.5, `rgba(139, 92, 246, ${leftMembraneAlpha * 0.6})`);
  leftMembraneGlow.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = leftMembraneGlow;
  ctx.fill();

  // Wing bone structure
  ctx.strokeStyle = "#5b21b6";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.35, -size * 0.18);
  ctx.lineTo(-size * 0.6, -size * 0.25);
  ctx.stroke();

  // Wing finger bones
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -size * 0.18);
  ctx.lineTo(-size * 0.35, -size * 0.42);
  ctx.moveTo(-size * 0.6, -size * 0.25);
  ctx.lineTo(-size * 0.75, -size * 0.45);
  ctx.moveTo(-size * 0.6, -size * 0.25);
  ctx.lineTo(-size * 0.9, -size * 0.32);
  ctx.stroke();

  // Feather detail lines
  ctx.strokeStyle = "rgba(124, 58, 237, 0.5)";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.15 - i * size * 0.09, size * 0.02 - i * size * 0.02);
    ctx.lineTo(-size * 0.2 - i * size * 0.1, -size * 0.15 - i * size * 0.025);
    ctx.stroke();
  }

  // Overlapping feather layers - primary coverts
  ctx.fillStyle = "rgba(109, 40, 217, 0.5)";
  for (let fl = 0; fl < 6; fl++) {
    const flX = -size * 0.2 - fl * size * 0.12;
    const flY = -size * 0.02 - fl * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(flX + size * 0.06, flY);
    ctx.quadraticCurveTo(flX, flY - size * 0.06, flX - size * 0.06, flY + size * 0.02);
    ctx.quadraticCurveTo(flX, flY + size * 0.04, flX + size * 0.06, flY);
    ctx.fill();
  }
  // Secondary covert row
  ctx.fillStyle = "rgba(124, 58, 237, 0.35)";
  for (let fl = 0; fl < 5; fl++) {
    const flX = -size * 0.25 - fl * size * 0.12;
    const flY = -size * 0.12 - fl * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(flX + size * 0.05, flY);
    ctx.quadraticCurveTo(flX, flY - size * 0.05, flX - size * 0.05, flY + size * 0.015);
    ctx.quadraticCurveTo(flX, flY + size * 0.03, flX + size * 0.05, flY);
    ctx.fill();
  }

  // Tertial feather row - larger overlapping bezier feathers along inner wing
  ctx.fillStyle = "rgba(91, 33, 182, 0.4)";
  for (let tf = 0; tf < 7; tf++) {
    const tfX = -size * 0.12 - tf * size * 0.1;
    const tfY = size * 0.04 - tf * size * 0.015;
    const tfLen = size * (0.09 + Math.sin(tf * 0.7) * 0.015);
    ctx.beginPath();
    ctx.moveTo(tfX + size * 0.04, tfY);
    ctx.bezierCurveTo(
      tfX + size * 0.02, tfY - tfLen * 0.6,
      tfX - size * 0.03, tfY - tfLen * 0.8,
      tfX - size * 0.06, tfY - tfLen * 0.2,
    );
    ctx.bezierCurveTo(
      tfX - size * 0.04, tfY + tfLen * 0.15,
      tfX + size * 0.01, tfY + size * 0.03,
      tfX + size * 0.04, tfY,
    );
    ctx.fill();
  }
  // Tertial feather midrib lines
  ctx.strokeStyle = "rgba(76, 29, 149, 0.3)";
  ctx.lineWidth = 0.7 * zoom;
  for (let tf = 0; tf < 7; tf++) {
    const tfX = -size * 0.12 - tf * size * 0.1;
    const tfY = size * 0.04 - tf * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(tfX + size * 0.03, tfY);
    ctx.quadraticCurveTo(tfX - size * 0.01, tfY - size * 0.04, tfX - size * 0.05, tfY - size * 0.06);
    ctx.stroke();
  }

  // Iridescent highlights on feathers
  ctx.fillStyle = `rgba(196, 181, 253, ${0.3 + featherRuffle * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.5,
    -size * 0.2,
    size * 0.08,
    size * 0.15,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.75,
    -size * 0.25,
    size * 0.06,
    size * 0.12,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Fine feather barbs at wing tips
  ctx.strokeStyle = `rgba(91, 33, 182, ${0.35 + featherRuffle * 0.15})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let fb = 0; fb < 5; fb++) {
    const tipX = -size * 0.82 - fb * size * 0.025;
    const tipY = -size * 0.2 + fb * size * 0.05;
    const barb = Math.sin(time * 5 + fb) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - size * 0.06, tipY - size * 0.04 + barb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - size * 0.05, tipY + size * 0.03 + barb);
    ctx.stroke();
  }

  ctx.restore();

  // === LAYER 4: MAGNIFICENT RIGHT WING ===
  ctx.save();
  ctx.translate(x + size * 0.18, y - size * 0.08 + swoop);
  ctx.rotate(0.35 + wingFlap);

  // Wing gradient (mirrored)
  const rightWingGrad = ctx.createLinearGradient(0, 0, size * 0.9, -size * 0.2);
  rightWingGrad.addColorStop(0, "#8b5cf6");
  rightWingGrad.addColorStop(0.3, "#7c3aed");
  rightWingGrad.addColorStop(0.6, "#6d28d9");
  rightWingGrad.addColorStop(1, "#4c1d95");
  ctx.fillStyle = rightWingGrad;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.15, -size * 0.25);
  ctx.lineTo(size * 0.35, -size * 0.42);
  ctx.lineTo(size * 0.55, -size * 0.48);
  ctx.lineTo(size * 0.75, -size * 0.45);
  ctx.lineTo(size * 0.9, -size * 0.35);
  ctx.lineTo(size * 0.95, -size * 0.25);
  ctx.lineTo(size * 0.88, -size * 0.18);
  ctx.lineTo(size * 0.92, -size * 0.1);
  ctx.lineTo(size * 0.82, -size * 0.05);
  ctx.lineTo(size * 0.85, size * 0.05);
  ctx.lineTo(size * 0.72, size * 0.02);
  ctx.lineTo(size * 0.65, size * 0.12);
  ctx.lineTo(size * 0.5, size * 0.08);
  ctx.lineTo(size * 0.45, size * 0.18);
  ctx.lineTo(size * 0.3, size * 0.12);
  ctx.lineTo(size * 0.25, size * 0.2);
  ctx.lineTo(size * 0.1, size * 0.15);
  ctx.quadraticCurveTo(0, size * 0.12, 0, size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Wing membrane inner glow - pulses with wingbeat
  const rightMembraneAlpha = 0.1 + Math.abs(wingFlap) * 0.12;
  const rightMembraneGlow = ctx.createRadialGradient(
    size * 0.45, -size * 0.15, 0,
    size * 0.45, -size * 0.15, size * 0.45,
  );
  rightMembraneGlow.addColorStop(0, `rgba(167, 139, 250, ${rightMembraneAlpha * 1.5})`);
  rightMembraneGlow.addColorStop(0.5, `rgba(139, 92, 246, ${rightMembraneAlpha * 0.6})`);
  rightMembraneGlow.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = rightMembraneGlow;
  ctx.fill();

  // Wing bones
  ctx.strokeStyle = "#5b21b6";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.35, -size * 0.18);
  ctx.lineTo(size * 0.6, -size * 0.25);
  ctx.stroke();

  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.35, -size * 0.18);
  ctx.lineTo(size * 0.35, -size * 0.42);
  ctx.moveTo(size * 0.6, -size * 0.25);
  ctx.lineTo(size * 0.75, -size * 0.45);
  ctx.moveTo(size * 0.6, -size * 0.25);
  ctx.lineTo(size * 0.9, -size * 0.32);
  ctx.stroke();

  // Feather details
  ctx.strokeStyle = "rgba(124, 58, 237, 0.5)";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(size * 0.15 + i * size * 0.09, size * 0.02 - i * size * 0.02);
    ctx.lineTo(size * 0.2 + i * size * 0.1, -size * 0.15 - i * size * 0.025);
    ctx.stroke();
  }

  // Overlapping feather layers - primary coverts (mirrored)
  ctx.fillStyle = "rgba(109, 40, 217, 0.5)";
  for (let fl = 0; fl < 6; fl++) {
    const flX = size * 0.2 + fl * size * 0.12;
    const flY = -size * 0.02 - fl * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(flX - size * 0.06, flY);
    ctx.quadraticCurveTo(flX, flY - size * 0.06, flX + size * 0.06, flY + size * 0.02);
    ctx.quadraticCurveTo(flX, flY + size * 0.04, flX - size * 0.06, flY);
    ctx.fill();
  }
  // Secondary covert row (mirrored)
  ctx.fillStyle = "rgba(124, 58, 237, 0.35)";
  for (let fl = 0; fl < 5; fl++) {
    const flX = size * 0.25 + fl * size * 0.12;
    const flY = -size * 0.12 - fl * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(flX - size * 0.05, flY);
    ctx.quadraticCurveTo(flX, flY - size * 0.05, flX + size * 0.05, flY + size * 0.015);
    ctx.quadraticCurveTo(flX, flY + size * 0.03, flX - size * 0.05, flY);
    ctx.fill();
  }

  // Tertial feather row (mirrored) - larger overlapping bezier feathers
  ctx.fillStyle = "rgba(91, 33, 182, 0.4)";
  for (let tf = 0; tf < 7; tf++) {
    const tfX = size * 0.12 + tf * size * 0.1;
    const tfY = size * 0.04 - tf * size * 0.015;
    const tfLen = size * (0.09 + Math.sin(tf * 0.7) * 0.015);
    ctx.beginPath();
    ctx.moveTo(tfX - size * 0.04, tfY);
    ctx.bezierCurveTo(
      tfX - size * 0.02, tfY - tfLen * 0.6,
      tfX + size * 0.03, tfY - tfLen * 0.8,
      tfX + size * 0.06, tfY - tfLen * 0.2,
    );
    ctx.bezierCurveTo(
      tfX + size * 0.04, tfY + tfLen * 0.15,
      tfX - size * 0.01, tfY + size * 0.03,
      tfX - size * 0.04, tfY,
    );
    ctx.fill();
  }
  // Tertial feather midrib lines (mirrored)
  ctx.strokeStyle = "rgba(76, 29, 149, 0.3)";
  ctx.lineWidth = 0.7 * zoom;
  for (let tf = 0; tf < 7; tf++) {
    const tfX = size * 0.12 + tf * size * 0.1;
    const tfY = size * 0.04 - tf * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(tfX - size * 0.03, tfY);
    ctx.quadraticCurveTo(tfX + size * 0.01, tfY - size * 0.04, tfX + size * 0.05, tfY - size * 0.06);
    ctx.stroke();
  }

  // Iridescent highlights
  ctx.fillStyle = `rgba(196, 181, 253, ${0.3 + featherRuffle * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(
    size * 0.5,
    -size * 0.2,
    size * 0.08,
    size * 0.15,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Fine feather barbs at wing tips (mirrored)
  ctx.strokeStyle = `rgba(91, 33, 182, ${0.35 + featherRuffle * 0.15})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let fb = 0; fb < 5; fb++) {
    const tipX = size * 0.82 + fb * size * 0.025;
    const tipY = -size * 0.2 + fb * size * 0.05;
    const barb = Math.sin(time * 5 + fb) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + size * 0.06, tipY - size * 0.04 + barb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + size * 0.05, tipY + size * 0.03 + barb);
    ctx.stroke();
  }

  ctx.restore();

  // === ANIMATED LEGS (talon-like dangling, fast kick) ===
  drawPathLegs(ctx, x, y + size * 0.25 + swoop, size, time, zoom, {
    color: "#78350f",
    colorDark: "#451a03",
    footColor: "#1a1a2e",
    strideSpeed: 10,
    strideAmt: 0.45,
    legLen: 0.2,
    width: 0.04,
    style: "fleshy",
  });

  // === ANIMATED CLAWS — talons reaching forward ===
  drawPathArm(ctx, x - size * 0.18, y + size * 0.05 + swoop, size, time, zoom, -1, {
    color: "#8b5cf6",
    colorDark: "#6d28d9",
    handColor: "#78350f",
    handRadius: 0.03,
    shoulderAngle: -0.8 + Math.sin(time * 4) * 0.15 + (isAttacking ? -attackIntensity * 0.5 : 0),
    elbowAngle: 0.3 + Math.sin(time * 5 + 0.8) * 0.15,
    upperLen: 0.14,
    foreLen: 0.12,
    width: 0.04,
    style: "fleshy",
  });
  drawPathArm(ctx, x + size * 0.18, y + size * 0.05 + swoop, size, time, zoom, 1, {
    color: "#8b5cf6",
    colorDark: "#6d28d9",
    handColor: "#78350f",
    handRadius: 0.03,
    shoulderAngle: 0.8 + Math.sin(time * 4 + Math.PI) * 0.15 + (isAttacking ? attackIntensity * 0.5 : 0),
    elbowAngle: 0.3 + Math.sin(time * 5 + 2.5) * 0.15,
    upperLen: 0.14,
    foreLen: 0.12,
    width: 0.04,
    attackExtra: attackIntensity,
    style: "fleshy",
  });

  // === LAYER 5: ELEGANT AVIAN BODY ===
  // Body gradient with feather pattern
  const bodyGrad = ctx.createRadialGradient(
    x,
    y - size * 0.05 + swoop,
    0,
    x,
    y + size * 0.1 + swoop,
    size * 0.35,
  );
  bodyGrad.addColorStop(0, "#a78bfa");
  bodyGrad.addColorStop(0.4, "#8b5cf6");
  bodyGrad.addColorStop(0.7, "#7c3aed");
  bodyGrad.addColorStop(1, "#6d28d9");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.02 + swoop + breathe,
    size * 0.22,
    size * 0.32,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Body feather texture
  ctx.strokeStyle = "rgba(91, 33, 182, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const fX = x - size * 0.1 + col * size * 0.1;
      const fY = y - size * 0.1 + row * size * 0.1 + swoop;
      ctx.beginPath();
      ctx.arc(fX, fY, size * 0.04, Math.PI * 0.8, Math.PI * 0.2, true);
      ctx.stroke();
    }
  }

  // Feathered chest plumage (layered)
  const chestGrad = ctx.createRadialGradient(
    x,
    y - size * 0.08 + swoop,
    0,
    x,
    y + size * 0.05 + swoop,
    size * 0.18,
  );
  chestGrad.addColorStop(0, "#f5f3ff");
  chestGrad.addColorStop(0.5, "#ede9fe");
  chestGrad.addColorStop(1, "#ddd6fe");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.02 + swoop,
    size * 0.14,
    size * 0.18,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Chest feather details
  ctx.strokeStyle = "rgba(139, 92, 246, 0.25)";
  ctx.lineWidth = 1 * zoom;
  for (let cf = 0; cf < 5; cf++) {
    ctx.beginPath();
    ctx.arc(
      x,
      y - size * 0.12 + cf * size * 0.05 + swoop,
      size * 0.08,
      Math.PI * 0.7,
      Math.PI * 0.3,
      true,
    );
    ctx.stroke();
  }

  // === LAYER 6: FIERCE HEAD AND FACE ===
  // Neck feathers
  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.22 + swoop,
    size * 0.12,
    size * 0.1,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Head base
  const headGrad = ctx.createRadialGradient(
    x,
    y - size * 0.36 + swoop,
    0,
    x,
    y - size * 0.32 + swoop,
    size * 0.16,
  );
  headGrad.addColorStop(0, "#fef3c7");
  headGrad.addColorStop(0.6, "#fde68a");
  headGrad.addColorStop(1, "#fcd34d");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.34 + swoop, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Face markings (fierce pattern)
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 1.5 * zoom;
  // Eye stripes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.38 + swoop);
  ctx.lineTo(x - size * 0.06, y - size * 0.36 + swoop);
  ctx.moveTo(x + size * 0.12, y - size * 0.38 + swoop);
  ctx.lineTo(x + size * 0.06, y - size * 0.36 + swoop);
  ctx.stroke();

  // Crown feathers (elaborate crest)
  const crownColors = ["#7c3aed", "#8b5cf6", "#a78bfa", "#7c3aed", "#6d28d9"];
  for (let c = 0; c < 5; c++) {
    const crownAngle = -Math.PI * 0.7 + c * Math.PI * 0.1;
    const crownLen =
      size * (0.2 + (c === 2 ? 0.1 : 0)) + Math.sin(time * 5 + c) * size * 0.02;
    ctx.fillStyle = crownColors[c];
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(crownAngle) * size * 0.1,
      y - size * 0.44 + swoop + Math.sin(crownAngle) * size * 0.05,
    );
    ctx.quadraticCurveTo(
      x + Math.cos(crownAngle - 0.2) * crownLen * 0.6,
      y - size * 0.5 + swoop + Math.sin(crownAngle) * crownLen * 0.3,
      x + Math.cos(crownAngle) * crownLen,
      y - size * 0.44 - crownLen * 0.8 + swoop,
    );
    ctx.quadraticCurveTo(
      x + Math.cos(crownAngle + 0.2) * crownLen * 0.6,
      y - size * 0.5 + swoop + Math.sin(crownAngle) * crownLen * 0.3,
      x + Math.cos(crownAngle + 0.15) * size * 0.1,
      y - size * 0.44 + swoop + Math.sin(crownAngle + 0.15) * size * 0.05,
    );
    ctx.fill();
  }

  // Head plumage crest - 4 short upright feathers at crown
  const plumeColors = ["#7c3aed", "#a78bfa", "#8b5cf6", "#6d28d9"];
  for (let p = 0; p < 4; p++) {
    const pAngle = -Math.PI * 0.5 + (p - 1.5) * 0.2;
    const pBaseX = x + (p - 1.5) * size * 0.03;
    const pBaseY = y - size * 0.47 + swoop;
    const pHeight = size * (0.08 + (p === 1 || p === 2 ? 0.03 : 0));
    const pSway = Math.sin(time * 6 + p * 1.2) * size * 0.008;
    ctx.fillStyle = plumeColors[p];
    ctx.beginPath();
    ctx.moveTo(pBaseX - size * 0.01, pBaseY);
    ctx.bezierCurveTo(
      pBaseX - size * 0.012 + pSway * 0.5, pBaseY - pHeight * 0.5,
      pBaseX + pSway, pBaseY - pHeight * 0.85,
      pBaseX + pSway * 1.2, pBaseY - pHeight,
    );
    ctx.bezierCurveTo(
      pBaseX + size * 0.005 + pSway, pBaseY - pHeight * 0.85,
      pBaseX + size * 0.012 + pSway * 0.5, pBaseY - pHeight * 0.5,
      pBaseX + size * 0.01, pBaseY,
    );
    ctx.fill();
    // Feather rachis (central shaft)
    ctx.strokeStyle = "rgba(76, 29, 149, 0.4)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(pBaseX, pBaseY);
    ctx.quadraticCurveTo(pBaseX + pSway * 0.6, pBaseY - pHeight * 0.6, pBaseX + pSway * 1.2, pBaseY - pHeight);
    ctx.stroke();
  }

  // Fierce eyes (predator gaze)
  // Eye glow (gradient instead of shadow)
  const eyeGlowL = ctx.createRadialGradient(
    x - size * 0.06,
    y - size * 0.36 + swoop,
    0,
    x - size * 0.06,
    y - size * 0.36 + swoop,
    size * 0.06,
  );
  eyeGlowL.addColorStop(0, "#fbbf24");
  eyeGlowL.addColorStop(0.5, "rgba(251, 191, 36, 0.4)");
  eyeGlowL.addColorStop(1, "rgba(251, 191, 36, 0)");
  ctx.fillStyle = eyeGlowL;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06,
    y - size * 0.36 + swoop,
    size * 0.06,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.06,
    y - size * 0.36 + swoop,
    size * 0.06,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye whites
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.36 + swoop,
    size * 0.04,
    size * 0.03,
    -0.25,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.36 + swoop,
    size * 0.04,
    size * 0.03,
    0.25,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Iris
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.055,
    y - size * 0.36 + swoop,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.055,
    y - size * 0.36 + swoop,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Pupils (vertical slit like bird of prey)
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.055,
    y - size * 0.36 + swoop,
    size * 0.008,
    size * 0.018,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.055,
    y - size * 0.36 + swoop,
    size * 0.008,
    size * 0.018,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.065,
    y - size * 0.37 + swoop,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.045,
    y - size * 0.37 + swoop,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Enhanced predator eye glow - pulsing "laser eyes" effect
  const laserPulse = 0.4 + Math.sin(time * 6) * 0.15 + (isAttacking ? attackIntensity * 0.3 : 0);
  for (let eye = 0; eye < 2; eye++) {
    const eyeCX = eye === 0 ? x - size * 0.055 : x + size * 0.055;
    const eyeCY = y - size * 0.36 + swoop;
    const laserGlow = ctx.createRadialGradient(eyeCX, eyeCY, 0, eyeCX, eyeCY, size * 0.08);
    laserGlow.addColorStop(0, `rgba(251, 191, 36, ${laserPulse * 0.6})`);
    laserGlow.addColorStop(0.3, `rgba(245, 158, 11, ${laserPulse * 0.3})`);
    laserGlow.addColorStop(0.6, `rgba(217, 119, 6, ${laserPulse * 0.12})`);
    laserGlow.addColorStop(1, "rgba(217, 119, 6, 0)");
    ctx.fillStyle = laserGlow;
    ctx.beginPath();
    ctx.arc(eyeCX, eyeCY, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sharp beak (detailed)
  // Upper beak
  const beakGrad = ctx.createLinearGradient(
    x,
    y - size * 0.3 + swoop,
    x,
    y - size * 0.2 + swoop,
  );
  beakGrad.addColorStop(0, "#d97706");
  beakGrad.addColorStop(0.5, "#f59e0b");
  beakGrad.addColorStop(1, "#fbbf24");
  ctx.fillStyle = beakGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + swoop);
  ctx.quadraticCurveTo(
    x - size * 0.06,
    y - size * 0.26 + swoop,
    x - size * 0.04,
    y - size * 0.22 + swoop,
  );
  ctx.lineTo(x, y - size * 0.25 + swoop);
  ctx.lineTo(x + size * 0.04, y - size * 0.22 + swoop);
  ctx.quadraticCurveTo(
    x + size * 0.06,
    y - size * 0.26 + swoop,
    x,
    y - size * 0.3 + swoop,
  );
  ctx.fill();
  // Beak hook - curved raptor tip
  ctx.fillStyle = "#92400e";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25 + swoop);
  ctx.quadraticCurveTo(x - size * 0.01, y - size * 0.22 + swoop, x - size * 0.015, y - size * 0.21 + swoop);
  ctx.lineTo(x + size * 0.015, y - size * 0.21 + swoop);
  ctx.quadraticCurveTo(x + size * 0.01, y - size * 0.22 + swoop, x, y - size * 0.25 + swoop);
  ctx.fill();
  // Beak ridge line
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + swoop);
  ctx.lineTo(x, y - size * 0.25 + swoop);
  ctx.stroke();
  // Lower beak
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.24 + swoop);
  ctx.quadraticCurveTo(x, y - size * 0.21 + swoop, x + size * 0.03, y - size * 0.24 + swoop);
  ctx.fill();
  // Nostril
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.27 + swoop,
    size * 0.008,
    size * 0.004,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Sonic screech visual - concentric arcs from beak
  const screechBase = isAttacking ? 0.4 + attackIntensity * 0.5 : 0.15 + Math.sin(time * 3) * 0.05;
  for (let ring = 0; ring < 4; ring++) {
    const ringPhase = (time * 2.5 + ring * 0.4) % 1.5;
    const ringRadius = size * (0.06 + ringPhase * 0.2);
    const ringAlpha = screechBase * (1 - ringPhase / 1.5) * 0.5;
    ctx.strokeStyle = `rgba(167, 139, 250, ${ringAlpha})`;
    ctx.lineWidth = (1.5 - ringPhase * 0.8) * zoom;
    ctx.beginPath();
    ctx.arc(
      x, y - size * 0.23 + swoop,
      ringRadius,
      Math.PI * 0.15, Math.PI * 0.85,
    );
    ctx.stroke();
  }

  // === LAYER 7: POWERFUL TALONED LEGS ===
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 3 * zoom;

  // Left leg with segments
  const leftLegX = x - size * 0.1;
  const legSwing = Math.sin(time * 8) * size * 0.02;
  ctx.beginPath();
  ctx.moveTo(leftLegX, y + size * 0.28 + swoop);
  ctx.lineTo(leftLegX - size * 0.02, y + size * 0.38 + swoop + legSwing);
  ctx.lineTo(leftLegX, y + size * 0.48 + swoop);
  ctx.stroke();

  // Right leg
  const rightLegX = x + size * 0.1;
  ctx.beginPath();
  ctx.moveTo(rightLegX, y + size * 0.28 + swoop);
  ctx.lineTo(rightLegX + size * 0.02, y + size * 0.38 + swoop - legSwing);
  ctx.lineTo(rightLegX, y + size * 0.48 + swoop);
  ctx.stroke();

  // Leg scales - overlapping scutes
  for (let leg = 0; leg < 2; leg++) {
    const lx = leg === 0 ? leftLegX : rightLegX;
    for (let s = 0; s < 5; s++) {
      const scaleY = y + size * 0.3 + s * size * 0.04 + swoop;
      ctx.fillStyle = s % 2 === 0 ? "#d97706" : "#b45309";
      ctx.beginPath();
      ctx.moveTo(lx - size * 0.018, scaleY);
      ctx.quadraticCurveTo(lx, scaleY - size * 0.015, lx + size * 0.018, scaleY);
      ctx.quadraticCurveTo(lx, scaleY + size * 0.01, lx - size * 0.018, scaleY);
      ctx.fill();
    }
    // Ankle joint knob
    ctx.fillStyle = "#92400e";
    ctx.beginPath();
    ctx.arc(lx, y + size * 0.38 + swoop, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Deadly talons (detailed)
  for (let leg = 0; leg < 2; leg++) {
    const talonX = leg === 0 ? leftLegX : rightLegX;
    const talonBase = y + size * 0.48 + swoop;

    // Foot pad
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.ellipse(talonX, talonBase, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();

    // Articulated toe segments with knuckle joints (3 forward, 1 back)
    const toeAngles = [-0.35, 0, 0.35, Math.PI + 0.1];
    const toeLengths = [size * 0.055, size * 0.06, size * 0.055, size * 0.04];
    for (let toe = 0; toe < 4; toe++) {
      const tAngle = toeAngles[toe];
      const isBack = toe === 3;
      const phalanxCount = isBack ? 2 : 3;
      const phalanxLen = toeLengths[toe] / phalanxCount;
      let pX = talonX + Math.cos(tAngle + Math.PI * 0.5) * size * 0.025;
      let pY = talonBase;

      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2.2 * zoom;
      for (let ph = 0; ph < phalanxCount; ph++) {
        const nextPX = pX + Math.cos(tAngle) * phalanxLen * (isBack ? -0.7 : 1);
        const nextPY = pY + Math.sin(Math.PI * 0.5 + tAngle * 0.3) * phalanxLen * (isBack ? 0.5 : 0.8);
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.lineTo(nextPX, nextPY);
        ctx.stroke();
        // Knuckle joint
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.arc(nextPX, nextPY, size * 0.01, 0, Math.PI * 2);
        ctx.fill();
        pX = nextPX;
        pY = nextPY;
      }
    }

    // Individual talons
    for (let claw = 0; claw < 4; claw++) {
      const clawAngle = -0.4 + claw * 0.27;
      const clawLen = claw === 1 || claw === 2 ? size * 0.1 : size * 0.08;

      // Claw bone
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.moveTo(
        talonX + Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03,
        talonBase,
      );
      ctx.lineTo(
        talonX +
          Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 +
          Math.cos(clawAngle) * clawLen * 0.5,
        talonBase + Math.sin(Math.PI * 0.5 + clawAngle * 0.3) * clawLen * 0.6,
      );
      // Claw tip (curved hook)
      ctx.quadraticCurveTo(
        talonX +
          Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 +
          Math.cos(clawAngle - 0.2) * clawLen * 0.8,
        talonBase + clawLen * 0.9,
        talonX +
          Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 +
          Math.cos(clawAngle - 0.4) * clawLen,
        talonBase + clawLen * 0.75,
      );
      ctx.fill();

      // Claw highlight
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.moveTo(
        talonX +
          Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 +
          Math.cos(clawAngle - 0.3) * clawLen * 0.85,
        talonBase + clawLen * 0.82,
      );
      ctx.lineTo(
        talonX +
          Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 +
          Math.cos(clawAngle - 0.4) * clawLen,
        talonBase + clawLen * 0.75,
      );
      ctx.lineTo(
        talonX +
          Math.cos(clawAngle + Math.PI * 0.5) * size * 0.03 +
          Math.cos(clawAngle - 0.5) * clawLen * 0.9,
        talonBase + clawLen * 0.7,
      );
      ctx.fill();
    }
  }

  // Feather trail particles - drift downward and fade
  for (let ft = 0; ft < 5; ft++) {
    const trailPhase = (time * 0.6 + ft * 0.35) % 1.5;
    const trailX = x + Math.sin(time * 1.5 + ft * 2.1) * size * 0.25;
    const trailY = y + size * 0.1 + trailPhase * size * 0.5 + swoop;
    const trailAlpha = (1 - trailPhase / 1.5) * 0.45;
    const trailRot = time * 2 + ft * 1.3;
    const trailSize = size * (0.02 + Math.sin(time + ft) * 0.005);

    ctx.save();
    ctx.translate(trailX, trailY);
    ctx.rotate(trailRot);
    ctx.fillStyle = `rgba(167, 139, 250, ${trailAlpha})`;
    ctx.beginPath();
    ctx.moveTo(0, -trailSize * 2);
    ctx.quadraticCurveTo(trailSize * 0.8, -trailSize * 0.5, trailSize * 0.3, trailSize * 1.5);
    ctx.lineTo(0, trailSize);
    ctx.quadraticCurveTo(-trailSize * 0.8, -trailSize * 0.5, 0, -trailSize * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(124, 58, 237, ${trailAlpha * 0.6})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -trailSize * 2);
    ctx.lineTo(0, trailSize * 1.5);
    ctx.stroke();
    ctx.restore();
  }

  // === LAYER 8: ATTACK DIVE EFFECT ===
  if (isAttacking) {
    // Speed lines
    ctx.strokeStyle = `rgba(139, 92, 246, ${attackIntensity * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    for (let sl = 0; sl < 5; sl++) {
      const slX = x - size * 0.3 + sl * size * 0.15;
      ctx.beginPath();
      ctx.moveTo(slX, y - size * 0.5 + swoop);
      ctx.lineTo(slX + size * 0.05, y + size * 0.3 + swoop);
      ctx.stroke();
    }

    // Talon strike trail
    ctx.fillStyle = `rgba(251, 191, 36, ${attackIntensity * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.15, y + size * 0.6 + swoop);
    ctx.lineTo(x, y + size * 0.8 + swoop);
    ctx.lineTo(x + size * 0.15, y + size * 0.6 + swoop);
    ctx.fill();
  }

  // === WIND GUSTS ===
  drawWindGusts(ctx, x, y + swoop, size * 0.3, time, zoom, {
    color: "rgba(167, 139, 250, 0.4)",
    count: 5,
    speed: 2.5,
    maxAlpha: 0.35,
    gustLength: 0.6,
  });

  // === FLOATING FEATHER SHARDS (orbiting) ===
  drawShiftingSegments(ctx, x, y + swoop, size, time, zoom, {
    color: "#a78bfa",
    colorAlt: "#7c3aed",
    count: 5,
    orbitRadius: 0.45,
    segmentSize: 0.03,
    orbitSpeed: 1.8,
    shape: "shard",
  });

  // === ORBITING WIND PARTICLES ===
  drawOrbitingDebris(ctx, x, y + swoop, size, time, zoom, {
    color: "rgba(196, 181, 253, 0.6)",
    glowColor: "rgba(167, 139, 250, 0.25)",
    count: 4,
    speed: 2.5,
    particleSize: 0.015,
    minRadius: 0.3,
    maxRadius: 0.55,
    trailLen: 2,
  });
}

export function drawWyvernEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  // WYVERN - Ancient Draconic Terror with Venomous Breath
  // A colossal flying predator wreathed in toxic miasma
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0

  // Core animation variables
  const wingFlap =
    Math.sin(time * 5) * 0.4 +
    (isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.2 : 0);
  const breathe = Math.sin(time * 2) * size * 0.03;
  const tailSwing =
    Math.sin(time * 2.5) * 0.25 + (isAttacking ? attackIntensity * 0.3 : 0);
  const neckSway = Math.sin(time * 1.8) * size * 0.02;
  const hoverBob = Math.sin(time * 3) * size * 0.015;

  // Attack animation specifics
  const lungeLean = isAttacking ? attackIntensity * size * 0.1 : 0;
  const jawOpen = isAttacking
    ? attackIntensity * 0.4
    : 0.1 + Math.sin(time * 4) * 0.05;
  const venomIntensity = isAttacking
    ? 0.6 + attackIntensity * 0.4
    : 0.3 + Math.sin(time * 3) * 0.15;

  // === LAYER 1: TOXIC MIASMA AURA ===
  // Outer poison cloud
  for (let ring = 0; ring < 4; ring++) {
    const ringSize = size * (0.7 + ring * 0.2) * (1 + venomIntensity * 0.2);
    const ringAlpha = (0.12 - ring * 0.025) * (0.8 + venomIntensity * 0.4);
    ctx.fillStyle = `rgba(74, 222, 128, ${ringAlpha})`;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const wobble = Math.sin(a * 4 + time * 2 + ring) * size * 0.04;
      const rx = x + Math.cos(a) * (ringSize + wobble);
      const ry = y + Math.sin(a) * (ringSize * 0.5 + wobble * 0.4) + hoverBob;
      if (a === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Inner power aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  auraGrad.addColorStop(
    0,
    `rgba(16, 185, 129, ${0.25 + venomIntensity * 0.15})`,
  );
  auraGrad.addColorStop(
    0.4,
    `rgba(5, 150, 105, ${0.15 + venomIntensity * 0.1})`,
  );
  auraGrad.addColorStop(0.7, `rgba(4, 120, 87, ${0.08})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + hoverBob, size * 0.85, size * 0.85 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 2: MASSIVE SEGMENTED TAIL ===
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.15 + breathe + hoverBob);
  ctx.rotate(tailSwing);

  // Tail segments for more detail
  const tailSegments = 6;
  for (let seg = 0; seg < tailSegments; seg++) {
    const segX = seg * size * 0.12;
    const segY = Math.sin(time * 3 + seg * 0.5) * size * 0.02;
    const segSize = size * (0.12 - seg * 0.012);
    const segGrad = ctx.createRadialGradient(
      segX,
      segY,
      0,
      segX,
      segY,
      segSize,
    );
    segGrad.addColorStop(0, "#10b981");
    segGrad.addColorStop(0.6, "#059669");
    segGrad.addColorStop(1, "#047857");
    ctx.fillStyle = segGrad;
    ctx.beginPath();
    ctx.ellipse(segX, segY, segSize, segSize * 0.7, seg * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Joint line between segments
    if (seg > 0) {
      ctx.strokeStyle = "rgba(4, 120, 87, 0.5)";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(segX - size * 0.06, segY, segSize * 0.8, segSize * 0.5, seg * 0.08, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Segment ridge scales
    if (seg < tailSegments - 1) {
      ctx.fillStyle = "#065f46";
      ctx.beginPath();
      ctx.moveTo(segX, segY - segSize * 0.6);
      ctx.lineTo(segX + size * 0.03, segY - segSize * 0.9);
      ctx.lineTo(segX + size * 0.06, segY - segSize * 0.6);
      ctx.fill();
    }
    // Ventral scale plates on tail underside
    ctx.fillStyle = "rgba(167, 243, 208, 0.2)";
    ctx.beginPath();
    ctx.ellipse(segX, segY + segSize * 0.35, segSize * 0.5, segSize * 0.2, seg * 0.08, 0, Math.PI);
    ctx.fill();
  }

  // Articulated overlapping ring bands between tail segments
  ctx.strokeStyle = "rgba(4, 120, 87, 0.45)";
  ctx.lineWidth = 1.2 * zoom;
  for (let seg = 0; seg < tailSegments - 1; seg++) {
    const ringX = seg * size * 0.12 + size * 0.06;
    const ringY = Math.sin(time * 3 + seg * 0.5 + 0.25) * size * 0.02;
    const ringSize = size * (0.11 - seg * 0.012);
    for (let r = 0; r < 3; r++) {
      const rOff = (r - 1) * size * 0.012;
      const rScale = 1 - Math.abs(r - 1) * 0.15;
      ctx.beginPath();
      ctx.ellipse(
        ringX + rOff, ringY,
        ringSize * 0.65 * rScale, ringSize * 0.45 * rScale,
        seg * 0.08,
        0, Math.PI * 2,
      );
      ctx.stroke();
    }
  }
  // Ring band fill for depth
  ctx.fillStyle = "rgba(5, 150, 105, 0.12)";
  for (let seg = 0; seg < tailSegments - 1; seg++) {
    const ringX = seg * size * 0.12 + size * 0.06;
    const ringY = Math.sin(time * 3 + seg * 0.5 + 0.25) * size * 0.02;
    const ringSize = size * (0.11 - seg * 0.012);
    ctx.beginPath();
    ctx.ellipse(ringX, ringY, ringSize * 0.65, ringSize * 0.45, seg * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Deadly tail spike cluster
  const spikeBase = (tailSegments - 1) * size * 0.12;
  ctx.fillStyle = "#0f172a";
  // Main spike
  ctx.beginPath();
  ctx.moveTo(spikeBase, 0);
  ctx.lineTo(spikeBase + size * 0.25, -size * 0.05);
  ctx.lineTo(spikeBase + size * 0.22, size * 0.02);
  ctx.fill();
  // Side spikes
  ctx.beginPath();
  ctx.moveTo(spikeBase + size * 0.08, -size * 0.03);
  ctx.lineTo(spikeBase + size * 0.18, -size * 0.12);
  ctx.lineTo(spikeBase + size * 0.15, -size * 0.02);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(spikeBase + size * 0.08, size * 0.02);
  ctx.lineTo(spikeBase + size * 0.18, size * 0.1);
  ctx.lineTo(spikeBase + size * 0.15, size * 0.02);
  ctx.fill();
  // Venom drip from spike
  const dripPhase = (time * 2) % 1;
  ctx.fillStyle = `rgba(74, 222, 128, ${0.7 - dripPhase * 0.5})`;
  ctx.beginPath();
  ctx.arc(
    spikeBase + size * 0.24,
    -size * 0.05 + dripPhase * size * 0.08,
    size * 0.015 * (1 - dripPhase * 0.6),
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Additional toxic drips along tail segments
  for (let td = 0; td < 3; td++) {
    const tdPhase = (time * 1.5 + td * 0.6) % 1.2;
    const tdSegX = (td + 2) * size * 0.12;
    const tdAlpha = Math.max(0, 0.5 - tdPhase * 0.35) * venomIntensity;
    ctx.fillStyle = `rgba(52, 211, 153, ${tdAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      tdSegX,
      size * 0.06 + tdPhase * size * 0.06,
      size * 0.01 * (1 - tdPhase * 0.4),
      size * 0.018 * (1 - tdPhase * 0.3),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Enhanced venom drips - larger glowing teardrop droplets with trail
  for (let ed = 0; ed < 4; ed++) {
    const edPhase = (time * 1.2 + ed * 0.5) % 1.8;
    const edSegX = (ed + 1) * size * 0.14;
    const edY = size * 0.04 + edPhase * size * 0.12;
    const edAlpha = Math.max(0, 0.6 - edPhase * 0.3) * venomIntensity;
    const dropRadius = size * 0.018 * (1 - edPhase * 0.25);

    const dripGlow = ctx.createRadialGradient(edSegX, edY, 0, edSegX, edY, dropRadius * 3);
    dripGlow.addColorStop(0, `rgba(74, 222, 128, ${edAlpha * 0.7})`);
    dripGlow.addColorStop(0.5, `rgba(52, 211, 153, ${edAlpha * 0.25})`);
    dripGlow.addColorStop(1, "rgba(52, 211, 153, 0)");
    ctx.fillStyle = dripGlow;
    ctx.beginPath();
    ctx.arc(edSegX, edY, dropRadius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(74, 222, 128, ${edAlpha})`;
    ctx.beginPath();
    ctx.moveTo(edSegX, edY - dropRadius * 1.5);
    ctx.quadraticCurveTo(edSegX + dropRadius, edY, edSegX, edY + dropRadius);
    ctx.quadraticCurveTo(edSegX - dropRadius, edY, edSegX, edY - dropRadius * 1.5);
    ctx.fill();

    ctx.strokeStyle = `rgba(52, 211, 153, ${edAlpha * 0.4})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(edSegX, size * 0.04);
    ctx.lineTo(edSegX, edY - dropRadius * 1.5);
    ctx.stroke();
  }

  // Venom glow on tail tip
  const glowPulse = 0.3 + Math.sin(time * 4) * 0.15 + venomIntensity * 0.2;
  const tipGlowGrad = ctx.createRadialGradient(
    spikeBase + size * 0.22,
    -size * 0.03,
    0,
    spikeBase + size * 0.22,
    -size * 0.03,
    size * 0.08,
  );
  tipGlowGrad.addColorStop(0, `rgba(74, 222, 128, ${glowPulse})`);
  tipGlowGrad.addColorStop(0.5, `rgba(52, 211, 153, ${glowPulse * 0.4})`);
  tipGlowGrad.addColorStop(1, "rgba(52, 211, 153, 0)");
  ctx.fillStyle = tipGlowGrad;
  ctx.beginPath();
  ctx.arc(spikeBase + size * 0.22, -size * 0.03, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // === LAYER 3: MAGNIFICENT WINGS ===
  // Left wing (detailed with membrane and bones)
  ctx.save();
  ctx.translate(x - size * 0.22, y - size * 0.12 + breathe + hoverBob);
  ctx.rotate(-0.45 - wingFlap);

  // Wing membrane gradient
  const leftWingGrad = ctx.createLinearGradient(
    0,
    0,
    -size * 0.95,
    -size * 0.2,
  );
  leftWingGrad.addColorStop(0, "#10b981");
  leftWingGrad.addColorStop(0.3, "#059669");
  leftWingGrad.addColorStop(0.6, "#047857");
  leftWingGrad.addColorStop(1, "#065f46");
  ctx.fillStyle = leftWingGrad;

  // Main wing membrane with detailed shape
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Wing finger 1
  ctx.lineTo(-size * 0.15, -size * 0.35);
  ctx.lineTo(-size * 0.35, -size * 0.48);
  // Wing finger 2
  ctx.lineTo(-size * 0.55, -size * 0.45);
  ctx.lineTo(-size * 0.78, -size * 0.38);
  // Wing finger 3
  ctx.lineTo(-size * 0.92, -size * 0.25);
  ctx.lineTo(-size * 0.98, -size * 0.08);
  // Lower edge with membrane scallops
  ctx.lineTo(-size * 0.88, size * 0.02);
  ctx.lineTo(-size * 0.75, size * 0.08);
  ctx.lineTo(-size * 0.6, size * 0.05);
  ctx.lineTo(-size * 0.68, size * 0.18);
  ctx.lineTo(-size * 0.5, size * 0.15);
  ctx.lineTo(-size * 0.35, size * 0.12);
  ctx.lineTo(-size * 0.42, size * 0.22);
  ctx.lineTo(-size * 0.25, size * 0.18);
  ctx.quadraticCurveTo(-size * 0.1, size * 0.2, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Wing bone structure with joint detail
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 3.5 * zoom;
  // Main arm bone
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.35, -size * 0.15);
  ctx.stroke();
  // Shoulder joint knob
  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Elbow joint knob
  ctx.beginPath();
  ctx.arc(-size * 0.35, -size * 0.15, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Finger bones
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -size * 0.15);
  ctx.lineTo(-size * 0.35, -size * 0.48);
  ctx.moveTo(-size * 0.35, -size * 0.15);
  ctx.lineTo(-size * 0.78, -size * 0.38);
  ctx.moveTo(-size * 0.35, -size * 0.15);
  ctx.lineTo(-size * 0.95, -size * 0.15);
  ctx.stroke();
  // Finger joint knobs
  ctx.fillStyle = "#065f46";
  const fingerJoints = [
    [-0.35, -0.32], [-0.56, -0.27], [-0.65, -0.15],
  ];
  for (const [jx, jy] of fingerJoints) {
    ctx.beginPath();
    ctx.arc(jx * size, jy * size, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }
  // Wing claw at joint
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.35, -size * 0.48);
  ctx.lineTo(-size * 0.33, -size * 0.54);
  ctx.lineTo(-size * 0.37, -size * 0.5);
  ctx.fill();

  // Vein details on membrane
  ctx.strokeStyle = "rgba(6, 95, 70, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let v = 0; v < 5; v++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.35 - v * size * 0.1, -size * 0.15);
    ctx.quadraticCurveTo(
      -size * 0.4 - v * size * 0.12,
      size * 0.05 + Math.sin(v) * size * 0.03,
      -size * 0.3 - v * size * 0.08,
      size * 0.12,
    );
    ctx.stroke();
  }

  // Secondary membrane capillary veins - thin branches between main veins
  ctx.strokeStyle = "rgba(6, 95, 70, 0.22)";
  ctx.lineWidth = 0.6 * zoom;
  const leftJoints: [number, number][] = [
    [-0.35, -0.15], [-0.35, -0.32], [-0.56, -0.27], [-0.65, -0.15],
  ];
  const leftMembraneEdges: [number, number][] = [
    [-0.88, 0.02], [-0.75, 0.08], [-0.68, 0.18], [-0.5, 0.15], [-0.42, 0.22], [-0.25, 0.18],
  ];
  for (let j = 0; j < leftJoints.length; j++) {
    const [jx, jy] = leftJoints[j];
    for (let e = j; e < Math.min(j + 2, leftMembraneEdges.length); e++) {
      const [ex, ey] = leftMembraneEdges[e];
      const midX = (jx + ex) * 0.5 + Math.sin(j + e) * 0.03;
      const midY = (jy + ey) * 0.5 + Math.cos(j + e) * 0.02;
      ctx.beginPath();
      ctx.moveTo(jx * size, jy * size);
      ctx.quadraticCurveTo(midX * size, midY * size, ex * size, ey * size);
      ctx.stroke();
    }
  }

  // Wing membrane vein glow - pulsing energy flow
  const leftVeinPulse = 0.2 + Math.sin(time * 3) * 0.1 + venomIntensity * 0.15;
  ctx.strokeStyle = `rgba(74, 222, 128, ${leftVeinPulse})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let vg = 0; vg < 5; vg++) {
    const flowOffset = Math.sin(time * 4 - vg * 0.8) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(-size * 0.35 - vg * size * 0.1, -size * 0.15 + flowOffset);
    ctx.quadraticCurveTo(
      -size * 0.4 - vg * size * 0.12,
      size * 0.05 + Math.sin(vg) * size * 0.03 + flowOffset,
      -size * 0.3 - vg * size * 0.08,
      size * 0.12 + flowOffset,
    );
    ctx.stroke();
  }

  // Wing claw
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.33, -size * 0.14);
  ctx.lineTo(-size * 0.42, -size * 0.08);
  ctx.lineTo(-size * 0.35, -size * 0.12);
  ctx.fill();
  ctx.restore();

  // Right wing (mirrored)
  ctx.save();
  ctx.translate(x + size * 0.22, y - size * 0.12 + breathe + hoverBob);
  ctx.rotate(0.45 + wingFlap);

  const rightWingGrad = ctx.createLinearGradient(
    0,
    0,
    size * 0.95,
    -size * 0.2,
  );
  rightWingGrad.addColorStop(0, "#10b981");
  rightWingGrad.addColorStop(0.3, "#059669");
  rightWingGrad.addColorStop(0.6, "#047857");
  rightWingGrad.addColorStop(1, "#065f46");
  ctx.fillStyle = rightWingGrad;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.15, -size * 0.35);
  ctx.lineTo(size * 0.35, -size * 0.48);
  ctx.lineTo(size * 0.55, -size * 0.45);
  ctx.lineTo(size * 0.78, -size * 0.38);
  ctx.lineTo(size * 0.92, -size * 0.25);
  ctx.lineTo(size * 0.98, -size * 0.08);
  ctx.lineTo(size * 0.88, size * 0.02);
  ctx.lineTo(size * 0.75, size * 0.08);
  ctx.lineTo(size * 0.6, size * 0.05);
  ctx.lineTo(size * 0.68, size * 0.18);
  ctx.lineTo(size * 0.5, size * 0.15);
  ctx.lineTo(size * 0.35, size * 0.12);
  ctx.lineTo(size * 0.42, size * 0.22);
  ctx.lineTo(size * 0.25, size * 0.18);
  ctx.quadraticCurveTo(size * 0.1, size * 0.2, 0, size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Bones and veins mirrored with joint detail
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.35, -size * 0.15);
  ctx.stroke();
  // Shoulder joint
  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Elbow joint
  ctx.beginPath();
  ctx.arc(size * 0.35, -size * 0.15, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#047857";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.35, -size * 0.15);
  ctx.lineTo(size * 0.35, -size * 0.48);
  ctx.moveTo(size * 0.35, -size * 0.15);
  ctx.lineTo(size * 0.78, -size * 0.38);
  ctx.moveTo(size * 0.35, -size * 0.15);
  ctx.lineTo(size * 0.95, -size * 0.15);
  ctx.stroke();
  // Finger joint knobs (mirrored)
  ctx.fillStyle = "#065f46";
  const rightFingerJoints = [
    [0.35, -0.32], [0.56, -0.27], [0.65, -0.15],
  ];
  for (const [jx, jy] of rightFingerJoints) {
    ctx.beginPath();
    ctx.arc(jx * size, jy * size, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }
  // Wing claw
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(size * 0.35, -size * 0.48);
  ctx.lineTo(size * 0.33, -size * 0.54);
  ctx.lineTo(size * 0.37, -size * 0.5);
  ctx.fill();

  // Vein details on right membrane
  ctx.strokeStyle = "rgba(6, 95, 70, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let v = 0; v < 5; v++) {
    ctx.beginPath();
    ctx.moveTo(size * 0.35 + v * size * 0.1, -size * 0.15);
    ctx.quadraticCurveTo(
      size * 0.4 + v * size * 0.12,
      size * 0.05 + Math.sin(v) * size * 0.03,
      size * 0.3 + v * size * 0.08,
      size * 0.12,
    );
    ctx.stroke();
  }

  // Secondary membrane capillary veins (mirrored)
  ctx.strokeStyle = "rgba(6, 95, 70, 0.22)";
  ctx.lineWidth = 0.6 * zoom;
  const rightJoints: [number, number][] = [
    [0.35, -0.15], [0.35, -0.32], [0.56, -0.27], [0.65, -0.15],
  ];
  const rightMembraneEdges: [number, number][] = [
    [0.88, 0.02], [0.75, 0.08], [0.68, 0.18], [0.5, 0.15], [0.42, 0.22], [0.25, 0.18],
  ];
  for (let j = 0; j < rightJoints.length; j++) {
    const [jx, jy] = rightJoints[j];
    for (let e = j; e < Math.min(j + 2, rightMembraneEdges.length); e++) {
      const [ex, ey] = rightMembraneEdges[e];
      const midX = (jx + ex) * 0.5 + Math.sin(j + e) * 0.03;
      const midY = (jy + ey) * 0.5 + Math.cos(j + e) * 0.02;
      ctx.beginPath();
      ctx.moveTo(jx * size, jy * size);
      ctx.quadraticCurveTo(midX * size, midY * size, ex * size, ey * size);
      ctx.stroke();
    }
  }

  // Right wing vein glow - pulsing energy flow
  const rightVeinPulse = 0.2 + Math.sin(time * 3) * 0.1 + venomIntensity * 0.15;
  ctx.strokeStyle = `rgba(74, 222, 128, ${rightVeinPulse})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let vg = 0; vg < 5; vg++) {
    const flowOffset = Math.sin(time * 4 - vg * 0.8) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(size * 0.35 + vg * size * 0.1, -size * 0.15 + flowOffset);
    ctx.quadraticCurveTo(
      size * 0.4 + vg * size * 0.12,
      size * 0.05 + Math.sin(vg) * size * 0.03 + flowOffset,
      size * 0.3 + vg * size * 0.08,
      size * 0.12 + flowOffset,
    );
    ctx.stroke();
  }

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(size * 0.33, -size * 0.14);
  ctx.lineTo(size * 0.42, -size * 0.08);
  ctx.lineTo(size * 0.35, -size * 0.12);
  ctx.fill();
  ctx.restore();

  // === ANIMATED LEGS (powerful, tucked under, slow pump) ===
  drawPathLegs(ctx, x, y + size * 0.3 + breathe + hoverBob, size, time, zoom, {
    color: "#059669",
    colorDark: "#047857",
    footColor: "#0f172a",
    strideSpeed: 3,
    strideAmt: 0.15,
    legLen: 0.22,
    width: 0.06,
    style: "armored",
  });

  // === LAYER 4: MUSCULAR BODY ===
  const bodyY = y + size * 0.05 + breathe + hoverBob - lungeLean * 0.3;

  // Body shadow/depth layer
  ctx.fillStyle = "rgba(4, 120, 87, 0.6)";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.02,
    bodyY + size * 0.03,
    size * 0.34,
    size * 0.38,
    0.05,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Main body with muscle definition
  const bodyGrad = ctx.createRadialGradient(
    x - size * 0.1,
    bodyY - size * 0.1,
    0,
    x,
    bodyY,
    size * 0.42,
  );
  bodyGrad.addColorStop(0, "#34d399");
  bodyGrad.addColorStop(0.3, "#10b981");
  bodyGrad.addColorStop(0.7, "#059669");
  bodyGrad.addColorStop(1, "#047857");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, bodyY, size * 0.32, size * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();

  // Armored belly plates
  const bellyGrad = ctx.createLinearGradient(
    x,
    bodyY - size * 0.2,
    x,
    bodyY + size * 0.3,
  );
  bellyGrad.addColorStop(0, "#a7f3d0");
  bellyGrad.addColorStop(0.5, "#6ee7b7");
  bellyGrad.addColorStop(1, "#a7f3d0");
  ctx.fillStyle = bellyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    bodyY + size * 0.08,
    size * 0.2,
    size * 0.26,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Detailed belly scale plates
  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    const plateY = bodyY - size * 0.08 + i * size * 0.065;
    const plateWidth = size * (0.18 - Math.abs(i - 2.5) * 0.02);
    ctx.beginPath();
    ctx.moveTo(x - plateWidth, plateY);
    ctx.quadraticCurveTo(x, plateY + size * 0.025, x + plateWidth, plateY);
    ctx.stroke();
  }

  // Dorsal ridge spikes
  for (let i = 0; i < 5; i++) {
    const spikeX = x - size * 0.1 + i * size * 0.05;
    const spikeY = bodyY - size * 0.32 + Math.abs(i - 2) * size * 0.03;
    const spikeSize = size * (0.06 - Math.abs(i - 2) * 0.01);
    ctx.fillStyle = "#065f46";
    ctx.beginPath();
    ctx.moveTo(spikeX - spikeSize * 0.4, spikeY + spikeSize * 0.3);
    ctx.lineTo(spikeX, spikeY - spikeSize);
    ctx.lineTo(spikeX + spikeSize * 0.4, spikeY + spikeSize * 0.3);
    ctx.fill();
  }

  // Overlapping diamond scale plates across body
  ctx.fillStyle = "rgba(5, 150, 105, 0.25)";
  ctx.strokeStyle = "rgba(6, 95, 70, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const scaleOffX = (row % 2) * size * 0.035;
      const scX = x - size * 0.15 + col * size * 0.065 + scaleOffX;
      const scY = bodyY - size * 0.2 + row * size * 0.08;
      ctx.beginPath();
      ctx.moveTo(scX, scY - size * 0.025);
      ctx.lineTo(scX + size * 0.025, scY);
      ctx.lineTo(scX, scY + size * 0.025);
      ctx.lineTo(scX - size * 0.025, scY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
  // Scale edge highlights
  ctx.strokeStyle = "rgba(167, 243, 208, 0.15)";
  ctx.lineWidth = 0.5 * zoom;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const scaleOffX = (row % 2) * size * 0.035;
      const scX = x - size * 0.15 + col * size * 0.065 + scaleOffX;
      const scY = bodyY - size * 0.2 + row * size * 0.08;
      ctx.beginPath();
      ctx.moveTo(scX, scY - size * 0.025);
      ctx.lineTo(scX + size * 0.025, scY);
      ctx.stroke();
    }
  }

  // Inner scale keel ridges - raised center line within each diamond
  ctx.strokeStyle = "rgba(4, 120, 87, 0.3)";
  ctx.lineWidth = 0.6 * zoom;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const scaleOffX = (row % 2) * size * 0.035;
      const scX = x - size * 0.15 + col * size * 0.065 + scaleOffX;
      const scY = bodyY - size * 0.2 + row * size * 0.08;
      ctx.beginPath();
      ctx.moveTo(scX, scY - size * 0.015);
      ctx.lineTo(scX, scY + size * 0.015);
      ctx.stroke();
    }
  }

  // Flanking lateral scales - smaller overlapping diamonds along body sides
  ctx.fillStyle = "rgba(6, 95, 70, 0.2)";
  ctx.strokeStyle = "rgba(4, 120, 87, 0.25)";
  ctx.lineWidth = 0.5 * zoom;
  for (let side = 0; side < 2; side++) {
    const sDir = side === 0 ? -1 : 1;
    for (let ls = 0; ls < 6; ls++) {
      const lsX = x + sDir * size * 0.28 + sDir * Math.sin(ls * 0.9) * size * 0.02;
      const lsY = bodyY - size * 0.15 + ls * size * 0.065;
      const lsS = size * 0.018;
      ctx.beginPath();
      ctx.moveTo(lsX, lsY - lsS);
      ctx.lineTo(lsX + lsS, lsY);
      ctx.lineTo(lsX, lsY + lsS);
      ctx.lineTo(lsX - lsS, lsY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // Scale shimmer - traveling highlight across body
  const shimmerPos = (time * 1.2) % 3 - 0.5;
  const shimmerGrad = ctx.createLinearGradient(
    x + (shimmerPos - 0.3) * size, bodyY,
    x + (shimmerPos + 0.3) * size, bodyY,
  );
  shimmerGrad.addColorStop(0, "rgba(167, 243, 208, 0)");
  shimmerGrad.addColorStop(0.3, `rgba(167, 243, 208, ${0.12 + Math.sin(time * 4) * 0.04})`);
  shimmerGrad.addColorStop(0.5, `rgba(209, 250, 229, ${0.2 + Math.sin(time * 4) * 0.06})`);
  shimmerGrad.addColorStop(0.7, `rgba(167, 243, 208, ${0.12 + Math.sin(time * 4) * 0.04})`);
  shimmerGrad.addColorStop(1, "rgba(167, 243, 208, 0)");
  ctx.fillStyle = shimmerGrad;
  ctx.beginPath();
  ctx.ellipse(x, bodyY, size * 0.32, size * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 5: POWERFUL NECK ===
  const neckGrad = ctx.createLinearGradient(
    x - size * 0.15,
    y - size * 0.2,
    x + size * 0.1,
    y - size * 0.55,
  );
  neckGrad.addColorStop(0, "#059669");
  neckGrad.addColorStop(0.5, "#10b981");
  neckGrad.addColorStop(1, "#059669");
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.18 + breathe + hoverBob);
  ctx.quadraticCurveTo(
    x - size * 0.05 + neckSway,
    y - size * 0.38,
    x + size * 0.03 + lungeLean,
    y - size * 0.52 + breathe + hoverBob,
  );
  ctx.lineTo(x + size * 0.14 + lungeLean, y - size * 0.48 + breathe + hoverBob);
  ctx.quadraticCurveTo(
    x + size * 0.12 + neckSway,
    y - size * 0.32,
    x + size * 0.12,
    y - size * 0.18 + breathe + hoverBob,
  );
  ctx.fill();

  // Neck ridges
  ctx.fillStyle = "#065f46";
  for (let i = 0; i < 4; i++) {
    const ridgeProgress = 0.2 + i * 0.2;
    const ridgeX =
      x - size * 0.08 + ridgeProgress * size * 0.12 + neckSway * ridgeProgress;
    const ridgeY =
      y - size * 0.22 - ridgeProgress * size * 0.28 + breathe + hoverBob;
    ctx.beginPath();
    ctx.moveTo(ridgeX - size * 0.02, ridgeY);
    ctx.lineTo(ridgeX, ridgeY - size * 0.04);
    ctx.lineTo(ridgeX + size * 0.02, ridgeY);
    ctx.fill();
  }

  // === LAYER 6: FEARSOME HEAD ===
  const headX = x + size * 0.04 + lungeLean;
  const headY = y - size * 0.56 + breathe + hoverBob;

  // Head base
  const headGrad = ctx.createRadialGradient(
    headX - size * 0.05,
    headY - size * 0.02,
    0,
    headX,
    headY,
    size * 0.18,
  );
  headGrad.addColorStop(0, "#10b981");
  headGrad.addColorStop(0.6, "#059669");
  headGrad.addColorStop(1, "#047857");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.16, size * 0.13, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Brow ridges
  ctx.fillStyle = "#047857";
  ctx.beginPath();
  ctx.ellipse(
    headX - size * 0.02,
    headY - size * 0.08,
    size * 0.14,
    size * 0.05,
    0.2,
    Math.PI,
    Math.PI * 2,
  );
  ctx.fill();

  // Snout with jaw mechanics
  const snoutX = headX - size * 0.12;
  const snoutY = headY + size * 0.01 + jawOpen * size * 0.03;
  ctx.fillStyle = "#059669";
  // Upper jaw
  ctx.beginPath();
  ctx.ellipse(
    snoutX,
    snoutY - size * 0.02,
    size * 0.12,
    size * 0.06,
    0.25,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Lower jaw (opens when attacking)
  ctx.save();
  ctx.translate(snoutX + size * 0.02, snoutY + size * 0.02);
  ctx.rotate(jawOpen * 0.4);
  ctx.fillStyle = "#047857";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.02, size * 0.1, size * 0.04, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Teeth on lower jaw
  ctx.fillStyle = "#f0fdf4";
  for (let t = 0; t < 5; t++) {
    const toothX = -size * 0.06 + t * size * 0.025;
    ctx.beginPath();
    ctx.moveTo(toothX - size * 0.008, 0);
    ctx.lineTo(toothX, -size * 0.025);
    ctx.lineTo(toothX + size * 0.008, 0);
    ctx.fill();
  }
  ctx.restore();

  // Upper teeth
  ctx.fillStyle = "#f0fdf4";
  for (let t = 0; t < 6; t++) {
    const toothX = snoutX - size * 0.08 + t * size * 0.025;
    const toothY = snoutY + size * 0.02;
    ctx.beginPath();
    ctx.moveTo(toothX - size * 0.008, toothY);
    ctx.lineTo(toothX, toothY + size * 0.03);
    ctx.lineTo(toothX + size * 0.008, toothY);
    ctx.fill();
  }

  // Nostrils with smoke
  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.ellipse(
    snoutX - size * 0.06,
    snoutY - size * 0.04,
    size * 0.015,
    size * 0.01,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    snoutX - size * 0.04,
    snoutY - size * 0.05,
    size * 0.015,
    size * 0.01,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Nostril smoke
  for (let s = 0; s < 3; s++) {
    const smokePhase = (time * 0.8 + s * 0.4) % 1.5;
    const smokeX = snoutX - size * 0.05 + Math.sin(time * 2 + s) * size * 0.02;
    const smokeY = snoutY - size * 0.05 - smokePhase * size * 0.1;
    const smokeAlpha = (0.4 - smokePhase * 0.25) * venomIntensity;
    ctx.fillStyle = `rgba(74, 222, 128, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.arc(smokeX, smokeY, size * (0.02 + smokePhase * 0.02), 0, Math.PI * 2);
    ctx.fill();
  }

  // === LAYER 7: GLOWING PREDATOR EYES ===
  // Eye sockets
  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.ellipse(
    headX - size * 0.01,
    headY - size * 0.03,
    size * 0.05,
    size * 0.04,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    headX + size * 0.09,
    headY - size * 0.01,
    size * 0.045,
    size * 0.035,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye glow (intensifies when attacking)
  const eyeGlow = isAttacking
    ? 0.9 + attackIntensity * 0.1
    : 0.7 + Math.sin(time * 2) * 0.2;
  ctx.fillStyle = `rgba(251, 191, 36, ${eyeGlow})`;
  ctx.beginPath();
  ctx.ellipse(
    headX - size * 0.01,
    headY - size * 0.03,
    size * 0.04,
    size * 0.03,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    headX + size * 0.09,
    headY - size * 0.01,
    size * 0.035,
    size * 0.025,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Slit pupils (narrow when attacking)
  const pupilWidth = isAttacking ? size * 0.008 : size * 0.015;
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(
    headX - size * 0.01,
    headY - size * 0.03,
    pupilWidth,
    size * 0.025,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    headX + size * 0.09,
    headY - size * 0.01,
    pupilWidth * 0.9,
    size * 0.02,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye shine
  ctx.fillStyle = "#fffbeb";
  ctx.beginPath();
  ctx.arc(
    headX - size * 0.02,
    headY - size * 0.045,
    size * 0.01,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    headX + size * 0.08,
    headY - size * 0.025,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === LAYER 8: CROWN OF HORNS ===
  ctx.fillStyle = "#0f172a";
  // Main horns
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.06, headY - size * 0.1);
  ctx.quadraticCurveTo(
    headX + size * 0.12,
    headY - size * 0.2,
    headX + size * 0.16,
    headY - size * 0.28,
  );
  ctx.lineTo(headX + size * 0.12, headY - size * 0.22);
  ctx.quadraticCurveTo(
    headX + size * 0.1,
    headY - size * 0.14,
    headX + size * 0.08,
    headY - size * 0.08,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.04, headY - size * 0.12);
  ctx.quadraticCurveTo(
    headX - size * 0.08,
    headY - size * 0.24,
    headX - size * 0.06,
    headY - size * 0.32,
  );
  ctx.lineTo(headX - size * 0.04, headY - size * 0.26);
  ctx.quadraticCurveTo(
    headX - size * 0.04,
    headY - size * 0.18,
    headX - size * 0.02,
    headY - size * 0.1,
  );
  ctx.fill();

  // Horn ridges - growth ring segments on right horn
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1.2 * zoom;
  for (let h = 0; h < 5; h++) {
    const ridgeY = headY - size * 0.14 - h * size * 0.03;
    const ridgeW = size * (0.025 - h * 0.003);
    ctx.beginPath();
    ctx.arc(
      headX + size * 0.1 + h * size * 0.012,
      ridgeY,
      ridgeW,
      0,
      Math.PI,
    );
    ctx.stroke();
  }
  // Growth ring segments on left horn
  for (let h = 0; h < 5; h++) {
    const ridgeY = headY - size * 0.16 - h * size * 0.03;
    const ridgeW = size * (0.02 - h * 0.002);
    ctx.beginPath();
    ctx.arc(
      headX - size * 0.05 - h * size * 0.003,
      ridgeY,
      ridgeW,
      0,
      Math.PI,
    );
    ctx.stroke();
  }
  // Horn edge highlights
  ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.07, headY - size * 0.1);
  ctx.quadraticCurveTo(headX + size * 0.13, headY - size * 0.2, headX + size * 0.16, headY - size * 0.27);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.03, headY - size * 0.12);
  ctx.quadraticCurveTo(headX - size * 0.07, headY - size * 0.24, headX - size * 0.06, headY - size * 0.31);
  ctx.stroke();

  // Horn wrapping ridge bands - full elliptical bands around right horn
  ctx.strokeStyle = "rgba(30, 41, 59, 0.5)";
  ctx.lineWidth = 1 * zoom;
  for (let rb = 0; rb < 6; rb++) {
    const t = rb / 6;
    const rbX = headX + size * (0.08 + t * 0.08);
    const rbY = headY - size * (0.11 + t * 0.17);
    const rbW = size * (0.022 - t * 0.012);
    const rbH = size * (0.012 - t * 0.005);
    ctx.beginPath();
    ctx.ellipse(rbX, rbY, rbW, rbH, 0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Full elliptical bands around left horn
  for (let rb = 0; rb < 6; rb++) {
    const t = rb / 6;
    const rbX = headX - size * (0.04 + t * 0.02);
    const rbY = headY - size * (0.13 + t * 0.19);
    const rbW = size * (0.018 - t * 0.009);
    const rbH = size * (0.01 - t * 0.004);
    ctx.beginPath();
    ctx.ellipse(rbX, rbY, rbW, rbH, -0.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Small decorative brow horns
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.13, headY - size * 0.06);
  ctx.lineTo(headX + size * 0.18, headY - size * 0.12);
  ctx.lineTo(headX + size * 0.14, headY - size * 0.08);
  ctx.fill();
  // Third small chin horn
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.02, headY + size * 0.1);
  ctx.lineTo(headX + size * 0.01, headY + size * 0.16);
  ctx.lineTo(headX + size * 0.04, headY + size * 0.12);
  ctx.fill();

  // Magical horn tip glow - pulses with power level
  const hornPulse = 0.3 + Math.sin(time * 3.5) * 0.15 + venomIntensity * 0.2;
  const rightHornGlow = ctx.createRadialGradient(
    headX + size * 0.16, headY - size * 0.28, 0,
    headX + size * 0.16, headY - size * 0.28, size * 0.06,
  );
  rightHornGlow.addColorStop(0, `rgba(74, 222, 128, ${hornPulse * 0.7})`);
  rightHornGlow.addColorStop(0.4, `rgba(52, 211, 153, ${hornPulse * 0.3})`);
  rightHornGlow.addColorStop(1, "rgba(52, 211, 153, 0)");
  ctx.fillStyle = rightHornGlow;
  ctx.beginPath();
  ctx.arc(headX + size * 0.16, headY - size * 0.28, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  const leftHornGlow = ctx.createRadialGradient(
    headX - size * 0.06, headY - size * 0.32, 0,
    headX - size * 0.06, headY - size * 0.32, size * 0.06,
  );
  leftHornGlow.addColorStop(0, `rgba(74, 222, 128, ${hornPulse * 0.7})`);
  leftHornGlow.addColorStop(0.4, `rgba(52, 211, 153, ${hornPulse * 0.3})`);
  leftHornGlow.addColorStop(1, "rgba(52, 211, 153, 0)");
  ctx.fillStyle = leftHornGlow;
  ctx.beginPath();
  ctx.arc(headX - size * 0.06, headY - size * 0.32, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  const smallHornGlow = ctx.createRadialGradient(
    headX + size * 0.18, headY - size * 0.12, 0,
    headX + size * 0.18, headY - size * 0.12, size * 0.04,
  );
  smallHornGlow.addColorStop(0, `rgba(74, 222, 128, ${hornPulse * 0.5})`);
  smallHornGlow.addColorStop(0.5, `rgba(52, 211, 153, ${hornPulse * 0.2})`);
  smallHornGlow.addColorStop(1, "rgba(52, 211, 153, 0)");
  ctx.fillStyle = smallHornGlow;
  ctx.beginPath();
  ctx.arc(headX + size * 0.18, headY - size * 0.12, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 9: POWERFUL LEGS WITH TALONS ===
  const legY = y + size * 0.28 + breathe + hoverBob;

  // Left leg
  ctx.fillStyle = "#059669";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, legY - size * 0.05);
  ctx.quadraticCurveTo(
    x - size * 0.18,
    legY + size * 0.15,
    x - size * 0.2,
    legY + size * 0.3,
  );
  ctx.lineTo(x - size * 0.12, legY + size * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.11,
    legY + size * 0.15,
    x - size * 0.1,
    legY - size * 0.02,
  );
  ctx.fill();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, legY - size * 0.05);
  ctx.quadraticCurveTo(
    x + size * 0.18,
    legY + size * 0.15,
    x + size * 0.2,
    legY + size * 0.3,
  );
  ctx.lineTo(x + size * 0.12, legY + size * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.11,
    legY + size * 0.15,
    x + size * 0.1,
    legY - size * 0.02,
  );
  ctx.fill();

  // Detailed talons
  ctx.fillStyle = "#0f172a";
  for (let leg = 0; leg < 2; leg++) {
    const legX = leg === 0 ? x - size * 0.16 : x + size * 0.16;
    const talonY = legY + size * 0.3;
    // Three front talons
    for (let claw = 0; claw < 3; claw++) {
      const clawX = legX + (claw - 1) * size * 0.04;
      ctx.beginPath();
      ctx.moveTo(clawX - size * 0.015, talonY);
      ctx.quadraticCurveTo(
        clawX,
        talonY + size * 0.02,
        clawX,
        talonY + size * 0.08,
      );
      ctx.quadraticCurveTo(
        clawX + size * 0.005,
        talonY + size * 0.02,
        clawX + size * 0.015,
        talonY,
      );
      ctx.fill();
    }
    // Back talon
    ctx.beginPath();
    ctx.moveTo(legX + (leg === 0 ? size * 0.03 : -size * 0.03), talonY);
    ctx.lineTo(
      legX + (leg === 0 ? size * 0.08 : -size * 0.08),
      talonY + size * 0.04,
    );
    ctx.lineTo(legX + (leg === 0 ? size * 0.05 : -size * 0.05), talonY);
    ctx.fill();
  }

  // Venom charge orb - builds in throat/mouth area
  {
    const chargeAlpha = venomIntensity * 0.8;
    const chargeSize = size * (0.03 + venomIntensity * 0.06);
    const chargePulse = 1 + Math.sin(time * 8) * 0.2;
    const chargeX = snoutX - size * 0.04;
    const chargeY = snoutY + jawOpen * size * 0.02;

    const chargeGlow = ctx.createRadialGradient(chargeX, chargeY, 0, chargeX, chargeY, chargeSize * 3);
    chargeGlow.addColorStop(0, `rgba(74, 222, 128, ${chargeAlpha * 0.6 * chargePulse})`);
    chargeGlow.addColorStop(0.4, `rgba(52, 211, 153, ${chargeAlpha * 0.25})`);
    chargeGlow.addColorStop(1, "rgba(52, 211, 153, 0)");
    ctx.fillStyle = chargeGlow;
    ctx.beginPath();
    ctx.arc(chargeX, chargeY, chargeSize * 3, 0, Math.PI * 2);
    ctx.fill();

    const coreGlow = ctx.createRadialGradient(chargeX, chargeY, 0, chargeX, chargeY, chargeSize * chargePulse);
    coreGlow.addColorStop(0, `rgba(209, 250, 229, ${chargeAlpha * 0.9})`);
    coreGlow.addColorStop(0.5, `rgba(110, 231, 183, ${chargeAlpha * 0.6})`);
    coreGlow.addColorStop(1, `rgba(74, 222, 128, ${chargeAlpha * 0.2})`);
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(chargeX, chargeY, chargeSize * chargePulse, 0, Math.PI * 2);
    ctx.fill();

    if (venomIntensity > 0.35) {
      for (let cw = 0; cw < 4; cw++) {
        const wispAngle = time * 6 + cw * Math.PI * 0.5;
        const wispDist = chargeSize * (2 + Math.sin(time * 3 + cw) * 0.5);
        const wispX = chargeX + Math.cos(wispAngle) * wispDist;
        const wispY = chargeY + Math.sin(wispAngle) * wispDist * 0.6;
        ctx.strokeStyle = `rgba(74, 222, 128, ${chargeAlpha * 0.5})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(wispX, wispY);
        ctx.lineTo(chargeX, chargeY);
        ctx.stroke();
      }
    }
  }

  // === LAYER 10: VENOM BREATH ATTACK ===
  if (isAttacking || venomIntensity > 0.4) {
    const breathX = snoutX - size * 0.15 - lungeLean;
    const breathY = snoutY + jawOpen * size * 0.05;

    // Main venom stream
    const streamLength =
      size * (0.3 + (isAttacking ? attackIntensity * 0.5 : 0));
    const streamGrad = ctx.createLinearGradient(
      breathX,
      breathY,
      breathX - streamLength,
      breathY,
    );
    streamGrad.addColorStop(0, `rgba(74, 222, 128, ${venomIntensity * 0.9})`);
    streamGrad.addColorStop(0.3, `rgba(52, 211, 153, ${venomIntensity * 0.7})`);
    streamGrad.addColorStop(0.7, `rgba(16, 185, 129, ${venomIntensity * 0.4})`);
    streamGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
    ctx.fillStyle = streamGrad;

    ctx.beginPath();
    ctx.moveTo(breathX, breathY - size * 0.03);
    ctx.quadraticCurveTo(
      breathX - streamLength * 0.5,
      breathY - size * 0.05 + Math.sin(time * 8) * size * 0.02,
      breathX - streamLength,
      breathY + Math.sin(time * 6) * size * 0.04,
    );
    ctx.quadraticCurveTo(
      breathX - streamLength * 0.5,
      breathY + size * 0.05 + Math.sin(time * 8 + 1) * size * 0.02,
      breathX,
      breathY + size * 0.03,
    );
    ctx.closePath();
    ctx.fill();

    // Venom droplets/particles
    for (let d = 0; d < 8; d++) {
      const dropPhase = (time * 2 + d * 0.3) % 1;
      const dropX =
        breathX -
        dropPhase * streamLength +
        Math.sin(time * 5 + d) * size * 0.03;
      const dropY = breathY + Math.sin(time * 6 + d * 2) * size * 0.04;
      const dropAlpha = venomIntensity * (1 - dropPhase) * 0.8;
      ctx.fillStyle = `rgba(74, 222, 128, ${dropAlpha})`;
      ctx.beginPath();
      ctx.arc(
        dropX,
        dropY,
        size * 0.015 * (1 - dropPhase * 0.5),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === LAYER 11: ATTACK IMPACT EFFECTS ===
  if (isAttacking) {
    // Energy surge from body
    ctx.strokeStyle = `rgba(52, 211, 153, ${attackIntensity * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    for (let i = 0; i < 4; i++) {
      const surgeAngle = time * 4 + i * Math.PI * 0.5;
      const surgeX = x + Math.cos(surgeAngle) * size * 0.4;
      const surgeY = y + Math.sin(surgeAngle) * size * 0.25 + hoverBob;
      ctx.beginPath();
      ctx.arc(
        surgeX,
        surgeY,
        size * 0.05 + attackIntensity * size * 0.03,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }

    // Claw swipe trails
    ctx.strokeStyle = `rgba(16, 185, 129, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 3 * zoom;
    const swipePhase = attackPhase * Math.PI;
    for (let leg = 0; leg < 2; leg++) {
      const legX = leg === 0 ? x - size * 0.16 : x + size * 0.16;
      ctx.beginPath();
      ctx.arc(
        legX,
        legY + size * 0.35,
        size * 0.15,
        Math.PI * (leg === 0 ? 0.8 : 0.2) + swipePhase,
        Math.PI * (leg === 0 ? 1.2 : -0.2) + swipePhase,
      );
      ctx.stroke();
    }
  }

  // === TAIL WHIP TENDRIL ===
  drawAnimatedTendril(
    ctx,
    x + size * 0.88,
    y + size * 0.18 + breathe + hoverBob,
    tailSwing * 0.3 + 0.15,
    size,
    time,
    zoom,
    {
      color: "#047857",
      tipColor: "#4ade80",
      length: 0.35,
      waveSpeed: 3.5,
      waveAmt: 0.08,
      width: 0.035,
    },
  );

  // === DRACONIC EMBER SPARKS ===
  drawEmberSparks(ctx, x, y + hoverBob, size * 0.35, time, zoom, {
    color: "rgba(74, 222, 128, 0.45)",
    coreColor: "rgba(180, 255, 160, 0.7)",
    count: 6,
    speed: 1.2,
    maxAlpha: 0.35,
    sparkSize: 0.06,
  });

  // === FLOATING SCALE SEGMENTS (diamond) ===
  drawShiftingSegments(ctx, x, y + hoverBob, size, time, zoom, {
    color: "#10b981",
    colorAlt: "#065f46",
    count: 6,
    orbitRadius: 0.5,
    segmentSize: 0.035,
    orbitSpeed: 1.2,
    shape: "diamond",
  });

}
