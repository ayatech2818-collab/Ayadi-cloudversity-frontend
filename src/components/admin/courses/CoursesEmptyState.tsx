"use client";

import {
  BookPlus,
  Building2,
  Plus,
  RotateCcw,
  SearchX,
  ServerCrash,
} from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";

interface CoursesEmptyStateProps {
  error: string | null;
  /** Name of the brand being viewed; undefined when there are no brands. */
  brandName?: string;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
  onCreate: () => void;
}

/** Failed to load, no brands, nothing matching the filters, or no courses yet. */
export default function CoursesEmptyState({
  error,
  brandName,
  hasActiveFilters,
  onRetry,
  onResetFilters,
  onCreate,
}: CoursesEmptyStateProps) {
  if (error) {
    return (
      <EmptyState
        danger
        icon={ServerCrash}
        title="Unable to load courses"
        text={error}
        action={{ label: "Retry", icon: RotateCcw, onClick: onRetry }}
      />
    );
  }

  if (!brandName) {
    return (
      <EmptyState
        icon={Building2}
        title="No active brands"
        text="Every course belongs to a brand, and no active course brand was found."
      />
    );
  }

  if (hasActiveFilters) {
    return (
      <EmptyState
        icon={SearchX}
        title="No courses found"
        text={`Nothing in ${brandName} matches the current filters.`}
        action={{
          label: "Reset filters",
          icon: RotateCcw,
          onClick: onResetFilters,
          tone: "secondary",
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={BookPlus}
      title="No courses yet"
      text={`${brandName} does not have any courses yet.`}
      action={{ label: "Add Course", icon: Plus, onClick: onCreate }}
    />
  );
}
