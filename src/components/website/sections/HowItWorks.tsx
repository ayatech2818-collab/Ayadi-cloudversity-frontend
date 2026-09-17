'use client';

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowDown, ArrowRight, Compass, GraduationCap, Sparkles, Trophy, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { memo, useMemo, useRef, type PointerEvent } from 'react';

type Step = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: LucideIcon;
};

// Placeholder artwork for now — swap each `image` for a real photo later.
const PLACEHOLDER_IMAGE = '/images/journey-step.svg';

const steps: Step[] = [
  {
    number: '01',
    title: 'Discover',
    subtitle: 'Find your direction.',
    description:
      'Explore courses designed around your interests, goals and ambitions. Find something that sparks your curiosity.',
    image: PLACEHOLDER_IMAGE,
    icon: Compass,
  },
  {
    number: '02',
    title: 'Enroll',
    subtitle: 'Take the first step.',
    description:
      'Choose the learning path that fits you and get access to everything you need to begin your journey.',
    image: PLACEHOLDER_IMAGE,
    icon: GraduationCap,
  },
  {
    number: '03',
    title: 'Learn',
    subtitle: 'Turn knowledge into ability.',
    description:
      'Learn from expert-led content, practical experiences and carefully designed learning resources.',
    image: PLACEHOLDER_IMAGE,
    icon: Sparkles,
  },
  {
    number: '04',
    title: 'Grow',
    subtitle: "Become what's next.",
    description: 'Apply what you learn, build confidence and turn your new skills into real opportunities.',
    image: PLACEHOLDER_IMAGE,
    icon: Trophy,
  },
];

/*
 * Scroll choreography
 * -------------------
 * 0          → INTRO_END : the intro title holds, then lifts away.
 * INTRO_END  → 1         : split evenly between the four steps.
 *
 * Colour grade: the stage travels from deep green to daylight white, so the
 * journey ends where "Grow" belongs. The flip happens inside GRADE_START →
 * GRADE_END, which sits in the gap after step 03 has faded out and before
 * step 04 has faded in — text is never caught mid-transition on a low
 * contrast background.
 *
 * Every animation is driven by MotionValues, so scrolling the section causes
 * zero React re-renders — framer-motion writes the styles directly.
 */
const INTRO_END = 0.1;
const STEP_SPAN = (1 - INTRO_END) / steps.length;
const FADE = STEP_SPAN * 0.32;
const GRADE_START = INTRO_END + STEP_SPAN * 3;
const GRADE_END = GRADE_START + FADE * 0.8;

type Palette = {
  ink: MotionValue<string>;
  inkMuted: MotionValue<string>;
  inkFaint: MotionValue<string>;
  accent: MotionValue<string>;
  chipBg: MotionValue<string>;
  chipText: MotionValue<string>;
  hairline: MotionValue<string>;
  watermark: MotionValue<string>;
  dot: MotionValue<string>;
  dotRingBg: MotionValue<string>;
  markerShadow: MotionValue<string>;
  spark: MotionValue<string>;
  sparkGlow: MotionValue<string>;
};

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  // Scroll-driven storytelling is exactly what "reduce motion" asks us to drop,
  // so those visitors get the same content as a plain, readable section.
  return reduceMotion ? <StaticJourney /> : <CinematicJourney />;
}

/* =====================================================
   CINEMATIC (SCROLL DRIVEN)
===================================================== */

