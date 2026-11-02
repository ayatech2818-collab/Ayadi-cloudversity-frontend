'use client';

import {
  ArrowUpRight,
  ChevronRight,
  Clock3,
  GraduationCap,
  Hash,
  Layers,
  MessageSquare,
  SignalHigh,
  Tag,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState, type ReactNode } from 'react';

import { LazyEnrollmentModal } from '@/components/website/enrollment/LazyEnrollmentModal';
import GetStartedCta from '@/components/website/sections/GetStartedCta';
import { CARD_CHROME, CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';

import { categoryStyle } from './categoryStyles';
import { CourseCard } from './CourseCard';
import { courseAudience } from './courseAudience';
import {
  DEFAULT_COURSE_PLACEHOLDER,
  type CatalogueCategory,
  type CatalogueCourse,
  type CatalogueMiniCategory,
  type CatalogueSubcategory,
  type CourseDetail,
} from './types';

interface CourseDetailContentProps {
  course: CourseDetail;
  category?: CatalogueCategory;
  subcategory?: CatalogueSubcategory;
  miniCategory?: CatalogueMiniCategory;
  relatedCourses: CatalogueCourse[];
}

type CourseFact = {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Opens the catalogue filtered to this value. */
  href?: string;
};

function Crumb({ href, children }: { href: string; children: ReactNode }) {
  return (
    <>
      <ChevronRight aria-hidden="true" size={11} className="text-white/40 sm:size-[13px]" />
      <Link
        href={href}
        className="hover:text-white transition-colors truncate max-w-[100px] min-[360px]:max-w-[140px] sm:max-w-none"
      >
        {children}
      </Link>
    </>
  );
}

/*
 * One course's page. Everything specific to the course comes from the backend,
 * and whatever a course does not have is left out rather than filled in. The
 * only copy that is not course data is the audience line (courseAudience.ts)
 * and the calls to action.
 */
export function CourseDetailContent({
  course,
  category,
  subcategory,
  miniCategory,
  relatedCourses,
}: CourseDetailContentProps) {
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [modalCourse, setModalCourse] = useState<{ title: string; id: string }>({
    title: course.title,
    id: course.id,
  });

  const style = category ? categoryStyle(category.slug) : null;
  const CategoryIcon = style?.icon ?? GraduationCap;

  const categoryHref = category ? `/courses?category=${category.slug}` : undefined;
  const subcategoryHref = categoryHref && subcategory ? `${categoryHref}&subcategory=${subcategory.slug}` : undefined;
  const miniCategoryHref = subcategoryHref && miniCategory ? `${subcategoryHref}&mini=${miniCategory.slug}` : undefined;

  const audience = courseAudience(subcategory?.slug);
  const hasBody = Boolean(course.about || audience);
  const hasThumbnail = course.image !== DEFAULT_COURSE_PLACEHOLDER;

  const facts: CourseFact[] = [];
  if (course.level) facts.push({ label: 'Level', value: course.level, icon: SignalHigh });
  if (course.duration) facts.push({ label: 'Duration', value: course.duration, icon: Clock3 });
  if (course.courseCode) facts.push({ label: 'Course code', value: course.courseCode, icon: Hash });
  if (category) facts.push({ label: 'Category', value: category.name, icon: CategoryIcon, href: categoryHref });
  if (subcategory) facts.push({ label: 'Course type', value: subcategory.name, icon: Layers, href: subcategoryHref });
  if (miniCategory) facts.push({ label: 'Focus', value: miniCategory.name, icon: Tag, href: miniCategoryHref });

  const openEnrollment = useCallback((targetCourse?: CatalogueCourse) => {
    if (targetCourse) {
      setModalCourse({ title: targetCourse.title, id: targetCourse.id });
    } else {
      setModalCourse({ title: course.title, id: course.id });
    }
    setIsEnrollOpen(true);
  }, [course]);

  const closeEnrollment = useCallback(() => {
    setIsEnrollOpen(false);
  }, []);

  const hierarchyChips = (
    <>
      {category ? (
        <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/15 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-[0.14em] text-white ring-1 ring-inset ring-white/25">
          <span aria-hidden="true" className="size-1.5 sm:size-2 shrink-0 rounded-full bg-emerald-300" />
          {category.name}
        </span>
      ) : null}

      {subcategory ? (
        <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-white/90 ring-1 ring-inset ring-white/20">
          {subcategory.name}
        </span>
      ) : null}

      {miniCategory ? (
        <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-white/90 ring-1 ring-inset ring-white/20">
          {miniCategory.name}
        </span>
      ) : null}
    </>
  );

  return (
    <main className="min-h-screen">
      {/* =========================================================
          HERO & BREADCRUMBS
      ========================================================= */}
      <section className="relative isolate overflow-hidden px-3 min-[360px]:px-4 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-36 lg:px-16 lg:pb-26 lg:pt-40">
        {/* The cover, blurred until only its colour is left, under a black layer
            that keeps the white text readable on any thumbnail. Only a tiny copy
            is needed, as no detail survives. Its own layer, so Safari, which
            blurs on the CPU, does it once rather than on every repaint. Scaled
            up so the blur's soft edges fall outside the section. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-accent-strong">
          {hasThumbnail ? (
            <>
              <Image
                src={course.image}
                alt=""
                fill
                sizes="64px"
                loading="eager"
                className="scale-125 transform-gpu object-cover blur-3xl saturate-[1.8]"
              />
              <div className="absolute inset-0 bg-black/60" />
            </>
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-accent-strong to-emerald-900" />
          )}
        </div>

        <div className="mx-auto max-w-[1180px]">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-1 min-[360px]:gap-1.5 text-[11px] min-[360px]:text-xs text-white/75 sm:text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>

            <Crumb href="/courses">Courses</Crumb>
            {category && categoryHref ? <Crumb href={categoryHref}>{category.name}</Crumb> : null}
            {subcategory && subcategoryHref ? <Crumb href={subcategoryHref}>{subcategory.name}</Crumb> : null}
            {miniCategory && miniCategoryHref ? <Crumb href={miniCategoryHref}>{miniCategory.name}</Crumb> : null}

            <ChevronRight aria-hidden="true" size={11} className="text-white/40 sm:size-[13px]" />

            <span className="truncate max-w-[120px] min-[360px]:max-w-[160px] sm:max-w-[280px] font-semibold text-white" aria-current="page">
              {course.title}
            </span>
          </nav>

          {/* Stacked layout: above the image, which comes first there */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:mt-6 sm:gap-2 lg:hidden">{hierarchyChips}</div>

          {/* Hero Main Content */}
          <div className="mt-3 sm:mt-4 lg:mt-8 grid items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Details & Primary Actions */}
            <div className="lg:col-span-7">
              {/* Desktop: above the title */}
              <div className="hidden flex-wrap items-center gap-2 lg:flex">{hierarchyChips}</div>

              {/* Course Title */}
              <h1 className="mt-2.5 sm:mt-4 text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight sm:tracking-[-0.03em] text-white lg:leading-[1.12] break-words">
                {course.title}
              </h1>

              {/* Short Description */}
              {course.summary ? (
                <p className="mt-2.5 sm:mt-4 text-xs min-[360px]:text-sm sm:text-lg leading-relaxed sm:leading-8 text-white/85">
                  {course.summary}
                </p>
              ) : null}

              {/* Level & Duration */}
              {course.level || course.duration ? (
                <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/85">
                  {course.level ? (
                    <div className="flex items-center gap-1.5 sm:gap-2 rounded-md sm:rounded-lg bg-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 ring-1 ring-inset ring-white/20 text-[11px] min-[360px]:text-xs sm:text-sm">
                      <SignalHigh aria-hidden="true" size={14} className="text-emerald-300 sm:size-4" />
                      <span>
                        Level: <strong className="text-white">{course.level}</strong>
                      </span>
                    </div>
                  ) : null}

                  {course.duration ? (
                    <div className="flex items-center gap-1.5 sm:gap-2 rounded-md sm:rounded-lg bg-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 ring-1 ring-inset ring-white/20 text-[11px] min-[360px]:text-xs sm:text-sm">
                      <Clock3 aria-hidden="true" size={14} className="text-emerald-300 sm:size-4" />
                      <span>
                        Duration: <strong className="text-white">{course.duration}</strong>
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Actions */}
              <div className="mt-5 sm:mt-8 flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="group/btn inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-primary px-5 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-black/25 transition-all duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Enroll in This Course
                  <ArrowUpRight
                    aria-hidden="true"
                    size={14}
                    className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 sm:size-4"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-white/10 px-4 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold text-white ring-1 ring-inset ring-white/30 transition-colors duration-300 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <MessageSquare size={14} aria-hidden="true" className="text-emerald-300 sm:size-4" />
                  Enquire Now
                </button>
              </div>
            </div>

            {/* Right Column: Course Cover */}
            <div className="order-first lg:order-none lg:col-span-5">
              <div className="relative overflow-hidden rounded-xl sm:rounded-3xl bg-white/10 p-1.5 sm:p-2 ring-1 ring-inset ring-white/25 shadow-2xl shadow-black/40">
                <div className="relative aspect-[16/10] sm:aspect-[16/11] overflow-hidden rounded-lg sm:rounded-2xl bg-white/5">
                  {hasThumbnail ? (
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      sizes="(min-width: 1024px) 42vw, 100vw"
                      preload
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-brand-gradient text-white">
                      <CategoryIcon aria-hidden="true" className="size-14 opacity-90 sm:size-20" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT, AUDIENCE & COURSE DETAILS

          A sheet of the page's own colour, pulled up over the header, so the
          blur shows behind its two rounded corners. The header's bottom padding
          makes room for the overlap.
      ========================================================= */}
      <section className="relative z-10 -mt-6 rounded-t-3xl bg-page px-3 min-[360px]:px-4 py-8 shadow-[0_-16px_40px_-20px_rgba(0,0,0,0.45)] sm:-mt-8 sm:rounded-t-[32px] sm:px-8 sm:py-14 lg:-mt-10 lg:rounded-t-[40px] lg:px-16 lg:py-16">
        <div className="mx-auto grid max-w-[1180px] gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
          {hasBody ? (
            <div className="space-y-6 sm:space-y-8 lg:col-span-7">
              {course.about ? (
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold tracking-tight sm:tracking-[-0.03em] text-accent">
                    About this course
                  </h2>
                  <p className="mt-3 sm:mt-4 whitespace-pre-line break-words text-xs min-[360px]:text-sm sm:text-base leading-relaxed sm:leading-8 text-muted">
                    {course.about}
                  </p>
                </div>
              ) : null}

              {audience ? (
                <div className="flex items-start gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-border bg-surface p-4 min-[360px]:p-5 sm:p-6">
                  <span className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                    <Users size={16} aria-hidden="true" className="sm:size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm min-[360px]:text-base sm:text-lg font-bold text-accent">
                      Who this course is for
                    </h2>
                    <p className="mt-1 text-xs min-[360px]:text-sm sm:text-base leading-relaxed text-muted">{audience}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <aside
            aria-labelledby="course-details-heading"
            className={hasBody ? 'lg:col-span-5 lg:sticky lg:top-28 lg:self-start' : 'lg:col-span-8 lg:col-start-3'}
          >
            <div
              onPointerMove={handleSpotlight}
              className={`${CARD_CHROME} rounded-xl sm:rounded-2xl p-4 min-[360px]:p-5 sm:p-6`}
            >
              <CardDecor />

              <h2 id="course-details-heading" className="text-base sm:text-lg font-bold text-accent">
                Course details
              </h2>

              <dl className="mt-2 sm:mt-3 divide-y divide-border">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
                    <dt className="flex shrink-0 items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-muted">
                      <span className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <fact.icon size={14} aria-hidden="true" className="sm:size-4" />
                      </span>
                      {fact.label}
                    </dt>
                    <dd className="min-w-0 break-words text-right text-xs sm:text-sm font-semibold text-accent">
                      {fact.href ? (
                        <Link href={fact.href} className="transition-colors hover:text-primary hover:underline">
                          {fact.value}
                        </Link>
                      ) : (
                        fact.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* =========================================================
          COURSE-SPECIFIC ENQUIRY CALL TO ACTION BANNER
      ========================================================= */}
      <section className="px-3 min-[360px]:px-4 py-6 sm:px-8 sm:py-8 lg:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div
            onPointerMove={handleSpotlight}
            className={`${CARD_CHROME} overflow-hidden rounded-2xl sm:rounded-3xl bg-surface p-5 min-[360px]:p-6 sm:p-12 text-center ring-1 ring-border`}
          >
            <CardDecor />

            <div className="mx-auto max-w-2xl">
              <h2 className="text-xl min-[360px]:text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight sm:tracking-[-0.03em] text-accent break-words">
                Interested in {course.title}?
              </h2>

              <p className="mt-2 sm:mt-3 text-xs min-[360px]:text-sm sm:text-base leading-relaxed sm:leading-6 text-muted">
                Enroll now, or contact us with any questions about this course.
              </p>

              <div className="mt-5 sm:mt-8 flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center justify-center gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="group/btn inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-primary px-5 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Enroll Now
                  <ArrowUpRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 sm:size-4"
                  />
                </button>

                <Link
                  href="/contact"
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-border bg-surface px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-accent transition-colors duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          RELATED COURSES
      ========================================================= */}
      {relatedCourses.length > 0 ? (
        <section aria-labelledby="related-heading" className="px-3 min-[360px]:px-4 py-6 sm:px-8 sm:py-16 lg:px-16">
          <div className="mx-auto max-w-[1180px]">
            <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-4">
              <h2
                id="related-heading"
                className="text-base min-[360px]:text-lg sm:text-3xl font-bold tracking-tight sm:tracking-[-0.03em] text-accent"
              >
                {category ? `More in ${category.name}` : 'More courses'}
              </h2>

              <Link
                href={categoryHref ?? '/courses'}
                className="group inline-flex items-center gap-1 sm:gap-1.5 text-[10px] min-[360px]:text-xs sm:text-sm font-bold text-primary transition-colors hover:text-primary-hover"
              >
                View all
                <ArrowUpRight
                  size={12}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:size-[15px]"
                />
              </Link>
            </div>

            <ul className="mt-4 sm:mt-8 grid grid-cols-2 gap-2 min-[360px]:gap-2.5 sm:gap-5 lg:grid-cols-3">
              {relatedCourses.map((relCourse) => (
                <li key={relCourse.id} className="h-full">
                  <CourseCard course={relCourse} onEnroll={openEnrollment} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* =========================================================
          FOOTER CTA

          The padding is the card's room: it pulls itself up over whatever is
          above it (-mt-44, sm:mt-0, lg:-mt-55 in GetStartedCta.tsx), so this
          is that overlap plus a gap, and it never lands on the courses.
      ========================================================= */}
      <div className="pt-48 sm:pt-10 lg:pt-60">
        <GetStartedCta />
      </div>

      {/* =========================================================
          ENROLLMENT MODAL
      ========================================================= */}
      <LazyEnrollmentModal
        isOpen={isEnrollOpen}
        onClose={closeEnrollment}
        courseTitle={modalCourse.title}
        courseId={modalCourse.id}
      />
    </main>
  );
}
