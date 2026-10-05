import type { CourseCategory } from "@/lib/api/course-categories";

/**
 * What a main category and a sub category have in common. The card, the
 * delete dialog and the helpers below work on this, so both pages share them.
 */
export type CategoryLike = Pick<
  CourseCategory,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "is_active"
  | "display_order"
>;

// =========================================================
// LAYOUT
// =========================================================

/** Shared by the grid and its skeleton so nothing jumps when data lands. */
export const CATEGORIES_GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4";

// =========================================================
// LIST
// =========================================================

/**
 * `display_order` is the contract for the order on screen. The sort is stable,
 * so entries sharing a number keep the order the API sent them in. Never
 * sorts the array it was handed — callers get a copy.
 */
export const sortCategories = <Item extends CategoryLike>(
  items: Item[]
): Item[] =>
  [...items].sort((a, b) => a.display_order - b.display_order);

export const filterCategories = <Item extends CategoryLike>(
  items: Item[],
  search: string
): Item[] => {
  const query = search.trim().toLowerCase();

  if (!query) return items;

  return items.filter((item) =>
    [item.name, item.slug, item.description].some((value) =>
      value?.toLowerCase().includes(query)
    )
  );
};

// =========================================================
// SLUG
// =========================================================

/** Keeps a hand-typed slug to lowercase letters, numbers and single hyphens. */
export const cleanSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
