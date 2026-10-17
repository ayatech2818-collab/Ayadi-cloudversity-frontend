"use client";

import type { LucideIcon } from "lucide-react";

import { buttonClass } from "./styles";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  text: string;
  /** Rose icon tile for a failure, brand gradient otherwise. */
  danger?: boolean;
  /** Shorter panel, for inside a dialog. */
  compact?: boolean;
  action?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    tone?: "primary" | "secondary";
  };
}

/** The panel a grid shows instead of cards: nothing yet, no match, or failed. */
export default function EmptyState({
  icon: Icon,
  title,
  text,
  danger = false,
  compact = false,
  action,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-4 text-center min-[360px]:rounded-3xl min-[360px]:px-6 ${
        compact ? "py-6 sm:py-10" : "min-h-[240px] py-8 sm:min-h-[360px] sm:py-12"
      }`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl min-[360px]:h-12 min-[360px]:w-12 sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl ${
          danger
            ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
            : "bg-brand-gradient text-white shadow-lg shadow-brand-start/30"
        }`}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <h3 className="text-sm font-bold text-accent sm:text-base">{title}</h3>

      <p className="mt-1 max-w-sm text-xs text-muted sm:mt-1.5 sm:text-sm">{text}</p>

      {action && ActionIcon && (
        <button
          type="button"
          onClick={action.onClick}
          className={`mt-4 sm:mt-6 ${buttonClass(action.tone, "sm")} sm:h-10 sm:px-4 sm:text-sm`}
        >
          <ActionIcon size={15} />
          {action.label}
        </button>
      )}
    </div>
  );
}
