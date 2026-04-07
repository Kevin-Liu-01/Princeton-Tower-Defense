"use client";
import { Maximize, Minimize } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";

import { GOLD, panelGradient } from "./system/theme";

function getIsFullscreen(): boolean {
  return !!(
    document.fullscreenElement ??
    (document as unknown as Record<string, Element | null>)
      .webkitFullscreenElement
  );
}

function requestFullscreen(el: HTMLElement): Promise<void> {
  if (el.requestFullscreen) {
    return el.requestFullscreen();
  }
  const wk = el as unknown as Record<string, () => Promise<void>>;
  if (typeof wk.webkitRequestFullscreen === "function") {
    return wk.webkitRequestFullscreen();
  }
  return Promise.resolve();
}

function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }
  const wk = document as unknown as Record<string, () => Promise<void>>;
  if (typeof wk.webkitExitFullscreen === "function") {
    return wk.webkitExitFullscreen();
  }
  return Promise.resolve();
}

export const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(getIsFullscreen());
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const toggle = useCallback(() => {
    if (getIsFullscreen()) {
      exitFullscreen();
    } else {
      requestFullscreen(document.documentElement);
    }
  }, []);

  return (
    <div className="pointer-events-auto hidden sm:block">
      <button
        onClick={toggle}
        className="flex items-center justify-center px-2.5 py-1.5 rounded-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
        style={{
          background: panelGradient,
          border: `1.5px solid ${GOLD.border25}`,
          boxShadow: `0 0 12px ${GOLD.glow07}, inset 0 0 6px ${GOLD.glow04}`,
        }}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize size={13} className="text-amber-400/80" />
        ) : (
          <Maximize size={13} className="text-amber-400/80" />
        )}
      </button>
    </div>
  );
};
