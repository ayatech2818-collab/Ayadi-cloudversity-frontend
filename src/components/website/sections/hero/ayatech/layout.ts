import { DOMAINS, type DomainId } from './content';
import type { Vec3 } from './math';

/*
 * Where things stand in AyaTech's world, in world units: y is up, +z is away
 * from the camera, and the signal is the origin.
 *
 * Two arrangements of the same world — one for a wide stage, one for a tall
 * one — so a phone gets the same story composed for its own frame rather
 * than a wide one shrunk to fit. Everything the scene draws and everything
 * the timeline aims the camera at is measured from here.
 */

/** The distance the stage's `span` is measured at. */
export const BASE_DIST = 10;

/** The six disciplines round the experiment's ring, in the order they are built. */
export const RING: readonly DomainId[] = ['code', 'systems', 'ai', 'data', 'cloud', 'automation'];

/** And the five that become layers, top to bottom (content.ts LAYERS names them). */
export const STACK: readonly DomainId[] = ['code', 'systems', 'ai', 'data', 'cloud'];

export type Layout = {
  compact: boolean;
  /** World units that have to fit across and down the stage at BASE_DIST. */
  span: readonly [number, number];
  /** Where the scene's centre sits down the stage, as a share of its height. */
  centerY: number;
  /** How far the scene steps aside for the copy, as a share of the width. */
  aside: number;
  /** Every camera distance in the score, scaled: a tall frame stands closer. */
  near: number;

  field: Record<DomainId, Vec3>;
  /** Points past the named domains where the field is still forming, and the
      domain each is reaching for (an index into DOMAINS). */
  frontier: readonly { at: Vec3; toward: number }[];

  /** The experiment's ring: its radius, and how much wider than tall. */
  ring: number;
  ringStretch: number;

  plate: { halfWidth: number; halfDepth: number; gap: number; rail: number };
  /** Layer names beside the stack, or over each layer where there is no room beside. */
  labels: 'side' | 'above';

  /** The ground the finished system stands on, and the plots round it (x, z). */
  ground: number;
  plots: readonly (readonly [number, number])[];
  plot: readonly [number, number];
  mapDist: number;

  /** The three arcs round the name. */
  orbit: number;

  /** Half the box the dust is scattered through. */
  dust: Vec3;
};

/* The nearest named domain to a point, as an index into DOMAINS. */
function nearest(field: Record<DomainId, Vec3>, point: Vec3) {
  let best = 0;
  let least = Infinity;
  DOMAINS.forEach(({ id }, index) => {
    const [x, y, z] = field[id];
    const gap = (x - point[0]) ** 2 + (y - point[1]) ** 2 + (z - point[2]) ** 2;
    if (gap < least) {
      least = gap;
      best = index;
    }
  });
  return best;
}

/* A loose shell round the field: `across` and `up` are its half-extents. */
function frontier(field: Record<DomainId, Vec3>, across: number, up: number) {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = index * 0.628 + 0.3;
    const at: Vec3 = [Math.cos(angle) * across, Math.sin(angle) * up, ((index % 3) - 1) * 2.2];
    return { at, toward: nearest(field, at) };
  });
}

const WIDE_FIELD: Record<DomainId, Vec3> = {
  ai: [-1.1, 1.55, -0.6],
  code: [-3.6, 0.75, 0.9],
  data: [-1.9, -1.45, -1.4],
  cloud: [2.0, 1.35, 1.2],
  automation: [3.9, -0.15, -0.9],
  systems: [1.1, -1.5, 0.4],
  emerging: [4.6, 1.75, 2.2],
};

export const WIDE: Layout = {
  compact: false,
  span: [13, 6.6],
  centerY: 0.45,
  aside: 0.12,
  near: 1,
  field: WIDE_FIELD,
  frontier: frontier(WIDE_FIELD, 5.9, 2.9),
  ring: 1.9,
  ringStretch: 1.18,
  plate: { halfWidth: 1.7, halfDepth: 1.1, gap: 1, rail: 0.95 },
  labels: 'side',
  ground: -0.62,
  plots: [
    [-5.2, -1.8],
    [5, -2.4],
    [-4.4, 3.4],
    [4.6, 3],
    [0.4, -5.4],
  ],
  plot: [1.5, 1],
  mapDist: 19,
  orbit: 2.4,
  dust: [10, 5.5, 9],
};

const COMPACT_FIELD: Record<DomainId, Vec3> = {
  ai: [-1.3, 1.6, -0.6],
  code: [-1.9, 0.35, 0.9],
  data: [-1.4, -1.1, -1.2],
  cloud: [1.5, 1.35, 1],
  automation: [1.9, -0.15, -0.8],
  systems: [1.05, -1.3, 0.4],
  emerging: [0.1, 2.45, 2],
};

export const COMPACT: Layout = {
  compact: true,
  span: [6.2, 9.5],
  centerY: 0.31,
  aside: 0,
  near: 0.88,
  field: COMPACT_FIELD,
  frontier: frontier(COMPACT_FIELD, 2.7, 3),
  ring: 1.55,
  ringStretch: 1,
  plate: { halfWidth: 1.25, halfDepth: 0.85, gap: 0.9, rail: 0.7 },
  labels: 'above',
  ground: -0.62,
  plots: [
    [-1.9, -4.4],
    [2.5, -4.8],
    [-2.7, 2.8],
    [2.6, 3.2],
  ],
  plot: [1, 0.7],
  mapDist: 18,
  orbit: 2.05,
  dust: [6, 8, 9],
};

/* ---------- places that follow from the layout ---------- */

/** A discipline's place on the experiment's ring: `index` into RING, from the top, clockwise. */
export function ringSpot(layout: Layout, index: number): Vec3 {
  const angle = Math.PI / 2 - (index * Math.PI) / 3;
  return [
    Math.cos(angle) * layout.ring * layout.ringStretch,
    Math.sin(angle) * layout.ring,
    index % 2 ? 0.35 : -0.35,
  ];
}

/** How high a layer sits: 0 is the top one, 4 the bottom, -1 the empty one
    above them all. `squeeze` closes the stack up (1 open → the slab). */
export function levelY(layout: Layout, layer: number, squeeze: number) {
  return (2 - layer) * layout.plate.gap * squeeze;
}

/* ---------- the stage, measured ---------- */

export type Metrics = {
  width: number;
  height: number;
  /** Pixels to a world unit at BASE_DIST. */
  unit: number;
  /** The scene's centre before it steps aside, and how far aside is. */
  cx: number;
  cy: number;
  aside: number;
};

export function measure(layout: Layout, width: number, height: number): Metrics {
  return {
    width,
    height,
    unit: Math.max(1, Math.min(width / layout.span[0], height / layout.span[1])),
    cx: width / 2,
    cy: height * layout.centerY,
    aside: width * layout.aside,
  };
}
