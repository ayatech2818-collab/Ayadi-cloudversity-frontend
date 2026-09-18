'use client';

import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { Play } from 'lucide-react';
import { useEffect, useRef } from 'react';

import MediaImage from './MediaImage';
import { reelItems, type MediaItem } from './media';

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

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Reel({
  reduceMotion,
  onOpen,
}: {
  reduceMotion: boolean;
  onOpen: (id: number) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

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
    const element = viewportRef.current;
    if (!element) return;

    const measure = () => distance.set(Math.max(0, element.scrollWidth - element.clientWidth));

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [distance]);

  const x = useTransform<number, number>([travel, distance], ([value, span]) => -(value * span));

  const count = reelItems.length;

  const current = useTransform(travel, (value) =>
    String(Math.min(count, Math.max(1, Math.round(value * (count - 1)) + 1))).padStart(2, '0'),
  );

  if (reduceMotion) {
    return (
      <section
        aria-labelledby="reel-heading"
        className="bg-linear-to-b from-white via-[#f2f6fb] to-white px-5 py-20 sm:px-8 lg:px-16"
      >
        <ReelHeading count={count} />

        <ul className="mx-auto mt-10 grid max-w-[1180px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reelItems.map((item, index) => (
            <li key={item.id}>
              <ReelFrame item={item} index={index} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="reel-heading"
      className="relative h-[320vh] bg-linear-to-b from-white via-[#f2f6fb] to-white"
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
            point instead of each tipping about its own. */}
        <div ref={viewportRef} className="relative mt-10 overflow-hidden [perspective:1600px]">
          <motion.ul style={{ x }} className="flex w-max gap-6 px-5 [transform-style:preserve-3d] sm:px-8 lg:px-16">
            {reelItems.map((item, index) => (
              <ReelSlide
                key={item.id}
                item={item}
                index={index}
                count={count}
                progress={progress}
                travel={travel}
                onOpen={onOpen}
              />
            ))}
          </motion.ul>
        </div>

        <div className="relative mt-9 px-5 sm:px-8 lg:px-16">
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
  item,
  index,
  count,
  progress,
  travel,
  onOpen,
}: {
  item: MediaItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
  travel: MotionValue<number>;
  onOpen: (id: number) => void;
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

  /* Focus: only takes effect once dealt, so the stack stays clean and crisp. */
  const rotateY = useTransform<number, number>([dealt, offset], ([d, o]) => d * o * 16);
  const y = useTransform<number, number>([dealt, away], ([d, a]) => d * a * 30);
  const scale = useTransform<number, number>([dealt, away], ([d, a]) => (0.9 + 0.1 * d) * (1 - d * a * 0.14));
  const opacity = useTransform<number, number>([dealt, away], ([d, a]) => 1 - d * a * 0.5);

  /* The active frame's accent bar and caption bloom in. */
  const bloom = useTransform<number, number>([dealt, away], ([d, a]) => d * (1 - a));

  return (
    <motion.li
      style={{ x, y, rotate, rotateY, scale, opacity, transformPerspective: 1600 }}
      className="w-[70vw] shrink-0 sm:w-[42vw] lg:w-[25vw]"
    >
      <ReelFrame item={item} index={index} bloom={bloom} onOpen={onOpen} />
    </motion.li>
  );
}

function ReelFrame({
  item,
  index,
  bloom,
  onOpen,
}: {
  item: MediaItem;
  index: number;
  bloom?: MotionValue<number>;
  onOpen: (id: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {/* On white the frames need their own lift — a navy-tinted drop shadow
          does the separating that the dark ground used to do for free. */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-[0_30px_70px_-32px_rgba(30,43,87,0.55)] ring-1 ring-black/[0.06] transition-shadow duration-500 group-hover:shadow-[0_38px_80px_-30px_rgba(30,43,87,0.65)]">
        <MediaImage
          src={item.image}
          alt=""
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 70vw"
          seed={item.id}
          type={item.type}
          label={item.category}
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

        {item.type === 'video' ? (
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

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bef264]">{item.category}</p>

          <h3 className="mt-1.5 text-lg font-bold leading-snug tracking-[-0.02em] text-white">{item.title}</h3>

          <motion.p
            style={bloom ? { opacity: bloom } : undefined}
            className="mt-1 text-xs text-white/55"
          >
            <time dateTime={item.date}>{item.displayDate}</time>
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
