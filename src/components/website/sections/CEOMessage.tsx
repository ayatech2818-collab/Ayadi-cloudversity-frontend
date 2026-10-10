
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";

const VIDEO_ID = "YMbMOmRhhM4";

export default function CEOMessage() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative overflow-hidden px-2 py-10 sm:px-4 sm:py-16 md:px-8 lg:px-16 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-[#f5f8f3]" />

      {/* Green glow */}
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[300px] w-[300px] rounded-full bg-[#62e62b]/10 blur-[90px] sm:h-[500px] sm:w-[500px] sm:blur-[120px]" />

      {/* Navy glow */}
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[280px] w-[280px] rounded-full bg-[#182653]/5 blur-[90px] sm:h-[450px] sm:w-[450px] sm:blur-[120px]" />

      {/* Decorative text */}
      <div className="pointer-events-none absolute -bottom-12 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[18vw] font-bold leading-none tracking-[-0.08em] text-[#182653]/[0.025] lg:block">
        AYADI
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1665px]">
        <div className="grid grid-cols-2 items-center gap-3 sm:gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative min-w-0"
          >
            {/* Label */}
            <div className="mb-4 flex items-center gap-2 sm:mb-7 sm:gap-3">
              <span className="h-px w-4 shrink-0 bg-primary sm:w-10" />

              <span className="text-[8px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-[#182653]/60 min-[380px]:text-[9px] sm:text-xs sm:tracking-[0.3em]">
                A Message From Ayadi
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-[25px] font-medium leading-[1.08] tracking-[-0.045em] text-accent min-[380px]:text-[27px] sm:text-4xl md:text-6xl lg:text-[72px]">
              Education is more
              <br />
              <span className="text-primary">than learning.</span>
            </h2>

            {/* Description */}
            <p className="mt-3 text-[10px] leading-[1.6] text-[#182653]/60 min-[380px]:text-[11px] sm:mt-7 sm:max-w-md sm:text-base sm:leading-7 md:text-lg">
              Discover the vision behind Ayadi and the belief that education
              should create possibilities, not just qualifications.
            </p>

            {/* Quote */}
            <div className="mt-5 border-l-2 border-[#62e62b] pl-2.5 sm:mt-10 sm:pl-5">
              <p className="text-[11px] font-medium leading-[1.6] text-[#182653] min-[380px]:text-xs sm:max-w-md sm:text-lg sm:leading-relaxed md:text-xl">
                "Learning should change what you believe is possible."
              </p>

              <p className="mt-2 text-[7px] font-semibold uppercase tracking-[0.12em] text-[#182653]/40 min-[380px]:text-[8px] sm:mt-3 sm:text-xs sm:tracking-[0.2em]">
                Ayadi Leadership
              </p>
            </div>

            {/* Bottom detail */}
            <div className="mt-5 flex items-center gap-1.5 text-[9px] font-medium text-[#182653]/50 min-[380px]:text-[10px] sm:mt-10 sm:gap-2 sm:text-sm">
              <span>Discover our story</span>
              <ArrowUpRight
                size={14}
                className="shrink-0 text-primary sm:h-[17px] sm:w-[17px]"
              />
            </div>
          </motion.div>

          {/* RIGHT VIDEO */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative min-w-0"
          >
            {/* Decorative number */}
            <div className="absolute -right-5 -top-12 z-0 hidden font-mono text-xs uppercase tracking-[0.3em] text-[#182653]/20 lg:block">
              AYADI / 001
            </div>

            {/* Green glow */}
            <div className="absolute -inset-1 rounded-2xl bg-[#62e62b]/10 blur-lg sm:-inset-5 sm:rounded-[40px] sm:blur-2xl" />

            {/* Video */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35 }}
              className="group relative z-10 aspect-video overflow-hidden rounded-xl bg-[#101a38] shadow-[0_12px_30px_rgba(24,38,83,0.15)] sm:rounded-[30px] sm:shadow-[0_30px_80px_rgba(24,38,83,0.18)]"
            >
              {!playing ? (
                <>
                  {/* YouTube thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                    alt="Ayadi CEO message"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1532]/80 via-[#0c1532]/20 to-transparent" />

                  {/* Top label */}
                  <div className="absolute left-2 top-2 rounded-full border border-white/20 bg-black/20 px-1.5 py-1 text-[6px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md min-[380px]:text-[7px] sm:left-6 sm:top-6 sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.2em]">
                    CEO Message
                  </div>

                  {/* Play button */}
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label="Play CEO message"
                    className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-[#182653] shadow-[0_0_0_5px_rgba(98,230,43,0.12)] transition-all duration-300 hover:scale-110 min-[380px]:h-10 min-[380px]:w-10 sm:h-20 sm:w-20 sm:shadow-[0_0_0_10px_rgba(98,230,43,0.12)] sm:hover:shadow-[0_0_0_16px_rgba(98,230,43,0.12)]"
                  >
                    <Play
                      size={16}
                      fill="currentColor"
                      className="ml-0.5 sm:ml-1 sm:h-7 sm:w-7"
                    />
                  </button>

                  {/* Video overlay text */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-1 sm:bottom-6 sm:left-6 sm:right-6 sm:gap-3">
                    <div className="min-w-0">
                      <p className="text-[6px] uppercase tracking-[0.08em] text-white/60 min-[380px]:text-[7px] sm:text-xs sm:tracking-[0.2em]">
                        Watch the story
                      </p>

                      <p className="mt-0.5 text-[9px] font-medium leading-tight text-white min-[380px]:text-[10px] sm:mt-1 sm:text-lg">
                        A vision for better learning
                      </p>
                    </div>

                    <span className="hidden shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 sm:block">
                      Play
                    </span>
                  </div>
                </>
              ) : (
                /* Load YouTube only after click */
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                  title="Ayadi CEO Message"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </motion.div>

            {/* Video metadata */}
            <div className="relative z-10 mt-3 flex items-start justify-between gap-1 px-0.5 sm:mt-5 sm:px-1">
              <span className="text-[7px] uppercase leading-relaxed tracking-[0.12em] text-[#182653]/35 min-[380px]:text-[8px] sm:text-xs sm:tracking-[0.2em]">
                Ayadi Cloudversity
              </span>

              <span className="text-right text-[7px] leading-relaxed text-[#182653]/35 min-[380px]:text-[8px] sm:text-xs">
                Watch on demand
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
