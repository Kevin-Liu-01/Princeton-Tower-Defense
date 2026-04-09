/**
 * Creates a seeded LCG pseudo-random number generator.
 * Returns a function that produces the next random value in [0, 1) on each call.
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1_103_515_245 + 12_345) & 0x7F_FF_FF_FF;
    return state / 0x7F_FF_FF_FF;
  };
}
