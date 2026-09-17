'use client';

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,  
} from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  GraduationCap,
  Heart,
  Lightbulb,
  MapPin,
  Play,
  Quote,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import GetStartedCta from '@/components/website/sections/GetStartedCta';
import { CARD_CHROME, CardDecor, handleSpotlight, IconTile } from '@/components/website/ui/card-chrome';

/* ==================================================
   DATA
================================================== */

const CEO_VIDEO_ID = 'YMbMOmRhhM4';

const pathways = [
  { index: '01', label: 'Academic excellence', detail: 'Preschool through higher education' },
  { index: '02', label: 'Career preparedness', detail: 'Workplace readiness programmes' },
  { index: '03', label: 'Personal growth', detail: 'Skills that outlast the classroom' },
];

const values = [
  {
    icon: Lightbulb,
    title: 'Curiosity',
    text: 'We encourage learners to ask questions, explore ideas, and discover new possibilities.',
  },
  {
    icon: Brain,
    title: 'Critical thinking',
    text: 'Our learning experiences help students think independently and approach challenges with confidence.',
  },
  {
    icon: Heart,
    title: 'Personal growth',
    text: 'We nurture character, confidence, creativity, and the skills needed to grow beyond the classroom.',
  },
];

const stats = [
  { to: 3000, suffix: '+', label: 'Current students', icon: GraduationCap },
  { to: 120, suffix: '', label: 'Learning communities', icon: Users },
  { to: 8000, suffix: '+', label: 'Lifelong learners', icon: BookOpen },
];

const locations = [
  { city: 'Calicut, India', detail: 'Orbits Complex, Jafarkhan Colony Road' },
  { city: 'Sharjah, UAE', detail: 'Shams Free Zone, Sharjah Media City' },
];

