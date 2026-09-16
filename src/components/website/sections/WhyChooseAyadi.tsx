'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { BookOpen, GraduationCap, Sparkles, UserRound, type LucideIcon } from 'lucide-react';
import type { PointerEvent } from 'react';

type Feature = {
  title: string;
  description: string;
  tag: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: 'Expert Instructors',
    description: 'Learn from vetted industry leaders and academic experts.',
    tag: 'Vetted',
    icon: UserRound,
  },
  {
    title: 'Best-in-Class Program',
    description: 'Access personalized instruction with customized content.',
    tag: 'Personalized',
    icon: GraduationCap,
  },
  {
    title: 'Flexible Learning',
    description: 'Your space at your own pace – you can learn in-depth.',
    tag: 'Self-paced',
    icon: BookOpen,
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
    y: 32,
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

const tagVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.8,
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

const accentVariants: Variants = {
  hidden: {
    scaleX: 0,
  },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.6,
      delay: 0.45,
      ease: 'easeOut',
    },
  },
};

export default function WhyChooseAyadi() {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-labelledby="why-choose-ayadi-title" className="px-4 py-16 md:px-8 lg:px-16">
      <div
        className="
          relative
          isolate
          mx-auto
          max-w-[1665px]
          overflow-hidden
          rounded-[32px]
          bg-linear-to-br
          from-emerald-950
          via-emerald-900
          to-teal-800
          px-5
          py-12
          shadow-[0_40px_100px_-40px_rgba(2,44,34,0.75)]
          ring-1
          ring-white/10
          sm:px-10
          md:px-12
          md:py-16
          lg:px-[70px]
          lg:py-[72px]
        "
      >
        {/* Decorative background */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

          <motion.div
            animate={reduceMotion ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-32 -top-40 size-[520px] rounded-full bg-emerald-400/20 blur-[110px]"
          />
          <motion.div
            animate={reduceMotion ? undefined : { x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-48 -left-40 size-[460px] rounded-full bg-lime-300/15 blur-[110px]"
          />

          {/* Inset shadow instead of a border: the global `* { border-color }` rule would override a border colour */}
          <div className="absolute -bottom-[180px] -left-[120px] size-[380px] rounded-full shadow-[inset_0_0_0_55px_rgba(255,255,255,0.04)]" />
          <div className="absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-emerald-300/50 to-transparent" />
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.5fr] lg:items-center lg:gap-16">
          {/* LEFT CONTENT */}
          <motion.div
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={containerVariants}
            className="max-w-[520px]"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span
                className="
                  inline-flex
                  items-center
                  gap-2.5
                  rounded-full
                  bg-white/10
                  px-4
                  py-1.5
                  text-sm
                  font-semibold
                  tracking-wide
                  text-emerald-50
                  ring-1
                  ring-inset
                  ring-white/20
                  backdrop-blur-sm
                "
              >
                <span aria-hidden="true" className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-lime-300 opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-lime-300" />
                </span>
                Our Edge
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              id="why-choose-ayadi-title"
              variants={itemVariants}
              className="
                mt-7
                text-4xl
                font-bold
                leading-[1.08]
                tracking-[-0.04em]
                text-white
                md:text-5xl
                lg:text-[3.5rem]
              "
            >
              Why Choose{' '}
              <motion.span
                animate={reduceMotion ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-linear-to-r from-lime-200 via-emerald-300 to-teal-200 bg-size-[200%_auto] bg-clip-text text-transparent"
              >
                Ayadi
              </motion.span>
            </motion.h2>

            {/* Paragraph 1 */}
            <motion.p
              variants={itemVariants}
              className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-emerald-50/80 md:text-lg"
            >
              Empower your future with expert-led online courses designed to help you master in-demand skills.
            </motion.p>

            {/* Paragraph 2 */}
            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-emerald-50/80 md:text-lg"
            >
              From academic excellence to life skills and professional development, our curated learning paths ensure
              real growth and lasting success.
            </motion.p>
          </motion.div>

          {/* RIGHT FEATURES */}
          <motion.ul
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6"
          >
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
                isWide={features.length % 2 === 1 && index === features.length - 1}
              />
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

type FeatureCardProps = {
  feature: Feature;
  index: number;
  isWide: boolean;
};

function FeatureCard({ feature, index, isWide }: FeatureCardProps) {
  const reduceMotion = useReducedMotion();
  const Icon = feature.icon;

  // Feeds the cursor position to the spotlight overlay without re-rendering.
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    // Entrance animation lives on the <li>; hover transitions live on the inner card
    // so CSS transitions never fight framer-motion's transforms.
    <motion.li variants={itemVariants} className={isWide ? 'md:col-span-2' : undefined}>
      <div
        onPointerMove={handlePointerMove}
        className={`
          group
          relative
          isolate
          h-full
          overflow-hidden
          rounded-3xl
          bg-white/[0.06]
          p-6
          ring-1
          ring-inset
          ring-white/15
          backdrop-blur-md
          transition-[translate,background-color,box-shadow]
          duration-500
          ease-out
          hover:-translate-y-1.5
          hover:bg-white/[0.09]
          hover:shadow-[0_24px_60px_-24px_rgba(163,230,53,0.35)]
          hover:ring-lime-200/40
          md:p-8
          ${isWide ? 'md:flex md:items-center md:gap-10' : ''}
        `}
      >
        {/* Cursor spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(360px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgba(190, 242, 100, 0.16), transparent 70%)',
          }}
        />

        {/* Top sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent"
        />

        {/* Icon with floating tag */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.7 }}
          className="flex w-fit shrink-0 items-start"
        >
          <div
            className="
              relative
              size-[76px]
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
                size={36}
                strokeWidth={1.75}
                className="text-white drop-shadow-[0_2px_6px_rgba(2,44,34,0.35)] transition-transform duration-500 ease-out group-hover:scale-110"
              />
            </span>
          </div>

          {/* In-flow (not absolute) so the wide card's text never collides with it */}
          <motion.span
            variants={tagVariants}
            className="
              relative
              z-10
              -mt-3
              -ml-4
              inline-flex
              items-center
              gap-1
              whitespace-nowrap
              rounded-full
              bg-lime-300
              px-2.5
              py-1
              text-[11px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-emerald-950
              shadow-lg
              shadow-emerald-950/40
              ring-1
              ring-white/60
            "
          >
            <Sparkles aria-hidden="true" size={12} strokeWidth={2.5} />
            {feature.tag}
          </motion.span>
        </motion.div>

        <div className={isWide ? 'mt-7 md:mt-0' : 'mt-7'}>
          <h3 className="text-xl font-semibold leading-tight tracking-[-0.02em] text-white md:text-2xl">
            {feature.title}
          </h3>

          <p
            className={`mt-2 text-[15px] leading-relaxed text-emerald-50/85 md:text-base ${
              isWide ? 'max-w-[420px]' : 'max-w-[320px]'
            }`}
          >
            {feature.description}
          </p>

          <motion.span
            aria-hidden="true"
            variants={accentVariants}
            className="mt-5 block h-[3px] w-12 origin-left rounded-full bg-linear-to-r from-lime-300 to-emerald-400 transition-[width] duration-500 ease-out group-hover:w-24"
          />
        </div>
      </div>
    </motion.li>
  );
}
