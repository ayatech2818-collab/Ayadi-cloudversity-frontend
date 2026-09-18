'use client';

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowUpRight, Clock3, SignalHigh } from 'lucide-react';
import Image from 'next/image';

import { CARD_CHROME, CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';

import { brandById } from './brands';
import type { BrandId, BrandSectionData, DummyCourseItem } from './types';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function BrandCourses({ activeBrand, data }: { activeBrand: BrandId; data: BrandSectionData }) {
  const reduceMotion = useReducedMotion();
  const brand = brandById[activeBrand];

  return (
    <section
      id="programmes"
      aria-labelledby="programmes-heading"
      className="scroll-mt-40 px-5 pb-24 pt-14 sm:px-8 lg:px-16 lg:pb-70"
    >
      <div className="mx-auto max-w-[1180px]">
        {/* The whole block re-keys on brand, so switching tabs replays the
            entrance rather than swapping text in place. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBrand}
            id={`panel-${activeBrand}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeBrand}`}
            variants={stagger}
            initial={reduceMotion ? 'visible' : 'hidden'}
            animate="visible"
            exit={reduceMotion ? undefined : { opacity: 0, y: -12, transition: { duration: 0.25 } }}
          >
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ring-1 ring-inset ${brand.theme.soft} ${brand.theme.text} ${brand.theme.ring}`}
              >
                <span aria-hidden="true" className={`size-1.5 rounded-full ${brand.theme.gradient}`} />
                {data.brandBadge}
              </span>

              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-muted/60">{brand.index}</span>
            </motion.div>

            <motion.h2
              id="programmes-heading"
              variants={fadeUp}
              className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-accent sm:text-4xl lg:text-5xl"
            >
              {data.title}
            </motion.h2>

            <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-base leading-8 text-muted">
              {data.description}
            </motion.p>

            <motion.ul variants={stagger} className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {data.courses.map((course) => (
                <motion.li key={course.id} variants={fadeUp} className="h-full">
                  <CourseCard course={course} brandId={activeBrand} />
                </motion.li>
              ))}
            </motion.ul>

            {data.ctaText ? (
              <motion.div variants={fadeUp} className="mt-12">
                <a
                  href="/enroll"
                  className={`group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 ${brand.theme.gradient} ${brand.theme.outline}`}
                >
                  {data.ctaText.replace(/\s*→\s*$/, '')}
                  <ArrowUpRight
                    aria-hidden="true"
                    size={16}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </motion.div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function CourseCard({ course, brandId }: { course: DummyCourseItem; brandId: BrandId }) {
  const brand = brandById[brandId];

  return (
    <article onPointerMove={handleSpotlight} className={`${CARD_CHROME} flex flex-col`}>
      <CardDecor />

      <div className="relative aspect-[16/10] overflow-hidden bg-accent/5">
        <Image
          src={course.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-accent-strong/55 via-transparent to-transparent"
        />

        <span
          className={`absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset ${brand.theme.text} ${brand.theme.ring}`}
        >
          {course.badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${brand.theme.text}`}>{course.category}</p>

        <h3 className="mt-3 text-lg font-bold leading-snug tracking-[-0.02em] text-accent">{course.title}</h3>

        <p className="mt-2.5 line-clamp-3 text-sm leading-7 text-muted">{course.description}</p>

        <div className="mt-auto pt-6">
          <div aria-hidden="true" className="h-px bg-border" />

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <SignalHigh aria-hidden="true" size={14} className={brand.theme.text} />
              {course.level}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock3 aria-hidden="true" size={14} className={brand.theme.text} />
              {course.duration}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
