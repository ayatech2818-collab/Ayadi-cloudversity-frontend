"use client";

import { Camera, Undo2, Upload } from "lucide-react";

import { buttonClass } from "@/components/admin/ui/styles";
import { useFilePicker } from "@/components/admin/ui/useFilePicker";

import AuthorAvatar from "./AuthorAvatar";
import {
  AUTHOR_PHOTO_ACCEPT,
  AUTHOR_PHOTO_LABEL,
} from "./author-utils";

interface AuthorPhotoFieldProps {
  /** Drives the initials shown until a photo is picked. */
  name: string;
  preview: string | null;
  /** Name of the newly picked file, if there is one. */
  fileName?: string;
  /** Label for dropping that file: "Remove", or back to the saved photo. */
  clearLabel: string;
  disabled?: boolean;
  error?: string;
  onSelect: (file: File) => void;
  /** Drops the newly picked file. */
  onClear: () => void;
}

export default function AuthorPhotoField({
  name,
  preview,
  fileName,
  clearLabel,
  disabled = false,
  error,
  onSelect,
  onClear,
}: AuthorPhotoFieldProps) {
  const {
    inputRef,
    dragging,
    dropZoneProps,
    onInputChange,
    openPicker,
  } = useFilePicker(onSelect, disabled);

  return (
    <div
      {...dropZoneProps}
      className={`flex flex-col items-center gap-4 rounded-2xl p-4 ring-1 ring-inset transition-colors sm:flex-row ${
        dragging
          ? "bg-primary/5 ring-2 ring-primary"
          : "bg-page/70 ring-border"
      }`}
    >
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        aria-label="Upload profile photo"
        className="relative shrink-0 cursor-pointer rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary enabled:hover:scale-[1.03] disabled:cursor-not-allowed"
      >
        <AuthorAvatar
          name={name}
          src={preview}
          className="h-20 w-20 text-2xl"
        />

        <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md ring-2 ring-surface">
          <Camera size={13} />
        </span>
      </button>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="text-sm font-semibold text-text">
          Profile photo
        </p>

        <p className="mt-0.5 truncate text-xs text-muted">
          {fileName ??
            `Drag and drop or upload a ${AUTHOR_PHOTO_LABEL} image.`}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className={buttonClass("secondary", "sm")}
          >
            <Upload size={14} className="text-primary" />
            {preview ? "Change photo" : "Upload photo"}
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

        {error && (
          <p
            role="alert"
            className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400"
          >
            {error}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={AUTHOR_PHOTO_ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={onInputChange}
      />
    </div>
  );
}
