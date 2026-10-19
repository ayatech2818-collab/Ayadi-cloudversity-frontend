'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { getCourseBrands } from '@/lib/api/course-brands';
import { getCategories } from '@/lib/api/course-categories';
import { getSubcategories } from '@/lib/api/course-subcategories';
import { getCourses } from '@/lib/api/courses';
import { getApiErrorMessage } from '@/lib/api/errors';

import { countByCategory, countBySubcategory, filterCourses } from './filterCourses';
import {
  mapCourseToCatalogueCourse,
  type CatalogueCategory,
  type CatalogueCourse,
  type CatalogueSubcategory,
} from './types';

/* useLayoutEffect warns during SSR — same swap as CoursesIntro. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* The query parameters used by URL deep-linking */
const CATEGORY_PARAM = 'category';
const SUBCATEGORY_PARAM = 'subcategory';

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

  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<CatalogueSubcategory[]>([]);
  const [rawCourses, setRawCourses] = useState<CatalogueCourse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const categoriesRef = useRef<CatalogueCategory[]>([]);
  const subcategoriesRef = useRef<CatalogueSubcategory[]>([]);

  const search = query.trim();

  /* =========================================================
     FETCH LIVE DATA FROM BACKEND
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadCatalogueData = async () => {
      try {
        setLoading(true);
        setError(null);

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

        // 2. Concurrently fetch categories, subcategories, and published courses
        const [fetchedCategories, fetchedSubcategories, fetchedCourses] = await Promise.all([
          getCategories(ayadiBrand.id),
          getSubcategories(),
          getCourses({ brand_id: ayadiBrand.id, is_published: true }),
        ]);

        if (cancelled) return;

        // Filter active categories for this brand and sort by display_order
        const activeCategories: CatalogueCategory[] = fetchedCategories
          .filter((c) => c.is_active && c.brand_id === ayadiBrand.id)
          .sort((a, b) => a.display_order - b.display_order)
          .map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            description: c.description,
            display_order: c.display_order,
          }));

        const activeCategoryIds = new Set(activeCategories.map((c) => c.id));

        // Filter active subcategories belonging to active categories
        const activeSubcategories: CatalogueSubcategory[] = fetchedSubcategories
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

        // Normalize courses to CatalogueCourse
        const normalizedCourses = fetchedCourses.map(mapCourseToCatalogueCourse);

        categoriesRef.current = activeCategories;
        subcategoriesRef.current = activeSubcategories;

        setCategories(activeCategories);
        setAllSubcategories(activeSubcategories);
        setRawCourses(normalizedCourses);
        setError(null);

        // Resolve any initial URL parameters on first load
        if (typeof window !== 'undefined') {
          const currentParams = new URL(window.location.href).searchParams;
          const initialCategorySlug = currentParams.get(CATEGORY_PARAM);
          const initialSubcategorySlug = currentParams.get(SUBCATEGORY_PARAM);

          if (initialCategorySlug) {
            const matchedCategory = findCategoryInList(activeCategories, initialCategorySlug);
            if (matchedCategory) {
              setActiveCategoryId(matchedCategory.id);
              const matchedSub = findSubcategoryInList(
                activeSubcategories,
                matchedCategory.id,
                initialSubcategorySlug,
              );
              setActiveSubcategoryId(matchedSub?.id ?? null);
            }
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load course catalogue:', err);
        setError(getApiErrorMessage(err, 'Unable to load course catalogue. Please try again.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCatalogueData();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  /* Available subcategories under the currently selected main category */
  const subcategories = useMemo(
    () => (activeCategoryId ? allSubcategories.filter((s) => s.category_id === activeCategoryId) : []),
    [activeCategoryId, allSubcategories],
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

  /* Final courses displayed in the catalogue grid: both category and subcategory applied */
  const courses = useMemo(
    () =>
      filterCourses(categoryMatches, categories, {
        subcategory_id: activeSubcategoryId ?? undefined,
      }),
    [categoryMatches, categories, activeSubcategoryId],
  );

  const counts = useMemo(() => countByCategory(searchMatches), [searchMatches]);

  /* =========================================================
     NAVIGATION HANDLERS
  ========================================================= */

  const selectCategory = useCallback((category: CatalogueCategory | null) => {
    setActiveCategoryId(category?.id ?? null);
    setActiveSubcategoryId(null);

    const url = new URL(window.location.href);

    if (category) url.searchParams.set(CATEGORY_PARAM, category.slug);
    else url.searchParams.delete(CATEGORY_PARAM);

    url.searchParams.delete(SUBCATEGORY_PARAM);

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const selectSubcategory = useCallback((subcategory: CatalogueSubcategory | null) => {
    setActiveSubcategoryId(subcategory?.id ?? null);

    const url = new URL(window.location.href);

    if (subcategory) url.searchParams.set(SUBCATEGORY_PARAM, subcategory.slug);
    else url.searchParams.delete(SUBCATEGORY_PARAM);

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const applyParams = useCallback(
    ({ categorySlug, subcategorySlug }: { categorySlug: string | null; subcategorySlug: string | null }) => {
      if (!categorySlug) {
        setActiveCategoryId(null);
        setActiveSubcategoryId(null);
        return;
      }

      const matchedCategory = findCategoryInList(categoriesRef.current, categorySlug);
      if (matchedCategory) {
        setActiveCategoryId(matchedCategory.id);
        const matchedSub = findSubcategoryInList(
          subcategoriesRef.current,
          matchedCategory.id,
          subcategorySlug,
        );
        setActiveSubcategoryId(matchedSub?.id ?? null);
      } else {
        setActiveCategoryId(null);
        setActiveSubcategoryId(null);
      }
    },
    [],
  );

  const applyCategorySlug = useCallback(
    (slug: string | null) => {
      applyParams({ categorySlug: slug, subcategorySlug: null });
    },
    [applyParams],
  );

  const clearSubcategory = useCallback(() => selectSubcategory(null), [selectSubcategory]);

  const clearSearch = useCallback(() => setQuery(''), []);

  const reset = useCallback(() => {
    setQuery('');
    selectCategory(null);
  }, [selectCategory]);

  const retry = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  return {
    categories,
    subcategories,
    /** What the grid shows: all filters applied. */
    courses,
    /** Matches for the current search in each category, by category id. */
    counts,
    /** Matches for the current search in each subcategory, by subcategory id. */
    subcategoryCounts,
    /** Matches for the current search across every category. */
    matchCount: searchMatches.length,
    /** Matches for the current search in the active main category (subcategory 'All' count). */
    activeCategoryTotalCount: categoryMatches.length,
    query,
    setQuery,
    /** `query`, trimmed — empty when there is nothing to search for. */
    search,
    activeCategory: categories.find((c) => c.id === activeCategoryId) ?? null,
    activeSubcategory: allSubcategories.find((s) => s.id === activeSubcategoryId) ?? null,
    loading,
    error,
    retry,
    selectCategory,
    selectSubcategory,
    clearSubcategory,
    applyCategorySlug,
    applyParams,
    clearSearch,
    reset,
  };
}

/*
 * Carries `/courses?category=…&subcategory=…` into the catalogue — on arrival,
 * and again whenever a link changes it while the page is open.
 *
 * A component rather than part of the hook so it can sit in a Suspense
 * boundary of its own: reading the query string opts whatever renders it out
 * of the prerender, and this way that is only this, not the page.
 */
export function CategoryParam({
  onChange,
}: {
  onChange: (params: { categorySlug: string | null; subcategorySlug: string | null }) => void;
}) {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get(CATEGORY_PARAM);
  const subcategorySlug = searchParams.get(SUBCATEGORY_PARAM);

  /* Before paint, so arriving from a category link never shows a frame of the
     unfiltered grid first. */
  useIsomorphicLayoutEffect(() => {
    onChange({ categorySlug, subcategorySlug });
  }, [categorySlug, subcategorySlug, onChange]);

  return null;
}
