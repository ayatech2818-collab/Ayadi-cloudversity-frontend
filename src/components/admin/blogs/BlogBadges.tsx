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
    <span className="flex items-center gap-1.5">
      <StatusBadge published={blog.status === "published"} />

      {blog.is_featured && (
        <span
          title="Featured"
          className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white shadow-sm"
        >
          <Star size={11} className="fill-current" />
          <span className={compact ? "sr-only" : undefined}>
            Featured
          </span>
        </span>
      )}
    </span>
  );
}
