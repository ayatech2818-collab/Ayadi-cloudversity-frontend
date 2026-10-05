"use client";

import {
  ArrowRight,
  Building2,
  FolderPlus,
  FolderTree,
  Plus,
  RotateCcw,
  SearchX,
  ServerCrash,
} from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";

interface SubcategoriesEmptyStateProps {
  error: string | null;
  /** Name of the brand being viewed; undefined when there are no brands. */
  brandName?: string;
  /** Name of the main category being viewed; undefined when the brand has none. */
  categoryName?: string;
  hasSearch: boolean;
  onRetry: () => void;
  onClearSearch: () => void;
  onCreate: () => void;
  /** Takes the admin to the page where main categories are added. */
  onGoToCategories: () => void;
}

/**
 * Failed to load, no brands, a brand with no main categories, nothing
 * matching the search, or no sub categories yet.
 */
export default function SubcategoriesEmptyState({
  error,
  brandName,
  categoryName,
  hasSearch,
  onRetry,
  onClearSearch,
  onCreate,
  onGoToCategories,
}: SubcategoriesEmptyStateProps) {
  if (error) {
    return (
      <EmptyState
        danger
        icon={ServerCrash}
        title="Unable to load sub categories"
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
        text="Sub categories sit under a brand's main categories, and no active course brand was found."
      />
    );
  }

  if (!categoryName) {
    return (
      <EmptyState
        icon={FolderTree}
        title="No main categories"
        text={`${brandName} has no main categories yet. Add one first, then come back to give it sub categories.`}
        action={{
          label: "Go to Category",
          icon: ArrowRight,
          onClick: onGoToCategories,
          tone: "secondary",
        }}
      />
    );
  }

  if (hasSearch) {
    return (
      <EmptyState
        icon={SearchX}
        title="No sub categories found"
        text={`Nothing in ${categoryName} matches your search.`}
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
      title="No sub categories yet"
      text={`${categoryName} does not have any sub categories yet.`}
      action={{
        label: "Add Sub Category",
        icon: Plus,
        onClick: onCreate,
      }}
    />
  );
}
