import type { WorldMapDrawContext } from "./drawContext";
import { MAP_WIDTH } from "../worldMapData";
import { seededRandom } from "../worldMapUtils";

const ROAD_TENSION = 0.35;
const ROAD_HW = 4;

function traceRoadPath(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  ox: number,
  oy: number,
) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0] + ox, pts[0][1] + oy);
  if (pts.length === 2) {
    ctx.lineTo(pts[1][0] + ox, pts[1][1] + oy);
  } else {
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[Math.min(pts.length - 1, i + 1)];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      ctx.bezierCurveTo(
        p1[0] + (p2[0] - p0[0]) * ROAD_TENSION + ox,
        p1[1] + (p2[1] - p0[1]) * ROAD_TENSION + oy,
        p2[0] - (p3[0] - p1[0]) * ROAD_TENSION + ox,
        p2[1] - (p3[1] - p1[1]) * ROAD_TENSION + oy,
        p2[0] + ox,
        p2[1] + oy,
      );
    }
  }
}

interface RoadPalette {
  dirtLight: string;
  dirtMid: string;
  dirtDark: string;
  stoneBody: string[];
  stoneHighlight: string;
  stoneShadow: string;
}

function getRoadPalette(avgX: number): RoadPalette {
  if (avgX < 380) {
    return {
      dirtLight: "rgba(105, 85, 55, 0.28)",
      dirtMid: "rgba(85, 70, 40, 0.32)",
      dirtDark: "rgba(55, 45, 25, 0.35)",
      stoneBody: ["#7a6a4a", "#6a5a38", "#5a4a28", "#8a7a58"],
      stoneHighlight: "#b0a080",
      stoneShadow: "#3a2a10",
    };
  } else if (avgX < 720) {
    return {
      dirtLight: "rgba(80, 70, 50, 0.3)",
      dirtMid: "rgba(60, 55, 38, 0.35)",
      dirtDark: "rgba(40, 35, 22, 0.38)",
      stoneBody: ["#5a6050", "#4a5040", "#3a4030", "#6a7058"],
      stoneHighlight: "#8a9a80",
      stoneShadow: "#1a2010",
    };
  } else if (avgX < 1080) {
    return {
      dirtLight: "rgba(130, 105, 65, 0.3)",
      dirtMid: "rgba(110, 85, 50, 0.32)",
      dirtDark: "rgba(80, 60, 30, 0.35)",
      stoneBody: ["#b09860", "#a08848", "#c0a870", "#907838"],
      stoneHighlight: "#d8c898",
      stoneShadow: "#604820",
    };
  } else if (avgX < 1440) {
    return {
      dirtLight: "rgba(90, 85, 80, 0.28)",
      dirtMid: "rgba(70, 65, 60, 0.32)",
      dirtDark: "rgba(45, 42, 38, 0.35)",
      stoneBody: ["#7888a0", "#687890", "#586878", "#889ab0"],
      stoneHighlight: "#a8b8d0",
      stoneShadow: "#384858",
    };
  }
  return {
    dirtLight: "rgba(70, 45, 35, 0.3)",
    dirtMid: "rgba(55, 30, 22, 0.35)",
    dirtDark: "rgba(35, 18, 12, 0.38)",
    stoneBody: ["#6a3525", "#5a2518", "#7a4535", "#4a1508"],
    stoneHighlight: "#9a6550",
    stoneShadow: "#2a0a00",
  };
}

