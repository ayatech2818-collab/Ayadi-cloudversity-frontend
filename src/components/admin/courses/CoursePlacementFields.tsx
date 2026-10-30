"use client";

import { useEffect, useState } from "react";

import Field from "@/components/admin/ui/Field";
import FormSection from "@/components/admin/ui/FormSection";
import Select from "@/components/admin/ui/Select";
import type { CourseBrand } from "@/lib/api/course-brands";
import type { CourseCategory } from "@/lib/api/course-categories";
import type { CourseSubcategory } from "@/lib/api/course-subcategories";
import {
  getMiniCategories,
  type CourseMiniCategory,
} from "@/lib/api/course-mini-categories";
import { getApiErrorMessage } from "@/lib/api/errors";

import {
  brandUsesCategories,
  type CourseFieldsProps,
} from "./course-form";

interface CoursePlacementFieldsProps extends CourseFieldsProps {
  /** Active brands. */
  brands: CourseBrand[];
  /** Every brand's main categories. */
  categories: CourseCategory[];
  /** Every main category's sub categories. */
  subcategories: CourseSubcategory[];
}

/** An inactive one stays listed, so it is clear why it cannot be picked. */
const option = (item: {
  id: string;
  name: string;
  is_active: boolean;
}) => (
  <option key={item.id} value={item.id} disabled={!item.is_active}>
    {item.name}
    {!item.is_active && " (inactive)"}
  </option>
);

/** Brand, then its main category, then sub category, then optional mini-category. */
export default function CoursePlacementFields({
  values,
  errors,
  disabled,
  brands,
  categories,
  subcategories,
  onChange,
}: CoursePlacementFieldsProps) {
  const [miniCategories, setMiniCategories] = useState<
    CourseMiniCategory[]
  >([]);
  const [loadingMiniCategories, setLoadingMiniCategories] = useState(false);
  const [miniCategoryError, setMiniCategoryError] = useState<string | null>(
    null
  );

  const brandCategories = categories.filter(
    (category) => category.brand_id === values.brandId
  );
  const categorySubcategories = subcategories.filter(
    (subcategory) => subcategory.category_id === values.categoryId
  );

  const usesCategories = brandUsesCategories(
    categories,
    values.brandId
  );

  useEffect(() => {
    if (!values.subcategoryId) {
      setMiniCategories([]);
      setLoadingMiniCategories(false);
      setMiniCategoryError(null);
      return;
    }

    let cancelled = false;
    setLoadingMiniCategories(true);
    setMiniCategoryError(null);

    getMiniCategories(values.subcategoryId)
      .then((data) => {
        if (!cancelled) {
          setMiniCategories(data);
          setLoadingMiniCategories(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load mini-categories:", error);
          setMiniCategoryError(
            getApiErrorMessage(
              error,
              "Failed to load mini-categories."
            )
          );
          setLoadingMiniCategories(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [values.subcategoryId]);

  const hasSelectedMiniCategory =
    Boolean(values.miniCategoryId) &&
    miniCategories.some((item) => item.id === values.miniCategoryId);

  return (
    <FormSection title="Placement">
      <div
        className={`grid gap-4 ${usesCategories ? "sm:grid-cols-2" : ""}`}
      >
        <Field
          label="Brand"
          htmlFor="course-brand"
          required
          error={errors.brandId}
        >
          <Select
            id="course-brand"
            value={values.brandId}
            disabled={disabled}
            invalid={Boolean(errors.brandId)}
            onChange={(event) =>
              onChange("brandId", event.target.value)
            }
          >
            <option value="">Select brand</option>

            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </Select>
        </Field>

        {usesCategories && (
          <>
            <Field
              label="Main category"
              htmlFor="course-category"
              required
              error={errors.categoryId}
            >
              <Select
                id="course-category"
                value={values.categoryId}
                disabled={disabled}
                invalid={Boolean(errors.categoryId)}
                onChange={(event) =>
                  onChange("categoryId", event.target.value)
                }
              >
                <option value="">Select main category</option>

                {brandCategories.map(option)}
              </Select>
            </Field>

            <Field
              label="Sub category"
              htmlFor="course-subcategory"
              required
              error={errors.subcategoryId}
            >
              <Select
                id="course-subcategory"
                value={values.subcategoryId}
                disabled={disabled || !values.categoryId}
                invalid={Boolean(errors.subcategoryId)}
                onChange={(event) =>
                  onChange("subcategoryId", event.target.value)
                }
              >
                <option value="">
                  {!values.categoryId
                    ? "Pick a main category first"
                    : categorySubcategories.length > 0
                      ? "Select sub category"
                      : "No sub categories"}
                </option>

                {categorySubcategories.map(option)}
              </Select>
            </Field>

            <Field
              label="Mini-category"
              htmlFor="course-minicategory"
              aside={<span className="text-[11px] text-muted">Optional</span>}
              error={errors.miniCategoryId || miniCategoryError || undefined}
            >
              <Select
                id="course-minicategory"
                value={values.miniCategoryId}
                disabled={
                  disabled ||
                  !values.subcategoryId ||
                  loadingMiniCategories
                }
                invalid={Boolean(errors.miniCategoryId || miniCategoryError)}
                onChange={(event) =>
                  onChange("miniCategoryId", event.target.value)
                }
              >
                {loadingMiniCategories ? (
                  <>
                    <option value="">Loading mini-categories...</option>
                    {values.miniCategoryId && (
                      <option value={values.miniCategoryId}>
                        Loading current selection...
                      </option>
                    )}
                  </>
                ) : miniCategoryError ? (
                  <option value="">Failed to load mini-categories</option>
                ) : !values.subcategoryId ? (
                  <option value="">Pick a sub category first</option>
                ) : (
                  <>
                    <option value="">
                      {miniCategories.length > 0
                        ? "None (no mini-category)"
                        : "No mini-categories available"}
                    </option>

                    {values.miniCategoryId && !hasSelectedMiniCategory && (
                      <option value={values.miniCategoryId} disabled>
                        Saved mini-category (unavailable)
                      </option>
                    )}

                    {miniCategories.map(option)}
                  </>
                )}
              </Select>
            </Field>
          </>
        )}
      </div>

      {values.brandId && !usesCategories && (
        <p className="text-[11px] leading-relaxed text-muted">
          This brand has no active main categories, so the course is
          saved directly under the brand.
        </p>
      )}
    </FormSection>
  );
}
