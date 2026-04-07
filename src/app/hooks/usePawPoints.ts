import { useCallback, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type PawPointsSetter = Dispatch<SetStateAction<number>>;

const normalizePawPointsValue = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
};

export interface PawPointsState {
  pawPoints: number;
  setPawPoints: PawPointsSetter;
  canAfford: (amount: number) => boolean;
  addPawPoints: (amount: number) => void;
  removePawPoints: (amount: number) => void;
  spendPawPoints: (amount: number) => boolean;
  resetPawPoints: (amount: number) => void;
}

export function usePawPoints(initialPawPoints: number): PawPointsState {
  const [pawPointsRaw, setPawPointsRaw] = useState<number>(() =>
    normalizePawPointsValue(initialPawPoints)
  );

  const setPawPoints = useCallback<PawPointsSetter>((next) => {
    setPawPointsRaw((prev) => {
      const normalizedPrev = normalizePawPointsValue(prev);
      const resolvedValue =
        typeof next === "function"
          ? (next as (prevState: number) => number)(normalizedPrev)
          : next;
      return normalizePawPointsValue(resolvedValue);
    });
  }, []);

  const canAfford = useCallback(
    (amount: number): boolean =>
      pawPointsRaw >= normalizePawPointsValue(amount),
    [pawPointsRaw]
  );

  const addPawPoints = useCallback(
    (amount: number) => {
      const normalizedAmount = normalizePawPointsValue(amount);
      if (normalizedAmount <= 0) {
        return;
      }
      setPawPoints((current) => current + normalizedAmount);
    },
    [setPawPoints]
  );

  const removePawPoints = useCallback(
    (amount: number) => {
      const normalizedAmount = normalizePawPointsValue(amount);
      if (normalizedAmount <= 0) {
        return;
      }
      setPawPoints((current) => current - normalizedAmount);
    },
    [setPawPoints]
  );

  const spendPawPoints = useCallback(
    (amount: number): boolean => {
      const normalizedAmount = normalizePawPointsValue(amount);
      if (normalizedAmount <= 0) {
        return true;
      }
      if (pawPointsRaw < normalizedAmount) {
        return false;
      }
      setPawPoints((current) => current - normalizedAmount);
      return true;
    },
    [pawPointsRaw, setPawPoints]
  );

  const resetPawPoints = useCallback(
    (amount: number) => {
      setPawPoints(amount);
    },
    [setPawPoints]
  );

  const pawPoints = useMemo(
    () => normalizePawPointsValue(pawPointsRaw),
    [pawPointsRaw]
  );

  return {
    addPawPoints,
    canAfford,
    pawPoints,
    removePawPoints,
    resetPawPoints,
    setPawPoints,
    spendPawPoints,
  };
}
