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
      <section className="relative isolate overflow-hidden px-3 min-[360px]:px-4 pb-8 pt-24 sm:px-8 sm:pb-12 sm:pt-36 lg:px-16 lg:pb-16 lg:pt-40">
        {/* Ambient atmospheric glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 -top-40 size-[560px] rounded-full bg-primary/[0.08] blur-[140px]" />
          <div className="absolute -left-40 top-1/4 size-[440px] rounded-full bg-accent/[0.06] blur-[130px]" />
        </div>

        <div className="mx-auto max-w-[1180px]">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-1 min-[360px]:gap-1.5 text-[11px] min-[360px]:text-xs text-muted sm:text-sm">
            <Link
              href="/courses"
              className="group inline-flex items-center gap-1 min-[360px]:gap-1.5 font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowLeft
                aria-hidden="true"
                size={13}
                className="transition-transform duration-300 group-hover:-translate-x-1 sm:size-[15px]"
              />
              All courses
            </Link>

            <ChevronRight aria-hidden="true" size={11} className="text-muted/40 sm:size-[13px]" />

            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>

            <ChevronRight aria-hidden="true" size={11} className="text-muted/40 sm:size-[13px]" />

            <Link href="/courses" className="hover:text-primary transition-colors">
              Courses
            </Link>

            {category ? (
              <>
                <ChevronRight aria-hidden="true" size={11} className="text-muted/40 sm:size-[13px]" />
                <Link
                  href={`/courses?category=${category.slug}`}
                  className="hover:text-primary transition-colors truncate max-w-[100px] min-[360px]:max-w-[140px] sm:max-w-none"
                >
                  {category.name}
                </Link>
              </>
            ) : null}

            {subcategory ? (
              <>
                <ChevronRight aria-hidden="true" size={11} className="text-muted/40 sm:size-[13px]" />
                <Link
                  href={`/courses?category=${category?.slug ?? 'all'}&subcategory=${subcategory.slug}`}
                  className="hover:text-primary transition-colors truncate max-w-[100px] min-[360px]:max-w-[140px] sm:max-w-none"
                >
                  {subcategory.name}
                </Link>
              </>
            ) : null}

            <ChevronRight aria-hidden="true" size={11} className="text-muted/40 sm:size-[13px]" />

            <span className="truncate max-w-[120px] min-[360px]:max-w-[160px] sm:max-w-[280px] font-semibold text-accent" aria-current="page">
              {course.title}
            </span>
          </nav>

          {/* Hero Main Content */}
          <div className="mt-5 sm:mt-8 grid items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Details & Primary Actions */}
            <div className="lg:col-span-7">
              {/* Category / Subcategory / Badge Badges */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {category && style ? (
                  <span
                    className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-[0.14em] ring-1 ring-inset ring-border bg-surface ${style.text}`}
                  >
                    <span aria-hidden="true" className={`size-1.5 sm:size-2 shrink-0 rounded-full ${style.dot}`} />
                    {category.name}
                  </span>
                ) : null}

                {subcategory ? (
                  <span className="inline-flex items-center rounded-full bg-surface/80 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-muted ring-1 ring-inset ring-border">
                    {subcategory.name}
                  </span>
                ) : null}

                {course.badge ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20">
                    <Sparkles size={11} aria-hidden="true" className="sm:size-3" />
                    {course.badge}
                  </span>
                ) : null}
              </div>

              {/* Course Title */}
              <h1 className="mt-2.5 sm:mt-4 text-2xl min-[360px]:text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight sm:tracking-[-0.03em] text-accent lg:leading-[1.12]">
                {course.title}
              </h1>

              {/* Course Description */}
              <p className="mt-2.5 sm:mt-4 text-xs min-[360px]:text-sm sm:text-lg leading-relaxed sm:leading-8 text-muted">
                {course.description}
              </p>

              {/* Meta Stats Badges */}
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted">
                <div className="flex items-center gap-1.5 sm:gap-2 rounded-md sm:rounded-lg bg-surface/80 px-2.5 py-1 sm:px-3 sm:py-1.5 ring-1 ring-inset ring-border text-[11px] min-[360px]:text-xs sm:text-sm">
                  <SignalHigh aria-hidden="true" size={14} className="text-primary sm:size-4" />
                  <span>
                    Level: <strong className="text-accent">{course.level}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 rounded-md sm:rounded-lg bg-surface/80 px-2.5 py-1 sm:px-3 sm:py-1.5 ring-1 ring-inset ring-border text-[11px] min-[360px]:text-xs sm:text-sm">
                  <Clock3 aria-hidden="true" size={14} className="text-primary sm:size-4" />
                  <span>
                    Duration: <strong className="text-accent">{course.duration}</strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 sm:mt-8 flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="group/btn inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-primary px-5 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-hover hover:shadow-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-border bg-surface px-4 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold text-accent transition-colors duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <MessageSquare size={14} aria-hidden="true" className="text-primary sm:size-4" />
                  Enquire Now
                </button>
              </div>

              <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-muted">
                Fast admissions response • Free academic consultation with an advisor
              </p>
            </div>

            {/* Right Column: Course Cover Card */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-xl sm:rounded-3xl bg-surface p-1.5 sm:p-2 ring-1 ring-inset ring-border shadow-2xl">
                <div className="relative aspect-[16/10] sm:aspect-[16/11] overflow-hidden rounded-lg sm:rounded-2xl bg-accent/5">
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
                    <span className="absolute left-2.5 top-2.5 sm:left-4 sm:top-4 rounded-full bg-surface/90 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20 backdrop-blur-xs">
                      {course.badge}
                    </span>
                  ) : null}

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between text-[10px] min-[360px]:text-xs font-semibold text-white/95">
                    <span className="rounded-sm sm:rounded-md bg-accent-strong/80 px-2 py-0.5 sm:px-2.5 sm:py-1 backdrop-blur-xs">
                      {course.level}
                    </span>
                    <span className="rounded-sm sm:rounded-md bg-accent-strong/80 px-2 py-0.5 sm:px-2.5 sm:py-1 backdrop-blur-xs">
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
      <section className="border-y border-border bg-surface/60 px-3 min-[360px]:px-4 py-5 sm:px-8 sm:py-8 lg:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                <Clock3 size={16} aria-hidden="true" className="sm:size-5" />
              </div>
              <div>
                <dt className="text-[10px] sm:text-xs font-medium text-muted">Duration</dt>
                <dd className="text-xs min-[360px]:text-sm sm:text-base font-bold text-accent">{course.duration}</dd>
                <p className="text-[10px] sm:text-[11px] text-muted">Structured curriculum</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                <SignalHigh size={16} aria-hidden="true" className="sm:size-5" />
              </div>
              <div>
                <dt className="text-[10px] sm:text-xs font-medium text-muted">Skill Level</dt>
                <dd className="text-xs min-[360px]:text-sm sm:text-base font-bold text-accent">{course.level}</dd>
                <p className="text-[10px] sm:text-[11px] text-muted">Entry to advancement</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                <CategoryIcon size={16} aria-hidden="true" className="sm:size-5" />
              </div>
              <div>
                <dt className="text-[10px] sm:text-xs font-medium text-muted">Pathway</dt>
                <dd className="text-xs min-[360px]:text-sm sm:text-base font-bold text-accent">
                  {category ? category.name.split(' ')[0] : 'Cloudversity'}
                </dd>
                <p className="text-[10px] sm:text-[11px] text-muted truncate max-w-[100px] min-[360px]:max-w-[120px] sm:max-w-none">
                  {subcategory?.name ?? 'Comprehensive Track'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary">
                <Award size={16} aria-hidden="true" className="sm:size-5" />
              </div>
              <div>
                <dt className="text-[10px] sm:text-xs font-medium text-muted">Credential</dt>
                <dd className="text-xs min-[360px]:text-sm sm:text-base font-bold text-accent">Certificate</dd>
                <p className="text-[10px] sm:text-[11px] text-muted">Upon completion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN DETAILS & SIDEBAR
      ========================================================= */}
      <section className="px-3 min-[360px]:px-4 py-8 sm:px-8 sm:py-16 lg:px-16 lg:py-20">
        <div className="mx-auto grid max-w-[1180px] gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Main Content Column */}
          <div className="space-y-8 sm:space-y-12 lg:col-span-8">
            {/* 1. About the Course */}
            <div>
              <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-[0.2em] text-primary">
                <span aria-hidden="true" className="h-px w-4 sm:w-5 bg-primary/50" />
                Course Overview
              </span>
              <h2 className="mt-2 sm:mt-3 text-xl sm:text-3xl font-bold tracking-tight sm:tracking-[-0.03em] text-accent">
                About this course
              </h2>
              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 text-xs min-[360px]:text-sm sm:text-base leading-relaxed sm:leading-8 text-muted">
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
            <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-4 min-[360px]:p-5 sm:p-8">
              <h3 className="text-base min-[360px]:text-lg sm:text-2xl font-bold tracking-tight sm:tracking-[-0.02em] text-accent">
                Who this course is for
              </h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted">
                Tailored for learners matching the {course.level.toLowerCase()} level of this program:
              </p>

              <ul className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3.5">
                <li className="flex items-start gap-2.5 sm:gap-3 text-xs min-[360px]:text-sm leading-normal sm:leading-6 text-muted">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary sm:size-[18px]" aria-hidden="true" />
                  <span>
                    <strong className="text-accent">Learners seeking focused expertise:</strong> Designed
                    for individuals aiming to master essential competencies in {course.title}.
                  </span>
                </li>

                <li className="flex items-start gap-2.5 sm:gap-3 text-xs min-[360px]:text-sm leading-normal sm:leading-6 text-muted">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary sm:size-[18px]" aria-hidden="true" />
                  <span>
                    <strong className="text-accent">Targeted skill level ({course.level}):</strong> Best
                    suited for students and professionals matching this pathway&apos;s level of rigor.
                  </span>
                </li>

                {category ? (
                  <li className="flex items-start gap-2.5 sm:gap-3 text-xs min-[360px]:text-sm leading-normal sm:leading-6 text-muted">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary sm:size-[18px]" aria-hidden="true" />
                    <span>
                      <strong className="text-accent">{category.name} track:</strong> Ideal for learners
                      pursuing goals within this learning pathway.
                    </span>
                  </li>
                ) : null}

                <li className="flex items-start gap-2.5 sm:gap-3 text-xs min-[360px]:text-sm leading-normal sm:leading-6 text-muted">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary sm:size-[18px]" aria-hidden="true" />
                  <span>
                    <strong className="text-accent">Applied outcomes:</strong> Anyone aiming to gain
                    practical capabilities, build projects, and earn recognized credentials.
                  </span>
                </li>
              </ul>
            </div>

            {/* 3. Program Structure & Expectations */}
            <div>
              <h3 className="text-base min-[360px]:text-lg sm:text-2xl font-bold tracking-tight sm:tracking-[-0.02em] text-accent">
                What you will experience
              </h3>

              <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div
                  onPointerMove={handleSpotlight}
                  className={`${CARD_CHROME} p-4 sm:p-5 flex flex-col justify-between rounded-xl sm:rounded-2xl`}
                >
                  <CardDecor />
                  <div>
                    <div className="flex size-8 sm:size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookOpen size={16} aria-hidden="true" className="sm:size-5" />
                    </div>
                    <h4 className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-accent">Structured Learning Path</h4>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-normal sm:leading-6 text-muted">
                      Organized modules designed to take you step-by-step from foundational topics to advanced
                      practical exercises over {course.duration}.
                    </p>
                  </div>
                </div>

                <div
                  onPointerMove={handleSpotlight}
                  className={`${CARD_CHROME} p-4 sm:p-5 flex flex-col justify-between rounded-xl sm:rounded-2xl`}
                >
                  <CardDecor />
                  <div>
                    <div className="flex size-8 sm:size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Award size={16} aria-hidden="true" className="sm:size-5" />
                    </div>
                    <h4 className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-accent">Verified Ayadi Certificate</h4>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-normal sm:leading-6 text-muted">
                      Receive an official Ayadi Cloudversity Certificate of Completion upon finishing coursework
                      and program milestones.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 rounded-xl border border-dashed border-border bg-surface/50 p-3 sm:p-4 text-[11px] sm:text-xs text-muted flex items-start gap-2 sm:gap-2.5">
                <HelpCircle size={15} className="text-primary shrink-0 mt-0.5 sm:size-4" aria-hidden="true" />
                <span>
                  Detailed syllabus breakdowns, cohort schedules, and specific module syllabi are reviewed directly with
                  an admissions advisor upon enquiry.
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-4 sm:space-y-6 lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            {/* Quick Enrollment Card */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-4 min-[360px]:p-5 sm:p-6 shadow-sm ring-1 ring-border/50">
              <h3 className="text-base sm:text-lg font-bold text-accent">Ready to Enroll?</h3>
              <p className="mt-1.5 sm:mt-2 text-xs leading-normal sm:leading-5 text-muted">
                Secure your spot or speak directly with an educational advisor about prerequisites, schedules, and pathways.
              </p>

              <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-primary py-2.5 sm:py-3 px-4 sm:px-5 text-xs sm:text-sm font-bold text-white transition-colors duration-300 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Enroll Now
                  <ArrowUpRight size={14} aria-hidden="true" className="sm:size-[15px]" />
                </button>

                <button
                  type="button"
                  onClick={() => openEnrollment()}
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-border py-2 sm:py-2.5 px-4 sm:px-5 text-[11px] sm:text-xs font-semibold text-accent transition-colors duration-300 hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Mail size={13} aria-hidden="true" className="sm:size-3.5" />
                  Request Course Information
                </button>
              </div>

              <div className="mt-4 sm:mt-5 border-t border-border pt-3.5 sm:pt-4">
                <dl className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted">Course ID</dt>
                    <dd className="font-mono font-medium text-accent truncate max-w-[150px] sm:max-w-none">{course.id}</dd>
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
                      <dd className="font-medium text-accent truncate max-w-[150px] sm:max-w-none">{subcategory.name}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>

            {/* Pathway Context Card */}
            {category ? (
              <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-4 min-[360px]:p-5 sm:p-6 shadow-sm">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-[0.2em] text-primary">
                  Learning Pathway
                </p>
                <h4 className="mt-1.5 sm:mt-2 text-sm sm:text-base font-bold text-accent">{category.name}</h4>
                <p className="mt-1.5 sm:mt-2 text-xs leading-normal sm:leading-5 text-muted">{category.description}</p>

                <Link
                  href={`/courses?category=${category.slug}`}
                  className="group mt-3 sm:mt-4 inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-primary transition-colors hover:text-primary-hover"
                >
                  View all {category.name} courses
                  <ArrowUpRight
                    size={13}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:size-3.5"
                  />
                </Link>
              </div>
            ) : null}

            {/* Admissions Help Card */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-surface/50 p-4 min-[360px]:p-5 sm:p-6">
              <h4 className="text-xs sm:text-sm font-bold text-accent">Questions before enrolling?</h4>
              <p className="mt-1 sm:mt-1.5 text-xs leading-normal sm:leading-5 text-muted">
                Our advisors can help you choose the right program and clarify learning prerequisites.
              </p>
              <Link
                href="/contact"
                className="mt-2.5 sm:mt-3 inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-primary hover:underline"
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
      <section className="px-3 min-[360px]:px-4 py-6 sm:px-8 sm:py-8 lg:px-16">
        <div className="mx-auto max-w-[1180px]">
          <div
            onPointerMove={handleSpotlight}
            className={`${CARD_CHROME} overflow-hidden rounded-2xl sm:rounded-3xl bg-surface p-5 min-[360px]:p-6 sm:p-12 text-center ring-1 ring-border`}
          >
            <CardDecor />

            <div className="mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-primary/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-[0.16em] text-primary">
                <Sparkles size={11} aria-hidden="true" className="sm:size-3.5" />
                Take the Next Step
              </span>

              <h2 className="mt-2.5 sm:mt-4 text-xl min-[360px]:text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight sm:tracking-[-0.03em] text-accent">
                Ready to begin {course.title}?
              </h2>

              <p className="mt-2 sm:mt-3 text-xs min-[360px]:text-sm sm:text-base leading-relaxed sm:leading-6 text-muted">
                Enroll now or submit an enquiry to connect with our academic advisors and receive comprehensive course materials.
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
        <section aria-labelledby="related-heading" className="px-3 min-[360px]:px-4 py-6 sm:px-8 sm:py-16 lg:px-16">
          <div className="mx-auto max-w-[1180px]">
            <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-[0.2em] text-primary">
                  <span aria-hidden="true" className="h-px w-3.5 sm:w-5 bg-primary/50" />
                  Explore More
                </span>
                <h2
                  id="related-heading"
                  className="mt-1 sm:mt-2 text-base min-[360px]:text-lg sm:text-3xl font-bold tracking-tight sm:tracking-[-0.03em] text-accent"
                >
                  More in {category?.name ?? 'This Pathway'}
                </h2>
              </div>

              <Link
                href={category ? `/courses?category=${category.slug}` : '/courses'}
                className="group inline-flex items-center gap-1 sm:gap-1.5 text-[10px] min-[360px]:text-xs sm:text-sm font-bold text-primary transition-colors hover:text-primary-hover"
              >
                View all pathway courses
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
      <div className="pt-6 sm:pt-10">
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
