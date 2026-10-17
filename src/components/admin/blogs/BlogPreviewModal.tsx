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

            <span className="absolute left-2.5 top-2.5 min-[360px]:left-3.5 min-[360px]:top-3.5 sm:left-4 sm:top-4">
              <BlogBadges blog={blog} />
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="absolute right-2.5 top-2.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-accent-strong/60 text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-accent-strong/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-[360px]:right-3 min-[360px]:top-3 min-[360px]:h-8 min-[360px]:w-8 min-[360px]:rounded-xl sm:right-4 sm:top-4 sm:h-9 sm:w-9"
            >
              <X className="size-4 min-[360px]:size-4.5 sm:size-[18px]" />
            </button>
          </div>

          {/* Article */}
          <div className="flex-1 overflow-y-auto p-3.5 min-[360px]:p-4 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary min-[360px]:text-[11px] min-[360px]:tracking-[0.14em]">
              {blog.category || "General"}
            </p>

            <h2
              id="blog-preview-title"
              className="mb-2 mt-1 text-base font-bold tracking-[-0.02em] text-accent min-[360px]:mb-2.5 min-[360px]:mt-1.5 min-[360px]:text-lg sm:mb-3 sm:mt-2 sm:text-2xl"
            >
              {blog.title}
            </h2>

            <BlogMeta blog={blog} />

            <p className="mt-3 text-xs leading-relaxed text-muted min-[360px]:mt-3.5 min-[360px]:text-[13px] sm:mt-4 sm:text-sm">
              {blog.excerpt}
            </p>

            {blog.content && (
              <div className="mt-3.5 whitespace-pre-line rounded-xl bg-page/70 p-3 text-xs leading-relaxed text-text ring-1 ring-inset ring-border min-[360px]:mt-4 min-[360px]:rounded-2xl min-[360px]:p-3.5 sm:mt-5 sm:p-4 sm:text-[13px]">
                {blog.content}
              </div>
            )}

            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-1 min-[360px]:mt-4 min-[360px]:gap-1.5 sm:mt-5">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary-hover min-[360px]:rounded-lg min-[360px]:px-2.5 min-[360px]:py-1 min-[360px]:text-xs"
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
              className={`${buttonClass("secondary")} h-8.5 px-3 text-xs min-[360px]:h-9 min-[360px]:px-3.5 sm:h-10 sm:px-4 sm:text-sm`}
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(blog);
              }}
              className={`${buttonClass("primary")} h-8.5 px-3 text-xs min-[360px]:h-9 min-[360px]:px-3.5 sm:h-10 sm:px-4 sm:text-sm`}
            >
              <Pencil className="size-3.5 min-[360px]:size-4 sm:size-[15px]" />
              Open in Editor
            </button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
