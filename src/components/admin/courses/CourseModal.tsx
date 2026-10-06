"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  BookPlus,
  Check,
  LoaderCircle,
  PencilLine,
} from "lucide-react";

import Alert from "@/components/admin/ui/Alert";
import Modal, {
  ModalFooter,
  ModalHeader,
} from "@/components/admin/ui/Modal";
import { generateSlug } from "@/components/admin/ui/SlugInput";
import { buttonClass } from "@/components/admin/ui/styles";
import type { CourseBrand } from "@/lib/api/course-brands";
import type { CourseCategory } from "@/lib/api/course-categories";
import type { CourseSubcategory } from "@/lib/api/course-subcategories";
import type { Course, CourseFormData } from "@/lib/api/courses";
import { getApiErrorMessage } from "@/lib/api/errors";

import CourseBasicFields from "./CourseBasicFields";
import CoursePlacementFields from "./CoursePlacementFields";
import CourseSettingsFields from "./CourseSettingsFields";
import CourseThumbnailField from "./CourseThumbnailField";
import {
  brandUsesCategories,
  toCoursePayload,
  toFormValues,
  validateCourseForm,
  type CourseFieldsProps,
  type CourseFormErrors,
  type CoursePlacement,
} from "./course-form";
import {
  COURSE_THUMBNAIL_LABEL,
  isCourseThumbnail,
} from "./course-utils";

interface CourseModalProps {
  open: boolean;
  mode: "create" | "edit";
  course: Course | null;

  /** Active brands. */
  brands: CourseBrand[];
  /** Every brand's main categories. */
  categories: CourseCategory[];
  /** Every main category's sub categories. */
  subcategories: CourseSubcategory[];
  /** Where a new course starts — what the page is filtered to. */
  defaults: CoursePlacement;

  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
}

export default function CourseModal({
  open,
  ...form
}: CourseModalProps) {
  return (
    // No Esc-to-close: a stray key press must not throw the form away.
    <Modal
      open={open}
      closeOnEscape={false}
      onClose={form.onClose}
      labelledBy="course-modal-title"
      size="xl"
    >
      {/* Mounted per open, so the fields always start from this course. */}
      <CourseForm
        key={`${form.mode}:${form.course?.id ?? "new"}`}
        {...form}
      />
    </Modal>
  );
}

function CourseForm({
  mode,
  course,
  brands,
  categories,
  subcategories,
  defaults,
  onClose,
  onSubmit,
}: Omit<CourseModalProps, "open">) {
  const isEdit = mode === "edit";

  const [values, setValues] = useState(() =>
    toFormValues(course, defaults)
  );

  // A new course takes its slug from the name until the slug is typed by hand.
  const [slugEdited, setSlugEdited] = useState(isEdit);

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<
    string | null
  >(null);

  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);

  // Revokes the outgoing object URL whenever the pick changes or the form
  // unmounts — the one place a leak could happen.
  useEffect(() => {
    if (!thumbnailPreview) return;

    return () => URL.revokeObjectURL(thumbnailPreview);
  }, [thumbnailPreview]);

  const handleChange: CourseFieldsProps["onChange"] = (
    field,
    value
  ) => {
    const followsTitle = field === "title" && !slugEdited;

    // A main category belongs to one brand and a sub category to one main
    // category, so changing a level clears what was picked beneath it.
    const clearsCategory = field === "brandId";
    const clearsSubcategory =
      field === "brandId" || field === "categoryId";

    setValues((current) => {
      const next = { ...current, [field]: value };

      if (followsTitle) next.slug = generateSlug(next.title);
      if (clearsCategory) next.categoryId = "";
      if (clearsSubcategory) next.subcategoryId = "";

      return next;
    });

    if (field === "slug") setSlugEdited(true);

    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(followsTitle && { slug: undefined }),
      ...(clearsCategory && { categoryId: undefined }),
      ...(clearsSubcategory && { subcategoryId: undefined }),
    }));
  };

  const handleThumbnailSelect = (file: File) => {
    if (!isCourseThumbnail(file)) {
      setErrors((current) => ({
        ...current,
        thumbnail: `The thumbnail must be a ${COURSE_THUMBNAIL_LABEL} image.`,
      }));

      return;
    }

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, thumbnail: undefined }));
  };

  const handleThumbnailClear = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  /** Errors show at the top of the form, so bring the top into view. */
  const showFormError = (message: string) => {
    setFormError(message);
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Guards against a double submit from a fast second click.
    if (saving) return;

    const nextErrors = validateCourseForm(
      values,
      categories,
      subcategories
    );

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showFormError("Please fix the fields marked in red.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      // The page closes the modal once the request succeeds.
      await onSubmit(
        toCoursePayload(
          values,
          thumbnail,
          brandUsesCategories(categories, values.brandId)
        )
      );
    } catch (error) {
      console.error("Failed to save course:", error);

      showFormError(
        getApiErrorMessage(
          error,
          "Something went wrong while saving the course. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const fields: CourseFieldsProps = {
    values,
    errors,
    disabled: saving,
    onChange: handleChange,
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <ModalHeader
        id="course-modal-title"
        icon={isEdit ? PencilLine : BookPlus}
        title={isEdit ? "Edit Course" : "Add Course"}
        description={
          isEdit
            ? "Update the course, its placement and its thumbnail."
            : "Create a new course under one of the learning brands."
        }
        onClose={onClose}
        disabled={saving}
      />

      <div
        ref={bodyRef}
        className="flex-1 space-y-5 overflow-y-auto bg-page/60 p-4 sm:p-6"
      >
        {formError && <Alert>{formError}</Alert>}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <CoursePlacementFields
              {...fields}
              brands={brands}
              categories={categories}
              subcategories={subcategories}
            />

            <CourseBasicFields {...fields} autoSlug={!slugEdited} />
          </div>

          <div className="space-y-5">
            <CourseThumbnailField
              preview={thumbnailPreview ?? course?.thumbnail_url ?? null}
              fileName={thumbnail?.name}
              clearLabel={
                course?.thumbnail_url
                  ? "Keep current thumbnail"
                  : "Remove"
              }
              disabled={saving}
              error={errors.thumbnail}
              onSelect={handleThumbnailSelect}
              onClear={handleThumbnailClear}
            />

            <CourseSettingsFields {...fields} />
          </div>
        </div>
      </div>

      <ModalFooter>
        {/* What saving will do, in case the switch has scrolled away */}
        <p className="mr-auto flex items-center gap-2 text-[11px] font-semibold text-muted">
          <span
            className={`h-2 w-2 rounded-full ${
              values.isPublished ? "bg-brand-gradient" : "bg-amber-400"
            }`}
          />
          {values.isPublished
            ? "Saves as published"
            : "Saves as a draft"}
        </p>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className={buttonClass("secondary")}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className={buttonClass("primary")}
        >
          {saving ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Check size={16} strokeWidth={2.5} />
          )}
          {saving
            ? "Saving..."
            : isEdit
              ? "Save Changes"
              : "Create Course"}
        </button>
      </ModalFooter>
    </form>
  );
}
