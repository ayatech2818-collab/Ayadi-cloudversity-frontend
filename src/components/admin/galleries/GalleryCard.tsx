"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  Images,
  Layers,
  Pencil,
  Trash2,
} from "lucide-react";

import CoverImage from "@/components/admin/ui/CoverImage";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import {
  buttonClass,
  iconButtonClass,
} from "@/components/admin/ui/styles";
import type { Gallery } from "@/lib/api/galleries";

import GalleryThumb from "./GalleryThumb";
import {
  countMedia,
  describeMedia,
  formatEventDate,
  resolveGalleryCover,
  sortByDisplayOrder,
} from "./gallery-utils";

interface GalleryCardProps {
  gallery: Gallery;
  onEdit: () => void;
  onManageMedia: () => void;
  onDelete: () => void;
}

/**
 * Built to work two-across on a phone: the padding, type and action labels
 * step up from `sm`, and the thumbnail strip only shows from there.
 */
export default function GalleryCard({
  gallery,
  onEdit,
  onManageMedia,
  onDelete,
}: GalleryCardProps) {
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

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)]">
      {/* Cover — opens the media manager */}
      <button
        type="button"
        onClick={onManageMedia}
        aria-label={`Manage media in ${gallery.title}`}
        className="relative block aspect-[16/10] w-full cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
      >
        <CoverImage
          src={cover?.url}
          alt={cover?.alt}
          icon={Images}
          imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-accent-strong/45 via-transparent to-accent-strong/20"
        />

        <span className="absolute left-2.5 top-2.5 sm:left-3.5 sm:top-3.5">
          <StatusBadge published={gallery.is_published} />
        </span>

        {/* Media count */}
        <span className="absolute inset-x-2.5 bottom-2.5 flex sm:inset-x-3.5 sm:bottom-3.5">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-accent-strong/75 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-inset ring-white/15">
            <Images size={12} className="shrink-0" />
            <span className="truncate">{describeMedia(counts)}</span>
          </span>
        </span>
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <h2
          title={gallery.title}
          className="line-clamp-2 text-sm font-bold leading-snug tracking-[-0.01em] text-accent sm:text-base"
        >
          {gallery.title}
        </h2>

        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted sm:text-xs">
          <CalendarDays size={13} className="shrink-0" />
          {formatEventDate(gallery.event_date) ?? "No event date"}
        </p>

        <p
          title={gallery.description ?? undefined}
          className="mb-3 mt-2 line-clamp-2 text-xs leading-relaxed text-muted sm:text-[13px]"
        >
          {gallery.description || "No description provided."}
        </p>

        {/* Media strip */}
        <div className="mt-auto hidden items-center gap-1.5 sm:flex">
          {strip.length > 0 ? (
            <>
              {strip.map((item) => (
                <GalleryThumb key={item.id} item={item} />
              ))}

              {overflow > 0 && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-page text-[11px] font-semibold text-muted ring-1 ring-border">
                  +{overflow}
                </span>
              )}
            </>
          ) : (
            <span className="truncate font-mono text-[11px] font-medium text-muted">
              /{gallery.slug}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 sm:mt-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onManageMedia}
              aria-label={`Manage media in ${gallery.title}`}
              className={buttonClass("secondary", "sm")}
            >
              <Layers size={13} className="text-primary" />
              <span className="hidden sm:inline">Media</span>
            </button>

            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${gallery.title}`}
              title="Edit details"
              className={iconButtonClass()}
            >
              <Pencil size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${gallery.title}`}
            title="Delete"
            className={iconButtonClass(true)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
