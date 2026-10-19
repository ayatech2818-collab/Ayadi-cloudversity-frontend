'use client';

import { Suspense, useCallback, useState } from 'react';

import { LazyEnrollmentModal } from '@/components/website/enrollment/LazyEnrollmentModal';
import GetStartedCta from '@/components/website/sections/GetStartedCta';
import { releaseScroll } from '@/lib/smooth-scroll';

import { CourseCatalogue } from './CourseCatalogue';
import { CourseCategoryNav } from './CourseCategoryNav';
import { CourseSubcategoryNav } from './CourseSubcategoryNav';
import { CoursesIntro } from './CoursesIntro';
import type { CatalogueCategory, CatalogueCourse } from './types';
import { CategoryParam, useCourseCatalogue } from './useCourseCatalogue';

const scrollToCatalogue = () => {
  releaseScroll();
  document.getElementById('catalogue')?.scrollIntoView({ block: 'start' });
};

/*
 * The Courses page: Ayadi Cloudversity's catalogue.
 *
 * Everything the page knows comes from useCourseCatalogue; the sections
 * are handed their slice of it and nothing else, so this file is the only
 * place that changes when the hook starts talking to the API.
 */
export function CoursesPageContent() {
  const catalogue = useCourseCatalogue();
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [enrollingCourse, setEnrollingCourse] = useState<CatalogueCourse | null>(null);

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

  const openEnrollment = useCallback((course?: CatalogueCourse) => {
    setEnrollingCourse(course ?? null);
    setIsEnrollOpen(true);
  }, []);
  const closeEnrollment = useCallback(() => {
    setIsEnrollOpen(false);
    setEnrollingCourse(null);
  }, []);

  return (
    <main>
      {/* Follows /courses?category=…&subcategory=… — see the note on CategoryParam */}
      <Suspense fallback={null}>
        <CategoryParam onChange={catalogue.applyParams} />
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
      <div className="pb-60 sm:pb-60 md:pb-82 lg:pb-70">
        <div>
          <CourseCategoryNav
            categories={catalogue.categories}
            counts={catalogue.counts}
            total={catalogue.matchCount}
            activeCategory={catalogue.activeCategory}
            onSelect={switchCategory}
          />

          {catalogue.activeCategory && catalogue.subcategories.length > 0 ? (
            <CourseSubcategoryNav
              subcategories={catalogue.subcategories}
              activeSubcategory={catalogue.activeSubcategory}
              counts={catalogue.subcategoryCounts}
              totalCount={catalogue.activeCategoryTotalCount}
              onSelect={catalogue.selectSubcategory}
            />
          ) : null}

          <CourseCatalogue
            courses={catalogue.courses}
            categories={catalogue.categories}
            activeCategory={catalogue.activeCategory}
            activeSubcategory={catalogue.activeSubcategory}
            search={catalogue.search}
            matchCount={catalogue.matchCount}
            onClearCategory={() => switchCategory(null)}
            onClearSubcategory={catalogue.clearSubcategory}
            onClearSearch={catalogue.clearSearch}
            onReset={catalogue.reset}
            onEnroll={openEnrollment}
            loading={catalogue.loading}
            error={catalogue.error}
            onRetry={catalogue.retry}
          />
        </div>
      </div>

      {/* Overlaps the footer below it — see the note in GetStartedCta.tsx */}
      <GetStartedCta />

      <LazyEnrollmentModal
        isOpen={isEnrollOpen}
        onClose={closeEnrollment}
        courseTitle={enrollingCourse?.title}
        courseId={enrollingCourse?.id}
      />
    </main>
  );
}
