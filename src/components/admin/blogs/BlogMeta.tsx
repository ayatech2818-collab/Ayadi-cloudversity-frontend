"use client";

import { CalendarDays, Clock3, UserRound } from "lucide-react";

import type { Blog } from "@/lib/api/blogs";

import { formatBlogDate } from "./blog-utils";

/** Date, reading time and author on one wrapping line. */
export default function BlogMeta({ blog }: { blog: Blog }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1">
        <CalendarDays size={12} />
        {formatBlogDate(blog.created_at)}
      </span>

      {blog.reading_time_minutes ? (
        <span className="inline-flex items-center gap-1">
          <Clock3 size={12} />
          {blog.reading_time_minutes} min read
        </span>
      ) : null}

      {blog.author && (
        <span className="inline-flex min-w-0 items-center gap-1">
          <UserRound size={12} className="shrink-0" />
          <span className="truncate">{blog.author}</span>
        </span>
      )}
    </div>
  );
}