/* ==================================================
   MOTION

   Everything here is entry motion only — nothing loops. Each section plays
   once on scroll and then stops costing frames.
================================================== */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/* Headline lines slide out from behind a clipping mask. */
const lineUp: Variants = {
  hidden: { y: '130%' },
  visible: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

/* ==================================================
   PAGE
================================================== */

export default function AboutContent() {
  const reduceMotion = useReducedMotion();
  const start = reduceMotion ? 'visible' : 'hidden';

  return (
    <main>
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative isolate overflow-hidden px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:px-16 lg:pb-28 lg:pt-44">
        {/* Two static washes. Static on purpose — an animated 130px blur is
            the most expensive thing a page can repaint. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-32 -top-40 size-[560px] rounded-full bg-primary/[0.07] blur-[130px]" />
          <div className="absolute -left-40 top-1/3 size-[420px] rounded-full bg-brand-end/[0.06] blur-[130px]" />
        </div>

        <motion.div variants={stagger} initial={start} animate="visible" className="mx-auto max-w-[1180px]">
          <motion.div variants={fadeUp}>
            <Eyebrow>About Ayadi Cloudversity</Eyebrow>
          </motion.div>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-16">
            <div>
              <h1 className="text-[2.5rem] font-semibold leading-[1.0] tracking-[-0.045em] text-text sm:text-6xl lg:text-[4.4rem]">
                <span className="block overflow-hidden pb-[0.08em]">
                  <motion.span variants={lineUp} className="block">
                    Education that
                  </motion.span>
                </span>

                <span className="block overflow-hidden pb-[0.08em]">
                  <motion.span variants={lineUp} className="block">
                    shapes{' '}
                    <span className="relative inline-block">
                      futures.
                      <motion.span
                        aria-hidden="true"
                        initial={reduceMotion ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.75, duration: 0.8, ease: EASE }}
                        className="absolute -bottom-0.5 left-0 h-[4px] w-full origin-left rounded-full bg-primary"
                      />
                    </span>
                  </motion.span>
                </span>
              </h1>

              <motion.p variants={fadeUp} className="mt-8 max-w-xl text-lg leading-8 text-muted sm:text-xl">
                At Ayadi Cloudversity, education goes beyond facts — it sparks curiosity, builds character, and shapes
                futures.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#mission"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-brand-gradient px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-colors duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Discover our mission
                  <ArrowUpRight
                    aria-hidden="true"
                    size={18}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>

                <a
                  href="#leadership"
                  className="inline-flex items-center rounded-full px-5 py-3.5 text-sm font-bold text-text ring-1 ring-inset ring-border transition-colors duration-300 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Meet our CEO
                </a>
              </motion.div>
            </div>

            {/* Pathway index — the page's only "figure", kept as type. */}
            <motion.div variants={stagger} className="lg:pb-2">
              <motion.div variants={fadeUp} aria-hidden="true" className="h-px bg-border" />

              <ul>
                {pathways.map((pathway, index) => (
                  <motion.li key={pathway.index} variants={fadeUp}>
                    {index > 0 ? <div aria-hidden="true" className="h-px bg-border" /> : null}

                    <div className="flex items-start gap-5 py-4">
                      <span className="mt-0.5 font-mono text-[11px] font-bold tracking-[0.18em] text-primary">
                        {pathway.index}
                      </span>

                      <span>
                        <span className="block text-sm font-bold text-text">{pathway.label}</span>
                        <span className="mt-1 block text-sm leading-6 text-muted">{pathway.detail}</span>
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================
          MISSION
      ========================================================= */}
      <section id="mission" className="scroll-mt-28 bg-surface px-5 py-24 sm:px-8 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.42fr_1fr] lg:gap-20">
          <motion.div
            variants={stagger}
            initial={start}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <motion.div variants={fadeUp}>
              <Eyebrow>Our mission</Eyebrow>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="mt-5 text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-text sm:text-4xl"
            >
              Learning should inspire people to become more.
            </motion.h2>
          </motion.div>

          <div>
            <ScrollReveal text="We are passionate educators driven by a shared mission to provide exceptionally high-quality learning experiences for every individual." />

            <motion.p
              variants={fadeUp}
              initial={start}
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-10 max-w-2xl text-base leading-8 text-muted"
            >
              Rooted in our commitment to diversity, innovation, and academic excellence, we work tirelessly to create an
              environment where curiosity is nurtured and students feel empowered to explore, question, and grow.
            </motion.p>
          </div>
        </div>
      </section>

      {/* =========================================================
          VALUES
      ========================================================= */}
      <section className="px-5 py-24 sm:px-8 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1180px]">
          <motion.div
            variants={stagger}
            initial={start}
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp}>
              <Eyebrow>What we value</Eyebrow>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="mt-5 text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-text sm:text-4xl"
            >
              Building learners for the real world.
            </motion.h2>

            <motion.p variants={fadeUp} className="mt-5 text-base leading-8 text-muted">
              Our classrooms, teaching methods, and learning resources are thoughtfully designed to inspire confidence,
              encourage critical thinking, and prepare learners for real-world challenges.
            </motion.p>
          </motion.div>

          <motion.ul
            variants={stagger}
            initial={start}
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-14 grid gap-4 md:grid-cols-3"
          >
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                // Entrance animation lives on the <li>; hover transitions live on the
                // inner card so CSS transitions never fight framer-motion's transforms.
                <motion.li key={value.title} variants={fadeUp}>
                  <div onPointerMove={handleSpotlight} className={`${CARD_CHROME} p-7`}>
                    <CardDecor />

                    <div className="flex items-start justify-between">
                      <IconTile icon={Icon} size="lg" delay={index * 0.7} />

                      <span className="mt-1 font-mono text-[11px] font-bold tracking-[0.18em] text-muted/60 transition-colors duration-500 group-hover:text-primary">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-6 text-lg font-bold text-text">{value.title}</h3>

                    <p className="mt-2.5 text-sm leading-7 text-muted">{value.text}</p>

                    <span
                      aria-hidden="true"
                      className="mt-6 block h-[3px] w-10 rounded-full bg-linear-to-r from-primary to-brand-start transition-[width] duration-500 ease-out group-hover:w-20"
                    />
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>

          <motion.blockquote
            variants={fadeUp}
            initial={start}
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-4 rounded-2xl bg-surface p-8 ring-1 ring-inset ring-border sm:p-10"
          >
            <Quote aria-hidden="true" size={22} className="text-primary" />

            <p className="mt-5 max-w-4xl text-xl font-medium leading-9 text-text sm:text-2xl">
              We believe that when curiosity meets direction, students unlock their fullest potential — and we are
              dedicated to guiding them every step of the way.
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================= */}
      <section className="px-5 pb-24 sm:px-8 lg:px-16 lg:pb-32">
        <div className="mx-auto max-w-[1180px]">
          <motion.ul
            variants={stagger}
            initial={start}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.li key={stat.label} variants={fadeUp}>
                  <div onPointerMove={handleSpotlight} className={`${CARD_CHROME} p-8 sm:p-9`}>
                    <CardDecor />

                    <IconTile icon={Icon} size="md" delay={index * 0.7} />

                    <p className="mt-7 text-4xl font-semibold tracking-[-0.03em] text-text sm:text-5xl">
                      <CountUp to={stat.to} suffix={stat.suffix} />
                    </p>

                    <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>

                    <span
                      aria-hidden="true"
                      className="mt-6 block h-[3px] w-10 rounded-full bg-linear-to-r from-primary to-brand-start transition-[width] duration-500 ease-out group-hover:w-20"
                    />
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </section>

      {/* =========================================================
          LEADERSHIP
      ========================================================= */}
      <section id="leadership" className="scroll-mt-28 bg-surface px-5 py-24 sm:px-8 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1180px]">
          <motion.div
            variants={stagger}
            initial={start}
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp}>
              <Eyebrow>Leadership</Eyebrow>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="mt-5 text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-text sm:text-4xl"
            >
              A message from our CEO
            </motion.h2>
          </motion.div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
            <motion.div variants={fadeUp} initial={start} whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                AH
              </span>

              <blockquote className="mt-7 text-2xl font-medium leading-9 tracking-[-0.02em] text-text">
                &ldquo;At Ayadi, my vision has always been to create a learning environment where every student feels
                supported, inspired, and truly empowered to grow.&rdquo;
              </blockquote>

              <p className="mt-7 text-sm font-bold text-text">Dr. Ameer Hassan</p>
              <p className="mt-1 text-sm text-primary">Chief Executive Officer</p>

              <div aria-hidden="true" className="mt-8 h-px bg-border" />

              <p className="mt-8 text-base leading-8 text-muted">
                Our commitment goes far beyond academics — we strive to nurture curiosity, spark innovation, and prepare
                each learner for the opportunities of tomorrow.
              </p>

              <p className="mt-5 text-base leading-8 text-muted">
                With the dedication of our passionate team, we continue to push boundaries, redefine possibilities, and
                work toward a future where high-quality education is accessible to all.
              </p>
            </motion.div>

            <LeadershipVideo start={start} />
          </div>
        </div>
      </section>

      {/* =========================================================
          CLOSING
      ========================================================= */}
      <section className="relative overflow-hidden px-5 pb-82 pt-24 sm:px-8 lg:px-16 lg:pb-74 lg:pt-32 ">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 -z-10 size-[620px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[130px]"
        />

        <motion.div
          variants={stagger}
          initial={start}
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} className="flex justify-center">
            <Eyebrow>The journey ahead</Eyebrow>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-text sm:text-5xl lg:text-6xl"
          >
            Learn. Grow. <span className="text-primary">Shape the future.</span>
          </motion.h2>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">
            We are building a learning community where every individual has the opportunity to discover their potential
            and create meaningful impact.
          </motion.p>

          <motion.ul
            variants={fadeUp}
            className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-12"
          >
            {locations.map((location) => (
              <li key={location.city} className="flex items-start gap-2.5 text-left">
                <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-primary" />

                <span>
                  <span className="block text-sm font-bold text-text">{location.city}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">{location.detail}</span>
                </span>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </section>

      {/* Overlaps the footer below it — see the note in GetStartedCta.tsx */}
      <GetStartedCta />
    </main>
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

/*
 * The mission statement lights up word by word as the section crosses the
 * viewport. One scroll listener drives every word, and each word animates
 * opacity only, so the whole effect stays on the compositor.
 */
function ScrollReveal({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.6'],
  });

  const words = text.split(' ');

  return (
    <p
      ref={ref}
      className="text-2xl font-medium leading-[1.45] tracking-[-0.02em] text-text sm:text-[1.75rem] sm:leading-[1.4]"
    >
      {reduceMotion
        ? text
        : words.map((word, index) => (
            <RevealWord
              key={`${word}-${index}`}
              progress={scrollYProgress}
              start={index / words.length}
              end={(index + 1) / words.length}
            >
              {word}
            </RevealWord>
          ))}
    </p>
  );
}

function RevealWord({
  progress,
  start,
  end,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  children: ReactNode;
}) {
  const opacity = useTransform(progress, [start, end], [0.16, 1]);

  return (
    <motion.span style={{ opacity }} className="mr-[0.24em] inline-block">
      {children}
    </motion.span>
  );
}

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();

  const count = useMotionValue(0);
  const display = useTransform(count, (value) => Math.round(value).toLocaleString('en-US'));

  useEffect(() => {
    if (!isInView) return;

    if (reduceMotion) {
      count.set(to);
      return;
    }

    const controls = animate(count, to, { duration: 1.7, ease: EASE });

    return () => controls.stop();
  }, [count, isInView, reduceMotion, to]);

  return (
    <span ref={ref}>
      <span className="sr-only">
        {to.toLocaleString('en-US')}
        {suffix}
      </span>

      <span aria-hidden="true">
        <motion.span>{display}</motion.span>
        {suffix}
      </span>
    </span>
  );
}

/*
 * A facade, not an embed: YouTube's player is only fetched once someone asks
 * for it, which keeps ~1MB of third-party script off the initial page.
 */
function LeadershipVideo({ start }: { start: 'hidden' | 'visible' }) {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      initial={start}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="relative min-h-[320px] overflow-hidden rounded-3xl bg-text sm:min-h-[400px]"
    >
      {playing ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube.com/embed/${CEO_VIDEO_ID}?autoplay=1&rel=0`}
          title="A message from the CEO — Ayadi Cloudversity"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(22,163,74,0.38),transparent_62%)]"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] bg-size-[22px_22px] [mask-image:radial-gradient(ellipse_at_50%_50%,black_5%,transparent_72%)]"
          />

          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_0_10px_rgba(21,128,61,0.18)] transition-transform duration-300 group-hover:scale-110">
              <Play aria-hidden="true" size={22} fill="currentColor" className="ml-0.5" />
            </span>

            <span className="text-sm font-semibold text-white/90">Play the message</span>

            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
              Dr. Ameer Hassan · CEO
            </span>
          </button>
        </>
      )}
    </motion.div>
  );
}