function drawCobblestones(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  palette: RoadPalette,
) {
  let sIdx = 0;
  const sampleSegment = (
    p1: number[],
    c1: number[],
    c2: number[],
    p2: number[],
  ) => {
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const count = Math.max(2, Math.ceil(segLen / 18));
    for (let s = 0; s < count; s++) {
      const t = (s + 0.5) / count;
      const mt = 1 - t;
      const bx =
        mt * mt * mt * p1[0] +
        3 * mt * mt * t * c1[0] +
        3 * mt * t * t * c2[0] +
        t * t * t * p2[0];
      const by =
        mt * mt * mt * p1[1] +
        3 * mt * mt * t * c1[1] +
        3 * mt * t * t * c2[1] +
        t * t * t * p2[1];
      const tdx =
        3 * mt * mt * (c1[0] - p1[0]) +
        6 * mt * t * (c2[0] - c1[0]) +
        3 * t * t * (p2[0] - c2[0]);
      const tdy =
        3 * mt * mt * (c1[1] - p1[1]) +
        6 * mt * t * (c2[1] - c1[1]) +
        3 * t * t * (p2[1] - c2[1]);
      const tLen = Math.hypot(tdx, tdy) || 1;
      const px = -tdy / tLen;
      const py = tdx / tLen;
      const tx = tdx / tLen;
      const ty = tdy / tLen;

      const baseSeed = sIdx * 997 + Math.round(bx * 7.3);
      const nStones = 1 + Math.floor(seededRandom(baseSeed) * 2);

      for (let j = 0; j < nStones; j++) {
        const lat = (seededRandom(baseSeed + j * 37) - 0.5) * ROAD_HW * 2;
        const lon = (seededRandom(baseSeed + j * 53) - 0.5) * 3.5;
        const sx = bx + px * lat + tx * lon;
        const sy = by + py * lat + ty * lon;
        const sw = 0.7 + seededRandom(baseSeed + j * 71) * 1.4;
        const sh = sw * (0.35 + seededRandom(baseSeed + j * 79) * 0.3);
        const rot = seededRandom(baseSeed + j * 89) * Math.PI;
        const cIdx = Math.floor(
          seededRandom(baseSeed + j * 97) * palette.stoneBody.length,
        );

        ctx.globalAlpha = 0.18;
        ctx.fillStyle = palette.stoneShadow;
        ctx.beginPath();
        ctx.ellipse(sx + 0.3, sy + 0.35, sw * 1.1, sh * 1.15, rot, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.5;
        ctx.fillStyle = palette.stoneBody[cIdx];
        ctx.beginPath();
        ctx.ellipse(sx, sy, sw, sh, rot, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.14;
        ctx.fillStyle = palette.stoneHighlight;
        ctx.beginPath();
        ctx.ellipse(sx - 0.2, sy - 0.2, sw * 0.55, sh * 0.45, rot, 0, Math.PI * 2);
        ctx.fill();
      }
      sIdx++;
    }
  };

  if (pts.length === 2) {
    sampleSegment(pts[0], pts[0], pts[1], pts[1]);
  } else {
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[Math.min(pts.length - 1, i + 1)];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      sampleSegment(
        p1,
        [p1[0] + (p2[0] - p0[0]) * ROAD_TENSION, p1[1] + (p2[1] - p0[1]) * ROAD_TENSION],
        [p2[0] - (p3[0] - p1[0]) * ROAD_TENSION, p2[1] - (p3[1] - p1[1]) * ROAD_TENSION],
        p2,
      );
    }
  }
  ctx.globalAlpha = 1;
}

function drawEdgePebbles(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  palette: RoadPalette,
) {
  let sIdx = 5000;
  const sampleEdge = (
    p1: number[],
    c1: number[],
    c2: number[],
    p2: number[],
  ) => {
    const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const count = Math.max(1, Math.ceil(segLen / 28));
    for (let s = 0; s < count; s++) {
      const t = (s + 0.3) / count;
      const mt = 1 - t;
      const bx =
        mt * mt * mt * p1[0] +
        3 * mt * mt * t * c1[0] +
        3 * mt * t * t * c2[0] +
        t * t * t * p2[0];
      const by =
        mt * mt * mt * p1[1] +
        3 * mt * mt * t * c1[1] +
        3 * mt * t * t * c2[1] +
        t * t * t * p2[1];
      const tdx =
        3 * mt * mt * (c1[0] - p1[0]) +
        6 * mt * t * (c2[0] - c1[0]) +
        3 * t * t * (p2[0] - c2[0]);
      const tdy =
        3 * mt * mt * (c1[1] - p1[1]) +
        6 * mt * t * (c2[1] - c1[1]) +
        3 * t * t * (p2[1] - c2[1]);
      const tLen = Math.hypot(tdx, tdy) || 1;
      const px = -tdy / tLen;
      const py = tdx / tLen;

      for (let side = -1; side <= 1; side += 2) {
        const eSeed = sIdx * 773 + side * 500;
        const offset = ROAD_HW + 1.5 + seededRandom(eSeed) * 2.5;
        const ex = bx + px * offset * side;
        const ey = by + py * offset * side;
        const ew = 0.5 + seededRandom(eSeed + 11) * 1.0;
        const eh = ew * (0.4 + seededRandom(eSeed + 23) * 0.2);
        const eRot = seededRandom(eSeed + 31) * Math.PI;

        ctx.globalAlpha = 0.25;
        ctx.fillStyle =
          palette.stoneBody[
            Math.floor(seededRandom(eSeed + 41) * palette.stoneBody.length)
          ];
        ctx.beginPath();
        ctx.ellipse(ex, ey, ew, eh, eRot, 0, Math.PI * 2);
        ctx.fill();
      }
      sIdx++;
    }
  };

  if (pts.length === 2) {
    sampleEdge(pts[0], pts[0], pts[1], pts[1]);
  } else {
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[Math.min(pts.length - 1, i + 1)];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      sampleEdge(
        p1,
        [p1[0] + (p2[0] - p0[0]) * ROAD_TENSION, p1[1] + (p2[1] - p0[1]) * ROAD_TENSION],
        [p2[0] - (p3[0] - p1[0]) * ROAD_TENSION, p2[1] - (p3[1] - p1[1]) * ROAD_TENSION],
        p2,
      );
    }
  }
  ctx.globalAlpha = 1;
}

