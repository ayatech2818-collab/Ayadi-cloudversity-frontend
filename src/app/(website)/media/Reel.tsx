'use client';

import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { Play } from 'lucide-react';
import { useEffect, useRef } from 'react';

import MediaImage from './MediaImage';
import { REEL_LIMIT, type MediaEntry } from './media';

/*
 * The pinned filmstrip.
 *
 * Two phases share one scroll track:
 *   0    → DEAL : the frames sit in a stack and fan out into the row.
 *   DEAL → 1    : the row travels sideways.
 *
 * On top of that every frame runs its own focus choreography — it lifts,
 * straightens out of 3D and brightens as it crosses the middle of the screen,
 * then tips away and dims at the edges. All of it is one signed MotionValue per
 * card, and all of it is transform + opacity, so the whole section stays on the
 * compositor.
 */
const DEAL = 0.18;

/*
 * How far through the deal the frames stay flat before they start to tip.
 *
 * The strip is a single 3D space. Frames that tip while they are still piled on
 * top of one another pass through each other, and the browser re-sorts them by
 * depth — so the stack visibly reshuffled on the first pixel of scroll. By this
 * point every frame has slid clear of the one before it, and tipping no longer
 * makes any two of them cross.
 */
const TILT_FROM = 0.6;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Scroll track per frame after the first, on top of the one screen the strip is
   pinned for. A full reel of six comes to 320vh; a shorter one is not left
   holding the page for scroll it has no frames to spend on. */
const TRACK_PER_FRAME = 44;

/* A frame still waiting on the API. */
type Frame = MediaEntry | null;

/* While the galleries load the strip holds empty frames, so the pinned track is
   already there when the real ones land. */
const PLACEHOLDERS: Frame[] = Array.from({ length: REEL_LIMIT }, () => null);

type OnOpen = (id: string) => void;

