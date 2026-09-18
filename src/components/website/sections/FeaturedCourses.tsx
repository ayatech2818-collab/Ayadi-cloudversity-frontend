'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock3, Star } from 'lucide-react';
import Image from 'next/image';
import { memo, useEffect, useState, type PointerEvent } from 'react';

type Course = {
  id: number;
  title: string;
  description: string;
  image: string;
  level: string;
  duration: string;
  rating: string;
};

const courses: Course[] = [
  {
    id: 1,
    title: 'Python Full Stack Development',
    description: 'Build real-world web applications with Python and modern technologies.',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
    level: 'Advanced',
    duration: '12 Weeks',
    rating: '4.9',
  },
  {
    id: 2,
    title: 'Digital Marketing Mastery',
    description: 'Learn modern digital marketing strategies and grow your online presence.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    level: 'Intermediate',
    duration: '8 Weeks',
    rating: '4.8',
  },
  {
    id: 3,
    title: 'UI/UX Design',
    description: 'Create beautiful digital experiences with modern UI/UX principles.',
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
    level: 'Beginner',
    duration: '6 Weeks',
    rating: '4.9',
  },
  {
    id: 4,
    title: 'Data Science & Analytics',
    description: 'Turn data into meaningful insights using modern analytical tools.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    level: 'Intermediate',
    duration: '10 Weeks',
    rating: '4.8',
  },
  {
    id: 5,
    title: 'Artificial Intelligence',
    description: 'Understand AI concepts and build intelligent applications.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    level: 'Advanced',
    duration: '12 Weeks',
    rating: '4.9',
  },
  {
    id: 6,
    title: 'Communication Skills',
    description: 'Develop confident communication skills for academic and professional growth.',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
    level: 'Beginner',
    duration: '4 Weeks',
    rating: '4.7',
  },
];

