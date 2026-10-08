"use client";

import { ImagePlus, Images, Info, Trash2 } from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import FormSection from "@/components/admin/ui/FormSection";
import { buttonClass } from "@/components/admin/ui/styles";
import { useFilePicker } from "@/components/admin/ui/useFilePicker";

import {
  GALLERY_COVER_ACCEPT,
  GALLERY_COVER_LABEL,
} from "./gallery-utils";

interface GalleryCoverFieldProps {
  preview: string | null;
  /** Name of the newly picked file, if there is one. */
  fileName?: string;
  disabled: boolean;
  error?: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

export default function GalleryCoverField({
  preview,
  fileName,
  disabled,
  error,
  onSelect,
  onRemove,
}: GalleryCoverFieldProps) {
  const {
    inputRef,
    dragging,
    dropZoneProps,
    onInputChange,
    openPicker,
  } = useFilePicker(onSelect, disabled);

  return (
    <FormSection title="Gallery cover" aside="Optional">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Preview — click or drop a file on it */}
        <button
          type="button"
          {...dropZoneProps}
          onClick={openPicker}
          disabled={disabled}
          aria-label="Select cover image"
          className={`block aspect-[16/10] w-full shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed sm:w-52 ${
            dragging
              ? "ring-2 ring-primary"
              : "ring-border hover:ring-primary/50"
          }`}
        >
          <CoverImage src={preview} icon={Images} />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text">
              Card thumbnail
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Shown on the gallery card. {GALLERY_COVER_LABEL}.
              Leave it empty to fall back to the first photo in
              the gallery.
            </p>

            {fileName && (
              <p
                title={fileName}
                className="mt-2 truncate rounded-lg bg-page px-2.5 py-1.5 text-[11px] font-medium text-text ring-1 ring-inset ring-border"
              >
                {fileName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              className={buttonClass("secondary", "sm")}
            >
              <ImagePlus size={14} className="text-primary" />
              {preview ? "Replace image" : "Select image"}
            </button>

            {preview && (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className={buttonClass("secondary", "sm")}
              >
                <Trash2 size={14} className="text-rose-500" />
                Remove
              </button>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {error}
            </p>
          )}

          {/*
            Honest about the current state of the world: the picked file
            lives in this modal only until the backend can store it.
          */}
          {fileName && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/30">
              <Info size={13} className="mt-0.5 shrink-0" />

              <p className="text-[11px] font-medium leading-relaxed">
                Preview only — gallery covers are not stored yet,
                so this image is discarded when the modal closes.
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={GALLERY_COVER_ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={onInputChange}
      />
    </FormSection>
  );
}
