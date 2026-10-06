"use client";

import Field from "@/components/admin/ui/Field";
import FormSection from "@/components/admin/ui/FormSection";
import Select from "@/components/admin/ui/Select";
import Switch from "@/components/admin/ui/Switch";
import { inputClass } from "@/components/admin/ui/styles";

import type { CourseFieldsProps } from "./course-form";
import { COURSE_LEVELS } from "./course-utils";

/** Length, level, where it sorts in the list and whether it is published. */
export default function CourseSettingsFields({
  values,
  errors,
  disabled,
  onChange,
}: CourseFieldsProps) {
  // A course saved with a level that is no longer listed keeps it.
  const levels =
    !values.level || COURSE_LEVELS.includes(values.level)
      ? COURSE_LEVELS
      : [values.level, ...COURSE_LEVELS];

  return (
    <FormSection title="Details">
      <Field label="Duration" htmlFor="course-duration">
        <input
          id="course-duration"
          type="text"
          value={values.duration}
          onChange={(event) =>
            onChange("duration", event.target.value)
          }
          placeholder="e.g. 6 Months"
          maxLength={100}
          disabled={disabled}
          className={`${inputClass()} h-11`}
        />
      </Field>

      <Field label="Level" htmlFor="course-level">
        <Select
          id="course-level"
          value={values.level}
          disabled={disabled}
          onChange={(event) => onChange("level", event.target.value)}
        >
          <option value="">Select level</option>

          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Display order"
        htmlFor="course-order"
        hint="Lower numbers come first."
        error={errors.displayOrder}
      >
        <input
          id="course-order"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={values.displayOrder}
          onChange={(event) =>
            onChange("displayOrder", event.target.value)
          }
          disabled={disabled}
          aria-invalid={Boolean(errors.displayOrder)}
          className={`${inputClass(Boolean(errors.displayOrder))} h-11`}
        />
      </Field>

      <Switch
        label="Published"
        description="Turn off to keep the course as a draft."
        checked={values.isPublished}
        onChange={(checked) => onChange("isPublished", checked)}
        disabled={disabled}
      />
    </FormSection>
  );
}
