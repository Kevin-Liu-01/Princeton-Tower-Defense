import { drawOrganicBlobAt } from "../../../../rendering/helpers";
import { seededRandom } from "../worldMapUtils";
import {
  drawGrassTuft,
  drawRuggedBorder,
  generateOrganicBorderPoints,
} from "./backgroundHelpers";

interface TerrainBackdropParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  isMobile: boolean;
  time: number;
}

export function drawTerrainBackdrop({
  ctx,
  width,
  height,
  isMobile,
  time,
}: TerrainBackdropParams) {
  const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
  bgGrad.addColorStop(0, "#2d3a1f");
  bgGrad.addColorStop(0.21, "#1f2a18");
  bgGrad.addColorStop(0.22, "#1a2a1a");
  bgGrad.addColorStop(0.39, "#2a2818");
  bgGrad.addColorStop(0.41, "#4a3a22");
  bgGrad.addColorStop(0.56, "#3a3020");
  bgGrad.addColorStop(0.6, "#332c28");
  bgGrad.addColorStop(0.64, "#2a3040");
  bgGrad.addColorStop(0.76, "#1a2838");
  bgGrad.addColorStop(0.79, "#2a1a20");
  bgGrad.addColorStop(0.83, "#3a1a1a");
  bgGrad.addColorStop(1, "#2a0a0a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const verticalGradient = ctx.createLinearGradient(0, 0, 0, height);
  verticalGradient.addColorStop(0, "rgba(0,0,0,0.35)");
  verticalGradient.addColorStop(0.3, "rgba(0,0,0,0.05)");
  verticalGradient.addColorStop(0.5, "rgba(0,0,0,0)");
  verticalGradient.addColorStop(0.7, "rgba(0,0,0,0.05)");
  verticalGradient.addColorStop(1.0, "rgba(0,0,0,0.35)");
  ctx.fillStyle = verticalGradient;
  ctx.fillRect(0, 0, width, height);

  const vignetteGradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.3,
    width / 2,
    height / 2,
    width,
  );
  vignetteGradient.addColorStop(0, "rgba(60,40,20,0)");
  vignetteGradient.addColorStop(0.7, "rgba(20,10,5,0.15)");
  vignetteGradient.addColorStop(1, "rgba(10,5,2,0.45)");
  ctx.fillStyle = vignetteGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.15;
  for (let i = 0; i < (isMobile ? 40 : 100); i++) {
    const px = seededRandom(i * 7) * width;
    const py = seededRandom(i * 7 + 1) * height;
    const psize = 30 + seededRandom(i * 7 + 2) * 70;

    let hue1 = "#5a4a3a";
    let hue2 = "#3a2a1a";
    if (px > 1440) {
      hue1 = "#4a2020";
      hue2 = "#2a0a0a";
    } else if (px > 1080) {
      hue1 = "#5a6a7a";
      hue2 = "#3a4a5a";
    } else if (px > 720) {
      hue1 = "#8a7a5a";
      hue2 = "#6a5a3a";
    } else if (px > 380) {
      hue1 = "#2a4a2a";
      hue2 = "#1a3a1a";
    } else {
      hue1 = "#3a5a2a";
      hue2 = "#2a4a1a";
    }

    ctx.fillStyle = seededRandom(i * 7 + 3) > 0.5 ? hue1 : hue2;
    drawOrganicBlobAt(
      ctx,
      px,
      py,
      psize * 0.45,
      psize * 0.22,
      i * 7.3,
      0.25,
      20,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.1;
  for (let i = 0; i < (isMobile ? 200 : 600); i++) {
    const dx = seededRandom(i * 11) * width;
    const dy = seededRandom(i * 11 + 1) * height;
    const dw = 3 + seededRandom(i * 11 + 2) * 12;
    const dh = dw * 0.4;

    let soilLight = "#6a5a4a";
    let soilDark = "#2a1a0a";
    if (dx > 1440) {
      soilLight = "#5a2a1a";
      soilDark = "#1a0505";
    } else if (dx > 1080) {
      soilLight = "#8a9aaa";
      soilDark = "#4a5a6a";
    } else if (dx > 720) {
      soilLight = "#b8a080";
      soilDark = "#6a5a40";
    } else if (dx > 380) {
      soilLight = "#3a5a3a";
      soilDark = "#1a2a1a";
    } else {
      soilLight = "#5a6a3a";
      soilDark = "#2a3a1a";
    }

    ctx.fillStyle = seededRandom(i * 11 + 3) > 0.6 ? soilLight : soilDark;
    ctx.beginPath();
    ctx.ellipse(dx, dy, dw, dh, seededRandom(i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < (isMobile ? 150 : 500); i++) {
    const sx = seededRandom(i * 13) * width;
    const sy = seededRandom(i * 13 + 1) * height;
    const ss = 1.2 + seededRandom(i * 13 + 2) * 3.0;
    const sh = ss * (0.3 + seededRandom(i * 13 + 4) * 0.25);
    const rot = seededRandom(i * 13 + 5) * Math.PI;

    let pebbleBody: string[];
    let pebbleHighlight: string;
    let pebbleShadow: string;
    if (sx > 1440) {
      pebbleBody = ["#4a2020", "#3a1010", "#5a2a1a", "#2a0a0a"];
      pebbleHighlight = "#7a4040";
      pebbleShadow = "#1a0000";
    } else if (sx > 1080) {
      pebbleBody = ["#8a9aa8", "#b0c0d0", "#6a7a88", "#a0b0c0"];
      pebbleHighlight = "#d0e0f0";
      pebbleShadow = "#4a5a68";
    } else if (sx > 720) {
      pebbleBody = ["#a0905a", "#c0b080", "#8a7a4a", "#b0a070"];
      pebbleHighlight = "#e0d0a0";
      pebbleShadow = "#605030";
    } else if (sx > 380) {
      pebbleBody = ["#2a4a2a", "#3a5a3a", "#1a3a1a", "#2a5a2a"];
      pebbleHighlight = "#5a8a5a";
      pebbleShadow = "#0a2a0a";
    } else {
      pebbleBody = ["#4a5a2a", "#5a6a3a", "#3a4a1a", "#4a5a2a"];
      pebbleHighlight = "#7a8a5a";
      pebbleShadow = "#1a2a00";
    }

    const colorIndex = Math.floor(seededRandom(i * 13 + 3) * pebbleBody.length);

    ctx.globalAlpha = 0.12;
    ctx.fillStyle = pebbleShadow;
    ctx.beginPath();
    ctx.ellipse(sx + 0.4, sy + 0.5, ss * 1.1, sh * 1.15, rot, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.22;
    ctx.fillStyle = pebbleBody[colorIndex];
    ctx.beginPath();
    ctx.ellipse(sx, sy, ss, sh, rot, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.08;
    ctx.fillStyle = pebbleHighlight;
    ctx.beginPath();
    ctx.ellipse(sx - 0.3, sy - 0.3, ss * 0.5, sh * 0.4, rot, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.4;
  for (let i = 0; i < (isMobile ? 80 : 300); i++) {
    const gx = seededRandom(i * 17) * width;
    const gy = seededRandom(i * 17 + 1) * height;
    let grassColor = "#3a5a2a";
    if (gx > 1440) grassColor = "#3a2020";
    else if (gx > 1080) grassColor = "#4a5a5a";
    else if (gx > 720) grassColor = "#6a5a3a";
    else if (gx > 380) grassColor = "#2a4a2a";

    drawGrassTuft(
      ctx,
      gx,
      gy,
      0.5 + seededRandom(i * 17 + 2) * 0.5,
      grassColor,
      time,
    );
  }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.08;
  ctx.lineWidth = 1;
  for (let i = 0; i < (isMobile ? 40 : 120); i++) {
    const cx = seededRandom(i * 19) * width;
    const cy = seededRandom(i * 19 + 1) * height;
    const crackLength = 15 + seededRandom(i * 19 + 2) * 50;

    if (cx > 1440) ctx.strokeStyle = "#2a0500";
    else if (cx > 1080) ctx.strokeStyle = "#2a3a4a";
    else if (cx > 720) ctx.strokeStyle = "#3a2a10";
    else if (cx > 380) ctx.strokeStyle = "#0a1a0a";
    else ctx.strokeStyle = "#1a2a00";

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    let px = cx;
    let py = cy;
    for (let j = 0; j < 5; j++) {
      const nx = px + (seededRandom(i * 19 + j * 3) - 0.5) * crackLength * 0.5;
      const ny = py + seededRandom(i * 19 + j * 3 + 1) * crackLength * 0.3;
      ctx.lineTo(nx, ny);
      px = nx;
      py = ny;
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.05;
  for (let i = 0; i < (isMobile ? 150 : 500); i++) {
    const px = seededRandom(i * 3) * width;
    const py = seededRandom(i * 3 + 1) * height;
    const size = 2 + seededRandom(i * 3 + 2) * 12;

    let c1 = "#6a5a4a";
    let c2 = "#2a1a0a";
    if (px > 1440) {
      c1 = "#5a2020";
      c2 = "#1a0505";
    } else if (px > 1080) {
      c1 = "#8a9ab0";
      c2 = "#4a5a70";
    } else if (px > 720) {
      c1 = "#a09060";
      c2 = "#5a4a30";
    } else if (px > 380) {
      c1 = "#3a5a3a";
      c2 = "#1a3a1a";
    } else {
      c1 = "#5a6a3a";
      c2 = "#2a3a1a";
    }

    ctx.fillStyle = seededRandom(i) > 0.5 ? c1 : c2;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const regions = [
    {
      name: "PRINCETON GROUNDS",
      x: 0,
      w: 380,
      colors: ["#3d5a2f", "#2d4a1f", "#1a3010"],
      labelColor: "#8ade50",
      labelGlow: "#4a8020",
      accentTop: "rgba(100,180,60,0.12)",
      accentBot: "rgba(40,80,20,0.15)",
    },
    {
      name: "MATHEY MARSHES",
      x: 380,
      w: 340,
      colors: ["#2a3a2a", "#1a2a1a", "#0a1a0a"],
      labelColor: "#6aaa6a",
      labelGlow: "#2a5a2a",
      accentTop: "rgba(60,120,80,0.1)",
      accentBot: "rgba(20,60,30,0.15)",
    },
    {
      name: "STADIUM SANDS",
      x: 720,
      w: 360,
      colors: ["#a08058", "#886848", "#6a5038"],
      labelColor: "#ffe060",
      labelGlow: "#aa8020",
      accentTop: "rgba(200,160,100,0.10)",
      accentBot: "rgba(100,80,45,0.10)",
    },
    {
      name: "FRIST FRONTIER",
      x: 1080,
      w: 360,
      colors: ["#6a8aa0", "#506a80", "#3a5068"],
      labelColor: "#d0f0ff",
      labelGlow: "#5090c0",
      accentTop: "rgba(120,170,210,0.08)",
      accentBot: "rgba(50,80,120,0.10)",
    },
    {
      name: "DORMITORY DEPTHS",
      x: 1440,
      w: 380,
      colors: ["#4a2020", "#321010", "#1a0808"],
      labelColor: "#ff8855",
      labelGlow: "#aa3010",
      accentTop: "rgba(160,50,25,0.08)",
      accentBot: "rgba(70,18,10,0.10)",
    },
  ];

  const borderXPositions = [380, 720, 1080, 1450];
  const borderPaths = borderXPositions.map((bx) =>
    generateOrganicBorderPoints(bx, height),
  );

  const traceSmooth = (
    c: CanvasRenderingContext2D,
    pts: ReadonlyArray<{ x: number; y: number }>,
  ) => {
    if (pts.length < 2) return;
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const cur = pts[i];
      const nxt = pts[i + 1];
      c.quadraticCurveTo(
        cur.x,
        cur.y,
        (cur.x + nxt.x) / 2,
        (cur.y + nxt.y) / 2,
      );
    }
    c.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  };

  regions.forEach((region, idx) => {
    const leftBorder = idx > 0 ? borderPaths[idx - 1] : null;
    const rightBorder = idx < borderPaths.length ? borderPaths[idx] : null;

    ctx.save();
    ctx.beginPath();
    if (leftBorder) {
      traceSmooth(ctx, leftBorder);
      ctx.lineTo(
        rightBorder
          ? rightBorder[rightBorder.length - 1].x
          : region.x + region.w + 40,
        height + 4,
      );
    } else {
      ctx.moveTo(-4, -4);
      ctx.lineTo(-4, height + 4);
    }
    if (rightBorder) {
      const reversed = [...rightBorder].reverse();
      for (const pt of reversed) ctx.lineTo(pt.x, pt.y);
      if (!leftBorder) ctx.lineTo(-4, -4);
    } else {
      ctx.lineTo(region.x + region.w + 40, height + 4);
      ctx.lineTo(region.x + region.w + 40, -4);
      if (leftBorder) ctx.lineTo(leftBorder[0].x, leftBorder[0].y);
    }
    ctx.closePath();
    ctx.clip();

    const gradient = ctx.createLinearGradient(
      region.x,
      0,
      region.x + region.w,
      height,
    );
    gradient.addColorStop(0, region.colors[0]);
    gradient.addColorStop(0.5, region.colors[1]);
    gradient.addColorStop(1, region.colors[2]);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = gradient;
    ctx.fillRect(region.x - 60, 0, region.w + 120, height);

    const topGlow = ctx.createLinearGradient(
      region.x,
      0,
      region.x,
      height * 0.4,
    );
    topGlow.addColorStop(0, region.accentTop);
    topGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = topGlow;
    ctx.fillRect(region.x - 60, 0, region.w + 120, height * 0.4);

    const bottomGlow = ctx.createLinearGradient(
      region.x,
      height * 0.6,
      region.x,
      height,
    );
    bottomGlow.addColorStop(0, "rgba(0,0,0,0)");
    bottomGlow.addColorStop(1, region.accentBot);
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(region.x - 60, height * 0.6, region.w + 120, height * 0.4);

    const regionCenterX = region.x + region.w / 2;
    const regionCenterY = height / 2;
    const innerGlow = ctx.createRadialGradient(
      regionCenterX,
      regionCenterY,
      0,
      regionCenterX,
      regionCenterY,
      region.w * 0.6,
    );
    innerGlow.addColorStop(0, region.accentTop);
    innerGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.ellipse(
      regionCenterX,
      regionCenterY,
      region.w * 0.55,
      height * 0.45,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();

    const labelX = region.x + region.w / 2;
    const labelY = 20;

    ctx.save();
    ctx.font = "bold 11px 'bc-novatica-cyr', serif";
    ctx.textAlign = "center";
    (ctx as unknown as Record<string, string>).letterSpacing = "3px";

    const textMetrics = ctx.measureText(region.name);
    const bannerWidth = textMetrics.width + 30;
    const bannerHeight = 20;
    const bx = labelX - bannerWidth / 2;
    const by = labelY - bannerHeight / 2 - 1;

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.moveTo(bx - 12, by + 2);
    ctx.lineTo(bx + 4, by + 2);
    ctx.lineTo(bx + 4, by + bannerHeight + 2);
    ctx.lineTo(bx - 12, by + bannerHeight * 0.65 + 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + bannerWidth + 8, by + 2);
    ctx.lineTo(bx + bannerWidth - 4, by + 2);
    ctx.lineTo(bx + bannerWidth - 4, by + bannerHeight + 2);
    ctx.lineTo(bx + bannerWidth + 8, by + bannerHeight * 0.65 + 2);
    ctx.closePath();
    ctx.fill();

    const ribbonGradientLeft = ctx.createLinearGradient(
      bx - 10,
      by,
      bx + 5,
      by,
    );
    ribbonGradientLeft.addColorStop(0, region.colors[2]);
    ribbonGradientLeft.addColorStop(1, region.colors[1]);
    ctx.fillStyle = ribbonGradientLeft;
    ctx.beginPath();
    ctx.moveTo(bx - 10, by + 1);
    ctx.lineTo(bx + 5, by + 1);
    ctx.lineTo(bx + 5, by + bannerHeight - 1);
    ctx.lineTo(bx - 10, by + bannerHeight * 0.6);
    ctx.closePath();
    ctx.fill();

    const ribbonGradientRight = ctx.createLinearGradient(
      bx + bannerWidth - 5,
      by,
      bx + bannerWidth + 10,
      by,
    );
    ribbonGradientRight.addColorStop(0, region.colors[1]);
    ribbonGradientRight.addColorStop(1, region.colors[2]);
    ctx.fillStyle = ribbonGradientRight;
    ctx.beginPath();
    ctx.moveTo(bx + bannerWidth - 5, by + 1);
    ctx.lineTo(bx + bannerWidth + 10, by + 1);
    ctx.lineTo(bx + bannerWidth + 10, by + bannerHeight * 0.6);
    ctx.lineTo(bx + bannerWidth - 5, by + bannerHeight - 1);
    ctx.closePath();
    ctx.fill();

    const bannerGradient = ctx.createLinearGradient(
      bx,
      by,
      bx,
      by + bannerHeight,
    );
    bannerGradient.addColorStop(0, region.colors[0]);
    bannerGradient.addColorStop(0.3, region.colors[1]);
    bannerGradient.addColorStop(0.7, region.colors[1]);
    bannerGradient.addColorStop(1, region.colors[2]);
    ctx.fillStyle = bannerGradient;
    ctx.fillRect(bx + 2, by, bannerWidth - 4, bannerHeight);

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(bx + 2, by, bannerWidth - 4, 2);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(bx + 2, by + bannerHeight - 2, bannerWidth - 4, 2);

    ctx.strokeStyle = `${region.labelGlow}80`;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(bx + 4, by + 2, bannerWidth - 8, bannerHeight - 4);

    const drawDiamond = (dx: number, dy: number, ds: number) => {
      ctx.fillStyle = `${region.labelColor}90`;
      ctx.beginPath();
      ctx.moveTo(dx, dy - ds);
      ctx.lineTo(dx + ds, dy);
      ctx.lineTo(dx, dy + ds);
      ctx.lineTo(dx - ds, dy);
      ctx.closePath();
      ctx.fill();
    };
    drawDiamond(bx + 8, labelY, 2.5);
    drawDiamond(bx + bannerWidth - 8, labelY, 2.5);

    ctx.fillStyle = region.labelGlow;
    ctx.globalAlpha = 0.3;
    ctx.fillText(region.name, labelX - 1, labelY + 4);
    ctx.fillText(region.name, labelX + 1, labelY + 4);
    ctx.fillText(region.name, labelX, labelY + 3);
    ctx.fillText(region.name, labelX, labelY + 5);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(region.name, labelX + 0.5, labelY + 4.5);
    ctx.fillStyle = region.labelColor;
    ctx.fillText(region.name, labelX, labelY + 4);
    ctx.restore();
  });

  drawRuggedBorder(ctx, height, 380, "#3d5a2f", "#2a3a2a");
  drawRuggedBorder(ctx, height, 720, "#2a3a2a", "#7a6848");
  drawRuggedBorder(ctx, height, 1080, "#6a5a40", "#4a5560");
  drawRuggedBorder(ctx, height, 1450, "#3a4858", "#3a2020");
}
