import { LAYERS, PLATFORM, SYSTEM_WORDS } from '../content';
import { ink } from '../ink';
import { levelY, type Layout } from '../layout';
import { clamp, clamp01, fract, lerp, seq, smooth, TAU, type Vec3 } from '../math';
import type { AyatechRig } from '../rig';
import { project, spot } from './camera';
import { along, glow, segment, trace, write, type Painter } from './paint';
import type { Pose } from './pose';

/*
 * Build, and the first half of Deliver: a software system, as a place.
 *
 * Five layers, top to bottom — interface, API and services, intelligence,
 * data, cloud — each of them what one of the domains has become. A user at
 * the top and requests running down through all of it and back; a pipeline
 * up the side that ships it, outline turning solid from the ground up; and
 * above them one more layer that is only drawn in dashes, for whatever
 * Emerging turns out to be.
 *
 * Then the whole thing closes up into a slab, and is Ayadi's.
 */

const S = spot();
const CORNERS = [spot(), spot(), spot(), spot()];

/* What is drawn on each layer, in the layer's own plane: across (-1 → 1 is
   its width) and away (-1 → 1 is its depth). Rects are two corners, lines
   two points, rounds a centre and a radius in widths. */
type Plan = { rects?: readonly number[][]; lines?: readonly number[][]; rounds?: readonly number[][] };

const PLANS: readonly Plan[] = [
  /* Interface: a window — a bar across the back, a main pane, two cards. */
  {
    rects: [
      [-0.86, 0.46, 0.86, 0.82],
      [-0.86, -0.82, -0.14, 0.28],
      [0.02, -0.82, 0.86, -0.3],
      [0.02, -0.12, 0.86, 0.28],
    ],
  },
  /* API and services: three services, hung off one bus. */
  {
    rects: [
      [-0.86, -0.3, -0.36, 0.56],
      [-0.25, -0.3, 0.25, 0.56],
      [0.36, -0.3, 0.86, 0.56],
    ],
    lines: [
      [-0.86, -0.7, 0.86, -0.7],
      [-0.61, -0.7, -0.61, -0.3],
      [0, -0.7, 0, -0.3],
      [0.61, -0.7, 0.61, -0.3],
    ],
  },
  /* Intelligence: a small net. */
  {
    lines: [
      [-0.7, -0.5, 0, 0.58],
      [-0.7, -0.5, 0, -0.05],
      [-0.7, -0.5, 0, -0.66],
      [-0.7, 0.5, 0, 0.58],
      [-0.7, 0.5, 0, -0.05],
      [0, 0.58, 0.7, 0],
      [0, -0.05, 0.7, 0],
      [0, -0.66, 0.7, 0],
    ],
    rounds: [
      [-0.7, -0.5, 0.07],
      [-0.7, 0.5, 0.07],
      [0, 0.58, 0.07],
      [0, -0.05, 0.07],
      [0, -0.66, 0.07],
      [0.7, 0, 0.09],
    ],
  },
  /* Data: three stores. */
  {
    rounds: [
      [-0.56, 0, 0.2],
      [0, 0, 0.2],
      [0.56, 0, 0.2],
    ],
  },
  /* Cloud: a rack of machines. */
  {
    rects: Array.from({ length: 10 }, (_, index) => {
      const column = (index % 5) - 2;
      const row = index < 5 ? -1 : 1;
      return [column * 0.36 - 0.13, row * 0.38 - 0.22, column * 0.36 + 0.13, row * 0.38 + 0.22];
    }),
  },
];

/* Projects a layer's four corners into CORNERS; false if any is behind the lens. */
function corners(painter: Painter, y: number, halfWidth: number, halfDepth: number) {
  const { camera } = painter;
  project(camera, -halfWidth, y, -halfDepth, CORNERS[0]);
  project(camera, halfWidth, y, -halfDepth, CORNERS[1]);
  project(camera, halfWidth, y, halfDepth, CORNERS[2]);
  project(camera, -halfWidth, y, halfDepth, CORNERS[3]);
  return CORNERS.every((corner) => corner.ok);
}

function outline(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(CORNERS[0].x, CORNERS[0].y);
  for (let index = 1; index < 4; index++) ctx.lineTo(CORNERS[index].x, CORNERS[index].y);
  ctx.closePath();
}

