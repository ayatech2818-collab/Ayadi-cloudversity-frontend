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
        className={buttonClass("glass")}
      >
        <RotateCcw size={16} />
        Restore Author
      </button>

      <button
        type="button"
        onClick={onAdd}
        className={buttonClass("primary")}
      >
        <Plus size={17} strokeWidth={2.4} />
        Add Author
      </button>
    </PageHeader>
  );
}
