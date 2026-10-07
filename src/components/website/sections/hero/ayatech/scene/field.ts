import { DOMAINS, type DomainId } from '../content';
import { ink } from '../ink';
import { RING, type Layout } from '../layout';
import { clamp, clamp01, fract, lerp, seq, smooth, TAU, type Vec3 } from '../math';
import type { AyatechRig } from '../rig';
import { fog, onStage, project, spot } from './camera';
import { GLYPHS } from './glyphs';
import { along, glow, ring, segment, trace, write, type Painter } from './paint';
import type { Pose } from './pose';

/*
 * Explore, Learn and Experiment: the field of domains, the routes through
 * it, and the domains trying each other out.
 *
 * Drawn in two passes, because the system (system.ts) is drawn between them:
 * the lines first, underneath it; the domains themselves last, on top — they
 * are still there, as the lights on its layers, once it is built.
 */

const S = spot();
const HERE: [number, number, number] = [0, 0, 0];
const ORIGIN: Vec3 = [0, 0, 0];

const INDEX = Object.fromEntries(DOMAINS.map(({ id }, index) => [id, index])) as Record<DomainId, number>;

/* Which domains are neighbours in the field — a faint web between them. */
const NEIGHBOURS: readonly (readonly [DomainId, DomainId])[] = [
  ['ai', 'code'],
  ['code', 'data'],
  ['ai', 'cloud'],
  ['cloud', 'automation'],
  ['automation', 'systems'],
  ['systems', 'data'],
  ['cloud', 'emerging'],
  ['ai', 'systems'],
];

/* Ways through the field. They are routes, not courses: what they say is
   that learning here is travel from one domain into the next, whatever is on
   the timetable this term. */
const ROUTES: readonly (readonly (DomainId | 'hub')[])[] = [
  ['hub', 'ai', 'code', 'data'],
  ['hub', 'systems', 'automation', 'cloud', 'emerging'],
  ['data', 'systems', 'cloud'],
];

/* Every pairing on the ring that is not already next to each other: the
   connections there are to try. */
const CHORDS: readonly (readonly [number, number])[] = RING.flatMap((from, a) =>
  RING.slice(a + 2)
    .filter((_, offset) => !(a === 0 && offset === RING.length - 3))
    .map((to) => [INDEX[from], INDEX[to]] as const),
);

/* Where small prototypes get put together and fall apart, as shares of the ring. */
const BENCHES: readonly Vec3[] = [
  [-0.42, 0.3, 0.3],
  [0.46, 0.08, -0.2],
  [-0.06, -0.46, 0.1],
];

/* ---------- pass one: the lines ---------- */

export function drawFieldLines(painter: Painter, rig: AyatechRig, layout: Layout, pose: Pose) {
  if (rig.field < 0.001) return;
  const world = 1 - rig.orbit;
  if (world < 0.01) return;

  web(painter, rig, layout, pose, world);
  routes(painter, rig, pose, world);
  trials(painter, rig, layout, pose, world);
  chain(painter, rig, pose, world);
}

/* The hub's spokes, the web between neighbours, and the edge still forming. */
function web(painter: Painter, rig: AyatechRig, layout: Layout, pose: Pose, world: number) {
  const loose = (1 - smooth(rig.lab)) * world;
  if (loose < 0.01) return;
  const { ctx, camera, time } = painter;

  for (let index = 0; index < DOMAINS.length; index++) {
    const shown = pose.shown[index] * loose;
    if (shown > 0.01) segment(painter, ORIGIN, pose.at[index], ink('mint', 0.16 * shown));
  }

  for (const [from, to] of NEIGHBOURS) {
    const shown = Math.min(pose.shown[INDEX[from]], pose.shown[INDEX[to]]) * loose;
    if (shown > 0.01) segment(painter, pose.at[INDEX[from]], pose.at[INDEX[to]], ink('blue', 0.13 * shown));
  }

  /* Past the named domains: points that come and go, each reaching for the
     nearest thing that already exists. The field is not finished. */
  ctx.setLineDash([2, 5]);
  layout.frontier.forEach(({ at, toward }, index) => {
    const wink = 0.5 + 0.5 * Math.sin(time * 0.55 + index * 1.9);
    const there = rig.field * loose * wink * wink * wink;
    if (there < 0.02) return;

    project(camera, at[0], at[1], at[2], S);
    if (!S.ok || !onStage(camera, S.x, S.y, 20)) return;
    glow(painter, S.x, S.y, clamp(S.s * 0.07, 3, 9), 'white', there * 0.7 * fog(camera, S.depth));
    segment(painter, at, pose.at[toward], ink('white', 0.12 * there));
  });
  ctx.setLineDash([]);
}

