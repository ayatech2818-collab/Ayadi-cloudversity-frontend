'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowUpRight, BookOpen, GraduationCap, Lightbulb, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, type CSSProperties, type FocusEvent, type MouseEvent, type PointerEvent } from 'react';

import { handleSpotlight } from '@/components/website/ui/card-chrome';

/*
 * One panel, one colour. The three steps of the brand scale used on the courses
 * page — green (Ayadi), navy (AyaTech), teal (Netscape) — so the home page and
 * /courses read as the same family.
 *
 * Every value is a literal Tailwind class: a variant assembled at runtime is
 * never generated, because the scanner only reads source text.
 */
type PathwayTheme = {
  /** Panel base. Content sits bottom-left, so the dark end of each gradient goes there. */
  panel: string;
  restShadow: string;
  openShadow: string;
  /** rgba for the cursor light, and the same hue for the corner ring. */
  spotlight: string;
  cornerRing: string;
  eyebrow: string;
  /** Gradient on the subtitle. */
  headline: string;
  accentBar: string;
  iconFill: string;
  iconSweep: string;
  iconGlow: string;
};

type Pathway = {
  index: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  theme: PathwayTheme;
};

const pathways: Pathway[] = [
  {
    index: '01',
    title: 'Explore',
    subtitle: 'Courses',
    description: '200+ Courses',
    icon: BookOpen,
    theme: {
      panel: 'bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-800',
      restShadow: 'shadow-[0_30px_70px_-35px_rgba(2,44,34,0.8)]',
      openShadow: 'shadow-[0_40px_90px_-30px_rgba(6,95,70,0.55)]',
      spotlight: 'rgba(190, 242, 100, 0.18)',
      cornerRing: 'shadow-[inset_0_0_0_35px_rgba(190,242,100,0.12)]',
      eyebrow: 'text-lime-200/60',
      headline: 'from-lime-200 to-emerald-300',
      accentBar: 'from-lime-300 to-emerald-400',
      iconFill: 'bg-brand-gradient',
      iconSweep: 'bg-[conic-gradient(from_0deg,transparent_0deg,#bef264_70deg,transparent_140deg)]',
      iconGlow: 'shadow-[0_14px_34px_-12px_rgba(16,185,129,0.65)]',
    },
  },
  {
    index: '02',
    title: 'Learn at',
    subtitle: 'Your Pace',
    description: 'Flexible Learning',
    icon: GraduationCap,
    theme: {
      panel: 'bg-accent-gradient',
      restShadow: 'shadow-[0_30px_70px_-35px_rgba(10,16,40,0.85)]',
      openShadow: 'shadow-[0_40px_90px_-30px_rgba(47,68,128,0.55)]',
      spotlight: 'rgba(147, 197, 253, 0.20)',
      cornerRing: 'shadow-[inset_0_0_0_35px_rgba(147,197,253,0.12)]',
      eyebrow: 'text-sky-200/60',
      headline: 'from-sky-200 to-indigo-200',
      accentBar: 'from-sky-300 to-indigo-400',
      iconFill: 'bg-accent-gradient',
      iconSweep: 'bg-[conic-gradient(from_0deg,transparent_0deg,#93c5fd_70deg,transparent_140deg)]',
      iconGlow: 'shadow-[0_14px_34px_-12px_rgba(47,68,128,0.75)]',
    },
  },
  {
    index: '03',
    title: 'Grow your',
    subtitle: 'Skills',
    description: 'Practical Knowledge',
    icon: Lightbulb,
    /* Netscape's teal→navy, run to the top-right so the navy end lands under
       the text. White on `brand-end` is only 3.7:1, which the chip and the
       "Explore" label would fail. */
    theme: {
      panel: 'bg-linear-to-tr from-accent via-brand-teal to-brand-end',
      restShadow: 'shadow-[0_30px_70px_-35px_rgba(4,40,38,0.85)]',
      openShadow: 'shadow-[0_40px_90px_-30px_rgba(13,148,136,0.5)]',
      spotlight: 'rgba(153, 246, 228, 0.18)',
      cornerRing: 'shadow-[inset_0_0_0_35px_rgba(153,246,228,0.12)]',
      eyebrow: 'text-teal-200/60',
      headline: 'from-teal-200 to-emerald-200',
      accentBar: 'from-teal-300 to-emerald-400',
      iconFill: 'bg-linear-to-br from-brand-end to-brand-teal',
      iconSweep: 'bg-[conic-gradient(from_0deg,transparent_0deg,#5eead4_70deg,transparent_140deg)]',
      iconGlow: 'shadow-[0_14px_34px_-12px_rgba(13,148,136,0.7)]',
    },
  },
];

/* Matches the framer easing below, so the entrance and the panels feel related. */
const PANEL_EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
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

/*
 * The three pathways, as expanding panels.
 *
 * Previously three equal cards that only reacted to hover. Now one panel is
 * always open and the other two fold down: hovering, tabbing or tapping a panel
 * opens it, so the section has something to do rather than something to read.
 *
 * Only `flex-grow` and opacity animate. Layout on three siblings is cheap, and
 * it buys a tactile interaction no transform could fake.
 */
