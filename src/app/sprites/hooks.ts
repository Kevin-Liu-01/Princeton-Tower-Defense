import React, { useEffect, useLayoutEffect } from "react";

export const SPRITE_PAD = 1.8;

export function spriteContainerStyle(
  w: number,
  h: number
): React.CSSProperties {
  return { position: "relative", width: w, height: h };
}

export function spriteCanvasStyle(w: number, h: number): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: w,
    height: h,
    pointerEvents: "none",
  };
}

export function setupSpriteCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  const pixelWidth = Math.max(1, Math.round(width * dpr));
  const pixelHeight = Math.max(1, Math.round(height * dpr));
  const backingStoreChanged =
    canvas.width !== pixelWidth || canvas.height !== pixelHeight;
  if (backingStoreChanged) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  // Reset all drawing state and clear the bitmap without reallocating its
  // backing store. The resize fallback preserves the exact legacy behavior
  // in browsers that do not support CanvasRenderingContext2D.reset().
  if (!backingStoreChanged) {
    if (typeof ctx.reset === "function") {
      ctx.reset();
    } else {
      canvas.width = pixelWidth;
    }
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

interface SpriteAnimation {
  frameMs: number;
  render: (time: number) => void;
  startedAt: number;
  lastRenderedAt: number;
  visible: boolean;
}

interface SpriteAnimationSubscription {
  setVisible: (visible: boolean) => void;
  unsubscribe: () => void;
}

// Decorative UI artwork should not compete with the battlefield at 60–144 Hz.
const SPRITE_FRAME_INTERVAL_MS = 1000 / 30;
const activeAnimations = new Map<number, SpriteAnimation>();
let nextAnimationId = 1;
let sharedAnimationFrameId = 0;

const hasVisibleAnimations = (): boolean => {
  if (typeof document !== "undefined" && document.hidden) {
    return false;
  }
  for (const animation of activeAnimations.values()) {
    if (animation.visible) {
      return true;
    }
  }
  return false;
};

const stopSharedAnimationFrame = (): void => {
  if (sharedAnimationFrameId === 0) {
    return;
  }
  window.cancelAnimationFrame(sharedAnimationFrameId);
  sharedAnimationFrameId = 0;
};

const scheduleSharedAnimationFrame = (): void => {
  if (sharedAnimationFrameId !== 0 || !hasVisibleAnimations()) {
    return;
  }
  sharedAnimationFrameId = window.requestAnimationFrame(
    runSharedAnimationFrame
  );
};

function runSharedAnimationFrame(now: number): void {
  sharedAnimationFrameId = 0;
  for (const [animationId, animation] of activeAnimations) {
    if (!animation.visible) {
      continue;
    }
    const elapsed = now - animation.lastRenderedAt;
    if (elapsed < SPRITE_FRAME_INTERVAL_MS) {
      continue;
    }
    animation.lastRenderedAt = now - (elapsed % SPRITE_FRAME_INTERVAL_MS);
    try {
      animation.render((now - animation.startedAt) / animation.frameMs);
    } catch {
      activeAnimations.delete(animationId);
    }
  }
  scheduleSharedAnimationFrame();
}

const handleDocumentVisibilityChange = (): void => {
  if (document.hidden) {
    stopSharedAnimationFrame();
    return;
  }
  scheduleSharedAnimationFrame();
};

const subscribeToSpriteAnimation = (
  frameMs: number,
  render: (time: number) => void
): SpriteAnimationSubscription => {
  const animationId = nextAnimationId;
  nextAnimationId += 1;
  const wasEmpty = activeAnimations.size === 0;
  activeAnimations.set(animationId, {
    frameMs,
    render,
    startedAt: performance.now(),
    lastRenderedAt: performance.now(),
    visible: true,
  });
  if (wasEmpty) {
    document.addEventListener(
      "visibilitychange",
      handleDocumentVisibilityChange
    );
  }
  scheduleSharedAnimationFrame();

  return {
    setVisible: (visible: boolean): void => {
      const animation = activeAnimations.get(animationId);
      if (!animation || animation.visible === visible) {
        return;
      }
      animation.visible = visible;
      if (visible) {
        scheduleSharedAnimationFrame();
      } else if (!hasVisibleAnimations()) {
        stopSharedAnimationFrame();
      }
    },
    unsubscribe: (): void => {
      activeAnimations.delete(animationId);
      if (activeAnimations.size === 0) {
        stopSharedAnimationFrame();
        document.removeEventListener(
          "visibilitychange",
          handleDocumentVisibilityChange
        );
      }
    },
  };
};

/**
 * Draws the first frame synchronously before paint (useLayoutEffect) so the
 * canvas is never visible in a blank state. Animated sprites subscribe to one
 * shared rAF clock and stop drawing while outside the viewport.
 */
export function useSpriteTicker<T extends Element>(
  animated: boolean,
  frameMs: number,
  render: (time: number) => void,
  targetRef?: React.RefObject<T | null>
): void {
  useLayoutEffect(() => {
    render(0);
  }, [render]);

  useEffect(() => {
    if (!animated) {
      return;
    }

    const subscription = subscribeToSpriteAnimation(frameMs, render);
    const target = targetRef?.current;
    let observer: IntersectionObserver | undefined;

    if (target && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.target === target) {
              subscription.setVisible(entry.isIntersecting);
              break;
            }
          }
        },
        { rootMargin: "160px", threshold: 0.01 }
      );
      observer.observe(target);
    }

    return () => {
      observer?.disconnect();
      subscription.unsubscribe();
    };
  }, [animated, frameMs, render, targetRef]);
}
