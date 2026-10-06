"use client";

import { Sparkles } from "lucide-react";

import { cleanSlug } from "@/components/admin/categories/category-utils";
import Field from "@/components/admin/ui/Field";
import FormSection from "@/components/admin/ui/FormSection";
import SlugInput from "@/components/admin/ui/SlugInput";
import { inputClass } from "@/components/admin/ui/styles";

import type { CourseFieldsProps } from "./course-form";

interface CourseBasicFieldsProps extends CourseFieldsProps {
  /** True while the slug still follows the course name. */
  autoSlug: boolean;
}

/** What the course is called and how it is described. */
export default function CourseBasicFields({
  values,
  errors,
  disabled,
  autoSlug,
  onChange,
}: CourseBasicFieldsProps) {
  return (
    <FormSection title="Basic information">
      <Field
        label="Course name"
        htmlFor="course-title"
        required
        error={errors.title}
      >
        <input
          id="course-title"
          type="text"
          data-autofocus
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="e.g. Python for Data Science"
          maxLength={200}
          disabled={disabled}
          aria-invalid={Boolean(errors.title)}
          className={`${inputClass(Boolean(errors.title))} h-11`}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Course code"
          htmlFor="course-code"
          required
          hint="Must be different for every course."
          error={errors.courseCode}
        >
          <input
            id="course-code"
            type="text"
            value={values.courseCode}
            onChange={(event) =>
              onChange("courseCode", event.target.value)
            }
            placeholder="e.g. AC-PY-001"
            maxLength={50}
            disabled={disabled}
            aria-invalid={Boolean(errors.courseCode)}
            className={`${inputClass(Boolean(errors.courseCode))} h-11`}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="course-slug"
          required
          aside={
            autoSlug && (
              <span className="inline-flex items-center gap-1 font-medium text-primary">
                <Sparkles size={11} />
                Auto-generating
              </span>
            )
          }
          error={errors.slug}
        >
          <SlugInput
            id="course-slug"
            value={values.slug}
            onChange={(slug) => onChange("slug", cleanSlug(slug))}
            placeholder="python-for-data-science"
            invalid={Boolean(errors.slug)}
            disabled={disabled}
          />
        </Field>
      </div>

      <Field
        label="Short description"
        htmlFor="course-short-description"
        hint="One or two lines, shown on the course card."
      >
        <textarea
          id="course-short-description"
          rows={2}
          value={values.shortDescription}
          onChange={(event) =>
            onChange("shortDescription", event.target.value)
          }
          placeholder="Summarise the course in a sentence or two..."
          disabled={disabled}
          className={`${inputClass()} resize-none py-3 leading-6`}
        />
      </Field>

      <Field label="Description" htmlFor="course-description">
        <textarea
          id="course-description"
          rows={7}
          value={values.description}
          onChange={(event) =>
            onChange("description", event.target.value)
          }
          placeholder="What the course covers, who it is for and what learners come away with..."
          disabled={disabled}
          className={`${inputClass()} resize-y py-3 leading-6`}
        />
      </Field>
    </FormSection>
  );
}
