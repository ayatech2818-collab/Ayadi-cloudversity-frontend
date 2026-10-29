"use client";

import {
  ArrowRight,
  Building2,
  FolderPlus,
  FolderTree,
  GitBranch,
  Plus,
  RotateCcw,
  SearchX,
  ServerCrash,
} from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";

interface MiniCategoriesEmptyStateProps {
  error: string | null;
  /** Name of the brand being viewed; undefined when there are no brands. */
  brandName?: string;
  /** Name of the main category being viewed; undefined when the brand has none. */
  categoryName?: string;
  /** Name of the sub category being viewed; undefined when the category has none. */
  subcategoryName?: string;
  hasSearch: boolean;
  onRetry: () => void;
  onClearSearch: () => void;
  onCreate: () => void;
  /** Takes the admin to the page where main categories are added. */
  onGoToCategories: () => void;
  /** Takes the admin to the page where sub categories are added. */
  onGoToSubcategories: () => void;
}

/**
 * Failed to load, no brands, a brand with no main categories, a category with
 * no sub categories, nothing matching the search, or no mini categories yet.
 */
export default function MiniCategoriesEmptyState({
  error,
  brandName,
  categoryName,
  subcategoryName,
  hasSearch,
  onRetry,
  onClearSearch,
  onCreate,
  onGoToCategories,
  onGoToSubcategories,
}: MiniCategoriesEmptyStateProps) {
  if (error) {
    return (
      <EmptyState
        danger
        icon={ServerCrash}
        title="Unable to load mini categories"
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
        text="Mini categories sit under a sub category, and no active course brand was found."
      />
    );
  }

  if (!categoryName) {
    return (
      <EmptyState
        icon={FolderTree}
        title="No main categories"
        text={`${brandName} has no main categories yet. Add one first, then add sub categories to it.`}
        action={{
          label: "Go to Category",
          icon: ArrowRight,
          onClick: onGoToCategories,
          tone: "secondary",
        }}
      />
    );
  }

  if (!subcategoryName) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No sub categories"
        text={`${categoryName} has no sub categories yet. Add one first, then come back to give it mini categories.`}
        action={{
          label: "Go to Sub-Category",
          icon: ArrowRight,
          onClick: onGoToSubcategories,
          tone: "secondary",
        }}
      />
    );
  }

  if (hasSearch) {
    return (
      <EmptyState
        icon={SearchX}
        title="No mini categories found"
        text={`Nothing in ${subcategoryName} matches your search.`}
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
      title="No mini categories yet"
      text={`${subcategoryName} does not have any mini categories yet.`}
      action={{
        label: "Add Mini Category",
        icon: Plus,
        onClick: onCreate,
      }}
    />
  );
}
