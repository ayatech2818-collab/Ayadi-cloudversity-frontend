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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)]">
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

        <span className="absolute left-2.5 top-2.5 sm:left-3.5 sm:top-3.5">
          <BlogBadges blog={blog} compact />
        </span>
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-primary sm:text-[11px]">
          {blog.category || "General"}
        </p>

        <h2
          title={blog.title}
          className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug tracking-[-0.01em] text-accent sm:text-base"
        >
          {blog.title}
        </h2>

        <p className="mb-3 mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted sm:text-[13px]">
          {blog.excerpt}
        </p>

        <BlogMeta blog={blog} />

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${blog.title}`}
              className={buttonClass("secondary", "sm")}
            >
              <Pencil size={13} className="text-primary" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              type="button"
              onClick={onPreview}
              aria-label={`Preview ${blog.title}`}
              title="Preview"
              className={iconButtonClass()}
            >
              <Eye size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${blog.title}`}
            title="Delete"
            className={iconButtonClass(true)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
