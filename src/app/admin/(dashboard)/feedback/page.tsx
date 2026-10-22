"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  FeedbackCard,
  FeedbackEmptyState,
  FeedbackFilters,
  FeedbackHeader,
  FeedbackSkeleton,
} from "@/components/admin/feedback";
import {
  FEEDBACK_GRID,
  countFeedback,
  type FeedbackStatusFilter,
} from "@/components/admin/feedback/feedback-utils";
import { Toaster, useToasts } from "@/components/admin/ui/Toast";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getAdminFeedback,
  updateFeedbackApproval,
  type Feedback,
} from "@/lib/api/feedback";

export default function FeedbackPage() {
  const { toasts, toastSuccess, toastError, dismissToast } =
    useToasts();

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [allFeedback, setAllFeedback] = useState<Feedback[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<FeedbackStatusFilter>("All");
  const [refreshToken, setRefreshToken] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminFeedback({
          is_approved:
            status === "All" ? undefined : status === "approved",
        });

        if (requestRef.current !== requestId) return;
        setFeedback(data);
      } catch (fetchError) {
        if (requestRef.current !== requestId) return;

        console.error("Failed to fetch feedback:", fetchError);
        setError(
          getApiErrorMessage(
            fetchError,
            "Something went wrong while fetching feedback."
          )
        );
      } finally {
        if (requestRef.current === requestId) setLoading(false);
      }
    };

    run();
  }, [status, refreshToken]);

  useEffect(() => {
    let cancelled = false;

    getAdminFeedback()
      .then((data) => {
        if (!cancelled) setAllFeedback(data);
      })
      .catch((statsError) =>
        console.error("Failed to fetch feedback counts:", statsError)
      );

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const refresh = useCallback(
    () => setRefreshToken((token) => token + 1),
    []
  );

  const counts = useMemo(
    () => allFeedback && countFeedback(allFeedback),
    [allFeedback]
  );

  const handleApprovalChange = async (
    entry: Feedback,
    isApproved: boolean
  ) => {
    if (updatingId !== null) return;

    try {
      setUpdatingId(entry.id);

      const updated = await updateFeedbackApproval(entry.id, isApproved);

      setAllFeedback((current) =>
        current?.map((item) =>
          item.id === updated.id ? updated : item
        ) ?? current
      );

      setFeedback((current) => {
        const belongsInFilter =
          status === "All" ||
          (status === "approved" && updated.is_approved) ||
          (status === "pending" && !updated.is_approved);

        if (!belongsInFilter) {
          return current.filter((item) => item.id !== updated.id);
        }

        return current.map((item) =>
          item.id === updated.id ? updated : item
        );
      });

      toastSuccess(
        updated.is_approved ? "Feedback approved" : "Feedback rejected",
        `${updated.name}'s feedback is now ${
          updated.is_approved ? "approved" : "pending"
        }.`
      );
    } catch (updateError) {
      console.error("Failed to update feedback approval:", updateError);
      toastError(
        "Could not update feedback",
        getApiErrorMessage(updateError)
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const showSkeleton = loading && feedback.length === 0;

  return (
    <div className="min-h-full pb-16">
      <FeedbackHeader
        counts={counts}
        refreshing={loading}
        onRefresh={refresh}
      />

      <FeedbackFilters
        status={status}
        counts={counts}
        resultCount={feedback.length}
        loading={loading}
        onStatusChange={setStatus}
      />

      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        {showSkeleton ? (
          <FeedbackSkeleton />
        ) : !error && feedback.length > 0 ? (
          <div
            aria-busy={loading}
            className={`${FEEDBACK_GRID} transition-opacity duration-200 ${
              loading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {feedback.map((entry) => (
              <FeedbackCard
                key={entry.id}
                feedback={entry}
                updating={updatingId === entry.id}
                disabled={updatingId !== null}
                onApprovalChange={(approved) =>
                  handleApprovalChange(entry, approved)
                }
              />
            ))}
          </div>
        ) : (
          <FeedbackEmptyState
            error={error}
            filtered={status !== "All"}
            onRetry={refresh}
            onResetFilter={() => setStatus("All")}
          />
        )}
      </section>

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
