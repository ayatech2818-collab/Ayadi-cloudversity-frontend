import type { CatalogueSubcategory } from './types';

/*
 * Temporary mock subcategories for Ayadi Cloudversity.
 *
 * NOTE: These are strictly placeholder demonstration records and have NOT
 * been approved as official business subcategories. They mirror the exact
 * shape of CourseSubcategory from src/lib/api/course-subcategories.ts, so when
 * the page moves to the backend API, `getSubcategories(categoryId)` will
 * replace this array.
 *
 * Each subcategory points to its parent main category via `category_id`.
 */
export const mockSubcategories: CatalogueSubcategory[] = [
  // Academic Learning Pathways (academic)
  {
    id: 'sub-academic-data-ai',
    category_id: 'academic',
    slug: 'data-science-ai',
    name: 'Data Science & AI',
    description: 'Data analytics, machine learning, and AI studies',
    display_order: 1,
  },
  {
    id: 'sub-academic-higher-ed',
    category_id: 'academic',
    slug: 'higher-education',
    name: 'Higher Education',
    description: 'Pathway programs into degree and diploma education',
    display_order: 2,
  },

  // Life & Creative Skills (creative)
  {
    id: 'sub-creative-design',
    category_id: 'creative',
    slug: 'design-experience',
    name: 'Design & Experience',
    description: 'UI/UX, visual design, and creative media',
    display_order: 1,
  },

  // Workplace Readiness & PD (readiness)
  {
    id: 'sub-readiness-software',
    category_id: 'readiness',
    slug: 'software-engineering',
    name: 'Software Engineering',
    description: 'Full stack development and technical career skills',
    display_order: 1,
  },
  {
    id: 'sub-readiness-marketing',
    category_id: 'readiness',
    slug: 'digital-marketing',
    name: 'Digital Marketing & Growth',
    description: 'Brand strategy, social media, and analytics',
    display_order: 2,
  },
];

export const subcategoryById = (id: string) =>
  mockSubcategories.find((subcategory) => subcategory.id === id);

export const subcategoryBySlug = (slug: string | null) =>
  slug ? mockSubcategories.find((subcategory) => subcategory.slug === slug) : undefined;

export const subcategoriesByCategoryId = (categoryId: string) =>
  mockSubcategories
    .filter((subcategory) => subcategory.category_id === categoryId)
    .sort((a, b) => a.display_order - b.display_order);
