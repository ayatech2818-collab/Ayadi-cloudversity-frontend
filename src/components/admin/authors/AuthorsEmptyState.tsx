"use client";

import {
  Plus,
  RotateCcw,
  SearchX,
  ServerCrash,
  UserRoundPlus,
} from "lucide-react";

import { buttonClass } from "@/components/admin/ui/styles";

interface AuthorsEmptyStateProps {
  error: string | null;
  hasSearch: boolean;
  onRetry: () => void;
  onClearSearch: () => void;
  onCreate: () => void;
}

export default function AuthorsEmptyState({
  error,
  hasSearch,
  onRetry,
  onClearSearch,
  onCreate,
}: AuthorsEmptyStateProps) {
  // One layout, three situations: failed to load, nothing matches, nothing yet.
  const state = error
    ? {
        icon: ServerCrash,
        title: "Unable to load authors",
        text: error,
        action: "Retry",
        actionIcon: RotateCcw,
        onAction: onRetry,
      }
    : hasSearch
      ? {
          icon: SearchX,
          title: "No authors found",
          text: "Try a different name, designation or keyword.",
          action: "Clear search",
          actionIcon: RotateCcw,
          onAction: onClearSearch,
        }
      : {
          icon: UserRoundPlus,
          title: "No authors yet",
          text: "Add your first author to start crediting your blog posts.",
          action: "Add Author",
          actionIcon: Plus,
          onAction: onCreate,
        };

  const Icon = state.icon;
  const ActionIcon = state.actionIcon;

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
          error
            ? "bg-rose-50 text-rose-600"
            : "bg-brand-gradient text-white shadow-lg shadow-brand-start/30"
        }`}
      >
        <Icon size={24} />
      </div>

      <h3 className="text-base font-bold text-accent">
        {state.title}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-muted">
        {state.text}
      </p>

      <button
        type="button"
        onClick={state.onAction}
        className={`mt-6 ${buttonClass(hasSearch && !error ? "secondary" : "primary")}`}
      >
        <ActionIcon size={15} />
        {state.action}
      </button>
    </div>
  );
}
