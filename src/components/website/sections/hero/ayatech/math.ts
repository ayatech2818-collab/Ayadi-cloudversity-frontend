export type Vec3 = readonly [number, number, number];

export const TAU = Math.PI * 2;

export const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

export const clamp = (value: number, low: number, high: number) => (value < low ? low : value > high ? high : value);

export const lerp = (from: number, to: number, share: number) => from + (to - from) * share;

/** Eases both ends of a 0 → 1. */
export function smooth(value: number) {
  const share = clamp01(value);
  return share * share * (3 - 2 * share);
}

/** Fast out of the gate, settling at 1. */
export function easeOut(value: number) {
  const left = 1 - clamp01(value);
  return 1 - left * left * left;
}

export const fract = (value: number) => value - Math.floor(value);

/**
 * One item's own 0 → 1 inside a shared one: `count` items take their turns
 * across it, each for `span` of the whole, the first starting at 0 and the
 * last ending at 1.
 */
export function seq(progress: number, index: number, count: number, span = 0.5) {
  const start = count > 1 ? ((1 - span) * index) / (count - 1) : 0;
  return clamp01((progress - start) / span);
}

/** The same numbers every visit: the scene is scattered once, identically. */
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
