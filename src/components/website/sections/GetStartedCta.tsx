'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { PointerEvent } from 'react';

const highlights = ['200+ Courses', 'Flexible Learning', 'Expert Instructors'];

/* Degrees of tilt at the very edge of the card. Small on purpose — past ~6deg
 * the text starts to look like it is sliding off a table. */
const MAX_TILT = 4;

/* Loose enough to trail the cursor, damped enough not to wobble on release. */
const TILT_SPRING = { stiffness: 210, damping: 24, mass: 0.45 };

/*
 * Sits between the last section and the footer, and deliberately overlaps the
 * footer's top edge. The negative bottom margin here is what pulls the footer
 * up — Footer.tsx reserves matching top padding for it.
 */
export default function GetStartedCta() {
  const reduceMotion = useReducedMotion();

  /* The pointer writes to these; the springs smooth them and feed the card's
   * transform. Nothing here goes through React state, so moving the cursor
   * never re-renders the component. */
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, TILT_SPRING);
  const rotateY = useSpring(tiltY, TILT_SPRING);

  // Feeds the cursor position to the spotlight overlay and the 3D tilt.
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    event.currentTarget.style.setProperty('--spot-x', `${x}px`);
    event.currentTarget.style.setProperty('--spot-y', `${y}px`);

    // A finger dragging the page should not tip the card.
    if (reduceMotion || event.pointerType !== 'mouse') return;

    // -0.5 … 0.5, measured from the centre of the card.
    tiltY.set((x / rect.width - 0.5) * MAX_TILT * 2);
    tiltX.set((0.5 - y / rect.height) * MAX_TILT * 2);
  };

  const handlePointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
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
        -mt-44
        -mb-44
        px-3
        sm:-mt-45
        sm:-mb-45
        sm:px-6
        md:-mt-65
        md:-mb-65
        md:px-8
        lg:-mt-55
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
        {/* transformPerspective lives on the card itself rather than as a
            `perspective` on the parent, so the tilt cannot be flattened by any
            page it gets dropped into. */}
        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ rotateX, rotateY, transformPerspective: 1400 }}
          className="
            group
            relative
            isolate
            overflow-hidden
            rounded-[20px]
            bg-linear-to-br
            from-emerald-950
            via-emerald-800
            to-emerald-600
            p-3.5
            shadow-[0_40px_100px_-45px_rgba(2,44,34,0.75)]
            ring-1
            ring-inset
            ring-white/15
            sm:rounded-[26px]
            sm:p-6
            md:p-8
            lg:rounded-[32px]
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

          {/* Two columns at every width — the phone keeps the desktop layout,
              just scaled down, rather than stacking into two rows. */}
          <div className="grid grid-cols-[1.15fr_0.85fr] items-center gap-3 sm:gap-6 md:gap-8 lg:grid-cols-[1.05fr_0.9fr] lg:gap-12">
            {/* ---------- CONTENT ---------- */}
            <div className="relative">
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-white/10
                  px-2
                  py-0.5
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-emerald-50
                  ring-1
                  ring-inset
                  ring-white/20
                  backdrop-blur-sm
                  sm:gap-2
                  sm:px-3
                  sm:py-1
                  sm:text-[9px]
                  sm:tracking-[0.2em]
                  lg:gap-2.5
                  lg:px-4
                  lg:py-1.5
                  lg:text-[11px]
                  lg:tracking-[0.25em]
                "
              >
                <span aria-hidden="true" className="relative flex size-1.5 lg:size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-lime-300 opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-full rounded-full bg-lime-300" />
                </span>
                Start Your Journey
              </span>

              <h2
                id="get-started-title"
                className="
                  mt-2
                  text-[15px]
                  font-bold
                  leading-[1.08]
                  tracking-[-0.03em]
                  text-white
                  sm:mt-4
                  sm:text-2xl
                  md:text-3xl
                  lg:mt-5
                  lg:tracking-[-0.04em]
                  lg:text-[2.6rem]
                "
              >
                Get Started With
                <br />
                <span className="bg-linear-to-r from-lime-200 via-emerald-200 to-teal-100 bg-clip-text text-transparent">
                  Ayadi Cloudversity
                </span>
              </h2>

              <p className="mt-1.5 max-w-md text-[10px] leading-snug text-emerald-50/80 sm:mt-3 sm:text-xs md:text-sm lg:mt-4 lg:text-base lg:leading-relaxed">
                Join thousands of learners who are leveling up their careers and achieving their personal goals with
                confidence.
              </p>

              <ul className="mt-2.5 flex flex-wrap items-center gap-1 sm:mt-4 sm:gap-1.5 lg:mt-6 lg:gap-2">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-50 ring-1 ring-inset ring-white/20 sm:px-2.5 sm:py-1 sm:text-[10px] lg:px-3 lg:text-[11px]"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-5 sm:gap-2.5 lg:mt-7 lg:gap-3">
                <Link
                  href="/courses"
                  className="
                    group/btn
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    bg-white
                    px-2.5
                    py-1.5
                    text-[9px]
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
                    sm:gap-2
                    sm:px-4
                    sm:py-2.5
                    sm:text-xs
                    lg:gap-2.5
                    lg:px-6
                    lg:py-3
                    lg:text-sm
                  "
                >
                  Explore Courses
                  <ArrowUpRight
                    aria-hidden="true"
                    size={18}
                    className="size-3 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 sm:size-4 lg:size-[18px]"
                  />
                </Link>

                <Link
                  href="/contact"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    px-2.5
                    py-1.5
                    text-[9px]
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
                    sm:px-3.5
                    sm:py-2.5
                    sm:text-xs
                    lg:px-5
                    lg:py-3
                    lg:text-sm
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
                  aspect-[4/5]
                  w-full
                  overflow-hidden
                  rounded-[12px]
                  ring-1
                  ring-inset
                  ring-white/20
                  sm:aspect-[1/1]
                  sm:rounded-[18px]
                  lg:aspect-[5/4]
                  lg:rounded-[22px]
                "
              >
                <Image
                  src="/images/footer-student.png"
                  alt="An Ayadi Cloudversity learner celebrating their achievement"
                  fill
                  sizes="(min-width: 1024px) 40vw, 35vw"
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
                  -bottom-2
                  -left-1.5
                  flex
                  items-center
                  gap-1
                  rounded-md
                  bg-white/95
                  px-1.5
                  py-1
                  shadow-[0_18px_40px_-18px_rgba(2,44,34,0.65)]
                  sm:-bottom-3
                  sm:-left-3
                  sm:gap-1.5
                  sm:rounded-lg
                  sm:px-2.5
                  sm:py-1.5
                  lg:-bottom-4
                  lg:gap-2.5
                  lg:rounded-xl
                  lg:px-3.5
                  lg:py-2.5
                "
              >
                <span className="flex size-4 items-center justify-center rounded bg-emerald-100 text-emerald-700 sm:size-6 sm:rounded-md lg:size-9 lg:rounded-lg">
                  <BookOpen aria-hidden="true" size={18} className="size-2.5 sm:size-3.5 lg:size-[18px]" />
                </span>

                <span className="flex flex-col leading-tight">
                  <span className="text-[9px] font-extrabold text-emerald-950 sm:text-xs lg:text-base">200+</span>
                  <span className="text-[6px] font-bold uppercase tracking-[0.1em] text-emerald-700 sm:text-[8px] lg:text-[9px] lg:tracking-[0.14em]">
                    Courses
                  </span>
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
