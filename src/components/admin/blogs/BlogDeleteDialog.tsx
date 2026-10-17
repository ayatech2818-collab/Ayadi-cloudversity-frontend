"use client";

import { FileText } from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import DeleteDialog from "@/components/admin/ui/DeleteDialog";
import type { Blog } from "@/lib/api/blogs";

interface BlogDeleteDialogProps {
  blog: Blog | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function BlogDeleteDialog({
  blog,
  loading = false,
  onCancel,
  onConfirm,
}: BlogDeleteDialogProps) {
  return (
    <DeleteDialog
      open={blog !== null}
      id="blog-delete-title"
      title="Delete this blog?"
      description="This permanently deletes the post. This action cannot be undone."
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {blog && (
        <div className="flex items-center gap-2.5 rounded-xl bg-page/70 p-2.5 ring-1 ring-inset ring-border min-[360px]:gap-3 min-[360px]:rounded-2xl min-[360px]:p-3">
          <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg min-[360px]:h-12 min-[360px]:w-20">
            <CoverImage src={blog.cover_image} icon={FileText} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-accent min-[360px]:text-sm">
              {blog.title}
            </p>

            <p className="truncate text-[11px] text-muted min-[360px]:text-xs">
              {blog.status === "published" ? "Published" : "Draft"}
              {" · "}
              {blog.category || "General"}
            </p>
          </div>
        </div>
      )}
    </DeleteDialog>
  );
}
