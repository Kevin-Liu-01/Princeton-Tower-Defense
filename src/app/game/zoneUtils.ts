export interface ZoneCenter {
  cx: number;
  cy: number;
}

export interface LandmarkZone extends ZoneCenter {
  coreR: number;
  fullR: number;
}

export function isInSpecialTowerZone(
  gx: number,
  gy: number,
  radius: number,
  specialTowerZones: ZoneCenter[]
): boolean {
  if (specialTowerZones.length === 0) return false;
  return specialTowerZones.some((zone) => {
    const dx = gx - zone.cx;
    const dy = gy - zone.cy;
    return dx * dx + dy * dy < radius * radius;
  });
}

export function isInLandmarkCore(
  gx: number,
  gy: number,
  landmarkZones: LandmarkZone[]
): boolean {
  for (const zone of landmarkZones) {
    const dx = gx - zone.cx;
    const dy = gy - zone.cy;
    if (dx * dx + dy * dy < zone.coreR * zone.coreR) return true;
  }
  return false;
}

export function isInLandmarkFull(
  gx: number,
  gy: number,
  landmarkZones: LandmarkZone[]
): boolean {
  for (const zone of landmarkZones) {
    const dx = gx - zone.cx;
    const dy = gy - zone.cy;
    if (dx * dx + dy * dy < zone.fullR * zone.fullR) return true;
  }
  return false;
}
