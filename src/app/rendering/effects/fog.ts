import type { Position } from "../../types";
import { drawOrganicBlobAt } from "../helpers";

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface DrawRoadEndFogParams {
  ctx: CanvasRenderingContext2D;
  endPos: Position;
  towardsPos: Position;
  size: number;
  nowSeconds: number;
  cameraZoom: number;
  groundRgb: RgbColor;
  accentRgb: RgbColor;
  pathRgb: RgbColor;
  isChallengeTerrainLevel: boolean;
  fogBlobCount: number;
  fogWispCount: number;
}

const FOG_BLOB_COUNT = 60;
const FOG_WISP_COUNT = 10;

export function computeFogCounts(isChallengeTerrainLevel: boolean): {
  fogBlobCount: number;
  fogWispCount: number;
} {
  const challengeFogCountScale = isChallengeTerrainLevel ? 0.58 : 1;
  return {
    fogBlobCount: Math.max(
      isChallengeTerrainLevel ? 7 : 12,
      Math.floor(FOG_BLOB_COUNT * challengeFogCountScale)
    ),
    fogWispCount: Math.max(
      isChallengeTerrainLevel ? 1 : 2,
      Math.floor(FOG_WISP_COUNT * challengeFogCountScale)
    ),
  };
}

function fogHash(n: number): number {
  const x = Math.sin(n * 127.1 + n * 311.7) * 43_758.5453;
  return x - Math.floor(x);
}