export default function Reel({
  items,
  loading,
  reduceMotion,
  onOpen,
}: {
  /** Drawn from across the published albums — at most REEL_LIMIT of them. */
  items: MediaEntry[];
  loading: boolean;
  reduceMotion: boolean;
  onOpen: OnOpen;
}) {
  const frames = loading ? PLACEHOLDERS : items;

  /* Nothing published: the archive below carries the empty and error states. */
  if (frames.length === 0) return null;

  /* A single frame has nowhere to travel, so it lies flat as well. */
  if (reduceMotion || frames.length < 2) {
    return (
      <section
        aria-labelledby="reel-heading"
        className="bg-linear-to-b from-white via-[#f2f6fb] to-white px-5 py-20 sm:px-8 lg:px-16"
      >
        <ReelHeading count={frames.length} />

        <ul className="mx-auto mt-10 grid max-w-[1180px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {frames.map((frame, index) => (
            <li key={frame?.id ?? index}>
              <ReelFrame frame={frame} index={index} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <PinnedReel frames={frames} onOpen={onOpen} />;
}

function PinnedReel({ frames, onOpen }: { frames: Frame[]; onOpen: OnOpen }) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const progress = useSpring(scrollYProgress, { stiffness: 150, damping: 32, mass: 0.35 });

  /* Travel starts only once the deal has finished. */
  const travel = useTransform(progress, [DEAL, 1], [0, 1]);

  /* A MotionValue, not state — resizing never re-renders the component. */
  const distance = useMotionValue(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const strip = stripRef.current;
    if (!viewport || !strip) return;

    /* The lane's side padding is the page gutter, so the row travels the column
       between the gutters: it starts flush with the heading and its last frame
       stops flush with the far side. offsetWidth and offsetLeft both ignore the
       strip's transform, so a measure taken mid-scroll is still right. */
    const measure = () =>
      distance.set(Math.max(0, strip.offsetWidth - (viewport.clientWidth - 2 * strip.offsetLeft)));

    measure();

    /* The strip is watched too — it changes length when the placeholders give
       way to the real frames, which the viewport's own size never reports. */
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(strip);

    return () => observer.disconnect();
  }, [distance]);

  const x = useTransform<number, number>([travel, distance], ([value, span]) => -(value * span));

  const count = frames.length;

  const current = useTransform(travel, (value) =>
    String(Math.min(count, Math.max(1, Math.round(value * (count - 1)) + 1))).padStart(2, '0'),
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="reel-heading"
      style={{ height: `${100 + (count - 1) * TRACK_PER_FRAME}vh` }}
      className="relative bg-linear-to-b from-white via-[#f2f6fb] to-white"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* Static washes — an animated 130px blur would re-raster every frame */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-1/4 size-[520px] rounded-full bg-primary/[0.10] blur-[130px]" />
          <div className="absolute -right-32 bottom-0 size-[480px] rounded-full bg-accent/[0.09] blur-[130px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(30,43,87,0.10)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_at_50%_45%,black_5%,transparent_70%)]" />
        </div>

        <div className="relative px-5 sm:px-8 lg:px-16">
          <ReelHeading count={count} current={current} />
        </div>

        {/* The lane. Perspective lives here so every frame shares one vanishing
            point instead of each tipping about its own.

            It bleeds to both edges of the screen, but its side padding is the
            page gutter — the column the heading and the progress bar sit in —
            so on a wide screen the stack starts under the heading rather than
            out at the edge.

            The vertical padding is room for the frames' shadows, which the clip
            otherwise slices off flat. The negative margins here and on the
            progress bar take it back, so the spacing is unchanged. */}
        <div
          ref={viewportRef}
          className="relative -mt-6 overflow-hidden px-[max(var(--reel-gutter),calc((100%-1180px)/2))] py-16 [--reel-gutter:1.25rem] [perspective:1600px] sm:[--reel-gutter:2rem] lg:[--reel-gutter:4rem]"
        >
          <motion.ul ref={stripRef} style={{ x }} className="flex w-max gap-6 [transform-style:preserve-3d]">
            {frames.map((frame, index) => (
              <ReelSlide
                key={frame?.id ?? index}
                frame={frame}
                index={index}
                count={count}
                progress={progress}
                travel={travel}
                onOpen={onOpen}
              />
            ))}
          </motion.ul>
        </div>

        <div className="relative -mt-7 px-5 sm:px-8 lg:px-16">
          <div className="mx-auto flex max-w-[1180px] items-center gap-5">
            <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-border">
              <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-brand-gradient" />
            </div>

            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-muted/70">Scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================================================
   ONE FRAME
================================================== */

function ReelSlide({
  frame,
  index,
  count,
  progress,
  travel,
  onOpen,
}: {
  frame: Frame;
  index: number;
  count: number;
  progress: MotionValue<number>;
  travel: MotionValue<number>;
  onOpen: OnOpen;
}) {
  /* 0 while stacked, 1 once dealt out. */
  const dealt = useTransform(progress, [0, DEAL], [0, 1]);

  const span = 1 / Math.max(1, count - 1);
  const centre = index * span;

  /* Signed distance from the middle of the screen, in card widths. */
  const offset = useTransform(travel, (value) => Math.max(-1.6, Math.min(1.6, (value - centre) / span)));
  const away = useTransform(offset, (value) => Math.min(Math.abs(value), 1));

  /* Deal: each card slides back from the stack to its slot in the row. */
  const x = useTransform(dealt, [0, 1], [`${-index * 100}%`, '0%']);
  const rotate = useTransform(dealt, [0, 1], [index % 2 === 0 ? -9 : 9, 0]);

  /* 0 while this frame still overlaps its neighbours, 1 once dealt. */
  const clear = useTransform(dealt, [TILT_FROM, 1], [0, 1]);

  /* Focus: only takes effect once dealt, so the stack stays clean and crisp.
     The tip waits for `clear` rather than `dealt` — see TILT_FROM. */
  const rotateY = useTransform<number, number>([clear, offset], ([c, o]) => c * o * 16);
  const y = useTransform<number, number>([dealt, away], ([d, a]) => d * a * 30);
  const scale = useTransform<number, number>([dealt, away], ([d, a]) => (0.9 + 0.1 * d) * (1 - d * a * 0.14));
  const opacity = useTransform<number, number>([dealt, away], ([d, a]) => 1 - d * a * 0.5);

  /* The active frame's accent bar and caption bloom in. */
  const bloom = useTransform<number, number>([dealt, away], ([d, a]) => d * (1 - a));

  return (
    /* zIndex puts the first frame on top of the stack: it is the one the counter
       starts on, and it stays put while the rest are dealt out from under it. */
    <motion.li
      style={{ x, y, rotate, rotateY, scale, opacity, zIndex: count - index, transformPerspective: 1600 }}
      className="w-[70vw] shrink-0 sm:w-[42vw] lg:w-[25vw]"
    >
      <ReelFrame frame={frame} index={index} bloom={bloom} onOpen={onOpen} />
    </motion.li>
  );
}

function ReelFrame({
  frame,
  index,
  bloom,
  onOpen,
}: {
  frame: Frame;
  index: number;
  bloom?: MotionValue<number>;
  onOpen: OnOpen;
}) {
  if (!frame) {
    return (
      <div
        aria-hidden="true"
        className="aspect-[3/4] rounded-[1.5rem] bg-accent/[0.07] ring-1 ring-black/[0.06] motion-safe:animate-pulse"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(frame.id)}
      className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {/* On white the frames need their own lift — a navy-tinted drop shadow
          does the separating that the dark ground used to do for free. */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-[0_30px_70px_-32px_rgba(30,43,87,0.55)] ring-1 ring-black/[0.06] transition-shadow duration-500 group-hover:shadow-[0_38px_80px_-30px_rgba(30,43,87,0.65)]">
        <MediaImage
          src={frame.src}
          alt=""
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 70vw"
          seed={frame.id}
          type={frame.type}
          label={frame.title}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-[#04150f]/90 via-[#04150f]/10 to-transparent"
        />

        {/* Ghost numeral */}
        <span
          aria-hidden="true"
          className="absolute right-4 top-2 font-mono text-[3.5rem] font-bold leading-none tracking-tighter text-white/12"
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {frame.type === 'video' ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-xl transition-transform duration-300 group-hover:scale-110">
              <Play aria-hidden="true" size={20} className="ml-0.5 fill-current" />
            </span>
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 p-5">
          {/* Grows as the frame reaches the middle of the screen */}
          <motion.span
            aria-hidden="true"
            style={bloom ? { scaleX: bloom } : undefined}
            className="mb-3 block h-[3px] w-14 origin-left rounded-full bg-brand-gradient"
          />

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bef264]">{frame.label}</p>

          <h3 className="mt-1.5 text-lg font-bold leading-snug tracking-[-0.02em] text-white">{frame.title}</h3>

          <motion.p
            style={bloom ? { opacity: bloom } : undefined}
            className="mt-1 text-xs text-white/55"
          >
            <time dateTime={frame.date}>{frame.displayDate}</time>
          </motion.p>
        </div>
      </div>
    </button>
  );
}

/* ==================================================
   HEADING
================================================== */

function ReelHeading({ count, current }: { count: number; current?: MotionValue<string> }) {
  return (
    <div className="mx-auto flex max-w-[1180px] flex-wrap items-end justify-between gap-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <span className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
          The reel
        </span>

        <h2
          id="reel-heading"
          className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-accent sm:text-4xl"
        >
          Keep scrolling. The story moves sideways.
        </h2>
      </motion.div>

      {current ? (
        <p className="font-mono text-sm font-bold tracking-[0.18em] text-muted/70">
          <motion.span className="text-primary">{current}</motion.span>
          <span className="mx-1.5">/</span>
          {String(count).padStart(2, '0')}
        </p>
      ) : null}
    </div>
  );
}
