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
import { describeAlbum, pickHero, type Album, type MediaEntry } from './media';
import { useMediaLibrary } from './useMediaLibrary';

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
 * Shape is dealt out by position rather than measured, so the mosaic is already
 * correct before a single image has loaded — no reflow, no layout shift.
 *
 * These are minimums, not fixed heights. Every tile then stretches to fill its
 * grid row, so a row is always flush along the bottom no matter which shapes
 * land in it — a fixed aspect ratio left a short card sitting in a tall row
 * with a gap under it.
 */
type TileShape = 'wide' | 'portrait' | 'square';

const TILE_HEIGHT: Record<TileShape, string> = {
  wide: 'min-h-[280px] sm:min-h-[320px] lg:min-h-[400px]',
  portrait: 'min-h-[360px] sm:min-h-[420px] lg:min-h-[480px]',
  square: 'min-h-[300px] sm:min-h-[340px] lg:min-h-[380px]',
};

/* An album has no shape of its own, so the mosaic repeats this rhythm. `wide`
   spans two columns, which makes each pair a full row of the three-column grid:
   wide + portrait, then square + wide. */
const MOSAIC: TileShape[] = ['wide', 'portrait', 'square', 'wide'];

/* Shared by the mosaic and its skeleton so nothing jumps when the data lands. */
const ARCHIVE_GRID = 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3';

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Photos' },
  { value: 'video', label: 'Films' },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number]['value'];

/* An album passes a filter when it holds at least one item of that kind. */
const holds = (album: Album, type: TypeFilter) =>
  type === 'all' || (type === 'image' ? album.photoCount : album.filmCount) > 0;

/* Which surface opened the lightbox, and so which media its arrows walk: the
   reel's own frames, or one album's — never on into the next album. Only an
   album hands over a shared element — see the note on Lightbox. */
type Selection = { id: string; origin: 'reel' } | { id: string; origin: 'album'; albumId: string };

/* An album this size or larger gets the row of previews under the lightbox
   frame. With one or two items the arrows already show everything. */
const PREVIEW_MIN = 3;

const HERO_CARDS = [
  { drift: -140, spin: -14, delay: 0, className: 'left-[2%] top-[8%] z-10 h-[62%] w-[47%] -rotate-6' },
  { drift: -220, spin: 12, delay: 0.12, className: 'right-[1%] top-0 z-20 h-[68%] w-[49%] rotate-6' },
  { drift: -90, spin: 6, delay: 0.24, className: 'bottom-[1%] left-[18%] z-30 h-[52%] w-[58%] rotate-2' },
];

