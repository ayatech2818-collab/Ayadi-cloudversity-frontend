'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowUpRight, BookOpen, GraduationCap, Lightbulb, type LucideIcon } from 'lucide-react';
import type { PointerEvent } from 'react';

type Pathway = {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
};

const pathways: Pathway[] = [
  {
    title: 'Explore',
    subtitle: 'Courses',
    description: '200+ Courses',
    icon: BookOpen,
  },
  {
    title: 'Learn at',
    subtitle: 'Your Pace',
    description: 'Flexible Learning',
    icon: GraduationCap,
  },
  {
    title: 'Grow your',
    subtitle: 'Skills',
    description: 'Practical Knowledge',
    icon: Lightbulb,
  },
];

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

const chipVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.85,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 18,
      delay: 0.35,
    },
  },
};

export default function LearningPathways() {
  const reduceMotion = useReducedMotion();

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

        {/* Cards */}
        <motion.ul
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6"
        >
          {pathways.map((pathway, index) => (
            <PathwayCard key={pathway.title} pathway={pathway} index={index} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

type PathwayCardProps = {
  pathway: Pathway;
  index: number;
};

function PathwayCard({ pathway, index }: PathwayCardProps) {
  const reduceMotion = useReducedMotion();
  const Icon = pathway.icon;

  // Feeds the cursor position to the spotlight overlay without re-rendering.
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    // Entrance animation lives on the <li>; hover transitions live on the inner card
    // so CSS transitions never fight framer-motion's transforms.
    <motion.li variants={itemVariants}>
      <div
        onPointerMove={handlePointerMove}
        className="
          group
          relative
          isolate
          flex
          h-full
          min-h-[360px]
          flex-col
          overflow-hidden
          rounded-[28px]
          bg-linear-to-br
          from-emerald-950
          via-emerald-900
          to-teal-800
          p-8
          shadow-[0_30px_70px_-35px_rgba(2,44,34,0.8)]
          ring-1
          ring-inset
          ring-white/10
          transition-[translate,box-shadow]
          duration-500
          ease-out
          hover:-translate-y-2
          hover:shadow-[0_40px_90px_-30px_rgba(6,95,70,0.55)]
          md:p-10
        "
      >
        {/* Cursor spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgba(190, 242, 100, 0.18), transparent 70%)',
          }}
        />

        {/* Corner ring — inset shadow, since the global `* { border-color }` rule would override a border colour */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-52 rounded-full shadow-[inset_0_0_0_35px_rgba(190,242,100,0.12)] transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Top sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent"
        />

        {/* Icon */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.7 }}
          className="w-fit"
        >
          <div
            className="
              relative
              size-16
              overflow-hidden
              rounded-2xl
              bg-white/15
              p-[2px]
              shadow-[0_14px_34px_-12px_rgba(16,185,129,0.65)]
              transition-[rotate,scale]
              duration-500
              ease-out
              group-hover:-rotate-6
              group-hover:scale-105
            "
          >
            {/* Rotating border */}
            <span
              aria-hidden="true"
              className="absolute -inset-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,#bef264_70deg,transparent_140deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-safe:group-hover:animate-spin"
              style={{ animationDuration: '3s' }}
            />

            <span className="relative flex size-full items-center justify-center rounded-[14px] bg-brand-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
              <Icon
                aria-hidden="true"
                size={28}
                strokeWidth={1.75}
                className="text-white drop-shadow-[0_2px_6px_rgba(2,44,34,0.35)] transition-transform duration-500 ease-out group-hover:scale-110"
              />
            </span>
          </div>
        </motion.div>

        {/* Content */}
        <h3 className="mt-10 text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-white">
          {pathway.title}
          <br />
          <span className="bg-linear-to-r from-lime-200 to-emerald-300 bg-clip-text text-transparent">
            {pathway.subtitle}
          </span>
        </h3>

        <motion.span
          variants={chipVariants}
          className="mt-5 inline-flex w-fit items-center rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-emerald-50 ring-1 ring-inset ring-white/20 backdrop-blur-sm"
        >
          {pathway.description}
        </motion.span>

        {/* Explore — pushed to the bottom by flex, so it can never overlap the text */}
        <div className="mt-auto pt-10">
          <div aria-hidden="true" className="h-px w-full bg-linear-to-r from-white/30 via-white/12 to-transparent" />

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wide text-white">Explore</span>

            <span
              className="
                relative
                flex
                size-11
                items-center
                justify-center
                rounded-full
                bg-lime-300
                text-emerald-950
                shadow-lg
                shadow-emerald-950/40
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
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-[0.28] bg-linear-to-r from-lime-300 to-emerald-400 transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
      </div>
    </motion.li>
  );
}