function routes(painter: Painter, rig: AyatechRig, pose: Pose, world: number) {
  if (rig.routes < 0.001) return;
  /* They give way as the domains are drawn in to experiment. */
  const lit = (1 - clamp01(rig.lab * 1.6)) * world;
  if (lit < 0.01) return;
  const { camera, time } = painter;

  ROUTES.forEach((route, index) => {
    const points = route.map((stop) => (stop === 'hub' ? ORIGIN : pose.at[INDEX[stop]]));
    const drawn = smooth(seq(rig.routes, index, ROUTES.length, 0.6));
    if (drawn < 0.001) return;

    trace(painter, points, drawn, ink('emerald', 0.13 * lit), 5);
    trace(painter, points, drawn, ink('emerald', 0.85 * lit), 1.4);

    /* Something is always on its way along one. */
    for (let runner = 0; runner < 2; runner++) {
      const share = fract(time * (0.11 + index * 0.02) + runner / 2 + index * 0.17) * drawn;
      along(points, share, HERE);
      project(camera, HERE[0], HERE[1], HERE[2], S);
      if (!S.ok) continue;
      const size = clamp(S.s * 0.07, 3, 9);
      glow(painter, S.x, S.y, size * 2.4, 'emerald', 0.5 * lit);
      glow(painter, S.x, S.y, size, 'white', 0.9 * lit);
    }
  });
}

/* Connections tried and dropped, and prototypes put together and taken
   apart again. All of it stops the moment one arrangement holds. */
function trials(painter: Painter, rig: AyatechRig, layout: Layout, pose: Pose, world: number) {
  const trying = rig.lab * (1 - rig.hold) * (1 - rig.stack) * world;
  if (trying < 0.01) return;
  const { ctx, camera, time } = painter;

  CHORDS.forEach(([from, to], index) => {
    const beat = fract(time * (0.19 + (index % 4) * 0.045) + index * 0.371);
    if (beat > 0.78) return;

    /* Reaches across, holds for a moment, then breaks up and goes. */
    const reach = Math.min(1, beat / 0.3);
    const failing = beat >= 0.52;
    const there = (failing ? 1 - (beat - 0.52) / 0.26 : 1) * trying;
    const a = pose.at[from];
    const b = pose.at[to];
    HERE[0] = lerp(a[0], b[0], reach);
    HERE[1] = lerp(a[1], b[1], reach);
    HERE[2] = lerp(a[2], b[2], reach);

    if (failing) ctx.setLineDash([3, 6]);
    segment(painter, a, HERE, ink(index % 2 ? 'cyan' : 'white', 0.5 * there));
    if (failing) ctx.setLineDash([]);

    project(camera, HERE[0], HERE[1], HERE[2], S);
    if (S.ok && !failing) glow(painter, S.x, S.y, clamp(S.s * (reach < 1 ? 0.06 : 0.11), 3, 12), 'white', 0.8 * there);
  });

  BENCHES.forEach(([x, y, z], index) => {
    const beat = fract(time * 0.16 + index * 0.37);
    if (beat > 0.85) return;
    project(camera, x * layout.ring * 2, y * layout.ring * 2, z, S);
    if (!S.ok) return;

    const built = Math.min(1, beat / 0.35);
    /* Coming apart: each side drifts off the way it faces. */
    const apart = beat > 0.6 ? (beat - 0.6) / 0.25 : 0;
    const halfW = 0.36 * S.s;
    const halfH = 0.23 * S.s;
    const drift = apart * halfH * 1.4;
    const color = ink('blue', 0.6 * trying * (1 - apart));

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    /* Its four sides, one after another. */
    const sides: readonly (readonly [number, number, number, number, number, number])[] = [
      [-halfW, -halfH, halfW, -halfH, 0, -1],
      [halfW, -halfH, halfW, halfH, 1, 0],
      [halfW, halfH, -halfW, halfH, 0, 1],
      [-halfW, halfH, -halfW, -halfH, -1, 0],
    ];
    sides.forEach(([fromX, fromY, toX, toY, outX, outY], side) => {
      const drawn = clamp01(built * 4 - side);
      if (drawn <= 0) return;
      ctx.moveTo(S.x + fromX + outX * drift, S.y + fromY + outY * drift);
      ctx.lineTo(S.x + lerp(fromX, toX, drawn) + outX * drift, S.y + lerp(fromY, toY, drawn) + outY * drift);
    });
    /* And, once it stands, what is in it. */
    if (built >= 1 && apart === 0) {
      ctx.moveTo(S.x - halfW * 0.7, S.y - halfH * 0.35);
      ctx.lineTo(S.x + halfW * 0.5, S.y - halfH * 0.35);
      ctx.moveTo(S.x - halfW * 0.7, S.y + halfH * 0.25);
      ctx.lineTo(S.x + halfW * 0.1, S.y + halfH * 0.25);
    }
    ctx.stroke();
  });
}

