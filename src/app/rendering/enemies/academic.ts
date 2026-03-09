import {
  drawFaceCircle,
  drawEyes,
  drawRobeBody,
} from "./helpers";

export function drawFreshmanEnemy(
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
  // CORRUPTED NEOPHYTE - Possessed first-year consumed by eldritch knowledge
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const bobble =
    Math.sin(time * 6) * 2 * zoom +
    (isAttacking ? attackIntensity * size * 0.15 : 0);
  const pulseIntensity = 0.5 + Math.sin(time * 4) * 0.3 + attackIntensity * 0.3;
  const runeGlow = 0.6 + Math.sin(time * 5) * 0.4 + attackIntensity * 0.4;
  const corruptionPulse =
    0.4 + Math.sin(time * 7) * 0.3 + attackIntensity * 0.3;
  const chainsRattle =
    Math.sin(time * 8) * size * 0.02 +
    (isAttacking ? Math.sin(attackPhase * Math.PI * 4) * size * 0.04 : 0);

  // Void distortion field
  ctx.strokeStyle = `rgba(0, 20, 0, ${pulseIntensity * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const distortPhase = (time * 0.8 + i * 0.3) % 2;
    const distortSize = size * 0.3 + distortPhase * size * 0.4;
    ctx.globalAlpha = 0.4 * (1 - distortPhase / 2);
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.15) {
      const r = distortSize + Math.sin(a * 5 + time * 4) * size * 0.04;
      const wx = x + Math.cos(a) * r;
      const wy = y + Math.sin(a) * r * 0.7;
      if (a === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Dark corruption aura with inner darkness
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
  auraGrad.addColorStop(0, `rgba(20, 80, 20, ${pulseIntensity * 0.35})`);
  auraGrad.addColorStop(0.3, `rgba(74, 222, 128, ${pulseIntensity * 0.2})`);
  auraGrad.addColorStop(0.6, `rgba(34, 197, 94, ${pulseIntensity * 0.1})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Floating corruption particles with trails
  for (let i = 0; i < 8; i++) {
    const particleAngle = time * 2 + i * Math.PI * 0.25;
    const particleDist = size * 0.45 + Math.sin(time * 3 + i) * size * 0.12;
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y - size * 0.1 + Math.sin(particleAngle) * particleDist * 0.4;
    // Trail
    ctx.strokeStyle = `rgba(74, 222, 128, ${0.2})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(
      px + Math.cos(particleAngle + Math.PI) * size * 0.08,
      py + Math.sin(particleAngle + Math.PI) * size * 0.04,
    );
    ctx.stroke();
    // Particle core (optimized - no shadowBlur)
    ctx.fillStyle = `rgba(120, 255, 160, ${0.6 + Math.sin(time * 5 + i) * 0.3})`;
    ctx.beginPath();
    ctx.arc(
      px,
      py,
      size * 0.02 + Math.sin(time * 6 + i) * size * 0.008,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Eldritch tentacles emerging from ground
  ctx.strokeStyle = `rgba(30, 80, 30, ${corruptionPulse * 0.7})`;
  ctx.lineWidth = 3 * zoom;
  for (let i = 0; i < 4; i++) {
    const tentacleAngle =
      -Math.PI * 0.8 + i * Math.PI * 0.4 + Math.sin(time * 2) * 0.1;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(tentacleAngle) * size * 0.35, y + size * 0.48);
    ctx.quadraticCurveTo(
      x +
        Math.cos(tentacleAngle) * size * 0.45 +
        Math.sin(time * 3 + i) * size * 0.08,
      y + size * 0.25,
      x +
        Math.cos(tentacleAngle) * size * 0.3 +
        Math.sin(time * 4 + i) * size * 0.1,
      y + size * 0.1 + Math.sin(time * 5 + i) * size * 0.05,
    );
    ctx.stroke();
    // Tentacle tip
    ctx.fillStyle = `rgba(74, 222, 128, ${corruptionPulse})`;
    ctx.beginPath();
    ctx.arc(
      x +
        Math.cos(tentacleAngle) * size * 0.3 +
        Math.sin(time * 4 + i) * size * 0.1,
      y + size * 0.1 + Math.sin(time * 5 + i) * size * 0.05,
      size * 0.015,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }


  // Floating forbidden tome (behind) - more ornate
  ctx.save();
  ctx.translate(x - size * 0.38, y - size * 0.15 + Math.sin(time * 3) * 4);
  ctx.rotate(Math.sin(time * 2) * 0.15);
  // Book shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(-size * 0.11, -size * 0.13, size * 0.24, size * 0.3);
  // Leather cover with metal corners
  ctx.fillStyle = "#0a1a0a";
  ctx.fillRect(-size * 0.13, -size * 0.16, size * 0.26, size * 0.32);
  ctx.fillStyle = "#1a2a1a";
  ctx.fillRect(-size * 0.11, -size * 0.14, size * 0.22, size * 0.28);
  // Metal corner plates
  ctx.fillStyle = "#3a5a3a";
  ctx.fillRect(-size * 0.13, -size * 0.16, size * 0.05, size * 0.05);
  ctx.fillRect(size * 0.08, -size * 0.16, size * 0.05, size * 0.05);
  ctx.fillRect(-size * 0.13, size * 0.11, size * 0.05, size * 0.05);
  ctx.fillRect(size * 0.08, size * 0.11, size * 0.05, size * 0.05);
  // Glowing pages with pulsing light
  ctx.fillStyle = `rgba(74, 222, 128, ${runeGlow * 0.4})`;
  ctx.fillRect(-size * 0.09, -size * 0.1, size * 0.18, size * 0.2);
  // Ancient eldritch runes
  // Runes (optimized - no shadowBlur)
  ctx.fillStyle = `rgba(120, 255, 160, ${runeGlow})`;
  ctx.font = `${size * 0.07}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ᛟᚨᛏ", 0, -size * 0.02);
  ctx.fillText("ᚷᛁᚱ", 0, size * 0.06);
  // Floating pages
  for (let p = 0; p < 3; p++) {
    const pageAngle = time * 1.5 + p * Math.PI * 0.6;
    const pageX = Math.cos(pageAngle) * size * 0.15;
    const pageY = Math.sin(pageAngle) * size * 0.08 - size * 0.05;
    ctx.fillStyle = `rgba(200, 230, 200, ${0.4 + Math.sin(time * 4 + p) * 0.2})`;
    ctx.save();
    ctx.translate(pageX, pageY);
    ctx.rotate(Math.sin(time * 3 + p) * 0.3);
    ctx.fillRect(-size * 0.03, -size * 0.04, size * 0.06, size * 0.08);
    ctx.restore();
  }
  ctx.restore();

  // Ethereal chains binding the initiate
  ctx.strokeStyle = `rgba(74, 222, 128, ${corruptionPulse * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  for (let c = 0; c < 2; c++) {
    const chainSide = c === 0 ? -1 : 1;
    ctx.beginPath();
    for (let link = 0; link < 6; link++) {
      const linkX =
        x +
        chainSide * (size * 0.2 + link * size * 0.05) +
        chainsRattle * chainSide;
      const linkY =
        y - size * 0.1 + Math.sin(time * 4 + link * 0.5) * size * 0.02;
      ctx.arc(linkX, linkY, size * 0.015, 0, Math.PI * 2);
    }
    ctx.stroke();
  }

  // Tattered robes with corruption spreading
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y - size * 0.3,
    x + size * 0.35,
    y + size * 0.5,
  );
  robeGrad.addColorStop(0, "#1a3a1a");
  robeGrad.addColorStop(0.2, "#2a5a2a");
  robeGrad.addColorStop(0.4, "#3a7a3a");
  robeGrad.addColorStop(0.6, "#4a9a4a");
  robeGrad.addColorStop(0.8, "#3a7a3a");
  robeGrad.addColorStop(1, "#1a3a1a");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.48);
  ctx.quadraticCurveTo(
    x - size * 0.42,
    y - size * 0.08,
    x - size * 0.18,
    y - size * 0.32,
  );
  ctx.lineTo(x + size * 0.18, y - size * 0.32);
  ctx.quadraticCurveTo(
    x + size * 0.42,
    y - size * 0.08,
    x + size * 0.35,
    y + size * 0.48,
  );
  // More dramatic tattered bottom
  for (let i = 0; i < 8; i++) {
    const jagX = x - size * 0.35 + i * size * 0.1;
    const jagY =
      y +
      size * 0.48 +
      Math.sin(time * 4 + i * 1.3) * size * 0.04 +
      (i % 2) * size * 0.06 +
      (i % 3) * size * 0.03;
    ctx.lineTo(jagX, jagY);
  }
  ctx.closePath();
  ctx.fill();

  // Corruption veins spreading across robe
  ctx.strokeStyle = `rgba(74, 222, 128, ${pulseIntensity * 0.7})`;
  ctx.lineWidth = 2 * zoom;
  for (let v = 0; v < 6; v++) {
    const veinStartX = x - size * 0.25 + v * size * 0.1;
    const veinStartY = y - size * 0.2 + Math.sin(v) * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(veinStartX, veinStartY);
    ctx.quadraticCurveTo(
      veinStartX + Math.sin(time * 2 + v) * size * 0.08,
      veinStartY + size * 0.15,
      veinStartX + Math.cos(v) * size * 0.1,
      y + size * 0.35,
    );
    ctx.stroke();
    // Vein nodes
    ctx.fillStyle = `rgba(74, 222, 128, ${corruptionPulse})`;
    ctx.beginPath();
    ctx.arc(
      veinStartX + Math.cos(v) * size * 0.05,
      veinStartY + size * 0.1,
      size * 0.01,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Arcane symbols on robe
  ctx.fillStyle = `rgba(100, 255, 150, ${runeGlow * 0.6})`;
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⍟", x - size * 0.12, y + size * 0.05);
  ctx.fillText("◈", x + size * 0.12, y + size * 0.15);
  ctx.fillText("⌬", x, y + size * 0.28);

  // Hood casting deep shadow with corruption dripping
  ctx.fillStyle = "#0a1a0a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.35 + bobble * 0.3,
    size * 0.28,
    size * 0.2,
    0,
    Math.PI,
    0,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.35 + bobble * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.34,
    y - size * 0.12,
    x - size * 0.26,
    y + size * 0.08,
  );
  ctx.lineTo(x - size * 0.18, y - size * 0.18);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y - size * 0.35 + bobble * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.34,
    y - size * 0.12,
    x + size * 0.26,
    y + size * 0.08,
  );
  ctx.lineTo(x + size * 0.18, y - size * 0.18);
  ctx.fill();

  // Face (pale, gaunt, corrupted)
  drawFaceCircle(ctx, x, y - size * 0.4 + bobble, size * 0.22, [
    { offset: 0, color: "#d0f0d0" },
    { offset: 0.6, color: "#a8d8a8" },
    { offset: 1, color: "#80b080" },
  ], size * 0.2);

  // Corruption spreading across face
  ctx.strokeStyle = "#2a6a2a";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.32 + bobble);
  ctx.quadraticCurveTo(
    x - size * 0.1,
    y - size * 0.28 + bobble,
    x - size * 0.06,
    y - size * 0.24 + bobble,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.36 + bobble);
  ctx.quadraticCurveTo(
    x + size * 0.14,
    y - size * 0.3 + bobble,
    x + size * 0.1,
    y - size * 0.26 + bobble,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.54 + bobble);
  ctx.quadraticCurveTo(
    x + size * 0.04,
    y - size * 0.48 + bobble,
    x + size * 0.02,
    y - size * 0.42 + bobble,
  );
  ctx.stroke();

  // Possessed glowing eyes with void pupils (optimized - no shadowBlur)
  drawEyes(ctx, x, y - size * 0.42 + bobble, size * 0.07, [
    { radius: size * 0.07, color: "rgba(74, 222, 128, 0.3)" },
    { radius: size * 0.045, color: "#4ade80" },
    { radius: size * 0.018, color: "#001000" },
    { radius: size * 0.01, color: "rgba(200, 255, 200, 0.6)", yOffset: -size * 0.02, xOffset: -size * 0.01 },
  ]);

  // Grimacing mouth with sharp fangs
  ctx.fillStyle = "#0a1a0a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.28 + bobble,
    size * 0.07,
    size * 0.035,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Upper fangs
  ctx.fillStyle = "#e8f8e8";
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04 + f * size * 0.027, y - size * 0.29 + bobble);
    ctx.lineTo(x - size * 0.035 + f * size * 0.027, y - size * 0.24 + bobble);
    ctx.lineTo(x - size * 0.03 + f * size * 0.027, y - size * 0.29 + bobble);
    ctx.fill();
  }

  // Magical energy swirling from both hands
  for (let hand = 0; hand < 2; hand++) {
    const handX = x + (hand === 0 ? -1 : 1) * size * 0.28;
    const handY = y + size * 0.08;
    // Energy orb (optimized - no shadowBlur)
    ctx.fillStyle = `rgba(74, 222, 128, ${pulseIntensity * 0.4})`;
    ctx.beginPath();
    ctx.arc(handX, handY, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(120, 255, 160, ${pulseIntensity * 0.9})`;
    ctx.beginPath();
    ctx.arc(handX, handY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    // Expanding rings
    ctx.strokeStyle = `rgba(74, 222, 128, ${pulseIntensity})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let ring = 0; ring < 4; ring++) {
      const ringPhase = (time * 2.5 + ring * 0.25) % 1;
      ctx.globalAlpha = 1 - ringPhase;
      ctx.beginPath();
      ctx.arc(
        handX,
        handY,
        size * 0.04 + ringPhase * size * 0.18,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Eldritch sigil above head
  ctx.save();
  ctx.translate(x, y - size * 0.65 + bobble + Math.sin(time * 2) * size * 0.02);
  ctx.rotate(time * 0.5);
  ctx.strokeStyle = `rgba(74, 222, 128, ${runeGlow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  // Inner triangle
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
    if (i === 0)
      ctx.moveTo(Math.cos(angle) * size * 0.05, Math.sin(angle) * size * 0.05);
    else
      ctx.lineTo(Math.cos(angle) * size * 0.05, Math.sin(angle) * size * 0.05);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function drawSophomoreEnemy(
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
  // STORM APPRENTICE - Arrogant spellcaster channeling tempest magic with crackling lightning
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const swagger =
    Math.sin(time * 5) * 3 * zoom +
    (isAttacking ? attackIntensity * size * 0.12 : 0);
  const magicPulse = 0.6 + Math.sin(time * 4) * 0.4 + attackIntensity * 0.4;
  const stormIntensity = 0.5 + Math.sin(time * 6) * 0.3 + attackIntensity * 0.5;
  const lightningFlash =
    Math.random() > 0.95 || isAttacking
      ? isAttacking
        ? attackIntensity
        : 1
      : 0;

  // Storm vortex aura
  ctx.save();
  for (let ring = 0; ring < 5; ring++) {
    const ringSize = size * 0.3 + ring * size * 0.12;
    ctx.strokeStyle = `rgba(96, 165, 250, ${(0.3 - ring * 0.05) * magicPulse})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, ringSize, time * 2 + ring, time * 2 + ring + Math.PI * 1.5);
    ctx.stroke();
  }
  ctx.restore();

  // Blue elemental aura with storm effects
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
  auraGrad.addColorStop(0, `rgba(59, 130, 246, ${magicPulse * 0.35})`);
  auraGrad.addColorStop(0.3, `rgba(96, 165, 250, ${magicPulse * 0.25})`);
  auraGrad.addColorStop(0.6, `rgba(147, 197, 253, ${magicPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Lightning bolts crackling around
  if (lightningFlash || Math.sin(time * 15) > 0.8) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    for (let bolt = 0; bolt < 2; bolt++) {
      const boltAngle = time * 3 + bolt * Math.PI;
      const startX = x + Math.cos(boltAngle) * size * 0.4;
      const startY = y - size * 0.3 + Math.sin(boltAngle) * size * 0.2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      let bx = startX,
        by = startY;
      for (let seg = 0; seg < 4; seg++) {
        bx += (Math.random() - 0.5) * size * 0.15;
        by += size * 0.08;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
  }

  // Floating arcane symbols (optimized - no shadowBlur)
  for (let i = 0; i < 6; i++) {
    const symbolAngle = time * 1.5 + i * Math.PI * 0.33;
    const symbolDist = size * 0.5 + Math.sin(time * 2 + i) * size * 0.05;
    const sx = x + Math.cos(symbolAngle) * symbolDist;
    const sy = y - size * 0.1 + Math.sin(symbolAngle) * symbolDist * 0.35;
    ctx.fillStyle = `rgba(180, 215, 255, ${0.6 + Math.sin(time * 4 + i) * 0.3})`;
    ctx.font = `${size * 0.1}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["⚡", "◇", "△", "☆", "◈", "⍟"][i], sx, sy);
  }

  // Storm cloud wisps
  for (let w = 0; w < 4; w++) {
    const wispX = x + Math.sin(time * 1.5 + w * 1.5) * size * 0.35;
    const wispY = y - size * 0.5 + Math.cos(time * 1.2 + w) * size * 0.1;
    ctx.fillStyle = `rgba(100, 130, 170, ${0.3 + Math.sin(time * 3 + w) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(wispX, wispY, size * 0.08, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }


  // Flowing apprentice robes with storm patterns
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y - size * 0.3,
    x + size * 0.4,
    y + size * 0.5,
  );
  robeGrad.addColorStop(0, "#0c1929");
  robeGrad.addColorStop(0.2, "#1e3a5f");
  robeGrad.addColorStop(0.4, "#2563eb");
  robeGrad.addColorStop(0.5, "#3b82f6");
  robeGrad.addColorStop(0.6, "#2563eb");
  robeGrad.addColorStop(0.8, "#1e3a5f");
  robeGrad.addColorStop(1, "#0c1929");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5);
  ctx.quadraticCurveTo(
    x - size * 0.44,
    y,
    x - size * 0.22,
    y - size * 0.32 + swagger * 0.2,
  );
  ctx.lineTo(x + size * 0.22, y - size * 0.32 + swagger * 0.2);
  ctx.quadraticCurveTo(x + size * 0.44, y, x + size * 0.38, y + size * 0.5);
  // Dramatic flowing bottom
  for (let i = 0; i < 7; i++) {
    const waveX = x - size * 0.38 + i * size * 0.1267;
    const waveY =
      y +
      size * 0.5 +
      Math.sin(time * 4 + i) * size * 0.04 +
      (i % 2) * size * 0.03;
    ctx.lineTo(waveX, waveY);
  }
  ctx.closePath();
  ctx.fill();

  // Lightning patterns on robe
  ctx.strokeStyle = `rgba(147, 197, 253, ${stormIntensity * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let p = 0; p < 4; p++) {
    const startX = x - size * 0.2 + p * size * 0.13;
    ctx.beginPath();
    ctx.moveTo(startX, y - size * 0.15);
    let px = startX;
    for (let seg = 0; seg < 3; seg++) {
      px += (Math.random() - 0.5) * size * 0.06;
      ctx.lineTo(px, y + seg * size * 0.12);
    }
    ctx.stroke();
  }

  // Ornate silver trim with gems
  ctx.strokeStyle = "#e0e7ff";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.28 + swagger * 0.2);
  ctx.lineTo(x - size * 0.17, y + size * 0.38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.28 + swagger * 0.2);
  ctx.lineTo(x + size * 0.17, y + size * 0.38);
  ctx.stroke();
  // Gem on trim (optimized - no shadowBlur)
  ctx.fillStyle = "#93c5fd";
  ctx.beginPath();
  ctx.arc(x - size * 0.155, y + size * 0.1, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.155, y + size * 0.1, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Apprentice sash with arcane embroidery
  const sashGrad = ctx.createLinearGradient(
    x - size * 0.25,
    y - size * 0.1,
    x + size * 0.25,
    y,
  );
  sashGrad.addColorStop(0, "#b8860b");
  sashGrad.addColorStop(0.5, "#fbbf24");
  sashGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = sashGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.12);
  ctx.quadraticCurveTo(x, y + size * 0.08, x + size * 0.28, y - size * 0.12);
  ctx.lineTo(x + size * 0.25, y + size * 0.02);
  ctx.quadraticCurveTo(x, y + size * 0.18, x - size * 0.25, y + size * 0.02);
  ctx.fill();
  // Sash emblem
  ctx.fillStyle = "#1e3a5f";
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⚡", x, y);

  // Confident face with magical features
  drawFaceCircle(ctx, x, y - size * 0.44 + swagger * 0.15, size * 0.24, [
    { offset: 0, color: "#fde8d8" },
    { offset: 0.7, color: "#fcd9b6" },
    { offset: 1, color: "#e5c4a0" },
  ], size * 0.23);

  // Stylish swept hair with magical highlights
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.54 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y - size * 0.75,
    x - size * 0.05,
    y - size * 0.72 + swagger * 0.15,
  );
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y - size * 0.78,
    x + size * 0.28,
    y - size * 0.62 + swagger * 0.15,
  );
  ctx.quadraticCurveTo(
    x + size * 0.25,
    y - size * 0.5,
    x + size * 0.2,
    y - size * 0.52 + swagger * 0.15,
  );
  ctx.lineTo(x - size * 0.2, y - size * 0.52 + swagger * 0.15);
  ctx.fill();
  // Magical blue streaks in hair
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.64 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y - size * 0.72,
    x + size * 0.2,
    y - size * 0.64 + swagger * 0.15,
  );
  ctx.stroke();
  ctx.strokeStyle = "#93c5fd";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.68 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.12,
    y - size * 0.74,
    x + size * 0.22,
    y - size * 0.58 + swagger * 0.15,
  );
  ctx.stroke();

  // Confident glowing eyes with storm power
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.085,
    y - size * 0.46 + swagger * 0.15,
    size * 0.06,
    size * 0.07,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.085,
    y - size * 0.46 + swagger * 0.15,
    size * 0.06,
    size * 0.07,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Electric blue magical pupils + inner spark
  drawEyes(ctx, x, y - size * 0.46 + swagger * 0.15, size * 0.085, [
    { radius: size * 0.035, color: "#60a5fa" },
    { radius: size * 0.012, color: "#dbeafe", yOffset: -size * 0.015, xOffset: -size * 0.01 },
  ]);

  // Cocky raised eyebrow
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.54 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x - size * 0.09,
    y - size * 0.58,
    x - size * 0.02,
    y - size * 0.52 + swagger * 0.15,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.54 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.11,
    y - size * 0.6,
    x + size * 0.16,
    y - size * 0.52 + swagger * 0.15,
  );
  ctx.stroke();

  // Smug smirk
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.07, y - size * 0.32 + swagger * 0.15);
  ctx.quadraticCurveTo(
    x + size * 0.02,
    y - size * 0.27,
    x + size * 0.1,
    y - size * 0.35 + swagger * 0.15,
  );
  ctx.stroke();

  // Massive glowing storm orb in hand
  // Magic orb (optimized - layered glow instead of shadowBlur)
  ctx.fillStyle = `rgba(59, 130, 246, ${magicPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.42, y + swagger * 0.1, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(96, 165, 250, ${magicPulse * 0.9})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.42, y + swagger * 0.1, size * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // Inner storm core
  ctx.fillStyle = "#dbeafe";
  ctx.beginPath();
  ctx.arc(x + size * 0.42, y + swagger * 0.1, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Mini lightning in orb
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5 * zoom;
  for (let l = 0; l < 3; l++) {
    const lAngle = time * 8 + l * Math.PI * 0.67;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.42, y + swagger * 0.1);
    ctx.lineTo(
      x + size * 0.42 + Math.cos(lAngle) * size * 0.1,
      y + swagger * 0.1 + Math.sin(lAngle) * size * 0.1,
    );
    ctx.stroke();
  }
  // Energy rings around orb
  ctx.strokeStyle = `rgba(147, 197, 253, ${magicPulse})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const wispAngle = time * 5 + i * Math.PI * 0.5;
    ctx.beginPath();
    ctx.arc(
      x + size * 0.42,
      y + swagger * 0.1,
      size * 0.15 + i * size * 0.03,
      wispAngle,
      wispAngle + Math.PI * 0.6,
    );
    ctx.stroke();
  }

  // Secondary spell forming in other hand (optimized - no shadowBlur)
  ctx.fillStyle = `rgba(200, 220, 255, ${stormIntensity * 0.7})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.35,
    y + size * 0.1 + swagger * 0.05,
    size * 0.06,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

export function drawJuniorEnemy(
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
  // MAD ARCHIVIST - Scholar driven insane by forbidden knowledge, reality tears around them
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const twitch =
    Math.sin(time * 8) * 2 * zoom +
    Math.sin(time * 13) * 1 * zoom +
    (isAttacking ? attackIntensity * size * 0.15 : 0);
  const madnessPulse = 0.5 + Math.sin(time * 5) * 0.3 + attackIntensity * 0.4;
  const bookFloat =
    Math.sin(time * 2) * 4 + (isAttacking ? attackIntensity * 8 : 0);
  const realityTear = 0.4 + Math.sin(time * 7) * 0.3 + attackIntensity * 0.4;
  const eyeSpasm =
    Math.sin(time * 15) * size * 0.01 +
    (isAttacking ? Math.sin(attackPhase * Math.PI * 6) * size * 0.02 : 0);

  // Reality fractures around the scholar
  ctx.strokeStyle = `rgba(147, 51, 234, ${realityTear * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let f = 0; f < 5; f++) {
    const fractureAngle = time * 0.5 + f * Math.PI * 0.4;
    const fractureLen = size * (0.3 + Math.sin(time * 2 + f) * 0.1);
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(fractureAngle) * size * 0.3,
      y + Math.sin(fractureAngle) * size * 0.2,
    );
    for (let seg = 0; seg < 4; seg++) {
      const segX =
        x +
        Math.cos(fractureAngle) * (size * 0.3 + seg * fractureLen * 0.25) +
        (Math.random() - 0.5) * size * 0.05;
      const segY =
        y + Math.sin(fractureAngle) * (size * 0.2 + seg * fractureLen * 0.15);
      ctx.lineTo(segX, segY);
    }
    ctx.stroke();
  }

  // Purple madness aura with void tendrils
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  auraGrad.addColorStop(0, `rgba(139, 92, 246, ${madnessPulse * 0.35})`);
  auraGrad.addColorStop(0.3, `rgba(192, 132, 252, ${madnessPulse * 0.25})`);
  auraGrad.addColorStop(0.6, `rgba(147, 51, 234, ${madnessPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Floating ancient tomes orbiting with chains
  for (let i = 0; i < 5; i++) {
    const bookAngle = time * 1.2 + i * Math.PI * 0.4;
    const bookDist = size * 0.55 + Math.sin(time * 1.5 + i) * size * 0.08;
    const bx = x + Math.cos(bookAngle) * bookDist;
    const by =
      y - size * 0.08 + Math.sin(bookAngle) * bookDist * 0.35 + bookFloat;

    // Ethereal chain to book
    ctx.strokeStyle = `rgba(147, 51, 234, ${madnessPulse * 0.4})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.2);
    ctx.quadraticCurveTo(
      x + Math.cos(bookAngle) * bookDist * 0.5,
      y - size * 0.1 + Math.sin(bookAngle) * bookDist * 0.2,
      bx,
      by,
    );
    ctx.stroke();

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(Math.sin(time * 2.5 + i) * 0.25);
    // Ornate book cover
    ctx.fillStyle = ["#2a0a3a", "#0a1a3a", "#3a0a2a", "#1a0a2a", "#0a2a1a"][i];
    ctx.fillRect(-size * 0.07, -size * 0.09, size * 0.14, size * 0.18);
    // Metal clasp
    ctx.fillStyle = "#8b5cf6";
    ctx.fillRect(-size * 0.075, -size * 0.02, size * 0.015, size * 0.04);
    // Aged pages
    ctx.fillStyle = "#fef9c3";
    ctx.fillRect(-size * 0.055, -size * 0.075, size * 0.11, size * 0.15);
    // Glowing forbidden runes (optimized - no shadowBlur)
    ctx.fillStyle = `rgba(220, 180, 255, ${madnessPulse})`;
    ctx.font = `${size * 0.055}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["◈", "⍟", "⌬", "☆", "◇"][i], 0, size * 0.015);
    ctx.restore();
  }

  // Knowledge tendrils - eldritch whispers made visible
  ctx.strokeStyle = `rgba(147, 51, 234, ${madnessPulse * 0.6})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 7; i++) {
    const tendrilAngle = -Math.PI * 0.7 + i * Math.PI * 0.2;
    const tendrilPhase = time * 3 + i * 0.5;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(tendrilAngle) * size * 0.18,
      y - size * 0.52 + twitch * 0.3,
    );
    ctx.bezierCurveTo(
      x +
        Math.cos(tendrilAngle) * size * 0.35 +
        Math.sin(tendrilPhase) * size * 0.12,
      y - size * 0.65 - i * size * 0.04,
      x +
        Math.cos(tendrilAngle + 0.2) * size * 0.45 +
        Math.cos(tendrilPhase * 1.5) * size * 0.08,
      y - size * 0.75 + Math.sin(tendrilPhase * 0.7) * size * 0.08,
      x + Math.cos(tendrilAngle) * size * 0.5,
      y - size * 0.85 + Math.sin(tendrilPhase) * size * 0.12,
    );
    ctx.stroke();
    // Tendril tip glow
    ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(tendrilAngle) * size * 0.5,
      y - size * 0.85 + Math.sin(tendrilPhase) * size * 0.12,
      size * 0.015,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Floating text fragments - whispered secrets
  ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.5})`;
  ctx.font = `${size * 0.04}px serif`;
  for (let t = 0; t < 6; t++) {
    const textX = x + Math.sin(time * 1.5 + t * 1.2) * size * 0.5;
    const textY = y - size * 0.2 + Math.cos(time * 0.8 + t) * size * 0.3;
    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate(Math.sin(time * 2 + t) * 0.3);
    ctx.fillText(["truth", "void", "KNOW", "see", "END", "∞"][t], 0, 0);
    ctx.restore();
  }


  // Disheveled scholar robes - worn and stained with ink
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y - size * 0.35,
    x + size * 0.4,
    y + size * 0.55,
  );
  robeGrad.addColorStop(0, "#1e0a30");
  robeGrad.addColorStop(0.2, "#3b0764");
  robeGrad.addColorStop(0.4, "#6b21a8");
  robeGrad.addColorStop(0.5, "#7c3aed");
  robeGrad.addColorStop(0.6, "#6b21a8");
  robeGrad.addColorStop(0.8, "#3b0764");
  robeGrad.addColorStop(1, "#1e0a30");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y + size * 0.52);
  ctx.quadraticCurveTo(x - size * 0.42, y, x - size * 0.2, y - size * 0.34);
  ctx.lineTo(x + size * 0.2, y - size * 0.34);
  ctx.quadraticCurveTo(x + size * 0.42, y, x + size * 0.36, y + size * 0.52);
  // Extremely tattered bottom
  for (let i = 0; i < 10; i++) {
    const tearX = x - size * 0.36 + i * size * 0.072;
    const tearY =
      y +
      size * 0.52 +
      Math.sin(time * 3 + i * 1.7) * size * 0.04 +
      (i % 2) * size * 0.07 +
      (i % 3) * size * 0.04;
    ctx.lineTo(tearX, tearY);
  }
  ctx.closePath();
  ctx.fill();

  // Ink stains on robe
  ctx.fillStyle = "rgba(30, 10, 50, 0.6)";
  for (let s = 0; s < 4; s++) {
    ctx.beginPath();
    ctx.ellipse(
      x - size * 0.15 + s * size * 0.1,
      y + size * 0.1 + Math.sin(s) * size * 0.15,
      size * 0.04,
      size * 0.06,
      Math.sin(s),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Ancient symbols burning into robe (optimized - no shadowBlur)
  ctx.fillStyle = `rgba(220, 180, 255, ${madnessPulse * 0.8})`;
  ctx.font = `${size * 0.09}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⍟", x, y + size * 0.08);
  ctx.fillText("⌘", x - size * 0.18, y + size * 0.28);
  ctx.fillText("⌬", x + size * 0.18, y + size * 0.22);
  ctx.fillText("◈", x, y + size * 0.38);

  // Cracked spectacles floating askew with one lens missing
  ctx.save();
  ctx.translate(x, y - size * 0.46 + twitch * 0.25);
  ctx.rotate(0.08 + Math.sin(time * 3.5) * 0.05);
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 2.5 * zoom;
  // Left lens frame (lens cracked)
  ctx.beginPath();
  ctx.rect(-size * 0.18, -size * 0.065, size * 0.14, size * 0.11);
  ctx.stroke();
  // Right lens frame (lens missing)
  ctx.beginPath();
  ctx.rect(size * 0.04, -size * 0.065, size * 0.14, size * 0.11);
  ctx.stroke();
  // Bridge
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, -size * 0.01);
  ctx.lineTo(size * 0.04, -size * 0.01);
  ctx.stroke();
  // Multiple cracks in left lens
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.15, -size * 0.05);
  ctx.lineTo(-size * 0.08, size * 0.025);
  ctx.moveTo(-size * 0.12, -size * 0.04);
  ctx.lineTo(-size * 0.06, -size * 0.02);
  ctx.lineTo(-size * 0.1, size * 0.03);
  ctx.stroke();
  // Glowing residue in empty frame
  ctx.fillStyle = `rgba(147, 51, 234, ${madnessPulse * 0.3})`;
  ctx.fillRect(size * 0.055, -size * 0.05, size * 0.12, size * 0.08);
  ctx.restore();

  // Gaunt, haunted face - pale and drawn
  drawFaceCircle(ctx, x, y - size * 0.44 + twitch * 0.2, size * 0.24, [
    { offset: 0, color: "#ede9fe" },
    { offset: 0.5, color: "#ddd6fe" },
    { offset: 1, color: "#c4b5fd" },
  ], size * 0.23);

  // Deep sunken cheeks
  ctx.fillStyle = "rgba(91, 33, 182, 0.35)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.13,
    y - size * 0.36 + twitch * 0.2,
    size * 0.05,
    size * 0.08,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.13,
    y - size * 0.36 + twitch * 0.2,
    size * 0.05,
    size * 0.08,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Wide, terrified eyes with eldritch knowledge burning within
  ctx.fillStyle = "#fefefe";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1 + eyeSpasm,
    y - size * 0.46 + twitch * 0.2,
    size * 0.06,
    size * 0.075,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1 - eyeSpasm,
    y - size * 0.46 + twitch * 0.2,
    size * 0.06,
    size * 0.075,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Purple irises with swirling knowledge (optimized - no shadowBlur)
  ctx.fillStyle = "#a855f7";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.1 + eyeSpasm,
    y - size * 0.46 + twitch * 0.2,
    size * 0.04,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.1 - eyeSpasm,
    y - size * 0.46 + twitch * 0.2,
    size * 0.04,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Tiny pinprick pupils (dilated from madness)
  ctx.fillStyle = "#0f0520";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.1 + eyeSpasm,
    y - size * 0.46 + twitch * 0.2,
    size * 0.01,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.1 - eyeSpasm,
    y - size * 0.46 + twitch * 0.2,
    size * 0.01,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Knowledge symbols in eyes
  ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.5})`;
  ctx.font = `${size * 0.02}px serif`;
  ctx.fillText("◈", x - size * 0.1 + eyeSpasm, y - size * 0.455 + twitch * 0.2);
  ctx.fillText("◈", x + size * 0.1 - eyeSpasm, y - size * 0.455 + twitch * 0.2);

  // Heavy dark circles under eyes
  ctx.fillStyle = "rgba(59, 7, 100, 0.6)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.38 + twitch * 0.2,
    size * 0.055,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.38 + twitch * 0.2,
    size * 0.055,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Wild, unkempt hair turning white from terror
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.58 + twitch * 0.2,
    size * 0.22,
    size * 0.12,
    0,
    0,
    Math.PI,
  );
  ctx.fill();
  // Wild strands with gray/white streaks
  for (let i = 0; i < 12; i++) {
    const hairAngle = -Math.PI * 0.5 + i * Math.PI * 0.083;
    const isGray = i % 2 === 0;
    ctx.strokeStyle = isGray ? "#9ca3af" : "#1e1b4b";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(hairAngle) * size * 0.17,
      y - size * 0.57 + twitch * 0.2,
    );
    ctx.bezierCurveTo(
      x +
        Math.cos(hairAngle) * size * 0.28 +
        Math.sin(time * 5 + i) * size * 0.06,
      y - size * 0.72 + twitch * 0.2,
      x +
        Math.cos(hairAngle + 0.15) * size * 0.3 +
        Math.cos(time * 4 + i) * size * 0.04,
      y - size * 0.78 + twitch * 0.2,
      x + Math.cos(hairAngle + 0.25) * size * 0.25,
      y - size * 0.82 + twitch * 0.2 + Math.sin(time * 6 + i) * size * 0.04,
    );
    ctx.stroke();
  }

  // Trembling mouth muttering forbidden words
  ctx.fillStyle = "#3b0764";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.29 + twitch * 0.2,
    size * 0.05,
    size * 0.025 + Math.abs(Math.sin(time * 8)) * size * 0.01,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Whispered words escaping
  ctx.fillStyle = `rgba(147, 51, 234, ${madnessPulse * 0.4})`;
  ctx.font = `${size * 0.025}px serif`;
  const whisperY = y - size * 0.24 + twitch * 0.2;
  ctx.fillText(
    "...",
    x + size * 0.08 + Math.sin(time * 4) * size * 0.02,
    whisperY,
  );

  // Quill in trembling hand, dripping with glowing ink
  ctx.save();
  ctx.translate(x + size * 0.32, y + size * 0.1);
  ctx.rotate(-0.3 + Math.sin(time * 6) * 0.1);
  // Feather
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.15, size * 0.02, -size * 0.35);
  ctx.quadraticCurveTo(-size * 0.02, -size * 0.2, 0, 0);
  ctx.fill();
  // Quill tip
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.01, size * 0.08);
  ctx.lineTo(size * 0.01, size * 0.08);
  ctx.fill();
  // Dripping magical ink
  ctx.fillStyle = `rgba(147, 51, 234, ${madnessPulse})`;
  const dripPhase = (time * 3) % 1;
  ctx.beginPath();
  ctx.arc(
    0,
    size * 0.08 + dripPhase * size * 0.1,
    size * 0.015 * (1 - dripPhase * 0.5),
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

export function drawSeniorEnemy(
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
  // SENIOR THESIS - The Ultimate Academic Titan
  // A colossal ethereal manifestation of accumulated academic power
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const strut = Math.sin(time * 3) * 2 * zoom;
  const cloakWave = Math.sin(time * 2.5) * 0.12;
  const powerPulse = 0.5 + Math.sin(time * 3) * 0.3;
  const floatHeight = Math.sin(time * 1.5) * size * 0.03;

  // Attack animation variables
  const diplomaSwing = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 0.8
    : 0;
  const powerSurge = isAttacking ? attackIntensity * 0.6 : 0;
  const auraExpand = isAttacking ? 1 + attackIntensity * 0.4 : 1;

  // === LAYER 1: COSMIC VOID AURA (Background) ===
  // Outer void distortion field
  for (let ring = 0; ring < 3; ring++) {
    const ringSize = size * (0.9 + ring * 0.25) * auraExpand;
    const ringAlpha = (0.15 - ring * 0.04) * (1 + powerSurge);
    ctx.strokeStyle = `rgba(219, 39, 119, ${ringAlpha})`;
    ctx.lineWidth = (2 - ring * 0.5) * zoom;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const wobble = Math.sin(a * 6 + time * 3 + ring) * size * 0.03;
      const rx = x + Math.cos(a) * (ringSize + wobble);
      const ry = y + Math.sin(a) * (ringSize * 0.55 + wobble * 0.5);
      if (a === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Inner power aura - multi-layered gradient
  const auraGrad = ctx.createRadialGradient(
    x,
    y - size * 0.1,
    0,
    x,
    y,
    size * 0.95 * auraExpand,
  );
  auraGrad.addColorStop(
    0,
    `rgba(251, 207, 232, ${(0.4 + powerSurge * 0.3) * powerPulse})`,
  );
  auraGrad.addColorStop(
    0.25,
    `rgba(244, 114, 182, ${(0.25 + powerSurge * 0.2) * powerPulse})`,
  );
  auraGrad.addColorStop(
    0.5,
    `rgba(219, 39, 119, ${(0.15 + powerSurge * 0.15) * powerPulse})`,
  );
  auraGrad.addColorStop(0.75, `rgba(157, 23, 77, ${0.08 * powerPulse})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y,
    size * 0.95 * auraExpand,
    size * 0.6 * auraExpand,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === LAYER 2: FLOATING ARCANE ELEMENTS ===
  // Orbiting thesis chapters (ethereal pages)
  for (let i = 0; i < 8; i++) {
    const orbitAngle = time * 1.2 + i * Math.PI * 0.25;
    const orbitDist = size * 0.55 + Math.sin(time * 2 + i) * size * 0.08;
    const pageX = x + Math.cos(orbitAngle) * orbitDist;
    const pageY = y + Math.sin(orbitAngle) * orbitDist * 0.4 + floatHeight;
    const pageRot = Math.sin(time * 3 + i * 2) * 0.3;
    const pageGlow = 0.4 + Math.sin(time * 4 + i) * 0.2 + powerSurge * 0.3;

    ctx.save();
    ctx.translate(pageX, pageY);
    ctx.rotate(pageRot);
    // Page shadow
    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    ctx.fillRect(size * -0.04 + 1, size * -0.05 + 1, size * 0.08, size * 0.1);
    // Page body
    ctx.fillStyle = `rgba(253, 244, 255, ${pageGlow})`;
    ctx.fillRect(size * -0.04, size * -0.05, size * 0.08, size * 0.1);
    // Page text lines
    ctx.fillStyle = `rgba(157, 23, 77, ${pageGlow * 0.6})`;
    for (let line = 0; line < 4; line++) {
      ctx.fillRect(
        size * -0.03,
        size * -0.04 + line * size * 0.022,
        size * 0.06,
        size * 0.008,
      );
    }
    // Glowing edge
    ctx.strokeStyle = `rgba(244, 114, 182, ${pageGlow * 0.8})`;
    ctx.lineWidth = 1 * zoom;
    ctx.strokeRect(size * -0.04, size * -0.05, size * 0.08, size * 0.1);
    ctx.restore();
  }

  // Floating arcane runes in a circle
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 6; i++) {
    const runeAngle = time * 0.8 + (i * Math.PI) / 3;
    const runeDist = size * 0.7 + Math.sin(time * 2.5 + i * 2) * size * 0.05;
    const runeX = x + Math.cos(runeAngle) * runeDist;
    const runeY = y - size * 0.15 + Math.sin(runeAngle) * runeDist * 0.35;
    const runeAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3 + powerSurge * 0.4;
    ctx.fillStyle = `rgba(244, 114, 182, ${runeAlpha})`;
    const runes = ["Σ", "Φ", "Ψ", "Ω", "∞", "π"];
    ctx.fillText(runes[i], runeX, runeY);
  }


  // Corruption tendrils from shadow
  ctx.strokeStyle = `rgba(157, 23, 77, ${0.3 + powerSurge * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    const tendrilAngle = Math.PI * 0.7 + i * Math.PI * 0.15;
    const tendrilWave = Math.sin(time * 3 + i * 2) * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(tendrilAngle) * size * 0.3, y + size * 0.48);
    ctx.quadraticCurveTo(
      x + Math.cos(tendrilAngle) * size * 0.4 + tendrilWave,
      y + size * 0.3,
      x + Math.cos(tendrilAngle) * size * 0.25 + tendrilWave * 1.5,
      y + size * 0.1,
    );
    ctx.stroke();
  }

  // === LAYER 4: THE LIVING GRADUATION CLOAK ===
  ctx.save();
  ctx.translate(x, y + floatHeight);
  ctx.rotate(cloakWave * 0.5);

  // Cloak outer shadow layer
  const cloakShadowGrad = ctx.createLinearGradient(
    -size * 0.5,
    -size * 0.35,
    size * 0.5,
    size * 0.55,
  );
  cloakShadowGrad.addColorStop(0, "#0a0510");
  cloakShadowGrad.addColorStop(0.5, "#150818");
  cloakShadowGrad.addColorStop(1, "#0a0510");
  ctx.fillStyle = cloakShadowGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.44, size * 0.52);
  for (let i = 0; i < 10; i++) {
    const waveX = -size * 0.44 + i * size * 0.098;
    const waveY =
      size * 0.52 +
      Math.sin(time * 4 + i * 1.2) * size * 0.05 +
      (i % 2) * size * 0.03;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    size * 0.52,
    size * 0.1,
    size * 0.28,
    -size * 0.34 + strut * 0.08,
  );
  ctx.lineTo(-size * 0.28, -size * 0.34 + strut * 0.08);
  ctx.quadraticCurveTo(-size * 0.52, size * 0.1, -size * 0.44, size * 0.52);
  ctx.fill();

  // Cloak main body with gradient
  const cloakGrad = ctx.createLinearGradient(
    -size * 0.45,
    -size * 0.3,
    size * 0.45,
    size * 0.5,
  );
  cloakGrad.addColorStop(0, "#1f1225");
  cloakGrad.addColorStop(0.2, "#2d1832");
  cloakGrad.addColorStop(0.4, "#1f1225");
  cloakGrad.addColorStop(0.6, "#2d1832");
  cloakGrad.addColorStop(0.8, "#1f1225");
  cloakGrad.addColorStop(1, "#150818");
  ctx.fillStyle = cloakGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, size * 0.48);
  for (let i = 0; i < 9; i++) {
    const waveX = -size * 0.4 + i * size * 0.1;
    const waveY = size * 0.48 + Math.sin(time * 4.5 + i * 1.3) * size * 0.04;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    size * 0.48,
    size * 0.05,
    size * 0.24,
    -size * 0.3 + strut * 0.1,
  );
  ctx.lineTo(-size * 0.24, -size * 0.3 + strut * 0.1);
  ctx.quadraticCurveTo(-size * 0.48, size * 0.05, -size * 0.4, size * 0.48);
  ctx.fill();

  // Cloak magical pattern overlay
  ctx.strokeStyle = `rgba(244, 114, 182, ${0.2 + powerSurge * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    const patternY = -size * 0.2 + i * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, patternY);
    ctx.quadraticCurveTo(
      0,
      patternY + Math.sin(time * 3 + i) * size * 0.03,
      size * 0.25,
      patternY,
    );
    ctx.stroke();
  }
  ctx.restore();

  // === LAYER 5: GOLDEN TRIM AND STOLES ===
  // Left stole with intricate pattern
  const stoleGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y - size * 0.3,
    x - size * 0.15,
    y + size * 0.4,
  );
  stoleGrad.addColorStop(0, "#f472b6");
  stoleGrad.addColorStop(0.3, "#ec4899");
  stoleGrad.addColorStop(0.5, "#f472b6");
  stoleGrad.addColorStop(0.7, "#db2777");
  stoleGrad.addColorStop(1, "#be185d");
  ctx.fillStyle = stoleGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.26 + strut * 0.1 + floatHeight);
  ctx.lineTo(x - size * 0.18, y + size * 0.42);
  ctx.quadraticCurveTo(
    x - size * 0.16,
    y + size * 0.48,
    x - size * 0.1,
    y + size * 0.42,
  );
  ctx.lineTo(x - size * 0.06, y - size * 0.22 + strut * 0.1 + floatHeight);
  ctx.fill();
  // Right stole
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.26 + strut * 0.1 + floatHeight);
  ctx.lineTo(x + size * 0.18, y + size * 0.42);
  ctx.quadraticCurveTo(
    x + size * 0.16,
    y + size * 0.48,
    x + size * 0.1,
    y + size * 0.42,
  );
  ctx.lineTo(x + size * 0.06, y - size * 0.22 + strut * 0.1 + floatHeight);
  ctx.fill();

  // Stole emblems and symbols
  ctx.fillStyle = "#fdf4ff";
  ctx.font = `bold ${size * 0.07}px serif`;
  const emblems = ["✦", "◆", "★", "✧"];
  for (let i = 0; i < 4; i++) {
    const emblemY = y - size * 0.05 + i * size * 0.12;
    ctx.fillText(emblems[i], x - size * 0.12, emblemY);
    ctx.fillText(emblems[(i + 2) % 4], x + size * 0.12, emblemY + size * 0.03);
  }

  // Golden trim lines
  ctx.strokeStyle = "#fcd34d";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.26 + strut * 0.1 + floatHeight);
  ctx.lineTo(x - size * 0.21, y + size * 0.44);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.17, y - size * 0.26 + strut * 0.1 + floatHeight);
  ctx.lineTo(x + size * 0.21, y + size * 0.44);
  ctx.stroke();

  // === LAYER 6: THE FACE - Wise and Powerful ===
  const headY = y - size * 0.42 + strut * 0.12 + floatHeight;

  // Face base
  drawFaceCircle(ctx, x, headY, size * 0.2, [
    { offset: 0, color: "#fdf4ff" },
    { offset: 0.7, color: "#fce7f3" },
    { offset: 1, color: "#fbcfe8" },
  ], size * 0.18, size * 0.2);

  // Jaw definition
  ctx.fillStyle = "#f9a8d4";
  ctx.beginPath();
  ctx.ellipse(x, headY + size * 0.12, size * 0.12, size * 0.06, 0, 0, Math.PI);
  ctx.fill();

  // Elegant dark hair with highlights
  const hairGrad = ctx.createLinearGradient(
    x - size * 0.2,
    headY - size * 0.25,
    x + size * 0.2,
    headY,
  );
  hairGrad.addColorStop(0, "#1e1b4b");
  hairGrad.addColorStop(0.3, "#312e81");
  hairGrad.addColorStop(0.5, "#1e1b4b");
  hairGrad.addColorStop(0.7, "#312e81");
  hairGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, headY - size * 0.08);
  ctx.quadraticCurveTo(
    x - size * 0.28,
    headY - size * 0.32,
    x,
    headY - size * 0.38,
  );
  ctx.quadraticCurveTo(
    x + size * 0.28,
    headY - size * 0.32,
    x + size * 0.2,
    headY - size * 0.08,
  );
  ctx.quadraticCurveTo(
    x + size * 0.15,
    headY - size * 0.15,
    x,
    headY - size * 0.12,
  );
  ctx.quadraticCurveTo(
    x - size * 0.15,
    headY - size * 0.15,
    x - size * 0.2,
    headY - size * 0.08,
  );
  ctx.fill();

  // Hair shine
  ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, headY - size * 0.25, size * 0.08, -0.8, 0.3);
  ctx.stroke();

  // === LAYER 7: THE MORTARBOARD - Floating Crown of Knowledge ===
  ctx.save();
  ctx.translate(x, headY - size * 0.32 + Math.sin(time * 2) * size * 0.015);
  ctx.rotate(Math.sin(time * 1.5) * 0.06);

  // Board shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, size * 0.02);
  ctx.lineTo(0, -size * 0.1);
  ctx.lineTo(size * 0.28, size * 0.02);
  ctx.lineTo(0, size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Board top with gradient
  const boardGrad = ctx.createLinearGradient(-size * 0.25, 0, size * 0.25, 0);
  boardGrad.addColorStop(0, "#1e1b4b");
  boardGrad.addColorStop(0.5, "#312e81");
  boardGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = boardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.26, 0);
  ctx.lineTo(0, -size * 0.1);
  ctx.lineTo(size * 0.26, 0);
  ctx.lineTo(0, size * 0.1);
  ctx.closePath();
  ctx.fill();

  // Board edge highlight
  ctx.strokeStyle = "#6366f1";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Cap base
  const capGrad = ctx.createRadialGradient(
    0,
    size * 0.04,
    0,
    0,
    size * 0.04,
    size * 0.15,
  );
  capGrad.addColorStop(0, "#4338ca");
  capGrad.addColorStop(1, "#312e81");
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.04, size * 0.14, size * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tassel - flowing and magical
  const tasselSwing = Math.sin(time * 4) * size * 0.06;
  ctx.strokeStyle = "#f472b6";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.05);
  ctx.quadraticCurveTo(
    size * 0.08 + tasselSwing,
    size * 0.05,
    size * 0.1 + tasselSwing * 0.5,
    size * 0.18,
  );
  ctx.stroke();

  // Tassel strands
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 5; i++) {
    const strandX = size * 0.1 + tasselSwing * 0.5 + (i - 2) * size * 0.015;
    ctx.beginPath();
    ctx.moveTo(strandX, size * 0.18);
    ctx.lineTo(strandX + Math.sin(time * 5 + i) * size * 0.02, size * 0.28);
    ctx.stroke();
  }

  // Tassel button
  ctx.fillStyle = "#fcd34d";
  ctx.beginPath();
  ctx.arc(0, -size * 0.05, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === LAYER 8: THE EYES - Windows to Academic Power ===
  // Eye whites with slight glow
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.075,
    headY - size * 0.02,
    size * 0.055,
    size * 0.065,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.075,
    headY - size * 0.02,
    size * 0.055,
    size * 0.065,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const irisGlow = isAttacking
    ? 0.9 + attackIntensity * 0.1
    : 0.7 + Math.sin(time * 2) * 0.2;
  drawEyes(ctx, x, headY - size * 0.02, size * 0.075, [
    { radius: size * 0.035, color: `rgba(219, 39, 119, ${irisGlow})` },
    { radius: size * 0.018, color: "#1e1b4b" },
    { radius: size * 0.012, color: "#fff", yOffset: -size * 0.015, xOffset: -size * 0.01 },
  ]);

  // Confident brow lines
  ctx.strokeStyle = "#1e1b4b";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, headY - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.075,
    headY - size * 0.13 - (isAttacking ? size * 0.02 : 0),
    x - size * 0.02,
    headY - size * 0.09,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, headY - size * 0.1);
  ctx.quadraticCurveTo(
    x + size * 0.075,
    headY - size * 0.13 - (isAttacking ? size * 0.02 : 0),
    x + size * 0.02,
    headY - size * 0.09,
  );
  ctx.stroke();

  // Knowing smile
  ctx.strokeStyle = "#9d174d";
  ctx.lineWidth = 2 * zoom;
  const smileWidth = isAttacking ? 0.1 : 0.07;
  ctx.beginPath();
  ctx.arc(
    x,
    headY + size * 0.08,
    size * smileWidth,
    0.15 * Math.PI,
    0.85 * Math.PI,
  );
  ctx.stroke();

  // === LAYER 9: THE DIPLOMA OF POWER ===
  ctx.save();
  ctx.translate(x + size * 0.45, y + size * 0.05 + strut * 0.08 + floatHeight);
  ctx.rotate(0.35 + Math.sin(time * 2) * 0.12 + diplomaSwing);

  // Diploma shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(-size * 0.05 + 2, -size * 0.22 + 2, size * 0.1, size * 0.44);

  // Diploma scroll body
  const diplomaGrad = ctx.createLinearGradient(-size * 0.05, 0, size * 0.05, 0);
  diplomaGrad.addColorStop(0, "#fef3c7");
  diplomaGrad.addColorStop(0.3, "#fefce8");
  diplomaGrad.addColorStop(0.5, "#fef3c7");
  diplomaGrad.addColorStop(0.7, "#fefce8");
  diplomaGrad.addColorStop(1, "#fef3c7");
  ctx.fillStyle = diplomaGrad;
  ctx.fillRect(-size * 0.05, -size * 0.22, size * 0.1, size * 0.44);

  // Diploma edges (rolled appearance)
  ctx.fillStyle = "#fcd34d";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.22, size * 0.05, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, size * 0.22, size * 0.05, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magical text lines
  ctx.fillStyle = `rgba(157, 23, 77, ${0.6 + powerSurge * 0.4})`;
  for (let i = 0; i < 8; i++) {
    const lineWidth = size * (0.06 - Math.abs(i - 4) * 0.005);
    ctx.fillRect(
      -lineWidth / 2,
      -size * 0.16 + i * size * 0.045,
      lineWidth,
      size * 0.015,
    );
  }

  // Glowing seal
  ctx.fillStyle = `rgba(219, 39, 119, ${0.8 + powerSurge * 0.2})`;
  ctx.beginPath();
  ctx.arc(0, size * 0.15, size * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Seal emblem
  ctx.fillStyle = "#fcd34d";
  ctx.font = `${size * 0.04}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("P", 0, size * 0.165);

  // Magical glow effect around diploma
  ctx.strokeStyle = `rgba(244, 114, 182, ${powerPulse * 0.7 + powerSurge * 0.3})`;
  ctx.lineWidth = 2 * zoom;
  ctx.strokeRect(-size * 0.06, -size * 0.23, size * 0.12, size * 0.46);

  ctx.restore();

  // === LAYER 10: ATTACK EFFECTS ===
  if (isAttacking) {
    // Power burst from diploma
    const burstCount = 8;
    for (let i = 0; i < burstCount; i++) {
      const burstAngle = (i / burstCount) * Math.PI * 2 + time * 3;
      const burstDist = size * 0.3 + attackIntensity * size * 0.4;
      const burstX = x + size * 0.45 + Math.cos(burstAngle) * burstDist;
      const burstY = y + size * 0.05 + Math.sin(burstAngle) * burstDist * 0.6;
      ctx.fillStyle = `rgba(244, 114, 182, ${attackIntensity * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        burstX,
        burstY,
        size * 0.02 + attackIntensity * size * 0.02,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Energy wave
    ctx.strokeStyle = `rgba(219, 39, 119, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6 + attackIntensity * size * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Academic power words
    ctx.font = `italic ${size * 0.06}px Georgia`;
    ctx.fillStyle = `rgba(244, 114, 182, ${attackIntensity * 0.8})`;
    const words = ["THESIS", "DEFENSE", "QED"];
    const wordIndex = Math.floor((attackPhase * 3) % 3);
    ctx.fillText(
      words[wordIndex],
      x + size * 0.2 + attackIntensity * size * 0.3,
      y - size * 0.3 - attackIntensity * size * 0.2,
    );
  }

  // === LAYER 11: AMBIENT PARTICLES ===
  // Knowledge particles floating upward
  for (let i = 0; i < 6; i++) {
    const particlePhase = (time * 0.5 + i * 0.5) % 3;
    const particleX =
      x - size * 0.3 + i * size * 0.12 + Math.sin(time * 2 + i) * size * 0.05;
    const particleY = y + size * 0.3 - particlePhase * size * 0.25;
    const particleAlpha = (1 - particlePhase / 3) * 0.5;
    ctx.fillStyle = `rgba(244, 114, 182, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(
      particleX,
      particleY,
      size * 0.015 + Math.sin(time * 4 + i) * size * 0.005,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

export function drawGradStudentEnemy(
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
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  // VOID-TOUCHED RESEARCHER - Driven mad by dimensional research, reality warps around them
  const exhaustionSway =
    Math.sin(time * 1.5) * 4 * zoom +
    (isAttacking ? attackIntensity * size * 0.15 : 0);
  const insanityPulse = 0.5 + Math.sin(time * 6) * 0.3 + attackIntensity * 0.4;
  const eyeTwitch =
    Math.sin(time * 12) * 0.5 +
    Math.sin(time * 17) * 0.3 +
    (isAttacking ? attackIntensity * 0.5 : 0);
  const dimensionalRift =
    0.4 + Math.sin(time * 4) * 0.3 + attackIntensity * 0.4;
  const caffeineTremor =
    Math.sin(time * 20) * size * 0.005 +
    (isAttacking ? attackIntensity * size * 0.01 : 0);

  // Dimensional instability field
  ctx.save();
  for (let layer = 0; layer < 4; layer++) {
    const layerPhase = (time * 0.6 + layer * 0.4) % 2.5;
    const layerSize = size * 0.35 + layerPhase * size * 0.35;
    ctx.strokeStyle = `rgba(251, 146, 60, ${(0.4 - layer * 0.08) * (1 - layerPhase / 2.5)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const distort = Math.sin(a * 4 + time * 3 + layer) * size * 0.06;
      const rx = layerSize + distort;
      const ry = (layerSize + distort) * 0.65;
      const px = x + Math.cos(a) * rx;
      const py = y + Math.sin(a) * ry;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // Void tears in reality
  ctx.fillStyle = `rgba(20, 10, 30, ${dimensionalRift * 0.6})`;
  for (let tear = 0; tear < 4; tear++) {
    const tearX = x + Math.sin(time * 0.8 + tear * 1.5) * size * 0.4;
    const tearY = y + Math.cos(time * 0.6 + tear) * size * 0.3 - size * 0.1;
    ctx.save();
    ctx.translate(tearX, tearY);
    ctx.rotate(time * 0.5 + tear);
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      size * 0.03 + Math.sin(time * 3 + tear) * size * 0.01,
      size * 0.08,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Void energy leaking
    ctx.strokeStyle = `rgba(251, 146, 60, ${insanityPulse * 0.5})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.08);
    ctx.quadraticCurveTo(
      Math.sin(time * 4 + tear) * size * 0.03,
      size * 0.12,
      0,
      size * 0.15,
    );
    ctx.stroke();
    ctx.restore();
  }

  // Floating research papers with forbidden equations
  for (let i = 0; i < 8; i++) {
    const paperAngle = time * 0.8 + i * Math.PI * 0.25;
    const paperDist = size * 0.5 + Math.sin(time * 2 + i) * size * 0.12;
    const px = x + Math.cos(paperAngle) * paperDist;
    const py = y - size * 0.12 + Math.sin(paperAngle) * paperDist * 0.4;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(time * 3.5 + i) * 0.6);
    // Aged paper
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(-size * 0.055, -size * 0.07, size * 0.11, size * 0.14);
    // Paper edge wear
    ctx.strokeStyle = "#d4a574";
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(-size * 0.055, -size * 0.07, size * 0.11, size * 0.14);
    // Forbidden equations and diagrams
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 0.5 * zoom;
    for (let j = 0; j < 5; j++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.045, -size * 0.055 + j * size * 0.022);
      ctx.lineTo(size * 0.045, -size * 0.055 + j * size * 0.022);
      ctx.stroke();
    }
    // Glowing warning symbol on some papers
    if (i % 3 === 0) {
      ctx.fillStyle = `rgba(251, 146, 60, ${insanityPulse})`;
      ctx.font = `${size * 0.04}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("⚠", 0, size * 0.04);
    }
    ctx.restore();
  }


  // Tattered lab coat with dimensional burns and chemical stains
  const coatGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y - size * 0.35,
    x + size * 0.4,
    y + size * 0.55,
  );
  coatGrad.addColorStop(0, "#a3a3a3");
  coatGrad.addColorStop(0.2, "#d4d4d4");
  coatGrad.addColorStop(0.4, "#f5f5f5");
  coatGrad.addColorStop(0.5, "#ffffff");
  coatGrad.addColorStop(0.6, "#f5f5f5");
  coatGrad.addColorStop(0.8, "#d4d4d4");
  coatGrad.addColorStop(1, "#a3a3a3");
  ctx.fillStyle = coatGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.55);
  ctx.quadraticCurveTo(
    x - size * 0.44,
    y,
    x - size * 0.22,
    y - size * 0.34 + exhaustionSway * 0.1,
  );
  ctx.lineTo(x + size * 0.22, y - size * 0.34 + exhaustionSway * 0.1);
  ctx.quadraticCurveTo(x + size * 0.44, y, x + size * 0.38, y + size * 0.55);
  // Burned and tattered bottom
  for (let i = 0; i < 9; i++) {
    const tearX = x - size * 0.38 + i * size * 0.095;
    const tearY =
      y +
      size * 0.55 +
      Math.sin(time * 2 + i * 1.3) * size * 0.03 +
      (i % 2) * size * 0.06 +
      (i % 3) * size * 0.03;
    ctx.lineTo(tearX, tearY);
  }
  ctx.closePath();
  ctx.fill();

  // Multiple stains - coffee, chemicals, dimensional residue
  // Coffee stains
  ctx.fillStyle = "rgba(120, 53, 15, 0.4)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.18,
    y + size * 0.18,
    size * 0.09,
    size * 0.12,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.12,
    y + size * 0.08,
    size * 0.07,
    size * 0.09,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Chemical burns
  ctx.fillStyle = "rgba(20, 184, 166, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.05,
    y + size * 0.3,
    size * 0.05,
    size * 0.06,
    0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Dimensional residue (optimized - no shadowBlur)
  ctx.fillStyle = `rgba(255, 180, 100, ${insanityPulse * 0.6})`;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.2,
    y + size * 0.28,
    size * 0.045,
    size * 0.055,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Multiple pockets overflowing with tools
  ctx.fillStyle = "#e5e5e5";
  ctx.fillRect(x - size * 0.24, y - size * 0.18, size * 0.14, size * 0.16);
  ctx.strokeStyle = "#a3a3a3";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(x - size * 0.24, y - size * 0.18, size * 0.14, size * 0.16);
  // Chaotic pens and tools
  const penColors = ["#1c1917", "#dc2626", "#2563eb", "#16a34a", "#9333ea"];
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.translate(x - size * 0.22 + i * size * 0.025, y - size * 0.14);
    ctx.rotate(-0.35 + Math.sin(time * 2 + i * 0.7) * 0.25);
    ctx.fillStyle = penColors[i];
    ctx.fillRect(-size * 0.008, -size * 0.12, size * 0.016, size * 0.12);
    ctx.restore();
  }

  // Gaunt, exhausted face - nearly skeletal from sleep deprivation
  ctx.save();
  ctx.translate(x + caffeineTremor, y - size * 0.44 + exhaustionSway * 0.15);
  ctx.rotate(exhaustionSway * 0.025);

  drawFaceCircle(ctx, 0, 0, size * 0.24, [
    { offset: 0, color: "#fef9c3" },
    { offset: 0.6, color: "#fef3c7" },
    { offset: 1, color: "#fde68a" },
  ]);

  // Extremely sunken cheeks
  ctx.fillStyle = "rgba(120, 53, 15, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.14,
    size * 0.02,
    size * 0.06,
    size * 0.1,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    size * 0.14,
    size * 0.02,
    size * 0.06,
    size * 0.1,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Scraggly unkempt beard with food bits
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.14, size * 0.14, size * 0.1, 0, 0, Math.PI);
  ctx.fill();
  // Stubble texture
  ctx.fillStyle = "#44403c";
  for (let i = 0; i < 18; i++) {
    const stubX = -size * 0.12 + (i % 6) * size * 0.04;
    const stubY = size * 0.06 + Math.floor(i / 6) * size * 0.035;
    ctx.fillRect(stubX, stubY, size * 0.012, size * 0.025);
  }
  // Crumbs in beard
  ctx.fillStyle = "#d4a574";
  ctx.beginPath();
  ctx.arc(-size * 0.05, size * 0.12, size * 0.01, 0, Math.PI * 2);
  ctx.arc(size * 0.08, size * 0.1, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Bloodshot, twitching eyes with dimensional sight
  ctx.fillStyle = "#fef2f2";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.09 + eyeTwitch,
    -size * 0.02,
    size * 0.06,
    size * 0.045,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    size * 0.09 + eyeTwitch,
    -size * 0.02,
    size * 0.06,
    size * 0.045,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Heavy bloodshot veins
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 0.8 * zoom;
  for (let eye = 0; eye < 2; eye++) {
    const ex = eye === 0 ? -size * 0.09 : size * 0.09;
    for (let v = 0; v < 5; v++) {
      const vAngle = -Math.PI * 0.5 + v * Math.PI * 0.25;
      ctx.beginPath();
      ctx.moveTo(ex + eyeTwitch, -size * 0.02);
      ctx.lineTo(
        ex + eyeTwitch + Math.cos(vAngle) * size * 0.05,
        -size * 0.02 + Math.sin(vAngle) * size * 0.04,
      );
      ctx.stroke();
    }
  }
  // Orange dimensional-touched pupils + pinprick pupils
  drawEyes(ctx, eyeTwitch, -size * 0.02, size * 0.09, [
    { radius: size * 0.028, color: "#fbbf24" },
    { radius: size * 0.007, color: "#1c1917" },
  ]);

  // Massive dark circles - practically bruises
  ctx.fillStyle = "rgba(88, 28, 135, 0.6)";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.09,
    size * 0.05,
    size * 0.07,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    size * 0.09,
    size * 0.05,
    size * 0.07,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Broken glasses held together with tape
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 2.5 * zoom;
  // Left lens (cracked)
  ctx.beginPath();
  ctx.arc(-size * 0.09, -size * 0.02, size * 0.07, 0, Math.PI * 2);
  ctx.stroke();
  // Right lens
  ctx.beginPath();
  ctx.arc(size * 0.09, -size * 0.02, size * 0.07, 0, Math.PI * 2);
  ctx.stroke();
  // Bridge with tape
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.02);
  ctx.lineTo(size * 0.02, -size * 0.02);
  ctx.stroke();
  // Tape on bridge
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(-size * 0.015, -size * 0.035, size * 0.03, size * 0.03);
  // Crack in left lens
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.04);
  ctx.lineTo(-size * 0.08, size * 0.02);
  ctx.lineTo(-size * 0.06, -size * 0.01);
  ctx.stroke();

  // Wild, unkempt hair standing on end
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.16, size * 0.22, size * 0.12, 0, 0, Math.PI);
  ctx.fill();
  // Chaotic strands with gray from stress
  for (let i = 0; i < 14; i++) {
    const hairAngle = -Math.PI * 0.55 + i * Math.PI * 0.077;
    const isGray = i % 4 === 0;
    ctx.strokeStyle = isGray ? "#9ca3af" : "#44403c";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(Math.cos(hairAngle) * size * 0.18, -size * 0.16);
    ctx.bezierCurveTo(
      Math.cos(hairAngle) * size * 0.28 + Math.sin(time * 6 + i) * size * 0.1,
      -size * 0.32 + Math.sin(time * 4 + i) * size * 0.06,
      Math.cos(hairAngle + 0.2) * size * 0.3 +
        Math.cos(time * 5 + i) * size * 0.05,
      -size * 0.38,
      Math.cos(hairAngle + 0.35) * size * 0.25,
      -size * 0.42 + Math.sin(time * 5 + i) * size * 0.08,
    );
    ctx.stroke();
  }

  ctx.restore();

  // MASSIVE coffee thermos (industrial size)
  ctx.save();
  ctx.translate(x + size * 0.4, y - size * 0.15 + exhaustionSway * 0.1);
  // Thermos body
  ctx.fillStyle = "#1f2937";
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.1,
    -size * 0.08,
    size * 0.2,
    size * 0.45,
    size * 0.03,
  );
  ctx.fill();
  // Metal bands
  ctx.fillStyle = "#6b7280";
  ctx.fillRect(-size * 0.1, -size * 0.02, size * 0.2, size * 0.03);
  ctx.fillRect(-size * 0.1, size * 0.25, size * 0.2, size * 0.03);
  // Coffee inside (visible through opening)
  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.06, size * 0.07, size * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();
  // Excessive steam - reality-warping caffeine vapor
  ctx.strokeStyle = `rgba(251, 146, 60, ${0.5 + Math.sin(time * 5) * 0.25})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 7; i++) {
    const steamPhase = (time * 2.5 + i * 0.25) % 1.5;
    ctx.beginPath();
    ctx.moveTo(-size * 0.06 + i * size * 0.02, -size * 0.1);
    ctx.bezierCurveTo(
      -size * 0.06 + i * size * 0.02 + Math.sin(time * 6 + i) * size * 0.04,
      -size * 0.2 - steamPhase * size * 0.1,
      -size * 0.04 + i * size * 0.02 + Math.cos(time * 5 + i) * size * 0.03,
      -size * 0.35 - steamPhase * size * 0.1,
      -size * 0.06 + i * size * 0.02,
      -size * 0.5 - steamPhase * size * 0.12,
    );
    ctx.stroke();
  }
  // Warning label
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-size * 0.06, size * 0.1, size * 0.12, size * 0.08);
  ctx.fillStyle = "#fef2f2";
  ctx.font = `${size * 0.03}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("☠", 0, size * 0.155);
  ctx.restore();

  // Floating equations and diagrams around head
  ctx.fillStyle = `rgba(251, 146, 60, ${insanityPulse * 0.6})`;
  ctx.font = `${size * 0.035}px serif`;
  const equations = ["E=mc²", "∫∞", "Σn→∞", "∂ψ/∂t", "ℏ"];
  for (let e = 0; e < 5; e++) {
    const eqX = x + Math.sin(time * 1.2 + e * 1.3) * size * 0.55;
    const eqY = y - size * 0.6 + Math.cos(time * 0.8 + e) * size * 0.15;
    ctx.save();
    ctx.translate(eqX, eqY);
    ctx.rotate(Math.sin(time * 1.5 + e) * 0.2);
    ctx.fillText(equations[e], 0, 0);
    ctx.restore();
  }
}

export function drawProfessorEnemy(
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
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  // ARCHLICH PROFESSOR - Ancient undead lecturer with arcane knowledge
  const hover =
    Math.sin(time * 2) * 3 * zoom +
    (isAttacking ? attackIntensity * size * 0.12 : 0);
  const powerPulse = 0.6 + Math.sin(time * 3) * 0.4 + attackIntensity * 0.4;
  const lectureGesture =
    Math.sin(time * 2.5) * 0.2 + (isAttacking ? attackIntensity * 0.5 : 0);

  // Red/crimson power aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.75);
  auraGrad.addColorStop(0, `rgba(239, 68, 68, ${powerPulse * 0.3})`);
  auraGrad.addColorStop(0.5, `rgba(185, 28, 28, ${powerPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Floating lecture notes (spectral)
  for (let i = 0; i < 4; i++) {
    const noteAngle = time * 1 + i * Math.PI * 0.5;
    const noteDist = size * 0.5;
    const nx = x + Math.cos(noteAngle) * noteDist;
    const ny = y - size * 0.1 + Math.sin(noteAngle) * noteDist * 0.35 + hover;
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(Math.sin(time * 2 + i) * 0.15);
    ctx.fillStyle = `rgba(254, 243, 199, ${
      0.5 + Math.sin(time * 3 + i) * 0.2
    })`;
    ctx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.16);
    // Arcane equations
    ctx.strokeStyle = `rgba(185, 28, 28, ${powerPulse})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, -size * 0.04);
    ctx.lineTo(size * 0.04, -size * 0.04);
    ctx.moveTo(-size * 0.03, 0);
    ctx.lineTo(size * 0.03, 0);
    ctx.stroke();
    ctx.restore();
  }


  // Ancient tweed robes (tattered, elegant)
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y,
    x + size * 0.4,
    y,
  );
  robeGrad.addColorStop(0, "#44403c");
  robeGrad.addColorStop(0.3, "#78716c");
  robeGrad.addColorStop(0.5, "#a8a29e");
  robeGrad.addColorStop(0.7, "#78716c");
  robeGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = robeGrad;
  drawRobeBody(ctx, x, size * 0.22, y - size * 0.32 + hover * 0.2, size * 0.38, y + size * 0.5, size * 0.45, y, {
    count: 5,
    amplitude: size * 0.03,
    time: time,
    speed: 3,
    altAmplitude: size * 0.04,
  });

  // Elbow patches (leather, worn)
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.38,
    y + size * 0.08 + hover * 0.1,
    size * 0.07,
    size * 0.1,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.38,
    y + size * 0.08 + hover * 0.1,
    size * 0.07,
    size * 0.1,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Crimson academic hood/collar
  ctx.fillStyle = "#b91c1c";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.28 + hover * 0.2);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.15 + hover * 0.2,
    x + size * 0.15,
    y - size * 0.28 + hover * 0.2,
  );
  ctx.lineTo(x + size * 0.12, y + size * 0.1);
  ctx.quadraticCurveTo(x, y + size * 0.2, x - size * 0.12, y + size * 0.1);
  ctx.fill();
  // Ancient sigil on collar
  ctx.fillStyle = `rgba(254, 243, 199, ${powerPulse})`;
  ctx.font = `${size * 0.1}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("⚗", x, y - size * 0.05 + hover * 0.2);

  // Bow tie (crimson, ethereal)
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22 + hover * 0.2);
  ctx.lineTo(x - size * 0.1, y - size * 0.26 + hover * 0.2);
  ctx.lineTo(x - size * 0.1, y - size * 0.18 + hover * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22 + hover * 0.2);
  ctx.lineTo(x + size * 0.1, y - size * 0.26 + hover * 0.2);
  ctx.lineTo(x + size * 0.1, y - size * 0.18 + hover * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - size * 0.22 + hover * 0.2, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  // Skeletal face with preserved flesh
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.48 + hover, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Sunken, preserved features
  ctx.fillStyle = "rgba(68, 64, 60, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.42 + hover,
    size * 0.04,
    size * 0.06,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.42 + hover,
    size * 0.04,
    size * 0.06,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Ancient spectacles (gold, ornate)
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.5 + hover, size * 0.07, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.5 + hover, size * 0.07, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.5 + hover);
  ctx.lineTo(x + size * 0.03, y - size * 0.5 + hover);
  ctx.moveTo(x - size * 0.17, y - size * 0.5 + hover);
  ctx.lineTo(x - size * 0.22, y - size * 0.48 + hover);
  ctx.moveTo(x + size * 0.17, y - size * 0.5 + hover);
  ctx.lineTo(x + size * 0.22, y - size * 0.48 + hover);
  ctx.stroke();

  // Glowing red eyes behind spectacles (optimized - no shadowBlur)
  ctx.fillStyle = "#f87171";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, y - size * 0.5 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, y - size * 0.5 + hover, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Distinguished but wispy white hair
  ctx.fillStyle = "#e7e5e4";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.62 + hover,
    size * 0.18,
    size * 0.08,
    0,
    0,
    Math.PI,
  );
  ctx.fill();
  // Side tufts
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.2,
    y - size * 0.48 + hover,
    size * 0.06,
    size * 0.12,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.2,
    y - size * 0.48 + hover,
    size * 0.06,
    size * 0.12,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Wispy strands
  ctx.strokeStyle = "#d6d3d1";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1 + i * size * 0.05, y - size * 0.64 + hover);
    ctx.quadraticCurveTo(
      x - size * 0.1 + i * size * 0.05 + Math.sin(time * 2 + i) * size * 0.03,
      y - size * 0.72 + hover,
      x - size * 0.08 + i * size * 0.05,
      y - size * 0.7 + hover,
    );
    ctx.stroke();
  }

  // Bushy ethereal eyebrows
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.58 + hover,
    size * 0.06,
    size * 0.025,
    -0.15,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.58 + hover,
    size * 0.06,
    size * 0.025,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Knowing skeletal smile
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.38 + hover,
    size * 0.06,
    0.1 * Math.PI,
    0.9 * Math.PI,
  );
  ctx.fill();
  ctx.fillStyle = "#e7e5e4";
  ctx.fillRect(
    x - size * 0.05,
    y - size * 0.38 + hover,
    size * 0.1,
    size * 0.02,
  );

  // Lecturing skeletal hand
  ctx.save();
  ctx.translate(x - size * 0.45, y - size * 0.1 + hover);
  ctx.rotate(-0.4 + lectureGesture);
  // Skeletal hand
  ctx.fillStyle = "#d6d3d1";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.07, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pointing finger bone
  ctx.fillRect(-size * 0.02, -size * 0.18, size * 0.04, size * 0.18);
  // Magical spark at fingertip
  ctx.fillStyle = `rgba(255, 100, 100, ${powerPulse})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ancient tome floating beside
  ctx.save();
  ctx.translate(
    x + size * 0.42,
    y - size * 0.15 + hover + Math.sin(time * 2.5) * 3,
  );
  ctx.rotate(Math.sin(time * 1.5) * 0.1);
  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(-size * 0.08, -size * 0.1, size * 0.16, size * 0.2);
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.16);
  // Glowing text
  ctx.fillStyle = `rgba(239, 68, 68, ${powerPulse})`;
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("∑∫", 0, size * 0.02);
  ctx.restore();
}

export function drawDeanEnemy(
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
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  // VOID ARCHON DEAN - Reality-bending administrator with absolute authority over space
  const hover =
    Math.sin(time * 1.5) * 5 * zoom +
    (isAttacking ? attackIntensity * size * 0.18 : 0);
  const powerPulse = 0.6 + Math.sin(time * 3) * 0.4 + attackIntensity * 0.4;
  const realityWarp =
    Math.sin(time * 2) * 0.06 + (isAttacking ? attackIntensity * 0.15 : 0);
  const voidTear = 0.5 + Math.sin(time * 4) * 0.3 + attackIntensity * 0.4;
  const authorityAura = 0.7 + Math.sin(time * 5) * 0.2 + attackIntensity * 0.3;

  // Reality fracturing around the dean
  ctx.save();
  for (let fracture = 0; fracture < 8; fracture++) {
    const fractureAngle = (fracture * Math.PI) / 4 + time * 0.3;
    const fractureLen = size * (0.4 + Math.sin(time * 2 + fracture) * 0.15);
    ctx.strokeStyle = `rgba(168, 85, 247, ${voidTear * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y);
    let fx = x,
      fy = y;
    for (let seg = 0; seg < 5; seg++) {
      fx +=
        Math.cos(fractureAngle + (Math.random() - 0.5) * 0.8) *
        fractureLen *
        0.2;
      fy +=
        Math.sin(fractureAngle + (Math.random() - 0.5) * 0.8) *
        fractureLen *
        0.15;
      ctx.lineTo(fx, fy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Reality distortion aura - more dramatic warping
  ctx.strokeStyle = `rgba(168, 85, 247, ${powerPulse * 0.6})`;
  ctx.lineWidth = 3 * zoom;
  for (let i = 0; i < 4; i++) {
    const warpPhase = (time * 0.5 + i * 0.4) % 2;
    const warpSize = size * 0.45 + warpPhase * size * 0.45;
    ctx.globalAlpha = 0.6 * (1 - warpPhase / 2);
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.08) {
      const r = warpSize + Math.sin(a * 8 + time * 4) * size * 0.06;
      const wx = x + Math.cos(a) * r;
      const wy = y + Math.sin(a) * r * 0.55;
      if (a === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Deep void aura with multiple layers
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.95);
  auraGrad.addColorStop(0, `rgba(139, 92, 246, ${powerPulse * 0.4})`);
  auraGrad.addColorStop(0.3, `rgba(168, 85, 247, ${powerPulse * 0.3})`);
  auraGrad.addColorStop(0.6, `rgba(91, 33, 182, ${powerPulse * 0.18})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.95, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting void shards with trails
  for (let i = 0; i < 8; i++) {
    const shardAngle = time * 0.9 + (i * Math.PI) / 4;
    const shardDist = size * 0.6 + Math.sin(time * 2.5 + i) * size * 0.1;
    const sx = x + Math.cos(shardAngle) * shardDist;
    const sy =
      y - size * 0.08 + Math.sin(shardAngle) * shardDist * 0.4 + hover * 0.4;
    // Trail
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.2})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(
      sx - Math.cos(shardAngle) * size * 0.08,
      sy - Math.sin(shardAngle) * size * 0.04,
    );
    ctx.stroke();
    // Shard
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(time * 2.5 + i);
    ctx.fillStyle = `rgba(168, 85, 247, ${0.6 + Math.sin(time * 4 + i) * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.05);
    ctx.lineTo(size * 0.025, 0);
    ctx.lineTo(0, size * 0.05);
    ctx.lineTo(-size * 0.025, 0);
    ctx.fill();
    ctx.restore();
  }


  // Magnificent flowing robes with reality-warping edges
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(realityWarp);
  const robeGrad = ctx.createLinearGradient(
    -size * 0.5,
    -size * 0.45,
    size * 0.5,
    size * 0.6,
  );
  robeGrad.addColorStop(0, "#0f0a2a");
  robeGrad.addColorStop(0.2, "#1e1b4b");
  robeGrad.addColorStop(0.4, "#312e81");
  robeGrad.addColorStop(0.5, "#3730a3");
  robeGrad.addColorStop(0.6, "#312e81");
  robeGrad.addColorStop(0.8, "#1e1b4b");
  robeGrad.addColorStop(1, "#0f0a2a");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.48, size * 0.58);
  // Dramatically flowing bottom edge with void wisps
  for (let i = 0; i < 10; i++) {
    const waveX = -size * 0.48 + i * size * 0.096;
    const waveY =
      size * 0.58 +
      Math.sin(time * 4 + i * 1.2) * size * 0.05 +
      (i % 2) * size * 0.04 +
      (i % 3) * size * 0.02;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(size * 0.6, 0, size * 0.3, -size * 0.42 + hover * 0.15);
  ctx.lineTo(-size * 0.3, -size * 0.42 + hover * 0.15);
  ctx.quadraticCurveTo(-size * 0.6, 0, -size * 0.48, size * 0.58);
  ctx.fill();
  ctx.restore();

  // Void energy patterns on robe
  ctx.strokeStyle = `rgba(168, 85, 247, ${voidTear * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  for (let v = 0; v < 6; v++) {
    const veinX = x - size * 0.3 + v * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(veinX, y - size * 0.2 + hover * 0.1);
    ctx.quadraticCurveTo(
      veinX + Math.sin(time * 2 + v) * size * 0.05,
      y + size * 0.1,
      veinX + Math.cos(v) * size * 0.08,
      y + size * 0.4,
    );
    ctx.stroke();
  }

  // Ornate gold and purple trim with gems
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 4.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.36 + hover * 0.15);
  ctx.lineTo(x - size * 0.25, y + size * 0.48);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.36 + hover * 0.15);
  ctx.lineTo(x + size * 0.25, y + size * 0.48);
  ctx.stroke();
  // Gem accents on trim (optimized - no shadowBlur)
  ctx.fillStyle = "#c084fc";
  for (let g = 0; g < 3; g++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.225,
      y + size * 0.05 + g * size * 0.15,
      size * 0.02,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      x + size * 0.225,
      y + size * 0.05 + g * size * 0.15,
      size * 0.02,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Magnificent academic collar with massive central gem
  const collarGrad = ctx.createLinearGradient(
    x - size * 0.25,
    y - size * 0.35,
    x + size * 0.25,
    y,
  );
  collarGrad.addColorStop(0, "#b8860b");
  collarGrad.addColorStop(0.5, "#c9a227");
  collarGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = collarGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.36 + hover * 0.15);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.2 + hover * 0.15,
    x + size * 0.25,
    y - size * 0.36 + hover * 0.15,
  );
  ctx.lineTo(x + size * 0.2, y - size * 0.08 + hover * 0.15);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.05 + hover * 0.15,
    x - size * 0.2,
    y - size * 0.08 + hover * 0.15,
  );
  ctx.fill();
  // Central void gem (optimized - layered glow)
  ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32 + hover * 0.15);
  ctx.lineTo(x + size * 0.09, y - size * 0.18 + hover * 0.15);
  ctx.lineTo(x, y - size * 0.06 + hover * 0.15);
  ctx.lineTo(x - size * 0.09, y - size * 0.18 + hover * 0.15);
  ctx.fill();
  ctx.fillStyle = "#c084fc";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + hover * 0.15);
  ctx.lineTo(x + size * 0.07, y - size * 0.18 + hover * 0.15);
  ctx.lineTo(x, y - size * 0.08 + hover * 0.15);
  ctx.lineTo(x - size * 0.07, y - size * 0.18 + hover * 0.15);
  ctx.fill();
  // Inner gem glow
  ctx.fillStyle = "#e9d5ff";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.19 + hover * 0.15, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Commanding face - otherworldly beauty
  drawFaceCircle(ctx, x, y - size * 0.55 + hover, size * 0.26, [
    { offset: 0, color: "#f3e8ff" },
    { offset: 0.5, color: "#e9d5ff" },
    { offset: 1, color: "#d8b4fe" },
  ]);

  // Distinguished but otherworldly features - sunken cheeks
  ctx.fillStyle = "rgba(91, 33, 182, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.13,
    y - size * 0.48 + hover,
    size * 0.045,
    size * 0.07,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.13,
    y - size * 0.48 + hover,
    size * 0.045,
    size * 0.07,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Intense glowing eyes of absolute authority
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.09,
    y - size * 0.57 + hover,
    size * 0.055,
    size * 0.065,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.09,
    y - size * 0.57 + hover,
    size * 0.055,
    size * 0.065,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  drawEyes(ctx, x, y - size * 0.57 + hover, size * 0.09, [
    { radius: size * 0.035, color: "#c084fc" },
    { radius: size * 0.015, color: "#1e0a3a" },
  ]);

  // Stern furrowed brows
  ctx.strokeStyle = "#581c87";
  ctx.lineWidth = 3.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.62 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.09,
    y - size * 0.67,
    x - size * 0.02,
    y - size * 0.63 + hover,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.17, y - size * 0.62 + hover);
  ctx.quadraticCurveTo(
    x + size * 0.09,
    y - size * 0.67,
    x + size * 0.02,
    y - size * 0.63 + hover,
  );
  ctx.stroke();

  // Stern authoritative mouth
  ctx.strokeStyle = "#6b21a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.09, y - size * 0.43 + hover);
  ctx.lineTo(x + size * 0.09, y - size * 0.43 + hover);
  ctx.stroke();

  // Distinguished hair/crown of void energy
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.72 + hover,
    size * 0.2,
    size * 0.1,
    0,
    0,
    Math.PI,
  );
  ctx.fill();
  // Void energy tendrils from head
  ctx.strokeStyle = `rgba(168, 85, 247, ${authorityAura * 0.5})`;
  ctx.lineWidth = 2 * zoom;
  for (let t = 0; t < 5; t++) {
    const tendrilAngle = -Math.PI * 0.4 + t * Math.PI * 0.2;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(tendrilAngle) * size * 0.15,
      y - size * 0.72 + hover,
    );
    ctx.quadraticCurveTo(
      x +
        Math.cos(tendrilAngle) * size * 0.25 +
        Math.sin(time * 3 + t) * size * 0.05,
      y - size * 0.85 + hover,
      x + Math.cos(tendrilAngle) * size * 0.2,
      y - size * 0.92 + hover + Math.sin(time * 4 + t) * size * 0.03,
    );
    ctx.stroke();
  }

  // Elaborate mortarboard floating with void energy
  ctx.save();
  ctx.translate(x, y - size * 0.78 + hover + Math.sin(time * 2.5) * 4);
  ctx.rotate(Math.sin(time * 1.8) * 0.04);
  // Cap base
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05, size * 0.22, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  // Diamond-shaped board with ornate edges
  ctx.fillStyle = "#312e81";
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, 0);
  ctx.lineTo(0, -size * 0.12);
  ctx.lineTo(size * 0.28, 0);
  ctx.lineTo(0, size * 0.12);
  ctx.closePath();
  ctx.fill();
  // Golden ornate border
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 3 * zoom;
  ctx.stroke();
  // Corner gems
  ctx.fillStyle = "#a855f7";
  ctx.beginPath();
  ctx.arc(-size * 0.28, 0, size * 0.025, 0, Math.PI * 2);
  ctx.arc(size * 0.28, 0, size * 0.025, 0, Math.PI * 2);
  ctx.arc(0, -size * 0.12, size * 0.025, 0, Math.PI * 2);
  ctx.arc(0, size * 0.12, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Central power gem (optimized - no shadowBlur)
  ctx.fillStyle = "#c084fc";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Ornate golden tassel
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    size * 0.15 + Math.sin(time * 5) * size * 0.06,
    size * 0.1,
    size * 0.2 + Math.cos(time * 4) * size * 0.04,
    size * 0.2,
    size * 0.17,
    size * 0.3,
  );
  ctx.stroke();
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(size * 0.17, size * 0.32, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  // Tassel threads
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.17, size * 0.34);
    ctx.lineTo(
      size * 0.13 + i * size * 0.013 + Math.sin(time * 6 + i) * size * 0.012,
      size * 0.45,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Staff of absolute office - scepter of void authority
  ctx.save();
  ctx.translate(x + size * 0.5, y - size * 0.12 + hover);
  ctx.rotate(0.18 + Math.sin(time * 2.2) * 0.06);
  // Ornate staff body
  const staffGrad = ctx.createLinearGradient(0, -size * 0.4, 0, size * 0.4);
  staffGrad.addColorStop(0, "#1e1b4b");
  staffGrad.addColorStop(0.5, "#312e81");
  staffGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = staffGrad;
  ctx.fillRect(-size * 0.03, -size * 0.4, size * 0.06, size * 0.8);
  // Gold rings and decorations
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(-size * 0.04, -size * 0.35, size * 0.08, size * 0.05);
  ctx.fillRect(-size * 0.04, -size * 0.05, size * 0.08, size * 0.05);
  ctx.fillRect(-size * 0.04, size * 0.25, size * 0.08, size * 0.05);
  // Spiral gold inlay
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  for (let s = 0; s < 10; s++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, -size * 0.28 + s * size * 0.06);
    ctx.lineTo(size * 0.03, -size * 0.25 + s * size * 0.06);
    ctx.stroke();
  }
  // Crown top
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(-size * 0.07, -size * 0.4);
  ctx.lineTo(-size * 0.05, -size * 0.52);
  ctx.lineTo(-size * 0.02, -size * 0.45);
  ctx.lineTo(0, -size * 0.55);
  ctx.lineTo(size * 0.02, -size * 0.45);
  ctx.lineTo(size * 0.05, -size * 0.52);
  ctx.lineTo(size * 0.07, -size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Massive void power orb (optimized - layered glow)
  ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
  ctx.beginPath();
  ctx.arc(0, -size * 0.62, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c084fc";
  ctx.beginPath();
  ctx.arc(0, -size * 0.62, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Inner orb details
  ctx.fillStyle = "#e9d5ff";
  ctx.beginPath();
  ctx.arc(-size * 0.02, -size * 0.64, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Void energy swirling in orb
  ctx.strokeStyle = "#1e1b4b";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.62, size * 0.05, time * 3, time * 3 + Math.PI);
  ctx.stroke();
  ctx.restore();
}
