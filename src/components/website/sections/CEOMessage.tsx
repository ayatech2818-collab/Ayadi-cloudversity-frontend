"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";

const VIDEO_ID = "YMbMOmRhhM4";

export default function CEOMessage() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-8 lg:px-16 lg:py-28">
      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div className="absolute inset-0 bg-[#f5f8f3]" />

      {/* Green glow */}
      <div
        className="
          pointer-events-none
          absolute
          -right-40
          top-1/4
          h-[500px]
          w-[500px]
          rounded-full
          bg-[#62e62b]/10
          blur-[120px]
        "
      />

      {/* Navy glow */}
      <div
        className="
          pointer-events-none
          absolute
          -left-40
          bottom-0
          h-[450px]
          w-[450px]
          rounded-full
          bg-[#182653]/5
          blur-[120px]
        "
      />

      {/* Large decorative text */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-12
          left-1/2
          hidden
          -translate-x-1/2
          whitespace-nowrap
          text-[18vw]
          font-bold
          leading-none
          tracking-[-0.08em]
          text-[#182653]/[0.025]
          lg:block
        "
      >
        AYADI
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="relative z-10 mx-auto max-w-[1665px]">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">

          {/* ==================================================
              LEFT CONTENT
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -50,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative"
          >
            {/* Small label */}
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-[#62e62b]" />

              <span className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[#182653]/60
              ">
                A Message From Ayadi
              </span>
            </div>

            {/* Main heading */}
            <h2 className="
              max-w-xl
              text-5xl
              font-medium
              leading-[0.98]
              tracking-[-0.045em]
              text-[#182653]
              md:text-6xl
              lg:text-[72px]
            ">
              Education is more
              <br />

              <span className="text-[#62e62b]">
                than learning.
              </span>
            </h2>

            {/* Supporting text */}
            <p className="
              mt-7
              max-w-md
              text-base
              leading-7
              text-[#182653]/60
              md:text-lg
            ">
              Discover the vision behind Ayadi and the
              belief that education should create
              possibilities, not just qualifications.
            </p>

            {/* Quote */}
            <div className="
              mt-10
              border-l-2
              border-[#62e62b]
              pl-5
            ">
              <p className="
                max-w-md
                text-lg
                font-medium
                leading-relaxed
                text-[#182653]
                md:text-xl
              ">
                "Learning should change what you
                believe is possible."
              </p>

              <p className="
                mt-3
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#182653]/40
              ">
                Ayadi Leadership
              </p>
            </div>

            {/* Bottom detail */}
            <div className="
              mt-10
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-[#182653]/50
            ">
              <span>Discover our story</span>

              <ArrowUpRight
                size={17}
                className="text-[#62e62b]"
              />
            </div>
          </motion.div>

          {/* ==================================================
              RIGHT VIDEO
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 60,
              scale: 0.96,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative"
          >
            {/* Decorative number */}
            <div className="
              absolute
              -right-5
              -top-12
              z-0
              hidden
              font-mono
              text-xs
              uppercase
              tracking-[0.3em]
              text-[#182653]/20
              lg:block
            ">
              AYADI / 001
            </div>

            {/* Green glow behind video */}
            <div className="
              absolute
              -inset-5
              rounded-[40px]
              bg-[#62e62b]/10
              blur-2xl
            " />

            {/* Video */}
            <motion.div
              whileHover={{
                y: -6,
              }}
              transition={{
                duration: 0.35,
              }}
              className="
                group
                relative
                z-10
                aspect-video
                overflow-hidden
                rounded-[30px]
                bg-[#101a38]
                shadow-[0_30px_80px_rgba(24,38,83,0.18)]
              "
            >
              {!playing ? (
                <>
                  {/* YouTube thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                    alt="Ayadi CEO message"
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-105
                    "
                  />

                  {/* Dark cinematic overlay */}
                  <div className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-[#0c1532]/80
                    via-[#0c1532]/20
                    to-transparent
                  " />

                  {/* Top label */}
                  <div className="
                    absolute
                    left-6
                    top-6
                    rounded-full
                    border
                    border-white/20
                    bg-black/20
                    px-4
                    py-2
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-white
                    backdrop-blur-md
                  ">
                    CEO Message
                  </div>

                  {/* Play button */}
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label="Play CEO message"
                    className="
                      absolute
                      left-1/2
                      top-1/2
                      flex
                      h-20
                      w-20
                      -translate-x-1/2
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-[#62e62b]
                      text-[#182653]
                      shadow-[0_0_0_10px_rgba(98,230,43,0.12)]
                      transition-all
                      duration-300
                      hover:scale-110
                      hover:shadow-[0_0_0_16px_rgba(98,230,43,0.12)]
                    "
                  >
                    <Play
                      size={28}
                      fill="currentColor"
                      className="ml-1"
                    />
                  </button>

                  {/* Bottom text */}
                  <div className="
                    absolute
                    bottom-6
                    left-6
                    right-6
                    flex
                    items-end
                    justify-between
                  ">
                    <div>
                      <p className="
                        text-xs
                        uppercase
                        tracking-[0.2em]
                        text-white/50
                      ">
                        Watch the story
                      </p>

                      <p className="
                        mt-1
                        text-lg
                        font-medium
                        text-white
                      ">
                        A vision for better learning
                      </p>
                    </div>

                    <span className="
                      hidden
                      rounded-full
                      border
                      border-white/20
                      px-3
                      py-1
                      text-xs
                      text-white/70
                      sm:block
                    ">
                      Play
                    </span>
                  </div>
                </>
              ) : (
                /* ==================================================
                   LOAD YOUTUBE ONLY AFTER CLICK
                ================================================== */

                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
                  title="Ayadi CEO Message"
                  allow="
                    accelerometer;
                    autoplay;
                    clipboard-write;
                    encrypted-media;
                    gyroscope;
                    picture-in-picture;
                    web-share
                  "
                  allowFullScreen
                />
              )}
            </motion.div>

            {/* Bottom metadata */}
            <div className="
              relative
              z-10
              mt-5
              flex
              items-center
              justify-between
              px-1
            ">
              <span className="
                text-xs
                uppercase
                tracking-[0.2em]
                text-[#182653]/35
              ">
                Ayadi Cloudversity
              </span>

              <span className="
                text-xs
                text-[#182653]/35
              ">
                Watch on demand
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}