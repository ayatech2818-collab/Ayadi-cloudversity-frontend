import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  UserRound,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import GetStartedCta from '@/components/website/sections/GetStartedCta';
import { getPublicBlog, getPublicBlogs, type Blog } from '@/lib/api/blogs';

import BlogCover from '../BlogCover';
import PostCard, { type PublicBlogPost } from '../PostCard';

import ShareButton from './ShareButton';

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function toId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatDate(date?: string | null) {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatReadTime(minutes?: number | null) {
  if (!minutes) return '5 min read';

  return `${minutes} min read`;
}

/* ---------------------------------------------------------
   Article content
--------------------------------------------------------- */

type ArticleSection = {
  heading: string;
  paragraphs: string[];
};

/**
 * Converts the backend content string into the section structure
 * expected by the existing article UI.
 *
 * Supports:
 * - Markdown headings: # Heading / ## Heading
 * - Plain text separated by blank lines
 * - A single plain-text article
 */
function parseArticleContent(content?: string | null): ArticleSection[] {
  if (!content?.trim()) {
    return [];
  }

  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n');

  const sections: ArticleSection[] = [];

  let currentHeading = 'Article';
  let currentParagraphs: string[] = [];
  let currentParagraphLines: string[] = [];

  const pushParagraph = () => {
    const paragraph = currentParagraphLines
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (paragraph) {
      currentParagraphs.push(paragraph);
    }

    currentParagraphLines = [];
  };

  const pushSection = () => {
    pushParagraph();

    if (currentParagraphs.length > 0) {
      sections.push({
        heading: currentHeading,
        paragraphs: currentParagraphs,
      });
    }

    currentParagraphs = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      pushParagraph();
      continue;
    }

    const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);

    if (headingMatch) {
      pushSection();

      currentHeading = headingMatch[1].trim();
      continue;
    }

    currentParagraphLines.push(trimmed);
  }

  pushSection();

  return sections;
}

/* ---------------------------------------------------------
   Backend → public UI mapping
--------------------------------------------------------- */

function mapBlogToPost(blog: Blog): PublicBlogPost {
  const date = blog.published_at ?? blog.created_at ?? '';

  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt ?? '',
    category: blog.category?.trim() || 'General',
    date,
    displayDate: formatDate(date),
    readTime: formatReadTime(blog.reading_time_minutes),
    author: blog.author?.trim() || 'Ayadi Cloudversity',
    image: blog.cover_image || '/images/blog/placeholder.svg',
  };
}

/* ---------------------------------------------------------
   Fetch published blog by slug
--------------------------------------------------------- */

/*
 * The public endpoint looks the article up by slug and only returns it when
 * it is published; an unknown or unpublished slug is a 404, which rejects here
 * and is handled by each caller.
 */
async function getPublishedBlogBySlug(slug: string): Promise<Blog | null> {
  return getPublicBlog(slug);
}

/* ---------------------------------------------------------
   Related posts
--------------------------------------------------------- */

async function getRelatedBlogPosts(
  currentBlog: Blog,
): Promise<PublicBlogPost[]> {
  const blogs = await getPublicBlogs({
    sort_by: 'newest',
    ...(currentBlog.category
      ? { category: currentBlog.category }
      : {}),
  });

  return blogs
    .filter((blog) => blog.slug !== currentBlog.slug)
    .slice(0, 3)
    .map(mapBlogToPost);
}

