export function drawTigerHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
) {
  // ARMORED WAR TIGER - Colossal beast warrior with devastating claw attacks
  const breathe = Math.sin(time * 1.8) * 3; // More pronounced breathing
  const idleSway = Math.sin(time * 1.2) * 1.5; // Subtle idle body sway
  const isAttacking = attackPhase > 0;
  const clawSwipe = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 1.8 : 0;
  const bodyLean = isAttacking
    ? Math.sin(attackPhase * Math.PI) * 0.2
    : Math.sin(time * 1.5) * 0.03; // Idle lean
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // Arm raise animation - arms swing UP first, then DOWN during attack
  // Phase 0-0.4: Arms raise up
  // Phase 0.4-1.0: Arms swing down powerfully
  let armRaise = 0;
  if (isAttacking) {
    if (attackPhase < 0.4) {
      // Wind up - arms raise
      armRaise = Math.sin((attackPhase / 0.4) * Math.PI * 0.5) * size * 0.35;
    } else {
      // Swing down - arms come down fast
      armRaise =
        Math.cos(((attackPhase - 0.4) / 0.6) * Math.PI * 0.5) *
        size *
        0.35 *
        (1 - (attackPhase - 0.4) / 0.6);
    }
  }

  // === ATTACK GLOW EFFECT ===
  if (isAttacking) {
    // Outer attack aura - intense orange glow
    const attackGlow = attackIntensity * 0.7;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 25 * zoom * attackIntensity;

    // Pulsing attack ring
    for (let ring = 0; ring < 3; ring++) {
      const ringSize = size * (0.85 + ring * 0.15 + attackIntensity * 0.1);
      const ringAlpha = attackGlow * (0.6 - ring * 0.18);
      ctx.strokeStyle = `rgba(255, 120, 0, ${ringAlpha})`;
      ctx.lineWidth = (4 - ring) * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y, ringSize, ringSize * 0.85, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // === MULTI-LAYERED INFERNAL AURA ===
  const auraIntensity = isAttacking ? 0.65 : 0.2; // Much brighter when attacking
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.1;
    const auraGrad = ctx.createRadialGradient(
      x,
      y,
      size * (0.1 + layerOffset),
      x,
      y,
      size * (1.0 + layerOffset * 0.3),
    );
    auraGrad.addColorStop(
      0,
      `rgba(255, 100, 0, ${auraIntensity * auraPulse * (0.4 - auraLayer * 0.08)})`,
    );
    auraGrad.addColorStop(
      0.4,
      `rgba(255, 60, 0, ${auraIntensity * auraPulse * (0.25 - auraLayer * 0.05)})`,
    );
    auraGrad.addColorStop(
      0.7,
      `rgba(200, 50, 0, ${auraIntensity * auraPulse * (0.12 - auraLayer * 0.02)})`,
    );
    auraGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      size * (0.95 + layerOffset * 0.2),
      size * (0.75 + layerOffset * 0.15),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Floating flame particles
  for (let p = 0; p < 14; p++) {
    const pAngle = (time * 1.2 + p * Math.PI * 0.143) % (Math.PI * 2);
    const pDist = size * 0.75 + Math.sin(time * 2 + p * 0.5) * size * 0.1;
    const px = x + Math.cos(pAngle) * pDist;
    const py =
      y +
      Math.sin(pAngle) * pDist * 0.6 -
      Math.abs(Math.sin(time * 4 + p)) * size * 0.1;
    const pAlpha = 0.6 + Math.sin(time * 4 + p * 0.4) * 0.3;
    ctx.fillStyle =
      p % 3 === 0
        ? `rgba(255, 200, 50, ${pAlpha})`
        : `rgba(255, 100, 0, ${pAlpha})`;
    ctx.beginPath();
    ctx.moveTo(px, py + size * 0.02);
    ctx.quadraticCurveTo(px - size * 0.01, py, px, py - size * 0.025);
    ctx.quadraticCurveTo(px + size * 0.01, py, px, py + size * 0.02);
    ctx.fill();
  }

  // === DEEP SHADOW ===
  const shadowGrad = ctx.createRadialGradient(
    x,
    y + size * 0.6,
    0,
    x,
    y + size * 0.6,
    size * 0.65,
  );
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.6)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.35)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.6, size * 0.65, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);
  ctx.translate(-x, -y);

  // === MASSIVE MUSCULAR TIGER BODY ===
  // Add attack glow to body
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 15 * zoom * attackIntensity;
  }

  const bodyGrad = ctx.createRadialGradient(
    x,
    y + size * 0.05 + breathe * 0.3,
    0,
    x,
    y + size * 0.05 + breathe * 0.3,
    size * 0.7,
  );
  bodyGrad.addColorStop(0, isAttacking ? "#ffbb55" : "#ffaa44");
  bodyGrad.addColorStop(0.3, isAttacking ? "#ff9933" : "#ff8822");
  bodyGrad.addColorStop(0.6, "#dd5500");
  bodyGrad.addColorStop(0.85, "#aa3300");
  bodyGrad.addColorStop(1, "#661800");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Bulkier body shape with more breathing movement
  ctx.ellipse(
    x + idleSway * 0.3,
    y + breathe * 0.4,
    size * 0.58 + breathe * 0.008,
    size * 0.68 + breathe * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // === HEAVY WAR ARMOR - CHEST PLATE ===
  const chestArmorGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y - size * 0.3,
    x + size * 0.4,
    y + size * 0.3,
  );
  chestArmorGrad.addColorStop(0, "#2a2218");
  chestArmorGrad.addColorStop(0.2, "#4a3a28");
  chestArmorGrad.addColorStop(0.4, "#5a4a38");
  chestArmorGrad.addColorStop(0.5, "#6a5a48");
  chestArmorGrad.addColorStop(0.6, "#5a4a38");
  chestArmorGrad.addColorStop(0.8, "#4a3a28");
  chestArmorGrad.addColorStop(1, "#2a2218");
  ctx.fillStyle = chestArmorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.45, y, x - size * 0.35, y + size * 0.3);
  ctx.lineTo(x - size * 0.15, y + size * 0.45);
  ctx.quadraticCurveTo(x, y + size * 0.5, x + size * 0.15, y + size * 0.45);
  ctx.lineTo(x + size * 0.35, y + size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.45, y, x + size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x, y - size * 0.45, x - size * 0.38, y - size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Armor plate edge highlight
  ctx.strokeStyle = "#8a7a68";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.33);
  ctx.quadraticCurveTo(
    x - size * 0.43,
    y - size * 0.05,
    x - size * 0.33,
    y + size * 0.28,
  );
  ctx.stroke();

  // Armor border
  ctx.strokeStyle = "#1a1510";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x - size * 0.45, y, x - size * 0.35, y + size * 0.3);
  ctx.lineTo(x - size * 0.15, y + size * 0.45);
  ctx.quadraticCurveTo(x, y + size * 0.5, x + size * 0.15, y + size * 0.45);
  ctx.lineTo(x + size * 0.35, y + size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.45, y, x + size * 0.38, y - size * 0.35);
  ctx.quadraticCurveTo(x, y - size * 0.45, x - size * 0.38, y - size * 0.35);
  ctx.closePath();
  ctx.stroke();

  // Armor segment lines
  ctx.strokeStyle = "#3a3028";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.1);
  ctx.lineTo(x + size * 0.32, y - size * 0.1);
  ctx.moveTo(x - size * 0.28, y + size * 0.15);
  ctx.lineTo(x + size * 0.28, y + size * 0.15);
  ctx.stroke();

  // Gold trim on armor
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.32);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.36, y - size * 0.32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y + size * 0.43);
  ctx.quadraticCurveTo(x, y + size * 0.48, x + size * 0.13, y + size * 0.43);
  ctx.stroke();

  // Central tiger emblem on armor
  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28);
  ctx.lineTo(x - size * 0.12, y + size * 0.02);
  ctx.lineTo(x, y + size * 0.15);
  ctx.lineTo(x + size * 0.12, y + size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff6600";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22);
  ctx.lineTo(x - size * 0.08, y);
  ctx.lineTo(x, y + size * 0.1);
  ctx.lineTo(x + size * 0.08, y);
  ctx.closePath();
  ctx.fill();
  // Emblem gem
  ctx.fillStyle = "#ff3300";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = isAttacking ? 10 * zoom * gemPulse : 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.06, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Armor studs/rivets
  for (let row = 0; row < 2; row++) {
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      const studX = x + i * size * 0.13;
      const studY = y - size * 0.1 + row * size * 0.25;
      ctx.fillStyle = "#c9a227";
      ctx.beginPath();
      ctx.arc(studX, studY, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f0c040";
      ctx.beginPath();
      ctx.arc(
        studX - size * 0.006,
        studY - size * 0.006,
        size * 0.01,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === DARK TIGER STRIPES (on exposed fur areas) ===
  ctx.strokeStyle = "#050202";
  ctx.lineWidth = 2 * zoom;
  ctx.lineCap = "round";
  // Side stripes visible around armor - more prominent
  for (let i = 0; i < 4; i++) {
    const stripeY = y - size * 0.2 + i * size * 0.14 + breathe * 0.3;
    // Left side stripes - longer and more visible
    ctx.beginPath();
    ctx.moveTo(x - size * 0.58, stripeY);
    ctx.quadraticCurveTo(
      x - size * 0.5,
      stripeY - size * 0.06,
      x - size * 0.4,
      stripeY + size * 0.01,
    );
    ctx.stroke();
    // Right side stripes
    ctx.beginPath();
    ctx.moveTo(x + size * 0.58, stripeY);
    ctx.quadraticCurveTo(
      x + size * 0.5,
      stripeY - size * 0.06,
      x + size * 0.4,
      stripeY + size * 0.01,
    );
    ctx.stroke();
  }

  // === COLOSSAL ARMORED SHOULDERS/PAULDRONS ===
  for (let side = -1; side <= 1; side += 2) {
    const shoulderX =
      x + side * size * 0.52 + (isAttacking ? 0 : idleSway * 0.2);
    const shoulderY =
      y - size * 0.15 - armRaise + (isAttacking ? 0 : breathe * 0.15); // Arms raise up during attack
    const armOffset = isAttacking ? clawSwipe * size * 0.15 * side : 0;

    // Arm rotation during attack - arms rotate outward when raised
    const armRotation = isAttacking
      ? side * (-0.25 - clawSwipe * 0.25 - (armRaise / size) * 0.5)
      : side * (-0.25 + Math.sin(time * 1.5) * 0.05);

    // Attack glow on arms
    if (isAttacking) {
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 12 * zoom * attackIntensity;
    }

    // Massive arm/shoulder muscle
    const armGrad = ctx.createRadialGradient(
      shoulderX + armOffset,
      shoulderY,
      0,
      shoulderX + armOffset,
      shoulderY,
      size * 0.35,
    );
    armGrad.addColorStop(0, isAttacking ? "#ffaa55" : "#ff9944");
    armGrad.addColorStop(0.4, isAttacking ? "#ff8833" : "#ff7722");
    armGrad.addColorStop(0.7, "#dd5500");
    armGrad.addColorStop(1, "#aa3300");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.ellipse(
      shoulderX + armOffset,
      shoulderY,
      size * 0.28,
      size * 0.35,
      armRotation,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Arm stripes - thin and distinctive
    ctx.strokeStyle = "#050202";
    ctx.lineWidth = 1.8 * zoom;
    for (let stripe = 0; stripe < 5; stripe++) {
      const stripeOffset = -size * 0.22 + stripe * size * 0.1;
      ctx.beginPath();
      ctx.moveTo(
        shoulderX + armOffset + side * size * 0.22,
        shoulderY + stripeOffset,
      );
      ctx.quadraticCurveTo(
        shoulderX + armOffset + side * size * 0.14,
        shoulderY + stripeOffset - size * 0.035,
        shoulderX + armOffset + side * size * 0.06,
        shoulderY + stripeOffset + size * 0.01,
      );
      ctx.stroke();
    }

    // Heavy shoulder pauldron with attack glow
    if (isAttacking) {
      ctx.shadowColor = "#ff8800";
      ctx.shadowBlur = 10 * zoom * attackIntensity;
    }
    const pauldronGrad = ctx.createRadialGradient(
      shoulderX + armOffset,
      shoulderY - size * 0.1,
      0,
      shoulderX + armOffset,
      shoulderY - size * 0.1,
      size * 0.25,
    );
    pauldronGrad.addColorStop(0, isAttacking ? "#7a6a58" : "#6a5a48");
    pauldronGrad.addColorStop(0.4, "#5a4a38");
    pauldronGrad.addColorStop(0.7, "#4a3a28");
    pauldronGrad.addColorStop(1, "#2a2218");
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(
      shoulderX + armOffset,
      shoulderY - size * 0.08,
      size * 0.22,
      size * 0.18,
      armRotation * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pauldron spikes
    for (let spike = -1; spike <= 1; spike++) {
      const spikeAngle = armRotation * 0.5 + spike * 0.4;
      const spikeX =
        shoulderX +
        armOffset +
        Math.cos(spikeAngle - Math.PI * 0.5) * size * 0.15;
      const spikeY =
        shoulderY -
        size * 0.08 +
        Math.sin(spikeAngle - Math.PI * 0.5) * size * 0.1;
      const spikeLen = spike === 0 ? size * 0.2 : size * 0.14;

      ctx.fillStyle = "#3a3028";
      ctx.beginPath();
      ctx.moveTo(spikeX - size * 0.025, spikeY);
      ctx.lineTo(spikeX + side * spikeLen * 0.3, spikeY - spikeLen);
      ctx.lineTo(spikeX + size * 0.025, spikeY);
      ctx.closePath();
      ctx.fill();
      // Spike highlight
      ctx.strokeStyle = "#5a4a38";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(spikeX - size * 0.015, spikeY);
      ctx.lineTo(
        spikeX + side * spikeLen * 0.25,
        spikeY - spikeLen + size * 0.02,
      );
      ctx.stroke();
    }

    // Gold trim on pauldron - glows during attack
    ctx.strokeStyle = isAttacking
      ? `rgba(255, 180, 50, ${0.8 + attackIntensity * 0.2})`
      : "#c9a227";
    ctx.lineWidth = (2 + (isAttacking ? attackIntensity : 0)) * zoom;
    if (isAttacking) {
      ctx.shadowColor = "#ffaa00";
      ctx.shadowBlur = 8 * zoom * attackIntensity;
    }
    ctx.beginPath();
    ctx.ellipse(
      shoulderX + armOffset,
      shoulderY - size * 0.08,
      size * 0.22,
      size * 0.18,
      armRotation * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pauldron gem - glows intensely during attack
    ctx.fillStyle = isAttacking ? "#ff6600" : "#ff4400";
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur =
      (isAttacking ? 12 + attackIntensity * 10 : 5) * zoom * gemPulse;
    ctx.beginPath();
    ctx.arc(
      shoulderX + armOffset,
      shoulderY - size * 0.1,
      size * (0.03 + (isAttacking ? attackIntensity * 0.01 : 0)),
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // === ARMORED CLAW GAUNTLETS ===
    // Claws move with arms - raise up during wind-up, extend down during strike
    const clawX = shoulderX + armOffset * 1.8 + side * size * 0.15;
    const clawY = y + size * 0.28 - armRaise * 0.8; // Claws raise with arms
    const clawExtend = isAttacking ? attackIntensity * size * 0.3 : 0;

    // Paw base with fur - glows during attack
    if (isAttacking) {
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 15 * zoom * attackIntensity;
    }
    const pawGrad = ctx.createRadialGradient(
      clawX,
      clawY - size * 0.06,
      0,
      clawX,
      clawY - size * 0.06,
      size * 0.16,
    );
    pawGrad.addColorStop(0, isAttacking ? "#ffbb66" : "#ffaa55");
    pawGrad.addColorStop(0.6, isAttacking ? "#ff9944" : "#ff8833");
    pawGrad.addColorStop(1, "#cc5500");
    ctx.fillStyle = pawGrad;
    ctx.beginPath();
    ctx.ellipse(
      clawX,
      clawY - size * 0.04,
      size * 0.14,
      size * 0.12,
      armRotation * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Metal claw guards/gauntlet
    const gauntletGrad = ctx.createLinearGradient(
      clawX - size * 0.1,
      clawY,
      clawX + size * 0.1,
      clawY,
    );
    gauntletGrad.addColorStop(0, "#2a2218");
    gauntletGrad.addColorStop(0.3, "#4a3a28");
    gauntletGrad.addColorStop(0.5, "#5a4a38");
    gauntletGrad.addColorStop(0.7, "#4a3a28");
    gauntletGrad.addColorStop(1, "#2a2218");
    ctx.fillStyle = gauntletGrad;
    ctx.beginPath();
    ctx.moveTo(clawX - size * 0.1, clawY - size * 0.08);
    ctx.lineTo(clawX - size * 0.12, clawY + size * 0.04);
    ctx.lineTo(clawX + size * 0.12, clawY + size * 0.04);
    ctx.lineTo(clawX + size * 0.1, clawY - size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Deadly claws with metal tips
    for (let c = 0; c < 4; c++) {
      const clawAngle = (c - 1.5) * 0.35 + side * (clawSwipe * 0.4);
      const clawBaseX = clawX + Math.sin(clawAngle) * size * 0.12;
      const clawBaseY = clawY + size * 0.04 + Math.cos(clawAngle) * size * 0.04;

      ctx.save();
      ctx.translate(clawBaseX, clawBaseY);
      ctx.rotate(clawAngle * 0.4);

      // Metal-reinforced claw
      const metalClawGrad = ctx.createLinearGradient(
        0,
        0,
        0,
        size * 0.16 + clawExtend,
      );
      metalClawGrad.addColorStop(0, "#4a4a4a");
      metalClawGrad.addColorStop(0.2, "#2a2a2a");
      metalClawGrad.addColorStop(0.6, "#1a1a1a");
      metalClawGrad.addColorStop(0.85, "#3a3a3a");
      metalClawGrad.addColorStop(1, "#ffffff");
      ctx.fillStyle = metalClawGrad;

      ctx.beginPath();
      ctx.moveTo(-size * 0.028, 0);
      ctx.quadraticCurveTo(
        -size * 0.032,
        size * 0.08 + clawExtend * 0.5,
        0,
        size * 0.16 + clawExtend,
      );
      ctx.quadraticCurveTo(
        size * 0.032,
        size * 0.08 + clawExtend * 0.5,
        size * 0.028,
        0,
      );
      ctx.closePath();
      ctx.fill();

      // Claw highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(-size * 0.012, size * 0.025);
      ctx.lineTo(0, size * 0.14 + clawExtend * 0.85);
      ctx.stroke();

      ctx.restore();
    }

    // === EPIC CLAW SLASH EFFECT (Top-Down Diagonal Swipe) ===
    // Only trigger during the swing-down phase (after arms are raised)
    if (isAttacking && attackPhase > 0.35 && attackPhase < 0.95) {
      const slashProgress = (attackPhase - 0.35) / 0.6;
      const slashAlpha = Math.sin(slashProgress * Math.PI) * 0.95;

      // Starting position matches raised arm position
      const slashStartX = shoulderX + side * size * 0.2;
      const slashStartY = y - size * 0.5; // High starting point

      // Four parallel slash marks sweeping down diagonally
      for (let s = 0; s < 4; s++) {
        const slashOffset = s * size * 0.065;
        const slashEndX = shoulderX + side * size * 0.7 * slashProgress;
        const slashEndY = y + size * 0.65 * slashProgress;

        // Main slash trail gradient - brighter and more intense
        const slashGrad = ctx.createLinearGradient(
          slashStartX + slashOffset * side,
          slashStartY,
          slashEndX + slashOffset * side,
          slashEndY,
        );
        slashGrad.addColorStop(0, `rgba(255, 255, 220, ${slashAlpha * 0.4})`);
        slashGrad.addColorStop(0.15, `rgba(255, 240, 120, ${slashAlpha})`);
        slashGrad.addColorStop(0.4, `rgba(255, 160, 20, ${slashAlpha * 0.9})`);
        slashGrad.addColorStop(0.7, `rgba(255, 100, 0, ${slashAlpha * 0.6})`);
        slashGrad.addColorStop(1, `rgba(255, 60, 0, 0)`);

        ctx.strokeStyle = slashGrad;
        ctx.lineWidth = (7 - s * 1.2) * zoom;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(
          slashStartX + slashOffset * side,
          slashStartY + slashOffset * 0.4,
        );
        ctx.bezierCurveTo(
          slashStartX + side * size * 0.35 + slashOffset * side,
          slashStartY + size * 0.25,
          shoulderX + side * size * 0.5 + slashOffset * side,
          y + size * 0.15,
          slashEndX + slashOffset * side,
          slashEndY + slashOffset * 0.6,
        );
        ctx.stroke();
      }

      // Add spark particles along the slash - more particles, more dynamic
      if (slashProgress > 0.2 && slashProgress < 0.85) {
        for (let spark = 0; spark < 12; spark++) {
          const sparkProgress = slashProgress * 0.75 + spark * 0.04;
          const sparkX =
            slashStartX +
            (shoulderX + side * size * 0.55 - slashStartX) * sparkProgress +
            side * Math.sin(spark * 2.5 + time * 10) * size * 0.06;
          const sparkY =
            slashStartY +
            (y + size * 0.45 - slashStartY) * sparkProgress +
            Math.cos(spark * 3.5 + time * 8) * size * 0.05;
          const sparkAlpha = slashAlpha * (1 - spark * 0.07);
          const sparkSize = size * (0.022 - spark * 0.0012);

          // Glow behind sparks
          ctx.shadowColor = "#ff8800";
          ctx.shadowBlur = 6 * zoom;
          ctx.fillStyle =
            spark % 3 === 0
              ? `rgba(255, 255, 180, ${sparkAlpha})`
              : spark % 3 === 1
                ? `rgba(255, 200, 80, ${sparkAlpha * 0.9})`
                : `rgba(255, 140, 20, ${sparkAlpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  // === ARMORED LEG GUARDS ===
  for (let side = -1; side <= 1; side += 2) {
    const legX = x + side * size * 0.28;
    const legY = y + size * 0.5;

    // Leg fur
    ctx.fillStyle = "#dd6600";
    ctx.beginPath();
    ctx.ellipse(legX, legY, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leg armor
    const legArmorGrad = ctx.createLinearGradient(
      legX - size * 0.08,
      legY - size * 0.1,
      legX + size * 0.08,
      legY + size * 0.1,
    );
    legArmorGrad.addColorStop(0, "#3a3028");
    legArmorGrad.addColorStop(0.5, "#5a4a38");
    legArmorGrad.addColorStop(1, "#3a3028");
    ctx.fillStyle = legArmorGrad;
    ctx.beginPath();
    ctx.moveTo(legX - size * 0.08, legY - size * 0.08);
    ctx.lineTo(legX - size * 0.1, legY + size * 0.1);
    ctx.lineTo(legX + size * 0.1, legY + size * 0.1);
    ctx.lineTo(legX + size * 0.08, legY - size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // === FIERCE ARMORED TIGER HEAD ===
  // Head bobs slightly with breathing
  const headY = y - size * 0.55 + breathe * 0.1;
  const headX = x + idleSway * 0.15;

  // Attack glow on head
  if (isAttacking) {
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 18 * zoom * attackIntensity;
  }

  const headGrad = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    size * 0.42,
  );
  headGrad.addColorStop(0, isAttacking ? "#ffbb55" : "#ffaa44");
  headGrad.addColorStop(0.4, isAttacking ? "#ff9933" : "#ff8822");
  headGrad.addColorStop(0.7, "#dd5500");
  headGrad.addColorStop(1, "#aa3300");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY, size * 0.4, size * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === WAR CROWN/HELMET ===
  const crownGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y - size * 0.85,
    x + size * 0.35,
    y - size * 0.85,
  );
  crownGrad.addColorStop(0, "#2a2218");
  crownGrad.addColorStop(0.3, "#5a4a38");
  crownGrad.addColorStop(0.5, "#6a5a48");
  crownGrad.addColorStop(0.7, "#5a4a38");
  crownGrad.addColorStop(1, "#2a2218");
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.72);
  ctx.lineTo(x - size * 0.38, y - size * 0.88);
  ctx.lineTo(x - size * 0.2, y - size * 0.78);
  ctx.lineTo(x - size * 0.12, y - size * 0.95);
  ctx.lineTo(x, y - size * 0.82);
  ctx.lineTo(x + size * 0.12, y - size * 0.95);
  ctx.lineTo(x + size * 0.2, y - size * 0.78);
  ctx.lineTo(x + size * 0.38, y - size * 0.88);
  ctx.lineTo(x + size * 0.32, y - size * 0.72);
  ctx.closePath();
  ctx.fill();

  // Crown gold trim
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // Crown gems
  const crownGemPositions = [
    { x: x - size * 0.12, y: y - size * 0.9 },
    { x: x, y: y - size * 0.78 },
    { x: x + size * 0.12, y: y - size * 0.9 },
  ];
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 6 * zoom * gemPulse;
  for (const gem of crownGemPositions) {
    ctx.fillStyle = "#ff4400";
    ctx.beginPath();
    ctx.arc(gem.x, gem.y, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Forehead armor plate
  ctx.fillStyle = "#4a3a28";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.7);
  ctx.lineTo(x, y - size * 0.58);
  ctx.lineTo(x + size * 0.22, y - size * 0.7);
  ctx.lineTo(x + size * 0.15, y - size * 0.75);
  ctx.lineTo(x, y - size * 0.68);
  ctx.lineTo(x - size * 0.15, y - size * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // === HEAD STRIPES ===
  ctx.strokeStyle = "#0a0505";
  ctx.lineWidth = 3 * zoom;
  ctx.lineCap = "round";
  // Cheek stripes (bold, jagged)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.58);
  ctx.lineTo(x - size * 0.25, y - size * 0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.5);
  ctx.lineTo(x - size * 0.22, y - size * 0.46);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.38, y - size * 0.58);
  ctx.lineTo(x + size * 0.25, y - size * 0.52);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.36, y - size * 0.5);
  ctx.lineTo(x + size * 0.22, y - size * 0.46);
  ctx.stroke();

  // === FIERCE POINTED EARS WITH ARMOR ===
  for (let side = -1; side <= 1; side += 2) {
    // Ear base
    ctx.fillStyle = "#dd6600";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.28, y - size * 0.72);
    ctx.lineTo(x + side * size * 0.42, y - size * 1.0);
    ctx.lineTo(x + side * size * 0.18, y - size * 0.76);
    ctx.closePath();
    ctx.fill();
    // Dark ear tips
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.36, y - size * 0.9);
    ctx.lineTo(x + side * size * 0.42, y - size * 1.0);
    ctx.lineTo(x + side * size * 0.32, y - size * 0.88);
    ctx.closePath();
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "#ffccaa";
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.27, y - size * 0.74);
    ctx.lineTo(x + side * size * 0.35, y - size * 0.88);
    ctx.lineTo(x + side * size * 0.2, y - size * 0.76);
    ctx.closePath();
    ctx.fill();
    // Ear armor ring
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.3,
      y - size * 0.78,
      size * 0.025,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === MUZZLE ===
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.44, size * 0.18, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Whisker dots (prominent white)
  ctx.fillStyle = "#ffffff";
  for (let side = -1; side <= 1; side += 2) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const dotX = x + side * (size * 0.06 + col * size * 0.035);
        const dotY = y - size * 0.46 + row * size * 0.03;
        ctx.beginPath();
        ctx.arc(dotX, dotY, size * 0.012, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Nose (larger, more fierce)
  ctx.fillStyle = "#1a0a05";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52);
  ctx.lineTo(x - size * 0.08, y - size * 0.44);
  ctx.quadraticCurveTo(x, y - size * 0.42, x + size * 0.08, y - size * 0.44);
  ctx.closePath();
  ctx.fill();
  // Nose highlight
  ctx.fillStyle = "#3a2a20";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.02,
    y - size * 0.48,
    size * 0.015,
    size * 0.01,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === GLOWING FIERCE EYES ===
  const eyeGlow = 0.9 + Math.sin(time * 4) * 0.1 + attackIntensity * 0.3;
  const eyeY = y - size * 0.62 + breathe * 0.08; // Eyes move slightly with breathing

  // Eye socket shadows
  ctx.fillStyle = "#1a0a05";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    eyeY,
    size * 0.11,
    size * 0.085,
    -0.15,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.15,
    eyeY,
    size * 0.11,
    size * 0.085,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing eyes - INTENSE glow during attack
  ctx.shadowColor = isAttacking ? "#ff4400" : "#ffaa00";
  ctx.shadowBlur = (isAttacking ? 25 + attackIntensity * 20 : 12) * zoom;
  ctx.fillStyle = isAttacking
    ? `rgba(255, 100, 0, ${eyeGlow})`
    : `rgba(255, 180, 0, ${eyeGlow})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    eyeY,
    size * (0.1 + attackIntensity * 0.015),
    size * (0.07 + attackIntensity * 0.01),
    -0.15,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.15,
    eyeY,
    size * (0.1 + attackIntensity * 0.015),
    size * (0.07 + attackIntensity * 0.01),
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Angry brow ridges
  ctx.strokeStyle = "#0a0505";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.68);
  ctx.quadraticCurveTo(
    x - size * 0.15,
    y - size * 0.72,
    x - size * 0.08,
    y - size * 0.68,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.68);
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y - size * 0.72,
    x + size * 0.08,
    y - size * 0.68,
  );
  ctx.stroke();

  // Slit pupils (menacing) - narrow during attack
  const pupilWidth = isAttacking ? size * 0.018 : size * 0.025;
  ctx.fillStyle = "#0a0505";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    eyeY,
    pupilWidth,
    size * 0.06,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.15,
    eyeY,
    pupilWidth,
    size * 0.06,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye glints
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.12, eyeY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.18, eyeY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // === ROARING MOUTH ===
  const mouthOpen = isAttacking
    ? size * 0.06 + attackIntensity * size * 0.08
    : size * 0.04;

  // Mouth interior
  ctx.fillStyle = "#2a0000";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.34,
    size * 0.14 + attackIntensity * 0.04,
    mouthOpen,
    0,
    0,
    Math.PI,
  );
  ctx.fill();

  // Tongue
  ctx.fillStyle = "#cc4466";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.32 + mouthOpen * 0.4,
    size * 0.08,
    size * 0.04,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === MASSIVE FANGS ===
  ctx.fillStyle = "#fffff8";
  // Left fang
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.4);
  ctx.lineTo(x - size * 0.06, y - size * 0.26 + attackIntensity * size * 0.04);
  ctx.lineTo(x - size * 0.02, y - size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Right fang
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.4);
  ctx.lineTo(x + size * 0.06, y - size * 0.26 + attackIntensity * size * 0.04);
  ctx.lineTo(x + size * 0.02, y - size * 0.4);
  ctx.closePath();
  ctx.fill();
  // Fang highlights
  ctx.strokeStyle = "rgba(200, 200, 200, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.38);
  ctx.lineTo(x - size * 0.06, y - size * 0.28);
  ctx.moveTo(x + size * 0.08, y - size * 0.38);
  ctx.lineTo(x + size * 0.06, y - size * 0.28);
  ctx.stroke();

  ctx.restore();

  // === BATTLE ROAR EFFECT ===
  if (isAttacking && attackPhase > 0.15 && attackPhase < 0.65) {
    const roarProgress = (attackPhase - 0.15) / 0.5;
    const roarAlpha = Math.sin(roarProgress * Math.PI) * 0.6;
    for (let w = 0; w < 4; w++) {
      const waveRadius = size * 0.4 + w * size * 0.2 * roarProgress;
      ctx.strokeStyle =
        w % 2 === 0
          ? `rgba(255, 150, 0, ${roarAlpha * (1 - w * 0.2)})`
          : `rgba(255, 80, 0, ${roarAlpha * (1 - w * 0.2)})`;
      ctx.lineWidth = (4 - w * 0.8) * zoom;
      ctx.beginPath();
      ctx.arc(x, y - size * 0.45, waveRadius, -0.9, 0.9);
      ctx.stroke();
    }
  }
}
