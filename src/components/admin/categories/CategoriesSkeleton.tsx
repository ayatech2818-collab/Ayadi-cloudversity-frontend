"use client";

import { CATEGORIES_GRID } from "./category-utils";

interface CategoriesSkeletonProps {
  count?: number;
}

export default function CategoriesSkeleton({
  count = 6,
}: CategoriesSkeletonProps) {
  return (
    <div className={CATEGORIES_GRID}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="rounded-2xl bg-surface p-3.5 ring-1 ring-inset ring-border sm:p-5"
        >
          <div className="flex items-start justify-between">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-page sm:h-10 sm:w-10" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-page" />
          </div>

          <div className="mt-4 h-4 w-3/4 animate-pulse rounded-md bg-page" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded-md bg-page" />

          <div className="mt-4 h-3 w-full animate-pulse rounded-md bg-page" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded-md bg-page" />

          <div className="mt-5 flex items-center justify-between">
            <div className="h-3 w-12 animate-pulse rounded-md bg-page" />
            <div className="h-9 w-20 animate-pulse rounded-xl bg-page" />
          </div>
        </div>
      ))}
    </div>
  );
}
