"use client";

import Field from "@/components/admin/ui/Field";
import FormSection from "@/components/admin/ui/FormSection";
import Select from "@/components/admin/ui/Select";
import type { CourseBrand } from "@/lib/api/course-brands";
import type { CourseCategory } from "@/lib/api/course-categories";
import type { CourseSubcategory } from "@/lib/api/course-subcategories";

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

/** Brand, then its main category, then that category's sub category. */
export default function CoursePlacementFields({
  values,
  errors,
  disabled,
  brands,
  categories,
  subcategories,
  onChange,
}: CoursePlacementFieldsProps) {
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

  return (
    <FormSection title="Placement">
      <div
        className={`grid gap-4 ${usesCategories ? "md:grid-cols-3" : ""}`}
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
