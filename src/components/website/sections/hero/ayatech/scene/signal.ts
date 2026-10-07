import { FRAGMENTS } from '../content';
import { ink, type Tint } from '../ink';
import { clamp, clamp01, fract, seeded, smooth, TAU, type Vec3 } from '../math';
import type { AyatechRig } from '../rig';
import { fog, onStage, project, spot } from './camera';
import { glow, ring, write, type Painter } from './paint';

/*
 * The idea: the dark it starts in, and the one point of light.
 *
 * Dust and the faint streams behind it are the world's air — they are there
 * from the first frame to the last, and are the only things that are. The
 * signal is the story's subject: a point, then a presence throwing waves,
 * then the hub the domains leave from.
 */

const S = spot();

/* ---------- the air ---------- */

export type Mote = { x: number; y: number; z: number; phase: number; size: number; tint: Tint };

const MOTE_TINTS: readonly Tint[] = ['mint', 'emerald', 'cyan', 'white', 'blue', 'mint'];

/** `count` motes through a box `half` its size each way, the same every time. */
export function scatter(count: number, half: Vec3): Mote[] {
  const random = seeded(0xa7a7ec);
  return Array.from({ length: count }, (_, index) => ({
    x: (random() * 2 - 1) * half[0],
    y: (random() * 2 - 1) * half[1],
    z: (random() * 2 - 1) * half[2] + 1.5,
    phase: random() * TAU,
    size: 0.018 + random() * 0.04,
    tint: MOTE_TINTS[index % MOTE_TINTS.length],
  }));
}

export function drawDust(painter: Painter, rig: AyatechRig, motes: readonly Mote[]) {
  const { camera, time } = painter;
  /* The waves move the air: every mote breathes toward the signal and back,
     the ones further out a moment later. */
  const breathe = 0.1 * rig.rings;
  const lit = 0.16 + 0.62 * rig.dust;

  for (const mote of motes) {
    const x = mote.x + Math.sin(time * 0.11 + mote.phase) * 0.4;
    const y = mote.y + Math.cos(time * 0.09 + mote.phase * 1.7) * 0.32;
    const reach = Math.hypot(x, y, mote.z);
    const pull = 1 - breathe * (0.5 + 0.5 * Math.sin(time * 1.8 - reach * 1.1));

    project(camera, x * pull, y * pull, mote.z * pull, S);
    if (!S.ok || !onStage(camera, S.x, S.y, 24)) continue;

    /* Right up against the lens a mote is a big soft blur; let it be faint. */
    const close = clamp01(S.depth / (camera.dist * 0.45));
    const twinkle = 0.6 + 0.4 * Math.sin(time * 0.9 + mote.phase * 3);
    glow(painter, S.x, S.y, clamp(mote.size * S.s, 0.9, 16), mote.tint, lit * fog(camera, S.depth) * close * twinkle);
  }
}

/* Thin streams of data, far back: dashes running up and down a dozen lines. */
const STREAMS: readonly (readonly [number, number, number])[] = Array.from({ length: 12 }, (_, index) => {
  const random = seeded(0x51ea + index * 97);
  return [(random() * 2 - 1) * 12, 6 + random() * 5, random()] as const;
});

