"use client";

import {
  CalendarDays,
  Clock3,
  FileText,
  Pencil,
  X,
} from "lucide-react";

import type { Blog } from "@/lib/api/blogs";

interface BlogPreviewModalProps {
  blog: Blog | null;
  onClose: () => void;
  onEdit: (blog: Blog) => void;
}

export default function BlogPreviewModal({
  blog,
  onClose,
  onEdit,
}: BlogPreviewModalProps) {
  if (!blog) return null;

  const formattedDate = new Date(
    blog.created_at
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Image */}
        <div className="relative aspect-[21/9] w-full bg-page">
          {blog.cover_image ? (
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              <FileText size={32} className="opacity-30" />
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/75"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              {blog.category || "General"}
            </span>

            <span className="text-muted">•</span>

            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {blog.status}
            </span>
          </div>

          <h2 className="mt-2 text-xl font-bold tracking-tight text-text">
            {blog.title}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted">
            {blog.excerpt}
          </p>

          {blog.content && (
            <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-border bg-page p-3 text-xs leading-relaxed text-text">
              {blog.content}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock3 size={14} />
              <span>
                {blog.reading_time_minutes} min read
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between border-t border-border bg-page/50 px-6 py-3.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(blog);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <Pencil size={13} />
            Open in Editor
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-page"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}