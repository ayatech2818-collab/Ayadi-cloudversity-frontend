"use client";

import { Inbox, RotateCcw, SearchX, ServerCrash } from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";

interface EnquiryEmptyStateProps {
  error: string | null;
  hasFilters: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
}

/** Failed to load, nothing matching the filters, or no enquiries yet. */
export default function EnquiryEmptyState({
  error,
  hasFilters,
  onRetry,
  onResetFilters,
}: EnquiryEmptyStateProps) {
  if (error) {
    return (
      <EmptyState
        danger
        icon={ServerCrash}
        title="Unable to load enquiries"
        text={error}
        action={{ label: "Retry", icon: RotateCcw, onClick: onRetry }}
      />
    );
  }

  if (hasFilters) {
    return (
      <EmptyState
        icon={SearchX}
        title="No enquiries found"
        text="Try adjusting your search or filters to find what you are looking for."
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
      icon={Inbox}
      title="No enquiries yet"
      text="Contact and enrollment enquiries submitted through the website will appear here."
    />
  );
}
