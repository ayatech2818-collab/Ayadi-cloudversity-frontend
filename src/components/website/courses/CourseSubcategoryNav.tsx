'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import type { CatalogueMiniCategory, CatalogueSubcategory } from './types';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface CourseSubcategoryNavProps<T extends CatalogueSubcategory | CatalogueMiniCategory> {
  subcategories: T[];
  activeSubcategory: T | null;
  /** Matches in each subcategory by subcategory id. */
  counts: Record<string, number>;
  /** Total matches in the parent category (the "All" count). */
  totalCount: number;
  onSelect: (subcategory: T | null) => void;
  /** Accessible name of the row — the mini-category row reuses this one. */
  label?: string;
}

/**
 * Secondary navigation row for subcategories within an active main category,
 * and — the same row again — for mini-categories within an active subcategory.
 *
 * Non-sticky so it scrolls naturally with the page content without occluding
 * limited mobile screen real estate.
 */
export function CourseSubcategoryNav<T extends CatalogueSubcategory | CatalogueMiniCategory>({
  subcategories,
  activeSubcategory,
  counts,
  totalCount,
  onSelect,
  label = 'Filter courses by subcategory',
}: CourseSubcategoryNavProps<T>) {
  const reduceMotion = useReducedMotion();
  const row = useRef<HTMLDivElement>(null);
  const activeId = activeSubcategory?.id ?? null;

  /* Keep the chosen subcategory in view if the row is scrolled horizontally */
  useEffect(() => {
    const track = row.current;
    const tab = track?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!track || !tab) return;

    track.scrollTo({
      left: tab.offsetLeft - (track.clientWidth - tab.offsetWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [activeId, reduceMotion]);

  if (subcategories.length === 0) return null;

  return (
    <div className="relative z-20 px-3 pt-2 sm:px-8 sm:pt-3 lg:px-16">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mx-auto max-w-[1180px]"
      >
        <div className="relative">
          <div
            ref={row}
            role="group"
            aria-label={label}
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 [scrollbar-width:none] max-sm:pr-8 sm:gap-2 [&::-webkit-scrollbar]:hidden"
          >
            <SubcategoryPill
              label="All"
              count={totalCount}
              isActive={activeId === null}
              onSelect={() => onSelect(null)}
            />

            {subcategories.map((subcategory) => (
              <SubcategoryPill
                key={subcategory.id}
                label={subcategory.name}
                count={counts[subcategory.id] ?? 0}
                isActive={activeId === subcategory.id}
                onSelect={() => onSelect(subcategory)}
              />
            ))}
          </div>

          {/* Fade hint for horizontal overflow on small screens */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-page to-transparent sm:hidden"
          />
        </div>
      </motion.div>
    </div>
  );
}

function SubcategoryPill({
  label,
  count,
  isActive,
  onSelect,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-3.5 sm:py-2 sm:text-[13px] ${
        isActive
          ? 'bg-accent text-white shadow-xs ring-1 ring-inset ring-accent focus-visible:outline-accent'
          : 'bg-surface/90 text-muted ring-1 ring-inset ring-border hover:bg-surface hover:text-accent focus-visible:outline-primary'
      }`}
    >
      <span>{label}</span>

      <span
        aria-hidden="true"
        className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums transition-colors duration-200 ${
          isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
        }`}
      >
        {count}
      </span>

      <span className="sr-only">
        , {count} {count === 1 ? 'course' : 'courses'}
      </span>
    </button>
  );
}
