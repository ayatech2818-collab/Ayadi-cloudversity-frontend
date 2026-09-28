"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ImageOff,
  Images,
  Layers,
  MoreHorizontal,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";

import type { Gallery, GalleryItem } from "@/lib/api/galleries";

import {
  countMedia,
  describeMedia,
  formatEventDate,
  resolveGalleryCover,
  sortByDisplayOrder,
} from "./gallery-utils";

interface GalleryCardProps {
  gallery: Gallery;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onEdit: () => void;
  onManageMedia: () => void;
  onDelete: () => void;
}

/**
 * S3 objects can 403 or vanish behind the back of the dashboard, so every tile
 * keeps its own broken flag and falls back to a placeholder instead of an
 * empty box.
 */
function MediaThumb({
  item,
  className,
}: {
  item: GalleryItem;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className={`flex items-center justify-center bg-page text-muted ${className ?? ""}`}
      >
        <ImageOff size={14} className="opacity-50" />
      </div>
    );
  }

  if (item.media_type === "video") {
    return (
      <div
        className={`relative bg-slate-900 ${className ?? ""}`}
      >
        <video
          src={item.file_url}
          muted
          playsInline
          preload="metadata"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />

        <span className="absolute inset-0 flex items-center justify-center">
          <Play
            size={12}
            className="fill-white text-white drop-shadow"
          />
        </span>
      </div>
    );
  }

  return (
    <img
      src={item.file_url}
      alt={item.alt_text || item.file_name}
      loading="lazy"
      onError={() => setBroken(true)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}

export default function GalleryCard({
  gallery,
  isMenuOpen,
  onMenuToggle,
  onEdit,
  onManageMedia,
  onDelete,
}: GalleryCardProps) {
  const [coverBroken, setCoverBroken] = useState(false);

  const items = useMemo(
    () => sortByDisplayOrder(gallery.items ?? []),
    [gallery.items]
  );

  const counts = useMemo(() => countMedia(items), [items]);

  const cover = useMemo(
    () => resolveGalleryCover(gallery),
    [gallery]
  );

  // Whatever is on the cover is not repeated in the strip below it.
  const remaining = useMemo(
    () =>
      cover?.itemId
        ? items.filter((item) => item.id !== cover.itemId)
        : items,
    [items, cover]
  );

  const strip = remaining.slice(0, 3);
  const overflow = Math.max(0, remaining.length - 3);

  // A new cover URL deserves a fresh attempt, even if the last one 404'd.
  const coverUrl = cover?.url ?? null;
  const [syncedCoverUrl, setSyncedCoverUrl] = useState<
    string | null
  >(coverUrl);

  if (syncedCoverUrl !== coverUrl) {
    setSyncedCoverUrl(coverUrl);
    setCoverBroken(false);
  }

  const eventDate = formatEventDate(gallery.event_date);

  return (
    <article
      className="
        group relative flex flex-col overflow-hidden
        rounded-2xl border border-border bg-surface
        shadow-[0_2px_8px_rgba(15,23,42,0.03)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-border/80
        hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]
      "
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-page">
        {cover && !coverBroken ? (
          <img
            src={cover.url}
            alt={cover.alt}
            loading="lazy"
            onError={() => setCoverBroken(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-hero-ambient text-muted">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface/80 text-primary">
              {coverBroken ? (
                <ImageOff size={18} />
              ) : (
                <Images size={18} />
              )}
            </span>

            <p className="text-[11px] font-medium">
              {coverBroken
                ? "Cover unavailable"
                : counts.total > 0
                  ? "No cover image"
                  : "No media yet"}
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15 opacity-70" />

        {/* Status */}
        <div className="absolute left-3.5 top-3.5 z-10">
          <span
            className={`
              inline-flex items-center gap-1.5
              rounded-full border px-2.5 py-1
              text-[11px] font-semibold tracking-wide
              shadow-sm backdrop-blur-md
              ${
                gallery.is_published
                  ? "border-emerald-300/30 bg-emerald-600/90 text-white"
                  : "border-white/20 bg-slate-900/65 text-slate-100"
              }
            `}
          >
            <span
              className={`
                h-1.5 w-1.5 rounded-full
                ${gallery.is_published ? "bg-white" : "bg-amber-400"}
              `}
            />

            {gallery.is_published ? "Published" : "Draft"}
          </span>
        </div>

        {/* Menu */}
        <div className="absolute right-3.5 top-3.5 z-20">
          <button
            type="button"
            aria-label="Gallery options"
            onClick={(event) => {
              event.stopPropagation();
              onMenuToggle();
            }}
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg border border-white/25
              bg-black/35 text-white shadow-sm
              backdrop-blur-md transition-all
              hover:bg-black/60 active:scale-95
            "
          >
            <MoreHorizontal size={16} strokeWidth={2.2} />
          </button>

          {isMenuOpen && (
            <div
              className="
                absolute right-0 top-10 z-30 w-44
                overflow-hidden rounded-xl
                border border-border bg-surface p-1
                shadow-[0_12px_30px_rgba(15,23,42,0.12)]
              "
            >
              <button
                type="button"
                onClick={onManageMedia}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-text hover:bg-page"
              >
                <Layers size={14} className="text-muted" />
                Manage media
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-text hover:bg-page"
              >
                <Pencil size={14} className="text-muted" />
                Edit details
              </button>

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onClick={onDelete}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <Trash2 size={14} className="text-rose-500" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Media count */}
        <div className="absolute bottom-3.5 left-3.5 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <Images size={12} />
            {describeMedia(counts)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h2
          title={gallery.title}
          className="
            line-clamp-2 min-h-[44px]
            text-[16px] font-semibold leading-snug
            tracking-[-0.01em] text-text
            transition-colors group-hover:text-primary
          "
        >
          {gallery.title}
        </h2>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
          <CalendarDays size={13} />
          {eventDate ?? "No event date"}
        </p>

        <p
          title={gallery.description ?? undefined}
          className="mt-2.5 line-clamp-2 min-h-[36px] text-[13px] leading-relaxed text-muted"
        >
          {gallery.description || "No description provided."}
        </p>

        {/* Media strip */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/80 pt-4">
          {strip.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {strip.map((item) => (
                <MediaThumb
                  key={item.id}
                  item={item}
                  className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border"
                />
              ))}

              {overflow > 0 && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-page text-[11px] font-semibold text-muted">
                  +{overflow}
                </span>
              )}
            </div>
          ) : (
            <span className="truncate font-mono text-[11px] font-medium text-muted">
              /{gallery.slug}
            </span>
          )}

          <button
            type="button"
            onClick={onManageMedia}
            className="
              inline-flex shrink-0 items-center gap-1.5
              rounded-xl border border-border bg-surface
              px-3 py-2 text-[11px] font-semibold text-text
              transition-colors hover:border-primary/40 hover:bg-page
            "
          >
            <Layers size={13} className="text-primary" />
            Media
          </button>
        </div>
      </div>
    </article>
  );
}
