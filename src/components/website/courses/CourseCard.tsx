'use client';

import { ArrowUpRight, Clock3, SignalHigh } from 'lucide-react';
import Image from 'next/image';

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
 * There is no course detail page yet, so the action is the site's existing
 * enrolment form. When detail pages exist, swap the button for a
 * `<Link href={`/courses/${slug}`}>` — nothing else here changes.
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
  onEnroll: (course: CatalogueCourse) => void;
}) {
  const style = category ? categoryStyle(category.slug) : null;

  return (
    <article onPointerMove={handleSpotlight} className={`${CARD_CHROME} flex flex-col`}>
      <CardDecor />

      <div className="relative aspect-[16/10] overflow-hidden bg-accent/5">
        <Image
          src={course.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-accent-strong/55 via-transparent to-transparent"
        />

        {course.badge ? (
          <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20">
            {course.badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {category && style ? (
          <p className={`mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] ${style.text}`}>
            <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
            {category.name}
          </p>
        ) : null}

        <h3 className="text-lg font-bold leading-snug tracking-[-0.02em] text-accent transition-colors duration-300 group-hover:text-primary">
          {course.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">{course.description}</p>

        <div className="mt-auto pt-6">
          <div aria-hidden="true" className="h-px bg-border" />

          <div className="mt-4 flex items-center justify-between gap-3">
            <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Level</dt>
                <SignalHigh aria-hidden="true" size={14} className="text-primary" />
                <dd>{course.level}</dd>
              </div>

              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Duration</dt>
                <Clock3 aria-hidden="true" size={14} className="text-primary" />
                <dd>{course.duration}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => onEnroll(course)}
              className="group/cta inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary py-2 pl-4 pr-3 text-xs font-bold text-white transition-colors duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Enroll
              <span className="sr-only"> in {course.title}</span>
              <ArrowUpRight
                aria-hidden="true"
                size={15}
                className="transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
