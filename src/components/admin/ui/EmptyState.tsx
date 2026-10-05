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
      className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center ${
        compact ? "py-10" : "min-h-[360px] py-12"
      }`}
    >
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
          danger
            ? "bg-rose-50 text-rose-600"
            : "bg-brand-gradient text-white shadow-lg shadow-brand-start/30"
        }`}
      >
        <Icon size={24} />
      </div>

      <h3 className="text-base font-bold text-accent">{title}</h3>

      <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>

      {action && ActionIcon && (
        <button
          type="button"
          onClick={action.onClick}
          className={`mt-6 ${buttonClass(action.tone)}`}
        >
          <ActionIcon size={15} />
          {action.label}
        </button>
      )}
    </div>
  );
}
