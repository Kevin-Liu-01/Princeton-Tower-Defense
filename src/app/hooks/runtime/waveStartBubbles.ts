import { distance } from "../../utils";
import {
  WAVE_START_BUBBLE_HIT_RADIUS,
  type WaveStartBubbleScreenData,
} from "../../rendering/ui/waveStartBubble";

export interface WaveStartConfirmState {
  mapId: string;
  waveIndex: number;
  pathKey: string;
  openedAt: number;
}

interface Point {
  x: number;
  y: number;
}

export function findWaveStartBubbleAtPoint(
  bubbles: WaveStartBubbleScreenData[],
  point: Point,
): WaveStartBubbleScreenData | null {
  let clickedBubble: WaveStartBubbleScreenData | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const bubble of bubbles) {
    const bubbleDistance = distance(point, bubble.screenPos);
    if (
      bubbleDistance <= bubble.radius * WAVE_START_BUBBLE_HIT_RADIUS &&
      bubbleDistance < bestDistance
    ) {
      clickedBubble = bubble;
      bestDistance = bubbleDistance;
    }
  }

  return clickedBubble;
}

export function getHoveredWaveStartBubblePath(
  bubbles: WaveStartBubbleScreenData[],
  point: Point,
): string | null {
  const bubble = findWaveStartBubbleAtPoint(bubbles, point);
  return bubble?.pathKey ?? null;
}

export function isWaveStartConfirmForBubble(
  confirmState: WaveStartConfirmState | null,
  bubble: WaveStartBubbleScreenData,
  mapId: string,
  waveIndex: number,
): boolean {
  return (
    confirmState?.mapId === mapId &&
    confirmState.waveIndex === waveIndex &&
    confirmState.pathKey === bubble.pathKey
  );
}
