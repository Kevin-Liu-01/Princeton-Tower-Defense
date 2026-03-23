import type { Position } from "../../types";
import { gridToWorldPath, worldToScreen, screenToWorld } from "../../utils";
import { MAP_PATHS, WAVE_TIMER_BASE } from "../../constants";

export interface WaveStartBubbleScreenData {
  pathKey: string;
  pathLabel: string;
  screenPos: Position;
  spawnScreenPos: Position;
  worldPos: Position;
  radius: number;
  progress: number;
  remainingMs: number;
}

const BASE_RADIUS = 22;
const HIT_RADIUS = 1.2;
const FORWARD_OFFSET = 85;
const SIDE_OFFSET = 38;
const VIEW_MARGIN_X = 28;
const VIEW_MARGIN_Y = 28;
const TOP_SAFE_Y = 90;
const LEFT_SAFE_X = 60;
const RIGHT_SAFE_X = 180;
const CORNER_MARGIN = 34;
const BUBBLE_SEPARATION_PAD = 6;
const SEPARATION_ITERATIONS = 4;

export { HIT_RADIUS as WAVE_START_BUBBLE_HIT_RADIUS };

// --------------------------------------------------------------------------
// Positioning
// --------------------------------------------------------------------------

export interface WaveStartBubbleLayoutParams {
  gameState: string;
  battleOutcome: string | null;
  gameSpeed: number;
  waveInProgress: boolean;
  currentWave: number;
  totalWaves: number;
  nextWaveTimer: number;
  activeWaveSpawnPaths: string[];
  cameraOffset: Position;
  cameraZoom: number;
}

