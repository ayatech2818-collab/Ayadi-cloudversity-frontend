"use client";

import {
  BookOpen,
  Building2,
  CircleCheck,
  CircleDashed,
  Plus,
} from "lucide-react";

import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/admin/ui/styles";

import type { CourseCounts } from "./course-utils";

interface CoursesHeaderProps {
  /** How many active brands there are. */
  brandCount: number;
  /** Counted across every brand, so the numbers stay put under any filter. */
  counts: CourseCounts;
  loading: boolean;
  onCreate: () => void;
}

export default function CoursesHeader({
  brandCount,
  counts,
  loading,
  onCreate,
}: CoursesHeaderProps) {
  return (
    <PageHeader
      eyebrow="Operations"
      title="Course"
      highlight="Catalogue"
      description="Manage courses across all learning brands."
      stats={[
        {
          label: "Brands",
          icon: Building2,
          value: loading ? null : brandCount,
        },
        {
          label: "Courses",
          icon: BookOpen,
          value: loading ? null : counts.total,
        },
        {
          label: "Published",
          icon: CircleCheck,
          value: loading ? null : counts.published,
        },
        {
          label: "Drafts",
          icon: CircleDashed,
          value: loading ? null : counts.total - counts.published,
        },
      ]}
    >
      {/* A course has to belong to a brand, so no brands means no adding. */}
      <button
        type="button"
        onClick={onCreate}
        disabled={brandCount === 0}
        className={buttonClass("primary")}
      >
        <Plus size={17} strokeWidth={2.4} />
        Add Course
      </button>
    </PageHeader>
  );
}