/* ---------------------------------------------------------
   Metadata
--------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPublishedBlogBySlug(slug);

    if (!post) {
      return {};
    }

    return {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,

      openGraph: {
        type: 'article',
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        publishedTime: post.published_at ?? post.created_at ?? undefined,
        images: post.cover_image
          ? [
              {
                url: post.cover_image,
                alt: post.cover_image_alt || post.title,
              },
            ]
          : undefined,
      },
    };
  } catch {
    return {};
  }
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: Blog | null = null;

  try {
    post = await getPublishedBlogBySlug(slug);
  } catch {
    post = null;
  }

  if (!post) {
    notFound();
  }

  const sections = parseArticleContent(post.content);

  const related = await getRelatedBlogPosts(post);

  const publicPost = mapBlogToPost(post);

  return (
    <main>
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative isolate overflow-hidden px-5 pb-12 pt-32 sm:px-8 sm:pt-36 lg:px-16 lg:pb-16 lg:pt-44">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -right-32 -top-40 size-[560px] rounded-full bg-primary/[0.07] blur-[130px]" />

          <div className="absolute -left-40 top-1/3 size-[420px] rounded-full bg-accent/[0.07] blur-[130px]" />
        </div>

        <div className="mx-auto max-w-[1180px]">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-bold text-muted transition-colors duration-300 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <ArrowLeft
              aria-hidden="true"
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            Back to blog
          </Link>

          <div className="mt-9 max-w-4xl">
            <span className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              <span
                aria-hidden="true"
                className="h-px w-6 bg-primary/50"
              />

              {publicPost.category}
            </span>

            <h1 className="mt-5 text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.04em] text-accent sm:text-5xl lg:text-6xl">
              {publicPost.title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              {publicPost.excerpt}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2">
                <CalendarDays
                  aria-hidden="true"
                  size={16}
                  className="text-primary"
                />

                <time dateTime={publicPost.date}>
                  {publicPost.displayDate}
                </time>
              </span>

              <span className="flex items-center gap-2">
                <Clock3
                  aria-hidden="true"
                  size={16}
                  className="text-primary"
                />

                {publicPost.readTime}
              </span>

              <span className="flex items-center gap-2">
                <UserRound
                  aria-hidden="true"
                  size={16}
                  className="text-primary"
                />

                <span className="font-semibold text-accent">
                  {publicPost.author}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          COVER
      ========================================================= */}

      <section className="px-5 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-primary/5 ring-1 ring-inset ring-border sm:rounded-3xl">
            <BlogCover
              src={publicPost.image}
              alt={post.cover_image_alt || post.title}
              sizes="(min-width: 1180px) 1180px, 100vw"
              priority
              className="object-cover"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-accent-strong/35 via-transparent to-transparent"
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          ARTICLE
      ========================================================= */}

      <section className="px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[1fr_280px] lg:gap-20">
          <article className="max-w-[68ch]">
            {sections.length > 0 ? (
              sections.map((section, index) => (
                <section
                  key={`${section.heading}-${index}`}
                  id={toId(section.heading)}
                  className={
                    index === 0
                      ? 'scroll-mt-28'
                      : 'mt-14 scroll-mt-28'
                  }
                >
                  <h2 className="flex items-baseline gap-3 text-2xl font-semibold tracking-[-0.03em] text-accent sm:text-3xl">
                    <span
                      aria-hidden="true"
                      className="font-mono text-xs font-bold tracking-[0.18em] text-primary"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {section.heading}
                  </h2>

                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p
                      key={`${section.heading}-${paragraphIndex}`}
                      className={
                        index === 0 && paragraphIndex === 0
                          ? 'mt-6 text-lg leading-9 text-text sm:text-xl sm:leading-10'
                          : 'mt-5 text-base leading-8 text-muted'
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))
            ) : (
              <p className="text-base leading-8 text-muted">
                No article content is available.
              </p>
            )}

            <div
              aria-hidden="true"
              className="mt-16 h-px bg-border"
            />

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <ArrowLeft
                  aria-hidden="true"
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />

                Explore more articles
              </Link>

              <ShareButton title={post.title} />
            </div>
          </article>

          {/* ---------- SIDEBAR ---------- */}

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-labelledby="contents-heading">
              <h2
                id="contents-heading"
                className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary"
              >
                In this article
              </h2>

              {sections.length > 0 ? (
                <ol className="mt-5">
                  {sections.map((section, index) => (
                    <li key={`${section.heading}-${index}`}>
                      {index > 0 ? (
                        <div
                          aria-hidden="true"
                          className="h-px bg-border"
                        />
                      ) : null}

                      <a
                        href={`#${toId(section.heading)}`}
                        className="group flex items-start gap-3 py-3 text-sm text-muted transition-colors duration-300 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 font-mono text-[11px] font-bold tracking-[0.18em] text-primary"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="font-semibold">
                          {section.heading}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              ) : null}
            </nav>

            <div className="mt-10 rounded-2xl bg-surface p-6 ring-1 ring-inset ring-border pb-60">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                About Ayadi
              </p>

              <h2 className="mt-4 text-lg font-bold leading-snug tracking-[-0.02em] text-accent">
                Learning that goes beyond the classroom.
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted">
                We build pathways from preschool through higher education,
                workplace readiness, and lifelong learning.
              </p>

              <Link
                href="/about"
                className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Our story

                <ArrowUpRight
                  aria-hidden="true"
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* =========================================================
          RELATED
      ========================================================= */}

      {related.length > 0 ? (
        <section
          aria-labelledby="related-heading"
          className="bg-surface px-5 py-20 sm:px-8 lg:px-16 lg:py-28"
        >
          <div className="mx-auto max-w-[1180px]">
            <span className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              <span
                aria-hidden="true"
                className="h-px w-6 bg-primary/50"
              />

              Keep reading
            </span>

            <h2
              id="related-heading"
              className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-accent sm:text-3xl"
            >
              Related articles
            </h2>

            <ul className="mt-10 grid gap-5 pb-50 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <PostCard
                    post={item}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <GetStartedCta />
    </main>
  );
}