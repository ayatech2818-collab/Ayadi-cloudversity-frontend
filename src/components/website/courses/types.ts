import type { CourseCategory } from '@/lib/api/course-categories';
import type { CourseSubcategory } from '@/lib/api/course-subcategories';
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

/** The part of a backend subcategory the public catalogue shows. */
export type CatalogueSubcategory = Pick<
  CourseSubcategory,
  'id' | 'category_id' | 'slug' | 'name' | 'description' | 'display_order'
>;

/** A dummy course that points at its category (`categoryId` →
    `CatalogueCategory.id`) and optional subcategory (`subcategoryId` →
    `CatalogueSubcategory.id`) instead of carrying the category's name. */
export type CatalogueCourse = Omit<DummyCourseItem, 'category'> & {
  categoryId: string;
  subcategoryId?: string;
};

/** The backend course filters the catalogue offers. */
export type CatalogueFilters = Pick<CourseFilters, 'category_id' | 'subcategory_id' | 'search'>;
