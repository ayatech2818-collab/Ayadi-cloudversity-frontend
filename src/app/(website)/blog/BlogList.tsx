'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { getPublicBlogs, type Blog } from '@/lib/api/blogs';

import GetStartedCta from '@/components/website/sections/GetStartedCta';
import {
  CARD_CHROME,
  CardDecor,
  useCardTilt,
} from '@/components/website/ui/card-chrome';

import BlogCover from './BlogCover';
import PostCard, {
  type PublicBlogPost,
} from './PostCard';

const POSTS_PER_PAGE = 6;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: EASE,
    },
  },
};

const lineUp: Variants = {
  hidden: {
    y: '130%',
  },
  visible: {
    y: 0,
    transition: {
      duration: 0.9,
      ease: EASE,
    },
  },
};

/**
 * Convert backend Blog data into the shape expected by the
 * existing public PostCard component.
 */
function mapBlogToPost(blog: Blog): PublicBlogPost {
  const publishedDate = blog.published_at ?? blog.created_at;

  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    category: blog.category ?? 'General',
    date: publishedDate,
    displayDate: new Date(publishedDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    readTime: blog.reading_time_minutes
      ? `${blog.reading_time_minutes} min read`
      : '5 min read',
    author: blog.author ?? 'Ayadi Cloudversity',
    image: blog.cover_image ?? '/images/blog/placeholder.svg',
  };
}

