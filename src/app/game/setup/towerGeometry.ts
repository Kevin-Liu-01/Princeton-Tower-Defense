import type { Tower } from "../../types";

export const getTowerHitboxRadius = (
  tower: Tower,
  zoom: number = 1,
): number => {
  const level = tower.level;
  let baseWidth: number;
  let baseHeight: number;

  switch (tower.type) {
    case "cannon":
      baseWidth = 36 + level * 5;
      baseHeight = 24 + level * 10;
      break;
    case "lab":
    case "library":
      baseWidth = 34 + level * 5;
      baseHeight = 30 + level * 10;
      break;
    case "arch":
      baseWidth = 32 + level * 4;
      baseHeight = 28 + level * 8;
      break;
    case "club":
      baseWidth = 38 + level * 5;
      baseHeight = 32 + level * 10;
      break;
    case "station":
      baseWidth = 56 + level * 6;
      baseHeight = 40 + level * 12;
      break;
    case "mortar":
      baseWidth = 34 + level * 4;
      baseHeight = 20 + level * 8;
      break;
    default:
      baseWidth = 36 + level * 5;
      baseHeight = 24 + level * 10;
  }

  const hitboxSize = Math.max(baseWidth * 0.5, baseHeight * 0.4) * zoom;
  return Math.max(25, Math.min(hitboxSize, 60));
};
