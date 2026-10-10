import type { CatalogueCategory, CatalogueCourse, CatalogueFilters } from './types';

/*
 * The catalogue's filtering, kept out of the components.
 *
 * The criteria are the backend's own (CourseFilters in src/lib/api/courses.ts):
 * `category_id` and `search`. When the page moves to the API these two go to
 * `getCourses()` as query parameters and this file goes away — the components
 * only ever see the list that comes back.
 *
 * One difference to carry over: the backend matches `search` against the title
 * alone, while this also reads the description, category, level, duration and
 * badge.
 */

/** Everything a visitor might type to find this course, lower-cased. */
function searchableText(course: CatalogueCourse, categoryName: string | undefined) {
  return [course.title, course.description, categoryName, course.level, course.duration, course.badge]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Courses matching both criteria. An empty criterion matches everything; a
 * search of several words needs each of them somewhere in the course.
 */
export function filterCourses(
  courses: readonly CatalogueCourse[],
  categories: readonly CatalogueCategory[],
  { category_id, search }: CatalogueFilters,
): CatalogueCourse[] {
  const terms = (search ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  const nameById = new Map(categories.map((category) => [category.id, category.name]));

  return courses.filter((course) => {
    if (category_id && course.categoryId !== category_id) return false;
    if (terms.length === 0) return true;

    const text = searchableText(course, nameById.get(course.categoryId));
    return terms.every((term) => text.includes(term));
  });
}

/** How many of `courses` sit in each category, keyed by category id. */
export function countByCategory(courses: readonly CatalogueCourse[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const course of courses) {
    counts[course.categoryId] = (counts[course.categoryId] ?? 0) + 1;
  }

  return counts;
}
