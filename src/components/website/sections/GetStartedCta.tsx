'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { PointerEvent } from 'react';

const highlights = ['200+ Courses', 'Flexible Learning', 'Expert Instructors'];

/*
 * Sits between the last section and the footer, and deliberately overlaps the
 * footer's top edge. The negative bottom margin here is what pulls the footer
 * up — Footer.tsx reserves matching top padding for it.
 */
export default function GetStartedCta() {
  const reduceMotion = useReducedMotion();

  // Feeds the cursor position to the spotlight overlay without re-rendering.
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    // The band carries a dark gradient of its own, blending the section above
    // into the footer below — without it, the page background shows through as
    // a white strip either side of the card. No z-index here on purpose: the
    // footer must paint over the band's lower half, and only the card floats.
 <section
    aria-labelledby="get-started-title"
    className="
      relative
      z-20
      -mt-16
      -mb-12
      px-4
      sm:-mt-20
      sm:-mb-16
      sm:px-6
      md:-mt-28
      md:-mb-20
      md:px-8
      lg:-mt-50
      lg:-mb-70
      lg:px-16
    "
  >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 mx-auto max-w-[1180px]"
      >
        <div
          onPointerMove={handlePointerMove}
          className="
            group
            relative
            isolate
            overflow-hidden
            rounded-[32px]
            bg-linear-to-br
            from-emerald-950
            via-emerald-800
            to-emerald-600
            p-6
            shadow-[0_40px_100px_-45px_rgba(2,44,34,0.75)]
            ring-1
            ring-inset
            ring-white/15
            sm:p-8
            lg:p-10
          "
        >
          {/* ---------- DECOR ---------- */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            {/* Angled light panel, echoing the brand's diagonal */}
            <div className="absolute -right-32 -top-1/2 h-[220%] w-[55%] -skew-x-12 bg-linear-to-b from-lime-300/25 via-emerald-300/15 to-transparent" />

            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-size-[24px_24px] [mask-image:radial-gradient(ellipse_at_30%_50%,black_10%,transparent_70%)]" />

            <div className="absolute -bottom-32 -left-24 size-[420px] rounded-full bg-lime-300/15 blur-3xl" />

            {/* Cursor light */}
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgba(190, 242, 100, 0.18), transparent 70%)',
              }}
            />

            <div className="absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
          </div>

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_0.9fr] lg:gap-12">
            {/* ---------- CONTENT ---------- */}
            <div className="relative">
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
                  backdrop-blur-sm
                "
              >
                <span aria-hidden="true" className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-lime-300 opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-lime-300" />
                </span>
                Start Your Journey
              </span>

              <h2
                id="get-started-title"
                className="
                  mt-5
                  text-2xl
                  font-bold
                  leading-[1.08]
                  tracking-[-0.04em]
                  text-white
                  sm:text-3xl
                  md:text-4xl
                  lg:text-[2.6rem]
                "
              >
                Get Started With
                <br />
                <span className="bg-linear-to-r from-lime-200 via-emerald-200 to-teal-100 bg-clip-text text-transparent">
                  Ayadi Cloudversity
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-50/80 md:text-base">
                Join thousands of learners who are leveling up their careers and achieving their personal goals with
                confidence.
              </p>

              <ul className="mt-6 flex flex-wrap items-center gap-2">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-emerald-50 ring-1 ring-inset ring-white/20"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/courses"
                  className="
                    group/btn
                    inline-flex
                    items-center
                    gap-2.5
                    rounded-full
                    bg-white
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-emerald-900
                    shadow-lg
                    shadow-emerald-950/30
                    transition-all
                    duration-300
                    hover:bg-lime-200
                    hover:shadow-xl
                    focus-visible:outline-2
                    focus-visible:outline-offset-4
                    focus-visible:outline-lime-300
                  "
                >
                  Explore Courses
                  <ArrowUpRight
                    aria-hidden="true"
                    size={18}
                    className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                  />
                </Link>

                <Link
                  href="/contact"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    ring-1
                    ring-inset
                    ring-white/25
                    transition-colors
                    duration-300
                    hover:bg-white/10
                    focus-visible:outline-2
                    focus-visible:outline-offset-4
                    focus-visible:outline-lime-300
                  "
                >
                  Talk to us
                </Link>
              </div>
            </div>

            {/* ---------- IMAGE ---------- */}
            <div className="relative">
              <div
                className="
                  relative
                  aspect-[4/3]
                  w-full
                  overflow-hidden
                  rounded-[22px]
                  ring-1
                  ring-inset
                  ring-white/20
                  sm:aspect-[16/10]
                  lg:aspect-[5/4]
                "
              >
                <Image
                  src="/images/footer-student.png"
                  alt="An Ayadi Cloudversity learner celebrating their achievement"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover object-top"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-emerald-950/70 via-emerald-950/5 to-transparent"
                />
              </div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : 0.35, type: 'spring', stiffness: 300, damping: 20 }}
                className="
                  absolute
                  -bottom-4
                  -left-3
                  flex
                  items-center
                  gap-2.5
                  rounded-xl
                  bg-white/95
                  px-3.5
                  py-2.5
                  shadow-[0_18px_40px_-18px_rgba(2,44,34,0.65)]
                  sm:-left-4
                "
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <BookOpen aria-hidden="true" size={18} />
                </span>

                <span className="flex flex-col leading-tight">
                  <span className="text-base font-extrabold text-emerald-950">200+</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">Courses</span>
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
