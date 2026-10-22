"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, RotateCcw, Star } from "lucide-react";

import FeedbackStatusBadge from "@/components/admin/feedback/FeedbackStatusBadge";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Feedback } from "@/lib/api/feedback";

import DashboardCard from "./DashboardCard";
import { PULSE } from "./styles";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatFeedbackDate(value: string): string {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

interface RecentFeedbackProps {
  /** `null` while loading. */
  feedback: Feedback[] | null;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

/**
 * Dashboard overview card displaying recent student feedback submissions.
 * Placed beside the course statistics on the dashboard.
 */
export default function RecentFeedback({
  feedback,
  error = null,
  onRetry,
  className = "",
}: RecentFeedbackProps) {
  return (
    <DashboardCard
      title="Recent Feedback"
      description="Latest reviews submitted by learners"
      className={className}
      action={
        <Link
          href="/admin/feedback"
          className={`${buttonClass("secondary", "sm")} h-7.5 px-2.5 text-[11px] min-[360px]:h-8 min-[360px]:px-3 min-[360px]:text-xs sm:h-9 sm:px-3 sm:text-xs`}
        >
          View all
          <ArrowRight size={13} className="text-primary shrink-0" />
        </Link>
      }
    >
      {/* Error state */}
      {error && (
        <div className="p-4 sm:p-6 text-center">
          <p className="text-xs font-medium text-muted">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <RotateCcw size={12} />
              Try again
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {!error && feedback === null && (
        <div
          aria-busy="true"
          className="divide-y divide-border px-3.5 pb-3.5 pt-2 min-[360px]:px-4 min-[360px]:pb-4 sm:px-6 sm:pb-5"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="py-3 first:pt-1 last:pb-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`size-7 rounded-full min-[360px]:size-8 ${PULSE}`} />
                  <div className="space-y-1">
                    <span className={`block h-3.5 w-24 ${PULSE}`} />
                    <span className={`block h-2.5 w-16 ${PULSE}`} />
                  </div>
                </div>
                <span className={`block h-5 w-16 rounded-full ${PULSE}`} />
              </div>
              <div className="mt-2.5 space-y-1">
                <span className={`block h-3 w-full ${PULSE}`} />
                <span className={`block h-3 w-4/5 ${PULSE}`} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!error && feedback !== null && feedback.length === 0 && (
        <div className="p-6 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageSquare size={18} />
          </div>
          <p className="mt-2.5 text-xs font-semibold text-text">
            No feedback received yet
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            Learner reviews will appear here once submitted.
          </p>
        </div>
      )}

      {/* Feedback entries list */}
      {!error && feedback !== null && feedback.length > 0 && (
        <div className="divide-y divide-border px-3.5 pb-3.5 pt-2 min-[360px]:px-4 min-[360px]:pb-4 sm:px-6 sm:pb-5">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="group -mx-2 rounded-lg px-2 py-3 transition-colors hover:bg-page/50 first:pt-1 last:pb-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white shadow-xs min-[360px]:size-8 min-[360px]:text-[11px]"
                  >
                    {getInitials(item.name)}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-bold text-text">
                        {item.name}
                      </span>
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
                      {/* Star rating */}
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold tabular-nums">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        {item.rating.toFixed(1)}
                      </span>
                      <span className="text-muted/40">·</span>
                      <time dateTime={item.created_at} className="text-[10px] text-muted/80">
                        {formatFeedbackDate(item.created_at)}
                      </time>
                    </div>
                  </div>
                </div>

                <FeedbackStatusBadge approved={item.is_approved} />
              </div>

              {/* Message excerpt */}
              <p className="mt-2 text-xs leading-relaxed text-muted line-clamp-2">
                &ldquo;{item.message}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
