import type { DomainId } from '../content';
import { ink, type Tint } from '../ink';
import { fract, TAU } from '../math';

/*
 * What each domain looks like in the field: not an icon on a card, a small
 * structure of its own, drawn in line and alive. Each is drawn about a
 * centre, to a radius of `size` pixels.
 */
export type Glyph = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  alpha: number,
  tint: Tint,
) => void;

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

/* A small network: seven neurons in three layers, one of them firing. */
const NEURON_ROWS = [[-0.5, 0.5], [-0.72, 0, 0.72], [-0.5, 0.5]] as const;
const NEURON_COLUMNS = [-0.66, 0, 0.66] as const;

const ai: Glyph = (ctx, x, y, size, time, alpha, tint) => {
  ctx.strokeStyle = ink(tint, 0.36 * alpha);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let column = 0; column < 2; column++) {
    for (const from of NEURON_ROWS[column]) {
      for (const to of NEURON_ROWS[column + 1]) {
        ctx.moveTo(x + NEURON_COLUMNS[column] * size, y + from * size);
        ctx.lineTo(x + NEURON_COLUMNS[column + 1] * size, y + to * size);
      }
    }
  }
  ctx.stroke();

  const firing = Math.floor(fract(time * 0.5) * 7);
  let neuron = 0;
  for (let column = 0; column < 3; column++) {
    for (const row of NEURON_ROWS[column]) {
      const lit = neuron === firing;
      dot(ctx, x + NEURON_COLUMNS[column] * size, y + row * size, size * (lit ? 0.12 : 0.085), ink(lit ? 'white' : tint, (lit ? 1 : 0.85) * alpha));
      neuron += 1;
    }
  }
};

/* Source: the two chevrons and the slash, and a cursor that blinks. */
const code: Glyph = (ctx, x, y, size, time, alpha, tint) => {
  ctx.strokeStyle = ink(tint, 0.9 * alpha);
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 0.42 * size, y - 0.42 * size);
  ctx.lineTo(x - 0.84 * size, y);
  ctx.lineTo(x - 0.42 * size, y + 0.42 * size);
  ctx.moveTo(x + 0.42 * size, y - 0.42 * size);
  ctx.lineTo(x + 0.84 * size, y);
  ctx.lineTo(x + 0.42 * size, y + 0.42 * size);
  ctx.moveTo(x + 0.16 * size, y - 0.56 * size);
  ctx.lineTo(x - 0.16 * size, y + 0.56 * size);
  ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';

  if (fract(time * 0.9) < 0.55) {
    ctx.fillStyle = ink('white', 0.9 * alpha);
    ctx.fillRect(x + 0.3 * size, y + 0.62 * size, 0.3 * size, Math.max(1.5, 0.08 * size));
  }
};

/* A store: three discs stacked, with something always falling into it. */
const data: Glyph = (ctx, x, y, size, time, alpha, tint) => {
  const across = 0.68 * size;
  const flat = 0.2 * size;
  ctx.strokeStyle = ink(tint, 0.85 * alpha);
  ctx.lineWidth = 1.2;
  for (let level = -1; level <= 1; level++) {
    ctx.beginPath();
    ctx.ellipse(x, y + level * 0.44 * size, across, flat, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x - across, y - 0.44 * size);
  ctx.lineTo(x - across, y + 0.44 * size);
  ctx.moveTo(x + across, y - 0.44 * size);
  ctx.lineTo(x + across, y + 0.44 * size);
  ctx.stroke();

  for (let drop = 0; drop < 3; drop++) {
    const fall = fract(time * 0.45 + drop / 3);
    dot(ctx, x + (drop - 1) * 0.3 * size, y - 1.05 * size + fall * 0.7 * size, size * 0.055, ink('white', alpha * (1 - fall)));
  }
};

/* A cloud, and the line of machines it stands on. Canvas angles run
   clockwise from three o'clock, so each bump is drawn through its top. */
const cloud: Glyph = (ctx, x, y, size, time, alpha, tint) => {
  const base = y + 0.36 * size;
  ctx.strokeStyle = ink(tint, 0.9 * alpha);
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.arc(x - 0.44 * size, base - 0.3 * size, 0.3 * size, Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, base - 0.52 * size, 0.42 * size, Math.PI * 1.1, Math.PI * 1.94);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 0.46 * size, base - 0.3 * size, 0.3 * size, -Math.PI * 0.62, Math.PI / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 0.44 * size, base);
  ctx.lineTo(x + 0.46 * size, base);
  ctx.stroke();

  for (let machine = -1; machine <= 1; machine++) {
    const awake = 0.45 + 0.55 * Math.max(0, Math.sin(time * 1.4 + machine * 1.9));
    dot(ctx, x + machine * 0.34 * size, base + 0.3 * size, size * 0.06, ink('white', alpha * awake));
  }
};

