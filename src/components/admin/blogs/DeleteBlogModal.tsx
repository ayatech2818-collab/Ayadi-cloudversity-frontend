"use client";

import { AlertTriangle } from "lucide-react";

import type { Blog } from "@/lib/api/blogs";

interface DeleteBlogModalProps {
  blog: Blog | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteBlogModal({
  blog,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteBlogModalProps) {
  if (!blog) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-text">
              Delete blog?
            </h3>

            <p className="mt-1.5 text-sm text-muted">
              Are you sure you want to delete this blog?
              This action cannot be undone.
            </p>

            <div className="mt-3 rounded-xl border border-border bg-page p-2.5 text-xs font-medium text-text">
              "{blog.title}"
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-page disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}