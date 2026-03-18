import type { WorldMapDrawContext } from "./drawContext";
import { drawTree } from "./grasslandDecorations";
import {
  drawWillowTree,
  drawSwampPool,
  drawSwampGas,
  drawFireflies,
} from "./swampDecorations";
import {
  drawPalmTree,
  drawDesertCactus,
} from "./desertDecorations";
import { drawFrostedPine } from "./winterDecorations";
import {
  drawAshTree,
  drawObsidianSpire,
  drawBurningRuins,
} from "./volcanicDecorations";
import { drawBridge, drawBoulder } from "./structureDecorations";
import { drawOrganicBlobAt } from "../../../../rendering/helpers";

export function drawDecorationGroundLayer(dc: WorldMapDrawContext): void {
  const { ctx, height, time, getY, seededRandom } = dc;

  // === GRASSLAND DETAILS ===

  // Organic meadow patches — soft ground cover blobs
  const meadowPatches: [number, number, number, number][] = [
    [60, 42, 32, 18],
    [130, 70, 28, 14],
    [200, 55, 35, 16],
    [250, 30, 24, 12],
    [310, 72, 30, 15],
    [80, 85, 26, 13],
    [160, 22, 22, 11],
    [340, 38, 28, 14],
    [100, 52, 20, 10],
    [280, 62, 25, 12],
    [370, 55, 22, 11],
    [50, 60, 18, 9],
    [220, 80, 24, 12],
    [175, 44, 30, 14],
    [300, 48, 26, 13],
  ];
  for (let i = 0; i < meadowPatches.length; i++) {
    const [mx, myPct, mrx, mry] = meadowPatches[i];
    const my = getY(myPct);
    ctx.globalAlpha = 0.12 + seededRandom(i * 31 + 200) * 0.08;
    ctx.fillStyle = seededRandom(i * 31 + 201) > 0.5 ? "#4a7a2a" : "#3a6a20";
    drawOrganicBlobAt(ctx, mx, my, mrx, mry, i * 5.7, 0.2, 18);
    ctx.fill();
  }
  // Flower clusters as smaller organic blobs
  const flowerColors = [
    "#d4a0c0",
    "#c0a0d4",
    "#d4c080",
    "#a0d4a0",
    "#d4a080",
  ];
  for (let i = 0; i < 20; i++) {
    const fx = 20 + seededRandom(i * 43 + 300) * 350;
    const fyPct = 20 + seededRandom(i * 43 + 301) * 65;
    const fy = getY(fyPct);
    const fr = 4 + seededRandom(i * 43 + 302) * 6;
    ctx.globalAlpha = 0.2 + seededRandom(i * 43 + 303) * 0.15;
    ctx.fillStyle = flowerColors[i % flowerColors.length];
    drawOrganicBlobAt(ctx, fx, fy, fr, fr * 0.6, i * 3.2, 0.3, 12);
    ctx.fill();
  }
  // Soft bush mounds
  for (let i = 0; i < 12; i++) {
    const bx = 30 + seededRandom(i * 37 + 400) * 340;
    const byPct = 22 + seededRandom(i * 37 + 401) * 60;
    const by = getY(byPct);
    const br = 8 + seededRandom(i * 37 + 402) * 10;
    ctx.globalAlpha = 0.15 + seededRandom(i * 37 + 403) * 0.1;
    const bushGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    bushGrad.addColorStop(0, "#3a6a28");
    bushGrad.addColorStop(1, "rgba(40,80,25,0)");
    ctx.fillStyle = bushGrad;
    drawOrganicBlobAt(ctx, bx, by, br, br * 0.55, i * 4.1, 0.18, 16);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Lush volumetric trees with radial gradient canopies and animated details
  [
    [50, 30],
    [80, 82],
    [150, 22],
    [170, 75],
    [140, 33],
    [238, 55],
    [270, 41],
    [270, 85],
    [320, 25],
    [350, 68],
    [45, 65],
    [130, 90],
    [190, 38],
    [280, 60],
    [360, 45],
    [65, 50],
    [110, 72],
    [165, 50],
    [215, 70],
    [255, 30],
    [305, 80],
    [345, 42],
    [90, 45],
    [175, 88],
    [230, 25],
    [310, 35],
    [370, 58],
    [60, 78],
    [125, 55],
    [295, 50],
  ].forEach(([x, yPct], i) => {
    drawTree(dc, x, yPct, 0.5 + seededRandom(i + 100) * 0.5);
  });

  // === SWAMP DETAILS ===

  // Murky bog pools — dark organic blob water patches
  const bogPools: [number, number, number, number][] = [
    [410, 65, 28, 12],
    [470, 45, 22, 10],
    [520, 75, 32, 14],
    [560, 38, 18, 8],
    [600, 68, 26, 11],
    [650, 42, 24, 10],
    [440, 28, 20, 9],
    [510, 55, 30, 13],
    [680, 62, 22, 10],
    [590, 80, 25, 11],
    [490, 35, 16, 7],
    [630, 30, 20, 9],
    [420, 80, 18, 8],
    [700, 50, 24, 11],
    [550, 50, 20, 9],
  ];
  for (let i = 0; i < bogPools.length; i++) {
    const [px, pyPct, prx, pry] = bogPools[i];
    const py = getY(pyPct);
    const poolGrad = ctx.createRadialGradient(px, py, 0, px, py, prx);
    poolGrad.addColorStop(0, "rgba(20,50,25,0.35)");
    poolGrad.addColorStop(0.6, "rgba(15,40,20,0.2)");
    poolGrad.addColorStop(1, "rgba(10,30,15,0)");
    ctx.fillStyle = poolGrad;
    drawOrganicBlobAt(ctx, px, py, prx, pry, i * 6.3, 0.22, 18);
    ctx.fill();
    // Subtle sheen on water surface
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#5a9a6a";
    drawOrganicBlobAt(
      ctx,
      px - 2,
      py - 1,
      prx * 0.5,
      pry * 0.4,
      i * 6.3 + 99,
      0.15,
      12,
    );
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Moss and algae patches
  for (let i = 0; i < 18; i++) {
    const mx = 390 + seededRandom(i * 47 + 500) * 320;
    const myPct = 22 + seededRandom(i * 47 + 501) * 60;
    const my = getY(myPct);
    const mr = 5 + seededRandom(i * 47 + 502) * 10;
    ctx.globalAlpha = 0.15 + seededRandom(i * 47 + 503) * 0.12;
    ctx.fillStyle = seededRandom(i * 47 + 504) > 0.5 ? "#2a5a2a" : "#1a4a20";
    drawOrganicBlobAt(ctx, mx, my, mr, mr * 0.5, i * 4.7, 0.28, 14);
    ctx.fill();
  }
  // Lily pad clusters
  for (let i = 0; i < 10; i++) {
    const lx = 400 + seededRandom(i * 53 + 600) * 300;
    const lyPct = 30 + seededRandom(i * 53 + 601) * 45;
    const ly = getY(lyPct);
    const lr = 3 + seededRandom(i * 53 + 602) * 4;
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#3a8a3a";
    drawOrganicBlobAt(ctx, lx, ly, lr, lr * 0.65, i * 2.9, 0.12, 10);
    ctx.fill();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#a0d0a0";
    ctx.beginPath();
    ctx.arc(lx + lr * 0.2, ly - lr * 0.1, lr * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  // Foggy mist patches
  for (let i = 0; i < 8; i++) {
    const fogX = 400 + seededRandom(i * 61 + 700) * 310;
    const fogYPct = 25 + seededRandom(i * 61 + 701) * 55;
    const fogY = getY(fogYPct);
    const fogR = 20 + seededRandom(i * 61 + 702) * 30;
    ctx.globalAlpha = 0.04 + seededRandom(i * 61 + 703) * 0.03;
    ctx.fillStyle = "#8aaa8a";
    drawOrganicBlobAt(ctx, fogX, fogY, fogR, fogR * 0.35, i * 3.1, 0.15, 20);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Dramatically enhanced swamp environment with rich atmosphere
  [
    [410, 30],
    [430, 60],
    [420, 70],
    [450, 80],
    [480, 25],
    [450, 20],
    [640, 55],
    [550, 85],
    [540, 45],
    [580, 35],
    [600, 40],
    [630, 75],
    [680, 75],
    [395, 55],
    [465, 45],
    [570, 75],
    [695, 50],
    [405, 78],
    [445, 38],
    [475, 58],
    [510, 72],
    [528, 55],
    [560, 28],
    [590, 65],
    [615, 42],
    [655, 35],
    [685, 62],
    [710, 45],
    [700, 72],
    [440, 50],
    [505, 42],
    [620, 80],
  ].forEach(([x, yPct], i) => {
    drawWillowTree(dc, x, yPct, 0.6 + seededRandom(i + 500) * 0.5);
  });

  // Swamp pools/puddles — murky water with animated ripples, lily pads, algae, reflections, fish
  drawSwampPool(dc, 425, 50, 20);
  drawSwampPool(dc, 515, 65, 25);
  drawSwampPool(dc, 605, 50, 18);
  drawSwampPool(dc, 660, 40, 22);
  drawSwampPool(dc, 480, 75, 16);
  drawSwampPool(dc, 570, 35, 14);
  drawSwampPool(dc, 700, 55, 18);

  // Swamp Gas Bubbles — multiple sizes, toxic glow, pop animation
  for (let i = 0; i < 15; i++) {
    drawSwampGas(dc, 
      400 + seededRandom(i * 55) * 300,
      30 + seededRandom(i * 22) * 60,
    );
  }

  // Fireflies — figure-8 flight, trailing light, warm glow halos
  for (let i = 0; i < 10; i++) {
    drawFireflies(dc, 
      400 + seededRandom(i * 99) * 320,
      20 + seededRandom(i * 88) * 70,
    );
  }

  // Low Mist — subtle wisps hugging the ground
  for (let layer = 0; layer < 3; layer++) {
    const layerSpeed = 0.08 + layer * 0.03;
    const layerDrift = layer % 2 === 0 ? 1 : -1;
    const mistAlpha = 0.012 + layer * 0.006;

    for (let i = 0; i < 5; i++) {
      const drift =
        Math.sin(time * layerSpeed * layerDrift + i * 1.3 + layer * 0.9) *
        (20 + layer * 8);
      const mx = 380 + drift + i * 55;
      const yOffset =
        Math.cos(time * (layerSpeed * 1.4) + i * 0.7 + layer * 0.5) * 4;
      const my = getY(55 + layer * 10 + yOffset);
      const mw = 30 + layer * 10 + seededRandom(i + layer * 20) * 20;
      const mh = 6 + layer * 2 + seededRandom(i + layer * 20 + 1) * 4;

      ctx.fillStyle = `rgba(130, 170, 140, ${mistAlpha})`;
      ctx.beginPath();
      ctx.ellipse(mx, my, mw, mh, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === SAHARA SANDS DETAILS === (Enhanced Desert Environment)

  // Sand drift patches — layered organic blob dune formations
  const driftPatches: [number, number, number, number][] = [
    [750, 50, 40, 16],
    [810, 72, 34, 13],
    [870, 32, 30, 12],
    [930, 60, 38, 15],
    [990, 45, 32, 13],
    [760, 80, 26, 10],
    [840, 25, 28, 11],
    [900, 70, 36, 14],
    [960, 35, 24, 10],
    [1020, 58, 30, 12],
    [1050, 75, 22, 9],
    [780, 40, 20, 8],
    [850, 55, 34, 14],
    [1060, 30, 26, 10],
    [730, 65, 24, 10],
  ];
  for (let i = 0; i < driftPatches.length; i++) {
    const [dx, dyPct, drx, dry] = driftPatches[i];
    const ddy = getY(dyPct);
    const driftGrad = ctx.createRadialGradient(dx, ddy, 0, dx, ddy, drx);
    driftGrad.addColorStop(0, "rgba(200,170,110,0.18)");
    driftGrad.addColorStop(0.7, "rgba(180,150,90,0.08)");
    driftGrad.addColorStop(1, "rgba(160,130,70,0)");
    ctx.fillStyle = driftGrad;
    drawOrganicBlobAt(ctx, dx, ddy, drx, dry, i * 7.1, 0.18, 20);
    ctx.fill();
  }
  // Rocky outcrops
  for (let i = 0; i < 10; i++) {
    const rx = 730 + seededRandom(i * 59 + 800) * 340;
    const ryPct = 25 + seededRandom(i * 59 + 801) * 55;
    const ry = getY(ryPct);
    const rr = 6 + seededRandom(i * 59 + 802) * 8;
    ctx.globalAlpha = 0.18 + seededRandom(i * 59 + 803) * 0.1;
    ctx.fillStyle = seededRandom(i * 59 + 804) > 0.5 ? "#8a7050" : "#7a6040";
    drawOrganicBlobAt(ctx, rx, ry, rr, rr * 0.55, i * 5.3, 0.25, 14);
    ctx.fill();
  }
  // Oasis-like vegetation spots
  for (let i = 0; i < 8; i++) {
    const ox = 740 + seededRandom(i * 67 + 900) * 320;
    const oyPct = 30 + seededRandom(i * 67 + 901) * 45;
    const oy = getY(oyPct);
    const or = 4 + seededRandom(i * 67 + 902) * 5;
    ctx.globalAlpha = 0.12 + seededRandom(i * 67 + 903) * 0.08;
    ctx.fillStyle = "#5a8a3a";
    drawOrganicBlobAt(ctx, ox, oy, or, or * 0.6, i * 3.7, 0.2, 12);
    ctx.fill();
  }
  // Heat shimmer patches (very subtle warm blobs)
  for (let i = 0; i < 6; i++) {
    const hx = 750 + seededRandom(i * 71 + 950) * 300;
    const hyPct = 20 + seededRandom(i * 71 + 951) * 30;
    const hy = getY(hyPct);
    const hr = 25 + seededRandom(i * 71 + 952) * 35;
    ctx.globalAlpha = 0.03 + Math.sin(time * 1.5 + i * 2) * 0.015;
    ctx.fillStyle = "#e0c080";
    drawOrganicBlobAt(ctx, hx, hy, hr, hr * 0.3, i * 4.3, 0.12, 18);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Palm trees near oasis area
  drawPalmTree(dc, 765, 40, 0.7);
  drawPalmTree(dc, 795, 44, 0.6);
  drawPalmTree(dc, 778, 38, 0.8);

  // Saguaro cactus
  [
    [840, 60],
    [890, 25],
    [950, 75],
    [1000, 40],
    [1040, 65],
    [1060, 30],
    [760, 45],
    [780, 72],
    [820, 30],
    [870, 55],
    [915, 80],
    [970, 32],
    [1020, 58],
    [1055, 82],
  ].forEach(([x, yPct], i) => {
    drawDesertCactus(dc, x, yPct, 0.5 + seededRandom(i + 200) * 0.35);
  });

  // More palm trees near oasis area
  drawPalmTree(dc, 740, 48, 0.55);
  drawPalmTree(dc, 810, 38, 0.5);
  drawPalmTree(dc, 830, 70, 0.6);

  // Dramatic swirling sand/dust particles — varied sizes, some streaking
  for (let p = 0; p < 40; p++) {
    const px = 720 + seededRandom(p * 23) * 360;
    const py = height * 0.25 + seededRandom(p * 31) * height * 0.55;
    const drift =
      Math.sin(time * 2.5 + p * 0.5) * 18 +
      Math.cos(time * 1.2 + p * 0.3) * 6;
    const pSize = 0.8 + seededRandom(p) * 2.5;
    const pAlpha = 0.15 + seededRandom(p * 3) * 0.25;
    ctx.fillStyle = `rgba(210, 180, 140, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px + drift, py, pSize, 0, Math.PI * 2);
    ctx.fill();
    // Sand streak trail for some particles
    if (p % 3 === 0) {
      ctx.strokeStyle = `rgba(210, 180, 140, ${pAlpha * 0.4})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(px + drift, py);
      ctx.lineTo(px + drift - 8, py + 1);
      ctx.stroke();
    }
  }

  // Dramatic heat shimmer effect — multiple layered bands with stronger distortion
  ctx.save();
  for (let h = 0; h < 7; h++) {
    const shimmerY = getY(12 + h * 4);
    const shimmerAlpha = 0.04 + Math.sin(time * 3 + h * 0.7) * 0.025;
    ctx.globalAlpha = shimmerAlpha;
    ctx.fillStyle = h % 2 === 0 ? "#fff8dc" : "#ffe8b0";
    ctx.beginPath();
    for (let sx = 720; sx < 1080; sx += 5) {
      const shimmerOffset =
        Math.sin(time * 5 + sx * 0.06 + h * 1.2) * 4 +
        Math.cos(time * 3 + sx * 0.03) * 2;
      if (sx === 720) ctx.moveTo(sx, shimmerY + shimmerOffset);
      else ctx.lineTo(sx, shimmerY + shimmerOffset);
    }
    ctx.lineTo(1080, shimmerY + 10);
    ctx.lineTo(720, shimmerY + 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === FROZEN FRONTIER DETAILS === (Enhanced Winter Environment)

  // Snow drift mounds — soft white organic blobs
  const snowDrifts: [number, number, number, number][] = [
    [1110, 55, 30, 12],
    [1170, 38, 26, 10],
    [1230, 70, 34, 14],
    [1290, 42, 28, 11],
    [1340, 65, 32, 13],
    [1400, 35, 24, 10],
    [1130, 80, 22, 9],
    [1200, 28, 20, 8],
    [1260, 55, 26, 10],
    [1320, 78, 30, 12],
    [1380, 48, 22, 9],
    [1420, 60, 18, 7],
    [1150, 45, 28, 11],
    [1350, 30, 24, 10],
    [1100, 70, 20, 8],
  ];
  for (let i = 0; i < snowDrifts.length; i++) {
    const [sx, syPct, srx, sry] = snowDrifts[i];
    const sy = getY(syPct);
    const snowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, srx);
    snowGrad.addColorStop(0, "rgba(220,230,240,0.2)");
    snowGrad.addColorStop(0.6, "rgba(200,210,230,0.1)");
    snowGrad.addColorStop(1, "rgba(180,190,210,0)");
    ctx.fillStyle = snowGrad;
    drawOrganicBlobAt(ctx, sx, sy, srx, sry, i * 5.9, 0.16, 18);
    ctx.fill();
  }
  // Frozen pond patches
  for (let i = 0; i < 8; i++) {
    const fx = 1090 + seededRandom(i * 73 + 1000) * 340;
    const fyPct = 30 + seededRandom(i * 73 + 1001) * 45;
    const fy = getY(fyPct);
    const fr = 10 + seededRandom(i * 73 + 1002) * 14;
    ctx.globalAlpha = 0.1 + seededRandom(i * 73 + 1003) * 0.06;
    const iceGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
    iceGrad.addColorStop(0, "#a0c8e0");
    iceGrad.addColorStop(1, "rgba(140,180,210,0)");
    ctx.fillStyle = iceGrad;
    drawOrganicBlobAt(ctx, fx, fy, fr, fr * 0.55, i * 4.9, 0.15, 16);
    ctx.fill();
    // Ice sheen
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#e0f0ff";
    drawOrganicBlobAt(
      ctx,
      fx + 2,
      fy - 1,
      fr * 0.35,
      fr * 0.2,
      i * 4.9 + 77,
      0.1,
      10,
    );
    ctx.fill();
  }
  // Evergreen shrub patches
  for (let i = 0; i < 12; i++) {
    const ex = 1095 + seededRandom(i * 79 + 1100) * 340;
    const eyPct = 22 + seededRandom(i * 79 + 1101) * 60;
    const ey = getY(eyPct);
    const er = 5 + seededRandom(i * 79 + 1102) * 7;
    ctx.globalAlpha = 0.14 + seededRandom(i * 79 + 1103) * 0.08;
    ctx.fillStyle = seededRandom(i * 79 + 1104) > 0.5 ? "#2a4a3a" : "#1a3a2a";
    drawOrganicBlobAt(ctx, ex, ey, er, er * 0.6, i * 3.3, 0.22, 14);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Aurora Borealis - vivid curtain-like ribbons with full spectrum color shifting
  ctx.save();
  for (let a = 0; a < 6; a++) {
    const auroraY = 8 + a * 10;
    const hueShift = (time * 25 + a * 45) % 360;
    const auroraGrad = ctx.createLinearGradient(1080, 0, 1440, 0);
    auroraGrad.addColorStop(0, `hsla(${120 + hueShift * 0.3}, 90%, 65%, 0)`);
    auroraGrad.addColorStop(
      0.12,
      `hsla(${140 + hueShift * 0.4}, 85%, 60%, ${0.06 + Math.sin(time * 0.6 + a * 0.8) * 0.03})`,
    );
    auroraGrad.addColorStop(
      0.3,
      `hsla(${170 + hueShift * 0.35}, 90%, 58%, ${0.16 + Math.sin(time * 1.1 + a * 0.5) * 0.08})`,
    );
    auroraGrad.addColorStop(
      0.5,
      `hsla(${210 + hueShift * 0.25}, 92%, 62%, ${0.22 + Math.sin(time * 1.4 + a * 0.3) * 0.1})`,
    );
    auroraGrad.addColorStop(
      0.7,
      `hsla(${250 + hueShift * 0.35}, 85%, 58%, ${0.14 + Math.sin(time * 0.9 + a * 0.6) * 0.06})`,
    );
    auroraGrad.addColorStop(
      0.88,
      `hsla(${290 + hueShift * 0.3}, 80%, 60%, ${0.08 + Math.sin(time * 1.2 + a * 0.4) * 0.04})`,
    );
    auroraGrad.addColorStop(1, `hsla(${310 + hueShift * 0.2}, 90%, 65%, 0)`);
    ctx.fillStyle = auroraGrad;
    ctx.beginPath();
    ctx.moveTo(1080, auroraY);
    for (let ax = 1080; ax <= 1440; ax += 6) {
      const wave1 = Math.sin(time * 0.4 + ax * 0.015 + a * 0.7) * 10;
      const wave2 = Math.sin(time * 0.7 + ax * 0.025 + a * 1.2) * 5;
      const wave3 = Math.sin(time * 1.1 + ax * 0.04 + a * 0.3) * 3;
      const curtainDroop = Math.sin(ax * 0.01 + a * 0.5) * 4;
      ctx.lineTo(ax, auroraY + wave1 + wave2 + wave3 + curtainDroop);
    }
    const bottomBand = 22 + Math.sin(time * 0.3 + a * 0.8) * 5;
    ctx.lineTo(1440, auroraY + bottomBand);
    for (let ax = 1440; ax >= 1080; ax -= 10) {
      const bwave = Math.sin(time * 0.5 + ax * 0.018 + a * 0.9) * 6;
      ctx.lineTo(ax, auroraY + bottomBand + bwave);
    }
    ctx.closePath();
    ctx.fill();
  }
  // Aurora shimmer star highlights
  for (let s = 0; s < 18; s++) {
    const sx = 1095 + seededRandom(s * 31) * 330;
    const sy = 12 + seededRandom(s * 37) * 55;
    const shimmerAlpha = 0.12 + Math.sin(time * 3.5 + s * 1.7) * 0.1;
    if (shimmerAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${shimmerAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5 + Math.sin(time * 2.5 + s) * 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Detailed frosted pine trees with individual branch layers
  [
    [1095, 72],
    [1115, 55],
    [1140, 78],
    [1165, 42],
    [1185, 68],
    [1220, 75],
    [1255, 38],
    [1280, 62],
    [1305, 48],
    [1325, 72],
    [1355, 35],
    [1375, 58],
    [1400, 45],
    [1420, 68],
  ].forEach(([x, yPct], i) => {
    drawFrostedPine(dc, x, yPct, 0.6 + seededRandom(i + 300) * 0.25);
  });

  // More frosted pines for density
  [
    [1102, 62],
    [1130, 42],
    [1155, 82],
    [1195, 55],
    [1250, 45],
    [1270, 78],
    [1310, 32],
    [1350, 62],
    [1380, 42],
    [1410, 55],
    [1435, 72],
  ].forEach(([x, yPct], i) => {
    drawFrostedPine(dc, x, yPct, 0.5 + seededRandom(i + 400) * 0.2);
  });

  // Enhanced snowfall with different flake sizes, tumbling rotation, wind gusts
  for (let layer = 0; layer < 3; layer++) {
    const speed = 18 + layer * 18;
    const baseSize = 1 + layer * 1;
    const opacity = 0.25 + layer * 0.2;
    for (let i = 0; i < 25; i++) {
      const sx = 1080 + seededRandom(i * 7 + layer * 100) * 360;
      const baseY = seededRandom(i * 11 + layer * 50) * height;
      const sy = (time * speed + baseY) % height;
      const windGust = Math.sin(time * 0.8 + i * 0.2) * (5 + layer * 3);
      const drift =
        Math.sin(time * 2 + i * 0.3 + layer) * (3 + layer * 2) + windGust;
      const flakeSize =
        baseSize * (0.6 + seededRandom(i * 3 + layer * 70) * 0.8);
      const tumble = time * 3 + i * 1.7 + layer * 0.5;
      ctx.save();
      ctx.translate(sx + drift, sy);
      ctx.rotate(tumble);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      if (layer === 2 && seededRandom(i * 9 + layer) > 0.5) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 0.5;
        for (let p = 0; p < 6; p++) {
          const angle = (p / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(
            Math.cos(angle) * flakeSize * 1.5,
            Math.sin(angle) * flakeSize * 1.5,
          );
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, flakeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, flakeSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Frost overlay at edges
  ctx.save();
  const frostGrad = ctx.createLinearGradient(1080, 0, 1100, 0);
  frostGrad.addColorStop(0, "rgba(200, 230, 255, 0.15)");
  frostGrad.addColorStop(1, "rgba(200, 230, 255, 0)");
  ctx.fillStyle = frostGrad;
  ctx.fillRect(1080, 0, 40, height);
  const frostGrad2 = ctx.createLinearGradient(1420, 0, 1440, 0);
  frostGrad2.addColorStop(0, "rgba(200, 230, 255, 0)");
  frostGrad2.addColorStop(1, "rgba(200, 230, 255, 0.15)");
  ctx.fillStyle = frostGrad2;
  ctx.fillRect(1400, 0, 40, height);
  ctx.restore();

  // === INFERNO DEPTHS DETAILS === (Enhanced Volcanic Environment)

  // Lava pool patches — glowing organic blobs
  const lavaPools: [number, number, number, number][] = [
    [1480, 60, 20, 9],
    [1540, 45, 16, 7],
    [1600, 70, 22, 10],
    [1660, 35, 18, 8],
    [1720, 55, 24, 10],
    [1500, 80, 14, 6],
    [1560, 28, 18, 8],
    [1640, 65, 20, 9],
    [1700, 42, 16, 7],
    [1760, 72, 22, 10],
    [1470, 48, 12, 5],
    [1620, 82, 16, 7],
  ];
  for (let i = 0; i < lavaPools.length; i++) {
    const [lx, lyPct, lrx, lry] = lavaPools[i];
    const ly = getY(lyPct);
    const pulse = 0.12 + Math.sin(time * 2 + i * 1.7) * 0.04;
    const lavaGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lrx);
    lavaGrad.addColorStop(0, `rgba(255,80,20,${pulse + 0.08})`);
    lavaGrad.addColorStop(0.5, `rgba(200,40,10,${pulse})`);
    lavaGrad.addColorStop(1, "rgba(100,20,5,0)");
    ctx.fillStyle = lavaGrad;
    drawOrganicBlobAt(ctx, lx, ly, lrx, lry, i * 6.7, 0.2, 16);
    ctx.fill();
  }
  // Ash mounds
  for (let i = 0; i < 14; i++) {
    const ax = 1450 + seededRandom(i * 83 + 1200) * 340;
    const ayPct = 22 + seededRandom(i * 83 + 1201) * 60;
    const ay = getY(ayPct);
    const ar = 8 + seededRandom(i * 83 + 1202) * 12;
    ctx.globalAlpha = 0.12 + seededRandom(i * 83 + 1203) * 0.08;
    ctx.fillStyle = seededRandom(i * 83 + 1204) > 0.5 ? "#3a2a1a" : "#2a1a0a";
    drawOrganicBlobAt(ctx, ax, ay, ar, ar * 0.45, i * 4.9, 0.22, 16);
    ctx.fill();
  }
  // Obsidian shard formations (angular-ish blobs with high bumpiness)
  for (let i = 0; i < 8; i++) {
    const ox = 1460 + seededRandom(i * 89 + 1300) * 330;
    const oyPct = 28 + seededRandom(i * 89 + 1301) * 50;
    const oy = getY(oyPct);
    const or = 4 + seededRandom(i * 89 + 1302) * 6;
    ctx.globalAlpha = 0.2 + seededRandom(i * 89 + 1303) * 0.1;
    ctx.fillStyle = "#1a1018";
    drawOrganicBlobAt(ctx, ox, oy, or, or * 0.7, i * 5.1, 0.4, 10);
    ctx.fill();
    // Obsidian sheen
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#6a5a7a";
    drawOrganicBlobAt(
      ctx,
      ox + 1,
      oy - 1,
      or * 0.3,
      or * 0.2,
      i * 5.1 + 55,
      0.15,
      8,
    );
    ctx.fill();
  }
  // Ember scatter — tiny glowing organic spots
  for (let i = 0; i < 16; i++) {
    const ex = 1455 + seededRandom(i * 97 + 1400) * 335;
    const eyPct = 20 + seededRandom(i * 97 + 1401) * 65;
    const ey = getY(eyPct);
    const er = 2 + seededRandom(i * 97 + 1402) * 3;
    const glow = 0.15 + Math.sin(time * 3.5 + i * 2.3) * 0.08;
    ctx.globalAlpha = glow;
    ctx.fillStyle = seededRandom(i * 97 + 1403) > 0.5 ? "#ff6020" : "#ff9040";
    drawOrganicBlobAt(ctx, ex, ey, er, er * 0.6, i * 2.7, 0.3, 8);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Charred ash trees
  const ashTreePositions: [number, number, number][] = [
    [1465, 42, 0.7],
    [1490, 70, 0.85],
    [1515, 35, 0.65],
    [1540, 58, 0.9],
    [1570, 25, 0.6],
    [1595, 75, 0.75],
    [1620, 40, 0.8],
    [1650, 55, 0.7],
    [1680, 30, 0.85],
    [1710, 68, 0.65],
    [1735, 45, 0.9],
    [1760, 60, 0.7],
    [1475, 55, 0.6],
    [1555, 80, 0.75],
    [1640, 22, 0.65],
    [1700, 78, 0.8],
    [1750, 35, 0.7],
    [1780, 50, 0.6],
    [1450, 62, 0.55],
    [1500, 45, 0.7],
    [1530, 82, 0.6],
    [1575, 48, 0.75],
    [1610, 72, 0.65],
    [1660, 38, 0.8],
    [1695, 55, 0.7],
    [1740, 72, 0.6],
    [1770, 28, 0.65],
  ];
  ashTreePositions.forEach(([atx, aty, ats]) => drawAshTree(dc, atx, aty, ats));

  // Hellish sky gradient overlay with pulsing intensity
  ctx.save();
  const skyGrad = ctx.createLinearGradient(1440, 0, 1440, height * 0.5);
  skyGrad.addColorStop(
    0,
    `rgba(80, 20, 10, ${0.35 + Math.sin(time * 0.5) * 0.08})`,
  );
  skyGrad.addColorStop(
    0.3,
    `rgba(120, 40, 20, ${0.25 + Math.sin(time * 0.7) * 0.06})`,
  );
  skyGrad.addColorStop(
    0.6,
    `rgba(90, 25, 12, ${0.15 + Math.sin(time * 0.9) * 0.04})`,
  );
  skyGrad.addColorStop(1, "rgba(60, 15, 8, 0)");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(1440, 0, 380, height * 0.5);
  ctx.restore();

  // Obsidian spires with reflective glass surface, geometric fractures, magical glow
  [
    [1475, 48],
    [1530, 72],
    [1580, 35],
    [1640, 62],
    [1690, 42],
    [1740, 68],
    [1780, 38],
    [1460, 30],
    [1505, 58],
    [1555, 45],
    [1610, 80],
    [1665, 28],
    [1720, 52],
    [1770, 75],
  ].forEach(([x, yPct], i) => {
    drawObsidianSpire(dc, x, yPct, 0.6 + seededRandom(i + 400) * 0.45);
  });

  // Burning ruins with collapsed arches, standing columns, scattered debris
  drawBurningRuins(dc, 1600, 68, 0.8);
  drawBurningRuins(dc, 1490, 45, 0.6);
  drawBurningRuins(dc, 1730, 40, 0.7);

  // Ember particles with spiral rising patterns, varying brightness, spark trails
  for (let i = 0; i < 45; i++) {
    const ex = 1440 + seededRandom(i * 13) * 380;
    const baseY = height * 0.9 - seededRandom(i * 17) * height * 0.3;
    const riseSpeed = 28 + seededRandom(i * 23) * 25;
    const ey = baseY - ((time * riseSpeed) % (height * 0.85));
    if (ey > 8 && ey < height - 8) {
      const spiralAngle = time * 2 + i * 0.7;
      const spiralRadius = 6 + seededRandom(i * 3) * 8;
      const drift = Math.sin(spiralAngle) * spiralRadius;
      const size = 1.5 + seededRandom(i * 7) * 2;
      const brightness = 120 + seededRandom(i * 11) * 135;
      const flicker = 0.4 + Math.sin(time * 6 + i * 2.3) * 0.35;

      const trailLen = 3 + size;
      ctx.strokeStyle = `rgba(255, ${brightness}, 50, ${flicker * 0.3})`;
      ctx.lineWidth = size * 0.5;
      ctx.beginPath();
      ctx.moveTo(ex + drift, ey);
      ctx.lineTo(ex + drift - Math.sin(spiralAngle - 0.3) * 2, ey + trailLen);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, ${brightness}, 50, ${flicker})`;
      ctx.beginPath();
      ctx.arc(ex + drift, ey, size, 0, Math.PI * 2);
      ctx.fill();

      if (size > 2.5) {
        ctx.fillStyle = `rgba(255, 255, 180, ${flicker * 0.5})`;
        ctx.beginPath();
        ctx.arc(ex + drift, ey, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Heat distortion effect overlay
  ctx.save();
  ctx.globalAlpha = 0.03 + Math.sin(time * 2) * 0.01;
  for (let h = 0; h < 10; h++) {
    const heatY = height * 0.2 + h * 12;
    ctx.fillStyle = "#ff4400";
    ctx.beginPath();
    for (let hx = 1440; hx < 1820; hx += 8) {
      const distort = Math.sin(time * 5 + hx * 0.03 + h * 0.5) * 2.5;
      const distort2 = Math.sin(time * 3 + hx * 0.05 + h * 0.3) * 1.5;
      if (hx === 1440) ctx.moveTo(hx, heatY + distort + distort2);
      else ctx.lineTo(hx, heatY + distort + distort2);
    }
    ctx.lineTo(1820, heatY + 10);
    ctx.lineTo(1440, heatY + 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Hellfire border glow at edges
  const fireGlowLeft = ctx.createLinearGradient(1440, 0, 1470, 0);
  fireGlowLeft.addColorStop(
    0,
    `rgba(255, 60, 20, ${0.15 + Math.sin(time * 2) * 0.05})`,
  );
  fireGlowLeft.addColorStop(1, "rgba(255, 60, 20, 0)");
  ctx.fillStyle = fireGlowLeft;
  ctx.fillRect(1440, 0, 50, height);

  const fireGlowRight = ctx.createLinearGradient(1790, 0, 1820, 0);
  fireGlowRight.addColorStop(0, "rgba(255, 60, 20, 0)");
  fireGlowRight.addColorStop(
    1,
    `rgba(255, 60, 20, ${0.2 + Math.sin(time * 2.5) * 0.05})`,
  );
  ctx.fillStyle = fireGlowRight;
  ctx.fillRect(1770, 0, 50, height);

  // === ENVIRONMENTAL DETAILS - ROADS, BRIDGES, DEBRIS ===

  // Isometric wooden bridges between regions
  drawBridge(dc, 375, 58, 50, -0.1);
  drawBridge(dc, 715, 48, 45, 0.05);
  drawBridge(dc, 1075, 55, 50, 0.08);
  drawBridge(dc, 1445, 52, 48, -0.05);

  // Scattered rocks and boulders
  [
    [60, 85, 8],
    [130, 18, 6],
    [210, 72, 7],
    [280, 28, 5],
    [400, 85, 6],
    [470, 18, 8],
    [590, 82, 5],
    [660, 22, 7],
    [740, 80, 6],
    [820, 25, 5],
    [910, 78, 7],
    [1030, 22, 6],
    [1100, 82, 5],
    [1180, 80, 7],
    [1250, 28, 6],
    [1380, 75, 5],
    [1460, 22, 8],
    [1550, 85, 6],
    [1640, 25, 7],
    [1710, 80, 5],
    [95, 42, 5],
    [175, 58, 6],
    [245, 82, 4],
    [340, 35, 5],
    [415, 42, 6],
    [525, 55, 5],
    [620, 38, 4],
    [700, 65, 5],
    [780, 48, 6],
    [875, 35, 4],
    [950, 55, 5],
    [1050, 72, 6],
    [1140, 35, 5],
    [1225, 55, 4],
    [1310, 82, 5],
    [1420, 38, 6],
    [1500, 62, 5],
    [1580, 42, 4],
    [1670, 58, 5],
    [1750, 35, 6],
  ].forEach(([x, y, size]) => {
    drawBoulder(dc, x, y, size);
  });
}
