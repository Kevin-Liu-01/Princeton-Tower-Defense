"use client";

import { useEffect, useRef, useState } from "react";
import {
  getPerformanceSettings,
  setPerformanceSettings,
} from "../../../rendering/performance";

export function useAutoPerformanceMode() {
  const [performanceMode, setPerformanceMode] = useState(() => {
    const settings = getPerformanceSettings();
    return settings.disableShadows;
  });
  const [currentFps, setCurrentFps] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const autoToggleCooldownRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const measureFps = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift();
      }

      if (
        frameTimesRef.current.length >= 15 &&
        frameTimesRef.current.length % 15 === 0
      ) {
        const avgFrameTime =
          frameTimesRef.current.reduce((a, b) => a + b, 0) /
          frameTimesRef.current.length;
        const fps = Math.round(1000 / avgFrameTime);
        setCurrentFps(fps);

        if (fps < 45 && !performanceMode && autoToggleCooldownRef.current <= 0) {
          setPerformanceMode(true);
          setPerformanceSettings({
            disableShadows: true,
            reducedParticles: true,
            simplifiedGradients: true,
            reducedFogQuality: true,
          });
          autoToggleCooldownRef.current = 10000;
        }

        if (autoToggleCooldownRef.current > 0) {
          autoToggleCooldownRef.current -= avgFrameTime * 15;
        }
      }

      animationFrameId = requestAnimationFrame(measureFps);
    };

    animationFrameId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animationFrameId);
  }, [performanceMode]);

  const togglePerformanceMode = () => {
    const nextMode = !performanceMode;
    setPerformanceMode(nextMode);
    setPerformanceSettings({
      disableShadows: nextMode,
      reducedParticles: nextMode,
      simplifiedGradients: nextMode,
      reducedFogQuality: nextMode,
    });
    autoToggleCooldownRef.current = 5000;
  };

  return {
    performanceMode,
    currentFps,
    togglePerformanceMode,
  };
}
