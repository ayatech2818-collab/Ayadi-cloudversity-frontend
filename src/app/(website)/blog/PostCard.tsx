'use client';

import { ArrowUpRight, CalendarDays, Clock3 } from 'lucide-react';
import Link from 'next/link';

import { CARD_CHROME, CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';

import BlogCover from './BlogCover';
import type { Post } from './posts';

/*
 * Shared by the index grid and the related-posts strip on a post page.
 *
 * The title's link carries `after:absolute after:inset-0`, which stretches an
 * invisible hit area over the whole card. That makes the entire card clickable
 * while leaving exactly one link in the accessibility tree — the old markup had
 * three links per card all pointing at the same URL.
 */
export default function PostCard({
  post,
  sizes,
  priority = false,
}: {
  post: Post;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <article onPointerMove={handleSpotlight} className={`${CARD_CHROME} flex flex-col`}>
      <CardDecor />

      <div className="relative aspect-[16/10] overflow-hidden bg-primary/5">
        <BlogCover
          src={post.image}
          /* Decorative: the title sits directly beneath it. */
          alt=""
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-[#04231c]/45 via-transparent to-transparent"
        />

        <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" size={14} className="text-primary" />
            <time dateTime={post.date}>{post.displayDate}</time>
          </span>

          <span className="flex items-center gap-1.5">
            <Clock3 aria-hidden="true" size={14} className="text-primary" />
            {post.readTime}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold leading-snug tracking-[-0.02em] text-text transition-colors duration-300 group-hover:text-primary">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-3 text-sm leading-7 text-muted">{post.excerpt}</p>

        {/* Not a link — the stretched hit area above already covers it. */}
        <span aria-hidden="true" className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-primary">
          Read article
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </article>
  );
}
