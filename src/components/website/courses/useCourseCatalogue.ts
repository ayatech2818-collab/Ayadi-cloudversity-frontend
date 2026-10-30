'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { getCourseBrands } from '@/lib/api/course-brands';
import { getCategories } from '@/lib/api/course-categories';
import { getMiniCategories } from '@/lib/api/course-mini-categories';
import { getSubcategories } from '@/lib/api/course-subcategories';
import { getCourses } from '@/lib/api/courses';
import { getApiErrorMessage } from '@/lib/api/errors';
import { publicKeys } from '@/lib/query/client';

import { countByCategory, countByMiniCategory, countBySubcategory, filterCourses } from './filterCourses';
import {
  mapCourseToCatalogueCourse,
  type CatalogueCategory,
  type CatalogueCourse,
  type CatalogueMiniCategory,
  type CatalogueSubcategory,
} from './types';

/* useLayoutEffect warns during SSR — same swap as CoursesIntro. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* The query parameters used by URL deep-linking */
const CATEGORY_PARAM = 'category';
const SUBCATEGORY_PARAM = 'subcategory';
const MINI_CATEGORY_PARAM = 'mini';

type CatalogueParams = {
  categorySlug: string | null;
  subcategorySlug: string | null;
  miniCategorySlug: string | null;
};

function findCategoryInList(categories: CatalogueCategory[], slug: string | null): CatalogueCategory | null {
  if (!slug) return null;
  const lower = slug.toLowerCase();
  return (
    categories.find(
      (c) =>
        c.slug.toLowerCase() === lower ||
        // Support legacy aliases
        (lower === 'academic' && c.slug.includes('academic')) ||
        (lower === 'creative' && (c.slug.includes('creative') || c.slug.includes('life'))) ||
        (lower === 'readiness' &&
          (c.slug.includes('readiness') || c.slug.includes('workspace') || c.slug.includes('workplace'))) ||
        (lower === 'ai' && (/(^|-)ai(-|$)/.test(c.slug) || c.slug.includes('future'))),
    ) ?? null
  );
}

function findSubcategoryInList(
  subcategories: CatalogueSubcategory[],
  categoryId: string,
  subSlug: string | null,
): CatalogueSubcategory | null {
  if (!subSlug) return null;
  const lower = subSlug.toLowerCase();
  return (
    subcategories.find(
      (s) => s.category_id === categoryId && (s.slug.toLowerCase() === lower || s.id === subSlug),
    ) ?? null
  );
}

function findMiniCategoryInList(
  miniCategories: CatalogueMiniCategory[],
  subcategoryId: string,
  miniSlug: string | null,
): CatalogueMiniCategory | null {
  if (!miniSlug) return null;
  const lower = miniSlug.toLowerCase();
  return (
    miniCategories.find(
      (m) => m.subcategory_id === subcategoryId && (m.slug.toLowerCase() === lower || m.id === miniSlug),
    ) ?? null
  );
}

type CatalogueData = {
  categories: CatalogueCategory[];
  subcategories: CatalogueSubcategory[];
  miniCategories: CatalogueMiniCategory[];
  courses: CatalogueCourse[];
};

const NO_CATEGORIES: CatalogueCategory[] = [];
const NO_SUBCATEGORIES: CatalogueSubcategory[] = [];
const NO_MINI_CATEGORIES: CatalogueMiniCategory[] = [];
const NO_COURSES: CatalogueCourse[] = [];

/*
 * Everything the catalogue shows, in one request chain: the active Ayadi
 * Cloudversity brand, then its categories, subcategories, mini-categories and
 * published courses. Cached as one entry (src/lib/query), so the page opens
 * from the cache on a later visit or refresh. The navbar's enrolment form
 * reads the same entry for its course list.
 */
