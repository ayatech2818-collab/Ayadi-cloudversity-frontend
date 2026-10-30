'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';

import {
  CATEGORY_ACTIVE,
  COLUMN_LABEL,
  COURSES_MENU_GLASS,
  MINI_ACTIVE,
  SUBCATEGORY_ACTIVE,
  useCoursesMenu,
} from './useCoursesMenu';

/** A pass over a row on the way to the next column should not switch to it. */
const HOVER_SELECT_MS = 70;

/* A shadow, not a border: the global `* { border-color }` in globals.css is
   unlayered, so it beats any border colour utility. */
const COLUMN_DIVIDER = 'shadow-[inset_-1px_0_0_rgba(255,255,255,0.09)]';

export interface CoursesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

/*
 * The navbar's Courses menu on desktop. Hovering a row shows what is under it;
 * clicking it goes to the Courses page filtered to that row. CoursesSheet is
 * the same menu for touch.
 */
export function CoursesMenu({ isOpen, onClose, onPointerEnter, onPointerLeave }: CoursesMenuProps) {
  const reduceMotion = useReducedMotion();

  const {
    data,
    isPending,
    category,
    subcategories,
    subcategory,
    miniCategories,
    miniCategory,
    courses,
    selectCategory,
    selectSubcategory,
    selectMiniCategory,
  } = useCoursesMenu(isOpen);

  const hrefFor = (params: { category?: string; subcategory?: string; mini?: string }) => {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }

    return `/courses?${query}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        /* The glass is on the animated element itself: a parent that is fading
           or moving would stop a child's backdrop blur seeing the page behind
           it, and the blur would only pop in once the animation ended. */
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          style={COURSES_MENU_GLASS}
          className="absolute inset-x-0 top-2 hidden rounded-3xl shadow-[0_32px_80px_-20px_rgba(5,150,105,0.35),0_24px_60px_-24px_rgba(8,13,30,0.7)] ring-1 ring-inset ring-white/15 backdrop-blur-2xl backdrop-saturate-[1.8] md:block"
        >
          {/* Bridges the gap to the navbar, so the pointer never leaves the
              menu on its way down */}
          <span aria-hidden="true" className="absolute inset-x-0 -top-2 h-2" />

          {/* Lit top edge */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-linear-to-r from-transparent via-emerald-200/70 to-transparent"
          />

          <div
            data-lenis-prevent
            className="flex h-[400px] max-h-[calc(100vh-110px)] overflow-hidden rounded-3xl"
          >
            {/* Main categories */}
            <div className={`flex w-[180px] shrink-0 flex-col gap-3 bg-white/[0.03] p-4 lg:w-[220px] ${COLUMN_DIVIDER}`}>
              <p className={COLUMN_LABEL}>Category</p>

              <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto [scrollbar-width:none]">
                {data?.categories.map((item) => {
                  const isActive = item.id === category?.id;

                  return (
                    <li key={item.id}>
                      <HoverLink
                        href={hrefFor({ category: item.slug })}
                        onClick={onClose}
                        onSelect={() => selectCategory(item.id)}
                        className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold leading-snug transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-emerald-300 ${
                          isActive
                            ? CATEGORY_ACTIVE
                            : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        {item.name}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_10px_2px_rgba(110,231,183,0.7)]"
                          />
                        )}
                      </HoverLink>
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/courses"
                onClick={onClose}
                className="group/all inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-sidebar-active px-3 py-2.5 text-xs font-bold text-white shadow-sidebar-active transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
              >
                Go to all courses
                <ArrowRight size={14} className="transition-transform duration-200 group-hover/all:translate-x-0.5" />
              </Link>
            </div>

            {/* Sub categories */}
            {subcategories.length > 0 && (
              <Column label="Subcategory" className="w-[170px] lg:w-[210px]">
                {subcategories.map((item) => (
                  <MenuRow
                    key={item.id}
                    href={hrefFor({ category: category?.slug, subcategory: item.slug })}
                    isActive={item.id === subcategory?.id}
                    activeClass={SUBCATEGORY_ACTIVE}
                    onClick={onClose}
                    onSelect={() => selectSubcategory(item.id)}
                  >
                    {item.name}
                  </MenuRow>
                ))}
              </Column>
            )}

            {/* Mini-categories — only under a sub category that has them */}
            {miniCategories.length > 0 && (
              <Column label="Mini category" className="w-[160px] lg:w-[200px]">
                <MenuRow
                  href={hrefFor({ category: category?.slug, subcategory: subcategory?.slug })}
                  isActive={!miniCategory}
                  activeClass={MINI_ACTIVE}
                  onClick={onClose}
                  onSelect={() => selectMiniCategory(null)}
                >
                  All
                </MenuRow>

                {miniCategories.map((item) => (
                  <MenuRow
                    key={item.id}
                    href={hrefFor({
                      category: category?.slug,
                      subcategory: subcategory?.slug,
                      mini: item.slug,
                    })}
                    isActive={item.id === miniCategory?.id}
                    activeClass={MINI_ACTIVE}
                    onClick={onClose}
                    onSelect={() => selectMiniCategory(item.id)}
                  >
                    {item.name}
                  </MenuRow>
                ))}
              </Column>
            )}

            {/* Courses */}
            <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
              <p className={COLUMN_LABEL}>Courses</p>

              {isPending ? (
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-2" aria-hidden="true">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-11 animate-pulse rounded-xl bg-white/10" />
                  ))}
                </div>
              ) : !data ? (
                <p className="px-1 text-sm text-white/60">Unable to load courses.</p>
              ) : courses.length === 0 ? (
                <p className="px-1 text-sm text-white/60">No courses here yet.</p>
              ) : (
                <ul className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-1 overflow-y-auto [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] lg:grid-cols-2">
                  {courses.map((course) => (
                    <li key={course.id}>
                      <Link
                        href={`/courses/${course.id}`}
                        onClick={onClose}
                        title={course.title}
                        className="group/course flex items-center gap-2.5 rounded-xl p-2 text-[13px] font-medium leading-snug text-white/85 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-300"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400/25 to-teal-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-300/25 transition-shadow duration-200 group-hover/course:shadow-[0_0_14px_rgba(52,211,153,0.5)]">
                          <BookOpen size={14} />
                        </span>
                        <span className="line-clamp-2 min-w-0">{course.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Column({ label, className, children }: { label: string; className: string; children: ReactNode }) {
  return (
    <div className={`flex shrink-0 flex-col gap-3 p-4 ${COLUMN_DIVIDER} ${className}`}>
      <p className={COLUMN_LABEL}>{label}</p>
      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto [scrollbar-width:none]">{children}</ul>
    </div>
  );
}

/** A link that shows what is under it on a short hover, or straight away on
    keyboard focus. Clicking it still follows the link. */
function HoverLink({
  href,
  onClick,
  onSelect,
  className,
  children,
}: {
  href: string;
  onClick: () => void;
  onSelect: () => void;
  className: string;
  children: ReactNode;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <Link
      href={href}
      onClick={onClick}
      onPointerEnter={() => {
        cancel();
        timer.current = setTimeout(onSelect, HOVER_SELECT_MS);
      }}
      onPointerLeave={cancel}
      onFocus={onSelect}
      className={className}
    >
      {children}
    </Link>
  );
}

function MenuRow({
  href,
  isActive,
  activeClass,
  onClick,
  onSelect,
  children,
}: {
  href: string;
  isActive: boolean;
  activeClass: string;
  onClick: () => void;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <li>
      <HoverLink
        href={href}
        onClick={onClick}
        onSelect={onSelect}
        className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold leading-snug transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-300 ${
          isActive ? activeClass : 'bg-white/[0.05] text-white/80 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white'
        }`}
      >
        {children}
        {isActive && <ChevronRight size={14} className="shrink-0" />}
      </HoverLink>
    </li>
  );
}
