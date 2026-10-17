"use client";

import { Eye, FileText, Pencil, Trash2 } from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import {
  buttonClass,
  iconButtonClass,
} from "@/components/admin/ui/styles";
import type { Blog } from "@/lib/api/blogs";

import BlogBadges from "./BlogBadges";
import BlogMeta from "./BlogMeta";

interface BlogCardProps {
  blog: Blog;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Built to work two-across on a phone: the padding, type and action labels
 * step up from `sm`.
 */
export default function BlogCard({
  blog,
  onPreview,
  onEdit,
  onDelete,
}: BlogCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)] min-[360px]:rounded-2xl">
      {/* Cover — opens the preview */}
      <button
        type="button"
        onClick={onPreview}
        aria-label={`Preview ${blog.title}`}
        className="relative block aspect-video w-full cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
      >
        <CoverImage
          src={blog.cover_image}
          icon={FileText}
          imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-accent-strong/45 via-transparent to-accent-strong/20"
        />

        <span className="absolute left-1.5 top-1.5 min-[360px]:left-2 min-[360px]:top-2 sm:left-3.5 sm:top-3.5">
          <BlogBadges blog={blog} compact />
        </span>
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2 min-[360px]:p-2.5 sm:p-5">
        <p className="truncate text-[9px] font-bold uppercase tracking-[0.1em] text-primary min-[360px]:text-[10px] min-[360px]:tracking-[0.14em] sm:text-[11px]">
          {blog.category || "General"}
        </p>

        <h2
          title={blog.title}
          className="mt-1 line-clamp-2 text-[11px] font-bold leading-snug tracking-[-0.01em] text-accent min-[360px]:mt-1.5 min-[360px]:text-xs sm:text-base"
        >
          {blog.title}
        </h2>

        <p className="mb-2 mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted min-[360px]:mb-2.5 min-[360px]:mt-1.5 min-[360px]:text-[11px] sm:mb-3 sm:text-[13px]">
          {blog.excerpt}
        </p>

        <BlogMeta blog={blog} />

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between gap-1 pt-2.5 min-[360px]:gap-1.5 min-[360px]:pt-3 sm:gap-2 sm:pt-4">
          <div className="flex items-center gap-1 min-[360px]:gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${blog.title}`}
              title="Edit"
              className={`${buttonClass("secondary", "sm")} h-7 w-7 gap-0 rounded-lg px-0 min-[360px]:h-7.5 min-[360px]:w-7.5 min-[360px]:rounded-xl sm:h-9 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-3`}
            >
              <Pencil
                className="h-3.5 w-3.5 shrink-0 text-primary min-[360px]:h-4 min-[360px]:w-4 sm:h-[15px] sm:w-[15px]"
                strokeWidth={2.2}
              />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              type="button"
              onClick={onPreview}
              aria-label={`Preview ${blog.title}`}
              title="Preview"
              className={`${iconButtonClass()} h-7 w-7 rounded-lg min-[360px]:h-7.5 min-[360px]:w-7.5 min-[360px]:rounded-xl sm:h-9 sm:w-9`}
            >
              <Eye className="h-3.5 w-3.5 shrink-0 min-[360px]:h-4 min-[360px]:w-4 sm:h-[15px] sm:w-[15px]" />
            </button>
          </div>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${blog.title}`}
            title="Delete"
            className={`${iconButtonClass(true)} h-7 w-7 rounded-lg min-[360px]:h-7.5 min-[360px]:w-7.5 min-[360px]:rounded-xl sm:h-9 sm:w-9`}
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0 min-[360px]:h-4 min-[360px]:w-4 sm:h-[15px] sm:w-[15px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