export async function loadCatalogue(): Promise<CatalogueData> {
  // 1. Fetch active brands and dynamically resolve Ayadi Cloudversity
  const brands = await getCourseBrands();
  const activeBrands = brands.filter((b) => b.is_active);

  // Preferred match is slug 'ayadicloudveristy' (verified DB slug), with fallbacks
  const ayadiBrand = activeBrands.find(
    (b) =>
      b.slug === 'ayadicloudveristy' ||
      b.slug === 'ayadi' ||
      b.name.toLowerCase().includes('cloudversity'),
  );

  if (!ayadiBrand) {
    throw new Error('Ayadi Cloudversity brand not found or inactive.');
  }

  // 2. Concurrently fetch categories, subcategories, mini-categories, and published courses
  const [fetchedCategories, fetchedSubcategories, fetchedMiniCategories, fetchedCourses] = await Promise.all([
    getCategories(ayadiBrand.id),
    getSubcategories(),
    getMiniCategories(),
    getCourses({ brand_id: ayadiBrand.id, is_published: true }),
  ]);

  // Filter active categories for this brand and sort by display_order
  const categories: CatalogueCategory[] = fetchedCategories
    .filter((c) => c.is_active && c.brand_id === ayadiBrand.id)
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      display_order: c.display_order,
    }));

  const activeCategoryIds = new Set(categories.map((c) => c.id));

  // Filter active subcategories belonging to active categories
  const subcategories: CatalogueSubcategory[] = fetchedSubcategories
    .filter((s) => s.is_active && activeCategoryIds.has(s.category_id))
    .sort((a, b) => a.display_order - b.display_order)
    .map((s) => ({
      id: s.id,
      category_id: s.category_id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      display_order: s.display_order,
    }));

  const activeSubcategoryIds = new Set(subcategories.map((s) => s.id));

  // Filter active mini-categories belonging to active subcategories
  const miniCategories: CatalogueMiniCategory[] = fetchedMiniCategories
    .filter((m) => m.is_active && activeSubcategoryIds.has(m.subcategory_id))
    .sort((a, b) => a.display_order - b.display_order)
    .map((m) => ({
      id: m.id,
      subcategory_id: m.subcategory_id,
      slug: m.slug,
      name: m.name,
      description: m.description,
      display_order: m.display_order,
    }));

  // Normalize courses to CatalogueCourse
  return { categories, subcategories, miniCategories, courses: fetchedCourses.map(mapCourseToCatalogueCourse) };
}

/*
 * The catalogue's state, powered by the live FastAPI backend.
 *
 * Dynamically resolves the active Ayadi Cloudversity brand, its categories,
 * subcategories, and published courses. Provides responsive client-side
 * multi-term search, category counts, subcategory filtering, and URL parameter
 * synchronisation.
 */
