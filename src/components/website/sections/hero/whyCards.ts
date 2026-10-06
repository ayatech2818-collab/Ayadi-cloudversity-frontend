/*
 * The three Why Choose Ayadi cards as things in the portal's space rather
 * than as a list on a page: which side of the portal each one comes through,
 * how deep in front of the glass it settles, and the small differences that
 * keep the three from arriving identically.
 *
 * Shared by the page (WhyStage.tsx — how each card moves as it comes through)
 * and the scene (scene/why.ts — where each one sits, and its ripple), so the
 * two cannot disagree. Plain numbers: nothing here pulls three.js into the
 * page's own bundle.
 */
export type WhyEntrance = {
  /** The side it comes through: -1 the left, 1 the right. */
  side: -1 | 1;
  /** How far in front of the portal's glass it settles, in world units on a
      wide screen (taller ones scale it with the camera's distance). The camera
      passes each card as it reaches that depth — nearest first. */
  depth: number;
  /** Where it sits on screen at the moment the first card arrives, as
      fractions of the half-width and half-height from the centre (y up) — on
      a wide screen, where the cards flank the heading, and on a tall one,
      where they stack beneath it. */
  wide: readonly [number, number];
  tall: readonly [number, number];
  /** Degrees it is still hinged round its outer edge, and rolled, as it
      starts to come through. */
  hinge: number;
  roll: number;
  /** How far it rides up (+) or down (−) on the way, as a share of its height. */
  lift: number;
  /** Its ripple: size against the card's height, and how many rings cross it. */
  ripple: number;
  rings: number;
};

export const WHY_ENTRANCES: readonly WhyEntrance[] = [
  /* Expert Instructors — from the left, and nearest. */
  { side: -1, depth: 3.2, wide: [-0.5, 0.02], tall: [-0.04, 0.3], hinge: 24, roll: -2.2, lift: 0.06, ripple: 1, rings: 15 },
  /* Best-in-Class Program — from the right, a little deeper. */
  { side: 1, depth: 2.85, wide: [0.5, -0.2], tall: [0.04, -0.02], hinge: 29, roll: 1.6, lift: -0.05, ripple: 1.16, rings: 18 },
  /* Flexible Learning — from the left again, deeper still. */
  { side: -1, depth: 2.5, wide: [-0.4, -0.46], tall: [-0.03, -0.34], hinge: 20, roll: 2.6, lift: 0.08, ripple: 0.9, rings: 13 },
];
