import { PLOTS } from '../content';
import { ink, type Tint } from '../ink';
import type { Layout } from '../layout';
import { clamp, fract, seq, smooth, type Vec3 } from '../math';
import type { AyatechRig } from '../rig';
import { project, spot } from './camera';
import { along, glow, ring, segment, trace, write, type Painter } from './paint';

/*
 * The second half of Deliver, and the name.
 *
 * The camera pulls back and the system turns out to be one plot on a wide
 * ground: Ayadi's, lit, built. Round it are others that are only drawn —
 * dashed outlines, named for a kind of work rather than a company, because
 * that is exactly what they are today. Signal reaches each one in turn.
 *
 * Then all of it gathers into three arcs round the name: learn, build,
 * deliver, in the three inks they have had all along.
 */

const S = spot();
const HERE: [number, number, number] = [0, 0, 0];

/* ---------- the ground ---------- */

export function drawGround(painter: Painter, rig: AyatechRig, layout: Layout) {
  if (rig.map < 0.01) return;
  const lit = smooth(rig.map) * (1 - rig.orbit);
  if (lit < 0.01) return;

  const { ctx, camera, time } = painter;
  const y = layout.ground;
  const { halfWidth, halfDepth } = layout.plate;

  /* A grid, so the ground reads as ground. */
  const step = layout.compact ? 1.3 : 1.6;
  const edge = step * 6;
  ctx.strokeStyle = ink('blue', 0.085 * lit);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let line = -6; line <= 6; line++) {
    for (const lengthwise of [true, false]) {
      project(camera, lengthwise ? line * step : -edge, y, lengthwise ? -edge : line * step, S);
      if (!S.ok) continue;
      const fromX = S.x;
      const fromY = S.y;
      project(camera, lengthwise ? line * step : edge, y, lengthwise ? edge : line * step, S);
      if (!S.ok) continue;
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(S.x, S.y);
    }
  }
  ctx.stroke();

  /* Ayadi's plot: a solid line round what is standing on it. */
  const padX = halfWidth + 0.55;
  const padZ = halfDepth + 0.55;
  const pad: Vec3[] = [
    [-padX, y, -padZ],
    [padX, y, -padZ],
    [padX, y, padZ],
    [-padX, y, padZ],
    [-padX, y, -padZ],
  ];
  trace(painter, pad, 1, ink('emerald', 0.14 * lit), 5);
  trace(painter, pad, 1, ink('emerald', 0.8 * lit), 1.3);

  project(camera, 0, y, -(padZ + 0.75), S);
  if (S.ok) {
    const size = clamp(S.s * 0.2, 10, 13);
    write(painter, 'AYADI CLOUDVERSITY', S.x, S.y, ink('white', 0.92 * lit), size, {
      align: 'center',
      mono: false,
      weight: 800,
      spacing: '0.16em',
    });
    write(painter, 'BUILT BY AYATECH', S.x, S.y + size + 5, ink('emerald', 0.85 * lit), Math.max(9, size * 0.78), {
      align: 'center',
      spacing: '0.22em',
    });
  }

  /* ---------- the plots round it ---------- */
  const [plotX, plotZ] = layout.plot;

  layout.plots.forEach(([x, z], index) => {
    const drawn = smooth(seq(rig.plots, index, layout.plots.length, 0.45));
    if (drawn < 0.005) return;
    const alpha = lit * drawn;

    /* The way there: along one axis, then the other, as a circuit would go. */
    const way: Vec3[] = [
      [0, y, 0],
      [x, y, 0],
      [x, y, z],
    ];
    trace(painter, way, drawn, ink('cyan', 0.34 * lit));

    /* The blueprint: an outline on the ground, and the ghost of a first
       floor over it. Not built — drawn. */
    const up = y + 0.45;
    const inX = plotX * 0.84;
    const inZ = plotZ * 0.84;
    ctx.setLineDash([5, 5]);
    trace(
      painter,
      [
        [x - plotX, y, z - plotZ],
        [x + plotX, y, z - plotZ],
        [x + plotX, y, z + plotZ],
        [x - plotX, y, z + plotZ],
        [x - plotX, y, z - plotZ],
      ],
      drawn,
      ink('cyan', 0.82 * lit),
      1.2,
    );
    trace(
      painter,
      [
        [x - inX, up, z - inZ],
        [x + inX, up, z - inZ],
        [x + inX, up, z + inZ],
        [x - inX, up, z + inZ],
        [x - inX, up, z - inZ],
      ],
      drawn,
      ink('cyan', 0.3 * lit),
    );
    for (const [cornerX, cornerZ] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      segment(painter, [x + cornerX * plotX, y, z + cornerZ * plotZ], [x + cornerX * inX, up, z + cornerZ * inZ], ink('cyan', 0.24 * alpha));
    }
    ctx.setLineDash([]);

    /* Where the first thing would go. */
    project(camera, x, y, z, S);
    if (S.ok) {
      const arm = clamp(S.s * 0.14, 3, 7);
      ctx.strokeStyle = ink('white', 0.7 * alpha);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(S.x - arm, S.y);
      ctx.lineTo(S.x + arm, S.y);
      ctx.moveTo(S.x, S.y - arm);
      ctx.lineTo(S.x, S.y + arm);
      ctx.stroke();
    }

    project(camera, x, y + 1.05, z, S);
    if (S.ok) {
      write(painter, PLOTS[index % PLOTS.length].toUpperCase(), S.x, S.y, ink('white', 0.86 * alpha), clamp(S.s * 0.2, 9.5, 12), {
        align: 'center',
        spacing: '0.14em',
      });
    }

    /* Signal, on its way out to it. */
    if (rig.reach > 0.01) {
      along(way, fract(time * 0.3 + index * 0.21) * drawn, HERE);
      project(camera, HERE[0], HERE[1], HERE[2], S);
      if (S.ok) {
        const size = clamp(S.s * 0.12, 3, 8);
        glow(painter, S.x, S.y, size * 2.4, 'cyan', 0.5 * rig.reach * lit);
        glow(painter, S.x, S.y, size, 'white', 0.9 * rig.reach * lit);
      }
    }
  });
}

