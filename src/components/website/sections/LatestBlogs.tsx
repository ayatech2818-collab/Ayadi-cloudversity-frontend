'use client';

import { useQuery } from '@tanstack/react-query';
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import AuthorAvatar from '@/app/(website)/blog/AuthorAvatar';
import {
  CardDecor,
  handleSpotlight,
} from '@/components/website/ui/card-chrome';
import { getPublicBlogs, type PublicBlog } from '@/lib/api/blogs';
import { publicKeys } from '@/lib/query/client';
import type { PublicBlogPost } from '@/app/(website)/blog/PostCard';

const MAX_ARTICLES = 8;
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

/**
 * Maps backend PublicBlog data into PublicBlogPost for presentation.
 */
function mapBlogToPost(blog: PublicBlog): PublicBlogPost {
  const publishedDate = blog.published_at ?? blog.created_at;

  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt ?? '',
    category: blog.category?.trim() || 'General',
    date: publishedDate,
    displayDate: new Date(publishedDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    readTime: blog.reading_time_minutes
      ? `${blog.reading_time_minutes} min read`
      : '5 min read',
    author: blog.author ?? null,
    image: blog.cover_image || '/images/blog/placeholder.svg',
  };
}

export default function LatestBlogs() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.1 });

  const [isPaused, setIsPaused] = useState(false);
  const [minScrollCount, setMinScrollCount] = useState(4);

  // Responsive scroll threshold: desktop needs > 4 to scroll, tablet needs > 2, mobile needs > 1
  useEffect(() => {
    const mqlLg = window.matchMedia('(min-width: 1024px)');
    const mqlSm = window.matchMedia('(min-width: 640px)');

    const update = () => {
      if (mqlLg.matches) {
        setMinScrollCount(4); // Desktop: <= 4 is static, > 4 scrolls
      } else if (mqlSm.matches) {
        setMinScrollCount(2); // Tablet: <= 2 is static, > 2 scrolls
      } else {
        setMinScrollCount(1); // Mobile: 1 is static, >= 2 scrolls
      }
    };

    update();
    mqlLg.addEventListener('change', update);
    mqlSm.addEventListener('change', update);

    return () => {
      mqlLg.removeEventListener('change', update);
      mqlSm.removeEventListener('change', update);
    };
  }, []);

  const blogsQuery = useQuery({
    queryKey: publicKeys.blogs('All'),
    queryFn: () => getPublicBlogs({ sort_by: 'newest' }),
  });

  const posts = useMemo(() => {
    return (blogsQuery.data ?? []).slice(0, MAX_ARTICLES).map(mapBlogToPost);
  }, [blogsQuery.data]);

  const shouldScroll = posts.length > minScrollCount;

  const loading =
    blogsQuery.isPending || (blogsQuery.isFetching && !blogsQuery.data);

  const error =
    blogsQuery.isError && !blogsQuery.data && !blogsQuery.isFetching
      ? 'Unable to load articles right now. Please try again later.'
      : null;

  // Build a seamless marquee array: ensure each half has at least 5 cards for smooth infinite looping
  const marqueePosts = useMemo(() => {
    if (!shouldScroll || posts.length === 0) return [];

    let base = [...posts];
    while (base.length < 5) {
      base = base.concat(posts);
    }

    // Duplicate once so track moves from 0 to -50% imperceptibly
    return [...base, ...base];
  }, [posts, shouldScroll]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="latest-blogs-title"
      className="relative isolate overflow-hidden bg-page px-6 py-8 sm:px-10 md:px-14 md:py-10 lg:px-20 lg:py-12 xl:px-24"
    >
      {/* Decorative ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-40 top-1/4 size-[360px] rounded-full bg-primary/[0.04] blur-[100px]" />
        <div className="absolute -right-32 bottom-0 size-[360px] rounded-full bg-accent/[0.03] blur-[100px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-[1440px]">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end sm:mb-8"
        >
          <div>
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary ring-1 ring-inset ring-primary/20">
                <span aria-hidden="true" className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full rounded-full bg-primary opacity-50 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                Ayadi Insights
              </span>
            </motion.div>

            <motion.h2
              id="latest-blogs-title"
              variants={itemVariants}
              className="mt-1.5 text-xl font-bold leading-tight tracking-[-0.03em] text-accent sm:text-2xl lg:text-[1.75rem]"
            >
              Ideas for Your Next{' '}
              <span className="bg-linear-to-r from-emerald-600 via-primary to-teal-600 bg-clip-text text-transparent">
                Step
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-sm"
            >
              Perspectives, ideas, and stories on learning, innovation, and career paths.
            </motion.p>
          </div>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex gap-4 sm:gap-5 overflow-hidden py-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-border bg-surface p-4 text-center sm:p-6">
            <p className="text-xs font-medium text-muted sm:text-sm">
              {error}
            </p>
            <button
              type="button"
              onClick={() => {
                void blogsQuery.refetch();
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <RotateCcw size={13} />
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-4 text-center sm:p-6">
            <p className="text-sm font-semibold text-accent">
              No articles published yet.
            </p>
            <p className="mt-1 text-xs text-muted">
              Check back soon for insights, stories, and updates from Ayadi.
            </p>
          </div>
        )}

        {/* Blog Cards: Static row when few items fit on screen, continuous marquee when count exceeds threshold */}
        {!loading && !error && posts.length > 0 && (
          <>
            {!shouldScroll ? (
              /* Static layout: cleanly centered without card duplication or infinite marquee */
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3">
                {posts.map((post) => (
                  <CompactBlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              /* Continuously Scrolling Infinite Blog Track */
              <div
                className="group relative -mx-6 overflow-hidden px-6 sm:-mx-10 sm:px-10 md:-mx-14 md:px-14 lg:-mx-20 lg:px-20 xl:-mx-24 xl:px-24 select-none"
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
                  <div className="flex gap-4 sm:gap-5 overflow-x-auto py-3 scrollbar-none">
                    {posts.map((post) => (
                      <CompactBlogCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  /* Continuously Auto-Scrolling Infinite Track */
                  <div
                    style={{
                      animationPlayState:
                        isPaused || !inView ? 'paused' : 'running',
                    }}
                    className="flex w-max gap-4 sm:gap-5 py-3 animate-blog-marquee hover:[animation-play-state:paused]"
                  >
                    {marqueePosts.map((post, index) => (
                      <CompactBlogCard
                        key={`${post.id}-${index}`}
                        post={post}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Bottom Center: View All Articles Button */}
        {!loading && !error && posts.length > 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-8 flex justify-center sm:mt-10"
          >
            <Link
              href="/blog"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent-gradient px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs ring-1 ring-inset ring-white/15 transition-all duration-300 hover:ring-primary/40 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span>View All Articles</span>
              <ArrowRight
                aria-hidden="true"
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/**
 * Compact, reduced blog card with only author image/name, heading, and 2-line content.
 * Clicking anywhere on the card navigates directly to the dedicated blog post page.
 */
const CompactBlogCard = memo(function CompactBlogCard({
  post,
}: {
  post: PublicBlogPost;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      onPointerMove={handleSpotlight}
      className="group relative isolate flex w-[270px] sm:w-[310px] md:w-[330px] shrink-0 flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl bg-surface p-4 sm:p-5 ring-1 ring-inset ring-border shadow-xs transition-all duration-300 hover:-translate-y-1 hover:ring-primary/30 hover:shadow-md hover:shadow-primary/5 cursor-pointer select-none"
    >
      <CardDecor />

      <div>
        {/* Author image & name */}
        <div className="flex items-center gap-2.5">
          <AuthorAvatar
            src={post.author?.profile_image}
            name={post.author?.name}
            sizes="32px"
            className="size-7 sm:size-8 shrink-0 ring-1 ring-border/50"
          />
          <span className="truncate text-xs font-semibold text-accent sm:text-[13px]">
            {post.author?.name || 'Ayadi Editorial'}
          </span>
        </div>

        {/* Head / Title */}
        <h3 className="mt-2.5 text-sm font-bold leading-snug tracking-[-0.015em] text-accent transition-colors duration-200 group-hover:text-primary sm:text-[15px] line-clamp-2">
          {post.title}
        </h3>

        {/* Content in 2 lines */}
        <p className="mt-1.5 text-xs leading-relaxed text-muted line-clamp-2 sm:text-[13px]">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
});

function BlogCardSkeleton() {
  return (
    <div className="w-[270px] sm:w-[310px] md:w-[330px] shrink-0 rounded-xl sm:rounded-2xl bg-surface p-4 sm:p-5 ring-1 ring-border shadow-xs animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="size-7 sm:size-8 rounded-full bg-primary/10" />
        <div className="h-3.5 w-24 rounded bg-primary/10" />
      </div>
      <div className="mt-2.5 space-y-1.5">
        <div className="h-4 w-4/5 rounded bg-primary/10" />
        <div className="h-4 w-3/5 rounded bg-primary/10" />
      </div>
      <div className="mt-2 space-y-1">
        <div className="h-3 w-full rounded bg-primary/10" />
        <div className="h-3 w-4/5 rounded bg-primary/10" />
      </div>
    </div>
  );
}
