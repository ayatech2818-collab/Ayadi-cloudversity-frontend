"use client";

import { COURSES_GRID } from "./course-utils";

interface CoursesSkeletonProps {
  count?: number;
}

export default function CoursesSkeleton({
  count = 8,
}: CoursesSkeletonProps) {
  return (
    <div className={COURSES_GRID}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border"
        >
          <div className="aspect-video w-full animate-pulse bg-page" />

          <div className="p-3.5 sm:p-5">
            <div className="h-3 w-1/3 animate-pulse rounded-md bg-page" />
            <div className="mt-3 h-4 w-4/5 animate-pulse rounded-md bg-page" />
            <div className="mt-3 h-3 w-full animate-pulse rounded-md bg-page" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-md bg-page" />

            <div className="mt-5 flex items-center justify-between">
              <div className="h-3 w-12 animate-pulse rounded-md bg-page" />
              <div className="h-9 w-20 animate-pulse rounded-xl bg-page" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