/* ---------- the three arcs ---------- */

/* Where each sits round the name, in degrees anticlockwise from three
   o'clock — the page's own labels are placed to match (ayatech.module.css). */
const ARCS: readonly { tint: Tint; middle: number }[] = [
  { tint: 'emerald', middle: 140 },
  { tint: 'blue', middle: 40 },
  { tint: 'cyan', middle: 270 },
];

const HALF_ARC = (48 * Math.PI) / 180;
const ARC_STEPS = 22;

export function drawOrbit(painter: Painter, rig: AyatechRig, layout: Layout) {
  const gathered = smooth(rig.orbit);
  if (gathered < 0.01) return;
  const gone = smooth(rig.clear);
  const lit = gathered * (1 - gone);
  if (lit < 0.01) return;

  const { ctx, camera, time } = painter;
  /* They close in as they form, and open out as they let go. */
  const radius = layout.orbit * (0.72 + 0.28 * gathered) * (1 + 0.22 * gone);
  const half = HALF_ARC * gathered;

  ARCS.forEach(({ tint, middle }, index) => {
    const centre = (middle * Math.PI) / 180;
    const points: Vec3[] = [];
    for (let step = 0; step <= ARC_STEPS; step++) {
      const angle = centre + half - (2 * half * step) / ARC_STEPS;
      points.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
    }

    trace(painter, points, 1, ink(tint, 0.14 * lit), 7);
    trace(painter, points, 1, ink(tint, 0.95 * lit), 1.8);

    /* What each arc is made of: the domains, the layers, the plots. */
    const marks = index === 0 ? 7 : 5;
    for (let mark = 0; mark < marks; mark++) {
      const angle = centre + half * 0.82 * ((mark / (marks - 1)) * 2 - 1);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      if (index === 1) {
        segment(painter, [cos * radius * 0.94, sin * radius * 0.94, 0], [cos * radius * 1.06, sin * radius * 1.06, 0], ink(tint, 0.9 * lit), 1.4);
        continue;
      }
      project(camera, cos * radius, sin * radius, 0, S);
      if (!S.ok) continue;
      if (index === 0) {
        glow(painter, S.x, S.y, clamp(S.s * 0.06, 3, 7), 'white', 0.95 * lit);
      } else {
        const size = clamp(S.s * 0.09, 5, 9);
        ctx.strokeStyle = ink(tint, 0.95 * lit);
        ctx.lineWidth = 1.1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(S.x - size / 2, S.y - size / 2, size, size);
        ctx.setLineDash([]);
      }
    }

    /* And light still running along it. */
    along(points, fract(time * 0.18 + index * 0.33), HERE);
    project(camera, HERE[0], HERE[1], HERE[2], S);
    if (S.ok) {
      const size = clamp(S.s * 0.08, 3, 9);
      glow(painter, S.x, S.y, size * 2.6, tint, 0.6 * lit);
      glow(painter, S.x, S.y, size, 'white', lit);
    }
  });

  /* One faint ring holding the three together. */
  project(camera, 0, 0, 0, S);
  if (!S.ok) return;
  ctx.setLineDash([2, 9]);
  ctx.lineDashOffset = time * 8;
  ring(painter, S.x, S.y, radius * 1.2 * S.s, ink('white', 0.2 * lit));
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ring(painter, S.x, S.y, radius * 0.84 * S.s, ink('white', 0.07 * lit));
  /* And, as they go, one wave out from where they were. */
  if (gone > 0.01) ring(painter, S.x, S.y, radius * (1.2 + gone * 0.5) * S.s, ink('mint', 0.25 * lit * gone));
}
