"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const learningPathways = [
  "Our Purpose",
  "Our Learning Philosophy",
  "Our Commitment to Learners",
];

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function Hero() {
  const [activePathway, setActivePathway] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative isolate overflow-hidden bg-page">
      <div aria-hidden="true" className="absolute right-[-16rem] top-12 -z-10 size-[40rem] rounded-full bg-hero-ambient blur-3xl " />

<section className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-[100rem] items-center gap-8 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-[1fr_0.95fr] lg:gap-10 lg:px-6 lg:py-16 mt-20">        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={contentVariants}
          className="flex max-w-2xl flex-col"
        >
          <motion.p variants={itemVariants} className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Learning for every next step
          </motion.p>
          <motion.h1 variants={itemVariants} className="max-w-xl text-4xl font-extrabold tracking-[-0.055em] text-text sm:text-5xl sm:leading-[1.06] lg:text-[3.65rem]">
            Start Your Future Education With{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">Ayadi Cloudversity</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-[1.0625rem] sm:leading-8">
            At Ayadi Cloudversity, education goes beyond facts. It sparks curiosity, builds character, and shapes futures. From playschool to post-graduation to workspace readiness, we are with you, providing learning pathways, academic excellence, career preparedness and personal growth.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8">
            <motion.a
              href="#learning-pathways"
              whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-md transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Explore Learning Paths
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-none stroke-current stroke-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12m-5-5 5 5-5 5" />
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: 18, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.15, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div aria-hidden="true" className="absolute -inset-5 -z-10 rounded-[2rem] bg-hero-ambient blur-2xl" />
            <div className="relative aspect-[1/1.05] overflow-hidden rounded-2xl border border-surface/70 bg-surface shadow-xl">
            <Image
              src="/images/hero-learning.png"
              alt="A child exploring letters through hands-on learning"
              fill
              priority
              sizes="(max-width: 1023px) min(100vw - 2.5rem, 28rem), 42vw"
              className="object-cover object-center"
            />
          </div>
          <div aria-hidden="true" className="absolute -bottom-3 -left-3 -z-10 h-28 w-3/5 rounded-bl-2xl rounded-tr-2xl border border-border bg-surface" />
        </motion.div>

        <motion.div
          id="learning-pathways"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
          className="lg:col-span-1"
        >
          <div className="border-t border-border pt-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-muted">The Ayadi approach</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {learningPathways.map((pathway, index) => {
                const isActive = activePathway === index;

                return (
                  <button
                    key={pathway}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActivePathway(index)}
                    className={`relative pb-2 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${isActive ? "text-primary" : "text-muted hover:text-text"}`}
                  >
                    {pathway}
                    {isActive && (
                      <motion.span
                        layoutId="active-learning-pathway"
                        className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
