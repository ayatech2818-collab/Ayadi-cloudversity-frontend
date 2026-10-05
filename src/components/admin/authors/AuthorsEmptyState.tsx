"use client";

import {
  Plus,
  RotateCcw,
  SearchX,
  ServerCrash,
  UserRoundPlus,
} from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";

interface AuthorsEmptyStateProps {
  error: string | null;
  hasSearch: boolean;
  onRetry: () => void;
  onClearSearch: () => void;
  onCreate: () => void;
}

/** Failed to load, nothing matches the search, or no authors yet. */
export default function AuthorsEmptyState({
  error,
  hasSearch,
  onRetry,
  onClearSearch,
  onCreate,
}: AuthorsEmptyStateProps) {
  if (error) {
    return (
      <EmptyState
        danger
        icon={ServerCrash}
        title="Unable to load authors"
        text={error}
        action={{ label: "Retry", icon: RotateCcw, onClick: onRetry }}
      />
    );
  }

  if (hasSearch) {
    return (
      <EmptyState
        icon={SearchX}
        title="No authors found"
        text="Try a different name, designation or keyword."
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
      icon={UserRoundPlus}
      title="No authors yet"
      text="Add your first author to start crediting your blog posts."
      action={{ label: "Add Author", icon: Plus, onClick: onCreate }}
    />
  );
}
