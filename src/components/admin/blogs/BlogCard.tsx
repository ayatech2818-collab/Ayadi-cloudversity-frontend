"use client";

import {
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Blog } from "@/lib/api/blogs";

interface BlogCardProps {
  blog: Blog;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function BlogCard({
  blog,
  isMenuOpen,
  onMenuToggle,
  onPreview,
  onEdit,
  onDelete,
}: BlogCardProps) {
  const isPublished = blog.status === "published";

  const formattedDate = new Date(blog.created_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }
  );

  return (
    <article
      className="
        group relative flex flex-col overflow-hidden
        rounded-2xl border border-border bg-surface
        shadow-[0_2px_8px_rgba(15,23,42,0.03)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-border/80
        hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]
      "
    >
      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-page">
        {blog.cover_image ? (
          <img
            src={blog.cover_image}
            alt={blog.cover_image_alt || blog.title}
            loading="lazy"
            className="
              h-full w-full object-cover
              transition-transform duration-500
              group-hover:scale-[1.03]
            "
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <FileText size={24} className="opacity-40" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15 opacity-60" />

        {/* Badges */}
        <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-1.5">
          <span
            className={`
              inline-flex items-center gap-1.5
              rounded-full border px-2.5 py-1
              text-[11px] font-semibold tracking-wide
              backdrop-blur-md shadow-sm
              ${
                isPublished
                  ? "border-emerald-300/30 bg-emerald-600/90 text-white"
                  : "border-white/20 bg-slate-900/65 text-slate-100"
              }
            `}
          >
            <span
              className={`
                h-1.5 w-1.5 rounded-full
                ${isPublished ? "bg-white" : "bg-amber-400"}
              `}
            />

            {isPublished ? "Published" : "Draft"}
          </span>

          {blog.is_featured && (
            <span className="rounded-full border border-amber-300/30 bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
              Featured
            </span>
          )}
        </div>

        {/* Menu */}
        <div className="absolute right-3.5 top-3.5 z-20">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMenuToggle();
            }}
            aria-label="Blog options"
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg border border-white/25
              bg-black/35 text-white shadow-sm
              backdrop-blur-md transition-all
              hover:bg-black/60 active:scale-95
            "
          >
            <MoreHorizontal size={16} strokeWidth={2.2} />
          </button>

          {isMenuOpen && (
            <div
              className="
                absolute right-0 top-10 z-30 w-36
                overflow-hidden rounded-xl
                border border-border bg-surface p-1
                shadow-[0_12px_30px_rgba(15,23,42,0.12)]
              "
            >
              <button
                type="button"
                onClick={onPreview}
                className="
                  flex w-full items-center gap-2.5
                  rounded-lg px-3 py-2
                  text-left text-xs font-medium text-text
                  hover:bg-page
                "
              >
                <Eye size={14} className="text-muted" />
                Preview
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="
                  flex w-full items-center gap-2.5
                  rounded-lg px-3 py-2
                  text-left text-xs font-medium text-text
                  hover:bg-page
                "
              >
                <Pencil size={14} className="text-muted" />
                Edit
              </button>

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onClick={onDelete}
                className="
                  flex w-full items-center gap-2.5
                  rounded-lg px-3 py-2
                  text-left text-xs font-medium text-rose-600
                  hover:bg-rose-50
                "
              >
                <Trash2 size={14} className="text-rose-500" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            {blog.category || "General"}
          </span>
        </div>

        <h2
          title={blog.title}
          className="
            line-clamp-2 min-h-[48px]
            text-[16px] font-semibold leading-snug
            tracking-[-0.01em] text-text
            transition-colors group-hover:text-primary
          "
        >
          {blog.title}
        </h2>

        <p
          title={blog.excerpt}
          className="
            mt-2 line-clamp-2 min-h-[40px]
            text-[13px] leading-relaxed text-muted
          "
        >
          {blog.excerpt}
        </p>

        {/* Metadata */}
        <div className="mt-auto border-t border-border/80 pt-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={13.5} />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock3 size={13.5} />
              <span>{blog.reading_time_minutes} min read</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}