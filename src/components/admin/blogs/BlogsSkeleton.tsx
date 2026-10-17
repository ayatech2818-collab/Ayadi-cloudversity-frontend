"use client";

import { BLOGS_GRID } from "./blog-utils";

interface BlogsSkeletonProps {
  count?: number;
}

export default function BlogsSkeleton({
  count = 6,
}: BlogsSkeletonProps) {
  return (
    <div className={BLOGS_GRID}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={`${
            index >= 4 ? "hidden sm:block " : ""
          }overflow-hidden rounded-xl bg-surface ring-1 ring-border sm:rounded-2xl`}
        >
          <div className="aspect-video w-full animate-pulse bg-page" />

          <div className="p-2.5 min-[360px]:p-3 sm:p-5">
            <div className="h-2.5 w-1/3 animate-pulse rounded-md bg-page min-[360px]:h-3" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded-md bg-page min-[360px]:h-3.5 sm:mt-3 sm:h-4" />
            <div className="mt-2 h-2.5 w-full animate-pulse rounded-md bg-page min-[360px]:h-3 sm:mt-3" />
            <div className="mt-1.5 h-2 w-2/3 animate-pulse rounded-md bg-page min-[360px]:h-2.5 sm:mt-2 sm:h-3" />

            <div className="mt-3 flex items-center justify-between sm:mt-5">
              <div className="h-6.5 w-12 animate-pulse rounded-lg bg-page min-[360px]:h-7 min-[360px]:w-14 sm:h-9 sm:w-20 sm:rounded-xl" />
              <div className="h-6.5 w-6.5 animate-pulse rounded-lg bg-page min-[360px]:h-7 min-[360px]:w-7 sm:h-9 sm:w-9 sm:rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
