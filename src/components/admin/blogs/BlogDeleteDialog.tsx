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
        <div className="flex items-center gap-3 rounded-2xl bg-page/70 p-3 ring-1 ring-inset ring-border">
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg">
            <CoverImage src={blog.cover_image} icon={FileText} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-accent">
              {blog.title}
            </p>

            <p className="truncate text-xs text-muted">
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