/* A layer's plan, drawn in its plane. */
function plan(painter: Painter, layer: Plan, y: number, halfWidth: number, halfDepth: number, color: string) {
  const { ctx, camera } = painter;
  const move = (across: number, away: number) => {
    project(camera, across * halfWidth, y, away * halfDepth, S);
    ctx.moveTo(S.x, S.y);
  };
  const draw = (across: number, away: number) => {
    project(camera, across * halfWidth, y, away * halfDepth, S);
    ctx.lineTo(S.x, S.y);
  };

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const [fromX, fromZ, toX, toZ] of layer.rects ?? []) {
    move(fromX, fromZ);
    draw(toX, fromZ);
    draw(toX, toZ);
    draw(fromX, toZ);
    draw(fromX, fromZ);
  }
  for (const [fromX, fromZ, toX, toZ] of layer.lines ?? []) {
    move(fromX, fromZ);
    draw(toX, toZ);
  }
  for (const [centerX, centerZ, radius] of layer.rounds ?? []) {
    /* A circle on the ground is an ellipse from here; walk round it. The
       plane is wider than deep, so its radius is evened out to stay round. */
    const deep = (radius * halfWidth) / halfDepth;
    for (let step = 0; step <= 14; step++) {
      const angle = (step / 14) * TAU;
      const across = centerX + Math.cos(angle) * radius;
      const away = centerZ + Math.sin(angle) * deep;
      if (step === 0) move(across, away);
      else draw(across, away);
    }
  }
  ctx.stroke();
}

