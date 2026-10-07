import { INK, type Tint } from '../ink';
import { lerp, TAU, type Vec3 } from '../math';
import { project, spot, type Camera } from './camera';

/*
 * The scene's brushes. Everything is drawn additively — light on dark — so a
 * glow is a soft sprite and a bright line is a thin stroke over a wide faint
 * one. No shadowBlur anywhere: it is the one thing on a 2D canvas that costs
 * real time every frame.
 */
export type Painter = {
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  /** Seconds, for everything that moves on its own. */
  time: number;
  sans: string;
  mono: string;
  sprites: Record<Tint, CanvasImageSource>;
};

const A = spot();
const B = spot();

/** One soft disc of each ink, drawn once and stamped wherever light is. */
export function makeSprites(createCanvas: () => HTMLCanvasElement) {
  const sprites = {} as Record<Tint, CanvasImageSource>;

  for (const tint of Object.keys(INK) as Tint[]) {
    const canvas = createCanvas();
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const light = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      light.addColorStop(0, `rgba(${INK[tint]}, 1)`);
      light.addColorStop(0.2, `rgba(${INK[tint]}, 0.55)`);
      light.addColorStop(0.55, `rgba(${INK[tint]}, 0.13)`);
      light.addColorStop(1, `rgba(${INK[tint]}, 0)`);
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, 64, 64);
    }
    sprites[tint] = canvas;
  }

  return sprites;
}

/** A point of light on the stage. */
export function glow(painter: Painter, x: number, y: number, radius: number, tint: Tint, alpha: number) {
  if (alpha < 0.004 || radius < 0.3) return;
  const { ctx } = painter;
  ctx.globalAlpha = alpha > 1 ? 1 : alpha;
  ctx.drawImage(painter.sprites[tint], x - radius, y - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}

/** A circle on the stage. */
export function ring(painter: Painter, x: number, y: number, radius: number, color: string, width = 1) {
  if (radius < 0.5) return;
  const { ctx } = painter;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.stroke();
}

/** A straight line between two world points. */
export function segment(painter: Painter, from: Vec3, to: Vec3, color: string, width = 1) {
  const { ctx, camera } = painter;
  project(camera, from[0], from[1], from[2], A);
  project(camera, to[0], to[1], to[2], B);
  if (!A.ok || !B.ok) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.stroke();
}

const span = (from: Vec3, to: Vec3) => Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);

/** How long a path through world points is. */
export function lengthOf(points: readonly Vec3[]) {
  let total = 0;
  for (let index = 1; index < points.length; index++) total += span(points[index - 1], points[index]);
  return total;
}

/**
 * A path through world points, drawn from its start as far as `progress`
 * (0 → 1) of its length — which is how everything here draws itself in.
 */
export function trace(painter: Painter, points: readonly Vec3[], progress: number, color: string, width = 1) {
  if (progress <= 0 || points.length < 2) return;
  const { ctx, camera } = painter;

  let left = lengthOf(points) * Math.min(progress, 1);
  let down = false;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();

  for (let index = 1; index < points.length && left > 1e-6; index++) {
    const from = points[index - 1];
    const to = points[index];
    const length = span(from, to);
    const share = length > 0 ? Math.min(1, left / length) : 1;
    left -= length;

    project(camera, from[0], from[1], from[2], A);
    project(camera, lerp(from[0], to[0], share), lerp(from[1], to[1], share), lerp(from[2], to[2], share), B);
    if (!A.ok || !B.ok) {
      down = false;
      continue;
    }
    if (!down) ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    down = true;
  }

  ctx.stroke();
}

/** The world point `share` (0 → 1) of the way along a path, into `out`. */
export function along(points: readonly Vec3[], share: number, out: [number, number, number]) {
  let left = lengthOf(points) * Math.min(Math.max(share, 0), 1);

  for (let index = 1; index < points.length; index++) {
    const from = points[index - 1];
    const to = points[index];
    const length = span(from, to);
    if (left <= length || index === points.length - 1) {
      const part = length > 0 ? Math.min(1, left / length) : 0;
      out[0] = lerp(from[0], to[0], part);
      out[1] = lerp(from[1], to[1], part);
      out[2] = lerp(from[2], to[2], part);
      return out;
    }
    left -= length;
  }

  const [x, y, z] = points[0];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

export type Lettering = {
  align?: CanvasTextAlign;
  mono?: boolean;
  weight?: number;
  /** CSS letter-spacing; ignored where the canvas does not support it. */
  spacing?: string;
};

/** Words on the stage. */
export function write(
  painter: Painter,
  text: string,
  x: number,
  y: number,
  color: string,
  size: number,
  { align = 'left', mono = true, weight = 600, spacing = '0px' }: Lettering = {},
) {
  const { ctx } = painter;
  ctx.font = `${weight} ${size.toFixed(1)}px ${mono ? painter.mono : painter.sans}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if ('letterSpacing' in ctx) ctx.letterSpacing = spacing;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
