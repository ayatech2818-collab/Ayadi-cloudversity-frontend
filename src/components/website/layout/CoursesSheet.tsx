'use client';

import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { ArrowUpRight, ChevronRight, Clock, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';

import {
  countByCategory,
  countByMiniCategory,
  countBySubcategory,
} from '@/components/website/courses/filterCourses';

import { useCoursesMenu } from './useCoursesMenu';

/* How far, or how fast, a drag on the handle has to go to close the sheet. */
const DRAG_CLOSE_DISTANCE = 110;
const DRAG_CLOSE_VELOCITY = 500;

/* Frosted mint-to-periwinkle over a real backdrop blur: thin enough for the page
   to show through, thick enough at the top to keep the navy title readable. */
const FROST = {
  backgroundImage:
    'linear-gradient(165deg, rgba(240, 248, 243, 0.84), rgba(226, 241, 233, 0.78) 28%, rgba(222, 229, 241, 0.72))',
};

export interface CoursesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/*
 * The navbar's Courses menu on a phone, rising from the bottom and leaving the
 * bottom nav on top of it: the same levels as the desktop menu, as tabs and
 * pills above the course list, since there is no hover and no room for columns.
 * Tapping a tab or pill only narrows the list.
 */
export function CoursesSheet({ isOpen, onClose }: CoursesSheetProps) {
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const closeButton = useRef<HTMLButtonElement>(null);

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

  const counts = useMemo(() => {
    const all = data?.courses ?? [];

    return {
      category: countByCategory(all),
      subcategory: countBySubcategory(all),
      mini: countByMiniCategory(all),
    };
  }, [data]);

  // Same scroll lock as the enrollment form.
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    closeButton.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_DISTANCE || info.velocity.y > DRAG_CLOSE_VELOCITY) onClose();
  };

  const categoryCount = category ? (counts.category[category.id] ?? 0) : 0;
  const totalCount = data?.courses.length ?? 0;
  const listName = miniCategory?.name ?? subcategory?.name ?? category?.name ?? '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] touch-none bg-[#080d1e]/35 backdrop-blur-md md:hidden"
          />

          {/* Runs behind the bottom nav, so its foot is padded clear of it.
              svh, so the toolbar coming and going never resizes it mid-drag. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="courses-sheet-title"
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            drag={reduceMotion ? false : 'y'}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={handleDragEnd}
            style={FROST}
            className="fixed inset-x-2 bottom-0 z-[60] flex h-[88svh] flex-col overflow-hidden rounded-t-[32px] pb-[calc(84px+env(safe-area-inset-bottom))] shadow-[0_-20px_60px_-20px_rgba(8,13,30,0.5)] ring-1 ring-inset ring-white/80 backdrop-blur-2xl backdrop-saturate-150 md:hidden"
          >
            {/* Handle and title — the part that drags */}
            <div
              onPointerDown={(event) => dragControls.start(event)}
              className="shrink-0 touch-none px-4 pb-3 pt-2.5"
            >
              <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-accent/20" />

              <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Explore</p>
                  <h2 id="courses-sheet-title" className="text-[22px] font-bold leading-tight tracking-tight text-accent">
                    Courses
                  </h2>
                  {category ? (
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {categoryCount} {categoryCount === 1 ? 'course' : 'courses'} in {category.name}
                    </p>
                  ) : null}
                </div>

                <button
                  ref={closeButton}
                  type="button"
                  aria-label="Close courses menu"
                  onClick={onClose}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/85 text-accent shadow-sm ring-1 ring-inset ring-white focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="shrink-0 px-4 pb-3">
              <ScrollRow
                label="Category"
                activeId={category?.id}
                className="rounded-full bg-white/60 p-1 ring-1 ring-inset ring-white/90"
              >
                {data?.categories.map((item) => {
                  const isActive = item.id === category?.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-row-id={item.id}
                      aria-pressed={isActive}
                      onClick={() => selectCategory(item.id)}
                      className={`flex-1 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary ${
                        isActive ? 'bg-accent text-white shadow-[0_6px_14px_-6px_rgba(30,43,87,0.7)]' : 'text-muted'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </ScrollRow>
            </div>

            {/* The rest of the sheet is a hairline below, as in the header */}
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              {/* Subcategory */}
              {subcategories.length > 0 && (
                <ScrollRow label="Subcategory" activeId={subcategory?.id} className="gap-2 px-4">
                  {subcategories.map((item) => {
                    const isActive = item.id === subcategory?.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-row-id={item.id}
                        aria-pressed={isActive}
                        onClick={() => selectSubcategory(item.id)}
                        className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full py-1.5 pl-3.5 pr-2 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary ${
                          isActive
                            ? 'bg-brand-gradient text-white shadow-[0_8px_18px_-8px_rgba(5,150,105,0.8)]'
                            : 'bg-white/75 text-accent ring-1 ring-inset ring-white'
                        }`}
                      >
                        {item.name}
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                            isActive ? 'bg-white/25 text-white' : 'bg-accent/[0.07] text-muted'
                          }`}
                        >
                          {counts.subcategory[item.id] ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </ScrollRow>
              )}

              {/* Mini category */}
              {miniCategories.length > 0 && (
                <ScrollRow label="Mini category" activeId={miniCategory?.id ?? 'all'} className="gap-1.5 px-4">
                  <MiniChip id="all" isActive={!miniCategory} onSelect={() => selectMiniCategory(null)}>
                    All
                  </MiniChip>

                  {miniCategories.map((item) => (
                    <MiniChip
                      key={item.id}
                      id={item.id}
                      isActive={item.id === miniCategory?.id}
                      onSelect={() => selectMiniCategory(item.id)}
                    >
                      {item.name} · {counts.mini[item.id] ?? 0}
                    </MiniChip>
                  ))}
                </ScrollRow>
              )}

              {/* Courses */}
              <div className="flex items-center justify-between gap-3 px-5">
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.1em] text-accent/80">{listName}</p>
                {data ? <p className="shrink-0 text-[11px] font-semibold text-accent/70">{courses.length}</p> : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 [scrollbar-width:none]">
                {isPending ? (
                  <div className="space-y-2" aria-hidden="true">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-[84px] animate-pulse rounded-3xl bg-white/60" />
                    ))}
                  </div>
                ) : !data ? (
                  <p className="px-1 text-sm text-muted">Unable to load courses.</p>
                ) : courses.length === 0 ? (
                  <p className="rounded-3xl bg-white/70 px-4 py-6 text-center text-sm text-muted ring-1 ring-inset ring-white">
                    No courses here yet.
                  </p>
                ) : (
                  <ul className="divide-y overflow-hidden rounded-3xl bg-white/80 shadow-[0_12px_28px_-18px_rgba(30,43,87,0.45)] ring-1 ring-inset ring-white">
                    {courses.map((course) => (
                      <li key={course.id}>
                        <Link
                          href={`/courses/${course.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-2.5 active:bg-primary/[0.06]"
                        >
                          <span className="relative size-[68px] shrink-0 overflow-hidden rounded-2xl bg-accent/[0.06]">
                            <Image src={course.image} alt="" fill sizes="68px" className="object-cover" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-1 text-sm font-semibold leading-snug text-accent">
                              {course.title}
                            </span>

                            {course.description ? (
                              <span className="mt-0.5 line-clamp-1 text-[11px] text-muted">{course.description}</span>
                            ) : null}

                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary-hover">
                              <Clock size={10} />
                              {course.duration}
                            </span>
                          </span>

                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-muted shadow-sm ring-1 ring-inset ring-accent/[0.06]">
                            <ChevronRight size={14} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Go to all courses */}
            <div className="shrink-0 px-4 pb-1">
              <Link
                href="/courses"
                onClick={onClose}
                className="flex items-center gap-3 rounded-3xl bg-linear-to-r from-white/85 to-emerald-100/70 p-2.5 shadow-[0_12px_28px_-18px_rgba(5,150,105,0.6)] ring-1 ring-inset ring-white"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <Sparkles size={17} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-accent">All courses</span>
                  {data ? (
                    <span className="block truncate text-[11px] text-muted">{totalCount} to explore</span>
                  ) : null}
                </span>

                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-gradient px-3.5 py-2 text-xs font-bold text-white shadow-[0_8px_18px_-8px_rgba(5,150,105,0.8)]">
                  Go to all
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** A row that scrolls sideways and keeps its choice in view. */
function ScrollRow({
  label,
  activeId,
  className,
  children,
}: {
  label: string;
  activeId: string | undefined;
  className: string;
  children: ReactNode;
}) {
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = row.current;
    const item = track?.querySelector<HTMLElement>(`[data-row-id="${activeId}"]`);
    if (!track || !item) return;

    track.scrollTo({
      left: item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2,
      behavior: 'smooth',
    });
  }, [activeId]);

  return (
    <div
      ref={row}
      role="group"
      aria-label={label}
      className={`relative flex shrink-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </div>
  );
}

function MiniChip({
  id,
  isActive,
  onSelect,
  children,
}: {
  id: string;
  isActive: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      data-row-id={id}
      aria-pressed={isActive}
      onClick={onSelect}
      className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary ${
        isActive ? 'bg-accent/10 text-accent ring-accent/25' : 'text-accent/75 ring-accent/15'
      }`}
    >
      {children}
    </button>
  );
}
