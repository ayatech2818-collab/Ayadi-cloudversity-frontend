"use client";

interface GallerySkeletonProps {
  /** Matches the real grid so the layout does not jump when data lands. */
  count?: number;
}

export default function GallerySkeleton({
  count = 8,
}: GallerySkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="
            overflow-hidden rounded-2xl
            border border-border bg-surface
            shadow-[0_2px_8px_rgba(15,23,42,0.03)]
          "
        >
          {/* Cover */}
          <div className="aspect-[16/10] w-full animate-pulse bg-page" />

          <div className="flex flex-col p-5">
            <div className="h-4 w-4/5 animate-pulse rounded-md bg-page" />

            <div className="mt-2.5 h-3 w-1/3 animate-pulse rounded-md bg-page" />

            <div className="mt-4 h-3 w-full animate-pulse rounded-md bg-page" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-md bg-page" />

            <div className="mt-5 flex items-center justify-between border-t border-border/80 pt-4">
              <div className="flex items-center gap-1.5">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-page" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-page" />
                <div className="h-9 w-9 animate-pulse rounded-lg bg-page" />
              </div>

              <div className="h-8 w-20 animate-pulse rounded-xl bg-page" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
