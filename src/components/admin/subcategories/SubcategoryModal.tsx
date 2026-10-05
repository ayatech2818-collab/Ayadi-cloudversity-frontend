"use client";

import CategoryFormModal from "@/components/admin/categories/CategoryFormModal";
import type { CourseCategory } from "@/lib/api/course-categories";
import type {
  CourseSubcategory,
  CourseSubcategoryFormData,
} from "@/lib/api/course-subcategories";

interface SubcategoryModalProps {
  open: boolean;
  mode: "create" | "edit";
  subcategory: CourseSubcategory | null;
  /** The main categories to choose from — those of the brand being viewed. */
  categories: Pick<CourseCategory, "id" | "name">[];
  /** The main category a new one starts under — the one being viewed. */
  defaultCategoryId: string;
  onClose: () => void;
  onSubmit: (data: CourseSubcategoryFormData) => Promise<void>;
}

/** The shared category form, set up for a sub category under a main category. */
export default function SubcategoryModal({
  subcategory,
  categories,
  defaultCategoryId,
  onSubmit,
  ...modal
}: SubcategoryModalProps) {
  return (
    <CategoryFormModal
      {...modal}
      noun="Sub Category"
      parentLabel="Main category"
      parents={categories}
      initial={
        subcategory && {
          ...subcategory,
          parentId: subcategory.category_id,
        }
      }
      defaultParentId={defaultCategoryId}
      namePlaceholder="Enter sub category name"
      slugPlaceholder="sub-category-slug"
      onSubmit={({ parentId, ...values }) =>
        onSubmit({ category_id: parentId, ...values })
      }
    />
  );
}
