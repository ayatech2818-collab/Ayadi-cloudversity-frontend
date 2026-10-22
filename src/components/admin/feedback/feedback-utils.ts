import type { Feedback } from "@/lib/api/feedback";

export const FEEDBACK_GRID =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4";

export type FeedbackStatusFilter = "All" | "approved" | "pending";

export interface FeedbackCounts {
  total: number;
  approved: number;
  pending: number;
  averageRating: number;
}

export const countFeedback = (
  feedback: Feedback[]
): FeedbackCounts => {
  let approved = 0;
  let ratingTotal = 0;

  for (const entry of feedback) {
    if (entry.is_approved) approved += 1;
    ratingTotal += entry.rating;
  }

  return {
    total: feedback.length,
    approved,
    pending: feedback.length - approved,
    averageRating:
      feedback.length === 0
        ? 0
        : Number((ratingTotal / feedback.length).toFixed(1)),
  };
};

export const formatFeedbackDate = (value: string): string =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
