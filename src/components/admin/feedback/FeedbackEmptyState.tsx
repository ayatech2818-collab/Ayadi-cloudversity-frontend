"use client";

import {
  MessageSquareText,
  RotateCcw,
  SearchX,
  ServerCrash,
} from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";

interface FeedbackEmptyStateProps {
  error: string | null;
  filtered: boolean;
  onRetry: () => void;
  onResetFilter: () => void;
}

export default function FeedbackEmptyState({
  error,
  filtered,
  onRetry,
  onResetFilter,
}: FeedbackEmptyStateProps) {
  if (error) {
    return (
      <EmptyState
        danger
        icon={ServerCrash}
        title="Unable to load feedback"
        text={error}
        action={{ label: "Retry", icon: RotateCcw, onClick: onRetry }}
      />
    );
  }

  if (filtered) {
    return (
      <EmptyState
        icon={SearchX}
        title="No feedback found"
        text="There are no submissions with this approval status."
        action={{
          label: "Show all feedback",
          icon: RotateCcw,
          onClick: onResetFilter,
          tone: "secondary",
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={MessageSquareText}
      title="No feedback yet"
      text="Feedback submitted through the website will appear here."
    />
  );
}
