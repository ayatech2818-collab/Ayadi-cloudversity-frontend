'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowDown, ArrowRight, Compass, Hammer, Heart, Rocket, Sprout, Sun, type LucideIcon } from 'lucide-react';
import { memo, useCallback, useMemo, useRef, type PointerEvent } from 'react';

import {
  AmbientLayer,
  fallbackColors,
  glowStyle,
  toAccent,
  useAmbientColors,
  type AmbientColors,
  type RGB,
} from './JourneyAmbient';
import { JourneyVideo } from './JourneyVideo';

type Step = {
  number: string;
  title: string;
  text: string;
  /** Muted, looping clip on the step's card. */
  video: string;
  icon: LucideIcon;
  /** The step's two colours: the card, badge and backdrop until the video
      has a frame. */
  glow: [string, string];
  /** Accent until the video's own colour is read. */
  accent: RGB;
};

/*
 * Videos live in public/videos/journey/, one per step, named after it
 * (nurture.mp4 … flourish.mp4). Until a file is there — or while it loads —
 * the card shows the step's colours. Keep them short, silent and small:
 * 5–10 s, 16:9, ~720p H.264.
 */
const video = (name: string) => `/videos/journey/${name}.mp4`;

const steps: Step[] = [
  {
    number: '01',
    title: 'Nurture',
    text: 'Early childhood filled with love, care, and gentle curiosity.',
    video: video('nurture'),
    icon: Heart,
    glow: ['#f472b6', '#fb923c'],
    accent: toAccent([251, 182, 206]),
  },
  {
    number: '02',
    title: 'Foundation',
    text: 'Strong roots in values, language, and the joy of learning.',
    video: video('foundation'),
    icon: Sprout,
    glow: ['#10b981', '#84cc16'],
    accent: toAccent([190, 242, 100]),
  },
  {
    number: '03',
    title: 'Discover',
    text: 'Finding hidden talents through creativity, play, and exploration.',
    video: video('discover'),
    icon: Compass,
    glow: ['#8b5cf6', '#06b6d4'],
    accent: toAccent([196, 181, 253]),
  },
  {
    number: '04',
    title: 'Build',
    text: 'Growing real skills, good habits, and steady confidence.',
    video: video('build'),
    icon: Hammer,
    glow: ['#f59e0b', '#ef4444'],
    accent: toAccent([253, 216, 120]),
  },
  {
    number: '05',
    title: 'Launch',
    text: 'Stepping into higher learning and careers with clear purpose.',
    video: video('launch'),
    icon: Rocket,
    glow: ['#3b82f6', '#22d3ee'],
    accent: toAccent([147, 197, 253]),
  },
  {
    number: '06',
    title: 'Flourish',
    text: 'Becoming a happy, kind, and successful human who lifts others too.',
    video: video('flourish'),
    icon: Sun,
    glow: ['#facc15', '#ec4899'],
    accent: toAccent([253, 230, 138]),
  },
];

const SUMMARY = 'One journey. Six stages, from first steps to a flourishing life.';

/*
 * Scroll choreography
 * -------------------
 * 0          → INTRO_END : the intro title holds, then lifts away.
 * INTRO_END  → 1         : split evenly between the six steps.
 *
 * Backdrop: each step's own video, shrunk and stretched into a soft wash of
 * colour behind the stage (JourneyAmbient). A step's backdrop fades in over
 * the previous one, which only goes once it is covered, so the colour blends
 * from clip to clip with no dark gap. The stage stays dark throughout; the
 * accents and the icon badge's gradient take on the colours of the video
 * playing.
 *
 * Every animation is driven by MotionValues, so scrolling the section causes
 * zero React re-renders — framer-motion writes the styles directly.
 */
const INTRO_END = 0.1;
const STEP_SPAN = (1 - INTRO_END) / steps.length;
const FADE = STEP_SPAN * 0.32;

/* Opacity keyframes for each step's backdrop. The first is already half up
   behind the intro, and the last stays to the end. */
const AMBIENT_KEYS = steps.map((_, index) => {
  const start = INTRO_END + index * STEP_SPAN;
  const end = start + STEP_SPAN;
  const fadeIn = [start - FADE * 0.6, start + FADE * 0.6];

  if (index === 0) return { input: [0, fadeIn[1], end + FADE * 0.7, end + FADE * 0.75], output: [0.55, 1, 1, 0] };
  if (index === steps.length - 1) return { input: fadeIn, output: [0, 1] };
  return { input: [...fadeIn, end + FADE * 0.7, end + FADE * 0.75], output: [0, 1, 1, 0] };
});

