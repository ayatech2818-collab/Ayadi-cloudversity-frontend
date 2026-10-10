'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { ALL_COURSES_STYLE, categoryStyle } from './categoryStyles';
import type { CatalogueCategory } from './types';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/*
 * Sticky category switcher. It sits just below the navbar so the category you
 * are reading is always named on screen and another is one click away, and the
 * active pill slides between tabs via a shared layoutId.
 *
 * From `lg` the three categories share the bar's width. Below that their names
 * do not fit side by side, so the row scrolls sideways instead of shortening
 * them — and keeps whichever tab is chosen in view.
 *
 * Counts are passed in, not worked out here, so they can follow the search.
 */
export function CourseCategoryNav({
  categories,
  counts,
  total,
  activeCategory,
  onSelect,
}: {
  categories: CatalogueCategory[];
  /** Courses per category id. A category missing from it has none. */
  counts: Record<string, number>;
  /** The "All" count. */
  total: number;
  activeCategory: CatalogueCategory | null;
  onSelect: (category: CatalogueCategory | null) => void;
}) {
  const reduceMotion = useReducedMotion();
  const row = useRef<HTMLDivElement>(null);
  const activeId = activeCategory?.id ?? null;

  /* Centres the chosen tab when the row is scrollable. It moves the row
     itself — scrollIntoView would drag the page along with it. */
  useEffect(() => {
    const track = row.current;
    const tab = track?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!track || !tab) return;

    track.scrollTo({
      left: tab.offsetLeft - (track.clientWidth - tab.offsetWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [activeId, reduceMotion]);

  return (
    <div className="sticky top-[84px] z-30 px-5 sm:px-8 lg:px-16">
      {/* The ring is an overlay (`after:`) rather than on the bar itself, so a
          tab scrolled to the edge passes under it instead of over it. */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
        className="relative mx-auto max-w-[1180px] overflow-hidden rounded-2xl bg-surface/90 shadow-[0_18px_40px_-28px_rgba(20,29,63,0.45)] backdrop-blur-sm after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:ring-inset after:ring-border"
      >
        <motion.div
          ref={row}
          layoutScroll
          role="group"
          aria-label="Filter courses by category"
          className="relative flex gap-1.5 overflow-x-auto p-1.5 [scrollbar-width:none] max-lg:pr-9 [&::-webkit-scrollbar]:hidden"
        >
          <CategoryTab
            label="All"
            count={total}
            icon={ALL_COURSES_STYLE.icon}
            isActive={activeId === null}
            slidePill={!reduceMotion}
            onSelect={() => onSelect(null)}
          />

          {categories.map((category) => (
            <CategoryTab
              key={category.id}
              label={category.name}
              count={counts[category.id] ?? 0}
              icon={categoryStyle(category.slug).icon}
              isActive={activeId === category.id}
              slidePill={!reduceMotion}
              grow
              onSelect={() => onSelect(category)}
            />
          ))}
        </motion.div>

        {/* Says "there is more this way" while the row scrolls */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-surface to-transparent lg:hidden"
        />
      </motion.div>
    </div>
  );
}

function CategoryTab({
  label,
  count,
  icon: Icon,
  isActive,
  slidePill,
  grow = false,
  onSelect,
}: {
  label: string;
  count: number;
  icon: LucideIcon;
  isActive: boolean;
  slidePill: boolean;
  /** Takes an equal share of the bar from `lg`. */
  grow?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      /* The outline is drawn inside the tab: outside it, the bar's rounded
         clip would cut it off. */
      className={`relative flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2 sm:px-4 sm:py-3 ${
        grow ? 'lg:flex-1' : ''
      } ${
        isActive
          ? 'text-white focus-visible:outline-white'
          : 'text-muted hover:text-primary focus-visible:outline-primary'
      }`}
    >
      {isActive ? (
        <motion.span
          layoutId={slidePill ? 'category-tab-pill' : undefined}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="absolute inset-0 rounded-xl bg-accent-gradient shadow-lg shadow-accent/25"
        />
      ) : null}

      <span className="relative flex items-center gap-2">
        <Icon aria-hidden="true" size={16} strokeWidth={2} />

        {label}

        {/* Only where there is room to spare; a screen reader gets it below */}
        <span
          aria-hidden="true"
          className={`hidden rounded-full px-1.5 py-0.5 text-[10px] tabular-nums transition-colors duration-300 xl:inline ${
            isActive ? 'bg-white/15' : 'bg-primary/10 text-primary'
          }`}
        >
          {count}
        </span>
      </span>

      <span className="sr-only">
        , {count} {count === 1 ? 'course' : 'courses'}
      </span>
    </button>
  );
}
