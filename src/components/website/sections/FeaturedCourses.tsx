'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Clock3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useEffect, useRef, useState, type PointerEvent } from 'react';

import { getCourses, type Course } from '@/lib/api/courses';
import { publicKeys } from '@/lib/query/client';

/* Six published courses, picked at random by the backend. Cached like the
   rest of the site's content (src/lib/query), so the pick holds for the
   cache's freshness window and a new one is drawn after it. */
const FEATURED_COUNT = 6;

const fetchFeaturedCourses = () =>
  getCourses({ is_published: true, limit: FEATURED_COUNT, random: true })
    // Capped here too, in case an older backend ignores `limit`.
    .then((result) => result.slice(0, FEATURED_COUNT));

const AUTOPLAY_MS = 2500; 

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function FeaturedCourses() {
  const reduceMotion = useReducedMotion();
  const featured = useQuery({ queryKey: publicKeys.featuredCourses, queryFn: fetchFeaturedCourses });
  /* null while loading; an empty list if the request fails or nothing is published. */
  const courses: Course[] | null = featured.data ?? (featured.isError && !featured.isFetching ? [] : null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(4);

  /* Autoplay is for someone looking at the carousel. Off screen it would
     only re-render this section every few seconds — in the middle of
     whatever the visitor is actually scrolling through. */
  const sectionRef = useRef<HTMLElement>(null);

  const touchStartX = useRef<number | null>(null);

  const inView = useInView(sectionRef, { amount: 0.1 });

  const maxIndex = Math.max(0, (courses?.length ?? 0) - perView);

  // How many cards fit at the current breakpoint — keeps the slide step in sync
  // with the card widths below (2 / 2 / 4). A phone shows two as well, with the
  // card itself made smaller there (the `max-md:` classes on CourseCard).
  useEffect(() => {
    const breakpoints = [
      { query: window.matchMedia('(min-width: 1024px)'), value: 4 },
      { query: window.matchMedia('(min-width: 768px)'), value: 2 },
    ];

    const update = () => setPerView(breakpoints.find(({ query }) => query.matches)?.value ?? 2);

    update();
    breakpoints.forEach(({ query }) => query.addEventListener('change', update));

    return () => breakpoints.forEach(({ query }) => query.removeEventListener('change', update));
  }, []);

  // Derived rather than stored, so a breakpoint change can never leave the
  // carousel parked past its last slide.
  const activeIndex = Math.min(current, maxIndex);

  useEffect(() => {
    if (paused || reduceMotion || maxIndex === 0 || !inView) return;

    const timer = window.setInterval(() => {
      setCurrent((prev) => (Math.min(prev, maxIndex) >= maxIndex ? 0 : Math.min(prev, maxIndex) + 1));
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, maxIndex, inView]);

  const next = () => setCurrent(activeIndex >= maxIndex ? 0 : activeIndex + 1);
  const previous = () => setCurrent(activeIndex <= 0 ? maxIndex : activeIndex - 1);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="featured-courses-title"
      style={{
      background:
      "linear-gradient(to bottom, #e7f8ef 100%)",
    }}
      className="
        relative
        isolate
        overflow-hidden
        px-6
        pb-30
        sm:px-10
        sm:pb-40
        md:pb-60
        md:px-14
        lg:px-20
        lg:pb-52
        xl:px-24
      "
    >
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Dark dots ground the light editorial area; white dots emerge in the green lower half. */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(24,38,83,0.11)_1px,transparent_1px)] bg-size-[24px_24px] [mask-image:linear-gradient(to_bottom,black_0%,black_32%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[24px_24px] [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_22%,black_38%,black_100%)]" />

        {/* Ambient glows positioned in the deep-green content zone.
            Static: a moving 120px-blur layer of this size is re-rastered every
            frame, forever, for drift you can't actually perceive. */}
        <div className="absolute -left-40 top-[22%] size-[520px] rounded-full bg-emerald-400/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 size-[480px] rounded-full bg-lime-300/15 blur-[120px]" />

        {/* Bottom border kept; top border removed for seamless transition from HowItWorks */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-300/25 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-[1440px] pt-24 sm:pt-28 md:pt-32 lg:pt-36 mb-24">
        {/* HEADER */}
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div>
            <motion.div variants={itemVariants}>
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-white/35
                  px-3
                  py-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-[#182653]
                  ring-1
                  ring-inset
                  ring-[#087f4f]/25
                  backdrop-blur-sm
                  max-md:gap-2
                  max-md:px-3
                  max-md:py-1
                  max-md:text-[9px]
                "
              >
                <span aria-hidden="true" className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-[#0b8f5b] opacity-45 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#0b8f5b]" />
                </span>
                Our Courses
              </span>
            </motion.div>

            <motion.h2
              id="featured-courses-title"
              variants={itemVariants}
              className="
                mt-4
                max-w-2xl
                text-3xl
                font-bold
                leading-[1.08]
                tracking-[-0.04em]
                md:text-4xl
                lg:text-5xl
                text-accent
                max-md:mt-3
                max-md:text-2xl
              "
            >
              Discover your next{' '}
              {/* whileInView, not animate: bg-clip-text repaints the glyphs on
                  every frame, so it should only run while actually on screen. */}
              <motion.span
                whileInView={reduceMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                viewport={{ once: false, amount: 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-linear-to-r from-[#087f4f] via-[#0b8f5b] to-[#087f4f] bg-size-[200%_auto] bg-clip-text text-transparent"
              >
                skill
              </motion.span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mt-3 max-w-xl text-sm leading-relaxed text-[#182653]/65 max-md:mt-2 max-md:text-xs md:text-base"
            >
              Explore 200+ courses designed to help you learn something new and move forward.
            </motion.p>
          </div>

          {/* NAVIGATION */}
          <motion.div variants={itemVariants} className="flex items-center gap-5 max-md:gap-3">
            <span className="text-xs font-bold tabular-nums text-[#182653] max-md:text-[10px]">
              {String(activeIndex + 1).padStart(2, '0')}
              <span className="mx-1 text-[#182653]/35">/</span>
              <span className="text-[#182653]/60">{String(maxIndex + 1).padStart(2, '0')}</span>
            </span>

            <div className="hidden items-center gap-3 md:flex max-md:gap-2">
              <button
                type="button"
                onClick={previous}
                aria-label="Previous courses"
                className="
                  flex
                  size-10
                  max-md:size-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white/40
                  text-[#182653]
                  ring-1
                  ring-inset
                  ring-[#182653]/20
                  backdrop-blur-sm
                  transition
                  duration-300
                  hover:scale-105
                  hover:bg-white/60
                  hover:ring-[#087f4f]/35
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-lime-300
                  active:scale-95
                "
              >
                <ArrowLeft aria-hidden="true" size={17} />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Next courses"
                className="
                  flex
                  size-10
                  max-md:size-9
                  items-center
                  justify-center
                  rounded-full
                  bg-accent
                  text-white
                  shadow-[0_12px_28px_rgba(24,38,83,0.18)]
                  transition
                  duration-300
                  hover:scale-105
                  hover:bg-[#b8f94a]
                  hover:shadow-lg
                  hover:cursor-pointer
                  hover:text-accent
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-lime-300
                  active:scale-95
                "
              >
                <ArrowRight aria-hidden="true" size={17} />
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* CAROUSEL */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          role="group"
          aria-roledescription="carousel"
          onTouchStart={(event) => {
          touchStartX.current = event.changedTouches[0]?.clientX ?? null;
                setPaused(true);
              }}
              onTouchEnd={(event) => {
                const startX = touchStartX.current;
                const endX = event.changedTouches[0]?.clientX;

                if (startX !== null && endX !== undefined) {
                  const difference = startX - endX;

                  if (Math.abs(difference) > 40) {
                    if (difference > 0) {
                      next();
                    } else {
                      previous();
                    }
                  }
                }

                touchStartX.current = null;
                setPaused(false);
              }}
          aria-label="Featured courses"
          className="touch-pan-y overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <motion.div
            animate={{ x: `-${activeIndex * (100 / perView)}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={`flex ${courses !== null && courses.length <= perView ? 'justify-center' : ''}`}
          >
            {courses === null
              ? Array.from({ length: perView }, (_, index) => (
                  <div key={index} aria-hidden="true" className="w-1/2 shrink-0 px-2 sm:px-3 lg:w-1/4">
                    <CourseCardSkeleton />
                  </div>
                ))
              : courses.map((course, index) => {
                  const isVisible = index >= activeIndex && index < activeIndex + perView;

                  return (
                    <div
                      key={course.id}
                      // Off-screen slides must not be focusable or read by screen readers.
                      inert={!isVisible}
                      aria-hidden={!isVisible}
                      className="w-1/2 shrink-0 px-2 sm:px-3 lg:w-1/4"
                    >
                      <CourseCard course={course} />
                    </div>
                  );
                })}
          </motion.div>
        </motion.div>

       {/* BOTTOM */}
        <div className="mt-5 flex flex-row items-center justify-between gap-2 sm:mt-10 sm:gap-6">
         
          {/* PREMIUM AUTOPLAY PROGRESS */}
          <div
            className="flex min-w-0 items-center gap-1.5 sm:gap-4"
            role="group"
            aria-label={`Slide ${activeIndex + 1} of ${maxIndex + 1}`}
          >
            {/* Animated progress segments */}
            <div className="flex items-center gap-1 sm:gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => {
                const isActive = activeIndex === index;
                const isPast = index < activeIndex;

                return (
                  <div
                    key={index}
                    className={`
                      relative h-1 w-5 overflow-hidden rounded-full
                      sm:h-1.5 sm:w-9
                      ${
                        isPast
                          ? 'bg-[#b8f94a]/60'
                          : 'bg-black/20'
                      }
                    `}
                  >
                    <motion.div
                      key={`fill-${activeIndex}-${index}`}
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: isActive ? 1 : isPast ? 1 : 0,
                      }}
                      transition={{
                        duration: isActive ? AUTOPLAY_MS / 1000 : 0.35,
                        ease: isActive ? 'linear' : [0.22, 1, 0.36, 1],
                      }}
                      style={{ transformOrigin: 'left center' }}
                      className={`
                        absolute inset-0 rounded-full
                        ${
                          isActive
                            ? 'bg-linear-to-r from-emerald-400 via-lime-300 to-[#b8f94a] shadow-[0_0_10px_rgba(184,249,74,0.45)]'
                            : 'bg-[#b8f94a]'
                        }
                      `}
                    >
                      {/* Moving light streak on active segment */}
                      {isActive && (
                        <motion.span
                          initial={{ x: '-100%' }}
                          animate={{ x: '350%' }}
                          transition={{
                            duration: 1.1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/70 to-transparent"
                        />
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Animated slide counter */}
            <div className="flex shrink-0 items-baseline gap-1 font-mono text-[10px] tabular-nums sm:text-xs">
              <motion.span
                key={activeIndex}
                initial={{ opacity: 0, y: 5, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="font-bold text-accent"
                aria-live="polite"
              >
                {String(activeIndex + 1).padStart(2, '0')}
              </motion.span>

              <span className="text-black/35">/</span>

              <span className="text-black/55">
                {String(maxIndex + 1).padStart(2, '0')}
              </span>
            </div>
          </div>


          {/* VIEW ALL */}
          <Link
            href="/courses"
                  className="group/all inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-gradient px-2.5 py-1.5 text-[9px] font-bold whitespace-nowrap text-white ring-1 ring-inset ring-emerald-300/30 backdrop-blur-sm transition duration-300 hover:ring-emerald-400/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 sm:gap-1.5 sm:px-4 sm:py-2 sm:text-xs"       >
            View All Courses
            <ArrowRight
              aria-hidden="true"
              size={13}
              className="transition-transform duration-300 group-hover/all:translate-x-1 sm:size-[15px]"
            />
          </Link>
        </div>
      </div>
      
    </section>
  );
}

/* -------------------------------------------------
   COURSE CARD

   Memoised: autoplay ticks and the hover pause re-render the section every few
   seconds, and `course` comes from the query cache, whose objects keep their
   identity until the data itself changes. Without this, all six cards re-render mid-slide.
-------------------------------------------------- */

const CourseCard = memo(function CourseCard({ course }: { course: Course }) {
  const description = course.short_description || course.description;

  // Feeds the cursor position to the spotlight overlay without re-rendering.
  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    <article
      onPointerMove={handlePointerMove}
      className="
        group
        relative
        isolate
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        bg-[#073f34]
        ring-1
        ring-inset
        ring-[#075c48]/35
        shadow-[0_18px_45px_rgba(7,63,52,0.14)]
        transition-[translate,box-shadow,ring-color]
        duration-500
        ease-out
        hover:-translate-y-2
        hover:ring-[#8fd85b]/60
        hover:shadow-[0_28px_64px_rgba(6,63,50,0.28)]
      "
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-8 top-0 z-30 h-px bg-linear-to-r from-transparent via-[#d8ff9a]/80 to-transparent"
      />

      {/* Cursor spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgba(216, 255, 154, 0.16), transparent 68%)',
        }}
      />

      {/* IMAGE */}
      <div className="relative aspect-[16/11] overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          />
        ) : (
          /* No thumbnail uploaded yet: a branded tile rather than an empty box. */
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-brand-gradient">
            <BookOpen size={40} strokeWidth={1.4} className="text-white/70" />
          </div>
        )}

        {/* Emerald wash keeps varied course images inside the section palette. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-[#073f34] via-[#073f34]/12 to-transparent"
        />
        {/* Plain alpha, not mix-blend-multiply: a blend mode forces the
            compositor to read the backdrop for all six cards on every frame of
            a slide, the same cost as a backdrop-filter. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#062f28]/10 transition-opacity duration-500 group-hover:opacity-35"
        />

        {/* LEVEL */}
        {course.level && (
        <span
          className="
            absolute
            left-4
            top-4
            rounded-full
            bg-[#d8ff9a]
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-[#073f34]
            ring-1
            ring-inset
            ring-white/45
            shadow-[0_6px_18px_rgba(7,63,52,0.22)]
            max-md:left-2
            max-md:top-2
            max-md:px-2
            max-md:py-1
            max-md:text-[8px]
          "
        >
          {course.level}
        </span>
        )}

        {course.duration && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#062f28]/85 px-2.5 py-1 text-[10px] font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur-md max-md:bottom-2 max-md:right-2 max-md:gap-1 max-md:px-2 max-md:text-[8px]">
            <Clock3 aria-hidden="true" size={12} />
            {course.duration}
          </span>
        )}
      </div>

      {/* CONTENT */}
      {/* z-20 keeps the text above the spotlight wash */}
      <div className="relative z-20 flex flex-1 flex-col p-5 pt-4 max-md:p-2.5">
        <h3 className="text-base font-semibold leading-snug tracking-[-0.02em] text-white max-md:text-[12px]">
          {course.title}
        </h3>

        {description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/62 max-md:mt-1 max-md:text-[9px] max-md:leading-snug">
            {description}
          </p>
        )}

        {/* LEARN MORE */}
        <div className="mt-auto pt-4 max-md:pt-2.5">
          <Link
            href={`/courses/${course.id}`}
            className="
              flex
              w-full
              items-center
              justify-between
              gap-3
              border-t
              border-white/12
              pt-4
              text-xs
              font-semibold
              text-[#d8ff9a]
              transition-colors
              duration-300
              group-hover:text-white
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-lime-300
              max-md:gap-1.5
              max-md:pt-2.5
              max-md:text-[9px]
            "
          >
            Learn More
            <span className="sr-only">about {course.title}</span>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d8ff9a] text-[#073f34] shadow-[0_6px_16px_rgba(0,0,0,0.16)] transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-105 max-md:size-5">
              <ArrowRight aria-hidden="true" size={14} className="max-md:size-2.5" />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
});

/* The card's shape while the courses load, so the section does not jump. */
function CourseCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-[#073f34] ring-1 ring-inset ring-[#075c48]/25 shadow-[0_18px_45px_rgba(7,63,52,0.12)]">
      <div className="aspect-[16/11] animate-pulse bg-white/12" />
      <div className="flex flex-1 flex-col gap-2.5 p-5 max-md:gap-1.5 max-md:p-2.5">
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/16 max-md:h-3" />
        <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/8" />
        <div className="mt-auto h-9 animate-pulse border-t border-white/10 pt-3 max-md:h-7" />
      </div>
    </div>
  );
}