export function drawStreams(painter: Painter, rig: AyatechRig) {
  const strength = 0.14 * rig.dust * clamp01(rig.field) * (1 - rig.orbit);
  if (strength < 0.005) return;
  const { ctx, camera, time } = painter;

  ctx.lineWidth = 1;
  ctx.setLineDash([2, 13]);
  STREAMS.forEach(([x, z, seed], index) => {
    project(camera, x, 8, z, S);
    if (!S.ok) return;
    const topX = S.x;
    const topY = S.y;
    project(camera, x, -8, z, S);
    if (!S.ok) return;

    ctx.strokeStyle = ink(index % 3 ? 'blue' : 'cyan', strength * (0.5 + seed * 0.5));
    ctx.lineDashOffset = (index % 2 ? 1 : -1) * time * (18 + seed * 26);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(S.x, S.y);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
}

/* ---------- the signal ---------- */

/* A small crystal round the core, once there is enough of it to have a
   shape: six points, twelve edges. */
const CRYSTAL: readonly Vec3[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];
const CRYSTAL_EDGES: readonly (readonly [number, number])[] = [
  [0, 2], [0, 3], [1, 2], [1, 3], [4, 2], [4, 3], [5, 2], [5, 3], [0, 4], [4, 1], [1, 5], [5, 0],
];
const corners = CRYSTAL.map(() => ({ x: 0, y: 0, ok: false }));

export function drawSignal(painter: Painter, rig: AyatechRig) {
  const { ctx, camera, time } = painter;
  const present = clamp01(rig.signal / 0.08) * rig.ignite;
  if (present < 0.004 && rig.surge < 0.004) return;

  project(camera, 0, 0, 0, S);
  if (!S.ok) return;
  const { x, y } = S;

  /* While it is still catching (the intro), it gutters. */
  const gutter = rig.ignite < 1 ? 0.72 + 0.28 * Math.sin(time * 37) * Math.sin(time * 13) : 1;
  const breath = 1 + 0.07 * Math.sin(time * 1.6);
  const size = 0.05 + 0.34 * rig.signal;
  const radius = size * S.s * breath * (0.35 + 0.65 * rig.ignite);
  const light = present * gutter;

  /* One wave thrown as it catches. */
  if (rig.surge > 0.004) {
    const out = 1 - rig.surge;
    ring(painter, x, y, radius * (1 + out * 16) + out * camera.unit * 2.2, ink('mint', rig.surge * 0.8), 1.5);
  }
  if (light < 0.004) return;

  /* Waves leaving it, one after another. */
  if (rig.rings > 0.01) {
    for (let index = 0; index < 4; index++) {
      const out = fract(time * 0.2 + index / 4);
      const fade = (1 - out) * (1 - out);
      ring(painter, x, y, radius * (1.4 + out * (4 + 10 * rig.rings)), ink('emerald', rig.rings * fade * 0.45 * light));
    }
  }

  glow(painter, x, y, radius * 3.4, 'emerald', 0.5 * light);
  glow(painter, x, y, radius * 1.5, 'mint', 0.8 * light);
  glow(painter, x, y, Math.max(1.6, radius * 0.5), 'white', light);

  /* The crystal: turning, and only once the signal has grown into one. */
  const formed = smooth((rig.signal - 0.25) / 0.5) * light;
  if (formed > 0.01) {
    const reach = size * 2.1;
    const turn = time * 0.5;
    const tip = time * 0.31;
    const cosT = Math.cos(turn);
    const sinT = Math.sin(turn);
    const cosU = Math.cos(tip);
    const sinU = Math.sin(tip);

    CRYSTAL.forEach(([px, py, pz], index) => {
      const ax = px * cosT - pz * sinT;
      const az = px * sinT + pz * cosT;
      const ay = py * cosU - az * sinU;
      const bz = py * sinU + az * cosU;
      project(camera, ax * reach, ay * reach, bz * reach, S);
      corners[index].x = S.x;
      corners[index].y = S.y;
      corners[index].ok = S.ok;
    });

    ctx.strokeStyle = ink('mint', 0.55 * formed);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const [from, to] of CRYSTAL_EDGES) {
      if (!corners[from].ok || !corners[to].ok) continue;
      ctx.moveTo(corners[from].x, corners[from].y);
      ctx.lineTo(corners[to].x, corners[to].y);
    }
    ctx.stroke();
  }
}

/* ---------- scraps of thought ---------- */

/** Where each fragment hangs: a loose spiral round the signal, wider than
    tall on a wide stage and the other way about on a tall one, and a little
    high — the headline has the ground beneath it. */
export function hang(compact: boolean): Vec3[] {
  const [across, up, rise] = compact ? [0.6, 0.7, 0.15] : [1.55, 0.72, 0.3];
  return FRAGMENTS.map((_, index) => {
    const angle = index * 2.399;
    const reach = 0.7 + (index % 4) * 0.28;
    return [Math.cos(angle) * reach * across, Math.sin(angle) * reach * up + rise, ((index % 3) - 1) * 0.9] as const;
  });
}

export function drawFragments(painter: Painter, rig: AyatechRig, hangs: readonly Vec3[]) {
  if (rig.code < 0.01) return;
  const { camera, time } = painter;

  FRAGMENTS.forEach((text, index) => {
    /* Each comes and goes on its own slow beat, typing itself in. */
    const beat = Math.sin(time * (0.5 + index * 0.07) + index * 2.1);
    const there = smooth((beat + 0.1) / 0.6);
    if (there < 0.02) return;

    const [x, y, z] = hangs[index];
    project(camera, x, y, z, S);
    if (!S.ok || !onStage(camera, S.x, S.y, 120)) return;

    const typed = text.slice(0, Math.max(1, Math.round(text.length * clamp01((beat + 0.1) / 0.45))));
    write(
      painter,
      typed,
      S.x,
      S.y,
      ink(index % 3 ? 'emerald' : 'cyan', rig.code * there * fog(camera, S.depth) * 0.72),
      clamp(S.s * 0.075, 9.5, 12),
      { align: 'center' },
    );
  });
}
