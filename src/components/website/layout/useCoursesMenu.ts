'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { loadCatalogue } from '@/components/website/courses/useCourseCatalogue';
import { publicKeys } from '@/lib/query/client';

/* Frosted mint-to-periwinkle over a real backdrop blur, on the desktop menu and
   the sheet: thin enough for the page to show through, thick enough at the top
   to keep navy text readable. */
export const COURSES_MENU_GLASS = {
  backgroundImage:
    'linear-gradient(165deg, rgba(240, 248, 243, 0.84), rgba(226, 241, 233, 0.78) 28%, rgba(222, 229, 241, 0.72))',
};

/* What each level looks like when chosen on the desktop menu, as on the sheet. */
export const CATEGORY_ACTIVE = 'bg-accent text-white shadow-[0_6px_14px_-6px_rgba(30,43,87,0.7)]';
export const SUBCATEGORY_ACTIVE = 'bg-brand-gradient text-white shadow-[0_8px_18px_-8px_rgba(5,150,105,0.8)]';
export const MINI_ACTIVE = 'bg-accent/10 text-accent ring-1 ring-inset ring-accent/25';

export const COLUMN_LABEL = 'px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800';

/*
 * What the Courses menu shows, desktop and mobile alike: main category → sub
 * category → mini-category (when the sub category has any) → courses.
 *
 * It reads the Courses page's own catalogue entry, so the two never disagree
 * and a visit to either fills the cache for the other.
 */
export function useCoursesMenu(enabled: boolean) {
  const catalogue = useQuery({
    queryKey: publicKeys.catalogue,
    queryFn: loadCatalogue,
    enabled,
  });

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [miniCategoryId, setMiniCategoryId] = useState<string | null>(null);

  const data = catalogue.data;

  /* What is shown follows the choice, falling back to the first of each level. */
  const category = data?.categories.find((item) => item.id === categoryId) ?? data?.categories[0] ?? null;

  const subcategories = useMemo(
    () => (data && category ? data.subcategories.filter((item) => item.category_id === category.id) : []),
    [data, category],
  );
  const subcategory = subcategories.find((item) => item.id === subcategoryId) ?? subcategories[0] ?? null;

  const miniCategories = useMemo(
    () =>
      data && subcategory
        ? (data.miniCategories ?? []).filter((item) => item.subcategory_id === subcategory.id)
        : [],
    [data, subcategory],
  );
  const miniCategory = miniCategories.find((item) => item.id === miniCategoryId) ?? null;

  const courses = useMemo(
    () =>
      (data?.courses ?? []).filter(
        (course) =>
          course.categoryId === category?.id &&
          (!subcategory || course.subcategoryId === subcategory.id) &&
          (!miniCategory || course.miniCategoryId === miniCategory.id),
      ),
    [data, category, subcategory, miniCategory],
  );

  const selectCategory = (id: string) => {
    setCategoryId(id);
    setSubcategoryId(null);
    setMiniCategoryId(null);
  };

  const selectSubcategory = (id: string) => {
    setSubcategoryId(id);
    setMiniCategoryId(null);
  };

  return {
    data,
    isPending: catalogue.isPending,
    category,
    subcategories,
    subcategory,
    miniCategories,
    miniCategory,
    courses,
    selectCategory,
    selectSubcategory,
    selectMiniCategory: setMiniCategoryId,
  };
}
