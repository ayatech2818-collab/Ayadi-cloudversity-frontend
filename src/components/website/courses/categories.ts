import type { CatalogueCategory } from './types';

/*
 * The three Ayadi Cloudversity course categories.
 *
 * One list, read by the Courses page, the footer's category links and the
 * dummy catalogue, so a rename happens here and nowhere else.
 *
 * Written in the shape of the API's CourseCategory
 * (src/lib/api/course-categories.ts): when the page moves to the backend,
 * `getCategories(brandId)` replaces this array.
 *
 * `slug` is what `/courses?category=…` carries; `id` is what a course points
 * at. They match here and will not once ids are UUIDs, so nothing should use
 * one where it means the other.
 */
export const courseCategories: CatalogueCategory[] = [
  {
    id: 'academic',
    slug: 'academic',
    name: 'Academic Learning Pathways',
    description: 'School to higher education',
    display_order: 1,
  },
  {
    id: 'creative',
    slug: 'creative',
    name: 'Life & Creative Skills',
    description: 'Art, design and expression',
    display_order: 2,
  },
  {
    id: 'readiness',
    slug: 'readiness',
    name: 'Workplace Readiness & PD',
    description: 'Career and workplace skills',
    display_order: 3,
  },
];

export const categoryById = (id: string) => courseCategories.find((category) => category.id === id);

export const categoryBySlug = (slug: string | null) =>
  slug ? courseCategories.find((category) => category.slug === slug) : undefined;
