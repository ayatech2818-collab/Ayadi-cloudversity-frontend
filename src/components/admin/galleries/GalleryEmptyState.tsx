"use client";

import {
  Images,
  Plus,
  RotateCcw,
  SearchX,
  ServerCrash,
} from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";

interface GalleryEmptyStateProps {
  error: string | null;
  hasFilters: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
  onCreate: () => void;
}

/** Failed to load, nothing matches the filters, or no galleries yet. */
export default function GalleryEmptyState({
  error,
  hasFilters,
  onRetry,
  onResetFilters,
  onCreate,
}: GalleryEmptyStateProps) {
  if (error) {
    return (
      <EmptyState
        danger
        icon={ServerCrash}
        title="Unable to load galleries"
        text={error}
        action={{ label: "Retry", icon: RotateCcw, onClick: onRetry }}
      />
    );
  }

  if (hasFilters) {
    return (
      <EmptyState
        icon={SearchX}
        title="No galleries found"
        text="Try adjusting your search or filters."
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
      icon={Images}
      title="No galleries yet"
      text="Create your first gallery to start managing event photos and videos."
      action={{ label: "Add Gallery", icon: Plus, onClick: onCreate }}
    />
  );
}
