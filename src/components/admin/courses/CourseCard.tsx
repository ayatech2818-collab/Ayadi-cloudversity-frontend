"use client";

import {
  BookOpen,
  Clock,
  Pencil,
  Signal,
  Trash2,
} from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import {
  buttonClass,
  iconButtonClass,
} from "@/components/admin/ui/styles";
import type { Course } from "@/lib/api/courses";

const CHIP =
  "inline-flex max-w-full items-center gap-1 rounded-full bg-page px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-inset ring-border";

interface CourseCardProps {
  course: Course;
  /** "Main category › Sub category"; empty for a course filed under neither. */
  placement: string;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Built to work two-across on a phone: the padding, type and the Edit label
 * step up from `sm`.
 */
export default function CourseCard({
  course,
  placement,
  onEdit,
  onDelete,
}: CourseCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)]">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <CoverImage
          src={course.thumbnail_url}
          icon={BookOpen}
          imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-accent-strong/45 via-transparent to-accent-strong/20"
        />

        <span className="absolute left-2.5 top-2.5 sm:left-3.5 sm:top-3.5">
          <StatusBadge published={course.is_published} />
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <p
          title={course.course_code}
          className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary sm:text-[11px]"
        >
          {course.course_code}
        </p>

        <h2
          title={course.title}
          className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug tracking-[-0.01em] text-accent sm:text-base"
        >
          {course.title}
        </h2>

        <p
          title={placement || undefined}
          className="mt-1 truncate text-[11px] text-muted"
        >
          {placement || "Directly under the brand"}
        </p>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted sm:text-[13px]">
          {course.short_description || "No description provided."}
        </p>

        {(course.duration || course.level) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {course.duration && (
              <span className={CHIP}>
                <Clock size={11} className="shrink-0" />
                <span className="truncate">{course.duration}</span>
              </span>
            )}

            {course.level && (
              <span className={CHIP}>
                <Signal size={11} className="shrink-0" />
                <span className="truncate">{course.level}</span>
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <p className="text-[11px] text-muted">
            Order{" "}
            <span className="font-semibold tabular-nums text-text">
              {course.display_order}
            </span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${course.title}`}
              className={buttonClass("secondary", "sm")}
            >
              <Pencil size={13} className="text-primary" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${course.title}`}
              title="Delete"
              className={iconButtonClass(true)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