export default function LearningPathways() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <section aria-labelledby="learning-pathways-title" className="relative isolate px-4 py-20 md:px-8 lg:px-16 lg:py-28">
      {/* Soft green ambient glow behind the cards */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-40 -z-10 size-[680px] max-w-full -translate-x-1/2 rounded-full bg-hero-ambient blur-3xl"
      />

      <div className="mx-auto max-w-[1665px]">
        {/* Heading */}
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <motion.div variants={itemVariants}>
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-primary/10
                px-4
                py-1.5
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-primary-hover
                ring-1
                ring-inset
                ring-primary/20
              "
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
              Explore &amp; Learn
            </span>
          </motion.div>

          <motion.h2
            id="learning-pathways-title"
            variants={itemVariants}
            className="mt-5 text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-accent md:text-5xl lg:text-6xl"
          >
            Find something worth{' '}
            <span className="bg-brand-gradient bg-clip-text text-transparent">learning</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg"
          >
            Discover courses designed for different goals and interests.
          </motion.p>
        </motion.div>

        {/* Panels — the container has a definite size, so flex-grow divides it
            whichever way the panels happen to be stacked. */}
        <motion.ul
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="flex h-[620px] flex-col gap-4 sm:h-[640px] lg:h-[500px] lg:flex-row lg:gap-5"
        >
          {pathways.map((pathway, index) => (
            <PathwayPanel
              key={pathway.title}
              pathway={pathway}
              index={index}
              isActive={index === active}
              onActivate={() => setActive(index)}
            />
          ))}
        </motion.ul>

        <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-muted/60">
          Hover or tap a pathway to open it
        </p>
      </div>
    </section>
  );
}

type PathwayPanelProps = {
  pathway: Pathway;
  index: number;
  isActive: boolean;
  onActivate: () => void;
};

function PathwayPanel({ pathway, index, isActive, onActivate }: PathwayPanelProps) {
  const Icon = pathway.icon;
  const theme = pathway.theme;

  /* A finger dragging the page past a card should not open it — on touch the
     panel opens from the click below instead. */
  const handlePointerEnter = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === 'mouse') onActivate();
  };

  /* `:focus-visible` separates a Tab from the focus a tap incidentally gives a
     link, which would otherwise let the first tap navigate. */
  const handleFocus = (event: FocusEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.matches(':focus-visible')) onActivate();
  };

  /* With a mouse or a keyboard the panel is already open by the time the click
     lands, so it follows the link. On touch the first tap opens it and the
     second one goes to the courses page. */
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isActive) return;
    event.preventDefault();
    onActivate();
  };

  return (
    /* Entrance animation lives on the <li>; the expansion is a plain CSS
       transition on flex-grow, so the two never fight over a transform.
       The ratio is looser on mobile — a stacked panel needs more of the
       column than a side-by-side one needs of the row. */
    <motion.li
      variants={itemVariants}
      style={{ '--grow': isActive ? '2.6' : '1', '--grow-lg': isActive ? '4' : '1' } as CSSProperties}
      className={`relative min-h-0 min-w-0 grow-[var(--grow)] transition-[flex-grow] duration-700 motion-reduce:transition-none lg:grow-[var(--grow-lg)] ${PANEL_EASE}`}
    >
      <Link
        href="/courses"
        onPointerEnter={handlePointerEnter}
        onPointerMove={handleSpotlight}
        onFocus={handleFocus}
        onClick={handleClick}
        aria-label={`${pathway.title} ${pathway.subtitle} — ${pathway.description}`}
        className={`
          group
          relative
          isolate
          block
          size-full
          overflow-hidden
          rounded-[28px]
          text-left
          outline-lime-300
          ring-1
          ring-inset
          ring-white/10
          transition-shadow
          duration-500
          ease-out
          focus-visible:outline-2
          focus-visible:outline-offset-4
          ${theme.panel}
          ${isActive ? theme.openShadow : theme.restShadow}
        `}
      >
        {/* ---------- DECOR ---------- */}

        {/* Veil — folded panels sit back a step so the open one reads first.
            Black rather than a tint, so it works over all three gradients. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 bg-black transition-opacity duration-700 ${
            isActive ? 'opacity-0' : 'opacity-30'
          }`}
        />

        {/* Cursor spotlight */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 0%), ${theme.spotlight}, transparent 70%)`,
          }}
        />

        {/* Ghost icon — fills the width an open panel gains on a wide screen */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-10 -right-10 -z-10 hidden text-white/[0.055] transition-opacity duration-700 lg:block ${
            isActive ? 'opacity-100 delay-150' : 'opacity-0'
          }`}
        >
          <Icon size={300} strokeWidth={0.5} />
        </span>

        {/* Corner ring — inset shadow, since the global `* { border-color }` rule would override a border colour */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -right-20 -top-20 size-52 rounded-full transition-transform duration-700 ease-out ${
            theme.cornerRing
          } ${isActive ? 'scale-110' : 'scale-100'}`}
        />

        {/* Top sheen */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent"
        />

        {/* ---------- FOLDED ---------- */}
        {/* Bottom-aligned row while stacked, a full-height column once the
            panels sit side by side. */}
        <span
          aria-hidden="true"
          className={`absolute inset-0 flex items-end gap-4 p-6 transition-opacity duration-500 md:p-8 lg:flex-col lg:items-start lg:justify-between lg:gap-0 ${
            isActive ? 'opacity-0' : 'opacity-100 delay-200'
          }`}
        >
          <PathwayIcon icon={Icon} theme={theme} isActive={isActive} delay={index * 0.7} size="sm" />

          <span className="block">
            <span className={`block font-mono text-[11px] font-bold tracking-[0.22em] ${theme.eyebrow}`}>
              {pathway.index}
            </span>

            <span
              className={`mt-1.5 block bg-linear-to-r bg-clip-text text-xl font-semibold tracking-[-0.02em] text-transparent lg:text-2xl ${theme.headline}`}
            >
              {pathway.subtitle}
            </span>
          </span>
        </span>

        {/* ---------- OPEN ---------- */}
        <span
          aria-hidden="true"
          className={`absolute inset-0 flex flex-col p-6 transition-all duration-500 md:p-8 ${
            isActive ? 'opacity-100 delay-150' : 'translate-y-3 opacity-0'
          }`}
        >
          <PathwayIcon icon={Icon} theme={theme} isActive={isActive} delay={index * 0.7} size="lg" />

          <span className="mt-auto block max-w-md pt-6">
            <span className={`block font-mono text-[11px] font-bold tracking-[0.22em] ${theme.eyebrow}`}>
              {pathway.index}
            </span>

            <span className="mt-2 block text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-3xl">
              {pathway.title}
              <br />
              <span className={`bg-linear-to-r bg-clip-text text-transparent ${theme.headline}`}>
                {pathway.subtitle}
              </span>
            </span>

            <span className="mt-4 inline-flex w-fit items-center rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
              {pathway.description}
            </span>

            <span className="mt-5 block h-px w-full bg-linear-to-r from-white/30 via-white/12 to-transparent" />

            <span className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm font-semibold tracking-wide text-white">Explore</span>

              {/* Lime on all three — the one constant across the set */}
              <span
                className="
                  relative
                  flex
                  size-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-lime-300
                  text-emerald-950
                  shadow-lg
                  shadow-black/40
                  transition-transform
                  duration-300
                  ease-out
                  group-hover:-translate-y-1
                  group-hover:translate-x-1
                "
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-lime-300/50 opacity-0 group-hover:opacity-100 motion-safe:group-hover:animate-ping"
                />
                <ArrowUpRight aria-hidden="true" size={20} strokeWidth={2.5} className="relative" />
              </span>
            </span>
          </span>
        </span>

        {/* Bottom accent line — tracks the open panel rather than the cursor,
            so keyboard and touch get it too */}
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-1 origin-left bg-linear-to-r transition-transform duration-700 ease-out ${
            theme.accentBar
          } ${isActive ? 'scale-x-100' : 'scale-x-[0.2]'}`}
        />
      </Link>
    </motion.li>
  );
}

