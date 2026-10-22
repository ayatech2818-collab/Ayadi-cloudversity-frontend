"use client";

import SegmentedTabs from "@/components/admin/ui/SegmentedTabs";

import type {
  FeedbackCounts,
  FeedbackStatusFilter,
} from "./feedback-utils";

interface FeedbackFiltersProps {
  status: FeedbackStatusFilter;
  counts: FeedbackCounts | null;
  resultCount: number;
  loading: boolean;
  onStatusChange: (status: FeedbackStatusFilter) => void;
}

export default function FeedbackFilters({
  status,
  counts,
  resultCount,
  loading,
  onStatusChange,
}: FeedbackFiltersProps) {
  return (
    <section className="px-4 pt-5 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-inset ring-border">
        <SegmentedTabs
          label="Filter feedback by approval status"
          options={[
            { value: "All", label: "All", count: counts?.total },
            {
              value: "approved",
              label: "Approved",
              count: counts?.approved,
            },
            {
              value: "pending",
              label: "Pending",
              count: counts?.pending,
            },
          ]}
          value={status}
          onChange={onStatusChange}
        />
      </div>

      <p className="mt-3 px-1 text-xs text-muted" aria-live="polite">
        {loading ? (
          "Loading feedback..."
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-text">{resultCount}</span>{" "}
            {resultCount === 1 ? "submission" : "submissions"}
            {status !== "All" && " (filtered)"}
          </>
        )}
      </p>
    </section>
  );
}
