"use client";

import { useRef, useState } from "react";
import { CloudUpload, LoaderCircle } from "lucide-react";

import { buttonClass } from "@/components/admin/ui/styles";

import { GALLERY_MEDIA_ACCEPT } from "./gallery-utils";

interface GalleryUploadZoneProps {
  uploading: boolean;
  progress: { done: number; total: number };
  /** Locks the zone while an upload or another change is in flight. */
  disabled: boolean;
  onUpload: (files: File[]) => void;
}

/** Drop target and file picker for several photos or videos at once. */
export default function GalleryUploadZone({
  uploading,
  progress,
  disabled,
  onUpload,
}: GalleryUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const percent =
    progress.total === 0 ? 0 : (progress.done / progress.total) * 100;

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();

        if (!disabled) setDragging(true);
      }}
      onDragLeave={(event) => {
        // Moving across a child fires this too; only react to a real exit.
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null
          )
        ) {
          setDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);

        if (!disabled && event.dataTransfer.files.length > 0) {
          onUpload(Array.from(event.dataTransfer.files));
        }
      }}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-6 py-8 text-center transition-colors ${
        dragging ? "bg-primary/5 ring-2 ring-primary" : "bg-surface"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand-start/30">
        {uploading ? (
          <LoaderCircle size={20} className="animate-spin" />
        ) : (
          <CloudUpload size={20} />
        )}
      </span>

      {uploading ? (
        <>
          <p className="text-sm font-semibold text-text">
            Uploading {progress.done} of {progress.total}
          </p>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.done}
            className="mt-1 h-1.5 w-56 max-w-full overflow-hidden rounded-full bg-border"
          >
            <div
              className="h-full rounded-full bg-brand-gradient transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-text">
            Drop photos or videos here
          </p>

          <p className="text-xs text-muted">
            Images and videos, several at a time.
          </p>

          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className={`mt-2 ${buttonClass("primary")}`}
          >
            <CloudUpload size={15} />
            Select files
          </button>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={GALLERY_MEDIA_ACCEPT}
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            onUpload(Array.from(event.target.files));
          }

          event.target.value = "";
        }}
      />
    </div>
  );
}
