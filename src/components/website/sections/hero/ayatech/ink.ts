/*
 * AyaTech's light. The world is drawn in five inks on near-black, and three
 * of them carry meaning all the way through: emerald is learning, blue is
 * building, cyan is delivering. Mint and white are the signal itself.
 */
export const INK = {
  emerald: '52, 211, 153',
  mint: '167, 243, 208',
  blue: '96, 165, 250',
  cyan: '103, 232, 249',
  white: '236, 253, 245',
} as const;

export type Tint = keyof typeof INK;

/** An ink at a strength, as a canvas colour. */
export function ink(tint: Tint, alpha: number) {
  const strength = alpha <= 0 ? 0 : alpha >= 1 ? 1 : Math.round(alpha * 1000) / 1000;
  return `rgba(${INK[tint]}, ${strength})`;
}
