"use client";

import { FEEDBACK_GRID } from "./feedback-utils";

export default function FeedbackSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={FEEDBACK_GRID}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="rounded-2xl bg-surface p-4 ring-1 ring-inset ring-border sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="h-11 w-11 animate-pulse rounded-full bg-page" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-page" />
          </div>
          <div className="mt-4 h-4 w-2/5 animate-pulse rounded-md bg-page" />
          <div className="mt-2.5 h-3 w-3/5 animate-pulse rounded-md bg-page" />
          <div className="mt-4 h-20 animate-pulse rounded-xl bg-page" />
          <div className="mt-4 h-9 w-24 animate-pulse rounded-xl bg-page" />
        </div>
      ))}
    </div>
  );
}
