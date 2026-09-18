'use client';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import { ArrowDown, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import GetStartedCta from '@/components/website/sections/GetStartedCta';
import { CARD_CHROME, CardDecor, useCardTilt } from '@/components/website/ui/card-chrome';

import MediaImage from './MediaImage';
import Reel from './Reel';
import { categories, mediaItems, type MediaAspect, type MediaItem } from './media';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const lineUp: Variants = {
  hidden: { y: '130%' },
  visible: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

/*
 * Shape is declared per item rather than measured, so the mosaic is already
 * correct before a single image has loaded — no reflow, no layout shift.
 *
 * These are minimums, not fixed heights. Every tile then stretches to fill its
 * grid row, so a row is always flush along the bottom no matter which shapes
 * land in it — a fixed aspect ratio left a short card sitting in a tall row
 * with a gap under it.
 */
const MIN_HEIGHT: Record<MediaAspect, string> = {
  portrait: 'min-h-[360px] sm:min-h-[420px] lg:min-h-[480px]',
  landscape: 'min-h-[240px] sm:min-h-[280px] lg:min-h-[300px]',
  square: 'min-h-[300px] sm:min-h-[340px] lg:min-h-[380px]',
};

const FEATURED_MIN_HEIGHT = 'min-h-[280px] sm:min-h-[320px] lg:min-h-[400px]';

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Photos' },
  { value: 'video', label: 'Films' },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number]['value'];

/* Which surface opened the lightbox. Only the mosaic hands over a shared
   element — see the note on Lightbox. */
type Origin = 'grid' | 'reel';
type Selection = { id: number; origin: Origin };

export default function MediaGallery() {
  const reduceMotion = useReducedMotion();
  const start = reduceMotion ? 'visible' : 'hidden';

  const heroRef = useRef<HTMLElement>(null);

  const [type, setType] = useState<TypeFilter>('all');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Selection | null>(null);

  const filtered = useMemo(
    () =>
      mediaItems.filter(
        (item) => (type === 'all' || item.type === type) && (category === 'All' || item.category === category),
      ),
    [type, category],
  );

  /* The reel is not filtered, so an item opened from it may not be in the
     mosaic's current results — fall back to the full set for navigation. */
  const deck = selected?.origin === 'reel' ? mediaItems : filtered;
  const activeIndex = selected ? deck.findIndex((item) => item.id === selected.id) : -1;
  const activeItem = activeIndex >= 0 ? deck[activeIndex] : null;

  /* The hero composition disperses as the section leaves — it hands the page
     over to the reel instead of simply scrolling away. */
  const { scrollYProgress: heroRaw } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroProgress = useSpring(heroRaw, { stiffness: 140, damping: 30, mass: 0.3 });

  const step = (delta: number) => {
    if (!deck.length || activeIndex < 0 || !selected) return;
    const next = (activeIndex + delta + deck.length) % deck.length;
    setSelected({ id: deck[next].id, origin: selected.origin });
  };

  return (
    <main>
      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        ref={heroRef}
        className="relative isolate overflow-hidden px-5 pb-20 pt-32 sm:px-8 sm:pt-36 lg:px-16 lg:pb-24 lg:pt-44"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-32 -top-40 size-[560px] rounded-full bg-primary/[0.08] blur-[130px]" />
          <div className="absolute -left-40 top-1/3 size-[460px] rounded-full bg-accent/[0.07] blur-[130px]" />
        </div>

        <motion.div
          variants={stagger}
          initial={start}
          animate="visible"
          className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div>
            <motion.div variants={fadeUp}>
              <Eyebrow>Ayadi Media</Eyebrow>
            </motion.div>

            <h1 className="mt-7 text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.05em] text-accent sm:text-6xl lg:text-[4.6rem]">
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span variants={lineUp} className="block">
                  Moments
                </motion.span>
              </span>

              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span variants={lineUp} className="block">
                  <span className="relative inline-block">
                    in motion.
                    <motion.span
                      aria-hidden="true"
                      initial={reduceMotion ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.75, duration: 0.8, ease: EASE }}
                      className="absolute -bottom-1 left-0 h-[5px] w-full origin-left rounded-full bg-brand-gradient"
                    />
                  </span>
                </motion.span>
              </span>
            </h1>

            <motion.p variants={fadeUp} className="mt-8 max-w-md text-lg leading-8 text-muted">
              The people, events and stories that bring the Ayadi Cloudversity community to life.
            </motion.p>

            <motion.a
              variants={fadeUp}
              href="#gallery"
              className="group mt-9 inline-flex items-center gap-3 text-sm font-bold text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Explore the archive
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <ArrowDown
                  aria-hidden="true"
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </span>
            </motion.a>
          </div>

          {/* Scroll-linked composition */}
          <div className="relative mx-auto h-[420px] w-full max-w-[460px] sm:h-[480px]">
            <FloatingCard
              item={mediaItems[0]}
              progress={heroProgress}
              reduceMotion={Boolean(reduceMotion)}
              drift={-140}
              spin={-14}
              delay={0}
              className="left-[2%] top-[8%] z-10 h-[62%] w-[47%] -rotate-6"
            />
            <FloatingCard
              item={mediaItems[1]}
              progress={heroProgress}
              reduceMotion={Boolean(reduceMotion)}
              drift={-220}
              spin={12}
              delay={0.12}
              className="right-[1%] top-0 z-20 h-[68%] w-[49%] rotate-6"
            />
            <FloatingCard
              item={mediaItems[4]}
              progress={heroProgress}
              reduceMotion={Boolean(reduceMotion)}
              drift={-90}
              spin={6}
              delay={0.24}
              className="bottom-[1%] left-[18%] z-30 h-[52%] w-[58%] rotate-2"
            />
          </div>
        </motion.div>
      </section>

      {/* =========================================================
          REEL — vertical scroll drives a horizontal filmstrip
      ========================================================= */}
      <Reel reduceMotion={Boolean(reduceMotion)} onOpen={(id) => setSelected({ id, origin: 'reel' })} />

      {/* =========================================================
          GALLERY
      ========================================================= */}
      <section
        id="gallery"
        aria-labelledby="archive-heading"
        className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-16 lg:py-32"
      >
        <div className="mx-auto max-w-[1180px] pb-30">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <motion.div variants={stagger} initial={start} whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp}>
                <Eyebrow>Visual archive</Eyebrow>
              </motion.div>

              <motion.h2
                id="archive-heading"
                variants={fadeUp}
                className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-accent sm:text-4xl"
              >
                Explore the moments.
              </motion.h2>
            </motion.div>

            {/* Type filter — the pill slides between options via layoutId */}
            <div className="flex w-fit rounded-full bg-surface p-1.5 ring-1 ring-inset ring-border">
              {TYPE_FILTERS.map((item) => {
                const isActive = type === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    aria-pressed={isActive}
                    className="relative rounded-full px-5 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="media-type-pill"
                        className="absolute inset-0 rounded-full bg-accent-gradient shadow-lg shadow-accent/25"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    ) : null}

                    <span className={`relative ${isActive ? 'text-white' : 'text-muted'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category filter — wraps rather than scrolls, so no hidden overflow */}
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((name) => {
              const isActive = name === category;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCategory(name)}
                  aria-pressed={isActive}
                  /* ring, not border: the global `* { border-color }` rule in
                     globals.css overrides every border-colour utility. */
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    isActive
                      ? 'bg-accent-gradient text-white shadow-lg shadow-accent/25'
                      : 'bg-surface text-muted ring-1 ring-inset ring-border hover:text-primary hover:ring-primary/30'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <p aria-live="polite" className="mt-6 text-sm text-muted">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          </p>

          {filtered.length > 0 ? (
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, index) => (
                  <GalleryTile
                    key={item.id}
                    item={item}
                    index={index}
                    reduceMotion={Boolean(reduceMotion)}
                    onOpen={() => setSelected({ id: item.id, origin: 'grid' })}
                  />
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className="mt-16 rounded-2xl bg-surface py-24 text-center ring-1 ring-inset ring-border">
              <p className="text-lg font-bold text-accent">Nothing here yet.</p>
              <p className="mt-2 text-sm text-muted">Try another filter.</p>
            </div>
          )}
        </div>
      </section>

      <Lightbox
        item={activeItem}
        origin={selected?.origin ?? 'grid'}
        index={activeIndex}
        total={deck.length}
        onClose={() => setSelected(null)}
        onStep={step}
      />

      <GetStartedCta />
    </main>
  );
}

/* ==================================================
   HERO COMPOSITION
================================================== */

function FloatingCard({
  item,
  progress,
  reduceMotion,
  drift,
  spin,
  delay,
  className,
}: {
  item: MediaItem;
  progress: MotionValue<number>;
  reduceMotion: boolean;
  drift: number;
  spin: number;
  delay: number;
  className: string;
}) {
  const y = useTransform(progress, [0, 1], [0, drift]);
  const rotate = useTransform(progress, [0, 1], [0, spin]);
  const opacity = useTransform(progress, [0, 0.75], [1, 0]);
  const scale = useTransform(progress, [0, 1], [1, 0.82]);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      style={reduceMotion ? undefined : { y, rotate, opacity, scale }}
      className={`absolute overflow-hidden rounded-[1.75rem] bg-surface p-2 shadow-[0_30px_70px_-30px_rgba(6,40,31,0.55)] ring-1 ring-inset ring-border ${className}`}
    >
      <div className="relative size-full overflow-hidden rounded-[1.25rem]">
        <MediaImage
          src={item.image}
          alt=""
          sizes="(min-width: 1024px) 22vw, 45vw"
          seed={item.id}
          type={item.type}
          label={item.category}
          priority
        />

        {item.type === 'video' ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
              <Play aria-hidden="true" size={18} className="ml-0.5 fill-current" />
            </span>
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

/* ==================================================
   MOSAIC
================================================== */

function GalleryTile({
  item,
  index,
  reduceMotion,
  onOpen,
}: {
  item: MediaItem;
  index: number;
  reduceMotion: boolean;
  onOpen: () => void;
}) {
  const tilt = useCardTilt(5);

  return (
    /* h-full all the way down: the grid row sizes to its tallest tile and every
       other tile in that row stretches to match it. */
    <motion.li
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.25) }}
      className={`h-full ${item.featured ? 'sm:col-span-2' : ''}`}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        {...tilt}
        className={`${CARD_CHROME} flex w-full flex-col text-left`}
      >
        <CardDecor />

        <motion.div
          layoutId={`grid-${item.id}`}
          className={`relative w-full flex-1 overflow-hidden ${
            item.featured ? FEATURED_MIN_HEIGHT : MIN_HEIGHT[item.aspect]
          }`}
        >
            <MediaImage
              src={item.image}
              alt=""
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              seed={item.id}
              type={item.type}
              label={item.category}
              className="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-accent-strong/80 via-accent-strong/5 to-transparent"
            />

            <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20">
              {item.type === 'video' ? 'Film' : 'Photo'}
            </span>

            {item.type === 'video' ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Play aria-hidden="true" size={20} className="ml-0.5 fill-current" />
                </span>
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">{item.category}</p>

              <h3 className="mt-1.5 text-lg font-bold leading-snug tracking-[-0.02em] text-white">{item.title}</h3>

              <time dateTime={item.date} className="mt-1 block text-xs text-white/55">
                {item.displayDate}
              </time>
            </div>
        </motion.div>
      </motion.button>
    </motion.li>
  );
}

/* ==================================================
   LIGHTBOX

   Opened from the mosaic, the tile's frame carries the same `layoutId`, so it
   physically expands. Opened from the reel it fades instead: the reel and the
   mosaic are both on the page at once, and two mounted elements sharing a
   layoutId is undefined behaviour in framer-motion.
================================================== */

function Lightbox({
  item,
  origin,
  index,
  total,
  onClose,
  onStep,
}: {
  item: MediaItem | null;
  origin: Origin;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = Boolean(item);

  // Escape closes, arrows navigate, and the page behind stops scrolling.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onStep(-1);
      if (event.key === 'ArrowRight') onStep(1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onStep]);

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} — item ${index + 1} of ${total}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-100 flex items-center justify-center bg-accent-strong/96 p-4 sm:p-8"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-inset ring-white/20 transition-colors duration-300 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
          >
            <X aria-hidden="true" size={18} />
          </button>

          {total > 1 ? (
            <>
              <LightboxArrow side="left" onClick={() => onStep(-1)} />
              <LightboxArrow side="right" onClick={() => onStep(1)} />
            </>
          ) : null}

          <motion.figure onClick={(event) => event.stopPropagation()} className="relative w-full max-w-4xl">
            <motion.div
              layoutId={origin === 'grid' ? `grid-${item.id}` : undefined}
              initial={origin === 'grid' ? undefined : { scale: 0.94, opacity: 0 }}
              animate={origin === 'grid' ? undefined : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl ring-1 ring-inset ring-white/15 sm:rounded-3xl"
            >
              <MediaImage
                src={item.image}
                alt={item.title}
                sizes="(min-width: 896px) 896px, 100vw"
                seed={item.id}
                type={item.type}
                label={item.category}
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-accent-strong/90 via-transparent to-transparent"
              />
            </motion.div>

            <motion.figcaption
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#bef264]">{item.category}</span>
                <span aria-hidden="true" className="h-px w-5 bg-white/30" />
                <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-white/55">
                  {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] sm:text-2xl">{item.title}</h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">{item.description}</p>
            </motion.figcaption>
          </motion.figure>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function LightboxArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={side === 'left' ? 'Previous item' : 'Next item'}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-inset ring-white/20 transition-colors duration-300 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        side === 'left' ? 'left-3 sm:left-6' : 'right-3 sm:right-6'
      }`}
    >
      <Icon aria-hidden="true" size={20} />
    </button>
  );
}

/* ==================================================
   PIECES
================================================== */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
      <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
      {children}
    </span>
  );
}
