"use client";

import {
  BadgeCheck,
  LoaderCircle,
  Star,
  XCircle,
} from "lucide-react";

import AuthorAvatar from "@/components/admin/authors/AuthorAvatar";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Feedback } from "@/lib/api/feedback";

import FeedbackStatusBadge from "./FeedbackStatusBadge";
import { formatFeedbackDate } from "./feedback-utils";

interface FeedbackCardProps {
  feedback: Feedback;
  updating: boolean;
  disabled: boolean;
  onApprovalChange: (approved: boolean) => void;
}

export default function FeedbackCard({
  feedback,
  updating,
  disabled,
  onApprovalChange,
}: FeedbackCardProps) {
  const nextApproval = !feedback.is_approved;
  const actionLabel = feedback.is_approved ? "Reject" : "Approve";
  const ActionIcon = feedback.is_approved ? XCircle : BadgeCheck;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-inset ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)] sm:p-5">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-brand-gradient transition-transform duration-500 ${
          feedback.is_approved
            ? ""
            : "origin-left scale-x-0 group-hover:scale-x-100"
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <AuthorAvatar
          name={feedback.name}
          className="h-11 w-11 text-sm"
        />

        <FeedbackStatusBadge approved={feedback.is_approved} />
      </div>

      <h2
        title={feedback.name}
        className="mt-3 truncate text-base font-bold tracking-[-0.01em] text-accent"
      >
        {feedback.name}
      </h2>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
        <span
          role="img"
          aria-label={`${feedback.rating} out of 5 stars`}
          className="flex items-center gap-0.5"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={14}
              className={
                index < feedback.rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-page text-border"
              }
            />
          ))}
        </span>

        <time
          dateTime={feedback.created_at}
          className="text-[11px] text-muted"
        >
          {formatFeedbackDate(feedback.created_at)}
        </time>
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-page/70 px-3 py-2.5 text-xs leading-relaxed text-muted ring-1 ring-inset ring-border sm:text-[13px]">
        {feedback.message}
      </p>

      <div className="mt-auto pt-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApprovalChange(nextApproval)}
          aria-label={`${actionLabel} feedback from ${feedback.name}`}
          className={buttonClass(
            feedback.is_approved ? "danger" : "primary",
            "sm"
          )}
        >
          {updating ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <ActionIcon size={14} />
          )}
          {updating ? "Updating..." : actionLabel}
        </button>
      </div>
    </article>
  );
}
