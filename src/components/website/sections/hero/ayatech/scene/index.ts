import type { Quality } from '../../rig';
import { measure, type Layout, type Metrics } from '../layout';
import type { AyatechRig } from '../rig';
import { aim, createCamera } from './camera';
import { drawFieldLines, drawFieldNodes } from './field';
import { makeSprites, type Painter } from './paint';
import { createPose, settle } from './pose';
import { drawGround, drawOrbit } from './reach';
import { drawDust, drawFragments, drawSignal, drawStreams, hang, scatter } from './signal';
import { drawSystem } from './system';

/*
 * AyaTech's world, drawn.
 *
 * One 2D canvas and a hand-rolled camera (camera.ts) — no second WebGL
 * scene beside the hero's. It reads the rig once a frame and draws whatever
 * that says the story has reached; everything that moves on its own (dust,
 * waves, light running along a line) runs on the frame's clock, so the world
 * is alive while the reader is standing still, and the story only moves when
 * they do.
 *
 * All the words in it that matter are the page's own (AyatechWorld.tsx). The
 * canvas only labels its own drawing.
 */
export type Scene = {
  /** Fits the canvas to a stage this size, and says how the scene sits in it. */
  resize(width: number, height: number): Metrics;
  /** Draws one frame; `now` in milliseconds. */
  render(now: number): void;
  start(): void;
  stop(): void;
  destroy(): void;
};

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

export function createScene({
  canvas,
  rig,
  layout,
  quality,
  createCanvas,
}: {
  canvas: HTMLCanvasElement;
  rig: AyatechRig;
  layout: Layout;
  quality: Quality;
  /** For the light sprites — the scene never reaches for `document` itself. */
  createCanvas: () => HTMLCanvasElement;
}): Scene | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const camera = createCamera();
  const pose = createPose();
  const motes = scatter(quality.particles, layout.dust);
  const hangs = hang(layout.compact);
  const sans = typeof getComputedStyle === 'function' ? getComputedStyle(canvas).fontFamily || 'sans-serif' : 'sans-serif';
  const painter: Painter = { ctx, camera, time: 0, sans, mono: MONO, sprites: makeSprites(createCanvas) };

  let metrics = measure(layout, 1, 1);
  let ratio = 1;
  let frame = 0;
  let running = false;
  /* The pointer's pull on the camera, eased so it trails the hand. */
  let swayX = 0;
  let swayY = 0;

  const resize = (width: number, height: number) => {
    ratio = Math.min(globalThis.devicePixelRatio || 1, quality.dpr[1]);
    metrics = measure(layout, Math.max(1, width), Math.max(1, height));
    canvas.width = Math.round(metrics.width * ratio);
    canvas.height = Math.round(metrics.height * ratio);
    return metrics;
  };

  const render = (now: number) => {
    const time = now / 1000;
    swayX += (rig.pointerX - swayX) * 0.05;
    swayY += (rig.pointerY - swayY) * 0.05;

    /* A breath of drift on top of the score, so no hold is ever a still. */
    aim(camera, rig, metrics, swayX * 0.045 + Math.sin(time * 0.13) * 0.012, swayY * 0.03);
    settle(pose, rig, layout, time);
    painter.time = time;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, metrics.width, metrics.height);
    /* Light on dark: everything adds. */
    ctx.globalCompositeOperation = 'lighter';

    drawStreams(painter, rig);
    drawDust(painter, rig, motes);
    drawGround(painter, rig, layout);
    drawFieldLines(painter, rig, layout, pose);
    drawSystem(painter, rig, layout, pose);
    drawFieldNodes(painter, rig, pose);
    drawFragments(painter, rig, hangs);
    drawSignal(painter, rig);
    drawOrbit(painter, rig, layout);
  };

  const tick = (now: number) => {
    if (!running) return;
    render(now);
    frame = requestAnimationFrame(tick);
  };

  return {
    resize,
    render,
    start() {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(frame);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
