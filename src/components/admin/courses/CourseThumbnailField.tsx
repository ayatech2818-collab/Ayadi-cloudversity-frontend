"use client";

import { BookOpen, ImagePlus, Undo2 } from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import FormSection from "@/components/admin/ui/FormSection";
import { buttonClass } from "@/components/admin/ui/styles";
import { useFilePicker } from "@/components/admin/ui/useFilePicker";

import {
  COURSE_THUMBNAIL_ACCEPT,
  COURSE_THUMBNAIL_LABEL,
} from "./course-utils";

interface CourseThumbnailFieldProps {
  preview: string | null;
  /** Name of the newly picked file, if there is one. */
  fileName?: string;
  /** Label for dropping that file: "Remove", or back to the saved thumbnail. */
  clearLabel: string;
  disabled: boolean;
  error?: string;
  onSelect: (file: File) => void;
  /** Drops the newly picked file. */
  onClear: () => void;
}

export default function CourseThumbnailField({
  preview,
  fileName,
  clearLabel,
  disabled,
  error,
  onSelect,
  onClear,
}: CourseThumbnailFieldProps) {
  const {
    inputRef,
    dragging,
    dropZoneProps,
    onInputChange,
    openPicker,
  } = useFilePicker(onSelect, disabled);

  return (
    <FormSection title="Thumbnail">
      <div>
        {/* Preview — click or drop a file on it */}
        <button
          type="button"
          {...dropZoneProps}
          onClick={openPicker}
          disabled={disabled}
          aria-label="Upload course thumbnail"
          className={`block aspect-video w-full cursor-pointer overflow-hidden rounded-xl ring-1 transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed ${
            dragging
              ? "ring-2 ring-primary"
              : "ring-border hover:ring-primary/50"
          }`}
        >
          <CoverImage src={preview} icon={BookOpen} />
        </button>

        <p className="mt-2 truncate text-[11px] text-muted">
          {fileName ??
            `${COURSE_THUMBNAIL_LABEL}. Drag and drop works too.`}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
          >
            {error}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className={buttonClass("secondary", "sm")}
          >
            <ImagePlus size={14} className="text-primary" />
            {preview ? "Change thumbnail" : "Upload thumbnail"}
          </button>

          {fileName && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className={buttonClass("secondary", "sm")}
            >
              <Undo2 size={14} className="text-muted" />
              {clearLabel}
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={COURSE_THUMBNAIL_ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={onInputChange}
      />
    </FormSection>
  );
}