export default function BlogList() {
  const reduceMotion = useReducedMotion();
  const start = reduceMotion ? 'visible' : 'hidden';

  const gridRef = useRef<HTMLDivElement>(null);

  /*
   * 3 rather than 4 degrees: the featured card is nearly 1180px wide,
   * and a large surface needs less rotation than a small one.
   */
  const featuredTilt = useCardTilt(3);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);

  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * Load published blogs from the backend.
   *
   * Category filtering is intentionally sent to the backend.
   */
  useEffect(() => {
    let cancelled = false;

    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getPublicBlogs({
          sort_by: 'newest',
          ...(category !== 'All'
            ? {
                category,
              }
            : {}),
        });

        if (cancelled) {
          return;
        }

        setBlogs(data);

        /*
         * Build the category list from all published blogs.
         *
         * We only need to discover categories when viewing "All".
         * When a specific category is selected, the backend already
         * filtered the result.
         */
        if (category === 'All') {
          const uniqueCategories = Array.from(
            new Set(
              data
                .map((blog) => blog.category)
                .filter(
                  (value): value is string =>
                    Boolean(value && value.trim())
                )
            )
          );

          setCategories(['All', ...uniqueCategories]);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error('Failed to load blogs:', err);

        setError(
          'Unable to load articles right now. Please try again later.'
        );

        setBlogs([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBlogs();

    return () => {
      cancelled = true;
    };
  }, [category]);

  /*
   * Convert backend blogs into the existing public-card shape.
   */
  const posts = useMemo(
    () => blogs.map(mapBlogToPost),
    [blogs]
  );

  /*
   * The admin panel controls which article is featured.
   *
   * Do not assume the newest article is featured anymore.
   */
  const featuredBlog = useMemo(
    () => blogs.find((blog) => blog.is_featured),
    [blogs]
  );

  const featured = featuredBlog
    ? mapBlogToPost(featuredBlog)
    : null;

  /*
   * Featured article is only shown on "All".
   *
   * For a category page, every returned article belongs to
   * that category and goes into the normal grid.
   */
  const showFeatured = category === 'All' && Boolean(featured);

  const rest = useMemo(() => {
    if (!featuredBlog) {
      return posts;
    }

    return posts.filter(
      (post) => post.id !== featuredBlog.id
    );
  }, [posts, featuredBlog]);

  const visiblePosts = showFeatured ? rest : posts;

  /*
   * Client-side pagination is retained because the current
   * getPublicBlogs() API does not expose page/limit parameters.
   */
  const totalPages = Math.max(
    1,
    Math.ceil(visiblePosts.length / POSTS_PER_PAGE)
  );

  /*
   * Derived rather than clamped in an effect, so a filter that
   * shrinks the result set can never leave the view on a page
   * that no longer exists.
   */
  const currentPage = Math.min(page, totalPages);

  const startIndex =
    (currentPage - 1) * POSTS_PER_PAGE;

  const visible = visiblePosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  const goToPage = (next: number) => {
    setPage(
      Math.min(
        Math.max(next, 1),
        totalPages
      )
    );

    gridRef.current?.scrollIntoView({
      block: 'start',
    });
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -right-32 -top-40 size-[560px] rounded-full bg-primary/[0.07] blur-[130px]" />

          <div className="absolute -left-40 top-1/3 size-[420px] rounded-full bg-accent/[0.07] blur-[130px]" />
        </div>

        <motion.div
          variants={stagger}
          initial={start}
          animate="visible"
          className="mx-auto max-w-[1180px]"
        >
          <motion.div variants={fadeUp}>
            <Eyebrow>Ayadi Insights</Eyebrow>
          </motion.div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <h1 className="text-[2.5rem] font-semibold leading-[1.0] tracking-[-0.045em] text-text sm:text-6xl lg:text-[4.2rem]">
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  variants={lineUp}
                  className="block"
                >
                  Ideas that inspire
                </motion.span>
              </span>

              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  variants={lineUp}
                  className="block"
                >
                  <span className="relative inline-block text-accent-soft">
                    learning.

                    <motion.span
                      aria-hidden="true"
                      initial={
                        reduceMotion
                          ? false
                          : { scaleX: 0 }
                      }
                      animate={{ scaleX: 1 }}
                      transition={{
                        delay: 0.75,
                        duration: 0.8,
                        ease: EASE,
                      }}
                      className="absolute -bottom-0.5 left-0 h-[4px] w-full origin-left rounded-full bg-brand-gradient"
                    />
                  </span>
                </motion.span>
              </span>
            </h1>

            <motion.div
              variants={fadeUp}
              className="lg:pb-3"
            >
              <p className="max-w-md text-base leading-8 text-muted">
                Insights, ideas, and perspectives from the
                world of education, technology, careers, and
                lifelong learning.
              </p>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-muted/70">
                <span className="text-primary">
                  {blogs.length}
                </span>{' '}
                articles ·{' '}
                <span className="text-primary">
                  {Math.max(categories.length - 1, 0)}
                </span>{' '}
                topics
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================
          FEATURED
      ========================================================= */}

      {showFeatured && featured ? (
        <section
          aria-labelledby="featured-heading"
          className="px-5 pb-16 sm:px-8 lg:px-16 lg:pb-20"
        >
          <div className="mx-auto max-w-[1180px]">
            <h2
              id="featured-heading"
              className="sr-only"
            >
              Featured article
            </h2>

            <motion.div
              variants={fadeUp}
              initial={start}
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
            >
              <motion.article
                {...featuredTilt}
                className={`${CARD_CHROME} md:grid md:grid-cols-2`}
              >
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
                    className="absolute inset-0 bg-linear-to-t from-accent-strong/50 via-transparent to-transparent"
                  />
                </div>

                <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary ring-1 ring-inset ring-primary/20">
                      <span
                        aria-hidden="true"
                        className="relative flex size-1.5"
                      >
                        <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />

                        <span className="relative inline-flex size-full rounded-full bg-primary" />
                      </span>

                      Featured
                    </span>

                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted/70">
                      {featured.category}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-accent transition-colors duration-300 group-hover:text-primary sm:text-3xl lg:text-4xl">
                    <Link
                      href={`/blog/${featured.slug}`}
                      className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      {featured.title}
                    </Link>
                  </h3>

                  <p className="mt-4 max-w-md text-base leading-8 text-muted">
                    {featured.excerpt}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays
                        aria-hidden="true"
                        size={14}
                        className="text-primary"
                      />

                      <time dateTime={featured.date}>
                        {featured.displayDate}
                      </time>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock3
                        aria-hidden="true"
                        size={14}
                        className="text-primary"
                      />

                      {featured.readTime}
                    </span>
                  </div>

                  <span
                    aria-hidden="true"
                    className="mt-7 flex items-center gap-2 text-sm font-bold text-primary"
                  >
                    Read article

                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </motion.article>
            </motion.div>
          </div>
        </section>
      ) : null}

      {/* =========================================================
          GRID
      ========================================================= */}

      <section
        aria-labelledby="articles-heading"
        className="px-5 pb-24 sm:px-8 lg:px-16 lg:pb-82"
      >
        <div
          ref={gridRef}
          className="mx-auto max-w-[1180px] scroll-mt-28"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>
                {category === 'All'
                  ? 'More articles'
                  : `${category} articles`}
              </Eyebrow>

              <h2
                id="articles-heading"
                className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-accent sm:text-3xl"
              >
                From the Ayadi community
              </h2>
            </div>

            <p
              aria-live="polite"
              className="text-sm text-muted"
            >
              {loading
                ? 'Loading articles...'
                : `${visiblePosts.length} ${
                    visiblePosts.length === 1
                      ? 'article'
                      : 'articles'
                  }${
                    totalPages > 1
                      ? ` · page ${currentPage} of ${totalPages}`
                      : ''
                  }`}
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
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    isActive
                      ? 'bg-accent-gradient text-white shadow-lg shadow-accent/25'
                      : 'bg-surface text-muted ring-1 ring-inset ring-border hover:text-primary hover:ring-primary/30'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error ? (
            <div className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-sm text-muted">
                {error}
              </p>

              <button
                type="button"
                onClick={() => {
                  setCategory(category);
                }}
                className="mt-4 text-sm font-bold text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : null}

          {/* Loading */}
          {loading ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: POSTS_PER_PAGE,
              }).map((_, index) => (
                <div
                  key={index}
                  className={`${CARD_CHROME} overflow-hidden`}
                >
                  <div className="aspect-[16/10] animate-pulse bg-primary/5" />

                  <div className="space-y-4 p-6">
                    <div className="h-3 w-24 animate-pulse rounded bg-primary/10" />

                    <div className="h-6 w-4/5 animate-pulse rounded bg-primary/10" />

                    <div className="h-16 animate-pulse rounded bg-primary/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Empty */}
          {!loading &&
          !error &&
          visible.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-border bg-surface p-12 text-center">
              <p className="text-base font-semibold text-accent">
                No articles found.
              </p>

              <p className="mt-2 text-sm text-muted">
                There are no published articles in this
                category yet.
              </p>
            </div>
          ) : null}

          {/* Articles */}
          {!loading &&
          !error &&
          visible.length > 0 ? (
            <motion.ul
              key={`${category}-${currentPage}`}
              variants={stagger}
              initial={start}
              animate="visible"
              className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((post) => (
                <motion.li
                  key={post.id}
                  variants={fadeUp}
                >
                  <PostCard
                    post={post}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                </motion.li>
              ))}
            </motion.ul>
          ) : null}

          {/* =====================================================
              PAGINATION
          ===================================================== */}

          {!loading && totalPages > 1 ? (
            <nav
              aria-label="Article pages"
              className="mt-14 flex flex-wrap items-center justify-center gap-2"
            >
              <PageButton
                onClick={() =>
                  goToPage(currentPage - 1)
                }
                disabled={currentPage === 1}
                label="Previous page"
              >
                <ChevronLeft
                  aria-hidden="true"
                  size={16}
                />

                <span className="hidden sm:inline">
                  Previous
                </span>
              </PageButton>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1
              ).map((number) => {
                const isCurrent =
                  number === currentPage;

                return (
                  <button
                    key={number}
                    type="button"
                    onClick={() =>
                      goToPage(number)
                    }
                    aria-label={`Page ${number}`}
                    aria-current={
                      isCurrent
                        ? 'page'
                        : undefined
                    }
                    className={`size-10 rounded-full text-sm font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isCurrent
                        ? 'bg-accent-gradient text-white shadow-lg shadow-accent/25'
                        : 'text-muted ring-1 ring-inset ring-border hover:text-primary hover:ring-primary/30'
                    }`}
                  >
                    {number}
                  </button>
                );
              })}

              <PageButton
                onClick={() =>
                  goToPage(currentPage + 1)
                }
                disabled={
                  currentPage === totalPages
                }
                label="Next page"
              >
                <span className="hidden sm:inline">
                  Next
                </span>

                <ChevronRight
                  aria-hidden="true"
                  size={16}
                />
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

function Eyebrow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
      <span
        aria-hidden="true"
        className="h-px w-6 bg-primary/50"
      />

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