export function getWaveStartBubblesScreenData(
  params: WaveStartBubbleLayoutParams,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
): WaveStartBubbleScreenData[] {
  const {
    gameState,
    battleOutcome,
    gameSpeed,
    waveInProgress,
    currentWave,
    totalWaves,
    nextWaveTimer,
    activeWaveSpawnPaths,
    cameraOffset,
    cameraZoom,
  } = params;

  const canShowBubble =
    gameState === "playing" &&
    !battleOutcome &&
    gameSpeed > 0 &&
    !waveInProgress &&
    currentWave < totalWaves &&
    nextWaveTimer > 0;

  if (!canShowBubble) return [];

  const viewportWidth = canvasWidth / dpr;
  const viewportHeight = canvasHeight / dpr;
  const pathCount = activeWaveSpawnPaths.length;
  const bubbles: WaveStartBubbleScreenData[] = [];

  for (let pathIndex = 0; pathIndex < pathCount; pathIndex++) {
    const pathKey = activeWaveSpawnPaths[pathIndex];
    if (!pathKey) continue;
    const pathPoints = MAP_PATHS[pathKey] ?? [];
    if (pathPoints.length === 0) continue;

    const spawnNode = pathPoints[0];
    const nextNode = pathPoints[1] ?? spawnNode;
    if (!spawnNode || !nextNode) continue;

    const spawnWorld = gridToWorldPath(spawnNode);
    const nextWorld = gridToWorldPath(nextNode);
    const pathDx = nextWorld.x - spawnWorld.x;
    const pathDy = nextWorld.y - spawnWorld.y;
    const pathLen = Math.hypot(pathDx, pathDy) || 1;
    const dirX = pathDx / pathLen;
    const dirY = pathDy / pathLen;
    const perpX = -dirY;
    const perpY = dirX;
    const longitudinalOffset = (pathIndex - (pathCount - 1) / 2) * 44;
    const radius =
      BASE_RADIUS * Math.max(0.85, Math.min(1.35, cameraZoom * 0.95));

    const sideSign = pathCount > 1 ? (pathIndex % 2 === 0 ? 1 : -1) : 0;
    const preferredWorldPos: Position = {
      x:
        spawnWorld.x +
        dirX * FORWARD_OFFSET +
        perpX * SIDE_OFFSET * sideSign +
        dirX * longitudinalOffset,
      y:
        spawnWorld.y +
        dirY * FORWARD_OFFSET +
        perpY * SIDE_OFFSET * sideSign +
        dirY * longitudinalOffset,
    };
    const spawnScreenPos = worldToScreen(
      spawnWorld,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );
    const preferredScreenPos = worldToScreen(
      preferredWorldPos,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );

    const minX = Math.max(VIEW_MARGIN_X + radius, LEFT_SAFE_X + radius);
    const maxX = viewportWidth - (RIGHT_SAFE_X + radius);
    const minY = Math.max(VIEW_MARGIN_Y + radius, TOP_SAFE_Y + radius);
    const maxY = viewportHeight - (VIEW_MARGIN_Y + radius);

    const clampToBounds = (point: Position): Position => ({
      x: Math.max(minX, Math.min(maxX, point.x)),
      y: Math.max(minY, Math.min(maxY, point.y)),
    });
    const isInsideBounds = (point: Position): boolean =>
      point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
    const avoidCorners = (
      point: Position,
      axisDx: number,
      axisDy: number,
    ): Position => {
      const cornerPad = CORNER_MARGIN + radius * 0.35;
      const nearLeft = point.x <= minX + cornerPad;
      const nearRight = point.x >= maxX - cornerPad;
      const nearTop = point.y <= minY + cornerPad;
      const nearBottom = point.y >= maxY - cornerPad;
      const nearCorner = (nearLeft || nearRight) && (nearTop || nearBottom);
      if (!nearCorner) return point;

      const adjusted = { ...point };
      if (Math.abs(axisDx) >= Math.abs(axisDy)) {
        adjusted.y = nearTop
          ? minY + cornerPad
          : nearBottom
            ? maxY - cornerPad
            : adjusted.y;
      } else {
        adjusted.x = nearLeft
          ? minX + cornerPad
          : nearRight
            ? maxX - cornerPad
            : adjusted.x;
      }
      return adjusted;
    };

    let screenPos = preferredScreenPos;
    if (!isInsideBounds(preferredScreenPos)) {
      const dx = preferredScreenPos.x - spawnScreenPos.x;
      const dy = preferredScreenPos.y - spawnScreenPos.y;
      const EPSILON = 0.0001;
      let usedLineClip = false;

      if (Math.abs(dx) > EPSILON || Math.abs(dy) > EPSILON) {
        let tEnter = -Infinity;
        let tExit = Infinity;
        const updateAxis = (
          start: number,
          delta: number,
          axisMin: number,
          axisMax: number,
        ): boolean => {
          if (Math.abs(delta) < EPSILON) {
            return start >= axisMin && start <= axisMax;
          }
          const t1 = (axisMin - start) / delta;
          const t2 = (axisMax - start) / delta;
          const axisEnter = Math.min(t1, t2);
          const axisExit = Math.max(t1, t2);
          tEnter = Math.max(tEnter, axisEnter);
          tExit = Math.min(tExit, axisExit);
          return tEnter <= tExit;
        };

        if (
          updateAxis(spawnScreenPos.x, dx, minX, maxX) &&
          updateAxis(spawnScreenPos.y, dy, minY, maxY) &&
          tExit >= 0
        ) {
          const segStart = Math.max(tEnter, 0);
          const segEnd = Math.min(tExit, 1);
          if (segStart <= segEnd) {
            const t = Math.min(segEnd, Math.max(segStart, 0.96 * segEnd));
            screenPos = {
              x: spawnScreenPos.x + dx * t,
              y: spawnScreenPos.y + dy * t,
            };
            usedLineClip = true;
          }
        }
      }

      if (!usedLineClip) {
        screenPos = clampToBounds(preferredScreenPos);
      }
      screenPos = avoidCorners(
        clampToBounds(screenPos),
        preferredScreenPos.x - spawnScreenPos.x,
        preferredScreenPos.y - spawnScreenPos.y,
      );
    }

    const worldPos = screenToWorld(
      screenPos,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom,
    );

    const progress = Math.max(
      0,
      Math.min(1, (WAVE_TIMER_BASE - nextWaveTimer) / WAVE_TIMER_BASE),
    );
    const pathLabel =
      pathCount > 1
        ? `Path ${String.fromCharCode(65 + Math.min(25, pathIndex))}`
        : "Path";

    bubbles.push({
      pathKey,
      pathLabel,
      screenPos,
      spawnScreenPos,
      worldPos,
      radius,
      progress,
      remainingMs: nextWaveTimer,
    });
  }

  separateOverlappingBubbles(bubbles, viewportWidth, viewportHeight);

  return bubbles;
}

// --------------------------------------------------------------------------
// Overlap resolution
// --------------------------------------------------------------------------

