"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

import type { Gallery } from "@/lib/api/galleries";

import { countMedia, describeMedia } from "./gallery-utils";

interface GalleryDeleteDialogProps {
  gallery: Gallery | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function GalleryDeleteDialog({
  gallery,
  loading = false,
  onCancel,
  onConfirm,
}: GalleryDeleteDialogProps) {
  if (!gallery) return null;

  const counts = countMedia(gallery.items ?? []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle size={20} />
          </div>

          <div className="min-w-0">
            <h3
              id="gallery-delete-title"
              className="text-base font-semibold text-text"
            >
              Delete Gallery?
            </h3>

            <p className="mt-1.5 text-sm text-muted">
              This will permanently delete the gallery and
              all of its media.
            </p>

            <div className="mt-3 rounded-xl border border-border bg-page p-3">
              <p className="truncate text-xs font-semibold text-text">
                {gallery.title}
              </p>

              <p className="mt-0.5 text-[11px] text-muted">
                {describeMedia(counts)}
              </p>
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <Loader2 size={13} className="animate-spin" />
            )}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
