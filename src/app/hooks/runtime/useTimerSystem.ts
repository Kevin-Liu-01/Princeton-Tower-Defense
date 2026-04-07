import { useRef, useCallback, useMemo } from "react";
import type { MutableRefObject } from "react";

import type { PausableTimeoutEntry } from "../../game/state";
import {
  clearAllTimersImpl,
  pauseAllTimeoutsImpl,
  resumeAllTimeoutsImpl,
  setPausableTimeoutImpl,
} from "./pauseTimers";

export interface TimerSystemReturn {
  clearAllTimers: () => void;
  setPausableTimeout: (callback: () => void, delay: number) => number;
  pauseAllTimeouts: () => void;
  resumeAllTimeouts: () => void;
  spawnIntervalsRef: MutableRefObject<NodeJS.Timeout[]>;
  activeTimeoutsRef: MutableRefObject<NodeJS.Timeout[]>;
  pausableTimeoutsRef: MutableRefObject<PausableTimeoutEntry[]>;
  gameSpeedRef: MutableRefObject<number>;
  pausedAtRef: MutableRefObject<number | null>;
  totalPausedTimeRef: MutableRefObject<number>;
  pausableTimeoutIdCounter: MutableRefObject<number>;
  zoomSettleTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  isZoomDebouncingRef: MutableRefObject<boolean>;
}

export function useTimerSystem(gameSpeed: number): TimerSystemReturn {
  const spawnIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const gameSpeedRef = useRef(gameSpeed);
  gameSpeedRef.current = gameSpeed;
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  const pausableTimeoutsRef = useRef<PausableTimeoutEntry[]>([]);
  const pausableTimeoutIdCounter = useRef(0);
  const zoomSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isZoomDebouncingRef = useRef(false);

  const timerRefs = useMemo(
    () => ({
      activeTimeoutsRef,
      gameSpeedRef,
      isZoomDebouncingRef,
      pausableTimeoutIdCounter,
      pausableTimeoutsRef,
      pausedAtRef,
      spawnIntervalsRef,
      zoomSettleTimerRef,
    }),
    []
  );

  const clearAllTimers = useCallback(
    () => clearAllTimersImpl(timerRefs),
    [timerRefs]
  );
  const setPausableTimeout = useCallback(
    (callback: () => void, delay: number) =>
      setPausableTimeoutImpl(timerRefs, callback, delay),
    [timerRefs]
  );
  const pauseAllTimeouts = useCallback(
    () => pauseAllTimeoutsImpl(timerRefs),
    [timerRefs]
  );
  const resumeAllTimeouts = useCallback(
    () => resumeAllTimeoutsImpl(timerRefs),
    [timerRefs]
  );

  return {
    activeTimeoutsRef,
    clearAllTimers,
    gameSpeedRef,
    isZoomDebouncingRef,
    pausableTimeoutIdCounter,
    pausableTimeoutsRef,
    pauseAllTimeouts,
    pausedAtRef,
    resumeAllTimeouts,
    setPausableTimeout,
    spawnIntervalsRef,
    totalPausedTimeRef,
    zoomSettleTimerRef,
  };
}
