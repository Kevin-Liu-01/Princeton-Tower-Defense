import { TILE_SIZE } from "../../constants";
import type { MapHazard, Position } from "../../types";
import { gridToWorld } from "../../utils";
import type { HazardData, IceSpikeCycleState } from "./types";

function getIceSpikeCycleState(
  pos: Position,
  timeSeconds: number
): IceSpikeCycleState {
  const seed = (pos.x || 0) * 47.3 + (pos.y || 0) * 21.9;
  const cycleDuration = 2.6;
  const phaseOffset =
    (((seed * 0.071) % cycleDuration) + cycleDuration) % cycleDuration;
  const phase = (timeSeconds + phaseOffset) % cycleDuration;

  if (phase < 0.45) {
    const wobble = 0.08 + Math.sin((phase / 0.45) * Math.PI * 2) * 0.03;
    return { active: false, burst: false, extend: Math.max(0.04, wobble) };
  }
  if (phase < 0.68) {
    const progress = (phase - 0.45) / 0.23;
    return { active: true, burst: true, extend: 0.14 + progress * 0.86 };
  }
  if (phase < 1.25) {
    const progress = (phase - 0.68) / 0.57;
    return {
      active: true,
      burst: false,
      extend: 0.94 + Math.sin(progress * Math.PI * 2) * 0.06,
    };
  }
  if (phase < 1.55) {
    const progress = (phase - 1.25) / 0.3;
    return { active: true, burst: false, extend: 1 - progress * 0.92 };
  }

  return { active: false, burst: false, extend: 0.05 };
}

export function prepareHazardData(
  hazards: MapHazard[],
  timeSeconds: number
): HazardData[] {
  return hazards.map((hazard) => {
    const data: HazardData = {
      ...hazard,
      radius: (hazard.radius || 2) * TILE_SIZE,
      worldPos: gridToWorld(hazard.pos!),
    };

    if (
      (hazard.type === "ice_spikes" || hazard.type === "spikes") &&
      hazard.pos
    ) {
      data.iceSpikeCycle = getIceSpikeCycleState(hazard.pos, timeSeconds);
      data.particleBudget = data.iceSpikeCycle.burst
        ? 2
        : data.iceSpikeCycle.active
          ? 1
          : 0;
    }

    return data;
  });
}