/*
 * The original card's icon, unchanged in behaviour: idle bob, a conic sweep
 * around the tile, and a gradient fill underneath — now in each panel's own
 * colour.
 *
 * The sweep and the tilt key off `isActive` rather than `:hover`, so a panel
 * opened by Tab or by a tap animates exactly like one opened by a mouse.
 */
function PathwayIcon({
  icon: Icon,
  theme,
  isActive,
  delay,
  size,
}: {
  icon: LucideIcon;
  theme: PathwayTheme;
  isActive: boolean;
  delay: number;
  size: 'sm' | 'lg';
}) {
  const isLarge = size === 'lg';

  return (
    <span
      className="block w-fit motion-safe:animate-[icon-float_4.5s_ease-in-out_infinite]"
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        className={`
          relative
          block
          overflow-hidden
          bg-white/15
          p-[2px]
          transition-[rotate,scale]
          duration-500
          ease-out
          ${theme.iconGlow}
          ${isLarge ? 'size-14 rounded-2xl md:size-16' : 'size-12 rounded-[14px] lg:size-14 lg:rounded-2xl'}
          ${isActive ? '-rotate-6 scale-105' : ''}
        `}
      >
        {/* Rotating border */}
        <span
          aria-hidden="true"
          className={`absolute -inset-1/2 transition-opacity duration-500 ${theme.iconSweep} ${
            isActive ? 'opacity-100 motion-safe:animate-spin' : 'opacity-0'
          }`}
          style={{ animationDuration: '3s' }}
        />

        <span
          className={`relative flex size-full items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ${
            theme.iconFill
          } ${isLarge ? 'rounded-[14px] md:rounded-[16px]' : 'rounded-xl lg:rounded-[14px]'}`}
        >
          <Icon
            aria-hidden="true"
            size={isLarge ? 28 : 24}
            strokeWidth={1.75}
            className={`text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out ${
              isActive ? 'scale-110' : ''
            }`}
          />
        </span>
      </span>
    </span>
  );
}
