"use client";

import {
  Building2,
  CircleCheck,
  CircleOff,
  FolderTree,
  Plus,
} from "lucide-react";

import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/admin/ui/styles";
import type { CourseBrand } from "@/lib/api/course-brands";
import type { CourseCategory } from "@/lib/api/course-categories";

interface CategoriesHeaderProps {
  brands: CourseBrand[];
  /** Every brand's categories, not only the brand being viewed. */
  categories: CourseCategory[];
  loading: boolean;
  onCreate: () => void;
}

export default function CategoriesHeader({
  brands,
  categories,
  loading,
  onCreate,
}: CategoriesHeaderProps) {
  // Counted across every brand, so the numbers stay put when the brand changes.
  const active = categories.filter(
    (category) => category.is_active
  ).length;

  return (
    <PageHeader
      eyebrow="Operations"
      title="Main"
      highlight="Category"
      description="Manage course categories for each brand."
      stats={[
        {
          label: "Brands",
          icon: Building2,
          value: loading ? null : brands.length,
        },
        {
          label: "Categories",
          icon: FolderTree,
          value: loading ? null : categories.length,
        },
        {
          label: "Active",
          icon: CircleCheck,
          value: loading ? null : active,
        },
        {
          label: "Inactive",
          icon: CircleOff,
          value: loading ? null : categories.length - active,
        },
      ]}
    >
      {/* A category has to belong to a brand, so no brands means no adding. */}
      <button
        type="button"
        onClick={onCreate}
        disabled={brands.length === 0}
        className={buttonClass("primary")}
      >
        <Plus size={17} strokeWidth={2.4} />
        Add Category
      </button>
    </PageHeader>
  );
}
