"use client";

import {
  Camera,
  Link2,
  Plus,
  RotateCcw,
  Users,
} from "lucide-react";

import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Author } from "@/lib/api/authors";

interface AuthorsHeaderProps {
  authors: Author[];
  loading: boolean;
  onAdd: () => void;
  onRestore: () => void;
}

export default function AuthorsHeader({
  authors,
  loading,
  onAdd,
  onRestore,
}: AuthorsHeaderProps) {
  // Counted from the loaded list — nothing here is a made-up figure.
  const count = (matches: (author: Author) => unknown) =>
    loading ? null : authors.filter(matches).length;

  return (
    <PageHeader
      eyebrow="Content"
      title="Blog"
      highlight="Authors"
      description="Manage the people behind your blog posts — their photo, designation, bio and LinkedIn profile."
      stats={[
        {
          label: "Total authors",
          icon: Users,
          value: count(() => true),
        },
        {
          label: "With photo",
          icon: Camera,
          value: count((author) => author.profile_image),
        },
        {
          label: "On LinkedIn",
          icon: Link2,
          value: count((author) => author.linkedin_url),
        },
      ]}
    >
      <button
        type="button"
        onClick={onRestore}
        className={`${buttonClass("glass", "sm")} h-8 px-2.5 text-xs min-[360px]:h-8.5 min-[360px]:px-3 sm:h-10 sm:px-4 sm:text-sm`}
      >
        <RotateCcw className="h-3.5 w-3.5 min-[360px]:h-4 min-[360px]:w-4" />
        Restore Author
      </button>

      <button
        type="button"
        onClick={onAdd}
        className={`${buttonClass("primary", "sm")} h-8 px-2.5 text-xs min-[360px]:h-8.5 min-[360px]:px-3 sm:h-10 sm:px-4 sm:text-sm`}
      >
        <Plus className="h-4 w-4 min-[360px]:h-[17px] min-[360px]:w-[17px]" strokeWidth={2.4} />
        Add Author
      </button>
    </PageHeader>
  );
}
