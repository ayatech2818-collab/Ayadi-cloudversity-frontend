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
          className="rounded-xl bg-surface p-3.5 ring-1 ring-inset ring-border min-[360px]:rounded-2xl min-[360px]:p-4 sm:p-5"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-page min-[360px]:h-12 min-[360px]:w-12 sm:h-16 sm:w-16" />

            <div className="flex-1">
              <div className="h-3.5 w-2/3 animate-pulse rounded-md bg-page sm:h-4" />
              <div className="mt-2 h-3.5 w-1/3 animate-pulse rounded-full bg-page sm:mt-2.5 sm:h-4" />
            </div>
          </div>

          <div className="mt-2.5 h-2.5 w-full animate-pulse rounded-md bg-page min-[360px]:mt-3 min-[360px]:h-3 sm:mt-5" />
          <div className="mt-1.5 h-2.5 w-full animate-pulse rounded-md bg-page min-[360px]:h-3 sm:mt-2" />
          <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded-md bg-page min-[360px]:h-3 sm:mt-2" />

          <div className="mt-4 flex items-center justify-between sm:mt-6">
            <div className="h-3 w-14 animate-pulse rounded-md bg-page sm:w-16" />
            <div className="h-7.5 w-24 animate-pulse rounded-lg bg-page min-[360px]:h-8 min-[360px]:rounded-xl sm:h-9 sm:w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
