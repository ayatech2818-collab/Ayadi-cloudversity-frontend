"use client";

import { CalendarDays, Clock3, UserRound } from "lucide-react";

import type { Blog } from "@/lib/api/blogs";

import { formatBlogDate } from "./blog-utils";

/** Date, reading time and author on one wrapping line. */
export default function BlogMeta({ blog }: { blog: Blog }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] text-muted min-[360px]:gap-x-2 min-[360px]:text-[10px] sm:gap-x-3 sm:gap-y-1 sm:text-[11px]">
      <span className="inline-flex items-center gap-0.5 min-[360px]:gap-1">
        <CalendarDays className="size-2.5 min-[360px]:size-3 sm:size-3" />
        {formatBlogDate(blog.created_at)}
      </span>

      {blog.reading_time_minutes ? (
        <span className="inline-flex items-center gap-0.5 min-[360px]:gap-1">
          <Clock3 className="size-2.5 min-[360px]:size-3 sm:size-3" />
          {blog.reading_time_minutes} min
          <span className="hidden min-[360px]:inline"> read</span>
        </span>
      ) : null}

      {blog.author && (
        <span className="inline-flex min-w-0 max-w-full items-center gap-0.5 min-[360px]:gap-1">
          <UserRound className="size-2.5 shrink-0 min-[360px]:size-3 sm:size-3" />
          <span className="truncate">{blog.author}</span>
        </span>
      )}
    </div>
  );
}
