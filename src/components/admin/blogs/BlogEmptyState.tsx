"use client";

import {
  FilePlus2,
  Plus,
  RotateCcw,
  SearchX,
  ServerCrash,
} from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";

interface BlogEmptyStateProps {
  error: string | null;
  hasFilters: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
  onCreate: () => void;
}

/** Failed to load, nothing matches the filters, or no blogs yet. */
export default function BlogEmptyState({
  error,
  hasFilters,
  onRetry,
  onResetFilters,
  onCreate,
}: BlogEmptyStateProps) {
  if (error) {
    return (
      <EmptyState
        danger
        icon={ServerCrash}
        title="Unable to load blogs"
        text={error}
        action={{ label: "Retry", icon: RotateCcw, onClick: onRetry }}
      />
    );
  }

  if (hasFilters) {
    return (
      <EmptyState
        icon={SearchX}
        title="No blogs found"
        text="No articles match your search or filters."
        action={{
          label: "Clear filters",
          icon: RotateCcw,
          onClick: onResetFilters,
          tone: "secondary",
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={FilePlus2}
      title="No blogs yet"
      text="Start creating content for your website."
      action={{
        label: "Create your first blog",
        icon: Plus,
        onClick: onCreate,
      }}
    />
  );
}
