"use client";

import {
  Images,
  Plus,
  RotateCcw,
  ServerCrash,
  SearchX,
} from "lucide-react";

interface GalleryEmptyStateProps {
  error: string | null;
  hasFilters: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
  onCreate: () => void;
}

export default function GalleryEmptyState({
  error,
  hasFilters,
  onRetry,
  onResetFilters,
  onCreate,
}: GalleryEmptyStateProps) {
  if (error) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ServerCrash size={24} />
        </div>

        <h3 className="text-base font-semibold text-text">
          Unable to load galleries.
        </h3>

        <p className="mt-1.5 max-w-sm text-sm text-muted">
          {error}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover"
        >
          <RotateCcw size={14} />
          Retry
        </button>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SearchX size={24} />
        </div>

        <h3 className="text-base font-semibold text-text">
          No galleries found
        </h3>

        <p className="mt-1.5 max-w-sm text-sm text-muted">
          Try adjusting your search or filters.
        </p>

        <button
          type="button"
          onClick={onResetFilters}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text hover:bg-page"
        >
          <RotateCcw size={14} />
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Images size={24} />
      </div>

      <h3 className="text-base font-semibold text-text">
        No galleries yet
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-muted">
        Create your first gallery to start managing event
        photos and videos.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover"
      >
        <Plus size={15} />
        Add Gallery
      </button>
    </div>
  );
}
