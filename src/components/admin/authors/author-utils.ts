import type { Author } from "@/lib/api/authors";

// =========================================================
// LAYOUT
// =========================================================

/** Shared by the grid and its skeleton so nothing jumps when data lands. */
export const AUTHORS_GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4";

// =========================================================
// PROFILE PHOTO
// =========================================================

export const AUTHOR_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const AUTHOR_PHOTO_ACCEPT =
  AUTHOR_PHOTO_MIME_TYPES.join(",");

export const AUTHOR_PHOTO_LABEL = "JPG, PNG or WebP";

/** A dropped file skips the picker's `accept`, so it is checked here too. */
export const isAllowedAuthorPhoto = (file: File): boolean =>
  (AUTHOR_PHOTO_MIME_TYPES as readonly string[]).includes(
    file.type
  );

// =========================================================
// LIST
// =========================================================

/** Never sorts the array it was handed — callers get a copy. */
export const sortAuthors = (authors: Author[]): Author[] =>
  [...authors].sort((a, b) => a.name.localeCompare(b.name));

export const filterAuthors = (
  authors: Author[],
  search: string
): Author[] => {
  const query = search.trim().toLowerCase();

  if (!query) return authors;

  return authors.filter((author) =>
    [author.name, author.designation, author.bio].some((value) =>
      value?.toLowerCase().includes(query)
    )
  );
};

/** "Adil Shinas" → "AS". Empty while the name is still blank. */
export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

// =========================================================
// LINKS
// =========================================================

/** Admins paste "linkedin.com/in/…" as often as the full address. */
export const normalizeUrl = (value: string): string => {
  const url = value.trim();

  if (!url) return "";

  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

export const isValidUrl = (value: string): boolean => {
  try {
    return new URL(value).hostname.includes(".");
  } catch {
    return false;
  }
};
