import type { Position } from "../../../types";

interface TooltipPositionOptions {
  width: number;
  height: number;
  offsetX?: number;
  offsetY?: number;
  minTop?: number;
  viewportPadding?: number;
}

export function getTooltipPosition(
  position: Position,
  {
    width,
    height,
    offsetX = 20,
    offsetY = -30,
    minTop = 60,
    viewportPadding = 10,
  }: TooltipPositionOptions,
) {
  let left = position.x + offsetX;
  let top = position.y + offsetY;

  if (left + width > window.innerWidth - viewportPadding) {
    left = position.x - width - offsetX;
  }
  if (top < minTop) {
    top = minTop;
  }
  if (top + height > window.innerHeight - viewportPadding) {
    top = window.innerHeight - height - viewportPadding;
  }

  return { left, top };
}
