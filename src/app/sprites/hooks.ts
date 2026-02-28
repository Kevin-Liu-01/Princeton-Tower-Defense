import { useEffect } from "react";

export function setupSpriteCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));

  // Reset transform each frame to avoid accumulated scale drift.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return ctx;
}

export function useSpriteTicker(
  animated: boolean,
  frameMs: number,
  render: (time: number) => void
): void {
  useEffect(() => {
    if (!animated) {
      render(0);
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const loop = (now: number) => {
      render((now - start) / frameMs);
      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [animated, frameMs, render]);
}

