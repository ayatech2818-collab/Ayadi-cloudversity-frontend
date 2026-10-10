'use client';

import { Suspense, useCallback, useState } from 'react';

import { EnrollmentModal } from '@/components/website/enrollment/EnrollmentModal';
import GetStartedCta from '@/components/website/sections/GetStartedCta';

import { CourseCatalogue } from './CourseCatalogue';
import { CourseCategoryNav } from './CourseCategoryNav';
import { CoursesIntro } from './CoursesIntro';
import type { CatalogueCategory } from './types';
import { CategoryParam, useCourseCatalogue } from './useCourseCatalogue';

const scrollToCatalogue = () => {
  document.getElementById('catalogue')?.scrollIntoView({ block: 'start' });
};

/*
 * The Courses page: Ayadi Cloudversity's catalogue, and only that. AyaTech and
 * Ayadi Glocal School are not listed here.
 *
 * Everything the page knows comes from useCourseCatalogue; the three sections
 * are handed their slice of it and nothing else, so this file is the only
 * place that changes when the hook starts talking to the API.
 */
export function CoursesPageContent() {
  const catalogue = useCourseCatalogue();
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);

  const { selectCategory } = catalogue;

  /* Switching from the sticky tabs while part-way down a list would leave you
     looking at wherever the old list happened to be scrolled to — so if the
     top of the results has already gone under the tabs, bring it back. The
     section's own scroll margin is the measure of "under the tabs". */
  const switchCategory = useCallback(
    (category: CatalogueCategory | null) => {
      selectCategory(category);

      const section = document.getElementById('catalogue');
      if (!section) return;

      const tabsBottom = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
      if (section.getBoundingClientRect().top < tabsBottom) scrollToCatalogue();
    },
    [selectCategory],
  );

  const openEnrollment = useCallback(() => setIsEnrollOpen(true), []);
  const closeEnrollment = useCallback(() => setIsEnrollOpen(false), []);

  return (
    <main>
      {/* Follows /courses?category=… — see the note on CategoryParam */}
      <Suspense fallback={null}>
        <CategoryParam onChange={catalogue.applyCategorySlug} />
      </Suspense>

      {/* GSAP-driven. Submitting the search carries you down to the results:
          the grid filters as you type, so on a wide screen that is a nicety,
          and on a phone it is how you get to see them. */}
      <CoursesIntro
        categories={catalogue.categories}
        query={catalogue.query}
        onQueryChange={catalogue.setQuery}
        onSearchSubmit={scrollToCatalogue}
      />

      {/* The padding is the room GetStartedCta needs: it pulls itself up over
          whatever is above it by a negative margin. It sits outside the inner
          wrapper because that wrapper is what the tabs are sticky within —
          they should let go where the grid ends, not ride over the card. */}
      <div className="pb-60 md:pb-82 lg:pb-70">
        <div>
          <CourseCategoryNav
            categories={catalogue.categories}
            counts={catalogue.counts}
            total={catalogue.matchCount}
            activeCategory={catalogue.activeCategory}
            onSelect={switchCategory}
          />

          <CourseCatalogue
            courses={catalogue.courses}
            categories={catalogue.categories}
            activeCategory={catalogue.activeCategory}
            search={catalogue.search}
            matchCount={catalogue.matchCount}
            onClearCategory={() => switchCategory(null)}
            onClearSearch={catalogue.clearSearch}
            onReset={catalogue.reset}
            onEnroll={openEnrollment}
          />
        </div>
      </div>

      {/* Overlaps the footer below it — see the note in GetStartedCta.tsx */}
      <GetStartedCta />

      <EnrollmentModal isOpen={isEnrollOpen} onClose={closeEnrollment} />
    </main>
  );
}
