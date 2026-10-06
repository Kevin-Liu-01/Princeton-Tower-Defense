export interface DeviceSignals {
  coarsePointer: boolean;
  narrowScreen: boolean;
  cores?: number;
  memoryGb?: number;
}

export function needsMobileBudget(signals: DeviceSignals): boolean {
  return (
    signals.coarsePointer ||
    signals.narrowScreen ||
    (signals.cores !== undefined && signals.cores <= 4) ||
    (signals.memoryGb !== undefined && signals.memoryGb <= 4)
  );
}

let mobileBudget: boolean | undefined;

/** Cache capabilities outside the drawing loop; SSR never poisons the cache. */
export function usesMobileRenderBudget(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (mobileBudget === undefined) {
    const hardware = navigator as Navigator & { deviceMemory?: number };
    mobileBudget = needsMobileBudget({
      coarsePointer: window.matchMedia?.("(pointer: coarse)").matches ?? false,
      narrowScreen: window.innerWidth < 768,
      cores: hardware.hardwareConcurrency,
      memoryGb: hardware.deviceMemory,
    });
  }
  return mobileBudget;
}

export function getBattleResolutionCap(
  desktopCap: number,
  mobile: boolean
): number {
  if (!mobile) {
    return desktopCap;
  }
  if (desktopCap >= 2) {
    return 1.5;
  }
  return desktopCap >= 1.75 ? 1.25 : 1;
}

/** Keep 90/120Hz phones from doing two full simulations per 60Hz game frame. */
export function createFramePacer(maxFps: number) {
  const interval = 1000 / maxFps;
  let nextFrame = 0;
  return {
    reset() {
      nextFrame = 0;
    },
    shouldDraw(timestamp: number): boolean {
      if (timestamp + 0.5 < nextFrame) {
        return false;
      }
      nextFrame =
        nextFrame > 0
          ? nextFrame +
            Math.max(
              1,
              Math.floor((timestamp - nextFrame + 0.5) / interval) + 1
            ) *
              interval
          : timestamp + interval;
      return true;
    },
  };
}
