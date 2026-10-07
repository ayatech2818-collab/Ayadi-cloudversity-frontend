import { DOMAINS } from '../content';
import { levelY, RING, ringSpot, STACK, type Layout } from '../layout';
import { easeOut, lerp, seq, smooth } from '../math';
import type { AyatechRig } from '../rig';

/*
 * Where the seven domains are, this frame.
 *
 * They are the one cast the whole middle of the story is played by: out of
 * the signal to their places in the field, in to the experiment's ring, then
 * off it into the system — each of the five that become layers to its
 * layer, Automation to the pipeline beside them, and Emerging to wait over
 * the empty layer at the top. Nothing is swapped for anything else on the
 * way; the same points are moved.
 */
export type Pose = {
  /** Each domain's place, in DOMAINS order. */
  at: [number, number, number][];
  /** 0 → 1: out of the signal and into the field. */
  shown: number[];
  /** 0 → 1: off the ring and into its place in the system. */
  built: number[];
  /** How open the stack is: 1 as built, closing toward the slab. */
  squeeze: number;
};

export function createPose(): Pose {
  return {
    at: DOMAINS.map(() => [0, 0, 0]),
    shown: DOMAINS.map(() => 0),
    built: DOMAINS.map(() => 0),
    squeeze: 1,
  };
}

const ON_RING = DOMAINS.map(({ id }) => RING.indexOf(id));
const IN_STACK = DOMAINS.map(({ id }) => STACK.indexOf(id));

/** How far the stack has closed, for a rig. */
export const squeezeOf = (rig: AyatechRig) => 1 - 0.8 * smooth(rig.slab);

export function settle(pose: Pose, rig: AyatechRig, layout: Layout, time: number) {
  const count = DOMAINS.length;
  const gathered = smooth(rig.lab);
  const squeeze = squeezeOf(rig);
  /* While they are still trying things, they will not keep still. */
  const restless = rig.lab * (1 - rig.hold) * (1 - rig.stack);

  pose.squeeze = squeeze;

  for (let index = 0; index < count; index++) {
    const home = layout.field[DOMAINS[index].id];
    const shown = easeOut(seq(rig.field, index, count, 0.55));

    /* On the ring — or, for the one that is not on it, a step back from it. */
    let ringX = home[0] * 0.8;
    let ringY = home[1] * 0.8;
    let ringZ = home[2] * 0.6;
    if (ON_RING[index] >= 0) [ringX, ringY, ringZ] = ringSpot(layout, ON_RING[index]);

    /* In the system. */
    const layer = IN_STACK[index];
    let systemX = 0;
    let systemY: number;
    let order: number;
    if (layer >= 0) {
      systemY = levelY(layout, layer, squeeze);
      order = layer;
    } else if (DOMAINS[index].id === 'automation') {
      systemX = layout.plate.halfWidth + layout.plate.rail;
      systemY = 0;
      order = 5;
    } else {
      systemY = levelY(layout, -1, squeeze) + 0.4;
      order = 6;
    }
    const built = smooth(seq(rig.stack, order, count, 0.6));

    let x = lerp(home[0] * shown, ringX, gathered);
    let y = lerp(home[1] * shown, ringY, gathered);
    let z = lerp(home[2] * shown, ringZ, gathered);
    x = lerp(x, systemX, built);
    y = lerp(y, systemY, built);
    z = lerp(z, 0, built);

    const loose = (1 - built) * shown;
    x += Math.sin(time * 0.6 + index * 1.3) * 0.06 * loose;
    y += Math.cos(time * 0.5 + index * 2.1) * 0.06 * loose;
    if (restless > 0.001) {
      const lean = 0.07 * restless * Math.sin(time * 2.6 + index * 1.7);
      x -= x * lean;
      y -= y * lean;
    }

    const at = pose.at[index];
    at[0] = x;
    at[1] = y;
    at[2] = z;
    pose.shown[index] = shown;
    pose.built[index] = built;
  }
}
