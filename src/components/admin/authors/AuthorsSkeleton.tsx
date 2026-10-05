"use client";

import { AUTHORS_GRID } from "./author-utils";

interface AuthorsSkeletonProps {
  count?: number;
}

export default function AuthorsSkeleton({
  count = 6,
}: AuthorsSkeletonProps) {
  return (
    <div className={AUTHORS_GRID}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="rounded-2xl bg-surface p-5 ring-1 ring-inset ring-border"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-page" />

            <div className="flex-1">
              <div className="h-4 w-2/3 animate-pulse rounded-md bg-page" />
              <div className="mt-2.5 h-4 w-1/3 animate-pulse rounded-full bg-page" />
            </div>
          </div>

          <div className="mt-5 h-3 w-full animate-pulse rounded-md bg-page" />
          <div className="mt-2 h-3 w-full animate-pulse rounded-md bg-page" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded-md bg-page" />

          <div className="mt-6 flex items-center justify-between">
            <div className="h-3 w-16 animate-pulse rounded-md bg-page" />
            <div className="h-9 w-28 animate-pulse rounded-xl bg-page" />
          </div>
        </div>
      ))}
    </div>
  );
}
