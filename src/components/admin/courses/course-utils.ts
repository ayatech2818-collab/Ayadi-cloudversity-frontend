import type { Course } from "@/lib/api/courses";

// =========================================================
// LAYOUT
// =========================================================

/** Shared by the grid and its skeleton so nothing jumps when data lands. */
export const COURSES_GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4";

// =========================================================
// FILTERS
// =========================================================

export type CourseStatusFilter = "all" | "published" | "draft";

export const COURSE_STATUS_FILTERS: {
  value: CourseStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

// =========================================================
// COUNTS
// =========================================================

export interface CourseCounts {
  total: number;
  published: number;
  /** Courses under each brand, main category and sub category, by its id. */
  byParent: Map<string, number>;
}

/**
 * Tallies the unfiltered course list for the header, the brand tabs and the
 * numbers in the dropdowns. It only counts: the courses on screen are always
 * the backend's answer to the current filters.
 */
export const countCourses = (
  courses: Course[],
  /** Active brands — a course of any other brand has no tab to show under. */
  brandIds: Set<string>
): CourseCounts => {
  const counts: CourseCounts = {
    total: 0,
    published: 0,
    byParent: new Map(),
  };

  for (const course of courses) {
    if (!brandIds.has(course.brand_id)) continue;

    counts.total += 1;

    if (course.is_published) counts.published += 1;

    for (const id of [
      course.brand_id,
      course.category_id,
      course.subcategory_id,
    ]) {
      if (id) {
        counts.byParent.set(id, (counts.byParent.get(id) ?? 0) + 1);
      }
    }
  }

  return counts;
};

// =========================================================
// CARDS
// =========================================================

/**
 * "Main category › Sub category" for a card. `names` maps the id of every
 * main and sub category to its name.
 */
export const coursePlacement = (
  course: Course,
  names: Map<string, string>
): string =>
  [course.category_id, course.subcategory_id]
    .map((id) => id && names.get(id))
    .filter(Boolean)
    .join(" › ");

// =========================================================
// FORM
// =========================================================

export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const COURSE_THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const COURSE_THUMBNAIL_ACCEPT = COURSE_THUMBNAIL_TYPES.join(",");

export const COURSE_THUMBNAIL_LABEL = "JPG, PNG or WebP";

/** A dropped file skips the picker's `accept`, so it is checked here too. */
export const isCourseThumbnail = (file: File): boolean =>
  COURSE_THUMBNAIL_TYPES.includes(file.type);
