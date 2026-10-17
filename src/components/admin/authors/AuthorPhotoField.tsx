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
      className={`flex flex-col items-center gap-3 rounded-xl p-3 ring-1 ring-inset transition-colors min-[360px]:gap-3.5 min-[360px]:rounded-2xl min-[360px]:p-3.5 sm:flex-row sm:gap-4 sm:p-4 ${
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
          className="h-14 w-14 text-lg min-[360px]:h-16 min-[360px]:w-16 min-[360px]:text-xl sm:h-20 sm:w-20 sm:text-2xl"
        />

        <span className="absolute -bottom-0.5 -right-0.5 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md ring-2 ring-surface min-[360px]:h-6 min-[360px]:w-6 sm:h-7 sm:w-7">
          <Camera className="h-2.5 w-2.5 min-[360px]:h-3 min-[360px]:w-3 sm:h-[13px] sm:w-[13px]" />
        </span>
      </button>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="text-xs font-semibold text-text min-[360px]:text-sm">
          Profile photo
        </p>

        <p className="mt-0.5 truncate text-[10px] text-muted min-[360px]:text-xs">
          {fileName ??
            `Drag and drop or upload a ${AUTHOR_PHOTO_LABEL} image.`}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 min-[360px]:mt-2.5 sm:mt-3 sm:justify-start sm:gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className={`${buttonClass("secondary", "sm")} h-7.5 px-2.5 text-[11px] min-[360px]:h-8 min-[360px]:px-3 min-[360px]:text-xs sm:h-9 sm:px-3 sm:text-xs`}
          >
            <Upload className="h-3 w-3 text-primary min-[360px]:h-3.5 min-[360px]:w-3.5 sm:h-[14px] sm:w-[14px]" />
            {preview ? "Change photo" : "Upload photo"}
          </button>

          {fileName && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className={`${buttonClass("secondary", "sm")} h-7.5 px-2.5 text-[11px] min-[360px]:h-8 min-[360px]:px-3 min-[360px]:text-xs sm:h-9 sm:px-3 sm:text-xs`}
            >
              <Undo2 className="h-3 w-3 text-muted min-[360px]:h-3.5 min-[360px]:w-3.5 sm:h-[14px] sm:w-[14px]" />
              {clearLabel}
            </button>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-1.5 text-[11px] font-medium text-rose-600 min-[360px]:text-xs dark:text-rose-400"
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
