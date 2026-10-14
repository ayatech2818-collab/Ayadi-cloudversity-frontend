'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { categoryById, categoryBySlug, courseCategories } from './categories';
import { ayadiCourses } from './dummyData';
import { countByCategory, countBySubcategory, filterCourses } from './filterCourses';
import { subcategoriesByCategoryId, subcategoryById, subcategoryBySlug } from './subcategories';
import type { CatalogueCategory, CatalogueSubcategory } from './types';

/* useLayoutEffect warns during SSR — same swap as CoursesIntro. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* The query parameters used by URL deep-linking */
const CATEGORY_PARAM = 'category';
const SUBCATEGORY_PARAM = 'subcategory';

const categories = [...courseCategories].sort((a, b) => a.display_order - b.display_order);

/*
 * The catalogue's state, and everything worked out from it.
 *
 * This is the seam for the backend: the components below it take what this
 * returns as props and know nothing about where it came from. Today that is
 * the dummy data, filtered here; later the imports above become
 * `getCategories()` / `getSubcategories()` / `getCourses()` requests, with
 * `search`, `category_id`, and `subcategory_id` sent as query parameters,
 * and the return value keeps its shape.
 */
export function useCourseCatalogue() {
  const [query, setQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(null);

  const search = query.trim();

  /* Available subcategories under the currently selected main category */
  const subcategories = useMemo(
    () => (activeCategoryId ? subcategoriesByCategoryId(activeCategoryId) : []),
    [activeCategoryId],
  );

  /* Search first, category second, so the category tiles can count what the
     search turns up in each of them. */
  const searchMatches = useMemo(() => filterCourses(ayadiCourses, categories, { search }), [search]);

  /* Courses matching search within the active main category (before subcategory filter) */
  const categoryMatches = useMemo(
    () => filterCourses(searchMatches, categories, { category_id: activeCategoryId ?? undefined }),
    [searchMatches, activeCategoryId],
  );

  /* Live course counts per subcategory under the active category */
  const subcategoryCounts = useMemo(() => countBySubcategory(categoryMatches), [categoryMatches]);

  /* Final courses displayed in the catalogue grid: both category and subcategory applied */
  const courses = useMemo(
    () =>
      filterCourses(categoryMatches, categories, {
        subcategory_id: activeSubcategoryId ?? undefined,
      }),
    [categoryMatches, activeSubcategoryId],
  );

  const counts = useMemo(() => countByCategory(searchMatches), [searchMatches]);

  /* Writes the category choice into the address as well, so a filtered view can be
     shared and a footer category link always registers as a change. Native
     history rather than the router: Next keeps useSearchParams in step with
     it, and nothing is re-requested.
     Switching main category always resets subcategory selection to All. */
  const selectCategory = useCallback((category: CatalogueCategory | null) => {
    setActiveCategoryId(category?.id ?? null);
    setActiveSubcategoryId(null);

    const url = new URL(window.location.href);

    if (category) url.searchParams.set(CATEGORY_PARAM, category.slug);
    else url.searchParams.delete(CATEGORY_PARAM);

    url.searchParams.delete(SUBCATEGORY_PARAM);

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  /* Sets active subcategory within the current main category */
  const selectSubcategory = useCallback((subcategory: CatalogueSubcategory | null) => {
    setActiveSubcategoryId(subcategory?.id ?? null);

    const url = new URL(window.location.href);

    if (subcategory) url.searchParams.set(SUBCATEGORY_PARAM, subcategory.slug);
    else url.searchParams.delete(SUBCATEGORY_PARAM);

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  /* Handles URL parameters on arrival and browser navigation */
  const applyParams = useCallback(
    ({ categorySlug, subcategorySlug }: { categorySlug: string | null; subcategorySlug: string | null }) => {
      const category = categoryBySlug(categorySlug);
      if (category) {
        setActiveCategoryId(category.id);

        const subcategory = subcategoryBySlug(subcategorySlug);
        if (subcategory && subcategory.category_id === category.id) {
          setActiveSubcategoryId(subcategory.id);
        } else {
          setActiveSubcategoryId(null);
        }
      } else {
        setActiveCategoryId(null);
        setActiveSubcategoryId(null);
      }
    },
    [],
  );

  /* An unknown slug falls back to all courses */
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
    activeCategory: (activeCategoryId && categoryById(activeCategoryId)) || null,
    activeSubcategory: (activeSubcategoryId && subcategoryById(activeSubcategoryId)) || null,
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
