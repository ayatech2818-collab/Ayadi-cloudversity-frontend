'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { loadCatalogue } from '@/components/website/courses/useCourseCatalogue';
import { publicKeys } from '@/lib/query/client';

/* Deep navy glass lit by the brand's emerald and teal, as on the admin sidebar.
   The base is nearly opaque and saturated: any thinner and a white page mixes
   it down to a washed-out grey, while a dark page still shows through a little. */
export const COURSES_MENU_GLASS = {
  backgroundImage: [
    'radial-gradient(420px circle at 8% -10%, rgba(16, 185, 129, 0.38), transparent 65%)',
    'radial-gradient(480px circle at 100% 110%, rgba(13, 148, 136, 0.42), transparent 65%)',
    'radial-gradient(380px circle at 70% -20%, rgba(79, 110, 210, 0.38), transparent 70%)',
    'linear-gradient(135deg, rgba(9, 16, 48, 0.95), rgba(16, 26, 74, 0.93) 55%, rgba(6, 42, 58, 0.94))',
  ].join(', '),
};

/* What each level looks like when chosen, on the desktop menu and the sheet. */
export const CATEGORY_ACTIVE =
  'bg-linear-to-r from-emerald-400/25 to-white/[0.04] text-white ring-1 ring-inset ring-emerald-300/30';
export const SUBCATEGORY_ACTIVE = 'bg-sidebar-active text-white shadow-sidebar-active';
export const MINI_ACTIVE = 'bg-emerald-400/15 text-emerald-200 ring-1 ring-inset ring-emerald-300/40';

export const COLUMN_LABEL = 'px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200/60';

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
