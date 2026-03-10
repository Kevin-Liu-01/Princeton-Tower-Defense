import {
  drawLeafSwirl,
  drawShiftingSegments,
  drawOrbitingDebris,
} from "./animationHelpers";

// =====================================================
// FOREST REGION TROOPS
// =====================================================

export function drawAthleteEnemy(
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
  // VARSITY RUNNER - Elite sprinter with dynamic running animation
  const isAttacking = attackPhase > 0;
  const attackBoost = isAttacking ? 1.3 : 1; // Run faster when attacking
  const runCycle = Math.sin(time * 14 * attackBoost) * 0.4;
  const armSwing = Math.sin(time * 14 * attackBoost) * 0.5;
  const bounce = Math.abs(Math.sin(time * 14 * attackBoost)) * 4 * zoom;
  const leanForward = 0.15 + (isAttacking ? 0.1 : 0); // Lean more when attacking

  // Motion blur trails (speed effect)
  ctx.globalAlpha = isAttacking ? 0.2 : 0.15;
  ctx.fillStyle = bodyColor;
  for (let trail = 1; trail <= 3; trail++) {
    ctx.beginPath();
    ctx.ellipse(
      x - trail * 6 * zoom,
      y - size * 0.15,
      size * 0.25,
      size * 0.2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Speed lines when attacking (intense sprint effect)
  if (isAttacking) {
    ctx.lineWidth = 1.5 * zoom;
    for (let sl = 0; sl < 5; sl++) {
      const slPhase = (time * 4 + sl * 0.4) % 1;
      const slY = y - size * 0.35 + sl * size * 0.15 - bounce;
      const slAlpha = (1 - slPhase) * 0.35;
      ctx.strokeStyle = `rgba(255, 255, 255, ${slAlpha})`;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.3 - slPhase * size * 0.4, slY);
      ctx.lineTo(x - size * 0.3 - slPhase * size * 0.4 - size * 0.25, slY);
      ctx.stroke();
    }
  }

  // --- LEGS with detailed anatomy ---
  const skinTone = "#e8c4a0";
  const skinHighlight = "#f5dcc4";
  const skinShadow = "#d4a574";

  // Back leg (bent back in running stride)
  ctx.save();
  ctx.translate(x - size * 0.1, y + size * 0.1 - bounce);
  ctx.rotate(runCycle * 0.6 + leanForward);
  // Thigh
  const thighGrad = ctx.createLinearGradient(-size * 0.06, 0, size * 0.06, 0);
  thighGrad.addColorStop(0, skinShadow);
  thighGrad.addColorStop(0.5, skinTone);
  thighGrad.addColorStop(1, skinHighlight);
  ctx.fillStyle = thighGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.08, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Calf
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(
    size * 0.02,
    size * 0.28,
    size * 0.06,
    size * 0.1,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Running shoe
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(
    size * 0.05,
    size * 0.38,
    size * 0.1,
    size * 0.04,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Shoe accent stripe
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, size * 0.36);
  ctx.lineTo(size * 0.1, size * 0.38);
  ctx.stroke();
  ctx.restore();

  // Front leg (extended forward)
  ctx.save();
  ctx.translate(x + size * 0.1, y + size * 0.1 - bounce);
  ctx.rotate(-runCycle * 0.6 + leanForward);
  // Thigh
  ctx.fillStyle = thighGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.09, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  // Calf
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.02,
    size * 0.28,
    size * 0.065,
    size * 0.11,
    -0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Running shoe
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.04,
    size * 0.38,
    size * 0.1,
    size * 0.045,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Shoe accent
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.04, size * 0.36);
  ctx.lineTo(-size * 0.1, size * 0.39);
  ctx.stroke();
  ctx.restore();

  // Dust kick-up from running shoes
  const dustIntensity = isAttacking ? 0.35 : 0.2;
  for (let dp = 0; dp < 4; dp++) {
    const dustPhase = (time * 3.5 + dp * 0.5) % 1;
    const dustX =
      x - size * 0.05 - dustPhase * size * 0.3 + Math.sin(dp * 2.1) * size * 0.1;
    const dustY =
      y + size * 0.48 - bounce - dustPhase * size * 0.12;
    const dustAlpha = (1 - dustPhase) * dustIntensity;
    const dustSize = size * (0.02 + dustPhase * 0.025);
    ctx.fillStyle = `rgba(180, 160, 130, ${dustAlpha})`;
    ctx.beginPath();
    ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- SHORTS with detail ---
  const shortsGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y,
    x + size * 0.2,
    y,
  );
  shortsGrad.addColorStop(0, "#1e3a5f");
  shortsGrad.addColorStop(0.5, "#2d4a6f");
  shortsGrad.addColorStop(1, "#1e3a5f");
  ctx.fillStyle = shortsGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.02 - bounce);
  ctx.lineTo(x - size * 0.18, y + size * 0.18 - bounce);
  ctx.lineTo(x, y + size * 0.15 - bounce);
  ctx.lineTo(x + size * 0.18, y + size * 0.18 - bounce);
  ctx.lineTo(x + size * 0.22, y - size * 0.02 - bounce);
  ctx.closePath();
  ctx.fill();
  // Shorts side stripe
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - bounce);
  ctx.lineTo(x - size * 0.16, y + size * 0.15 - bounce);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - bounce);
  ctx.lineTo(x + size * 0.16, y + size * 0.15 - bounce);
  ctx.stroke();

  // --- TORSO (Athletic jersey) ---
  ctx.save();
  ctx.translate(x, y - size * 0.18 - bounce);
  ctx.rotate(leanForward * 0.3);
  // Jersey body gradient
  const jerseyGrad = ctx.createLinearGradient(
    -size * 0.25,
    -size * 0.2,
    size * 0.25,
    size * 0.2,
  );
  jerseyGrad.addColorStop(0, bodyColorDark);
  jerseyGrad.addColorStop(0.3, bodyColor);
  jerseyGrad.addColorStop(0.7, bodyColor);
  jerseyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = jerseyGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, size * 0.15);
  ctx.quadraticCurveTo(-size * 0.28, 0, -size * 0.22, -size * 0.18);
  ctx.lineTo(-size * 0.08, -size * 0.22);
  ctx.quadraticCurveTo(0, -size * 0.24, size * 0.08, -size * 0.22);
  ctx.lineTo(size * 0.22, -size * 0.18);
  ctx.quadraticCurveTo(size * 0.28, 0, size * 0.25, size * 0.15);
  ctx.closePath();
  ctx.fill();
  // Jersey V-neck
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.18);
  ctx.lineTo(0, -size * 0.08);
  ctx.lineTo(size * 0.06, -size * 0.18);
  ctx.closePath();
  ctx.fill();
  // Jersey shoulder stripes
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.15);
  ctx.lineTo(-size * 0.25, -size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.2, -size * 0.15);
  ctx.lineTo(size * 0.25, -size * 0.05);
  ctx.stroke();
  // Jersey number (on chest)
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${size * 0.18}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("23", 0, size * 0.02);
  // Number outline
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.5 * zoom;
  ctx.strokeText("23", 0, size * 0.02);
  ctx.restore();

  // --- ARMS (pumping motion) ---
  // Back arm
  ctx.save();
  ctx.translate(x - size * 0.28, y - size * 0.18 - bounce);
  ctx.rotate(-armSwing * 0.7 + leanForward);
  // Upper arm (sleeve)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.08, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(
    size * 0.02,
    size * 0.22,
    size * 0.055,
    size * 0.1,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Fist
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.arc(size * 0.04, size * 0.32, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front arm
  ctx.save();
  ctx.translate(x + size * 0.28, y - size * 0.18 - bounce);
  ctx.rotate(armSwing * 0.7 + leanForward);
  // Upper arm
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.08, size * 0.08, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.02,
    size * 0.22,
    size * 0.055,
    size * 0.1,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Fist
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.arc(-size * 0.04, size * 0.32, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- HEAD with detailed features ---
  const headY = y - size * 0.52 - bounce;

  // Neck
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.32 - bounce,
    size * 0.08,
    size * 0.06,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Head shape
  const headGrad = ctx.createRadialGradient(
    x - size * 0.05,
    headY - size * 0.05,
    0,
    x,
    headY,
    size * 0.2,
  );
  headGrad.addColorStop(0, skinHighlight);
  headGrad.addColorStop(0.7, skinTone);
  headGrad.addColorStop(1, skinShadow);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Short athletic hair
  ctx.fillStyle = "#2d1f1a";
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.02, size * 0.17, Math.PI * 1.15, Math.PI * 1.85);
  ctx.quadraticCurveTo(x, headY - size * 0.22, x, headY - size * 0.18);
  ctx.fill();

  // Sweatband
  const bandGrad = ctx.createLinearGradient(
    x - size * 0.2,
    headY,
    x + size * 0.2,
    headY,
  );
  bandGrad.addColorStop(0, bodyColorDark);
  bandGrad.addColorStop(0.5, bodyColor);
  bandGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bandGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.19, Math.PI * 1.05, Math.PI * 1.95);
  ctx.arc(x, headY, size * 0.15, Math.PI * 1.95, Math.PI * 1.05, true);
  ctx.closePath();
  ctx.fill();
  // Sweatband logo
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.arc(x, headY - size * 0.15, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Determined eyebrows
  ctx.strokeStyle = "#3d2d1a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, headY - size * 0.06);
  ctx.lineTo(x - size * 0.04, headY - size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.04, headY - size * 0.04);
  ctx.lineTo(x + size * 0.12, headY - size * 0.06);
  ctx.stroke();

  // Focused eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.07,
    headY + size * 0.01,
    size * 0.04,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.07,
    headY + size * 0.01,
    size * 0.04,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Pupils (looking ahead)
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.065 + size * 0.01,
    headY + size * 0.01,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.075 + size * 0.01,
    headY + size * 0.01,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Nose
  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.moveTo(x, headY + size * 0.02);
  ctx.lineTo(x - size * 0.025, headY + size * 0.08);
  ctx.lineTo(x + size * 0.025, headY + size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Determined mouth (slight grimace of effort)
  ctx.strokeStyle = "#8b5a4a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, headY + size * 0.12);
  ctx.quadraticCurveTo(
    x,
    headY + size * 0.1,
    x + size * 0.05,
    headY + size * 0.12,
  );
  ctx.stroke();

  // Sweat droplets (effort effect)
  ctx.fillStyle = "rgba(135, 206, 250, 0.6)";
  const sweatPhase = (time * 3) % 1;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.2,
    headY + sweatPhase * size * 0.3,
    size * 0.02,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.18,
    headY + size * 0.05 + sweatPhase * size * 0.2,
    size * 0.015,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // --- ANIMATED EFFECTS ---

  // Speed leaf swirl around feet
  drawLeafSwirl(ctx, x, y + size * 0.35 - bounce, size * 0.18, time, zoom, {
    color: "rgba(120, 180, 60, 0.5)",
    colorAlt: "rgba(200, 170, 80, 0.45)",
    count: 4,
    speed: 2.5,
    maxAlpha: isAttacking ? 0.5 : 0.35,
    leafSize: 0.1,
  });

  // Dust / speed particles orbiting body
  drawOrbitingDebris(ctx, x, y - size * 0.1 - bounce, size, time, zoom, {
    color: "rgba(200, 180, 140, 0.6)",
    glowColor: "rgba(255, 220, 160, 0.25)",
    count: isAttacking ? 7 : 5,
    speed: isAttacking ? 3.5 : 2.2,
    particleSize: 0.015,
    minRadius: 0.3,
    maxRadius: 0.5,
    trailLen: 2,
  });

  // Floating energy fragments around torso
  drawShiftingSegments(ctx, x, y - size * 0.15 - bounce, size, time, zoom, {
    color: bodyColor,
    colorAlt: bodyColorLight,
    count: 4,
    orbitRadius: 0.35,
    segmentSize: 0.025,
    orbitSpeed: 1.8,
    shape: "circle",
  });
}

export function drawProtestorEnemy(
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
  // CAMPUS PROTESTOR - Passionate student activist with detailed sign and outfit
  const isAttacking = attackPhase > 0;
  const attackIntensity = isAttacking ? 1.4 : 1; // More vigorous when attacking
  const signWave =
    Math.sin(time * 4.5 * attackIntensity) * (isAttacking ? 0.25 : 0.18);
  const marchBob = Math.abs(Math.sin(time * 7 * attackIntensity)) * 3 * zoom;
  const legPhase = Math.sin(time * 7 * attackIntensity);
  const chantPhase = Math.sin(time * 8 * attackIntensity);
  const armRaise =
    0.1 +
    Math.abs(Math.sin(time * 4 * attackIntensity)) *
      (isAttacking ? 0.25 : 0.15);


  // --- LEGS (jeans with details) ---
  const jeansColor = "#2d4263";
  const jeansDark = "#1e2d4a";
  const jeansLight = "#3d5273";

  // Back leg
  ctx.save();
  ctx.translate(x - size * 0.1, y + size * 0.15 - marchBob);
  ctx.rotate(legPhase * 0.25);
  // Jeans leg
  const legGrad = ctx.createLinearGradient(-size * 0.08, 0, size * 0.08, 0);
  legGrad.addColorStop(0, jeansDark);
  legGrad.addColorStop(0.5, jeansColor);
  legGrad.addColorStop(1, jeansDark);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, 0);
  ctx.lineTo(-size * 0.08, size * 0.32);
  ctx.lineTo(size * 0.08, size * 0.32);
  ctx.lineTo(size * 0.1, 0);
  ctx.closePath();
  ctx.fill();
  // Jeans cuff
  ctx.fillStyle = jeansLight;
  ctx.fillRect(-size * 0.09, size * 0.28, size * 0.18, size * 0.04);
  // Sneaker
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.09, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  // Sneaker accent
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(-size * 0.03, size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Front leg
  ctx.save();
  ctx.translate(x + size * 0.1, y + size * 0.15 - marchBob);
  ctx.rotate(-legPhase * 0.25);
  ctx.fillStyle = legGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, 0);
  ctx.lineTo(-size * 0.08, size * 0.32);
  ctx.lineTo(size * 0.08, size * 0.32);
  ctx.lineTo(size * 0.1, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = jeansLight;
  ctx.fillRect(-size * 0.09, size * 0.28, size * 0.18, size * 0.04);
  // Sneaker
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.36, size * 0.09, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(-size * 0.03, size * 0.35, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- HOODIE BODY with details ---
  const hoodieGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y,
  );
  hoodieGrad.addColorStop(0, bodyColorDark);
  hoodieGrad.addColorStop(0.3, bodyColor);
  hoodieGrad.addColorStop(0.7, bodyColor);
  hoodieGrad.addColorStop(1, bodyColorDark);

  // Main hoodie body
  ctx.fillStyle = hoodieGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.18 - marchBob);
  ctx.quadraticCurveTo(
    x - size * 0.38,
    y - size * 0.1 - marchBob,
    x - size * 0.25,
    y - size * 0.28 - marchBob,
  );
  ctx.lineTo(x + size * 0.25, y - size * 0.28 - marchBob);
  ctx.quadraticCurveTo(
    x + size * 0.38,
    y - size * 0.1 - marchBob,
    x + size * 0.32,
    y + size * 0.18 - marchBob,
  );
  ctx.closePath();
  ctx.fill();

  // Hoodie front pocket
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.05 - marchBob);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.12 - marchBob,
    x + size * 0.2,
    y + size * 0.05 - marchBob,
  );
  ctx.lineTo(x + size * 0.18, y + size * 0.15 - marchBob);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.18 - marchBob,
    x - size * 0.18,
    y + size * 0.15 - marchBob,
  );
  ctx.closePath();
  ctx.fill();
  // Pocket opening
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.08 - marchBob);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.12 - marchBob,
    x + size * 0.15,
    y + size * 0.08 - marchBob,
  );
  ctx.stroke();

  // Hoodie strings
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.2 - marchBob);
  ctx.lineTo(x - size * 0.1, y + size * 0.02 - marchBob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.2 - marchBob);
  ctx.lineTo(x + size * 0.1, y + size * 0.02 - marchBob);
  ctx.stroke();
  // String aglets
  ctx.fillStyle = "#c0c0c0";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y + size * 0.04 - marchBob,
    size * 0.015,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y + size * 0.04 - marchBob,
    size * 0.015,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // --- SIGN POLE ---
  const poleX = x + size * 0.22;
  const poleTopY = y - size * 0.85 - marchBob;
  ctx.strokeStyle = "#5d4037";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(poleX, y + size * 0.05 - marchBob);
  ctx.lineTo(poleX + signWave * size * 0.5, poleTopY);
  ctx.stroke();
  // Wood grain detail
  ctx.strokeStyle = "#8d6e63";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(poleX - size * 0.01, y - size * 0.2 - marchBob);
  ctx.lineTo(poleX + signWave * size * 0.3, y - size * 0.5 - marchBob);
  ctx.stroke();

  // --- PROTEST SIGN ---
  ctx.save();
  ctx.translate(poleX + signWave * size * 0.5, poleTopY - size * 0.15);
  ctx.rotate(signWave * 0.8);

  // Sign board with dimension
  ctx.fillStyle = "#f0f0e8";
  ctx.beginPath();
  ctx.moveTo(-size * 0.38, -size * 0.22);
  ctx.lineTo(size * 0.38, -size * 0.22);
  ctx.lineTo(size * 0.4, -size * 0.2);
  ctx.lineTo(size * 0.4, size * 0.18);
  ctx.lineTo(size * 0.38, size * 0.2);
  ctx.lineTo(-size * 0.38, size * 0.2);
  ctx.closePath();
  ctx.fill();
  // Sign edge shadow
  ctx.fillStyle = "#d0d0c8";
  ctx.beginPath();
  ctx.moveTo(size * 0.38, -size * 0.22);
  ctx.lineTo(size * 0.4, -size * 0.2);
  ctx.lineTo(size * 0.4, size * 0.18);
  ctx.lineTo(size * 0.38, size * 0.2);
  ctx.lineTo(size * 0.38, -size * 0.22);
  ctx.fill();
  // Sign border
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 3 * zoom;
  ctx.strokeRect(-size * 0.36, -size * 0.2, size * 0.72, size * 0.38);

  // Sign text - "GO TIGERS!"
  ctx.fillStyle = bodyColor;
  ctx.font = `bold ${size * 0.14}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GO", 0, -size * 0.08);
  ctx.fillStyle = "#000";
  ctx.font = `bold ${size * 0.12}px sans-serif`;
  ctx.fillText("TIGERS!", 0, size * 0.06);

  // Decorative stars
  ctx.fillStyle = bodyColorLight;
  ctx.font = `${size * 0.08}px sans-serif`;
  ctx.fillText("★", -size * 0.28, -size * 0.08);
  ctx.fillText("★", size * 0.28, -size * 0.08);

  // Sign tape strips (holding it together)
  ctx.fillStyle = "rgba(200, 190, 160, 0.5)";
  ctx.save();
  ctx.rotate(0.3);
  ctx.fillRect(-size * 0.36, -size * 0.22, size * 0.12, size * 0.03);
  ctx.restore();
  ctx.save();
  ctx.rotate(-0.25);
  ctx.fillRect(size * 0.22, size * 0.12, size * 0.14, size * 0.03);
  ctx.restore();

  // Sign bounce-jiggle exclamation lines
  const jiggle = Math.sin(time * 9 * attackIntensity);
  if (Math.abs(jiggle) > 0.5) {
    ctx.strokeStyle = `rgba(0, 0, 0, ${Math.abs(jiggle) * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.42, -size * 0.12);
    ctx.lineTo(-size * 0.48, -size * 0.16);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.42, -size * 0.1);
    ctx.lineTo(size * 0.48, -size * 0.14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.26);
    ctx.lineTo(0, -size * 0.32);
    ctx.stroke();
  }

  ctx.restore();

  // --- ARMS ---
  const skinTone = "#e8c4a0";
  const skinHighlight = "#f5dcc4";

  // Left arm (down, in pocket or relaxed)
  ctx.save();
  ctx.translate(x - size * 0.32, y - size * 0.12 - marchBob);
  // Hoodie sleeve
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.1, size * 0.1, size * 0.12, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Forearm
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.02,
    size * 0.25,
    size * 0.06,
    size * 0.1,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Hand in pocket area
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.arc(-size * 0.02, size * 0.35, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm (raised holding sign)
  ctx.save();
  ctx.translate(x + size * 0.28, y - size * 0.12 - marchBob);
  ctx.rotate(-armRaise);
  // Hoodie sleeve
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.08, size * 0.1, size * 0.12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Forearm reaching up
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(
    size * 0.03,
    -size * 0.22,
    size * 0.055,
    size * 0.12,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Hand gripping pole
  ctx.fillStyle = skinHighlight;
  ctx.beginPath();
  ctx.arc(size * 0.05, -size * 0.34, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- HEAD with beanie and expressive face ---
  const headX = x - size * 0.02;
  const headY = y - size * 0.42 - marchBob;

  // Neck
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(
    headX,
    y - size * 0.26 - marchBob,
    size * 0.07,
    size * 0.05,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Head
  const headGrad = ctx.createRadialGradient(
    headX - size * 0.03,
    headY - size * 0.03,
    0,
    headX,
    headY,
    size * 0.18,
  );
  headGrad.addColorStop(0, skinHighlight);
  headGrad.addColorStop(0.8, skinTone);
  headGrad.addColorStop(1, "#d4a574");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.17, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(
    headX - size * 0.16,
    headY,
    size * 0.03,
    size * 0.05,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    headX + size * 0.16,
    headY,
    size * 0.03,
    size * 0.05,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Beanie with ribbed texture
  const beanieGrad = ctx.createLinearGradient(
    headX - size * 0.2,
    headY,
    headX + size * 0.2,
    headY,
  );
  beanieGrad.addColorStop(0, bodyColorDark);
  beanieGrad.addColorStop(0.5, bodyColor);
  beanieGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = beanieGrad;
  ctx.beginPath();
  ctx.arc(
    headX,
    headY - size * 0.02,
    size * 0.19,
    Math.PI * 0.95,
    Math.PI * 2.05,
  );
  ctx.quadraticCurveTo(headX, headY - size * 0.28, headX, headY - size * 0.24);
  ctx.closePath();
  ctx.fill();

  // Beanie ribbing lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 5; i++) {
    const ribX = headX - size * 0.12 + i * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(ribX, headY - size * 0.08);
    ctx.quadraticCurveTo(
      ribX,
      headY - size * 0.18,
      ribX + size * 0.01,
      headY - size * 0.22,
    );
    ctx.stroke();
  }

  // Beanie fold/cuff
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.arc(
    headX,
    headY - size * 0.04,
    size * 0.18,
    Math.PI * 0.98,
    Math.PI * 2.02,
  );
  ctx.arc(
    headX,
    headY - size * 0.04,
    size * 0.15,
    Math.PI * 2.02,
    Math.PI * 0.98,
    true,
  );
  ctx.closePath();
  ctx.fill();

  // Pom-pom with fluffy texture
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.3, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Pom-pom fluff detail
  ctx.fillStyle = bodyColorLight;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + time * 0.5;
    ctx.beginPath();
    ctx.arc(
      headX + Math.cos(angle) * size * 0.04,
      headY - size * 0.3 + Math.sin(angle) * size * 0.04,
      size * 0.025,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Expressive eyebrows (raised in enthusiasm)
  ctx.strokeStyle = "#4a3728";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    headX - size * 0.11,
    headY - size * 0.06 - chantPhase * size * 0.02,
  );
  ctx.quadraticCurveTo(
    headX - size * 0.07,
    headY - size * 0.09 - chantPhase * size * 0.02,
    headX - size * 0.03,
    headY - size * 0.06,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.03, headY - size * 0.06);
  ctx.quadraticCurveTo(
    headX + size * 0.07,
    headY - size * 0.09 - chantPhase * size * 0.02,
    headX + size * 0.11,
    headY - size * 0.06 - chantPhase * size * 0.02,
  );
  ctx.stroke();

  // Passionate eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    headX - size * 0.07,
    headY + size * 0.01,
    size * 0.035,
    size * 0.028,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    headX + size * 0.07,
    headY + size * 0.01,
    size * 0.035,
    size * 0.028,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Pupils
  ctx.fillStyle = "#2d1f1a";
  ctx.beginPath();
  ctx.arc(
    headX - size * 0.065,
    headY + size * 0.01,
    size * 0.018,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    headX + size * 0.075,
    headY + size * 0.01,
    size * 0.018,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(headX - size * 0.07, headY, size * 0.006, 0, Math.PI * 2);
  ctx.arc(headX + size * 0.07, headY, size * 0.006, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.moveTo(headX, headY + size * 0.02);
  ctx.lineTo(headX - size * 0.02, headY + size * 0.07);
  ctx.lineTo(headX + size * 0.02, headY + size * 0.07);
  ctx.closePath();
  ctx.fill();

  // Open mouth (chanting!) - animated
  const mouthOpen = 0.03 + Math.abs(chantPhase) * 0.03;
  ctx.fillStyle = "#8b4a4a";
  ctx.beginPath();
  ctx.ellipse(
    headX,
    headY + size * 0.12,
    size * 0.05,
    size * mouthOpen,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Teeth hint
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.rect(headX - size * 0.03, headY + size * 0.1, size * 0.06, size * 0.015);
  ctx.fill();
  // Tongue
  ctx.fillStyle = "#c77070";
  ctx.beginPath();
  ctx.ellipse(
    headX,
    headY + size * 0.13,
    size * 0.025,
    size * 0.015,
    0,
    0,
    Math.PI,
  );
  ctx.fill();

  // Rosy cheeks (passionate)
  ctx.fillStyle = "rgba(255, 150, 150, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    headX - size * 0.1,
    headY + size * 0.05,
    size * 0.03,
    size * 0.02,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    headX + size * 0.1,
    headY + size * 0.05,
    size * 0.03,
    size * 0.02,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Breath puff effect (cold weather chanting)
  const breathCycle = (Math.sin(time * 8 * attackIntensity) + 1) * 0.5;
  if (breathCycle > 0.4) {
    for (let bp = 0; bp < 3; bp++) {
      const puffPhase = (time * 1.5 + bp * 0.4) % 1.8;
      const puffX =
        headX - size * 0.08 - puffPhase * size * 0.15 +
        Math.sin(time + bp) * size * 0.02;
      const puffY =
        headY + size * 0.12 - puffPhase * size * 0.08;
      const puffAlpha = Math.max(0, (0.2 - puffPhase * 0.1) * breathCycle);
      const puffSize = size * (0.02 + puffPhase * 0.025);
      ctx.fillStyle = `rgba(220, 230, 245, ${puffAlpha})`;
      ctx.beginPath();
      ctx.arc(puffX, puffY, puffSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- ANIMATED EFFECTS ---

  // Protest leaf/debris swirl
  drawLeafSwirl(ctx, headX, y - size * 0.1 - marchBob, size * 0.25, time, zoom, {
    color: "rgba(180, 120, 40, 0.45)",
    colorAlt: "rgba(100, 160, 50, 0.4)",
    count: 5,
    speed: 1.8,
    maxAlpha: isAttacking ? 0.55 : 0.35,
  });

  // Floating sign fragments / debris orbiting body
  drawShiftingSegments(ctx, headX, y - size * 0.15 - marchBob, size, time, zoom, {
    color: "#f0f0e8",
    colorAlt: bodyColor,
    count: 5,
    orbitRadius: 0.38,
    segmentSize: 0.03,
    orbitSpeed: 1.2,
    shape: "shard",
  });

  // Leaves / paper particles orbiting
  drawOrbitingDebris(ctx, headX, y - size * 0.05 - marchBob, size, time, zoom, {
    color: "rgba(100, 160, 60, 0.7)",
    glowColor: "rgba(140, 180, 80, 0.2)",
    count: 6,
    speed: 1.6,
    particleSize: 0.018,
    minRadius: 0.28,
    maxRadius: 0.48,
    trailLen: 2,
  });
}
