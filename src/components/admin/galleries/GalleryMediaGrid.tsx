"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImageOff,
  Loader2,
  Play,
  Repeat2,
  Trash2,
} from "lucide-react";

import type { GalleryItem } from "@/lib/api/galleries";

import { formatFileSize } from "./gallery-utils";

interface GalleryMediaGridProps {
  items: GalleryItem[];
  /** The single item currently being mutated, if any. */
  busyItemId: string | null;
  /** Locks the whole grid while an upload or reorder is in flight. */
  disabled: boolean;
  onMove: (item: GalleryItem, direction: -1 | 1) => void;
  onAltTextSave: (
    item: GalleryItem,
    altText: string
  ) => void;
  onReplace: (item: GalleryItem, file: File) => void;
  onDelete: (item: GalleryItem) => void;
}

interface MediaTileProps {
  item: GalleryItem;
  index: number;
  total: number;
  busy: boolean;
  disabled: boolean;
  onMove: (item: GalleryItem, direction: -1 | 1) => void;
  onAltTextSave: (
    item: GalleryItem,
    altText: string
  ) => void;
  onReplace: (item: GalleryItem, file: File) => void;
  onDelete: (item: GalleryItem) => void;
}

function MediaTile({
  item,
  index,
  total,
  busy,
  disabled,
  onMove,
  onAltTextSave,
  onReplace,
  onDelete,
}: MediaTileProps) {
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
    <li
      className="
        group relative flex flex-col overflow-hidden
        rounded-xl border border-border bg-surface
        shadow-[0_1px_4px_rgba(15,23,42,0.03)]
      "
    >
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
          <div className="relative h-full w-full bg-slate-900">
            <video
              src={item.file_url}
              muted
              playsInline
              controls
              preload="metadata"
              onError={() => setBroken(true)}
              className="h-full w-full object-contain"
            />

            <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <Play size={9} className="fill-white" />
              Video
            </span>
          </div>
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
        <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-md border border-white/20 bg-black/55 px-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
          {index + 1}
        </span>

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/70 backdrop-blur-[1px]">
            <Loader2
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

          <p className="mt-0.5 text-[10px] text-muted">
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
            onChange={(event) =>
              setAltDraft(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && altDirty) {
                event.preventDefault();
                onAltTextSave(item, altDraft.trim());
              }
            }}
            className="
              h-8 w-full rounded-lg border border-border bg-page/50
              px-2.5 text-[11px] text-text outline-none transition-all
              placeholder:text-muted/60
              focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10
              disabled:opacity-50
            "
          />

          {altDirty && (
            <button
              type="button"
              disabled={disabled}
              aria-label="Save alt text"
              onClick={() =>
                onAltTextSave(item, altDraft.trim())
              }
              className="
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-lg bg-primary text-white
                transition-colors hover:bg-primary-hover
                disabled:opacity-50
              "
            >
              <Check size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-border/70 pt-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Move earlier"
              title="Move earlier"
              disabled={disabled || index === 0}
              onClick={() => onMove(item, -1)}
              className="
                flex h-7 w-7 items-center justify-center
                rounded-lg border border-border text-muted
                transition-colors hover:bg-page hover:text-text
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              <ArrowLeft size={13} />
            </button>

            <button
              type="button"
              aria-label="Move later"
              title="Move later"
              disabled={disabled || index === total - 1}
              onClick={() => onMove(item, 1)}
              className="
                flex h-7 w-7 items-center justify-center
                rounded-lg border border-border text-muted
                transition-colors hover:bg-page hover:text-text
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  onReplace(item, file);
                }

                event.target.value = "";
              }}
            />

            <button
              type="button"
              aria-label="Replace media"
              title="Replace"
              disabled={disabled}
              onClick={() =>
                replaceInputRef.current?.click()
              }
              className="
                flex h-7 w-7 items-center justify-center
                rounded-lg border border-border text-muted
                transition-colors hover:bg-page hover:text-text
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              <Repeat2 size={13} />
            </button>

            <button
              type="button"
              aria-label="Delete media"
              title="Delete"
              disabled={disabled}
              onClick={() => onDelete(item)}
              className="
                flex h-7 w-7 items-center justify-center
                rounded-lg border border-border text-rose-600
                transition-colors hover:border-rose-200 hover:bg-rose-50
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function GalleryMediaGrid({
  items,
  busyItemId,
  disabled,
  onMove,
  onAltTextSave,
  onReplace,
  onDelete,
}: GalleryMediaGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, index) => (
        <MediaTile
          key={item.id}
          item={item}
          index={index}
          total={items.length}
          busy={busyItemId === item.id}
          /* One mutation at a time keeps display_order deterministic. */
          disabled={disabled}
          onMove={onMove}
          onAltTextSave={onAltTextSave}
          onReplace={onReplace}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
