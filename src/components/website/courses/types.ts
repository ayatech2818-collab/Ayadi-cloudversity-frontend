import type { CourseCategory } from '@/lib/api/course-categories';
import type { CourseFilters } from '@/lib/api/courses';

export type BrandId = 'ayadi' | 'ayatech' | 'ags';

export interface DummyCourseItem {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  image: string;
  badge?: string;
}

export interface BrandSectionData {
  title: string;
  eyebrow: string;
  description: string;
  brandBadge: string;
  ctaText?: string;
  courses: DummyCourseItem[];
}

/* ==================================================
   THE AYADI CLOUDVERSITY CATALOGUE

   What the Courses page reads. Each type is cut from the API's own, so the
   dummy data is already the shape a response will arrive in.
================================================== */

/** The part of a backend category the public catalogue shows. */
export type CatalogueCategory = Pick<CourseCategory, 'id' | 'slug' | 'name' | 'description' | 'display_order'>;

/** A dummy course that points at its category (`categoryId` →
    `CatalogueCategory.id`) instead of carrying the category's name. */
export type CatalogueCourse = Omit<DummyCourseItem, 'category'> & {
  categoryId: string;
};

/** The two backend course filters the catalogue offers. */
export type CatalogueFilters = Pick<CourseFilters, 'category_id' | 'search'>;
