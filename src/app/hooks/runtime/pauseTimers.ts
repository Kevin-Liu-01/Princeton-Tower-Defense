import type { MutableRefObject } from "react";
import type { PausableTimeoutEntry } from "../../game/state";

interface PauseTimerRefs {
  spawnIntervalsRef: MutableRefObject<NodeJS.Timeout[]>;
  activeTimeoutsRef: MutableRefObject<NodeJS.Timeout[]>;
  pausableTimeoutsRef: MutableRefObject<PausableTimeoutEntry[]>;
  zoomSettleTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  isZoomDebouncingRef: MutableRefObject<boolean>;
  pausableTimeoutIdCounter: MutableRefObject<number>;
  gameSpeedRef: MutableRefObject<number>;
  pausedAtRef: MutableRefObject<number | null>;
}

export function clearAllTimersImpl({
  spawnIntervalsRef,
  activeTimeoutsRef,
  pausableTimeoutsRef,
  zoomSettleTimerRef,
  isZoomDebouncingRef,
}: PauseTimerRefs): void {
  spawnIntervalsRef.current.forEach(clearInterval);
  spawnIntervalsRef.current = [];

  activeTimeoutsRef.current.forEach(clearTimeout);
  activeTimeoutsRef.current = [];

  pausableTimeoutsRef.current.forEach((entry) => {
    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }
  });
  pausableTimeoutsRef.current = [];

  if (zoomSettleTimerRef.current) {
    clearTimeout(zoomSettleTimerRef.current);
    zoomSettleTimerRef.current = null;
  }
  isZoomDebouncingRef.current = false;
}

export function setPausableTimeoutImpl(
  refs: PauseTimerRefs,
  callback: () => void,
  delay: number,
): number {
  const id = ++refs.pausableTimeoutIdCounter.current;
  const now = Date.now();

  const entry: PausableTimeoutEntry = {
    id,
    callback,
    remainingTime: delay,
    startedAt: now,
    timeoutId: null,
  };

  if (refs.gameSpeedRef.current === 0) {
    refs.pausableTimeoutsRef.current.push(entry);
    return id;
  }

  entry.timeoutId = setTimeout(() => {
    refs.pausableTimeoutsRef.current = refs.pausableTimeoutsRef.current.filter(
      (timeout) => timeout.id !== id,
    );
    callback();
  }, delay);

  refs.pausableTimeoutsRef.current.push(entry);
  return id;
}

export function pauseAllTimeoutsImpl(refs: PauseTimerRefs): void {
  const now = Date.now();
  refs.pausedAtRef.current = now;

  refs.pausableTimeoutsRef.current.forEach((entry) => {
    if (!entry.timeoutId) {
      return;
    }
    clearTimeout(entry.timeoutId);
    entry.timeoutId = null;
    const elapsed = now - entry.startedAt;
    entry.remainingTime = Math.max(0, entry.remainingTime - elapsed);
  });
}

export function resumeAllTimeoutsImpl(refs: PauseTimerRefs): void {
  const now = Date.now();
  refs.pausedAtRef.current = null;

  refs.pausableTimeoutsRef.current.forEach((entry) => {
    if (entry.timeoutId || entry.remainingTime <= 0) {
      return;
    }
    entry.startedAt = now;
    entry.timeoutId = setTimeout(() => {
      refs.pausableTimeoutsRef.current = refs.pausableTimeoutsRef.current.filter(
        (timeout) => timeout.id !== entry.id,
      );
      entry.callback();
    }, entry.remainingTime);
  });
}
