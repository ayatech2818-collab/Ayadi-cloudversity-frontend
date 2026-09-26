"use client";

import { FileText, Plus, RotateCcw } from "lucide-react";

interface BlogEmptyStateProps {
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
  onCreate: () => void;
}

export default function BlogEmptyState({
  loading,
  error,
  hasFilters,
  onRetry,
  onResetFilters,
  onCreate,
}: BlogEmptyStateProps) {
  if (loading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-2xl border border-border bg-surface">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="mt-4 text-sm text-muted">
            Loading blogs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <FileText size={24} />
        </div>

        <h3 className="text-base font-semibold text-text">
          Unable to load blogs
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
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileText size={24} />
      </div>

      <h3 className="text-base font-semibold text-text">
        No blogs found
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-muted">
        {hasFilters
          ? "No articles match your active filters or search terms."
          : "Start creating content for your website."}
      </p>

      <div className="mt-6">
        {hasFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text hover:bg-page"
          >
            <RotateCcw size={14} />
            Clear filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={15} />
            Create your first blog
          </button>
        )}
      </div>
    </div>
  );
}