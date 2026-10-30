'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, BookOpen, SearchX, X } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { CourseCard } from './CourseCard';
import type { CatalogueCategory, CatalogueCourse, CatalogueMiniCategory, CatalogueSubcategory } from './types';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PRIMARY_ACTION =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-primary px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white transition-colors duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const SECONDARY_ACTION =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-muted ring-1 ring-inset ring-border transition-colors duration-300 hover:text-primary hover:ring-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/*
 * The results: what is being shown, and the grid.
 *
 * Presentation only. It is handed an already-filtered list and the callbacks
 * that undo each filter, and never looks at the catalogue itself — so it does
 * not change when the list starts coming from the API.
 *
 * The category is not repeated as a chip here: the sticky tabs above already
 * say which one is chosen and are where you change it.
 */
export function CourseCatalogue({
  courses,
  categories,
  activeCategory,
  activeSubcategory,
  activeMiniCategory,
  search,
  matchCount,
  onClearCategory,
  onClearSubcategory,
  onClearMiniCategory,
  onClearSearch,
  onReset,
  onEnroll,
  loading = false,
  error = null,
  onRetry,
}: {
  courses: CatalogueCourse[];
  categories: CatalogueCategory[];
  activeCategory: CatalogueCategory | null;
  activeSubcategory?: CatalogueSubcategory | null;
  activeMiniCategory?: CatalogueMiniCategory | null;
  search: string;
  /** Matches for the search across every category, which tells the empty
      state whether looking wider would help. */
  matchCount: number;
  onClearCategory: () => void;
  onClearSubcategory?: () => void;
  onClearMiniCategory?: () => void;
  onClearSearch: () => void;
  onReset: () => void;
  onEnroll: (course: CatalogueCourse) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const reduceMotion = useReducedMotion();

  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return (
    /* scroll-mt clears the navbar and the sticky tabs together */
    <section
      id="catalogue"
      aria-labelledby="catalogue-heading"
      className="scroll-mt-36 px-3 pt-5 sm:scroll-mt-40 sm:px-8 sm:pt-8 lg:px-16 lg:pt-10"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-4 sm:gap-y-3">
            <h2
              id="catalogue-heading"
              className="text-base font-bold tracking-tight text-accent sm:text-2xl sm:font-semibold sm:tracking-[-0.03em]"
            >
              {activeCategory
                ? [activeCategory.name, activeSubcategory?.name, activeMiniCategory?.name]
                    .filter(Boolean)
                    .join(' — ')
                : 'All courses'}
            </h2>

            {search ? <SearchChip search={search} onClear={onClearSearch} /> : null}
          </div>

          <p aria-live="polite" className="text-xs text-muted sm:text-sm">
            {loading ? 'Loading courses…' : `${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`}
          </p>
        </div>

        {loading ? (
          <div className="relative mt-4 sm:mt-7 grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="flex flex-col overflow-hidden max-sm:rounded-xl rounded-2xl bg-surface ring-1 ring-inset ring-border animate-pulse"
              >
                <div className="aspect-[16/10] bg-muted/10" />
                <div className="flex flex-1 flex-col p-2.5 min-[380px]:p-3 sm:p-6 space-y-2 sm:space-y-3">
                  <div className="h-2.5 sm:h-3 w-16 sm:w-24 rounded bg-muted/15" />
                  <div className="h-3.5 sm:h-5 w-3/4 rounded bg-muted/20" />
                  <div className="h-3 sm:h-4 w-full rounded bg-muted/10 hidden sm:block" />
                  <div className="h-3 sm:h-4 w-2/3 rounded bg-muted/10" />
                  <div className="mt-auto pt-2.5 sm:pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="h-2.5 sm:h-3 w-14 sm:w-28 rounded bg-muted/15" />
                    <div className="h-6 sm:h-7 w-full sm:w-20 rounded-full bg-muted/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-7 rounded-2xl bg-surface px-6 py-14 text-center ring-1 ring-inset ring-rose-500/20 sm:px-10">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertCircle size={24} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-bold tracking-[-0.02em] text-accent">Unable to load courses</h3>
            <p className="mt-1.5 text-sm text-muted">{error}</p>
            {onRetry ? (
              <div className="mt-6 flex justify-center">
                <button type="button" onClick={onRetry} className={PRIMARY_ACTION}>
                  Try again
                </button>
              </div>
            ) : null}
          </div>
        ) : courses.length > 0 ? (
          /* `relative` is for popLayout: a card on its way out is lifted out
             of the grid and positioned against this, so the rest can close up
             under it straight away. */
          <ul className="relative mt-4 sm:mt-7 grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={!reduceMotion}>
              {courses.map((course, index) => (
                <motion.li
                  key={course.id}
                  /* Position only: a card never changes size between filters,
                     and animating size would stretch its contents on resize. */
                  layout={reduceMotion ? false : 'position'}
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  /* The stagger rides on the entrance alone, so neither the
                     reshuffle nor a card leaving ever waits its turn. */
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: EASE, delay: Math.min(index, 5) * 0.05 },
                  }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="h-full"
                >
                  {/* Inside one category every card would carry the same
                      label, so it is only shown when they are mixed. */}
                  <CourseCard
                    course={course}
                    category={activeCategory ? undefined : categoryById.get(course.categoryId)}
                    onEnroll={onEnroll}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <EmptyState
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            activeMiniCategory={activeMiniCategory}
            search={search}
            matchCount={matchCount}
            onClearCategory={onClearCategory}
            onClearSubcategory={onClearSubcategory}
            onClearMiniCategory={onClearMiniCategory}
            onClearSearch={onClearSearch}
            onReset={onReset}
          />
        )}
      </div>
    </section>
  );
}

/* ==================================================
   EMPTY STATE

   The different reasons the grid can be empty, each with the way out that
   actually fits it.
================================================== */

function EmptyState({
  activeCategory,
  activeSubcategory,
  activeMiniCategory,
  search,
  matchCount,
  onClearCategory,
  onClearSubcategory,
  onClearMiniCategory,
  onClearSearch,
  onReset,
}: {
  activeCategory: CatalogueCategory | null;
  activeSubcategory?: CatalogueSubcategory | null;
  activeMiniCategory?: CatalogueMiniCategory | null;
  search: string;
  matchCount: number;
  onClearCategory: () => void;
  onClearSubcategory?: () => void;
  onClearMiniCategory?: () => void;
  onClearSearch: () => void;
  onReset: () => void;
}) {
  let icon = <SearchX aria-hidden="true" size={24} />;
  let title: string;
  let text: string | null = null;
  let actions: ReactNode;

  if (search && activeCategory && matchCount > 0) {
    // The search has results — just not in this category.
    title = `No matches in ${activeCategory.name}`;
    text = `${matchCount} ${matchCount === 1 ? 'match' : 'matches'} in other categories.`;
    actions = (
      <>
        <button type="button" onClick={onClearCategory} className={PRIMARY_ACTION}>
          Search all
        </button>
        <button type="button" onClick={onClearSearch} className={SECONDARY_ACTION}>
          Clear search
        </button>
      </>
    );
  } else if (search) {
    // Nothing anywhere matches the search.
    title = `No results for “${search}”`;
    actions = (
      <>
        <button type="button" onClick={onClearSearch} className={PRIMARY_ACTION}>
          Clear search
        </button>
        {activeCategory ? (
          <button type="button" onClick={onReset} className={SECONDARY_ACTION}>
            All courses
          </button>
        ) : null}
      </>
    );
  } else if (activeMiniCategory) {
    // The mini-category itself has no courses.
    icon = <BookOpen aria-hidden="true" size={24} />;
    title = `No courses in ${activeMiniCategory.name} yet`;
    actions = (
      <>
        {onClearMiniCategory && (
          <button type="button" onClick={onClearMiniCategory} className={PRIMARY_ACTION}>
            All {activeSubcategory?.name ?? 'subcategory'} courses
          </button>
        )}
        <button type="button" onClick={onClearCategory} className={SECONDARY_ACTION}>
          All courses
        </button>
      </>
    );
  } else if (activeSubcategory) {
    // The subcategory itself has no courses.
    icon = <BookOpen aria-hidden="true" size={24} />;
    title = `No courses in ${activeSubcategory.name} yet`;
    actions = (
      <>
        {onClearSubcategory && (
          <button type="button" onClick={onClearSubcategory} className={PRIMARY_ACTION}>
            All {activeCategory?.name ?? 'category'} courses
          </button>
        )}
        <button type="button" onClick={onClearCategory} className={SECONDARY_ACTION}>
          All courses
        </button>
      </>
    );
  } else if (activeCategory) {
    // The category itself has no courses.
    icon = <BookOpen aria-hidden="true" size={24} />;
    title = 'No courses here yet';
    actions = (
      <button type="button" onClick={onClearCategory} className={PRIMARY_ACTION}>
        All courses
      </button>
    );
  } else {
    // No filters, and still nothing: the catalogue is empty.
    icon = <BookOpen aria-hidden="true" size={24} />;
    title = 'Courses coming soon';
    actions = (
      <Link href="/contact" className={PRIMARY_ACTION}>
        Talk to us
      </Link>
    );
  }

  return (
    <div className="mt-5 sm:mt-7 max-sm:rounded-xl rounded-2xl bg-surface px-4 py-10 sm:px-10 sm:py-14 text-center ring-1 ring-inset ring-border">
      <span className="mx-auto flex size-11 sm:size-14 items-center justify-center max-sm:rounded-xl rounded-2xl bg-primary/10 text-primary">
        {icon}
      </span>

      <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-bold tracking-tight sm:tracking-[-0.02em] text-accent">{title}</h3>

      {text ? <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-muted">{text}</p> : null}

      <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">{actions}</div>
    </div>
  );
}

/* ==================================================
   PIECES
================================================== */

/* The search box lives in the hero, which has usually scrolled away by the
   time you are reading results — this keeps the term, and a way to drop it,
   beside them. The whole chip is the button: a small "×" on its own is a poor
   target. */
function SearchChip({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="group/chip inline-flex max-w-full cursor-pointer items-center gap-1.5 sm:gap-2 rounded-full bg-accent-gradient py-1 pl-2.5 pr-1.5 sm:py-1.5 sm:pl-3.5 sm:pr-2 text-[11px] sm:text-xs font-bold text-white shadow-lg shadow-accent/25 transition-shadow duration-300 hover:shadow-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="sr-only">Clear search: </span>
      <span className="truncate">“{search}”</span>

      <span
        aria-hidden="true"
        className="flex size-4 sm:size-5 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors duration-300 group-hover/chip:bg-white/30"
      >
        <X size={10} strokeWidth={2.5} className="sm:size-3" />
      </span>
    </button>
  );
}
