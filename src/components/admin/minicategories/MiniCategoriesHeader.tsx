"use client";

import {
  CircleCheck,
  CircleOff,
  GitBranch,
  Layers,
  Plus,
} from "lucide-react";

import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/admin/ui/styles";
import type { CourseSubcategory } from "@/lib/api/course-subcategories";
import type { CourseMiniCategory } from "@/lib/api/course-mini-categories";

interface MiniCategoriesHeaderProps {
  /** Every active category's sub categories. */
  subcategories: CourseSubcategory[];
  /** Every one of those subcategories' mini categories. */
  miniCategories: CourseMiniCategory[];
  loading: boolean;
  /** False until there is a sub category to add one under. */
  canCreate: boolean;
  onCreate: () => void;
}

export default function MiniCategoriesHeader({
  subcategories,
  miniCategories,
  loading,
  canCreate,
  onCreate,
}: MiniCategoriesHeaderProps) {
  // Counted across every brand and subcategory, so the numbers stay put when
  // filters change.
  const active = miniCategories.filter(
    (miniCategory) => miniCategory.is_active
  ).length;

  return (
    <PageHeader
      eyebrow="Operations"
      title="Mini"
      highlight="Category"
      description="Manage mini categories under each sub category."
      stats={[
        {
          label: "Sub categories",
          icon: GitBranch,
          value: loading ? null : subcategories.length,
        },
        {
          label: "Mini categories",
          icon: Layers,
          value: loading ? null : miniCategories.length,
        },
        {
          label: "Active",
          icon: CircleCheck,
          value: loading ? null : active,
        },
        {
          label: "Inactive",
          icon: CircleOff,
          value: loading ? null : miniCategories.length - active,
        },
      ]}
    >
      <button
        type="button"
        onClick={onCreate}
        disabled={!canCreate}
        className={buttonClass("primary")}
      >
        <Plus size={17} strokeWidth={2.4} />
        Add Mini Category
      </button>
    </PageHeader>
  );
}
