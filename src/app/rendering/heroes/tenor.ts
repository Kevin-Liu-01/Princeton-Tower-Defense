export function drawTenorHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // GRAND ORNATE TENOR - Triangle Club Opera Master with devastating voice attacks
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const singWave = Math.sin(time * 3) * 3;
  const breathe = Math.sin(time * 2) * 1.5;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;

  // === MULTI-LAYERED SONIC AURA ===
  const auraBase = isAttacking ? 0.4 : 0.2;
  const auraPulse = 0.85 + Math.sin(time * 3.5) * 0.15;
  for (let auraLayer = 0; auraLayer < 4; auraLayer++) {
    const layerOffset = auraLayer * 0.1;
    const auraGrad = ctx.createRadialGradient(
      x, y - size * 0.2, size * (0.1 + layerOffset),
      x, y - size * 0.2, size * (0.95 + layerOffset * 0.3)
    );
    const layerAlpha = (auraBase - auraLayer * 0.04) * auraPulse;
    auraGrad.addColorStop(0, `rgba(147, 112, 219, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(0.4, `rgba(180, 150, 235, ${layerAlpha * 0.35})`);
    auraGrad.addColorStop(0.7, `rgba(255, 102, 0, ${layerAlpha * 0.2})`);
    auraGrad.addColorStop(1, "rgba(147, 112, 219, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, size * (0.9 + layerOffset * 0.2), size * (0.65 + layerOffset * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating musical particles
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.8 + p * Math.PI * 0.2) % (Math.PI * 2);
    const pDist = size * 0.6 + Math.sin(time * 2.5 + p * 0.7) * size * 0.12;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - size * 0.2 + Math.sin(pAngle) * pDist * 0.5;
    const pAlpha = 0.55 + Math.sin(time * 4 + p * 0.6) * 0.3;
    ctx.fillStyle = p % 2 === 0 ? `rgba(147, 112, 219, ${pAlpha})` : `rgba(255, 102, 0, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // === SONIC SHOCKWAVE RINGS (during attack) ===
  if (isAttacking) {
    for (let ring = 0; ring < 5; ring++) {
      const ringPhase = (attackPhase * 2.5 + ring * 0.12) % 1;
      const ringAlpha = (1 - ringPhase) * 0.6 * attackIntensity;
      // Outer ring
      ctx.strokeStyle = `rgba(147, 112, 219, ${ringAlpha})`;
      ctx.lineWidth = (4 - ring * 0.6) * zoom;
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.25, size * (0.55 + ringPhase * 0.9), size * (0.42 + ringPhase * 0.7), 0, 0, Math.PI * 2);
      ctx.stroke();
      // Inner bright ring
      ctx.strokeStyle = `rgba(255, 200, 255, ${ringAlpha * 0.4})`;
      ctx.lineWidth = (2 - ring * 0.3) * zoom;
      ctx.stroke();
    }
  }

  // === SHADOW WITH DEPTH ===
  const shadowGrad = ctx.createRadialGradient(x, y + size * 0.52, 0, x, y + size * 0.52, size * 0.45);
  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
  shadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.25)");
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.42, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ELEGANT FORMAL TUXEDO WITH PURPLE HIGHLIGHTS ===
  // Tuxedo jacket main body - deep purple undertones
  const tuxGrad = ctx.createLinearGradient(x - size * 0.4, y - size * 0.3, x + size * 0.4, y + size * 0.4);
  tuxGrad.addColorStop(0, "#0a0515");
  tuxGrad.addColorStop(0.15, "#1a1028");
  tuxGrad.addColorStop(0.35, "#251538");
  tuxGrad.addColorStop(0.5, "#301a45");
  tuxGrad.addColorStop(0.65, "#251538");
  tuxGrad.addColorStop(0.85, "#1a1028");
  tuxGrad.addColorStop(1, "#0a0515");
  ctx.fillStyle = tuxGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.52 + breathe);
  ctx.lineTo(x - size * 0.45, y - size * 0.14);
  ctx.lineTo(x - size * 0.35, y - size * 0.28);
  ctx.quadraticCurveTo(x, y - size * 0.38, x + size * 0.35, y - size * 0.28);
  ctx.lineTo(x + size * 0.45, y - size * 0.14);
  ctx.lineTo(x + size * 0.4, y + size * 0.52 + breathe);
  ctx.closePath();
  ctx.fill();

  // Tuxedo edge highlight - purple
  ctx.strokeStyle = "#5a3070";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.5 + breathe);
  ctx.lineTo(x - size * 0.43, y - size * 0.12);
  ctx.lineTo(x - size * 0.33, y - size * 0.26);
  ctx.stroke();

  // Satin lapels - rich purple
  const lapelGrad = ctx.createLinearGradient(x - size * 0.3, y - size * 0.25, x, y + size * 0.1);
  lapelGrad.addColorStop(0, "#4a2060");
  lapelGrad.addColorStop(0.5, "#6a3080");
  lapelGrad.addColorStop(1, "#4a2060");
  ctx.fillStyle = lapelGrad;
  // Left lapel
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.26);
  ctx.lineTo(x - size * 0.16, y - size * 0.22);
  ctx.lineTo(x - size * 0.18, y + size * 0.15);
  ctx.lineTo(x - size * 0.35, y + size * 0.05);
  ctx.closePath();
  ctx.fill();
  // Right lapel
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.26);
  ctx.lineTo(x + size * 0.16, y - size * 0.22);
  ctx.lineTo(x + size * 0.18, y + size * 0.15);
  ctx.lineTo(x + size * 0.35, y + size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Lapel borders - glowing purple
  ctx.strokeStyle = "#9060c0";
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = 3 * zoom;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.22);
  ctx.lineTo(x - size * 0.18, y + size * 0.15);
  ctx.moveTo(x + size * 0.16, y - size * 0.22);
  ctx.lineTo(x + size * 0.18, y + size * 0.15);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Elegant tuxedo tails
  const tailWave = Math.sin(time * 2.5) * 0.08;
  ctx.fillStyle = "#101015";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.35);
  ctx.bezierCurveTo(
    x - size * 0.38 - tailWave * size, y + size * 0.52,
    x - size * 0.35 - tailWave * size, y + size * 0.68,
    x - size * 0.3, y + size * 0.72
  );
  ctx.lineTo(x - size * 0.2, y + size * 0.58);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y + size * 0.35);
  ctx.bezierCurveTo(
    x + size * 0.38 + tailWave * size, y + size * 0.52,
    x + size * 0.35 + tailWave * size, y + size * 0.68,
    x + size * 0.3, y + size * 0.72
  );
  ctx.lineTo(x + size * 0.2, y + size * 0.58);
  ctx.closePath();
  ctx.fill();

  // Gold buttons
  ctx.fillStyle = "#c9a227";
  for (let btn = 0; btn < 3; btn++) {
  ctx.beginPath();
    ctx.arc(x - size * 0.2, y + size * 0.02 + btn * size * 0.12, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0c040";
    ctx.beginPath();
    ctx.arc(x - size * 0.2 - size * 0.005, y + size * 0.015 + btn * size * 0.12, size * 0.01, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9a227";
  }

  // === DRAMATIC OPERA ARMS ===
  // Arm animation: idle = relaxed at sides, attacking = raised dramatically for opera singing
  const armRaiseLeft = isAttacking ? Math.sin(attackPhase * Math.PI) * 0.8 : Math.sin(time * 1.5) * 0.1;
  const armRaiseRight = isAttacking ? Math.sin(attackPhase * Math.PI + 0.3) * 0.9 : Math.sin(time * 1.5 + 0.5) * 0.1;
  
  // Left arm (conducting arm - more dramatic)
  ctx.save();
  ctx.translate(x - size * 0.42, y - size * 0.1);
  ctx.rotate(-0.3 - armRaiseLeft * 1.2);
  
  // Left sleeve (tuxedo) - purple tones
  const leftSleeveGrad = ctx.createLinearGradient(0, 0, size * 0.15, size * 0.35);
  leftSleeveGrad.addColorStop(0, "#1a1028");
  leftSleeveGrad.addColorStop(0.5, "#2a1840");
  leftSleeveGrad.addColorStop(1, "#150a20");
  ctx.fillStyle = leftSleeveGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.08, size * 0.15, size * 0.05, size * 0.32);
  ctx.lineTo(-size * 0.08, size * 0.3);
  ctx.quadraticCurveTo(-size * 0.1, size * 0.15, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5a3070";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Left cuff - purple accent
  ctx.fillStyle = "#a060c0";
  ctx.beginPath();
  ctx.ellipse(-size * 0.015, size * 0.31, size * 0.07, size * 0.025, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  
  // Left hand
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(-size * 0.01, size * 0.37, size * 0.045, size * 0.06, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Fingers spread dramatically during attack
  if (isAttacking) {
    ctx.strokeStyle = "#f5d0a8";
    ctx.lineWidth = 3 * zoom;
    ctx.lineCap = "round";
    for (let f = 0; f < 5; f++) {
      const fingerAngle = -0.6 + f * 0.3;
      const fingerLen = size * (0.04 + (f === 2 ? 0.015 : 0));
      ctx.beginPath();
      ctx.moveTo(-size * 0.01 + Math.cos(fingerAngle) * size * 0.03, size * 0.37 + Math.sin(fingerAngle) * size * 0.045);
      ctx.lineTo(-size * 0.01 + Math.cos(fingerAngle) * (size * 0.03 + fingerLen), size * 0.37 + Math.sin(fingerAngle) * (size * 0.045 + fingerLen * 0.6));
      ctx.stroke();
    }
  }
  ctx.restore();
  
  // Right arm (supporting arm)
  ctx.save();
  ctx.translate(x + size * 0.42, y - size * 0.1);
  ctx.rotate(0.3 + armRaiseRight * 1.0);
  
  // Right sleeve (tuxedo) - purple tones
  const rightSleeveGrad = ctx.createLinearGradient(0, 0, -size * 0.15, size * 0.35);
  rightSleeveGrad.addColorStop(0, "#1a1028");
  rightSleeveGrad.addColorStop(0.5, "#2a1840");
  rightSleeveGrad.addColorStop(1, "#150a20");
  ctx.fillStyle = rightSleeveGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-size * 0.08, size * 0.15, -size * 0.05, size * 0.32);
  ctx.lineTo(size * 0.08, size * 0.3);
  ctx.quadraticCurveTo(size * 0.1, size * 0.15, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5a3070";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Right cuff - purple accent
  ctx.fillStyle = "#a060c0";
  ctx.beginPath();
  ctx.ellipse(size * 0.015, size * 0.31, size * 0.07, size * 0.025, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  
  // Right hand (cupped gesture for opera)
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(size * 0.01, size * 0.37, size * 0.045, size * 0.06, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // Fingers together, cupped during attack
  if (isAttacking) {
    ctx.strokeStyle = "#f5d0a8";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(size * 0.01, size * 0.4, size * 0.035, 0.3 * Math.PI, 0.7 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();

  // Pocket square (purple silk)
  const pocketGrad = ctx.createLinearGradient(x - size * 0.32, y - size * 0.1, x - size * 0.24, y - size * 0.05);
  pocketGrad.addColorStop(0, "#8040a0");
  pocketGrad.addColorStop(0.5, "#a060c0");
  pocketGrad.addColorStop(1, "#8040a0");
  ctx.fillStyle = pocketGrad;
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.1);
  ctx.lineTo(x - size * 0.28, y - size * 0.15);
  ctx.lineTo(x - size * 0.24, y - size * 0.08);
  ctx.lineTo(x - size * 0.26, y - size * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // === PRISTINE WHITE SHIRT WITH RUFFLES ===
  const shirtGrad = ctx.createLinearGradient(x - size * 0.15, y - size * 0.2, x + size * 0.15, y + size * 0.3);
  shirtGrad.addColorStop(0, "#ffffff");
  shirtGrad.addColorStop(0.5, "#f8f8f8");
  shirtGrad.addColorStop(1, "#f0f0f0");
  ctx.fillStyle = shirtGrad;
    ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.24);
  ctx.lineTo(x - size * 0.12, y + size * 0.38);
  ctx.lineTo(x + size * 0.12, y + size * 0.38);
  ctx.lineTo(x + size * 0.15, y - size * 0.24);
  ctx.closePath();
  ctx.fill();

  // Elaborate ruffle details
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 5; i++) {
    const ruffY = y - size * 0.12 + i * size * 0.09;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, ruffY);
    ctx.quadraticCurveTo(x - size * 0.03, ruffY + size * 0.025, x, ruffY);
    ctx.quadraticCurveTo(x + size * 0.03, ruffY + size * 0.025, x + size * 0.1, ruffY);
    ctx.stroke();
  }

  // === ORNATE PURPLE BOW TIE ===
  ctx.shadowColor = "#b080e0";
  ctx.shadowBlur = (isAttacking ? 12 * attackIntensity : 4) * zoom;
  // Left bow
  const bowGrad = ctx.createLinearGradient(x - size * 0.14, y - size * 0.2, x, y - size * 0.16);
  bowGrad.addColorStop(0, "#6030a0");
  bowGrad.addColorStop(0.5, "#9050c0");
  bowGrad.addColorStop(1, "#a070d0");
  ctx.fillStyle = bowGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y - size * 0.19);
  ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.26, x - size * 0.14, y - size * 0.24);
  ctx.quadraticCurveTo(x - size * 0.16, y - size * 0.18, x - size * 0.14, y - size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.1, x - size * 0.02, y - size * 0.17);
  ctx.closePath();
  ctx.fill();
  // Right bow
  ctx.beginPath();
  ctx.moveTo(x + size * 0.02, y - size * 0.19);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.26, x + size * 0.14, y - size * 0.24);
  ctx.quadraticCurveTo(x + size * 0.16, y - size * 0.18, x + size * 0.14, y - size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.1, x + size * 0.02, y - size * 0.17);
  ctx.closePath();
  ctx.fill();
  // Bow center knot
  ctx.fillStyle = "#6030a0";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.18, size * 0.035, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bow gem - glowing purple
  ctx.fillStyle = "#c090e0";
  ctx.shadowColor = "#d0a0ff";
  ctx.shadowBlur = isAttacking ? 8 * zoom * gemPulse : 5 * zoom * gemPulse;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.18, size * 0.018, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // === DRAMATIC OPERA HEAD ===
  const headY = y - size * 0.48 + singWave * 0.2 + breathe * 0.1;
  
  // Head with subtle skin gradient
  const skinGrad = ctx.createRadialGradient(x - size * 0.05, headY - size * 0.05, 0, x, headY, size * 0.28);
  skinGrad.addColorStop(0, "#ffe8d0");
  skinGrad.addColorStop(0.6, "#ffe0bd");
  skinGrad.addColorStop(1, "#f5d0a8");
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.arc(x, headY, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Cheekbone highlights
  ctx.fillStyle = "rgba(255, 200, 180, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.12, headY + size * 0.02, size * 0.06, size * 0.04, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.12, headY + size * 0.02, size * 0.06, size * 0.04, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // === ELABORATE SLICKED HAIR ===
  const hairGrad = ctx.createLinearGradient(x - size * 0.25, headY - size * 0.2, x + size * 0.25, headY - size * 0.3);
  hairGrad.addColorStop(0, "#0a0500");
  hairGrad.addColorStop(0.3, "#1a0a00");
  hairGrad.addColorStop(0.5, "#2a1505");
  hairGrad.addColorStop(0.7, "#1a0a00");
  hairGrad.addColorStop(1, "#0a0500");
  ctx.fillStyle = hairGrad;
  
  // Main hair shape
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, headY - size * 0.06);
  ctx.quadraticCurveTo(x - size * 0.32, headY - size * 0.25, x - size * 0.15, headY - size * 0.32);
  ctx.quadraticCurveTo(x, headY - size * 0.35, x + size * 0.15, headY - size * 0.32);
  ctx.quadraticCurveTo(x + size * 0.32, headY - size * 0.25, x + size * 0.25, headY - size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Hair wave crest
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, headY - size * 0.08);
  ctx.bezierCurveTo(
    x - size * 0.35, headY - size * 0.3,
    x - size * 0.1, headY - size * 0.38,
    x, headY - size * 0.35
  );
  ctx.bezierCurveTo(
    x + size * 0.1, headY - size * 0.38,
    x + size * 0.35, headY - size * 0.3,
    x + size * 0.22, headY - size * 0.08
  );
  ctx.fill();

  // Hair highlights
  ctx.strokeStyle = "#3a2010";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let strand = 0; strand < 5; strand++) {
    const strandX = x - size * 0.15 + strand * size * 0.075;
    ctx.beginPath();
    ctx.moveTo(strandX, headY - size * 0.1);
    ctx.quadraticCurveTo(strandX - size * 0.02, headY - size * 0.22, strandX + size * 0.01, headY - size * 0.32);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === DRAMATIC OPERA EYES ===
  if (isAttacking) {
    // Glowing closed eyes during attack
    ctx.fillStyle = `rgba(147, 112, 219, ${0.6 + attackIntensity * 0.4})`;
    ctx.shadowColor = "#9370db";
    ctx.shadowBlur = 8 * zoom;
    ctx.beginPath();
    ctx.ellipse(x - size * 0.1, headY + size * 0.01, size * 0.05, size * 0.015, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.1, headY + size * 0.01, size * 0.05, size * 0.015, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // Dramatic closed eyes (operatic expression)
    ctx.strokeStyle = "#1a0a00";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x - size * 0.1, headY + size * 0.01, size * 0.055, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + size * 0.1, headY + size * 0.01, size * 0.055, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // Eyelashes
    ctx.lineWidth = 1.5 * zoom;
    for (let lash = 0; lash < 3; lash++) {
      const lashAngle = 0.3 + lash * 0.25;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.1 + Math.cos(lashAngle) * size * 0.055, headY + size * 0.01 - Math.sin(lashAngle) * size * 0.055);
      ctx.lineTo(x - size * 0.1 + Math.cos(lashAngle) * size * 0.08, headY + size * 0.01 - Math.sin(lashAngle) * size * 0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size * 0.1 - Math.cos(lashAngle) * size * 0.055, headY + size * 0.01 - Math.sin(lashAngle) * size * 0.055);
      ctx.lineTo(x + size * 0.1 - Math.cos(lashAngle) * size * 0.08, headY + size * 0.01 - Math.sin(lashAngle) * size * 0.08);
    ctx.stroke();
    }
  }

  // Dramatic eyebrows
  ctx.strokeStyle = "#1a0a00";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, headY - size * 0.06);
  ctx.quadraticCurveTo(x - size * 0.1, headY - size * 0.1 - (isAttacking ? size * 0.02 : 0), x - size * 0.04, headY - size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, headY - size * 0.06);
  ctx.quadraticCurveTo(x + size * 0.1, headY - size * 0.1 - (isAttacking ? size * 0.02 : 0), x + size * 0.04, headY - size * 0.05);
  ctx.stroke();

  // === POWERFUL SINGING MOUTH ===
  const mouthOpen = isAttacking ? 0.16 + attackIntensity * 0.1 : 0.12;
  const mouthY = headY + size * 0.12;

  // Mouth interior (dark)
  ctx.fillStyle = "#2a0a0a";
  ctx.beginPath();
  ctx.ellipse(x, mouthY, size * 0.1, size * mouthOpen, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tongue (subtle)
  ctx.fillStyle = "#8a3030";
  ctx.beginPath();
  ctx.ellipse(x, mouthY + size * 0.03, size * 0.06, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();

  // Teeth row
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.rect(x - size * 0.07, mouthY - size * mouthOpen * 0.6, size * 0.14, size * 0.03);
  ctx.fill();
  // Individual teeth lines
  ctx.strokeStyle = "#e8e8e8";
  ctx.lineWidth = 0.5;
  for (let tooth = -2; tooth <= 2; tooth++) {
    ctx.beginPath();
    ctx.moveTo(x + tooth * size * 0.025, mouthY - size * mouthOpen * 0.6);
    ctx.lineTo(x + tooth * size * 0.025, mouthY - size * mouthOpen * 0.6 + size * 0.03);
    ctx.stroke();
  }

  // Lips
  ctx.strokeStyle = "#a06060";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, mouthY, size * 0.11, size * mouthOpen + size * 0.01, 0, 0, Math.PI * 2);
  ctx.stroke();

  // === FLOATING MUSICAL NOTES (elaborate) ===
  const noteCount = isAttacking ? 10 : 5;
  for (let i = 0; i < noteCount; i++) {
    const notePhase = (time * 2.2 + i * 0.4) % 2;
    const noteAngle = -0.6 + (i / noteCount) * 1.2;
    const noteSpiral = Math.sin(notePhase * Math.PI * 2) * size * 0.1;
    const noteX = x + size * (0.35 + notePhase * 0.6) * Math.cos(noteAngle) + noteSpiral;
    const noteY = y - size * 0.3 - notePhase * size * 0.7 + Math.sin(notePhase * Math.PI * 1.5) * size * 0.15;
    const noteAlpha = (1 - notePhase / 2) * (isAttacking ? 0.95 : 0.75);
    const noteSize = (16 + (isAttacking ? 6 : 0) - notePhase * 4) * zoom;

    // Note glow
    ctx.shadowColor = i % 2 === 0 ? "#ff6600" : "#9370db";
    ctx.shadowBlur = isAttacking ? 10 * zoom : 5 * zoom;

    ctx.fillStyle = i % 2 === 0 ? `rgba(255, 102, 0, ${noteAlpha})` : `rgba(147, 112, 219, ${noteAlpha})`;
    ctx.font = `${noteSize}px Arial`;
    ctx.textAlign = "center";
    const noteSymbol = i % 4 === 0 ? "♪" : i % 4 === 1 ? "♫" : i % 4 === 2 ? "♬" : "♩";
    ctx.fillText(noteSymbol, noteX, noteY);
  }
  ctx.shadowBlur = 0;

  // === SOUND WAVE STAFF LINES ===
  ctx.globalAlpha = isAttacking ? 0.6 : 0.3;
  ctx.strokeStyle = "#9370db";
  ctx.lineWidth = 1.5 * zoom;
  for (let staff = 0; staff < 3; staff++) {
    const staffY = y - size * 0.7 - staff * size * 0.08;
    const staffWave = Math.sin(time * 5 + staff * 0.5) * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.6, staffY + staffWave);
    for (let point = 0; point <= 20; point++) {
      const px = x - size * 0.6 + point * size * 0.06;
      const py = staffY + Math.sin(time * 6 + point * 0.3 + staff) * size * 0.02;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === ELABORATE SONIC AURA RINGS ===
  for (let i = 0; i < 4; i++) {
    const ringPhase = (time * 2.5 + i * 0.35) % 1;
    const ringRadius = size * (0.5 + ringPhase * 0.6);
    const ringAlpha = (1 - ringPhase) * (isAttacking ? 0.75 : 0.45);
    
    // Outer ring
    ctx.strokeStyle = `rgba(147, 112, 219, ${ringAlpha})`;
    ctx.lineWidth = (3 - i * 0.4) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, ringRadius, ringRadius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner golden ring
    ctx.strokeStyle = `rgba(255, 150, 50, ${ringAlpha * 0.5})`;
    ctx.lineWidth = (1.5 - i * 0.2) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, ringRadius * 0.95, ringRadius * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === SPOTLIGHT EFFECT ===
  if (isAttacking) {
    const spotGrad = ctx.createRadialGradient(x, y - size * 0.5, 0, x, y, size * 1.2);
    spotGrad.addColorStop(0, `rgba(255, 255, 200, ${attackIntensity * 0.15})`);
    spotGrad.addColorStop(0.5, `rgba(255, 220, 150, ${attackIntensity * 0.08})`);
    spotGrad.addColorStop(1, "rgba(255, 200, 100, 0)");
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, size * 1.2, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

