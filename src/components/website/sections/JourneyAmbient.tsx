'use client';

import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo, useRef, type CSSProperties } from 'react';

export type RGB = [number, number, number];
/** Three colours from a frame: its left side, its right side, and the whole. */
export type AmbientColors = [RGB, RGB, RGB];

/*
 * The Apple Music–style backdrop for one How It Works step: the step's own
 * video, shrunk to a handful of pixels and stretched back over the stage.
 *
 * No CSS blur anywhere. A full-screen blur over a moving video is redone on
 * every frame, and Safari does it on the CPU — the cost that once made the
 * Home journey stutter on iPhones. Shrinking does the blurring instead:
 *
 *   video ──drawImage──▶ 32×18 ──smoothed up──▶ 96×54 canvas ──CSS──▶ screen
 *
 * The small frame is also blended over the last one rather than replacing
 * it, so the colour flows instead of flickering. It reuses the card's video
 * element, so nothing is decoded twice, draws at most 20 times a second, and
 * only while the layer is on screen.
 *
 * Before a frame exists — no file yet, autoplay refused — the step's two
 * fallback colours stand in as soft radial blobs.
 *
 * While its step is the active one, the layer also reads the frame's colours
 * a few times a second, for the accents and the icon badge's gradient.
 */

const SMALL_W = 32;
const SMALL_H = 18;
const SHOW_W = 96;
const SHOW_H = 54;
const PROBE_W = 16;
const PROBE_H = 9;
const FRAME_MS = 1000 / 20;
/** Share of each new frame laid over the last — lower is slower, silkier. */
const BLEND = 0.3;
/** How hard the colour is pushed toward full saturation, 0–1. */
const SATURATE = 0.35;
const SAMPLE_MS = 400;
/** How long a colour change takes to mostly land, in ms. */
const GLIDE_MS = 380;

/* =====================================================
   STATIC COLOURS
===================================================== */

/*
 * A step's two colours as soft blobs. `tinted` adds a wash of both over a dark
 * base, for a surface that has to stand on its own (the card, the badge)
 * rather than glow out of the stage.
 */
export function glowStyle([a, b]: [string, string], tinted = false): CSSProperties {
  const blobs = `radial-gradient(55% 60% at 28% 30%, ${a}, transparent 72%), radial-gradient(60% 55% at 74% 72%, ${b}, transparent 72%)`;
  return tinted
    ? { backgroundColor: '#0b1411', backgroundImage: `${blobs}, linear-gradient(135deg, ${a}66, ${b}66)` }
    : { backgroundImage: blobs };
}

/** A step's two hex colours as a frame's three. */
export function fallbackColors([a, b]: [string, string]): AmbientColors {
  const left = hexToRgb(a);
  const right = hexToRgb(b);
  return [left, right, mix(left, right)];
}

