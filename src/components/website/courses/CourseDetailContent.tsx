'use client';

import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  HelpCircle,
  Mail,
  MessageSquare,
  SignalHigh,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import { LazyEnrollmentModal } from '@/components/website/enrollment/LazyEnrollmentModal';
import GetStartedCta from '@/components/website/sections/GetStartedCta';
import { CARD_CHROME, CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';

import { categoryStyle } from './categoryStyles';
import { CourseCard } from './CourseCard';
import type { CatalogueCategory, CatalogueCourse, CatalogueSubcategory } from './types';

interface CourseDetailContentProps {
  course: CatalogueCourse;
  category?: CatalogueCategory;
  subcategory?: CatalogueSubcategory;
  relatedCourses: CatalogueCourse[];
}

export function CourseDetailContent({
  course,
  category,
  subcategory,
  relatedCourses,
}: CourseDetailContentProps) {
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [modalCourse, setModalCourse] = useState<{ title: string; id: string }>({
    title: course.title,
    id: course.id,
  });

  const style = category ? categoryStyle(category.slug) : null;
  const CategoryIcon = style?.icon ?? GraduationCap;

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

  return (
    <main className="min-h-screen">
      {/* =========================================================
          HERO & BREADCRUMBS
      ========================================================= */}
      <section className="relative isolate overflow-hidden px-4 pb-12 pt-28 sm:px-8 sm:pt-36 lg:px-16 lg:pb-16 lg:pt-40">
        {/* Ambient atmospheric glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 -top-40 size-[560px] rounded-full bg-primary/[0.08] blur-[140px]" />
          <div className="absolute -left-40 top-1/4 size-[440px] rounded-full bg-accent/[0.06] blur-[130px]" />
        </div>

        <div className="mx-auto max-w-[1180px]">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-1.5 text-xs text-muted sm:text-sm">
            <Link
              href="/courses"
              className="group inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowLeft
                aria-hidden="true"
                size={15}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              All courses
            </Link>

            <ChevronRight aria-hidden="true" size={13} className="text-muted/40" />

            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>

            <ChevronRight aria-hidden="true" size={13} className="text-muted/40" />

            <Link href="/courses" className="hover:text-primary transition-colors">
              Courses
            </Link>

            {category ? (
              <>
                <ChevronRight aria-hidden="true" size={13} className="text-muted/40" />
                <Link
                  href={`/courses?category=${category.slug}`}
                  className="hover:text-primary transition-colors truncate max-w-[140px] sm:max-w-none"
                >
                  {category.name}
                </Link>
              </>
            ) : null}

            {subcategory ? (
              <>
                <ChevronRight aria-hidden="true" size={13} className="text-muted/40" />
                <Link
                  href={`/courses?category=${category?.slug ?? 'all'}&subcategory=${subcategory.slug}`}
                  className="hover:text-primary transition-colors truncate max-w-[140px] sm:max-w-none"
                >
                  {subcategory.name}
                </Link>
              </>
            ) : null}

            <ChevronRight aria-hidden="true" size={13} className="text-muted/40" />

            <span className="truncate max-w-[160px] sm:max-w-[280px] font-semibold text-accent" aria-current="page">
              {course.title}
            </span>
          </nav>

          {/* Hero Main Content */}
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Details & Primary Actions */}
            <div className="lg:col-span-7">
              {/* Category / Subcategory / Badge Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {category && style ? (
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ring-1 ring-inset ring-border bg-surface ${style.text}`}
                  >
                    <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                    {category.name}
                  </span>
                ) : null}

                {subcategory ? (
                  <span className="inline-flex items-center rounded-full bg-surface/80 px-3 py-1 text-xs font-semibold text-muted ring-1 ring-inset ring-border">
                    {subcategory.name}
                  </span>
                ) : null}

                {course.badge ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20">
                    <Sparkles size={12} aria-hidden="true" />
                    {course.badge}
                  </span>
                ) : null}
              </div>

              {/* Course Title */}
              <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-accent sm:text-4xl lg:text-5xl lg:leading-[1.12]">
                {course.title}
              </h1>

              {/* Course Description */}
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg sm:leading-8">
                {course.description}
              </p>

              {/* Meta Stats Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted">
                <div className="flex items-center gap-2 rounded-lg bg-surface/80 px-3 py-1.5 ring-1 ring-inset ring-border">
                  <SignalHigh aria-hidden="true" size={16} className="text-primary" />
                  <span>
                    Level: <strong className="text-accent">{course.level}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-surface/80 px-3 py-1.5 ring-1 ring-inset ring-border">
                  <Clock3 aria-hidden="true" size={16} className="text-primary" />
                  <span>
                    Duration: <strong className="text-accent">{course.duration}</strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="group/btn inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-hover hover:shadow-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-7 sm:py-3.5"
                >
                  Enroll in This Course
                  <ArrowUpRight
                    aria-hidden="true"
                    size={16}
                    className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-accent transition-colors duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-6 sm:py-3.5"
                >
                  <MessageSquare size={16} aria-hidden="true" className="text-primary" />
                  Enquire Now
                </button>
              </div>

              <p className="mt-3 text-xs text-muted">
                Fast admissions response • Free academic consultation with an advisor
              </p>
            </div>

            {/* Right Column: Course Cover Card */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl bg-surface p-2 ring-1 ring-inset ring-border shadow-2xl sm:rounded-3xl">
                <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-accent/5 sm:rounded-2xl">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    priority
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-accent-strong/60 via-transparent to-transparent"
                  />

                  {course.badge ? (
                    <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20 backdrop-blur-xs">
                      {course.badge}
                    </span>
                  ) : null}

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-semibold text-white/95">
                    <span className="rounded-md bg-accent-strong/80 px-2.5 py-1 backdrop-blur-xs">
                      {course.level}
                    </span>
                    <span className="rounded-md bg-accent-strong/80 px-2.5 py-1 backdrop-blur-xs">
                      {course.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          KEY HIGHLIGHTS STRIP
      ========================================================= */}
      <section className="border-y border-border bg-surface/60 px-4 py-8 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock3 size={20} aria-hidden="true" />
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Duration</dt>
                <dd className="text-sm font-bold text-accent sm:text-base">{course.duration}</dd>
                <p className="text-[11px] text-muted">Structured curriculum</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <SignalHigh size={20} aria-hidden="true" />
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Skill Level</dt>
                <dd className="text-sm font-bold text-accent sm:text-base">{course.level}</dd>
                <p className="text-[11px] text-muted">Entry to advancement</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CategoryIcon size={20} aria-hidden="true" />
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Pathway</dt>
                <dd className="text-sm font-bold text-accent sm:text-base">
                  {category ? category.name.split(' ')[0] : 'Cloudversity'}
                </dd>
                <p className="text-[11px] text-muted truncate max-w-[120px] sm:max-w-none">
                  {subcategory?.name ?? 'Comprehensive Track'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award size={20} aria-hidden="true" />
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Credential</dt>
                <dd className="text-sm font-bold text-accent sm:text-base">Certificate</dd>
                <p className="text-[11px] text-muted">Upon completion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN DETAILS & SIDEBAR
      ========================================================= */}
      <section className="px-4 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Main Content Column */}
          <div className="space-y-12 lg:col-span-8">
            {/* 1. About the Course */}
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                <span aria-hidden="true" className="h-px w-5 bg-primary/50" />
                Course Overview
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-accent sm:text-3xl">
                About this course
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-muted">
                <p>{course.description}</p>
                <p>
                  At Ayadi Cloudversity, this program is structured to provide an immersive, hands-on
                  learning experience. Whether balancing academic commitments or preparing for career
                  milestones, the curriculum balances foundational theory with practical application,
                  ensuring learners build tangible capabilities.
                </p>
                <p>
                  Each module is crafted to progress logically from core principles to real-world exercises,
                  supported by faculty guidance, academic resources, and collaborative problem-solving.
                </p>
              </div>
            </div>

            {/* 2. Who This Course Is For */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <h3 className="text-xl font-bold tracking-[-0.02em] text-accent sm:text-2xl">
                Who this course is for
              </h3>
              <p className="mt-2 text-sm text-muted">
                Tailored for learners matching the {course.level.toLowerCase()} level of this program:
              </p>

              <ul className="mt-6 space-y-3.5">
                <li className="flex items-start gap-3 text-sm leading-6 text-muted">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <strong className="text-accent">Learners seeking focused expertise:</strong> Designed
                    for individuals aiming to master essential competencies in {course.title}.
                  </span>
                </li>

                <li className="flex items-start gap-3 text-sm leading-6 text-muted">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <strong className="text-accent">Targeted skill level ({course.level}):</strong> Best
                    suited for students and professionals matching this pathway&apos;s level of rigor.
                  </span>
                </li>

                {category ? (
                  <li className="flex items-start gap-3 text-sm leading-6 text-muted">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <strong className="text-accent">{category.name} track:</strong> Ideal for learners
                      pursuing goals within this learning pathway.
                    </span>
                  </li>
                ) : null}

                <li className="flex items-start gap-3 text-sm leading-6 text-muted">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <strong className="text-accent">Applied outcomes:</strong> Anyone aiming to gain
                    practical capabilities, build projects, and earn recognized credentials.
                  </span>
                </li>
              </ul>
            </div>

            {/* 3. Program Structure & Expectations */}
            <div>
              <h3 className="text-xl font-bold tracking-[-0.02em] text-accent sm:text-2xl">
                What you will experience
              </h3>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div
                  onPointerMove={handleSpotlight}
                  className={`${CARD_CHROME} p-5 flex flex-col justify-between`}
                >
                  <CardDecor />
                  <div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen size={20} aria-hidden="true" />
                    </div>
                    <h4 className="mt-4 text-base font-bold text-accent">Structured Learning Path</h4>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Organized modules designed to take you step-by-step from foundational topics to advanced
                      practical exercises over {course.duration}.
                    </p>
                  </div>
                </div>

                <div
                  onPointerMove={handleSpotlight}
                  className={`${CARD_CHROME} p-5 flex flex-col justify-between`}
                >
                  <CardDecor />
                  <div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Award size={20} aria-hidden="true" />
                    </div>
                    <h4 className="mt-4 text-base font-bold text-accent">Verified Ayadi Certificate</h4>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Receive an official Ayadi Cloudversity Certificate of Completion upon finishing coursework
                      and program milestones.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-border bg-surface/50 p-4 text-xs text-muted flex items-start gap-2.5">
                <HelpCircle size={16} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Detailed syllabus breakdowns, cohort schedules, and specific module syllabi are reviewed directly with
                  an admissions advisor upon enquiry.
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            {/* Quick Enrollment Card */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm ring-1 ring-border/50">
              <h3 className="text-lg font-bold text-accent">Ready to Enroll?</h3>
              <p className="mt-2 text-xs leading-5 text-muted">
                Secure your spot or speak directly with an educational advisor about prerequisites, schedules, and pathways.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-3 px-5 text-sm font-bold text-white transition-colors duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Enroll Now
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border py-2.5 px-5 text-xs font-semibold text-accent transition-colors duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Mail size={14} aria-hidden="true" />
                  Request Course Information
                </button>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted">Course ID</dt>
                    <dd className="font-mono font-medium text-accent">{course.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Duration</dt>
                    <dd className="font-medium text-accent">{course.duration}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Skill Level</dt>
                    <dd className="font-medium text-accent">{course.level}</dd>
                  </div>
                  {subcategory ? (
                    <div className="flex justify-between">
                      <dt className="text-muted">Subcategory</dt>
                      <dd className="font-medium text-accent">{subcategory.name}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>

            {/* Pathway Context Card */}
            {category ? (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  Learning Pathway
                </p>
                <h4 className="mt-2 text-base font-bold text-accent">{category.name}</h4>
                <p className="mt-2 text-xs leading-5 text-muted">{category.description}</p>

                <Link
                  href={`/courses?category=${category.slug}`}
                  className="group mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:text-primary-hover"
                >
                  View all {category.name} courses
                  <ArrowUpRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            ) : null}

            {/* Admissions Help Card */}
            <div className="rounded-2xl border border-border bg-surface/50 p-6">
              <h4 className="text-sm font-bold text-accent">Questions before enrolling?</h4>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                Our advisors can help you choose the right program and clarify learning prerequisites.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Contact Admissions Support →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* =========================================================
          COURSE-SPECIFIC ENQUIRY CALL TO ACTION BANNER
      ========================================================= */}
      <section className="px-4 py-8 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div
            onPointerMove={handleSpotlight}
            className={`${CARD_CHROME} overflow-hidden rounded-3xl bg-surface p-8 sm:p-12 text-center ring-1 ring-border`}
          >
            <CardDecor />

            <div className="mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                <Sparkles size={13} aria-hidden="true" />
                Take the Next Step
              </span>

              <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-accent sm:text-3xl md:text-4xl">
                Ready to begin {course.title}?
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                Enroll now or submit an enquiry to connect with our academic advisors and receive comprehensive course materials.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="group/btn inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Enroll Now
                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                  />
                </button>

                <Link
                  href="/contact"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-accent transition-colors duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Contact Admissions
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
        <section aria-labelledby="related-heading" className="px-4 py-12 sm:px-8 sm:py-16 lg:px-16">
          <div className="mx-auto max-w-[1180px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  <span aria-hidden="true" className="h-px w-5 bg-primary/50" />
                  Explore More
                </span>
                <h2
                  id="related-heading"
                  className="mt-2 text-2xl font-bold tracking-[-0.03em] text-accent sm:text-3xl"
                >
                  More in {category?.name ?? 'This Pathway'}
                </h2>
              </div>

              <Link
                href={category ? `/courses?category=${category.slug}` : '/courses'}
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:text-primary-hover sm:text-sm"
              >
                View all pathway courses
                <ArrowUpRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCourses.map((relCourse) => (
                <li key={relCourse.id} className="h-full">
                  <CourseCard
                    course={relCourse}
                    category={category}
                    onEnroll={openEnrollment}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* =========================================================
          FOOTER CTA
      ========================================================= */}
      <div className="pt-10">
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