function CinematicJourney() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRect = useRef<DOMRect | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // A light spring turns raw scroll into a gliding, film-like motion.
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
    restDelta: 0.001,
  });

  // ---- colour grade: deep green → daylight -------------------------------
  const stageBg = useTransform(
    progress,
    [0, 0.3, 0.6, GRADE_START, GRADE_END],
    ['#021712', '#04241c', '#0a4a40', '#0d5a4e', '#f3faf6'],
  );

  const grade: [number, number] = [GRADE_START, GRADE_END];
  const ink = useTransform(progress, grade, ['#ffffff', '#06281f']);
  const inkMuted = useTransform(progress, grade, ['rgba(236,253,245,0.72)', 'rgba(6,40,31,0.72)']);
  const inkFaint = useTransform(progress, grade, ['rgba(236,253,245,0.55)', 'rgba(6,40,31,0.55)']);
  const accent = useTransform(progress, grade, ['rgba(217,249,157,0.92)', '#047857']);
  const chipBg = useTransform(progress, grade, ['rgba(255,255,255,0.1)', 'rgba(5,150,105,0.1)']);
  const chipText = useTransform(progress, grade, ['#d9f99d', '#047857']);
  const hairline = useTransform(progress, grade, ['rgba(255,255,255,0.16)', 'rgba(6,40,31,0.14)']);
  const watermark = useTransform(progress, grade, ['rgba(255,255,255,0.06)', 'rgba(4,120,87,0.09)']);
  const dot = useTransform(progress, grade, ['#bef264', '#059669']);
  const dotRingBg = useTransform(progress, grade, ['#04241c', '#ffffff']);
  const markerShadow = useTransform(progress, grade, [
    '0 0 0 1px rgba(190,242,100,0.7)',
    '0 0 0 1px rgba(5,150,105,0.45)',
  ]);

  // Gold spark: deepens to amber so it stays visible once the stage turns white.
  const spark = useTransform(progress, grade, ['#fde047', '#d97706']);
  const sparkGlow = useTransform(progress, grade, [
    '0 0 14px 3px rgba(253,224,71,0.75)',
    '0 0 14px 3px rgba(217,119,6,0.45)',
  ]);

  const palette = useMemo<Palette>(
    () => ({
      ink,
      inkMuted,
      inkFaint,
      accent,
      chipBg,
      chipText,
      hairline,
      watermark,
      dot,
      dotRingBg,
      markerShadow,
      spark,
      sparkGlow,
    }),
    [
      ink,
      inkMuted,
      inkFaint,
      accent,
      chipBg,
      chipText,
      hairline,
      watermark,
      dot,
      dotRingBg,
      markerShadow,
      spark,
      sparkGlow,
    ],
  );

  // Glow, vignette and cursor light are dark-mode devices — they fade out as
  // the stage turns white, and a soft daylight wash takes over.
  const darkDecor = useTransform(progress, [GRADE_START - FADE, GRADE_END], [1, 0]);
  const lightDecor = useTransform(progress, [GRADE_START, GRADE_END], [0, 1]);

  const introOpacity = useTransform(progress, [0, INTRO_END * 0.8], [1, 0]);
  const introY = useTransform(progress, [0, INTRO_END * 0.8], [0, -90]);
  const introScale = useTransform(progress, [0, INTRO_END * 0.8], [1, 0.94]);
  const introVisibility = useTransform(introOpacity, (value) => (value < 0.01 ? 'hidden' : 'visible'));

  // Timeline fill uses scaleX — a transform, so it never triggers layout.
  const lineScaleX = useTransform(progress, [INTRO_END, 0.97], [0, 1]);
  const lineColor = useTransform(progress, grade, ['#bef264', '#059669']);

  const glowOneY = useTransform(progress, [0, 1], ['0%', '38%']);
  const glowTwoY = useTransform(progress, [0, 1], ['0%', '-28%']);
  const floorY = useTransform(progress, [0, 1], ['0%', '-14%']);

  // Rendered straight from a MotionValue — the counter updates without React.
  const activeNumber = useTransform(progress, (value) => {
    const index = Math.floor((value - INTRO_END) / STEP_SPAN) + 1;
    return String(Math.min(steps.length, Math.max(1, index))).padStart(2, '0');
  });

  /*
   * Cursor light. The rect is cached on enter instead of measured on every
   * move (no forced layout), and the blob is positioned with a transform
   * instead of repainting a gradient — compositor-only work.
   */
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const spotOpacity = useMotionValue(0);

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    stageRect.current = event.currentTarget.getBoundingClientRect();
    spotOpacity.set(1);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = stageRect.current;
    if (!rect) return;
    spotX.set(event.clientX - rect.left);
    spotY.set(event.clientY - rect.top);
  };

  const handlePointerLeave = () => spotOpacity.set(0);

  return (
    <section ref={sectionRef} aria-labelledby="how-it-works-title" className="relative h-[460vh] bg-emerald-950">
      {/* The stage below is a decorative retelling of this list, so assistive
          tech reads the journey here once, in order, without any animation. */}
      <div className="sr-only">
        <h2 id="how-it-works-title">Your learning journey, simplified</h2>
        <p>One journey. Four moments that move you from curiosity to confidence.</p>
        <ol>
          {steps.map((step) => (
            <li key={step.number}>
              <h3>{`Step ${step.number}: ${step.title}`}</h3>
              <p>{step.subtitle}</p>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>

      <motion.div
        aria-hidden="true"
        style={{ backgroundColor: stageBg }}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="sticky top-0 isolate h-screen overflow-hidden"
      >
        {/* ---------------- DARK BACKDROP ---------------- */}
        <motion.div style={{ opacity: darkDecor }} className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />

          <motion.div
            style={{ y: glowOneY }}
            className="absolute -left-40 top-[-10%] size-[560px] rounded-full bg-emerald-400/20 blur-3xl"
          />
          <motion.div
            style={{ y: glowTwoY }}
            className="absolute -right-32 bottom-[-15%] size-[520px] rounded-full bg-lime-300/15 blur-3xl"
          />

          {/* Perspective floor — the horizon that sells the 3D depth */}
          <motion.div
            style={{ y: floorY }}
            className="
              absolute
              inset-x-[-40%]
              bottom-[-30%]
              h-[70%]
              [transform:perspective(680px)_rotateX(72deg)]
              [mask-image:linear-gradient(to_top,black,transparent_72%)]
              bg-[linear-gradient(to_right,rgba(190,242,100,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(190,242,100,0.12)_1px,transparent_1px)]
              bg-size-[80px_80px]
            "
          />

          <motion.div
            style={{ x: spotX, y: spotY, opacity: spotOpacity }}
            className="
              absolute
              left-0
              top-0
              size-[620px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-[radial-gradient(circle,rgba(190,242,100,0.16),transparent_65%)]
              transition-opacity
              duration-500
            "
          />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,28,22,0.75))]" />
        </motion.div>

        {/* ---------------- DAYLIGHT BACKDROP ---------------- */}
        <motion.div style={{ opacity: lightDecor }} className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(16,185,129,0.14),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(6,95,70,0.1)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-emerald-100/50 to-transparent" />
        </motion.div>

        {/* ---------------- INTRO ---------------- */}
        <motion.div
          style={{ opacity: introOpacity, y: introY, scale: introScale, visibility: introVisibility }}
          className="absolute inset-x-0 top-[20vh] z-20 px-6 text-center"
        >
          <span
            className="
              inline-flex
              items-center
              gap-2.5
              rounded-full
              bg-white/10
              px-4
              py-1.5
              text-[11px]
              font-bold
              uppercase
              tracking-[0.25em]
              text-emerald-50
              ring-1
              ring-inset
              ring-white/20
            "
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-lime-300 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-lime-300" />
            </span>
            How It Works
          </span>

          <h2 className="mx-auto mt-7 max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-white md:text-6xl lg:text-7xl">
            Your learning journey,
            <br />
            <span className="bg-linear-to-r from-lime-200 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              simplified.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-emerald-50/70 md:text-lg">
            One journey. Four moments that move you from curiosity to confidence.
          </p>

          <div className="mt-10 flex justify-center">
            <motion.span
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex size-11 items-center justify-center rounded-full bg-white/10 text-lime-200 ring-1 ring-inset ring-white/20"
            >
              <ArrowDown size={18} />
            </motion.span>
          </div>
        </motion.div>

        {/* ---------------- STEPS ---------------- */}
        <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 lg:px-12">
          {steps.map((step, index) => (
            <CinematicStep key={step.number} step={step} index={index} progress={progress} palette={palette} />
          ))}
        </div>

        {/* ---------------- CHAPTER COUNTER ---------------- */}
        <motion.div
          style={{ color: palette.ink }}
          className="absolute right-6 top-8 z-20 flex items-baseline gap-1 text-sm font-bold tabular-nums lg:right-12"
        >
          <motion.span>{activeNumber}</motion.span>
          <motion.span style={{ color: palette.inkFaint }}>/ {String(steps.length).padStart(2, '0')}</motion.span>
        </motion.div>

        <motion.span
          style={{ opacity: introOpacity, visibility: introVisibility }}
          className="absolute bottom-6 left-6 z-20 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-50/40 lg:left-12"
        >
          Scroll to explore
        </motion.span>

        {/* ---------------- TIMELINE ---------------- */}
        <div className="absolute inset-x-6 bottom-16 z-20 lg:inset-x-12">
          <motion.div style={{ backgroundColor: palette.hairline }} className="relative h-px">
            <motion.div
              style={{ scaleX: lineScaleX, backgroundColor: lineColor }}
              className="absolute inset-0 h-px origin-left"
            />

            <div className="absolute inset-x-0 top-0 flex justify-between">
              {steps.map((step, index) => (
                <TimelineMarker key={step.number} step={step} index={index} progress={progress} palette={palette} />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* =====================================================
   ONE STEP

   Memoised: `step` is a module constant and every MotionValue is a stable
   reference, so this subtree renders once and is then driven purely by
   scroll — no re-render per frame.
===================================================== */

const CinematicStep = memo(function CinematicStep({
  step,
  index,
  progress,
  palette,
}: {
  step: Step;
  index: number;
  progress: MotionValue<number>;
  palette: Palette;
}) {
  const Icon = step.icon;

  const start = INTRO_END + index * STEP_SPAN;
  const end = start + STEP_SPAN;
  const isLast = index === steps.length - 1;
  const direction = index % 2 === 0 ? 1 : -1;

  // The last step holds on screen instead of flying out into an empty stage.
  const exitOpacity = isLast ? 1 : 0;
  const exitRotate = isLast ? 0 : -direction * 24;
  const exitZ = isLast ? 0 : -420;
  const exitY = isLast ? 0 : -70;

  const opacity = useTransform(progress, [start, start + FADE, end - FADE, end], [0, 1, 1, exitOpacity]);
  const rotateY = useTransform(progress, [start, start + FADE, end - FADE, end], [direction * 24, 0, 0, exitRotate]);
  const z = useTransform(progress, [start, start + FADE, end - FADE, end], [-420, 0, 0, exitZ]);
  const y = useTransform(progress, [start, start + FADE, end - FADE, end], [70, 0, 0, exitY]);

  // Skipping paint entirely while a step is invisible.
  const visibility = useTransform(opacity, (value) => (value < 0.01 ? 'hidden' : 'visible'));

  // Inner layers drift at different rates, which reads as real depth.
  const artY = useTransform(progress, [start, end], [50, -50]);
  const artScale = useTransform(progress, [start, end], [1.08, 1]);
  const textY = useTransform(progress, [start, end], [24, -24]);
  const ringProgress = useTransform(progress, [start + FADE * 0.5, end - FADE], [0, 1]);

  // Negative delays stagger the four cards so they never drift in lockstep;
  // the tail trails the head by a fifth of a second.
  const idleDelay = `${-index * 2.1}s`;
  const sparkHeadDelay = `${-(index * 1.6 + 0.2)}s`;
  const sparkTailDelay = `${-index * 1.6}s`;

  return (
    <motion.div
      style={{ opacity, visibility }}
      className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 lg:px-12"
    >
      <motion.div
        style={{ rotateY, z, y, transformPerspective: 1600 }}
        className="
          mx-auto
          grid
          max-w-[1400px]
          grid-cols-1
          items-center
          gap-12
          lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]
          lg:gap-20
        "
      >
        {/* ---------- ART ---------- */}
        <motion.div
          style={{ y: artY }}
          className="relative mx-auto w-full max-w-[420px] [perspective:1000px] lg:mx-0"
        >
          <motion.span
            style={{ color: palette.watermark }}
            className="pointer-events-none absolute -top-16 right-0 text-[7rem] font-bold leading-none lg:-top-24 lg:text-[10rem]"
          >
            {step.number}
          </motion.span>

          {/* Idle drift — a CSS animation on its own element, so it never
              fights the scroll-driven transforms above it. */}
          <div
            style={{ animationDelay: idleDelay }}
            className="relative motion-safe:animate-[idle-tilt_9s_ease-in-out_infinite]"
          >
            <div className="relative h-[24vh] w-full overflow-hidden rounded-[2rem] shadow-[0_40px_90px_-45px_rgba(2,44,34,0.85)] lg:h-auto lg:aspect-[4/5]">
              {/* Slow push-in across the step — the classic cinematic move */}
              <motion.div style={{ scale: artScale }} className="absolute inset-0">
                <Image
                  src={step.image}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 420px, 90vw"
                  className="object-cover"
                />
              </motion.div>

              {/* Wash keeps every photo inside the brand palette */}
              <div className="absolute inset-0 bg-linear-to-t from-emerald-950/80 via-emerald-950/15 to-transparent" />

              <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/15" />
            </div>

            {/* Gold spark riding the border. Sits outside the clipped card so
                its glow isn't cut off, and only shows where offset-path works. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 supports-[offset-path:inset(0_round_2rem)]:opacity-100"
            >
              <motion.span
                style={{ backgroundColor: palette.spark, opacity: 0.45, animationDelay: sparkTailDelay }}
                className="absolute left-0 top-0 size-1.5 rounded-full blur-[2px] [offset-path:inset(0_round_2rem)] [offset-rotate:0deg] motion-safe:animate-[spark-travel_6s_linear_infinite]"
              />
              <motion.span
                style={{ backgroundColor: palette.spark, boxShadow: palette.sparkGlow, animationDelay: sparkHeadDelay }}
                className="absolute left-0 top-0 size-2.5 rounded-full [offset-path:inset(0_round_2rem)] [offset-rotate:0deg] motion-safe:animate-[spark-travel_6s_linear_infinite]"
              />
            </div>

            {/* Icon badge with the step's own progress ring */}
            <div className="absolute -bottom-7 left-5 size-20 lg:-left-8 lg:size-24">
            <div className="pointer-events-none absolute -inset-2">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="#bef264"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ pathLength: ringProgress }}
                />
              </svg>
            </div>

            <div
              className="
                flex
                size-full
                items-center
                justify-center
                rounded-full
                bg-brand-gradient
                shadow-[0_18px_40px_-14px_rgba(16,185,129,0.85),inset_0_1px_0_rgba(255,255,255,0.35)]
              "
            >
              <Icon size={32} strokeWidth={1.5} className="text-white drop-shadow-[0_3px_8px_rgba(2,44,34,0.45)]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---------- TEXT ---------- */}
        <motion.div style={{ y: textY }} className="max-w-xl">
          <motion.span
            style={{ backgroundColor: palette.chipBg, color: palette.chipText }}
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em]"
          >
            Step {step.number}
          </motion.span>

          <motion.h3
            style={{ color: palette.ink }}
            className="mt-6 text-5xl font-bold leading-[0.95] tracking-[-0.045em] md:text-6xl lg:text-7xl"
          >
            {step.title}
          </motion.h3>

          <motion.p
            style={{ color: palette.accent }}
            className="mt-4 text-xl font-semibold tracking-[-0.01em] md:text-2xl"
          >
            {step.subtitle}
          </motion.p>

          <motion.p
            style={{ color: palette.inkMuted }}
            className="mt-5 max-w-lg text-base leading-relaxed md:text-lg"
          >
            {step.description}
          </motion.p>

          <motion.div
            style={{ color: palette.inkFaint }}
            className="mt-9 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em]"
          >
            Continue your journey
            <motion.span style={{ color: palette.accent }}>
              <ArrowRight size={16} />
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

/* =====================================================
   TIMELINE MARKER
===================================================== */

const TimelineMarker = memo(function TimelineMarker({
  step,
  index,
  progress,
  palette,
}: {
  step: Step;
  index: number;
  progress: MotionValue<number>;
  palette: Palette;
}) {
  const start = INTRO_END + index * STEP_SPAN;
  const end = start + STEP_SPAN;

  const scale = useTransform(progress, [start - FADE, start + FADE, end - FADE, end + FADE], [0.75, 1, 1, 0.75]);
  const opacity = useTransform(progress, [start - FADE, start + FADE, end - FADE, end + FADE], [0.35, 1, 1, 0.35]);

  return (
    <motion.div style={{ scale, opacity }} className="relative flex -translate-y-1/2 flex-col items-center">
      <motion.span
        style={{ backgroundColor: palette.dotRingBg, boxShadow: palette.markerShadow }}
        className="flex size-4 items-center justify-center rounded-full"
      >
        <motion.span style={{ backgroundColor: palette.dot }} className="size-1.5 rounded-full" />
      </motion.span>

      <motion.span
        style={{ color: palette.inkFaint }}
        className="absolute -top-8 text-[10px] font-bold tracking-[0.2em]"
      >
        {step.number}
      </motion.span>

      <motion.span
        style={{ color: palette.inkFaint }}
        className="mt-3 hidden text-[11px] font-semibold uppercase tracking-[0.2em] lg:block"
      >
        {step.title}
      </motion.span>
    </motion.div>
  );
});

/* =====================================================
   REDUCED MOTION FALLBACK
===================================================== */

function StaticJourney() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="bg-linear-to-b from-emerald-950 via-emerald-900 to-[#f3faf6] px-4 py-20 md:px-8 lg:px-16 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-50 ring-1 ring-inset ring-white/20">
            How It Works
          </span>

          <h2
            id="how-it-works-title"
            className="mt-7 text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-white md:text-5xl lg:text-6xl"
          >
            Your learning journey,{' '}
            <span className="bg-linear-to-r from-lime-200 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              simplified.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-emerald-50/70 md:text-lg">
            One journey. Four moments that move you from curiosity to confidence.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            // Cards lighten as the list descends, matching the scroll grade.
            const isLight = index >= 2;

            return (
              <li
                key={step.number}
                className={`relative overflow-hidden rounded-3xl p-8 ring-1 ring-inset ${
                  isLight ? 'bg-white/85 ring-emerald-900/10' : 'bg-white/[0.06] ring-white/15'
                }`}
              >
                <div className="relative h-44 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={step.image}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-emerald-950/70 to-transparent" />
                </div>

                <div className="mt-6 flex size-14 items-center justify-center rounded-full bg-brand-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                  <Icon aria-hidden="true" size={24} strokeWidth={1.5} className="text-white" />
                </div>

                <h3
                  className={`mt-5 text-3xl font-bold tracking-[-0.03em] ${isLight ? 'text-emerald-950' : 'text-white'}`}
                >
                  <span className="sr-only">{`Step ${step.number}: `}</span>
                  {step.title}
                </h3>

                <p className={`mt-2 text-lg font-semibold ${isLight ? 'text-emerald-700' : 'text-lime-200/90'}`}>
                  {step.subtitle}
                </p>

                <p className={`mt-4 text-base leading-relaxed ${isLight ? 'text-emerald-950/75' : 'text-emerald-50/70'}`}>
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