/* A loop that feeds itself: two arrows chasing each other, always turning. */
const automation: Glyph = (ctx, x, y, size, time, alpha, tint) => {
  const radius = 0.62 * size;
  const turn = time * 0.7;
  ctx.strokeStyle = ink(tint, 0.9 * alpha);
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';

  for (let half = 0; half < 2; half++) {
    const from = turn + half * Math.PI + 0.35;
    const to = from + Math.PI - 0.7;
    ctx.beginPath();
    ctx.arc(x, y, radius, from, to);
    ctx.stroke();

    /* The arrowhead: back from the tip, either side of the way it came. */
    const tipX = x + Math.cos(to) * radius;
    const tipY = y + Math.sin(to) * radius;
    const heading = to + Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(tipX - Math.cos(heading - 0.55) * 0.26 * size, tipY - Math.sin(heading - 0.55) * 0.26 * size);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(tipX - Math.cos(heading + 0.55) * 0.26 * size, tipY - Math.sin(heading + 0.55) * 0.26 * size);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';

  dot(ctx, x, y, size * 0.1, ink('white', 0.9 * alpha));
};

/* Services that talk to each other: four of them, and a message going round. */
const SERVICES = [[0, -0.62], [0.62, 0], [0, 0.62], [-0.62, 0]] as const;

const systems: Glyph = (ctx, x, y, size, time, alpha, tint) => {
  const half = 0.17 * size;
  ctx.strokeStyle = ink(tint, 0.4 * alpha);
  ctx.lineWidth = 1;
  ctx.beginPath();
  SERVICES.forEach(([fromX, fromY], index) => {
    const [toX, toY] = SERVICES[(index + 1) % SERVICES.length];
    ctx.moveTo(x + fromX * size, y + fromY * size);
    ctx.lineTo(x + toX * size, y + toY * size);
  });
  ctx.moveTo(x, y - 0.62 * size);
  ctx.lineTo(x, y + 0.62 * size);
  ctx.moveTo(x - 0.62 * size, y);
  ctx.lineTo(x + 0.62 * size, y);
  ctx.stroke();

  ctx.strokeStyle = ink(tint, 0.95 * alpha);
  ctx.lineWidth = 1.3;
  for (const [serviceX, serviceY] of SERVICES) {
    ctx.strokeRect(x + serviceX * size - half, y + serviceY * size - half, half * 2, half * 2);
  }

  const lap = fract(time * 0.35) * SERVICES.length;
  const leg = Math.floor(lap);
  const share = lap - leg;
  const [fromX, fromY] = SERVICES[leg % SERVICES.length];
  const [toX, toY] = SERVICES[(leg + 1) % SERVICES.length];
  dot(ctx, x + (fromX + (toX - fromX) * share) * size, y + (fromY + (toY - fromY) * share) * size, size * 0.075, ink('white', alpha));
};

/* What is next: a shape that has not finished deciding what it is. */
const emerging: Glyph = (ctx, x, y, size, time, alpha, tint) => {
  const radius = 0.7 * size;
  ctx.lineWidth = 1.3;
  ctx.setLineDash([3, 4]);
  for (let side = 0; side < 6; side++) {
    const from = (side / 6) * TAU - Math.PI / 2;
    const to = ((side + 1) / 6) * TAU - Math.PI / 2;
    const there = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(time * 1.3 + side * 1.9));
    ctx.strokeStyle = ink(tint, there * alpha);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(from) * radius, y + Math.sin(from) * radius);
    ctx.lineTo(x + Math.cos(to) * radius, y + Math.sin(to) * radius);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const pulse = 0.2 * size * (1 + 0.25 * Math.sin(time * 2.2));
  ctx.strokeStyle = ink('white', 0.9 * alpha);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - pulse, y);
  ctx.lineTo(x + pulse, y);
  ctx.moveTo(x, y - pulse);
  ctx.lineTo(x, y + pulse);
  ctx.stroke();
};

export const GLYPHS: Record<DomainId, Glyph> = { ai, code, data, cloud, automation, systems, emerging };
