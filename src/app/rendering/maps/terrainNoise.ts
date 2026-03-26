function noiseHash(px: number, py: number, seed: number): number {
  let h = (px * 374761393 + py * 668265263 + seed * 1013904223) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

export function valueNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sfx = fx * fx * (3 - 2 * fx);
  const sfy = fy * fy * (3 - 2 * fy);

  const v00 = noiseHash(ix, iy, seed);
  const v10 = noiseHash(ix + 1, iy, seed);
  const v01 = noiseHash(ix, iy + 1, seed);
  const v11 = noiseHash(ix + 1, iy + 1, seed);

  return (
    v00 * (1 - sfx) * (1 - sfy) +
    v10 * sfx * (1 - sfy) +
    v01 * (1 - sfx) * sfy +
    v11 * sfx * sfy
  );
}

export function fbmNoise(
  x: number,
  y: number,
  seed: number,
  octaves: number,
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let totalAmp = 0;
  for (let i = 0; i < octaves; i++) {
    value +=
      valueNoise(x * frequency, y * frequency, seed + i * 31) * amplitude;
    totalAmp += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / totalAmp;
}

export function domainWarpedNoise(
  x: number,
  y: number,
  seed: number,
  octaves: number,
  warpStrength: number,
): number {
  const wx =
    fbmNoise(x + 5.2, y + 1.3, seed + 100, octaves) * warpStrength;
  const wy =
    fbmNoise(x + 8.7, y + 2.8, seed + 200, octaves) * warpStrength;
  return fbmNoise(x + wx, y + wy, seed, octaves);
}

export function ridgedNoise(
  x: number,
  y: number,
  seed: number,
  octaves: number,
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let totalAmp = 0;
  for (let i = 0; i < octaves; i++) {
    const n = valueNoise(x * frequency, y * frequency, seed + i * 31);
    value += (1 - Math.abs(n * 2 - 1)) * amplitude;
    totalAmp += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / totalAmp;
}
