"use client";

import { FileText, Pencil, X } from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import Modal, { ModalFooter } from "@/components/admin/ui/Modal";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Blog } from "@/lib/api/blogs";

import BlogBadges from "./BlogBadges";
import BlogMeta from "./BlogMeta";

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
  return (
    <Modal
      open={blog !== null}
      onClose={onClose}
      labelledBy="blog-preview-title"
      size="lg"
    >
      {blog && (
        <>
          {/* Cover */}
          <div className="relative aspect-[21/9] w-full shrink-0">
            <CoverImage
              src={blog.cover_image}
              alt={blog.cover_image_alt || ""}
              icon={FileText}
            />

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-accent-strong/50 via-transparent to-accent-strong/25"
            />

            <span className="absolute left-4 top-4">
              <BlogBadges blog={blog} />
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-accent-strong/60 text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-accent-strong/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Article */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              {blog.category || "General"}
            </p>

            <h2
              id="blog-preview-title"
              className="mb-3 mt-2 text-xl font-bold tracking-[-0.02em] text-accent sm:text-2xl"
            >
              {blog.title}
            </h2>

            <BlogMeta blog={blog} />

            <p className="mt-4 text-sm leading-relaxed text-muted">
              {blog.excerpt}
            </p>

            {blog.content && (
              <div className="mt-5 whitespace-pre-line rounded-2xl bg-page/70 p-4 text-[13px] leading-relaxed text-text ring-1 ring-inset ring-border">
                {blog.content}
              </div>
            )}

            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-hover"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <ModalFooter>
            <button
              type="button"
              onClick={onClose}
              className={buttonClass("secondary")}
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(blog);
              }}
              className={buttonClass("primary")}
            >
              <Pencil size={15} />
              Open in Editor
            </button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
