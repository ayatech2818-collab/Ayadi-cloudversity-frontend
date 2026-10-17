"use client";

import { Star } from "lucide-react";

import StatusBadge from "@/components/admin/ui/StatusBadge";
import type { Blog } from "@/lib/api/blogs";

interface BlogBadgesProps {
  blog: Pick<Blog, "status" | "is_featured">;
  /** Drops the "Featured" word and keeps the star, for narrow cards. */
  compact?: boolean;
}

/** Status pill, plus a star when the post is featured. Sits on a cover. */
export default function BlogBadges({
  blog,
  compact = false,
}: BlogBadgesProps) {
  return (
    <span className="flex items-center gap-1 sm:gap-1.5">
      <StatusBadge published={blog.status === "published"} />

      {blog.is_featured && (
        <span
          title="Featured"
          className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm min-[360px]:gap-1 min-[360px]:px-2 min-[360px]:text-[10px] sm:px-2 sm:py-1 sm:text-[11px]"
        >
          <Star className="size-2.5 fill-current min-[360px]:size-3 sm:size-[11px]" />
          <span className={compact ? "sr-only" : undefined}>
            Featured
          </span>
        </span>
      )}
    </span>
  );
}
