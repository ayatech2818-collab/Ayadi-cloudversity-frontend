import type { Gallery, GalleryItem } from "@/lib/api/galleries";

// =========================================================
// LAYOUT
// =========================================================

/** Shared by the grid and its skeleton so nothing jumps when data lands. */
export const GALLERIES_GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4";

/** The media grid inside the manager, and its skeleton. */
export const MEDIA_GRID =
  "grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4";

// =========================================================
// FILTERS
// =========================================================

export type GalleryStatusFilter = "All" | "published" | "draft";

export const GALLERY_STATUS_FILTERS: {
  value: GalleryStatusFilter;
  label: string;
}[] = [
  { value: "All", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

// =========================================================
// MEDIA FILES
// =========================================================

export const GALLERY_MEDIA_ACCEPT = "image/*,video/*";

export const isGalleryMedia = (file: File): boolean =>
  /^(image|video)\//.test(file.type);

// =========================================================
// COVER IMAGE
// =========================================================

/** The gallery cover is a still image — video files are rejected. */
export const GALLERY_COVER_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const GALLERY_COVER_ACCEPT =
  GALLERY_COVER_MIME_TYPES.join(",");

export const GALLERY_COVER_LABEL = "JPEG, PNG or WebP";

export const isAllowedCoverFile = (file: File): boolean =>
  (GALLERY_COVER_MIME_TYPES as readonly string[]).includes(
    file.type
  );

export interface GalleryCover {
  url: string;
  alt: string;
  /** Where the thumbnail came from, so callers can tell a real cover apart. */
  source: "cover" | "item";
  /** Set only when the cover is standing in for a gallery item. */
  itemId?: string;
}

/**
 * Resolves what a gallery card should show, in priority order:
 *
 *   1. the gallery cover image, once the backend returns one
 *   2. the first IMAGE item by display_order — never a video, which has no
 *      still frame to show
 *   3. nothing, so the caller renders its placeholder
 *
 * If the backend lands on `cover_item_id` instead of a URL, this function is
 * the only place that has to change.
 */
export const resolveGalleryCover = (
  gallery: Gallery
): GalleryCover | null => {
  if (gallery.cover_image_url) {
    return {
      url: gallery.cover_image_url,
      alt: gallery.title,
      source: "cover",
    };
  }

  const firstImage = sortByDisplayOrder(
    gallery.items ?? []
  ).find((item) => item.media_type === "image");

  if (firstImage) {
    return {
      url: firstImage.file_url,
      alt: firstImage.alt_text || gallery.title,
      source: "item",
      itemId: firstImage.id,
    };
  }

  return null;
};

/**
 * Never sorts the array the API handed us — every consumer gets a copy.
 * `display_order` is the contract for cover selection and grid order.
 */
export const sortByDisplayOrder = (
  items: GalleryItem[]
): GalleryItem[] =>
  [...items].sort(
    (a, b) =>
      a.display_order - b.display_order ||
      a.created_at.localeCompare(b.created_at)
  );

export interface MediaCounts {
  total: number;
  images: number;
  videos: number;
}

export const countMedia = (
  items: GalleryItem[]
): MediaCounts => {
  const images = items.filter(
    (item) => item.media_type === "image"
  ).length;

  return {
    total: items.length,
    images,
    videos: items.length - images,
  };
};

export const describeMedia = (
  counts: MediaCounts
): string => {
  if (counts.total === 0) {
    return "No media";
  }

  const parts: string[] = [];

  if (counts.images > 0) {
    parts.push(
      `${counts.images} ${counts.images === 1 ? "photo" : "photos"}`
    );
  }

  if (counts.videos > 0) {
    parts.push(
      `${counts.videos} ${counts.videos === 1 ? "video" : "videos"}`
    );
  }

  return parts.join(" · ");
};

/**
 * `event_date` arrives as a bare `YYYY-MM-DD`. Handing that to `new Date()`
 * parses it as UTC midnight, which renders as the previous day west of
 * Greenwich — so the parts are split and fed to a local-time constructor.
 */
export const formatEventDate = (
  value: string | null | undefined
): string | null => {
  if (!value) return null;

  const [year, month, day] = value
    .slice(0, 10)
    .split("-")
    .map(Number);

  if (!year || !month || !day) return value;

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatFileSize = (
  bytes: number | null
): string | null => {
  if (bytes === null || bytes <= 0) return null;

  const units = ["B", "KB", "MB", "GB"];

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};