export function useCourseCatalogue() {
  const [query, setQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(null);
  const [activeMiniCategoryId, setActiveMiniCategoryId] = useState<string | null>(null);

  const catalogue = useQuery({ queryKey: publicKeys.catalogue, queryFn: loadCatalogue });

  const categories = catalogue.data?.categories ?? NO_CATEGORIES;
  const allSubcategories = catalogue.data?.subcategories ?? NO_SUBCATEGORIES;
  const allMiniCategories = catalogue.data?.miniCategories ?? NO_MINI_CATEGORIES;
  const rawCourses = catalogue.data?.courses ?? NO_COURSES;

  /* Nothing to show yet — restoring from the cache, the first fetch, or a retry. */
  const loading = catalogue.isPending || (catalogue.isFetching && !catalogue.data);
  /* A failed background refresh keeps the cached catalogue on screen; only a
     catalogue that never loaded is an error. */
  const error =
    catalogue.isError && !catalogue.data && !catalogue.isFetching
      ? getApiErrorMessage(catalogue.error, 'Unable to load course catalogue. Please try again.')
      : null;

  const categoriesRef = useRef<CatalogueCategory[]>([]);
  const subcategoriesRef = useRef<CatalogueSubcategory[]>([]);
  const miniCategoriesRef = useRef<CatalogueMiniCategory[]>([]);
  const [resolvedInitialParams, setResolvedInitialParams] = useState(false);

  const search = query.trim();

  /* =========================================================
     CATALOGUE LOADED
  ========================================================= */

  useEffect(() => {
    if (catalogue.error && !catalogue.data) console.error('Failed to load course catalogue:', catalogue.error);
  }, [catalogue.error, catalogue.data]);

  useEffect(() => {
    if (!catalogue.data) return;
    categoriesRef.current = catalogue.data.categories;
    subcategoriesRef.current = catalogue.data.subcategories;
    miniCategoriesRef.current = catalogue.data.miniCategories ?? NO_MINI_CATEGORIES;
  }, [catalogue.data]);

  /* Resolve any initial URL parameters the first time the catalogue is there —
     adjusted during render rather than in an effect, so the first painted frame
     already shows the linked category. The data only ever arrives in the
     browser, so `window` is safe here. */
  if (catalogue.data && !resolvedInitialParams) {
    setResolvedInitialParams(true);

    const currentParams = new URL(window.location.href).searchParams;
    const initialCategorySlug = currentParams.get(CATEGORY_PARAM);
    const initialSubcategorySlug = currentParams.get(SUBCATEGORY_PARAM);
    const initialMiniCategorySlug = currentParams.get(MINI_CATEGORY_PARAM);

    if (initialCategorySlug) {
      const matchedCategory = findCategoryInList(catalogue.data.categories, initialCategorySlug);
      if (matchedCategory) {
        setActiveCategoryId(matchedCategory.id);
        const matchedSub = findSubcategoryInList(
          catalogue.data.subcategories,
          matchedCategory.id,
          initialSubcategorySlug,
        );
        setActiveSubcategoryId(matchedSub?.id ?? null);
        const matchedMini = matchedSub
          ? findMiniCategoryInList(
              catalogue.data.miniCategories ?? NO_MINI_CATEGORIES,
              matchedSub.id,
              initialMiniCategorySlug,
            )
          : null;
        setActiveMiniCategoryId(matchedMini?.id ?? null);
      }
    }
  }

  /* Available subcategories under the currently selected main category */
  const subcategories = useMemo(
    () => (activeCategoryId ? allSubcategories.filter((s) => s.category_id === activeCategoryId) : []),
    [activeCategoryId, allSubcategories],
  );

  /* Available mini-categories under the currently selected subcategory */
  const miniCategories = useMemo(
    () => (activeSubcategoryId ? allMiniCategories.filter((m) => m.subcategory_id === activeSubcategoryId) : []),
    [activeSubcategoryId, allMiniCategories],
  );

  /* =========================================================
     FILTERING & SEARCH
  ========================================================= */

  /* Search across all published courses */
  const searchMatches = useMemo(() => filterCourses(rawCourses, categories, { search }), [rawCourses, categories, search]);

  /* Courses matching search within the active main category (before subcategory filter) */
  const categoryMatches = useMemo(
    () => filterCourses(searchMatches, categories, { category_id: activeCategoryId ?? undefined }),
    [searchMatches, categories, activeCategoryId],
  );

  /* Live course counts per subcategory under the active category */
  const subcategoryCounts = useMemo(() => countBySubcategory(categoryMatches), [categoryMatches]);

  /* Courses matching search within the active subcategory (before mini-category filter) */
  const subcategoryMatches = useMemo(
    () =>
      filterCourses(categoryMatches, categories, {
        subcategory_id: activeSubcategoryId ?? undefined,
      }),
    [categoryMatches, categories, activeSubcategoryId],
  );

  /* Live course counts per mini-category under the active subcategory */
  const miniCategoryCounts = useMemo(() => countByMiniCategory(subcategoryMatches), [subcategoryMatches]);

  /* Final courses displayed in the catalogue grid: category, subcategory and mini-category applied */
  const courses = useMemo(
    () =>
      filterCourses(subcategoryMatches, categories, {
        mini_category_id: activeMiniCategoryId ?? undefined,
      }),
    [subcategoryMatches, categories, activeMiniCategoryId],
  );

  const counts = useMemo(() => countByCategory(searchMatches), [searchMatches]);

  /* =========================================================
     NAVIGATION HANDLERS
  ========================================================= */

  const selectCategory = useCallback((category: CatalogueCategory | null) => {
    setActiveCategoryId(category?.id ?? null);
    setActiveSubcategoryId(null);
    setActiveMiniCategoryId(null);

    const url = new URL(window.location.href);

    if (category) url.searchParams.set(CATEGORY_PARAM, category.slug);
    else url.searchParams.delete(CATEGORY_PARAM);

    url.searchParams.delete(SUBCATEGORY_PARAM);
    url.searchParams.delete(MINI_CATEGORY_PARAM);

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const selectSubcategory = useCallback((subcategory: CatalogueSubcategory | null) => {
    setActiveSubcategoryId(subcategory?.id ?? null);
    setActiveMiniCategoryId(null);

    const url = new URL(window.location.href);

    if (subcategory) url.searchParams.set(SUBCATEGORY_PARAM, subcategory.slug);
    else url.searchParams.delete(SUBCATEGORY_PARAM);

    url.searchParams.delete(MINI_CATEGORY_PARAM);

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const selectMiniCategory = useCallback((miniCategory: CatalogueMiniCategory | null) => {
    setActiveMiniCategoryId(miniCategory?.id ?? null);

    const url = new URL(window.location.href);

    if (miniCategory) url.searchParams.set(MINI_CATEGORY_PARAM, miniCategory.slug);
    else url.searchParams.delete(MINI_CATEGORY_PARAM);

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const applyParams = useCallback(({ categorySlug, subcategorySlug, miniCategorySlug }: CatalogueParams) => {
    const matchedCategory = categorySlug ? findCategoryInList(categoriesRef.current, categorySlug) : null;
    const matchedSub = matchedCategory
      ? findSubcategoryInList(subcategoriesRef.current, matchedCategory.id, subcategorySlug)
      : null;
    const matchedMini = matchedSub
      ? findMiniCategoryInList(miniCategoriesRef.current, matchedSub.id, miniCategorySlug)
      : null;

    setActiveCategoryId(matchedCategory?.id ?? null);
    setActiveSubcategoryId(matchedSub?.id ?? null);
    setActiveMiniCategoryId(matchedMini?.id ?? null);
  }, []);

  const applyCategorySlug = useCallback(
    (slug: string | null) => {
      applyParams({ categorySlug: slug, subcategorySlug: null, miniCategorySlug: null });
    },
    [applyParams],
  );

  const clearSubcategory = useCallback(() => selectSubcategory(null), [selectSubcategory]);

  const clearMiniCategory = useCallback(() => selectMiniCategory(null), [selectMiniCategory]);

  const clearSearch = useCallback(() => setQuery(''), []);

  const reset = useCallback(() => {
    setQuery('');
    selectCategory(null);
  }, [selectCategory]);

  const { refetch } = catalogue;
  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    categories,
    subcategories,
    /** Mini-categories of the active subcategory — empty when it has none. */
    miniCategories,
    /** What the grid shows: all filters applied. */
    courses,
    /** Matches for the current search in each category, by category id. */
    counts,
    /** Matches for the current search in each subcategory, by subcategory id. */
    subcategoryCounts,
    /** Matches for the current search in each mini-category, by mini-category id. */
    miniCategoryCounts,
    /** Matches for the current search across every category. */
    matchCount: searchMatches.length,
    /** Matches for the current search in the active main category (subcategory 'All' count). */
    activeCategoryTotalCount: categoryMatches.length,
    /** Matches for the current search in the active subcategory (mini-category 'All' count). */
    activeSubcategoryTotalCount: subcategoryMatches.length,
    query,
    setQuery,
    /** `query`, trimmed — empty when there is nothing to search for. */
    search,
    activeCategory: categories.find((c) => c.id === activeCategoryId) ?? null,
    activeSubcategory: allSubcategories.find((s) => s.id === activeSubcategoryId) ?? null,
    activeMiniCategory: allMiniCategories.find((m) => m.id === activeMiniCategoryId) ?? null,
    loading,
    error,
    retry,
    selectCategory,
    selectSubcategory,
    selectMiniCategory,
    clearSubcategory,
    clearMiniCategory,
    applyCategorySlug,
    applyParams,
    clearSearch,
    reset,
  };
}

/*
 * Carries `/courses?category=…&subcategory=…&mini=…` into the catalogue — on
 * arrival, and again whenever a link changes it while the page is open.
 *
 * A component rather than part of the hook so it can sit in a Suspense
 * boundary of its own: reading the query string opts whatever renders it out
 * of the prerender, and this way that is only this, not the page.
 */
export function CategoryParam({ onChange }: { onChange: (params: CatalogueParams) => void }) {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get(CATEGORY_PARAM);
  const subcategorySlug = searchParams.get(SUBCATEGORY_PARAM);
  const miniCategorySlug = searchParams.get(MINI_CATEGORY_PARAM);

  /* Before paint, so arriving from a category link never shows a frame of the
     unfiltered grid first. */
  useIsomorphicLayoutEffect(() => {
    onChange({ categorySlug, subcategorySlug, miniCategorySlug });
  }, [categorySlug, subcategorySlug, miniCategorySlug, onChange]);

  return null;
}
