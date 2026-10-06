import type { CourseCategory } from "@/lib/api/course-categories";
import type { CourseSubcategory } from "@/lib/api/course-subcategories";
import type { Course, CourseFormData } from "@/lib/api/courses";

/** Everything the form holds, apart from the picked thumbnail file. */
export interface CourseFormValues {
  brandId: string;
  categoryId: string;
  subcategoryId: string;

  title: string;
  courseCode: string;
  slug: string;
  shortDescription: string;
  description: string;

  duration: string;
  level: string;
  /** Kept as text so the box can be cleared while typing a new number. */
  displayOrder: string;
  isPublished: boolean;
}

export type CourseFormErrors = Partial<
  Record<
    | "brandId"
    | "categoryId"
    | "subcategoryId"
    | "title"
    | "courseCode"
    | "slug"
    | "displayOrder"
    | "thumbnail",
    string
  >
>;

/** The props every group of form fields takes. */
export interface CourseFieldsProps {
  values: CourseFormValues;
  errors: CourseFormErrors;
  disabled: boolean;
  onChange: <Field extends keyof CourseFormValues>(
    field: Field,
    value: CourseFormValues[Field]
  ) => void;
}

/** Where a course sits: its brand, main category and sub category. */
export interface CoursePlacement {
  brandId: string;
  categoryId: string;
  subcategoryId: string;
}

/**
 * The server's rule: a brand with an active main category files every course
 * under a main category and a sub category. A brand without one takes its
 * courses directly.
 */
export const brandUsesCategories = (
  categories: CourseCategory[],
  brandId: string
): boolean =>
  categories.some(
    (category) => category.brand_id === brandId && category.is_active
  );

/**
 * The form's starting point: the course being edited, or a blank one placed
 * where the page is currently looking.
 */
export const toFormValues = (
  course: Course | null,
  defaults: CoursePlacement
): CourseFormValues => ({
  brandId: course?.brand_id ?? defaults.brandId,
  categoryId: course ? (course.category_id ?? "") : defaults.categoryId,
  subcategoryId: course
    ? (course.subcategory_id ?? "")
    : defaults.subcategoryId,

  title: course?.title ?? "",
  courseCode: course?.course_code ?? "",
  slug: course?.slug ?? "",
  shortDescription: course?.short_description ?? "",
  description: course?.description ?? "",

  duration: course?.duration ?? "",
  level: course?.level ?? "",
  displayOrder: String(course?.display_order ?? 0),
  isPublished: course?.is_published ?? true,
});

export const validateCourseForm = (
  values: CourseFormValues,
  categories: CourseCategory[],
  subcategories: CourseSubcategory[]
): CourseFormErrors => {
  const errors: CourseFormErrors = {};

  if (!values.brandId) {
    errors.brandId = "Select a brand.";
  } else if (brandUsesCategories(categories, values.brandId)) {
    const category = categories.find(
      (item) =>
        item.id === values.categoryId &&
        item.brand_id === values.brandId
    );
    const subcategory = subcategories.find(
      (item) =>
        item.id === values.subcategoryId &&
        item.category_id === values.categoryId
    );

    // The server turns down inactive ones, so they are caught here first.
    if (!category) {
      errors.categoryId = "Select a main category.";
    } else if (!category.is_active) {
      errors.categoryId =
        "This main category is inactive. Pick an active one.";
    } else if (!subcategory) {
      errors.subcategoryId = subcategories.some(
        (item) => item.category_id === category.id && item.is_active
      )
        ? "Select a sub category."
        : "This main category has no active sub category. Add one first.";
    } else if (!subcategory.is_active) {
      errors.subcategoryId =
        "This sub category is inactive. Pick an active one.";
    }
  }

  if (!values.title.trim()) {
    errors.title = "Course name is required.";
  }

  if (!values.courseCode.trim()) {
    errors.courseCode = "Course code is required.";
  }

  if (!values.slug.trim()) {
    errors.slug = "Slug is required.";
  }

  const order = Number(values.displayOrder || 0);

  if (!Number.isInteger(order) || order < 0) {
    errors.displayOrder = "Use a whole number, 0 or more.";
  }

  return errors;
};

/** The body the API takes. */
export const toCoursePayload = (
  values: CourseFormValues,
  thumbnail: File | null,
  /** False for a brand that takes its courses directly. */
  usesCategories: boolean
): CourseFormData => ({
  brand_id: values.brandId,
  category_id: usesCategories ? values.categoryId : null,
  subcategory_id: usesCategories ? values.subcategoryId : null,

  title: values.title.trim(),
  slug: values.slug.trim(),
  course_code: values.courseCode.trim(),

  short_description: values.shortDescription.trim() || null,
  description: values.description.trim() || null,

  duration: values.duration.trim() || null,
  level: values.level || null,

  is_published: values.isPublished,
  display_order: Number(values.displayOrder || 0),

  thumbnail,
});
