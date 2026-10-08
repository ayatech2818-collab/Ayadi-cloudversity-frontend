"use client";

import { FileText, ImagePlus, Undo2 } from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import Field from "@/components/admin/ui/Field";
import FormSection from "@/components/admin/ui/FormSection";
import {
  buttonClass,
  inputClass,
} from "@/components/admin/ui/styles";
import { useFilePicker } from "@/components/admin/ui/useFilePicker";

import {
  BLOG_COVER_ACCEPT,
  BLOG_COVER_LABEL,
} from "./blog-utils";

interface BlogCoverFieldProps {
  preview: string | null;
  /** Name of the newly picked file, if there is one. */
  fileName?: string;
  /** Label for dropping that file: "Remove", or back to the saved cover. */
  clearLabel: string;
  alt: string;
  disabled: boolean;
  error?: string;
  onSelect: (file: File) => void;
  /** Drops the newly picked file. */
  onClear: () => void;
  onAltChange: (value: string) => void;
}

export default function BlogCoverField({
  preview,
  fileName,
  clearLabel,
  alt,
  disabled,
  error,
  onSelect,
  onClear,
  onAltChange,
}: BlogCoverFieldProps) {
  const {
    inputRef,
    dragging,
    dropZoneProps,
    onInputChange,
    openPicker,
  } = useFilePicker(onSelect, disabled);

  return (
    <FormSection title="Cover image">
      <div>
        {/* Preview — click or drop a file on it */}
        <button
          type="button"
          {...dropZoneProps}
          onClick={openPicker}
          disabled={disabled}
          aria-label="Upload cover image"
          className={`block aspect-video w-full cursor-pointer overflow-hidden rounded-xl ring-1 transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed ${
            dragging
              ? "ring-2 ring-primary"
              : "ring-border hover:ring-primary/50"
          }`}
        >
          <CoverImage src={preview} icon={FileText} />
        </button>

        <p className="mt-2 truncate text-[11px] text-muted">
          {fileName ??
            `${BLOG_COVER_LABEL}. Drag and drop works too.`}
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
            {preview ? "Change cover" : "Upload cover"}
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

      <Field
        label="Alt text"
        htmlFor="blog-cover-alt"
        hint="Describes the image for screen readers and search engines."
      >
        <input
          id="blog-cover-alt"
          type="text"
          value={alt}
          onChange={(event) => onAltChange(event.target.value)}
          placeholder="e.g. Students around a laptop in a classroom"
          disabled={disabled}
          className={`${inputClass()} h-11`}
        />
      </Field>

      <input
        ref={inputRef}
        type="file"
        accept={BLOG_COVER_ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={onInputChange}
      />
    </FormSection>
  );
}
