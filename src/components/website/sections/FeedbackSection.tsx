'use client';

import { useQuery } from '@tanstack/react-query';
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import {
  MessageSquarePlus,
  RotateCcw,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { FeedbackCard } from '@/components/website/feedback/FeedbackCard';
import { FeedbackModal } from '@/components/website/feedback/FeedbackModal';
import { getPublicFeedback } from '@/lib/api/feedback';
import { publicKeys } from '@/lib/query/client';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE,
    },
  },
};

export default function FeedbackSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.1 });

  const [modalOpen, setModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [minScrollCount, setMinScrollCount] = useState(3);

  // Responsive scroll threshold: desktop needs > 3 (or 4 on xl) to scroll, tablet needs > 2, mobile needs > 1
  useEffect(() => {
    const mqlXl = window.matchMedia('(min-width: 1280px)');
    const mqlLg = window.matchMedia('(min-width: 1024px)');
    const mqlSm = window.matchMedia('(min-width: 640px)');

    const update = () => {
      if (mqlXl.matches) {
        setMinScrollCount(4); // XL desktop: <= 4 is static, > 4 scrolls
      } else if (mqlLg.matches) {
        setMinScrollCount(3); // Desktop: <= 3 is static, > 3 scrolls
      } else if (mqlSm.matches) {
        setMinScrollCount(2); // Tablet: <= 2 is static, > 2 scrolls
      } else {
        setMinScrollCount(1); // Mobile: 1 is static, >= 2 scrolls
      }
    };

    update();
    mqlXl.addEventListener('change', update);
    mqlLg.addEventListener('change', update);
    mqlSm.addEventListener('change', update);

    return () => {
      mqlXl.removeEventListener('change', update);
      mqlLg.removeEventListener('change', update);
      mqlSm.removeEventListener('change', update);
    };
  }, []);

  // TanStack Query for public approved feedback
  const feedbackQuery = useQuery({
    queryKey: publicKeys.feedback,
    queryFn: () => getPublicFeedback(),
  });

  // Approved feedback entries only
  const approvedFeedback = useMemo(() => {
    return (feedbackQuery.data ?? []).filter((item) => item.is_approved);
  }, [feedbackQuery.data]);

  const shouldScroll = approvedFeedback.length > minScrollCount;

  const loading =
    feedbackQuery.isPending ||
    (feedbackQuery.isFetching && !feedbackQuery.data);

  const error =
    feedbackQuery.isError && !feedbackQuery.data && !feedbackQuery.isFetching
      ? 'Unable to load student reviews right now. Please try again.'
      : null;

  // Build a seamless marquee array: ensure each half has at least 5 cards for smooth infinite looping
  const marqueeCards = useMemo(() => {
    if (!shouldScroll || approvedFeedback.length === 0) return [];

    let base = [...approvedFeedback];
    while (base.length < 5) {
      base = base.concat(approvedFeedback);
    }

    // Duplicate once so track moves from 0 to -50% imperceptibly
    return [...base, ...base];
  }, [approvedFeedback, shouldScroll]);

  // Overall average rating calculation
  const stats = useMemo(() => {
    if (approvedFeedback.length === 0) return null;
    const sum = approvedFeedback.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = (sum / approvedFeedback.length).toFixed(1);
    return {
      average: avg,
      count: approvedFeedback.length,
    };
  }, [approvedFeedback]);

  return (
    <section
      ref={sectionRef}
      id="feedback-section"
      aria-labelledby="feedback-title"
      className="relative isolate overflow-hidden bg-page px-4 pt-12 pb-28 sm:px-8 sm:pt-16 sm:pb-36 lg:px-16 lg:pt-20 lg:pb-44"
    >
      {/* Decorative ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-40 top-1/4 size-[420px] rounded-full bg-primary/[0.04] blur-[110px]" />
        <div className="absolute -right-32 bottom-1/4 size-[400px] rounded-full bg-accent/[0.035] blur-[110px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-[1440px]">
        {/* Header: Eyebrow, Title, Subtitle, and Add Feedback Button */}
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end sm:mb-10"
        >
          <div>
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary ring-1 ring-inset ring-primary/20">
                <span aria-hidden="true" className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full rounded-full bg-primary opacity-50 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                Student Voices
              </span>
            </motion.div>

            <motion.h2
              id="feedback-title"
              variants={itemVariants}
              className="mt-2 text-2xl font-bold leading-tight tracking-[-0.03em] text-accent sm:text-3xl lg:text-[2.25rem]"
            >
              Loved by Learners,{' '}
              <span className="bg-linear-to-r from-emerald-600 via-primary to-teal-600 bg-clip-text text-transparent">
                Driven by Results
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-muted"
            >
              Real stories and feedback from learners building their futures with
              Ayadi Cloudversity.
            </motion.p>
          </div>

          {/* Rating Snapshot (if feedback exists) */}
          {stats && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 self-start md:self-end rounded-full bg-surface px-3.5 py-1.5 ring-1 ring-border shadow-xs"
            >
              <div className="flex items-center gap-0.5 text-amber-400">
                <Star size={13} className="fill-amber-400" />
              </div>
              <span className="text-xs font-bold text-accent">
                {stats.average}
              </span>
              <span className="text-[11px] text-muted">
                ({stats.count} {stats.count === 1 ? 'review' : 'reviews'})
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex gap-4 sm:gap-6 overflow-hidden py-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="w-[290px] sm:w-[340px] md:w-[360px] shrink-0 rounded-2xl bg-surface p-5 ring-1 ring-border shadow-xs animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-24 rounded bg-primary/10" />
                    <div className="h-2.5 w-16 rounded bg-primary/10" />
                  </div>
                </div>
                <div className="mt-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="size-3 rounded bg-primary/10" />
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-2.5 w-full rounded bg-primary/10" />
                  <div className="h-2.5 w-4/5 rounded bg-primary/10" />
                  <div className="h-2.5 w-3/5 rounded bg-primary/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
            <p className="text-xs sm:text-sm font-medium text-muted">{error}</p>
            <button
              type="button"
              onClick={() => {
                void feedbackQuery.refetch();
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <RotateCcw size={13} />
              Try again
            </button>
          </div>
        )}

        {/* Empty State: Friendly invitation to submit the first review */}
        {!loading && !error && approvedFeedback.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/80 p-8 text-center sm:p-12">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users size={22} />
            </div>
            <h3 className="mt-3.5 text-base font-bold text-accent sm:text-lg">
              No Student Reviews Yet
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs sm:text-sm text-muted">
              Be the first to share your learning experience with our community!
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-gradient px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs ring-1 ring-inset ring-white/15 transition-all hover:ring-primary/40 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Sparkles size={14} />
              Share Your Feedback
            </button>
          </div>
        )}

        {/* Feedback Cards: Static row when few items fit on screen, continuous marquee when count exceeds threshold */}
        {!loading && !error && approvedFeedback.length > 0 && (
          <>
            {!shouldScroll ? (
              /* Static layout: cleanly centered without duplicate cards or infinite marquee */
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4">
                {approvedFeedback.map((item) => (
                  <FeedbackCard key={item.id} feedback={item} />
                ))}
              </div>
            ) : (
              /* Feedback Carousel / Continuous Scrolling Track */
              <div
                className="group relative -mx-4 overflow-hidden px-4 sm:-mx-8 sm:px-8 lg:-mx-16 lg:px-16 select-none"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                {/* Left and Right Edge Gradient Masks for luxury editorial aesthetic */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-24 bg-linear-to-r from-page to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-24 bg-linear-to-l from-page to-transparent"
                />

                {/* Reduced Motion View: Clean horizontal touch scroll with no continuous animation */}
                {reduceMotion ? (
                  <div className="flex gap-4 sm:gap-6 overflow-x-auto py-4 scrollbar-none">
                    {approvedFeedback.map((item) => (
                      <FeedbackCard key={item.id} feedback={item} />
                    ))}
                  </div>
                ) : (
                  /* Continuously Auto-Scrolling Infinite Track */
                  <div
                    style={{
                      animationPlayState:
                        isPaused || !inView ? 'paused' : 'running',
                    }}
                    className="flex w-max gap-4 sm:gap-6 py-4 animate-feedback-marquee hover:[animation-play-state:paused]"
                  >
                    {marqueeCards.map((item, index) => (
                      <FeedbackCard
                        key={`${item.id}-${index}`}
                        feedback={item}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Bottom Center: Add Feedback Button */}
        {!loading && !error && approvedFeedback.length > 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-8 flex justify-center sm:mt-10"
          >
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent-gradient px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs ring-1 ring-inset ring-white/15 transition-all duration-300 hover:ring-primary/40 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <MessageSquarePlus
                size={16}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              Add Feedback
            </button>
          </motion.div>
        )}
      </div>

      {/* Submission Modal */}
      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          // Re-fetch public feedback query
          void feedbackQuery.refetch();
        }}
      />
    </section>
  );
}