export function drawRoadEndFog(params: DrawRoadEndFogParams): void {
  const {
    ctx,
    endPos,
    towardsPos,
    size,
    nowSeconds,
    cameraZoom,
    groundRgb,
    accentRgb,
    pathRgb,
    isChallengeTerrainLevel,
    fogBlobCount,
    fogWispCount,
  } = params;

  const time = nowSeconds / 4;
  const dx = endPos.x - towardsPos.x;
  const dy = endPos.y - towardsPos.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const dirX = len > 0 ? dx / len : 1;
  const dirY = len > 0 ? dy / len : 0;
  const perpX = -dirY;
  const perpY = dirX;
  const z = Math.max(cameraZoom, 0.55);
  const challengeFogSizeScale = isChallengeTerrainLevel ? 0.72 : 1;
  const challengeFogOpacityScale = isChallengeTerrainLevel ? 0.52 : 1;
  const fogSize = size * challengeFogSizeScale;

  const gr = groundRgb.r;
  const gg = groundRgb.g;
  const gb = groundRgb.b;

  const mixR = Math.round(gr * 0.5 + accentRgb.r * 0.25 + pathRgb.r * 0.25);
  const mixG = Math.round(gg * 0.5 + accentRgb.g * 0.25 + pathRgb.g * 0.25);
  const mixB = Math.round(gb * 0.5 + accentRgb.b * 0.25 + pathRgb.b * 0.25);
  const edgeR = Math.round(mixR * 0.65);
  const edgeG = Math.round(mixG * 0.65);
  const edgeB = Math.round(mixB * 0.65);

  // Solid core: opaque ground-colored ellipse that fully hides the road end
  const coreSize = fogSize * 0.55 * z;
  const coreGrad = ctx.createRadialGradient(
    endPos.x,
    endPos.y,
    0,
    endPos.x,
    endPos.y,
    coreSize
  );
  coreGrad.addColorStop(
    0,
    `rgba(${gr},${gg},${gb},${(1 * challengeFogOpacityScale).toFixed(3)})`
  );
  coreGrad.addColorStop(
    0.5,
    `rgba(${gr},${gg},${gb},${(0.95 * challengeFogOpacityScale).toFixed(3)})`
  );
  coreGrad.addColorStop(
    0.75,
    `rgba(${gr},${gg},${gb},${(0.7 * challengeFogOpacityScale).toFixed(3)})`
  );
  coreGrad.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
  ctx.fillStyle = coreGrad;
  drawOrganicBlobAt(
    ctx,
    endPos.x,
    endPos.y,
    coreSize,
    coreSize * 0.5,
    fogHash(42.7) * 1000,
    0.14
  );
  ctx.fill();

  // Mid layer: slightly offset opaque fills to widen the solid coverage
  for (let m = 0; m < 4; m++) {
    const mAngle = (m / 4) * Math.PI * 2 + 0.3;
    const mDist = fogSize * 0.18 * z;
    const mx = endPos.x + Math.cos(mAngle) * mDist * 0.7;
    const my = endPos.y + Math.sin(mAngle) * mDist * 0.35;
    const mSize = fogSize * 0.4 * z;
    const mGrad = ctx.createRadialGradient(mx, my, 0, mx, my, mSize);
    mGrad.addColorStop(
      0,
      `rgba(${gr},${gg},${gb},${(0.9 * challengeFogOpacityScale).toFixed(3)})`
    );
    mGrad.addColorStop(
      0.55,
      `rgba(${gr},${gg},${gb},${(0.6 * challengeFogOpacityScale).toFixed(3)})`
    );
    mGrad.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
    ctx.fillStyle = mGrad;
    drawOrganicBlobAt(
      ctx,
      mx,
      my,
      mSize,
      mSize * 0.5,
      fogHash(m * 31.3 + 77) * 1000,
      0.16
    );
    ctx.fill();
  }

  // Outer blobs: organic edge with higher opacity
  const armCount = 7;
  const armAngles: number[] = [];
  const armLengths: number[] = [];
  for (let a = 0; a < armCount; a++) {
    armAngles.push(fogHash(a * 99.1 + 42.7) * Math.PI * 2);
    armLengths.push(0.8 + fogHash(a * 77.3 + 13.1) * 0.7);
  }

  const getMaxReach = (angle: number): number => {
    let reach = 0.75;
    for (let a = 0; a < armCount; a++) {
      const diff = Math.abs(angle - armAngles[a]);
      const wrapped = Math.min(diff, Math.PI * 2 - diff);
      const influence = Math.max(0, 1 - wrapped / 0.6);
      reach = Math.max(reach, 0.75 + influence * armLengths[a] * 0.6);
    }
    return reach;
  };

  for (let i = 0; i < fogBlobCount; i++) {
    const h1 = fogHash(i * 13.37);
    const h2 = fogHash(i * 7.91 + 0.5);
    const h3 = fogHash(i * 3.14 + 1);
    const h4 = fogHash(i * 11.23 + 2);

    const angle = h1 * Math.PI * 2;
    const maxR = getMaxReach(angle);
    const rawDist = (h2 * 0.5 + h3 * 0.5) * maxR;

    const alongDist = Math.cos(angle) * rawDist * fogSize;
    const perpDist = Math.sin(angle) * rawDist * fogSize;

    const bx = endPos.x + dirX * alongDist * z + perpX * perpDist * 0.65 * z;
    const by =
      endPos.y + dirY * alongDist * 0.5 * z + perpY * perpDist * 0.32 * z;

    const animX = Math.sin(time * 0.25 + i * 0.68) * 4 * z;
    const animY = Math.cos(time * 0.2 + i * 0.52) * 2.5 * z;

    const blobSize = fogSize * (0.22 + h4 * 0.3) * z;
    const distNorm = rawDist / maxR;
    const alpha = Math.max(
      0,
      0.7 * (1 - distNorm * distNorm) * challengeFogOpacityScale
    );
    if (alpha <= 0.01) {
      continue;
    }

    const blend = distNorm;
    const cr = gr + (edgeR - gr) * blend;
    const cg2 = gg + (edgeG - gg) * blend;
    const cb = gb + (edgeB - gb) * blend;

    const grad = ctx.createRadialGradient(
      bx + animX,
      by + animY,
      0,
      bx + animX,
      by + animY,
      blobSize
    );
    grad.addColorStop(
      0,
      `rgba(${Math.round(cr)},${Math.round(cg2)},${Math.round(cb)},${alpha.toFixed(3)})`
    );
    grad.addColorStop(
      0.5,
      `rgba(${edgeR},${edgeG},${edgeB},${(alpha * 0.5).toFixed(3)})`
    );
    grad.addColorStop(1, `rgba(${edgeR},${edgeG},${edgeB},0)`);
    ctx.fillStyle = grad;
    drawOrganicBlobAt(
      ctx,
      bx + animX,
      by + animY,
      blobSize,
      blobSize * 0.6,
      fogHash(i * 19.7 + 123) * 1000,
      0.2
    );
    ctx.fill();
  }

  // Drifting wisps with higher opacity
  for (let i = 0; i < fogWispCount; i++) {
    const wAngle = time * (0.07 + fogHash(i + 100) * 0.05) + i * 0.52;
    const wAlongDist = Math.sin(wAngle) * fogSize * 0.65;
    const wPerpDist = Math.cos(wAngle * 0.7 + i) * fogSize * 0.45;
    const wx = endPos.x + dirX * wAlongDist * z + perpX * wPerpDist * 0.65 * z;
    const wy =
      endPos.y + dirY * wAlongDist * 0.5 * z + perpY * wPerpDist * 0.32 * z;
    const wSize = fogSize * (0.18 + fogHash(i + 200) * 0.2) * z;
    const wa =
      (0.22 + 0.08 * Math.sin(time * 0.4 + i)) * challengeFogOpacityScale;

    const wGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, wSize);
    wGrad.addColorStop(0, `rgba(${gr},${gg},${gb},${wa.toFixed(3)})`);
    wGrad.addColorStop(
      0.45,
      `rgba(${edgeR},${edgeG},${edgeB},${(wa * 0.45).toFixed(3)})`
    );
    wGrad.addColorStop(1, `rgba(${edgeR},${edgeG},${edgeB},0)`);
    ctx.fillStyle = wGrad;
    drawOrganicBlobAt(
      ctx,
      wx,
      wy,
      wSize,
      wSize * 0.65,
      fogHash(i * 41.1 + 200) * 1000,
      0.22
    );
    ctx.fill();
  }
}
