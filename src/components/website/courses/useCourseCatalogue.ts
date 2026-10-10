'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { categoryById, categoryBySlug, courseCategories } from './categories';
import { ayadiCourses } from './dummyData';
import { countByCategory, filterCourses } from './filterCourses';
import type { CatalogueCategory } from './types';

/* useLayoutEffect warns during SSR — same swap as CoursesIntro. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* The parameter the footer's category links already use. */
const CATEGORY_PARAM = 'category';

const categories = [...courseCategories].sort((a, b) => a.display_order - b.display_order);

/*
 * The catalogue's state, and everything worked out from it.
 *
 * This is the seam for the backend: the components below it take what this
 * returns as props and know nothing about where it came from. Today that is
 * the dummy data, filtered here; later the two imports above become
 * `getCategories()` / `getCourses()` requests, with `search` and the category
 * id sent as query parameters, and the return value keeps its shape.
 */
export function useCourseCatalogue() {
  const [query, setQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const search = query.trim();

  /* Search first, category second, so the category tiles can count what the
     search turns up in each of them. */
  const searchMatches = useMemo(() => filterCourses(ayadiCourses, categories, { search }), [search]);

  const courses = useMemo(
    () => filterCourses(searchMatches, categories, { category_id: activeCategoryId ?? undefined }),
    [searchMatches, activeCategoryId],
  );

  const counts = useMemo(() => countByCategory(searchMatches), [searchMatches]);

  /* Writes the choice into the address as well, so a filtered view can be
     shared and a footer category link always registers as a change. Native
     history rather than the router: Next keeps useSearchParams in step with
     it, and nothing is re-requested. */
  const selectCategory = useCallback((category: CatalogueCategory | null) => {
    setActiveCategoryId(category?.id ?? null);

    const url = new URL(window.location.href);

    if (category) url.searchParams.set(CATEGORY_PARAM, category.slug);
    else url.searchParams.delete(CATEGORY_PARAM);

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  /* An unknown slug falls back to all courses. */
  const applyCategorySlug = useCallback((slug: string | null) => {
    setActiveCategoryId(categoryBySlug(slug)?.id ?? null);
  }, []);

  const clearSearch = useCallback(() => setQuery(''), []);

  const reset = useCallback(() => {
    setQuery('');
    selectCategory(null);
  }, [selectCategory]);

  return {
    categories,
    /** What the grid shows: both filters applied. */
    courses,
    /** Matches for the current search in each category, by category id. */
    counts,
    /** Matches for the current search across every category. */
    matchCount: searchMatches.length,
    query,
    setQuery,
    /** `query`, trimmed — empty when there is nothing to search for. */
    search,
    activeCategory: (activeCategoryId && categoryById(activeCategoryId)) || null,
    selectCategory,
    applyCategorySlug,
    clearSearch,
    reset,
  };
}

/*
 * Carries `/courses?category=…` into the catalogue — on arrival, and again
 * whenever a link changes it while the page is open.
 *
 * A component rather than part of the hook so it can sit in a Suspense
 * boundary of its own: reading the query string opts whatever renders it out
 * of the prerender, and this way that is only this, not the page.
 */
export function CategoryParam({ onChange }: { onChange: (slug: string | null) => void }) {
  const slug = useSearchParams().get(CATEGORY_PARAM);

  /* Before paint, so arriving from a category link never shows a frame of the
     unfiltered grid first. */
  useIsomorphicLayoutEffect(() => {
    onChange(slug);
  }, [slug, onChange]);

  return null;
}
