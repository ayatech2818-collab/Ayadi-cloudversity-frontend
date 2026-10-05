// =========================================================
// LAYOUT
// =========================================================

/** Shared by the grid and its skeleton so nothing jumps when data lands. */
export const BLOGS_GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4";

// =========================================================
// FILTERS
// =========================================================

export const BLOG_CATEGORIES = [
  "Technology",
  "Education",
  "AI",
  "Career",
  "Learning",
  "Cloud & DevOps",
  "Industry Insights",
  "Student Stories",
];

export type BlogStatusFilter = "All" | "published" | "draft";

export const BLOG_STATUS_FILTERS: {
  value: BlogStatusFilter;
  label: string;
}[] = [
  { value: "All", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

export type BlogSortOption =
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc";

export const BLOG_SORT_OPTIONS: {
  value: BlogSortOption;
  label: string;
}[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-asc", label: "Title: A to Z" },
  { value: "title-desc", label: "Title: Z to A" },
];

// =========================================================
// COVER IMAGE
// =========================================================

export const BLOG_COVER_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const BLOG_COVER_ACCEPT = BLOG_COVER_MIME_TYPES.join(",");

export const BLOG_COVER_LABEL = "JPG, PNG or WebP";

/** A dropped file skips the picker's `accept`, so it is checked here too. */
export const isAllowedBlogCover = (file: File): boolean =>
  (BLOG_COVER_MIME_TYPES as readonly string[]).includes(file.type);

// =========================================================
// TEXT
// =========================================================

/** About 200 words a minute, and never less than one minute. */
export const estimateReadingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
};

export const formatBlogDate = (value: string): string =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
