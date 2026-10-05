"use client";

import {
  CircleCheck,
  CircleOff,
  Folder,
  FolderTree,
  Plus,
} from "lucide-react";

import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/admin/ui/styles";
import type { CourseCategory } from "@/lib/api/course-categories";
import type { CourseSubcategory } from "@/lib/api/course-subcategories";

interface SubcategoriesHeaderProps {
  /** Every active brand's main categories. */
  categories: CourseCategory[];
  /** Every one of those categories' sub categories. */
  subcategories: CourseSubcategory[];
  loading: boolean;
  /** False until there is a main category to add one under. */
  canCreate: boolean;
  onCreate: () => void;
}

export default function SubcategoriesHeader({
  categories,
  subcategories,
  loading,
  canCreate,
  onCreate,
}: SubcategoriesHeaderProps) {
  // Counted across every brand, so the numbers stay put when the brand or
  // the main category changes.
  const active = subcategories.filter(
    (subcategory) => subcategory.is_active
  ).length;

  return (
    <PageHeader
      eyebrow="Operations"
      title="Sub"
      highlight="Category"
      description="Manage sub categories under each main category."
      stats={[
        {
          label: "Main categories",
          icon: FolderTree,
          value: loading ? null : categories.length,
        },
        {
          label: "Sub categories",
          icon: Folder,
          value: loading ? null : subcategories.length,
        },
        {
          label: "Active",
          icon: CircleCheck,
          value: loading ? null : active,
        },
        {
          label: "Inactive",
          icon: CircleOff,
          value: loading ? null : subcategories.length - active,
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
        Add Sub Category
      </button>
    </PageHeader>
  );
}
