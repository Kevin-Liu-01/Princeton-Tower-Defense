import type { TutorialStepPosition } from "../../constants/tutorial";

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Desktop and mobile controls coexist; never anchor to display:none elements. */
export function getVisibleTutorialTarget<
  T extends { getBoundingClientRect(): Rect },
>(elements: Iterable<T>): T | null {
  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return element;
    }
  }
  return null;
}

export function getTutorialPanelPosition(
  position: TutorialStepPosition,
  highlight: Rect | null,
  panel: { width: number; height: number },
  viewport: Rect
): { left: number; top: number; maxHeight: number } {
  const margin = 12;
  const maxHeight = Math.max(0, viewport.height - margin * 2);
  const height = Math.min(panel.height, maxHeight);
  const minLeft = viewport.left + margin;
  const minTop = viewport.top + margin;
  const maxLeft = Math.max(
    minLeft,
    viewport.left + viewport.width - panel.width - margin
  );
  const maxTop = Math.max(
    minTop,
    viewport.top + viewport.height - height - margin
  );
  let left = viewport.left + (viewport.width - panel.width) / 2;
  let top = viewport.top + (viewport.height - height) / 2;
  if (highlight) {
    if (position.startsWith("top-")) {
      top = highlight.top + highlight.height + margin;
    } else if (position.startsWith("bottom-")) {
      top = highlight.top - height - margin;
    }
    if (position.endsWith("left")) {
      left = minLeft;
    } else if (position.endsWith("right")) {
      left = maxLeft;
    }
  }
  return {
    left: Math.max(minLeft, Math.min(maxLeft, left)),
    top: Math.max(minTop, Math.min(maxTop, top)),
    maxHeight,
  };
}