/* Each step's own colours, for the badge before its video has a frame. */
const STEP_COLORS: AmbientColors[] = steps.map((step) => fallbackColors(step.glow));

/* Film grain over the backdrop: hides what is left of the stretched pixels. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const ACCENT_SPRING = { stiffness: 40, damping: 18, mass: 1 };

type Tone = string | MotionValue<string>;

type Palette = {
  ink: Tone;
  inkFaint: Tone;
  accent: Tone;
  chipBg: Tone;
  hairline: Tone;
  watermark: Tone;
  dotRingBg: Tone;
  markerShadow: Tone;
  sparkGlow: Tone;
  badge: Tone;
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

  // ---- accent: follows the colour of the video on stage --------------------
  // Springs, so a new colour glides in, and cost nothing while it holds.
  const accentR = useSpring(steps[0].accent[0], ACCENT_SPRING);
  const accentG = useSpring(steps[0].accent[1], ACCENT_SPRING);
  const accentB = useSpring(steps[0].accent[2], ACCENT_SPRING);

  const setAccent = useCallback(
    ([r, g, b]: RGB) => {
      accentR.set(r);
      accentG.set(g);
      accentB.set(b);
    },
    [accentR, accentG, accentB],
  );

  const accent = useMotionTemplate`rgb(${accentR} ${accentG} ${accentB})`;
  const markerShadow = useMotionTemplate`0 0 0 1px rgb(${accentR} ${accentG} ${accentB} / 0.7)`;
  const sparkGlow = useMotionTemplate`0 0 14px 3px rgb(${accentR} ${accentG} ${accentB} / 0.75)`;

  // ---- badge gradient: three colours read from the video on stage ----------
  const ambient = useAmbientColors(STEP_COLORS[0]);
  const [glowA, glowB, glowC] = ambient.colors;
  const badge = useMotionTemplate`radial-gradient(70% 70% at 25% 20%, ${glowA}, transparent 72%), radial-gradient(70% 70% at 80% 85%, ${glowB}, transparent 72%), linear-gradient(135deg, ${glowC}, ${glowA})`;

  const palette = useMemo<Palette>(
    () => ({
      ink: '#ffffff',
      inkFaint: 'rgba(255,255,255,0.6)',
      accent,
      chipBg: 'rgba(255,255,255,0.12)',
      hairline: 'rgba(255,255,255,0.18)',
      watermark: 'rgba(255,255,255,0.08)',
      dotRingBg: 'rgba(0,0,0,0.55)',
      markerShadow,
      sparkGlow,
      badge,
    }),
    [accent, markerShadow, sparkGlow, badge],
  );

  const activeIndex = useTransform(progress, (value) =>
    Math.min(steps.length - 1, Math.max(0, Math.floor((value - INTRO_END) / STEP_SPAN))),
  );

  // A new step starts from its own colours; its video's take over as soon
  // as its backdrop reads a frame.
  useMotionValueEvent(activeIndex, 'change', (index) => {
    ambient.set(STEP_COLORS[index]);
    setAccent(steps[index].accent);
  });

  const onColors = useCallback(
    (colors: AmbientColors, color: RGB) => {
      ambient.set(colors);
      setAccent(color);
    },
    [ambient, setAccent],
  );

  // The card videos, which the backdrop paints from.
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const getVideo = useCallback((index: number) => videos.current[index] ?? null, []);
  const registerVideo = useCallback((index: number, video: HTMLVideoElement | null) => {
    videos.current[index] = video;
  }, []);

  const introOpacity = useTransform(progress, [0, INTRO_END * 0.8], [1, 0]);
  const introY = useTransform(progress, [0, INTRO_END * 0.8], [0, -90]);
  const introScale = useTransform(progress, [0, INTRO_END * 0.8], [1, 0.94]);
  const introVisibility = useTransform(introOpacity, (value) => (value < 0.01 ? 'hidden' : 'visible'));

  // Timeline fill uses scaleX — a transform, so it never triggers layout.
  const lineScaleX = useTransform(progress, [INTRO_END, 0.97], [0, 1]);

  // Rendered straight from a MotionValue — the counter updates without React.
  const activeNumber = useTransform(activeIndex, (index) => String(index + 1).padStart(2, '0'));

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
    <section ref={sectionRef} aria-labelledby="how-it-works-title" className="relative h-[660vh] bg-emerald-950">
      {/* The stage below is a decorative retelling of this list, so assistive
          tech reads the journey here once, in order, without any animation. */}
      <div className="sr-only">
        <h2 id="how-it-works-title">Your learning journey, simplified</h2>
        <p>{SUMMARY}</p>
        <ol>
          {steps.map((step) => (
            <li key={step.number}>
              <h3>{`Step ${step.number}: ${step.title}`}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* As tall as the screen with a phone's browser bars away (100vh is
          that), and never resized as they come and go. When they are up the
          foot of the stage is behind them, so what stands at the foot — the
          label and the progress rail, below — is placed from the foot of the
          small viewport instead (100lvh − 100svh is nothing on a desktop). */}
      <div
        aria-hidden="true"
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="sticky top-0 isolate h-screen overflow-hidden bg-[#03100c]"
      >
        {/* ---------------- AMBIENT BACKDROP ---------------- */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* Oversized so the swirl never shows an edge. One transform on one
              layer — compositor work only. */}
          <div className="absolute -inset-[18%] will-change-transform motion-safe:animate-[ambient-drift_32s_ease-in-out_infinite]">
            {steps.map((step, index) => (
              <AmbientLayer
                key={step.number}
                index={index}
                progress={progress}
                input={AMBIENT_KEYS[index].input}
                output={AMBIENT_KEYS[index].output}
                activeIndex={activeIndex}
                getVideo={getVideo}
                glow={step.glow}
                onColors={onColors}
              />
            ))}
          </div>

          {/* Scrim and vignette: white text always reads, however bright the clip. */}
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,10,7,0.75))]" />
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: GRAIN }} />

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
              bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_65%)]
              transition-opacity
              duration-500
            "
          />
        </div>

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

          <h2 
            className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-[1.05] tracking-[-0.045em] text-white sm:text-4xl md:mt-7 md:text-6xl lg:text-7xl"
            >
            Your learning journey,
            <br />
            <span className="bg-linear-to-r from-lime-200 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              simplified.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-emerald-50/70 md:mt-6 md:text-lg">
            {SUMMARY}
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
        <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-3 md:px-6 lg:px-12">
          {steps.map((step, index) => (
            <CinematicStep
              key={step.number}
              step={step}
              index={index}
              progress={progress}
              palette={palette}
              onVideoElement={registerVideo}
            />
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
          className="absolute bottom-[calc(100lvh-100svh+1.5rem)] left-6 z-20 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-50/40 lg:left-12"
        >
          Scroll to explore
        </motion.span>

        {/* ---------------- TIMELINE ---------------- */}
        <div className="absolute inset-x-6 bottom-[calc(100lvh-100svh+6.5rem)] z-20 lg:inset-x-12">
          <motion.div style={{ backgroundColor: palette.hairline }} className="relative h-px">
            <motion.div
              style={{ scaleX: lineScaleX, backgroundColor: palette.accent }}
              className="absolute inset-0 h-px origin-left"
            />

            <div className="absolute inset-x-0 top-0 flex justify-between">
              {steps.map((step, index) => (
                <TimelineMarker key={step.number} step={step} index={index} progress={progress} palette={palette} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
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
  onVideoElement,
}: {
  step: Step;
  index: number;
  progress: MotionValue<number>;
  palette: Palette;
  onVideoElement: (index: number, video: HTMLVideoElement | null) => void;
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

  // Negative delays stagger the cards so they never drift in lockstep;
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
          gap-4
          md:gap-8
          lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]
          lg:gap-14
          xl:grid-cols-[minmax(0,580px)_minmax(0,1fr)]
          xl:gap-16
          2xl:grid-cols-[minmax(0,660px)_minmax(0,1fr)]
          2xl:gap-20
        "
      >
        {/* ---------- ART ---------- */}
        <motion.div
          style={{ y: artY }}
          className="relative mx-auto w-full max-w-[420px] [perspective:1000px] lg:mx-0 lg:max-w-none"
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
            <div className="relative mx-auto aspect-square w-full max-w-[270px] overflow-hidden rounded-2xl shadow-[0_40px_90px_-45px_rgba(2,44,34,0.85)] md:mx-0 md:max-w-none md:aspect-auto md:h-[24vh] md:rounded-[2rem] lg:h-auto lg:aspect-video">
              {/* Slow push-in across the step — the classic cinematic move. The
                  video plays only while the step is on the stage. */}
              <motion.div style={{ scale: artScale }} className="absolute inset-0">
                <JourneyVideo
                  src={step.video}
                  glow={step.glow}
                  onScreen={visibility}
                  onVideoElement={(video) => onVideoElement(index, video)}
                />
              </motion.div>

              {/* Soft shade at the foot, under the icon badge */}
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/5 to-transparent" />

              <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/15" />
            </div>

            {/* Gold spark riding the border. Sits outside the clipped card so
                its glow isn't cut off, and only shows where offset-path works. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 supports-[offset-path:inset(0_round_2rem)]:opacity-100"
            >
              <motion.span
                style={{ backgroundColor: palette.accent, opacity: 0.45, animationDelay: sparkTailDelay }}
                className="absolute left-0 top-0 size-1.5 rounded-full blur-[2px] [offset-path:inset(0_round_2rem)] [offset-rotate:0deg] motion-safe:animate-[spark-travel_6s_linear_infinite]"
              />
              <motion.span
                style={{ backgroundColor: palette.accent, boxShadow: palette.sparkGlow, animationDelay: sparkHeadDelay }}
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ pathLength: ringProgress, stroke: palette.accent }}
                />
              </svg>
            </div>

            {/* Glass in the colours of the clip on stage: a gradient of three
                colours read from the video, gliding as it changes. */}
            <div className="relative isolate flex size-full items-center justify-center overflow-hidden rounded-full shadow-[0_18px_40px_-14px_rgba(0,0,0,0.75)]">
              <motion.div className="absolute inset-0 -z-10" style={{ backgroundImage: palette.badge }} />
              {/* Sheen across the top and a hairline rim — what makes it glass. */}
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_30%_0%,rgba(255,255,255,0.45),transparent_55%)]" />
              <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/35" />

              <Icon size={32} strokeWidth={1.5} className="text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)]" />
            </div>
            </div>
          </div>
        </motion.div>

        {/* ---------- TEXT ---------- */}
        <motion.div style={{ y: textY }} className="max-w-xl">
          <motion.span
            style={{ backgroundColor: palette.chipBg, color: palette.accent }}
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em]"
          >
            Step {step.number}
          </motion.span>

          <motion.h3
            style={{ color: palette.ink }}
            className="mt-3 text-3xl font-bold leading-[0.95] tracking-[-0.045em] md:mt-6 md:text-6xl xl:text-7xl"
          >
            {step.title}
          </motion.h3>

          <motion.p
            style={{ color: palette.accent }}
            className="mt-3 max-w-lg text-base font-semibold leading-snug tracking-[-0.01em] md:mt-5 md:text-2xl"
          >
            {step.text}
          </motion.p>

          <motion.div
            style={{ color: palette.inkFaint }}
            className="mt-5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] md:mt-9 md:gap-3 md:text-[11px] md:tracking-[0.25em]"
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
        <motion.span style={{ backgroundColor: palette.accent }} className="size-1.5 rounded-full" />
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
      className="bg-[#03100c] px-4 py-20 md:px-8 lg:px-16 lg:py-28"
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
            {SUMMARY}
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <li
                key={step.number}
                className="relative isolate overflow-hidden rounded-3xl bg-white/[0.06] p-8 ring-1 ring-inset ring-white/15"
              >
                {/* The step's colours, still — the cinematic backdrop at rest. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 opacity-40"
                  style={{
                    background: `radial-gradient(70% 60% at 20% 0%, ${step.glow[0]}, transparent 70%), radial-gradient(70% 60% at 90% 100%, ${step.glow[1]}, transparent 70%)`,
                  }}
                />

                <div className="relative h-44 w-full overflow-hidden rounded-2xl">
                  <JourneyVideo src={step.video} glow={step.glow} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                </div>

                <div
                  style={glowStyle(step.glow, true)}
                  className="relative mt-6 flex size-14 items-center justify-center overflow-hidden rounded-full ring-1 ring-inset ring-white/35"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_30%_0%,rgba(255,255,255,0.45),transparent_55%)]" />
                  <Icon aria-hidden="true" size={24} strokeWidth={1.5} className="relative text-white" />
                </div>

                <h3 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-white">
                  <span className="sr-only">{`Step ${step.number}: `}</span>
                  {step.title}
                </h3>

                <p className="mt-2 text-lg font-semibold text-white/80">
                  {step.text}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