const AUTOPLAY_MS = 5000;

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
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(4);

  const maxIndex = Math.max(0, courses.length - perView);

  // How many cards fit at the current breakpoint — keeps the slide step in sync
  // with the card widths below (1 / 2 / 4).
  useEffect(() => {
    const breakpoints = [
      { query: window.matchMedia('(min-width: 1024px)'), value: 4 },
      { query: window.matchMedia('(min-width: 768px)'), value: 2 },
    ];

    const update = () => setPerView(breakpoints.find(({ query }) => query.matches)?.value ?? 1);

    update();
    breakpoints.forEach(({ query }) => query.addEventListener('change', update));

    return () => breakpoints.forEach(({ query }) => query.removeEventListener('change', update));
  }, []);

  // Derived rather than stored, so a breakpoint change can never leave the
  // carousel parked past its last slide.
  const activeIndex = Math.min(current, maxIndex);

  useEffect(() => {
    if (paused || reduceMotion || maxIndex === 0) return;

    const timer = window.setInterval(() => {
      setCurrent((prev) => (Math.min(prev, maxIndex) >= maxIndex ? 0 : Math.min(prev, maxIndex) + 1));
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, maxIndex]);

  const next = () => setCurrent(activeIndex >= maxIndex ? 0 : activeIndex + 1);
  const previous = () => setCurrent(activeIndex <= 0 ? maxIndex : activeIndex - 1);

  return (
    <section
  aria-labelledby="featured-courses-title"
  style={{
  background:
    "linear-gradient(to bottom, #e7f8ef 0%, #e7f8ef 18%, #dff5e9 32%, #b8e5cf 45%, #5fae86 60%, #21805f 76%, #0b5a45 90%, #064c3b 100%)",
}}
  className="
    relative
    isolate
    overflow-hidden
    px-4
    pb-30
    sm:pb-40
    md:pb-60
    md:px-8
    lg:px-16
    lg:pb-38
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

      <div className="mx-auto max-w-[1665px] pt-24 sm:pt-28 md:pt-32 lg:pt-36 mb-24">
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
                  gap-2.5
                  rounded-full
                  bg-white/35
                  px-4
                  py-1.5
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-[#182653]
                  ring-1
                  ring-inset
                  ring-[#087f4f]/25
                  backdrop-blur-sm
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
                mt-6
                max-w-2xl
                text-4xl
                font-bold
                leading-[1.08]
                tracking-[-0.04em]
                md:text-5xl
                lg:text-6xl
                text-accent
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
              className="mt-5 max-w-xl text-base leading-relaxed text-[#182653]/65 md:text-lg"
            >
              Explore 200+ courses designed to help you learn something new and move forward.
            </motion.p>
          </div>

          {/* NAVIGATION */}
          <motion.div variants={itemVariants} className="flex items-center gap-5">
            <span className="text-sm font-bold tabular-nums text-[#182653]">
              {String(activeIndex + 1).padStart(2, '0')}
              <span className="mx-1 text-[#182653]/35">/</span>
              <span className="text-[#182653]/60">{String(maxIndex + 1).padStart(2, '0')}</span>
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={previous}
                aria-label="Previous courses"
                className="
                  flex
                  size-12
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
                <ArrowLeft aria-hidden="true" size={19} />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Next courses"
                className="
                  flex
                  size-12
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
                <ArrowRight aria-hidden="true" size={19} />
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
          aria-label="Featured courses"
          className="-mx-2.5 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <motion.div
            animate={{ x: `-${activeIndex * (100 / perView)}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex"
          >
            {courses.map((course, index) => {
              const isVisible = index >= activeIndex && index < activeIndex + perView;

              return (
                <div
                  key={course.id}
                  // Off-screen slides must not be focusable or read by screen readers.
                  inert={!isVisible}
                  aria-hidden={!isVisible}
                  className="w-full shrink-0 px-2.5 md:w-1/2 lg:w-1/4"
                >
                  <CourseCard course={course} />
                </div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* BOTTOM */}
        <div className="mt-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          {/* PROGRESS */}
          <div className="flex items-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrent(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={isActive}
                  className="group/dot py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
                >
                  <motion.span
                    animate={{ width: isActive ? 44 : 14 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`block h-1.5 rounded-full transition-colors duration-300 ${
                      isActive
                        ? 'bg-[#b8f94a]'
                        : 'bg-white/35 group-hover/dot:bg-white/55'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* VIEW ALL */}
          <a
            href="/courses"
            className="
              group/all
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-white/10
              px-5
              py-2.5
              text-sm
              font-bold
              text-white
              ring-1
              ring-inset
              ring-white/20
              backdrop-blur-sm
              transition
              duration-300
              hover:bg-brand-gradient
              hover:text-white
              hover:ring-[#62e62b]
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-lime-300
            "
          >
            View All Courses
            <ArrowRight
              aria-hidden="true"
              size={17}
              className="transition-transform duration-300 group-hover/all:translate-x-1"
            />
          </a>
        </div>
      </div>
      
    </section>
  );
}

/* -------------------------------------------------
   COURSE CARD

   Memoised: autoplay ticks and the hover pause re-render the section every few
   seconds, and `course` comes from a module-level constant, so its identity
   never changes. Without this, all six cards re-render mid-slide.
-------------------------------------------------- */

const CourseCard = memo(function CourseCard({ course }: { course: Course }) {
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
        rounded-3xl
        bg-white
        ring-1
        ring-inset
        ring-white/22
        
        transition-[translate,box-shadow,ring-color]
        duration-500
        ease-out
        hover:-translate-y-2
        hover:ring-[#b8f94a]/45
        hover:shadow-[0_24px_56px_rgba(6,63,50,0.25)]
      "
    >
      {/* Cursor spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgba(190, 242, 100, 0.14), transparent 70%)',
        }}
      />

      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={course.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />

        {/* Emerald wash so every photo sits in the same palette */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-[#063f32]/70 via-[#063f32]/10 to-transparent"
        />
        {/* Plain alpha, not mix-blend-multiply: a blend mode forces the
            compositor to read the backdrop for all six cards on every frame of
            a slide, the same cost as a backdrop-filter. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#0b3b33]/20 transition-opacity duration-500 group-hover:opacity-40"
        />

        {/* LEVEL */}
        <span
          className="
            absolute
            left-4
            top-4
            rounded-full
            bg-[#063f32]/88
            px-3
            py-1.5
            text-[11px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-[#d8ff9a]
            ring-1
            ring-inset
            ring-[#62e62b]/25
          "
        >
          {course.level}
        </span>

        {/* RATING */}
        <span
          className="
            absolute
            right-4
            top-4
            inline-flex
            items-center
            gap-1
            rounded-full
            bg-[#063f32]/88
            px-2.5
            py-1.5
            text-xs
            font-bold
            text-white
            ring-1
            ring-inset
            ring-[#62e62b]/25
          "
        >
          <Star aria-hidden="true" size={13} className="fill-[#b8f94a] text-[#b8f94a]" />
          {course.rating}
          <span className="sr-only">out of 5</span>
        </span>
      </div>

      {/* CONTENT */}
      {/* z-20 keeps the text above the spotlight wash */}
      <div className="relative z-20 flex flex-1 flex-col p-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-black/65">
          <Clock3 aria-hidden="true" size={13} />
          {course.duration}
        </span>

        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.02em] text-accent">{course.title}</h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/80">{course.description}</p>

        {/* LEARN MORE */}
        <div className="mt-auto pt-6">
          <a
            href="/courses"
            className="
              relative
              isolate
              flex
              w-full
              items-center
              justify-center
              gap-2
              overflow-hidden
              rounded-xl
              bg-white/10
              px-5
              py-3
              text-sm
              font-bold
              text-white/80
              ring-1
              ring-inset
              ring-white/20
              transition-[color,background-color,transform]
              duration-300
              group-hover:scale-[1.02]
              group-hover:text-white
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-lime-300
            "
          >
            {/* Fills with lime when the card is hovered */}
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-brand-gradient opacity-80 transition-opacity duration-300 group-hover:opacity-100" 
            />
            Learn More
            <span className="sr-only">about {course.title}</span>
            <ArrowRight aria-hidden="true" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </article>
  );
});