export default function MediaGallery() {
  const reduceMotion = useReducedMotion();
  const start = reduceMotion ? 'visible' : 'hidden';

  const heroRef = useRef<HTMLElement>(null);

  const { status, albums, reel, retry } = useMediaLibrary();
  const loading = status === 'loading';
  const hasAlbums = albums.length > 0;

  const [type, setType] = useState<TypeFilter>('all');
  const [selected, setSelected] = useState<Selection | null>(null);

  const heroEntries = useMemo(() => pickHero(albums, HERO_CARDS.length), [albums]);

  /* A tile keeps the shape of its place in the full archive, so filtering
     never reshapes a card that stays on screen. */
  const tiles = useMemo(
    () =>
      albums
        .map((album, index) => ({ album, shape: MOSAIC[index % MOSAIC.length] }))
        .filter(({ album }) => holds(album, type)),
    [albums, type],
  );

  const deck = !selected
    ? []
    : selected.origin === 'reel'
      ? reel
      : (albums.find((album) => album.id === selected.albumId)?.entries ?? []);
  const activeIndex = selected ? deck.findIndex((entry) => entry.id === selected.id) : -1;
  const activeItem = activeIndex >= 0 ? deck[activeIndex] : null;

  /* The hero composition disperses as the section leaves — it hands the page
     over to the reel instead of simply scrolling away. */
  const { scrollYProgress: heroRaw } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroProgress = useSpring(heroRaw, { stiffness: 140, damping: 30, mass: 0.3 });

  /* Opens on the first thing the active filter is showing — a film, when the
     visitor is browsing Films — but the arrows still walk the whole album. */
  const openAlbum = (album: Album) => {
    const first = album.entries.find((entry) => type === 'all' || entry.type === type) ?? album.entries[0];
    setSelected({ id: first.id, origin: 'album', albumId: album.id });
  };

  const step = (delta: number) => {
    if (!deck.length || activeIndex < 0 || !selected) return;
    const next = (activeIndex + delta + deck.length) % deck.length;
    setSelected({ ...selected, id: deck[next].id });
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

          {/* Scroll-linked composition. A card with no media behind it — fewer
              than three items published, or none — keeps its place in the
              composition and shows the branded placeholder. */}
          <div className="relative mx-auto h-[420px] w-full max-w-[460px] sm:h-[480px]">
            {HERO_CARDS.map((card, index) => (
              <FloatingCard
                key={index}
                {...card}
                slot={index}
                entry={heroEntries[index]}
                loading={loading}
                progress={heroProgress}
                reduceMotion={Boolean(reduceMotion)}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* =========================================================
          REEL — vertical scroll drives a horizontal filmstrip
      ========================================================= */}
      <Reel
        items={reel}
        loading={loading}
        reduceMotion={Boolean(reduceMotion)}
        onOpen={(id) => setSelected({ id, origin: 'reel' })}
      />

      {/* =========================================================
          GALLERY — one card per album
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

            {/* Type filter — the pill slides between options via layoutId.
                Hidden when there is nothing to filter. */}
            {loading || hasAlbums ? (
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
            ) : null}
          </div>

          {loading || hasAlbums ? (
            <p aria-live="polite" className="mt-8 text-sm text-muted">
              {loading ? 'Loading albums…' : `${tiles.length} ${tiles.length === 1 ? 'album' : 'albums'}`}
            </p>
          ) : null}

          {loading ? (
            <ArchiveSkeleton />
          ) : status === 'error' ? (
            <ArchiveNotice
              title="The archive could not be loaded."
              body="Something went wrong while fetching the albums. Please try again in a moment."
            >
              <button
                type="button"
                onClick={retry}
                className="mt-6 rounded-full bg-accent-gradient px-5 py-2 text-sm font-bold text-white shadow-lg shadow-accent/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Try again
              </button>
            </ArchiveNotice>
          ) : !hasAlbums ? (
            <ArchiveNotice
              title="No media yet."
              body="Check back soon for photos and films from the Ayadi community."
            />
          ) : tiles.length > 0 ? (
            <ul className={`mt-6 ${ARCHIVE_GRID}`}>
              <AnimatePresence mode="popLayout">
                {tiles.map(({ album, shape }, index) => (
                  <AlbumTile
                    key={album.id}
                    album={album}
                    shape={shape}
                    index={index}
                    reduceMotion={Boolean(reduceMotion)}
                    onOpen={() => openAlbum(album)}
                  />
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <ArchiveNotice title="Nothing here yet." body="Try another filter." />
          )}
        </div>
      </section>

      <Lightbox
        item={activeItem}
        layoutId={selected?.origin === 'album' ? `album-${selected.albumId}` : undefined}
        index={activeIndex}
        total={deck.length}
        previews={selected?.origin === 'album' && deck.length >= PREVIEW_MIN ? deck : null}
        onClose={() => setSelected(null)}
        onStep={step}
        onSelect={(id) => {
          if (selected) setSelected({ ...selected, id });
        }}
      />

      <GetStartedCta />
    </main>
  );
}

/* ==================================================
   HERO COMPOSITION
================================================== */

function FloatingCard({
  entry,
  slot,
  loading,
  progress,
  reduceMotion,
  drift,
  spin,
  delay,
  className,
}: {
  /** Missing while loading, and when fewer items are published than cards. */
  entry?: MediaEntry;
  slot: number;
  loading: boolean;
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
        {loading ? (
          <div className="absolute inset-0 bg-primary/10 motion-safe:animate-pulse" />
        ) : (
          <MediaImage
            key={entry?.id}
            src={entry?.src ?? ''}
            alt=""
            sizes="(min-width: 1024px) 22vw, 45vw"
            seed={entry?.id ?? `hero-${slot}`}
            type={entry?.type ?? 'image'}
            label={entry?.title ?? 'Ayadi Media'}
            priority
          />
        )}

        {entry?.type === 'video' ? (
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

function AlbumTile({
  album,
  shape,
  index,
  reduceMotion,
  onOpen,
}: {
  album: Album;
  shape: TileShape;
  index: number;
  reduceMotion: boolean;
  onOpen: () => void;
}) {
  const tilt = useCardTilt(5);
  const { cover } = album;
  const total = album.entries.length;

  return (
    /* h-full all the way down: the grid row sizes to its tallest tile and every
       other tile in that row stretches to match it. */
    <motion.li
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index * 0.05, 0.25) }}
      className={`h-full ${shape === 'wide' ? 'sm:col-span-2' : ''}`}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        {...tilt}
        className={`${CARD_CHROME} flex w-full flex-col text-left`}
      >
        <CardDecor />

        <motion.div
          layoutId={`album-${album.id}`}
          className={`relative w-full flex-1 overflow-hidden ${TILE_HEIGHT[shape]}`}
        >
            <MediaImage
              src={cover.src}
              alt=""
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              seed={album.id}
              type={cover.type}
              label={album.title}
              className="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />

            {/* A description adds two lines to the caption, so the wash is held
                further up the tile to keep them readable over a bright photo. */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 bg-linear-to-t from-accent-strong/80 to-transparent ${
                album.description ? 'via-accent-strong/40' : 'via-accent-strong/5'
              }`}
            />

            <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20">
              {total} {total === 1 ? 'item' : 'items'}
            </span>

            {/* Only an album with no photos is fronted by a film. */}
            {cover.type === 'video' ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Play aria-hidden="true" size={20} className="ml-0.5 fill-current" />
                </span>
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">{describeAlbum(album)}</p>

              <h3 className="mt-1.5 text-lg font-bold leading-snug tracking-[-0.02em] text-white">{album.title}</h3>

              <time dateTime={album.date} className="mt-1 block text-xs text-white/55">
                {album.displayDate}
              </time>

              {album.description ? (
                <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-white/70">{album.description}</p>
              ) : null}
            </div>
        </motion.div>
      </motion.button>
    </motion.li>
  );
}

function ArchiveSkeleton() {
  return (
    <ul aria-hidden="true" className={`mt-6 ${ARCHIVE_GRID}`}>
      {MOSAIC.map((shape, index) => (
        <li key={index} className={shape === 'wide' ? 'sm:col-span-2' : ''}>
          <div
            className={`flex h-full flex-col justify-end gap-3 rounded-2xl bg-primary/[0.06] p-5 ring-1 ring-inset ring-border motion-safe:animate-pulse ${TILE_HEIGHT[shape]}`}
          >
            <span className="h-2.5 w-24 rounded-full bg-primary/15" />
            <span className="h-5 w-3/5 rounded-full bg-primary/15" />
            <span className="h-2.5 w-20 rounded-full bg-primary/15" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* The one panel behind every "no tiles" state: nothing published, a failed
   request, or a filter with no matches. */
function ArchiveNotice({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="mt-16 rounded-2xl bg-surface px-6 py-24 text-center ring-1 ring-inset ring-border">
      <p className="text-lg font-bold text-accent">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
      {children}
    </div>
  );
}

/* ==================================================
   LIGHTBOX

   Opened from an album, the tile's frame carries the same `layoutId`, so it
   physically expands — and collapses back into that tile from whichever item
   the visitor stepped to. Opened from the reel it fades instead: the reel and
   the mosaic are both on the page at once, and two mounted elements sharing a
   layoutId is undefined behaviour in framer-motion.
================================================== */

function Lightbox({
  item,
  layoutId,
  index,
  total,
  previews,
  onClose,
  onStep,
  onSelect,
}: {
  item: MediaEntry | null;
  layoutId?: string;
  index: number;
  total: number;
  /** Everything the arrows walk, shown as a row under the frame — or null. */
  previews: MediaEntry[] | null;
  onClose: () => void;
  onStep: (delta: number) => void;
  onSelect: (id: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = Boolean(item);
  const isFilm = item?.type === 'video';

  /* The page behind stops scrolling and focus lands on Close — once, on open.
     Tied to the handlers below it would re-run on every step and pull focus
     off whichever preview the visitor had just picked. */
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Escape closes, arrows navigate.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();

      /* With the player focused the arrows scrub the film; they should not
         turn the page as well. */
      if (event.target instanceof HTMLVideoElement) return;

      if (event.key === 'ArrowLeft') onStep(-1);
      if (event.key === 'ArrowRight') onStep(1);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onStep]);

  /* With the previews underneath, the frame gives up height on a short screen
     so the row never falls off the bottom of it. */
  const frameShape = isFilm
    ? `aspect-video bg-black ${previews ? 'max-h-[max(11rem,calc(100dvh-20rem))]' : 'max-h-[65vh]'}`
    : `aspect-[16/10] ${previews ? 'max-h-[max(11rem,calc(100dvh-11rem))]' : ''}`;

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
          /* Frosted glass: the page stays visible, blurred, behind a neutral
             tint dark enough to keep the white captions and controls legible. */
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xl sm:p-8"
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

          {/* The figure holds the frame and its caption; the previews sit under
              it, so a photo's caption stays on the frame's bottom edge. */}
          <div onClick={(event) => event.stopPropagation()} className="w-full max-w-4xl">
            <motion.figure className="relative">
              <motion.div
                layoutId={layoutId}
                initial={layoutId ? undefined : { scale: 0.94, opacity: 0 }}
                animate={layoutId ? undefined : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE }}
                className={`relative w-full overflow-hidden rounded-2xl ring-1 ring-inset ring-white/15 sm:rounded-3xl ${frameShape}`}
              >
                {/* Keyed by item, so stepping never carries one item's playback
                    position or load failure over to the next. */}
                {isFilm ? (
                  <FilmPlayer key={item.id} entry={item} />
                ) : (
                  <>
                    <MediaImage
                      key={item.id}
                      src={item.src}
                      alt={item.alt}
                      sizes="(min-width: 896px) 896px, 100vw"
                      seed={item.id}
                      type={item.type}
                      label={item.title}
                    />

                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-linear-to-t from-accent-strong/90 via-transparent to-transparent"
                    />
                  </>
                )}
              </motion.div>

              {/* Over the photo, but under a film — the player's controls run
                  along the bottom edge, exactly where the caption would sit. */}
              <motion.figcaption
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className={`text-white ${isFilm ? 'px-1 pt-5' : 'absolute inset-x-0 bottom-0 p-6 sm:p-8'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#bef264]">{item.label}</span>
                  <span aria-hidden="true" className="h-px w-5 bg-white/30" />
                  <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-white/55">
                    {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] sm:text-2xl">{item.title}</h2>

                {/* Under a film the caption takes real height, so it is held to
                    two lines when the previews have to fit below it too. */}
                {item.description ? (
                  <p
                    className={`mt-2 max-w-2xl text-sm leading-6 text-white/70 ${isFilm && previews ? 'line-clamp-2' : ''}`}
                  >
                    {item.description}
                  </p>
                ) : null}
              </motion.figcaption>
            </motion.figure>

            {previews ? <PreviewStrip entries={previews} activeId={item.id} onSelect={onSelect} /> : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* A film gets a real player, never next/image. */
function FilmPlayer({ entry }: { entry: MediaEntry }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <MediaImage src="" alt="" sizes="" seed={entry.id} type="video" label="This film could not be played" />;
  }

  return (
    <video
      src={entry.src}
      controls
      playsInline
      preload="metadata"
      aria-label={entry.alt}
      onError={() => setFailed(true)}
      className="absolute inset-0 size-full object-contain"
    />
  );
}

/*
 * Every item in the album, in a row under the frame. Picking one puts it
 * straight into the frame — the frame's contents are keyed by item, so there is
 * no transition to wait through — and the row keeps the current item centred
 * while the arrows move through a long album.
 */
function PreviewStrip({
  entries,
  activeId,
  onSelect,
}: {
  entries: MediaEntry[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const stripRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const active = activeRef.current;
    if (!strip || !active) return;

    /* The row is scrolled directly: scrollIntoView is free to move the page
       behind the lightbox as well. */
    strip.scrollTo({
      left: active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [activeId, reduceMotion]);

  return (
    /* `relative` makes the row the offsetParent the scroll maths measures from.
       The padding leaves room for the active ring, which the scroll container
       would otherwise clip. On a very short screen the row steps aside and the
       arrows carry on alone. */
    <motion.ul
      ref={stripRef}
      aria-label="Album media"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="relative mx-auto mt-4 flex w-fit max-w-full gap-2.5 overflow-x-auto p-1.5 [scrollbar-color:rgba(255,255,255,0.3)_transparent] [scrollbar-width:thin] [@media(max-height:480px)]:hidden"
    >
      {entries.map((entry, index) => {
        const isActive = entry.id === activeId;

        return (
          <li key={entry.id} className="shrink-0">
            <button
              ref={isActive ? activeRef : undefined}
              type="button"
              onClick={() => onSelect(entry.id)}
              aria-label={`Show item ${index + 1} of ${entries.length}`}
              aria-current={isActive ? 'true' : undefined}
              className={`relative block h-14 w-20 overflow-hidden rounded-xl transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-16 sm:w-24 ${
                isActive ? 'opacity-100 ring-2 ring-[#bef264]' : 'opacity-55 ring-1 ring-white/20 hover:opacity-100'
              }`}
            >
              <MediaImage src={entry.src} alt="" sizes="96px" seed={entry.id} type={entry.type} label="" />

              {entry.type === 'video' ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/90 text-primary shadow">
                    <Play aria-hidden="true" size={10} className="ml-px fill-current" />
                  </span>
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </motion.ul>
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
