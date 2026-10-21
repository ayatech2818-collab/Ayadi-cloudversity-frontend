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
  GraduationCap,
  MapPin,
  Play,
  Quote,
  Users,
} from 'lucide-react';
import Image from 'next/image';
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
    title: 'Diversity',
    text: 'Celebrating a rich tapestry of backgrounds, perspectives and talents.',
    image: '/images/about/values/diversity.webp',
  },
  {
    title: 'Innovation',
    text: 'Fostering creativity and breakthrough thinking in education.',
    image: '/images/about/values/innovation.png',
  },
  {
    title: 'Excellence',
    text: 'Striving for the highest standards in everything we do.',
    image: '/images/about/values/excellence.png',
  },
];

const stats = [
  { to: 30000, suffix: '+', label: 'Undergraduate & Graduate students', icon: GraduationCap },
  { to: 150, suffix: '+', label: 'A Thriving Learning Community', icon: Users },
  { to: 100000, suffix: '+', label: 'A Vibrant Network of Lifelong Learners', icon: BookOpen },
];

const locations = [
  { city: 'Calicut, India', detail: 'Orbits Complex, Jafarkhan Colony Road' },
  { city: 'Sharjah, UAE', detail: 'Shams Free Zone, Sharjah Media City' },
  { city: 'Mangalore, India', detail: 'Rahmath Complex Near Spoorthi Polyclinic, Thokkottu' },
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
  const [activeValue, setActiveValue] = useState(0);

  return (
    <main>
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative isolate overflow-hidden px-5 pb-10 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:px-16 lg:pb-28 lg:pt-44">
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

          <div className="mt-6 grid grid-cols-[1.15fr_0.85fr] items-start gap-4 sm:mt-8 sm:gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-16">
            <div>
              <h1 className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.045em] text-text sm:text-5xl lg:text-[4.4rem]">
                <span className="block overflow-hidden pb-[0.08em]">
                  <motion.span variants={lineUp} className="block">
                    Education that
                  </motion.span>
                </span>

                <span className="block overflow-hidden pb-[0.08em]">
                  <motion.span variants={lineUp} className="block">
                    shapes{' '}
                    <span className="relative inline-block text-accent-soft">
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

              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-xl text-xs leading-5 text-muted sm:mt-6 sm:text-lg sm:leading-7 lg:mt-8 lg:text-xl lg:leading-8"
              >
                At Ayadi Cloudversity, education goes beyond facts — it sparks curiosity, builds character, and shapes futures.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-5 flex flex-col items-stretch gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 lg:mt-9"
              >
                <a
                  href="#mission"
                  className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-accent-gradient px-3 py-2.5 text-[10px] font-bold text-white shadow-lg shadow-primary/20 transition-colors duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:gap-2.5 sm:px-5 sm:py-3 sm:text-sm lg:px-6 lg:py-3.5"
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
                  className="inline-flex items-center justify-center rounded-full px-2 py-2.5 text-[10px] font-bold text-text ring-1 ring-inset ring-border transition-colors duration-300 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-4 sm:py-3 sm:text-sm lg:px-5 lg:py-3.5"
                >
                  Meet our CEO
                </a>
              </motion.div>
            </div>

            {/* Pathway index — the page's only "figure", kept as type. */}
            <motion.div variants={stagger} className="min-w-0 lg:pb-2">
              <motion.div variants={fadeUp} aria-hidden="true" className="h-px bg-border" />

              <ul>
                {pathways.map((pathway, index) => (
                  <motion.li key={pathway.index} variants={fadeUp}>
                    {index > 0 ? <div aria-hidden="true" className="h-px bg-border" /> : null}

                    <div className="flex items-start gap-2.5 py-3 sm:gap-4 sm:py-4 lg:gap-5">
                      <span className="mt-0.5 shrink-0 font-mono text-[9px] font-bold tracking-[0.12em] text-primary sm:text-[11px] sm:tracking-[0.18em]">
                        {pathway.index}
                      </span>

                      <span>
                        <span className="block text-[10px] font-bold leading-4 text-text sm:text-sm">{pathway.label}</span>
                        <span className="mt-1 block text-[9px] leading-4 text-muted sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">{pathway.detail}</span>
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
      
        <section
          id="mission"
          className="scroll-mt-20 bg-surface px-4 py-10 sm:scroll-mt-28 sm:px-8 sm:py-24 lg:px-16 lg:py-32"
        >
          <div className="mx-auto grid max-w-[1180px] grid-cols-[0.9fr_1.1fr] items-start gap-3 sm:gap-8 lg:grid-cols-[0.42fr_1fr] lg:gap-20">
            <motion.div
              variants={stagger}
              initial={start}
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              className="min-w-0 lg:sticky lg:top-32 lg:self-start"
            >
              <motion.div variants={fadeUp}>
                <Eyebrow>Our mission</Eyebrow>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="mt-3 text-lg font-semibold leading-[1.1] tracking-[-0.035em] text-text sm:mt-5 sm:text-4xl lg:text-4xl"
              >
                Learning should inspire people to become more.
              </motion.h2>
            </motion.div>

            <div className="min-w-0">
              <div className="text-sm leading-6 sm:text-xl sm:leading-8 lg:text-2xl">
                <ScrollReveal text="We are passionate educators driven by a shared mission to provide exceptionally high-quality learning experiences for every individual." />
              </div>
            </div>
          </div>
        </section>

      {/* =========================================================
          VALUES
      ========================================================= */}

        <section className="px-2.5 py-10 sm:px-5 sm:py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-[1360px]">
            <motion.div
              variants={stagger}
              initial={start}
              whileInView="visible"
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#fbfdfc] via-[#eef8f2] to-[#e9eef8] px-4 py-6 shadow-[0_24px_70px_-42px_rgba(20,29,63,0.35)] ring-1 ring-inset ring-[#d8e6de] sm:rounded-3xl sm:px-7 sm:py-9 lg:px-8 lg:py-10"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-28 top-1/3 size-72 rounded-full bg-emerald-400/18 blur-[110px]"
              />

              <div className="relative grid items-center gap-6 lg:grid-cols-[0.58fr_1.42fr] lg:gap-8">
                <motion.div variants={fadeUp} className="max-w-lg">
                  <h2 className="bg-linear-to-r from-primary via-brand-start to-brand-teal bg-clip-text text-2xl font-semibold leading-[1.08] tracking-[-0.035em] text-transparent sm:text-4xl lg:text-5xl">
                    Our Values
                  </h2>

                  <p className="mt-4 text-xs leading-6 text-accent-soft/85 sm:mt-5 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
                    Our classrooms, teaching methods, and learning resources are thoughtfully designed to inspire
                    confidence, encourage critical thinking, and prepare learners for real-world challenges and
                    opportunities.
                  </p>

                  <div aria-hidden="true" className="mt-5 h-px w-16 bg-linear-to-r from-primary/70 to-transparent sm:mt-7 sm:w-20" />
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="flex h-[19rem] min-w-0 gap-1.5 sm:h-[24rem] sm:gap-2.5 lg:h-[32rem] lg:gap-3"
                >
                  {values.map((value, index) => {
                    const isActive = activeValue === index;

                    return (
                      <motion.button
                        key={value.title}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveValue(index)}
                        onFocus={() => setActiveValue(index)}
                        onHoverStart={() => setActiveValue(index)}
                        animate={{ flexGrow: isActive ? 2.2 : 0.6 }}
                        transition={{ duration: reduceMotion ? 0 : 0.38, ease: EASE }}
                        className="group relative min-w-0 basis-0 cursor-pointer overflow-hidden rounded-xl text-left ring-1 ring-inset ring-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#87e837] sm:rounded-2xl sm:focus-visible:outline-offset-4"
                      >
                        <Image
                          src={value.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 42vw, (min-width: 640px) 60vw, 65vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                        />

                        <span
                          aria-hidden="true"
                          className={`absolute inset-0 bg-linear-to-t transition-opacity duration-500 ${
                            isActive
                              ? 'from-[#071127]/95 via-[#071127]/38 to-transparent opacity-100'
                              : 'from-[#071127]/80 via-[#071127]/20 to-black/5 opacity-85'
                          }`}
                        />

                        <span
                          className={`absolute inset-x-0 bottom-0 block p-3 transition-[opacity,transform] duration-400 sm:p-5 lg:p-6 ${
                            isActive ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
                          }`}
                        >
                          <span className="block text-sm font-semibold text-[#87e837] sm:text-xl lg:text-2xl">
                            {value.title}
                          </span>
                          <span className="mt-1 block max-w-sm text-[10px] leading-[1.45] text-white/82 sm:mt-2 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
                            {value.text}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className={`absolute bottom-4 left-1/2 block -translate-x-1/2 text-[10px] font-semibold tracking-[0.03em] text-[#87e837] transition-opacity duration-300 [writing-mode:vertical-rl] sm:bottom-6 sm:text-base lg:bottom-7 lg:text-lg ${
                            isActive ? 'opacity-0' : 'opacity-100'
                          }`}
                        >
                          {value.title}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>

            <motion.blockquote
              variants={fadeUp}
              initial={start}
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-3 rounded-xl bg-surface p-5 ring-1 ring-inset ring-border sm:mt-4 sm:rounded-2xl sm:p-10"
            >
              <Quote
                aria-hidden="true"
                size={20}
                className="text-primary sm:h-[22px] sm:w-[22px]"
              />

              <p className="mt-3 text-base font-medium leading-7 text-accent-soft sm:mt-5 sm:max-w-4xl sm:text-2xl sm:leading-9">
                We believe that when curiosity meets direction, students unlock their fullest potential, and we are
                dedicated to guiding them every step of the way.
              </p>
            </motion.blockquote>
          </div>
        </section>

      {/* =========================================================
          STATS
      ========================================================= */}

      <section className="px-4 pb-12 sm:px-8 sm:pb-24 lg:px-16 lg:pb-32">
        <div className="mx-auto max-w-[1180px]">
          <motion.ul
            variants={stagger}
            initial={start}
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-3 gap-2 sm:gap-4"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.li key={stat.label} variants={fadeUp} className="min-w-0">
                  <div
                    onPointerMove={handleSpotlight}
                    className={`${CARD_CHROME} h-full p-2.5 sm:p-9`}
                  >
                    <CardDecor />

                    <div className="origin-top-left scale-75 sm:scale-100">
                      <IconTile icon={Icon} size="md" delay={index * 0.7} />
                    </div>

                    <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-text sm:mt-7 sm:text-5xl">
                      <CountUp to={stat.to} suffix={stat.suffix} />
                    </p>

                    <p className="mt-1 break-words text-[10px] font-medium leading-4 text-muted sm:mt-2 sm:text-sm sm:leading-normal">
                      {stat.label}
                    </p>

                    <span
                      aria-hidden="true"
                      className="mt-3 block h-[2px] w-5 rounded-full bg-linear-to-r from-primary to-brand-start transition-[width] duration-500 ease-out group-hover:w-10 sm:mt-6 sm:h-[3px] sm:w-10 sm:group-hover:w-20"
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
      <section
        id="leadership"
        className="scroll-mt-20 bg-surface px-4 py-10 sm:scroll-mt-28 sm:px-8 sm:py-24 lg:px-16 lg:py-32"
      >
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
              className="mt-3 text-2xl font-semibold leading-[1.1] tracking-[-0.035em] text-text sm:mt-5 sm:text-4xl"
            >
              A message from our CEO
            </motion.h2>
          </motion.div>

          <div className="mt-6 grid grid-cols-2 items-start gap-3 sm:mt-12 sm:gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
            <motion.div
              variants={fadeUp}
              initial={start}
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="min-w-0"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary sm:size-12 sm:rounded-xl sm:text-sm">
                AH
              </span>

              <blockquote className="mt-3 text-sm font-medium leading-5 tracking-[-0.02em] text-text sm:mt-7 sm:text-2xl sm:leading-9">
                &ldquo;At Ayadi, my vision has always been to create a learning environment where every student feels
                supported, inspired, and truly empowered to grow.&rdquo;
              </blockquote>

              <p className="mt-4 text-xs font-bold text-text sm:mt-7 sm:text-sm">
                Dr. Ameer Hassan
              </p>

              <p className="mt-1 text-[10px] leading-4 text-primary sm:text-sm sm:leading-normal">
                Chief Executive Officer
              </p>

              <div aria-hidden="true" className="mt-4 h-px bg-border sm:mt-8" />
            </motion.div>

            <div className="min-w-0">
              <LeadershipVideo start={start} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CLOSING
      ========================================================= */}
      <section className="relative overflow-hidden px-4 pb-56 pt-12 sm:px-8 sm:pb-82 sm:pt-24 lg:px-16 lg:pb-74 lg:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 -z-10 size-[300px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[80px] sm:size-[620px] sm:blur-[130px]"
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
            className="mt-4 text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-text sm:mt-6 sm:text-5xl lg:text-6xl"
          >
            Learn. Grow. <span className="text-primary">Shape the future.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted sm:mt-6 sm:text-lg sm:leading-8"
          >
            We are building a learning community where every individual has the opportunity to discover their potential
            and create meaningful impact.
          </motion.p>

          <motion.ul
            variants={fadeUp}
            className="mx-auto mt-7 grid max-w-xl grid-cols-2 items-start gap-3 text-left sm:mt-12 sm:flex sm:justify-center sm:gap-12"
          >
            {locations.map((location, index) => (
              <li
                key={location.city}
                className={`flex min-w-0 items-start gap-1.5 sm:gap-2.5 ${
                  index === 2
                    ? 'max-sm:col-span-2 max-sm:mx-auto max-sm:w-[calc(50%-0.375rem)]'
                    : ''
                }`}
              >
                <MapPin
                  aria-hidden="true"
                  size={14}
                  className="mt-0.5 shrink-0 text-primary sm:h-4 sm:w-4"
                />

                <span className="min-w-0">
                  <span className="block text-xs font-bold text-text sm:text-sm">
                    {location.city}
                  </span>

                  <span className="mt-0.5 block text-[10px] leading-4 text-muted sm:text-xs sm:leading-5">
                    {location.detail}
                  </span>
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
      className="text-sm font-medium leading-[1.5] tracking-[-0.02em] text-accent-soft sm:text-[1.75rem] sm:leading-[1.4] lg:text-2xl lg:leading-[1.45]"
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
  const display = useTransform(count, (value) => Math.round(value).toLocaleString('en-IN'));

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
        {to.toLocaleString('en-IN')}
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
