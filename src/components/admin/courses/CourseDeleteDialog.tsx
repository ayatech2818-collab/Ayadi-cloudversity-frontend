"use client";

import { BookOpen } from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import DeleteDialog from "@/components/admin/ui/DeleteDialog";
import type { Course } from "@/lib/api/courses";

interface CourseDeleteDialogProps {
  course: Course | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CourseDeleteDialog({
  course,
  loading = false,
  onCancel,
  onConfirm,
}: CourseDeleteDialogProps) {
  return (
    <DeleteDialog
      open={course !== null}
      id="course-delete-title"
      title="Delete this course?"
      description="This permanently deletes the course and its thumbnail. This action cannot be undone."
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {course && (
        <div className="flex items-center gap-3 rounded-2xl bg-page/70 p-3 ring-1 ring-inset ring-border">
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg">
            <CoverImage src={course.thumbnail_url} icon={BookOpen} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-accent">
              {course.title}
            </p>

            <p className="truncate text-xs text-muted">
              {course.course_code}
              {" · "}
              {course.is_published ? "Published" : "Draft"}
            </p>
          </div>
        </div>
      )}
    </DeleteDialog>
  );
}
