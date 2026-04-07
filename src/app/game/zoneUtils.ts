export interface ZoneCenter {
  cx: number;
  cy: number;
}

export interface LandmarkZone extends ZoneCenter {
  coreR: number;
  fullR: number;
}

function isWithinRadius(
  gx: number,
  gy: number,
  cx: number,
  cy: number,
  radius: number
): boolean {
  const dx = gx - cx;
  const dy = gy - cy;
  return dx * dx + dy * dy < radius * radius;
}

export function isInSpecialTowerZone(
  gx: number,
  gy: number,
  radius: number,
  specialTowerZones: ZoneCenter[]
): boolean {
  if (specialTowerZones.length === 0) {
    return false;
  }
  return specialTowerZones.some((zone) =>
    isWithinRadius(gx, gy, zone.cx, zone.cy, radius)
  );
}

export function isInLandmarkCore(
  gx: number,
  gy: number,
  landmarkZones: LandmarkZone[]
): boolean {
  for (const zone of landmarkZones) {
    if (isWithinRadius(gx, gy, zone.cx, zone.cy, zone.coreR)) {
      return true;
    }
  }
  return false;
}

export function isInLandmarkFull(
  gx: number,
  gy: number,
  landmarkZones: LandmarkZone[]
): boolean {
  for (const zone of landmarkZones) {
    if (isWithinRadius(gx, gy, zone.cx, zone.cy, zone.fullR)) {
      return true;
    }
  }
  return false;
}