/* The one that holds: the six disciplines, joined in the order they will be
   built in. It is still there as they leave the ring, and lets go of them
   only as the system's own joins take over. */
function chain(painter: Painter, rig: AyatechRig, pose: Pose, world: number) {
  const held = rig.hold * (1 - smooth(rig.stack)) * world;
  if (held < 0.01) return;
  const { camera, time } = painter;

  const loop = RING.map((id) => pose.at[INDEX[id]]);
  loop.push(loop[0]);

  trace(painter, loop, rig.hold, ink('blue', 0.2 * held), 6);
  trace(painter, loop, rig.hold, ink('blue', 0.95 * held), 1.6);

  for (let runner = 0; runner < 3; runner++) {
    along(loop, fract(time * 0.14 + runner / 3) * rig.hold, HERE);
    project(camera, HERE[0], HERE[1], HERE[2], S);
    if (S.ok) glow(painter, S.x, S.y, clamp(S.s * 0.08, 3, 10), 'white', 0.9 * held);
  }
}

/* ---------- pass two: the domains ---------- */

export function drawFieldNodes(painter: Painter, rig: AyatechRig, pose: Pose) {
  if (rig.field < 0.001) return;
  const world = 1 - rig.orbit;
  if (world < 0.01) return;
  const { ctx, camera, time } = painter;
  const closed = smooth(rig.slab);

  DOMAINS.forEach((domain, index) => {
    const shown = pose.shown[index];
    if (shown < 0.01) return;

    const [x, y, z] = pose.at[index];
    project(camera, x, y, z, S);
    if (!S.ok || !onStage(camera, S.x, S.y, 90)) return;

    const depth = fog(camera, S.depth);
    const size = clamp(S.s * 0.34, 9, 44) * (0.4 + 0.6 * shown);
    /* Its structure goes as it becomes part of the system — all but the one
       that never does, which keeps its shape until the system closes up. */
    const kept = domain.id === 'emerging' ? 1 - closed : 1 - pose.built[index];
    const light = shown * depth * world * (1 - closed);

    glow(painter, S.x, S.y, size * (0.55 + 0.75 * kept), domain.tint, 0.5 * light);
    glow(painter, S.x, S.y, Math.max(2.4, size * 0.13), 'white', 0.95 * light * (1 - 0.6 * kept));

    const drawn = shown * depth * kept * world;
    if (drawn < 0.02) return;

    GLYPHS[domain.id](ctx, S.x, S.y, size, time + index * 0.7, drawn, domain.tint);

    /* A reticle round it: found, and held in view. */
    ring(painter, S.x, S.y, size * 1.22, ink(domain.tint, 0.16 * drawn));
    ctx.strokeStyle = ink(domain.tint, 0.5 * drawn);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let tick = 0; tick < 4; tick++) {
      const angle = time * 0.12 + index + (tick / 4) * TAU;
      ctx.moveTo(S.x + Math.cos(angle) * size * 1.16, S.y + Math.sin(angle) * size * 1.16);
      ctx.lineTo(S.x + Math.cos(angle) * size * 1.32, S.y + Math.sin(angle) * size * 1.32);
    }
    ctx.stroke();

    /* Its name goes once it has a place in the system: the layers are
       named there, and the empty one says what the last domain is for. */
    const named = drawn * (1 - pose.built[index]);
    if (named < 0.02) return;
    write(painter, domain.label.toUpperCase(), S.x, S.y + size * 1.32 + 13, ink('white', 0.82 * named), clamp(S.s * 0.1, 9.5, 12), {
      align: 'center',
      spacing: '0.18em',
    });
  });
}
