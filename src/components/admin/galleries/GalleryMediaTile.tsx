"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImageOff,
  LoaderCircle,
  Play,
  Repeat2,
  Trash2,
} from "lucide-react";

import { iconButtonClass } from "@/components/admin/ui/styles";
import type { GalleryItem } from "@/lib/api/galleries";

import {
  GALLERY_MEDIA_ACCEPT,
  formatFileSize,
} from "./gallery-utils";

export interface GalleryMediaActions {
  onMove: (item: GalleryItem, direction: -1 | 1) => void;
  onAltTextSave: (item: GalleryItem, altText: string) => void;
  onReplace: (item: GalleryItem, file: File) => void;
  onDelete: (item: GalleryItem) => void;
}

interface GalleryMediaTileProps extends GalleryMediaActions {
  item: GalleryItem;
  index: number;
  total: number;
  /** True while this tile's own change is in flight. */
  busy: boolean;
  /** Locks the tile while any upload or change is in flight. */
  disabled: boolean;
}

/** One photo or video in the manager: preview, alt text and its actions. */
export default function GalleryMediaTile({
  item,
  index,
  total,
  busy,
  disabled,
  onMove,
  onAltTextSave,
  onReplace,
  onDelete,
}: GalleryMediaTileProps) {
  const serverAlt = item.alt_text ?? "";

  const [broken, setBroken] = useState(false);
  const [altDraft, setAltDraft] = useState(serverAlt);
  const [syncedAlt, setSyncedAlt] = useState(serverAlt);

  const replaceInputRef = useRef<HTMLInputElement>(null);

  // A successful save returns a fresh item, so the draft follows the server.
  if (syncedAlt !== serverAlt) {
    setSyncedAlt(serverAlt);
    setAltDraft(serverAlt);
  }

  const altDirty = altDraft.trim() !== serverAlt;

  const size = formatFileSize(item.file_size);

  return (
    <li className="relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_1px_4px_rgba(15,23,42,0.04)] ring-1 ring-border">
      {/* Preview */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-page">
        {broken ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted">
            <ImageOff size={18} className="opacity-50" />

            <span className="text-[10px] font-medium">
              Preview unavailable
            </span>
          </div>
        ) : item.media_type === "video" ? (
          <>
            <video
              src={item.file_url}
              muted
              playsInline
              controls
              preload="metadata"
              onError={() => setBroken(true)}
              className="h-full w-full bg-accent-strong object-contain"
            />

            <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-md bg-accent-strong/75 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              <Play size={9} className="fill-white" />
              Video
            </span>
          </>
        ) : (
          <img
            src={item.file_url}
            alt={item.alt_text || item.file_name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        )}

        {/* Order badge */}
        <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-md bg-brand-gradient px-1.5 text-[10px] font-bold text-white shadow-sm">
          {index + 1}
        </span>

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70">
            <LoaderCircle
              size={20}
              className="animate-spin text-primary"
            />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div>
          <p
            title={item.file_name}
            className="truncate text-[11px] font-semibold text-text"
          >
            {item.file_name}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-muted">
            {item.mime_type || item.media_type}
            {size ? ` · ${size}` : ""}
          </p>
        </div>

        {/* Alt text */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={altDraft}
            disabled={disabled}
            aria-label={`Alt text for ${item.file_name}`}
            placeholder="Alt text"
            onChange={(event) => setAltDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && altDirty) {
                event.preventDefault();
                onAltTextSave(item, altDraft.trim());
              }
            }}
            className="h-8 w-full rounded-lg bg-page/60 px-2.5 text-[11px] text-text outline-none ring-1 ring-inset ring-border transition-shadow placeholder:text-muted/60 focus:bg-surface focus:ring-2 focus:ring-primary disabled:opacity-50"
          />

          {altDirty && (
            <button
              type="button"
              disabled={disabled}
              aria-label="Save alt text"
              title="Save alt text"
              onClick={() => onAltTextSave(item, altDraft.trim())}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-brand-gradient text-white shadow-sm transition-[filter] enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Move earlier"
              title="Move earlier"
              disabled={disabled || index === 0}
              onClick={() => onMove(item, -1)}
              className={iconButtonClass(false, true)}
            >
              <ArrowLeft size={13} />
            </button>

            <button
              type="button"
              aria-label="Move later"
              title="Move later"
              disabled={disabled || index === total - 1}
              onClick={() => onMove(item, 1)}
              className={iconButtonClass(false, true)}
            >
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <input
              ref={replaceInputRef}
              type="file"
              accept={GALLERY_MEDIA_ACCEPT}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) onReplace(item, file);

                event.target.value = "";
              }}
            />

            <button
              type="button"
              aria-label="Replace media"
              title="Replace"
              disabled={disabled}
              onClick={() => replaceInputRef.current?.click()}
              className={iconButtonClass(false, true)}
            >
              <Repeat2 size={13} />
            </button>

            <button
              type="button"
              aria-label="Delete media"
              title="Delete"
              disabled={disabled}
              onClick={() => onDelete(item)}
              className={iconButtonClass(true, true)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
