"use client";

import CategoryFormModal from "@/components/admin/categories/CategoryFormModal";
import type { CourseSubcategory } from "@/lib/api/course-subcategories";
import type {
  CourseMiniCategory,
  CourseMiniCategoryFormData,
} from "@/lib/api/course-mini-categories";

interface MiniCategoryModalProps {
  open: boolean;
  mode: "create" | "edit";
  miniCategory: CourseMiniCategory | null;
  /** The sub categories to choose from — those of the category/brand being viewed. */
  subcategories: Pick<CourseSubcategory, "id" | "name">[];
  /** The sub category a new one starts under — the one being viewed. */
  defaultSubcategoryId: string;
  onClose: () => void;
  onSubmit: (data: CourseMiniCategoryFormData) => Promise<void>;
}

/** The shared category form, set up for a mini category under a sub category. */
export default function MiniCategoryModal({
  miniCategory,
  subcategories,
  defaultSubcategoryId,
  onSubmit,
  ...modal
}: MiniCategoryModalProps) {
  return (
    <CategoryFormModal
      {...modal}
      noun="Mini Category"
      parentLabel="Sub category"
      parents={subcategories}
      initial={
        miniCategory && {
          ...miniCategory,
          parentId: miniCategory.subcategory_id,
        }
      }
      defaultParentId={defaultSubcategoryId}
      namePlaceholder="Enter mini category name"
      slugPlaceholder="mini-category-slug"
      onSubmit={({ parentId, ...values }) =>
        onSubmit({ subcategory_id: parentId, ...values })
      }
    />
  );
}