const toCss = ([r, g, b]: RGB) => `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;

/* =====================================================
   THE BACKDROP LAYER
===================================================== */

export const AmbientLayer = memo(function AmbientLayer({
  index,
  progress,
  input,
  output,
  activeIndex,
  getVideo,
  glow,
  onColors,
}: {
  index: number;
  progress: MotionValue<number>;
  /** Opacity keyframes against `progress`. */
  input: number[];
  output: number[];
  activeIndex: MotionValue<number>;
  getVideo: (index: number) => HTMLVideoElement | null;
  glow: [string, string];
  /** The video's colours, and an accent from them, while this is the active step. */
  onColors: (colors: AmbientColors, accent: RGB) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const opacity = useTransform(progress, input, output);
  const visibility = useTransform(opacity, (value) => (value < 0.01 ? 'hidden' : 'visible'));

  useEffect(() => {
    const show = canvasRef.current;
    const showCtx = show?.getContext('2d', { alpha: false });
    if (!show || !showCtx) return;

    const small = document.createElement('canvas');
    small.width = SMALL_W;
    small.height = SMALL_H;
    const smallCtx = small.getContext('2d');

    // Kept apart so only this 16×9 one is CPU-backed for reading.
    const probe = document.createElement('canvas');
    probe.width = PROBE_W;
    probe.height = PROBE_H;
    const probeCtx = probe.getContext('2d', { willReadFrequently: true });
    if (!smallCtx || !probeCtx) return;

    showCtx.imageSmoothingQuality = 'high';

    let raf = 0;
    let lastFrame = 0;
    let lastSample = 0;
    let hasFrame = false;
    let canRead = true;

    const sample = () => {
      probeCtx.drawImage(small, 0, 0, PROBE_W, PROBE_H);
      let data: Uint8ClampedArray;
      try {
        data = probeCtx.getImageData(0, 0, PROBE_W, PROBE_H).data;
      } catch {
        // A video from another origin without CORS: draws fine, can't be read.
        canRead = false;
        return;
      }
      const read = readColors(data);
      if (read) onColors(read.colors, read.accent);
    };

    const paint = (now: number) => {
      raf = requestAnimationFrame(paint);
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      const video = getVideo(index);
      // HAVE_CURRENT_DATA: there is a frame to draw. A paused video's frame
      // only needs drawing once.
      if (!video || video.readyState < 2 || (video.paused && hasFrame)) return;

      smallCtx.globalAlpha = hasFrame ? BLEND : 1;
      smallCtx.drawImage(video, 0, 0, SMALL_W, SMALL_H);

      showCtx.globalCompositeOperation = 'source-over';
      showCtx.globalAlpha = 1;
      showCtx.drawImage(small, 0, 0, SHOW_W, SHOW_H);
      // Keeps each pixel's hue and lightness and lifts its saturation —
      // the vivid Apple Music wash, without a CSS filter.
      showCtx.globalCompositeOperation = 'saturation';
      showCtx.globalAlpha = SATURATE;
      showCtx.fillStyle = '#ff0000';
      showCtx.fillRect(0, 0, SHOW_W, SHOW_H);

      if (!hasFrame) {
        hasFrame = true;
        show.dataset.ready = '';
      }

      if (canRead && activeIndex.get() === index && now - lastSample > SAMPLE_MS) {
        lastSample = now;
        sample();
      }
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    if (visibility.get() === 'visible') start();
    const offVisibility = visibility.on('change', (value) => (value === 'visible' ? start() : stop()));
    // Sample straight away when this step takes over, not up to 400 ms later.
    const offActive = activeIndex.on('change', () => {
      lastSample = 0;
    });

    return () => {
      stop();
      offVisibility();
      offActive();
    };
  }, [index, activeIndex, getVideo, onColors, visibility]);

  return (
    <motion.div style={{ opacity, visibility }} className="absolute inset-0">
      <div className="absolute inset-0" style={glowStyle(glow)} />
      <canvas
        ref={canvasRef}
        width={SHOW_W}
        height={SHOW_H}
        className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 data-ready:opacity-100"
      />
    </motion.div>
  );
});

/* =====================================================
   GLIDING COLOURS (the icon badge's gradient)
===================================================== */

export type Ambient = {
  /** The three colours as CSS, for styles. */
  colors: readonly [MotionValue<string>, MotionValue<string>, MotionValue<string>];
  /** Glide to new colours. */
  set: (next: AmbientColors) => void;
};

/* Runs only while colours are changing; nothing at all while they hold. */
export function useAmbientColors(initial: AmbientColors): Ambient {
  const c0 = useMotionValue(toCss(initial[0]));
  const c1 = useMotionValue(toCss(initial[1]));
  const c2 = useMotionValue(toCss(initial[2]));

  const state = useRef({
    current: initial.map((color) => [...color]) as AmbientColors,
    target: initial,
    raf: 0,
    last: 0,
  });

  useEffect(() => {
    const glide = state.current;
    return () => cancelAnimationFrame(glide.raf);
  }, []);

  const set = useCallback(
    (next: AmbientColors) => {
      const glide = state.current;
      const values = [c0, c1, c2];
      glide.target = next;
      if (glide.raf) return;

      // Eased by time rather than by frame, so it takes as long at 144 Hz as at 60.
      const tick = (now: number) => {
        const dt = glide.last ? Math.min(now - glide.last, 64) : 16;
        glide.last = now;
        const k = 1 - Math.exp(-dt / GLIDE_MS);
        let moving = false;

        glide.current.forEach((color, i) => {
          for (let channel = 0; channel < 3; channel++) {
            const gap = glide.target[i][channel] - color[channel];
            if (Math.abs(gap) > 0.5) {
              color[channel] += gap * k;
              moving = true;
            } else {
              color[channel] = glide.target[i][channel];
            }
          }
          values[i].set(toCss(color));
        });

        glide.raf = moving ? requestAnimationFrame(tick) : 0;
        if (!moving) glide.last = 0;
      };

      glide.raf = requestAnimationFrame(tick);
    },
    [c0, c1, c2],
  );

  return useMemo(() => ({ colors: [c0, c1, c2] as const, set }), [c0, c1, c2, set]);
}

/* =====================================================
   COLOUR
===================================================== */

/*
 * The frame's colours by side — left half, right half, and the whole — so a
 * warm left and a cool right stay where they are. Bright, saturated pixels
 * count for more: a plain mean of a colourful frame is usually mud. Null for a
 * frame with no real colour in it (black, grey, a title card).
 */
function readColors(data: Uint8ClampedArray): { colors: AmbientColors; accent: RGB } | null {
  const sums = [new Float64Array(4), new Float64Array(4), new Float64Array(4)];
  let saturation = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const weight = (sat * (max / 255)) ** 2 + 0.001;
    const x = (i / 4) % PROBE_W;
    saturation += sat;

    for (const sum of [x < PROBE_W / 2 ? sums[0] : sums[1], sums[2]]) {
      sum[0] += r * weight;
      sum[1] += g * weight;
      sum[2] += b * weight;
      sum[3] += weight;
    }
  }

  if (saturation / (data.length / 4) < 0.08) return null;

  const [left, right, whole] = sums.map((sum) => [sum[0] / sum[3], sum[1] / sum[3], sum[2] / sum[3]] as RGB);
  return { colors: [vivid(left), vivid(right), vivid(whole)], accent: toAccent(whole) };
}

/* Rich enough to glow, never neon or washed out. */
function vivid([r, g, b]: RGB): RGB {
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToRgb(h, Math.max(s, 0.55), Math.min(0.6, Math.max(0.42, l)));
}

/* The hue, at a saturation and lightness that always reads on the dark stage. */
export function toAccent([r, g, b]: RGB): RGB {
  const [h, s] = rgbToHsl(r, g, b);
  return hslToRgb(h, Math.max(s, 0.6), 0.76);
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const mix = (a: RGB, b: RGB): RGB => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];

function rgbToHsl(r: number, g: number, b: number): RGB {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255];
}
