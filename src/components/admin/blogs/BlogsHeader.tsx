"use client";

import {
  CircleCheck,
  FilePen,
  FileText,
  Plus,
  Star,
} from "lucide-react";

import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Blog } from "@/lib/api/blogs";

interface BlogsHeaderProps {
  /** Every blog, ignoring the filters. `null` until it has loaded. */
  blogs: Blog[] | null;
  onCreate: () => void;
}

export default function BlogsHeader({
  blogs,
  onCreate,
}: BlogsHeaderProps) {
  // Counted from the full list, so the numbers do not shrink with the filters.
  const count = (matches: (blog: Blog) => boolean) =>
    blogs ? blogs.filter(matches).length : null;

  return (
    <PageHeader
      eyebrow="Content"
      title="Blog"
      highlight="Posts"
      description="Create, manage and publish your latest content."
      stats={[
        {
          label: "Total posts",
          icon: FileText,
          value: count(() => true),
        },
        {
          label: "Published",
          icon: CircleCheck,
          value: count((blog) => blog.status === "published"),
        },
        {
          label: "Drafts",
          icon: FilePen,
          value: count((blog) => blog.status === "draft"),
        },
        {
          label: "Featured",
          icon: Star,
          value: count((blog) => blog.is_featured),
        },
      ]}
    >
      <button
        type="button"
        onClick={onCreate}
        className={`${buttonClass("primary")} h-8.5 px-3 text-xs min-[360px]:h-9 min-[360px]:px-3.5 sm:h-10 sm:px-4 sm:text-sm`}
      >
        <Plus className="size-3.5 min-[360px]:size-4 sm:size-[17px]" strokeWidth={2.4} />
        Create Blog
      </button>
    </PageHeader>
  );
}
