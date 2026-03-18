import type { Position } from "../../types";

export const getFormationOffsets = (count: number): Position[] => {
  if (count === 1) {
    return [{ x: 0, y: 0 }];
  }

  if (count === 2) {
    return [
      { x: -22, y: -12 },
      { x: 22, y: 12 },
    ];
  }

  return [
    { x: 0, y: -28 },
    { x: -28, y: 18 },
    { x: 28, y: 18 },
  ];
};
