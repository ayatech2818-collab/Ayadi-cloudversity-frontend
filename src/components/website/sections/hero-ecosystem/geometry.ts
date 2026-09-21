/*
 * Geometry for the hero's 3D ecosystem.
 *
 * Everything is measured in scene units. The stage is 640 units wide at every
 * breakpoint and `--u` (see ecosystem.module.css) converts one unit to pixels
 * from the stage's own container width — so the scene scales with its column
 * in pure CSS, and the numbers in these files stay readable.
 *
 * Axes are CSS's own: x right, y down, z toward the viewer. The rotation
 * helpers reproduce CSS's rotateX/Y/Z matrices exactly, so a point computed
 * here lands where the browser draws the element that shares its transform.
 */

import type { CSSProperties } from 'react';

export type Vec3 = readonly [number, number, number];

/* Every computed number is rounded before it reaches an inline style. The
   server and the browser run different Math.sin/cos implementations, and an
   unrounded last digit would be a hydration mismatch. */
export const r = (n: number, places = 2) => {
  const factor = 10 ** places;
  return Math.round(n * factor) / factor;
};

/** Scene units → a CSS length. */
export const u = (n: number) => `calc(var(--u) * ${r(n)})`;

export const translate3d = ([x, y, z]: Vec3) => `translate3d(${u(x)}, ${u(y)}, ${u(z)})`;

const RAD = Math.PI / 180;

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (a: Vec3) => scale(a, 1 / Math.sqrt(dot(a, a)));

export const rotateX = ([x, y, z]: Vec3, deg: number): Vec3 => {
  const c = Math.cos(deg * RAD);
  const s = Math.sin(deg * RAD);
  return [x, y * c - z * s, y * s + z * c];
};

export const rotateY = ([x, y, z]: Vec3, deg: number): Vec3 => {
  const c = Math.cos(deg * RAD);
  const s = Math.sin(deg * RAD);
  return [x * c + z * s, y, -x * s + z * c];
};

export const rotateZ = ([x, y, z]: Vec3, deg: number): Vec3 => {
  const c = Math.cos(deg * RAD);
  const s = Math.sin(deg * RAD);
  return [x * c - y * s, x * s + y * c, z];
};

/* ---------- the two compositions ----------
   `wide` is the diagonal from sm up: Cloudversity high on the left, Ayatech low
   on the right, the core pushed forward and off the diagonal so the connection
   bends through it rather than running straight. `compact` is the phone:
   the worlds side by side with the core arched above them — a different
   picture, not the wide one shrunk. Retune the composition here. */
export type LayoutName = 'wide' | 'compact';

export type Layout = {
  cloudversity: Vec3;
  core: Vec3;
  ayatech: Vec3;
  /** Uniform scale on both worlds. */
  worldScale: number;
  coreScale: number;
};

export const LAYOUTS: Record<LayoutName, Layout> = {
  wide: {
    cloudversity: [-148, -112, 0],
    core: [48, -34, 110],
    ayatech: [150, 118, 24],
    worldScale: 0.9,
    coreScale: 1,
  },
  compact: {
    cloudversity: [-166, 56, 0],
    core: [0, -138, 70],
    ayatech: [166, 66, 10],
    worldScale: 0.84,
    coreScale: 0.9,
  },
};

/** The camera looks down on the scene by this much before the pointer adds to it. */
export const BASE_TILT_X = -18;


/* ---------- the connection ----------
   Three points always share a plane, and exactly one circle runs through
   them. So the connection is that circle's arc: from Cloudversity, through the
   core, to Ayatech — a genuinely 3D curve, drawn flat inside a plane that is
   itself oriented in the scene. */
export type Arc = {
  /** Circle centre, scene units. */
  center: Vec3;
  radius: number;
  /** Orients the plane: local x → toward Cloudversity, local z → the plane normal. */
  matrix: string;
  /** Degrees from Cloudversity (0°) through the core to Ayatech. Signed. */
  sweep: number;
  /** Where the core sits along the chord from start to end, 0–1. Gradient stop. */
  coreOnChord: number;
  start: [number, number];
  end: [number, number];
};

export function arcThrough(from: Vec3, via: Vec3, to: Vec3): Arc {
  const p = sub(from, to);
  const q = sub(via, to);
  const pq = cross(p, q);
  const center = add(to, scale(cross(sub(scale(q, dot(p, p)), scale(p, dot(q, q))), pq), 1 / (2 * dot(pq, pq))));

  const e1 = normalize(sub(from, center));
  const normal = normalize(cross(sub(from, center), sub(via, center)));
  const e2 = cross(normal, e1);

  const angleOf = (point: Vec3) => {
    const local = sub(point, center);
    return Math.atan2(dot(local, e2), dot(local, e1)) / RAD;
  };

  /* The normal was taken from→via, so the core is always at a positive angle.
     If Ayatech comes round before it, the arc has to go the other way. */
  const coreAngle = angleOf(via);
  const endAngle = (angleOf(to) + 360) % 360;
  const sweep = endAngle > coreAngle ? endAngle : endAngle - 360;

  const radius = Math.sqrt(dot(sub(from, center), sub(from, center)));
  const start: [number, number] = [r(radius), 0];
  const end: [number, number] = [r(radius * Math.cos(sweep * RAD)), r(radius * Math.sin(sweep * RAD))];
  const coreLocal: [number, number] = [radius * Math.cos(coreAngle * RAD), radius * Math.sin(coreAngle * RAD)];

  const chord = [end[0] - start[0], end[1] - start[1]];
  const coreOnChord =
    ((coreLocal[0] - start[0]) * chord[0] + (coreLocal[1] - start[1]) * chord[1]) /
    (chord[0] * chord[0] + chord[1] * chord[1]);

  const column = (v: Vec3) => v.map((n) => r(n, 4)).join(', ');

  return {
    center: [r(center[0]), r(center[1]), r(center[2])],
    radius: r(radius),
    matrix: `matrix3d(${column(e1)}, 0, ${column(e2)}, 0, ${column(normal)}, 0, 0, 0, 0, 1)`,
    sweep: r(sweep),
    coreOnChord: r(Math.min(Math.max(coreOnChord, 0.1), 0.9)),
    start,
    end,
  };
}

export const ARCS: Record<LayoutName, Arc> = {
  wide: arcThrough(LAYOUTS.wide.cloudversity, LAYOUTS.wide.core, LAYOUTS.wide.ayatech),
  compact: arcThrough(LAYOUTS.compact.cloudversity, LAYOUTS.compact.core, LAYOUTS.compact.ayatech),
};

/** Inline custom properties that place an anchor in both compositions; the stylesheet picks one per breakpoint. */
export function anchorVars(wide: Vec3, compact: Vec3, wideScale = 1, compactScale = 1) {
  return {
    '--wx': r(wide[0]),
    '--wy': r(wide[1]),
    '--wz': r(wide[2]),
    '--ws': wideScale,
    '--cx': r(compact[0]),
    '--cy': r(compact[1]),
    '--cz': r(compact[2]),
    '--cs': compactScale,
  } as CSSProperties;
}