function separateOverlappingBubbles(
  bubbles: WaveStartBubbleScreenData[],
  viewportWidth: number,
  viewportHeight: number,
): void {
  if (bubbles.length < 2) return;

  for (let iter = 0; iter < SEPARATION_ITERATIONS; iter++) {
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        const a = bubbles[i]!;
        const b = bubbles[j]!;
        const dx = b.screenPos.x - a.screenPos.x;
        const dy = b.screenPos.y - a.screenPos.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius + BUBBLE_SEPARATION_PAD;

        if (dist >= minDist) continue;

        const overlap = minDist - dist;
        const pushX = dist > 0.01 ? (dx / dist) * overlap * 0.5 : overlap * 0.5;
        const pushY = dist > 0.01 ? (dy / dist) * overlap * 0.5 : 0;

        a.screenPos = {
          x: a.screenPos.x - pushX,
          y: a.screenPos.y - pushY,
        };
        b.screenPos = {
          x: b.screenPos.x + pushX,
          y: b.screenPos.y + pushY,
        };
      }
    }

    for (const bubble of bubbles) {
      const r = bubble.radius;
      bubble.screenPos = {
        x: Math.max(
          VIEW_MARGIN_X + r,
          Math.min(viewportWidth - VIEW_MARGIN_X - r, bubble.screenPos.x),
        ),
        y: Math.max(
          TOP_SAFE_Y + r,
          Math.min(viewportHeight - VIEW_MARGIN_Y - r, bubble.screenPos.y),
        ),
      };
    }
  }
}

// --------------------------------------------------------------------------
// Rendering
// --------------------------------------------------------------------------

export interface DrawWaveStartBubbleParams {
  ctx: CanvasRenderingContext2D;
  bubble: WaveStartBubbleScreenData;
  primedPathKey: string | null;
  hoveredPathKey: string | null;
  frameNowMs: number;
}

