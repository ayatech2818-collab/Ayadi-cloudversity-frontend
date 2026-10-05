"use client";

import type { CourseBrand } from "@/lib/api/course-brands";
import type {
  CourseCategory,
  CourseCategoryFormData,
} from "@/lib/api/course-categories";

import CategoryFormModal from "./CategoryFormModal";

interface CategoryModalProps {
  open: boolean;
  mode: "create" | "edit";
  category: CourseCategory | null;
  brands: Pick<CourseBrand, "id" | "name">[];
  /** The brand a new category starts under — the one being viewed. */
  defaultBrandId: string;
  onClose: () => void;
  onSubmit: (data: CourseCategoryFormData) => Promise<void>;
}

/** The shared category form, set up for a main category under a brand. */
export default function CategoryModal({
  category,
  brands,
  defaultBrandId,
  onSubmit,
  ...modal
}: CategoryModalProps) {
  return (
    <CategoryFormModal
      {...modal}
      noun="Category"
      parentLabel="Brand"
      parents={brands}
      initial={
        category && { ...category, parentId: category.brand_id }
      }
      defaultParentId={defaultBrandId}
      namePlaceholder="Academic Learning Pathways"
      slugPlaceholder="academic-learning-pathways"
      onSubmit={({ parentId, ...values }) =>
        onSubmit({ brand_id: parentId, ...values })
      }
    />
  );
}