export function drawSystem(painter: Painter, rig: AyatechRig, layout: Layout, pose: Pose) {
  if (rig.plates < 0.001 && rig.links < 0.001) return;
  const world = 1 - rig.orbit;
  if (world < 0.01) return;

  const { ctx, camera, time } = painter;
  const { halfWidth, halfDepth, gap, rail } = layout.plate;
  const count = LAYERS.length;
  const closed = smooth(rig.slab);
  const open = 1 - closed;
  const railX = halfWidth + rail;
  const levels = LAYERS.map((_, layer) => levelY(layout, layer, pose.squeeze));
  const top = levels[0];
  const bottom = levels[count - 1];
  const nextY = levelY(layout, -1, pose.squeeze);

  /* ---------- requests ----------
     In at the user, across the interface, down the middle of every layer to
     the cloud, and back the way they came. Worked out first: a layer lights
     as one passes through it. */
  const user: Vec3 = [-halfWidth - 1.2, top + 0.85 * pose.squeeze, 0];
  const spine: Vec3[] = [user, [-halfWidth, top, 0], [0, top, 0]];
  for (let layer = 1; layer < count; layer++) spine.push([0, levels[layer], 0]);

  const hits = levels.map(() => 0);
  const requests: [number, number, number][] = [];
  if (rig.flow > 0.01) {
    const near = 0.34 * gap * pose.squeeze + 0.02;
    for (let index = 0; index < 3; index++) {
      const lap = fract(time * 0.26 + index / 3);
      const at = along(spine, lap < 0.5 ? lap * 2 : 2 - lap * 2, [0, 0, 0]);
      requests.push(at);
      if (Math.abs(at[0]) > 0.02) continue;
      levels.forEach((level, layer) => {
        hits[layer] = Math.max(hits[layer], 1 - Math.abs(at[1] - level) / near);
      });
    }
  }

  /* ---------- the layers, from the ground up ----------
     The camera is above them, so the higher ones go on top. */
  for (let layer = count - 1; layer >= 0; layer--) {
    const y = levels[layer];
    const there = seq(rig.plates, layer, count, 0.5);

    if (there > 0.001 && corners(painter, y, halfWidth, halfDepth)) {
      /* Shipped, from the ground up. */
      const live = seq(rig.deploy, count - 1 - layer, count, 0.5);
      const lit = there * world;

      /* The layer itself is dark glass: it hides what is under it. */
      ctx.globalCompositeOperation = 'source-over';
      outline(ctx);
      ctx.fillStyle = `rgba(6, 14, 26, ${(0.62 * lit).toFixed(3)})`;
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';

      outline(ctx);
      ctx.fillStyle = ink('blue', (0.04 + 0.1 * live + 0.16 * hits[layer] * rig.flow) * lit);
      ctx.fill();
      if (closed > 0.01) {
        ctx.fillStyle = ink('emerald', 0.07 * closed * lit);
        ctx.fill();
      }

      plan(painter, PLANS[layer], y, halfWidth, halfDepth, ink(live > 0.5 ? 'cyan' : 'blue', (0.2 + 0.4 * live + (layer === 0 ? 0.3 * closed : 0)) * lit));

      trace(
        painter,
        [
          [-halfWidth, y, -halfDepth],
          [halfWidth, y, -halfDepth],
          [halfWidth, y, halfDepth],
          [-halfWidth, y, halfDepth],
          [-halfWidth, y, -halfDepth],
        ],
        there,
        ink(live > 0.5 ? 'cyan' : 'blue', (0.55 + 0.4 * live) * lit),
        1.3,
      );

      /* Its feed from the pipeline. */
      const fed = lit * rig.links * open;
      if (fed > 0.01) segment(painter, [halfWidth, y, 0], [railX, y, 0], ink('emerald', 0.42 * fed));
    }

    /* The posts down to the layer below, at alternate ends. */
    if (layer < count - 1) {
      const joined = seq(rig.links, layer, count - 1, 0.5);
      if (joined > 0.001) {
        const x = (layer % 2 ? 1 : -1) * halfWidth * 0.82;
        const foot = lerp(y, levels[layer + 1], joined);
        const color = ink('blue', 0.42 * world);
        segment(painter, [x, y, -halfDepth * 0.7], [x, foot, -halfDepth * 0.7], color);
        segment(painter, [-x, y, halfDepth * 0.7], [-x, foot, halfDepth * 0.7], color);
      }
    }
  }

  /* ---------- the layer that is not built yet ---------- */
  const pending = clamp01(rig.plates * 3 - 2) * open * world;
  if (pending > 0.01 && corners(painter, nextY, halfWidth * 0.78, halfDepth * 0.78)) {
    ctx.setLineDash([5, 5]);
    outline(ctx);
    ctx.strokeStyle = ink('white', 0.5 * pending);
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ---------- the requests themselves ---------- */
  trace(painter, spine, rig.links, ink('cyan', 0.26 * world * (0.3 + 0.7 * open)), 1);
  if (rig.links > 0.01 && open > 0.01) person(painter, user, rig.links * open * world);

  const running = rig.flow * world * (0.35 + 0.65 * open);
  for (const [x, y, z] of requests) {
    project(camera, x, y, z, S);
    if (!S.ok) continue;
    const size = clamp(S.s * 0.09, 3, 11);
    glow(painter, S.x, S.y, size * 2.6, 'cyan', 0.5 * running);
    glow(painter, S.x, S.y, size, 'white', running);
  }

  /* ---------- the pipeline ---------- */
  const piped = rig.links * open * world;
  if (piped > 0.01) {
    const run: Vec3[] = [
      [railX, bottom, 0],
      [railX, top, 0],
    ];
    trace(painter, run, rig.links, ink('emerald', 0.14 * piped), 5);
    trace(painter, run, rig.links, ink('emerald', 0.8 * piped), 1.5);

    /* …and on, in dashes, to the layer that is not there yet. */
    ctx.setLineDash([3, 5]);
    trace(
      painter,
      [
        [railX, top, 0],
        [railX, nextY, 0],
        [halfWidth * 0.78, nextY, 0],
      ],
      rig.links,
      ink('white', 0.38 * piped),
    );
    ctx.setLineDash([]);

    /* What it carries, climbing. */
    if (rig.deploy > 0.01) {
      for (let index = 0; index < 4; index++) {
        const climb = fract(time * 0.3 + index / 4);
        project(camera, railX, lerp(bottom, top, climb), 0, S);
        if (!S.ok) continue;
        const size = clamp(S.s * 0.1, 4, 9);
        const there = rig.deploy * Math.sin(Math.PI * climb) * piped;
        ctx.strokeStyle = ink('mint', 0.95 * there);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(S.x - size / 2, S.y - size / 2, size, size);
        glow(painter, S.x, S.y, size * 1.8, 'emerald', 0.6 * there);
      }
    }

    project(camera, railX, bottom - 0.46, 0, S);
    if (S.ok) {
      write(painter, SYSTEM_WORDS.pipeline.toUpperCase(), S.x, S.y, ink('emerald', 0.85 * piped), clamp(S.s * 0.1, 9, 11.5), {
        align: 'center',
        spacing: '0.2em',
      });
    }
  }

  names(painter, rig, layout, levels, nextY, railX, open * world, pending);
  platform(painter, rig, layout, railX, closed * (1 - smooth(rig.map)) * world);
}

/* Someone at the top of it all. */
function person(painter: Painter, at: Vec3, alpha: number) {
  const { ctx, camera } = painter;
  project(camera, at[0], at[1], at[2], S);
  if (!S.ok) return;
  const size = clamp(S.s * 0.1, 4, 9);

  ctx.strokeStyle = ink('white', 0.9 * alpha);
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(S.x, S.y - size * 0.9, size * 0.62, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(S.x, S.y + size * 1.5, size * 1.6, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  glow(painter, S.x, S.y, size * 2.6, 'cyan', 0.35 * alpha);

  write(painter, SYSTEM_WORDS.user.toUpperCase(), S.x, S.y + size * 2.5 + 6, ink('white', 0.75 * alpha), clamp(S.s * 0.1, 9, 11.5), {
    align: 'center',
    spacing: '0.2em',
  });
}

/* What each layer is called — beside the stack, or over each layer where
   the frame has no room beside it. */
function names(
  painter: Painter,
  rig: AyatechRig,
  layout: Layout,
  levels: readonly number[],
  nextY: number,
  railX: number,
  alpha: number,
  pending: number,
) {
  if (alpha < 0.01) return;
  const { camera } = painter;
  const { halfWidth, halfDepth } = layout.plate;
  const beside = layout.labels === 'side';

  /* Beside: past the pipeline, numbered. Otherwise: off the layer's near
     corner, where a tall frame still has room — the left one, or the right
     for the empty layer, whose left is where the user stands. `reach` is how
     much of the layer's size that corner is at (the empty layer is smaller). */
  const name = (index: string, text: string, y: number, color: string, reach = 1, right = false) => {
    if (beside) project(camera, railX + 0.42, y, 0, S);
    else project(camera, (right ? halfWidth : -halfWidth) * reach, y, -halfDepth * reach, S);
    if (!S.ok) return;
    const after = beside || right;
    write(painter, beside ? `${index}  ${text}` : text, after ? S.x + (beside ? 0 : 8) : S.x - 8, S.y, color, clamp(S.s * 0.105, 9, 12), {
      align: after ? 'left' : 'right',
      spacing: '0.16em',
    });
  };

  LAYERS.forEach((label, layer) => {
    const there = seq(rig.plates, layer, LAYERS.length, 0.5) * alpha;
    if (there > 0.01) name(`0${layer + 1}`, label.toUpperCase(), levels[layer], ink('white', 0.82 * there));
  });
  if (pending > 0.01) name('+ ', SYSTEM_WORDS.next.toUpperCase(), nextY, ink('white', 0.55 * pending), 0.78, true);
}

/* Once it is Ayadi's: what the slab is made of, fanned out beside it. */
function platform(painter: Painter, rig: AyatechRig, layout: Layout, railX: number, alpha: number) {
  if (alpha < 0.01) return;
  const { camera } = painter;
  const { halfWidth } = layout.plate;
  const closed = smooth(rig.slab);

  if (layout.labels !== 'side') {
    project(camera, 0, -1, 0, S);
    if (!S.ok) return;
    write(painter, PLATFORM.join(' · ').toUpperCase(), S.x, S.y, ink('white', 0.8 * alpha), 9.5, {
      align: 'center',
      spacing: '0.08em',
    });
    return;
  }

  PLATFORM.forEach((label, index) => {
    const drawn = seq(closed, index, PLATFORM.length, 0.6);
    if (drawn < 0.01) return;
    const y = (2 - index) * 0.5;

    trace(
      painter,
      [
        [halfWidth, 0, 0],
        [halfWidth + 0.45, 0, 0],
        [railX + 0.3, y, 0],
        [railX + 0.5, y, 0],
      ],
      drawn,
      ink('emerald', 0.45 * alpha),
    );

    project(camera, railX + 0.64, y, 0, S);
    if (S.ok) {
      write(painter, label.toUpperCase(), S.x, S.y, ink('white', 0.85 * alpha * drawn), clamp(S.s * 0.105, 9, 12), {
        spacing: '0.16em',
      });
    }
  });
}
