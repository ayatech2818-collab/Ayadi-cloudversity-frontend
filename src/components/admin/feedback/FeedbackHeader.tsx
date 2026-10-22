"use client";

import {
  BadgeCheck,
  Clock3,
  MessageSquareText,
  RefreshCw,
  Star,
} from "lucide-react";

import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/admin/ui/styles";

import type { FeedbackCounts } from "./feedback-utils";

interface FeedbackHeaderProps {
  counts: FeedbackCounts | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function FeedbackHeader({
  counts,
  refreshing,
  onRefresh,
}: FeedbackHeaderProps) {
  return (
    <PageHeader
      eyebrow="Community"
      title="Feedback"
      highlight="Management"
      description="Review ratings and feedback submitted through the Ayadi website."
      stats={[
        {
          label: "Total",
          icon: MessageSquareText,
          value: counts?.total ?? null,
        },
        {
          label: "Approved",
          icon: BadgeCheck,
          value: counts?.approved ?? null,
        },
        {
          label: "Pending",
          icon: Clock3,
          value: counts?.pending ?? null,
        },
        {
          label: "Avg. rating",
          icon: Star,
          value: counts?.averageRating ?? null,
        },
      ]}
    >
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className={buttonClass("glass")}
      >
        <RefreshCw
          size={16}
          className={refreshing ? "animate-spin" : ""}
        />
        Refresh
      </button>
    </PageHeader>
  );
}