function drawRoadSegment(
  ctx: CanvasRenderingContext2D,
  getLevelY: (pct: number) => number,
  points: [number, number][],
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const pts = points.map((p) => [p[0], getLevelY(p[1])]);
  const avgX = points.reduce((s, p) => s + p[0], 0) / points.length;
  const palette = getRoadPalette(avgX);

  // Ground shadow
  traceRoadPath(ctx, pts, 2, 3);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
  ctx.lineWidth = 16;
  ctx.stroke();

  // Road bed (dark border)
  traceRoadPath(ctx, pts, 0, 0);
  ctx.strokeStyle = palette.dirtDark;
  ctx.lineWidth = 13;
  ctx.stroke();

  // Main surface
  traceRoadPath(ctx, pts, 0, 0);
  ctx.strokeStyle = palette.dirtMid;
  ctx.lineWidth = 10;
  ctx.stroke();

  // Cobblestone texture
  drawCobblestones(ctx, pts, palette);

  // Edge pebbles
  drawEdgePebbles(ctx, pts, palette);

  // Worn center highlight
  traceRoadPath(ctx, pts, 0, 0);
  ctx.strokeStyle = palette.dirtLight;
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.restore();
}

export function drawRoads(dc: WorldMapDrawContext) {
  const { ctx, getLevelY } = dc;
  const draw = (points: [number, number][]) =>
    drawRoadSegment(ctx, getLevelY, points);

  // Grassland
  draw([[70, 50], [95, 47], [125, 42], [160, 38], [195, 40], [230, 46], [260, 53], [285, 58], [310, 62], [340, 60], [375, 58]]);
  // Swamp
  draw([[425, 57], [450, 60], [475, 65], [500, 62], [525, 55], [555, 48], [580, 42], [610, 40], [640, 44], [670, 48], [715, 48]]);
  // Desert
  draw([[760, 49], [790, 45], [815, 40], [845, 38], [875, 42], [910, 50], [940, 58], [965, 62], [995, 58], [1030, 52], [1075, 55]]);
  // Winter
  draw([[1125, 55], [1155, 50], [1180, 44], [1210, 40], [1240, 44], [1270, 52], [1300, 58], [1330, 62], [1360, 58], [1395, 52], [1445, 52]]);
  // Volcanic
  draw([[1493, 52], [1515, 48], [1540, 42], [1565, 38], [1590, 42], [1620, 50], [1650, 55], [1680, 52], [1710, 46], [1740, 48], [MAP_WIDTH - 70, 50]]);

  // Challenge-level connector roads
  draw([[320, 58], [328, 50], [338, 43], [348, 37], [360, 32], [370, 30]]);
  draw([[370, 30], [335, 28], [295, 24], [255, 23], [215, 24], [175, 26]]);
  draw([[650, 56], [625, 60], [600, 65], [575, 68], [555, 70], [540, 70]]);
  draw([[650, 56], [658, 48], [665, 40], [672, 34], [678, 30], [680, 28]]);
  draw([[910, 38], [913, 34], [912, 30], [910, 27], [910, 25]]);
  draw([[968, 53], [976, 57], [985, 61], [993, 64], [998, 66], [1000, 67]]);
  draw([[1365, 48], [1338, 42], [1305, 37], [1270, 34], [1240, 32], [1210, 32]]);
  draw([[1210, 32], [1240, 31], [1270, 30], [1300, 29], [1332, 28]]);
  draw([[1592, 37], [1575, 33], [1558, 30], [1544, 28], [1530, 28]]);
  draw([[1702, 59], [1678, 63], [1655, 67], [1635, 70], [1620, 72], [1612, 72]]);
}
