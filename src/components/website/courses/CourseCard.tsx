'use client';

import { ArrowUpRight, Clock3, SignalHigh } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { CARD_CHROME, CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';

import { categoryStyle } from './categoryStyles';
import type { CatalogueCategory, CatalogueCourse } from './types';

/*
 * One course in the catalogue.
 *
 * Shows only what the data holds — cover, badge, category, title,
 * description, level, duration — and leaves out whichever of the optional
 * ones a course does not have, so nothing is ever filled in with a guess.
 *
 * Every card is the same height in its row: the cover is a fixed ratio, the
 * description clamps at two lines, and the footer is pushed to the bottom.
 *
 * Links to the course details page (/courses/[courseId]) via cover, title,
 * and a dedicated "Details" action, while preserving the "Enroll" modal CTA.
 */
export function CourseCard({
  course,
  category,
  onEnroll,
}: {
  course: CatalogueCourse;
  /** The label to show. Leave it out where every card would say the same
      thing — inside a single category — or where the category is unknown. */
  category?: CatalogueCategory;
  onEnroll?: (course: CatalogueCourse) => void;
}) {
  const style = category ? categoryStyle(category.slug) : null;

  return (
    <article onPointerMove={handleSpotlight} className={`${CARD_CHROME} max-sm:rounded-xl flex flex-col`}>
      <CardDecor />

      <Link
        href={`/courses/${course.id}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative aspect-[16/10] overflow-hidden bg-accent/5 block"
      >
        <Image
          src={course.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-accent-strong/55 via-transparent to-transparent"
        />

        {course.badge ? (
          <span className="absolute left-2 top-2 sm:left-4 sm:top-4 rounded-full bg-surface/90 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20 backdrop-blur-xs">
            {course.badge}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-2 min-[360px]:p-2.5 min-[380px]:p-3 sm:p-6">
        {category && style ? (
          <p className={`mb-1 sm:mb-3 flex items-center gap-1 sm:gap-2 text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-[0.16em] ${style.text} min-w-0`}>
            <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
            <span className="truncate">{category.name}</span>
          </p>
        ) : null}

        <h3 className="text-xs min-[360px]:text-sm sm:text-lg font-bold leading-snug tracking-tight sm:tracking-[-0.02em] text-accent transition-colors duration-300 group-hover:text-primary">
          <Link href={`/courses/${course.id}`} className="hover:underline line-clamp-2 sm:line-clamp-none">
            {course.title}
          </Link>
        </h3>

        <p className="mt-1 sm:mt-2 line-clamp-2 text-[10px] min-[360px]:text-[11px] sm:text-sm leading-relaxed sm:leading-7 text-muted">{course.description}</p>

        <div className="mt-auto pt-2 sm:pt-6">
          <div aria-hidden="true" className="h-px bg-border" />

          <div className="mt-1.5 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
            <dl className="flex flex-wrap items-center gap-x-2 min-[360px]:gap-x-2.5 gap-y-0.5 sm:gap-x-4 sm:gap-y-1.5 text-[9px] min-[360px]:text-[10px] sm:text-xs text-muted">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <dt className="sr-only">Level</dt>
                <SignalHigh aria-hidden="true" size={12} className="text-primary size-2.5 min-[360px]:size-3 sm:size-3.5 shrink-0" />
                <dd className="truncate">{course.level}</dd>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <dt className="sr-only">Duration</dt>
                <Clock3 aria-hidden="true" size={12} className="text-primary size-2.5 min-[360px]:size-3 sm:size-3.5 shrink-0" />
                <dd className="truncate">{course.duration}</dd>
              </div>
            </dl>

            <div className="flex items-center gap-1 min-[360px]:gap-1.5 sm:gap-2 w-full sm:w-auto">
              <Link
                href={`/courses/${course.id}`}
                className="flex-1 sm:flex-initial inline-flex shrink-0 items-center justify-center rounded-full border border-border px-1.5 min-[360px]:px-2 py-0.5 min-[360px]:py-1 text-[10px] min-[360px]:text-[11px] sm:px-3 sm:py-1.5 sm:text-xs font-semibold text-accent transition-colors duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Details
                <span className="sr-only"> for {course.title}</span>
              </Link>

              {onEnroll ? (
                <button
                  type="button"
                  onClick={() => onEnroll(course)}
                  className="flex-1 sm:flex-initial group/cta inline-flex shrink-0 cursor-pointer items-center justify-center gap-0.5 min-[360px]:gap-1 sm:gap-1.5 rounded-full bg-primary py-0.5 min-[360px]:py-1 px-1.5 min-[360px]:px-2 sm:py-1.5 sm:pl-3.5 sm:pr-2.5 text-[10px] min-[360px]:text-[11px] sm:text-xs font-bold text-white transition-colors duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Enroll
                  <span className="sr-only"> in {course.title}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={12}
                    className="transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5 size-2.5 min-[360px]:size-3 sm:size-[15px]"
                  />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
