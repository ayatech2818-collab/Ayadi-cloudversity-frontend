import { BASE_DIST, type Metrics } from '../layout';
import { clamp01 } from '../math';
import type { AyatechRig } from '../rig';

/*
 * The scene's camera: a few lines of perspective, by hand. It circles a
 * point (`lift` high), `dist` back from it, turned by `yaw` and looking down
 * by `pitch` — the numbers the score moves. That is all the 3D this world
 * needs, and it costs a 2D canvas nothing.
 */
export type Camera = {
  width: number;
  height: number;
  /** Where the point it looks at lands on the stage. */
  cx: number;
  cy: number;
  /** Pixels to a world unit at BASE_DIST, and at a depth of 1. */
  unit: number;
  focal: number;
  dist: number;
  lift: number;
  cosY: number;
  sinY: number;
  cosP: number;
  sinP: number;
};

/** A world point on the stage: where, how big a unit is there, and how deep. */
export type Spot = { x: number; y: number; s: number; depth: number; ok: boolean };

export const spot = (): Spot => ({ x: 0, y: 0, s: 0, depth: 0, ok: false });

/** Nearer than this it is behind the lens, or as good as. */
const NEAR = 0.6;

export function createCamera(): Camera {
  return { width: 1, height: 1, cx: 0, cy: 0, unit: 1, focal: BASE_DIST, dist: BASE_DIST, lift: 0, cosY: 1, sinY: 0, cosP: 1, sinP: 0 };
}

/** Points the camera where the rig says, with a little sway on top. */
export function aim(camera: Camera, rig: AyatechRig, metrics: Metrics, swayX: number, swayY: number) {
  const yaw = rig.yaw + swayX;
  const pitch = rig.pitch + swayY;

  camera.width = metrics.width;
  camera.height = metrics.height;
  camera.unit = metrics.unit;
  camera.focal = metrics.unit * BASE_DIST;
  camera.cx = metrics.cx + metrics.aside * rig.aside;
  camera.cy = metrics.cy;
  camera.dist = Math.max(rig.dist, NEAR * 2);
  camera.lift = rig.lift;
  camera.cosY = Math.cos(yaw);
  camera.sinY = Math.sin(yaw);
  camera.cosP = Math.cos(pitch);
  camera.sinP = Math.sin(pitch);
}

/** Writes a world point's place on the stage into `out`, and returns it. */
export function project(camera: Camera, x: number, y: number, z: number, out: Spot): Spot {
  const up = y - camera.lift;
  const across = x * camera.cosY - z * camera.sinY;
  const away = x * camera.sinY + z * camera.cosY;
  /* Looking down: far ground rises up the stage, and height comes nearer. */
  const rise = up * camera.cosP + away * camera.sinP;
  const depth = camera.dist - up * camera.sinP + away * camera.cosP;

  out.depth = depth;
  out.ok = depth > NEAR;
  out.s = camera.focal / Math.max(depth, NEAR);
  out.x = camera.cx + across * out.s;
  out.y = camera.cy - rise * out.s;
  return out;
}

/** How much of a thing survives its distance: 1 at the point looked at and
    nearer, thinning out behind it. */
export function fog(camera: Camera, depth: number) {
  return 1 - 0.8 * clamp01((depth - camera.dist) / 14);
}

/** Whether a stage point is worth drawing, `margin` pixels past the edge included. */
export function onStage(camera: Camera, x: number, y: number, margin: number) {
  return x > -margin && x < camera.width + margin && y > -margin && y < camera.height + margin;
}
