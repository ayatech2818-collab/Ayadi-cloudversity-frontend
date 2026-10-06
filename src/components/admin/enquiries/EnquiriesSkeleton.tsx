"use client";

import { ENQUIRY_GRID } from "./enquiry-utils";

interface EnquiriesSkeletonProps {
  count?: number;
}

export default function EnquiriesSkeleton({
  count = 8,
}: EnquiriesSkeletonProps) {
  return (
    <div className={ENQUIRY_GRID}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="rounded-2xl bg-surface p-3.5 ring-1 ring-inset ring-border sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-page" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-page" />
          </div>

          <div className="mt-4 h-4 w-3/5 animate-pulse rounded-md bg-page" />
          <div className="mt-2.5 h-3 w-2/5 animate-pulse rounded-md bg-page" />

          <div className="mt-4 h-3 w-full animate-pulse rounded-md bg-page" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded-md bg-page" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded-md bg-page" />

          <div className="mt-5 flex items-center justify-between">
            <div className="h-9 w-20 animate-pulse rounded-xl bg-page" />
            <div className="h-9 w-9 animate-pulse rounded-xl bg-page" />
          </div>
        </div>
      ))}
    </div>
  );
}