export function drawWaveStartBubble(params: DrawWaveStartBubbleParams): void {
  const { ctx, bubble, primedPathKey, hoveredPathKey, frameNowMs } = params;
  const { screenPos, spawnScreenPos, radius, progress } = bubble;
  const isWaveStartPrimed = primedPathKey === bubble.pathKey;
  const isWaveStartHovered = hoveredPathKey === bubble.pathKey;
  const pulseTime = frameNowMs * 0.001;
  const pulse = 0.5 + 0.5 * Math.sin(pulseTime * 5.6);
  const heartbeat = 0.5 + 0.5 * Math.sin(pulseTime * 8.4);
  const hoverPulse = 0.5 + 0.5 * Math.sin(pulseTime * 11.2);
  const hoverBoost = isWaveStartHovered ? 0.55 + hoverPulse * 0.45 : 0;
  const nearLaunchBoost = progress > 0.75 ? (progress - 0.75) / 0.25 : 0;
  const ringRadius = radius * (1.22 + hoverBoost * 0.06);
  const bobOffset =
    Math.sin(pulseTime * 3.2 + bubble.pathKey.length) *
    (2.2 + hoverBoost * 1.4);
  const animatedBubbleCenter = { x: screenPos.x, y: screenPos.y + bobOffset };
  const bubbleScale =
    1 +
    (0.04 + nearLaunchBoost * 0.06) * pulse +
    hoverBoost * (0.03 + hoverPulse * 0.035);
  const ringColor = isWaveStartPrimed
    ? "rgba(255, 165, 96, 0.98)"
    : "rgba(255, 76, 76, 0.98)";
  const ringTrackColor = isWaveStartHovered
    ? isWaveStartPrimed
      ? "rgba(255, 175, 128, 0.44)"
      : "rgba(255, 110, 110, 0.46)"
    : isWaveStartPrimed
      ? "rgba(240, 120, 64, 0.35)"
      : "rgba(170, 30, 30, 0.3)";

  // Link arrow from bubble to spawn point
  const linkDx = animatedBubbleCenter.x - spawnScreenPos.x;
  const linkDy = animatedBubbleCenter.y - spawnScreenPos.y;
  const linkDistance = Math.hypot(linkDx, linkDy);
  if (linkDistance > radius * 1.8) {
    const linkUx = linkDx / linkDistance;
    const linkUy = linkDy / linkDistance;
    ctx.save();
    const triColor = isWaveStartPrimed
      ? isWaveStartHovered
        ? "rgba(255, 198, 148, 0.95)"
        : "rgba(255, 176, 120, 0.88)"
      : isWaveStartHovered
        ? "rgba(255, 132, 132, 0.95)"
        : "rgba(248, 110, 110, 0.82)";
    const triSize = 10 + hoverBoost * 3;
    const triDist = radius * 0.85;
    const triCx = animatedBubbleCenter.x - linkUx * triDist;
    const triCy = animatedBubbleCenter.y - linkUy * triDist;
    const triAngle = Math.atan2(-linkUy, -linkUx);
    ctx.fillStyle = triColor;
    ctx.beginPath();
    ctx.moveTo(
      triCx + Math.cos(triAngle) * triSize,
      triCy + Math.sin(triAngle) * triSize,
    );
    ctx.lineTo(
      triCx + Math.cos(triAngle + 2.4) * triSize * 0.65,
      triCy + Math.sin(triAngle + 2.4) * triSize * 0.65,
    );
    ctx.lineTo(
      triCx + Math.cos(triAngle - 2.4) * triSize * 0.65,
      triCy + Math.sin(triAngle - 2.4) * triSize * 0.65,
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(animatedBubbleCenter.x, animatedBubbleCenter.y);
  ctx.scale(bubbleScale, bubbleScale);

  // Main circular bubble body
  const bodyGradient = ctx.createRadialGradient(
    -radius * 0.38,
    -radius * 0.48,
    radius * 0.2,
    0,
    0,
    radius * 1.04,
  );
  bodyGradient.addColorStop(0, "rgba(214, 214, 224, 0.98)");
  bodyGradient.addColorStop(
    0.18,
    isWaveStartHovered
      ? "rgba(138, 138, 152, 0.99)"
      : "rgba(122, 122, 136, 0.98)",
  );
  bodyGradient.addColorStop(0.55, "rgba(50, 50, 58, 0.98)");
  bodyGradient.addColorStop(1, "rgba(18, 18, 24, 0.98)");
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Inner emblem disc
  const emblemGradient = ctx.createLinearGradient(
    0,
    -radius * 0.65,
    0,
    radius * 0.65,
  );
  emblemGradient.addColorStop(0, "rgba(30, 30, 36, 1)");
  emblemGradient.addColorStop(1, "rgba(8, 8, 10, 1)");
  ctx.fillStyle = emblemGradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
  ctx.fill();

  // Stylized skull emblem
  ctx.fillStyle = "rgba(236, 236, 240, 0.96)";
  ctx.beginPath();
  ctx.arc(0, -radius * 0.03, radius * 0.21, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.rect(-radius * 0.115, radius * 0.03, radius * 0.23, radius * 0.09);
  ctx.fill();
  ctx.fillStyle = "rgba(16, 16, 20, 0.95)";
  ctx.beginPath();
  ctx.arc(-radius * 0.072, -radius * 0.05, radius * 0.055, 0, Math.PI * 2);
  ctx.arc(radius * 0.072, -radius * 0.05, radius * 0.055, 0, Math.PI * 2);
  ctx.fill();

  // Countdown ring track
  ctx.lineWidth = Math.max(2, radius * (0.18 + hoverBoost * 0.05));
  ctx.strokeStyle = ringTrackColor;
  ctx.beginPath();
  ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  if (isWaveStartHovered) {
    ctx.strokeStyle = isWaveStartPrimed
      ? `rgba(255, 214, 184, ${(0.34 + hoverPulse * 0.28).toFixed(3)})`
      : `rgba(255, 150, 150, ${(0.28 + hoverPulse * 0.32).toFixed(3)})`;
    ctx.lineWidth = Math.max(1.6, radius * 0.11);
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      ringRadius + radius * (0.22 + hoverPulse * 0.08),
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Countdown ring progress
  ctx.strokeStyle = ringColor;
  ctx.shadowColor = isWaveStartPrimed
    ? `rgba(255, 160, 92, ${(0.45 + heartbeat * 0.25 + hoverBoost * 0.18).toFixed(3)})`
    : `rgba(255, 76, 76, ${(0.35 + nearLaunchBoost * 0.4 + hoverBoost * 0.22).toFixed(3)})`;
  ctx.shadowBlur = 10 + 16 * nearLaunchBoost + heartbeat * 4 + hoverBoost * 10;
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    ringRadius,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * progress,
  );
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}
