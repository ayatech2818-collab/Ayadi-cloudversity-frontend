"use client";

import {
  Building2,
  FolderPlus,
  Plus,
  RotateCcw,
  SearchX,
  ServerCrash,
} from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";

interface CategoriesEmptyStateProps {
  error: string | null;
  /** Name of the brand being viewed; undefined when there are no brands. */
  brandName?: string;
  hasSearch: boolean;
  onRetry: () => void;
  onClearSearch: () => void;
  onCreate: () => void;
}

/** Failed to load, no brands at all, nothing matches, or no categories yet. */
export default function CategoriesEmptyState({
  error,
  brandName,
  hasSearch,
  onRetry,
  onClearSearch,
  onCreate,
}: CategoriesEmptyStateProps) {
  if (error) {
    return (
      <EmptyState
        danger
        icon={ServerCrash}
        title="Unable to load categories"
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
        text="A category has to belong to a brand, and no active course brand was found."
      />
    );
  }

  if (hasSearch) {
    return (
      <EmptyState
        icon={SearchX}
        title="No categories found"
        text={`Nothing in ${brandName} matches your search.`}
        action={{
          label: "Clear search",
          icon: RotateCcw,
          onClick: onClearSearch,
          tone: "secondary",
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={FolderPlus}
      title="No categories yet"
      text={`${brandName} does not have any categories yet. Create the first one to get started.`}
      action={{ label: "Add Category", icon: Plus, onClick: onCreate }}
    />
  );
}
