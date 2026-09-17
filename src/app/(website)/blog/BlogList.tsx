'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState, type ReactNode } from 'react';

import GetStartedCta from '@/components/website/sections/GetStartedCta';
import { CARD_CHROME, CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';

import BlogCover from './BlogCover';
import PostCard from './PostCard';
import { categories, posts } from './posts';

const POSTS_PER_PAGE = 6;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const lineUp: Variants = {
  hidden: { y: '130%' },
  visible: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

/* The newest post is promoted to a wide card above the grid. */
const [featured, ...rest] = posts;

export default function BlogList() {
  const reduceMotion = useReducedMotion();
  const start = reduceMotion ? 'visible' : 'hidden';

  const gridRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  const showFeatured = category === 'All';

  const filtered = useMemo(
    () => (showFeatured ? rest : posts.filter((post) => post.category === category)),
    [category, showFeatured],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));

  /* Derived rather than clamped in an effect, so a filter that shrinks the
     result set can never leave the view on a page that no longer exists. */
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const visible = filtered.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(next, 1), totalPages));
    gridRef.current?.scrollIntoView({ block: 'start' });
  };

  const changeCategory = (next: string) => {
    setCategory(next);
    setPage(1);
  };

  return (
    <main>
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative isolate overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pt-36 lg:px-16 lg:pb-20 lg:pt-44">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-32 -top-40 size-[560px] rounded-full bg-primary/[0.07] blur-[130px]" />
          <div className="absolute -left-40 top-1/3 size-[420px] rounded-full bg-brand-end/[0.06] blur-[130px]" />
        </div>

        <motion.div variants={stagger} initial={start} animate="visible" className="mx-auto max-w-[1180px]">
          <motion.div variants={fadeUp}>
            <Eyebrow>Ayadi Insights</Eyebrow>
          </motion.div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <h1 className="text-[2.5rem] font-semibold leading-[1.0] tracking-[-0.045em] text-text sm:text-6xl lg:text-[4.2rem]">
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span variants={lineUp} className="block">
                  Ideas that inspire
                </motion.span>
              </span>

              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span variants={lineUp} className="block">
                  <span className="relative inline-block">
                    learning.
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

            <motion.div variants={fadeUp} className="lg:pb-3">
              <p className="max-w-md text-base leading-8 text-muted">
                Insights, ideas, and perspectives from the world of education, technology, careers, and lifelong
                learning.
              </p>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-muted/70">
                <span className="text-primary">{posts.length}</span> articles ·{' '}
                <span className="text-primary">{categories.length - 1}</span> topics
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================
          FEATURED
      ========================================================= */}
      {showFeatured ? (
        <section aria-labelledby="featured-heading" className="px-5 pb-16 sm:px-8 lg:px-16 lg:pb-20">
          <div className="mx-auto max-w-[1180px]">
            <h2 id="featured-heading" className="sr-only">
              Featured article
            </h2>

            <motion.div variants={fadeUp} initial={start} whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <article onPointerMove={handleSpotlight} className={`${CARD_CHROME} md:grid md:grid-cols-2`}>
                <CardDecor />

                <div className="relative aspect-[16/10] overflow-hidden bg-primary/5 md:aspect-auto md:min-h-[360px]">
                  <BlogCover
                    src={featured.image}
                    alt=""
                    sizes="(min-width: 768px) 50vw, 100vw"
                    priority
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-[#04231c]/45 via-transparent to-transparent"
                  />
                </div>

                <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary ring-1 ring-inset ring-primary/20">
                      <span aria-hidden="true" className="relative flex size-1.5">
                        <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
                        <span className="relative inline-flex size-full rounded-full bg-primary" />
                      </span>
                      Latest
                    </span>

                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted/70">
                      {featured.category}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-text transition-colors duration-300 group-hover:text-primary sm:text-3xl lg:text-4xl">
                    <Link
                      href={`/blog/${featured.slug}`}
                      className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      {featured.title}
                    </Link>
                  </h3>

                  <p className="mt-4 max-w-md text-base leading-8 text-muted">{featured.excerpt}</p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays aria-hidden="true" size={14} className="text-primary" />
                      <time dateTime={featured.date}>{featured.displayDate}</time>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock3 aria-hidden="true" size={14} className="text-primary" />
                      {featured.readTime}
                    </span>
                  </div>

                  <span aria-hidden="true" className="mt-7 flex items-center gap-2 text-sm font-bold text-primary">
                    Read article
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </article>
            </motion.div>
          </div>
        </section>
      ) : null}

      {/* =========================================================
          GRID
      ========================================================= */}
      <section aria-labelledby="articles-heading" className="px-5 pb-24 sm:px-8 lg:px-16 lg:pb-32">
        <div ref={gridRef} className="mx-auto max-w-[1180px] scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>{showFeatured ? 'More articles' : `${category} articles`}</Eyebrow>

              <h2
                id="articles-heading"
                className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-text sm:text-3xl"
              >
                From the Ayadi community
              </h2>
            </div>

            <p aria-live="polite" className="text-sm text-muted">
              {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
              {totalPages > 1 ? ` · page ${currentPage} of ${totalPages}` : ''}
            </p>
          </div>

          {/* Topic filter */}
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((name) => {
              const isActive = name === category;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => changeCategory(name)}
                  aria-pressed={isActive}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-surface text-muted ring-1 ring-inset ring-border hover:text-primary hover:ring-primary/30'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <motion.ul
            key={`${category}-${currentPage}`}
            variants={stagger}
            initial={start}
            animate="visible"
            className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((post) => (
              <motion.li key={post.slug} variants={fadeUp}>
                <PostCard post={post} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
              </motion.li>
            ))}
          </motion.ul>

          {/* =====================================================
              PAGINATION
          ===================================================== */}
          {totalPages > 1 ? (
            <nav aria-label="Article pages" className="mt-14 flex flex-wrap items-center justify-center gap-2">
              <PageButton
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                label="Previous page"
              >
                <ChevronLeft aria-hidden="true" size={16} />
                <span className="hidden sm:inline">Previous</span>
              </PageButton>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => {
                const isCurrent = number === currentPage;

                return (
                  <button
                    key={number}
                    type="button"
                    onClick={() => goToPage(number)}
                    aria-label={`Page ${number}`}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`size-10 rounded-full text-sm font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      isCurrent
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-muted ring-1 ring-inset ring-border hover:text-primary hover:ring-primary/30'
                    }`}
                  >
                    {number}
                  </button>
                );
              })}

              <PageButton
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight aria-hidden="true" size={16} />
              </PageButton>
            </nav>
          ) : null}
        </div>
      </section>

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

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-muted ring-1 ring-inset ring-border transition-colors duration-300 hover:text-primary hover:ring-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted disabled:hover:ring-border"
    >
      {children}
    </button>
  );
}
