"use client";
import React, { useState, useEffect, useCallback } from "react";

import { useSettings } from "../../../hooks/useSettings";
import { formatDuration } from "../../menus/shared/menuMath";

interface GameTimerProps {
  levelStartTime: number;
  totalPausedTimeRef: React.RefObject<number>;
  gameSpeed: number;
}

function computeElapsed(
  levelStartTime: number,
  totalPausedTime: number
): number {
  if (levelStartTime <= 0) {
    return 0;
  }
  return Math.max(
    0,
    Math.floor((Date.now() - levelStartTime - totalPausedTime) / 1000)
  );
}

export const GameTimer: React.FC<GameTimerProps> = ({
  levelStartTime,
  totalPausedTimeRef,
  gameSpeed,
}) => {
  const { settings } = useSettings();
  const [elapsed, setElapsed] = useState(0);

  const tick = useCallback(() => {
    setElapsed(computeElapsed(levelStartTime, totalPausedTimeRef.current));
  }, [levelStartTime, totalPausedTimeRef]);

  useEffect(() => {
    if (!settings.ui.showGameTimer || levelStartTime <= 0) {
      return;
    }
    tick();
    if (gameSpeed === 0) {
      return;
    }
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [settings.ui.showGameTimer, levelStartTime, gameSpeed, tick]);

  if (!settings.ui.showGameTimer || levelStartTime <= 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 flex justify-center"
      style={{ top: "100%" }}
    >
      <span
        className="inline-block mt-2.5 rounded-md px-3 py-0.5 text-[11px] font-semibold tabular-nums tracking-wide text-amber-200/80"
        style={{
          backdropFilter: "blur(4px)",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.3))",
        }}
      >
        {formatDuration(elapsed)}
      </span>
    </div>
  );
};
